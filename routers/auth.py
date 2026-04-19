from fastapi import APIRouter, BackgroundTasks, Request
from fastapi.responses import RedirectResponse, JSONResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import os
import uuid
import json
import datetime
from app.youtube import (
    get_channel_stats, get_recent_videos,
    get_full_channel_data)
from app.insights import analyze_channel
from database.models import (
    UserSession, UserEmailPreferences, UserSubscription,
    UserAccount, ChannelRegistry, SessionLocal,
)

router = APIRouter()

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"

BASE_URL = os.environ.get("BASE_URL", "http://localhost:5173")
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")

SCOPES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
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


def _find_existing_insights(channel_id: str) -> tuple[str | None, dict | None]:
    """
    Scan all sessions in the DB for one that already has data for this channel.
    Returns (session_id, user_data) if found, else (None, None).
    Used so that a returning user with a new session cookie doesn't lose their
    cached insights and trigger a fresh Claude analysis.
    """
    try:
        db = SessionLocal()
        rows = db.query(UserSession).all()
        for row in rows:
            try:
                user_data = json.loads(row.user_data_json)
                if user_data.get("channel", {}).get("channel_id") == channel_id:
                    return row.session_id, user_data
            except Exception:
                continue
        return None, None
    except Exception as e:
        print(f"Channel lookup error: {e}")
        return None, None
    finally:
        db.close()


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


def _upsert_email_preferences(channel_id: str, email: str) -> None:
    """Upsert user_email_preferences — only sets weekly_report=True for new records."""
    try:
        db = SessionLocal()
        pref = db.query(UserEmailPreferences).filter_by(channel_id=channel_id).first()
        if not pref:
            db.add(UserEmailPreferences(
                channel_id=channel_id,
                email=email,
                weekly_report=True,
            ))
            db.commit()
        elif pref.email != email:
            pref.email = email
            db.commit()
    except Exception as e:
        print(f"Email pref upsert error: {e}")
    finally:
        db.close()


