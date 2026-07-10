/**
 * Paddle checkout helper.
 *
 * Paddle.js is no longer loaded eagerly via index.html. main.jsx exposes
 * window.__paddleReady() which lazy-loads the script on first user
 * interaction or after a short timeout, then resolves with the Paddle
 * global. Both helpers below await it before touching Paddle.
 *
 * initPaddleRetain(customerId), call once per authenticated page load
 * with the Paddle customer ID (ctm_...) so Retain can track the user.
 *
 * openCheckout(planKey), opens the Paddle overlay checkout.
 */

import { useState, useCallback } from 'react'
import { isChannelBrain } from './brandHost.js'

const PADDLE_TOKEN = 'live_2af860b645fca6f106c9d79f8d2'

// Paddle only approves checkout on ytgrowth.io. channelbrain.online (the
// dashboard brand) is deliberately NOT added to Paddle, so opening the
// overlay there is blocked by Paddle with a 403 ("Transaction checkout
// creation is blocked for this vendor"). When a checkout is initiated on
// channelbrain, we resolve the authed checkout data here and hand it off to
// ytgrowth.io to open the overlay on the approved domain.
const CHECKOUT_ORIGIN = 'https://ytgrowth.io'

// Recurring-subscription plan keys (NOT the one-time packs). Buying one of
// these while already subscribed would create a duplicate subscription, so
// openCheckout routes an existing subscriber to the Paddle portal instead.
const SUBSCRIPTION_PLANS = new Set([
  'solo_monthly', 'growth_monthly', 'agency_monthly',
  'solo_annual',  'growth_annual',  'agency_annual',
])

// Open the Paddle customer portal (change tier / update card / cancel).
// Returns true if the redirect was issued, false if the portal is unavailable
// so callers can fall back.
async function openBillingPortal() {
  try {
    const pr = await fetch('/billing/portal', { credentials: 'include' })
    const pd = await pr.json().catch(() => ({}))
    if (pr.ok && pd.url) { window.location.href = pd.url; return true }
  } catch (err) {
    console.error('[checkout] portal failed:', err)
  }
  return false
}

// main.jsx sets window.__paddleReady = loadPaddle. If for some reason
// it isn't there (e.g., during a unit test), fall back to a no-op promise
// so callers still resolve.
function ensurePaddle() {
  return window.__paddleReady ? window.__paddleReady() : Promise.resolve()
}

/**
 * Re-initialise Paddle with the logged-in customer's Paddle ID.
 * Call this once after /billing/usage resolves and returns a paddle_customer_id.
 * Safe to call multiple times, Paddle ignores repeat calls with the same ID.
 */
export async function initPaddleRetain(customerId) {
  if (!customerId) return
  await ensurePaddle()
  Paddle.Initialize({
    token: PADDLE_TOKEN,
    pwCustomer: { id: customerId },
  })
}

export async function openCheckout(planKey) {
  try {
    // Kick off Paddle load in parallel with the /billing/checkout fetch
    // so the user doesn't pay the script-load cost serially. By the time
    // the price_id comes back, Paddle is usually already ready.
    const paddleReady = ensurePaddle()

    const res = await fetch(`/billing/checkout?plan=${encodeURIComponent(planKey)}`, {
      credentials: 'include',
    })

    // Unauthenticated visitors hit pricing buttons too, without this branch
    // /billing/checkout returns 401 and the button silently does nothing,
    // which reads as "broken" (especially on mobile where there's no console).
    // Send them to log in; they can re-click the plan when they land back.
    if (res.status === 401) {
      try { sessionStorage.setItem('ytg_pending_plan', planKey) } catch {}
      window.location.href = '/auth/login'
      return
    }

    const data = await res.json()
    if (!data.price_id) {
      console.error('[checkout] No price_id returned:', data)
      return
    }

    // Never open a fresh subscription checkout for someone who already has an
    // active subscription — Paddle would create a SECOND subscription and
    // double-charge them. Route them to the portal to change tier instead.
    // (One-time packs are always fine to buy, subscribed or not.)
    if (SUBSCRIPTION_PLANS.has(planKey) && data.has_active_sub) {
      if (await openBillingPortal()) return
      window.location.href = `${CHECKOUT_ORIGIN}/?tab=subscription#pricing`
      return
    }

    // On channelbrain.online Paddle blocks the overlay (unapproved domain).
    // Hand the resolved checkout off to ytgrowth.io — it opens the overlay
    // there (see the receiver in main.jsx). The price + attribution ride in
    // the URL so ytgrowth.io needs no session of its own.
    if (isChannelBrain()) {
      const p = new URLSearchParams({
        pco:   '1',
        price: data.price_id,
        ch:    data.channel_id || '',
        em:    data.email      || '',
      })
      window.location.href = `${CHECKOUT_ORIGIN}/checkout?${p.toString()}`
      return
    }

    await paddleReady

    Paddle.Checkout.open({
      items: [{ priceId: data.price_id, quantity: 1 }],
      customData: {
        channel_id: data.channel_id || '',
        email:      data.email      || '',
      },
      customer: data.email ? { email: data.email } : undefined,
    })
  } catch (err) {
    console.error('[checkout] Failed to open checkout:', err)
  }
}

// One-click credit top-up. Packs are one-time and never create a subscription,
// so this is always safe to open directly in Paddle for any user.
export function startTopUp() {
  return openCheckout('pack_60')
}

// One-click plan upgrade, from anywhere in the dashboard. openCheckout guards
// existing subscribers into the Paddle portal (so we never create a duplicate
// subscription), which makes this safe for everyone: free / no-sub users get a
// Solo checkout, active subscribers are routed to the portal to change tier.
export function startUpgrade() {
  return openCheckout('solo_monthly')
}

// Hook that gives a button a shared "Opening…" busy state around startUpgrade /
// startTopUp, so the button never looks dead during the fetch-then-redirect
// gap. busy stays true until the promise settles (or the page navigates away).
export function useCheckoutAction() {
  const [busy, setBusy] = useState(false)
  const run = useCallback((fn) => {
    setBusy(true)
    Promise.resolve(fn()).finally(() => setBusy(false))
  }, [])
  return {
    busy,
    upgrade: useCallback(() => run(startUpgrade), [run]),
    topUp:   useCallback(() => run(startTopUp),   [run]),
  }
}
