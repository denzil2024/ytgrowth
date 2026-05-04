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

const PAGE_SIZE = 8

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
        .adm p,.adm span,.adm div,.adm h1,.adm h2 { margin:0; }
        .adm .num { font-variant-numeric:tabular-nums; }
        .adm-stat-card {
          background:#fff; border:1px solid #e6e6ec; border-radius:16px;
          padding:22px 24px;
          box-shadow:0 1px 2px rgba(0,0,0,0.04),0 4px 14px rgba(0,0,0,0.06);
          transition:box-shadow 0.2s,transform 0.2s; cursor:default;
        }
        .adm-stat-card:hover {
          box-shadow:0 4px 12px rgba(0,0,0,0.08),0 16px 40px rgba(0,0,0,0.09);
          transform:translateY(-2px);
        }
        .adm-row { transition:background 0.13s; }
        .adm-row:hover { background:#f4f4f7 !important; }
        .adm-pg-btn { transition:background 0.13s,color 0.13s,border-color 0.13s; }
        .adm-pg-btn:not(:disabled):hover { background:#f4f4f8 !important; border-color:rgba(0,0,0,0.18) !important; color:#0f0f13 !important; }
        .adm-sec-btn { transition:all 0.18s; }
        .adm-sec-btn:hover { border-color:rgba(0,0,0,0.18) !important; color:#0f0f13 !important; box-shadow:0 2px 8px rgba(0,0,0,0.10),0 8px 28px rgba(0,0,0,0.10) !important; transform:translateY(-1px); }
        @keyframes admSpin { to{transform:rotate(360deg)} }
        @keyframes admFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
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

/* ── Stat card — matches Dashboard Stat exactly ─────────────────────────── */
function Stat({ label, value, sub, accent, alert }) {
  const col = alert ? C.red : (accent || C.text1)
  return (
    <div className={`adm-stat-card${alert ? ' alert' : ''}`}
      style={alert ? { borderColor: 'rgba(229,37,27,0.22)', background: '#fff8f8' } : {}}>
      <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.text3, marginBottom: 12 }}>{label}</p>
      <p className="num" style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-1.4px', color: col, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: alert ? C.red : C.text3, fontWeight: 500, marginTop: 10 }}>{sub}</p>}
    </div>
  )
}

/* ── Section label — matches Dashboard h2 sub-label exactly ─────────────── */
function SectionLabel({ children }) {
  return <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.text3, marginBottom: 12 }}>{children}</p>
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
function Pager({ page, total, onPage }) {
  const totalPages = Math.ceil(total / PAGE_SIZE)
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

  function load(initial = false) {
    if (initial) setLoading(true); else setRefreshing(true)
    setError('')
    fetch('/admin/overview', { credentials: 'include' })
      .then(async r => {
        const body = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(body.error || `Error ${r.status}`)
        return body
      })
      .then(d => { setData(d); setLoading(false); setRefreshing(false); setSignupPage(0) })
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

  const signupSlice     = data.recent_signups.slice(signupPage * PAGE_SIZE, (signupPage + 1) * PAGE_SIZE)

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
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 6 }}>Admin</h1>
          <p style={{ fontSize: 13, color: C.text3 }}>
            {data.generated_at ? `Last updated ${relTime(data.generated_at)}` : 'Live'}
          </p>
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

      {/* ── Stat row — mirrors Dashboard Overview exactly ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16, marginBottom: 32 }}>
        <Stat label="Total users"  value={fmtNum(s.total_users)}  sub="All-time signups" />
        <Stat label="Paid"         value={fmtNum(s.paid_users)}   accent={C.green}
              sub={`${s.conversion_pct}% conversion · ${fmtNum(s.free_users)} free`} />
        <Stat label="Signups (7d)" value={fmtNum(s.signups_7d)}
              accent={s.signups_trend > 0 ? C.green : s.signups_trend < 0 ? C.red : C.amber}
              sub={trendSub} />
        <Stat label="Active (7d)"  value={fmtNum(s.active_7d)}    sub="Channels audited in last 7 days" />
      </div>

      {/* ── Two-column body ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 20, marginBottom: 32 }}>

        {/* LEFT — Recent signups */}
        <div>
          <SectionLabel>Recent signups</SectionLabel>
          <div style={{ ...CARD, overflow: 'hidden' }}>
            <ColHeader cols={SIGNUP_COLS} />

            {data.recent_signups.length === 0
              ? <div style={{ padding: '40px 24px', textAlign: 'center', fontSize: 13, color: C.text3 }}>No signups yet.</div>
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
            <SectionLabel>By plan</SectionLabel>
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
            <SectionLabel>By source</SectionLabel>
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
      <div style={{ marginBottom: 32 }}>
        <SectionLabel>Users by country</SectionLabel>
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

      {/* ── Top 5 users by monthly usage ─────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <SectionLabel>Top users this month</SectionLabel>
        <div style={{ ...CARD, overflow: 'hidden' }}>
          <ColHeader cols={TOP_COLS} />
          {data.top_users.length === 0
            ? <div style={{ padding: '40px 24px', textAlign: 'center', fontSize: 13, color: C.text3 }}>Nobody has run an analysis this month yet.</div>
            : data.top_users.map((u, i) => {
                const usagePct = u.monthly_allowance > 0 ? Math.min(100, (u.monthly_used / u.monthly_allowance) * 100) : 0
                const barClr   = usagePct > 80 ? C.red : usagePct > 55 ? C.amber : C.green
                const last     = i === data.top_users.length - 1
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
        </div>
      </div>

    </div>
  )
}
