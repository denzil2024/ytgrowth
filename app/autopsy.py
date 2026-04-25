"""
Post-publish autopsy — one-shot Claude generator for a single video.

What this does (and why it matters):
  Most analytics tools show numbers. This one *interprets* them. Given a
  video that's been live for a few days, we score it against the channel's
  own baseline + YouTube algorithm signals, and tell the user exactly what
  worked, what didn't, and what to test next.

  Same algo-lever framework as Priority Actions (browse share, session
  signals, audience-builder ratio) so the advice is consistent across the
  product.

Output JSON shape (frontend renders directly):
  {
    "score": 0-100,
    "verdict": "winner" | "average" | "underperformer",
    "headline": "1-sentence verdict",
    "metrics": {                      # the inputs the verdict was based on
      "views": int,
      "ctr_pct": float,
      "apv_pct": float,
      "avd_seconds": int,
      "subs_gained": int,
      "shares": int,
      "comments": int,
      "likes": int,
      "vs_baseline_pct": int          # views vs channel 30-day avg, signed
    },
    "what_worked":  ["...", "..."],   # 2-3 bullets, each cites a number
    "what_didnt":   ["...", "..."],   # 2-3 bullets, each cites a number
    "next_actions": [
      { "action": "...", "expectedOutcome": "..." }
    ]
  }
"""
import json
import os
import re
import datetime

import anthropic


def _parse_iso_duration(d: str) -> int:
    """ISO 8601 duration → seconds. PT8M30S → 510."""
    if not d:
        return 0
    m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", str(d))
    if not m:
        return 0
    h, mi, s = (int(g or 0) for g in m.groups())
    return h * 3600 + mi * 60 + s


def _channel_baseline(all_videos: list) -> dict:
    """Channel's own 30-day baseline — the comparison frame for every metric."""
    if not all_videos:
        return {}
    views = [int(v.get("views", 0) or 0) for v in all_videos if v.get("views")]
    ctrs  = [float(v.get("ctr", 0) or 0) for v in all_videos if v.get("ctr")]
    apvs  = [float(v.get("avg_view_percentage", 0) or 0) for v in all_videos if v.get("avg_view_percentage")]
    avds  = [float(v.get("avg_view_duration", 0) or 0) for v in all_videos if v.get("avg_view_duration")]
    subs  = [int(v.get("subs_gained", 0) or 0) for v in all_videos if v.get("subs_gained") is not None]
    shrs  = [int(v.get("shares", 0) or 0) for v in all_videos if v.get("shares") is not None]
    out = {}
    if views: out["avg_views"]   = round(sum(views) / len(views))
    if ctrs:  out["avg_ctr"]     = round(sum(ctrs)  / len(ctrs), 2)
    if apvs:  out["avg_apv"]     = round(sum(apvs)  / len(apvs), 1)
    if avds:  out["avg_avd_sec"] = round(sum(avds)  / len(avds))
    if subs:  out["avg_subs"]    = round(sum(subs)  / len(subs), 1)
    if shrs:  out["avg_shares"]  = round(sum(shrs)  / len(shrs), 1)
    return out


def analyze_video_autopsy(
    video: dict,
    all_videos: list,
    channel_stats: dict = None,
    traffic_sources: list = None,
) -> dict:
    """
    Generate a Claude-driven post-publish autopsy for ONE video.
    Returns the JSON payload above. Raises on Claude / parse errors so the
    caller can refund the credit.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not set")

    baseline = _channel_baseline(all_videos)
    duration_sec = _parse_iso_duration(video.get("duration", ""))

    views    = int(video.get("views", 0) or 0)
    ctr      = float(video.get("ctr", 0) or 0)
    apv      = float(video.get("avg_view_percentage", 0) or 0)
    avd      = float(video.get("avg_view_duration", 0) or 0)
    subs     = int(video.get("subs_gained", 0) or 0)
    shares   = int(video.get("shares", 0) or 0)
    likes    = int(video.get("likes", 0) or 0)
    comments = int(video.get("comments", 0) or 0)

    vs_baseline_pct = 0
    if baseline.get("avg_views") and views > 0:
        vs_baseline_pct = round((views - baseline["avg_views"]) / baseline["avg_views"] * 100)

    # Per-1k normalised engagement
    shares_per_1k   = round(shares   / views * 1000, 2) if views else 0
    comments_per_1k = round(comments / views * 1000, 2) if views else 0
    subs_per_1k     = round(subs     / views * 1000, 2) if views else 0

    # Traffic mix line (optional — shapes algo-push diagnosis)
    traffic_line = ""
    if traffic_sources:
        total = sum((ts.get("views") or 0) for ts in traffic_sources) or 1
        share = {}
        for ts in traffic_sources:
            src = (ts.get("source") or "").strip().upper()
            v = ts.get("views") or 0
            if not src:
                continue
            share[src] = share.get(src, 0) + (v / total * 100)
        browse    = round(share.get("YT_OTHER_PAGE", 0) + share.get("YT_CHANNEL", 0) + share.get("BROWSE", 0), 1)
        suggested = round(share.get("RELATED_VIDEO", 0) + share.get("SUGGESTED", 0), 1)
        search    = round(share.get("YT_SEARCH", 0) + share.get("SEARCH", 0), 1)
        external  = round(share.get("EXT_URL", 0) + share.get("EXTERNAL", 0), 1)
        traffic_line = (
            f"Channel traffic mix (last 90d): "
            f"Browse {browse}%  Suggested {suggested}%  Search {search}%  External {external}%"
        )

    baseline_lines = []
    if baseline:
        if "avg_views"   in baseline: baseline_lines.append(f"Avg views per video (last 20): {baseline['avg_views']:,}")
        if "avg_ctr"     in baseline: baseline_lines.append(f"Avg CTR: {baseline['avg_ctr']}%")
        if "avg_apv"     in baseline: baseline_lines.append(f"Avg APV: {baseline['avg_apv']}%")
        if "avg_avd_sec" in baseline: baseline_lines.append(f"Avg view duration: {baseline['avg_avd_sec']}s")
        if "avg_subs"    in baseline: baseline_lines.append(f"Avg subs gained per video: {baseline['avg_subs']}")
        if "avg_shares"  in baseline: baseline_lines.append(f"Avg shares per video: {baseline['avg_shares']}")
    baseline_block = "\n".join(baseline_lines) if baseline_lines else "Insufficient baseline data."

    duration_label = f"{duration_sec // 60}m {duration_sec % 60}s" if duration_sec else "unknown"

    channel_name = (channel_stats or {}).get("channel_name") or "this channel"
    subs_total   = (channel_stats or {}).get("subscribers", 0)

    prompt = f"""You are a YouTube growth coach reviewing a single video for {channel_name} ({subs_total:,} subs). Your job is NOT to list metrics — they can already see the metrics. Your job is to interpret them: what worked, what didn't, and what to test next.

