import { useState, useEffect, useRef } from 'react'
import UpsellGate from '../components/UpsellGate'
import CreditsEmptyModal from '../components/CreditsEmptyModal'

// Geist loaded page-scoped, matches Chat / Competitors / Keywords / Outliers /
// Video Review / Weekly Report / My Videos.
if (typeof document !== 'undefined' && !document.getElementById('vi-geist-font')) {
  const link = document.createElement('link')
  link.id = 'vi-geist-font'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap'
  document.head.appendChild(link)
}

/* Dark, mirrors the shipped app-shell / Competitors dark system.
   Defined above the injected stylesheet so it can interpolate ${C.*}.
   Semantic hues kept; *Hi-bright text for the dark tinted chips. */
const C = {
  red:    '#c9a030', redBg:   'rgba(201,160,48,0.13)', redBdr:   'rgba(201,160,48,0.32)', redHi:   '#7a5b14',
  green:  '#16a34a', greenBg: 'rgba(22,163,74,0.14)', greenBdr: 'rgba(22,163,74,0.34)', greenHi: '#2d7a4f',
  amber:  '#d97706', amberBg: 'rgba(217,119,6,0.14)', amberBdr: 'rgba(217,119,6,0.34)', amberHi: '#b07d1a',
  blue:   '#8a8378', blueBg:  'rgba(79,134,247,0.14)', blueBdr: 'rgba(79,134,247,0.34)',
  text1:  '#14130f',
  text2:  '#6b6862',
  text3:  '#6b6862',
  text4:  'rgba(20,19,15,0.30)',
  border: 'rgba(20,19,15,0.08)',
  card:        'linear-gradient(180deg, var(--yd-surface) 0%, var(--yd-surface) 100%)',
  cardFlat:    'var(--yd-surface)',
  surfaceInput:'var(--yd-surface)',
  hair:        'rgba(20,19,15,0.08)',
  hairHi:      'rgba(20,19,15,0.16)',
  wash:        'rgba(20,19,15,0.04)',
  washActive:  'rgba(20,19,15,0.06)',
  cardShadow:     '0 1px 3px rgba(0,0,0,0.4)',
  cardShadowLift: '0 6px 20px rgba(0,0,0,0.55)',
}

