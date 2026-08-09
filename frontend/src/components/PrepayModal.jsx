/* PrepayModal, email-capture + Paddle checkout for a LOGGED-OUT visitor.

   Pay-before-signup (2026-08): YTGrowth no longer creates an account before
   a purchase. This modal is how a first-time visitor buys a plan/pack with
   only an email (no session, no YouTube channel connected yet). It hits
   GET /billing/checkout-prepay (no auth required) to resolve a price_id,
   opens the Paddle overlay directly, then — once Paddle's checkout.completed
   event fires — polls GET /billing/prepay-status until the webhook has
   landed the PendingPurchase row, then auto-advances into Google OAuth
   (no extra click). routers/auth.py /callback redeems the purchase onto
   the new account.

   Matches Landing.jsx's editorial system (Fraunces, flat, solid accent red,
   no gradients) — same tokens as AuthErrorModal.jsx, both live on the same
   page. Redesigned 2026-08.

   Props:
     open     , show/hide
     onClose  , dismiss handler
     planKey  , one of routers/billing.py PLAN_PRICE_MAP's keys
*/

import { useEffect, useState, useRef } from 'react'
import { isChannelBrain } from '../brandHost'

// Paddle only approves checkout on ytgrowth.io (see checkout.js CHECKOUT_ORIGIN)
// -- calling Paddle.Checkout.open() on channelbrain.online fails with Paddle's
// own generic "Something went wrong" overlay. Landing.jsx (and this modal)
// mount identically on both hosts, so a logged-out visitor can hit this from
// channelbrain.online. Hand off to the existing /checkout page on ytgrowth.io,
// same as checkout.js already does for the logged-in flow.
const CHECKOUT_ORIGIN = 'https://ytgrowth.io'

const SERIF  = "'Fraunces', Georgia, serif"
const SANS   = "'Barlow', system-ui, sans-serif"
const INK    = '#14130f'
const SOFT   = '#5c574e'
const MUTED  = '#8a8378'
const ACCENT = '#e5302a'
const GREEN  = '#1a7a4c'
const LINE   = 'rgba(20,19,15,0.12)'

