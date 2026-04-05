import { useState, useEffect, useRef, useCallback } from 'react'

/* ─── Inject styles once ─────────────────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('thumb-iq-styles')) {
  const s = document.createElement('style')
  s.id = 'thumb-iq-styles'
  s.textContent = `
    @keyframes thumbFadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
    @keyframes thumbSpin    { to { transform: rotate(360deg) } }
    .tiq-card {
      background: #fff;
      border: 1px solid rgba(0,0,0,0.09);
      border-radius: 20px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08), 0 10px 32px rgba(0,0,0,0.12);
    }
    .tiq-section { animation: thumbFadeUp 0.28s ease both; }
    .tiq-upload-zone {
      border: 2px dashed #d0d0da;
      border-radius: 16px;
      padding: 48px 32px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }
    .tiq-upload-zone:hover, .tiq-upload-zone.drag-over {
      border-color: #e5251b;
      background: #fff8f8;
    }
    .tiq-bar-track {
      height: 6px; border-radius: 3px; background: #ebebef; overflow: hidden;
    }
    .tiq-bar-fill {
      height: 100%; border-radius: 3px;
      transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1);
    }
  `
  document.head.appendChild(s)
}

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const C = {
  red:     '#e5251b', redBg:  '#fff5f5', redBdr: '#fecaca',
  green:   '#16a34a', greenBg:'#f0fdf4', greenBdr:'#bbf7d0',
  amber:   '#d97706', amberBg:'#fffbeb', amberBdr:'#fde68a',
  orange:  '#ea580c', orangeBg:'#fff7ed',
  blue:    '#2563eb',
  text1:   '#111114', text2: '#52525b', text3: '#a0a0b0',
  border:  'rgba(0,0,0,0.09)',
}

function scoreColor(s, max = 100) {
  const pct = s / max * 100
  return pct >= 80 ? C.green : pct >= 65 ? C.amber : pct >= 50 ? C.orange : C.red
}
function scoreLabel(s, max = 100) {
  const pct = s / max * 100
  return pct >= 80 ? 'Strong' : pct >= 65 ? 'Needs work' : pct >= 50 ? 'Weak' : 'Critical'
}
function fmtPct(n) { return `${Math.round(n)}%` }

/* ─── Circular score ring ─────────────────────────────────────────────────── */
function ScoreRing({ score, max = 100, label, size = 120, strokeW = 8 }) {
  const r    = (size - strokeW * 2) / 2
  const cx   = size / 2
  const circ = 2 * Math.PI * r
  const dash = Math.max(0, Math.min(1, score / max)) * circ
  const col  = scoreColor(score, max)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#ebebed" strokeWidth={strokeW}/>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={col} strokeWidth={strokeW}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
      <text x={cx} y={cx - 6} textAnchor="middle" fill={col}
        fontSize={size * 0.195} fontWeight="800" fontFamily="Inter,sans-serif"
        style={{ fontVariantNumeric: 'tabular-nums' }}>{score}</text>
      <text x={cx} y={cx + 14} textAnchor="middle" fill={C.text3}
        fontSize="10" fontFamily="Inter,sans-serif">{label}</text>
    </svg>
  )
}

/* ─── Mini progress bar ───────────────────────────────────────────────────── */
function MiniBar({ value, max, color }) {
  return (
    <div className="tiq-bar-track">
      <div className="tiq-bar-fill" style={{ width: `${Math.min(100, value / max * 100)}%`, background: color }}/>
    </div>
  )
}

/* ─── Badge pill ──────────────────────────────────────────────────────────── */
function Badge({ text, color, bg, bdr }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: bg, color, border: `1px solid ${bdr}`,
      fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 20,
      letterSpacing: '0.03em',
    }}>{text}</span>
  )
}

/* ─── Layer 1 breakdown row ───────────────────────────────────────────────── */
const L1_META = {
  dimensions:      { label: 'Dimensions',       max: 5  },
  file_size:       { label: 'File Size',         max: 5  },
  contrast:        { label: 'Contrast',          max: 15 },
  face:            { label: 'Face & Emotion',    max: 10 },
  text_presence:   { label: 'Text Presence',     max: 10 },
  text_readability:{ label: 'Text Readability',  max: 10 },
  vibrancy:        { label: 'Color Vibrancy',    max: 5  },
}

