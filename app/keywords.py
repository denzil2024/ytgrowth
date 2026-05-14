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

_KW_CACHE_TTL_HOURS = 24


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

    Cached cross-user in youtube_search_cache (kw: prefix) for 24h. The
    nightly warmer keeps popular keywords hot via the shared hit-count
    signal — so the second user researching the same keyword today reads
    from cache at 0 quota cost.
    """
    default = {"result_count": 0, "top_subs_median": 0, "top_views_median": 0, "all_views_median": 0, "days_since_newest": None, "top_videos": [], "publishing_timeline": []}
    if not yt_api_key:
        return default
    from app.utils import yt_quota_paused
    if yt_quota_paused():
        print(f"[keywords] competition lookup skipped — YT_QUOTA_PAUSED=1 (keyword='{keyword}')")
        return default

    # Reject junk before spending 102 units. Same filter SEO Studio uses.
    from app.seo import _is_meaningful_query, _normalize_cache_query
    if not _is_meaningful_query(keyword):
        print(f"[keywords] junk keyword rejected: '{keyword}'")
        return default

    # 24h cache lookup. Different prefix from SEO Studio because we cache
    # a different shape (competition dict vs. video list), but same
    # normalisation so 'Fitness Tips' and 'fitness tips' share a row.
    import json as _json
    import datetime as _dt
    from database.models import SessionLocal, YoutubeSearchCache
    cache_key = f"kw:{_normalize_cache_query(keyword)}|5|relevance"

    db = SessionLocal()
    try:
        row = db.query(YoutubeSearchCache).filter_by(cache_key=cache_key).first()
        if row and row.cached_at:
            cached_at = row.cached_at
            if cached_at.tzinfo is None:
                cached_at = cached_at.replace(tzinfo=_dt.timezone.utc)
            age_hours = (_dt.datetime.now(_dt.timezone.utc) - cached_at).total_seconds() / 3600
            if age_hours < _KW_CACHE_TTL_HOURS:
                try:
                    cached = _json.loads(row.result_json)
                    # Schema check: entries cached before the `top_videos`
                    # field was added are missing the visual evidence the
                    # frontend now needs. Treat as a cache miss so we
                    # refetch and backfill. Only refetches entries that
                    # are actually stale-schema, no quota spike on fresh ones.
                    if "top_videos" not in cached or "publishing_timeline" not in cached or "all_views_median" not in cached:
                        print(f"[keywords] cache STALE-SCHEMA '{keyword}' (missing top_videos / publishing_timeline / all_views_median) — refetching")
                    else:
                        try:
                            row.hit_count = (row.hit_count or 0) + 1
                            row.last_hit_at = _dt.datetime.now(_dt.timezone.utc)
                            db.commit()
                        except Exception:
                            try: db.rollback()
                            except Exception: pass
                        print(f"[keywords] cache HIT '{keyword}' (hits={row.hit_count}, saved 102 units)")
                        return cached
                except Exception:
                    pass  # corrupt cache, fall through and refetch
    except Exception as e:
        print(f"[keywords] cache read error: {e}")
    finally:
        db.close()

    try:
        yt = build("youtube", "v3", developerKey=yt_api_key, cache_discovery=False)
        # maxResults bumped 5 -> 25. search.list charges per call not per result,
        # so cost stays at 100 units. The extra 20 results power the 12-week
        # publishing_timeline below (visual momentum chart on the Keywords page).
        search = yt.search().list(
            part="snippet",
            q=keyword,
            type="video",
            maxResults=25,
            order="relevance",
            relevanceLanguage="en",
        ).execute()
        items = search.get("items", [])
        if not items:
            return default

        # Medians stay calibrated to the top-5 (the scoring weights in
        # _score_with_real_data were tuned against top-5 numbers). The extra
        # 20 results power top_videos sorting + publishing_timeline only.
        top5 = items[:5]
        video_ids   = [it["id"]["videoId"]        for it in top5 if it.get("id", {}).get("videoId")]
        channel_ids = list({it["snippet"]["channelId"] for it in top5 if it.get("snippet", {}).get("channelId")})
        published   = [it["snippet"].get("publishedAt") for it in top5 if it.get("snippet", {}).get("publishedAt")]

        # Batch fetch video stats for ALL 25 results so top_videos has views
        # for sorting. Channels stay top-5 (only used for the subs median).
        all_video_ids = [it["id"]["videoId"] for it in items if it.get("id", {}).get("videoId")]
        vids = yt.videos().list(part="statistics", id=",".join(all_video_ids)).execute() if all_video_ids else {"items": []}
        chs  = yt.channels().list(part="statistics", id=",".join(channel_ids)).execute() if channel_ids else {"items": []}

        # video_id -> views map (covers all 25 fetched results).
        views_by_id = {v.get("id"): int(v.get("statistics", {}).get("viewCount", 0) or 0) for v in vids.get("items", [])}

        view_counts = sorted(views_by_id.get(vid, 0) for vid in video_ids)  # top-5 view medians
        all_view_counts = sorted(views_by_id.values())  # median of ALL 25 — outlier baseline
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

        # Top-3 ranking videos by view count across ALL 25 fetched results.
        # The visual evidence band wants the strongest performers, not the
        # first 3 relevance results.
        top_videos = []
        for it in items:
            vid = it.get("id", {}).get("videoId")
            if not vid:
                continue
            snip = it.get("snippet", {}) or {}
            top_videos.append({
                "video_id":      vid,
                "title":         snip.get("title", ""),
                "channel_title": snip.get("channelTitle", ""),
                "published_at":  snip.get("publishedAt", ""),
                "views":         views_by_id.get(vid, 0),
                "thumbnail_url": (snip.get("thumbnails", {}).get("medium")
                                  or snip.get("thumbnails", {}).get("default")
                                  or {}).get("url", ""),
            })
        top_videos.sort(key=lambda v: v["views"], reverse=True)
        top_videos = top_videos[:3]

        # 12-week publishing_timeline — bucket the publishedAt of all 25
        # results into weekly counts, oldest to newest. Powers the
        # Competition Momentum line chart on the Keywords page. Each item:
        # {week_start: ISO date string, count: int}.
        from datetime import timedelta
        now_utc = datetime.now(timezone.utc)
        # Anchor "current week" to start on a Monday so the buckets are stable.
        this_week_monday = (now_utc - timedelta(days=now_utc.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
        week_buckets = []
        for i in range(11, -1, -1):
            week_start = this_week_monday - timedelta(weeks=i)
            week_buckets.append({"week_start": week_start.date().isoformat(), "count": 0})
        for it in items:
            iso = it.get("snippet", {}).get("publishedAt", "")
            if not iso:
                continue
            try:
                dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
            except Exception:
                continue
            weeks_ago = int((this_week_monday - dt).total_seconds() // (7 * 86400))
            idx = 11 - weeks_ago
            if 0 <= idx <= 11:
                week_buckets[idx]["count"] += 1
        publishing_timeline = week_buckets

        result = {
            "result_count":       search.get("pageInfo", {}).get("totalResults", len(items)),
            "top_subs_median":    median(sub_counts),
            "top_views_median":   median(view_counts),
            "all_views_median":   median(all_view_counts),
            "days_since_newest":  days_since,
            "top_videos":         top_videos,
            "publishing_timeline": publishing_timeline,
        }

        # Persist to cache so the next user researching this keyword today
        # gets it for free. First fetch counts as hit #1 so popularity
        # ranking starts at 1, not 0.
        db = SessionLocal()
        try:
            now = _dt.datetime.now(_dt.timezone.utc)
            existing = db.query(YoutubeSearchCache).filter_by(cache_key=cache_key).first()
            payload = _json.dumps(result)
            if existing:
                existing.result_json = payload
                existing.cached_at = now
                existing.hit_count = (existing.hit_count or 0) + 1
                existing.last_hit_at = now
                if not existing.original_query:
                    existing.original_query = keyword
            else:
                db.add(YoutubeSearchCache(
                    cache_key=cache_key,
                    original_query=keyword,
                    result_json=payload,
                    cached_at=now,
                    hit_count=1,
                    last_hit_at=now,
                ))
            db.commit()
        except Exception as e:
            print(f"[keywords] cache write error: {e}")
            try: db.rollback()
            except Exception: pass
        finally:
            db.close()

        return result
    except Exception as e:
        print(f"[keywords] competition fetch error for '{keyword}': {e}")
        return default


def force_fetch_top_videos(keyword: str) -> list[dict]:
    """
    Last-resort fetch for the 3 top-ranking videos for a keyword.
    Bypasses both YT_QUOTA_PAUSED and the 24h cache because this runs only
    when the normal enrichment path returned empty top_videos for a paid
    user-facing research call. Cost is ~51 units (search.list + videos.list,
    skip channels.list — we only need titles, views, thumbnails).

    Returns [] on any failure; logs the reason loudly so Railway logs
    surface the actual cause (missing API key, expired API key, 403
    quotaExceeded, network error, etc.) rather than silently producing
    an empty band on the frontend.
    """
    yt_api_key = os.getenv("YOUTUBE_API_KEY", "")
    if not yt_api_key:
        print(f"[keywords] force_fetch_top_videos: YOUTUBE_API_KEY missing (keyword='{keyword}')")
        return []
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
        items = search.get("items", []) or []
        if not items:
            print(f"[keywords] force_fetch_top_videos: YT returned 0 items for '{keyword}'")
            return []
        video_ids = [it["id"]["videoId"] for it in items if it.get("id", {}).get("videoId")]
        vids = yt.videos().list(part="statistics", id=",".join(video_ids)).execute() if video_ids else {"items": []}
        views_by_id = {v.get("id"): int(v.get("statistics", {}).get("viewCount", 0) or 0) for v in vids.get("items", [])}
        out = []
        for it in items:
            vid = it.get("id", {}).get("videoId")
            if not vid:
                continue
            snip = it.get("snippet", {}) or {}
            out.append({
                "video_id":      vid,
                "title":         snip.get("title", ""),
                "channel_title": snip.get("channelTitle", ""),
                "published_at":  snip.get("publishedAt", ""),
                "views":         views_by_id.get(vid, 0),
                "thumbnail_url": (snip.get("thumbnails", {}).get("medium")
                                  or snip.get("thumbnails", {}).get("default")
                                  or {}).get("url", ""),
            })
        out.sort(key=lambda v: v["views"], reverse=True)
        out = out[:3]
        print(f"[keywords] force_fetch_top_videos OK '{keyword}' -> {len(out)} videos")
        return out
    except Exception as e:
        print(f"[keywords] force_fetch_top_videos FAILED '{keyword}': {type(e).__name__}: {e}")
        return []


def fetch_competition_signals(keywords: list[str], top_n: int = 5) -> dict[str, dict]:
    """
    Enrich the top N keywords with YouTube competitive data in parallel.

    Default top_n is 5 (was 10). Each keyword costs ~102 units (100 search
    + 1 videos + 1 channels), so 5 keywords = ~510 units/run on a cold
    cache vs. ~1020 before. Combined with the 24h cross-user cache in
    _fetch_competition_for_keyword, repeat keywords cost 0 units, so
    real-world average drops far below 510.
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
    top_n: int = 5,
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
