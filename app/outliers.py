"""
Outliers — find videos and channels in the user's NICHE that over-performed
relative to the niche cohort for a given keyword/topic. Not a generic YouTube
search: results are filtered by inferred intent, niche overlap with the user's
channel, and recency (last 12 months), then scored by how much they beat the
niche-pool median views-per-subscriber.

Credit model: one credit per /outliers/search call (shared across all N results).
"""
import json
import re
import socket
import ssl
import statistics
import time
from datetime import datetime, timedelta, timezone

import httplib2
from googleapiclient.errors import HttpError

from app.utils import make_anthropic_client, build_youtube_client
from app.seo import (
    search_top_videos,
    _filter_by_intent,
    research_keywords,
    get_autocomplete_suggestions,
    _NGRAM_STOP as _SEO_STOP,
)


# ─── Transient-error retry for YouTube API calls ──────────────────────────────
# SSL record layer failures, connection resets, and transient 5xx happen on the
# YouTube Data API often enough to break user-facing searches. Every outbound
# .execute() below is wrapped in this helper.

_TRANSIENT_EXC = (
    ssl.SSLError,
    ConnectionResetError,
    ConnectionError,
    socket.timeout,
    TimeoutError,
    httplib2.HttpLib2Error,
    OSError,
)


def _is_transient_http_error(e: HttpError) -> bool:
    status = getattr(getattr(e, "resp", None), "status", 0) or 0
    return status in (429, 500, 502, 503, 504)


def _execute_with_retry(request, attempts: int = 3, base_delay: float = 0.6):
    """
    Run a googleapiclient request's .execute() with retries on transient SSL /
    network / 5xx errors. Raises the last exception if all attempts fail.
    """
    last_err: Exception | None = None
    for i in range(attempts):
        try:
            return request.execute()
        except HttpError as e:
            if _is_transient_http_error(e) and i < attempts - 1:
                last_err = e
                time.sleep(base_delay * (2 ** i))
                continue
            raise
        except _TRANSIENT_EXC as e:
            last_err = e
            if i < attempts - 1:
                time.sleep(base_delay * (2 ** i))
                continue
            raise
    if last_err:
        raise last_err


# ─── Tunables ─────────────────────────────────────────────────────────────────

_SEARCH_POOL_SIZE   = 40    # YouTube search results requested
_RESULTS_VIDEO      = 12    # Returned to the frontend for video/thumbnail tabs
_RESULTS_CHANNEL    = 10    # Returned for channel tab
_MIN_OUTLIER_SCORE  = 1.8   # Below this, not really an outlier; drop it

# Recency: only results from the last 12 months. Anything older is dropped.
_RECENCY_DAYS = 365

# Niche match: scan this many recent videos per candidate channel and require
# at least this many title-overlap hits with the user's niche keywords.
_NICHE_TITLES_PER_CHANNEL = 15
_NICHE_MIN_HITS           = 1   # at least 1 of 15 recent titles touches the niche

# Niche-relative views floor: a video has to beat a fraction of the niche pool's
# median views to count. Kills dead uploads without imposing an arbitrary number
# on tiny niches.
_VIEWS_FLOOR_FRACTION = 0.05    # 5% of niche median
_VIEWS_FLOOR_HARD_MIN = 200     # absolute floor so 10-view garbage never shows

# Minimum results contract — every /outliers/search MUST return at least this
# many videos. Broadening + floor-drop fallbacks below guarantee we hit it.
_MIN_RESULTS = 8

# Stopwords lifted from app/seo.py, extended with outliers-specific filler
# ("video", "channel") that show up in titles but carry no search intent.
_BROADEN_STOP = set(_SEO_STOP) | {"video", "channel", "episode", "part"}


# ─── Entry point ──────────────────────────────────────────────────────────────

