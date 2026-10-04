/* Email capture, two independent surfaces sharing one visual language:
   - modal  : centered, dimmed backdrop, same pattern as PrepayModal. Fires
     first (earlier scroll/delay threshold).
   - bar    : small persistent bottom-right card. Fires later, as a second
     chance for anyone who closed the modal — its own dismiss key, so
     closing the modal does NOT also kill the bar (two chances, not zero;
     requested 2026-10-04 after noticing a single dismiss meant someone who
     X'd the modal would never see any capture surface again).

   Both read from the same Card renderer (headline, eyebrow, "Count me in"
   button) so they look like one family, not two different widgets.

   Two trigger contexts, each mounting both surfaces at different
   thresholds:
   - NewsletterCapture      (blog posts): scroll-depth. Modal at 25%-90%,
     bar at 55%-90%, so the bar only has a chance to appear after the modal
     already had its shot (and only if it was dismissed, not submitted).
   - NewsletterCaptureTimed (free tools): plain delay. Modal at 8s, bar at
     20s — tool pages are short/utility-focused, so delay stands in for
     scroll depth. */

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
const MODAL_DISMISS_KEY = 'ytg_newsletter_dismissed'
const BAR_DISMISS_KEY   = 'ytg_newsletter_bar_dismissed'
// Set on a successful subscribe from EITHER surface. Separate from the two
// per-surface dismiss keys above (closing one with X must not silence the
// other — that's the whole point of having two), but an actual signup
// should suppress both, there's no reason to ask someone twice.
const SUBSCRIBED_KEY = 'ytg_newsletter_subscribed'

