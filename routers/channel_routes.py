"""
Channel management endpoints:
  GET  /channels/list       — list all active channels for this Google account
  POST /channels/switch     — switch the current session to a different channel
  POST /channels/disconnect — soft-disconnect a channel (preserves all data)
"""
import json
import datetime
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from database.models import (
    SessionLocal, ChannelRegistry, UserSession,
    UserSubscription, UserEmailPreferences,
)
from routers.auth import get_session, _user_data, _persist_session

router = APIRouter()


def _get_owner_email(session_id: str | None) -> str | None:
    """Return the owner_email stored in the UserSession row."""
    if not session_id:
        return None
    try:
        db = SessionLocal()
        row = db.query(UserSession).filter_by(session_id=session_id).first()
        if row:
            # Try the owner_email column first; fall back to user_data
            if hasattr(row, "owner_email") and row.owner_email:
                return row.owner_email
            # Fallback: parse user_data_json
            user_data = json.loads(row.user_data_json or "{}")
            return user_data.get("email", "")
        return None
    except Exception as e:
        print(f"owner_email lookup error: {e}")
        return None
    finally:
        db.close()


@router.get("/list")
def list_channels(request: Request):
    session_id = request.session.get("session_id")
    user_data, _ = get_session(session_id)
    if not user_data:
        return JSONResponse({"error": "Not authenticated"}, status_code=401)

    owner_email = _get_owner_email(session_id) or user_data.get("email", "")
    current_channel_id = user_data.get("channel", {}).get("channel_id", "")

    if not owner_email:
        return JSONResponse({"channels": [], "channels_allowed": 1, "can_add_more": False})

    db = SessionLocal()
    try:
        # Get subscription for channels_allowed
        sub = db.query(UserSubscription).filter_by(channel_id=current_channel_id).first()
        channels_allowed = sub.channels_allowed if sub else 1

        rows = db.query(ChannelRegistry).filter_by(
            owner_email=owner_email,
            is_active=True,
        ).order_by(ChannelRegistry.connected_at.asc()).all()

        channels = []
        for row in rows:
            ch_score = 0
            if row.channel_id == current_channel_id:
                insights = user_data.get("insights") or {}
                ch_score = insights.get("channelScore", 0)
            row_sub = db.query(UserSubscription).filter_by(channel_id=row.channel_id).first()
            channels.append({
                "channel_id":        row.channel_id,
                "channel_name":      row.channel_name or "",
                "channel_thumbnail": row.channel_thumbnail or "",
                "subscribers":       row.subscribers or 0,
                "is_current":        row.channel_id == current_channel_id,
                "channel_score":     ch_score,
                "plan":              row_sub.plan if row_sub else "free",
                "connected_at":      row.connected_at.isoformat() if row.connected_at else "",
            })

        can_add_more = len(channels) < channels_allowed

        return JSONResponse({
            "channels":         channels,
            "channels_allowed": channels_allowed,
            "can_add_more":     can_add_more,
        })
    finally:
        db.close()


@router.post("/switch")
def switch_channel(request: Request):
    """Switch the active session to a different channel owned by the same email."""
    import asyncio

    session_id = request.session.get("session_id")
    user_data, creds = get_session(session_id)
    if not user_data:
        return JSONResponse({"error": "Not authenticated"}, status_code=401)

    owner_email = _get_owner_email(session_id) or user_data.get("email", "")

    # We need the body synchronously — use a workaround
    import asyncio
    try:
        body = asyncio.get_event_loop().run_until_complete(request.json())
    except Exception:
        body = {}
    target_channel_id = body.get("channel_id", "")

    if not target_channel_id:
        return JSONResponse({"error": "channel_id required"}, status_code=400)

    db = SessionLocal()
    try:
        # Verify ownership
        registry = db.query(ChannelRegistry).filter_by(
            owner_email=owner_email,
            channel_id=target_channel_id,
            is_active=True,
        ).first()
        if not registry:
            return JSONResponse({"error": "Channel not found or not owned by this account"}, status_code=403)

        # Find the session row for this channel
        # We need to load that channel's user data from existing sessions or the registry
        # Look for an existing session that has this channel
        all_rows = db.query(UserSession).all()
        target_session_data = None
        for row in all_rows:
            try:
                ud = json.loads(row.user_data_json or "{}")
                if ud.get("channel", {}).get("channel_id") == target_channel_id:
                    target_session_data = ud
                    break
            except Exception:
                continue

        if target_session_data:
            # Preserve current session_id but load the target channel's data
            new_data = dict(target_session_data)
            new_data["email"]           = owner_email
            new_data["display_name"]    = user_data.get("display_name", "")
            new_data["profile_picture"] = user_data.get("profile_picture", "")
            new_data["google_id"]       = user_data.get("google_id", "")

            _user_data[session_id] = new_data
            if creds:
                _persist_session(session_id, creds, new_data)

            # Update owner_email on session row
            row = db.query(UserSession).filter_by(session_id=session_id).first()
            if row:
                row.owner_email = owner_email
                db.commit()

            return JSONResponse({"success": True})
        else:
            # Channel exists in registry but no session data — redirect to re-auth
            return JSONResponse({"success": False, "needs_auth": True})
    finally:
        db.close()


@router.post("/disconnect")
async def disconnect_channel(request: Request):
    """Soft-disconnect a channel. Preserves all data. Blocked if it's the last active channel."""
    session_id = request.session.get("session_id")
    user_data, _ = get_session(session_id)
    if not user_data:
        return JSONResponse({"error": "Not authenticated"}, status_code=401)

    owner_email = _get_owner_email(session_id) or user_data.get("email", "")
    body = await request.json()
    target_channel_id = body.get("channel_id", "")

    if not target_channel_id:
        return JSONResponse({"error": "channel_id required"}, status_code=400)

    db = SessionLocal()
    try:
        # Verify ownership
        registry = db.query(ChannelRegistry).filter_by(
            owner_email=owner_email,
            channel_id=target_channel_id,
            is_active=True,
        ).first()
        if not registry:
            return JSONResponse({"error": "Channel not found or not owned by this account"}, status_code=403)

        # Block if it's the only active channel
        active_count = db.query(ChannelRegistry).filter_by(
            owner_email=owner_email,
            is_active=True,
        ).count()
        if active_count <= 1:
            return JSONResponse(
                {"error": "You must have at least one connected channel."},
                status_code=400,
            )

        registry.is_active       = False
        registry.disconnected_at = datetime.datetime.utcnow()
        db.commit()

        return JSONResponse({"success": True})
    finally:
        db.close()
