"""AI Coach — conversational chat surface with multi-conversation support.

GET  /chat/state                     Returns active conversation + quota + list.
POST /chat/send                      Body {message, conversation_id?}. Sends to
                                     a specific conversation, or the current one.
POST /chat/new                       Creates a new conversation, returns its id.
GET  /chat/conversations             Lists all conversations for the channel.
DELETE /chat/conversations/{id}      Deletes a specific conversation + its messages.

Model: Haiku 4.5 with prompt caching on the system prompt + channel
context block. Titles are generated lazily on the first user message in
a conversation with a tiny separate Haiku call (~50 tokens in / 10 out).

Quota: separate bucket from analyses. Lives on
UserSubscription.chat_allowance / chat_used. Resets on the same monthly
anniversary as analyses (billing._activate handles that).
"""
from __future__ import annotations

import datetime
import json
from typing import Optional

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.utils import make_anthropic_client
from database.models import (
    SessionLocal,
    ChatMessage,
    ChatConversation,
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


# ── Conversation helpers ──────────────────────────────────────────────────

def _now() -> datetime.datetime:
    return datetime.datetime.utcnow()


def _backfill_orphan_messages(db, channel_id: str) -> Optional[ChatConversation]:
    """One-time backfill: any chat_messages for this channel with
    conversation_id IS NULL get bundled into a single new ChatConversation
    titled 'Earlier conversation'. Returns that conversation (or None if
    no orphans existed)."""
    orphans = (
        db.query(ChatMessage)
        .filter(ChatMessage.channel_id == channel_id)
        .filter(ChatMessage.conversation_id.is_(None))
        .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
        .all()
    )
    if not orphans:
        return None
    latest = orphans[-1].created_at or _now()
    conv = ChatConversation(
        channel_id=channel_id,
        title="Earlier conversation",
        created_at=orphans[0].created_at or _now(),
        last_message_at=latest,
    )
    db.add(conv)
    db.flush()  # populate conv.id
    for msg in orphans:
        msg.conversation_id = conv.id
    db.commit()
    return conv


def _current_conversation(db, channel_id: str) -> Optional[ChatConversation]:
    """Return the most recently active conversation for the channel,
    or None if the channel has none yet."""
    return (
        db.query(ChatConversation)
        .filter_by(channel_id=channel_id)
        .order_by(ChatConversation.last_message_at.desc(), ChatConversation.id.desc())
        .first()
    )


def _conversations_payload(db, channel_id: str) -> list[dict]:
    """Serialise all conversations for the sidebar rail (newest first)."""
    rows = (
        db.query(ChatConversation)
        .filter_by(channel_id=channel_id)
        .order_by(ChatConversation.last_message_at.desc(), ChatConversation.id.desc())
        .all()
    )
    return [
        {
            "id":              r.id,
            "title":           r.title or "New chat",
            "created_at":      r.created_at.isoformat() if r.created_at else None,
            "last_message_at": r.last_message_at.isoformat() if r.last_message_at else None,
        }
        for r in rows
    ]


def _generate_title(first_user_message: str) -> str:
    """Tiny Haiku call to generate a 3-5 word title from the first user
    message in a conversation. Falls back to a truncated message if the
    API call fails. Cost: roughly 50 tokens in + 10 out, ~$0.00001."""
    text = (first_user_message or "").strip()
    if not text:
        return "New chat"
    try:
        client = make_anthropic_client()
        resp = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=24,
            system=(
                "Generate a 3 to 5 word title for a conversation that starts "
                "with this user message. Plain prose, title case. No quotes, "
                "no trailing punctuation, no emoji, no leading 'A'/'An'/'The'."
            ),
            messages=[{"role": "user", "content": text[:300]}],
        )
        title = "".join(
            getattr(block, "text", "") for block in (resp.content or [])
            if getattr(block, "type", "text") == "text"
        ).strip().strip('"').strip("'").strip(".")
        if not title:
            return text[:40] + ("..." if len(text) > 40 else "")
        # Cap length defensively in case the model overshoots.
        if len(title) > 60:
            title = title[:60].rstrip() + "..."
        return title
    except Exception as e:
        print(f"[chat] title generation failed: {e}")
        return text[:40] + ("..." if len(text) > 40 else "")


