import os
import re
import json
from datetime import datetime, timedelta
import anthropic


def parse_duration_seconds(iso_duration):
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso_duration or '')
    if not match:
        return 0
    return int(match.group(1) or 0) * 3600 + int(match.group(2) or 0) * 60 + int(match.group(3) or 0)


# Deterministic score weights — these are shown to users so they must be stable
_SCORE_WEIGHTS = {
    'ctrHealth':                 0.20,
    'audienceRetention':         0.20,
    'contentStrategy':           0.15,
    'postingConsistency':        0.15,
    'engagementQuality':         0.10,
    'seoDiscoverability':        0.10,
    'videoLength':               0.05,
    'trafficSourceIntelligence': 0.05,
}


def _compute_channel_score(cat_scores: dict) -> int:
    """Weighted deterministic score (0–100). Consistent across re-audits."""
    if not cat_scores:
        return 0
    weighted_sum = 0.0
    total_weight = 0.0
    for key, weight in _SCORE_WEIGHTS.items():
        val = cat_scores.get(key)
        if isinstance(val, (int, float)):
            weighted_sum += val * weight
            total_weight += weight
    if total_weight == 0:
        return 0
    return round(weighted_sum / total_weight)


def calculate_upload_frequency(videos):
    if len(videos) < 2:
        return 0
    dates = []
    for v in videos:
        try:
            dates.append(datetime.strptime(v["published_at"][:10], "%Y-%m-%d"))
        except Exception:
            continue
    if len(dates) < 2:
        return 0
    dates.sort(reverse=True)
    gaps = [(dates[i] - dates[i + 1]).days for i in range(len(dates) - 1)]
    avg_gap = sum(gaps) / len(gaps)
    return round(7 / avg_gap, 2) if avg_gap > 0 else 0


def _merge_video_data(videos, video_analytics):
    analytics_map = {v["video_id"]: v for v in (video_analytics or [])}
    merged = []
    for v in videos:
        vid_id = v.get("video_id", "")
        va = analytics_map.get(vid_id, {})
        duration_secs = parse_duration_seconds(v.get("duration", "PT0S"))
        merged.append({
            "title": v.get("title", ""),
            "published_at": v.get("published_at", "")[:10],
            "duration_seconds": duration_secs,
            "views": v.get("views", 0),
            "impressions": va.get("impressions"),
            "ctr_percent": va.get("ctr_percent"),
            "avg_view_duration_seconds": va.get("avg_duration_seconds"),
            "avg_view_percentage": va.get("avg_retention_percent"),
            "likes": v.get("likes", 0),
            "comments": v.get("comments", 0),
            "subscribers_gained": va.get("subscribers_gained"),
        })
    return merged


def _posting_behavior(videos):
    cutoff = datetime.now() - timedelta(days=90)
    recent_dates = []
    for v in videos:
        try:
            dt = datetime.strptime(v.get("published_at", "")[:10], "%Y-%m-%d")
            if dt >= cutoff:
                recent_dates.append(dt)
        except Exception:
            continue

    if len(recent_dates) >= 2:
        sorted_dates = sorted(recent_dates, reverse=True)
        gaps = [(sorted_dates[i] - sorted_dates[i + 1]).days for i in range(len(sorted_dates) - 1)]
        avg_gap = round(sum(gaps) / len(gaps), 1)
    else:
        avg_gap = 0

    day_counts = {}
    hour_counts = {}
    for v in videos:
        raw = v.get("published_at", "")
        try:
            dt = datetime.strptime(raw, "%Y-%m-%dT%H:%M:%SZ")
            day = dt.strftime("%A")
            day_counts[day] = day_counts.get(day, 0) + 1
            hour_counts[dt.hour] = hour_counts.get(dt.hour, 0) + 1
        except Exception:
            pass

    top_day = max(day_counts, key=day_counts.get) if day_counts else "Unknown"
    top_hour_int = max(hour_counts, key=hour_counts.get) if hour_counts else None
    top_hour = f"{top_hour_int:02d}:00" if top_hour_int is not None else "Unknown"

    shorts = sum(1 for v in videos if parse_duration_seconds(v.get("duration", "PT0S")) <= 60)
    longform = len(videos) - shorts

    return {
        "videos_last_90_days": len(recent_dates),
        "avg_upload_gap_days": avg_gap,
        "top_upload_day": top_day,
        "top_upload_hour": top_hour,
        "shorts_count": shorts,
        "longform_count": longform,
    }


