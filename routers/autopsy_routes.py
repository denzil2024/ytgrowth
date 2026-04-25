"""
Post-publish autopsy API.

POST /autopsy/analyze       — body {"video_id": str}
    Charges 1 credit. Runs the autopsy on a single video the user owns,
    persists the report, returns it. Re-running on the same video updates
    the existing row (no duplicate stacking, no double charge protection
    beyond the credit gate).

GET  /autopsy/eligible      — videos the user CAN autopsy
    Returns the user's recent videos that are >=7 days old (so metrics
    have stabilised) with a flag noting which ones already have an
    autopsy on file.

GET  /autopsy/list          — past autopsies (Reports tab)
DELETE /autopsy/{report_id} — remove an autopsy
"""
import json
import datetime

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from routers.auth import get_session
from app.analysis_gate import check_and_deduct, refund_credit
from app.autopsy import analyze_video_autopsy
from database.models import SessionLocal, VideoAutopsyCache

router = APIRouter()


MIN_AGE_DAYS = 7  # video must be at least this old before metrics have stabilised


class AnalyzeBody(BaseModel):
    video_id: str


def _age_days(published_at: str) -> int:
    if not published_at:
        return 0
    try:
        dt = datetime.datetime.fromisoformat(published_at.replace("Z", "+00:00"))
        delta = datetime.datetime.now(datetime.timezone.utc) - dt
        return max(0, delta.days)
    except Exception:
        return 0


@router.post("/analyze")
def analyze(body: AnalyzeBody, request: Request):
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)

    channel = data.get("channel") or {}
    channel_id = channel.get("channel_id", "")
    if not channel_id:
        return JSONResponse({"error": "No channel data."}, status_code=400)

    videos = data.get("videos") or []
    target = next((v for v in videos if v.get("video_id") == body.video_id), None)
    if not target:
        return JSONResponse({"error": "Video not found in your recent uploads."}, status_code=404)

    if _age_days(target.get("published_at", "")) < MIN_AGE_DAYS:
        return JSONResponse(
            {"error": f"Video must be at least {MIN_AGE_DAYS} days old before its metrics have stabilised."},
            status_code=400,
        )

    # Charge 1 credit before the Claude call. Refund on any downstream failure.
    gate = check_and_deduct(channel_id)
    if not gate["allowed"]:
        return JSONResponse(
            {"error": gate["message"], "show_upgrade": True},
            status_code=402,
        )

    try:
        traffic_sources = data.get("traffic_sources") or []
        result = analyze_video_autopsy(
            video=target,
            all_videos=videos,
            channel_stats=channel,
            traffic_sources=traffic_sources,
        )
    except Exception as e:
        refund_credit(channel_id)
        print(f"[autopsy] analyze error: {e}")
        return JSONResponse(
            {"error": "Autopsy generation failed. Your credit has been refunded."},
            status_code=500,
        )

    # Persist (dedup per channel+video — re-runs overwrite).
    db = SessionLocal()
    try:
        existing = (
            db.query(VideoAutopsyCache)
              .filter_by(channel_id=channel_id, video_id=target["video_id"])
              .first()
        )
        payload = json.dumps(result)
        title = target.get("title", "")
        if existing:
            existing.video_title = title
            existing.result_json = payload
            existing.updated_at = datetime.datetime.utcnow()
            row_id = existing.id
        else:
            row = VideoAutopsyCache(
                channel_id=channel_id,
                video_id=target["video_id"],
                video_title=title,
                result_json=payload,
            )
            db.add(row)
            db.flush()
            row_id = row.id
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[autopsy] persist error: {e}")
        row_id = None
    finally:
        db.close()

    return JSONResponse({
        "id": row_id,
        "video_id": target["video_id"],
        "video_title": target.get("title", ""),
        "thumbnail": target.get("thumbnail", ""),
        "result": result,
        "_usage": {"warning": gate["warning"], "usage_pct": gate["usage_pct"]},
    })


@router.get("/eligible")
def eligible(request: Request):
    """Recent videos that can be autopsied — older than MIN_AGE_DAYS, with a
    flag noting whether the user already has an autopsy on file."""
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)

    channel_id = (data.get("channel") or {}).get("channel_id", "")
    videos = data.get("videos") or []

    db = SessionLocal()
    try:
        existing_rows = (
            db.query(VideoAutopsyCache.video_id, VideoAutopsyCache.updated_at)
              .filter_by(channel_id=channel_id)
              .all()
        ) if channel_id else []
        existing = {r[0]: r[1] for r in existing_rows}
    finally:
        db.close()

    out = []
    for v in videos:
        age = _age_days(v.get("published_at", ""))
        if age < MIN_AGE_DAYS:
            continue
        last = existing.get(v.get("video_id"))
        out.append({
            "video_id":    v.get("video_id"),
            "title":       v.get("title", ""),
            "thumbnail":   v.get("thumbnail", ""),
            "views":       v.get("views", 0),
            "published_at": v.get("published_at", ""),
            "age_days":    age,
            "has_autopsy": last is not None,
            "last_autopsy_at": last.isoformat() if last else None,
        })
    out.sort(key=lambda x: x["published_at"], reverse=True)
    return JSONResponse({"videos": out})


@router.get("/list")
def list_reports(request: Request):
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"reports": []})
    channel_id = (data.get("channel") or {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"reports": []})

    # Build a lookup so the Reports tab can show thumbnails.
    videos = data.get("videos") or []
    thumb_by_id = {v.get("video_id"): v.get("thumbnail", "") for v in videos}

    db = SessionLocal()
    try:
        rows = (
            db.query(VideoAutopsyCache)
              .filter_by(channel_id=channel_id)
              .order_by(VideoAutopsyCache.updated_at.desc())
              .all()
        )
        reports = []
        for r in rows:
            try:
                result = json.loads(r.result_json)
            except Exception:
                result = None
            reports.append({
                "id":          r.id,
                "video_id":    r.video_id,
                "video_title": r.video_title,
                "thumbnail":   thumb_by_id.get(r.video_id, ""),
                "result":      result,
                "created_at":  r.created_at.isoformat() if r.created_at else None,
                "updated_at":  r.updated_at.isoformat() if r.updated_at else None,
            })
        return JSONResponse({"reports": reports})
    finally:
        db.close()


@router.delete("/{report_id}")
def delete_report(report_id: int, request: Request):
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)
    channel_id = (data.get("channel") or {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"error": "No channel data."}, status_code=400)
    db = SessionLocal()
    try:
        row = db.query(VideoAutopsyCache).filter_by(id=report_id, channel_id=channel_id).first()
        if row:
            db.delete(row)
            db.commit()
        return JSONResponse({"ok": True})
    finally:
        db.close()
