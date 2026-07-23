import React, { useState, useEffect } from 'react'
import { isChannelBrain } from '../brandHost'
import { useCheckoutAction } from '../checkout'
import CreditsEmptyModal from '../components/CreditsEmptyModal'
import UpsellModal from '../components/UpsellModal'
import EstimateTag from '../components/EstimateTag'

const API = import.meta.env.VITE_API_URL || ''
const LS_KEY = 'ytg_keywords_v1'

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null') } catch { return null }
}
function saveToDisk(keyword, result) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ keyword, result })) } catch {}
}

/* ─── Editorial app fonts, page-scoped. Cormorant = display H1 + big numbers,
       Barlow = body/UI, Barlow Condensed = labels/buttons. ──────────── */
if (typeof document !== 'undefined' && !document.getElementById('kw-editorial-font')) {
  const link = document.createElement('link')
  link.id = 'kw-editorial-font'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@500;600;700&display=swap'
  document.head.appendChild(link)
}
const SERIF = "'Cormorant Garamond', Georgia, serif"
const COND  = "'Barlow Condensed', sans-serif"

/* ─── Styles, system elevation, hairline borders, 14px card radius.
       Matches the Competitors / Chat design grammar (Geist, centered
       1040 column, quiet pill tabs, brand red reserved for the page CTA). */
function useKwStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-kw-styles')) return
    const style = document.createElement('style')
    style.id = 'ytg-kw-styles'
    style.textContent = `
      .kw-page { max-width: 1040px; margin: 0 auto; }
      .kw-page * { box-sizing: border-box; font-family: 'Barlow', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
      .kw-page p, .kw-page span, .kw-page div { margin: 0; }

      @keyframes kwSpin { to { transform: rotate(360deg) } }
      @keyframes kwIn   { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
      .kw-in { animation: kwIn 0.26s ease both; }

      /* Card, matches SEO Studio's .seo-suggestion-card exactly
         (SeoOptimizer.jsx:33). That's the benchmark the user wants. */
      .kw-card {
        background: ${C.card};
        border: 1px solid ${C.hair};
        border-radius: 0;
        overflow: hidden;
        box-shadow: ${C.cardShadow};
        transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
      }
      .kw-card:hover {
        box-shadow: ${C.cardShadowLift};
        border-color: ${C.hairHi};
        transform: translateY(-1px);
      }

      /* Keyword row, matches SEO Studio's .seo-kw-row exactly. Phrase
         text brightens on hover. */
      .kw-row-seo:hover .kw-row-phrase { color: ${C.text1}; }

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
        background: ${C.bg};
        border: 1px solid ${C.hair};
        border-radius: 0;
        box-shadow: 0 16px 40px rgba(0,0,0,0.18);
        width: 100%; max-width: 1040px;
        max-height: calc(100vh - 64px);
        overflow: auto;
        animation: kwSlideIn 0.22s cubic-bezier(0.2, 0.7, 0.3, 1) both;
      }
      .kw-modal::-webkit-scrollbar { width: 4px }
      .kw-modal::-webkit-scrollbar-thumb { background: rgba(20,19,15,0.14); border-radius: 4px }
      @keyframes kwFadeIn  { from { opacity: 0 } to { opacity: 1 } }
      @keyframes kwSlideIn { from { opacity: 0; transform: translateY(10px) scale(0.98) } to { opacity: 1; transform: none } }

      .kw-input {
        flex: 1; padding: 12px 20px;
        border-radius: 0; border: 1px solid ${C.hair};
        background: ${C.surfaceInput}; font-size: 14px; font-weight: 500;
        font-family: 'Barlow', system-ui, sans-serif;
        outline: none;
        transition: border-color 200ms cubic-bezier(0.32, 0.72, 0, 1), box-shadow 200ms cubic-bezier(0.32, 0.72, 0, 1);
        color: ${C.text1}; letter-spacing: -0.005em;
      }
      .kw-input::placeholder { color: rgba(20,19,15,0.30); font-weight: 500; }
      .kw-input:focus {
        border-color: rgba(201,160,48,0.45);
        box-shadow: 0 0 0 4px rgba(201,160,48,0.10);
      }

      .kw-btn-primary {
        background: #c9a030;
        color: var(--yd-on-gold); border: none; border-radius: 0;
        padding: 12px 22px; font-size: 12px; font-weight: 600;
        font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase;
        cursor: pointer; white-space: nowrap;
        transition: filter 160ms cubic-bezier(0.32, 0.72, 0, 1);
        letter-spacing: 0.06em;
        box-shadow: none;
        display: inline-flex; align-items: center; gap: 8px;
      }
      .kw-btn-primary:hover:not(:disabled) { filter: brightness(1.06); }
      .kw-btn-primary:disabled {
        background: rgba(20,19,15,0.06);
        color: ${C.text3};
        cursor: default;
        box-shadow: none;
      }

      .kw-btn-ghost {
        background: ${C.card}; color: ${C.text2};
        border: 1px solid ${C.hair}; border-radius: 0;
        padding: 11px 18px; font-size: 12px; font-weight: 600;
        font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase; letter-spacing: 0.06em;
        cursor: pointer; white-space: nowrap;
        transition: background 160ms cubic-bezier(0.32, 0.72, 0, 1), color 160ms cubic-bezier(0.32, 0.72, 0, 1), border-color 160ms cubic-bezier(0.32, 0.72, 0, 1);
        letter-spacing: -0.01em;
      }
      .kw-btn-ghost:hover {
        background: ${C.wash};
        color: ${C.text1};
        border-color: ${C.hairHi};
      }

      /* Tab pills, quiet pill nav like Competitors. Active = soft gray
         tint, inactive = transparent. Brand red reserved for the page CTA
         (Research) and threat/score accents, never tab chrome. */
      .kw-tab-btn {
        padding: 8px 16px;
        border-radius: 0;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background 180ms cubic-bezier(0.32, 0.72, 0, 1), color 180ms cubic-bezier(0.32, 0.72, 0, 1), border-color 180ms cubic-bezier(0.32, 0.72, 0, 1);
        font-family: 'Barlow', system-ui, sans-serif;
        border: 1px solid transparent;
        white-space: nowrap;
        letter-spacing: -0.01em;
        background: transparent;
        color: ${C.text2};
      }
      .kw-tab-btn:hover {
        background: ${C.wash};
        color: ${C.text1};
      }
      .kw-tab-btn.active {
        background: ${C.washActive};
        color: ${C.text1};
        border-color: ${C.hair};
        font-weight: 600;
      }

      /* Reports list, quieter than the old SEO-Studio elevation. Hairline
         border, single soft shadow, room between rows. */
      .kw-report-wrapper { position: relative; margin-bottom: 14px; }
      .kw-report-header {
        background: ${C.card};
        border: 1px solid ${C.hair};
        border-radius: 0;
        box-shadow: ${C.cardShadow};
        padding: 18px 22px;
        display: flex; align-items: center; gap: 16px;
        transition: box-shadow 0.18s, border-color 0.18s, transform 0.18s;
        cursor: pointer; user-select: none;
      }
      .kw-report-header:hover {
        box-shadow: ${C.cardShadowLift};
        border-color: ${C.hairHi};
        transform: translateY(-1px);
      }
      .kw-report-remove {
        position: absolute; top: 12px; right: 12px;
        width: 28px; height: 28px; border-radius: 0;
        border: 1px solid transparent; background: transparent;
        color: ${C.text3}; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        opacity: 0;
        transition: opacity 0.15s, background 0.15s, color 0.15s, border-color 0.15s;
        z-index: 2;
      }
      .kw-report-wrapper:hover .kw-report-remove { opacity: 1; }
      .kw-report-remove:hover {
        background: rgba(201,160,48,0.08);
        border-color: rgba(201,160,48,0.2);
        color: #c9a030;
      }
      .kw-report-cta {
        background: #c9a030; color: var(--yd-on-gold);
        border: 1px solid #c9a030; border-radius: 0;
        padding: 9px 18px; font-size: 12px; font-weight: 600;
        font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase; letter-spacing: 0.06em;
        cursor: pointer; white-space: nowrap;
        transition: filter 0.15s;
        display: flex; align-items: center; gap: 6px;
        box-shadow: none;
      }
      .kw-report-cta:hover { filter: brightness(1.07); }
      .kw-report-chip {
        display: inline-flex; align-items: baseline; gap: 5px;
        background: ${C.amberBg}; border: 1px solid ${C.amberBdr};
        border-radius: 0; padding: 4px 12px;
      }
      .kw-report-chip .val { font-size: 12px; font-weight: 600; color: ${C.text1}; }
      .kw-report-chip .lbl { font-size: 11px; color: ${C.amberHi}; font-weight: 600; }

      /* Intent picker row, hairline card, green-tinted hover that
         signals "this is a selection moment". Subtle lift on hover. */
      .kw-intent-opt {
        display: flex; align-items: center; gap: 14px;
        padding: 16px 18px;
        border: 1px solid ${C.hair};
        border-radius: 0;
        cursor: pointer; background: ${C.card};
        box-shadow: none;
        transition: background 160ms cubic-bezier(0.32, 0.72, 0, 1),
                    border-color 160ms cubic-bezier(0.32, 0.72, 0, 1),
                    box-shadow 160ms cubic-bezier(0.32, 0.72, 0, 1),
                    transform 160ms cubic-bezier(0.32, 0.72, 0, 1);
      }
      .kw-intent-opt:hover {
        border-color: rgba(22,163,74,0.45);
        background: rgba(22,163,74,0.10);
        box-shadow: ${C.cardShadowLift};
        transform: translateY(-1px);
      }
      .kw-intent-opt .arrow { color: ${C.text3}; transition: color 160ms ease, transform 160ms ease; }
      .kw-intent-opt:hover .arrow { color: ${C.greenHi}; transform: translateX(3px); }

      /* Quiet utility action under the intent picker, outlined pill,
         no fill, brand red text. The intent options are the primary
         choice; "Let YTGrowth decide" is the secondary escape hatch. */
      .kw-intent-decide-btn {
        display: inline-flex; align-items: center; gap: 6px;
        margin-top: 16px;
        padding: 8px 14px;
        font-size: 12px; font-weight: 600;
        font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase;
        letter-spacing: 0.06em;
        color: ${C.text2};
        background: transparent;
        border: 1px solid ${C.hair};
        border-radius: 0;
        cursor: pointer;
        transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
      }
      .kw-intent-decide-btn:hover {
        background: ${C.wash};
        color: ${C.text1};
        border-color: ${C.hairHi};
      }


      /* Copy button, red brand pill. Matches SEO Studio's seo-btn-primary
         (SeoOptimizer.jsx:1453) so the theme-colour red shows up on every
         "take action now" moment across the app. */
      .kw-copy-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 9px 16px; border-radius: 0;
        font-size: 12px; font-weight: 600; letter-spacing: 0.06em;
        font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase;
        background: #c9a030; color: var(--yd-on-gold);
        border: none; cursor: pointer;
        transition: filter 0.15s;
      }
      .kw-copy-btn:hover { filter: brightness(1.1); }
      .kw-copy-btn.copied {
        background: ${C.greenBg}; color: ${C.greenHi};
        border: 1px solid ${C.greenBdr};
        padding: 7px 15px; /* compensate for 1px border */
      }

      /* Cluster "Copy theme" button, neutral elevated pill.
         White bg, near-black text, hairline border, system-elevation
         shadow. Red is reserved for primary CTAs; this is a utility
         action repeated 5x so it stays quiet but tactile. */
      .kw-ghost-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 15px; border-radius: 0;
        font-size: 12px; font-weight: 600; letter-spacing: 0.06em;
        font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase;
        background: ${C.card}; color: ${C.text1};
        border: 1px solid ${C.hair}; cursor: pointer;
        box-shadow: ${C.cardShadow};
        transition: box-shadow 0.18s, transform 0.12s, border-color 0.18s;
      }
      .kw-ghost-btn:hover {
        box-shadow: ${C.cardShadowLift};
        border-color: ${C.hairHi};
        transform: translateY(-1px);
      }
      .kw-ghost-btn.copied {
        background: ${C.greenBg}; color: ${C.greenHi};
        border-color: ${C.greenBdr};
        box-shadow: none;
        transform: none;
      }

      .kw-bar { height: 4px; border-radius: 0; background: rgba(20,19,15,0.10); overflow: hidden; }
      .kw-bar-fill { height: 4px; border-radius: 0; transition: width 0.5s ease; }

      .kw-spinner { width: 14px; height: 14px; border: 2px solid rgba(20,19,15,0.3); border-top-color: #fff; border-radius: 50%; animation: kwSpin 0.7s linear infinite; flex-shrink: 0; }
    `
    document.head.appendChild(style)
  }, [])
}

