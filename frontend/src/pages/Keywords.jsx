import { useState, useEffect } from 'react'

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
        background: #fff; color: #52525b;
        border: 1px solid rgba(0,0,0,0.12); border-radius: 100px;
        padding: 11px 18px; font-size: 13.5px; font-weight: 600;
        font-family: 'Inter', system-ui, sans-serif;
        cursor: pointer; white-space: nowrap;
        transition: background 0.15s, border-color 0.15s;
        letter-spacing: 0.01em;
      }
      .kw-btn-ghost:hover { border-color: rgba(0,0,0,0.2); background: #f6f6f9; }

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

      /* Cluster "Copy theme" button — ghost pill for secondary actions so
         the red stays reserved for primary moments. Matches the ghost
         button pattern used across the app. */
      .kw-ghost-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 7px 14px; border-radius: 100px;
        font-size: 12px; font-weight: 700; letter-spacing: 0.01em;
        font-family: 'Inter', system-ui, sans-serif;
        background: #fff; color: #52525b;
        border: 1px solid rgba(0,0,0,0.12); cursor: pointer;
        transition: background 0.15s, border-color 0.15s, color 0.15s;
      }
      .kw-ghost-btn:hover { background: #fff5f5; border-color: rgba(229,37,27,0.35); color: #e5251b; }
      .kw-ghost-btn.copied { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }

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
export default function Keywords() {
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
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setResult(data)
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

      {/* Search bar */}
      <div className="kw-card" style={{ padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="kw-input" placeholder="e.g. grocery haul, home workout, budget cooking"
            value={keyword} onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            disabled={loadingIntent || loading}
          />
          {result && <button className="kw-btn-ghost" onClick={handleClear}>Clear</button>}
          <button className="kw-btn-primary" onClick={handleSubmit} disabled={loadingIntent || loading || !keyword.trim()}>
            {loadingIntent ? <><span className="kw-spinner" /> Detecting intent</>
             : loading     ? <><span className="kw-spinner" /> Researching</>
             : 'Research'}
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
                  Sorted by opportunity score · click any to copy
                </p>
              </div>

              <div className="kw-card" style={{ borderTop: `3px solid ${C.amber}`, marginBottom: 24 }}>
                <div style={{ padding: '18px 22px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>
                        Related phrases
                      </p>
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

                  {/* 2-col grid of rows — amber vertical divider between cols */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 0, rowGap: 14 }}>
                    {result.keywords.map((kw, i) => {
                      const scColor    = oppColor(kw.opportunityScore)
                      const isRightCol = i % 2 === 1
                      return (
                        <div
                          key={kw.keyword}
                          className="kw-row-seo"
                          role="button"
                          tabIndex={0}
                          onClick={() => navigator.clipboard.writeText(kw.keyword)}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigator.clipboard.writeText(kw.keyword) } }}
                          title={`${kw.intentMatch} match · Score ${kw.opportunityScore} — click to copy`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                            paddingLeft:  isRightCol ? 20 : 0,
                            paddingRight: isRightCol ? 0 : 20,
                            borderLeft: isRightCol ? `1px solid ${C.amberBdr}` : 'none',
                          }}
                        >
                          <span className="kw-row-phrase" style={{
                            fontSize: 13, color: C.text2, fontWeight: 400,
                            width: 180, flexShrink: 0,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            transition: 'color 0.12s',
                          }}>{kw.keyword}</span>
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
                        {/* Per-cluster action — ghost pill that turns red on hover.
                            Copies all keywords in this theme as a comma list. */}
                        <button
                          className={`kw-ghost-btn${isCopied ? ' copied' : ''}`}
                          onClick={() => handleCopyCluster(cl)}
                          style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
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
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
