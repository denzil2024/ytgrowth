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

# Set DEV_BYPASS_GATE=true in Render env vars to skip the gate entirely.
# Remove that env var when you're ready to enforce limits again.
_BYPASS = os.environ.get("DEV_BYPASS_GATE", "").lower() in ("1", "true", "yes")


def check_and_deduct(channel_id: str, amount: int = 1) -> dict:
    """
    Check if the user has `amount` analyses remaining, deduct all of them
    atomically if so. Monthly bucket depletes first; pack_balance is the
    fallback. Free users have 5 lifetime analyses (monthly_allowance=5,
    no reset_date).

    Outliers charges 3 (videos + thumbnails + channels = 3 distinct reports);
    everything else charges the default 1.
    """
    amount = max(1, int(amount or 1))
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

        if total_available < amount:
            db.commit()
            msg = (
                f"You need {amount} credits for this action and only have "
                f"{total_available}. Top up or upgrade to continue."
            ) if amount > 1 else (
                "You've used all your analyses. Top up or upgrade to continue."
            )
            return {
                "allowed":      False,
                "message":      msg,
                "show_upgrade": True,
                "usage_pct":    100,
                "pack_balance": pack_balance,
                "warning":      False,
            }

        # Deduct `amount` — monthly first, then pack.
        take_monthly = min(monthly_remaining, amount)
        take_pack    = amount - take_monthly
        sub.monthly_used += take_monthly
        if take_pack > 0:
            sub.pack_balance = max(0, (sub.pack_balance or 0) - take_pack)

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


# ───────────────────────────────────────────────────────────────────────────
# Free-tier feature-level gate — separate from the credit pool above.
#
# Paid plans pay per call via check_and_deduct(). Free plans face feature-
# level access control: some features are fully off-limits, others allow a
# single run per monthly cycle (cycle = subscription.reset_date window).
# ───────────────────────────────────────────────────────────────────────────

# Features the free tier cannot access at all. Route returns 403 immediately.
FULLY_GATED_FEATURES = {"outliers", "seo", "video_optimize", "video_ideas_refresh"}

# Features the free tier can run exactly once per cycle. After the first
# successful run, the route returns 403 until reset_date moves forward.
ONE_RUN_FEATURES = {"thumbnail_score", "keywords", "competitors"}


def _apply_reset_if_overdue(db, sub):
    """Shared helper — rolls the subscription over if reset_date has passed."""
    now = datetime.datetime.now(datetime.timezone.utc)
    if sub.reset_date:
        reset = sub.reset_date
        if reset.tzinfo is None:
            reset = reset.replace(tzinfo=datetime.timezone.utc)
        if now >= reset:
            sub.monthly_used = 0
            sub.reset_date = next_reset_date(reset)
            db.commit()
    return now


def check_free_tier_access(channel_id: str, feature: str) -> dict:
    """
    Feature-level access control. Call this BEFORE any credit deduction.

    Returns:
      {"allowed": True}
        — paid plan, or first run of a one-run feature this cycle
        — side-effect for one-run features: records usage in
          FreeTierFeatureUsage so subsequent calls return "used"
      {"allowed": False, "reason": "locked",   "feature": ...}
        — feature is fully gated on free tier
      {"allowed": False, "reason": "used",     "feature": ...}
        — one-run feature already used this cycle
    """
    if _BYPASS:
        return {"allowed": True}

    db = SessionLocal()
    try:
        from database.models import FreeTierFeatureUsage
        sub = get_or_create_subscription(db, channel_id)

        # Paid plans: not feature-gated (they pay via credits).
        if (sub.plan or "free") != "free":
            return {"allowed": True}

        _apply_reset_if_overdue(db, sub)
        cycle_reset = sub.reset_date

        if feature in FULLY_GATED_FEATURES:
            return {"allowed": False, "reason": "locked", "feature": feature}

        if feature in ONE_RUN_FEATURES:
            existing = (
                db.query(FreeTierFeatureUsage)
                  .filter(
                      FreeTierFeatureUsage.channel_id == channel_id,
                      FreeTierFeatureUsage.feature == feature,
                      FreeTierFeatureUsage.cycle_reset == cycle_reset,
                  )
                  .first()
            )
            if existing:
                return {"allowed": False, "reason": "used", "feature": feature}

            # Record the one-shot usage atomically with the allow.
            db.add(FreeTierFeatureUsage(
                channel_id=channel_id,
                feature=feature,
                cycle_reset=cycle_reset,
                used_at=datetime.datetime.now(datetime.timezone.utc),
            ))
            db.commit()
            return {"allowed": True}

        # Unknown feature id — default open so misuse of this helper can't
        # accidentally block unrelated endpoints.
        return {"allowed": True}

    except Exception as e:
        db.rollback()
        print(f"[analysis_gate] Free-tier check error for {channel_id}/{feature}: {e}")
        # Fail open — don't block paying users on a DB hiccup
        return {"allowed": True}
    finally:
        db.close()


def peek_free_tier_access(channel_id: str, feature: str) -> dict:
    """Read-only variant of check_free_tier_access — does NOT record usage.
    Used for frontend status checks (e.g., /api/auth/me) so loading the
    page doesn't burn a free run."""
    if _BYPASS:
        return {"allowed": True}

    db = SessionLocal()
    try:
        from database.models import FreeTierFeatureUsage
        sub = get_or_create_subscription(db, channel_id)

        if (sub.plan or "free") != "free":
            return {"allowed": True}

        _apply_reset_if_overdue(db, sub)
        cycle_reset = sub.reset_date

        if feature in FULLY_GATED_FEATURES:
            return {"allowed": False, "reason": "locked", "feature": feature}

        if feature in ONE_RUN_FEATURES:
            existing = (
                db.query(FreeTierFeatureUsage)
                  .filter(
                      FreeTierFeatureUsage.channel_id == channel_id,
                      FreeTierFeatureUsage.feature == feature,
                      FreeTierFeatureUsage.cycle_reset == cycle_reset,
                  )
                  .first()
            )
            if existing:
                return {"allowed": False, "reason": "used", "feature": feature}
            return {"allowed": True}

        return {"allowed": True}

    except Exception as e:
        print(f"[analysis_gate] Free-tier peek error for {channel_id}/{feature}: {e}")
        return {"allowed": True}
    finally:
        db.close()


def refund_credit(channel_id: str, amount: int = 1) -> None:
    """
    Refund `amount` credits that were deducted by check_and_deduct().
    Call this in exception handlers when the downstream work fails after the
    credit was spent. Monthly allowance is restored first; pack_balance is
    the fallback.
    """
    amount = max(1, int(amount or 1))
    if _BYPASS:
        return

    db = SessionLocal()
    try:
        sub = get_or_create_subscription(db, channel_id)
        # Reverse the deduction in the same order check_and_deduct uses:
        # monthly first (since it depleted monthly first), then pack.
        give_back_monthly = min(amount, sub.monthly_used or 0)
        sub.monthly_used = (sub.monthly_used or 0) - give_back_monthly
        remainder = amount - give_back_monthly
        if remainder > 0:
            sub.pack_balance = (sub.pack_balance or 0) + remainder
        db.commit()
        print(f"[analysis_gate] Refunded {amount} credit(s) to {channel_id}")
    except Exception as e:
        db.rollback()
        print(f"[analysis_gate] Refund failed for {channel_id}: {e}")
    finally:
        db.close()
