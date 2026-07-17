"""
Weekly upload-history + video-stats snapshots — moat items #3c/#3d
(see DATA-STUDIES.md).

Two passes, one weekly run (Sundays 05:30 UTC, after channel snapshots):

1. DISCOVERY — for each tracked channel, fetch the first page of its uploads
   playlist (50 newest videos, 1 unit/channel via the UC->UU playlist-id
   trick) and insert anything not yet in channel_videos. New ids then get
   one batched videos.list call (1 unit/50) for duration + title, which also
   classifies Shorts (duration <= 62s).

2. STATS — every video in channel_videos younger than TRACK_DAYS gets a
   views/likes/comments row in video_metric_snapshots via batched
   videos.list (1 unit/50). Older videos drop out automatically.

Quota math per weekly run at the caps below:
  discovery: <= MAX_UPLOAD_CHANNELS units (3,000)
  new-video details: ~len(new)/50 units (typically < 100)
  stats: <= MAX_TRACKED_VIDEOS/50 units (1,000)
  worst case ~4,100 units/week — under 2% of one day's 260K quota.
The scheduler wrapper checks YT_QUOTA_PAUSED before running.

Channels tracked: ChannelRegistry + TopChannelCache (product users and
leaderboard channels). The anonymous public-tool ids are deliberately NOT
walked for uploads — they are unvetted and would grow without bound.
"""

import datetime
import re

MAX_UPLOAD_CHANNELS = 3_000
MAX_TRACKED_VIDEOS  = 50_000
TRACK_DAYS          = 180
SHORT_MAX_SECONDS   = 62

_DUR_RE = re.compile(
    r"PT(?:(?P<h>\d+)H)?(?:(?P<m>\d+)M)?(?:(?P<s>\d+)S)?"
)


def _parse_duration(iso: str | None) -> int | None:
    """ISO-8601 YouTube duration (PT#H#M#S) -> seconds, None if unparseable."""
    if not iso:
        return None
    m = _DUR_RE.fullmatch(iso)
    if not m:
        return None
    h = int(m.group("h") or 0)
    mi = int(m.group("m") or 0)
    s = int(m.group("s") or 0)
    return h * 3600 + mi * 60 + s


def _parse_ts(iso: str | None) -> datetime.datetime | None:
    if not iso:
        return None
    try:
        return datetime.datetime.fromisoformat(iso.replace("Z", "+00:00"))
    except ValueError:
        return None


def _yt_client():
    import os
    api_key = os.getenv("YOUTUBE_API_KEY", "")
    if not api_key:
        print("[video_snapshots] YOUTUBE_API_KEY not set — skipping run")
        return None
    from googleapiclient.discovery import build
    return build("youtube", "v3", developerKey=api_key, cache_discovery=False)


def _tracked_channel_ids(db) -> list[str]:
    from database.models import ChannelRegistry, TopChannelCache
    ids: set[str] = set()
    for (cid,) in db.query(ChannelRegistry.channel_id).distinct():
        if cid:
            ids.add(cid)
    for (cid,) in db.query(TopChannelCache.channel_id).distinct():
        if cid:
            ids.add(cid)
    return sorted(ids)[:MAX_UPLOAD_CHANNELS]


def discover_uploads(yt, db) -> int:
    """Pass 1: insert newly seen videos for every tracked channel."""
    from database.models import ChannelVideo

    known = {vid for (vid,) in db.query(ChannelVideo.video_id)}
    new_items: dict[str, str] = {}  # video_id -> channel_id

    for cid in _tracked_channel_ids(db):
        # A channel's uploads playlist id is its channel id with UC -> UU.
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
            # Deleted/terminated channels 404 here; skip quietly.
            print(f"[video_snapshots] uploads fetch failed for {cid}: {e}")
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
            secs = _parse_duration(
                (item.get("contentDetails") or {}).get("duration")
            )
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
    print(f"[video_snapshots] discovery: {len(new_ids)} new videos")
    return len(new_ids)


def snapshot_video_stats(yt, db) -> int:
    """Pass 2: weekly stats row for every tracked video under TRACK_DAYS old."""
    from database.models import ChannelVideo, VideoMetricSnapshot

    now = datetime.datetime.now(datetime.timezone.utc)
    today = now.date()
    cutoff = now - datetime.timedelta(days=TRACK_DAYS)

    vids = [
        vid
        for (vid,) in db.query(ChannelVideo.video_id)
        .filter(ChannelVideo.published_at != None)  # noqa: E711
        .filter(ChannelVideo.published_at >= cutoff)
        .limit(MAX_TRACKED_VIDEOS)
    ]
    if not vids:
        print("[video_snapshots] stats: no videos young enough to track yet")
        return 0

    db.query(VideoMetricSnapshot).filter(
        VideoMetricSnapshot.snapshot_date == today
    ).delete(synchronize_session=False)

    written = 0
    for i in range(0, len(vids), 50):
        batch = vids[i : i + 50]
        resp = (
            yt.videos()
            .list(part="statistics", id=",".join(batch), maxResults=50)
            .execute()
        )
        for item in resp.get("items", []):
            st = item.get("statistics") or {}
            db.add(
                VideoMetricSnapshot(
                    snapshot_date=today,
                    video_id=item["id"],
                    views=int(st["viewCount"]) if st.get("viewCount") is not None else None,
                    likes=int(st["likeCount"]) if st.get("likeCount") is not None else None,
                    comments=int(st["commentCount"]) if st.get("commentCount") is not None else None,
                )
            )
            written += 1
    db.commit()
    print(f"[video_snapshots] stats: wrote {written} rows for {today}")
    return written


def run_video_snapshots(yt=None) -> tuple[int, int]:
    """Full weekly run: discovery then stats. Idempotent per day on stats."""
    from database.models import SessionLocal

    yt = yt or _yt_client()
    if yt is None:
        return (0, 0)
    db = SessionLocal()
    try:
        discovered = discover_uploads(yt, db)
        written = snapshot_video_stats(yt, db)
        return (discovered, written)
    finally:
        db.close()
