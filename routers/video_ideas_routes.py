"""
Video Ideas routes
  GET  /video-ideas          — free load: pool competitor ideas from DB
  POST /video-ideas/seed     — backfill ideas from frontend localStorage (free)
  POST /video-ideas/refresh  — paid: Claude-enriched ideas (1 credit)
"""
import json
import re
import datetime
from datetime import timezone, timedelta

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from routers.auth import get_session
from app.analysis_gate import check_and_deduct, refund_credit, check_free_tier_access
from app.utils import make_anthropic_client
from database.models import (
    SessionLocal,
    CompetitorVideoIdeas,
    ChannelVideoIdeas,
    CompetitorAnalysisCache,
    UserSubscription,
)


# Free users only see the top 5 ideas after the current ranking — no
# refresh, no further access. See _cap_for_free() usage below.
FREE_IDEAS_CAP = 5


def _is_free_plan(db, channel_id: str) -> bool:
    """Quick plan lookup for partial-access gating (Video Ideas cap)."""
    if not channel_id:
        return True
    sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
    return (sub.plan if sub else "free") == "free"


def _cap_for_free(ideas: list, is_free: bool) -> list:
    """Take the first N ideas after the current ranking for free users."""
    if is_free and isinstance(ideas, list):
        return ideas[:FREE_IDEAS_CAP]
    return ideas

router = APIRouter()


# ── helpers ──────────────────────────────────────────────────────────────────

def _load_cached(db, channel_id: str):
    """Return the saved ChannelVideoIdeas row or None."""
    return db.query(ChannelVideoIdeas).filter_by(channel_id=channel_id).first()


def _competitor_signal_score(db, channel_id: str, competitor_id: str) -> int:
    """
    Look up the stored competitor analysis and compute a base opportunity score
    (55–85) reflecting how strongly YouTube distributes content in this niche.
    Higher score = competitor has videos YouTube pushed to wide audiences.
    """
    cache_row = (
        db.query(CompetitorAnalysisCache)
        .filter_by(channel_id=channel_id, competitor_id=competitor_id)
        .order_by(CompetitorAnalysisCache.analyzed_at.desc())
        .first()
    )
    if not cache_row:
        return 65  # no data, neutral score

    try:
        result = json.loads(cache_row.result_json)
    except Exception:
        return 65

    comp_subs = result.get("_meta", {}).get("competitor_subscribers", 0)
    top_videos = result.get("topVideosToStudy", [])

    best_ratio = 0.0
    for v in top_videos:
        v_views = v.get("views", 0)
        if comp_subs > 0:
            ratio = v_views / comp_subs
            if ratio > best_ratio:
                best_ratio = ratio
        elif v_views >= 100_000:
            best_ratio = max(best_ratio, 2.0)

    if best_ratio >= 3.0:
        return 82   # very_high — YouTube actively pushing this niche
    if best_ratio >= 1.5:
        return 74   # high signal
    if best_ratio >= 0.5:
        return 67   # medium signal
    return 60       # weak signal


