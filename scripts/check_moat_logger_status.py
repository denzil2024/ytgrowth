"""One-off, read-only: re-check whether the M1-M3 moat studies (DATA-STUDIES.md
"Studies that need the moat running first") have enough runway now. Last
checked 2026-08-13, a month after the loggers went live 2026-07-17. It's now
2026-08-22, over five weeks in, and nobody rechecked since. This just prints
current row counts and date spans so that decision can be made on real numbers
instead of assumption.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/check_moat_logger_status.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.models import SessionLocal

TABLES = [
    ("cache_hit_snapshots", "snapshot_date", "powers M1 (fastest-rising topics) and M3 (seasonality, needs 6+ months)"),
    ("channel_metric_snapshots", "snapshot_date", "powers M2 (channel growth rate by niche/tier)"),
    ("channel_videos", "discovered_at", "powers studies #3/#4/#6/#7 (already unblocked, zero quota)"),
    ("video_metric_snapshots", "snapshot_date", "powers studies #6/#7/#8 (video growth curves, engagement rate)"),
]

db = SessionLocal()
try:
    for table, date_col, note in TABLES:
        row = db.execute(text(
            f"SELECT COUNT(*), MIN({date_col})::date, MAX({date_col})::date, "
            f"COUNT(DISTINCT {date_col}::date) FROM {table}"
        )).fetchone()
        count, first, last, distinct_dates = row
        span_days = (last - first).days if first and last else 0
        print(f"{table}: {count:,} rows | {first} to {last} | "
              f"{span_days} days span | {distinct_dates} distinct snapshot dates")
        print(f"  -> {note}")

    print()
    print("video_metric_snapshots.likes coverage check (for study #8):")
    row = db.execute(text(
        "SELECT COUNT(*), COUNT(likes) FROM video_metric_snapshots "
        "WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM video_metric_snapshots)"
    )).fetchone()
    total, with_likes = row
    pct = (with_likes / total * 100) if total else 0
    print(f"  latest snapshot date: {with_likes:,} of {total:,} rows have a non-null "
          f"likes value ({pct:.1f}%)")
finally:
    db.close()
