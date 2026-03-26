from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
load_dotenv()

from routers import auth
from routers import competitor_routes
from routers import seo_routes

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
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(competitor_routes.router, prefix="/competitors")
app.include_router(seo_routes.router, prefix="/seo")

@app.get("/")
def root():
    return {"message": "YTGrowth API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}
