import { useEffect, useState } from 'react'

/* ── Design tokens — exact match to Dashboard.jsx / SeoOptimizer.jsx ───── */
const C = {
  red:      '#e5251b', redBg:    '#fff5f5', redBdr:    '#fecaca',
  green:    '#059669', greenBg:  '#ecfdf5', greenBdr:  '#a7f3d0',
  amber:    '#d97706', amberBg:  '#fffbeb', amberBdr:  '#fde68a',
  text1:    '#0f0f13',
  text2:    '#4a4a58',
  text3:    '#9595a4',
  border:   '#e6e6ec',
  bg:       '#f5f5f9',
  surface:  '#ffffff',
}

const CARD = {
  background:   C.surface,
  border:       `1px solid ${C.border}`,
  borderRadius: 16,
  boxShadow:    '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06)',
}

const PAGE_SIZE_SIGNUPS = 8
const PAGE_SIZE_TOP     = 5

const COUNTRY_FLAGS = {
  "Afghanistan":"🇦🇫","Albania":"🇦🇱","Algeria":"🇩🇿","Argentina":"🇦🇷",
  "Australia":"🇦🇺","Austria":"🇦🇹","Bangladesh":"🇧🇩","Belgium":"🇧🇪",
  "Brazil":"🇧🇷","Canada":"🇨🇦","Chile":"🇨🇱","China":"🇨🇳",
  "Colombia":"🇨🇴","Croatia":"🇭🇷","Czech Republic":"🇨🇿","Denmark":"🇩🇰",
  "Egypt":"🇪🇬","Ethiopia":"🇪🇹","Finland":"🇫🇮","France":"🇫🇷",
  "Germany":"🇩🇪","Ghana":"🇬🇭","Greece":"🇬🇷","Hungary":"🇭🇺",
  "India":"🇮🇳","Indonesia":"🇮🇩","Iran":"🇮🇷","Iraq":"🇮🇶",
  "Ireland":"🇮🇪","Israel":"🇮🇱","Italy":"🇮🇹","Japan":"🇯🇵",
  "Jordan":"🇯🇴","Kenya":"🇰🇪","Malaysia":"🇲🇾","Mexico":"🇲🇽",
  "Morocco":"🇲🇦","Netherlands":"🇳🇱","New Zealand":"🇳🇿","Nigeria":"🇳🇬",
  "Norway":"🇳🇴","Pakistan":"🇵🇰","Peru":"🇵🇪","Philippines":"🇵🇭",
  "Poland":"🇵🇱","Portugal":"🇵🇹","Romania":"🇷🇴","Russia":"🇷🇺",
  "Saudi Arabia":"🇸🇦","Serbia":"🇷🇸","Singapore":"🇸🇬","South Africa":"🇿🇦",
  "South Korea":"🇰🇷","Spain":"🇪🇸","Sri Lanka":"🇱🇰","Sweden":"🇸🇪",
  "Switzerland":"🇨🇭","Taiwan":"🇹🇼","Tanzania":"🇹🇿","Thailand":"🇹🇭",
  "Turkey":"🇹🇷","Uganda":"🇺🇬","Ukraine":"🇺🇦","United Arab Emirates":"🇦🇪",
  "United Kingdom":"🇬🇧","United States":"🇺🇸","Venezuela":"🇻🇪",
  "Vietnam":"🇻🇳","Zimbabwe":"🇿🇼",
}

