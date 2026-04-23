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
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone

import httplib2
from googleapiclient.errors import HttpError

from app.utils import make_anthropic_client, build_youtube_client
from app.seo import (
    search_top_videos,
    _filter_by_intent,
    research_keywords,
    get_autocomplete_suggestions,
    _extract_search_terms,
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

_SEARCH_POOL_SIZE   = 50    # Per-query YouTube pool (matches SEO Optimizer)
_RESULTS_VIDEO      = 12    # Returned to the frontend for video/thumbnail tabs
_RESULTS_CHANNEL    = 10    # Returned for channel tab
_PER_CHANNEL_CAP    = 2     # Max videos from one channel in the videos/thumbnails tabs
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
# Relevance model:
#   HARD constraints (always enforced) — the definition of "relevant":
#     • intent filter (_filter_by_intent on confirmed_keyword)
#     • recency (last 12 months only)
#     • user's own channel excluded
#     • niche-relative views floor (kills dead uploads)
#
#   SOFT preferences (used for ranking, not filtering):
#     • niche match — channel's recent uploads overlap the user's niche keywords
#     • outlier score ≥ _MIN_OUTLIER_SCORE (1.8×)
#
# Videos AND channels both sort in tiers:
#   Tier 1: niche-matched + above outlier floor
#   Tier 2: niche-matched
#   Tier 3: above outlier floor
#   Tier 4: anything else (still relevance-guaranteed)
# Take top 12 videos and top 10 channels from the tiered sort. When the pool's
# distinct-channel count is below the minimum, broaden the query once to enlarge.

def _run_unified_search(
    creds,
    title: str,
    confirmed_keyword: str,
    my_channel_id: str,
    my_subscribers: int,
    niche_keywords: list[str],
) -> dict:
    # Build the search_terms list SEO-style: primary phrase + 2 AI-extracted
    # secondaries from the original title. Three queries merged = way more
    # channel diversity than a single search.
    search_terms = _build_search_terms(title, confirmed_keyword)

    # Classify the topic's vertical in PARALLEL with the YouTube fetch. The
    # classification is only used to rank the Channels tab; the YouTube
    # search is the wall-clock-critical call. Running them concurrently
    # means this feature adds 0s to total search time in practice.
    primary_topic = (confirmed_keyword or title).strip()
    with ThreadPoolExecutor(max_workers=2) as pool:
        vertical_fut = pool.submit(_classify_topic_vertical, primary_topic)
        fetch_fut    = pool.submit(
            _fetch_intent_filtered, creds, search_terms, confirmed_keyword, my_channel_id,
        )
        vertical_info                   = vertical_fut.result() or {}
        intent_videos, channel_details  = fetch_fut.result()

    vertical_traits   = vertical_info.get("vertical_traits", []) or []
    topic_specificity = vertical_info.get("topic_specificity", "generalist")

    # Niche matching — parallel fetch of the top 25 channels' recent titles.
    # We derive TWO sets from the same fetched titles:
    #   niche_channels    — match against the user's personal niche (videos tier sort)
    #   vertical_channels — match against the search topic's industry (channels tier sort)
    # Channels that aren't scanned default to not-matched → tier 3/4.
    recent_titles = _fetch_channel_recent_titles(
        creds, _top_channels_by_pool_presence(intent_videos, channel_details, limit=25),
    )
    niche_channels    = _niche_match_channels(recent_titles, niche_keywords)
    vertical_channels = _niche_match_channels(recent_titles, vertical_traits) if vertical_traits else set()

    # Broaden ONCE if we don't have enough for a full 8-video AND 8-channel
    # result set. Adds videos from a stopword-stripped query.
    broadened_with = None
    distinct_channels = {v.get("channel_id") for v in intent_videos if v.get("channel_id")}
    if len(intent_videos) < _MIN_RESULTS or len(distinct_channels) < _MIN_RESULTS:
        broader_query = _shorten_title(title)
        if broader_query and broader_query.lower() != title.lower():
            broadened_with = broader_query
            extra_videos, extra_details = _fetch_intent_filtered(
                creds, [broader_query], confirmed_keyword, my_channel_id,
            )
            new_ch_ids = [c for c in extra_details.keys() if c not in channel_details]
            channel_details.update(extra_details)

            seen = {v["video_id"] for v in intent_videos}
            for v in extra_videos:
                if v["video_id"] not in seen:
                    intent_videos.append(v)
                    seen.add(v["video_id"])

            # Only scan recent titles for new channels that will have >=1 video
            # in the final pool — same top-25-by-presence cap the primary path
            # uses, but we only consider channels we haven't already scanned.
            if new_ch_ids:
                extra_details_to_scan = _top_channels_by_pool_presence(
                    intent_videos,
                    {c: channel_details[c] for c in new_ch_ids},
                    limit=15,
                )
                extra_titles = _fetch_channel_recent_titles(creds, extra_details_to_scan)
                recent_titles.update(extra_titles)
                niche_channels    |= _niche_match_channels(extra_titles, niche_keywords)
                if vertical_traits:
                    vertical_channels |= _niche_match_channels(extra_titles, vertical_traits)

    # Enrich + apply views floor + score.
    enriched = _enrich(intent_videos, channel_details)
    floored  = _apply_niche_views_floor(enriched)
    scored   = _score_videos(list(floored))

    # Tag each video with its soft signals (used by both tiered sort + UI).
    for v in scored:
        cid = v.get("channel_id")
        v["is_niche_matched"] = cid in niche_channels
        v["is_above_floor"]   = v["outlier_score"] >= _MIN_OUTLIER_SCORE

    # Tiered video sort — guarantees 8+ as long as the relevance pool has 8+.
    scored_sorted = sorted(scored, key=_tier_sort_key)
    # Per-channel cap prevents a single vlogger from dominating the results.
    # If the capped pool falls below 8, relax the cap to backfill (we'd rather
    # show a channel's 3rd hit than a blank slot).
    capped = _apply_channel_cap(scored_sorted, _PER_CHANNEL_CAP)
    if len(capped) < _MIN_RESULTS:
        capped = _apply_channel_cap(scored_sorted, _PER_CHANNEL_CAP + 2)
    top_videos = capped[:_RESULTS_VIDEO]

    # Diagnostic tag for the cohort payload.
    if top_videos and top_videos[0].get("is_niche_matched") and top_videos[0].get("is_above_floor"):
        cohort_tag = "niche"
    elif top_videos and any(v.get("is_niche_matched") for v in top_videos):
        cohort_tag = "mixed"
    elif broadened_with:
        cohort_tag = "broadened"
    else:
        cohort_tag = "best-effort"

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

    # Derive breakout channels — tier sort uses `vertical_channels` (topic's
    # industry) instead of personal niche, so we surface lifestyle-vloggers-
    # who-occasionally-haul rather than haul-specialists. If classification
    # failed (empty vertical_channels), we fall back to personal niche so the
    # tab still shows sensible results.
    channels_match_set = vertical_channels if vertical_traits else niche_channels
    top_channels = _derive_breakout_channels(
        scored, channel_details, channels_match_set, topic_specificity,
    )

    # Claude explanations — three independent calls run IN PARALLEL. Sequential
    # these took ~40s (Sonnet video + Sonnet channel + Sonnet vision thumbnail);
    # parallel collapses to roughly the slowest of the three (~15-20s).
    video_explanations:   dict[str, dict] = {}
    channel_explanations: dict[str, dict] = {}
    thumbnail_patterns:   dict             = {}

    with ThreadPoolExecutor(max_workers=3) as pool:
        futures: dict = {}
        if top_videos:
            futures["videos"]  = pool.submit(_explain_video_outliers, title, top_videos, my_subscribers)
            futures["thumbs"]  = pool.submit(_analyze_thumbnail_patterns, title, top_videos)
        if top_channels:
            futures["channels"] = pool.submit(_explain_channel_outliers, title, top_channels, my_subscribers)
        if "videos" in futures:
            video_explanations   = futures["videos"].result()   or {}
        if "channels" in futures:
            channel_explanations = futures["channels"].result() or {}
        if "thumbs" in futures:
            thumbnail_patterns   = futures["thumbs"].result()   or {}

    for r in top_videos:
        ex = video_explanations.get(r["video_id"], {}) or {}
        r["why_worked"]    = ex.get("why_worked", "")
        r["quick_actions"] = ex.get("quick_actions", []) or []
        r["why_now"]       = ex.get("why_now", "")
        r["explanation"]   = ex.get("why_worked", "")   # back-compat alias

    for c in top_channels:
        ex = channel_explanations.get(c["channel_id"], {}) or {}
        c["why_this_channel"] = ex.get("why_this_channel", "")
        c["what_to_do"]       = ex.get("what_to_do", []) or []
        c["why_now"]          = ex.get("why_now", "")
        c["explanation"]      = ex.get("why_this_channel", "")

    cohort_median_vps = statistics.median([s["views_per_sub"] for s in scored]) if scored else 0
    return {
        "videos":              top_videos,
        "channels":            top_channels,
        "thumbnail_patterns":  thumbnail_patterns,
        "keyword_scores":      keyword_scores,
        "autocomplete_terms":  autocomplete[:10],
        "top_tags":            all_tags_flat[:15],
        "intent_matched":      len(intent_videos),
        "primary_phrase":      primary_phrase,
        "cohort": {
            "query":             title,
            "my_subscribers":    my_subscribers,
            "niche_keywords":    niche_keywords,
            "pool_size":         len(scored),
            "median_vps":        round(cohort_median_vps, 3),
            "cohort_tier":       cohort_tag,         # diagnostic for the UI
            "broadened_with":    broadened_with,     # null unless query-broadening kicked in
            "window_days":       _RECENCY_DAYS,
            "vertical":          vertical_info.get("vertical", ""),
            "vertical_traits":   vertical_info.get("vertical_traits", []),
            "topic_specificity": topic_specificity,
        },
    }


# ─── Fetch + core filters ─────────────────────────────────────────────────────

def _classify_topic_vertical(query: str) -> dict:
    """
    Classify a search topic into its broad content vertical — e.g.
        "grocery haul"       -> {"vertical": "lifestyle vlog",
                                  "vertical_traits": ["vlog","routine","day in the life",...],
                                  "topic_specificity": "generalist"}
        "react native test"  -> {"vertical": "dev tutorial",
                                  "vertical_traits": ["tutorial","crash course","fix",...],
                                  "topic_specificity": "specialist"}

    Used by the Channels tab ranking: we match candidate channels' recent
    uploads against `vertical_traits` instead of the user's personal niche,
    so the tab surfaces lifestyle-vloggers-who-occasionally-haul rather than
    haul-only channels. Fails open — empty dict if the AI call errors out,
    which reverts Channels tab to personal-niche behaviour.
    """
    query = (query or "").strip()
    if not query:
        return {}
    import os
    if not os.getenv("ANTHROPIC_API_KEY", ""):
        return {}
    try:
        client = make_anthropic_client()
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=280,
            messages=[{"role": "user", "content": (
                f'YouTube search topic: "{query}"\n\n'
                f'Classify this into a BROAD content vertical the way a '
                f'creator would think about their niche.\n\n'
                f'Also decide: are the top channels covering this topic '
                f'usually broader-vertical channels who occasionally touch '
                f'it ("generalist"), or dedicated topic channels '
                f'("specialist")?\n\n'
                f'Return ONLY valid JSON, no markdown:\n'
                f'{{\n'
                f'  "vertical": "<2-4 word broad category, e.g. \'lifestyle vlog\', \'tech tutorial\', \'finance explainer\'>",\n'
                f'  "vertical_traits": ["<6-10 short broad-trait keywords typical of channels in this vertical; e.g. for lifestyle vlog: vlog, routine, day in the life, daily, morning, mom life, life update; AVOID topic-specific words>"],\n'
                f'  "topic_specificity": "generalist"\n'
                f'}}'
            )}],
        )
        raw = msg.content[0].text.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```[a-z]*\n?", "", raw)
            raw = re.sub(r"\n?```$", "", raw.strip())
        parsed = json.loads(raw)
        traits = [
            t.strip().lower()
            for t in (parsed.get("vertical_traits") or [])
            if isinstance(t, str) and t.strip()
        ][:10]
        specificity = (parsed.get("topic_specificity") or "generalist").strip().lower()
        if specificity not in ("generalist", "specialist"):
            specificity = "generalist"
        return {
            "vertical":          (parsed.get("vertical") or "").strip(),
            "vertical_traits":   traits,
            "topic_specificity": specificity,
        }
    except Exception as e:
        print(f"[outliers] topic-vertical classify error: {e}")
        return {}


