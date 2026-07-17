"""
Unified background scheduler.

Jobs:
  1. Monthly credit resets — every 6 hours
  2. Weekly report sends   — daily at 08:00 UTC
"""

import json
import os
import datetime
from datetime import timedelta

from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler(timezone="UTC")


# Master kill-switch for YouTube Data API jobs that run automatically
# (cron + startup). Set YT_QUOTA_PAUSED=1 in env when daily 10K free
# quota is constrained, e.g. while the audited quota extension is under
# review. Cached data still serves from the DB; only the refresh stops.
def _quota_paused() -> bool:
    return os.getenv("YT_QUOTA_PAUSED", "0").strip() == "1"


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


# ── Job: Refresh top-channels cache ───────────────────────────────────────────
# Runs MONTHLY (1st of every month, 05:30 UTC). A full refresh costs
# ~8,400 quota units (14 categories × 6 regions × 100 units per
# search.list). Used to be weekly, which was unsustainable on the 10K
# free daily quota — one weekly burst nearly equalled a whole day's
# budget. Monthly averages to ~280 units/day across 30 days, leaving
# almost the entire daily quota for user features.
#
# Why monthly is fine: these pages back public /youtube-stats/* SEO
# routes. Top creators by subscriber count don't shuffle ranks fast —
# a 30-day cache is no worse than a 7-day one for visual purposes.
# Visitors arrive from search, see the list, leave; they're not
# refreshing daily to spot rank changes. When the Google quota bump
# lands, switch back to weekly for fresher data.
#
# We deliberately do NOT run on startup anymore. Each deploy used to
# burn another 8,400 units, which combined with frequent iteration
# was the primary cause of quota exhaustion.

def _run_top_channels_refresh():
    if _quota_paused():
        print("[top_channels] refresh skipped — YT_QUOTA_PAUSED=1")
        return
    try:
        from app.top_channels import refresh_all
        result = refresh_all()
        print(f"[top_channels] refresh: {result}")
    except Exception as e:
        print(f"[top_channels] refresh job failed: {e}")


scheduler.add_job(
    _run_top_channels_refresh,
    trigger="cron",
    day="1",
    hour=5, minute=30,  # 1st of each month at 05:30 UTC
    id="top_channels_refresh",
    replace_existing=True,
)


# ── Job: Niche search-cache warmer ────────────────────────────────────────────
# Runs nightly at 04:00 UTC. Refreshes the next batch of stale niches from
# app/niche_warmer.NICHE_SEEDS so SEO Studio / Outliers / Thumbnail IQ user
# clicks land in cache at 0 quota cost. Costs ~2,000 units/night (20 niches
# × 100 units) and skips entries refreshed in the last 36h, so steady-state
# burn is well under the daily quota even on the free 10K tier.

def _run_niche_warmer():
    if _quota_paused():
        print("[niche_warmer] run skipped — YT_QUOTA_PAUSED=1")
        return
    try:
        from app.niche_warmer import warm_pool
        warm_pool()
    except Exception as e:
        print(f"[niche_warmer] job failed: {e}")


scheduler.add_job(
    _run_niche_warmer,
    trigger="cron",
    hour=4, minute=0,  # Daily 04:00 UTC — outside the morning quota-reset
    id="niche_warmer",
    replace_existing=True,
)


# ── Job: Search cache cleanup ─────────────────────────────────────────────────
# Weekly sweep of youtube_search_cache. Deletes rows that are >7 days old
# AND have hit_count <= 2. Keeps the table lean over time so junk queries
# (typos, single-use searches) don't accumulate forever, while preserving
# anything with real demand. The warmer keeps high-hit rows fresh anyway,
# so they'll never fall into this filter.

def _run_search_cache_cleanup():
    try:
        from database.models import SessionLocal, YoutubeSearchCache
        db = SessionLocal()
        try:
            cutoff = datetime.datetime.now(datetime.timezone.utc) - timedelta(days=7)
            deleted = (
                db.query(YoutubeSearchCache)
                  .filter(YoutubeSearchCache.cached_at < cutoff)
                  .filter(YoutubeSearchCache.hit_count <= 2)
                  .delete(synchronize_session=False)
            )
            db.commit()
            print(f"[search_cache_cleanup] removed {deleted} stale low-hit rows")
        finally:
            db.close()
    except Exception as e:
        print(f"[search_cache_cleanup] job failed: {e}")