def search_outliers(
    creds,
    query: str,
    my_channel_id: str,
    my_subscribers: int,
    my_niche_keywords: list[str],
    confirmed_keyword: str = "",
) -> dict:
    """
    Single unified search — runs once and returns videos + breakout channels +
    keyword scores in one payload. The three tabs in the UI (Videos / Thumbnails
    / Channels) are just different views of the same result set.

    Pipeline:
      1. YouTube search using the ORIGINAL title the user typed.
      2. Intent-filter via confirmed_keyword.
      3. Drop the user's own channel.
      4. Keep only videos published in the last 12 months.
      5. Niche-match each candidate channel against the user's niche keywords
         (scan recent uploads, same pattern as Competitors feature).
      6. Apply a niche-relative views floor (beats % of niche-pool median).
      7. Score by views-per-sub vs cohort median.
      8. Broaden query / drop outlier floor only if needed to hit _MIN_RESULTS.
    """
    query = (query or "").strip()
    if not query:
        return {"error": "Query cannot be empty."}

    confirmed = (confirmed_keyword or "").strip()
    niche_kw  = [k.strip().lower() for k in (my_niche_keywords or []) if k and k.strip()]

    try:
        return _run_unified_search(
            creds, query, confirmed,
            my_channel_id, my_subscribers, niche_kw,
        )
    except ssl.SSLError as e:
        print(f"[outliers] SSL error after retries: {e}")
        return {"error": "Network hiccup reaching YouTube. Please try again in a moment."}
    except HttpError as e:
        status = getattr(getattr(e, "resp", None), "status", 0) or 0
        print(f"[outliers] YouTube API error {status}: {e}")
        if status in (429, 403):
            return {"error": "YouTube is rate-limiting us right now. Please wait a minute and try again."}
        return {"error": f"YouTube rejected the request ({status}). Please try again."}
    except Exception as e:
        import traceback
        print(f"[outliers] search error: {traceback.format_exc()}")
        return {"error": str(e)}


# ─── Unified search pipeline ──────────────────────────────────────────────────
# One call produces videos + breakout channels + keyword scores. The three UI
# tabs are just different views of the same result set — no separate searches.
#
# Result-count contract: every search MUST return >= _MIN_RESULTS videos. When
# the niche-matched pool is too thin we broaden the YouTube query, and if still
# short we drop the outlier floor so the user always sees something useful.

