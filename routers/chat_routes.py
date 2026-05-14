"""AI Coach — conversational chat surface for the Chat verb on the Feed.

GET  /chat/state    Returns conversation history + allowance/used counts.
POST /chat/send     Body {message}. Burns 1 message from the chat quota.
                    Returns the assistant's reply (non-streaming for v1).
POST /chat/new      Clears the active conversation. Does not refund quota.

Model: Haiku 4.5 with prompt caching on the system prompt + channel
context block. Context is rebuilt fresh on every send (so the latest
audit / stats are always in the prompt) but the cache key is stable
enough that 5-min repeat sends hit cache.

Quota: separate bucket from analyses. Lives on
UserSubscription.chat_allowance / chat_used. Resets on the same monthly
anniversary as analyses (billing._activate handles that).
"""
from __future__ import annotations

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

import json

from app.utils import make_anthropic_client
from database.models import (
    SessionLocal,
    ChatMessage,
    UserSubscription,
    CompetitorAnalysisCache,
    SeoOptimization,
    Milestone,
)
from routers.auth import get_session


router = APIRouter()


# History cap. We send the most recent N turns of conversation history
# to the model so input cost stays bounded. Older messages still live in
# the DB and render in the UI; they're just dropped from the prompt.
HISTORY_TURNS_SENT = 8


# ── Channel context builder ───────────────────────────────────────────────

