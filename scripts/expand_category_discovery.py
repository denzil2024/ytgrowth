"""One-off: broaden channel discovery for specific categories that don't
clear CONTENT-PLAN.md's 30-channel data floor under the single CATEGORY_QUERIES
term in app/top_channels.py. Confirmed 2026-08-19: 'tech' search ("tech
reviews") only ever surfaces 17 distinct channels total (not a backfill gap,
a discovery gap); 'music' ("music videos artist") surfaces 28.

Runs several additional, more varied search terms per category (channel
discovery, not the scheduled job's single term), pulls each qualifying
channel's upload history since 2025-01-01, and writes both into
top_channel_cache (region='global') and channel_videos so this also fixes
the underlying gap for future use, not just this one article pull.

Cost: 100 units per extra search query x ~6 queries x N categories, plus
~1 unit per channel (playlistItems) and ~1 unit per 50 videos (videos.list).
Two categories (tech, music) x 6 queries = 12 search.list calls, well under
the 100/day search sub-limit. Total ballpark: ~1,300-1,500 units.

Run on Railway (app service console, has YOUTUBE_API_KEY + DATABASE_URL):

    python scripts/expand_category_discovery.py tech music
"""

import datetime
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

EXTRA_QUERIES = {
    "tech": [
        "tech reviews", "tech youtuber", "gadget review channel",
        "smartphone review channel", "tech unboxing channel", "consumer tech channel",
    ],
    "music": [
        "music videos artist", "official music channel", "music youtuber",
        "music review channel", "band official channel", "singer official channel",
    ],
}

MIN_SUBS = 5_000
MIN_VIDEO_COUNT = 15

_DUR_RE = re.compile(r"PT(?:(?P<h>\d+)H)?(?:(?P<m>\d+)M)?(?:(?P<s>\d+)S)?")


def _parse_duration(iso):
    if not iso:
        return None
    m = _DUR_RE.fullmatch(iso)
    if not m:
        return None
    h = int(m.group("h") or 0)
    mi = int(m.group("m") or 0)
    s = int(m.group("s") or 0)
    return h * 3600 + mi * 60 + s


def _parse_ts(iso):
    if not iso:
        return None
    try:
        return datetime.datetime.fromisoformat(iso.replace("Z", "+00:00"))
    except ValueError:
        return None


def _yt_client():
    api_key = os.getenv("YOUTUBE_API_KEY", "")
    if not api_key:
        print("[expand] YOUTUBE_API_KEY not set — aborting")
        return None
    from googleapiclient.discovery import build
    return build("youtube", "v3", developerKey=api_key, cache_discovery=False)


def discover_channel_ids(yt, queries):
    ids = set()
    for q in queries:
        try:
            resp = yt.search().list(
                part="snippet", q=q, type="channel", maxResults=50, order="relevance"
            ).execute()
        except Exception as e:
            print(f"[expand] search failed for '{q}': {e}")
            continue
        for item in resp.get("items", []):
            cid = (item.get("snippet") or {}).get("channelId") or (item.get("id") or {}).get("channelId")
            if cid:
                ids.add(cid)
    return list(ids)


def qualify_channels(yt, ids):
    out = []
    for i in range(0, len(ids), 50):
        batch = ids[i : i + 50]
        try:
            resp = yt.channels().list(part="snippet,statistics", id=",".join(batch)).execute()
        except Exception as e:
            print(f"[expand] channels.list failed: {e}")
            continue
        for ch in resp.get("items", []):
            stats = ch.get("statistics") or {}
            if stats.get("hiddenSubscriberCount"):
                continue
            subs = int(stats.get("subscriberCount") or 0)
            video_count = int(stats.get("videoCount") or 0)
            if subs >= MIN_SUBS and video_count >= MIN_VIDEO_COUNT:
                out.append(ch)
    return out


def persist_channels(db, category, channels):
    from database.models import TopChannelCache

    existing = {
        cid for (cid,) in db.query(TopChannelCache.channel_id)
        .filter(TopChannelCache.category == category, TopChannelCache.region == "global")
    }
    next_rank = len(existing) + 1
    now = datetime.datetime.utcnow()
    inserted = 0
    for ch in channels:
        cid = ch.get("id") or ""
        if cid in existing:
            continue
        snippet = ch.get("snippet") or {}
        stats = ch.get("statistics") or {}
        thumbs = snippet.get("thumbnails") or {}
        db.add(TopChannelCache(
            category=category, region="global", channel_id=cid,
            title=snippet.get("title") or "",
            handle=(snippet.get("customUrl") or "").lstrip("@"),
            thumbnail=(thumbs.get("medium", {}).get("url") or thumbs.get("default", {}).get("url") or ""),
            country=snippet.get("country") or "",
            subscribers=int(stats.get("subscriberCount") or 0),
            total_views=int(stats.get("viewCount") or 0),
            video_count=int(stats.get("videoCount") or 0),
            rank=next_rank, fetched_at=now,
        ))
        existing.add(cid)
        next_rank += 1
        inserted += 1
    db.commit()
    return inserted


