"""
Keyword research — autocomplete scraping, external API lookups, and AI clustering.
Moved here from app/seo.py and app/youtube.py.
"""
import os
import re
import urllib.parse
from datetime import datetime, timezone
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from googleapiclient.discovery import build
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


# ─── Real competition + trend signals ─────────────────────────────────────────
# Goal: stop shipping vibe-only opportunity scores. Each keyword gets real
# YouTube competitive-landscape data (who ranks, how big they are, how fresh
# their videos) and a Google Trends direction. Scoring then becomes a function
# of actual numbers, not Claude's word-length heuristic.

def _fetch_competition_for_keyword(keyword: str, yt_api_key: str) -> dict:
    """
    Query YouTube Data API (search.list, then videos.list + channels.list)
    for the top 5 results of a keyword. Returns a compact competition dict:
        - result_count:    how many results YouTube returned (landscape size)
        - top_subs_median: median subscriber count of the top-5 channels
                           (smaller = easier to rank; huge = dominated)
        - top_views_median:median view count of the top-5 videos
                           (traffic ceiling the topic can pull)
        - days_since_newest: days since the most recent top-5 video
                           (>180 = stale landscape = opportunity)
    Uses an anonymous API key, NOT user OAuth, so this doesn't consume the
    creator's own YouTube quota.
    """
    default = {"result_count": 0, "top_subs_median": 0, "top_views_median": 0, "days_since_newest": None}
    if not yt_api_key:
        return default
    try:
        yt = build("youtube", "v3", developerKey=yt_api_key, cache_discovery=False)
        search = yt.search().list(
            part="snippet",
            q=keyword,
            type="video",
            maxResults=5,
            order="relevance",
            relevanceLanguage="en",
        ).execute()
        items = search.get("items", [])
        if not items:
            return default

        video_ids   = [it["id"]["videoId"]        for it in items if it.get("id", {}).get("videoId")]
        channel_ids = list({it["snippet"]["channelId"] for it in items if it.get("snippet", {}).get("channelId")})
        published   = [it["snippet"].get("publishedAt") for it in items if it.get("snippet", {}).get("publishedAt")]

        # Batch fetch video stats + channel stats (cheap: 1 unit each)
        vids = yt.videos().list(part="statistics", id=",".join(video_ids)).execute() if video_ids else {"items": []}
        chs  = yt.channels().list(part="statistics", id=",".join(channel_ids)).execute() if channel_ids else {"items": []}

        view_counts = sorted(int(v.get("statistics", {}).get("viewCount", 0) or 0) for v in vids.get("items", []))
        sub_counts  = sorted(int(c.get("statistics", {}).get("subscriberCount", 0) or 0) for c in chs.get("items", []))

        def median(xs):
            return xs[len(xs) // 2] if xs else 0

        # Days since the MOST RECENT top-5 video
        days_since = None
        if published:
            def _parse(iso):
                try: return datetime.fromisoformat(iso.replace("Z", "+00:00"))
                except Exception: return None
            parsed = [d for d in (_parse(p) for p in published) if d]
            if parsed:
                newest = max(parsed)
                days_since = (datetime.now(timezone.utc) - newest).days

        return {
            "result_count":       search.get("pageInfo", {}).get("totalResults", len(items)),
            "top_subs_median":    median(sub_counts),
            "top_views_median":   median(view_counts),
            "days_since_newest":  days_since,
        }
    except Exception as e:
        print(f"[keywords] competition fetch error for '{keyword}': {e}")
        return default


def fetch_competition_signals(keywords: list[str], top_n: int = 10) -> dict[str, dict]:
    """
    Enrich the top N keywords with YouTube competitive data in parallel.
    top_n default is 10 to stay inside the daily search quota budget
    (each keyword costs ~102 units: 100 for search + 1 videos + 1 channels;
    10 keywords = ~1020 units per analysis, ~9 analyses/day headroom).
    """
    yt_api_key = os.getenv("YOUTUBE_API_KEY", "")
    if not yt_api_key or not keywords:
        return {}
    targets = keywords[:top_n]
    out: dict[str, dict] = {}
    with ThreadPoolExecutor(max_workers=min(5, len(targets))) as pool:
        futures = {pool.submit(_fetch_competition_for_keyword, kw, yt_api_key): kw for kw in targets}
        for fut in as_completed(futures):
            out[futures[fut]] = fut.result()
    return out


def _momentum_from_competition(comp: dict) -> str:
    """
    Derive a momentum label from data we already have (no extra API calls,
    no pytrends, no paid trend source):
      - 'active'    = newest top-5 video < 30 days old (creators shipping now)
      - 'unclaimed' = newest top-5 video > 180 days old (nobody's updating it)
      - 'steady'    = otherwise
    Returned as a cheap badge-friendly string. The real trend info lives
    inside the competition.days_since_newest field.
    """
    days = comp.get("days_since_newest")
    if days is None:        return ""
    if days < 30:           return "active"
    if days > 180:          return "unclaimed"
    return "steady"


def _score_with_real_data(kw: dict, comp: dict, autocomplete_rank: int | None) -> int:
    """
    Build a data-backed opportunity score out of:
      - feasibility   (top-channel size — smaller = easier win)
      - traffic       (median views on top-5 — headroom to pull)
      - freshness     (stale landscape = unclaimed territory)
      - autocomplete  (earlier position = more searched)
      - intent match  (keep Claude's exact/strong/partial signal as a multiplier)

    All components are 0-100; they're weighted and summed. The intentMatch
    multiplier shrinks the score for off-topic drift.
    """
    # Feasibility — smaller median subs = higher score. Break points:
    # <10k = easy (100), 10k-100k = fair (70), 100k-1M = hard (40), >1M = brutal (15)
    subs = comp.get("top_subs_median", 0)
    if   subs == 0:       feasibility = 50   # no data, neutral
    elif subs < 10_000:   feasibility = 100
    elif subs < 100_000:  feasibility = 75
    elif subs < 1_000_000:feasibility = 45
    else:                 feasibility = 15

    # Traffic ceiling — higher median views on top-5 = more traffic to win.
    # 100k+ = strong (100), 10k-100k = decent (70), <10k = thin (40)
    views = comp.get("top_views_median", 0)
    if   views >= 100_000: traffic = 100
    elif views >= 10_000:  traffic = 70
    elif views > 0:        traffic = 45
    else:                  traffic = 50  # no data

    # Freshness — if the newest top-5 video is old, the landscape is stale and open.
    # <30d = competitive (40), 30-180d = normal (70), 180+d = stale/open (100)
    days = comp.get("days_since_newest")
    if   days is None:   freshness = 50
    elif days < 30:      freshness = 40
    elif days < 180:     freshness = 70
    else:                freshness = 100

    # Autocomplete rank bonus (earlier = more searched)
    # rank 0-4 = +8, 5-14 = +4, 15+ = 0, None = 0
    if autocomplete_rank is None:    rank_adj = 0
    elif autocomplete_rank < 5:      rank_adj = 8
    elif autocomplete_rank < 15:     rank_adj = 4
    else:                             rank_adj = 0

    # Weighted base
    base = round(feasibility * 0.45 + traffic * 0.30 + freshness * 0.25)

    # Intent match multiplier — exact=1.0, strong=0.9, partial=0.75, else 0.85
    im = (kw.get("intentMatch") or "").lower()
    mult = 1.0 if im == "exact" else 0.9 if im == "strong" else 0.75 if im == "partial" else 0.85

    score = int(round(base * mult + rank_adj))
    return max(0, min(100, score))


def enrich_keywords_with_real_data(
    result: dict,
    autocomplete_results: list[str],
    top_n: int = 10,
) -> dict:
    """
    Take the Claude-filtered keyword list and overwrite `opportunityScore`
    with a score derived from real YouTube competition data. Also attaches
    a `competition` dict and a lightweight `momentum` label (active /
    unclaimed / steady) derived from days_since_newest — no extra API
    calls, no paid Google Trends source.

    Only the top_n keywords (by Claude's initial score) get the live data
    enrichment to keep quota costs bounded.
    """
    keywords = result.get("keywords") or []
    if not keywords:
        return result

    # Build autocomplete rank map (lower index = appeared earlier = more searched)
    rank_map = {}
    for i, phrase in enumerate(autocomplete_results):
        kw = (phrase or "").strip().lower()
        if kw and kw not in rank_map:
            rank_map[kw] = i

    # Sort first so top_n means "the keywords Claude liked most"
    keywords.sort(key=lambda k: k.get("opportunityScore", 0), reverse=True)
    enrich_targets = [k["keyword"] for k in keywords[:top_n] if k.get("keyword")]

    competition = fetch_competition_signals(enrich_targets, top_n)

    for kw in keywords:
        phrase = kw.get("keyword", "")
        comp   = competition.get(phrase, {})
        rank   = rank_map.get(phrase.lower())

        kw["competition"]       = comp
        kw["momentum"]          = _momentum_from_competition(comp) if comp else ""
        kw["autocomplete_rank"] = rank

        # Only rescore the enriched subset. The tail keeps Claude's score.
        if phrase in competition:
            kw["opportunityScore"] = _score_with_real_data(kw, comp, rank)

    # Re-sort with the new data-backed scores on top
    keywords.sort(key=lambda k: k.get("opportunityScore", 0), reverse=True)
    result["keywords"] = keywords

    # If Claude nominated a topPick, update its score to match the enriched version
    tp = result.get("topPick") or {}
    if tp.get("keyword"):
        match = next((k for k in keywords if k["keyword"].lower() == tp["keyword"].lower()), None)
        if match:
            tp["opportunityScore"] = match["opportunityScore"]
            tp["competition"]      = match.get("competition", {})
            tp["momentum"]         = match.get("momentum", "")
            result["topPick"] = tp

    return result
