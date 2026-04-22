import { useState, useEffect, useRef } from 'react'

// Load Inter once — SCOPED to this page, not global (each page owns its own font loading)
if (typeof document !== 'undefined' && !document.getElementById('seo-opt-inter-font')) {
  const link = document.createElement('link')
  link.id = 'seo-opt-inter-font'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
  document.head.appendChild(link)
}

// Inject spin keyframe once
if (typeof document !== 'undefined' && !document.getElementById('seo-opt-styles')) {
  const s = document.createElement('style')
  s.id = 'seo-opt-styles'
  s.textContent = `
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes seoFadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
  @keyframes seoLoadingSlide {
    0%   { transform: translateX(-100%); }
    50%  { transform: translateX(130%); }
    100% { transform: translateX(260%); }
  }
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
  .seo-kw-row:hover .seo-kw-phrase { color: #0f0f13 !important; }
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
  .seo-route-card {
    position: relative;
    display: flex; flex-direction: column;
    text-align: left;
    background: #ffffff;
    border: 1px solid #e6e6ec;
    border-radius: 16px;
    padding: 22px 22px 20px;
    cursor: pointer;
    font-family: inherit;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06);
    transition: transform 0.22s cubic-bezier(0.2, 0.7, 0.3, 1), box-shadow 0.22s, border-color 0.22s;
    overflow: hidden;
  }
  .seo-route-card::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(229,37,27,0.05) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.25s;
    pointer-events: none;
  }
  .seo-route-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.08), 0 20px 40px rgba(229,37,27,0.20);
    border-color: rgba(229,37,27,0.40);
  }
  .seo-route-card:hover::before { opacity: 1; }
  .seo-route-card:hover .seo-route-go { color: #e5251b; transform: translateX(3px); }
  .seo-route-card:hover .seo-route-badge { box-shadow: 0 6px 16px rgba(229,37,27,0.55), inset 0 1px 0 rgba(255,255,255,0.35); }
  .seo-route-go { transition: color 0.2s, transform 0.2s; display: inline-flex; align-items: center; gap: 6px; color: #9595a4; }
  .seo-route-badge { transition: box-shadow 0.22s; }

  /* Local button classes — mirror ytg-dash-btn / ytg-dash-btn-primary from Overview,
     scoped to this page via .seo- prefix so we don't touch global styles. */
  .seo-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 20px; border-radius: 100px; border: 1px solid rgba(0,0,0,0.1);
    font-family: 'Inter', system-ui, sans-serif; font-size: 12.5px; font-weight: 600;
    background: #ffffff; color: #4a4a58; cursor: pointer;
    box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
    transition: all 0.18s;
    white-space: nowrap;
  }
  .seo-btn:hover {
    border-color: rgba(0,0,0,0.18); color: #0f0f13;
    box-shadow: 0 2px 8px rgba(0,0,0,0.10), 0 8px 28px rgba(0,0,0,0.10);
    transform: translateY(-1px);
  }
  .seo-btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 9px 20px; border-radius: 100px; border: none;
    font-family: 'Inter', system-ui, sans-serif; font-size: 12.5px; font-weight: 700;
    background: #e5251b; color: #ffffff; cursor: pointer;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32);
    transition: all 0.18s;
    letter-spacing: -0.1px;
    white-space: nowrap;
  }
  .seo-btn-primary:hover:not(:disabled) {
    filter: brightness(1.07);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,37,27,0.42);
    transform: translateY(-1px);
  }
  .seo-btn-primary:disabled {
    background: #e0e0e6; color: #ffffff; cursor: not-allowed;
    box-shadow: none; opacity: 0.92;
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

function saveToDisk(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
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

// Per-tile accent colors — scoped to this section ONLY, never reuse elsewhere.
// Row 1 warm (red + amber), row 2 cool (purple + blue), row 3 green-family (teal + green).
// ── Canonical typography — matches Overview (Dashboard.jsx) exactly.
//    Sizes intentionally vary by role (card label 11, inner label 10) — this is
//    the hierarchy Overview uses, don't flatten it. ──
const T = {
  // Page + section headers (Overview: H1 24, H2 22, H3 20)
  h1:           { fontSize: 24, fontWeight: 800, color: '#0f0f13', letterSpacing: '-0.6px', lineHeight: 1.1 },
  h2:           { fontSize: 22, fontWeight: 800, color: '#0f0f13', letterSpacing: '-0.5px' },
  h3:           { fontSize: 20, fontWeight: 800, color: '#0f0f13', letterSpacing: '-0.5px' },

  // Uppercase labels
  sectionLabel: { fontSize: 11, fontWeight: 600, color: '#9595a4', textTransform: 'uppercase', letterSpacing: '0.06em' },  // card-level label ("KEYWORD RESEARCH") — neutral grey (matches Overview); red is semantic only, don't spray it on utility eyebrows
  sectionHint:  { fontSize: 11, fontWeight: 500, color: '#9595a4' },                                                       // right-aligned hint text
  innerLabel:   { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' },                    // inside sub-blocks (needs + color)
  statLabel:    { fontSize: 11, fontWeight: 500, color: '#9595a4', textTransform: 'uppercase', letterSpacing: '0.05em' },  // Overview Stat label

  // Descriptions
  cardDesc:     { fontSize: 13, color: '#9595a4', lineHeight: 1.55 },

  // Body text
  bodyBold:     { fontSize: 14, fontWeight: 700, color: '#0f0f13', lineHeight: 1.55, letterSpacing: '-0.1px' },
  body:         { fontSize: 13.5, fontWeight: 500, color: '#4a4a58', lineHeight: 1.65 },
  innerText:    { fontSize: 13.5, fontWeight: 500, color: '#0f0f13', lineHeight: 1.72 },                                   // inside InsightCard-style sub-blocks

  // Pills / chips / badges
  pill:         { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' },                    // severity + vol/comp
  countBadge:   { fontSize: 11, fontWeight: 700, color: '#9595a4', background: '#f1f1f6', padding: '2px 8px', borderRadius: 20, border: '1px solid #e6e6ec' },
  chip:         { fontSize: 12, fontWeight: 500, color: '#4a4a58', background: '#fafafb', padding: '5px 11px', borderRadius: 20, border: '1px solid #e6e6ec', cursor: 'pointer', letterSpacing: '-0.05px', transition: 'all 0.15s', display: 'inline-block' },

  // Numbers
  numberLg:     { fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.2px' },            // score numbers

  // Tables (Overview uses 10.5/600 in Score breakdown headers)
  tableHeader:  { fontSize: 10.5, fontWeight: 600, color: '#9595a4', textTransform: 'uppercase', letterSpacing: '0.06em' },
  keyword:      { fontSize: 13.5, fontWeight: 600, color: '#0f0f13', letterSpacing: '-0.1px' },
}

const VIRAL_FORMATS = [
  { key: 'survival_challenge',  hook: 'curiosity',      color: '#d97706', label: 'Survival / Time Challenge', example: 'I Survived 24 Hours With [Person/Situation]',        why: 'Extreme curiosity + suspense.' },
  { key: 'extreme_comparison',  hook: 'contrarian',     color: '#d97706', label: 'Extreme Comparison',        example: '$5 VS $500 [Subject]: Honest Review',                 why: 'Price contrast triggers value-seeking.' },
  { key: 'authority_warning',   hook: 'curiosity',      color: '#d97706', label: 'Authority / Warning',       example: "Don't Buy [Subject] Until You See This",              why: 'Fear of mistake drives high CTR.' },
  { key: 'listicle',            hook: 'transformation', color: '#d97706', label: 'Listicle / Structure',      example: '7 Things I Wish I Knew About [Subject]',             why: 'Numbers set clear expectations.' },
  { key: 'curiosity_gap',       hook: 'curiosity',      color: '#d97706', label: 'Curiosity Gap',             example: "I Tested Every [Subject] So You Don't Have To",      why: 'Open loop viewer must click to close.' },
  { key: 'aspirational',        hook: 'transformation', color: '#d97706', label: 'Aspirational / How I',      example: 'How I Grew [Subject] From 0 to [Number] in [Time]',  why: 'Transformation stories = highest retention.' },
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

function fmtNum(n) {
  if (n == null) return '—'
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

// Stats card — matches Dashboard's Stat component 1:1 (same padding, shadow, type scale).
// Optional verdict pill matches Overview's Content-Patterns verdict pattern.
function MiniStat({ label, value, sub, accent, verdict, verdictGood }) {
  const col = accent || C.text1
  const pillColor = verdictGood === true ? '#059669' : verdictGood === false ? '#e5251b' : '#d97706'
  const pillBdr   = verdictGood === true ? 'rgba(5,150,105,0.28)' : verdictGood === false ? 'rgba(229,37,27,0.28)' : 'rgba(217,119,6,0.28)'
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e6e6ec',
      borderRadius: 16,
      padding: '22px 24px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.2s, transform 0.2s',
    }}>
      <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.text3, marginBottom: 12 }}>{label}</p>
      <p style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-1.4px', color: col, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: C.text3, fontWeight: 500, marginTop: 10 }}>{sub}</p>}
      {verdict && (
        <span style={{
          display: 'inline-block',
          fontSize: 10, fontWeight: 700,
          color: pillColor,
          background: 'transparent',
          border: `1.5px solid ${pillBdr}`,
          padding: '3px 10px', borderRadius: 999,
          marginTop: 10,
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>{verdict}</span>
      )}
    </div>
  )
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
        <span style={{ fontSize: 10, fontWeight: 700, color: tm.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d.label}</span>
        <span style={{ fontSize: 12, color: C.text3, fontWeight: 400 }}>{d.why_it_works}</span>
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
  const [intentOptions, setIntentOptions]     = useState(saved.intentOptions || null)
  const [selectedKeyword, setSelectedKeyword] = useState(saved.selectedKeyword || '')
  // Monotonic request id — latest submit wins; older responses are ignored (race-condition guard).
  const reqIdRef = useRef(0)

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

  // Clear the intent picker when the user edits the title — the picker was built for the previous title.
  // Skip the first run on mount so a restored intentOptions from localStorage doesn't get wiped immediately.
  const titleEditSinceMount = useRef(false)
  useEffect(() => {
    if (!titleEditSinceMount.current) { titleEditSinceMount.current = true; return }
    if (intentOptions !== null) setIntentOptions(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title])

  useEffect(() => {
    // Don't persist state while a request is in flight — setResult(null) at submit start would otherwise overwrite a good previous result with null.
    if (loading || loadingIntent) return
    saveToDisk({ title, result, selectedTitle, currentDesc, descResult, intentOptions, selectedKeyword })
  }, [title, result, loading, loadingIntent, selectedTitle, currentDesc, descResult, intentOptions, selectedKeyword])

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
    if (loadingIntent || loading) return  // guard against double-submit (Enter + click)
    const myId = ++reqIdRef.current
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
      if (myId !== reqIdRef.current) return  // stale — a newer submit started, ignore this response
      const data = await res.json()
      if (myId !== reqIdRef.current) return
      if (!res.ok || !data.options?.length) {
        setLoadingIntent(false)
        await runAnalysis('', myId)
        return
      }
      setIntentOptions(data.options)
    } catch {
      if (myId !== reqIdRef.current) return
      setLoadingIntent(false)
      await runAnalysis('', myId)
      return
    } finally {
      if (myId === reqIdRef.current) setLoadingIntent(false)
    }
  }

  async function runAnalysis(keyword, existingId) {
    // Use existing request id when chained from handleSubmitTitle, else start a new one.
    const myId = existingId != null ? existingId : ++reqIdRef.current
    if (existingId == null && loading) return
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
      if (myId !== reqIdRef.current) return
      const data = await res.json()
      if (myId !== reqIdRef.current) return
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      setResult(data)
      setIntentOptions(null)
    } catch {
      if (myId !== reqIdRef.current) return
      setError('Could not reach the server.')
    } finally {
      if (myId === reqIdRef.current) setLoading(false)
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
    <div style={{
      // Negative margins cancel the Dashboard panel's 36/40/72 padding so the white bg extends to the scroll container edges.
      // Re-adding identical padding inside keeps content visually in the same place.
      margin: '-36px -40px -72px',
      padding: '36px 40px 72px',
      background: '#ffffff',
      minHeight: 'calc(100vh - 52px)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Header — matches Overview page H1: 24/800/-0.6px. Icon: elevated gradient badge (same visual DNA as intent route badges). */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
            boxShadow: '0 6px 18px rgba(229,37,27,0.38), inset 0 1px 0 rgba(255,255,255,0.28)',
            flexShrink: 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M12 2.5l2.1 6.3 6.3 2.1-6.3 2.1L12 19.3l-2.1-6.3L3.6 10.9l6.3-2.1z"/>
            </svg>
          </span>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 6, lineHeight: 1.1 }}>SEO Optimizer</h1>
            <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.4 }}>Your title against live competitor data — 3 AI alternatives, plus a matching description.</p>
          </div>
        </div>
        {(title || result) && (
          <button onClick={handleClear} className="seo-btn" style={{ flexShrink: 0 }}>
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

          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <button onClick={handleSubmitTitle} disabled={loading || loadingIntent || !title.trim()}
              className="seo-btn-primary" style={{ fontSize: 13, padding: '11px 22px' }}>
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
            {/* Indeterminate progress bar — clearly signals "work in progress" during intent + analyze calls */}
            {(loading || loadingIntent) && (
              <div style={{ width: '100%', height: 3, background: 'rgba(229,37,27,0.12)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: '45%', height: '100%', background: C.red, borderRadius: 99, animation: 'seoLoadingSlide 1.4s ease-in-out infinite' }}/>
              </div>
            )}
          </div>
        </div>

        {/* ── Row 2: 2-col — Preview on YouTube | Start from a format ────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>

          {/* Preview on YouTube — compact mode when everything fits (3 identical rows is noise); detailed rows kick in only when a surface actually cuts. */}
          {(() => {
            const surfaces = [
              { label: 'Suggested feed', maxChars: 45 },
              { label: 'Mobile search',  maxChars: 55 },
              { label: 'Desktop search', maxChars: 70 },
            ]
            const anyCut = title.trim() && surfaces.some(s => title.length > s.maxChars)
            return (
          <div className="seo-glass-card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Preview on YouTube</span>
              <span style={{ fontSize: 11, color: C.text3, whiteSpace: 'nowrap' }}>
                {title.trim() ? (anyCut ? 'check truncation' : 'all surfaces') : '3 surfaces'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!title.trim() ? (
                <div style={{ padding: '44px 20px', background: '#fafafb', border: '1px dashed #e6e6ec', borderRadius: 12 }}>
                  <p style={{ fontSize: 13, color: C.text3, textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
                    Type a title to see how it renders<br/>in Suggested feed, Mobile &amp; Desktop search.
                  </p>
                </div>
              ) : !anyCut ? (
                // Compact "all fit" mode — one hero row + 3 small surface chips, no redundant title triple-print.
                <div style={{
                  background: C.greenBg,
                  border: `1px solid ${C.greenBdr}`,
                  borderLeft: `3px solid ${C.green}`,
                  borderRadius: '0 12px 12px 0',
                  padding: '16px 18px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polyline points="3,8.5 6.5,12 13,4"/>
                    </svg>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: '#065f46', letterSpacing: '-0.1px', margin: 0 }}>
                      Fits all 3 YouTube surfaces
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                    {surfaces.map(s => (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontSize: 11 }}>
                        <span style={{ fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
                        <span style={{ color: C.text3, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{title.length}/{s.maxChars}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Detailed mode — only when a surface actually truncates. Each row shows exactly how the title gets cut.
                surfaces.map(({ label, maxChars }) => {
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
                        <span style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
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
                        <p style={{ fontSize: 12, color: C.amber, marginTop: 7, fontWeight: 500, letterSpacing: '-0.05px' }}>
                          +{title.length - maxChars} chars over {maxChars}
                        </p>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
            )
          })()}

          {/* Start from a format — neutral tile; amber retained only on the numbered badge + label (one accent per tile, not three). */}
          <div className="seo-glass-card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Start from a format</span>
              <span style={{ fontSize: 11, color: C.text3, whiteSpace: 'nowrap' }}>6 patterns · click to use</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
              {VIRAL_FORMATS.map((fmt, i) => (
                <button key={fmt.key} onClick={() => setTitle(fmt.example)} className="seo-format-card"
                  style={{
                    textAlign: 'left',
                    padding: '12px 14px 14px',
                    background: '#ffffff',
                    border: '1px solid #e6e6ec',
                    borderRadius: 12,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6,
                      background: fmt.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#ffffff', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{i + 1}</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: fmt.color, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1 }}>{fmt.label}</span>
                  </div>
                  <p style={{ fontSize: 13, color: C.text1, fontWeight: 500, lineHeight: 1.5, margin: 0, letterSpacing: '-0.1px' }}>{fmt.example}</p>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Intent picker — "Three directions" moment. Cinematic header, 3 route tiles, amber route badges. */}
      {intentOptions && !loading && !result && (
        <div style={{ marginBottom: 16, marginTop: 40 }}>
          {/* Header — centered, feels like a beat in the flow */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={C.red} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2v12M2 8h12M4 4l8 8M12 4l-8 8"/>
              </svg>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: C.red, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Three directions</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text1, letterSpacing: '-0.55px', lineHeight: 1.2, marginBottom: 10 }}>
              Your title could go <span style={{ color: C.red }}>3 ways</span>. Pick one.
            </h2>
            <p style={{ fontSize: 13.5, color: C.text3, lineHeight: 1.6, maxWidth: 540, margin: '0 auto' }}>
              Same words, different worlds. Pick the closest — that's the audience we'll analyze.
            </p>
          </div>

          {/* 3-tile route grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
            {intentOptions.map((opt, i) => (
              <button key={i} className="seo-route-card" onClick={() => handleSelectIntent(opt.keyword)}>
                {/* Route badge + eyebrow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, position: 'relative' }}>
                  <div className="seo-route-badge" style={{
                    width: 38, height: 38, borderRadius: 12,
                    background: `linear-gradient(135deg, ${C.red} 0%, #b91c1c 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 10px rgba(229,37,27,0.40), inset 0 1px 0 rgba(255,255,255,0.30)`,
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.4px' }}>
                      0{i + 1}
                    </span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.red, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    Route 0{i + 1}
                  </span>
                </div>

                {/* Niche title */}
                <p style={{ fontSize: 16, fontWeight: 700, color: C.text1, letterSpacing: '-0.3px', lineHeight: 1.35, marginBottom: 10, position: 'relative' }}>
                  {opt.label}
                </p>

                {/* Keyword as red-tinted pill */}
                <span style={{
                  alignSelf: 'flex-start',
                  fontSize: 11.5, fontWeight: 600,
                  color: '#9a1c16',
                  background: 'rgba(229,37,27,0.08)',
                  border: '1px solid rgba(229,37,27,0.22)',
                  padding: '3px 10px', borderRadius: 999,
                  marginBottom: 12,
                  position: 'relative',
                }}>
                  {opt.keyword}
                </span>

                {/* Description */}
                <p style={{ fontSize: 12.5, color: C.text3, lineHeight: 1.55, flex: 1, position: 'relative' }}>
                  {opt.description}
                </p>

                {/* Go footer */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}`, position: 'relative' }}>
                  <span className="seo-route-go" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.1px' }}>
                    Go this way
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M6 3l5 5-5 5"/>
                    </svg>
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Escape hatch — centered ghost pill */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <button onClick={() => runAnalysis('')} className="seo-btn">
              None of these — let AI decide
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="seo-result-section">
          {/* ── Section header — mirrors Overview "Channel audit" H2 (marginTop 40, Dashboard.jsx:2069) ───── */}
          <div style={{ marginBottom: 20, marginTop: 40 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Title analysis</h2>
            {result.primary_phrase ? (
              <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>
                Analysed against{' '}
                <span style={{ color: C.text2, fontWeight: 600 }}>{result.videos_found} live YouTube {result.videos_found === 1 ? 'video' : 'videos'}</span>{' '}
                in the{' '}
                <span style={{ color: C.text2, fontWeight: 600 }}>&ldquo;{result.primary_phrase}&rdquo;</span>{' '}
                niche{result.intent_matched > 0 && result.intent_matched < result.videos_found ? ` · ${result.intent_matched} exact match` : ''}
                {' — 3 titles written from the gap, not keyword formulas.'}
              </p>
            ) : (
              <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>AI suggestions for your title.</p>
            )}
          </div>

          {/* ── Title Scorecard hero — ScoreRing + AI verdict, mirrors Overview's Summary card (Dashboard.jsx:2076) ── */}
          {result.suggestions?.length > 0 && (() => {
            const sugAvg = (s) => {
              const vals = [s.seo_score, s.ctr_score, s.hook_score].filter(v => v > 0)
              return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
            }
            const bestSug = [...result.suggestions].sort((a, b) => sugAvg(b) - sugAvg(a))[0]
            const bestAvg = sugAvg(bestSug)
            const compAvg = result.top_videos?.length
              ? Math.round(result.top_videos.reduce((s, v) => s + (v.seo_score || 0), 0) / result.top_videos.length)
              : null
            const delta = compAvg != null ? bestAvg - compAvg : null
            const strongEntry = [['SEO', bestSug.seo_score || 0], ['CTR appeal', bestSug.ctr_score || 0], ['hook', bestSug.hook_score || 0]]
              .filter(([_, v]) => v > 0)
              .sort((a, b) => b[1] - a[1])
            const strongest = strongEntry[0]
            const weakest = strongEntry[strongEntry.length - 1]
            const beatVerdict = delta == null
              ? ''
              : delta > 0
                ? `beating the competitor average of ${compAvg} by ${delta} points`
                : delta < 0
                  ? `trailing the competitor average of ${compAvg} by ${Math.abs(delta)} points`
                  : `matching the competitor average of ${compAvg}`
            return (
              <div style={{
                background: '#ffffff', border: '1px solid #e6e6ec', borderRadius: 16,
                padding: '28px 32px', marginBottom: 20,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
                  {/* Ring — left */}
                  <div style={{ flexShrink: 0, textAlign: 'center' }}>
                    <ScoreRing score={bestAvg} />
                    <p style={{ fontSize: 11, color: C.text3, fontWeight: 500, marginTop: 4, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Title score</p>
                    {delta != null && delta !== 0 && (
                      <p style={{ fontSize: 11, fontWeight: 700, color: delta > 0 ? C.green : C.red, marginTop: 3 }}>
                        {delta > 0 ? '▲' : '▼'} {Math.abs(delta)} vs competitor avg
                      </p>
                    )}
                  </div>
                  {/* Divider */}
                  <div style={{ width: 1, alignSelf: 'stretch', background: C.border, flexShrink: 0 }}/>
                  {/* Verdict text */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>AI verdict</p>
                    <p style={{ fontSize: 14, color: C.text1, lineHeight: 1.85 }}>
                      Your strongest AI option scores <span style={{ fontWeight: 700, color: bestAvg >= 75 ? C.green : bestAvg >= 55 ? C.amber : C.red }}>{bestAvg}</span>
                      {beatVerdict && <> — {beatVerdict}</>}.
                      {strongest && weakest && strongest[0] !== weakest[0] && (
                        <> Strongest on <span style={{ fontWeight: 700, color: C.text1 }}>{strongest[0].toLowerCase()}</span> ({strongest[1]}); room to grow on <span style={{ fontWeight: 700, color: C.text1 }}>{weakest[0].toLowerCase()}</span> ({weakest[1]}).</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* ── Stats row — 4 cards with semantic verdict pills (mirrors Overview's Content Patterns verdict style) ───── */}
          {(() => {
            const compCount = result.videos_found || 0
            const compVerdict  = compCount === 0 ? null : compCount >= 30 ? 'Crowded niche' : compCount >= 10 ? 'Active space' : 'Niche opening'
            const compGood     = compCount === 0 ? null : compCount >= 30 ? false : compCount >= 10 ? null : true
            const exactVerdict = result.intent_matched > 0 ? 'Direct rivals' : 'Broader scope'
            const exactGood    = result.intent_matched > 0 ? false : null
            const kwCount = result.keyword_scores?.length || 0
            const kwVerdict = kwCount >= 10 ? 'Good spread' : kwCount >= 5 ? 'Workable' : kwCount > 0 ? 'Limited' : null
            const kwGood    = kwCount >= 10 ? true : kwCount >= 5 ? null : false
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 24 }}>
                <MiniStat label="Competitors"     value={fmtNum(compCount)}
                  sub="live YouTube results"
                  verdict={compVerdict} verdictGood={compGood} />
                <MiniStat label="Exact match"     value={result.intent_matched > 0 ? fmtNum(result.intent_matched) : '—'}
                  sub={result.intent_matched > 0 ? 'matching your angle' : 'broader niche scope'}
                  verdict={exactVerdict} verdictGood={exactGood} />
                <MiniStat label="AI alternatives" value={result.suggestions?.length || 0}
                  sub="new titles to choose"
                  verdict={result.suggestions?.length >= 3 ? 'Ready to pick' : null} verdictGood={result.suggestions?.length >= 3 ? true : null} />
                <MiniStat label="Keyword opps"    value={kwCount}
                  sub="related phrases scored"
                  verdict={kwVerdict} verdictGood={kwGood} />
              </div>
            )
          })()}

          {/* AI suggestion error */}
          {result.suggestion_error && !result.suggestions?.length && (
            <div style={{ background: C.amberBg, border: `1px solid ${C.amberBdr}`, borderLeft: `3px solid ${C.amber}`, borderRadius: '0 12px 12px 0', padding: '14px 18px', marginBottom: 24 }}>
              <p style={{ ...T.innerLabel, color: C.amber, marginBottom: 6 }}>AI suggestions unavailable</p>
              <p style={T.innerText}>{result.suggestion_error}</p>
            </div>
          )}

          {/* ── Search intent analysis — TWO side-by-side cards, mirrors Overview's
                "Quick wins + Biggest risk / What's working" pattern (Dashboard.jsx:2209-2260).
                Each column owns its own dividers, so row alignment across columns is a non-problem. ── */}
          {result.intent_analysis?.search_intent && (() => {
            const roleLabel = (color) => ({
              fontSize: 11, fontWeight: 700, color, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8,
            })
            const roleBody = { fontSize: 14, color: C.text1, lineHeight: 1.7 }
            const roleBodyMuted = { fontSize: 14, color: C.text2, lineHeight: 1.7 }
            const subBlock = { paddingTop: 16, marginTop: 16, borderTop: `1px solid ${C.border}` }

            const hasGap = !!result.intent_analysis.gap_opportunity
            const hasKeywords = result.intent_analysis.top_keywords?.length > 0
            const hasOverused = !!result.intent_analysis.overused_angle

            return (
              <div style={{ marginBottom: 24, marginTop: 40 }}>
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Search intent analysis</h2>
                  <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>What the audience wants · and the angle competitors are missing</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'stretch' }}>
                  {/* LEFT — Who it's for (all-grey eyebrows; this side is descriptive, not actionable) */}
                  <div className="seo-glass-card" style={{ borderRadius: 16, padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
                    <div>
                      <p style={roleLabel(C.text3)}>Search intent</p>
                      <p style={roleBody}>{result.intent_analysis.search_intent}</p>
                    </div>
                    <div style={subBlock}>
                      <p style={roleLabel(C.text3)}>Who's searching</p>
                      <p style={roleBodyMuted}>{result.intent_analysis.viewer_profile}</p>
                    </div>
                    <div style={subBlock}>
                      <p style={roleLabel(C.text3)}>Emotional driver</p>
                      <p style={roleBodyMuted}>{result.intent_analysis.emotional_driver}</p>
                    </div>
                    {hasKeywords && (
                      <div style={subBlock}>
                        <p style={roleLabel(C.text3)}>Top keywords in competitor titles</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                          {result.intent_analysis.top_keywords.map(kw => (
                            <span key={kw} onClick={() => setTitle(kw)} style={T.chip}
                              onMouseEnter={e => { e.currentTarget.style.background = '#f1f1f6'; e.currentTarget.style.borderColor = 'rgba(229,37,27,0.25)'; e.currentTarget.style.color = C.text1 }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#fafafb'; e.currentTarget.style.borderColor = '#e6e6ec'; e.currentTarget.style.color = C.text2 }}>{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT — The actionable side. Two semantic colors only: green for opportunity, red for warning. */}
                  <div className="seo-glass-card" style={{ borderRadius: 16, padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
                    {hasGap ? (
                      <div>
                        <p style={roleLabel(C.green)}>Gap opportunity — what competitors aren't doing</p>
                        <p style={roleBody}>{result.intent_analysis.gap_opportunity}</p>
                      </div>
                    ) : (
                      <div>
                        <p style={roleLabel(C.text3)}>Angle to take</p>
                        <p style={roleBodyMuted}>Explore the full keyword list below — every phrase is a different angle.</p>
                      </div>
                    )}
                    {hasOverused && (
                      <div style={subBlock}>
                        <p style={roleLabel(C.red)}>Overused angle — avoid framing it this way</p>
                        <p style={roleBodyMuted}>{result.intent_analysis.overused_angle}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* AI-Suggested Titles — H2+subtitle header pattern (matches Overview). */}
          {result.suggestions?.length > 0 && (
            <div style={{ marginBottom: 24, marginTop: 40 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Suggested titles</h2>
                  <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>
                    {result.suggestions.length} AI alternatives · pick one to generate a matching description
                  </p>
                </div>
                <button onClick={() => handleSelectTitle(title.trim())} className="seo-btn" style={{ flexShrink: 0 }}>
                  Use my original title →
                </button>
              </div>
              {/* Compact stacked cards — mirror Overview's InsightCard. One color per number: amber. */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.suggestions.map((s, i) => {
                  const hookLabel = s.hook === 'transformation' ? 'Transformation'
                                  : s.hook === 'contrarian'     ? 'Contrarian'
                                  : 'Curiosity / FOMO'
                  const hookDesc  = s.hook === 'transformation' ? 'Focuses on the outcome or result'
                                  : s.hook === 'contrarian'     ? "Challenges assumptions — what others don't show"
                                  : "Makes viewers feel they're missing something"
                  const avgScore = Math.round(((s.seo_score || 0) + (s.ctr_score || 0) + (s.hook_score || 0)) / Math.max(1, [s.seo_score, s.ctr_score, s.hook_score].filter(v => v > 0).length))
                  const sevLabel = avgScore >= 75 ? 'Strong' : avgScore >= 55 ? 'Solid' : 'Weak'
                  const sevColor = avgScore >= 75 ? C.green : avgScore >= 55 ? C.amber : C.red
                  const isSelected = selectedTitle === s.title
                  return (
                    <div key={i} className="seo-suggestion-card" style={{
                      marginBottom: 0,
                      borderTop: `3px solid ${sevColor}`,
                      borderColor: isSelected ? 'rgba(229,37,27,0.30)' : copied === i ? 'rgba(5,150,105,0.30)' : '#e6e6ec',
                      background: isSelected ? '#fff8f8' : copied === i ? '#f6fdf9' : '#ffffff',
                    }}>
                      <div style={{ padding: '16px 22px 18px' }}>
                        {/* Header — rank badge (amber) + hook eyebrow/title + severity pill */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                          <div style={{ width: 26, height: 26, borderRadius: 8, background: C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>{hookLabel}</p>
                            <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, lineHeight: 1.55 }}>{s.title}</p>
                            <p style={{ fontSize: 11, color: C.text3, fontVariantNumeric: 'tabular-nums', fontWeight: 500, marginTop: 4 }}>
                              {s.length} chars{s.length >= 50 && s.length <= 70 ? ' · ideal 50–70' : s.length > 70 ? ' · over 70' : ' · under 50'}
                            </p>
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: sevColor, padding: '3px 9px', borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase', border: `1.5px solid ${sevColor}`, flexShrink: 0 }}>
                            {sevLabel}
                          </span>
                        </div>

                        {/* Divider aligned with title start */}
                        <div style={{ height: 1, background: C.border, marginBottom: 14, marginLeft: 38 }} />

                        {/* Body grid — Why-it-works (blue tint, Overview's Why-now pattern) + Scores (amber left bar, amber numbers) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 8, marginLeft: 38 }}>
                          <div style={{ background: '#fafafb', border: '1px solid #eeeef3', borderRadius: 10, padding: '12px 14px' }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Why it works</p>
                            <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.72 }}>{s.why_it_works || hookDesc}</p>
                          </div>
                          <div style={{
                            background: '#ffffff',
                            border: `1px solid ${C.border}`,
                            borderLeft: `3px solid ${sevColor}`,
                            borderRadius: '0 10px 10px 0',
                            padding: '12px 16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: sevColor, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Scores</p>
                            <div style={{ display: 'flex', gap: 18, alignItems: 'baseline', flexWrap: 'wrap' }}>
                              {[['SEO', s.seo_score], ['CTR', s.ctr_score], ['Hook', s.hook_score]].map(([label, val]) => {
                                const vc = val >= 75 ? C.green : val >= 55 ? C.amber : C.red
                                return (
                                  <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                                    <span style={{ fontSize: 10, fontWeight: 600, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
                                    <span style={{ fontSize: 16, fontWeight: 700, color: val ? vc : C.text3, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.2px' }}>{val || '—'}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Action row — right-aligned */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14, marginLeft: 38 }}>
                          <button onClick={() => copyTitle(s.title, i)}
                            style={{ fontSize: 12.5, fontWeight: 600, color: copied === i ? C.green : C.text2, background: '#ffffff', border: `1px solid ${copied === i ? 'rgba(5,150,105,0.38)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 100, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
                            {copied === i ? '✓ Copied' : 'Copy'}
                          </button>
                          <button onClick={() => handleSelectTitle(s.title)}
                            style={{ fontSize: 12.5, fontWeight: 700, color: isSelected ? C.red : '#ffffff', background: isSelected ? 'rgba(229,37,27,0.08)' : '#e5251b', border: `1px solid ${isSelected ? 'rgba(229,37,27,0.25)' : 'transparent'}`, borderRadius: 100, padding: '8px 18px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s', boxShadow: isSelected ? 'none' : '0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32)', whiteSpace: 'nowrap', letterSpacing: '-0.1px' }}>
                            {isSelected ? '✓ Selected' : 'Use this title →'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              3 STACKED CARDS — identical shell, hairline-divider header,
              shared typography. Pattern borrowed from Overview's Priority
              Actions section (one card per concept, neat vertical rhythm).
              ═══════════════════════════════════════════════════════════════ */}

          {/* ── Card 1: Keyword research — 2-col inner grid, phrase + bar + score (Overview Category Scores pattern, exact) ── */}
          {result.keyword_scores?.length > 0 && (
            <>
              <div style={{ marginBottom: 20, marginTop: 40 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Keyword research</h2>
                <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>
                  {result.keyword_scores.length} related phrases · click any to use as title · sorted by score
                </p>
              </div>
              <div className="seo-glass-card" style={{ borderRadius: 16, padding: '22px 24px', marginBottom: 24 }}>
              {/* 2-col grid mirrors Dashboard.jsx:2106 exactly — gap '14px 40px', no row bg / no padding */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 40px' }}>
                {result.keyword_scores.map((kw) => {
                  const scColor = kw.score >= 75 ? C.green : kw.score >= 55 ? C.amber : C.red
                  return (
                    <div key={kw.phrase} className="seo-kw-row"
                      role="button" tabIndex={0}
                      onClick={() => setTitle(kw.phrase)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTitle(kw.phrase) } }}
                      title={`Volume ${kw.volume} · Competition ${kw.competition} · Score ${kw.score} — click to use as title`}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      {/* phrase: 13/400/text2 — same weight as Overview's category label */}
                      <span className="seo-kw-phrase" style={{ fontSize: 13, color: C.text2, fontWeight: 400, width: 180, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.12s' }}>{kw.phrase}</span>
                      {/* bar: 4px tall, flex:1 — identical to Overview's progress bar */}
                      <div style={{ flex: 1, height: 4, background: '#eeeef3', borderRadius: 99, overflow: 'hidden', minWidth: 40 }}>
                        <div style={{ width: `${kw.score}%`, height: '100%', background: scColor, borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}/>
                      </div>
                      {/* value: 13/700/color — identical to Overview's category value */}
                      <span style={{ fontSize: 13, fontWeight: 700, color: scColor, fontVariantNumeric: 'tabular-nums', minWidth: 26, textAlign: 'right', flexShrink: 0 }}>{kw.score}</span>
                    </div>
                  )
                })}
              </div>
              </div>
            </>
          )}

          {/* ── Card 2: YouTube autocomplete (chip row) ── */}
          {result.autocomplete_terms?.length > 0 && (
            <>
              <div style={{ marginBottom: 20, marginTop: 40 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>YouTube autocomplete</h2>
                <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>
                  {result.autocomplete_terms.length} real searches people type · click to use as your title
                </p>
              </div>
              <div className="seo-glass-card" style={{ borderRadius: 16, padding: '22px 24px', marginBottom: 24 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.autocomplete_terms.map(t => (
                  <span key={t}
                    role="button" tabIndex={0}
                    onClick={() => setTitle(t)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTitle(t) } }}
                    style={{ ...T.chip, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f1f1f6'; e.currentTarget.style.borderColor = 'rgba(229,37,27,0.25)'; e.currentTarget.style.color = C.text1 }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fafafb'; e.currentTarget.style.borderColor = '#e6e6ec'; e.currentTarget.style.color = C.text2 }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" style={{ flexShrink: 0, opacity: 0.55 }}>
                      <circle cx="5" cy="5" r="3.2"/><path d="M7.3 7.3L10 10"/>
                    </svg>
                    {t}
                  </span>
                ))}
              </div>
              </div>
            </>
          )}

          {/* ── Card 3: Suggested tags ── */}
          {result.top_tags?.length > 0 && (
            <>
              <div style={{ marginBottom: 20, marginTop: 40, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Suggested tags</h2>
                  <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>
                    {result.top_tags.length} tags pulled from ranking competitors · click one to copy, or copy all
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.top_tags.join(', '))
                    setCopiedTags(true)
                    setTimeout(() => setCopiedTags(false), 1800)
                  }}
                  className="seo-btn"
                  style={{ flexShrink: 0, color: copiedTags ? C.green : undefined, borderColor: copiedTags ? 'rgba(5,150,105,0.38)' : undefined }}>
                  {copiedTags ? '✓ Copied all' : 'Copy all'}
                </button>
              </div>
              <div className="seo-glass-card" style={{ borderRadius: 16, padding: '22px 24px', marginBottom: 24 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.top_tags.map(tag => {
                  const inTitle = title.toLowerCase().includes(tag.toLowerCase())
                  return (
                    <span key={tag}
                      role="button" tabIndex={0}
                      onClick={() => { navigator.clipboard.writeText(tag) }}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigator.clipboard.writeText(tag) } }}
                      title={inTitle ? 'Already in your title — click to copy' : 'Click to copy'}
                      style={{
                        ...T.chip,
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        color: inTitle ? C.green : C.text2,
                        background: inTitle ? 'rgba(5,150,105,0.07)' : '#fafafb',
                        border: `1px solid ${inTitle ? 'rgba(5,150,105,0.25)' : '#e6e6ec'}`,
                        fontWeight: inTitle ? 600 : 500,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = inTitle ? 'rgba(5,150,105,0.45)' : '#d0d0d8' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = inTitle ? 'rgba(5,150,105,0.25)' : '#e6e6ec' }}>
                      {inTitle ? (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <polyline points="1.5,6.5 5,10 10.5,2"/>
                        </svg>
                      ) : (
                        <span style={{ color: C.text4, fontWeight: 500, opacity: 0.8 }}>#</span>
                      )}
                      {tag}
                    </span>
                  )
                })}
              </div>
              </div>
            </>
          )}

          {/* ── Competitor set — the competitor videos we analysed ── */}
          {result.top_videos?.length > 0 && (
            <>
              <div style={{ marginBottom: 20, marginTop: 40 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Competitor set</h2>
                <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>
                  {result.videos_found} {result.videos_found === 1 ? 'video' : 'videos'} we analysed{result.primary_phrase ? ` in the "${result.primary_phrase}" niche` : ''}{result.intent_matched > 0 && result.intent_matched < result.videos_found ? ` · ${result.intent_matched} exact match` : ''}
                </p>
              </div>
              <div className="seo-glass-card" style={{ borderRadius: 16, padding: '22px 24px', marginBottom: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {result.top_videos.map((v, i) => {
                  const sc = v.seo_score
                  const scColor = sc >= 75 ? C.green : sc >= 55 ? C.amber : C.red
                  return (
                    <a key={v.video_id}
                      href={`https://www.youtube.com/watch?v=${v.video_id}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderBottom: i < result.top_videos.length - 1 ? `1px solid ${C.border}` : 'none', textDecoration: 'none', borderRadius: 8, transition: 'background 0.15s, transform 0.15s', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fafafb'; e.currentTarget.style.transform = 'translateX(2px)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none' }}>
                      <span style={{ flexShrink: 0, width: 26, fontSize: 11, fontWeight: 700, color: C.text4, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em', textAlign: 'center' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        {v.thumbnail && <img src={v.thumbnail} alt="" style={{ width: 72, height: 40, borderRadius: 7, objectFit: 'cover', display: 'block' }} />}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s', background: 'rgba(0,0,0,0.45)', borderRadius: 7 }}
                          onMouseEnter={e => { e.currentTarget.style.opacity = 1 }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = 0 }}>
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="white"><path d="M7 5.5l6 3.5-6 3.5V5.5z"/></svg>
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: C.text1, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.1px' }}>{v.title}</p>
                        <p style={{ fontSize: 12, color: C.text3, marginTop: 2, fontWeight: 500 }}>{v.channel}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 17, fontWeight: 700, color: scColor, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.3px', lineHeight: 1 }}>{sc}</p>
                        <p style={{ fontSize: 10, fontWeight: 600, color: C.text3, marginTop: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>score</p>
                      </div>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke={C.text4} strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M2 11L10 3M10 3H5M10 3v5"/></svg>
                    </a>
                  )
                })}
              </div>
            </div>
            </>
          )}

          {/* ── Description Optimizer ── */}
          {selectedTitle && (
            <>
              {/* Section header — mirrors Overview's "Channel audit" H2 pattern (H2 + 1-line muted subtitle) */}
              <div ref={descRef} style={{ marginBottom: 20, marginTop: 40 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Description optimizer</h2>
                <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>
                  3 descriptions for your picked title — each opens with a different hook. Copy the one that fits.
                </p>
              </div>

              <div className="seo-glass-card" style={{ borderRadius: 16, padding: '22px 24px' }}>

              {/* Picked title + Change button */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...T.sectionLabel, marginBottom: 8 }}>Picked title</p>
                  <p style={{ fontSize: 14, color: C.text1, lineHeight: 1.55, fontWeight: 700, letterSpacing: '-0.1px' }}>&ldquo;{selectedTitle}&rdquo;</p>
                </div>
                <button onClick={() => { setSelectedTitle(null); setDescResult(null); setDescError('') }}
                  className="seo-btn" style={{ flexShrink: 0 }}>
                  Change title
                </button>
              </div>

              {!descResult && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', ...T.sectionLabel, marginBottom: 8 }}>
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

                  <button onClick={handleGenerateDesc} disabled={descLoading} className="seo-btn-primary">
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
                    <p style={T.cardDesc}>
                      3 descriptions — each opens with a different hook strategy. Expand to see the full text, then copy.
                    </p>
                    <button onClick={() => { setDescResult(null); setDescError('') }} className="seo-btn" style={{ flexShrink: 0 }}>
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
            </>
          )}
        </div>
      )}
    </div>
  )
}
