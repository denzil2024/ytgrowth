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
from pydantic import BaseModel

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
from database.models import SessionLocal, SeoOptimization, SeoAnalysisCache, CompetitorAnalysisCache, CompetitorActivityCache, RelatedTrafficCache, SearchTermsCache, UnansweredCommentCache, TopChannelCache, YoutubeSearchCache, KeywordsResearchCache
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


@router.get("/suggested-competitors")
def suggested_competitors(request: Request):
    """Auto-curated competitor suggestions for the Feed.

    Pulls candidates from caches only — ZERO new YouTube quota:
      1. top_channel_cache: cross-user curated leaderboards by category.
         Already has sub counts, thumbnails, handles. Strong signal when
         we can infer the user's category from their niche keywords.
      2. youtube_search_cache (comp: prefix): channels surfaced in past
         competitor-name searches by any user. Useful for users in narrow
         niches that don't map cleanly to one of our 14 categories.

    Filters out the user's own channel and any competitor they already
    track. Returns up to 8, sorted by signal strength then sub count.
    Card is intended to hide on the frontend when fewer than ~3 results.
    """
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"ok": False, "reason": "not_authenticated"}, status_code=401)

    channel = (data or {}).get("channel", {}) or {}
    videos  = (data or {}).get("videos",  []) or []
    my_id   = channel.get("channel_id") or ""
    if not my_id:
        return JSONResponse({"ok": True, "suggestions": [], "category": None})

    from app.competitors import extract_niche_keywords
    from app.top_channels import CATEGORY_QUERIES
    from app.seo import _normalize_cache_query

    niche_kw = extract_niche_keywords(channel, videos) or []
    niche_kw_lower = [str(k).lower() for k in niche_kw]

    # Map this user's niche keywords to one of the 14 TopChannelCache
    # categories by simple substring overlap with each category's seed
    # query. If nothing matches, we skip the TopChannelCache pull and
    # fall back to the comp: search cache (secondary source below).
    best_cat = None
    best_score = 0
    for cat, query in CATEGORY_QUERIES.items():
        terms = [t for t in query.lower().split() if len(t) > 2]
        score = 0
        for kw in niche_kw_lower:
            for term in terms:
                if term in kw or kw in term:
                    score += 1
        if score > best_score:
            best_score = score
            best_cat = cat

    db = SessionLocal()
    try:
        # Already-tracked competitor channel_ids (so we don't re-suggest)
        tracked_ids = {my_id}
        try:
            for row in db.query(CompetitorAnalysisCache).filter_by(channel_id=my_id).all():
                try:
                    result = json.loads(row.result_json)
                    meta = result.get("_competitor_meta") or {}
                    cid = meta.get("channel_id") or row.competitor_id
                    if cid:
                        tracked_ids.add(cid)
                except Exception:
                    pass
        except Exception:
            pass

        candidates = {}  # channel_id -> dict

        # Primary: TopChannelCache by inferred category (global region).
        # Has subscribers, thumbnails, handles — the rich data needed for
        # the VidIQ-style card.
        if best_cat:
            try:
                rows = (
                    db.query(TopChannelCache)
                    .filter(
                        TopChannelCache.category == best_cat,
                        TopChannelCache.region == 'global',
                    )
                    .order_by(TopChannelCache.subscribers.desc())
                    .limit(40)
                    .all()
                )
                for r in rows:
                    if not r.channel_id or r.channel_id in tracked_ids:
                        continue
                    candidates[r.channel_id] = {
                        "channel_id":   r.channel_id,
                        "channel_name": r.title or "",
                        "handle":       r.handle or "",
                        "thumbnail":    r.thumbnail or "",
                        "subscribers":  int(r.subscribers or 0),
                        "score":        2,  # strong signal: curated category leaderboard
                    }
            except Exception as e:
                print(f"[suggested-competitors] top_channel_cache read error: {e}")

        # Secondary: comp:<niche_kw> rows in youtube_search_cache.
        # Sub counts aren't in the search-result payload, but channel_id
        # + name + thumbnail are. We dedupe and bump score for channels
        # that appear across multiple keyword searches.
        for kw in niche_kw[:5]:
            try:
                prefix = f"comp:{_normalize_cache_query(kw)}"
                rows = (
                    db.query(YoutubeSearchCache)
                    .filter(YoutubeSearchCache.cache_key.like(f"{prefix}|%"))
                    .all()
                )
                for row in rows:
                    try:
                        chans = json.loads(row.result_json) or []
                    except Exception:
                        continue
                    for c in chans[:5]:
                        cid = (c or {}).get("channel_id") or ""
                        if not cid or cid in tracked_ids:
                            continue
                        if cid in candidates:
                            candidates[cid]["score"] += 1
                        else:
                            candidates[cid] = {
                                "channel_id":   cid,
                                "channel_name": c.get("channel_name", "") or "",
                                "handle":       "",
                                "thumbnail":    c.get("thumbnail", "") or "",
                                "subscribers":  0,
                                "score":        1,
                            }
            except Exception as e:
                print(f"[suggested-competitors] comp-cache read error: {e}")

        # Rank: score DESC (stronger signal first), then subscribers DESC.
        ordered = sorted(
            candidates.values(),
            key=lambda x: (-x["score"], -x["subscribers"]),
        )[:8]

        return JSONResponse({
            "ok":          True,
            "suggestions": ordered,
            "category":    best_cat,
            "niche_keywords": niche_kw[:5],
        })
    finally:
        db.close()


_RELATED_TRAFFIC_TTL_HOURS = 24


def _read_related_traffic_cache(db, channel_id):
    try:
        row = db.query(RelatedTrafficCache).filter_by(channel_id=channel_id).first()
        if not row:
            return None
        cached_at = row.cached_at
        if cached_at and cached_at.tzinfo is None:
            cached_at = cached_at.replace(tzinfo=datetime.timezone.utc)
        if not cached_at:
            return None
        age_h = (datetime.datetime.now(datetime.timezone.utc) - cached_at).total_seconds() / 3600
        if age_h >= _RELATED_TRAFFIC_TTL_HOURS:
            return None
        try:
            return json.loads(row.result_json)
        except Exception:
            return None
    except Exception as e:
        print(f"[related-traffic] cache read error: {e}")
        return None


def _write_related_traffic_cache(db, channel_id, payload):
    try:
        row = db.query(RelatedTrafficCache).filter_by(channel_id=channel_id).first()
        body = json.dumps(payload, default=str)
        now = datetime.datetime.now(datetime.timezone.utc)
        if row:
            row.result_json = body
            row.cached_at   = now
        else:
            db.add(RelatedTrafficCache(channel_id=channel_id, result_json=body, cached_at=now))
        db.commit()
    except Exception as e:
        print(f"[related-traffic] cache write error: {e}")
        try: db.rollback()
        except Exception: pass


_SEARCH_TERMS_TTL_HOURS = 24


