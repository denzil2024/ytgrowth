"""One-off, read-only: how many emails has the NewsletterCapture popup
(blog posts, 50-90% scroll trigger, shipped 2026-10-01) collected so far,
and which posts are converting. Prints total count, date range, and a
per-source breakdown.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/check_email_leads.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.models import SessionLocal

db = SessionLocal()
try:
    total, first, last = db.execute(text(
        "SELECT COUNT(*), MIN(created_at), MAX(created_at) FROM email_leads"
    )).fetchone()
    print(f"email_leads: {total:,} rows | first {first} | last {last}")

    if total:
        print()
        print("by source (blog slug):")
        rows = db.execute(text(
            "SELECT COALESCE(source, '(none)'), COUNT(*) FROM email_leads "
            "GROUP BY source ORDER BY COUNT(*) DESC LIMIT 20"
        )).fetchall()
        for source, count in rows:
            print(f"  {source}: {count}")
finally:
    db.close()
