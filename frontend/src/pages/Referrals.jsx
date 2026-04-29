import { useEffect, useState } from 'react'

/* ── Design tokens — strict palette matching Dashboard / Settings */
const C = {
  red:     '#e5251b', redBg:   '#fff5f5', redBdr:   '#fecaca',
  green:   '#16a34a', greenBg: '#f0fdf4', greenBdr: '#bbf7d0',
  amber:   '#d97706', amberBg: '#fffbeb', amberBdr: '#fde68a',
  text1:   '#111114',
  text2:   '#52525b',
  text3:   '#9595a4',
  border:  'rgba(0,0,0,0.09)',
  borderHex: '#e6e6ec',
  chipBg:  '#f4f4f6',
}

const CARD = {
  background:   '#ffffff',
  border:       `1px solid ${C.borderHex}`,
  borderRadius: 16,
  boxShadow:    '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
}

function useReferralsStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-referrals-fonts')) return
    const link = document.createElement('link')
    link.id = 'ytg-referrals-fonts'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
    document.head.appendChild(link)
    if (document.getElementById('ytg-referrals-styles')) return
    const style = document.createElement('style')
    style.id = 'ytg-referrals-styles'
    style.textContent = `
      .referrals-page, .referrals-page * { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
      .referrals-page p, .referrals-page span, .referrals-page div, .referrals-page h1 { margin: 0; }
      @keyframes referralsSpin { to { transform: rotate(360deg) } }
    `
    document.head.appendChild(style)
  }, [])
}

const STATS = [
  { value: '30%',    label: 'Recurring commission', sub: 'Every payment — not just the first' },
  { value: '30 days', label: 'Cookie window',        sub: 'Standard attribution window' },
  { value: '$50',    label: 'Payout minimum',       sub: 'Monthly via PayPal or bank' },
]

const STEPS = [
  { n: '01', title: 'Copy your link',     body: 'Grab your unique referral link from the dashboard below — anyone who signs up through it is tied to your account.' },
  { n: '02', title: 'Share it anywhere',  body: 'Drop it in a YouTube description, newsletter, tweet, community post, or pinned comment. Honest mentions convert best.' },
  { n: '03', title: 'Get paid monthly',   body: '30% of every payment your referrals make lands in your balance — month after month. Withdraw once you clear $50.' },
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

      {/* ── Page heading ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 4 }}>Refer & earn</h1>
        <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>
          Recommend YTGrowth to other creators and earn <span style={{ color: C.red, fontWeight: 700 }}>30% recurring commission</span> on every payment they make — for as long as they stay subscribed.
        </p>
      </div>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ ...CARD, padding: '18px 20px' }}>
            <p style={{ fontSize: 26, fontWeight: 800, color: C.red, letterSpacing: '-0.8px', lineHeight: 1.05, marginBottom: 6 }}>{s.value}</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, letterSpacing: '-0.2px' }}>{s.label}</p>
            <p style={{ fontSize: 12, color: C.text3, marginTop: 3, lineHeight: 1.45 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#a0a0b0', marginBottom: 10 }}>How it works</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 26 }}>
        {STEPS.map(step => (
          <div key={step.n} style={{ ...CARD, padding: '20px 22px' }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: C.red, letterSpacing: '0.06em', marginBottom: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{step.n}</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, letterSpacing: '-0.2px', marginBottom: 7 }}>{step.title}</p>
            <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>{step.body}</p>
          </div>
        ))}
      </div>

      {/* ── Embed card ────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#a0a0b0' }}>Your dashboard</p>
        <p style={{ fontSize: 12, color: C.text3 }}>Copy your link below to start sharing</p>
      </div>
      <div style={{ ...CARD, overflow: 'hidden' }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 600 }}>
            <div style={{ width: 28, height: 28, border: '2.5px solid #e5e7eb', borderTop: `2.5px solid ${C.red}`, borderRadius: '50%', animation: 'referralsSpin 0.7s linear infinite' }} />
          </div>
        )}

        {!loading && error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 600, gap: 12, textAlign: 'center', padding: '0 24px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 13, background: C.redBg, border: `1px solid ${C.redBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚠</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: C.text1, letterSpacing: '-0.3px' }}>Couldn't load your affiliate dashboard</p>
            <p style={{ fontSize: 13, color: C.text2, maxWidth: 360, lineHeight: 1.65 }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: 4, padding: '8px 18px', borderRadius: 100, border: `1px solid ${C.border}`, background: '#fff', color: C.text2, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
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

      {/* ── Footnote ──────────────────────────────────────────────────────── */}
      <p style={{ fontSize: 12, color: C.text3, marginTop: 14, lineHeight: 1.65, textAlign: 'center' }}>
        Full program details on the <a href="/affiliate" target="_blank" rel="noopener noreferrer" style={{ color: C.red, fontWeight: 600, textDecoration: 'none' }}>public affiliate page</a> — earnings calculator, FAQ, comparisons.
      </p>
    </div>
  )
}