scheduler.add_job(
    _run_search_cache_cleanup,
    trigger="cron",
    day_of_week="mon",
    hour=3, minute=30,  # Mondays 03:30 UTC
    id="search_cache_cleanup",
    replace_existing=True,
)


# ── Job: Daily cache-hit snapshots ────────────────────────────────────────────
# Runs nightly at 23:55 UTC, just before the day ends. Copies the current
# hit_count of every non-zero row in youtube_search_cache and ai_output_cache
# into cache_hit_snapshots (moat item #3, see DATA-STUDIES.md). Turns cache
# demand into a time series for the trend / data-study articles. Pure DB
# copy: zero YouTube quota. Idempotent — re-running replaces today's rows.

def _run_cache_hit_snapshots():
    try:
        from database.models import (
            SessionLocal, CacheHitSnapshot, YoutubeSearchCache, AIOutputCache,
        )
        db = SessionLocal()
        try:
            today = datetime.datetime.now(datetime.timezone.utc).date()
            db.query(CacheHitSnapshot).filter(
                CacheHitSnapshot.snapshot_date == today
            ).delete(synchronize_session=False)

            search_rows = (
                db.query(
                    YoutubeSearchCache.cache_key,
                    YoutubeSearchCache.original_query,
                    YoutubeSearchCache.hit_count,
                )
                .filter(YoutubeSearchCache.hit_count > 0)
                .all()
            )
            ai_rows = (
                db.query(
                    AIOutputCache.input_hash,
                    AIOutputCache.function_name,
                    AIOutputCache.hit_count,
                )
                .filter(AIOutputCache.hit_count > 0)
                .all()
            )
            db.bulk_save_objects(
                [
                    CacheHitSnapshot(
                        snapshot_date=today, source="search",
                        cache_key=k, label=q, hit_count=h,
                    )
                    for k, q, h in search_rows
                ]
                + [
                    CacheHitSnapshot(
                        snapshot_date=today, source="ai",
                        cache_key=k, label=f, hit_count=h,
                    )
                    for k, f, h in ai_rows
                ]
            )
            db.commit()
            print(
                f"[cache_hit_snapshots] wrote {len(search_rows)} search + "
                f"{len(ai_rows)} ai rows for {today}"
            )
        finally:
            db.close()
    except Exception as e:
        print(f"[cache_hit_snapshots] job failed: {e}")


scheduler.add_job(
    _run_cache_hit_snapshots,
    trigger="cron",
    hour=23, minute=55,  # Daily 23:55 UTC — end-of-day totals
    id="cache_hit_snapshots",
    replace_existing=True,
)


# ── Job: Weekly channel metrics snapshots ─────────────────────────────────────
# Sundays 05:00 UTC. Saves every known channel's public stats (subs, views,
# video count) into channel_metric_snapshots instead of overwriting them
# (moat item #3b, see DATA-STUDIES.md). Cost: 1 unit per 50 channels via
# batched channels.list, hard-capped at ~200 units/run by MAX_CHANNELS.

def _run_channel_snapshots():
    if _quota_paused():
        print("[channel_snapshots] run skipped — YT_QUOTA_PAUSED=1")
        return
    try:
        from app.channel_snapshots import snapshot_channels
        snapshot_channels()
    except Exception as e:
        print(f"[channel_snapshots] job failed: {e}")


scheduler.add_job(
    _run_channel_snapshots,
    trigger="cron",
    day_of_week="sun",
    hour=5, minute=0,  # Sundays 05:00 UTC
    id="channel_snapshots",
    replace_existing=True,
)


# ── Job: Weekly video snapshots (upload history + video stats) ────────────────
# Sundays 05:30 UTC, after channel snapshots. Discovers new uploads for
# tracked channels (1 unit/channel) and snapshots views/likes/comments for
# videos under 180 days old (1 unit/50). Worst case ~4,100 units/week at the
# caps in app/video_snapshots.py (moat items #3c/#3d, see DATA-STUDIES.md).

def _run_video_snapshots():
    if _quota_paused():
        print("[video_snapshots] run skipped — YT_QUOTA_PAUSED=1")
        return
    try:
        from app.video_snapshots import run_video_snapshots
        run_video_snapshots()
    except Exception as e:
        print(f"[video_snapshots] job failed: {e}")


