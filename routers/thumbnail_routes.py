"""
Thumbnail IQ API routes.

POST /thumbnail/upload       — upload image, run Layer 1, return technical score
POST /thumbnail/analyze      — run Layer 2 Claude analysis (costs 1 credit)
GET  /thumbnail/latest       — load most recent non-cleared analysis
GET  /thumbnail/video-ideas  — load saved video ideas for the dropdown (free)
POST /thumbnail/clear        — soft-delete (sets cleared_at)
"""

import json
import uuid
import base64
import datetime

from fastapi import APIRouter, Request, File, UploadFile, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from routers.auth import get_session
from database.models import SessionLocal, ThumbnailAnalysis
from app.analysis_gate import check_and_deduct, refund_credit
from app.thumbnail import (
    detect_format,
    get_size_bracket,
    run_layer1,
    md5_hash,
    get_or_build_benchmark_pool,
    calculate_benchmark_comparison,
    calculate_percentile,
    run_layer2,
)

router = APIRouter()


# ─── helpers ──────────────────────────────────────────────────────────────────

def _row_to_dict(row: ThumbnailAnalysis) -> dict:
    return {
        "id":                   row.id,
        "channel_id":           row.channel_id,
        "thumbnail_hash":       row.thumbnail_hash,
        "thumbnail_b64":        row.thumbnail_b64,
        "video_title":          row.video_title,
        "confirmed_keyword":    row.confirmed_keyword,
        "format":               row.format,
        "size_bracket":         row.size_bracket,
        "uploaded_at":          row.uploaded_at.isoformat() if row.uploaded_at else None,
        "last_analyzed_at":     row.last_analyzed_at.isoformat() if row.last_analyzed_at else None,
        "layer1_scores":        json.loads(row.layer1_scores)        if row.layer1_scores        else None,
        "layer2_scores":        json.loads(row.layer2_scores)        if row.layer2_scores        else None,
        "benchmark_comparison": json.loads(row.benchmark_comparison) if row.benchmark_comparison else None,
        "algorithm_score":      row.algorithm_score,
        "claude_score":         row.claude_score,
        "final_score":          row.final_score,
        "niche_avg_score":      row.niche_avg_score,
        "user_percentile":      row.user_percentile,
        "linked_video_idea":    json.loads(row.linked_video_idea)    if row.linked_video_idea    else None,
    }


def _get_channel_data(request: Request):
    """Return (data, creds, channel_id, subscribers) from session."""
    data, creds = get_session(request.session.get("session_id"))
    if not data or not creds:
        return None, None, None, 0
    ch         = (data or {}).get("channel", {})
    channel_id = ch.get("channel_id", "")
    subs       = ch.get("subscribers", 0)
    return data, creds, channel_id, subs


# ─── GET /thumbnail/video-ideas ───────────────────────────────────────────────

@router.get("/video-ideas")
def get_video_ideas_for_dropdown(request: Request, channel_id: str = ""):
    """
    Returns saved video ideas for the thumbnail upload dropdown.
    Free — no credit charged. Read-only from DB.
    """
    data, creds, session_channel_id, _ = _get_channel_data(request)
    if not creds:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)

    effective_channel_id = channel_id or session_channel_id
    if not effective_channel_id:
        return JSONResponse({"ideas": [], "has_ideas": False})

    from database.models import ChannelVideoIdeas

    db = SessionLocal()
    try:
        row = (
            db.query(ChannelVideoIdeas)
            .filter_by(channel_id=effective_channel_id)
            .order_by(ChannelVideoIdeas.last_updated.desc())
            .first()
        )
        if not row:
            return JSONResponse({"ideas": [], "has_ideas": False})

        try:
            ideas = json.loads(row.ideas_json)
        except Exception:
            ideas = []

        if not ideas:
            return JSONResponse({"ideas": [], "has_ideas": False})

        return JSONResponse({
            "ideas":        ideas,
            "has_ideas":    True,
            "last_updated": row.last_updated.isoformat() if row.last_updated else None,
        })
    finally:
        db.close()


# ─── POST /thumbnail/upload ────────────────────────────────────────────────────

