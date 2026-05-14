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
    """A saved report was written before `competition.top_videos` existed
    if any enriched keyword still lacks the field. Cheap check."""
    if not isinstance(result, dict):
        return False
    for kw in (result.get("keywords") or []):
        comp = kw.get("competition")
        if isinstance(comp, dict) and "top_videos" not in comp:
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

        # Backfill any reports that lack top_videos. Runs in parallel so
        # listing N reports stays fast (each backfill is bounded by the
        # YT cache; cached keywords return instantly).
        rows_needing_backfill = []
        parsed_results = {}
        for r in rows:
            try:
                parsed_results[r.id] = json.loads(r.result_json)
            except Exception:
                parsed_results[r.id] = None
            if _report_needs_video_backfill(parsed_results[r.id]):
                rows_needing_backfill.append(r)

        if rows_needing_backfill:
            print(f"[keywords] backfilling {len(rows_needing_backfill)} stale-schema report(s)")
            with ThreadPoolExecutor(max_workers=min(5, len(rows_needing_backfill))) as pool:
                futures = {
                    pool.submit(_backfill_report_videos, parsed_results[r.id]): r
                    for r in rows_needing_backfill
                }
                for fut in futures:
                    r = futures[fut]
                    try:
                        updated = fut.result()
                        parsed_results[r.id] = updated
                        r.result_json = json.dumps(updated)
                    except Exception as e:
                        print(f"[keywords] backfill task failed for report {r.id}: {e}")
            try:
                db.commit()
            except Exception as e:
                print(f"[keywords] backfill commit failed: {e}")
                try: db.rollback()
                except Exception: pass

        reports = []
        for r in rows:
            reports.append({
                "id": r.id,
                "keyword": r.keyword,
                "confirmed_keyword": r.confirmed_keyword or "",
                "result": parsed_results.get(r.id),
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