const PLAN_LABELS = {
  pack_5:          '$5 Starter pack (5 audits)',
  pack_20:         '20-analysis pack ($15)',
  pack_60:         '60-analysis pack ($42)',
  pack_150:        '150-analysis pack ($95)',
  solo_monthly:    'Solo ($19/mo)',
  growth_monthly:  'Growth ($39/mo)',
  agency_monthly:  'Agency ($79/mo)',
  solo_annual:     'Solo (annual)',
  growth_annual:   'Growth (annual)',
  agency_annual:   'Agency (annual)',
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

function ensurePaddle() {
  return window.__paddleReady ? window.__paddleReady() : Promise.resolve()
}

export default function PrepayModal({ open, onClose, planKey = 'pack_5' }) {
  const [stage, setStage] = useState('form') // 'form' | 'opening' | 'paid'
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [connectReady, setConnectReady] = useState(false)
  const pollRef = useRef(null)

  useEffect(() => {
    if (!open) {
      setStage('form'); setError(''); setConnectReady(false)
      if (pollRef.current) clearInterval(pollRef.current)
      return
    }
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [open, onClose])

  // Auto-advance into Google OAuth the moment the webhook has landed the
  // purchase, no manual "Connect" click needed — one less step.
  useEffect(() => {
    if (connectReady) window.location.href = '/auth/login'
  }, [connectReady])

  if (!open) return null

  const planLabel = PLAN_LABELS[planKey] || 'your plan'

  const startPolling = (paidEmail) => {
    const startedAt = Date.now()
    pollRef.current = setInterval(async () => {
      if (Date.now() - startedAt > 8000) {
        clearInterval(pollRef.current)
        setConnectReady(true)
        return
      }
      try {
        const r = await fetch(`/billing/prepay-status?email=${encodeURIComponent(paidEmail)}`)
        const d = await r.json()
        if (d.ready) {
          clearInterval(pollRef.current)
          setConnectReady(true)
        }
      } catch {}
    }, 1500)
  }

  const submit = async (e) => {
    e.preventDefault()
    const cleaned = email.trim().toLowerCase()
    if (!EMAIL_RE.test(cleaned)) {
      setError('Enter a valid email address')
      return
    }
    setError('')
    setStage('opening')
    try {
      const paddleReady = ensurePaddle()
      const res = await fetch(`/billing/checkout-prepay?plan=${encodeURIComponent(planKey)}&email=${encodeURIComponent(cleaned)}`)
      const data = await res.json()
      if (!res.ok || !data.price_id) {
        setError(data.error || 'Something went wrong, try again')
        setStage('form')
        return
      }

      if (isChannelBrain()) {
        const p = new URLSearchParams({ pco: '1', prepay: '1', price: data.price_id, em: cleaned })
        window.location.href = `${CHECKOUT_ORIGIN}/checkout?${p.toString()}`
        return
      }

      await paddleReady
      window.Paddle.Checkout.open({
        items: [{ priceId: data.price_id, quantity: 1 }],
        customData: { email: cleaned, plan: planKey },
        customer: { email: cleaned },
        eventCallback: (evt) => {
          if (evt?.name === 'checkout.completed') {
            setStage('paid')
            startPolling(cleaned)
          }
        },
      })
      setStage('form')
    } catch (err) {
      console.error('[PrepayModal] checkout failed:', err)
      setError('Could not open checkout, try again')
      setStage('form')
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(20,19,15,0.5)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        fontFamily: SANS,
        animation: 'pfm-fade 0.16s ease',
      }}>
      <style>{`
        @keyframes pfm-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pfm-pop  { from { opacity: 0; transform: translateY(8px) scale(0.98) } to { opacity: 1; transform: none } }
        @keyframes pfm-spin { to { transform: rotate(360deg) } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          background: '#ffffff',
          border: `1px solid ${LINE}`,
          borderRadius: 0,
          boxShadow: '0 12px 32px rgba(20,19,15,0.14)',
          padding: '32px 36px 28px',
          maxWidth: 440, width: '100%',
          textAlign: 'center',
          animation: 'pfm-pop 0.22s cubic-bezier(0.2, 0.7, 0.3, 1)',
        }}>

        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 30, height: 30, borderRadius: 0,
            border: 'none', background: 'transparent',
            color: MUTED, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,19,15,0.06)'; e.currentTarget.style.color = INK }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = MUTED }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8"/>
          </svg>
        </button>

        {stage === 'paid' ? (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: 0,
              background: GREEN,
              margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 28, color: INK, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: 12 }}>
              Payment received
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 14.5, color: SOFT, lineHeight: 1.65, marginBottom: 8, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
              Connecting your YouTube channel with the same Google account…
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: `2px solid ${LINE}`, borderTopColor: ACCENT,
                animation: 'pfm-spin 0.7s linear infinite',
              }} />
            </div>
          </>
        ) : (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: 0,
              background: ACCENT,
              margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 28, color: INK, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: 12 }}>
              Get instant access
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 14.5, color: SOFT, lineHeight: 1.65, marginBottom: 24, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
              Enter your email to pay for {planLabel}. You'll connect your YouTube channel right after, using this same Google account.
            </p>
            <form onSubmit={submit}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoFocus
                style={{
                  width: '100%', boxSizing: 'border-box',
                  fontFamily: SANS, fontSize: 14, padding: '12px 14px', marginBottom: 12,
                  border: `1px solid ${error ? ACCENT : LINE}`,
                  borderRadius: 0, outline: 'none', color: INK,
                }}
              />
              {error && (
                <div style={{ fontFamily: SANS, fontSize: 12.5, color: ACCENT, marginBottom: 12, textAlign: 'left' }}>{error}</div>
              )}
              <button
                type="submit"
                disabled={stage === 'opening'}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%',
                  background: ACCENT,
                  color: '#ffffff',
                  fontFamily: SANS, fontSize: 14, fontWeight: 600,
                  padding: '13px 24px', borderRadius: 0,
                  border: 'none', cursor: stage === 'opening' ? 'default' : 'pointer',
                  letterSpacing: '-0.1px', opacity: stage === 'opening' ? 0.7 : 1,
                }}>
                {stage === 'opening' ? 'Opening payment…' : 'Continue to payment'}
                {stage !== 'opening' && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
