/* NicheHeroCard — "For you this week" two-card insight row.
   Mirrors the Outliers feature page card DNA: 16:9 thumbnail, eyebrow chip,
   bold title, channel byline, hairline + 3-metric footer (Outlier × / VPS / Age),
   structured "Why it worked" list, and a sibling "Title Suggestion" card.

   One backend fetch (/dashboard/niche-outlier) feeds both cards. Per-user
   angle still lazy-loads from /dashboard/personalize-angle.

   Default export NicheHeroCard intentionally renders the whole row so the
   Dashboard import surface does not change.
*/

import { useEffect, useState } from 'react'

const C = {
  card:        '#ffffff',
  border:      '#e6e6ec',
  borderSoft:  '#f0f0f4',
  text1:       '#0a0a0f',
  text2:       'rgba(10,10,15,0.62)',
  text3:       'rgba(10,10,15,0.40)',
  text4:       'rgba(10,10,15,0.30)',
  red:         '#e5302a',
  redDeep:     '#c22b25',
  redTint:     'rgba(229,48,42,0.07)',
  redBdr:      'rgba(229,48,42,0.18)',
  green:       '#059669',
  amber:       '#d97706',
  amberTint:   'rgba(217,119,6,0.08)',
  amberBdr:    'rgba(217,119,6,0.22)',
  insetBg:     '#fafafb',
  insetBdr:    'rgba(10,10,15,0.06)',
  shadowSm:    '0 1px 3px rgba(0,0,0,0.06), 0 4px 14px rgba(0,0,0,0.06)',
  shadowHover: '0 4px 14px rgba(0,0,0,0.09), 0 18px 42px rgba(0,0,0,0.10)',
}

const NICHE_LABELS = {
  gaming: 'Gaming', tech: 'Tech', beauty: 'Beauty', finance: 'Finance',
  cooking: 'Cooking', fitness: 'Fitness', music: 'Music',
  education: 'Education', vlogs: 'Vlogs', travel: 'Travel',
  comedy: 'Comedy', sports: 'Sports', entertainment: 'Entertainment',
  news: 'News',
}

