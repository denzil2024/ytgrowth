"""One-off, read-only: floor check for data study #15, "average views per
video by subscriber count" (feeds CONTENT-PLAN.md #19, DATA-STUDIES.md #15).
Zero fresh API quota: channel_metric_snapshots + channel_videos +
video_metric_snapshots only, same tables study #14's floor check used.

Checks the data floor from DATA-STUDIES.md before any study content is
written: 30+ channels, 500+ videos, published_at >= 2025-01-01, split by
subscriber tier (1K/10K/100K/1M) since the study's claim is per-tier, not
channel-wide. A tier with too few channels/videos gets dropped from the
study rather than reported thin.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/check_study15_floor.py
"""

import os
import sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.models import SessionLocal

# Latest subscriber count per channel, from the most recent snapshot date
# each channel has. Tiers follow the plan entry: 1K, 10K, 100K, 1M.
TIER_QUERY = """
WITH latest_snapshot AS (
  SELECT DISTINCT ON (channel_id)
    channel_id, subscribers, category
  FROM channel_metric_snapshots
  WHERE subscribers IS NOT NULL
  ORDER BY channel_id, snapshot_date DESC
),
tiered AS (
  SELECT
    channel_id,
    category,
    CASE
      WHEN subscribers >= 500000 THEN '1M'
      WHEN subscribers >= 50000  THEN '100K'
      WHEN subscribers >= 5000   THEN '10K'
      WHEN subscribers >= 500    THEN '1K'
      ELSE 'below_1K'
    END AS tier
  FROM latest_snapshot
)
SELECT
  t.tier,
  COUNT(DISTINCT t.channel_id) AS channels,
  COUNT(DISTINCT cv.video_id)  AS videos
FROM tiered t
JOIN channel_videos cv ON cv.channel_id = t.channel_id
JOIN video_metric_snapshots vms ON vms.video_id = cv.video_id
WHERE cv.published_at >= '2025-01-01'
  AND vms.views IS NOT NULL
GROUP BY t.tier
ORDER BY
  CASE t.tier
    WHEN '1M' THEN 1 WHEN '100K' THEN 2 WHEN '10K' THEN 3
    WHEN '1K' THEN 4 ELSE 5
  END
"""

OVERALL_QUERY = """
SELECT
  COUNT(DISTINCT cv.channel_id) AS channels,
  COUNT(DISTINCT cv.video_id)   AS videos
FROM channel_videos cv
JOIN video_metric_snapshots vms ON vms.video_id = cv.video_id
WHERE cv.published_at >= '2025-01-01'
  AND vms.views IS NOT NULL
"""

CATEGORY_BY_TIER_QUERY = """
WITH latest_snapshot AS (
  SELECT DISTINCT ON (channel_id)
    channel_id, subscribers, category
  FROM channel_metric_snapshots
  WHERE subscribers IS NOT NULL
  ORDER BY channel_id, snapshot_date DESC
),
tiered AS (
  SELECT
    channel_id,
    COALESCE(category, 'uncategorized') AS category,
    CASE
      WHEN subscribers >= 500000 THEN '1M'
      WHEN subscribers >= 50000  THEN '100K'
      WHEN subscribers >= 5000   THEN '10K'
      WHEN subscribers >= 500    THEN '1K'
      ELSE 'below_1K'
    END AS tier
  FROM latest_snapshot
)
SELECT
  t.tier,
  t.category,
  COUNT(DISTINCT t.channel_id) AS channels,
  COUNT(DISTINCT cv.video_id)  AS videos
FROM tiered t
JOIN channel_videos cv ON cv.channel_id = t.channel_id
JOIN video_metric_snapshots vms ON vms.video_id = cv.video_id
WHERE cv.published_at >= '2025-01-01'
  AND vms.views IS NOT NULL
GROUP BY t.tier, t.category
ORDER BY t.tier, videos DESC
"""


def main():
    db = SessionLocal()
    try:
        row = db.execute(text(OVERALL_QUERY)).fetchone()
        print("=== Overall floor check (all tiers combined) ===")
        print(f"channels: {row.channels}  (need 30+)")
        print(f"videos:   {row.videos}  (need 500+)")
        print("PASS" if row.channels >= 30 and row.videos >= 500 else "FAIL")
        print()

        print("=== Per-tier floor check (study's actual claim granularity) ===")
        tier_rows = db.execute(text(TIER_QUERY)).fetchall()
        tier_results = {}
        for r in tier_rows:
            passed = r.channels >= 30 and r.videos >= 500
            tier_results[r.tier] = passed
            print(f"{r.tier:>10}: {r.channels:>4} channels, {r.videos:>6} videos  "
                  f"{'PASS' if passed else 'FAIL'}")
        print()

        print("=== Category coverage within each tier ===")
        cat_rows = db.execute(text(CATEGORY_BY_TIER_QUERY)).fetchall()
        by_tier = defaultdict(list)
        for r in cat_rows:
            by_tier[r.tier].append(r)
        for tier in ['1M', '100K', '10K', '1K', 'below_1K']:
            if tier not in by_tier:
                continue
            print(f"\n--- {tier} ---")
            for r in by_tier[tier]:
                print(f"  {r.category}: {r.channels} channels, {r.videos} videos")

        print()
        print("=== Summary: which tiers clear the floor ===")
        for tier in ['1K', '10K', '100K', '1M']:
            status = tier_results.get(tier, False)
            print(f"{tier}: {'usable' if status else 'DROP from study'}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
