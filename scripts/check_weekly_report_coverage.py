"""One-off, read-only: check whether WeeklyReport.report_data has enough real
CTR/retention volume to power a study. Found 2026-08-22 that _assemble_report
in app/weekly_report.py persists avgCtr and avgRetention (real YouTube
Analytics data, pulled via each connected user's own OAuth grant) into this
table every week, a data source no prior study used. Before queuing a study
on it, confirm real scale: how many distinct channels, how many weeks, and
whether ctr/retention are actually populated (not null) at meaningful rates.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/check_weekly_report_coverage.py
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.models import SessionLocal

db = SessionLocal()
try:
    row = db.execute(text(
        "SELECT COUNT(*), COUNT(DISTINCT channel_id), MIN(week_start), MAX(week_start) "
        "FROM weekly_reports"
    )).fetchone()
    total, channels, first, last = row
    print(f"weekly_reports: {total:,} rows | {channels:,} distinct channels | "
          f"{first} to {last}")

    # report_data is a JSON blob; walk a sample to see real ctr/retention fill rate.
    sample = db.execute(text(
        "SELECT report_data FROM weekly_reports ORDER BY week_start DESC LIMIT 500"
    )).fetchall()

    ctr_vals, retention_vals = [], []
    for (raw,) in sample:
        try:
            data = json.loads(raw)
            ctr = data.get("metrics", {}).get("avgCtr", {}).get("value")
            ret = data.get("metrics", {}).get("avgRetention", {}).get("value")
            if ctr is not None:
                ctr_vals.append(ctr)
            if ret is not None:
                retention_vals.append(ret)
        except Exception:
            pass

    n = len(sample)
    print(f"\nSample of {n} most recent rows:")
    print(f"  avgCtr populated:       {len(ctr_vals)}/{n} "
          f"({len(ctr_vals)/n*100:.1f}%)" if n else "  no rows")
    print(f"  avgRetention populated: {len(retention_vals)}/{n} "
          f"({len(retention_vals)/n*100:.1f}%)" if n else "")
    if ctr_vals:
        print(f"  avgCtr range: {min(ctr_vals):.2f} to {max(ctr_vals):.2f}")
    if retention_vals:
        print(f"  avgRetention range: {min(retention_vals):.2f} to {max(retention_vals):.2f}")
finally:
    db.close()
