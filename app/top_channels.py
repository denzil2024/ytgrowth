"""
Top channels per category (and optionally per country) — real discovery.

Approach: for each (category, region) pair, hit YouTube's search.list with
a tuned niche query plus the region's regionCode. Batch-fetch public
stats via channels.list, filter out anything below MIN_SUBS, sort by
subscriber count DESC, take the actual top N.

`region` semantics:
  - 'global'  → no regionCode passed; YouTube uses the requester's IP
                 default (US-leaning but not strict). Powers the main
                 /youtube-stats hub + per-category drilldowns.
  - 'US' / 'GB' / 'CA' / 'AU' / 'IN' → regionCode passed to search.list.
                 Powers the /youtube-stats/country/* pages.

Same channel can appear in multiple regions (a US-based MrBeast appears
in global + US + UK + ...). Cache key is (category, region, channel_id).

Quota math:
  - 1 search.list = 100 units, 1 channels.list = 1 unit (per 50-id batch)
  - Per (category, region): 100 + 1 = 101 units
  - 14 categories × 6 regions = 84 pairs = ~8,484 units per full refresh
  - Free quota: 10,000/day → fits with ~1.5K headroom for other features.
"""

import os
import datetime

# Search queries per category. Tuned to surface channels actually in the
# niche rather than topic-tag matches. Tweak here when a category
# returns junk — no DB migration needed.
CATEGORY_QUERIES = {
    "gaming":        "gaming youtube channel",
    "tech":          "tech reviews",
    "beauty":        "beauty makeup tutorials",
    "finance":       "personal finance investing",
    "cooking":       "cooking recipes food channel",
    "fitness":       "fitness workout",
    "music":         "music videos artist",
    "education":     "science education explained",
    "vlogs":         "daily vlog",
    "travel":        "travel vlog",
    "comedy":        "comedy sketches",
    "sports":        "sports highlights",
    "entertainment": "entertainment shows",
    "news":          "news daily",
}

CATEGORIES = list(CATEGORY_QUERIES.keys())

# Regions to refresh. 'global' = no regionCode passed (YouTube default).
# Country codes follow ISO 3166-1 alpha-2 to match YouTube's regionCode.
# Display names are exposed via the /api response so the frontend doesn't
# have to maintain its own code→name map.
REGIONS = {
    "global": "Global",
    "US":     "United States",
    "GB":     "United Kingdom",
    "CA":     "Canada",
    "AU":     "Australia",
    "IN":     "India",
}

REGION_CODES = list(REGIONS.keys())

# Minimum subscribers a channel needs to qualify for the leaderboard.
# Filters out small same-named channels that show up in search results.
MIN_SUBS = 500_000

# Cap per (category, region) in the cache. Sized for the per-category and
# per-country drilldown pages, which show the full ranked list.
TOP_N    = 50


def _yt_client():
    """Build a YouTube API client. Returns None if YOUTUBE_API_KEY isn't set."""
    api_key = os.getenv("YOUTUBE_API_KEY", "")
    if not api_key:
        print("[top_channels] YOUTUBE_API_KEY not set — skipping refresh")
        return None
    from googleapiclient.discovery import build
    return build("youtube", "v3", developerKey=api_key, cache_discovery=False)


def _discover_category(yt, query: str, region_code: str | None = None) -> list[dict]:
    """For a given (category query, region) pair: search → batch-stat →
    filter → sort. Returns the top channels (raw channels.list item
    dicts), sorted by subscribers DESC.

    region_code=None means 'global' (no regionCode, YouTube uses caller IP).
    """
    # 1. Search for channels matching the query (100 units, max 50 results).
    search_kwargs = {
        "part":       "snippet",
        "q":          query,
        "type":       "channel",
        "maxResults": 50,
        "order":      "relevance",
    }
    if region_code:
        search_kwargs["regionCode"] = region_code
    try:
        sr = yt.search().list(**search_kwargs).execute()
    except Exception as e:
        print(f"[top_channels] search failed for q='{query}' region={region_code}: {e}")
        return []

    channel_ids = []
    for item in sr.get("items", []):
        ch_id = (item.get("snippet") or {}).get("channelId") or (item.get("id") or {}).get("channelId")
        if ch_id and ch_id not in channel_ids:
            channel_ids.append(ch_id)
    if not channel_ids:
        return []

    # 2. Batch-fetch stats for everything we found (1 unit per batch of 50).
    items = []
    try:
        cr = yt.channels().list(
            part="snippet,statistics",
            id=",".join(channel_ids[:50]),
            maxResults=50,
        ).execute()
        items = cr.get("items") or []
    except Exception as e:
        print(f"[top_channels] channels batch failed for q='{query}' region={region_code}: {e}")
        return []

    # 3. Filter by min subs + skip channels that hide their sub count.
    qualified = []
    for ch in items:
        stats = ch.get("statistics") or {}
        if stats.get("hiddenSubscriberCount"):
            continue
        try:
            subs = int(stats.get("subscriberCount") or 0)
        except (TypeError, ValueError):
            continue
        if subs < MIN_SUBS:
            continue
        qualified.append((subs, ch))

    # 4. Sort by subs DESC, return raw items.
    qualified.sort(key=lambda x: x[0], reverse=True)
    return [ch for _subs, ch in qualified]


