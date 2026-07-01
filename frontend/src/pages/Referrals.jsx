import { useEffect, useState } from 'react'

/* ── Design tokens, Competitors / Settings north-star ─────────────────── */
const C = {
  red:      '#c9a030',
  redHi:    '#d4af3f',
  redBg:    'rgba(201,160,48,0.05)',
  redBdr:   'rgba(201,160,48,0.18)',
  green:    '#16a34a',
  ink:      'var(--yd-paper)',
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
  boxShadow:    '0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(20,19,15,0.7)',
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
        font-family: 'Barlow','Inter',system-ui,sans-serif;
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

const COMMISSION = 0.30 // 30% recurring
const TIERS = [
  { name: 'Solo',   price: 19 },
  { name: 'Growth', price: 49 },
  { name: 'Agency', price: 149 },
]
const PER_REFERRAL = 49 * COMMISSION  // Growth-plan assumption, captioned
const REF_OPTIONS = [1, 3, 5]

/* Lightweight area-line chart in the Feed's red-gradient grammar.
   12 monthly points; recurring income stacks linearly as referrals
   accumulate (no fake exponential). */
function ProjectionChart({ perMonth }) {
  const W = 1000, H = 150
  const months = 12
  const pts = Array.from({ length: months }, (_, i) => perMonth * (i + 1) * PER_REFERRAL)
  const max = pts[pts.length - 1] || 1
  const x = (i) => (i / (months - 1)) * W
  const y = (v) => H - (v / max) * (H - 10) - 4
  const line = pts.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = `M0,${H} L ${pts.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' L ')} L ${W},${H} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 150, display: 'block' }}>
      <defs>
        <linearGradient id="ref-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(201,160,48,0.18)" />
          <stop offset="100%" stopColor="rgba(201,160,48,0)" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#ref-fill)" />
      <polyline points={line} fill="none" stroke="#c9a030" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={x(months - 1)} cy={y(pts[pts.length - 1])} r="4.5" fill="#c9a030" />
    </svg>
  )
}

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
  const [refsPerMonth, setRefsPerMonth] = useState(3)

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

      {/* ── Earning potential, the lure ────────────────────────────────── */}
      {(() => {
        const headline = Math.round(refsPerMonth * 12 * PER_REFERRAL)
        return (
          <div style={{ ...CARD, padding: '22px 24px 20px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <p className="ref-eyebrow" style={{ marginBottom: 8 }}>Your earning potential</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.7px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  ${headline.toLocaleString()}<span style={{ fontSize: 15, fontWeight: 600, color: C.ink55, letterSpacing: '-0.1px' }}> /mo recurring by month 12</span>
                </p>
                <p style={{ fontSize: 12, fontWeight: 400, color: C.ink45, marginTop: 6, lineHeight: 1.5 }}>
                  Illustrative. Assumes the Growth plan ($49/mo) and that referrals stay subscribed.
                </p>
              </div>
              {/* Quiet soft-grey segmented toggle, referrals per month */}
              <div style={{ display: 'inline-flex', gap: 4, padding: 3, background: 'rgba(10,10,15,0.04)', borderRadius: 100, flexShrink: 0 }}>
                {REF_OPTIONS.map(n => {
                  const active = n === refsPerMonth
                  return (
                    <button key={n} onClick={() => setRefsPerMonth(n)} style={{
                      padding: '6px 14px', borderRadius: 100, border: 'none', cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, letterSpacing: '-0.01em',
                      background: active ? '#ffffff' : 'transparent',
                      color: active ? C.ink : C.ink55,
                      boxShadow: active ? '0 1px 2px rgba(15,15,25,0.06)' : 'none',
                      transition: 'background 0.15s, color 0.15s',
                    }}>{n}/mo</button>
                  )
                })}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <ProjectionChart perMonth={refsPerMonth} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: C.ink45 }}>Month 1</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: C.ink45 }}>Month 12</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.hair}` }}>
              {[
                ['30%', 'recurring commission'],
                ['30-day', 'cookie window'],
                ['$50', 'payout minimum'],
                ['Monthly', 'PayPal or bank'],
              ].map(([v, l]) => (
                <span key={l} style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>{v}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 400, color: C.ink55 }}>{l}</span>
                </span>
              ))}
            </div>
          </div>
        )
      })()}

      {/* ── What each referral is worth, per-tier bars ─────────────────── */}
      <p className="ref-eyebrow" style={{ marginBottom: 12 }}>What each referral is worth</p>
      <div style={{ ...CARD, padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 28, height: 150 }}>
          {TIERS.map(t => {
            const monthly = t.price * COMMISSION
            const maxMonthly = TIERS[TIERS.length - 1].price * COMMISSION
            const h = Math.max(8, (monthly / maxMonthly) * 116)
            return (
              <div key={t.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: C.ink, letterSpacing: '-0.3px', fontVariantNumeric: 'tabular-nums', marginBottom: 8 }}>
                  ${monthly.toFixed(2)}<span style={{ fontSize: 11.5, fontWeight: 600, color: C.ink45 }}>/mo</span>
                </span>
                <div style={{
                  width: '100%', maxWidth: 120, height: h, borderRadius: '8px 8px 0 0',
                  background: `linear-gradient(180deg, ${C.redHi} 0%, ${C.red} 100%)`,
                  boxShadow: 'inset 0 1px 0 rgba(20,19,15,0.2)',
                }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginTop: 10 }}>{t.name}</span>
                <span style={{ fontSize: 12, fontWeight: 400, color: C.ink45, marginTop: 2 }}>${t.price}/mo plan</span>
              </div>
            )
          })}
        </div>
        <p style={{ fontSize: 12, fontWeight: 400, color: C.ink55, marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.hair}`, lineHeight: 1.5 }}>
          Recurring monthly commission per referred creator. One Agency referral clears the $50 payout minimum in about two months.
        </p>
      </div>
      <div style={{ height: 28 }} />

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
            <p style={{ fontSize: 13, fontWeight: 400, color: C.ink70, lineHeight: 1.6, letterSpacing: '-0.005em' }}>{step.body}</p>
          </div>
        ))}
      </div>

      {/* ── Embed card ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <p className="ref-eyebrow">Your dashboard</p>
        <p style={{ fontSize: 12, fontWeight: 400, color: C.ink45, letterSpacing: '-0.005em' }}>Copy your link below to start sharing</p>
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
            <p style={{ fontSize: 13, fontWeight: 400, color: C.ink55, maxWidth: 360, lineHeight: 1.6 }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: 4, padding: '8px 18px', borderRadius: 100, border: `1px solid rgba(10,10,15,0.10)`, background: '#fff', color: C.ink70, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(20,19,15,0.7)' }}
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
      <p style={{ fontSize: 12, fontWeight: 400, color: C.ink45, marginTop: 16, marginBottom: 48, lineHeight: 1.6, textAlign: 'center', letterSpacing: '-0.005em' }}>
        Full program details on the{' '}
        <a href="/affiliate" target="_blank" rel="noopener noreferrer" style={{ color: C.ink70, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2 }}>public affiliate page</a>
        {' '}has the earnings calculator, FAQ, and plan comparisons.
      </p>
    </div>
  )
}
