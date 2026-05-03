/**
 * Paddle checkout helper.
 * Paddle.js is loaded via index.html (cdn.paddle.com/paddle/v2/paddle.js).
 *
 * initPaddleRetain(customerId) — call once per authenticated page load
 * with the Paddle customer ID (ctm_...) so Retain can track the user.
 *
 * openCheckout(planKey) — opens the Paddle overlay checkout.
 */

const PADDLE_TOKEN = 'live_2af860b645fca6f106c9d79f8d2'

/**
 * Re-initialise Paddle with the logged-in customer's Paddle ID.
 * Call this once after /billing/usage resolves and returns a paddle_customer_id.
 * Safe to call multiple times — Paddle ignores repeat calls with the same ID.
 */
export function initPaddleRetain(customerId) {
  if (!customerId) return
  Paddle.Initialize({
    token: PADDLE_TOKEN,
    pwCustomer: { id: customerId },
  })
}

export async function openCheckout(planKey) {
  try {
    const res = await fetch(`/billing/checkout?plan=${encodeURIComponent(planKey)}`, {
      credentials: 'include',
    })

    // Unauthenticated visitors hit pricing buttons too — without this branch
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
