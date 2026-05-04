import { useEffect, useState } from 'react'

/* ── Design tokens — strict palette matching Dashboard / Settings ──────── */
const C = {
  red:      '#e5251b', redBg:    '#fff5f5', redBdr:    '#fecaca',
  green:    '#16a34a', greenBg:  '#f0fdf4', greenBdr:  '#bbf7d0',
  amber:    '#d97706', amberBg:  '#fffbeb', amberBdr:  '#fde68a',
  blue:     '#2563eb', blueBg:   '#eff6ff', blueBdr:   '#bfdbfe',
  purple:   '#7c3aed', purpleBg: '#f5f3ff', purpleBdr: '#ddd6fe',
  text1:    '#111114',
  text2:    '#52525b',
  text3:    '#9595a4',
  text4:    '#c0c0cc',
  border:   'rgba(0,0,0,0.09)',
  borderHex:'#e6e6ec',
  chipBg:   '#f4f4f6',
  pageBg:   '#f5f5f9',
}

const CARD = {
  background:   '#ffffff',
  border:       `1px solid ${C.borderHex}`,
  borderRadius: 16,
  boxShadow:    '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
}

const PAGE_SIZE = 10

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
      link.id = 'ytg-admin-fonts'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
      document.head.appendChild(link)
    }
    if (!document.getElementById('ytg-admin-styles')) {
      const style = document.createElement('style')
      style.id = 'ytg-admin-styles'
      style.textContent = `
        .admin-page, .admin-page * { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        .admin-page p, .admin-page span, .admin-page div, .admin-page h1, .admin-page h2 { margin: 0; }
        .admin-page .num { font-variant-numeric: tabular-nums; }
        .admin-row { transition: background 0.13s; }
        .admin-row:hover { background: #f7f7fb !important; }
        .admin-stat-card { transition: box-shadow 0.18s, transform 0.18s; cursor: default; }
        .admin-stat-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.09) !important; transform: translateY(-2px); }
        .admin-pg-btn { transition: background 0.13s, color 0.13s, border-color 0.13s; }
        .admin-pg-btn:not(:disabled):hover { background: #f0f0f5 !important; border-color: #c8c8d4 !important; color: #111114 !important; }
        .admin-refresh-btn { transition: color 0.15s, border-color 0.15s, background 0.15s; }
        .admin-refresh-btn:hover { color: #111114 !important; border-color: #9595a4 !important; background: #f7f7fb !important; }
        @keyframes adminSpin { to { transform: rotate(360deg) } }
        @keyframes adminFade { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        .admin-fade { animation: adminFade 0.28s ease both; }
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

function planBadgeColors(plan) {
  const p = (plan || '').toLowerCase()
  if (p.includes('agency'))   return { bg: C.redBg,    color: C.red,    bdr: C.redBdr }
  if (p.includes('growth'))   return { bg: C.greenBg,  color: C.green,  bdr: C.greenBdr }
  if (p.includes('solo'))     return { bg: C.amberBg,  color: C.amber,  bdr: C.amberBdr }
  if (p.includes('lifetime')) return { bg: C.purpleBg, color: C.purple, bdr: C.purpleBdr }
  if (p.includes('pack'))     return { bg: C.blueBg,   color: C.blue,   bdr: C.blueBdr }
  return { bg: C.chipBg, color: C.text2, bdr: C.border }
}

function planLabel(plan) {
  const map = {
    free: 'Free', solo: 'Solo', growth: 'Growth', agency: 'Agency',
    lifetime_solo: 'LT Solo', lifetime_growth: 'LT Growth',
    lifetime_agency: 'LT Agency', pack: 'Pack',
  }
  return map[plan] || plan || 'Free'
}

/* ── Shared UI atoms ────────────────────────────────────────────────────── */
function PlanBadge({ plan }) {
  const c = planBadgeColors(plan)
  return (
    <span style={{
      display: 'inline-block',
      background: c.bg, color: c.color, border: `1px solid ${c.bdr}`,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
      padding: '3px 9px', borderRadius: 100, whiteSpace: 'nowrap',
    }}>{planLabel(plan)}</span>
  )
}

function Avatar({ src, name, size = 32 }) {
  const fs      = Math.round(size * 0.42)
  const initial = (name || '?').trim()[0]?.toUpperCase() || '?'
  if (src) {
    return <img src={src} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `1px solid ${C.border}` }} />
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: C.chipBg, color: C.text1,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: fs, fontWeight: 700, flexShrink: 0, border: `1px solid ${C.border}`,
    }}>{initial}</div>
  )
}

function SectionHeader({ label, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.text3 }}>{label}</p>
      {count != null && (
        <span style={{ fontSize: 10, fontWeight: 700, color: C.text3, background: C.chipBg, border: `1px solid ${C.borderHex}`, padding: '1px 7px', borderRadius: 100 }}>{count}</span>
      )}
    </div>
  )
}

/* ── Stat card ──────────────────────────────────────────────────────────── */
function StatCard({ label, value, sub, trend, accent, icon }) {
  const trendColor = trend == null ? null : trend > 0 ? C.green : trend < 0 ? C.red : C.text3
  const trendSign  = trend == null ? null : trend > 0 ? '↑' : trend < 0 ? '↓' : '·'
  const trendText  = trend == null ? null : trend > 0 ? `+${trend}` : `${trend}`
  return (
    <div className="admin-stat-card" style={{ ...CARD, padding: '20px 22px', borderTop: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.text3 }}>{label}</p>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
        <p className="num" style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.8px', color: C.text1, lineHeight: 1 }}>{value}</p>
        {trendText != null && (
          <span className="num" style={{ fontSize: 11, fontWeight: 700, color: trendColor, background: `${trendColor}14`, padding: '2px 8px', borderRadius: 100 }}>
            {trendSign} {trendText}
          </span>
        )}
      </div>
      {sub && <p style={{ marginTop: 8, fontSize: 12, color: C.text3, lineHeight: 1.55 }}>{sub}</p>}
    </div>
  )
}

/* ── Bar row (plan / source / country breakdowns) ───────────────────────── */
function BarRow({ label, count, total, accent, prefix }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: C.text2, letterSpacing: '-0.1px', display: 'flex', alignItems: 'center', gap: 6 }}>
          {prefix && <span style={{ fontSize: 16, lineHeight: 1 }}>{prefix}</span>}
          {label}
        </span>
        <span className="num" style={{ fontSize: 13, fontWeight: 700, color: C.text1, flexShrink: 0 }}>
          {fmtNum(count)} <span style={{ fontSize: 11, color: C.text3, fontWeight: 500 }}>· {pct.toFixed(0)}%</span>
        </span>
      </div>
      <div style={{ height: 5, background: '#f0f0f4', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: accent, borderRadius: 99, transition: 'width 0.7s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </div>
    </div>
  )
}

/* ── Pagination control ─────────────────────────────────────────────────── */
function Pagination({ page, total, onPage }) {
  const totalPages = Math.ceil(total / PAGE_SIZE)
  if (totalPages <= 1) return null
  const atStart = page === 0
  const atEnd   = page >= totalPages - 1
  const btnBase = {
    padding: '5px 14px', borderRadius: 100, border: `1px solid ${C.borderHex}`,
    background: '#ffffff', fontSize: 12, fontWeight: 600,
    fontFamily: 'inherit', cursor: 'pointer',
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 20px', borderTop: `1px solid ${C.borderHex}`, background: '#fafafc' }}>
      <button className="admin-pg-btn" onClick={() => onPage(page - 1)} disabled={atStart}
        style={{ ...btnBase, color: atStart ? C.text4 : C.text2, opacity: atStart ? 0.5 : 1 }}>
        ← Prev
      </button>
      <span style={{ fontSize: 12, color: C.text3, fontWeight: 500 }}>
        Page <strong style={{ color: C.text1 }}>{page + 1}</strong> of {totalPages}
      </span>
      <button className="admin-pg-btn" onClick={() => onPage(page + 1)} disabled={atEnd}
        style={{ ...btnBase, color: atEnd ? C.text4 : C.text2, opacity: atEnd ? 0.5 : 1 }}>
        Next →
      </button>
    </div>
  )
}

/* ── Table header row ───────────────────────────────────────────────────── */
function THead({ cols }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: cols.map(c => c.w).join(' '),
      padding: '11px 20px', borderBottom: `1px solid ${C.borderHex}`,
      background: '#fafafc',
    }}>
      {cols.map(c => (
        <div key={c.label} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.text3, textAlign: c.align || 'left' }}>{c.label}</div>
      ))}
    </div>
  )
}

/* ── SVG icons for stat cards ───────────────────────────────────────────── */
const Icons = {
  users:   <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="4.5" r="2"/><path d="M1 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"/><circle cx="11" cy="5" r="1.5"/><path d="M13.5 13c0-1.8-1.2-3-2.5-3.2"/></svg>,
  paid:    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="3.5" width="12" height="9" rx="2"/><path d="M1.5 7h12"/><path d="M5 10h2"/></svg>,
  signups: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 10.5L5 6.5L8 9L14 3"/><path d="M10 3h4v4"/></svg>,
  active:  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 11l3-4 3 3 2.5-5L13 9"/><circle cx="13" cy="9" r="1" fill="currentColor" stroke="none"/></svg>,
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

  function load(initial = false) {
    if (initial) setLoading(true)
    else         setRefreshing(true)
    setError('')
    fetch('/admin/overview', { credentials: 'include' })
      .then(async r => {
        const body = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(body.error || `Could not load admin data (${r.status})`)
        return body
      })
      .then(d => { setData(d); setLoading(false); setRefreshing(false); setSignupPage(0); setTopPage(0) })
      .catch(e => { setError(e.message); setLoading(false); setRefreshing(false) })
  }

  useEffect(() => { load(true) }, [])

  /* Loading */
  if (loading) {
    return (
      <div className="admin-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 28, height: 28, border: `2.5px solid ${C.borderHex}`, borderTop: `2.5px solid ${C.red}`, borderRadius: '50%', animation: 'adminSpin 0.7s linear infinite' }} />
          <p style={{ fontSize: 13, color: C.text3, fontWeight: 500 }}>Loading admin data…</p>
        </div>
      </div>
    )
  }

  /* Error */
  if (error) {
    return (
      <div className="admin-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 13, background: C.redBg, border: `1px solid ${C.redBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚠</div>
        <p style={{ fontSize: 16, fontWeight: 700, color: C.text1 }}>{error}</p>
        <button onClick={() => load(true)} style={{ marginTop: 4, padding: '8px 18px', borderRadius: 100, border: `1px solid ${C.border}`, background: '#fff', color: C.text2, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Try again</button>
      </div>
    )
  }

  const s            = data.stats
  const totalForPlan = data.plan_breakdown.reduce((sum, r) => sum + r.count, 0)
  const totalForUtm  = data.utm_breakdown.reduce((sum, r) => sum + r.count, 0)
  const totalForCtry = (data.country_breakdown || []).reduce((sum, r) => sum + r.count, 0)
  const trendSub     = s.signups_prev_7d > 0 ? `vs ${s.signups_prev_7d} previous week` : 'no signups previous week'

  const signupSlice  = data.recent_signups.slice(signupPage * PAGE_SIZE, (signupPage + 1) * PAGE_SIZE)
  const topSlice     = data.top_users.slice(topPage * PAGE_SIZE, (topPage + 1) * PAGE_SIZE)

  const SIGNUP_COLS = [
    { label: 'User',    w: '1.7fr' },
    { label: 'Plan',    w: '90px' },
    { label: 'Source',  w: '100px' },
    { label: 'Joined',  w: '80px', align: 'right' },
  ]
  const TOP_COLS = [
    { label: 'Channel',    w: '1.6fr' },
    { label: 'Plan',       w: '90px' },
    { label: 'Usage',      w: '110px', align: 'right' },
    { label: 'Subs',       w: '80px',  align: 'right' },
    { label: 'Last audit', w: '100px', align: 'right' },
  ]

  return (
    <div className="admin-page admin-fade">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px' }}>Admin</h1>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.red, background: C.redBg, border: `1px solid ${C.redBdr}`, padding: '3px 9px', borderRadius: 100 }}>Internal</span>
          </div>
          <p style={{ fontSize: 13, color: C.text3 }}>
            {data.generated_at ? `Last refreshed ${relTime(data.generated_at)}` : 'Live data'}
          </p>
        </div>
        <button
          className="admin-refresh-btn"
          onClick={() => load(false)}
          disabled={refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 16px', borderRadius: 100,
            border: `1px solid ${C.borderHex}`, background: '#fff',
            color: C.text2, fontSize: 13, fontWeight: 600,
            cursor: refreshing ? 'wait' : 'pointer', fontFamily: 'inherit',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: refreshing ? 'adminSpin 0.7s linear infinite' : 'none' }}>
            <path d="M11 6.5a4.5 4.5 0 0 1-8 2.85M2 6.5a4.5 4.5 0 0 1 8-2.85"/>
            <path d="M11 1v3h-3M2 12V9h3"/>
          </svg>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        <StatCard
          label="Total users"    value={fmtNum(s.total_users)}
          sub="All-time signups" accent={C.blue}
          icon={<span style={{ color: C.blue }}>{Icons.users}</span>}
        />
        <StatCard
          label="Paid"           value={fmtNum(s.paid_users)}
          sub={`${s.conversion_pct}% conversion · ${fmtNum(s.free_users)} free`}
          accent={C.green}
          icon={<span style={{ color: C.green }}>{Icons.paid}</span>}
        />
        <StatCard
          label="Signups (7d)"  value={fmtNum(s.signups_7d)}
          sub={trendSub}        trend={s.signups_trend}
          accent={C.amber}
          icon={<span style={{ color: C.amber }}>{Icons.signups}</span>}
        />
        <StatCard
          label="Active (7d)"   value={fmtNum(s.active_7d)}
          sub="Channels audited in last 7 days"
          accent={C.purple}
          icon={<span style={{ color: C.purple }}>{Icons.active}</span>}
        />
      </div>

      {/* ── Two-column body ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 20, marginBottom: 28 }}>

        {/* LEFT — Recent signups (paginated) */}
        <div>
          <SectionHeader label="Recent signups" count={data.recent_signups.length} />
          <div style={{ ...CARD, overflow: 'hidden' }}>
            <THead cols={SIGNUP_COLS} />
            {data.recent_signups.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 13, color: C.text3 }}>No signups yet.</div>
            ) : (
              signupSlice.map((u, i) => {
                const name = u.display_name || u.channel_name || u.email.split('@')[0]
                const pic  = u.profile_picture || u.channel_thumbnail
                const isLast = i === signupSlice.length - 1
                return (
                  <div key={u.email + i} className="admin-row" style={{
                    display: 'grid', gridTemplateColumns: SIGNUP_COLS.map(c => c.w).join(' '),
                    padding: '11px 20px', alignItems: 'center',
                    borderBottom: isLast ? 'none' : `1px solid ${C.borderHex}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <Avatar src={pic} name={name} size={30} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.text1, letterSpacing: '-0.15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                        <p style={{ fontSize: 11.5, color: C.text3, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                      </div>
                    </div>
                    <div><PlanBadge plan={u.plan} /></div>
                    <div style={{ fontSize: 12, color: u.utm_source ? C.text2 : C.text4, fontWeight: u.utm_source ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.utm_source || '(direct)'}
                    </div>
                    <div className="num" style={{ fontSize: 12, color: C.text3, textAlign: 'right' }}>{relTime(u.created_at)}</div>
                  </div>
                )
              })
            )}
            <Pagination page={signupPage} total={data.recent_signups.length} onPage={setSignupPage} />
          </div>
        </div>

        {/* RIGHT — Plan + UTM breakdowns */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <SectionHeader label="By plan" />
            <div style={{ ...CARD, padding: '20px 22px' }}>
              {data.plan_breakdown.length === 0 && (
                <p style={{ fontSize: 13, color: C.text3 }}>No subscriptions yet.</p>
              )}
              {data.plan_breakdown.map(row => (
                <BarRow key={row.plan} label={planLabel(row.plan)} count={row.count} total={totalForPlan} accent={planBadgeColors(row.plan).color} />
              ))}
            </div>
          </div>

          <div>
            <SectionHeader label="By source" />
            <div style={{ ...CARD, padding: '20px 22px' }}>
              {data.utm_breakdown.length === 0 && (
                <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.6 }}>Nothing tracked yet — share a UTM-tagged link to start collecting attribution.</p>
              )}
              {data.utm_breakdown.map(row => (
                <BarRow key={row.source} label={row.source} count={row.count} total={totalForUtm} accent={C.text2} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Country breakdown ─────────────────────────────────────────────── */}
      {(data.country_breakdown || []).length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionHeader label="Users by country" count={(data.country_breakdown || []).length} />
          <div style={{ ...CARD, padding: '20px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 36px' }}>
              {(data.country_breakdown || []).slice(0, 20).map(row => (
                <BarRow
                  key={row.country}
                  label={row.country}
                  count={row.count}
                  total={totalForCtry}
                  accent={C.red}
                  prefix={COUNTRY_FLAGS[row.country] || '🌍'}
                />
              ))}
            </div>
            {(data.country_breakdown || []).length === 0 && (
              <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.6 }}>Country data is collected at signup — new users will appear here automatically.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Top users by usage ────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHeader label="Top users this month" count={data.top_users.length} />
        <div style={{ ...CARD, overflow: 'hidden' }}>
          <THead cols={TOP_COLS} />
          {data.top_users.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 13, color: C.text3 }}>Nobody has run an analysis this month yet.</div>
          ) : (
            topSlice.map((u, i) => {
              const usagePct = u.monthly_allowance > 0 ? Math.min(100, (u.monthly_used / u.monthly_allowance) * 100) : 0
              const usageClr = usagePct > 80 ? C.red : usagePct > 60 ? C.amber : C.green
              const isLast   = i === topSlice.length - 1
              return (
                <div key={u.channel_id + i} className="admin-row" style={{
                  display: 'grid', gridTemplateColumns: TOP_COLS.map(c => c.w).join(' '),
                  padding: '11px 20px', alignItems: 'center',
                  borderBottom: isLast ? 'none' : `1px solid ${C.borderHex}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <Avatar src={u.channel_thumbnail} name={u.channel_name} size={30} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.text1, letterSpacing: '-0.15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.channel_name || '(unnamed)'}</p>
                      <p style={{ fontSize: 11.5, color: C.text3, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.owner_email}</p>
                    </div>
                  </div>
                  <div><PlanBadge plan={u.plan} /></div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="num" style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>{u.monthly_used}</span>
                    <span style={{ fontSize: 11, color: C.text3, fontWeight: 500 }}> / {u.monthly_allowance || '∞'}</span>
                    <div style={{ marginTop: 4, height: 3, background: '#f0f0f4', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${usagePct}%`, height: '100%', background: usageClr, borderRadius: 99 }} />
                    </div>
                  </div>
                  <div className="num" style={{ fontSize: 12, color: C.text2, textAlign: 'right' }}>{fmtNum(u.subscribers)}</div>
                  <div className="num" style={{ fontSize: 12, color: C.text3, textAlign: 'right' }}>{relTime(u.last_audit_at)}</div>
                </div>
              )
            })
          )}
          <Pagination page={topPage} total={data.top_users.length} onPage={setTopPage} />
        </div>
      </div>

    </div>
  )
}
