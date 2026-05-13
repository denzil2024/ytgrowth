"""
Niche search pre-warmer.

Goal: pre-populate `youtube_search_cache` with the raw YouTube search.list
response for ~150 popular creator niches, so SEO Studio / Outliers /
Thumbnail IQ user clicks land in cache at 0 quota cost instead of paying
100 units per query.

Runs nightly via app/scheduler.py. Each run refreshes the N oldest entries
(default 20 niches per run = ~2,000 units/night). A full pass covers the
seed list in ~7 nights and naturally rotates as user-initiated searches
add new entries.

Respects YT_QUOTA_PAUSED. If the flag is set, the warmer skips silently —
the cache stays whatever it already was and SEO Studio still degrades
gracefully via the same env var checks downstream.
"""

import datetime
import json
import os

# Seeded niche queries. Chosen for high overlap with what creators actually
# analyze in SEO Studio. Tweak by adding/removing; the warmer cycles through
# the whole list. Keep entries short (1-3 words) so user queries — which
# normalise the same way — match the same cache rows.
NICHE_SEEDS = [
    # Tech
    "tech reviews", "smartphone review", "laptop review", "headphone review",
    "gaming pc", "ai tools", "coding tutorial", "web development",
    "tech news", "iphone review", "android tips", "macbook review",
    # Gaming
    "minecraft gameplay", "fortnite", "valorant", "warzone", "roblox",
    "game review", "speedrun", "lets play", "gaming setup", "esports",
    "elden ring", "league of legends", "pokemon",
    # Beauty
    "makeup tutorial", "skincare routine", "haircare", "beauty hacks",
    "nail art", "korean skincare", "drugstore makeup", "lipstick review",
    "anti aging skincare", "natural makeup",
    # Fitness
    "weight loss workout", "build muscle", "home workout", "yoga",
    "calisthenics", "running tips", "gym tips", "ab workout",
    "cardio workout", "fat loss", "fitness motivation", "stretching",
    # Finance
    "personal finance", "stock investing", "crypto investing",
    "real estate investing", "side hustles", "passive income",
    "budgeting tips", "credit cards", "dividend investing", "etf investing",
    "frugal living", "debt free",
    # Cooking
    "easy recipes", "healthy recipes", "dinner ideas", "breakfast ideas",
    "baking tutorial", "vegan recipes", "meal prep", "air fryer recipes",
    "instant pot recipes", "keto recipes", "quick dinner",
    # Education
    "history explained", "science explained", "math tutorial",
    "language learning", "study tips", "productivity tips", "spanish lessons",
    "japanese lessons", "physics explained", "chemistry explained",
    # Lifestyle
    "morning routine", "minimalist lifestyle", "home organization",
    "decluttering", "self improvement", "habits", "mindfulness",
    "journaling tips",
    # Travel
    "travel tips", "budget travel", "japan travel", "europe travel",
    "solo travel", "bali travel", "thailand travel", "italy travel",
    # Business
    "start a business", "marketing tips", "youtube growth", "side business",
    "online business", "ecommerce tips", "shopify tutorial", "dropshipping",
    "freelancing tips",
    # Entertainment / Comedy
    "movie review", "tv show review", "anime review", "reaction video",
    "comedy sketch", "prank video",
    # Music
    "guitar tutorial", "piano tutorial", "music theory", "songwriting tips",
    "music production",
    # Sports
    "nba highlights", "soccer highlights", "boxing highlights", "ufc highlights",
    "f1 highlights",
    # Cars / Vehicles
    "car review", "tesla review", "ev review", "car detailing", "motorcycle review",
    # Photography / Video
    "photography tutorial", "lightroom tutorial", "video editing", "filmmaking tips",
    "drone footage",
    # Home / DIY
    "diy projects", "woodworking", "home renovation", "interior design",
    "gardening tips",
    # Pets
    "dog training", "cat care", "pet tips",
    # Health
    "mental health tips", "anxiety tips", "sleep tips", "intermittent fasting",
]

# How many niches to refresh per nightly run. Each costs 100 quota units,
# so 20 = 2,000 units. Full seed list (~140 entries) wraps in ~7 nights.
WARM_PER_RUN = 20

# Skip re-warming entries refreshed in the last N hours. Stops the worker
# burning quota on already-fresh rows.
SKIP_IF_FRESHER_THAN_HOURS = 36


def _yt_client_anon():
    """Anonymous YouTube client using the YOUTUBE_API_KEY env var.

    The warmer is server-initiated and doesn't need OAuth — public search
    works fine with an API key. This keeps the warmer's quota draw on the
    project key, separate from user OAuth credits."""
    api_key = os.getenv("YOUTUBE_API_KEY", "")
    if not api_key:
        print("[niche_warmer] YOUTUBE_API_KEY not set — skipping run")
        return None
    from googleapiclient.discovery import build
    return build("youtube", "v3", developerKey=api_key, cache_discovery=False)


