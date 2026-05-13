import { useState, useEffect, useRef, useMemo } from 'react'
import { Lightbulb, AlertTriangle, Target, Sparkles, TrendingUp } from 'lucide-react'
import CreditsEmptyModal from '../components/CreditsEmptyModal'
import UpsellModal from '../components/UpsellModal'

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
  @keyframes seoPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.55; transform: scale(0.85); } }
  @keyframes seoFadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
  @keyframes seoArrowFlow {
    0%   { transform: translateX(0); opacity: 0.4; }
    50%  { transform: translateX(6px); opacity: 1; }
    100% { transform: translateX(0); opacity: 0.4; }
  }
  @keyframes seoBarSweep {
    from { width: 0; }
    to   { width: var(--target-w, 100%); }
  }
  @keyframes seoHeroBeat {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.04); }
  }
  @keyframes seoLoadingSlide {
    0%   { transform: translateX(-100%); }
    50%  { transform: translateX(130%); }
    100% { transform: translateX(260%); }
  }
  .seo-result-section { animation: seoFadeUp 0.3s ease both; }

  /* Horizontal scrolling strips inside NicheHeatCard.
     Hide the native scrollbar so the row reads like the VidIQ outlier rows,
     but keep wheel + click-drag scrolling intact. */
  .seo-heat-scroll { scrollbar-width: none; -ms-overflow-style: none; }
  .seo-heat-scroll::-webkit-scrollbar { display: none; height: 0; }

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
    padding: 9px 20px; border-radius: 100px; border: 1px solid #e5251b;
    font-family: 'Inter', system-ui, sans-serif; font-size: 12.5px; font-weight: 600;
    background: #ffffff; color: #e5251b; cursor: pointer;
    box-shadow: 0 1px 3px rgba(229,37,27,0.10), 0 4px 14px rgba(229,37,27,0.10);
    transition: all 0.18s;
    white-space: nowrap;
  }
  .seo-btn:hover {
    background: rgba(229,37,27,0.06);
    box-shadow: 0 2px 8px rgba(229,37,27,0.14), 0 8px 28px rgba(229,37,27,0.14);
    transform: translateY(-1px);
  }
  .seo-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 20px; border-radius: 100px; border: none;
    font-family: 'Inter', system-ui, sans-serif; font-size: 12.5px; font-weight: 700;
    background: #e5251b; color: #ffffff; cursor: pointer;
    box-shadow: 0 1px 2px rgba(229,37,27,0.18);
    transition: filter 0.15s, background 0.15s;
    white-space: nowrap;
  }
  .seo-btn-primary:hover:not(:disabled) {
    filter: brightness(1.07);
  }
  .seo-btn-primary:disabled {
    background: #e0e0e6; color: #ffffff; cursor: not-allowed;
    box-shadow: none; opacity: 0.92;
  }

  /* ── Reports list — mirrors the Competitors tracked accordion pattern ── */
  .seo-report-wrapper { position: relative; margin-bottom: 12px; }
  .seo-report-header {
    background: #ffffff;
    border: 1px solid #e6e6ec;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06);
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: box-shadow 0.15s, border-color 0.15s;
    cursor: pointer;
    user-select: none;
  }
  .seo-report-header:hover {
    box-shadow: 0 2px 6px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08);
    border-color: rgba(0,0,0,0.14);
  }
  .seo-report-remove {
    position: absolute;
    top: 12px; right: 12px;
    width: 28px; height: 28px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    color: #c4c4cc;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    opacity: 0;
    transition: opacity 0.15s, background 0.15s, color 0.15s, border-color 0.15s;
    z-index: 2;
  }
  .seo-report-wrapper:hover .seo-report-remove { opacity: 1; }
  .seo-report-remove:hover {
    background: rgba(229,37,27,0.08);
    border-color: rgba(229,37,27,0.2);
    color: #e5251b;
  }
  .seo-report-cta {
    background: #e5251b;
    color: #fff;
    border: 1px solid #e5251b;
    border-radius: 100px;
    padding: 8px 15px;
    font-size: 12.5px; font-weight: 700;
    font-family: 'Inter', system-ui, sans-serif;
    cursor: pointer;
    white-space: nowrap;
    transition: filter 0.15s, background 0.15s;
    display: flex; align-items: center; gap: 6px;
    box-shadow: 0 1px 2px rgba(229,37,27,0.18);
    letter-spacing: -0.1px;
  }
  .seo-report-cta:hover { filter: brightness(1.07); }
  .seo-report-chip {
    display: inline-flex; align-items: baseline; gap: 4px;
    background: #f4f4f6;
    border: 1px solid rgba(0,0,0,0.09);
    border-radius: 8px;
    padding: 4px 10px;
  }
  .seo-report-chip .val { font-size: 12px; font-weight: 700; color: #111114; letter-spacing: '-0.1px'; }
  .seo-report-chip .lbl { font-size: 11px; color: #9595a4; font-weight: 500; }
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

// Brand palette — red + amber + green + charcoal neutrals. No blue / purple / teal / orange.
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

// AI-returned prose comes in raw lowercase, no terminal punctuation, often a
// 60-word run-on. Sentence-case the first letter, ensure it ends with a period,
// and (optionally) clip to one logical clause so headline rows stay scannable.
function sentenceCase(raw) {
  const s = (raw || '').trim().replace(/\s+/g, ' ')
  if (!s) return ''
  const cased = s.charAt(0).toUpperCase() + s.slice(1)
  return /[.!?]$/.test(cased) ? cased : cased + '.'
}
// First clause of a sentence-cased string. Splits on the first hard break
// (semicolon, em-dash, " — ", " - ", " because ", " so that ", " and "), so the
// headline reads as a single punchy line instead of a paragraph.
function firstClause(raw, maxChars = 110) {
  const cased = sentenceCase(raw)
  const cut = cased.split(/;|,?\s+(?:because|so that|so |which |although)\s+|\s+[-–—]\s+/i)[0]
  const trimmed = cut.length > maxChars
    ? cut.slice(0, maxChars).replace(/\s+\S*$/, '') + '…'
    : cut
  return /[.!?…]$/.test(trimmed) ? trimmed : trimmed + (trimmed.length < cased.length ? '…' : '.')
}

// Inline highlight for a keyword inside a body of prose. Case-insensitive,
// returns React fragments so the matched phrase gets a soft red underline.
function highlightKeyword(text, keyword) {
  const t = String(text || '')
  const k = String(keyword || '').trim()
  if (!k || k.length < 3) return t
  const re = new RegExp(`(${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig')
  const parts = t.split(re)
  return parts.map((p, i) =>
    p.toLowerCase() === k.toLowerCase()
      ? <span key={i} style={{ borderBottom: '1px solid rgba(229,37,27,0.45)', color: '#0f0f13', fontWeight: 600 }}>{p}</span>
      : p
  )
}

// Stats card — matches Dashboard.jsx Stat component EXACTLY (label + value + sub, no pill).
// Same padding, shadow, type scale, spacing as Overview's 4-col stat grid.
function MiniStat({ label, value, sub, accent, alert }) {
  const col = alert ? C.red : (accent || C.text1)
  return (
    <div style={{
      background: alert ? '#fff8f8' : '#ffffff',
      border: `1px solid ${alert ? 'rgba(229,37,27,0.22)' : '#e6e6ec'}`,
      borderRadius: 16,
      padding: '22px 24px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.2s, transform 0.2s',
    }}>
      <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.text3, marginBottom: 12 }}>{label}</p>
      <p style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-1.4px', color: col, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: alert ? C.red : C.text3, fontWeight: 500, marginTop: 10 }}>{sub}</p>}
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

// Sub-score color ladder. Matches the suggestion card chip thresholds so
// chip + bars never disagree (75+ green, 55+ amber, else red).
function _subColor(v) { return v >= 75 ? C.green : v >= 55 ? C.amber : C.red }

// One horizontal bar in the score breakdown. Label on the left in fixed
// tabular-aligned column, animated fill in the middle, tabular number on
// the right. Width 0 -> value on mount so the bars sweep in.
function ScoreBar({ label, value, mounted }) {
  const v = Number.isFinite(value) ? value : 0
  const color = _subColor(v)
  const w = mounted ? `${Math.max(2, Math.min(100, v))}%` : '0%'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{
        fontSize: 10, fontWeight: 700, color: C.text3,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        width: 44, flexShrink: 0,
      }}>{label}</span>
      <div style={{
        flex: 1, height: 7, background: '#eef0f4',
        borderRadius: 99, overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          width: w, height: '100%', background: color, borderRadius: 99,
          transition: 'width 0.85s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: v >= 75 ? `0 0 0 1px ${color}22` : 'none',
        }}/>
      </div>
      <span style={{
        fontSize: 13, fontWeight: 800, color: v ? color : C.text3,
        fontVariantNumeric: 'tabular-nums',
        width: 24, textAlign: 'right', flexShrink: 0, letterSpacing: '-0.3px',
      }}>{v || '—'}</span>
    </div>
  )
}

// Stack of three sub-score bars (SEO / CTR / Hook). Replaces the old
// "three huge numbers" block. Scan reads as a real micro-chart, not a
// row of disconnected numerals.
function ScoreBars({ seo, ctr, hook, mounted }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ScoreBar label="SEO"  value={seo}  mounted={mounted}/>
      <ScoreBar label="CTR"  value={ctr}  mounted={mounted}/>
      <ScoreBar label="Hook" value={hook} mounted={mounted}/>
    </div>
  )
}

// Title-length sweet-spot indicator. The full track is 0-100 chars; a
// green "ideal zone" is highlighted between 50-70 (YouTube's CTR sweet
// spot in our backend rubric), and a triangle marker drops on the
// user's actual length. Replaces the "62 chars · ideal 50-70" plain
// text line under each title.
function LengthSweetSpot({ length, mounted }) {
  const MAX = 100
  const ZONE_LO = 50
  const ZONE_HI = 70
  const clamped = Math.max(0, Math.min(MAX, length || 0))
  const inZone  = clamped >= ZONE_LO && clamped <= ZONE_HI
  const markerColor = inZone ? C.green : clamped < ZONE_LO - 10 || clamped > ZONE_HI + 10 ? C.red : C.amber
  const markerLeft  = mounted ? `${(clamped / MAX) * 100}%` : '0%'
  const verdict     = inZone ? 'in the sweet spot' : clamped < ZONE_LO ? 'too short' : 'too long'
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Length</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: markerColor, fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ fontWeight: 800, color: C.text1 }}>{clamped}</span>
          <span style={{ color: C.text3, fontWeight: 500 }}>{' / 100 chars · '}</span>
          {verdict}
        </span>
      </div>
      {/* Track + zone + marker */}
      <div style={{ position: 'relative', height: 14 }}>
        {/* Base track */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 5, height: 4,
          background: '#eef0f4', borderRadius: 99,
        }}/>
        {/* Ideal zone (50-70) */}
        <div style={{
          position: 'absolute',
          left: `${(ZONE_LO / MAX) * 100}%`,
          width: `${((ZONE_HI - ZONE_LO) / MAX) * 100}%`,
          top: 5, height: 4,
          background: 'rgba(5,150,105,0.55)',
          borderRadius: 99,
        }}/>
        {/* Marker (triangle) */}
        <div style={{
          position: 'absolute', top: 0, left: markerLeft,
          width: 0, height: 0, transform: 'translateX(-50%)',
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: `6px solid ${markerColor}`,
          transition: 'left 0.85s cubic-bezier(0.34,1.56,0.64,1)',
          filter: `drop-shadow(0 1px 2px ${markerColor}44)`,
        }}/>
        {/* Marker stem so triangle visually connects to the bar */}
        <div style={{
          position: 'absolute', top: 6, left: markerLeft,
          width: 2, height: 6, background: markerColor, borderRadius: 1,
          transform: 'translateX(-50%)',
          transition: 'left 0.85s cubic-bezier(0.34,1.56,0.64,1)',
        }}/>
      </div>
      {/* Scale labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, fontWeight: 600, color: C.text4, letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums' }}>
        <span>0</span>
        <span style={{ color: C.green }}>50</span>
        <span style={{ color: C.green }}>70</span>
        <span>100</span>
      </div>
    </div>
  )
}

// HD thumbnail ladder — same approach as Autopsy.jsx:333-358 and the
// Video Ideas page. The API URL on `video.thumbnail` is typically the
// 320x180 medium variant, which renders soft at our 200-300px tile
// width on retina. Request maxresdefault.jpg straight from the CDN,
// detect the 120x90 placeholder via naturalWidth, fall to hqdefault,
// then fall to the API URL only as a last resort.
function _seoYtMax(videoId) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : null
}
function _seoAdvanceThumb(target, videoId, fallbackUrl) {
  const step = target.dataset.thumbStep || 'max'
  if (step === 'max' && videoId) {
    target.dataset.thumbStep = 'hq'
    target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  } else if (step !== 'done' && fallbackUrl) {
    target.dataset.thumbStep = 'done'
    target.src = fallbackUrl
  }
}
function _seoThumbOnError(videoId, fallbackUrl) {
  return (e) => _seoAdvanceThumb(e.target, videoId, fallbackUrl)
}
function _seoThumbOnLoad(videoId, fallbackUrl) {
  return (e) => {
    const step = e.target.dataset.thumbStep || 'max'
    if (step === 'max' && e.target.naturalWidth === 120 && e.target.naturalHeight === 90) {
      _seoAdvanceThumb(e.target, videoId, fallbackUrl)
    }
  }
}

// ── NicheHeatCard ──────────────────────────────────────────────────────────
// Page-anchoring hero. VidIQ-style "what's already winning here" surface:
// two horizontal scrolling strips (Winning videos + Winning shorts), each
// thumb carries a red MULTIPLIER pill (e.g. "3.4×") in the top-left so a
// glance tells the user which video is the outlier in this niche. A 4-tile
// stat strip across the bottom anchors the niche size.
//
// Visual DNA: VidIQ Research/Explore (reference_vidiq_design.md) and
// the Feed's PostingConsistencyCard (Dashboard.jsx:2383) for the
// stat-tile strip pattern.

function _relTimeDays(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const days = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (days < 1)   return 'today'
  if (days < 7)   return `${days}d ago`
  if (days < 30)  return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  const yrs = (days / 365).toFixed(1).replace(/\.0$/, '')
  return `${yrs}y ago`
}

function _median(nums) {
  if (!nums.length) return 0
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid]
}

// VidIQ multiplier formatter: "3.4×" if >= 2, "1.2×" with one decimal, "—"
// when the input is meaningless (zero baseline or only one item in the set).
function _fmtMultiplier(views, baseline) {
  if (!views || !baseline || baseline <= 0) return null
  const mult = views / baseline
  if (mult >= 100) return `${Math.round(mult)}×`
  if (mult >= 10)  return `${mult.toFixed(0)}×`
  if (mult >= 2)   return `${mult.toFixed(1).replace(/\.0$/, '')}×`
  if (mult >= 1.1) return `${mult.toFixed(1)}×`
  return null  // 1× or less isn't an outlier, no pill
}

// ── Landscape tile (Winning videos) ──
// 16:9 thumbnail with multiplier pill top-left, view chip bottom-right,
// title (2 lines) + channel + age below. Click opens YouTube.
function VideoTile({ video, baselineViews }) {
  const views = video.view_count || video.views || 0
  const mult  = _fmtMultiplier(views, baselineViews)
  const age   = _relTimeDays(video.published_at || video.publishedAt)
  return (
    <a
      href={video.video_id ? `https://www.youtube.com/watch?v=${video.video_id}` : '#'}
      target="_blank" rel="noopener noreferrer"
      style={{
        textDecoration: 'none', color: 'inherit',
        display: 'flex', flexDirection: 'column', gap: 8,
        width: 200, flexShrink: 0,
      }}>
      {/* Thumbnail — kept clean of overlays except the view chip, which sits in
          the bottom-right where YouTube itself places duration so it never
          collides with creator hooks (which always live top-left). */}
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '16 / 9',
        borderRadius: 9, overflow: 'hidden', background: '#0f0f13',
        boxShadow: '0 1px 3px rgba(0,0,0,0.10), 0 4px 14px rgba(0,0,0,0.08)',
      }}>
        {(video.video_id || video.thumbnail) && (
          <img
            src={video.video_id ? _seoYtMax(video.video_id) : video.thumbnail}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            data-thumb-step="max"
            onError={_seoThumbOnError(video.video_id, video.thumbnail)}
            onLoad={_seoThumbOnLoad(video.video_id, video.thumbnail)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        {/* View chip (bottom-right, YouTube duration zone) */}
        <div style={{
          position: 'absolute', right: 7, bottom: 7,
          padding: '2px 7px', borderRadius: 5,
          background: 'rgba(0,0,0,0.78)',
          color: '#fff', fontSize: 11, fontWeight: 800,
          letterSpacing: '-0.2px', fontVariantNumeric: 'tabular-nums',
        }}>{fmtNum(views)}</div>
      </div>
      <p style={{
        fontSize: 12.5, fontWeight: 600, color: C.text1, lineHeight: 1.35,
        letterSpacing: '-0.1px',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>{video.title}</p>
      {/* Meta line: multiplier pill (only if outlier) inline with channel + age.
          Pill lives below the thumbnail, not on top of it, so creator hooks stay
          fully visible. */}
      <p style={{
        fontSize: 11, color: C.text3, fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: 6,
        whiteSpace: 'nowrap', overflow: 'hidden',
      }}>
        {mult && (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '1px 6px', borderRadius: 99,
            background: C.red, color: '#fff',
            fontSize: 10, fontWeight: 900, letterSpacing: '-0.2px',
            fontVariantNumeric: 'tabular-nums', flexShrink: 0,
          }}>{mult}</span>
        )}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {video.channel || '—'}{age ? ` · ${age}` : ''}
        </span>
      </p>
    </a>
  )
}

// ── Vertical tile (Winning shorts) ──
// 9:16 thumbnail with the view chip bottom-right. Multiplier pill sits
// INLINE with the channel name below the thumbnail (not on top of it),
// so the creator's hook content stays fully visible.
function ShortTile({ video, baselineViews }) {
  const views = video.view_count || video.views || 0
  const mult  = _fmtMultiplier(views, baselineViews)
  return (
    <a
      href={video.video_id ? `https://www.youtube.com/watch?v=${video.video_id}` : '#'}
      target="_blank" rel="noopener noreferrer"
      style={{
        textDecoration: 'none', color: 'inherit',
        display: 'flex', flexDirection: 'column', gap: 6,
        width: 116, flexShrink: 0,
      }}>
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '9 / 16',
        borderRadius: 10, overflow: 'hidden', background: '#0f0f13',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 6px 18px rgba(0,0,0,0.10)',
      }}>
        {(video.video_id || video.thumbnail) && (
          <img
            src={video.video_id ? _seoYtMax(video.video_id) : video.thumbnail}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            data-thumb-step="max"
            onError={_seoThumbOnError(video.video_id, video.thumbnail)}
            onLoad={_seoThumbOnLoad(video.video_id, video.thumbnail)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        <div style={{
          position: 'absolute', right: 6, bottom: 6,
          padding: '2px 6px', borderRadius: 5,
          background: 'rgba(0,0,0,0.78)',
          color: '#fff', fontSize: 10.5, fontWeight: 800,
          letterSpacing: '-0.2px', fontVariantNumeric: 'tabular-nums',
        }}>{fmtNum(views)}</div>
      </div>
      <p style={{
        fontSize: 12, fontWeight: 600, color: C.text1, lineHeight: 1.35,
        letterSpacing: '-0.1px',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{video.title}</p>
      <p style={{
        fontSize: 10.5, color: C.text3, fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: 5,
        whiteSpace: 'nowrap', overflow: 'hidden',
      }}>
        {mult && (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '1px 5px', borderRadius: 99,
            background: C.red, color: '#fff',
            fontSize: 9.5, fontWeight: 900, letterSpacing: '-0.2px',
            fontVariantNumeric: 'tabular-nums', flexShrink: 0,
          }}>{mult}</span>
        )}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {video.channel || '—'}
        </span>
      </p>
    </a>
  )
}

// One horizontal scrolling strip — section eyebrow + scrolling tile list.
// Used for both the Videos and Shorts surfaces inside NicheHeatCard. The
// container hides the native scrollbar but keeps wheel + drag scrolling.
function HeatStrip({ icon, label, count, Tile, items, baselineViews }) {
  if (!items || !items.length) return null
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{
          width: 24, height: 24, borderRadius: 7,
          background: 'rgba(15,15,19,0.06)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>{icon}</span>
        <p style={{ fontSize: 12.5, fontWeight: 700, color: C.text1, letterSpacing: '-0.1px' }}>{label}</p>
        <span style={{
          fontSize: 11, fontWeight: 700, color: C.text3,
          background: '#f1f1f6', padding: '2px 8px', borderRadius: 99,
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.05px',
        }}>{count}</span>
      </div>
      {/* Horizontal scroll. overflow-x auto + scrollbar hidden via inline style class trick. */}
      <div className="seo-heat-scroll" style={{
        display: 'flex', gap: 12,
        overflowX: 'auto', overflowY: 'hidden',
        scrollSnapType: 'x proximity',
        paddingBottom: 4,
      }}>
        {items.map((v, i) => (
          <div key={v.video_id || i} style={{ scrollSnapAlign: 'start' }}>
            <Tile video={v} baselineViews={baselineViews}/>
          </div>
        ))}
      </div>
    </div>
  )
}

function NicheStatTile({ label, value, hint, color }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</p>
      <p style={{
        fontSize: 22, fontWeight: 800, color: color || C.text1,
        letterSpacing: '-0.7px', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
      }}>{value}</p>
      {hint && <p style={{ fontSize: 11, color: C.text3, fontWeight: 500, marginTop: 5, letterSpacing: '-0.01em' }}>{hint}</p>}
    </div>
  )
}

function NicheHeatCard({ videos, shorts, primaryPhrase }) {
  const safeVideos = Array.isArray(videos) ? videos : []
  const safeShorts = Array.isArray(shorts) ? shorts : []
  if (!safeVideos.length && !safeShorts.length) return null

  const topV = safeVideos.slice(0, 12)
  const topS = safeShorts.slice(0, 12)

  // Baseline for multiplier calc = median of THIS strip's view counts so the
  // pill reads as "outlier within this content type". Shorts and longform
  // have wildly different scales — sharing a baseline would mis-paint.
  const baseV = _median(topV.map(v => v.view_count || v.views || 0)) || 1
  const baseS = _median(topS.map(v => v.view_count || v.views || 0)) || 1

  // Aggregate stats across all videos (long + short) so the niche-size
  // numbers count the full competitive landscape.
  const allViews   = [...topV, ...topS].map(v => v.view_count || v.views || 0)
  const totalViews = allViews.reduce((a, b) => a + b, 0)
  const topPerf    = Math.max(...allViews, 0)
  const channels   = new Set([...topV, ...topS].map(v => v.channel).filter(Boolean))

  return (
    <div className="seo-suggestion-card" style={{
      // Charcoal stripe, not red. The Overused Angle card directly above this
      // one is red (warning), so a second red stripe here used to read as one
      // continuous section. Niche Heat is data, not a warning; the red flame
      // icon + LIVE pill carry plenty of heat signal already.
      borderTop: `3px solid ${C.text1}`,
      marginBottom: 18,
    }}>
      <div style={{ padding: '20px 24px 22px' }}>

        {/* ── Header: flame + NICHE HEAT + niche label + LIVE pill ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(229,37,27,0.10)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </svg>
          </span>
          <p style={{ fontSize: 11, fontWeight: 800, color: C.red, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Niche heat</p>
          {primaryPhrase && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, color: C.text2, letterSpacing: '-0.05px',
            }}>
              <span style={{ width: 3, height: 3, borderRadius: 99, background: 'rgba(10,10,15,0.30)' }}/>
              &ldquo;{primaryPhrase}&rdquo;
            </span>
          )}
          <div style={{ flex: 1 }}/>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 10, fontWeight: 800, color: C.red,
            background: 'rgba(229,37,27,0.07)', border: '1px solid rgba(229,37,27,0.20)',
            padding: '3px 9px', borderRadius: 100,
            letterSpacing: '0.10em', textTransform: 'uppercase',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: 99, background: C.red,
              animation: 'seoPulse 1.6s ease-in-out infinite',
            }}/>
            Live
          </span>
        </div>
        <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5, marginBottom: 20 }}>
          What's already winning here · red pill = views vs the niche median
        </p>

        {/* ── Winning videos strip (16:9 landscape thumbs) ── */}
        <HeatStrip
          icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="14" rx="2"/>
              <path d="M10 11l5 3-5 3v-6z" fill={C.text2}/>
            </svg>
          }
          label="Winning videos"
          count={topV.length}
          Tile={VideoTile}
          items={topV}
          baselineViews={baseV}
        />

        {/* ── Winning shorts strip (9:16 vertical thumbs) ── */}
        <HeatStrip
          icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="7" y="3" width="10" height="18" rx="2"/>
              <path d="M11 8l3 2-3 2V8z" fill={C.text2}/>
            </svg>
          }
          label="Winning shorts"
          count={topS.length}
          Tile={ShortTile}
          items={topS}
          baselineViews={baseS}
        />

        {/* ── 4-tile stat strip across the bottom ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18,
          paddingTop: 18, borderTop: '1px solid #f1f1f4',
        }}>
          <NicheStatTile label="Total views"     value={fmtNum(totalViews)} hint={`across ${topV.length + topS.length} winners`}/>
          <NicheStatTile label="Top performer"   value={fmtNum(topPerf)}    hint="single best video" color={C.red}/>
          <NicheStatTile label="Long-form / shorts" value={`${topV.length} / ${topS.length}`} hint="content-type split"/>
          <NicheStatTile label="Active creators" value={channels.size}      hint="distinct channels"/>
        </div>
      </div>
    </div>
  )
}

// One suggested title card. VideoIdeas DNA: severity-colored 3px top stripe,
// eyebrow row with rank + label + meta, bold title as the hero, always-visible
// quality chart (3 bars) + length sweet-spot, inline italic notes for the
// Why/Angle prose so it doesn't compete for attention with the chart, action
// row at the bottom. No click-to-expand — every value-add is visible at first
// glance, matching the "lure the user with proof" feedback memory.
// Cheap text-similarity ranker used to pick which competing videos to show
// next to each suggestion. Jaccard over lower-cased, stopword-stripped word
// tokens of length 3+. Not perfect, but accurate enough that the 2 thumbs
// next to a suggestion read as "videos this title would compete with."
const _SUG_STOPWORDS = new Set([
  'the','and','for','with','from','this','that','your','you','my','our','their',
  'how','what','why','when','where','about','into','they','them','will','can',
  'are','was','were','has','have','had','its','his','her','out','one','two',
  'top','best','new','easy','quick','simple','vs',
])
function _tokenize(str) {
  const set = new Set()
  for (const word of (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)) {
    if (word.length >= 3 && !_SUG_STOPWORDS.has(word)) set.add(word)
  }
  return set
}
function _jaccard(a, b) {
  if (!a.size || !b.size) return 0
  let inter = 0
  for (const t of a) if (b.has(t)) inter++
  return inter / (a.size + b.size - inter)
}
function pickSimilarCompetitors(target, pool, n) {
  if (!Array.isArray(pool) || pool.length === 0) return []
  const targetTokens = _tokenize(target)
  return pool
    .map(v => ({ v, score: _jaccard(targetTokens, _tokenize(v.title || '')) }))
    .sort((a, b) => (b.score - a.score) || ((b.v.view_count || b.v.views || 0) - (a.v.view_count || a.v.views || 0)))
    .slice(0, n)
    .map(r => r.v)
}

// ── CompetitorThumbTile ──
// Mini landscape thumb used inside each suggestion card. Smaller than
// VideoTile (which lives in the niche-wide strips), tuned for the
// "Competing against" rail in SuggestionRow. View chip bottom-right.
function CompetitorThumbTile({ video }) {
  const views = video.view_count || video.views || 0
  const age   = _relTimeDays(video.published_at || video.publishedAt)
  return (
    <a
      href={video.video_id ? `https://www.youtube.com/watch?v=${video.video_id}` : '#'}
      target="_blank" rel="noopener noreferrer"
      style={{
        textDecoration: 'none', color: 'inherit',
        display: 'flex', flexDirection: 'column', gap: 7,
        minWidth: 0,
      }}>
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '16 / 9',
        borderRadius: 8, overflow: 'hidden', background: '#0f0f13',
        boxShadow: '0 1px 2px rgba(0,0,0,0.08), 0 3px 10px rgba(0,0,0,0.06)',
      }}>
        {(video.video_id || video.thumbnail) && (
          <img
            src={video.video_id ? _seoYtMax(video.video_id) : video.thumbnail}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            data-thumb-step="max"
            onError={_seoThumbOnError(video.video_id, video.thumbnail)}
            onLoad={_seoThumbOnLoad(video.video_id, video.thumbnail)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        <div style={{
          position: 'absolute', right: 6, bottom: 6,
          padding: '2px 6px', borderRadius: 5,
          background: 'rgba(0,0,0,0.78)',
          color: '#fff', fontSize: 10.5, fontWeight: 800,
          letterSpacing: '-0.2px', fontVariantNumeric: 'tabular-nums',
        }}>{fmtNum(views)}</div>
      </div>
      <p style={{
        fontSize: 12, fontWeight: 600, color: C.text1, lineHeight: 1.35,
        letterSpacing: '-0.1px',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        minHeight: 32,
      }}>{video.title}</p>
      <p style={{
        fontSize: 10.5, color: C.text3, fontWeight: 500,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{video.channel || '—'}{age ? <span style={{ color: C.text4 }}>{` · ${age}`}</span> : null}</p>
    </a>
  )
}

// Kept as a no-op for backwards compatibility — the dark mockup tile was
// replaced by real competing thumbnails. If anything still references
// TitleTileMockup it falls through to null instead of rendering the old
// placeholder. Safe to delete once we've audited the rest of the page.
function TitleTileMockup({ title, sevColor }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '16 / 9',
      borderRadius: 12,
      overflow: 'hidden',
      background: '#0f0f13',
      boxShadow: '0 1px 3px rgba(0,0,0,0.14), 0 10px 30px rgba(0,0,0,0.16)',
    }}>
      {/* Gradient backdrop — neutral dark, with a soft severity tint
          bleeding in from the top-left corner so the card has a subtle
          accent without painting the whole tile. */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(120% 80% at 0% 0%, ${sevColor}38 0%, rgba(15,15,19,0) 55%), linear-gradient(180deg, #1a1a22 0%, #0a0a10 100%)`,
      }}/>
      {/* Faint grid lines for texture (read as "frame") */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        opacity: 0.5,
      }}/>
      {/* Title — centered, bold white, line-clamped to 3 */}
      <div style={{
        position: 'absolute', inset: 0,
        padding: '20px 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
      }}>
        <p style={{
          fontSize: 19, fontWeight: 800, color: '#ffffff',
          letterSpacing: '-0.4px', lineHeight: 1.25,
          textShadow: '0 2px 8px rgba(0,0,0,0.45)',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{title}</p>
      </div>
      {/* AI badge (top-right) — communicates "this is your future thumbnail" */}
      <div style={{
        position: 'absolute', top: 10, right: 10,
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 8px', borderRadius: 99,
        background: 'rgba(255,255,255,0.10)',
        border: '1px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(4px)',
        color: '#fff', fontSize: 10, fontWeight: 800,
        letterSpacing: '0.10em', textTransform: 'uppercase',
      }}>
        <span style={{ width: 5, height: 5, borderRadius: 99, background: sevColor }}/>
        AI title
      </div>
      {/* Duration placeholder (bottom-right) — reads as a YouTube tile */}
      <div style={{
        position: 'absolute', bottom: 10, right: 10,
        padding: '2px 7px', borderRadius: 5,
        background: 'rgba(0,0,0,0.78)',
        color: '#fff', fontSize: 11, fontWeight: 800,
        letterSpacing: '-0.2px', fontVariantNumeric: 'tabular-nums',
      }}>--:--</div>
    </div>
  )
}

function SuggestionRow({ s, i, isSelected, isCopied, onCopy, onSelect, primaryPhrase, nicheVideos }) {
  const [mounted, setMounted] = useState(false)
  const [whyOpen, setWhyOpen] = useState(false)
  useEffect(() => {
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setMounted(true))
    })
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
  }, [])

  const eyebrow  = (s.primary_keyword || primaryPhrase || '').trim()
  const avgScore = Number.isFinite(s.score)
    ? s.score
    : Math.round(((s.seo_score || 0) + (s.ctr_score || 0) + (s.hook_score || 0)) / 3)
  const sevLabel = avgScore >= 75 ? 'Strong' : avgScore >= 60 ? 'Solid' : 'Weak'
  const sevColor = avgScore >= 75 ? C.green : avgScore >= 60 ? C.amber : C.red
  const sevBg    = avgScore >= 75 ? 'rgba(5,150,105,0.10)' : avgScore >= 60 ? 'rgba(217,119,6,0.10)' : 'rgba(229,37,27,0.08)'
  const hasWhy   = !!(s.why_it_works || s.angle)

  // Pick 2 real competing videos from the niche pool that look most like
  // this specific suggestion. The list lives in the right rail of the card
  // as "videos this title would compete with."
  const competitors = pickSimilarCompetitors(s.title, nicheVideos, 2)

  return (
    <div className="seo-suggestion-card" style={{
      marginBottom: 0,
      borderTop: `3px solid ${sevColor}`,
      borderLeftColor:   isSelected ? 'rgba(229,37,27,0.30)' : isCopied ? 'rgba(5,150,105,0.30)' : '#e6e6ec',
      borderRightColor:  isSelected ? 'rgba(229,37,27,0.30)' : isCopied ? 'rgba(5,150,105,0.30)' : '#e6e6ec',
      borderBottomColor: isSelected ? 'rgba(229,37,27,0.30)' : isCopied ? 'rgba(5,150,105,0.30)' : '#e6e6ec',
      background: isSelected ? '#fff8f8' : isCopied ? '#f6fdf9' : '#ffffff',
    }}>
      <div style={{ padding: '18px 22px 20px' }}>

        {/* ── Eyebrow row: neutral rank chip + label + keyword chip + (right) score chip ──
            The rank chip is now a charcoal-on-tint neutral so amber is reserved
            for the "Solid 68" severity tier and nothing else. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{
            flexShrink: 0,
            width: 24, height: 24, borderRadius: 7,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(15,15,19,0.06)',
            border: '1px solid rgba(15,15,19,0.08)',
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: C.text1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.3px' }}>{i + 1}</span>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 800, color: 'rgba(10,10,15,0.55)',
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>Title option</span>
          {eyebrow && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 12, fontWeight: 500, color: 'rgba(10,10,15,0.55)',
              letterSpacing: '-0.01em',
              maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              <span style={{ width: 3, height: 3, borderRadius: 99, background: 'rgba(10,10,15,0.30)', flexShrink: 0 }}/>
              {eyebrow}
            </span>
          )}
          <div style={{ flex: 1 }}/>
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: sevColor,
            background: sevBg, border: `1px solid ${sevColor}66`,
            padding: '3px 10px', borderRadius: 100,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            fontVariantNumeric: 'tabular-nums',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            flexShrink: 0,
          }}>
            <span>{sevLabel}</span>
            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '-0.3px' }}>{avgScore}</span>
          </span>
        </div>

        {/* ── Bold title as the hero, full width. 17/700 mirrors VideoIdeas
            IdeaCard. Replaces the previous dark YouTube-tile mockup which
            was decoration. ── */}
        <h3 style={{
          fontSize: 17, fontWeight: 700, color: C.text1,
          letterSpacing: '-0.35px', lineHeight: 1.35,
          marginBottom: 16,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{s.title}</h3>

        {/* ── Hero body: quality chart on the left, REAL competing thumbnails
            on the right. Each suggestion gets its own 2 most-similar winners
            from the niche pool, picked by token-overlap with the suggestion
            title. The right rail is the proof: "if you ship this title,
            these are the videos you'd land next to." ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.25fr)', gap: 16,
          marginBottom: 14,
        }}>
          {/* Left: quality chart card (bars + length sweet-spot) */}
          <div style={{
            background: '#ffffff',
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: '14px 16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 3px 10px rgba(0,0,0,0.04)',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Title quality</p>
              <ScoreBars seo={s.seo_score} ctr={s.ctr_score} hook={s.hook_score} mounted={mounted}/>
            </div>
            <div style={{ height: 1, background: C.borderLight }}/>
            <LengthSweetSpot length={s.length} mounted={mounted}/>
          </div>

          {/* Right: 2 real competing thumbnails (or a soft empty state if the
              niche pool wasn't loaded). */}
          <div style={{
            background: '#ffffff',
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: '14px 16px',
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Competing against</p>
            {competitors.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                {competitors.map((v, k) => (
                  <CompetitorThumbTile key={v.video_id || k} video={v}/>
                ))}
              </div>
            ) : (
              <div style={{
                background: '#fafafb', border: '1px dashed #e6e6ec', borderRadius: 8,
                padding: '24px 14px', textAlign: 'center',
              }}>
                <p style={{ fontSize: 12, color: C.text3, lineHeight: 1.5 }}>
                  No niche-similar videos found for this suggestion.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Action row: meta + Why-this-works disclosure + Copy + primary CTA ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(10,10,15,0.50)', letterSpacing: '-0.01em' }}>
            {s.length ? `${s.length} chars` : '—'}
            {s.length >= 50 && s.length <= 70 && (
              <>{' · '}<span style={{ color: C.green, fontWeight: 700 }}>in the sweet spot</span></>
            )}
          </span>
          {hasWhy && (
            <button
              onClick={() => setWhyOpen(o => !o)}
              aria-expanded={whyOpen}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 11px', borderRadius: 99,
                background: whyOpen ? 'rgba(15,15,19,0.06)' : '#ffffff',
                border: `1px solid ${whyOpen ? 'rgba(15,15,19,0.16)' : 'rgba(0,0,0,0.08)'}`,
                color: C.text2, fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
                fontFamily: 'inherit', cursor: 'pointer',
                transition: 'background 0.14s, border-color 0.14s, color 0.14s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,15,19,0.04)'; e.currentTarget.style.color = C.text1 }}
              onMouseLeave={e => { e.currentTarget.style.background = whyOpen ? 'rgba(15,15,19,0.06)' : '#ffffff'; e.currentTarget.style.color = C.text2 }}
            >
              {whyOpen ? 'Hide why' : 'Why this works'}
              <svg width="11" height="11" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: whyOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <path d="M3 5l3.5 3.5L10 5"/>
              </svg>
            </button>
          )}
          <div style={{ flex: 1 }}/>
          <button onClick={onCopy}
            style={{ fontSize: 12.5, fontWeight: 600, color: isCopied ? C.green : C.text2, background: '#ffffff', border: `1px solid ${isCopied ? 'rgba(5,150,105,0.38)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 100, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
            {isCopied ? '✓ Copied' : 'Copy'}
          </button>
          <button onClick={onSelect}
            style={{ fontSize: 12.5, fontWeight: 700, color: isSelected ? C.red : '#ffffff', background: isSelected ? 'rgba(229,37,27,0.08)' : '#e5251b', border: `1px solid ${isSelected ? 'rgba(229,37,27,0.25)' : 'transparent'}`, borderRadius: 100, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', transition: 'filter 0.15s, background 0.15s', boxShadow: isSelected ? 'none' : '0 1px 2px rgba(229,37,27,0.18)', whiteSpace: 'nowrap', letterSpacing: '-0.1px' }}>
            {isSelected ? '✓ Selected' : 'Use this title →'}
          </button>
        </div>

        {/* ── Why-this-works disclosure ── */}
        {hasWhy && whyOpen && (
          <div style={{
            marginTop: 14, paddingTop: 14,
            borderTop: '1px solid #f1f1f4',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {s.why_it_works && (
              <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, letterSpacing: '-0.01em' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 8 }}>Why it works</span>
                {highlightKeyword(sentenceCase(s.why_it_works), eyebrow)}
              </p>
            )}
            {s.angle && (
              <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, letterSpacing: '-0.01em' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 8 }}>Distribution</span>
                {sentenceCase(s.angle)}
              </p>
            )}
          </div>
        )}
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

// Description card. Collapse-first: header row alone is scannable
// (type pill + truncated 1-line preview + chevron). Expand for the
// full body + Why-it-works + copy CTA.
function DescriptionCard({ d, idx, copiedDesc, onCopy }) {
  const [open, setOpen] = useState(false)
  const tm = DESC_TYPE_META[d.type] || DESC_TYPE_META.value
  const isCopied = copiedDesc === idx
  const categoryShort = d.type === 'story' ? 'Story'
                      : d.type === 'value' ? 'Value'
                      : 'Keyword-first'
  // First line of the preview, trimmed so the header is a single visual line.
  const teaser = (d.preview || '').replace(/\s+/g, ' ').trim()
  return (
    <div className="seo-suggestion-card" style={{
      marginBottom: 10,
      borderTop: `3px solid ${C.amber}`,
    }}>
      {/* Header — clickable. type pill | teaser | chevron */}
      <div
        role="button" tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o) } }}
        style={{
          padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer', userSelect: 'none',
        }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{idx + 1}</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: tm.color, padding: '3px 9px', borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase', border: `1.5px solid ${tm.color}`, flexShrink: 0 }}>
          {categoryShort}
        </span>
        <p style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: C.text2, fontWeight: 500, lineHeight: 1.45, letterSpacing: '-0.1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {teaser}
        </p>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
          stroke={C.text3} strokeWidth="2" strokeLinecap="round"
          style={{ flexShrink: 0, transition: 'transform 0.22s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M3 5l3.5 3.5L10 5"/>
        </svg>
      </div>

      {open && (
      <div style={{ padding: '0 22px 18px' }}>
        {/* Divider aligned with content start */}
        <div style={{ height: 1, background: C.border, marginBottom: 14, marginLeft: 38 }} />

        {/* 2-col body — Why it works (charcoal-neutral) + Full description (white + amber left bar + shadow). */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 8, marginLeft: 38 }}>
          <div style={{ background: 'rgba(15,15,19,0.04)', border: '1px solid rgba(15,15,19,0.08)', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Why it works</p>
            <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.65 }}>{sentenceCase(d.why_it_works)}</p>
          </div>

          <div style={{
            background: '#ffffff',
            border: `1px solid ${C.border}`,
            borderLeft: `3px solid ${C.amber}`,
            borderRadius: '0 10px 10px 0',
            padding: '12px 16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex', flexDirection: 'column',
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.amber, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Full description</p>
            <pre style={{ fontSize: 12.5, color: C.text1, lineHeight: 1.75, whiteSpace: 'pre-wrap', fontFamily: "'Inter', system-ui, sans-serif", margin: 0 }}>
              {d.full}
            </pre>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
              <button onClick={e => { e.stopPropagation(); onCopy(d.full, idx) }} className="seo-btn-primary" style={{ fontSize: 12, padding: '9px 18px' }}>
                {isCopied ? '✓ Copied' : 'Copy description'}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}

// Saturation indicator — a compact horizontal bar + "X of N · Label" text.
// Replaces the childish-looking row of empty/filled dots. Same data, less
// novelty: a tinted progress bar from 0 to total, color-matched to the row's
// severity, with a clear "used by X of Y ranking videos · Wide open / Saturated".
function SaturationDots({ total, filled, color, label }) {
  const ratio = total > 0 ? Math.min(1, filled / total) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{
        fontSize: 11.5, fontWeight: 600, color: C.text2,
        fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
      }}>
        <strong style={{ color: C.text1, fontWeight: 800 }}>{filled}</strong>
        <span style={{ color: C.text3 }}> of {total} niche videos</span>
      </span>
      {/* Slimmer 100px-max bar — the verdict chip on the right tells the
          story; the bar is a visual support, not the headline. */}
      <div style={{ flex: '0 1 100px', maxWidth: 100, height: 4, background: '#eef0f4', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          width: `${ratio * 100}%`, height: '100%', background: color, borderRadius: 99,
          transition: 'width 0.85s cubic-bezier(0.34,1.4,0.64,1)',
        }}/>
      </div>
      <span style={{
        fontSize: 11, fontWeight: 700, color, letterSpacing: '0.07em',
        textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>{label}</span>
    </div>
  )
}

// Collapsible search-intent insight row. Header is a scannable one-liner with
// a tinted lucide icon, sentence-cased + truncated headline, and a saturation
// dot row that visualizes how many of the N ranking videos use this pattern.
// On expand it becomes a Q&A layout (Who / What / Why) using sentence-cased
// short prose instead of three colored prose panels.
function IntentInsightRow({
  IconCmp, eyebrowLabel, eyebrowColor, headline, chipLabel, chipColor,
  totalVideos, filledVideos,
  whyLabel, whyText, actionLabel, actionText, outcomeLabel, outcomeText,
}) {
  const [open, setOpen] = useState(false)
  // Cap raised to 200 so headlines stop terminating on commas. CSS line-clamp
  // below catches anything genuinely long and wraps it cleanly into two lines
  // instead of inserting a mid-sentence ellipsis.
  const cleanHeadline = firstClause(headline, 200)
  // chipLabel is intentionally unused — the eyebrow already names the insight
  // ("OPPORTUNITY" / "OVERUSED ANGLE"), so a second outlined pill on the right
  // was duplicating the semantic. Prop kept on the signature for compatibility.
  void chipLabel
  return (
    <div className="seo-suggestion-card" style={{
      marginBottom: 10,
      borderTop: `3px solid ${chipColor}`,
    }}>
      <div
        role="button" tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o) } }}
        style={{
          padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 14,
          cursor: 'pointer', userSelect: 'none',
        }}>
        {/* Tinted soft circle icon — 28×28 to match the chip-weight tokens used
            on the title card and suggestion-card eyebrows; the previous 34×34
            made it the heaviest icon on the page. */}
        <div style={{
          width: 28, height: 28, borderRadius: 99,
          background: `${chipColor}14`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <IconCmp size={14} color={chipColor} strokeWidth={2}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: eyebrowColor, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>{eyebrowLabel}</p>
          <p style={{
            fontSize: 14.5, fontWeight: 700, color: C.text1,
            lineHeight: 1.45, letterSpacing: '-0.15px', marginBottom: 10,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{cleanHeadline}</p>
          <SaturationDots
            total={totalVideos}
            filled={filledVideos}
            color={chipColor}
            label={filledVideos === 0 ? 'Wide open' : filledVideos >= totalVideos * 0.6 ? 'Saturated' : 'Some competition'}
          />
        </div>
        {/* Chevron only — outlined right-side chip removed (it was a duplicate
            of the eyebrow). Centered vertically with the row via flex
            alignItems:center on the parent. */}
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
          stroke={C.text3} strokeWidth="2" strokeLinecap="round"
          style={{ flexShrink: 0, transition: 'transform 0.22s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M3 5l3.5 3.5L10 5"/>
        </svg>
      </div>

      {open && (
      // Indent aligns the expanded content with the headline column:
      // card padding 22 + icon 28 + gap 14 = 64.
      <div style={{ padding: '0 22px 18px', paddingLeft: 64 }}>
        <div style={{ height: 1, background: C.border, marginBottom: 12 }} />
        {/* Q&A layout — definition list pattern. Each row is "label → value". */}
        {[
          [whyLabel, whyText],
          [actionLabel, actionText],
          [outcomeLabel, outcomeText],
        ].map(([lbl, val], i) => (
          <div key={lbl} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 14, padding: '9px 0', borderBottom: i < 2 ? `1px dashed ${C.borderLight}` : 'none' }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase', paddingTop: 2 }}>{lbl}</p>
            <p style={{ fontSize: 13, color: C.text1, lineHeight: 1.65, fontWeight: 500 }}>{sentenceCase(val)}</p>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}

// Animated arc + count-up score badge. Used inside TitleComparisonHero.
// Sweeps from 0 to `value` on mount over ~0.85s so the page feels alive on
// first paint instead of stamping fully-rendered numbers in place.
function AnimatedScoreArc({ value, color, size = 108, tier }) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const dur = 850
    const ease = t => 1 - Math.pow(1 - t, 3)
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur)
      setShown(Math.round(value * ease(t)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  const r = (size / 2) - 9
  const sw = 8
  const circ = 2 * Math.PI * r
  const fill = Math.max(0, Math.min(100, shown)) / 100 * circ
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Soft tinted halo */}
      <div style={{
        position: 'absolute', inset: -8, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}1f 0%, transparent 65%)`,
        pointerEvents: 'none',
      }}/>
      <svg width={size} height={size} style={{ position: 'relative', display: 'block' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f0f4" strokeWidth={sw}/>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}/>
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 2,
      }}>
        <span style={{
          fontSize: 30, fontWeight: 900, color, letterSpacing: '-1.4px',
          fontVariantNumeric: 'tabular-nums', lineHeight: 1,
        }}>{shown}</span>
        <span style={{
          fontSize: 9.5, fontWeight: 800, color, letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}>{tier}</span>
      </div>
    </div>
  )
}

// Animated count-up — used for the lift number so it ticks from 0 → +35 on mount.
function useCountUp(target, duration = 850) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const ease = t => 1 - Math.pow(1 - t, 3)
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      setV(Math.round(target * ease(t)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return v
}

// Title comparison hero — single storytelling panel that bridges
// "your title → best AI alternative" with the lift visualized in the middle.
// Replaces the old 3-flat-tile hero. Arcs sweep, lift counts up, sub-score
// bars stagger in. Brand palette only — red / amber / green / charcoal.
// Derive crude SEO / CTR / Hook sub-scores for the USER's title from the
// granular per-rule breakdown the backend returns. Three groups of ~35
// points each, scaled to a 0-100 axis so they sit next to the AI's
// rubric-scored sub-scores. Approximations, not the same model — used
// only for the side-by-side breakdown disclosure to keep the math honest.
function _userSubScoresFromBreakdown(b) {
  if (!b) return { seo: 0, ctr: 0, hook: 0 }
  const seoRaw  = (b.length || 0) + (b.keyword_relevance || 0)                       // 25 + 10
  const ctrRaw  = (b.power_words || 0) + (b.numbers || 0) + (b.viral_format || 0)    // 15 + 10 + 10
  const hookRaw = (b.front_loading || 0) + (b.question || 0) + (b.hook_format || 0)  // 15 + 10 + 10
  return {
    seo:  Math.round(Math.min(100, (seoRaw  / 35) * 100)),
    ctr:  Math.round(Math.min(100, (ctrRaw  / 35) * 100)),
    hook: Math.round(Math.min(100, (hookRaw / 35) * 100)),
  }
}

// One sub-score block in the breakdown disclosure: label + delta chip on top,
// then two stacked thin bars (You vs AI) with their numbers inline. Reads
// as a vertical mini-chart so the gap between the two titles is the visual.
function SubScoreBlock({ label, you, ai, mounted, delay }) {
  const youCol = you >= 75 ? C.green : you >= 55 ? C.amber : C.red
  const aiCol  = ai  >= 75 ? C.green : ai  >= 55 ? C.amber : C.red
  const delta  = ai - you
  const dPos   = delta >= 0
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.text2, letterSpacing: '-0.05px' }}>{label}</span>
        <span style={{
          fontSize: 11, fontWeight: 800, color: dPos ? C.green : C.red,
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.05px',
        }}>{dPos ? '+' : ''}{delta}</span>
      </div>
      {/* Your row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.06em', textTransform: 'uppercase', width: 30, flexShrink: 0 }}>You</span>
        <div style={{ flex: 1, height: 5, background: '#eef0f4', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: mounted ? `${you}%` : '0%', background: youCol, borderRadius: 99,
            transition: `width 0.85s cubic-bezier(0.34,1.4,0.64,1) ${delay}ms`,
          }}/>
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 800, color: youCol, fontVariantNumeric: 'tabular-nums', width: 28, textAlign: 'right', letterSpacing: '-0.2px' }}>{you}</span>
      </div>
      {/* AI row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.06em', textTransform: 'uppercase', width: 30, flexShrink: 0 }}>AI</span>
        <div style={{ flex: 1, height: 5, background: '#eef0f4', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: mounted ? `${ai}%` : '0%', background: aiCol, borderRadius: 99,
            transition: `width 0.85s cubic-bezier(0.34,1.4,0.64,1) ${delay + 100}ms`,
          }}/>
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 800, color: aiCol, fontVariantNumeric: 'tabular-nums', width: 28, textAlign: 'right', letterSpacing: '-0.2px' }}>{ai}</span>
      </div>
    </div>
  )
}

function TitleComparisonHero({ userTitle, userScore, userBreakdown, suggestions, nicheLabel, videosFound, onPick }) {
  const [mounted, setMounted] = useState(false)
  const [breakdownOpen, setBreakdownOpen] = useState(false)
  useEffect(() => {
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setMounted(true))
    })
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
  }, [])

  const sugAvg = (s) => Number.isFinite(s.score)
    ? s.score
    : Math.round(((s.seo_score || 0) + (s.ctr_score || 0) + (s.hook_score || 0)) / 3)
  const bestSug = [...suggestions].sort((a, b) => sugAvg(b) - sugAvg(a))[0]
  const bestAvg = sugAvg(bestSug)
  const lift = bestAvg - userScore

  const tierFor = (s) => s >= 75 ? C.green : s >= 50 ? C.amber : C.red
  const userCol = tierFor(userScore)
  const bestCol = tierFor(bestAvg)

  // Lift chip colors — green for positive lift (you'd improve), red for negative
  // (your title is already winning). Mirrors the rest of the page's tier rules.
  const liftPositive = lift >= 0
  const liftColor = liftPositive ? C.green : C.red
  const liftBg    = liftPositive ? 'rgba(5,150,105,0.08)' : 'rgba(229,37,27,0.07)'
  const liftBdr   = liftPositive ? 'rgba(5,150,105,0.25)' : 'rgba(229,37,27,0.22)'

  const userSubs = _userSubScoresFromBreakdown(userBreakdown)
  const aiSubs   = {
    seo:  bestSug.seo_score  || 0,
    ctr:  bestSug.ctr_score  || 0,
    hook: bestSug.hook_score || 0,
  }

  return (
    <div style={{
      background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 16,
      marginBottom: 20, overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06)',
    }}>

      {/* ── Eyebrow row: TITLE ANALYSIS · N niche videos · "{niche keyword}"
            on the left, lift chip on the right. The keyword that used to be
            hidden in the truncated title text now lives here, in the eyebrow,
            always visible. ── */}
      <div style={{
        padding: '16px 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        flexWrap: 'wrap',
        borderBottom: `1px solid ${C.borderLight}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Title analysis</span>
          {videosFound > 0 && (
            <>
              <span style={{ color: C.text4 }}>·</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: C.text3, letterSpacing: '-0.05px' }}>
                <span style={{ color: C.text2, fontWeight: 700 }}>{videosFound}</span> niche videos
              </span>
            </>
          )}
          {nicheLabel && (
            <>
              <span style={{ color: C.text4 }}>·</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text2, letterSpacing: '-0.05px' }}>
                &ldquo;{nicheLabel}&rdquo;
              </span>
            </>
          )}
        </div>
        {lift !== 0 && (
          <span style={{
            padding: '5px 11px', borderRadius: 99,
            background: liftBg, border: `1px solid ${liftBdr}`,
            color: liftColor, fontSize: 11, fontWeight: 800,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.05px',
            flexShrink: 0, whiteSpace: 'nowrap',
          }}>
            {liftPositive ? '+' : ''}{lift} points
          </span>
        )}
      </div>

      {/* ── Your title row: eyebrow + score on one line, full title below
            (no truncation), full-width bar underneath. ── */}
      <div style={{ padding: '18px 22px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6, gap: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Your title</span>
          <span style={{
            fontSize: 28, fontWeight: 800, color: userCol,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.7px', lineHeight: 1, flexShrink: 0,
          }}>{userScore}</span>
        </div>
        <p style={{
          fontSize: 14.5, fontWeight: 600, color: C.text2,
          letterSpacing: '-0.15px', lineHeight: 1.4, marginBottom: 10,
        }}>
          {userTitle || <span style={{ color: C.text4, fontWeight: 500 }}>(no title entered)</span>}
        </p>
        <div style={{ height: 6, background: '#eef0f4', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: mounted ? `${Math.max(2, userScore)}%` : '0%',
            background: userCol, borderRadius: 99,
            transition: 'width 0.95s cubic-bezier(0.34,1.4,0.64,1)',
          }}/>
        </div>
      </div>

      {/* ── Best AI alternative row: same structure, AI title at 700 weight
            and full color text1 to mark it as the recommended choice. ── */}
      <div style={{ padding: '6px 22px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6, gap: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Best AI alternative</span>
          <span style={{
            fontSize: 28, fontWeight: 800, color: bestCol,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.7px', lineHeight: 1, flexShrink: 0,
          }}>{bestAvg}</span>
        </div>
        <p style={{
          fontSize: 14.5, fontWeight: 700, color: C.text1,
          letterSpacing: '-0.15px', lineHeight: 1.4, marginBottom: 10,
        }}>
          {bestSug.title}
        </p>
        <div style={{ height: 6, background: '#eef0f4', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: mounted ? `${Math.max(2, bestAvg)}%` : '0%',
            background: bestCol, borderRadius: 99,
            transition: 'width 0.95s cubic-bezier(0.34,1.4,0.64,1) 180ms',
          }}/>
        </div>
      </div>

      {/* ── Footer row: short verdict line + Breakdown disclosure chip + Use CTA.
            All controls 36px tall, same baseline. ── */}
      <div style={{
        padding: '14px 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        flexWrap: 'wrap',
        borderTop: `1px solid ${C.borderLight}`,
      }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: C.text2, letterSpacing: '-0.05px' }}>
          {lift > 0
            ? <>Pick this for <span style={{ fontWeight: 800, color: C.green }}>+{lift} points</span> over your title.</>
            : lift < 0
              ? <>Your title scores <span style={{ fontWeight: 800, color: C.red }}>{Math.abs(lift)} higher</span>. Stick with it.</>
              : <>Tied with your title.</>
          }
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setBreakdownOpen(o => !o)}
            aria-expanded={breakdownOpen}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '0 14px', height: 36, boxSizing: 'border-box',
              borderRadius: 99,
              background: breakdownOpen ? 'rgba(15,15,19,0.06)' : '#ffffff',
              border: `1px solid ${breakdownOpen ? 'rgba(15,15,19,0.16)' : 'rgba(0,0,0,0.10)'}`,
              color: C.text2, fontSize: 12, fontWeight: 600, letterSpacing: '-0.05px',
              fontFamily: 'inherit', cursor: 'pointer',
              transition: 'background 0.14s, border-color 0.14s, color 0.14s',
            }}
            onMouseEnter={e => { if (!breakdownOpen) { e.currentTarget.style.background = 'rgba(15,15,19,0.04)'; e.currentTarget.style.color = C.text1 } }}
            onMouseLeave={e => { if (!breakdownOpen) { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = C.text2 } }}
          >
            {breakdownOpen ? 'Hide breakdown' : 'Score breakdown'}
            <svg width="10" height="10" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transition: 'transform 0.18s', transform: breakdownOpen ? 'rotate(180deg)' : 'none' }}>
              <path d="M3 5l3.5 3.5L10 5"/>
            </svg>
          </button>
          <button
            onClick={() => onPick(bestSug.title)}
            className="seo-btn-primary"
            style={{ fontSize: 13, padding: '0 18px', height: 36, lineHeight: 1, flexShrink: 0 }}>
            Use this title →
          </button>
        </div>
      </div>

      {/* ── Breakdown disclosure: three sub-score blocks, each a tiny vertical
            chart with the user's row on top and the AI's underneath. The
            gap between the two bars IS the lift on that dimension. ── */}
      {breakdownOpen && (
        <div style={{
          padding: '16px 22px 18px',
          borderTop: `1px solid ${C.borderLight}`,
          background: '#fafafb',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 12 }}>
            Where the AI title wins
          </p>
          <SubScoreBlock label="Keyword fit"      you={userSubs.seo}  ai={aiSubs.seo}  mounted delay={0}/>
          <SubScoreBlock label="Click appeal"     you={userSubs.ctr}  ai={aiSubs.ctr}  mounted delay={100}/>
          <SubScoreBlock label="Opening strength" you={userSubs.hook} ai={aiSubs.hook} mounted delay={200}/>
          <p style={{ fontSize: 11, fontWeight: 500, color: C.text4, letterSpacing: '-0.05px', marginTop: 4 }}>
            Your sub-scores are derived from the same rubric, scaled to a 0–100 axis.
          </p>
        </div>
      )}
    </div>
  )
}

// Niche keyword leaderboard — matches the Video Ideas card DNA exactly: 3px
// severity stripe at top, hairline border, eyebrow row, then a clean ranked
// list of phrases with score bars. Bubble chart removed — it was unreadable.
// This is the same scan pattern as Video Ideas: rank · keyword · vol/comp
// chips · score bar · score number. Click a row to use it as your title.
function NicheMap({ keywords, onPick }) {
  if (!keywords?.length) return null

  const sorted = [...keywords].sort((a, b) => b.score - a.score)
  const visible = sorted.slice(0, 12)
  const topScore = visible[0]?.score || 0
  const stripeColor = topScore >= 75 ? C.green : topScore >= 50 ? C.amber : C.red

  // Volume / competition badge colors — match the score tier semantics. HIGH
  // volume + LOW competition reads green (good); HIGH competition reads red.
  const volCol  = v => v === 'HIGH' ? C.green : v === 'MED' ? C.amber : C.text3
  const compCol = c => c === 'LOW' ? C.green : c === 'MED' ? C.amber : C.red

  return (
    <div className="vi-idea-card" style={{ marginBottom: 12 }}>
      <div className="vi-stripe" style={{ background: stripeColor }}/>
      <div style={{ padding: 18 }}>
        {/* Eyebrow row — small label + count + helper line on the right.
            Matches Video Ideas IdeaCard header DNA. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{
            flexShrink: 0,
            width: 26, height: 26, borderRadius: 7,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(217,119,6,0.10)',
            border: '1px solid rgba(217,119,6,0.22)',
          }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: C.amber, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.3px' }}>K</span>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 800, color: 'rgba(10,10,15,0.55)',
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>Niche keywords</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 12, fontWeight: 500, color: 'rgba(10,10,15,0.55)',
            letterSpacing: '-0.01em',
          }}>
            <span style={{ width: 3, height: 3, borderRadius: 99, background: 'rgba(10,10,15,0.30)' }}/>
            {sorted.length} phrases ranked
          </span>
          <div style={{ flex: 1 }}/>
          <span style={{
            fontSize: 11, fontWeight: 500, color: C.text3,
            letterSpacing: '-0.01em',
          }}>click any to use as title</span>
        </div>

        {/* Ranked list — 12 phrases max. Each row: rank · phrase · vol/comp
            chips · score bar · score number. Consistent typography. */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          borderTop: `1px solid ${C.borderLight}`,
        }}>
          {visible.map((kw, i) => {
            const col = kw.score >= 75 ? C.green : kw.score >= 50 ? C.amber : C.red
            return (
              <button key={kw.phrase}
                onClick={() => onPick?.(kw.phrase)}
                style={{
                  display: 'grid', gridTemplateColumns: '22px 1fr 56px 56px 1.2fr 36px',
                  alignItems: 'center', gap: 12,
                  padding: '11px 0',
                  background: 'transparent', border: 'none',
                  borderBottom: i < visible.length - 1 ? `1px solid ${C.borderLight}` : 'none',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fafafb' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: C.text4,
                  fontVariantNumeric: 'tabular-nums', textAlign: 'center',
                  letterSpacing: '0.04em',
                }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{
                  fontSize: 13.5, fontWeight: 500, color: C.text1,
                  letterSpacing: '-0.1px',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{kw.phrase}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: volCol(kw.volume),
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  textAlign: 'right',
                }}>{kw.volume === 'HIGH' ? '▲ HIGH' : kw.volume === 'MED' ? '· MED' : '▽ LOW'}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: compCol(kw.competition),
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  textAlign: 'right',
                }}>{kw.competition === 'LOW' ? 'LOW' : kw.competition === 'MED' ? 'MED' : 'HIGH'}</span>
                <div style={{ height: 6, background: '#eef0f4', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    width: `${kw.score}%`, height: '100%', background: col, borderRadius: 99,
                    transition: 'width 0.85s cubic-bezier(0.34,1.4,0.64,1)',
                  }}/>
                </div>
                <span style={{
                  fontSize: 14, fontWeight: 800, color: col,
                  fontVariantNumeric: 'tabular-nums', textAlign: 'right',
                  letterSpacing: '-0.3px',
                }}>{kw.score}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// NicheMapOld kept here only to satisfy the previous SVG implementation;
// not exported. Left as `function _NicheMapBubbleSvg` so future refs see it's deprecated.
function _NicheMapBubbleSvg({ keywords, onPick }) {
  if (!keywords?.length) return null

  const volNum  = v => v === 'HIGH' ? 88 : v === 'MED' ? 55 : 22
  const compNum = c => c === 'HIGH' ? 88 : c === 'MED' ? 55 : 22

  const W = 720
  const H = 260
  const PAD_L = 68, PAD_R = 96, PAD_T = 28, PAD_B = 42
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B

  // Beeswarm-ish: dots in the same vol/comp bucket spread radially around
  // the bucket center on a tightening spiral so neighbours never overlap.
  const buckets = new Map()
  const points = keywords.map((kw) => {
    const v = volNum(kw.volume)
    const c = compNum(kw.competition)
    const key = `${v}-${c}`
    const idx = buckets.get(key) || 0
    buckets.set(key, idx + 1)
    // Spiral offset around the bucket center: angle steps 137.5° (golden), radius grows slowly
    const angle = idx * 137.5 * (Math.PI / 180)
    const ringR = idx === 0 ? 0 : 11 + Math.sqrt(idx) * 5
    const jx = Math.cos(angle) * ringR
    const jy = Math.sin(angle) * ringR
    const baseX = PAD_L + (c / 100) * innerW
    const baseY = PAD_T + (1 - v / 100) * innerH
    const r = 6 + (kw.score / 100) * 8
    const col = kw.score >= 75 ? C.green : kw.score >= 50 ? C.amber : C.red
    return { kw, x: baseX + jx, y: baseY + jy, r, col }
  })

  // Top 5 by score get inline labels. To avoid overlapping labels, sort by y
  // and offset each label a little vertically as needed.
  const labeled = [...points]
    .sort((a, b) => b.kw.score - a.kw.score)
    .slice(0, 5)

  // Top 3 sweet-spot phrases (highest score, ideally in the sweet-spot zone)
  // — chip strip below the chart.
  const topThree = [...keywords]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  return (
    <div style={{
      background: '#ffffff',
      border: `1px solid ${C.border}`, borderRadius: 14,
      padding: '18px 22px 14px', marginBottom: 12,
      boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Niche map</p>
        <p style={{ fontSize: 11, color: C.text3, fontWeight: 500 }}>volume × competition · dot size = score</p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
        {/* Sweet-spot band — top-left quadrant only (high vol, low comp). */}
        <rect x={PAD_L} y={PAD_T} width={innerW / 2} height={innerH / 2}
          fill="rgba(5,150,105,0.07)" rx="8"/>
        <text x={PAD_L + 10} y={PAD_T + 18} fontSize="10" fontWeight="800" fill={C.green}
          fontFamily="Inter,sans-serif" letterSpacing="0.14em">SWEET SPOT</text>

        {/* Frame + quadrant lines */}
        <rect x={PAD_L} y={PAD_T} width={innerW} height={innerH} fill="none" stroke="#eef0f4" strokeWidth="1" rx="8"/>
        <line x1={PAD_L} x2={W - PAD_R} y1={PAD_T + innerH / 2} y2={PAD_T + innerH / 2} stroke="#eef0f4" strokeWidth="1" strokeDasharray="2 3"/>
        <line x1={PAD_L + innerW / 2} x2={PAD_L + innerW / 2} y1={PAD_T} y2={PAD_T + innerH} stroke="#eef0f4" strokeWidth="1" strokeDasharray="2 3"/>

        {/* Y-axis (Volume) labels, with the axis title rotated on the far left */}
        <text x={PAD_L - 10} y={PAD_T + 6}                textAnchor="end" fontSize="10" fontWeight="700" fill="#9595a4" fontFamily="Inter,sans-serif" letterSpacing="0.08em">HIGH</text>
        <text x={PAD_L - 10} y={PAD_T + innerH / 2 + 3}   textAnchor="end" fontSize="10" fontWeight="700" fill="#9595a4" fontFamily="Inter,sans-serif" letterSpacing="0.08em">MED</text>
        <text x={PAD_L - 10} y={PAD_T + innerH + 4}       textAnchor="end" fontSize="10" fontWeight="700" fill="#9595a4" fontFamily="Inter,sans-serif" letterSpacing="0.08em">LOW</text>
        <text x={18} y={PAD_T + innerH / 2 + 3} fontSize="10" fontWeight="800" fill="#9595a4"
          fontFamily="Inter,sans-serif" letterSpacing="0.14em"
          transform={`rotate(-90 18 ${PAD_T + innerH / 2 + 3})`}>VOLUME</text>

        {/* X-axis (Competition) labels */}
        <text x={PAD_L}              y={H - 16} fontSize="10" fontWeight="700" fill="#9595a4" fontFamily="Inter,sans-serif" letterSpacing="0.08em">LOW COMP</text>
        <text x={PAD_L + innerW / 2} y={H - 16} textAnchor="middle" fontSize="10" fontWeight="700" fill="#9595a4" fontFamily="Inter,sans-serif" letterSpacing="0.08em">MED</text>
        <text x={W - PAD_R}          y={H - 16} textAnchor="end" fontSize="10" fontWeight="700" fill="#9595a4" fontFamily="Inter,sans-serif" letterSpacing="0.08em">HIGH COMP</text>

        {/* Bubbles */}
        {points.map(p => (
          <g key={p.kw.phrase} style={{ cursor: 'pointer' }} onClick={() => onPick?.(p.kw.phrase)}>
            <circle cx={p.x} cy={p.y} r={p.r}
              fill={p.col} fillOpacity="0.18"
              stroke={p.col} strokeWidth="1.5"/>
            <title>{`${p.kw.phrase} — vol ${p.kw.volume} · comp ${p.kw.competition} · score ${p.kw.score}`}</title>
          </g>
        ))}

        {/* Labels for the top 5 — render after bubbles so they sit on top.
            Label sits to the right of the dot; if the dot is too close to the
            right edge, render to the left instead. */}
        {labeled.map((p) => {
          const nearRight = p.x > PAD_L + innerW * 0.7
          const anchor = nearRight ? 'end' : 'start'
          const tx = nearRight ? p.x - p.r - 6 : p.x + p.r + 6
          return (
            <text key={`lbl-${p.kw.phrase}`}
              x={tx} y={p.y + 3.5}
              textAnchor={anchor}
              fontSize="11" fontWeight="600" fill={C.text2}
              fontFamily="Inter,sans-serif" letterSpacing="-0.1px"
              style={{ pointerEvents: 'none' }}>
              {p.kw.phrase.length > 22 ? p.kw.phrase.slice(0, 21) + '…' : p.kw.phrase}
            </text>
          )
        })}
      </svg>

      {/* Top 3 chip strip — click to use as title */}
      <div style={{
        marginTop: 8, paddingTop: 12, borderTop: `1px solid ${C.borderLight}`,
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      }}>
        <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 4 }}>Top opportunities</p>
        {topThree.map(kw => {
          const col = kw.score >= 75 ? C.green : kw.score >= 50 ? C.amber : C.red
          const bg  = kw.score >= 75 ? 'rgba(5,150,105,0.08)' : kw.score >= 50 ? 'rgba(217,119,6,0.08)' : 'rgba(229,37,27,0.06)'
          return (
            <button key={kw.phrase}
              onClick={() => onPick?.(kw.phrase)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: bg,
                border: `1px solid ${col}3a`,
                borderRadius: 100, padding: '5px 12px',
                fontSize: 12.5, fontWeight: 600, color: C.text1,
                fontFamily: 'inherit', cursor: 'pointer',
                letterSpacing: '-0.1px',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = col }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${col}3a` }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: col }}/>
              {kw.phrase}
              <span style={{ color: col, fontWeight: 800, fontVariantNumeric: 'tabular-nums', marginLeft: 2 }}>{kw.score}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function SeoOptimizer({ onNavigate, plan, freeTierFeatures, videos = [] }) {
  // Featured hashtags = the first 3 hashtags YouTube auto-extracts from a description
  // and shows above the title. We mirror that rule (regex on description, take first 3),
  // aggregate across the user's recent videos, and rank by total views — surfacing
  // the user's own historically successful hashtags. Pure stats, zero AI cost.
  const featuredHashtags = useMemo(() => {
    const map = new Map()
    for (const v of (videos || [])) {
      if (!v?.description) continue
      const matches = v.description.match(/#[\p{L}0-9_]+/gu) || []
      const seen = new Set()
      for (const raw of matches) {
        const tag = raw.toLowerCase()
        if (seen.has(tag)) continue
        seen.add(tag)
        if (seen.size > 3) break
        if (!map.has(tag)) map.set(tag, { tag: raw, count: 0, totalViews: 0 })
        const e = map.get(tag)
        e.count += 1
        e.totalViews += (v.views || 0)
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.totalViews - a.totalViews || b.count - a.count)
      .slice(0, 12)
  }, [videos])

  // Free-tier: SEO Studio is fully gated. Flag computed up-front so hooks
  // below still run; the render-replace lives just before the main return.
  const seoGated = (plan || 'free') === 'free'
    && (freeTierFeatures?.seo === 'locked' || freeTierFeatures?.seo === 'used')
  const saved = loadSaved()

  // Tab state — 'new' is the active editor; 'reports' lists past analyses
  // persisted server-side (SeoAnalysisCache). Reopening a report loads it
  // back into the editor via setTitle/setResult/etc.
  const [activeTab, setActiveTab] = useState('new')
  const [reports,   setReports]   = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [creditsOut, setCreditsOut] = useState(false)

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
  const [copiedAutocomplete, setCopiedAutocomplete] = useState(false)

  // Format-menu state. The "Try a format" chip in the title card opens a
  // small dropdown of the six VIRAL_FORMATS; click any to populate the
  // textarea. Outside-click closes via a document mousedown listener
  // scoped to the formatMenuRef wrapper.
  const [formatMenuOpen, setFormatMenuOpen] = useState(false)
  const formatMenuRef = useRef(null)
  useEffect(() => {
    if (!formatMenuOpen) return
    const onDown = (e) => {
      if (formatMenuRef.current && !formatMenuRef.current.contains(e.target)) {
        setFormatMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [formatMenuOpen])

  // Description optimizer state
  const [selectedTitle, setSelectedTitle] = useState(saved.selectedTitle || null)
  const [currentDesc, setCurrentDesc]     = useState(saved.currentDesc || '')
  const [descLoading, setDescLoading]     = useState(false)
  const [descResult, setDescResult]       = useState(saved.descResult || null)
  const [descKeywords, setDescKeywords]   = useState(saved.descKeywords || [])
  const [descError, setDescError]         = useState('')
  const [copiedDesc, setCopiedDesc]       = useState(null)
  const descRef      = useRef(null)
  const titleInputRef = useRef(null)
  const [prefillBanner, setPrefillBanner] = useState(false)

  // Pre-fill title from Video Ideas tab (localStorage) or from the
  // dashboard NicheHeroCard "Open in SEO Studio" handoff (sessionStorage).
  useEffect(() => {
    try {
      const heroTitle = sessionStorage.getItem('seoOptimizer_prefilledTitle')
      const heroKw    = sessionStorage.getItem('seoOptimizer_prefilledKeyword')
      if (heroTitle) {
        sessionStorage.removeItem('seoOptimizer_prefilledTitle')
        sessionStorage.removeItem('seoOptimizer_prefilledKeyword')
        setTitle(heroTitle)
        if (heroKw) setSelectedKeyword(heroKw)
        setPrefillBanner(true)
        setTimeout(() => titleInputRef.current?.focus(), 80)
        setTimeout(() => setPrefillBanner(false), 5000)
        return
      }
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
    saveToDisk({ title, result, selectedTitle, currentDesc, descResult, descKeywords, intentOptions, selectedKeyword })
  }, [title, result, loading, loadingIntent, selectedTitle, currentDesc, descResult, descKeywords, intentOptions, selectedKeyword])

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
    setDescKeywords([])
    setDescError('')
  }

  // ── Reports tab: fetch, reopen, delete ──────────────────────────────────
  async function fetchReports() {
    setReportsLoading(true)
    try {
      const res = await fetch(`${API}/seo/reports`, { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      setReports(data.reports || [])
    } catch {}
    finally { setReportsLoading(false) }
  }

  // Fetch reports on mount (one-shot) and again whenever a new analysis
  // completes, so the list stays current without a hard refresh.
  useEffect(() => { fetchReports() }, [])
  useEffect(() => {
    if (result && !loading) fetchReports()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  function openReport(report) {
    // Rehydrate state from the persisted row and jump back to the editor.
    setTitle(report.title || '')
    setResult(report.result || null)
    setSelectedKeyword(report.confirmed_keyword || '')
    setIntentOptions(null)  // picker is for the current title — not rehydrated
    setSelectedTitle(report.selected_title || null)
    setCurrentDesc(report.current_desc || '')
    setDescResult(report.desc_result || null)
    setDescKeywords(report.desc_keywords || [])
    setError('')
    setDescError('')
    setActiveTab('new')
    // Scroll to top so the reopened analysis is visible
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteReport(reportId, e) {
    if (e) { e.stopPropagation() }
    // Optimistic: drop from the list immediately
    setReports(prev => prev.filter(r => r.id !== reportId))
    try {
      await fetch(`${API}/seo/reports/${reportId}`, { method: 'DELETE', credentials: 'include' })
    } catch {
      // Silent — if the delete failed the next fetchReports call will restore it.
    }
  }

  async function handleSubmitTitle() {
    if (!title.trim()) return
    if (loadingIntent || loading) return  // guard against double-submit (Enter + click)
    // Client-side short-circuit for free-tier locked users. Avoids any
    // backend roundtrip and Claude calls; backend gates too as defense.
    if (seoGated) {
      setCreditsOut(true)
      return
    }
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
    // Same client-side gate as handleSubmitTitle. Catches the direct-analyze
    // path (e.g. picking an intent or chaining from a fallback).
    if (seoGated) {
      setCreditsOut(true)
      return
    }
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
      if (res.status === 402) { setCreditsOut(true); return }
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      setResult(data)
      setIntentOptions(null)
      window.dispatchEvent(new CustomEvent('ytg:credits-changed'))
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
    setDescKeywords([])
    setDescError('')
    setTimeout(() => descRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  async function handleGenerateDesc() {
    if (!selectedTitle) return
    setDescLoading(true)
    setDescError('')
    setDescResult(null)
    setDescKeywords([])
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
            autocomplete_terms:
              result?.autocomplete_terms || null,
          }),
        }
      )
      const data = await res.json()
      if (res.status === 402) { setCreditsOut(true); return }
      if (!res.ok) {
        setDescError(
          data.error || 'Generation failed.'
        )
        return
      }
      setDescResult(data.descriptions)
      setDescKeywords(Array.isArray(data.top_keywords) ? data.top_keywords : [])
      window.dispatchEvent(new CustomEvent('ytg:credits-changed'))
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

  // Intent-based paywall: render the normal SEO Studio for everyone. Gated
  // users only hit the upgrade modal when they click Run. No Claude burned.

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
     {/* 1040 centered column — every polished feature page (Video Ideas / Thumbnail / Overview) wraps content
         in this. Don't drop it; the 2-col Preview/Formats grid stretches without an upper bound otherwise. */}
     <div style={{ maxWidth: 1040, margin: '0 auto' }}>

      {/* Header — Overview pattern: H1 (24/800/-0.6) + meta line with · separators + action buttons on right.
          alignItems: flex-end so the H1 baseline aligns with the button bottom edge. */}
      {(() => {
        // Relative timestamp helper (inline, so this page doesn't need a shared import)
        const relTime = (iso) => {
          if (!iso) return ''
          const d = new Date(iso)
          if (isNaN(d.getTime())) return ''
          const diffMs = Date.now() - d.getTime()
          const sec = Math.floor(diffMs / 1000)
          if (sec < 60) return 'just now'
          const min = Math.floor(sec / 60)
          if (min < 60) return `${min}m ago`
          const hr = Math.floor(min / 60)
          if (hr < 24) return `${hr}h ago`
          const day = Math.floor(hr / 24)
          if (day < 7) return `${day}d ago`
          return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        }
        const lastSearchAt = result?._searched_at || result?.analyzed_at
        return (
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 6, lineHeight: 1.1 }}>SEO Optimizer</h1>
            {/* Meta line with · separators, matches Overview's "Stats from Xh ago · Audited Xd ago" pattern */}
            <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.4, display: 'flex', gap: 0, flexWrap: 'wrap' }}>
              <span>Your title against live competitor data.</span>
              {lastSearchAt && (
                <span style={{ marginLeft: 8 }}>· Last searched {relTime(lastSearchAt)}</span>
              )}
            </p>
          </div>
        </div>
        {(title || result) && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginBottom: 2 }}>
            <button onClick={handleClear} className="seo-btn" style={{ flexShrink: 0 }}>
              Clear
            </button>
          </div>
        )}
      </div>
        )
      })()}

      {/* ── Tabs — "New analysis" vs. "Reports (N)" ─────────────────────────
          Reports are past /seo/analyze runs persisted server-side
          (SeoAnalysisCache). Clicking a report rehydrates the editor. */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'new',     label: 'New analysis' },
          { key: 'reports', label: reports.length > 0 ? `Reports (${reports.length})` : 'Reports' },
        ].map(({ key, label }) => {
          const active = activeTab === key
          return (
            <button key={key}
              onClick={() => setActiveTab(key)}
              style={{
                fontSize: 12.5, fontWeight: 700, padding: '7px 16px',
                borderRadius: 100,
                border: active ? 'none' : `1px solid ${C.border}`,
                background: active ? C.red : '#ffffff',
                color: active ? '#ffffff' : C.text2,
                cursor: 'pointer', fontFamily: 'inherit',
                letterSpacing: '-0.1px',
                boxShadow: active ? '0 1px 3px rgba(229,37,27,0.28), 0 4px 14px rgba(229,37,27,0.22)' : 'none',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = C.text3; e.currentTarget.style.color = C.text1 } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = C.border;  e.currentTarget.style.color = C.text2 } }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {activeTab === 'new' && (<>

      {/* Input area — hero input on top, then 2-col (Preview | Formats) */}
      <div style={{ marginBottom: 16 }}>

        {/* ── Title input card — single source of truth for the title plus
              its meta. Three optical rows inside: eyebrow + char count,
              the textarea, then ONE action row carrying status + format
              dropdown + Analyse. Spacing and chips mirror VideoIdeas
              IdeaCard (frontend/src/pages/VideoIdeas.jsx:392-420) and
              the Feed ytg-stat-card pattern (frontend/src/pages/
              Dashboard.jsx:1140-1254). ── */}
        <div className="seo-glass-card" style={{ padding: '22px', marginBottom: 14 }}>

          {/* Row 1 — eyebrow + single char-count against the largest surface
              cap. Drops the redundant per-surface breakdown that used to
              repeat the same number three times. */}
          {(() => {
            const len = title.length
            const cap = 70
            const inIdeal = len >= 50 && len <= cap
            const over    = len > cap
            const ccColor = over ? C.red : inIdeal ? C.green : C.text3
            return (
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.10em' }}>Your video title</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: ccColor,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.05px', whiteSpace: 'nowrap',
                }}>
                  {len}<span style={{ color: C.text4, fontWeight: 500 }}>/{cap}</span>
                </span>
              </div>
            )
          })()}

          {/* Prefill banner — only when prefilled. Lives inside the card,
              ABOVE the textarea so it doesn't crowd the action row. */}
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

          {/* Row 2 — the textarea itself. Unchanged styling. */}
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

          {/* Row 3 — single action row carrying status chip + format dropdown +
              Analyse button. All three elements sit on the same optical
              baseline (~36px tall) so the row reads as one band. */}
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>

            {/* Surface-fit status chip. One verdict, native title= tooltip
                carries the per-surface breakdown on hover so the page doesn't
                permanently allocate three rows of repeated numbers. */}
            {title.trim() && (() => {
              const surfaces = [
                { label: 'Feed',    maxChars: 45 },
                { label: 'Mobile',  maxChars: 55 },
                { label: 'Desktop', maxChars: 70 },
              ]
              const cuts = surfaces.filter(s => title.length > s.maxChars)
              const allFit  = cuts.length === 0
              const text    = allFit
                ? 'Fits all 3 surfaces'
                : `Cuts on ${cuts.map(s => s.label.toLowerCase()).join(' + ')}`
              const color   = allFit ? C.green : C.red
              const bg      = allFit ? 'rgba(5,150,105,0.07)'  : 'rgba(229,37,27,0.07)'
              const bdr     = allFit ? 'rgba(5,150,105,0.22)' : 'rgba(229,37,27,0.22)'
              const tooltip = surfaces.map(s => `${s.label} ${title.length}/${s.maxChars}`).join(' · ')
              return (
                <span title={tooltip} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '8px 12px', borderRadius: 99,
                  background: bg, border: `1px solid ${bdr}`,
                  color, fontSize: 11.5, fontWeight: 700,
                  letterSpacing: '-0.05px',
                  cursor: 'help',
                  height: 36, boxSizing: 'border-box',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: color, flexShrink: 0 }}/>
                  {text}
                </span>
              )
            })()}

            {/* Format dropdown — single neutral chip + absolutely-positioned
                menu of the six VIRAL_FORMATS. Replaces the row of 6 always-on
                pills. Chevron rotates 180 on open. */}
            <div ref={formatMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setFormatMenuOpen(o => !o)}
                aria-expanded={formatMenuOpen}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '8px 14px', borderRadius: 99,
                  background: formatMenuOpen ? 'rgba(229,37,27,0.06)' : '#ffffff',
                  border: `1px solid ${formatMenuOpen ? 'rgba(229,37,27,0.35)' : 'rgba(0,0,0,0.10)'}`,
                  color: formatMenuOpen ? C.red : C.text2,
                  fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.05px',
                  fontFamily: 'inherit', cursor: 'pointer',
                  transition: 'background 0.14s, border-color 0.14s, color 0.14s',
                  height: 36, boxSizing: 'border-box', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!formatMenuOpen) { e.currentTarget.style.background = 'rgba(229,37,27,0.06)'; e.currentTarget.style.borderColor = 'rgba(229,37,27,0.35)'; e.currentTarget.style.color = C.red } }}
                onMouseLeave={e => { if (!formatMenuOpen) { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.10)'; e.currentTarget.style.color = C.text2 } }}
              >
                Try a format
                <svg width="10" height="10" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transition: 'transform 0.18s', transform: formatMenuOpen ? 'rotate(180deg)' : 'none' }}>
                  <path d="M3 5l3.5 3.5L10 5"/>
                </svg>
              </button>
              {formatMenuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                  width: 320, maxHeight: 360, overflow: 'auto',
                  background: '#ffffff',
                  border: '1px solid #e6e6ec', borderRadius: 12,
                  boxShadow: '0 6px 24px rgba(0,0,0,0.10)',
                  zIndex: 20, padding: 4,
                }}>
                  {VIRAL_FORMATS.map((fmt, idx) => (
                    <button
                      key={fmt.key}
                      type="button"
                      onClick={() => { setTitle(fmt.example); setFormatMenuOpen(false) }}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '10px 12px', borderRadius: 8,
                        background: 'transparent', border: 'none',
                        cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', flexDirection: 'column', gap: 4,
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fafafb' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <span style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {fmt.label}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: C.text1, letterSpacing: '-0.05px', lineHeight: 1.4 }}>
                        {fmt.example}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}/>

            {/* Analyse — primary CTA. Height matches the chips so the row is
                one visual band. */}
            <button onClick={handleSubmitTitle} disabled={loading || loadingIntent || !title.trim()}
              className="seo-btn-primary" style={{ fontSize: 13, padding: '0 20px', height: 36, lineHeight: 1 }}>
              {loadingIntent ? (
                <><SpinIcon /> Identifying intent…</>
              ) : loading ? (
                <><SpinIcon /> Researching…</>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/>
                  </svg>
                  <span>Analyse &amp; suggest titles</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginLeft: 2 }}>· 1 credit</span>
                </>
              )}
            </button>
          </div>

          {/* Indeterminate progress bar — sits below the action row so it
              doesn't disrupt the row's vertical rhythm. */}
          {(loading || loadingIntent) && (
            <div style={{ marginTop: 12, width: '100%', height: 3, background: 'rgba(229,37,27,0.12)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: '45%', height: '100%', background: C.red, borderRadius: 99, animation: 'seoLoadingSlide 1.4s ease-in-out infinite' }}/>
            </div>
          )}
        </div>

        {/* The old 2-column Preview + Format-templates block lived here. Both
            collapsed into a single inline meta line and a horizontal pill row
            directly under the title input (just above this comment), so the
            entire zone is now ~240px shorter and the page no longer opens with
            half a screen of white empty card. */}
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
        <div className="seo-result-section" style={{ marginTop: 40 }}>
          {/* The old H2 "Title analysis" + 1-line paragraph above the card was
              redundant: the card's own eyebrow now carries the niche keyword,
              the videos-analysed count and the lift chip. Dropping the header
              saves a row and stops repeating the same context twice. */}

          {/* ── Title comparison hero — eyebrow + two title rows + footer
                + breakdown disclosure. Replaces the old card that truncated
                the titles, repeated the score breakdown's purpose, and
                buried the niche keyword in the section header. ── */}
          {result.suggestions?.length > 0 && (
            <TitleComparisonHero
              userTitle={title}
              userScore={Number.isFinite(result.score) ? result.score : 0}
              userBreakdown={result.breakdown}
              suggestions={result.suggestions}
              nicheLabel={result.primary_phrase}
              videosFound={result.videos_found}
              onPick={handleSelectTitle}
            />
          )}

          {/* AI suggestion error */}
          {result.suggestion_error && !result.suggestions?.length && (
            <div style={{ background: C.amberBg, border: `1px solid ${C.amberBdr}`, borderLeft: `3px solid ${C.amber}`, borderRadius: '0 12px 12px 0', padding: '14px 18px', marginBottom: 24 }}>
              <p style={{ ...T.innerLabel, color: C.amber, marginBottom: 6 }}>AI suggestions unavailable</p>
              <p style={T.innerText}>{result.suggestion_error}</p>
            </div>
          )}

          {/* ── Search intent analysis — copies Overview's Priority Actions InsightCard design exactly.
                Stacked cards: 3px colored top border, solid rank badge, category eyebrow + problem title,
                severity pill on the right, hairline divider, 3-col body grid (Why now blue / Action / Outcome green). ── */}
          {result.intent_analysis?.search_intent && (() => {
            const ia = result.intent_analysis
            const clean = s => typeof s === 'string'
              ? s.replace(/\s+[-–—]\s+/g, ', ').replace(/\s+,\s*/g, ', ').replace(/\s{2,}/g, ' ').trim()
              : s
            const searchIntent   = clean(ia.search_intent)
            const viewerProfile  = clean(ia.viewer_profile)
            const emotionalDrv   = clean(ia.emotional_driver)
            const gap            = clean(ia.gap_opportunity) || 'No single gap detected. Explore the keyword list below — each phrase is a different angle to own.'
            const overused       = clean(ia.overused_angle)
            const hasOverused    = !!overused

            // Matches Dashboard SEV palette exactly (Dashboard.jsx:876-882).
            const greenColor = '#059669'
            const redColor   = '#dc2626'

            return (
              <div style={{ marginBottom: 24, marginTop: 40 }}>
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Search intent analysis</h2>
                  <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>
                    What to chase, what to avoid in this niche · 2 insights
                  </p>
                </div>

                {/* Insight #1 — Opportunity. The gap by definition is unused, so the
                    saturation row reads 0 / N ("Wide open"). Lucide Lightbulb anchors
                    the row visually instead of a numbered amber badge. */}
                <IntentInsightRow
                  IconCmp={Lightbulb}
                  eyebrowLabel="Opportunity"
                  eyebrowColor={greenColor}
                  headline={gap}
                  chipLabel="Act on this"
                  chipColor={greenColor}
                  totalVideos={result.videos_found || 12}
                  filledVideos={0}
                  whyLabel="Who's searching"
                  whyText={viewerProfile}
                  actionLabel="Search intent"
                  actionText={searchIntent}
                  outcomeLabel="Emotional pull"
                  outcomeText={emotionalDrv}
                />

                {/* Insight #2 — Overused angle. By definition most ranking videos use it,
                    so the saturation row fills ~75% to communicate "Saturated". */}
                {hasOverused && (
                  <IntentInsightRow
                    IconCmp={AlertTriangle}
                    eyebrowLabel="Overused angle"
                    eyebrowColor={redColor}
                    headline={overused}
                    chipLabel="Avoid"
                    chipColor={redColor}
                    totalVideos={result.videos_found || 12}
                    filledVideos={Math.round((result.videos_found || 12) * 0.75)}
                    whyLabel="Why it's saturated"
                    whyText="Most top-ranking titles in this niche already use this framing, so a new video starting from the same angle blends in instead of earning a click."
                    actionLabel="Do instead"
                    actionText="Lead with the struggle, the choice, or the story behind the outcome, not the outcome itself. That is the gap above."
                    outcomeLabel="Expected lift"
                    outcomeText="Pattern-interrupt framings earn higher CTR on the suggested feed because they stand out from the wall of identical titles."
                  />
                )}

              </div>
            )
          })()}

          {/* Niche Heat — hero anchor above the suggestion stack. Two
              horizontal scrolling strips: Winning videos (16:9 thumbs)
              and Winning shorts (9:16 thumbs), each thumb tagged with a
              red multiplier pill vs the niche median. 4-tile stat
              strip across the bottom. Replaces both the old text-heavy
              "Competitor set" list and the earlier WinnersStrip
              experiment. */}
          {(result.top_videos?.length > 0 || result.top_shorts?.length > 0) && (
            <div style={{ marginBottom: 28, marginTop: 24 }}>
              <NicheHeatCard
                videos={result.top_videos}
                shorts={result.top_shorts}
                primaryPhrase={result.primary_phrase}
              />
            </div>
          )}

          {/* AI-Suggested Titles — H2+subtitle header pattern (matches Overview). */}
          {result.suggestions?.length > 0 && (
            <div style={{ marginBottom: 24, marginTop: 32 }}>
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

              {/* Stacked suggestion cards. Each card is a self-contained
                  micro-analytics widget: severity stripe, bold title hero,
                  quality bars + length sweet-spot, inline notes. The
                  shared thumbnail proof lives in NicheHeatCard above. */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {result.suggestions.map((s, i) => (
                  <SuggestionRow
                    key={i}
                    s={s}
                    i={i}
                    primaryPhrase={result.primary_phrase}
                    nicheVideos={result.top_videos}
                    isSelected={selectedTitle === s.title}
                    isCopied={copied === i}
                    onCopy={() => copyTitle(s.title, i)}
                    onSelect={() => handleSelectTitle(s.title)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              3 STACKED CARDS — identical shell, hairline-divider header,
              shared typography. Pattern borrowed from Overview's Priority
              Actions section (one card per concept, neat vertical rhythm).
              ═══════════════════════════════════════════════════════════════ */}

          {/* ── Keyword research — amber-topped card matching Keyword discovery / Competitor set ── */}
          {result.keyword_scores?.length > 0 && (
            <>
              <div style={{ marginBottom: 16, marginTop: 40 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Keyword research</h2>
                <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>
                  Related phrases ranked by opportunity · click any to use as title
                </p>
              </div>

              {/* Niche map — labeled volume × competition viz. Top-5 phrases get inline labels,
                  beeswarm-style jitter so dots don't pile, sweet-spot band in the top-left, and
                  a Top-3 clickable chip strip below. Click any dot or chip to set as your title. */}
              <NicheMap keywords={result.keyword_scores} onPick={setTitle}/>

              <div className="seo-suggestion-card" style={{
                borderTop: `3px solid ${C.amber}`,
                marginBottom: 24,
              }}>
                <div style={{ padding: '18px 22px 20px' }}>
                  {/* Eyebrow + big tabular count — same pattern as Competitor set */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>Related phrases</p>
                      <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>Sorted by score · click any to use as your title</p>
                    </div>
                    <p style={{ fontSize: 26, fontWeight: 800, color: C.text1, letterSpacing: '-0.8px', fontVariantNumeric: 'tabular-nums', flexShrink: 0, lineHeight: 1 }}>{result.keyword_scores.length}</p>
                  </div>

                  <div style={{ height: 1, background: C.border, margin: '0 0 14px' }}/>

                  {/* 2-col grid with amber vertical divider between columns (matches Competitor set) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 0, rowGap: 14 }}>
                    {result.keyword_scores.map((kw, i) => {
                      const scColor    = kw.score >= 75 ? C.green : kw.score >= 50 ? C.amber : C.red
                      const isRightCol = i % 2 === 1
                      return (
                        <div key={kw.phrase} className="seo-kw-row"
                          role="button" tabIndex={0}
                          onClick={() => setTitle(kw.phrase)}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTitle(kw.phrase) } }}
                          title={`Volume ${kw.volume} · Competition ${kw.competition} · Score ${kw.score} — click to use as title`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                            paddingLeft:  isRightCol ? 20 : 0,
                            paddingRight: isRightCol ? 0 : 20,
                            borderLeft: isRightCol ? `1px solid ${C.amberBdr}` : 'none',
                          }}>
                          <span className="seo-kw-phrase" style={{ fontSize: 13, color: C.text2, fontWeight: 400, width: 180, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.12s' }}>{kw.phrase}</span>
                          <div style={{ flex: 1, height: 4, background: '#eeeef3', borderRadius: 99, overflow: 'hidden', minWidth: 40 }}>
                            <div style={{ width: `${kw.score}%`, height: '100%', background: scColor, borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}/>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: scColor, fontVariantNumeric: 'tabular-nums', minWidth: 26, textAlign: 'right', flexShrink: 0 }}>{kw.score}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Keyword discovery — autocomplete + competitor tags, unified ── */}
          {(result.autocomplete_terms?.length > 0 || result.top_tags?.length > 0) && (
            <>
              <div style={{ marginBottom: 20, marginTop: 40 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Keyword discovery</h2>
                <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>
                  Real searches and competitor tags · borrow what's already working
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {/* Block 1 — YouTube autocomplete */}
                {result.autocomplete_terms?.length > 0 && (
                  <div className="seo-suggestion-card" style={{
                    borderTop: `3px solid ${C.amber}`,
                  }}>
                    <div style={{ padding: '18px 22px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>YouTube autocomplete</p>
                          <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>Real searches people type · click to use as your title</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                          <p style={{ fontSize: 26, fontWeight: 800, color: C.text1, letterSpacing: '-0.8px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{result.autocomplete_terms.length}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(result.autocomplete_terms.join(', '))
                              setCopiedAutocomplete(true)
                              setTimeout(() => setCopiedAutocomplete(false), 1800)
                            }}
                            className="seo-btn-primary"
                            style={{ fontSize: 12, padding: '9px 18px' }}>
                            {copiedAutocomplete ? '✓ Copied all' : 'Copy all'}
                          </button>
                        </div>
                      </div>
                      <div style={{ height: 1, background: C.border, margin: '0 0 16px' }}/>
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
                  </div>
                )}

                {/* Block 2 — Suggested tags */}
                {result.top_tags?.length > 0 && (
                  <div className="seo-suggestion-card" style={{
                    borderTop: `3px solid ${C.amber}`,
                  }}>
                    <div style={{ padding: '18px 22px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>Suggested tags</p>
                          <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>Pulled from ranking competitors · click one to copy</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                          <p style={{ fontSize: 26, fontWeight: 800, color: C.text1, letterSpacing: '-0.8px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{result.top_tags.length}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(result.top_tags.join(', '))
                              setCopiedTags(true)
                              setTimeout(() => setCopiedTags(false), 1800)
                            }}
                            className="seo-btn-primary"
                            style={{ fontSize: 12, padding: '9px 18px' }}>
                            {copiedTags ? '✓ Copied all' : 'Copy all'}
                          </button>
                        </div>
                      </div>
                      <div style={{ height: 1, background: C.border, margin: '0 0 16px' }}/>
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
                  </div>
                )}
              </div>
            </>
          )}

          {/* The old "Competitor set" detail list lived here. It was
              redundant with the new NicheHeatCard at the top of the
              page, which is more visual (HD thumbnails + bar chart +
              stat strip), so we removed the duplicate. The full table
              view is still accessible inside the Reports tab. */}

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

              {/* Picked title + action cluster (Change title + Regenerate when descriptions exist) — single row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...T.sectionLabel, marginBottom: 8 }}>Picked title</p>
                  <p style={{ fontSize: 14, color: C.text1, lineHeight: 1.55, fontWeight: 700, letterSpacing: '-0.1px' }}>&ldquo;{selectedTitle}&rdquo;</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  {descResult?.length > 0 && (
                    <button onClick={() => { setDescResult(null); setDescKeywords([]); setDescError('') }} className="seo-btn">
                      Regenerate
                    </button>
                  )}
                  <button onClick={() => { setSelectedTitle(null); setDescResult(null); setDescError('') }}
                    className="seo-btn">
                    Change title
                  </button>
                </div>
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
                        Generate 3 descriptions · 1 credit
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {descResult.map((d, i) => (
                      <DescriptionCard key={i} d={d} idx={i} copiedDesc={copiedDesc} onCopy={copyDesc} />
                    ))}
                  </div>

                  {/* Top keywords woven into the descriptions — surfaced as chips so the user can see and copy them separately. */}
                  {descKeywords.length > 0 && (
                    <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                          Top {descKeywords.length} keywords used
                        </p>
                        <button
                          onClick={() => { navigator.clipboard.writeText(descKeywords.join(', ')) }}
                          style={{ fontSize: 11.5, fontWeight: 600, color: C.text3, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, letterSpacing: '-0.05px' }}
                          onMouseEnter={e => { e.currentTarget.style.color = C.text1 }}
                          onMouseLeave={e => { e.currentTarget.style.color = C.text3 }}>
                          Copy all →
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {descKeywords.map(kw => (
                          <span key={kw}
                            role="button" tabIndex={0}
                            onClick={() => navigator.clipboard.writeText(kw)}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigator.clipboard.writeText(kw) } }}
                            title="Click to copy"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              fontSize: 12, fontWeight: 600, color: C.green,
                              background: 'rgba(5,150,105,0.07)',
                              border: '1px solid rgba(5,150,105,0.22)',
                              padding: '5px 11px', borderRadius: 20,
                              cursor: 'pointer',
                              letterSpacing: '-0.05px',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(5,150,105,0.12)'; e.currentTarget.style.borderColor = 'rgba(5,150,105,0.40)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(5,150,105,0.07)'; e.currentTarget.style.borderColor = 'rgba(5,150,105,0.22)' }}>
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <polyline points="1.5,6.5 5,10 10.5,2"/>
                            </svg>
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Featured hashtags — first 3 hashtags YouTube auto-features above the title,
                      mined from this creator's recent videos and ranked by views. Same chip
                      pattern as keywords, just with # symbol + click-to-copy. */}
                  {featuredHashtags.length > 0 && (
                    <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, gap: 10, flexWrap: 'wrap' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                          Hashtags featured on your top videos
                        </p>
                        <button
                          onClick={() => { navigator.clipboard.writeText(featuredHashtags.map(h => h.tag).join(' ')) }}
                          style={{ fontSize: 11.5, fontWeight: 600, color: C.text3, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, letterSpacing: '-0.05px' }}
                          onMouseEnter={e => { e.currentTarget.style.color = C.text1 }}
                          onMouseLeave={e => { e.currentTarget.style.color = C.text3 }}>
                          Copy all →
                        </button>
                      </div>
                      <p style={{ fontSize: 12, color: C.text3, margin: '0 0 10px', lineHeight: 1.5 }}>
                        These are the hashtags YouTube has been auto-featuring above your titles, ranked by the views they helped pull.
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {featuredHashtags.map(h => (
                          <span key={h.tag}
                            role="button" tabIndex={0}
                            onClick={() => navigator.clipboard.writeText(h.tag)}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigator.clipboard.writeText(h.tag) } }}
                            title={`Used on ${h.count} ${h.count === 1 ? 'video' : 'videos'} · ${h.totalViews.toLocaleString()} total views — click to copy`}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              fontSize: 12, fontWeight: 600, color: C.green,
                              background: 'rgba(5,150,105,0.07)',
                              border: '1px solid rgba(5,150,105,0.22)',
                              padding: '5px 11px', borderRadius: 20,
                              cursor: 'pointer',
                              letterSpacing: '-0.05px',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(5,150,105,0.12)'; e.currentTarget.style.borderColor = 'rgba(5,150,105,0.40)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(5,150,105,0.07)'; e.currentTarget.style.borderColor = 'rgba(5,150,105,0.22)' }}>
                            {h.tag}
                            <span style={{ fontSize: 10.5, fontWeight: 600, color: C.text3, fontVariantNumeric: 'tabular-nums' }}>
                              ×{h.count}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              </div>
            </>
          )}
        </div>
      )}

      </>)}

      {/* ── Reports tab — list of past /seo/analyze runs ──────────────────── */}
      {activeTab === 'reports' && (
        <div>
          {reportsLoading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: C.text3, fontSize: 13 }}>
              Loading reports…
            </div>
          ) : reports.length === 0 ? (
            <div className="seo-glass-card" style={{
              padding: '56px 24px', textAlign: 'center',
            }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.text1, letterSpacing: '-0.2px', marginBottom: 8 }}>
                No reports yet
              </p>
              <p style={{ fontSize: 13.5, color: C.text3, maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
                Run a title analysis and it'll show up here — so you can always come back to a report you've already paid for.
              </p>
            </div>
          ) : (
            <div>
              {reports.map(r => {
                const relTime = (iso) => {
                  if (!iso) return ''
                  const d = new Date(iso)
                  if (isNaN(d.getTime())) return ''
                  const sec = Math.floor((Date.now() - d.getTime()) / 1000)
                  if (sec < 60) return 'just now'
                  const min = Math.floor(sec / 60)
                  if (min < 60) return `${min}m ago`
                  const hr = Math.floor(min / 60)
                  if (hr < 24) return `${hr}h ago`
                  const day = Math.floor(hr / 24)
                  if (day < 7) return `${day}d ago`
                  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                }
                const suggestionCount = Array.isArray(r.result?.suggestions) ? r.result.suggestions.length : 0
                const hasDescription  = !!r.desc_result
                return (
                  <div key={r.id} className="seo-report-wrapper">
                    <button
                      className="seo-report-remove"
                      title="Remove report"
                      onClick={e => deleteReport(r.id, e)}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 5.5l.5 5M9 5.5l-.5 5M3 3.5l.7 8.5h6.6L11 3.5"/>
                      </svg>
                    </button>
                    <div className="seo-report-header" onClick={() => openReport(r)}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <p style={{ fontWeight: 800, fontSize: 14, color: '#111114',
                            letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden',
                            textOverflow: 'ellipsis' }}>
                            {r.title}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          {r.confirmed_keyword && (
                            <span className="seo-report-chip">
                              <span className="val">{r.confirmed_keyword}</span>
                              <span className="lbl">keyword</span>
                            </span>
                          )}
                          {suggestionCount > 0 && (
                            <span className="seo-report-chip">
                              <span className="val">{suggestionCount}</span>
                              <span className="lbl">AI title{suggestionCount === 1 ? '' : 's'}</span>
                            </span>
                          )}
                          {hasDescription && (
                            <span className="seo-report-chip">
                              <span className="val">Ready</span>
                              <span className="lbl">description</span>
                            </span>
                          )}
                          <span style={{ fontSize: 12, color: '#9595a4', fontWeight: 500, marginLeft: 2 }}>
                            · {relTime(r.updated_at)}
                          </span>
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, borderLeft: '1px solid rgba(0,0,0,0.07)',
                        paddingLeft: 16, marginLeft: 4, paddingRight: 28 }}>
                        <button className="seo-report-cta"
                          onClick={e => { e.stopPropagation(); openReport(r) }}>
                          Open report
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M4 2l4 4-4 4"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

     </div>{/* /1040 column */}

      {seoGated ? (
        <UpsellModal
          open={creditsOut}
          onClose={() => setCreditsOut(false)}
          title="Unlock SEO Studio"
          description="Rewrite your titles, descriptions, and tags against the videos actually winning in your niche, with AI-scored keywords and three direction-picked title suggestions."
          bullets={[
            'AI-scored title alternatives with SEO, CTR, and hook breakdowns',
            'Description generator trained on your channel and your niche',
            'Keyword research with real search volume and competition',
          ]}
          showPackLink={false}
        />
      ) : (
        <CreditsEmptyModal
          open={creditsOut}
          onClose={() => setCreditsOut(false)}
          featureName="SEO analyses"
        />
      )}
    </div>
  )
}