def _build_channel_context(data: dict, channel_id: str) -> str:
    """Render a compact channel context block for the system prompt.
    Pulls from the session (channel/videos/insights/analytics) AND from
    the database (tracked competitors, optimization history, milestones).
    The coach can't answer questions about data it can't see, so we
    pull every relevant surface here."""
    channel = (data or {}).get("channel", {}) or {}
    videos  = (data or {}).get("videos",  []) or []
    insights = (data or {}).get("insights") or {}
    analytics = (data or {}).get("analytics") or {}

    def _fmtnum(n):
        try:
            n = int(n)
        except Exception:
            return str(n)
        if n >= 1_000_000: return f"{n/1_000_000:.1f}M"
        if n >= 1_000:     return f"{n/1_000:.1f}K"
        return str(n)

    name = channel.get("channel_name") or "the channel"
    subs = _fmtnum(channel.get("subscribers", 0))
    views = _fmtnum(channel.get("total_views", 0))
    video_count = channel.get("video_count", len(videos))

    lines = [
        "# Channel context",
        f"Name: {name}",
        f"Subscribers: {subs}",
        f"Total views: {views}",
        f"Total videos: {video_count}",
    ]

    if channel.get("description"):
        desc = (channel.get("description") or "")[:300].strip()
        lines.append(f"About: {desc}")

    if analytics:
        if analytics.get("views_90d"):
            lines.append(f"Views (last 90d): {_fmtnum(analytics['views_90d'])}")
        if analytics.get("net_subscribers_90d") is not None:
            lines.append(f"Net subscribers (last 90d): {analytics['net_subscribers_90d']:+d}")
        if analytics.get("avg_retention_percent") is not None:
            lines.append(f"Average retention: {analytics['avg_retention_percent']}%")

    # Recent video performance (top 8 by views to give the coach signal)
    if videos:
        sorted_vids = sorted(videos, key=lambda v: v.get("views", 0) or 0, reverse=True)
        top = sorted_vids[:8]
        lines.append("")
        lines.append("# Top recent videos (by views)")
        for v in top:
            title = (v.get("title") or "")[:120]
            vw = _fmtnum(v.get("views", 0))
            lk = _fmtnum(v.get("likes", 0))
            lines.append(f"- \"{title}\" — {vw} views, {lk} likes")

    # Audit summary — score + biggest problems
    if insights:
        lines.append("")
        lines.append("# Audit summary")
        if insights.get("channelSummary"):
            lines.append(f"AI assessment: {insights['channelSummary'][:400]}")
        if insights.get("categoryScores"):
            cs = insights["categoryScores"]
            score_pairs = [
                ("CTR health",          cs.get("ctrHealth")),
                ("Audience retention",  cs.get("audienceRetention")),
                ("Content strategy",    cs.get("contentStrategy")),
                ("Posting consistency", cs.get("postingConsistency")),
                ("Engagement quality",  cs.get("engagementQuality")),
                ("SEO discoverability", cs.get("seoDiscoverability")),
            ]
            score_pairs = [(k, v) for k, v in score_pairs if isinstance(v, (int, float))]
            if score_pairs:
                lines.append("Scores:")
                for k, v in score_pairs:
                    lines.append(f"  {k}: {v}/100")
        if insights.get("biggestRisk"):
            lines.append(f"Biggest risk: {insights['biggestRisk'][:300]}")
        if insights.get("topPerformingPattern"):
            lines.append(f"What's working: {insights['topPerformingPattern'][:300]}")
        actions = insights.get("priorityActions") or []
        if actions:
            lines.append("Open priority actions:")
            for a in actions[:5]:
                problem = (a.get("problem") or "")[:200]
                lines.append(f"  - {problem}")

    # Tracked competitors — pulled from CompetitorAnalysisCache. This is
    # the data the user explicitly added through the Competitors feature,
    # so the coach should reference these by name when relevant.
    competitor_lines = []
    if channel_id:
        db = SessionLocal()
        try:
            rows = (
                db.query(CompetitorAnalysisCache)
                  .filter_by(channel_id=channel_id)
                  .order_by(CompetitorAnalysisCache.analyzed_at.desc())
                  .limit(8)
                  .all()
            )
            seen = set()
            for row in rows:
                try:
                    result = json.loads(row.result_json or "{}")
                except Exception:
                    continue
                meta = result.get("_competitor_meta", {}) or {}
                cname = meta.get("channel_name") or result.get("channel_name") or ""
                if not cname or cname in seen:
                    continue
                seen.add(cname)
                csubs = meta.get("subscribers") or result.get("subscribers") or 0
                cavg  = result.get("avg_views_per_video") or 0
                tagline = (result.get("contentStrategy") or result.get("strategy") or "")[:160]
                line = f"- {cname} ({_fmtnum(csubs)} subs"
                if cavg:
                    line += f", {_fmtnum(cavg)} avg views/video"
                line += ")"
                if tagline:
                    line += f": {tagline}"
                competitor_lines.append(line)
        finally:
            db.close()
    if competitor_lines:
        lines.append("")
        lines.append("# Tracked competitors (user's chosen rivals)")
        lines.extend(competitor_lines)

    # SEO Optimizer history — recent title/description changes. Useful
    # for "did my last change work" type questions.
    seo_lines = []
    if channel_id:
        db = SessionLocal()
        try:
            opt_rows = (
                db.query(SeoOptimization)
                  .filter_by(channel_id=channel_id)
                  .order_by(SeoOptimization.optimized_at.desc())
                  .limit(5)
                  .all()
            )
            for r in opt_rows:
                bv = r.before_views or 0
                cv = r.current_views or 0
                delta = cv - bv
                pct = (delta / bv * 100) if bv > 0 else 0
                seo_lines.append(
                    f"- \"{(r.before_title or '')[:80]}\" -> \"{(r.after_title or '')[:80]}\" "
                    f"({_fmtnum(bv)} -> {_fmtnum(cv)} views, {pct:+.1f}%)"
                )
        finally:
            db.close()
    if seo_lines:
        lines.append("")
        lines.append("# Recent SEO Optimizer edits")
        lines.extend(seo_lines)

    # Earned milestones — context for celebrating wins.
    ms_lines = []
    if channel_id:
        db = SessionLocal()
        try:
            ms_rows = (
                db.query(Milestone)
                  .filter_by(channel_id=channel_id)
                  .order_by(Milestone.achieved_at.desc())
                  .limit(4)
                  .all()
            )
            for m in ms_rows:
                cat = (m.category or "").replace("_", " ")
                ms_lines.append(f"- {_fmtnum(m.tier)} {cat}")
        finally:
            db.close()
    if ms_lines:
        lines.append("")
        lines.append("# Recent milestones earned")
        lines.extend(ms_lines)

    return "\n".join(lines)


