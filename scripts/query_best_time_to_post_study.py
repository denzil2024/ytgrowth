"""One-off, read-only: full data pull for "Best time to post, measured"
(CONTENT-PLAN.md data study #3, upgrades /blog/best-time-to-post). Zero fresh
API quota: channel_videos + video_metric_snapshots only, same tables the
title-length study (scripts/query_title_patterns_study.py) already used.

Same normalization as that study, so the two are directly comparable:

1. VELOCITY = latest views / days live as of that snapshot. Controls for
   video age.
2. MULTIPLIER = a video's velocity / its own channel's median velocity in
   this sample. Controls for channel size.

Grouped by publish hour (UTC) and publish weekday, median multiplier per
group is the headline number, not a raw view average (a few big-channel
videos would otherwise dominate any hour they happen to cluster in). Also
runs the per-category check as a Simpson's-paradox guard, same floor (30
videos) as the title study.

Excludes Shorts (is_short), same reasoning as the title study: Shorts get
discovered on a different surface (Shorts feed vs. search/suggested) and
posting-time effects would need their own study.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/query_best_time_to_post_study.py
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
  AND cv.is_short IS NOT TRUE
  AND vms.views IS NOT NULL
GROUP BY cv.video_id, cv.channel_id, cv.published_at, tc.category
"""

WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def describe_r_free(medians_by_key, keys_in_order, unit_label):
    """No single correlation coefficient for a categorical axis like hour/
    weekday, so report high/low group and the spread instead."""
    valid = [(k, medians_by_key[k]) for k in keys_in_order if k in medians_by_key]
    if len(valid) < 2:
        return "not enough populated groups to compare"
    best = max(valid, key=lambda kv: kv[1])
    worst = min(valid, key=lambda kv: kv[1])
    spread = best[1] - worst[1]
    return (f"best {unit_label} {best[0]} (median x{best[1]:.3f}), "
            f"worst {unit_label} {worst[0]} (median x{worst[1]:.3f}), "
            f"spread {spread:.3f}")


db = SessionLocal()
try:
    rows = db.execute(text(QUERY)).fetchall()
finally:
    db.close()

by_channel_velocity = defaultdict(list)
video_velocity_raw = {}
video_hour_utc = {}
video_weekday = {}
video_category = {}
skipped_no_age = skipped_no_published = 0

for r in rows:
    if r.published_at is None:
        skipped_no_published += 1
        continue
    days_live = (r.latest_snapshot_date - r.published_at.date()).days
    if days_live < 1:
        skipped_no_age += 1
        continue
    velocity = r.views / days_live
    video_velocity_raw[r.video_id] = (r.channel_id, velocity)
    video_hour_utc[r.video_id] = r.published_at.hour
    video_weekday[r.video_id] = r.published_at.weekday()  # 0=Monday
    video_category[r.video_id] = r.category or "uncategorized"
    by_channel_velocity[r.channel_id].append(velocity)

channel_median_velocity = {cid: statistics.median(v) for cid, v in by_channel_velocity.items()}

video_multiplier = {}
for vid, (cid, velocity) in video_velocity_raw.items():
    med = channel_median_velocity[cid]
    if med:
        video_multiplier[vid] = velocity / med

vids = list(video_multiplier.keys())

print("=" * 74)
print(f"STUDY N: {len(vids)} videos across {len(by_channel_velocity)} channels")
print(f"(raw rows pulled: {len(rows)}, skipped no published_at: {skipped_no_published}, "
      f"skipped same-day-as-snapshot: {skipped_no_age})")
print("=" * 74)

print("\n" + "=" * 74)
print("1. BY PUBLISH HOUR (UTC)")
print("=" * 74)
by_hour = defaultdict(list)
for v in vids:
    by_hour[video_hour_utc[v]].append(v)

hour_medians = {}
print(f"{'hour_utc':<9} {'videos':>7} {'chans':>6} {'median_x':>9} {'mean_x':>8}")
for h in range(24):
    chunk = by_hour.get(h, [])
    if len(chunk) < 20:
        print(f"{h:<9} {len(chunk):>7}      --        --        --   below 20-video floor")
        continue
    mults = [video_multiplier[v] for v in chunk]
    chans = {video_velocity_raw[v][0] for v in chunk}
    med = statistics.median(mults)
    hour_medians[h] = med
    print(f"{h:<9} {len(chunk):>7} {len(chans):>6} {med:>9.3f} {statistics.mean(mults):>8.3f}")

print(f"\n{describe_r_free(hour_medians, list(range(24)), 'hour')}")

print("\n" + "=" * 74)
print("2. BY PUBLISH WEEKDAY (UTC)")
print("=" * 74)
by_weekday = defaultdict(list)
for v in vids:
    by_weekday[video_weekday[v]].append(v)

weekday_medians = {}
print(f"{'weekday':<11} {'videos':>7} {'chans':>6} {'median_x':>9} {'mean_x':>8}")
for wd in range(7):
    chunk = by_weekday.get(wd, [])
    name = WEEKDAY_NAMES[wd]
    if len(chunk) < 20:
        print(f"{name:<11} {len(chunk):>7}      --        --        --   below 20-video floor")
        continue
    mults = [video_multiplier[v] for v in chunk]
    chans = {video_velocity_raw[v][0] for v in chunk}
    med = statistics.median(mults)
    weekday_medians[wd] = med
    print(f"{name:<11} {len(chunk):>7} {len(chans):>6} {med:>9.3f} {statistics.mean(mults):>8.3f}")

print(f"\n{describe_r_free(weekday_medians, list(range(7)), 'weekday')}")

print("\n" + "=" * 74)
print("3. BY CATEGORY (Simpson's-paradox check: does any niche's best-hour differ?)")
print("=" * 74)
by_cat = defaultdict(list)
for v in vids:
    by_cat[video_category[v]].append(v)

for cat, cvids in sorted(by_cat.items(), key=lambda kv: -len(kv[1])):
    if len(cvids) < 30:
        print(f"{cat}: n={len(cvids)}, below 30-video floor, skipped")
        continue
    cat_by_hour = defaultdict(list)
    for v in cvids:
        cat_by_hour[video_hour_utc[v]].append(v)
    cat_hour_medians = {}
    for h, chunk in cat_by_hour.items():
        if len(chunk) >= 15:
            cat_hour_medians[h] = statistics.median(video_multiplier[v] for v in chunk)
    print(f"{cat} (n={len(cvids)}): {describe_r_free(cat_hour_medians, list(range(24)), 'hour')}")

print("\n" + "=" * 74)
print("4. WEEKDAY x HOUR CROSS-TAB (median multiplier, blank = below 15-video floor)")
print("=" * 74)
header = "         " + "".join(f"{h:>6}" for h in range(24))
print(header)
for wd in range(7):
    row_cells = []
    for h in range(24):
        chunk = [v for v in vids if video_weekday[v] == wd and video_hour_utc[v] == h]
        if len(chunk) < 15:
            row_cells.append("    --")
        else:
            row_cells.append(f"{statistics.median(video_multiplier[v] for v in chunk):>6.2f}")
    print(f"{WEEKDAY_NAMES[wd]:<9}" + "".join(row_cells))
