/* Email capture modal, centered with a dimmed backdrop — same pattern as
   PrepayModal. Originally shipped as a small bottom-right slide-up card,
   but that's a documented weak pattern (Sumo/cross-vendor data puts
   bottom-right/corner widgets around 0.5-1% conversion vs. 3-5% for
   centered modals, partly "right-rail blindness," partly getting visually
   filtered as a chat widget) — switched 2026-10-04 after the card produced
   zero signups across several days of 20+/day traffic. Dismiss is sticky
   per-browser via localStorage so a visitor who says no is never asked
   again. Matches PrepayModal's token set and stage-swap pattern (form → done).

   Two trigger variants share the same modal:
   - NewsletterCapture        (blog posts): scroll-depth band, 25%-90%, so it
     appears once the reader is into the article and stops re-triggering
     near the footer.
   - NewsletterCaptureTimed   (free tools): plain delay. Tool pages are short
     and utility-focused (run the tool, get a result, done) — scroll depth
     doesn't map the same way there, so it just waits `delayMs` after the
     page loads regardless of scroll position. */

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

function Card({ visible, dismissed, source, headline, body, onDismissed }) {
  const [email, setEmail] = useState('')
  const [stage, setStage] = useState('form') // 'form' | 'sending' | 'done'
  const [error, setError] = useState('')

  const dismiss = () => {
    onDismissed()
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

  useEffect(() => {
    if (!visible || dismissed) return
    const onKey = (e) => { if (e.key === 'Escape') dismiss() }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, dismissed])

  if (dismissed || !visible) return null

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(20,19,15,0.5)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        fontFamily: SANS,
        animation: 'ync-fade 0.16s ease',
      }}>
      <style>{`
        @keyframes ync-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ync-pop  { from { opacity: 0; transform: translateY(8px) scale(0.98) } to { opacity: 1; transform: none } }
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
          animation: 'ync-pop 0.22s cubic-bezier(0.2, 0.7, 0.3, 1)',
        }}>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
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

        {stage === 'done' ? (
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
            <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 26, color: INK, letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: 10 }}>
              You're in
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 14.5, color: SOFT, lineHeight: 1.6, maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
              New data studies land in your inbox before anywhere else.
            </p>
          </>
        ) : (
          <>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span aria-hidden="true" style={{ width: 26, height: 1, background: ACCENT }} />
              <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                Data studies
              </span>
              <span aria-hidden="true" style={{ width: 26, height: 1, background: ACCENT }} />
            </div>
            <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 28, color: INK, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: 12 }}>
              {headline}
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 14.5, color: SOFT, lineHeight: 1.6, marginBottom: 22, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
              {body}
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
                disabled={stage === 'sending'}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%',
                  background: ACCENT,
                  color: '#ffffff',
                  fontFamily: SANS, fontSize: 13.5, fontWeight: 700,
                  padding: '13px 24px', borderRadius: 0,
                  border: 'none', cursor: stage === 'sending' ? 'default' : 'pointer',
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                  opacity: stage === 'sending' ? 0.7 : 1,
                  transition: 'filter 0.15s',
                }}
                onMouseEnter={e => { if (stage !== 'sending') e.currentTarget.style.filter = 'brightness(1.08)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}>
                {stage === 'sending' ? 'Sending…' : "Count me in"}
                {stage !== 'sending' && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
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

function useDismissed() {
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY)) setDismissed(true)
    } catch {}
  }, [])
  return [dismissed, setDismissed]
}

// Shown only in this scroll-depth band: appears once the reader is well into
// the article, stops re-triggering once they're basically done scrolling
// (past 90%) so it doesn't interrupt right as they finish reading.
const SCROLL_SHOW = 0.25
const SCROLL_HIDE = 0.9

export function NewsletterCapture({ source }) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useDismissed()
  const everShownRef = useRef(false)

  useEffect(() => {
    if (dismissed) return
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
  }, [dismissed])

  return (
    <Card
      visible={visible}
      dismissed={dismissed}
      source={source}
      headline="Get the next data study first"
      body="One email when we publish new YouTube data. No spam, unsubscribe anytime."
      onDismissed={() => { setVisible(false); setDismissed(true) }}
    />
  )
}

// Free tool pages are short and utility-focused (run the tool, read the
// result, done) — scroll depth doesn't mean the same thing there, so this
// variant just waits a flat delay after mount instead.
const DEFAULT_DELAY_MS = 8000

export function NewsletterCaptureTimed({ source, delayMs = DEFAULT_DELAY_MS }) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useDismissed()

  useEffect(() => {
    if (dismissed) return
    const t = setTimeout(() => setVisible(true), delayMs)
    return () => clearTimeout(t)
  }, [dismissed, delayMs])

  return (
    <Card
      visible={visible}
      dismissed={dismissed}
      source={source}
      headline="Get the next data study first"
      body="One email when we publish new YouTube data. No spam, unsubscribe anytime."
      onDismissed={() => { setVisible(false); setDismissed(true) }}
    />
  )
}

export default NewsletterCapture
