from fastapi import APIRouter, BackgroundTasks, Request
from fastapi.responses import RedirectResponse, JSONResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import os
import uuid
import json
from app.youtube import get_channel_stats, get_recent_videos, get_analytics, get_video_analytics
from app.insights import analyze_channel
from database.models import UserSession, SessionLocal

router = APIRouter()

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"

BASE_URL = os.environ.get("BASE_URL", "http://localhost:5173")
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")

SCOPES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/yt-analytics.readonly",
    "openid"
]

# In-memory cache — rebuilt from DB on demand after a server restart
_pending_flows: dict[str, Flow] = {}
_user_data:     dict[str, dict] = {}
_user_creds:    dict[str, Credentials] = {}


# ── Session persistence helpers ────────────────────────────────────────────────

def _persist_session(session_id: str, creds: Credentials, user_data: dict) -> None:
    """Write credentials + user data to the database."""
    creds_payload = {
        "token":         creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri":     creds.token_uri,
        "client_id":     creds.client_id,
        "client_secret": creds.client_secret,
        "scopes":        list(creds.scopes) if creds.scopes else [],
    }
    try:
        db = SessionLocal()
        row = db.query(UserSession).filter_by(session_id=session_id).first()
        if row:
            row.creds_json     = json.dumps(creds_payload)
            row.user_data_json = json.dumps(user_data)
        else:
            db.add(UserSession(
                session_id=session_id,
                creds_json=json.dumps(creds_payload),
                user_data_json=json.dumps(user_data),
            ))
        db.commit()
    except Exception as e:
        print(f"Session persist error: {e}")
    finally:
        db.close()


