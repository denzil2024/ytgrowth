import os
import re
import json
from collections import Counter
from datetime import datetime, timedelta

import anthropic
from googleapiclient.discovery import build


def parse_duration_seconds(iso_duration):
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso_duration or '')
    if not match:
        return 0
    return int(match.group(1) or 0) * 3600 + int(match.group(2) or 0) * 60 + int(match.group(3) or 0)


def search_competitor_channels(credentials, query, max_results=5):
    youtube = build("youtube", "v3", credentials=credentials)
    try:
        response = youtube.search().list(
            part="snippet",
            q=query,
            type="channel",
            maxResults=max_results,
            order="relevance"
        ).execute()
        channels = []
        for item in response.get("items", []):
            channels.append({
                "channel_id": item["snippet"]["channelId"],
                "channel_name": item["snippet"]["channelTitle"],
                "description": item["snippet"].get("description", "")[:120],
                "thumbnail": item["snippet"]["thumbnails"].get("default", {}).get("url", "")
            })
        return channels
    except Exception as e:
        print(f"Search error: {e}")
        return []


def _calculate_posting_behavior(videos):
    """Derive posting frequency, top upload day and hour from a video list."""
    dates = []
    day_counts = {}
    hour_counts = {}

    for v in videos:
        raw = v.get("published_at", "")
        try:
            dt = datetime.strptime(raw, "%Y-%m-%dT%H:%M:%SZ")
            dates.append(dt)
            day = dt.strftime("%A")
            day_counts[day] = day_counts.get(day, 0) + 1
            hour_counts[dt.hour] = hour_counts.get(dt.hour, 0) + 1
        except Exception:
            pass

    avg_gap = 0
    if len(dates) >= 2:
        sorted_dates = sorted(dates, reverse=True)
        gaps = [(sorted_dates[i] - sorted_dates[i + 1]).days for i in range(len(sorted_dates) - 1)]
        avg_gap = round(sum(gaps) / len(gaps), 1) if gaps else 0

    top_day = max(day_counts, key=day_counts.get) if day_counts else "Unknown"
    top_hour_int = max(hour_counts, key=hour_counts.get) if hour_counts else None
    top_hour = f"{top_hour_int:02d}:00" if top_hour_int is not None else "Unknown"

    cutoff = datetime.now() - timedelta(days=30)
    recent_count = sum(1 for d in dates if d >= cutoff)

    return {
        "avg_gap_days": avg_gap,
        "top_day": top_day,
        "top_hour": top_hour,
        "videos_last_30_days": recent_count,
    }


