import { useState, useEffect, useRef } from 'react'
import UpsellGate from '../components/UpsellGate'

// Load Inter once — SCOPED to this page (each page owns its font, never global)
if (typeof document !== 'undefined' && !document.getElementById('outliers-inter-font')) {
  const link = document.createElement('link')
  link.id = 'outliers-inter-font'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
  document.head.appendChild(link)
}

/* ─── Scoped styles ─────────────────────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('outliers-styles')) {
  const s = document.createElement('style')
  s.id = 'outliers-styles'
  s.textContent = `
    @keyframes outFadeUp   { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
    @keyframes outFadeIn   { from { opacity:0 } to { opacity:1 } }
    @keyframes outSlideIn  { from { opacity:0; transform:translateY(12px) scale(0.98) } to { opacity:1; transform:translateY(0) scale(1) } }
    @keyframes outSpin     { to { transform: rotate(360deg) } }

    .out-section { animation: outFadeUp 0.28s ease both; }

    .out-card {
      background: #ffffff;
      border: 1px solid #e6e6ec;
      border-radius: 16px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06);
      transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
    }
    .out-result-card {
      background: #ffffff;
      border: 1px solid #e6e6ec;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06);
      transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
      cursor: pointer;
      display: flex; gap: 16px; align-items: stretch;
      text-align: left; width: 100%;
      font-family: inherit;
    }
    .out-result-card:hover {
      border-color: rgba(229,37,27,0.28);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(229,37,27,0.14);
      transform: translateY(-1px);
    }

    .out-grid-card {
      background: #ffffff;
      border: 1px solid #e6e6ec;
      border-radius: 16px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06);
      transition: box-shadow 0.2s, transform 0.2s;
      display: flex; flex-direction: column;
      overflow: hidden;
    }
    .out-grid-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.09);
      transform: translateY(-1px);
    }
    .out-chip {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 12.5px; font-weight: 600; color: #4a4a58;
      background: #fff; border: 1px solid #e6e6ec;
      border-radius: 100px; padding: 5px 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .out-sort-group {
      display: inline-flex; align-items: center;
      background: #fff; border-radius: 100px;
      border: 1px solid rgba(0,0,0,0.08);
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 14px rgba(0,0,0,0.06);
      padding: 3px; gap: 2px;
    }
    .out-sort-btn {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12.5px; font-weight: 600;
      padding: 7px 14px; border-radius: 100px;
      border: none; cursor: pointer; background: transparent;
      color: #52525b;
      transition: all 0.18s;
    }
    .out-sort-btn:hover:not(.active) { color: #111114; }
    .out-sort-btn.active {
      background: #e5251b; color: #fff;
      box-shadow: 0 1px 3px rgba(229,37,27,0.35);
    }
    .out-cta {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      padding: 10px 16px; border-radius: 100px; border: none;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 13px; font-weight: 700;
      background: #e5251b; color: #fff; cursor: pointer;
      transition: filter 0.15s, transform 0.15s, box-shadow 0.15s;
      box-shadow: 0 1px 3px rgba(229,37,27,0.32), 0 4px 14px rgba(229,37,27,0.22);
      letter-spacing: 0.01em;
    }
    .out-cta:hover {
      filter: brightness(1.08); transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(229,37,27,0.38), 0 8px 24px rgba(229,37,27,0.28);
    }

    .out-tab-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 9px 18px; border-radius: 100px;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12.5px; font-weight: 600;
      background: transparent; color: #4a4a58;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.18s;
      letter-spacing: -0.1px;
    }
    .out-tab-btn:hover { color: #0f0f13; background: rgba(15,15,19,0.04); }
    .out-tab-btn.active {
      background: #ffffff; color: #0f0f13;
      border-color: rgba(0,0,0,0.09);
      box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
    }

    .out-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 9px 20px; border-radius: 100px; border: 1px solid rgba(0,0,0,0.1);
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12.5px; font-weight: 600;
      background: #ffffff; color: #4a4a58; cursor: pointer;
      box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
      transition: all 0.18s;
      white-space: nowrap;
    }
    .out-btn:hover:not(:disabled) {
      border-color: rgba(0,0,0,0.18); color: #0f0f13;
      box-shadow: 0 2px 8px rgba(0,0,0,0.10), 0 8px 28px rgba(0,0,0,0.10);
      transform: translateY(-1px);
    }
    .out-btn:disabled { opacity: 0.55; cursor: not-allowed; }

    .out-btn-primary {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 9px 20px; border-radius: 100px; border: none;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12.5px; font-weight: 700;
      background: #e5251b; color: #ffffff; cursor: pointer;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32);
      transition: all 0.18s;
      letter-spacing: -0.1px;
      white-space: nowrap;
    }
    .out-btn-primary:hover:not(:disabled) {
      filter: brightness(1.07);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,37,27,0.42);
      transform: translateY(-1px);
    }
    .out-btn-primary:disabled {
      background: #e0e0e6; color: #ffffff; cursor: not-allowed;
      box-shadow: none; opacity: 0.92;
    }

    .out-search-input {
      width: 100%;
      padding: 14px 16px;
      font-size: 15px;
      border: 1px solid #e6e6ec;
      border-radius: 12px;
      font-family: inherit;
      outline: none;
      color: #0f0f13;
      background: #ffffff;
      transition: border-color 0.18s, box-shadow 0.18s;
      letter-spacing: -0.1px;
      font-weight: 500;
      line-height: 1.4;
    }
    .out-search-input:focus {
      border-color: rgba(0,0,0,0.25);
      box-shadow: 0 0 0 4px rgba(0,0,0,0.04);
    }

    .out-modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      z-index: 100;
      animation: outFadeIn 0.18s ease both;
      padding: 32px 24px;
    }
    .out-modal {
      background: #f7f7fa;
      border: 1px solid #e8e8ec;
      border-radius: 20px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.10);
      width: 100%; max-width: 1280px;
      max-height: calc(100vh - 64px);
      overflow: auto;
      animation: outSlideIn 0.22s cubic-bezier(0.2, 0.7, 0.3, 1) both;
    }
    .out-modal::-webkit-scrollbar { width: 4px }
    .out-modal::-webkit-scrollbar-thumb { background: #e0e0e6; border-radius: 4px }
  `
  document.head.appendChild(s)
}

/* ─── Design tokens — matched to Dashboard.jsx + SeoOptimizer.jsx ────────── */
const C = {
  bg:          '#f5f5f9',
  card:        '#ffffff',
  border:      '#e6e6ec',
  borderLight: '#f0f0f4',
  text1:       '#0f0f13',
  text2:       '#4a4a58',
  text3:       '#9595a4',
  red:         '#e5251b',
  redBg:       '#fff5f5',
  redBdr:      '#fecaca',
  green:       '#059669',
  greenBg:     '#ecfdf5',
  greenBdr:    '#a7f3d0',
  amber:       '#d97706',
  amberBg:     '#fffbeb',
  amberBdr:    '#fde68a',
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function fmtNum(n) {
  if (n == null) return '—'
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}

function fmtDuration(seconds) {
  if (!seconds || seconds <= 0) return ''
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

/* YouTube serves 3 thumbnail sizes per video. We use the highest one that
   actually exists on a given video:
     1. maxresdefault.jpg  — 1280x720. Only present if the uploader gave YouTube
                             an HD master; missing on many older or low-quality
                             uploads.
     2. hqdefault.jpg      — 480x360. ALWAYS present on every YouTube video.
     3. {stored thumbnail} — whatever the search API returned (~320x180).
   The onError handler walks this cascade in order — invisible to the user. */
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
  } else {
    target.onerror = null
  }
}
function makeThumbOnError(videoId, fallbackUrl) {
  return (e) => _advanceThumb(e.target, videoId, fallbackUrl)
}
// YouTube returns a 120x90 grey placeholder (HTTP 200) when maxresdefault
// doesn't exist — onError never fires for it. Detect the placeholder
// dimensions in onLoad and walk the fallback cascade manually.
function makeThumbOnLoad(videoId, fallbackUrl) {
  return (e) => {
    const step = e.target.dataset.thumbStep || 'max'
    if (step === 'max' && e.target.naturalWidth === 120 && e.target.naturalHeight === 90) {
      _advanceThumb(e.target, videoId, fallbackUrl)
    }
  }
}

