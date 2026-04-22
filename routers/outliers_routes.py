"""
Outliers API.

POST /outliers/search — body {"query": str, "kind": "video"|"thumbnail"|"channel"}
    Credit-gated (1 credit per search). Returns up to N outliers for the given
    keyword/topic filtered by channel-size relevance, each with an outlier score
    and a one-sentence AI explanation.
"""
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from routers.auth import get_session
from app.analysis_gate import check_and_deduct, refund_credit
from app.outliers import search_outliers

router = APIRouter()


class SearchBody(BaseModel):
    query: str
    kind:  str = "video"   # "video" | "thumbnail" | "channel"


@router.post("/search")
def search(body: SearchBody, request: Request):
    data, creds = get_session(request.session.get("session_id"))
    if not creds or not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)

    query = (body.query or "").strip()
    if not query:
        return JSONResponse({"error": "Query cannot be empty."}, status_code=400)

    kind = (body.kind or "video").lower()
    if kind not in ("video", "thumbnail", "channel"):
        return JSONResponse({"error": f"Invalid kind: {body.kind}"}, status_code=400)

    channel     = (data or {}).get("channel", {})
    channel_id  = channel.get("channel_id", "")
    subscribers = int(channel.get("subscribers", 0) or 0)

    gate = check_and_deduct(channel_id)
    if not gate["allowed"]:
        return JSONResponse(
            {"error": gate["message"], "show_upgrade": True},
            status_code=402,
        )

    try:
        result = search_outliers(creds, query, kind, subscribers)
    except Exception as e:
        refund_credit(channel_id)
        return JSONResponse(
            {"error": "Search failed. Your credit has been refunded."},
            status_code=500,
        )

    if result.get("error"):
        refund_credit(channel_id)
        return JSONResponse({"error": result["error"]}, status_code=500)

    if not result.get("results"):
        # No credit spent on a useful output — refund.
        refund_credit(channel_id)
        return JSONResponse({
            "results": [],
            "cohort":  result.get("cohort", {}),
            "message": "No outliers found for this topic at your channel size. Try a broader keyword.",
        })

    result["_usage"] = {
        "warning":      gate["warning"],
        "usage_pct":    gate["usage_pct"],
        "pack_balance": gate["pack_balance"],
    }
    return JSONResponse(result)
