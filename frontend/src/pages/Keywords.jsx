import React, { useState, useEffect } from 'react'
import UpsellGate from '../components/UpsellGate'

const API = import.meta.env.VITE_API_URL || ''
const LS_KEY = 'ytg_keywords_v1'

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null') } catch { return null }
}
function saveToDisk(keyword, result) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ keyword, result })) } catch {}
}

/* ─── Inter loaded page-scoped ──────────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('kw-inter-font')) {
  const link = document.createElement('link')
  link.id = 'kw-inter-font'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
  document.head.appendChild(link)
}

/* ─── Styles — system elevation (0 1/3 + 0 4/16), no hover lifts, clean
       hairline borders, 16px card radius. Matches Overview / Videos /
       Outliers / Thumbnail IQ / Video Ideas. ─────────────────────────── */
function useKwStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-kw-styles')) return
    const style = document.createElement('style')
    style.id = 'ytg-kw-styles'
    style.textContent = `
      .kw-page * { box-sizing: border-box; font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
      .kw-page p, .kw-page span, .kw-page div { margin: 0; }

      @keyframes kwSpin { to { transform: rotate(360deg) } }
      @keyframes kwIn   { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
      .kw-in { animation: kwIn 0.26s ease both; }

      /* Card — matches SEO Studio's .seo-suggestion-card exactly
         (SeoOptimizer.jsx:33). That's the benchmark the user wants. */
      .kw-card {
        background: #ffffff;
        border: 1px solid #e6e6ec;
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06);
        transition: box-shadow 0.2s, transform 0.2s;
      }
      .kw-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.09);
        transform: translateY(-1px);
      }

      /* Keyword row — matches SEO Studio's .seo-kw-row exactly. Phrase
         text darkens on hover. */
      .kw-row-seo:hover .kw-row-phrase { color: #0f0f13; }

      /* ── Detail modal (Outliers pattern) ───────────────────────────── */
      .kw-modal-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center;
        z-index: 100;
        animation: kwFadeIn 0.18s ease both;
        padding: 32px 24px;
      }
      .kw-modal {
        background: #f7f7fa;
        border: 1px solid #e8e8ec;
        border-radius: 20px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.10);
        width: 100%; max-width: 1040px;
        max-height: calc(100vh - 64px);
        overflow: auto;
        animation: kwSlideIn 0.22s cubic-bezier(0.2, 0.7, 0.3, 1) both;
      }
      .kw-modal::-webkit-scrollbar { width: 4px }
      .kw-modal::-webkit-scrollbar-thumb { background: #e0e0e6; border-radius: 4px }
      @keyframes kwFadeIn  { from { opacity: 0 } to { opacity: 1 } }
      @keyframes kwSlideIn { from { opacity: 0; transform: translateY(10px) scale(0.98) } to { opacity: 1; transform: none } }

      .kw-input {
        flex: 1; padding: 11px 18px;
        border-radius: 100px; border: 1px solid rgba(0,0,0,0.12);
        background: #ffffff; font-size: 13.5px;
        font-family: 'Inter', system-ui, sans-serif;
        outline: none; transition: border-color 0.18s, box-shadow 0.18s; color: #111114;
      }
      .kw-input::placeholder { color: #a0a0b0; font-weight: 400; }
      .kw-input:focus { border-color: rgba(0,0,0,0.3); box-shadow: 0 0 0 3px rgba(0,0,0,0.04); }

      .kw-btn-primary {
        background: #e5251b; color: #fff; border: none; border-radius: 100px;
        padding: 11px 20px; font-size: 13.5px; font-weight: 700;
        font-family: 'Inter', system-ui, sans-serif;
        cursor: pointer; white-space: nowrap;
        transition: filter 0.15s;
        letter-spacing: 0.01em;
        display: inline-flex; align-items: center; gap: 8px;
      }
      .kw-btn-primary:hover:not(:disabled) { filter: brightness(1.1); }
      .kw-btn-primary:disabled { background: #e0e0e6; color: #a0a0b0; cursor: not-allowed; }

      .kw-btn-ghost {
        background: #fff; color: #e5251b;
        border: 1px solid #e5251b; border-radius: 100px;
        padding: 11px 18px; font-size: 13.5px; font-weight: 600;
        font-family: 'Inter', system-ui, sans-serif;
        cursor: pointer; white-space: nowrap;
        transition: background 0.15s, border-color 0.15s;
        letter-spacing: 0.01em;
      }
      .kw-btn-ghost:hover { background: rgba(229,37,27,0.06); }

      /* Tab pills — match Competitors pattern (comp-tab-btn). */
      .kw-tab-btn {
        background: #ffffff; color: #4a4a58;
        border: 1px solid #e6e6ec; border-radius: 100px;
        padding: 8px 18px; font-size: 13px; font-weight: 600;
        font-family: 'Inter', system-ui, sans-serif;
        cursor: pointer; white-space: nowrap;
        transition: all 0.15s;
      }
      .kw-tab-btn:hover { border-color: #e5251b; color: #e5251b; }
      .kw-tab-btn.active {
        background: #e5251b; color: #fff; border-color: #e5251b;
        box-shadow: 0 1px 3px rgba(229,37,27,0.25), 0 4px 14px rgba(229,37,27,0.25);
      }

      /* Reports list — mirrors Competitors tracked accordion */
      .kw-report-wrapper { position: relative; margin-bottom: 12px; }
      .kw-report-header {
        background: #ffffff;
        border: 1px solid #e6e6ec;
        border-radius: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06);
        padding: 16px 20px;
        display: flex; align-items: center; gap: 16px;
        transition: box-shadow 0.15s, border-color 0.15s;
        cursor: pointer; user-select: none;
      }
      .kw-report-header:hover {
        box-shadow: 0 2px 6px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08);
        border-color: rgba(0,0,0,0.14);
      }
      .kw-report-remove {
        position: absolute; top: 12px; right: 12px;
        width: 28px; height: 28px; border-radius: 8px;
        border: 1px solid transparent; background: transparent;
        color: #c4c4cc; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        opacity: 0;
        transition: opacity 0.15s, background 0.15s, color 0.15s, border-color 0.15s;
        z-index: 2;
      }
      .kw-report-wrapper:hover .kw-report-remove { opacity: 1; }
      .kw-report-remove:hover {
        background: rgba(229,37,27,0.08);
        border-color: rgba(229,37,27,0.2);
        color: #e5251b;
      }
      .kw-report-cta {
        background: #e5251b; color: #fff;
        border: 1px solid #e5251b; border-radius: 100px;
        padding: 8px 18px; font-size: 12.5px; font-weight: 700;
        font-family: 'Inter', system-ui, sans-serif;
        cursor: pointer; white-space: nowrap;
        transition: filter 0.15s;
        display: flex; align-items: center; gap: 6px;
        box-shadow: 0 1px 3px rgba(229,37,27,0.20), 0 4px 14px rgba(229,37,27,0.25);
      }
      .kw-report-cta:hover { filter: brightness(1.07); }
      .kw-report-chip {
        display: inline-flex; align-items: baseline; gap: 4px;
        background: #f4f4f6; border: 1px solid rgba(0,0,0,0.09);
        border-radius: 8px; padding: 4px 10px;
      }
      .kw-report-chip .val { font-size: 12px; font-weight: 700; color: #111114; }
      .kw-report-chip .lbl { font-size: 11px; color: #9595a4; font-weight: 500; }

      /* Intent picker row — hairline card, hover bg change, no lift */
      .kw-intent-opt {
        display: flex; align-items: center; gap: 14px;
        padding: 13px 16px; border: 1px solid rgba(0,0,0,0.09);
        border-radius: 10px; cursor: pointer; background: #ffffff;
        transition: background 0.15s, border-color 0.15s;
      }
      .kw-intent-opt:hover { border-color: rgba(0,0,0,0.18); background: #f6f6f9; }


      /* Copy button — red brand pill. Matches SEO Studio's seo-btn-primary
         (SeoOptimizer.jsx:1453) so the theme-colour red shows up on every
         "take action now" moment across the app. */
      .kw-copy-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 16px; border-radius: 100px;
        font-size: 12px; font-weight: 700; letter-spacing: 0.01em;
        font-family: 'Inter', system-ui, sans-serif;
        background: #e5251b; color: #fff;
        border: none; cursor: pointer;
        transition: filter 0.15s;
      }
      .kw-copy-btn:hover { filter: brightness(1.1); }
      .kw-copy-btn.copied {
        background: #f0fdf4; color: #16a34a;
        border: 1px solid #bbf7d0;
        padding: 7px 15px; /* compensate for 1px border */
      }

      /* Cluster "Copy theme" button — neutral elevated pill.
         White bg, near-black text, hairline border, system-elevation
         shadow. Red is reserved for primary CTAs; this is a utility
         action repeated 5x so it stays quiet but tactile. */
      .kw-ghost-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 7px 15px; border-radius: 100px;
        font-size: 12px; font-weight: 700; letter-spacing: 0.01em;
        font-family: 'Inter', system-ui, sans-serif;
        background: #ffffff; color: #111114;
        border: 1px solid rgba(0,0,0,0.09); cursor: pointer;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05);
        transition: box-shadow 0.18s, transform 0.12s;
      }
      .kw-ghost-btn:hover {
        box-shadow: 0 2px 6px rgba(0,0,0,0.07), 0 8px 20px rgba(0,0,0,0.08);
        transform: translateY(-1px);
      }
      .kw-ghost-btn.copied {
        background: #f0fdf4; color: #16a34a;
        border-color: #bbf7d0;
        box-shadow: none;
        transform: none;
      }

      .kw-bar { height: 4px; border-radius: 4px; background: rgba(0,0,0,0.07); overflow: hidden; }
      .kw-bar-fill { height: 4px; border-radius: 4px; transition: width 0.5s ease; }

      .kw-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: kwSpin 0.7s linear infinite; flex-shrink: 0; }
    `
    document.head.appendChild(style)
  }, [])
}

