import { useEffect, useState } from 'react'
import Competitors from './Competitors'
import SeoOptimizer from './SeoOptimizer'
import VideoOptimizePanel from './VideoOptimizePanel'
import Keywords from './Keywords'

/* ─── Inject font + global styles once ─────────────────────────────────── */
function useDashboardStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-dash-styles')) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=Inter:wght@400;500;600;700;800;900&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytg-dash-styles'
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { background: #f0f0f3; color: #111114; font-family: 'DM Sans', 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }

      @keyframes spin    { to { transform: rotate(360deg) } }
      @keyframes fadeUp  { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
      @keyframes pulse   { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }

      ::-webkit-scrollbar       { width: 4px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background: #e0e0e6; border-radius: 4px }
      ::-webkit-scrollbar-thumb:hover { background: #c8c8d0 }

      .ytg-stat-card {
        background: #ffffff;
        border: 1px solid rgba(0,0,0,0.09);
        border-radius: 20px;
        padding: 20px 22px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 6px 24px rgba(0,0,0,0.09);
        transition: box-shadow 0.22s, transform 0.22s;
        cursor: default;
      }
      .ytg-stat-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.10), 0 20px 56px rgba(0,0,0,0.13);
        transform: translateY(-2px);
        border-color: rgba(0,0,0,0.13);
      }
      .ytg-stat-card.alert {
        border-color: rgba(229,37,27,0.18);
        background: linear-gradient(135deg, #fffafa 0%, #fff5f5 100%);
      }

      .ytg-card {
        background: #ffffff;
        border: 1px solid rgba(0,0,0,0.09);
        border-radius: 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 6px 24px rgba(0,0,0,0.09);
        transition: box-shadow 0.22s, transform 0.22s;
      }
      .ytg-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.10), 0 20px 56px rgba(0,0,0,0.13);
        transform: translateY(-1px);
        border-color: rgba(0,0,0,0.13);
      }

      .ytg-nav-btn {
        width: 100%; display: flex; align-items: center; gap: 10px;
        padding: 9px 14px; border-radius: 100px; border: none; cursor: pointer;
        font-size: 13px; font-family: 'DM Sans', 'Inter', sans-serif;
        transition: all 0.18s; text-align: left; font-weight: 500;
      }

      .ytg-video-row { transition: background 0.15s; }
      .ytg-video-row:hover { background: #f4f4f7 !important; }

      .ytg-insight-card {
        background: #ffffff;
        border: 1px solid rgba(0,0,0,0.09);
        border-radius: 20px;
        overflow: hidden;
        margin-bottom: 10px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 6px 24px rgba(0,0,0,0.09);
        transition: box-shadow 0.22s, transform 0.22s;
      }
      .ytg-insight-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.10), 0 20px 56px rgba(0,0,0,0.13);
        transform: translateY(-1px);
        border-color: rgba(0,0,0,0.13);
      }
      .ytg-inner-block {
        background: #f7f7fa;
        border: 1px solid rgba(0,0,0,0.07);
        border-radius: 12px;
        padding: 11px 13px;
      }

      .ytg-dash-btn {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 9px 20px; border-radius: 100px; border: 1px solid rgba(0,0,0,0.1);
        font-family: 'DM Sans', 'Inter', sans-serif; font-size: 12.5px; font-weight: 600;
        background: #fff; color: #52525b; cursor: pointer;
        box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
        transition: all 0.18s;
      }
      .ytg-dash-btn:hover {
        border-color: rgba(0,0,0,0.18); color: #111114;
        box-shadow: 0 2px 8px rgba(0,0,0,0.10), 0 8px 28px rgba(0,0,0,0.10);
        transform: translateY(-1px);
      }
      .ytg-dash-btn-primary {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 9px 20px; border-radius: 100px; border: none;
        font-family: 'DM Sans', 'Inter', sans-serif; font-size: 12.5px; font-weight: 700;
        background: #e5251b; color: #fff; cursor: pointer;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32);
        transition: all 0.18s;
      }
      .ytg-dash-btn-primary:hover {
        filter: brightness(1.07); transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,37,27,0.42);
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
  text1:   '#111114',
  text2:   '#52525b',
  text3:   '#a0a0b0',
  border:  'rgba(0,0,0,0.09)',
  bg:      '#f0f0f3',
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
  const col = alert ? '#c0392b' : (accent || '#111114')
  return (
    <div className={`ytg-stat-card${alert ? ' alert' : ''}`}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#a0a0b0', marginBottom: 12 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: col, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      {sub && <p style={{ fontSize: 11.5, color: alert ? '#c0392b' : '#a0a0b0', fontWeight: 400, marginTop: 8 }}>{sub}</p>}
    </div>
  )
}

