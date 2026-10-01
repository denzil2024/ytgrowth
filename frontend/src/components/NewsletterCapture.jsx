/* Scroll-triggered email capture for blog posts. Slides up from the
   bottom-right once the reader has gotten ~50% through the article — not a
   blocking modal (PrepayModal is for checkout; this shouldn't interrupt
   reading). Dismiss is sticky per-browser via localStorage so a visitor who
   says no is never asked again. Matches PrepayModal's token set and
   stage-swap pattern (form → done). */

import { useEffect, useState, useRef } from 'react'

const SERIF  = "'Fraunces', Georgia, serif"
const SANS   = "'Barlow', system-ui, sans-serif"
const INK    = '#14130f'
const SOFT   = '#5c574e'
const MUTED  = '#8a8378'
const ACCENT = '#e5302a'
const GREEN  = '#1a7a4c'
const LINE   = 'rgba(20,19,15,0.12)'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const DISMISS_KEY = 'ytg_newsletter_dismissed'
// Shown only in this scroll-depth band: appears once the reader is well into
// the article, hides again near the footer so it never overlaps it (the
// footer's own bottom padding/CTA band sits below SCROLL_HIDE).
const SCROLL_SHOW = 0.5
const SCROLL_HIDE = 0.9

export default function NewsletterCapture({ source }) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [email, setEmail] = useState('')
  const [stage, setStage] = useState('form') // 'form' | 'sending' | 'done'
  const [error, setError] = useState('')
  const everShownRef = useRef(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY)) {
        setDismissed(true)
        return
      }
    } catch {}

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? window.scrollY / max : 0
      const inBand = progress >= SCROLL_SHOW && progress < SCROLL_HIDE
      if (inBand) everShownRef.current = true
      // Once it's appeared, keep rendering it (even below SCROLL_SHOW, e.g.
      // if the reader scrolls back up) so it doesn't flicker in and out —
      // only the footer band actually hides it.
      setVisible(everShownRef.current && progress < SCROLL_HIDE)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const dismiss = () => {
    setVisible(false)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch {}
  }

  const submit = async (e) => {
    e.preventDefault()
    const cleaned = email.trim().toLowerCase()
    if (!EMAIL_RE.test(cleaned)) {
      setError('Enter a valid email address')
      return
    }
    setError('')
    setStage('sending')
    try {
      const res = await fetch('/leads/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleaned, source: source || '' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong, try again')
        setStage('form')
        return
      }
      setStage('done')
      try { localStorage.setItem(DISMISS_KEY, '1') } catch {}
    } catch {
      setError('Could not submit, try again')
      setStage('form')
    }
  }

  if (dismissed || !visible) return null

  return (
    <div
      style={{
        position: 'fixed', bottom: 20, right: 20, left: 20,
        maxWidth: 380, marginLeft: 'auto',
        zIndex: 900, fontFamily: SANS,
        animation: 'ync-slide-up 0.3s cubic-bezier(0.2, 0.7, 0.3, 1)',
      }}>
      <style>{`
        @keyframes ync-slide-up { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
      `}</style>

      <div style={{
        position: 'relative',
        background: '#ffffff',
        border: `1px solid ${LINE}`,
        boxShadow: '0 12px 32px rgba(20,19,15,0.18)',
        padding: '22px 24px 20px',
      }}>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 26, height: 26, border: 'none', background: 'transparent',
            color: MUTED, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,19,15,0.06)'; e.currentTarget.style.color = INK }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = MUTED }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8"/>
          </svg>
        </button>

        {stage === 'done' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 36, height: 36, flexShrink: 0,
              background: GREEN,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 14, color: INK, lineHeight: 1.5, margin: 0 }}>
              You're on the list. New data studies land there first.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 30, height: 30, flexShrink: 0,
                background: ACCENT,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 19, color: INK, letterSpacing: '-0.01em', lineHeight: 1.2, margin: 0 }}>
                Get the next data study first
              </h3>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 13, color: SOFT, lineHeight: 1.55, margin: '0 0 14px' }}>
              One email when we publish new YouTube data. No spam, unsubscribe anytime.
            </p>
            <form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                style={{
                  flex: 1, minWidth: 0, boxSizing: 'border-box',
                  fontFamily: SANS, fontSize: 13.5, padding: '10px 12px',
                  border: `1px solid ${error ? ACCENT : LINE}`,
                  outline: 'none', color: INK,
                }}
              />
              <button
                type="submit"
                disabled={stage === 'sending'}
                style={{
                  flexShrink: 0,
                  background: ACCENT, color: '#fff',
                  fontFamily: SANS, fontSize: 13, fontWeight: 600,
                  padding: '10px 16px', border: 'none',
                  cursor: stage === 'sending' ? 'default' : 'pointer',
                  opacity: stage === 'sending' ? 0.7 : 1,
                }}>
                {stage === 'sending' ? '…' : 'Join'}
              </button>
            </form>
            {error && (
              <div style={{ fontFamily: SANS, fontSize: 12, color: ACCENT, marginTop: 8 }}>{error}</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
