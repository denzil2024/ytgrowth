"""Data study #15 (DATA-STUDIES.md), feeds CONTENT-PLAN.md #19: median views
per video by subscriber tier, and the implied share of subscribers who watch
a new upload.

Floor check (scripts/check_study15_floor.py) ran 2026-10-13: the 1K tier
failed (24 channels, need 30+) and was dropped. 10K/100K/1M all pass. This
script only reports those three tiers. Niche breakdowns are reported only
where a (tier, category) cell itself clears 30 channels / 500 videos; the
floor check's category table showed 10K-tier niche coverage is thin outside
music/tech/education, so most niche cells at 10K will not clear and should
be folded into an "other" note rather than reported individually.

Read-only, zero YouTube API quota: channel_metric_snapshots (for subscriber
tier + category) + channel_videos + video_metric_snapshots.

Method, stated so the article can state it:
  1. Tier each channel by its LATEST channel_metric_snapshots subscriber
     count (DISTINCT ON channel_id, most recent snapshot_date).
  2. Pull each video's LATEST views snapshot, published_at >= 2025-01-01.
  3. Per channel, take the median of its videos' latest view counts
     ("median 30-day-ish views per upload" -- snapshots are weekly, so this
     is really "views as of our most recent weekly snapshot", stated as
     such in the article, not literally "30-day views").
  4. Report the median of those per-channel medians, by tier and by
     (tier, category) where the cell clears the floor.
  5. Implied share of subscribers watching a new upload = per-channel
     median views / channel's subscriber count, reported as a median
     across channels in the tier (not an aggregate ratio, which a few
     huge channels would dominate).

Run on Railway (app service console, has DATABASE_URL):

    python scripts/query_views_per_sub_tier_study.py
"""

import os
import sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.models import SessionLocal

MIN_VIDEOS_PER_CHANNEL = 5
MIN_CHANNELS_FOR_CELL = 30
MIN_VIDEOS_FOR_CELL = 500

TIER_QUERY = """
WITH latest_snapshot AS (
  SELECT DISTINCT ON (channel_id)
    channel_id, subscribers, category
  FROM channel_metric_snapshots
  WHERE subscribers IS NOT NULL
  ORDER BY channel_id, snapshot_date DESC
),
latest_video_snapshot AS (
  SELECT DISTINCT ON (video_id)
    video_id, views
  FROM video_metric_snapshots
  WHERE views IS NOT NULL
  ORDER BY video_id, snapshot_date DESC
)
SELECT
  ls.channel_id,
  ls.subscribers,
  COALESCE(ls.category, 'uncategorized') AS category,
  CASE
    WHEN ls.subscribers >= 500000 THEN '1M'
    WHEN ls.subscribers >= 50000  THEN '100K'
    WHEN ls.subscribers >= 5000   THEN '10K'
    ELSE NULL
  END AS tier,
  cv.video_id,
  lvs.views
FROM latest_snapshot ls
JOIN channel_videos cv ON cv.channel_id = ls.channel_id
JOIN latest_video_snapshot lvs ON lvs.video_id = cv.video_id
WHERE cv.published_at >= '2025-01-01'
"""


def median(xs):
    s = sorted(xs)
    n = len(s)
    if n == 0:
        return None
    mid = n // 2
    return s[mid] if n % 2 else (s[mid - 1] + s[mid]) / 2


def main():
    db = SessionLocal()
    try:
        rows = db.execute(text(TIER_QUERY)).fetchall()
        print(f"Rows pulled (video-level, published 2025-01-01 onward): {len(rows)}")

        # Group video rows by channel first.
        by_channel = defaultdict(list)
        channel_meta = {}
        for r in rows:
            if r.tier is None:
                continue  # below 1K tier, dropped per floor check
            by_channel[r.channel_id].append(r.views)
            channel_meta[r.channel_id] = (r.tier, r.category, r.subscribers)

        usable_channels = {
            cid: views for cid, views in by_channel.items()
            if len(views) >= MIN_VIDEOS_PER_CHANNEL
        }
        print(f"Channels with {MIN_VIDEOS_PER_CHANNEL}+ videos in a usable tier: "
              f"{len(usable_channels)} (of {len(by_channel)})")
        print()

        # Per-channel median views + implied subscriber-watch share.
        per_channel_median = {}
        per_channel_share = {}
        for cid, views in usable_channels.items():
            med = median(views)
            per_channel_median[cid] = med
            tier, category, subs = channel_meta[cid]
            if subs and subs > 0:
                per_channel_share[cid] = med / subs

        by_tier_medians = defaultdict(list)
        by_tier_shares = defaultdict(list)
        by_cell_medians = defaultdict(list)
        by_cell_channels = defaultdict(set)
        by_cell_videos = defaultdict(int)

        for cid, med in per_channel_median.items():
            tier, category, subs = channel_meta[cid]
            by_tier_medians[tier].append(med)
            if cid in per_channel_share:
                by_tier_shares[tier].append(per_channel_share[cid])
            by_cell_medians[(tier, category)].append(med)
            by_cell_channels[(tier, category)].add(cid)
            by_cell_videos[(tier, category)] += len(usable_channels[cid])

        print("=== Median views per upload, by subscriber tier ===")
        print("(median of each channel's own median views -- a median of medians,")
        print(" so one huge channel can't skew the tier figure)")
        for tier in ["10K", "100K", "1M"]:
            meds = by_tier_medians.get(tier, [])
            if not meds:
                print(f"  {tier}: no data")
                continue
            m = median(meds)
            n = len(meds)
            print(f"  {tier:>5} subs: median {m:>10,.0f} views/upload   (n={n} channels)")
        print()

        print("=== Implied share of subscribers who watch a new upload, by tier ===")
        print("(median across channels of: that channel's median views / its subscriber count)")
        for tier in ["10K", "100K", "1M"]:
            shares = by_tier_shares.get(tier, [])
            if not shares:
                print(f"  {tier}: no data")
                continue
            m = median(shares)
            n = len(shares)
            print(f"  {tier:>5} subs: median {m*100:>6.2f}% of subscribers   (n={n} channels)")
        print()

        print("=== By tier + category, only cells clearing the floor "
              f"({MIN_CHANNELS_FOR_CELL}+ channels, {MIN_VIDEOS_FOR_CELL}+ videos) ===")
        for tier in ["10K", "100K", "1M"]:
            print(f"\n--- {tier} ---")
            cells = [(cat, by_cell_medians[(tier, cat)]) for (t, cat) in by_cell_medians if t == tier]
            any_pass = False
            for cat, meds in sorted(cells, key=lambda x: -len(x[1])):
                nch = len(by_cell_channels[(tier, cat)])
                nvid = by_cell_videos[(tier, cat)]
                passed = nch >= MIN_CHANNELS_FOR_CELL and nvid >= MIN_VIDEOS_FOR_CELL
                flag = "PASS" if passed else f"skip (need 30ch/500v, have {nch}ch/{nvid}v)"
                if passed:
                    any_pass = True
                    print(f"  {cat:<15} median {median(meds):>10,.0f} views/upload  "
                          f"n={nch}ch/{nvid}v  {flag}")
                else:
                    print(f"  {cat:<15} {'--':>10}                    "
                          f"n={nch}ch/{nvid}v  {flag}")
            if not any_pass:
                print("  No category cell in this tier clears the floor; "
                      "report tier-wide figure only, no niche breakdown.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