def _build_search_terms(title: str, confirmed_keyword: str) -> list[str]:
    """
    Build the list of YouTube search phrases for this request — same pattern
    SEO Optimizer uses in analyze_title. Primary phrase (confirmed_keyword if
    the user picked one, otherwise the AI-extracted niche phrase) followed by
    up to 2 AI-extracted secondary phrases from the original title. Three
    searches merged gives us real channel diversity, not a single vlogger's
    back catalog repeated.
    """
    title = (title or "").strip()
    confirmed = (confirmed_keyword or "").strip().lower()
    if not title and not confirmed:
        return []

    primary = confirmed or title

    # Try to AI-extract richer phrases; degrade gracefully if the key is missing.
    import os
    from app.utils import make_anthropic_client
    if not os.getenv("ANTHROPIC_API_KEY", ""):
        return [primary]
    try:
        client = make_anthropic_client()
        extracted = _extract_search_terms(client, title, "") or []
    except Exception as e:
        print(f"[outliers] _extract_search_terms failed: {e}")
        extracted = []

    # Primary first, then 2 secondaries from the extracted list, deduped
    # preserving order. This matches seo.py's: [primary] + extracted[1:3].
    seen: set[str] = set()
    terms: list[str] = []
    for t in [primary] + list(extracted[1:3]):
        key = (t or "").strip().lower()
        if key and key not in seen:
            seen.add(key)
            terms.append(key)
    return terms


