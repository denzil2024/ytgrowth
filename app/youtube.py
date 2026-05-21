import urllib.parse
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from googleapiclient.discovery import build
from datetime import datetime, timedelta


def get_channel_stats(credentials):
    youtube = build("youtube", "v3", credentials=credentials)
    # contentDetails gives us the uploads playlist ID for free — used by
    # get_recent_videos() to skip the 100-unit search.list call.
    request = youtube.channels().list(
        part="snippet,statistics,brandingSettings,contentDetails",
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
    content_details = channel.get("contentDetails", {})
    uploads_playlist_id = (content_details.get("relatedPlaylists") or {}).get("uploads", "")
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
        "uploads_playlist_id": uploads_playlist_id,
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


def get_recent_videos(credentials, max_results=20, uploads_playlist_id=None):
    """
    Fetch the user's most recent uploads. Uses playlistItems.list on the
    channel's uploads playlist (1 unit) instead of search.list with
    forMine=True (100 units). 99% quota reduction per login.

    `uploads_playlist_id` is returned by get_channel_stats(); pass it through
    to skip the extra channels.list lookup. If omitted we resolve it ourselves
    (still cheaper than search: 1 + 1 + 1 = 3 units vs. 101).
    """
    youtube = build("youtube", "v3", credentials=credentials)

    if not uploads_playlist_id:
        try:
            ch_resp = youtube.channels().list(
                part="contentDetails",
                mine=True,
            ).execute()
            items = ch_resp.get("items", [])
            if not items:
                return []
            uploads_playlist_id = (
                (items[0].get("contentDetails") or {})
                .get("relatedPlaylists", {})
                .get("uploads", "")
            )
        except Exception as e:
            print(f"[get_recent_videos] uploads playlist lookup failed: {e}")
            return []
    if not uploads_playlist_id:
        return []

    try:
        pl_resp = youtube.playlistItems().list(
            part="snippet",
            playlistId=uploads_playlist_id,
            maxResults=max_results,
        ).execute()
    except Exception as e:
        print(f"[get_recent_videos] playlistItems.list failed: {e}")
        return []

    video_ids = [
        (it.get("snippet") or {}).get("resourceId", {}).get("videoId", "")
        for it in pl_resp.get("items", [])
    ]
    video_ids = [v for v in video_ids if v]
    if not video_ids:
        return []

    stats_response = youtube.videos().list(
        part="statistics,contentDetails,snippet",
        id=",".join(video_ids),
    ).execute()

    videos = []
    for video in stats_response.get("items", []):
        s = video.get("statistics", {})
        snippet = video.get("snippet", {})
        duration = (video.get("contentDetails") or {}).get("duration", "PT0S")
        videos.append({
            "video_id": video["id"],
            "title": snippet.get("title", ""),
            "published_at": snippet.get("publishedAt", ""),
            "views": int(s.get("viewCount", 0)),
            "likes": int(s.get("likeCount", 0)),
            "comments": int(s.get("commentCount", 0)),
            "duration": duration,
            "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url", ""),
            "description": snippet.get("description", ""),
            "tags": snippet.get("tags", []) or [],
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

        # Per-day series for sparkline charts on the Feed. Trim to last
        # 28 days for hero tiles; full 90d available via *_90d totals.
        last28 = rows[-28:] if len(rows) > 28 else rows
        views_series = [int(r[1]) for r in last28]
        # Net subscribers per day (gained - lost). The Feed hero plots
        # the cumulative trend, not the raw daily delta.
        net_subs_daily = [int(r[5]) - int(r[6]) for r in last28]
        subs_cumulative = []
        running = 0
        for v in net_subs_daily:
            running += v
            subs_cumulative.append(running)

        return {
            "views_90d": int(total_views),
            "watch_minutes_90d": int(total_watch_minutes),
            "avg_view_duration_seconds": round(avg_view_duration),
            "avg_retention_percent": round(avg_retention, 1),
            "subscribers_gained_90d": int(subs_gained),
            "subscribers_lost_90d": int(subs_lost),
            "net_subscribers_90d": int(subs_gained - subs_lost),
            "views_series_28d": views_series,
            "subs_series_28d": subs_cumulative,
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


def get_related_traffic_source_videos(credentials, channel_id, days=14, max_results=15):
    """Per-source-video breakdown of who is sending the channel its traffic.

    Calls YouTube Analytics with insightTrafficSourceDetail filtered to
    RELATED_VIDEO (the "Suggested videos" surface). Returns a list of
    {source_video_id, views_to_you} sorted by views_to_you desc.

    Analytics API has its own quota (separate from the 10K Data API
    budget), so this call is free against our quota math.
    """
    try:
        analytics = build("youtubeAnalytics", "v2", credentials=credentials)
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        rows = []
        for filter_type in ("RELATED_VIDEO", "SUGGESTED_VIDEO"):
            try:
                resp = analytics.reports().query(
                    ids=f"channel=={channel_id}",
                    startDate=start_date,
                    endDate=end_date,
                    metrics="views",
                    dimensions="insightTrafficSourceDetail",
                    filters=f"insightTrafficSourceType=={filter_type}",
                    sort="-views",
                    maxResults=max_results,
                ).execute()
                rows.extend(resp.get("rows", []) or [])
            except Exception as inner:
                # SUGGESTED_VIDEO isn't always a valid filter value depending
                # on the channel's Analytics surface, so we accept partial
                # results instead of failing the whole call.
                print(f"[related-traffic] {filter_type} filter skipped: {inner}")
                continue

        # Merge by source video id, sum views across both filter types.
        merged: dict[str, int] = {}
        for r in rows:
            vid = (r[0] or "").strip()
            if not vid:
                continue
            merged[vid] = merged.get(vid, 0) + int(r[1] or 0)

        # Sort by views-to-you desc and clip to max_results
        ranked = sorted(merged.items(), key=lambda kv: kv[1], reverse=True)[:max_results]
        return [{"source_video_id": vid, "views_to_you": views} for vid, views in ranked]
    except Exception as e:
        print(f"Related traffic source videos error: {e}")
        return []


def get_unanswered_comments_for_video(credentials, channel_id, video_id, max_results=20):
    """Return the top-level comments on a video that the channel owner
    has NOT replied to. One commentThreads.list call (1 quota unit).

    A thread is "unanswered" when none of the replies in its `replies`
    field have authorChannelId.value == channel_id. For threads with many
    replies, the API only returns a subset in the inline `replies` array;
    we accept the risk of false-positive "unanswered" on those rare cases
    rather than spending more quota fetching every reply page.

    Returns a list of {comment_id, thread_id, text, author_name,
    author_image, published_at, like_count} sorted newest-first.
    """
    try:
        youtube = build("youtube", "v3", credentials=credentials)
        resp = youtube.commentThreads().list(
            part="snippet,replies",
            videoId=video_id,
            order="time",
            maxResults=max_results,
            textFormat="plainText",
        ).execute()
    except Exception as e:
        print(f"[unanswered-comments] commentThreads.list failed for {video_id}: {e}")
        return []

    out = []
    for thread in resp.get("items", []) or []:
        thread_id = thread.get("id", "")
        snippet   = (thread.get("snippet") or {})
        top       = (snippet.get("topLevelComment") or {})
        top_snip  = (top.get("snippet") or {})
        top_id    = top.get("id", "")
        text      = (top_snip.get("textDisplay") or top_snip.get("textOriginal") or "").strip()
        if not text or not top_id:
            continue

        # Skip if the top-level commenter IS the channel owner — that's
        # the creator posting a pinned comment, not someone to reply to.
        top_author_cid = ((top_snip.get("authorChannelId") or {}).get("value") or "")
        if top_author_cid == channel_id:
            continue

        # Has the channel owner replied? Walk the included replies and
        # match authorChannelId.value. We can't see all replies for very
        # active threads, but the included subset is plenty for the
        # picker's first-found heuristic.
        replies = ((thread.get("replies") or {}).get("comments") or [])
        owner_replied = False
        for r in replies:
            r_snip = (r.get("snippet") or {})
            r_cid  = ((r_snip.get("authorChannelId") or {}).get("value") or "")
            if r_cid == channel_id:
                owner_replied = True
                break
        if owner_replied:
            continue

        out.append({
            "comment_id":    top_id,
            "thread_id":     thread_id,
            "video_id":      video_id,
            "text":          text[:1000],
            "author_name":   (top_snip.get("authorDisplayName") or "").strip(),
            "author_image":  top_snip.get("authorProfileImageUrl") or "",
            "published_at":  top_snip.get("publishedAt") or "",
            "like_count":    int(top_snip.get("likeCount") or 0),
        })

    return out


def post_comment_reply(credentials, parent_id, reply_text):
    """Post a reply to a YouTube comment thread (or sub-comment).
    Returns (ok: bool, error: str). Costs 50 quota units when called,
    so wire this only behind explicit user action."""
    try:
        youtube = build("youtube", "v3", credentials=credentials)
        resp = youtube.comments().insert(
            part="snippet",
            body={
                "snippet": {
                    "parentId":     parent_id,
                    "textOriginal": reply_text,
                },
            },
        ).execute()
        return True, ""
    except Exception as e:
        err = str(e)
        print(f"[comment-reply] insert failed: {err}")
        return False, err


def get_top_search_terms(credentials, channel_id, days=28, max_results=10):
    """Top YouTube search queries that drove views to this channel in the
    last N days. Returns a list of {term, views} dicts sorted by views desc.

    Uses YouTube Analytics insightTrafficSourceDetail filtered to YT_SEARCH.
    Analytics API has its own quota separate from the 10K Data API budget,
    so this is free against the daily quota math. YouTube sometimes
    anonymises low-volume queries as "(Other)" or similar; we keep those
    out by skipping empty terms.
    """
    try:
        analytics = build("youtubeAnalytics", "v2", credentials=credentials)
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        resp = analytics.reports().query(
            ids=f"channel=={channel_id}",
            startDate=start_date,
            endDate=end_date,
            metrics="views",
            dimensions="insightTrafficSourceDetail",
            filters="insightTrafficSourceType==YT_SEARCH",
            sort="-views",
            maxResults=max_results,
        ).execute()
        out = []
        for r in resp.get("rows", []) or []:
            term  = (r[0] or "").strip()
            views = int(r[1] or 0)
            if not term or views <= 0:
                continue
            out.append({"term": term, "views": views})
        return out
    except Exception as e:
        print(f"[top-search-terms] error: {e}")
        return []


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
