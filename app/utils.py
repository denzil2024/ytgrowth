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


def build_youtube_client(credentials):
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
        # Free plan defaults: 3 analyses per month, first reset 30 days out.
        sub = UserSubscription(
            channel_id = channel_id,
            email      = email,
            reset_date = next_reset_date(),
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
