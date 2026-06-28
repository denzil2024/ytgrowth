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

    # Preserve query order (seed first, then a-z, then prefixes) by iterating
    # futures in submission order rather than completion order. The seed's own
    # suggestions come back first, which is a real demand-ranking signal the
    # keyword tool relies on for sorting.
    with ThreadPoolExecutor(max_workers=10) as pool:
        futures = [pool.submit(fetch, q) for q in queries]
        for fut in futures:
            for item in fut.result():
                if item not in seen:
                    seen.add(item)
                    results.append(item)

    return results


def generate_intent_options(title: str, channel_context: dict | None = None) -> tuple[list[dict], str]:
    """
    Fast Haiku call: given a title plus the creator's channel context, return
    3 possible search-intent interpretations. The user picks one (or "Let AI
    decide") before the full analysis runs.

    The FIRST option is always the most-likely interpretation given the
    creator's actual channel and the literal reading of the title. The other
    two are adjacent niches.

    Cross-user cached in ai_output_cache (30-day TTL). Cache key includes a
    coarse channel fingerprint so two creators with similar channels share
    rows, but a vlog creator's "office cleaning" doesn't get the same
    interpretations as a cleaning-business channel's "office cleaning".
    """
    import json as _json
    from app.utils import cached_ai_output

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return [], "ANTHROPIC_API_KEY is not set"

    title_norm = (title or "").strip().lower()
    if not title_norm:
        return [], ""

    # Channel context block: name + top 3 video titles + Studio keywords.
    # Lets Claude default to the creator's actual niche when the title
    # is ambiguous instead of guessing an outsider's perspective.
    ch = channel_context or {}
    channel_name = (ch.get("channel_name") or "").strip()
    channel_kw   = (ch.get("channel_keywords") or "").strip()
    top_titles   = [t for t in (ch.get("top_video_titles") or []) if t][:3]

    context_lines = []
    if channel_name:
        context_lines.append(f"Channel name: {channel_name}")
    if channel_kw:
        context_lines.append(f"Channel keywords (Studio field): {channel_kw}")
    if top_titles:
        context_lines.append("Top videos by views:")
        for t in top_titles:
            context_lines.append(f"  - {t}")
    context_block = ("\n".join(context_lines) + "\n\n") if context_lines else ""

    # Cache fingerprint: lowercase channel name + sorted top-title slugs.
    # Stable across cosmetic reorderings, scoped per-creator-niche.
    ch_fingerprint = {
        "channel_name": channel_name.lower()[:80],
        "channel_kw":   channel_kw.lower()[:200],
        "top_titles":   sorted(t.lower()[:120] for t in top_titles),
    }

    cache_inputs = {
        "title":          title_norm,
        "channel":        ch_fingerprint,
        "model":          "claude-haiku-4-5-20251001",
        "prompt_version": "v2",  # bumped: channel context + most-likely-first ordering
    }

    def _fetch():
        client = make_anthropic_client()
        try:
            msg = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=400,
                messages=[{"role": "user", "content": f"""{context_block}A YouTube creator wrote this title: "{title}"

Generate 3 possible search-intent interpretations for this video, ordered from MOST LIKELY to LESS LIKELY based on the channel context above and a literal reading of the title.

CRITICAL RULES for picking the first (most-likely) option:
- First-person language ("My X", "I X", "Our X") means the CREATOR is the subject. The video is about their own life, place, routine. Do NOT default to outsider framings (expat, tourist, traveler, foreigner) when the title says "my" anything.
- Location words ("in Kenya", "in Lagos", "in Tokyo") with first-person mean the creator LIVES there. The viewer wants to see a local's daily life, not a tourist's perspective.
- If the channel context shows the creator is a vlogger or lifestyle creator, the first option should be a lifestyle/daily vlog interpretation, not a tutorial or business angle.
- The first option must reflect what a thoughtful viewer typing this title into YouTube would expect to watch FIRST. The other two options can be adjacent niches for users who want a different audience.

For each option, return:
- keyword: the 2-4 word YouTube search phrase a viewer would type (be specific, keep niche identifiers like "vlog", "daily life", location names)
- label: 3-5 word label shown to the creator (e.g. "Kenyan daily life vlog")
- description: one sentence on who is this for and what they want to see

Return ONLY a JSON array of 3 objects, no markdown, ordered most-likely first:
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
            return {"options": clean[:3], "error": ""}
        except Exception as e:
            print(f"Intent options error: {e}")
            return {"options": [], "error": str(e)}

    cached = cached_ai_output(
        function_name="generate_intent_options",
        inputs=cache_inputs,
        ttl_hours=24 * 30,  # 30 days
        fetch_fn=_fetch,
    )
    return cached.get("options", []), cached.get("error", "")


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

    Cross-user cached in ai_output_cache. Two users seeding the same
    keyword (e.g. "fitness tips") feed identical Claude inputs and get
    identical Claude outputs, so the second user reads from cache at
    zero Anthropic spend. 7-day TTL because autocomplete suggestions
    and Claude's keyword clustering drift slowly (the seed intent for
    "fitness tips" doesn't change week-to-week).
    """
    import json as _json
    from app.utils import cached_ai_output

    # Normalise inputs so cache keys match for cosmetically-different
    # but semantically-identical seeds (e.g. "Fitness Tips" vs "fitness
    # tips"). The suggestion lists are sorted because order from
    # autocomplete/Serper is non-deterministic but semantically the same.
    seed_norm = (seed_keyword or "").strip().lower()
    ac_norm   = sorted(set((a or "").strip().lower() for a in (autocomplete_results or []) if a))
    sp_norm   = sorted(set((s or "").strip().lower() for s in (serper_keywords or []) if s))

    cache_inputs = {
        "seed":            seed_norm,
        "autocomplete":    ac_norm,
        "serper":          sp_norm,
        "model":           "claude-sonnet-4-6",
        "prompt_version":  "v1",  # bump if the prompt changes
    }

    def _fetch():
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
            if isinstance(result.get("keywords"), list):
                result["keywords"].sort(key=lambda k: k.get("opportunityScore", 0), reverse=True)
            return result
        except Exception as e:
            print(f"analyze_keywords error: {e}")
            return {"error": str(e)}

    return cached_ai_output(
        function_name="analyze_keywords",
        inputs=cache_inputs,
        ttl_hours=24 * 7,  # 7 days
        fetch_fn=_fetch,
    )


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


def fetch_competition_signals(keywords: list[str], top_n: int = 3) -> dict[str, dict]:
    """
    Enrich the top N keywords with YouTube competitive data in parallel.

    Default top_n is 3 (was 5, was 10). Each keyword costs ~102 units
    (100 search + 1 videos + 1 channels), so 3 keywords = ~306 units/run
    on a cold cache. Combined with the 24h cross-user cache in
    _fetch_competition_for_keyword, repeat keywords cost 0 units, so
    real-world average drops far below 306. Bump back up once the
    Google quota extension lands.
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
    top_n: int = 3,
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
