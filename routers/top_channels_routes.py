"""
Public read endpoint for the top-channels cache. Cache is populated by
app/scheduler.py running app/top_channels.refresh_all() once a day.
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.top_channels import fetch_grouped

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
                  the cache is empty (initial deploy, before the cron
                  has fired).
    }
    """
    return JSONResponse(fetch_grouped())
