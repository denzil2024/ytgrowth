/* NicheHeroCard — a single insight card in the dashboard feed.
   VidIQ-style restraint: one focused action, compact thumbnail, clean
   typography, no decoration beyond the existing .ytg-card aesthetic.

   The card surfaces THIS WEEK'S outlier in the creator's niche with a
   short "why" rationale and a tailored title angle they can ship.
   Primary action: open in SEO Studio prefilled.

   Data shape from /dashboard/niche-outlier:
     { ok, niche, creator, outlier: { ... }  }
   Personalized angle from /dashboard/personalize-angle:
     { angle, angle_reasoning, keyword, personalized }
*/

import { useEffect, useState } from 'react'

const C = {
  card: '#ffffff',
  border: '#e6e6ec',
  borderSoft: '#f0f0f4',
  text1: '#0f0f13',
  text2: '#4a4a58',
  text3: '#9595a4',
  text4: '#b8b8c8',
  red: '#e5251b',
  redDeep: '#a50f07',
  green: '#059669',
  amber: '#d97706',
  insetBg: '#fafafb',
}

const NICHE_LABELS = {
  gaming: 'Gaming', tech: 'Tech', beauty: 'Beauty', finance: 'Finance',
  cooking: 'Cooking', fitness: 'Fitness', music: 'Music',
  education: 'Education', vlogs: 'Vlogs', travel: 'Travel',
  comedy: 'Comedy', sports: 'Sports', entertainment: 'Entertainment',
  news: 'News',
}

function formatViews(n) {
  if (!n && n !== 0) return ''
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}

function relTime(iso) {
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
  if (day < 7)  return `${day}d ago`
  if (day < 30) return `${Math.floor(day / 7)}w ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const PERSONALIZE_TTL_MS = 7 * 24 * 60 * 60 * 1000
function loadPersonalized(niche, channelId) {
  try {
    const raw = localStorage.getItem(`nh_personalized_v3:${niche}:${channelId}`)
    if (!raw) return null
    const obj = JSON.parse(raw)
    if (!obj || !obj.ts || Date.now() - obj.ts > PERSONALIZE_TTL_MS) return null
    return obj
  } catch { return null }
}
function savePersonalized(niche, channelId, data) {
  try {
    localStorage.setItem(
      `nh_personalized_v3:${niche}:${channelId}`,
      JSON.stringify({ ...data, ts: Date.now() }),
    )
  } catch {}
}

export default function NicheHeroCard({ onOpenSeoStudio, channelId }) {
  const [state, setState] = useState({ loading: true, data: null })
  const [personalized, setPersonalized] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let cancelled = false
    let pollCount = 0
    const MAX_POLLS = 18

    async function fetchOnce() {
      try {
        const r = await fetch('/dashboard/niche-outlier', { credentials: 'include' })
        if (!r.ok) throw new Error('fetch_failed')
        const d = await r.json()
        if (cancelled) return
        setState({ loading: false, data: d })
        if (!d.ok && d.reason === 'generating_now' && pollCount < MAX_POLLS) {
          pollCount += 1
          setTimeout(fetchOnce, 5000)
        }
      } catch {
        if (!cancelled) setState({ loading: false, data: null })
      }
    }
    fetchOnce()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!state.data?.ok) return
    const niche = state.data.niche
    if (!niche) return
    const cached = loadPersonalized(niche, channelId || 'unknown')
    if (cached) { setPersonalized(cached); return }
    let cancelled = false
    fetch('/dashboard/personalize-angle', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (cancelled || !d?.ok) return
        const next = {
          angle:           d.angle || '',
          angle_reasoning: d.angle_reasoning || '',
          keyword:         d.keyword || '',
          personalized:    !!d.personalized,
        }
        setPersonalized(next)
        savePersonalized(niche, channelId || 'unknown', next)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [state.data?.ok, state.data?.niche, channelId])

  if (dismissed) return null
  if (state.loading) return <Skeleton />
  if (!state.data?.ok) return <Empty niche={state.data?.niche} reason={state.data?.reason} />

  const { niche, outlier } = state.data
  const nicheLabel = NICHE_LABELS[niche] || niche
  const why = Array.isArray(outlier.why_working) ? outlier.why_working : []
  const angle          = personalized?.angle           || outlier.angle_template
  const angleReasoning = personalized?.angle_reasoning || outlier.angle_reasoning || ''
  const angleKeyword   = personalized?.keyword         || outlier.angle_keyword

  return (
    <div className="ni-card">
      <style>{styles}</style>

      <div className="ni-top">
        <span className="ni-eyebrow">
          Niche outlier <span className="ni-sep">·</span> {nicheLabel}
        </span>
        <button className="ni-x" aria-label="Dismiss" onClick={() => setDismissed(true)}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="2.5" y1="2.5" x2="9.5" y2="9.5"/>
            <line x1="9.5" y1="2.5" x2="2.5" y2="9.5"/>
          </svg>
        </button>
      </div>

      <div className="ni-body">
        <a
          className="ni-thumb"
          href={`https://www.youtube.com/watch?v=${outlier.video_id}`}
          target="_blank" rel="noopener noreferrer"
          aria-label="Watch on YouTube"
        >
          {outlier.thumbnail_url
            ? <img src={outlier.thumbnail_url} alt="" loading="lazy" />
            : <div className="ni-thumb-fallback" />}
          <span className="ni-thumb-hover">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><polygon points="3,2 10,6 3,10"/></svg>
            Watch
          </span>
        </a>

        <div className="ni-meta">
          <p className="ni-vid-title">{outlier.title}</p>
          <p className="ni-vid-meta">
            <span className="ni-ch">{outlier.channel_title}</span>
            <span className="ni-dot-sep">·</span>
            <span>{formatViews(outlier.view_count)} views</span>
            <span className="ni-dot-sep">·</span>
            <span>{outlier.sub_ratio}x sub ratio</span>
            <span className="ni-dot-sep">·</span>
            <span>{relTime(outlier.published_at)}</span>
          </p>
        </div>

        <div className="ni-score">
          <span className="ni-score-num">{outlier.outlier_score}</span>
          <span className="ni-score-label">Outlier</span>
        </div>
      </div>

      {why.length > 0 && (
        <ul className="ni-why">
          {why.slice(0, 3).map((reason, i) => (
            <li key={i}>{reason}</li>
          ))}
        </ul>
      )}

      <div className="ni-angle">
        <p className="ni-angle-label">Suggested angle for your channel</p>
        <p className="ni-angle-title">{angle}</p>
        {angleReasoning && <p className="ni-angle-reason">{angleReasoning}</p>}
        <div className="ni-angle-row">
          {angleKeyword
            ? <span className="ni-kw">Target: <strong>{angleKeyword}</strong></span>
            : <span />}
          <button
            type="button"
            className="ni-cta"
            onClick={() => onOpenSeoStudio?.(angle, angleKeyword)}
          >
            Open in SEO Studio
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}