def _read_search_terms_cache(db, channel_id):
    try:
        row = db.query(SearchTermsCache).filter_by(channel_id=channel_id).first()
        if not row:
            return None
        cached_at = row.cached_at
        if cached_at and cached_at.tzinfo is None:
            cached_at = cached_at.replace(tzinfo=datetime.timezone.utc)
        if not cached_at:
            return None
        age_h = (datetime.datetime.now(datetime.timezone.utc) - cached_at).total_seconds() / 3600
        if age_h >= _SEARCH_TERMS_TTL_HOURS:
            return None
        try:
            return json.loads(row.result_json)
        except Exception:
            return None
    except Exception as e:
        print(f"[top-search-terms] cache read error: {e}")
        return None


def _write_search_terms_cache(db, channel_id, payload):
    try:
        row = db.query(SearchTermsCache).filter_by(channel_id=channel_id).first()
        body = json.dumps(payload, default=str)
        now = datetime.datetime.now(datetime.timezone.utc)
        if row:
            row.result_json = body
            row.cached_at   = now
        else:
            db.add(SearchTermsCache(channel_id=channel_id, result_json=body, cached_at=now))
        db.commit()
    except Exception as e:
        print(f"[top-search-terms] cache write error: {e}")
        try: db.rollback()
        except Exception: pass


@router.get("/top-search-terms")
def top_search_terms(request: Request, force: int = 0):
    """Feed card: "Top Search Terms" — the actual queries that brought
    viewers to this creator's videos in the last 28 days, via YouTube
    Analytics insightTrafficSourceDetail filtered to YT_SEARCH.

    Cache: 24h per channel (SearchTermsCache). Analytics API quota is
    separate from the 10K Data API budget, so refreshing is free against
    quota math. force=1 bypasses the cache for manual refresh.
    """
    data, creds = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"ok": False, "reason": "not_authenticated"}, status_code=401)

    channel = (data or {}).get("channel", {}) or {}
    channel_id = channel.get("channel_id", "") or ""
    if not channel_id:
        return JSONResponse({"ok": True, "items": []})

    db = SessionLocal()
    try:
        if not force:
            cached = _read_search_terms_cache(db, channel_id)
            if cached is not None:
                return JSONResponse(cached)

        from app.youtube import get_top_search_terms as _fetch_terms

        terms = _fetch_terms(creds, channel_id, days=28, max_results=10)
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        if not terms:
            payload = {"ok": False, "reason": "no_search_traffic", "items": [], "refreshed_at": now_iso}
            _write_search_terms_cache(db, channel_id, payload)
            return JSONResponse(payload)

        payload = {"ok": True, "items": terms, "refreshed_at": now_iso}
        _write_search_terms_cache(db, channel_id, payload)
        return JSONResponse(payload)
    finally:
        db.close()


