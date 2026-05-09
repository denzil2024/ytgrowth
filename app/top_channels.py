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
# admin UI can edit these without code; until then they live here. Bad
# handles fail silently in refresh_all() — only channels that actually
# resolve via the YouTube API end up in the cache, so the UX never shows
# broken entries.
TOP_CHANNELS_SEED = {
    "gaming": [
        "MrBeastGaming", "Markiplier", "jacksepticeye", "PewDiePie",
        "DanTDM", "Ninja", "Valkyrae", "Pokimane", "Dream",
        "VanossGaming", "Jelly", "PrestonPlayz",
    ],
    "tech": [
        "mkbhd", "LinusTechTips", "UnboxTherapy", "Mrwhosetheboss",
        "JerryRigEverything", "DaveLee", "AustinEvans", "iJustine",
        "MrMobile", "TechLinked", "ShortCircuit",
    ],
    "beauty": [
        "jamescharles", "NikkieTutorials", "JeffreeStar",
        "TatiWestbrook", "patrickstarrr", "MichellePhan",
        "RclBeauty101", "BretmanRock",
    ],
    "finance": [
        "GrahamStephan", "MeetKevin", "AndreiJikh", "ThePlainBagel",
        "BiggerPockets", "MinorityMindset", "ProjectLifeMastery",
        "TheRamseyShow",
    ],
    "cooking": [
        "bingingwithbabish", "joshuaweissman", "AdamRagusea",
        "InternetShaquille", "AlmazanKitchen", "Tasty",
        "BonAppetit", "JamieOliver", "GordonRamsay",
    ],
    "fitness": [
        "athleanx", "JeffNippard", "ChloeTing", "ScottHermanFitness",
        "BradleyMartynOnline", "Calisthenicmovement", "BuffDudes",
        "NimaiDelgado",
    ],
    "music": [
        "EminemMusic", "Beyonce", "TaylorSwift", "JustinBieber",
        "BrunoMars", "TheWeeknd", "edsheeran", "ArianaGrande",
        "drake", "ladygaga",
    ],
    "education": [
        "veritasium", "Vsauce", "kurzgesagt", "crashcourse",
        "Numberphile", "TED", "TheRoyalInstitution", "SmarterEveryDay",
        "MarkRober", "AsapSCIENCE",
    ],
    "vlogs": [
        "emmachamberlain", "caseyneistat", "DavidDobrik", "Zoella",
        "shanedawson", "LoganPaul", "JakePaul",
    ],
    "travel": [
        "MarkWiens", "LostLeBlanc", "DrewBinsky", "FunForLouis",
        "SailingLaVagabonde", "kara_and_nate",
    ],
    "comedy": [
        "Smosh", "Lilly", "JennaMarbles", "danielhowell",
        "AmazingPhil", "CodyKo", "KurtisConner",
    ],
    "sports": [
        "DudePerfect", "F1", "NBA", "NFL", "uefa",
        "premierleague", "Formula1",
    ],
    "entertainment": [
        "MrBeast", "TheTryGuys", "BuzzFeedVideo", "VanityFair",
        "WIRED", "JimmyKimmelLive", "TheTonightShow",
    ],
    "news": [
        "VICENews", "vox", "BloombergQuicktake", "Reuters",
        "BBCNews", "TheYoungTurks",
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
    """Resolve an @handle to a full channel record. Tries forHandle first
    (1 unit, exact match), falls back to a search-then-fetch (~101 units,
    fuzzy match) so an outdated or slightly-off handle in the seed list
    still produces a result. Returns the raw channels.list item dict on
    success, None on failure."""
    # Path 1: exact handle resolution (cheapest, 1 unit)
    try:
        resp = yt.channels().list(
            part="snippet,statistics",
            forHandle=handle,
            maxResults=1,
        ).execute()
        items = resp.get("items") or []
        if items:
            return items[0]
    except Exception as e:
        print(f"[top_channels] forHandle failed for @{handle}: {e}")

    # Path 2: search → channels.list fallback
    try:
        sr = yt.search().list(
            part="snippet",
            q=f"@{handle}",
            type="channel",
            maxResults=1,
        ).execute()
        s_items = sr.get("items") or []
        if not s_items:
            return None
        ch_id = s_items[0].get("snippet", {}).get("channelId") or s_items[0].get("id", {}).get("channelId")
        if not ch_id:
            return None
        cr = yt.channels().list(
            part="snippet,statistics",
            id=ch_id,
            maxResults=1,
        ).execute()
        c_items = cr.get("items") or []
        return c_items[0] if c_items else None
    except Exception as e:
        print(f"[top_channels] search fallback failed for @{handle}: {e}")
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


def fetch_grouped(top_n: int = 10) -> dict:
    """Read the cache as { category: [rows...] }, sorted by subscribers
    DESC within each category. Cap to top N (default 10) so the UI shows
    a clean leaderboard rather than the full seed list. Stored `rank`
    column is ignored — actual ranking comes from current sub counts."""
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
        # Group, then trim to top N + assign display rank
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
