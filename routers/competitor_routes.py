from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse
from app.competitors import search_competitor_channels, get_competitor_stats, generate_competitor_gaps, extract_niche_keywords
from routers.auth import _user_data, _user_creds
from app.insights import calculate_upload_frequency

router = APIRouter()


def _get_session(request: Request):
    session_id = request.session.get("session_id")
    data  = _user_data.get(session_id) if session_id else None
    creds = _user_creds.get(session_id) if session_id else None
    return data, creds


@router.get("/suggest")
def suggest_competitors(request: Request):
    data, creds = _get_session(request)
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
    _, creds = _get_session(request)
    if not creds:
        return JSONResponse({"error": "No credentials. Please login first."}, status_code=404)
    results = search_competitor_channels(creds, q, max_results=8)
    return JSONResponse({"results": results})


@router.get("/analyze/{channel_id}")
def analyze_competitor(channel_id: str, request: Request):
    data, creds = _get_session(request)
    if not data or not creds:
        return JSONResponse({"error": "No channel data. Please login first."}, status_code=404)
    comp_stats = get_competitor_stats(creds, channel_id)
    if not comp_stats:
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
        "like_rate": like_rate
    }
    gaps = generate_competitor_gaps(my_stats, comp_stats)
    return JSONResponse({
        "my_stats": my_stats,
        "competitor": comp_stats,
        "gaps": gaps
    })
