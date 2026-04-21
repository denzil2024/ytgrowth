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
    border: 1px solid #e6e6ec !important;
    border-radius: 16px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06) !important;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .seo-suggestion-card {
    background: #ffffff;
    border: 1px solid #e6e6ec;
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 8px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06);
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .seo-suggestion-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.09);
    transform: translateY(-1px);
  }
  .seo-format-card { outline: none; }
  .seo-format-card:hover {
    border-color: rgba(0,0,0,0.18);
    box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 8px 22px rgba(0,0,0,0.07);
    transform: translateY(-1px);
  }
  .seo-format-card:focus-visible {
    border-color: rgba(229,37,27,0.45);
    box-shadow: 0 0 0 3px rgba(229,37,27,0.12);
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
  { key: 'survival_challenge',  hook: 'curiosity',      label: 'Survival / Time Challenge', example: 'I Survived 24 Hours With [Person/Situation]',        why: 'Extreme curiosity + suspense.' },
  { key: 'extreme_comparison',  hook: 'contrarian',     label: 'Extreme Comparison',        example: '$5 VS $500 [Subject]: Honest Review',                 why: 'Price contrast triggers value-seeking.' },
  { key: 'authority_warning',   hook: 'curiosity',      label: 'Authority / Warning',       example: "Don't Buy [Subject] Until You See This",              why: 'Fear of mistake drives high CTR.' },
  { key: 'listicle',            hook: 'transformation', label: 'Listicle / Structure',      example: '7 Things I Wish I Knew About [Subject]',             why: 'Numbers set clear expectations.' },
  { key: 'curiosity_gap',       hook: 'curiosity',      label: 'Curiosity Gap',             example: "I Tested Every [Subject] So You Don't Have To",      why: 'Open loop viewer must click to close.' },
  { key: 'aspirational',        hook: 'transformation', label: 'Aspirational / How I',      example: 'How I Grew [Subject] From 0 to [Number] in [Time]',  why: 'Transformation stories = highest retention.' },
]

const VIRAL_FORMAT_LABELS = Object.fromEntries(VIRAL_FORMATS.map(f => [f.key, f.label]))

