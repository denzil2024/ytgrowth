"""Public YouTube channel stats lookup. Backs the free /tools/youtube-channel-stats-checker
front-end. Read-only — uses the server-side YOUTUBE_API_KEY against YouTube
Data API v3 channels/videos endpoints. Cheap (3 quota units per lookup) and
results are cached in-memory for an hour so repeat lookups don't burn quota.
"""

import os
import re
import time
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

router = APIRouter()

# In-memory cache. Key = "kind:value" (e.g. "handle:@mrbeast"), value = (timestamp, payload)
_CACHE: dict[str, tuple[float, dict]] = {}
_CACHE_TTL = 3600  # 1 hour
_CACHE_MAX = 500   # rough cap so the dict doesn't grow forever


def _parse_input(raw: str):
    """Returns (kind, value) where kind in {'id', 'handle'} or (None, None) if unparseable.
    We support: full youtube URLs (channel/UC.../@handle/c/.../user/...), bare @handles,
    bare channel IDs, and bare names (treated as handles).
    Custom /c/ and /user/ URLs are coerced to handle form for the API call.
    """
    s = (raw or "").strip()
    if not s:
        return (None, None)

    # Bare channel ID — UC + 22 chars (24 total)
    if re.fullmatch(r"UC[\w-]{22}", s):
        return ("id", s)

    # Bare @handle
    if s.startswith("@"):
        return ("handle", s)

    # Full URL with /channel/UC...
    m = re.search(r"youtube\.com/channel/(UC[\w-]{22})", s)
    if m:
        return ("id", m.group(1))

    # Full URL with /@handle
    m = re.search(r"youtube\.com/(@[\w.\-]+)", s)
    if m:
        return ("handle", m.group(1))

    # Full URL with /c/customname or /user/oldusername — both treated as handles
    m = re.search(r"youtube\.com/(?:c|user)/([\w.\-]+)", s)
    if m:
        return ("handle", "@" + m.group(1))

    # Bare name with no special chars — assume it's a handle
    if re.fullmatch(r"[\w.\-]{2,64}", s):
        return ("handle", "@" + s)

    return (None, None)


def _cache_get(key: str):
    hit = _CACHE.get(key)
    if not hit:
        return None
    ts, payload = hit
    if time.time() - ts > _CACHE_TTL:
        _CACHE.pop(key, None)
        return None
    return payload


def _cache_put(key: str, payload: dict):
    if len(_CACHE) >= _CACHE_MAX:
        # Evict oldest
        oldest = min(_CACHE.items(), key=lambda kv: kv[1][0])[0]
        _CACHE.pop(oldest, None)
    _CACHE[key] = (time.time(), payload)


def _fmt_iso(iso: str) -> str:
    return iso or ""


@router.get("/lookup")
def lookup(q: str = Query(..., min_length=1, max_length=200)):
    """Look up a YouTube channel by URL, @handle, or channel ID."""
    api_key = os.getenv("YOUTUBE_API_KEY", "")
    if not api_key:
        return JSONResponse({"error": "YouTube API not configured"}, status_code=503)

    kind, value = _parse_input(q)
    if not kind:
        return JSONResponse(
            {"error": "Couldn't read that. Try a URL like youtube.com/@channel or youtube.com/channel/UC..."},
            status_code=400,
        )

    cache_key = f"{kind}:{value}"
    cached = _cache_get(cache_key)
    if cached:
        return cached

    try:
        from googleapiclient.discovery import build
        yt = build("youtube", "v3", developerKey=api_key, cache_discovery=False)

        # Resolve the channel
        if kind == "id":
            req = yt.channels().list(part="snippet,statistics,contentDetails", id=value)
        else:  # handle
            req = yt.channels().list(part="snippet,statistics,contentDetails", forHandle=value)

        resp = req.execute()
        items = resp.get("items", [])
        if not items:
            return JSONResponse({"error": "No channel found at that URL or handle."}, status_code=404)

        ch = items[0]
        snip = ch.get("snippet", {})
        stats = ch.get("statistics", {})
        content = ch.get("contentDetails", {})

        # Recent uploads
        uploads_id = content.get("relatedPlaylists", {}).get("uploads", "")
        recent_videos: list[dict] = []
        if uploads_id:
            try:
                pl = yt.playlistItems().list(
                    part="contentDetails",
                    playlistId=uploads_id,
                    maxResults=10,
                ).execute()
                video_ids = [it["contentDetails"]["videoId"] for it in pl.get("items", []) if it.get("contentDetails", {}).get("videoId")]
                if video_ids:
                    v_resp = yt.videos().list(
                        part="snippet,statistics,contentDetails",
                        id=",".join(video_ids),
                    ).execute()
                    for v in v_resp.get("items", []):
                        v_snip = v.get("snippet", {})
                        v_stats = v.get("statistics", {})
                        thumbs = v_snip.get("thumbnails", {})
                        recent_videos.append({
                            "id":           v["id"],
                            "title":        v_snip.get("title", ""),
                            "thumbnail":    (thumbs.get("medium") or thumbs.get("high") or thumbs.get("default") or {}).get("url", ""),
                            "published_at": v_snip.get("publishedAt", ""),
                            "views":        int(v_stats.get("viewCount", 0)),
                            "likes":        int(v_stats.get("likeCount", 0)),
                            "comments":     int(v_stats.get("commentCount", 0)),
                            "duration":     v.get("contentDetails", {}).get("duration", ""),
                        })
            except Exception as _e:
                print(f"[channel_stats] uploads fetch failed: {_e}")

        thumbs = snip.get("thumbnails", {})
        result = {
            "channel": {
                "id":            ch.get("id", ""),
                "title":         snip.get("title", ""),
                "handle":        snip.get("customUrl", ""),
                "description":   (snip.get("description", "") or "")[:500],
                "thumbnail":     (thumbs.get("medium") or thumbs.get("default") or {}).get("url", ""),
                "country":       snip.get("country", ""),
                "published_at":  _fmt_iso(snip.get("publishedAt", "")),
                "subscribers":   int(stats.get("subscriberCount", 0)),
                "subscriberHidden": bool(stats.get("hiddenSubscriberCount", False)),
                "total_views":   int(stats.get("viewCount", 0)),
                "video_count":   int(stats.get("videoCount", 0)),
            },
            "recent_videos": recent_videos,
            "fetched_at":    int(time.time()),
        }

        _cache_put(cache_key, result)
        return result

    except Exception as e:
        # Surface a sane error without leaking the API key
        msg = str(e)
        if "quotaExceeded" in msg or "quota" in msg.lower():
            return JSONResponse({"error": "Lookup quota reached for the day. Try again tomorrow."}, status_code=429)
        if "keyInvalid" in msg or "API key not valid" in msg:
            return JSONResponse({"error": "API misconfigured. Email support."}, status_code=503)
        print(f"[channel_stats] error: {e}")
        return JSONResponse({"error": "Couldn't fetch channel stats. Try a different URL or handle."}, status_code=500)