/* ─── Design tokens, strict red/amber/green + neutrals, per the project
       palette rule. No blue/purple/teal anywhere. ───────────────────── */
/* ─── C: dark palette for this page. Mirrors the shipped app-shell /
       Competitors dark system (lit-gradient cards, white-alpha hairlines,
       single soft shadow, quiet white-wash selection). Semantic
       red/amber/green keep their hue; fill tints are re-tuned for dark
       and *Hi variants give legible text on the dark tinted chips. ─── */
const C = {
  red:     '#c9a030', redBg:   'rgba(201,160,48,0.13)', redBdr:   'rgba(201,160,48,0.32)',
  green:   '#16a34a', greenBg: 'rgba(22,163,74,0.14)', greenBdr: 'rgba(22,163,74,0.34)',
  amber:   '#c9a030', amberBg: 'rgba(201,160,48,0.13)', amberBdr: 'rgba(201,160,48,0.32)',
  redHi:   '#7a5b14', greenHi: '#2d7a4f', amberHi: '#7a5b14',
  text1:   '#14130f',
  text2:   '#6b6862',
  text3:   '#6b6862',
  text4:   'rgba(20,19,15,0.40)',
  border:  'rgba(20,19,15,0.08)',
  chipBg:  'var(--yd-surface)',
  // surface system (identical tokens to Competitors' D)
  bg:             'var(--yd-paper)',
  card:           'linear-gradient(180deg, var(--yd-surface) 0%, var(--yd-surface) 100%)',
  cardFlat:       'var(--yd-surface)',
  surfaceInput:   'var(--yd-surface)',
  hair:           'rgba(20,19,15,0.08)',
  hairHi:         'rgba(20,19,15,0.16)',
  wash:           'rgba(20,19,15,0.04)',
  washActive:     'rgba(20,19,15,0.06)',
  cardShadow:     'none',
  cardShadowLift: 'none',
}

// Intent matching, semantic mapping within the strict palette:
//   exact   -> green  (win)
//   strong  -> amber  (secondary)
//   partial -> neutral grey pill (utility label)
const INTENT_TONE = {
  exact:   { color: C.greenHi, bg: C.greenBg, bdr: C.greenBdr },
  strong:  { color: C.amberHi, bg: C.amberBg, bdr: C.amberBdr },
  partial: { color: C.text2,   bg: C.chipBg,  bdr: C.border   },
}