def fetch_competitor_public_data(credentials, channel_id):
    """
    Fetch full public data for a competitor channel.
    Pulls up to 30 recent videos with duration, stats, and posting behavior.
    No OAuth Analytics API calls — public data only.
    """
    youtube = build("youtube", "v3", credentials=credentials)
    try:
        response = youtube.channels().list(
            part="snippet,statistics,contentDetails,brandingSettings",
            id=channel_id
        ).execute()
        if not response.get("items"):
            return None

        channel = response["items"][0]
        stats = channel["statistics"]
        snippet = channel["snippet"]
        branding = channel.get("brandingSettings", {})
        channel_keywords = branding.get("channel", {}).get("keywords", "")
        uploads_playlist = channel["contentDetails"]["relatedPlaylists"].get("uploads")

        # Channel age
        created_at = snippet.get("publishedAt", "")
        channel_age_str = "Unknown"
        if created_at:
            try:
                created = datetime.strptime(created_at[:10], "%Y-%m-%d")
                age_days = (datetime.now() - created).days
                years = age_days // 365
                months = (age_days % 365) // 30
                channel_age_str = f"{years}y {months}m" if years > 0 else f"{months} months"
            except Exception:
                pass

        recent_videos = []
        if uploads_playlist:
            playlist_response = youtube.playlistItems().list(
                part="snippet",
                playlistId=uploads_playlist,
                maxResults=30
            ).execute()
            items = playlist_response.get("items", [])
            video_ids = [item["snippet"]["resourceId"]["videoId"] for item in items]

            if video_ids:
                videos_response = youtube.videos().list(
                    part="statistics,snippet,contentDetails",
                    id=",".join(video_ids)
                ).execute()
                for v in videos_response.get("items", []):
                    s = v["statistics"]
                    vsnippet = v["snippet"]
                    published = vsnippet.get("publishedAt", "")
                    duration_secs = parse_duration_seconds(v["contentDetails"].get("duration", "PT0S"))
                    thumbs = vsnippet.get("thumbnails", {})
                    thumb_url = (thumbs.get("medium") or thumbs.get("default") or {}).get("url", "")
                    recent_videos.append({
                        "video_id": v["id"],
                        "title": vsnippet.get("title", ""),
                        "published_at": published,
                        "duration_seconds": duration_secs,
                        "views": int(s.get("viewCount", 0)),
                        "likes": int(s.get("likeCount", 0)),
                        "comments": int(s.get("commentCount", 0)),
                        "thumbnail_url": thumb_url,
                    })

        posting = _calculate_posting_behavior(recent_videos)
        top_5 = sorted(recent_videos, key=lambda v: v["views"], reverse=True)[:5]

        avg_views = round(sum(v["views"] for v in recent_videos) / len(recent_videos)) if recent_videos else 0
        total_likes = sum(v["likes"] for v in recent_videos)
        total_views_recent = sum(v["views"] for v in recent_videos)
        like_rate = round(total_likes / total_views_recent * 100, 2) if total_views_recent > 0 else 0
        upload_freq = round(7 / posting["avg_gap_days"], 2) if posting["avg_gap_days"] > 0 else 0

        thumbnails = snippet.get("thumbnails", {})
        thumbnail_url = (thumbnails.get("medium") or thumbnails.get("default") or {}).get("url", "")

        return {
            "channel_id": channel_id,
            "channel_name": snippet["title"],
            "handle": snippet.get("customUrl", ""),
            "thumbnail": thumbnail_url,
            "subscribers": int(stats.get("subscriberCount", 0)),
            "total_views": int(stats.get("viewCount", 0)),
            "video_count": int(stats.get("videoCount", 0)),
            "created_at": created_at[:10] if created_at else "",
            "channel_age": channel_age_str,
            "description": snippet.get("description", "")[:500],
            "keywords": channel_keywords,
            "avg_views_per_video": avg_views,
            "upload_frequency": upload_freq,
            "like_rate": like_rate,
            "posting_behavior": posting,
            "recent_videos": recent_videos,
            "top_5_videos": top_5,
        }
    except Exception as e:
        print(f"Competitor public data error: {e}")
        return None


