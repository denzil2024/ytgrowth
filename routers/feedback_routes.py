"""Feature request submission + triage.

User-facing endpoints (auth required):
  GET  /feedback                 — share-link entry point: redirects to Settings#feedback
                                   after login (or kicks off OAuth if not yet logged in)
  POST /feedback/submit          — { title, description } → creates a request
  GET  /feedback/mine            — lists the caller's own past submissions

Admin endpoints (ADMIN_EMAILS only):
  GET  /feedback/admin/list      — all requests, newest first, with status counts
  POST /feedback/admin/{id}/status  — { status } cycles new|planned|shipped|declined
"""

import os
from fastapi import APIRouter, Request, Body
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy import desc, func

from database.models import SessionLocal, FeatureRequest, UserAccount
from routers.auth import get_session

router = APIRouter()

VALID_STATUSES = {"new", "planned", "shipped", "declined"}
TITLE_MAX = 120
DESC_MAX  = 2000


def _admin_emails() -> set[str]:
    raw = os.environ.get("ADMIN_EMAILS", "")
    return {e.strip().lower() for e in raw.split(",") if e.strip()}


def _current_user(request: Request) -> tuple[str, str]:
    """Returns (email, display_name). Empty strings if not authed."""
    session_id = request.session.get("session_id")
    user_data, _ = get_session(session_id)
    if not user_data:
        return "", ""
    return (user_data.get("email") or "").lower(), user_data.get("display_name") or ""


def _is_admin(email: str) -> bool:
    return bool(email) and email in _admin_emails()


def _ensure_table():
    """Idempotently ensure feature_requests + admin_note column exist.

    Belt-and-braces: Base.metadata.create_all() at boot handles fresh installs,
    but if the model existed without admin_note in an earlier deploy, this adds
    the column without a manual migration step.
    """
    from sqlalchemy import text
    from database.models import engine
    try:
        with engine.connect() as conn:
            try:
                conn.execute(text("ALTER TABLE feature_requests ADD COLUMN admin_note TEXT"))
                conn.commit()
            except Exception:
                try: conn.rollback()
                except Exception: pass
    except Exception as e:
        print(f"[feedback] _ensure_table skipped: {e}")


# ── Share-link entry point ──────────────────────────────────────────────────
@router.get("")
@router.get("/")
def feedback_share_link(request: Request):
    """Public URL we drop into emails. Drops the user on Settings → Feature
    requests, kicking through OAuth if they aren't logged in yet."""
    target = "/?nav=Settings&focus=feedback"
    email, _ = _current_user(request)
    if email:
        return RedirectResponse(target)
    # Stash the destination so /auth/callback can redirect here after login
    request.session["after_login_redirect"] = target
    return RedirectResponse("/auth/login?utm_source=feedback_link&utm_medium=email")


# ── User submit ─────────────────────────────────────────────────────────────
@router.post("/submit")
def submit(request: Request, body: dict = Body(...)):
    email, display_name = _current_user(request)
    if not email:
        return JSONResponse({"error": "Login required"}, status_code=401)

    title = (body.get("title") or "").strip()
    desc  = (body.get("description") or "").strip()
    if not title or not desc:
        return JSONResponse({"error": "Title and description are required"}, status_code=400)
    if len(title) > TITLE_MAX:
        return JSONResponse({"error": f"Title is too long (max {TITLE_MAX} chars)"}, status_code=400)
    if len(desc) > DESC_MAX:
        return JSONResponse({"error": f"Description is too long (max {DESC_MAX} chars)"}, status_code=400)

    db = SessionLocal()
    try:
        # Pull the canonical display_name off UserAccount in case the session
        # is older than the most recent profile fetch.
        if not display_name:
            acct = db.query(UserAccount).filter_by(email=email).first()
            if acct and acct.display_name:
                display_name = acct.display_name

        # Soft rate limit — 5 requests per email per 24h. Cheap to check.
        import datetime
        since = datetime.datetime.utcnow() - datetime.timedelta(hours=24)
        recent = db.query(func.count(FeatureRequest.id)).filter(
            FeatureRequest.email == email,
            FeatureRequest.created_at >= since,
        ).scalar() or 0
        if recent >= 5:
            return JSONResponse({"error": "You've sent a lot of requests today — try again tomorrow."}, status_code=429)

        fr = FeatureRequest(
            email=email,
            display_name=display_name or None,
            title=title,
            description=desc,
            status="new",
        )
        db.add(fr)
        db.commit()
        db.refresh(fr)
        return JSONResponse({
            "ok": True,
            "id": fr.id,
            "status": fr.status,
            "created_at": fr.created_at.isoformat() if fr.created_at else None,
        })
    finally:
        db.close()


# ── User's own submissions ──────────────────────────────────────────────────
@router.get("/mine")
def mine(request: Request):
    email, _ = _current_user(request)
    if not email:
        return JSONResponse({"error": "Login required"}, status_code=401)

    db = SessionLocal()
    try:
        rows = (
            db.query(FeatureRequest)
              .filter_by(email=email)
              .order_by(desc(FeatureRequest.created_at))
              .limit(20)
              .all()
        )
        out = [{
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        } for r in rows]
        return JSONResponse({"requests": out})
    finally:
        db.close()


# ── Admin: list all ─────────────────────────────────────────────────────────
@router.get("/admin/list")
def admin_list(request: Request):
    _ensure_table()
    email, _ = _current_user(request)
    if not _is_admin(email):
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    db = SessionLocal()
    try:
        rows = (
            db.query(FeatureRequest)
              .order_by(desc(FeatureRequest.created_at))
              .limit(200)
              .all()
        )
        out = [{
            "id": r.id,
            "email": r.email,
            "display_name": r.display_name or "",
            "title": r.title,
            "description": r.description,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        } for r in rows]

        # Status totals — for the admin header chips.
        counts = {s: 0 for s in VALID_STATUSES}
        for row in rows:
            if row.status in counts:
                counts[row.status] += 1

        return JSONResponse({"requests": out, "counts": counts})
    finally:
        db.close()


# ── Admin: cycle status ─────────────────────────────────────────────────────
@router.post("/admin/{request_id}/status")
def admin_set_status(request_id: int, request: Request, body: dict = Body(...)):
    email, _ = _current_user(request)
    if not _is_admin(email):
        return JSONResponse({"error": "Forbidden"}, status_code=403)

    new_status = (body.get("status") or "").strip().lower()
    if new_status not in VALID_STATUSES:
        return JSONResponse({"error": f"Status must be one of {sorted(VALID_STATUSES)}"}, status_code=400)

    db = SessionLocal()
    try:
        row = db.query(FeatureRequest).filter_by(id=request_id).first()
        if not row:
            return JSONResponse({"error": "Not found"}, status_code=404)
        row.status = new_status
        db.commit()
        return JSONResponse({"ok": True, "id": row.id, "status": row.status})
    finally:
        db.close()