def _channel_aggregates(merged_videos, analytics):
    if not merged_videos:
        return {}

    views_list = [v["views"] for v in merged_videos]
    likes_list = [v["likes"] for v in merged_videos]
    comments_list = [v["comments"] for v in merged_videos]
    ctrs = [v["ctr_percent"] for v in merged_videos if v["ctr_percent"] is not None]
    durations = [v["avg_view_duration_seconds"] for v in merged_videos if v["avg_view_duration_seconds"] is not None]
    retentions = [v["avg_view_percentage"] for v in merged_videos if v["avg_view_percentage"] is not None]
    subs_gained = [v["subscribers_gained"] for v in merged_videos if v["subscribers_gained"] is not None]

    top_vid = max(merged_videos, key=lambda v: v["views"])
    bottom_vid = min(merged_videos, key=lambda v: v["views"])

    watch_hours = round((analytics or {}).get("watch_minutes_90d", 0) / 60)

    def avg_dur_str(secs_list):
        if not secs_list:
            return "N/A"
        a = sum(secs_list) / len(secs_list)
        return f"{int(a // 60)}m {int(a % 60)}s"

    return {
        "avg_ctr": round(sum(ctrs) / len(ctrs), 2) if ctrs else "N/A",
        "avg_view_duration": avg_dur_str(durations),
        "avg_view_percentage": round(sum(retentions) / len(retentions), 1) if retentions else "N/A",
        "avg_views_per_video": round(sum(views_list) / len(views_list)),
        "avg_likes": round(sum(likes_list) / len(likes_list), 1),
        "avg_comments": round(sum(comments_list) / len(comments_list), 1),
        "avg_subs_gained": round(sum(subs_gained) / len(subs_gained), 1) if subs_gained else "N/A",
        "total_watch_time_hours": watch_hours,
        "top_video_title": top_vid["title"],
        "top_video_views": top_vid["views"],
        "bottom_video_title": bottom_vid["title"],
        "bottom_video_views": bottom_vid["views"],
    }


