"""Quick one-off test: send the welcome + re-engagement emails to a single
test address so we can preview the designs in a real inbox.

Usage (PowerShell):
    $env:RESEND_API_KEY="re_..."
    python scripts/test_lifecycle_emails.py

Usage (bash):
    RESEND_API_KEY="re_..." python scripts/test_lifecycle_emails.py

Sends two emails to royalbluemedia.agency@gmail.com with realistic sample
data. Does NOT touch the database — these are pure HTML renders + Resend
send calls. Safe to run multiple times.
"""

import os
import sys
import pathlib

# Make `app.*` importable when run from anywhere
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

    from app.email_templates.welcome import build_email_html as build_welcome
    from app.email_templates.reengagement import build_email_html as build_reengagement

    sample_action = (
        "Your average view duration on long-form is 1m40s against a niche "
        "benchmark of 3m30s. Cut your intro to under 30s and lead with the "
        "payoff. Re-test on your next upload."
    )

    # ── 1. Welcome email ──────────────────────────────────────────────────
    welcome_html = build_welcome(
        channel_name="Royal Blue Media",
        channel_thumbnail=None,  # avatar fallback shows the "R" initial
        top_action=sample_action,
        dashboard_url=f"{BASE_URL}/dashboard",
        unsubscribe_url=f"{BASE_URL}/email/unsubscribe?token=TEST_TOKEN",
    )

    print(f"Sending WELCOME email to {TEST_EMAIL}...")
    r1 = resend.Emails.send({
        "from":    "YTGrowth <hello@ytgrowth.io>",
        "to":      [TEST_EMAIL],
        "subject": "[TEST] What we found on your channel",
        "html":    welcome_html,
    })
    print(f"  → Resend response: {r1}")

    # ── 2. Re-engagement email ────────────────────────────────────────────
    reengagement_html = build_reengagement(
        channel_name="Royal Blue Media",
        top_action=sample_action,
        priority_actions_count=5,
        dashboard_url=f"{BASE_URL}/dashboard",
        unsubscribe_url=f"{BASE_URL}/email/unsubscribe?token=TEST_TOKEN",
    )

    print(f"Sending RE-ENGAGEMENT email to {TEST_EMAIL}...")
    r2 = resend.Emails.send({
        "from":    "YTGrowth <hello@ytgrowth.io>",
        "to":      [TEST_EMAIL],
        "subject": "[TEST] Fix these NOW!",
        "html":    reengagement_html,
    })
    print(f"  → Resend response: {r2}")

    print("\nDone. Check the inbox.")


if __name__ == "__main__":
    main()