function fmtViews(n) {
  if (!n && n !== 0) return ''
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}
function ageDays(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const days = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (days < 1)  return 'today'
  if (days < 7)  return `${days}d`
  if (days < 30) return `${Math.floor(days / 7)}w`
  if (days < 365) return `${Math.floor(days / 30)}mo`
  return `${Math.floor(days / 365)}y`
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


// ─── Row container (default export) ──────────────────────────────────────

export default function NicheHeroCard({ onOpenSeoStudio, channelId }) {
  const [state, setState] = useState({ loading: true, data: null })
  const [personalized, setPersonalized] = useState(null)

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

  return (
    <>
      <style>{styles}</style>
      <div className="fyw-header">
        <div>
          <span className="fyw-eyebrow">For you this week</span>
          <p className="fyw-sub">
            {state.data?.ok
              ? `Top breakout from your ${(NICHE_LABELS[state.data.niche] || state.data.niche || '').toLowerCase()} niche, refreshed weekly.`
              : 'Top breakout from your niche, refreshed weekly.'}
          </p>
        </div>
      </div>

      <div className="fyw-grid">
        {state.loading
          ? (<><CardSkeleton /><CardSkeleton secondary /></>)
          : !state.data?.ok
            ? (<><EmptyOutlier niche={state.data?.niche} reason={state.data?.reason} /><EmptyTitle /></>)
            : (
              <>
                <OutlierCard data={state.data} />
                <TitleSuggestionCard
                  data={state.data}
                  personalized={personalized}
                  onOpenSeoStudio={onOpenSeoStudio}
                />
              </>
            )}
      </div>
    </>
  )
}


// ─── Outlier card (left) ─────────────────────────────────────────────────

function OutlierCard({ data }) {
  const { niche, outlier } = data
  const nicheLabel = NICHE_LABELS[niche] || niche
  const why = Array.isArray(outlier.why_working) ? outlier.why_working : []

  return (
    <article className="fyw-card">
      <div className="fyw-card-head">
        <span className="fyw-chip fyw-chip-red">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9l3.2-3.2 2.3 2.3L11 4"/><path d="M7.5 4H11v3.5"/></svg>
          Niche outlier
        </span>
        <span className="fyw-niche-pill">{nicheLabel}</span>
      </div>

      <a
        className="fyw-thumb"
        href={`https://www.youtube.com/watch?v=${outlier.video_id}`}
        target="_blank" rel="noopener noreferrer"
        aria-label="Watch on YouTube"
      >
        {outlier.thumbnail_url
          ? <img src={outlier.thumbnail_url} alt="" loading="lazy" />
          : <div className="fyw-thumb-fallback" />}
        <span className="fyw-thumb-overlay">
          <span className="fyw-play">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><polygon points="4,2.5 11.5,7 4,11.5"/></svg>
          </span>
          Watch on YouTube
        </span>
      </a>

      <h3 className="fyw-title">{outlier.title}</h3>
      <p className="fyw-byline">
        <span className="fyw-byline-ch">{outlier.channel_title}</span>
        <span className="fyw-dot">·</span>
        <span>{ageDays(outlier.published_at)} ago</span>
      </p>

      <div className="fyw-metrics">
        <div className="fyw-metric">
          <p className="fyw-metric-val fyw-metric-val--accent">{outlier.sub_ratio}×</p>
          <p className="fyw-metric-lbl">Outlier</p>
        </div>
        <div className="fyw-metric">
          <p className="fyw-metric-val">{fmtViews(outlier.view_count)}</p>
          <p className="fyw-metric-lbl">Views</p>
        </div>
        <div className="fyw-metric">
          <p className="fyw-metric-val">{outlier.outlier_score}</p>
          <p className="fyw-metric-lbl">Score</p>
        </div>
      </div>

      {why.length > 0 && (
        <>
          <p className="fyw-section-eyebrow">Why it worked</p>
          <ul className="fyw-why">
            {why.slice(0, 3).map((reason, i) => (
              <li key={i}>
                <span className="fyw-why-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="fyw-why-text">{reason}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  )
}


// ─── Title suggestion card (right) ───────────────────────────────────────

function TitleSuggestionCard({ data, personalized, onOpenSeoStudio }) {
  const { outlier } = data
  const angle          = personalized?.angle           || outlier.angle_template || ''
  const angleReasoning = personalized?.angle_reasoning || outlier.angle_reasoning || ''
  const angleKeyword   = personalized?.keyword         || outlier.angle_keyword || ''
  const isPersonal     = !!personalized?.personalized

  return (
    <article className="fyw-card">
      <div className="fyw-card-head">
        <span className="fyw-chip fyw-chip-red">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V7M5 9V5M8 9V3M11 9V1"/></svg>
          Title suggestion
        </span>
        {isPersonal && (
          <span className="fyw-niche-pill">
            <svg width="9" height="9" viewBox="0 0 12 12" fill="currentColor" style={{ marginRight: 4 }}><path d="M6 1l1.4 3.4 3.6.3-2.8 2.4.9 3.5L6 8.6 2.9 10.6l.9-3.5L1 4.7l3.6-.3z"/></svg>
            Personalized
          </span>
        )}
      </div>

      <div className="fyw-angle-frame">
        <p className="fyw-angle-mini-lbl">Suggested title for your channel</p>
        <p className="fyw-angle-title">{angle || 'Generating your tailored title…'}</p>
      </div>

      {angleReasoning && (
        <>
          <p className="fyw-section-eyebrow">Why this works for you</p>
          <p className="fyw-angle-reason">{angleReasoning}</p>
        </>
      )}

      {angleKeyword && (
        <div className="fyw-kw-row">
          <span className="fyw-kw-lbl">Target keyword</span>
          <span className="fyw-kw-val">{angleKeyword}</span>
        </div>
      )}

      <div className="fyw-spacer" />

      <button
        type="button"
        className="fyw-cta"
        disabled={!angle}
        onClick={() => onOpenSeoStudio?.(angle, angleKeyword)}
      >
        Open in Title &amp; Description
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </article>
  )
}


// ─── Empty / Skeleton states ─────────────────────────────────────────────

function CardSkeleton({ secondary }) {
  return (
    <article className="fyw-card fyw-card-skeleton">
      <div className="fyw-card-head">
        <span className="fyw-sk" style={{ width: 110, height: 22, borderRadius: 100 }} />
      </div>
      {!secondary && <div className="fyw-sk" style={{ width: '100%', aspectRatio: '16/9', borderRadius: 10, marginBottom: 14 }} />}
      <div className="fyw-sk" style={{ width: '92%', height: 18, marginBottom: 10 }} />
      <div className="fyw-sk" style={{ width: '70%', height: 12, marginBottom: 18 }} />
      <div className="fyw-sk" style={{ width: '100%', height: 60, marginBottom: 16, borderRadius: 10 }} />
      <div className="fyw-sk" style={{ width: '95%', height: 12, marginBottom: 8 }} />
      <div className="fyw-sk" style={{ width: '80%', height: 12 }} />
    </article>
  )
}

function EmptyOutlier({ niche, reason }) {
  const label = NICHE_LABELS[niche] || niche || 'your niche'
  const isGenerating = reason === 'generating_now' || reason === 'no_cache_yet'
  return (
    <article className="fyw-card fyw-card-empty">
      <div className="fyw-card-head">
        <span className="fyw-chip fyw-chip-red">Niche outlier</span>
      </div>
      <div className="fyw-empty-body">
        <div className="fyw-spin" />
        <p className="fyw-empty-title">
          {isGenerating ? `Finding the top ${label.toLowerCase()} outlier…` : 'Niche outlier coming soon'}
        </p>
        <p className="fyw-empty-sub">
          {isGenerating
            ? 'Usually takes 15 to 30 seconds. The card refreshes here automatically.'
            : 'Try refreshing the page. If this keeps happening, email support@ytgrowth.io.'}
        </p>
      </div>
    </article>
  )
}

function EmptyTitle() {
  return (
    <article className="fyw-card fyw-card-empty">
      <div className="fyw-card-head">
        <span className="fyw-chip fyw-chip-red">Title suggestion</span>
      </div>
      <div className="fyw-empty-body">
        <div className="fyw-spin" />
        <p className="fyw-empty-title">Tailoring a title for your channel…</p>
        <p className="fyw-empty-sub">Appears the moment the outlier on the left is ready.</p>
      </div>
    </article>
  )
}


// ─── Styles ──────────────────────────────────────────────────────────────

const styles = `
.fyw-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 16px; margin: 4px 0 14px 0;
}
.fyw-eyebrow {
  display: inline-block;
  font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; color: ${C.text2};
  background: ${C.redTint}; padding: 5px 12px;
  border-radius: 100px; color: ${C.redDeep};
  margin-bottom: 8px;
}
.fyw-sub {
  font-size: 13px; color: ${C.text2}; line-height: 1.55;
  letter-spacing: -0.05px; margin: 0;
}

.fyw-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 16px; margin-bottom: 16px;
}
@media (max-width: 980px) {
  .fyw-grid { grid-template-columns: 1fr; }
}

.fyw-card {
  background: ${C.card};
  border: 1px solid ${C.border};
  border-radius: 16px;
  box-shadow: ${C.shadowSm};
  padding: 18px 20px 18px;
  display: flex; flex-direction: column;
  transition: box-shadow 0.18s, transform 0.18s;
  font-family: 'Inter', system-ui, sans-serif;
}
.fyw-card:hover { box-shadow: ${C.shadowHover}; transform: translateY(-1px); }

.fyw-card-head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; margin-bottom: 14px;
}
.fyw-chip {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 10.5px; font-weight: 800; letter-spacing: 0.08em;
  text-transform: uppercase; padding: 5px 10px;
  border-radius: 100px;
}
.fyw-chip-red { color: ${C.redDeep}; background: ${C.redTint}; border: 1px solid ${C.redBdr}; }
.fyw-niche-pill {
  display: inline-flex; align-items: center;
  font-size: 11px; font-weight: 700; color: ${C.text2};
  background: ${C.insetBg}; border: 1px solid ${C.insetBdr};
  padding: 4px 10px; border-radius: 100px;
  letter-spacing: -0.1px;
}

.fyw-thumb {
  position: relative; display: block;
  width: 100%; aspect-ratio: 16 / 9;
  border-radius: 10px; overflow: hidden;
  background: #eaeaef;
  margin-bottom: 12px;
  text-decoration: none;
}
.fyw-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.fyw-thumb-fallback { width: 100%; height: 100%; background: #eaeaef; }
.fyw-thumb-overlay {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 8px;
  font-size: 12px; font-weight: 700; color: #fff;
  letter-spacing: -0.1px;
  background: rgba(0,0,0,0); opacity: 0;
  transition: opacity 0.18s, background 0.18s;
}
.fyw-thumb-overlay .fyw-play {
  width: 36px; height: 36px; border-radius: 50%;
  background: ${C.red}; display: inline-flex;
  align-items: center; justify-content: center;
  box-shadow: 0 3px 10px rgba(229,48,42,0.5);
  padding-left: 3px;
}
.fyw-thumb:hover .fyw-thumb-overlay {
  opacity: 1; background: rgba(0,0,0,0.32);
}

.fyw-title {
  font-size: 16px; font-weight: 700; color: ${C.text1};
  letter-spacing: -0.25px; line-height: 1.35;
  margin: 0 0 4px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.fyw-byline {
  font-size: 12px; color: ${C.text3}; line-height: 1.5;
  margin: 0 0 14px 0;
  display: flex; flex-wrap: wrap; gap: 0 4px;
}
.fyw-byline-ch { color: ${C.text2}; font-weight: 600; }
.fyw-dot { color: ${C.text4}; margin: 0 2px; }

.fyw-metrics {
  display: grid; grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid ${C.borderSoft};
  border-bottom: 1px solid ${C.borderSoft};
  padding: 12px 0;
  margin-bottom: 16px;
}
.fyw-metric { text-align: center; }
.fyw-metric + .fyw-metric { border-left: 1px solid ${C.borderSoft}; }
.fyw-metric-val {
  font-size: 20px; font-weight: 800; color: ${C.text1};
  letter-spacing: -0.6px; line-height: 1;
  font-variant-numeric: tabular-nums;
  margin: 0 0 6px 0;
}
.fyw-metric-val--accent { color: ${C.red}; }
.fyw-metric-lbl {
  font-size: 9.5px; font-weight: 800; letter-spacing: 0.1em;
  text-transform: uppercase; color: ${C.text3};
  margin: 0;
}

.fyw-section-eyebrow {
  font-size: 10px; font-weight: 800; letter-spacing: 0.08em;
  text-transform: uppercase; color: ${C.text3};
  margin: 0 0 10px 0;
}

.fyw-why { list-style: none; padding: 0; margin: 0; }
.fyw-why li {
  display: flex; gap: 10px; align-items: flex-start;
  margin-bottom: 8px;
  font-size: 13px; color: ${C.text2}; line-height: 1.6;
}
.fyw-why li:last-child { margin-bottom: 0; }
.fyw-why-n {
  font-size: 10px; font-weight: 800; color: ${C.green};
  letter-spacing: 0.05em;
  flex-shrink: 0; margin-top: 3px;
  font-variant-numeric: tabular-nums;
}
.fyw-why-text { flex: 1; }

/* Title suggestion */
.fyw-angle-frame {
  background: ${C.insetBg};
  border: 1px solid ${C.insetBdr};
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 14px;
}
.fyw-angle-mini-lbl {
  font-size: 9.5px; font-weight: 800; letter-spacing: 0.1em;
  text-transform: uppercase; color: ${C.text3};
  margin: 0 0 8px 0;
}
.fyw-angle-title {
  font-size: 16px; font-weight: 700; color: ${C.text1};
  letter-spacing: -0.2px; line-height: 1.4;
  margin: 0;
}
.fyw-angle-reason {
  font-size: 13px; color: ${C.text2}; line-height: 1.65;
  margin: 0 0 14px 0;
}
.fyw-kw-row {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px;
  background: ${C.amberTint};
  border: 1px solid ${C.amberBdr};
  border-radius: 10px;
  margin-bottom: 14px;
}
.fyw-kw-lbl {
  font-size: 10px; font-weight: 800; color: ${C.amber};
  letter-spacing: 0.08em; text-transform: uppercase;
}
.fyw-kw-val {
  font-size: 12.5px; font-weight: 700; color: ${C.text1};
  letter-spacing: -0.1px;
}

.fyw-spacer { flex: 1; min-height: 4px; }

.fyw-cta {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%;
  background: ${C.red};
  color: #ffffff;
  border: none;
  padding: 12px 18px;
  border-radius: 100px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 13.5px; font-weight: 700;
  letter-spacing: -0.1px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.10), 0 4px 14px rgba(229,48,42,0.28);
  transition: filter 0.15s, transform 0.15s, box-shadow 0.15s;
}
.fyw-cta:hover:not(:disabled) {
  filter: brightness(1.07); transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0,0,0,0.13), 0 10px 28px rgba(229,48,42,0.34);
}
.fyw-cta:disabled { opacity: 0.55; cursor: progress; }

/* Empty + skeleton */
.fyw-card-empty .fyw-empty-body {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 22px 4px 8px;
  gap: 10px;
}
.fyw-spin {
  width: 30px; height: 30px; border-radius: 50%;
  border: 2.5px solid ${C.border};
  border-top-color: ${C.red};
  animation: fywSpin 0.8s linear infinite;
}
@keyframes fywSpin { to { transform: rotate(360deg) } }
.fyw-empty-title {
  font-size: 14px; font-weight: 700; color: ${C.text1};
  line-height: 1.4; margin: 0;
}
.fyw-empty-sub {
  font-size: 12.5px; color: ${C.text3}; line-height: 1.55;
  max-width: 260px; margin: 0;
}

.fyw-card-skeleton { min-height: 380px; }
.fyw-sk {
  background: linear-gradient(90deg, #f4f4f6 0%, #ececef 50%, #f4f4f6 100%);
  background-size: 400px 100%;
  animation: fywShimmer 1.4s linear infinite;
  border-radius: 6px;
  display: block;
}
@keyframes fywShimmer { 0% { background-position: -200px 0 } 100% { background-position: 400px 0 } }
`
