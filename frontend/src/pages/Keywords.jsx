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

      .kw-card {
        background: #ffffff;
        border: 1px solid rgba(0,0,0,0.09);
        border-radius: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06);
        transition: border-color 0.2s;
      }
      .kw-card:hover { border-color: rgba(0,0,0,0.14); }

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

      /* Keyword card — compact, lives inside the 2-col results grid.
         Hairline border, system elevation, hover just darkens the border. */
      .kw-kw-card {
        background: #fff;
        border: 1px solid rgba(0,0,0,0.09);
        border-radius: 12px;
        padding: 14px 16px 14px;
        transition: border-color 0.15s;
      }
      .kw-kw-card:hover { border-color: rgba(0,0,0,0.18); }

      /* Copy button — small pill toolbar action */
      .kw-copy-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 6px 12px; border-radius: 100px;
        font-size: 12px; font-weight: 700; letter-spacing: 0.01em;
        font-family: 'Inter', system-ui, sans-serif;
        background: #fff; color: #52525b;
        border: 1px solid rgba(0,0,0,0.12); cursor: pointer;
        transition: background 0.15s, border-color 0.15s;
      }
      .kw-copy-btn:hover { background: #f6f6f9; border-color: rgba(0,0,0,0.2); }
      .kw-copy-btn.copied { color: #16a34a; border-color: #bbf7d0; background: #f0fdf4; }

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

      {/* Results */}
      {result && (
        <div className="kw-in">

          {/* ── Top Pick — single standalone InsightCard (Priority Actions
              pattern exactly: 3px amber top border, 26x26 amber rank badge,
              'TOP PICK' eyebrow, keyword as 14/700 title, hairline divider
              at marginLeft:46, body aligned to the same anchor with
              whyThisOne + intent summary folded in). ──────────────────── */}
          {result.topPick && (
            <div className="kw-card" style={{ padding: 0, marginBottom: 14, borderTop: `3px solid ${C.amber}` }}>
              <div style={{ padding: '16px 22px 18px' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 8, background: C.amber,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 2,
                  }}>
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 1.5l1.6 3.6 3.9 0.4-2.9 2.7 0.8 3.9L7 10.3 3.6 12.1l0.8-3.9L1.5 5.5l3.9-0.4z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: C.amber, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
                      Top pick
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, lineHeight: 1.55, letterSpacing: '-0.1px' }}>
                      {result.topPick.keyword}
                    </p>
                  </div>
                </div>

                {/* Hairline */}
                <div style={{ height: 1, background: C.border, marginBottom: 14, marginLeft: 46 }} />

                {/* Body — whyThisOne + intent summary + intent pills */}
                <div style={{ marginLeft: 46 }}>
                  <p style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.72, marginBottom: result.seedIntent?.intentSummary ? 10 : 0 }}>
                    {result.topPick.whyThisOne}
                  </p>
                  {result.seedIntent?.intentSummary && (
                    <p style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.72, marginBottom: 12 }}>
                      {result.seedIntent.intentSummary}
                    </p>
                  )}
                  {result.seedIntent && (
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {/* Only short values render as pills (<=28 chars). */}
                      {[
                        result.seedIntent.primaryIntent,
                        result.seedIntent.contentTypeExpected,
                        result.seedIntent.funnelStage,
                      ]
                        .filter(t => t && t.trim().length > 0 && t.trim().length <= 28)
                        .map((tag, i) => (
                          <span key={i} style={{
                            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                            color: C.text2, background: C.chipBg, border: `1px solid ${C.border}`,
                            borderRadius: 100, padding: '2px 9px',
                          }}>{tag}</span>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Row 2 — Keyword cards in a 2-col responsive grid (no more
              full-width table stretching end-to-end). Each card is compact
              and self-contained. Toolbar lives OUTSIDE the grid so the grid
              itself is pure content. */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10, padding: '0 2px',
          }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>
                Ranked keywords
              </p>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: C.text1, letterSpacing: '-0.1px' }}>
                {(result.keywords || []).length} opportunities matching your intent
              </p>
            </div>
            <button className={`kw-copy-btn${copied ? ' copied' : ''}`} onClick={handleCopyKeywords}>
              {copied ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5,6 4.5,9 9.5,2"/></svg>
                  Copied
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="6.5" height="6.5" rx="1"/><path d="M1.5 7.5V2A0.5 0.5 0 0 1 2 1.5h5.5"/></svg>
                  Copy all
                </>
              )}
            </button>
          </div>

          {/* Keyword cards — fixed 2-col grid (auto-fill was stretching to
              7 cols on wide screens). Each card uses the exact Priority
              Actions / IdeaCard pattern: 3px amber top border, 26x26 amber
              rank badge, eyebrow (intent label) + keyword title, hairline
              divider at marginLeft:46, angle body + score pill at mL:46. */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 10, marginBottom: 18,
          }}>
            {result.keywords?.map((kw, i) => {
              const tone = INTENT_TONE[kw.intentMatch] || INTENT_TONE.partial
              const oc   = oppColor(kw.opportunityScore)
              return (
                <div key={kw.keyword} className="kw-card" style={{ padding: 0, borderTop: `3px solid ${C.amber}` }}>
                  <div style={{ padding: '16px 22px 18px' }}>

                    {/* Header — rank badge + eyebrow/title + score */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 8,
                        background: C.amber,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: 2,
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: 10, fontWeight: 700,
                          color: tone.color,
                          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5,
                        }}>{kw.intentMatch} match</p>
                        <p style={{
                          fontSize: 14, fontWeight: 700, color: C.text1,
                          lineHeight: 1.4, letterSpacing: '-0.15px',
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        }}>{kw.keyword}</p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, flexShrink: 0, paddingTop: 2 }}>
                        <p style={{ fontSize: 18, fontWeight: 800, color: oc, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.4px', lineHeight: 1 }}>
                          {kw.opportunityScore}
                        </p>
                        <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, lineHeight: 1 }}>/100</p>
                      </div>
                    </div>

                    {/* Hairline divider — aligned at mL:46, mirrors Priority Actions */}
                    <div style={{ height: 1, background: C.border, marginBottom: 12, marginLeft: 46 }} />

                    {/* Body — angle paragraph + opportunity bar */}
                    <div style={{ marginLeft: 46 }}>
                      {kw.contentAngle && (
                        <p style={{
                          fontSize: 13, color: C.text2, lineHeight: 1.65, marginBottom: 12,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>{kw.contentAngle}</p>
                      )}
                      <div className="kw-bar">
                        <div className="kw-bar-fill" style={{ width: `${kw.opportunityScore}%`, background: oc }} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Clusters — responsive 2/3-col grid. All cards use the same
              amber 3px top border (strict palette: no per-card color
              variation). Rank badge gives ordinal identity within the
              single color. ─────────────────────────────────────────── */}
          {result.clusters?.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                Content clusters
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 10,
              }}>
                {result.clusters.map((cl, i) => (
                  <div key={cl.clusterName} className="kw-card" style={{ padding: 0, borderTop: `3px solid ${C.amber}`, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: C.amber, color: '#fff',
                        fontSize: 11, fontWeight: 900,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontVariantNumeric: 'tabular-nums',
                      }}>{i + 1}</span>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, lineHeight: 1.35, letterSpacing: '-0.1px' }}>{cl.clusterName}</p>
                    </div>
                    <div style={{ padding: '12px 16px 14px', display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {cl.keywords?.map(k => (
                        <span key={k} style={{
                          background: C.chipBg, border: `1px solid ${C.border}`, color: C.text2,
                          padding: '3px 10px', borderRadius: 100,
                          fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.05px',
                        }}>{k}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
