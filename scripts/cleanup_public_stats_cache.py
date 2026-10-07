"""One-off: delete expired rows from public_channel_stats_cache.

This table is DB-persisted cache for the anonymous /tools/youtube-channel-stats-
checker endpoint (routers/channel_stats_routes.py), TTL 24h
(_CACHE_TTL_SECONDS). Expired rows are already treated as a cache miss on
read (age >= TTL falls through to a fresh fetch) but nothing ever deletes
them, so the table only grows. It's currently the single largest table on
disk (160MB of ~309MB total DB size).

Deletes rows older than 24 hours. Safe: a deleted row just means the next
lookup for that channel re-fetches from YouTube (3 units: channels.list +
playlistItems.list + videos.list) instead of hitting cache, identical to
what already happens for any row past its TTL today.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/cleanup_public_stats_cache.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.models import SessionLocal

TTL_HOURS = 24
BATCH_SIZE = 2000

COUNT_QUERY = text(
    "SELECT COUNT(*) FROM public_channel_stats_cache "
    "WHERE cached_at < NOW() - make_interval(hours => :ttl_hours)"
)

# Batched delete: deletes BATCH_SIZE rows per transaction instead of all at
# once. A single DELETE across 100K+ rows on an already-full disk can fail
# mid-transaction (SSL EOF / connection drop), confirmed on this table
# 2026-10-06. Small batches keep each transaction's WAL footprint small.
BATCH_DELETE_QUERY = text(
    "DELETE FROM public_channel_stats_cache "
    "WHERE cache_key IN ("
    "  SELECT cache_key FROM public_channel_stats_cache "
    "  WHERE cached_at < NOW() - make_interval(hours => :ttl_hours) "
    "  LIMIT :batch_size"
    ")"
)


def main():
    db = SessionLocal()
    try:
        total = db.execute(text("SELECT COUNT(*) FROM public_channel_stats_cache")).scalar()
        expired = db.execute(COUNT_QUERY, {"ttl_hours": TTL_HOURS}).scalar()
        print(f"Total rows: {total}")
        print(f"Expired rows (older than {TTL_HOURS}h): {expired}")

        if expired == 0:
            print("Nothing to delete.")
            return

        deleted_total = 0
        while True:
            result = db.execute(BATCH_DELETE_QUERY, {"ttl_hours": TTL_HOURS, "batch_size": BATCH_SIZE})
            db.commit()
            n = result.rowcount
            deleted_total += n
            print(f"  deleted batch of {n} (running total: {deleted_total})")
            if n == 0:
                break

        print(f"Deleted {deleted_total} expired rows total.")

        remaining = db.execute(text("SELECT COUNT(*) FROM public_channel_stats_cache")).scalar()
        print(f"Remaining rows: {remaining}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
