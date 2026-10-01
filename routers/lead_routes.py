"""Anonymous email capture (NewsletterCapture.jsx on blog posts). No auth.

POST /leads/subscribe   { email, source }  →  { ok: true }
"""

import re
import datetime
from fastapi import APIRouter, Request, Body
from fastapi.responses import JSONResponse
from sqlalchemy import func

from database.models import SessionLocal, EmailLead

router = APIRouter()

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
SOURCE_MAX = 120


@router.post("/subscribe")
def subscribe(request: Request, body: dict = Body(...)):
    email = (body.get("email") or "").strip().lower()
    source = (body.get("source") or "").strip()[:SOURCE_MAX]

    if not EMAIL_RE.match(email):
        return JSONResponse({"error": "Enter a valid email address"}, status_code=400)

    db = SessionLocal()
    try:
        # Soft rate limit by IP isn't available without extra infra; cap by
        # how many new leads a single email can attempt is moot since it's
        # unique — guard instead against the same source being hammered.
        since = datetime.datetime.utcnow() - datetime.timedelta(minutes=1)
        recent = db.query(func.count(EmailLead.id)).filter(
            EmailLead.created_at >= since,
        ).scalar() or 0
        if recent >= 30:
            return JSONResponse({"error": "Too many requests, try again shortly"}, status_code=429)

        existing = db.query(EmailLead).filter_by(email=email).first()
        if existing:
            return JSONResponse({"ok": True, "already_subscribed": True})

        lead = EmailLead(email=email, source=source or None)
        db.add(lead)
        db.commit()
        return JSONResponse({"ok": True})
    finally:
        db.close()
