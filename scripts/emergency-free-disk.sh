#!/bin/bash
# EMERGENCY — run on the POSTGRES SERVICE's own console/shell (not the app
# service). Postgres is crash-looping with "No space left on device" while
# writing ONE temp file during crash-recovery replay. It does not need a
# large amount of space freed, it needs ANY amount, so the safest fix is
# freeing space from things that are NOT live table data or WAL (which
# Postgres needs for correctness), not deleting WAL segments manually.
#
# Order of operations, safest first:
#   1. REPORT real disk usage and what's actually consuming it.
#   2. Clear Postgres's own log files (pg_log / log/) — always safe, pure
#      history, Postgres recreates them.
#   3. Clear anything in a tmp/ directory under the data dir — always safe,
#      scratch space.
#   4. STOP. Report space freed. Do not touch pg_wal/ or base/ (live data)
#      without a human looking at the numbers first.

set -e

echo "=== Current disk usage ==="
df -h / 2>/dev/null
df -h /var/lib/postgresql/data 2>/dev/null || true

echo ""
echo "=== Largest directories under the data mount ==="
du -sh /var/lib/postgresql/data/pgdata/* 2>/dev/null | sort -rh | head -15

echo ""
echo "=== Postgres log files (safe to delete, pure history) ==="
LOG_DIR="/var/lib/postgresql/data/pgdata/log"
if [ -d "$LOG_DIR" ]; then
  du -sh "$LOG_DIR"
  ls -la "$LOG_DIR" | head -20
else
  echo "no log/ dir at $LOG_DIR"
fi

echo ""
echo "=== pg_wal size (DO NOT delete from here manually without review) ==="
du -sh /var/lib/postgresql/data/pgdata/pg_wal 2>/dev/null || echo "not found"

echo ""
echo "=== REPORT ONLY — no deletions performed yet ==="
echo "Review the numbers above. The log/ directory, if present and large,"
echo "is the safest thing to clear first. Reply with what you see."