@router.get("/related-traffic")
def related_traffic(request: Request, force: int = 0):
    """Feed card: "New traffic from N related videos."

    Pulls the per-source-video traffic breakdown for the user's channel
    (which OTHER YouTube videos drove views to them in the last ~14d),
    resolves each ID to title + thumbnail + channel + view count via a
    single videos.list batch (1 Data API unit), filters out the user's
    own uploads, drops any source video with absolute viewCount under
    10K (the high-quality filter), sorts by views-to-you desc, returns
    top 6.

    Cache: 24h DB-persisted (RelatedTrafficCache). force=1 bypasses.
    """
    data, creds = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)

    channel = (data or {}).get("channel", {}) or {}
    channel_id = channel.get("channel_id", "") or ""
    if not channel_id:
        return JSONResponse({"ok": True, "items": []})

    db = SessionLocal()
    try:
        if not force:
            cached = _read_related_traffic_cache(db, channel_id)
            if cached is not None:
                return JSONResponse(cached)

        from app.youtube import get_related_traffic_source_videos
        from app.utils import build_youtube_client
        from app.insights import parse_duration_seconds

        sources = get_related_traffic_source_videos(creds, channel_id, days=14, max_results=15)
        if not sources:
            print(f"[related-traffic] no Analytics rows for channel {channel_id} (no SUGGESTED_VIDEO traffic in last 14d, or scope missing)")
            payload = {"ok": False, "reason": "no_analytics_traffic", "items": [], "refreshed_at": datetime.datetime.now(datetime.timezone.utc).isoformat()}
            _write_related_traffic_cache(db, channel_id, payload)
            return JSONResponse(payload)

        # Resolve all source video IDs in ONE videos.list batch. 1 Data
        # API unit total regardless of how many IDs (up to 50).
        source_ids = [s["source_video_id"] for s in sources if s.get("source_video_id")]
        if not source_ids:
            payload = {"ok": False, "reason": "no_source_ids", "items": [], "refreshed_at": datetime.datetime.now(datetime.timezone.utc).isoformat()}
            _write_related_traffic_cache(db, channel_id, payload)
            return JSONResponse(payload)

        try:
            youtube = build_youtube_client(creds)
            resp = youtube.videos().list(
                part="snippet,statistics,contentDetails",
                id=",".join(source_ids[:50]),
            ).execute()
            yt_items = resp.get("items", []) or []
        except Exception as e:
            print(f"[related-traffic] videos.list error: {e}")
            payload = {"ok": False, "reason": "resolve_failed", "items": [], "refreshed_at": datetime.datetime.now(datetime.timezone.utc).isoformat()}
            _write_related_traffic_cache(db, channel_id, payload)
            return JSONResponse(payload)

        # Map metadata by ID for the join below.
        meta_by_id = {}
        for it in yt_items:
            vid = it.get("id", "")
            if not vid:
                continue
            snip  = it.get("snippet", {}) or {}
            stats = it.get("statistics", {}) or {}
            cd    = it.get("contentDetails", {}) or {}
            meta_by_id[vid] = {
                "title":            snip.get("title", "") or "",
                "channel_id":       snip.get("channelId", "") or "",
                "channel_name":     snip.get("channelTitle", "") or "",
                "thumbnail":        (snip.get("thumbnails", {}).get("medium", {}) or {}).get("url", "") or "",
                "published_at":     snip.get("publishedAt", "") or "",
                "duration_seconds": parse_duration_seconds(cd.get("duration", "PT0S") or "PT0S"),
                "view_count":       int(stats.get("viewCount", 0) or 0),
            }

        # Filter + sort: drop user's own uploads, drop low-view source
        # videos (< 10K), keep top 6 by views-to-you.
        QUALITY_FLOOR_VIEWS = 10_000
        items = []
        for s in sources:
            vid = s.get("source_video_id", "")
            meta = meta_by_id.get(vid)
            if not meta:
                continue
            if meta["channel_id"] == channel_id:
                continue
            if meta["view_count"] < QUALITY_FLOOR_VIEWS:
                continue
            items.append({
                "video_id":         vid,
                "title":            meta["title"],
                "channel_id":       meta["channel_id"],
                "channel_name":     meta["channel_name"],
                "thumbnail":        meta["thumbnail"],
                "published_at":     (meta["published_at"] or "")[:10],
                "duration_seconds": meta["duration_seconds"],
                "view_count":       meta["view_count"],
                "views_to_you":     int(s.get("views_to_you", 0) or 0),
            })
            if len(items) >= 6:
                break

        # If filtering dropped everything, surface a specific reason
        # instead of pretending we have data. Tells the user the call
        # succeeded but no source videos cleared the quality bar.
        if not items:
            print(f"[related-traffic] all {len(sources)} sources filtered out (own-channel + 10K-view floor) for channel {channel_id}")
            payload = {
                "ok":              False,
                "reason":          "all_filtered",
                "items":           [],
                "raw_source_count": len(sources),
                "refreshed_at":    datetime.datetime.now(datetime.timezone.utc).isoformat(),
            }
            _write_related_traffic_cache(db, channel_id, payload)
            return JSONResponse(payload)

        payload = {
            "ok":           True,
            "items":        items,
            "refreshed_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
        _write_related_traffic_cache(db, channel_id, payload)
        return JSONResponse(payload)
    finally:
        db.close()


@router.get("/title-suggestion")
def title_suggestion(request: Request):
    """Surface SEO Studio title suggestions for the user's MOST RECENT video.

    Pick: the most recent video by published_at. Always the same pick, no
    "under-performer" filter or median games.

    Source of suggestions:
      1. If the user has already run SEO Studio on that video, return the
         cached suggestions verbatim from SeoAnalysisCache.
      2. Otherwise, call SEO Studio's generate_title_suggestions function
         with channel context (viral videos, niche keywords) but NO YouTube
         search. Same Claude prompt SEO Studio uses, just without the live
         competitive-data block. Wrapped in cached_ai_output so two users
         with similar inputs (same title, niche, tier) share the result.

    Zero new YouTube quota in either path. The Feed gives every user a
    headstart even if they've never opened SEO Studio.
    """
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"ok": False, "reason": "not_authenticated"}, status_code=401)

    channel = (data or {}).get("channel", {}) or {}
    videos  = (data or {}).get("videos",  []) or []
    channel_id = channel.get("channel_id", "") or ""
    if not channel_id or not videos:
        return JSONResponse({"ok": True, "video": None})

    from app.insights import parse_duration_seconds

    # Pick: the single most recent video that has a title.
    pick = None
    for v in sorted(videos, key=lambda x: (x.get("published_at") or ""), reverse=True):
        if (v.get("title") or "").strip():
            pick = v
            break
    if not pick:
        return JSONResponse({"ok": True, "video": None})

    title       = (pick.get("title") or "").strip()
    is_short    = parse_duration_seconds(pick.get("duration", "PT0S")) <= 60
    description = (pick.get("description") or "").strip()[:240]

    def _age_label(iso: str) -> str:
        if not iso:
            return ""
        try:
            dt = datetime.datetime.fromisoformat((iso or "")[:10])
        except Exception:
            return ""
        days = (datetime.datetime.now() - dt).days
        if days <= 0:  return "today"
        if days == 1:  return "1d ago"
        if days < 7:   return f"{days}d ago"
        if days < 30:  return f"{days // 7}w ago"
        if days < 365: return f"{days // 30}mo ago"
        return f"{days // 365}y ago"

    def _clean_suggestions(raw_list):
        """Drop any title with banned punctuation and pick the fields the
        Feed card actually renders."""
        out = []
        for s in (raw_list or [])[:3]:
            t = (s.get("title") or "").strip()
            if not t or "—" in t or "–" in t:
                continue
            out.append({
                "title":        t,
                "score":        int(s.get("score") or 0),
                "why_it_works": (s.get("why_it_works") or "").strip(),
                "angle":        (s.get("angle") or "").strip(),
            })
        return out

    video_payload = {
        "video_id":     pick.get("video_id", ""),
        "title":        title,
        "thumbnail":    pick.get("thumbnail", ""),
        "views":        int(pick.get("views", 0) or 0),
        "published_at": (pick.get("published_at") or "")[:10],
        "is_short":     bool(is_short),
    }

    # Path 1: user has already run SEO Studio on this video -> return cached.
    db = SessionLocal()
    try:
        row = (
            db.query(SeoAnalysisCache)
            .filter_by(channel_id=channel_id, title_lower=title.lower())
            .first()
        )
        if row and row.result_json:
            try:
                cached = (json.loads(row.result_json) or {}).get("suggestions") or []
            except Exception:
                cached = []
            cleaned = _clean_suggestions(cached)
            if cleaned:
                return JSONResponse({
                    "ok":          True,
                    "video":       video_payload,
                    "suggestions": cleaned,
                    "age_label":   _age_label(pick.get("published_at", "")),
                    "source":      "studio_cache",
                })
    finally:
        db.close()

    # Path 2: headstart. Call the same SEO Studio function with channel
    # context only (no YouTube search -> zero quota burn). Cross-user
    # cached via cached_ai_output so repeated titles in similar niches
    # don't keep re-calling Claude.
    from app.seo import generate_title_suggestions
    from app.utils import cached_ai_output

    viral_videos = [
        {"title": v.get("title", "") or "", "views": int(v.get("views", 0) or 0)}
        for v in sorted(videos, key=lambda x: x.get("views", 0) or 0, reverse=True)[:5]
        if v.get("title")
    ]
    channel_context = {
        "channel_name":     channel.get("channel_name", "") or "",
        "channel_keywords": channel.get("keywords", "") or "",
        "top_video_titles": [v["title"] for v in viral_videos],
        "viral_videos":     viral_videos,
    }

    def _subs_tier(n: int) -> str:
        if n < 10_000:    return "micro"
        if n < 100_000:   return "small"
        if n < 1_000_000: return "mid"
        return "large"

    cache_inputs = {
        "title":          title,
        "description":    description,
        "viral_titles":   sorted(v["title"].lower() for v in viral_videos),
        "channel_kw":     (channel.get("keywords", "") or "").lower()[:200],
        "subs_tier":      _subs_tier(int(channel.get("subscribers", 0) or 0)),
        "is_short":       bool(is_short),
        "prompt_version": "feed_v1",
    }

    def _fetch():
        try:
            suggestions, _intent, err = generate_title_suggestions(
                title=title,
                search_terms=[title],
                top_videos=[],
                score_data={},
                keyword_scores=[],
                autocomplete=[],
                context=description,
                primary_phrase=title,
                channel_context=channel_context,
            )
            return {"suggestions": suggestions or [], "error": err or ""}
        except Exception as e:
            print(f"[title-suggestion] generate error: {e}")
            return {"suggestions": [], "error": str(e)}

    out = cached_ai_output(
        function_name="feed_title_suggestion_seo_compat",
        inputs=cache_inputs,
        ttl_hours=24 * 14,
        fetch_fn=_fetch,
    )

    fresh = _clean_suggestions(out.get("suggestions") or [])
    if fresh:
        return JSONResponse({
            "ok":          True,
            "video":       video_payload,
            "suggestions": fresh,
            "age_label":   _age_label(pick.get("published_at", "")),
            "source":      "feed_generated",
        })

    # Path 3 (safety net): the live Claude path failed or returned nothing.
    # Walk ALL the user's videos newest-first and serve the first cached
    # SEO Studio analysis we find. Guarantees the card never silently
    # disappears as long as the user has run SEO Studio on ANY past video.
    print(f"[title-suggestion] path 2 empty for video '{title[:60]}' (err={out.get('error', 'none')}), falling back to scan")
    db2 = SessionLocal()
    try:
        for v in sorted(videos, key=lambda x: (x.get("published_at") or ""), reverse=True):
            v_title = (v.get("title") or "").strip()
            if not v_title:
                continue
            row = (
                db2.query(SeoAnalysisCache)
                .filter_by(channel_id=channel_id, title_lower=v_title.lower())
                .first()
            )
            if not row or not row.result_json:
                continue
            try:
                cached = (json.loads(row.result_json) or {}).get("suggestions") or []
            except Exception:
                continue
            cleaned = _clean_suggestions(cached)
            if not cleaned:
                continue
            v_is_short = parse_duration_seconds(v.get("duration", "PT0S")) <= 60
            return JSONResponse({
                "ok": True,
                "video": {
                    "video_id":     v.get("video_id", ""),
                    "title":        v_title,
                    "thumbnail":    v.get("thumbnail", ""),
                    "views":        int(v.get("views", 0) or 0),
                    "published_at": (v.get("published_at") or "")[:10],
                    "is_short":     bool(v_is_short),
                },
                "suggestions": cleaned,
                "age_label":   _age_label(v.get("published_at", "")),
                "source":      "studio_cache_any",
            })
    finally:
        db2.close()

    return JSONResponse({"ok": True, "video": None})