/* ── Styles ─────────────────────────────────────────────────────────────── */
function useAdminStyles() {
  useEffect(() => {
    if (!document.getElementById('ytg-admin-fonts')) {
      const link = document.createElement('link')
      link.id  = 'ytg-admin-fonts'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
      document.head.appendChild(link)
    }
    if (!document.getElementById('ytg-admin-styles')) {
      const style = document.createElement('style')
      style.id = 'ytg-admin-styles'
      style.textContent = `
        .adm, .adm * { font-family:'Inter',system-ui,sans-serif; -webkit-font-smoothing:antialiased; box-sizing:border-box; }
        .adm p,.adm span,.adm div,.adm h1,.adm h2,.adm h3 { margin:0; }
        .adm .num { font-variant-numeric:tabular-nums; }

        /* Stat card with subtle gradient accent line at the top edge */
        .adm-stat-card {
          background:#fff; border:1px solid #e6e6ec; border-radius:18px;
          padding:22px 24px 20px;
          box-shadow:0 1px 2px rgba(0,0,0,0.03),0 4px 14px rgba(0,0,0,0.05);
          transition:box-shadow 0.22s,transform 0.22s,border-color 0.22s;
          cursor:default; position:relative; overflow:hidden;
        }
        .adm-stat-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg, var(--adm-accent, #e5251b) 0%, var(--adm-accent, #e5251b) 40%, transparent 100%);
          opacity:0.0; transition:opacity 0.22s;
        }
        .adm-stat-card:hover {
          box-shadow:0 4px 12px rgba(0,0,0,0.08),0 16px 40px rgba(0,0,0,0.08);
          transform:translateY(-2px); border-color:#dadde3;
        }
        .adm-stat-card:hover::before { opacity:0.85; }

        /* Tiny corner-icon badge inside a stat card */
        .adm-stat-icon {
          width:30px; height:30px; border-radius:9px;
          display:flex; align-items:center; justify-content:center;
          background:#f4f4f7; color:#9595a4;
          transition:background 0.18s, color 0.18s;
        }
        .adm-stat-card:hover .adm-stat-icon { background:rgba(229,37,27,0.10); color:#e5251b; }

        /* Delta chip — replaces inline trend text */
        .adm-delta {
          display:inline-flex; align-items:center; gap:3px;
          padding:2px 8px; border-radius:100px;
          font-size:11px; font-weight:700; line-height:1;
          font-variant-numeric:tabular-nums; letter-spacing:-0.05px;
        }

        /* Section title block (replaces SectionLabel) */
        .adm-section-title {
          display:flex; align-items:center; gap:9px; margin-bottom:14px;
        }
        .adm-section-title h2 {
          font-size:15.5px; font-weight:700; color:#0f0f13; letter-spacing:-0.25px;
        }
        .adm-section-count {
          font-size:11px; font-weight:700; color:#9595a4;
          background:#f4f4f6; border:1px solid #ececef;
          padding:2px 8px; border-radius:100px;
          font-variant-numeric:tabular-nums;
        }
        .adm-section-sub {
          font-size:12.5px; color:#9595a4; font-weight:500;
        }

        /* Live indicator dot pulses softly */
        .adm-live-dot {
          width:7px; height:7px; border-radius:50%;
          background:#16a34a; flex-shrink:0;
          box-shadow:0 0 0 0 rgba(22,163,74,0.45);
          animation:admPulse 2.2s ease-in-out infinite;
        }

        .adm-row { transition:background 0.13s; }
        .adm-row:hover { background:#f8f8fb !important; }
        .adm-pg-btn { transition:background 0.13s,color 0.13s,border-color 0.13s; }
        .adm-pg-btn:not(:disabled):hover { background:#f4f4f8 !important; border-color:rgba(0,0,0,0.18) !important; color:#0f0f13 !important; }
        .adm-sec-btn { transition:all 0.18s; }
        .adm-sec-btn:hover { border-color:rgba(0,0,0,0.18) !important; color:#0f0f13 !important; box-shadow:0 2px 8px rgba(0,0,0,0.10),0 8px 28px rgba(0,0,0,0.10) !important; transform:translateY(-1px); }

        /* Empty state */
        .adm-empty { padding:48px 24px; text-align:center; }
        .adm-empty-icon {
          width:44px; height:44px; border-radius:12px;
          background:#f4f4f7; color:#9595a4;
          display:flex; align-items:center; justify-content:center;
          margin:0 auto 12px;
        }
        .adm-empty-text { font-size:13px; color:#9595a4; line-height:1.55; max-width:300px; margin:0 auto; }

        @keyframes admSpin { to { transform:rotate(360deg) } }
        @keyframes admPulse {
          0%,100% { box-shadow:0 0 0 0 rgba(22,163,74,0.45) }
          50%     { box-shadow:0 0 0 5px rgba(22,163,74,0) }
        }
        @keyframes admFade { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .adm-fade { animation:admFade 0.3s ease both; }
      `
      document.head.appendChild(style)
    }
  }, [])
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
function relTime(iso) {
  if (!iso) return '—'
  const d    = new Date(iso)
  const diff = Math.max(0, (Date.now() - d.getTime()) / 1000)
  if (diff < 60)         return 'just now'
  if (diff < 3600)       return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)      return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7)  return `${Math.floor(diff / 86400)}d ago`
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400 / 7)}w ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtNum(n) {
  if (n == null) return '0'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toLocaleString()
}

