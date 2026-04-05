"""
Weekly Report — generation, storage, and sending.

Platform cost — never calls check_and_deduct().
"""

import os
import uuid
import json
import secrets
import datetime
from datetime import timedelta

import anthropic

from database.models import (
    SessionLocal,
    WeeklyReport,
    UserEmailPreferences,
)

BASE_URL    = os.environ.get("BASE_URL",    "http://localhost:5173")
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")
LOGO_URL    = f"{BASE_URL}/static/logo.svg"


# ── Date helpers ──────────────────────────────────────────────────────────────

def _week_start() -> datetime.date:
    """Monday of the current UTC week."""
    today = datetime.datetime.utcnow().date()
    return today - timedelta(days=today.weekday())


def _week_end(ws: datetime.date) -> datetime.date:
    return ws + timedelta(days=6)


def _fmt_date_range(ws: datetime.date, we: datetime.date) -> str:
    months = ["Jan","Feb","Mar","Apr","May","Jun",
              "Jul","Aug","Sep","Oct","Nov","Dec"]
    if ws.month == we.month:
        return f"{months[ws.month-1]} {ws.day} – {we.day}"
    return f"{months[ws.month-1]} {ws.day} – {months[we.month-1]} {we.day}"


# ── Snapshot helpers ──────────────────────────────────────────────────────────

def _metric(value, prev):
    """Build a metric dict with delta / delta_pct / direction."""
    if prev is None:
        return {"value": value, "delta": None, "delta_pct": None, "direction": "flat"}
    delta = (value or 0) - (prev or 0)
    delta_pct = None
    if prev and prev > 0:
        delta_pct = round((delta / prev) * 100, 1)
    direction = "up" if delta > 0 else ("down" if delta < 0 else "flat")
    return {"value": value, "delta": delta, "delta_pct": delta_pct, "direction": direction}


def _extract_snapshot(user_data: dict) -> dict:
    """Pull current metrics from user_data."""
    channel   = user_data.get("channel", {})
    analytics = user_data.get("analytics", {})
    videos    = user_data.get("videos", [])
    v_analytics = user_data.get("video_analytics", [])
    insights  = user_data.get("insights", {}) or {}

    subscribers  = channel.get("subscribers", 0) or 0
    total_views  = channel.get("total_views", 0) or 0
    avg_views    = round(total_views / max(channel.get("video_count", 1) or 1, 1))

    # CTR from video_analytics
    ctrs = [v.get("ctr", 0) for v in v_analytics if v.get("ctr") is not None]
    avg_ctr = round(sum(ctrs) / len(ctrs), 2) if ctrs else None

    avg_retention = analytics.get("avg_retention_percent")

    # Videos published in last 7 days
    cutoff = datetime.datetime.utcnow() - timedelta(days=7)
    published_this_week = 0
    for v in videos:
        pub = v.get("published_at") or v.get("publishedAt") or ""
        try:
            dt = datetime.datetime.fromisoformat(pub.replace("Z", "+00:00"))
            if dt.replace(tzinfo=None) > cutoff:
                published_this_week += 1
        except Exception:
            pass

    watch_time_hours = None
    wt = analytics.get("watch_time_minutes") or analytics.get("estimated_minutes_watched")
    if wt:
        watch_time_hours = round(wt / 60, 1)

    channel_score = insights.get("channelScore")

    return {
        "subscribers":       subscribers,
        "total_views":       total_views,
        "avg_views_per_video": avg_views,
        "avg_ctr":           avg_ctr,
        "avg_retention":     avg_retention,
        "videos_published":  published_this_week,
        "watch_time_hours":  watch_time_hours,
        "channel_score":     channel_score,
    }