def fetch_and_persist_videos(yt, db, channels):
    from database.models import ChannelVideo

    known = {vid for (vid,) in db.query(ChannelVideo.video_id)}
    video_to_channel = {}
    for ch in channels:
        cid = ch.get("id") or ""
        if not cid.startswith("UC"):
            continue
        playlist_id = "UU" + cid[2:]
        try:
            resp = yt.playlistItems().list(
                part="contentDetails", playlistId=playlist_id, maxResults=50
            ).execute()
        except Exception as e:
            print(f"[expand] uploads fetch failed for {cid}: {e}")
            continue
        for item in resp.get("items", []):
            vid = (item.get("contentDetails") or {}).get("videoId")
            if vid and vid not in known:
                video_to_channel[vid] = cid

    new_ids = list(video_to_channel.keys())
    inserted = 0
    for i in range(0, len(new_ids), 50):
        batch = new_ids[i : i + 50]
        resp = yt.videos().list(part="snippet,contentDetails", id=",".join(batch)).execute()
        for item in resp.get("items", []):
            secs = _parse_duration((item.get("contentDetails") or {}).get("duration"))
            sn = item.get("snippet") or {}
            db.add(ChannelVideo(
                video_id=item["id"],
                channel_id=video_to_channel.get(item["id"], sn.get("channelId")),
                title=sn.get("title"),
                published_at=_parse_ts(sn.get("publishedAt")),
                duration_seconds=secs,
                is_short=(secs is not None and secs <= 62),
            ))
            inserted += 1
    db.commit()
    return inserted


def check_floor(db, category):
    from sqlalchemy import text
    row = db.execute(text("""
        SELECT COUNT(DISTINCT cv.channel_id) AS channels, COUNT(*) AS videos,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_seconds) / 60.0 AS median_min,
            AVG(duration_seconds) / 60.0 AS mean_min,
            AVG(CASE WHEN duration_seconds <= 60 THEN 1.0 ELSE 0.0 END) AS shorts_share
        FROM channel_videos cv
        WHERE cv.channel_id IN (SELECT DISTINCT channel_id FROM top_channel_cache WHERE category = :category)
        AND cv.published_at >= '2025-01-01'
        AND cv.duration_seconds IS NOT NULL
    """), {"category": category}).fetchone()
    return row


def main():
    if os.getenv("YT_QUOTA_PAUSED") == "1":
        print("[expand] YT_QUOTA_PAUSED=1 — skipping")
        return

    categories = sys.argv[1:]
    if not categories:
        print("Usage: python scripts/expand_category_discovery.py <category> [category...]")
        sys.exit(1)

    yt = _yt_client()
    if yt is None:
        sys.exit(1)

    from database.models import SessionLocal
    db = SessionLocal()
    search_calls = 0
    try:
        for category in categories:
            queries = EXTRA_QUERIES.get(category)
            if not queries:
                print(f"[expand] no query set defined for '{category}', skipping")
                continue
            print(f"\n=== {category} ===")
            ids = discover_channel_ids(yt, queries)
            search_calls += len(queries)
            print(f"discovered {len(ids)} unique candidate channel ids")
            qualified = qualify_channels(yt, ids)
            print(f"{len(qualified)} qualify (>={MIN_SUBS} subs, >={MIN_VIDEO_COUNT} videos)")
            ch_inserted = persist_channels(db, category, qualified)
            print(f"persisted {ch_inserted} new top_channel_cache rows")
            v_inserted = fetch_and_persist_videos(yt, db, qualified)
            print(f"persisted {v_inserted} new channel_videos rows")
            floor = check_floor(db, category)
            print(
                f"FLOOR CHECK: channels={floor.channels} videos={floor.videos} "
                f"median_min={floor.median_min} mean_min={floor.mean_min} "
                f"shorts_share={floor.shorts_share}"
            )
        print(f"\nsearch.list calls used: {search_calls} (against the 100/day sub-limit)")
    finally:
        db.close()


if __name__ == "__main__":
    main()
