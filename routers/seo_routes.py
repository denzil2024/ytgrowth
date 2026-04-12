from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.seo import analyze_title, generate_description_suggestions, generate_thumbnail_text, optimize_video
from app.keywords import generate_intent_options
from routers.auth import get_session
from database.models import SessionLocal, VideoOptimizeCache
from app.analysis_gate import check_and_deduct
import json

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
    result = analyze_title(creds, body.title.strip(), confirmed_keyword=body.confirmed_keyword.strip())
    result["_usage"] = {"warning": gate["warning"], "usage_pct": gate["usage_pct"]}
    return JSONResponse(result)


@router.post("/generate-description")
def generate_description(body: DescriptionRequest):
    if not body.title.strip():
        return JSONResponse({"error": "Title cannot be empty."}, status_code=400)
    descriptions, error = generate_description_suggestions(
        body.title.strip(),
        body.current_description.strip(),
        body.niche.strip(),
        intent_analysis=body.intent_analysis,
        keyword_scores=body.keyword_scores,
        current_year=body.current_year,
    )
    if error and not descriptions:
        return JSONResponse({"error": error}, status_code=500)
    return JSONResponse({"descriptions": descriptions})


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
    channel_id = (data or {}).get("channel", {}).get("channel_id", "")
    gate = check_and_deduct(channel_id)
    if not gate["allowed"]:
        return JSONResponse({"error": gate["message"], "show_upgrade": True}, status_code=402)
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
    _, creds = get_session(request.session.get("session_id"))
    if not creds:
        return JSONResponse({"error": "Not authenticated. Please login first."}, status_code=401)
    if not body.title and not body.description:
        return JSONResponse({"error": "Nothing to update."}, status_code=400)
    try:
        from googleapiclient.discovery import build
        youtube = build("youtube", "v3", credentials=creds)
        resp = youtube.videos().list(part="snippet", id=body.video_id).execute()
        items = resp.get("items", [])
        if not items:
            return JSONResponse({"error": "Video not found."}, status_code=404)
        snippet = items[0]["snippet"]
        if body.title:
            snippet["title"] = body.title
        if body.description:
            snippet["description"] = body.description
        youtube.videos().update(
            part="snippet",
            body={"id": body.video_id, "snippet": snippet},
        ).execute()
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
