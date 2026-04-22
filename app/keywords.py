"""
Keyword research — autocomplete scraping, external API lookups, and AI clustering.
Moved here from app/seo.py and app/youtube.py.
"""
import os
import re
import urllib.parse
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from app.utils import make_anthropic_client


def scrape_autocomplete(seed_keyword: str) -> list[str]:
    """
    Scrape YouTube autocomplete for a seed keyword.
    Calls the endpoint with the seed as-is, seed + each letter a-z,
    and 3 common prefixes. Returns a deduplicated flat list of suggestions.
    """
    base_url = "https://suggestqueries.google.com/complete/search"
    headers = {"User-Agent": "Mozilla/5.0"}
    seen: set[str] = set()
    results: list[str] = []

    queries = [seed_keyword]
    for letter in "abcdefghijklmnopqrstuvwxyz":
        queries.append(f"{seed_keyword} {letter}")
    for prefix in ("how to", "best", "for beginners"):
        queries.append(f"{prefix} {seed_keyword}")

    def fetch(query):
        try:
            url = (
                f"{base_url}?client=firefox&ds=yt"
                f"&q={urllib.parse.quote(query)}&hl=en"
            )
            resp = requests.get(url, timeout=5, headers=headers)
            if not resp.ok:
                return []
            data = resp.json()
            return [s for s in (data[1] if len(data) > 1 else []) if isinstance(s, str) and s]
        except Exception as e:
            print(f"Autocomplete error for '{query}': {e}")
            return []

    with ThreadPoolExecutor(max_workers=10) as pool:
        for batch in as_completed([pool.submit(fetch, q) for q in queries]):
            for item in batch.result():
                if item not in seen:
                    seen.add(item)
                    results.append(item)

    return results


def generate_intent_options(title: str) -> tuple[list[dict], str]:
    """
    Fast Haiku call — given a title, return 3 possible search keyword interpretations.
    The user picks one before the full analysis runs.
    """
    import json as _json

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return [], "ANTHROPIC_API_KEY is not set"

    client = make_anthropic_client()
    try:
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            messages=[{"role": "user", "content": f"""A YouTube creator wrote this title: "{title}"

The same words can mean very different things — e.g. "office cleaning" could be a personal home-office vlog OR a commercial cleaning business tutorial.

Generate exactly 3 distinct search intent interpretations. Each should represent a genuinely different audience and purpose.

For each, return:
- keyword: the 2–4 word YouTube search phrase a viewer would type (be specific, keep niche identifiers)
- label: 3–5 word label shown to the creator (e.g. "Personal home office vlog")
- description: one sentence — who is this for and what do they want to see?

Return ONLY a JSON array of 3 objects, no markdown:
[{{"keyword":"...","label":"...","description":"..."}},{{"keyword":"...","label":"...","description":"..."}},{{"keyword":"...","label":"...","description":"..."}}]"""}]
        )
        raw = msg.content[0].text.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```[a-z]*\n?", "", raw)
            raw = re.sub(r"\n?```$", "", raw.strip())
        options = _json.loads(raw)
        clean = [
            {"keyword": o["keyword"], "label": o["label"], "description": o["description"]}
            for o in options if o.get("keyword") and o.get("label")
        ]
        return clean[:3], ""
    except Exception as e:
        print(f"Intent options error: {e}")
        return [], str(e)


def generate_outliers_intent_options(query: str, kind: str = "video") -> tuple[list[dict], str]:
    """
    Fast Haiku call — given a raw search query (2–6 word keyword/topic the creator
    typed into Outliers), return 3 distinct intent interpretations for discovering
    over-performing videos/channels in that niche.

    Different prompt from generate_intent_options because Outliers searches are
    short keywords, not full titles. The framing is "which niche are you searching
    for" rather than "which angle does this title take".

    kind ∈ {"video", "thumbnail", "channel"} — shapes what counts as a useful
    niche split. Returns the same shape as generate_intent_options so the
    frontend picker UI stays identical.
    """
    import json as _json

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return [], "ANTHROPIC_API_KEY is not set"

    target = {
        "video":     "over-performing videos",
        "thumbnail": "thumbnails that are winning clicks",
        "channel":   "channels that are out-growing their size peers",
    }.get(kind, "over-performing videos")

    client = make_anthropic_client()
    try:
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            messages=[{"role": "user", "content": f"""A YouTube creator typed this into an outlier-search tool: "{query}"

They want to discover {target} in this niche. But the same keyword can belong to very different niches — e.g. "morning routine" could be productivity/hustle culture, fitness/gym, minimalist lifestyle, or mom/homemaker content, and each one has its own audience, competitors, and winning formats.

Generate exactly 3 distinct niche interpretations for "{query}". Each should be a genuinely different audience the creator might be targeting. Infer them directly from the words — do not fall back to hardcoded categories. If the query is already highly specific, split by adjacent sub-niches or content angles.

For each, return:
- keyword: the 2–5 word YouTube search phrase we should actually search with (narrower than the raw query, preserves the niche identity)
- label: 3–5 word label shown to the creator (what niche this represents)
- description: one sentence — who watches this content and what they're looking for

Return ONLY a JSON array of 3 objects, no markdown:
[{{"keyword":"...","label":"...","description":"..."}},{{"keyword":"...","label":"...","description":"..."}},{{"keyword":"...","label":"...","description":"..."}}]"""}]
        )
        raw = msg.content[0].text.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```[a-z]*\n?", "", raw)
            raw = re.sub(r"\n?```$", "", raw.strip())
        options = _json.loads(raw)
        clean = [
            {"keyword": o["keyword"], "label": o["label"], "description": o["description"]}
            for o in options if o.get("keyword") and o.get("label")
        ]
        return clean[:3], ""
    except Exception as e:
        print(f"Outliers intent options error: {e}")
        return [], str(e)


