"""One-off, read-only: full data pull for "Fastest-rising YouTube topics"
(CONTENT-PLAN.md moat study M1, new standalone article, no patching).
Zero fresh API quota: cache_hit_snapshots only, already collected nightly
since 2026-07-17.

hit_count on a cache row is a running, never-reset counter incremented
every time that exact search gets reused from cache. The nightly snapshot
copies that counter's current value, so comparing a cache_key's hit_count
in an early snapshot vs a late snapshot gives a real measure of how many
additional times that exact query got used in between, real usage, not
a modeled trend.

For each (source, cache_key) present in both the first week and the last
week of the tracked window, compute the raw increase in hit_count.
Ranked by raw increase (not ratio), so a query that went from 1 to 2 hits
does not outrank one that went from 50 to 90. Real query text comes from
`label`, not the hashed cache_key.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/query_fastest_rising_topics.py
"""

import os
import sys
from collections import defaultdict
from datetime import timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.models import SessionLocal

QUERY = """
SELECT snapshot_date, source, cache_key, label, hit_count
FROM cache_hit_snapshots
ORDER BY snapshot_date
"""

db = SessionLocal()
try:
    rows = db.execute(text(QUERY)).fetchall()
finally:
    db.close()

if not rows:
    print("No rows found.")
    sys.exit(0)

dates = sorted({r.snapshot_date for r in rows})
window_start, window_end = dates[0], dates[-1]
first_week_end = window_start + timedelta(days=6)
last_week_start = window_end - timedelta(days=6)

print("=" * 74)
print(f"RAW: {len(rows)} snapshot rows across {len(dates)} dates")
print(f"Window: {window_start} to {window_end}")
print(f"First week: {window_start} to {first_week_end}")
print(f"Last week: {last_week_start} to {window_end}")
print("=" * 74)

# For each (source, cache_key): earliest hit_count in first week, latest in last week.
early = {}
late = {}
labels = {}

for r in rows:
    key = (r.source, r.cache_key)
    labels[key] = r.label
    if r.snapshot_date <= first_week_end and key not in early:
        early[key] = r.hit_count
    if r.snapshot_date >= last_week_start:
        late[key] = r.hit_count  # keeps overwriting, ends on latest

results = []
for key in early:
    if key not in late:
        continue
    increase = late[key] - early[key]
    if increase <= 0:
        continue
    results.append((key[0], labels[key] or key[1], early[key], late[key], increase))

results.sort(key=lambda r: -r[4])

print(f"\nQueries present in both first and last week: {len(results)}")
print(f"{'source':<8} {'label':<50} {'early':>7} {'late':>7} {'increase':>9}")
for source, label, e, l, inc in results[:40]:
    label_show = (label[:47] + "...") if len(label) > 50 else label
    print(f"{source:<8} {label_show:<50} {e:>7} {l:>7} {inc:>9}")

print("\n" + "=" * 74)
print("BY SOURCE")
print("=" * 74)
by_source = defaultdict(list)
for r in results:
    by_source[r[0]].append(r)
for source, items in by_source.items():
    print(f"{source}: {len(items)} rising queries, top increase {items[0][4] if items else 0}")
