import { useState } from 'react'

const API = 'http://localhost:8000'

const C = {
  bg: '#f5f5f7',
  card: '#fff',
  border: '#e8e8ec',
  text1: '#0f0f10',
  text2: '#3a3a3c',
  text3: '#8e8e93',
  red: '#ff3b30',
  green: '#34c759',
  blue: '#007aff',
  orange: '#ff9500',
  purple: '#af52de',
  blueBg: '#f0f6ff',
  greenBg: '#f0fdf4',
  orangeBg: '#fff7ed',
}

function ScoreRing({ score }) {
  const r = 44
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = score >= 75 ? C.green : score >= 50 ? C.orange : C.red

  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke={C.border} strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: '-1px' }}>{score}</span>
        <span style={{ fontSize: 10, color: C.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>/100</span>
      </div>
    </div>
  )
}

const BREAKDOWN_META = {
  length:           { label: 'Title length',        max: 25, why: 'Titles between 50–70 chars get the most clicks. Too short = no context. Too long = cut off in search results.' },
  power_words:      { label: 'Power words',          max: 20, why: 'Words like "Best", "Secret", "Shocking" trigger curiosity and emotion — proven to increase click-through rate.' },
  numbers:          { label: 'Numbers / digits',     max: 15, why: 'Numbered titles (e.g. "5 Tips", "24-Hour") outperform vague titles because they set clear expectations for the viewer.' },
  question:         { label: 'Question format',      max: 10, why: 'Questions create an open loop in the viewer\'s mind — they click to resolve it. Works especially well for "How" and "Why" titles.' },
  hook_format:      { label: 'Hook / curiosity gap', max: 10, why: 'Colons, brackets, or parentheses split the title into a promise + payoff — e.g. "Kenya Vlog: What Nobody Shows You".' },
  caps_emphasis:    { label: 'Caps emphasis',         max: 10, why: 'A single ALL CAPS word (e.g. "NEVER do this") creates visual contrast that draws attention in a crowded feed.' },
  keyword_relevance:{ label: 'Keyword relevance',    max: 10, why: 'Titles sharing keywords with top-viewed videos in your niche rank higher in YouTube search and suggested videos.' },
}

function BreakdownBar({ criterionKey, value, max }) {
  const [showWhy, setShowWhy] = useState(false)
  const meta = BREAKDOWN_META[criterionKey]
  const pct = Math.round((value / max) * 100)
  const color = pct >= 80 ? C.green : pct >= 40 ? C.orange : C.red
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: C.text2, fontWeight: 500 }}>{meta.label}</span>
          <button
            onClick={() => setShowWhy(v => !v)}
            style={{ width: 14, height: 14, borderRadius: '50%', border: `1px solid ${C.text3}`, background: 'transparent', cursor: 'pointer', fontSize: 9, fontWeight: 700, color: C.text3, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1 }}
          >?</button>
        </div>
        <span style={{ fontSize: 12, color, fontWeight: 700 }}>{value}/{max}</span>
      </div>
      <div style={{ height: 6, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>
      {showWhy && (
        <p style={{ fontSize: 11.5, color: C.text2, marginTop: 6, lineHeight: 1.55, background: '#f8f8fa', padding: '7px 10px', borderRadius: 7, borderLeft: `3px solid ${color}` }}>
          {meta.why}
        </p>
      )}
    </div>
  )
}