def get_serpapi_autocomplete(seed_keyword: str) -> list[str]:
    """
    Fetch Google autocomplete suggestions via SerpAPI.
    Different signal from YouTube autocomplete — broader web search intent.
    """
    api_key = os.getenv("SERPAPI_KEY", "")
    if not api_key:
        return []
    try:
        resp = requests.get(
            "https://serpapi.com/search.json",
            params={"engine": "google_autocomplete", "q": seed_keyword, "api_key": api_key},
            timeout=10,
        )
        data = resp.json()
        if data.get("error"):
            print(f"SerpAPI error: {data['error']}")
            return []
        return [s.get("value", "") for s in data.get("suggestions", []) if s.get("value")]
    except Exception as e:
        print(f"SerpAPI error: {e}")
        return []


def get_serper_keywords(seed_keyword: str) -> list[str]:
    """
    Fetch related searches + People Also Ask from Serper.
    Returns a flat list of additional keyword strings.
    """
    api_key = os.getenv("SERPER_KEY", "")
    if not api_key:
        return []
    try:
        resp = requests.post(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
            json={"q": seed_keyword, "num": 10},
            timeout=10,
        )
        data = resp.json()
        keywords = []
        for r in data.get("relatedSearches", []):
            q = r.get("query", "").strip()
            if q:
                keywords.append(q)
        for r in data.get("peopleAlsoAsk", []):
            q = r.get("question", "").strip()
            if q:
                keywords.append(q)
        return keywords
    except Exception as e:
        print(f"Serper error: {e}")
        return []


def analyze_keywords(seed_keyword: str, autocomplete_results: list[str], serper_keywords: list[str]) -> dict:
    """
    Claude receives autocomplete + Serper related searches, filters by intent,
    assigns content angles, clusters, and scores by keyword specificity.
    """
    import json as _json
    client = make_anthropic_client()

    all_suggestions = list(dict.fromkeys(autocomplete_results + serper_keywords))

    user_prompt = f"""Seed keyword: "{seed_keyword}"

Suggestions (YouTube autocomplete + Google related searches):
{all_suggestions}

Tasks — return ONLY valid JSON, no markdown:
1. seedIntent: primaryIntent, viewerProfile, contentTypeExpected, funnelStage (awareness|consideration|decision), intentSummary (1 sentence).
2. keywords: keep 15–25 that match the seed intent. Drop off-topic, duplicates, and unbranded branded queries. For each: contentAngle (1 sentence), intentMatch (exact|strong|partial), opportunityScore 0-100 (longer/specific = higher; broad single-word = lower).
3. clusters: 3–5 named clusters (clusterName + keywords array only).
4. topPick: best keyword + whyThisOne (1 sentence).

{{"seedIntent":{{"primaryIntent":"","viewerProfile":"","contentTypeExpected":"","funnelStage":"","intentSummary":""}},"totalSuggestionsReceived":{len(all_suggestions)},"totalAfterIntentFilter":0,"keywords":[{{"keyword":"","contentAngle":"","intentMatch":"exact|strong|partial","opportunityScore":0}}],"clusters":[{{"clusterName":"","keywords":[]}}],"topPick":{{"keyword":"","whyThisOne":""}}}}"""

    try:
        resp = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2500,
            system="You are a YouTube SEO analyst. Return only valid JSON, no markdown.",
            messages=[{"role": "user", "content": user_prompt}],
        )
        raw = resp.content[0].text.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```[a-z]*\n?", "", raw)
            raw = re.sub(r"\n?```$", "", raw)
        result = _json.loads(raw)
        result["keywords"].sort(key=lambda k: k.get("opportunityScore", 0), reverse=True)
        return result
    except Exception as e:
        print(f"analyze_keywords error: {e}")
        return {"error": str(e)}