/* ─── Styles injected once, matches the Overview/Videos/Outliers design
       language: hairline borders, system-standard elevation (0 1/3 + 0 4/16),
       no hover-lift transforms. ───────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('ytg-vi-styles')) {
  const s = document.createElement('style')
  s.id = 'ytg-vi-styles'
  s.textContent = `
    .vi-page * { font-family: 'Barlow', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }

    @keyframes viSpin    { to { transform: rotate(360deg) } }
    @keyframes viFadeUp  { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }

    /* Idea card, direct copy of SEO Studio's .seo-suggestion-card tokens
       (SeoOptimizer.jsx:33-45) so Video Ideas reads as the same element as
       "Suggested titles": 14px radius, hairline border, system elevation
       (0 1/2 + 0 4/14), lift on hover. Amber 3px top stripe is applied
       inline per-card, matching Dashboard Priority Actions. */
    .vi-idea-card {
      background: ${C.card};
      border: 1px solid ${C.hair};
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 12px;
      box-shadow: ${C.cardShadow};
      transition: box-shadow 0.18s ease, transform 0.18s ease, opacity 0.2s;
      animation: viFadeUp 0.26s ease both;
    }
    .vi-idea-card:hover {
      box-shadow: ${C.cardShadowLift};
      border-color: ${C.hairHi};
      transform: translateY(-1px);
    }
    .vi-idea-card.done { opacity: 0.48; }
    /* Severity stripe, 3px coloured line at the top edge of each card,
       gives each idea a scannable visual entry point colour-keyed to its
       opportunity score. Matches the Feed Priority Action cards. */
    .vi-stripe {
      height: 3px;
      width: 100%;
    }

    .vi-skeleton {
      background: linear-gradient(90deg, rgba(20,19,15,0.04) 25%, rgba(20,19,15,0.08) 50%, rgba(20,19,15,0.04) 75%);
      background-size: 200% 100%;
      animation: viSkeleton 1.4s ease infinite;
      border-radius: 8px;
    }
    @keyframes viSkeleton {
      0%   { background-position: 200% 0 }
      100% { background-position: -200% 0 }
    }

    /* Refresh-confirm modal, minimal overlay, matches other dialogs in the
       app: backdrop blur + centered card with hairline + system elevation. */
    .vi-modal-backdrop {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px; animation: viFadeUp 0.2s ease both;
    }
    .vi-modal {
      background: ${C.card}; border-radius: 16px;
      border: 1px solid ${C.hair};
      box-shadow: 0 16px 48px rgba(0,0,0,0.6);
      width: 100%; max-width: 440px; overflow: hidden;
    }
  `
  document.head.appendChild(s)
}

/* ─── Design tokens, matches the shared dashboard palette (no purple; red
       is strictly semantic for CTAs/hero, amber covers AI-generated accent,
       green = completed/positive, blue = informational tint). ─────────── */
/* (dark C palette defined above the injected stylesheet) */

const API = ''

/* ─── Thumbnail HD ladder (ported from Autopsy.jsx:333-358) ─────────────────
   YouTube's data API only returns thumbnail entries for resolutions the
   creator explicitly uploaded, so trusting the API URL leaves us with
   320x180 mqdefault on many videos. Bypass it: request maxresdefault.jpg
   straight from the CDN (served for nearly every video, even when the
   API doesn't list it), detect the 120x90 placeholder via naturalWidth,
   then fall back to hqdefault.jpg (always 480x360), and finally to the
   API-provided URL as a last resort.
   ──────────────────────────────────────────────────────────────────────── */
function ytMaxThumbUrl(videoId) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : null
}
function _advanceThumb(target, videoId, fallbackUrl) {
  const step = target.dataset.thumbStep || 'max'
  if (step === 'max' && videoId) {
    target.dataset.thumbStep = 'hq'
    target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  } else if (step !== 'done' && fallbackUrl) {
    target.dataset.thumbStep = 'done'
    target.src = fallbackUrl
  }
}
function makeThumbOnError(videoId, fallbackUrl) {
  return (e) => _advanceThumb(e.target, videoId, fallbackUrl)
}
function makeThumbOnLoad(videoId, fallbackUrl) {
  return (e) => {
    const step = e.target.dataset.thumbStep || 'max'
    // The CDN serves a 120x90 placeholder when maxres doesn't exist
    // for the video (no HTTP error). Detect it and step down.
    if (step === 'max' && e.target.naturalWidth === 120 && e.target.naturalHeight === 90) {
      _advanceThumb(e.target, videoId, fallbackUrl)
    }
  }
}

/* ─── Sub-components ────────────────────────────────────────────────────── */

function SpinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ animation: 'viSpin 0.8s linear infinite', flexShrink: 0 }}>
      <path d="M6.5 1v2M6.5 10v2M1 6.5h2M10 6.5h2M2.8 2.8l1.4 1.4M8.8 8.8l1.4 1.4M2.8 10.2l1.4-1.4M8.8 4.2l1.4-1.4"/>
    </svg>
  )
}

function LightbulbIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke={C.text4} strokeWidth="1.5" strokeLinecap="round">
      <path d="M20 4a12 12 0 0 1 8 20.6V28a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2v-3.4A12 12 0 0 1 20 4z"/>
      <path d="M16 30v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2"/>
    </svg>
  )
}

function ScorePill({ score }) {
  // Standard app scoreColor thresholds: ≥75 green, 55–74 amber, <55 red
  // (matches Overview's Score breakdown and SeoOptimizer's score rings).
  const color = score >= 75 ? C.green : score >= 55 ? C.amber : C.red
  const bg    = score >= 75 ? C.greenBg : score >= 55 ? C.amberBg : C.redBg
  const bdr   = score >= 75 ? C.greenBdr : score >= 55 ? C.amberBdr : C.redBdr
  return (
    <span style={{
      fontSize: 14, fontWeight: 700, color,
      background: bg, border: `1px solid ${bdr}`,
      borderRadius: 8, padding: '4px 10px',
      whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums',
    }}>
      {score}
    </span>
  )
}

function SourceBadge({ source }) {
  // AI generated uses amber (the system's accent-worthy colour). Purple has
  // been removed from the strict red/amber/green palette.
  const tone = source === 'ai'
    ? { color: C.amberHi, bg: C.amberBg, bdr: C.amberBdr, label: 'AI generated' }
    : { color: C.blue,  bg: C.blueBg,  bdr: C.blueBdr,  label: 'Competitor gap' }
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
      color: tone.color, background: tone.bg,
      border: `1px solid ${tone.bdr}`,
      borderRadius: 100, padding: '2px 9px',
    }}>{tone.label}</span>
  )
}

function KeywordPill({ keyword }) {
  if (!keyword) return null
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 12, fontWeight: 500,
      color: C.text2, background: C.cardFlat,
      border: `1px solid ${C.border}`,
      borderRadius: 20, padding: '5px 11px',
    }}>
      {keyword}
    </span>
  )
}

function SkeletonCard({ index }) {
  return (
    <div className="vi-idea-card" style={{
      borderTop: `3px solid ${C.amber}`,
      opacity: 1 - index * 0.05,
    }}>
      <div style={{ padding: '16px 22px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingTop: 2 }}>
            <div className="vi-skeleton" style={{ width: 15, height: 15, borderRadius: 3 }} />
            <div className="vi-skeleton" style={{ width: 26, height: 26, borderRadius: 8 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="vi-skeleton" style={{ height: 10, width: 140, marginBottom: 7 }} />
            <div className="vi-skeleton" style={{ height: 14, width: '72%' }} />
          </div>
          <div className="vi-skeleton" style={{ width: 58, height: 22, borderRadius: 20, flexShrink: 0 }} />
        </div>
        <div style={{ height: 1, background: C.border, marginBottom: 14, marginLeft: 46 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 8, marginLeft: 46 }}>
          <div className="vi-skeleton" style={{ height: 78, borderRadius: 10 }} />
          <div className="vi-skeleton" style={{ height: 78, borderRadius: 10 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14, marginLeft: 46 }}>
          <div className="vi-skeleton" style={{ width: 168, height: 36, borderRadius: 100 }} />
        </div>
      </div>
    </div>
  )
}

/* RefreshConfirmModal, shown before a paid refresh. Lists the cost and
   how the generation is scoped so the user knows what 1 credit buys. */
function RefreshConfirmModal({ credits, onCancel, onConfirm }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="vi-modal-backdrop" onClick={onCancel}>
      <div className="vi-modal" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '22px 24px 20px' }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: C.amberHi, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            Uses 1 credit
          </p>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text1, letterSpacing: '-0.2px', lineHeight: 1.3, marginBottom: 10 }}>
            Generate fresh video ideas?
          </h3>
          <p style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.65, marginBottom: 14 }}>
            YTGrowth will produce 10 new ideas based on:
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Your channel niche and audit signals',
              'Your tracked competitors (last 12 months only)',
              'Current-year search and distribution trends',
            ].map((t, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: C.text2, lineHeight: 1.55 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                  <polyline points="2,7.5 6,11 12,3"/>
                </svg>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <div style={{
            fontSize: 12.5, color: C.text3, background: '#f6f6f9',
            border: `1px solid ${C.border}`, borderRadius: 10,
            padding: '9px 12px', lineHeight: 1.55, marginBottom: 18,
          }}>
            Your existing ideas will be replaced.
            {credits != null && <> You have <strong style={{ color: C.text1 }}>{credits} credits</strong> remaining.</>}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '10px 18px', borderRadius: 100,
                border: `1px solid ${C.border}`, background: C.cardFlat, color: C.text2,
                fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f6f6f9' }}
              onMouseLeave={e => { e.currentTarget.style.background = C.cardFlat }}
            >Cancel</button>
            <button
              onClick={onConfirm}
              style={{
                padding: '10px 20px', borderRadius: 100, border: 'none',
                background: C.red, color: 'var(--yd-on-gold)',
                fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit',
                letterSpacing: '0.01em', cursor: 'pointer',
                transition: 'filter 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
            >Refresh · 1 credit</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* IdeaCard, direct adaptation of SEO Studio's Suggested Title card
   (SeoOptimizer.jsx:1271-1353). Canonical insight-card skeleton shared by
   Dashboard Priority Actions and SEO Studio suggestions: 3px amber top
   stripe, 14px radius, 26×26 amber rank badge + "Built around" eyebrow +
   title + severity pill header, hairline divider at marginLeft:46, tinted
   2-col body (blue Why-now / white+amber-bar Action), bottom action row
   with red primary CTA. Checkbox added to the rank cluster so this card
   also tracks completion like Priority Actions. */
/* IdeaCard v4, proof-led layout. The cheesy gradient mockup is gone.
   Now each idea shows REAL evidence: a row of 3 thumbnail tiles for the
   top YouTube videos already ranking for this keyword today, with
   actual view counts and channel names. Score chip moves to a small
   indicator beside the eyebrow since the proof IS the score. */
function IdeaCard({ idea, done, onDone, onUseSeo }) {
  const [open, setOpen] = useState(false)
  const score = idea.source === 'ai' && idea.opportunityScore
    ? idea.opportunityScore
    : Math.max(65, 85 - (idea.rank - 1) * 2)

  const sevLabel = score >= 75 ? 'Strong' : score >= 60 ? 'Solid' : 'Weak'
  const sevColor = score >= 75 ? C.green : score >= 60 ? C.amber : C.red
  const sevBg    = score >= 75 ? 'rgba(22,163,74,0.08)' : score >= 60 ? 'rgba(217,119,6,0.08)' : 'rgba(201,160,48,0.07)'
  const sevBdr   = score >= 75 ? 'rgba(22,163,74,0.22)' : score >= 60 ? 'rgba(217,119,6,0.22)' : 'rgba(201,160,48,0.18)'

  const proof = Array.isArray(idea.top_competing_videos) ? idea.top_competing_videos : []
  const hasProof = proof.length > 0

  // Surface the strongest "evidence" signal: max views among the
  // proof tiles. This is the single number that tells the user the
  // topic is hot.
  const topViews = hasProof ? Math.max(...proof.map(p => p.views || 0)) : 0
  const fmtViews = (n) => {
    if (!n) return '0'
    if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    if (n >= 1_000)     return `${(n/1_000).toFixed(1).replace(/\.0$/, '')}K`
    return String(n)
  }

  // Severity stripe color for the 3px top accent.
  const stripeColor = done
    ? 'rgba(20,19,15,0.08)'
    : (score >= 75 ? C.green : score >= 60 ? C.amber : C.red)

  return (
    <div className={`vi-idea-card${done ? ' done' : ''}`}>
      <div className="vi-stripe" style={{ background: stripeColor }}/>
      <div style={{ padding: 18 }}>

        {/* ── Eyebrow row. Typography scale:
            - Rank badge number: 11.5/800 (slightly bumped for legibility)
            - Eyebrow label: 11/800 uppercase 0.12em (was 10, too small)
            - Keyword + meta:  12/500 (was 11, too small)
            - Severity chip:   10.5/700 uppercase (was 9.5, too small)
            One consistent scale, nothing under 10.5px. ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{
            flexShrink: 0,
            width: 26, height: 26, borderRadius: 7,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: done ? 'rgba(22,163,74,0.10)' : 'rgba(217,119,6,0.10)',
            border: done ? '1px solid rgba(22,163,74,0.22)' : '1px solid rgba(217,119,6,0.22)',
          }}>
            {done
              ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5,6.5 5,10 10.5,2"/></svg>
              : <span style={{ fontSize: 11.5, fontWeight: 700, color: C.amberHi, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.3px' }}>{idea.rank}</span>
            }
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, color: C.text2,
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>Video Idea</span>
          {idea.targetKeyword && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 12, fontWeight: 500, color: C.text2,
              letterSpacing: '-0.01em',
            }}>
              <span style={{ width: 3, height: 3, borderRadius: 99, background: 'rgba(20,19,15,0.12)' }}/>
              {idea.targetKeyword}
            </span>
          )}
          <div style={{ flex: 1 }}/>
          {!done && (
            <span style={{
              fontSize: 10.5, fontWeight: 600, color: sevColor,
              background: sevBg, border: `1px solid ${sevBdr}`,
              padding: '3px 9px', borderRadius: 100,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              fontVariantNumeric: 'tabular-nums',
            }}>{sevLabel} · {score}</span>
          )}
          <input
            type="checkbox"
            checked={!!done}
            onChange={() => onDone(idea.title)}
            title="Mark as done"
            style={{ width: 15, height: 15, accentColor: C.green, cursor: 'pointer', flexShrink: 0 }}
          />
        </div>

        {/* ── Title (single bold line). 17/700 to anchor the card as the
            hero element, slightly larger than Feed cards (which are 15-16)
            because this page is title-focused, every card IS a proposed
            title, so the typography should make that the star. ── */}
        <h3 style={{
          fontSize: 16, fontWeight: 600,
          color: done ? 'rgba(20,19,15,0.12)' : C.text1,
          letterSpacing: '-0.2px', lineHeight: 1.35,
          marginBottom: done ? 0 : 18,
          textDecoration: done ? 'line-through' : 'none',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{idea.title}</h3>

        {!done && (
          <>
            {/* ── PROOF ROW: real YouTube videos ranking for this keyword
                in the last 12 months. Typography scale:
                - Section eyebrow:   11/700 uppercase
                - Best-chip:         11/700
                - Tile title:        13/600 (was 11.5, too small)
                - Tile channel/age:  11.5/600 (was 10, too small)
                - View badge:        11/800
                Tile titles are uniform across all three. Click a tile
                to open the video on YouTube. ── */}
            {hasProof && (
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: 12, flexWrap: 'wrap',
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: C.text2,
                    letterSpacing: '0.10em', textTransform: 'uppercase',
                  }}>Currently ranking</span>
                  <div style={{ flex: 1 }}/>
                  {/* Softer "Best" stat. No tinted background, no border —
                      just an inline metric with a small green dot. Reads
                      as data, not as a chip competing with the eyebrow. */}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 11.5, fontWeight: 600, color: C.text2,
                    letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums',
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: 99, background: C.green }}/>
                    Top performer{' '}
                    <strong style={{ color: C.text1, fontWeight: 600 }}>{fmtViews(topViews)} views</strong>
                  </span>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${proof.length}, 1fr)`,
                  gap: 12,
                }}>
                  {proof.map((p, i) => (
                    <a
                      key={p.video_id || i}
                      href={`https://www.youtube.com/watch?v=${p.video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        textDecoration: 'none', color: 'inherit',
                        borderRadius: 10, overflow: 'hidden',
                        border: '1px solid rgba(20,19,15,0.08)',
                        background: C.cardFlat,
                        transition: 'transform 0.14s, box-shadow 0.14s, border-color 0.14s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.10)'; e.currentTarget.style.borderColor = '#4a4843' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(20,19,15,0.08)' }}
                    >
                      <div style={{
                        position: 'relative',
                        aspectRatio: '16/9',
                        background: '#e8e4dc',
                        overflow: 'hidden',
                      }}>
                        {(p.video_id || p.thumbnail) && (
                          <img
                            src={p.video_id ? ytMaxThumbUrl(p.video_id) : p.thumbnail}
                            alt=""
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            data-thumb-step="max"
                            onError={makeThumbOnError(p.video_id, p.thumbnail)}
                            onLoad={makeThumbOnLoad(p.video_id, p.thumbnail)}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        )}
                        <span style={{
                          position: 'absolute', bottom: 7, right: 7,
                          background: 'rgba(0,0,0,0.78)', color: '#fff',
                          fontSize: 11, fontWeight: 700,
                          padding: '3px 7px', borderRadius: 5,
                          fontVariantNumeric: 'tabular-nums',
                          letterSpacing: '-0.05px',
                          backdropFilter: 'blur(2px)',
                        }}>{fmtViews(p.views)}</span>
                      </div>
                      <div style={{ padding: '10px 12px 12px' }}>
                        <p style={{
                          fontSize: 13, fontWeight: 600, color: C.text1,
                          letterSpacing: '-0.15px', lineHeight: 1.4,
                          marginBottom: 6,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          minHeight: 36,
                        }}>{p.title}</p>
                        <p style={{
                          fontSize: 11.5, fontWeight: 600, color: C.text3,
                          letterSpacing: '-0.05px',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{p.channel_name}{p.age_label ? ` · ${p.age_label}` : ''}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ── Empty proof state: small inline note ── */}
            {!hasProof && (
              <div style={{
                background: 'rgba(20,19,15,0.04)',
                border: '1px dashed rgba(15,15,19,0.10)',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 14,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(10,10,15,0.40)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="7" cy="7" r="5.5"/><path d="M7 4v3.5l2 1.5"/>
                </svg>
                <p style={{ fontSize: 11.5, color: C.text3, fontWeight: 500, letterSpacing: '-0.01em' }}>
                  Looking up videos ranking for this. Refresh in a moment.
                </p>
              </div>
            )}

            {/* ── Action row. Meta line is tight and data-first; buttons
                use the standard 12.5/700 Feed CTA scale. ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: C.text3, letterSpacing: '-0.01em' }}>
                {hasProof
                  ? `${proof.length} ranking · last 12 months`
                  : 'Evidence loading'}
                {idea.thumbnail_ready && (
                  <>{' · '}<span style={{ color: C.greenHi, fontWeight: 600 }}>Thumbnail ready</span></>
                )}
              </span>
              <div style={{ flex: 1 }}/>
              <button
                onClick={() => onUseSeo(idea.title)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '8px 14px', borderRadius: 100,
                  border: 'none', cursor: 'pointer',
                  background: C.red, color: 'var(--yd-on-gold)',
                  fontFamily: 'inherit',
                  fontSize: 12.5, fontWeight: 600, letterSpacing: '-0.01em',
                  boxShadow: '0 1px 3px rgba(201,160,48,0.30)',
                  transition: 'filter 0.14s ease, transform 0.14s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Use in SEO Studio
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M2 5.5h7M5.5 2l3.5 3.5L5.5 9"/></svg>
              </button>
              {idea.angle && (
                <button
                  type="button"
                  onClick={() => setOpen(o => !o)}
                  aria-label={open ? 'Hide angle' : 'Show angle'}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '7px 12px', borderRadius: 100,
                    border: '1px solid rgba(20,19,15,0.08)',
                    background: C.cardFlat, color: C.text2,
                    fontFamily: 'inherit',
                    fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
                    cursor: 'pointer',
                    transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,19,15,0.04)'; e.currentTarget.style.color = C.text1; e.currentTarget.style.borderColor = '#d0d0d8' }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.cardFlat; e.currentTarget.style.color = C.text2; e.currentTarget.style.borderColor = 'rgba(20,19,15,0.08)' }}
                >
                  Detail
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}><polyline points="3,4.5 6,7.5 9,4.5"/></svg>
                </button>
              )}
            </div>

            {/* ── Detail (collapsed) ── */}
            {open && idea.angle && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f1f4' }}>
                <div style={{
                  background: 'rgba(217,119,6,0.05)',
                  border: '1px solid rgba(217,119,6,0.14)',
                  borderLeft: `3px solid ${C.amber}`,
                  borderRadius: '0 10px 10px 0',
                  padding: '12px 16px',
                }}>
                  <p style={{ fontSize: 9.5, fontWeight: 600, color: C.amberHi, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 6 }}>Why this works</p>
                  <p style={{ fontSize: 13, fontWeight: 500, color: C.text1, letterSpacing: '-0.01em', lineHeight: 1.65 }}>{idea.angle}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Main component ────────────────────────────────────────────────────── */

const DONE_KEY = 'ytg_vi_done'

function loadDone() {
  try { return new Set(JSON.parse(localStorage.getItem(DONE_KEY) || '[]')) } catch { return new Set() }
}
function saveDone(set) {
  try { localStorage.setItem(DONE_KEY, JSON.stringify([...set])) } catch {}
}

export default function VideoIdeas({ onNavigate, plan, freeTierFeatures }) {
  const [ideas,       setIdeas]      = useState([])
  const [source,      setSource]     = useState('empty')
  const [creditsOut,  setCreditsOut] = useState(false)
  const [lastUpdated, setLastUpdated]= useState('')
  const [stale,       setStale]      = useState(false)
  const [loading,     setLoading]    = useState(true)   // initial fetch
  const [refreshing,  setRefreshing] = useState(false)  // paid refresh
  const [error,       setError]      = useState('')
  const [credits,     setCredits]    = useState(null)
  const [done,        setDone]       = useState(() => loadDone())
  const [confirmOpen, setConfirmOpen]= useState(false)
  const mountedRef = useRef(true)

  // Free-tier partial-access gate. Free users:
  // - See their 5 ideas (the backend caps the GET response).
  // - Cannot trigger refresh (the Refresh button is hidden).
  // - If they somehow hit /video-ideas/refresh and server 403s, we flip to
  //   the full upsell modal to make the spec enforcement visible.
  const isFreePlan = (plan || 'free') === 'free'
  const [refreshGated, setRefreshGated] = useState(false)

  function toggleDone(title) {
    setDone(prev => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      saveDone(next)
      return next
    })
  }

  function clearCompleted() {
    setDone(prev => {
      const completed = [...prev].filter(t => ideas.some(i => i.title === t))
      const next = new Set(prev)
      completed.forEach(t => next.delete(t))
      saveDone(next)
      return next
    })
  }

  const doneCount = ideas.filter(i => done.has(i.title)).length

  /* ── On mount: fetch ideas silently ── */
  useEffect(() => {
    mountedRef.current = true
    fetchIdeas()
    return () => { mountedRef.current = false }
  }, [])

  async function fetchIdeas() {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`${API}/video-ideas`, { credentials: 'include' })
      const data = await res.json()
      if (!mountedRef.current) return
      if (res.ok) {
        if (data.source !== 'empty' && data.ideas?.length) {
          setIdeas(data.ideas)
          setSource(data.source)
          setLastUpdated(data.last_updated || '')
          setStale(!!data.stale)
          return
        }
        // Backend has nothing, try backfilling from Competitors localStorage cache
        const seeded = await seedFromLocalStorage()
        if (seeded) {
          setIdeas(seeded.ideas)
          setSource(seeded.source)
          setLastUpdated(seeded.last_updated || 'today')
          setStale(false)
        } else {
          setSource('empty')
        }
      }
    } catch (e) {
      if (mountedRef.current) setError('Could not load ideas. Check your connection.')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  async function seedFromLocalStorage() {
    try {
      const raw = localStorage.getItem('ytgrowth_tracked_competitors')
      if (!raw) return null
      const tracked = JSON.parse(raw)
      if (!Array.isArray(tracked) || !tracked.length) return null

      // Pool videoIdeas from all tracked competitor analyses
      const seen = new Set()
      const pooled = []
      let rank = 1
      for (const entry of tracked) {
        const ideas = entry.ai_analysis?.videoIdeas || []
        for (const idea of ideas) {
          const key = (idea.title || '').toLowerCase().trim()
          if (!key || seen.has(key)) continue
          seen.add(key)
          pooled.push({
            rank: rank++,
            title: idea.title || '',
            targetKeyword: idea.targetKeyword || '',
            angle: idea.angle || '',
            opportunityScore: 70,
            source: 'competitor',
          })
          if (pooled.length >= 10) break
        }
        if (pooled.length >= 10) break
      }
      if (!pooled.length) return null

      // Persist to backend so future loads don't need this fallback
      const res = await fetch(`${API}/video-ideas/seed`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideas: pooled }),
      })
      if (!mountedRef.current) return null
      if (res.ok) return await res.json()
      // If seed call fails, still show the ideas from localStorage
      return { ideas: pooled, source: 'competitor', last_updated: 'today' }
    } catch {
      return null
    }
  }

  async function handleRefresh() {
    if (refreshing) return
    setRefreshing(true)
    setError('')
    try {
      const res  = await fetch(`${API}/video-ideas/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!mountedRef.current) return

      if (res.status === 401) { window.location = '/'; return }
      // 403 "locked" = free-tier refresh gate; swap to the upsell modal.
      if (res.status === 403 && (data.error === 'locked' || data.reason === 'locked')) {
        setRefreshGated(true)
        return
      }
      if (res.status === 402) {
        setCreditsOut(true)
        return
      }
      if (!res.ok) {
        setError(data.error || "Something went wrong on our end. Email support@ytgrowth.io and we'll sort it out.")
        return
      }
      setIdeas(data.ideas || [])
      setSource(data.source || 'ai')
      setLastUpdated(data.last_updated || 'today')
      setStale(false)
      if (data.credits_remaining != null) setCredits(data.credits_remaining)
      window.dispatchEvent(new CustomEvent('ytg:credits-changed'))
    } catch (e) {
      if (mountedRef.current) setError('Request failed. Please try again.')
    } finally {
      if (mountedRef.current) setRefreshing(false)
    }
  }

  function handleUseSeo(title) {
    try { localStorage.setItem('ytg_prefill_title', title) } catch {}
    if (onNavigate) onNavigate('SEO Studio')
  }

  const sourceLabel = {
    competitor: 'Based on competitor research',
    ai:         'AI generated',
    mixed:      'AI + competitor research',
    empty:      '',
  }[source] || ''

  /* ── Render ── */

  // Free-tier refresh was attempted and server returned 403, replace the
  // feature with the upsell modal. (Standard flow: free user's Refresh
  // button is already hidden; this catches any bypass attempts.)
  if (refreshGated) {
    // Teaser preview, mock ranked video-ideas list behind the gate.
    const viTeaser = (
      <div style={{
        background: C.cardFlat, border: `1px solid ${C.border}`,
        borderRadius: 16, padding: '22px 24px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            Fresh ideas · ranked by opportunity
          </p>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.text3, background: '#f1f1f6', border: `1px solid ${C.border}`, borderRadius: 100, padding: '2px 8px' }}>10 ranked</span>
        </div>
        {[
          ['My First 10K Subs · The 3 Things That Worked',           92],
          ['I Posted Daily for 30 Days, Honest Results',                      87],
          ['The Thumbnail Formula That Tripled My CTR',                        84],
          ['Why Your Intro Is Killing Your Retention (Fix in 60s)',            79],
        ].map(([t, score], i) => {
          const col = score >= 85 ? C.green : score >= 70 ? C.amber : C.red
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0',
              borderTop: i === 0 ? 'none' : `1px solid ${C.border}`,
            }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{i + 1}</span>
              </div>
              <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.text1, lineHeight: 1.4 }}>{t}</p>
              <span style={{
                fontSize: 11, fontWeight: 700, color: col,
                padding: '2px 8px', borderRadius: 100,
                border: `1.5px solid ${col}`,
              }}>{score}</span>
            </div>
          )
        })}
      </div>
    )
    return (
      <div className="vi-page" style={{ width: '100%' }}>
        <UpsellGate
          title="Unlock Video Ideas refreshes"
          description="Free accounts see up to 5 video ideas from your competitor analyses. Upgrade to refresh with AI every month, fresh ideas tuned to your niche, trend signals, and current-year search queries."
          bullets={[
            'Refresh your 10 ranked video ideas on demand',
            'Ideas tuned to your channel + tracked competitors + trend data',
            'Pair with SEO Studio to build the title and description in one click',
          ]}
          showPackLink={false}
          previewContent={viTeaser}
        />
      </div>
    )
  }

  return (
    <div className="vi-page" style={{ maxWidth: 1040, margin: '0 auto' }}>

      {/* Header, system H1 24/800/-0.6 + meta line with · separators (same
          pattern as Overview / SEO Optimizer / Thumbnail IQ).
          NOTE: every feature page wraps content in maxWidth 1040 centered,
          matching the Feed redesign. Do not break this without
          coordinating with the Feed column. */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: C.text1, letterSpacing: '-0.7px', marginBottom: 6, lineHeight: 1.1 }}>
            Video Ideas
          </h1>
          <p style={{
            fontSize: 14, color: C.text2, fontWeight: 500,
            letterSpacing: '-0.005em', lineHeight: 1.45,
            margin: 0,
          }}>
            Ready-to-use titles ranked by opportunity
            {lastUpdated && !loading && <>{' · '}Updated {lastUpdated}</>}
            {sourceLabel && !loading && <>{' · '}{sourceLabel}</>}
            {isFreePlan && !loading && <>{' · '}Free plan: 5 idea cap</>}
          </p>
        </div>

        {/* Refresh, tightened pill, matches Feed card CTA scale.
            Opens a confirmation modal (1 credit cost). Hidden for free
            users; backend also blocks the endpoint with a 403. */}
        {!isFreePlan && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={refreshing}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 15px', borderRadius: 100, border: 'none',
                fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
                letterSpacing: '-0.01em',
                background: refreshing ? '#e0e0e6' : C.red,
                color: refreshing ? C.text3 : '#fff',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                boxShadow: refreshing ? 'none' : '0 1px 3px rgba(201,160,48,0.28)',
                transition: 'filter 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => { if (!refreshing) { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
              onMouseLeave={e => { if (!refreshing) { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' } }}
            >
              {refreshing ? <><SpinIcon /> Generating</> : <>
                <svg width="12" height="12" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 6.5A4.5 4.5 0 1 1 6.5 2a4.5 4.5 0 0 1 3.18 1.32"/>
                  <path d="M9.5 1v2.8H12.3"/>
                </svg>
                Refresh ideas
              </>}
            </button>
            <div style={{ fontSize: 11, color: C.text3, marginTop: 5, fontWeight: 500, letterSpacing: '-0.01em' }}>
              1 AI analysis{credits != null && <> · {credits} left</>}
            </div>
          </div>
        )}
      </div>

      {/* Stale nudge, amber tint, same language as other banners in the app */}
      {stale && !loading && (
        <div style={{
          fontSize: 13, color: C.amberHi, background: C.amberBg,
          border: `1px solid ${C.amberBdr}`, borderRadius: 10,
          padding: '10px 14px', marginBottom: 14,
        }}>
          These ideas are over 30 days old. Refresh for updated opportunities.
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          fontSize: 13.5, color: C.red, background: C.redBg,
          border: `1px solid ${C.redBdr}`, borderRadius: 10,
          padding: '10px 14px', marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="6.5" cy="6.5" r="5"/><path d="M6.5 4v3M6.5 9v.5"/>
          </svg>
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {(loading || refreshing) && (
        <>
          {refreshing && (
            <p style={{ fontSize: 13, color: C.text3, marginBottom: 12 }}>
              Generating ideas from your channel data…
            </p>
          )}
          {Array.from({ length: 10 }, (_, i) => <SkeletonCard key={i} index={i} />)}
        </>
      )}

      {/* Empty state, matches system card elevation, not a hero */}
      {!loading && !refreshing && source === 'empty' && !error && (
        <div style={{
          textAlign: 'center', padding: '56px 24px',
          background: C.cardFlat, border: `1px solid ${C.border}`,
          borderRadius: 16, marginTop: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
        }}>
          <div style={{ marginBottom: 14 }}><LightbulbIcon /></div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text1, marginBottom: 8, letterSpacing: '-0.2px' }}>No ideas yet</h3>
          <p style={{ fontSize: 13.5, color: C.text3, maxWidth: 340, margin: '0 auto 22px', lineHeight: 1.6 }}>
            {isFreePlan
              ? 'Analyse a competitor to unlock up to 5 free video ideas tuned to their playbook.'
              : 'Analyze a competitor first to unlock free video ideas, or generate AI-powered ideas directly.'}
          </p>
          {isFreePlan ? (
            <button
              onClick={() => onNavigate && onNavigate('Competitors')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 22px', borderRadius: 100, border: 'none',
                fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit',
                letterSpacing: '0.01em',
                background: C.red, color: 'var(--yd-on-gold)', cursor: 'pointer',
                transition: 'filter 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              Go to Competitors →
            </button>
          ) : (
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={refreshing}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 22px', borderRadius: 100, border: 'none',
                fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit',
                letterSpacing: '0.01em',
                background: C.red, color: 'var(--yd-on-gold)', cursor: 'pointer',
                transition: 'filter 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M7 1v3M7 10v3M1 7h3M10 7h3"/>
                <path d="M3.2 3.2l2.1 2.1M8.7 8.7l2.1 2.1M3.2 10.8l2.1-2.1M8.7 5.3l2.1-2.1"/>
              </svg>
              Generate AI ideas · 1 analysis
            </button>
          )}
        </div>
      )}

      {/* Refresh confirmation modal, warns about the 1-credit cost and
          what the generation considers (niche + competitors + recent data)
          so the user knows what they're paying for. */}
      {confirmOpen && (
        <RefreshConfirmModal
          credits={credits}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => { setConfirmOpen(false); handleRefresh() }}
        />
      )}

      {/* Ideas list */}
      {!loading && !refreshing && ideas.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {/* Clear completed bar, green tint strip, matches other tinted banners */}
          {doneCount > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 14px', marginBottom: 10,
              background: C.greenBg, border: `1px solid ${C.greenBdr}`,
              borderRadius: 10,
            }}>
              <span style={{ fontSize: 12.5, color: C.greenHi, fontWeight: 600 }}>
                {doneCount} idea{doneCount > 1 ? 's' : ''} completed
              </span>
              <button
                onClick={clearCompleted}
                style={{
                  fontSize: 12.5, fontWeight: 600, color: C.greenHi,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', padding: '2px 0',
                }}
              >
                Clear completed
              </button>
            </div>
          )}

          {ideas.map(idea => (
            <IdeaCard
              key={`${idea.rank}-${idea.title}`}
              idea={idea}
              done={done.has(idea.title)}
              onDone={toggleDone}
              onUseSeo={handleUseSeo}
            />
          ))}
        </div>
      )}

      <CreditsEmptyModal
        open={creditsOut}
        onClose={() => setCreditsOut(false)}
        featureName="video idea refreshes"
      />
    </div>
  )
}
