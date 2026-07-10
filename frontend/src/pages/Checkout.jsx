/* Checkout handoff page (ytgrowth.io only).
 *
 * Paddle approves checkout on ytgrowth.io only, not on the channelbrain.online
 * dashboard. So a checkout started in the dashboard redirects here with the
 * resolved price + attribution in the URL (see checkout.js). This page opens
 * the Paddle overlay immediately and reassures the user they're in the right
 * place, instead of dumping them on the full marketing landing page.
 */

import { useEffect, useState } from 'react'

const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"
const GOLD  = '#c9a030'
const INK   = '#14130f'
const SOFT  = '#6b6862'

export default function Checkout() {
  // Captured on first render, before we strip the query below, so the retry
  // button still has them.
  const params     = new URLSearchParams(window.location.search)
  const price      = params.get('price')
  const channel_id = params.get('ch') || ''
  const email      = params.get('em') || ''
  const [failed, setFailed] = useState(!price)

  const openPaddle = () => {
    if (!price) { setFailed(true); return }
    const ready = window.__paddleReady ? window.__paddleReady() : Promise.reject(new Error('paddle unavailable'))
    ready.then(() => {
      window.Paddle.Checkout.open({
        items: [{ priceId: price, quantity: 1 }],
        customData: { channel_id, email },
        customer: email ? { email } : undefined,
      })
    }).catch(() => setFailed(true))
  }

  useEffect(() => {
    openPaddle()
    // Strip the checkout params so a refresh / back-button doesn't leak them.
    window.history.replaceState({}, '', window.location.pathname)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f6f4ef', padding: 24, fontFamily: SANS,
    }}>
      <style>{`@keyframes coSpin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ maxWidth: 460, width: '100%', textAlign: 'center' }}>
        {!failed && (
          <div style={{
            width: 34, height: 34, margin: '0 auto',
            border: `3px solid rgba(20,19,15,0.12)`, borderTopColor: GOLD,
            borderRadius: '50%', animation: 'coSpin 0.75s linear infinite',
          }} />
        )}

        <h1 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 500, color: INK, letterSpacing: '-0.01em', margin: '22px 0 12px', lineHeight: 1.15 }}>
          {failed ? 'Open secure checkout' : 'Opening secure checkout…'}
        </h1>

        <p style={{ fontSize: 15, color: SOFT, lineHeight: 1.65, maxWidth: 400, margin: '0 auto 8px' }}>
          You're on <strong style={{ color: INK, fontWeight: 600 }}>ytgrowth.io</strong>, our secure payment page.
          {' '}<strong style={{ color: INK, fontWeight: 600 }}>YTGrowth</strong> and <strong style={{ color: INK, fontWeight: 600 }}>ChannelBrain</strong> are the same product, same team, same account. Just two names.
        </p>

        <div style={{ marginTop: 22 }}>
          <button
            type="button"
            onClick={openPaddle}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: GOLD, color: '#14130f',
              fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase',
              fontSize: 14, fontWeight: 600, letterSpacing: '0.06em',
              padding: '13px 30px', border: 'none', cursor: 'pointer',
            }}
          >
            {failed ? 'Open checkout' : 'Checkout not showing? Open it'}
          </button>
        </div>

        <p style={{ marginTop: 18, fontSize: 13 }}>
          <a href="/#pricing" style={{ color: SOFT, textDecoration: 'none', fontWeight: 500 }}>See all plans →</a>
        </p>
      </div>
    </div>
  )
}
