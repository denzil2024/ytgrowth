"""Dashboard backend — feeds the hero card on the Overview tab.

GET /dashboard/niche-outlier
  Returns the current "winning in your niche this week" pick for the
  signed-in creator's inferred niche. Cached server-side (one row per
  niche, refreshed weekly), so this is a single DB read with no Claude
  or YouTube calls in the hot path.

  Lazy-generation: if the cache is empty for the inferred niche, kicks
  off a background refresh once (per-niche lock) and returns a "generating"
  status so the frontend can poll until it's ready. No manual seed needed.

POST /dashboard/refresh-niche-outliers  (admin only)
  Triggers an on-demand refresh of one niche or all niches. Useful for
  the first seed of the cache and for manual reruns when output looks off.
"""
from __future__ import annotations

import threading

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.niche_outliers import (
    get_for_niche,
    infer_niche,
    refresh_niche,
    refresh_all_niches,
    personalize_angle,
)
from routers.auth import get_session
from routers.admin_routes import _is_admin


router = APIRouter()


# Per-niche refresh locks. A niche only gets one in-flight refresh at a
# time even when multiple creators in the same niche hit the dashboard
# simultaneously. Keys live in memory; on multi-worker setups this just
# means each worker can spawn one job per niche, which is still bounded.
_refresh_locks: dict[str, threading.Lock] = {}
_refresh_inflight: set[str] = set()


def _try_kickoff_refresh(niche: str) -> bool:
    """Returns True if this call started a refresh, False if one is already in
    flight or the lock couldn't be acquired. Safe to call from a request hot
    path: spawns a thread, returns immediately."""
    lock = _refresh_locks.setdefault(niche, threading.Lock())
    if not lock.acquire(blocking=False):
        return False
    try:
        if niche in _refresh_inflight:
            return False
        _refresh_inflight.add(niche)
    finally:
        lock.release()

    def _runner():
        try:
            refresh_niche(niche)
        except Exception as e:
            print(f"[dashboard] lazy refresh failed for {niche}: {e}")
        finally:
            _refresh_inflight.discard(niche)

    threading.Thread(target=_runner, name=f"niche-refresh-{niche}", daemon=True).start()
    return True


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
        # Lazy generation: kick off a refresh in the background, tell the
        # frontend to poll. Subsequent dashboard loads pick up the cached
        # result. No user-visible "Warming up" dead end.
        started = _try_kickoff_refresh(niche)
        return JSONResponse({
            "ok":      False,
            "reason":  "generating_now" if started or niche in _refresh_inflight else "generation_failed",
            "niche":   niche,
            "creator": channel.get("channel_name") or "",
            "eta_sec": 30,
        })

    return JSONResponse({
        "ok":      True,
        "niche":   niche,
        "creator": channel.get("channel_name") or "",
        "outlier": payload,
    })


@router.get("/personalize-angle")
def personalize_angle_endpoint(request: Request):
    """Returns an angle tailored to the signed-in creator's channel context.
    Falls back to the niche's generic angle template if Haiku is unavailable.
    Cheap (~$0.005/call). Frontend caches the result client-side for a week
    so this only runs once per user per niche-refresh cycle."""
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"ok": False, "reason": "not_authenticated"}, status_code=401)

    channel = (data or {}).get("channel", {}) or {}
    videos  = (data or {}).get("videos",  []) or []
    channel_keywords = channel.get("keywords") or ""
    channel_title    = channel.get("channel_name") or channel.get("title") or ""
    recent_titles    = [v.get("title", "") for v in videos[:10] if v.get("title")]

    niche = infer_niche(channel_keywords, channel_title, recent_titles)
    base = get_for_niche(niche)
    if not base:
        return JSONResponse({"ok": False, "reason": "no_cache_yet", "niche": niche})

    custom = personalize_angle(niche, channel_title, channel_keywords, recent_titles)
    return JSONResponse({
        "ok":      True,
        "niche":   niche,
        "angle":   (custom or {}).get("angle") or base.get("angle_template"),
        "angle_reasoning": (custom or {}).get("angle_reasoning") or base.get("angle_reasoning") or "",
        "keyword": (custom or {}).get("keyword") or base.get("angle_keyword") or "",
        "personalized": bool(custom),
    })


@router.get("/refresh-niche-outliers")
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
