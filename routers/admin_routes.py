"""Internal admin: at-a-glance counts + recent signups + top users.

Gated by ADMIN_EMAILS (comma-separated env var). Returns 403 to anyone whose
session email isn't on that list. No state mutations — read-only summary.
"""

import os
import datetime
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from sqlalchemy import func, desc

from database.models import (
    SessionLocal,
    UserAccount,
    UserSubscription,
    ChannelRegistry,
)
from routers.auth import get_session

router = APIRouter()


def _admin_emails() -> set[str]:
    raw = os.environ.get("ADMIN_EMAILS", "")
    return {e.strip().lower() for e in raw.split(",") if e.strip()}


def _is_admin(request: Request) -> tuple[bool, str]:
    session_id = request.session.get("session_id")
    user_data, _ = get_session(session_id)
    if not user_data:
        return False, ""
    email = (user_data.get("email") or "").lower()
    if not email:
        return False, ""
    return email in _admin_emails(), email


@router.get("/me")
def admin_me(request: Request):
    is_admin, _ = _is_admin(request)
    return JSONResponse({"is_admin": is_admin})


@router.get("/overview")
def admin_overview(request: Request):
    is_admin, _ = _is_admin(request)
    if not is_admin:
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    try:
        return _build_overview()
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print(f"[admin/overview] error: {e}\n{tb}")
        return JSONResponse({"error": f"{type(e).__name__}: {e}"}, status_code=500)


def _ensure_utm_columns():
    """Idempotently add the utm_* columns to user_accounts.

    Belt-and-braces: the boot-time migration list does this too, but Postgres
    will silently skip the rest of the migration list if any earlier statement
    aborts the transaction. This makes the admin endpoint self-healing on the
    first hit even if the boot migration failed.
    """
    from sqlalchemy import text
    from database.models import engine
    cols = ("utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term")
    try:
        with engine.connect() as conn:
            for c in cols:
                try:
                    conn.execute(text(f"ALTER TABLE user_accounts ADD COLUMN {c} TEXT"))
                    conn.commit()
                except Exception:
                    try: conn.rollback()
                    except Exception: pass
    except Exception as e:
        print(f"[admin] _ensure_utm_columns skipped: {e}")