@router.get("/missing-description")
def missing_description(request: Request):
    """Surface an AI-drafted description for one of the user's recent videos
    whose current description is thin (< 250 chars). Same auto-curated
    pattern as title-suggestion: zero new YouTube quota, two paths.

      Path 1: User already ran SEO Studio on that video -> return the first
        description from SeoAnalysisCache.desc_result_json verbatim.
      Path 2: Headstart. Call SEO Studio's generate_description_suggestions
        with channel context only (no live YouTube search, no autocomplete
        fetch). Wrap in cached_ai_output keyed on title + niche + creator-
        size tier so similar videos in similar niches share the result.

    Walks the candidate list newest-first and returns the FIRST video both
    paths can produce drafts for. Hashtag-only titles (common on shorts) are
    pre-filtered because Claude has nothing semantically meaningful to write
    about; livestream archives with empty titles+desc are filtered the same
    way. Cap iterations at MAX_TRIES so a user with five unworkable videos
    in a row doesn't burn the request timeout.

    If no candidate exists or none yield drafts, the card hides itself.
    Honors YT_QUOTA_PAUSED.

    Pass ?debug=1 to get a per-candidate diagnostic instead of the rendered
    payload (shows which candidates were tried and which path produced
    drafts or returned empty).
    """
    debug = request.query_params.get("debug") == "1"

    import os as _os
    if _os.getenv("YT_QUOTA_PAUSED") == "1":
        return JSONResponse({"ok": True, "video": None, "_debug": {"halted": "YT_QUOTA_PAUSED"}} if debug else {"ok": True, "video": None})

    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"ok": False, "reason": "not_authenticated"}, status_code=401)

    channel = (data or {}).get("channel", {}) or {}
    videos  = (data or {}).get("videos",  []) or []
    channel_id = channel.get("channel_id", "") or ""
    if not channel_id or not videos:
        return JSONResponse({"ok": True, "video": None, "_debug": {"halted": "no_channel_or_videos", "channel_id": bool(channel_id), "videos_n": len(videos)}} if debug else {"ok": True, "video": None})

    from app.insights import parse_duration_seconds

    THRESHOLD = 250
    MAX_TRIES = 5

    def _meaningful_title(t: str) -> bool:
        """True if the title has enough non-hashtag text for Claude to write a
        description from. A title like "#shorts #music #lifestyle" strips to
        empty and we'd waste a Claude call on it."""
        if not t:
            return False
        stripped = " ".join(w for w in t.split() if not w.startswith("#")).strip()
        return len(stripped) >= 15

    # Build the candidate list: newest-first videos with a meaningful title
    # AND a thin description. Pre-filter aggressively so we only spend Claude
    # cycles on videos that have any chance of producing a useful draft.
    candidates = []
    for v in sorted(videos, key=lambda x: (x.get("published_at") or ""), reverse=True):
        t = (v.get("title") or "").strip()
        if not _meaningful_title(t):
            continue
        if len((v.get("description") or "").strip()) >= THRESHOLD:
            continue
        candidates.append(v)

    if not candidates:
        return JSONResponse({"ok": True, "video": None})

    def _age_label(iso: str) -> str:
        if not iso:
            return ""
        try:
            dt = datetime.datetime.fromisoformat((iso or "")[:10])
        except Exception:
            return ""
        days = (datetime.datetime.now() - dt).days
        if days <= 0:  return "today"
        if days == 1:  return "1d ago"
        if days < 7:   return f"{days}d ago"
        if days < 30:  return f"{days // 7}w ago"
        if days < 365: return f"{days // 30}mo ago"
        return f"{days // 365}y ago"

    def _clean_description(d: str) -> str:
        """Strip banned punctuation. Em-dashes and en-dashes are out per the
        repo style. Returns '' if nothing left after stripping."""
        if not d:
            return ""
        return d.replace("—", "-").replace("–", "-").strip()

    def _subs_tier(n: int) -> str:
        if n < 10_000:    return "micro"
        if n < 100_000:   return "small"
        if n < 1_000_000: return "mid"
        return "large"

    from app.seo import generate_description_suggestions
    from app.utils import cached_ai_output

    top_titles = [
        (v.get("title") or "")
        for v in sorted(videos, key=lambda x: x.get("views", 0) or 0, reverse=True)[:5]
        if v.get("title")
    ]
    channel_context = {
        "channel_name":     channel.get("channel_name", "") or "",
        "channel_keywords": channel.get("keywords", "") or "",
        "top_video_titles": top_titles,
    }

    def _try_pick(pick, diag_out=None):
        """Return a JSON-ready payload for `pick` if drafts can be sourced,
        else None. Tries SEO Studio cache first, then a cross-user-cached
        Claude call. Per-candidate so the outer loop can move on if a video
        produces nothing usable. When diag_out is a dict, mutate it with
        per-step outcomes so the caller can expose them via ?debug=1."""
        title        = (pick.get("title") or "").strip()
        is_short     = parse_duration_seconds(pick.get("duration", "PT0S")) <= 60
        current_desc = (pick.get("description") or "").strip()

        video_payload = {
            "video_id":                   pick.get("video_id", ""),
            "title":                      title,
            "thumbnail":                  pick.get("thumbnail", ""),
            "published_at":               (pick.get("published_at") or "")[:10],
            "is_short":                   bool(is_short),
            "current_description_length": len(current_desc),
        }

        # Path 1: SEO Studio cache lookup
        db = SessionLocal()
        try:
            row = (
                db.query(SeoAnalysisCache)
                .filter_by(channel_id=channel_id, title_lower=title.lower())
                .first()
            )
            if diag_out is not None:
                diag_out["path1_row_found"] = bool(row)
                diag_out["path1_has_desc_json"] = bool(row and row.desc_result_json)
            if row and row.desc_result_json:
                try:
                    cached = json.loads(row.desc_result_json) or []
                except Exception:
                    cached = []
                drafts = []
                for entry in cached[:3]:
                    if isinstance(entry, dict):
                        raw = entry.get("full") or entry.get("description") or entry.get("preview") or ""
                    else:
                        raw = str(entry)
                    draft = _clean_description(raw)
                    if draft:
                        drafts.append(draft)
                if diag_out is not None:
                    diag_out["path1_cached_count"] = len(cached)
                    diag_out["path1_drafts_extracted"] = len(drafts)
                    if cached and isinstance(cached[0], dict):
                        diag_out["path1_entry_keys"] = sorted(cached[0].keys())
                if drafts:
                    return {
                        "ok":        True,
                        "video":     video_payload,
                        "drafts":    drafts,
                        "age_label": _age_label(pick.get("published_at", "")),
                        "source":    "studio_cache",
                    }
        finally:
            db.close()

        # Path 2: cross-user-cached Claude headstart
        cache_inputs = {
            "title":          title,
            "is_short":       bool(is_short),
            "channel_kw":     (channel.get("keywords", "") or "").lower()[:200],
            "subs_tier":      _subs_tier(int(channel.get("subscribers", 0) or 0)),
            "prompt_version": "feed_desc_v2",  # bumped to invalidate any rows cached against the old buggy reader
        }

        def _fetch():
            try:
                descriptions, _kw, err = generate_description_suggestions(
                    title=title,
                    current_description=current_desc[:240],
                    niche=(channel.get("keywords", "") or "").split(",")[0].strip() or "",
                    intent_analysis=None,
                    keyword_scores=[],
                    channel_context=channel_context,
                    autocomplete=[],
                )
                return {"descriptions": descriptions or [], "error": err or ""}
            except Exception as e:
                print(f"[missing-description] generate error: {e}")
                return {"descriptions": [], "error": str(e)}

        out = cached_ai_output(
            function_name="feed_missing_description",
            inputs=cache_inputs,
            ttl_hours=24 * 30,
            fetch_fn=_fetch,
        )

        # Read "full" from each dict — same shape returned by
        # generate_description_suggestions (type/label/preview/full/why_it_works).
        # This was the long-running bug: Path 2 used to read "description"
        # which doesn't exist on those dicts, so it always extracted nothing.
        drafts = []
        descs = out.get("descriptions") or []
        for entry in descs[:3]:
            if isinstance(entry, dict):
                raw = entry.get("full") or entry.get("description") or entry.get("preview") or ""
            else:
                raw = str(entry)
            draft = _clean_description(raw)
            if draft:
                drafts.append(draft)
        if diag_out is not None:
            diag_out["path2_descriptions_count"] = len(descs)
            diag_out["path2_drafts_extracted"] = len(drafts)
            diag_out["path2_error"] = (out.get("error") or "")[:200]
            if descs and isinstance(descs[0], dict):
                diag_out["path2_entry_keys"] = sorted(descs[0].keys())
        if drafts:
            return {
                "ok":        True,
                "video":     video_payload,
                "drafts":    drafts,
                "age_label": _age_label(pick.get("published_at", "")),
                "source":    "feed_generated",
            }
        return None

    # Walk candidates, return the first one that yields drafts.
    diag_walk = []
    for pick in candidates[:MAX_TRIES]:
        per = {"video_id": pick.get("video_id", ""), "title": (pick.get("title") or "")[:60]}
        try:
            result = _try_pick(pick, diag_out=per if debug else None)
        except Exception as e:
            import traceback as _tb
            err = str(e)
            tb = _tb.format_exc().splitlines()[-6:]
            print(f"[missing-description] _try_pick exception for '{(pick.get('title') or '')[:60]}': {err}")
            per["outcome"] = "exception"
            per["error"] = err
            per["trace"] = tb
            diag_walk.append(per)
            continue
        if result:
            if debug:
                per["outcome"] = "yielded_drafts"
                per["source"] = result.get("source", "")
                result["_debug"] = {"candidates_total": len(candidates), "walk": diag_walk + [per]}
                return JSONResponse(result)
            return JSONResponse(result)
        per["outcome"] = "no_drafts"
        diag_walk.append(per)

    print(f"[missing-description] no candidate among {len(candidates)} yielded drafts")
    if debug:
        return JSONResponse({"ok": True, "video": None, "_debug": {"candidates_total": len(candidates), "max_tries": MAX_TRIES, "walk": diag_walk}})
    return JSONResponse({"ok": True, "video": None})


