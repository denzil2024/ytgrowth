"""One-time seed for the `kw:` competition cache that backs the free
/tools/youtube-keyword-research tool.

Why: the public tool is cache-ONLY (it never calls search.list for anonymous
visitors). A young cache means a mostly-empty tool. This script warms a fixed
list of popular, evergreen YouTube content topics ONCE so the tool launches
useful and those terms are cached for everyone.

Cost: ~102 units per keyword that isn't already cached (search.list 100 +
videos.list 1 + channels.list 1). The list below is ~50 keywords, so a full
cold run is ~5,100 units, roughly half a day's 10K budget, spent ONE time.
Already-cached fresh keywords cost 0 (skipped). Honour YT_QUOTA_PAUSED.

Run against the SAME database the deployed app uses (prod DATABASE_URL) and
with YOUTUBE_API_KEY set, e.g. on Railway:

    railway run python scripts/seed_keyword_cache.py

or locally if your .env points DATABASE_URL at the production Postgres.
"""

import datetime
import json
import os
import sys
import time

# Make the repo root importable when run as a script.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.keywords import _fetch_competition_for_keyword, _KW_CACHE_TTL_HOURS
from app.seo import _normalize_cache_query
from database.models import SessionLocal, YoutubeSearchCache

# Popular, evergreen YouTube content topics creators actually research. A mix of
# broad (demonstrates the data) and specific/long-tail (shows real openings).
KEYWORDS = [
    # Gaming
    "gaming setup", "minecraft", "valorant", "gta 5",
    # Fitness / health
    "weight loss", "home workout", "yoga for beginners", "meal prep",
    "keto diet", "intermittent fasting",
    # Finance
    "stock market for beginners", "personal finance", "passive income",
    "credit cards", "real estate investing", "crypto for beginners", "day trading",
    # Beauty
    "makeup tutorial", "skincare routine", "grwm",
    # Tech
    "product review", "iphone review", "pc build", "tech news", "ai tools",
    "chatgpt",
    # Coding / education
    "coding for beginners", "python tutorial", "web development",
    "study with me", "language learning", "book summary",
    # Lifestyle / productivity
    "true crime", "meditation", "productivity", "morning routine",
    "self improvement",
    # Travel / food
    "travel vlog", "budget travel", "food review", "street food",
    "cooking for beginners", "baking",
    # Auto
    "car review",
    # Make money online
    "how to make money online", "affiliate marketing", "dropshipping",
    "youtube automation", "faceless youtube channel", "side hustle",
]


def _is_cached_fresh(keyword: str) -> bool:
    """True if this keyword already has a fresh, full-schema cache row, so we
    can skip it and spend 0 units."""
    cache_key = f"kw:{_normalize_cache_query(keyword)}|5|relevance"
    db = SessionLocal()
    try:
        row = db.query(YoutubeSearchCache).filter_by(cache_key=cache_key).first()
        if not row or not row.cached_at:
            return False
        cached_at = row.cached_at
        if cached_at.tzinfo is None:
            cached_at = cached_at.replace(tzinfo=datetime.timezone.utc)
        age_hours = (datetime.datetime.now(datetime.timezone.utc) - cached_at).total_seconds() / 3600
        if age_hours >= _KW_CACHE_TTL_HOURS:
            return False
        try:
            comp = json.loads(row.result_json)
        except Exception:
            return False
        return "top_videos" in comp and "publishing_timeline" in comp
    except Exception:
        return False
    finally:
        db.close()


def main():
    api_key = os.getenv("YOUTUBE_API_KEY", "")
    if not api_key:
        print("ERROR: YOUTUBE_API_KEY not set. Aborting.", flush=True)
        sys.exit(1)

    if os.getenv("YT_QUOTA_PAUSED") == "1":
        print("YT_QUOTA_PAUSED=1 — refusing to spend quota. Aborting.", flush=True)
        sys.exit(1)

    # De-dupe by normalized key so two phrasings of the same topic don't double-spend.
    seen = set()
    todo = []
    for kw in KEYWORDS:
        norm = _normalize_cache_query(kw)
        if norm in seen:
            continue
        seen.add(norm)
        todo.append(kw)

    total = len(todo)
    fetched = 0
    skipped = 0
    failed = 0
    print(f"Seeding {total} keywords. Each cold fetch is ~102 units.", flush=True)

    for i, kw in enumerate(todo, 1):
        if _is_cached_fresh(kw):
            skipped += 1
            print(f"[{i}/{total}] SKIP (already cached): {kw}", flush=True)
            continue
        try:
            result = _fetch_competition_for_keyword(kw, api_key)
            if result and result.get("result_count", 0) > 0:
                fetched += 1
                print(f"[{i}/{total}] OK: {kw} "
                      f"(results={result.get('result_count')}, "
                      f"views_median={result.get('top_views_median')})", flush=True)
            else:
                failed += 1
                print(f"[{i}/{total}] EMPTY/FAILED: {kw}", flush=True)
            # Be gentle on the API; this is a one-off batch, not latency-sensitive.
            time.sleep(1.0)
        except Exception as e:
            failed += 1
            print(f"[{i}/{total}] ERROR: {kw} -> {e}", flush=True)

    est_units = fetched * 102
    print("-" * 50, flush=True)
    print(f"Done. fetched={fetched}, skipped={skipped}, failed={failed}", flush=True)
    print(f"Estimated quota spent: ~{est_units} units.", flush=True)


if __name__ == "__main__":
    main()
