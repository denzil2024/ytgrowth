from datetime import datetime


def parse_duration_seconds(iso_duration):
    import re
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso_duration)
    if not match:
        return 0
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    return hours * 3600 + minutes * 60 + seconds


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
    gaps = [(dates[i] - dates[i+1]).days for i in range(len(dates)-1)]
    avg_gap = sum(gaps) / len(gaps)
    return round(7 / avg_gap, 2) if avg_gap > 0 else 0


def analyze_channel(stats, videos, analytics=None, video_analytics=None):
    insights = []

    avg_views = stats["total_views"] / max(stats["video_count"], 1)
    upload_freq = calculate_upload_frequency(videos)

    total_likes = sum(v.get("likes", 0) for v in videos)
    total_views_recent = sum(v.get("views", 0) for v in videos)
    like_rate = (total_likes / total_views_recent * 100) if total_views_recent > 0 else 0

    total_comments = sum(v.get("comments", 0) for v in videos)
    comment_rate = (total_comments / total_views_recent * 100) if total_views_recent > 0 else 0

    durations = [parse_duration_seconds(v.get("duration", "PT0S")) for v in videos if v.get("duration")]
    avg_duration = sum(durations) / len(durations) if durations else 0

    view_counts = [v["views"] for v in videos if v.get("views", 0) > 0]
    recent_avg = sum(view_counts[:5]) / len(view_counts[:5]) if len(view_counts) >= 5 else 0
    older_avg = sum(view_counts[5:10]) / len(view_counts[5:10]) if len(view_counts) >= 10 else 0
    declining = recent_avg < older_avg * 0.7 if older_avg > 0 else False

    if analytics:
        retention = analytics.get("avg_retention_percent", 0)
        avg_duration_secs = analytics.get("avg_view_duration_seconds", 0)
        net_subs = analytics.get("net_subscribers_90d", 0)
        views_90d = analytics.get("views_90d", 0)

        if retention > 0 and retention < 30:
            insights.append({
                "problem": "Audience retention is critically low",
                "cause": f"Viewers are leaving after watching only {retention}% of your videos on average. The algorithm stops recommending videos with retention below 30%.",
                "action": "Rewrite your video openings. Hook viewers in the first 30 seconds by telling them exactly what they will get. Remove slow intros and get straight to the value.",
                "severity": "critical"
            })
        elif retention > 0 and retention < 45:
            insights.append({
                "problem": "Audience retention needs improvement",
                "cause": f"Your average retention of {retention}% means viewers are dropping off before the midpoint. This limits how much YouTube recommends your content.",
                "action": "Add pattern interrupts every 60 to 90 seconds. Cut to a different shot, add a graphic, or ask a question to re-engage the viewer.",
                "severity": "high"
            })

        if avg_duration_secs > 0 and avg_duration_secs < 180:
            insights.append({
                "problem": "Average watch time is very short",
                "cause": f"Viewers only watch {avg_duration_secs // 60}m {avg_duration_secs % 60}s on average. Short watch time signals low content quality to YouTube.",
                "action": "Aim for videos that keep viewers for at least 4 minutes. Structure your content with a clear beginning, middle, and payoff at the end.",
                "severity": "high"
            })

        if net_subs < 0:
            insights.append({
                "problem": "You are losing more subscribers than you are gaining",
                "cause": f"In the last 90 days your channel lost a net {abs(net_subs)} subscribers. This usually means content quality or consistency has dropped.",
                "action": "Read recent comments to understand what changed. Go back to the content style that was working before the drop.",
                "severity": "critical"
            })
        elif net_subs < 10 and views_90d > 500:
            insights.append({
                "problem": "Views are not converting to subscribers",
                "cause": "People are watching your videos but not subscribing. They enjoy individual videos but do not see a reason to come back.",
                "action": "Add a subscribe call to action at the peak engagement moment in your video, right after delivering your best insight or reveal.",
                "severity": "high"
            })

    if upload_freq < 0.5:
        insights.append({
            "problem": "Upload frequency is too low",
            "cause": f"You are posting roughly {round(upload_freq * 4, 1)} times per month. Channels posting less than twice a month are rarely recommended by the algorithm.",
            "action": "Create a content calendar and commit to at least one video per week. Batch record 3 to 4 videos in one session to build a buffer.",
            "severity": "high"
        })
    elif upload_freq < 1:
        insights.append({
            "problem": "Upload frequency is below average",
            "cause": f"You are uploading about once every {round(7 / upload_freq)} days. Consistent weekly uploads significantly improve algorithm performance.",
            "action": "Increase to one video per week minimum. Use YouTube Shorts to fill gaps between long-form uploads.",
            "severity": "medium"
        })

    if avg_views < 200 and stats["video_count"] >= 5:
        insights.append({
            "problem": "Average views per video is very low",
            "cause": f"Your videos average {int(avg_views)} views each. This suggests your titles and thumbnails are not compelling enough to generate clicks.",
            "action": "Study the top 3 videos in your niche. Identify the thumbnail style, title format, and topic angle they use and model your next 5 videos on those patterns.",
            "severity": "critical"
        })
    elif avg_views < 500 and stats["video_count"] >= 5:
        insights.append({
            "problem": "Average views per video is below average",
            "cause": f"With an average of {int(avg_views)} views per video, your content is not being surfaced by YouTube search or recommendations.",
            "action": "Focus on searchable topics for your next 3 videos. Use titles that answer specific questions your target audience is actively searching for.",
            "severity": "medium"
        })

    if like_rate < 1 and total_views_recent > 100:
        insights.append({
            "problem": "Like rate is critically low",
            "cause": f"Only {round(like_rate, 2)}% of viewers are liking your videos. A healthy like rate is 4 to 6 percent. This signals low satisfaction to the algorithm.",
            "action": "Ask for likes at the moment of highest value in your video, not at the end. Explain specifically why it helps.",
            "severity": "high"
        })
    elif like_rate < 3 and total_views_recent > 100:
        insights.append({
            "problem": "Like rate is below average",
            "cause": f"Your like rate of {round(like_rate, 2)}% is below the healthy range of 4 to 6 percent.",
            "action": "Add a natural like request early in your video tied to a specific benefit. Avoid generic phrases.",
            "severity": "medium"
        })

    if comment_rate < 0.1 and total_views_recent > 200:
        insights.append({
            "problem": "Viewer engagement in comments is very low",
            "cause": "Almost no one is leaving comments. Comments are a strong engagement signal that boosts algorithm ranking.",
            "action": "End every video with a specific easy-to-answer question. For example: What was your biggest takeaway? Specific prompts get 3 times more responses.",
            "severity": "medium"
        })

    if declining:
        insights.append({
            "problem": "Recent videos are getting fewer views than older ones",
            "cause": "Your last 5 videos are underperforming compared to your previous content. This suggests a drop in quality, consistency, or topic relevance.",
            "action": "Study what made your older videos work. Replicate that topic, format, and thumbnail style in your next video.",
            "severity": "high"
        })

    if stats["video_count"] < 10:
        insights.append({
            "problem": "Your channel does not have enough content yet",
            "cause": "Channels with fewer than 10 videos rarely get recommended. YouTube needs data on your content before surfacing it to new viewers.",
            "action": "Publish 10 videos before optimizing anything else. Volume builds the data YouTube needs to understand and recommend your channel.",
            "severity": "medium"
        })

    if avg_duration > 0 and avg_duration < 300:
        insights.append({
            "problem": "Your videos are too short",
            "cause": f"Your average video length is {int(avg_duration // 60)} minutes. Videos under 5 minutes generate very little total watch time.",
            "action": "Aim for 8 to 12 minute videos. This length maximizes watch time while remaining digestible for most viewers.",
            "severity": "low"
        })

    if not insights:
        insights.append({
            "problem": "No major issues detected",
            "cause": "Your channel metrics look healthy across the board.",
            "action": "Focus on consistency and doubling down on your top performing content formats.",
            "severity": "info"
        })

    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}
    insights.sort(key=lambda x: severity_order.get(x.get("severity", "info"), 4))

    return insights