function oppColor(s) { return s >= 70 ? C.greenHi : s >= 45 ? C.amberHi : C.redHi }

/* ─── MomentumBadge, derived from YouTube competition data we already
       fetched. No extra API calls. Three states:
         - active    : newest top-5 video was published in the last 30 days
         - unclaimed : newest top-5 video is over 180 days old
         - steady    : in between, rendered as nothing (keeps rows clean) */
function MomentumBadge({ momentum }) {
  if (!momentum || momentum === 'steady') return null
  const config = momentum === 'active'
    ? { color: C.greenHi, bg: C.greenBg, bdr: C.greenBdr, label: 'Active' }
    :                                                     { color: C.amberHi, bg: C.amberBg, bdr: C.amberBdr, label: 'Open' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 10.5, fontWeight: 600,
      color: config.color, background: config.bg,
      border: `1px solid ${config.bdr}`,
      borderRadius: 0, padding: '2px 8px',
      letterSpacing: '0.10em', textTransform: 'uppercase',
      flexShrink: 0,
    }}>{config.label}</span>
  )
}

/* Detail modal, Outliers DetailModal pattern. Header + 3-col playbook
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
              <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Keyword playbook</p>
              <p style={{ fontSize: 18, fontWeight: 600, color: C.text1, lineHeight: 1.3, letterSpacing: '-0.3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kw.keyword}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
              <MomentumBadge momentum={kw.momentum} />
              <span style={{ fontSize: 13, fontWeight: 600, color: scColor, fontVariantNumeric: 'tabular-nums', padding: '3px 10px', border: `1px solid ${scColor}30`, borderRadius: 100 }}>
                {kw.opportunityScore}/100
              </span>
              <button onClick={copyKeyword}
                style={{ fontSize: 12, color: copied ? C.green : C.text2, background: C.cardFlat, border: `1px solid ${copied ? C.greenBdr : C.border}`, borderRadius: 0, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, boxShadow: 'none' }}>
                {copied ? 'Copied' : 'Copy keyword'}
              </button>
              <button onClick={onClose}
                style={{ fontSize: 12, color: C.text3, background: C.cardFlat, border: `1px solid ${C.border}`, borderRadius: 0, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, boxShadow: 'none' }}>
                Close ✕
              </button>
            </div>
          </div>

          {/* Top-ranking videos for this keyword, visual evidence at the
              top of the playbook. Pulled from competition.top_videos
              (added by the backend in the same slice as the Top Pick band).
              Rendered only when the field is populated. */}
          {(comp.top_videos || []).length > 0 && (() => {
            const vids = comp.top_videos.slice(0, 3)
            const topViews = Math.max(...vids.map(v => v.views || 0))
            // Outlier baseline = median of ALL 25 search results (not top-5
            // median). Top-5 are already big videos, so using their median
            // as baseline buries genuine outliers. all_views_median is the
            // "typical video ranking for this keyword" reference.
            const medianViews = comp.all_views_median || comp.top_views_median || 0
            const fmtAge = (iso) => {
              if (!iso) return ''
              const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
              if (days < 1)   return 'today'
              if (days < 7)   return `${days}d ago`
              if (days < 30)  return `${Math.floor(days / 7)}w ago`
              if (days < 365) return `${Math.floor(days / 30)}mo ago`
              return `${Math.floor(days / 365)}y ago`
            }
            return (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: C.text3,
                    letterSpacing: '0.10em', textTransform: 'uppercase',
                  }}>Top-ranking videos right now</span>
                  {topViews > 0 && (
                    <span style={{
                      marginLeft: 'auto',
                      display: 'inline-flex', alignItems: 'center', gap: 7,
                      fontSize: 12, fontWeight: 500, color: C.text2,
                      letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums',
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: 99, background: C.green, flexShrink: 0 }}/>
                      Top performer{' '}
                      <strong style={{ color: C.text1, fontWeight: 600 }}>{fmtCompact(topViews)} views</strong>
                    </span>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {vids.map((v, i) => {
                    const thumbHigh = v.video_id ? `https://i.ytimg.com/vi/${v.video_id}/maxresdefault.jpg` : null
                    const thumbFallback = v.video_id ? `https://i.ytimg.com/vi/${v.video_id}/hqdefault.jpg` : (v.thumbnail_url || null)
                    const thumb = thumbHigh || thumbFallback
                    const ytUrl = v.video_id ? `https://www.youtube.com/watch?v=${v.video_id}` : null
                    return (
                      <a key={v.video_id || i}
                        href={ytUrl || '#'}
                        target="_blank" rel="noopener noreferrer"
                        onClick={e => { if (!ytUrl) e.preventDefault() }}
                        style={{
                          display: 'block', textDecoration: 'none', color: 'inherit',
                          borderRadius: 0, overflow: 'hidden',
                          border: '1px solid rgba(20,19,15,0.08)', background: C.cardFlat,
                          transition: 'transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.10)'
                          e.currentTarget.style.borderColor = '#4a4843'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                          e.currentTarget.style.borderColor = 'rgba(20,19,15,0.08)'
                        }}
                      >
                        <div style={{ position: 'relative', aspectRatio: '16 / 9', background: '#e8e4dc', overflow: 'hidden' }}>
                          {thumb && (
                            <img src={thumb} alt="" referrerPolicy="no-referrer" loading="lazy"
                              data-fallback={thumbFallback || ''}
                              onError={e => {
                                const t = e.currentTarget
                                const fb = t.getAttribute('data-fallback')
                                if (fb && t.src !== fb) { t.src = fb; t.removeAttribute('data-fallback') }
                              }}
                              onLoad={e => {
                                const t = e.currentTarget
                                const fb = t.getAttribute('data-fallback')
                                if (fb && t.naturalWidth > 0 && t.naturalWidth < 300) {
                                  t.src = fb
                                  t.removeAttribute('data-fallback')
                                }
                              }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
                          )}
                          {v.views > 0 && (
                            <span style={{
                              position: 'absolute', bottom: 8, right: 8,
                              background: 'rgba(0,0,0,0.82)', color: '#fff',
                              fontSize: 11.5, fontWeight: 600,
                              padding: '3px 7px', borderRadius: 0,
                              fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.05px',
                              backdropFilter: 'blur(2px)',
                            }}>{fmtCompact(v.views)}</span>
                          )}
                        </div>
                        <div style={{ padding: '11px 13px 13px' }}>
                          <p style={{
                            fontSize: 14, fontWeight: 500, color: C.text1,
                            letterSpacing: '-0.15px', lineHeight: 1.4,
                            margin: '0 0 4px',
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            overflow: 'hidden', minHeight: 38,
                          }}>{v.title}</p>
                          <p style={{
                            fontSize: 12, fontWeight: 500, color: C.text3,
                            letterSpacing: '-0.02px',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {v.channel_title}{v.published_at ? ` · ${fmtAge(v.published_at)}` : ''}
                          </p>
                          <VideoMetricsRow
                            vph={vphFor(v.views, v.published_at)}
                            outlierMult={outlierFor(v.views, medianViews)}
                          />
                        </div>
                      </a>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* 3-col playbook, exact Outliers pattern (blue / amber / green) */}
          <div style={{ background: C.cardFlat, border: `1px solid ${C.border}`, borderRadius: 0, padding: '20px 22px' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: C.text1, letterSpacing: '-0.2px', marginBottom: 16 }}>Keyword playbook</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 8 }}>
              {/* Blue, Why it works (numbered list, mirrors Quick actions) */}
              <div style={{ background: 'rgba(20,19,15,0.04)', border: '1px solid rgba(20,19,15,0.08)', borderRadius: 0, padding: '12px 14px' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#7a5b14', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8 }}>Why it works</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7, margin: 0, padding: 0 }}>
                  {buildWhyItWorks(kw).map((s, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#7a5b14', fontVariantNumeric: 'tabular-nums', lineHeight: 1.55, minWidth: 14 }}>{i + 1}.</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: C.text1, lineHeight: 1.6, flex: 1, letterSpacing: '-0.005em' }}>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Amber, Quick actions (numbered list) */}
              <div style={{ background: C.cardFlat, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.amber}`, borderRadius: 0, padding: '12px 14px', boxShadow: 'none' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#7a5b14', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8 }}>Quick actions</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7, margin: 0, padding: 0 }}>
                  {actions.map((s, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#7a5b14', fontVariantNumeric: 'tabular-nums', lineHeight: 1.55, minWidth: 14 }}>{i + 1}.</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: C.text1, lineHeight: 1.6, flex: 1, letterSpacing: '-0.005em' }}>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Green, Why now */}
              <div style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.14)', borderRadius: 0, padding: '12px 14px' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#2d7a4f', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8 }}>Act on this because</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: C.text1, lineHeight: 1.65, letterSpacing: '-0.005em' }}>{buildWhyNow(kw)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Tooltip copy for each ranked-keyword row, folds together the real
   data signals so hovering gives the full story at a glance. */
function buildRowTooltip(kw) {
  const parts = [`${kw.intentMatch || '—'} match`, `Score ${kw.opportunityScore}`]
  const comp = kw.competition || {}
  if (comp.top_subs_median) {
    parts.push(`Top channels ~${fmtCompact(comp.top_subs_median)} subscribers`)
  }
  if (comp.top_views_median) {
    parts.push(`Top videos ~${fmtCompact(comp.top_views_median)} views`)
  }
  if (typeof comp.days_since_newest === 'number') {
    parts.push(`Newest top-5 video ${comp.days_since_newest}d ago`)
  }
  return parts.join(' · ')
}

/* Ordered list of "Why it works" signal points, rendered as a numbered
   list (same layout as Quick actions), so the panel reads clean. */
function buildWhyItWorks(kw) {
  const comp = kw.competition || {}
  const out = []
  const intentUp = (kw.intentMatch || '—').replace(/^\w/, c => c.toUpperCase())
  out.push(`${intentUp} intent match at ${kw.opportunityScore}/100.`)
  if (comp.top_subs_median) {
    out.push(`Top-5 competitors average ~${fmtCompact(comp.top_subs_median)} subscribers${comp.top_views_median ? ` with ${fmtCompact(comp.top_views_median)} median views` : ''}.`)
  }
  if (typeof comp.days_since_newest === 'number') {
    out.push(`Newest top-5 video was ${comp.days_since_newest}d ago.`)
  }
  return out
}

/* Rule-based ordered action list, fills the "Quick actions" column. */
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
    out.push('Try a long-tail variant, big channels dominate the head term.')
  } else if (kw.momentum === 'unclaimed') {
    out.push('Publish within 7 days while the slot is empty.')
  } else if (kw.momentum === 'active') {
    out.push('Publish fast, the niche is rising and competitors are still shipping.')
  } else {
    out.push('Add a long-tail variant as a secondary tag for extra coverage.')
  }
  return out
}

/* One-line "because", the reason this is the right play right now. */
function buildWhyNow(kw) {
  const comp = kw.competition || {}
  if (kw.momentum === 'unclaimed') {
    return 'No major video in 6+ months, first-mover advantage while the topic is quiet.'
  }
  if (kw.momentum === 'active') {
    return 'Rising niche with recent activity, the algorithm is actively recommending this space.'
  }
  if (kw.intentMatch === 'exact' && kw.opportunityScore >= 75) {
    return 'Strong exact match with high opportunity score, relevance is on your side.'
  }
  if (comp.top_subs_median && comp.top_subs_median > 500000) {
    return 'Big channels dominate, but a sharper angle can still carve space in the long tail.'
  }
  return 'Balanced opportunity with room to compete, worth testing against similar variants.'
}

function fmtCompact(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
  return String(n)
}

// Views-per-hour for a video. Returns null when the timestamp is missing
// or the video is < 1h old (VPH would be misleadingly huge).
function vphFor(views, publishedAtIso) {
  if (!views || !publishedAtIso) return null
  const hours = (Date.now() - new Date(publishedAtIso).getTime()) / 3_600_000
  if (!isFinite(hours) || hours < 1) return null
  return Math.round(views / hours)
}

// Outlier multiplier relative to the keyword's top-5 median views.
// Returns null below the show-threshold so we don't crowd cards with
// "0.8x" noise. Threshold 1.5x = "noticeably above average".
function outlierFor(views, medianViews) {
  if (!views || !medianViews) return null
  const mult = views / medianViews
  if (!isFinite(mult) || mult < 1.5) return null
  return Math.round(mult * 10) / 10
}

/* ─── VideoMetricsRow, labeled chips under each video card. Two segments
       per chip (muted label + bold value) so the number has context.
       Outlier chip only shows at >=1.5x the keyword median:
         - amber  (1.5-2.9x) "Above avg"
         - green  (3x+)      "Outlier"
       VPH chip is always shown when we have enough data to compute it. */
function VideoMetricsRow({ vph, outlierMult }) {
  if (!vph && !outlierMult) return null
  const isStrong = outlierMult && outlierMult >= 3
  const outlierTone = isStrong
    ? { color: '#2d7a4f', bg: C.greenBg, bdr: C.greenBdr, label: 'Outlier' }
    : { color: '#7a5b14', bg: C.amberBg, bdr: C.amberBdr, label: 'Above avg' }

  const chipBase = {
    display: 'inline-flex', alignItems: 'center',
    fontSize: 11, borderRadius: 0,
    padding: '3px 4px 3px 10px',
    fontVariantNumeric: 'tabular-nums',
    border: '1px solid',
  }
  const labelStyle = {
    fontSize: 10, fontWeight: 600,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    opacity: 0.78, marginRight: 6,
  }
  const valuePill = (color) => ({
    fontWeight: 600, color: C.text1,
    background: C.cardFlat, border: `1px solid ${color}40`,
    borderRadius: 0, padding: '1px 8px',
    fontSize: 11, letterSpacing: '-0.01em',
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
      {outlierMult && (() => {
        // Cap display at "10×+", when a top-ranking video is 30× the
        // typical result, the exact ratio reads as silly. The label still
        // tells the full story (Outlier vs Above avg).
        const displayMult = outlierMult >= 10 ? '10×+' : `${outlierMult}×`
        return (
          <span style={{
            ...chipBase,
            color: outlierTone.color, background: outlierTone.bg, borderColor: outlierTone.bdr,
          }}>
            <span style={labelStyle}>{outlierTone.label}</span>
            <span style={valuePill(outlierTone.color)}>{displayMult}</span>
          </span>
        )
      })()}
      {vph && (
        <span style={{
          ...chipBase,
          color: C.text2, background: 'var(--yd-surface)', borderColor: C.border,
        }}>
          <span style={labelStyle}>VPH</span>
          <span style={valuePill('rgba(20,19,15,0.16)')}>{fmtCompact(vph)}/hr</span>
        </span>
      )}
    </div>
  )
}

/* ─── MomentumChart, 12-week SVG line chart of publishing_timeline.
       Color encodes direction: green if the last 4 weeks summed beat the
       previous 4 (niche heating up), amber otherwise. Fill under the line
       at 0.07 alpha gives visual weight without being loud. */
function MomentumChart({ timeline, height = 120 }) {
  if (!Array.isArray(timeline) || timeline.length < 2) return null
  const W = 1000
  const H = height
  const padL = 28, padR = 14, padT = 18, padB = 26
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const counts = timeline.map(t => Number(t?.count || 0))
  const maxCount = Math.max(1, ...counts)
  const n = counts.length

  // Direction: rising if back-half outscores front-half.
  const half = Math.floor(n / 2)
  const front = counts.slice(0, half).reduce((a, b) => a + b, 0)
  const back  = counts.slice(half).reduce((a, b) => a + b, 0)
  const rising = back >= front
  const color = rising ? C.green : C.amber
  const fillColor = rising ? 'rgba(22,163,74,0.10)' : 'rgba(201,160,48,0.10)'

  const xFor = i => padL + (i * innerW) / (n - 1)
  const yFor = c => padT + innerH - (c / maxCount) * innerH

  const points = counts.map((c, i) => [xFor(i), yFor(c)])
  const linePath = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ')
  const fillPath = `${linePath} L ${xFor(n - 1)} ${padT + innerH} L ${xFor(0)} ${padT + innerH} Z`

  // X labels, show every 3rd week, with "now" on the right edge.
  const labels = timeline.map((t, i) => {
    if (i === n - 1) return 'now'
    if (i % 3 !== 0) return ''
    const weeksAgo = n - 1 - i
    return `${weeksAgo}w`
  })

  // Peak week annotation, finds the max bucket for the caption.
  const peakIdx = counts.indexOf(maxCount)
  const peakWeeksAgo = n - 1 - peakIdx
  const peakLabel = peakIdx === n - 1 ? 'this week' : peakWeeksAgo === 1 ? 'last week' : `${peakWeeksAgo} weeks ago`

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        {/* Y gridlines, 3 quiet lines */}
        {[0.25, 0.5, 0.75].map(p => (
          <line key={p} x1={padL} x2={W - padR} y1={padT + innerH * p} y2={padT + innerH * p}
            stroke="rgba(20,19,15,0.06)" strokeWidth="1" />
        ))}
        {/* Baseline */}
        <line x1={padL} x2={W - padR} y1={padT + innerH} y2={padT + innerH}
          stroke="rgba(20,19,15,0.10)" strokeWidth="1" />
        {/* Filled area */}
        <path d={fillPath} fill={fillColor} />
        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" />
        {/* Endpoint dot */}
        <circle cx={xFor(n - 1)} cy={yFor(counts[n - 1])} r="5" fill="#fff" stroke={color} strokeWidth="2.5" />
        {/* X labels */}
        {labels.map((lbl, i) => lbl ? (
          <text key={i} x={xFor(i)} y={H - 8}
            fill="rgba(20,19,15,0.45)" fontSize="11" fontWeight="500"
            textAnchor={i === n - 1 ? 'end' : 'middle'}
            style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
            {lbl}
          </text>
        ) : null)}
        {/* Y max label */}
        <text x={padL - 6} y={padT + 4}
          fill="rgba(20,19,15,0.45)" fontSize="11" fontWeight="500"
          textAnchor="end" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {maxCount}
        </text>
        <text x={padL - 6} y={padT + innerH + 2}
          fill="rgba(20,19,15,0.45)" fontSize="11" fontWeight="500"
          textAnchor="end" style={{ fontVariantNumeric: 'tabular-nums' }}>
          0
        </text>
      </svg>
      <p style={{
        marginTop: 6, fontSize: 12.5, fontWeight: 500,
        color: C.text2, letterSpacing: '-0.01em',
      }}>
        Peak <strong style={{ color: C.text1, fontWeight: 600 }}>{maxCount} video{maxCount === 1 ? '' : 's'}</strong> {peakLabel} · {rising ? 'niche heating up' : 'niche cooling down'}
      </p>
    </div>
  )
}

/* ─── ScoreRing, copied verbatim from SeoOptimizer.jsx:272 so the hero
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
        <span style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 500, color, letterSpacing: '-0.01em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{score}</span>
        <span style={{ fontSize: 12, color: C.text3, fontWeight: 600, letterSpacing: '0.06em', marginTop: 2 }}>/100</span>
      </div>
    </div>
  )
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function Keywords({ plan, freeTierFeatures }) {
  const { busy: coBusy, upgrade } = useCheckoutAction()
  // Free-tier one-run gate. Pre-loaded from /auth/me; flips to true on a
  // live 403 from /keywords/research. Backend is authoritative.
  const [gated, setGated] = useState(
    (plan || 'free') === 'free'
    && (freeTierFeatures?.keywords === 'locked' || freeTierFeatures?.keywords === 'used')
  )
  useKwStyles()

  const saved = loadSaved()
  // Trending Keyword Feed card stashes a query in sessionStorage before
  // routing here. Honor it once on mount, then clear so back-nav doesn't
  // keep overriding the user's edits.
  const prefilledFromFeed = (() => {
    try {
      const q = sessionStorage.getItem('keywords_prefilledQuery')
      if (q) sessionStorage.removeItem('keywords_prefilledQuery')
      return q || ''
    } catch { return '' }
  })()
  const [keyword,       setKeyword]       = useState(prefilledFromFeed || saved?.keyword || '')
  const [loadingIntent, setLoadingIntent] = useState(false)
  const [intentOptions, setIntentOptions] = useState(null)
  const [loading,       setLoading]       = useState(false)
  const [result,        setResult]        = useState(saved?.result || null)
  const [error,         setError]         = useState('')
  const [copied,        setCopied]        = useState(false)
  const [copiedCluster, setCopiedCluster] = useState(null)
  const [openRow,       setOpenRow]       = useState(null)

  // Reports tab state, past /keywords/research runs persisted to DB so
  // they stay reopenable even when the user is out of credits.
  const [activeTab,      setActiveTab]      = useState('new')
  const [reports,        setReports]        = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [creditsOut,     setCreditsOut]     = useState(false)

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
    // Client-side short-circuit for free-tier one-run users who've already
    // used their run this cycle. Avoids the wasted intent-options fetch.
    if (gated) {
      setCreditsOut(true)
      return
    }
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
    if (gated) {
      setCreditsOut(true)
      return
    }
    setLoading(true); setError(''); setResult(null); setIntentOptions(null)
    try {
      const res  = await fetch(`${API}/keywords/research`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keyword: keyword.trim(), confirmed_keyword: confirmedKeyword }) })
      if (res.status === 403) {
        const d = await res.json().catch(() => ({}))
        if (d.error === 'locked' || d.reason === 'used' || d.reason === 'locked') {
          setGated(true)
          setCreditsOut(true)
          return
        }
      }
      if (res.status === 402) { setCreditsOut(true); return }
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

  // Intent-based paywall: always render the page. Gated users get the modal
  // when they hit Run. Past reports remain browsable on the Reports tab.

  return (
    <div className="kw-page">

      {/* Header, Geist 26/700 to anchor the page, subtitle slightly
          darker so it doesn't disappear on light backgrounds. Matches
          Competitors. */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 500, color: C.text1, letterSpacing: '-0.01em', marginBottom: 6, lineHeight: 1.12 }}>
          Keyword Research
        </h1>
        <p style={{ fontSize: 14, color: C.text2, fontWeight: 500, letterSpacing: '-0.005em', lineHeight: 1.45 }}>
          YouTube autocomplete and related searches, filtered by intent and ranked by opportunity
        </p>
      </div>

      {/* Tabs, New / Reports (mirrors Competitors pattern) */}
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
          background: 'rgba(201,160,48,0.06)', border: '1px solid rgba(201,160,48,0.2)',
          borderRadius: 0, padding: '12px 16px', marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: C.text1,
        }}>
          <span style={{ flex: 1 }}>
            You've used your free Keyword research this cycle. Your past reports stay available.
          </span>
          <button
            onClick={upgrade} disabled={coBusy}
            className="kw-btn-primary" style={{ padding: '7px 14px', fontSize: 12.5 }}>
            {coBusy ? 'Opening…' : 'Upgrade'}
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
          background: C.redBg, border: `1px solid ${C.redBdr}`, borderRadius: 0,
          padding: '10px 14px', marginBottom: 14, color: '#7a5b14', fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {/* Intent picker, green top stripe (selection moment) + tighter
          header with hierarchy, refined option rows. */}
      {intentOptions && !loading && (
        <div className="kw-card kw-in" style={{ padding: 0, marginBottom: 16, borderTop: `3px solid ${C.green}` }}>
          <div style={{ padding: '20px 24px 22px' }}>
            {/* Tightened header, single visual cluster instead of three
                stacked labels. Eyebrow + heading sit together; subtitle
                is the supporting line. */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: C.text3,
                letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 6 }}>
                Pick the niche
              </p>
              <p style={{ fontSize: 16, fontWeight: 600, color: C.text1,
                lineHeight: 1.35, letterSpacing: '-0.3px', marginBottom: 4 }}>
                What niche is this keyword for?
              </p>
              <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.55 }}>
                Pick the right audience so we search the correct space.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {intentOptions.map((opt, i) => (
                <div key={i} className="kw-intent-opt" onClick={() => runResearch(opt.keyword)}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14.5, fontWeight: 600, color: C.text1,
                        letterSpacing: '-0.15px' }}>{opt.label}</span>
                      {/* Keyword variant chip, green tint to match the
                          card's accent. The chip is data ("here's the
                          exact search we'll run"), not a label. */}
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: C.green, background: C.greenBg,
                        border: `1px solid ${C.greenBdr}`,
                        padding: '2px 9px', borderRadius: 0,
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '-0.02em',
                      }}>{opt.keyword}</span>
                    </div>
                    <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>{opt.description}</p>
                  </div>
                  <svg className="arrow" width="16" height="16" viewBox="0 0 14 14" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 3l4 4-4 4"/>
                  </svg>
                </div>
              ))}
            </div>

            <button onClick={() => runResearch('')} className="kw-intent-decide-btn">
              Let {isChannelBrain() ? 'ChannelBrain' : 'YTGrowth'} decide
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 2l4 4-4 4"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Results, every section follows the SEO Studio "Keyword research"
          pattern exactly (SeoOptimizer.jsx:1366-1421):
          out-of-card H2 section header, then a single amber-topped card
          with an uppercase eyebrow + subtitle on the left and a big tabular
          count on the right, hairline divider, then a 2-col row grid with
          an amber vertical divider between columns. */}
      {result && (
        <div className="kw-in">

          {/* ── Top Pick + Search Intent, COMBINED hero. Exact Title
              Scorecard pattern (SeoOptimizer.jsx:1015-1097): ScoreRing on
              the left, amber 3px vertical divider, AI verdict paragraph in
              the middle, second amber divider, intent breakdown on the
              right. One card, three columns. ─────────────────────────── */}
          {result.topPick && (() => {
            const topScore = typeof result.topPick.opportunityScore === 'number'
              ? result.topPick.opportunityScore
              : Math.max(0, ...(result.keywords || []).map(k => k.opportunityScore || 0))
            const scoreCol = oppColor(topScore)
            // Drop the < 28 char filter, the intent breakdown was rendering
            // single-row when the AI returned slightly longer labels. Show all
            // three fields if present.
            const rows = [
              ['Primary intent', result.seedIntent?.primaryIntent],
              ['Content type',   result.seedIntent?.contentTypeExpected],
              ['Funnel stage',   result.seedIntent?.funnelStage],
            ].filter(([, v]) => v && v.trim().length > 0)

            // Top-3 ranking videos for the top-pick keyword. Backend already
            // attaches this per keyword (keywords.py:_fetch_competition_for_keyword)
            // so we look it up by keyword string. Visual proof that justifies the pick.
            // Fallback: if the exact top-pick keyword wasn't in the top-5
            // enriched set, scan the rest and use the first keyword with
            // videos. Better than showing no band at all.
            const allKws        = result.keywords || []
            const topPickKw     = allKws.find(k => k.keyword === result.topPick.keyword)
            const topPickVideos = (topPickKw?.competition?.top_videos?.length > 0)
              ? topPickKw.competition.top_videos
              : (allKws.find(k => k?.competition?.top_videos?.length > 0)?.competition?.top_videos || [])
            const topPerformer  = topPickVideos.length > 0
              ? Math.max(...topPickVideos.map(v => v.views || 0))
              : 0

            return (
              <div style={{
                background: C.cardFlat, border: '1px solid rgba(20,19,15,0.08)', borderRadius: 0,
                padding: '28px 32px',
                boxShadow: 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>

                  {/* LEFT, ScoreRing + 'TOP PICK' label + keyword caption */}
                  <div style={{ flexShrink: 0, textAlign: 'center' }}>
                    <ScoreRing score={topScore} />
                    <p style={{ fontSize: 11, color: C.text3, fontWeight: 600, marginTop: 8, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                      Top pick
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: C.text1, marginTop: 4, maxWidth: 140, lineHeight: 1.35, letterSpacing: '-0.1px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {result.topPick.keyword}
                    </p>
                    <div style={{ marginTop: 6 }}><EstimateTag color={C.text3} /></div>
                  </div>

                  {/* Amber 3px divider, matches Title Scorecard */}
                  <div style={{ width: 3, alignSelf: 'stretch', background: C.amber, flexShrink: 0, borderRadius: 0 }}/>

                  {/* MIDDLE, AI verdict paragraph */}
                  <div style={{ flex: 1.3, minWidth: 0 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 10 }}>
                      AI verdict
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 400, color: C.text1, lineHeight: 1.75, letterSpacing: '-0.005em' }}>
                      Your strongest keyword is <span style={{ fontWeight: 600, color: C.text1 }}>{result.topPick.keyword}</span> at <span style={{ fontWeight: 600, color: scoreCol }}>{topScore}/100</span>. {result.topPick.whyThisOne}
                      {result.seedIntent?.intentSummary && <> {result.seedIntent.intentSummary}</>}
                    </p>
                  </div>

                  {/* Second amber divider */}
                  {rows.length > 0 && (
                    <div style={{ width: 3, alignSelf: 'stretch', background: C.amber, flexShrink: 0, borderRadius: 0 }}/>
                  )}

                  {/* RIGHT, Intent breakdown rows */}
                  {rows.length > 0 && (
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 12 }}>
                        Intent breakdown
                      </p>
                      {rows.map(([label, val]) => {
                        const isAwareness = /awareness|discover|explor/i.test(val)
                        const tone        = isAwareness ? C.green : C.text1
                        const toneBg      = isAwareness ? C.greenBg : C.chipBg
                        const toneBdr     = isAwareness ? C.greenBdr : C.border
                        return (
                          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <span style={{ fontSize: 12.5, color: C.text2, fontWeight: 500, flexShrink: 0, width: 100, letterSpacing: '-0.01em' }}>{label}</span>
                            <span style={{
                              fontSize: 11, fontWeight: 600,
                              color: tone, background: toneBg,
                              border: `1px solid ${toneBdr}`,
                              borderRadius: 0, padding: '2px 10px',
                              letterSpacing: '0.08em', textTransform: 'uppercase',
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

          {/* ── Top-ranking videos band, its own section BELOW the Top Pick
               hero (was inside the hero card before; user wanted it as a
               distinct band). Pulls from competition.top_videos on the
               top-pick keyword, with fallback to any enriched keyword
               that has videos. Hidden when the backend returns nothing. */}
          {(() => {
            const allKws = result.keywords || []
            const topPickKw = allKws.find(k => k.keyword === result.topPick?.keyword)
            // Resolve which keyword's data drives the band. Top pick first,
            // then any enriched keyword with videos. The median is read from
            // the SAME keyword so the outlier math stays internally consistent.
            const sourceKw = (topPickKw?.competition?.top_videos?.length > 0)
              ? topPickKw
              : (allKws.find(k => k?.competition?.top_videos?.length > 0) || null)
            const topPickVideos = sourceKw?.competition?.top_videos || []
            // Outlier baseline = median of ALL 25 search results (see top
            // pick band above for why). Falls back to top-5 median when the
            // newer field is missing (old reports pre-backfill).
            const medianViews = sourceKw?.competition?.all_views_median || sourceKw?.competition?.top_views_median || 0
            if (topPickVideos.length === 0) return null
            const topPerformer = Math.max(...topPickVideos.map(v => v.views || 0))
            const fmtAge = (iso) => {
              if (!iso) return ''
              const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
              if (days < 1)   return 'today'
              if (days < 7)   return `${days}d ago`
              if (days < 30)  return `${Math.floor(days / 7)}w ago`
              if (days < 365) return `${Math.floor(days / 30)}mo ago`
              return `${Math.floor(days / 365)}y ago`
            }
            return (
              <div style={{ marginTop: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: C.text1, letterSpacing: '-0.2px' }}>
                    Top-ranking videos right now
                  </h2>
                  {topPerformer > 0 && (
                    <span style={{
                      marginLeft: 'auto',
                      display: 'inline-flex', alignItems: 'center', gap: 7,
                      fontSize: 12.5, fontWeight: 500, color: C.text2,
                      letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums',
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: 99, background: C.green, flexShrink: 0 }}/>
                      Top performer{' '}
                      <strong style={{ color: C.text1, fontWeight: 600 }}>{fmtCompact(topPerformer)} views</strong>
                    </span>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {topPickVideos.slice(0, 3).map((v, i) => {
                    const thumbHigh = v.video_id ? `https://i.ytimg.com/vi/${v.video_id}/maxresdefault.jpg` : null
                    const thumbFallback = v.video_id ? `https://i.ytimg.com/vi/${v.video_id}/hqdefault.jpg` : (v.thumbnail_url || null)
                    const thumb = thumbHigh || thumbFallback
                    const ytUrl = v.video_id ? `https://www.youtube.com/watch?v=${v.video_id}` : null
                    return (
                      <a key={v.video_id || i}
                        href={ytUrl || '#'}
                        target="_blank" rel="noopener noreferrer"
                        onClick={e => { if (!ytUrl) e.preventDefault() }}
                        style={{
                          display: 'block', textDecoration: 'none', color: 'inherit',
                          borderRadius: 0, overflow: 'hidden',
                          border: '1px solid rgba(20,19,15,0.08)', background: C.cardFlat,
                          boxShadow: 'none',
                          transition: 'transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.10)'
                          e.currentTarget.style.borderColor = 'rgba(20,19,15,0.16)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,15,25,0.04)'
                          e.currentTarget.style.borderColor = 'rgba(20,19,15,0.08)'
                        }}
                      >
                        <div style={{ position: 'relative', aspectRatio: '16 / 9', background: '#e8e4dc', overflow: 'hidden' }}>
                          {thumb && (
                            <img src={thumb} alt="" referrerPolicy="no-referrer" loading="lazy"
                              data-fallback={thumbFallback || ''}
                              onError={e => {
                                const t = e.currentTarget
                                const fb = t.getAttribute('data-fallback')
                                if (fb && t.src !== fb) { t.src = fb; t.removeAttribute('data-fallback') }
                              }}
                              onLoad={e => {
                                const t = e.currentTarget
                                const fb = t.getAttribute('data-fallback')
                                if (fb && t.naturalWidth > 0 && t.naturalWidth < 300) {
                                  t.src = fb
                                  t.removeAttribute('data-fallback')
                                }
                              }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
                          )}
                          {v.views > 0 && (
                            <span style={{
                              position: 'absolute', bottom: 8, right: 8,
                              background: 'rgba(0,0,0,0.82)', color: '#fff',
                              fontSize: 11.5, fontWeight: 600,
                              padding: '3px 7px', borderRadius: 0,
                              fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.05px',
                              backdropFilter: 'blur(2px)',
                            }}>{fmtCompact(v.views)}</span>
                          )}
                        </div>
                        <div style={{ padding: '11px 13px 13px' }}>
                          <p style={{
                            fontSize: 14, fontWeight: 500, color: C.text1,
                            letterSpacing: '-0.15px', lineHeight: 1.4,
                            margin: '0 0 4px',
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            overflow: 'hidden', minHeight: 38,
                          }}>{v.title}</p>
                          <p style={{
                            fontSize: 12, fontWeight: 500, color: C.text3,
                            letterSpacing: '-0.02px',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {v.channel_title}{v.published_at ? ` · ${fmtAge(v.published_at)}` : ''}
                          </p>
                          <VideoMetricsRow
                            vph={vphFor(v.views, v.published_at)}
                            outlierMult={outlierFor(v.views, medianViews)}
                          />
                        </div>
                      </a>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* ── Competition momentum, line chart of weekly top-ranking video
               counts for the top pick keyword over the last 12 weeks.
               Real data, derived from search.list publishedAt distribution
               (no extra API cost). Shows whether the niche is heating up or
               cooling down at a glance. Hidden when the timeline is empty
               (old reports pre-backfill, or quota fully exhausted). */}
          {(() => {
            const allKws = result.keywords || []
            const topPickKw = allKws.find(k => k.keyword === result.topPick?.keyword)
            const sourceKw = (topPickKw?.competition?.publishing_timeline?.length > 0)
              ? topPickKw
              : (allKws.find(k => k?.competition?.publishing_timeline?.length > 0) || null)
            const timeline = sourceKw?.competition?.publishing_timeline || []
            if (timeline.length < 2) return null
            const totalVideos = timeline.reduce((a, t) => a + (t.count || 0), 0)
            if (totalVideos === 0) return null  // empty chart adds no value
            return (
              <div style={{ marginTop: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: C.text1, letterSpacing: '-0.2px' }}>
                    Competition momentum
                  </h2>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: C.text3,
                    letterSpacing: '0.10em', textTransform: 'uppercase',
                  }}>last 12 weeks</span>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: 12.5, fontWeight: 500, color: C.text2,
                    letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums',
                  }}>
                    Top-ranking videos for <strong style={{ color: C.text1, fontWeight: 600 }}>{sourceKw.keyword}</strong>
                  </span>
                </div>
                <div className="kw-card" style={{ padding: '18px 22px 16px' }}>
                  <MomentumChart timeline={timeline} />
                </div>
              </div>
            )
          })()}

          {/* ── Ranked keywords, 2-col row grid inside one card. Each
              row is clickable to open the playbook modal. ── */}
          {result.keywords?.length > 0 && (
            <>
              <div style={{ marginBottom: 14, marginTop: 32 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: C.text1, letterSpacing: '-0.2px', marginBottom: 4 }}>Ranked keywords</h2>
                <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>
                  Click any keyword for the playbook · <span style={{ color: '#2d7a4f', fontWeight: 600 }}>ACTIVE</span> = rising · <span style={{ color: '#7a5b14', fontWeight: 600 }}>OPEN</span> = underclaimed
                </p>
              </div>

              <div className="kw-card">
                <div style={{ padding: '18px 22px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
                    <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: C.text3,
                        background: 'var(--yd-surface)', padding: '2px 8px',
                        borderRadius: 0, border: '1px solid rgba(20,19,15,0.08)',
                        fontVariantNumeric: 'tabular-nums',
                      }}>{result.keywords.length}</span>
                      <p style={{ fontSize: 13, fontWeight: 500, color: C.text2, lineHeight: 1.5, letterSpacing: '-0.01em' }}>
                        Score = volume signal + intent match + competition gap
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                      <button className={`kw-copy-btn${copied ? ' copied' : ''}`} onClick={handleCopyKeywords}>
                        {copied ? 'Copied' : 'Copy all'}
                      </button>
                    </div>
                  </div>

                  <div style={{ height: 1, background: C.border, margin: '0 0 14px' }}/>

                  {/* Two flex columns with a quiet hairline divider at 50%.
                      Was a loud 2px amber bar; the page already carries enough
                      red/green accent so this divider stays neutral. */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative' }}>
                    <div style={{
                      position: 'absolute', left: 'calc(50% - 0.5px)', top: 0, bottom: 0,
                      width: 1, background: 'rgba(20,19,15,0.08)', pointerEvents: 'none',
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
                                  fontSize: 14, color: C.text1, fontWeight: 500,
                                  width: 260, flexShrink: 0,
                                  letterSpacing: '-0.1px',
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                  transition: 'color 0.12s',
                                }}>{kw.keyword}</span>
                                <MomentumBadge momentum={kw.momentum} />
                                <div style={{ flex: 1, height: 4, background: 'rgba(20,19,15,0.08)', borderRadius: 99, overflow: 'hidden', minWidth: 40 }}>
                                  <div style={{ width: `${kw.opportunityScore}%`, height: '100%', background: scColor, borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}/>
                                </div>
                                <span style={{
                                  fontSize: 13, fontWeight: 600, color: scColor,
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

          {/* ── Content clusters, single card with N columns separated by
              amber 3px vertical dividers. No empty bottom-row cells; every
              theme gets its own equal-width column. Mirrors the Top Pick
              hero's column layout. Keyword chips are neutral (was green
              on green which read as a tinted block instead of as data). */}
          {result.clusters?.length > 0 && (
            <>
              <div style={{ marginBottom: 14, marginTop: 32 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: C.text1, letterSpacing: '-0.2px', marginBottom: 4 }}>Content clusters</h2>
                <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>
                  Themes you can build a series around
                </p>
              </div>

              <div className="kw-card" style={{ borderTop: `3px solid ${C.green}` }}>
                <div style={{ display: 'flex', alignItems: 'stretch', padding: '20px 22px' }}>
                  {/* Cap at 3, three columns reads cleanly in the 1040
                      column. More than 3 cramps the keyword chips and the
                      Copy theme buttons into unreadable narrow slots. */}
                  {result.clusters.slice(0, 3).map((cl, i, arr) => {
                    const isCopied = copiedCluster === cl.clusterName
                    const isLast = i === arr.length - 1
                    return (
                      <React.Fragment key={cl.clusterName}>
                        <div style={{
                          flex: 1, minWidth: 0,
                          paddingLeft:  i === 0 ? 0 : 18,
                          paddingRight: isLast ? 0 : 18,
                          display: 'flex', flexDirection: 'column',
                        }}>
                          {/* Eyebrow + theme name */}
                          <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4 }}>
                            Theme
                          </p>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
                            <p style={{ fontSize: 14, fontWeight: 500, color: C.text1, lineHeight: 1.35, letterSpacing: '-0.15px', flex: 1, minWidth: 0 }}>
                              {cl.clusterName}
                            </p>
                            <span style={{
                              fontSize: 11, fontWeight: 600, color: C.text3,
                              background: 'var(--yd-surface)', padding: '2px 8px',
                              borderRadius: 0, border: '1px solid rgba(20,19,15,0.08)',
                              flexShrink: 0, fontVariantNumeric: 'tabular-nums',
                            }}>{cl.keywords?.length || 0}</span>
                          </div>

                          {/* Keyword chips, clean green. Green is the
                              app's "positive opportunity" semantic and pairs
                              cleanly against the amber vertical dividers
                              without competing for the same color slot. */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                            {cl.keywords?.map(k => (
                              <span key={k} style={{
                                background: C.greenBg,
                                border: `1px solid ${C.greenBdr}`,
                                color: '#2d7a4f',
                                padding: '4px 11px', borderRadius: 0,
                                fontSize: 11.5, fontWeight: 500, letterSpacing: '-0.05px',
                              }}>{k}</span>
                            ))}
                          </div>

                          {/* Copy theme action at the bottom of each column */}
                          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-start' }}>
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

                        {/* Amber 3px vertical divider between columns */}
                        {!isLast && (
                          <div style={{
                            width: 3, alignSelf: 'stretch',
                            background: C.amber, flexShrink: 0, borderRadius: 0,
                          }}/>
                        )}
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Keyword playbook modal, row click opens this. */}
      {openRow && result?.keywords && (
        <KwDetailModal
          kw={result.keywords.find(k => k.keyword === openRow)}
          C={C}
          onClose={() => setOpenRow(null)}
        />
      )}

      </>)}

      {/* ── Reports tab, past /keywords/research runs ────────────────────── */}
      {activeTab === 'reports' && (
        <div>
          {reportsLoading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: C.text3, fontSize: 13 }}>
              Loading reports…
            </div>
          ) : reports.length === 0 ? (
            <div style={{
              padding: '56px 24px', textAlign: 'center',
              background: C.cardFlat, border: `1px solid ${C.border}`, borderRadius: 0,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06)',
            }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: C.text1, letterSpacing: '-0.2px', marginBottom: 8 }}>
                No reports yet
              </p>
              <p style={{ fontSize: 14, color: C.text3, maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
                Run a keyword research and it'll show up here, so you can always come back to a report you've already paid for.
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
                        <p style={{ fontWeight: 600, fontSize: 15, color: C.text1,
                          letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden',
                          textOverflow: 'ellipsis', marginBottom: 8 }}>
                          {r.keyword}
                        </p>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
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
                          <span style={{ fontSize: 12, color: C.text3, fontWeight: 500, marginLeft: 4 }}>
                            · {relTime(r.updated_at)}
                          </span>
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, borderLeft: '1px solid rgba(20,19,15,0.08)',
                        paddingLeft: 16, marginLeft: 4, paddingRight: 12 }}>
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

      {gated ? (
        <UpsellModal
          open={creditsOut}
          onClose={() => setCreditsOut(false)}
          title="Keyword research is a paid feature"
          description="Keyword research isn't part of the free trial. Upgrade to unlock it, with YouTube autocomplete, related searches, and opportunity-ranked scoring every time."
          bullets={[
            'Unlimited keyword research runs every month',
            'Real search volume and competition via YouTube + SerpAPI',
            'Ranked by niche opportunity so you pick the strongest title',
          ]}
          showPackLink={false}
        />
      ) : (
        <CreditsEmptyModal
          open={creditsOut}
          onClose={() => setCreditsOut(false)}
          featureName="keyword research runs"
        />
      )}
    </div>
  )
}