def _pool_competitor_ideas(db, channel_id: str) -> list:
    """
    Pull ALL competitor analysis runs for this channel, gather every
    videoIdeas array, deduplicate by title (case-insensitive).
    Opportunity scores are computed per-competitor from their analysis cache
    (signal strength of how hard YouTube pushes content in this niche).
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

        # Base score for this competitor derived from their cached analysis
        base_score = _competitor_signal_score(db, channel_id, row.competitor_id)

        for idx, idea in enumerate(ideas):
            title_key = idea.get("title", "").lower().strip()
            if not title_key or title_key in seen_titles:
                continue
            seen_titles.add(title_key)
            # Earlier ideas from Claude's list are usually stronger — decay by 3 per position
            opp_score = max(base_score - (idx * 3), base_score - 9)
            pooled.append({
                "rank": rank,
                "title": idea.get("title", ""),
                "targetKeyword": idea.get("targetKeyword", ""),
                "angle": idea.get("angle", ""),
                "opportunityScore": opp_score,
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
        is_free = _is_free_plan(db, channel_id)

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
                    "ideas":        _cap_for_free(ideas, is_free),
                    "source":       cached.source,
                    "last_updated": _time_ago(cached.last_updated),
                    "stale":        is_stale,
                    "free_capped":  is_free,
                })

        # 2. No cache → pool from raw competitor analyses
        pooled = _pool_competitor_ideas(db, channel_id)
        if not pooled:
            return JSONResponse({"ideas": [], "source": "empty", "free_capped": is_free})

        # Cache the pooled result
        _save_ideas(db, channel_id, pooled, "competitor")

        return JSONResponse({
            "ideas":        _cap_for_free(pooled, is_free),
            "source":       "competitor",
            "last_updated": "today",
            "stale":        False,
            "free_capped":  is_free,
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


class MarkReadyBody(BaseModel):
    channel_id:   str = ""
    idea_rank:    int
    thumbnail_id: str


@router.post("/mark-ready")
def mark_idea_ready(body: MarkReadyBody, request: Request):
    """
    Mark a video idea as Thumbnail Ready after Layer 2 completes.
    Stores thumbnail_ready=true, thumbnail_score, thumbnail_id on the idea.
    Free — no credit charged.
    """
    data, creds = get_session(request.session.get("session_id"))
    if not data or not creds:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)

    channel_id = data.get("channel", {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"error": "No channel_id."}, status_code=400)

    db = SessionLocal()
    try:
        # Get the final score from ThumbnailAnalysis
        from database.models import ThumbnailAnalysis
        thumb = db.query(ThumbnailAnalysis).filter_by(
            id=body.thumbnail_id, channel_id=channel_id
        ).first()
        if not thumb:
            return JSONResponse({"error": "Thumbnail not found."}, status_code=404)

        final_score = thumb.final_score or 0

        # Load and update ideas
        row = db.query(ChannelVideoIdeas).filter_by(channel_id=channel_id).first()
        if not row:
            return JSONResponse({"error": "No ideas found."}, status_code=404)

        try:
            ideas = json.loads(row.ideas_json)
        except Exception:
            return JSONResponse({"error": "Invalid ideas data."}, status_code=500)

        updated = False
        for idea in ideas:
            if idea.get("rank") == body.idea_rank:
                idea["thumbnail_ready"] = True
                idea["thumbnail_score"] = final_score
                idea["thumbnail_id"]    = body.thumbnail_id
                updated = True
                break

        if not updated:
            return JSONResponse({"error": "Idea rank not found."}, status_code=404)

        row.ideas_json   = json.dumps(ideas)
        row.last_updated = datetime.datetime.now(datetime.timezone.utc)
        db.commit()

        return JSONResponse({"success": True, "thumbnail_score": final_score})
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

    # Free-tier: refresh is fully blocked for free users (they keep their
    # 5 capped ideas from competitor runs but cannot generate new ones).
    feat = check_free_tier_access(channel_id, "video_ideas_refresh")
    if not feat["allowed"]:
        return JSONResponse(
            {"error": "locked", "feature": "video_ideas_refresh", "reason": feat.get("reason", "locked")},
            status_code=403,
        )

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

        # Own channel's top video
        top_video_title = ""
        top_video_views = 0
        if videos:
            top = max(videos, key=lambda v: v.get("views", 0), default={})
            top_video_title = top.get("title", "")
            top_video_views = top.get("views", 0)

        # ── 3. Mine competitor analysis cache for algorithmically-proven topics ──
        # A topic is "proven" when YouTube pushed the video to audiences beyond
        # the channel's own subscribers.  We identify this by:
        #   (a) view-to-subscriber ratio > 1.5  (YouTube distributed it widely)
        #   (b) views >= 2x the competitor's average (algorithmic spike)
        # We pull the structured results already stored from competitor analyses.

        # Only consider competitor analyses from the last 12 months.  Older
        # cached analyses reference videos/topics that may no longer reflect
        # what YouTube's algorithm is currently pushing, so we drop them to
        # keep the proven-demand pool fresh.
        recency_cutoff = datetime.datetime.now(timezone.utc) - timedelta(days=365)
        cache_rows = (
            db.query(CompetitorAnalysisCache)
            .filter(CompetitorAnalysisCache.channel_id == channel_id)
            .filter(CompetitorAnalysisCache.analyzed_at >= recency_cutoff)
            .order_by(CompetitorAnalysisCache.analyzed_at.desc())
            .all()
        )

        proven_topics = []    # topics confirmed by YouTube distribution
        gap_topics    = []    # content gaps from competitor analysis

        for row in cache_rows:
            try:
                result = json.loads(row.result_json)
            except Exception:
                continue

            comp_subs = result.get("_meta", {}).get("competitor_subscribers", 0)

            # topVideosToStudy — videos the AI flagged as outliers
            for v in result.get("topVideosToStudy", []):
                v_views = v.get("views", 0)
                v_title = v.get("title", "")
                if not v_title:
                    continue
                # Score the strength of the algorithmic signal
                signal_strength = "medium"
                if comp_subs > 0:
                    ratio = v_views / comp_subs
                    if ratio >= 3:
                        signal_strength = "very_high"
                    elif ratio >= 1.5:
                        signal_strength = "high"
                elif v_views >= 50_000:
                    signal_strength = "high"

                proven_topics.append({
                    "competitor_video_title": v_title,
                    "views": v_views,
                    "signal_strength": signal_strength,
                    "why_it_worked": v.get("whyItWorked", ""),
                })

            # topTopics — clusters that drive the most views for this competitor
            for t in result.get("topTopics", []):
                topic_name = t.get("topic", "")
                topic_avg  = t.get("avgViews", 0)
                if topic_name and topic_avg > avg_views:
                    proven_topics.append({
                        "competitor_video_title": f"[Topic cluster] {topic_name}",
                        "views": topic_avg,
                        "signal_strength": "high" if topic_avg > avg_views * 3 else "medium",
                        "why_it_worked": f"Avg {topic_avg:,} views across {t.get('videoCount', '?')} videos in this niche",
                    })

            # gapsToExploit — opportunities the competitor is leaving on the table
            for g in result.get("gapsToExploit", []):
                gap_text = g.get("gap", "")
                if gap_text:
                    gap_topics.append({
                        "gap": gap_text,
                        "how_to_capture": g.get("howToCapture", ""),
                        "impact": g.get("estimatedImpact", "medium"),
                    })

        # Deduplicate and sort proven topics by signal strength then views
        signal_order = {"very_high": 0, "high": 1, "medium": 2, "low": 3}
        seen_pt = set()
        unique_proven = []
        for pt in sorted(proven_topics, key=lambda x: (signal_order.get(x["signal_strength"], 3), -x["views"])):
            key = pt["competitor_video_title"].lower().strip()[:60]
            if key not in seen_pt:
                seen_pt.add(key)
                unique_proven.append(pt)

        proven_json = json.dumps(unique_proven[:15], indent=2)
        gaps_json   = json.dumps(gap_topics[:8],     indent=2)

        # Also include the raw competitor video ideas pool as a fallback reference
        pooled = _pool_competitor_ideas(db, channel_id)

        # ── 4. Claude call with algorithmic-signal framing ──
        current_year = datetime.datetime.now(timezone.utc).year
        prompt = f"""YOUR CHANNEL:
