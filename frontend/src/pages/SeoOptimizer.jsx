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
    background: #ffffff;
    border: 1px solid rgba(10,10,15,0.08) !important;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06) !important;
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

// Palette matched to Dashboard.jsx exactly — red + green + amber + neutrals, no blue/purple/teal.
const C = {
  bg: '#f5f5f9',
  card: '#ffffff',
  cardHover: '#fafafb',
  border: '#e6e6ec',
  borderLight: '#f0f0f4',
  text1: '#0f0f13',
  text2: '#4a4a58',
  text3: '#9595a4',
  text4: '#b8b8c8',
  red: '#e5251b',
  redBg: '#fff5f5',
  redBdr: '#fecaca',
  green: '#059669',
  greenBg: '#ecfdf5',
  greenBdr: '#a7f3d0',
  amber: '#d97706',
  amberBg: '#fffbeb',
  amberBdr: '#fde68a',
  // Kept as aliases so existing `C.blue` / `C.orange` / etc. references still resolve,
  // but mapped onto the sanctioned Dashboard palette.
  blue: '#4a4a58',
  blueMid: '#4a4a58',
  blueBg: '#f1f1f6',
  blueBdr: '#e6e6ec',
  orange: '#d97706',
  orangeBg: '#fffbeb',
  orangeBdr: '#fde68a',
  purple: '#e5251b',
  purpleBg: '#fff5f5',
  purpleBdr: '#fecaca',
  teal: '#059669',
  tealBg: '#ecfdf5',
  tealBdr: '#a7f3d0',
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
  search: { label: 'Search', color: C.green, bg: C.greenBg, desc: 'Keyword-optimised to rank in YouTube search' },
  browse: { label: 'Browse', color: C.amber, bg: C.amberBg, desc: 'Emotional hook for homepage & suggested feed' },
  hybrid: { label: 'Hybrid', color: C.red,   bg: C.redBg,   desc: 'Keywords + emotion — ranks and gets clicked' },
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
  story:   { color: '#e5251b', bg: 'rgba(229,37,27,0.05)', bdr: 'rgba(229,37,27,0.14)' },
  value:   { color: '#059669', bg: 'rgba(5,150,105,0.05)',  bdr: 'rgba(5,150,105,0.16)'  },
  keyword: { color: '#d97706', bg: 'rgba(217,119,6,0.05)',  bdr: 'rgba(217,119,6,0.16)'  },
}

function ScoreRing({ score }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = score >= 75 ? C.green : score >= 50 ? C.amber : C.red
  const trackColor = score >= 75 ? '#dcfce7' : score >= 50 ? '#fef3c7' : '#fee2e2'
  return (
    <div style={{ position: 'relative', width: 108, height: 108, flexShrink: 0 }}>
      <svg width="108" height="108" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="54" cy="54" r={r} fill="none" stroke={trackColor} strokeWidth="8" />
        <circle cx="54" cy="54" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: '-1px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{score}</span>
        <span style={{ fontSize: 12, color: C.text3, fontWeight: 600, letterSpacing: '0.06em', marginTop: 2 }}>/100</span>
      </div>
    </div>
  )
}

function BreakdownBar({ criterionKey, value, max }) {
  const [showWhy, setShowWhy] = useState(false)
  const meta = BREAKDOWN_META[criterionKey]
  if (!meta) return null
  const pct = Math.round((value / max) * 100)
  const color = pct >= 80 ? '#059669' : pct >= 40 ? '#d97706' : '#e5251b'
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: '#6b7280', flexShrink: 0, width: 36, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{max}pt</span>
        <span style={{ fontSize: 13, color: '#3c3c44', fontWeight: 400, flexShrink: 0, width: 148, display: 'flex', alignItems: 'center', gap: 6 }}>
          {meta.label}
          <button onClick={() => setShowWhy(v => !v)} aria-label="Why this matters"
            style={{ width: 13, height: 13, borderRadius: '50%', border: 'none', background: showWhy ? '#6b7280' : '#f0f0f4', cursor: 'pointer', fontSize: 9, fontWeight: 700, color: showWhy ? '#fff' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1, transition: 'all 0.15s', flexShrink: 0 }}>?
          </button>
        </span>
        <div style={{ flex: 1, height: 4, background: '#eeeef3', borderRadius: 99, overflow: 'hidden', minWidth: 0 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)' }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', minWidth: 26, textAlign: 'right' }}>{value}</span>
      </div>
      {showWhy && (
        <p style={{ fontSize: 12, color: '#52525b', marginTop: 8, marginLeft: 46, lineHeight: 1.55, background: '#fafafb', padding: '8px 11px', borderRadius: 7, borderLeft: `2px solid ${color}` }}>
          {meta.why}
        </p>
      )}
    </div>
  )
}

