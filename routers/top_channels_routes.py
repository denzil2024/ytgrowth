"""
Public read endpoint for the top-channels cache. Cache is populated by
app/scheduler.py running app/top_channels.refresh_all() once a week.
First-hit fallback: if the cache is empty (fresh deploy, cron hasn't
fired yet), trigger a synchronous refresh inline so the user sees real
channels on the first request instead of an empty section. The inline
fallback is gated by YT_QUOTA_PAUSED so we can hard-stop quota burn
during constrained periods (e.g. while a quota extension is pending).
"""

import os

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.top_channels import fetch_grouped, refresh_all, TOP_CHANNELS_SEED, REGIONS

router = APIRouter()


@router.get("/api/top-channels")
def get_top_channels(region: str = "global"):
    """Returns top channels grouped by category, optionally filtered to a
    specific region (regionCode that the underlying YouTube search.list
    was run against — 'global', 'US', 'GB', 'CA', 'AU', 'IN'). Defaults
    to 'global' so existing callers (the main hub) get unchanged data.

    Returns:
    {
      categories:  ['gaming', 'tech', ...],
      region:      'global' | 'US' | 'GB' | ...,
      region_name: 'Global' | 'United States' | ...,
      groups: { 'gaming': [ { channel_id, title, handle, thumbnail,
                              country, subscribers, total_views,
                              video_count, rank }, ... ], ... },
      fetched_at: ISO timestamp of the latest cache row, or null if
                  the cache is empty AND inline refresh failed (e.g.
                  YOUTUBE_API_KEY missing in env).
    }
    """
    # Reject unknown regions rather than silently returning empty data.
    if region not in REGIONS:
        return JSONResponse({"error": f"unknown region: {region}", "valid": list(REGIONS.keys())}, status_code=400)

    # Return up to 50 per category (the actual TOP_N cached). The frontend
    # slices to whatever it needs to show (15 on the hub, 50 on drilldowns).
    data = fetch_grouped(region=region, top_n=50)
    if not data.get('groups'):
        if os.getenv("YT_QUOTA_PAUSED", "0").strip() == "1":
            print(f"[top_channels] inline refresh skipped (region={region}) — YT_QUOTA_PAUSED=1, 0 quota spent")
        else:
            # Cache empty for this region — populate inline so first hit
            # shows real data. Slow (5-10s per region) but only on the very
            # first call; subsequent calls hit the cache instantly.
            try:
                result = refresh_all(regions=[region])
                # Honest log: distinguish "actually fired" from "no-op exit"
                # (no API key / quota paused / etc) so the terminal doesn't
                # falsely imply quota was spent on every empty-cache hit.
                if isinstance(result, dict) and result.get("ok") is False:
                    reason = result.get("reason", "unknown")
                    print(f"[top_channels] inline refresh no-op (region={region}, reason={reason}, 0 quota spent)")
                else:
                    print(f"[top_channels] inline refresh fired (region={region}): {result}")
            except Exception as e:
                print(f"[top_channels] inline refresh failed (region={region}): {e}")
            data = fetch_grouped(region=region, top_n=50)
    return JSONResponse(data)


@router.get("/admin/top-channels-debug")
def debug_top_channels(request: Request):
    """Admin-only diagnostic. Confirms env, lists seed config, runs a
    fresh refresh, and reports exactly which handles resolved vs failed.
    Use to debug why the cache might be empty in production."""
    # Reuse the existing admin gate from admin_routes
    from routers.admin_routes import _is_admin
    is_admin, _email = _is_admin(request)
    if not is_admin:
        return JSONResponse({"error": "admin only"}, status_code=403)

    api_key_set = bool(os.getenv("YOUTUBE_API_KEY"))
    seed_total  = sum(len(v) for v in TOP_CHANNELS_SEED.values())

    refresh_result = None
    if api_key_set:
        refresh_result = refresh_all()

    cache = fetch_grouped()
    cache_total = sum(len(v) for v in (cache.get("groups") or {}).values())

    return JSONResponse({
        "youtube_api_key_set": api_key_set,
        "seed_categories":     list(TOP_CHANNELS_SEED.keys()),
        "seed_total_handles":  seed_total,
        "cache_total_rows":    cache_total,
        "cache_fetched_at":    cache.get("fetched_at"),
        "refresh_result":      refresh_result,
    })
