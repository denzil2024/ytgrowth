"""Public (no-auth) endpoints — used by the landing page."""

import os
import time
import requests as _req
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()

# Channel handles in display order
_HANDLES = [
    "Sophiology", "dallinandbella2", "maxtabakin", "FatimaBah",
    "Mizchinny_", "FounderDiariesPodcast", "iamcoreymcclain",
    "CardinalMason", "imjaydengarcia", "BeingBenitah",
]
_COLORS = [
    "#e5251b", "#d97706", "#0a84ff", "#16a34a", "#7c3aed",
    "#0a84ff", "#16a34a", "#e5251b", "#d97706", "#7c3aed",
]

_cache: dict = {"data": None, "ts": 0.0}
_TTL = 86_400  # 24 hours


def _fmt_subs(n: int) -> str:
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n / 1_000:.0f}K"
    return str(n) if n else ""


def _fetch_channel(handle: str, color: str, key: str) -> dict | None:
    try:
        r = _req.get(
            "https://www.googleapis.com/youtube/v3/channels",
            params={"part": "snippet,statistics", "forHandle": handle, "key": key},
            timeout=6,
        )
        items = r.json().get("items", [])
        if not items:
            return None
        item = items[0]
        s = item["snippet"]
        stats = item.get("statistics", {})
        thumbs = s.get("thumbnails", {})
        avatar = (
            (thumbs.get("medium") or thumbs.get("high") or thumbs.get("default") or {})
            .get("url", "")
        )
        subs = int(stats.get("subscriberCount", 0))
        return {
            "name":      s.get("title", handle),
            "handle":    "@" + s.get("customUrl", handle).lstrip("@"),
            "avatar":    avatar,
            "subscribers": subs,
            "subsLabel": _fmt_subs(subs),
            "color":     color,
        }
    except Exception as e:
        print(f"[featured_creators] @{handle}: {e}")
        return None


@router.get("/featured-creators")
def featured_creators():
    now = time.time()
    if _cache["data"] is not None and (now - _cache["ts"]) < _TTL:
        return JSONResponse(_cache["data"])

    key = os.environ.get("YOUTUBE_API_KEY", "")
    if not key:
        return JSONResponse([])

    results = [_fetch_channel(h, c, key) for h, c in zip(_HANDLES, _COLORS)]
    creators = [r for r in results if r]
    _cache["data"] = creators
    _cache["ts"] = now
    return JSONResponse(creators)
