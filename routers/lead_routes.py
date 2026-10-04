"""Anonymous email capture (NewsletterCapture.jsx on blog posts). No auth.

POST /leads/subscribe   { email, source }  →  { ok: true }
"""

import os
import re
import datetime
import requests
from fastapi import APIRouter, BackgroundTasks, Request, Body
from fastapi.responses import JSONResponse
from sqlalchemy import func

from database.models import SessionLocal, EmailLead

router = APIRouter()

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
SOURCE_MAX = 120

BEEHIIV_API_KEY = os.environ.get("BEEHIIV_API_KEY")
BEEHIIV_PUBLICATION_ID = os.environ.get("BEEHIIV_PUBLICATION_ID")


def _sync_to_beehiiv(email: str, source: str):
    """Best-effort push to beehiiv. Never raises — a beehiiv outage or a
    missing key must not block the local signup, which is the source of
    truth (email_leads). Logs on failure so a later check can tell real
    beehiiv errors apart from "not configured yet"."""
    if not BEEHIIV_API_KEY or not BEEHIIV_PUBLICATION_ID:
        return
    try:
        requests.post(
            f"https://api.beehiiv.com/v2/publications/{BEEHIIV_PUBLICATION_ID}/subscriptions",
            headers={
                "Authorization": f"Bearer {BEEHIIV_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "email": email,
                "reactivate_existing": False,
                "send_welcome_email": True,
                "utm_source": "ytgrowth.io",
                "utm_medium": "newsletter_capture",
                "custom_fields": [{"name": "source", "value": source or ""}],
            },
            timeout=8,
        )
    except Exception as e:
        print(f"[lead_routes] beehiiv sync failed for {email}: {e}")


@router.post("/subscribe")
def subscribe(request: Request, background_tasks: BackgroundTasks, body: dict = Body(...)):
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
        # email_leads is the source of truth; beehiiv sync runs after the
        # response so a slow/down beehiiv API never delays the visitor.
        background_tasks.add_task(_sync_to_beehiiv, email, source)
        return JSONResponse({"ok": True})
    finally:
        db.close()
