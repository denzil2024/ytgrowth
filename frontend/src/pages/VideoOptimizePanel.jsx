import { useEffect, useState } from 'react'

const API = 'http://localhost:8000'

function cacheKey(videoId) { return `videoOptimize_${videoId}` }
function loadCache(videoId) {
  try { const r = localStorage.getItem(cacheKey(videoId)); return r ? JSON.parse(r) : null } catch { return null }
}
function saveCache(videoId, data) {
  try { localStorage.setItem(cacheKey(videoId), JSON.stringify(data)) } catch {}
}
function clearCache(videoId) {
  try { localStorage.removeItem(cacheKey(videoId)) } catch {}
}

const C = {
  card: '#fff', border: '#e8e8ec', text1: '#0f0f10', text2: '#3a3a3c', text3: '#8e8e93',
  red: '#ff3b30', green: '#34c759', blue: '#007aff', orange: '#ff9500', purple: '#af52de',
  teal: '#32ade6',
  blueBg: '#f0f6ff', greenBg: '#f0fdf4', orangeBg: '#fff7ed', redBg: '#fff5f5',
  purpleBg: '#f8f0ff', tealBg: '#f0f9ff',
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
  story:   { color: C.purple, bg: C.purpleBg },
  value:   { color: C.teal,   bg: C.tealBg   },
  keyword: { color: C.blue,   bg: C.blueBg   },
}