function planLabel(plan) {
  const map = {
    free: 'Free', solo: 'Solo', growth: 'Growth', agency: 'Agency',
    lifetime_solo: 'LT Solo', lifetime_growth: 'LT Growth',
    lifetime_agency: 'LT Agency', pack: 'Pack',
  }
  return map[plan] || plan || 'Free'
}

function planBadge(plan) {
  const p = (plan || '').toLowerCase()
  if (p.includes('agency'))   return { bg: C.redBg,    color: C.red,   bdr: C.redBdr }
  if (p.includes('growth'))   return { bg: C.greenBg,  color: C.green, bdr: C.greenBdr }
  if (p.includes('solo'))     return { bg: C.amberBg,  color: C.amber, bdr: C.amberBdr }
  if (p.includes('lifetime')) return { bg: C.greenBg,  color: C.green, bdr: C.greenBdr }
  if (p.includes('pack'))     return { bg: C.amberBg,  color: C.amber, bdr: C.amberBdr }
  return { bg: '#f4f4f6', color: C.text2, bdr: C.border }
}

/* plan bar accent: 3 tiers — paid plans get vivid green/amber/red, free is neutral */
function planBarAccent(plan) {
  const p = (plan || '').toLowerCase()
  if (p.includes('agency'))   return C.red
  if (p.includes('growth'))   return C.green
  if (p.includes('solo'))     return C.amber
  if (p.includes('lifetime')) return C.green
  if (p.includes('pack'))     return C.amber
  return '#d1d1d8'  // free → muted
}

/* ── Atoms ──────────────────────────────────────────────────────────────── */
function PlanBadge({ plan }) {
  const b = planBadge(plan)
  return (
    <span style={{
      display: 'inline-block',
      background: b.bg, color: b.color, border: `1px solid ${b.bdr}`,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
      padding: '3px 9px', borderRadius: 100, whiteSpace: 'nowrap',
    }}>{planLabel(plan)}</span>
  )
}

function Avatar({ src, name, size = 30 }) {
  const initial = (name || '?').trim()[0]?.toUpperCase() || '?'
  const fs = Math.round(size * 0.42)
  if (src) return (
    <img src={src} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `1px solid ${C.border}` }} />
  )
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#f0f0f4', color: C.text1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fs, fontWeight: 700, flexShrink: 0, border: `1px solid ${C.border}` }}>
      {initial}
    </div>
  )
}

/* ── Stat card — accent gradient on hover, icon corner, delta chip ─────── */
function Stat({ label, value, sub, accent, alert, icon, delta }) {
  const col = alert ? C.red : (accent || C.text1)
  const accentVar = accent || C.red
  return (
    <div className={`adm-stat-card${alert ? ' alert' : ''}`}
      style={{
        '--adm-accent': accentVar,
        ...(alert ? { borderColor: 'rgba(229,37,27,0.22)', background: '#fff8f8' } : {}),
      }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.text3 }}>{label}</p>
        {icon && <div className="adm-stat-icon">{icon}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, flexWrap: 'wrap' }}>
        <p className="num" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1.4px', color: col, lineHeight: 1 }}>{value}</p>
        {delta && (
          <span className="adm-delta" style={{
            color: delta.tone === 'up' ? C.green : delta.tone === 'down' ? C.red : C.text2,
            background: delta.tone === 'up' ? C.greenBg : delta.tone === 'down' ? C.redBg : '#f4f4f6',
            border: `1px solid ${delta.tone === 'up' ? C.greenBdr : delta.tone === 'down' ? C.redBdr : C.border}`,
          }}>
            <span style={{ fontSize: 9 }}>{delta.tone === 'up' ? '▲' : delta.tone === 'down' ? '▼' : '·'}</span>
            {delta.label}
          </span>
        )}
      </div>
      {sub && <p style={{ fontSize: 12, color: alert ? C.red : C.text3, fontWeight: 500, marginTop: 12, lineHeight: 1.5 }}>{sub}</p>}
    </div>
  )
}

/* ── Section header (replaces SectionLabel) — title + count + optional sub */
function SectionHeader({ title, count, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
      <div style={{ minWidth: 0 }}>
        <div className="adm-section-title">
          <h2>{title}</h2>
          {count != null && <span className="adm-section-count">{count}</span>}
        </div>
        {sub && <p className="adm-section-sub">{sub}</p>}
      </div>
      {right}
    </div>
  )
}

