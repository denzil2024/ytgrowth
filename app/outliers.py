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
from app.competitors import parse_duration_seconds, search_competitor_channels
from app.seo import search_top_videos


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

def search_outliers(creds, query: str, kind: str, my_subscribers: int, confirmed_keyword: str = "") -> dict:
    """
    kind ∈ {"video", "thumbnail", "channel"}.
    confirmed_keyword (optional): when the user picked an intent in the picker,
    this is the narrower keyword we actually send to YouTube. Falls back to the
    raw query when the user skipped the picker.

    Returns {"results": [...], "cohort": {...}} or {"error": "..."}.
    """
    query = (query or "").strip()
    if not query:
        return {"error": "Query cannot be empty."}
    if kind not in ("video", "thumbnail", "channel"):
        return {"error": f"Unknown kind: {kind}"}

    # The actual YouTube search query — confirmed intent wins when present.
    search_q = (confirmed_keyword or "").strip() or query

    try:
        if kind == "channel":
            return _search_channel_outliers(creds, query, search_q, my_subscribers)
        return _search_video_outliers(creds, query, search_q, kind, my_subscribers)
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


# ─── Video / thumbnail pipeline ───────────────────────────────────────────────
# Reuses SEO Optimizer's search_top_videos() for the search + video-details call
# (deduplication, Shorts filtering, and stats batching are already handled there
# and work in production). We add one bulk channels.list call for subscriber
# counts since outliers is the only surface that needs them.

def _search_video_outliers(creds, query: str, search_q: str, kind: str, my_subscribers: int) -> dict:
    # 1. Video search + stats — delegates to SEO's production helper.
    videos = search_top_videos(creds, [search_q], max_results=_SEARCH_POOL_SIZE)
    if not videos:
        return {"results": [], "cohort": {"query": query, "size_bracket": get_size_bracket(my_subscribers)}}

    # 2. Bulk subscriber lookup for every unique channel the videos came from.
    channel_ids = list({v["channel_id"] for v in videos if v.get("channel_id")})
    subs_by_channel = _batch_channel_subs(creds, channel_ids)

    # 3. Normalise to the outlier-pipeline shape: attach subs, drop dead videos,
    #    rename fields from search_top_videos' convention (view_count) to ours (views).
    enriched: list[dict] = []
    for v in videos:
        views = v.get("view_count", 0)
        if views < _MIN_VIDEO_VIEWS:
            continue
        enriched.append({
            "video_id":           v["video_id"],
            "title":              v.get("title", ""),
            "channel_id":         v.get("channel_id", ""),
            "channel_name":       v.get("channel", ""),
            "published_at":       v.get("published_at", ""),
            "views":              views,
            "likes":              v.get("like_count", 0),
            "comments":           v.get("comment_count", 0),
            "duration_seconds":   v.get("duration_seconds", 0),
            "thumbnail":          v.get("thumbnail", ""),
            "description":        "",
            "channel_subscribers": subs_by_channel.get(v.get("channel_id", ""), 0),
        })

    # 4. Size-relevance filter — keep only videos from channels within the band.
    my_bracket = get_size_bracket(my_subscribers)
    relevant = _filter_size_relevant(enriched, my_subscribers)

    # If size filtering wiped us out (user is a nano channel searching a mega
    # topic), fall back to the full enriched pool so we still have results.
    if len(relevant) < 3:
        relevant = enriched

    # 5. Score against the cohort median (views-per-sub normalizes for channel size).
    scored = _score_videos(relevant)
    scored = [s for s in scored if s["outlier_score"] >= _MIN_OUTLIER_SCORE]
    scored.sort(key=lambda s: s["outlier_score"], reverse=True)
    top = scored[:_RESULTS_VIDEO]

    # 6. One Claude batch call — explanations for every result, keyed by video_id.
    explanations = _explain_video_outliers(query, top, my_subscribers) if top else {}
    for r in top:
        r["explanation"] = explanations.get(r["video_id"], "")

    cohort_median_vps = statistics.median([s["views_per_sub"] for s in scored]) if scored else 0
    return {
        "results": top,
        "cohort": {
            "query":         query,
            "kind":          kind,
            "size_bracket":  my_bracket,
            "my_subscribers": my_subscribers,
            "pool_size":     len(relevant),
            "median_vps":    round(cohort_median_vps, 3),
        },
    }


