import { useEffect, useState, useRef } from 'react'
import Competitors from './Competitors'
import Settings from './Settings'
import SeoOptimizer from './SeoOptimizer'
import VideoOptimizePanel from './VideoOptimizePanel'
import Keywords from './Keywords'
import VideoIdeas from './VideoIdeas'
import ThumbnailScore from './ThumbnailScore'
import WeeklyReport from './WeeklyReport'
import UsageBar from '../components/UsageBar'

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
      html, body { background: #f1f1f6; color: #0f0f13; font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }

      @keyframes spin    { to { transform: rotate(360deg) } }
      @keyframes fadeUp  { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
      @keyframes pulse   { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }

      ::-webkit-scrollbar       { width: 4px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background: #e0e0e6; border-radius: 4px }
      ::-webkit-scrollbar-thumb:hover { background: #c8c8d0 }

      .ytg-stat-card {
        background: #ffffff;
        border: 1px solid #e6e6ec;
        border-radius: 16px;
        padding: 22px 24px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06);
        transition: box-shadow 0.2s, transform 0.2s;
        cursor: default;
      }
      .ytg-stat-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.09);
        transform: translateY(-2px);
      }
      .ytg-stat-card.alert {
        border-color: rgba(229,37,27,0.22);
        background: #fff8f8;
      }

      .ytg-card {
        background: #ffffff;
        border: 1px solid #e6e6ec;
        border-radius: 16px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06);
        transition: box-shadow 0.2s, transform 0.2s;
      }
      .ytg-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.09);
        transform: translateY(-1px);
      }

      .ytg-nav-btn {
        display: flex; align-items: center; gap: 10px;
        padding: 9px 13px; border-radius: 9px; cursor: pointer; text-align: left;
        font-size: 13.5px; font-family: 'Inter', system-ui, sans-serif;
        color: #4a4a58;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
        border: 1px solid transparent;
        box-shadow: none; outline: none; -webkit-appearance: none;
      }
      .ytg-nav-btn:hover:not(.active) {
        background: #f4f4f8; color: #0f0f13;
      }

      .ytg-video-row { transition: background 0.15s; }
      .ytg-video-row:hover { background: #f4f4f7 !important; }

      .ytg-insight-card {
        background: #ffffff;
        border: 1px solid #e6e6ec;
        border-radius: 14px;
        overflow: hidden;
        margin-bottom: 8px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06);
        transition: box-shadow 0.2s, transform 0.2s;
      }
      .ytg-insight-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.09);
        transform: translateY(-1px);
      }
      .ytg-inner-block {
        background: #f8f8fb;
        border: 1px solid #eeeef3;
        border-radius: 10px;
        padding: 10px 12px;
      }
      .ytg-insight-card.done {
        opacity: 0.48;
      }
      .ytg-qw-row {
        display: flex; gap: 9px; align-items: flex-start;
        padding: 9px 11px; border-radius: 10px;
        border: 1px solid transparent;
        transition: background 0.15s, border-color 0.15s;
      }
      .ytg-qw-row:hover {
        background: #f4f4f7; border-color: rgba(0,0,0,0.07);
      }
      .ytg-del-btn {
        width: 22px; height: 22px; border-radius: 6px;
        background: #fee2e2; border: 1px solid #fecaca;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; flex-shrink: 0; transition: background 0.15s;
      }
      .ytg-del-btn:hover { background: #fecaca; }

      .ytg-dash-btn {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 9px 20px; border-radius: 100px; border: 1px solid rgba(0,0,0,0.1);
        font-family: 'Inter', system-ui, sans-serif; font-size: 12.5px; font-weight: 600;
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
        font-family: 'Inter', system-ui, sans-serif; font-size: 12.5px; font-weight: 700;
        background: #e5251b; color: #fff; cursor: pointer;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32);
        transition: all 0.18s;
      }
      .ytg-dash-btn-primary:hover {
        filter: brightness(1.07); transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,37,27,0.42);
      }
      .ytg-optimise-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 6px 14px; border-radius: 100px;
        border: 1px solid rgba(255,255,255,0.18);
        font-family: 'Inter', system-ui, sans-serif; font-size: 11.5px; font-weight: 700;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        color: #fff; cursor: pointer; letter-spacing: 0.01em;
        box-shadow: 0 2px 6px rgba(0,0,0,0.28), 0 8px 24px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.08) inset;
        transition: all 0.18s;
        backdrop-filter: blur(8px);
      }
      .ytg-optimise-btn:hover {
        background: linear-gradient(135deg, #252540 0%, #1e2d50 100%);
        box-shadow: 0 4px 12px rgba(0,0,0,0.35), 0 16px 40px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.12) inset;
        transform: translateY(-1px);
        border-color: rgba(255,255,255,0.25);
      }
    `
    document.head.appendChild(style)
  }, [])
}

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const C = {
  red:      '#e5251b',
  redBg:    '#fff5f5',
  redBdr:   '#fecaca',
  green:    '#059669',
  greenBg:  '#ecfdf5',
  greenBdr: '#a7f3d0',
  amber:    '#d97706',
  amberBg:  '#fffbeb',
  amberBdr: '#fde68a',
  text1:    '#0f0f13',
  text2:    '#4a4a58',
  text3:    '#9595a4',
  border:   '#e6e6ec',
  bg:       '#f1f1f6',
  surface:  '#ffffff',
}

/* Severity palette — 3-color system: red critical, amber warnings, slate minor */
const SEV = {
  critical: { color: '#dc2626', bg: '#fff5f5', bdr: '#fecaca' },
  high:     { color: '#d97706', bg: '#fffbeb', bdr: '#fde68a' },
  medium:   { color: '#d97706', bg: '#fffbeb', bdr: '#fde68a' },
  low:      { color: '#6b7280', bg: '#f9fafb', bdr: '#e5e7eb' },
  info:     { color: '#059669', bg: '#ecfdf5', bdr: '#a7f3d0' },
}
function sev(severity) { return SEV[severity] || SEV.critical }

/* Plan badge helper */
function planBadge(plan) {
  if (!plan || plan === 'free') return { label: 'Free', color: '#6b7280', bg: 'rgba(107,114,128,0.08)', bdr: 'rgba(107,114,128,0.18)' }
  const isLife = plan.startsWith('lifetime_')
  const base   = isLife ? plan.replace('lifetime_', '') : plan
  const label  = base.charAt(0).toUpperCase() + base.slice(1) + (isLife ? ' ∞' : '')
  if (base === 'solo')   return { label, color: '#2563eb', bg: 'rgba(37,99,235,0.07)',   bdr: 'rgba(37,99,235,0.18)' }
  if (base === 'growth') return { label, color: '#059669', bg: 'rgba(5,150,105,0.07)',   bdr: 'rgba(5,150,105,0.18)' }
  if (base === 'agency') return { label, color: '#7c3aed', bg: 'rgba(124,58,237,0.07)', bdr: 'rgba(124,58,237,0.18)' }
  return { label, color: '#6b7280', bg: 'rgba(107,114,128,0.08)', bdr: 'rgba(107,114,128,0.18)' }
}

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
      <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.text3, marginBottom: 12 }}>{label}</p>
      <p style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-1.4px', color: col, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: alert ? C.red : C.text3, fontWeight: 500, marginTop: 10 }}>{sub}</p>}
    </div>
  )
}

/* ─── Insight card ──────────────────────────────────────────────────────── */
function categoryToNav(category, problem) {
  const c = (category || '').toLowerCase()
  const p = (problem || '').toLowerCase()
  if (c.includes('thumbnail') || p.includes('thumbnail')) return 'Thumbnail Score'
  if (c.includes('competitor') || p.includes('competitor')) return 'Competitors'
  if (c.includes('keyword') || p.includes('keyword')) return 'Keywords'
  if (c.includes('content') || c.includes('posting') || c.includes('frequency') || p.includes('content strategy') || p.includes('video idea')) return 'Video Ideas'
  if (c.includes('seo') || c.includes('ctr') || p.includes('title') || p.includes('description') || p.includes('tag')) return 'SEO Studio'
  return 'SEO Studio'
}

function InsightCard({ insight, index, checked, onToggle, onDelete, onNavigate }) {
  const { color } = sev(insight.impact || insight.severity)
  return (
    <div className={`ytg-insight-card${checked ? ' done' : ''}`} style={{ transition: 'opacity 0.2s', marginBottom: 10 }}>
      <div style={{ padding: '18px 22px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: checked ? 0 : 16 }}>
          {/* Checkbox + rank badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingTop: 2 }}>
            <input
              type="checkbox"
              checked={!!checked}
              onChange={onToggle}
              style={{ width: 15, height: 15, accentColor: C.green, cursor: 'pointer', flexShrink: 0 }}
            />
            <div style={{ width: 22, height: 22, borderRadius: 6, background: checked ? C.greenBg : `${color}15`, border: `1px solid ${checked ? C.greenBdr : color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {checked
                ? <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5,6.5 5,10 10.5,2"/></svg>
                : <span style={{ fontSize: 11, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{insight.rank ?? index + 1}</span>
              }
            </div>
          </div>

          {/* Problem + category */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: checked ? C.text3 : C.text1, lineHeight: 1.5, textDecoration: checked ? 'line-through' : 'none', marginBottom: insight.category ? 3 : 0 }}>{insight.problem}</p>
            {insight.category && <p style={{ fontSize: 11, color: C.text3, fontWeight: 500 }}>{insight.category}</p>}
          </div>

          {/* Severity badge + delete */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color, padding: '3px 9px', borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase', border: `1.5px solid ${color}` }}>
              {insight.impact || insight.severity || 'issue'}
            </span>
            {checked && onDelete && (
              <button className="ytg-del-btn" onClick={onDelete} title="Remove task">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#e5251b" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Body — hidden when done ── */}
        {!checked && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 8, marginLeft: 30 }}>

            {/* Why now */}
            <div style={{ background: '#f8f8fb', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Why now</p>
              <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.75 }}>{insight.whyNow || insight.cause}</p>
            </div>

            {/* Action */}
            <div style={{
              background: '#ffffff',
              border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${color}`,
              borderRadius: '0 10px 10px 0',
              padding: '12px 16px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
              display: 'flex', flexDirection: 'column',
            }}>
              <p style={{ fontSize: 10, fontWeight: 600, color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Action</p>
              <p style={{ fontSize: 13, color: C.text1, lineHeight: 1.75 }}>{insight.action}</p>
            </div>

            {/* Expected outcome */}
            {insight.expectedOutcome
              ? <div style={{ background: '#f8f8fb', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Expected outcome</p>
                  <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.75 }}>{insight.expectedOutcome}</p>
                </div>
              : <div />
            }

          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Nav icons ─────────────────────────────────────────────────────────── */
const NAV_ICONS = {
  Overview:          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="1" y="1" width="5" height="5" rx="1.5"/><rect x="8" y="1" width="5" height="5" rx="1.5"/><rect x="1" y="8" width="5" height="5" rx="1.5"/><rect x="8" y="8" width="5" height="5" rx="1.5"/></svg>,
  Videos:            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="9" height="8" rx="1.5"/><path d="M10 5.5l3.5-2v7L10 8.5"/></svg>,
  'SEO Studio':      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 11V8M5 11V6M8 11V4M11 11V2"/></svg>,
  'Thumbnail Score': <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="12" height="8" rx="1.5"/><path d="M5 6l2 2 4-3"/></svg>,
  'Video Ideas':     <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="7" cy="6" r="4"/><path d="M5 10.5h4M7 10.5v2.5"/><path d="M5.5 5.5l1.5 1 1.5-1"/></svg>,
  Keywords:          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="6" cy="6" r="4"/><line x1="9.2" y1="9.2" x2="13" y2="13"/></svg>,
  Competitors:       <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="5" cy="7" r="4"/><circle cx="9" cy="7" r="4"/></svg>,
  'Weekly Report':   <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="2" width="12" height="10" rx="2"/><path d="M1 6h12M4 2v4M10 2v4"/></svg>,
  Settings:          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="6.5" cy="6.5" r="1.8"/><path d="M6.5 1v1.2M6.5 10.8V12M1 6.5h1.2M10.8 6.5H12M2.8 2.8l.85.85M9.35 9.35l.85.85M2.8 10.2l.85-.85M9.35 4.65l.85-.85"/></svg>,
}

function NavBtn({ label, active, onClick, badge }) {
  return (
    <button
      className={`ytg-nav-btn${active ? ' active' : ''}`}
      onClick={onClick}
      style={{
        margin: '2px 12px',
        width: 'calc(100% - 24px)',
        background: active ? 'rgba(15,15,19,0.07)' : 'transparent',
        color: active ? C.text1 : C.text2,
        fontWeight: active ? 600 : 400,
        letterSpacing: '-0.1px',
        border: active ? '1px solid rgba(0,0,0,0.09)' : '1px solid transparent',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.color = C.text1 } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.color = C.text2 } }}
    >
      <span style={{ display: 'flex', flexShrink: 0, color: active ? C.text1 : '#c0c0cc' }}>{NAV_ICONS[label]}</span>
      <span style={{ flex: 1, letterSpacing: '-0.1px' }}>{label}</span>
      {badge > 0 && (
        <span style={{ background: C.amberBg, color: C.amber, border: `1px solid ${C.amberBdr}`, fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 20, minWidth: 18, textAlign: 'center' }}>{badge}</span>
      )}
    </button>
  )
}

/* ─── Channel switcher dropdown ─────────────────────────────────────────── */
function ChannelSwitcher({ channels, channelsAllowed, canAddMore, currentChannelId }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = channels.find(c => c.is_current) || channels[0]

  function scoreColor(s) { return s >= 75 ? '#16a34a' : s >= 50 ? '#d97706' : '#e5251b' }

  function doSwitch(channelId) {
    setOpen(false)
    fetch('/channels/switch', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_id: channelId }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) window.location.reload()
        else if (d.needs_auth) window.location.href = '/auth/login'
      })
  }

  function fmtSubs(n) {
    if (!n) return '0'
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
    return n.toLocaleString()
  }

  if (!current) return null

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        {current.channel_thumbnail
          ? <img src={current.channel_thumbnail} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1.5px solid rgba(0,0,0,0.08)' }} />
          : <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#e5251b', flexShrink: 0 }}>{(current.channel_name || '?')[0].toUpperCase()}</div>
        }
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#111114', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.2px' }}>{current.channel_name}</p>
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{fmtSubs(current.subscribers)} subscribers</p>
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="2,4 6,8 10,4" />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          background: '#ffffff',
          border: '0.5px solid rgba(0,0,0,0.1)',
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          padding: 6,
          zIndex: 100,
        }}>
          {channels.map(ch => (
            <div
              key={ch.channel_id}
              onClick={() => !ch.is_current && doSwitch(ch.channel_id)}
              style={{
                padding: '8px 10px', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 10,
                cursor: ch.is_current ? 'default' : 'pointer',
                background: 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!ch.is_current) e.currentTarget.style.background = '#f9fafb' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {ch.channel_thumbnail
                ? <img src={ch.channel_thumbnail} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#e5251b', flexShrink: 0 }}>{(ch.channel_name || '?')[0].toUpperCase()}</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#111114', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.channel_name}</p>
                <p style={{ fontSize: 12, color: '#9ca3af' }}>{fmtSubs(ch.subscribers)} subscribers</p>
              </div>
              {ch.is_current
                ? <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
                : ch.channel_score > 0
                  ? <span style={{ fontSize: 12, fontWeight: 500, color: scoreColor(ch.channel_score), background: '#f9fafb', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: '2px 7px', flexShrink: 0 }}>{ch.channel_score}</span>
                  : null
              }
            </div>
          ))}

          <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.06)', margin: '4px 4px' }} />

          {canAddMore
            ? <div
                onClick={() => { setOpen(false); window.location.href = '/auth/login' }}
                style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 14, color: '#e5251b', fontWeight: 500 }}>+ Connect another channel</span>
              </div>
            : <div
                onClick={() => { setOpen(false); window.location.href = '/#pricing' }}
                style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 14, color: '#9ca3af' }}>Upgrade to connect more channels</span>
              </div>
          }
        </div>
      )}
    </div>
  )
}

/* ─── First-time welcome banner ─────────────────────────────────────────── */
function FirstTimeWelcome({ data, onDismiss, onNavigate }) {
  const channelId = data?.channel?.channel_id
  if (!data?.insights || !channelId) return null
  if (localStorage.getItem(`ytg_welcomed_${channelId}`) === '1') return null

  const score = data.insights.channelScore ?? 0
  const top   = data.insights.priorityActions?.[0]
  const s     = top ? sev(top.impact) : null

  const scores = data.insights.categoryScores || {}
  const weakest = Object.entries(scores).sort((a, b) => a[1] - b[1])[0]?.[0] || ''

  let ctaLabel, ctaNav
  if (weakest.toLowerCase().includes('ctr') || weakest.toLowerCase().includes('seo')) {
    ctaLabel = 'Fix your titles →'
    ctaNav   = 'SEO Studio'
  } else if (weakest.toLowerCase().includes('content') || weakest.toLowerCase().includes('posting')) {
    ctaLabel = 'Get video ideas →'
    ctaNav   = 'Video Ideas'
  } else if (data.insights.competitorBenchmark === null) {
    ctaLabel = 'Analyse a competitor →'
    ctaNav   = 'Competitors'
  } else {
    ctaLabel = 'Score your thumbnail →'
    ctaNav   = 'Thumbnail Score'
  }

  function dismiss() {
    localStorage.setItem(`ytg_welcomed_${channelId}`, '1')
    onDismiss()
  }

  return (
    <div style={{
      position: 'relative',
      marginBottom: 20,
      background: '#ffffff',
      border: '1px solid rgba(0,0,0,0.09)',
      borderRadius: 20,
      boxShadow: '0 2px 6px rgba(0,0,0,0.08), 0 12px 40px rgba(0,0,0,0.10)',
      padding: '24px 28px',
      animation: 'fadeUp 0.3s ease',
    }}>
      {/* Dismiss button */}
      <button
        onClick={dismiss}
        style={{
          position: 'absolute', top: 16, right: 16,
          width: 24, height: 24, borderRadius: 8,
          background: 'rgba(0,0,0,0.05)', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round">
          <line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/>
        </svg>
      </button>

      <div style={{ display: 'flex', gap: 28, alignItems: 'stretch' }}>

        {/* LEFT — score */}
        <div style={{ flex: '0 0 auto', width: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, flexShrink: 0, animation: 'pulse 2s infinite' }}/>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your audit is ready</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, lineHeight: 1 }}>
            <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1, color: scoreColor(score), fontVariantNumeric: 'tabular-nums' }}>{score}</span>
            <span style={{ fontSize: 16, color: '#a0a0b0', fontWeight: 400, paddingBottom: 8 }}>/100</span>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: scoreColor(score), marginTop: 4 }}>{scoreLabel(score)}</p>
          {data.insights.channelSummary && (
            <p style={{
              fontSize: 12, color: '#52525b', lineHeight: 1.7, marginTop: 10,
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>{data.insights.channelSummary}</p>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: 'rgba(0,0,0,0.07)', alignSelf: 'stretch', flexShrink: 0 }}/>

        {/* CENTER — top priority */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Your #1 priority right now</p>
          {top && s ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 3 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111114', lineHeight: 1.4, flex: 1 }}>{top.problem}</p>
                <span style={{ background: s.bg, color: s.color, fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.07em', border: `1px solid ${s.bdr}` }}>{top.impact}</span>
              </div>
              {top.category && <p style={{ fontSize: 12, color: '#a0a0b0', marginTop: 3, marginBottom: 10 }}>{top.category}</p>}
              <div style={{ background: '#111114', borderRadius: 11, padding: '12px 15px' }}>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
                  <strong style={{ fontWeight: 700, color: '#4ade80' }}>Action — </strong>{top.action}
                </p>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 14, color: '#a0a0b0' }}>No priority actions found.</p>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: 'rgba(0,0,0,0.07)', alignSelf: 'stretch', flexShrink: 0 }}/>

        {/* RIGHT — CTA */}
        <div style={{ flex: '0 0 auto', width: 190, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Start here</p>
          <button
            className="ytg-dash-btn-primary"
            onClick={() => { onNavigate(ctaNav); dismiss() }}
            style={{ width: '100%', justifyContent: 'center', fontSize: 14 }}
          >
            {ctaLabel}
          </button>
          <button
            onClick={dismiss}
            style={{
              fontSize: 12, color: '#9ca3af', textAlign: 'center',
              cursor: 'pointer', background: 'none', border: 'none',
              fontFamily: 'inherit', textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            See full audit
          </button>
        </div>

      </div>
    </div>
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
  const [refreshingStats, setRefreshingStats] = useState(false)
  const [checked,  setChecked]  = useState({})
  const [deleted,  setDeleted]  = useState({})
  const [channels, setChannels] = useState([])
  const [channelsAllowed, setChannelsAllowed] = useState(1)
  const [canAddMore, setCanAddMore] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [billingPlan, setBillingPlan] = useState(null)

  useEffect(() => {
    fetch('/auth/data', { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error('No data'); return r.json() })
      .then(d => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setVideos(d.videos || [])
        setLoad(false)
        if (d.insights === null) setAnalyzingAI(true)
        if (d.insights && d.channel?.channel_id) {
          const wKey = `ytg_welcomed_${d.channel.channel_id}`
          if (!localStorage.getItem(wKey)) setShowWelcome(true)
        }
        if (d.channel?.channel_id) {
          const saved = localStorage.getItem(`ytg_checked_${d.channel.channel_id}`)
          if (saved) setChecked(JSON.parse(saved))
          const savedDel = localStorage.getItem(`ytg_deleted_${d.channel.channel_id}`)
          if (savedDel) setDeleted(JSON.parse(savedDel))
        }
      })
      .catch(e => { setError(e.message); setLoad(false) })

    // Load channel list for switcher
    fetch('/channels/list', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          setChannels(d.channels || [])
          setChannelsAllowed(d.channels_allowed || 1)
          setCanAddMore(d.can_add_more || false)
        }
      })
      .catch(() => {})
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

  function handleDelete(key) {
    const nextDel = { ...deleted, [key]: true }
    const nextChk = { ...checked }
    delete nextChk[key]
    setDeleted(nextDel)
    setChecked(nextChk)
    if (data?.channel?.channel_id) {
      localStorage.setItem(`ytg_deleted_${data.channel.channel_id}`, JSON.stringify(nextDel))
      localStorage.setItem(`ytg_checked_${data.channel.channel_id}`, JSON.stringify(nextChk))
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

  const mainNavItems = [
    { label: 'Overview' },
    { label: 'Videos' },
    { label: 'SEO Studio' },
    { label: 'Keywords' },
    { label: 'Competitors' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", background: C.bg }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════ */}
      <aside style={{
        width: 320, flexShrink: 0,
        background: '#ffffff',
        borderRight: `1px solid ${C.border}`,
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        zIndex: 10,
      }}>

        {/* Brand */}
        <a href="/" style={{ padding: '22px 22px 18px', display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
          <Logo size={26} />
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text1, letterSpacing: '-0.5px', lineHeight: 1 }}>YTGrowth</span>
          {(() => { const pb = planBadge(billingPlan); return (
            <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: pb.color, background: pb.bg, border: `1px solid ${pb.bdr}`, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.07em', textTransform: 'uppercase', flexShrink: 0 }}>{pb.label}</span>
          ) })()}
        </a>

        {/* Channel profile block */}
        {data && (
          <div style={{ padding: '16px 22px 14px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            {/* Avatar + name */}
            {channels.length >= 2
              ? <div style={{ marginBottom: 14 }}>
                  <ChannelSwitcher
                    channels={channels}
                    channelsAllowed={channelsAllowed}
                    canAddMore={canAddMore}
                    currentChannelId={data.channel.channel_id}
                  />
                </div>
              : <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  {data.channel.thumbnail
                    ? <img src={data.channel.thumbnail} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: `0 0 0 2.5px #fff, 0 0 0 4.5px ${scoreColor(score)}, 0 0 14px ${scoreColor(score)}55` }}/>
                    : <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.redBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: C.red, flexShrink: 0, boxShadow: `0 0 0 2.5px #fff, 0 0 0 4.5px ${scoreColor(score)}, 0 0 14px ${scoreColor(score)}55` }}>{data.channel.channel_name[0].toUpperCase()}</div>
                  }
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.2px' }}>{data.channel.channel_name}</p>
                    <p style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>{fmtNum(data.channel.subscribers)} subs</p>
                  </div>
                </div>
            }
            {/* Health score bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.04em' }}>Channel health</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(score), fontVariantNumeric: 'tabular-nums' }}>{score}<span style={{ fontSize: 11, fontWeight: 500, color: C.text3 }}>/100</span></span>
              </div>
              <div style={{ background: '#eeeef3', borderRadius: 99, height: 5, overflow: 'hidden' }}>
                <div style={{ width: `${score}%`, height: '100%', background: scoreColor(score), borderRadius: 99, transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}/>
              </div>
              <p style={{ fontSize: 12, fontWeight: 500, marginTop: 5, color: scoreColor(score) }}>{scoreLabel(score)}</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ overflowY: 'auto', flex: 1, paddingTop: 8, paddingBottom: 8 }}>

          {/* Section: OPTIMIZE */}
          <div style={{ padding: '14px 22px 6px' }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#b8b8c8', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Optimize</span>
          </div>
          <NavBtn label="Overview"       active={nav === 'Overview'}       onClick={() => setNav('Overview')} />
          <NavBtn label="Videos"         active={nav === 'Videos'}         onClick={() => setNav('Videos')} badge={5} />
          <NavBtn label="Weekly Report"  active={nav === 'Weekly Report'}  onClick={() => setNav('Weekly Report')} />

          {/* Section: CREATE */}
          <div style={{ padding: '18px 22px 6px' }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#b8b8c8', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Create</span>
          </div>
          <NavBtn label="SEO Studio"      active={nav === 'SEO Studio'}      onClick={() => setNav('SEO Studio')} />
          <NavBtn label="Thumbnail Score" active={nav === 'Thumbnail Score'} onClick={() => setNav('Thumbnail Score')} />
          <NavBtn label="Video Ideas"     active={nav === 'Video Ideas'}     onClick={() => setNav('Video Ideas')} />

          {/* Section: RESEARCH */}
          <div style={{ padding: '18px 22px 6px' }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#b8b8c8', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Research</span>
          </div>
          <NavBtn label="Keywords"    active={nav === 'Keywords'}    onClick={() => setNav('Keywords')} />
          <NavBtn label="Competitors" active={nav === 'Competitors'} onClick={() => setNav('Competitors')} />

          <div style={{ height: 1, background: C.border, margin: '16px 20px 8px' }}/>

          <NavBtn label="Settings" active={nav === 'Settings'} onClick={() => setNav('Settings')} />

        </nav>

        {/* Usage bar */}
        {data && (
          <div style={{
            padding: '16px 22px',
            borderTop: `1px solid ${C.border}`,
            flexShrink: 0,
          }}>
            <UsageBar
              channelId={data.channel?.channel_id}
              email={data.channel?.email}
              dark={false}
              onPlan={setBillingPlan}
            />
          </div>
        )}

        {/* Footer: Sign Out */}
        <div style={{ padding: '10px 22px 16px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
          <a
            href="/auth/logout"
            style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.text3, fontSize: 13, fontWeight: 500, textDecoration: 'none', padding: '6px 8px', borderRadius: 8, transition: 'color 0.15s, background 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = C.text2; e.currentTarget.style.background = '#f4f4f8' }}
            onMouseLeave={e => { e.currentTarget.style.color = C.text3; e.currentTarget.style.background = 'transparent' }}
          >
            <svg width="14" height="14" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 2H2.5A1 1 0 0 0 1.5 3v7a1 1 0 0 0 1 1H5M9 9.5l3-3-3-3M12 6.5H5"/></svg>
            Sign out
          </a>
        </div>
      </aside>

      {/* ══ MAIN ═════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, overflow: 'auto', background: C.bg }}>

        {/* Topbar */}
        <div style={{
          borderBottom: `1px solid ${C.border}`,
          background: 'rgba(241,241,246,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '0 32px', height: 52,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text1, letterSpacing: '-0.3px' }}>{nav}</span>
            {data && <>
              <span style={{ color: C.border, fontSize: 14 }}>·</span>
              <span style={{ fontSize: 13, fontWeight: 400, color: C.text3, letterSpacing: '-0.1px' }}>{data.channel.channel_name}</span>
            </>}
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 100, padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2.5s infinite' }}/>
            <span style={{ fontSize: 12, color: C.text3, fontWeight: 600 }}>Live</span>
          </div>
        </div>

        {/* Page */}
        <div style={{ padding: '36px 40px 72px', animation: 'fadeUp 0.25s ease' }}>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 14 }}>
              <div style={{ width: 32, height: 32, border: `2.5px solid ${C.border}`, borderTop: `2.5px solid ${C.red}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
              <p style={{ color: C.text3, fontSize: 14, fontWeight: 500 }}>Analyzing your channel…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: C.redBg, border: `1px solid ${C.redBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚠</div>
              <p style={{ fontSize: 18, fontWeight: 700, color: C.text1, letterSpacing: '-0.4px' }}>No channel data</p>
              <p style={{ fontSize: 14, color: C.text2, maxWidth: 280, lineHeight: 1.7 }}>Connect your YouTube channel to see your analytics.</p>
              <a href="/auth/login" className="ytg-dash-btn-primary" style={{ textDecoration: 'none', marginTop: 8 }}>Connect channel →</a>
            </div>
          )}

          {/* ── OVERVIEW ─────────────────────────────────────────────── */}
          {data && nav === 'Overview' && (
            <>
              {showWelcome && data?.insights && (
                <FirstTimeWelcome
                  data={data}
                  onDismiss={() => {
                    const key = `ytg_welcomed_${data.channel.channel_id}`
                    localStorage.setItem(key, '1')
                    setShowWelcome(false)
                  }}
                  onNavigate={tab => {
                    setNav(tab)
                    const key = `ytg_welcomed_${data.channel.channel_id}`
                    localStorage.setItem(key, '1')
                    setShowWelcome(false)
                  }}
                />
              )}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 6 }}>Good to see you.</h1>
                  <p style={{ fontSize: 13, color: C.text3, display: 'flex', gap: 0, flexWrap: 'wrap' }}>
                    {data.stats_fetched_at && (
                      <span>Stats from {(() => {
                          const diff = Math.round((Date.now() - new Date(data.stats_fetched_at).getTime()) / 60000)
                          if (diff < 1)  return 'just now'
                          if (diff < 60) return `${diff}m ago`
                          const h = Math.round(diff / 60)
                          if (h < 24)   return `${h}h ago`
                          return `${Math.round(h / 24)}d ago`
                        })()}
                      </span>
                    )}
                    {data.analyzed_at && (
                      <span style={{ marginLeft: 8 }}>· Audited {(() => {
                          const diff = Math.round((Date.now() - new Date(data.analyzed_at).getTime()) / 60000)
                          if (diff < 1)  return 'just now'
                          if (diff < 60) return `${diff}m ago`
                          const h = Math.round(diff / 60)
                          if (h < 24)   return `${h}h ago`
                          return `${Math.round(h / 24)}d ago`
                        })()}
                      </span>
                    )}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginBottom: 2 }}>
                  <button
                    className="ytg-dash-btn"
                    disabled={analyzingAI}
                    onClick={() => {
                      setAnalyzingAI(true)
                      setData(prev => ({ ...prev, insights: null }))
                      fetch('/auth/refresh-analysis', { method: 'POST', credentials: 'include' })
                        .catch(() => setAnalyzingAI(false))
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M11.5 2A6 6 0 1 0 12 6.5"/><path d="M11.5 2v3h-3"/>
                    </svg>
                    {analyzingAI ? 'Auditing…' : <><span>Re-Audit</span><span style={{ fontSize: 11, fontWeight: 500, color: '#a0a0b0', marginLeft: 2 }}>· 1 credit</span></>}
                  </button>
                  <button
                    className="ytg-dash-btn"
                    disabled={refreshingStats}
                    onClick={() => {
                      setRefreshingStats(true)
                      fetch('/auth/refresh-stats', { method: 'POST', credentials: 'include' })
                        .then(r => r.json())
                        .then(d => {
                          if (!d.error) {
                            setData(prev => ({
                              ...prev,
                              channel: d.channel,
                              videos: d.videos,
                              stats_fetched_at: d.stats_fetched_at,
                            }))
                            setVideos(d.videos || [])
                          }
                        })
                        .catch(() => {})
                        .finally(() => setRefreshingStats(false))
                    }}
                  >
                    {refreshingStats ? 'Refreshing…' : 'Refresh stats'}
                  </button>
                </div>
              </div>

              {/* Row 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16, marginBottom: 16 }}>
                <Stat label="Subscribers"  value={fmtNum(data.channel.subscribers)}  sub="All time" />
                <Stat label="Total views"  value={fmtNum(data.channel.total_views)}  sub="All time" />
                <Stat label="Avg views"    value={fmtNum(avgViews)} sub={avgViews < 500 ? 'Below average' : 'On track'} alert={avgViews < 500} />
                <Stat label="Channel score" value={score} sub={score >= 75 ? 'Healthy' : score >= 50 ? 'Needs work' : 'Critical'} alert={score < 50} accent={scoreColor(score)} />
              </div>

              {/* Row 2 */}
              {data.analytics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16, marginBottom: 0 }}>
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

            </>
          )}

          {/* ── INSIGHTS ─────────────────────────────────────────────── */}
          {data && nav === 'Overview' && analyzingAI && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 14 }}>
              <div style={{ width: 32, height: 32, border: `2.5px solid ${C.border}`, borderTop: `2.5px solid ${C.red}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.text1 }}>Running AI audit…</p>
              <p style={{ fontSize: 14, color: C.text3, maxWidth: 320, textAlign: 'center', lineHeight: 1.6 }}>Claude is analyzing your last 20 videos, CTR, retention, and posting patterns. This takes about 20–30 seconds.</p>
            </div>
          )}

          {data && nav === 'Overview' && data.insights && (
            <>
              <div style={{ marginBottom: 20, marginTop: 44 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Channel audit</h2>
                <p style={{ fontSize: 13, color: C.text3 }}>{data.insights.priorityActions?.length ?? 0} priority actions{data.analyzed_at ? ` · Audited ${new Date(data.analyzed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}</p>
              </div>

              {/* Summary + overall score */}
              {data.insights.channelSummary && (
                <div className="ytg-card" style={{ padding: '28px 32px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
                    {/* Score ring — left */}
                    <div style={{ flexShrink: 0, textAlign: 'center' }}>
                      <ScoreRing score={score} />
                      <p style={{ fontSize: 11, color: C.text3, fontWeight: 500, marginTop: 4, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Overall</p>
                    </div>
                    {/* Divider */}
                    <div style={{ width: 1, alignSelf: 'stretch', background: C.border, flexShrink: 0 }}/>
                    {/* Summary text */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>AI assessment</p>
                      <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.85 }}>{data.insights.channelSummary}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Category scores */}
              {data.insights.categoryScores && (
                <div className="ytg-card" style={{ padding: '24px 32px', marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>Category breakdown</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 40px' }}>
                    {[
                      ['Posting consistency', data.insights.categoryScores.postingConsistency],
                      ['CTR health',          data.insights.categoryScores.ctrHealth],
                      ['Video length',        data.insights.categoryScores.videoLength],
                      ['Audience retention',  data.insights.categoryScores.audienceRetention],
                      ['Engagement quality',  data.insights.categoryScores.engagementQuality],
                      ['Content strategy',    data.insights.categoryScores.contentStrategy],
                      ['SEO discoverability', data.insights.categoryScores.seoDiscoverability],
                    ].map(([label, val]) => {
                      const col = scoreColor(val)
                      return (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <span style={{ fontSize: 13, color: C.text2, fontWeight: 400, flexShrink: 0, width: 148 }}>{label}</span>
                          <div style={{ flex: 1, height: 4, background: '#eeeef3', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ width: `${val}%`, height: '100%', background: col, borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}/>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: col, fontVariantNumeric: 'tabular-nums', minWidth: 26, textAlign: 'right' }}>{val}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Priority actions */}
              {data.insights.priorityActions?.length > 0 && (() => {
                const allActions = data.insights.priorityActions
                const actions = allActions.filter((a, i) => !deleted[`rank_${a.rank ?? (i + 1)}`])
                const doneCount = actions.filter((a, i) => {
                  const rank = a.rank ?? (allActions.indexOf(a) + 1)
                  return checked[`rank_${rank}`]
                }).length
                const hasDone = doneCount > 0
                return (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontSize: 18, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px' }}>Priority actions</p>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.text3, background: '#f1f1f6', padding: '2px 8px', borderRadius: 20, border: '1px solid #e6e6ec' }}>{actions.length}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {hasDone && (
                          <button
                            onClick={() => {
                              const nextDel = { ...deleted }
                              const nextChk = { ...checked }
                              actions.forEach(a => {
                                const rank = a.rank ?? (allActions.indexOf(a) + 1)
                                const k = `rank_${rank}`
                                if (nextChk[k]) { nextDel[k] = true; delete nextChk[k] }
                              })
                              setDeleted(nextDel)
                              setChecked(nextChk)
                              if (data?.channel?.channel_id) {
                                localStorage.setItem(`ytg_deleted_${data.channel.channel_id}`, JSON.stringify(nextDel))
                                localStorage.setItem(`ytg_checked_${data.channel.channel_id}`, JSON.stringify(nextChk))
                              }
                            }}
                            style={{ fontSize: 12, fontWeight: 600, color: C.red, background: C.redBg, border: `1px solid ${C.redBdr}`, borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                          >
                            Clear completed
                          </button>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 72, height: 4, background: '#ebebef', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: actions.length ? `${(doneCount / actions.length) * 100}%` : '0%', height: '100%', background: C.green, borderRadius: 2, transition: 'width 0.4s' }}/>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: doneCount > 0 && doneCount === actions.length ? C.green : C.text3, fontVariantNumeric: 'tabular-nums' }}>
                            {doneCount}/{actions.length}
                          </span>
                        </div>
                      </div>
                    </div>
                    {actions.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '32px 20px', background: C.greenBg, border: `1px solid ${C.greenBdr}`, borderRadius: 16 }}>
                        <p style={{ fontSize: 22, marginBottom: 6 }}>✓</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: C.green, marginBottom: 4 }}>All tasks cleared</p>
                        <p style={{ fontSize: 14, color: '#166534' }}>Great work — you've handled every priority action.</p>
                      </div>
                    )}
                    {actions.map((ins, i) => {
                      const rank = ins.rank ?? (allActions.indexOf(ins) + 1)
                      const key = `rank_${rank}`
                      return (
                        <InsightCard
                          key={rank}
                          insight={ins}
                          index={i}
                          checked={!!checked[key]}
                          onToggle={() => handleToggleCheck(key)}
                          onDelete={() => handleDelete(key)}
                          onNavigate={setNav}
                        />
                      )
                    })}
                  </div>
                )
              })()}

              {/* Quick wins + big risk */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {data.insights.quickWins?.length > 0 && (() => {
                  const wins = data.insights.quickWins.filter((_, i) => !deleted[`qw_${i}`])
                  return (
                    <div className="ytg-card" style={{ padding: '20px 22px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Quick wins</p>
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.text3, background: '#f1f1f6', padding: '2px 7px', borderRadius: 20, border: '1px solid #e6e6ec' }}>{wins.length} left</span>
                      </div>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {data.insights.quickWins.map((w, i) => {
                          if (deleted[`qw_${i}`]) return null
                          const key = `qw_${i}`
                          const isDone = !!checked[key]
                          return (
                            <li key={i} className="ytg-qw-row" style={{ opacity: isDone ? 0.5 : 1 }}>
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => handleToggleCheck(key)}
                                style={{ width: 14, height: 14, accentColor: C.green, cursor: 'pointer', flexShrink: 0, marginTop: 3 }}
                              />
                              <p style={{ fontSize: 14, color: isDone ? C.text3 : C.text2, lineHeight: 1.6, flex: 1, textDecoration: isDone ? 'line-through' : 'none' }}>{w}</p>
                              {isDone && (
                                <button className="ytg-del-btn" onClick={() => handleDelete(key)} title="Remove">
                                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="#e5251b" strokeWidth="1.8" strokeLinecap="round">
                                    <line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/>
                                  </svg>
                                </button>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )
                })()}
                <div className="ytg-card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {data.insights.biggestRisk && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Biggest risk</p>
                      <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.65 }}>{data.insights.biggestRisk}</p>
                    </div>
                  )}
                  {data.insights.topPerformingPattern && (
                    <div style={{ paddingTop: data.insights.biggestRisk ? 16 : 0, borderTop: data.insights.biggestRisk ? `1px solid ${C.border}` : 'none' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>What's working</p>
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
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0a0a0f', letterSpacing: '-0.7px', marginBottom: 5 }}>Video performance</h2>
                  <p style={{ fontSize: 14, color: C.text3, letterSpacing: '-0.1px' }}>{videos.length} videos — click Optimise to get AI feedback on title, description &amp; thumbnail</p>
                </div>
                <button
                  className="ytg-dash-btn"
                  disabled={refreshingStats}
                  onClick={() => {
                    setRefreshingStats(true)
                    fetch('/auth/refresh-stats', { method: 'POST', credentials: 'include' })
                      .then(r => r.json())
                      .then(d => {
                        if (!d.error) {
                          setData(prev => ({ ...prev, channel: d.channel, videos: d.videos, stats_fetched_at: d.stats_fetched_at }))
                          setVideos(d.videos || [])
                        }
                      })
                      .catch(() => {})
                      .finally(() => setRefreshingStats(false))
                  }}
                  style={{ flexShrink: 0, marginBottom: 2 }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M11.5 2A6 6 0 1 0 12 6.5"/><path d="M11.5 2v3h-3"/>
                  </svg>
                  {refreshingStats ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>

              {/* Card grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 14 }}>
                {videos.map((v, i) => {
                  const lr      = v.views > 0 ? (v.likes / v.views * 100).toFixed(1) : null
                  const lrN     = lr !== null ? parseFloat(lr) : null
                  const lrColor = lrN === null ? C.text3 : lrN >= 3 ? C.green : lrN >= 1 ? C.amber : C.red
                  const lrBg    = lrN === null ? '#f5f5f9'   : lrN >= 3 ? C.greenBg : lrN >= 1 ? '#fffbeb' : C.redBg
                  const lrBdr   = lrN === null ? C.border    : lrN >= 3 ? C.greenBdr : lrN >= 1 ? '#fde68a' : C.redBdr
                  const isSelected = selectedVideoId === v.video_id
                  const ytUrl   = v.video_id ? `https://www.youtube.com/watch?v=${v.video_id}` : null
                  const durMatch = (v.duration || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
                  const durSecs  = durMatch ? (+durMatch[1]||0)*3600 + (+durMatch[2]||0)*60 + (+durMatch[3]||0) : 0
                  const durLabel = durSecs > 0 ? (durSecs <= 60 ? `${durSecs}s` : `${Math.floor(durSecs/60)}:${String(durSecs%60).padStart(2,'0')}`) : null
                  const isShort  = durSecs > 0 && durSecs <= 60
                  return (
                    <div key={v.video_id || i} className="ytg-card" style={{ display: 'flex', flexDirection: 'column' }}>
                      {/* Thumbnail */}
                      <a href={ytUrl || '#'} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'block', position: 'relative', textDecoration: 'none', flexShrink: 0, borderRadius: '19px 19px 0 0', overflow: 'hidden' }}>
                        {v.thumbnail || v.video_id
                          ? <img
                              src={v.video_id ? `https://i.ytimg.com/vi/${v.video_id}/hqdefault.jpg` : v.thumbnail}
                              alt=""
                              style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
                              onError={e => { e.target.onerror = null; e.target.src = v.thumbnail || '' }}
                            />
                          : <div style={{ width: '100%', aspectRatio: '16/9', background: '#ebebef' }}/>
                        }
                        {isShort && (
                          <span style={{ position: 'absolute', top: 8, left: 8, background: '#111', color: '#fff', fontSize: 12, fontWeight: 800, padding: '2px 6px', borderRadius: 4, letterSpacing: '0.06em' }}>SHORT</span>
                        )}
                        {durLabel && (
                          <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.72)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '2px 7px', borderRadius: 5, fontVariantNumeric: 'tabular-nums' }}>{durLabel}</span>
                        )}
                      </a>

                      {/* Body */}
                      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        {/* Title */}
                        <p style={{
                          fontSize: 14, fontWeight: 600, color: C.text1, lineHeight: 1.45, marginBottom: 5,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>{v.title}</p>
                        <p style={{ fontSize: 12, color: C.text3, marginBottom: 14 }}>
                          {new Date(v.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>

                        {/* Stats row */}
                        <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
                          {[['Views', fmtNum(v.views), C.text1, true], ['Likes', fmtNum(v.likes), C.text2, false], ['Comments', fmtNum(v.comments), C.text2, false]].map(([label, val, col, bold]) => (
                            <div key={label}>
                              <p style={{ fontSize: 16, fontWeight: bold ? 800 : 600, color: col, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px', lineHeight: 1 }}>{val}</p>
                              <p style={{ fontSize: 12, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>{label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Footer: like rate + optimise + Score This */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12, borderTop: `1px solid #f0f0f4` }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: lrColor, background: lrBg, padding: '4px 10px', borderRadius: 100, border: `1px solid ${lrBdr}`, fontVariantNumeric: 'tabular-nums' }}>
                            {lrN !== null ? `${lr}% likes` : '— likes'}
                          </span>
                          <button
                            onClick={() => setSelectedVideoId(v.video_id)}
                            className="ytg-optimise-btn">
                            Optimise
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Optimise panel — modal overlay */}
              {selectedVideoId && (() => {
                const sv = videos.find(v => v.video_id === selectedVideoId)
                return sv ? (
                  <div
                    onClick={e => { if (e.target === e.currentTarget) setSelectedVideoId(null) }}
                    style={{
                      position: 'fixed', inset: 0, zIndex: 200,
                      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)',
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                      padding: '40px 24px 24px', overflowY: 'auto',
                    }}
                  >
                    <div style={{ width: '100%', maxWidth: 900, flexShrink: 0 }}>
                      <VideoOptimizePanel
                        video={sv}
                        onClose={() => setSelectedVideoId(null)}
                        onVideoUpdated={handleVideoUpdated}
                      />
                    </div>
                  </div>
                ) : null
              })()}
            </>
          )}

          {/* ── PATTERNS ─────────────────────────────────────────────── */}
          {data && nav === 'Overview' && patterns && (
            <>
              <div style={{ marginBottom: 20, marginTop: 44 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Content patterns</h2>
                <p style={{ fontSize: 13, color: C.text3 }}>What's working and what isn't</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16, marginBottom: 16 }}>
                {[
                  { label: 'Shorts avg views',    value: fmtNum(patterns.shortAvg), verdict: patterns.shortAvg > patterns.longAvg ? 'Beats long-form' : 'Below long-form', good: patterns.shortAvg > patterns.longAvg },
                  { label: 'Long-form avg views', value: fmtNum(patterns.longAvg),  verdict: patterns.longAvg > patterns.shortAvg ? 'Beats Shorts'     : 'Below Shorts',    good: patterns.longAvg  > patterns.shortAvg },
                  { label: 'Overall like rate',   value: `${patterns.likeRate}%`,   verdict: patterns.likeRate >= 3 ? 'Healthy' : patterns.likeRate >= 1 ? 'Average' : 'Below average', good: patterns.likeRate >= 3 },
                ].map(p => (
                  <div key={p.label} className="ytg-card" style={{ padding: '20px 22px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>{p.label}</p>
                    <p style={{ fontSize: 26, fontWeight: 800, color: C.text1, letterSpacing: '-0.8px', marginBottom: 10, fontVariantNumeric: 'tabular-nums' }}>{p.value}</p>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color:   p.good ? C.green  : C.amber,
                      background: 'transparent',
                      padding: '3px 10px', borderRadius: 20,
                      border: `1.5px solid ${p.good ? C.greenBdr : C.amberBdr}`,
                    }}>{p.verdict}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {[
                  { label: 'Best performing',  video: patterns.bestVideo,  isGood: true  },
                  { label: 'Worst performing', video: patterns.worstVideo, isGood: false },
                ].map(({ label, video, isGood }) => (
                  <div key={label} className="ytg-card" style={{ padding: '20px 22px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: isGood ? C.green : C.red, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>{label}</p>
                    {video && (
                      <>
                        <div style={{ display: 'flex', gap: 11, marginBottom: 13, alignItems: 'flex-start' }}>
                          {video.thumbnail && <img src={video.thumbnail} alt="" style={{ width: 68, height: 43, borderRadius: 7, objectFit: 'cover', flexShrink: 0 }}/>}
                          <p style={{ fontSize: 14, fontWeight: 600, color: C.text1, lineHeight: 1.5 }}>{video.title}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
                          {[['Views', fmtNum(video.views), isGood ? C.green : C.red], ['Likes', fmtNum(video.likes), C.text1]].map(([lbl, val, col]) => (
                            <div key={lbl}>
                              <p style={{ fontSize: 12, color: C.text3, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{lbl}</p>
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
                <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16 }}>Content mix</p>
                <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
                  {[{ l: 'Shorts', v: patterns.shortsCount, s: '≤60s' }, { l: 'Long-form', v: patterns.longsCount, s: '>60s' }].map(p => (
                    <div key={p.l}>
                      <p style={{ fontSize: 12, color: C.text3, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{p.l}</p>
                      <p style={{ fontSize: 26, fontWeight: 800, color: C.text1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>{p.v}</p>
                      <p style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>{p.s}</p>
                    </div>
                  ))}
                  <div style={{ flex: 1, paddingLeft: 28, borderLeft: `1px solid #ebebef` }}>
                    <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.85 }}>
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

          {nav === 'Weekly Report' && (
            <WeeklyReport
              channelId={data?.channel?.channel_id}
              channelEmail={data?.email}
            />
          )}

          {nav === 'SEO Studio' && <SeoOptimizer onNavigate={setNav} />}

          {nav === 'Thumbnail Score' && <ThumbnailScore channelData={data} onNavigate={setNav} />}

          {nav === 'Video Ideas' && <VideoIdeas onNavigate={setNav} />}

          {/* ── SETTINGS ─────────────────────────────────────────────── */}
          {nav === 'Settings' && <Settings />}

        </div>
      </div>
    </div>
  )
}
