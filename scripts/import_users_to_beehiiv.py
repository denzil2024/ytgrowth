"""One-off: import existing registered users (UserAccount) into beehiiv as
subscribers, now that the privacy policy (2026-10-04) covers product-update
emails with a working unsubscribe. Skips anyone who already unsubscribed
from product emails via UserEmailPreferences.unsubscribed_at.

Does NOT send the beehiiv welcome-automation email (that's for new popup
signups) — these are existing users, so send_welcome_email is False and a
distinct custom_fields source marks them as a backfill, not a fresh opt-in.

Run on Railway (app service console, has DATABASE_URL and BEEHIIV_* vars):

    python scripts/import_users_to_beehiiv.py           # dry run, prints what it would do
    python scripts/import_users_to_beehiiv.py --live     # actually sends to beehiiv
"""

import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
from sqlalchemy import text
from database.models import SessionLocal

BEEHIIV_API_KEY = os.environ.get("BEEHIIV_API_KEY")
BEEHIIV_PUBLICATION_ID = os.environ.get("BEEHIIV_PUBLICATION_ID")

LIVE = "--live" in sys.argv


def import_one(email: str):
    if not LIVE:
        return True, "dry-run"
    try:
        resp = requests.post(
            f"https://api.beehiiv.com/v2/publications/{BEEHIIV_PUBLICATION_ID}/subscriptions",
            headers={
                "Authorization": f"Bearer {BEEHIIV_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "email": email,
                "reactivate_existing": False,
                "send_welcome_email": False,
                "utm_source": "ytgrowth.io",
                "utm_medium": "existing_user_import",
                "custom_fields": [{"name": "source", "value": "existing_user_backfill"}],
            },
            timeout=8,
        )
        return resp.status_code in (200, 201), f"status {resp.status_code}"
    except Exception as e:
        return False, str(e)


def main():
    if LIVE and (not BEEHIIV_API_KEY or not BEEHIIV_PUBLICATION_ID):
        print("BEEHIIV_API_KEY / BEEHIIV_PUBLICATION_ID not set, aborting --live run")
        sys.exit(1)

    db = SessionLocal()
    try:
        rows = db.execute(text("""
            SELECT ua.email
            FROM user_accounts ua
            LEFT JOIN user_email_preferences uep ON uep.email = ua.email AND uep.unsubscribed_at IS NOT NULL
            WHERE uep.email IS NULL
            ORDER BY ua.created_at
        """)).fetchall()

        total = len(rows)
        print(f"{total} users eligible (not previously unsubscribed) | mode: {'LIVE' if LIVE else 'DRY RUN'}")

        ok_count, fail_count = 0, 0
        for i, (email,) in enumerate(rows, 1):
            ok, detail = import_one(email)
            if ok:
                ok_count += 1
            else:
                fail_count += 1
                print(f"  [{i}/{total}] FAILED {email}: {detail}")
            if LIVE:
                time.sleep(0.3)  # gentle pacing, beehiiv has rate limits

        print(f"done: {ok_count} ok, {fail_count} failed")
        if not LIVE:
            print("this was a dry run — re-run with --live to actually import")
    finally:
        db.close()


if __name__ == "__main__":
    main()