The verdict must reference real numbers from the data below. No vibes. No generic advice.

--- VIDEO BEING REVIEWED ---
Title: {video.get("title", "Unknown")}
Duration: {duration_label}
Published: {video.get("published_at", "Unknown")[:10] if video.get("published_at") else "Unknown"}

Performance:
  Views: {views:,}
  CTR: {ctr}%
  Average percentage viewed (APV): {apv}%
  Average view duration (AVD): {round(avd)}s
  Subscribers gained: {subs}
  Shares: {shares}  ({shares_per_1k} per 1k views)
  Comments: {comments}  ({comments_per_1k} per 1k views)
  Likes: {likes}
  Subs gained per 1k views: {subs_per_1k}
  Views vs channel 30-day baseline: {vs_baseline_pct:+}%

--- CHANNEL BASELINE (compare against) ---
{baseline_block}

{traffic_line}

--- HOW YOUTUBE REWARDS VIDEOS (use these levers) ---
1. Browse + Suggested traffic share — algo endorsement. Low share = packaging or retention failed.
2. Session-keeping (high APV × high shares) — algo pushes session-extenders harder.
3. Audience-builder ratio (subs gained per 1k views) — converts viewers to subscribers.
4. Retention normalised by duration — 50% APV on a 10-min video > 50% on a 4-min video.

--- YOUR JOB ---
Return ONLY this JSON. No markdown, no preamble:

{{
  "score": <number 0-100, honest>,
  "verdict": "winner|average|underperformer",
  "headline": "<one sentence — what this video tells us, in plain English>",
  "metrics": {{
    "views": {views},
    "ctr_pct": {ctr},
    "apv_pct": {apv},
    "avd_seconds": {round(avd)},
    "subs_gained": {subs},
    "shares": {shares},
    "comments": {comments},
    "likes": {likes},
    "vs_baseline_pct": {vs_baseline_pct}
  }},
  "what_worked": [
    "<bullet — must cite a real number from above>",
    "<bullet>",
    "<optional 3rd bullet>"
  ],
  "what_didnt": [
    "<bullet — must cite a real number from above>",
    "<bullet>",
    "<optional 3rd bullet>"
  ],
  "next_actions": [
    {{ "action": "<specific, do-this-on-the-next-video instruction>", "expectedOutcome": "<what metric will move and roughly by how much>" }},
    {{ "action": "...", "expectedOutcome": "..." }},
    {{ "action": "...", "expectedOutcome": "..." }}
  ]
}}

Scoring guide:
  85-100 winner — clearly outperformed baseline on at least 2 algo levers
  60-84  average — performed near baseline, no obvious wins or fails
  0-59   underperformer — failed at least 2 algo levers vs baseline

Bullet rules:
- Every bullet must reference a real number from the data above.
- Do NOT recommend "post more often" or "improve SEO" unless the data clearly shows that gap.
- Each next_action must be testable on the very next upload."""

    client = anthropic.Anthropic(api_key=api_key)
    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1800,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = msg.content[0].text.strip()
    raw = re.sub(r"^```[a-z]*\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw).strip()
    return json.loads(raw)
