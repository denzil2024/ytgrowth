import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const LS_KEY = 'ytg_keywords_v1'

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null') } catch { return null }
}
function saveToDisk(keyword, result) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ keyword, result })) } catch {}
}

// ─── inject styles once ────────────────────────────────────────────────────────
function useKwStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-kw-styles')) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytg-kw-styles'
    style.textContent = `
      .kw-page * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
      .kw-page p, .kw-page span, .kw-page div { margin: 0; }

      @keyframes kwSpin { to { transform: rotate(360deg) } }
      @keyframes kwIn   { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
      .kw-in { animation: kwIn 0.28s ease both; }

      .kw-card {
        background: rgba(255,255,255,0.85);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.98);
        border-radius: 20px;
        box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset, 0 6px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
        transition: box-shadow 0.22s, transform 0.22s;
      }
      .kw-card:hover {
        box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset, 0 16px 48px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05);
        transform: translateY(-1px);
      }

      .kw-input {
        flex: 1; padding: 12px 18px;
        border-radius: 12px; border: 1.5px solid rgba(0,0,0,0.1);
        background: rgba(255,255,255,0.92); font-size: 13.5px;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        outline: none; transition: border-color 0.18s, box-shadow 0.18s; color: #111;
      }
      .kw-input::placeholder { color: #bbb; font-weight: 400; }
      .kw-input:focus { border-color: rgba(0,0,0,0.3); box-shadow: 0 0 0 4px rgba(0,0,0,0.05); background: #fff; }

      .kw-btn-primary {
        background: #111; color: #fff; border: none; border-radius: 12px;
        padding: 12px 28px; font-size: 13.5px; font-weight: 700;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        cursor: pointer; white-space: nowrap;
        transition: background 0.18s, box-shadow 0.18s, transform 0.18s;
        box-shadow: 0 4px 16px rgba(0,0,0,0.24); letter-spacing: 0.1px;
        display: flex; align-items: center; gap: 8px;
      }
      .kw-btn-primary:hover:not(:disabled) { background: #1a1a1a; box-shadow: 0 8px 24px rgba(0,0,0,0.28); transform: translateY(-1px); }
      .kw-btn-primary:disabled { background: #ccc; box-shadow: none; cursor: default; }

      .kw-btn-ghost {
        background: rgba(255,255,255,0.78); color: #666;
        border: 1.5px solid rgba(0,0,0,0.1); border-radius: 12px;
        padding: 12px 20px; font-size: 13.5px; font-weight: 600;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        cursor: pointer; white-space: nowrap; transition: all 0.18s;
        backdrop-filter: blur(10px);
      }
      .kw-btn-ghost:hover { background: rgba(255,255,255,0.95); color: #222; border-color: rgba(0,0,0,0.2); }

      .kw-intent-opt {
        display: flex; align-items: center; gap: 14px;
        padding: 14px 18px; border: 1.5px solid rgba(0,0,0,0.08);
        border-radius: 14px; cursor: pointer; background: rgba(255,255,255,0.7);
        transition: all 0.18s;
      }
      .kw-intent-opt:hover { border-color: rgba(0,0,0,0.22); background: rgba(255,255,255,0.95); transform: translateX(2px); box-shadow: 0 4px 16px rgba(0,0,0,0.07); }

      .kw-row { transition: background 0.14s; cursor: pointer; }
      .kw-row:hover { background: rgba(0,0,0,0.025); }

      .kw-chip { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.02em; }
      .kw-stat-chip { display: inline-flex; align-items: baseline; gap: 4px; background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.07); border-radius: 8px; padding: 4px 10px; }

      .kw-bar { height: 4px; border-radius: 4px; background: rgba(0,0,0,0.07); overflow: hidden; }
      .kw-bar-fill { height: 4px; border-radius: 4px; transition: width 0.5s ease; }

      .kw-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff; border-radius: 50%; animation: kwSpin 0.7s linear infinite; flex-shrink: 0; }
    `
    document.head.appendChild(style)
  }, [])
}

// ─── design tokens ─────────────────────────────────────────────────────────────
const C = {
  text1: '#0d0d0f', text2: '#3c3c44', text3: '#8c8c9a', text4: '#b8b8c8',
  border: 'rgba(0,0,0,0.07)', bg: '#f4f4f6',
  green: '#16a34a', greenBg: '#f0fdf4',
  amber: '#d97706', amberBg: '#fffbeb',
  red: '#e5251b', redBg: '#fff5f5',
  blue: '#2563eb', blueBg: '#eff6ff', blueBdr: '#bfdbfe',
  purple: '#7c3aed', purpleBg: '#f5f3ff',
  teal: '#0891b2', tealBg: '#ecfeff',
}

