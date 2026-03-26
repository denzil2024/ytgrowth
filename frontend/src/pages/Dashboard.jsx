import { useEffect, useState } from 'react'
import Competitors from './Competitors'
import TitleOptimizer from './TitleOptimizer'

/* ─── Inject font + global styles once ─────────────────────────────────── */
function useDashboardStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-dash-styles')) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytg-dash-styles'
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { background: #f5f5f7; color: #0f0f10; font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }

      @keyframes spin    { to { transform: rotate(360deg) } }
      @keyframes fadeUp  { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
      @keyframes pulse   { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }

      ::-webkit-scrollbar       { width: 5px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background: #dddde3; border-radius: 3px }
      ::-webkit-scrollbar-thumb:hover { background: #c4c4cc }

      .ytg-stat-card {
        background: #fff;
        border: 1px solid #e8e8ec;
        border-radius: 16px;
        padding: 20px 22px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03);
        transition: box-shadow 0.2s, transform 0.2s;
        cursor: default;
      }
      .ytg-stat-card:hover {
        box-shadow: 0 8px 28px rgba(0,0,0,0.09), 0 2px 6px rgba(0,0,0,0.04);
        transform: translateY(-2px);
      }
      .ytg-stat-card.alert {
        border-color: #fecaca;
        background: linear-gradient(135deg, #fff7f7 0%, #fff5f5 100%);
      }

      .ytg-card {
        background: #fff;
        border: 1px solid #e8e8ec;
        border-radius: 16px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03);
      }

      .ytg-nav-btn {
        width: 100%; display: flex; align-items: center; gap: 9px;
        padding: 8px 12px; border-radius: 9px; border: none; cursor: pointer;
        font-size: 13px; font-family: 'Inter', sans-serif;
        transition: all 0.15s; text-align: left;
      }

      .ytg-video-row { transition: background 0.15s; }
      .ytg-video-row:hover { background: #f8f8fa !important; }

      .ytg-insight-card {
        background: #fff;
        border: 1px solid #e8e8ec;
        border-radius: 16px;
        overflow: hidden;
        margin-bottom: 10px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03);
        transition: box-shadow 0.2s, transform 0.2s;
      }
      .ytg-insight-card:hover {
        box-shadow: 0 8px 28px rgba(0,0,0,0.09), 0 2px 6px rgba(0,0,0,0.04);
        transform: translateY(-1px);
      }
    `
    document.head.appendChild(style)
  }, [])
}

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const C = {
  red:     '#e5251b',
  redBg:   '#fff5f5',
  redBdr:  '#fecaca',
  green:   '#16a34a',
  greenBg: '#f0fdf4',
  greenBdr:'#bbf7d0',
  amber:   '#d97706',
  blue:    '#2563eb',
  text1:   '#0f0f10',
  text2:   '#52525b',
  text3:   '#a1a1aa',
  border:  '#e8e8ec',
  bg:      '#f5f5f7',
  surface: '#fff',
}

/* Severity palette — desaturated, one accent only */
const SEV = {
  critical: { color: C.red,   bg: C.redBg,   bdr: C.redBdr },
  high:     { color: C.amber, bg: '#fffbeb',  bdr: '#fde68a' },
  medium:   { color: C.blue,  bg: '#eff6ff',  bdr: '#bfdbfe' },
  low:      { color: '#7c3aed', bg: '#f5f3ff', bdr: '#ddd6fe' },
  info:     { color: C.green, bg: C.greenBg,  bdr: C.greenBdr },
}
function sev(severity) { return SEV[severity] || SEV.critical }

/* ─── Helpers ───────────────────────────────────────────────────────────── */
function healthScore(insights) {
  let s = 100
  insights.forEach(i => {
    if (i.severity === 'critical') s -= 20
    else if (i.severity === 'high') s -= 10
    else if (i.severity === 'medium') s -= 5
  })
  return Math.max(Math.min(s, 100), 0)
}
function scoreColor(s)  { return s >= 75 ? C.green : s >= 50 ? C.amber : C.red }
function scoreLabel(s)  { return s >= 75 ? 'Healthy' : s >= 50 ? 'Needs work' : 'Critical' }
function fmtSecs(s)     { return `${Math.floor(s / 60)}m ${s % 60}s` }
function fmtNum(n)      {
  if (n == null) return '—'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toLocaleString()
}

/* ─── Logo (matches landing page) ──────────────────────────────────────── */
function Logo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <rect width="26" height="26" rx="7" fill={C.red}/>
      <path d="M18.5 10.2a1.6 1.6 0 0 0-1.12-1.12C16.4 8.8 13 8.8 13 8.8s-3.4 0-4.38.3A1.6 1.6 0 0 0 7.5 10.2 17 17 0 0 0 7.2 13a17 17 0 0 0 .3 2.8 1.6 1.6 0 0 0 1.12 1.12C9.6 17.2 13 17.2 13 17.2s3.4 0 4.38-.3a1.6 1.6 0 0 0 1.12-1.12A17 17 0 0 0 18.8 13a17 17 0 0 0-.3-2.8z" fill="white"/>
      <polygon points="11.2,16 16,13 11.2,10" fill={C.red}/>
    </svg>
  )
}

/* ─── Score ring ────────────────────────────────────────────────────────── */
function ScoreRing({ score }) {
  const r = 42, cx = 54, cy = 54
  const circ = 2 * Math.PI * r
  const dash  = (score / 100) * circ
  const col   = scoreColor(score)
  return (
    <svg width="108" height="108" viewBox="0 0 108 108">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ebebed" strokeWidth="7"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth="7"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fill={col}
        fontSize="24" fontWeight="800" fontFamily="Inter, sans-serif"
        style={{ fontVariantNumeric: 'tabular-nums' }}>{score}</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fill={C.text3}
        fontSize="10" fontFamily="Inter, sans-serif">{scoreLabel(score)}</text>
    </svg>
  )
}

/* ─── Mini bar sparkline ────────────────────────────────────────────────── */
function MiniBar({ videos }) {
  if (!videos?.length) return null
  const items = [...videos].slice(0, 12).reverse()
  const max   = Math.max(...items.map(v => v.views), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
      {items.map((v, i) => (
        <div key={i} title={v.title} style={{
          flex: 1, minWidth: 4,
          background: C.red,
          opacity: 0.18 + 0.82 * (v.views / max),
          borderRadius: '3px 3px 0 0',
          height: `${Math.max(5, (v.views / max) * 100)}%`,
          transition: 'opacity 0.15s', cursor: 'default',
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity = 1 }}
          onMouseLeave={e => { e.currentTarget.style.opacity = 0.18 + 0.82 * (v.views / max) }}
        />
      ))}
    </div>
  )
}

/* ─── Stat card ─────────────────────────────────────────────────────────── */
function Stat({ label, value, sub, alert, accent }) {
  const col = alert ? C.red : (accent || C.text1)
  return (
    <div className={`ytg-stat-card${alert ? ' alert' : ''}`}>
      <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.text3, marginBottom: 10 }}>{label}</p>
      <p style={{ fontSize: 27, fontWeight: 800, letterSpacing: '-1.5px', color: col, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      {sub && <p style={{ fontSize: 11.5, color: alert ? C.red : C.text3, fontWeight: 500, marginTop: 7 }}>{sub}</p>}
    </div>
  )
}

/* ─── Insight card ──────────────────────────────────────────────────────── */
function InsightCard({ insight, index }) {
  const { color, bg, bdr } = sev(insight.severity)
  return (
    <div className="ytg-insight-card">
      <div style={{ borderLeft: `3px solid ${color}`, padding: '20px 22px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: bg, border: `1px solid ${bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{String(index + 1).padStart(2, '0')}</span>
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, lineHeight: 1.5 }}>{insight.problem}</p>
          </div>
          <span style={{ background: bg, color, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, flexShrink: 0, letterSpacing: '0.07em', textTransform: 'uppercase', border: `1px solid ${bdr}` }}>{insight.severity || 'issue'}</span>
        </div>
        {/* Why / Fix */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          <div style={{ background: '#f7f7f9', border: `1px solid #ebebef`, borderRadius: 10, padding: '11px 13px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, marginBottom: 5, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Why</p>
            <p style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.7 }}>{insight.cause}</p>
          </div>
          <div style={{ background: C.greenBg, border: `1px solid ${C.greenBdr}`, borderRadius: 10, padding: '11px 13px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#15803d', marginBottom: 5, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Fix</p>
            <p style={{ fontSize: 12.5, color: '#166534', lineHeight: 1.7 }}>{insight.action}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Nav icons ─────────────────────────────────────────────────────────── */
const NAV_ICONS = {
  Overview:    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="5" height="5" rx="1.5"/><rect x="8" y="1" width="5" height="5" rx="1.5"/><rect x="1" y="8" width="5" height="5" rx="1.5"/><rect x="8" y="8" width="5" height="5" rx="1.5"/></svg>,
  Insights:    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/><line x1="7" y1="4.5" x2="7" y2="7"/><circle cx="7" cy="9.5" r="0.7" fill="currentColor" stroke="none"/></svg>,
  Videos:      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="2.5" width="9" height="9" rx="1.5"/><path d="M10 5.5l3-2v7l-3-2V5.5z" fill="currentColor" stroke="none"/></svg>,
  Patterns:    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="1,10.5 4,7 7,8.5 11,3.5 13,5"/></svg>,
  Competitors: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="4" cy="7" r="2.5"/><circle cx="10" cy="7" r="2.5"/></svg>,
  Settings:    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="2"/><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.9 2.9l1 1M10 10l1 1M2.9 11.1l1-1M10 4l1-1"/></svg>,
}

function NavBtn({ label, active, onClick, badge }) {
  return (
    <button className="ytg-nav-btn" onClick={onClick} style={{
      background: active ? 'rgba(229,37,27,0.18)' : 'transparent',
      color: active ? '#ff6b68' : 'rgba(255,255,255,0.45)',
      fontWeight: active ? 600 : 400,
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.82)' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' } }}
    >
      <span style={{ display: 'flex', flexShrink: 0 }}>{NAV_ICONS[label]}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && (
        <span style={{ background: C.red, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>{badge}</span>
      )}
    </button>
  )
}

/* ─── Dashboard ─────────────────────────────────────────────────────────── */
export default function Dashboard() {
  useDashboardStyles()

  const [data,    setData]   = useState(null)
  const [error,   setError]  = useState(null)
  const [loading, setLoad]   = useState(true)
  const [nav,     setNav]    = useState('Overview')

  useEffect(() => {
    fetch('http://localhost:8000/auth/data', { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error('No data'); return r.json() })
      .then(d => { if (d.error) throw new Error(d.error); setData(d); setLoad(false) })
      .catch(e => { setError(e.message); setLoad(false) })
  }, [])

  const score    = data ? healthScore(data.insights) : 0
  const avgViews = data ? Math.round(data.channel.total_views / Math.max(data.channel.video_count, 1)) : 0

  const patterns = data ? (() => {
    const vids = data.videos || []
    const dur  = v => { const m = (v.duration||'').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/); return m ? (+m[1]||0)*3600+(+m[2]||0)*60+(+m[3]||0) : 0 }
    const shorts = vids.filter(v => dur(v) <= 60)
    const longs  = vids.filter(v => dur(v) >  60)
    const avg    = a  => a.length ? Math.round(a.reduce((s,v) => s+v.views, 0) / a.length) : 0
    const totL   = vids.reduce((s,v) => s+v.likes,  0)
    const totV   = vids.reduce((s,v) => s+v.views,  0)
    return {
      shortAvg:    avg(shorts),
      longAvg:     avg(longs),
      shortsCount: shorts.length,
      longsCount:  longs.length,
      likeRate:    totV > 0 ? (totL / totV * 100).toFixed(2) : 0,
      bestVideo:   [...vids].sort((a,b) => b.views-a.views)[0],
      worstVideo:  [...vids].sort((a,b) => a.views-b.views)[0],
    }
  })() : null

  const navItems = [
    { label: 'Overview' },
    { label: 'Insights', badge: data?.insights?.length },
    { label: 'Videos' },
    { label: 'Patterns' },
    { label: 'Competitors' },
    { label: 'Title Optimizer' },
    { label: 'Settings' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", background: C.bg }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════ */}
      <aside style={{
        width: 260, background: '#111113', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh',
        boxShadow: '8px 0 40px rgba(0,0,0,0.28)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* Brand */}
        <a href="/" style={{ padding: '18px 18px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid rgba(255,255,255,0.07)`, textDecoration: 'none', flexShrink: 0 }}>
          <Logo size={24} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.2 }}>YTGrowth</p>
            <p style={{ fontSize: 9.5, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 1 }}>Analytics</p>
          </div>
        </a>

        {/* Channel block */}
        {data && (
          <div style={{ padding: '14px 18px', borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.06)', borderRadius: 12, border: `1px solid rgba(255,255,255,0.09)` }}>
              {data.channel.thumbnail
                ? <img src={data.channel.thumbnail} alt="" style={{ width: 33, height: 33, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid rgba(255,255,255,0.15)` }}/>
                : <div style={{ width: 33, height: 33, borderRadius: '50%', background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{data.channel.channel_name[0].toUpperCase()}</div>
              }
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.2px' }}>{data.channel.channel_name}</p>
                <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{fmtNum(data.channel.subscribers)} subs</p>
              </div>
            </div>

            {/* Health bar */}
            <div style={{ padding: '12px 2px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Health</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(score), fontVariantNumeric: 'tabular-nums' }}>
                  {score}<span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/100</span>
                </span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 3, height: 3, overflow: 'hidden' }}>
                <div style={{ width: `${score}%`, height: '100%', background: scoreColor(score), borderRadius: 3, transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)' }}/>
              </div>
              <p style={{ fontSize: 11, color: scoreColor(score), fontWeight: 500, marginTop: 5 }}>{scoreLabel(score)}</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ padding: '10px 10px', flex: 1, overflowY: 'auto' }}>
          <p style={{ fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>Menu</p>
          {navItems.map(item => (
            <NavBtn key={item.label} label={item.label} active={nav === item.label} onClick={() => setNav(item.label)} badge={item.badge} />
          ))}
        </nav>

        {/* Disconnect */}
        <div style={{ padding: '14px 18px', borderTop: `1px solid rgba(255,255,255,0.07)` }}>
          <a href="http://localhost:8000/auth/logout" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textDecoration: 'none', fontWeight: 400, display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4.5 1.5H2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6M7 1.5h2.5m0 0v2.5m0-2.5L5 6"/></svg>
            Disconnect
          </a>
        </div>
      </aside>

      {/* ══ MAIN ═════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, overflow: 'auto', background: C.bg }}>

        {/* Topbar */}
        <div style={{
          borderBottom: `1px solid rgba(0,0,0,0.06)`,
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)',
          boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.04)',
          padding: '0 36px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: C.text1, letterSpacing: '-0.2px' }}>{nav}</span>
            {data && <>
              <span style={{ color: C.text3, fontSize: 13, lineHeight: 1, marginTop: 1 }}>·</span>
              <span style={{ fontSize: 13, fontWeight: 400, color: C.text3 }}>{data.channel.channel_name}</span>
            </>}
          </div>
          <div style={{ background: C.surface, border: `1px solid #e8e8ec`, borderRadius: 20, padding: '5px 13px', display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px #dcfce7', animation: 'pulse 2.5s infinite' }}/>
            <span style={{ fontSize: 11.5, color: C.text2, fontWeight: 500 }}>Live</span>
          </div>
        </div>

        {/* Page */}
        <div style={{ padding: '30px 36px', animation: 'fadeUp 0.3s ease' }}>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 14 }}>
              <div style={{ width: 32, height: 32, border: `2.5px solid ${C.border}`, borderTop: `2.5px solid ${C.red}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
              <p style={{ color: C.text3, fontSize: 13, fontWeight: 500 }}>Analyzing your channel…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: C.redBg, border: `1px solid ${C.redBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚠</div>
              <p style={{ fontSize: 19, fontWeight: 700, color: C.text1, letterSpacing: '-0.4px' }}>No channel data</p>
              <p style={{ fontSize: 13.5, color: C.text2, maxWidth: 280, lineHeight: 1.7 }}>Connect your YouTube channel to see your analytics.</p>
              <a href="/" style={{ background: C.red, color: '#fff', padding: '11px 24px', borderRadius: 10, fontSize: 13.5, fontWeight: 700, textDecoration: 'none', marginTop: 8 }}>Connect channel →</a>
            </div>
          )}

          {/* ── OVERVIEW ─────────────────────────────────────────────── */}
          {data && nav === 'Overview' && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 21, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 3 }}>Good to see you.</h1>
                <p style={{ fontSize: 13, color: C.text3 }}>Here's how your channel is performing right now.</p>
              </div>

              {/* Row 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12, marginBottom: 12 }}>
                <Stat label="Subscribers"  value={fmtNum(data.channel.subscribers)}  sub="All time" />
                <Stat label="Total views"  value={fmtNum(data.channel.total_views)}  sub="All time" />
                <Stat label="Avg views"    value={fmtNum(avgViews)} sub={avgViews < 500 ? 'Below average' : 'On track'} alert={avgViews < 500} />
                <Stat label="Open issues"  value={data.insights.length} sub="See Insights tab" alert={data.insights.length > 0} />
              </div>

              {/* Row 2 */}
              {data.analytics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12, marginBottom: 20 }}>
                  <Stat label="Views (90d)"    value={fmtNum(data.analytics.views_90d)} />
                  <Stat label="Avg retention"  value={`${data.analytics.avg_retention_percent}%`}
                    sub={data.analytics.avg_retention_percent >= 50 ? 'Good' : 'Below 50% target'}
                    alert={data.analytics.avg_retention_percent < 40}
                    accent={data.analytics.avg_retention_percent >= 50 ? C.green : undefined}
                  />
                  <Stat label="Avg duration"   value={fmtSecs(data.analytics.avg_view_duration_seconds)}
                    sub={data.analytics.avg_view_duration_seconds < 120 ? 'Critical — under 2 min' : 'Good'}
                    alert={data.analytics.avg_view_duration_seconds < 120}
                  />
                  <Stat label="Net subs (90d)"
                    value={data.analytics.net_subscribers_90d >= 0 ? `+${fmtNum(data.analytics.net_subscribers_90d)}` : fmtNum(data.analytics.net_subscribers_90d)}
                    sub={data.analytics.net_subscribers_90d >= 0 ? 'Growing' : 'Losing subscribers'}
                    alert={data.analytics.net_subscribers_90d < 0}
                    accent={data.analytics.net_subscribers_90d >= 0 ? C.green : undefined}
                  />
                </div>
              )}

              {/* Main 2-col */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 292px', gap: 14, marginBottom: 14 }}>

                {/* Top priority card */}
                <div className="ytg-card" style={{ padding: '22px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.red, boxShadow: `0 0 0 3px ${C.redBdr}`, animation: 'pulse 2s infinite' }}/>
                    <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Top priority</p>
                  </div>

                  {data.insights[0] && (() => {
                    const ins = data.insights[0]
                    const s   = sev(ins.severity)
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 11 }}>
                          <p style={{ fontSize: 15.5, fontWeight: 700, color: C.text1, letterSpacing: '-0.3px', flex: 1, lineHeight: 1.4 }}>{ins.problem}</p>
                          <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.07em', border: `1px solid ${s.bdr}` }}>{ins.severity}</span>
                        </div>
                        <p style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.75, marginBottom: 13 }}>{ins.cause}</p>
                        <div style={{ background: C.greenBg, border: `1px solid ${C.greenBdr}`, borderRadius: 11, padding: '12px 15px', marginBottom: 18 }}>
                          <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.7 }}>
                            <strong style={{ fontWeight: 700, color: C.green }}>Action — </strong>{ins.action}
                          </p>
                        </div>
                      </>
                    )
                  })()}

                  {data.videos?.length > 0 && (
                    <div style={{ paddingTop: 16, borderTop: `1px solid #ebebef` }}>
                      <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 9 }}>Recent video views</p>
                      <MiniBar videos={data.videos} />
                    </div>
                  )}
                </div>

                {/* Score ring card */}
                <div className="ytg-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <ScoreRing score={score} />
                  <div style={{ width: '100%', marginTop: 14, paddingTop: 14, borderTop: `1px solid #ebebef` }}>
                    <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 9 }}>Breakdown</p>
                    {['critical', 'high', 'medium'].map(s => {
                      const count = data.insights.filter(i => i.severity === s).length
                      const { color } = sev(s)
                      return (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }}/>
                          <span style={{ fontSize: 12, color: C.text2, flex: 1, textTransform: 'capitalize' }}>{s}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: count > 0 ? color : C.text3, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* All issues */}
              <div className="ytg-card" style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: C.text1, marginBottom: 2, letterSpacing: '-0.2px' }}>All issues</p>
                    <p style={{ fontSize: 12, color: C.text3 }}>{data.insights.length} issues, ranked by severity</p>
                  </div>
                  <button onClick={() => setNav('Insights')} style={{
                    background: '#f5f5f7', border: `1px solid ${C.border}`, borderRadius: 8,
                    padding: '7px 15px', fontSize: 12.5, fontWeight: 600, color: C.text2,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#a1a1aa'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                  >View all →</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {data.insights.map((ins, i) => {
                    const { color, bg, bdr } = sev(ins.severity)
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', background: '#f7f7f9', borderRadius: 11, border: `1px solid #ebebef` }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: bg, border: `1px solid ${bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }}/>
                        </div>
                        <p style={{ fontSize: 13, color: C.text2, flex: 1, lineHeight: 1.4 }}>{ins.problem}</p>
                        <span style={{ fontSize: 10, fontWeight: 700, color, background: bg, padding: '3px 9px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0, border: `1px solid ${bdr}` }}>
                          {ins.severity ? ins.severity[0].toUpperCase() + ins.severity.slice(1) : 'Issue'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── INSIGHTS ─────────────────────────────────────────────── */}
          {data && nav === 'Insights' && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 21, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 3 }}>Issues to fix</h2>
                <p style={{ fontSize: 13, color: C.text3 }}>{data.insights.length} issues · start from the top</p>
              </div>
              {data.insights.map((ins, i) => <InsightCard key={i} insight={ins} index={i} />)}
            </>
          )}

          {/* ── VIDEOS ───────────────────────────────────────────────── */}
          {data && nav === 'Videos' && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 21, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 3 }}>Video performance</h2>
                <p style={{ fontSize: 13, color: C.text3 }}>Last {data.videos.length} videos</p>
              </div>
              <div className="ytg-card" style={{ overflow: 'hidden' }}>
                {/* Header row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 70px 80px 80px', padding: '11px 20px', borderBottom: `1px solid #ebebef`, background: '#f7f7f9' }}>
                  {['Video','Views','Likes','Comments','Like rate'].map((h, i) => (
                    <p key={i} style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: i > 0 ? 'right' : 'left' }}>{h}</p>
                  ))}
                </div>
                {data.videos.map((v, i) => {
                  const lr  = v.views > 0 ? (v.likes / v.views * 100).toFixed(1) : 0
                  const lrN = parseFloat(lr)
                  const lrColor = lrN >= 4 ? C.green : lrN >= 2 ? C.amber : C.red
                  return (
                    <div key={i} className="ytg-video-row" style={{
                      display: 'grid', gridTemplateColumns: '2fr 80px 70px 80px 80px',
                      padding: '12px 20px',
                      borderBottom: i < data.videos.length - 1 ? `1px solid #f5f5f7` : 'none',
                      alignItems: 'center',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        {v.thumbnail && <img src={v.thumbnail} alt="" style={{ width: 56, height: 35, borderRadius: 7, objectFit: 'cover', flexShrink: 0 }}/>}
                        <div>
                          <p style={{ fontSize: 12.5, color: C.text1, fontWeight: 600, lineHeight: 1.45, marginBottom: 2 }}>{v.title}</p>
                          <p style={{ fontSize: 11, color: C.text3 }}>{new Date(v.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(v.views)}</p>
                      <p style={{ fontSize: 13, color: C.text2, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(v.likes)}</p>
                      <p style={{ fontSize: 13, color: C.text2, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(v.comments)}</p>
                      <p style={{ fontSize: 12.5, fontWeight: 700, color: lrColor, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{lr}%</p>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* ── PATTERNS ─────────────────────────────────────────────── */}
          {data && nav === 'Patterns' && patterns && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 21, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 3 }}>Content patterns</h2>
                <p style={{ fontSize: 13, color: C.text3 }}>What's working and what isn't</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
                {[
                  { label: 'Shorts avg views',    value: fmtNum(patterns.shortAvg), verdict: patterns.shortAvg > patterns.longAvg ? 'Beats long-form' : 'Below long-form', good: patterns.shortAvg > patterns.longAvg },
                  { label: 'Long-form avg views', value: fmtNum(patterns.longAvg),  verdict: patterns.longAvg > patterns.shortAvg ? 'Beats Shorts'     : 'Below Shorts',    good: patterns.longAvg  > patterns.shortAvg },
                  { label: 'Overall like rate',   value: `${patterns.likeRate}%`,   verdict: patterns.likeRate >= 4 ? 'Healthy' : patterns.likeRate >= 2 ? 'Below target' : 'Critical', good: patterns.likeRate >= 4 },
                ].map(p => (
                  <div key={p.label} className="ytg-card" style={{ padding: '18px 20px' }}>
                    <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 9 }}>{p.label}</p>
                    <p style={{ fontSize: 26, fontWeight: 800, color: C.text1, letterSpacing: '-1px', marginBottom: 9, fontVariantNumeric: 'tabular-nums' }}>{p.value}</p>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color:   p.good ? C.green  : C.amber,
                      background: p.good ? C.greenBg : '#fffbeb',
                      padding: '4px 11px', borderRadius: 20,
                      border: `1px solid ${p.good ? C.greenBdr : '#fde68a'}`,
                    }}>{p.verdict}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                {[
                  { label: 'Best performing',  video: patterns.bestVideo,  isGood: true  },
                  { label: 'Worst performing', video: patterns.worstVideo, isGood: false },
                ].map(({ label, video, isGood }) => (
                  <div key={label} className="ytg-card" style={{ padding: '20px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: isGood ? C.green : C.red }}/>
                      <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</p>
                    </div>
                    {video && (
                      <>
                        <div style={{ display: 'flex', gap: 11, marginBottom: 13, alignItems: 'flex-start' }}>
                          {video.thumbnail && <img src={video.thumbnail} alt="" style={{ width: 68, height: 43, borderRadius: 7, objectFit: 'cover', flexShrink: 0 }}/>}
                          <p style={{ fontSize: 13, fontWeight: 600, color: C.text1, lineHeight: 1.5 }}>{video.title}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
                          {[['Views', fmtNum(video.views), isGood ? C.green : C.red], ['Likes', fmtNum(video.likes), C.text1]].map(([lbl, val, col]) => (
                            <div key={lbl}>
                              <p style={{ fontSize: 10, color: C.text3, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{lbl}</p>
                              <p style={{ fontSize: 21, fontWeight: 800, color: col, letterSpacing: '-0.8px', fontVariantNumeric: 'tabular-nums' }}>{val}</p>
                            </div>
                          ))}
                        </div>
                        <div style={{
                          background: isGood ? C.greenBg : C.redBg,
                          border: `1px solid ${isGood ? C.greenBdr : C.redBdr}`,
                          borderRadius: 10, padding: '9px 12px',
                        }}>
                          <p style={{ fontSize: 12, color: isGood ? '#166534' : '#991b1b', lineHeight: 1.7 }}>
                            {isGood ? 'Study this — replicate its title style, length, and topic angle.' : 'Avoid this format or topic — it isn\'t connecting with your audience.'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="ytg-card" style={{ padding: '20px 22px' }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: C.text1, marginBottom: 16, letterSpacing: '-0.2px' }}>Content mix</p>
                <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
                  {[{ l: 'Shorts', v: patterns.shortsCount, s: '≤60s' }, { l: 'Long-form', v: patterns.longsCount, s: '>60s' }].map(p => (
                    <div key={p.l}>
                      <p style={{ fontSize: 10, color: C.text3, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{p.l}</p>
                      <p style={{ fontSize: 26, fontWeight: 800, color: C.text1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>{p.v}</p>
                      <p style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{p.s}</p>
                    </div>
                  ))}
                  <div style={{ flex: 1, paddingLeft: 28, borderLeft: `1px solid #ebebef` }}>
                    <p style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.85 }}>
                      {patterns.shortAvg > patterns.longAvg
                        ? `Shorts outperform long-form by ${fmtNum(patterns.shortAvg - patterns.longAvg)} views on average. Lean into Shorts for discovery.`
                        : patterns.longAvg > patterns.shortAvg
                        ? `Long-form outperforms Shorts by ${fmtNum(patterns.longAvg - patterns.shortAvg)} views. Your audience wants depth.`
                        : 'Both formats are performing similarly on your channel.'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {nav === 'Competitors' && <Competitors />}

          {nav === 'Title Optimizer' && <TitleOptimizer />}

          {/* ── SETTINGS ─────────────────────────────────────────────── */}
          {nav === 'Settings' && (
            <div style={{ maxWidth: 440 }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 21, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 3 }}>Settings</h2>
                <p style={{ fontSize: 13, color: C.text3 }}>Manage your connection</p>
              </div>
              <div className="ytg-card" style={{ padding: '22px 24px' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 13 }}>Connected channel</p>
                {data && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
                    {data.channel.thumbnail
                      ? <img src={data.channel.thumbnail} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.border}` }}/>
                      : <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>{data.channel.channel_name[0]}</div>
                    }
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: C.text1 }}>{data.channel.channel_name}</p>
                      <p style={{ fontSize: 12, color: C.text3, marginTop: 1 }}>{data.channel.subscribers.toLocaleString()} subscribers</p>
                    </div>
                  </div>
                )}
                <a href="http://localhost:8000/auth/logout" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: C.redBg, color: C.red, border: `1px solid ${C.redBdr}`, padding: '9px 17px', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none', fontFamily: 'inherit' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6h6M7.5 4L10 6l-2.5 2M6 1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4"/></svg>
                  Disconnect channel
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