def _to_row(item: dict, category: str, region: str, rank: int) -> dict:
    snippet = item.get("snippet") or {}
    stats   = item.get("statistics") or {}
    thumbs  = (snippet.get("thumbnails") or {})
    return {
        "category":    category,
        "region":      region,
        "channel_id":  item.get("id") or "",
        "title":       snippet.get("title") or "",
        "handle":      (snippet.get("customUrl") or "").lstrip("@"),
        "thumbnail":   (thumbs.get("medium", {}).get("url")
                        or thumbs.get("default", {}).get("url") or ""),
        "country":     snippet.get("country") or "",
        "subscribers": int(stats.get("subscriberCount") or 0),
        "total_views": int(stats.get("viewCount") or 0),
        "video_count": int(stats.get("videoCount") or 0),
        "rank":        rank,
    }


def refresh_all(regions: list[str] | None = None) -> dict:
    """Discover + persist the top channels for every (category, region)
    pair. Replaces each pair's rows wholesale (delete + insert) so
    departed channels don't linger.

    regions=None refreshes every entry in REGIONS. Pass a subset to
    refresh selectively (e.g. for a rotation schedule).

    Returns a small summary dict keyed by region+category for logging."""
    from database.models import SessionLocal, TopChannelCache

    yt = _yt_client()
    if yt is None:
        return {"ok": False, "reason": "no_api_key"}

    target_regions = regions if regions is not None else REGION_CODES
    summary = {"ok": True, "per_region": {}}
    db = SessionLocal()
    try:
        now = datetime.datetime.utcnow()
        for region in target_regions:
            if region not in REGIONS:
                print(f"[top_channels] skipping unknown region: {region}")
                continue
            region_code = None if region == "global" else region
            per_cat = {}
            for category, query in CATEGORY_QUERIES.items():
                items = _discover_category(yt, query, region_code=region_code)
                top   = items[:TOP_N]
                # Don't wipe the cache when discovery returns empty (e.g.
                # API quota exhausted, network blip, search returned no
                # qualifying channels). Stale data is far more useful to
                # users than an empty leaderboard.
                if not top:
                    print(f"[top_channels] no items for {category}/{region}, keeping cached rows")
                    per_cat[category] = 0
                    continue
                # Clear this (category, region) cache and reinsert. Cheaper than
                # diffing because the set is small (≤ TOP_N rows per pair).
                db.query(TopChannelCache).filter_by(category=category, region=region).delete()
                for idx, item in enumerate(top, start=1):
                    row = _to_row(item, category, region, idx)
                    db.add(TopChannelCache(**row, fetched_at=now))
                per_cat[category] = len(top)
            summary["per_region"][region] = per_cat
            # Commit per-region so a failure mid-way still persists what
            # was already discovered, instead of rolling everything back.
            db.commit()
        return summary
    except Exception as e:
        db.rollback()
        print(f"[top_channels] refresh_all error: {e}")
        return {"ok": False, "reason": "exception", "error": str(e)}
    finally:
        db.close()


def fetch_grouped(top_n: int = 10, region: str = "global") -> dict:
    """Read the cache as { category: [rows...] }, filtered to a single
    region, sorted by subscribers DESC within each category. Cap to top N
    (default 10) so the UI shows a clean leaderboard.

    Defaults to region='global' so existing callers (the main hub) get
    the same data they did before the country dimension was added."""
    from database.models import SessionLocal, TopChannelCache

    db = SessionLocal()
    try:
        rows = (
            db.query(TopChannelCache)
              .filter(TopChannelCache.region == region)
              .order_by(
                  TopChannelCache.category.asc(),
                  TopChannelCache.subscribers.desc().nullslast(),
              )
              .all()
        )
        grouped_raw = {}
        latest = None
        for r in rows:
            grouped_raw.setdefault(r.category, []).append(r)
            if latest is None or (r.fetched_at and r.fetched_at > latest):
                latest = r.fetched_at

        out = {}
        for cat, cat_rows in grouped_raw.items():
            top = cat_rows[:top_n]
            out[cat] = [{
                "channel_id":  r.channel_id,
                "title":       r.title,
                "handle":      r.handle,
                "thumbnail":   r.thumbnail,
                "country":     r.country,
                "subscribers": r.subscribers or 0,
                "total_views": r.total_views or 0,
                "video_count": r.video_count or 0,
                "rank":        idx + 1,
            } for idx, r in enumerate(top)]

        return {
            "categories":  CATEGORIES,
            "region":      region,
            "region_name": REGIONS.get(region, region),
            "groups":      out,
            "fetched_at":  latest.isoformat() if latest else None,
        }
    finally:
        db.close()


# Backwards-compat alias for the debug endpoint that imported the old
# constant. Keeps /admin/top-channels-debug working without churn.
TOP_CHANNELS_SEED = CATEGORY_QUERIES
