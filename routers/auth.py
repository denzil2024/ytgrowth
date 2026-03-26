from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse, JSONResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import os
import uuid
from app.youtube import get_channel_stats, get_recent_videos, get_analytics, get_video_analytics
from app.insights import analyze_channel

router = APIRouter()

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"

SCOPES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/yt-analytics.readonly",
    "openid"
]

# Per-session stores — keyed by session_id set in the browser cookie
_pending_flows: dict[str, Flow] = {}
_user_data:     dict[str, dict] = {}
_user_creds:    dict[str, Credentials] = {}


def get_flow():
    flow = Flow.from_client_secrets_file(
        "client_secret.json",
        scopes=SCOPES,
        redirect_uri="http://localhost:8000/auth/callback"
    )
    flow.code_verifier = None
    return flow


@router.get("/login")
def login(request: Request):
    # Assign a session ID if the user doesn't have one yet
    if "session_id" not in request.session:
        request.session["session_id"] = str(uuid.uuid4())

    session_id = request.session["session_id"]

    flow = get_flow()
    auth_url, state = flow.authorization_url(
        prompt="consent",
        access_type="offline"
    )

    _pending_flows[session_id] = {"flow": flow, "state": state}
    return RedirectResponse(auth_url)


@router.get("/callback")
def callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        return RedirectResponse("http://localhost:5173?error=no_code")

    session_id = request.session.get("session_id")
    pending = _pending_flows.pop(session_id, None) if session_id else None

    if not pending:
        return RedirectResponse("http://localhost:5173?error=session_expired")

    try:
        flow = pending["flow"]
        flow.fetch_token(code=code)
        credentials = flow.credentials

        creds = Credentials(
            token=credentials.token,
            refresh_token=credentials.refresh_token,
            token_uri=credentials.token_uri,
            client_id=credentials.client_id,
            client_secret=credentials.client_secret,
            scopes=credentials.scopes
        )

        stats = get_channel_stats(creds)
        if not stats:
            return RedirectResponse("http://localhost:5173?error=no_channel")

        videos = get_recent_videos(creds)
        analytics = get_analytics(creds, stats["channel_id"])
        video_analytics = get_video_analytics(creds, stats["channel_id"])
        insights = analyze_channel(stats, videos, analytics, video_analytics)

        _user_creds[session_id] = creds

        _user_data[session_id] = {
            "channel": stats,
            "videos": videos,
            "analytics": analytics,
            "video_analytics": video_analytics,
            "insights": insights
        }

        return RedirectResponse("http://localhost:5173/dashboard")

    except Exception as e:
        print(f"Callback error: {e}")
        import traceback
        traceback.print_exc()
        return RedirectResponse("http://localhost:5173?error=analysis_failed")


@router.get("/data")
def get_data(request: Request):
    session_id = request.session.get("session_id")
    if not session_id or session_id not in _user_data:
        return JSONResponse({"error": "No data available"}, status_code=404)
    return JSONResponse(_user_data[session_id])


@router.get("/logout")
def logout(request: Request):
    session_id = request.session.pop("session_id", None)
    if session_id:
        _user_data.pop(session_id, None)
        _user_creds.pop(session_id, None)
        _pending_flows.pop(session_id, None)
    return RedirectResponse("http://localhost:5173")
