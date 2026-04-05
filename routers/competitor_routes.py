import json
from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse
from app.competitors import (
    search_competitor_channels,
    fetch_competitor_public_data,
    analyze_competitor_with_ai,
    extract_niche_keywords,
)
from routers.auth import get_session
from app.insights import calculate_upload_frequency
from app.analysis_gate import check_and_deduct
from app.utils import compute_like_rate
from database.models import SessionLocal, CompetitorVideoIdeas

router = APIRouter()


def _persist_video_ideas(channel_id: str, competitor_id: str, ideas: list):
    """Save videoIdeas from a competitor analysis to the DB."""
    if not ideas:
        return
    db = SessionLocal()
    try:
        row = CompetitorVideoIdeas(
            channel_id=channel_id,
            competitor_id=competitor_id,
            ideas_json=json.dumps(ideas),
        )
        db.add(row)
        db.commit()
    except Exception as e:
        print(f"[competitor_routes] Failed to persist video ideas: {e}")
        db.rollback()
    finally:
        db.close()


@router.get("/suggest")
def suggest_competitors(request: Request):
    data, creds = get_session(request.session.get("session_id"))
    if not data or not creds:
        return JSONResponse({"error": "No channel data. Please login first."}, status_code=404)
    keywords = extract_niche_keywords(data["channel"], data.get("videos", []))
    query = " ".join(keywords) if keywords else data["channel"]["channel_name"]
    suggestions = search_competitor_channels(creds, query, max_results=6)
    my_id = data["channel"]["channel_id"]
    suggestions = [s for s in suggestions if s["channel_id"] != my_id]
    return JSONResponse({"suggestions": suggestions[:5], "query_used": query})


@router.get("/search")
def search_competitors(request: Request, q: str = Query(...)):
    _, creds = get_session(request.session.get("session_id"))
    if not creds:
        return JSONResponse({"error": "No credentials. Please login first."}, status_code=404)
    results = search_competitor_channels(creds, q, max_results=8)
    return JSONResponse({"results": results})


@router.get("/analyze/{channel_id}")
def analyze_competitor(channel_id: str, request: Request):
    data, creds = get_session(request.session.get("session_id"))
    if not data or not creds:
        return JSONResponse({"error": "No channel data. Please login first."}, status_code=404)

    comp_data = fetch_competitor_public_data(creds, channel_id)
    if not comp_data:
        return JSONResponse({"error": "Could not fetch competitor data."}, status_code=404)

    videos = data.get("videos", [])
    my_stats = {
        "subscribers": data["channel"]["subscribers"],
        "total_views": data["channel"]["total_views"],
        "video_count": data["channel"]["video_count"],
        "avg_views_per_video": round(data["channel"]["total_views"] / max(data["channel"]["video_count"], 1)),
        "upload_frequency": calculate_upload_frequency(videos),
        "like_rate": compute_like_rate(videos),
    }

    ai_analysis = analyze_competitor_with_ai(data["channel"], videos, comp_data)

    if not isinstance(ai_analysis, dict):
        return JSONResponse({"error": f"AI analysis failed: {ai_analysis}"}, status_code=500)

    # Persist video ideas so the Video Ideas tab can pool them for free
    my_channel_id = data["channel"]["channel_id"]
    _persist_video_ideas(my_channel_id, channel_id, ai_analysis.get("videoIdeas", []))

    return JSONResponse({
        "my_stats": my_stats,
        "competitor": comp_data,
        "ai_analysis": ai_analysis,
    })