// ─── Empty / Skeleton states — same restrained shell ────────────────────────

function Skeleton() {
  return (
    <div className="ni-card ni-shell">
      <style>{styles}</style>
      <div className="ni-top">
        <span className="ni-sk" style={{ width: 140, height: 11 }} />
      </div>
      <div className="ni-body">
        <div className="ni-sk" style={{ width: 160, height: 90, borderRadius: 10, flexShrink: 0 }} />
        <div className="ni-meta">
          <div className="ni-sk" style={{ width: '88%', height: 16, marginBottom: 8 }} />
          <div className="ni-sk" style={{ width: '60%', height: 12 }} />
        </div>
      </div>
      <div className="ni-sk" style={{ width: '100%', height: 12, marginTop: 16 }} />
      <div className="ni-sk" style={{ width: '92%', height: 12, marginTop: 8 }} />
      <div className="ni-sk" style={{ width: '78%', height: 12, marginTop: 8 }} />
    </div>
  )
}

function Empty({ niche, reason }) {
  const label = NICHE_LABELS[niche] || niche || 'your niche'
  const isGenerating = reason === 'generating_now' || reason === 'no_cache_yet'
  return (
    <div className="ni-card ni-shell">
      <style>{styles}</style>
      <div className="ni-top">
        <span className="ni-eyebrow">Niche outlier <span className="ni-sep">·</span> {label}</span>
      </div>
      <div className="ni-empty-row">
        <div className="ni-spin" />
        <div>
          <p className="ni-empty-title">
            {isGenerating ? `Finding the top ${label.toLowerCase()} outlier of the week.` : 'Niche outlier coming soon.'}
          </p>
          <p className="ni-empty-sub">
            {isGenerating
              ? 'Usually takes 15 to 30 seconds. The card refreshes here automatically.'
              : 'Try refreshing the page. If this keeps happening, email support@ytgrowth.io.'}
          </p>
        </div>
      </div>
    </div>
  )
}


// ─── Styles ────────────────────────────────────────────────────────────────
// Restraint by default. Matches the existing .ytg-card aesthetic exactly:
// white background, 1px #e6e6ec border, 16px radius, subtle two-layer shadow.
// Red is reserved for the primary CTA only.