def _build_metrics(current: dict, prev_snapshot: dict | None) -> dict:
    p = prev_snapshot or {}
    return {
        "subscribers":     _metric(current["subscribers"],         p.get("subscribers")),
        "weeklyViews":     _metric(current["total_views"],         p.get("total_views")),
        "avgCtr":          _metric(current["avg_ctr"],             p.get("avg_ctr")),
        "avgRetention":    _metric(current["avg_retention"],       p.get("avg_retention")),
        "videosPublished": {"value": current["videos_published"],  "delta": None, "direction": "flat"},
        "watchTimeHours":  _metric(current["watch_time_hours"],    p.get("watch_time_hours")),
        "channelScore":    _metric(current["channel_score"],       p.get("channel_score")),
    }


# ── Claude report generation ──────────────────────────────────────────────────

def _call_claude(user_data: dict, metrics: dict, ws: datetime.date, we: datetime.date) -> dict:
    """Single Claude call. Returns parsed JSON dict."""
    channel   = user_data.get("channel", {})
    videos    = user_data.get("videos", []) or []
    insights  = user_data.get("insights", {}) or {}

    channel_name  = channel.get("channel_name", "Unknown")
    subscribers   = metrics["subscribers"]["value"] or 0
    sub_delta     = metrics["subscribers"]["delta"]
    weekly_views  = metrics["weeklyViews"]["value"] or 0
    avg_ctr_v     = metrics["avgCtr"]["value"]
    ctr_delta     = metrics["avgCtr"]["delta"]
    avg_ret_v     = metrics["avgRetention"]["value"]
    ret_delta     = metrics["avgRetention"]["delta"]
    vids_pub      = metrics["videosPublished"]["value"] or 0
    score         = metrics["channelScore"]["value"]
    score_delta   = metrics["channelScore"]["delta"]

    sorted_vids   = sorted(videos, key=lambda v: v.get("views", 0), reverse=True)
    top_vid       = sorted_vids[0]  if sorted_vids else {}
    bottom_vid    = sorted_vids[-1] if len(sorted_vids) > 1 else {}

    priority_actions = insights.get("priorityActions", [])[:3]
    pa_lines = "\n".join(
        f"{i+1}. {a.get('problem','')}: {a.get('action','')}"
        for i, a in enumerate(priority_actions)
    )

    date_range = _fmt_date_range(ws, we)

    sub_delta_str   = f"{sub_delta:+d}" if sub_delta is not None else "N/A (first report)"
    ctr_delta_str   = f"{ctr_delta:+.1f}%" if ctr_delta is not None else "N/A"
    ret_delta_str   = f"{ret_delta:+.1f}%" if ret_delta is not None else "N/A"
    score_delta_str = f"{score_delta:+d}" if score_delta is not None else "N/A"
    avg_ctr_str     = f"{avg_ctr_v}%" if avg_ctr_v is not None else "N/A"
    avg_ret_str     = f"{avg_ret_v}%" if avg_ret_v is not None else "N/A"
    score_str       = f"{score}" if score is not None else "N/A"

    prompt = f"""Channel: {channel_name}
Subscribers: {subscribers:,} ({sub_delta_str} this week)
Total views this week: {weekly_views:,}
Avg CTR: {avg_ctr_str} ({ctr_delta_str} vs last week)
Avg retention: {avg_ret_str} ({ret_delta_str} vs last week)
Videos published this week: {vids_pub}
Channel health score: {score_str}/100 ({score_delta_str} vs last week)

Last week's top performing video:
  "{top_vid.get('title','N/A')}" — {top_vid.get('views',0):,} views

Last week's worst performing video:
  "{bottom_vid.get('title','N/A')}" — {bottom_vid.get('views',0):,} views

Current biggest risk: {insights.get('biggestRisk','N/A')}
Current top performing pattern: {insights.get('topPerformingPattern','N/A')}

Priority actions from channel audit:
{pa_lines or 'N/A'}

YOUR TASKS:

1. WEEKLY SUMMARY
   2-3 sentences. What actually happened this week? Be honest — if it was a bad week say so clearly. Reference specific numbers.

2. BIGGEST WIN
   One specific thing that went well this week. Reference exact data. One sentence.
   If nothing went well: say "No standout wins this week — focus on the priority action below."

3. WATCH OUT
   One specific thing that dropped or is concerning. Reference exact data. One sentence.
   If nothing dropped: say "No major concerns this week."

4. THIS WEEK'S PRIORITY ACTION
   The single most important thing the creator should do in the next 7 days. Be extremely specific — name exact titles, exact numbers, exact formats. Not generic advice. Reference their actual data. One short paragraph, maximum 3 sentences.

5. MOTIVATIONAL CLOSE
   One sentence. Honest and grounded — not cheesy. Reference something specific about their channel.

Return ONLY this JSON, no markdown:
{{
  "weeklySummary": "",
  "biggestWin": "",
  "watchOut": "",
  "priorityAction": "",
  "motivationalClose": "",
  "reportTitle": "Your Week on YouTube — {date_range}"
}}"""

    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        system=(
            "You are a YouTube growth coach writing a weekly performance summary for a creator. "
            "Be specific, honest, and direct. Reference actual numbers from their data. "
            "Never be generic. Write in plain conversational English — no jargon, no buzzwords, "
            "no italics, no markdown formatting of any kind. Every sentence must be useful. "
            "Return only valid JSON."
        ),
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text.strip()
    # Strip any accidental markdown code fences
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw)


