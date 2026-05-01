import { useEffect, useState } from 'react'

/* ── Design tokens — strict palette matching Dashboard / Settings */
const C = {
  red:     '#e5251b', redBg:   '#fff5f5', redBdr:   '#fecaca',
  green:   '#16a34a', greenBg: '#f0fdf4', greenBdr: '#bbf7d0',
  amber:   '#d97706', amberBg: '#fffbeb', amberBdr: '#fde68a',
  blue:    '#2563eb', blueBg:  '#eff6ff', blueBdr:  '#bfdbfe',
  purple:  '#7c3aed', purpleBg:'#f5f3ff', purpleBdr:'#ddd6fe',
  text1:   '#111114',
  text2:   '#52525b',
  text3:   '#9595a4',
  text4:   '#c0c0cc',
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

function useAdminStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-admin-fonts')) return
    const link = document.createElement('link')
    link.id = 'ytg-admin-fonts'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
    document.head.appendChild(link)
    if (document.getElementById('ytg-admin-styles')) return
    const style = document.createElement('style')
    style.id = 'ytg-admin-styles'
    style.textContent = `
      .admin-page, .admin-page * { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
      .admin-page p, .admin-page span, .admin-page div, .admin-page h1, .admin-page h2 { margin: 0; }
      .admin-page .num { font-variant-numeric: tabular-nums; }
      .admin-row { transition: background 0.15s; }
      .admin-row:hover { background: #fafafc; }
      @keyframes adminSpin { to { transform: rotate(360deg) } }
    `
    document.head.appendChild(style)
  }, [])
}

