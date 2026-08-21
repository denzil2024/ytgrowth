"""One-off, read-only: pull comedy's current upload-data figures after the
2026-08-20 expanded-discovery run, plus every other tracked category, so the
comedy-video-ideas article's stale data section (699 videos / 17 channels,
the original thin pull) can be rewritten against real numbers and comedy's
rank among all 14 niches can be stated correctly. See CONTENT-PLAN.md Part 5
("Found in passing, not fixed") for the flag this closes.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/query_comedy_refresh.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.models import SessionLocal

QUERY = """
SELECT
  tc.category,
  COUNT(DISTINCT cv.channel_id) AS channels,
  COUNT(*) AS videos,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cv.duration_seconds) / 60.0 AS median_min,
  AVG(cv.duration_seconds) / 60.0 AS mean_min,
  AVG(CASE WHEN cv.duration_seconds <= 60 THEN 1.0 ELSE 0.0 END) AS shorts_share
FROM channel_videos cv
JOIN top_channel_cache tc ON tc.channel_id = cv.channel_id
WHERE cv.published_at >= '2025-01-01' AND cv.duration_seconds IS NOT NULL
GROUP BY tc.category
ORDER BY median_min ASC
"""

db = SessionLocal()
try:
    rows = db.execute(text(QUERY)).fetchall()
    print(f"{'category':<15} {'channels':>8} {'videos':>8} {'median_min':>11} {'mean_min':>9} {'shorts_share':>13}")
    for r in rows:
        print(f"{r.category:<15} {r.channels:>8} {r.videos:>8} {r.median_min:>11.2f} {r.mean_min:>9.2f} {r.shorts_share*100:>12.1f}%")
finally:
    db.close()
