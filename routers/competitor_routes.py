from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse
from app.competitors import (
    search_competitor_channels,
    fetch_competitor_public_data,
    analyze_competitor_with_ai,
    generate_competitor_gaps,
    extract_niche_keywords,
)
from routers.auth import get_session
from app.insights import calculate_upload_frequency
from app.analysis_gate import check_and_deduct

router = APIRouter()


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

    my_channel_id = data.get("channel", {}).get("channel_id", "")
    gate = check_and_deduct(my_channel_id)
    if not gate["allowed"]:
        return JSONResponse({"error": gate["message"], "show_upgrade": True}, status_code=402)

    comp_data = fetch_competitor_public_data(creds, channel_id)
    if not comp_data:
        return JSONResponse({"error": "Could not fetch competitor data."}, status_code=404)

    videos = data.get("videos", [])
    total_likes = sum(v.get("likes", 0) for v in videos)
    total_views = sum(v.get("views", 0) for v in videos)
    like_rate = round(total_likes / total_views * 100, 2) if total_views > 0 else 0

    my_stats = {
        "subscribers": data["channel"]["subscribers"],
        "total_views": data["channel"]["total_views"],
        "video_count": data["channel"]["video_count"],
        "avg_views_per_video": round(data["channel"]["total_views"] / max(data["channel"]["video_count"], 1)),
        "upload_frequency": calculate_upload_frequency(videos),
        "like_rate": like_rate,
    }

    gaps = generate_competitor_gaps(my_stats, comp_data)
    ai_analysis = analyze_competitor_with_ai(data["channel"], videos, comp_data)

    return JSONResponse({
        "my_stats": my_stats,
        "competitor": comp_data,
        "gaps": gaps,
        "ai_analysis": ai_analysis,
    })