def _run_analysis_in_background(session_id: str, stats: dict, videos: list, full_data: dict, plan: str = "free"):
    """Run AI analysis after login and update session data when done."""
    try:
        insights = analyze_channel(
            stats, videos,
            analytics=full_data.get("analytics"),
            video_analytics=full_data.get("video_analytics"),
            traffic_sources=full_data.get("traffic_sources"),
            shares=full_data.get("shares"),
            device_types=full_data.get("device_types"),
            geographies=full_data.get("geographies"),
            demographics=full_data.get("demographics"),
            dislikes=full_data.get("dislikes"),
            playlist_adds=full_data.get("playlist_adds"),
            plan=plan,
        )
        analyzed_at = datetime.datetime.utcnow().isoformat() + 'Z'
        # Always reload from DB and save back — don't rely on in-memory state
        data, creds = get_session(session_id)
        if data and creds:
            data["insights"] = insights
            data["analyzed_at"] = analyzed_at
            _user_data[session_id] = data
            _persist_session(session_id, creds, data)
            print(f"Analysis saved for {session_id[:8]}")

            # First report: generate immediately on channel connect
            channel_id = stats.get("channel_id")
            email = data.get("email", "")
            if channel_id and email:
                try:
                    from database.models import WeeklyReport
                    db = SessionLocal()
                    existing = db.query(WeeklyReport).filter_by(channel_id=channel_id).first()
                    db.close()
                    if not existing:
                        import time
                        time.sleep(2)
                        from app.weekly_report import generate_and_send_report
                        db2 = SessionLocal()
                        try:
                            generate_and_send_report(channel_id, email, data, db2)
                        finally:
                            db2.close()
                except Exception as e:
                    print(f"First report error: {e}")
        else:
            print(f"Session not found when saving analysis for {session_id[:8]}")
    except Exception as e:
        import traceback
        print(f"Background analysis error: {e}")
        traceback.print_exc()


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

        # Fetch full Google user info (email, display_name, profile_picture)
        google_email    = ""
        google_id       = ""
        display_name    = ""
        profile_picture = ""
        try:
            from googleapiclient.discovery import build as _build
            oauth2_svc = _build("oauth2", "v2", credentials=creds)
            ginfo = oauth2_svc.userinfo().get().execute()
            google_email    = ginfo.get("email", "")
            google_id       = ginfo.get("id", "")
            display_name    = ginfo.get("name", "")
            profile_picture = ginfo.get("picture", "")
        except Exception as _e:
            print(f"Google userinfo fetch error: {_e}")

        stats = get_channel_stats(creds)
        if not stats:
            return RedirectResponse(f"{BASE_URL}?error=no_channel")

        channel_id = stats["channel_id"]

        # ── Upsert user_accounts ──────────────────────────────────────────
        try:
            db = SessionLocal()
            account = db.query(UserAccount).filter_by(email=google_email).first()
            if not account:
                account = UserAccount(
                    email=google_email,
                    google_id=google_id,
                    display_name=display_name,
                    profile_picture=profile_picture,
                )
                db.add(account)
            else:
                account.display_name    = display_name
                account.profile_picture = profile_picture
                account.google_id       = google_id
            db.commit()
        except Exception as _e:
            print(f"UserAccount upsert error: {_e}")
        finally:
            db.close()

        # ── Channel abuse prevention ──────────────────────────────────────
        if google_email:
            db = SessionLocal()
            try:
                # Step 1 — check if channel belongs to a different account
                existing = db.query(ChannelRegistry).filter(
                    ChannelRegistry.channel_id == channel_id,
                    ChannelRegistry.owner_email != google_email,
                ).first()

                if existing:
                    if existing.disconnected_at:
                        days_since = (datetime.datetime.utcnow() - existing.disconnected_at).days
                        if days_since < 30:
                            db.close()
                            return RedirectResponse(f"{BASE_URL}?error=channel_locked")
                        # Older than 30 days — allow transfer
                        existing.owner_email     = google_email
                        existing.is_active       = True
                        existing.disconnected_at = None
                        existing.connected_at    = datetime.datetime.utcnow()
                        db.commit()
                    else:
                        # Still active under another account
                        db.close()
                        return RedirectResponse(f"{BASE_URL}?error=channel_taken")

                # Step 2 — check channel limit for this account
                sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
                channels_allowed = sub.channels_allowed if sub else 1

                active_channels = db.query(ChannelRegistry).filter(
                    ChannelRegistry.owner_email == google_email,
                    ChannelRegistry.is_active   == True,
                    ChannelRegistry.channel_id  != channel_id,
                ).count()

                if active_channels >= channels_allowed:
                    db.close()
                    return RedirectResponse(f"{BASE_URL}?error=channel_limit")

                # Step 3 — register or update channel
                registry = db.query(ChannelRegistry).filter_by(
                    owner_email=google_email,
                    channel_id=channel_id,
                ).first()

                if not registry:
                    registry = ChannelRegistry(
                        owner_email=google_email,
                        channel_id=channel_id,
                        channel_name=stats.get("channel_name"),
                        channel_thumbnail=stats.get("thumbnail"),
                        subscribers=stats.get("subscribers"),
                        is_active=True,
                    )
                    db.add(registry)
                else:
                    registry.is_active         = True
                    registry.disconnected_at   = None
                    registry.channel_name      = stats.get("channel_name")
                    registry.channel_thumbnail = stats.get("thumbnail")
                    registry.subscribers       = stats.get("subscribers")

                db.commit()
            except Exception as _e:
                print(f"Channel registry error: {_e}")
                import traceback; traceback.print_exc()
            finally:
                db.close()

        videos = get_recent_videos(creds)
        full_data = get_full_channel_data(creds, channel_id)

        _user_creds[session_id] = creds

        # Restore existing session to preserve cached insights.
        existing_data, _ = get_session(session_id)
        if not existing_data and channel_id:
            old_sid, existing_data = _find_existing_insights(channel_id)
            if old_sid and old_sid != session_id:
                try:
                    db = SessionLocal()
                    old_row = db.query(UserSession).filter_by(session_id=old_sid).first()
                    if old_row:
                        db.delete(old_row)
                        db.commit()
                except Exception:
                    pass
                finally:
                    db.close()

        existing_insights    = existing_data.get("insights") if existing_data else None
        existing_analyzed_at = existing_data.get("analyzed_at") if existing_data else None

        now = datetime.datetime.utcnow().isoformat() + 'Z'

        is_fallback = bool(
            existing_insights and
            "fallback mode" in str(existing_insights.get("channelSummary", "")).lower()
        )

        if not existing_insights or is_fallback:
            needs_analysis = True
        elif existing_analyzed_at:
            _ts = existing_analyzed_at.rstrip('Z').split('+')[0]  # strip tz for naive comparison
            hours_since = (datetime.datetime.utcnow() - datetime.datetime.fromisoformat(_ts)).total_seconds() / 3600
            needs_analysis = hours_since > 168  # 7 days
        else:
            needs_analysis = False

        user_data = {
            "channel":          stats,
            "videos":           videos,
            "analytics":        full_data.get("analytics"),
            "video_analytics":  full_data.get("video_analytics"),
            "insights":         existing_insights,
            "analyzed_at":      existing_analyzed_at or now,
            "stats_fetched_at": now,
            "email":            google_email,
            "google_id":        google_id,
            "display_name":     display_name,
            "profile_picture":  profile_picture,
        }
        _user_data[session_id] = user_data
        _persist_session(session_id, creds, user_data)

        # Store owner_email in UserSession row
        try:
            db = SessionLocal()
            row = db.query(UserSession).filter_by(session_id=session_id).first()
            if row:
                row.owner_email = google_email
                db.commit()
        except Exception as _e:
            print(f"owner_email update error: {_e}")
        finally:
            db.close()

        # Upsert email preferences (respects existing unsubscribe status)
        if google_email and channel_id:
            _upsert_email_preferences(channel_id, google_email)

        db = SessionLocal()
        sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
        plan = sub.plan if sub else "free"
        db.close()

        if needs_analysis:
            background_tasks.add_task(
                _run_analysis_in_background,
                session_id, stats, videos, full_data, plan
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
    creds = _user_creds.get(session_id)
    channel_id = data["channel"]["channel_id"]
    full_data = get_full_channel_data(creds, channel_id)

    db = SessionLocal()
    sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
    plan = sub.plan if sub else "free"
    db.close()

    background_tasks.add_task(
        _run_analysis_in_background,
        session_id,
        data["channel"],
        data["videos"],
        full_data,
        plan,
    )
    return JSONResponse({"message": "Analysis started"})


@router.post("/refresh-stats")
def refresh_stats(request: Request):
    """Re-fetch channel stats and recent videos from YouTube. No AI call, no credit used."""
    session_id = request.session.get("session_id")
    data, creds = get_session(session_id)
    if not data or not creds:
        return JSONResponse({"error": "Not logged in"}, status_code=401)

    try:
        stats  = get_channel_stats(creds)
        videos = get_recent_videos(creds)
    except Exception as e:
        return JSONResponse({"error": f"YouTube API error: {e}"}, status_code=500)

    if not stats:
        return JSONResponse({"error": "Could not fetch channel data."}, status_code=500)

    now = datetime.datetime.utcnow().isoformat() + 'Z'
    data["channel"]          = stats
    data["videos"]           = videos
    data["stats_fetched_at"] = now
    _user_data[session_id]   = data
    _persist_session(session_id, creds, data)

    return JSONResponse({
        "channel":          stats,
        "videos":           videos,
        "stats_fetched_at": now,
    })


@router.get("/logout")
def logout(request: Request):
    session_id = request.session.pop("session_id", None)
    if session_id:
        _user_data.pop(session_id, None)
        _user_creds.pop(session_id, None)
        _pending_flows.pop(session_id, None)
        # Keep the DB row intact so re-login can restore cached insights
        # without triggering a fresh (token-consuming) analysis.
    return RedirectResponse(f"{BASE_URL}")


@router.get("/me")
def get_me(request: Request):
    """Single source of truth for the Settings page."""
    session_id = request.session.get("session_id")
    user_data, _ = get_session(session_id)
    if not user_data:
        return JSONResponse({"error": "Not authenticated"}, status_code=401)

    channel_id = user_data.get("channel", {}).get("channel_id", "")
    google_email = user_data.get("email", "")

    db = SessionLocal()
    try:
        # Subscription info
        sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
        plan             = sub.plan if sub else "free"
        status           = sub.status if sub else "free"
        billing_cycle    = sub.billing_cycle if sub else "none"
        is_lifetime      = sub.is_lifetime if sub else False
        monthly_allowance = sub.monthly_allowance if sub else 5
        monthly_used     = sub.monthly_used if sub else 0
        monthly_remaining = max(0, monthly_allowance - monthly_used)
        pack_balance     = sub.pack_balance if sub else 0
        usage_pct        = round(monthly_used / monthly_allowance * 100) if monthly_allowance > 0 else 100
        channels_allowed = sub.channels_allowed if sub else 1
        reset_date       = sub.reset_date.isoformat() if sub and sub.reset_date else None

        # Account info
        account = db.query(UserAccount).filter_by(email=google_email).first()
        member_since = account.created_at.isoformat() if account and account.created_at else None

        # Channels
        channel_rows = db.query(ChannelRegistry).filter_by(
            owner_email=google_email,
            is_active=True,
        ).order_by(ChannelRegistry.connected_at.asc()).all()

        channels = []
        for row in channel_rows:
            row_sub = db.query(UserSubscription).filter_by(channel_id=row.channel_id).first()
            ch_score = 0
            # Try to get channel score from user_data insights if it's the current channel
            if row.channel_id == channel_id:
                ch_score = user_data.get("insights", {}).get("channelScore", 0) if user_data.get("insights") else 0
            channels.append({
                "channel_id":        row.channel_id,
                "channel_name":      row.channel_name or "",
                "channel_thumbnail": row.channel_thumbnail or "",
                "subscribers":       row.subscribers or 0,
                "is_current":        row.channel_id == channel_id,
                "channel_score":     ch_score,
                "plan":              row_sub.plan if row_sub else "free",
                "connected_at":      row.connected_at.isoformat() if row.connected_at else "",
            })

        can_add_more = len(channels) < channels_allowed

        # Email preference
        pref = db.query(UserEmailPreferences).filter_by(channel_id=channel_id).first()
        weekly_report_enabled = pref.weekly_report if pref else True

        return JSONResponse({
            "email":                google_email,
            "display_name":         user_data.get("display_name", ""),
            "profile_picture":      user_data.get("profile_picture", ""),
            "google_id":            user_data.get("google_id", ""),
            "member_since":         member_since,
            "channels":             channels,
            "channels_allowed":     channels_allowed,
            "can_add_more":         can_add_more,
            "plan":                 plan,
            "status":               status,
            "billing_cycle":        billing_cycle,
            "is_lifetime":          is_lifetime,
            "monthly_allowance":    monthly_allowance,
            "monthly_used":         monthly_used,
            "monthly_remaining":    monthly_remaining,
            "pack_balance":         pack_balance,
            "usage_pct":            usage_pct,
            "reset_date":           reset_date,
            "weekly_report_enabled": weekly_report_enabled,
        })
    finally:
        db.close()


@router.delete("/delete-account")
def delete_account(request: Request):
    """Permanently delete the account. Preserves all data rows — only clears session and marks channels inactive."""
    session_id = request.session.get("session_id")
    user_data, _ = get_session(session_id)
    if not user_data:
        return JSONResponse({"error": "Not authenticated"}, status_code=401)

    google_email = user_data.get("email", "")

    db = SessionLocal()
    try:
        # Mark all channels inactive
        if google_email:
            channels = db.query(ChannelRegistry).filter_by(owner_email=google_email).all()
            for ch in channels:
                ch.is_active       = False
                ch.disconnected_at = datetime.datetime.utcnow()

        # Delete the session row
        if session_id:
            row = db.query(UserSession).filter_by(session_id=session_id).first()
            if row:
                db.delete(row)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Delete account error: {e}")
        return JSONResponse({"error": "Failed to delete account"}, status_code=500)
    finally:
        db.close()

    # Clear in-memory caches
    if session_id:
        _user_data.pop(session_id, None)
        _user_creds.pop(session_id, None)
        _pending_flows.pop(session_id, None)
        request.session.pop("session_id", None)

    return JSONResponse({"success": True})