/* ── Helpers ──────────────────────────────────────────────────────────── */
function relTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const diff = Math.max(0, (Date.now() - d.getTime()) / 1000)
  if (diff < 60)        return 'just now'
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`
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
    free:             'Free',
    solo:             'Solo',
    growth:           'Growth',
    agency:           'Agency',
    lifetime_solo:    'LT Solo',
    lifetime_growth:  'LT Growth',
    lifetime_agency:  'LT Agency',
    pack:             'Pack',
  }
  return map[plan] || plan || 'Free'
}

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
  const fontSize = Math.round(size * 0.42)
  const initial  = (name || '?').trim()[0]?.toUpperCase() || '?'
  if (src) {
    return <img src={src} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `1px solid ${C.border}` }} />
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: C.chipBg, color: C.text1,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: 700, flexShrink: 0, border: `1px solid ${C.border}`,
    }}>{initial}</div>
  )
}

function StatCard({ label, value, sub, trend }) {
  const trendColor = trend == null ? null : trend > 0 ? C.green : trend < 0 ? C.red : C.text3
  const trendLabel = trend == null ? null : (trend > 0 ? `+${trend}` : `${trend}`)
  return (
    <div style={{ ...CARD, padding: '20px 22px' }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.text3 }}>{label}</p>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <p className="num" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', color: C.text1, lineHeight: 1 }}>{value}</p>
        {trendLabel != null && (
          <span className="num" style={{ fontSize: 12, fontWeight: 700, color: trendColor }}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '·'} {trendLabel}
          </span>
        )}
      </div>
      {sub && <p style={{ marginTop: 7, fontSize: 12, color: C.text3, lineHeight: 1.5 }}>{sub}</p>}
    </div>
  )
}

function BarRow({ label, count, total, accent }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: C.text2, letterSpacing: '-0.1px' }}>{label}</span>
        <span className="num" style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>{fmtNum(count)} <span style={{ fontSize: 11, color: C.text3, fontWeight: 500 }}>· {pct.toFixed(0)}%</span></span>
      </div>
      <div style={{ height: 5, background: '#f0f0f4', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: accent, borderRadius: 99, transition: 'width 0.7s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </div>
    </div>
  )
}

const PLAN_ACCENT = (plan) => planBadgeColors(plan).color

function SectionLabel({ children }) {
  return <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.text3, marginBottom: 10 }}>{children}</p>
}

/* ── Main component ───────────────────────────────────────────────────── */
export default function Admin() {
  useAdminStyles()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [refreshing, setRefreshing] = useState(false)

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
      .then(d => { setData(d); setLoading(false); setRefreshing(false) })
      .catch(e => { setError(e.message); setLoading(false); setRefreshing(false) })
  }

  useEffect(() => { load(true) }, [])

  if (loading) {
    return (
      <div className="admin-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: 28, height: 28, border: '2.5px solid #e5e7eb', borderTop: `2.5px solid ${C.red}`, borderRadius: '50%', animation: 'adminSpin 0.7s linear infinite' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 13, background: C.redBg, border: `1px solid ${C.redBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚠</div>
        <p style={{ fontSize: 16, fontWeight: 700, color: C.text1 }}>{error}</p>
        <button onClick={() => load(true)} style={{ marginTop: 4, padding: '8px 18px', borderRadius: 100, border: `1px solid ${C.border}`, background: '#fff', color: C.text2, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Try again</button>
      </div>
    )
  }

  const s = data.stats
  const totalForPlan = data.plan_breakdown.reduce((sum, r) => sum + r.count, 0)
  const totalForUtm  = data.utm_breakdown.reduce((sum, r) => sum + r.count, 0)
  const trendSub = s.signups_prev_7d > 0 ? `vs ${s.signups_prev_7d} previous week` : 'no signups previous week'

  return (
    <div className="admin-page">

      {/* ── Page heading ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 4 }}>Admin</h1>
          <p style={{ fontSize: 13, color: C.text3 }}>Internal · {data.generated_at ? `updated ${relTime(data.generated_at)}` : 'live'}</p>
        </div>
        <button
          onClick={() => load(false)}
          disabled={refreshing}
          style={{
            padding: '8px 16px', borderRadius: 100, border: `1px solid ${C.border}`,
            background: '#fff', color: C.text2, fontSize: 13, fontWeight: 600,
            cursor: refreshing ? 'wait' : 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 7,
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { if (!refreshing) { e.currentTarget.style.color = C.text1; e.currentTarget.style.borderColor = C.text3 } }}
          onMouseLeave={e => { if (!refreshing) { e.currentTarget.style.color = C.text2; e.currentTarget.style.borderColor = C.border } }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: refreshing ? 'adminSpin 0.7s linear infinite' : 'none' }}><path d="M11 6.5a4.5 4.5 0 0 1-8 2.85M2 6.5a4.5 4.5 0 0 1 8-2.85"/><path d="M11 1v3h-3M2 12V9h3"/></svg>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Hero stats row ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        <StatCard
          label="Total users"
          value={fmtNum(s.total_users)}
          sub="All-time signups"
        />
        <StatCard
          label="Paid"
          value={fmtNum(s.paid_users)}
          sub={`${s.conversion_pct}% conversion · ${fmtNum(s.free_users)} on free`}
        />
        <StatCard
          label="Signups (7d)"
          value={fmtNum(s.signups_7d)}
          sub={trendSub}
          trend={s.signups_trend}
        />
        <StatCard
          label="Active (7d)"
          value={fmtNum(s.active_7d)}
          sub="Channels audited in last 7 days"
        />
      </div>

      {/* ── Two-column body ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 28 }}>

        {/* LEFT — Recent signups */}
        <div>
          <SectionLabel>Recent signups</SectionLabel>
          <div style={{ ...CARD, overflow: 'hidden' }}>
            {/* Header row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1.6fr 90px 100px 80px',
              padding: '12px 22px', borderBottom: `1px solid ${C.borderHex}`,
              background: '#fafafc', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase', color: C.text3,
            }}>
              <div>User</div>
              <div>Plan</div>
              <div>Source</div>
              <div style={{ textAlign: 'right' }}>Joined</div>
            </div>
            {/* Rows — capped scroll */}
            <div style={{ maxHeight: 560, overflowY: 'auto' }}>
              {data.recent_signups.length === 0 && (
                <div style={{ padding: '36px 22px', textAlign: 'center', fontSize: 13, color: C.text3 }}>No signups yet.</div>
              )}
              {data.recent_signups.map((u, i) => {
                const name = u.display_name || u.channel_name || u.email.split('@')[0]
                const pic  = u.profile_picture || u.channel_thumbnail
                return (
                  <div
                    key={u.email + i}
                    className="admin-row"
                    style={{
                      display: 'grid', gridTemplateColumns: '1.6fr 90px 100px 80px',
                      padding: '12px 22px', alignItems: 'center',
                      borderBottom: i < data.recent_signups.length - 1 ? `1px solid ${C.borderHex}` : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                      <Avatar src={pic} name={name} size={32} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text1, letterSpacing: '-0.15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                        <p style={{ fontSize: 12, color: C.text3, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                      </div>
                    </div>
                    <div><PlanBadge plan={u.plan} /></div>
                    <div style={{ fontSize: 12, color: u.utm_source ? C.text2 : C.text4, fontWeight: u.utm_source ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.utm_source || '(direct)'}
                    </div>
                    <div className="num" style={{ fontSize: 12, color: C.text3, textAlign: 'right' }}>{relTime(u.created_at)}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT — Plan + UTM breakdowns */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <SectionLabel>By plan</SectionLabel>
            <div style={{ ...CARD, padding: '20px 22px' }}>
              {data.plan_breakdown.length === 0 && (
                <p style={{ fontSize: 13, color: C.text3 }}>No subscriptions yet.</p>
              )}
              {data.plan_breakdown.map(row => (
                <BarRow key={row.plan} label={planLabel(row.plan)} count={row.count} total={totalForPlan} accent={PLAN_ACCENT(row.plan)} />
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>By source</SectionLabel>
            <div style={{ ...CARD, padding: '20px 22px' }}>
              {data.utm_breakdown.length === 0 && (
                <p style={{ fontSize: 13, color: C.text3 }}>Nothing tracked yet — share a UTM-tagged link to start collecting attribution.</p>
              )}
              {data.utm_breakdown.map(row => (
                <BarRow key={row.source} label={row.source} count={row.count} total={totalForUtm} accent={C.text2} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Top users by usage ────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <SectionLabel>Top users this month</SectionLabel>
        <div style={{ ...CARD, overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1.6fr 90px 110px 90px 110px',
            padding: '12px 22px', borderBottom: `1px solid ${C.borderHex}`,
            background: '#fafafc', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase', color: C.text3,
          }}>
            <div>Channel</div>
            <div>Plan</div>
            <div style={{ textAlign: 'right' }}>Usage</div>
            <div style={{ textAlign: 'right' }}>Subs</div>
            <div style={{ textAlign: 'right' }}>Last audit</div>
          </div>
          {data.top_users.length === 0 && (
            <div style={{ padding: '36px 22px', textAlign: 'center', fontSize: 13, color: C.text3 }}>Nobody has run an analysis this month yet.</div>
          )}
          {data.top_users.map((u, i) => {
            const usagePct = u.monthly_allowance > 0 ? Math.min(100, (u.monthly_used / u.monthly_allowance) * 100) : 0
            return (
              <div
                key={u.channel_id + i}
                className="admin-row"
                style={{
                  display: 'grid', gridTemplateColumns: '1.6fr 90px 110px 90px 110px',
                  padding: '12px 22px', alignItems: 'center',
                  borderBottom: i < data.top_users.length - 1 ? `1px solid ${C.borderHex}` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                  <Avatar src={u.channel_thumbnail} name={u.channel_name} size={32} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text1, letterSpacing: '-0.15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.channel_name || '(unnamed)'}</p>
                    <p style={{ fontSize: 12, color: C.text3, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.owner_email}</p>
                  </div>
                </div>
                <div><PlanBadge plan={u.plan} /></div>
                <div style={{ textAlign: 'right' }}>
                  <span className="num" style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>{u.monthly_used}</span>
                  <span style={{ fontSize: 11, color: C.text3, fontWeight: 500 }}> / {u.monthly_allowance || '∞'}</span>
                  <div style={{ marginTop: 5, height: 3, background: '#f0f0f4', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${usagePct}%`, height: '100%', background: usagePct > 80 ? C.red : usagePct > 60 ? C.amber : C.green, borderRadius: 99 }} />
                  </div>
                </div>
                <div className="num" style={{ fontSize: 12, color: C.text2, textAlign: 'right' }}>{fmtNum(u.subscribers)}</div>
                <div className="num" style={{ fontSize: 12, color: C.text3, textAlign: 'right' }}>{relTime(u.last_audit_at)}</div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
