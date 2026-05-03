"""Send the immediate welcome email via Resend.

Fires from /auth/callback the moment a brand-new user finishes Google OAuth,
BEFORE their first audit completes. Pairs with welcome_email.py, which still
fires after the audit with the personalised priority hook.

Idempotency: gated on `is_new_signup` at the call site. UserAccount is unique
per email and only seen-for-the-first-time on the first OAuth callback, so
the call site naturally only triggers this once. No DB column needed.

Fire-and-forget. Errors are logged but never propagate; OAuth callback must
not be blocked by email delivery.
"""

import os
import secrets

from database.models import (
    SessionLocal,
    UserEmailPreferences,
)


BASE_URL = os.environ.get("BASE_URL", "http://localhost:5173")


def _ensure_unsubscribe_token(channel_id: str, email: str) -> str:
    """Make sure UserEmailPreferences has an unsubscribe token so the email
    can include a working unsubscribe link. Mirrors the pattern in
    welcome_email.py / weekly_report.py.
    """
    if not channel_id:
        return ""
    db = SessionLocal()
    try:
        pref = db.query(UserEmailPreferences).filter_by(channel_id=channel_id).first()
        if not pref:
            pref = UserEmailPreferences(
                channel_id=channel_id,
                email=email,
                weekly_report=True,
                unsubscribe_token=secrets.token_urlsafe(32),
            )
            db.add(pref)
            db.commit()
        elif not pref.unsubscribe_token:
            pref.unsubscribe_token = secrets.token_urlsafe(32)
            db.commit()
        return pref.unsubscribe_token or ""
    except Exception as e:
        print(f"[welcome_immediate] pref ensure error: {e}")
        return ""
    finally:
        db.close()


def send_welcome_immediate(
    email: str,
    display_name: str = "",
    channel_id: str | None = None,
    channel_name: str | None = None,
) -> None:
    """Send the immediate welcome. Fire-and-forget; safe to call from a
    daemon thread off the OAuth callback.
    """
    if not email:
        return

    first_name = ""
    if display_name:
        first_name = display_name.split(" ", 1)[0].strip()

    token = _ensure_unsubscribe_token(channel_id or "", email) if channel_id else ""
    unsubscribe_url = (
        f"{BASE_URL}/email/unsubscribe?token={token}" if token else BASE_URL
    )

    try:
        from app.email_templates.welcome_immediate import build_email
        import resend as _resend

        _resend.api_key = os.environ.get("RESEND_API_KEY", "")

        text, html = build_email(
            first_name=first_name,
            channel_name=channel_name,
            dashboard_url=f"{BASE_URL}/dashboard",
            unsubscribe_url=unsubscribe_url,
        )

        _resend.Emails.send({
            "from":     "Denzil from YTGrowth <hello@ytgrowth.io>",
            "to":       [email],
            "subject":  "Welcome to YTGrowth",
            "html":     html,
            "text":     text,
            "reply_to": "hello@ytgrowth.io",
        })
    except Exception as e:
        print(f"[welcome_immediate] send error: {e}")
