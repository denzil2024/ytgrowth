"""Milestone tier definitions + check-and-record logic.

Tiers are ordered ascending. A milestone is recorded once the channel's current
value >= the tier threshold. Each (channel_id, category, tier) is unique — we
never re-award the same tier.
"""

from database.models import SessionLocal, Milestone

TIERS = {
    "subs":        [100, 500, 1000, 5000, 10000, 50000, 100000, 1000000],
    "views":       [10000, 50000, 100000, 1000000, 10000000],
    "watch_hours": [100, 1000, 10000, 100000],
    "uploads":     [1, 10, 50, 100],
}

CATEGORY_LABELS = {
    "subs":        "subscribers",
    "views":       "total views",
    "watch_hours": "watch hours (90d)",
    "uploads":     "videos published",
}


def _current_values(stats: dict, videos: list, analytics: dict | None) -> dict:
    """Extract the current value per category from the shapes we already fetch."""
    subs  = int((stats or {}).get("subscribers") or 0)
    views = int((stats or {}).get("total_views") or 0)
    uploads = len(videos or [])
    watch_hours = 0
    if analytics and analytics.get("watch_minutes_90d") is not None:
        watch_hours = int(round(analytics["watch_minutes_90d"] / 60))
    return {
        "subs":        subs,
        "views":       views,
        "watch_hours": watch_hours,
        "uploads":     uploads,
    }


def check_and_record(channel_id: str, stats: dict, videos: list, analytics: dict | None = None) -> list[dict]:
    """Check all categories. Record any tier the channel just crossed. Returns list of newly unlocked."""
    if not channel_id:
        return []

    values = _current_values(stats or {}, videos or [], analytics)
    newly_unlocked: list[dict] = []

    db = SessionLocal()
    try:
        existing = {
            (m.category, m.tier)
            for m in db.query(Milestone).filter_by(channel_id=channel_id).all()
        }
        for category, tiers in TIERS.items():
            current = values.get(category, 0)
            for tier in tiers:
                if current >= tier and (category, tier) not in existing:
                    row = Milestone(channel_id=channel_id, category=category, tier=tier)
                    db.add(row)
                    newly_unlocked.append({"category": category, "tier": tier})
        if newly_unlocked:
            db.commit()
    except Exception as e:
        print(f"[milestones] record error: {e}")
        db.rollback()
    finally:
        db.close()

    return newly_unlocked


def get_state(channel_id: str, stats: dict, videos: list, analytics: dict | None = None) -> dict:
    """Return earned + upcoming state for the Overview badge shelf."""
    values = _current_values(stats or {}, videos or [], analytics)
    earned: list[dict] = []
    upcoming: list[dict] = []

    if channel_id:
        db = SessionLocal()
        try:
            rows = (
                db.query(Milestone)
                .filter_by(channel_id=channel_id)
                .order_by(Milestone.achieved_at.desc())
                .all()
            )
            earned = [
                {
                    "category":    r.category,
                    "tier":        r.tier,
                    "achieved_at": r.achieved_at.isoformat() if r.achieved_at else None,
                }
                for r in rows
            ]
        except Exception as e:
            print(f"[milestones] fetch error: {e}")
        finally:
            db.close()

    # Next upcoming tier per category — the smallest tier not yet crossed
    earned_set = {(e["category"], e["tier"]) for e in earned}
    for category, tiers in TIERS.items():
        current = values.get(category, 0)
        for tier in tiers:
            if (category, tier) not in earned_set and current < tier:
                upcoming.append({
                    "category": category,
                    "tier":     tier,
                    "current":  current,
                    "pct":      round(min(current / tier * 100, 100), 1) if tier else 0,
                })
                break  # one "next up" per category

    return {"earned": earned, "upcoming": upcoming, "values": values}
