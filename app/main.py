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
from routers import affiliate_routes
from routers import admin_routes

app = FastAPI(title="YTGrowth API", redirect_slashes=False, lifespan=lifespan)

# Session secret must be stable across all workers and restarts — if it isn't,
# the signed session cookie (which carries OAuth PKCE state) becomes unreadable
# on the callback hop and signups silently fail. Loud warning if the env var
# is missing in production so we catch a bad deploy fast.
_SESSION_SECRET = os.environ.get("SESSION_SECRET_KEY", "ytgrowth-secret-change-in-prod")
if _SESSION_SECRET == "ytgrowth-secret-change-in-prod" and os.environ.get("BASE_URL", "").startswith("https://"):
    print("[main] WARNING: SESSION_SECRET_KEY env var is unset in production — using dev fallback. Set it in your host's env config.")

# SessionMiddleware must be added before CORS so the session cookie is available
# on every request, including the OAuth callback redirect.
app.add_middleware(
    SessionMiddleware,
    secret_key=_SESSION_SECRET,
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
app.include_router(affiliate_routes.router,  prefix="/api/affiliate")
app.include_router(admin_routes.router,      prefix="/admin")



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


# ── Milestone medal SVGs ─────────────────────────────────────────────────────
# The milestone email template references hosted SVGs via <img src> because
# Gmail strips inline <svg> tags but renders external SVG images fine.
# We generate the SVG on-demand per category so no build step is needed.
@app.get("/email-assets/medal-{category}.svg")
def medal_svg(category: str):
    from app.email_templates.milestone_unlock import _composite_ribbon_star_svg, CATEGORY_GRADIENT
    from fastapi.responses import Response
    if category not in CATEGORY_GRADIENT:
        category = "subs"
    svg = _composite_ribbon_star_svg(category, 1000)
    return Response(content=svg.strip(), media_type="image/svg+xml",
                    headers={"Cache-Control": "public, max-age=86400"})


@app.get("/email-assets/ytg-logo-mark.svg")
def ytg_logo_mark():
    from fastapi.responses import Response
    svg = (
        '<svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">'
        '<rect width="32" height="32" rx="9" fill="#ff3b30"/>'
        '<path d="M23.2 11.6a2.1 2.1 0 0 0-1.48-1.48C20.55 9.8 16 9.8 16 9.8s-4.55 0-5.72.32A2.1 2.1 0 0 0 8.8 11.6 22 22 0 0 0 8.5 16a22 22 0 0 0 .3 4.4 2.1 2.1 0 0 0 1.48 1.48C11.45 22.2 16 22.2 16 22.2s4.55 0 5.72-.32a2.1 2.1 0 0 0 1.48-1.48A22 22 0 0 0 23.5 16a22 22 0 0 0-.3-4.4z" fill="white"/>'
        '<polygon points="13.5,19 19.5,16 13.5,13" fill="#ff3b30"/>'
        '</svg>'
    )
    return Response(content=svg, media_type="image/svg+xml",
                    headers={"Cache-Control": "public, max-age=86400"})


# ── Per-route SEO meta tags ──────────────────────────────────────────────────
# The frontend is an SPA — every route serves the same index.html. For each
# feature page to rank for its own keyword, we rewrite <title> and the
# description / canonical / OG / Twitter tags in the served HTML based on the
# requested route. The replacement is a simple in-memory string swap done on
# every miss; cheap and avoids any build-time complexity.

DEFAULT_META = {
    "title":       "YTGrowth — YouTube Analytics Tool & AI Channel Audit | VidIQ Alternative",
    "description": "The YouTube growth tool that turns analytics into action. Channel audits, SEO and thumbnail optimization, competitor analysis, and keyword research — a VidIQ alternative, TubeBuddy alternative, and Viewstats alternative built for creators who want a YouTube optimization tool that prescribes the next move, not just dashboards.",
    "path":        "/",
}

ROUTE_META: dict[str, dict[str, str]] = {
    "features/channel-audit": {
        "title":       "AI YouTube Channel Audit Tool — YTGrowth",
        "description": "10-dimension AI audit of your YouTube channel. Traffic sources, retention, CTR, audience, SEO, thumbnails — scored, benchmarked against your niche, with priority fixes.",
    },
    "features/competitor-analysis": {
        "title":       "YouTube Competitor Analysis Tool — YTGrowth",
        "description": "Track up to 10 YouTube competitors. AI surfaces winning title patterns, content gaps, and posting times you can take. Free to start.",
    },
    "features/seo-studio": {
        "title":       "YouTube SEO Studio — Title & Description Optimizer | YTGrowth",
        "description": "Score every YouTube title against search demand, keyword fit, and competitor patterns. Optimize descriptions for discovery. Apply via official YouTube API.",
    },
    "features/thumbnail-iq": {
        "title":       "YouTube Thumbnail Score & Analyzer — YTGrowth",
        "description": "Two-layer thumbnail scoring. Algorithm checks contrast, faces, composition. Vision AI compares against winning thumbnails in your niche.",
    },
    "features/keyword-research": {
        "title":       "Free YouTube Keyword Research Tool — Real Competition Data | YTGrowth",
        "description": "Find low-competition YouTube keywords with real ranking data. Score by competitor channel size, view ceiling, and content freshness. Free creators get one full search per cycle.",
    },
    "features/outliers": {
        "title":       "YouTube Outlier Finder — Find Viral Videos in Your Niche | YTGrowth",
        "description": "Find YouTube videos that hit 5x, 10x, even 50x their channel's normal views — in your exact niche. Outlier score, breakout channels, and thumbnail patterns from the top 8 in 30 seconds.",
    },
    "affiliate": {
        "title":       "YTGrowth Affiliate Program — 30% Recurring Commission",
        "description": "Earn 30% recurring commission on every payment for the lifetime of each customer you refer. 30-day cookie, $50 payout minimum, monthly via PayPal.",
    },
}


def _render_index_with_meta(path: str) -> str:
    """Read index.html and rewrite the title + meta description + canonical
    + og:title + og:description + og:url + twitter:title + twitter:description
    for the requested route. Cached read to avoid hitting disk on every hit.
    """
    global _index_template_cache
    try:
        if "_index_template_cache" not in globals() or _index_template_cache is None:
            _index_template_cache = (DIST / "index.html").read_text(encoding="utf-8")
        html = _index_template_cache
    except Exception:
        return None

    norm = path.strip("/")
    meta = ROUTE_META.get(norm, DEFAULT_META)
    title       = meta["title"]
    description = meta["description"]
    canonical   = f"https://ytgrowth.io/{norm}" if norm else "https://ytgrowth.io/"

    # Replace <title> ... </title>
    import re as _re
    html = _re.sub(r"<title>.*?</title>", f"<title>{title}</title>", html, count=1, flags=_re.S)
    # name="description"
    html = _re.sub(
        r'<meta name="description" content="[^"]*"\s*/?>',
        f'<meta name="description" content="{description}" />',
        html, count=1,
    )
    # canonical
    html = _re.sub(
        r'<link rel="canonical" href="[^"]*"\s*/?>',
        f'<link rel="canonical" href="{canonical}" />',
        html, count=1,
    )
    # og:title / og:description / og:url
    html = _re.sub(
        r'<meta property="og:title"\s+content="[^"]*"\s*/?>',
        f'<meta property="og:title" content="{title}" />',
        html, count=1,
    )
    html = _re.sub(
        r'<meta property="og:description"\s+content="[^"]*"\s*/?>',
        f'<meta property="og:description" content="{description}" />',
        html, count=1,
    )
    html = _re.sub(
        r'<meta property="og:url"\s+content="[^"]*"\s*/?>',
        f'<meta property="og:url" content="{canonical}" />',
        html, count=1,
    )
    # twitter:title / twitter:description
    html = _re.sub(
        r'<meta name="twitter:title"\s+content="[^"]*"\s*/?>',
        f'<meta name="twitter:title" content="{title}" />',
        html, count=1,
    )
    html = _re.sub(
        r'<meta name="twitter:description"\s+content="[^"]*"\s*/?>',
        f'<meta name="twitter:description" content="{description}" />',
        html, count=1,
    )
    return html


_index_template_cache: str | None = None


@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    file = DIST / full_path
    if file.is_file():
        return FileResponse(file)
    # SPA fallback — inject route-specific SEO meta tags.
    from fastapi.responses import HTMLResponse
    rendered = _render_index_with_meta(full_path)
    if rendered is None:
        return FileResponse(DIST / "index.html")
    return HTMLResponse(content=rendered)
