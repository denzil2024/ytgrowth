from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from concurrent.futures import ThreadPoolExecutor
from app.keywords import (
    scrape_autocomplete,
    analyze_keywords,
    generate_intent_options,
    get_serper_keywords,
    get_serpapi_autocomplete,
    enrich_keywords_with_real_data,
)
from routers.auth import get_session
from app.analysis_gate import check_and_deduct, check_free_tier_access

router = APIRouter()


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

    with ThreadPoolExecutor(max_workers=3) as pool:
        f_auto    = pool.submit(scrape_autocomplete, seed)
        f_serper  = pool.submit(get_serper_keywords, seed)
        f_serpapi = pool.submit(get_serpapi_autocomplete, seed)
        autocomplete    = f_auto.result()
        serper_keywords = f_serper.result() + f_serpapi.result()

    if not autocomplete:
        return JSONResponse({"error": "No autocomplete data returned. Try a different keyword."}, status_code=500)

    result = analyze_keywords(seed, autocomplete, serper_keywords)
    if "error" in result and len(result) == 1:
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
    return JSONResponse(result)
