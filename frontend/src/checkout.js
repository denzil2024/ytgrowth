/**
 * Paddle checkout helper.
 * Fetches the price ID + user context from the backend, then opens
 * the Paddle overlay. Paddle.js must be loaded via index.html.
 */

Paddle.Initialize({ token: 'live_2af860b645fca6f106c9d79f8d2' })

export async function openCheckout(planKey) {
  try {
    const res = await fetch(`/billing/checkout?plan=${encodeURIComponent(planKey)}`, {
      credentials: 'include',
    })
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
