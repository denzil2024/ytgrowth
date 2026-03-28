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

app = FastAPI(title="YTGrowth API", redirect_slashes=False)

# SessionMiddleware must be added before CORS so the session cookie is available
# on every request, including the OAuth callback redirect.
app.add_middleware(
    SessionMiddleware,
    secret_key="ytgrowth-secret-change-in-prod",
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

@app.get("/health")
def health():
    import os
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