@router.get("/trending-keyword")
def trending_keyword(request: Request):
    """Surface ONE keyword from existing cached research. Zero new YouTube
    quota. Two paths (user's own research, then cross-user niche pool).

    Wrapped end-to-end in try/except so a parse error in one stale cache
    row doesn't 500 the whole card. On exception, returns null + reason.
    Pass ?debug=1 to get a diagnostic dump instead of the rendered payload.
    """
    debug = request.query_params.get("debug") == "1"
    try:
        return _trending_keyword_impl(request, debug=debug)
    except Exception as e:
        import traceback as _tb
        tb = _tb.format_exc()
        print(f"[trending-keyword] unhandled exception: {e}\n{tb}")
        if debug:
            return JSONResponse({"ok": False, "reason": "exception", "error": str(e), "trace": tb.splitlines()[-12:]})
        return JSONResponse({"ok": True, "keyword": None})


def _trending_keyword_impl(request: Request, debug: bool = False):
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"ok": False, "reason": "not_authenticated"}, status_code=401)

    channel = (data or {}).get("channel", {}) or {}
    channel_id = channel.get("channel_id", "") or ""
    niche_kw_raw = (channel.get("keywords", "") or "").lower()
    # Tokenize niche keywords: split on commas / spaces, keep words >= 4 chars
    niche_tokens = set()
    for chunk in niche_kw_raw.replace(",", " ").split():
        token = chunk.strip().lower()
        if len(token) >= 4:
            niche_tokens.add(token)

    def _momentum(kw_obj):
        """Reproduce app/keywords.py _momentum_from_competition without
        importing (cheap dict lookup). 'active' = newest top-5 < 30 days."""
        comp = kw_obj.get("competition") or {}
        days = comp.get("days_since_newest")
        if days is None:        return ""
        if days < 30:           return "active"
        if days > 180:          return "unclaimed"
        return "steady"

    def _payload(kw_obj, source, age_iso=None):
        comp  = kw_obj.get("competition") or {}
        score = int(kw_obj.get("opportunityScore") or 0)
        subs_med = int(comp.get("top_subs_median") or 0)
        days     = comp.get("days_since_newest")
        # Concise context strings the card renders verbatim. Keep them
        # narrowly factual so they read as a competitive snapshot, not
        # marketing copy.
        if subs_med >= 1_000_000:   subs_label = "top 5 channels over 1M subs"
        elif subs_med >= 100_000:   subs_label = "top 5 channels 100k-1M subs"
        elif subs_med >= 50_000:    subs_label = "top 5 channels 50k-100k subs"
        elif subs_med >= 10_000:    subs_label = "top 5 channels 10k-50k subs"
        elif subs_med >= 1_000:     subs_label = "top 5 channels under 10k subs"
        else:                       subs_label = ""
        if days is None:    fresh_label = ""
        elif days <= 1:     fresh_label = "newest top-5 video shipped today"
        elif days < 14:     fresh_label = f"newest top-5 video shipped {days} days ago"
        elif days < 60:     fresh_label = f"newest top-5 video shipped {days // 7} weeks ago"
        else:               fresh_label = f"newest top-5 video shipped {days // 30} months ago"
        age_label = ""
        if age_iso:
            try:
                dt = datetime.datetime.fromisoformat(age_iso[:19])
                ds = (datetime.datetime.utcnow() - dt).days
                if ds <= 0:   age_label = "refreshed today"
                elif ds == 1: age_label = "refreshed 1d ago"
                elif ds < 7:  age_label = f"refreshed {ds}d ago"
                elif ds < 30: age_label = f"refreshed {ds // 7}w ago"
                else:         age_label = f"refreshed {ds // 30}mo ago"
            except Exception:
                age_label = ""
        return {
            "ok":         True,
            "keyword":    (kw_obj.get("keyword") or "").strip(),
            "score":      max(0, min(100, score)),
            "momentum":   _momentum(kw_obj),
            "subs_label": subs_label,
            "fresh_label": fresh_label,
            "age_label":  age_label,
            "source":     source,
        }

    diag = {"niche_tokens": sorted(niche_tokens), "channel_id": channel_id[:10] + "..." if channel_id else ""}

    db = SessionLocal()
    try:
        # Path 1: user's own keyword research.
        path1 = {"rows_seen": 0, "keywords_scanned": 0, "active_found": 0}
        if channel_id:
            rows = (
                db.query(KeywordsResearchCache)
                .filter_by(channel_id=channel_id)
                .order_by(KeywordsResearchCache.updated_at.desc())
                .limit(20)
                .all()
            )
            path1["rows_seen"] = len(rows)
            best = None
            best_age = None
            for row in rows:
                try:
                    payload = json.loads(row.result_json) or {}
                except Exception:
                    continue
                kws = payload.get("keywords") or payload.get("keyword_scores") or []
                path1["keywords_scanned"] += len(kws)
                for kw in kws:
                    if _momentum(kw) != "active":
                        continue
                    path1["active_found"] += 1
                    score = int(kw.get("opportunityScore") or 0)
                    if best is None or score > int(best.get("opportunityScore") or 0):
                        best = kw
                        best_age = row.updated_at.isoformat() if row.updated_at else None
            if best and not debug:
                return JSONResponse(_payload(best, "user_research", best_age))
            if best and debug:
                pl = _payload(best, "user_research", best_age)
                pl["_debug"] = {**diag, "path1": path1, "path2": "skipped (path1 found)"}
                return JSONResponse(pl)
        diag["path1"] = path1

        # Path 2: cross-user kw: cache. Each row's result_json is a COMPETITION
        # DICT for the single query stored in original_query — NOT a research-
        # result list of multiple keywords (that's KeywordsResearchCache). We
        # synthesise a keyword-shaped object per row so it flows through the
        # same _payload() helper. Score is derived from real competition data
        # (smaller channel size = higher score, fresher landscape = bonus).
        # Order by hit_count only — prod Postgres for this table predates
        # the model's last_hit_at column, and we can't rely on schema parity.
        # The cached_at column is part of the original schema; use it as a
        # secondary key so equally-popular rows still order deterministically.
        rows = (
            db.query(YoutubeSearchCache)
            .filter(YoutubeSearchCache.cache_key.like("kw:%"))
            .order_by(YoutubeSearchCache.hit_count.desc(), YoutubeSearchCache.cached_at.desc())
            .limit(120)
            .all()
        )

        def _score_from_competition(comp: dict) -> int:
            """Cheap opportunity score from the competition dict alone. Mirrors
            the spirit of app/keywords.py _score_with_real_data but stripped of
            inputs we don't have here (autocomplete rank, Claude intent). Range
            0-100."""
            subs = int(comp.get("top_subs_median") or 0)
            days = comp.get("days_since_newest")
            # Feasibility from top-5 median subs (smaller = easier)
            if   subs == 0:        feas = 50
            elif subs < 1_000:     feas = 95
            elif subs < 10_000:    feas = 85
            elif subs < 50_000:    feas = 70
            elif subs < 250_000:   feas = 55
            elif subs < 1_000_000: feas = 35
            else:                  feas = 15
            # Freshness — unclaimed landscape lifts; active landscape ok; stale neutral
            if days is None:    fresh = 50
            elif days < 30:     fresh = 65
            elif days < 90:     fresh = 55
            elif days < 180:    fresh = 60
            else:               fresh = 80
            return max(0, min(100, int(feas * 0.6 + fresh * 0.4)))

        path2 = {"rows_seen": len(rows), "passed_niche": 0, "passed_result_count": 0, "candidates": 0}
        best = None
        best_score = -1
        best_age = None
        for row in rows:
            q = (row.original_query or "").strip()
            if not q:
                continue
            if niche_tokens and not any(t in q.lower() for t in niche_tokens):
                continue
            path2["passed_niche"] += 1
            try:
                comp = json.loads(row.result_json) or {}
            except Exception:
                continue
            if not isinstance(comp, dict):
                continue
            # Skip rows the competition fetcher returned empty (no result_count
            # = the query was rejected or YouTube returned nothing usable).
            try:
                if int(comp.get("result_count") or 0) <= 0:
                    continue
            except (TypeError, ValueError):
                continue
            path2["passed_result_count"] += 1
            synthesised = {
                "keyword":          q,
                "opportunityScore": _score_from_competition(comp),
                "competition":      comp,
                "momentum":         "",  # set inside _payload via _momentum()
            }
            mom = _momentum(synthesised)
            score = synthesised["opportunityScore"]
            if mom == "active":
                score += 8  # nudge active winners ahead of stale ones
            path2["candidates"] += 1
            if score > best_score:
                best = synthesised
                best_score = score
                best_age = row.cached_at.isoformat() if row.cached_at else None
        diag["path2"] = path2

        if best and not debug:
            return JSONResponse(_payload(best, "niche_pool", best_age))
        if best and debug:
            pl = _payload(best, "niche_pool", best_age)
            pl["_debug"] = diag
            return JSONResponse(pl)
    finally:
        db.close()

    if debug:
        return JSONResponse({"ok": True, "keyword": None, "_debug": diag})
    return JSONResponse({"ok": True, "keyword": None})


