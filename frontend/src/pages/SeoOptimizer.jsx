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
    border: 1px solid rgba(0,0,0,0.09) !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 6px 24px rgba(0,0,0,0.09) !important;
  }
  .seo-glass-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.10), 0 20px 56px rgba(0,0,0,0.13) !important;
    transform: translateY(-1px);
    border-color: rgba(0,0,0,0.13) !important;
    transition: box-shadow 0.22s, transform 0.22s, border-color 0.22s;
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

// IMPROVED: always-visible quick-start chip templates
const QUICK_CHIPS = [
  'How I [result] in [timeframe]',
  'Why [common belief] is WRONG',
  '[Number] things that [outcome]',
  'The truth about [topic]',
  'I tried [thing] for [timeframe] — here\'s what happened',
  'Stop doing [mistake] (do this instead)',
]

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

// IMPROVED: always-visible horizontal scrollable chip row — no accordion
function QuickStartChips({ onUse }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 9 }}>Quick start templates</p>
      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {QUICK_CHIPS.map((chip, i) => (
          <button key={i} onClick={() => onUse(chip)}
            style={{
              flexShrink: 0,
              fontSize: 12, fontWeight: 500,
              color: C.text2,
              background: '#f4f4f7',
              border: '1px solid rgba(0,0,0,0.09)',
              borderRadius: 100,
              padding: '6px 14px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red; e.currentTarget.style.background = '#fff5f5' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.09)'; e.currentTarget.style.color = C.text2; e.currentTarget.style.background = '#f4f4f7' }}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  )
}

// IMPROVED: real YouTube UI mockup cards with thumbnail placeholders
function TitlePreviewSimulator({ title }) {
  if (!title.trim()) return null

  const fits60 = title.length <= 60
  const fits55 = title.length <= 55
  const fits65 = title.length <= 65

  function truncate(str, n) { return str.length > n ? str.slice(0, n - 1) + '…' : str }

  const FitBadge = ({ ok }) => (
    <span style={{ fontSize: 10, fontWeight: 700, color: ok ? C.green : C.orange, background: ok ? C.greenBg : C.orangeBg, border: `1px solid ${ok ? C.greenBdr : C.orangeBdr}`, padding: '2px 7px', borderRadius: 20 }}>
      {ok ? '✓ fits' : 'cut off'}
    </span>
  )

  // Shared thumbnail placeholder (16:9)
  const Thumb = ({ width, height, radius = 8 }) => (
    <div style={{ width, height, borderRadius: radius, background: 'linear-gradient(135deg, #e8e8ec 0%, #d4d4da 100%)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="rgba(0,0,0,0.12)"/><path d="M8 7l6 3-6 3V7z" fill="rgba(0,0,0,0.35)"/></svg>
      </div>
    </div>
  )

  const Avatar = () => (
    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #d4d4da, #c0c0c8)', flexShrink: 0 }} />
  )

  const YTLabel = () => (
    <span style={{ position: 'absolute', bottom: 6, right: 8, fontSize: 9, fontWeight: 600, color: 'rgba(0,0,0,0.22)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Preview</span>
  )

  return (
    <div style={{ marginTop: 16, padding: '16px 18px', background: '#f7f7fa', borderRadius: 14, border: `1px solid ${C.border}` }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 14 }}>How your title appears on YouTube</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>

        {/* Suggested Feed */}
        <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px 6px' }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Suggested Feed</span>
            <FitBadge ok={fits60} />
          </div>
          <div style={{ padding: '0 10px 10px' }}>
            <Thumb width="100%" height={90} radius={7} />
            <div style={{ display: 'flex', gap: 8, marginTop: 9, alignItems: 'flex-start' }}>
              <Avatar />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11.5, fontWeight: 700, color: '#0f0f0f', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{truncate(title, 60)}</p>
                <p style={{ fontSize: 10.5, color: '#606060', marginTop: 3, fontWeight: 400 }}>Your Channel</p>
              </div>
            </div>
          </div>
          <YTLabel />
        </div>

        {/* Mobile Search */}
        <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px 6px' }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Mobile Search</span>
            <FitBadge ok={fits55} />
          </div>
          <div style={{ padding: '0 10px 10px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Thumb width={100} height={56} radius={6} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, color: '#0f0f0f', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{truncate(title, 55)}</p>
              <p style={{ fontSize: 10, color: '#606060', marginTop: 4, fontWeight: 400 }}>Your Channel</p>
              <p style={{ fontSize: 10, color: '#606060', fontWeight: 400 }}>1.2K views</p>
            </div>
          </div>
          <YTLabel />
        </div>

        {/* Desktop Search */}
        <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px 6px' }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Desktop Search</span>
            <FitBadge ok={fits65} />
          </div>
          <div style={{ padding: '0 10px 10px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Thumb width={120} height={68} radius={6} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0f0f0f', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{truncate(title, 65)}</p>
              <p style={{ fontSize: 10.5, color: '#606060', marginTop: 4, fontWeight: 400 }}>Your Channel · 1.2K views</p>
            </div>
          </div>
          <YTLabel />
        </div>

      </div>
    </div>
  )
}

function DescriptionCard({ d, idx, copiedDesc, onCopy }) {
  const [expanded, setExpanded] = useState(false)
  const tm = DESC_TYPE_META[d.type] || DESC_TYPE_META.value
  const isCopied = copiedDesc === idx
  return (
    <div style={{ border: `1px solid ${isCopied ? '#bbf7d0' : 'rgba(0,0,0,0.09)'}`, borderRadius: 16, overflow: 'hidden', background: isCopied ? '#f0fdf4' : '#ffffff', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 6px 24px rgba(0,0,0,0.09)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: tm.bg, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: tm.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M2 5h6M5 2l3 3-3 3"/></svg>
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, color: tm.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d.label}</span>
        <span style={{ fontSize: 11.5, color: C.text3, fontWeight: 400 }}>{d.why_it_works}</span>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.65, background: '#f7f7fa', padding: '10px 14px', borderRadius: 9, borderLeft: `3px solid ${tm.color}`, marginBottom: 10 }}>
          {d.preview}
        </p>
        {expanded && (
          <pre style={{ fontSize: 12.5, color: C.text1, lineHeight: 1.75, whiteSpace: 'pre-wrap', fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", background: '#fafafc', padding: '12px 14px', borderRadius: 10, marginBottom: 10, border: `1px solid ${C.border}`, boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.03)' }}>
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
  const [usage, setUsage] = useState(null) // IMPROVED: for "X remaining" label

  useEffect(() => {
    fetch('/billing/usage', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setUsage(d))
      .catch(() => {})
  }, [result]) // refetch after each analysis so count updates

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
    <div style={{ width: '100%', fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>

      {/* IMPROVED: larger subtitle, better copy, divider */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0a0a0f', letterSpacing: '-0.6px', marginBottom: 6 }}>SEO Optimizer</h2>
            <p style={{ fontSize: 14, color: C.text3, lineHeight: 1.6, maxWidth: 560 }}>Type your draft title — we'll analyse competitor data, score it against the top 10 results, and generate 3 optimized alternatives with hooks and SEO reasoning.</p>
          </div>
          {(title || result) && (
            <button onClick={handleClear}
              style={{ flexShrink: 0, marginLeft: 16, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: C.text3, background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 100, padding: '7px 16px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', transition: 'all 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = C.text3 }}>
              Clear
            </button>
          )}
        </div>
        <div style={{ height: 1, background: 'rgba(0,0,0,0.07)' }} />
      </div>

      {/* Input card */}
      <div className="seo-glass-card" style={{ borderRadius: 20, padding: '20px 22px', marginBottom: 14 }}>

        <QuickStartChips onUse={t => setTitle(t)} />

        {/* IMPROVED: card-style input, red focus glow, X/100 counter, tip text */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Your video title</label>
            {title.length > 0 && (
              <span style={{
                fontSize: 11.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                color: title.length > 90 ? C.red : title.length > 70 ? C.amber : C.green,
                transition: 'color 0.2s',
              }}>
                {title.length} / 100
              </span>
            )}
          </div>
          <input value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmitTitle()}
            placeholder="e.g. How I grew my YouTube channel to 10k subscribers"
            style={{ width: '100%', padding: '16px 20px', fontSize: 14.5, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, fontFamily: 'inherit', outline: 'none', color: C.text1, background: '#ffffff', boxSizing: 'border-box', transition: 'border-color 0.18s, box-shadow 0.18s', letterSpacing: '-0.2px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', lineHeight: 1.5 }}
            onFocus={e => { e.target.style.borderColor = C.red; e.target.style.boxShadow = '0 0 0 3px rgba(229,37,27,0.12), 0 1px 3px rgba(0,0,0,0.06)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)' }} />
          <p style={{ fontSize: 11.5, color: C.text4, marginTop: 7, letterSpacing: '-0.1px' }}>
            Tip: Front-load your main keyword. Aim for <span style={{ fontWeight: 600, color: C.text3 }}>50–70 characters</span> for best CTR.
          </p>
          <TitlePreviewSimulator title={title} />
        </div>

        {/* IMPROVED: full-width button, locked state, usage remaining label */}
        {(() => {
          const outOfCredits = usage && usage.monthly_remaining === 0 && usage.pack_balance === 0
          const remaining = usage ? usage.monthly_remaining + (usage.pack_balance || 0) : null
          const isActive = title.trim() && !loading && !loadingIntent && !outOfCredits

          if (outOfCredits) return (
            <div style={{ marginTop: 4 }}>
              <div style={{ width: '100%', padding: '13px 20px', background: '#f4f4f7', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, textAlign: 'center', color: C.text3, fontSize: 13, fontWeight: 600, marginBottom: 10, boxSizing: 'border-box' }}>
                No analyses remaining this month
              </div>
              <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 10, padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <p style={{ fontSize: 12.5, color: C.red, fontWeight: 500, lineHeight: 1.5 }}>You've used all your AI analyses this month. Top up to continue.</p>
                <a href="/settings" style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#fff', background: C.red, padding: '6px 14px', borderRadius: 8, textDecoration: 'none' }}>Top up →</a>
              </div>
            </div>
          )

          return (
            <div style={{ marginTop: 4 }}>
              <button onClick={handleSubmitTitle} disabled={!isActive}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px 26px', background: isActive ? C.red : '#e0e0e6', color: '#fff', border: 'none', borderRadius: 12, fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', cursor: isActive ? 'pointer' : 'not-allowed', transition: 'all 0.18s', boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32)' : 'none', letterSpacing: '-0.1px', boxSizing: 'border-box' }}
                onMouseEnter={e => { if (isActive) { e.currentTarget.style.filter = 'brightness(1.07)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,37,27,0.42)' } }}
                onMouseLeave={e => { if (isActive) { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32)' } }}>
                {loadingIntent ? <><SpinIcon /> Identifying search intent…</>
                  : loading ? <><SpinIcon /> Analysing competitor data…</>
                  : <><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="5"/><path d="m9 9 3 3"/></svg>Analyse &amp; suggest titles</>}
              </button>
              {remaining !== null && (
                <p style={{ fontSize: 11.5, color: C.text4, textAlign: 'center', marginTop: 8 }}>
                  Uses 1 AI analysis · <span style={{ color: remaining <= 2 ? C.red : C.text3, fontWeight: remaining <= 2 ? 700 : 400 }}>{remaining} remaining</span>
                </p>
              )}
            </div>
          )
        })()}

        {error && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.red, background: C.redBg, border: `1px solid #fecaca`, borderRadius: 9, padding: '9px 13px' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="6.5" cy="6.5" r="5"/><path d="M6.5 4v3M6.5 9v.5"/></svg>
            {error}
          </div>
        )}
      </div>

      {/* Intent picker */}
      {intentOptions && !loading && !result && (
        <div style={{ background: '#eff6ff', border: `1px solid ${C.blueBdr}`, borderRadius: 20, padding: '20px 22px', marginBottom: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 6px 24px rgba(0,0,0,0.09)' }}>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: C.text1, letterSpacing: '-0.2px', marginBottom: 3 }}>What's this video really about?</p>
          <p style={{ fontSize: 12.5, color: C.text3, marginBottom: 14 }}>
            Same words, different niches. Pick the closest match so we search the right audience.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {intentOptions.map((opt, i) => (
              <div key={i} onClick={() => handleSelectIntent(opt.keyword)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 16px', border: `1px solid rgba(0,0,0,0.09)`, borderRadius: 14, cursor: 'pointer', background: '#fff', transition: 'all 0.18s', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

            <div className="seo-glass-card" style={{ borderRadius: 20, padding: '20px 22px' }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>SEO Score</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <ScoreRing score={result.score} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>{scoreLabel}</p>
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

            <div className="seo-glass-card" style={{ borderRadius: 20, padding: '20px 22px' }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Score Breakdown</p>
              {Object.entries(BREAKDOWN_META).map(([key]) => (
                <BreakdownBar key={key} criterionKey={key} value={result.breakdown[key] ?? 0} max={BREAKDOWN_META[key].max} />
              ))}
            </div>
          </div>

          {/* Keyword Research */}
          {result.keyword_scores?.length > 0 && (
            <div className="seo-glass-card" style={{ borderRadius: 20, padding: '20px 22px', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Keyword Research</p>
                  <p style={{ fontSize: 11.5, color: C.text3 }}>
                    Volume = search demand (from YouTube autocomplete) &nbsp;·&nbsp;
                    Competition = how many top videos already target it &nbsp;·&nbsp;
                    Score = opportunity (high volume + low competition)
                  </p>
                </div>
              </div>

              <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 55px', gap: 8, padding: '8px 14px', background: '#f8f8fb', borderBottom: `1px solid ${C.border}` }}>
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
            <div className="seo-glass-card" style={{ borderRadius: 20, padding: '20px 22px', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Suggested Tags</p>
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
              <div style={{ background: C.amberBg, border: `1px solid ${C.orangeBdr}`, borderRadius: 16, padding: '16px 20px', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M5.5 1v4M5.5 8v.5"/><circle cx="5.5" cy="5.5" r="4.5"/></svg>
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gaps the AI titles fix</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {fixes.map(([key, meta]) => (
                    <div key={key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 10px', background: '#ffffff', borderRadius: 9 }}>
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
            <div className="seo-glass-card" style={{ borderRadius: 20, padding: '20px 22px', marginBottom: 14 }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Search Intent Analysis</p>
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
            <div className="seo-glass-card" style={{ borderRadius: 20, padding: '20px 22px', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>AI-Suggested Titles</p>
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
                    <div key={i} style={{ border: `1px solid ${isSelected ? C.blue : copied === i ? C.greenBdr : 'rgba(0,0,0,0.09)'}`, borderRadius: 16, overflow: 'hidden', background: isSelected ? '#f8fbff' : copied === i ? C.greenBg : '#fff', transition: 'all 0.2s', boxShadow: isSelected ? `0 4px 20px rgba(37,99,235,0.10)` : '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.07)' }}>
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
                        <div style={{ padding: '10px 18px', borderTop: `1px solid ${C.borderLight}`, background: '#f7f7fa' }}>
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
                          style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: isSelected ? C.red : '#fff', background: isSelected ? '#fff5f5' : '#e5251b', border: `1px solid ${isSelected ? '#fecaca' : 'transparent'}`, borderRadius: 100, padding: '6px 18px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s', boxShadow: isSelected ? 'none' : '0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32)' }}>
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
            <div className="seo-glass-card" style={{ borderRadius: 20, padding: '20px 22px', marginBottom: 14 }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Top titles matching your topic</p>
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
            <div ref={descRef} className="seo-glass-card" style={{ marginTop: 14, borderRadius: 20, padding: '20px 22px' }}>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Description Optimizer</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, lineHeight: 1.4, letterSpacing: '-0.3px' }}>"{selectedTitle}"</p>
                </div>
                <button onClick={() => { setSelectedTitle(null); setDescResult(null); setDescError('') }}
                  style={{ flexShrink: 0, marginLeft: 16, fontSize: 12, fontWeight: 600, color: C.text3, background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 100, padding: '6px 16px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', transition: 'all 0.18s' }}>
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
                      style={{ width: '100%', padding: '12px 16px', fontSize: 13.5, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, fontFamily: 'inherit', outline: 'none', color: C.text1, background: '#ffffff', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.65, transition: 'border-color 0.18s, box-shadow 0.18s', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(0,0,0,0.25)'; e.target.style.boxShadow = '0 0 0 4px rgba(0,0,0,0.04)' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)' }}
                    />
                  </div>

                  <button onClick={handleGenerateDesc} disabled={descLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 26px', background: !descLoading ? '#e5251b' : '#e0e0e6', color: '#fff', border: 'none', borderRadius: 100, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: !descLoading ? 'pointer' : 'not-allowed', transition: 'all 0.18s', boxShadow: !descLoading ? '0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32)' : 'none', letterSpacing: '-0.1px' }}>
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
