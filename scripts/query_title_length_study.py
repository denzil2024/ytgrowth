"""One-off, read-only: pull real title-length-vs-performance data for the
title-length study folding into /blog/youtube-title (CONTENT-PLAN.md Part 4,
item 3). Three published competitors give contradictory title-length advice
(AIR Media-Tech: 30-50 chars, 10xCreator: 70-100 chars, ViewsKit: under 30
chars); this measures it directly against our own tracked upload + view data
instead of reconciling opinions.

Method: for every tracked video with a title and at least one
video_metric_snapshots row (weekly-job coverage, so recent videos only, see
DATA-STUDIES.md moat logger #3d), compute a VELOCITY (latest views / days
live as of that snapshot), not raw views. Raw views alone confound two
things that have nothing to do with title length: channel size and how long
the video has been live. Velocity controls for the second; dividing each
video's velocity by its own channel's median velocity in the same sample
controls for the first (same normalization pattern app/outliers.py uses for
its outlier multiplier).

Bucket by title character length using boundaries that match the three
competitors' claimed ranges. Report median AND mean multiplier per bucket
(mean alone is unreliable, see CONTENT-PLAN.md's data-floor rules), the
interquartile range so the spread is visible before anyone reads a
conclusion into a small median gap, and channel/video counts per bucket so
the data floor (30 channels / 500 videos, CONTENT-PLAN.md Part 1) can be
checked per bucket, not just overall.

Excludes Shorts (is_short) since title-length advice is a long-form/search
framing question; Shorts titles behave differently.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/query_title_length_study.py
"""

import os
import statistics
import sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.models import SessionLocal

QUERY = """
SELECT
  cv.video_id,
  cv.channel_id,
  LENGTH(cv.title) AS title_len,
  cv.published_at::date AS published_date,
  MAX(vms.views) AS views,
  MAX(vms.snapshot_date) AS latest_snapshot_date
FROM channel_videos cv
JOIN video_metric_snapshots vms ON vms.video_id = cv.video_id
WHERE cv.published_at >= '2025-01-01'
  AND cv.title IS NOT NULL
  AND cv.is_short IS NOT TRUE
  AND vms.views IS NOT NULL
GROUP BY cv.video_id, cv.channel_id, cv.title, cv.published_at
"""

BUCKETS = [
    (0, 30, "<30"),
    (30, 50, "30-50"),
    (50, 70, "50-70"),
    (70, 100, "70-100"),
    (100, 10**9, "100+"),
]


def bucket_for(n):
    for lo, hi, label in BUCKETS:
        if lo <= n < hi:
            return label
    return BUCKETS[-1][2]


def iqr(vals):
    if len(vals) < 4:
        return (min(vals), max(vals))
    q1, _, q3 = statistics.quantiles(vals, n=4)
    return (q1, q3)


db = SessionLocal()
try:
    rows = db.execute(text(QUERY)).fetchall()
finally:
    db.close()

print(f"Raw rows pulled: {len(rows)}")

# Velocity per video: views / days live at the point of the latest snapshot
# we have. Floor days_live at 1 to avoid divide-by-zero on same-day snapshots.
video_velocity = {}
by_channel_velocity = defaultdict(list)
skipped_no_age = 0
for r in rows:
    days_live = (r.latest_snapshot_date - r.published_date).days
    if days_live < 1:
        skipped_no_age += 1
        continue
    velocity = r.views / days_live
    video_velocity[r.video_id] = (r.channel_id, r.title_len, velocity)
    by_channel_velocity[r.channel_id].append(velocity)

print(f"Skipped (published same day as latest snapshot, no age to divide by): {skipped_no_age}")

channel_median_velocity = {cid: statistics.median(v) for cid, v in by_channel_velocity.items()}

bucketed = defaultdict(list)
channels_in_bucket = defaultdict(set)
for video_id, (channel_id, title_len, velocity) in video_velocity.items():
    med = channel_median_velocity[channel_id]
    if not med:
        continue
    multiplier = velocity / med
    label = bucket_for(title_len)
    bucketed[label].append(multiplier)
    channels_in_bucket[label].add(channel_id)

print(f"Total channels: {len(by_channel_velocity)}")
print(f"\n{'bucket':<8} {'videos':>7} {'chans':>6} {'median_x':>9} {'mean_x':>8} {'p25_x':>8} {'p75_x':>8}")
for lo, hi, label in BUCKETS:
    mults = bucketed.get(label, [])
    if not mults:
        print(f"{label:<8} {'0':>7} {'0':>6} {'--':>9} {'--':>8} {'--':>8} {'--':>8}")
        continue
    med = statistics.median(mults)
    mean = statistics.mean(mults)
    q1, q3 = iqr(mults)
    print(f"{label:<8} {len(mults):>7} {len(channels_in_bucket[label]):>6} {med:>9.3f} {mean:>8.3f} {q1:>8.3f} {q3:>8.3f}")

all_lens = [tl for _, (_, tl, _) in video_velocity.items()]
print(f"\nOverall title length: median {statistics.median(all_lens):.1f} chars, mean {statistics.mean(all_lens):.1f} chars")
