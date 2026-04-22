from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.seo import analyze_title, generate_description_suggestions, generate_thumbnail_text, optimize_video
from app.keywords import generate_intent_options
from routers.auth import get_session
from database.models import SessionLocal, VideoOptimizeCache, SeoOptimization
from app.analysis_gate import check_and_deduct, refund_credit
import json, datetime

router = APIRouter()


class TitleIntentRequest(BaseModel):
    title: str


class TitleAnalyzeRequest(BaseModel):
    title: str
    confirmed_keyword: str = ""


class DescriptionRequest(BaseModel):
    title: str
    current_description: str = ""
    niche: str = ""
    intent_analysis: dict = None
    keyword_scores: list = None
    current_year: int = 2026


class ThumbnailTextRequest(BaseModel):
    title: str
    niche: str = ""


@router.post("/intent-options")
def intent_options(body: TitleIntentRequest):
    """
    Fast pre-analysis step: given a title, return 3 keyword intent options.
    The frontend shows these as a picker before the full analysis runs.
    """
    if not body.title.strip():
        return JSONResponse({"error": "Title cannot be empty."}, status_code=400)
    options, error = generate_intent_options(body.title.strip())
    if error and not options:
        return JSONResponse({"error": error}, status_code=500)
    return JSONResponse({"options": options})


@router.post("/analyze")
def analyze(body: TitleAnalyzeRequest, request: Request):
    data, creds = get_session(request.session.get("session_id"))
    if not creds:
        return JSONResponse({"error": "Not authenticated. Please login first."}, status_code=401)
    if not body.title.strip():
        return JSONResponse({"error": "Title cannot be empty."}, status_code=400)
    channel_id = (data or {}).get("channel", {}).get("channel_id", "")
    gate = check_and_deduct(channel_id)
    if not gate["allowed"]:
        return JSONResponse({"error": gate["message"], "show_upgrade": True}, status_code=402)
    try:
        result = analyze_title(creds, body.title.strip(), confirmed_keyword=body.confirmed_keyword.strip())
    except Exception as e:
        refund_credit(channel_id)
        return JSONResponse({"error": "Analysis failed. Your credit has been refunded."}, status_code=500)
    result["_usage"] = {"warning": gate["warning"], "usage_pct": gate["usage_pct"]}
    return JSONResponse(result)


@router.post("/generate-description")
def generate_description(body: DescriptionRequest, request: Request):
    if not body.title.strip():
        return JSONResponse({"error": "Title cannot be empty."}, status_code=400)

    # Inject channel context from session when available — helps Claude stay on-brand
    channel_context = None
    data, _ = get_session(request.session.get("session_id"))
    if data:
        ch = data.get("channel", {})
        videos = data.get("videos", []) or []
        top_titles = [v.get("title", "") for v in sorted(videos, key=lambda v: v.get("views", 0), reverse=True)[:5] if v.get("title")]
        channel_context = {
            "channel_name":    ch.get("channel_name", ""),
            "channel_keywords": ch.get("keywords", ""),
            "top_video_titles": top_titles,
        }

    descriptions, top_keywords, error = generate_description_suggestions(
        body.title.strip(),
        body.current_description.strip(),
        body.niche.strip(),
        intent_analysis=body.intent_analysis,
        keyword_scores=body.keyword_scores,
        current_year=body.current_year,
        channel_context=channel_context,
    )
    if error and not descriptions:
        return JSONResponse({"error": error}, status_code=500)
    return JSONResponse({"descriptions": descriptions, "top_keywords": top_keywords})


@router.post("/thumbnail-text")
def thumbnail_text(body: ThumbnailTextRequest):
    if not body.title.strip():
        return JSONResponse({"error": "Title cannot be empty."}, status_code=400)
    options, error = generate_thumbnail_text(body.title.strip(), body.niche.strip())
    if error and not options:
        return JSONResponse({"error": error}, status_code=500)
    return JSONResponse({"options": options})


