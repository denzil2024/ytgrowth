import os
import threading
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
load_dotenv()


@asynccontextmanager
async def lifespan(_):
    from app.scheduler import scheduler, backfill_existing_users
    threading.Thread(target=backfill_existing_users, daemon=True).start()
    scheduler.start()
    print("[scheduler] Jobs started: monthly_resets + weekly_reports")
    yield
    scheduler.shutdown(wait=False)

from routers import auth
from routers import competitor_routes
from routers import seo_routes
from routers import keyword_routes
from routers import billing
from routers import video_ideas_routes
from routers import thumbnail_routes
from routers import email_routes
from routers import report_routes
from routers import channel_routes
from routers import public_routes
from routers import outliers_routes
from routers import autopsy_routes

app = FastAPI(title="YTGrowth API", redirect_slashes=False, lifespan=lifespan)

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

app.include_router(auth.router,             prefix="/auth")
app.include_router(competitor_routes.router, prefix="/competitors")
app.include_router(seo_routes.router,        prefix="/seo")
app.include_router(keyword_routes.router,    prefix="/keywords")
app.include_router(billing.router,           prefix="/billing")
app.include_router(video_ideas_routes.router, prefix="/video-ideas")
app.include_router(thumbnail_routes.router,  prefix="/thumbnail")
app.include_router(email_routes.router)                          # /unsubscribe, /resubscribe
app.include_router(report_routes.router,     prefix="/api/reports")
app.include_router(channel_routes.router,    prefix="/channels")
app.include_router(public_routes.router,     prefix="/api/public")
app.include_router(outliers_routes.router,   prefix="/outliers")
app.include_router(autopsy_routes.router,    prefix="/autopsy")



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

# Static files (logo for emails, etc.)
STATIC_DIR = Path(__file__).parent.parent / "static"
STATIC_DIR.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    file = DIST / full_path
    if file.is_file():
        return FileResponse(file)
    return FileResponse(DIST / "index.html")
