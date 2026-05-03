"""Send welcome email via Resend.

Called once per channel from _run_analysis_in_background after the first
audit completes. Idempotent — checks UserEmailPreferences.welcome_email_sent_at
before sending, so a re-audit / reconnect / fan-out never triggers a second
welcome. Silent on error — never blocks the API response.
"""

import os
import datetime

from database.models import (
    SessionLocal,
    ChannelRegistry,
    UserEmailPreferences,
    UserSubscription,
)


BASE_URL = os.environ.get("BASE_URL", "http://localhost:5173")


def _ensure_pref(db, channel_id: str, email: str) -> UserEmailPreferences:
    """Get or create the per-channel email pref row. Mirrors weekly_report.py."""
    pref = db.query(UserEmailPreferences).filter_by(channel_id=channel_id).first()
    if not pref:
        import secrets
        pref = UserEmailPreferences(
            channel_id=channel_id,
            email=email,
            weekly_report=True,
            unsubscribe_token=secrets.token_urlsafe(32),
        )
        db.add(pref)
        db.commit()
    elif not pref.unsubscribe_token:
        import secrets
        pref.unsubscribe_token = secrets.token_urlsafe(32)
        db.commit()
    return pref


def send_welcome_email(
    channel_id: str,
    user_data: dict | None = None,
) -> None:
    """Fire-and-forget. Runs once per channel; subsequent calls are no-ops."""
    if not channel_id:
        return

    db = SessionLocal()
    try:
        # Resolve email + channel name from the registry (single source of truth).
        reg = (
            db.query(ChannelRegistry)
            .filter_by(channel_id=channel_id, is_active=True)
            .first()
        )
        email             = reg.owner_email       if reg else None
        channel_name      = reg.channel_name      if reg else ""
        channel_thumbnail = reg.channel_thumbnail if reg else None

        if not email:
            # Fallback to user_data.email when registry hasn't been written yet.
            email = (user_data or {}).get("email", "")
            channel = (user_data or {}).get("channel", {}) or {}
            channel_name      = channel.get("channel_name", "") or channel_name
            channel_thumbnail = channel.get("channel_thumbnail") or channel_thumbnail

        if not email:
            return

        pref = _ensure_pref(db, channel_id, email)

        # Idempotency guard — already sent.
        if pref.welcome_email_sent_at:
            return

        # Honor unsubscribe — same flag the milestone email respects.
        if not pref.weekly_report:
            return

        unsubscribe_url = (
            f"{BASE_URL}/email/unsubscribe?token={pref.unsubscribe_token}"
            if pref.unsubscribe_token else BASE_URL
        )

        # Personalise with the user's #1 priority action when we have it.
        top_action = None
        try:
            insights = (user_data or {}).get("insights") or {}
            actions = insights.get("priorityActions") or []
            if actions:
                first = actions[0]
                # Different audit shapes — try common keys.
                top_action = (
                    first.get("action")
                    or first.get("title")
                    or first.get("description")
                    or None
                )
        except Exception:
            pass

        # Pull first_name off the user account for a personal greeting.
        first_name = ""
        try:
            from database.models import UserAccount
            account = db.query(UserAccount).filter_by(email=email).first()
            if account and account.display_name:
                first_name = account.display_name.split(" ", 1)[0].strip()
        except Exception:
            first_name = ""

        from app.email_templates.welcome import build_email
        import resend as _resend

        _resend.api_key = os.environ.get("RESEND_API_KEY", "")

        text, html = build_email(
            first_name=first_name,
            channel_name=channel_name or "",
            top_action=top_action,
            dashboard_url=f"{BASE_URL}/dashboard",
            unsubscribe_url=unsubscribe_url,
        )

        try:
            _resend.Emails.send({
                "from":    "Denzil from YTGrowth <hello@ytgrowth.io>",
                "to":      [email],
                "subject": "What we found on your channel",
                "html":    html,
                "text":    text,
                "reply_to": "hello@ytgrowth.io",
            })
            pref.welcome_email_sent_at = datetime.datetime.utcnow()
            db.commit()
        except Exception as e:
            print(f"[welcome_email] Resend error: {e}")
    except Exception as e:
        print(f"[welcome_email] error: {e}")
    finally:
        db.close()
