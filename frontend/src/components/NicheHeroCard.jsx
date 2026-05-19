/* NicheHeroCard — interactive Home outlier card.

   Data comes from /dashboard/niche-outlier. When source is "outliers_cache"
   the endpoint returns a bundle: {videos:[], thumbnails:[], channels:[]}
   computed from the user's own paid Outliers search result. The card
   exposes all three signal types via a pill row, lets the user step through
   positions within each type, and persists their last view (type + index)
   in localStorage so a reload keeps them where they were.

   Legacy "auto_pick" source returns a single payload and is rendered as a
   single-shot fallback. New "no_outliers_yet" source renders a CTA to run
   the paid Outliers feature.
*/

import { useEffect, useMemo, useState } from 'react'
import {
  VideoResultCard,
  ChannelResultCard,
} from './OutlierCards'

/* Dark palette — mirrors the shipped app-shell / Competitors dark
   system. NicheHeroCard is Feed-only, so darkening it wholesale is safe. */
const C = {
  card:        'linear-gradient(180deg, #1e1e24 0%, #18181c 100%)',
  border:      'rgba(255,255,255,0.08)',
  borderSoft:  'rgba(255,255,255,0.06)',
  text1:       '#f4f4f5',
  text2:       '#cfd0d6',
  text3:       '#b2b3bb',
  text4:       'rgba(255,255,255,0.30)',
  red:         '#e5251b',
  redDeep:     '#fb6a60',
  redTint:     'rgba(229,37,27,0.13)',
  redBdr:      'rgba(229,37,27,0.32)',
  green:       '#34d27b',
  insetBg:     '#1c1c21',
  insetBdr:    'rgba(255,255,255,0.08)',
  shadowSm:    '0 1px 3px rgba(0,0,0,0.4)',
  shadowHover: '0 6px 20px rgba(0,0,0,0.55)',
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

const VIEW_STATE_KEY = (channelId) => `nh_view_v1:${channelId || 'unknown'}`
function loadViewState(channelId) {
  try {
    const raw = localStorage.getItem(VIEW_STATE_KEY(channelId))
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}
function saveViewState(channelId, state) {
  try {
    localStorage.setItem(VIEW_STATE_KEY(channelId), JSON.stringify(state))
  } catch {}
}


// ─── Default export ──────────────────────────────────────────────────────

export default function NicheHeroCard({ onOpenSeoStudio, onNavigate, channelId }) {
  const [state, setState] = useState({ loading: true, data: null })
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

  if (dismissed) return null

  if (state.loading) {
    return (
      <>
        <style>{styles}</style>
        <SectionSkeleton />
      </>
    )
  }

  if (!state.data?.ok) {
    return (
      <>
        <style>{styles}</style>
        <EmptyOutlier
          reason={state.data?.reason}
          onNavigate={onNavigate}
        />
      </>
    )
  }

  // Source dispatcher. Newer interactive bundle vs legacy single payload.
  const source = state.data.source
  if (source === 'outliers_cache' && state.data.bundle) {
    return (
      <>
        <style>{styles}</style>
        <InteractiveBundleCard
          bundle={state.data.bundle}
          channelId={channelId}
          onDismiss={() => setDismissed(true)}
          onOpenSeoStudio={onOpenSeoStudio}
          onNavigate={onNavigate}
        />
      </>
    )
  }

  // Legacy single-payload fallback (auto_pick).
  return (
    <>
      <style>{styles}</style>
      <LegacySingleCard
        data={state.data}
        onDismiss={() => setDismissed(true)}
        onNavigate={onNavigate}
      />
    </>
  )
}


// ─── Interactive bundle card ─────────────────────────────────────────────

function InteractiveBundleCard({ bundle, channelId, onDismiss, onOpenSeoStudio, onNavigate }) {
  const locked = new Set(bundle.locked_signals || [])
  // Always render all 3 pills. Empty-and-locked ones render as upgrade
  // teasers (free auto-peek). Empty-and-not-locked just won't be available
  // (paid full runs always populate all three).
  const tabs = useMemo(() => ([
    { key: 'video',     label: 'Videos',     count: bundle.videos?.length     || 0, locked: locked.has('videos') },
    { key: 'thumbnail', label: 'Thumbnails', count: bundle.thumbnails?.length || 0, locked: locked.has('thumbnails') },
    { key: 'channel',   label: 'Channels',   count: bundle.channels?.length   || 0, locked: locked.has('channels') },
  ]), [bundle])

  const persisted = loadViewState(channelId) || {}
  const initialTab = tabs.find(t => t.key === persisted.tab) ? persisted.tab : (tabs.find(t => !t.locked && t.count > 0)?.key || tabs[0].key)
  const [tab, setTab] = useState(initialTab)
  const [idx, setIdx] = useState(() => {
    const i = Number.isInteger(persisted.idx) ? persisted.idx : 0
    return i
  })

  useEffect(() => {
    saveViewState(channelId, { tab, idx })
  }, [tab, idx, channelId])

  const currentTab = tabs.find(t => t.key === tab) || tabs[0]
  const isLockedTab = !!currentTab?.locked
  const currentList = isLockedTab ? [] : (
    tab === 'video'     ? (bundle.videos     || []) :
    tab === 'thumbnail' ? (bundle.thumbnails || []) :
    tab === 'channel'   ? (bundle.channels   || []) : []
  )

  // Top 3 cards across, matches the Outliers page's grid density.
  const grid = currentList.slice(0, 3)
  const refreshedAge = relAge(bundle.refreshed_at) || 'this week'

  function switchTab(nextKey) {
    setTab(nextKey)
    setIdx(0)
  }

  function openOutliers() {
    onNavigate?.('Outliers')
  }

  return (
    <section className="nh-section">
      {/* Header row */}
      <div className="nh-section-head">
        <span className="nh-section-title">
          <span className="nh-dot" style={{ background: C.red }} />
          Niche Outlier
        </span>
        <span className="nh-section-age">· {refreshedAge}</span>
        <div className="nh-section-spacer" />
        {/* No dismiss X — this is a core feature, not a notification. A
            user can't dismiss it the way they dismiss a Priority Action. */}
      </div>

      <article className="nh-card">
        {/* Pill row */}
        <div className="nh-pills">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`nh-pill ${t.key === tab ? 'nh-pill-active' : ''} ${t.locked ? 'nh-pill-locked' : ''}`}
              onClick={() => switchTab(t.key)}
              type="button"
            >
              {t.locked && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: -2 }}>
                  <rect x="4" y="11" width="16" height="10" rx="2"/>
                  <path d="M8 11V8a4 4 0 0 1 8 0v3"/>
                </svg>
              )}
              {t.label}
              <span className="nh-pill-count">{t.locked ? 'Locked' : t.count}</span>
            </button>
          ))}
          {bundle.query_used && (
            <span className="nh-query">from your search: <strong>{bundle.query_used}</strong></span>
          )}
        </div>

        {/* Body: 3-up grid using the same VideoResultCard / ChannelResultCard
            the paid Outliers page renders. Click any card -> open Outliers
            so the user lands in the full detail experience. */}
        {isLockedTab ? (
          <LockedTeaser
            signal={tab}
            onUpgrade={openOutliers}
          />
        ) : grid.length > 0 ? (
          <div className="nh-grid">
            {tab === 'channel'
              ? grid.map(item => (
                  <ChannelResultCard
                    key={item.channel_id || item.channel_name}
                    item={item}
                    onOpen={openOutliers}
                  />
                ))
              : grid.map(item => (
                  <VideoResultCard
                    key={item.video_id}
                    item={item}
                    kind={tab}
                    onOpen={openOutliers}
                  />
                ))
            }
          </div>
        ) : (
          <p className="nh-empty-sub" style={{ padding: '14px 0' }}>Nothing in this slot yet.</p>
        )}

        {/* Footer link to the full Outliers page */}
        {!isLockedTab && currentList.length > grid.length && (
          <div className="nh-grid-foot">
            <span className="nh-foot-hint">Showing the top {grid.length} of {currentList.length}.</span>
            <button
              type="button"
              className="nh-ghost-cta"
              onClick={openOutliers}
            >
              Open Outliers
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        )}
      </article>
    </section>
  )
}