def analyze_competitor_with_ai(user_channel, user_videos, competitor_data):
    """
    Run a Claude competitive intelligence analysis.
    Returns a structured JSON object with gaps, topics, title patterns, winning moves, etc.
    """
    # Derive user upload gap from their video history
    user_avg_gap = "Unknown"
    if len(user_videos) >= 2:
        dates = []
        for v in user_videos:
            try:
                dates.append(datetime.strptime(v.get("published_at", "")[:10], "%Y-%m-%d"))
            except Exception:
                pass
        if len(dates) >= 2:
            dates.sort(reverse=True)
            gaps = [(dates[i] - dates[i + 1]).days for i in range(len(dates) - 1)]
            user_avg_gap = round(sum(gaps) / len(gaps), 1)

    user_avg_views = round(
        user_channel.get("total_views", 0) / max(user_channel.get("video_count", 1), 1)
    )

    comp = competitor_data
    posting = comp.get("posting_behavior", {})

    # Slim down videos for the prompt — strip thumbnail URLs and cap at 20
    def _slim(videos):
        return [
            {k: v for k, v in vid.items() if k != "thumbnail_url"}
            for vid in (videos or [])[:20]
        ]

    videos_json = json.dumps(_slim(comp.get("recent_videos", [])), default=str)
    top_5_json  = json.dumps(_slim(comp.get("top_5_videos", [])),  default=str)

    prompt = f"""The user's channel is: {user_channel.get('channel_name', 'Unknown')}
Their niche (from channel keywords): {user_channel.get('keywords', 'N/A')}
Their average views per video: {user_avg_views:,}
Their posting frequency: every {user_avg_gap} days
Their total subscribers: {user_channel.get('subscribers', 0):,}

They are analyzing this competitor:

--- COMPETITOR OVERVIEW ---
Channel name: {comp.get('channel_name', 'N/A')}
Subscribers: {comp.get('subscribers', 0):,}
Total views: {comp.get('total_views', 0):,}
Total videos: {comp.get('video_count', 0)}
Channel age: {comp.get('channel_age', 'N/A')}
Description: {comp.get('description', 'N/A')}
Channel keywords: {comp.get('keywords', 'N/A')}

--- POSTING BEHAVIOR ---
Videos in last 30 days: {posting.get('videos_last_30_days', 0)}
Average days between uploads: {posting.get('avg_gap_days', 0)}
Most common upload day: {posting.get('top_day', 'Unknown')}
Most common upload hour: {posting.get('top_hour', 'Unknown')}

--- LAST 30 VIDEOS ---
{videos_json}

--- TOP 5 VIDEOS BY VIEWS ---
{top_5_json}

---

Perform a full competitive gap analysis across these dimensions:

1. CONTENT TOPICS — What topics/themes do they consistently cover? Which topics drive their highest views? Which topics are they ignoring that the user could own?

2. TITLE & SEO STRATEGY — What title patterns do they use? What keywords appear most? Are there high-volume keywords they rank for that the user is not targeting?

3. POSTING FREQUENCY & TIMING — How often do they post and when? Is there a timing window the user could exploit?

4. VIDEO LENGTH PATTERNS — What duration performs best? Is there a format gap the user could exploit?

5. ENGAGEMENT PATTERNS — Like-to-view and comment-to-view ratios. Are viewers engaged or passive? Which topics drive the most comments?

6. THUMBNAIL STYLE — What visual patterns appear across their thumbnails? Is it strong or weak? What could the user do to stand out in the same feed?

7. CONTENT GAPS — Topics the competitor has never covered but their audience clearly wants.

Return ONLY valid JSON, no markdown, no preamble:

{{
  "competitorSummary": "string (2-3 sentence honest assessment)",
  "threatLevel": "low|medium|high",
  "threatReason": "string (why this competitor is or isn't a threat)",
  "topTopics": [
    {{ "topic": "string", "avgViews": number, "videoCount": number }}
  ],
  "titlePatterns": {{
    "avgTitleLength": number,
    "dominantFormats": ["string"],
    "topKeywords": ["string"],
    "powerWordsUsed": ["string"]
  }},
  "postingBehavior": {{
    "avgGapDays": number,
    "bestDay": "string",
    "bestHour": "string",
    "consistencyScore": number
  }},
  "videoLengthInsight": "string",
  "engagementInsight": "string",
  "thumbnailPattern": "string",
  "gapsToExploit": [
    {{
      "gap": "string (specific opportunity)",
      "howToCapture": "string (exact action to take)",
      "estimatedImpact": "high|medium|low"
    }}
  ],
  "topVideosToStudy": [
    {{
      "title": "string (exact title from the video list above)",
      "views": number,
      "whyItWorked": "string"
    }}
  ],
  "videoIdeas": [
    {{
      "title": "string (ready-to-use video title the user can make)",
      "angle": "string (how this steals or counters the competitor's audience)",
      "targetKeyword": "string (primary keyword to target)"
    }}
  ],
  "winningMoves": ["string (specific tactic to steal or counter)"]
}}"""

    try:
        client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=(
                "You are an elite YouTube competitive intelligence analyst. "
                "Your job is not to describe a competitor — your job is to find the exact gaps, "
                "weaknesses, and opportunities the user can exploit to grow faster and outrank them. "
                "Be brutally specific. Reference actual data points from the competitor's videos. "
                "Never give generic advice."
            ),
            messages=[{"role": "user", "content": prompt}]
        )
        raw = message.content[0].text.strip()
        raw = re.sub(r'^```[a-z]*\n?', '', raw)
        raw = re.sub(r'\n?```$', '', raw).strip()
        return json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"Competitor AI analysis JSON parse error: {e}")
        return None
    except Exception as e:
        print(f"Competitor AI analysis error: {e}")
        return None