def _build_overview():
    _ensure_utm_columns()
    db = SessionLocal()
    try:
        now             = datetime.datetime.utcnow()
        week_ago        = now - datetime.timedelta(days=7)
        prev_week_start = now - datetime.timedelta(days=14)

        # ── Headline counts ──────────────────────────────────────────────
        total_users = db.query(func.count(UserAccount.email)).scalar() or 0

        signups_7d = db.query(func.count(UserAccount.email)).filter(
            UserAccount.created_at >= week_ago,
        ).scalar() or 0

        signups_prev_7d = db.query(func.count(UserAccount.email)).filter(
            UserAccount.created_at >= prev_week_start,
            UserAccount.created_at <  week_ago,
        ).scalar() or 0

        # Paid = any subscription whose plan isn't free / pack / null. Count distinct
        # owner emails so multi-channel paid users aren't double-counted.
        paid_subs = db.query(UserSubscription).filter(
            UserSubscription.plan.notin_(["free", "pack", None]),
            UserSubscription.status == "active",
        ).all()
        paid_emails: set[str] = set()
        for sub in paid_subs:
            ch = db.query(ChannelRegistry).filter_by(channel_id=sub.channel_id).first()
            if ch and ch.owner_email:
                paid_emails.add(ch.owner_email.lower())
        paid_users = len(paid_emails)
        free_users = max(0, total_users - paid_users)
        conv_pct   = round(paid_users / total_users * 100, 1) if total_users else 0.0

        # Active = channels with last_audit_at in the last 7 days. Counts
        # distinct owner emails to match the user-centric framing.
        active_channels = db.query(ChannelRegistry).filter(
            ChannelRegistry.last_audit_at >= week_ago,
            ChannelRegistry.is_active == True,  # noqa: E712
        ).all()
        active_emails = {c.owner_email.lower() for c in active_channels if c.owner_email}
        active_7d     = len(active_emails)

        # ── Plan breakdown (subscriptions table) ─────────────────────────
        plan_rows = (
            db.query(UserSubscription.plan, func.count(UserSubscription.channel_id))
              .group_by(UserSubscription.plan)
              .all()
        )
        plan_breakdown = [{"plan": p or "free", "count": int(c)} for p, c in plan_rows]
        plan_breakdown.sort(key=lambda r: -r["count"])

        # ── UTM source breakdown (account-level) ─────────────────────────
        utm_rows = (
            db.query(UserAccount.utm_source, func.count(UserAccount.email))
              .filter(UserAccount.utm_source.isnot(None))
              .filter(UserAccount.utm_source != "")
              .group_by(UserAccount.utm_source)
              .all()
        )
        utm_breakdown = [{"source": s, "count": int(c)} for s, c in utm_rows]
        utm_breakdown.sort(key=lambda r: -r["count"])

        direct_count = db.query(func.count(UserAccount.email)).filter(
            (UserAccount.utm_source.is_(None)) | (UserAccount.utm_source == "")
        ).scalar() or 0
        if direct_count:
            utm_breakdown.append({"source": "(direct)", "count": int(direct_count)})

        # ── Recent signups ───────────────────────────────────────────────
        recent_rows = (
            db.query(UserAccount)
              .order_by(desc(UserAccount.created_at))
              .limit(40)
              .all()
        )
        recent_signups = []
        for ua in recent_rows:
            ch = db.query(ChannelRegistry).filter_by(
                owner_email=ua.email, is_active=True,
            ).order_by(ChannelRegistry.connected_at.asc()).first()
            sub = None
            if ch:
                sub = db.query(UserSubscription).filter_by(channel_id=ch.channel_id).first()
            recent_signups.append({
                "email":             ua.email,
                "display_name":      ua.display_name or "",
                "profile_picture":   ua.profile_picture or "",
                "channel_name":      ch.channel_name      if ch else "",
                "channel_thumbnail": ch.channel_thumbnail if ch else "",
                "subscribers":       int(ch.subscribers or 0) if ch else 0,
                "plan":              (sub.plan if sub else "free") or "free",
                "monthly_used":      int(sub.monthly_used or 0)      if sub else 0,
                "monthly_allowance": int(sub.monthly_allowance or 0) if sub else 0,
                "utm_source":        ua.utm_source or "",
                "utm_medium":        ua.utm_medium or "",
                "utm_campaign":      ua.utm_campaign or "",
                "created_at":        ua.created_at.isoformat() if ua.created_at else None,
            })

        # ── Top users by current-month usage ─────────────────────────────
        top_subs = (
            db.query(UserSubscription)
              .filter(UserSubscription.monthly_used > 0)
              .order_by(desc(UserSubscription.monthly_used))
              .limit(15)
              .all()
        )
        top_users = []
        for sub in top_subs:
            ch = db.query(ChannelRegistry).filter_by(channel_id=sub.channel_id).first()
            if not ch:
                continue
            top_users.append({
                "channel_id":        sub.channel_id,
                "channel_name":      ch.channel_name      or "",
                "channel_thumbnail": ch.channel_thumbnail or "",
                "subscribers":       int(ch.subscribers or 0),
                "owner_email":       ch.owner_email       or "",
                "plan":              sub.plan or "free",
                "monthly_used":      int(sub.monthly_used or 0),
                "monthly_allowance": int(sub.monthly_allowance or 0),
                "last_audit_at":     ch.last_audit_at.isoformat() if ch.last_audit_at else None,
            })

        return JSONResponse({
            "stats": {
                "total_users":      int(total_users),
                "paid_users":       int(paid_users),
                "free_users":       int(free_users),
                "conversion_pct":   conv_pct,
                "signups_7d":       int(signups_7d),
                "signups_prev_7d":  int(signups_prev_7d),
                "signups_trend":    int(signups_7d) - int(signups_prev_7d),
                "active_7d":        int(active_7d),
            },
            "plan_breakdown": plan_breakdown,
            "utm_breakdown":  utm_breakdown,
            "recent_signups": recent_signups,
            "top_users":      top_users,
            "generated_at":   now.isoformat(),
        })
    finally:
        db.close()


