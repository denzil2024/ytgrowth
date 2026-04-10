"""
Lemon Squeezy billing integration:
- POST /billing/webhook  — receives all Lemon Squeezy events
- GET  /billing/usage    — returns current user's usage for the frontend bar
- GET  /billing/checkout — returns checkout URL for a given plan key
"""
import os
import json
import hmac
import hashlib
import datetime
from urllib.parse import urlencode
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from database.models import SessionLocal, UserSubscription
from routers.auth import get_session
from app.utils import get_or_create_subscription, next_reset_date

router = APIRouter()

LEMONSQUEEZY_WEBHOOK_SECRET = os.environ.get("LEMONSQUEEZY_WEBHOOK_SECRET", "")

# ── Checkout URLs (one per plan key) ──────────────────────────────────────────
CHECKOUT_URLS = {
    "solo_monthly":      "https://ytgrowth.lemonsqueezy.com/checkout/buy/b34685bc-1e51-4f09-81b5-d5127a300490",
    "growth_monthly":    "https://ytgrowth.lemonsqueezy.com/checkout/buy/7f75e5fa-3b21-411d-93dc-8d555a545a8a",
    "agency_monthly":    "https://ytgrowth.lemonsqueezy.com/checkout/buy/d2b3e221-a8d0-487d-99b6-55f326c9fe9a",
    "solo_annual":       "https://ytgrowth.lemonsqueezy.com/checkout/buy/2d908705-93ba-4963-9b64-24c45c63b0d6",
    "growth_annual":     "https://ytgrowth.lemonsqueezy.com/checkout/buy/d4bd5aeb-7da1-49e7-ace8-8c5b863976ab",
    "agency_annual":     "https://ytgrowth.lemonsqueezy.com/checkout/buy/c289111d-5eb6-4fb2-a70e-f55a90a060d7",
    "solo_lifetime":     "https://ytgrowth.lemonsqueezy.com/checkout/buy/c90f0ef7-f211-480d-a5b7-c8359cffc1fd",
    "growth_lifetime":   "https://ytgrowth.lemonsqueezy.com/checkout/buy/9b3164f2-1e2c-4066-8b41-b2578fde0e2f",
    "agency_lifetime":   "https://ytgrowth.lemonsqueezy.com/checkout/buy/762fbb9b-ed40-4a97-a8ad-6dc910d55b30",
    "founder_solo":      "https://ytgrowth.lemonsqueezy.com/checkout/buy/812d4111-bed2-487f-843a-feafa34e35b9",
    "founder_growth":    "https://ytgrowth.lemonsqueezy.com/checkout/buy/de034dc7-56de-4bc0-8dea-7c949d413b05",
    "founder_agency":    "https://ytgrowth.lemonsqueezy.com/checkout/buy/4fd5b7ed-496e-4f32-b026-e5c02c48edf2",
    "pack_20":           "https://ytgrowth.lemonsqueezy.com/checkout/buy/d6c55c21-1531-4a3e-802c-b92c9d6438dc",
    "pack_60":           "https://ytgrowth.lemonsqueezy.com/checkout/buy/d825eb5e-32bb-49cb-ab53-76949d75e30e",
    "pack_150":          "https://ytgrowth.lemonsqueezy.com/checkout/buy/111d682a-f3d1-404a-92af-1ac76f629e1a",
}

