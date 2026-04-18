import { useState, useEffect, useRef } from 'react'

/* ─── Styles injected once ──────────────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('ytg-vi-styles')) {
  const s = document.createElement('style')
  s.id = 'ytg-vi-styles'
  s.textContent = `
    @keyframes viSpin    { to { transform: rotate(360deg) } }
    @keyframes viPulse   { 0%,100% { opacity:1 } 50% { opacity:0.35 } }
    @keyframes viFadeUp  { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }

    .vi-glass-card {
      background: #ffffff;
      border: 1px solid #d8d8e0;
      border-radius: 20px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.9) inset;
    }
    .vi-glass-card:hover {
      box-shadow: 0 8px 28px rgba(0,0,0,0.13), 0 28px 60px rgba(0,0,0,0.14), 0 1px 0 rgba(255,255,255,0.9) inset;
      transform: translateY(-2px);
      border-color: #c0c0cc;
      transition: box-shadow 0.22s, transform 0.22s, border-color 0.22s;
    }

    .vi-idea-card {
      background: #ffffff;
      border: 1px solid #d8d8e0;
      border-radius: 16px;
      padding: 16px 18px;
      margin-bottom: 9px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.14), 0 24px 64px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.9) inset;
      transition: box-shadow 0.22s, transform 0.22s, border-color 0.22s, opacity 0.22s;
      animation: viFadeUp 0.3s ease both;
    }
    .vi-idea-card:hover {
      box-shadow: 0 8px 28px rgba(0,0,0,0.18), 0 36px 80px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.9) inset;
      transform: translateY(-2px);
      border-color: #c0c0cc;
    }
    .vi-idea-card.done {
      opacity: 0.42;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06);
      border-color: rgba(0,0,0,0.07);
    }
    .vi-idea-card.done:hover {
      transform: none;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06);
    }

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

    .vi-cta-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 16px; border-radius: 100px;
      font-size: 12px; font-weight: 700; font-family: inherit;
      background: #e5251b; color: #fff;
      border: none; cursor: pointer;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32);
      transition: all 0.18s;
    }
    .vi-cta-btn:hover {
      filter: brightness(1.07);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,37,27,0.42);
      transform: translateY(-1px);
    }

    .vi-check-btn {
      width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
      border: 1.5px solid rgba(0,0,0,0.18); background: #fff;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.15s; margin-top: 2px;
    }
    .vi-check-btn:hover { border-color: #16a34a; background: #f0fdf4; }
    .vi-check-btn.checked { background: #16a34a; border-color: #16a34a; }
  `
  document.head.appendChild(s)
}

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const C = {
  red:      '#e5251b',
  redBg:    '#fff5f5',
  green:    '#16a34a',
  greenBg:  '#f0fdf4',
  amber:    '#d97706',
  amberBg:  '#fffbeb',
  blue:     '#2563eb',
  blueBg:   '#eff6ff',
  blueBdr:  '#bfdbfe',
  purple:   '#7c3aed',
  purpleBg: '#f5f3ff',
  purpleBdr:'#c4b5fd',
  gray:     '#9ca3af',
  grayBg:   '#f9fafb',
  text1:    '#0d0d0f',
  text2:    '#3c3c44',
  text3:    '#8c8c9a',
  text4:    '#b8b8c8',
  border:   'rgba(0,0,0,0.08)',
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
  const color = score >= 80 ? C.green : score >= 60 ? C.amber : C.gray
  const bg    = score >= 80 ? C.greenBg : score >= 60 ? C.amberBg : C.grayBg
  return (
    <span style={{
      fontSize: 14, fontWeight: 700, color,
      background: bg, borderRadius: 8,
      padding: '4px 10px', whiteSpace: 'nowrap',
    }}>
      {score}
    </span>
  )
}

function SourceBadge({ source }) {
  if (source === 'ai') return (
    <span style={{
      fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
      color: C.purple, background: C.purpleBg,
      border: `1px solid ${C.purpleBdr}`,
      borderRadius: 100, padding: '2px 8px',
    }}>AI generated</span>
  )
  return (
    <span style={{
      fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
      color: C.blue, background: C.blueBg,
      border: `1px solid ${C.blueBdr}`,
      borderRadius: 100, padding: '2px 8px',
    }}>Competitor gap</span>
  )
}

function KeywordPill({ keyword }) {
  if (!keyword) return null
  return (
    <span style={{
      fontSize: 12, fontWeight: 600,
      color: C.text2, background: '#f4f4f6',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: 100, padding: '2px 10px',
    }}>
      {keyword}
    </span>
  )
}

function SkeletonCard({ index }) {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)',
      borderRadius: 16, padding: '16px 18px', marginBottom: 9,
      opacity: 1 - index * 0.06,
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div className="vi-skeleton" style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="vi-skeleton" style={{ height: 16, width: '75%', marginBottom: 8 }} />
          <div className="vi-skeleton" style={{ height: 12, width: '50%', marginBottom: 8 }} />
          <div className="vi-skeleton" style={{ height: 12, width: '90%' }} />
        </div>
        <div className="vi-skeleton" style={{ width: 42, height: 32, borderRadius: 8, flexShrink: 0 }} />
      </div>
    </div>
  )
}

function IdeaCard({ idea, done, onDone, onUseSeo, onScoreThumbnail }) {
  return (
    <div className={`vi-idea-card${done ? ' done' : ''}`}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

        {/* Checkbox */}
        <button
          className={`vi-check-btn${done ? ' checked' : ''}`}
          onClick={() => onDone(idea.title)}
          title={done ? 'Mark incomplete' : 'Mark as done'}
        >
          {done && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6l3 3 5-5"/>
            </svg>
          )}
        </button>

        {/* Rank */}
        <div style={{
          fontSize: 16, fontWeight: 800, color: C.text4,
          minWidth: 22, paddingTop: 2, textAlign: 'center', flexShrink: 0,
        }}>
          {idea.rank}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title + badges row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
            <p style={{
              fontSize: 14, fontWeight: 600, color: C.text1,
              lineHeight: 1.4, margin: 0,
              textDecoration: done ? 'line-through' : 'none',
            }}>
              {idea.title}
            </p>
            <div style={{ flexShrink: 0, paddingTop: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <SourceBadge source={idea.source} />
              {idea.thumbnail_ready && (
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: C.green, background: C.greenBg,
                  border: '1px solid #bbf7d0',
                  borderRadius: 100, padding: '2px 8px',
                  whiteSpace: 'nowrap',
                }}>
                  Thumbnail Ready · {idea.thumbnail_score}/100
                </span>
              )}
            </div>
          </div>

          {/* Keyword pill */}
          <div style={{ marginBottom: 6 }}>
            <KeywordPill keyword={idea.targetKeyword} />
          </div>

          {/* Signal basis — why YouTube will distribute this */}
          {idea.signalBasis && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              marginBottom: 5,
              fontSize: 11, fontWeight: 600,
              color: '#0369a1', background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: 100, padding: '2px 9px',
            }}>
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4.5 1v2M4.5 6v2M1 4.5h2M6 4.5h2"/>
                <circle cx="4.5" cy="4.5" r="3.5"/>
              </svg>
              {idea.signalBasis}
            </div>
          )}

          {/* Angle */}
          {idea.angle && (
            <p style={{ fontSize: 12, color: C.text3, margin: 0, lineHeight: 1.5 }}>
              {idea.angle}
            </p>
          )}

          {/* CTAs — only when not done */}
          {!done && (
            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="vi-cta-btn" onClick={() => onUseSeo(idea.title)}>
                Use in SEO Studio
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 5.5h7M5.5 2l3.5 3.5L5.5 9"/>
                </svg>
              </button>
              <button
                onClick={() => onScoreThumbnail(idea)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '7px 14px', borderRadius: 100,
                  fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                  background: '#f0f0f5', color: C.text2,
                  border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e4e4ec' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f0f0f5' }}
              >
                Score Thumbnail →
              </button>
            </div>
          )}
        </div>

        {/* Opportunity score */}
        <div style={{ flexShrink: 0 }}>
          <ScorePill score={
            idea.source === 'ai' && idea.opportunityScore
              ? idea.opportunityScore
              : Math.max(65, 85 - (idea.rank - 1) * 2)
          } />
        </div>

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

  function handleScoreThumbnail(idea) {
    try { localStorage.setItem('ytg_prefill_idea', JSON.stringify(idea)) } catch {}
    if (onNavigate) onNavigate('Thumbnail Score')
  }

  const sourceLabel = {
    competitor: 'Based on competitor research',
    ai:         'AI generated',
    mixed:      'AI + competitor research',
    empty:      '',
  }[source] || ''

  /* ── Render ── */
  return (
    <div style={{ width: '100%', fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0a0a0f', letterSpacing: '-0.6px', marginBottom: 4 }}>
            Video Ideas
          </h2>
          <p style={{ fontSize: 14, color: C.text3, margin: 0 }}>
            Ready-to-use video titles ranked by opportunity
          </p>
        </div>

        {/* Refresh button */}
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 20px', borderRadius: 100, border: 'none',
              fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
              background: refreshing ? '#e0e0e6' : C.red, color: '#fff',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              boxShadow: refreshing ? 'none' : '0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32)',
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => { if (!refreshing) { e.currentTarget.style.filter = 'brightness(1.07)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
            onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = '' }}
          >
            {refreshing ? <><SpinIcon /> Generating…</> : <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 6.5A4.5 4.5 0 1 1 6.5 2a4.5 4.5 0 0 1 3.18 1.32"/>
                <path d="M9.5 1v2.8H12.3"/>
              </svg>
              Refresh Ideas
            </>}
          </button>
          <div style={{ fontSize: 12, color: C.text4, marginTop: 4 }}>
            1 AI analysis
            {credits != null && <span> · {credits} credits left</span>}
          </div>
        </div>
      </div>

      {/* Staleness / last updated line */}
      {lastUpdated && !loading && (
        <p style={{ fontSize: 12, color: C.text4, marginBottom: 14, marginTop: 4 }}>
          Last updated {lastUpdated} · {sourceLabel}
        </p>
      )}

      {/* Stale nudge */}
      {stale && !loading && (
        <div style={{
          fontSize: 12, color: C.amber, background: C.amberBg,
          border: '1px solid #fde68a', borderRadius: 10,
          padding: '9px 14px', marginBottom: 14,
        }}>
          These ideas are over 30 days old — refresh for updated opportunities.
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          fontSize: 14, color: C.red, background: C.redBg,
          border: '1px solid #fecaca', borderRadius: 10,
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
            <p style={{ fontSize: 14, color: C.text3, marginBottom: 12 }}>
              Generating ideas from your channel data…
            </p>
          )}
          {Array.from({ length: 10 }, (_, i) => <SkeletonCard key={i} index={i} />)}
        </>
      )}

      {/* Empty state */}
      {!loading && !refreshing && source === 'empty' && !error && (
        <div style={{
          textAlign: 'center', padding: '56px 24px',
          background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: 20, marginTop: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.07)',
        }}>
          <div style={{ marginBottom: 14 }}><LightbulbIcon /></div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text1, marginBottom: 8 }}>No ideas yet</h3>
          <p style={{ fontSize: 14, color: C.text3, maxWidth: 340, margin: '0 auto 22px', lineHeight: 1.6 }}>
            Analyze a competitor first to unlock free video ideas, or generate AI-powered ideas directly.
          </p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 26px', borderRadius: 100, border: 'none',
              fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
              background: C.red, color: '#fff', cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32)',
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.07)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = '' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M7 1v3M7 10v3M1 7h3M10 7h3"/>
              <path d="M3.2 3.2l2.1 2.1M8.7 8.7l2.1 2.1M3.2 10.8l2.1-2.1M8.7 5.3l2.1-2.1"/>
            </svg>
            Generate AI Ideas — 1 analysis
          </button>
        </div>
      )}

      {/* Ideas list */}
      {!loading && !refreshing && ideas.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {/* Clear completed bar */}
          {doneCount > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 14px', marginBottom: 10,
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 10,
            }}>
              <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>
                {doneCount} idea{doneCount > 1 ? 's' : ''} completed
              </span>
              <button
                onClick={clearCompleted}
                style={{
                  fontSize: 12, fontWeight: 700, color: C.green,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', padding: '2px 0',
                  textDecoration: 'underline', textUnderlineOffset: 2,
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
              onScoreThumbnail={handleScoreThumbnail}
            />
          ))}
        </div>
      )}

    </div>
  )
}