// ─── Locked teaser (free-peek pills that need an Outliers run to unlock) ─

function LockedTeaser({ signal, onUpgrade }) {
  const copy =
    signal === 'thumbnail'
      ? {
          headline: 'Thumbnail patterns winning in your niche',
          body:     'Run Outliers to see which thumbnail designs are pulling clicks for breakout videos right now.',
        }
      : {
          headline: 'Breakout channels in your niche',
          body:     'Run Outliers to find smaller channels in your niche that are punching above their weight, with the moves to copy.',
        }
  return (
    <div className="nh-locked">
      <div className="nh-locked-stack">
        <div className="nh-locked-thumb nh-locked-thumb-3" />
        <div className="nh-locked-thumb nh-locked-thumb-2" />
        <div className="nh-locked-thumb nh-locked-thumb-1">
          <div className="nh-locked-shield">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="2"/>
              <path d="M8 11V8a4 4 0 0 1 8 0v3"/>
            </svg>
          </div>
        </div>
      </div>
      <div className="nh-locked-info">
        <p className="nh-eyebrow">Run Outliers to unlock</p>
        <h3 className="nh-title" style={{ marginBottom: 8 }}>{copy.headline}</h3>
        <p className="nh-reason" style={{ marginBottom: 14 }}>{copy.body}</p>
        <button type="button" className="nh-cta" onClick={onUpgrade}>
          Run Outliers
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  )
}