# ── Variant UUID → plan metadata ──────────────────────────────────────────────
VARIANT_META = {
    "b34685bc-1e51-4f09-81b5-d5127a300490": {"plan": "solo",           "billing": "monthly",  "analyses": 30,  "channels": 3,  "is_lifetime": False, "bonus": 0},
    "7f75e5fa-3b21-411d-93dc-8d555a545a8a": {"plan": "growth",         "billing": "monthly",  "analyses": 75,  "channels": 5,  "is_lifetime": False, "bonus": 0},
    "d2b3e221-a8d0-487d-99b6-55f326c9fe9a": {"plan": "agency",         "billing": "monthly",  "analyses": 250, "channels": 10, "is_lifetime": False, "bonus": 0},
    "2d908705-93ba-4963-9b64-24c45c63b0d6": {"plan": "solo",           "billing": "annual",   "analyses": 30,  "channels": 3,  "is_lifetime": False, "bonus": 0},
    "d4bd5aeb-7da1-49e7-ace8-8c5b863976ab": {"plan": "growth",         "billing": "annual",   "analyses": 75,  "channels": 5,  "is_lifetime": False, "bonus": 0},
    "c289111d-5eb6-4fb2-a70e-f55a90a060d7": {"plan": "agency",         "billing": "annual",   "analyses": 250, "channels": 10, "is_lifetime": False, "bonus": 0},
    "c90f0ef7-f211-480d-a5b7-c8359cffc1fd": {"plan": "lifetime_solo",  "billing": "lifetime", "analyses": 30,  "channels": 3,  "is_lifetime": True,  "bonus": 0},
    "9b3164f2-1e2c-4066-8b41-b2578fde0e2f": {"plan": "lifetime_growth","billing": "lifetime", "analyses": 75,  "channels": 5,  "is_lifetime": True,  "bonus": 0},
    "762fbb9b-ed40-4a97-a8ad-6dc910d55b30": {"plan": "lifetime_agency","billing": "lifetime", "analyses": 250, "channels": 10, "is_lifetime": True,  "bonus": 0},
    "812d4111-bed2-487f-843a-feafa34e35b9": {"plan": "lifetime_solo",  "billing": "lifetime", "analyses": 30,  "channels": 3,  "is_lifetime": True,  "bonus": 60},
    "de034dc7-56de-4bc0-8dea-7c949d413b05": {"plan": "lifetime_growth","billing": "lifetime", "analyses": 75,  "channels": 5,  "is_lifetime": True,  "bonus": 75},
    "4fd5b7ed-496e-4f32-b026-e5c02c48edf2": {"plan": "lifetime_agency","billing": "lifetime", "analyses": 250, "channels": 10, "is_lifetime": True,  "bonus": 150},
    "d6c55c21-1531-4a3e-802c-b92c9d6438dc": {"plan": "pack",           "billing": "one-time", "analyses": 20,  "channels": 1,  "is_lifetime": False, "bonus": 0},
    "d825eb5e-32bb-49cb-ab53-76949d75e30e": {"plan": "pack",           "billing": "one-time", "analyses": 60,  "channels": 1,  "is_lifetime": False, "bonus": 0},
    "111d682a-f3d1-404a-92af-1ac76f629e1a": {"plan": "pack",           "billing": "one-time", "analyses": 150, "channels": 1,  "is_lifetime": False, "bonus": 0},
}


