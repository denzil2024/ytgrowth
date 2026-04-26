/* WelcomeModal — first-run "here's the path" walkthrough.
   Visual DNA is a deliberate lift of CreditsEmptyModal (which itself mirrors
   UpsellGate) so all three gates feel like siblings — same dismissible
   modal shell, red gradient icon square, h2 + supporting copy, primary red
   CTA, trust line. Differences: icon is a sparkle (new-here) rather than a
   bolt, the body is a 3-step numbered list instead of a refill pill, the
   CTA closes the modal rather than going to /pricing.

   Triggered once per channel via the existing `ytg_welcomed_{channel_id}`
   localStorage flag set by Dashboard.jsx when showWelcome flips on.

   Props:
     open    — show/hide the modal
     onClose — dismiss handler (click-outside + close X + CTA) */

import { useEffect } from 'react'

const C = {
  red: '#e5251b', green: '#059669', amber: '#d97706',
  text1: '#0f0f13', text2: '#4a4a58', text3: '#9595a4',
  border: '#e6e6ec',
}

const STEPS = [
  { n: '1', title: 'Read your audit',     body: 'Overview shows your Priority Actions — exactly what to fix this week.' },
  { n: '2', title: 'Optimise a video',    body: 'SEO Studio rewrites your titles + descriptions and Post-Publish Review tells you why a video flopped.' },
  { n: '3', title: 'Find your next idea', body: 'Video Ideas, Outliers, and Competitors surface what is actually working in your niche.' },
]

export default function WelcomeModal({ open, onClose }) {
  // ESC-to-close + lock body scroll while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,10,15,0.52)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        fontFamily: "'Inter', system-ui, sans-serif",
        animation: 'wm-fade 0.16s ease',
      }}>
      <style>{`
        @keyframes wm-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes wm-pop  { from { opacity: 0; transform: translateY(8px) scale(0.98) } to { opacity: 1; transform: none } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          background: '#ffffff',
          border: '1px solid rgba(229,37,27,0.2)',
          borderRadius: 20,
          boxShadow: '0 20px 50px rgba(0,0,0,0.22)',
          padding: '30px 36px 28px',
          maxWidth: 520, width: '100%',
          textAlign: 'center',
          animation: 'wm-pop 0.22s cubic-bezier(0.2, 0.7, 0.3, 1)',
        }}>

        {/* Close button */}
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
          onMouseEnter={e => { e.currentTarget.style.background = '#f4f4f6'; e.currentTarget.style.color = C.text1 }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text3 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8"/>
          </svg>
        </button>

        {/* Sparkle icon — red gradient square, matches CreditsEmptyModal/UpsellGate */}
        <div style={{
          width: 50, height: 50, borderRadius: 14,
          background: `linear-gradient(180deg, ${C.red} 0%, #a50f07 100%)`,
          margin: '0 auto 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 22px ${C.red}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z"/>
            <path d="M19 4v3M17.5 5.5h3"/>
            <path d="M5 18v2M4 19h2"/>
          </svg>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 10 }}>
          Welcome to YTGrowth.io
        </h2>
        <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.6, marginBottom: 22, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
          Your channel is connected. Here's the 3-step path most creators follow on day one — each step costs 1 credit.
        </p>

        {/* 3-step list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22, textAlign: 'left' }}>
          {STEPS.map(s => (
            <div key={s.n} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 14px',
              background: '#fafafb',
              border: `1px solid ${C.border}`,
              borderRadius: 12,
            }}>
              <div style={{
                flexShrink: 0,
                width: 26, height: 26, borderRadius: 8,
                background: '#fff',
                border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: C.text1,
                fontVariantNumeric: 'tabular-nums',
              }}>{s.n}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: C.text1, letterSpacing: '-0.1px', marginBottom: 2 }}>{s.title}</p>
                <p style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.5 }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Primary CTA — mirrors CreditsEmptyModal/UpsellGate */}
        <button
          onClick={onClose}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', maxWidth: 360,
            background: `linear-gradient(180deg, ${C.red} 0%, #a50f07 100%)`,
            color: '#ffffff',
            fontSize: 14, fontWeight: 700,
            padding: '13px 24px', borderRadius: 999,
            border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', letterSpacing: '-0.1px',
            boxShadow: `0 8px 22px ${C.red}50, inset 0 1px 0 rgba(255,255,255,0.22)`,
          }}>
          Got it — let's go
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
        <div style={{ fontSize: 12.5, color: C.text3, fontWeight: 500, marginTop: 10 }}>
          Need help anytime? Email <span style={{ fontWeight: 700, color: C.text2 }}>support@ytgrowth.io</span>
        </div>
      </div>
    </div>
  )
}
