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

import datetime
import json
import time

from app.niche_outliers import (
    get_for_channel,
    get_from_outliers_cache,
    get_outlier_bundle_from_cache,
    refresh_for_channel,
    run_free_peek_for_channel,
    is_stale,
    personalize_angle,
)
from database.models import SessionLocal, SeoOptimization, CompetitorAnalysisCache, CompetitorActivityCache
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


# ── Tracked Optimization Lift ─────────────────────────────────────────────
# Proof loop: surfaces the user's best post-SEO-update win to the Feed.
# Reads SeoOptimization rows where current_views meaningfully exceeds
# before_views and the change is at least a few days old (so impact has
# time to accumulate). Lazily refreshes stale rows from the YouTube API,
# matching the /seo/optimizations behavior so the two surfaces agree.

def _as_utc(dt):
    if dt is None:
        return datetime.datetime.min.replace(tzinfo=datetime.timezone.utc)
    if dt.tzinfo is None:
        return dt.replace(tzinfo=datetime.timezone.utc)
    return dt


@router.get("/tracked-lift")
def tracked_lift(request: Request):
    """
    Returns the user's best SEO Optimizer win (if any), plus a count of
    other meaningful wins. A "win" = current views >= before + 50 AND the
    update was at least 4 days ago (some time for impact to show).
    """
    data, creds = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)
    channel_id = (data or {}).get("channel", {}).get("channel_id", "") or (data or {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"top": None, "count": 0})

    db = SessionLocal()
    try:
        # All optimizations for the channel, newest first. Cap to a
        # reasonable window so the lazy-refresh stays cheap.
        rows = (
            db.query(SeoOptimization)
              .filter_by(channel_id=channel_id)
              .order_by(SeoOptimization.optimized_at.desc())
              .limit(30)
              .all()
        )
        if not rows:
            return JSONResponse({"top": None, "count": 0})

        # Only consider rows that are >= 4 days old. Younger changes don't
        # have enough watch time to prove anything.
        now = datetime.datetime.now(datetime.timezone.utc)
        min_age = now - datetime.timedelta(days=4)
        eligible = [r for r in rows if _as_utc(r.optimized_at) <= min_age]
        if not eligible:
            return JSONResponse({"top": None, "count": 0})

        # Lazy refresh stale rows (>6h old). Same pattern as /seo/optimizations.
        stale_cutoff = now - datetime.timedelta(hours=6)
        stale_rows = [r for r in eligible if _as_utc(r.stats_refreshed_at) < stale_cutoff]
        if stale_rows and creds:
            try:
                from googleapiclient.discovery import build
                youtube = build("youtube", "v3", credentials=creds)
                stale_ids = [r.video_id for r in stale_rows]
                for i in range(0, len(stale_ids), 50):
                    batch = stale_ids[i:i+50]
                    resp = youtube.videos().list(part="statistics", id=",".join(batch)).execute()
                    stats_by_id = {
                        item["id"]: item.get("statistics", {})
                        for item in resp.get("items", [])
                    }
                    for r in stale_rows:
                        if r.video_id in stats_by_id:
                            s = stats_by_id[r.video_id]
                            r.current_views    = int(s.get("viewCount", 0))
                            r.current_likes    = int(s.get("likeCount", 0))
                            r.current_comments = int(s.get("commentCount", 0))
                            r.stats_refreshed_at = now
                db.commit()
            except Exception as e:
                print(f"tracked-lift refresh error: {e}")

        # Compute wins. A win needs meaningful absolute views AND a positive
        # delta (>= +50 views or +5% whichever is larger). Title changes
        # without a thumbnail change still count as wins.
        wins = []
        for r in eligible:
            before_v = r.before_views or 0
            current_v = r.current_views or 0
            delta = current_v - before_v
            pct = (delta / before_v * 100) if before_v > 0 else 0
            threshold_abs = max(50, before_v * 0.05)
            if delta >= threshold_abs:
                wins.append({
                    "video_id": r.video_id,
                    "thumbnail_url": r.thumbnail_url,
                    "before_title": r.before_title,
                    "after_title": r.after_title,
                    "before_views": before_v,
                    "current_views": current_v,
                    "delta_views": delta,
                    "delta_pct": round(pct, 1),
                    "before_likes": r.before_likes or 0,
                    "current_likes": r.current_likes or 0,
                    "before_comments": r.before_comments or 0,
                    "current_comments": r.current_comments or 0,
                    "optimized_at": r.optimized_at.isoformat() if r.optimized_at else None,
                })

        if not wins:
            return JSONResponse({"top": None, "count": 0})

        # Rank by absolute view gain (most impressive first).
        wins.sort(key=lambda w: w["delta_views"], reverse=True)
        return JSONResponse({
            "top": wins[0],
            "count": len(wins),
        })
    finally:
        db.close()