/* Backwards-compat: keep SectionLabel as an alias mapping to SectionHeader title */
function SectionLabel({ children }) {
  return <SectionHeader title={children} />
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
function EmptyState({ icon, children }) {
  return (
    <div className="adm-empty">
      {icon && <div className="adm-empty-icon">{icon}</div>}
      <p className="adm-empty-text">{children}</p>
    </div>
  )
}

/* ── Stat-card icons ─────────────────────────────────────────────────────── */
const Icons = {
  users: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="5" r="2.5"/>
      <path d="M1 12c0-2.2 1.8-4 4-4s4 1.8 4 4"/>
      <circle cx="10.5" cy="5.5" r="2"/>
      <path d="M13 11.5c0-1.7-1.1-3.1-2.5-3.45"/>
    </svg>
  ),
  paid: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="3" width="11" height="8" rx="1.5"/>
      <path d="M1.5 6h11"/>
      <path d="M3.5 9h2"/>
    </svg>
  ),
  trend: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1.5,9.5 5.5,5.5 8,8 12.5,3.5"/>
      <polyline points="9,3.5 12.5,3.5 12.5,7"/>
    </svg>
  ),
  bolt: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 1L2 8h4l-.5 5L11 6H7l.5-5z"/>
    </svg>
  ),
  inbox: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 11l3-7h8l3 7"/>
      <path d="M2 11h4l1 2h4l1-2h4v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/>
    </svg>
  ),
}

/* ── Bar row — green/amber accent palette ────────────────────────────────── */
function BarRow({ label, count, total, accent, prefix, muted }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: muted ? C.text3 : C.text2, display: 'flex', alignItems: 'center', gap: 7, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {prefix && <span style={{ fontSize: 15, flexShrink: 0 }}>{prefix}</span>}
          {label}
        </span>
        <span className="num" style={{ fontSize: 12.5, fontWeight: 700, color: muted ? C.text3 : C.text1, flexShrink: 0 }}>
          {fmtNum(count)}{' '}
          <span style={{ fontSize: 11, fontWeight: 500, color: C.text3 }}>· {pct.toFixed(0)}%</span>
        </span>
      </div>
      <div style={{ height: 6, background: '#f0f0f4', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: muted ? '#d1d1d8' : accent, borderRadius: 99, transition: 'width 0.7s cubic-bezier(0.34,1.56,0.64,1)', opacity: muted ? 0.5 : 1 }} />
      </div>
    </div>
  )
}

/* ── Pagination ─────────────────────────────────────────────────────────── */
function Pager({ page, total, onPage, pageSize = PAGE_SIZE_SIGNUPS }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null
  const btnStyle = (disabled) => ({
    padding: '5px 16px', borderRadius: 100,
    border: '1px solid rgba(0,0,0,0.1)',
    background: C.surface, color: disabled ? C.text3 : C.text2,
    fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.45 : 1,
    boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07)',
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderTop: `1px solid ${C.border}`, background: '#fafafc' }}>
      <button className="adm-pg-btn" disabled={page === 0} onClick={() => onPage(page - 1)} style={btnStyle(page === 0)}>← Prev</button>
      <span style={{ fontSize: 12, color: C.text3, fontWeight: 500 }}>Page <strong style={{ color: C.text1 }}>{page + 1}</strong> of {totalPages}</span>
      <button className="adm-pg-btn" disabled={page >= totalPages - 1} onClick={() => onPage(page + 1)} style={btnStyle(page >= totalPages - 1)}>Next →</button>
    </div>
  )
}

