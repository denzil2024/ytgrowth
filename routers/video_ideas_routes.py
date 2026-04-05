"""
Video Ideas routes
  GET  /video-ideas          — free load: pool competitor ideas from DB
  POST /video-ideas/seed     — backfill ideas from frontend localStorage (free)
  POST /video-ideas/refresh  — paid: Claude-enriched ideas (1 credit)
"""
import json
import re
import datetime

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from routers.auth import get_session
from app.analysis_gate import check_and_deduct
from app.utils import make_anthropic_client
from database.models import (
    SessionLocal,
    CompetitorVideoIdeas,
    ChannelVideoIdeas,
)

router = APIRouter()


# ── helpers ──────────────────────────────────────────────────────────────────

def _load_cached(db, channel_id: str):
    """Return the saved ChannelVideoIdeas row or None."""
    return db.query(ChannelVideoIdeas).filter_by(channel_id=channel_id).first()


def _pool_competitor_ideas(db, channel_id: str) -> list:
    """
    Pull ALL competitor analysis runs for this channel, gather every
    videoIdeas array, deduplicate by title (case-insensitive), add
    opportunityScore=70 and source="competitor", return up to 10.
    """
    rows = (
        db.query(CompetitorVideoIdeas)
        .filter_by(channel_id=channel_id)
        .order_by(CompetitorVideoIdeas.created_at.desc())
        .all()
    )
    seen_titles = set()
    pooled = []
    rank = 1
    for row in rows:
        try:
            ideas = json.loads(row.ideas_json)
        except Exception:
            continue
        for idea in ideas:
            title_key = idea.get("title", "").lower().strip()
            if not title_key or title_key in seen_titles:
                continue
            seen_titles.add(title_key)
            pooled.append({
                "rank": rank,
                "title": idea.get("title", ""),
                "targetKeyword": idea.get("targetKeyword", ""),
                "angle": idea.get("angle", ""),
                "opportunityScore": 70,
                "source": "competitor",
            })
            rank += 1
            if len(pooled) >= 10:
                break
        if len(pooled) >= 10:
            break
    return pooled


def _save_ideas(db, channel_id: str, ideas: list, source: str):
    """Upsert ChannelVideoIdeas. Never overwrites with empty."""
    if not ideas:
        return
    row = db.query(ChannelVideoIdeas).filter_by(channel_id=channel_id).first()
    now = datetime.datetime.now(datetime.timezone.utc)
    if row:
        row.ideas_json   = json.dumps(ideas)
        row.source       = source
        row.last_updated = now
    else:
        row = ChannelVideoIdeas(
            channel_id=channel_id,
            ideas_json=json.dumps(ideas),
            source=source,
            last_updated=now,
        )
        db.add(row)
    db.commit()


def _time_ago(dt: datetime.datetime) -> str:
    if dt is None:
        return "unknown"
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=datetime.timezone.utc)
    now  = datetime.datetime.now(datetime.timezone.utc)
    diff = now - dt
    days = diff.days
    if days == 0:
        return "today"
    if days == 1:
        return "1 day ago"
    if days < 30:
        return f"{days} days ago"
    months = days // 30
    return f"{months} month{'s' if months > 1 else ''} ago"


# ── GET /video-ideas ─────────────────────────────────────────────────────────

