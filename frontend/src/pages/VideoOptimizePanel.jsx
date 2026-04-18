import { useEffect, useState } from 'react'

const API = ''

// ── DB-backed cache (survives refresh + logout) ───────────────────────────────
async function loadDbCache(videoId) {
  try {
    const r = await fetch(`${API}/seo/optimize-cache/${videoId}`, { credentials: 'include' })
    if (!r.ok) return null
    const d = await r.json()
    return d.cached || null
  } catch { return null }
}
async function saveDbCache(videoId, data) {
  try {
    await fetch(`${API}/seo/optimize-cache`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_id: videoId, result_json: JSON.stringify(data) }),
    })
  } catch {}
}
async function clearDbCache(videoId) {
  try {
    await fetch(`${API}/seo/optimize-cache/${videoId}`, { method: 'DELETE', credentials: 'include' })
  } catch {}
}

// ── Tight, disciplined palette — color used sparingly ─────────────────────────
const C = {
  card:       '#ffffff',
  surface:    '#f7f7fa',
  border:     '#e8e8ec',
  borderFaint:'#f0f0f4',
  text1:      '#0f0f10',
  text2:      '#3a3a3c',
  text3:      '#8e8e93',
  blue:       '#2563eb',
  blueBg:     '#eff6ff',
  blueBdr:    '#bfdbfe',
  green:      '#16a34a',
  greenBg:    '#f0fdf4',
  greenBdr:   '#bbf7d0',
  red:        '#e5251b',
  redBg:      '#fff5f5',
  redBdr:     '#fecaca',
  amber:      '#d97706',
  amberBg:    '#fffbeb',
  amberBdr:   '#fde68a',
}

const BREAKDOWN_META = {
  length:            { label: 'Title length',     max: 25, why: '50–70 chars is the sweet spot. Shorter = no context. Longer = cut off on mobile (70%+ of YouTube watch time).' },
  front_loading:     { label: 'Front-loading',    max: 15, why: 'YouTube viewers scan the first 3 words to decide whether to read on. Your strongest keyword or hook must come first.' },
  power_words:       { label: 'Power words',      max: 15, why: 'Words like "Best", "Secret", "Never", "Shocking" trigger an emotional response that overrides the rational decision not to click.' },
  numbers:           { label: 'Numbers / digits', max: 10, why: 'Specific numbers ("7 Tips", "24-Hour", "10x") outperform vague titles. They signal concrete, structured value.' },
  question:          { label: 'Question format',  max: 10, why: 'Questions create an unresolved tension the viewer needs to close. "Why does..." and "How do I..." titles get disproportionate clicks.' },
  hook_format:       { label: 'Hook / structure', max: 10, why: 'A colon ":", parenthesis, or bracket splits your title into a hook + payoff — the viewer gets a promise and wants the answer.' },
  keyword_relevance: { label: 'Keyword relevance',max: 10, why: 'Titles that share phrases with top-viewed videos in your niche rank higher in search and appear in suggested videos more often.' },
  viral_format:      { label: 'Viral format',     max: 10, why: 'Titles following proven viral patterns (Curiosity Gap, Listicle, Authority/Warning, etc.) consistently outperform generic alternatives.' },
}

const DESC_TYPE_META = {
  story:   { label: 'Story',   color: C.blue,  bg: C.blueBg,  bdr: C.blueBdr  },
  value:   { label: 'Value',   color: C.green, bg: C.greenBg, bdr: C.greenBdr },
  keyword: { label: 'Keyword', color: C.amber, bg: C.amberBg, bdr: C.amberBdr },
}

const HOOK_META = {
  curiosity:      { label: 'Curiosity / FOMO', color: C.blue,  desc: "Makes viewers feel they're missing something" },
  transformation: { label: 'Transformation',   color: C.green, desc: 'Focuses on the outcome or result' },
  contrarian:     { label: 'Contrarian',        color: C.amber, desc: "Challenges assumptions — what others don't show" },
}

// ── Primitives ─────────────────────────────────────────────────────────────────