/* ── Table column header row ─────────────────────────────────────────────── */
function ColHeader({ cols }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: cols.map(c => c.w).join(' '),
      padding: '10px 24px', borderBottom: `1px solid ${C.border}`, background: '#fafafc',
    }}>
      {cols.map(c => (
        <div key={c.l} style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.text3, textAlign: c.r ? 'right' : 'left' }}>{c.l}</div>
      ))}
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function Admin() {
  useAdminStyles()
  const [data,       setData]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [signupPage, setSignupPage] = useState(0)
  const [topPage,    setTopPage]    = useState(0)

  // Feature requests
  const [frData,     setFrData]     = useState(null)
  const [frFilter,   setFrFilter]   = useState('all')  // all|new|planned|shipped|declined
  const [frExpanded, setFrExpanded] = useState(null)   // request id of opened body
  const [frBusy,     setFrBusy]     = useState(null)   // request id currently saving

  function loadFeatureRequests() {
    fetch('/feedback/admin/list', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setFrData(d) })
      .catch(() => {})
  }

  function setFrStatus(id, status) {
    setFrBusy(id)
    fetch(`/feedback/admin/${id}/status`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(() => loadFeatureRequests())
      .finally(() => setFrBusy(null))
  }

  useEffect(() => { loadFeatureRequests() }, [])

  function load(initial = false) {
    if (initial) setLoading(true); else setRefreshing(true)
    setError('')
    fetch('/admin/overview', { credentials: 'include' })
      .then(async r => {
        const body = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(body.error || `Error ${r.status}`)
        return body
      })
      .then(d => { setData(d); setLoading(false); setRefreshing(false); setSignupPage(0); setTopPage(0) })
      .catch(e => { setError(e.message); setLoading(false); setRefreshing(false) })
  }

  useEffect(() => { load(true) }, [])

  if (loading) return (
    <div className="adm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 14 }}>
      <div style={{ width: 28, height: 28, border: `2.5px solid ${C.border}`, borderTop: `2.5px solid ${C.red}`, borderRadius: '50%', animation: 'admSpin 0.7s linear infinite' }} />
      <p style={{ fontSize: 13, color: C.text3, fontWeight: 500 }}>Loading…</p>
    </div>
  )

  if (error) return (
    <div className="adm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: 13, background: C.redBg, border: `1px solid ${C.redBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚠</div>
      <p style={{ fontSize: 15, fontWeight: 700, color: C.text1 }}>{error}</p>
      <button onClick={() => load(true)} style={{ padding: '8px 20px', borderRadius: 100, border: `1px solid ${C.border}`, background: C.surface, color: C.text2, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Try again</button>
    </div>
  )

  const s             = data.stats
  const trendSub      = s.signups_prev_7d > 0 ? `vs ${s.signups_prev_7d} previous week` : 'no signups previous week'
  const totalForPlan  = data.plan_breakdown.reduce((a, r) => a + r.count, 0)
  const totalForUtm   = data.utm_breakdown.reduce((a, r) => a + r.count, 0)

  /* Country — always show; append "not tracked" for existing users */
  const knownCountries  = data.country_breakdown || []
  const unknownCount    = data.unknown_country_count ?? 0
  const countryTotal    = knownCountries.reduce((a, r) => a + r.count, 0) + unknownCount
  const countryRows     = unknownCount > 0
    ? [...knownCountries, { country: 'Not tracked yet', count: unknownCount, unknown: true }]
    : knownCountries

  const signupSlice     = data.recent_signups.slice(signupPage * PAGE_SIZE_SIGNUPS, (signupPage + 1) * PAGE_SIZE_SIGNUPS)
  const topSlice        = data.top_users.slice(topPage * PAGE_SIZE_TOP, (topPage + 1) * PAGE_SIZE_TOP)

  /* Source bar accents — cycle green / amber for visual variety */
  const UTM_ACCENTS = [C.green, C.amber, C.green, C.amber, C.green, C.amber]

  const SIGNUP_COLS = [
    { l: 'User',   w: '1fr' },
    { l: 'Plan',   w: '88px' },
    { l: 'Source', w: '96px' },
    { l: 'Joined', w: '76px', r: true },
  ]
  const TOP_COLS = [
    { l: 'Channel',    w: '1fr' },
    { l: 'Plan',       w: '88px' },
    { l: 'Usage',      w: '120px', r: true },
    { l: 'Subscribers',w: '90px',  r: true },
    { l: 'Last audit', w: '96px',  r: true },
  ]

  return (
    <div className="adm adm-fade">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text1, letterSpacing: '-0.7px', marginBottom: 8 }}>Admin</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.text3 }}>
            <span className="adm-live-dot" aria-hidden="true" />
            <span>{data.generated_at ? `Updated ${relTime(data.generated_at)}` : 'Live'}</span>
            <span style={{ color: C.border }}>·</span>
            <span style={{ color: C.text3, fontWeight: 500 }}>Internal · admin only</span>
          </div>
        </div>
        <button
          className="adm-sec-btn"
          disabled={refreshing}
          onClick={() => load(false)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 20px', borderRadius: 100, border: '1px solid rgba(0,0,0,0.1)',
            background: C.surface, color: C.text2, fontSize: 12.5, fontWeight: 600,
            cursor: refreshing ? 'wait' : 'pointer', fontFamily: 'inherit',
            boxShadow: '0 1px 3px rgba(0,0,0,0.07),0 4px 14px rgba(0,0,0,0.07)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: refreshing ? 'admSpin 0.7s linear infinite' : 'none' }}>
            <path d="M11 6.5a4.5 4.5 0 0 1-8 2.85M2 6.5a4.5 4.5 0 0 1 8-2.85"/>
            <path d="M11 1v3h-3M2 12V9h3"/>
          </svg>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Stat row — accent gradients + icons + delta chips ─────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16, marginBottom: 36 }}>
        <Stat
          label="Total users"
          value={fmtNum(s.total_users)}
          sub="All-time signups"
          icon={Icons.users}
        />
        <Stat
          label="Paid"
          value={fmtNum(s.paid_users)}
          accent={C.green}
          sub={`${fmtNum(s.free_users)} on free plan`}
          icon={Icons.paid}
          delta={s.conversion_pct > 0 ? { tone: 'up', label: `${s.conversion_pct}%` } : null}
        />
        <Stat
          label="Signups (7d)"
          value={fmtNum(s.signups_7d)}
          accent={s.signups_trend > 0 ? C.green : s.signups_trend < 0 ? C.red : C.amber}
          sub={trendSub}
          icon={Icons.trend}
          delta={s.signups_trend !== 0 ? {
            tone: s.signups_trend > 0 ? 'up' : 'down',
            label: `${s.signups_trend > 0 ? '+' : ''}${s.signups_trend}`,
          } : null}
        />
        <Stat
          label="Active (7d)"
          value={fmtNum(s.active_7d)}
          sub="Channels audited in last 7 days"
          icon={Icons.bolt}
        />
      </div>

      {/* ── Two-column body ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 20, marginBottom: 36 }}>

        {/* LEFT — Recent signups */}
        <div>
          <SectionHeader title="Recent signups" count={data.recent_signups.length} sub="The 40 most recent accounts" />
          <div style={{ ...CARD, overflow: 'hidden' }}>
            <ColHeader cols={SIGNUP_COLS} />

            {data.recent_signups.length === 0
              ? <EmptyState icon={Icons.users}>No signups yet. New accounts will appear here as soon as they OAuth in.</EmptyState>
              : signupSlice.map((u, i) => {
                  const name  = u.display_name || u.channel_name || u.email.split('@')[0]
                  const pic   = u.profile_picture || u.channel_thumbnail
                  const last  = i === signupSlice.length - 1
                  return (
                    <div key={u.email + i} className="adm-row" style={{
                      display: 'grid', gridTemplateColumns: SIGNUP_COLS.map(c => c.w).join(' '),
                      padding: '13px 24px', alignItems: 'center',
                      borderBottom: last ? 'none' : `1px solid ${C.border}`,
                    }}>
                      {/* User cell */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                        <Avatar src={pic} name={name} size={30} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text1, letterSpacing: '-0.15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                          <p style={{ fontSize: 11.5, color: C.text3, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                        </div>
                      </div>
                      <div><PlanBadge plan={u.plan} /></div>
                      <div style={{ fontSize: 12, color: u.utm_source ? C.text2 : C.text3, fontWeight: u.utm_source ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.utm_source || '(direct)'}
                      </div>
                      <div className="num" style={{ fontSize: 12, color: C.text3, textAlign: 'right' }}>{relTime(u.created_at)}</div>
                    </div>
                  )
                })
            }
            <Pager page={signupPage} total={data.recent_signups.length} onPage={setSignupPage} />
          </div>
        </div>

        {/* RIGHT — Plan + Source breakdowns */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* By plan */}
          <div>
            <SectionHeader title="By plan" sub="Active subscriptions split by tier" />
            <div style={{ ...CARD, padding: '22px 24px' }}>
              {data.plan_breakdown.length === 0
                ? <p style={{ fontSize: 13, color: C.text3 }}>No subscriptions yet.</p>
                : data.plan_breakdown.map(row => (
                    <BarRow key={row.plan}
                      label={planLabel(row.plan)}
                      count={row.count}
                      total={totalForPlan}
                      accent={planBarAccent(row.plan)}
                      muted={(row.plan || 'free') === 'free'}
                    />
                  ))
              }
            </div>
          </div>

          {/* By source */}
          <div>
            <SectionHeader title="By source" sub="Where signups came from (UTM-tagged + direct)" />
            <div style={{ ...CARD, padding: '22px 24px' }}>
              {data.utm_breakdown.length === 0
                ? <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.6 }}>Nothing tracked yet. Share a UTM-tagged link to start collecting attribution.</p>
                : data.utm_breakdown.map((row, i) => (
                    <BarRow key={row.source}
                      label={row.source}
                      count={row.count}
                      total={totalForUtm}
                      accent={UTM_ACCENTS[i % UTM_ACCENTS.length]}
                    />
                  ))
              }
            </div>
          </div>

        </div>
      </div>

      {/* ── Country breakdown — always visible ───────────────────────────── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader
          title="Users by country"
          count={(data.country_breakdown || []).length || null}
          sub="Resolved from signup IP via ip-api.com"
        />
        <div style={{ ...CARD, padding: '22px 24px' }}>
          {countryTotal === 0 ? (
            <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.6 }}>Country data is collected automatically on each new signup.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
              {countryRows.map(row => (
                <BarRow
                  key={row.country}
                  label={row.country}
                  count={row.count}
                  total={countryTotal}
                  accent={C.green}
                  prefix={row.unknown ? '🌍' : (COUNTRY_FLAGS[row.country] || '🌍')}
                  muted={!!row.unknown}
                />
              ))}
            </div>
          )}
          {unknownCount > 0 && knownCountries.length > 0 && (
            <p style={{ fontSize: 11.5, color: C.text3, marginTop: 16, lineHeight: 1.6 }}>
              ✦ Country detection started recently — {unknownCount.toLocaleString()} existing {unknownCount === 1 ? 'user' : 'users'} were signed up before tracking began.
            </p>
          )}
        </div>
      </div>

      {/* ── Top users by monthly usage (top 10, 5 per page) ──────────────── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader
          title="Top users this month"
          count={data.top_users.length}
          sub="Ranked by AI analyses run this billing cycle"
        />
        <div style={{ ...CARD, overflow: 'hidden' }}>
          <ColHeader cols={TOP_COLS} />
          {data.top_users.length === 0
            ? <EmptyState icon={Icons.bolt}>Nobody has run an analysis this month yet. The leaderboard fills as people use the product.</EmptyState>
            : topSlice.map((u, i) => {
                const usagePct = u.monthly_allowance > 0 ? Math.min(100, (u.monthly_used / u.monthly_allowance) * 100) : 0
                const barClr   = usagePct > 80 ? C.red : usagePct > 55 ? C.amber : C.green
                const last     = i === topSlice.length - 1
                return (
                  <div key={u.channel_id + i} className="adm-row" style={{
                    display: 'grid', gridTemplateColumns: TOP_COLS.map(c => c.w).join(' '),
                    padding: '13px 24px', alignItems: 'center',
                    borderBottom: last ? 'none' : `1px solid ${C.border}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                      <Avatar src={u.channel_thumbnail} name={u.channel_name} size={30} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text1, letterSpacing: '-0.15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.channel_name || '(unnamed)'}</p>
                        <p style={{ fontSize: 11.5, color: C.text3, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.owner_email}</p>
                      </div>
                    </div>
                    <div><PlanBadge plan={u.plan} /></div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="num" style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>{u.monthly_used}</span>
                      <span style={{ fontSize: 11, color: C.text3, fontWeight: 500 }}> / {u.monthly_allowance || '∞'}</span>
                      <div style={{ marginTop: 5, height: 4, background: '#f0f0f4', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${usagePct}%`, height: '100%', background: barClr, borderRadius: 99 }} />
                      </div>
                    </div>
                    <div className="num" style={{ fontSize: 12, color: C.text2, textAlign: 'right' }}>{fmtNum(u.subscribers)}</div>
                    <div className="num" style={{ fontSize: 12, color: C.text3, textAlign: 'right' }}>{relTime(u.last_audit_at)}</div>
                  </div>
                )
              })
          }
          <Pager page={topPage} total={data.top_users.length} onPage={setTopPage} pageSize={PAGE_SIZE_TOP} />
        </div>
      </div>

      {/* ── Feature requests ─────────────────────────────────────────────── */}
      {frData && (() => {
        const counts = frData.counts || {}
        const all    = frData.requests || []
        const filtered = frFilter === 'all' ? all : all.filter(r => r.status === frFilter)

        const FILTERS = [
          { key: 'all',      label: 'All',       count: all.length },
          { key: 'new',      label: 'New',       count: counts.new      || 0 },
          { key: 'planned',  label: 'Planned',   count: counts.planned  || 0 },
          { key: 'shipped',  label: 'Shipped',   count: counts.shipped  || 0 },
          { key: 'declined', label: 'Declined',  count: counts.declined || 0 },
        ]

        const statusStyle = (s) => {
          if (s === 'shipped')  return { c: C.green, bg: '#ecfdf5', b: '#a7f3d0', label: 'Shipped' }
          if (s === 'planned')  return { c: C.amber, bg: '#fffbeb', b: '#fde68a', label: 'Planned' }
          if (s === 'declined') return { c: C.text3, bg: '#f4f4f6', b: C.border,  label: 'Declined' }
          return                       { c: C.text2, bg: '#f4f4f6', b: C.border,  label: 'New' }
        }

        return (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader
              title="Feature requests"
              count={all.length}
              sub="Submitted via Settings or the /feedback share link"
              right={
                <span style={{ fontSize: 11, color: C.text3, fontWeight: 500 }}>
                  Share link: <code style={{ background: '#f4f4f6', border: `1px solid ${C.border}`, padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>/feedback</code>
                </span>
              }
            />

            {/* Filter chips */}
            <div style={{ display: 'flex', gap: 7, marginBottom: 12, flexWrap: 'wrap' }}>
              {FILTERS.map(f => {
                const active = frFilter === f.key
                return (
                  <button
                    key={f.key}
                    onClick={() => setFrFilter(f.key)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 13px', borderRadius: 100,
                      border: `1px solid ${active ? C.text2 : C.border}`,
                      background: active ? C.text1 : C.surface,
                      color: active ? '#fff' : C.text2,
                      fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {f.label}
                    <span style={{
                      fontSize: 10.5, fontWeight: 700,
                      background: active ? 'rgba(255,255,255,0.18)' : '#f4f4f6',
                      color: active ? '#fff' : C.text3,
                      padding: '1px 7px', borderRadius: 100,
                    }}>{f.count}</span>
                  </button>
                )
              })}
            </div>

            <div style={{ ...CARD, overflow: 'hidden' }}>
              {filtered.length === 0 ? (
                <EmptyState icon={Icons.inbox}>
                  {frFilter === 'all'
                    ? 'No feature requests yet. Share the /feedback link in an email to seed the first one.'
                    : `No requests with status "${frFilter}".`}
                </EmptyState>
              ) : (
                filtered.map((r, i) => {
                  const sty = statusStyle(r.status)
                  const open = frExpanded === r.id
                  const last = i === filtered.length - 1
                  const NEXT_STATUS = { new: 'planned', planned: 'shipped', shipped: 'declined', declined: 'new' }
                  return (
                    <div key={r.id} style={{ borderBottom: last ? 'none' : `1px solid ${C.border}` }}>
                      <div className="adm-row"
                        onClick={() => setFrExpanded(open ? null : r.id)}
                        style={{
                          padding: '14px 24px', display: 'flex', alignItems: 'flex-start', gap: 14,
                          cursor: 'pointer',
                        }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 3 }}>
                            <p style={{ fontSize: 13.5, fontWeight: 700, color: C.text1, letterSpacing: '-0.15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</p>
                            <span style={{
                              fontSize: 10, fontWeight: 700, color: sty.c, background: sty.bg,
                              border: `1px solid ${sty.b}`, padding: '2px 8px', borderRadius: 100,
                              letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0,
                            }}>{sty.label}</span>
                          </div>
                          <p style={{ fontSize: 11.5, color: C.text3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.display_name || r.email.split('@')[0]} · {r.email} · {relTime(r.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setFrStatus(r.id, NEXT_STATUS[r.status] || 'new') }}
                          disabled={frBusy === r.id}
                          style={{
                            padding: '5px 13px', borderRadius: 100,
                            border: `1px solid ${C.border}`, background: C.surface,
                            color: C.text2, fontSize: 11.5, fontWeight: 600,
                            cursor: frBusy === r.id ? 'wait' : 'pointer', fontFamily: 'inherit',
                            opacity: frBusy === r.id ? 0.55 : 1, flexShrink: 0,
                            whiteSpace: 'nowrap',
                          }}
                          title={`Move to ${NEXT_STATUS[r.status] || 'new'}`}
                        >
                          → {NEXT_STATUS[r.status] || 'new'}
                        </button>
                      </div>
                      {open && (
                        <div style={{ padding: '0 24px 16px', display: 'flex', gap: 12 }}>
                          <div style={{ flex: 1, padding: '13px 15px', background: '#fafafc', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, color: C.text2, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                            {r.description}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      })()}

    </div>
  )
}
