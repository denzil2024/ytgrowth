from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.seo import analyze_title
from routers.auth import _user_data, _user_creds

router = APIRouter()


def _get_session(request: Request):
    session_id = request.session.get("session_id")
    data  = _user_data.get(session_id) if session_id else None
    creds = _user_creds.get(session_id) if session_id else None
    return data, creds


class TitleAnalyzeRequest(BaseModel):
    title: str
    topic: str = ""


@router.post("/analyze")
def analyze(body: TitleAnalyzeRequest, request: Request):
    _, creds = _get_session(request)
    if not creds:
        return JSONResponse({"error": "Not authenticated. Please login first."}, status_code=401)
    if not body.title.strip():
        return JSONResponse({"error": "Title cannot be empty."}, status_code=400)
    result = analyze_title(creds, body.title.strip(), body.topic.strip())
    return JSONResponse(result)