def _top_channels_by_pool_presence(
    videos: list[dict],
    channel_details: dict[str, dict],
    limit: int,
) -> dict[str, dict]:
    """
    Return the subset of channel_details for the top-`limit` channels by how
    many videos each contributes to the intent pool. Used to cap the niche-
    match fan-out: we only spend a playlistItems.list call on channels most
    likely to surface in the final result, not every channel ever touched.
    """
    if len(channel_details) <= limit:
        return dict(channel_details)
    counts: dict[str, int] = {}
    for v in videos:
        cid = v.get("channel_id") or ""
        if cid and cid in channel_details:
            counts[cid] = counts.get(cid, 0) + 1
    ranked = sorted(channel_details.keys(), key=lambda c: -counts.get(c, 0))
    return {cid: channel_details[cid] for cid in ranked[:limit]}


def _apply_channel_cap(videos: list[dict], per_channel: int) -> list[dict]:
    """Keep at most per_channel videos per channel, preserving tier order."""
    counts: dict[str, int] = {}
    out: list[dict] = []
    for v in videos:
        cid = v.get("channel_id") or ""
        if counts.get(cid, 0) >= per_channel:
            continue
        counts[cid] = counts.get(cid, 0) + 1
        out.append(v)
    return out


def _fetch_intent_filtered(
    creds, search_terms: list[str], confirmed_keyword: str, my_channel_id: str,
) -> tuple[list[dict], dict[str, dict]]:
    """
    Multi-query YouTube search (same pattern SEO Optimizer uses) → intent filter
    → own-channel drop → 12-month filter → channel-detail hydration.

    When confirmed_keyword is set we SKIP the word-boundary intent filter — the
    YouTube search's own relevance ordering has already matched intent, and
    layering _filter_by_intent on top drops most results (e.g. "home office
    cleaning vlog" would require all 4 words in a title and almost nothing
    survives). This mirrors seo.py's analyze_title behaviour.
    """
    terms = [t for t in (search_terms or []) if t and t.strip()]
    if not terms:
        return [], {}
    raw_videos = search_top_videos(creds, terms, max_results=_SEARCH_POOL_SIZE)
    if not raw_videos:
        return [], {}

    if confirmed_keyword:
        # Skip word-boundary filter — YouTube relevance already handles intent.
        intent_videos = raw_videos
    else:
        intent_videos = _filter_by_intent(terms[0], raw_videos) or raw_videos[:10]

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
    Fetch the last _NICHE_TITLES_PER_CHANNEL upload titles for each channel —
    in parallel. One playlistItems.list per channel was the biggest wall-clock
    cost in Outliers (sequential, 20-40 channels × ~300-500ms = 10-20s). With
    a thread pool we collapse that to ~1-3s.

    Each thread builds its own googleapiclient service — the underlying
    httplib2.Http is not thread-safe, so we don't share the outer client.
    Only channels with an uploads_playlist are queried; the rest map to [].
    """
    out: dict[str, list[str]] = {cid: [] for cid in channel_details}
    jobs = [
        (cid, meta.get("uploads_playlist"))
        for cid, meta in channel_details.items()
        if meta.get("uploads_playlist")
    ]
    if not jobs:
        return out

    def fetch_one(cid: str, pid: str) -> tuple[str, list[str]]:
        try:
            yt = build_youtube_client(creds)  # per-thread client (see docstring)
            resp = _execute_with_retry(yt.playlistItems().list(
                part="snippet",
                playlistId=pid,
                maxResults=_NICHE_TITLES_PER_CHANNEL,
            ))
            titles: list[str] = []
            for item in resp.get("items", []):
                t = (item.get("snippet", {}).get("title") or "").strip()
                if t:
                    titles.append(t)
            return cid, titles
        except Exception as e:
            print(f"[outliers] recent-titles fetch error for {cid}: {e}")
            return cid, []

    with ThreadPoolExecutor(max_workers=10) as pool:
        futures = [pool.submit(fetch_one, cid, pid) for cid, pid in jobs]
        for f in as_completed(futures):
            cid, titles = f.result()
            out[cid] = titles
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


def _tier_sort_key(v: dict) -> tuple:
    """
    Shared tiered ordering for both videos and channels. Lower is better.
    Tier 1 (0,0): niche-matched + above outlier floor
    Tier 2 (0,1): niche-matched
    Tier 3 (1,0): above outlier floor
    Tier 4 (1,1): neither (still relevance-guaranteed)
    Within a tier, higher outlier_score wins (so we negate it).
    """
    return (
        0 if v.get("is_niche_matched") else 1,
        0 if v.get("is_above_floor")   else 1,
        -float(v.get("outlier_score", 0) or 0),
    )


def _derive_breakout_channels(
    scored_videos: list[dict],
    channel_details: dict[str, dict],
    match_channels: set[str],
    topic_specificity: str = "generalist",
) -> list[dict]:
    """
    Aggregate the scored-video pool by channel. No hard outlier-floor filter —
    we want to fill _RESULTS_CHANNEL slots whenever possible. The tier sort
    surfaces match-set channels (the topic's vertical) first, then above-
    floor, then anything else. Channel outlier_score = its best video's
    outlier_score in this search.

    topic_specificity:
      - "generalist" (default): within a tier, channels with FEWER videos in
        this search rank higher — genuine generalists dabbling beat
        topic-specialists who happen to also be in the vertical.
      - "specialist": invert — more videos in search rank higher (the channel
        is an authority on this specific topic).
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
        meta = channel_details.get(cid, {})
        subs = meta.get("subscribers", 0)
        if subs <= 0:
            # subs == 0 usually = zombie / deleted channel; never show.
            continue
        vc = meta.get("video_count", 0)
        tv = meta.get("total_views", 0)
        is_match    = cid in match_channels
        is_above    = data["best_outlier_score"] >= _MIN_OUTLIER_SCORE
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
            "is_niche_matched":    is_match,   # the match set passed in (vertical or niche fallback)
            "is_above_floor":      is_above,
        })

    # Tier sort with specificity-aware tiebreak. _tier_sort_key handles the
    # first 3 dimensions (match set, floor, score); we add a 4th for videos-
    # in-search so generalists dabbling beat specialists when topic is
    # generalist, and vice versa.
    sign = 1 if topic_specificity == "generalist" else -1
    channels.sort(key=lambda c: _tier_sort_key(c) + (sign * c.get("videos_in_search", 0),))
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
# Each detail panel needs 3 sections — so the batch output is structured, not a
# single sentence. Videos/Thumbnails: {why_worked, quick_actions[3], why_now}.
# Channels: {why_this_channel, what_to_do[3], why_now}. "Why now" must be
# specific + urgent — it's the Priority-Actions-style pressure line, not fluff.