class OptimizeVideoRequest(BaseModel):
    video_id: str
    title: str
    thumbnail_url: str
    views: int = 0
    likes: int = 0


@router.post("/optimize-video")
def optimize_video_route(body: OptimizeVideoRequest, request: Request):
    data, creds = get_session(request.session.get("session_id"))
    if not creds:
        return JSONResponse({"error": "Not authenticated. Please login first."}, status_code=401)
    # Credit is charged by /seo/analyze which runs in parallel in the frontend.
    # optimize-video is the description/thumbnail half of the same operation — no double charge.
    result = optimize_video(
        creds,
        body.video_id,
        body.title,
        body.thumbnail_url,
        body.views,
        body.likes,
    )
    if result.get("error") and not result.get("analysis"):
        return JSONResponse({"error": result["error"]}, status_code=500)
    return JSONResponse(result)


class UpdateVideoRequest(BaseModel):
    video_id: str
    title: str = ""
    description: str = ""


@router.post("/update-video")
def update_video_route(body: UpdateVideoRequest, request: Request):
    data, creds = get_session(request.session.get("session_id"))
    if not creds:
        return JSONResponse({"error": "Not authenticated. Please login first."}, status_code=401)
    if not body.title and not body.description:
        return JSONResponse({"error": "Nothing to update."}, status_code=400)
    try:
        from googleapiclient.discovery import build
        youtube = build("youtube", "v3", credentials=creds)
        # Fetch snippet + statistics so we can snapshot the "before" state for result tracking
        resp = youtube.videos().list(part="snippet,statistics", id=body.video_id).execute()
        items = resp.get("items", [])
        if not items:
            return JSONResponse({"error": "Video not found."}, status_code=404)
        snippet    = items[0]["snippet"]
        statistics = items[0].get("statistics", {})

        before_title       = snippet.get("title", "")
        before_description = snippet.get("description", "")
        before_views       = int(statistics.get("viewCount", 0))
        before_likes       = int(statistics.get("likeCount", 0))
        before_comments    = int(statistics.get("commentCount", 0))
        thumbnail_url      = (snippet.get("thumbnails", {}).get("medium") or snippet.get("thumbnails", {}).get("default") or {}).get("url")

        if body.title:
            snippet["title"] = body.title
        if body.description:
            snippet["description"] = body.description
        youtube.videos().update(
            part="snippet",
            body={"id": body.video_id, "snippet": snippet},
        ).execute()

        # Write SeoOptimization row — one per update, never merged, so the user
        # can see each optimization attempt separately in "Your optimizations"
        channel_id = (data or {}).get("channel", {}).get("channel_id", "")
        if channel_id:
            db = SessionLocal()
            try:
                row = SeoOptimization(
                    channel_id         = channel_id,
                    video_id           = body.video_id,
                    thumbnail_url      = thumbnail_url,
                    before_title       = before_title,
                    before_description = before_description,
                    before_views       = before_views,
                    before_likes       = before_likes,
                    before_comments    = before_comments,
                    after_title        = body.title or before_title,
                    after_description  = body.description or before_description,
                    current_views      = before_views,
                    current_likes      = before_likes,
                    current_comments   = before_comments,
                )
                db.add(row)
                db.commit()
            except Exception as snap_err:
                print(f"optimization snapshot error: {snap_err}")
            finally:
                db.close()

        return JSONResponse({"ok": True})
    except Exception as e:
        err = str(e)
        print(f"update_video error: {err}")
        if "insufficientPermissions" in err or "insufficient authentication scopes" in err.lower():
            return JSONResponse(
                {"error": "Your session doesn't have write permission. Please log out and log back in to grant access."},
                status_code=403,
            )
        return JSONResponse({"error": err}, status_code=500)


# ── Your optimizations — result tracking (shows the tool moved the numbers) ───

