/* CreditsEmptyModal — shared modal for "you ran out of credits this cycle".
   Distinct from UpsellGate (which is a full-page free-tier lock). This is
   triggered on a 402 response from any paid endpoint, when a user who's
   already paying has simply burned through their monthly allowance.

   Visual DNA is a deliberate lift of UpsellGate's card (red gradient icon
   square → title → description → bullets → red primary CTA → pack link →
   trust stack) so the two gates feel like siblings. Differences: this one
   floats as a modal over the page (dismissible), shows a refill countdown
   when we have one, and the icon is a credits-bolt rather than a padlock —
   the user already unlocked the feature, they're just out of fuel.

   Props:
     open        — show/hide the modal
     onClose     — dismiss handler (click-outside + close X)
     featureName — customises the headline, e.g. "SEO analyses"
     resetDate   — ISO string; shows "Refills in N days" if provided
     packBalance — number of pack credits the user still has (hides
                   Buy-pack CTA if they already have a pack). */

import { useEffect, useState } from 'react'

const C = {
  red: '#e5251b', green: '#059669', amber: '#d97706',
  text1: '#0f0f13', text2: '#4a4a58', text3: '#9595a4',
  border: '#e6e6ec',
}

function daysUntil(iso) {
  if (!iso) return null
  try {
    const diff = new Date(iso).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / 86400000))
  } catch { return null }
}

export default function CreditsEmptyModal({
  open,
  onClose,
  featureName = 'analyses',
  resetDate = null,        // optional override; otherwise self-fetched
  packBalance = null,      // optional override; otherwise self-fetched
}) {
  // Self-fetch usage so callers don't have to plumb reset_date/pack balance.
  const [usage, setUsage] = useState(null)
  useEffect(() => {
    if (!open) return
    if (resetDate != null && packBalance != null) return
    fetch('/billing/usage', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setUsage(d) })
      .catch(() => {})
  }, [open, resetDate, packBalance])

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

  const effectiveReset = resetDate ?? usage?.reset_date ?? null
  const effectivePack  = packBalance ?? usage?.pack_balance ?? 0
  const days = daysUntil(effectiveReset)
  const refillLine = days == null
    ? null
    : days === 0 ? 'Refills today'
    : days === 1 ? 'Refills tomorrow'
    : `Refills in ${days} days`

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
        animation: 'cem-fade 0.16s ease',
      }}>
      <style>{`
        @keyframes cem-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cem-pop  { from { opacity: 0; transform: translateY(8px) scale(0.98) } to { opacity: 1; transform: none } }
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
          animation: 'cem-pop 0.22s cubic-bezier(0.2, 0.7, 0.3, 1)',
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

        {/* Credits-bolt icon — red gradient square, matches UpsellGate's lock */}
        <div style={{
          width: 50, height: 50, borderRadius: 14,
          background: `linear-gradient(180deg, ${C.red} 0%, #a50f07 100%)`,
          margin: '0 auto 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 22px ${C.red}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 10 }}>
          You're out of credits
        </h2>
        <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.6, marginBottom: 18, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
          You've used all your monthly {featureName}. Your past reports stay available — upgrade your plan or grab a credit pack to keep running new ones.
        </p>

        {/* Refill countdown pill */}
        {refillLine && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12.5, fontWeight: 600, color: C.amber,
            background: '#fffbeb', border: '1px solid #fde68a',
            padding: '5px 12px', borderRadius: 100, marginBottom: 20,
            letterSpacing: '-0.05px',
          }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="6" cy="6" r="4.5"/><path d="M6 3.5V6l1.5 1.5"/>
            </svg>
            {refillLine}
          </div>
        )}

        {/* Primary CTA — mirrors UpsellGate */}
        <a
          href="/?tab=monthly#pricing"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', maxWidth: 360,
            background: `linear-gradient(180deg, ${C.red} 0%, #a50f07 100%)`,
            color: '#ffffff',
            fontSize: 14, fontWeight: 700,
            padding: '13px 24px', borderRadius: 999,
            textDecoration: 'none', letterSpacing: '-0.1px',
            boxShadow: `0 8px 22px ${C.red}50, inset 0 1px 0 rgba(255,255,255,0.22)`,
          }}>
          Upgrade plan
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>
        <div style={{ fontSize: 12.5, color: C.text3, fontWeight: 500, marginTop: 10, marginBottom: 8 }}>
          Plans from <span style={{ fontWeight: 700, color: C.text2 }}>$19/mo</span> · cancel anytime
        </div>

        {/* Pack link — hide if user already has pack credits */}
        {effectivePack <= 0 && (
          <div>
            <a
              href="/?tab=packs#pricing"
              style={{ fontSize: 12.5, fontWeight: 600, color: C.text3, textDecoration: 'none' }}>
              Or grab a one-time credit pack →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
