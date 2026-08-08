/* PrepayModal, email-capture + Paddle checkout for a LOGGED-OUT visitor.

   Pay-before-signup (2026-08): YTGrowth no longer creates an account before
   a purchase. This modal is how a first-time visitor buys a plan/pack with
   only an email (no session, no YouTube channel connected yet). It hits
   GET /billing/checkout-prepay (no auth required) to resolve a price_id,
   opens the Paddle overlay directly, then — once Paddle's checkout.completed
   event fires — polls GET /billing/prepay-status until the webhook has
   landed the PendingPurchase row, then sends the buyer into Google OAuth.
   routers/auth.py /callback redeems the purchase onto the new account.

   Visual DNA matches AuthErrorModal.jsx exactly (red gradient icon square,
   Barlow, white rounded card) since both live on the public marketing site.

   Props:
     open     , show/hide
     onClose  , dismiss handler
     planKey  , one of routers/billing.py PLAN_PRICE_MAP's keys
*/

import { useEffect, useState, useRef } from 'react'

const C = {
  red: '#c9a030', green: '#059669',
  text1: '#0f0f13', text2: '#4a4a58', text3: '#8a8378',
  border: '#e6e6ec',
}

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
  const [stage, setStage] = useState('form') // 'form' | 'opening' | 'paid' | 'error'
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
        background: 'rgba(10,10,15,0.52)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        fontFamily: "'Barlow', system-ui, sans-serif",
        animation: 'pfm-fade 0.16s ease',
      }}>
      <style>{`
        @keyframes pfm-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pfm-pop  { from { opacity: 0; transform: translateY(8px) scale(0.98) } to { opacity: 1; transform: none } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          background: '#ffffff',
          border: '1px solid rgba(201,160,48,0.2)',
          borderRadius: 20,
          boxShadow: '0 20px 50px rgba(0,0,0,0.22)',
          padding: '30px 36px 28px',
          maxWidth: 460, width: '100%',
          textAlign: 'center',
          animation: 'pfm-pop 0.22s cubic-bezier(0.2, 0.7, 0.3, 1)',
        }}>

        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 32, height: 32, borderRadius: 10,
            border: 'none', background: 'transparent',
            color: C.text3, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#14130f'; e.currentTarget.style.color = C.text1 }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text3 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8"/>
          </svg>
        </button>

        {stage === 'paid' ? (
          <>
            <div style={{
              width: 50, height: 50, borderRadius: 14,
              background: `linear-gradient(180deg, ${C.green} 0%, #047a4f 100%)`,
              margin: '0 auto 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 22px ${C.green}45, inset 0 1px 0 rgba(20,19,15,0.25)`,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 10 }}>
              Payment received
            </h2>
            <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.6, marginBottom: 22, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
              Now connect your YouTube channel with the same Google account to activate your plan.
            </p>
            <a
              href="/auth/login"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%',
                background: connectReady ? `linear-gradient(180deg, ${C.red} 0%, #a50f07 100%)` : '#c9c9d1',
                color: '#ffffff',
                fontSize: 14, fontWeight: 700,
                padding: '13px 24px', borderRadius: 999,
                textDecoration: 'none', letterSpacing: '-0.1px',
                pointerEvents: connectReady ? 'auto' : 'none',
                boxShadow: connectReady ? `0 8px 22px ${C.red}50, inset 0 1px 0 rgba(20,19,15,0.22)` : 'none',
              }}>
              {connectReady ? 'Connect my YouTube channel' : 'Finalising your payment…'}
              {connectReady && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              )}
            </a>
          </>
        ) : (
          <>
            <div style={{
              width: 50, height: 50, borderRadius: 14,
              background: `linear-gradient(180deg, ${C.red} 0%, #a50f07 100%)`,
              margin: '0 auto 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 22px ${C.red}55, inset 0 1px 0 rgba(20,19,15,0.25)`,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 10 }}>
              Get instant access
            </h2>
            <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.6, marginBottom: 22, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
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
                  fontSize: 14, padding: '12px 16px', marginBottom: 12,
                  border: `1px solid ${error ? C.red : C.border}`,
                  borderRadius: 12, outline: 'none',
                  fontFamily: "'Barlow', system-ui, sans-serif",
                }}
              />
              {error && (
                <div style={{ fontSize: 12.5, color: C.red, marginBottom: 12, textAlign: 'left' }}>{error}</div>
              )}
              <button
                type="submit"
                disabled={stage === 'opening'}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%',
                  background: `linear-gradient(180deg, ${C.red} 0%, #a50f07 100%)`,
                  color: '#ffffff',
                  fontSize: 14, fontWeight: 700,
                  padding: '13px 24px', borderRadius: 999,
                  border: 'none', cursor: stage === 'opening' ? 'default' : 'pointer',
                  letterSpacing: '-0.1px', opacity: stage === 'opening' ? 0.7 : 1,
                  boxShadow: `0 8px 22px ${C.red}50, inset 0 1px 0 rgba(20,19,15,0.22)`,
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
