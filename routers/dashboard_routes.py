"""Dashboard backend — feeds the niche outlier hero card on the Overview tab.

GET /dashboard/niche-outlier
  Returns the "winning in your niche this week" pick computed for THIS
  creator. Runs the same app.outliers.search_outliers pipeline the paid
  Outliers feature uses, with the creator's REAL channel_id, REAL sub
  count, and niche keywords pulled from their own channel + recent titles.

  Cache: one row per channel_id, TTL 7 days. On first load we kick off a
  background refresh and tell the frontend to poll. On subsequent loads
  we serve the cached row instantly. On TTL expiry we serve the stale
  row and kick a background refresh.

GET /dashboard/personalize-angle
  Cheap Haiku pass that rewrites the cached angle in the creator's voice.

GET /dashboard/refresh-niche-outliers  (admin only)
  Forces an on-demand refresh for the signed-in admin's channel. Used for
  manual QA when output looks off.
"""
from __future__ import annotations

import threading

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.niche_outliers import (
    get_for_channel,
    get_from_outliers_cache,
    get_outlier_bundle_from_cache,
    refresh_for_channel,
    run_free_peek_for_channel,
    is_stale,
    personalize_angle,
)
from routers.auth import get_session
from routers.admin_routes import _is_admin


router = APIRouter()


# Per-channel refresh locks. One in-flight refresh per channel; subsequent
# polls from the same user during the refresh just see the "generating"
# state. Keys live in memory; multi-worker setups can spawn one job per
# channel per worker, still bounded.
_refresh_locks: dict[str, threading.Lock] = {}
_refresh_inflight: set[str] = set()


def _try_kickoff_refresh(channel_id: str, channel: dict, videos: list) -> bool:
    """Returns True if this call started a refresh, False if one is already
    in flight. Safe to call from a request hot path: spawns a thread,
    returns immediately."""
    if not channel_id:
        return False
    lock = _refresh_locks.setdefault(channel_id, threading.Lock())
    if not lock.acquire(blocking=False):
        return False
    try:
        if channel_id in _refresh_inflight:
            return False
        _refresh_inflight.add(channel_id)
    finally:
        lock.release()

    def _runner():
        try:
            refresh_for_channel(channel_id, channel, videos)
        except Exception as e:
            print(f"[dashboard] lazy refresh failed for {channel_id}: {e}")
        finally:
            _refresh_inflight.discard(channel_id)

    threading.Thread(target=_runner, name=f"channel-refresh-{channel_id[:10]}", daemon=True).start()
    return True


def _try_kickoff_free_peek(channel_id: str, channel: dict, videos: list) -> bool:
    """One-shot free auto-peek. Runs search_outliers in videos_only mode
    (single Claude call, zero credits charged) and writes the result to
    OutliersSearchCache so subsequent dashboard loads hydrate the card."""
    if not channel_id:
        return False
    lock = _refresh_locks.setdefault(f"peek:{channel_id}", threading.Lock())
    if not lock.acquire(blocking=False):
        return False
    try:
        key = f"peek:{channel_id}"
        if key in _refresh_inflight:
            return False
        _refresh_inflight.add(key)
    finally:
        lock.release()

    def _runner():
        try:
            run_free_peek_for_channel(channel_id, channel, videos)
        except Exception as e:
            print(f"[dashboard] free_peek failed for {channel_id}: {e}")
        finally:
            _refresh_inflight.discard(f"peek:{channel_id}")

    threading.Thread(target=_runner, name=f"free-peek-{channel_id[:10]}", daemon=True).start()
    return True


