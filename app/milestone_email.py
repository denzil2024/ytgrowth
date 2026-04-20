"""Send milestone unlock email via Resend.

Called after check_and_record returns newly-unlocked tiers. One email per
new milestone, capped to avoid spam on first-signup bulk backfill. Uses
the weekly_report email preference as a global opt-out gate.
"""

import os
import datetime

from database.models import SessionLocal, ChannelRegistry, UserEmailPreferences


BASE_URL = os.environ.get("BASE_URL", "http://localhost:5173")


def _fmt_date(d: datetime.datetime) -> str:
    return f"{d.strftime('%B')} {d.day}, {d.year}"


def send_milestone_emails(
    channel_id: str,
    new_milestones: list[dict],
    channel_name: str,
    channel_thumbnail: str | None,
) -> None:
    """Fire-and-forget. Silent on error — never block the API response."""
    if not channel_id or not new_milestones:
        return

    # Bulk-backfill guard: if a channel just connected and is mature, we may
    # record many tiers at once. Skip the email flood.
    if len(new_milestones) > 3:
        print(f"[milestone_email] skipping {len(new_milestones)} unlocks (bulk backfill)")
        return

    db = SessionLocal()
    try:
        reg = (
            db.query(ChannelRegistry)
            .filter_by(channel_id=channel_id, is_active=True)
            .first()
        )
        email = reg.owner_email if reg else None
        if not email:
            return

        pref = db.query(UserEmailPreferences).filter_by(channel_id=channel_id).first()
        if pref and not pref.weekly_report:
            return

        token = pref.unsubscribe_token if pref and pref.unsubscribe_token else ""
        unsubscribe_url = f"{BASE_URL}/email/unsubscribe?token={token}" if token else BASE_URL

        from app.email_templates.milestone_unlock import (
            build_email_html, CATEGORY_VERB, _fmt_num,
        )
        import resend as _resend

        _resend.api_key = os.environ.get("RESEND_API_KEY", "")
        today_str = _fmt_date(datetime.datetime.utcnow())

        for m in new_milestones:
            category = m.get("category", "")
            tier     = int(m.get("tier") or 0)
            if not category or not tier:
                continue

            html = build_email_html(
                channel_name=channel_name or "",
                channel_thumbnail=channel_thumbnail,
                category=category,
                tier=tier,
                achieved_date=today_str,
                dashboard_url=BASE_URL,
                unsubscribe_url=unsubscribe_url,
            )
            verb = CATEGORY_VERB.get(category, "milestones")
            subject = f"You just hit {_fmt_num(tier)} {verb} on YouTube"

            try:
                _resend.Emails.send({
                    "from":    "YTGrowth <milestones@ytgrowth.io>",
                    "to":      [email],
                    "subject": subject,
                    "html":    html,
                })
            except Exception as e:
                print(f"[milestone_email] Resend error: {e}")
    except Exception as e:
        print(f"[milestone_email] error: {e}")
    finally:
        db.close()