/* ─── Design tokens — strict red/amber/green + neutrals, per the project
       palette rule. No blue/purple/teal anywhere. ───────────────────── */
const C = {
  red:     '#e5251b', redBg:   '#fff5f5', redBdr:   '#fecaca',
  green:   '#16a34a', greenBg: '#f0fdf4', greenBdr: '#bbf7d0',
  amber:   '#d97706', amberBg: '#fffbeb', amberBdr: '#fde68a',
  text1:   '#111114',
  text2:   '#52525b',
  text3:   '#a0a0b0',
  text4:   '#c0c0cc',
  border:  'rgba(0,0,0,0.09)',
  chipBg:  '#f4f4f6',
}

// Intent matching — semantic mapping within the strict palette:
//   exact   -> green  (win)
//   strong  -> amber  (secondary)
//   partial -> neutral grey pill (utility label)
const INTENT_TONE = {
  exact:   { color: C.green, bg: C.greenBg, bdr: C.greenBdr },
  strong:  { color: C.amber, bg: C.amberBg, bdr: C.amberBdr },
  partial: { color: C.text2, bg: C.chipBg,  bdr: C.border   },
}

function oppColor(s) { return s >= 70 ? C.green : s >= 45 ? C.amber : C.red }

/* ─── MomentumBadge — derived from YouTube competition data we already
       fetched. No extra API calls. Three states:
         - active    : newest top-5 video was published in the last 30 days
         - unclaimed : newest top-5 video is over 180 days old
         - steady    : in between — rendered as nothing (keeps rows clean) */
