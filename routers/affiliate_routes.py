"""
Affonso embedded affiliate dashboard:
- POST /api/affiliate/embed-token  — mints a 30-min embed token for the
  current user. Used by the React /referrals page to render the iframe.
"""
import os
import requests
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from routers.auth import get_session

router = APIRouter()

AFFONSO_API_KEY  = os.environ.get("AFFONSO_API_KEY", "")
AFFONSO_PROGRAM  = "cmoifufi500062qvcxewv6vqo"
AFFONSO_TOKEN_URL = "https://api.affonso.io/v1/embed/token"


@router.post("/embed-token")
def get_embed_token(request: Request):
    session_id = request.session.get("session_id")
    user_data, _ = get_session(session_id)
    if not user_data:
        return JSONResponse({"error": "Not authenticated"}, status_code=401)

    if not AFFONSO_API_KEY:
        return JSONResponse({"error": "Affiliate dashboard is not configured"}, status_code=503)

    email = user_data.get("email") or user_data.get("channel", {}).get("email", "")
    name  = user_data.get("display_name") or user_data.get("channel", {}).get("channel_name", "")
    # Google ID is stable across channel switches; falls back to email.
    external_id = user_data.get("google_id") or email

    if not email:
        return JSONResponse({"error": "Account is missing an email"}, status_code=400)

    try:
        resp = requests.post(
            AFFONSO_TOKEN_URL,
            headers={
                "Authorization": f"Bearer {AFFONSO_API_KEY}",
                "Content-Type":  "application/json",
            },
            json={
                "programId": AFFONSO_PROGRAM,
                "partner": {"email": email, "name": name or email.split("@")[0]},
                "externalUserId": external_id,
            },
            timeout=15,
        )
    except requests.RequestException as e:
        print(f"[affiliate] Affonso request failed: {e}")
        return JSONResponse({"error": "Could not reach affiliate provider"}, status_code=502)

    if resp.status_code >= 400:
        print(f"[affiliate] Affonso {resp.status_code}: {resp.text[:300]}")
        return JSONResponse({"error": "Affiliate provider rejected the request"}, status_code=502)

    try:
        token = resp.json().get("data", {}).get("publicToken", "")
    except ValueError:
        token = ""

    if not token:
        return JSONResponse({"error": "Affiliate provider returned no token"}, status_code=502)

    return JSONResponse({"token": token})
