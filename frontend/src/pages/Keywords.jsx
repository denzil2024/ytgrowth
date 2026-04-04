import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || ''
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

    const style = document.createElement('style')
    style.id = 'ytg-kw-styles'
    style.textContent = `
      .kw-page * { box-sizing: border-box; font-family: 'DM Sans', 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
      .kw-page p, .kw-page span, .kw-page div { margin: 0; }

      @keyframes kwSpin { to { transform: rotate(360deg) } }
      @keyframes kwIn   { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
      .kw-in { animation: kwIn 0.28s ease both; }

      .kw-card {
        background: #ffffff;
        border: 1px solid #d8d8e0;
        border-radius: 20px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.14), 0 24px 64px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.9) inset;
        transition: box-shadow 0.22s, transform 0.22s, border-color 0.22s;
      }
      .kw-card:hover {
        box-shadow: 0 8px 28px rgba(0,0,0,0.18), 0 36px 80px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.9) inset;
        transform: translateY(-2px);
        border-color: #c0c0cc;
      }

      .kw-input {
        flex: 1; padding: 11px 20px;
        border-radius: 100px; border: 1px solid rgba(0,0,0,0.1);
        background: #ffffff; font-size: 13.5px;
        font-family: 'DM Sans', 'Inter', sans-serif;
        outline: none; transition: border-color 0.18s, box-shadow 0.18s; color: #111114;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 14px rgba(0,0,0,0.06);
      }
      .kw-input::placeholder { color: #a0a0b0; font-weight: 400; }
      .kw-input:focus { border-color: rgba(0,0,0,0.25); box-shadow: 0 0 0 4px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.07); }

      .kw-btn-primary {
        background: #e5251b; color: #fff; border: none; border-radius: 100px;
        padding: 11px 26px; font-size: 13px; font-weight: 700;
        font-family: 'DM Sans', 'Inter', sans-serif;
        cursor: pointer; white-space: nowrap; transition: all 0.18s;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32);
        letter-spacing: -0.1px; display: flex; align-items: center; gap: 8px;
      }
      .kw-btn-primary:hover:not(:disabled) { filter: brightness(1.07); box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,37,27,0.42); transform: translateY(-1px); }
      .kw-btn-primary:disabled { background: #e0e0e6; color: #a0a0b0; box-shadow: none; cursor: default; }

      .kw-btn-ghost {
        background: #fff; color: #52525b;
        border: 1px solid rgba(0,0,0,0.1); border-radius: 100px;
        padding: 11px 22px; font-size: 13px; font-weight: 600;
        font-family: 'DM Sans', 'Inter', sans-serif;
        cursor: pointer; white-space: nowrap; transition: all 0.18s;
        box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
      }
      .kw-btn-ghost:hover { border-color: rgba(0,0,0,0.18); color: #111114; box-shadow: 0 2px 8px rgba(0,0,0,0.10), 0 8px 28px rgba(0,0,0,0.10); transform: translateY(-1px); }

      .kw-intent-opt {
        display: flex; align-items: center; gap: 14px;
        padding: 13px 16px; border: 1px solid rgba(0,0,0,0.09);
        border-radius: 14px; cursor: pointer; background: #ffffff;
        transition: all 0.18s;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.06);
      }
      .kw-intent-opt:hover { border-color: rgba(0,0,0,0.18); transform: translateX(2px); box-shadow: 0 2px 8px rgba(0,0,0,0.09), 0 8px 24px rgba(0,0,0,0.09); }

      .kw-row { transition: background 0.14s; }
      .kw-row:hover { background: #f4f4f7; }

      .kw-chip { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0; }
      .kw-stat-chip { display: inline-flex; align-items: baseline; gap: 4px; background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.07); border-radius: 8px; padding: 4px 10px; }

      .kw-bar { height: 4px; border-radius: 4px; background: rgba(0,0,0,0.07); overflow: hidden; }
      .kw-bar-fill { height: 4px; border-radius: 4px; transition: width 0.5s ease; }

      .kw-spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: kwSpin 0.7s linear infinite; flex-shrink: 0; }
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

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontSize: 22, fontWeight: 800, color: '#0a0a0f', letterSpacing: '-0.6px', marginBottom: 4 }}>Keyword Research</p>
        <p style={{ fontSize: 13, color: C.text3 }}>YouTube autocomplete + related searches — filtered by intent, ranked by opportunity.</p>
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
        <div className="kw-card kw-in" style={{ padding: '20px 22px', marginBottom: 20, borderColor: '#bfdbfe', background: '#eff6ff' }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: C.text1, letterSpacing: '-0.3px', marginBottom: 3 }}>What niche is this keyword for?</p>
          <p style={{ fontSize: 13, color: C.text3, marginBottom: 14 }}>Pick the right audience so we search the correct space.</p>
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

          {/* ── Search Intent — one card, 4 sections divided by borders ── */}
          <div className="kw-card" style={{ marginBottom: 14, overflow: 'hidden' }}>

            {/* Section 1: header — label + chips */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', background: '#f8f8fb', borderBottom: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Search Intent</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'flex-end' }}>
                {result.seedIntent?.primaryIntent       && <span className="kw-chip" style={{ color: C.purple, background: C.purpleBg }}>{result.seedIntent.primaryIntent}</span>}
                {result.seedIntent?.contentTypeExpected && <span className="kw-chip" style={{ color: C.teal,   background: C.tealBg   }}>{result.seedIntent.contentTypeExpected}</span>}
                {result.seedIntent?.funnelStage         && <span className="kw-chip" style={{ color: C.blue,   background: C.blueBg   }}>{result.seedIntent.funnelStage}</span>}
              </div>
            </div>

            {/* Section 2: intent summary */}
            <div style={{ padding: '16px 22px', borderBottom: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: C.text1, lineHeight: 1.7 }}>{result.seedIntent?.intentSummary}</p>
            </div>

            {/* Section 3: counts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: `1px solid ${C.border}` }}>
              {[
                { label: 'Autocomplete', value: result.rawSuggestionsCount },
                { label: 'Related',      value: result.serperCount },
                { label: 'Filtered',     value: result.totalAfterIntentFilter, accent: true },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '16px 12px', borderLeft: i > 0 ? `1px solid ${C.border}` : 'none' }}>
                  <p style={{ fontSize: 24, fontWeight: 800, color: s.accent ? C.blue : C.text1, letterSpacing: '-0.6px', lineHeight: 1, marginBottom: 5 }}>{s.value ?? '—'}</p>
                  <p style={{ fontSize: 10.5, fontWeight: 500, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Section 4: top pick */}
            {result.topPick && (
              <div style={{ padding: '16px 22px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 8 }}>Top Pick</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, lineHeight: 1.4, marginBottom: 6 }}>{result.topPick.keyword}</p>
                <p style={{ fontSize: 12.5, color: '#3f6212', lineHeight: 1.65 }}>{result.topPick.whyThisOne}</p>
              </div>
            )}
          </div>

          {/* ── Keyword table — full width, 4 columns ── */}
          <div className="kw-card" style={{ overflow: 'hidden', marginBottom: 14 }}>
            {/* Col headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 220px) 1fr 100px 130px', alignItems: 'center', padding: '10px 20px', borderBottom: `1px solid ${C.border}`, background: '#f8f8fb' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.text4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Keyword</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.text4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Content Angle</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.text4, textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'center' }}>Intent</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.text4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Opportunity</p>
                <button onClick={handleCopyKeywords} style={{
                  padding: '3px 9px', background: copied ? C.greenBg : '#fff',
                  border: `1px solid ${copied ? '#bbf7d0' : C.border}`, borderRadius: 20,
                  cursor: 'pointer', transition: 'all 0.18s', fontSize: 9.5, fontWeight: 700,
                  color: copied ? C.green : C.text3, fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}>
                  {copied ? '✓ Copied' : 'Copy all'}
                </button>
              </div>
            </div>

            {result.keywords?.map((kw, idx) => (
              <div key={kw.keyword} className="kw-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 220px) 1fr 100px 130px', alignItems: 'center', padding: '11px 20px', borderBottom: idx < result.keywords.length - 1 ? `1px solid ${C.border}` : 'none' }}>

                {/* Keyword name */}
                <div style={{ minWidth: 0, paddingRight: 14 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, lineHeight: 1.4 }}>{kw.keyword}</p>
                </div>

                {/* Content angle */}
                <div style={{ minWidth: 0, paddingRight: 14 }}>
                  <p style={{ fontSize: 12, color: C.text3, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{kw.contentAngle || '—'}</p>
                </div>

                {/* Intent */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span className="kw-chip" style={{ color: INTENT_COLOR[kw.intentMatch] || C.text3, background: INTENT_BG[kw.intentMatch] || C.bg }}>
                    {kw.intentMatch}
                  </span>
                </div>

                {/* Opportunity */}
                <div style={{ paddingLeft: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 800, color: oppColor(kw.opportunityScore) }}>{kw.opportunityScore}</p>
                  </div>
                  <div className="kw-bar">
                    <div className="kw-bar-fill" style={{ width: `${kw.opportunityScore}%`, background: oppColor(kw.opportunityScore) }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Keyword tags — copy strip ── */}
          {result.keywords?.length > 0 && (
            <div className="kw-card" style={{ padding: '16px 20px', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>All Keywords</p>
                <button onClick={handleCopyKeywords} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px',
                  background: copied ? C.greenBg : '#fff', border: `1px solid ${copied ? '#bbf7d0' : C.border}`,
                  borderRadius: 20, cursor: 'pointer', transition: 'all 0.18s',
                  fontSize: 11.5, fontWeight: 700, color: copied ? C.green : C.text2,
                  fontFamily: 'inherit', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                  {copied ? '✓ Copied!' : 'Copy as list'}
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.keywords.map((kw, i) => (
                  <span key={kw.keyword} style={{
                    background: '#f4f4f7', border: `1px solid ${C.border}`,
                    borderRadius: 20, padding: '4px 12px',
                    fontSize: 12, fontWeight: 500, color: C.text2,
                  }}>
                    {kw.keyword}{i < result.keywords.length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Clusters — full width below */}
          {result.clusters?.length > 0 && (
            <div>
              <p style={{ fontSize: 10.5, fontWeight: 600, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Content Clusters</p>
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
                      background: '#ffffff',
                      border: `1px solid rgba(0,0,0,0.09)`,
                      borderLeft: `4px solid ${p.clr}`,
                      borderRadius: 16,
                      padding: '16px 18px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 6px 24px rgba(0,0,0,0.08)',
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