function L1Row({ keyName, data, benchComp }) {
  const meta  = L1_META[keyName] || { label: keyName, max: 10 }
  const score = data?.score ?? 0
  const max   = meta.max
  const col   = scoreColor(score, max)
  const bench = benchComp?.[keyName]

  let indicator = null
  if (bench) {
    const diff = bench.pct_diff ?? 0
    if (diff >= 0)      indicator = { icon: '✓', color: C.green, label: `Niche avg: ${bench.benchmark}/${max}` }
    else if (diff > -20) indicator = { icon: '⚠', color: C.amber, label: `Niche avg: ${bench.benchmark}/${max}` }
    else                 indicator = { icon: '✗', color: C.red,   label: `Niche avg: ${bench.benchmark}/${max}` }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                  borderBottom: `1px solid #f0f0f4` }}>
      <div style={{ width: 130, flexShrink: 0 }}>
        <p style={{ fontSize: 12.5, fontWeight: 600, color: C.text1 }}>{meta.label}</p>
      </div>
      <div style={{ flex: 1 }}>
        <MiniBar value={score} max={max} color={col}/>
      </div>
      <div style={{ width: 48, textAlign: 'right', flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: col, fontVariantNumeric: 'tabular-nums' }}>
          {score}/{max}
        </span>
      </div>
      {indicator && (
        <div style={{ width: 130, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 11, color: indicator.color, fontWeight: 700 }}>{indicator.icon}</span>
          <span style={{ fontSize: 11, color: C.text3 }}>{indicator.label}</span>
        </div>
      )}
    </div>
  )
}

/* ─── Layer 2 dimension row ───────────────────────────────────────────────── */
const L2_LABELS = {
  facialEmotion:      'Facial Emotion',
  textPsychology:     'Text Psychology',
  colorPsychology:    'Color Psychology',
  composition:        'Composition',
  titleRelationship:  'Title Relationship',
  feedDistinctiveness:'Feed Distinctiveness',
}

