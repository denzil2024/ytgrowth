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

// Next tier up from the user's current plan, used by startUpgrade().
const NEXT_PLAN = {
  free:   'solo_monthly',
  solo:   'growth_monthly',
  growth: 'agency_monthly',
  agency: 'agency_monthly',
}

// One-click credit top-up. Packs are one-time and never create a subscription,
// so this is always safe to open directly in Paddle for any user.
export function startTopUp() {
  return openCheckout('pack_60')
}

// One-click plan upgrade, from anywhere in the dashboard. Critical billing
// safety: a user who ALREADY has an active subscription must NOT get a fresh
// checkout (that would create a second subscription and double-charge them),
// so we send them to the Paddle portal to change tier. Free / no-subscription
// users get a direct checkout for the next tier up.
export async function startUpgrade() {
  try {
    const r = await fetch('/billing/usage', { credentials: 'include' })
    if (r.status === 401) {
      try { sessionStorage.setItem('ytg_pending_plan', 'solo_monthly') } catch {}
      window.location.href = '/auth/login'
      return
    }
    const u = await r.json().catch(() => ({}))
    const hasActiveSub = u.status === 'active' && !u.is_lifetime
    if (hasActiveSub) {
      const pr = await fetch('/billing/portal', { credentials: 'include' })
      const pd = await pr.json().catch(() => ({}))
      if (pr.ok && pd.url) { window.location.href = pd.url; return }
      // Portal unavailable → fall back to the pricing page on the approved domain.
      window.location.href = `${CHECKOUT_ORIGIN}/?tab=subscription#pricing`
      return
    }
    return openCheckout(NEXT_PLAN[u.plan] || 'solo_monthly')
  } catch (err) {
    console.error('[checkout] startUpgrade failed:', err)
    return openCheckout('solo_monthly')
  }
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