def _restore_session(session_id: str) -> tuple[Credentials | None, dict | None]:
    """Load a session from the database into the in-memory cache."""
    try:
        db = SessionLocal()
        row = db.query(UserSession).filter_by(session_id=session_id).first()
        if not row:
            return None, None
        c = json.loads(row.creds_json)
        creds = Credentials(
            token=c["token"],
            refresh_token=c["refresh_token"],
            token_uri=c["token_uri"],
            client_id=c["client_id"],
            client_secret=c["client_secret"],
            scopes=c["scopes"],
        )
        user_data = json.loads(row.user_data_json)
        _user_creds[session_id] = creds
        if user_data:
            _user_data[session_id] = user_data
        return creds, user_data
    except Exception as e:
        print(f"Session restore error for {session_id}: {e}")
        return None, None
    finally:
        db.close()


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
    client_secret_env = os.environ.get("GOOGLE_CLIENT_SECRET_JSON")
    if client_secret_env:
        import tempfile
        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
            f.write(client_secret_env)
            tmp_path = f.name
        flow = Flow.from_client_secrets_file(
            tmp_path,
            scopes=SCOPES,
            redirect_uri=f"{BACKEND_URL}/auth/callback"
        )
        os.unlink(tmp_path)
    else:
        flow = Flow.from_client_secrets_file(
            "client_secret.json",
            scopes=SCOPES,
            redirect_uri=f"{BACKEND_URL}/auth/callback"
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
    import datetime
    try:
        insights = analyze_channel(stats, videos, analytics, video_analytics)
        if session_id in _user_data:
            _user_data[session_id]["insights"] = insights
            _user_data[session_id]["analyzed_at"] = datetime.datetime.utcnow().isoformat()
            _persist_session(session_id, _user_creds[session_id], _user_data[session_id])
    except Exception as e:
        print(f"Background analysis error: {e}")


@router.get("/callback")
def callback(request: Request, background_tasks: BackgroundTasks):
    code = request.query_params.get("code")
    if not code:
        return RedirectResponse(f"{BASE_URL}?error=no_code")

    session_id = request.session.get("session_id")
    pending = _pending_flows.pop(session_id, None) if session_id else None

    if not pending:
        return RedirectResponse(f"{BASE_URL}?error=session_expired")

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
            return RedirectResponse(f"{BASE_URL}?error=no_channel")

        videos = get_recent_videos(creds)
        analytics = get_analytics(creds, stats["channel_id"])
        video_analytics = get_video_analytics(creds, stats["channel_id"])

        _user_creds[session_id] = creds

        # Restore existing session to preserve cached insights
        existing_data, _ = get_session(session_id)
        existing_insights = existing_data.get("insights") if existing_data else None
        existing_analyzed_at = existing_data.get("analyzed_at") if existing_data else None

        import datetime
        now = datetime.datetime.utcnow().isoformat()

        is_fallback = bool(
            existing_insights and
            "fallback mode" in str(existing_insights.get("channelSummary", "")).lower()
        )

        # Re-run only if: no insights, fallback result, or 24h has passed since last analysis
        if not existing_insights or is_fallback:
            needs_analysis = True
        elif existing_analyzed_at:
            hours_since = (datetime.datetime.utcnow() - datetime.datetime.fromisoformat(existing_analyzed_at)).total_seconds() / 3600
            needs_analysis = hours_since > 24
        else:
            # Has valid insights but no analyzed_at — don't re-run, just stamp now
            needs_analysis = False

        user_data = {
            "channel": stats,
            "videos": videos,
            "analytics": analytics,
            "video_analytics": video_analytics,
            "insights": existing_insights,
            "analyzed_at": existing_analyzed_at or now,
        }
        _user_data[session_id] = user_data
        _persist_session(session_id, creds, user_data)

        if needs_analysis:
            background_tasks.add_task(
                _run_analysis_in_background,
                session_id, stats, videos, analytics, video_analytics
            )

        return RedirectResponse(f"{BASE_URL}/dashboard")

    except Exception as e:
        print(f"Callback error: {e}")
        import traceback
        traceback.print_exc()
        return RedirectResponse(f"{BASE_URL}?error=analysis_failed")


@router.get("/data")
def get_data(request: Request):
    session_id = request.session.get("session_id")
    data, _ = get_session(session_id)
    if not data:
        return JSONResponse({"error": "No data available"}, status_code=404)
    return JSONResponse(data)


@router.get("/debug")
def debug_session(request: Request):
    session_id = request.session.get("session_id")
    data, creds = get_session(session_id)
    insights = data.get("insights") if data else None
    return JSONResponse({
        "has_session_id": bool(session_id),
        "has_data": bool(data),
        "has_creds": bool(creds),
        "has_insights": bool(insights),
        "analyzed_at": data.get("analyzed_at") if data else None,
        "is_fallback": bool(insights and "fallback mode" in str(insights.get("channelSummary", "")).lower()),
        "channel_name": data["channel"].get("channel_name") if data and data.get("channel") else None,
    })


@router.post("/refresh-analysis")
def refresh_analysis(request: Request, background_tasks: BackgroundTasks):
    session_id = request.session.get("session_id")
    data, creds = get_session(session_id)
    if not data or not creds:
        return JSONResponse({"error": "Not logged in"}, status_code=401)
    data["insights"] = None
    _user_data[session_id] = data
    _persist_session(session_id, creds, data)
    background_tasks.add_task(
        _run_analysis_in_background,
        session_id,
        data["channel"],
        data["videos"],
        data["analytics"],
        data.get("video_analytics", [])
    )
    return JSONResponse({"message": "Analysis started"})


@router.get("/logout")
def logout(request: Request):
    session_id = request.session.pop("session_id", None)
    if session_id:
        _user_data.pop(session_id, None)
        _user_creds.pop(session_id, None)
        _pending_flows.pop(session_id, None)
        try:
            db = SessionLocal()
            db.query(UserSession).filter_by(session_id=session_id).delete()
            db.commit()
        except Exception:
            pass
        finally:
            db.close()
    return RedirectResponse(f"{BASE_URL}")