/* ─── Insight card ──────────────────────────────────────────────────────── */
function InsightCard({ insight, index, checked, onToggle }) {
  const { color, bg, bdr } = sev(insight.impact || insight.severity)
  return (
    <div className="ytg-insight-card">
      <div style={{ borderLeft: `3px solid ${color}`, padding: '20px 22px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            {/* Checkbox + rank */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0, marginTop: 3 }}>
              <input
                type="checkbox"
                checked={!!checked}
                onChange={onToggle}
                style={{ width: 15, height: 15, accentColor: C.green, cursor: 'pointer', flexShrink: 0 }}
              />
              <div style={{ width: 24, height: 24, borderRadius: 6, background: bg, border: `1px solid ${bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 10.5, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{insight.rank ?? index + 1}</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, lineHeight: 1.5 }}>{insight.problem}</p>
              {insight.category && <p style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{insight.category}</p>}
            </div>
          </div>
          <span style={{ background: bg, color, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, flexShrink: 0, letterSpacing: '0.07em', textTransform: 'uppercase', border: `1px solid ${bdr}` }}>
            {insight.impact || insight.severity || 'issue'}
          </span>
        </div>
        {/* Why / Fix / Outcome */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: insight.expectedOutcome ? 9 : 0 }}>
          <div className="ytg-inner-block">
            <p style={{ fontSize: 10, fontWeight: 500, color: '#a0a0b0', marginBottom: 5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Why now</p>
            <p style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.7 }}>{insight.whyNow || insight.cause}</p>
          </div>
          <div style={{ background: 'rgba(240,253,244,0.85)', border: '1px solid rgba(134,239,172,0.7)', borderRadius: 12, padding: '11px 13px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#15803d', marginBottom: 5, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Action</p>
            <p style={{ fontSize: 12.5, color: '#166534', lineHeight: 1.7 }}>{insight.action}</p>
          </div>
        </div>
        {insight.expectedOutcome && (
          <div style={{ background: 'rgba(239,246,255,0.85)', border: '1px solid rgba(147,197,253,0.7)', borderRadius: 12, padding: '9px 13px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.blue, marginBottom: 4, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Expected outcome</p>
            <p style={{ fontSize: 12.5, color: '#1e40af', lineHeight: 1.65 }}>{insight.expectedOutcome}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Nav icons ─────────────────────────────────────────────────────────── */
const NAV_ICONS = {
  Overview:      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="1.5" y="1.5" width="5" height="5" rx="1.5"/><rect x="8.5" y="1.5" width="5" height="5" rx="1.5"/><rect x="1.5" y="8.5" width="5" height="5" rx="1.5"/><rect x="8.5" y="8.5" width="5" height="5" rx="1.5"/></svg>,
  Insights:      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5,11 5,7 8,9 13.5,3.5"/><polyline points="10.5,3.5 13.5,3.5 13.5,6.5"/></svg>,
  Videos:        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="9" height="9" rx="2"/><path d="M10 6l4-2.5v8L10 9" fill="none"/></svg>,
  Patterns:      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="3" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="7.5" cy="7" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="3.5" r="1.2" fill="currentColor" stroke="none"/><line x1="3" y1="12" x2="7.5" y2="7"/><line x1="7.5" y1="7" x2="12" y2="3.5"/></svg>,
  Competitors:   <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="5.5" cy="5" r="2.5"/><path d="M1 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"/><circle cx="11" cy="5" r="2" /><path d="M13.5 12.5c0-1.8-1.1-3-2.5-3.3"/></svg>,
  Keywords:      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="6" cy="6" r="4"/><line x1="9" y1="9" x2="13.5" y2="13.5"/><line x1="4" y1="6" x2="8" y2="6"/><line x1="6" y1="4" x2="6" y2="8"/></svg>,
  'SEO Optimizer': <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="6.5" cy="6.5" r="4"/><line x1="9.5" y1="9.5" x2="13.5" y2="13.5"/></svg>,
  Settings:      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="7.5" cy="7.5" r="2"/><path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M3.2 3.2l1 1M10.8 10.8l1 1M3.2 11.8l1-1M10.8 4.2l1-1"/></svg>,
}

function NavBtn({ label, active, onClick, badge }) {
  return (
    <button className="ytg-nav-btn" onClick={onClick} style={{
      background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
      color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.38)',
      boxShadow: active ? 'inset 0 0 0 1px rgba(255,255,255,0.08)' : 'none',
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.38)' } }}
    >
      <span style={{ display: 'flex', flexShrink: 0, opacity: active ? 1 : 0.7 }}>{NAV_ICONS[label]}</span>
      <span style={{ flex: 1, letterSpacing: '-0.1px' }}>{label}</span>
      {badge > 0 && (
        <span style={{ background: '#3b82f6', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, letterSpacing: '0.02em' }}>{badge}</span>
      )}
    </button>
  )
}

/* ─── Dashboard ─────────────────────────────────────────────────────────── */
export default function Dashboard() {
  useDashboardStyles()

  const [data,    setData]   = useState(null)
  const [videos,  setVideos] = useState(null)
  const [error,   setError]  = useState(null)
  const [loading, setLoad]   = useState(true)
  const [nav,     setNav]    = useState('Overview')
  const [selectedVideoId, setSelectedVideoId] = useState(null)
  const [analyzingAI, setAnalyzingAI] = useState(false)
  const [checked, setChecked] = useState({})

  useEffect(() => {
    fetch('/auth/data', { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error('No data'); return r.json() })
      .then(d => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setVideos(d.videos || [])
        setLoad(false)
        if (d.insights === null) setAnalyzingAI(true)
        if (d.channel?.channel_id) {
          const saved = localStorage.getItem(`ytg_checked_${d.channel.channel_id}`)
          if (saved) setChecked(JSON.parse(saved))
        }
      })
      .catch(e => { setError(e.message); setLoad(false) })
  }, [])

  // Poll for AI analysis completion when insights are still pending
  useEffect(() => {
    if (!analyzingAI) return
    const interval = setInterval(() => {
      fetch('/auth/data', { credentials: 'include' })
        .then(r => r.json())
        .then(d => {
          if (d.insights !== null) {
            setData(d)
            setAnalyzingAI(false)
            clearInterval(interval)
          }
        })
        .catch(() => {})
    }, 4000)
    return () => clearInterval(interval)
  }, [analyzingAI])

  function handleVideoUpdated(videoId, changes) {
    setVideos(prev => prev.map(v => v.video_id === videoId ? { ...v, ...changes } : v))
  }

  function handleToggleCheck(key) {
    const next = { ...checked, [key]: !checked[key] }
    setChecked(next)
    if (data?.channel?.channel_id) {
      localStorage.setItem(`ytg_checked_${data.channel.channel_id}`, JSON.stringify(next))
    }
  }

  const score    = data?.insights?.channelScore ?? 0
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
    { label: 'Insights', badge: data?.insights?.priorityActions?.length },
    { label: 'Videos' },
    { label: 'Patterns' },
    { label: 'Competitors' },
    { label: 'Keywords' },
    { label: 'SEO Optimizer' },
    { label: 'Settings' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", background: C.bg }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════ */}
      <aside style={{
        width: 288, flexShrink: 0,
        background: 'linear-gradient(180deg, #131315 0%, #0e0e10 100%)',
        position: 'sticky', top: 0, height: '100vh',
        boxShadow: '1px 0 0 rgba(255,255,255,0.04), 16px 0 64px rgba(0,0,0,0.55)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* Brand */}
        <a href="/" style={{ padding: '22px 20px 18px', display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', flexShrink: 0 }}>
          <Logo size={26} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.4px', lineHeight: 1.15 }}>YTGrowth</p>
            <p style={{ fontSize: 9.5, fontWeight: 500, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>Analytics</p>
          </div>
        </a>

        {/* Channel block */}
        {data && (
          <div style={{ padding: '0 14px 16px' }}>
            {/* Channel card */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '11px 14px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 22,
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)',
            }}>
              {data.channel.thumbnail
                ? <img src={data.channel.thumbnail} alt="" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}/>
                : <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(229,37,27,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{data.channel.channel_name[0].toUpperCase()}</div>
              }
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.92)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.2px' }}>{data.channel.channel_name}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 2, fontWeight: 400 }}>{fmtNum(data.channel.subscribers)} subscribers</p>
              </div>
            </div>

            {/* Health bar */}
            <div style={{ padding: '13px 2px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Channel health</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontVariantNumeric: 'tabular-nums' }}>
                  {score}<span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)' }}> / 100</span>
                </span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 100, height: 4, overflow: 'hidden' }}>
                <div style={{ width: `${score}%`, height: '100%', background: `linear-gradient(90deg, ${scoreColor(score)}, ${scoreColor(score)}cc)`, borderRadius: 100, transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}/>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 400, marginTop: 6 }}>{scoreLabel(score)}</p>
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 8 }}/>

        {/* Nav */}
        <nav style={{ padding: '4px 10px', flex: 1, overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavBtn key={item.label} label={item.label} active={nav === item.label} onClick={() => setNav(item.label)} badge={item.badge} />
          ))}
        </nav>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }}/>

        {/* Disconnect */}
        <div style={{ padding: '14px 14px' }}>
          <a href="/auth/logout"
            style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12.5, textDecoration: 'none', fontWeight: 400, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.28)'; e.currentTarget.style.background = 'transparent' }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 2H2.5A1 1 0 0 0 1.5 3v7a1 1 0 0 0 1 1H5M9 9.5l3-3-3-3M12 6.5H5"/></svg>
            Disconnect
          </a>
        </div>
      </aside>

      {/* ══ MAIN ═════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, overflow: 'auto', background: '#f4f4f6' }}>

        {/* Topbar */}
        <div style={{
          borderBottom: '1px solid rgba(0,0,0,0.09)',
          background: 'rgba(240,240,243,0.9)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          padding: '0 36px', height: 58,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
          boxShadow: '0 1px 0 rgba(255,255,255,0.6)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#0a0a0f', letterSpacing: '-0.4px' }}>{nav}</span>
            {data && <>
              <span style={{ color: '#c4c4cc', fontSize: 15 }}>·</span>
              <span style={{ fontSize: 13.5, fontWeight: 400, color: '#9898a6', letterSpacing: '-0.1px' }}>{data.channel.channel_name}</span>
            </>}
          </div>
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 100, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px #dcfce7', animation: 'pulse 2.5s infinite' }}/>
            <span style={{ fontSize: 11.5, color: '#6b6b7b', fontWeight: 600, letterSpacing: '-0.1px' }}>Live</span>
          </div>
        </div>

        {/* Page */}
        <div style={{ padding: '28px 36px', animation: 'fadeUp 0.25s ease' }}>

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
              <a href="/" className="ytg-dash-btn-primary" style={{ textDecoration: 'none', marginTop: 8 }}>Connect channel →</a>
            </div>
          )}

          {/* ── OVERVIEW ─────────────────────────────────────────────── */}
          {data && nav === 'Overview' && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a0a0f', letterSpacing: '-0.7px', marginBottom: 5 }}>Good to see you.</h1>
                <p style={{ fontSize: 13.5, color: C.text3, letterSpacing: '-0.1px' }}>Here's how your channel is performing right now.</p>
              </div>

              {/* Row 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12, marginBottom: 12 }}>
                <Stat label="Subscribers"  value={fmtNum(data.channel.subscribers)}  sub="All time" />
                <Stat label="Total views"  value={fmtNum(data.channel.total_views)}  sub="All time" />
                <Stat label="Avg views"    value={fmtNum(avgViews)} sub={avgViews < 500 ? 'Below average' : 'On track'} alert={avgViews < 500} />
                <Stat label="Channel score" value={score} sub={score >= 75 ? 'Healthy' : score >= 50 ? 'Needs work' : 'Critical'} alert={score < 50} accent={scoreColor(score)} />
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
                    <p style={{ fontSize: 10.5, fontWeight: 500, color: '#a0a0b0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Top priority</p>
                  </div>

                  {analyzingAI && !data.insights && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0' }}>
                      <div style={{ width: 18, height: 18, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.red}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }}/>
                      <p style={{ fontSize: 13, color: C.text3 }}>AI audit running — check back in ~30s</p>
                    </div>
                  )}

                  {data.insights?.priorityActions?.[0] && (() => {
                    const ins = data.insights.priorityActions[0]
                    const s   = sev(ins.impact)
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                          <p style={{ fontSize: 15.5, fontWeight: 700, color: C.text1, letterSpacing: '-0.3px', flex: 1, lineHeight: 1.4 }}>{ins.problem}</p>
                          <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.07em', border: `1px solid ${s.bdr}` }}>{ins.impact}</span>
                        </div>
                        <p style={{ fontSize: 11, color: C.text3, marginBottom: 8 }}>{ins.category}</p>
                        <p style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.75, marginBottom: 13 }}>{ins.whyNow}</p>
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
                      <p style={{ fontSize: 10.5, fontWeight: 500, color: '#a0a0b0', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 9 }}>Recent video views</p>
                      <MiniBar videos={data.videos} />
                    </div>
                  )}
                </div>

                {/* Score ring card */}
                <div className="ytg-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <ScoreRing score={score} />
                  {data.insights?.categoryScores && (
                    <div style={{ width: '100%', marginTop: 14, paddingTop: 14, borderTop: `1px solid #ebebef` }}>
                      <p style={{ fontSize: 10.5, fontWeight: 500, color: '#a0a0b0', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 9 }}>Categories</p>
                      {[
                        ['Posting', data.insights.categoryScores.postingConsistency],
                        ['CTR', data.insights.categoryScores.ctrHealth],
                        ['Retention', data.insights.categoryScores.audienceRetention],
                        ['Engagement', data.insights.categoryScores.engagementQuality],
                        ['SEO', data.insights.categoryScores.seoDiscoverability],
                      ].map(([label, val]) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                          <span style={{ fontSize: 11.5, color: C.text2, flex: 1 }}>{label}</span>
                          <div style={{ width: 48, height: 4, background: '#ebebef', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${val}%`, height: '100%', background: scoreColor(val), borderRadius: 2 }}/>
                          </div>
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: scoreColor(val), fontVariantNumeric: 'tabular-nums', minWidth: 22, textAlign: 'right' }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Priority actions */}
              {data.insights?.priorityActions?.length > 0 && (
                <div className="ytg-card" style={{ padding: '20px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: C.text1, marginBottom: 2, letterSpacing: '-0.2px' }}>Priority actions</p>
                      <p style={{ fontSize: 12, color: C.text3 }}>{data.insights.priorityActions.length} items · ranked by impact</p>
                    </div>
                    <button onClick={() => setNav('Insights')} className="ytg-dash-btn">Full audit →</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {data.insights.priorityActions.map((ins, i) => {
                      const { color, bg, bdr } = sev(ins.impact)
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', background: '#f7f7fa', borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                          <div style={{ width: 22, height: 22, borderRadius: 6, background: bg, border: `1px solid ${bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{ins.rank}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.4 }}>{ins.problem}</p>
                            <p style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{ins.category}</p>
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color, background: bg, padding: '3px 9px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0, border: `1px solid ${bdr}` }}>
                            {ins.impact}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── INSIGHTS ─────────────────────────────────────────────── */}
          {data && nav === 'Insights' && analyzingAI && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 14 }}>
              <div style={{ width: 32, height: 32, border: `2.5px solid ${C.border}`, borderTop: `2.5px solid ${C.red}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.text1 }}>Running AI audit…</p>
              <p style={{ fontSize: 13, color: C.text3, maxWidth: 320, textAlign: 'center', lineHeight: 1.6 }}>Claude is analyzing your last 20 videos, CTR, retention, and posting patterns. This takes about 20–30 seconds.</p>
            </div>
          )}

          {data && nav === 'Insights' && data.insights && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.6px', marginBottom: 4 }}>Channel audit</h2>
                <p style={{ fontSize: 13, color: C.text3 }}>AI-powered analysis · {data.insights.priorityActions?.length ?? 0} priority actions</p>
              </div>

              {/* Summary + overall score */}
              {data.insights.channelSummary && (
                <div className="ytg-card" style={{ padding: '20px 24px', marginBottom: 14, borderLeft: `4px solid ${scoreColor(score)}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10.5, fontWeight: 500, color: '#a0a0b0', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>Assessment</p>
                      <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.75 }}>{data.insights.channelSummary}</p>
                    </div>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <ScoreRing score={score} />
                    </div>
                  </div>
                </div>
              )}

              {/* Category scores */}
              {data.insights.categoryScores && (
                <div className="ytg-card" style={{ padding: '20px 24px', marginBottom: 14 }}>
                  <p style={{ fontSize: 10.5, fontWeight: 500, color: '#a0a0b0', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14 }}>Category scores</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: 10 }}>
                    {[
                      ['Posting', data.insights.categoryScores.postingConsistency],
                      ['Length', data.insights.categoryScores.videoLength],
                      ['CTR', data.insights.categoryScores.ctrHealth],
                      ['Retention', data.insights.categoryScores.audienceRetention],
                      ['Engagement', data.insights.categoryScores.engagementQuality],
                      ['Strategy', data.insights.categoryScores.contentStrategy],
                      ['SEO', data.insights.categoryScores.seoDiscoverability],
                    ].map(([label, val]) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <div style={{ position: 'relative', width: 52, height: 52, margin: '0 auto 8px' }}>
                          <svg width="52" height="52" viewBox="0 0 52 52">
                            <circle cx="26" cy="26" r="20" fill="none" stroke="#ebebed" strokeWidth="5"/>
                            <circle cx="26" cy="26" r="20" fill="none" stroke={scoreColor(val)} strokeWidth="5"
                              strokeDasharray={`${(val / 100) * 125.7} 125.7`}
                              strokeLinecap="round"
                              transform="rotate(-90 26 26)"
                            />
                            <text x="26" y="30" textAnchor="middle" fill={scoreColor(val)} fontSize="11" fontWeight="800" fontFamily="Inter, sans-serif">{val}</text>
                          </svg>
                        </div>
                        <p style={{ fontSize: 10.5, color: C.text3, fontWeight: 500 }}>{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Priority actions */}
              {data.insights.priorityActions?.length > 0 && (() => {
                const actions = data.insights.priorityActions
                const doneCount = actions.filter(a => checked[`rank_${a.rank ?? (actions.indexOf(a) + 1)}`]).length
                return (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, letterSpacing: '-0.2px' }}>Priority actions</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 80, height: 4, background: '#ebebef', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${(doneCount / actions.length) * 100}%`, height: '100%', background: C.green, borderRadius: 2, transition: 'width 0.3s' }}/>
                        </div>
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: doneCount === actions.length ? C.green : C.text3, fontVariantNumeric: 'tabular-nums' }}>
                          {doneCount}/{actions.length}
                        </span>
                      </div>
                    </div>
                    {actions.map((ins, i) => {
                      const rank = ins.rank ?? (i + 1)
                      return (
                        <InsightCard
                          key={i}
                          insight={ins}
                          index={i}
                          checked={!!checked[`rank_${rank}`]}
                          onToggle={() => handleToggleCheck(`rank_${rank}`)}
                        />
                      )
                    })}
                  </div>
                )
              })()}

              {/* Quick wins + big risk */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                {data.insights.quickWins?.length > 0 && (
                  <div className="ytg-card" style={{ padding: '18px 20px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#15803d', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Quick wins</p>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {data.insights.quickWins.map((w, i) => {
                        const key = `qw_${i}`
                        return (
                          <li key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                            <input
                              type="checkbox"
                              checked={!!checked[key]}
                              onChange={() => handleToggleCheck(key)}
                              style={{ width: 15, height: 15, accentColor: C.green, cursor: 'pointer', flexShrink: 0, marginTop: 3 }}
                            />
                            <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>{w}</p>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
                <div className="ytg-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.insights.biggestRisk && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Biggest risk</p>
                      <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.65 }}>{data.insights.biggestRisk}</p>
                    </div>
                  )}
                  {data.insights.topPerformingPattern && (
                    <div style={{ paddingTop: data.insights.biggestRisk ? 12 : 0, borderTop: data.insights.biggestRisk ? `1px solid #ebebef` : 'none' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>What's working</p>
                      <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.65 }}>{data.insights.topPerformingPattern}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── VIDEOS ───────────────────────────────────────────────── */}
          {data && nav === 'Videos' && videos && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0a0a0f', letterSpacing: '-0.7px', marginBottom: 5 }}>Video performance</h2>
                <p style={{ fontSize: 13.5, color: C.text3, letterSpacing: '-0.1px' }}>{videos.length} videos — click Optimise to get AI feedback on title, description &amp; thumbnail</p>
              </div>
              <div className="ytg-card" style={{ overflow: 'hidden' }}>
                {/* Header row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 80px 90px 70px 90px 90px 130px', padding: '11px 20px', borderBottom: `1px solid #ebebef`, background: '#f8f8fb' }}>
                  {['Video', 'Duration', 'Views', 'Likes', 'Comments', 'Like rate', ''].map((h, i) => (
                    <p key={i} style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: i > 0 ? 'right' : 'left' }}>{h}</p>
                  ))}
                </div>
                {videos.map((v, i) => {
                  const lr     = v.views > 0 ? (v.likes / v.views * 100).toFixed(1) : 0
                  const lrN    = parseFloat(lr)
                  const lrColor = lrN >= 4 ? C.green : lrN >= 2 ? C.amber : C.red
                  const isSelected = selectedVideoId === v.video_id
                  const ytUrl  = v.video_id ? `https://www.youtube.com/watch?v=${v.video_id}` : null
                  const durMatch = (v.duration || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
                  const durSecs  = durMatch ? (+durMatch[1]||0)*3600 + (+durMatch[2]||0)*60 + (+durMatch[3]||0) : 0
                  const durLabel = durSecs > 0 ? (durSecs <= 60 ? `${durSecs}s` : `${Math.floor(durSecs/60)}:${String(durSecs%60).padStart(2,'0')}`) : '—'
                  const isShort  = durSecs > 0 && durSecs <= 60
                  return (
                    <div key={v.video_id || i}>
                      <div className="ytg-video-row" style={{
                        display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 80px 90px 70px 90px 90px 130px',
                        padding: '13px 20px',
                        borderBottom: !isSelected && i < videos.length - 1 ? `1px solid #f0f0f4` : 'none',
                        alignItems: 'center',
                        background: isSelected ? '#f0f5ff' : undefined,
                      }}>
                        {/* Thumbnail + title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            {v.thumbnail
                              ? <img src={v.thumbnail} alt="" style={{ width: 72, height: 45, borderRadius: 8, objectFit: 'cover', display: 'block' }}/>
                              : <div style={{ width: 72, height: 45, borderRadius: 8, background: '#ebebef' }}/>
                            }
                            {isShort && (
                              <span style={{ position: 'absolute', bottom: 3, left: 3, background: '#111', color: '#fff', fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 3, lineHeight: 1.4, letterSpacing: '0.04em' }}>SHORT</span>
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                              <p style={{ fontSize: 13, color: C.text1, fontWeight: 600, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</p>
                              {ytUrl && (
                                <a href={ytUrl} target="_blank" rel="noopener noreferrer"
                                  title="Watch on YouTube"
                                  style={{ flexShrink: 0, color: '#aaaabc', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                                  onMouseEnter={e => e.currentTarget.style.color = '#e5251b'}
                                  onMouseLeave={e => e.currentTarget.style.color = '#aaaabc'}
                                >
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M5.5 3H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8.5M8.5 1H13M13 1v4.5M13 1L6 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </a>
                              )}
                            </div>
                            <p style={{ fontSize: 11, color: C.text3 }}>{new Date(v.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>
                        {/* Duration */}
                        <p style={{ fontSize: 12.5, color: C.text3, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{durLabel}</p>
                        {/* Views */}
                        <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(v.views)}</p>
                        {/* Likes */}
                        <p style={{ fontSize: 13, color: C.text2, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(v.likes)}</p>
                        {/* Comments */}
                        <p style={{ fontSize: 13, color: C.text2, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(v.comments)}</p>
                        {/* Like rate */}
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: lrColor, background: lrN >= 4 ? C.greenBg : lrN >= 2 ? '#fffbeb' : C.redBg, padding: '3px 8px', borderRadius: 100, border: `1px solid ${lrN >= 4 ? C.greenBdr : lrN >= 2 ? '#fde68a' : C.redBdr}`, fontVariantNumeric: 'tabular-nums' }}>{lr}%</span>
                        </div>
                        {/* Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            onClick={() => setSelectedVideoId(isSelected ? null : v.video_id)}
                            className={isSelected ? '' : 'ytg-dash-btn'}
                            style={isSelected ? {
                              fontSize: 11.5, fontWeight: 700, color: C.blue,
                              background: '#eff6ff', border: `1px solid #bfdbfe`,
                              borderRadius: 100, padding: '5px 12px', cursor: 'pointer',
                              fontFamily: 'inherit', whiteSpace: 'nowrap',
                            } : { padding: '5px 12px', fontSize: 11.5, whiteSpace: 'nowrap' }}>
                            {isSelected ? '✕ Close' : 'Optimise'}
                          </button>
                        </div>
                      </div>
                      {isSelected && (
                        <VideoOptimizePanel
                          video={v}
                          onClose={() => setSelectedVideoId(null)}
                          onVideoUpdated={handleVideoUpdated}
                        />
                      )}
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
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.6px', marginBottom: 4 }}>Content patterns</h2>
                <p style={{ fontSize: 13, color: C.text3 }}>What's working and what isn't</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
                {[
                  { label: 'Shorts avg views',    value: fmtNum(patterns.shortAvg), verdict: patterns.shortAvg > patterns.longAvg ? 'Beats long-form' : 'Below long-form', good: patterns.shortAvg > patterns.longAvg },
                  { label: 'Long-form avg views', value: fmtNum(patterns.longAvg),  verdict: patterns.longAvg > patterns.shortAvg ? 'Beats Shorts'     : 'Below Shorts',    good: patterns.longAvg  > patterns.shortAvg },
                  { label: 'Overall like rate',   value: `${patterns.likeRate}%`,   verdict: patterns.likeRate >= 4 ? 'Healthy' : patterns.likeRate >= 2 ? 'Below target' : 'Critical', good: patterns.likeRate >= 4 },
                ].map(p => (
                  <div key={p.label} className="ytg-card" style={{ padding: '18px 20px' }}>
                    <p style={{ fontSize: 10.5, fontWeight: 500, color: '#a0a0b0', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 9 }}>{p.label}</p>
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
                      <p style={{ fontSize: 10.5, fontWeight: 500, color: '#a0a0b0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</p>
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

          {nav === 'Keywords' && <Keywords />}

          {nav === 'SEO Optimizer' && <SeoOptimizer />}

          {/* ── SETTINGS ─────────────────────────────────────────────── */}
          {nav === 'Settings' && (
            <div style={{ maxWidth: 440 }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.6px', marginBottom: 4 }}>Settings</h2>
                <p style={{ fontSize: 13, color: C.text3 }}>Manage your connection</p>
              </div>
              <div className="ytg-card" style={{ padding: '22px 24px' }}>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#a0a0b0', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 13 }}>Connected channel</p>
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
                <a href="/auth/logout" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: C.redBg, color: C.red, border: `1px solid ${C.redBdr}`, padding: '9px 17px', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none', fontFamily: 'inherit' }}>
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