scheduler.add_job(
    _run_video_snapshots,
    trigger="cron",
    day_of_week="sun",
    hour=5, minute=30,  # Sundays 05:30 UTC
    id="video_snapshots",
    replace_existing=True,
)


# ── Niche outliers: now lazy per-channel ──────────────────────────────────────
# The dashboard hero card used to read from a shared per-niche cache that this
# job refreshed weekly. We replaced that with a per-channel cache populated
# on-demand by the /dashboard/niche-outlier endpoint, with stale-while-revalidate
# at TTL 7 days. The endpoint kicks its own background refresh, so no scheduler
# job is needed. The legacy weekly job is intentionally removed.


# ── Job 2: Weekly reports ─────────────────────────────────────────────────────

def run_weekly_reports():
    """
    Runs daily at 08:00 UTC.
    Sends reports to users whose 7-day cycle is due today based on their
    connected_day. This spreads sends across 7 days and never exceeds
    Resend's 100/day free limit.

    Paid plans only. Each send deducts 1 credit (NOT refunded on failure —
    Anthropic still bills us; users email support@ytgrowth.io if a report
    didn't arrive). Free plan users are skipped — the dashboard shows an
    upgrade nudge.
    """
    from database.models import SessionLocal, UserSession, WeeklyReport, UserEmailPreferences, UserSubscription
    from app.weekly_report import generate_and_send_report, _week_start
    from app.analysis_gate import check_and_deduct

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

                # Plan gate — paid plans only
                sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
                plan = (sub.plan if sub else "free") or "free"
                if plan == "free":
                    continue

                # Skip inactive users — use UserSession.updated_at as the activity
                # signal (touched on every login and stats refresh). The previous
                # implementation used analyzed_at, which only updates on a full AI
                # audit, so most paid users dropped out of the pool after 14 days.
                if row.updated_at:
                    last_active = row.updated_at
                    if last_active.tzinfo is not None:
                        last_active = last_active.replace(tzinfo=None)
                    days_inactive = (datetime.datetime.utcnow() - last_active).days
                    if days_inactive > 14:
                        continue

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

                # Deduct 1 credit — skip if insufficient (dashboard surfaces the notice)
                gate = check_and_deduct(channel_id)
                if not gate.get("allowed"):
                    print(f"[weekly_report] Skipping {channel_id[:8]} — out of credits")
                    continue

                # Generate + send. Claude already ran once we hit this — credit
                # stays consumed on failure; users email support@ytgrowth.io.
                try:
                    success = generate_and_send_report(channel_id, email, user_data, db)
                except Exception as gen_err:
                    print(f"[weekly_report] Generation failed for {channel_id[:8]}: {gen_err}")
                    continue

                if success:
                    sent_today += 1
                else:
                    print(f"[weekly_report] Send failed for {channel_id[:8]}")

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


# ── Job 3: 3-day re-engagement emails (free users who never returned) ─────────

def _run_reengagement_job():
    """Daily wrapper — finds free signups from 3 days ago who never returned
       and sends them a personalised nudge with their #1 priority action."""
    try:
        from app.reengagement_email import run_reengagement_emails
        run_reengagement_emails()
    except Exception as e:
        print(f"[reengagement_job] Error: {e}")


scheduler.add_job(
    _run_reengagement_job,
    trigger="cron",
    hour=9,
    minute=0,
    id="reengagement_emails",
    replace_existing=True,
)


# ── Job 4: Free-to-paid nurture sequence ──────────────────────────────────────
# Runs hourly. Sends whichever nurture emails are due (7-email series over the
# first 18 days after signup). Rows are enqueued on signup in
# routers/auth.py -> app.nurture_sequence.enqueue_nurture_sequence. The whole
# thing is wrapped in try/except so a bad row or a Resend outage can never
# bubble up and stall the Uvicorn/scheduler thread.

def _run_nurture_job():
    try:
        from app.nurture_sequence import run_nurture_emails
        run_nurture_emails()
    except Exception as e:
        print(f"[nurture_job] Error: {e}")


scheduler.add_job(
    _run_nurture_job,
    trigger="interval",
    hours=1,
    id="nurture_sequence",
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
