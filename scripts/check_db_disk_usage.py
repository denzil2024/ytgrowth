"""One-off, read-only: diagnose what's using Postgres disk space. Railway
reported postgres-volume at 92% capacity. This lists every table by total
size (data + indexes), largest first, and row counts for the snapshot
tables most likely to be the growth driver (one row per video/channel per
weekly collection run, with no retention policy found in app/scheduler.py).

Run on Railway (app service console, has DATABASE_URL):

    python scripts/check_db_disk_usage.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.models import SessionLocal

TABLE_SIZES_QUERY = """
SELECT
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
  pg_size_pretty(pg_relation_size(relid)) AS table_size,
  pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size,
  n_live_tup AS estimated_rows,
  n_dead_tup AS dead_rows
FROM pg_catalog.pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 20
"""

TOTAL_DB_SIZE_QUERY = """
SELECT pg_size_pretty(pg_database_size(current_database())) AS total_db_size
"""

SNAPSHOT_DATE_RANGE_QUERY = """
SELECT
  MIN(snapshot_date) AS earliest,
  MAX(snapshot_date) AS latest,
  COUNT(DISTINCT snapshot_date) AS distinct_dates,
  COUNT(*) AS total_rows
FROM video_metric_snapshots
"""

CHANNEL_SNAPSHOT_DATE_RANGE_QUERY = """
SELECT
  MIN(snapshot_date) AS earliest,
  MAX(snapshot_date) AS latest,
  COUNT(DISTINCT snapshot_date) AS distinct_dates,
  COUNT(*) AS total_rows
FROM channel_metric_snapshots
"""

WAL_AND_REPLICATION_QUERY = """
SELECT
  pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0')) AS wal_generated_total
"""

BLOAT_SUMMARY_QUERY = """
SELECT
  SUM(n_dead_tup) AS total_dead_tuples,
  SUM(n_live_tup) AS total_live_tuples
FROM pg_catalog.pg_stat_user_tables
"""


def main():
    db = SessionLocal()
    try:
        total = db.execute(text(TOTAL_DB_SIZE_QUERY)).fetchone()
        print(f"=== Total database size: {total.total_db_size} ===\n")

        print("=== Largest tables (data + indexes) ===")
        rows = db.execute(text(TABLE_SIZES_QUERY)).fetchall()
        for r in rows:
            print(f"{r.table_name:40s} total={r.total_size:>10s}  table={r.table_size:>10s}  index={r.index_size:>10s}  rows~={r.estimated_rows}")
        print()

        print("=== video_metric_snapshots date range ===")
        vms = db.execute(text(SNAPSHOT_DATE_RANGE_QUERY)).fetchone()
        print(f"earliest: {vms.earliest}  latest: {vms.latest}  distinct dates: {vms.distinct_dates}  total rows: {vms.total_rows}")
        print()

        print("=== channel_metric_snapshots date range ===")
        cms = db.execute(text(CHANNEL_SNAPSHOT_DATE_RANGE_QUERY)).fetchone()
        print(f"earliest: {cms.earliest}  latest: {cms.latest}  distinct dates: {cms.distinct_dates}  total rows: {cms.total_rows}")
        print()

        print("=== Dead tuple bloat summary ===")
        bloat = db.execute(text(BLOAT_SUMMARY_QUERY)).fetchone()
        print(f"total live rows: {bloat.total_live_tuples}  total dead rows: {bloat.total_dead_tuples}")

        print()
        print("=== WAL generated since cluster init ===")
        try:
            wal = db.execute(text(WAL_AND_REPLICATION_QUERY)).fetchone()
            print(f"wal_generated_total: {wal.wal_generated_total}")
        except Exception as e:
            print(f"(could not read WAL stats: {e})")
    finally:
        db.close()


if __name__ == "__main__":
    main()