def _run_unified_search(
    creds,
    title: str,
    confirmed_keyword: str,
    my_channel_id: str,
    my_subscribers: int,
    niche_keywords: list[str],
) -> dict:
    # Step 1–4: fetch + intent filter + own-channel drop + 12-month filter.
    intent_videos, channel_details = _fetch_intent_filtered(
        creds, title, confirmed_keyword, my_channel_id,
    )

    # Step 5: niche matching. Fetch each candidate channel's recent titles
    # once, then keep only channels whose recent content overlaps the niche.
    channel_ids = list(channel_details.keys())
    recent_titles = _fetch_channel_recent_titles(creds, channel_details)
    niche_channels = _niche_match_channels(recent_titles, niche_keywords)
    intent_videos = [v for v in intent_videos if v.get("channel_id") in niche_channels]

    # Step 6–7: enrich, views-floor, score. Helper so broadening can re-run it.
    def _score_from(videos: list[dict]) -> tuple[list[dict], list[dict]]:
        enriched = _enrich(videos, channel_details)
        floored  = _apply_niche_views_floor(enriched)
        return floored, _score_videos(list(floored))

    floored, scored = _score_from(intent_videos)
    above = [s for s in scored if s["outlier_score"] >= _MIN_OUTLIER_SCORE]
    above.sort(key=lambda s: s["outlier_score"], reverse=True)
    top_videos = above[:_RESULTS_VIDEO] if len(above) >= _MIN_RESULTS else []
    cohort_tag = "niche" if top_videos else None

    # Still short? Broaden the YouTube query by stripping stopwords and re-run
    # the full pipeline (intent filter + niche match + floor + score).
    broadened_with = None
    if len(top_videos) < _MIN_RESULTS:
        broader_query = _shorten_title(title)
        if broader_query and broader_query.lower() != title.lower():
            broadened_with = broader_query
            extra_videos, extra_details = _fetch_intent_filtered(
                creds, broader_query, confirmed_keyword, my_channel_id,
            )
            # Merge channel details + recent titles for brand-new channels.
            new_ch_ids = [c for c in extra_details.keys() if c not in channel_details]
            channel_details.update(extra_details)
            if new_ch_ids:
                extra_titles = _fetch_channel_recent_titles(
                    creds, {c: channel_details[c] for c in new_ch_ids},
                )
                recent_titles.update(extra_titles)
                niche_channels |= _niche_match_channels(extra_titles, niche_keywords)

            # Dedupe + merge video lists.
            seen = {v["video_id"] for v in intent_videos}
            for v in extra_videos:
                if v["video_id"] not in seen and v.get("channel_id") in niche_channels:
                    intent_videos.append(v)
                    seen.add(v["video_id"])

            floored, scored = _score_from(intent_videos)
            above = [s for s in scored if s["outlier_score"] >= _MIN_OUTLIER_SCORE]
            above.sort(key=lambda s: s["outlier_score"], reverse=True)
            if len(above) >= _MIN_RESULTS:
                top_videos = above[:_RESULTS_VIDEO]
                cohort_tag = "broadened"

    # Last resort — drop the outlier floor and take the top N by score from the
    # already-niche-matched pool. Guarantees we never show < _MIN_RESULTS
    # unless the niche itself has nothing, in which case we return what we have.
    if len(top_videos) < _MIN_RESULTS and scored:
        scored_sorted = sorted(scored, key=lambda s: s.get("outlier_score", 0), reverse=True)
        top_videos = scored_sorted[:max(_MIN_RESULTS, _RESULTS_VIDEO)]
        cohort_tag = cohort_tag or "best-effort"

    # Primary phrase for the UI eyebrow
    primary_phrase = confirmed_keyword.lower() if confirmed_keyword else title.lower()

    # Keyword extraction on the niche-filtered set.
    search_terms = [confirmed_keyword] if confirmed_keyword else [title]
    top_titles   = [v["title"] for v in intent_videos]
    tag_freq: dict[str, int] = {}
    for v in intent_videos:
        for tag in v.get("tags", []):
            tl = tag.lower().strip()
            if tl and len(tl) > 2:
                tag_freq[tl] = tag_freq.get(tl, 0) + 1
    all_tags_flat  = [t for t, _ in sorted(tag_freq.items(), key=lambda x: -x[1])]
    autocomplete   = get_autocomplete_suggestions(search_terms)
    keyword_scores = research_keywords(search_terms, autocomplete, top_titles, all_tags_flat)

    # Derive breakout channels from whatever scored pool we ended up with
    # (already own-channel-excluded + niche-matched + 12-month filtered).
    top_channels = _derive_breakout_channels(scored, channel_details)

    # Claude explanations (batched — one call each for videos/channels).
    video_explanations = _explain_video_outliers(title, top_videos, my_subscribers) if top_videos else {}
    for r in top_videos:
        r["explanation"] = video_explanations.get(r["video_id"], "")
    channel_explanations = _explain_channel_outliers(title, top_channels, my_subscribers) if top_channels else {}
    for c in top_channels:
        c["explanation"] = channel_explanations.get(c["channel_id"], "")

    cohort_median_vps = statistics.median([s["views_per_sub"] for s in scored]) if scored else 0
    return {
        "videos":              top_videos,
        "channels":            top_channels,
        "keyword_scores":      keyword_scores,
        "autocomplete_terms":  autocomplete[:10],
        "top_tags":            all_tags_flat[:15],
        "intent_matched":      len(intent_videos),
        "primary_phrase":      primary_phrase,
        "cohort": {
            "query":           title,
            "my_subscribers":  my_subscribers,
            "niche_keywords":  niche_keywords,
            "pool_size":       len(scored),
            "median_vps":      round(cohort_median_vps, 3),
            "cohort_tier":     cohort_tag,        # diagnostic for the UI
            "broadened_with":  broadened_with,    # null unless query-broadening kicked in
            "window_days":     _RECENCY_DAYS,
        },
    }


# ─── Fetch + core filters ─────────────────────────────────────────────────────

def _fetch_intent_filtered(
    creds, query: str, confirmed_keyword: str, my_channel_id: str,
) -> tuple[list[dict], dict[str, dict]]:
    """
    One YouTube search pass → intent filter → own-channel drop → 12-month filter
    → channel-detail hydration. Returns the surviving videos plus the channel
    details (incl. uploads playlist IDs) for every unique channel in them.
    """
    raw_videos = search_top_videos(creds, [query], max_results=_SEARCH_POOL_SIZE)
    if not raw_videos:
        return [], {}

    if confirmed_keyword:
        intent_videos = _filter_by_intent(confirmed_keyword, raw_videos)
        if not intent_videos:
            intent_videos = raw_videos[:10]
    else:
        intent_videos = raw_videos

    # Drop user's own channel.
    if my_channel_id:
        intent_videos = [v for v in intent_videos if v.get("channel_id") != my_channel_id]

    # Keep only the last 12 months.
    intent_videos = [v for v in intent_videos if _is_recent(v.get("published_at", ""))]

    channel_ids = list({v["channel_id"] for v in intent_videos if v.get("channel_id")})
    channel_details = _batch_channel_details(creds, channel_ids)
    # Belt-and-braces: even if a channel detail row sneaks in for the user's
    # own id (shouldn't, we already filtered videos above), drop it.
    if my_channel_id and my_channel_id in channel_details:
        channel_details.pop(my_channel_id, None)
    return intent_videos, channel_details