# ── Assemble + persist ────────────────────────────────────────────────────────

def _assemble_report(user_data: dict, claude_result: dict, metrics: dict,
                     ws: datetime.date, we: datetime.date) -> dict:
    channel = user_data.get("channel", {})
    videos  = user_data.get("videos", []) or []
    sorted_vids = sorted(videos, key=lambda v: v.get("views", 0), reverse=True)
    top_vid    = sorted_vids[0]  if sorted_vids else {}
    bottom_vid = sorted_vids[-1] if len(sorted_vids) > 1 else {}

    return {
        "reportTitle":      claude_result.get("reportTitle", f"Your Week on YouTube — {_fmt_date_range(ws, we)}"),
        "weekStart":        ws.isoformat(),
        "weekEnd":          we.isoformat(),
        "channelName":      channel.get("channel_name", ""),
        "channelThumbnail": channel.get("thumbnail", ""),
        "metrics":          metrics,
        "topVideo":         {"title": top_vid.get("title", ""), "views": top_vid.get("views", 0)},
        "bottomVideo":      {"title": bottom_vid.get("title", ""), "views": bottom_vid.get("views", 0)},
        "weeklySummary":    claude_result.get("weeklySummary", ""),
        "biggestWin":       claude_result.get("biggestWin", ""),
        "watchOut":         claude_result.get("watchOut", ""),
        "priorityAction":   claude_result.get("priorityAction", ""),
        "motivationalClose": claude_result.get("motivationalClose", ""),
        "generatedAt":      datetime.datetime.utcnow().isoformat(),
    }


