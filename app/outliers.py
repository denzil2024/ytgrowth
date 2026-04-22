"""
Outliers — find videos, thumbnails, or channels that over-performed relative to
a size-matched peer cohort for a given keyword/topic. Not generic YouTube search:
results are filtered by inferred intent and channel-size relevance, scored by
how much they beat the cohort median, then explained by Claude in one batched call.

Credit model: one credit per /outliers/search call (shared across all N results).
"""
import json
import re
import statistics
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

from app.utils import make_anthropic_client, build_youtube_client
from app.thumbnail import get_size_bracket
from app.competitors import parse_duration_seconds


# ─── Tunables ─────────────────────────────────────────────────────────────────

# Raw search pulls more than we return — we score, filter, then trim.
_SEARCH_POOL_SIZE   = 40    # YouTube search results requested
_RESULTS_VIDEO      = 12    # Returned to the frontend for video/thumbnail tabs
_RESULTS_CHANNEL    = 10    # Returned for channel tab
_SIZE_RELEVANCE_BAND = 10.0 # Cohort = channels within 1/10x–10x of user's subs
_MIN_OUTLIER_SCORE  = 1.8   # Below this, not really an outlier; drop it
_MIN_VIDEO_VIEWS    = 1_000 # Skip dead videos that pollute the signal


# ─── Entry point ──────────────────────────────────────────────────────────────

def search_outliers(creds, query: str, kind: str, my_subscribers: int) -> dict:
    """
    kind ∈ {"video", "thumbnail", "channel"}.
    Returns {"results": [...], "cohort": {...}} or {"error": "..."}.

    video/thumbnail use the same backend pipeline — the UI framing differs on
    the frontend, but the outlier math is identical (views vs. cohort median).
    """
    query = (query or "").strip()
    if not query:
        return {"error": "Query cannot be empty."}
    if kind not in ("video", "thumbnail", "channel"):
        return {"error": f"Unknown kind: {kind}"}

    try:
        if kind == "channel":
            return _search_channel_outliers(creds, query, my_subscribers)
        return _search_video_outliers(creds, query, kind, my_subscribers)
    except Exception as e:
        import traceback
        print(f"[outliers] search error: {traceback.format_exc()}")
        return {"error": str(e)}


# ─── Video / thumbnail pipeline ───────────────────────────────────────────────

def _search_video_outliers(creds, query: str, kind: str, my_subscribers: int) -> dict:
    youtube = build_youtube_client(creds)

    # 1. Raw search — YouTube relevance ordering is our intent signal.
    search_resp = youtube.search().list(
        part="snippet",
        q=query,
        type="video",
        maxResults=_SEARCH_POOL_SIZE,
        order="relevance",
        regionCode="US",
        relevanceLanguage="en",
    ).execute()
    items = search_resp.get("items", [])
    if not items:
        return {"results": [], "cohort": {"query": query, "size_bracket": get_size_bracket(my_subscribers)}}

    video_ids   = [it["id"]["videoId"] for it in items if it.get("id", {}).get("videoId")]
    channel_ids = list({it["snippet"]["channelId"] for it in items if it.get("snippet", {}).get("channelId")})

    # 2. Fetch stats + channel subscriber counts in parallel.
    with ThreadPoolExecutor(max_workers=2) as pool:
        v_future = pool.submit(_batch_video_details, youtube, video_ids)
        c_future = pool.submit(_batch_channel_subs, youtube, channel_ids)
        videos_by_id      = v_future.result()
        subs_by_channel   = c_future.result()

    # 3. Attach channel subs to each video, drop entries below the view floor.
    enriched = []
    for vid_id in video_ids:
        v = videos_by_id.get(vid_id)
        if not v:
            continue
        if v["views"] < _MIN_VIDEO_VIEWS:
            continue
        v["channel_subscribers"] = subs_by_channel.get(v["channel_id"], 0)
        enriched.append(v)

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


def _batch_video_details(youtube, video_ids: list[str]) -> dict[str, dict]:
    if not video_ids:
        return {}
    out: dict[str, dict] = {}
    # videos.list caps at 50 IDs per call
    for i in range(0, len(video_ids), 50):
        chunk = video_ids[i:i + 50]
        resp = youtube.videos().list(
            part="statistics,snippet,contentDetails",
            id=",".join(chunk),
        ).execute()
        for item in resp.get("items", []):
            s  = item.get("statistics", {})
            sn = item.get("snippet", {})
            cd = item.get("contentDetails", {})
            thumbs = sn.get("thumbnails", {})
            thumb_url = (thumbs.get("high") or thumbs.get("medium") or thumbs.get("default") or {}).get("url", "")
            out[item["id"]] = {
                "video_id":      item["id"],
                "title":         sn.get("title", ""),
                "channel_id":    sn.get("channelId", ""),
                "channel_name":  sn.get("channelTitle", ""),
                "published_at":  sn.get("publishedAt", ""),
                "views":         int(s.get("viewCount", 0)),
                "likes":         int(s.get("likeCount", 0)),
                "comments":      int(s.get("commentCount", 0)),
                "duration_seconds": parse_duration_seconds(cd.get("duration", "PT0S")),
                "thumbnail":     thumb_url,
                "description":   (sn.get("description") or "")[:200],
            }
    return out


def _batch_channel_subs(youtube, channel_ids: list[str]) -> dict[str, int]:
    if not channel_ids:
        return {}
    out: dict[str, int] = {}
    for i in range(0, len(channel_ids), 50):
        chunk = channel_ids[i:i + 50]
        resp = youtube.channels().list(
            part="statistics",
            id=",".join(chunk),
        ).execute()
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

def _search_channel_outliers(creds, query: str, my_subscribers: int) -> dict:
    youtube = build_youtube_client(creds)

    # 1. Search channels by keyword.
    search_resp = youtube.search().list(
        part="snippet",
        q=query,
        type="channel",
        maxResults=25,
        order="relevance",
        regionCode="US",
        relevanceLanguage="en",
    ).execute()
    ids = [it["snippet"]["channelId"] for it in search_resp.get("items", []) if it.get("snippet", {}).get("channelId")]
    if not ids:
        return {"results": [], "cohort": {"query": query, "size_bracket": get_size_bracket(my_subscribers)}}

    # 2. Hydrate each channel with stats + snippet.
    channels: list[dict] = []
    for i in range(0, len(ids), 50):
        chunk = ids[i:i + 50]
        resp = youtube.channels().list(part="snippet,statistics", id=",".join(chunk)).execute()
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