function FormatTemplates({ onUse }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginBottom: 14, border: '1px solid rgba(10,10,15,0.08)', borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.2s' }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: open ? '#fafafa' : '#ffffff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text1, letterSpacing: '-0.2px' }}>Viral format templates</span>
          <span style={{ fontSize: 12, color: C.text3, fontWeight: 400 }}>Click any template to pre-fill your title</span>
        </div>
        <svg width="12" height="12" viewBox="0 0 13 13" fill="none" stroke={C.text3} strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s', flexShrink: 0 }}>
          <path d="M2 4.5l4.5 4.5 4.5-4.5"/>
        </svg>
      </button>
      {open && (
        <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#fafafb', borderTop: '1px solid rgba(10,10,15,0.06)' }}>
          {VIRAL_FORMATS.map(fmt => (
            <div key={fmt.key} onClick={() => onUse(fmt.example)}
              style={{ padding: '10px 12px', border: '1px solid rgba(10,10,15,0.08)', borderRadius: 8, cursor: 'pointer', background: '#ffffff', transition: 'all 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(229,37,27,0.35)'; e.currentTarget.style.background = '#fffafa' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(10,10,15,0.08)'; e.currentTarget.style.background = '#ffffff' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{fmt.label}</p>
              <p style={{ fontSize: 12, color: C.text1, fontWeight: 600, lineHeight: 1.4, marginBottom: 3 }}>{fmt.example}</p>
              <p style={{ fontSize: 12, color: C.text3, lineHeight: 1.4 }}>{fmt.why}</p>
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
    <div style={{ marginTop: 12, padding: '12px 14px', background: '#fafafb', borderRadius: 10, border: '1px solid rgba(10,10,15,0.06)' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Preview on YouTube</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {surfaces.map(({ label, maxChars, icon }) => {
          const truncated = title.length > maxChars
          const display = truncated ? title.slice(0, maxChars - 1) + '…' : title
          return (
            <div key={label} style={{ padding: '10px 12px', background: '#ffffff', borderRadius: 8, border: `1px solid ${truncated ? C.orangeBdr : 'rgba(10,10,15,0.08)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: truncated ? C.orange : C.green }}>
                  {truncated ? 'cut' : 'fits'}
                </span>
              </div>
              <p style={{ fontSize: 12, fontWeight: 600, color: truncated ? C.text2 : C.text1, lineHeight: 1.45 }}>{display}</p>
              {truncated && <p style={{ fontSize: 11, color: C.text4, marginTop: 4 }}>{title.length - maxChars + 1} chars over</p>}
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
    <div style={{ border: `1px solid ${isCopied ? 'rgba(5,150,105,0.38)' : '#e6e6ec'}`, borderRadius: 12, overflow: 'hidden', background: isCopied ? 'rgba(5,150,105,0.04)' : '#ffffff', transition: 'all 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: tm.bg, borderBottom: `1px solid ${tm.bdr || '#f0f0f4'}` }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: tm.color, flexShrink: 0 }} />
        <span style={{ fontSize: 10.5, fontWeight: 700, color: tm.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d.label}</span>
        <span style={{ fontSize: 11.5, color: C.text3, fontWeight: 400 }}>{d.why_it_works}</span>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <p style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.65, background: '#fafafb', padding: '10px 14px', borderRadius: 8, borderLeft: `3px solid ${tm.color}`, marginBottom: 10 }}>
          {d.preview}
        </p>
        {expanded && (
          <pre style={{ fontSize: 12, color: C.text1, lineHeight: 1.75, whiteSpace: 'pre-wrap', fontFamily: "'Inter', system-ui, sans-serif", background: '#fafafb', padding: '12px 14px', borderRadius: 8, marginBottom: 10, border: '1px solid #e6e6ec' }}>
            {d.full}
          </pre>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setExpanded(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: C.text2, background: '#ffffff', border: '1px solid #e6e6ec', borderRadius: 100, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
            {expanded ? '↑ Collapse' : '↓ Show full'}
          </button>
          <button onClick={() => onCopy(d.full, idx)}
            style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: isCopied ? C.green : C.text2, background: '#ffffff', border: `1px solid ${isCopied ? 'rgba(5,150,105,0.38)' : '#e6e6ec'}`, borderRadius: 100, padding: '5px 14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
            {isCopied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SeoOptimizer({ onNavigate }) {
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
  const descRef      = useRef(null)
  const titleInputRef = useRef(null)
  const [prefillBanner, setPrefillBanner] = useState(false)

  // Pre-fill title from Video Ideas tab via localStorage
  useEffect(() => {
    try {
      const prefill = localStorage.getItem('ytg_prefill_title')
      if (prefill) {
        localStorage.removeItem('ytg_prefill_title')
        setTitle(prefill)
        setPrefillBanner(true)
        setTimeout(() => titleInputRef.current?.focus(), 80)
        setTimeout(() => setPrefillBanner(false), 5000)
      }
    } catch {}
  }, [])

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
      const res = await fetch(
        `${API}/seo/generate-description`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: selectedTitle,
            current_description:
              currentDesc.trim(),
            niche:
              result?.primary_phrase || '',
            intent_analysis:
              result?.intent_analysis || null,
            keyword_scores:
              result?.keyword_scores || null,
            current_year: 2026,
          }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        setDescError(
          data.error || 'Generation failed.'
        )
        return
      }
      setDescResult(data.descriptions)
    } catch {
      setDescError(
        'Could not reach the server.'
      )
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
    <div style={{ width: '100%', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(229,37,27,0.09)', border: '1px solid rgba(229,37,27,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#e5251b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="6"/><path d="m15 15 4 4"/></svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111114', letterSpacing: '-0.5px', marginBottom: 2, lineHeight: 1.1 }}>SEO Optimizer</h2>
            <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.3 }}>Analyse your title against competitor data. Get 3 scored alternatives plus a matching description.</p>
          </div>
        </div>
        {(title || result) && (
          <button onClick={handleClear}
            style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: C.text2, background: '#ffffff', border: '1px solid #e6e6ec', borderRadius: 100, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)'; e.currentTarget.style.color = '#111114' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e6e6ec'; e.currentTarget.style.color = C.text2 }}>
            Clear
          </button>
        )}
      </div>

      {/* Input card */}
      <div className="seo-glass-card" style={{ borderRadius: 16, padding: '18px 20px', marginBottom: 12 }}>

        <FormatTemplates onUse={t => setTitle(t)} />

        <div style={{ marginBottom: 16 }}>
          {prefillBanner && (
            <div style={{
              fontSize: 12, fontWeight: 600, color: C.blue,
              background: 'rgba(10,10,15,0.04)', border: '1px solid rgba(10,10,15,0.10)',
              borderRadius: 8, padding: '6px 12px', marginBottom: 10,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="6" cy="6" r="5"/><path d="M6 4v3M6 8.5v.5"/></svg>
              Title pre-filled from Video Ideas
            </div>
          )}
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Your video title</label>
          <input ref={titleInputRef} value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmitTitle()}
            placeholder="e.g. How I grew my YouTube channel to 10k subscribers"
            style={{ width: '100%', padding: '11px 18px', fontSize: 14, border: '1px solid #e6e6ec', borderRadius: 100, fontFamily: 'inherit', outline: 'none', color: C.text1, background: '#ffffff', boxSizing: 'border-box', transition: 'border-color 0.18s, box-shadow 0.18s', letterSpacing: '-0.1px' }}
            onFocus={e => { e.target.style.borderColor = 'rgba(0,0,0,0.25)'; e.target.style.boxShadow = '0 0 0 4px rgba(0,0,0,0.04)' }}
            onBlur={e => { e.target.style.borderColor = '#e6e6ec'; e.target.style.boxShadow = 'none' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: title.length > 70 ? C.red : title.length >= 50 ? C.green : C.text3,
            }}>
              {title.length} chars {title.length >= 50 && title.length <= 70 ? '· ideal length' : title.length > 70 ? '· too long' : '· aim for 50–70'}
            </span>
          </div>
          <TitlePreviewSimulator title={title} />
        </div>

        <button onClick={handleSubmitTitle} disabled={loading || loadingIntent || !title.trim()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', background: title.trim() && !loading && !loadingIntent ? '#e5251b' : '#e0e0e6', color: '#fff', border: 'none', borderRadius: 100, fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit', cursor: title.trim() && !loading && !loadingIntent ? 'pointer' : 'not-allowed', transition: 'all 0.18s', boxShadow: title.trim() && !loading && !loadingIntent ? '0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32)' : 'none', letterSpacing: '-0.1px' }}
          onMouseEnter={e => { if (!loading && !loadingIntent && title.trim()) { e.currentTarget.style.filter = 'brightness(1.07)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,37,27,0.42)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
          onMouseLeave={e => { if (!loading && !loadingIntent && title.trim()) { e.currentTarget.style.filter = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32)'; e.currentTarget.style.transform = '' } }}>
          {loadingIntent ? (
            <><SpinIcon /> Identifying search intent…</>
          ) : loading ? (
            <><SpinIcon /> Researching &amp; generating…</>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="5"/><path d="m9 9 3 3"/></svg>
              Analyse &amp; suggest titles
            </>
          )}
        </button>

        {error && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.red, background: 'rgba(229,37,27,0.06)', border: '1px solid rgba(229,37,27,0.18)', borderRadius: 9, padding: '9px 13px' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="6.5" cy="6.5" r="5"/><path d="M6.5 4v3M6.5 9v.5"/></svg>
            {error}
          </div>
        )}
      </div>

      {/* Intent picker */}
      {intentOptions && !loading && !result && (
        <div className="seo-glass-card" style={{ borderRadius: 16, padding: '18px 20px', marginBottom: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, letterSpacing: '-0.2px', marginBottom: 3 }}>What's this video really about?</p>
          <p style={{ fontSize: 12.5, color: C.text3, marginBottom: 14, lineHeight: 1.5 }}>
            Same words, different niches. Pick the closest match so we search the right audience.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {intentOptions.map((opt, i) => (
              <div key={i} onClick={() => handleSelectIntent(opt.keyword)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', border: '1px solid #e6e6ec', borderRadius: 10, cursor: 'pointer', background: '#ffffff', transition: 'all 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(229,37,27,0.35)'; e.currentTarget.style.background = '#fffafa' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e6e6ec'; e.currentTarget.style.background = '#ffffff' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text1, letterSpacing: '-0.2px' }}>{opt.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.text3, background: '#f4f4f6', padding: '2px 8px', borderRadius: 6, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{opt.keyword}</span>
                  </div>
                  <p style={{ fontSize: 12, color: C.text3, lineHeight: 1.45 }}>{opt.description}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={C.text4} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M6 3l5 5-5 5"/></svg>
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
          {/* SEO Score — full-width narrative card */}
          <div className="seo-glass-card" style={{ borderRadius: 16, padding: '20px 24px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
              <ScoreRing score={result.score} />
              <div style={{ flex: 1, minWidth: 240 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>SEO score</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4, lineHeight: 1.1 }}>{scoreLabel}</p>
                <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.5 }}>
                  {result.score >= 75 ? 'Well optimised. Small tweaks can push it further.'
                    : result.score >= 50 ? 'Decent — AI titles below fix your gaps.'
                    : 'Needs work. AI titles below address every gap.'}
                </p>
              </div>
              {result.primary_phrase && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 22, borderLeft: '1px solid #f0f0f4', minWidth: 200 }}>
                  <span style={{ fontSize: 10.5, color: C.text3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Niche</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text1 }}>{result.primary_phrase}</span>
                  {result.videos_found > 0 && (
                    <span style={{ fontSize: 11.5, color: C.text3, fontWeight: 500 }}>
                      {result.videos_found} videos analysed{result.intent_matched > 0 && result.intent_matched < result.videos_found ? `, ${result.intent_matched} exact` : ''}
                    </span>
                  )}
                </div>
              )}
            </div>
            {(result.viral_format_detected || result.power_words_found?.length > 0) && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f0f0f4', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10.5, color: C.text3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 4 }}>Signals detected</span>
                {result.viral_format_detected && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: C.red, border: '1.5px solid rgba(229,37,27,0.35)', padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <svg width="8" height="8" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4.5 1L5.5 3.5h2.5L6 5l1 3-2.5-1.5L2 8l1-3-2-1.5H3.5z"/></svg>
                    {VIRAL_FORMAT_LABELS[result.viral_format_detected]}
                  </span>
                )}
                {result.power_words_found?.map(w => (
                  <span key={w} style={{ fontSize: 10, fontWeight: 700, color: C.text3, border: '1.5px solid #e6e6ec', padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{w}</span>
                ))}
              </div>
            )}
          </div>

          {/* Score Breakdown — full-width dense card with inline 2-col rows */}
          <div className="seo-glass-card" style={{ borderRadius: 16, padding: '22px 28px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Score breakdown</p>
              <p style={{ fontSize: 11, color: C.text3 }}>8 criteria · title length &amp; keyword relevance weigh most</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 40px' }}>
              {Object.entries(BREAKDOWN_META).map(([key]) => (
                <BreakdownBar key={key} criterionKey={key} value={result.breakdown[key] ?? 0} max={BREAKDOWN_META[key].max} />
              ))}
            </div>
          </div>

          {/* Keyword Research */}
          {result.keyword_scores?.length > 0 && (
            <div className="seo-glass-card" style={{ borderRadius: 16, padding: '18px 20px', marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Keyword research</p>
              <p style={{ fontSize: 12, color: C.text3, marginBottom: 14, lineHeight: 1.5 }}>
                Volume is search demand from YouTube autocomplete. Competition counts how many top videos target it. Score favours high-volume, low-competition opportunities.
              </p>

              <div style={{ border: '1px solid #e6e6ec', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 100px 52px', gap: 8, padding: '8px 14px', background: '#fafafb', borderBottom: '1px solid #e6e6ec' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Keyword phrase</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Volume</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Competition</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Score</span>
                </div>
                {result.keyword_scores.map((kw, i) => {
                  const volColor = kw.volume === 'HIGH' ? C.green : kw.volume === 'MED' ? C.amber : C.text3
                  const compColor = kw.competition === 'LOW' ? C.green : kw.competition === 'MED' ? C.amber : C.red
                  const scColor = kw.score >= 65 ? C.green : kw.score >= 40 ? C.amber : C.red
                  return (
                    <div key={kw.phrase} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 100px 52px', gap: 8, padding: '10px 14px', borderBottom: i < result.keyword_scores.length - 1 ? '1px solid #f0f0f4' : 'none', alignItems: 'center', transition: 'background 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: C.text1 }}>{kw.phrase}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: volColor, border: `1.5px solid ${volColor === C.text3 ? '#e6e6ec' : volColor}`, padding: '1px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.06em', justifySelf: 'start' }}>{kw.volume}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: compColor, border: `1.5px solid ${compColor}`, padding: '1px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.06em', justifySelf: 'start' }}>{kw.competition}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: scColor, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{kw.score}</span>
                    </div>
                  )
                })}
              </div>

              {result.autocomplete_terms?.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    YouTube autocomplete
                    <span style={{ fontWeight: 500, color: C.text3, marginLeft: 6, textTransform: 'none', letterSpacing: 0 }}>— click to set as title</span>
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {result.autocomplete_terms.map(t => (
                      <span key={t} onClick={() => setTitle(t)}
                        style={{ fontSize: 12, color: C.blue, background: 'rgba(10,10,15,0.04)', padding: '3px 9px', borderRadius: 6, cursor: 'pointer', fontWeight: 500, transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(10,10,15,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(10,10,15,0.04)'}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Suggested Tags */}
          {result.top_tags?.length > 0 && (
            <div className="seo-glass-card" style={{ borderRadius: 16, padding: '18px 20px', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Suggested tags</p>
                  <p style={{ fontSize: 12.5, color: C.text3, lineHeight: 1.5 }}>
                    Pulled from competitor videos in your niche. Add these directly to your video tags.
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.top_tags.join(', '))
                    setCopiedTags(true)
                    setTimeout(() => setCopiedTags(false), 1800)
                  }}
                  style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: copiedTags ? C.green : C.text2, background: '#ffffff', border: `1px solid ${copiedTags ? 'rgba(5,150,105,0.38)' : '#e6e6ec'}`, borderRadius: 100, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.18s' }}>
                  {copiedTags ? '✓ Copied all' : 'Copy all'}
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.top_tags.map(tag => {
                  const inTitle = title.toLowerCase().includes(tag.toLowerCase())
                  return (
                    <span key={tag}
                      onClick={() => { navigator.clipboard.writeText(tag) }}
                      title="Click to copy"
                      style={{ fontSize: 12, color: inTitle ? C.red : C.text2, background: inTitle ? 'rgba(229,37,27,0.06)' : '#fafafb', padding: '4px 10px', borderRadius: 6, border: `1px solid ${inTitle ? 'rgba(229,37,27,0.22)' : '#e6e6ec'}`, cursor: 'pointer', fontWeight: inTitle ? 600 : 500, transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = inTitle ? 'rgba(229,37,27,0.4)' : '#d0d0d8' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = inTitle ? 'rgba(229,37,27,0.22)' : '#e6e6ec' }}>
                      {tag}
                    </span>
                  )
                })}
              </div>
              <p style={{ fontSize: 11.5, color: C.text4, marginTop: 10 }}>
                Red-highlighted tags already appear in your title. Click any to copy individually.
              </p>
            </div>
          )}

          {/* Fix These First */}
          {(() => {
            const fixes = Object.entries(BREAKDOWN_META).filter(([k]) => (result.breakdown[k] ?? 0) === 0)
            if (!fixes.length) return null
            return (
              <div style={{ background: 'rgba(217,119,6,0.05)', border: '1px solid rgba(217,119,6,0.18)', borderRadius: 12, padding: '14px 18px', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={C.amber} strokeWidth="2" strokeLinecap="round"><path d="M7 1v5M7 9v.5"/><circle cx="7" cy="7" r="6"/></svg>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gaps the AI titles fix</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: fixes.length > 1 ? '1fr 1fr' : '1fr', gap: '8px 32px' }}>
                  {fixes.map(([key, meta]) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.text1 }}>{meta.label}</span>
                      <span style={{ fontSize: 12, color: C.text2, lineHeight: 1.5 }}>{meta.why.split('.')[0]}.</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* AI suggestion error */}
          {result.suggestion_error && !result.suggestions?.length && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 14, color: C.orange, fontWeight: 600 }}>AI suggestions unavailable</p>
              <p style={{ fontSize: 12, color: C.text2, marginTop: 3 }}>{result.suggestion_error}</p>
            </div>
          )}

          {/* Intent analysis + gap */}
          {result.intent_analysis?.search_intent && (
            <div className="seo-glass-card" style={{ borderRadius: 16, padding: '18px 20px', marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Search intent analysis</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: 'rgba(10,10,15,0.03)', border: '1px solid rgba(10,10,15,0.08)', borderRadius: 10, padding: '11px 14px' }}>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Search intent</p>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text1, lineHeight: 1.4 }}>{result.intent_analysis.search_intent}</p>
                </div>
                <div style={{ background: 'rgba(217,119,6,0.05)', border: '1px solid rgba(217,119,6,0.14)', borderRadius: 10, padding: '11px 14px' }}>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Emotional driver</p>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text1, lineHeight: 1.4 }}>{result.intent_analysis.emotional_driver}</p>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Who's searching</p>
                <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>{result.intent_analysis.viewer_profile}</p>
              </div>
              {result.intent_analysis.gap_opportunity && (
                <div style={{ background: 'rgba(5,150,105,0.05)', border: '1px solid rgba(5,150,105,0.16)', borderRadius: 10, padding: '11px 14px' }}>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Gap opportunity — what competitors aren't doing</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text1, lineHeight: 1.55 }}>{result.intent_analysis.gap_opportunity}</p>
                  {result.intent_analysis.overused_angle && (
                    <p style={{ fontSize: 12, color: C.text3, marginTop: 6, lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700, color: C.red }}>Overused: </span>{result.intent_analysis.overused_angle}
                    </p>
                  )}
                </div>
              )}
              {result.intent_analysis.top_keywords?.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Top keywords in competitor titles</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {result.intent_analysis.top_keywords.map(kw => (
                      <span key={kw} onClick={() => setTitle(kw)} style={{ fontSize: 12, color: C.blue, background: 'rgba(10,10,15,0.04)', padding: '3px 9px', borderRadius: 6, cursor: 'pointer', fontWeight: 500, transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(10,10,15,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(10,10,15,0.04)'}>{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI-Suggested Titles */}
          {result.suggestions?.length > 0 && (
            <div className="seo-glass-card" style={{ borderRadius: 16, padding: '18px 20px', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>AI-suggested titles</p>
                  <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.5 }}>
                    3 psychological hooks. Pick one to continue to description optimisation.
                  </p>
                </div>
                <button onClick={() => handleSelectTitle(title.trim())}
                  style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: C.text2, background: '#ffffff', border: '1px solid #e6e6ec', borderRadius: 100, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)'; e.currentTarget.style.color = '#111114' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e6e6ec'; e.currentTarget.style.color = C.text2 }}>
                  Use my original title →
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.suggestions.map((s, i) => {
                  const hookMeta = {
                    curiosity:      { label: 'Curiosity / FOMO', color: C.red,   tint: 'rgba(229,37,27,0.05)', bdr: 'rgba(229,37,27,0.14)', desc: "Makes viewers feel they're missing something" },
                    transformation: { label: 'Transformation',   color: C.green, tint: 'rgba(5,150,105,0.05)', bdr: 'rgba(5,150,105,0.16)', desc: 'Focuses on the outcome or result' },
                    contrarian:     { label: 'Contrarian',       color: C.amber, tint: 'rgba(217,119,6,0.05)', bdr: 'rgba(217,119,6,0.16)', desc: "Challenges assumptions — what others don't show" },
                  }
                  const hm = hookMeta[s.hook] || hookMeta.curiosity
                  const seoColor  = s.seo_score  >= 70 ? C.green : s.seo_score  >= 50 ? C.amber : C.red
                  const ctrColor  = s.ctr_score  >= 70 ? C.green : s.ctr_score  >= 50 ? C.amber : C.red
                  const hookColor = s.hook_score >= 70 ? C.green : s.hook_score >= 50 ? C.amber : C.red
                  const isSelected = selectedTitle === s.title
                  return (
                    <div key={i} style={{ border: `1px solid ${isSelected ? 'rgba(229,37,27,0.35)' : copied === i ? 'rgba(5,150,105,0.38)' : '#e6e6ec'}`, borderRadius: 12, overflow: 'hidden', background: isSelected ? 'rgba(229,37,27,0.03)' : copied === i ? 'rgba(5,150,105,0.04)' : '#ffffff', transition: 'all 0.2s' }}>
                      {/* Hook header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: hm.tint, borderBottom: `1px solid ${hm.bdr}` }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: hm.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: hm.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{hm.label}</span>
                        <span style={{ fontSize: 11.5, color: C.text3, fontWeight: 400 }}>{hm.desc}</span>
                      </div>
                      {/* Title + scores */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, padding: '14px 16px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, lineHeight: 1.45, letterSpacing: '-0.2px' }}>{s.title}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: s.length >= 50 && s.length <= 70 ? C.green : C.amber }}>{s.length} chars</span>
                            {s.power_words_found?.length > 0 && s.power_words_found.map(w => (
                              <span key={w} style={{ fontSize: 10, fontWeight: 700, color: C.text3, border: '1.5px solid #e6e6ec', padding: '1px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{w}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                          {s.seo_score > 0 && <div style={{ textAlign: 'center', minWidth: 44 }}><p style={{ fontSize: 16, fontWeight: 800, color: seoColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.seo_score}</p><p style={{ fontSize: 10, color: C.text3, fontWeight: 700, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>SEO</p></div>}
                          {s.ctr_score > 0 && <div style={{ textAlign: 'center', minWidth: 44 }}><p style={{ fontSize: 16, fontWeight: 800, color: ctrColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.ctr_score}</p><p style={{ fontSize: 10, color: C.text3, fontWeight: 700, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>CTR</p></div>}
                          {s.hook_score > 0 && <div style={{ textAlign: 'center', minWidth: 44 }}><p style={{ fontSize: 16, fontWeight: 800, color: hookColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.hook_score}</p><p style={{ fontSize: 10, color: C.text3, fontWeight: 700, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hook</p></div>}
                        </div>
                      </div>
                      {/* Why it works */}
                      {s.why_it_works && (
                        <div style={{ padding: '10px 16px', borderTop: '1px solid #f0f0f4' }}>
                          <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.6 }}>
                            <span style={{ fontWeight: 700, color: hm.color }}>Why it works · </span>{s.why_it_works}
                          </p>
                        </div>
                      )}
                      {/* Action row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderTop: '1px solid #f0f0f4', background: '#fafafb' }}>
                        <button onClick={() => copyTitle(s.title, i)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: copied === i ? C.green : C.text2, background: '#ffffff', border: '1px solid #e6e6ec', borderRadius: 100, padding: '5px 13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                          {copied === i ? '✓ Copied' : 'Copy'}
                        </button>
                        <button onClick={() => handleSelectTitle(s.title)}
                          style={{ marginLeft: 'auto', fontSize: 12.5, fontWeight: 700, color: isSelected ? C.red : '#fff', background: isSelected ? 'rgba(229,37,27,0.08)' : '#e5251b', border: `1px solid ${isSelected ? 'rgba(229,37,27,0.25)' : 'transparent'}`, borderRadius: 100, padding: '6px 18px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s', boxShadow: isSelected ? 'none' : '0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32)' }}>
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
            <div className="seo-glass-card" style={{ borderRadius: 16, padding: '18px 20px', marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Top titles matching your topic</p>
              <p style={{ fontSize: 12, color: C.text3, marginBottom: 14, lineHeight: 1.5 }}>
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
                        <p style={{ fontSize: 14, fontWeight: 600, color: C.text1, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.title}</p>
                        <p style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>{v.channel}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: scColor }}>{sc}</p>
                        <p style={{ fontSize: 12, color: C.text3 }}>{v.title.length}ch</p>
                      </div>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke={C.text4} strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M2 11L10 3M10 3H5M10 3v5"/></svg>
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Thumbnail IQ nudge ────────────────────────────── */}
          {result && onNavigate && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: '8px 0 4px' }}>
              <button
                onClick={() => {
                  try {
                    const kw = result?.search_terms?.[0] || ''
                    if (kw) localStorage.setItem('ytg_prefill_thumbnail_title',
                      selectedTitle || title || '')
                  } catch {}
                  onNavigate('Thumbnail Score')
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                         fontSize: 12, color: C.red, fontFamily: 'inherit',
                         fontWeight: 600, padding: '6px 12px', borderRadius: 8,
                         transition: 'background 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,37,27,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                Ready to test your thumbnail? → Thumbnail IQ
              </button>
            </div>
          )}

          {/* ── Description Optimizer ──────────────────────────── */}
          {selectedTitle && (
            <div ref={descRef} className="seo-glass-card" style={{ marginTop: 12, borderRadius: 16, padding: '18px 20px' }}>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Description optimizer</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, lineHeight: 1.4, letterSpacing: '-0.2px' }}>"{selectedTitle}"</p>
                </div>
                <button onClick={() => { setSelectedTitle(null); setDescResult(null); setDescError('') }}
                  style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: C.text2, background: '#ffffff', border: '1px solid #e6e6ec', borderRadius: 100, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.18s' }}>
                  Change title
                </button>
              </div>

              {!descResult && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                      Current description{' '}
                      <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: C.text3 }}>(optional — paste to improve, or leave blank)</span>
                    </label>
                    <textarea value={currentDesc} onChange={e => setCurrentDesc(e.target.value)}
                      placeholder="Paste your existing description here…"
                      rows={4}
                      style={{ width: '100%', padding: '12px 14px', fontSize: 13.5, border: '1px solid #e6e6ec', borderRadius: 10, fontFamily: 'inherit', outline: 'none', color: C.text1, background: '#ffffff', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.6, transition: 'border-color 0.18s, box-shadow 0.18s' }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(0,0,0,0.25)'; e.target.style.boxShadow = '0 0 0 4px rgba(0,0,0,0.04)' }}
                      onBlur={e => { e.target.style.borderColor = '#e6e6ec'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>

                  <button onClick={handleGenerateDesc} disabled={descLoading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', background: !descLoading ? '#e5251b' : '#e0e0e6', color: '#fff', border: 'none', borderRadius: 100, fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit', cursor: !descLoading ? 'pointer' : 'not-allowed', transition: 'all 0.18s', boxShadow: !descLoading ? '0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32)' : 'none', letterSpacing: '-0.1px' }}>
                    {descLoading ? (
                      <><SpinIcon /> Generating descriptions…</>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 1l1.5 4.5H13l-3.7 2.7 1.4 4.3L7 10 3.3 12.5l1.4-4.3L1 5.5h4.5z"/>
                        </svg>
                        Generate 3 descriptions
                      </>
                    )}
                  </button>

                  {descError && (
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.red, background: 'rgba(229,37,27,0.06)', border: '1px solid rgba(229,37,27,0.18)', borderRadius: 9, padding: '9px 13px' }}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="6.5" cy="6.5" r="5"/><path d="M6.5 4v3M6.5 9v.5"/></svg>
                      {descError}
                    </div>
                  )}
                </>
              )}

              {descResult?.length > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 14 }}>
                    <p style={{ fontSize: 12.5, color: C.text3, lineHeight: 1.5 }}>
                      3 descriptions — each opens with a different hook strategy. Expand to see the full text, then copy.
                    </p>
                    <button onClick={() => { setDescResult(null); setDescError('') }}
                      style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: C.text2, background: '#ffffff', border: '1px solid #e6e6ec', borderRadius: 100, padding: '5px 13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                      Regenerate
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
