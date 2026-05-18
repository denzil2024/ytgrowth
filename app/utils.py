"""
Shared utilities — imported by analysis_gate, billing, competitors, keywords.
"""
import os
import calendar
import datetime
import anthropic
from googleapiclient.discovery import build
from database.models import UserSubscription


def make_anthropic_client() -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))


def yt_quota_paused() -> bool:
    """Master kill-switch for YouTube Data API calls. Set YT_QUOTA_PAUSED=1
    in env to make search.list-heavy paths short-circuit instead of throwing
    403s when the daily 10K free quota is exhausted. Mirror of the check in
    app/scheduler.py — kept here so user-facing routers can import it
    without pulling in apscheduler."""
    return os.getenv("YT_QUOTA_PAUSED", "0").strip() == "1"


def cached_ai_output(function_name: str, inputs: dict, ttl_hours: int, fetch_fn):
    """Cross-user cache for Claude / Haiku outputs.

    Hashes (function_name + sorted JSON of `inputs`) into a stable key.
    If a row exists in ai_output_cache for that key and is fresher than
    `ttl_hours`, return its parsed output. Otherwise call `fetch_fn()`,
    persist the result, and return it.

    The first user fires the API call; every subsequent user feeding
    the same inputs reads the row at zero Anthropic cost. Failures in
    cache read/write degrade gracefully — we fall back to calling
    fetch_fn() and skipping persistence, so a cache outage never breaks
    a user-facing analysis.

    Inputs must be JSON-serialisable. Use only the FIELDS THAT AFFECT
    THE OUTPUT — including a user_id or channel_id would defeat the
    cross-user reuse.
    """
    import datetime as _dt
    import hashlib
    import json as _json
    from database.models import SessionLocal, AIOutputCache

    try:
        normalised = _json.dumps(inputs, sort_keys=True, default=str)
    except Exception:
        # If inputs aren't serialisable, bypass the cache entirely.
        return fetch_fn()
    digest = hashlib.sha256(
        (function_name + "|" + normalised).encode("utf-8")
    ).hexdigest()

    # Cache read
    db = SessionLocal()
    try:
        row = db.query(AIOutputCache).filter_by(input_hash=digest).first()
        if row and row.cached_at:
            cached_at = row.cached_at
            if cached_at.tzinfo is None:
                cached_at = cached_at.replace(tzinfo=_dt.timezone.utc)
            age_hours = (_dt.datetime.now(_dt.timezone.utc) - cached_at).total_seconds() / 3600
            if age_hours < ttl_hours:
                try:
                    output = _json.loads(row.output_json)
                    try:
                        row.hit_count = (row.hit_count or 0) + 1
                        db.commit()
                    except Exception:
                        try: db.rollback()
                        except Exception: pass
                    print(f"[ai_cache] HIT {function_name} (hits={row.hit_count}, age {age_hours:.1f}h)")
                    return output
                except Exception:
                    pass  # corrupt cache row, refetch
    except Exception as e:
        print(f"[ai_cache] read error: {e}")
    finally:
        db.close()

    # Cache miss → call Claude / Haiku / whichever the fetch_fn wraps
    output = fetch_fn()

    # Cache write — best-effort
    db = SessionLocal()
    try:
        now = _dt.datetime.now(_dt.timezone.utc)
        row = db.query(AIOutputCache).filter_by(input_hash=digest).first()
        payload = _json.dumps(output, default=str)
        if row:
            row.output_json   = payload
            row.cached_at     = now
            row.hit_count     = (row.hit_count or 0) + 1
            row.function_name = function_name
        else:
            db.add(AIOutputCache(
                input_hash=digest,
                function_name=function_name,
                output_json=payload,
                cached_at=now,
                hit_count=1,
            ))
        db.commit()
    except Exception as e:
        print(f"[ai_cache] write error: {e}")
        try: db.rollback()
        except Exception: pass
    finally:
        db.close()

    return output


def build_youtube_client(credentials=None):
    """YouTube Data API v3 client.

    Pass OAuth credentials for per-user calls that need write or analytics
    access. Pass None for read-only server-side jobs (e.g. weekly niche
    discovery, public leaderboards), in which case we fall back to the
    YOUTUBE_API_KEY env var. Public read endpoints (search, channels,
    videos, playlistItems with public playlists) work with either."""
    if credentials is None:
        api_key = os.environ.get("YOUTUBE_API_KEY", "")
        return build("youtube", "v3", developerKey=api_key)
    return build("youtube", "v3", credentials=credentials)


def next_reset_date(from_dt: datetime.datetime = None) -> datetime.datetime:
    """
    Advance a datetime by one calendar month, PRESERVING the original day
    (clamped to the target month's last day). Normalized to midnight UTC.

    Anniversary-based so credit resets line up with Paddle's billing cadence
    (same day each month). Examples:
      May 15  →  Jun 15
      Jan 31  →  Feb 28  (or Feb 29 in a leap year)
      Feb 28  →  Mar 28
      Dec 15  →  Jan 15 (of next year)

    Previously snapped to the 1st of the next month, which caused
    calendar-vs-billing drift for paid users (double-grants) and
    truncated-first-cycle unfairness for late-month free signups.
    """
    dt = from_dt or datetime.datetime.now(datetime.timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=datetime.timezone.utc)
    month = dt.month % 12 + 1
    year = dt.year + 1 if dt.month == 12 else dt.year
    _, last_day_of_target = calendar.monthrange(year, month)
    day = min(dt.day, last_day_of_target)
    return dt.replace(month=month, year=year, day=day, hour=0, minute=0, second=0, microsecond=0)


def get_or_create_subscription(db, channel_id: str, email: str = None) -> UserSubscription:
    sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
    if not sub:
        # Free plan = a 5-credit lifetime trial (2026-05-18). No monthly
        # refill, so reset_date stays NULL. monthly_allowance defaults to 5
        # at the column level. Paid activation (billing._activate) overrides
        # allowance / used / reset_date explicitly, so seeding free here is
        # safe for the upgrade path too.
        sub = UserSubscription(
            channel_id = channel_id,
            email      = email,
            reset_date = None,
        )
        db.add(sub)
        db.flush()
    elif email and not sub.email:
        sub.email = email
    return sub


def compute_like_rate(videos: list) -> float:
    total_likes = sum(v.get("likes", 0) for v in videos)
    total_views = sum(v.get("views", 0) for v in videos)
    return round(total_likes / total_views * 100, 2) if total_views > 0 else 0.0
