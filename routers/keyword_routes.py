from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from concurrent.futures import ThreadPoolExecutor
import json
import datetime
from app.keywords import (
    scrape_autocomplete,
    analyze_keywords,
    generate_intent_options,
    get_serper_keywords,
    get_serpapi_autocomplete,
    enrich_keywords_with_real_data,
)
from routers.auth import get_session
from app.analysis_gate import check_and_deduct, refund_credit, check_free_tier_access
from database.models import SessionLocal, KeywordsResearchCache

router = APIRouter()


def _save_keywords_cache(channel_id: str, keyword: str, confirmed_keyword: str, result: dict) -> None:
    if not channel_id or not keyword.strip():
        return
    kw_lower = keyword.strip().lower()
    db = SessionLocal()
    try:
        existing = (
            db.query(KeywordsResearchCache)
              .filter_by(channel_id=channel_id, keyword_lower=kw_lower)
              .first()
        )
        payload = json.dumps(result)
        if existing:
            existing.keyword = keyword
            existing.confirmed_keyword = confirmed_keyword or ""
            existing.result_json = payload
            existing.updated_at = datetime.datetime.utcnow()
        else:
            db.add(KeywordsResearchCache(
                channel_id=channel_id,
                keyword=keyword,
                keyword_lower=kw_lower,
                confirmed_keyword=confirmed_keyword or "",
                result_json=payload,
            ))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[keywords] cache save failed: {e}")
    finally:
        db.close()


class KeywordIntentRequest(BaseModel):
    keyword: str


class KeywordResearchRequest(BaseModel):
    keyword: str
    confirmed_keyword: str = ""


@router.post("/intent-options")
def keyword_intent_options(body: KeywordIntentRequest):
    kw = body.keyword.strip()
    if not kw:
        return JSONResponse({"error": "Keyword cannot be empty."}, status_code=400)
    options, error = generate_intent_options(kw)
    if error and not options:
        return JSONResponse({"error": error}, status_code=500)
    return JSONResponse({"options": options})


@router.post("/research")
def research_keywords(body: KeywordResearchRequest, request: Request):
    seed = body.confirmed_keyword.strip() or body.keyword.strip()
    if not seed:
        return JSONResponse({"error": "Keyword cannot be empty."}, status_code=400)
    data, _ = get_session(request.session.get("session_id"))
    channel_id = (data or {}).get("channel", {}).get("channel_id", "")
    # Free-tier feature gate — Keywords is one-run per cycle for free users.
    # Records usage on first successful call; subsequent calls return 403.
    feat = check_free_tier_access(channel_id, "keywords")
    if not feat["allowed"]:
        return JSONResponse(
            {"error": "locked", "feature": "keywords", "reason": feat.get("reason", "locked")},
            status_code=403,
        )
    gate = check_and_deduct(channel_id)
    if not gate["allowed"]:
        return JSONResponse({"error": gate["message"], "show_upgrade": True}, status_code=402)

    try:
        with ThreadPoolExecutor(max_workers=3) as pool:
            f_auto    = pool.submit(scrape_autocomplete, seed)
            f_serper  = pool.submit(get_serper_keywords, seed)
            f_serpapi = pool.submit(get_serpapi_autocomplete, seed)
            autocomplete    = f_auto.result()
            serper_keywords = f_serper.result() + f_serpapi.result()

        if not autocomplete:
            refund_credit(channel_id)
            return JSONResponse({"error": "No autocomplete data returned. Try a different keyword."}, status_code=500)

        result = analyze_keywords(seed, autocomplete, serper_keywords)
        if "error" in result and len(result) == 1:
            refund_credit(channel_id)
            return JSONResponse(result, status_code=500)

        # Real-data enrichment — replaces Claude's vibe score on the top 10
        # with one derived from YouTube competition + Google Trends direction.
        # Best-effort: any failure falls back to Claude's original score so
        # the feature never breaks.
        try:
            result = enrich_keywords_with_real_data(result, autocomplete, top_n=10)
        except Exception as e:
            print(f"[keywords] enrichment error: {e}")

        result["rawSuggestionsCount"] = len(autocomplete)
        result["serperCount"] = len(serper_keywords)

        # Persist to Reports cache so the charged run is always reopenable.
        _save_keywords_cache(channel_id, body.keyword.strip(), body.confirmed_keyword.strip(), result)

        return JSONResponse(result)

    except Exception as e:
        # Catch-all: any unhandled error after deduct refunds the credit so the
        # user is never charged for a failed run.
        print(f"[keywords] research error: {e}")
        refund_credit(channel_id)
        return JSONResponse(
            {"error": "Keyword research failed. Your credit was refunded — please try again."},
            status_code=500,
        )


# ─── Reports — list / open / delete ────────────────────────────────────────────

@router.get("/reports")
def list_keyword_reports(request: Request):
    data, _ = get_session(request.session.get("session_id"))
    channel_id = (data or {}).get("channel", {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"reports": []})
    db = SessionLocal()
    try:
        rows = (
            db.query(KeywordsResearchCache)
              .filter_by(channel_id=channel_id)
              .order_by(KeywordsResearchCache.updated_at.desc())
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
                "keyword": r.keyword,
                "confirmed_keyword": r.confirmed_keyword or "",
                "result": result,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "updated_at": r.updated_at.isoformat() if r.updated_at else None,
            })
        return JSONResponse({"reports": reports})
    finally:
        db.close()


@router.delete("/reports/{report_id}")
def delete_keyword_report(report_id: int, request: Request):
    data, _ = get_session(request.session.get("session_id"))
    channel_id = (data or {}).get("channel", {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)
    db = SessionLocal()
    try:
        row = db.query(KeywordsResearchCache).filter_by(id=report_id, channel_id=channel_id).first()
        if row:
            db.delete(row)
            db.commit()
        return JSONResponse({"ok": True})
    finally:
        db.close()
