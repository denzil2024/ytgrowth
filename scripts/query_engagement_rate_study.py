"""One-off, read-only: full data pull for "Engagement rate by niche"
(CONTENT-PLAN.md data study #7, new standalone article, no patching into
an existing post). Zero fresh API quota: video_metric_snapshots +
channel_videos + top_channel_cache.category + channel_metric_snapshots,
all already collected.

REVISED 2026-08-29 after real competitor research flagged a real
methodology gap in the first pass: it pooled Shorts and long-form
together. Since March 31, 2025, YouTube counts a Shorts view the moment
playback starts, no watch-time floor, so a Shorts video's view
denominator is not equivalent to a long-form video's. This version
splits by format and reports both, plus a subscriber-tier cut (every
competitor benchmark found in research gives one, we did not).

For each video, use its latest snapshot with a non-null like count.
Engagement rate = (likes + comments) / views. Report median per niche
per format, plus a separate subscriber-tier cut (long-form only, to
avoid mixing the two counting methods in the size comparison).

Floor: 500 videos AND 30 channels per niche/format cell, matching the
site's standard.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/query_engagement_rate_study.py
"""

import os
import statistics
import sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.models import SessionLocal

QUERY = """
SELECT DISTINCT ON (vms.video_id)
  vms.video_id,
  cv.channel_id,
  cv.is_short,
  vms.views,
  vms.likes,
  vms.comments,
  tc.category AS category
FROM video_metric_snapshots vms
JOIN channel_videos cv ON cv.video_id = vms.video_id
LEFT JOIN (
  SELECT DISTINCT ON (channel_id) channel_id, category
  FROM top_channel_cache
  ORDER BY channel_id, region
) tc ON tc.channel_id = cv.channel_id
WHERE vms.likes IS NOT NULL
  AND vms.views IS NOT NULL
  AND vms.views > 0
  AND cv.is_short IS NOT NULL
ORDER BY vms.video_id, vms.snapshot_date DESC
"""

SUBS_QUERY = """
SELECT DISTINCT ON (cms.channel_id)
  cms.channel_id, cms.subscribers
FROM channel_metric_snapshots cms
ORDER BY cms.channel_id, cms.snapshot_date DESC
"""

VIDEO_FLOOR = 500
CHANNEL_FLOOR = 30

db = SessionLocal()
try:
    rows = db.execute(text(QUERY)).fetchall()
    subs_rows = db.execute(text(SUBS_QUERY)).fetchall()
finally:
    db.close()

subs_by_channel = {r.channel_id: r.subscribers for r in subs_rows if r.subscribers}

by_cat_format = defaultdict(lambda: defaultdict(list))  # [category][is_short] -> [er,...]
by_cat_format_channels = defaultdict(lambda: defaultdict(set))

for r in rows:
    cat = r.category or "uncategorized"
    likes = r.likes or 0
    comments = r.comments or 0
    er = (likes + comments) / r.views
    fmt = "shorts" if r.is_short else "long_form"
    by_cat_format[cat][fmt].append(er)
    by_cat_format_channels[cat][fmt].add(r.channel_id)

print("=" * 74)
print(f"RAW: {len(rows)} videos with a real like count")
print(f"Categories represented: {len(by_cat_format)}")
print("=" * 74)

print("\n" + "=" * 74)
print("1. ENGAGEMENT RATE BY NICHE, LONG-FORM ONLY")
print("=" * 74)
print(f"{'niche':<16} {'videos':>8} {'channels':>9} {'median %':>10} {'mean %':>9}")
for cat, fmts in sorted(by_cat_format.items(), key=lambda kv: -len(kv[1].get('long_form', []))):
    ers = fmts.get('long_form', [])
    n_channels = len(by_cat_format_channels[cat].get('long_form', set()))
    if len(ers) < VIDEO_FLOOR or n_channels < CHANNEL_FLOOR:
        print(f"{cat:<16} {len(ers):>8} {n_channels:>9}   below floor, skipped")
        continue
    med = statistics.median(ers) * 100
    mean = statistics.mean(ers) * 100
    print(f"{cat:<16} {len(ers):>8} {n_channels:>9} {med:>9.3f}% {mean:>8.3f}%")

print("\n" + "=" * 74)
print("2. ENGAGEMENT RATE BY NICHE, SHORTS ONLY")
print("=" * 74)
print(f"{'niche':<16} {'videos':>8} {'channels':>9} {'median %':>10} {'mean %':>9}")
for cat, fmts in sorted(by_cat_format.items(), key=lambda kv: -len(kv[1].get('shorts', []))):
    ers = fmts.get('shorts', [])
    n_channels = len(by_cat_format_channels[cat].get('shorts', set()))
    if len(ers) < VIDEO_FLOOR or n_channels < CHANNEL_FLOOR:
        print(f"{cat:<16} {len(ers):>8} {n_channels:>9}   below floor, skipped")
        continue
    med = statistics.median(ers) * 100
    mean = statistics.mean(ers) * 100
    print(f"{cat:<16} {len(ers):>8} {n_channels:>9} {med:>9.3f}% {mean:>8.3f}%")

print("\n" + "=" * 74)
print("3. ENGAGEMENT RATE BY SUBSCRIBER TIER, LONG-FORM ONLY")
print("=" * 74)
TIERS = [
    ("Under 10K", 0, 10_000),
    ("10K-100K", 10_000, 100_000),
    ("100K-1M", 100_000, 1_000_000),
    ("1M-5M", 1_000_000, 5_000_000),
    ("5M+", 5_000_000, float("inf")),
]
by_tier = defaultdict(list)
by_tier_channels = defaultdict(set)

for r in rows:
    if r.is_short:
        continue
    subs = subs_by_channel.get(r.channel_id)
    if subs is None:
        continue
    for label, lo, hi in TIERS:
        if lo <= subs < hi:
            likes = r.likes or 0
            comments = r.comments or 0
            er = (likes + comments) / r.views
            by_tier[label].append(er)
            by_tier_channels[label].add(r.channel_id)
            break

print(f"{'tier':<12} {'videos':>8} {'channels':>9} {'median %':>10} {'mean %':>9}")
for label, _, _ in TIERS:
    ers = by_tier[label]
    n_channels = len(by_tier_channels[label])
    if len(ers) < VIDEO_FLOOR or n_channels < CHANNEL_FLOOR:
        print(f"{label:<12} {len(ers):>8} {n_channels:>9}   below floor, skipped")
        continue
    med = statistics.median(ers) * 100
    mean = statistics.mean(ers) * 100
    print(f"{label:<12} {len(ers):>8} {n_channels:>9} {med:>9.3f}% {mean:>8.3f}%")

print(f"\nChannels with a subscriber count on file: {len(subs_by_channel)}")
