/* NicheHeroCard — Home feed insights, VidIQ-style vertical sections.

   Each insight is its own labelled section with a dot + title + age header
   and a content card below. Stacks vertically, full-width within the
   content column, no side-by-side void.

   One backend fetch (/dashboard/niche-outlier) feeds two sections:
     1. Niche Outlier        — the breakout reference
     2. Title Suggestion     — the tailored angle action

   Default export NicheHeroCard intentionally renders both sections so the
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
  red:         '#e5251b',
  redDeep:     '#a50f07',
  redTint:     'rgba(229,37,27,0.07)',
  redBdr:      'rgba(229,37,27,0.18)',
  green:       '#059669',
  greenTint:   'rgba(5,150,105,0.07)',
  greenBdr:    'rgba(5,150,105,0.18)',
  amber:       '#d97706',
  amberBg:     '#fffbeb',
  amberBdr:    '#fde68a',
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
function relAge(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const sec = Math.floor((Date.now() - d.getTime()) / 1000)
  if (sec < 60)    return 'just now'
  const min = Math.floor(sec / 60); if (min < 60)  return `${min}m ago`
  const hr  = Math.floor(min / 60); if (hr  < 24)  return `${hr}h ago`
  const day = Math.floor(hr / 24);  if (day < 7)   return `${day}d ago`
  if (day < 30)  return `${Math.floor(day / 7)}w ago`
  if (day < 365) return `${Math.floor(day / 30)}mo ago`
  return `${Math.floor(day / 365)}y ago`
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


// ─── Section header ──────────────────────────────────────────────────────

function SectionHeader({ dotColor, title, age, onDismiss }) {
  return (
    <div className="nh-section-head">
      <span className="nh-section-title">
        <span className="nh-dot" style={{ background: dotColor }} />
        {title}
      </span>
      {age && <span className="nh-section-age">· {age}</span>}
      <div className="nh-section-spacer" />
      {onDismiss && (
        <button className="nh-x" aria-label="Dismiss" onClick={onDismiss}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="2.5" y1="2.5" x2="9.5" y2="9.5"/>
            <line x1="9.5" y1="2.5" x2="2.5" y2="9.5"/>
          </svg>
        </button>
      )}
    </div>
  )
}


// ─── Default export: vertical insight feed ───────────────────────────────

export default function NicheHeroCard({ onOpenSeoStudio, onNavigate, channelId }) {
  const [state, setState] = useState({ loading: true, data: null })
  const [personalized, setPersonalized] = useState(null)
  const [dismissed, setDismissed] = useState({ outlier: false, title: false })

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

  if (state.loading) {
    return (
      <>
        <style>{styles}</style>
        <SectionSkeleton title="Niche Outlier" />
      </>
    )
  }

  if (!state.data?.ok) {
    return (
      <>
        <style>{styles}</style>
        <EmptyOutlier
          niche={state.data?.niche}
          reason={state.data?.reason}
          onNavigate={onNavigate}
        />
      </>
    )
  }

  const refreshedAge = relAge(state.data.outlier.refreshed_at) || 'this week'
  const headerTitle = state.data.niche
    ? `Niche Outlier · ${NICHE_LABELS[state.data.niche] || state.data.niche}`
    : 'Niche Outlier'

  // Title Suggestion only renders when an angle exists. The outliers-cache
  // source (the strongest path) doesn't ship an angle today; we'll add
  // Haiku-derived angles for that path in a follow-up commit.
  const hasAngle = !!(
    (personalized && personalized.angle) ||
    state.data.outlier?.angle_template
  )

  return (
    <>
      <style>{styles}</style>

      {!dismissed.outlier && (
        <section className="nh-section">
          <SectionHeader
            dotColor={C.red}
            title={headerTitle}
            age={refreshedAge}
            onDismiss={() => setDismissed(p => ({ ...p, outlier: true }))}
          />
          <OutlierCard data={state.data} onNavigate={onNavigate} />
        </section>
      )}

      {hasAngle && !dismissed.title && (
        <section className="nh-section">
          <SectionHeader
            dotColor={C.green}
            title="Title Suggestion"
            age={personalized?.personalized ? 'personalized for your channel' : refreshedAge}
            onDismiss={() => setDismissed(p => ({ ...p, title: true }))}
          />
          <TitleCard data={state.data} personalized={personalized} onOpenSeoStudio={onOpenSeoStudio} />
        </section>
      )}
    </>
  )
}


// ─── Niche outlier card ──────────────────────────────────────────────────

function OutlierCard({ data, onNavigate }) {
  const { outlier } = data
  const why = Array.isArray(outlier.why_working) ? outlier.why_working : []
  const nicheLabel = NICHE_LABELS[data.niche] || data.niche || 'your niche'

  return (
    <article className="nh-card">
      <div className="nh-outlier-top">
        <a
          className="nh-thumb"
          href={`https://www.youtube.com/watch?v=${outlier.video_id}`}
          target="_blank" rel="noopener noreferrer"
          aria-label="Watch on YouTube"
        >
          {outlier.thumbnail_url
            ? <img src={outlier.thumbnail_url} alt="" loading="lazy" />
            : <div className="nh-thumb-fallback" />}
          <span className="nh-thumb-overlay">
            <span className="nh-play">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><polygon points="4,2.5 11.5,7 4,11.5"/></svg>
            </span>
          </span>
        </a>

        <div className="nh-outlier-info">
          <h3 className="nh-title">{outlier.title}</h3>
          <p className="nh-byline">
            <span className="nh-byline-ch">{outlier.channel_title}</span>
            <span className="nh-byline-dot">·</span>
            <span>{relAge(outlier.published_at)}</span>
            <span className="nh-byline-dot">·</span>
            <span>{fmtViews(outlier.view_count)} views</span>
          </p>
          <div className="nh-chip-row">
            <span className="nh-chip nh-chip-red">
              <strong>{outlier.sub_ratio}×</strong> outlier
            </span>
            <span className="nh-chip nh-chip-soft">
              <strong>{outlier.outlier_score}</strong> score
            </span>
          </div>
        </div>
      </div>

      {why.length > 0 && (
        <>
          <p className="nh-eyebrow">Why it worked</p>
          <ul className="nh-why">
            {why.slice(0, 3).map((reason, i) => (
              <li key={i}>
                <span className="nh-why-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="nh-why-text">{reason}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="nh-card-foot">
        <p className="nh-foot-hint">Want eight more like this in {nicheLabel.toLowerCase()}?</p>
        <button
          type="button"
          className="nh-ghost-cta"
          onClick={() => onNavigate?.('Outliers')}
        >
          Open Outliers
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </article>
  )
}


// ─── Title suggestion card ───────────────────────────────────────────────

function TitleCard({ data, personalized, onOpenSeoStudio }) {
  const { outlier } = data
  const angle          = personalized?.angle           || outlier.angle_template || ''
  const angleReasoning = personalized?.angle_reasoning || outlier.angle_reasoning || ''
  const angleKeyword   = personalized?.keyword         || outlier.angle_keyword || ''

  return (
    <article className="nh-card">
      <div className="nh-title-box">
        <p className="nh-eyebrow">Suggested title for your channel</p>
        <p className="nh-suggested-title">{angle || 'Tailoring a title for you…'}</p>
      </div>

      {angleReasoning && (
        <>
          <p className="nh-eyebrow">Why this works for you</p>
          <p className="nh-reason">{angleReasoning}</p>
        </>
      )}

      <div className="nh-bottom-row">
        {angleKeyword ? (
          <span className="nh-kw-chip">
            <span className="nh-kw-lbl">Target</span>
            <span className="nh-kw-val">{angleKeyword}</span>
          </span>
        ) : <span />}
        <button
          type="button"
          className="nh-cta"
          disabled={!angle}
          onClick={() => onOpenSeoStudio?.(angle, angleKeyword)}
        >
          Open in Title &amp; Description
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </article>
  )
}


// ─── Skeleton / empty ────────────────────────────────────────────────────

function SectionSkeleton({ title }) {
  return (
    <section className="nh-section">
      <div className="nh-section-head">
        <span className="nh-sk" style={{ width: 180, height: 14, borderRadius: 6 }} />
      </div>
      <article className="nh-card">
        <div className="nh-outlier-top">
          <div className="nh-sk" style={{ width: 180, aspectRatio: '16/9', borderRadius: 10, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="nh-sk" style={{ width: '92%', height: 17, marginBottom: 9 }} />
            <div className="nh-sk" style={{ width: '60%', height: 12, marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="nh-sk" style={{ width: 90, height: 22, borderRadius: 100 }} />
              <div className="nh-sk" style={{ width: 80, height: 22, borderRadius: 100 }} />
            </div>
          </div>
        </div>
        <div className="nh-sk" style={{ width: '90%', height: 12, marginTop: 18, marginBottom: 8 }} />
        <div className="nh-sk" style={{ width: '78%', height: 12, marginBottom: 8 }} />
        <div className="nh-sk" style={{ width: '62%', height: 12 }} />
      </article>
    </section>
  )
}

function EmptyOutlier({ niche, reason, onNavigate }) {
  const label = NICHE_LABELS[niche] || niche || 'your niche'
  const isGenerating = reason === 'generating_now' || reason === 'no_cache_yet'
  const noOutliersYet = reason === 'no_outliers_yet'

  if (noOutliersYet) {
    return (
      <section className="nh-section">
        <div className="nh-section-head">
          <span className="nh-section-title">
            <span className="nh-dot" style={{ background: C.red }} />
            Niche Outlier
          </span>
        </div>
        <article className="nh-card">
          <p className="nh-eyebrow">Unlock this card</p>
          <p className="nh-suggested-title" style={{ fontSize: 15, marginBottom: 10 }}>
            Run Outliers once and we will pin the strongest video, thumbnail, or breakout
            channel from your niche to this card.
          </p>
          <p className="nh-reason">
            We do not auto-pick a query for you here, an auto-pick gives off-niche results.
            Type the topic you actually want to study and the result lands here.
          </p>
          <div className="nh-bottom-row">
            <span />
            <button
              type="button"
              className="nh-cta"
              onClick={() => onNavigate?.('Outliers')}
            >
              Open Outliers
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </article>
      </section>
    )
  }

  return (
    <section className="nh-section">
      <div className="nh-section-head">
        <span className="nh-section-title">
          <span className="nh-dot" style={{ background: C.red }} />
          Niche Outlier
        </span>
      </div>
      <article className="nh-card">
        <div className="nh-empty-row">
          <div className="nh-spin" />
          <div>
            <p className="nh-empty-title">
              {isGenerating ? `Finding the top ${label.toLowerCase()} outlier of the week.` : 'Niche outlier coming soon.'}
            </p>
            <p className="nh-empty-sub">
              {isGenerating
                ? 'Usually takes 15 to 30 seconds. The card refreshes here automatically.'
                : 'Try refreshing the page. If this keeps happening, email support@ytgrowth.io.'}
            </p>
          </div>
        </div>
      </article>
    </section>
  )
}


// ─── Styles ──────────────────────────────────────────────────────────────

const styles = `
.nh-section { margin-bottom: 16px; }

.nh-section-head {
  display: flex; align-items: center; gap: 6px;
  margin: 0 4px 10px 4px;
  min-height: 22px;
}
.nh-section-title {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 13.5px; font-weight: 700; color: ${C.text1};
  letter-spacing: -0.2px;
}
.nh-dot {
  width: 7px; height: 7px; border-radius: 50%;
  display: inline-block; flex-shrink: 0;
}
.nh-section-age {
  font-size: 12px; color: ${C.text3}; font-weight: 500;
  letter-spacing: -0.1px;
}
.nh-section-spacer { flex: 1; }
.nh-x {
  width: 22px; height: 22px; border-radius: 6px;
  border: none; background: transparent;
  color: ${C.text3}; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.nh-x:hover { background: #ececef; color: ${C.text1}; }

.nh-card {
  background: ${C.card};
  border: 1px solid ${C.border};
  border-radius: 14px;
  box-shadow: ${C.shadowSm};
  padding: 18px 20px;
  font-family: 'Inter', system-ui, sans-serif;
  transition: box-shadow 0.18s;
}
.nh-card:hover { box-shadow: ${C.shadowHover}; }

/* Outlier card */
.nh-outlier-top {
  display: flex; gap: 16px;
  margin-bottom: 16px;
}
.nh-thumb {
  position: relative;
  width: 200px; flex-shrink: 0;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  overflow: hidden;
  background: #eaeaef;
  text-decoration: none;
  display: block;
}
.nh-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.nh-thumb-fallback { width: 100%; height: 100%; background: #eaeaef; }
.nh-thumb-overlay {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0); opacity: 0;
  transition: opacity 0.18s, background 0.18s;
}
.nh-thumb-overlay .nh-play {
  width: 40px; height: 40px; border-radius: 50%;
  background: ${C.red}; color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 10px rgba(229,37,27,0.55);
  padding-left: 3px;
}
.nh-thumb:hover .nh-thumb-overlay {
  opacity: 1; background: rgba(0,0,0,0.32);
}