function relPublished(iso) {
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

function outlierTier(score) {
  if (score >= 10) return { label: '10× outlier',  color: C.red,   bg: C.redBg,   bdr: C.redBdr }
  if (score >= 5)  return { label: `${score}× outlier`, color: C.red,   bg: C.redBg,   bdr: C.redBdr }
  if (score >= 3)  return { label: `${score}× outlier`, color: C.amber, bg: C.amberBg, bdr: C.amberBdr }
  return           { label: `${score}× outlier`, color: C.green, bg: C.greenBg, bdr: C.greenBdr }
}

/* ─── Tabs ──────────────────────────────────────────────────────────────── */
const TABS = [
  { key: 'video',     label: 'Videos'     },
  { key: 'thumbnail', label: 'Thumbnails' },
  { key: 'channel',   label: 'Channels'   },
]

const PLACEHOLDER_BY_TAB = {
  video:     'e.g. morning routine, ai productivity, credit card tips',
  thumbnail: 'e.g. minimalist gaming setup, before/after transformation',
  channel:   'e.g. home cooking for beginners, personal finance india',
}

const EMPTY_SUBTITLE_BY_TAB = {
  video:     'Find videos that beat their channel-size peers on a topic. Pull out the hook that made them work.',
  thumbnail: 'Find thumbnails in your size bracket that out-clicked their peers. Borrow the winning visual patterns.',
  channel:   'Find channels your size that are punching above their weight on a topic. Study what they do differently.',
}

/* ─── Icon: sparkle (reused from Dashboard + SEO header) ─────────────────── */
const SparkIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/>
  </svg>
)

const SpinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    style={{ animation: 'outSpin 0.7s linear infinite', flexShrink: 0 }}>
    <path d="M11.5 6.5a5 5 0 1 0-5 5"/>
  </svg>
)

