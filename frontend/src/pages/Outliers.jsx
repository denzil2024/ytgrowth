import { useState, useEffect, useRef } from 'react'

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
      background: rgba(15,15,19,0.48);
      display: flex; align-items: center; justify-content: center;
      z-index: 100;
      animation: outFadeIn 0.18s ease both;
      padding: 24px;
    }
    .out-modal {
      background: #ffffff;
      border: 1px solid #e6e6ec;
      border-radius: 20px;
      box-shadow: 0 24px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10);
      width: 100%; max-width: 560px;
      max-height: calc(100vh - 48px);
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
export default function Outliers({ channelData, onNavigate }) {
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
  return (
    <div style={{ width: '100%', fontFamily: "'Inter', system-ui, sans-serif", color: C.text1 }}>

      {/* ══ Header ═══════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
            boxShadow: '0 6px 18px rgba(229,37,27,0.38), inset 0 1px 0 rgba(255,255,255,0.28)',
            flexShrink: 0,
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l6-6 4 4 8-8"/>
              <path d="M14 7h7v7"/>
            </svg>
          </span>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 6, lineHeight: 1.1 }}>Outliers</h1>
            <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.4, display: 'flex', gap: 0, flexWrap: 'wrap' }}>
              <span>Recent videos, thumbnails, and channels in your niche that over-performed</span>
              <span style={{ marginLeft: 8 }}>· Last 12 months · 3 credits per search</span>
            </p>
          </div>
        </div>
        {(result?.videos?.length > 0 || result?.channels?.length > 0) && (
          <button
            onClick={handleClear}
            className="out-btn"
            style={{ flexShrink: 0 }}
          >
            New search
          </button>
        )}
      </div>

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
        const items = tab === 'channel' ? (result.channels || []) : (result.videos || [])
        const eyebrowLabel =
          tab === 'channel'   ? `${items.length} breakout channel${items.length === 1 ? '' : 's'}` :
          tab === 'thumbnail' ? `${items.length} winning thumbnail${items.length === 1 ? '' : 's'}` :
                                `${items.length} outlier video${items.length === 1 ? '' : 's'}`
        return (
          <div className="out-section">
            {/* Thumbnails tab: niche visual-pattern report lives above the grid */}
            {tab === 'thumbnail' && result.thumbnail_patterns && (
              <ThumbnailPatternsCard patterns={result.thumbnail_patterns} query={result.cohort?.query} />
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {eyebrowLabel} for "{result.cohort?.query}"
              </span>
              {result.cohort?.pool_size != null && (
                <span style={{ fontSize: 11, fontWeight: 500, color: C.text3 }}>
                  Niche pool · {result.cohort.pool_size} peer video{result.cohort.pool_size === 1 ? '' : 's'} · last 12 months
                </span>
              )}
            </div>

            {items.length === 0 ? (
              <div className="out-card" style={{ padding: '28px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>
                  {tab === 'channel'
                    ? 'No breakout channels surfaced in this search. The Videos and Thumbnails tabs still have results.'
                    : 'No results for this tab. Try another tab.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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

/* ─── Video / thumbnail result card ──────────────────────────────────────── */
function VideoResultCard({ item, kind, onOpen }) {
  const tier = outlierTier(item.outlier_score)
  // Thumbnails tab: bigger image, title secondary. Video tab: balanced.
  const thumbWidth = kind === 'thumbnail' ? 220 : 180

  return (
    <button className="out-result-card" onClick={onOpen}>
      {/* Thumbnail */}
      <div style={{
        position: 'relative',
        width: thumbWidth, flexShrink: 0,
        aspectRatio: '16 / 9',
        borderRadius: 10, overflow: 'hidden',
        background: '#eeeef3',
        border: `1px solid ${C.border}`,
      }}>
        {item.thumbnail
          ? <img src={item.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
          : null}
        {item.duration_seconds > 0 && (
          <span style={{
            position: 'absolute', bottom: 6, right: 6,
            fontSize: 10.5, fontWeight: 700, color: '#fff',
            background: 'rgba(15,15,19,0.82)',
            padding: '2px 6px', borderRadius: 4,
            fontVariantNumeric: 'tabular-nums',
          }}>{fmtDuration(item.duration_seconds)}</span>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Row 1: outlier pill + stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: tier.bg, color: tier.color, border: `1px solid ${tier.bdr}`,
            fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
            letterSpacing: '0.03em', textTransform: 'uppercase',
            fontVariantNumeric: 'tabular-nums',
          }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><path d="M6 1l1.4 3.6L11 6l-3.6 1.4L6 11l-1.4-3.6L1 6l3.6-1.4z"/></svg>
            {tier.label}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.text2, fontVariantNumeric: 'tabular-nums' }}>
            {fmtNum(item.views)} views
          </span>
          <span style={{ fontSize: 11, color: C.text3 }}>·</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: C.text3 }}>
            {fmtNum(item.channel_subscribers)} sub channel
          </span>
          {item.published_at && (
            <>
              <span style={{ fontSize: 11, color: C.text3 }}>·</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: C.text3 }}>{relPublished(item.published_at)}</span>
            </>
          )}
        </div>

        {/* Row 2: title */}
        <p style={{
          fontSize: 14.5, fontWeight: 700, color: C.text1,
          letterSpacing: '-0.2px', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>{item.title}</p>

        {/* Row 3: channel name */}
        <p style={{ fontSize: 12, color: C.text3, fontWeight: 500, letterSpacing: '-0.05px' }}>
          {item.channel_name}
        </p>

        {/* Row 4: AI explanation */}
        {item.explanation && (
          <div style={{
            marginTop: 2,
            fontSize: 12.5, color: C.text2,
            background: '#fafafb',
            border: `1px solid ${C.borderLight}`,
            borderRadius: 9,
            padding: '8px 11px',
            lineHeight: 1.55,
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <span style={{ color: C.red, flexShrink: 0, marginTop: 1 }}>
              <SparkIcon size={12} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>{item.explanation}</span>
          </div>
        )}
      </div>
    </button>
  )
}

/* ─── Channel result card ────────────────────────────────────────────────── */
function ChannelResultCard({ item, onOpen }) {
  const tier = outlierTier(item.outlier_score)
  return (
    <button className="out-result-card" onClick={onOpen}>
      {/* Avatar */}
      <div style={{
        width: 72, height: 72, flexShrink: 0,
        borderRadius: '50%', overflow: 'hidden',
        background: C.redBg, border: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, fontWeight: 700, color: C.red,
      }}>
        {item.thumbnail
          ? <img src={item.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          : (item.channel_name || '?')[0].toUpperCase()
        }
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: tier.bg, color: tier.color, border: `1px solid ${tier.bdr}`,
            fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
            letterSpacing: '0.03em', textTransform: 'uppercase',
            fontVariantNumeric: 'tabular-nums',
          }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><path d="M6 1l1.4 3.6L11 6l-3.6 1.4L6 11l-1.4-3.6L1 6l3.6-1.4z"/></svg>
            {tier.label}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.text2, fontVariantNumeric: 'tabular-nums' }}>
            {fmtNum(item.subscribers)} subs
          </span>
          <span style={{ fontSize: 11, color: C.text3 }}>·</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: C.text3 }}>
            {fmtNum(item.avg_views_per_video)} avg views
          </span>
          <span style={{ fontSize: 11, color: C.text3 }}>·</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: C.text3 }}>
            {fmtNum(item.video_count)} videos
          </span>
        </div>
        <p style={{ fontSize: 14.5, fontWeight: 700, color: C.text1, letterSpacing: '-0.2px', lineHeight: 1.35 }}>
          {item.channel_name}
        </p>
        {item.description && (
          <p style={{
            fontSize: 12, color: C.text3, fontWeight: 500,
            display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{item.description}</p>
        )}
        {item.explanation && (
          <div style={{
            marginTop: 2,
            fontSize: 12.5, color: C.text2,
            background: '#fafafb',
            border: `1px solid ${C.borderLight}`,
            borderRadius: 9,
            padding: '8px 11px',
            lineHeight: 1.55,
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <span style={{ color: C.red, flexShrink: 0, marginTop: 1 }}>
              <SparkIcon size={12} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>{item.explanation}</span>
          </div>
        )}
      </div>
    </button>
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
  const tier      = outlierTier(item.outlier_score)

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

  return (
    <div className="out-modal-overlay" onClick={onClose}>
      <div className="out-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ position: 'relative', padding: '22px 24px 0' }}>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute', top: 14, right: 14,
              width: 30, height: 30, borderRadius: 10,
              background: 'transparent', border: '1px solid transparent',
              color: C.text3, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f9'; e.currentTarget.style.color = C.text1 }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text3 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 3l8 8M11 3l-8 8"/>
            </svg>
          </button>

          {/* Thumbnail/avatar */}
          {isChannel ? (
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              overflow: 'hidden', background: C.redBg,
              border: `1px solid ${C.border}`, marginBottom: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, color: C.red,
            }}>
              {item.thumbnail
                ? <img src={item.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                : (item.channel_name || '?')[0].toUpperCase()
              }
            </div>
          ) : (
            <div style={{
              width: '100%', aspectRatio: '16 / 9',
              borderRadius: 12, overflow: 'hidden',
              background: '#eeeef3', border: `1px solid ${C.border}`,
              marginBottom: 14,
            }}>
              {item.thumbnail
                ? <img src={item.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
                : null}
            </div>
          )}

          {/* Outlier pill + stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: tier.bg, color: tier.color, border: `1px solid ${tier.bdr}`,
              fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
              letterSpacing: '0.03em', textTransform: 'uppercase',
              fontVariantNumeric: 'tabular-nums',
            }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><path d="M6 1l1.4 3.6L11 6l-3.6 1.4L6 11l-1.4-3.6L1 6l3.6-1.4z"/></svg>
              {tier.label}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.text2, fontVariantNumeric: 'tabular-nums' }}>
              {fmtNum(isChannel ? item.subscribers : item.views)} {isChannel ? 'subs' : 'views'}
            </span>
            {!isChannel && (
              <>
                <span style={{ fontSize: 11, color: C.text3 }}>·</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: C.text3 }}>
                  {fmtNum(item.channel_subscribers)} sub channel
                </span>
              </>
            )}
            {isChannel && (
              <>
                <span style={{ fontSize: 11, color: C.text3 }}>·</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: C.text3 }}>
                  {fmtNum(item.avg_views_per_video)} avg views
                </span>
              </>
            )}
          </div>

          {/* Title / channel name */}
          <p style={{ fontSize: 17, fontWeight: 800, color: C.text1, letterSpacing: '-0.4px', lineHeight: 1.3, marginBottom: 4 }}>
            {isChannel ? item.channel_name : item.title}
          </p>
          {!isChannel && (
            <p style={{ fontSize: 12.5, color: C.text3, fontWeight: 500 }}>
              {item.channel_name}
            </p>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '18px 24px 22px' }}>
          {/* ── Three structured sections (clean, no tinted blocks) ──────── */}
          {isChannel ? (
            <>
              <DetailSection isFirst tone="red"   eyebrow="Why this channel" body={item.why_this_channel || item.explanation || ''} />
              <DetailSection          tone="amber" eyebrow="What to do"      list={item.what_to_do} />
              <DetailSection          tone="blue"  eyebrow="Why now"         body={item.why_now || ''} />
            </>
          ) : (
            <>
              <DetailSection isFirst tone="red"   eyebrow="Why it worked"  body={item.why_worked || item.explanation || ''} />
              <DetailSection          tone="amber" eyebrow="Quick actions" list={item.quick_actions} />
              <DetailSection          tone="blue"  eyebrow="Why now"       body={item.why_now || ''} />
            </>
          )}

          {/* Shortcut buttons (kept below the structured report) */}
          <div style={{ height: 1, background: C.border, marginTop: 18, marginBottom: 14 }} />
          <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Shortcuts
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <ActionButton
              label="Open in YouTube"
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="12" height="8" rx="2"/><path d="M6 5.5v3l2.5-1.5z" fill="currentColor"/>
                </svg>
              }
              onClick={openOnYouTube}
            />
            {!isChannel && (
              <ActionButton
                label="Remix title"
                icon={
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9.5l6.5-6.5 1.5 1.5L4.5 11 2.5 11.5z"/><path d="M8.5 4l1.5 1.5"/>
                  </svg>
                }
                onClick={remixTitle}
              />
            )}
            {!isChannel && (
              <ActionButton
                label="Remix thumbnail"
                icon={
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="2.5" width="12" height="9" rx="2"/><circle cx="5" cy="6.5" r="1.2"/><path d="m1.5 10 3-3 3 3 2-2 3 3"/>
                  </svg>
                }
                onClick={remixThumbnail}
              />
            )}
            <ActionButton
              label={
                addState === 'adding' ? 'Adding…' :
                addState === 'added'  ? 'Added ✓' :
                'Add as competitor'
              }
              icon={
                addState === 'adding'
                  ? <SpinIcon />
                  : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="5.5" cy="6" r="2.5"/><path d="M1.5 11.5c.5-1.6 2.2-2.5 4-2.5s3.5.9 4 2.5"/>
                      <path d="M10.5 5v3M12 6.5h-3"/>
                    </svg>
              }
              onClick={addAsCompetitor}
              disabled={addState === 'adding' || addState === 'added'}
              success={addState === 'added'}
              wide={isChannel}
            />
          </div>

          {addError && (
            <div style={{
              marginTop: 10, fontSize: 12, color: C.red,
              background: C.redBg, border: `1px solid ${C.redBdr}`,
              borderRadius: 9, padding: '8px 11px', lineHeight: 1.4,
            }}>
              {addError}
            </div>
          )}

          {addState === 'added' && (
            <p style={{ marginTop: 10, fontSize: 11.5, color: C.text3, lineHeight: 1.5 }}>
              Open the Competitors tab to see the full analysis.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Action button used in the modal ────────────────────────────────────── */
function ActionButton({ label, icon, onClick, disabled, success, wide }) {
  const [hover, setHover] = useState(false)
  const bg     = success ? C.greenBg       : (hover && !disabled ? '#fafafb' : '#ffffff')
  const color  = success ? C.green         : C.text1
  const border = success ? C.greenBdr      : (hover && !disabled ? 'rgba(0,0,0,0.18)' : '#e6e6ec')
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        gridColumn: wide ? 'span 2' : undefined,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px', borderRadius: 12,
        border: `1px solid ${border}`, background: bg, color,
        fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
        letterSpacing: '-0.1px', cursor: disabled ? 'default' : 'pointer',
        textAlign: 'left', transition: 'all 0.16s',
        boxShadow: hover && !disabled ? '0 2px 8px rgba(0,0,0,0.06)' : '0 1px 2px rgba(0,0,0,0.04)',
        opacity: disabled && !success ? 0.75 : 1,
      }}
    >
      <span style={{ color: success ? C.green : C.text2, display: 'inline-flex', flexShrink: 0 }}>
        {icon}
      </span>
      {label}
    </button>
  )
}

/* ─── Detail modal body sections — clean, no tinted blocks ───────────────── */
/* Design parity with the existing Outliers modal: small colored eyebrow, body
   text, hairline divider between sections. No stacked tinted tiles. */
function DetailSection({ tone, eyebrow, body, list, isFirst }) {
  const eyebrowColor =
    tone === 'red'   ? C.red     :
    tone === 'amber' ? C.amber   :
    tone === 'blue'  ? '#4a7cf7' : C.text2

  const hasList = Array.isArray(list) && list.filter(Boolean).length > 0
  const hasBody = !!(body && body.trim())
  if (!hasList && !hasBody) return null

  return (
    <div style={{
      paddingTop: isFirst ? 0 : 14,
      marginTop:  isFirst ? 0 : 14,
      borderTop:  isFirst ? 'none' : `1px solid ${C.borderLight}`,
    }}>
      <p style={{
        fontSize: 10, fontWeight: 700, color: eyebrowColor,
        letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 8,
      }}>
        {eyebrow}
      </p>

      {hasList ? (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {list.filter(Boolean).map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{
                flexShrink: 0, fontSize: 12, fontWeight: 700, color: eyebrowColor,
                fontVariantNumeric: 'tabular-nums', lineHeight: 1.55, marginTop: 0,
                minWidth: 14,
              }}>{i + 1}.</span>
              <span style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.55, flex: 1 }}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.6 }}>
          {body}
        </p>
      )}
    </div>
  )
}

/* ─── Thumbnails tab — niche visual-pattern report (tab-level, not per-row) */
/* Matches the existing out-card aesthetic: white card, amber top border for
   identity, stacked rows separated by hairlines — no nested tinted blocks. */
function ThumbnailPatternsCard({ patterns, query }) {
  if (!patterns || (!patterns.dominant_style && !(patterns.recommendations || []).length)) {
    return null
  }
  const traits = [
    { label: 'Dominant style',  value: patterns.dominant_style   },
    { label: 'Text overlay',    value: patterns.text_overlay     },
    { label: 'Face presence',   value: patterns.face_presence    },
    { label: 'Color palette',   value: patterns.color_palette    },
    { label: 'Layout pattern',  value: patterns.layout_pattern   },
  ].filter(t => t.value && t.value.trim())

  return (
    <div className="out-card" style={{ padding: 0, marginBottom: 16, borderTop: `3px solid ${C.amber}` }}>
      {/* Header */}
      <div style={{ padding: '18px 22px 12px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.amber, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 3 }}>
            Thumbnail pattern · last 12 months
          </p>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: C.text1, letterSpacing: '-0.35px', lineHeight: 1.3 }}>
            What wins in your niche{query ? <span style={{ color: C.text3, fontWeight: 600 }}> · "{query}"</span> : null}
          </h3>
        </div>
        {patterns.sample_size ? (
          <span style={{ fontSize: 11, fontWeight: 600, color: C.text3, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
            {patterns.sample_size} analysed
          </span>
        ) : null}
      </div>

      <div style={{ height: 1, background: C.border, marginLeft: 22, marginRight: 22 }} />

      {/* Traits — vertical rows, hairline separators */}
      <div style={{ padding: '6px 22px 2px' }}>
        {traits.map((t, i) => (
          <div key={i} style={{
            padding: '12px 0',
            borderBottom: i === traits.length - 1 ? 'none' : `1px solid ${C.borderLight}`,
            display: 'flex', gap: 18, alignItems: 'flex-start',
          }}>
            <p style={{
              width: 130, flexShrink: 0,
              fontSize: 10.5, fontWeight: 700, color: C.text3,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              lineHeight: 1.55, paddingTop: 1,
            }}>
              {t.label}
            </p>
            <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.6, flex: 1 }}>
              {t.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {(patterns.recommendations || []).length > 0 && (
        <>
          <div style={{ height: 1, background: C.border, marginLeft: 22, marginRight: 22 }} />
          <div style={{ padding: '16px 22px 8px' }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: C.amber, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 10 }}>
              What to do on your next thumbnail
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {patterns.recommendations.map((r, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{
                    flexShrink: 0, fontSize: 12, fontWeight: 700, color: C.amber,
                    fontVariantNumeric: 'tabular-nums', lineHeight: 1.55, minWidth: 14,
                  }}>{i + 1}.</span>
                  <span style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.55, flex: 1 }}>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Why now */}
      {patterns.why_now && (
        <>
          <div style={{ height: 1, background: C.borderLight, marginLeft: 22, marginRight: 22, marginTop: 10 }} />
          <div style={{ padding: '12px 22px 18px' }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: '#4a7cf7', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 6 }}>
              Why now
            </p>
            <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.6 }}>
              {patterns.why_now}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