.nh-outlier-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.nh-title {
  font-size: 16px; font-weight: 700; color: ${C.text1};
  letter-spacing: -0.25px; line-height: 1.4;
  margin: 0 0 6px 0;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.nh-byline {
  font-size: 12.5px; color: ${C.text3}; font-weight: 500;
  margin: 0 0 12px 0; line-height: 1.5;
  display: flex; flex-wrap: wrap; gap: 0 6px;
}
.nh-byline-ch { color: ${C.text2}; font-weight: 600; }
.nh-byline-dot { color: ${C.text4}; }

.nh-chip-row {
  display: flex; flex-wrap: wrap; gap: 6px;
  margin-top: auto;
}
.nh-chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 600;
  padding: 5px 11px; border-radius: 100px;
  letter-spacing: -0.1px;
}
.nh-chip strong { font-weight: 800; }
.nh-chip-red {
  color: ${C.redDeep};
  background: ${C.redTint};
  border: 1px solid ${C.redBdr};
}
.nh-chip-soft {
  color: ${C.text2};
  background: ${C.insetBg};
  border: 1px solid ${C.insetBdr};
}

.nh-eyebrow {
  font-size: 10.5px; font-weight: 800; letter-spacing: 0.08em;
  text-transform: uppercase; color: ${C.text3};
  margin: 0 0 10px 0;
}