# ── Email send tester (admin-only) ──────────────────────────────────────────
# Hit this from a browser after logging in as an admin to send yourself a
# real welcome email through the live Resend integration. Useful for QA on
# template changes without needing to create a brand-new Google account each
# time.
#
#   GET /admin/test-welcome?to=you@example.com&kind=immediate
#   GET /admin/test-welcome?to=you@example.com&kind=audit
@router.get("/test-welcome")
def admin_test_welcome(request: Request, to: str = "", kind: str = "immediate"):
    is_admin, admin_email = _is_admin(request)
    if not is_admin:
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    target = (to or admin_email or "").strip()
    if not target or "@" not in target:
        return JSONResponse({"error": "missing or invalid 'to' query param"}, status_code=400)

    try:
        if kind == "immediate":
            from app.welcome_immediate import send_welcome_immediate
            send_welcome_immediate(
                email=target,
                display_name="Denzil Otieno",
                channel_id=None,
                channel_name="YTGrowth Test Channel",
            )
            return JSONResponse({"ok": True, "kind": "immediate", "to": target})

        if kind == "audit":
            # Inline send so we can use a synthetic top_action and bypass the
            # idempotency guard in app/welcome_email.py (which is tied to a
            # real channel_id). Mirrors the same sender for a faithful test.
            from app.email_templates.welcome import build_email
            import resend as _resend
            _resend.api_key = os.environ.get("RESEND_API_KEY", "")
            base_url = os.environ.get("BASE_URL", "https://ytgrowth.io")
            text, html = build_email(
                first_name="Denzil",
                channel_name="YTGrowth Test Channel",
                top_action="Move your Tuesday upload to before 10am - your last 3 best weeks all started that way.",
                dashboard_url=f"{base_url}/dashboard",
                unsubscribe_url=f"{base_url}/email/unsubscribe?token=test",
            )
            _resend.Emails.send({
                "from":     "Denzil from YTGrowth <hello@ytgrowth.io>",
                "to":       [target],
                "subject":  "Your YTGrowth audit is ready",
                "html":     html,
                "text":     text,
                "reply_to": "hello@ytgrowth.io",
            })
            return JSONResponse({"ok": True, "kind": "audit", "to": target})

        if kind == "weekly":
            from app.email_templates.weekly_report import build_email
            import resend as _resend
            _resend.api_key = os.environ.get("RESEND_API_KEY", "")
            base_url = os.environ.get("BASE_URL", "https://ytgrowth.io")
            sample = {
                "channelName":       "YTGrowth Test Channel",
                "reportTitle":       "Your week on YouTube — May 3",
                "weeklySummary":     "Views were up this week, driven mostly by your Tuesday upload which is trending in the top 10% of your niche. Posting cadence stayed consistent at 3 videos.",
                "biggestWin":        "Your tutorial on keyword research hit 8,200 views in 48 hours — 4x your weekly average. CTR was 6.1%, which is well above your channel baseline of 3.8%.",
                "watchOut":          "Subscriber growth slowed compared to last week despite higher views. This usually means your CTAs are being skipped. Worth reviewing the end screen on your last 3 uploads.",
                "priorityAction":    "Add a verbal CTA at the 40% mark of your next video. Your retention data shows viewers are dropping off at 38% before your current end-screen CTA appears.",
                "motivationalClose": "Solid week overall. The data is pointing in the right direction. Keep going.",
                "metrics": {
                    "subscribers": {"value": 12400, "delta": 320,  "direction": "up"},
                    "weeklyViews": {"value": 48200, "delta": 1200, "direction": "up"},
                    "avgCtr":      {"value": 4.2,   "delta": 0.3,  "direction": "up"},
                    "channelScore":{"value": 71,    "delta": 2,    "direction": "up"},
                },
            }
            text, html = build_email(
                sample, "test-token", base_url
            )
            _resend.Emails.send({
                "from":     "Denzil from YTGrowth <reports@ytgrowth.io>",
                "to":       [target],
                "subject":  sample["reportTitle"],
                "html":     html,
                "text":     text,
                "reply_to": "hello@ytgrowth.io",
            })
            return JSONResponse({"ok": True, "kind": "weekly", "to": target})

        if kind == "reengagement":
            from app.email_templates.reengagement import build_email
            import resend as _resend
            _resend.api_key = os.environ.get("RESEND_API_KEY", "")
            base_url = os.environ.get("BASE_URL", "https://ytgrowth.io")
            text, html = build_email(
                first_name="Denzil",
                channel_name="YTGrowth Test Channel",
                top_action="Move your Tuesday upload to before 10am - your last 3 best weeks all started that way.",
                priority_actions_count=5,
                dashboard_url=f"{base_url}/dashboard",
                unsubscribe_url=f"{base_url}/email/unsubscribe?token=test",
            )
            _resend.Emails.send({
                "from":     "Denzil from YTGrowth <hello@ytgrowth.io>",
                "to":       [target],
                "subject":  "Your channel insights are waiting",
                "html":     html,
                "text":     text,
                "reply_to": "hello@ytgrowth.io",
            })
            return JSONResponse({"ok": True, "kind": "reengagement", "to": target})

        if kind == "milestone":
            from app.email_templates.milestone_unlock import build_email_html, _fmt_num
            import resend as _resend
            import datetime
            _resend.api_key = os.environ.get("RESEND_API_KEY", "")
            base_url = os.environ.get("BASE_URL", "https://ytgrowth.io")
            # Sample: 1,000 subscribers milestone
            category = request.query_params.get("category", "subs")
            tier     = int(request.query_params.get("tier", "1000"))
            today    = datetime.datetime.utcnow().strftime("%-d %B %Y") if hasattr(datetime.datetime, "strftime") else "3 May 2026"
            html = build_email_html(
                channel_name="YTGrowth Test Channel",
                channel_thumbnail=None,
                category=category,
                tier=tier,
                achieved_date=today,
                dashboard_url=f"{base_url}/dashboard",
                unsubscribe_url=f"{base_url}/email/unsubscribe?token=test",
                base_url=base_url,
            )
            verb_map = {"subs": "subscribers", "views": "total views", "watch_hours": "watch hours", "uploads": "uploads"}
            verb = verb_map.get(category, "milestones")
            _resend.Emails.send({
                "from":    "YTGrowth <milestones@ytgrowth.io>",
                "to":      [target],
                "subject": f"You just hit {_fmt_num(tier)} {verb} on YouTube",
                "html":    html,
            })
            return JSONResponse({"ok": True, "kind": "milestone", "category": category, "tier": tier, "to": target})

        return JSONResponse({"error": "kind must be 'immediate', 'audit', 'weekly', 'reengagement', or 'milestone'"}, status_code=400)
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print(f"[admin/test-welcome] error: {e}\n{tb}")
        return JSONResponse({"error": f"{type(e).__name__}: {e}"}, status_code=500)