const INTENT_COLOR = { exact: C.green, strong: C.blue, partial: C.amber }
const INTENT_BG    = { exact: C.greenBg, strong: C.blueBg, partial: C.amberBg }
function oppColor(s) { return s >= 70 ? C.green : s >= 45 ? C.amber : C.red }

// ─── component ─────────────────────────────────────────────────────────────────
export default function Keywords() {
  useKwStyles()

  const saved = loadSaved()
  const [keyword,       setKeyword]       = useState(saved?.keyword || '')
  const [loadingIntent, setLoadingIntent] = useState(false)
  const [intentOptions, setIntentOptions] = useState(null)
  const [loading,       setLoading]       = useState(false)
  const [result,        setResult]        = useState(saved?.result || null)
  const [error,         setError]         = useState('')
  const [expanded,      setExpanded]      = useState(null)

  useEffect(() => { saveToDisk(keyword, result) }, [keyword, result])

  async function handleSubmit() {
    if (!keyword.trim() || loadingIntent || loading) return
    setError(''); setResult(null); setIntentOptions(null); setExpanded(null)
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
    setKeyword(''); setResult(null); setIntentOptions(null); setError(''); setExpanded(null)
    localStorage.removeItem(LS_KEY)
  }

  return (
    <div className="kw-page" style={{ padding: '28px 32px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Keyword Research</p>
        <p style={{ fontSize: 13.5, color: C.text3 }}>YouTube autocomplete + Google related searches — filtered by intent, ranked by opportunity.</p>
      </div>

      {/* Search bar */}
      <div className="kw-card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="kw-input" placeholder="e.g. grocery haul, home workout, budget cooking…"
            value={keyword} onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            disabled={loadingIntent || loading}
          />
          {result && <button className="kw-btn-ghost" onClick={handleClear}>Clear</button>}
          <button className="kw-btn-primary" onClick={handleSubmit} disabled={loadingIntent || loading || !keyword.trim()}>
            {loadingIntent ? <><span className="kw-spinner" /> Detecting intent…</>
             : loading     ? <><span className="kw-spinner" /> Researching…</>
             : 'Research'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: C.redBg, border: '1px solid #fecaca', borderRadius: 14, padding: '12px 16px', marginBottom: 16, color: C.red, fontSize: 13.5 }}>
          {error}
        </div>
      )}

      {/* Intent picker */}
      {intentOptions && !loading && (
        <div className="kw-card kw-in" style={{ padding: '22px 24px', marginBottom: 20, border: '2px solid rgba(147,197,253,0.5)', background: 'rgba(239,246,255,0.88)' }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: C.text1, letterSpacing: '-0.3px', marginBottom: 3 }}>What niche is this keyword for?</p>
          <p style={{ fontSize: 13, color: C.text3, marginBottom: 16 }}>Pick the right audience so we search the correct space.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {intentOptions.map((opt, i) => (
              <div key={i} className="kw-intent-opt" onClick={() => runResearch(opt.keyword)}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text1 }}>{opt.label}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: C.blue, background: C.blueBg, border: `1px solid ${C.blueBdr}`, padding: '2px 8px', borderRadius: 20 }}>{opt.keyword}</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: C.text3 }}>{opt.description}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={C.text4} strokeWidth="2" strokeLinecap="round"><path d="M5 3l4 4-4 4"/></svg>
              </div>
            ))}
          </div>
          <button onClick={() => runResearch('')} style={{ marginTop: 12, fontSize: 12, fontWeight: 500, color: C.text3, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Let AI decide
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="kw-in">

          {/* ── top row: intent summary (left) + keyword table (right) ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, marginBottom: 16, alignItems: 'start' }}>

            {/* Left column: intent summary + top pick */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Intent summary */}
              <div className="kw-card" style={{ padding: '20px 22px' }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Search Intent</p>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text1, lineHeight: 1.6, marginBottom: 12 }}>{result.seedIntent?.intentSummary}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  <span className="kw-chip" style={{ color: C.purple, background: C.purpleBg }}>{result.seedIntent?.primaryIntent}</span>
                  <span className="kw-chip" style={{ color: C.teal, background: C.tealBg }}>{result.seedIntent?.contentTypeExpected}</span>
                  <span className="kw-chip" style={{ color: C.blue, background: C.blueBg }}>{result.seedIntent?.funnelStage}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                  {[
                    { label: 'Autocomplete', value: result.rawSuggestionsCount },
                    { label: 'Related', value: result.serperCount },
                    { label: 'Filtered', value: result.totalAfterIntentFilter, accent: true },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', borderLeft: i > 0 ? `1px solid ${C.border}` : 'none' }}>
                      <p style={{ fontSize: 18, fontWeight: 800, color: s.accent ? C.blue : C.text1, letterSpacing: '-0.5px' }}>{s.value ?? '—'}</p>
                      <p style={{ fontSize: 10.5, color: C.text3, marginTop: 2 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top pick */}
              {result.topPick && (
                <div style={{ background: C.greenBg, border: '1.5px solid #bbf7d0', borderRadius: 16, padding: '16px 18px' }}>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Top Pick</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, lineHeight: 1.5 }}>{result.topPick.keyword}</p>
                  <p style={{ fontSize: 12.5, fontWeight: 400, color: '#3f6212', marginTop: 5, lineHeight: 1.5 }}>{result.topPick.whyThisOne}</p>
                </div>
              )}
            </div>

            {/* Right column: keyword table */}
            <div className="kw-card" style={{ overflow: 'hidden' }}>
              {/* Col headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 110px 16px', gap: 10, padding: '10px 22px', borderBottom: `1px solid ${C.border}` }}>
                {['Keyword', 'Intent Match', 'Opportunity', ''].map((h, i) => (
                  <p key={i} style={{ fontSize: 10.5, fontWeight: 700, color: C.text4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</p>
                ))}
              </div>

              {result.keywords?.map((kw, idx) => (
                <div key={kw.keyword} style={{ borderBottom: idx < result.keywords.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <div className="kw-row" style={{ display: 'grid', gridTemplateColumns: '1fr 90px 110px 16px', gap: 10, padding: '12px 22px', alignItems: 'center' }}
                    onClick={() => setExpanded(expanded === idx ? null : idx)}>

                    <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text1 }}>{kw.keyword}</p>

                    <span className="kw-chip" style={{ color: INTENT_COLOR[kw.intentMatch] || C.text3, background: INTENT_BG[kw.intentMatch] || C.bg }}>
                      {kw.intentMatch}
                    </span>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <p style={{ fontSize: 13, fontWeight: 800, color: oppColor(kw.opportunityScore) }}>{kw.opportunityScore}</p>
                      </div>
                      <div className="kw-bar" style={{ width: 70 }}>
                        <div className="kw-bar-fill" style={{ width: `${kw.opportunityScore}%`, background: oppColor(kw.opportunityScore) }} />
                      </div>
                    </div>

                    <p style={{ color: C.text4, fontSize: 10, textAlign: 'center' }}>{expanded === idx ? '▲' : '▼'}</p>
                  </div>

                  {expanded === idx && (
                    <div style={{ padding: '12px 22px 16px', background: 'rgba(246,246,250,0.7)', borderTop: `1px solid ${C.border}` }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Content Angle</p>
                      <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.55 }}>{kw.contentAngle}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Clusters — full width below */}
          {result.clusters?.length > 0 && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.text1, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Content Clusters</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                {result.clusters.map((cl, i) => {
                  const palette = [
                    { clr: C.blue,   bg: C.blueBg,   bdr: C.blueBdr,         accentBg: 'rgba(37,99,235,0.06)'  },
                    { clr: C.green,  bg: C.greenBg,  bdr: '#bbf7d0',         accentBg: 'rgba(22,163,74,0.06)'  },
                    { clr: C.amber,  bg: C.amberBg,  bdr: '#fde68a',         accentBg: 'rgba(217,119,6,0.06)'  },
                    { clr: C.purple, bg: C.purpleBg, bdr: '#ddd6fe',         accentBg: 'rgba(124,58,237,0.06)' },
                    { clr: C.teal,   bg: C.tealBg,   bdr: '#a5f3fc',         accentBg: 'rgba(8,145,178,0.06)'  },
                  ]
                  const p = palette[i % palette.length]
                  return (
                    <div key={cl.clusterName} style={{
                      background: 'rgba(255,255,255,0.85)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: `1px solid ${p.bdr}`,
                      borderLeft: `4px solid ${p.clr}`,
                      borderRadius: 16,
                      padding: '16px 18px',
                      boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 4px 16px rgba(0,0,0,0.06)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ width: 22, height: 22, borderRadius: 7, background: p.bg, color: p.clr, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                        <p style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>{cl.clusterName}</p>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {cl.keywords?.map(k => (
                          <span key={k} style={{ background: p.accentBg, border: `1px solid ${p.bdr}`, color: p.clr, padding: '3px 9px', borderRadius: 20, fontSize: 11.5, fontWeight: 600 }}>{k}</span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