function Card({ variant, visible, dismissed, source, headline, body, dismissKey, onDismissed, onSubscribed }) {
  const [email, setEmail] = useState('')
  const [stage, setStage] = useState('form') // 'form' | 'sending' | 'done'
  const [error, setError] = useState('')

  const dismiss = () => {
    onDismissed()
    try { localStorage.setItem(dismissKey, '1') } catch {}
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
      try {
        localStorage.setItem(dismissKey, '1')
        localStorage.setItem(SUBSCRIBED_KEY, '1')
      } catch {}
      onSubscribed?.()
    } catch {
      setError('Could not submit, try again')
      setStage('form')
    }
  }

  const isModal = variant === 'modal'

  useEffect(() => {
    if (!isModal || !visible || dismissed) return
    const onKey = (e) => { if (e.key === 'Escape') dismiss() }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModal, visible, dismissed])

  if (dismissed || !visible) return null

  const eyebrow = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: isModal ? 16 : 10 }}>
      <span aria-hidden="true" style={{ width: isModal ? 26 : 16, height: 1, background: ACCENT }} />
      <span style={{ fontFamily: SANS, fontSize: isModal ? 11 : 10, fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
        Data studies
      </span>
      {isModal && <span aria-hidden="true" style={{ width: 26, height: 1, background: ACCENT }} />}
    </div>
  )

  const doneContent = (
    <div style={isModal ? undefined : { display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: isModal ? 48 : 36, height: isModal ? 48 : 36, flexShrink: 0, borderRadius: 0,
        background: GREEN,
        margin: isModal ? '0 auto 20px' : 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width={isModal ? 22 : 17} height={isModal ? 22 : 17} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      {isModal ? (
        <>
          <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 26, color: INK, letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: 10 }}>
            You're in
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 14.5, color: SOFT, lineHeight: 1.6, maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
            New data studies land in your inbox before anywhere else.
          </p>
        </>
      ) : (
        <p style={{ fontFamily: SANS, fontSize: 14, color: INK, lineHeight: 1.5, margin: 0 }}>
          You're in. New data studies land there first.
        </p>
      )}
    </div>
  )

  const formContent = (
    <>
      {eyebrow}
      {isModal ? (
        <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 28, color: INK, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: 12 }}>
          {headline}
        </h2>
      ) : (
        <h3 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 19, color: INK, letterSpacing: '-0.01em', lineHeight: 1.2, margin: '0 0 8px' }}>
          {headline}
        </h3>
      )}
      <p style={{ fontFamily: SANS, fontSize: isModal ? 14.5 : 13, color: SOFT, lineHeight: isModal ? 1.6 : 1.55, marginBottom: isModal ? 22 : 14, maxWidth: isModal ? 360 : undefined, marginLeft: isModal ? 'auto' : 0, marginRight: isModal ? 'auto' : 0 }}>
        {body}
      </p>
      <form onSubmit={submit} style={isModal ? undefined : { display: 'flex', gap: 8 }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@email.com"
          autoFocus={isModal}
          style={{
            flex: isModal ? undefined : 1, minWidth: isModal ? undefined : 0,
            width: isModal ? '100%' : undefined,
            boxSizing: 'border-box',
            fontFamily: SANS, fontSize: isModal ? 14 : 13.5,
            padding: isModal ? '12px 14px' : '10px 12px',
            marginBottom: isModal ? 12 : 0,
            border: `1px solid ${error ? ACCENT : LINE}`,
            borderRadius: 0, outline: 'none', color: INK,
          }}
        />
        {isModal && error && (
          <div style={{ fontFamily: SANS, fontSize: 12.5, color: ACCENT, marginBottom: 12, textAlign: 'left' }}>{error}</div>
        )}
        <button
          type="submit"
          disabled={stage === 'sending'}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            flexShrink: isModal ? undefined : 0,
            width: isModal ? '100%' : undefined,
            background: ACCENT,
            color: '#ffffff',
            fontFamily: SANS, fontSize: isModal ? 13.5 : 12.5, fontWeight: 700,
            padding: isModal ? '13px 24px' : '10px 14px', borderRadius: 0,
            border: 'none', cursor: stage === 'sending' ? 'default' : 'pointer',
            letterSpacing: '0.04em', textTransform: 'uppercase',
            opacity: stage === 'sending' ? 0.7 : 1,
            transition: 'filter 0.15s',
          }}
          onMouseEnter={e => { if (stage !== 'sending') e.currentTarget.style.filter = 'brightness(1.08)' }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}>
          {stage === 'sending' ? '…' : (isModal ? 'Count me in' : 'Count me in')}
          {stage !== 'sending' && (
            <svg width={isModal ? 13 : 11} height={isModal ? 13 : 11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          )}
        </button>
      </form>
      {!isModal && error && (
        <div style={{ fontFamily: SANS, fontSize: 12, color: ACCENT, marginTop: 8 }}>{error}</div>
      )}
    </>
  )

  if (isModal) {
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
          {stage === 'done' ? doneContent : formContent}
        </div>
      </div>
    )
  }

  // Bottom-right persistent bar/card.
  return (
    <div
      style={{
        position: 'fixed', bottom: 20, right: 20, left: 20,
        maxWidth: 360, marginLeft: 'auto',
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
        padding: '20px 22px 18px',
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
        {stage === 'done' ? doneContent : formContent}
      </div>
    </div>
  )
}

function useDismissed(dismissKey) {
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => {
    try {
      if (localStorage.getItem(dismissKey) || localStorage.getItem(SUBSCRIBED_KEY)) setDismissed(true)
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return [dismissed, setDismissed]
}

const HEADLINE = 'Get the next data study first'
const BODY = 'One email when we publish new YouTube data. No spam, unsubscribe anytime.'

// Modal appears earlier in the scroll/delay than the bar, so the bar only
// gets its chance after the modal already had one (shown regardless of
// whether the modal was dismissed or submitted — its own independent key).
const MODAL_SCROLL_SHOW = 0.25
const BAR_SCROLL_SHOW   = 0.55
const SCROLL_HIDE       = 0.9

function useScrollTrigger(show, hide, dismissed) {
  const [visible, setVisible] = useState(false)
  const everShownRef = useRef(false)
  useEffect(() => {
    if (dismissed) return
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? window.scrollY / max : 0
      const inBand = progress >= show && progress < hide
      if (inBand) everShownRef.current = true
      setVisible(everShownRef.current && progress < hide)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [dismissed, show, hide])
  return visible
}

export function NewsletterCapture({ source }) {
  const [modalDismissed, setModalDismissed] = useDismissed(MODAL_DISMISS_KEY)
  const [barDismissed, setBarDismissed] = useDismissed(BAR_DISMISS_KEY)
  const modalVisible = useScrollTrigger(MODAL_SCROLL_SHOW, SCROLL_HIDE, modalDismissed)
  const barVisible = useScrollTrigger(BAR_SCROLL_SHOW, SCROLL_HIDE, barDismissed)

  return (
    <>
      <Card
        variant="modal"
        visible={modalVisible}
        dismissed={modalDismissed}
        source={source}
        headline={HEADLINE}
        body={BODY}
        dismissKey={MODAL_DISMISS_KEY}
        onDismissed={() => { setModalDismissed(true) }}
        onSubscribed={() => { setBarDismissed(true) }}
      />
      <Card
        variant="bar"
        visible={barVisible}
        dismissed={barDismissed}
        source={source}
        headline={HEADLINE}
        body={BODY}
        dismissKey={BAR_DISMISS_KEY}
        onDismissed={() => { setBarDismissed(true) }}
        onSubscribed={() => { setModalDismissed(true) }}
      />
    </>
  )
}

// Free tool pages are short and utility-focused (run the tool, read the
// result, done) — scroll depth doesn't mean the same thing there, so both
// surfaces use a plain delay instead, bar later than modal.
const MODAL_DELAY_MS = 8000
const BAR_DELAY_MS = 20000

function useTimedTrigger(delayMs, dismissed) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (dismissed) return
    const t = setTimeout(() => setVisible(true), delayMs)
    return () => clearTimeout(t)
  }, [dismissed, delayMs])
  return visible
}

export function NewsletterCaptureTimed({ source, delayMs = MODAL_DELAY_MS, barDelayMs = BAR_DELAY_MS }) {
  const [modalDismissed, setModalDismissed] = useDismissed(MODAL_DISMISS_KEY)
  const [barDismissed, setBarDismissed] = useDismissed(BAR_DISMISS_KEY)
  const modalVisible = useTimedTrigger(delayMs, modalDismissed)
  const barVisible = useTimedTrigger(barDelayMs, barDismissed)

  return (
    <>
      <Card
        variant="modal"
        visible={modalVisible}
        dismissed={modalDismissed}
        source={source}
        headline={HEADLINE}
        body={BODY}
        dismissKey={MODAL_DISMISS_KEY}
        onDismissed={() => { setModalDismissed(true) }}
        onSubscribed={() => { setBarDismissed(true) }}
      />
      <Card
        variant="bar"
        visible={barVisible}
        dismissed={barDismissed}
        source={source}
        headline={HEADLINE}
        body={BODY}
        dismissKey={BAR_DISMISS_KEY}
        onDismissed={() => { setBarDismissed(true) }}
        onSubscribed={() => { setModalDismissed(true) }}
      />
    </>
  )
}

export default NewsletterCapture
