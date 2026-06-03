"""Free-to-paid nurture sequence: enqueue on signup + hourly send loop.

On a new free signup we insert seven EmailSequence rows, one per email in the
series, each with a scheduled_at computed from signup time. An hourly scheduler
job (run_nurture_emails) sends whatever is due via Resend.

Copy lives in app/email_templates/nurture.py. This module is the plumbing:
scheduling, idempotency, unsubscribe handling, and the Resend call.

Everything here is fire-and-forget. Errors are logged and swallowed so neither
the OAuth callback nor the scheduler thread is ever blocked by email delivery.
"""

import os
import datetime

from database.models import (
    SessionLocal,
    EmailSequence,
    UserEmailPreferences,
)
from app.email_templates.nurture import OFFSET_DAYS, build_email


# Engagement CTAs go to the app; upgrade CTAs go to the public pricing page.
BASE_URL = os.environ.get("BASE_URL", "http://localhost:5173")
PRICING_URL = "https://ytgrowth.io/pricing"

# Resend free tier allows 100 emails/day. The job runs hourly, so cap each run
# well under that to leave headroom for the weekly report and welcome sends.
MAX_PER_RUN = 50


def _first_name(display_name: str | None) -> str:
    if not display_name:
        return ""
    return display_name.split(" ", 1)[0].strip()


def enqueue_nurture_sequence(
    email: str,
    display_name: str | None = None,
    channel_id: str | None = None,
) -> None:
    """Insert the 7 nurture rows for a brand-new free user.

    Idempotent: if any rows already exist for this email the call is a no-op,
    so a repeated signup callback never double-enqueues. Safe to call inline
    from the OAuth callback; it opens and closes its own session.
    """
    if not email:
        return

    db = SessionLocal()
    try:
        existing = (
            db.query(EmailSequence)
              .filter(EmailSequence.user_email == email)
              .first()
        )
        if existing:
            return

        now = datetime.datetime.now(datetime.timezone.utc)
        for number, offset_days in OFFSET_DAYS.items():
            db.add(EmailSequence(
                user_email=email,
                channel_id=channel_id,
                email_number=number,
                scheduled_at=now + datetime.timedelta(days=offset_days),
                status="pending",
            ))
        db.commit()
        print(f"[nurture] Enqueued 7 emails for {email}")
    except Exception as e:
        print(f"[nurture] enqueue error for {email}: {e}")
        db.rollback()
    finally:
        db.close()


def _unsubscribe_url(channel_id: str | None, db) -> str:
    """Build an unsubscribe link from the existing per-channel token. Falls
    back to the site root when there's no channel/token yet."""
    if not channel_id:
        return BASE_URL
    try:
        pref = db.query(UserEmailPreferences).filter_by(channel_id=channel_id).first()
        if pref and pref.unsubscribe_token:
            return f"{BASE_URL}/email/unsubscribe?token={pref.unsubscribe_token}"
    except Exception:
        pass
    return BASE_URL


def _is_unsubscribed(channel_id: str | None, db) -> bool:
    """Honour the same opt-out flag the unsubscribe route toggles."""
    if not channel_id:
        return False
    try:
        pref = db.query(UserEmailPreferences).filter_by(channel_id=channel_id).first()
        return bool(pref and not pref.weekly_report)
    except Exception:
        return False


def _send_one(row: EmailSequence, db) -> bool:
    """Render and send a single nurture email. Returns True on success."""
    import resend as _resend
    _resend.api_key = os.environ.get("RESEND_API_KEY", "")

    display_name = ""
    try:
        from database.models import UserAccount
        acct = db.query(UserAccount).filter_by(email=row.user_email).first()
        if acct:
            display_name = acct.display_name or ""
    except Exception:
        pass

    subject, text, html = build_email(
        row.email_number,
        first_name=_first_name(display_name),
        pricing_url=PRICING_URL,
        dashboard_url=f"{BASE_URL}/dashboard",
        unsubscribe_url=_unsubscribe_url(row.channel_id, db),
    )

    _resend.Emails.send({
        "from":     "Denzil from YTGrowth <denzil@ytgrowth.io>",
        "to":       [row.user_email],
        "subject":  subject,
        "html":     html,
        "text":     text,
        "reply_to": "denzil@ytgrowth.io",
    })
    return True


def run_nurture_emails() -> None:
    """Hourly job. Sends every pending nurture email whose scheduled_at has
    passed, up to MAX_PER_RUN. Each row's status is moved to sent / skipped /
    failed so it is never reconsidered (failures are not retried, we'd rather
    drop one email than risk a loop hammering Resend)."""
    db = SessionLocal()
    try:
        now = datetime.datetime.now(datetime.timezone.utc)
        due = (
            db.query(EmailSequence)
              .filter(EmailSequence.status == "pending")
              .filter(EmailSequence.scheduled_at <= now)
              .order_by(EmailSequence.scheduled_at.asc())
              .limit(MAX_PER_RUN)
              .all()
        )

        sent = 0
        for row in due:
            try:
                if _is_unsubscribed(row.channel_id, db):
                    row.status = "skipped"
                    row.sent_at = now
                    db.commit()
                    continue

                _send_one(row, db)
                row.status = "sent"
                row.sent_at = datetime.datetime.now(datetime.timezone.utc)
                db.commit()
                sent += 1
            except Exception as send_err:
                print(f"[nurture] send failed for {row.user_email} "
                      f"#{row.email_number}: {send_err}")
                row.status = "failed"
                row.sent_at = datetime.datetime.now(datetime.timezone.utc)
                db.commit()
                continue

        if due:
            print(f"[nurture] Job complete: sent {sent} of {len(due)} due")
    finally:
        db.close()
