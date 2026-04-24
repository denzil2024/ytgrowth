"""
Paddle billing integration:
- POST /billing/webhook  — receives all Paddle events
- GET  /billing/usage    — returns current user's usage for the frontend bar
"""
import os
import json
import hmac
import hashlib
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from database.models import SessionLocal, UserSubscription
from routers.auth import get_session
from app.utils import get_or_create_subscription, next_reset_date

router = APIRouter()

PADDLE_WEBHOOK_SECRET = os.environ.get("PADDLE_WEBHOOK_SECRET", "")

# ── Price ID → plan metadata ──────────────────────────────────────────────────
PRICE_META = {
    "pri_01kn91162qwft3tmwkenv19meq": {"plan": "solo",           "billing": "monthly",  "analyses": 20,  "channels": 3,  "is_lifetime": False, "bonus": 0},
    "pri_01kn91k73gfeet8frv28stk8cz": {"plan": "growth",         "billing": "monthly",  "analyses": 50,  "channels": 5,  "is_lifetime": False, "bonus": 0},
    "pri_01kn91n08h62e9hp29zm548qsw": {"plan": "agency",         "billing": "monthly",  "analyses": 150, "channels": 10, "is_lifetime": False, "bonus": 0},
    "pri_01kn926r754n8h11zm9p25svd8": {"plan": "solo",           "billing": "annual",   "analyses": 20,  "channels": 3,  "is_lifetime": False, "bonus": 0},
    "pri_01kn9297gcehrm86engxwp1r0h": {"plan": "growth",         "billing": "annual",   "analyses": 50,  "channels": 5,  "is_lifetime": False, "bonus": 0},
    "pri_01kn92b8fcnsb70t5bc0cf5hdq": {"plan": "agency",         "billing": "annual",   "analyses": 150, "channels": 10, "is_lifetime": False, "bonus": 0},
    "pri_01kn92xhxt481fzpk3n1xgark7": {"plan": "lifetime_solo",  "billing": "lifetime", "analyses": 20,  "channels": 3,  "is_lifetime": True,  "bonus": 0},
    "pri_01kn9300a6hwsgh1nean24959z": {"plan": "lifetime_growth", "billing": "lifetime", "analyses": 50,  "channels": 5,  "is_lifetime": True,  "bonus": 0},
    "pri_01kn9325rcaxcnk5s949nz3smh": {"plan": "lifetime_agency", "billing": "lifetime", "analyses": 150, "channels": 10, "is_lifetime": True,  "bonus": 0},
    "pri_01kn95zq1axgmvgsczmx5zqqer": {"plan": "lifetime_solo",  "billing": "lifetime", "analyses": 20,  "channels": 3,  "is_lifetime": True,  "bonus": 60},
    "pri_01kn9624a48c9y2sjnbj8g36f2": {"plan": "lifetime_growth", "billing": "lifetime", "analyses": 50,  "channels": 5,  "is_lifetime": True,  "bonus": 75},
    "pri_01kn965gbdb7vwfw3fx3pfqv45": {"plan": "lifetime_agency", "billing": "lifetime", "analyses": 150, "channels": 10, "is_lifetime": True,  "bonus": 150},
    "pri_01kn96mpe190we3mx5bjycn3mj": {"plan": "pack",           "billing": "one-time", "analyses": 20,  "channels": 1,  "is_lifetime": False, "bonus": 0},
    "pri_01kn96ppcz3jvd1n07f97ndbh8": {"plan": "pack",           "billing": "one-time", "analyses": 60,  "channels": 1,  "is_lifetime": False, "bonus": 0},
    "pri_01kn96r93fxz2chsfrzyezazqr": {"plan": "pack",           "billing": "one-time", "analyses": 150, "channels": 1,  "is_lifetime": False, "bonus": 0},
}


def _verify_signature(raw_body: bytes, signature_header: str) -> bool:
    """Verify Paddle webhook signature (HMAC-SHA256, Paddle-Signature header).

    Header format: ts=TIMESTAMP;h1=HASH
    Signed payload: "{ts}:{raw_body}"
    """
    if not PADDLE_WEBHOOK_SECRET or not signature_header:
        return False
    try:
        parts = dict(p.split("=", 1) for p in signature_header.split(";"))
        ts = parts.get("ts", "")
        h1 = parts.get("h1", "")
        if not ts or not h1:
            return False
        signed_payload = f"{ts}:{raw_body.decode()}"
        expected = hmac.new(
            PADDLE_WEBHOOK_SECRET.encode("utf-8"),
            signed_payload.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected, h1)
    except Exception:
        return False


