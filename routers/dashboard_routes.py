"""Dashboard backend — feeds the hero card on the Overview tab.

GET /dashboard/niche-outlier
  Returns the current "winning in your niche this week" pick for the
  signed-in creator's inferred niche. Cached server-side (one row per
  niche, refreshed weekly), so this is a single DB read with no Claude
  or YouTube calls in the hot path.

POST /dashboard/refresh-niche-outliers  (admin only)
  Triggers an on-demand refresh of one niche or all niches. Useful for
  the first seed of the cache and for manual reruns when output looks off.
"""
from __future__ import annotations

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.niche_outliers import (
    get_for_niche,
    infer_niche,
    refresh_niche,
    refresh_all_niches,
)
from routers.auth import get_session
from routers.admin_routes import _is_admin


router = APIRouter()


@router.get("/niche-outlier")
def niche_outlier(request: Request):
    """Returns the user's niche outlier card payload, plus the niche we
    inferred so the frontend can show "Detected niche: tech". Falls back
    to {ok: false, reason: ...} when nothing's cached yet, so the
    frontend can render a graceful empty state instead of a 404."""
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"ok": False, "reason": "not_authenticated"}, status_code=401)

    channel = (data or {}).get("channel", {}) or {}
    videos  = (data or {}).get("videos",  []) or []

    channel_keywords = channel.get("keywords") or ""
    channel_title    = channel.get("channel_name") or channel.get("title") or ""
    recent_titles    = [v.get("title", "") for v in videos[:10] if v.get("title")]

    niche = infer_niche(channel_keywords, channel_title, recent_titles)
    payload = get_for_niche(niche)
    if not payload:
        return JSONResponse({
            "ok":         False,
            "reason":     "no_cache_yet",
            "niche":      niche,
            "creator":    channel.get("channel_name") or "",
        })

    return JSONResponse({
        "ok":      True,
        "niche":   niche,
        "creator": channel.get("channel_name") or "",
        "outlier": payload,
    })


@router.post("/refresh-niche-outliers")
def refresh_niche_outliers(request: Request, niche: str | None = None):
    """Admin-only on-demand refresh. Pass ?niche=tech to refresh one
    category; omit to refresh all 14. Useful for the initial seed and
    for re-runs after tuning the Haiku prompt."""
    is_admin, _ = _is_admin(request)
    if not is_admin:
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    if niche:
        result = refresh_niche(niche)
        if not result:
            return JSONResponse({"ok": False, "niche": niche, "reason": "refresh_failed"})
        return JSONResponse({"ok": True, "niche": niche, "outlier": result})

    refreshed = refresh_all_niches()
    return JSONResponse({"ok": True, "refreshed_count": refreshed})