export default function TitleOptimizer() {
  const [title, setTitle]   = useState('')
  const [topic, setTopic]   = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [copied, setCopied] = useState(null)

  async function handleAnalyze() {
    if (!title.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch(`${API}/seo/analyze`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), topic: topic.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      setResult(data)
    } catch {
      setError('Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  function copyTitle(t, idx) {
    navigator.clipboard.writeText(t)
    setCopied(idx)
    setTimeout(() => setCopied(null), 1800)
  }

  const scoreLabel = result
    ? result.score >= 75 ? 'Strong' : result.score >= 50 ? 'Needs work' : 'Weak'
    : ''

  return (
    <div style={{ maxWidth: 820, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 3 }}>Title &amp; SEO Optimizer</h2>
        <p style={{ fontSize: 13, color: C.text3 }}>Score your title, compare it against top videos in your niche, and get AI-suggested alternatives.</p>
      </div>

      {/* Input card */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Your video title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            placeholder="e.g. How I grew my YouTube channel to 10k subscribers"
            style={{ width: '100%', padding: '10px 13px', fontSize: 14, border: `1.5px solid ${C.border}`, borderRadius: 9, fontFamily: 'inherit', outline: 'none', color: C.text1, background: '#fafafc', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
            onFocus={e => e.target.style.borderColor = C.blue}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <span style={{ fontSize: 11, color: title.length > 70 ? C.red : title.length >= 50 ? C.green : C.text3 }}>
              {title.length} chars {title.length >= 50 && title.length <= 70 ? '✓ ideal range' : title.length > 70 ? '— too long' : '— aim for 50–70'}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Niche / topic <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — helps find better comparisons)</span></label>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            placeholder="e.g. YouTube growth, personal finance, fitness"
            style={{ width: '100%', padding: '10px 13px', fontSize: 14, border: `1.5px solid ${C.border}`, borderRadius: 9, fontFamily: 'inherit', outline: 'none', color: C.text1, background: '#fafafc', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
            onFocus={e => e.target.style.borderColor = C.blue}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !title.trim()}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: title.trim() && !loading ? C.blue : '#c7c7cc', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', cursor: title.trim() && !loading ? 'pointer' : 'not-allowed', transition: 'background 0.15s' }}
        >
          {loading ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.93 2.93l1.41 1.41M9.66 9.66l1.41 1.41M2.93 11.07l1.41-1.41M9.66 4.34l1.41-1.41"/></svg>
              Analyzing…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="5"/><path d="m9 9 3 3"/></svg>
              Analyze title
            </>
          )}
        </button>

        {error && <p style={{ marginTop: 12, fontSize: 13, color: C.red }}>{error}</p>}
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Score + breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

            {/* Score card */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>SEO Score</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <ScoreRing score={result.score} />
                <div>
                  <p style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>{scoreLabel}</p>
                  <p style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.6 }}>
                    {result.score >= 75
                      ? 'Your title is well optimised. Small tweaks can push it further.'
                      : result.score >= 50
                      ? 'Decent start — apply the AI suggestions below to improve it.'
                      : 'Title needs significant improvement. Use the suggestions below.'}
                  </p>
                  {result.power_words_found?.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {result.power_words_found.map(w => (
                        <span key={w} style={{ fontSize: 10, fontWeight: 700, background: C.blueBg, color: C.blue, padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{w}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Breakdown card */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>Score breakdown</p>
              {Object.entries(BREAKDOWN_META).map(([key, meta]) => (
                <BreakdownBar key={key} criterionKey={key} value={result.breakdown[key] ?? 0} max={meta.max} />
              ))}
            </div>
          </div>

          {/* AI suggestions */}
          {result.suggestion_error && !result.suggestions?.length && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: C.orange, fontWeight: 600 }}>AI suggestions unavailable</p>
              <p style={{ fontSize: 12, color: C.text2, marginTop: 3 }}>{result.suggestion_error}</p>
            </div>
          )}
          {/* Fix These First */}
          {(() => {
            const fixes = Object.entries(BREAKDOWN_META).filter(([k]) => (result.breakdown[k] ?? 0) === 0)
            if (!fixes.length) return null
            return (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Fix these first — scoring 0 pts each</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {fixes.map(([key, meta]) => (
                    <div key={key} style={{ display: 'flex', gap: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.orange, minWidth: 90 }}>{meta.label}</span>
                      <span style={{ fontSize: 12, color: C.text2, lineHeight: 1.5 }}>{meta.why.split(' — ')[0].split('. ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {result.suggestions?.length > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>AI-suggested titles</p>
              <p style={{ fontSize: 12, color: C.text3, marginBottom: 16 }}>Scored with the same criteria as your title — click to copy</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.suggestions.map((s, i) => {
                  const scoreColor = s.score >= 70 ? C.green : s.score >= 50 ? C.orange : C.red
                  const delta = s.score - result.score
                  return (
                    <div
                      key={i}
                      onClick={() => copyTitle(s.title, i)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 14px', background: copied === i ? C.greenBg : C.blueBg, border: `1px solid ${copied === i ? '#bbf7d0' : '#c7dbff'}`, borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s' }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text1, lineHeight: 1.4 }}>{s.title}</p>
                        <p style={{ fontSize: 11, color: C.text3, marginTop: 3 }}>{s.length} chars</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 14, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{s.score}</p>
                          <p style={{ fontSize: 10, fontWeight: 700, color: delta >= 0 ? C.green : C.red, marginTop: 2 }}>
                            {delta >= 0 ? `+${delta}` : delta} vs yours
                          </p>
                        </div>
                        <span style={{ fontSize: 11, color: copied === i ? C.green : C.blue, fontWeight: 600, minWidth: 40 }}>
                          {copied === i ? '✓ Copied' : 'Copy'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Top videos in niche */}
          {result.top_videos?.length > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Top titles in your niche — vetted &amp; scored</p>
              <p style={{ fontSize: 12, color: C.text3, marginBottom: 16 }}>English-only, scored with our criteria, sorted best first — study these patterns</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {result.top_videos.map((v, i) => {
                  const sc = v.seo_score
                  const scColor = sc >= 70 ? C.green : sc >= 50 ? C.orange : C.red
                  return (
                    <div key={v.video_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < result.top_videos.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      {v.thumbnail && <img src={v.thumbnail} alt="" style={{ width: 64, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.text1, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.title}</p>
                        <p style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{v.channel}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 800, color: scColor }}>{sc}</p>
                        <p style={{ fontSize: 10, color: C.text3 }}>{v.title.length}ch</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

