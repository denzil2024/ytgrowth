"""Unsubscribe / resubscribe endpoints — no auth required."""

import os
import datetime
from fastapi import APIRouter
from fastapi.responses import HTMLResponse

from database.models import SessionLocal, UserEmailPreferences

router  = APIRouter()
BASE_URL = os.environ.get("BASE_URL", "http://localhost:5173")

_BRAND = """
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f4f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #fff; border-radius: 12px; padding: 48px 40px; max-width: 420px; width: 100%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; }
    .logo { font-size: 18px; font-weight: 700; color: #111114; margin-bottom: 32px; }
    .logo span { color: #e5251b; }
    h1 { font-size: 22px; font-weight: 700; color: #111114; margin-bottom: 12px; letter-spacing: -0.4px; }
    p  { font-size: 14px; color: #6b7280; line-height: 1.7; margin-bottom: 24px; }
    a.btn { display: inline-block; background: #e5251b; color: #fff; border-radius: 8px;
            padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; }
    a.btn:hover { opacity: 0.9; }
  </style>
"""


@router.get("/unsubscribe", response_class=HTMLResponse)
def unsubscribe(token: str = ""):
    if not token:
        return HTMLResponse(_page("Invalid link", "This unsubscribe link is invalid or has expired."), status_code=400)

    db = SessionLocal()
    try:
        pref = db.query(UserEmailPreferences).filter_by(unsubscribe_token=token).first()
        if not pref:
            return HTMLResponse(_page("Invalid link", "This unsubscribe link is invalid or has expired."), status_code=404)

        pref.weekly_report    = False
        pref.unsubscribed_at  = datetime.datetime.utcnow()
        db.commit()

        body = (
            "You won't receive weekly reports from YTGrowth anymore. "
            "You can resubscribe anytime from your Settings in the app."
        )
        return HTMLResponse(_page("You've been unsubscribed", body, show_btn=True))
    finally:
        db.close()


@router.get("/resubscribe", response_class=HTMLResponse)
def resubscribe(token: str = ""):
    if not token:
        return HTMLResponse(_page("Invalid link", "This resubscribe link is invalid or has expired."), status_code=400)

    db = SessionLocal()
    try:
        pref = db.query(UserEmailPreferences).filter_by(unsubscribe_token=token).first()
        if not pref:
            return HTMLResponse(_page("Invalid link", "This link is invalid or has expired."), status_code=404)

        pref.weekly_report     = True
        pref.resubscribed_at   = datetime.datetime.utcnow()
        db.commit()

        body = "You're back on the list. Weekly reports will resume on your next scheduled send day."
        return HTMLResponse(_page("You're resubscribed", body, show_btn=True))
    finally:
        db.close()


def _page(heading: str, body: str, show_btn: bool = False) -> str:
    btn = f'<a class="btn" href="{BASE_URL}">Go to YTGrowth</a>' if show_btn else ""
    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{heading} — YTGrowth</title>
{_BRAND}
</head>
<body>
  <div class="card">
    <div class="logo">YT<span>G</span>rowth</div>
    <h1>{heading}</h1>
    <p>{body}</p>
    {btn}
  </div>
</body>
</html>"""
