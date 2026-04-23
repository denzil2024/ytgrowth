"""
Outliers — find videos, thumbnails, or channels that over-performed relative to
a size-matched peer cohort for a given keyword/topic. Not generic YouTube search:
results are filtered by inferred intent and channel-size relevance, scored by
how much they beat the cohort median, then explained by Claude in one batched call.

Credit model: one credit per /outliers/search call (shared across all N results).
"""
import json
import re
import socket
import ssl
import statistics
import time

import httplib2
from googleapiclient.errors import HttpError

from app.utils import make_anthropic_client, build_youtube_client
from app.thumbnail import get_size_bracket
from app.competitors import parse_duration_seconds
from app.seo import (
    search_top_videos,
    _filter_by_intent,
    research_keywords,
    get_autocomplete_suggestions,
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

# Raw search pulls more than we return — we score, filter, then trim.
_SEARCH_POOL_SIZE   = 40    # YouTube search results requested
_RESULTS_VIDEO      = 12    # Returned to the frontend for video/thumbnail tabs
_RESULTS_CHANNEL    = 10    # Returned for channel tab
_SIZE_RELEVANCE_BAND = 10.0 # Cohort = channels within 1/10x–10x of user's subs
_MIN_OUTLIER_SCORE  = 1.8   # Below this, not really an outlier; drop it
_MIN_VIDEO_VIEWS    = 1_000 # Skip dead videos that pollute the signal


# ─── Entry point ──────────────────────────────────────────────────────────────

def search_outliers(creds, query: str, my_subscribers: int, confirmed_keyword: str = "") -> dict:
    """
    Single unified search — runs once and returns videos + breakout channels +
    keyword scores in one payload. The three tabs in the UI (Videos / Thumbnails
    / Channels) are just different views of the same result set.

    Mirrors SEO Optimizer's analyze_title flow:
      1. Search YouTube using the ORIGINAL title the user typed.
      2. Filter returned videos using confirmed_keyword via _filter_by_intent.
      3. Extract/score keywords from filtered videos via research_keywords.
    Breakout channels are derived by aggregating the intent-filtered videos by
    channel — no separate channel search.
    """
    query = (query or "").strip()
    if not query:
        return {"error": "Query cannot be empty."}

    confirmed = (confirmed_keyword or "").strip()

    try:
        return _run_unified_search(creds, query, confirmed, my_subscribers)
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

def _run_unified_search(creds, title: str, confirmed_keyword: str, my_subscribers: int) -> dict:
    # 1. YouTube search using the ORIGINAL title (SEO analyze_title step 2).
    raw_videos = search_top_videos(creds, [title], max_results=_SEARCH_POOL_SIZE)
    if not raw_videos:
        return {
            "videos": [], "channels": [], "keyword_scores": [],
            "cohort": {"query": title, "size_bracket": get_size_bracket(my_subscribers)},
        }

    # 2. Filter by confirmed intent (SEO step 2b — _filter_by_intent word-boundary match).
    primary_phrase = confirmed_keyword.lower() if confirmed_keyword else title.lower()
    if confirmed_keyword:
        intent_videos = _filter_by_intent(confirmed_keyword, raw_videos)
        if not intent_videos:
            intent_videos = raw_videos[:10]
    else:
        intent_videos = raw_videos

    # 3. Bulk channel details (subs + name + thumbnail + stats) for every unique
    #    channel in the intent-filtered set. Needed for video cards AND for the
    #    derived breakout-channel tab.
    channel_ids = list({v["channel_id"] for v in intent_videos if v.get("channel_id")})
    channel_details = _batch_channel_details(creds, channel_ids)

    # 4. Normalise to the outlier-pipeline shape.
    enriched: list[dict] = []
    for v in intent_videos:
        views = v.get("view_count", 0)
        if views < _MIN_VIDEO_VIEWS:
            continue
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
            "views":               views,
            "likes":               v.get("like_count", 0),
            "comments":            v.get("comment_count", 0),
            "duration_seconds":    v.get("duration_seconds", 0),
            "thumbnail":           v.get("thumbnail", ""),
            "description":         "",
            "channel_subscribers": ch_meta.get("subscribers", 0),
        })

    # 5. Size-relevance filter.
    my_bracket = get_size_bracket(my_subscribers)
    relevant = _filter_size_relevant(enriched, my_subscribers)
    if len(relevant) < 3:
        relevant = enriched

    # 6. Outlier scoring (views-per-sub vs cohort median).
    scored = _score_videos(relevant)
    scored_above_floor = [s for s in scored if s["outlier_score"] >= _MIN_OUTLIER_SCORE]
    scored_above_floor.sort(key=lambda s: s["outlier_score"], reverse=True)
    top_videos = scored_above_floor[:_RESULTS_VIDEO]

    # 7. Keyword extraction (SEO steps 3–5) on the intent-filtered set.
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

    # 8. Derive breakout channels from the outlier-scored videos.
    top_channels = _derive_breakout_channels(scored, channel_details, my_subscribers)

    # 9. Claude explanations for outlier videos + breakout channels (batched).
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
            "query":          title,
            "size_bracket":   my_bracket,
            "my_subscribers": my_subscribers,
            "pool_size":      len(relevant),
            "median_vps":     round(cohort_median_vps, 3),
        },
    }


