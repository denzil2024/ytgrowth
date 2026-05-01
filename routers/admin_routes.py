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