@router.get("")
def get_video_ideas(request: Request, channel_id: str = ""):
    data, creds = get_session(request.session.get("session_id"))
    if not data or not creds:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)

    channel_id = channel_id or data.get("channel", {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"error": "No channel_id."}, status_code=400)

    db = SessionLocal()
    try:
        # 1. Return cached merged result if it exists
        cached = _load_cached(db, channel_id)
        if cached:
            try:
                ideas = json.loads(cached.ideas_json)
            except Exception:
                ideas = []
            if ideas:
                is_stale = (
                    cached.last_updated is not None
                    and (
                        datetime.datetime.now(datetime.timezone.utc)
                        - (cached.last_updated if cached.last_updated.tzinfo
                           else cached.last_updated.replace(tzinfo=datetime.timezone.utc))
                    ).days > 30
                )
                return JSONResponse({
                    "ideas":        ideas,
                    "source":       cached.source,
                    "last_updated": _time_ago(cached.last_updated),
                    "stale":        is_stale,
                })

        # 2. No cache → pool from raw competitor analyses
        pooled = _pool_competitor_ideas(db, channel_id)
        if not pooled:
            return JSONResponse({"ideas": [], "source": "empty"})

        # Cache the pooled result
        _save_ideas(db, channel_id, pooled, "competitor")

        return JSONResponse({
            "ideas":        pooled,
            "source":       "competitor",
            "last_updated": "today",
            "stale":        False,
        })
    finally:
        db.close()


# ── POST /video-ideas/refresh ─────────────────────────────────────────────────

class SeedBody(BaseModel):
    ideas: list
    channel_id: str = ""


@router.post("/seed")
def seed_video_ideas(body: SeedBody, request: Request):
    """
    Backfill: frontend sends ideas extracted from its localStorage cache
    (ytgrowth_tracked_competitors). Free — no credit charged.
    Only writes if the channel has no saved ideas yet.
    """
    data, creds = get_session(request.session.get("session_id"))
    if not data or not creds:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)

    channel_id = body.channel_id or data.get("channel", {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"error": "No channel_id."}, status_code=400)

    if not body.ideas:
        return JSONResponse({"ideas": [], "source": "empty"})

    db = SessionLocal()
    try:
        # Only seed if there's nothing saved yet — never overwrite real data
        existing = _load_cached(db, channel_id)
        if existing:
            try:
                ideas = json.loads(existing.ideas_json)
            except Exception:
                ideas = []
            if ideas:
                return JSONResponse({
                    "ideas":        ideas,
                    "source":       existing.source,
                    "last_updated": _time_ago(existing.last_updated),
                    "stale":        False,
                })

        # Normalise and cap at 10
        ideas = []
        seen  = set()
        for rank, idea in enumerate(body.ideas[:10], 1):
            title_key = (idea.get("title") or "").lower().strip()
            if not title_key or title_key in seen:
                continue
            seen.add(title_key)
            ideas.append({
                "rank":             rank,
                "title":            idea.get("title", ""),
                "targetKeyword":    idea.get("targetKeyword", ""),
                "angle":            idea.get("angle", ""),
                "opportunityScore": idea.get("opportunityScore", 70),
                "source":           "competitor",
            })

        if not ideas:
            return JSONResponse({"ideas": [], "source": "empty"})

        _save_ideas(db, channel_id, ideas, "competitor")
        return JSONResponse({
            "ideas":        ideas,
            "source":       "competitor",
            "last_updated": "today",
            "stale":        False,
        })
    finally:
        db.close()


class RefreshBody(BaseModel):
    channel_id: str = ""