@router.get("/missing-tags")
def missing_tags(request: Request):
    """Feed card: surface ONE recent video whose tag count is below the
    healthy floor (5) and return 3 AI-generated tag-set drafts the user
    can publish with one click. Mirrors the Missing Description pattern
    end-to-end: candidate walk, meaningful-title filter, cross-user cache
    on the Claude call. Honors YT_QUOTA_PAUSED.

    Pass ?debug=1 for the per-candidate diagnostic.
    """
    debug = request.query_params.get("debug") == "1"

    import os as _os
    if _os.getenv("YT_QUOTA_PAUSED") == "1":
        return JSONResponse({"ok": True, "video": None})

    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"ok": False, "reason": "not_authenticated"}, status_code=401)

    channel = (data or {}).get("channel", {}) or {}
    videos  = (data or {}).get("videos",  []) or []
    channel_id = channel.get("channel_id", "") or ""
    if not channel_id or not videos:
        return JSONResponse({"ok": True, "video": None, "_debug": {"halted": "no_channel_or_videos"}} if debug else {"ok": True, "video": None})

    from app.insights import parse_duration_seconds

    TAG_FLOOR = 5
    MAX_TRIES = 5

    def _meaningful_title(t: str) -> bool:
        if not t:
            return False
        stripped = " ".join(w for w in t.split() if not w.startswith("#")).strip()
        return len(stripped) >= 15

    # Pick candidates: newest-first videos with a meaningful title AND
    # fewer than TAG_FLOOR tags. Skip hashtag-only / livestream titles
    # because Claude can't generate niche-relevant tags from "is live!".
    candidates = []
    for v in sorted(videos, key=lambda x: (x.get("published_at") or ""), reverse=True):
        t = (v.get("title") or "").strip()
        if not _meaningful_title(t):
            continue
        cur_tags = v.get("tags") or []
        if len(cur_tags) >= TAG_FLOOR:
            continue
        candidates.append(v)

    if not candidates:
        return JSONResponse({"ok": True, "video": None, "_debug": {"candidates_total": 0}} if debug else {"ok": True, "video": None})

    def _age_label(iso: str) -> str:
        if not iso:
            return ""
        try:
            dt = datetime.datetime.fromisoformat((iso or "")[:10])
        except Exception:
            return ""
        days = (datetime.datetime.now() - dt).days
        if days <= 0:  return "today"
        if days == 1:  return "1d ago"
        if days < 7:   return f"{days}d ago"
        if days < 30:  return f"{days // 7}w ago"
        if days < 365: return f"{days // 30}mo ago"
        return f"{days // 365}y ago"

    def _subs_tier(n: int) -> str:
        if n < 10_000:    return "micro"
        if n < 100_000:   return "small"
        if n < 1_000_000: return "mid"
        return "large"

    from app.seo import generate_tag_suggestions
    from app.utils import cached_ai_output

    top_titles = [
        (v.get("title") or "")
        for v in sorted(videos, key=lambda x: x.get("views", 0) or 0, reverse=True)[:5]
        if v.get("title")
    ]
    channel_context = {
        "channel_name":     channel.get("channel_name", "") or "",
        "channel_keywords": channel.get("keywords", "") or "",
        "top_video_titles": top_titles,
    }

    def _try_pick(pick, diag_out=None):
        title    = (pick.get("title") or "").strip()
        is_short = parse_duration_seconds(pick.get("duration", "PT0S")) <= 60
        cur_tags = pick.get("tags") or []

        video_payload = {
            "video_id":         pick.get("video_id", ""),
            "title":            title,
            "thumbnail":        pick.get("thumbnail", ""),
            "published_at":     (pick.get("published_at") or "")[:10],
            "is_short":         bool(is_short),
            "current_tag_count": len(cur_tags),
        }

        cache_inputs = {
            "title":          title,
            "is_short":       bool(is_short),
            "channel_kw":     (channel.get("keywords", "") or "").lower()[:200],
            "subs_tier":      _subs_tier(int(channel.get("subscribers", 0) or 0)),
            "prompt_version": "feed_tags_v1",
        }

        def _fetch():
            try:
                sets, err = generate_tag_suggestions(
                    title=title,
                    niche=(channel.get("keywords", "") or "").split(",")[0].strip() or "",
                    current_tags=cur_tags,
                    channel_context=channel_context,
                )
                return {"sets": sets or [], "error": err or ""}
            except Exception as e:
                print(f"[missing-tags] generate error: {e}")
                return {"sets": [], "error": str(e)}

        out = cached_ai_output(
            function_name="feed_missing_tags",
            inputs=cache_inputs,
            ttl_hours=24 * 30,
            fetch_fn=_fetch,
        )

        sets = out.get("sets") or []
        # Defensive: ensure each set is a list of strings
        cleaned_sets: list[list[str]] = []
        for s in sets[:3]:
            if not isinstance(s, list):
                continue
            tags = [str(t).strip() for t in s if isinstance(t, str) and t.strip()]
            if 5 <= len(tags) <= 20:
                cleaned_sets.append(tags[:15])

        if diag_out is not None:
            diag_out["sets_received"] = len(sets)
            diag_out["sets_cleaned"]  = len(cleaned_sets)
            diag_out["error"]         = (out.get("error") or "")[:200]

        if cleaned_sets:
            return {
                "ok":          True,
                "video":       video_payload,
                "tag_sets":    cleaned_sets,
                "age_label":   _age_label(pick.get("published_at", "")),
                "source":      "feed_generated",
            }
        return None

    diag_walk = []
    for pick in candidates[:MAX_TRIES]:
        per = {"video_id": pick.get("video_id", ""), "title": (pick.get("title") or "")[:60]}
        try:
            result = _try_pick(pick, diag_out=per if debug else None)
        except Exception as e:
            import traceback as _tb
            per["outcome"] = "exception"
            per["error"]   = str(e)
            per["trace"]   = _tb.format_exc().splitlines()[-6:]
            print(f"[missing-tags] _try_pick exception for '{(pick.get('title') or '')[:60]}': {e}")
            diag_walk.append(per)
            continue
        if result:
            if debug:
                per["outcome"] = "yielded_sets"
                result["_debug"] = {"candidates_total": len(candidates), "walk": diag_walk + [per]}
                return JSONResponse(result)
            return JSONResponse(result)
        per["outcome"] = "no_sets"
        diag_walk.append(per)

    if debug:
        return JSONResponse({"ok": True, "video": None, "_debug": {"candidates_total": len(candidates), "max_tries": MAX_TRIES, "walk": diag_walk}})
    return JSONResponse({"ok": True, "video": None})