function L2Row({ dimKey, dim }) {
  const [open, setOpen] = useState(false)
  if (!dim) return null
  const score = dim.score ?? 0
  const col   = scoreColor(score, 10)
  const hasFix = score < 8 && dim.fix

  return (
    <div style={{ borderBottom: `1px solid #f0f0f4` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                 display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
                 fontFamily: 'inherit', textAlign: 'left' }}
      >
        <div style={{ width: 160, flexShrink: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.text1 }}>{L2_LABELS[dimKey] || dimKey}</p>
        </div>
        <div style={{ flex: 1 }}>
          <MiniBar value={score} max={10} color={col}/>
        </div>
        <div style={{ width: 36, textAlign: 'right', flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: col, fontVariantNumeric: 'tabular-nums' }}>
            {score}/10
          </span>
        </div>
        <span style={{ fontSize: 11, color: C.text3, flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ paddingBottom: 12 }}>
          {dim.verdict && (
            <p style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.65, marginBottom: 8 }}>
              {dim.verdict}
            </p>
          )}
          {dim.vs_benchmark && (
            <p style={{ fontSize: 11.5, color: C.text3, lineHeight: 1.6, marginBottom: hasFix ? 8 : 0,
                        fontStyle: 'italic' }}>
              vs. top performers: {dim.vs_benchmark}
            </p>
          )}
          {hasFix && (
            <div style={{ borderLeft: `3px solid ${C.amber}`, paddingLeft: 10, background: C.amberBg,
                          borderRadius: '0 8px 8px 0', padding: '8px 10px 8px 12px' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.amber, marginBottom: 4,
                          letterSpacing: '0.06em', textTransform: 'uppercase' }}>Fix</p>
              <p style={{ fontSize: 12.5, color: '#92400e', lineHeight: 1.6 }}>{dim.fix}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Upload zone ─────────────────────────────────────────────────────────── */
function UploadZone({ onFile, noCompetitors }) {
  const inputRef = useRef(null)
  const [drag, setDrag]     = useState(false)
  const [title, setTitle]   = useState('')

  // Check for prefilled title from SEO Studio
  useEffect(() => {
    const prefill = localStorage.getItem('ytg_prefill_thumbnail_title')
    if (prefill) {
      setTitle(prefill)
      localStorage.removeItem('ytg_prefill_thumbnail_title')
    }
  }, [])

  function handleFiles(files) {
    const f = files[0]
    if (!f) return
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(f.type)) {
      alert('Only JPG and PNG files are accepted.')
      return
    }
    onFile(f, title.trim())
  }

  return (
    <div style={{ maxWidth: 580, margin: '0 auto' }}>
      <div
        className={`tiq-upload-zone${drag ? ' drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files) }}
      >
        <div style={{ fontSize: 32, marginBottom: 12 }}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ margin: '0 auto', display: 'block' }}>
            <rect width="44" height="44" rx="12" fill="#fef2f2"/>
            <path d="M22 14v16M14 22l8-8 8 8" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.text1, marginBottom: 6 }}>
          Drop your thumbnail here or click to upload
        </p>
        <p style={{ fontSize: 12.5, color: C.text3 }}>JPG or PNG · Max 4MB · Best at 1280×720</p>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png"
               style={{ display: 'none' }}
               onChange={e => handleFiles(e.target.files)}/>
      </div>

      <div style={{ marginTop: 16 }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Paste your video title for deeper analysis (optional)"
          style={{
            width: '100%', boxSizing: 'border-box',
            border: `1px solid ${C.border}`, borderRadius: 10,
            padding: '11px 14px', fontSize: 13.5, color: C.text1,
            background: '#fff', fontFamily: 'inherit', outline: 'none',
          }}
        />
      </div>

      {noCompetitors && (
        <div style={{ marginTop: 14, background: '#eff6ff', border: '1px solid #bfdbfe',
                      borderRadius: 12, padding: '12px 16px' }}>
          <p style={{ fontSize: 12.5, color: '#1d4ed8', lineHeight: 1.65 }}>
            For the most accurate benchmarks, run a competitor analysis first. Your thumbnails will be
            compared against top performers in your exact niche.
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── Main component ──────────────────────────────────────────────────────── */
export default function ThumbnailScore({ channelData, onNavigate }) {
  // state: 'loading' | 'idle' | 'uploading' | 'ready1' | 'analyzing' | 'ready2'
  const [state,    setState]    = useState('loading')
  const [analysis, setAnalysis] = useState(null)
  const [error,    setError]    = useState('')
  const [l1open,   setL1Open]   = useState(false)  // collapsible L1 in state 3

  const preloadRef = useRef(null)

  // ── On mount: load latest from DB ─────────────────────────────────────────
  useEffect(() => {
    fetch('/thumbnail/latest', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.analysis) {
          setAnalysis(d.analysis)
          setState(d.analysis.layer2_scores ? 'ready2' : 'ready1')
        } else {
          setState('idle')
        }
      })
      .catch(() => setState('idle'))
  }, [])

  // ── Check for "Score This" pre-load from Videos tab ────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem('ytg_score_this')
    if (!raw) return
    try {
      const { dataUrl, title } = JSON.parse(raw)
      localStorage.removeItem('ytg_score_this')
      preloadRef.current = { dataUrl, title }
    } catch {}
  }, [])

  // When idle, auto-trigger preloaded thumbnail
  useEffect(() => {
    if (state === 'idle' && preloadRef.current) {
      const { dataUrl, title } = preloadRef.current
      preloadRef.current = null
      // Convert data URL to File
      fetch(dataUrl)
        .then(r => r.blob())
        .then(blob => {
          const f = new File([blob], 'thumbnail.jpg', { type: blob.type || 'image/jpeg' })
          handleUpload(f, title)
        })
        .catch(() => {})
    }
  }, [state])  // eslint-disable-line

  // ── Upload handler ─────────────────────────────────────────────────────────
  async function handleUpload(file, videoTitle) {
    setState('uploading')
    setError('')

    const fd = new FormData()
    fd.append('file', file)
    fd.append('video_title', videoTitle || '')

    // Pull confirmed_keyword from SEO Studio localStorage if available
    try {
      const seoRaw = localStorage.getItem('seoOptimizer_v1')
      if (seoRaw) {
        const seoData = JSON.parse(seoRaw)
        const kw = seoData?.result?.search_terms?.[0] || ''
        if (kw) fd.append('confirmed_keyword', kw)
      }
    } catch {}

    try {
      const r = await fetch('/thumbnail/upload', {
        method: 'POST', credentials: 'include', body: fd,
      })
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error || 'Upload failed')
      setAnalysis(d.analysis)
      setState('ready1')
    } catch (e) {
      setError(e.message || 'Upload failed')
      setState('idle')
    }
  }

  // ── Layer 2 handler ────────────────────────────────────────────────────────
  async function handleAnalyze() {
    if (!analysis?.id) return
    setState('analyzing')
    setError('')
    try {
      const r = await fetch('/thumbnail/analyze', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thumbnail_id: analysis.id }),
      })
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error || 'Analysis failed')
      setAnalysis(d.analysis)
      setState('ready2')
    } catch (e) {
      setError(e.message || 'Analysis failed')
      setState('ready1')
    }
  }

  // ── Clear handler ──────────────────────────────────────────────────────────
  async function handleClear() {
    if (!analysis?.id) return
    await fetch('/thumbnail/clear', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thumbnail_id: analysis.id }),
    })
    setAnalysis(null)
    setState('idle')
  }

  // ── Copy share card ────────────────────────────────────────────────────────
  async function handleCopyCard() {
    const el = document.getElementById('tiq-share-card')
    if (!el) return
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(el, { useCORS: true, scale: 2 })
      canvas.toBlob(blob => {
        if (blob) navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      })
    } catch {}
  }

  // ─────────────────────────────────────────────────────────────────────────
  const l1    = analysis?.layer1_scores
  const l2    = analysis?.layer2_scores
  const bcomp = analysis?.benchmark_comparison || {}
  const algoScore  = analysis?.algorithm_score ?? 0
  const finalScore = analysis?.final_score ?? 0
  const keyword    = analysis?.confirmed_keyword || ''
  const fmt        = analysis?.format || ''
  const bracket    = analysis?.size_bracket || ''

  // ── Loading ────────────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, gap: 12 }}>
        <div style={{ width: 24, height: 24, border: `2.5px solid #ebebef`,
                      borderTop: `2.5px solid ${C.red}`, borderRadius: '50%',
                      animation: 'thumbSpin 0.7s linear infinite' }}/>
        <p style={{ color: C.text3, fontSize: 13 }}>Loading…</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a0a0f', letterSpacing: '-0.7px', marginBottom: 5 }}>
          Thumbnail IQ
        </h1>
        <p style={{ fontSize: 13.5, color: C.text3 }}>See how your thumbnail performs before you publish</p>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: C.redBg, border: `1px solid ${C.redBdr}`, borderRadius: 12,
                      padding: '12px 16px', marginBottom: 20, fontSize: 13, color: C.red }}>
          {error}
        </div>
      )}

      {/* ── STATE: idle ─────────────────────────────────────────────────── */}
      {(state === 'idle' || state === 'uploading') && (
        <div className="tiq-section">
          {state === 'uploading' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                          justifyContent: 'center', minHeight: 280, gap: 14 }}>
              <div style={{ width: 32, height: 32, border: `2.5px solid #ebebef`,
                            borderTop: `2.5px solid ${C.red}`, borderRadius: '50%',
                            animation: 'thumbSpin 0.7s linear infinite' }}/>
              <p style={{ color: C.text3, fontSize: 13 }}>Analyzing your thumbnail…</p>
            </div>
          ) : (
            <UploadZone onFile={handleUpload} noCompetitors={false}/>
          )}
        </div>
      )}

      {/* ── STATE: Layer 1 ready ─────────────────────────────────────────── */}
      {(state === 'ready1' || state === 'analyzing' || state === 'ready2') && l1 && (
        <div className="tiq-section">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 20 }}>

            {/* LEFT: thumbnail preview */}
            <div>
              <div className="tiq-card" style={{ overflow: 'hidden' }}>
                {analysis.thumbnail_b64
                  ? <img src={`data:image/jpeg;base64,${analysis.thumbnail_b64}`} alt="Your thumbnail"
                         style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }}/>
                  : <div style={{ width: '100%', aspectRatio: '16/9', background: '#ebebef' }}/>
                }
                {/* Benchmark context */}
                {keyword && (
                  <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}` }}>
                    <p style={{ fontSize: 11.5, color: C.text3, lineHeight: 1.6 }}>
                      Benchmarked against <strong style={{ color: C.text2 }}>top {fmt}</strong> videos
                      {' · '}<strong style={{ color: C.text2 }}>{bracket}</strong> channels
                      {' · '}<em>"{keyword}"</em>
                    </p>
                  </div>
                )}
              </div>

              {/* Emotion + feed badges (Layer 2 only) */}
              {state === 'ready2' && l2 && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {l2.emotionLabel && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.text3, width: 90, flexShrink: 0 }}>
                        Emotion
                      </span>
                      <Badge text={l2.emotionLabel}
                        color={l2.emotionLabel.toLowerCase().includes('neutral') ? C.amber : C.green}
                        bg={l2.emotionLabel.toLowerCase().includes('neutral') ? C.amberBg : C.greenBg}
                        bdr={l2.emotionLabel.toLowerCase().includes('neutral') ? C.amberBdr : C.greenBdr}
                      />
                    </div>
                  )}
                  {l2.feedPosition && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.text3, width: 90, flexShrink: 0 }}>
                        Feed
                      </span>
                      <Badge
                        text={l2.feedPosition === 'stands out' ? 'Stands Out' : l2.feedPosition === 'disappears' ? 'Disappears' : 'Blends In'}
                        color={l2.feedPosition === 'stands out' ? C.green : l2.feedPosition === 'disappears' ? C.red : C.amber}
                        bg={l2.feedPosition === 'stands out' ? C.greenBg : l2.feedPosition === 'disappears' ? C.redBg : C.amberBg}
                        bdr={l2.feedPosition === 'stands out' ? C.greenBdr : l2.feedPosition === 'disappears' ? C.redBdr : C.amberBdr}
                      />
                    </div>
                  )}
                  {l2.clickPrediction && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.text3, width: 90, flexShrink: 0 }}>
                        CTR
                      </span>
                      <Badge
                        text={l2.clickPrediction === 'above niche average' ? 'Above Niche Avg' : l2.clickPrediction === 'below niche average' ? 'Below Niche Avg' : 'At Niche Avg'}
                        color={l2.clickPrediction === 'above niche average' ? C.green : l2.clickPrediction === 'below niche average' ? C.red : C.amber}
                        bg={l2.clickPrediction === 'above niche average' ? C.greenBg : l2.clickPrediction === 'below niche average' ? C.redBg : C.amberBg}
                        bdr={l2.clickPrediction === 'above niche average' ? C.greenBdr : l2.clickPrediction === 'below niche average' ? C.redBdr : C.amberBdr}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Clear link */}
              <button onClick={handleClear}
                style={{ marginTop: 14, background: 'none', border: 'none', cursor: 'pointer',
                         fontSize: 12, color: C.text3, fontFamily: 'inherit', padding: 0,
                         textDecoration: 'underline', textUnderlineOffset: 2 }}>
                Clear &amp; Upload New
              </button>
            </div>

            {/* RIGHT */}
            <div>
              {/* Score ring + stats row */}
              <div className="tiq-card" style={{ padding: '24px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
                  {state === 'ready2' && l2 ? (
                    // Two concentric rings for final state
                    <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
                      <ScoreRing score={finalScore} max={100} label="Thumbnail IQ" size={120} strokeW={8}/>
                      <div style={{ position: 'absolute', top: '50%', left: '50%',
                                    transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}/>
                    </div>
                  ) : (
                    <div style={{ flexShrink: 0 }}>
                      <ScoreRing score={algoScore} max={60} label="Technical Score" size={120} strokeW={8}/>
                    </div>
                  )}

                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                    {[
                      { label: 'Your Score',    value: state === 'ready2' ? `${finalScore}/100` : `${algoScore}/60` },
                      { label: 'Niche Average', value: analysis.niche_avg_score ? `${Math.round(analysis.niche_avg_score)}/60` : '—' },
                      { label: 'You Beat',      value: analysis.user_percentile != null ? `${fmtPct(analysis.user_percentile)}` : '—',
                        sub: 'of similar channels' },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center', background: '#f7f7fa',
                                                   borderRadius: 12, padding: '12px 8px' }}>
                        <p style={{ fontSize: 10, fontWeight: 600, color: C.text3, marginBottom: 6,
                                    textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: C.text1,
                                    fontVariantNumeric: 'tabular-nums' }}>{s.value}</p>
                        {s.sub && <p style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>{s.sub}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score label bar */}
                <div style={{ background: scoreColor(state === 'ready2' ? finalScore : algoScore, state === 'ready2' ? 100 : 60) + '18',
                              border: `1px solid ${scoreColor(state === 'ready2' ? finalScore : algoScore, state === 'ready2' ? 100 : 60)}30`,
                              borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%',
                                background: scoreColor(state === 'ready2' ? finalScore : algoScore, state === 'ready2' ? 100 : 60), flexShrink: 0 }}/>
                  <p style={{ fontSize: 12.5, fontWeight: 700,
                               color: scoreColor(state === 'ready2' ? finalScore : algoScore, state === 'ready2' ? 100 : 60) }}>
                    {scoreLabel(state === 'ready2' ? finalScore : algoScore, state === 'ready2' ? 100 : 60)}
                    {state !== 'ready2' && ' — technical score only'}
                  </p>
                </div>
              </div>

              {/* Layer 2 full breakdown */}
              {state === 'ready2' && l2 && (
                <div className="tiq-card" style={{ padding: '20px 24px', marginBottom: 16 }}>
                  {/* Collapsible L1 */}
                  <button
                    onClick={() => setL1Open(o => !o)}
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                             display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                             padding: '0 0 12px', fontFamily: 'inherit' }}
                  >
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>
                      Technical — {algoScore}/60
                    </p>
                    <span style={{ fontSize: 11, color: C.text3 }}>{l1open ? 'Hide ▲' : 'Show ▼'}</span>
                  </button>

                  {l1open && (
                    <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid #f0f0f4` }}>
                      {Object.entries(L1_META).map(([k]) => (
                        <L1Row key={k} keyName={k} data={l1[k]} benchComp={bcomp}/>
                      ))}
                    </div>
                  )}

                  {/* L2 breakdown */}
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, paddingBottom: 10,
                               borderBottom: `1px solid #f0f0f4`, marginBottom: 4 }}>
                    AI Analysis — {l2.claude_score ?? 0}/40
                  </p>
                  {Object.entries(l2.scores || {}).map(([k, v]) => (
                    <L2Row key={k} dimKey={k} dim={v}/>
                  ))}
                </div>
              )}

              {/* Technical breakdown (state ready1) */}
              {state === 'ready1' && (
                <div className="tiq-card" style={{ padding: '20px 24px', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, marginBottom: 4 }}>
                    Technical breakdown
                  </p>
                  {Object.entries(L1_META).map(([k]) => (
                    <L1Row key={k} keyName={k} data={l1[k]} benchComp={bcomp}/>
                  ))}
                </div>
              )}

              {/* Win / Fix summary cards (Layer 2) */}
              {state === 'ready2' && l2 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div style={{ borderLeft: `3px solid ${C.green}`, background: C.greenBg,
                                borderRadius: '0 12px 12px 0', padding: '14px 16px' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: C.green, marginBottom: 6,
                                letterSpacing: '0.06em', textTransform: 'uppercase' }}>Biggest Win</p>
                    <p style={{ fontSize: 12.5, color: '#166534', lineHeight: 1.65 }}>{l2.biggestWin}</p>
                  </div>
                  <div style={{ borderLeft: `3px solid ${C.red}`, background: C.redBg,
                                borderRadius: '0 12px 12px 0', padding: '14px 16px' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: C.red, marginBottom: 6,
                                letterSpacing: '0.06em', textTransform: 'uppercase' }}>Biggest Fix</p>
                    <p style={{ fontSize: 12.5, color: '#991b1b', lineHeight: 1.65 }}>{l2.biggestFix}</p>
                  </div>
                </div>
              )}

              {/* Overall verdict (Layer 2) */}
              {state === 'ready2' && l2?.overallVerdict && (
                <div className="tiq-card" style={{ padding: '16px 20px', marginBottom: 16,
                                                    borderLeft: `3px solid ${C.blue}` }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: C.blue, marginBottom: 6,
                              letterSpacing: '0.06em', textTransform: 'uppercase' }}>Overall verdict</p>
                  <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.7 }}>{l2.overallVerdict}</p>
                </div>
              )}

              {/* CTA: Run Full Thumbnail IQ */}
              {(state === 'ready1') && (
                <div style={{ marginTop: 4 }}>
                  <button
                    onClick={handleAnalyze}
                    style={{
                      width: '100%', height: 48, background: C.red, color: '#fff',
                      border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px',
                      boxShadow: `0 2px 8px rgba(229,37,27,0.3), 0 8px 24px rgba(229,37,27,0.2)`,
                      transition: 'filter 0.15s, transform 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = '' }}
                  >
                    Run Full Thumbnail IQ — 1 AI analysis
                  </button>
                </div>
              )}

              {/* Analyzing spinner */}
              {state === 'analyzing' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                              gap: 12, padding: '20px 0' }}>
                  <div style={{ width: 20, height: 20, border: `2.5px solid #ebebef`,
                                borderTop: `2.5px solid ${C.red}`, borderRadius: '50%',
                                animation: 'thumbSpin 0.7s linear infinite' }}/>
                  <p style={{ color: C.text3, fontSize: 13 }}>Running Thumbnail IQ…</p>
                </div>
              )}

              {/* Shareable card (Layer 2 only) */}
              {state === 'ready2' && l2 && (
                <div style={{ marginTop: 8 }}>
                  <div id="tiq-share-card" style={{
                    background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
                    borderRadius: 16, padding: '24px', display: 'flex', gap: 16, alignItems: 'flex-start',
                  }}>
                    {analysis.thumbnail_b64 && (
                      <img src={`data:image/jpeg;base64,${analysis.thumbnail_b64}`} alt=""
                           style={{ width: 80, height: 45, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}/>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
                                       letterSpacing: '0.12em', textTransform: 'uppercase' }}>YTGrowth</span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>·</span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Thumbnail IQ</span>
                      </div>
                      <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8,
                                  fontVariantNumeric: 'tabular-nums' }}>
                        {finalScore}<span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>/100</span>
                      </p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {l2.emotionLabel && (
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)',
                                         background: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: '3px 8px' }}>
                            {l2.emotionLabel}
                          </span>
                        )}
                        {l2.feedPosition && (
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)',
                                         background: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: '3px 8px' }}>
                            {l2.feedPosition}
                          </span>
                        )}
                        {keyword && (
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
                                         background: 'rgba(255,255,255,0.07)', borderRadius: 6, padding: '3px 8px' }}>
                            "{keyword}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyCard}
                    style={{ marginTop: 8, width: '100%', background: '#f7f7fa', border: `1px solid ${C.border}`,
                             borderRadius: 10, padding: '10px', fontSize: 12.5, fontWeight: 600,
                             color: C.text2, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#ebebef' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f7f7fa' }}
                  >
                    Copy Result Card
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