def _activate(sub: UserSubscription, meta: dict, customer_id: str, subscription_id: str = None):
    """Apply plan metadata to a subscription row."""
    plan     = meta["plan"]
    billing  = meta["billing"]
    analyses = meta["analyses"]
    channels = meta["channels"]
    is_life  = meta["is_lifetime"]
    bonus    = meta["bonus"]

    sub.plan              = plan
    sub.billing_cycle     = billing
    sub.monthly_allowance = analyses
    sub.channels_allowed  = channels
    sub.is_lifetime       = is_life
    sub.status            = "active"
    sub.paddle_customer_id = customer_id

    if subscription_id:
        sub.paddle_subscription_id = subscription_id

    if billing in ("monthly", "annual", "lifetime"):
        # Reset the monthly counter and set next reset date
        sub.monthly_used = 0
        sub.reset_date   = next_reset_date()

    # Pack purchases just top up the balance
    if plan == "pack":
        sub.pack_balance = (sub.pack_balance or 0) + analyses
        sub.plan   = sub.plan if sub.plan != "free" else "free"  # keep existing plan
        sub.status = sub.status if sub.status != "free" else "free"

    # Founder bonus analyses
    if bonus > 0:
        sub.pack_balance = (sub.pack_balance or 0) + bonus


# ── Webhook handler ────────────────────────────────────────────────────────────

@router.post("/webhook")
async def paddle_webhook(request: Request):
    raw_body   = await request.body()
    sig_header = request.headers.get("Paddle-Signature", "")

    if PADDLE_WEBHOOK_SECRET and not _verify_signature(raw_body, sig_header):
        return JSONResponse({"error": "Invalid signature"}, status_code=401)

    try:
        payload = json.loads(raw_body)
    except Exception:
        return JSONResponse({"error": "Bad JSON"}, status_code=400)

    event_type  = payload.get("event_type", "")
    data        = payload.get("data", {})
    custom      = data.get("custom_data") or {}
    channel_id  = custom.get("channel_id", "")
    email       = custom.get("email", "")
    customer_id = str(data.get("customer_id", ""))

    def meta_from_price_id(attrs: dict) -> dict | None:
        items = attrs.get("items") or []
        if not items:
            return None
        price_id = (items[0].get("price") or {}).get("id", "")
        return PRICE_META.get(price_id)

    db = SessionLocal()
    try:
        if event_type == "transaction.completed":
            # One-time purchases and lifetime plans
            meta = meta_from_price_id(data)
            if not meta or not channel_id:
                print(f"[webhook] transaction.completed — missing meta or channel_id. custom={custom}")
                return JSONResponse({"ok": True})

            sub = get_or_create_subscription(db, channel_id, email)
            _activate(sub, meta, customer_id)
            db.commit()
            print(f"[webhook] transaction.completed: activated {meta['plan']} for channel {channel_id}")

        elif event_type == "subscription.activated":
            meta            = meta_from_price_id(data)
            subscription_id = str(data.get("id", ""))
            if meta and channel_id:
                sub = get_or_create_subscription(db, channel_id, email)
                _activate(sub, meta, customer_id, subscription_id)
                db.commit()
                print(f"[webhook] subscription.activated: activated {meta['plan']} for channel {channel_id}")

        elif event_type == "subscription.updated":
            meta            = meta_from_price_id(data)
            subscription_id = str(data.get("id", ""))
            if meta and channel_id:
                sub = get_or_create_subscription(db, channel_id, email)
                # Reset usage counter when upgrading to a higher allowance
                # so the user can immediately use their new limit
                if meta["analyses"] > (sub.monthly_allowance or 0):
                    sub.monthly_used  = 0
                    sub.reset_date    = next_reset_date()
                sub.monthly_allowance = meta["analyses"]
                sub.plan              = meta["plan"]
                sub.channels_allowed  = meta["channels"]
                db.commit()
                print(f"[webhook] subscription.updated: updated plan to {meta['plan']} for channel {channel_id}")

        elif event_type == "subscription.canceled":
            if channel_id:
                sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
                if sub:
                    sub.status = "canceled"
                    db.commit()
                    print(f"[webhook] subscription.canceled for channel {channel_id}")

        elif event_type == "subscription.past_due":
            if channel_id:
                sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
                if sub:
                    sub.status = "past_due"
                    db.commit()
                    print(f"[webhook] subscription.past_due for channel {channel_id}")

        elif event_type == "subscription.resumed":
            if channel_id:
                sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
                if sub:
                    sub.status = "active"
                    db.commit()
                    print(f"[webhook] subscription.resumed for channel {channel_id}")

    except Exception as e:
        db.rollback()
        print(f"[webhook] Error processing {event_type}: {e}")
        import traceback; traceback.print_exc()
        return JSONResponse({"error": "Internal error"}, status_code=500)
    finally:
        db.close()

    return JSONResponse({"ok": True})


