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
from database.models import SessionLocal, CompetitorVideoIdeas, CompetitorAnalysisCache

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


def _persist_full_analysis(channel_id: str, competitor_id: str, result: dict):
    """Upsert full competitor analysis result to the DB."""
    if not result:
        return
    import datetime as _dt
    db = SessionLocal()
    try:
        row = db.query(CompetitorAnalysisCache).filter_by(
            channel_id=channel_id,
            competitor_id=competitor_id,
        ).first()
        if row:
            row.result_json = json.dumps(result)
            row.analyzed_at = _dt.datetime.utcnow()
        else:
            db.add(CompetitorAnalysisCache(
                channel_id=channel_id,
                competitor_id=competitor_id,
                result_json=json.dumps(result),
            ))
        db.commit()
    except Exception as e:
        print(f"[competitor_routes] Failed to persist full analysis: {e}")
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

    # Persist full analysis (enriched with channel metadata) for channel insights
    full_result = {
        **ai_analysis,
        "channel_name":       comp_data.get("channel_name"),
        "subscribers":        comp_data.get("subscribers"),
        "avg_views_per_video": comp_data.get("avg_views_per_video"),
        # Metadata needed to rebuild the tracked-competitors list server-side
        "_competitor_meta": {
            "channel_id":   channel_id,
            "channel_name": comp_data.get("channel_name", ""),
            "handle":       comp_data.get("handle", ""),
            "thumbnail":    comp_data.get("thumbnail", ""),
            "subscribers":  comp_data.get("subscribers", 0),
        },
        # Subscriber count used by video_ideas signal scoring
        "_meta": {
            "competitor_subscribers": comp_data.get("subscribers", 0),
        },
    }
    _persist_full_analysis(my_channel_id, channel_id, full_result)

    return JSONResponse({
        "my_stats": my_stats,
        "competitor": comp_data,
        "ai_analysis": ai_analysis,
    })


@router.get("/tracked")
def get_tracked_competitors(request: Request):
    """
    Return all competitors this user has previously analyzed — rebuilt from DB.
    Used to restore the tracked list when localStorage is cleared or user switches devices.
    """
    data, creds = get_session(request.session.get("session_id"))
    if not data or not creds:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)

    my_channel_id = data["channel"]["channel_id"]

    db = SessionLocal()
    try:
        rows = (
            db.query(CompetitorAnalysisCache)
            .filter_by(channel_id=my_channel_id)
            .order_by(CompetitorAnalysisCache.analyzed_at.desc())
            .all()
        )

        seen = set()
        tracked = []
        for row in rows:
            try:
                result = json.loads(row.result_json)
            except Exception:
                continue

            meta = result.get("_competitor_meta", {})
            comp_id = meta.get("channel_id") or row.competitor_id
            if comp_id in seen:
                continue
            seen.add(comp_id)

            tracked.append({
                "competitor": {
                    "channel_id":   comp_id,
                    "channel_name": meta.get("channel_name", result.get("channel_name", "")),
                    "handle":       meta.get("handle", ""),
                    "thumbnail":    meta.get("thumbnail", ""),
                    "subscribers":  meta.get("subscribers", result.get("subscribers", 0)),
                },
                "ai_analysis": {k: v for k, v in result.items() if not k.startswith("_")},
                "savedAt": row.analyzed_at.isoformat() if row.analyzed_at else None,
            })

        return JSONResponse({"tracked": tracked})
    finally:
        db.close()
