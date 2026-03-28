from fastapi import APIRouter, BackgroundTasks, Request
from fastapi.responses import RedirectResponse, JSONResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import os
import uuid
import json
from app.youtube import get_channel_stats, get_recent_videos, get_analytics, get_video_analytics
from app.insights import analyze_channel

router = APIRouter()

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"

SCOPES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/yt-analytics.readonly",
    "openid"
]

_SESSIONS_DIR = "sessions"

# In-memory cache — rebuilt from disk on demand after a server restart
_pending_flows: dict[str, Flow] = {}
_user_data:     dict[str, dict] = {}
_user_creds:    dict[str, Credentials] = {}


# ── Session persistence helpers ────────────────────────────────────────────────

def _session_path(session_id: str) -> str:
    os.makedirs(_SESSIONS_DIR, exist_ok=True)
    return os.path.join(_SESSIONS_DIR, f"{session_id}.json")


def _persist_session(session_id: str, creds: Credentials, user_data: dict) -> None:
    """Write credentials + user data to disk so they survive server restarts."""
    payload = {
        "creds": {
            "token":         creds.token,
            "refresh_token": creds.refresh_token,
            "token_uri":     creds.token_uri,
            "client_id":     creds.client_id,
            "client_secret": creds.client_secret,
            "scopes":        list(creds.scopes) if creds.scopes else [],
        },
        "user_data": user_data,
    }
    try:
        with open(_session_path(session_id), "w") as f:
            json.dump(payload, f)
    except Exception as e:
        print(f"Session persist error: {e}")


def _restore_session(session_id: str) -> tuple[Credentials | None, dict | None]:
    """
    Load a session from disk into the in-memory cache.
    Called automatically when a request arrives with a valid session_id cookie
    but the server has been restarted and the in-memory dicts are empty.
    """
    path = _session_path(session_id)
    if not os.path.exists(path):
        return None, None
    try:
        with open(path) as f:
            payload = json.load(f)
        c = payload["creds"]
        creds = Credentials(
            token=c["token"],
            refresh_token=c["refresh_token"],
            token_uri=c["token_uri"],
            client_id=c["client_id"],
            client_secret=c["client_secret"],
            scopes=c["scopes"],
        )
        user_data = payload.get("user_data")
        # Warm the in-memory cache so subsequent requests don't hit disk again
        _user_creds[session_id] = creds
        if user_data:
            _user_data[session_id] = user_data
        return creds, user_data
    except Exception as e:
        print(f"Session restore error for {session_id}: {e}")
        return None, None


def get_session(session_id: str | None) -> tuple[dict | None, Credentials | None]:
    """
    Return (user_data, creds) for a session_id.
    Falls back to disk if the in-memory cache is empty (e.g. after a server restart).
    """
    if not session_id:
        return None, None
    data  = _user_data.get(session_id)
    creds = _user_creds.get(session_id)
    if not creds:
        creds, data = _restore_session(session_id)
    return data, creds


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


def _run_analysis_in_background(session_id: str, stats: dict, videos: list, analytics: dict, video_analytics: list):
    """Run AI analysis after login and update session data when done."""
    try:
        insights = analyze_channel(stats, videos, analytics, video_analytics)
        if session_id in _user_data:
            _user_data[session_id]["insights"] = insights
            _persist_session(session_id, _user_creds[session_id], _user_data[session_id])
    except Exception as e:
        print(f"Background analysis error: {e}")


@router.get("/callback")
def callback(request: Request, background_tasks: BackgroundTasks):
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

        _user_creds[session_id] = creds

        user_data = {
            "channel": stats,
            "videos": videos,
            "analytics": analytics,
            "video_analytics": video_analytics,
            "insights": None  # will be populated by background task
        }
        _user_data[session_id] = user_data
        _persist_session(session_id, creds, user_data)

        background_tasks.add_task(
            _run_analysis_in_background,
            session_id, stats, videos, analytics, video_analytics
        )

        return RedirectResponse("http://localhost:5173/dashboard")

    except Exception as e:
        print(f"Callback error: {e}")
        import traceback
        traceback.print_exc()
        return RedirectResponse("http://localhost:5173?error=analysis_failed")


@router.get("/data")
def get_data(request: Request):
    session_id = request.session.get("session_id")
    data, _ = get_session(session_id)
    if not data:
        return JSONResponse({"error": "No data available"}, status_code=404)
    return JSONResponse(data)


@router.get("/logout")
def logout(request: Request):
    session_id = request.session.pop("session_id", None)
    if session_id:
        _user_data.pop(session_id, None)
        _user_creds.pop(session_id, None)
        _pending_flows.pop(session_id, None)
        # Delete the persisted session file so it isn't restored after logout
        try:
            path = _session_path(session_id)
            if os.path.exists(path):
                os.remove(path)
        except Exception:
            pass
    return RedirectResponse("http://localhost:5173")
