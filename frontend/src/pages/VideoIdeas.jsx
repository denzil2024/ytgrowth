import { useState, useEffect, useRef } from 'react'

// Inter loaded page-scoped (each page owns its font loading, never global)
if (typeof document !== 'undefined' && !document.getElementById('vi-inter-font')) {
  const link = document.createElement('link')
  link.id = 'vi-inter-font'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
  document.head.appendChild(link)
}

/* ─── Styles injected once — matches the Overview/Videos/Outliers design
       language: hairline borders, system-standard elevation (0 1/3 + 0 4/16),
       no hover-lift transforms. ───────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('ytg-vi-styles')) {
  const s = document.createElement('style')
  s.id = 'ytg-vi-styles'
  s.textContent = `
    @keyframes viSpin    { to { transform: rotate(360deg) } }
    @keyframes viFadeUp  { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }

    .vi-idea-card {
      background: #ffffff;
      border: 1px solid rgba(0,0,0,0.09);
      border-radius: 16px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06);
      transition: border-color 0.2s, opacity 0.2s;
      animation: viFadeUp 0.26s ease both;
      overflow: hidden;
    }
    .vi-idea-card:hover { border-color: rgba(0,0,0,0.14); }
    .vi-idea-card.done  { opacity: 0.55; }

    .vi-skeleton {
      background: linear-gradient(90deg, #f0f0f3 25%, #e8e8ec 50%, #f0f0f3 75%);
      background-size: 200% 100%;
      animation: viSkeleton 1.4s ease infinite;
      border-radius: 8px;
    }
    @keyframes viSkeleton {
      0%   { background-position: 200% 0 }
      100% { background-position: -200% 0 }
    }

    /* Red pill CTA — same shape/typography as Overview / Videos / Outliers */
    .vi-cta-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: 100px;
      font-size: 12.5px; font-weight: 700; font-family: inherit;
      letter-spacing: 0.01em;
      background: #e5251b; color: #fff;
      border: none; cursor: pointer;
      transition: filter 0.15s;
    }
    .vi-cta-btn:hover { filter: brightness(1.1); }

    /* Refresh-confirm modal — minimal overlay, matches other dialogs in the
       app: backdrop blur + centered card with hairline + system elevation. */
    .vi-modal-backdrop {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(10,10,15,0.42); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px; animation: viFadeUp 0.2s ease both;
    }
    .vi-modal {
      background: #fff; border-radius: 16px;
      border: 1px solid rgba(0,0,0,0.09);
      box-shadow: 0 10px 40px rgba(0,0,0,0.14);
      width: 100%; max-width: 440px; overflow: hidden;
    }
  `
  document.head.appendChild(s)
}

/* ─── Design tokens — matches the shared dashboard palette (no purple; red
       is strictly semantic for CTAs/hero, amber covers AI-generated accent,
       green = completed/positive, blue = informational tint). ─────────── */
const C = {
  red:      '#e5251b', redBg:   '#fff5f5', redBdr:   '#fecaca',
  green:    '#16a34a', greenBg: '#f0fdf4', greenBdr: '#bbf7d0',
  amber:    '#d97706', amberBg: '#fffbeb', amberBdr: '#fde68a',
  blue:     '#2563eb', blueBg:  '#eff6ff', blueBdr:  '#bfdbfe',
  text1:    '#111114',
  text2:    '#52525b',
  text3:    '#a0a0b0',
  text4:    '#c0c0cc',
  border:   'rgba(0,0,0,0.09)',
}

const API = ''

/* ─── Sub-components ────────────────────────────────────────────────────── */

function SpinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ animation: 'viSpin 0.8s linear infinite', flexShrink: 0 }}>
      <path d="M6.5 1v2M6.5 10v2M1 6.5h2M10 6.5h2M2.8 2.8l1.4 1.4M8.8 8.8l1.4 1.4M2.8 10.2l1.4-1.4M8.8 4.2l1.4-1.4"/>
    </svg>
  )
}

function LightbulbIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke={C.text4} strokeWidth="1.5" strokeLinecap="round">
      <path d="M20 4a12 12 0 0 1 8 20.6V28a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2v-3.4A12 12 0 0 1 20 4z"/>
      <path d="M16 30v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2"/>
    </svg>
  )
}

function ScorePill({ score }) {
  const color = score >= 80 ? C.green : score >= 60 ? C.amber : C.text3
  const bg    = score >= 80 ? C.greenBg : score >= 60 ? C.amberBg : '#f4f4f6'
  const bdr   = score >= 80 ? C.greenBdr : score >= 60 ? C.amberBdr : 'rgba(0,0,0,0.08)'
  return (
    <span style={{
      fontSize: 14, fontWeight: 800, color,
      background: bg, border: `1px solid ${bdr}`,
      borderRadius: 8, padding: '4px 10px',
      whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums',
    }}>
      {score}
    </span>
  )
}

function SourceBadge({ source }) {
  // AI generated uses amber (the system's accent-worthy colour). Purple has
  // been removed from the strict red/amber/green palette.
  const tone = source === 'ai'
    ? { color: C.amber, bg: C.amberBg, bdr: C.amberBdr, label: 'AI generated' }
    : { color: C.blue,  bg: C.blueBg,  bdr: C.blueBdr,  label: 'Competitor gap' }
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      color: tone.color, background: tone.bg,
      border: `1px solid ${tone.bdr}`,
      borderRadius: 100, padding: '2px 9px',
    }}>{tone.label}</span>
  )
}

function KeywordPill({ keyword }) {
  if (!keyword) return null
  return (
    <span style={{
      fontSize: 12, fontWeight: 600,
      color: C.text2, background: '#f4f4f6',
      border: `1px solid ${C.border}`,
      borderRadius: 100, padding: '3px 10px',
    }}>
      {keyword}
    </span>
  )
}

function SkeletonCard({ index }) {
  return (
    <div style={{
      background: '#ffffff', border: `1px solid ${C.border}`,
      borderRadius: 16, padding: '16px 20px 18px', marginBottom: 10,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
      opacity: 1 - index * 0.06,
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
        <div className="vi-skeleton" style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0 }} />
        <div className="vi-skeleton" style={{ width: 22, height: 14, flexShrink: 0, marginTop: 3 }} />
        <div style={{ flex: 1 }}>
          <div className="vi-skeleton" style={{ height: 14, width: '80%' }} />
        </div>
        <div className="vi-skeleton" style={{ width: 44, height: 26, borderRadius: 8, flexShrink: 0 }} />
      </div>
      <div style={{ marginLeft: 46, display: 'flex', gap: 6 }}>
        <div className="vi-skeleton" style={{ width: 90, height: 20, borderRadius: 100 }} />
        <div className="vi-skeleton" style={{ width: 120, height: 20, borderRadius: 100 }} />
      </div>
    </div>
  )
}

/* RefreshConfirmModal — shown before a paid refresh. Lists the cost and
   how the generation is scoped so the user knows what 1 credit buys. */
function RefreshConfirmModal({ credits, onCancel, onConfirm }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="vi-modal-backdrop" onClick={onCancel}>
      <div className="vi-modal" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '22px 24px 20px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.amber, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            Uses 1 credit
          </p>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text1, letterSpacing: '-0.3px', lineHeight: 1.3, marginBottom: 10 }}>
            Generate fresh video ideas?
          </h3>
          <p style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.65, marginBottom: 14 }}>
            YTGrowth will produce 10 new ideas based on:
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Your channel niche and audit signals',
              'Your tracked competitors (last 12 months only)',
              'Current-year search and distribution trends',
            ].map((t, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: C.text2, lineHeight: 1.55 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                  <polyline points="2,7.5 6,11 12,3"/>
                </svg>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <div style={{
            fontSize: 12.5, color: C.text3, background: '#f6f6f9',
            border: `1px solid ${C.border}`, borderRadius: 10,
            padding: '9px 12px', lineHeight: 1.55, marginBottom: 18,
          }}>
            Your existing ideas will be replaced.
            {credits != null && <> You have <strong style={{ color: C.text1 }}>{credits} credits</strong> remaining.</>}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '10px 18px', borderRadius: 100,
                border: `1px solid ${C.border}`, background: '#fff', color: C.text2,
                fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f6f6f9' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
            >Cancel</button>
            <button
              onClick={onConfirm}
              style={{
                padding: '10px 20px', borderRadius: 100, border: 'none',
                background: C.red, color: '#fff',
                fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit',
                letterSpacing: '0.01em', cursor: 'pointer',
                transition: 'filter 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
            >Refresh · 1 credit</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* IdeaCard — Priority Actions pattern exactly (Dashboard.jsx:1031-1123).
   3px colored top border tinted by source (amber for AI, blue for competitor
   gap), header row with small native checkbox + 26x26 colored rank badge +
   category eyebrow + title + score pill, hairline divider at marginLeft:46,
   body (keyword chip + angle + single CTA) aligned to the same mL:46 anchor. */
function IdeaCard({ idea, done, onDone, onUseSeo }) {
  const score = idea.source === 'ai' && idea.opportunityScore
    ? idea.opportunityScore
    : Math.max(65, 85 - (idea.rank - 1) * 2)

  const tone = idea.source === 'ai'
    ? { color: C.amber, label: 'AI opportunity' }
    : { color: C.blue,  label: 'Competitor gap' }

  return (
    <div
      className={`vi-idea-card${done ? ' done' : ''}`}
      style={{ borderTop: `3px solid ${done ? C.border : tone.color}`, padding: 0 }}
    >
      <div style={{ padding: '16px 22px 18px' }}>

        {/* Header — checkbox + rank badge + eyebrow/title + score pill */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: done ? 0 : 14 }}>

          {/* Native checkbox + colored rank badge pair */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingTop: 2 }}>
            <input
              type="checkbox"
              checked={!!done}
              onChange={() => onDone(idea.title)}
              style={{ width: 15, height: 15, accentColor: C.green, cursor: 'pointer', flexShrink: 0 }}
            />
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: done ? C.greenBg : tone.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {done
                ? <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5,6.5 5,10 10.5,2"/></svg>
                : <span style={{ fontSize: 12, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{idea.rank}</span>
              }
            </div>
          </div>

          {/* Eyebrow + title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 10, fontWeight: 700,
              color: done ? C.text3 : tone.color,
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5,
            }}>{tone.label}</p>
            <p style={{
              fontSize: 14, fontWeight: 700,
              color: done ? C.text3 : C.text1,
              lineHeight: 1.55, letterSpacing: '-0.1px',
              textDecoration: done ? 'line-through' : 'none',
            }}>{idea.title}</p>
          </div>

          {/* Score pill on the right */}
          <div style={{ flexShrink: 0, paddingTop: 1 }}>
            <ScorePill score={score} />
          </div>
        </div>

        {/* Hairline + body only when not done — mirrors Priority Actions */}
        {!done && (
          <>
            <div style={{ height: 1, background: C.border, marginBottom: 14, marginLeft: 46 }} />

            <div style={{ marginLeft: 46 }}>
              {/* Meta chips row — keyword + optional thumbnail-ready */}
              {(idea.targetKeyword || idea.thumbnail_ready) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: idea.angle ? 10 : 14 }}>
                  <KeywordPill keyword={idea.targetKeyword} />
                  {idea.thumbnail_ready && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: C.green, background: C.greenBg,
                      border: `1px solid ${C.greenBdr}`,
                      borderRadius: 100, padding: '2px 9px',
                      whiteSpace: 'nowrap',
                    }}>
                      Thumbnail ready · {idea.thumbnail_score}/100
                    </span>
                  )}
                </div>
              )}

              {/* Angle — explains why YouTube will distribute this */}
              {idea.angle && (
                <p style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.72, marginBottom: 14 }}>
                  {idea.angle}
                </p>
              )}

              {/* Single CTA — Use in SEO Studio. (Score thumbnail removed per
                  feedback — unnecessary noise on the ideas list.) */}
              <button className="vi-cta-btn" onClick={() => onUseSeo(idea.title)}>
                Use in SEO Studio
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 5.5h7M5.5 2l3.5 3.5L5.5 9"/>
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Main component ────────────────────────────────────────────────────── */

const DONE_KEY = 'ytg_vi_done'

function loadDone() {
  try { return new Set(JSON.parse(localStorage.getItem(DONE_KEY) || '[]')) } catch { return new Set() }
}
function saveDone(set) {
  try { localStorage.setItem(DONE_KEY, JSON.stringify([...set])) } catch {}
}

export default function VideoIdeas({ onNavigate }) {
  const [ideas,       setIdeas]      = useState([])
  const [source,      setSource]     = useState('empty')
  const [lastUpdated, setLastUpdated]= useState('')
  const [stale,       setStale]      = useState(false)
  const [loading,     setLoading]    = useState(true)   // initial fetch
  const [refreshing,  setRefreshing] = useState(false)  // paid refresh
  const [error,       setError]      = useState('')
  const [credits,     setCredits]    = useState(null)
  const [done,        setDone]       = useState(() => loadDone())
  const [confirmOpen, setConfirmOpen]= useState(false)
  const mountedRef = useRef(true)

  function toggleDone(title) {
    setDone(prev => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      saveDone(next)
      return next
    })
  }

  function clearCompleted() {
    setDone(prev => {
      const completed = [...prev].filter(t => ideas.some(i => i.title === t))
      const next = new Set(prev)
      completed.forEach(t => next.delete(t))
      saveDone(next)
      return next
    })
  }

  const doneCount = ideas.filter(i => done.has(i.title)).length

  /* ── On mount: fetch ideas silently ── */
  useEffect(() => {
    mountedRef.current = true
    fetchIdeas()
    return () => { mountedRef.current = false }
  }, [])

  async function fetchIdeas() {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`${API}/video-ideas`, { credentials: 'include' })
      const data = await res.json()
      if (!mountedRef.current) return
      if (res.ok) {
        if (data.source !== 'empty' && data.ideas?.length) {
          setIdeas(data.ideas)
          setSource(data.source)
          setLastUpdated(data.last_updated || '')
          setStale(!!data.stale)
          return
        }
        // Backend has nothing — try backfilling from Competitors localStorage cache
        const seeded = await seedFromLocalStorage()
        if (seeded) {
          setIdeas(seeded.ideas)
          setSource(seeded.source)
          setLastUpdated(seeded.last_updated || 'today')
          setStale(false)
        } else {
          setSource('empty')
        }
      }
    } catch (e) {
      if (mountedRef.current) setError('Could not load ideas. Check your connection.')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  async function seedFromLocalStorage() {
    try {
      const raw = localStorage.getItem('ytgrowth_tracked_competitors')
      if (!raw) return null
      const tracked = JSON.parse(raw)
      if (!Array.isArray(tracked) || !tracked.length) return null

      // Pool videoIdeas from all tracked competitor analyses
      const seen = new Set()
      const pooled = []
      let rank = 1
      for (const entry of tracked) {
        const ideas = entry.ai_analysis?.videoIdeas || []
        for (const idea of ideas) {
          const key = (idea.title || '').toLowerCase().trim()
          if (!key || seen.has(key)) continue
          seen.add(key)
          pooled.push({
            rank: rank++,
            title: idea.title || '',
            targetKeyword: idea.targetKeyword || '',
            angle: idea.angle || '',
            opportunityScore: 70,
            source: 'competitor',
          })
          if (pooled.length >= 10) break
        }
        if (pooled.length >= 10) break
      }
      if (!pooled.length) return null

      // Persist to backend so future loads don't need this fallback
      const res = await fetch(`${API}/video-ideas/seed`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideas: pooled }),
      })
      if (!mountedRef.current) return null
      if (res.ok) return await res.json()
      // If seed call fails, still show the ideas from localStorage
      return { ideas: pooled, source: 'competitor', last_updated: 'today' }
    } catch {
      return null
    }
  }

  async function handleRefresh() {
    if (refreshing) return
    setRefreshing(true)
    setError('')
    try {
      const res  = await fetch(`${API}/video-ideas/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!mountedRef.current) return

      if (res.status === 402) {
        setError(data.error || 'No credits remaining. Please upgrade to continue.')
        return
      }
      if (!res.ok) {
        setError(data.error || 'Failed to generate ideas. Please try again.')
        return
      }
      setIdeas(data.ideas || [])
      setSource(data.source || 'ai')
      setLastUpdated(data.last_updated || 'today')
      setStale(false)
      if (data.credits_remaining != null) setCredits(data.credits_remaining)
    } catch (e) {
      if (mountedRef.current) setError('Request failed. Please try again.')
    } finally {
      if (mountedRef.current) setRefreshing(false)
    }
  }

  function handleUseSeo(title) {
    try { localStorage.setItem('ytg_prefill_title', title) } catch {}
    if (onNavigate) onNavigate('SEO Studio')
  }

  const sourceLabel = {
    competitor: 'Based on competitor research',
    ai:         'AI generated',
    mixed:      'AI + competitor research',
    empty:      '',
  }[source] || ''

  /* ── Render ── */
  return (
    <div style={{ width: '100%', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header — system H1 24/800/-0.6 + meta line with · separators (same
          pattern as Overview / SEO Optimizer / Thumbnail IQ) */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 6, lineHeight: 1.1 }}>
            Video Ideas
          </h1>
          <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.4, display: 'flex', gap: 0, flexWrap: 'wrap', margin: 0 }}>
            <span>Ready-to-use video titles ranked by opportunity</span>
            {lastUpdated && !loading && <span style={{ marginLeft: 8 }}>· Last updated {lastUpdated}</span>}
            {sourceLabel && !loading && <span style={{ marginLeft: 8 }}>· {sourceLabel}</span>}
          </p>
        </div>

        {/* Refresh — red pill, matches Overview/Videos/Outliers CTA shape.
            Opens a confirmation modal (1 credit cost + approach summary)
            instead of running immediately. */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={refreshing}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 18px', borderRadius: 100, border: 'none',
              fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit',
              letterSpacing: '0.01em',
              background: refreshing ? '#e0e0e6' : C.red,
              color: refreshing ? '#a0a0b0' : '#fff',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              transition: 'filter 0.15s',
            }}
            onMouseEnter={e => { if (!refreshing) e.currentTarget.style.filter = 'brightness(1.1)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
          >
            {refreshing ? <><SpinIcon /> Generating</> : <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 6.5A4.5 4.5 0 1 1 6.5 2a4.5 4.5 0 0 1 3.18 1.32"/>
                <path d="M9.5 1v2.8H12.3"/>
              </svg>
              Refresh ideas
            </>}
          </button>
          <div style={{ fontSize: 11.5, color: C.text3, marginTop: 6, fontWeight: 500 }}>
            1 AI analysis
            {credits != null && <span> · {credits} credits left</span>}
          </div>
        </div>
      </div>

      {/* Stale nudge — amber tint, same language as other banners in the app */}
      {stale && !loading && (
        <div style={{
          fontSize: 13, color: C.amber, background: C.amberBg,
          border: `1px solid ${C.amberBdr}`, borderRadius: 10,
          padding: '10px 14px', marginBottom: 14,
        }}>
          These ideas are over 30 days old. Refresh for updated opportunities.
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          fontSize: 13.5, color: C.red, background: C.redBg,
          border: `1px solid ${C.redBdr}`, borderRadius: 10,
          padding: '10px 14px', marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="6.5" cy="6.5" r="5"/><path d="M6.5 4v3M6.5 9v.5"/>
          </svg>
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {(loading || refreshing) && (
        <>
          {refreshing && (
            <p style={{ fontSize: 13, color: C.text3, marginBottom: 12 }}>
              Generating ideas from your channel data…
            </p>
          )}
          {Array.from({ length: 10 }, (_, i) => <SkeletonCard key={i} index={i} />)}
        </>
      )}

      {/* Empty state — matches system card elevation, not a hero */}
      {!loading && !refreshing && source === 'empty' && !error && (
        <div style={{
          textAlign: 'center', padding: '56px 24px',
          background: '#ffffff', border: `1px solid ${C.border}`,
          borderRadius: 16, marginTop: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
        }}>
          <div style={{ marginBottom: 14 }}><LightbulbIcon /></div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text1, marginBottom: 8, letterSpacing: '-0.2px' }}>No ideas yet</h3>
          <p style={{ fontSize: 13.5, color: C.text3, maxWidth: 340, margin: '0 auto 22px', lineHeight: 1.6 }}>
            Analyze a competitor first to unlock free video ideas, or generate AI-powered ideas directly.
          </p>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={refreshing}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 22px', borderRadius: 100, border: 'none',
              fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit',
              letterSpacing: '0.01em',
              background: C.red, color: '#fff', cursor: 'pointer',
              transition: 'filter 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M7 1v3M7 10v3M1 7h3M10 7h3"/>
              <path d="M3.2 3.2l2.1 2.1M8.7 8.7l2.1 2.1M3.2 10.8l2.1-2.1M8.7 5.3l2.1-2.1"/>
            </svg>
            Generate AI ideas · 1 analysis
          </button>
        </div>
      )}

      {/* Refresh confirmation modal — warns about the 1-credit cost and
          what the generation considers (niche + competitors + recent data)
          so the user knows what they're paying for. */}
      {confirmOpen && (
        <RefreshConfirmModal
          credits={credits}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => { setConfirmOpen(false); handleRefresh() }}
        />
      )}

      {/* Ideas list */}
      {!loading && !refreshing && ideas.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {/* Clear completed bar — green tint strip, matches other tinted banners */}
          {doneCount > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 14px', marginBottom: 10,
              background: C.greenBg, border: `1px solid ${C.greenBdr}`,
              borderRadius: 10,
            }}>
              <span style={{ fontSize: 12.5, color: C.green, fontWeight: 600 }}>
                {doneCount} idea{doneCount > 1 ? 's' : ''} completed
              </span>
              <button
                onClick={clearCompleted}
                style={{
                  fontSize: 12.5, fontWeight: 700, color: C.green,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', padding: '2px 0',
                }}
              >
                Clear completed
              </button>
            </div>
          )}

          {ideas.map(idea => (
            <IdeaCard
              key={`${idea.rank}-${idea.title}`}
              idea={idea}
              done={done.has(idea.title)}
              onDone={toggleDone}
              onUseSeo={handleUseSeo}
            />
          ))}
        </div>
      )}

    </div>
  )
}