// ─── Featured slot variants ──────────────────────────────────────────────

function VideoFeatured({ v, onOpenSeoStudio }) {
  const why = Array.isArray(v.why_working) ? v.why_working : []
  return (
    <div className="nh-feat">
      <a
        className="nh-thumb"
        href={`https://www.youtube.com/watch?v=${v.video_id}`}
        target="_blank" rel="noopener noreferrer"
        aria-label="Watch on YouTube"
      >
        {v.thumbnail_url
          ? <img src={v.thumbnail_url} alt="" loading="lazy" />
          : <div className="nh-thumb-fallback" />}
        <span className="nh-thumb-overlay">
          <span className="nh-play">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><polygon points="4,2.5 11.5,7 4,11.5"/></svg>
          </span>
        </span>
        {v.outlier_mult > 1 && (
          <span className="nh-overlay-badge">{v.outlier_mult}x</span>
        )}
      </a>

      <div className="nh-feat-info">
        <h3 className="nh-title">{v.title}</h3>
        <p className="nh-byline">
          <span className="nh-byline-ch">{v.channel_title}</span>
          <span className="nh-byline-dot">·</span>
          <span>{relAge(v.published_at)}</span>
          <span className="nh-byline-dot">·</span>
          <span>{fmtViews(v.view_count)} views</span>
        </p>
        <div className="nh-chip-row">
          <span className="nh-chip nh-chip-red">
            <strong>{v.outlier_mult || v.sub_ratio}×</strong> outlier
          </span>
          <span className="nh-chip nh-chip-soft">
            <strong>{v.outlier_score}</strong> score
          </span>
        </div>

        {why.length > 0 && (
          <div className="nh-why-wrap">
            <p className="nh-eyebrow">Why it worked</p>
            <ul className="nh-why">
              {why.slice(0, 3).map((reason, i) => (
                <li key={i}>
                  <span className="nh-why-n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="nh-why-text">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {v.title && onOpenSeoStudio && (
          <div className="nh-feat-cta">
            <button
              type="button"
              className="nh-cta"
              onClick={() => onOpenSeoStudio(v.title, '')}
            >
              Adapt this title for me
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ChannelFeatured({ ch }) {
  const todo = Array.isArray(ch.what_to_do) ? ch.what_to_do : []
  return (
    <div className="nh-feat">
      <a
        className="nh-thumb nh-thumb-ch"
        href={ch.channel_id ? `https://www.youtube.com/channel/${ch.channel_id}` : '#'}
        target="_blank" rel="noopener noreferrer"
        aria-label="Open channel on YouTube"
      >
        {ch.channel_thumb
          ? <img src={ch.channel_thumb} alt="" loading="lazy" />
          : <div className="nh-thumb-fallback nh-thumb-fallback-ch">{(ch.channel_title || '?').slice(0,1).toUpperCase()}</div>}
      </a>

      <div className="nh-feat-info">
        <h3 className="nh-title">{ch.channel_title}</h3>
        <p className="nh-byline">
          <span>{fmtViews(ch.subscribers)} subs</span>
          {ch.videos_in_search > 0 && (
            <>
              <span className="nh-byline-dot">·</span>
              <span>{ch.videos_in_search} hit videos in your niche</span>
            </>
          )}
        </p>

        {ch.why_this_channel && (
          <div className="nh-why-wrap">
            <p className="nh-eyebrow">Why this channel</p>
            <p className="nh-reason">{ch.why_this_channel}</p>
          </div>
        )}

        {todo.length > 0 && (
          <div className="nh-why-wrap">
            <p className="nh-eyebrow">What to do</p>
            <ul className="nh-why">
              {todo.slice(0, 3).map((step, i) => (
                <li key={i}>
                  <span className="nh-why-n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="nh-why-text">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}


// ─── Legacy single-payload (auto_pick) card ──────────────────────────────

function LegacySingleCard({ data, onDismiss, onNavigate }) {
  const v = data.outlier || {}
  return (
    <section className="nh-section">
      <div className="nh-section-head">
        <span className="nh-section-title">
          <span className="nh-dot" style={{ background: C.red }} />
          Niche Outlier
        </span>
        <span className="nh-section-age">· {relAge(v.refreshed_at) || 'this week'}</span>
        <div className="nh-section-spacer" />
        {/* No dismiss X — Niche Outlier is a core feature, not a
            notification users should be able to delete by accident. */}
      </div>
      <article className="nh-card">
        <VideoFeatured v={{ ...v, outlier_mult: v.outlier_mult || v.sub_ratio }} onOpenSeoStudio={null} />
        <div className="nh-card-foot">
          <p className="nh-foot-hint">Want more? Run a targeted search.</p>
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
    </section>
  )
}


// ─── Skeleton / empty ────────────────────────────────────────────────────

function SectionSkeleton() {
  return (
    <section className="nh-section">
      <div className="nh-section-head">
        <span className="nh-sk" style={{ width: 180, height: 14, borderRadius: 6 }} />
      </div>
      <article className="nh-card">
        <div className="nh-feat">
          <div className="nh-sk" style={{ width: 220, aspectRatio: '16/9', borderRadius: 10, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="nh-sk" style={{ width: '92%', height: 17, marginBottom: 9 }} />
            <div className="nh-sk" style={{ width: '60%', height: 12, marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="nh-sk" style={{ width: 90, height: 22, borderRadius: 100 }} />
              <div className="nh-sk" style={{ width: 80, height: 22, borderRadius: 100 }} />
            </div>
          </div>
        </div>
      </article>
    </section>
  )
}

function EmptyOutlier({ reason, onNavigate }) {
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
            Run Outliers once and we will pin the strongest videos, thumbnails, and breakout
            channels from your niche to this card, with a built-in switcher.
          </p>
          <p className="nh-reason">
            We do not auto-pick a query for you here. Auto-picks land on off-niche results.
            Type the topic you actually want to study and the full set lands here.
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
              {isGenerating ? 'Finding the top outlier of the week.' : 'Niche outlier coming soon.'}
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
  font-size: 13.5px; font-weight: 600; color: ${C.text1};
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
.nh-x:hover { background: rgba(255,255,255,0.08); color: ${C.text1}; }

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

/* Pills */
.nh-pills {
  display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
  margin-bottom: 14px;
}
.nh-pill {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 12.5px; font-weight: 600;
  padding: 7px 13px; border-radius: 100px;
  border: 1px solid ${C.insetBdr};
  background: #1c1c21; color: ${C.text2};
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s;
  letter-spacing: -0.1px;
}
.nh-pill:hover { color: ${C.text1}; border-color: rgba(255,255,255,0.18); }
.nh-pill-active {
  background: ${C.red}; color: #fff; border-color: ${C.red};
  box-shadow: 0 1px 3px rgba(229,37,27,0.30);
}
.nh-pill-active:hover { color: #fff; border-color: ${C.red}; }
.nh-pill-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  border-radius: 100px;
  font-size: 10.5px; font-weight: 700;
  background: rgba(255,255,255,0.22);
}
.nh-pill:not(.nh-pill-active) .nh-pill-count {
  background: ${C.insetBg};
  color: ${C.text3};
}
.nh-pill-locked {
  color: ${C.text3};
  background: ${C.insetBg};
}
.nh-pill-locked:hover { color: ${C.text1}; }
.nh-pill-locked.nh-pill-active {
  background: #1f1f2a; color: #fff; border-color: #1f1f2a;
  box-shadow: 0 1px 3px rgba(0,0,0,0.28);
}
.nh-pill-locked.nh-pill-active .nh-pill-count {
  background: rgba(255,255,255,0.18);
  color: #fff;
}

/* Locked teaser */
.nh-locked {
  display: flex; gap: 22px; align-items: center;
  padding: 6px 0 4px;
}
.nh-locked-stack {
  position: relative;
  width: 240px; height: 150px; flex-shrink: 0;
}
.nh-locked-thumb {
  position: absolute;
  width: 200px; aspect-ratio: 16 / 9;
  border-radius: 10px;
  background: linear-gradient(135deg, #2a2a30 0%, #202024 50%, #2a2a30 100%);
  box-shadow: 0 4px 14px rgba(0,0,0,0.10);
  filter: blur(0.6px);
}
.nh-locked-thumb-1 {
  top: 0; left: 30px;
  z-index: 3;
  filter: none;
  background:
    linear-gradient(135deg, rgba(229,37,27,0.10) 0%, rgba(229,37,27,0.05) 60%, rgba(31,31,42,0.10) 100%),
    linear-gradient(135deg, #26262b 0%, #2a2a30 50%, #26262b 100%);
  border: 1px solid rgba(255,255,255,0.4);
  display: flex; align-items: center; justify-content: center;
}
.nh-locked-thumb-2 {
  top: 14px; left: 14px;
  z-index: 2;
  transform: rotate(-3deg);
  opacity: 0.7;
}
.nh-locked-thumb-3 {
  top: 26px; left: 0;
  z-index: 1;
  transform: rotate(-6deg);
  opacity: 0.45;
}
.nh-locked-shield {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: rgba(15,15,25,0.92);
  color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(0,0,0,0.30);
}
.nh-locked-info { flex: 1; min-width: 0; }
.nh-query {
  margin-left: auto;
  font-size: 11.5px; color: ${C.text3};
  letter-spacing: -0.1px;
}
.nh-query strong { color: ${C.text2}; font-weight: 600; }

/* Niche grid. With the Feed column at 1040px, three cards fit on one
   row at ~310px each which matches the card's natural design. Drops
   to 2-up below 880px container width and 1-up on tight screens. */
.nh-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 4px;
}
@media (max-width: 880px) {
  .nh-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .nh-grid { grid-template-columns: 1fr; }
}

.nh-grid-foot {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
  margin-top: 18px; padding-top: 14px;
  border-top: 1px solid ${C.borderSoft};
}

/* Featured slot (legacy, retained for the locked teaser layout below) */
.nh-feat {
  display: flex; gap: 16px;
  margin-bottom: 4px;
}
.nh-thumb {
  position: relative;
  width: 220px; flex-shrink: 0;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  overflow: hidden;
  background: #26262b;
  text-decoration: none;
  display: block;
}
.nh-thumb-ch { aspect-ratio: 1 / 1; width: 140px; border-radius: 14px; }
.nh-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.nh-thumb-fallback { width: 100%; height: 100%; background: #26262b; }
.nh-thumb-fallback-ch {
  display: flex; align-items: center; justify-content: center;
  font-size: 36px; font-weight: 700; color: rgba(255,255,255,0.32);
}
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
.nh-overlay-badge {
  position: absolute; top: 8px; left: 8px;
  background: ${C.red}; color: #fff;
  font-size: 11px; font-weight: 700; letter-spacing: -0.1px;
  padding: 4px 9px; border-radius: 100px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
}

.nh-feat-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.nh-title {
  font-size: 16px; font-weight: 600; color: ${C.text1};
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
}
.nh-chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 600;
  padding: 5px 11px; border-radius: 100px;
  letter-spacing: -0.1px;
}
.nh-chip strong { font-weight: 700; }
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
  font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; color: ${C.text3};
  margin: 0 0 10px 0;
}
.nh-why-wrap { margin-top: 16px; }
.nh-why { list-style: none; padding: 0; margin: 0; }
.nh-why li {
  display: flex; gap: 12px; align-items: flex-start;
  margin-bottom: 8px;
  font-size: 13px; color: ${C.text2}; line-height: 1.6;
}
.nh-why li:last-child { margin-bottom: 0; }
.nh-why-n {
  font-size: 10px; font-weight: 700; color: ${C.green};
  letter-spacing: 0.04em;
  flex-shrink: 0; margin-top: 4px;
  font-variant-numeric: tabular-nums;
}
.nh-reason { font-size: 13px; color: ${C.text2}; line-height: 1.6; margin: 0; }

.nh-feat-cta { margin-top: 16px; }

.nh-cta {
  display: inline-flex; align-items: center; gap: 7px;
  background: ${C.red};
  color: #ffffff;
  border: none;
  padding: 9px 16px;
  border-radius: 100px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 12.5px; font-weight: 600;
  letter-spacing: -0.1px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.10), 0 4px 14px rgba(229,37,27,0.26);
  transition: filter 0.15s, transform 0.15s, box-shadow 0.15s;
}
.nh-cta:hover:not(:disabled) {
  filter: brightness(1.07); transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0,0,0,0.13), 0 10px 28px rgba(229,37,27,0.32);
}
.nh-cta:disabled { opacity: 0.55; cursor: not-allowed; }

/* Pager */
.nh-pager {
  margin-top: 18px;
  display: flex; align-items: center; gap: 10px;
  padding-top: 14px;
  border-top: 1px solid ${C.borderSoft};
}
.nh-pager-btn {
  width: 30px; height: 30px; border-radius: 100px;
  border: 1px solid ${C.insetBdr};
  background: #1c1c21; color: ${C.text2};
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.nh-pager-btn:hover { background: ${C.insetBg}; color: ${C.text1}; border-color: rgba(255,255,255,0.18); }
.nh-pager-count {
  font-size: 12px; color: ${C.text3}; font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.1px;
}

.nh-ghost-cta {
  display: inline-flex; align-items: center; gap: 6px;
  background: transparent;
  color: ${C.red};
  border: 1px solid ${C.redBdr};
  padding: 7px 14px;
  border-radius: 100px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 12.5px; font-weight: 600;
  letter-spacing: -0.1px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.nh-ghost-cta:hover {
  background: ${C.redTint};
  border-color: ${C.red};
  color: ${C.redDeep};
}

/* Rail */
.nh-rail {
  margin-top: 14px;
  display: flex; gap: 8px;
  overflow-x: auto;
  scrollbar-width: thin;
  padding-bottom: 4px;
}
.nh-rail::-webkit-scrollbar { height: 6px; }
.nh-rail::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 100px; }
.nh-rail-thumb {
  position: relative;
  flex-shrink: 0;
  width: 110px; aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  background: #26262b;
  border: 2px solid transparent;
  padding: 0; cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;
}
.nh-rail-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.nh-rail-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.32); font-size: 22px; font-weight: 700; }
.nh-rail-thumb:hover { transform: translateY(-1px); }
.nh-rail-thumb-active { border-color: ${C.red}; box-shadow: 0 4px 14px rgba(229,37,27,0.25); }
.nh-rail-badge {
  position: absolute; top: 4px; left: 4px;
  background: rgba(0,0,0,0.72); color: #fff;
  font-size: 10px; font-weight: 700; letter-spacing: -0.05em;
  padding: 2px 6px; border-radius: 100px;
}

/* Legacy card foot */
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

/* Empty / suggested-title styling reused */
.nh-suggested-title {
  font-size: 17px; font-weight: 600; color: ${C.text1};
  letter-spacing: -0.3px; line-height: 1.4;
  margin: 0;
}
.nh-bottom-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
  margin-top: 16px;
}

/* Skeleton + spinner */
.nh-empty-row { display: flex; align-items: center; gap: 14px; }
.nh-spin {
  width: 28px; height: 28px; border-radius: 50%;
  border: 2.5px solid ${C.border};
  border-top-color: ${C.red};
  animation: nhSpin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes nhSpin { to { transform: rotate(360deg) } }
.nh-empty-title { font-size: 14px; font-weight: 600; color: ${C.text1}; margin: 0 0 4px 0; line-height: 1.4; }
.nh-empty-sub   { font-size: 12.5px; color: ${C.text3}; line-height: 1.55; margin: 0; }

.nh-sk {
  background: linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.06) 100%);
  background-size: 400px 100%;
  animation: nhShimmer 1.4s linear infinite;
  border-radius: 6px;
  display: block;
}
@keyframes nhShimmer { 0% { background-position: -200px 0 } 100% { background-position: 400px 0 } }

@media (max-width: 700px) {
  .nh-feat { flex-direction: column; }
  .nh-thumb { width: 100%; }
  .nh-thumb-ch { width: 120px; align-self: center; }
  .nh-bottom-row { flex-direction: column; align-items: stretch; }
  .nh-cta { width: 100%; justify-content: center; }
  .nh-query { margin-left: 0; }
  .nh-locked { flex-direction: column; align-items: stretch; }
  .nh-locked-stack { width: 100%; height: 130px; }
}
`
