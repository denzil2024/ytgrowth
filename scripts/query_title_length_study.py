"""One-off, read-only: pull real title-length-vs-performance data for the
title-length study folding into /blog/youtube-title (CONTENT-PLAN.md Part 4,
item 3). Three published competitors give contradictory title-length advice
(AIR Media-Tech: 30-50 chars, 10xCreator: 70-100 chars, ViewsKit: under 30
chars); this measures it directly against our own tracked upload + view data
instead of reconciling opinions.

Method: for every tracked video with both a title and at least one
video_metric_snapshots row (weekly-job coverage, so recent videos only, see
DATA-STUDIES.md moat logger #3d), take its latest (max) view count, then
normalize by that video's own channel's median views in the same sample so a
single huge channel cannot dominate a bucket. Bucket by title character
length using boundaries that match the three competitors' claimed ranges, and
report the median performance multiplier per bucket, plus channel and video
counts so the data floor (30 channels / 500 videos, CONTENT-PLAN.md Part 1)
can be checked before anything gets published.

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
  MAX(vms.views) AS views
FROM channel_videos cv
JOIN video_metric_snapshots vms ON vms.video_id = cv.video_id
WHERE cv.published_at >= '2025-01-01'
  AND cv.title IS NOT NULL
  AND cv.is_short IS NOT TRUE
  AND vms.views IS NOT NULL
GROUP BY cv.video_id, cv.channel_id, cv.title
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


db = SessionLocal()
try:
    rows = db.execute(text(QUERY)).fetchall()
finally:
    db.close()

print(f"Raw rows pulled: {len(rows)}")

by_channel = defaultdict(list)
for r in rows:
    by_channel[r.channel_id].append(r.views)

channel_median = {cid: statistics.median(v) for cid, v in by_channel.items()}

bucketed = defaultdict(list)
channels_in_bucket = defaultdict(set)
for r in rows:
    med = channel_median[r.channel_id]
    if not med:
        continue
    multiplier = r.views / med
    label = bucket_for(r.title_len)
    bucketed[label].append(multiplier)
    channels_in_bucket[label].add(r.channel_id)

print(f"Total channels: {len(by_channel)}")
print(f"{'bucket':<10} {'videos':>8} {'channels':>9} {'median_mult':>12} {'mean_mult':>10}")
for lo, hi, label in BUCKETS:
    mults = bucketed.get(label, [])
    if not mults:
        print(f"{label:<10} {'0':>8} {'0':>9} {'--':>12} {'--':>10}")
        continue
    med = statistics.median(mults)
    mean = statistics.mean(mults)
    print(f"{label:<10} {len(mults):>8} {len(channels_in_bucket[label]):>9} {med:>12.3f} {mean:>10.3f}")

all_lens = [r.title_len for r in rows]
print(f"\nOverall title length: median {statistics.median(all_lens):.1f} chars, mean {statistics.mean(all_lens):.1f} chars")