# ---------------------------------------------------------------------------
# Legacy helpers kept for the rule-based gap fallback
# ---------------------------------------------------------------------------

def get_competitor_stats(credentials, channel_id):
    """Thin wrapper that calls fetch_competitor_public_data for backward compat."""
    return fetch_competitor_public_data(credentials, channel_id)


def generate_competitor_gaps(my_stats, competitor_stats):
    gaps = []
    my_avg = my_stats.get("avg_views_per_video", 0)
    comp_avg = competitor_stats.get("avg_views_per_video", 0)
    if comp_avg > 0 and my_avg < comp_avg:
        pct = round((comp_avg - my_avg) / comp_avg * 100)
        gaps.append({
            "metric": "Avg views per video",
            "yours": f"{my_avg:,}",
            "theirs": f"{comp_avg:,}",
            "gap": f"{pct}% behind",
            "severity": "critical" if pct > 70 else "high" if pct > 40 else "medium",
            "recommendation": (
                f"Their videos average {comp_avg:,} views vs your {my_avg:,}. "
                "Study their top 3 videos and identify the title structure, thumbnail style, "
                "and topic angle driving views. Model your next video on those patterns."
            ),
        })
    my_freq = my_stats.get("upload_frequency", 0)
    comp_freq = competitor_stats.get("upload_frequency", 0)
    if comp_freq > my_freq and comp_freq > 0:
        gap_ratio = round((comp_freq - my_freq) / comp_freq * 100)
        gaps.append({
            "metric": "Upload frequency",
            "yours": f"{round(my_freq, 1)}x/week",
            "theirs": f"{round(comp_freq, 1)}x/week",
            "gap": f"{gap_ratio}% behind",
            "severity": "high" if gap_ratio > 50 else "medium",
            "recommendation": (
                f"They post {round(comp_freq, 1)} times per week, you post {round(my_freq, 1)}. "
                "Batch record 3–4 videos in one session to close this gap within 60 days."
            ),
        })
    my_subs = my_stats.get("subscribers", 0)
    comp_subs = competitor_stats.get("subscribers", 0)
    if comp_subs > my_subs and comp_subs > 0:
        pct = round((comp_subs - my_subs) / comp_subs * 100)
        gaps.append({
            "metric": "Subscribers",
            "yours": f"{my_subs:,}",
            "theirs": f"{comp_subs:,}",
            "gap": f"{pct}% behind",
            "severity": "medium",
            "recommendation": (
                f"They have {comp_subs:,} subscribers vs your {my_subs:,}. "
                "Focus on increasing average views per video first — subscribers follow views."
            ),
        })
    my_lr = my_stats.get("like_rate", 0)
    comp_lr = competitor_stats.get("like_rate", 0)
    if comp_lr > my_lr and comp_lr > 0:
        gaps.append({
            "metric": "Like rate",
            "yours": f"{my_lr}%",
            "theirs": f"{comp_lr}%",
            "gap": f"{round(comp_lr - my_lr, 1)}% lower",
            "severity": "medium",
            "recommendation": (
                f"Their like rate of {comp_lr}% vs your {my_lr}% suggests their content feels more valuable. "
                "Add a specific like request tied to a benefit at the 30% mark of your video."
            ),
        })
    return gaps


def extract_niche_keywords(stats, videos):
    stopwords = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of",
        "with", "by", "from", "is", "was", "are", "were", "have", "has", "do", "does",
        "my", "your", "how", "what", "why", "when", "who", "this", "that", "these",
        "those", "will", "can", "get", "you", "your", "more",
    }
    keywords = []
    for word in stats.get("channel_name", "").lower().split():
        if word not in stopwords and len(word) > 3:
            keywords.append(word)
    for video in videos[:5]:
        for word in video.get("title", "").lower().split():
            clean = word.strip(".,!?#:")
            if clean not in stopwords and len(clean) > 4:
                keywords.append(clean)
    common = Counter(keywords).most_common(3)
    return [k for k, _ in common]