_UNANSWERED_COMMENT_TTL_HOURS = 12


def _read_unanswered_comment_cache(db, channel_id):
    try:
        row = db.query(UnansweredCommentCache).filter_by(channel_id=channel_id).first()
        if not row:
            return None
        cached_at = row.cached_at
        if cached_at and cached_at.tzinfo is None:
            cached_at = cached_at.replace(tzinfo=datetime.timezone.utc)
        if not cached_at:
            return None
        age_h = (datetime.datetime.now(datetime.timezone.utc) - cached_at).total_seconds() / 3600
        if age_h >= _UNANSWERED_COMMENT_TTL_HOURS:
            return None
        try:
            return json.loads(row.result_json)
        except Exception:
            return None
    except Exception as e:
        print(f"[unanswered-comment] cache read error: {e}")
        return None


def _write_unanswered_comment_cache(db, channel_id, payload):
    try:
        row = db.query(UnansweredCommentCache).filter_by(channel_id=channel_id).first()
        body = json.dumps(payload, default=str)
        now = datetime.datetime.now(datetime.timezone.utc)
        if row:
            row.result_json = body
            row.cached_at   = now
        else:
            db.add(UnansweredCommentCache(channel_id=channel_id, result_json=body, cached_at=now))
        db.commit()
    except Exception as e:
        print(f"[unanswered-comment] cache write error: {e}")
        try: db.rollback()
        except Exception: pass