def _resolve_conversation(db, channel_id: str, conversation_id: Optional[int]) -> Optional[ChatConversation]:
    """Look up a specific conversation by id, scoped to the channel so a
    user can't read another channel's history. Falls back to None if the
    id doesn't belong to this channel."""
    if not conversation_id:
        return None
    return (
        db.query(ChatConversation)
        .filter_by(id=conversation_id, channel_id=channel_id)
        .first()
    )


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
def chat_state(request: Request, conversation_id: Optional[int] = None):
    """Return an active conversation's messages + quota + list of all
    conversations. If ?conversation_id=N is passed, that conversation
    is the active one (and is validated to belong to the channel).
    Otherwise the most recently active conversation is used."""
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)
    channel_id = (data or {}).get("channel", {}).get("channel_id", "") or (data or {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"error": "No channel."}, status_code=400)

    db = SessionLocal()
    try:
        sub = _get_or_create_sub(db, channel_id, (data or {}).get("channel", {}).get("email", ""))

        # One-time backfill: if this channel has orphan messages from the
        # pre-history schema, bundle them into a single conversation so
        # nothing is lost. Idempotent — returns None after the first run.
        _backfill_orphan_messages(db, channel_id)

        # Resolve the active conversation. Explicit id wins; otherwise
        # use the most recent.
        conv = _resolve_conversation(db, channel_id, conversation_id) or _current_conversation(db, channel_id)

        messages: list[dict] = []
        if conv:
            rows = (
                db.query(ChatMessage)
                  .filter_by(channel_id=channel_id, conversation_id=conv.id)
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
            "messages":         messages,
            "conversation_id":  conv.id if conv else None,
            "conversations":    _conversations_payload(db, channel_id),
            "allowance":        int(sub.chat_allowance or 0),
            "used":             int(sub.chat_used or 0),
            "remaining":        max(0, int(sub.chat_allowance or 0) - int(sub.chat_used or 0)),
            "plan":             sub.plan or "free",
            "sources":          _summarize_sources(data, channel_id),
        })
    finally:
        db.close()


@router.get("/conversations")
def chat_conversations(request: Request):
    """Lightweight list of all conversations for the rail. Used when the
    rail needs to refresh without re-loading the active conversation."""
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)
    channel_id = (data or {}).get("channel", {}).get("channel_id", "") or (data or {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"error": "No channel."}, status_code=400)

    db = SessionLocal()
    try:
        _backfill_orphan_messages(db, channel_id)
        return JSONResponse({"conversations": _conversations_payload(db, channel_id)})
    finally:
        db.close()


class SendBody(BaseModel):
    message: str
    conversation_id: Optional[int] = None


