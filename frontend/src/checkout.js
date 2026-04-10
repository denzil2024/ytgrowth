/**
 * Lemon Squeezy checkout helper.
 * Fetches the signed checkout URL from the backend and redirects the user.
 */
export async function openCheckout(planKey) {
  try {
    const res = await fetch(`/billing/checkout?plan=${encodeURIComponent(planKey)}`, {
      credentials: 'include',
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      console.error('[checkout] No URL returned:', data)
    }
  } catch (err) {
    console.error('[checkout] Failed to get checkout URL:', err)
  }
}