# ── Checkout endpoint ─────────────────────────────────────────────────────────

PLAN_PRICE_MAP = {
    "solo_monthly":    "pri_01kn91162qwft3tmwkenv19meq",
    "growth_monthly":  "pri_01kn91k73gfeet8frv28stk8cz",
    "agency_monthly":  "pri_01kn91n08h62e9hp29zm548qsw",
    "solo_annual":     "pri_01kn926r754n8h11zm9p25svd8",
    "growth_annual":   "pri_01kn9297gcehrm86engxwp1r0h",
    "agency_annual":   "pri_01kn92b8fcnsb70t5bc0cf5hdq",
    "solo_lifetime":   "pri_01kn92xhxt481fzpk3n1xgark7",
    "growth_lifetime": "pri_01kn9300a6hwsgh1nean24959z",
    "agency_lifetime": "pri_01kn9325rcaxcnk5s949nz3smh",
    "founder_solo":    "pri_01kn95zq1axgmvgsczmx5zqqer",
    "founder_growth":  "pri_01kn9624a48c9y2sjnbj8g36f2",
    "founder_agency":  "pri_01kn965gbdb7vwfw3fx3pfqv45",
    "pack_20":         "pri_01kn96mpe190we3mx5bjycn3mj",
    "pack_60":         "pri_01kn96ppcz3jvd1n07f97ndbh8",
    "pack_150":        "pri_01kn96r93fxz2chsfrzyezazqr",
}


@router.get("/checkout")
def get_checkout(plan: str, request: Request):
    session_id = request.session.get("session_id")
    user_data, _ = get_session(session_id)
    if not user_data:
        return JSONResponse({"error": "Not authenticated"}, status_code=401)

    price_id = PLAN_PRICE_MAP.get(plan)
    if not price_id:
        return JSONResponse({"error": "Unknown plan"}, status_code=400)

    channel_id = user_data.get("channel", {}).get("channel_id", "")
    email      = user_data.get("channel", {}).get("email", "")

    return JSONResponse({"price_id": price_id, "channel_id": channel_id, "email": email})


# ── Usage endpoint (frontend reads this) ───────────────────────────────────────

@router.get("/usage")
def get_usage(request: Request):
    session_id = request.session.get("session_id")
    user_data, _ = get_session(session_id)
    if not user_data:
        return JSONResponse({"error": "Not authenticated"}, status_code=401)

    channel_id = user_data.get("channel", {}).get("channel_id", "")
    db = SessionLocal()
    try:
        sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
        if not sub:
            # First-time user — create free record
            sub = UserSubscription(channel_id=channel_id)
            email = user_data.get("channel", {}).get("email", "")
            if email:
                sub.email = email
            db.add(sub)
            db.commit()

        # Dev bypass — report a fresh free-tier state so testing isn't
        # blocked by stale DB values (e.g. stuck 5/5 from a prior tier).
        # Actual DB row is untouched; this only overrides the response.
        from app.analysis_gate import _BYPASS
        if _BYPASS:
            return JSONResponse({
                "plan":               sub.plan or "free",
                "status":             sub.status or "free",
                "billing_cycle":      sub.billing_cycle or "none",
                "is_lifetime":        False,
                "monthly_allowance":  3,
                "monthly_used":       0,
                "monthly_remaining":  3,
                "pack_balance":       0,
                "total_available":    3,
                "usage_pct":          0,
                "channels_allowed":   sub.channels_allowed or 1,
                "reset_date":         sub.reset_date.isoformat() if sub.reset_date else None,
                "paddle_customer_id": sub.paddle_customer_id or None,
            })

        monthly_remaining = max(0, sub.monthly_allowance - sub.monthly_used)
        total_available   = monthly_remaining + sub.pack_balance
        usage_pct = (
            round(sub.monthly_used / sub.monthly_allowance * 100)
            if sub.monthly_allowance > 0 else 100
        )

        return JSONResponse({
            "plan":               sub.plan,
            "status":             sub.status,
            "billing_cycle":      sub.billing_cycle,
            "is_lifetime":        sub.is_lifetime,
            "monthly_allowance":  sub.monthly_allowance,
            "monthly_used":       sub.monthly_used,
            "monthly_remaining":  monthly_remaining,
            "pack_balance":       sub.pack_balance,
            "total_available":    total_available,
            "usage_pct":          usage_pct,
            "channels_allowed":   sub.channels_allowed,
            "reset_date":         sub.reset_date.isoformat() if sub.reset_date else None,
            "paddle_customer_id": sub.paddle_customer_id or None,
        })
    finally:
        db.close()
