"""
Lightweight per-video lookup powering the Chrome extension panel on
youtube.com/watch pages. Designed for high-frequency calls (every video
the user opens), so it must be FAST and FREE:

  - No Claude calls. SEO score is a pure heuristic.
  - No user-credit deduction. Free as long as the user is logged in.
  - 1 YouTube Data API unit per uncached lookup (videos.list).
  - In-memory TTL cache so opening the same video twice in 10 minutes
    is a single API call.

Returned shape is intentionally compact so the extension can render the
panel in a single render pass without follow-up requests.
"""

import os
import time
from typing import Optional

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from routers.auth import get_session

router = APIRouter()


# ── In-memory cache (per-process). Good enough for v0; can move to
# Redis/DB if we ever run multiple workers and the duplication starts
# costing meaningful YouTube quota.
_VIDEO_CACHE: dict[str, tuple[float, dict]] = {}
_CACHE_TTL_SEC = 600  # 10 minutes


def _yt_client():
    api_key = os.getenv("YOUTUBE_API_KEY", "")
    if not api_key:
        return None
    from googleapiclient.discovery import build
    return build("youtube", "v3", developerKey=api_key, cache_discovery=False)


def _parse_iso8601_duration(s: str) -> int:
    """Parses YouTube's PT#H#M#S into total seconds. Defensive on bad input."""
    if not s or not s.startswith("PT"):
        return 0
    s = s[2:]
    total = 0
    num = ""
    for ch in s:
        if ch.isdigit():
            num += ch
        elif ch == "H":
            total += int(num or 0) * 3600
            num = ""
        elif ch == "M":
            total += int(num or 0) * 60
            num = ""
        elif ch == "S":
            total += int(num or 0)
            num = ""
        else:
            num = ""
    return total


def _hours_since(iso_published: str) -> float:
    """Hours between video publish and now. Returns 0 if parsing fails."""
    if not iso_published:
        return 0.0
    try:
        from datetime import datetime, timezone
        pub = datetime.fromisoformat(iso_published.replace("Z", "+00:00"))
        delta = datetime.now(timezone.utc) - pub
        return max(0.0, delta.total_seconds() / 3600.0)
    except Exception:
        return 0.0


def _seo_score(title: str, description: str, tags: list[str], engagement_pct: float) -> tuple[int, str]:
    """Heuristic SEO score 0-100 with a one-line summary.

    Weights: title length 20, description length 25, tag presence/quality
    35, engagement 20. Tuned so a video with 60-char title, 250-word
    description, 12 tags, and 4% engagement scores ~85.
    """
    score = 0
    notes = []

    # Title: 50-70 chars is the sweet spot for search + thumbnail truncation.
    tlen = len(title or "")
    if 50 <= tlen <= 70:
        score += 20
    elif 40 <= tlen < 50 or 70 < tlen <= 80:
        score += 14
    elif tlen >= 30:
        score += 8
    else:
        notes.append("title too short")

    # Description: longer = more keyword surface area. 250+ words is solid.
    dlen_words = len((description or "").split())
    if dlen_words >= 250:
        score += 25
    elif dlen_words >= 150:
        score += 18
    elif dlen_words >= 50:
        score += 10
    else:
        notes.append("thin description")

    # Tags: presence + count. 8-20 tags is the productive band.
    tcount = len(tags or [])
    if 8 <= tcount <= 20:
        score += 35
    elif 4 <= tcount < 8 or 20 < tcount <= 30:
        score += 24
    elif tcount > 0:
        score += 12
        notes.append("few tags")
    else:
        notes.append("no tags")

    # Engagement signal — viewers liking/commenting tells YouTube the
    # content delivers. Anything above 4% is genuinely strong.
    if engagement_pct >= 4.0:
        score += 20
    elif engagement_pct >= 2.0:
        score += 14
    elif engagement_pct >= 1.0:
        score += 8

    score = max(0, min(100, score))

    if score >= 85:
        summary = "Excellent foundation"
    elif score >= 70:
        summary = "Solid setup"
    elif score >= 55:
        summary = "Decent, room to improve"
    elif score >= 40:
        summary = "Needs work"
    else:
        summary = "Significant gaps"
    if notes:
        summary += f" ({', '.join(notes[:2])})"

    return score, summary