@router.post("/upload")
async def upload_thumbnail(
    request:           Request,
    file:              UploadFile = File(...),
    video_title:       str        = Form(default=""),
    confirmed_keyword: str        = Form(default=""),
    video_idea_id:     str        = Form(default=""),
    video_idea_data:   str        = Form(default=""),
):
    data, creds, channel_id, subs = _get_channel_data(request)
    if not creds:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)

    if file.content_type not in ("image/jpeg", "image/png", "image/jpg"):
        return JSONResponse({"error": "Only JPG and PNG files are accepted."}, status_code=400)

    image_bytes = await file.read()
    if len(image_bytes) > 4 * 1024 * 1024:
        return JSONResponse({"error": "File exceeds 4 MB limit."}, status_code=400)

    thumb_hash = md5_hash(image_bytes)
    thumb_b64  = base64.b64encode(image_bytes).decode()

    # ── Parse video idea data ─────────────────────────────────────────────────
    linked_idea = None
    if video_idea_data.strip():
        try:
            linked_idea = json.loads(video_idea_data)
        except Exception:
            pass

    idea_rank = None
    if video_idea_id.strip():
        try:
            idea_rank = int(video_idea_id)
        except (ValueError, TypeError):
            pass

    db = SessionLocal()
    try:
        # ── Check for existing result for this exact image ────────────────────
        existing = db.query(ThumbnailAnalysis).filter_by(
            channel_id=channel_id, thumbnail_hash=thumb_hash
        ).filter(ThumbnailAnalysis.cleared_at == None).first()

        if existing:
            return JSONResponse({
                "already_analyzed": True,
                "analysis": _row_to_dict(existing),
            })

        # ── confirmed_keyword: always sent by frontend; fall back only as safety net
        keyword = confirmed_keyword.strip()
        if not keyword:
            if video_title.strip():
                try:
                    from app.seo import _extract_search_terms, _make_client
                    terms   = _extract_search_terms(_make_client(), video_title.strip(), "")
                    keyword = terms[0] if terms else video_title[:60]
                except Exception:
                    keyword = video_title[:60]
            else:
                keyword = (data or {}).get("channel", {}).get("channel_name", "youtube")[:60]

        fmt          = detect_format(video_title) if video_title else "general"
        size_bracket = get_size_bracket(subs)

        # ── Build / load benchmark pool ───────────────────────────────────────
        competitor_context = None
        if linked_idea:
            competitor_context = {
                "targetKeyword": linked_idea.get("targetKeyword", ""),
                "angle":         linked_idea.get("angle", ""),
            }

        benchmark = get_or_build_benchmark_pool(
            db, creds, keyword, fmt, size_bracket,
            competitor_context=competitor_context,
        )

        # ── Run Layer 1 ────────────────────────────────────────────────────────
        l1 = run_layer1(image_bytes)
        if "error" in l1:
            return JSONResponse({"error": l1["error"]}, status_code=500)

        algo_score = l1.get("algorithm_score", 0)

        # ── Benchmark comparison ───────────────────────────────────────────────
        avgs  = benchmark.get("averages", {}) if benchmark else {}
        bcomp = calculate_benchmark_comparison(l1, avgs) if avgs else {}

        # ── Percentile ────────────────────────────────────────────────────────
        niche_avg, percentile = calculate_percentile(db, channel_id, keyword, fmt, size_bracket, algo_score)

        # ── Persist ───────────────────────────────────────────────────────────
        now = datetime.datetime.now(datetime.timezone.utc)
        row = ThumbnailAnalysis(
            id=str(uuid.uuid4()),
            channel_id=channel_id,
            thumbnail_hash=thumb_hash,
            thumbnail_b64=thumb_b64,
            video_title=video_title.strip() or None,
            confirmed_keyword=keyword,
            format=fmt,
            size_bracket=size_bracket,
            uploaded_at=now,
            layer1_scores=json.dumps(l1),
            benchmark_comparison=json.dumps(bcomp),
            algorithm_score=algo_score,
            niche_avg_score=niche_avg,
            user_percentile=percentile,
            linked_video_idea=json.dumps(linked_idea) if linked_idea else None,
        )
        db.add(row)
        db.commit()

        resp = _row_to_dict(row)
        if benchmark:
            resp["benchmark_context"] = {
                "keyword":      keyword,
                "format":       fmt,
                "size_bracket": size_bracket,
                "n_benchmarks": avgs.get("n_benchmarks", 0),
                "averages":     avgs,
                "top_titles":   [v.get("title", "") for v in benchmark.get("videos", [])[:5]],
            }
        return JSONResponse({"already_analyzed": False, "analysis": resp})

    except Exception as e:
        import traceback
        print(f"[thumbnail] upload error: {traceback.format_exc()}")
        return JSONResponse({"error": str(e)}, status_code=500)
    finally:
        db.close()


# ─── POST /thumbnail/analyze ───────────────────────────────────────────────────

class AnalyzeBody(BaseModel):
    thumbnail_id: str


