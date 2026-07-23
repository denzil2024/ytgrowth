/* OutlierCards, shared building blocks for surfacing outlier results.

   Lives here because TWO pages render these cards:
     1. The paid Outliers page (the full grid + tabs + reports history).
     2. The home dashboard's Niche Outlier hero (a compact 3-up grid that
        shows the strongest signal from the user's most recent Outliers run).

   The card visuals are the same on both surfaces, so this module owns the
   single source of truth. If you tweak a card here, both surfaces update.

   Exports:
     - VideoResultCard(item, kind, onOpen)
         Used for the Videos AND Thumbnails tabs (kind controls the CTA copy).
     - ChannelResultCard(item, onOpen)
         Channel-identity layout (banner + avatar + description). Used for the
         Channels tab.

   Plus the helper functions and styles each card depends on. Page-level
   styles unique to the Outliers page (tabs, sort buttons, etc.) stay in
   Outliers.jsx.
*/

import { useState } from 'react'
import EstimateTag from './EstimateTag'

/* YouTube titles arrive HTML-escaped (&amp;, &#39;, &quot;…). Decode so they
   render as real characters instead of literal entity text. */
function decodeEntities(s) {
  if (!s || typeof s !== 'string') return s || ''
  return s
    .replace(/&amp;/g, '&').replace(/&#38;/g, '&')
    .replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}


/* ─── Scoped styles ──────────────────────────────────────────────────────────
   Injected once per browser session under the 'outlier-cards-styles' id.
   The Outliers page also injects an 'outliers-styles' tag for its page-level
   styles; the two tag IDs intentionally differ so home-only loads don't pull
   in everything from Outliers.jsx. */
if (typeof document !== 'undefined' && !document.getElementById('outlier-cards-styles')) {
  const s = document.createElement('style')
  s.id = 'outlier-cards-styles'
  s.textContent = `
    @keyframes outFadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }

    .out-grid-card {
      background: var(--yd-surface);
      border: 1px solid var(--yd-line);
      border-radius: 0;
      box-shadow: none;
      transition: border-color 0.2s;
      display: flex; flex-direction: column;
      overflow: hidden;
    }
    .out-grid-card:hover {
      border-color: var(--yd-gold-line);
    }
  `
  document.head.appendChild(s)
}


/* ─── Color tokens, match Dashboard / Outliers page palette ───────────────── */
/* Dark, OutlierCards is Feed-only (NicheHeroCard); the Outliers page
   inlines its own copies. Mirrors the shipped dark surface system;
   semantic *Hi text variants for legibility on dark tinted chips. */
export const OC_C = {
  card:        'var(--yd-surface)',
  border:      'var(--yd-line)',
  borderLight: 'var(--yd-line-lo)',
  text1:       'var(--yd-ink)',
  text2:       'var(--yd-soft)',
  text3:       'var(--yd-muted)',
  red:         'var(--yd-gold)',
  redBg:       'var(--yd-gold-soft)',
  redBdr:      'var(--yd-gold-line)',
  green:       'var(--yd-green)',
  greenBg:     'var(--yd-green-soft)',
  greenBdr:    'var(--yd-green-line)',
  amber:       'var(--yd-amber)',
  amberBg:     'var(--yd-amber-soft)',
  amberBdr:    'var(--yd-amber-line)',
}


/* ─── Helpers ──────────────────────────────────────────────────────────────── */

export function fmtNum(n) {
  if (n == null) return '—'
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}

export function fmtDuration(seconds) {
  if (!seconds || seconds <= 0) return ''
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

/* YouTube serves 3 thumbnail sizes per video. We use the highest one that
   exists on a given video:
     1. maxresdefault.jpg , 1280x720. Only present if the uploader gave YouTube
                             an HD master; missing on many older or low-quality
                             uploads.
     2. hqdefault.jpg     , 480x360. ALWAYS present on every YouTube video.
     3. {stored thumbnail}, whatever the search API returned (~320x180).
   The onError handler walks this cascade in order, invisible to the user. */
export function ytMaxThumbUrl(videoId) {
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
  } else {
    target.onerror = null
  }
}
export function makeThumbOnError(videoId, fallbackUrl) {
  return (e) => _advanceThumb(e.target, videoId, fallbackUrl)
}
// YouTube returns a 120x90 grey placeholder (HTTP 200) when maxresdefault
// doesn't exist, onError never fires for it. Detect the placeholder
// dimensions in onLoad and walk the fallback cascade manually.
export function makeThumbOnLoad(videoId, fallbackUrl) {
  return (e) => {
    const step = e.target.dataset.thumbStep || 'max'
    if (step === 'max' && e.target.naturalWidth === 120 && e.target.naturalHeight === 90) {
      _advanceThumb(e.target, videoId, fallbackUrl)
    }
  }
}

export function relPublished(iso) {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  if (!then) return ''
  const d = (Date.now() - then) / 86400000
  if (d < 1) return 'today'
  if (d < 2) return 'yesterday'
  if (d < 30) return `${Math.round(d)}d ago`
  if (d < 365) return `${Math.round(d / 30)}mo ago`
  return `${Math.round(d / 365)}y ago`
}

export function outlierTier(score) {
  if (score >= 10) return { label: '10× outlier',  color: OC_C.red,   bg: OC_C.redBg,   bdr: OC_C.redBdr }
  if (score >= 5)  return { label: `${score}× outlier`, color: OC_C.red,   bg: OC_C.redBg,   bdr: OC_C.redBdr }
  if (score >= 3)  return { label: `${score}× outlier`, color: OC_C.amber, bg: OC_C.amberBg, bdr: OC_C.amberBdr }
  return           { label: `${score}× outlier`, color: OC_C.green, bg: OC_C.greenBg, bdr: OC_C.greenBdr }
}


/* ─── Video result card ──────────────────────────────────────────────────────
   Handles BOTH the Videos and Thumbnails tabs, the same card with a
   different CTA label (kind='video' -> 'See why', kind='thumbnail' ->
   'See pattern'). The visual is identical because both surface the same
   underlying outlier video.
*/
export function VideoResultCard({ item, kind, onOpen }) {
  const C             = OC_C
  const tier          = outlierTier(item.outlier_score)
  const views         = item.views || 0
  const likes         = item.likes || 0
  const subs          = item.channel_subscribers || 0
  const engPct        = views > 0 ? (likes / views * 100) : null
  const engColor      = engPct == null ? C.text3 : engPct >= 3 ? C.green : engPct >= 1 ? C.amber : C.red
  const vpsRaw        = typeof item.views_per_sub === 'number'
                          ? item.views_per_sub
                          : (subs > 0 ? views / subs : null)
  const vpsDisplay    = vpsRaw == null ? '—'
                         : vpsRaw >= 10   ? vpsRaw.toFixed(1) + '×'
                         : vpsRaw >= 1    ? vpsRaw.toFixed(2) + '×'
                         : vpsRaw.toFixed(2) + '×'
  const isShort       = item.duration_seconds > 0 && item.duration_seconds <= 60
  const durLabel      = item.duration_seconds > 0 ? fmtDuration(item.duration_seconds) : null
  const ytUrl         = item.video_id ? `https://www.youtube.com/watch?v=${item.video_id}` : null
  const ctaLabel      = kind === 'thumbnail' ? 'See pattern' : 'See why'

  return (
    <div className="out-grid-card">
      {/* Thumbnail, YouTube link */}
      <a href={ytUrl || '#'} target="_blank" rel="noopener noreferrer"
        onClick={e => { if (!ytUrl) e.preventDefault() }}
        style={{ display: 'block', position: 'relative', textDecoration: 'none', flexShrink: 0, borderRadius: '15px 15px 0 0', overflow: 'hidden' }}>
        {(item.video_id || item.thumbnail)
          ? <img
              src={item.video_id ? ytMaxThumbUrl(item.video_id) : item.thumbnail}
              alt=""
              style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
              onError={makeThumbOnError(item.video_id, item.thumbnail)}
              onLoad={makeThumbOnLoad(item.video_id, item.thumbnail)}
            />
          : <div style={{ width: '100%', aspectRatio: '16/9', background: '#e8e4dc' }}/>
        }
        {isShort && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.78)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '2px 6px', borderRadius: 4, letterSpacing: '0.06em' }}>SHORT</span>
        )}
        {durLabel && (
          <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.72)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '2px 7px', borderRadius: 5, fontVariantNumeric: 'tabular-nums' }}>{durLabel}</span>
        )}
      </a>

      {/* Body, title -> channel byline -> meta -> footer (metrics + CTA) */}
      <div style={{ padding: '20px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p style={{
          fontSize: 16, fontWeight: 600, color: C.text1, lineHeight: 1.4, marginBottom: 12, letterSpacing: '-0.3px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{decodeEntities(item.title)}</p>

        <p style={{
          fontSize: 13, fontWeight: 600, color: C.text2, marginBottom: 8, letterSpacing: '-0.1px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{decodeEntities(item.channel_name)}</p>

        <p style={{ fontSize: 14, fontWeight: 500, color: C.text3, marginBottom: 16, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ color: C.text2, fontWeight: 600 }}>{fmtNum(views)}</span> views
          <span style={{ margin: '0 8px', color: 'rgba(20,19,15,0.30)' }}>·</span>
          {relPublished(item.published_at) || '—'}
        </p>

        <div style={{ marginTop: 'auto', paddingTop: 18, borderTop: '1px solid rgba(20,19,15,0.08)' }}>
          <div style={{ display: 'flex', gap: 28, marginBottom: 18, flexWrap: 'wrap' }}>
            {[
              { label: 'Outlier', display: `${item.outlier_score}×`,                                                       color: tier.color, tip: 'How many times this video beat its niche cohort\'s median views-per-subscriber. 5×+ is breakout.' },
              { label: 'VPS',     display: vpsDisplay,                                                                     color: C.text1,    tip: 'Views per subscriber, normalises out raw channel size so small-channel wins show up.' },
              { label: 'Eng',     display: engPct != null ? `${engPct.toFixed(1)}%` : '—',                                 color: engColor,   tip: 'Engagement rate = likes ÷ views. 3%+ strong, 1–3% avg, <1% weak.' },
            ].map(m => (
              <div key={m.label} title={m.tip} style={{ cursor: 'help', textAlign: 'left' }}>
                <p style={{ fontSize: 10.5, fontWeight: 600, color: C.text3, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 7, lineHeight: 1 }}>{m.label}</p>
                <p style={{ fontSize: 17, fontWeight: 700, color: m.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.4px', lineHeight: 1 }}>{m.display}</p>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 10 }}><EstimateTag color={C.text3} /></div>
          <button
            onClick={onOpen}
            style={{
              width: '100%', justifyContent: 'center',
              padding: '11px 16px', fontSize: 14, fontWeight: 600,
              border: '1px solid var(--yd-line)', borderRadius: 0, cursor: 'pointer',
              background: 'transparent', color: 'var(--yd-soft)',
              fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              transition: 'filter 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--yd-gold)'; e.currentTarget.style.color = 'var(--yd-gold-ink)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--yd-line)'; e.currentTarget.style.color = 'var(--yd-soft)' }}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  )
}


/* ─── Channel result card ────────────────────────────────────────────────────
   Channel-identity layout (banner + avatar + handle + description) so the
   Channels tab feels distinct from the Videos / Thumbnails tabs. Same footer
   shape as VideoResultCard for cross-tab consistency.
*/
export function ChannelResultCard({ item, onOpen }) {
  const C       = OC_C
  const tier    = outlierTier(item.outlier_score)
  const hits    = item.videos_in_search || 0
  const initial = (item.channel_name || '?')[0].toUpperCase()
  const ytUrl   = item.channel_id ? `https://www.youtube.com/channel/${item.channel_id}` : null
  const handle  = (item.handle || '').replace(/^@/, '')
  const [avatarFailed, setAvatarFailed] = useState(false)

  return (
    <div className="out-grid-card">
      {/* Gradient banner, no video thumbnail; soft red→amber wash that reads
          as "channel page" instead of "video card". Small user icon top-right
          reinforces that this is a profile, not content. */}
      <a href={ytUrl || '#'} target="_blank" rel="noopener noreferrer"
        onClick={e => { if (!ytUrl) e.preventDefault() }}
        style={{
          display: 'block', position: 'relative', textDecoration: 'none',
          flexShrink: 0, borderRadius: '15px 15px 0 0', overflow: 'hidden',
          height: 72,
          background: `linear-gradient(135deg, ${C.redBg} 0%, rgba(217,119,6,0.18) 50%, ${C.amberBg} 100%)`,
        }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
          style={{ position: 'absolute', top: 12, right: 14, opacity: 0.55 }}>
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
        </svg>
      </a>

      <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Channel avatar, 72x72 circle, 4px white ring, overlaps banner. */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          overflow: 'hidden',
          border: '4px solid #e8e4dc',
          boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
          marginTop: -36, marginBottom: 12,
          flexShrink: 0, background: C.redBg,
          position: 'relative',
        }}>
          {item.thumbnail && !avatarFailed
            ? <img src={item.thumbnail} alt="" onError={() => setAvatarFailed(true)}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
            : <span style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 600, color: '#7a5b14',
              }}>{initial}</span>
          }
        </div>

        <p style={{
          fontSize: 16, fontWeight: 600, color: C.text1, lineHeight: 1.35, marginBottom: 3, letterSpacing: '-0.3px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{decodeEntities(item.channel_name)}</p>

        {handle ? (
          <p style={{
            fontSize: 13, fontWeight: 500, color: C.text3, marginBottom: 10, letterSpacing: '-0.05px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>@{handle}</p>
        ) : (
          <p style={{ fontSize: 13, color: C.text3, marginBottom: 10 }}>&nbsp;</p>
        )}

        <p style={{
          fontSize: 13, fontWeight: 500, color: C.text3, lineHeight: 1.5, marginBottom: 14,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          minHeight: 39,
        }}>{item.description || '—'}</p>

        <p style={{ fontSize: 14, fontWeight: 500, color: C.text3, marginBottom: 14, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ color: C.text2, fontWeight: 600 }}>{fmtNum(item.subscribers)}</span> subs
          <span style={{ margin: '0 8px', color: 'rgba(20,19,15,0.30)' }}>·</span>
          <span style={{ color: C.text2, fontWeight: 600 }}>{fmtNum(item.video_count)}</span> videos
        </p>

        <div style={{ marginTop: 'auto', paddingTop: 18, borderTop: '1px solid rgba(20,19,15,0.08)' }}>
          <div style={{ display: 'flex', gap: 28, marginBottom: 18, flexWrap: 'wrap' }}>
            {[
              { label: 'Outlier',   display: `${item.outlier_score}×`,           color: tier.color, tip: 'Their best-performing video in this search beat the niche median by this multiple.' },
              { label: 'Hits',      display: String(hits),                       color: C.text1,    tip: 'Number of videos from this channel that surfaced in your search, higher = more on-topic.' },
              { label: 'Avg views', display: fmtNum(item.avg_views_per_video),   color: C.text1,    tip: 'Average views per video across this channel\'s entire catalog.' },
            ].map(m => (
              <div key={m.label} title={m.tip} style={{ cursor: 'help', textAlign: 'left' }}>
                <p style={{ fontSize: 10.5, fontWeight: 600, color: C.text3, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 7, lineHeight: 1 }}>{m.label}</p>
                <p style={{ fontSize: 17, fontWeight: 700, color: m.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.4px', lineHeight: 1 }}>{m.display}</p>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 10 }}><EstimateTag color={C.text3} /></div>
          <button
            onClick={onOpen}
            style={{
              width: '100%', justifyContent: 'center',
              padding: '11px 16px', fontSize: 14, fontWeight: 600,
              border: '1px solid var(--yd-line)', borderRadius: 0, cursor: 'pointer',
              background: 'transparent', color: 'var(--yd-soft)',
              fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              transition: 'filter 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--yd-gold)'; e.currentTarget.style.color = 'var(--yd-gold-ink)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--yd-line)'; e.currentTarget.style.color = 'var(--yd-soft)' }}
          >
            Analyze channel
          </button>
        </div>
      </div>
    </div>
  )
}
