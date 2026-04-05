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
