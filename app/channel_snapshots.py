"""
Weekly channel metrics snapshots — moat item #3b (see DATA-STUDIES.md).

Collects every channel id the product has ever seen (ChannelRegistry,
TopChannelCache, and id-keyed PublicChannelStatsCache rows), fetches their
current public stats in batched channels.list calls (1 unit per 50 ids),
and writes one ChannelMetricSnapshot row per channel per run. Existing
tables overwrite these numbers; this module is what turns them into a
time series for the growth-rate data studies.

Quota math: N channels cost ceil(N/50) units. The MAX_CHANNELS cap keeps a
runaway registry from ever costing more than ~200 units per weekly run.
The scheduler wrapper checks YT_QUOTA_PAUSED before calling snapshot_channels.
"""

import datetime
import os

MAX_CHANNELS = 10_000  # hard cap: ceil(10000/50) = 200 units/run


def _yt_client():
    """Build a YouTube API client. Returns None if YOUTUBE_API_KEY isn't set."""
    api_key = os.getenv("YOUTUBE_API_KEY", "")
    if not api_key:
        print("[channel_snapshots] YOUTUBE_API_KEY not set — skipping run")
        return None
    from googleapiclient.discovery import build
    return build("youtube", "v3", developerKey=api_key, cache_discovery=False)


def _collect_channel_ids(db) -> dict[str, str | None]:
    """Every channel id we know about, mapped to its category when known.

    Category comes from TopChannelCache only; registry and public-tool
    channels get None and can be classified later if a study needs it.
    """
    from database.models import (
        ChannelRegistry, TopChannelCache, PublicChannelStatsCache,
    )
    ids: dict[str, str | None] = {}

    for (cid,) in db.query(ChannelRegistry.channel_id).distinct():
        if cid:
            ids[cid] = None

    for cid, category in db.query(
        TopChannelCache.channel_id, TopChannelCache.category
    ).distinct():
        if cid:
            # Keep the first category seen; a channel in several category
            # leaderboards is rare and any one label is fine for grouping.
            ids.setdefault(cid, category)
            if ids[cid] is None:
                ids[cid] = category

    for (key,) in db.query(PublicChannelStatsCache.cache_key).filter(
        PublicChannelStatsCache.cache_key.like("id:%")
    ):
        cid = key[3:]
        if cid:
            ids.setdefault(cid, None)

    return ids


def snapshot_channels(yt=None) -> int:
    """Fetch current stats for every known channel and write today's rows.

    Idempotent per day: re-running deletes and rewrites today's snapshot.
    Returns the number of rows written. Pass a prebuilt client in tests.
    """
    from database.models import SessionLocal, ChannelMetricSnapshot

    yt = yt or _yt_client()
    if yt is None:
        return 0

    db = SessionLocal()
    try:
        ids_to_category = _collect_channel_ids(db)
        channel_ids = list(ids_to_category.keys())[:MAX_CHANNELS]
        if not channel_ids:
            print("[channel_snapshots] no known channels yet — nothing to do")
            return 0

        today = datetime.datetime.now(datetime.timezone.utc).date()
        db.query(ChannelMetricSnapshot).filter(
            ChannelMetricSnapshot.snapshot_date == today
        ).delete(synchronize_session=False)

        written = 0
        for i in range(0, len(channel_ids), 50):
            batch = channel_ids[i : i + 50]
            resp = (
                yt.channels()
                .list(part="statistics", id=",".join(batch), maxResults=50)
                .execute()
            )
            for item in resp.get("items", []):
                stats = item.get("statistics", {}) or {}
                db.add(
                    ChannelMetricSnapshot(
                        snapshot_date=today,
                        channel_id=item["id"],
                        subscribers=int(stats["subscriberCount"])
                        if stats.get("subscriberCount") is not None
                        else None,
                        total_views=int(stats["viewCount"])
                        if stats.get("viewCount") is not None
                        else None,
                        video_count=int(stats["videoCount"])
                        if stats.get("videoCount") is not None
                        else None,
                        category=ids_to_category.get(item["id"]),
                    )
                )
                written += 1

        db.commit()
        units = -(-len(channel_ids) // 50)
        print(
            f"[channel_snapshots] wrote {written} rows for {today} "
            f"({len(channel_ids)} ids, ~{units} quota units)"
        )
        return written
    finally:
        db.close()