def _is_recent(published_at: str) -> bool:
    """
    Accept "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM:SSZ"; drop anything older than
    _RECENCY_DAYS. Unknown / unparseable dates are dropped — we'd rather lose
    a video than show a 3-year-old outlier that's no longer relevant.
    """
    if not published_at:
        return False
    try:
        if "T" in published_at:
            dt = datetime.strptime(published_at[:10], "%Y-%m-%d")
        else:
            dt = datetime.strptime(published_at[:10], "%Y-%m-%d")
    except Exception:
        return False
    return dt >= (datetime.utcnow() - timedelta(days=_RECENCY_DAYS))


# ─── Niche matching (replaces size-bracket filter) ────────────────────────────

def _fetch_channel_recent_titles(
    creds, channel_details: dict[str, dict],
) -> dict[str, list[str]]:
    """
    For each channel whose details include an uploads playlist, fetch the titles
    of the last _NICHE_TITLES_PER_CHANNEL uploads. One playlistItems.list per
    channel — cost ~N quota units, worth it for niche validation.
    """
    out: dict[str, list[str]] = {}
    if not channel_details:
        return out
    youtube = build_youtube_client(creds)
    for cid, meta in channel_details.items():
        pid = meta.get("uploads_playlist")
        if not pid:
            out[cid] = []
            continue
        try:
            resp = _execute_with_retry(youtube.playlistItems().list(
                part="snippet",
                playlistId=pid,
                maxResults=_NICHE_TITLES_PER_CHANNEL,
            ))
            titles: list[str] = []
            for item in resp.get("items", []):
                t = (item.get("snippet", {}).get("title") or "").strip()
                if t:
                    titles.append(t)
            out[cid] = titles
        except Exception as e:
            print(f"[outliers] recent-titles fetch error for {cid}: {e}")
            out[cid] = []
    return out


def _niche_match_channels(
    recent_titles: dict[str, list[str]],
    niche_keywords: list[str],
) -> set[str]:
    """
    Return the set of channel_ids whose recent titles overlap with any of the
    user's niche keywords. If niche_keywords is empty, pass everything (new
    channels with no derivable niche still get results).
    """
    if not niche_keywords:
        return set(recent_titles.keys())
    patterns = [re.compile(rf"\b{re.escape(k)}\b", re.IGNORECASE) for k in niche_keywords]
    kept: set[str] = set()
    for cid, titles in recent_titles.items():
        if not titles:
            continue
        hits = sum(1 for t in titles if any(p.search(t) for p in patterns))
        if hits >= _NICHE_MIN_HITS:
            kept.add(cid)
    return kept


# ─── Enrichment + views floor ─────────────────────────────────────────────────

def _enrich(intent_videos: list[dict], channel_details: dict[str, dict]) -> list[dict]:
    """Normalise search_top_videos' shape to the outlier-pipeline shape."""
    enriched: list[dict] = []
    for v in intent_videos:
        cid = v.get("channel_id", "")
        ch_meta = channel_details.get(cid, {})
        enriched.append({
            "video_id":            v["video_id"],
            "title":               v.get("title", ""),
            "channel_id":          cid,
            "channel_name":        v.get("channel", ""),
            "channel_thumbnail":   ch_meta.get("thumbnail", ""),
            "channel_handle":      ch_meta.get("handle", ""),
            "published_at":        v.get("published_at", ""),
            "views":               v.get("view_count", 0),
            "likes":               v.get("like_count", 0),
            "comments":            v.get("comment_count", 0),
            "duration_seconds":    v.get("duration_seconds", 0),
            "thumbnail":           v.get("thumbnail", ""),
            "description":         "",
            "channel_subscribers": ch_meta.get("subscribers", 0),
        })
    return enriched


def _apply_niche_views_floor(videos: list[dict]) -> list[dict]:
    """
    Drop videos below max(hard_floor, fraction * niche_median_views). This is
    niche-relative: a ~500-view niche keeps its content; a ~500k-view niche
    filters out noise.
    """
    if not videos:
        return videos
    views_list = [v["views"] for v in videos if v.get("views", 0) > 0]
    if not views_list:
        return videos
    median_views = statistics.median(views_list)
    floor = max(_VIEWS_FLOOR_HARD_MIN, round(median_views * _VIEWS_FLOOR_FRACTION))
    return [v for v in videos if v["views"] >= floor]


