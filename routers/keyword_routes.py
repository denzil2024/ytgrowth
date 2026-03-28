from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from concurrent.futures import ThreadPoolExecutor
from app.youtube import scrape_autocomplete
from app.seo import analyze_keywords, generate_intent_options, get_serper_keywords, get_serpapi_autocomplete

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
def research_keywords(body: KeywordResearchRequest):
    seed = body.confirmed_keyword.strip() or body.keyword.strip()
    if not seed:
        return JSONResponse({"error": "Keyword cannot be empty."}, status_code=400)

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

    result["rawSuggestionsCount"] = len(autocomplete)
    result["serperCount"] = len(serper_keywords)
    return JSONResponse(result)
