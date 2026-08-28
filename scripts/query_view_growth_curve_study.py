"""One-off, read-only: full data pull for "How Fast Views Actually Come In"
(CONTENT-PLAN.md data studies #5 and #6, combined into one new article).
Zero fresh API quota: channel_videos + video_metric_snapshots only.

Builds a real per-video growth curve from the weekly snapshot job (Sundays
05:30 UTC, live since 2026-07-19), instead of a single upload-day count.

Method:
1. For each tracked video, build its (days_since_published, views) series
   from weekly snapshots.
2. For videos with a snapshot at 30+ days live, compute what SHARE of their
   day-30 view count had already arrived by day 7 and day 14. That is the
   real "how fast do views come in" number, reported as a median share
   across videos, not an average of raw view counts (a few huge videos
   would otherwise dominate).
3. Repeat split by is_short (study #6's angle: do Shorts front-load faster).
4. Repeat split by category (Simpson's-paradox guard, same floor as prior
   studies).

Binding constraint to report honestly: the snapshot job is ~6 weeks old as
of this run, so the 30-day-plus cohort is real but young. Report the exact
count before any figure gets written up, per the site's data-floor rule.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/query_view_growth_curve_study.py
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
  cv.published_at AS published_at,
  cv.is_short AS is_short,
  vms.snapshot_date AS snapshot_date,
  vms.views AS views,
  tc.category AS category
FROM channel_videos cv
JOIN video_metric_snapshots vms ON vms.video_id = cv.video_id
LEFT JOIN (
  SELECT DISTINCT ON (channel_id) channel_id, category
  FROM top_channel_cache
  ORDER BY channel_id, region
) tc ON tc.channel_id = cv.channel_id
WHERE cv.published_at >= '2025-01-01'
  AND vms.views IS NOT NULL
"""

db = SessionLocal()
try:
    rows = db.execute(text(QUERY)).fetchall()
finally:
    db.close()

by_video = defaultdict(list)
meta = {}
skipped_no_published = 0

for r in rows:
    if r.published_at is None:
        skipped_no_published += 1
        continue
    days_live = (r.snapshot_date - r.published_at.date()).days
    if days_live < 0:
        continue
    by_video[r.video_id].append((days_live, r.views))
    meta[r.video_id] = (r.channel_id, r.is_short, r.category or "uncategorized")

print("=" * 74)
print(f"RAW: {len(by_video)} videos with at least one snapshot "
      f"(skipped no published_at: {skipped_no_published})")
print("=" * 74)

# For each video, find the snapshot nearest day 7, day 14, day 30 (must be
# within +/- 3 days of the target to count as a real observation there).
TARGETS = {"day7": 7, "day14": 14, "day30": 30}
TOLERANCE = 3


def nearest(series, target_day):
    best = None
    best_diff = TOLERANCE + 1
    for days_live, views in series:
        diff = abs(days_live - target_day)
        if diff <= TOLERANCE and diff < best_diff:
            best = views
            best_diff = diff
    return best


video_points = {}
for vid, series in by_video.items():
    series.sort()
    d30 = nearest(series, 30)
    if d30 is None or d30 <= 0:
        continue
    d7 = nearest(series, 7)
    d14 = nearest(series, 14)
    video_points[vid] = {
        "d7_share": (d7 / d30) if d7 is not None else None,
        "d14_share": (d14 / d30) if d14 is not None else None,
        "d30": d30,
    }

n_with_d30 = len(video_points)
print(f"\nVideos with a real day-30 (+/-{TOLERANCE}d) observation: {n_with_d30}")
print(f"Channels represented: {len({meta[v][0] for v in video_points})}")

print("\n" + "=" * 74)
print("1. SHARE OF DAY-30 VIEWS ARRIVED BY DAY 7 / DAY 14 (pooled, median)")
print("=" * 74)
d7_shares = [p["d7_share"] for p in video_points.values() if p["d7_share"] is not None]
d14_shares = [p["d14_share"] for p in video_points.values() if p["d14_share"] is not None]
if d7_shares:
    print(f"By day 7:  median {statistics.median(d7_shares):.1%} of day-30 views already in "
          f"(n={len(d7_shares)}), mean {statistics.mean(d7_shares):.1%}")
else:
    print("By day 7: no videos with a day-7 observation, insufficient runway")
if d14_shares:
    print(f"By day 14: median {statistics.median(d14_shares):.1%} of day-30 views already in "
          f"(n={len(d14_shares)}), mean {statistics.mean(d14_shares):.1%}")
else:
    print("By day 14: no videos with a day-14 observation, insufficient runway")

print("\n" + "=" * 74)
print("2. SHORTS VS LONG-FORM: WHICH FRONT-LOADS FASTER (study #6)")
print("=" * 74)
for label, is_short_val in [("Long-form", False), ("Shorts", True)]:
    subset = [p for v, p in video_points.items() if meta[v][1] == is_short_val]
    d7s = [p["d7_share"] for p in subset if p["d7_share"] is not None]
    d14s = [p["d14_share"] for p in subset if p["d14_share"] is not None]
    print(f"{label}: n={len(subset)}", end="")
    if d7s:
        print(f", day-7 share median {statistics.median(d7s):.1%} (n={len(d7s)})", end="")
    if d14s:
        print(f", day-14 share median {statistics.median(d14s):.1%} (n={len(d14s)})", end="")
    print()

print("\n" + "=" * 74)
print("3. BY CATEGORY (Simpson's-paradox check, day-7 share, 30-video floor)")
print("=" * 74)
by_cat = defaultdict(list)
for vid, p in video_points.items():
    if p["d7_share"] is not None:
        by_cat[meta[vid][2]].append(p["d7_share"])

for cat, shares in sorted(by_cat.items(), key=lambda kv: -len(kv[1])):
    if len(shares) < 30:
        print(f"{cat}: n={len(shares)}, below 30-video floor, skipped")
        continue
    print(f"{cat} (n={len(shares)}): median day-7 share {statistics.median(shares):.1%}")

print("\n" + "=" * 74)
print("4. RAW DAYS-LIVE COVERAGE (sanity check on how much runway exists)")
print("=" * 74)
all_days_live = [d for series in by_video.values() for d, _ in series]
if all_days_live:
    print(f"min days_live observed: {min(all_days_live)}, max: {max(all_days_live)}")
    print(f"videos with ANY snapshot at 30+ days live: "
          f"{sum(1 for series in by_video.values() if any(d >= 27 for d, _ in series))}")
    print(f"videos with ANY snapshot at 14+ days live: "
          f"{sum(1 for series in by_video.values() if any(d >= 11 for d, _ in series))}")
