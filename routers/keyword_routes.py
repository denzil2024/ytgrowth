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

    # Pre-Claude external fetches (Serper / SerpAPI / autocomplete). If these
    # return nothing, Claude was never called — refund is free for us.
    with ThreadPoolExecutor(max_workers=3) as pool:
        f_auto    = pool.submit(scrape_autocomplete, seed)
        f_serper  = pool.submit(get_serper_keywords, seed)
        f_serpapi = pool.submit(get_serpapi_autocomplete, seed)
        autocomplete    = f_auto.result()
        serper_keywords = f_serper.result() + f_serpapi.result()

    if not autocomplete:
        # Pre-Claude failure — refund is free for us.
        refund_credit(channel_id)
        return JSONResponse(
            {"error": "No autocomplete data returned. Try a different keyword. Your credit was refunded."},
            status_code=500,
        )

    # From here on Claude has run — failures stay on the user's tab.
    try:
        result = analyze_keywords(seed, autocomplete, serper_keywords)
    except Exception as e:
        print(f"[keywords] research error: {e}")
        return JSONResponse(
            {"error": "Something went wrong on our end. Email support@ytgrowth.io and we'll sort it out."},
            status_code=500,
        )

    if "error" in result and len(result) == 1:
        return JSONResponse(
            {"error": "Something went wrong on our end. Email support@ytgrowth.io and we'll sort it out."},
            status_code=500,
        )

    # Real-data enrichment — replaces Claude's vibe score on the top 5
    # with one derived from YouTube competition + Google Trends direction.
    # Best-effort: any failure falls back to Claude's original score so
    # the feature never breaks. Halved from 10 → 5 to cut per-click cost
    # from ~1020 to ~510 units; the 24h cache makes repeats free.
    try:
        result = enrich_keywords_with_real_data(result, autocomplete, top_n=5)
    except Exception as e:
        print(f"[keywords] enrichment error: {e}")

    result["rawSuggestionsCount"] = len(autocomplete)
    result["serperCount"] = len(serper_keywords)

    # Persist to Reports cache so the charged run is always reopenable.
    _save_keywords_cache(channel_id, body.keyword.strip(), body.confirmed_keyword.strip(), result)

    return JSONResponse(result)


# ─── Reports — list / open / delete ────────────────────────────────────────────

def _report_needs_video_backfill(result: dict) -> bool:
    """A saved report is stale-schema if any enriched keyword's competition
    dict is missing any of the visual fields the current UI expects.
    Triggers a refetch via the smart YT cache (free if the cache row was
    already refreshed for another user, one roundtrip each otherwise)."""
    if not isinstance(result, dict):
        return False
    REQUIRED = ("top_videos", "publishing_timeline", "all_views_median")
    for kw in (result.get("keywords") or []):
        comp = kw.get("competition")
        if isinstance(comp, dict) and any(f not in comp for f in REQUIRED):
            return True
    return False


def _backfill_report_videos(result: dict, autocomplete: list = None) -> dict:
    """Lazy re-enrichment for saved reports that pre-date the top_videos
    field. Calls enrich_keywords_with_real_data which pulls from the
    smart YT cache (free for keywords cached after the schema change,
    one YT API roundtrip each for the rest). Returns the same dict
    object back, mutated in place."""
    try:
        enrich_keywords_with_real_data(result, autocomplete or [], top_n=5)
    except Exception as e:
        print(f"[keywords] report backfill error: {e}")
    return result


@router.get("/reports")
def list_keyword_reports(request: Request):
    """Return saved Keyword Research reports for the current user, as-is from
    the DB. No YouTube fetches happen here.

    Previously this endpoint auto-backfilled stale-schema reports (those
    saved before top_videos / publishing_timeline / all_views_median fields
    were added). With N reports and M enriched keywords each, that meant
    N*M YouTube search.list calls (100 units apiece) per /reports page
    load. Combined with a 10K daily quota, two list views could exhaust
    the whole day. The frontend already hides the momentum chart and
    handles missing top_videos gracefully when those fields are absent,
    so old reports degrade visibly but never break — and the user can
    re-run Keyword Research on any keyword to get a fresh report with
    the full data shape.
    """
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
                parsed = json.loads(r.result_json)
            except Exception:
                parsed = None
            reports.append({
                "id": r.id,
                "keyword": r.keyword,
                "confirmed_keyword": r.confirmed_keyword or "",
                "result": parsed,
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
