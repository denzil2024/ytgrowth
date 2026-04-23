"""
Outliers API.

POST /outliers/intent-options — body {"query": str}
    Fast Haiku call; returns 3 intent options via the SEO Optimizer's
    generate_intent_options() (identical prompt, single source of truth).
    Not credit-gated — runs before the paid search.

POST /outliers/search — body {"query": str, "confirmed_keyword": str}
    Credit-gated (1 credit). Runs a single unified search and returns videos +
    breakout channels + keyword scores in one payload. Persists the result to
    outliers_search_cache keyed by channel_id so the three UI tabs can all
    display different views of the same result across refreshes and sessions.

GET  /outliers/cache   — returns the saved search for this channel (or null).
DELETE /outliers/cache — clears the saved search (used when the user hits
    "New search" / explicit clear).
"""
import json

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from routers.auth import get_session
from app.analysis_gate import check_and_deduct, refund_credit
from app.outliers import search_outliers
from app.keywords import generate_intent_options
from database.models import SessionLocal, OutliersSearchCache

router = APIRouter()


class IntentBody(BaseModel):
    query: str


@router.post("/intent-options")
def intent_options(body: IntentBody):
    """Calls the SAME generate_intent_options() the SEO Optimizer uses."""
    q = (body.query or "").strip()
    if not q:
        return JSONResponse({"error": "Query cannot be empty."}, status_code=400)
    options, error = generate_intent_options(q)
    if error and not options:
        return JSONResponse({"error": error}, status_code=500)
    return JSONResponse({"options": options})


class SearchBody(BaseModel):
    query: str
    confirmed_keyword: str = ""


@router.post("/search")
def search(body: SearchBody, request: Request):
    data, creds = get_session(request.session.get("session_id"))
    if not creds or not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)

    query = (body.query or "").strip()
    if not query:
        return JSONResponse({"error": "Query cannot be empty."}, status_code=400)

    channel     = (data or {}).get("channel", {})
    channel_id  = channel.get("channel_id", "")
    subscribers = int(channel.get("subscribers", 0) or 0)

    gate = check_and_deduct(channel_id)
    if not gate["allowed"]:
        return JSONResponse(
            {"error": gate["message"], "show_upgrade": True},
            status_code=402,
        )

    # Cap confirmed_keyword at 160 chars — matches the frontend input limit for
    # the "type your own intent" manual option.
    confirmed = (body.confirmed_keyword or "").strip()[:160]

    try:
        result = search_outliers(creds, query, subscribers, confirmed_keyword=confirmed)
    except Exception as e:
        refund_credit(channel_id)
        return JSONResponse(
            {"error": "Search failed. Your credit has been refunded."},
            status_code=500,
        )

    if result.get("error"):
        refund_credit(channel_id)
        return JSONResponse({"error": result["error"]}, status_code=500)

    # Refund when the user got nothing useful (no videos, no channels).
    if not result.get("videos") and not result.get("channels"):
        refund_credit(channel_id)
        return JSONResponse({
            "videos":   [],
            "channels": [],
            "cohort":   result.get("cohort", {}),
            "message":  "No outliers found for this topic at your channel size. Try a broader keyword.",
        })

    # Persist the result to the DB. Tab-agnostic — the three UI tabs will all
    # render different slices of this single payload. Survives refresh / logout
    # / tab switch until the user triggers a new search or clears explicitly.
    if channel_id:
        db = SessionLocal()
        try:
            row = db.query(OutliersSearchCache).filter_by(channel_id=channel_id).first()
            payload = json.dumps(result)
            if row:
                row.query = query
                row.confirmed_keyword = confirmed
                row.result_json = payload
            else:
                db.add(OutliersSearchCache(
                    channel_id        = channel_id,
                    query             = query,
                    confirmed_keyword = confirmed,
                    result_json       = payload,
                ))
            db.commit()
        except Exception as e:
            print(f"[outliers] cache save error: {e}")
        finally:
            db.close()

    result["_usage"] = {
        "warning":      gate["warning"],
        "usage_pct":    gate["usage_pct"],
        "pack_balance": gate["pack_balance"],
    }
    result["query"] = query
    result["confirmed_keyword"] = confirmed
    return JSONResponse(result)


@router.get("/cache")
def get_cache(request: Request):
    """Returns the saved search for this channel, or {cached: null}."""
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)
    channel_id = (data or {}).get("channel", {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"cached": None})
    db = SessionLocal()
    try:
        row = db.query(OutliersSearchCache).filter_by(channel_id=channel_id).first()
        if not row:
            return JSONResponse({"cached": None})
        try:
            result = json.loads(row.result_json)
        except Exception:
            result = {}
        result["query"] = row.query
        result["confirmed_keyword"] = row.confirmed_keyword or ""
        return JSONResponse({"cached": result})
    finally:
        db.close()


@router.delete("/cache")
def clear_cache(request: Request):
    """Explicit clear — user hit 'New search' or a reset button."""
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)
    channel_id = (data or {}).get("channel", {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"ok": True})
    db = SessionLocal()
    try:
        db.query(OutliersSearchCache).filter_by(channel_id=channel_id).delete()
        db.commit()
        return JSONResponse({"ok": True})
    finally:
        db.close()