def _shorten_title(title: str) -> str:
    """
    Strip stopwords + short tokens from the title to produce a broader YouTube
    query. Keeps up to 4 of the most meaningful content words in original order.
    Used only when the niche-matched pool is too thin.
    """
    words = re.sub(r"[^\w\s]", " ", title.lower()).split()
    content = [w for w in words if w and len(w) > 2 and w not in _BROADEN_STOP]
    if not content:
        return ""
    return " ".join(content[:4])


def _batch_channel_details(creds, channel_ids: list[str]) -> dict[str, dict]:
    """
    Bulk channel hydration — subscribers, thumbnail, handle, video_count,
    total_views, and the uploads playlist ID (needed for niche matching).
    Batched 50 at a time with transient-error retry.
    """
    if not channel_ids:
        return {}
    youtube = build_youtube_client(creds)
    out: dict[str, dict] = {}
    for i in range(0, len(channel_ids), 50):
        chunk = channel_ids[i:i + 50]
        resp = _execute_with_retry(youtube.channels().list(
            part="snippet,statistics,contentDetails",
            id=",".join(chunk),
        ))
        for item in resp.get("items", []):
            stats = item.get("statistics", {})
            snippet = item.get("snippet", {})
            content_details = item.get("contentDetails", {})
            uploads = content_details.get("relatedPlaylists", {}).get("uploads", "")
            thumbs = snippet.get("thumbnails", {})
            thumb_url = (thumbs.get("medium") or thumbs.get("default") or {}).get("url", "")
            vc = int(stats.get("videoCount", 0))
            tv = int(stats.get("viewCount", 0))
            out[item["id"]] = {
                "subscribers":       int(stats.get("subscriberCount", 0)),
                "thumbnail":         thumb_url,
                "handle":            snippet.get("customUrl", ""),
                "description":       (snippet.get("description") or "")[:200],
                "video_count":       vc,
                "total_views":       tv,
                "avg_views_per_video": round(tv / max(vc, 1)),
                "channel_name":      snippet.get("title", ""),
                "uploads_playlist":  uploads,
            }
    return out


def _derive_breakout_channels(
    scored_videos: list[dict],
    channel_details: dict[str, dict],
) -> list[dict]:
    """
    Aggregate niche-matched outlier videos by channel. A breakout channel is
    one whose best video in this search scored above the outlier floor.
    Channel outlier_score = its best video's outlier_score.
    """
    by_ch: dict[str, dict] = {}
    for v in scored_videos:
        cid = v.get("channel_id")
        if not cid:
            continue
        entry = by_ch.setdefault(cid, {
            "channel_id":          cid,
            "videos_in_search":    0,
            "best_outlier_score":  0,
            "total_outlier_score": 0.0,
            "top_video_thumbnail": "",
            "top_video_title":     "",
            "top_video_id":        "",
            "top_video_views":     0,
        })
        entry["videos_in_search"] += 1
        score = v.get("outlier_score", 0)
        entry["total_outlier_score"] += score
        if score > entry["best_outlier_score"]:
            entry["best_outlier_score"]  = score
            entry["top_video_thumbnail"] = v.get("thumbnail", "")
            entry["top_video_title"]     = v.get("title", "")
            entry["top_video_id"]        = v.get("video_id", "")
            entry["top_video_views"]     = v.get("views", 0)

    channels: list[dict] = []
    for cid, data in by_ch.items():
        if data["best_outlier_score"] < _MIN_OUTLIER_SCORE:
            continue
        meta = channel_details.get(cid, {})
        subs = meta.get("subscribers", 0)
        if subs <= 0:
            continue
        vc = meta.get("video_count", 0)
        tv = meta.get("total_views", 0)
        channels.append({
            "channel_id":          cid,
            "channel_name":        meta.get("channel_name", ""),
            "handle":              meta.get("handle", ""),
            "thumbnail":           meta.get("thumbnail", ""),
            "description":         meta.get("description", ""),
            "subscribers":         subs,
            "total_views":         tv,
            "video_count":         vc,
            "avg_views_per_video": meta.get("avg_views_per_video", 0),
            "videos_in_search":    data["videos_in_search"],
            "outlier_score":       data["best_outlier_score"],
            "avg_outlier_score":   round(data["total_outlier_score"] / max(data["videos_in_search"], 1), 1),
            "top_video_thumbnail": data["top_video_thumbnail"],
            "top_video_title":     data["top_video_title"],
            "top_video_id":        data["top_video_id"],
            "top_video_views":     data["top_video_views"],
        })

    channels.sort(key=lambda c: (c["outlier_score"], c["videos_in_search"]), reverse=True)
    return channels[:_RESULTS_CHANNEL]