@router.post("/refresh")
def refresh_video_ideas(body: RefreshBody, request: Request):
    data, creds = get_session(request.session.get("session_id"))
    if not data or not creds:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)

    channel_id = body.channel_id or data.get("channel", {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"error": "No channel_id."}, status_code=400)

    # 1. Gate check BEFORE any Claude call
    gate = check_and_deduct(channel_id)
    if not gate["allowed"]:
        return JSONResponse(
            {"error": gate["message"], "show_upgrade": True},
            status_code=402,
        )

    db = SessionLocal()
    try:
        # 2. Gather channel context
        channel   = data.get("channel", {})
        videos    = data.get("videos", []) or []
        insights  = data.get("insights", {}) or {}

        subscribers  = channel.get("subscribers", 0)
        total_views  = channel.get("total_views", 0)
        video_count  = max(channel.get("video_count", 1), 1)
        avg_views    = round(total_views / video_count)
        keywords_raw = channel.get("keywords", "") or ""
        channel_keywords = (
            keywords_raw if isinstance(keywords_raw, str)
            else ", ".join(keywords_raw)
        )

        # Top video from recent list
        top_video_title = ""
        top_video_views = 0
        if videos:
            top = max(videos, key=lambda v: v.get("views", 0), default={})
            top_video_title = top.get("title", "")
            top_video_views = top.get("views", 0)

        top_pattern    = insights.get("topPerformingPattern", "N/A")
        biggest_risk   = insights.get("biggestRisk", "N/A")
        content_score  = (insights.get("categoryScores") or {}).get("contentStrategy", "N/A")

        # Pool existing competitor ideas
        pooled = _pool_competitor_ideas(db, channel_id)
        pooled_json = json.dumps(pooled, indent=2) if pooled else "[]"

        # 3. Claude call
        prompt = f"""CHANNEL DATA:
- Niche/keywords: {channel_keywords}
- Subscribers: {subscribers:,}
- Avg views per video: {avg_views:,}
- Top performing video: {top_video_title} ({top_video_views:,} views)
- Top performing pattern: {top_pattern}
- Biggest risk: {biggest_risk}
- Content strategy score: {content_score}/100

COMPETITOR VIDEO IDEAS ALREADY IDENTIFIED:
{pooled_json}

YOUR TASK:
Generate 10 ranked video ideas for this creator. For each idea:
- Build on or improve the competitor ideas above where relevant
- Fill gaps the competitors have missed
- Match the creator's niche exactly — no off-topic suggestions
- Prioritize ideas likely to outperform their current avg of {avg_views:,} views

Return ONLY valid JSON, no markdown:
[
  {{
    "rank": 1,
    "title": "ready-to-use video title (50-70 chars)",
    "targetKeyword": "primary keyword phrase",
    "angle": "one sentence — why this idea and why now",
    "opportunityScore": 85,
    "source": "ai"
  }}
]"""

        client = make_anthropic_client()
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1500,
            system=(
                "You are a YouTube video idea strategist. Your job is to generate "
                "specific, high-opportunity video ideas for a creator based on their "
                "channel performance data and competitor gaps. Every idea must be "
                "immediately actionable — a title the creator can use today, a keyword "
                "they can rank for, and a clear reason why this idea will outperform "
                "their current content. Never give generic advice. Reference the actual "
                "data provided."
            ),
            messages=[{"role": "user", "content": prompt}],
        )

        raw = message.content[0].text.strip()
        raw = re.sub(r"^```[a-z]*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw).strip()
        ai_ideas = json.loads(raw)

        # 4. Merge AI ideas with competitor ideas; re-rank by opportunityScore desc
        # AI ideas already have source="ai"; ensure competitor pool has source="competitor"
        competitor_set = {i["title"].lower().strip() for i in pooled}
        merged = list(ai_ideas)
        for idea in pooled:
            if idea["title"].lower().strip() not in {i["title"].lower().strip() for i in merged}:
                merged.append(idea)

        merged.sort(key=lambda x: x.get("opportunityScore", 0), reverse=True)
        # Re-assign ranks after sort
        for i, idea in enumerate(merged[:10], 1):
            idea["rank"] = i
        merged = merged[:10]

        # 5. Persist BEFORE returning — never return without a successful DB write
        _save_ideas(db, channel_id, merged, "mixed" if pooled else "ai")

        return JSONResponse({
            "ideas":            merged,
            "source":           "mixed" if pooled else "ai",
            "last_updated":     "today",
            "stale":            False,
            "credits_remaining": gate.get("pack_balance", 0),
            "_usage": {
                "warning":   gate["warning"],
                "usage_pct": gate["usage_pct"],
            },
        })

    except json.JSONDecodeError as e:
        # Claude returned bad JSON — do NOT save, keep existing ideas intact
        print(f"[video_ideas] JSON parse error: {e}")
        return JSONResponse({"error": "AI returned invalid data. Please try again."}, status_code=500)
    except Exception as e:
        print(f"[video_ideas] refresh error: {e}")
        return JSONResponse({"error": "Failed to generate ideas. Please try again."}, status_code=500)
    finally:
        db.close()
