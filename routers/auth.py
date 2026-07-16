from fastapi import APIRouter, BackgroundTasks, Request
from fastapi.responses import RedirectResponse, JSONResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import os
import uuid
import json
import datetime
import threading
from app.youtube import (
    get_channel_stats, get_recent_videos, get_video_metrics_map, merge_metrics_into_videos,
    get_full_channel_data, get_watch_minutes_365d)
from app.insights import analyze_channel, _fallback_analysis
from app.milestones import check_and_record as _check_milestones, get_state as _get_milestone_state
from app.milestone_email import send_milestone_emails as _send_milestone_emails
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
    Scan sessions for the row that owns the freshest insights for this
    channel_id. A user can have multiple UserSession rows (logout/login
    creates a new session_id) — pick the one with the most recent
    analyzed_at, preferring rows that actually carry insights over rows
    that don't.

    This is what stops a re-audited user from logging out, back in, and
    seeing their old audit because /callback picked up an arbitrary
    earlier row.
    """
    try:
        db = SessionLocal()
        rows = db.query(UserSession).all()
        best = None  # (analyzed_at_str, has_insights, session_id, user_data)
        for row in rows:
            try:
                user_data = json.loads(row.user_data_json)
                if user_data.get("channel", {}).get("channel_id") != channel_id:
                    continue
                analyzed_at = user_data.get("analyzed_at") or ""
                has_insights = bool(user_data.get("insights"))
                # Sort key: prefer rows WITH insights, then by analyzed_at desc.
                key = (1 if has_insights else 0, analyzed_at)
                if best is None or key > best[0]:
                    best = (key, row.session_id, user_data)
            except Exception:
                continue
        if best:
            _, sid, ud = best
            return sid, ud
        return None, None
    except Exception as e:
        print(f"Channel lookup error: {e}")
        return None, None
    finally:
        db.close()


def _fanout_insights_to_channel(channel_id: str, insights: dict, analyzed_at: str, exclude_session_id: str | None = None) -> None:
    """
    Write the freshest `insights` + `analyzed_at` to every UserSession row
    that owns this channel_id. Used by `_run_analysis_in_background` so a
    user who logged out/in mid-audit (or has the dashboard open on a second
    device) sees the new audit on every active session — not just the one
    that triggered the re-audit.
    """
    if not channel_id:
        return
    db = SessionLocal()
    try:
        rows = db.query(UserSession).all()
        for row in rows:
            if exclude_session_id and row.session_id == exclude_session_id:
                continue
            try:
                user_data = json.loads(row.user_data_json) if row.user_data_json else None
            except Exception:
                continue
            if not user_data or user_data.get("channel", {}).get("channel_id") != channel_id:
                continue
            user_data["insights"] = insights
            user_data["analyzed_at"] = analyzed_at
            row.user_data_json = json.dumps(user_data)
            # Mirror to the in-memory cache if present so subsequent reads
            # for that session don't fall back to the stale dict.
            if row.session_id in _user_data:
                _user_data[row.session_id] = user_data
        db.commit()
    finally:
        db.close()


# ── Free-tier audit policy (2026-05-18) ────────────────────────────────────
# The Channel Audit is free for free-plan users and does NOT draw from the
# 5-credit trial pool. To stop it being an uncached-Claude money leak, a
# free user's MANUAL re-audit is rate-limited to once every 7 days. The
# first/signup audit and the paid auto-refresh are unaffected.
_FREE_AUDIT_COOLDOWN_DAYS = 7


def _stamp_last_audit(channel_id: str) -> None:
    """Record now() as the channel's last audit time. Free audits skip
    check_and_deduct (which used to stamp this), so we stamp explicitly so
    the manual-re-audit cooldown has a source of truth."""
    if not channel_id:
        return
    try:
        db = SessionLocal()
        from database.models import ChannelRegistry
        reg = db.query(ChannelRegistry).filter_by(channel_id=channel_id).first()
        if reg:
            reg.last_audit_at = datetime.datetime.utcnow()
            db.commit()
    except Exception as e:
        print(f"[audit] last_audit_at stamp failed for {channel_id}: {e}")
    finally:
        try:
            db.close()
        except Exception:
            pass


def _free_audit_retry_days(channel_id: str) -> int:
    """0 if a free user may re-audit now, else whole days until they can.
    Based on ChannelRegistry.last_audit_at; missing/old → allowed."""
    if not channel_id:
        return 0
    try:
        db = SessionLocal()
        from database.models import ChannelRegistry
        reg = db.query(ChannelRegistry).filter_by(channel_id=channel_id).first()
        last = reg.last_audit_at if reg else None
        db.close()
        if not last:
            return 0
        if last.tzinfo is not None:
            last = last.replace(tzinfo=None)
        elapsed = datetime.datetime.utcnow() - last
        remaining = datetime.timedelta(days=_FREE_AUDIT_COOLDOWN_DAYS) - elapsed
        if remaining.total_seconds() <= 0:
            return 0
        return max(1, -(-remaining.days) if remaining.days else 1)
    except Exception as e:
        print(f"[audit] cooldown check failed for {channel_id}: {e}")
        return 0  # fail open — never hard-block an audit on a DB hiccup


# Hosts we serve OAuth on. redirect_uri + all post-login redirects are derived
# from the request's own host so login works identically on ytgrowth.io and
# channelbrain.online without flipping an env var (and without breaking the
# host-only session cookie: /login and /callback always land on the same host).
# Anything NOT in this allowlist falls back to BASE_URL so a spoofed Host header
# can never point the OAuth redirect at an attacker-controlled domain.
_OAUTH_HOSTS = {
    "ytgrowth.io", "www.ytgrowth.io",
    "channelbrain.online", "www.channelbrain.online",
}


def _request_base(request: Request) -> str:
    """Scheme+host for OAuth/redirects, taken from the (proxied) request host.
    Cloudflare/Railway forward the original host + proto; we trust those only
    for allowlisted hosts, else fall back to the configured BASE_URL."""
    host = (
        request.headers.get("x-forwarded-host")
        or request.headers.get("host")
        or ""
    ).split(",")[0].strip().lower()
    if host in _OAUTH_HOSTS:
        proto = request.headers.get("x-forwarded-proto", "https").split(",")[0].strip()
        return f"{proto}://{host}"
    if host.startswith("localhost") or host.startswith("127.0.0.1"):
        return f"http://{host}"
    return BASE_URL


def get_flow(autogenerate_pkce: bool = True, base_url: str | None = None):
    """Build a fresh OAuth Flow.

    PKCE code_verifier is auto-generated when starting a new auth (login). On
    callback we rebuild the flow with the verifier saved in the user's session
    cookie, so we pass autogenerate_pkce=False there to avoid clobbering it.

    redirect_uri is derived from the caller's request host (base_url) so the
    same OAuth client serves both ytgrowth.io and channelbrain.online. Both
    callback URIs must be registered in Google Cloud Console.
    """
    redirect_base = base_url or BACKEND_URL
    client_secret_env = os.environ.get("GOOGLE_CLIENT_SECRET_JSON")
    if client_secret_env:
        import tempfile
        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
            f.write(client_secret_env)
            tmp_path = f.name
        flow = Flow.from_client_secrets_file(
            tmp_path,
            scopes=SCOPES,
            redirect_uri=f"{redirect_base}/auth/callback",
            autogenerate_code_verifier=autogenerate_pkce,
        )
        os.unlink(tmp_path)
    else:
        flow = Flow.from_client_secrets_file(
            "client_secret.json",
            scopes=SCOPES,
            redirect_uri=f"{redirect_base}/auth/callback",
            autogenerate_code_verifier=autogenerate_pkce,
        )
    return flow


UTM_KEYS = ("utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term")


@router.get("/login")
def login(request: Request):
    # Consolidate ALL OAuth on the ChannelBrain host so the authenticated app is
    # only ever ChannelBrain-branded. ytgrowth.io is the content brand and no
    # longer initiates login: a login started on any non-ChannelBrain host is
    # bounced to channelbrain.online first, carrying its query string (UTMs) so
    # attribution survives. Localhost is exempt for local dev.
    _host = (
        request.headers.get("x-forwarded-host")
        or request.headers.get("host")
        or ""
    ).split(",")[0].strip().lower()
    _is_cb = _host == "channelbrain.online" or _host.endswith(".channelbrain.online")
    _is_local = _host.startswith("localhost") or _host.startswith("127.0.0.1")
    if not _is_cb and not _is_local:
        qs = request.url.query
        return RedirectResponse(
            "https://channelbrain.online/auth/login" + (f"?{qs}" if qs else "")
        )

    # Assign a session ID if the user doesn't have one yet
    if "session_id" not in request.session:
        request.session["session_id"] = str(uuid.uuid4())

    session_id = request.session["session_id"]

    # Capture UTM params (if any) so we can persist them when the new
    # UserAccount row is created in /callback. Survives the OAuth round-trip
    # via the session cookie. Truncated to 255 chars per field to stay
    # safe inside a TEXT column without abuse.
    pending_utms = {}
    for k in UTM_KEYS:
        v = request.query_params.get(k)
        if v:
            pending_utms[k] = v[:255]
    if pending_utms:
        request.session["pending_utms"] = pending_utms

    # Carry a checkout the visitor started before signing in (clicked a paid
    # plan on the landing page while logged out). The plan key rides in ?plan=
    # and survives the OAuth round-trip via the session; the callback then
    # redirects to /dashboard?pco_plan=… so the frontend resumes Paddle. Validated
    # against the real price map so it can't be abused to inject a redirect.
    _plan = request.query_params.get("plan", "")
    if _plan:
        try:
            from routers.billing import PLAN_PRICE_MAP
            if _plan in PLAN_PRICE_MAP:
                request.session["after_login_redirect"] = f"/dashboard?pco_plan={_plan}"
        except Exception:
            pass

    flow = get_flow(autogenerate_pkce=True, base_url=_request_base(request))
    auth_url, state = flow.authorization_url(
        prompt="consent",
        access_type="offline"
    )

    # Persist the PKCE verifier + state in the SIGNED session cookie. The
    # in-memory `_pending_flows` dict only works on single-worker deployments —
    # on multi-worker hosts (Railway/Render autoscale) the callback can land on
    # a different worker than /login, leaving _pending_flows empty and causing
    # `InvalidGrantError: Invalid code verifier`. The session cookie is signed
    # with SESSION_SECRET_KEY (identical across all workers) so it survives
    # across processes and restarts.
    request.session["oauth_state"]         = state
    request.session["oauth_code_verifier"] = flow.code_verifier or ""

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


def _save_insights_to_db_row(session_id: str, insights: dict, analyzed_at: str) -> bool:
    """Write insights + analyzed_at straight into the UserSession DB row.

    Needs no in-memory creds, so it works when the background task lost its
    session (worker recycle / restore miss) or when the AI call failed and we
    have to land a fallback. Without a write here the row keeps insights=None
    forever and the frontend audit-progress card spins at 94% with no way out.
    Also converges this worker's in-memory cache if it still holds the row.
    Returns True if the DB row was updated.
    """
    mem = _user_data.get(session_id)
    if mem is not None:
        mem["insights"] = insights
        mem["analyzed_at"] = analyzed_at
    try:
        db = SessionLocal()
        try:
            row = db.query(UserSession).filter_by(session_id=session_id).first()
            if row and row.user_data_json:
                d = json.loads(row.user_data_json)
                d["insights"] = insights
                d["analyzed_at"] = analyzed_at
                row.user_data_json = json.dumps(d)
                db.commit()
                return True
        finally:
            db.close()
    except Exception as e:
        print(f"[insights db write] error for {session_id[:8]}: {e}")
    return False


def _run_analysis_in_background(session_id: str, stats: dict, videos: list, full_data: dict, plan: str = "free", charged: bool = False, use_ai: bool = True):
    """Run the channel audit after login and update session data when done.
    If `charged=True`, the caller already spent 1 credit via check_and_deduct.
    Claude failures DO NOT refund — Anthropic still bills us on token use, so
    refunding compounds the loss. Users can email support@ytgrowth.io for a
    manual goodwill bump if a paid run failed.

    When `use_ai=False` (free plan, 2026-07) the audit is computed with the
    rule-based `_fallback_analysis` only — no Anthropic call — so free signups
    stop burning tokens. We rewrite the fallback's error-flavoured summary so
    it reads as a normal audit and does NOT trip the "fallback mode" re-audit
    loop in /callback.
    """
    channel_id = stats.get("channel_id") if stats else None
    try:
        if use_ai:
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
        else:
            insights = _fallback_analysis(stats, videos, full_data.get("analytics"))
            insights["channelSummary"] = (
                "Here is a data-based read of your channel from your public "
                "metrics. Upgrade for a full AI-powered audit with deeper, "
                "channel-specific recommendations."
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
        else:
            # No in-memory creds (worker recycle / restore miss). The audit still
            # succeeded, so write insights straight to the DB row; otherwise this
            # session's row keeps insights=None and the frontend audit card spins
            # at 94% forever. _persist_session needs creds we don't have here, so
            # we patch the row directly instead.
            print(f"Session creds missing for {session_id[:8]}; writing insights to DB row")
            _save_insights_to_db_row(session_id, insights, analyzed_at)

        # Fan-out: if the user logged out and back in (or has the dashboard
        # open on another device) WHILE this background task was running,
        # they now have a different session_id pointing at the same
        # channel_id. Write the fresh insights to every UserSession row that
        # owns this channel so all sessions converge on the new audit.
        if channel_id:
            try:
                _fanout_insights_to_channel(channel_id, insights, analyzed_at, exclude_session_id=session_id)
            except Exception as fan_err:
                print(f"Insights fan-out error: {fan_err}")

            # Welcome email — fires once per channel (idempotent via
            # UserEmailPreferences.welcome_email_sent_at). Sent after the first
            # audit completes so the email lands when the user has insights to
            # see. Goes to free AND paid; honours the same unsubscribe flag.
            try:
                from app.welcome_email import send_welcome_email
                send_welcome_email(channel_id, data)
            except Exception as welcome_err:
                print(f"Welcome email error: {welcome_err}")

            # First report: generate immediately on channel connect — paid plans only,
            # costs 1 credit (no refund on failure — Anthropic still bills us; users
            # email support@ytgrowth.io for goodwill bumps). Free plan shows an
            # upgrade nudge in the Weekly Report tab instead.
            channel_id = stats.get("channel_id")
            email = (data or {}).get("email", "")  # data is None when creds were missing
            if channel_id and email:
                try:
                    from database.models import WeeklyReport, UserSubscription
                    db = SessionLocal()
                    try:
                        sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
                        _plan = (sub.plan if sub else "free") or "free"
                        existing = db.query(WeeklyReport).filter_by(channel_id=channel_id).first()
                    finally:
                        db.close()

                    if _plan != "free" and not existing:
                        from app.analysis_gate import check_and_deduct
                        gate = check_and_deduct(channel_id)
                        if gate.get("allowed"):
                            import time
                            time.sleep(2)
                            from app.weekly_report import generate_and_send_report
                            db2 = SessionLocal()
                            try:
                                generate_and_send_report(channel_id, email, data, db2)
                            except Exception as gen_err:
                                # Claude already ran — credit stays consumed; users can
                                # email support@ytgrowth.io if their report didn't arrive.
                                print(f"First report generation error: {gen_err}")
                            finally:
                                db2.close()
                        else:
                            print(f"[first_report] Skipping {channel_id[:8]} — out of credits")
                except Exception as e:
                    print(f"First report error: {e}")
        else:
            print(f"Session not found when saving analysis for {session_id[:8]}")
    except Exception as e:
        import traceback
        print(f"Background analysis error: {e}")
        traceback.print_exc()
        # Claude already ran (or attempted) — credit stays consumed. Users
        # can email support@ytgrowth.io for a manual goodwill bump.
        # Land a rule-based fallback so the audit-progress card stops spinning;
        # the user gets a usable audit plus a re-audit path, not a dead screen.
        try:
            fb = _fallback_analysis(stats, videos, full_data.get("analytics"))
            fb_at = datetime.datetime.utcnow().isoformat() + 'Z'
            if _save_insights_to_db_row(session_id, fb, fb_at):
                print(f"Fallback audit saved for {session_id[:8]} after analysis error")
                if channel_id:
                    try:
                        _fanout_insights_to_channel(channel_id, fb, fb_at, exclude_session_id=session_id)
                    except Exception:
                        pass
        except Exception as fb_err:
            print(f"Fallback persist error for {session_id[:8]}: {fb_err}")


@router.get("/callback")
def callback(request: Request, background_tasks: BackgroundTasks):
    # Host-derived base: the user stays on the same domain across the Google
    # round-trip, so this matches the redirect_uri /login used and the host
    # that holds the PKCE session cookie. Every redirect below uses it so the
    # user lands back on the domain they started on (ytgrowth.io OR channelbrain.online).
    base = _request_base(request)

    code = request.query_params.get("code")
    if not code:
        return RedirectResponse(f"{base}?error=no_code")

    session_id = request.session.get("session_id")

    # Pull the PKCE verifier + state from the session cookie. Cookie is the
    # authoritative source because it survives multi-worker deployments. Pop
    # them so a stale verifier can't be reused on a retry.
    saved_state    = request.session.pop("oauth_state", None)
    saved_verifier = request.session.pop("oauth_code_verifier", None)

    pending = _pending_flows.pop(session_id, None) if session_id else None

    if pending:
        # Same-worker fast path: reuse the cached flow object.
        flow = pending["flow"]
    elif saved_verifier:
        # Cross-worker / restart fallback: rebuild a fresh flow and inject the
        # verifier we saved in the cookie at /login time.
        flow = get_flow(autogenerate_pkce=False, base_url=base)
        flow.code_verifier = saved_verifier
    else:
        return RedirectResponse(f"{base}?error=session_expired")

    try:
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
            return RedirectResponse(f"{base}?error=no_channel")

        channel_id = stats["channel_id"]

        # ── Upsert user_accounts ──────────────────────────────────────────
        is_new_signup    = False
        signup_utms      = {}
        try:
            db = SessionLocal()
            account = db.query(UserAccount).filter_by(email=google_email).first()
            if not account:
                # First time we've seen this Google account — pull any pending
                # UTM attribution off the session and persist it.
                pending_utms = request.session.pop("pending_utms", None) or {}
                account = UserAccount(
                    email=google_email,
                    google_id=google_id,
                    display_name=display_name,
                    profile_picture=profile_picture,
                    utm_source   = pending_utms.get("utm_source"),
                    utm_medium   = pending_utms.get("utm_medium"),
                    utm_campaign = pending_utms.get("utm_campaign"),
                    utm_content  = pending_utms.get("utm_content"),
                    utm_term     = pending_utms.get("utm_term"),
                )
                db.add(account)
                is_new_signup = True
                signup_utms   = pending_utms
            else:
                account.display_name    = display_name
                account.profile_picture = profile_picture
                account.google_id       = google_id
                # Drop any stale pending_utms so they don't leak to the next signup
                request.session.pop("pending_utms", None)
            db.commit()
        except Exception as _e:
            print(f"UserAccount upsert error: {_e}")
        finally:
            db.close()

        # ── Internal notification (new signups only) ─────────────────────
        if is_new_signup and google_email:
            try:
                from app.signup_notification import notify_new_signup
                ip = (
                    request.headers.get("x-forwarded-for", "").split(",")[0].strip()
                    or (request.client.host if request.client else "")
                )
                threading.Thread(
                    target=notify_new_signup,
                    kwargs={
                        "email":        google_email,
                        "name":         display_name,
                        "ip_address":   ip,
                        "utm_source":   signup_utms.get("utm_source"),
                        "utm_medium":   signup_utms.get("utm_medium"),
                        "utm_campaign": signup_utms.get("utm_campaign"),
                        "utm_content":  signup_utms.get("utm_content"),
                        "utm_term":     signup_utms.get("utm_term"),
                    },
                    daemon=True,
                ).start()
            except Exception as _e:
                print(f"[signup_notify] schedule error: {_e}")

            # ── Immediate welcome email ──────────────────────────────────
            # Fires now (before the audit completes) so users who hit audit
            # errors still get welcomed. The audit-complete email in
            # welcome_email.py still fires after the audit with the
            # personalised "your top priority is X" hook. is_new_signup is
            # the natural idempotency gate - it can only be True once per
            # email since UserAccount is unique on email.
            try:
                from app.welcome_immediate import send_welcome_immediate
                threading.Thread(
                    target=send_welcome_immediate,
                    kwargs={
                        "email":        google_email,
                        "display_name": display_name,
                        "channel_id":   channel_id,
                        "channel_name": stats.get("channel_name") if stats else None,
                    },
                    daemon=True,
                ).start()
            except Exception as _e:
                print(f"[welcome_immediate] schedule error: {_e}")

            # ── Free-to-paid nurture sequence ────────────────────────────
            # Enqueue the 7-email series (sent over the first 18 days by the
            # hourly scheduler job). Idempotent on email, and wrapped so a DB
            # hiccup never blocks the OAuth callback.
            try:
                from app.nurture_sequence import enqueue_nurture_sequence
                enqueue_nurture_sequence(
                    email=google_email,
                    display_name=display_name,
                    channel_id=channel_id,
                )
            except Exception as _e:
                print(f"[nurture] enqueue schedule error: {_e}")

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
                            return RedirectResponse(f"{base}?error=channel_locked")
                        # Older than 30 days — allow transfer
                        existing.owner_email     = google_email
                        existing.is_active       = True
                        existing.disconnected_at = None
                        existing.connected_at    = datetime.datetime.utcnow()
                        db.commit()
                    else:
                        # Still active under another account
                        db.close()
                        return RedirectResponse(f"{base}?error=channel_taken")

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
                    return RedirectResponse(f"{base}?error=channel_limit")

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

        videos = get_recent_videos(creds, uploads_playlist_id=stats.get("uploads_playlist_id"))
        full_data = get_full_channel_data(creds, channel_id)
        try:
            metrics_map = get_video_metrics_map(creds, channel_id)
            videos = merge_metrics_into_videos(videos, metrics_map)
        except Exception as _e:
            print(f"Metrics merge error (login): {_e}")

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

        # Plan drives audit policy (2026-05-18):
        #   Free  → audit is free + off the 5-credit pool. Auto-runs ONLY on
        #           first signup / fallback. The 7-day auto-refresh is paid-
        #           only; a free user re-audits via the manual button, which
        #           is rate-limited to once / 7 days in /refresh-analysis.
        #   Paid  → unchanged: auto-refresh once the audit is > 7 days old.
        try:
            _pdb = SessionLocal()
            _psub = _pdb.query(UserSubscription).filter_by(channel_id=channel_id).first()
            plan = (_psub.plan if _psub else "free") or "free"
            _pdb.close()
        except Exception:
            plan = "free"
        is_free_plan = plan == "free"

        if not existing_insights or is_fallback:
            needs_analysis = True
        elif existing_analyzed_at and not is_free_plan:
            _ts = existing_analyzed_at.rstrip('Z').split('+')[0]  # strip tz for naive comparison
            hours_since = (datetime.datetime.utcnow() - datetime.datetime.fromisoformat(_ts)).total_seconds() / 3600
            needs_analysis = hours_since > 168  # 7 days — paid only
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

        # Persist 365d watch minutes into analytics so /auth/milestones can read it later.
        try:
            if full_data.get("analytics") is None:
                full_data["analytics"] = {}
            full_data["analytics"]["watch_minutes_365d"] = get_watch_minutes_365d(creds, channel_id)
            user_data["analytics"] = full_data["analytics"]
            _persist_session(session_id, creds, user_data)
            _check_milestones(channel_id, stats, videos, full_data["analytics"])
        except Exception as _e:
            print(f"[milestones] login-check error: {_e}")

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

        # plan / is_free_plan already resolved above (before needs_analysis).
        if needs_analysis:
            if is_free_plan:
                # Free audit: no credit charged, NOT drawn from the 5-credit
                # trial pool. needs_analysis is already restricted to first
                # signup / fallback for free, so this is the one-time intro
                # audit. Stamp last_audit_at so the manual-re-audit 7-day
                # cooldown has a baseline.
                _stamp_last_audit(channel_id)
                background_tasks.add_task(
                    _run_analysis_in_background,
                    session_id, stats, videos, full_data, plan, True, False
                )
            else:
                # Paid: charge 1 credit. No refund on Claude failures
                # (Anthropic still bills us). Out of credits → skip silently;
                # they still land on the dashboard.
                from app.analysis_gate import check_and_deduct
                gate = check_and_deduct(channel_id)
                if gate.get("allowed"):
                    background_tasks.add_task(
                        _run_analysis_in_background,
                        session_id, stats, videos, full_data, plan, True
                    )
                else:
                    print(f"[callback] Skipping audit for {channel_id[:8]} — out of credits")

        # If a share-link entry point (e.g. /feedback) stashed a destination
        # before kicking off OAuth, honour it. One-shot — popped on use so it
        # doesn't leak into subsequent logins.
        post_login = request.session.pop("after_login_redirect", None)
        if post_login and isinstance(post_login, str) and post_login.startswith("/"):
            return RedirectResponse(f"{base}{post_login}")
        return RedirectResponse(f"{base}/dashboard")

    except Exception as e:
        print(f"Callback error: {e}")
        import traceback
        traceback.print_exc()
        # Classify quotaExceeded specially so users see "over capacity, try
        # again later" instead of the misleading "audit failed" modal.
        err_str = str(e).lower()
        if "quotaexceeded" in err_str or ("quota" in err_str and "exceeded" in err_str):
            return RedirectResponse(f"{base}?error=quota_exceeded")
        return RedirectResponse(f"{base}?error=analysis_failed")


# Insights fields that are part of the paid audit deliverable. Free users get
# the score + health card + ONE priority action as a taste; everything below
# is stripped from the /auth/data payload so it never reaches the browser (the
# UI already hides it, but the bytes were still in the network response — a
# real leak, same class as the SEO Feed leak fixed in 482288ae6).
_PAID_INSIGHT_FIELDS = (
    "quickWins", "biggestRisk", "topPerformingPattern",
    "trafficDominantSource", "audienceSummary", "shareabilityScore",
    "competitorBenchmark",
)


def _is_free_plan_channel(channel_id: str | None) -> bool:
    """True if the channel has no paid subscription. Fails toward PAID (False)
    on a DB hiccup so paying users never lose their audit over a transient
    error — mirrors the Feed SEO-leak gate."""
    if not channel_id:
        return True
    try:
        db = SessionLocal()
        try:
            sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
            return ((sub.plan if sub else "free") or "free") == "free"
        finally:
            db.close()
    except Exception:
        return False


def _redact_insights_for_free(insights: dict) -> dict:
    """Return a copy of `insights` with paid deliverables removed. Keeps the
    score, category scores, summary, and the rank-1 action in full. Every other
    priority action collapses to {rank, locked:true} so the teaser can still
    count them without shipping their text."""
    if not isinstance(insights, dict):
        return insights
    out = dict(insights)
    for f in _PAID_INSIGHT_FIELDS:
        out.pop(f, None)

    actions = out.get("priorityActions")
    if isinstance(actions, list) and actions:
        # Reveal the single lowest-rank (top) action in full; stub the rest.
        def _rank(a, i):
            try:
                return a.get("rank", i + 1)
            except Exception:
                return i + 1
        ranked = sorted(enumerate(actions), key=lambda p: _rank(p[1], p[0]))
        top_idx = ranked[0][0]
        out["priorityActions"] = [
            a if i == top_idx else {"rank": _rank(a, i), "locked": True}
            for i, a in enumerate(actions)
        ]
    return out


@router.get("/data")
def get_data(request: Request):
    session_id = request.session.get("session_id")
    data, _ = get_session(session_id)
    if not data:
        return JSONResponse({"error": "No data available"}, status_code=404)

    # Audit-polling worker-sync: the background task in /refresh-analysis
    # writes finished insights to BOTH the in-memory _user_data dict AND
    # the DB. The in-memory write only updates the worker that ran the
    # task. When the frontend polls /auth/data, requests can land on any
    # worker. If they land on a worker whose in-memory cache still has
    # insights=None, the user spins on "Auditing..." forever even though
    # the audit is done.
    #
    # Guard with `insights is None` so this DB hit only runs during the
    # short audit-pending window. Normal Feed loads (insights already set)
    # skip it and pay zero extra cost.
    if data.get("insights") is None:
        try:
            db = SessionLocal()
            try:
                row = db.query(UserSession).filter_by(session_id=session_id).first()
                if row and row.user_data_json:
                    db_data = json.loads(row.user_data_json)
                    # Adopt the DB copy ONLY when it is genuinely fresher, i.e.
                    # its analyzed_at differs from this worker's. During a
                    # re-audit the DB intentionally keeps the PREVIOUS audit
                    # (null insights are never persisted), so "DB has insights"
                    # alone is NOT freshness: adopting on that alone returned
                    # the old audit on the first 4s poll, ended the progress
                    # card early, and clobbered the pending state in memory
                    # while Claude was still running.
                    if (
                        db_data.get("insights") is not None
                        and db_data.get("analyzed_at") != data.get("analyzed_at")
                    ):
                        data = db_data
                        _user_data[session_id] = data
                        print(f"[/auth/data] synced fresh insights from DB for {session_id[:8]}")
            finally:
                db.close()
        except Exception as e:
            print(f"[/auth/data] DB sync error: {e}")

    # Free-tier redaction: strip paid audit deliverables before they leave the
    # server. The browser already hides them, but they were still present in
    # this response — a free user could read the full action plan, quick wins,
    # biggest risk, audience + competitor intelligence straight from DevTools.
    insights = data.get("insights")
    if isinstance(insights, dict):
        channel_id = (data.get("channel") or {}).get("channel_id")
        if _is_free_plan_channel(channel_id):
            data = {**data, "insights": _redact_insights_for_free(insights)}

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
    channel_id = data["channel"]["channel_id"]

    db = SessionLocal()
    sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
    plan = (sub.plan if sub else "free") or "free"
    db.close()
    is_free_plan = plan == "free"

    if is_free_plan:
        # Free plan: the FIRST audit is free (the signup hook). RE-audits are a
        # paid feature — refreshing the audit as the channel grows is part of
        # the upgrade. This both stops the recurring uncached-Claude cost on a
        # cohort that doesn't pay, and gives a concrete reason to upgrade.
        # A failed first audit lands a "fallback mode" insights blob; allow a
        # free retry in that case so a broken first run isn't paywalled.
        existing = data.get("insights")
        is_fallback = bool(
            existing and "fallback mode" in str(existing.get("channelSummary", "")).lower()
        )
        already_audited = bool(existing) and not is_fallback
        if already_audited:
            return JSONResponse(
                {
                    "error": (
                        "Re-audits are a paid feature. Your first audit is free; "
                        "upgrade to refresh it on demand as your channel grows."
                    ),
                    "show_upgrade": True,
                    "locked": True,
                },
                status_code=403,
            )
        _stamp_last_audit(channel_id)
    else:
        # Paid: charge 1 credit up-front. No refund on Claude failures —
        # Anthropic still bills us. Users email support@ytgrowth.io if a
        # Re-Audit fails.
        from app.analysis_gate import check_and_deduct
        gate = check_and_deduct(channel_id)
        if not gate.get("allowed"):
            return JSONResponse(
                {
                    "error": gate.get("message") or "You're out of analyses. Top up or upgrade to continue.",
                    "show_upgrade": True,
                },
                status_code=402,
            )

    # Show "loading" state for THIS session only — never persist null insights
    # to the DB. If we wrote null and the user logged out/in (or hit another
    # device) before the background task finished, /auth/callback would pull
    # the nulled row and the user would see their previous audit instead of
    # the fresh one. Keep the previous insights on disk; the background task
    # below will overwrite them once analysis completes.
    data["insights"] = None
    _user_data[session_id] = data
    creds = _user_creds.get(session_id)
    full_data = get_full_channel_data(creds, channel_id)

    background_tasks.add_task(
        _run_analysis_in_background,
        session_id,
        data["channel"],
        data["videos"],
        full_data,
        plan,
        True,
        not is_free_plan,  # free plan → rule-based audit, no Anthropic call
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
        videos = get_recent_videos(creds, uploads_playlist_id=stats.get("uploads_playlist_id") if stats else None)
    except Exception as e:
        return JSONResponse({"error": f"YouTube API error: {e}"}, status_code=500)

    if not stats:
        return JSONResponse({"error": "Could not fetch channel data."}, status_code=500)

    try:
        metrics_map = get_video_metrics_map(creds, stats.get("channel_id"))
        videos = merge_metrics_into_videos(videos, metrics_map)
    except Exception as _e:
        print(f"Metrics merge error (refresh): {_e}")

    now = datetime.datetime.utcnow().isoformat() + 'Z'
    data["channel"]          = stats
    data["videos"]           = videos
    data["stats_fetched_at"] = now
    _user_data[session_id]   = data
    _persist_session(session_id, creds, data)

    # Persist 365d watch minutes into session analytics so /auth/milestones reads fresh values.
    new_milestones = []
    try:
        if data.get("analytics") is None:
            data["analytics"] = {}
        data["analytics"]["watch_minutes_365d"] = get_watch_minutes_365d(creds, stats.get("channel_id"))
        _user_data[session_id] = data
        _persist_session(session_id, creds, data)
        new_milestones = _check_milestones(
            stats.get("channel_id"), stats, videos, data["analytics"]
        )
        if new_milestones:
            _send_milestone_emails(
                stats.get("channel_id"),
                new_milestones,
                stats.get("channel_name") or "",
                stats.get("thumbnail") or stats.get("channel_thumbnail"),
            )
    except Exception as _e:
        print(f"[milestones] refresh-check error: {_e}")

    return JSONResponse({
        "channel":          stats,
        "videos":           videos,
        "stats_fetched_at": now,
        "new_milestones":   new_milestones,
    })


@router.get("/milestones")
def get_milestones(request: Request):
    session_id = request.session.get("session_id")
    data, _ = get_session(session_id)
    if not data:
        return JSONResponse({"error": "Not authenticated"}, status_code=401)
    channel_id = (data.get("channel") or {}).get("channel_id")
    state = _get_milestone_state(
        channel_id,
        data.get("channel") or {},
        data.get("videos") or [],
        data.get("analytics"),
    )
    return JSONResponse(state)


@router.get("/logout")
def logout(request: Request):
    session_id = request.session.pop("session_id", None)
    if session_id:
        _user_data.pop(session_id, None)
        _user_creds.pop(session_id, None)
        _pending_flows.pop(session_id, None)
        # Keep the DB row intact so re-login can restore cached insights
        # without triggering a fresh (token-consuming) analysis.
    return RedirectResponse(f"{_request_base(request)}")


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
        # Older sessions may have been persisted before email/display_name/picture
        # were added to user_data. Repair from the session row + UserAccount table
        # so the Settings card never falls back to "Account / ?".
        if not google_email:
            row = db.query(UserSession).filter_by(session_id=session_id).first()
            if row and hasattr(row, "owner_email") and row.owner_email:
                google_email = row.owner_email

        display_name    = user_data.get("display_name", "")
        profile_picture = user_data.get("profile_picture", "")
        if google_email and (not display_name or not profile_picture):
            acct = db.query(UserAccount).filter_by(email=google_email).first()
            if acct:
                display_name    = display_name    or (acct.display_name    or "")
                profile_picture = profile_picture or (acct.profile_picture or "")

        # Subscription info — free users pool across sibling channels.
        from app.analysis_gate import _resolve_billing_channel
        billing_channel = _resolve_billing_channel(db, channel_id)
        sub = db.query(UserSubscription).filter_by(channel_id=billing_channel).first()
        plan             = sub.plan if sub else "free"
        status           = sub.status if sub else "free"
        billing_cycle    = sub.billing_cycle if sub else "none"
        is_lifetime      = sub.is_lifetime if sub else False
        monthly_allowance = sub.monthly_allowance if sub else 3
        monthly_used     = sub.monthly_used if sub else 0
        monthly_remaining = max(0, monthly_allowance - monthly_used)
        pack_balance     = sub.pack_balance if sub else 0
        usage_pct        = round(monthly_used / monthly_allowance * 100) if monthly_allowance > 0 else 100
        channels_allowed = sub.channels_allowed if sub else 1
        reset_date       = sub.reset_date.isoformat() if sub and sub.reset_date else None

        # Dev bypass — override usage fields so the dashboard reliably shows
        # a fresh free-tier state during testing. DB untouched.
        from app.analysis_gate import _BYPASS
        if _BYPASS:
            monthly_allowance = 3
            monthly_used      = 0
            monthly_remaining = 3
            pack_balance      = 0
            usage_pct         = 0

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

        # Free-tier feature-gate status — tells the frontend which features
        # are reachable vs locked so gated pages can render the upsell modal
        # on load. Non-free plans get an empty map (frontend keys off
        # plan !== 'free' first anyway).
        #
        # Trial model (2026-05-18): TRIAL_FEATURES are reachable on free
        # (the 5-credit pool gates spending, surfaced by the usage bar /
        # 402, not here). PAID_ONLY_FEATURES are hard-locked. No DB query
        # needed — both are static sets.
        from app.analysis_gate import TRIAL_FEATURES, PAID_ONLY_FEATURES
        free_tier_features = {}
        if (plan or "free") == "free" and channel_id and sub is not None:
            for feat in TRIAL_FEATURES:
                free_tier_features[feat] = "allowed"
            for feat in PAID_ONLY_FEATURES:
                free_tier_features[feat] = "locked"

        return JSONResponse({
            "email":                google_email,
            "display_name":         display_name,
            "profile_picture":      profile_picture,
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
            "free_tier_features":   free_tier_features,
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