def _pick_targets(db) -> list[str]:
    """Pick WARM_PER_RUN niches to warm next: anything in NICHE_SEEDS whose
    cache row is missing or older than SKIP_IF_FRESHER_THAN_HOURS hours.

    Sorted oldest-first so the warmer naturally rotates through the list."""
    from database.models import YoutubeSearchCache
    from app.seo import _normalize_cache_query

    # Build a map of cache_key → cached_at for all seeds in one query
    seed_keys = [
        f"seo:{_normalize_cache_query(n)}|50|relevance"
        for n in NICHE_SEEDS
    ]
    rows = (
        db.query(YoutubeSearchCache)
          .filter(YoutubeSearchCache.cache_key.in_(seed_keys))
          .all()
    )
    by_key = {r.cache_key: r for r in rows}

    cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(
        hours=SKIP_IF_FRESHER_THAN_HOURS
    )
    candidates: list[tuple[str, datetime.datetime | None]] = []
    for niche in NICHE_SEEDS:
        key = f"seo:{_normalize_cache_query(niche)}|50|relevance"
        row = by_key.get(key)
        if not row:
            candidates.append((niche, None))  # missing → highest priority
            continue
        cached_at = row.cached_at
        if cached_at and cached_at.tzinfo is None:
            cached_at = cached_at.replace(tzinfo=datetime.timezone.utc)
        if not cached_at or cached_at < cutoff:
            candidates.append((niche, cached_at))

    # None (missing) sorts before any datetime — exactly what we want
    candidates.sort(key=lambda x: (x[1] is not None, x[1] or datetime.datetime.min.replace(tzinfo=datetime.timezone.utc)))
    return [n for n, _ in candidates[:WARM_PER_RUN]]


def warm_pool():
    """Refresh the next batch of niche searches in the cache. Idempotent —
    each run picks the oldest stale niches, respects the skip-if-fresh
    window, and writes results via the same cache layer SEO Studio reads."""
    from app.utils import yt_quota_paused
    if yt_quota_paused():
        print("[niche_warmer] skipped — YT_QUOTA_PAUSED=1")
        return

    yt = _yt_client_anon()
    if yt is None:
        return

    from database.models import SessionLocal, YoutubeSearchCache
    from app.seo import _normalize_cache_query, _is_english, _SHORTS_PATTERNS

    db = SessionLocal()
    try:
        targets = _pick_targets(db)
    finally:
        db.close()

    if not targets:
        print("[niche_warmer] no stale niches — pool fully warm")
        return

    print(f"[niche_warmer] warming {len(targets)} niches: {targets[:3]}...")
    warmed = 0
    for niche in targets:
        try:
            resp = yt.search().list(
                part="snippet",
                q=niche,
                type="video",
                order="relevance",
                maxResults=50,
                relevanceLanguage="en",
                regionCode="US",
            ).execute()
        except Exception as e:
            print(f"[niche_warmer] '{niche}' search failed: {e}")
            # If it's a quota error, stop the whole run — no point burning more
            if "quotaexceeded" in str(e).lower():
                print("[niche_warmer] quotaExceeded — aborting run")
                break
            continue

        # Same item-shaping as _search_youtube_once so cache reads are
        # interchangeable. Keep this in sync if seo.py's filter changes.
        results: dict[str, dict] = {}
        for item in resp.get("items", []):
            snippet = item.get("snippet", {})
            title = snippet.get("title", "")
            if not _is_english(title):
                continue
            if _SHORTS_PATTERNS.search(title):
                continue
            vid_id = (item.get("id") or {}).get("videoId")
            if not vid_id:
                continue
            results[vid_id] = {
                "video_id":   vid_id,
                "title":      title,
                "channel":    snippet.get("channelTitle", ""),
                "channel_id": snippet.get("channelId", ""),
                "thumbnail":  snippet.get("thumbnails", {}).get("medium", {}).get("url", ""),
                "tags":       [],
                "view_count": 0,
            }

        # Write to cache under the same key SEO Studio reads
        cache_key = f"seo:{_normalize_cache_query(niche)}|50|relevance"
        db = SessionLocal()
        try:
            now = datetime.datetime.now(datetime.timezone.utc)
            row = db.query(YoutubeSearchCache).filter_by(cache_key=cache_key).first()
            payload = json.dumps(results)
            if row:
                row.result_json = payload
                row.cached_at = now
            else:
                db.add(YoutubeSearchCache(
                    cache_key=cache_key,
                    result_json=payload,
                    cached_at=now,
                ))
            db.commit()
            warmed += 1
        except Exception as e:
            print(f"[niche_warmer] cache write failed for '{niche}': {e}")
            try: db.rollback()
            except Exception: pass
        finally:
            db.close()

    print(f"[niche_warmer] run complete — warmed {warmed}/{len(targets)} niches (~{warmed * 100} units spent)")
