"""One-off, read-only: find the ACTUAL reason WAL is being retained instead
of recycled, rather than guessing. Checks replication slots (a slot with no
active consumer blocks WAL cleanup indefinitely) and current WAL settings
directly, both are the only two mechanisms that can hold WAL past normal
recycling. No inference, just what Postgres itself reports.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/check_wal_retention_cause.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.models import SessionLocal

REPLICATION_SLOTS_QUERY = """
SELECT
  slot_name,
  slot_type,
  active,
  pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS retained_wal
FROM pg_replication_slots
"""

WAL_SETTINGS_QUERY = """
SELECT name, setting, unit
FROM pg_settings
WHERE name IN ('wal_keep_size', 'max_wal_size', 'min_wal_size', 'archive_mode', 'archive_command')
"""

CHECKPOINT_QUERY = """
SELECT
  pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), checkpoint_lsn)) AS wal_since_last_checkpoint
FROM pg_control_checkpoint()
"""


def main():
    db = SessionLocal()
    try:
        print("=== Replication slots (a slot with active=false blocks WAL cleanup) ===")
        slots = db.execute(text(REPLICATION_SLOTS_QUERY)).fetchall()
        if not slots:
            print("No replication slots found.")
        for s in slots:
            print(f"name={s.slot_name}  type={s.slot_type}  active={s.active}  retained_wal={s.retained_wal}")
        print()

        print("=== WAL retention settings ===")
        settings = db.execute(text(WAL_SETTINGS_QUERY)).fetchall()
        for s in settings:
            print(f"{s.name} = {s.setting} {s.unit or ''}")
        print()

        print("=== WAL since last checkpoint ===")
        try:
            cp = db.execute(text(CHECKPOINT_QUERY)).fetchone()
            print(f"wal_since_last_checkpoint: {cp.wal_since_last_checkpoint}")
        except Exception as e:
            print(f"(could not read checkpoint info: {e})")
    finally:
        db.close()


if __name__ == "__main__":
    main()
