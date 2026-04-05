import os
import datetime
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
load_dotenv()

from routers import auth
from routers import competitor_routes
from routers import seo_routes
from routers import keyword_routes
from routers import billing
from routers import video_ideas_routes
from routers import thumbnail_routes

app = FastAPI(title="YTGrowth API", redirect_slashes=False)

# SessionMiddleware must be added before CORS so the session cookie is available
# on every request, including the OAuth callback redirect.
app.add_middleware(
    SessionMiddleware,
    secret_key=os.environ.get("SESSION_SECRET_KEY", "ytgrowth-secret-change-in-prod"),
    session_cookie="ytg_session",
    max_age=60 * 60 * 24 * 7,  # 7 days
    same_site="lax",
    https_only=False,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://ytgrowth.io",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(competitor_routes.router, prefix="/competitors")
app.include_router(seo_routes.router, prefix="/seo")
app.include_router(keyword_routes.router, prefix="/keywords")
app.include_router(billing.router, prefix="/billing")
app.include_router(video_ideas_routes.router, prefix="/video-ideas")
app.include_router(thumbnail_routes.router, prefix="/thumbnail")


# ── Monthly reset job (runs in background thread every 6 hours) ───────────────
def _run_monthly_resets():
    from database.models import SessionLocal, UserSubscription
    from app.utils import next_reset_date
    db = SessionLocal()
    try:
        now = datetime.datetime.now(datetime.timezone.utc)
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
                sub.reset_date = next_reset_date(reset)
        db.commit()
    except Exception as e:
        print(f"[reset_job] Error: {e}")
        db.rollback()
    finally:
        db.close()

try:
    from apscheduler.schedulers.background import BackgroundScheduler
    _scheduler = BackgroundScheduler()
    _scheduler.add_job(_run_monthly_resets, "interval", hours=6)
    _scheduler.start()
    print("[scheduler] Monthly reset job started")
except ImportError:
    print("[scheduler] apscheduler not installed — monthly resets disabled")


@app.get("/health")
def health():
    from database.models import SessionLocal
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    try:
        db = SessionLocal()
        db.execute(__import__("sqlalchemy").text("SELECT 1"))
        db.close()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {e}"
    return {
        "status": "ok",
        "anthropic_key_prefix": key[:12] if key else "NOT SET",
        "db": db_status
    }

# Serve React frontend — must be after all API routes
DIST = Path(__file__).parent.parent / "frontend" / "dist"

app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")

@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    file = DIST / full_path
    if file.is_file():
        return FileResponse(file)
    return FileResponse(DIST / "index.html")
