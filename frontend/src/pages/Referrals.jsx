import { useEffect, useState } from 'react'

/* ── Design tokens — Competitors / Settings north-star ─────────────────── */
const C = {
  red:      '#e5251b',
  redHi:    '#ef3a31',
  redBg:    'rgba(229,37,27,0.05)',
  redBdr:   'rgba(229,37,27,0.18)',
  green:    '#16a34a',
  ink:      '#0a0a0f',
  ink70:    'rgba(10,10,15,0.70)',
  ink55:    'rgba(10,10,15,0.55)',
  ink45:    'rgba(10,10,15,0.45)',
  hair:     'rgba(10,10,15,0.07)',
  tint:     'rgba(10,10,15,0.05)',
}

/* Suite card grammar: white, hairline, 14px radius, single soft shadow
   + inset-from-above highlight. */
const CARD = {
  background:   '#ffffff',
  border:       `1px solid ${C.hair}`,
  borderRadius: 14,
  boxShadow:    '0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
}

function useReferralsStyles() {
  useEffect(() => {
    if (!document.getElementById('ytg-referrals-geist')) {
      const link = document.createElement('link')
      link.id = 'ytg-referrals-geist'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap'
      document.head.appendChild(link)
    }
    if (document.getElementById('ytg-referrals-styles-v2')) return
    const style = document.createElement('style')
    style.id = 'ytg-referrals-styles-v2'
    style.textContent = `
      .referrals-page { max-width: 1040px; margin: 0 auto; }
      .referrals-page, .referrals-page * {
        box-sizing: border-box;
        font-family: 'Geist','Inter',system-ui,sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .referrals-page p, .referrals-page span, .referrals-page div, .referrals-page h1 { margin: 0; }
      .ref-eyebrow {
        font-size: 11px; font-weight: 700; letter-spacing: 0.10em;
        text-transform: uppercase; color: ${C.ink45};
      }
      @keyframes referralsSpin { to { transform: rotate(360deg) } }
    `
    document.head.appendChild(style)
  }, [])
}

const STATS = [
  { value: '30%',     label: 'Recurring commission', sub: 'Every payment, not just the first' },
  { value: '30 days', label: 'Cookie window',        sub: 'Standard attribution window' },
  { value: '$50',     label: 'Payout minimum',       sub: 'Monthly via PayPal or bank' },
]

const STEPS = [
  { n: '1', title: 'Copy your link',    body: 'Grab your unique referral link from the dashboard below. Anyone who signs up through it is tied to your account.' },
  { n: '2', title: 'Share it anywhere', body: 'Drop it in a YouTube description, newsletter, tweet, community post, or pinned comment. Honest mentions convert best.' },
  { n: '3', title: 'Get paid monthly',  body: '30% of every payment your referrals make lands in your balance, month after month. Withdraw once you clear $50.' },
]

export default function Referrals() {
  useReferralsStyles()
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    fetch('/api/affiliate/embed-token', { method: 'POST', credentials: 'include' })
      .then(async r => {
        const body = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(body.error || 'Could not load your affiliate dashboard')
        return body
      })
      .then(d => {
        if (cancelled) return
        if (!d.token) throw new Error('No token returned')
        setToken(d.token)
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        setError(err.message || 'Something went wrong')
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="referrals-page">

      {/* ── Page heading ────────────────────────────────────────────────── */}
      <div style={{ marginTop: 24, marginBottom: 26 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.ink, letterSpacing: '-0.7px', lineHeight: 1.1 }}>
          Refer &amp; earn
        </h1>
        <p style={{ fontSize: 14, fontWeight: 500, color: C.ink55, marginTop: 6, lineHeight: 1.5, letterSpacing: '-0.005em', maxWidth: 680 }}>
          Recommend YTGrowth to other creators and earn{' '}
          <span style={{ fontWeight: 700, color: C.ink }}>30% recurring commission</span>{' '}
          on every payment they make, for as long as they stay subscribed.
        </p>
      </div>

      {/* ── Stats strip ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ ...CARD, padding: '18px 20px' }}>
            <p style={{ fontSize: 26, fontWeight: 800, color: C.red, letterSpacing: '-0.6px', lineHeight: 1.05, marginBottom: 7, fontVariantNumeric: 'tabular-nums' }}>{s.value}</p>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, letterSpacing: '-0.1px' }}>{s.label}</p>
            <p style={{ fontSize: 12, fontWeight: 450, color: C.ink55, marginTop: 3, lineHeight: 1.45 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <p className="ref-eyebrow" style={{ marginBottom: 12 }}>How it works</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {STEPS.map(step => (
          <div key={step.n} style={{ ...CARD, padding: '20px 22px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: '50%',
              background: C.tint, color: C.ink,
              fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
              marginBottom: 13,
            }}>{step.n}</span>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.ink, letterSpacing: '-0.3px', marginBottom: 6 }}>{step.title}</p>
            <p style={{ fontSize: 13, fontWeight: 450, color: C.ink70, lineHeight: 1.6, letterSpacing: '-0.005em' }}>{step.body}</p>
          </div>
        ))}
      </div>

      {/* ── Embed card ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <p className="ref-eyebrow">Your dashboard</p>
        <p style={{ fontSize: 12, fontWeight: 450, color: C.ink45, letterSpacing: '-0.005em' }}>Copy your link below to start sharing</p>
      </div>
      <div style={{ ...CARD, overflow: 'hidden' }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 600 }}>
            <div style={{ width: 28, height: 28, border: `2.5px solid ${C.hair}`, borderTop: `2.5px solid ${C.red}`, borderRadius: '50%', animation: 'referralsSpin 0.7s linear infinite' }} />
          </div>
        )}

        {!loading && error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 600, gap: 12, textAlign: 'center', padding: '0 24px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.redBg, border: `1px solid ${C.redBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.red }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>
              </svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.ink, letterSpacing: '-0.3px' }}>Couldn't load your affiliate dashboard</p>
            <p style={{ fontSize: 13, fontWeight: 450, color: C.ink55, maxWidth: 360, lineHeight: 1.6 }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: 4, padding: '8px 18px', borderRadius: 100, border: `1px solid rgba(10,10,15,0.10)`, background: '#fff', color: C.ink70, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(255,255,255,0.7)' }}
            >Try again</button>
          </div>
        )}

        {!loading && !error && token && (
          <iframe
            title="Affiliate dashboard"
            src={`https://affonso.io/embed/referrals?token=${encodeURIComponent(token)}&theme=light&lang=en`}
            style={{ width: '100%', height: 760, border: 'none', display: 'block' }}
            allow="clipboard-write"
          />
        )}
      </div>

      {/* ── Footnote ────────────────────────────────────────────────────── */}
      <p style={{ fontSize: 12, fontWeight: 450, color: C.ink45, marginTop: 16, marginBottom: 48, lineHeight: 1.6, textAlign: 'center', letterSpacing: '-0.005em' }}>
        Full program details on the{' '}
        <a href="/affiliate" target="_blank" rel="noopener noreferrer" style={{ color: C.ink70, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2 }}>public affiliate page</a>
        {' '}— earnings calculator, FAQ, comparisons.
      </p>
    </div>
  )
}