.nh-why { list-style: none; padding: 0; margin: 0; }
.nh-why li {
  display: flex; gap: 12px; align-items: flex-start;
  margin-bottom: 8px;
  font-size: 13px; color: ${C.text2}; line-height: 1.6;
}
.nh-why li:last-child { margin-bottom: 0; }
.nh-why-n {
  font-size: 10px; font-weight: 800; color: ${C.green};
  letter-spacing: 0.04em;
  flex-shrink: 0; margin-top: 4px;
  font-variant-numeric: tabular-nums;
}

/* Title card */
.nh-title-box {
  background: ${C.insetBg};
  border: 1px solid ${C.insetBdr};
  border-radius: 11px;
  padding: 14px 16px;
  margin-bottom: 16px;
}
.nh-title-box .nh-eyebrow { margin-bottom: 8px; }
.nh-suggested-title {
  font-size: 17px; font-weight: 700; color: ${C.text1};
  letter-spacing: -0.3px; line-height: 1.4;
  margin: 0;
}
.nh-reason {
  font-size: 13.5px; color: ${C.text2}; line-height: 1.6;
  margin: 0 0 16px 0;
}

.nh-bottom-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
}
.nh-kw-chip {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 12px; padding: 6px 12px;
  border-radius: 100px;
  background: ${C.amberBg}; border: 1px solid ${C.amberBdr};
}
.nh-kw-lbl {
  font-size: 9.5px; font-weight: 800; color: ${C.amber};
  letter-spacing: 0.08em; text-transform: uppercase;
}
.nh-kw-val { font-size: 12.5px; font-weight: 700; color: ${C.text1}; letter-spacing: -0.1px; }

