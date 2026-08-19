"""One-off backfill: pull upload history for TopChannelCache channels that
`channel_videos` is missing, for specific categories.

Why: the weekly video_snapshots.discover_uploads() job walks
`sorted(ChannelRegistry ids | TopChannelCache ids)[:3000]` — alphabetical,
not priority order. Small categories can end up with most of their
discovered channels never walked. Confirmed 2026-08-19: `tech` had only
17/? and `music` only 26/? distinct channels with any channel_videos rows,
both below the 30-channel data floor in CONTENT-PLAN.md, blocking the
tech-video-ideas and music-video-ideas queue items.

This targets ONLY the specific category's missing channels instead of the
capped/alphabetical full sweep, so it's cheap regardless of how large the
overall tracked-channel set has grown.

Cost: 1 unit/channel (playlistItems.list) + ~1 unit per 50 new videos
(videos.list). A category maxes out at TOP_N=50 channels x 6 regions in
top_channel_cache, so worst case per category is a few hundred units —
trivial against the 260K/day budget. Honours YT_QUOTA_PAUSED.

Run on Railway (needs YOUTUBE_API_KEY + DATABASE_URL, both only set there):

    python scripts/backfill_channel_videos_for_category.py music tech
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.video_snapshots import _yt_client, _parse_duration, _parse_ts, SHORT_MAX_SECONDS
from database.models import SessionLocal, ChannelVideo, TopChannelCache


def missing_channel_ids(db, category: str) -> list[str]:
    discovered = {
        cid for (cid,) in db.query(TopChannelCache.channel_id)
        .filter(TopChannelCache.category == category)
        .distinct()
    }
    have_videos = {
        cid for (cid,) in db.query(ChannelVideo.channel_id).distinct()
        if cid in discovered
    }
    return sorted(discovered - have_videos)


def backfill(yt, db, channel_ids: list[str]) -> int:
    known = {vid for (vid,) in db.query(ChannelVideo.video_id)}
    new_items: dict[str, str] = {}

    for cid in channel_ids:
        if not cid.startswith("UC"):
            continue
        playlist_id = "UU" + cid[2:]
        try:
            resp = (
                yt.playlistItems()
                .list(part="contentDetails", playlistId=playlist_id, maxResults=50)
                .execute()
            )
        except Exception as e:
            print(f"[backfill] uploads fetch failed for {cid}: {e}")
            continue
        for item in resp.get("items", []):
            vid = (item.get("contentDetails") or {}).get("videoId")
            if vid and vid not in known:
                new_items[vid] = cid

    new_ids = list(new_items.keys())
    for i in range(0, len(new_ids), 50):
        batch = new_ids[i : i + 50]
        resp = (
            yt.videos()
            .list(part="snippet,contentDetails", id=",".join(batch), maxResults=50)
            .execute()
        )
        for item in resp.get("items", []):
            secs = _parse_duration((item.get("contentDetails") or {}).get("duration"))
            sn = item.get("snippet") or {}
            db.add(
                ChannelVideo(
                    video_id=item["id"],
                    channel_id=new_items.get(item["id"], sn.get("channelId")),
                    title=sn.get("title"),
                    published_at=_parse_ts(sn.get("publishedAt")),
                    duration_seconds=secs,
                    is_short=(secs is not None and secs <= SHORT_MAX_SECONDS),
                )
            )
    db.commit()
    return len(new_ids)


def main():
    if os.getenv("YT_QUOTA_PAUSED") == "1":
        print("[backfill] YT_QUOTA_PAUSED=1 — skipping")
        return

    categories = sys.argv[1:]
    if not categories:
        print("Usage: python scripts/backfill_channel_videos_for_category.py <category> [category...]")
        sys.exit(1)

    yt = _yt_client()
    if yt is None:
        sys.exit(1)

    db = SessionLocal()
    try:
        total_channels_hit = 0
        total_new_videos = 0
        for category in categories:
            missing = missing_channel_ids(db, category)
            print(f"[backfill] {category}: {len(missing)} channels missing channel_videos data")
            if not missing:
                continue
            new_count = backfill(yt, db, missing)
            total_channels_hit += len(missing)
            total_new_videos += new_count
            print(f"[backfill] {category}: {new_count} new videos inserted")
        print(
            f"[backfill] done. {total_channels_hit} channels hit, "
            f"{total_new_videos} new videos. "
            f"~{total_channels_hit + (total_new_videos // 50) + 1} units spent."
        )
    finally:
        db.close()


if __name__ == "__main__":
    main()