const STRATEGY_META = {
  search: { label: 'Search', color: C.green, bg: C.greenBg, desc: 'Keyword-optimised to rank in YouTube search' },
  browse: { label: 'Browse', color: C.amber, bg: C.amberBg, desc: 'Emotional hook for homepage & suggested feed' },
  hybrid: { label: 'Hybrid', color: C.red,   bg: C.redBg,   desc: 'Keywords + emotion — ranks and gets clicked' },
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


function FormatTemplates({ onUse }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setOpen(v => !v)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: 0, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: C.text2, fontSize: 13, fontWeight: 600, letterSpacing: '-0.1px' }}>
        <svg width="12" height="12" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(-90deg)', transition: 'transform 0.25s', flexShrink: 0 }}>
          <path d="M2 4.5l4.5 4.5 4.5-4.5"/>
        </svg>
        Start from a proven format
        <span style={{ color: C.text3, fontWeight: 400 }}>· 6 viral patterns</span>
      </button>
      {open && (
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          {VIRAL_FORMATS.map(fmt => (
            <button key={fmt.key} onClick={() => onUse(fmt.example)} className="seo-format-card"
              style={{ textAlign: 'left', padding: '14px 16px', border: '1px solid #e6e6ec', borderRadius: 12, cursor: 'pointer', background: '#ffffff', fontFamily: 'inherit', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s, transform 0.2s, border-color 0.2s' }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1 }}>{fmt.label}</p>
              <p style={{ fontSize: 13, color: C.text1, fontWeight: 500, lineHeight: 1.45, margin: 0, letterSpacing: '-0.1px' }}>{fmt.example}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function TitlePreviewSimulator({ title }) {
  if (!title.trim()) return null
  const surfaces = [
    { label: 'Suggested feed', maxChars: 45 },
    { label: 'Mobile search',  maxChars: 55 },
    { label: 'Desktop search', maxChars: 70 },
  ]
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Preview on YouTube</p>
        <p style={{ fontSize: 11, color: C.text3 }}>How your title renders across surfaces</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
        {surfaces.map(({ label, maxChars }) => {
          const truncated = title.length > maxChars
          const display = truncated ? title.slice(0, maxChars - 1) + '…' : title
          return (
            <div key={label} style={{ padding: '12px 14px', background: '#ffffff', borderRadius: 10, border: '1px solid #e6e6ec' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: truncated ? C.amber : C.green, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {truncated ? 'Cut' : 'Fits'}
                </span>
              </div>
              <p style={{ fontSize: 12.5, fontWeight: 500, color: truncated ? C.text2 : C.text1, lineHeight: 1.45, margin: 0 }}>{display}</p>
              {truncated && <p style={{ fontSize: 10.5, color: C.amber, marginTop: 5, fontWeight: 500 }}>{title.length - maxChars + 1} chars over {maxChars}</p>}
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

  const SpinIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.93 2.93l1.41 1.41M9.66 9.66l1.41 1.41M2.93 11.07l1.41-1.41M9.66 4.34l1.41-1.41"/>
    </svg>
  )

  return (
    <div style={{ width: '100%', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header — matches Overview page H1: 24/800/-0.6px, plus 44×44 tool badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 44, height: 44, borderRadius: 11,
            background: 'rgba(229,37,27,0.09)',
            border: '1px solid rgba(229,37,27,0.18)',
            flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/>
              <path d="M19 14l0.9 2.7L22 17.5l-2.1 0.8L19 21l-0.9-2.7L16 17.5l2.1-0.8z"/>
            </svg>
          </span>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 6, lineHeight: 1.1 }}>SEO Optimizer</h1>
            <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.4 }}>Your title against live competitor data — 3 AI alternatives, plus a matching description.</p>
          </div>
        </div>
        {(title || result) && (
          <button onClick={handleClear}
            style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '9px 20px', borderRadius: 100, fontWeight: 600, fontSize: 12.5, background: C.surface, color: C.text2, border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)'; e.currentTarget.style.color = C.text1; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10), 0 8px 28px rgba(0,0,0,0.10)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = C.text2; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07)' }}>
            Clear
          </button>
        )}
      </div>

      {/* Input area — hero input on top, then 2-col (Preview | Formats) */}
      <div style={{ marginBottom: 16 }}>

        {/* ── Row 1: Your video title (full-width hero) ──────────────────── */}
        <div className="seo-glass-card" style={{ padding: '22px 24px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your video title</span>
            <span style={{
              fontSize: 11, fontWeight: 500,
              color: title.length > 70 ? C.red : title.length >= 50 ? C.green : C.text3,
              fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
            }}>
              {title.length} · {title.length >= 50 && title.length <= 70 ? 'ideal' : title.length > 70 ? 'too long' : 'aim 50–70'}
            </span>
          </div>

          {prefillBanner && (
            <div style={{
              fontSize: 12, fontWeight: 500, color: C.text2,
              background: '#fafafb', border: '1px solid #e6e6ec',
              borderRadius: 8, padding: '7px 12px', marginBottom: 12,
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }} />
              Pre-filled from Video Ideas
            </div>
          )}

          <textarea ref={titleInputRef} value={title} onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitTitle() } }}
            placeholder="e.g. How I grew my YouTube channel to 10k subscribers"
            rows={2}
            style={{ width: '100%', padding: '14px 16px', fontSize: 15, border: '1px solid #e6e6ec', borderRadius: 12, fontFamily: 'inherit', outline: 'none', color: C.text1, background: '#ffffff', boxSizing: 'border-box', transition: 'border-color 0.18s, box-shadow 0.18s', letterSpacing: '-0.1px', fontWeight: 500, lineHeight: 1.4, resize: 'vertical', minHeight: 64 }}
            onFocus={e => { e.target.style.borderColor = 'rgba(0,0,0,0.25)'; e.target.style.boxShadow = '0 0 0 4px rgba(0,0,0,0.04)' }}
            onBlur={e => { e.target.style.borderColor = '#e6e6ec'; e.target.style.boxShadow = 'none' }} />

          {error && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: C.red, background: C.redBg, border: `1px solid ${C.redBdr}`, borderRadius: 9, padding: '9px 12px', lineHeight: 1.4 }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="6.5" cy="6.5" r="5"/><path d="M6.5 4v3M6.5 9v.5"/></svg>
              {error}
            </div>
          )}

          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSubmitTitle} disabled={loading || loadingIntent || !title.trim()}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 22px', background: title.trim() && !loading && !loadingIntent ? C.red : '#e0e0e6', color: '#fff', border: 'none', borderRadius: 100, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: title.trim() && !loading && !loadingIntent ? 'pointer' : 'not-allowed', transition: 'all 0.18s', boxShadow: title.trim() && !loading && !loadingIntent ? '0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32)' : 'none', letterSpacing: '-0.1px' }}
              onMouseEnter={e => { if (!loading && !loadingIntent && title.trim()) { e.currentTarget.style.filter = 'brightness(1.07)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,37,27,0.42)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
              onMouseLeave={e => { if (!loading && !loadingIntent && title.trim()) { e.currentTarget.style.filter = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32)'; e.currentTarget.style.transform = '' } }}>
              {loadingIntent ? (
                <><SpinIcon /> Identifying intent…</>
              ) : loading ? (
                <><SpinIcon /> Researching…</>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/>
                  </svg>
                  Analyse &amp; suggest titles
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Row 2: 2-col — Preview on YouTube | Start from a format ────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>

          {/* Preview on YouTube — priority-action visual DNA: colored top border + status pill */}
          <div className="seo-glass-card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Preview on YouTube</span>
              <span style={{ fontSize: 11, color: C.text3, whiteSpace: 'nowrap' }}>3 surfaces</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {title.trim() ? (
                [
                  { label: 'Suggested feed', maxChars: 45 },
                  { label: 'Mobile search',  maxChars: 55 },
                  { label: 'Desktop search', maxChars: 70 },
                ].map(({ label, maxChars }) => {
                  const truncated = title.length > maxChars
                  const display = truncated ? title.slice(0, maxChars - 1) + '…' : title
                  const accent = truncated ? C.amber : C.green
                  const accentBg = truncated ? C.amberBg : C.greenBg
                  const accentBdr = truncated ? C.amberBdr : C.greenBdr
                  return (
                    <div key={label} style={{
                      background: '#ffffff',
                      border: '1px solid #e6e6ec',
                      borderTop: `3px solid ${accent}`,
                      borderRadius: 12,
                      padding: '12px 14px 14px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 10 }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: accent,
                          letterSpacing: '0.06em', textTransform: 'uppercase',
                          padding: '2px 9px', borderRadius: 20,
                          border: `1.2px solid ${accentBdr}`, background: accentBg,
                        }}>
                          {truncated ? 'Cut' : 'Fits'}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: truncated ? C.text2 : C.text1, lineHeight: 1.5, margin: 0, letterSpacing: '-0.1px' }}>{display}</p>
                      {truncated && (
                        <p style={{ fontSize: 11.5, color: C.amber, marginTop: 7, fontWeight: 600, letterSpacing: '-0.05px' }}>
                          +{title.length - maxChars} chars over {maxChars}
                        </p>
                      )}
                    </div>
                  )
                })
              ) : (
                <div style={{ padding: '44px 20px', background: '#fafafb', border: '1px dashed #e6e6ec', borderRadius: 12 }}>
                  <p style={{ fontSize: 13, color: C.text3, textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
                    Type a title to see how it renders<br/>in Suggested feed, Mobile &amp; Desktop search.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Start from a format — priority-action visual DNA: colored top border + numbered badge + hook label */}
          <div className="seo-glass-card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Start from a format</span>
              <span style={{ fontSize: 11, color: C.text3, whiteSpace: 'nowrap' }}>6 patterns · click to use</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
              {VIRAL_FORMATS.map((fmt, i) => {
                // One color per column: left column = red, right column = amber.
                const colColor = i % 2 === 0 ? C.red : C.amber
                return (
                  <button key={fmt.key} onClick={() => setTitle(fmt.example)} className="seo-format-card"
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px 14px',
                      background: '#ffffff',
                      border: '1px solid #e6e6ec',
                      borderTop: `3px solid ${colColor}`,
                      borderRadius: 12,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 6,
                        background: colColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 10, fontWeight: 900, color: '#ffffff', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{i + 1}</span>
                      </div>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: colColor, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1 }}>{fmt.label}</span>
                    </div>
                    <p style={{ fontSize: 13, color: C.text1, fontWeight: 500, lineHeight: 1.5, margin: 0, letterSpacing: '-0.1px' }}>{fmt.example}</p>
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Intent picker */}
      {intentOptions && !loading && !result && (
        <div className="seo-glass-card" style={{ borderRadius: 16, padding: '22px 24px', marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Pick your niche</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: C.text1, letterSpacing: '-0.4px', lineHeight: 1.3, marginBottom: 6 }}>What's this video really about?</p>
          <p style={{ fontSize: 13, color: C.text3, marginBottom: 14, lineHeight: 1.6 }}>
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
          {/* Niche header — what the competitor set is */}
          <div className="seo-glass-card" style={{ borderRadius: 16, padding: '22px 24px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, gap: 16, flexWrap: 'wrap' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Competitor set</p>
              {result.primary_phrase && (
                <p style={{ fontSize: 11, color: C.text3 }}>
                  {result.videos_found > 0 ? `${result.videos_found} live YouTube results${result.intent_matched > 0 && result.intent_matched < result.videos_found ? ` · ${result.intent_matched} exact match` : ''}` : 'No competitor data yet'}
                </p>
              )}
            </div>
            {result.primary_phrase && (
              <p style={{ fontSize: 20, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 6 }}>
                &ldquo;{result.primary_phrase}&rdquo;
              </p>
            )}
            <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, margin: 0 }}>
              The 3 titles below are written from the gap between what these competitors do and what they leave open — not from forced keyword formulas.
            </p>
          </div>

          {/* Keyword Research */}
          {result.keyword_scores?.length > 0 && (
            <div className="seo-glass-card" style={{ borderRadius: 16, padding: '22px 24px', marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Keyword research</p>
              <p style={{ fontSize: 12, color: C.text3, marginBottom: 14, lineHeight: 1.5 }}>
                Volume is search demand from YouTube autocomplete. Competition counts how many top videos target it. Score favours high-volume, low-competition opportunities.
              </p>

              <div style={{ border: '1px solid #e6e6ec', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 100px 52px', gap: 8, padding: '8px 14px', background: '#fafafb', borderBottom: '1px solid #e6e6ec' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Keyword phrase</span>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Volume</span>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Competition</span>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Score</span>
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
            <div className="seo-glass-card" style={{ borderRadius: 16, padding: '22px 24px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Suggested tags</p>
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

          {/* AI suggestion error */}
          {result.suggestion_error && !result.suggestions?.length && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 14, color: C.orange, fontWeight: 600 }}>AI suggestions unavailable</p>
              <p style={{ fontSize: 12, color: C.text2, marginTop: 3 }}>{result.suggestion_error}</p>
            </div>
          )}

          {/* Intent analysis + gap */}
          {result.intent_analysis?.search_intent && (
            <div className="seo-glass-card" style={{ borderRadius: 16, padding: '22px 24px', marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Search intent analysis</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: 'rgba(10,10,15,0.03)', border: '1px solid rgba(10,10,15,0.08)', borderRadius: 10, padding: '11px 14px' }}>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Search intent</p>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text1, lineHeight: 1.4 }}>{result.intent_analysis.search_intent}</p>
                </div>
                <div style={{ background: 'rgba(217,119,6,0.05)', border: '1px solid rgba(217,119,6,0.14)', borderRadius: 10, padding: '11px 14px' }}>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Emotional driver</p>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text1, lineHeight: 1.4 }}>{result.intent_analysis.emotional_driver}</p>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Who's searching</p>
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
                  <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Top keywords in competitor titles</p>
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

          {/* AI-Suggested Titles — Overview InsightCard pattern */}
          {result.suggestions?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px' }}>Suggested titles</p>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.text3, background: '#f1f1f6', padding: '2px 8px', borderRadius: 20, border: '1px solid #e6e6ec' }}>{result.suggestions.length}</span>
                </div>
                <button onClick={() => handleSelectTitle(title.trim())}
                  style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: C.text2, background: '#ffffff', border: '1px solid #e6e6ec', borderRadius: 100, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)'; e.currentTarget.style.color = C.text1 }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e6e6ec'; e.currentTarget.style.color = C.text2 }}>
                  Use my original title →
                </button>
              </div>
              <div>
                {result.suggestions.map((s, i) => {
                  const hookMeta = {
                    curiosity:      { label: 'Curiosity / FOMO', color: C.red,   tint: 'rgba(229,37,27,0.06)', bdr: 'rgba(229,37,27,0.14)', desc: "Makes viewers feel they're missing something" },
                    transformation: { label: 'Transformation',   color: C.green, tint: 'rgba(5,150,105,0.06)', bdr: 'rgba(5,150,105,0.16)', desc: 'Focuses on the outcome or result' },
                    contrarian:     { label: 'Contrarian',       color: C.amber, tint: 'rgba(217,119,6,0.06)', bdr: 'rgba(217,119,6,0.16)', desc: "Challenges assumptions — what others don't show" },
                  }
                  const hm = hookMeta[s.hook] || hookMeta.curiosity
                  const avgScore = Math.round(((s.seo_score || 0) + (s.ctr_score || 0) + (s.hook_score || 0)) / Math.max(1, [s.seo_score, s.ctr_score, s.hook_score].filter(v => v > 0).length))
                  const sevLabel = avgScore >= 75 ? 'Strong' : avgScore >= 55 ? 'Solid' : 'Weak'
                  const sevColor = avgScore >= 75 ? C.green : avgScore >= 55 ? C.amber : C.red
                  const isSelected = selectedTitle === s.title
                  return (
                    <div key={i} className="seo-suggestion-card" style={{
                      borderTop: `3px solid ${hm.color}`,
                      borderColor: isSelected ? 'rgba(229,37,27,0.30)' : copied === i ? 'rgba(5,150,105,0.30)' : '#e6e6ec',
                      background: isSelected ? '#fff8f8' : copied === i ? '#f6fdf9' : '#ffffff',
                    }}>
                      <div style={{ padding: '16px 22px 18px' }}>
                        {/* Header row — numbered badge + hook label + severity pill */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: 8,
                            background: hm.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <span style={{ fontSize: 12, fontWeight: 900, color: '#ffffff', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{i + 1}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: hm.color, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{hm.label}</span>
                            <span style={{ fontSize: 12, color: C.text3, fontWeight: 400 }}>{hm.desc}</span>
                          </div>
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: sevColor,
                            border: `1.5px solid ${sevColor}`, padding: '3px 9px',
                            borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase',
                            flexShrink: 0,
                          }}>{sevLabel}</span>
                        </div>

                        {/* Title — the main content */}
                        <p style={{ fontSize: 16, fontWeight: 700, color: C.text1, lineHeight: 1.4, letterSpacing: '-0.3px', marginLeft: 36, marginBottom: 6 }}>{s.title}</p>
                        <p style={{ fontSize: 11.5, color: C.text3, marginLeft: 36, marginBottom: 14, fontVariantNumeric: 'tabular-nums' }}>
                          {s.length} chars{s.length >= 50 && s.length <= 70 ? ' · within the ideal 50–70 range' : s.length > 70 ? ' · over 70, will truncate on mobile' : ' · under 50, thin on context'}
                        </p>

                        {/* Divider — matches Overview InsightCard hairline */}
                        <div style={{ height: 1, background: '#e6e6ec', marginBottom: 14, marginLeft: 36 }} />

                        {/* 3-col insight grid — why / title score / action */}
                        <div style={{ marginLeft: 36, display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 8 }}>
                          {/* WHY IT WORKS — hook-tinted */}
                          <div style={{ background: hm.tint, border: `1px solid ${hm.bdr}`, borderRadius: 10, padding: '12px 14px' }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: hm.color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Why it works</p>
                            <p style={{ fontSize: 13, color: C.text1, lineHeight: 1.6 }}>{s.why_it_works || hm.desc}</p>
                          </div>
                          {/* SCORES — white centre with hook-colored left accent */}
                          <div style={{ background: '#ffffff', border: '1px solid #e6e6ec', borderLeft: `3px solid ${hm.color}`, borderRadius: '0 10px 10px 0', padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: hm.color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Scores vs competitors</p>
                            <div style={{ display: 'flex', gap: 18 }}>
                              {[['SEO', s.seo_score], ['CTR', s.ctr_score], ['Hook', s.hook_score]].map(([label, val]) => {
                                const c = val >= 70 ? C.green : val >= 50 ? C.amber : C.red
                                return (
                                  <div key={label}>
                                    <p style={{ fontSize: 18, fontWeight: 800, color: c, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.3px' }}>{val || '—'}</p>
                                    <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, marginTop: 4, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</p>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          {/* ACTION — green tint */}
                          <div style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.16)', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Use this title</p>
                            <button onClick={() => handleSelectTitle(s.title)}
                              style={{ fontSize: 12.5, fontWeight: 700, color: isSelected ? C.red : '#ffffff', background: isSelected ? 'rgba(229,37,27,0.08)' : '#e5251b', border: `1px solid ${isSelected ? 'rgba(229,37,27,0.25)' : 'transparent'}`, borderRadius: 100, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s', boxShadow: isSelected ? 'none' : '0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32)', whiteSpace: 'nowrap' }}>
                              {isSelected ? '✓ Selected' : 'Continue →'}
                            </button>
                            <button onClick={() => copyTitle(s.title, i)}
                              style={{ fontSize: 12, fontWeight: 600, color: copied === i ? C.green : C.text2, background: '#ffffff', border: '1px solid #e6e6ec', borderRadius: 100, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                              {copied === i ? '✓ Copied' : 'Copy title'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Top videos in niche */}
          {result.top_videos?.length > 0 && (
            <div className="seo-glass-card" style={{ borderRadius: 16, padding: '22px 24px', marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Top titles matching your topic</p>
              <p style={{ fontSize: 12, color: C.text3, marginBottom: 14, lineHeight: 1.5 }}>
                Searched YouTube for{result.primary_phrase ? <><span style={{ fontWeight: 700, color: C.text2 }}> &ldquo;{result.primary_phrase}&rdquo;</span> —</> : ''} your closest competitors.
                {result.intent_matched > 0 && result.intent_matched < result.videos_found
                  ? ` Filtered to ${result.intent_matched} exact-match videos.`
                  : ''}
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
            <div ref={descRef} className="seo-glass-card" style={{ marginTop: 16, borderRadius: 16, padding: '22px 24px' }}>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Description optimizer</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: C.text1, lineHeight: 1.4, letterSpacing: '-0.3px' }}>"{selectedTitle}"</p>
                </div>
                <button onClick={() => { setSelectedTitle(null); setDescResult(null); setDescError('') }}
                  style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: C.text2, background: '#ffffff', border: '1px solid #e6e6ec', borderRadius: 100, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.18s' }}>
                  Change title
                </button>
              </div>

              {!descResult && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
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
