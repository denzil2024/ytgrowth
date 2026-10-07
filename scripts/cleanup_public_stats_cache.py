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

COUNT_QUERY = text(
    "SELECT COUNT(*) FROM public_channel_stats_cache "
    "WHERE cached_at < NOW() - make_interval(hours => :ttl_hours)"
)

DELETE_QUERY = text(
    "DELETE FROM public_channel_stats_cache "
    "WHERE cached_at < NOW() - make_interval(hours => :ttl_hours)"
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

        result = db.execute(DELETE_QUERY, {"ttl_hours": TTL_HOURS})
        db.commit()
        print(f"Deleted {result.rowcount} expired rows.")

        remaining = db.execute(text("SELECT COUNT(*) FROM public_channel_stats_cache")).scalar()
        print(f"Remaining rows: {remaining}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
