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

# Resend free tier allows 100 emails/day, shared with welcome + weekly-report
# sends. NURTURE_DAILY_CAP is the hard ceiling on nurture emails per calendar
# day across all hourly runs combined; the existing base is drained at this
# rate. Default 50 leaves ~50/day headroom. Override via env if on a paid plan.
NURTURE_DAILY_CAP = int(os.environ.get("NURTURE_DAILY_CAP", "50"))
# Safety ceiling on rows touched in a single hourly run.
MAX_PER_RUN = 50
# Drop a row after this many failed Resend attempts (bad address, etc.) so a
# permanently-failing send can't be retried forever and eat the daily budget.
MAX_ATTEMPTS = 3


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
    """Hourly job. Sends due nurture emails (oldest scheduled first) while
    respecting NURTURE_DAILY_CAP across all of today's runs combined, so the
    existing base drains at a steady rate that never trips Resend's daily limit.

    Send attempts that fail transiently are left pending and retried next run;
    a row is only marked failed after MAX_ATTEMPTS. sent_at records the last
    attempt time and is what the daily-budget query counts (skips excluded)."""
    db = SessionLocal()
    try:
        now = datetime.datetime.now(datetime.timezone.utc)

        # Daily Resend budget shared across every hourly run today. Count any
        # row that hit the Resend API today (sent or still-pending-after-fail),
        # excluding skips which never call Resend.
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        used_today = (
            db.query(EmailSequence)
              .filter(EmailSequence.sent_at >= start_of_day)
              .filter(EmailSequence.status != "skipped")
              .count()
        )
        remaining = NURTURE_DAILY_CAP - used_today
        if remaining <= 0:
            return

        due = (
            db.query(EmailSequence)
              .filter(EmailSequence.status == "pending")
              .filter(EmailSequence.scheduled_at <= now)
              .order_by(EmailSequence.scheduled_at.asc(), EmailSequence.id.asc())
              .limit(min(MAX_PER_RUN, remaining))
              .all()
        )

        sent = 0
        for row in due:
            try:
                if _is_unsubscribed(row.channel_id, db):
                    row.status = "skipped"
                    row.sent_at = datetime.datetime.now(datetime.timezone.utc)
                    db.commit()
                    continue

                _send_one(row, db)
                row.status = "sent"
                row.attempts = (row.attempts or 0) + 1
                row.sent_at = datetime.datetime.now(datetime.timezone.utc)
                db.commit()
                sent += 1
            except Exception as send_err:
                row.attempts = (row.attempts or 0) + 1
                row.sent_at = datetime.datetime.now(datetime.timezone.utc)
                if (row.attempts or 0) >= MAX_ATTEMPTS:
                    row.status = "failed"
                    print(f"[nurture] giving up on {row.user_email} "
                          f"#{row.email_number} after {row.attempts} tries: {send_err}")
                else:
                    print(f"[nurture] send failed for {row.user_email} "
                          f"#{row.email_number} (attempt {row.attempts}), will retry: {send_err}")
                db.commit()
                continue

        if due:
            print(f"[nurture] Job complete: sent {sent} of {len(due)} due "
                  f"(cap {NURTURE_DAILY_CAP}/day, {used_today} already used today)")
    finally:
        db.close()


def backfill_existing_free_users() -> None:
    """Run once on startup. Enqueue the 7-email sequence for every existing
    FREE user so the established base enters the funnel, not just new signups.

    Idempotent two ways: a sentinel row short-circuits re-runs on later boots,
    and enqueue_nurture_sequence skips any email that already has rows. Pacing
    is left entirely to the send loop's daily cap, so enqueuing everyone at once
    here is safe; nobody gets a burst of mail.
    """
    from database.models import UserAccount, UserSubscription, ChannelRegistry

    SENTINEL = "__nurture_backfill_done__"
    db = SessionLocal()
    try:
        if db.query(EmailSequence).filter_by(user_email=SENTINEL).first():
            return

        accounts = db.query(UserAccount).all()
        enqueued = 0
        skipped_paid = 0
        for acct in accounts:
            email = acct.email
            if not email or email.startswith("__"):
                continue

            # Free check: any non-free subscription tied to this email => paid.
            subs = db.query(UserSubscription).filter_by(email=email).all()
            if any((s.plan or "free") != "free" for s in subs):
                skipped_paid += 1
                continue

            # Carry a channel_id for unsubscribe handling; prefer an active one.
            reg = (
                db.query(ChannelRegistry)
                  .filter_by(owner_email=email)
                  .order_by(ChannelRegistry.is_active.desc(),
                            ChannelRegistry.connected_at.desc())
                  .first()
            )
            channel_id = reg.channel_id if reg else None

            enqueue_nurture_sequence(email, acct.display_name, channel_id)
            enqueued += 1

        # Sentinel row (email_number 0, status skipped) so the scan never
        # repeats and the send loop never picks it up.
        db.add(EmailSequence(
            user_email=SENTINEL,
            channel_id=None,
            email_number=0,
            scheduled_at=datetime.datetime.now(datetime.timezone.utc),
            status="skipped",
        ))
        db.commit()
        print(f"[nurture] Backfill complete: enqueued {enqueued} free users, "
              f"skipped {skipped_paid} paid")
    except Exception as e:
        print(f"[nurture] backfill error: {e}")
        db.rollback()
    finally:
        db.close()
