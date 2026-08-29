"""One-off, read-only: full data pull for "Engagement rate by niche"
(CONTENT-PLAN.md data study #7, new standalone article, no patching into
an existing post). Zero fresh API quota: video_metric_snapshots +
channel_videos + top_channel_cache.category, all already collected.

For each video, use its latest snapshot with a non-null like count.
Engagement rate = (likes + comments) / views. Report median per niche
(not mean, a handful of viral outliers would otherwise dominate), plus
N videos and N channels per niche.

Floor: 500 videos AND 30 channels per niche, matching the site's standard
data floor.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/query_engagement_rate_study.py
"""

import os
import statistics
import sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.models import SessionLocal

QUERY = """
SELECT DISTINCT ON (vms.video_id)
  vms.video_id,
  cv.channel_id,
  vms.views,
  vms.likes,
  vms.comments,
  tc.category AS category
FROM video_metric_snapshots vms
JOIN channel_videos cv ON cv.video_id = vms.video_id
LEFT JOIN (
  SELECT DISTINCT ON (channel_id) channel_id, category
  FROM top_channel_cache
  ORDER BY channel_id, region
) tc ON tc.channel_id = cv.channel_id
WHERE vms.likes IS NOT NULL
  AND vms.views IS NOT NULL
  AND vms.views > 0
ORDER BY vms.video_id, vms.snapshot_date DESC
"""

VIDEO_FLOOR = 500
CHANNEL_FLOOR = 30

db = SessionLocal()
try:
    rows = db.execute(text(QUERY)).fetchall()
finally:
    db.close()

by_cat = defaultdict(list)
by_cat_channels = defaultdict(set)

for r in rows:
    cat = r.category or "uncategorized"
    likes = r.likes or 0
    comments = r.comments or 0
    er = (likes + comments) / r.views
    by_cat[cat].append(er)
    by_cat_channels[cat].add(r.channel_id)

print("=" * 74)
print(f"RAW: {len(rows)} videos with a real like count")
print(f"Categories represented: {len(by_cat)}")
print("=" * 74)

print("\n" + "=" * 74)
print("ENGAGEMENT RATE BY NICHE ((likes + comments) / views, median)")
print("=" * 74)
print(f"{'niche':<16} {'videos':>8} {'channels':>9} {'median %':>10} {'mean %':>9}")

results = []
for cat, ers in sorted(by_cat.items(), key=lambda kv: -len(kv[1])):
    n_videos = len(ers)
    n_channels = len(by_cat_channels[cat])
    if n_videos < VIDEO_FLOOR or n_channels < CHANNEL_FLOOR:
        print(f"{cat:<16} {n_videos:>8} {n_channels:>9}   below floor ({VIDEO_FLOOR} videos / {CHANNEL_FLOOR} channels), skipped")
        continue
    med = statistics.median(ers) * 100
    mean = statistics.mean(ers) * 100
    results.append((cat, n_videos, n_channels, med, mean))
    print(f"{cat:<16} {n_videos:>8} {n_channels:>9} {med:>9.3f}% {mean:>8.3f}%")

if results:
    best = max(results, key=lambda r: r[3])
    worst = min(results, key=lambda r: r[3])
    print(f"\nHighest median: {best[0]} ({best[3]:.3f}%). Lowest median: {worst[0]} ({worst[3]:.3f}%).")
    print(f"Spread: {best[3] - worst[3]:.3f} percentage points, {best[3] / worst[3] if worst[3] else float('inf'):.2f}x")
