import { useEffect, useState } from 'react'

/* ── Design tokens — strict palette matching Dashboard / Settings */
const C = {
  red:     '#e5251b', redBg:   '#fff5f5', redBdr:   '#fecaca',
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
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 4 }}>Referrals</h1>
        <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>Your referral link · stats · rewards · 30% recurring on every payment</p>
      </div>

      {/* ── Embed card ────────────────────────────────────────────────────── */}
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
    </div>
  )
}
