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


def get_video_metrics_map(credentials, channel_id, video_ids=None):
    """Fetch retention % + avg watch time for top videos. Avoids impressions (channel-restricted)."""
    if not channel_id:
        print("[metrics] no channel_id, skipping")
        return {}
    try:
        analytics = build("youtubeAnalytics", "v2", credentials=credentials)
        end_date   = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")
        response = analytics.reports().query(
            ids=f"channel=={channel_id}",
            startDate=start_date,
            endDate=end_date,
            metrics="views,averageViewDuration,averageViewPercentage",
            dimensions="video",
            sort="-views",
            maxResults=200,
        ).execute()
        rows = response.get("rows", [])
        print(f"[metrics] channel={channel_id} got {len(rows)} video rows")
        out = {}
        for r in rows:
            out[r[0]] = {
                "avg_duration_seconds":  int(r[2]) if r[2] is not None else None,
                "avg_view_percent":      round(r[3], 1) if r[3] is not None else None,
            }
        return out
    except Exception as e:
        print(f"[metrics] fetch error: {e}")
        import traceback; traceback.print_exc()
        return {}


def get_watch_minutes_365d(credentials, channel_id):
    """Total estimated watch minutes across the last 365 days. For milestone tracking."""
    if not channel_id:
        return 0
    try:
        analytics = build("youtubeAnalytics", "v2", credentials=credentials)
        end_date   = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")
        response = analytics.reports().query(
            ids=f"channel=={channel_id}",
            startDate=start_date,
            endDate=end_date,
            metrics="estimatedMinutesWatched",
        ).execute()
        rows = response.get("rows", [])
        if not rows:
            return 0
        return int(rows[0][0] or 0)
    except Exception as e:
        print(f"[watch_365d] fetch error: {e}")
        return 0


def merge_metrics_into_videos(videos, metrics_map):
    if not videos:
        return videos
    metrics_map = metrics_map or {}
    matched = 0
    for video in videos:
        entry = metrics_map.get(video.get("video_id"))
        if entry:
            matched += 1
        video["avg_duration_seconds"] = entry.get("avg_duration_seconds") if entry else None
        video["avg_view_percent"]     = entry.get("avg_view_percent")     if entry else None
    print(f"[metrics] merged {matched}/{len(videos)} videos (map had {len(metrics_map)} entries)")
    return videos


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


def get_traffic_sources(credentials, channel_id):
    try:
        analytics = build("youtubeAnalytics", "v2", credentials=credentials)
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
        response = analytics.reports().query(
            ids=f"channel=={channel_id}",
            startDate=start_date,
            endDate=end_date,
            metrics="views,estimatedMinutesWatched",
            dimensions="insightTrafficSourceType",
        ).execute()
        rows = response.get("rows", [])
        result = [
            {"source": r[0], "views": int(r[1]), "watch_minutes": int(r[2])}
            for r in rows
        ]
        result.sort(key=lambda x: x["views"], reverse=True)
        return result
    except Exception as e:
        print(f"Traffic sources error: {e}")
        return None


def get_shares(credentials, channel_id):
    try:
        analytics = build("youtubeAnalytics", "v2", credentials=credentials)
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
        response = analytics.reports().query(
            ids=f"channel=={channel_id}",
            startDate=start_date,
            endDate=end_date,
            metrics="shares",
        ).execute()
        rows = response.get("rows", [])
        total = int(rows[0][0]) if rows else 0
        return {"total_shares": total}
    except Exception as e:
        print(f"Shares error: {e}")
        return None


def get_device_types(credentials, channel_id):
    try:
        analytics = build("youtubeAnalytics", "v2", credentials=credentials)
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
        response = analytics.reports().query(
            ids=f"channel=={channel_id}",
            startDate=start_date,
            endDate=end_date,
            metrics="views,estimatedMinutesWatched",
            dimensions="deviceType",
        ).execute()
        rows = response.get("rows", [])
        result = [
            {"device": r[0], "views": int(r[1]), "watch_minutes": int(r[2])}
            for r in rows
        ]
        result.sort(key=lambda x: x["views"], reverse=True)
        return result
    except Exception as e:
        print(f"Device types error: {e}")
        return None


