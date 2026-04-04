"""
Paddle billing integration:
- POST /billing/webhook  — receives all Paddle events
- GET  /billing/usage    — returns current user's usage for the frontend bar
- POST /billing/checkout — returns price_id for the frontend to open Paddle overlay
"""
import os
import json
import hmac
import hashlib
import datetime
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from database.models import SessionLocal, UserSubscription
from routers.auth import get_session
from app.utils import get_or_create_subscription, next_reset_date

router = APIRouter()

PADDLE_WEBHOOK_SECRET = os.environ.get("PADDLE_WEBHOOK_SECRET", "")

# ── Price ID → plan metadata ───────────────────────────────────────────────────
# Used only as a fallback if Paddle custom_data is missing.
PRICE_META = {
    "pri_01kn91162qwft3tmwkenv19meq": {"plan": "solo",   "billing": "monthly",  "analyses": 30,  "channels": 1,  "is_lifetime": False, "bonus": 0},
    "pri_01kn91k73gfeet8frv28stk8cz": {"plan": "growth",  "billing": "monthly",  "analyses": 75,  "channels": 1,  "is_lifetime": False, "bonus": 0},
    "pri_01kn91n08h62e9hp29zm548qsw": {"plan": "agency",  "billing": "monthly",  "analyses": 250, "channels": 10, "is_lifetime": False, "bonus": 0},
    "pri_01kn926r754n8h11zm9p25svd8": {"plan": "solo",   "billing": "annual",   "analyses": 30,  "channels": 1,  "is_lifetime": False, "bonus": 0},
    "pri_01kn9297gcehrm86engxwp1r0h": {"plan": "growth",  "billing": "annual",   "analyses": 75,  "channels": 1,  "is_lifetime": False, "bonus": 0},
    "pri_01kn92b8fcnsb70t5bc0cf5hdq": {"plan": "agency",  "billing": "annual",   "analyses": 250, "channels": 10, "is_lifetime": False, "bonus": 0},
    "pri_01kn92xhxt481fzpk3n1xgark7": {"plan": "lifetime_solo",   "billing": "lifetime", "analyses": 30,  "channels": 1, "is_lifetime": True, "bonus": 0},
    "pri_01kn9300a6hwsgh1nean24959z": {"plan": "lifetime_growth",  "billing": "lifetime", "analyses": 75,  "channels": 1, "is_lifetime": True, "bonus": 0},
    "pri_01kn9325rcaxcnk5s949nz3smh": {"plan": "lifetime_agency",  "billing": "lifetime", "analyses": 250, "channels": 5, "is_lifetime": True, "bonus": 0},
    "pri_01kn95zq1axgmvgsczmx5zqqer": {"plan": "lifetime_solo",   "billing": "lifetime", "analyses": 30,  "channels": 1, "is_lifetime": True, "bonus": 60},
    "pri_01kn9624a48c9y2sjnbj8g36f2": {"plan": "lifetime_growth",  "billing": "lifetime", "analyses": 75,  "channels": 1, "is_lifetime": True, "bonus": 75},
    "pri_01kn965gbdb7vwfw3fx3pfqv45": {"plan": "lifetime_agency",  "billing": "lifetime", "analyses": 250, "channels": 5, "is_lifetime": True, "bonus": 150},
    "pri_01kn96mpe190we3mx5bjycn3mj": {"plan": "pack", "billing": "one-time", "analyses": 20,  "channels": 1, "is_lifetime": False, "bonus": 0},
    "pri_01kn96ppcz3jvd1n07f97ndbh8": {"plan": "pack", "billing": "one-time", "analyses": 60,  "channels": 1, "is_lifetime": False, "bonus": 0},
    "pri_01kn96r93fxz2chsfrzyezazqr": {"plan": "pack", "billing": "one-time", "analyses": 150, "channels": 1, "is_lifetime": False, "bonus": 0},
}


def _verify_signature(raw_body: bytes, signature_header: str) -> bool:
    """Verify Paddle webhook signature (v1 HMAC-SHA256)."""
    if not PADDLE_WEBHOOK_SECRET or not signature_header:
        return False
    try:
        parts = {k: v for k, v in (p.split("=", 1) for p in signature_header.split(";"))}
        ts = parts.get("ts", "")
        h1 = parts.get("h1", "")
        signed = f"{ts}:{raw_body.decode('utf-8')}"
        expected = hmac.new(
            PADDLE_WEBHOOK_SECRET.encode("utf-8"),
            signed.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected, h1)
    except Exception:
        return False