def _explain_video_outliers(query: str, videos: list[dict], my_subs: int) -> dict[str, dict]:
    """One Claude call returns {video_id: {why_worked, quick_actions, why_now}}."""
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
            "published":   v.get("published_at", ""),
        }
        for v in videos
    ]

    prompt = f"""A YouTube creator with {my_subs:,} subscribers searched: "{query}"

These recent videos over-performed their niche cohort. Each has an outlier
score (how many times the niche median views-per-subscriber it hit).

{json.dumps(slim, indent=2)}

For EACH video return three things:

1. why_worked — ONE sentence (max 22 words). The exact hook, angle, or pattern
   that made this outperform. Reference the specific title phrasing or format.
   No generic praise.

2. quick_actions — EXACTLY 3 short, concrete actions (each ≤ 14 words). Things
   the creator can do TODAY to borrow from this result. Imperative voice.
   Specific (e.g. "Open with a 3-second before/after shot") not vague
   ("make a better hook").

3. why_now — ONE sentence (max 22 words) explaining why acting on this is
   URGENT right now. Reference recency, rising momentum, seasonal timing,
   audience gap, or a specific signal the data shows. Be concrete — "This
   angle is still climbing in the last 30 days" beats "it's a hot topic".
   Never generic.

Return ONLY valid JSON, no markdown:
{{
  "explanations": [
    {{
      "id": "<video_id>",
      "why_worked": "<one sentence>",
      "quick_actions": ["<action 1>", "<action 2>", "<action 3>"],
      "why_now": "<one urgent sentence>"
    }}
  ]
}}"""
    return _run_claude_structured_batch(prompt, id_key="id")


