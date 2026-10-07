"""One-off, read-only: measure what's actually on disk right now, not an
inferred or lifetime-cumulative metric. The previous WAL check used
pg_wal_lsn_diff against '0/0', which is WAL position since server start
(a lifetime counter), not current WAL file size on disk. That was wrong.
This uses pg_ls_waldir() to list the actual WAL files present right now,
plus pg_database_size for every database on the instance (not just this
app's database, Railway's Postgres may host more than one).

Run on Railway (app service console, has DATABASE_URL):

    python scripts/check_actual_disk_files.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.models import SessionLocal

WAL_FILES_QUERY = """
SELECT
  COUNT(*) AS wal_file_count,
  pg_size_pretty(SUM(size)) AS wal_total_size
FROM pg_ls_waldir()
"""

ALL_DATABASES_QUERY = """
SELECT
  datname,
  pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datistemplate = false
ORDER BY pg_database_size(datname) DESC
"""

TEMP_FILES_QUERY = """
SELECT
  temp_files,
  pg_size_pretty(temp_bytes) AS temp_bytes_pretty
FROM pg_stat_database
WHERE datname = current_database()
"""


def main():
    db = SessionLocal()
    try:
        print("=== WAL files actually on disk right now ===")
        try:
            wal = db.execute(text(WAL_FILES_QUERY)).fetchone()
            print(f"wal_file_count: {wal.wal_file_count}  wal_total_size: {wal.wal_total_size}")
        except Exception as e:
            print(f"(could not list WAL dir, likely insufficient privilege: {e})")
        print()

        print("=== Every database on this Postgres instance ===")
        dbs = db.execute(text(ALL_DATABASES_QUERY)).fetchall()
        for d in dbs:
            print(f"{d.datname}: {d.size}")
        print()

        print("=== Cumulative temp file usage (this database, since stats reset) ===")
        temp = db.execute(text(TEMP_FILES_QUERY)).fetchone()
        print(f"temp_files: {temp.temp_files}  temp_bytes: {temp.temp_bytes_pretty}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
