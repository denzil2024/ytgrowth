"""
Public read endpoint for the top-channels cache. Cache is populated by
app/scheduler.py running app/top_channels.refresh_all() once a day.
First-hit fallback: if the cache is empty (fresh deploy, cron hasn't
fired yet), trigger a synchronous refresh inline so the user sees real
channels on the first request instead of an empty section.
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.top_channels import fetch_grouped, refresh_all

router = APIRouter()


@router.get("/api/top-channels")
def get_top_channels():
    """Returns:
    {
      categories: ['gaming', 'tech', ...],
      groups: { 'gaming': [ { channel_id, title, handle, thumbnail,
                              country, subscribers, total_views,
                              video_count, rank }, ... ], ... },
      fetched_at: ISO timestamp of the latest cache row, or null if
                  the cache is empty AND inline refresh failed (e.g.
                  YOUTUBE_API_KEY missing in env).
    }
    """
    data = fetch_grouped()
    if not data.get('groups'):
        # Cache empty — populate inline so first hit shows real data.
        # Slow (~5–10s) but only on the very first call after deploy;
        # subsequent calls hit the cache instantly.
        try:
            result = refresh_all()
            print(f"[top_channels] inline refresh on first hit: {result}")
        except Exception as e:
            print(f"[top_channels] inline refresh failed: {e}")
        data = fetch_grouped()
    return JSONResponse(data)