def _explain_channel_outliers(query: str, channels: list[dict], my_subs: int) -> dict[str, dict]:
    """One Claude call returns {channel_id: {why_this_channel, what_to_do, why_now}}."""
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
            "videos_in_search": c["videos_in_search"],
            "outlier":          c["outlier_score"],
            "top_video_title":  c.get("top_video_title", ""),
        }
        for c in channels
    ]

    prompt = f"""A YouTube creator with {my_subs:,} subscribers searched: "{query}"

These channels over-perform in the user's niche. Each has an outlier score
(how many times the niche median views-per-subscriber it hits). They also
show how many videos in THIS search surfaced from the channel.

{json.dumps(slim, indent=2)}

For EACH channel return three things — this is a deep channel profile, not
a summary. The creator wants to know how to borrow from them specifically.

1. why_this_channel — 2 sentences (max 40 words total). Their specific content
   formula: positioning, angle, topic coverage, posting rhythm, anything that
   makes them consistently win in this niche. Reference their name and at
   least one concrete detail (their top video's pattern, their sub-niche,
   etc.). No generic descriptions.

2. what_to_do — EXACTLY 3 concrete actions (each ≤ 16 words). Exact moves the
   creator should borrow from this channel. Imperative, specific — e.g.
   "Steal their 60-second cold open before the title card" not "make
   stronger openings".

3. why_now — ONE sentence (max 22 words). Why acting on this channel's
   playbook is URGENT: what signal in the data makes this the moment?
   Reference recency, momentum, or an audience gap. Never generic.

Return ONLY valid JSON, no markdown:
{{
  "explanations": [
    {{
      "id": "<channel_id>",
      "why_this_channel": "<2 sentences>",
      "what_to_do": ["<action 1>", "<action 2>", "<action 3>"],
      "why_now": "<one urgent sentence>"
    }}
  ]
}}"""
    return _run_claude_structured_batch(prompt, id_key="id")