/* Persistence lives server-side now (outliers_search_cache table). We keep
   only the tab display preference in localStorage — results/query/intent come
   from /outliers/cache so they survive logout and device switches. */

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function Outliers({ channelData, onNavigate, plan, freeTierFeatures }) {
  // Free-tier feature flag — Outliers is fully gated for free users. All
  // hooks still declared below (React rules); the actual render-replace
  // happens at the bottom of the component.
  const outliersGated = (plan || 'free') === 'free'
    && (freeTierFeatures?.outliers === 'locked' || freeTierFeatures?.outliers === 'used')

  // Tab is purely a display-state choice now — switching tabs NEVER triggers a
  // new search. Persisted locally so the user returns to the same tab view.
  const [tab,    setTab]    = useState(() => {
    try { return localStorage.getItem('outliers_tab') || 'video' } catch { return 'video' }
  })
  const [query,          setQuery]         = useState('')
  const [loading,        setLoading]       = useState(false)
  const [loadingCache,   setLoadingCache]  = useState(true)    // initial load from /outliers/cache
  const [error,          setError]         = useState('')
  const [result,         setResult]        = useState(null)    // {videos, channels, keyword_scores, cohort, ...}
  const [active,         setActive]        = useState(null)
  const [sort,           setSort]          = useState('outlier')  // outlier | views | newest (for channels: outlier | subs | hits)

  // Intent-picker state
  const [loadingIntent,  setLoadingIntent] = useState(false)
  const [intentOptions,  setIntentOptions] = useState(null)
  const [manualIntent,   setManualIntent]  = useState('')      // the "type your own" textbox
  const reqIdRef = useRef(0)

  const inputRef = useRef(null)

  // On mount: fetch the server-side cached search. The DB is the source of
  // truth now — results survive refresh / logout / tab switch.
  useEffect(() => {
    // One-time cleanup — drop any leftover localStorage cache from the old
    // client-persisted version so ghost data doesn't leak into the new flow.
    try { localStorage.removeItem('outliers_v1') } catch {}
    let cancelled = false
    fetch('/outliers/cache', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (cancelled) return
        if (d && d.cached) {
          setResult(d.cached)
          setQuery(d.cached.query || '')
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingCache(false) })
    return () => { cancelled = true }
  }, [])

  // Persist tab choice (display preference only — not the result).
  useEffect(() => {
    try { localStorage.setItem('outliers_tab', tab) } catch {}
  }, [tab])

  // Clear stale intent picker when the user edits the query (matches SEO).
  const queryEditSinceMount = useRef(false)
  useEffect(() => {
    if (!queryEditSinceMount.current) { queryEditSinceMount.current = true; return }
    if (intentOptions !== null) setIntentOptions(null)
    if (manualIntent) setManualIntent('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const userSubs = channelData?.channel?.subscribers ?? 0

  // Step 1: fetch intent options, show picker. Falls back to direct search if no options.
  async function handleSubmit() {
    const q = query.trim()
    if (!q || loading || loadingIntent) return
    const myId = ++reqIdRef.current
    setLoadingIntent(true)
    setError('')
    setActive(null)
    setIntentOptions(null)
    setManualIntent('')
    try {
      const r = await fetch('/outliers/intent-options', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })
      if (myId !== reqIdRef.current) return
      const d = await r.json()
      if (myId !== reqIdRef.current) return
      if (!r.ok || !d.options?.length) {
        setLoadingIntent(false)
        await runSearch('', myId)
        return
      }
      setIntentOptions(d.options)
    } catch {
      if (myId !== reqIdRef.current) return
      setLoadingIntent(false)
      await runSearch('', myId)
      return
    } finally {
      if (myId === reqIdRef.current) setLoadingIntent(false)
    }
  }

  // Step 2: the actual search. Backend persists the result to the DB keyed by
  // channel_id — no more localStorage. confirmedKeyword can be a picked intent
  // option, a manually-typed intent (up to 160 chars), or empty (search as typed).
  async function runSearch(confirmedKeyword = '', existingId) {
    const q = query.trim()
    if (!q) return
    const myId = existingId != null ? existingId : ++reqIdRef.current
    if (existingId == null && loading) return
    setLoading(true)
    setError('')
    setIntentOptions(null)
    setManualIntent('')
    try {
      const r = await fetch('/outliers/search', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, confirmed_keyword: confirmedKeyword }),
      })
      if (myId !== reqIdRef.current) return
      const d = await r.json()
      if (myId !== reqIdRef.current) return
      if (!r.ok) {
        setError(d.error || 'Search failed.')
      } else {
        setResult(d)
      }
    } catch (e) {
      if (myId !== reqIdRef.current) return
      setError('Network error. Please try again.')
    } finally {
      if (myId === reqIdRef.current) setLoading(false)
    }
  }

  function handleSelectIntent(keyword) {
    runSearch(keyword)
  }

  function handleManualIntentSubmit() {
    const trimmed = manualIntent.trim().slice(0, 160)
    if (!trimmed) return
    runSearch(trimmed)
  }

  // "New search" / clear — also tells the backend to drop the saved search so
  // the next fresh mount doesn't reload it.
  function handleClear() {
    setQuery('')
    setResult(null)
    setError('')
    setActive(null)
    setIntentOptions(null)
    setManualIntent('')
    fetch('/outliers/cache', { method: 'DELETE', credentials: 'include' }).catch(() => {})
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  /* ─── Render ───────────────────────────────────────────────────────── */

  // Free-tier gate — replaces the entire page content with the shared upsell
  // modal. Hooks above still run on every render; this just swaps the JSX.
  if (outliersGated) {
    return (
      <div style={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 40, minHeight: '60vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <UpsellGate
          title="Unlock Outlier Scoring"
          description="See the thumbnails, titles, and channels actually winning in your niche right now — with a ranked outlier score so you know which to copy and which to ignore."
          bullets={[
            'Top outlier videos in your niche, ranked by performance vs. subs',
            'Winning thumbnail patterns distilled into a reusable formula',
            "Breakout channels and keyword opportunities you're missing",
          ]}
          note="Outlier Scoring requires 3 credits."
          showPackLink={false}
        />
      </div>
    )
  }

  return (
    <div style={{ width: '100%', fontFamily: "'Inter', system-ui, sans-serif", color: C.text1 }}>

      {/* ══ Header — Videos-tab pattern: H2 + stat chips + sort group + primary CTA ═══ */}
      {(() => {
        const hasResults = result?.videos?.length > 0 || result?.channels?.length > 0
        const videosCount   = result?.videos?.length || 0
        const channelsCount = result?.channels?.length || 0
        const poolSize      = result?.cohort?.pool_size || 0
        const verticalLabel = result?.cohort?.vertical || ''

        // Sort options are tab-aware — Channels has different facets from Videos/Thumbnails.
        const sortOptions = tab === 'channel'
          ? [
              { k: 'outlier', label: 'Top outliers' },
              { k: 'subs',    label: 'Most subs'    },
              { k: 'hits',    label: 'Most hits'    },
            ]
          : [
              { k: 'outlier', label: 'Top outliers' },
              { k: 'views',   label: 'Most views'   },
              { k: 'newest',  label: 'Newest'       },
            ]

        return (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: C.text1, letterSpacing: '-0.7px', marginBottom: 10 }}>Outliers</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {hasResults ? (
                  <>
                    <span className="out-chip"><span>🎯</span>{videosCount} outlier{videosCount === 1 ? '' : 's'}</span>
                    <span className="out-chip"><span>🏢</span>{channelsCount} breakout channel{channelsCount === 1 ? '' : 's'}</span>
                    <span className="out-chip"><span>📊</span>Niche pool · {poolSize}</span>
                    {verticalLabel && <span className="out-chip"><span>🧭</span>{verticalLabel}</span>}
                    <span className="out-chip"><span>🗓</span>Last 12 months</span>
                  </>
                ) : (
                  <>
                    <span className="out-chip"><span>🎯</span>Over-performing videos</span>
                    <span className="out-chip"><span>🏢</span>Breakout channels</span>
                    <span className="out-chip"><span>🗓</span>Last 12 months</span>
                    <span className="out-chip"><span>⚡</span>3 credits per search</span>
                  </>
                )}
              </div>
            </div>
            {hasResults && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                <div className="out-sort-group">
                  {sortOptions.map(opt => (
                    <button
                      key={opt.k}
                      onClick={() => setSort(opt.k)}
                      className={`out-sort-btn${sort === opt.k ? ' active' : ''}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button onClick={handleClear} className="out-cta" style={{ flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="5.5" cy="5.5" r="3.5"/><path d="M10 10l-2-2"/>
                  </svg>
                  New search
                </button>
              </div>
            )}
          </div>
        )
      })()}

      {/* ══ Tabs ═════════════════════════════════════════════════════════════ */}
      <div style={{
        display: 'inline-flex', gap: 4, padding: 4,
        background: '#eeeef3', borderRadius: 100, marginBottom: 16,
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`out-tab-btn${tab === t.key ? ' active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ Search bar ═══════════════════════════════════════════════════════ */}
      <div className="out-card" style={{ padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Your video title
          </span>
          <span style={{ fontSize: 11, fontWeight: 500, color: C.text3 }}>
            One search powers all three tabs · filtered by intent
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
            placeholder="e.g. How I grew my YouTube channel to 10k subscribers"
            className="out-search-input"
            disabled={loading || loadingIntent}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || loadingIntent || !query.trim()}
            className="out-btn-primary"
            style={{ fontSize: 13, padding: '11px 22px', flexShrink: 0 }}
          >
            {loadingIntent
              ? <><SpinIcon /> Reading intent…</>
              : loading
                ? <><SpinIcon /> Searching…</>
                : <><SparkIcon /> Find outliers</>
            }
          </button>
        </div>

        {error && (
          <div style={{
            marginTop: 12, display: 'flex', alignItems: 'flex-start', gap: 8,
            fontSize: 12.5, color: C.red, background: C.redBg,
            border: `1px solid ${C.redBdr}`, borderRadius: 9,
            padding: '9px 12px', lineHeight: 1.4,
          }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
              <circle cx="6.5" cy="6.5" r="5"/><path d="M6.5 4v3M6.5 9v.5"/>
            </svg>
            {error}
          </div>
        )}
      </div>

      {/* ══ Intent picker — shown between intent fetch and actual search.
           Same pattern as SEO Optimizer (three routes, click one to commit). ══ */}
      {intentOptions && !loading && !result && (
        <div className="out-section" style={{ marginBottom: 16, marginTop: 8 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={C.red} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2v12M2 8h12M4 4l8 8M12 4l-8 8"/>
              </svg>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: C.red, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Three directions</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text1, letterSpacing: '-0.55px', lineHeight: 1.2, marginBottom: 10 }}>
              Your search could go <span style={{ color: C.red }}>3 ways</span>. Pick one.
            </h2>
            <p style={{ fontSize: 13.5, color: C.text3, lineHeight: 1.6, maxWidth: 540, margin: '0 auto' }}>
              Same words, different niches. Pick the closest — that's the outlier cohort we'll pull.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
            {intentOptions.map((opt, i) => (
              <button key={i} className="out-result-card" onClick={() => handleSelectIntent(opt.keyword)}
                style={{ flexDirection: 'column', padding: 18, cursor: 'pointer', display: 'flex', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{
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
                <p style={{ fontSize: 16, fontWeight: 700, color: C.text1, letterSpacing: '-0.3px', lineHeight: 1.35, marginBottom: 10 }}>
                  {opt.label}
                </p>
                <span style={{
                  alignSelf: 'flex-start',
                  fontSize: 11.5, fontWeight: 600,
                  color: '#9a1c16',
                  background: 'rgba(229,37,27,0.08)',
                  border: '1px solid rgba(229,37,27,0.22)',
                  padding: '3px 10px', borderRadius: 999,
                  marginBottom: 12,
                }}>
                  {opt.keyword}
                </span>
                <p style={{ fontSize: 12.5, color: C.text3, lineHeight: 1.55, flex: 1 }}>
                  {opt.description}
                </p>
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.red, letterSpacing: '-0.1px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Go this way
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M6 3l5 5-5 5"/>
                    </svg>
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Manual-intent option — not in SEO Optimizer, unique to Outliers.
              Up to 160 chars of user-typed intent, used verbatim as confirmed_keyword. */}
          <div className="out-card" style={{ padding: '18px 20px', marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                None of these? Type your own intent
              </span>
              <span style={{ fontSize: 11, fontWeight: 500, color: manualIntent.length > 160 ? C.red : C.text3, fontVariantNumeric: 'tabular-nums' }}>
                {manualIntent.length}/160
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                value={manualIntent}
                maxLength={160}
                onChange={e => setManualIntent(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleManualIntentSubmit() }}
                placeholder="e.g. home office organization for remote workers"
                className="out-search-input"
                disabled={loading}
                style={{ flex: 1 }}
              />
              <button
                onClick={handleManualIntentSubmit}
                disabled={loading || !manualIntent.trim()}
                className="out-btn-primary"
                style={{ fontSize: 13, padding: '11px 22px', flexShrink: 0 }}
              >
                {loading ? <><SpinIcon /> Searching…</> : <><SparkIcon /> Use this intent</>}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
            <button onClick={() => runSearch('')} className="out-btn">
              Or search as typed
            </button>
          </div>
        </div>
      )}

      {/* ══ Empty state (pre-search) ═════════════════════════════════════════ */}
      {!loading && !loadingIntent && !loadingCache && !intentOptions && !error && !result && (
        <div className="out-card out-section" style={{
          padding: '40px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', gap: 12,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: C.redBg, border: `1px solid ${C.redBdr}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: C.red,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
            </svg>
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.text1, letterSpacing: '-0.3px' }}>
            Find what's working in your size bracket
          </p>
          <p style={{ fontSize: 13, color: C.text2, maxWidth: 420, lineHeight: 1.6 }}>
            {EMPTY_SUBTITLE_BY_TAB[tab]}
          </p>
        </div>
      )}

      {/* ══ Loading state ════════════════════════════════════════════════════ */}
      {loading && (
        <div className="out-card out-section" style={{
          padding: '48px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', gap: 14,
        }}>
          <div style={{
            width: 32, height: 32,
            border: `2.5px solid ${C.border}`, borderTop: `2.5px solid ${C.red}`,
            borderRadius: '50%', animation: 'outSpin 0.7s linear infinite',
          }}/>
          <p style={{ fontSize: 13, color: C.text3, fontWeight: 500 }}>
            Scanning YouTube and scoring against your peers…
          </p>
        </div>
      )}

      {/* ══ No-results state ═════════════════════════════════════════════════ */}
      {!loading && !error && result && !result.videos?.length && !result.channels?.length && (
        <div className="out-card out-section" style={{
          padding: '40px 32px', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.text1, letterSpacing: '-0.3px' }}>
            No outliers found
          </p>
          <p style={{ fontSize: 13, color: C.text2, maxWidth: 380, lineHeight: 1.6 }}>
            {result.message || 'Try a broader title, or pick a different intent.'}
          </p>
        </div>
      )}

      {/* ══ Results — one search, three tab views of the same payload ════════ */}
      {!loading && (result?.videos?.length > 0 || result?.channels?.length > 0) && (() => {
        // Each tab reads from its own slice of the payload.
        // • Videos tab:     result.videos     — ranked by outlier score
        // • Thumbnails tab: result.thumbnails — ranked by vision click-worthiness
        //   (falls back to result.videos if the vision call failed)
        // • Channels tab:   result.channels   — the breakout-channel pool
        const raw =
          tab === 'channel'   ? (result.channels || []) :
          tab === 'thumbnail' ? (result.thumbnails || result.videos || []) :
                                (result.videos || [])
        // Tab-aware sort (falls back to outlier score if the current sort key
        // doesn't apply to this tab, e.g. switching videos -> channels).
        const items = [...raw].sort((a, b) => {
          if (tab === 'channel') {
            if (sort === 'subs') return (b.subscribers || 0) - (a.subscribers || 0)
            if (sort === 'hits') return (b.videos_in_search || 0) - (a.videos_in_search || 0)
            return (b.outlier_score || 0) - (a.outlier_score || 0)
          }
          if (sort === 'views')  return (b.views || 0) - (a.views || 0)
          if (sort === 'newest') return (new Date(b.published_at || 0).getTime()) - (new Date(a.published_at || 0).getTime())
          return (b.outlier_score || 0) - (a.outlier_score || 0)
        })
        return (
          <div className="out-section">
            {/* Thumbnails tab: niche visual-pattern report lives above the grid */}
            {tab === 'thumbnail' && result.thumbnail_patterns && (
              <ThumbnailPatternsCard patterns={result.thumbnail_patterns} query={result.cohort?.query} />
            )}

            {items.length === 0 ? (
              <div className="out-card" style={{ padding: '28px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>
                  {tab === 'channel'
                    ? 'No breakout channels surfaced in this search. The Videos and Thumbnails tabs still have results.'
                    : 'No results for this tab. Try another tab.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
                {items.map(item => (
                  tab === 'channel'
                    ? <ChannelResultCard key={item.channel_id} item={item} onOpen={() => setActive(item)} />
                    : <VideoResultCard   key={item.video_id}   item={item} kind={tab} onOpen={() => setActive(item)} />
                ))}
              </div>
            )}
          </div>
        )
      })()}

      {/* ══ Detail modal ═════════════════════════════════════════════════════ */}
      {active && (
        <DetailModal
          kind={tab}
          item={active}
          query={result?.cohort?.query || query}
          onClose={() => setActive(null)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  )
}

/* ─── Video / thumbnail result card ───────────────────────────────────────
   Visual language copied from Dashboard.jsx Videos tab (.ytg-card):
   - White card, 16px radius, soft shadow, hover lift
   - Full-width 16:9 thumbnail with rounded top corners
   - Bottom-right duration pill, top-left SHORT pill replaced by OUTLIER pill
   - Body: title (16/700) → meta line (views · subs · relTime) → footer
     separated by a 1px hairline with a 3-metric grid + full-width CTA
   Content adapted to Outliers: OUTLIER / VIEWS-PER-SUB / ENG rather than
   Watch / Retention / Eng (those only apply to the user's own videos).
   ──────────────────────────────────────────────────────────────────────── */
function VideoResultCard({ item, kind, onOpen }) {
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
      {/* Thumbnail — YouTube link, matching Videos tab */}
      <a href={ytUrl || '#'} target="_blank" rel="noopener noreferrer"
        onClick={e => { if (!ytUrl) e.preventDefault() }}
        style={{ display: 'block', position: 'relative', textDecoration: 'none', flexShrink: 0, borderRadius: '15px 15px 0 0', overflow: 'hidden' }}>
        {/* Max-resolution thumbnail — uses maxresdefault.jpg (1280x720) where
            the uploader supplied an HD master, else cascades through
            hqdefault.jpg (480x360, always present) and finally the stored
            search-API thumbnail. Any card always renders the sharpest image
            YouTube has for this video. */}
        {(item.video_id || item.thumbnail)
          ? <img
              src={item.video_id ? ytMaxThumbUrl(item.video_id) : item.thumbnail}
              alt=""
              style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
              onError={makeThumbOnError(item.video_id, item.thumbnail)}
              onLoad={makeThumbOnLoad(item.video_id, item.thumbnail)}
            />
          : <div style={{ width: '100%', aspectRatio: '16/9', background: '#ebebef' }}/>
        }
        {/* SHORT / duration badges — identical to Videos tab. Outlier signal
            lives in the footer's OUTLIER metric, not on the thumbnail, so the
            thumbnail stays as clean as the Videos tab's. */}
        {isShort && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: '#111', color: '#fff', fontSize: 12, fontWeight: 800, padding: '2px 6px', borderRadius: 4, letterSpacing: '0.06em' }}>SHORT</span>
        )}
        {durLabel && (
          <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.72)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '2px 7px', borderRadius: 5, fontVariantNumeric: 'tabular-nums' }}>{durLabel}</span>
        )}
      </a>

      {/* Body — identical to Videos tab: title → meta line (3 items separated
          by dots, bold values) → footer hairline + 3 metrics + red CTA. */}
      <div style={{ padding: '20px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Title — same 16/700/-0.3ls/2-line clamp as Videos tab */}
        <p style={{
          fontSize: 16, fontWeight: 700, color: C.text1, lineHeight: 1.4, marginBottom: 12, letterSpacing: '-0.3px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{item.title}</p>

        {/* Channel name — its own line under the title, slightly heavier weight
            than the meta line below so it reads as a byline ("who made this"),
            not as a stat. */}
        <p style={{
          fontSize: 13, fontWeight: 600, color: C.text2, marginBottom: 8, letterSpacing: '-0.1px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{item.channel_name}</p>

        {/* Meta line — views · relTime. 2 items instead of 3 now that channel
            name has its own line. Matches the Videos tab meta typography. */}
        <p style={{ fontSize: 13.5, fontWeight: 500, color: C.text3, marginBottom: 16, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ color: C.text2, fontWeight: 600 }}>{fmtNum(views)}</span> views
          <span style={{ margin: '0 8px', color: '#d4d4dc' }}>·</span>
          {relPublished(item.published_at) || '—'}
        </p>

        {/* Footer — metrics cluster LEFT (not spread across full width) so
            the labels sit close to their values and don't feel stranded. */}
        <div style={{ marginTop: 'auto', paddingTop: 18, borderTop: '1px solid #eeeef3' }}>
          <div style={{ display: 'flex', gap: 28, marginBottom: 18, flexWrap: 'wrap' }}>
            {[
              { label: 'Outlier', display: `${item.outlier_score}×`,                                                       color: tier.color, tip: 'How many times this video beat its niche cohort\'s median views-per-subscriber. 5×+ is breakout.' },
              { label: 'VPS',     display: vpsDisplay,                                                                     color: C.text1,    tip: 'Views per subscriber — normalises out raw channel size so small-channel wins show up.' },
              { label: 'Eng',     display: engPct != null ? `${engPct.toFixed(1)}%` : '—',                                  color: engColor,   tip: 'Engagement rate = likes ÷ views. 3%+ strong, 1–3% avg, <1% weak.' },
            ].map(m => (
              <div key={m.label} title={m.tip} style={{ cursor: 'help', textAlign: 'left' }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 7, lineHeight: 1 }}>{m.label}</p>
                <p style={{ fontSize: 17, fontWeight: 800, color: m.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.4px', lineHeight: 1 }}>{m.display}</p>
              </div>
            ))}
          </div>
          <button
            onClick={onOpen}
            style={{
              width: '100%', justifyContent: 'center',
              padding: '11px 16px', fontSize: 13.5, fontWeight: 700,
              border: 'none', borderRadius: 100, cursor: 'pointer',
              background: C.red, color: '#fff',
              fontFamily: 'inherit', letterSpacing: '0.01em',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              transition: 'filter 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Channel result card — channel-identity design, NOT a video thumbnail.
   Purpose: make the Channels tab visually distinct from Videos / Thumbnails
   so users don't feel they're looking at the same results three times.

   Layout (uses our own tokens, not copied from Videos tab):
     - Red-to-amber soft gradient banner (72px, no image) signals "channel
       profile" the way YouTube channel pages do
     - Channel avatar (72x72 circle, 4px white ring) overlaps the banner
       bottom, same visual cue as YT's channel header
     - Channel name + @handle byline
     - 2-line description clamp
     - Meta line (subs · videos)
     - 3-metric row (Outlier / Hits / Avg views) and red CTA — same footer
       shape as VideoResultCard for brand consistency
   ──────────────────────────────────────────────────────────────────────── */
function ChannelResultCard({ item, onOpen }) {
  const tier    = outlierTier(item.outlier_score)
  const hits    = item.videos_in_search || 0
  const initial = (item.channel_name || '?')[0].toUpperCase()
  const ytUrl   = item.channel_id ? `https://www.youtube.com/channel/${item.channel_id}` : null
  const handle  = (item.handle || '').replace(/^@/, '')
  const [avatarFailed, setAvatarFailed] = useState(false)

  return (
    <div className="out-grid-card">
      {/* Gradient banner — no video thumbnail; soft red→amber wash that reads
          as "channel page" instead of "video card". Small user icon top-right
          reinforces that this is a profile, not content. */}
      <a href={ytUrl || '#'} target="_blank" rel="noopener noreferrer"
        onClick={e => { if (!ytUrl) e.preventDefault() }}
        style={{
          display: 'block', position: 'relative', textDecoration: 'none',
          flexShrink: 0, borderRadius: '15px 15px 0 0', overflow: 'hidden',
          height: 72,
          background: `linear-gradient(135deg, ${C.redBg} 0%, #fff0e4 50%, ${C.amberBg} 100%)`,
        }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
          style={{ position: 'absolute', top: 12, right: 14, opacity: 0.55 }}>
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
        </svg>
      </a>

      {/* Body — avatar overlaps the banner via negative marginTop */}
      <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Channel avatar — 72x72 circle, 4px white ring, overlaps banner.
            `position: relative` + absolute-positioned child guarantees the
            image fills the full circle regardless of box-sizing or flex
            quirks (an earlier flex-based centering version was rendering the
            image only half-height, leaving the bottom showing through). */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          overflow: 'hidden',
          border: '4px solid #fff',
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
                fontSize: 28, fontWeight: 700, color: C.red,
              }}>{initial}</span>
          }
        </div>

        {/* Channel name — same 16/700/-0.3ls as VideoResultCard title */}
        <p style={{
          fontSize: 16, fontWeight: 700, color: C.text1, lineHeight: 1.35, marginBottom: 3, letterSpacing: '-0.3px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{item.channel_name}</p>

        {/* @handle byline — sits where VideoResultCard puts the channel name */}
        {handle ? (
          <p style={{
            fontSize: 13, fontWeight: 500, color: C.text3, marginBottom: 10, letterSpacing: '-0.05px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>@{handle}</p>
        ) : (
          <p style={{ fontSize: 13, color: C.text3, marginBottom: 10 }}>&nbsp;</p>
        )}

        {/* Description — 2-line clamp, fixed minHeight so every card is same height */}
        <p style={{
          fontSize: 13, fontWeight: 500, color: C.text3, lineHeight: 1.5, marginBottom: 14,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          minHeight: 39,
        }}>{item.description || '—'}</p>

        {/* Meta line — subs · videos, same typography as VideoResultCard meta */}
        <p style={{ fontSize: 13.5, fontWeight: 500, color: C.text3, marginBottom: 14, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ color: C.text2, fontWeight: 600 }}>{fmtNum(item.subscribers)}</span> subs
          <span style={{ margin: '0 8px', color: '#d4d4dc' }}>·</span>
          <span style={{ color: C.text2, fontWeight: 600 }}>{fmtNum(item.video_count)}</span> videos
        </p>

        {/* Footer — identical to VideoResultCard: flex metrics + full-width red CTA */}
        <div style={{ marginTop: 'auto', paddingTop: 18, borderTop: '1px solid #eeeef3' }}>
          <div style={{ display: 'flex', gap: 28, marginBottom: 18, flexWrap: 'wrap' }}>
            {[
              { label: 'Outlier',  display: `${item.outlier_score}×`,            color: tier.color, tip: 'Their best-performing video in this search beat the niche median by this multiple.' },
              { label: 'Hits',     display: String(hits),                         color: C.text1,    tip: 'Number of videos from this channel that surfaced in your search — higher = more on-topic.' },
              { label: 'Avg views', display: fmtNum(item.avg_views_per_video),    color: C.text1,    tip: 'Average views per video across this channel\'s entire catalog.' },
            ].map(m => (
              <div key={m.label} title={m.tip} style={{ cursor: 'help', textAlign: 'left' }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 7, lineHeight: 1 }}>{m.label}</p>
                <p style={{ fontSize: 17, fontWeight: 800, color: m.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.4px', lineHeight: 1 }}>{m.display}</p>
              </div>
            ))}
          </div>
          <button
            onClick={onOpen}
            style={{
              width: '100%', justifyContent: 'center',
              padding: '11px 16px', fontSize: 13.5, fontWeight: 700,
              border: 'none', borderRadius: 100, cursor: 'pointer',
              background: C.red, color: '#fff',
              fontFamily: 'inherit', letterSpacing: '0.01em',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              transition: 'filter 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            Analyze channel
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Detail modal with quick actions ────────────────────────────────────── */
function DetailModal({ kind, item, query, onClose, onNavigate }) {
  const [addState, setAddState] = useState('idle') // idle | adding | added | error
  const [addError, setAddError] = useState('')

  // Close on ESC
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const isChannel = kind === 'channel'

  const youTubeUrl = isChannel
    ? `https://www.youtube.com/channel/${item.channel_id}`
    : `https://www.youtube.com/watch?v=${item.video_id}`

  function openOnYouTube() {
    window.open(youTubeUrl, '_blank', 'noopener,noreferrer')
  }

  function remixTitle() {
    try { localStorage.setItem('ytg_prefill_title', item.title || '') } catch {}
    if (onNavigate) onNavigate('SEO Studio')
  }

  function remixThumbnail() {
    const idea = {
      title:         item.title || '',
      targetKeyword: query || '',
      angle:         item.explanation || '',
    }
    try { localStorage.setItem('ytg_prefill_idea', JSON.stringify(idea)) } catch {}
    if (onNavigate) onNavigate('Thumbnail Score')
  }

  async function addAsCompetitor() {
    const channelId = isChannel ? item.channel_id : item.channel_id
    if (!channelId) return
    setAddState('adding')
    setAddError('')
    try {
      const r = await fetch(`/competitors/analyze/${channelId}`, { credentials: 'include' })
      const d = await r.json()
      if (!r.ok || !d.competitor) {
        setAddState('error')
        setAddError(d.error || 'Failed to add competitor.')
        return
      }
      setAddState('added')
    } catch (e) {
      setAddState('error')
      setAddError('Network error.')
    }
  }

  // ── Metric computation (honest signals drawn from fields we already have) ──
  const views   = item.views || 0
  const likes   = item.likes || 0
  const engPct  = views > 0 ? (likes / views * 100) : 0
  const days    = item.published_at ? Math.max(0, (Date.now() - new Date(item.published_at).getTime()) / 86400000) : null
  const verdict = item.outlier_score >= 5 ? { label: 'Strong',      color: C.red   }
                 : item.outlier_score >= 3 ? { label: 'Notable',     color: C.amber }
                 : item.outlier_score >= 1.8 ? { label: 'Over median', color: C.green }
                 : { label: 'Subtle', color: C.text3 }

  const outlierPct = Math.min(100, Math.round((item.outlier_score || 0) * 20))
  const engScore   = Math.min(100, Math.round(engPct * 20))  // 5% = 100
  const recencyScore = days == null ? 40
                     : days <= 30  ? 100
                     : days <= 90  ? 80
                     : days <= 180 ? 60
                     : days <= 365 ? 35
                     : 15
  const subs       = isChannel ? (item.subscribers || 0) : (item.channel_subscribers || 0)
  const reachScore = subs <= 0 ? 0 : Math.min(100, Math.round(Math.log10(Math.max(1, subs)) * 16))  // ~1M = 100, 100k = 80, 10k = 64
  const nicheScore = item.is_niche_matched ? 85 : 45

  const bars = isChannel
    ? [
        { label: 'Outlier strength',  score: outlierPct,                                                                                 tip: 'Best video in this search vs the niche median (5× = max).' },
        { label: 'Catalog momentum',  score: Math.min(100, (item.videos_in_search || 0) * 16),                                            tip: 'How many of this channel\'s videos surfaced in your search.' },
        { label: 'Reach',              score: reachScore,                                                                                 tip: 'Subscriber-count-based reach on a log scale.' },
        { label: 'Niche fit',          score: nicheScore,                                                                                 tip: 'Whether this channel\'s recent uploads overlap your search vertical.' },
      ]
    : [
        { label: 'Outlier strength',  score: outlierPct,    tip: 'Views per subscriber vs niche median (5× = max).' },
        { label: 'Engagement',         score: engScore,     tip: 'Likes ÷ views scaled — 5%+ is a ceiling.' },
        { label: 'Recency',            score: recencyScore, tip: 'Newer videos score higher (0–30 days = max).' },
        { label: 'Niche fit',          score: nicheScore,   tip: 'Whether the posting channel\'s content overlaps your niche.' },
      ]

  const kindLabel = isChannel
    ? 'Breakout channel'
    : kind === 'thumbnail' ? 'Winning thumbnail' : 'Outlier video'

  // Max-res header thumbnail — same cascade as VideoResultCard:
  // maxresdefault (1280x720) → hqdefault (480x360) → stored medium.
  const headerVideoId = isChannel ? item.top_video_id : item.video_id
  const headerThumbHi = ytMaxThumbUrl(headerVideoId)
  const headerThumbLo = isChannel ? (item.top_video_thumbnail || item.thumbnail) : item.thumbnail
  const headerThumb   = headerThumbHi || headerThumbLo
  const headerTitle   = isChannel ? item.channel_name : item.title

  // ── Action buttons used in the bottom row ─────────────────────────────
  const actionList = isChannel
    ? [
        { label: 'Open on YouTube',    onClick: openOnYouTube },
        { label: addState === 'added' ? 'Added ✓' : addState === 'adding' ? 'Adding…' : 'Add as competitor',
          onClick: addAsCompetitor, disabled: addState === 'adding' || addState === 'added', success: addState === 'added' },
      ]
    : [
        { label: 'Open on YouTube', onClick: openOnYouTube },
        { label: 'Remix title',     onClick: remixTitle },
        { label: 'Remix thumbnail', onClick: remixThumbnail },
        { label: addState === 'added' ? 'Added ✓' : addState === 'adding' ? 'Adding…' : 'Add channel as competitor',
          onClick: addAsCompetitor, disabled: addState === 'adding' || addState === 'added', success: addState === 'added' },
      ]

  return (
    <div className="out-modal-overlay" onClick={onClose}>
      <div className="out-modal" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px 28px' }}>

          {/* Header — same silhouette as VideoOptimizePanel.jsx:453-477 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${C.borderLight}` }}>
            {headerThumb
              ? <img src={headerThumb} alt=""
                  style={{ width: 96, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: `1px solid ${C.border}` }}
                  onError={makeThumbOnError(headerVideoId, headerThumbLo)}
                  onLoad={makeThumbOnLoad(headerVideoId, headerThumbLo)}/>
              : <div style={{ width: 96, height: 60, borderRadius: 8, background: '#eeeef3', flexShrink: 0, border: `1px solid ${C.border}` }}/>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{kindLabel}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.text1, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{headerTitle}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={openOnYouTube}
                style={{ fontSize: 12, color: C.text2, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 100, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                Open on YouTube
              </button>
              <button onClick={onClose}
                style={{ fontSize: 12, color: C.text3, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 100, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                Close ✕
              </button>
            </div>
          </div>

          {/* Why Now hero — same "Fix first" card silhouette (white bg, red left-bar) */}
          {item.why_now && (
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.red}`, borderRadius: 12, padding: '14px 18px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: C.red, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Why now</span>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.text1, lineHeight: 1.55 }}>{item.why_now}</p>
            </div>
          )}

          {/* Breakdown Section — same silhouette as "Title Analysis" */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 22px', marginBottom: 12 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.text1, letterSpacing: '-0.3px', marginBottom: 16 }}>
              {isChannel ? 'Channel breakdown' : 'Outlier breakdown'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, marginBottom: 18 }}>
              {/* Ring + verdict + niche pill */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <OutlierRing score={item.outlier_score} color={verdict.color}/>
                <span style={{ fontSize: 14, fontWeight: 700, color: verdict.color }}>{verdict.label}</span>
                {query && (
                  <span style={{ fontSize: 12, color: '#2563eb', background: '#eff6ff', padding: '3px 10px', borderRadius: 100, fontWeight: 600, border: '1px solid #bfdbfe' }}>
                    {query}
                  </span>
                )}
                <span style={{ fontSize: 12, color: C.text3, fontVariantNumeric: 'tabular-nums' }}>
                  {isChannel
                    ? `${item.videos_in_search || 0} hit${(item.videos_in_search || 0) === 1 ? '' : 's'} in search`
                    : `${fmtNum(views)} views`}
                </span>
              </div>

              {/* Breakdown bars */}
              <div>
                {bars.map((b, i) => (
                  <OutlierBar key={i} label={b.label} score={b.score} tip={b.tip}/>
                ))}
              </div>
            </div>
          </div>

          {/* 3-col intent grid — same silhouette as Search Intent / Competitor Gap / Emotional Driver */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 22px', marginBottom: 12 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.text1, letterSpacing: '-0.3px', marginBottom: 16 }}>
              {isChannel ? 'Channel playbook' : 'Outlier playbook'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 8 }}>

              {/* Blue — Why it worked / Why this channel */}
              <div style={{ background: 'rgba(79,134,247,0.07)', border: '1px solid rgba(79,134,247,0.12)', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#4a7cf7', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                  {isChannel ? 'Why this channel' : 'Why it worked'}
                </p>
                <p style={{ fontSize: 13, color: C.text1, lineHeight: 1.65 }}>
                  {(isChannel ? item.why_this_channel : item.why_worked) || item.explanation || '—'}
                </p>
              </div>

              {/* Amber — Quick actions / What to do (list) */}
              <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.amber}`, borderRadius: '0 10px 10px 0', padding: '12px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.amber, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                  {isChannel ? 'What to do' : 'Quick actions'}
                </p>
                {(() => {
                  const list = (isChannel ? item.what_to_do : item.quick_actions) || []
                  if (!list.length) return <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.6 }}>—</p>
                  return (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {list.map((s, i) => (
                        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.amber, fontVariantNumeric: 'tabular-nums', lineHeight: 1.55, minWidth: 14 }}>{i + 1}.</span>
                          <span style={{ fontSize: 13, color: C.text1, lineHeight: 1.6, flex: 1 }}>{s}</span>
                        </li>
                      ))}
                    </ul>
                  )
                })()}
              </div>

              {/* Green — Why now (same text as hero; keeps the 3-col symmetry) */}
              <div style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.14)', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Act on this because
                </p>
                <p style={{ fontSize: 13, color: C.text1, lineHeight: 1.65 }}>
                  {item.why_now || 'This result is fresh in your niche — move on it while the topic is still climbing.'}
                </p>
              </div>

            </div>
          </div>

          {/* Actions Section — same card silhouette, full-width button row */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 22px' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.text1, letterSpacing: '-0.3px', marginBottom: 16 }}>Shortcuts</p>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${actionList.length}, minmax(0, 1fr))`, gap: 10 }}>
              {actionList.map((a, i) => (
                <button
                  key={i}
                  onClick={a.onClick}
                  disabled={a.disabled}
                  style={{
                    fontSize: 13, fontWeight: 700,
                    padding: '11px 16px', borderRadius: 100,
                    background: a.success ? C.greenBg : C.red,
                    color: a.success ? C.green : '#fff',
                    border: a.success ? `1px solid ${C.greenBdr}` : 'none',
                    cursor: a.disabled ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: a.success ? 'none' : '0 1px 3px rgba(229,37,27,0.32), 0 4px 14px rgba(229,37,27,0.22)',
                    transition: 'filter 0.15s, transform 0.15s',
                    opacity: a.disabled && !a.success ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { if (!a.disabled && !a.success) e.currentTarget.style.filter = 'brightness(1.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
                >
                  {a.label}
                </button>
              ))}
            </div>
            {addError && (
              <p style={{ marginTop: 10, fontSize: 12, color: C.red, background: C.redBg, border: `1px solid ${C.redBdr}`, borderRadius: 9, padding: '8px 11px', lineHeight: 1.4 }}>
                {addError}
              </p>
            )}
            {addState === 'added' && (
              <p style={{ marginTop: 10, fontSize: 11.5, color: C.text3, lineHeight: 1.5 }}>
                Open the Competitors tab to see the full analysis.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Score ring — outlier variant of VideoOptimizePanel's ScoreRing ──────── */
function OutlierRing({ score, color }) {
  const val   = Math.max(0, Math.min(10, score || 0))
  const r     = 34
  const circ  = 2 * Math.PI * r
  const pct   = Math.min(100, (val / 5) * 100)  // 5×+ = full ring
  const filled = (pct / 100) * circ
  return (
    <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
      <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="44" cy="44" r={r} fill="none" stroke="#f0f0f4" strokeWidth="6" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-1px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{val.toFixed(1)}</span>
        <span style={{ fontSize: 9.5, color: '#9595a4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: 3, lineHeight: 1 }}>× outlier</span>
      </div>
    </div>
  )
}

/* ─── Bar — copied from VideoOptimizePanel's BreakdownBar ─────────────────── */
function OutlierBar({ label, score, tip }) {
  const [showWhy, setShowWhy] = useState(false)
  const color = score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#e5251b'
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 14, color: '#3a3a3c', fontWeight: 500 }}>{label}</span>
          {tip && (
            <button onClick={() => setShowWhy(v => !v)}
              style={{ width: 15, height: 15, borderRadius: '50%', border: '1px solid #e8e8ec', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#8e8e93', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>?
            </button>
          )}
        </div>
        <span style={{ fontSize: 12, color, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{score}/100</span>
      </div>
      <div style={{ height: 5, background: '#f0f0f4', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>
      {showWhy && tip && (
        <p style={{ fontSize: 12, color: '#8e8e93', marginTop: 5, lineHeight: 1.5, paddingLeft: 8, borderLeft: '2px solid #e8e8ec' }}>
          {tip}
        </p>
      )}
    </div>
  )
}

/* ─── Thumbnails tab — niche visual-pattern report (tab-level, not per-row)
   Copies the Overview "Priority Actions" InsightCard silhouette exactly:
   3px amber top border, 26x26 amber badge, category eyebrow + title +
   outlined "N analysed" pill, hairline at marginLeft:46, 3-cell tinted
   body grid (blue / white+amber bar / green) at the same offset. One row,
   three cells — no stacked sub-sections, no nested tiles.
   ──────────────────────────────────────────────────────────────────────── */
function ThumbnailPatternsCard({ patterns, query }) {
  if (!patterns || (!patterns.dominant_style && !(patterns.recommendations || []).length)) {
    return null
  }
  const traits = [
    ['Dominant style', patterns.dominant_style],
    ['Text overlay',   patterns.text_overlay],
    ['Face presence',  patterns.face_presence],
    ['Color palette',  patterns.color_palette],
    ['Layout',         patterns.layout_pattern],
  ].filter(([, v]) => v && v.trim())
  const recs = patterns.recommendations || []

  return (
    <div className="out-card" style={{ padding: 0, marginBottom: 16, borderTop: `3px solid ${C.amber}` }}>
      <div style={{ padding: '16px 22px 18px' }}>

        {/* Header — same 3-column flex (badge | eyebrow+title | pill) as Priority Actions InsightCard */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingTop: 2 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1.5" y="2.5" width="11" height="9" rx="1.5"/>
                <circle cx="5" cy="6.5" r="1" fill="#fff" stroke="none"/>
                <path d="m2 10 2.5-2.5 2.5 2.5 1.5-1.5 2.5 2.5"/>
              </svg>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.amber, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
              Thumbnail pattern · last 12 months
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, lineHeight: 1.55 }}>
              What wins in your niche{query ? ` · "${query}"` : ''}
            </p>
          </div>
          {patterns.sample_size ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.amber, padding: '3px 9px', borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase', border: `1.5px solid ${C.amber}` }}>
                {patterns.sample_size} analysed
              </span>
            </div>
          ) : null}
        </div>

        {/* Hairline — aligned with the title "What wins in your niche".
            Offset = icon badge (26px) + flex gap (12px) = 38px. (No checkbox
            on this card, unlike Dashboard Priority Actions which uses 46.) */}
        <div style={{ height: 1, background: C.border, marginBottom: 14, marginLeft: 38 }} />

        {/* 3-cell body — canonical InsightCard pattern (Dashboard.jsx:1119):
            Visual formula (blue / "Why now" slot) · Next thumbnail (white +
            amber bar / "Action" slot) · Why now (green / "Expected outcome"
            slot). Same 1fr 1.4fr 1fr column weights as Priority Actions. */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 8, marginLeft: 38 }}>

          {/* Blue "Visual formula" — all 5 traits compacted into one tinted cell */}
          <div style={{ background: 'rgba(79,134,247,0.07)', border: '1px solid rgba(79,134,247,0.12)', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#4a7cf7', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Visual formula</p>
            {traits.map(([label, value], i) => (
              <div key={label} style={{ marginBottom: i === traits.length - 1 ? 0 : 10 }}>
                <p style={{ fontSize: 9.5, fontWeight: 700, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</p>
                <p style={{ fontSize: 12.5, color: C.text1, lineHeight: 1.55 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Amber+bar "Next thumbnail" — the "Action" equivalent in Priority Actions */}
          <div style={{
            background: '#fff',
            border: `1px solid ${C.border}`,
            borderLeft: `3px solid ${C.amber}`,
            borderRadius: '0 10px 10px 0',
            padding: '12px 16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex', flexDirection: 'column',
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.amber, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Next thumbnail</p>
            {recs.length === 0 ? (
              <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.6 }}>—</p>
            ) : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recs.map((r, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.amber, fontVariantNumeric: 'tabular-nums', lineHeight: 1.55, minWidth: 14 }}>{i + 1}.</span>
                    <span style={{ fontSize: 13, color: C.text1, lineHeight: 1.6, flex: 1 }}>{r}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Green "Why now" — same Expected outcome tile in Priority Actions */}
          {patterns.why_now ? (
            <div style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.14)', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Why now</p>
              <p style={{ fontSize: 13, color: C.text1, lineHeight: 1.65 }}>{patterns.why_now}</p>
            </div>
          ) : <div />}

        </div>
      </div>
    </div>
  )
}
