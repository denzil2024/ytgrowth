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
from app.analysis_gate import check_and_deduct, check_free_tier_access
from app.outliers import search_outliers
from app.keywords import generate_intent_options
from app.competitors import extract_niche_keywords
import datetime
from database.models import SessionLocal, OutliersSearchCache, OutliersReport

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

    # Free-tier feature gate — Outliers is fully gated for free users.
    feat_gate = check_free_tier_access(channel_id, "outliers")
    if not feat_gate["allowed"]:
        return JSONResponse(
            {"error": "locked", "feature": "outliers", "reason": feat_gate.get("reason", "locked")},
            status_code=403,
        )

    # Outliers ships 3 distinct reports in one search (videos / thumbnails /
    # channels) — charge accordingly.
    gate = check_and_deduct(channel_id, amount=3)
    if not gate["allowed"]:
        return JSONResponse(
            {"error": gate["message"], "show_upgrade": True},
            status_code=402,
        )

    # Cap confirmed_keyword at 160 chars — matches the frontend input limit for
    # the "type your own intent" manual option.
    confirmed = (body.confirmed_keyword or "").strip()[:160]

    # Niche keywords derived from the user's own channel + top videos — same
    # helper the Competitors feature uses to figure out the user's niche.
    niche_keywords = extract_niche_keywords(channel, (data or {}).get("videos", []))

    try:
        result = search_outliers(
            creds, query,
            my_channel_id     = channel_id,
            my_subscribers    = subscribers,
            my_niche_keywords = niche_keywords,
            confirmed_keyword = confirmed,
        )
    except Exception as e:
        return JSONResponse(
            {"error": "Something went wrong on our end. Email support@ytgrowth.io and we'll sort it out."},
            status_code=500,
        )

    if result.get("error"):
        return JSONResponse(
            {"error": "Something went wrong on our end. Email support@ytgrowth.io and we'll sort it out."},
            status_code=500,
        )

    # No useful results: still costs us — Claude / search ran. Don't refund.
    if not result.get("videos") and not result.get("channels"):
        return JSONResponse({
            "videos":   [],
            "channels": [],
            "cohort":   result.get("cohort", {}),
            "message":  "No outliers found for this topic at your channel size. Try a broader keyword.",
        })

    # Persist the result to the DB. Tab-agnostic — the three UI tabs will all
    # render different slices of this single payload. Survives refresh / logout
    # / tab switch until the user triggers a new search or clears explicitly.
    # ALSO persist to the Reports history table (dedup per query+intent) so the
    # user can always reopen past charged searches.
    if channel_id:
        db = SessionLocal()
        try:
            payload = json.dumps(result)
            row = db.query(OutliersSearchCache).filter_by(channel_id=channel_id).first()
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

            # Reports history — dedup on (channel_id, query_lower, intent_lower)
            q_lower = query.lower()
            intent_lower = (confirmed or "").lower()
            report = (
                db.query(OutliersReport)
                  .filter_by(channel_id=channel_id, query_lower=q_lower, confirmed_keyword_lower=intent_lower)
                  .first()
            )
            if report:
                report.query = query
                report.confirmed_keyword = confirmed
                report.result_json = payload
                report.updated_at = datetime.datetime.utcnow()
            else:
                db.add(OutliersReport(
                    channel_id              = channel_id,
                    query                   = query,
                    query_lower             = q_lower,
                    confirmed_keyword       = confirmed,
                    confirmed_keyword_lower = intent_lower,
                    result_json             = payload,
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


# ─── Reports — list / open / delete ────────────────────────────────────────────

@router.get("/reports")
def list_outlier_reports(request: Request):
    data, _ = get_session(request.session.get("session_id"))
    channel_id = (data or {}).get("channel", {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"reports": []})
    db = SessionLocal()
    try:
        rows = (
            db.query(OutliersReport)
              .filter_by(channel_id=channel_id)
              .order_by(OutliersReport.updated_at.desc())
              .all()
        )
        reports = []
        for r in rows:
            try:
                result = json.loads(r.result_json)
            except Exception:
                result = None
            reports.append({
                "id": r.id,
                "query": r.query,
                "confirmed_keyword": r.confirmed_keyword or "",
                "result": result,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "updated_at": r.updated_at.isoformat() if r.updated_at else None,
            })
        return JSONResponse({"reports": reports})
    finally:
        db.close()


@router.delete("/reports/{report_id}")
def delete_outlier_report(report_id: int, request: Request):
    data, _ = get_session(request.session.get("session_id"))
    channel_id = (data or {}).get("channel", {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)
    db = SessionLocal()
    try:
        row = db.query(OutliersReport).filter_by(id=report_id, channel_id=channel_id).first()
        if row:
            db.delete(row)
            db.commit()
        return JSONResponse({"ok": True})
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