def _invalidate_unanswered_comment_cache(channel_id):
    """Called after the user posts a reply so the next Feed load picks a
    different unanswered comment instead of re-surfacing the one they
    just answered."""
    db = SessionLocal()
    try:
        row = db.query(UnansweredCommentCache).filter_by(channel_id=channel_id).first()
        if row:
            db.delete(row)
            db.commit()
    except Exception as e:
        print(f"[unanswered-comment] invalidate error: {e}")
        try: db.rollback()
        except Exception: pass
    finally:
        db.close()


@router.get("/unanswered-comment")
def unanswered_comment(request: Request, force: int = 0):
    """Feed card: surface ONE unanswered comment on one of the user's
    recent videos, plus 3 AI reply drafts the user can post with one click.

    Cost cold cache: up to MAX_VIDEOS commentThreads.list calls (1 unit
    each). Cost warm cache (12h): 0 units. Posting a reply costs 50
    units, but that fires only on user click via /post-comment-reply.
    """
    debug = request.query_params.get("debug") == "1"

    import os as _os
    if _os.getenv("YT_QUOTA_PAUSED") == "1":
        return JSONResponse({"ok": True, "comment": None})

    data, creds = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"ok": False, "reason": "not_authenticated"}, status_code=401)

    channel = (data or {}).get("channel", {}) or {}
    videos  = (data or {}).get("videos",  []) or []
    channel_id = channel.get("channel_id", "") or ""
    if not channel_id or not videos:
        return JSONResponse({"ok": True, "comment": None})

    from app.insights import parse_duration_seconds
    from app.youtube import get_unanswered_comments_for_video
    from app.seo import generate_comment_reply_suggestions
    from app.utils import cached_ai_output
    import hashlib as _hashlib

    MAX_VIDEOS = 3  # Cap quota: at most MAX_VIDEOS commentThreads.list calls per cold pick

    db = SessionLocal()
    try:
        if not force:
            cached = _read_unanswered_comment_cache(db, channel_id)
            if cached is not None:
                return JSONResponse(cached)

        def _meaningful(t: str) -> bool:
            stripped = " ".join(w for w in (t or "").split() if not w.startswith("#")).strip()
            return len(stripped) >= 15

        videos_sorted = sorted(videos, key=lambda x: (x.get("published_at") or ""), reverse=True)
        candidate_videos = [v for v in videos_sorted if _meaningful(v.get("title") or "")][:MAX_VIDEOS]

        diag_walk = []
        chosen = None
        for v in candidate_videos:
            video_id = v.get("video_id", "")
            if not video_id:
                continue
            unanswered = get_unanswered_comments_for_video(creds, channel_id, video_id, max_results=20)
            diag_walk.append({"video_id": video_id, "title": (v.get("title") or "")[:60], "unanswered_count": len(unanswered)})
            if unanswered:
                chosen = (v, unanswered[0])
                break

        if not chosen:
            payload = {"ok": True, "comment": None}
            if debug:
                payload["_debug"] = {"candidates": diag_walk}
            _write_unanswered_comment_cache(db, channel_id, {"ok": True, "comment": None})
            return JSONResponse(payload)

        v, c = chosen
        video_payload = {
            "video_id":   v.get("video_id", ""),
            "title":      (v.get("title") or "").strip(),
            "thumbnail":  v.get("thumbnail", ""),
            "is_short":   parse_duration_seconds(v.get("duration", "PT0S")) <= 60,
        }
        comment_payload = {
            "comment_id":   c.get("comment_id", ""),
            "thread_id":    c.get("thread_id", ""),
            "text":         c.get("text", ""),
            "author_name":  c.get("author_name", ""),
            "author_image": c.get("author_image", ""),
            "published_at": c.get("published_at", ""),
            "like_count":   c.get("like_count", 0),
        }

        comment_hash = _hashlib.sha256(c.get("text", "").encode("utf-8")).hexdigest()[:16]
        cache_inputs = {
            "comment_hash":   comment_hash,
            "channel_kw":     (channel.get("keywords", "") or "").lower()[:200],
            "video_title":    video_payload["title"][:120],
            "prompt_version": "feed_comment_reply_v1",
        }

        def _fetch():
            try:
                replies, err = generate_comment_reply_suggestions(
                    comment_text=c.get("text", ""),
                    comment_author=c.get("author_name", ""),
                    video_title=video_payload["title"],
                    channel_name=channel.get("channel_name", "") or "",
                    channel_keywords=channel.get("keywords", "") or "",
                )
                return {"replies": replies or [], "error": err or ""}
            except Exception as e:
                print(f"[unanswered-comment] generate error: {e}")
                return {"replies": [], "error": str(e)}

        out = cached_ai_output(
            function_name="feed_comment_reply",
            inputs=cache_inputs,
            ttl_hours=24 * 7,
            fetch_fn=_fetch,
        )
        replies = [r for r in (out.get("replies") or []) if isinstance(r, str) and r.strip()][:3]
        if not replies:
            payload = {"ok": True, "comment": None}
            if debug:
                payload["_debug"] = {"candidates": diag_walk, "claude_error": (out.get("error") or "")[:200]}
            _write_unanswered_comment_cache(db, channel_id, {"ok": True, "comment": None})
            return JSONResponse(payload)

        payload = {
            "ok":       True,
            "video":    video_payload,
            "comment":  comment_payload,
            "replies":  replies,
            "source":   "feed_generated",
        }
        if debug:
            payload["_debug"] = {"candidates": diag_walk}
        _write_unanswered_comment_cache(db, channel_id, {k: v for k, v in payload.items() if k != "_debug"})
        return JSONResponse(payload)
    finally:
        db.close()


class _PostCommentReplyBody(BaseModel):
    parent_id:  str
    reply_text: str


@router.post("/post-comment-reply")
def post_comment_reply_route(body: _PostCommentReplyBody, request: Request):
    """User-action endpoint: post a reply to one YouTube comment thread.
    Costs 50 quota units per successful insert. Only fires on explicit
    user click. On success, invalidates the unanswered-comment cache so
    the next Feed load picks a different comment."""
    import os as _os
    if _os.getenv("YT_QUOTA_PAUSED") == "1":
        return JSONResponse({"ok": False, "error": "Posting is temporarily disabled."}, status_code=503)

    data, creds = get_session(request.session.get("session_id"))
    if not creds:
        return JSONResponse({"ok": False, "error": "Not authenticated."}, status_code=401)

    parent_id  = (body.parent_id or "").strip()
    reply_text = (body.reply_text or "").strip()
    if not parent_id or not reply_text:
        return JSONResponse({"ok": False, "error": "Missing parent_id or reply_text."}, status_code=400)
    if len(reply_text) > 1000:
        return JSONResponse({"ok": False, "error": "Reply too long."}, status_code=400)

    from app.youtube import post_comment_reply as _post

    ok, err = _post(creds, parent_id, reply_text)
    if not ok:
        return JSONResponse({"ok": False, "error": err or "Could not post reply."}, status_code=500)

    channel_id = (data or {}).get("channel", {}).get("channel_id", "") or ""
    if channel_id:
        _invalidate_unanswered_comment_cache(channel_id)

    return JSONResponse({"ok": True})