const HOOK_META = {
  curiosity:      { label: 'Curiosity / FOMO', color: C.purple, bg: C.purpleBg, desc: "Makes viewers feel they're missing something" },
  transformation: { label: 'Transformation',   color: C.teal,   bg: C.tealBg,   desc: 'Focuses on the outcome or result' },
  contrarian:     { label: 'Contrarian',        color: C.blue,   bg: C.blueBg,   desc: "Challenges assumptions — what others don't show" },
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function ScoreRing({ score }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = score >= 75 ? C.green : score >= 50 ? C.orange : C.red
  return (
    <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
      <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="48" cy="48" r={r} fill="none" stroke={C.border} strokeWidth="7" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-1px' }}>{score}</span>
        <span style={{ fontSize: 9, color: C.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>/100</span>
      </div>
    </div>
  )
}

function ScoreBar({ score, label }) {
  const color = score >= 70 ? C.green : score >= 45 ? C.orange : C.red
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: C.text2 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color }}>{score}/100</span>
      </div>
      <div style={{ height: 6, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
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
  const color = pct >= 80 ? C.green : pct >= 40 ? C.orange : C.red
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 11.5, color: C.text2, fontWeight: 500 }}>{meta.label}</span>
          <button onClick={() => setShowWhy(v => !v)}
            style={{ width: 13, height: 13, borderRadius: '50%', border: `1px solid ${C.text3}`, background: 'transparent', cursor: 'pointer', fontSize: 8, fontWeight: 700, color: C.text3, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>?
          </button>
        </div>
        <span style={{ fontSize: 11, color, fontWeight: 700 }}>{value}/{max}</span>
      </div>
      <div style={{ height: 5, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>
      {showWhy && (
        <p style={{ fontSize: 11, color: C.text2, marginTop: 5, lineHeight: 1.5, background: '#f8f8fa', padding: '6px 9px', borderRadius: 6, borderLeft: `3px solid ${color}` }}>
          {meta.why}
        </p>
      )}
    </div>
  )
}

function CheckBadge({ value, trueLabel, falseLabel }) {
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 700,
      color: value ? C.green : C.orange,
      background: value ? C.greenBg : C.orangeBg,
      padding: '2px 8px', borderRadius: 20,
      border: `1px solid ${value ? '#bbf7d0' : '#fed7aa'}`,
    }}>
      {value ? trueLabel : falseLabel}
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
    <div style={{ padding: '10px 12px', background: '#f8f8fa', borderRadius: 9, border: `1px solid ${C.border}` }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>How it appears on YouTube</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
        {surfaces.map(({ label, maxChars }) => {
          const truncated = title.length > maxChars
          const display   = truncated ? title.slice(0, maxChars - 1) + '…' : title
          return (
            <div key={label} style={{ padding: '7px 9px', background: C.card, borderRadius: 7, border: `1px solid ${truncated ? '#fed7aa' : '#bbf7d0'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: truncated ? C.orange : C.green }}>{truncated ? `cut at ${maxChars}` : 'fits ✓'}</span>
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, color: C.text1, lineHeight: 1.4 }}>{display}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ApplyButton({ onClick, state, label = 'Apply to YouTube' }) {
  const styles = {
    idle:    { bg: C.blue,    color: '#fff',   border: C.blue      },
    loading: { bg: '#cce4ff', color: C.blue,   border: '#cce4ff'   },
    success: { bg: C.greenBg, color: C.green,  border: '#bbf7d0'   },
    error:   { bg: C.redBg,   color: C.red,    border: '#fecaca'   },
  }
  const s = styles[state] || styles.idle
  const labels = { idle: label, loading: 'Applying…', success: '✓ Applied', error: '✗ Failed' }
  return (
    <button onClick={onClick} disabled={state === 'loading' || state === 'success'}
      style={{
        fontSize: 11.5, fontWeight: 700, padding: '6px 14px', borderRadius: 8,
        background: s.bg, color: s.color, border: `1.5px solid ${s.border}`,
        cursor: state === 'loading' || state === 'success' ? 'default' : 'pointer',
        fontFamily: 'inherit', transition: 'all 0.2s',
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

// ── Description card (expand/collapse + Apply) ─────────────────────────────────

function DescriptionCard({ d, idx, applyState, applyError, onApply }) {
  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState(d.full)
  const tm = DESC_TYPE_META[d.type] || DESC_TYPE_META.value
  return (
    <div style={{ border: `1.5px solid ${applyState === 'success' ? '#bbf7d0' : C.border}`, borderRadius: 12, overflow: 'hidden', background: applyState === 'success' ? C.greenBg : C.card }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: tm.bg, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: tm.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d.label}</span>
        <span style={{ fontSize: 11, color: C.text3 }}>{d.why_it_works}</span>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <p style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.6, background: '#f8f8fa', padding: '8px 10px', borderRadius: 7, borderLeft: `3px solid ${tm.color}`, marginBottom: 8 }}>
          {d.preview}
        </p>
        {expanded && (
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={8}
            style={{ width: '100%', fontSize: 12.5, color: C.text1, lineHeight: 1.7, background: '#fafafc', padding: '10px 12px', borderRadius: 8, marginBottom: 8, border: `1px solid ${C.border}`, fontFamily: "'Inter', system-ui, sans-serif", resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
          />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setExpanded(v => !v)}
            style={{ fontSize: 11.5, color: C.blue, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
            {expanded ? 'Collapse ↑' : 'Show full ↓'}
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {applyState === 'error' && applyError && (
              <span style={{ fontSize: 11, color: C.red }}>{applyError}</span>
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
  const cached = loadCache(video.video_id)

  // Video analysis (thumbnail + description quality)
  const [videoResult, setVideoResult] = useState(cached?.videoResult ?? null)
  const [videoLoading, setVideoLoading] = useState(!cached)
  const [videoError, setVideoError] = useState('')

  // Title analysis (full SEO analysis — same engine as SeoOptimizer)
  const [titleResult, setTitleResult] = useState(cached?.titleResult ?? null)
  const [titleLoading, setTitleLoading] = useState(!cached)
  const [titleError, setTitleError] = useState('')

  // Selected title suggestion index for Apply
  const [selectedSuggestion, setSelectedSuggestion] = useState(cached?.selectedSuggestion ?? 0)
  const [titleApply, setTitleApply]       = useState('idle')
  const [titleApplyErr, setTitleApplyErr] = useState('')

  // Description generate flow
  const [descLoading, setDescLoading] = useState(false)
  const [descResult, setDescResult]   = useState(cached?.descResult ?? null)
  const [descError, setDescError]     = useState('')
  const [descApplyStates, setDescApplyStates] = useState({})
  const [descApplyErrors, setDescApplyErrors] = useState({})

  // Persist to cache whenever results change
  useEffect(() => {
    if (videoResult || titleResult) {
      saveCache(video.video_id, { videoResult, titleResult, selectedSuggestion, descResult })
    }
  }, [videoResult, titleResult, selectedSuggestion, descResult])

  useEffect(() => {
    if (cached) return  // already have results — skip API calls
    async function runAll() {
      // Fire both requests in parallel
      const [videoRes, titleRes] = await Promise.allSettled([
        fetch(`${API}/seo/optimize-video`, {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            video_id:      video.video_id,
            title:         video.title,
            thumbnail_url: video.thumbnail,
            views:         video.views,
            likes:         video.likes,
          }),
        }),
        fetch(`${API}/seo/analyze`, {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: video.title, confirmed_keyword: '' }),
        }),
      ])

      // Handle video analysis
      if (videoRes.status === 'fulfilled') {
        const res = videoRes.value
        const data = await res.json()
        if (!res.ok) setVideoError(data.error || 'Video analysis failed.')
        else setVideoResult(data)
      } else {
        setVideoError('Could not reach the server.')
      }
      setVideoLoading(false)

      // Handle title analysis
      if (titleRes.status === 'fulfilled') {
        const res = titleRes.value
        const data = await res.json()
        if (!res.ok) setTitleError(data.error || 'Title analysis failed.')
        else setTitleResult(data)
      } else {
        setTitleError('Could not reach the server.')
      }
      setTitleLoading(false)
    }
    runAll()
  }, [video.video_id])

  function handleClear() {
    clearCache(video.video_id)
    setVideoResult(null)
    setTitleResult(null)
    setDescResult(null)
    setSelectedSuggestion(0)
    setVideoError('')
    setTitleError('')
    setDescError('')
    setVideoLoading(true)
    setTitleLoading(true)
    // Re-trigger analysis
    const event = new Event('reanalyze')
    window.dispatchEvent(event)
  }

  useEffect(() => {
    function onReanalyze() {
      async function runAll() {
        const [videoRes, titleRes] = await Promise.allSettled([
          fetch(`${API}/seo/optimize-video`, {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              video_id:      video.video_id,
              title:         video.title,
              thumbnail_url: video.thumbnail,
              views:         video.views,
              likes:         video.likes,
            }),
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
      runAll()
    }
    window.addEventListener('reanalyze', onReanalyze)
    return () => window.removeEventListener('reanalyze', onReanalyze)
  }, [video.video_id])

  async function applyTitle() {
    const suggestions = titleResult?.suggestions
    if (!suggestions?.length) return
    const title = suggestions[selectedSuggestion]?.title
    if (!title) return
    setTitleApply('loading')
    setTitleApplyErr('')
    try {
      const res = await fetch(`${API}/seo/update-video`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: video.video_id, title }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setTitleApplyErr(data.error || 'Update failed.'); setTitleApply('error') }
      else { setTitleApply('success'); onVideoUpdated?.(video.video_id, { title }) }
    } catch {
      setTitleApplyErr('Could not reach the server.')
      setTitleApply('error')
    }
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
      } else {
        setDescApplyStates(s => ({ ...s, [idx]: 'success' }))
      }
    } catch {
      setDescApplyStates(s => ({ ...s, [idx]: 'error' }))
      setDescApplyErrors(s => ({ ...s, [idx]: 'Could not reach the server.' }))
    }
  }

  async function generateDescriptions() {
    const titleForDesc = titleResult?.suggestions?.[selectedSuggestion]?.title || video.title
    setDescLoading(true)
    setDescError('')
    setDescResult(null)
    setDescApplyStates({})
    setDescApplyErrors({})
    try {
      const res = await fetch(`${API}/seo/generate-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:               titleForDesc,
          current_description: videoResult?.description || '',
          niche:               titleResult?.primary_phrase || '',
        }),
      })
      const data = await res.json()
      if (!res.ok) { setDescError(data.error || 'Generation failed.'); return }
      setDescResult(data.descriptions)
    } catch {
      setDescError('Could not reach the server.')
    } finally {
      setDescLoading(false)
    }
  }

  const a = videoResult?.analysis
  const priorityArea  = a?.priority?.split('|')[0]?.trim().toLowerCase()
  const priorityColor = priorityArea === 'title' ? C.blue : priorityArea === 'description' ? C.purple : C.orange

  const isLoading = videoLoading || titleLoading

  return (
    <div style={{ background: '#f8f8fc', border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '20px 20px 28px', animation: 'fadeUp 0.2s ease' }}>

      {/* Panel header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        {video.thumbnail && (
          <img src={video.thumbnail} alt="" style={{ width: 80, height: 45, borderRadius: 6, objectFit: 'cover', flexShrink: 0, border: `1px solid ${C.border}` }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>Video Optimisation</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.title}</p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {(videoResult || titleResult) && (
            <button onClick={handleClear}
              style={{ fontSize: 11.5, color: C.orange, background: 'none', border: `1px solid #fed7aa`, borderRadius: 8, padding: '5px 11px', cursor: 'pointer', fontFamily: 'inherit' }}>
              Re-analyse
            </button>
          )}
          <button onClick={onClose}
            style={{ fontSize: 11.5, color: C.text3, background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 11px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Close
          </button>
        </div>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', color: C.text3 }}>
          <SpinIcon />
          <span style={{ fontSize: 13 }}>Analysing title against competitor data, description &amp; thumbnail…</span>
        </div>
      )}

      {(videoError || titleError) && !isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 0' }}>
          {videoError && <p style={{ fontSize: 13, color: C.red }}>{videoError}</p>}
          {titleError && <p style={{ fontSize: 13, color: C.red }}>{titleError}</p>}
        </div>
      )}

      {!isLoading && (videoResult || titleResult) && (
        <>
          {/* Priority banner */}
          {a?.priority && (
            <div style={{ background: C.card, border: `1.5px solid ${priorityColor}`, borderRadius: 10, padding: '10px 14px', marginBottom: 18, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColor, flexShrink: 0, marginTop: 4 }} />
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: priorityColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fix first: {priorityArea}</span>
                <p style={{ fontSize: 12.5, color: C.text2, marginTop: 2, lineHeight: 1.5 }}>{a.priority.replace(/^[^|]*\|?\s*/, '')}</p>
              </div>
            </div>
          )}

          {/* ── TITLE ── */}
          {titleResult && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Title Analysis</p>

              {/* Score ring + breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, marginBottom: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <ScoreRing score={titleResult.score} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: titleResult.score >= 75 ? C.green : titleResult.score >= 50 ? C.orange : C.red }}>
                    {titleResult.score >= 75 ? 'Strong' : titleResult.score >= 50 ? 'Needs work' : 'Weak'}
                  </span>
                  {titleResult.primary_phrase && (
                    <span style={{ fontSize: 10, color: C.blue, background: C.blueBg, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                      {titleResult.primary_phrase}
                    </span>
                  )}
                  {titleResult.videos_found > 0 && (
                    <span style={{ fontSize: 10, color: C.text3 }}>{titleResult.videos_found} competitor videos</span>
                  )}
                </div>
                <div>
                  {Object.entries(BREAKDOWN_META).map(([key]) => (
                    <BreakdownBar key={key} criterionKey={key} value={titleResult.breakdown?.[key] ?? 0} max={BREAKDOWN_META[key].max} />
                  ))}
                </div>
              </div>

              {/* Power words */}
              {titleResult.power_words_found?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                  {titleResult.power_words_found.map(w => (
                    <span key={w} style={{ fontSize: 10, fontWeight: 700, background: C.blueBg, color: C.blue, padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{w}</span>
                  ))}
                </div>
              )}

              {/* Intent analysis */}
              {titleResult.intent_analysis?.search_intent && (
                <div style={{ background: '#f8f8fa', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Search Intent</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <div style={{ background: C.blueBg, borderRadius: 8, padding: '9px 11px' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Intent</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: C.text1 }}>{titleResult.intent_analysis.search_intent}</p>
                    </div>
                    <div style={{ background: C.orangeBg, borderRadius: 8, padding: '9px 11px' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Emotional Driver</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: C.text1 }}>{titleResult.intent_analysis.emotional_driver}</p>
                    </div>
                  </div>
                  {titleResult.intent_analysis.gap_opportunity && (
                    <div style={{ background: C.greenBg, border: `1px solid #bbf7d0`, borderRadius: 8, padding: '9px 11px' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Gap — what competitors are NOT doing</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: C.text1, lineHeight: 1.5 }}>{titleResult.intent_analysis.gap_opportunity}</p>
                      {titleResult.intent_analysis.overused_angle && (
                        <p style={{ fontSize: 11, color: C.text3, marginTop: 5, lineHeight: 1.5 }}>
                          <span style={{ fontWeight: 700, color: C.red }}>Overused: </span>{titleResult.intent_analysis.overused_angle}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Gaps the AI titles fix */}
              {(() => {
                const fixes = Object.entries(BREAKDOWN_META).filter(([k]) => (titleResult.breakdown?.[k] ?? 0) === 0)
                if (!fixes.length) return null
                return (
                  <div style={{ background: C.orangeBg, border: `1px solid #fed7aa`, borderRadius: 9, padding: '10px 14px', marginBottom: 16 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Gaps the suggested titles fix</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {fixes.map(([key, meta]) => (
                        <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: C.orange, minWidth: 90, flexShrink: 0 }}>{meta.label}</span>
                          <span style={{ fontSize: 11.5, color: C.text2, lineHeight: 1.5 }}>{meta.why.split('.')[0]}.</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Suggested titles */}
              {titleResult.suggestions?.length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                    AI-Suggested Titles — select one to apply
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                    {titleResult.suggestions.map((s, i) => {
                      const hm = HOOK_META[s.hook] || HOOK_META.curiosity
                      const isSelected = selectedSuggestion === i
                      const seoColor  = s.seo_score  >= 70 ? C.green : s.seo_score  >= 50 ? C.orange : C.red
                      const ctrColor  = s.ctr_score  >= 70 ? C.green : s.ctr_score  >= 50 ? C.orange : C.red
                      const hookColor = s.hook_score >= 70 ? C.green : s.hook_score >= 50 ? C.orange : C.red
                      return (
                        <div key={i}
                          onClick={() => { setSelectedSuggestion(i); setTitleApply('idle') }}
                          style={{ border: `1.5px solid ${isSelected ? C.blue : C.border}`, borderRadius: 11, overflow: 'hidden', background: isSelected ? C.blueBg : C.card, cursor: 'pointer', transition: 'all 0.15s' }}>
                          {/* Hook label */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 13px', background: hm.bg, borderBottom: `1px solid ${C.border}` }}>
                            <span style={{ fontSize: 9.5, fontWeight: 800, color: hm.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{hm.label}</span>
                            <span style={{ fontSize: 11, color: C.text3 }}>{hm.desc}</span>
                          </div>
                          {/* Title + scores */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '10px 13px' }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text1, lineHeight: 1.4 }}>{s.title}</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 11, color: s.length >= 50 && s.length <= 70 ? C.green : C.orange }}>{s.length} chars</span>
                                {s.power_words_found?.map(w => (
                                  <span key={w} style={{ fontSize: 9.5, fontWeight: 700, background: C.blueBg, color: C.blue, padding: '1px 6px', borderRadius: 20, textTransform: 'uppercase' }}>{w}</span>
                                ))}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                              {s.seo_score  > 0 && <div style={{ textAlign: 'center' }}><p style={{ fontSize: 13, fontWeight: 800, color: seoColor,  lineHeight: 1 }}>{s.seo_score}</p> <p style={{ fontSize: 9, color: C.text3 }}>SEO</p></div>}
                              {s.ctr_score  > 0 && <div style={{ textAlign: 'center' }}><p style={{ fontSize: 13, fontWeight: 800, color: ctrColor,  lineHeight: 1 }}>{s.ctr_score}</p> <p style={{ fontSize: 9, color: C.text3 }}>CTR</p></div>}
                              {s.hook_score > 0 && <div style={{ textAlign: 'center' }}><p style={{ fontSize: 13, fontWeight: 800, color: hookColor, lineHeight: 1 }}>{s.hook_score}</p><p style={{ fontSize: 9, color: C.text3 }}>Hook</p></div>}
                            </div>
                          </div>
                          {/* Why it works */}
                          {s.why_it_works && (
                            <div style={{ padding: '7px 13px', borderTop: `1px solid ${C.border}`, background: '#fafafc' }}>
                              <p style={{ fontSize: 11, color: C.text2, lineHeight: 1.5 }}>
                                <span style={{ fontWeight: 700, color: hm.color }}>Why it works: </span>{s.why_it_works}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Preview + Apply row */}
                  <TitlePreviewSimulator title={titleResult.suggestions[selectedSuggestion]?.title} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                    <ApplyButton onClick={applyTitle} state={titleApply} />
                    {titleApply === 'error' && titleApplyErr && (
                      <span style={{ fontSize: 11, color: C.red }}>{titleApplyErr}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── DESCRIPTION ── */}
          {a && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Description</p>

              {/* Quality score + verdict */}
              <div style={{ marginBottom: 12 }}>
                <ScoreBar score={a.description.score} label="Quality score" />
              </div>
              <p style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.55, marginBottom: 10 }}>{a.description.verdict}</p>

              {a.description.hook_quality && (
                <div style={{ background: '#f8f8fa', borderRadius: 8, padding: '8px 10px', marginBottom: 10, borderLeft: `3px solid ${C.blue}` }}>
                  <p style={{ fontSize: 9.5, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Hook (first 150 chars)</p>
                  <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.5 }}>{a.description.hook_quality}</p>
                </div>
              )}

              {a.description.issues?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  {a.description.issues.map((issue, i) => (
                    <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: C.red, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✕</span>
                      <span style={{ fontSize: 12, color: C.text2, lineHeight: 1.45 }}>{issue}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Generate descriptions */}
              {!descResult && (
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                  <p style={{ fontSize: 12, color: C.text3, marginBottom: 10 }}>
                    Generate 3 AI-optimised descriptions (story / value / keyword) and apply directly to YouTube.
                    {titleApply === 'success' && <span style={{ color: C.green, fontWeight: 600 }}> Using your new applied title.</span>}
                  </p>
                  <button onClick={generateDescriptions} disabled={descLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', background: !descLoading ? C.blue : '#c7c7cc', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: !descLoading ? 'pointer' : 'not-allowed', transition: 'background 0.15s' }}>
                    {descLoading ? <><SpinIcon /> Generating…</> : <>
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 1l1.5 4.5H13l-3.7 2.7 1.4 4.3L7 10 3.3 12.5l1.4-4.3L1 5.5h4.5z"/>
                      </svg>
                      Generate 3 descriptions
                    </>}
                  </button>
                  {descError && <p style={{ marginTop: 10, fontSize: 12.5, color: C.red }}>{descError}</p>}
                </div>
              )}

              {descResult?.length > 0 && (
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <p style={{ fontSize: 12, color: C.text3 }}>Expand each to review &amp; edit, then apply directly to YouTube.</p>
                    <button onClick={() => { setDescResult(null); setDescApplyStates({}); setDescApplyErrors({}) }}
                      style={{ fontSize: 11.5, color: C.text3, background: 'none', border: `1px solid ${C.border}`, borderRadius: 7, padding: '4px 9px', cursor: 'pointer', fontFamily: 'inherit' }}>
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
            </div>
          )}

          {/* ── THUMBNAIL ── */}
          {a?.thumbnail && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Thumbnail</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                <div>
                  <div style={{ marginBottom: 10 }}>
                    <ScoreBar score={a.thumbnail.score} label="Visual score" />
                  </div>
                  <p style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.55, marginBottom: 10 }}>{a.thumbnail.verdict}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    <CheckBadge value={a.thumbnail.has_text_overlay} trueLabel="Text overlay" falseLabel="No text overlay" />
                    <CheckBadge value={a.thumbnail.has_face}         trueLabel="Face present"  falseLabel="No face"         />
                    <CheckBadge value={a.thumbnail.contrast_strong}  trueLabel="Strong contrast" falseLabel="Weak contrast" />
                  </div>
                  {a.thumbnail.tips?.length > 0 && (
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Recommendations</p>
                      {a.thumbnail.tips.map((tip, i) => (
                        <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 6 }}>
                          <span style={{ fontSize: 11, color: C.orange, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>→</span>
                          <span style={{ fontSize: 12, color: C.text2, lineHeight: 1.45 }}>{tip}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ padding: '10px 12px', background: C.orangeBg, border: `1px solid #fed7aa`, borderRadius: 9, maxWidth: 200 }}>
                  <p style={{ fontSize: 11, color: '#92400e', lineHeight: 1.5 }}>
                    Thumbnails must be uploaded manually in YouTube Studio. Use the recommendations to guide your redesign.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
