"""Data study #14 (DATA-STUDIES.md), feeds CONTENT-PLAN.md #12: what counts
as "viral" measured as a multiple of the channel's OWN median views, rather
than the internet's flat guesses ("10k views is viral").

Read-only, zero YouTube API quota: channel_videos + video_metric_snapshots
+ top_channel_cache only, same tables as the best-time-to-post study.

Method, stated so the article can state it:
  1. Take each video's LATEST snapshot views (its most mature count we hold).
  2. Per channel, compute the median of those view counts across its videos.
     Channels need 5+ videos, or a median is meaningless.
  3. Express every video as a multiple of its own channel's median.
  4. Report the share of videos clearing 2x / 5x / 10x / 50x, overall,
     by niche, and by subscriber tier.

Deliberately NOT measured (DATA-STUDIES.md "Not measurable"): any per-day or
true first-24h figure (snapshots are weekly), and any full-history claim (we
hold each channel's 50 newest uploads).

Run on Railway (app service console, has DATABASE_URL):

    python scripts/query_viral_multiples_study.py
"""

import os
import sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.models import SessionLocal

MIN_VIDEOS_PER_CHANNEL = 5
MULTIPLES = [2, 5, 10, 50]

# Latest snapshot per video, joined to channel + niche + subscriber count.
# DISTINCT ON picks the most recent snapshot row per video_id.
BASE_QUERY = """
WITH latest AS (
  SELECT DISTINCT ON (vms.video_id)
    vms.video_id,
    vms.views,
    vms.snapshot_date
  FROM video_metric_snapshots vms
  WHERE vms.views IS NOT NULL
  ORDER BY vms.video_id, vms.snapshot_date DESC
),
niche AS (
  SELECT DISTINCT ON (channel_id) channel_id, category, subscribers
  FROM top_channel_cache
  ORDER BY channel_id, fetched_at DESC
)
SELECT
  cv.channel_id,
  cv.video_id,
  cv.is_short,
  l.views,
  COALESCE(n.category, 'uncategorized') AS category,
  n.subscribers
FROM channel_videos cv
JOIN latest l ON l.video_id = cv.video_id
LEFT JOIN niche n ON n.channel_id = cv.channel_id
WHERE cv.published_at >= '2025-01-01'
"""


def median(xs):
    s = sorted(xs)
    n = len(s)
    if n == 0:
        return None
    mid = n // 2
    return s[mid] if n % 2 else (s[mid - 1] + s[mid]) / 2


def sub_tier(subs):
    if subs is None:
        return None
    if subs < 10_000:
        return "under 10K"
    if subs < 100_000:
        return "10K-100K"
    if subs < 1_000_000:
        return "100K-1M"
    return "1M+"


def share_table(rows, label):
    """rows = list of multiples. Prints share clearing each threshold."""
    n = len(rows)
    if n == 0:
        print(f"  {label}: no data")
        return
    parts = []
    for m in MULTIPLES:
        hits = sum(1 for r in rows if r >= m)
        parts.append(f"{m}x: {100.0 * hits / n:5.2f}%")
    print(f"  {label:<16} n={n:<7} " + "  ".join(parts))


def main():
    db = SessionLocal()
    try:
        rows = db.execute(text(BASE_QUERY)).fetchall()
        print(f"Rows pulled (video-level, published 2025-01-01 onward): {len(rows)}")

        by_channel = defaultdict(list)
        for r in rows:
            by_channel[r.channel_id].append(r)

        usable = {cid: vs for cid, vs in by_channel.items()
                  if len(vs) >= MIN_VIDEOS_PER_CHANNEL}
        print(f"Channels with {MIN_VIDEOS_PER_CHANNEL}+ videos: {len(usable)} "
              f"(of {len(by_channel)} total)")

        # Build per-video multiple of its channel's median.
        all_multiples = []
        by_category = defaultdict(list)
        by_tier = defaultdict(list)
        by_format = defaultdict(list)
        channel_medians = []

        for cid, vids in usable.items():
            med = median([v.views for v in vids])
            if not med or med <= 0:
                continue
            channel_medians.append(med)
            for v in vids:
                mult = v.views / med
                all_multiples.append(mult)
                by_category[v.category].append(mult)
                tier = sub_tier(v.subscribers)
                if tier:
                    by_tier[tier].append(mult)
                if v.is_short is not None:
                    by_format["Shorts" if v.is_short else "Long-form"].append(mult)

        print(f"Videos in the final sample: {len(all_multiples)}")
        print(f"Median channel median views: {median(channel_medians):,.0f}")
        print()

        print("=== OVERALL: share of videos clearing each multiple of channel median ===")
        share_table(all_multiples, "all videos")
        print()

        print("=== Distribution of the multiple itself (percentiles) ===")
        s = sorted(all_multiples)
        for p in [50, 75, 90, 95, 99]:
            idx = min(int(len(s) * p / 100), len(s) - 1)
            print(f"  p{p}: {s[idx]:.2f}x")
        print()

        print("=== BY SUBSCRIBER TIER ===")
        for tier in ["under 10K", "10K-100K", "100K-1M", "1M+"]:
            if tier in by_tier:
                share_table(by_tier[tier], tier)
        print()

        print("=== BY FORMAT ===")
        for fmt in ["Long-form", "Shorts"]:
            if fmt in by_format:
                share_table(by_format[fmt], fmt)
        print()

        print("=== BY NICHE (30+ channel floor applies, uncategorized shown for scale) ===")
        cat_channel_counts = defaultdict(set)
        for cid, vids in usable.items():
            cat_channel_counts[vids[0].category].add(cid)
        for cat in sorted(by_category, key=lambda c: -len(by_category[c])):
            nch = len(cat_channel_counts[cat])
            flag = "" if nch >= 30 else "   <-- BELOW 30-CHANNEL FLOOR, do not publish"
            share_table(by_category[cat], f"{cat} ({nch}ch)")
            if flag:
                print(flag)
    finally:
        db.close()


if __name__ == "__main__":
    main()
