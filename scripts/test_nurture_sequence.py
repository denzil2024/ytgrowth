"""Preview the free-to-paid nurture sequence in a real inbox.

Sends the nurture emails to royalbluemedia.agency@gmail.com using the real
templates and the production from-address (denzil@ytgrowth.io). Does NOT touch
the database, so it's safe to run as many times as you like.

Usage (cmd):
    set RESEND_API_KEY=re_... && python scripts/test_nurture_sequence.py

By default it sends all 7 emails. Pass a number to send just one:
    set RESEND_API_KEY=re_... && python scripts/test_nurture_sequence.py 6

The first name used in the copy defaults to "Denzil"; override it:
    ... && python scripts/test_nurture_sequence.py --name Sam
"""

import os
import sys
import pathlib

_ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT))

TEST_EMAIL = "royalbluemedia.agency@gmail.com"
BASE_URL   = os.environ.get("BASE_URL", "https://ytgrowth.io")
PRICING_URL = "https://ytgrowth.io/pricing"


def main() -> None:
    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    if not api_key:
        print("ERROR: RESEND_API_KEY not set. Set it in your shell first.")
        sys.exit(1)

    # Parse args: an optional email number, and an optional --name value.
    first_name = "Denzil"
    only = None
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        a = args[i]
        if a == "--name" and i + 1 < len(args):
            first_name = args[i + 1]
            i += 2
            continue
        if a.isdigit():
            only = int(a)
        i += 1

    import resend
    resend.api_key = api_key

    from app.email_templates.nurture import OFFSET_DAYS, build_email

    numbers = [only] if only else sorted(OFFSET_DAYS.keys())
    for n in numbers:
        subject, text, html = build_email(
            n,
            first_name=first_name,
            pricing_url=PRICING_URL,
            dashboard_url=f"{BASE_URL}/dashboard",
            unsubscribe_url=f"{BASE_URL}/email/unsubscribe?token=TEST_TOKEN",
        )
        print(f"Sending nurture email #{n} (Day {OFFSET_DAYS[n]}) to {TEST_EMAIL}...")
        r = resend.Emails.send({
            "from":     "Denzil from YTGrowth <denzil@ytgrowth.io>",
            "to":       [TEST_EMAIL],
            "subject":  f"[TEST] {subject}",
            "html":     html,
            "text":     text,
            "reply_to": "denzil@ytgrowth.io",
        })
        print(f"  -> Resend response: {r}")

    print("\nDone. Check the inbox.")


if __name__ == "__main__":
    main()
