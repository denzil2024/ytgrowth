import { useState, useEffect, useRef } from 'react'

// Inject spin keyframe once
if (typeof document !== 'undefined' && !document.getElementById('seo-opt-styles')) {
  const s = document.createElement('style')
  s.id = 'seo-opt-styles'
  s.textContent = `
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes seoFadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
  .seo-result-section { animation: seoFadeUp 0.3s ease both; }

  .seo-glass-card {
    background: rgba(255,255,255,0.85) !important;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.98) !important;
    box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset, 0 6px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04) !important;
  }
  .seo-glass-card:hover {
    box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset, 0 14px 44px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.05) !important;
    transform: translateY(-1px);
    transition: box-shadow 0.22s, transform 0.22s;
  }
`
  document.head.appendChild(s)
}

const STORAGE_KEY = 'seoOptimizer_v1'

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveToDisk(title, result, selectedTitle, currentDesc, descResult) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ title, result, selectedTitle, currentDesc, descResult }))
  } catch {}
}

const API = ''

const C = {
  bg: '#f4f4f6',
  card: '#ffffff',
  cardHover: '#fafafa',
  border: '#e4e4e8',
  borderLight: '#f0f0f4',
  text1: '#0d0d0f',
  text2: '#3c3c44',
  text3: '#8c8c9a',
  text4: '#b8b8c8',
  red: '#e5251b',
  redBg: '#fff5f5',
  green: '#16a34a',
  greenBg: '#f0fdf4',
  greenBdr: '#86efac',
  amber: '#d97706',
  amberBg: '#fffbeb',
  blue: '#2563eb',
  blueMid: '#3b82f6',
  blueBg: '#eff6ff',
  blueBdr: '#bfdbfe',
  orange: '#ea580c',
  orangeBg: '#fff7ed',
  orangeBdr: '#fed7aa',
  purple: '#7c3aed',
  purpleBg: '#f5f3ff',
  purpleBdr: '#c4b5fd',
  teal: '#0891b2',
  tealBg: '#ecfeff',
  tealBdr: '#a5f3fc',
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

const DESC_TYPE_META = {
  story:   { color: C.purple, bg: C.purpleBg },
  value:   { color: C.teal,   bg: C.tealBg   },
  keyword: { color: C.blue,   bg: C.blueBg   },
}

function ScoreRing({ score }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = score >= 75 ? C.green : score >= 50 ? C.amber : C.red
  const trackColor = score >= 75 ? '#dcfce7' : score >= 50 ? '#fef3c7' : '#fee2e2'
  return (
    <div style={{ position: 'relative', width: 136, height: 136, flexShrink: 0 }}>
      <svg width="136" height="136" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="68" cy="68" r={r} fill="none" stroke={trackColor} strokeWidth="10" />
        <circle cx="68" cy="68" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 6px ${color}55)` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 34, fontWeight: 700, color, letterSpacing: '-2px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{score}</span>
        <span style={{ fontSize: 10, color: C.text3, fontWeight: 600, letterSpacing: '0.06em', marginTop: 2 }}>/100</span>
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
  const trackBg = pct >= 80 ? '#dcfce7' : pct >= 40 ? '#fef3c7' : '#fee2e2'
  const gradient = pct >= 80
    ? 'linear-gradient(90deg, #16a34a, #22c55e)'
    : pct >= 40
    ? 'linear-gradient(90deg, #d97706, #f59e0b)'
    : 'linear-gradient(90deg, #dc2626, #ef4444)'
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 12.5, color: C.text1, fontWeight: 600 }}>{meta.label}</span>
          <button onClick={() => setShowWhy(v => !v)}
            style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${C.text4}`, background: showWhy ? C.text3 : 'transparent', cursor: 'pointer', fontSize: 9, fontWeight: 700, color: showWhy ? '#fff' : C.text3, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1, transition: 'all 0.15s', flexShrink: 0 }}>?
          </button>
        </div>
        <span style={{ fontSize: 12, color, fontWeight: 700, background: trackBg, padding: '1px 7px', borderRadius: 20 }}>{value}/{max}</span>
      </div>
      <div style={{ height: 8, background: C.borderLight, borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: gradient, borderRadius: 6, transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: pct > 0 ? `0 1px 4px ${color}44` : 'none' }} />
      </div>
      {showWhy && (
        <p style={{ fontSize: 12, color: C.text2, marginTop: 8, lineHeight: 1.6, background: trackBg, padding: '9px 12px', borderRadius: 8, borderLeft: `3px solid ${color}` }}>
          {meta.why}
        </p>
      )}
    </div>
  )
}

