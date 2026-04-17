import { useState, useEffect } from 'react'

const STORAGE_KEY = 'titleOptimizer_v1'

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveToDisk(title, result) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ title, result }))
  } catch {}
}

const API = ''

const C = {
  bg: '#f5f5f7',
  card: '#fff',
  border: '#e8e8ec',
  text1: '#0f0f10',
  text2: '#3a3a3c',
  text3: '#8e8e93',
  red: '#ff3b30',
  green: '#34c759',
  blue: '#007aff',
  orange: '#ff9500',
  purple: '#af52de',
  teal: '#32ade6',
  blueBg: '#f0f6ff',
  greenBg: '#f0fdf4',
  orangeBg: '#fff7ed',
  purpleBg: '#f8f0ff',
  tealBg: '#f0f9ff',
}

const VIRAL_FORMATS = [
  { key: 'survival_challenge',  label: 'Survival / Time Challenge', example: 'I Survived 24 Hours With [Person/Situation]',        why: 'Extreme curiosity + suspense.' },
  { key: 'extreme_comparison',  label: 'Extreme Comparison',        example: '$5 VS $500 [Subject]: Honest Review',                 why: 'Price contrast triggers value-seeking.' },
  { key: 'authority_warning',   label: 'Authority / Warning',       example: "Don't Buy [Subject] Until You See This",              why: 'Fear of mistake drives high CTR.' },
  { key: 'listicle',            label: 'Listicle / Structure',      example: '7 Things I Wish I Knew About [Subject]',             why: 'Numbers set clear expectations.' },
  { key: 'curiosity_gap',       label: 'Curiosity Gap',             example: "I Tested Every [Subject] So You Don't Have To",      why: 'Open loop viewer must click to close.' },
  { key: 'aspirational',        label: 'Aspirational / How I',      example: 'How I Grew [Subject] From 0 to [Number] in [Time]',  why: 'Transformation stories = highest retention.' },
]

const VIRAL_FORMAT_LABELS = Object.fromEntries(VIRAL_FORMATS.map(f => [f.key, f.label]))

const STRATEGY_META = {
  search: { label: 'Search', color: C.blue,   bg: C.blueBg,   desc: 'Keyword-optimised to rank in YouTube search' },
  browse: { label: 'Browse', color: C.purple, bg: C.purpleBg, desc: 'Emotional hook for homepage & suggested feed' },
  hybrid: { label: 'Hybrid', color: C.teal,   bg: C.tealBg,   desc: 'Keywords + emotion — ranks and gets clicked' },
}

// Must match backend _score_title breakdown keys exactly
const BREAKDOWN_META = {
  length:           { label: 'Title length',        max: 25, why: '50–70 chars is the sweet spot. Shorter = no context. Longer = cut off on mobile (70%+ of YouTube watch time).' },
  front_loading:    { label: 'Front-loading',        max: 15, why: 'YouTube viewers scan the first 3 words to decide whether to read on. Your strongest keyword or hook must come first.' },
  power_words:      { label: 'Power words',          max: 15, why: 'Words like "Best", "Secret", "Never", "Shocking" trigger an emotional response that overrides the rational decision not to click.' },
  numbers:          { label: 'Numbers / digits',     max: 10, why: 'Specific numbers ("7 Tips", "24-Hour", "10x") outperform vague titles. They signal concrete, structured value.' },
  question:         { label: 'Question format',      max: 10, why: 'Questions create an unresolved tension the viewer needs to close. "Why does..." and "How do I..." titles get disproportionate clicks.' },
  hook_format:      { label: 'Hook / structure',     max: 10, why: 'A colon ":", parenthesis, or bracket splits your title into a hook + payoff — the viewer gets a promise and wants the answer.' },
  keyword_relevance:{ label: 'Keyword relevance',    max: 10, why: 'Titles that share phrases with top-viewed videos in your niche rank higher in search and appear in suggested videos more often.' },
  viral_format:     { label: 'Viral format',         max: 10, why: 'Titles following proven viral patterns (Curiosity Gap, Listicle, Authority/Warning, etc.) consistently outperform generic alternatives.' },
}

