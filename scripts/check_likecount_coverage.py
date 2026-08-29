"""One-off, read-only: checks whether likeCount data is populated enough
to trust for the "Engagement rate by niche" study (CONTENT-PLAN.md #7).
Some creators hide their public like count, so this checks real coverage
before we build an article on it.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/check_likecount_coverage.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.models import SessionLocal

db = SessionLocal()
try:
    row = db.execute(text("""
        SELECT
            COUNT(*) AS total_rows,
            COUNT(*) FILTER (WHERE likes IS NOT NULL) AS has_likes,
            COUNT(*) FILTER (WHERE comments IS NOT NULL) AS has_comments,
            COUNT(DISTINCT video_id) AS distinct_videos
        FROM video_metric_snapshots
    """)).fetchone()

    total, has_likes, has_comments, distinct_videos = row
    like_pct = 100 * has_likes / total if total else 0
    comment_pct = 100 * has_comments / total if total else 0

    print(f"Total snapshot rows: {total:,}")
    print(f"Distinct videos: {distinct_videos:,}")
    print(f"Rows with a like count: {has_likes:,} ({like_pct:.1f}%)")
    print(f"Rows with a comment count: {has_comments:,} ({comment_pct:.1f}%)")

    cat_row = db.execute(text("""
        SELECT tc.category, COUNT(*) AS total, COUNT(*) FILTER (WHERE vms.likes IS NOT NULL) AS has_likes
        FROM video_metric_snapshots vms
        JOIN channel_videos cv ON cv.video_id = vms.video_id
        LEFT JOIN (
            SELECT DISTINCT ON (channel_id) channel_id, category
            FROM top_channel_cache
            ORDER BY channel_id, region
        ) tc ON tc.channel_id = cv.channel_id
        GROUP BY tc.category
        ORDER BY total DESC
    """)).fetchall()

    print("\nBy category:")
    for cat, total, has_likes in cat_row:
        pct = 100 * has_likes / total if total else 0
        print(f"  {cat or 'uncategorized'}: {has_likes:,}/{total:,} ({pct:.1f}%)")

finally:
    db.close()
