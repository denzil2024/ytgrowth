"""
Analysis gate — call check_and_deduct() before every Claude API call.
Returns a dict with:
  allowed: bool
  warning: bool   (True when >= 80% of monthly allowance used)
  usage_pct: int
  pack_balance: int
  message: str    (only when allowed=False)
  show_upgrade: bool (only when allowed=False)
"""
import os
import datetime
from database.models import SessionLocal
from app.utils import get_or_create_subscription, next_reset_date

_BYPASS = os.environ.get("DEV_BYPASS_GATE", "").lower() in ("1", "true", "yes")


def check_and_deduct(channel_id: str) -> dict:
    """
    Check if the user has analyses remaining, deduct 1 if so.
    Monthly bucket depletes first; pack_balance is the fallback.
    Free users have 5 lifetime analyses (monthly_allowance=5, no reset_date).
    """
    if _BYPASS:
        return {"allowed": True, "warning": False, "usage_pct": 0, "pack_balance": 999}

    db = SessionLocal()
    try:
        sub = get_or_create_subscription(db, channel_id)

        # Auto-reset if reset_date has passed (for subscriptions & lifetime)
        now = datetime.datetime.now(datetime.timezone.utc)
        if sub.reset_date:
            reset = sub.reset_date
            if reset.tzinfo is None:
                reset = reset.replace(tzinfo=datetime.timezone.utc)
            if now >= reset:
                sub.monthly_used = 0
                sub.reset_date = next_reset_date(reset)

        monthly_remaining = max(0, sub.monthly_allowance - sub.monthly_used)
        pack_balance      = sub.pack_balance or 0
        total_available   = monthly_remaining + pack_balance

        if total_available <= 0:
            db.commit()
            return {
                "allowed":      False,
                "message":      "You've used all your analyses. Top up or upgrade to continue.",
                "show_upgrade": True,
                "usage_pct":    100,
                "pack_balance": pack_balance,
                "warning":      False,
            }

        # Deduct — monthly first, then pack
        if monthly_remaining > 0:
            sub.monthly_used += 1
        else:
            sub.pack_balance -= 1

        db.commit()

        # Recalculate after deduction
        usage_pct = (
            round(sub.monthly_used / sub.monthly_allowance * 100)
            if sub.monthly_allowance > 0 else 100
        )

        return {
            "allowed":      True,
            "warning":      usage_pct >= 80,
            "usage_pct":    usage_pct,
            "pack_balance": sub.pack_balance,
        }

    except Exception as e:
        db.rollback()
        print(f"[analysis_gate] Error for {channel_id}: {e}")
        # Fail open — don't block users on a DB error
        return {"allowed": True, "warning": False, "usage_pct": 0, "pack_balance": 0}
    finally:
        db.close()