function FormatTemplates({ onUse }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginBottom: 20, border: `1.5px solid ${open ? C.purpleBdr : C.border}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s', boxShadow: open ? `0 4px 20px ${C.purple}18` : 'none' }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', background: open ? C.purpleBg : '#fafafa', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: C.purple, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M6.5 1L8 5h4L8.5 7.5l1.5 4L6.5 9.5 3 11.5l1.5-4L1 5h4z"/></svg>
          </div>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.purple, display: 'block', letterSpacing: '-0.2px' }}>Viral Format Templates</span>
            <span style={{ fontSize: 11, color: C.text3, fontWeight: 400 }}>Click any template to pre-fill your title</span>
          </div>
        </div>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke={C.text3} strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s', flexShrink: 0 }}>
          <path d="M2 4.5l4.5 4.5 4.5-4.5"/>
        </svg>
      </button>
      {open && (
        <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: C.card, borderTop: `1px solid ${C.purpleBdr}` }}>
          {VIRAL_FORMATS.map(fmt => (
            <div key={fmt.key} onClick={() => onUse(fmt.example)}
              style={{ padding: '12px 14px', border: `1.5px solid ${C.border}`, borderRadius: 11, cursor: 'pointer', background: '#fafafc', transition: 'all 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.purple; e.currentTarget.style.background = C.purpleBg; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 14px ${C.purple}22` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = '#fafafc'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: C.purple, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{fmt.label}</p>
              <p style={{ fontSize: 12, color: C.text1, fontWeight: 600, lineHeight: 1.4, marginBottom: 4 }}>{fmt.example}</p>
              <p style={{ fontSize: 11, color: C.text3, lineHeight: 1.4 }}>{fmt.why}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TitlePreviewSimulator({ title }) {
  if (!title.trim()) return null
  const surfaces = [
    { label: 'Suggested feed', maxChars: 45, icon: '📱' },
    { label: 'Mobile search',  maxChars: 55, icon: '🔍' },
    { label: 'Desktop search', maxChars: 70, icon: '🖥️' },
  ]
  return (
    <div style={{ marginTop: 12, padding: '14px 16px', background: 'linear-gradient(135deg, #f8f8fc 0%, #f4f4f8 100%)', borderRadius: 12, border: `1px solid ${C.border}` }}>
      <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Preview on YouTube</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {surfaces.map(({ label, maxChars, icon }) => {
          const truncated = title.length > maxChars
          const display = truncated ? title.slice(0, maxChars - 1) + '…' : title
          return (
            <div key={label} style={{ padding: '10px 12px', background: C.card, borderRadius: 9, border: `1.5px solid ${truncated ? C.orangeBdr : C.greenBdr}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: truncated ? C.orange : C.green, background: truncated ? C.orangeBg : C.greenBg, padding: '1px 6px', borderRadius: 20 }}>
                  {truncated ? `cut` : '✓ fits'}
                </span>
              </div>
              <p style={{ fontSize: 11.5, fontWeight: 600, color: truncated ? C.text2 : C.text1, lineHeight: 1.45 }}>{display}</p>
              {truncated && <p style={{ fontSize: 10, color: C.text4, marginTop: 4 }}>{title.length - maxChars + 1} chars over</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DescriptionCard({ d, idx, copiedDesc, onCopy }) {
  const [expanded, setExpanded] = useState(false)
  const tm = DESC_TYPE_META[d.type] || DESC_TYPE_META.value
  const isCopied = copiedDesc === idx
  return (
    <div style={{ border: `1.5px solid ${isCopied ? 'rgba(134,239,172,0.7)' : 'rgba(255,255,255,0.98)'}`, borderRadius: 16, overflow: 'hidden', background: isCopied ? 'rgba(240,253,244,0.88)' : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', transition: 'all 0.2s', boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 6px 20px rgba(0,0,0,0.07)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: tm.bg, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: tm.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M2 5h6M5 2l3 3-3 3"/></svg>
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, color: tm.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d.label}</span>
        <span style={{ fontSize: 11.5, color: C.text3, fontWeight: 400 }}>{d.why_it_works}</span>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.65, background: 'linear-gradient(135deg, #f8f8fc, #f4f4f8)', padding: '10px 14px', borderRadius: 9, borderLeft: `3px solid ${tm.color}`, marginBottom: 10 }}>
          {d.preview}
        </p>
        {expanded && (
          <pre style={{ fontSize: 12.5, color: C.text1, lineHeight: 1.75, whiteSpace: 'pre-wrap', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif", background: '#fafafc', padding: '12px 14px', borderRadius: 10, marginBottom: 10, border: `1px solid ${C.border}`, boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.03)' }}>
            {d.full}
          </pre>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setExpanded(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: C.blue, background: C.blueBg, border: `1px solid ${C.blueBdr}`, borderRadius: 7, padding: '5px 11px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
            {expanded ? '↑ Collapse' : '↓ Show full'}
          </button>
          <button onClick={() => onCopy(d.full, idx)}
            style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: isCopied ? C.green : C.text2, background: isCopied ? C.greenBg : C.card, border: `1.5px solid ${isCopied ? C.greenBdr : C.border}`, borderRadius: 7, padding: '5px 14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
            {isCopied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SeoOptimizer() {
  const saved = loadSaved()
  const [title, setTitle]               = useState(saved.title  || '')
  const [result, setResult]             = useState(saved.result || null)
  const [loading, setLoading]           = useState(false)
  const [loadingIntent, setLoadingIntent] = useState(false)
  const [error, setError]               = useState('')
  const [copied, setCopied]             = useState(null)
  const [intentOptions, setIntentOptions]     = useState(null)
  const [selectedKeyword, setSelectedKeyword] = useState('')

  // Tags panel state
  const [copiedTags, setCopiedTags] = useState(false)

  // Description optimizer state
  const [selectedTitle, setSelectedTitle] = useState(saved.selectedTitle || null)
  const [currentDesc, setCurrentDesc]     = useState(saved.currentDesc || '')
  const [descLoading, setDescLoading]     = useState(false)
  const [descResult, setDescResult]       = useState(saved.descResult || null)
  const [descError, setDescError]         = useState('')
  const [copiedDesc, setCopiedDesc]       = useState(null)
  const descRef = useRef(null)

  useEffect(() => {
    if (result !== null) saveToDisk(title, result, selectedTitle, currentDesc, descResult)
    else if (!loading) saveToDisk(title, null, selectedTitle, currentDesc, descResult)
  }, [title, result, loading, selectedTitle, currentDesc, descResult])

  function handleClear() {
    localStorage.removeItem(STORAGE_KEY)
    setTitle('')
    setResult(null)
    setError('')
    setIntentOptions(null)
    setSelectedKeyword('')
    setSelectedTitle(null)
    setCurrentDesc('')
    setDescResult(null)
    setDescError('')
  }

  async function handleSubmitTitle() {
    if (!title.trim()) return
    setLoadingIntent(true)
    setError('')
    setResult(null)
    setIntentOptions(null)
    setSelectedKeyword('')
    setSelectedTitle(null)
    setDescResult(null)
    try {
      const res = await fetch(`${API}/seo/intent-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.options?.length) {
        await runAnalysis('')
        return
      }
      setIntentOptions(data.options)
    } catch {
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

  function handleSelectTitle(t) {
    setSelectedTitle(t)
    setCurrentDesc('')
    setDescResult(null)
    setDescError('')
    setTimeout(() => descRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  async function handleGenerateDesc() {
    if (!selectedTitle) return
    setDescLoading(true)
    setDescError('')
    setDescResult(null)
    try {
      const res = await fetch(`${API}/seo/generate-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedTitle,
          current_description: currentDesc.trim(),
          niche: result?.primary_phrase || '',
        }),
      })
      const data = await res.json()
      if (!res.ok) { setDescError(data.error || 'Something went wrong.'); return }
      setDescResult(data.descriptions)
    } catch {
      setDescError('Could not reach the server.')
    } finally {
      setDescLoading(false)
    }
  }

  function copyDesc(text, idx) {
    navigator.clipboard.writeText(text)
    setCopiedDesc(idx)
    setTimeout(() => setCopiedDesc(null), 1800)
  }

  const scoreLabel = result
    ? result.score >= 75 ? 'Strong' : result.score >= 50 ? 'Needs work' : 'Weak'
    : ''

  const SpinIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.93 2.93l1.41 1.41M9.66 9.66l1.41 1.41M2.93 11.07l1.41-1.41M9.66 4.34l1.41-1.41"/>
    </svg>
  )

  return (
    <div style={{ width: '100%', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><path d="M10.5 10.5l4 4"/></svg>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.8px', lineHeight: 1 }}>SEO Optimizer</h2>
          </div>
          <p style={{ fontSize: 13.5, color: C.text3, lineHeight: 1.5, maxWidth: 540 }}>
            Analyse your title against real competitor data, get 3 optimised alternatives scored by SEO + CTR + hook strength, then generate a matching description.
          </p>
        </div>
        {(title || result) && (
          <button onClick={handleClear}
            style={{ flexShrink: 0, marginLeft: 16, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: C.text3, background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text3 }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 1l9 9M10 1l-9 9"/></svg>
            Clear
          </button>
        )}
      </div>

      {/* Input card */}
      <div className="seo-glass-card" style={{ borderRadius: 20, padding: '24px 28px', marginBottom: 20 }}>

        <FormatTemplates onUse={t => setTitle(t)} />

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Your video title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmitTitle()}
            placeholder="e.g. How I grew my YouTube channel to 10k subscribers"
            style={{ width: '100%', padding: '12px 16px', fontSize: 14.5, border: `2px solid ${C.border}`, borderRadius: 12, fontFamily: 'inherit', outline: 'none', color: C.text1, background: '#fafafa', boxSizing: 'border-box', transition: 'border-color 0.18s, box-shadow 0.18s', letterSpacing: '-0.1px' }}
            onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = `0 0 0 4px ${C.blueBg}` }}
            onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
            <span style={{
              fontSize: 11.5, fontWeight: 600,
              color: title.length > 70 ? C.red : title.length >= 50 ? C.green : C.text3,
              background: title.length > 70 ? C.redBg : title.length >= 50 ? C.greenBg : 'transparent',
              padding: title.length ? '2px 8px' : '0', borderRadius: 20, transition: 'all 0.2s'
            }}>
              {title.length} chars {title.length >= 50 && title.length <= 70 ? '✓ ideal length' : title.length > 70 ? '— too long' : '— aim for 50–70'}
            </span>
          </div>
          <TitlePreviewSimulator title={title} />
        </div>

        <button onClick={handleSubmitTitle} disabled={loading || loadingIntent || !title.trim()}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: title.trim() && !loading && !loadingIntent ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#d1d1d8', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: title.trim() && !loading && !loadingIntent ? 'pointer' : 'not-allowed', transition: 'all 0.18s', boxShadow: title.trim() && !loading && !loadingIntent ? '0 4px 14px rgba(37,99,235,0.35)' : 'none', letterSpacing: '-0.1px' }}
          onMouseEnter={e => { if (!loading && !loadingIntent && title.trim()) e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.45)' }}
          onMouseLeave={e => { if (!loading && !loadingIntent && title.trim()) e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.35)' }}>
          {loadingIntent ? (
            <><SpinIcon /> Identifying search intent…</>
          ) : loading ? (
            <><SpinIcon /> Researching &amp; generating…</>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="5"/><path d="m9 9 3 3"/></svg>
              Analyse &amp; suggest titles
            </>
          )}
        </button>

        {error && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.red, background: C.redBg, border: `1px solid #fecaca`, borderRadius: 9, padding: '9px 13px' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="6.5" cy="6.5" r="5"/><path d="M6.5 4v3M6.5 9v.5"/></svg>
            {error}
          </div>
        )}
      </div>

      {/* Intent picker */}
      {intentOptions && !loading && !result && (
        <div style={{ background: 'rgba(239,246,255,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '2px solid rgba(147,197,253,0.7)', borderRadius: 20, padding: '24px 28px', marginBottom: 20, boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 6px 24px rgba(37,99,235,0.08), 0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: C.blueBg, border: `1px solid ${C.blueBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><circle cx="6.5" cy="4" r="2.5"/><path d="M1 12c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 800, color: C.text1, letterSpacing: '-0.3px' }}>What's this video really about?</p>
          </div>
          <p style={{ fontSize: 13, color: C.text3, marginBottom: 18, paddingLeft: 40 }}>
            Same words, different niches. Pick the closest match so we search the right audience.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {intentOptions.map((opt, i) => (
              <div key={i} onClick={() => handleSelectIntent(opt.keyword)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', border: `1.5px solid ${C.border}`, borderRadius: 13, cursor: 'pointer', background: '#fafafa', transition: 'all 0.18s', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.background = C.blueBg; e.currentTarget.style.transform = 'translateX(2px)'; e.currentTarget.style.boxShadow = `0 4px 16px rgba(37,99,235,0.12)` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text1, letterSpacing: '-0.2px' }}>{opt.label}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: C.blue, background: C.blueBg, border: `1px solid ${C.blueBdr}`, padding: '2px 8px', borderRadius: 20 }}>{opt.keyword}</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: C.text3, lineHeight: 1.45 }}>{opt.description}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={C.text4} strokeWidth="2" strokeLinecap="round"><path d="M6 3l5 5-5 5"/></svg>
              </div>
            ))}
          </div>
          <button onClick={() => runAnalysis('')}
            style={{ marginTop: 14, fontSize: 12, fontWeight: 500, color: C.text3, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            None of these — let the AI decide
          </button>
        </div>
      )}

      {result && (
        <div className="seo-result-section">
          {/* Score + Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

            <div className="seo-glass-card" style={{ borderRadius: 20, padding: '24px 26px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 }}>SEO Score</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
                <ScoreRing score={result.score} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.7px', marginBottom: 5 }}>{scoreLabel}</p>
                  <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>
                    {result.score >= 75 ? 'Well optimised. Small tweaks can push it further.'
                      : result.score >= 50 ? 'Decent — the 3 AI titles below fix your gaps.'
                      : 'Needs work. The AI titles below address every gap.'}
                  </p>
                  {result.primary_phrase && (
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: C.text3, fontWeight: 500 }}>Niche:</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.blue, background: C.blueBg, border: `1px solid ${C.blueBdr}`, padding: '2px 10px', borderRadius: 20 }}>
                        {result.primary_phrase}
                      </span>
                      {result.videos_found > 0 && (
                        <span style={{ fontSize: 11.5, color: C.green, fontWeight: 600, background: C.greenBg, padding: '2px 8px', borderRadius: 20 }}>
                          {result.videos_found} videos
                        </span>
                      )}
                      {result.intent_matched > 0 && result.intent_matched < result.videos_found && (
                        <span style={{ fontSize: 11.5, color: C.blue, fontWeight: 600, background: C.blueBg, padding: '2px 8px', borderRadius: 20 }}>
                          {result.intent_matched} exact
                        </span>
                      )}
                    </div>
                  )}
                  {result.viral_format_detected && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 10.5, fontWeight: 700, background: C.purpleBg, color: C.purple, border: `1px solid ${C.purpleBdr}`, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4.5 1L5.5 3.5h2.5L6 5l1 3-2.5-1.5L2 8l1-3-2-1.5H3.5z"/></svg>
                      {VIRAL_FORMAT_LABELS[result.viral_format_detected]}
                    </div>
                  )}
                  {result.power_words_found?.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {result.power_words_found.map(w => (
                        <span key={w} style={{ fontSize: 10, fontWeight: 700, background: C.blueBg, color: C.blue, border: `1px solid ${C.blueBdr}`, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{w}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="seo-glass-card" style={{ borderRadius: 20, padding: '24px 26px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 }}>Score Breakdown</p>
              {Object.entries(BREAKDOWN_META).map(([key]) => (
                <BreakdownBar key={key} criterionKey={key} value={result.breakdown[key] ?? 0} max={BREAKDOWN_META[key].max} />
              ))}
            </div>
          </div>

          {/* Keyword Research */}
          {result.keyword_scores?.length > 0 && (
            <div className="seo-glass-card" style={{ borderRadius: 20, padding: '22px 26px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Keyword Research</p>
                  <p style={{ fontSize: 11.5, color: C.text3 }}>
                    Volume = search demand (from YouTube autocomplete) &nbsp;·&nbsp;
                    Competition = how many top videos already target it &nbsp;·&nbsp;
                    Score = opportunity (high volume + low competition)
                  </p>
                </div>
              </div>

              <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 55px', gap: 8, padding: '8px 14px', background: 'linear-gradient(135deg, #f8f8fc, #f4f4f8)', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Keyword phrase</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Volume</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Competition</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Score</span>
                </div>
                {result.keyword_scores.map((kw, i) => {
                  const volColor = kw.volume === 'HIGH' ? C.green : kw.volume === 'MED' ? C.amber : C.text3
                  const volBg = kw.volume === 'HIGH' ? C.greenBg : kw.volume === 'MED' ? C.amberBg : 'transparent'
                  const compColor = kw.competition === 'LOW' ? C.green : kw.competition === 'MED' ? C.amber : C.red
                  const compBg = kw.competition === 'LOW' ? C.greenBg : kw.competition === 'MED' ? C.amberBg : C.redBg
                  const scColor = kw.score >= 65 ? C.green : kw.score >= 40 ? C.amber : C.red
                  return (
                    <div key={kw.phrase} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 55px', gap: 8, padding: '10px 14px', borderBottom: i < result.keyword_scores.length - 1 ? `1px solid ${C.borderLight}` : 'none', background: i % 2 === 0 ? '#fff' : '#fafafa', transition: 'background 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = C.blueBg}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text1 }}>{kw.phrase}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: volColor, background: volBg, padding: '2px 8px', borderRadius: 20, display: 'inline-block' }}>{kw.volume}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: compColor, background: compBg, padding: '2px 8px', borderRadius: 20, display: 'inline-block' }}>{kw.competition}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: scColor }}>{kw.score}</span>
                    </div>
                  )
                })}
              </div>

              {result.autocomplete_terms?.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: C.text2, marginBottom: 7 }}>
                    YouTube autocomplete
                    <span style={{ fontWeight: 400, color: C.text3, marginLeft: 6 }}>— real search queries (click any to set as title)</span>
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {result.autocomplete_terms.map(t => (
                      <span key={t} onClick={() => setTitle(t)}
                        style={{ fontSize: 11.5, color: C.blue, background: C.blueBg, padding: '3px 9px', borderRadius: 20, cursor: 'pointer', fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Suggested Tags */}
          {result.top_tags?.length > 0 && (
            <div className="seo-glass-card" style={{ borderRadius: 20, padding: '22px 26px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Suggested Tags</p>
                  <p style={{ fontSize: 13, color: C.text3 }}>
                    Pulled from competitor videos in your niche — add these directly to your video tags.
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.top_tags.join(', '))
                    setCopiedTags(true)
                    setTimeout(() => setCopiedTags(false), 1800)
                  }}
                  style={{ flexShrink: 0, marginLeft: 16, fontSize: 12, fontWeight: 700, color: copiedTags ? C.green : C.blue, background: copiedTags ? C.greenBg : C.blueBg, border: `1.5px solid ${copiedTags ? C.greenBdr : C.blueBdr}`, borderRadius: 9, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                  {copiedTags ? '✓ Copied all' : 'Copy all'}
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {result.top_tags.map(tag => {
                  const inTitle = title.toLowerCase().includes(tag.toLowerCase())
                  return (
                    <span key={tag}
                      onClick={() => { navigator.clipboard.writeText(tag) }}
                      title="Click to copy"
                      style={{ fontSize: 12.5, color: inTitle ? C.blue : C.text2, background: inTitle ? C.blueBg : '#f2f2f6', padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${inTitle ? C.blueBdr : C.border}`, cursor: 'pointer', fontWeight: inTitle ? 700 : 400, transition: 'all 0.15s', boxShadow: inTitle ? `0 2px 8px rgba(37,99,235,0.12)` : 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = inTitle ? `0 2px 8px rgba(37,99,235,0.12)` : 'none' }}>
                      {tag}
                    </span>
                  )
                })}
              </div>
              <p style={{ fontSize: 11.5, color: C.text4, marginTop: 12 }}>
                Blue-highlighted tags already appear in your title. Click any to copy individually.
              </p>
            </div>
          )}

          {/* Fix These First */}
          {(() => {
            const fixes = Object.entries(BREAKDOWN_META).filter(([k]) => (result.breakdown[k] ?? 0) === 0)
            if (!fixes.length) return null
            return (
              <div style={{ background: 'linear-gradient(135deg, #fffbeb, #fff7ed)', border: `1.5px solid ${C.orangeBdr}`, borderRadius: 16, padding: '18px 22px', marginBottom: 16, boxShadow: `0 2px 12px rgba(234,88,12,0.08)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M5.5 1v4M5.5 8v.5"/><circle cx="5.5" cy="5.5" r="4.5"/></svg>
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gaps the AI titles fix</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {fixes.map(([key, meta]) => (
                    <div key={key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 10px', background: 'rgba(255,255,255,0.6)', borderRadius: 9 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.orange, minWidth: 110, paddingTop: 1, flexShrink: 0 }}>{meta.label}</span>
                      <span style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.5 }}>{meta.why.split('.')[0]}.</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* AI suggestion error */}
          {result.suggestion_error && !result.suggestions?.length && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: C.orange, fontWeight: 600 }}>AI suggestions unavailable</p>
              <p style={{ fontSize: 12, color: C.text2, marginTop: 3 }}>{result.suggestion_error}</p>
            </div>
          )}

          {/* Intent analysis + gap */}
          {result.intent_analysis?.search_intent && (
            <div className="seo-glass-card" style={{ borderRadius: 20, padding: '22px 26px', marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Search Intent Analysis</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div style={{ background: C.blueBg, borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Search Intent</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text1 }}>{result.intent_analysis.search_intent}</p>
                </div>
                <div style={{ background: C.orangeBg, borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Emotional Driver</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text1 }}>{result.intent_analysis.emotional_driver}</p>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Who's Searching</p>
                <p style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.55 }}>{result.intent_analysis.viewer_profile}</p>
              </div>
              {result.intent_analysis.gap_opportunity && (
                <div style={{ background: C.greenBg, border: `1px solid #bbf7d0`, borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Gap Opportunity — what competitors are NOT doing</p>
                  <p style={{ fontSize: 12.5, fontWeight: 600, color: C.text1, lineHeight: 1.55 }}>{result.intent_analysis.gap_opportunity}</p>
                  {result.intent_analysis.overused_angle && (
                    <p style={{ fontSize: 11.5, color: C.text3, marginTop: 6, lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700, color: C.red }}>Overused: </span>{result.intent_analysis.overused_angle}
                    </p>
                  )}
                </div>
              )}
              {result.intent_analysis.top_keywords?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Top keywords in competitor titles</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {result.intent_analysis.top_keywords.map(kw => (
                      <span key={kw} onClick={() => setTitle(kw)} style={{ fontSize: 11.5, color: C.blue, background: C.blueBg, padding: '3px 9px', borderRadius: 20, cursor: 'pointer', fontWeight: 500 }}>{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI-Suggested Titles */}
          {result.suggestions?.length > 0 && (
            <div className="seo-glass-card" style={{ borderRadius: 20, padding: '24px 26px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>AI-Suggested Titles</p>
                  <p style={{ fontSize: 13.5, color: C.text2, fontWeight: 600, letterSpacing: '-0.2px' }}>
                    3 psychological hooks — pick one to continue to description optimisation.
                  </p>
                </div>
                <button onClick={() => handleSelectTitle(title.trim())}
                  style={{ flexShrink: 0, marginLeft: 16, fontSize: 12, fontWeight: 600, color: C.text2, background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 9, padding: '6px 13px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text2 }}>
                  Use my original title →
                </button>
              </div>
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
                  const isSelected = selectedTitle === s.title
                  return (
                    <div key={i} style={{ border: `2px solid ${isSelected ? C.blue : copied === i ? C.greenBdr : C.border}`, borderRadius: 16, overflow: 'hidden', background: isSelected ? '#f8fbff' : copied === i ? C.greenBg : C.card, transition: 'all 0.2s', boxShadow: isSelected ? `0 4px 20px rgba(37,99,235,0.12)` : '0 2px 8px rgba(0,0,0,0.04)' }}>
                      {/* Hook header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: hm.bg, borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ width: 20, height: 20, borderRadius: 6, background: hm.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M4.5 1L5.5 3.5h2.5L6 5l1 3-2.5-1.5L2 8l1-3-2-1.5H3.5z"/></svg>
                        </div>
                        <span style={{ fontSize: 10.5, fontWeight: 800, color: hm.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{hm.label}</span>
                        <span style={{ fontSize: 11.5, color: C.text3, fontWeight: 400 }}>{hm.desc}</span>
                      </div>
                      {/* Title + scores */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '14px 18px' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 15, fontWeight: 700, color: C.text1, lineHeight: 1.45, letterSpacing: '-0.3px' }}>{s.title}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11.5, fontWeight: 600, color: s.length >= 50 && s.length <= 70 ? C.green : C.amber, background: s.length >= 50 && s.length <= 70 ? C.greenBg : C.amberBg, padding: '2px 8px', borderRadius: 20 }}>{s.length} chars</span>
                            {s.power_words_found?.length > 0 && s.power_words_found.map(w => (
                              <span key={w} style={{ fontSize: 10, fontWeight: 700, background: C.blueBg, color: C.blue, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{w}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                          {s.seo_score > 0 && <div style={{ textAlign: 'center', padding: '6px 10px', background: C.bg, borderRadius: 10 }}><p style={{ fontSize: 16, fontWeight: 800, color: seoColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.seo_score}</p><p style={{ fontSize: 9.5, color: C.text3, fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>SEO</p></div>}
                          {s.ctr_score > 0 && <div style={{ textAlign: 'center', padding: '6px 10px', background: C.bg, borderRadius: 10 }}><p style={{ fontSize: 16, fontWeight: 800, color: ctrColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.ctr_score}</p><p style={{ fontSize: 9.5, color: C.text3, fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>CTR</p></div>}
                          {s.hook_score > 0 && <div style={{ textAlign: 'center', padding: '6px 10px', background: C.bg, borderRadius: 10 }}><p style={{ fontSize: 16, fontWeight: 800, color: hookColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.hook_score}</p><p style={{ fontSize: 9.5, color: C.text3, fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Hook</p></div>}
                        </div>
                      </div>
                      {/* Why it works */}
                      {s.why_it_works && (
                        <div style={{ padding: '10px 18px', borderTop: `1px solid ${C.borderLight}`, background: 'linear-gradient(135deg, #fafafa, #f6f6fa)' }}>
                          <p style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.6 }}>
                            <span style={{ fontWeight: 700, color: hm.color }}>Why it works: </span>{s.why_it_works}
                          </p>
                        </div>
                      )}
                      {/* Action row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderTop: `1px solid ${C.border}`, background: isSelected ? C.blueBg : '#f8f8fa' }}>
                        <button onClick={() => copyTitle(s.title, i)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: copied === i ? C.green : C.text3, background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                          {copied === i ? '✓ Copied' : 'Copy'}
                        </button>
                        <button onClick={() => handleSelectTitle(s.title)}
                          style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: isSelected ? C.blue : '#fff', background: isSelected ? C.blueBg : 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: `2px solid ${C.blue}`, borderRadius: 9, padding: '6px 16px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s', boxShadow: isSelected ? 'none' : '0 3px 10px rgba(37,99,235,0.3)' }}>
                          {isSelected ? '✓ Selected' : 'Use this title →'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Top videos in niche */}
          {result.top_videos?.length > 0 && (
            <div className="seo-glass-card" style={{ borderRadius: 20, padding: '22px 26px', marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Top titles matching your topic</p>
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
                  const scColor = sc >= 70 ? C.green : sc >= 50 ? C.amber : C.red
                  return (
                    <a key={v.video_id}
                      href={`https://www.youtube.com/watch?v=${v.video_id}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderBottom: i < result.top_videos.length - 1 ? `1px solid ${C.border}` : 'none', textDecoration: 'none', borderRadius: 8, transition: 'background 0.15s, transform 0.15s', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.bg; e.currentTarget.style.transform = 'translateX(2px)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none' }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        {v.thumbnail && <img src={v.thumbnail} alt="" style={{ width: 72, height: 40, borderRadius: 7, objectFit: 'cover', display: 'block' }} />}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s', background: 'rgba(0,0,0,0.45)', borderRadius: 7 }}
                          onMouseEnter={e => { e.currentTarget.style.opacity = 1 }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = 0 }}>
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="white"><path d="M7 5.5l6 3.5-6 3.5V5.5z"/></svg>
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.text1, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.title}</p>
                        <p style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{v.channel}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: scColor }}>{sc}</p>
                        <p style={{ fontSize: 10, color: C.text3 }}>{v.title.length}ch</p>
                      </div>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke={C.text4} strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M2 11L10 3M10 3H5M10 3v5"/></svg>
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Description Optimizer ──────────────────────────── */}
          {selectedTitle && (
            <div ref={descRef} className="seo-glass-card" style={{ marginTop: 8, border: '2px solid rgba(147,197,253,0.7) !important', borderRadius: 20, padding: '26px 28px' }}>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(37,99,235,0.3)' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M1 10V8l4-4 2 2-4 4H1zM7 4l2-2 2 2-2 2-2-2z"/></svg>
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 800, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Description Optimizer</p>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: C.text1, lineHeight: 1.4, letterSpacing: '-0.3px' }}>"{selectedTitle}"</p>
                </div>
                <button onClick={() => { setSelectedTitle(null); setDescResult(null); setDescError('') }}
                  style={{ flexShrink: 0, marginLeft: 16, fontSize: 12, fontWeight: 600, color: C.text3, background: 'rgba(255,255,255,0.8)', border: `1px solid ${C.border}`, borderRadius: 9, padding: '6px 13px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', backdropFilter: 'blur(8px)' }}>
                  Change title
                </button>
              </div>

              {!descResult && (
                <>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                      Current description{' '}
                      <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: C.text3 }}>(optional — paste to improve it, or leave blank for fresh generation)</span>
                    </label>
                    <textarea value={currentDesc} onChange={e => setCurrentDesc(e.target.value)}
                      placeholder="Paste your existing description here…"
                      rows={4}
                      style={{ width: '100%', padding: '12px 16px', fontSize: 13.5, border: `2px solid ${C.border}`, borderRadius: 12, fontFamily: 'inherit', outline: 'none', color: C.text1, background: 'rgba(255,255,255,0.85)', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.65, transition: 'border-color 0.18s, box-shadow 0.18s' }}
                      onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = `0 0 0 4px ${C.blueBg}` }}
                      onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none' }}
                    />
                  </div>

                  <button onClick={handleGenerateDesc} disabled={descLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: !descLoading ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : '#d1d1d8', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: !descLoading ? 'pointer' : 'not-allowed', transition: 'all 0.18s', boxShadow: !descLoading ? '0 4px 16px rgba(37,99,235,0.35)' : 'none', letterSpacing: '-0.1px' }}>
                    {descLoading ? (
                      <><SpinIcon /> Generating descriptions…</>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 1l1.5 4.5H13l-3.7 2.7 1.4 4.3L7 10 3.3 12.5l1.4-4.3L1 5.5h4.5z"/>
                        </svg>
                        Generate 3 descriptions
                      </>
                    )}
                  </button>

                  {descError && (
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.red, background: C.redBg, border: `1px solid #fecaca`, borderRadius: 9, padding: '9px 13px' }}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="6.5" cy="6.5" r="5"/><path d="M6.5 4v3M6.5 9v.5"/></svg>
                      {descError}
                    </div>
                  )}
                </>
              )}

              {descResult?.length > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>
                      3 descriptions — each opens with a different hook strategy. Expand to see the full text, then copy.
                    </p>
                    <button onClick={() => { setDescResult(null); setDescError('') }}
                      style={{ flexShrink: 0, marginLeft: 14, fontSize: 12, fontWeight: 600, color: C.blue, background: C.blueBg, border: `1.5px solid ${C.blueBdr}`, borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                      Regenerate
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {descResult.map((d, i) => (
                      <DescriptionCard key={i} d={d} idx={i} copiedDesc={copiedDesc} onCopy={copyDesc} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
