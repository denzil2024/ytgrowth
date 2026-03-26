from googleapiclient.discovery import build
from datetime import datetime


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


def get_competitor_stats(credentials, channel_id):
    youtube = build("youtube", "v3", credentials=credentials)
    try:
        response = youtube.channels().list(
            part="snippet,statistics,contentDetails",
            id=channel_id
        ).execute()
        if not response.get("items"):
            return None
        channel = response["items"][0]
        stats = channel["statistics"]
        snippet = channel["snippet"]
        uploads_playlist = channel["contentDetails"]["relatedPlaylists"].get("uploads")
        recent_videos = []
        upload_freq = 0
        if uploads_playlist:
            playlist_response = youtube.playlistItems().list(
                part="snippet",
                playlistId=uploads_playlist,
                maxResults=10
            ).execute()
            items = playlist_response.get("items", [])
            video_ids = [item["snippet"]["resourceId"]["videoId"] for item in items]
            if video_ids:
                videos_response = youtube.videos().list(
                    part="statistics,snippet",
                    id=",".join(video_ids)
                ).execute()
                dates = []
                for v in videos_response.get("items", []):
                    s = v["statistics"]
                    published = v["snippet"].get("publishedAt", "")
                    recent_videos.append({
                        "title": v["snippet"].get("title", ""),
                        "views": int(s.get("viewCount", 0)),
                        "likes": int(s.get("likeCount", 0)),
                        "published_at": published
                    })
                    if published:
                        try:
                            dates.append(datetime.strptime(published[:10], "%Y-%m-%d"))
                        except:
                            pass
                if len(dates) >= 2:
                    dates.sort(reverse=True)
                    gaps = [(dates[i] - dates[i+1]).days for i in range(len(dates)-1)]
                    avg_gap = sum(gaps) / len(gaps)
                    upload_freq = round(7 / avg_gap, 2) if avg_gap > 0 else 0
        avg_views = round(sum(v["views"] for v in recent_videos) / len(recent_videos)) if recent_videos else 0
        total_likes = sum(v["likes"] for v in recent_videos)
        total_views = sum(v["views"] for v in recent_videos)
        like_rate = round(total_likes / total_views * 100, 2) if total_views > 0 else 0
        return {
            "channel_id": channel_id,
            "channel_name": snippet["title"],
            "thumbnail": (snippet["thumbnails"].get("medium") or snippet["thumbnails"].get("default") or {}).get("url", ""),
            "subscribers": int(stats.get("subscriberCount", 0)),
            "total_views": int(stats.get("viewCount", 0)),
            "video_count": int(stats.get("videoCount", 0)),
            "avg_views_per_video": avg_views,
            "upload_frequency": upload_freq,
            "like_rate": like_rate,
            "recent_videos": recent_videos[:5]
        }
    except Exception as e:
        print(f"Competitor stats error: {e}")
        return None


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
            "recommendation": f"Their videos average {comp_avg:,} views vs your {my_avg:,}. Study their top 3 videos and identify the title structure, thumbnail style, and topic angle driving views. Model your next video on those patterns."
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
            "recommendation": f"They post {round(comp_freq, 1)} times per week, you post {round(my_freq, 1)}. Batch record 3 to 4 videos in one session to close this gap within 60 days."
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
            "recommendation": f"They have {comp_subs:,} subscribers vs your {my_subs:,}. Focus on increasing average views per video first — subscribers follow views."
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
            "recommendation": f"Their like rate of {comp_lr}% vs your {my_lr}% suggests their content feels more valuable. Add a specific like request tied to a benefit at the 30% mark of your video."
        })
    return gaps


def extract_niche_keywords(stats, videos):
    stopwords = {"the","a","an","and","or","but","in","on","at","to","for","of","with","by","from","is","was","are","were","have","has","do","does","my","your","how","what","why","when","who","this","that","these","those","will","can","get","you","your","more"}
    keywords = []
    for word in stats.get("channel_name", "").lower().split():
        if word not in stopwords and len(word) > 3:
            keywords.append(word)
    for video in videos[:5]:
        for word in video.get("title", "").lower().split():
            clean = word.strip(".,!?#:")
            if clean not in stopwords and len(clean) > 4:
                keywords.append(clean)
    from collections import Counter
    common = Counter(keywords).most_common(3)
    return [k for k, _ in common]