def _system_prompt(channel_context: str) -> list[dict]:
    """Build the system prompt as two blocks. The first block (the
    coach persona + rules) is cached. The second block (channel context)
    is also cached. Both have ephemeral cache_control for the 5-min TTL."""
    persona = (
        "You are a YouTube growth coach for the creator using YTGrowth. "
        "You give concise, specific, data-backed advice. Always reference "
        "the creator's actual channel data when relevant, including their "
        "tracked competitors by name. "
        "Avoid generic YouTube tips, they are not paying for that. "
        "If a question needs data that is NOT in the channel context below, "
        "say so plainly and recommend which YTGrowth feature to run to get "
        "it (Competitors, Outliers, Keywords, SEO Studio, Thumbnail Score, "
        "or a fresh Audit). "
        "Keep answers under 200 words unless the user asks for depth. "
        "\n\n"
        "FORMATTING — your responses render as markdown in the chat UI. "
        "Use formatting to make answers scannable: "
        "- Use **bold** for the key metric or recommendation in each paragraph. "
        "- Use numbered lists (1. 2. 3.) when listing concrete actions or steps. "
        "- Use bullet lists (- or *) for parallel items (e.g. three tactics, four channels). "
        "- Use `inline code` for video titles, channel names, exact phrases, or numeric values. "
        "- Use a short heading (### Heading) only when the answer is long enough to need sections. "
        "- Do NOT use italics or em-dashes. Use commas, colons, sentence breaks, or bold. "
        "Default to prose for short answers (under 4 sentences). Reach for lists when the "
        "structure of the answer is genuinely list-shaped. "
        "\n\n"
        "Never mention you are an AI or a language model. You are the coach."
    )
    return [
        {"type": "text", "text": persona, "cache_control": {"type": "ephemeral"}},
        {"type": "text", "text": channel_context, "cache_control": {"type": "ephemeral"}},
    ]


def _summarize_sources(data: dict, channel_id: str) -> list[str]:
    """Return a short human-readable list of which data sources are
    populated for this channel. Shown in the UI so the user can SEE the
    coach is reading real data, not generic tips."""
    sources: list[str] = []
    channel = (data or {}).get("channel", {}) or {}
    videos  = (data or {}).get("videos",  []) or []
    insights = (data or {}).get("insights") or {}
    analytics = (data or {}).get("analytics") or {}

    if channel.get("channel_name"):
        sources.append("Channel stats")
    if videos:
        sources.append(f"{len(videos)} recent videos")
    if analytics:
        sources.append("90d analytics")
    if insights:
        sources.append("Audit")

    if channel_id:
        db = SessionLocal()
        try:
            comp_count = db.query(CompetitorAnalysisCache).filter_by(channel_id=channel_id).count()
            if comp_count > 0:
                sources.append(f"{comp_count} competitor{'s' if comp_count != 1 else ''}")
            seo_count = db.query(SeoOptimization).filter_by(channel_id=channel_id).count()
            if seo_count > 0:
                sources.append(f"{seo_count} SEO edit{'s' if seo_count != 1 else ''}")
            ms_count = db.query(Milestone).filter_by(channel_id=channel_id).count()
            if ms_count > 0:
                sources.append(f"{ms_count} milestone{'s' if ms_count != 1 else ''}")
        finally:
            db.close()

    return sources


# ── Endpoints ─────────────────────────────────────────────────────────────

def _get_or_create_sub(db, channel_id: str, email: str = "") -> UserSubscription:
    sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
    if sub:
        return sub
    sub = UserSubscription(channel_id=channel_id, email=email)
    db.add(sub)
    db.commit()
    return sub


