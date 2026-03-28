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
            "thumbnail_url": v.get("thumbnail", ""),
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


def analyze_channel(stats, videos, analytics=None, video_analytics=None):
    merged = _merge_video_data(videos, video_analytics)
    posting = _posting_behavior(videos)
    agg = _channel_aggregates(merged, analytics)

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

    videos_section = f"--- LAST 20 VIDEOS (individual breakdown) ---\n{json.dumps(merged, indent=2, default=str)}"

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

    analysis_instructions = """## YOUR ANALYSIS INSTRUCTIONS

Perform a full deep audit across these 7 categories. For each category, assign a score from 0 to 100 and write specific observations based on the actual data above — never give generic advice.

### 1. POSTING CONSISTENCY
Evaluate upload frequency, gaps between videos, and whether posting days/times align with the audience's peak active hours. Flag irregular patterns, long gaps, and mismatched timing.

### 2. VIDEO LENGTH OPTIMIZATION
Compare video durations against average view percentage. If average view percentage is low, videos may be too long. If it is high, they may be leaving watch time on the table. Identify the sweet spot based on their actual retention data. Flag outlier videos that are significantly longer or shorter than what performs best.

### 3. CTR HEALTH (Titles + Thumbnails)
Analyze the CTR across all 20 videos. YouTube benchmark is 4–6% for established channels, 2–4% for newer ones. Flag videos below benchmark. Identify which titles/thumbnails performed best and extract the pattern. Note if titles are too long, lack keywords, or lack emotional hooks.

### 4. AUDIENCE RETENTION
Evaluate average view percentage across all videos. Below 40% is a red flag. Above 50% is strong. Identify which videos had the best retention and what they have in common (length, topic, format). Flag videos where retention dropped sharply.

### 5. ENGAGEMENT QUALITY
Calculate like-to-view ratio and comment-to-view ratio. Flag if engagement is low relative to views (indicates passive audience not converting). Check subscriber-gained-per-video to identify which content types are driving channel growth.

### 6. CONTENT STRATEGY & NICHE CLARITY
Assess whether the last 20 video titles suggest a clear niche or scattered topics. Identify which topic clusters get the most views and engagement. Flag if the channel is inconsistent in its content focus.

### 7. SEO & DISCOVERABILITY
Evaluate whether channel keywords are set and relevant. Check if video titles follow SEO best practices (primary keyword in first half, 50–70 characters, specificity). Flag missing or weak descriptions based on available data.

## OUTPUT FORMAT

Return ONLY valid JSON. No markdown. No preamble. Exact structure:

{
  "channelScore": <number 0-100>,
  "channelSummary": "<2-3 sentence honest assessment>",
  "categoryScores": {
    "postingConsistency": <number>,
    "videoLength": <number>,
    "ctrHealth": <number>,
    "audienceRetention": <number>,
    "engagementQuality": <number>,
    "contentStrategy": <number>,
    "seoDiscoverability": <number>
  },
  "priorityActions": [
    {
      "rank": 1,
      "category": "<string>",
      "problem": "<specific problem found in their data>",
      "impact": "high|medium|low",
      "action": "<exactly what to do, specific and actionable>",
      "whyNow": "<why this is the most urgent fix>",
      "expectedOutcome": "<what metric will improve and roughly by how much>"
    }
  ],
  "quickWins": ["<small thing they can fix today>"],
  "topPerformingPattern": "<what their best videos have in common>",
  "biggestRisk": "<the one thing that will hold the channel back if not fixed>"
}"""

    prompt = f"""Here is the full analytics data for this YouTube channel:

{channel_overview}

{posting_section}

{audience_section}

{videos_section}

{agg_section}

---

{analysis_instructions}"""

    try:
        client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
        message = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = message.content[0].text.strip()
        # Strip markdown code fences if present
        raw = re.sub(r'^```[a-z]*\n?', '', raw)
        raw = re.sub(r'\n?```$', '', raw).strip()
        return json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"AI analysis JSON parse error: {e}")
        return _fallback_analysis(stats, videos, analytics)
    except Exception as e:
        print(f"AI analysis error: {e}")
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
            "action": "Commit to at least 1 video per week. Batch record 3–4 videos per session to build a buffer.",
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

    return {
        "channelScore": max(score, 10),
        "channelSummary": "Analysis ran in fallback mode. Reconnect your channel for a full AI-powered audit.",
        "categoryScores": {
            "postingConsistency": 50,
            "videoLength": 50,
            "ctrHealth": 50,
            "audienceRetention": 50,
            "engagementQuality": 50,
            "contentStrategy": 50,
            "seoDiscoverability": 50,
        },
        "priorityActions": problems[:5],
        "quickWins": [],
        "topPerformingPattern": "Unable to determine without complete analysis.",
        "biggestRisk": "Unable to determine without complete analysis.",
    }
