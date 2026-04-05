"""Report history and email-preference endpoints."""

import json
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from database.models import SessionLocal, WeeklyReport, UserEmailPreferences
from routers.auth import get_session

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
        if pref:
            pref.weekly_report = weekly_report
            if not weekly_report:
                pref.unsubscribed_at = datetime.datetime.utcnow()
            else:
                pref.resubscribed_at = datetime.datetime.utcnow()
            db.commit()
        return JSONResponse({"success": True})
    finally:
        db.close()