# ── Competitor Activity ───────────────────────────────────────────────────
# Shows recent uploads from the channels this user tracks via the
# Competitors feature. Habit-forming surface: every time a competitor
# posts, this card refreshes. Reads tracked competitors from
# CompetitorAnalysisCache, then fetches each one's most recent uploads
# from the YouTube Data API, filters to the last 7 days, and returns
# the top 5 globally.
#
# Quota math per refresh: 1 channels.list (free since we derive the
# uploads playlist from channel_id) + N playlistItems.list + 1
# videos.list batch ≈ N+1 units. For 10 tracked competitors, ~11 units.
# In-memory cache with 6h TTL keeps repeat Feed mounts cheap.

# Competitor activity cache lives in the DB now (CompetitorActivityCache
# table). 24h TTL — once-a-day freshness catches every daily upload
# within a day of it going live, and same-user repeat dashboard opens
# within the day cost 0 units. DB-backed so the cache survives Railway
# restarts and active dev deploys.
_COMP_ACTIVITY_TTL = 24 * 3600  # seconds (24h)


def _uploads_playlist_from_channel_id(channel_id: str) -> str | None:
    """YouTube's documented trick: a channel's uploads playlist ID is the
    channel ID with the leading 'UC' replaced by 'UU'. Saves a
    channels.list call per competitor."""
    if not channel_id or not channel_id.startswith("UC"):
        return None
    return "UU" + channel_id[2:]


def _age_label(published_dt: datetime.datetime) -> str:
    now = datetime.datetime.now(datetime.timezone.utc)
    secs = (now - published_dt).total_seconds()
    if secs < 3600:
        m = max(1, int(secs / 60))
        return f"{m}m ago"
    if secs < 86400:
        h = int(secs / 3600)
        return f"{h}h ago"
    d = int(secs / 86400)
    return f"{d}d ago"


def _fetch_competitor_recent_uploads(creds, competitors: list[dict], lookback_days: int = 7) -> list[dict]:
    """For each competitor, fetch the most recent uploads from YouTube
    and return a flat list filtered to the lookback window, sorted by
    published_at desc."""
    if not competitors or not creds:
        return []
    try:
        from googleapiclient.discovery import build
        youtube = build("youtube", "v3", credentials=creds)
    except Exception as e:
        print(f"competitor-activity build error: {e}")
        return []

    cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=lookback_days)
    meta_by_channel = {c["channel_id"]: c for c in competitors if c.get("channel_id")}

    # Step 1: per-channel playlistItems.list to get recent uploads.
    video_to_channel: dict[str, str] = {}
    all_video_ids: list[str] = []
    for cid in meta_by_channel.keys():
        playlist_id = _uploads_playlist_from_channel_id(cid)
        if not playlist_id:
            continue
        try:
            pl_resp = youtube.playlistItems().list(
                part="snippet",
                playlistId=playlist_id,
                maxResults=5,
            ).execute()
            for it in pl_resp.get("items", []):
                vid = it.get("snippet", {}).get("resourceId", {}).get("videoId")
                if vid:
                    all_video_ids.append(vid)
                    video_to_channel[vid] = cid
        except Exception as e:
            print(f"competitor-activity playlistItems error for {cid}: {e}")

    if not all_video_ids:
        return []

    # Step 2: batch videos.list for snippet + stats. 50 per call.
    out: list[dict] = []
    for i in range(0, len(all_video_ids), 50):
        batch = all_video_ids[i:i+50]
        try:
            v_resp = youtube.videos().list(
                part="snippet,statistics",
                id=",".join(batch),
            ).execute()
        except Exception as e:
            print(f"competitor-activity videos.list error: {e}")
            continue
        for v in v_resp.get("items", []):
            vsnippet = v.get("snippet", {})
            published_str = vsnippet.get("publishedAt", "")
            try:
                published = datetime.datetime.fromisoformat(published_str.replace("Z", "+00:00"))
            except Exception:
                continue
            if published < cutoff:
                continue

            channel_id = video_to_channel.get(v["id"], "")
            meta = meta_by_channel.get(channel_id, {})
            thumbs = vsnippet.get("thumbnails", {})
            thumb_url = (thumbs.get("medium") or thumbs.get("high") or thumbs.get("default") or {}).get("url", "")

            out.append({
                "video_id":          v["id"],
                "title":             vsnippet.get("title", ""),
                "thumbnail":         thumb_url,
                "channel_id":        channel_id,
                "channel_name":      meta.get("channel_name") or vsnippet.get("channelTitle", ""),
                "channel_thumbnail": meta.get("thumbnail", ""),
                "views":             int(v.get("statistics", {}).get("viewCount", 0)),
                "published_at":      published_str,
                "age_label":         _age_label(published),
            })

    out.sort(key=lambda x: x["published_at"], reverse=True)
    return out