@router.get("/optimizations")
def list_optimizations(request: Request):
    """
    Returns every /seo/update-video optimization for this channel, with current
    view/like/comment stats refreshed lazily if the snapshot is >6h old. The
    frontend uses this to render the "Your optimizations" card at the top of
    SEO Optimizer.
    """
    data, creds = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)
    channel_id = data.get("channel", {}).get("channel_id", "") or data.get("channel_id", "")
    if not channel_id:
        return JSONResponse({"optimizations": []})

    db = SessionLocal()
    try:
        rows = (
            db.query(SeoOptimization)
              .filter_by(channel_id=channel_id)
              .order_by(SeoOptimization.optimized_at.desc())
              .limit(20)
              .all()
        )
        if not rows:
            return JSONResponse({"optimizations": []})

        # Lazy refresh: find rows whose stats snapshot is >6h old and re-fetch in one batch.
        stale_cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=6)
        stale_rows = [r for r in rows if _as_utc(r.stats_refreshed_at) < stale_cutoff]
        if stale_rows and creds:
            try:
                from googleapiclient.discovery import build
                youtube = build("youtube", "v3", credentials=creds)
                # Batch in chunks of 50 (YouTube API limit)
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
                            r.stats_refreshed_at = datetime.datetime.now(datetime.timezone.utc)
                db.commit()
            except Exception as e:
                print(f"optimizations stats refresh error: {e}")

        out = []
        for r in rows:
            out.append({
                "video_id":          r.video_id,
                "thumbnail_url":     r.thumbnail_url,
                "before_title":      r.before_title,
                "after_title":       r.after_title,
                "before_views":      r.before_views or 0,
                "before_likes":      r.before_likes or 0,
                "before_comments":   r.before_comments or 0,
                "current_views":     r.current_views or 0,
                "current_likes":     r.current_likes or 0,
                "current_comments":  r.current_comments or 0,
                "optimized_at":      r.optimized_at.isoformat() if r.optimized_at else None,
            })
        return JSONResponse({"optimizations": out})
    finally:
        db.close()


def _as_utc(dt):
    """Normalise SQLite's naive datetimes to UTC for comparison."""
    if dt is None:
        return datetime.datetime.min.replace(tzinfo=datetime.timezone.utc)
    if dt.tzinfo is None:
        return dt.replace(tzinfo=datetime.timezone.utc)
    return dt


# ── Optimize cache (persisted to Postgres) ────────────────────────────────────

class SaveOptimizeCacheRequest(BaseModel):
    video_id:    str
    result_json: str   # JSON-encoded full result object


@router.get("/optimize-cache/{video_id}")
def get_optimize_cache(video_id: str, request: Request):
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)
    channel_id = data.get("channel_id", "")
    db = SessionLocal()
    try:
        row = db.query(VideoOptimizeCache).filter_by(channel_id=channel_id, video_id=video_id).first()
        if not row:
            return JSONResponse({"cached": None})
        return JSONResponse({"cached": json.loads(row.result_json)})
    finally:
        db.close()


@router.post("/optimize-cache")
def save_optimize_cache(body: SaveOptimizeCacheRequest, request: Request):
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)
    channel_id = data.get("channel_id", "")
    db = SessionLocal()
    try:
        row = db.query(VideoOptimizeCache).filter_by(channel_id=channel_id, video_id=body.video_id).first()
        if row:
            row.result_json = body.result_json
        else:
            row = VideoOptimizeCache(channel_id=channel_id, video_id=body.video_id, result_json=body.result_json)
            db.add(row)
        db.commit()
        return JSONResponse({"ok": True})
    finally:
        db.close()


@router.delete("/optimize-cache/{video_id}")
def delete_optimize_cache(video_id: str, request: Request):
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)
    channel_id = data.get("channel_id", "")
    db = SessionLocal()
    try:
        db.query(VideoOptimizeCache).filter_by(channel_id=channel_id, video_id=video_id).delete()
        db.commit()
        return JSONResponse({"ok": True})
    finally:
        db.close()
