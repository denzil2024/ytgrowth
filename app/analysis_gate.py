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


def _resolve_billing_channel(db, channel_id: str) -> str:
    """
    Free-tier abuse guard: one Google account with N YouTube channels should
    share ONE credit bucket, not get 3 credits per channel.

    Returns the channel_id whose UserSubscription row actually owns this
    user's credits:
      - PAID plans → passthrough (the channel's own sub is the billing row,
        tied to Paddle).
      - FREE plans → the earliest-connected FREE channel_id for the same
        owner_email in ChannelRegistry becomes the canonical bucket. Every
        sibling free channel reads/writes to that one row.

    Falls back to the input channel_id whenever we can't resolve an
    owner_email (defensive — never escalate blocks due to missing data).
    """
    from database.models import ChannelRegistry, UserSubscription
    if not channel_id:
        return channel_id
    sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
    if sub and (sub.plan or "free").lower() != "free":
        return channel_id  # paid plan keeps its own billing row

    reg = (
        db.query(ChannelRegistry)
          .filter_by(channel_id=channel_id)
          .order_by(ChannelRegistry.id.asc())
          .first()
    )
    owner_email = (reg.owner_email if reg else None) or (sub.email if sub else None)
    if not owner_email:
        return channel_id

    earliest = (
        db.query(ChannelRegistry)
          .filter_by(owner_email=owner_email)
          .order_by(ChannelRegistry.id.asc())
          .first()
    )
    if not earliest or earliest.channel_id == channel_id:
        return channel_id

    canonical_sub = db.query(UserSubscription).filter_by(channel_id=earliest.channel_id).first()
    # Only route if the earliest sibling is also free — don't cross-charge
    # a free channel to a paid sibling's monthly bucket.
    if canonical_sub and (canonical_sub.plan or "free").lower() == "free":
        return earliest.channel_id
    return channel_id


def check_and_deduct(channel_id: str, amount: int = 1) -> dict:
    """
    Check if the user has `amount` analyses remaining, deduct all of them
    atomically if so. Monthly bucket depletes first; pack_balance is the
    fallback. Free users have 3 analyses per month, pooled across every
    channel on the same Google account (see _resolve_billing_channel).

    Outliers charges 3 (videos + thumbnails + channels = 3 distinct reports);
    everything else charges the default 1.
    """
    amount = max(1, int(amount or 1))
    if _BYPASS:
        return {"allowed": True, "warning": False, "usage_pct": 0, "pack_balance": 999}

    db = SessionLocal()
    try:
        billing_channel = _resolve_billing_channel(db, channel_id)
        sub = get_or_create_subscription(db, billing_channel)

        # Auto-reset if reset_date has passed — PAID plans only. Free plan is
        # a 5-credit lifetime trial with no refill (reset_date is NULL for
        # free rows post-2026-05-18). The plan guard is belt-and-suspenders
        # in case a legacy free row still carries a stale reset_date.
        now = datetime.datetime.now(datetime.timezone.utc)
        if sub.reset_date and (sub.plan or "free") != "free":
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

        # Stamp last_audit_at on the channel that was actually audited
        # (not the billing_channel, which may be a free-tier sibling
        # routing through this channel's bucket). Powers the admin
        # "Last audit" column + the Active · 7d stat.
        try:
            from database.models import ChannelRegistry
            reg = db.query(ChannelRegistry).filter_by(channel_id=channel_id).first()
            if reg:
                reg.last_audit_at = datetime.datetime.utcnow()
        except Exception as e:
            print(f"[analysis_gate] last_audit_at stamp failed for {channel_id}: {e}")

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

# Free trial model (2026-05-18):
#
# A free user gets a 5-credit lifetime pool (no monthly refill). Those
# credits can ONLY be spent on the three converter features below. Spending
# is enforced by check_and_deduct() in the route, NOT here — this gate only
# decides "is this feature reachable on the free plan at all". Outliers
# charges 3 of the 5, Competitors and SEO Studio charge 1 each.
TRIAL_FEATURES = {"outliers", "seo", "competitors"}

# Everything else is paid-only on the free plan. The route returns a
# locked response immediately, no credit touched. Channel Audit is NOT in
# either set — it is free, off-pool, and rate-limited separately in
# routers/auth.py (signup + manual button, max once / 7 days).
PAID_ONLY_FEATURES = {
    "keywords", "thumbnail_score", "autopsy",
    "video_optimize", "video_ideas_refresh",
}

# Back-compat aliases. Old callers / tests may still import these names.
# Under the new model every non-trial gated feature is simply paid-only;
# the per-cycle "one run" concept no longer exists.
FULLY_GATED_FEATURES = PAID_ONLY_FEATURES
ONE_RUN_FEATURES: set[str] = set()


def _apply_reset_if_overdue(db, sub):
    """Shared helper — rolls a PAID subscription over if reset_date passed.

    Free plan is a no-refill lifetime trial, so it is never reset here. The
    plan guard protects legacy free rows that may still carry a stale
    reset_date from before the 2026-05-18 model change.
    """
    now = datetime.datetime.now(datetime.timezone.utc)
    if sub.reset_date and (sub.plan or "free") != "free":
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

    New trial model (2026-05-18):
      {"allowed": True}
        — paid plan (pays via credits), OR
        — free plan + a TRIAL feature (the 5-credit pool is enforced by the
          route's subsequent check_and_deduct call, not here)
      {"allowed": False, "reason": "locked", "feature": ...}
        — free plan + a paid-only feature

    No side effects. The old FreeTierFeatureUsage one-run bookkeeping is
    gone: trial features are metered purely by the credit pool now.
    """
    if _BYPASS:
        return {"allowed": True}

    db = SessionLocal()
    try:
        # Pool free-tier state across all sibling channels on the same
        # Google account (see _resolve_billing_channel).
        billing_channel = _resolve_billing_channel(db, channel_id)
        sub = get_or_create_subscription(db, billing_channel)

        # Paid plans: not feature-gated (they pay via credits).
        if (sub.plan or "free") != "free":
            return {"allowed": True}

        # Free plan.
        if feature in TRIAL_FEATURES:
            # Reachable. The route's check_and_deduct() enforces the
            # 5-credit lifetime cap and charges (Outliers = 3, others = 1).
            return {"allowed": True}

        if feature in PAID_ONLY_FEATURES:
            return {"allowed": False, "reason": "locked", "feature": feature}

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
    page doesn't burn a free run.

    Honors DEV_BYPASS_GATE: while bypass is on, peek reports every feature
    as allowed so dev accounts (likely on the free plan) aren't blocked
    from clicking into paid features. To preview the gated UX, flip
    DEV_BYPASS_GATE off on Railway for 30 seconds, reload, then flip back.
    """
    if _BYPASS:
        return {"allowed": True}

    db = SessionLocal()
    try:
        billing_channel = _resolve_billing_channel(db, channel_id)
        sub = get_or_create_subscription(db, billing_channel)

        if (sub.plan or "free") != "free":
            return {"allowed": True}

        # Free plan. Mirror check_free_tier_access exactly, minus side
        # effects. Credit exhaustion is surfaced separately by the usage
        # bar / the 402 from check_and_deduct, not by this map.
        if feature in TRIAL_FEATURES:
            return {"allowed": True}

        if feature in PAID_ONLY_FEATURES:
            return {"allowed": False, "reason": "locked", "feature": feature}

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
        billing_channel = _resolve_billing_channel(db, channel_id)
        sub = get_or_create_subscription(db, billing_channel)
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