function ScoreRing({ score }) {
  const r = 44
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = score >= 75 ? C.green : score >= 50 ? C.orange : C.red
  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke={C.border} strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: '-1px' }}>{score}</span>
        <span style={{ fontSize: 12, color: C.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>/100</span>
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
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: C.text2, fontWeight: 500 }}>{meta.label}</span>
          <button onClick={() => setShowWhy(v => !v)}
            style={{ width: 14, height: 14, borderRadius: '50%', border: `1px solid ${C.text3}`, background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: C.text3, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1 }}>?
          </button>
        </div>
        <span style={{ fontSize: 12, color, fontWeight: 700 }}>{value}/{max}</span>
      </div>
      <div style={{ height: 6, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>
      {showWhy && (
        <p style={{ fontSize: 12, color: C.text2, marginTop: 6, lineHeight: 1.55, background: '#f8f8fa', padding: '7px 10px', borderRadius: 7, borderLeft: `3px solid ${color}` }}>
          {meta.why}
        </p>
      )}
    </div>
  )
}

function FormatTemplates({ onUse }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginBottom: 16, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', background: C.purpleBg, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.purple }}>Viral Format Templates</span>
          <span style={{ fontSize: 12, color: C.text3, fontWeight: 400 }}>click any to pre-fill your title</span>
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={C.text3} strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M2 4l4 4 4-4"/>
        </svg>
      </button>
      {open && (
        <div style={{ padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: C.card }}>
          {VIRAL_FORMATS.map(fmt => (
            <div key={fmt.key} onClick={() => onUse(fmt.example)}
              style={{ padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 9, cursor: 'pointer', background: '#fafafc', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.purple; e.currentTarget.style.background = C.purpleBg }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = '#fafafc' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.purple, marginBottom: 3 }}>{fmt.label}</p>
              <p style={{ fontSize: 12, color: C.text1, fontWeight: 500, lineHeight: 1.35, marginBottom: 3 }}>{fmt.example}</p>
              <p style={{ fontSize: 12, color: C.text3 }}>{fmt.why}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TitleOptimizer() {
  const saved = loadSaved()
  const [title, setTitle]               = useState(saved.title  || '')
  const [result, setResult]             = useState(saved.result || null)
  const [loading, setLoading]           = useState(false)
  const [loadingIntent, setLoadingIntent] = useState(false)
  const [error, setError]               = useState('')
  const [copied, setCopied]             = useState(null)
  const [intentOptions, setIntentOptions]     = useState(null)
  const [selectedKeyword, setSelectedKeyword] = useState('')

  // Auto-save whenever title or result changes — but don't wipe a previous result
  // while a new analysis is loading (result is temporarily null during fetch)
  useEffect(() => {
    if (result !== null) saveToDisk(title, result)
    else if (!loading) saveToDisk(title, null)
  }, [title, result, loading])

  function handleClear() {
    localStorage.removeItem(STORAGE_KEY)
    setTitle('')
    setResult(null)
    setError('')
    setIntentOptions(null)
    setSelectedKeyword('')
  }

  async function handleSubmitTitle() {
    if (!title.trim()) return
    setLoadingIntent(true)
    setError('')
    setResult(null)
    setIntentOptions(null)
    setSelectedKeyword('')
    try {
      const res = await fetch(`${API}/seo/intent-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.options?.length) {
        // If intent fetch fails, run full analysis without keyword confirmation
        await runAnalysis('')
        return
      }
      setIntentOptions(data.options)
    } catch {
      // Fallback: run analysis without intent picker
      await runAnalysis('')
    } finally {
      setLoadingIntent(false)
    }
  }

  async function runAnalysis(keyword) {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch(`${API}/seo/analyze`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), confirmed_keyword: keyword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      setResult(data)
      setIntentOptions(null)
    } catch {
      setError('Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  function handleSelectIntent(keyword) {
    setSelectedKeyword(keyword)
    runAnalysis(keyword)
  }

  function copyTitle(t, idx) {
    navigator.clipboard.writeText(t)
    setCopied(idx)
    setTimeout(() => setCopied(null), 1800)
  }

  const scoreLabel = result
    ? result.score >= 75 ? 'Strong' : result.score >= 50 ? 'Needs work' : 'Weak'
    : ''

  return (
    <div style={{ maxWidth: 860, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 3 }}>Title &amp; SEO Optimizer</h2>
          <p style={{ fontSize: 14, color: C.text3 }}>
            Searches YouTube for real competitor data, identifies the gap in your niche, and generates 3 titles built around the angle nobody else is using.
          </p>
        </div>
        {(title || result) && (
          <button onClick={handleClear}
            style={{ flexShrink: 0, marginLeft: 16, marginTop: 4, fontSize: 12, fontWeight: 600, color: C.text3, background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            Clear search
          </button>
        )}
      </div>

      {/* Input card */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

        <FormatTemplates onUse={t => setTitle(t)} />

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Your video title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmitTitle()}
            placeholder="e.g. How I grew my YouTube channel to 10k subscribers"
            style={{ width: '100%', padding: '10px 13px', fontSize: 14, border: `1.5px solid ${C.border}`, borderRadius: 9, fontFamily: 'inherit', outline: 'none', color: C.text1, background: '#fafafc', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
            onFocus={e => e.target.style.borderColor = C.blue}
            onBlur={e => e.target.style.borderColor = C.border} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <span style={{ fontSize: 12, color: title.length > 70 ? C.red : title.length >= 50 ? C.green : C.text3 }}>
              {title.length} chars {title.length >= 50 && title.length <= 70 ? '✓ ideal' : title.length > 70 ? '— too long' : '— aim for 50–70'}
            </span>
          </div>
        </div>

        <button onClick={handleSubmitTitle} disabled={loading || loadingIntent || !title.trim()}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: title.trim() && !loading && !loadingIntent ? C.blue : '#c7c7cc', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: title.trim() && !loading && !loadingIntent ? 'pointer' : 'not-allowed', transition: 'background 0.15s' }}>
          {loadingIntent ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.93 2.93l1.41 1.41M9.66 9.66l1.41 1.41M2.93 11.07l1.41-1.41M9.66 4.34l1.41-1.41"/></svg>
              Identifying search intent…
            </>
          ) : loading ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.93 2.93l1.41 1.41M9.66 9.66l1.41 1.41M2.93 11.07l1.41-1.41M9.66 4.34l1.41-1.41"/></svg>
              Researching &amp; generating…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="5"/><path d="m9 9 3 3"/></svg>
              Analyze &amp; suggest titles
            </>
          )}
        </button>

        {error && <p style={{ marginTop: 12, fontSize: 14, color: C.red }}>{error}</p>}
      </div>

      {/* Intent picker — shown between title input and full analysis */}
      {intentOptions && !loading && !result && (
        <div style={{ background: C.card, border: `1.5px solid ${C.blue}`, borderRadius: 16, padding: '22px 24px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,122,255,0.08)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, marginBottom: 4 }}>What's this video really about?</p>
          <p style={{ fontSize: 12, color: C.text3, marginBottom: 16 }}>
            The same words can mean different things on YouTube. Pick the closest match so we search the right niche.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {intentOptions.map((opt, i) => (
              <div key={i} onClick={() => handleSelectIntent(opt.keyword)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', border: `1.5px solid ${C.border}`, borderRadius: 11, cursor: 'pointer', background: '#fafafc', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.background = C.blueBg }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = '#fafafc' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text1 }}>{opt.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.blue, background: C.blueBg, padding: '1px 7px', borderRadius: 20 }}>{opt.keyword}</span>
                  </div>
                  <p style={{ fontSize: 12, color: C.text3, lineHeight: 1.45 }}>{opt.description}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={C.text3} strokeWidth="2"><path d="M6 3l5 5-5 5"/></svg>
              </div>
            ))}
          </div>
          <button onClick={() => runAnalysis('')}
            style={{ marginTop: 12, fontSize: 12, color: C.text3, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
            None of these — let the AI decide
          </button>
        </div>
      )}

      {result && (
        <>
          {/* Score + Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>SEO Score</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <ScoreRing score={result.score} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>{scoreLabel}</p>
                  <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.6 }}>
                    {result.score >= 75 ? 'Well optimised. Small tweaks can push it further.'
                      : result.score >= 50 ? 'Decent — the 3 AI titles below fix your gaps.'
                      : 'Needs work. The AI titles below address every gap.'}
                  </p>
                  {result.primary_phrase && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ fontSize: 12, color: C.text3 }}>Niche keyword: </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.blue, background: C.blueBg, padding: '2px 8px', borderRadius: 20 }}>
                        {result.primary_phrase}
                      </span>
                      {result.videos_found > 0 && (
                        <span style={{ fontSize: 12, color: C.text3, marginLeft: 8 }}>
                          → <span style={{ color: C.green, fontWeight: 600 }}>{result.videos_found} videos</span>
                          {result.intent_matched > 0 && result.intent_matched < result.videos_found && (
                            <span style={{ color: C.blue, fontWeight: 600 }}>, {result.intent_matched} exact matches</span>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                  {result.viral_format_detected && (
                    <span style={{ display: 'inline-block', marginTop: 6, fontSize: 12, fontWeight: 700, background: C.purpleBg, color: C.purple, padding: '3px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {VIRAL_FORMAT_LABELS[result.viral_format_detected]}
                    </span>
                  )}
                  {result.power_words_found?.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {result.power_words_found.map(w => (
                        <span key={w} style={{ fontSize: 12, fontWeight: 700, background: C.blueBg, color: C.blue, padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{w}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>Score breakdown</p>
              {Object.entries(BREAKDOWN_META).map(([key]) => (
                <BreakdownBar key={key} criterionKey={key} value={result.breakdown[key] ?? 0} max={BREAKDOWN_META[key].max} />
              ))}
            </div>
          </div>

          {/* Keyword Research — VidIQ-style scored table */}
          {result.keyword_scores?.length > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 24px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>Keyword Research</p>
                  <p style={{ fontSize: 12, color: C.text3 }}>
                    Volume = search demand (from YouTube autocomplete) &nbsp;·&nbsp;
                    Competition = how many top videos already target it &nbsp;·&nbsp;
                    Score = opportunity (high volume + low competition)
                  </p>
                </div>
              </div>

              {/* Scored keyword table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 16 }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 85px 50px', gap: 8, padding: '6px 10px', background: '#f5f5f7', borderRadius: '8px 8px 0 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Keyword phrase</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Volume</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Competition</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score</span>
                </div>
                {result.keyword_scores.map((kw, i) => {
                  const volColor = kw.volume === 'HIGH' ? C.green : kw.volume === 'MED' ? C.orange : C.text3
                  const compColor = kw.competition === 'LOW' ? C.green : kw.competition === 'MED' ? C.orange : C.red
                  const scoreColor = kw.score >= 65 ? C.green : kw.score >= 40 ? C.orange : C.red
                  return (
                    <div key={kw.phrase} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 85px 50px', gap: 8, padding: '9px 10px', borderBottom: i < result.keyword_scores.length - 1 ? `1px solid ${C.border}` : 'none', background: i % 2 === 0 ? '#fff' : '#fafafc' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.text1 }}>{kw.phrase}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: volColor }}>{kw.volume}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: compColor }}>{kw.competition}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: scoreColor }}>{kw.score}</span>
                    </div>
                  )
                })}
              </div>

              {/* Autocomplete row */}
              {result.autocomplete_terms?.length > 0 && (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 7 }}>
                    YouTube autocomplete
                    <span style={{ fontWeight: 400, color: C.text3, marginLeft: 6 }}>— real search queries (click any to set as title)</span>
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {result.autocomplete_terms.map(t => (
                      <span key={t} onClick={() => setTitle(t)}
                        style={{ fontSize: 12, color: C.blue, background: C.blueBg, padding: '3px 9px', borderRadius: 20, cursor: 'pointer', fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fix These First */}
          {(() => {
            const fixes = Object.entries(BREAKDOWN_META).filter(([k]) => (result.breakdown[k] ?? 0) === 0)
            if (!fixes.length) return null
            return (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Gaps the AI titles fix</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {fixes.map(([key, meta]) => (
                    <div key={key} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.orange, minWidth: 100, paddingTop: 1 }}>{meta.label}</span>
                      <span style={{ fontSize: 12, color: C.text2, lineHeight: 1.5 }}>{meta.why.split('.')[0]}.</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* AI suggestions */}
          {result.suggestion_error && !result.suggestions?.length && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 14, color: C.orange, fontWeight: 600 }}>AI suggestions unavailable</p>
              <p style={{ fontSize: 12, color: C.text2, marginTop: 3 }}>{result.suggestion_error}</p>
            </div>
          )}

          {/* Intent analysis + gap — shown when Claude returns analysis */}
          {result.intent_analysis?.search_intent && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 24px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Search Intent Analysis</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div style={{ background: C.blueBg, borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Search Intent</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.text1 }}>{result.intent_analysis.search_intent}</p>
                </div>
                <div style={{ background: C.orangeBg, borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Emotional Driver</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.text1 }}>{result.intent_analysis.emotional_driver}</p>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Who's Searching</p>
                <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.55 }}>{result.intent_analysis.viewer_profile}</p>
              </div>
              {result.intent_analysis.gap_opportunity && (
                <div style={{ background: C.greenBg, border: `1px solid #bbf7d0`, borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Gap Opportunity — what competitors are NOT doing</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.text1, lineHeight: 1.55 }}>{result.intent_analysis.gap_opportunity}</p>
                  {result.intent_analysis.overused_angle && (
                    <p style={{ fontSize: 12, color: C.text3, marginTop: 6, lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700, color: C.red }}>Overused: </span>{result.intent_analysis.overused_angle}
                    </p>
                  )}
                </div>
              )}
              {result.intent_analysis.top_keywords?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Top keywords in competitor titles</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {result.intent_analysis.top_keywords.map(kw => (
                      <span key={kw} onClick={() => setTitle(kw)} style={{ fontSize: 12, color: C.blue, background: C.blueBg, padding: '3px 9px', borderRadius: 20, cursor: 'pointer', fontWeight: 500 }}>{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {result.suggestions?.length > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>AI-Suggested Titles</p>
              <p style={{ fontSize: 12, color: C.text3, marginBottom: 16 }}>
                3 psychological hooks — each built from the gap in your competitor landscape. Click to copy.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.suggestions.map((s, i) => {
                  const hookMeta = {
                    curiosity:      { label: 'Curiosity / FOMO', color: C.purple, bg: C.purpleBg, desc: 'Makes viewers feel they\'re missing something' },
                    transformation: { label: 'Transformation',   color: C.teal,   bg: C.tealBg,   desc: 'Focuses on the outcome or result' },
                    contrarian:     { label: 'Contrarian',        color: C.blue,   bg: C.blueBg,   desc: 'Challenges assumptions — what others don\'t show' },
                  }
                  const hm = hookMeta[s.hook] || hookMeta.curiosity
                  const seoColor  = s.seo_score  >= 70 ? C.green : s.seo_score  >= 50 ? C.orange : C.red
                  const ctrColor  = s.ctr_score  >= 70 ? C.green : s.ctr_score  >= 50 ? C.orange : C.red
                  const hookColor = s.hook_score >= 70 ? C.green : s.hook_score >= 50 ? C.orange : C.red
                  return (
                    <div key={i} style={{ border: `1.5px solid ${copied === i ? '#bbf7d0' : C.border}`, borderRadius: 12, overflow: 'hidden', background: copied === i ? C.greenBg : C.card }}>
                      {/* Hook header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: hm.bg, borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: hm.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{hm.label}</span>
                        <span style={{ fontSize: 12, color: C.text3 }}>{hm.desc}</span>
                      </div>
                      {/* Title + copy */}
                      <div onClick={() => copyTitle(s.title, i)} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '12px 14px', cursor: 'pointer' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: C.text1, lineHeight: 1.4 }}>{s.title}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 12, color: s.length >= 50 && s.length <= 70 ? C.green : C.orange }}>{s.length} chars</span>
                            {s.power_words_found?.length > 0 && s.power_words_found.map(w => (
                              <span key={w} style={{ fontSize: 12, fontWeight: 700, background: C.blueBg, color: C.blue, padding: '1px 6px', borderRadius: 20, textTransform: 'uppercase' }}>{w}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {s.seo_score > 0 && <div style={{ textAlign: 'center' }}><p style={{ fontSize: 14, fontWeight: 800, color: seoColor, lineHeight: 1 }}>{s.seo_score}</p><p style={{ fontSize: 12, color: C.text3 }}>SEO</p></div>}
                            {s.ctr_score > 0 && <div style={{ textAlign: 'center' }}><p style={{ fontSize: 14, fontWeight: 800, color: ctrColor, lineHeight: 1 }}>{s.ctr_score}</p><p style={{ fontSize: 12, color: C.text3 }}>CTR</p></div>}
                            {s.hook_score > 0 && <div style={{ textAlign: 'center' }}><p style={{ fontSize: 14, fontWeight: 800, color: hookColor, lineHeight: 1 }}>{s.hook_score}</p><p style={{ fontSize: 12, color: C.text3 }}>Hook</p></div>}
                          </div>
                          <span style={{ fontSize: 12, color: copied === i ? C.green : C.blue, fontWeight: 600 }}>{copied === i ? '✓ Copied' : 'Copy'}</span>
                        </div>
                      </div>
                      {/* Why it works */}
                      {s.why_it_works && (
                        <div style={{ padding: '8px 14px 12px', borderTop: `1px solid ${C.border}`, background: '#fafafc' }}>
                          <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.55 }}>
                            <span style={{ fontWeight: 700, color: hm.color }}>Why it works: </span>{s.why_it_works}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Top videos in niche */}
          {result.top_videos?.length > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Top titles matching your topic</p>
              <p style={{ fontSize: 12, color: C.text3, marginBottom: 16 }}>
                Searched YouTube for{result.primary_phrase ? <><span style={{ fontWeight: 700, color: C.text2 }}> "{result.primary_phrase}"</span> —</> : ''} your closest competitors.
                {result.intent_matched > 0 && result.intent_matched < result.videos_found
                  ? ` Filtered to ${result.intent_matched} exact-match videos.`
                  : ''}{' '}
                Score uses the same 8 criteria as your title.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {result.top_videos.map((v, i) => {
                  const sc = v.seo_score
                  const scColor = sc >= 70 ? C.green : sc >= 50 ? C.orange : C.red
                  return (
                    <div key={v.video_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < result.top_videos.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      {v.thumbnail && <img src={v.thumbnail} alt="" style={{ width: 64, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: C.text1, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.title}</p>
                        <p style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>{v.channel}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 800, color: scColor }}>{sc}</p>
                        <p style={{ fontSize: 12, color: C.text3 }}>{v.title.length}ch</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