def _analyze_thumbnail_patterns(query: str, videos: list[dict]) -> dict:
    """
    Vision-enabled Claude call scanning the actual thumbnail images of the
    outlier videos. Returns the niche's winning visual patterns plus concrete
    recommendations. Sent to Claude as image URLs (up to 10 thumbnails) so it
    can analyse layout, text, faces, and colors directly.
    """
    if not videos:
        return {}
    # Cap the image payload — 10 is plenty of signal, keeps the call fast/cheap
    thumbs = [v for v in videos if v.get("thumbnail")][:10]
    if not thumbs:
        return {}

    titles_lines = "\n".join(
        f"{i + 1}. \"{v.get('title', '')}\" — {v.get('views', 0):,} views"
        for i, v in enumerate(thumbs)
    )

    prompt_text = f"""A YouTube creator searched: "{query}"

I'm showing you the thumbnails of {len(thumbs)} videos that over-performed in
this niche over the last 12 months. For context, here are their titles and
view counts in the same order:

{titles_lines}

Analyse the ACTUAL images and find the winning visual pattern in this niche.

Return ONLY valid JSON, no markdown:
{{
  "dominant_style": "<1 sentence — the overall visual approach that dominates>",
  "text_overlay": "<1 sentence — how they use on-thumbnail text: size, font, ALL CAPS vs mixed, word count, placement>",
  "face_presence": "<1 sentence — how many have faces, typical expression/emotion, face size/placement>",
  "color_palette": "<1 sentence — dominant colors, contrast level, saturation>",
  "layout_pattern": "<1 sentence — spatial composition: subject left vs right, object/prop placement, bars, borders, arrows>",
  "recommendations": [
    "<concrete recommendation 1 — ≤ 18 words, imperative, specific>",
    "<concrete recommendation 2>",
    "<concrete recommendation 3>",
    "<concrete recommendation 4>"
  ],
  "why_now": "<1 sentence — the timing reason this visual pattern is working RIGHT NOW in this niche; reference momentum or a signal you spotted across the images>"
}}

Be specific. Reference actual visual details you see. No generic advice."""

    content_blocks: list[dict] = [{"type": "text", "text": prompt_text}]
    for v in thumbs:
        url = v.get("thumbnail")
        if not url:
            continue
        content_blocks.append({
            "type": "image",
            "source": {"type": "url", "url": url},
        })

    try:
        client = make_anthropic_client()
        msg = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1200,
            system=(
                "You are a YouTube thumbnail strategist. You look at real "
                "thumbnails and name the exact visual mechanic that wins. "
                "Always reference concrete details — faces, text size, colors, "
                "layout — never generic advice."
            ),
            messages=[{"role": "user", "content": content_blocks}],
        )
        raw = msg.content[0].text.strip()
        raw = re.sub(r"^```[a-z]*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw).strip()
        parsed = json.loads(raw)
        # Normalise fields + trim recommendations to 4
        return {
            "dominant_style":  (parsed.get("dominant_style") or "").strip(),
            "text_overlay":    (parsed.get("text_overlay") or "").strip(),
            "face_presence":   (parsed.get("face_presence") or "").strip(),
            "color_palette":   (parsed.get("color_palette") or "").strip(),
            "layout_pattern":  (parsed.get("layout_pattern") or "").strip(),
            "recommendations": [
                r.strip() for r in (parsed.get("recommendations") or [])
                if isinstance(r, str) and r.strip()
            ][:4],
            "why_now":         (parsed.get("why_now") or "").strip(),
            "sample_size":     len(thumbs),
        }
    except Exception as e:
        print(f"[outliers] thumbnail-pattern analysis error: {e}")
        return {}


def _run_claude_structured_batch(prompt: str, id_key: str = "id") -> dict[str, dict]:
    """
    Shared driver for the structured video/channel batch calls. Returns a map
    keyed by id_key, value = the parsed entry object (minus the id itself).
    """
    try:
        client = make_anthropic_client()
        msg = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=3500,
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
        out: dict[str, dict] = {}
        for entry in parsed.get("explanations", []):
            rid = entry.get(id_key)
            if not rid:
                continue
            entry_copy = {k: v for k, v in entry.items() if k != id_key}
            # Clean list fields in-place
            for list_field in ("quick_actions", "what_to_do"):
                if list_field in entry_copy:
                    entry_copy[list_field] = [
                        s.strip() for s in (entry_copy[list_field] or [])
                        if isinstance(s, str) and s.strip()
                    ][:3]
            out[rid] = entry_copy
        return out
    except Exception as e:
        print(f"[outliers] Claude structured batch error: {e}")
        return {}