def _read_activity_cache(db, channel_id: str) -> dict | None:
    """Return the cached payload if it's fresher than _COMP_ACTIVITY_TTL,
    else None. Reads from the DB so the cache survives Railway restarts.
    """
    row = db.query(CompetitorActivityCache).filter_by(channel_id=channel_id).first()
    if not row or not row.cached_at:
        return None
    cached_at = row.cached_at
    if cached_at.tzinfo is None:
        cached_at = cached_at.replace(tzinfo=datetime.timezone.utc)
    age = (datetime.datetime.now(datetime.timezone.utc) - cached_at).total_seconds()
    if age >= _COMP_ACTIVITY_TTL:
        return None
    try:
        return json.loads(row.result_json)
    except Exception:
        return None


def _write_activity_cache(db, channel_id: str, payload: dict) -> None:
    """Upsert the user's competitor-activity payload. Best-effort — a
    write failure leaves the next request to fetch fresh."""
    try:
        now = datetime.datetime.now(datetime.timezone.utc)
        row = db.query(CompetitorActivityCache).filter_by(channel_id=channel_id).first()
        body = json.dumps(payload)
        if row:
            row.result_json = body
            row.cached_at = now
        else:
            db.add(CompetitorActivityCache(
                channel_id=channel_id,
                result_json=body,
                cached_at=now,
            ))
        db.commit()
    except Exception as e:
        print(f"[competitor-activity] cache write error: {e}")
        try: db.rollback()
        except Exception: pass


@router.get("/competitor-activity")
def competitor_activity(request: Request, force: int = 0):
    """Returns recent uploads from the channels the user tracks via
    Competitors. Cached for 24h in the DB (survives Railway restarts);
    ?force=1 bypasses cache."""
    data, creds = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)

    channel_id = (data or {}).get("channel", {}).get("channel_id", "") or (data or {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"items": [], "competitor_count": 0})

    db = SessionLocal()
    try:
        # DB-backed cache lookup (survives restarts).
        if not force:
            cached_payload = _read_activity_cache(db, channel_id)
            if cached_payload is not None:
                return JSONResponse(cached_payload)

        # Load tracked competitors from DB. Cap at 10 most recent.
        rows = (
            db.query(CompetitorAnalysisCache)
              .filter_by(channel_id=channel_id)
              .order_by(CompetitorAnalysisCache.analyzed_at.desc())
              .all()
        )
        seen: set[str] = set()
        competitors: list[dict] = []
        for row in rows:
            try:
                result = json.loads(row.result_json)
            except Exception:
                continue
            meta = result.get("_competitor_meta", {})
            comp_id = meta.get("channel_id") or row.competitor_id
            if not comp_id or comp_id in seen:
                continue
            seen.add(comp_id)
            competitors.append({
                "channel_id":   comp_id,
                "channel_name": meta.get("channel_name", ""),
                "thumbnail":    meta.get("thumbnail", ""),
            })
            if len(competitors) >= 10:
                break

        if not competitors:
            payload = {"items": [], "competitor_count": 0}
            _write_activity_cache(db, channel_id, payload)
            return JSONResponse(payload)

        items = _fetch_competitor_recent_uploads(creds, competitors, lookback_days=7)
        payload = {"items": items[:5], "competitor_count": len(competitors)}
        _write_activity_cache(db, channel_id, payload)
        return JSONResponse(payload)
    finally:
        db.close()
