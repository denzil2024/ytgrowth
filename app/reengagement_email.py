"""Send 3-day re-engagement email to free users who haven't returned.

Run by the daily scheduler. For each free-plan ChannelRegistry row whose
connected_at is between 3-4 days ago AND whose UserSession.updated_at is
no newer than connected_at + 24h (i.e. the user signed up, never came
back), send a personalised re-engagement email lead by their #1 priority
action.

Idempotent — UserEmailPreferences.reengagement_email_sent_at gates each
channel so we send at most one re-engagement email per channel, ever.
"""

import os
import json
import datetime
from datetime import timedelta

from database.models import (
    SessionLocal,
    ChannelRegistry,
    UserSession,
    UserSubscription,
    UserEmailPreferences,
)


BASE_URL = os.environ.get("BASE_URL", "http://localhost:5173")


def _ensure_pref(db, channel_id: str, email: str) -> UserEmailPreferences:
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


def _extract_top_action(user_data: dict) -> tuple[str | None, int]:
    """Return (top action text, total priority action count) from cached insights."""
    try:
        insights = (user_data or {}).get("insights") or {}
        actions = insights.get("priorityActions") or []
        if not actions:
            return None, 0
        first = actions[0] or {}
        text = (
            first.get("action")
            or first.get("title")
            or first.get("description")
            or None
        )
        return text, len(actions)
    except Exception:
        return None, 0


def run_reengagement_emails() -> None:
    """Daily scheduler entry point. Silent on error — never raises."""
    db = SessionLocal()
    sent = 0
    try:
        now = datetime.datetime.utcnow()
        # 3-4 day window — gives the cron a 24h slack so a missed run
        # doesn't permanently skip a cohort. Idempotency is enforced by
        # the welcome/reengagement_email_sent_at flag below.
        window_end   = now - timedelta(days=3)
        window_start = now - timedelta(days=4)

        registries = (
            db.query(ChannelRegistry)
            .filter(
                ChannelRegistry.is_active.is_(True),
                ChannelRegistry.connected_at >= window_start,
                ChannelRegistry.connected_at <= window_end,
            )
            .all()
        )

        for reg in registries:
            try:
                channel_id = reg.channel_id
                email      = reg.owner_email
                if not channel_id or not email:
                    continue

                # Free plan only — paid users either pay (engaged) or got the
                # weekly-report cycle that already nudges them.
                sub  = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
                plan = (sub.plan if sub else "free") or "free"
                if plan.lower() != "free":
                    continue

                pref = _ensure_pref(db, channel_id, email)
                if pref.reengagement_email_sent_at:
                    continue
                if not pref.weekly_report:
                    continue

                # Did the user actually return after signup? If their session
                # was updated more than 24h after signup, they came back; skip.
                came_back = (
                    db.query(UserSession)
                    .filter(UserSession.updated_at >= reg.connected_at + timedelta(hours=24))
                    .first()
                )
                if came_back:
                    # Pull up the matching session to verify it's the same user
                    # — UserSession doesn't index on channel_id directly, so
                    # we walk recent rows and check the embedded user_data.
                    came_back_for_user = False
                    sessions = db.query(UserSession).filter(
                        UserSession.updated_at >= reg.connected_at + timedelta(hours=24)
                    ).all()
                    for s in sessions:
                        try:
                            d = json.loads(s.user_data_json)
                            if d.get("channel", {}).get("channel_id") == channel_id:
                                came_back_for_user = True
                                break
                        except Exception:
                            continue
                    if came_back_for_user:
                        # User did come back — skip; mark the row so we never
                        # re-evaluate this channel for the re-engagement cohort.
                        pref.reengagement_email_sent_at = now
                        db.commit()
                        continue

                # Pull insights from any UserSession row that owns this channel.
                user_data = None
                sessions = db.query(UserSession).all()
                for s in sessions:
                    try:
                        d = json.loads(s.user_data_json)
                        if d.get("channel", {}).get("channel_id") == channel_id:
                            user_data = d
                            break
                    except Exception:
                        continue

                top_action, action_count = _extract_top_action(user_data or {})

                unsubscribe_url = (
                    f"{BASE_URL}/email/unsubscribe?token={pref.unsubscribe_token}"
                    if pref.unsubscribe_token else BASE_URL
                )

                from app.email_templates.reengagement import build_email_html
                import resend as _resend
                _resend.api_key = os.environ.get("RESEND_API_KEY", "")

                html = build_email_html(
                    channel_name=reg.channel_name or "",
                    top_action=top_action,
                    priority_actions_count=action_count or 5,
                    dashboard_url=f"{BASE_URL}/dashboard",
                    unsubscribe_url=unsubscribe_url,
                    base_url=BASE_URL,
                )

                # Subject leads with the top action if we have it — high open rates
                # come from specificity, not generic "we miss you" copy.
                if top_action:
                    short = top_action[:70].rstrip()
                    subject = f"Your #1 fix: {short}{'…' if len(top_action) > 70 else ''}"
                else:
                    subject = "Your YTGrowth audit found things to fix"

                _resend.Emails.send({
                    "from":    "YTGrowth <hello@ytgrowth.io>",
                    "to":      [email],
                    "subject": subject,
                    "html":    html,
                })
                pref.reengagement_email_sent_at = now
                db.commit()
                sent += 1

            except Exception as e:
                print(f"[reengagement_email] Error for channel {reg.channel_id[:8]}: {e}")
                continue

        if sent:
            print(f"[reengagement_email] sent {sent} re-engagement email(s)")
    except Exception as e:
        print(f"[reengagement_email] job error: {e}")
    finally:
        db.close()
