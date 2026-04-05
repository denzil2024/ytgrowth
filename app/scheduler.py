"""
Unified background scheduler.

Jobs:
  1. Monthly credit resets — every 6 hours
  2. Weekly report sends   — daily at 08:00 UTC
"""

import json
import datetime
from datetime import timedelta

from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler(timezone="UTC")


# ── Job 1: Monthly credit resets ──────────────────────────────────────────────

def _run_monthly_resets():
    from database.models import SessionLocal, UserSubscription
    from app.utils import next_reset_date
    db = SessionLocal()
    try:
        now  = datetime.datetime.now(datetime.timezone.utc)
        subs = db.query(UserSubscription).filter(
            UserSubscription.reset_date != None,
            UserSubscription.status.in_(["active", "free"]),
        ).all()
        for sub in subs:
            reset = sub.reset_date
            if reset.tzinfo is None:
                reset = reset.replace(tzinfo=datetime.timezone.utc)
            if now >= reset:
                sub.monthly_used = 0
                sub.reset_date   = next_reset_date(reset)
        db.commit()
    except Exception as e:
        print(f"[reset_job] Error: {e}")
        db.rollback()
    finally:
        db.close()


scheduler.add_job(
    _run_monthly_resets,
    trigger="interval",
    hours=6,
    id="monthly_resets",
    replace_existing=True,
)


# ── Job 2: Weekly reports ─────────────────────────────────────────────────────

def run_weekly_reports():
    """
    Runs daily at 08:00 UTC.
    Sends reports to users whose 7-day cycle is due today based on their
    connected_day. This spreads sends across 7 days and never exceeds
    Resend's 100/day free limit.
    """
    from database.models import SessionLocal, UserSession, WeeklyReport, UserEmailPreferences
    from app.weekly_report import generate_and_send_report, _week_start

    db = SessionLocal()
    try:
        all_sessions = db.query(UserSession).all()
        sent_today   = 0

        for row in all_sessions:
            if sent_today >= 95:
                print("[weekly_report] Hit 95 daily send limit — stopping")
                break

            try:
                user_data  = json.loads(row.user_data_json)
                channel_id = user_data.get("channel", {}).get("channel_id")
                email      = user_data.get("email", "")

                if not channel_id or not email:
                    continue

                # Check unsubscribe preference
                pref = db.query(UserEmailPreferences).filter_by(channel_id=channel_id).first()
                if pref and not pref.weekly_report:
                    continue

                # Skip inactive users (no login/analysis in 14 days)
                analyzed_at = user_data.get("analyzed_at")
                if analyzed_at:
                    try:
                        last_active  = datetime.datetime.fromisoformat(analyzed_at)
                        days_inactive = (datetime.datetime.utcnow() - last_active).days
                        if days_inactive > 14:
                            continue
                    except Exception:
                        pass

                # Determine if report is due today based on connected_day
                connected_day = _get_connected_day(user_data)
                today_weekday = datetime.datetime.utcnow().weekday()
                if connected_day != today_weekday:
                    continue

                # Check if already sent this week
                week_start = _week_start()
                existing = db.query(WeeklyReport).filter_by(
                    channel_id=channel_id,
                    week_start=week_start.isoformat(),
                ).first()
                if existing and existing.email_sent:
                    continue

                # All checks passed — generate and send
                success = generate_and_send_report(channel_id, email, user_data, db)
                if success:
                    sent_today += 1

            except Exception as e:
                print(f"[weekly_report] Error for session {row.session_id[:8]}: {e}")
                continue

        print(f"[weekly_report] Job complete — sent {sent_today} report(s)")
    finally:
        db.close()


def _get_connected_day(user_data: dict) -> int:
    """
    Returns weekday (0=Monday, 6=Sunday) the user first connected.
    Derived from analyzed_at timestamp. Used to spread sends across the week.
    """
    analyzed_at = user_data.get("analyzed_at")
    if analyzed_at:
        try:
            return datetime.datetime.fromisoformat(analyzed_at).weekday()
        except Exception:
            pass
    return 0  # Default: Monday


scheduler.add_job(
    run_weekly_reports,
    trigger="cron",
    hour=8,
    minute=0,
    id="weekly_reports",
    replace_existing=True,
)


# ── One-time backfill ─────────────────────────────────────────────────────────

def _resolve_email(user_data: dict, creds_json_str: str, channel_id: str, db) -> str:
    """
    Find email for an existing session using three fallbacks:
      1. user_data["email"]  — set by this PR on new logins
      2. UserSubscription.email — set by billing webhooks
      3. Google OAuth userinfo — fetched live with stored credentials
    """
    # 1. Already in user_data
    email = user_data.get("email", "")
    if email:
        return email

    # 2. Billing subscription row
    try:
        from database.models import UserSubscription
        sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
        if sub and sub.email:
            return sub.email
    except Exception:
        pass

    # 3. Live Google userinfo call with stored credentials
    try:
        import json as _json
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build as _build
        c     = _json.loads(creds_json_str)
        creds = Credentials(
            token=c["token"],
            refresh_token=c.get("refresh_token"),
            token_uri=c["token_uri"],
            client_id=c["client_id"],
            client_secret=c["client_secret"],
            scopes=c.get("scopes"),
        )
        info  = _build("oauth2", "v2", credentials=creds).userinfo().get().execute()
        return info.get("email", "")
    except Exception as e:
        print(f"[backfill] Email fetch error for {channel_id[:8]}: {e}")
        return ""


def backfill_existing_users():
    """
    Runs ONCE on startup if the weekly_reports table is empty.
    Generates a report immediately for every existing connected user
    who does not yet have one.

    Safe to deploy multiple times — the total_existing > 0 guard
    means it exits immediately on all subsequent starts.
    """
    from database.models import SessionLocal, UserSession, WeeklyReport
    from app.weekly_report import generate_and_send_report

    db = SessionLocal()
    try:
        # Already ran if any reports exist OR if the sentinel session row is present.
        # We use a special sentinel channel_id so an empty-user deploy doesn't
        # re-run the backfill (and hit Google APIs) on every restart.
        total_existing = db.query(WeeklyReport).count()
        from database.models import UserEmailPreferences
        sentinel = db.query(UserEmailPreferences).filter_by(
            channel_id="__backfill_complete__"
        ).first()
        if total_existing > 0 or sentinel:
            return

        print("[backfill] Running first-time backfill for existing users...")
        all_sessions = db.query(UserSession).all()
        processed    = 0

        for row in all_sessions:
            if processed >= 95:
                break
            try:
                user_data  = json.loads(row.user_data_json)
                channel_id = user_data.get("channel", {}).get("channel_id")
                insights   = user_data.get("insights")

                if not channel_id or not insights:
                    continue

                if "fallback mode" in str(insights.get("channelSummary", "")).lower():
                    continue

                email = _resolve_email(user_data, row.creds_json, channel_id, db)
                if not email:
                    print(f"[backfill] No email found for {channel_id[:8]} — skipping")
                    continue

                # Persist email so scheduler and future logins have it
                user_data["email"] = email

                generate_and_send_report(channel_id, email, user_data, db)
                processed += 1
                print(f"[backfill] Report generated for {channel_id[:8]}")

            except Exception as e:
                print(f"[backfill] Error: {e}")
                continue

        # Write sentinel so this never re-runs even if reports table stays empty
        from database.models import UserEmailPreferences
        db.add(UserEmailPreferences(
            channel_id="__backfill_complete__",
            email="__sentinel__",
            weekly_report=False,
        ))
        db.commit()

        print(f"[backfill] Complete — {processed} report(s) generated")
    finally:
        db.close()