const styles = `
.ni-card {
  background: ${C.card};
  border: 1px solid ${C.border};
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06);
  padding: 20px 24px 22px;
  margin-bottom: 14px;
  font-family: 'Inter', system-ui, sans-serif;
  transition: box-shadow 0.2s, transform 0.2s;
}
.ni-card.ni-shell { padding: 22px 24px; }
.ni-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.09); }

.ni-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.ni-eyebrow {
  font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; color: ${C.text3};
}
.ni-eyebrow .ni-sep { color: ${C.text4}; margin: 0 4px; }
.ni-x {
  width: 24px; height: 24px; border-radius: 6px;
  border: none; background: transparent;
  color: ${C.text3}; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.ni-x:hover { background: #f4f4f6; color: ${C.text1}; }

.ni-body {
  display: flex; align-items: flex-start; gap: 16px;
  margin-bottom: 16px;
}
.ni-thumb {
  position: relative;
  width: 160px; height: 90px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f0f0f4;
  display: block;
  text-decoration: none;
}
.ni-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ni-thumb-fallback { width: 100%; height: 100%; background: #eaeaef; }
.ni-thumb-hover {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0); opacity: 0;
  color: ${C.text1}; font-size: 12px; font-weight: 700;
  gap: 6px;
  transition: opacity 0.15s, background 0.15s;
}
.ni-thumb-hover::before {
  content: ''; position: absolute; inset: 0;
  background: rgba(0,0,0,0.28);
  z-index: -1;
}
.ni-thumb-hover {
  background: transparent;
}
.ni-thumb:hover .ni-thumb-hover {
  opacity: 1;
  background: rgba(0,0,0,0.32);
  color: #ffffff;
}

.ni-meta { flex: 1; min-width: 0; }
.ni-vid-title {
  font-size: 16px; font-weight: 700; color: ${C.text1};
  letter-spacing: -0.2px; line-height: 1.4;
  margin: 0 0 6px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ni-vid-meta {
  font-size: 12.5px; color: ${C.text3}; font-weight: 500;
  display: flex; flex-wrap: wrap; gap: 0 6px;
  line-height: 1.5;
  margin: 0;
}
.ni-vid-meta .ni-ch { color: ${C.text2}; font-weight: 600; }
.ni-vid-meta .ni-dot-sep { color: ${C.text4}; }

.ni-score {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  flex-shrink: 0;
  padding: 8px 12px 6px;
  border-left: 1px solid ${C.borderSoft};
  margin-left: 4px;
}
.ni-score-num {
  font-size: 22px; font-weight: 800; color: ${C.text1};
  letter-spacing: -0.4px; line-height: 1; font-variant-numeric: tabular-nums;
}
.ni-score-label {
  font-size: 9.5px; font-weight: 700; letter-spacing: 0.1em;
  color: ${C.text3}; text-transform: uppercase;
  margin-top: 4px;
}

.ni-why {
  list-style: none; padding: 0; margin: 0 0 16px 0;
  border-top: 1px solid ${C.borderSoft};
  padding-top: 16px;
}
.ni-why li {
  position: relative;
  padding-left: 14px;
  font-size: 13.5px; color: ${C.text2}; line-height: 1.6;
  margin-bottom: 6px;
}
.ni-why li:last-child { margin-bottom: 0; }
.ni-why li::before {
  content: ''; position: absolute;
  left: 0; top: 9px;
  width: 4px; height: 4px; border-radius: 50%;
  background: ${C.text4};
}

.ni-angle {
  background: ${C.insetBg};
  border: 1px solid ${C.borderSoft};
  border-radius: 12px;
  padding: 14px 16px 12px;
}
.ni-angle-label {
  font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; color: ${C.text3};
  margin: 0 0 8px 0;
}
.ni-angle-title {
  font-size: 15px; font-weight: 700; color: ${C.text1};
  letter-spacing: -0.15px; line-height: 1.45;
  margin: 0 0 6px 0;
}
.ni-angle-reason {
  font-size: 12.5px; color: ${C.text3}; line-height: 1.55;
  margin: 0 0 12px 0;
}
.ni-angle-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
}
.ni-kw {
  font-size: 12px; color: ${C.text3}; font-weight: 500;
}
.ni-kw strong { color: ${C.text1}; font-weight: 700; }
.ni-cta {
  display: inline-flex; align-items: center; gap: 7px;
  background: ${C.red};
  color: #ffffff;
  border: none;
  padding: 9px 16px;
  border-radius: 100px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 12.5px; font-weight: 700;
  letter-spacing: -0.1px;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
}
.ni-cta:hover { background: ${C.redDeep}; transform: translateY(-1px); }

/* Empty state */
.ni-empty-row { display: flex; align-items: center; gap: 14px; }
.ni-spin {
  width: 28px; height: 28px; border-radius: 50%;
  border: 2.5px solid ${C.border};
  border-top-color: ${C.red};
  animation: niSpin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes niSpin { to { transform: rotate(360deg) } }
.ni-empty-title {
  font-size: 14px; font-weight: 700; color: ${C.text1};
  margin: 0 0 4px 0; line-height: 1.4;
}
.ni-empty-sub {
  font-size: 12.5px; color: ${C.text3}; line-height: 1.55;
  margin: 0;
}

/* Skeleton */
.ni-sk {
  background: linear-gradient(90deg, #f4f4f6 0%, #ececef 50%, #f4f4f6 100%);
  background-size: 400px 100%;
  animation: niShimmer 1.4s linear infinite;
  border-radius: 6px;
  display: block;
}
@keyframes niShimmer { 0% { background-position: -200px 0 } 100% { background-position: 400px 0 } }

@media (max-width: 640px) {
  .ni-card { padding: 18px 18px 20px; }
  .ni-body { flex-direction: column; gap: 12px; }
  .ni-thumb { width: 100%; height: auto; aspect-ratio: 16 / 9; }
  .ni-score { flex-direction: row; gap: 8px; border-left: none; border-top: 1px solid ${C.borderSoft}; margin: 0; padding: 10px 0 0; }
}
`
