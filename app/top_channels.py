"""
Top channels per category — real discovery, not editorial curation.

Approach (v2): for each category, use YouTube's search.list with a tuned
query, type=channel. Batch-fetch the public statistics for every result
via channels.list, filter out anything below a minimum subscriber bar
(skips random small channels that share a name with a popular one),
sort by sub count DESC, take the actual top N.

This means:
  - No hand-curated handle list to maintain (the previous approach
    silently mis-resolved handles like "drake" into 469-sub strangers).
  - "Top" actually means top by subscribers, sourced from YouTube
    itself rather than my guesses.
  - New big channels appear automatically as YouTube's relevance
    algorithm picks them up.

API quota: per refresh, 1 search.list (100 units) + 1 channels.list
batch (1 unit) per category. 14 categories ≈ 1,414 units per daily
refresh. Free quota is 10,000/day, so this is ~14% of headroom.
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

# Minimum subscribers a channel needs to qualify for the top-10 list.
# Filters out small same-named channels that show up in search results.
MIN_SUBS = 500_000

# Cap per category in the cache. Keep modestly above the UI display
# count so re-sorts still have headroom.
TOP_N    = 12


def _yt_client():
    """Build a YouTube API client. Returns None if YOUTUBE_API_KEY isn't set."""
    api_key = os.getenv("YOUTUBE_API_KEY", "")
    if not api_key:
        print("[top_channels] YOUTUBE_API_KEY not set — skipping refresh")
        return None
    from googleapiclient.discovery import build
    return build("youtube", "v3", developerKey=api_key, cache_discovery=False)


def _discover_category(yt, query: str) -> list[dict]:
    """For a given category query: search → batch-stat → filter → sort.
    Returns the top channels (raw channels.list item dicts) for the
    category, sorted by subscribers DESC."""
    # 1. Search for channels matching the query (100 units, max 50 results).
    try:
        sr = yt.search().list(
            part="snippet",
            q=query,
            type="channel",
            maxResults=50,
            order="relevance",
        ).execute()
    except Exception as e:
        print(f"[top_channels] search failed for '{query}': {e}")
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
        print(f"[top_channels] channels batch failed for '{query}': {e}")
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


def _to_row(item: dict, category: str, rank: int) -> dict:
    snippet = item.get("snippet") or {}
    stats   = item.get("statistics") or {}
    thumbs  = (snippet.get("thumbnails") or {})
    return {
        "category":    category,
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


def refresh_all() -> dict:
    """Discover + persist the top channels for every category. Replaces
    each category's rows wholesale (delete + insert) so departed
    channels don't linger. Returns a small summary dict for logging."""
    from database.models import SessionLocal, TopChannelCache

    yt = _yt_client()
    if yt is None:
        return {"ok": False, "reason": "no_api_key"}

    summary = {"ok": True, "per_category": {}}
    db = SessionLocal()
    try:
        now = datetime.datetime.utcnow()
        for category, query in CATEGORY_QUERIES.items():
            items = _discover_category(yt, query)
            top   = items[:TOP_N]
            # Clear this category's cache and reinsert. Cheaper than
            # diffing because the set is small (≤ TOP_N rows per cat).
            db.query(TopChannelCache).filter_by(category=category).delete()
            for idx, item in enumerate(top, start=1):
                row = _to_row(item, category, idx)
                db.add(TopChannelCache(**row, fetched_at=now))
            summary["per_category"][category] = len(top)
        db.commit()
        return summary
    except Exception as e:
        db.rollback()
        print(f"[top_channels] refresh_all error: {e}")
        return {"ok": False, "reason": "exception", "error": str(e)}
    finally:
        db.close()


def fetch_grouped(top_n: int = 10) -> dict:
    """Read the cache as { category: [rows...] }, sorted by subscribers
    DESC within each category. Cap to top N (default 10) so the UI shows
    a clean leaderboard."""
    from database.models import SessionLocal, TopChannelCache

    db = SessionLocal()
    try:
        rows = (
            db.query(TopChannelCache)
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
            "groups":      out,
            "fetched_at":  latest.isoformat() if latest else None,
        }
    finally:
        db.close()


# Backwards-compat alias for the debug endpoint that imported the old
# constant. Keeps /admin/top-channels-debug working without churn.
TOP_CHANNELS_SEED = CATEGORY_QUERIES