def _est_revenue(view_count: int, category_id: str) -> tuple[float, float]:
    """Returns (low, high) revenue estimate in USD. Wide range on purpose:
    real RPM varies hugely by niche, geography, season, and AdSense rates.
    Better to show a defensible range than a fake-precise single number."""
    # RPM ranges by broad category. These are reasonable mid-2025 ballparks.
    # YouTube takes 45%, so creator's share is what we surface.
    rpm_by_cat = {
        "27": (3.0, 12.0),  # Education
        "28": (4.0, 15.0),  # Science & Tech
        "26": (2.0, 8.0),   # Howto & Style
        "25": (1.5, 6.0),   # News & Politics
        "20": (1.0, 4.0),   # Gaming
        "10": (0.8, 3.5),   # Music
        "22": (1.0, 4.0),   # People & Blogs
        "24": (0.8, 3.0),   # Entertainment
        "23": (0.8, 3.0),   # Comedy
        "17": (1.0, 4.0),   # Sports
        "19": (1.5, 5.5),   # Travel & Events
        "1":  (1.0, 4.0),   # Film & Animation
    }
    low_rpm, high_rpm = rpm_by_cat.get(category_id or "", (1.0, 5.0))
    low  = view_count / 1000.0 * low_rpm
    high = view_count / 1000.0 * high_rpm
    return round(low, 2), round(high, 2)


def _build_video_payload(item: dict) -> dict:
    snippet  = item.get("snippet") or {}
    stats    = item.get("statistics") or {}
    details  = item.get("contentDetails") or {}

    title       = snippet.get("title") or ""
    description = snippet.get("description") or ""
    tags        = snippet.get("tags") or []
    cat_id      = snippet.get("categoryId") or ""
    channel     = snippet.get("channelTitle") or ""
    channel_id  = snippet.get("channelId") or ""
    published   = snippet.get("publishedAt") or ""

    views  = int(stats.get("viewCount")    or 0)
    likes  = int(stats.get("likeCount")    or 0)
    comms  = int(stats.get("commentCount") or 0)

    engagement_pct = ((likes + comms) / views * 100.0) if views > 0 else 0.0
    hours          = _hours_since(published)
    vph            = (views / hours) if hours > 0 else 0.0
    duration_sec   = _parse_iso8601_duration(details.get("duration") or "")

    score, score_summary = _seo_score(title, description, tags, engagement_pct)
    rev_low, rev_high    = _est_revenue(views, cat_id)

    return {
        "video_id":         item.get("id") or "",
        "title":            title,
        "channel_title":    channel,
        "channel_id":       channel_id,
        "published_at":     published,
        "duration_sec":     duration_sec,
        "view_count":       views,
        "like_count":       likes,
        "comment_count":    comms,
        "tag_count":        len(tags),
        "tags":             tags,
        "views_per_hour":   round(vph, 1),
        "engagement_pct":   round(engagement_pct, 2),
        "seo_score":        score,
        "seo_summary":      score_summary,
        "est_revenue_low":  rev_low,
        "est_revenue_high": rev_high,
        "category_id":      cat_id,
    }


def _cache_get(video_id: str) -> Optional[dict]:
    row = _VIDEO_CACHE.get(video_id)
    if not row:
        return None
    fetched_at, payload = row
    if time.time() - fetched_at > _CACHE_TTL_SEC:
        _VIDEO_CACHE.pop(video_id, None)
        return None
    return payload


def _cache_put(video_id: str, payload: dict):
    _VIDEO_CACHE[video_id] = (time.time(), payload)


@router.get("/video/{video_id}")
def get_video(video_id: str, request: Request):
    """Returns lightweight insights for a YouTube video. Used by the
    Chrome extension panel on watch pages. Auth-gated to logged-in users
    so we don't get hammered as a public proxy.
    """
    # Reject obvious garbage video IDs cheaply.
    if not video_id or len(video_id) < 5 or len(video_id) > 32:
        return JSONResponse({"error": "invalid video_id"}, status_code=400)

    data, _creds = get_session(request.session.get("session_id"))
    if not data:
        # Distinct status so the extension can render a "Sign in to YTGrowth"
        # CTA rather than a generic error.
        return JSONResponse({"error": "not_authenticated"}, status_code=401)

    cached = _cache_get(video_id)
    if cached:
        return JSONResponse({"ok": True, "cached": True, "video": cached})

    yt = _yt_client()
    if yt is None:
        return JSONResponse({"error": "server_misconfig"}, status_code=500)

    try:
        resp = yt.videos().list(
            part="snippet,statistics,contentDetails",
            id=video_id,
            maxResults=1,
        ).execute()
    except Exception as e:
        print(f"[extension/video] YouTube API error for {video_id}: {e}")
        return JSONResponse({"error": "youtube_api_error"}, status_code=502)

    items = resp.get("items") or []
    if not items:
        return JSONResponse({"error": "video_not_found"}, status_code=404)

    payload = _build_video_payload(items[0])
    _cache_put(video_id, payload)
    return JSONResponse({"ok": True, "cached": False, "video": payload})


@router.get("/ping")
def ping(request: Request):
    """Cheap auth check the extension uses on load to decide whether
    to show signed-in features or a sign-in CTA."""
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"authenticated": False})
    ch = (data or {}).get("channel", {}) or {}
    return JSONResponse({
        "authenticated": True,
        "channel_title": ch.get("channel_name") or ch.get("title") or "",
    })