def _score_videos(videos: list[dict]) -> list[dict]:
    """
    Outlier score = views-per-subscriber divided by the cohort median.
    Views-per-sub normalizes out raw channel size so a 50k-view video on
    a 10k channel scores higher than a 200k-view video on a 2M channel.
    """
    if not videos:
        return []
    vps_list = []
    for v in videos:
        subs = max(v["channel_subscribers"], 1)
        v["views_per_sub"] = v["views"] / subs
        vps_list.append(v["views_per_sub"])
    median_vps = statistics.median(vps_list) or 0.0001
    for v in videos:
        raw = v["views_per_sub"] / median_vps
        v["outlier_score"] = round(raw, 1)
    return videos


# ─── Claude explanations (batched — one call per search) ──────────────────────

def _explain_video_outliers(query: str, videos: list[dict], my_subs: int) -> dict[str, str]:
    """One Claude call generates explanations for every result, keyed by video_id."""
    if not videos:
        return {}
    slim = [
        {
            "id":          v["video_id"],
            "title":       v["title"],
            "channel":     v["channel_name"],
            "subs":        v["channel_subscribers"],
            "views":       v["views"],
            "likes":       v["likes"],
            "comments":    v["comments"],
            "duration_s":  v["duration_seconds"],
            "outlier":     v["outlier_score"],
        }
        for v in videos
    ]

    prompt = f"""A YouTube creator with {my_subs:,} subscribers searched: "{query}"

These videos over-performed their niche cohort. Each has an outlier score
(how many times the cohort median views-per-subscriber it hit).

{json.dumps(slim, indent=2)}

For EACH video, explain in ONE sentence (max 22 words) WHY it outperformed —
reference the specific title hook, topic angle, or pattern that made it work.
No generic advice. No "great title" fluff. Be concrete.

Return ONLY valid JSON, no markdown:
{{
  "explanations": [
    {{"id": "<video_id>", "why": "<one sentence>"}},
    ...
  ]
}}"""
    return _run_claude_batch(prompt)


def _explain_channel_outliers(query: str, channels: list[dict], my_subs: int) -> dict[str, str]:
    if not channels:
        return {}
    slim = [
        {
            "id":               c["channel_id"],
            "name":             c["channel_name"],
            "description":      c["description"],
            "subs":             c["subscribers"],
            "video_count":      c["video_count"],
            "avg_views":        c["avg_views_per_video"],
            "outlier":          c["outlier_score"],
        }
        for c in channels
    ]

    prompt = f"""A YouTube creator with {my_subs:,} subscribers searched: "{query}"

These channels over-performed in the user's niche on this topic. Each has an
outlier score (how many times the cohort median views-per-subscriber it hits).

{json.dumps(slim, indent=2)}

For EACH channel, explain in ONE sentence (max 22 words) WHY it outperforms —
reference its specific niche angle, positioning, or content formula.
No generic advice. Be concrete.

Return ONLY valid JSON, no markdown:
{{
  "explanations": [
    {{"id": "<channel_id>", "why": "<one sentence>"}},
    ...
  ]
}}"""
    return _run_claude_batch(prompt)


def _run_claude_batch(prompt: str) -> dict[str, str]:
    try:
        client = make_anthropic_client()
        msg = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=(
                "You are an elite YouTube growth analyst. You spot the exact "
                "mechanism that made a video or channel over-perform its peers. "
                "Be specific, reference real details, never give generic advice."
            ),
            messages=[{"role": "user", "content": prompt}],
        )
        raw = msg.content[0].text.strip()
        raw = re.sub(r"^```[a-z]*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw).strip()
        parsed = json.loads(raw)
        out: dict[str, str] = {}
        for entry in parsed.get("explanations", []):
            rid = entry.get("id")
            why = (entry.get("why") or "").strip()
            if rid and why:
                out[rid] = why
        return out
    except Exception as e:
        print(f"[outliers] Claude batch explanation error: {e}")
        return {}