@router.post("/analyze")
def analyze_thumbnail(body: AnalyzeBody, request: Request):
    data, creds, channel_id, subs = _get_channel_data(request)
    if not creds:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)

    db = SessionLocal()
    try:
        row = db.query(ThumbnailAnalysis).filter_by(
            id=body.thumbnail_id, channel_id=channel_id
        ).first()
        if not row:
            return JSONResponse({"error": "Analysis not found."}, status_code=404)

        # ── Return cached Layer 2 if it exists ────────────────────────────────
        if row.layer2_scores:
            return JSONResponse({"analysis": _row_to_dict(row)})

        # ── Credit gate (only charged when actually calling Claude) ───────────
        gate = check_and_deduct(channel_id)
        if not gate["allowed"]:
            return JSONResponse(
                {"error": gate["message"], "show_upgrade": True}, status_code=402
            )

        # ── Load benchmark for context ─────────────────────────────────────────
        keyword      = row.confirmed_keyword or ""
        fmt          = row.format or "general"
        size_bracket = row.size_bracket or "nano"
        benchmark    = get_or_build_benchmark_pool(db, creds, keyword, fmt, size_bracket) or {}

        l1 = json.loads(row.layer1_scores) if row.layer1_scores else {}
        channel_info = {
            "subscribers":  subs,
            "channel_name": (data or {}).get("channel", {}).get("channel_name", ""),
        }

        # ── Extract linked video idea for richer Claude prompt ─────────────────
        linked_idea = None
        if row.linked_video_idea:
            try:
                linked_idea = json.loads(row.linked_video_idea)
            except Exception:
                pass

        # ── Call Claude vision ─────────────────────────────────────────────────
        raw_bytes = base64.b64decode(row.thumbnail_b64) if row.thumbnail_b64 else None
        l2 = run_layer2(
            thumbnail_b64=row.thumbnail_b64,
            layer1=l1,
            benchmark=benchmark,
            channel_info=channel_info,
            video_title=row.video_title or "",
            linked_video_idea=linked_idea,
            image_bytes=raw_bytes,
        )
        if "error" in l2:
            return JSONResponse({"error": l2["error"]}, status_code=500)

        claude_score = l2.get("claude_score", 0)
        final_score  = (row.algorithm_score or 0) + claude_score

        now = datetime.datetime.now(datetime.timezone.utc)
        row.layer2_scores    = json.dumps(l2)
        row.claude_score     = claude_score
        row.final_score      = final_score
        row.last_analyzed_at = now
        db.commit()

        resp = _row_to_dict(row)
        resp["_usage"] = {
            "warning":      gate["warning"],
            "usage_pct":    gate["usage_pct"],
            "pack_balance": gate["pack_balance"],
        }
        return JSONResponse({"analysis": resp})

    except Exception as e:
        import traceback
        print(f"[thumbnail] analyze error: {traceback.format_exc()}")
        refund_credit(channel_id)
        msg = "Analysis timed out. Your credit has been refunded." if "timeout" in str(e).lower() else str(e)
        return JSONResponse({"error": msg}, status_code=500)
    finally:
        db.close()


# ─── GET /thumbnail/latest ─────────────────────────────────────────────────────

@router.get("/latest")
def get_latest(request: Request):
    data, creds, channel_id, _ = _get_channel_data(request)
    if not creds:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)

    db = SessionLocal()
    try:
        row = (
            db.query(ThumbnailAnalysis)
            .filter_by(channel_id=channel_id)
            .filter(ThumbnailAnalysis.cleared_at == None)
            .order_by(ThumbnailAnalysis.uploaded_at.desc())
            .first()
        )
        if not row:
            return JSONResponse({"analysis": None})
        return JSONResponse({"analysis": _row_to_dict(row)})
    finally:
        db.close()


# ─── GET /thumbnail/history ────────────────────────────────────────────────────

@router.get("/history")
def get_history(request: Request):
    """Returns the last 5 non-deleted analyses for this channel, newest first."""
    data, creds, channel_id, _ = _get_channel_data(request)
    if not creds:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)

    db = SessionLocal()
    try:
        rows = (
            db.query(ThumbnailAnalysis)
            .filter_by(channel_id=channel_id)
            .filter(ThumbnailAnalysis.cleared_at == None)
            .order_by(ThumbnailAnalysis.uploaded_at.desc())
            .limit(5)
            .all()
        )
        return JSONResponse({"analyses": [_row_to_dict(r) for r in rows]})
    finally:
        db.close()


# ─── POST /thumbnail/delete ────────────────────────────────────────────────────

class DeleteBody(BaseModel):
    thumbnail_id: str


@router.post("/delete")
def delete_thumbnail(body: DeleteBody, request: Request):
    """Hard-deletes a specific analysis. Only called on explicit user action."""
    _, creds, channel_id, _ = _get_channel_data(request)
    if not creds:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)

    db = SessionLocal()
    try:
        row = db.query(ThumbnailAnalysis).filter_by(
            id=body.thumbnail_id, channel_id=channel_id
        ).first()
        if not row:
            return JSONResponse({"error": "Not found."}, status_code=404)
        db.delete(row)
        db.commit()
        return JSONResponse({"ok": True})
    finally:
        db.close()


# ─── POST /thumbnail/clear ─────────────────────────────────────────────────────

class ClearBody(BaseModel):
    thumbnail_id: str


@router.post("/clear")
def clear_thumbnail(body: ClearBody, request: Request):
    """Kept for backward compatibility. Cleared_at logic removed — use /delete instead."""
    _, creds, channel_id, _ = _get_channel_data(request)
    if not creds:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)
    return JSONResponse({"ok": True})
