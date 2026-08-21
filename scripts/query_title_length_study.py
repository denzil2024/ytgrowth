"""One-off, read-only: pull real title-length-vs-performance data for the
title-length study folding into /blog/youtube-title (CONTENT-PLAN.md Part 4,
item 3). Three published competitors give contradictory title-length advice
(AIR Media-Tech: 30-50 chars, 10xCreator: 70-100 chars, ViewsKit: under 30
chars); this measures it directly against our own tracked upload + view data
instead of reconciling opinions.

Method, upgraded from a first pass that only reported bucket medians (not
rigorous enough, see conversation 2026-08-21: "who is going to take us
seriously" comparing this to Backlinko/Ahrefs-style studies, which lead with
a correlation coefficient across the full dataset, not bucket averages):

1. Base metric is VELOCITY (latest views / days live at the point of the
   latest snapshot), not raw views. Raw views alone confound two things that
   have nothing to do with title length: channel size and how long the video
   has been live.
2. Each video's velocity is divided by its own channel's median velocity in
   the same sample (same normalization pattern app/outliers.py uses for its
   outlier multiplier), controlling for channel size.
3. HEADLINE STAT: Spearman rank correlation between title character length
   and the normalized multiplier, across every video, not just 5 buckets.
   Reported with N. This is the actual finding; the bucket table below it is
   a reader-friendly translation of the same relationship, not a substitute
   for it.
4. Correlation is also reported PER NICHE (via top_channel_cache.category)
   as a Simpson's-paradox check: a pooled correlation can appear only
   because some niches both write long titles AND perform well for reasons
   that have nothing to do with title length. If the sign/magnitude holds
   within niches, the pooled number means something. If it does not, that
   is the honest finding and gets published instead.
5. Bucket table still reported (median, mean, IQR, video/channel counts per
   bucket) so the correlation translates into a concrete "aim for X
   characters" recommendation a reader can act on.

Excludes Shorts (is_short) since title-length advice is a long-form/search
framing question; Shorts titles behave differently.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/query_title_length_study.py
"""

import math
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
  MAX(vms.snapshot_date) AS latest_snapshot_date,
  tc.category AS category
FROM channel_videos cv
JOIN video_metric_snapshots vms ON vms.video_id = cv.video_id
LEFT JOIN (
  SELECT DISTINCT ON (channel_id) channel_id, category
  FROM top_channel_cache
  ORDER BY channel_id, region
) tc ON tc.channel_id = cv.channel_id
WHERE cv.published_at >= '2025-01-01'
  AND cv.title IS NOT NULL
  AND cv.is_short IS NOT TRUE
  AND vms.views IS NOT NULL
GROUP BY cv.video_id, cv.channel_id, cv.title, cv.published_at, tc.category
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


def rank(values):
    """Average rank for ties, 1-indexed."""
    order = sorted(range(len(values)), key=lambda i: values[i])
    ranks = [0.0] * len(values)
    i = 0
    n = len(order)
    while i < n:
        j = i
        while j + 1 < n and values[order[j + 1]] == values[order[i]]:
            j += 1
        avg_rank = (i + j) / 2 + 1
        for k in range(i, j + 1):
            ranks[order[k]] = avg_rank
        i = j + 1
    return ranks


def pearson(xs, ys):
    n = len(xs)
    if n < 2:
        return None
    mx = statistics.mean(xs)
    my = statistics.mean(ys)
    cov = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    sx = math.sqrt(sum((x - mx) ** 2 for x in xs))
    sy = math.sqrt(sum((y - my) ** 2 for y in ys))
    if sx == 0 or sy == 0:
        return None
    return cov / (sx * sy)


def spearman(xs, ys):
    return pearson(rank(xs), rank(ys))


def describe_r(r):
    if r is None:
        return "n/a"
    a = abs(r)
    if a < 0.10:
        strength = "negligible"
    elif a < 0.30:
        strength = "weak"
    elif a < 0.50:
        strength = "moderate"
    else:
        strength = "strong"
    direction = "positive (longer titles perform better)" if r > 0 else "negative (shorter titles perform better)"
    return f"{strength}, {direction}"


db = SessionLocal()
try:
    rows = db.execute(text(QUERY)).fetchall()
finally:
    db.close()

print(f"Raw rows pulled: {len(rows)}")

video_len = {}
video_category = {}
by_channel_velocity = defaultdict(list)
video_velocity_raw = {}
skipped_no_age = 0
for r in rows:
    days_live = (r.latest_snapshot_date - r.published_date).days
    if days_live < 1:
        skipped_no_age += 1
        continue
    velocity = r.views / days_live
    video_velocity_raw[r.video_id] = (r.channel_id, velocity)
    video_len[r.video_id] = r.title_len
    video_category[r.video_id] = r.category or "uncategorized"
    by_channel_velocity[r.channel_id].append(velocity)

print(f"Skipped (published same day as latest snapshot): {skipped_no_age}")

channel_median_velocity = {cid: statistics.median(v) for cid, v in by_channel_velocity.items()}

video_multiplier = {}
for vid, (cid, velocity) in video_velocity_raw.items():
    med = channel_median_velocity[cid]
    if med:
        video_multiplier[vid] = velocity / med

print(f"Total channels: {len(by_channel_velocity)}")
print(f"Videos with a valid multiplier: {len(video_multiplier)}")

# --- Headline stat: pooled Spearman correlation ---
xs = [video_len[v] for v in video_multiplier]
ys = [video_multiplier[v] for v in video_multiplier]
r_pooled = spearman(xs, ys)
print(f"\nPOOLED Spearman r (title length vs. performance multiplier): {r_pooled:.4f}  n={len(xs)}")
print(f"  {describe_r(r_pooled)}")

# --- Per-niche correlation, as a Simpson's-paradox check ---
by_cat = defaultdict(list)
for vid, mult in video_multiplier.items():
    by_cat[video_category[vid]].append(vid)

print(f"\n{'category':<15} {'n':>6} {'spearman_r':>11}   strength/direction")
for cat, vids in sorted(by_cat.items(), key=lambda kv: -len(kv[1])):
    if len(vids) < 30:
        print(f"{cat:<15} {len(vids):>6} {'--':>11}   below 30-video floor, skipped")
        continue
    cxs = [video_len[v] for v in vids]
    cys = [video_multiplier[v] for v in vids]
    r = spearman(cxs, cys)
    print(f"{cat:<15} {len(vids):>6} {r:>11.4f}   {describe_r(r)}")

# --- Bucket table: reader-friendly translation of the same relationship ---
bucketed = defaultdict(list)
channels_in_bucket = defaultdict(set)
for vid, mult in video_multiplier.items():
    label = bucket_for(video_len[vid])
    bucketed[label].append(mult)
    channels_in_bucket[label].add(video_velocity_raw[vid][0])

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

all_lens = list(video_len.values())
print(f"\nOverall title length: median {statistics.median(all_lens):.1f} chars, mean {statistics.mean(all_lens):.1f} chars")