- Niche/keywords: {channel_keywords}
- Subscribers: {subscribers:,}
- Avg views per video: {avg_views:,}
- Best performing video: "{top_video_title}" ({top_video_views:,} views)
- Channel audit summary: {insights.get("channelSummary", "N/A")}

COMPETITOR VIDEOS THAT YOUTUBE PUSHED TO A WIDE AUDIENCE (last 12 months only):
These are real videos from channels in your niche where YouTube distributed the content
beyond the channel's own subscribers (high view-to-subscriber ratio or large algorithmic spike).
These topics have PROVEN demand — YouTube's algorithm is already promoting this type of content.

{proven_json}

CONTENT GAPS IN THIS NICHE (topics competitors are ignoring):
{gaps_json}

YOUR TASK:
Generate exactly 10 video ideas for this creator that are fresh and relevant for {current_year}.
Every idea MUST be derived from the proven-demand signals above — topics YouTube is already
distributing in this niche.

Rules:
1. Each title must target a topic that appears in the proven-demand data above (or a close
   variation of it). Do NOT invent topics that have no signal in the data.
2. For small channels (under {subscribers:,} subscribers) YouTube needs to be able to suggest
   the video to people who have NEVER heard of the channel. Only topics with broad algorithmic
   appeal qualify. No niche-within-a-niche ideas.
