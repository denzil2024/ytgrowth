"""One-off, read-only: floor check for data study #14, "how many views
counts as viral, as a multiple of the channel's own median" (feeds
CONTENT-PLAN.md #12, DATA-STUDIES.md #14). Zero fresh API quota:
channel_videos + video_metric_snapshots only, same tables the
best-time-to-post study (scripts/query_best_time_to_post_study.py) used.

Checks the data floor from DATA-STUDIES.md before any study content is
written: 30+ channels, 500+ videos, published_at >= 2025-01-01. Also reports
the per-channel video-count distribution, since a per-channel median needs
several videos per channel to mean anything, and category coverage via
top_channel_cache.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/check_study14_floor.py
"""

import os
import sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.models import SessionLocal

FLOOR_QUERY = """
SELECT
  COUNT(DISTINCT cv.channel_id) AS channels,
  COUNT(DISTINCT cv.video_id)   AS videos
FROM channel_videos cv
JOIN video_metric_snapshots vms ON vms.video_id = cv.video_id
WHERE cv.published_at >= '2025-01-01'
  AND vms.views IS NOT NULL
"""

PER_CHANNEL_QUERY = """
SELECT
  cv.channel_id,
  COUNT(DISTINCT cv.video_id) AS video_count
FROM channel_videos cv
JOIN video_metric_snapshots vms ON vms.video_id = cv.video_id
WHERE cv.published_at >= '2025-01-01'
  AND vms.views IS NOT NULL
GROUP BY cv.channel_id
"""

CATEGORY_QUERY = """
SELECT
  COALESCE(tc.category, 'uncategorized') AS category,
  COUNT(DISTINCT cv.channel_id) AS channels,
  COUNT(DISTINCT cv.video_id)   AS videos
FROM channel_videos cv
JOIN video_metric_snapshots vms ON vms.video_id = cv.video_id
LEFT JOIN (
  SELECT DISTINCT ON (channel_id) channel_id, category
  FROM top_channel_cache
  ORDER BY channel_id, region
) tc ON tc.channel_id = cv.channel_id
WHERE cv.published_at >= '2025-01-01'
  AND vms.views IS NOT NULL
GROUP BY COALESCE(tc.category, 'uncategorized')
ORDER BY videos DESC
"""


def main():
    db = SessionLocal()
    try:
        row = db.execute(text(FLOOR_QUERY)).fetchone()
        channels, videos = row.channels, row.videos
        print("=== Floor check ===")
        print(f"channels: {channels}  (need 30+)")
        print(f"videos:   {videos}  (need 500+)")
        print(f"PASS" if channels >= 30 and videos >= 500 else "FAIL")
        print()

        rows = db.execute(text(PER_CHANNEL_QUERY)).fetchall()
        buckets = defaultdict(int)
        for r in rows:
            n = r.video_count
            if n >= 20:
                buckets["20+"] += 1
            elif n >= 10:
                buckets["10-19"] += 1
            elif n >= 5:
                buckets["5-9"] += 1
            else:
                buckets["<5"] += 1
        print("=== Per-channel video-count distribution ===")
        for key in ["20+", "10-19", "5-9", "<5"]:
            print(f"{key}: {buckets[key]} channels")
        usable = buckets["20+"] + buckets["10-19"] + buckets["5-9"]
        print(f"Channels with 5+ videos (usable for a per-channel median): {usable}")
        print()

        cat_rows = db.execute(text(CATEGORY_QUERY)).fetchall()
        print("=== Category coverage ===")
        for r in cat_rows:
            print(f"{r.category}: {r.channels} channels, {r.videos} videos")
    finally:
        db.close()


if __name__ == "__main__":
    main()