def _batch_channel_subs(creds, channel_ids: list[str]) -> dict[str, int]:
    """
    Bulk subscriber-count lookup. Mirrors the channels().list pattern used in
    app/competitors.py, batched 50 at a time with transient-error retry.
    """
    if not channel_ids:
        return {}
    youtube = build_youtube_client(creds)
    out: dict[str, int] = {}
    for i in range(0, len(channel_ids), 50):
        chunk = channel_ids[i:i + 50]
        resp = _execute_with_retry(youtube.channels().list(
            part="statistics",
            id=",".join(chunk),
        ))
        for item in resp.get("items", []):
            s = item.get("statistics", {})
            out[item["id"]] = int(s.get("subscriberCount", 0))
    return out


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


# ─── Channel pipeline ─────────────────────────────────────────────────────────

def _search_channel_outliers(creds, query: str, search_q: str, my_subscribers: int) -> dict:
    # 1. Search channels by keyword — delegates to Competitors' production helper.
    #    Returns [{channel_id, channel_name, description, thumbnail}]. We ignore
    #    its description/thumbnail since the hydration call below has richer data.
    found = search_competitor_channels(creds, search_q, max_results=25)
    ids = [c["channel_id"] for c in found if c.get("channel_id")]
    if not ids:
        return {"results": [], "cohort": {"query": query, "size_bracket": get_size_bracket(my_subscribers)}}

    # 2. Hydrate each channel with stats + snippet via a bulk channels.list call
    #    (same pattern Competitors uses — just batched across many ids at once).
    youtube = build_youtube_client(creds)
    channels: list[dict] = []
    for i in range(0, len(ids), 50):
        chunk = ids[i:i + 50]
        resp = _execute_with_retry(youtube.channels().list(part="snippet,statistics", id=",".join(chunk)))
        for item in resp.get("items", []):
            s  = item.get("statistics", {})
            sn = item.get("snippet", {})
            video_count = int(s.get("videoCount", 0))
            subs        = int(s.get("subscriberCount", 0))
            total_views = int(s.get("viewCount", 0))
            if video_count <= 0 or subs <= 0:
                continue
            thumbs = sn.get("thumbnails", {})
            thumb_url = (thumbs.get("medium") or thumbs.get("default") or {}).get("url", "")
            channels.append({
                "channel_id":          item["id"],
                "channel_name":        sn.get("title", ""),
                "handle":              sn.get("customUrl", ""),
                "thumbnail":           thumb_url,
                "description":         (sn.get("description") or "")[:200],
                "subscribers":         subs,
                "total_views":         total_views,
                "video_count":         video_count,
                "avg_views_per_video": round(total_views / max(video_count, 1)),
                "views_per_sub":       total_views / max(subs, 1),
            })

    # 3. Size-relevance filter — keep only channels within the band.
    relevant = _filter_channels_by_size(channels, my_subscribers)
    if len(relevant) < 3:
        relevant = channels

    # 4. Score by views-per-sub vs. cohort median.
    if not relevant:
        return {"results": [], "cohort": {"query": query, "size_bracket": get_size_bracket(my_subscribers)}}

    median_vps = statistics.median([c["views_per_sub"] for c in relevant]) or 0.0001
    for c in relevant:
        c["outlier_score"] = round(c["views_per_sub"] / median_vps, 1)

    relevant = [c for c in relevant if c["outlier_score"] >= _MIN_OUTLIER_SCORE]
    relevant.sort(key=lambda c: c["outlier_score"], reverse=True)
    top = relevant[:_RESULTS_CHANNEL]

    # 5. Claude batch explanation.
    explanations = _explain_channel_outliers(query, top, my_subscribers) if top else {}
    for c in top:
        c["explanation"] = explanations.get(c["channel_id"], "")
        # views_per_sub is useful internally but messy to render; drop it.
        c.pop("views_per_sub", None)

    return {
        "results": top,
        "cohort": {
            "query":          query,
            "kind":           "channel",
            "size_bracket":   get_size_bracket(my_subscribers),
            "my_subscribers": my_subscribers,
            "pool_size":      len(relevant),
            "median_vps":     round(median_vps, 3),
        },
    }


def _filter_channels_by_size(channels: list[dict], my_subs: int) -> list[dict]:
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