.nh-cta {
  display: inline-flex; align-items: center; gap: 7px;
  background: ${C.red};
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 100px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 13px; font-weight: 700;
  letter-spacing: -0.1px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.10), 0 4px 14px rgba(229,37,27,0.26);
  transition: filter 0.15s, transform 0.15s, box-shadow 0.15s;
}
.nh-cta:hover:not(:disabled) {
  filter: brightness(1.07); transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0,0,0,0.13), 0 10px 28px rgba(229,37,27,0.32);
}
.nh-cta:disabled { opacity: 0.55; cursor: progress; }

.nh-card-foot {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
  margin-top: 16px; padding-top: 14px;
  border-top: 1px solid ${C.borderSoft};
}
.nh-foot-hint {
  font-size: 12.5px; color: ${C.text3}; line-height: 1.5;
  margin: 0; letter-spacing: -0.1px;
}
.nh-ghost-cta {
  display: inline-flex; align-items: center; gap: 6px;
  background: transparent;
  color: ${C.red};
  border: 1px solid ${C.redBdr};
  padding: 7px 14px;
  border-radius: 100px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 12.5px; font-weight: 700;
  letter-spacing: -0.1px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.nh-ghost-cta:hover {
  background: ${C.redTint};
  border-color: ${C.red};
  color: ${C.redDeep};
}

/* Empty + skeleton */
.nh-empty-row { display: flex; align-items: center; gap: 14px; }
.nh-spin {
  width: 28px; height: 28px; border-radius: 50%;
  border: 2.5px solid ${C.border};
  border-top-color: ${C.red};
  animation: nhSpin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes nhSpin { to { transform: rotate(360deg) } }
.nh-empty-title { font-size: 14px; font-weight: 700; color: ${C.text1}; margin: 0 0 4px 0; line-height: 1.4; }
.nh-empty-sub   { font-size: 12.5px; color: ${C.text3}; line-height: 1.55; margin: 0; }

.nh-sk {
  background: linear-gradient(90deg, #f4f4f6 0%, #ececef 50%, #f4f4f6 100%);
  background-size: 400px 100%;
  animation: nhShimmer 1.4s linear infinite;
  border-radius: 6px;
  display: block;
}
@keyframes nhShimmer { 0% { background-position: -200px 0 } 100% { background-position: 400px 0 } }

@media (max-width: 700px) {
  .nh-outlier-top { flex-direction: column; }
  .nh-thumb { width: 100%; }
  .nh-bottom-row { flex-direction: column; align-items: stretch; }
  .nh-cta { width: 100%; justify-content: center; }
}
`