function ScoreRing({ score }) {
  const r = 34
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = score >= 75 ? C.green : score >= 50 ? C.amber : C.red
  return (
    <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
      <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="44" cy="44" r={r} fill="none" stroke={C.borderFaint} strokeWidth="6" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-1px', lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 12, color: C.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>/100</span>
      </div>
    </div>
  )
}

function ScoreBar({ score, label }) {
  const color = score >= 70 ? C.green : score >= 45 ? C.amber : C.red
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: C.text2 }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 800, color }}>{score}/100</span>
      </div>
      <div style={{ height: 5, background: C.borderFaint, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

function BreakdownBar({ criterionKey, value, max }) {
  const [showWhy, setShowWhy] = useState(false)
  const meta = BREAKDOWN_META[criterionKey]
  if (!meta) return null
  const pct = Math.round((value / max) * 100)
  const color = pct >= 80 ? C.green : pct >= 40 ? C.amber : C.red
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 14, color: C.text2, fontWeight: 500 }}>{meta.label}</span>
          <button onClick={() => setShowWhy(v => !v)}
            style={{ width: 15, height: 15, borderRadius: '50%', border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: C.text3, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>?
          </button>
        </div>
        <span style={{ fontSize: 12, color, fontWeight: 700 }}>{value}/{max}</span>
      </div>
      <div style={{ height: 5, background: C.borderFaint, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>
      {showWhy && (
        <p style={{ fontSize: 12, color: C.text3, marginTop: 5, lineHeight: 1.5, paddingLeft: 8, borderLeft: `2px solid ${C.border}` }}>
          {meta.why}
        </p>
      )}
    </div>
  )
}

function CheckBadge({ value, trueLabel, falseLabel }) {
  return (
    <span style={{
      fontSize: 14, fontWeight: 600,
      color: value ? C.green : C.text3,
      background: value ? C.greenBg : C.surface,
      padding: '3px 9px', borderRadius: 100,
      border: `1px solid ${value ? C.greenBdr : C.border}`,
    }}>
      {value ? '✓ ' : '— '}{value ? trueLabel : falseLabel}
    </span>
  )
}

function TitlePreviewSimulator({ title }) {
  if (!title?.trim()) return null
  const surfaces = [
    { label: 'Suggested / feed', maxChars: 45 },
    { label: 'Mobile search',    maxChars: 55 },
    { label: 'Desktop search',   maxChars: 70 },
  ]
  return (
    <div style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: '12px 14px' }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>How it appears on YouTube</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {surfaces.map(({ label, maxChars }) => {
          const truncated = title.length > maxChars
          const display   = truncated ? title.slice(0, maxChars - 1) + '…' : title
          return (
            <div key={label} style={{ padding: '8px 10px', background: C.card, borderRadius: 8, border: `1px solid ${truncated ? C.amberBdr : C.greenBdr}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: truncated ? C.amber : C.green }}>{truncated ? `cut at ${maxChars}` : 'fits ✓'}</span>
              </div>
              <p style={{ fontSize: 12, fontWeight: 500, color: C.text1, lineHeight: 1.4 }}>{display}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ApplyButton({ onClick, state, label = 'Apply to YouTube' }) {
  const styles = {
    idle:    { bg: C.blue,    color: '#fff',    border: C.blue    },
    loading: { bg: C.blueBg,  color: C.blue,    border: C.blueBdr },
    success: { bg: C.greenBg, color: C.green,   border: C.greenBdr},
    error:   { bg: C.redBg,   color: C.red,     border: C.redBdr  },
  }
  const s = styles[state] || styles.idle
  const labels = { idle: label, loading: 'Applying…', success: '✓ Applied', error: '✗ Failed' }
  return (
    <button onClick={onClick} disabled={state === 'loading' || state === 'success'}
      style={{
        fontSize: 12, fontWeight: 700, padding: '7px 16px', borderRadius: 100,
        background: s.bg, color: s.color, border: `1.5px solid ${s.border}`,
        cursor: state === 'loading' || state === 'success' ? 'default' : 'pointer',
        fontFamily: 'inherit', transition: 'all 0.2s',
        boxShadow: state === 'idle' ? '0 1px 3px rgba(37,99,235,0.2), 0 4px 12px rgba(37,99,235,0.18)' : 'none',
      }}>
      {labels[state] || label}
    </button>
  )
}

function SpinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
      <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.93 2.93l1.41 1.41M9.66 9.66l1.41 1.41M2.93 11.07l1.41-1.41M9.66 4.34l1.41-1.41"/>
    </svg>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 22px', marginBottom: 12 }}>
      {title && <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>{title}</p>}
      {children}
    </div>
  )
}

// ── Description card ──────────────────────────────────────────────────────────

function DescriptionCard({ d, idx, applyState, applyError, onApply }) {
  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState(d.full)
  const tm = DESC_TYPE_META[d.type] || DESC_TYPE_META.value
  return (
    <div style={{ border: `1px solid ${applyState === 'success' ? C.greenBdr : C.border}`, borderRadius: 12, overflow: 'hidden', background: applyState === 'success' ? C.greenBg : C.card }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: `1px solid ${C.borderFaint}` }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: tm.color, background: tm.bg, padding: '2px 8px', borderRadius: 100, border: `1px solid ${tm.bdr}`, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{tm.label}</span>
        <span style={{ fontSize: 12, color: C.text3 }}>{d.why_it_works}</span>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.6, marginBottom: 10, borderLeft: `2px solid ${C.border}`, paddingLeft: 10 }}>
          {d.preview}
        </p>
        {expanded && (
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={8}
            style={{ width: '100%', fontSize: 12, color: C.text1, lineHeight: 1.7, background: C.surface, padding: '10px 12px', borderRadius: 8, marginBottom: 10, border: `1px solid ${C.border}`, fontFamily: "'Inter', system-ui, sans-serif", resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
          />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setExpanded(v => !v)}
            style={{ fontSize: 12, color: C.blue, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, fontWeight: 600 }}>
            {expanded ? 'Collapse ↑' : 'Show full ↓'}
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {applyState === 'error' && applyError && (
              <span style={{ fontSize: 12, color: C.red }}>{applyError}</span>
            )}
            <ApplyButton onClick={() => onApply(draft, idx)} state={applyState} label="Apply Description" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function VideoOptimizePanel({ video, onClose, onVideoUpdated }) {
  const [videoResult, setVideoResult] = useState(null)
  const [videoLoading, setVideoLoading] = useState(true)
  const [videoError, setVideoError] = useState('')

  const [titleResult, setTitleResult] = useState(null)
  const [titleLoading, setTitleLoading] = useState(true)
  const [titleError, setTitleError] = useState('')

  const [selectedSuggestion, setSelectedSuggestion] = useState(0)
  const [titleApply, setTitleApply]       = useState('idle')
  const [titleApplyErr, setTitleApplyErr] = useState('')

  const [descLoading, setDescLoading] = useState(false)
  const [descResult, setDescResult]   = useState(null)
  const [descError, setDescError]     = useState('')
  const [descApplyStates, setDescApplyStates] = useState({})
  const [descApplyErrors, setDescApplyErrors] = useState({})

  // Save to DB whenever results change
  useEffect(() => {
    if (videoResult || titleResult) {
      saveDbCache(video.video_id, { videoResult, titleResult, selectedSuggestion, descResult })
    }
  }, [videoResult, titleResult, selectedSuggestion, descResult])

  // On mount: load from DB first, then fall back to fresh analysis
  useEffect(() => {
    async function init() {
      const cached = await loadDbCache(video.video_id)
      if (cached) {
        if (cached.videoResult) setVideoResult(cached.videoResult)
        if (cached.titleResult) setTitleResult(cached.titleResult)
        if (cached.selectedSuggestion != null) setSelectedSuggestion(cached.selectedSuggestion)
        if (cached.descResult) setDescResult(cached.descResult)
        setVideoLoading(false)
        setTitleLoading(false)
        return
      }
      await runAnalysis()
    }
    init()
  }, [video.video_id])

  async function runAnalysis() {
    setVideoLoading(true); setTitleLoading(true)
    const [videoRes, titleRes] = await Promise.allSettled([
      fetch(`${API}/seo/optimize-video`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: video.video_id, title: video.title, thumbnail_url: video.thumbnail, views: video.views, likes: video.likes }),
      }),
      fetch(`${API}/seo/analyze`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: video.title, confirmed_keyword: '' }),
      }),
    ])
    if (videoRes.status === 'fulfilled') {
      const res = videoRes.value; const data = await res.json()
      if (!res.ok) setVideoError(data.error || 'Video analysis failed.')
      else setVideoResult(data)
    } else { setVideoError('Could not reach the server.') }
    setVideoLoading(false)
    if (titleRes.status === 'fulfilled') {
      const res = titleRes.value; const data = await res.json()
      if (!res.ok) setTitleError(data.error || 'Title analysis failed.')
      else setTitleResult(data)
    } else { setTitleError('Could not reach the server.') }
    setTitleLoading(false)
  }

  async function handleClear() {
    await clearDbCache(video.video_id)
    setVideoResult(null); setTitleResult(null); setDescResult(null)
    setSelectedSuggestion(0); setVideoError(''); setTitleError(''); setDescError('')
    await runAnalysis()
  }

  async function applyTitle() {
    const suggestions = titleResult?.suggestions
    if (!suggestions?.length) return
    const title = suggestions[selectedSuggestion]?.title
    if (!title) return
    setTitleApply('loading'); setTitleApplyErr('')
    try {
      const res = await fetch(`${API}/seo/update-video`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: video.video_id, title }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setTitleApplyErr(data.error || 'Update failed.'); setTitleApply('error') }
      else { setTitleApply('success'); onVideoUpdated?.(video.video_id, { title }) }
    } catch { setTitleApplyErr('Could not reach the server.'); setTitleApply('error') }
  }

  async function applyDescription(text, idx) {
    setDescApplyStates(s => ({ ...s, [idx]: 'loading' }))
    setDescApplyErrors(s => ({ ...s, [idx]: '' }))
    try {
      const res = await fetch(`${API}/seo/update-video`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: video.video_id, description: text }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setDescApplyStates(s => ({ ...s, [idx]: 'error' }))
        setDescApplyErrors(s => ({ ...s, [idx]: data.error || 'Update failed.' }))
      } else { setDescApplyStates(s => ({ ...s, [idx]: 'success' })) }
    } catch {
      setDescApplyStates(s => ({ ...s, [idx]: 'error' }))
      setDescApplyErrors(s => ({ ...s, [idx]: 'Could not reach the server.' }))
    }
  }

  async function generateDescriptions() {
    const titleForDesc =
      titleResult?.suggestions?.[selectedSuggestion]?.title || video.title
    setDescLoading(true); setDescError(''); setDescResult(null)
    setDescApplyStates({}); setDescApplyErrors({})
    try {
      const res = await fetch(
        `${API}/seo/generate-description`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: titleForDesc,
            current_description:
              videoResult?.description || '',
            niche:
              titleResult?.primary_phrase || '',
            intent_analysis:
              titleResult?.intent_analysis || null,
            keyword_scores:
              titleResult?.keyword_scores || null,
            current_year: 2026,
          }),
        }
      )
      const data = await res.json()
      if (!res.ok) { setDescError(data.error || 'Generation failed.'); return }
      setDescResult(data.descriptions)
    } catch { setDescError('Could not reach the server.') }
    finally { setDescLoading(false) }
  }

  const a = videoResult?.analysis
  const isLoading = videoLoading || titleLoading

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 20,
      padding: '24px 28px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.10)',
      animation: 'fadeUp 0.2s ease',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${C.borderFaint}` }}>
        {video.thumbnail && (
          <img
            src={video.video_id ? `https://i.ytimg.com/vi/${video.video_id}/hqdefault.jpg` : video.thumbnail}
            alt=""
            style={{ width: 96, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: `1px solid ${C.border}` }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Video Optimisation</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.text1, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.title}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {(videoResult || titleResult) && (
            <button onClick={handleClear}
              style={{ fontSize: 12, color: C.text2, background: C.card, border: `1px solid ${C.border}`, borderRadius: 100, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              Re-analyse
            </button>
          )}
          <button onClick={onClose}
            style={{ fontSize: 12, color: C.text3, background: C.card, border: `1px solid ${C.border}`, borderRadius: 100, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            Close ✕
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0', color: C.text3 }}>
          <SpinIcon />
          <span style={{ fontSize: 14 }}>Analysing title, description &amp; thumbnail against competitor data…</span>
        </div>
      )}

      {/* Errors */}
      {(videoError || titleError) && !isLoading && (
        <div style={{ padding: '12px 0' }}>
          {videoError && <p style={{ fontSize: 14, color: C.red, marginBottom: 4 }}>{videoError}</p>}
          {titleError && <p style={{ fontSize: 14, color: C.red }}>{titleError}</p>}
        </div>
      )}

      {!isLoading && (videoResult || titleResult) && (
        <>
          {/* Fix first banner */}
          {a?.priority && (() => {
            const area = a.priority.split('|')[0]?.trim().toLowerCase()
            const msg  = a.priority.replace(/^[^|]*\|?\s*/, '')
            return (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.red, background: C.redBg, border: `1px solid ${C.redBdr}`, padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0, marginTop: 1 }}>Fix first: {area}</span>
                <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.5 }}>{msg}</p>
              </div>
            )
          })()}

          {/* ── TITLE ANALYSIS ── */}
          {titleResult && (
            <Section title="Title Analysis">
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, marginBottom: 18 }}>
                {/* Score + keyword */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <ScoreRing score={titleResult.score} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: titleResult.score >= 75 ? C.green : titleResult.score >= 50 ? C.amber : C.red }}>
                    {titleResult.score >= 75 ? 'Strong' : titleResult.score >= 50 ? 'Needs work' : 'Weak'}
                  </span>
                  {titleResult.primary_phrase && (
                    <span style={{ fontSize: 12, color: C.blue, background: C.blueBg, padding: '3px 10px', borderRadius: 100, fontWeight: 600, border: `1px solid ${C.blueBdr}` }}>
                      {titleResult.primary_phrase}
                    </span>
                  )}
                  {titleResult.videos_found > 0 && (
                    <span style={{ fontSize: 12, color: C.text3 }}>{titleResult.videos_found} competitor videos</span>
                  )}
                </div>
                {/* Breakdown bars */}
                <div>
                  {Object.entries(BREAKDOWN_META).map(([key]) => (
                    <BreakdownBar key={key} criterionKey={key} value={titleResult.breakdown?.[key] ?? 0} max={BREAKDOWN_META[key].max} />
                  ))}
                </div>
              </div>

              {/* Power words */}
              {titleResult.power_words_found?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
                  {titleResult.power_words_found.map(w => (
                    <span key={w} style={{ fontSize: 12, fontWeight: 700, background: C.surface, color: C.text2, padding: '2px 9px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.04em', border: `1px solid ${C.border}` }}>{w}</span>
                  ))}
                </div>
              )}

              {/* Intent analysis — clean 2-col layout */}
              {titleResult.intent_analysis?.search_intent && (
                <div style={{ background: C.surface, borderRadius: 10, padding: '14px 16px', marginBottom: 16, border: `1px solid ${C.borderFaint}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: titleResult.intent_analysis.gap_opportunity ? 12 : 0 }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Search Intent</p>
                      <p style={{ fontSize: 14, fontWeight: 500, color: C.text1, lineHeight: 1.45 }}>{titleResult.intent_analysis.search_intent}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Emotional Driver</p>
                      <p style={{ fontSize: 14, fontWeight: 500, color: C.text1, lineHeight: 1.45 }}>{titleResult.intent_analysis.emotional_driver}</p>
                    </div>
                  </div>
                  {titleResult.intent_analysis.gap_opportunity && (
                    <div style={{ borderTop: `1px solid ${C.borderFaint}`, paddingTop: 12 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Competitor Gap</p>
                      <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.5 }}>{titleResult.intent_analysis.gap_opportunity}</p>
                      {titleResult.intent_analysis.overused_angle && (
                        <p style={{ fontSize: 14, color: C.text3, marginTop: 5, lineHeight: 1.45 }}>
                          <span style={{ fontWeight: 700, color: C.text2 }}>Overused: </span>{titleResult.intent_analysis.overused_angle}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Suggested titles */}
              {titleResult.suggestions?.length > 0 && (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                    AI-Suggested Titles — select one to apply
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                    {titleResult.suggestions.map((s, i) => {
                      const hm = HOOK_META[s.hook] || HOOK_META.curiosity
                      const isSelc = selectedSuggestion === i
                      return (
                        <div key={i}
                          onClick={() => { setSelectedSuggestion(i); setTitleApply('idle') }}
                          style={{
                            border: `1.5px solid ${isSelc ? C.blue : C.border}`,
                            borderRadius: 12, background: C.card, cursor: 'pointer',
                            transition: 'border-color 0.15s, box-shadow 0.15s',
                            boxShadow: isSelc ? '0 0 0 3px rgba(37,99,235,0.08)' : 'none',
                          }}>
                          <div style={{ padding: '11px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                              <span style={{ fontSize: 12, fontWeight: 800, color: hm.color, background: C.surface, padding: '2px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.07em', border: `1px solid ${C.border}` }}>{hm.label}</span>
                              <span style={{ fontSize: 14, color: C.text3 }}>{hm.desc}</span>
                            </div>
                            <p style={{ fontSize: 16, fontWeight: 600, color: C.text1, lineHeight: 1.4, marginBottom: 6 }}>{s.title}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 12, color: s.length >= 50 && s.length <= 70 ? C.green : C.amber, fontWeight: 600 }}>{s.length} chars</span>
                              {s.power_words_found?.map(w => (
                                <span key={w} style={{ fontSize: 12, fontWeight: 700, background: C.surface, color: C.text2, padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', border: `1px solid ${C.border}` }}>{w}</span>
                              ))}
                              <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
                                {s.seo_score  > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: s.seo_score  >= 70 ? C.green : s.seo_score  >= 50 ? C.amber : C.red }}>{s.seo_score} SEO</span>}
                                {s.ctr_score  > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: s.ctr_score  >= 70 ? C.green : s.ctr_score  >= 50 ? C.amber : C.red }}>{s.ctr_score} CTR</span>}
                                {s.hook_score > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: s.hook_score >= 70 ? C.green : s.hook_score >= 50 ? C.amber : C.red }}>{s.hook_score} Hook</span>}
                              </div>
                            </div>
                          </div>
                          {s.why_it_works && (
                            <div style={{ padding: '10px 14px 12px', borderTop: `1px solid ${C.borderFaint}` }}>
                              <p style={{ fontSize: 14, color: C.text3, lineHeight: 1.55 }}>
                                <span style={{ fontWeight: 700, color: C.text2 }}>Why it works: </span>{s.why_it_works}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <TitlePreviewSimulator title={titleResult.suggestions[selectedSuggestion]?.title} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                    <ApplyButton onClick={applyTitle} state={titleApply} />
                    {titleApply === 'error' && titleApplyErr && (
                      <span style={{ fontSize: 12, color: C.red }}>{titleApplyErr}</span>
                    )}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* ── DESCRIPTION ── */}
          {a && (
            <Section title="Description">
              <div style={{ marginBottom: 14 }}>
                <ScoreBar score={a.description.score} label="Quality score" />
              </div>
              <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.6, marginBottom: 12 }}>{a.description.verdict}</p>

              {a.description.hook_quality && (
                <div style={{ background: C.surface, borderRadius: 8, padding: '10px 12px', marginBottom: 12, borderLeft: `2px solid ${C.blue}` }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Hook — first 150 chars</p>
                  <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.5 }}>{a.description.hook_quality}</p>
                </div>
              )}

              {a.description.issues?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  {a.description.issues.map((issue, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 5 }}>
                      <span style={{ fontSize: 14, color: C.red, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✕</span>
                      <span style={{ fontSize: 14, color: C.text2, lineHeight: 1.45 }}>{issue}</span>
                    </div>
                  ))}
                </div>
              )}

              {!descResult && (
                <div style={{ borderTop: `1px solid ${C.borderFaint}`, paddingTop: 14 }}>
                  <p style={{ fontSize: 14, color: C.text3, marginBottom: 12 }}>
                    Generate 3 AI-optimised descriptions (story / value / keyword) and apply directly to YouTube.
                    {titleApply === 'success' && <span style={{ color: C.green, fontWeight: 600 }}> Using your new applied title.</span>}
                  </p>
                  <button onClick={generateDescriptions} disabled={descLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: !descLoading ? C.blue : C.surface, color: !descLoading ? '#fff' : C.text3, border: 'none', borderRadius: 100, fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: !descLoading ? 'pointer' : 'not-allowed', transition: 'all 0.15s', boxShadow: !descLoading ? '0 1px 3px rgba(37,99,235,0.2), 0 4px 12px rgba(37,99,235,0.18)' : 'none' }}>
                    {descLoading ? <><SpinIcon /> Generating…</> : <>
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 1l1.5 4.5H13l-3.7 2.7 1.4 4.3L7 10 3.3 12.5l1.4-4.3L1 5.5h4.5z"/></svg>
                      Generate 3 descriptions
                    </>}
                  </button>
                  {descError && <p style={{ marginTop: 10, fontSize: 14, color: C.red }}>{descError}</p>}
                </div>
              )}

              {descResult?.length > 0 && (
                <div style={{ borderTop: `1px solid ${C.borderFaint}`, paddingTop: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <p style={{ fontSize: 14, color: C.text3 }}>Expand each to review &amp; edit, then apply directly to YouTube.</p>
                    <button onClick={() => { setDescResult(null); setDescApplyStates({}); setDescApplyErrors({}) }}
                      style={{ fontSize: 14, color: C.text2, background: C.card, border: `1px solid ${C.border}`, borderRadius: 100, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                      Regenerate
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {descResult.map((d, i) => (
                      <DescriptionCard key={i} d={d} idx={i}
                        applyState={descApplyStates[i] || 'idle'}
                        applyError={descApplyErrors[i] || ''}
                        onApply={applyDescription} />
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* ── THUMBNAIL ── */}
          {a?.thumbnail && (
            <Section title="Thumbnail">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
                <div>
                  <div style={{ marginBottom: 14 }}>
                    <ScoreBar score={a.thumbnail.score} label="Visual score" />
                  </div>
                  <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.6, marginBottom: 12 }}>{a.thumbnail.verdict}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                    <CheckBadge value={a.thumbnail.has_text_overlay} trueLabel="Text overlay"    falseLabel="No text overlay" />
                    <CheckBadge value={a.thumbnail.has_face}         trueLabel="Face present"    falseLabel="No face"         />
                    <CheckBadge value={a.thumbnail.contrast_strong}  trueLabel="Strong contrast" falseLabel="Weak contrast"   />
                  </div>
                  {a.thumbnail.tips?.length > 0 && (
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Recommendations</p>
                      {a.thumbnail.tips.map((tip, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                          <span style={{ fontSize: 14, color: C.blue, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>→</span>
                          <span style={{ fontSize: 14, color: C.text2, lineHeight: 1.45 }}>{tip}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ padding: '12px 16px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, maxWidth: 220 }}>
                  <p style={{ fontSize: 14, color: C.text3, lineHeight: 1.55 }}>
                    Thumbnails must be uploaded manually in YouTube Studio. Use these recommendations to guide your redesign.
                  </p>
                </div>
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  )
}
