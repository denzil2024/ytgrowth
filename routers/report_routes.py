"""Report history and email-preference endpoints."""

import json
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from database.models import SessionLocal, WeeklyReport, UserEmailPreferences, UserSubscription
from routers.auth import get_session
from app.weekly_report import generate_and_send_report, _week_start

router = APIRouter()


@router.get("/history")
def get_report_history(channel_id: str, request: Request):
    session_id = request.session.get("session_id")
    data, _ = get_session(session_id)
    if not data:
        return JSONResponse({"error": "Not logged in"}, status_code=401)

    db = SessionLocal()
    try:
        rows = (
            db.query(WeeklyReport)
            .filter_by(channel_id=channel_id)
            .order_by(WeeklyReport.week_start.desc())
            .limit(4)
            .all()
        )
        result = []
        for row in rows:
            try:
                rd = json.loads(row.report_data)
            except Exception:
                rd = {}
            result.append({
                "id":          row.id,
                "weekStart":   row.week_start,
                "weekEnd":     row.week_end,
                "emailSent":   row.email_sent,
                "createdAt":   row.created_at.isoformat() if row.created_at else None,
                "reportData":  rd,
            })
        return JSONResponse(result)
    finally:
        db.close()


@router.post("/send-test")
async def send_test_report(request: Request):
    session_id = request.session.get("session_id")
    data, _ = get_session(session_id)
    if not data:
        return JSONResponse({"error": "Not logged in"}, status_code=401)

    channel_id = data.get("channel", {}).get("channel_id")
    email      = data.get("email", "")

    if not data.get("insights"):
        return JSONResponse({"error": "No audit data yet"}, status_code=400)

    db = SessionLocal()
    try:
        sent = generate_and_send_report(channel_id, email, data, db)
        if sent:
            return JSONResponse({"ok": True, "sent_to": email})
        return JSONResponse({"error": "Failed to send — check server logs"}, status_code=500)
    finally:
        db.close()


@router.get("/status")
def get_report_status(channel_id: str, request: Request):
    """
    Live status for the Weekly Report tab — drives the plan/credits UI:
      - plan:                  'free' | 'solo' | 'growth' | ...
      - credits_available:     monthly_remaining + pack_balance (0 for free)
      - should_show_credit_notice: paid plan with 0 credits
    """
    session_id = request.session.get("session_id")
    data, _ = get_session(session_id)
    if not data:
        return JSONResponse({"error": "Not logged in"}, status_code=401)

    db = SessionLocal()
    try:
        sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
        plan = (sub.plan if sub else "free") or "free"

        if plan == "free":
            credits_available = 0
        else:
            monthly_remaining = max(0, (sub.monthly_allowance or 0) - (sub.monthly_used or 0))
            pack_balance      = sub.pack_balance or 0
            credits_available = monthly_remaining + pack_balance

        return JSONResponse({
            "plan":                      plan,
            "credits_available":         credits_available,
            "should_show_credit_notice": plan != "free" and credits_available == 0,
        })
    finally:
        db.close()


@router.get("/email-preference")
def get_email_preference(channel_id: str, request: Request):
    """Return current weekly_report email preference for the channel."""
    session_id = request.session.get("session_id")
    data, _ = get_session(session_id)
    if not data:
        return JSONResponse({"error": "Not logged in"}, status_code=401)

    db = SessionLocal()
    try:
        pref = db.query(UserEmailPreferences).filter_by(channel_id=channel_id).first()
        weekly_report = pref.weekly_report if pref else True  # default on
        return JSONResponse({"weekly_report": bool(weekly_report)})
    finally:
        db.close()


@router.post("/email-preference")
async def update_email_preference(request: Request):
    session_id = request.session.get("session_id")
    data, _ = get_session(session_id)
    if not data:
        return JSONResponse({"error": "Not logged in"}, status_code=401)

    body = await request.json()
    channel_id    = body.get("channel_id")
    weekly_report = body.get("weekly_report")

    if not channel_id or weekly_report is None:
        return JSONResponse({"error": "channel_id and weekly_report required"}, status_code=400)

    db = SessionLocal()
    try:
        import datetime
        pref = db.query(UserEmailPreferences).filter_by(channel_id=channel_id).first()
        now = datetime.datetime.utcnow()
        if not pref:
            # Upsert: create a row if none exists (email address may be unknown here,
            # auth flow backfills it later).
            pref = UserEmailPreferences(
                channel_id=channel_id,
                email="",
                weekly_report=weekly_report,
            )
            db.add(pref)
        else:
            pref.weekly_report = weekly_report
        if not weekly_report:
            pref.unsubscribed_at = now
        else:
            pref.resubscribed_at = now
        db.commit()
        return JSONResponse({"success": True, "weekly_report": bool(weekly_report)})
    finally:
        db.close()