function MomentumBadge({ momentum }) {
  if (!momentum || momentum === 'steady') return null
  const config = momentum === 'active'
    ? { color: C.green, bg: C.greenBg, bdr: C.greenBdr, label: 'Active' }
    :                                                   { color: C.amber, bg: C.amberBg, bdr: C.amberBdr, label: 'Open' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 10, fontWeight: 700,
      color: config.color, background: config.bg,
      border: `1px solid ${config.bdr}`,
      borderRadius: 100, padding: '1px 7px',
      letterSpacing: '0.06em', textTransform: 'uppercase',
      flexShrink: 0,
    }}>{config.label}</span>
  )
}

/* Detail modal — Outliers DetailModal pattern. Header + 3-col playbook
   (Why it works / Quick actions / Why now) + action buttons. Opens on
   keyword row click; esc or overlay click to close. */
function KwDetailModal({ kw, C, onClose }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!kw) return null
  const comp      = kw.competition || {}
  const scColor   = oppColor(kw.opportunityScore)
  const actions   = buildQuickActions(kw)

  function copyKeyword() {
    navigator.clipboard.writeText(kw.keyword)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="kw-modal-overlay" onClick={onClose}>
      <div className="kw-modal" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px 28px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Keyword playbook</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: C.text1, lineHeight: 1.3, letterSpacing: '-0.3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kw.keyword}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
              <MomentumBadge momentum={kw.momentum} />
              <span style={{ fontSize: 13, fontWeight: 800, color: scColor, fontVariantNumeric: 'tabular-nums', padding: '3px 10px', border: `1px solid ${scColor}30`, borderRadius: 100 }}>
                {kw.opportunityScore}/100
              </span>
              <button onClick={copyKeyword}
                style={{ fontSize: 12, color: copied ? C.green : C.text2, background: '#fff', border: `1px solid ${copied ? C.greenBdr : C.border}`, borderRadius: 100, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                {copied ? 'Copied' : 'Copy keyword'}
              </button>
              <button onClick={onClose}
                style={{ fontSize: 12, color: C.text3, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 100, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                Close ✕
              </button>
            </div>
          </div>

          {/* 3-col playbook — exact Outliers pattern (blue / amber / green) */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 22px' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.text1, letterSpacing: '-0.3px', marginBottom: 16 }}>Keyword playbook</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 8 }}>
              {/* Blue — Why it works (numbered list, mirrors Quick actions) */}
              <div style={{ background: 'rgba(79,134,247,0.07)', border: '1px solid rgba(79,134,247,0.12)', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#4a7cf7', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Why it works</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7, margin: 0, padding: 0 }}>
                  {buildWhyItWorks(kw).map((s, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#4a7cf7', fontVariantNumeric: 'tabular-nums', lineHeight: 1.55, minWidth: 14 }}>{i + 1}.</span>
                      <span style={{ fontSize: 13, color: C.text1, lineHeight: 1.6, flex: 1 }}>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Amber — Quick actions (numbered list) */}
              <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.amber}`, borderRadius: '0 10px 10px 0', padding: '12px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.amber, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Quick actions</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7, margin: 0, padding: 0 }}>
                  {actions.map((s, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.amber, fontVariantNumeric: 'tabular-nums', lineHeight: 1.55, minWidth: 14 }}>{i + 1}.</span>
                      <span style={{ fontSize: 13, color: C.text1, lineHeight: 1.6, flex: 1 }}>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Green — Why now */}
              <div style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.14)', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Act on this because</p>
                <p style={{ fontSize: 13, color: C.text1, lineHeight: 1.65 }}>{buildWhyNow(kw)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Tooltip copy for each ranked-keyword row — folds together the real
   data signals so hovering gives the full story at a glance. */
function buildRowTooltip(kw) {
  const parts = [`${kw.intentMatch || '—'} match`, `Score ${kw.opportunityScore}`]
  const comp = kw.competition || {}
  if (comp.top_subs_median) {
    parts.push(`Top channels ~${fmtCompact(comp.top_subs_median)} subs`)
  }
  if (comp.top_views_median) {
    parts.push(`Top videos ~${fmtCompact(comp.top_views_median)} views`)
  }
  if (typeof comp.days_since_newest === 'number') {
    parts.push(`Newest top-5 video ${comp.days_since_newest}d ago`)
  }
  return parts.join(' · ')
}

/* Ordered list of "Why it works" signal points — rendered as a numbered
   list (same layout as Quick actions), so the panel reads clean. */
function buildWhyItWorks(kw) {
  const comp = kw.competition || {}
  const out = []
  const intentUp = (kw.intentMatch || '—').replace(/^\w/, c => c.toUpperCase())
  out.push(`${intentUp} intent match at ${kw.opportunityScore}/100.`)
  if (comp.top_subs_median) {
    out.push(`Top-5 competitors average ~${fmtCompact(comp.top_subs_median)} subs${comp.top_views_median ? ` with ${fmtCompact(comp.top_views_median)} median views` : ''}.`)
  }
  if (typeof comp.days_since_newest === 'number') {
    out.push(`Newest top-5 video was ${comp.days_since_newest}d ago.`)
  }
  return out
}

/* Rule-based ordered action list — fills the "Quick actions" column. */
function buildQuickActions(kw) {
  const comp = kw.competition || {}
  const out = []
  if (kw.intentMatch === 'exact') {
    out.push('Lead your title with this phrase verbatim.')
  } else if (kw.intentMatch === 'strong') {
    out.push('Include this phrase near the start of your title.')
  } else {
    out.push('Use as a secondary keyword in description and tags.')
  }
  out.push('Put the phrase in the first 100 characters of your description.')
  if (comp.top_subs_median && comp.top_subs_median > 500000) {
    out.push('Try a long-tail variant — big channels dominate the head term.')
  } else if (kw.momentum === 'unclaimed') {
    out.push('Publish within 7 days while the slot is empty.')
  } else if (kw.momentum === 'active') {
    out.push('Publish fast — the niche is rising and competitors are still shipping.')
  } else {
    out.push('Add a long-tail variant as a secondary tag for extra coverage.')
  }
  return out
}

/* One-line "because" — the reason this is the right play right now. */
function buildWhyNow(kw) {
  const comp = kw.competition || {}
  if (kw.momentum === 'unclaimed') {
    return 'No major video in 6+ months — first-mover advantage while the topic is quiet.'
  }
  if (kw.momentum === 'active') {
    return 'Rising niche with recent activity — the algorithm is actively recommending this space.'
  }
  if (kw.intentMatch === 'exact' && kw.opportunityScore >= 75) {
    return 'Strong exact match with high opportunity score — relevance is on your side.'
  }
  if (comp.top_subs_median && comp.top_subs_median > 500000) {
    return 'Big channels dominate — but a sharper angle can still carve space in the long tail.'
  }
  return 'Balanced opportunity with room to compete — worth testing against similar variants.'
}

function fmtCompact(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
  return String(n)
}

/* ─── ScoreRing — copied verbatim from SeoOptimizer.jsx:272 so the hero
       uses the exact same 108px ring the user already approves on the
       Title Scorecard. */
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

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function Keywords({ plan, freeTierFeatures }) {
  // Free-tier one-run gate. Pre-loaded from /auth/me; flips to true on a
  // live 403 from /keywords/research. Backend is authoritative.
  const [gated, setGated] = useState(
    (plan || 'free') === 'free'
    && (freeTierFeatures?.keywords === 'locked' || freeTierFeatures?.keywords === 'used')
  )
  useKwStyles()

  const saved = loadSaved()
  const [keyword,       setKeyword]       = useState(saved?.keyword || '')
  const [loadingIntent, setLoadingIntent] = useState(false)
  const [intentOptions, setIntentOptions] = useState(null)
  const [loading,       setLoading]       = useState(false)
  const [result,        setResult]        = useState(saved?.result || null)
  const [error,         setError]         = useState('')
  const [copied,        setCopied]        = useState(false)
  const [copiedCluster, setCopiedCluster] = useState(null)
  const [openRow,       setOpenRow]       = useState(null)

  // Reports tab state — past /keywords/research runs persisted to DB so
  // they stay reopenable even when the user is out of credits.
  const [activeTab,      setActiveTab]      = useState('new')
  const [reports,        setReports]        = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)

  async function fetchReports() {
    setReportsLoading(true)
    try {
      const res = await fetch(`${API}/keywords/reports`, { credentials: 'include' })
      if (!res.ok) return
      const d = await res.json()
      setReports(d.reports || [])
    } catch {} finally { setReportsLoading(false) }
  }

  function openReport(r) {
    setKeyword(r.keyword || '')
    setResult(r.result || null)
    setIntentOptions(null)
    setError('')
    setActiveTab('new')
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteReport(reportId, e) {
    if (e) e.stopPropagation()
    setReports(prev => prev.filter(r => r.id !== reportId))
    try { await fetch(`${API}/keywords/reports/${reportId}`, { method: 'DELETE', credentials: 'include' }) } catch {}
  }

  // Load reports once on mount, and again after a fresh research completes.
  useEffect(() => { fetchReports() }, [])
  useEffect(() => {
    if (result && !loading) fetchReports()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  function handleCopyCluster(cl) {
    if (!cl?.keywords?.length) return
    navigator.clipboard.writeText(cl.keywords.join(', ')).then(() => {
      setCopiedCluster(cl.clusterName)
      setTimeout(() => setCopiedCluster(null), 2000)
    })
  }

  function handleCopyKeywords() {
    if (!result?.keywords?.length) return
    const text = result.keywords.map(k => k.keyword).join(', ')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  useEffect(() => { saveToDisk(keyword, result) }, [keyword, result])

  async function handleSubmit() {
    if (!keyword.trim() || loadingIntent || loading) return
    setError(''); setResult(null); setIntentOptions(null)
    setLoadingIntent(true)
    try {
      const res  = await fetch(`${API}/keywords/intent-options`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keyword: keyword.trim() }) })
      const data = await res.json()
      if (!res.ok || !data.options?.length) { await runResearch(''); return }
      setIntentOptions(data.options)
    } catch {
      await runResearch('')
    } finally {
      setLoadingIntent(false)
    }
  }

  async function runResearch(confirmedKeyword) {
    setLoading(true); setError(''); setResult(null); setIntentOptions(null)
    try {
      const res  = await fetch(`${API}/keywords/research`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keyword: keyword.trim(), confirmed_keyword: confirmedKeyword }) })
      if (res.status === 403) {
        const d = await res.json().catch(() => ({}))
        if (d.error === 'locked' || d.reason === 'used' || d.reason === 'locked') {
          setGated(true)
          return
        }
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setResult(data)
      window.dispatchEvent(new CustomEvent('ytg:credits-changed'))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setKeyword(''); setResult(null); setIntentOptions(null); setError('')
    localStorage.removeItem(LS_KEY)
  }

  // When gated + user already has past reports, let them through to the
  // tabs so they can still browse/reopen past research (already paid for).
  // Only full-strangers-to-the-feature (no reports) see the UpsellGate.
  if (gated && reports.length === 0) {
    // Teaser preview — mock keyword list with score bars so free users
    // glimpse the research output when the gate shows.
    const kwTeaser = (
      <div style={{
        background: '#ffffff', border: `1px solid ${C.border}`,
        borderRadius: 16, padding: '22px 24px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            Top keyword opportunities
          </p>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.text3, background: '#f1f1f6', border: `1px solid ${C.border}`, borderRadius: 100, padding: '2px 8px' }}>8 found</span>
        </div>
        {[
          ['how to grow youtube channel', 92, C.green],
          ['youtube algorithm explained', 86, C.green],
          ['best video editing software', 74, C.amber],
          ['youtube thumbnail ideas',     71, C.amber],
          ['how to get more subscribers', 68, C.amber],
        ].map(([phrase, score, col], i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '10px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${C.border}`,
          }}>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.text1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{phrase}</span>
            <div style={{ flex: 1, height: 4, background: '#eeeef3', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${score}%`, height: '100%', background: col, borderRadius: 99 }}/>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: col, minWidth: 28, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{score}</span>
          </div>
        ))}
      </div>
    )
    return (
      <div className="kw-page">
        <UpsellGate
          title="You've used your free Keyword research"
          description="Free accounts get one keyword research run per monthly cycle. Upgrade to keep researching — with YouTube autocomplete, related searches, and opportunity-ranked scoring every time."
          bullets={[
            'Unlimited keyword research runs every month',
            'Real search volume and competition via YouTube + SerpAPI',
            'Ranked by niche opportunity so you pick the strongest title',
          ]}
          showPackLink={false}
          previewContent={kwTeaser}
        />
      </div>
    )
  }

  return (
    <div className="kw-page">

      {/* Header — H1 24/800/-0.6 + meta line with · separators
          (same pattern as Overview / SEO Optimizer / Thumbnail IQ) */}
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 6, lineHeight: 1.1 }}>
          Keyword Research
        </h1>
        <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.4, display: 'flex', gap: 0, flexWrap: 'wrap' }}>
          <span>YouTube autocomplete + related searches</span>
          <span style={{ marginLeft: 8 }}>· Filtered by intent</span>
          <span style={{ marginLeft: 8 }}>· Ranked by opportunity</span>
        </p>
      </div>

      {/* Tabs — New / Reports (mirrors Competitors pattern) */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          className={`kw-tab-btn ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}>
          New research
        </button>
        <button
          className={`kw-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}>
          {reports.length > 0 ? `Reports (${reports.length})` : 'Reports'}
        </button>
      </div>

      {activeTab === 'new' && (<>

      {/* When user is gated but has past reports, show a banner above the
          search bar instead of taking over the whole page. */}
      {gated && (
        <div style={{
          background: 'rgba(229,37,27,0.06)', border: '1px solid rgba(229,37,27,0.2)',
          borderRadius: 12, padding: '12px 16px', marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: C.text1,
        }}>
          <span style={{ flex: 1 }}>
            You've used your free Keyword research this cycle. Your past reports stay available.
          </span>
          <button
            onClick={() => window.location.href = '/?tab=monthly#pricing'}
            className="kw-btn-primary" style={{ padding: '7px 14px', fontSize: 12.5 }}>
            Upgrade
          </button>
        </div>
      )}

      {/* Search bar */}
      <div className="kw-card" style={{ padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="kw-input" placeholder="e.g. grocery haul, home workout, budget cooking"
            value={keyword} onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            disabled={loadingIntent || loading || gated}
          />
          {result && <button className="kw-btn-ghost" onClick={handleClear}>Clear</button>}
          <button className="kw-btn-primary" onClick={handleSubmit} disabled={loadingIntent || loading || !keyword.trim() || gated}>
            {loadingIntent ? <><span className="kw-spinner" /> Detecting intent</>
             : loading     ? <><span className="kw-spinner" /> Researching</>
             : <><span>Research</span><span style={{ fontSize: 11, fontWeight: 500, opacity: 0.7, marginLeft: 4 }}>· 1 credit</span></>}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: C.redBg, border: `1px solid ${C.redBdr}`, borderRadius: 10,
          padding: '10px 14px', marginBottom: 14, color: C.red, fontSize: 13.5,
        }}>
          {error}
        </div>
      )}

      {/* Intent picker — amber 3px top border (identity/ranking moment),
          neutral grey utility eyebrow. Strict red/amber/green palette. */}
      {intentOptions && !loading && (
        <div className="kw-card kw-in" style={{ padding: 0, marginBottom: 16, borderTop: `3px solid ${C.amber}` }}>
          <div style={{ padding: '16px 22px 18px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
              Pick the niche
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, lineHeight: 1.55, marginBottom: 4, letterSpacing: '-0.1px' }}>
              What niche is this keyword for?
            </p>
            <p style={{ fontSize: 13, color: C.text2, marginBottom: 14, lineHeight: 1.6 }}>
              Pick the right audience so we search the correct space.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {intentOptions.map((opt, i) => (
                <div key={i} className="kw-intent-opt" onClick={() => runResearch(opt.keyword)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text1 }}>{opt.label}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: C.text2, background: C.chipBg,
                        border: `1px solid ${C.border}`,
                        padding: '2px 9px', borderRadius: 100, letterSpacing: '0.04em',
                      }}>{opt.keyword}</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: C.text3, lineHeight: 1.55 }}>{opt.description}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={C.text4} strokeWidth="2" strokeLinecap="round"><path d="M5 3l4 4-4 4"/></svg>
                </div>
              ))}
            </div>
            <button onClick={() => runResearch('')} style={{
              marginTop: 14, fontSize: 12.5, fontWeight: 600, color: C.text3,
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              padding: 0,
            }}>
              Let YTGrowth decide
            </button>
          </div>
        </div>
      )}

      {/* Results — every section follows the SEO Studio "Keyword research"
          pattern exactly (SeoOptimizer.jsx:1366-1421):
          out-of-card H2 section header, then a single amber-topped card
          with an uppercase eyebrow + subtitle on the left and a big tabular
          count on the right, hairline divider, then a 2-col row grid with
          an amber vertical divider between columns. */}
      {result && (
        <div className="kw-in">

          {/* ── Top Pick + Search Intent — COMBINED hero. Exact Title
              Scorecard pattern (SeoOptimizer.jsx:1015-1097): ScoreRing on
              the left, amber 3px vertical divider, AI verdict paragraph in
              the middle, second amber divider, intent breakdown on the
              right. One card, three columns. ─────────────────────────── */}
          {result.topPick && (() => {
            const topScore = typeof result.topPick.opportunityScore === 'number'
              ? result.topPick.opportunityScore
              : Math.max(0, ...(result.keywords || []).map(k => k.opportunityScore || 0))
            const scoreCol = oppColor(topScore)
            const rows = [
              ['Primary intent', result.seedIntent?.primaryIntent],
              ['Content type',   result.seedIntent?.contentTypeExpected],
              ['Funnel stage',   result.seedIntent?.funnelStage],
            ].filter(([, v]) => v && v.trim().length > 0 && v.trim().length <= 28)

            return (
              <div style={{
                background: '#ffffff', border: '1px solid #e6e6ec', borderRadius: 16,
                padding: '28px 32px', marginBottom: 24,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>

                  {/* LEFT — ScoreRing + 'TOP PICK' label + keyword caption */}
                  <div style={{ flexShrink: 0, textAlign: 'center' }}>
                    <ScoreRing score={topScore} />
                    <p style={{ fontSize: 11, color: C.text3, fontWeight: 500, marginTop: 6, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                      Top pick
                    </p>
                    <p style={{ fontSize: 11, fontWeight: 700, color: C.text1, marginTop: 3, maxWidth: 140, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {result.topPick.keyword}
                    </p>
                  </div>

                  {/* Amber 3px divider — matches Title Scorecard */}
                  <div style={{ width: 3, alignSelf: 'stretch', background: C.amber, flexShrink: 0, borderRadius: 2 }}/>

                  {/* MIDDLE — AI verdict paragraph */}
                  <div style={{ flex: 1.3, minWidth: 0 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
                      AI verdict
                    </p>
                    <p style={{ fontSize: 14, color: C.text1, lineHeight: 1.85 }}>
                      Your strongest keyword is <span style={{ fontWeight: 700, color: C.text1 }}>{result.topPick.keyword}</span> at <span style={{ fontWeight: 700, color: scoreCol }}>{topScore}/100</span>. {result.topPick.whyThisOne}
                      {result.seedIntent?.intentSummary && <> {result.seedIntent.intentSummary}</>}
                    </p>
                  </div>

                  {/* Second amber divider */}
                  {rows.length > 0 && (
                    <div style={{ width: 3, alignSelf: 'stretch', background: C.amber, flexShrink: 0, borderRadius: 2 }}/>
                  )}

                  {/* RIGHT — Intent breakdown rows */}
                  {rows.length > 0 && (
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                        Intent breakdown
                      </p>
                      {rows.map(([label, val]) => {
                        // 'Awareness' / 'Discovery' / top-of-funnel reads as a
                        // green win (early-stage demand, less competition).
                        // Keeps the strict red/amber/green palette semantic.
                        const isAwareness = /awareness|discover|explor/i.test(val)
                        const tone        = isAwareness ? C.green : C.text1
                        const toneBg      = isAwareness ? C.greenBg : C.chipBg
                        const toneBdr     = isAwareness ? C.greenBdr : C.border
                        return (
                          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <span style={{ fontSize: 12, color: C.text3, fontWeight: 500, flexShrink: 0, width: 100 }}>{label}</span>
                            <span style={{
                              fontSize: 11, fontWeight: 700,
                              color: tone, background: toneBg,
                              border: `1px solid ${toneBdr}`,
                              borderRadius: 100, padding: '2px 10px',
                              letterSpacing: '0.04em', textTransform: 'uppercase',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>{val}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          {/* ── Ranked keywords — EXACT SEO Studio "Keyword research" pattern.
              One card, 2-col row grid inside with amber vertical divider. ── */}
          {result.keywords?.length > 0 && (
            <>
              <div style={{ marginBottom: 20, marginTop: 40 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Ranked keywords</h2>
                <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>
                  Click any keyword for the playbook · <span style={{ color: C.green, fontWeight: 700 }}>ACTIVE</span> = rising · <span style={{ color: C.amber, fontWeight: 700 }}>OPEN</span> = underclaimed
                </p>
              </div>

              <div className="kw-card" style={{ borderTop: `3px solid ${C.amber}`, marginBottom: 24 }}>
                <div style={{ padding: '18px 22px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>
                        Score = volume signal + intent match + competition gap
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                      <p style={{ fontSize: 26, fontWeight: 800, color: C.text1, letterSpacing: '-0.8px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                        {result.keywords.length}
                      </p>
                      <button className={`kw-copy-btn${copied ? ' copied' : ''}`} onClick={handleCopyKeywords}>
                        {copied ? 'Copied' : 'Copy all'}
                      </button>
                    </div>
                  </div>

                  <div style={{ height: 1, background: C.border, margin: '0 0 14px' }}/>

                  {/* Two independent flex columns + a real full-height
                      amber divider at 50%. This keeps each row's expanded
                      dropdown inside its own column so content never
                      crosses the divider. Columns can now grow to different
                      heights when one side is expanded — intentional. */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative' }}>
                    {/* Continuous saturated amber vertical divider —
                        matches the thickness/boldness of Priority Actions'
                        Action-card left bar. Not a pale hairline. */}
                    <div style={{
                      position: 'absolute', left: 'calc(50% - 1px)', top: 0, bottom: 0,
                      width: 2, background: C.amber, borderRadius: 2, pointerEvents: 'none',
                    }}/>
                    {[0, 1].map(colIdx => {
                      const colKws = result.keywords.filter((_, i) => i % 2 === colIdx)
                      return (
                        <div key={colIdx} style={{
                          display: 'flex', flexDirection: 'column', gap: 14,
                          paddingLeft:  colIdx === 1 ? 20 : 0,
                          paddingRight: colIdx === 0 ? 20 : 0,
                        }}>
                          {colKws.map(kw => {
                            const scColor = oppColor(kw.opportunityScore)
                            return (
                              <div
                                key={kw.keyword}
                                className="kw-row-seo"
                                role="button"
                                tabIndex={0}
                                onClick={() => setOpenRow(kw.keyword)}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenRow(kw.keyword) } }}
                                title={buildRowTooltip(kw)}
                                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                              >
                                <span className="kw-row-phrase" style={{
                                  fontSize: 13, color: C.text2, fontWeight: 400,
                                  width: 260, flexShrink: 0,
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                  transition: 'color 0.12s',
                                }}>{kw.keyword}</span>
                                <MomentumBadge momentum={kw.momentum} />
                                <div style={{ flex: 1, height: 4, background: '#eeeef3', borderRadius: 99, overflow: 'hidden', minWidth: 40 }}>
                                  <div style={{ width: `${kw.opportunityScore}%`, height: '100%', background: scColor, borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}/>
                                </div>
                                <span style={{
                                  fontSize: 13, fontWeight: 700, color: scColor,
                                  fontVariantNumeric: 'tabular-nums',
                                  minWidth: 26, textAlign: 'right', flexShrink: 0,
                                }}>{kw.opportunityScore}</span>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Content clusters — matches SEO Studio pattern.
              One amber-topped card per cluster, header row with rank badge
              + name + big tabular count of keywords in the cluster, hairline,
              chip body. Responsive grid of these cards. ───────────────── */}
          {result.clusters?.length > 0 && (
            <>
              <div style={{ marginBottom: 20, marginTop: 40 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Content clusters</h2>
                <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>
                  Themes you can build a series around
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 10, marginBottom: 24,
              }}>
                {result.clusters.map((cl, i) => {
                  const isCopied = copiedCluster === cl.clusterName
                  return (
                    <div key={cl.clusterName} className="kw-card" style={{ borderTop: `3px solid ${C.amber}` }}>
                      <div style={{ padding: '18px 22px 20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0, flex: 1 }}>
                            <span style={{
                              width: 22, height: 22, borderRadius: 6,
                              background: C.amber, color: '#fff',
                              fontSize: 11, fontWeight: 900,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0, fontVariantNumeric: 'tabular-nums', marginTop: 2,
                            }}>{i + 1}</span>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5 }}>
                                Theme
                              </p>
                              <p style={{ fontSize: 13.5, fontWeight: 700, color: C.text1, lineHeight: 1.4, letterSpacing: '-0.1px' }}>
                                {cl.clusterName}
                              </p>
                            </div>
                          </div>
                          <p style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', fontVariantNumeric: 'tabular-nums', flexShrink: 0, lineHeight: 1 }}>
                            {cl.keywords?.length || 0}
                          </p>
                        </div>
                        <div style={{ height: 1, background: C.border, margin: '0 0 14px' }}/>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                          {cl.keywords?.map(k => (
                            <span key={k} style={{
                              background: C.chipBg, border: `1px solid ${C.border}`, color: C.text2,
                              padding: '3px 10px', borderRadius: 100,
                              fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.05px',
                            }}>{k}</span>
                          ))}
                        </div>
                        {/* Per-cluster action — red brand pill, bottom-right
                            of the card. Copies all keywords in this theme
                            as a comma list. */}
                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            className={`kw-ghost-btn${isCopied ? ' copied' : ''}`}
                            onClick={() => handleCopyCluster(cl)}
                          >
                            {isCopied ? (
                              <>
                                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5,6 4.5,9 9.5,2"/></svg>
                                Copied
                              </>
                            ) : (
                              <>
                                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="6.5" height="6.5" rx="1"/><path d="M1.5 7.5V2A0.5 0.5 0 0 1 2 1.5h5.5"/></svg>
                                Copy theme
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Keyword playbook modal — row click opens this. */}
      {openRow && result?.keywords && (
        <KwDetailModal
          kw={result.keywords.find(k => k.keyword === openRow)}
          C={C}
          onClose={() => setOpenRow(null)}
        />
      )}

      </>)}

      {/* ── Reports tab — past /keywords/research runs ────────────────────── */}
      {activeTab === 'reports' && (
        <div>
          {reportsLoading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: C.text3, fontSize: 13 }}>
              Loading reports…
            </div>
          ) : reports.length === 0 ? (
            <div style={{
              padding: '56px 24px', textAlign: 'center',
              background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 16,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06)',
            }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.text1, letterSpacing: '-0.2px', marginBottom: 8 }}>
                No reports yet
              </p>
              <p style={{ fontSize: 13.5, color: C.text3, maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
                Run a keyword research and it'll show up here — so you can always come back to a report you've already paid for.
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
                const kwCount = Array.isArray(r.result?.keywords) ? r.result.keywords.length : 0
                const clusterCount = Array.isArray(r.result?.clusters) ? r.result.clusters.length : 0
                return (
                  <div key={r.id} className="kw-report-wrapper">
                    <button className="kw-report-remove" title="Remove report"
                      onClick={e => deleteReport(r.id, e)}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 5.5l.5 5M9 5.5l-.5 5M3 3.5l.7 8.5h6.6L11 3.5"/>
                      </svg>
                    </button>
                    <div className="kw-report-header" onClick={() => openReport(r)}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 800, fontSize: 14, color: '#111114',
                          letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden',
                          textOverflow: 'ellipsis', marginBottom: 8 }}>
                          {r.keyword}
                        </p>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          {r.confirmed_keyword && (
                            <span className="kw-report-chip">
                              <span className="val">{r.confirmed_keyword}</span>
                              <span className="lbl">intent</span>
                            </span>
                          )}
                          {kwCount > 0 && (
                            <span className="kw-report-chip">
                              <span className="val">{kwCount}</span>
                              <span className="lbl">keyword{kwCount === 1 ? '' : 's'}</span>
                            </span>
                          )}
                          {clusterCount > 0 && (
                            <span className="kw-report-chip">
                              <span className="val">{clusterCount}</span>
                              <span className="lbl">cluster{clusterCount === 1 ? '' : 's'}</span>
                            </span>
                          )}
                          <span style={{ fontSize: 12, color: '#9595a4', fontWeight: 500, marginLeft: 2 }}>
                            · {relTime(r.updated_at)}
                          </span>
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, borderLeft: '1px solid rgba(0,0,0,0.07)',
                        paddingLeft: 16, marginLeft: 4, paddingRight: 28 }}>
                        <button className="kw-report-cta"
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
    </div>
  )
}