def _activate(sub: UserSubscription, meta: dict, customer_id: str, subscription_id: str = None):
    """Apply plan metadata to a subscription row."""
    plan      = meta["plan"]
    billing   = meta["billing"]
    analyses  = meta["analyses"]
    channels  = meta["channels"]
    is_life   = meta["is_lifetime"]
    bonus     = meta["bonus"]

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
    raw_body = await request.body()
    sig_header = request.headers.get("Paddle-Signature", "")

    if PADDLE_WEBHOOK_SECRET and not _verify_signature(raw_body, sig_header):
        return JSONResponse({"error": "Invalid signature"}, status_code=401)

    try:
        payload = json.loads(raw_body)
    except Exception:
        return JSONResponse({"error": "Bad JSON"}, status_code=400)

    event_type = payload.get("event_type", "")
    data       = payload.get("data", {})
    custom     = data.get("custom_data") or {}
    customer   = data.get("customer", {})
    customer_id = data.get("customer_id") or customer.get("id", "")
    email       = customer.get("email", "") or custom.get("email", "")
    channel_id  = custom.get("channel_id", "") or custom.get("user_id", "")

    # Derive meta from custom_data first, fall back to price lookup
    def meta_from_custom(custom: dict) -> dict | None:
        if not custom.get("plan"):
            return None
        return {
            "plan":        custom.get("plan", "free"),
            "billing":     custom.get("billing", "one-time"),
            "analyses":    int(custom.get("analyses", 0)),
            "channels":    int(custom.get("channels", 1)),
            "is_lifetime": custom.get("billing") == "lifetime",
            "bonus":       int(custom.get("bonus_analyses", 0)),
        }

    def meta_from_price(data: dict) -> dict | None:
        items = data.get("items") or data.get("line_items") or []
        for item in items:
            price_id = item.get("price", {}).get("id") or item.get("price_id", "")
            if price_id in PRICE_META:
                return PRICE_META[price_id]
        return None

    db = SessionLocal()
    try:
        if event_type == "transaction.completed":
            meta = meta_from_custom(custom) or meta_from_price(data)
            if not meta or not channel_id:
                print(f"[webhook] transaction.completed — missing meta or channel_id. custom={custom}")
                return JSONResponse({"ok": True})

            sub_id = data.get("subscription_id")
            sub = get_or_create_subscription(db, channel_id, email)
            _activate(sub, meta, customer_id, sub_id)
            db.commit()
            print(f"[webhook] Activated {meta['plan']} for channel {channel_id}")

        elif event_type == "subscription.activated":
            sub_id = data.get("id")
            meta   = meta_from_custom(custom) or meta_from_price(data)
            if meta and channel_id:
                sub = get_or_create_subscription(db, channel_id, email)
                sub.paddle_subscription_id = sub_id
                sub.status = "active"
                db.commit()

        elif event_type == "subscription.updated":
            meta = meta_from_custom(custom) or meta_from_price(data)
            if meta and channel_id:
                sub = get_or_create_subscription(db, channel_id, email)
                sub.monthly_allowance = meta["analyses"]
                sub.plan              = meta["plan"]
                sub.channels_allowed  = meta["channels"]
                db.commit()

        elif event_type == "subscription.canceled":
            if channel_id:
                sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
                if sub:
                    sub.status = "canceled"
                    db.commit()

        elif event_type == "subscription.past_due":
            if channel_id:
                sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
                if sub:
                    sub.status = "past_due"
                    db.commit()

    except Exception as e:
        db.rollback()
        print(f"[webhook] Error processing {event_type}: {e}")
        import traceback; traceback.print_exc()
        return JSONResponse({"error": "Internal error"}, status_code=500)
    finally:
        db.close()

    return JSONResponse({"ok": True})


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

        monthly_remaining = max(0, sub.monthly_allowance - sub.monthly_used)
        total_available   = monthly_remaining + sub.pack_balance
        usage_pct = (
            round(sub.monthly_used / sub.monthly_allowance * 100)
            if sub.monthly_allowance > 0 else 100
        )

        return JSONResponse({
            "plan":              sub.plan,
            "status":            sub.status,
            "billing_cycle":     sub.billing_cycle,
            "is_lifetime":       sub.is_lifetime,
            "monthly_allowance": sub.monthly_allowance,
            "monthly_used":      sub.monthly_used,
            "monthly_remaining": monthly_remaining,
            "pack_balance":      sub.pack_balance,
            "total_available":   total_available,
            "usage_pct":         usage_pct,
            "channels_allowed":  sub.channels_allowed,
            "reset_date":        sub.reset_date.isoformat() if sub.reset_date else None,
        })
    finally:
        db.close()