def _save_report(channel_id: str, email: str, report_data: dict,
                 ws: datetime.date, we: datetime.date, db) -> WeeklyReport:
    row = WeeklyReport(
        id=str(uuid.uuid4()),
        channel_id=channel_id,
        email=email,
        week_start=ws.isoformat(),
        week_end=we.isoformat(),
        report_data=json.dumps(report_data),
        email_sent=False,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def mark_email_sent(channel_id: str, week_start: str, db) -> None:
    row = db.query(WeeklyReport).filter_by(
        channel_id=channel_id, week_start=week_start
    ).first()
    if row:
        row.email_sent    = True
        row.email_sent_at = datetime.datetime.utcnow()
        db.commit()


# ── Unsubscribe token ─────────────────────────────────────────────────────────

def _ensure_unsubscribe_token(channel_id: str, email: str, db) -> str:
    pref = db.query(UserEmailPreferences).filter_by(channel_id=channel_id).first()
    if not pref:
        token = secrets.token_urlsafe(32)
        pref  = UserEmailPreferences(
            channel_id=channel_id,
            email=email,
            weekly_report=True,
            unsubscribe_token=token,
        )
        db.add(pref)
        db.commit()
        return token
    if not pref.unsubscribe_token:
        pref.unsubscribe_token = secrets.token_urlsafe(32)
        db.commit()
    return pref.unsubscribe_token


# ── Send via Resend ───────────────────────────────────────────────────────────

def send_weekly_report(channel_id: str, email: str, report_data: dict,
                       unsubscribe_token: str) -> bool:
    from app.email_templates.weekly_report import build_email_html
    import resend as _resend

    _resend.api_key = os.environ.get("RESEND_API_KEY", "")
    html = build_email_html(report_data, unsubscribe_token, BASE_URL, LOGO_URL)

    try:
        response = _resend.Emails.send({
            "from":    "YTGrowth <reports@ytgrowth.io>",
            "to":      [email],
            "subject": report_data.get("reportTitle", "Your Weekly YouTube Report"),
            "html":    html,
        })
        return bool(response and response.get("id"))
    except Exception as e:
        print(f"Resend error: {e}")
        return False


# ── Main entry point ──────────────────────────────────────────────────────────

def generate_and_send_report(channel_id: str, email: str, user_data: dict, db) -> bool:
    """
    Generate (if not already done this week) and send the weekly report.
    Returns True if a report was sent, False otherwise.
    """
    # Guard: check unsubscribe preference
    pref = db.query(UserEmailPreferences).filter_by(channel_id=channel_id).first()
    if pref and not pref.weekly_report:
        print(f"[weekly_report] Skipping {channel_id} — unsubscribed")
        return False

    ws = _week_start()
    we = _week_end(ws)

    # Guard: never regenerate existing report
    existing = db.query(WeeklyReport).filter_by(
        channel_id=channel_id, week_start=ws.isoformat()
    ).first()
    if existing and existing.email_sent:
        return False

    # Get previous week's snapshot for deltas
    prev_ws = ws - timedelta(days=7)
    prev_row = db.query(WeeklyReport).filter_by(
        channel_id=channel_id, week_start=prev_ws.isoformat()
    ).first()
    prev_snapshot = None
    if prev_row:
        try:
            prev_data = json.loads(prev_row.report_data)
            # Reconstruct snapshot values from stored metrics
            m = prev_data.get("metrics", {})
            prev_snapshot = {
                "subscribers":       m.get("subscribers",     {}).get("value"),
                "total_views":       m.get("weeklyViews",     {}).get("value"),
                "avg_ctr":           m.get("avgCtr",          {}).get("value"),
                "avg_retention":     m.get("avgRetention",    {}).get("value"),
                "watch_time_hours":  m.get("watchTimeHours",  {}).get("value"),
                "channel_score":     m.get("channelScore",    {}).get("value"),
            }
        except Exception:
            pass

    # Generate report content
    try:
        current_snapshot = _extract_snapshot(user_data)
        metrics          = _build_metrics(current_snapshot, prev_snapshot)
        claude_result    = _call_claude(user_data, metrics, ws, we)
        report_data      = _assemble_report(user_data, claude_result, metrics, ws, we)
    except Exception as e:
        print(f"[weekly_report] Generation error for {channel_id}: {e}")
        return False

    # Save to DB before sending
    if existing:
        existing.report_data = json.dumps(report_data)
        db.commit()
        row = existing
    else:
        row = _save_report(channel_id, email, report_data, ws, we, db)

    if not row:
        return False

    # Ensure unsubscribe token exists
    token = _ensure_unsubscribe_token(channel_id, email, db)

    # Send email
    sent = send_weekly_report(channel_id, email, report_data, token)
    if sent:
        mark_email_sent(channel_id, ws.isoformat(), db)
        print(f"[weekly_report] Sent for {channel_id}")
    return sent