3. Prioritize "very_high" and "high" signal_strength signals over medium ones.
4. Assign opportunityScore (0–100) based on: signal strength (40%), search demand evidence (30%),
   fit for this creator's niche (30%). Never give a score above 80 unless signal_strength is high/very_high.
5. The "angle" field must explain specifically WHY YouTube will distribute this video — not just
   why it's a good idea. If the framing benefits from a time hook, use {current_year} — never an
   older year. Do NOT produce titles with dated year references (e.g. "2023", "2024") unless the
   topic is explicitly retrospective.
6. targetKeyword must be a phrase people actually type into YouTube search.
7. Favour evergreen-but-currently-trending angles over fads that already peaked. The goal is
   distribution in the next 30-90 days, not nostalgia.

Return ONLY valid JSON, no markdown:
[
  {{
    "rank": 1,
    "title": "ready-to-use video title, 50-70 chars, proven-topic framing",
    "targetKeyword": "exact youtube search phrase",
    "angle": "why YouTube will distribute this — reference the signal data",
    "opportunityScore": 82,
    "signalBasis": "brief note on which competitor signal this is derived from",
    "source": "ai"
  }}
]"""

        client = make_anthropic_client()
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            system=(
                "You are a YouTube growth strategist specialising in algorithmic distribution. "
                "Your job is NOT to brainstorm interesting topics — it is to identify topics "
                "that YouTube's recommendation engine is already proven to push to wide audiences "
                "in a given niche, then help a small creator produce the definitive video on those "
                "topics. Every idea you give must have a real data signal backing it. "
                "A good idea for a small channel is one where YouTube will suggest the video to "
                "people who have never seen the channel. Generic, niche-within-a-niche, or "
                "'could be interesting' ideas will waste the creator's time — only give proven ones."
            ),
            messages=[{"role": "user", "content": prompt}],
        )

        raw = message.content[0].text.strip()
        raw = re.sub(r"^```[a-z]*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw).strip()
        ai_ideas = json.loads(raw)

        # 5. If no proven-signal data was available, fall back to pooled competitor ideas
        #    so the user still gets something useful.
        merged_titles = {i["title"].lower().strip() for i in ai_ideas}
        for idea in pooled:
            if idea["title"].lower().strip() not in merged_titles:
                ai_ideas.append(idea)

        # Re-rank by opportunityScore desc, cap at 10
        ai_ideas.sort(key=lambda x: x.get("opportunityScore", 0), reverse=True)
        for i, idea in enumerate(ai_ideas[:10], 1):
            idea["rank"] = i
        final_ideas = ai_ideas[:10]

        # 6. Persist BEFORE returning
        source = "ai" if not pooled else "mixed"
        _save_ideas(db, channel_id, final_ideas, source)

        return JSONResponse({
            "ideas":             final_ideas,
            "source":            source,
            "last_updated":      "today",
            "stale":             False,
            "credits_remaining": gate.get("pack_balance", 0),
            "_usage": {
                "warning":   gate["warning"],
                "usage_pct": gate["usage_pct"],
            },
        })

    except json.JSONDecodeError as e:
        print(f"[video_ideas] JSON parse error: {e}")
        refund_credit(channel_id)
        return JSONResponse({"error": "AI returned invalid data. Your credit has been refunded."}, status_code=500)
    except Exception as e:
        print(f"[video_ideas] refresh error: {e}")
        refund_credit(channel_id)
        return JSONResponse({"error": "Failed to generate ideas. Your credit has been refunded."}, status_code=500)
    finally:
        db.close()
