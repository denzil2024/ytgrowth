#!/bin/bash
# EMERGENCY — run on the POSTGRES service shell while it is crash-looping.
# Goal: free ANY space so recovery can write one WAL segment and finish.
# Does NOT touch pg_wal/ or base/ — those are live data and recovery input.
PGDATA=/var/lib/postgresql/data/pgdata

echo "=== BEFORE ==="
df -h "$PGDATA" 2>/dev/null || df -h /var/lib/postgresql/data

echo ""
echo "=== Top consumers ==="
du -sh "$PGDATA"/* 2>/dev/null | sort -rh | head -12

echo ""
echo "=== Freeing: server logs (pure history, Postgres recreates) ==="
for d in "$PGDATA/log" "$PGDATA/pg_log" /var/log/postgresql; do
  if [ -d "$d" ]; then
    echo "clearing $d ($(du -sh "$d" 2>/dev/null | cut -f1))"
    find "$d" -type f -delete 2>/dev/null
  fi
done

echo ""
echo "=== Freeing: scratch/temp dirs (safe, rebuilt on start) ==="
for d in "$PGDATA/base/pgsql_tmp" "$PGDATA/pg_stat_tmp" "$PGDATA"/base/*/pgsql_tmp; do
  if [ -d "$d" ]; then
    echo "clearing $d ($(du -sh "$d" 2>/dev/null | cut -f1))"
    find "$d" -type f -delete 2>/dev/null
  fi
done

echo ""
echo "=== Freeing: pgbackrest spool/tmp if present (not the backups) ==="
for d in /var/lib/pgbackrest/spool /tmp/pgbackrest; do
  [ -d "$d" ] && echo "clearing $d ($(du -sh "$d" 2>/dev/null | cut -f1))" && find "$d" -type f -delete 2>/dev/null
done

echo ""
echo "=== AFTER ==="
df -h "$PGDATA" 2>/dev/null || df -h /var/lib/postgresql/data
echo ""
echo "pg_wal (untouched, for reference): $(du -sh "$PGDATA/pg_wal" 2>/dev/null | cut -f1)"
