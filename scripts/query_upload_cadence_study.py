"""One-off, read-only: full data pull for "Upload cadence: successful
channels vs. stalled ones" (CONTENT-PLAN.md data study #4, upgrades
/blog/best-time-to-post's "How Often Should You Post on YouTube?" section).
Zero fresh API quota: channel_videos + video_metric_snapshots only, same
tables studies #2 and #3 already used.

Growth signal, self-normalized per channel (no cross-channel size bias):

1. VELOCITY = latest views / days live as of that snapshot, same metric as
   study #3.
2. Split each channel's tracked videos into an EARLY half and a LATE half
   by published_at (median split by index, not by date, so uneven upload
   spacing doesn't skew the split).
3. GROWTH RATIO = median(late-half velocity) / median(early-half velocity).
   Bucketed by TERCILE across all qualifying channels (top third of ratios
   = "growing", bottom third = "stalled", middle third = "flat"), not a
   fixed cutoff. A fixed 1.15x cutoff put 84% of channels in "growing"
   (median ratio across the sample was ~2.0x, most tracked channels' later
   videos outperform their earliest ones just from normal audience
   accumulation), which wasn't a real growing-vs-stalled split. Terciles
   guarantee a real, even comparison group regardless of where the
   population's ratios happen to sit.
4. CADENCE = videos per week across the channel's full tracked span
   (first published_at to last published_at in the sample).

Floor: a channel needs >= 10 tracked videos to be split into two halves
with any statistical meaning. Below that, excluded from this study (still
covered by the separate niche-cadence table already in the article).

This is correlational, not causal, and the article must say so. A channel
could upload more BECAUSE it is growing (more resources, more motivation),
not grow BECAUSE it uploads more. Report both directions honestly.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/query_upload_cadence_study.py
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

CADENCE_FLOOR = 10

db = SessionLocal()
try:
    rows = db.execute(text(QUERY)).fetchall()
finally:
    db.close()

by_channel = defaultdict(list)
skipped_no_published = skipped_no_age = 0

for r in rows:
    if r.published_at is None:
        skipped_no_published += 1
        continue
    days_live = (r.latest_snapshot_date - r.published_at.date()).days
    if days_live < 1:
        skipped_no_age += 1
        continue
    velocity = r.views / days_live
    by_channel[r.channel_id].append({
        "published_at": r.published_at,
        "velocity": velocity,
        "category": r.category or "uncategorized",
    })

print("=" * 74)
print(f"RAW: {sum(len(v) for v in by_channel.values())} videos across {len(by_channel)} channels")
print(f"(skipped no published_at: {skipped_no_published}, skipped same-day-as-snapshot: {skipped_no_age})")
print("=" * 74)

results = []
below_floor = 0

for channel_id, vids in by_channel.items():
    if len(vids) < CADENCE_FLOOR:
        below_floor += 1
        continue
    vids_sorted = sorted(vids, key=lambda v: v["published_at"])
    mid = len(vids_sorted) // 2
    early, late = vids_sorted[:mid], vids_sorted[mid:]
    early_med = statistics.median(v["velocity"] for v in early)
    late_med = statistics.median(v["velocity"] for v in late)
    if early_med <= 0:
        continue
    ratio = late_med / early_med

    span_days = (vids_sorted[-1]["published_at"] - vids_sorted[0]["published_at"]).days
    if span_days < 7:
        continue
    cadence_per_week = len(vids_sorted) / (span_days / 7)

    category = max({v["category"] for v in vids_sorted}, key=lambda c: sum(1 for v in vids_sorted if v["category"] == c))

    results.append({
        "channel_id": channel_id,
        "n_videos": len(vids_sorted),
        "ratio": ratio,
        "cadence_per_week": cadence_per_week,
        "bucket": None,  # assigned below, by tercile across the whole sample
        "category": category,
    })

print(f"\nChannels below {CADENCE_FLOOR}-video floor, excluded: {below_floor}")
print(f"Channels in this study: {len(results)}")

# Tercile bucketing: sort by ratio, bottom third = stalled, top third = growing.
results.sort(key=lambda r: r["ratio"])
n = len(results)
t1, t2 = n // 3, (2 * n) // 3
for i, r in enumerate(results):
    r["bucket"] = "stalled" if i < t1 else ("growing" if i >= t2 else "flat")

print("\n" + "=" * 74)
print("1. CADENCE BY GROWTH BUCKET (pooled, all niches, tercile split)")
print("=" * 74)
by_bucket = defaultdict(list)
for r in results:
    by_bucket[r["bucket"]].append(r["cadence_per_week"])

print(f"{'bucket':<10} {'channels':>9} {'median/wk':>10} {'mean/wk':>9}")
for bucket in ["growing", "flat", "stalled"]:
    chunk = by_bucket.get(bucket, [])
    if not chunk:
        print(f"{bucket:<10}      0        --        --")
        continue
    print(f"{bucket:<10} {len(chunk):>9} {statistics.median(chunk):>10.2f} {statistics.mean(chunk):>9.2f}")

if by_bucket.get("growing") and by_bucket.get("stalled"):
    g = statistics.median(by_bucket["growing"])
    s = statistics.median(by_bucket["stalled"])
    print(f"\nGrowing channels upload {g:.2f}/wk median vs stalled channels {s:.2f}/wk median "
          f"({g / s if s else float('inf'):.2f}x)")

print("\n" + "=" * 74)
print("2. BY CATEGORY (Simpson's-paradox check: does the pattern hold within niche?)")
print("=" * 74)
by_cat = defaultdict(list)
for r in results:
    by_cat[r["category"]].append(r)

for cat, crows in sorted(by_cat.items(), key=lambda kv: -len(kv[1])):
    if len(crows) < 30:
        print(f"{cat}: n={len(crows)}, below 30-channel floor, skipped")
        continue
    cat_growing = [r["cadence_per_week"] for r in crows if r["bucket"] == "growing"]
    cat_stalled = [r["cadence_per_week"] for r in crows if r["bucket"] == "stalled"]
    if len(cat_growing) < 10 or len(cat_stalled) < 10:
        print(f"{cat}: n={len(crows)}, growing={len(cat_growing)}, stalled={len(cat_stalled)}, "
              f"below 10-per-group floor, skipped")
        continue
    g_med = statistics.median(cat_growing)
    s_med = statistics.median(cat_stalled)
    print(f"{cat} (n={len(crows)}): growing {g_med:.2f}/wk (n={len(cat_growing)}) vs "
          f"stalled {s_med:.2f}/wk (n={len(cat_stalled)}), ratio {g_med / s_med if s_med else float('inf'):.2f}x")

print("\n" + "=" * 74)
print("3. DISTRIBUTION CHECK (growth ratio itself, sanity check on the tercile cuts)")
print("=" * 74)
ratios = [r["ratio"] for r in results]
print(f"ratio median: {statistics.median(ratios):.3f}, mean: {statistics.mean(ratios):.3f}")
print(f"stalled cutoff (ratio <= {ratios[t1 - 1]:.3f}): {t1} channels")
print(f"flat band ({ratios[t1]:.3f} to {ratios[t2 - 1]:.3f}): {t2 - t1} channels")
print(f"growing cutoff (ratio >= {ratios[t2]:.3f}): {n - t2} channels")