def get_top_geographies(credentials, channel_id):
    try:
        analytics = build("youtubeAnalytics", "v2", credentials=credentials)
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
        response = analytics.reports().query(
            ids=f"channel=={channel_id}",
            startDate=start_date,
            endDate=end_date,
            metrics="views,estimatedMinutesWatched,subscribersGained",
            dimensions="country",
            sort="-views",
            maxResults=5,
        ).execute()
        rows = response.get("rows", [])
        return [
            {
                "country": r[0],
                "views": int(r[1]),
                "watch_minutes": int(r[2]),
                "subscribers_gained": int(r[3]),
            }
            for r in rows
        ]
    except Exception as e:
        print(f"Geographies error: {e}")
        return None


def get_demographics(credentials, channel_id):
    try:
        analytics = build("youtubeAnalytics", "v2", credentials=credentials)
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
        response = analytics.reports().query(
            ids=f"channel=={channel_id}",
            startDate=start_date,
            endDate=end_date,
            metrics="viewerPercentage",
            dimensions="ageGroup,gender",
        ).execute()
        rows = response.get("rows", [])
        if not rows:
            return []
        return [
            {"age_group": r[0], "gender": r[1], "viewer_percentage": round(float(r[2]), 2)}
            for r in rows
        ]
    except Exception as e:
        print(f"Demographics error: {e}")
        return []


def get_dislikes(credentials, channel_id):
    try:
        analytics = build("youtubeAnalytics", "v2", credentials=credentials)
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
        response = analytics.reports().query(
            ids=f"channel=={channel_id}",
            startDate=start_date,
            endDate=end_date,
            metrics="dislikes",
        ).execute()
        rows = response.get("rows", [])
        total = int(rows[0][0]) if rows else 0
        return {"total_dislikes": total}
    except Exception as e:
        print(f"Dislikes error: {e}")
        return None


def get_playlist_adds(credentials, channel_id):
    try:
        analytics = build("youtubeAnalytics", "v2", credentials=credentials)
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
        response = analytics.reports().query(
            ids=f"channel=={channel_id}",
            startDate=start_date,
            endDate=end_date,
            metrics="videosAddedToPlaylists",
        ).execute()
        rows = response.get("rows", [])
        total = int(rows[0][0]) if rows else 0
        return {"videos_added_to_playlists": total}
    except Exception as e:
        print(f"Playlist adds error: {e}")
        return None


def get_full_channel_data(credentials, channel_id):
    """Fetch all analytics data in parallel. Any key that fails returns None."""
    tasks = {
        "analytics":       lambda: get_analytics(credentials, channel_id),
        "video_analytics": lambda: get_video_analytics(credentials, channel_id),
        "traffic_sources": lambda: get_traffic_sources(credentials, channel_id),
        "shares":          lambda: get_shares(credentials, channel_id),
        "device_types":    lambda: get_device_types(credentials, channel_id),
        "geographies":     lambda: get_top_geographies(credentials, channel_id),
        "demographics":    lambda: get_demographics(credentials, channel_id),
        "dislikes":        lambda: get_dislikes(credentials, channel_id),
        "playlist_adds":   lambda: get_playlist_adds(credentials, channel_id),
    }

    result = {k: None for k in tasks}

    def run_task(key):
        try:
            return key, tasks[key]()
        except Exception as e:
            print(f"get_full_channel_data: {key} failed: {e}")
            return key, None

    with ThreadPoolExecutor(max_workers=9) as pool:
        futures = {pool.submit(run_task, k): k for k in tasks}
        for future in as_completed(futures):
            key, value = future.result()
            result[key] = value

    return result


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