@router.get("/state")
def chat_state(request: Request):
    """Return the active conversation history + quota state. Frontend hits
    this on mount to hydrate the Chat page."""
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)
    channel_id = (data or {}).get("channel", {}).get("channel_id", "") or (data or {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"error": "No channel."}, status_code=400)

    db = SessionLocal()
    try:
        sub = _get_or_create_sub(db, channel_id, (data or {}).get("channel", {}).get("email", ""))
        rows = (
            db.query(ChatMessage)
              .filter_by(channel_id=channel_id)
              .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
              .all()
        )
        messages = [
            {
                "role": r.role,
                "content": r.content,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ]
        return JSONResponse({
            "messages":  messages,
            "allowance": int(sub.chat_allowance or 0),
            "used":      int(sub.chat_used or 0),
            "remaining": max(0, int(sub.chat_allowance or 0) - int(sub.chat_used or 0)),
            "plan":      sub.plan or "free",
            "sources":   _summarize_sources(data, channel_id),
        })
    finally:
        db.close()


class SendBody(BaseModel):
    message: str


@router.post("/send")
def chat_send(body: SendBody, request: Request):
    """Add the user message to history, call Claude, save the assistant
    reply, decrement quota by 1. Returns the assistant message."""
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)
    channel_id = (data or {}).get("channel", {}).get("channel_id", "") or (data or {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"error": "No channel."}, status_code=400)

    user_text = (body.message or "").strip()
    if not user_text:
        return JSONResponse({"error": "Empty message."}, status_code=400)
    if len(user_text) > 2000:
        return JSONResponse({"error": "Message too long. Keep it under 2000 characters."}, status_code=400)

    db = SessionLocal()
    try:
        email = (data or {}).get("channel", {}).get("email", "")
        sub = _get_or_create_sub(db, channel_id, email)

        # Quota check
        allowance = int(sub.chat_allowance or 0)
        used      = int(sub.chat_used or 0)
        if used >= allowance:
            return JSONResponse({
                "error": "out_of_messages",
                "allowance": allowance,
                "used": used,
                "plan": sub.plan or "free",
            }, status_code=402)

        # Load prior conversation history. We only send the last
        # HISTORY_TURNS_SENT * 2 messages (one user + one assistant per turn)
        # to keep the prompt bounded.
        prior = (
            db.query(ChatMessage)
              .filter_by(channel_id=channel_id)
              .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
              .all()
        )
        # Persist the user's new message before calling Claude so we don't
        # lose it on a network failure mid-call.
        user_row = ChatMessage(channel_id=channel_id, role="user", content=user_text)
        db.add(user_row)
        db.commit()

        # Build the message list to send. Take the last N turns.
        history_to_send = prior[-(HISTORY_TURNS_SENT * 2):]
        api_messages = [{"role": m.role, "content": m.content} for m in history_to_send]
        api_messages.append({"role": "user", "content": user_text})

        # System prompt with cached channel context. Pulls from session +
        # multiple DB tables (competitors, SEO edits, milestones) so the
        # coach always answers from real data the user can verify.
        ctx_block = _build_channel_context(data, channel_id)
        system_blocks = _system_prompt(ctx_block)
        sources_used = _summarize_sources(data, channel_id)

        # Call Claude Haiku 4.5
        client = make_anthropic_client()
        try:
            resp = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=1024,
                system=system_blocks,
                messages=api_messages,
            )
            assistant_text = "".join(
                getattr(block, "text", "") for block in (resp.content or [])
                if getattr(block, "type", "text") == "text"
            ).strip()
        except Exception as e:
            print(f"[chat] anthropic error: {e}")
            # Roll back the user message we just persisted so they can retry
            # without seeing their question stranded with no answer.
            try:
                db.delete(user_row)
                db.commit()
            except Exception:
                pass
            return JSONResponse({"error": "The coach is having a moment. Try again in a few seconds."}, status_code=503)

        if not assistant_text:
            try:
                db.delete(user_row)
                db.commit()
            except Exception:
                pass
            return JSONResponse({"error": "Empty response from the coach. Try rephrasing."}, status_code=503)

        # Persist assistant reply + decrement quota
        assistant_row = ChatMessage(channel_id=channel_id, role="assistant", content=assistant_text)
        db.add(assistant_row)
        sub.chat_used = used + 1
        db.commit()

        return JSONResponse({
            "message": {
                "role":       "assistant",
                "content":    assistant_text,
                "created_at": assistant_row.created_at.isoformat() if assistant_row.created_at else None,
                "sources":    sources_used,
            },
            "allowance": allowance,
            "used":      sub.chat_used,
            "remaining": max(0, allowance - sub.chat_used),
            "sources":   sources_used,
        })
    finally:
        db.close()


@router.post("/new")
def chat_new(request: Request):
    """Start a fresh conversation. Deletes existing history for this
    channel. Does NOT refund quota."""
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)
    channel_id = (data or {}).get("channel", {}).get("channel_id", "") or (data or {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"error": "No channel."}, status_code=400)

    db = SessionLocal()
    try:
        db.query(ChatMessage).filter_by(channel_id=channel_id).delete()
        db.commit()
        return JSONResponse({"ok": True})
    finally:
        db.close()
