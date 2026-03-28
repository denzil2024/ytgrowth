import urllib.parse
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from googleapiclient.discovery import build
from datetime import datetime, timedelta


def get_channel_stats(credentials):
    youtube = build("youtube", "v3", credentials=credentials)
    request = youtube.channels().list(
        part="snippet,statistics,brandingSettings",
        mine=True
    )
    response = request.execute()
    if not response["items"]:
        return None
    channel = response["items"][0]
    stats = channel["statistics"]
    snippet = channel["snippet"]
    thumbnails = snippet.get("thumbnails", {})
    thumbnail_url = (
        thumbnails.get("medium", {}).get("url") or
        thumbnails.get("default", {}).get("url") or
        ""
    )
    branding = channel.get("brandingSettings", {})
    channel_details = branding.get("channel", {})
    return {
        "channel_id": channel["id"],
        "channel_name": snippet["title"],
        "subscribers": int(stats.get("subscriberCount", 0)),
        "total_views": int(stats.get("viewCount", 0)),
        "video_count": int(stats.get("videoCount", 0)),
        "created_at": snippet.get("publishedAt", ""),
        "thumbnail": thumbnail_url,
        "description": snippet.get("description", ""),
        "keywords": channel_details.get("keywords", ""),
    }


def get_recent_videos(credentials, max_results=20):
    youtube = build("youtube", "v3", credentials=credentials)
    search_request = youtube.search().list(
        part="snippet",
        forMine=True,
        type="video",
        order="date",
        maxResults=max_results
    )
    search_response = search_request.execute()
    if not search_response.get("items"):
        return []
    video_ids = [item["id"]["videoId"] for item in search_response["items"]]
    stats_request = youtube.videos().list(
        part="statistics,contentDetails,snippet",
        id=",".join(video_ids)
    )
    stats_response = stats_request.execute()
    videos = []
    for video in stats_response["items"]:
        s = video["statistics"]
        snippet = video["snippet"]
        duration = video["contentDetails"].get("duration", "PT0S")
        videos.append({
            "video_id": video["id"],
            "title": snippet.get("title", ""),
            "published_at": snippet.get("publishedAt", ""),
            "views": int(s.get("viewCount", 0)),
            "likes": int(s.get("likeCount", 0)),
            "comments": int(s.get("commentCount", 0)),
            "duration": duration,
            "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url", "")
        })
    return videos


def get_analytics(credentials, channel_id):
    try:
        analytics = build("youtubeAnalytics", "v2", credentials=credentials)
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
        response = analytics.reports().query(
            ids=f"channel=={channel_id}",
            startDate=start_date,
            endDate=end_date,
            metrics="views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost",
            dimensions="day"
        ).execute()
        rows = response.get("rows", [])
        if not rows:
            return None
        total_views = sum(r[1] for r in rows)
        total_watch_minutes = sum(r[2] for r in rows)
        avg_view_duration = sum(r[3] for r in rows) / len(rows)
        avg_retention = sum(r[4] for r in rows) / len(rows)
        subs_gained = sum(r[5] for r in rows)
        subs_lost = sum(r[6] for r in rows)
        return {
            "views_90d": int(total_views),
            "watch_minutes_90d": int(total_watch_minutes),
            "avg_view_duration_seconds": round(avg_view_duration),
            "avg_retention_percent": round(avg_retention, 1),
            "subscribers_gained_90d": int(subs_gained),
            "subscribers_lost_90d": int(subs_lost),
            "net_subscribers_90d": int(subs_gained - subs_lost)
        }
    except Exception as e:
        print(f"Analytics error: {e}")
        return None


def get_video_analytics(credentials, channel_id):
    try:
        analytics = build("youtubeAnalytics", "v2", credentials=credentials)
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
        # Try with impressions and CTR first; fall back if not available
        try:
            response = analytics.reports().query(
                ids=f"channel=={channel_id}",
                startDate=start_date,
                endDate=end_date,
                metrics="views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,likes,comments,shares,impressions,impressionClickThroughRate",
                dimensions="video",
                sort="-views",
                maxResults=20
            ).execute()
            rows = response.get("rows", [])
            videos = []
            for r in rows:
                videos.append({
                    "video_id": r[0],
                    "views": int(r[1]),
                    "watch_minutes": int(r[2]),
                    "avg_duration_seconds": round(r[3]),
                    "avg_retention_percent": round(r[4], 1),
                    "subscribers_gained": int(r[5]),
                    "likes": int(r[6]),
                    "comments": int(r[7]),
                    "shares": int(r[8]),
                    "impressions": int(r[9]),
                    "ctr_percent": round(r[10] * 100, 2),
                })
            return videos
        except Exception:
            # Fallback without impressions/CTR
            response = analytics.reports().query(
                ids=f"channel=={channel_id}",
                startDate=start_date,
                endDate=end_date,
                metrics="views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,likes,comments,shares",
                dimensions="video",
                sort="-views",
                maxResults=20
            ).execute()
            rows = response.get("rows", [])
            videos = []
            for r in rows:
                videos.append({
                    "video_id": r[0],
                    "views": int(r[1]),
                    "watch_minutes": int(r[2]),
                    "avg_duration_seconds": round(r[3]),
                    "avg_retention_percent": round(r[4], 1),
                    "subscribers_gained": int(r[5]),
                    "likes": int(r[6]),
                    "comments": int(r[7]),
                    "shares": int(r[8]),
                    "impressions": None,
                    "ctr_percent": None,
                })
            return videos
    except Exception as e:
        print(f"Video analytics error: {e}")
        return []


def scrape_autocomplete(seed_keyword: str) -> list[str]:
    """
    Scrape YouTube autocomplete for a seed keyword.
    Calls the endpoint with:
      - the seed as-is
      - seed + each letter a-z
      - 3 common prefixes
    Returns a deduplicated flat list of suggestions.
    """
    base_url = "https://suggestqueries.google.com/complete/search"
    headers = {"User-Agent": "Mozilla/5.0"}
    seen: set[str] = set()
    results: list[str] = []

    queries = [seed_keyword]
    for letter in "abcdefghijklmnopqrstuvwxyz":
        queries.append(f"{seed_keyword} {letter}")
    for prefix in ("how to", "best", "for beginners"):
        queries.append(f"{prefix} {seed_keyword}")

    def fetch(query):
        try:
            url = (
                f"{base_url}?client=firefox&ds=yt"
                f"&q={urllib.parse.quote(query)}&hl=en"
            )
            resp = requests.get(url, timeout=5, headers=headers)
            if not resp.ok:
                return []
            data = resp.json()
            return [s for s in (data[1] if len(data) > 1 else []) if isinstance(s, str) and s]
        except Exception as e:
            print(f"Autocomplete error for '{query}': {e}")
            return []

    with ThreadPoolExecutor(max_workers=10) as pool:
        for batch in as_completed([pool.submit(fetch, q) for q in queries]):
            for item in batch.result():
                if item.lower() not in seen:
                    seen.add(item.lower())
                    results.append(item)

    return results