@router.get("/niche-outlier")
def niche_outlier(request: Request):
    """Returns the signed-in creator's niche outlier card. If no cached row
    exists yet, kicks off a refresh and returns {ok: false, reason:
    generating_now} so the frontend can poll. If a row exists but is past
    its TTL, returns the stale row immediately AND kicks a refresh in the
    background — UI never blocks once a creator has been seeded."""
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"ok": False, "reason": "not_authenticated"}, status_code=401)

    channel = (data or {}).get("channel", {}) or {}
    videos  = (data or {}).get("videos",  []) or []
    channel_id = channel.get("channel_id") or ""

    if not channel_id:
        return JSONResponse({"ok": False, "reason": "no_channel"})

    # Preferred source: the user's own Outliers search result. Return the
    # FULL multi-signal bundle (videos / thumbnails / channels) so the
    # frontend can power the interactive pill + pager UI from one fetch.
    bundle = get_outlier_bundle_from_cache(channel_id)
    if bundle:
        return JSONResponse({
            "ok":      True,
            "creator": channel.get("channel_name") or "",
            "source":  "outliers_cache",
            "bundle":  bundle,
        })

    # Legacy single-pick fallback: an old auto-pick row from the (flawed)
    # one-word seed pipeline. Returned in the old shape so users who already
    # have a ChannelNicheOutlierCache row still see something, but no new
    # rows are written and the frontend renders this as a legacy single-card.
    payload = get_for_channel(channel_id)
    if payload:
        if is_stale(payload):
            _try_kickoff_refresh(channel_id, channel, videos)
        return JSONResponse({
            "ok":      True,
            "niche":   payload.get("niche") or "",
            "creator": channel.get("channel_name") or "",
            "source":  "auto_pick",
            "outlier": payload,
        })

    # No cache yet. Kick off the free peek (1 Claude call, 0 credits) in the
    # background, tell the frontend to poll. Next poll lands in the
    # outliers_cache branch above.
    peek_key = f"peek:{channel_id}"
    started = _try_kickoff_free_peek(channel_id, channel, videos)
    if started or peek_key in _refresh_inflight:
        return JSONResponse({
            "ok":      False,
            "reason":  "generating_now",
            "creator": channel.get("channel_name") or "",
            "eta_sec": 30,
        })

    return JSONResponse({
        "ok":      False,
        "reason":  "no_outliers_yet",
        "creator": channel.get("channel_name") or "",
    })


@router.get("/personalize-angle")
def personalize_angle_endpoint(request: Request):
    """Returns an angle tailored to the signed-in creator's channel context.
    Reads the per-channel cache. Falls back to the base angle if Haiku is
    unavailable. Frontend caches client-side for a week."""
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"ok": False, "reason": "not_authenticated"}, status_code=401)

    channel = (data or {}).get("channel", {}) or {}
    videos  = (data or {}).get("videos",  []) or []
    channel_id      = channel.get("channel_id") or ""
    channel_keywords = channel.get("keywords") or ""
    channel_title    = channel.get("channel_name") or channel.get("title") or ""
    recent_titles    = [v.get("title", "") for v in videos[:10] if v.get("title")]

    if not channel_id:
        return JSONResponse({"ok": False, "reason": "no_channel"})

    base = get_for_channel(channel_id)
    if not base:
        return JSONResponse({"ok": False, "reason": "no_cache_yet"})

    custom = personalize_angle(channel_id, channel_title, channel_keywords, recent_titles)
    return JSONResponse({
        "ok":      True,
        "niche":   base.get("niche") or "",
        "angle":   (custom or {}).get("angle") or base.get("angle_template"),
        "angle_reasoning": (custom or {}).get("angle_reasoning") or base.get("angle_reasoning") or "",
        "keyword": (custom or {}).get("keyword") or base.get("angle_keyword") or "",
        "personalized": bool(custom),
    })


@router.get("/refresh-niche-outliers")
def refresh_niche_outliers(request: Request):
    """Admin-only on-demand refresh for the signed-in admin's own channel.
    Useful for QA after tuning prompts."""
    is_admin, _ = _is_admin(request)
    if not is_admin:
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"ok": False, "reason": "not_authenticated"}, status_code=401)

    channel = (data or {}).get("channel", {}) or {}
    videos  = (data or {}).get("videos",  []) or []
    channel_id = channel.get("channel_id") or ""
    if not channel_id:
        return JSONResponse({"ok": False, "reason": "no_channel"})

    result = refresh_for_channel(channel_id, channel, videos)
    if not result:
        return JSONResponse({"ok": False, "reason": "refresh_failed"})
    return JSONResponse({"ok": True, "outlier": result})
