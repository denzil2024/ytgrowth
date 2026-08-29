"""One-off, read-only: full data pull for "Shorts share over time, by niche"
(CONTENT-PLAN.md data study #8, upgrades /blog/shorts-vs-long-form's "The
Right Mix and Cadence" section). Zero fresh API quota: channel_videos only,
already discovered at ingest time.

For each niche, for each calendar month since Jan 2025, compute the share
of that month's tracked uploads that are Shorts (duration <= 62s per the
is_short column). Reports the month-by-month series so the SHAPE is visible
(still rising / plateaued / ever declined), not just a start-vs-end
comparison, plus a simple trend read: most recent 3-month average share vs.
the first 3 months of real coverage.

Floor: a niche needs >= 30 videos in a given month to get a data point for
that month. Months below the floor are skipped, not interpolated.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/query_shorts_share_over_time_study.py
"""

import os
import statistics
import sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.models import SessionLocal

QUERY = """
SELECT
  cv.video_id,
  cv.channel_id,
  cv.published_at AS published_at,
  cv.is_short AS is_short,
  tc.category AS category
FROM channel_videos cv
LEFT JOIN (
  SELECT DISTINCT ON (channel_id) channel_id, category
  FROM top_channel_cache
  ORDER BY channel_id, region
) tc ON tc.channel_id = cv.channel_id
WHERE cv.published_at >= '2025-01-01'
  AND cv.is_short IS NOT NULL
"""

MONTH_FLOOR = 30

db = SessionLocal()
try:
    rows = db.execute(text(QUERY)).fetchall()
finally:
    db.close()

by_cat_month = defaultdict(lambda: defaultdict(lambda: [0, 0]))  # [shorts, total]
skipped_no_published = 0

for r in rows:
    if r.published_at is None:
        skipped_no_published += 1
        continue
    cat = r.category or "uncategorized"
    month_key = r.published_at.strftime("%Y-%m")
    by_cat_month[cat][month_key][1] += 1
    if r.is_short:
        by_cat_month[cat][month_key][0] += 1

print("=" * 74)
print(f"RAW: {len(rows)} videos, skipped no published_at: {skipped_no_published}")
print(f"Categories represented: {len(by_cat_month)}")
print("=" * 74)

all_months = sorted({m for months in by_cat_month.values() for m in months})
print(f"\nMonths with any data: {all_months[0]} to {all_months[-1]} ({len(all_months)} months)")

print("\n" + "=" * 74)
print("1. MONTH-BY-MONTH SHORTS SHARE, BY NICHE (blank = below 30-video floor)")
print("=" * 74)

for cat, months in sorted(by_cat_month.items(), key=lambda kv: -sum(v[1] for v in kv[1].values())):
    total_videos = sum(v[1] for v in months.values())
    if total_videos < 500:
        print(f"\n{cat}: n={total_videos}, below 500-video floor for the whole niche, skipped")
        continue
    print(f"\n{cat} (n={total_videos} total):")
    row_out = []
    for m in all_months:
        shorts, total = months.get(m, [0, 0])
        if total < MONTH_FLOOR:
            row_out.append(f"{m}:  --")
        else:
            share = 100 * shorts / total
            row_out.append(f"{m}:{share:5.1f}%")
    print("  " + "  ".join(row_out))

print("\n" + "=" * 74)
print("2. TREND: LAST 3 MONTHS OF REAL COVERAGE vs FIRST 3 MONTHS, BY NICHE")
print("=" * 74)

for cat, months in sorted(by_cat_month.items(), key=lambda kv: -sum(v[1] for v in kv[1].values())):
    total_videos = sum(v[1] for v in months.values())
    if total_videos < 500:
        continue
    valid_months = [m for m in all_months if months.get(m, [0, 0])[1] >= MONTH_FLOOR]
    if len(valid_months) < 6:
        print(f"{cat}: only {len(valid_months)} months clear the floor, too few for a trend read, skipped")
        continue
    first3 = valid_months[:3]
    last3 = valid_months[-3:]
    first_share = statistics.mean(100 * months[m][0] / months[m][1] for m in first3)
    last_share = statistics.mean(100 * months[m][0] / months[m][1] for m in last3)
    direction = "RISING" if last_share > first_share + 3 else ("DECLINING" if last_share < first_share - 3 else "FLAT")
    print(f"{cat}: first 3 months ({first3[0]}-{first3[-1]}) avg {first_share:.1f}% -> "
          f"last 3 months ({last3[0]}-{last3[-1]}) avg {last_share:.1f}%  [{direction}]")
