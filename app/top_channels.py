"""
Top channels per category — curated seed + daily refresh.

The CHANNEL LIST per category is editorially curated (handles below). The
STATS (subs, views, videos) refresh once a day from the YouTube Data API
so the figures readers see are real and current. Pattern matches what
SocialBlade-style sites do — discovery surface that doesn't go stale.

Wire-up:
  - Seed: TOP_CHANNELS_SEED below. Add/remove handles per category here.
  - Refresh: refresh_all() resolves handles → channel IDs and pulls stats
    via channels.list. Called daily by app/scheduler.py.
  - Read:   routers/top_channels_routes.py exposes the cache.
"""

import os
import datetime

# Curated seed list — handles only (without leading @). One day a future
# admin UI can edit these without code; until then they live here.
TOP_CHANNELS_SEED = {
    "gaming": [
        "MrBeastGaming", "Markiplier", "jacksepticeye", "PewDiePie",
        "DanTDM", "Ninja", "Valkyrae", "Pokimane",
    ],
    "tech": [
        "mkbhd", "LinusTechTips", "UnboxTherapy", "Mrwhosetheboss",
        "JerryRigEverything", "DaveLee", "AustinEvans",
    ],
    "beauty": [
        "JeffreeStarOfficial", "jamescharles", "NikkieTutorials",
        "TatiWestbrook", "patrickstarrr", "MichellePhan",
    ],
    "finance": [
        "GrahamStephan", "MeetKevin", "AndreiJikh", "ThePlainBagel",
        "BiggerPocketsRealEstateInvesting",
    ],
    "cooking": [
        "bingingwithbabish", "joshuaweissman", "AdamRagusea",
        "InternetShaquille", "AlmazanKitchen",
    ],
    "fitness": [
        "athleanx", "JeffNippard", "ChloeTing", "ScottHermanFitness",
        "BradleyMartynOnline",
    ],
    "music": [
        "EminemMusic", "Beyonce", "TaylorSwift", "JustinBieber",
        "BrunoMars", "TheWeeknd",
    ],
    "education": [
        "veritasium", "Vsauce", "kurzgesagt", "crashcourse",
        "Numberphile", "TED",
    ],
}

CATEGORIES = list(TOP_CHANNELS_SEED.keys())


def _yt_client():
    """Build a YouTube API client. Returns None if YOUTUBE_API_KEY isn't set."""
    api_key = os.getenv("YOUTUBE_API_KEY", "")
    if not api_key:
        print("[top_channels] YOUTUBE_API_KEY not set — skipping refresh")
        return None
    from googleapiclient.discovery import build
    return build("youtube", "v3", developerKey=api_key, cache_discovery=False)


def _resolve_handle(yt, handle: str) -> dict | None:
    """Resolve an @handle to a full channel record via channels.list. Returns
    the raw item dict on success, None on failure."""
    try:
        resp = yt.channels().list(
            part="snippet,statistics",
            forHandle=handle,
            maxResults=1,
        ).execute()
        items = resp.get("items") or []
        return items[0] if items else None
    except Exception as e:
        print(f"[top_channels] handle resolve failed for @{handle}: {e}")
        return None


def _to_row(item: dict, category: str, handle: str, rank: int) -> dict:
    snippet = item.get("snippet") or {}
    stats   = item.get("statistics") or {}
    thumbs  = (snippet.get("thumbnails") or {})
    return {
        "category":    category,
        "channel_id":  item.get("id") or "",
        "title":       snippet.get("title") or "",
        "handle":      handle,
        "thumbnail":   (thumbs.get("medium", {}).get("url")
                        or thumbs.get("default", {}).get("url") or ""),
        "country":     snippet.get("country") or "",
        "subscribers": int(stats.get("subscriberCount") or 0),
        "total_views": int(stats.get("viewCount") or 0),
        "video_count": int(stats.get("videoCount") or 0),
        "rank":        rank,
    }


def refresh_all() -> dict:
    """Pull current stats for every seeded handle, upsert into cache. Returns
    a small summary dict for logging."""
    from database.models import SessionLocal, TopChannelCache

    yt = _yt_client()
    if yt is None:
        return {"ok": False, "reason": "no_api_key"}

    inserted = 0
    updated  = 0
    failed   = []
    db = SessionLocal()
    try:
        for category, handles in TOP_CHANNELS_SEED.items():
            for rank, handle in enumerate(handles, start=1):
                item = _resolve_handle(yt, handle)
                if not item or not item.get("id"):
                    failed.append(f"{category}/{handle}")
                    continue
                row = _to_row(item, category, handle, rank)
                existing = (
                    db.query(TopChannelCache)
                      .filter_by(category=category, channel_id=row["channel_id"])
                      .first()
                )
                now = datetime.datetime.utcnow()
                if existing:
                    for k, v in row.items():
                        setattr(existing, k, v)
                    existing.fetched_at = now
                    updated += 1
                else:
                    db.add(TopChannelCache(**row, fetched_at=now))
                    inserted += 1
        db.commit()
        return {"ok": True, "inserted": inserted, "updated": updated, "failed": failed}
    except Exception as e:
        db.rollback()
        print(f"[top_channels] refresh_all error: {e}")
        return {"ok": False, "reason": "exception", "error": str(e)}
    finally:
        db.close()


def fetch_grouped(min_per_category: int = 0) -> dict:
    """Read the cache as { category: [rows...] }, sorted by rank. Used by the
    public endpoint."""
    from database.models import SessionLocal, TopChannelCache

    db = SessionLocal()
    try:
        rows = (
            db.query(TopChannelCache)
              .order_by(TopChannelCache.category.asc(), TopChannelCache.rank.asc())
              .all()
        )
        out = {}
        latest = None
        for r in rows:
            out.setdefault(r.category, []).append({
                "channel_id":  r.channel_id,
                "title":       r.title,
                "handle":      r.handle,
                "thumbnail":   r.thumbnail,
                "country":     r.country,
                "subscribers": r.subscribers or 0,
                "total_views": r.total_views or 0,
                "video_count": r.video_count or 0,
                "rank":        r.rank or 0,
            })
            if latest is None or (r.fetched_at and r.fetched_at > latest):
                latest = r.fetched_at
        return {
            "categories":  CATEGORIES,
            "groups":      out,
            "fetched_at":  latest.isoformat() if latest else None,
        }
    finally:
        db.close()
