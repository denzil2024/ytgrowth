"""One-off, read-only: feasibility check for CONTENT-PLAN.md study #13
("Topics small channels still win on"). Before building the full
topic-extraction pipeline, confirm the core premise is real: do some
small-subscriber channels actually get disproportionately high views
for their size, within their own niche, at real scale?

Method: for each tracked channel with a real subscriber count and at
least 10 tracked videos, compute median view-velocity (views/day-live,
same metric as prior studies) and its subscriber count. Within each
niche, rank channels by a "punching above weight" score: view-velocity
relative to the niche's velocity-vs-subscriber trend. Report how many
real small-channel (under 50K subs) outliers exist per niche, so we
know before writing a single line of the article whether this premise
has real channels behind it or is a nice idea with no data.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/check_micro_channel_feasibility.py
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
  cv.channel_id,
  cv.video_id,
  cv.published_at,
  vms.views,
  vms.snapshot_date,
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
"""

SUBS_QUERY = """
SELECT DISTINCT ON (channel_id) channel_id, subscribers
FROM channel_metric_snapshots
ORDER BY channel_id, snapshot_date DESC
"""

db = SessionLocal()
try:
    rows = db.execute(text(QUERY)).fetchall()
    subs_rows = db.execute(text(SUBS_QUERY)).fetchall()
finally:
    db.close()

subs_by_channel = {r.channel_id: r.subscribers for r in subs_rows if r.subscribers}

by_channel = defaultdict(list)
channel_category = {}
for r in rows:
    if r.published_at is None:
        continue
    days_live = (r.snapshot_date - r.published_at.date()).days
    if days_live < 1:
        continue
    velocity = r.views / days_live
    by_channel[r.channel_id].append(velocity)
    channel_category[r.channel_id] = r.category or "uncategorized"

print("=" * 74)
print(f"Channels with tracked videos: {len(by_channel)}")
print(f"Channels with a real subscriber count: {len(subs_by_channel)}")
print("=" * 74)

by_niche = defaultdict(list)
for channel_id, velocities in by_channel.items():
    if len(velocities) < 10:
        continue
    subs = subs_by_channel.get(channel_id)
    if subs is None:
        continue
    med_velocity = statistics.median(velocities)
    cat = channel_category.get(channel_id, "uncategorized")
    by_niche[cat].append((channel_id, subs, med_velocity))

print("\n" + "=" * 74)
print("PER NICHE: median velocity for small (<50K) vs large (>=50K) channels")
print("=" * 74)
print(f"{'niche':<16} {'n_small':>8} {'small_med_vel':>14} {'n_large':>8} {'large_med_vel':>14}")

for cat, channels in sorted(by_niche.items(), key=lambda kv: -len(kv[1])):
    small = [v for _, s, v in channels if s < 50_000]
    large = [v for _, s, v in channels if s >= 50_000]
    if len(small) < 10 or len(large) < 10:
        print(f"{cat:<16} {len(small):>8} {'below floor':>14} {len(large):>8}")
        continue
    small_med = statistics.median(small)
    large_med = statistics.median(large)
    print(f"{cat:<16} {len(small):>8} {small_med:>14.1f} {len(large):>8} {large_med:>14.1f}")

print("\n" + "=" * 74)
print("REAL OUTLIERS: small channels (<50K subs) with median velocity ABOVE")
print("their niche's LARGE-channel median (the actual premise of study #13)")
print("=" * 74)

outlier_count = 0
for cat, channels in by_niche.items():
    large = [v for _, s, v in channels if s >= 50_000]
    if len(large) < 10:
        continue
    large_med = statistics.median(large)
    small_outliers = [(cid, s, v) for cid, s, v in channels if s < 50_000 and v > large_med]
    if small_outliers:
        outlier_count += len(small_outliers)
        print(f"{cat}: {len(small_outliers)} small channels beat the large-channel median ({large_med:.1f})")

print(f"\nTotal real small-channel outliers found: {outlier_count}")