def _verify_signature(raw_body: bytes, signature_header: str) -> bool:
    """Verify Lemon Squeezy webhook signature (plain HMAC-SHA256 of raw body, X-Signature header)."""
    if not LEMONSQUEEZY_WEBHOOK_SECRET or not signature_header:
        return False
    try:
        expected = hmac.new(
            LEMONSQUEEZY_WEBHOOK_SECRET.encode("utf-8"),
            raw_body,
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected, signature_header)
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
    sub.lemonsqueezy_customer_id = customer_id

    if subscription_id:
        sub.lemonsqueezy_subscription_id = subscription_id

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
async def lemonsqueezy_webhook(request: Request):
    raw_body   = await request.body()
    sig_header = request.headers.get("X-Signature", "")

    if LEMONSQUEEZY_WEBHOOK_SECRET and not _verify_signature(raw_body, sig_header):
        return JSONResponse({"error": "Invalid signature"}, status_code=401)

    try:
        payload = json.loads(raw_body)
    except Exception:
        return JSONResponse({"error": "Bad JSON"}, status_code=400)

    meta_block  = payload.get("meta", {})
    event_type  = meta_block.get("event_name", "")
    custom      = meta_block.get("custom_data") or {}
    data        = payload.get("data", {})
    attrs       = data.get("attributes", {})
    sub_id      = str(data.get("id", ""))
    customer_id = str(attrs.get("customer_id", ""))
    channel_id  = custom.get("channel_id", "") or custom.get("user_id", "")
    email       = custom.get("email", "") or attrs.get("user_email", "")

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

    def meta_from_variant(attrs: dict) -> dict | None:
        # LS sends variant_uuid in attributes; fall back to checking variant_id as str
        variant_uuid = attrs.get("variant_uuid") or str(attrs.get("variant_id", ""))
        if variant_uuid in VARIANT_META:
            return VARIANT_META[variant_uuid]
        # For orders: check first_order_item
        item = attrs.get("first_order_item") or {}
        variant_uuid = item.get("variant_uuid") or str(item.get("variant_id", ""))
        return VARIANT_META.get(variant_uuid)

    db = SessionLocal()
    try:
        if event_type == "order_created":
            # One-time purchases: packs and lifetime plans
            meta = meta_from_custom(custom) or meta_from_variant(attrs)
            if not meta or not channel_id:
                print(f"[webhook] order_created — missing meta or channel_id. custom={custom}")
                return JSONResponse({"ok": True})

            sub = get_or_create_subscription(db, channel_id, email)
            _activate(sub, meta, customer_id, sub_id)
            db.commit()
            print(f"[webhook] order_created: activated {meta['plan']} for channel {channel_id}")

        elif event_type == "subscription_created":
            meta = meta_from_custom(custom) or meta_from_variant(attrs)
            if meta and channel_id:
                sub = get_or_create_subscription(db, channel_id, email)
                _activate(sub, meta, customer_id, sub_id)
                db.commit()
                print(f"[webhook] subscription_created: activated {meta['plan']} for channel {channel_id}")

        elif event_type in ("subscription_updated", "subscription_plan_changed"):
            meta = meta_from_custom(custom) or meta_from_variant(attrs)
            if meta and channel_id:
                sub = get_or_create_subscription(db, channel_id, email)
                sub.monthly_allowance = meta["analyses"]
                sub.plan              = meta["plan"]
                sub.channels_allowed  = meta["channels"]
                db.commit()
                print(f"[webhook] {event_type}: updated plan to {meta['plan']} for channel {channel_id}")

        elif event_type == "subscription_cancelled":
            if channel_id:
                sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
                if sub:
                    sub.status = "canceled"
                    db.commit()
                    print(f"[webhook] subscription_cancelled for channel {channel_id}")

        elif event_type == "subscription_expired":
            if channel_id:
                sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
                if sub:
                    sub.plan              = "free"
                    sub.billing_cycle     = "none"
                    sub.status            = "free"
                    sub.monthly_allowance = 5
                    sub.monthly_used      = 0
                    sub.is_lifetime       = False
                    sub.reset_date        = None
                    db.commit()
                    print(f"[webhook] subscription_expired: downgraded to free for channel {channel_id}")

        elif event_type == "subscription_payment_failed":
            if channel_id:
                sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
                if sub:
                    sub.status = "past_due"
                    db.commit()
                    print(f"[webhook] subscription_payment_failed for channel {channel_id}")

        elif event_type == "subscription_resumed":
            if channel_id:
                sub = db.query(UserSubscription).filter_by(channel_id=channel_id).first()
                if sub:
                    sub.status = "active"
                    db.commit()
                    print(f"[webhook] subscription_resumed for channel {channel_id}")

    except Exception as e:
        db.rollback()
        print(f"[webhook] Error processing {event_type}: {e}")
        import traceback; traceback.print_exc()
        return JSONResponse({"error": "Internal error"}, status_code=500)
    finally:
        db.close()

    return JSONResponse({"ok": True})


# ── Checkout URL endpoint ──────────────────────────────────────────────────────

@router.get("/checkout")
def get_checkout(plan: str, request: Request):
    session_id = request.session.get("session_id")
    user_data, _ = get_session(session_id)
    if not user_data:
        return JSONResponse({"error": "Not authenticated"}, status_code=401)

    base_url = CHECKOUT_URLS.get(plan)
    if not base_url:
        return JSONResponse({"error": "Unknown plan"}, status_code=400)

    channel_id = user_data.get("channel", {}).get("channel_id", "")
    email      = user_data.get("channel", {}).get("email", "")

    params = {}
    if channel_id:
        params["checkout[custom][channel_id]"] = channel_id
    if email:
        params["checkout[custom][email]"] = email
        params["checkout[email]"]         = email
    url = f"{base_url}?{urlencode(params)}" if params else base_url
    return JSONResponse({"url": url})


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
