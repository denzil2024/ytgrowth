"""One-off, read-only: check whether WeeklyReport.report_data has enough real
CTR/retention volume to power a study. Found 2026-08-22 that _assemble_report
in app/weekly_report.py persists avgCtr and avgRetention (real YouTube
Analytics data, pulled via each connected user's own OAuth grant) into this
table every week, a data source no prior study used. Before queuing a study
on it, confirm real scale: how many distinct channels, how many weeks, and
whether ctr/retention are actually populated (not null) at meaningful rates.

Also checks category-join coverage: the CTR study's agreed goal (2026-08-22)
is a benchmark broken down BY NICHE, not one overall number. That needs each
connected channel's channel_id to match a category in channel_metric_snapshots
(populated from TopChannelCache curation, which mostly covers large public
leaderboard channels, not typical small connected creator channels, so this
join rate could be low). If it's too low, the study becomes overall-only, not
per-niche, and the agreed title/goal need revisiting before writing anything.

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

    # Category-join coverage: can connected channels be broken down by niche?
    join_row = db.execute(text(
        "SELECT COUNT(DISTINCT wr.channel_id) AS total_channels, "
        "       COUNT(DISTINCT CASE WHEN cms.category IS NOT NULL THEN wr.channel_id END) AS with_category "
        "FROM weekly_reports wr "
        "LEFT JOIN LATERAL ("
        "  SELECT category FROM channel_metric_snapshots "
        "  WHERE channel_id = wr.channel_id AND category IS NOT NULL "
        "  ORDER BY snapshot_date DESC LIMIT 1"
        ") cms ON true"
    )).fetchone()
    total_channels, with_category = join_row
    pct = (with_category / total_channels * 100) if total_channels else 0
    print(f"\nCategory-join coverage (for the by-niche CTR/retention goal):")
    print(f"  {with_category:,} of {total_channels:,} connected channels "
          f"({pct:.1f}%) have a known category via channel_metric_snapshots")
    if total_channels and pct < 50:
        print("  LOW COVERAGE: per-niche breakdown likely not viable at this "
              "join rate. Revisit the CTR/retention study goal (overall "
              "benchmark instead of by-niche) before writing anything.")
finally:
    db.close()