def _batch_channel_details(creds, channel_ids: list[str]) -> dict[str, dict]:
    """
    Bulk channel hydration — subscribers, thumbnail, handle, video_count,
    total_views. Mirrors the channels().list pattern used in app/competitors.py,
    batched 50 at a time with transient-error retry.
    """
    if not channel_ids:
        return {}
    youtube = build_youtube_client(creds)
    out: dict[str, dict] = {}
    for i in range(0, len(channel_ids), 50):
        chunk = channel_ids[i:i + 50]
        resp = _execute_with_retry(youtube.channels().list(
            part="snippet,statistics",
            id=",".join(chunk),
        ))
        for item in resp.get("items", []):
            stats = item.get("statistics", {})
            snippet = item.get("snippet", {})
            thumbs = snippet.get("thumbnails", {})
            thumb_url = (thumbs.get("medium") or thumbs.get("default") or {}).get("url", "")
            vc = int(stats.get("videoCount", 0))
            tv = int(stats.get("viewCount", 0))
            out[item["id"]] = {
                "subscribers":   int(stats.get("subscriberCount", 0)),
                "thumbnail":     thumb_url,
                "handle":        snippet.get("customUrl", ""),
                "description":   (snippet.get("description") or "")[:200],
                "video_count":   vc,
                "total_views":   tv,
                "avg_views_per_video": round(tv / max(vc, 1)),
                "channel_name":  snippet.get("title", ""),
            }
    return out


def _derive_breakout_channels(scored_videos: list[dict], channel_details: dict[str, dict], my_subscribers: int) -> list[dict]:
    """
    Aggregate intent-filtered outlier videos by channel. A breakout channel is
    one where the user's size-peer cohort has a video scoring above the outlier
    floor. Channel outlier_score = its best video's outlier_score.
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

    # Size-relevance filter on channels, same band as videos.
    channels = _filter_channels_by_size(channels, my_subscribers)

    channels.sort(key=lambda c: (c["outlier_score"], c["videos_in_search"]), reverse=True)
    return channels[:_RESULTS_CHANNEL]


def _filter_size_relevant(videos: list[dict], my_subs: int) -> list[dict]:
    """Keep videos from channels within ~0.1x–10x of the user's subscriber count."""
    if my_subs <= 0:
        return videos
    low  = my_subs / _SIZE_RELEVANCE_BAND
    high = my_subs * _SIZE_RELEVANCE_BAND
    return [v for v in videos if low <= max(v["channel_subscribers"], 1) <= high]


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


def _filter_channels_by_size(channels: list[dict], my_subs: int) -> list[dict]:
    """Keep channels whose subscribers fall within the user's size band."""
    if my_subs <= 0:
        return channels
    low  = my_subs / _SIZE_RELEVANCE_BAND
    high = my_subs * _SIZE_RELEVANCE_BAND
    return [c for c in channels if low <= c["subscribers"] <= high]


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

These videos over-performed their channel-size peers. Each has an outlier score
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

These channels over-performed their size peers on this topic. Each has an
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