@router.post("/send")
def chat_send(body: SendBody, request: Request):
    """Add the user message to a conversation, call Claude, save the
    assistant reply, decrement quota by 1. Auto-titles the conversation
    on the first user message. If no conversation_id is supplied, the
    most-recent conversation is used, or a new one is created."""
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

        # Backfill orphans before resolving the conversation, so a long-time
        # user's pre-history messages don't disappear when they send for the
        # first time after this schema rollout.
        _backfill_orphan_messages(db, channel_id)

        # Resolve which conversation the message belongs to. Explicit id
        # wins, then most-recent, then create a fresh one.
        conv = _resolve_conversation(db, channel_id, body.conversation_id)
        if conv is None:
            conv = _current_conversation(db, channel_id)
        is_first_message_in_conversation = False
        if conv is None:
            conv = ChatConversation(
                channel_id=channel_id,
                title=None,
                created_at=_now(),
                last_message_at=_now(),
            )
            db.add(conv)
            db.flush()  # populate conv.id before assigning to ChatMessage
            is_first_message_in_conversation = True
        else:
            # First user message in an existing-but-empty conversation
            # also triggers a title. Count messages in this conversation.
            existing_count = (
                db.query(ChatMessage)
                  .filter_by(channel_id=channel_id, conversation_id=conv.id)
                  .count()
            )
            if existing_count == 0:
                is_first_message_in_conversation = True

        # Load prior history scoped to THIS conversation only, then cap at
        # the last N turns to bound prompt tokens.
        prior = (
            db.query(ChatMessage)
              .filter_by(channel_id=channel_id, conversation_id=conv.id)
              .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
              .all()
        )
        # Persist the user's new message before calling Claude so we don't
        # lose it on a network failure mid-call.
        user_row = ChatMessage(
            channel_id=channel_id,
            conversation_id=conv.id,
            role="user",
            content=user_text,
        )
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
        assistant_row = ChatMessage(
            channel_id=channel_id,
            conversation_id=conv.id,
            role="assistant",
            content=assistant_text,
        )
        db.add(assistant_row)
        sub.chat_used = used + 1
        conv.last_message_at = _now()

        # Auto-title on the first user message. Synchronous Haiku call —
        # adds a sub-second to the first reply but keeps the title fresh
        # by the time the response lands in the UI. Costs ~$0.00001 per.
        if is_first_message_in_conversation and not conv.title:
            conv.title = _generate_title(user_text)

        db.commit()

        return JSONResponse({
            "message": {
                "role":       "assistant",
                "content":    assistant_text,
                "created_at": assistant_row.created_at.isoformat() if assistant_row.created_at else None,
                "sources":    sources_used,
            },
            "conversation_id":   conv.id,
            "conversation_title": conv.title,
            "conversations":     _conversations_payload(db, channel_id),
            "allowance":         allowance,
            "used":              sub.chat_used,
            "remaining":         max(0, allowance - sub.chat_used),
            "sources":           sources_used,
        })
    finally:
        db.close()


@router.post("/new")
def chat_new(request: Request):
    """Create a new (empty) conversation. Previous conversations are
    preserved and remain accessible via the sidebar rail. The new
    conversation has no title until the user sends the first message
    (which fires the Haiku title generator)."""
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)
    channel_id = (data or {}).get("channel", {}).get("channel_id", "") or (data or {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"error": "No channel."}, status_code=400)

    db = SessionLocal()
    try:
        # Backfill old orphans first so the rail picks them up.
        _backfill_orphan_messages(db, channel_id)

        # If the current conversation is already empty (user clicked New
        # then immediately clicked New again), reuse it instead of
        # creating a sibling that will sit empty too.
        current = _current_conversation(db, channel_id)
        if current:
            msg_count = (
                db.query(ChatMessage)
                  .filter_by(channel_id=channel_id, conversation_id=current.id)
                  .count()
            )
            if msg_count == 0 and not current.title:
                return JSONResponse({
                    "conversation_id":   current.id,
                    "conversation_title": current.title,
                    "conversations":     _conversations_payload(db, channel_id),
                })

        conv = ChatConversation(
            channel_id=channel_id,
            title=None,
            created_at=_now(),
            last_message_at=_now(),
        )
        db.add(conv)
        db.commit()
        return JSONResponse({
            "conversation_id":   conv.id,
            "conversation_title": conv.title,
            "conversations":     _conversations_payload(db, channel_id),
        })
    finally:
        db.close()


@router.delete("/conversations/{conversation_id}")
def chat_delete_conversation(conversation_id: int, request: Request):
    """Delete a conversation and its messages. Does NOT refund quota."""
    data, _ = get_session(request.session.get("session_id"))
    if not data:
        return JSONResponse({"error": "Not authenticated."}, status_code=401)
    channel_id = (data or {}).get("channel", {}).get("channel_id", "") or (data or {}).get("channel_id", "")
    if not channel_id:
        return JSONResponse({"error": "No channel."}, status_code=400)

    db = SessionLocal()
    try:
        conv = _resolve_conversation(db, channel_id, conversation_id)
        if conv is None:
            return JSONResponse({"error": "Conversation not found."}, status_code=404)

        # Delete the messages first, then the conversation row.
        db.query(ChatMessage).filter_by(
            channel_id=channel_id,
            conversation_id=conv.id,
        ).delete()
        db.delete(conv)
        db.commit()

        return JSONResponse({
            "ok":             True,
            "conversations":  _conversations_payload(db, channel_id),
        })
    finally:
        db.close()
