"""Quick one-off test: send only the milestone email to a single test address
so we can preview the design in a real inbox.

Usage (cmd):
    set RESEND_API_KEY=re_... && python scripts/test_lifecycle_emails.py

Sends ONE milestone email (views — 10K) to royalbluemedia.agency@gmail.com.
Does NOT touch the database. Safe to run multiple times.
"""

import os
import sys
import pathlib

_ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT))

TEST_EMAIL = "royalbluemedia.agency@gmail.com"
BASE_URL   = os.environ.get("BASE_URL", "https://ytgrowth.io")


def main() -> None:
    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    if not api_key:
        print("ERROR: RESEND_API_KEY not set. Set it in your shell first.")
        sys.exit(1)

    import resend
    resend.api_key = api_key

    from app.email_templates.milestone_unlock import build_email_html as build_milestone

    ms_html = build_milestone(
        channel_name="Royal Blue Media",
        channel_thumbnail=None,
        category="views",
        tier=10000,
        achieved_date="April 27, 2026",
        dashboard_url=BASE_URL,
        unsubscribe_url=f"{BASE_URL}/email/unsubscribe?token=TEST_TOKEN",
        base_url=BASE_URL,
    )

    print(f"Sending MILESTONE email to {TEST_EMAIL}...")
    r = resend.Emails.send({
        "from":    "YTGrowth <milestones@ytgrowth.io>",
        "to":      [TEST_EMAIL],
        "subject": "[TEST] You just hit 10K total views on YouTube",
        "html":    ms_html,
    })
    print(f"  → Resend response: {r}")
    print("\nDone. Check the inbox.")


if __name__ == "__main__":
    main()