def _youtube_algo_signals(merged_videos, traffic_sources, agg):
    """
    Pre-compute the derived metrics that map directly to YouTube's recommendation
    levers — so Claude can reason on them as numbers instead of guessing.

    What the algorithm actually rewards (ordered by weight):
      1. Browse / Suggested traffic share — algorithmic endorsement (homepage push,
         "up next" recommendations). If browse % is low the algo isn't pushing.
      2. Session-keeping signals — APV × engagement (shares, comments). Videos
         that extend the YouTube session get pushed harder.
      3. Audience-builder signal — subs gained per 1k views. Videos that convert
         viewers to subscribers tell the algo "this content grows the platform."
      4. Retention normalised by duration — a 50% APV on a 10-min video beats
         50% on a 4-min video. Without normalising you can't compare videos.

    Returns a dict the prompt prints verbatim under "YOUTUBE ALGORITHM SIGNALS".
    """
    out = {}

    # ── Traffic source share — algorithmic-push diagnostic ──────────────────
    if traffic_sources:
        total = sum((ts.get("views") or 0) for ts in traffic_sources) or 1
        share = {}
        for ts in traffic_sources:
            src = (ts.get("source") or "").strip().upper()
            v = ts.get("views") or 0
            if not src:
                continue
            share[src] = share.get(src, 0) + (v / total * 100)
        # Aliases YouTube returns under different labels across accounts
        out["browse_pct"]    = round(share.get("YT_OTHER_PAGE", 0) + share.get("YT_CHANNEL", 0) + share.get("BROWSE", 0) + share.get("YT_SEARCH_PAGE", 0), 1)
        out["suggested_pct"] = round(share.get("RELATED_VIDEO", 0) + share.get("SUGGESTED", 0), 1)
        out["search_pct"]    = round(share.get("YT_SEARCH", 0) + share.get("SEARCH", 0), 1)
        out["external_pct"]  = round(share.get("EXT_URL", 0) + share.get("EXTERNAL", 0), 1)
        # Healthy mix benchmark: browse 25-40%, suggested 30-50%, search 10-25%
        out["traffic_diagnosis"] = (
            "weak algo push — browse + suggested combined under 40%"
            if (out["browse_pct"] + out["suggested_pct"]) < 40
            else "healthy algo push — recommendation traffic dominates"
        )
    else:
        out["traffic_diagnosis"] = "traffic source data unavailable"

    # ── Per-video efficiency metrics on the last 20 ─────────────────────────
    by_video = []
    for v in merged_videos or []:
        views   = int(v.get("views") or 0)
        if views < 50:  # too thin to draw conclusions
            continue
        shares_v   = int(v.get("shares") or 0)
        comments   = int(v.get("comments") or 0)
        subs       = int(v.get("subs_gained") or 0)
        apv        = float(v.get("avg_view_percentage") or 0)
        avd_sec    = float(v.get("avg_view_duration") or 0)
        # video duration in seconds, parsed from ISO 8601 if present
        dur_sec = 0
        d = v.get("duration") or ""
        m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", str(d))
        if m:
            h, mi, s = (int(g or 0) for g in m.groups())
            dur_sec = h * 3600 + mi * 60 + s
        by_video.append({
            "title": v.get("title", ""),
            "views": views,
            "shares_per_1k":   round(shares_v   / views * 1000, 2),
            "comments_per_1k": round(comments   / views * 1000, 2),
            "subs_per_1k":     round(subs       / views * 1000, 2),
            "apv_pct":         round(apv, 1),
            "avd_sec":         round(avd_sec, 1),
            "dur_sec":         dur_sec,
            # Session score: retention × shares-per-1k. Both must be high to score.
            "session_score":   round(apv * (shares_v / views * 1000) if views else 0, 2),
        })

    # ── Channel-wide normalised metrics ─────────────────────────────────────
    if by_video:
        total_views = sum(v["views"] for v in by_video) or 1
        out["shares_per_1k_views"]   = round(sum(v["shares_per_1k"] * v["views"] for v in by_video) / total_views, 2)
        out["comments_per_1k_views"] = round(sum(v["comments_per_1k"] * v["views"] for v in by_video) / total_views, 2)
        out["subs_per_1k_views"]     = round(sum(v["subs_per_1k"] * v["views"] for v in by_video) / total_views, 2)

        # Top session-keeper: APV high AND shares high. This is what the algo
        # rewards most aggressively in 2025 (session watch time signal).
        top_session = max(by_video, key=lambda v: v["session_score"])
        if top_session["session_score"] > 0:
            out["top_session_keeper"] = (
                f'"{top_session["title"]}" — APV {top_session["apv_pct"]}%, '
                f'{top_session["shares_per_1k"]} shares/1k views '
                f'(session_score {top_session["session_score"]})'
            )

        # Top audience-builder: highest subs gained per 1k views. Make more like this.
        top_builder = max(by_video, key=lambda v: v["subs_per_1k"])
        if top_builder["subs_per_1k"] > 0:
            out["top_audience_builder"] = (
                f'"{top_builder["title"]}" — {top_builder["subs_per_1k"]} subs gained per 1k views'
            )

        # Retention vs duration: APV is more impressive on longer videos. Flag
        # the video with the highest APV × duration combo (true watch-time king).
        watch_kings = sorted(
            (v for v in by_video if v["dur_sec"] > 0),
            key=lambda v: v["apv_pct"] * v["dur_sec"],
            reverse=True,
        )
        if watch_kings:
            wk = watch_kings[0]
            mins = int(wk["dur_sec"] // 60)
            out["top_watch_time_king"] = (
                f'"{wk["title"]}" — {wk["apv_pct"]}% APV on a {mins}-min video '
                f'(true watch-time leader; algo loves this combo)'
            )

    return out


def analyze_channel(
    stats, videos,
    analytics=None,
    video_analytics=None,
    traffic_sources=None,
    shares=None,
    device_types=None,
    geographies=None,
    demographics=None,
    dislikes=None,
    playlist_adds=None,
    competitor_analyses=None,
    plan="free",
):
    # Fetch stored competitor analyses from the DB
    try:
        from database.models import SessionLocal, CompetitorAnalysisCache
        db = SessionLocal()
        rows = (
            db.query(CompetitorAnalysisCache)
            .filter_by(channel_id=stats["channel_id"])
            .order_by(CompetitorAnalysisCache.analyzed_at.desc())
            .limit(3)
            .all()
        )
        competitor_analyses = [json.loads(r.result_json) for r in rows]
        db.close()
    except Exception as e:
        print(f"Competitor analysis fetch error: {e}")
        competitor_analyses = competitor_analyses or []

    # Determine MAX_ACTIONS based on plan
    if "agency" in plan:
        MAX_ACTIONS = 15
    elif "growth" in plan:
        MAX_ACTIONS = 12
    elif "solo" in plan:
        MAX_ACTIONS = 8
    else:
        MAX_ACTIONS = 5

    merged = _merge_video_data(videos, video_analytics)
    posting = _posting_behavior(videos)
    agg = _channel_aggregates(merged, analytics)
    # Pre-compute the metrics that map to YouTube's recommendation levers
    # (browse share, session signals, audience-builder ratio). Claude reasons
    # on these as numbers — better than asking it to estimate them.
    algo_signals = _youtube_algo_signals(merged, traffic_sources, agg)

    channel_overview = f"""--- CHANNEL OVERVIEW ---
Channel name: {stats.get('channel_name', 'N/A')}
Total subscribers: {stats.get('subscribers', 0):,}
Total views (all time): {stats.get('total_views', 0):,}
Total videos published: {stats.get('video_count', 0)}
Channel creation date: {(stats.get('created_at') or 'N/A')[:10]}
Channel description: {stats.get('description') or 'Not set'}
Channel keywords: {stats.get('keywords') or 'Not set'}"""

    posting_section = f"""--- POSTING BEHAVIOR (last 90 days) ---
Videos published: {posting['videos_last_90_days']}
Average days between uploads: {posting['avg_upload_gap_days']}
Most common upload day: {posting['top_upload_day']}
Most common upload hour (channel timezone): {posting['top_upload_hour']}
Shorts published: {posting['shorts_count']}
Long-form videos published: {posting['longform_count']}"""

    audience_section = """--- AUDIENCE DATA ---
Top geography: N/A
Average viewer age range: N/A
Gender split: N/A
Peak audience active hours: N/A"""

    videos_section = f"--- LAST 20 VIDEOS (individual breakdown) ---\n{json.dumps(merged, default=str)}"

    agg_section = f"""--- CHANNEL AGGREGATES (last 90 days) ---
Average CTR across all videos: {agg.get('avg_ctr', 'N/A')}%
Average view duration: {agg.get('avg_view_duration', 'N/A')}
Average view percentage: {agg.get('avg_view_percentage', 'N/A')}%
Average views per video: {agg.get('avg_views_per_video', 0)}
Average likes per video: {agg.get('avg_likes', 0)}
Average comments per video: {agg.get('avg_comments', 0)}
Average subscribers gained per video: {agg.get('avg_subs_gained', 'N/A')}
Total watch time (hours): {agg.get('total_watch_time_hours', 0)}
Best performing video (views): {agg.get('top_video_title', 'N/A')} — {agg.get('top_video_views', 0)} views
Worst performing video (views): {agg.get('bottom_video_title', 'N/A')} — {agg.get('bottom_video_views', 0)} views"""

    # ── New data sections ─────────────────────────────────────────────────────

    if traffic_sources is None:
        traffic_section = "--- TRAFFIC SOURCES (last 90 days) ---\nTraffic source data unavailable"
    else:
        lines = ["--- TRAFFIC SOURCES (last 90 days) ---"]
        for ts in traffic_sources:
            lines.append(f"{ts['source']}: {ts['views']} views, {ts['watch_minutes']} mins")
        traffic_section = "\n".join(lines)

    if device_types is None:
        device_section = "--- DEVICE TYPES (last 90 days) ---\nDevice data unavailable"
    else:
        lines = ["--- DEVICE TYPES (last 90 days) ---"]
        for dt in device_types:
            lines.append(f"{dt['device']}: {dt['views']} views")
        device_section = "\n".join(lines)

    if geographies is None:
        geo_section = "--- TOP 5 GEOGRAPHIES (last 90 days) ---\nGeography data unavailable"
    else:
        lines = ["--- TOP 5 GEOGRAPHIES (last 90 days) ---"]
        for geo in geographies:
            lines.append(f"{geo['country']}: {geo['views']} views, {geo['subscribers_gained']} subs gained")
        geo_section = "\n".join(lines)

    if not demographics:
        demo_section = "--- AUDIENCE DEMOGRAPHICS ---\nInsufficient data — channel needs more viewers for demographic breakdown"
    else:
        lines = ["--- AUDIENCE DEMOGRAPHICS ---"]
        for demo in demographics:
            lines.append(f"{demo['age_group']} / {demo['gender']}: {demo['viewer_percentage']}%")
        demo_section = "\n".join(lines)

    shares_val = shares.get("total_shares") if shares else "Unavailable"
    dislikes_val = dislikes.get("total_dislikes") if dislikes else "Unavailable"
    playlist_val = playlist_adds.get("videos_added_to_playlists") if playlist_adds else "Unavailable"
    engagement_section = f"""--- ADDITIONAL ENGAGEMENT (last 90 days) ---
Total shares: {shares_val}
Total dislikes: {dislikes_val}
Videos added to playlists: {playlist_val}"""

    # ── YouTube algorithm signals — derived metrics that map directly to ──
    # what the recommendation engine actually rewards. Pre-computed so Claude
    # reasons on real numbers, not vibes.
    if algo_signals:
        algo_lines = ["--- YOUTUBE ALGORITHM SIGNALS (derived) ---"]
        if "browse_pct" in algo_signals:
            algo_lines.append(
                f"Traffic mix: Browse {algo_signals['browse_pct']}%  "
                f"Suggested {algo_signals['suggested_pct']}%  "
                f"Search {algo_signals['search_pct']}%  "
                f"External {algo_signals['external_pct']}%"
            )
            algo_lines.append(f"Algorithmic-push diagnosis: {algo_signals['traffic_diagnosis']}")
        else:
            algo_lines.append(f"Algorithmic-push diagnosis: {algo_signals['traffic_diagnosis']}")
        if "shares_per_1k_views" in algo_signals:
            algo_lines.append(
                f"Channel-wide engagement per 1k views: "
                f"{algo_signals['shares_per_1k_views']} shares · "
                f"{algo_signals['comments_per_1k_views']} comments · "
                f"{algo_signals['subs_per_1k_views']} subs gained"
            )
        if algo_signals.get("top_session_keeper"):
            algo_lines.append(f"Top session-keeper video: {algo_signals['top_session_keeper']}")
        if algo_signals.get("top_audience_builder"):
            algo_lines.append(f"Top audience-builder video: {algo_signals['top_audience_builder']}")
        if algo_signals.get("top_watch_time_king"):
            algo_lines.append(f"Top watch-time leader: {algo_signals['top_watch_time_king']}")
        algo_section = "\n".join(algo_lines)
    else:
        algo_section = "--- YOUTUBE ALGORITHM SIGNALS (derived) ---\nInsufficient data to compute"

    if not competitor_analyses:
        competitor_section = "--- STORED COMPETITOR INTELLIGENCE ---\nNo competitor data stored yet. User has not run a competitor analysis."
    else:
        user_avg_views = agg.get("avg_views_per_video", 0)
        lines = ["--- STORED COMPETITOR INTELLIGENCE ---"]
        for comp in competitor_analyses[:3]:
            name = comp.get("channel_name") or "Unknown"
            subs = comp.get("subscribers", "Unknown")
            threat = comp.get("threatLevel", "Unknown")
            top_topics = comp.get("topTopics") or []
            topics_str = ", ".join(
                t.get("topic", str(t)) if isinstance(t, dict) else str(t)
                for t in top_topics[:3]
            ) if top_topics else "Unknown"
            title_patterns = comp.get("titlePatterns") or {}
            formats = title_patterns.get("dominantFormats") or []
            keywords = title_patterns.get("topKeywords") or []
            formats_str = ", ".join(str(f) for f in formats) if formats else "Unknown"
            keywords_str = ", ".join(str(k) for k in keywords) if keywords else "Unknown"
            gaps = comp.get("gapsToExploit") or []
            gap_strs = [
                g.get("gap", str(g)) if isinstance(g, dict) else str(g)
                for g in gaps[:3]
            ]
            gaps_str = "; ".join(gap_strs) if gap_strs else "None identified"
            comp_avg = comp.get("avg_views_per_video", "Unknown")
            view_cmp = f"User avg: {user_avg_views}, Competitor avg: {comp_avg}"
            lines += [
                f"\nCompetitor: {name}",
                f"Subscribers: {subs}",
                f"Threat level: {threat}",
                f"Their top topics: {topics_str}",
                f"Title patterns they use: {formats_str}",
                f"Top keywords: {keywords_str}",
                f"Gaps they leave open: {gaps_str}",
                f"Avg views comparison: {view_cmp}",
            ]
        competitor_section = "\n".join(lines)

    # ── Competitive category — only injected when data exists ─────────────────
    competitive_category = ""
    if competitor_analyses:
        competitive_category = """

### 11. COMPETITIVE POSITION
Use stored competitor data to benchmark the user's channel directly.

Compare:
- User avg views vs competitor avg views
- User CTR vs competitor CTR if available
- User posting frequency vs competitors
- Topics user covers vs gaps competitors leave open
- Title patterns competitors use that user is not using

Generate recommendations that say "Competitor X averages Y views while you average Z — here is the specific gap and how to close it." Never give generic advice. Always reference actual competitor data.

If no competitor data exists, skip this category entirely and do not mention it."""

    analysis_instructions = f"""## YOUR ANALYSIS INSTRUCTIONS

You are auditing a YouTube channel for a creator who wants the algorithm to push their work harder. Your job is NOT to list everything that's slightly off — it's to surface the highest-leverage moves YouTube's recommendation engine actually rewards.

## HOW YOUTUBE ACTUALLY REWARDS CHANNELS (the levers your priority actions MUST address)

The "YOUTUBE ALGORITHM SIGNALS (derived)" block above is computed from this user's real data. Read those numbers FIRST and let them drive every priority action. The signals, in order of weight:

1. **Browse + Suggested traffic share** — this is the algorithm endorsing the channel. If Browse + Suggested combined < 40%, YouTube isn't pushing. The fix is almost always **packaging (title + thumbnail)** and **early-video retention**, in that order. Do not blame "needs more SEO" if the diagnosis is weak algo push — search traffic is a separate funnel.
2. **Session-keeping signals** — high APV combined with high shares-per-1k-views. Videos that extend a viewer's YouTube session get pushed harder than videos with great retention alone. The "Top session-keeper video" above is the format the algorithm wants more of.
3. **Audience-builder ratio** — subs gained per 1k views. The "Top audience-builder video" above tells you which content type converts viewers to subscribers. Make more like it.
4. **Retention normalised by duration** — APV on a 10-min video beats the same APV on a 4-min video. The "Top watch-time leader" above is the channel's true winner; mid-APV-but-short videos are not winners.
5. **Niche clarity** — the algorithm classifies channels by topic. Scattered topics dilute homepage push.

## RULES FOR PRIORITY ACTIONS

- Each priority action MUST cite a specific number from the data above. No vague advice.
- At least one of the top 3 actions must address algorithmic push (browse %, session-keeping, or audience-builder pattern). If the data shows weak algo push, that's priority #1.
- Reference the user's own winning videos by name — "Make more like 'X' which earned Y subs/1k views" beats "post more engaging content."
- Do not invent metrics. If the data section says "unavailable", do not pretend you have it.
- Avoid generic SEO/posting-frequency advice unless the data clearly shows that's the bottleneck. Most channels' bottleneck is packaging + retention, not posting cadence.

Perform a full deep audit across these categories. For each category, assign a score from 0 to 100 and write specific observations based on the actual data above — never give generic advice.

### 1. POSTING CONSISTENCY
Evaluate upload frequency, gaps between videos, and whether posting days/times align with the audience's peak active hours. Flag irregular patterns, long gaps, and mismatched timing.

### 2. VIDEO LENGTH OPTIMIZATION
Compare video durations against average view percentage. If average view percentage is low, videos may be too long. If it is high, they may be leaving watch time on the table. Identify the sweet spot based on their actual retention data. Flag outlier videos that are significantly longer or shorter than what performs best.

### 3. CTR HEALTH (Titles + Thumbnails)
Analyze the CTR across all 20 videos. YouTube benchmark is 4-6% for established channels, 2-4% for newer ones. Flag videos below benchmark. Identify which titles/thumbnails performed best and extract the pattern. Note if titles are too long, lack keywords, or lack emotional hooks.

### 4. AUDIENCE RETENTION
Evaluate average view percentage across all videos. Below 40% is a red flag. Above 50% is strong. Identify which videos had the best retention and what they have in common (length, topic, format). Flag videos where retention dropped sharply.

### 5. ENGAGEMENT QUALITY
Calculate like-to-view ratio and comment-to-view ratio. Flag if engagement is low relative to views (indicates passive audience not converting). Check subscriber-gained-per-video to identify which content types are driving channel growth.

### 6. CONTENT STRATEGY & NICHE CLARITY
Assess whether the last 20 video titles suggest a clear niche or scattered topics. Identify which topic clusters get the most views and engagement. Flag if the channel is inconsistent in its content focus.

### 7. SEO & DISCOVERABILITY
Evaluate whether channel keywords are set and relevant. Check if video titles follow SEO best practices (primary keyword in first half, 50-70 characters, specificity). Flag missing or weak descriptions based on available data.

### 8. TRAFFIC SOURCE INTELLIGENCE
Where are views coming from? Browse/Suggested dominant means thumbnails and click appeal matter most. YouTube Search dominant means SEO and keyword-optimized titles are the priority. External dominant means leverage outside audience for cross-promotion. Flag over-reliance on one source as risk.

### 9. AUDIENCE PROFILE
Use device type, geography, demographics. Mobile-dominant means larger thumbnail text, shorter punchy hooks. Unexpected geography means opportunity to tailor language and cultural references. If demographics available, assess whether the channel is reaching its intended audience.

### 10. CONTENT SHAREABILITY
Use shares and playlist adds vs views. Low share rate on educational or entertaining content is a red flag. High playlist adds means evergreen content — flag as content type to double down on.{competitive_category}

## OUTPUT FORMAT

Return ONLY valid JSON. No markdown. No preamble. Return exactly {MAX_ACTIONS} priority actions ranked by impact. No more, no fewer. Exact structure:

{{
  "channelScore": <number 0-100>,
  "channelSummary": "<2-3 sentence honest assessment>",
  "categoryScores": {{
    "postingConsistency": <number>,
    "videoLength": <number>,
    "ctrHealth": <number>,
    "audienceRetention": <number>,
    "engagementQuality": <number>,
    "contentStrategy": <number>,
    "seoDiscoverability": <number>,
    "trafficSourceIntelligence": <number>,
    "audienceProfile": <number>,
    "contentShareability": <number>,
    "competitivePosition": <number or null if no competitor data>
  }},
  "priorityActions": [
    {{
      "rank": 1,
      "category": "<string>",
      "problem": "<specific problem found in their data>",
      "impact": "high|medium|low",
      "action": "<exactly what to do, specific and actionable>",
      "whyNow": "<why this is the most urgent fix>",
      "expectedOutcome": "<what metric will improve and roughly by how much>"
    }}
  ],
  "quickWins": ["<small thing they can fix today>"],
  "topPerformingPattern": "<what their best videos have in common>",
  "biggestRisk": "<the one thing that will hold the channel back if not fixed>",
  "trafficDominantSource": "<string>",
  "audienceSummary": "<string — 2 sentences on who is watching>",
  "shareabilityScore": <number 0-100>,
  "competitorBenchmark": "<string — 2-3 sentences comparing user to stored competitors. Null if no competitor data>"
}}"""

    prompt = f"""Here is the full analytics data for this YouTube channel:

{channel_overview}

{posting_section}

{audience_section}

{videos_section}

{agg_section}

{traffic_section}

{device_section}

{geo_section}

{demo_section}

{engagement_section}

{algo_section}

{competitor_section}

---

{analysis_instructions}"""

    try:
        client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = message.content[0].text.strip()
        # Strip markdown code fences if present
        raw = re.sub(r'^```[a-z]*\n?', '', raw)
        raw = re.sub(r'\n?```$', '', raw).strip()
        result = json.loads(raw)
        # Override AI-guessed score with deterministic weighted formula
        if isinstance(result.get('categoryScores'), dict):
            result['channelScore'] = _compute_channel_score(result['categoryScores'])
        return result
    except json.JSONDecodeError as e:
        print(f"AI analysis JSON parse error: {e}")
        return _fallback_analysis(stats, videos, analytics)
    except Exception as e:
        import traceback
        print(f"AI analysis error: {e}")
        traceback.print_exc()
        return _fallback_analysis(stats, videos, analytics)


def _fallback_analysis(stats, videos, analytics):
    """Minimal rule-based fallback if AI call fails."""
    score = 60
    upload_freq = calculate_upload_frequency(videos)
    problems = []

    if analytics:
        retention = analytics.get("avg_retention_percent", 0)
        if retention > 0 and retention < 30:
            problems.append({
                "rank": len(problems) + 1,
                "category": "Audience Retention",
                "problem": f"Average retention is critically low at {retention}%",
                "impact": "high",
                "action": "Rewrite your video openings. Hook viewers in the first 30 seconds by leading with the payoff.",
                "whyNow": "The algorithm stops recommending videos with retention below 30%.",
                "expectedOutcome": "Retention above 40% would increase algorithm recommendations significantly."
            })
            score -= 20

    if upload_freq < 0.5:
        problems.append({
            "rank": len(problems) + 1,
            "category": "Posting Consistency",
            "problem": f"Posting about {round(upload_freq * 4, 1)}x per month — well below algorithm threshold",
            "impact": "high",
            "action": "Commit to at least 1 video per week. Batch record 3-4 videos per session to build a buffer.",
            "whyNow": "Channels posting less than twice a month are rarely surfaced by YouTube recommendations.",
            "expectedOutcome": "Consistent weekly uploads can double recommendation frequency within 60 days."
        })
        score -= 10

    avg_views = stats.get("total_views", 0) / max(stats.get("video_count", 1), 1)
    if avg_views < 500:
        problems.append({
            "rank": len(problems) + 1,
            "category": "CTR Health",
            "problem": f"Average views per video is only {int(avg_views)} — titles/thumbnails are not generating clicks",
            "impact": "high",
            "action": "Study the top 3 channels in your niche. Model your next 5 thumbnails on their visual style.",
            "whyNow": "Low CTR means YouTube stops showing your videos in search and browse.",
            "expectedOutcome": "Improving CTR from 2% to 4% can double your impressions-to-views conversion."
        })
        score -= 10

    if not problems:
        problems.append({
            "rank": 1,
            "category": "General",
            "problem": "Full AI analysis could not run — reconnect your channel for a complete audit",
            "impact": "medium",
            "action": "Log out and reconnect your YouTube channel to trigger a fresh AI-powered analysis.",
            "whyNow": "Without full data, specific recommendations cannot be generated.",
            "expectedOutcome": "Complete audit with 5 ranked, data-specific priority actions."
        })

    fallback_cats = {
        "postingConsistency": 50,
        "videoLength": 50,
        "ctrHealth": 50,
        "audienceRetention": 50,
        "engagementQuality": 50,
        "contentStrategy": 50,
        "seoDiscoverability": 50,
        "trafficSourceIntelligence": 50,
        "audienceProfile": 50,
        "contentShareability": 50,
        "competitivePosition": None,
    }
    return {
        "channelScore": _compute_channel_score(fallback_cats),
        "channelSummary": "Analysis ran in fallback mode. Reconnect your channel for a full AI-powered audit.",
        "categoryScores": fallback_cats,
        "priorityActions": problems[:5],
        "quickWins": [],
        "topPerformingPattern": "Unable to determine without complete analysis.",
        "biggestRisk": "Unable to determine without complete analysis.",
        "trafficDominantSource": None,
        "audienceSummary": None,
        "shareabilityScore": None,
        "competitorBenchmark": None,
    }
