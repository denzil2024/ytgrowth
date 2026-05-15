import { useEffect, useState } from 'react'
import CreditsEmptyModal from '../components/CreditsEmptyModal'

const API = ''

const C = {
  red:    '#e5251b', redBg:   '#fff5f5', redBdr:   '#fecaca',
  green:  '#16a34a', greenBg: '#f0fdf4', greenBdr: '#bbf7d0',
  amber:  '#d97706', amberBg: '#fffbeb', amberBdr: '#fde68a',
  text1:  '#0f0f13',
  text2:  '#4a4a58',
  text3:  '#9595a4',
  border: '#e6e6ec',
  card:   '#ffffff',
}

// Geist page-scoped — matches Chat / Competitors / Keywords / Outliers / WeeklyReport.
if (typeof document !== 'undefined' && !document.getElementById('au-geist-font')) {
  const link = document.createElement('link')
  link.id = 'au-geist-font'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap'
  document.head.appendChild(link)
}

if (typeof document !== 'undefined' && !document.getElementById('ytg-au-styles')) {
  const s = document.createElement('style')
  s.id = 'ytg-au-styles'
  s.textContent = `
    /* Centered 1040 column + Geist inheritance, matches the rest of the
       redesigned pages. */
    .au-page { max-width: 1040px; margin: 0 auto; }
    .au-page * { box-sizing: border-box; font-family: 'Geist', 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
    .au-page p, .au-page span, .au-page div { margin: 0; }

    @keyframes auSpin { to { transform: rotate(360deg) } }
    @keyframes auIn   { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
    .au-in { animation: auIn 0.26s ease both; }

    /* Card grammar matches Competitors: hairline border, 14px radius, single
       soft shadow + lit-from-above inset highlight, 200ms cubic-bezier hover. */
    .au-card {
      background: #ffffff;
      border: 1px solid rgba(10,10,15,0.07);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(255,255,255,0.7);
      transition: box-shadow 200ms cubic-bezier(0.2,0.7,0.3,1), transform 200ms cubic-bezier(0.2,0.7,0.3,1), border-color 200ms cubic-bezier(0.2,0.7,0.3,1);
    }
    .au-card:hover {
      box-shadow: 0 4px 16px rgba(15,15,25,0.06), inset 0 1px 0 rgba(255,255,255,0.7);
      border-color: rgba(10,10,15,0.14);
      transform: translateY(-1px);
    }

    /* Quiet view-switch tabs (Competitors / Keywords / Outliers / My Videos
       pattern). NEVER red active — red is for primary CTAs only. */
    .au-tab-btn {
      background: transparent; color: rgba(10,10,15,0.55);
      border: 1px solid transparent; border-radius: 100px;
      padding: 8px 16px; font-size: 13px; font-weight: 500;
      font-family: inherit;
      cursor: pointer; white-space: nowrap;
      transition: background 180ms cubic-bezier(0.32, 0.72, 0, 1), color 180ms cubic-bezier(0.32, 0.72, 0, 1), border-color 180ms cubic-bezier(0.32, 0.72, 0, 1);
      letter-spacing: -0.01em;
    }
    .au-tab-btn:hover:not(.active) {
      background: rgba(10,10,15,0.03); color: #0a0a0f;
    }
    .au-tab-btn.active {
      background: rgba(10,10,15,0.055); color: #0a0a0f;
      border-color: rgba(10,10,15,0.10);
      font-weight: 600;
    }

    .au-btn-primary {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 18px; border-radius: 100px; border: none;
      font-size: 13px; font-weight: 600; color: #fff;
      background: ${C.red}; cursor: pointer; white-space: nowrap;
      box-shadow: 0 1px 2px rgba(229,37,27,0.20), inset 0 1px 0 rgba(255,255,255,0.22);
      transition: filter 160ms cubic-bezier(0.32,0.72,0,1), transform 160ms cubic-bezier(0.32,0.72,0,1);
      letter-spacing: -0.01em;
    }
    .au-btn-primary:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-1px); }
    .au-btn-primary:disabled { background: rgba(10,10,15,0.06); color: rgba(10,10,15,0.26); cursor: default; box-shadow: none; }

    .au-btn-outline {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 9px 18px; border-radius: 100px;
      font-size: 13px; font-weight: 700;
      background: #fff; color: ${C.red}; border: 1px solid ${C.red};
      cursor: pointer; white-space: nowrap;
      transition: background 0.15s;
    }
    .au-btn-outline:hover { background: rgba(229,37,27,0.06); }

    .au-report-wrapper { position: relative; margin-bottom: 14px; }
    .au-report-header {
      background: #ffffff;
      border: 1px solid rgba(10,10,15,0.07);
      border-radius: 14px;
      box-shadow: 0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(255,255,255,0.7);
      padding: 18px 22px;
      display: flex; align-items: center; gap: 16px;
      transition: box-shadow 200ms cubic-bezier(0.2,0.7,0.3,1), transform 200ms cubic-bezier(0.2,0.7,0.3,1), border-color 200ms cubic-bezier(0.2,0.7,0.3,1);
      cursor: pointer; user-select: none;
    }
    .au-report-header:hover {
      box-shadow: 0 4px 16px rgba(15,15,25,0.06), inset 0 1px 0 rgba(255,255,255,0.7);
      border-color: rgba(10,10,15,0.14);
      transform: translateY(-1px);
    }
    .au-report-remove {
      position: absolute; top: 12px; right: 12px;
      width: 28px; height: 28px; border-radius: 8px;
      border: 1px solid transparent; background: transparent;
      color: #c4c4cc; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      opacity: 0;
      transition: opacity 0.15s, background 0.15s, color 0.15s, border-color 0.15s;
      z-index: 2;
    }
    .au-report-wrapper:hover .au-report-remove { opacity: 1; }
    .au-report-remove:hover {
      background: rgba(229,37,27,0.08);
      border-color: rgba(229,37,27,0.2);
      color: ${C.red};
    }
    .au-chip {
      display: inline-flex; align-items: baseline; gap: 4px;
      background: #f4f4f6; border: 1px solid rgba(0,0,0,0.09);
      border-radius: 8px; padding: 4px 10px;
    }
    .au-chip .val { font-size: 12px; font-weight: 700; color: ${C.text1}; }
    .au-chip .lbl { font-size: 11px; color: ${C.text3}; font-weight: 500; }

    /* Eligible-videos grid — 4 cols default (everything down to ~900px).
       Was 5 cols above 1500px which crammed the metrics; the user wants a
       consistent 4-up rhythm across desktop widths. */
    .au-eligible-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
    }
    @media (max-width: 900px) {
      .au-eligible-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 560px) {
      .au-eligible-grid { grid-template-columns: 1fr; }
    }

    /* Video card — same card grammar as .au-card but flex column so the
       footer (KPI strip + button) sticks to the bottom regardless of how
       many lines the title takes. */
    .au-video-card {
      background: #fff;
      border: 1px solid rgba(10,10,15,0.07);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(255,255,255,0.7);
      transition: box-shadow 200ms cubic-bezier(0.2,0.7,0.3,1), transform 200ms cubic-bezier(0.2,0.7,0.3,1), border-color 200ms cubic-bezier(0.2,0.7,0.3,1);
      display: flex; flex-direction: column;
    }
    .au-video-card:hover {
      box-shadow: 0 4px 16px rgba(15,15,25,0.06), inset 0 1px 0 rgba(255,255,255,0.7);
      border-color: rgba(10,10,15,0.14);
      transform: translateY(-1px);
    }
    .au-video-cta {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      width: 100%; padding: 11px 16px; border-radius: 100px;
      font-size: 13px; font-weight: 600; letter-spacing: -0.01em;
      background: ${C.red}; color: #fff; border: none; cursor: pointer;
      box-shadow: 0 1px 2px rgba(229,37,27,0.20);
      transition: filter 160ms cubic-bezier(0.32,0.72,0,1), transform 160ms cubic-bezier(0.32,0.72,0,1);
      font-family: inherit; white-space: nowrap;
    }
    .au-video-cta:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-1px); }
    .au-video-cta:disabled { background: rgba(10,10,15,0.06); color: rgba(10,10,15,0.26); cursor: default; box-shadow: none; }
  `
  document.head.appendChild(s)
}


function ScoreRing({ score, color }) {
  const r = 30
  const circ = 2 * Math.PI * r
  const filled = (Math.max(0, Math.min(100, score || 0)) / 100) * circ
  return (
    <div style={{ position: 'relative', width: 78, height: 78, flexShrink: 0 }}>
      <svg width="78" height="78" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="39" cy="39" r={r} fill="none" stroke="#eeeef3" strokeWidth="6" />
        <circle cx="39" cy="39" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.8px', lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, color: C.text3, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>/100</span>
      </div>
    </div>
  )
}

function relTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const sec = Math.floor((Date.now() - d.getTime()) / 1000)
  if (sec < 60) return 'just now'
  const m = Math.floor(sec / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60);   if (h < 24) return `${h}h ago`
  const day = Math.floor(h / 24); if (day < 7) return `${day}d ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function verdictMeta(verdict, score) {
  if (verdict === 'winner' || score >= 85)
    return { label: 'Winner',          color: C.green, bg: C.greenBg, bdr: C.greenBdr }
  if (verdict === 'underperformer' || score < 60)
    return { label: 'Underperformer', color: C.red,   bg: C.redBg,   bdr: C.redBdr }
  return    { label: 'Average',        color: C.amber, bg: C.amberBg, bdr: C.amberBdr }
}


function ReportCard({ data, video, onClose }) {
  if (!data) return null
  const v = verdictMeta(data.verdict, data.score)
  const scoreColor = v.color
  const m = data.metrics || {}
  return (
    <div className="au-in" style={{
      background: '#fff', border: '1px solid rgba(10,10,15,0.07)', borderRadius: 14,
      borderTop: `3px solid ${scoreColor}`,
      boxShadow: '0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
      padding: '24px 26px 24px', marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 18 }}>
        {video?.thumbnail && (
          <img src={video.thumbnail} alt="" referrerPolicy="no-referrer"
            style={{ width: 130, height: 73, objectFit: 'cover', borderRadius: 10, flexShrink: 0,
              border: '1px solid rgba(10,10,15,0.07)' }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(10,10,15,0.50)', letterSpacing: '0.10em',
            textTransform: 'uppercase', marginBottom: 6 }}>Video review</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: C.text1, letterSpacing: '-0.2px',
            lineHeight: 1.4, marginBottom: 10,
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {video?.title}
          </p>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700,
            color: v.color, background: v.bg, border: `1px solid ${v.bdr}`,
            borderRadius: 100, padding: '3px 11px', letterSpacing: '0.10em',
            textTransform: 'uppercase',
          }}>{v.label}</span>
        </div>
        <ScoreRing score={data.score || 0} color={scoreColor} />
      </div>

      {data.headline && (
        <p style={{ fontSize: 14, color: C.text1, fontWeight: 500,
          lineHeight: 1.65, marginBottom: 20, letterSpacing: '-0.005em' }}>
          {data.headline}
        </p>
      )}

      {/* Metric strip — the key inputs the verdict was built on */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
        gap: 8, marginBottom: 18,
      }}>
        {[
          ['Views',           Number(m.views || 0).toLocaleString()],
          ['CTR',             m.ctr_pct != null ? `${m.ctr_pct}%` : '—'],
          ['APV',             m.apv_pct != null ? `${m.apv_pct}%` : '—'],
          ['AVD',             m.avd_seconds != null ? `${m.avd_seconds}s` : '—'],
          ['Subs gained',     m.subs_gained != null ? m.subs_gained : '—'],
          ['Shares',          m.shares != null ? m.shares : '—'],
          ['vs baseline',     m.vs_baseline_pct != null ? `${m.vs_baseline_pct >= 0 ? '+' : ''}${m.vs_baseline_pct}%` : '—'],
        ].map(([lbl, val]) => (
          <div key={lbl} style={{
            background: '#fafafb', border: `1px solid ${C.border}`,
            borderRadius: 10, padding: '8px 11px',
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.text3,
              letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 3 }}>{lbl}</p>
            <p style={{ fontSize: 14, fontWeight: 800, color: C.text1,
              fontVariantNumeric: 'tabular-nums' }}>{val}</p>
          </div>
        ))}
      </div>

      {/* What worked / What didn't — paired panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
        <div style={{ background: C.greenBg, border: `1px solid ${C.greenBdr}`,
          borderRadius: 12, padding: '12px 14px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.green,
            letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8 }}>What worked</p>
          {(data.what_worked || []).map((b, i) => (
            <p key={i} style={{ fontSize: 13, color: C.text1, lineHeight: 1.5,
              marginBottom: i < (data.what_worked.length - 1) ? 6 : 0 }}>• {b}</p>
          ))}
          {!(data.what_worked || []).length && (
            <p style={{ fontSize: 13, color: C.text3 }}>Nothing stood out.</p>
          )}
        </div>
        <div style={{ background: C.redBg, border: `1px solid ${C.redBdr}`,
          borderRadius: 12, padding: '12px 14px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.red,
            letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8 }}>What didn't</p>
          {(data.what_didnt || []).map((b, i) => (
            <p key={i} style={{ fontSize: 13, color: C.text1, lineHeight: 1.5,
              marginBottom: i < (data.what_didnt.length - 1) ? 6 : 0 }}>• {b}</p>
          ))}
          {!(data.what_didnt || []).length && (
            <p style={{ fontSize: 13, color: C.text3 }}>No major issues found.</p>
          )}
        </div>
      </div>

      {/* Next actions — amber top border (matches insight-card pattern) */}
      {(data.next_actions || []).length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.text3,
            letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 10 }}>
            Test on your next video
          </p>
          <div style={{ display: 'grid', gap: 10 }}>
            {data.next_actions.map((a, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid rgba(10,10,15,0.07)',
                borderLeft: `3px solid ${C.amber}`,
                borderRadius: '0 12px 12px 0', padding: '14px 16px',
                display: 'flex', alignItems: 'flex-start', gap: 12,
                boxShadow: '0 1px 2px rgba(15,15,25,0.03)',
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: C.amber, fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1.55, minWidth: 18, flexShrink: 0,
                }}>{i + 1}.</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text1,
                    lineHeight: 1.55, marginBottom: 4, letterSpacing: '-0.005em' }}>{a.action}</p>
                  {a.expectedOutcome && (
                    <p style={{ fontSize: 12.5, color: C.green, fontWeight: 500, lineHeight: 1.55, letterSpacing: '-0.005em' }}>
                      → {a.expectedOutcome}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {onClose && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <button onClick={onClose} className="au-btn-outline">Close</button>
        </div>
      )}
    </div>
  )
}


// ── Helpers — copied verbatim from Dashboard.jsx so the eligible grid uses
// the exact same thumbnail-fallback ladder, time formatting and number
// formatting as the Videos tab. Do not "improve" these. ────────────────────
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
  }
}
function makeThumbOnError(videoId, fallbackUrl) {
  return (e) => _advanceThumb(e.target, videoId, fallbackUrl)
}
function makeThumbOnLoad(videoId, fallbackUrl) {
  return (e) => {
    const step = e.target.dataset.thumbStep || 'max'
    if (step === 'max' && e.target.naturalWidth === 120 && e.target.naturalHeight === 90) {
      _advanceThumb(e.target, videoId, fallbackUrl)
    }
  }
}
function parseUTC(str) {
  if (!str) return null
  const s = str.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(str) ? str : str + 'Z'
  return new Date(s)
}
function relTimeLong(str) {
  const d = parseUTC(str)
  if (!d || isNaN(d)) return ''
  const days = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (days < 1)   return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7)   return `${days} days ago`
  if (days < 30)  { const w = Math.floor(days / 7);  return w === 1 ? 'a week ago'  : `${w} weeks ago` }
  if (days < 365) { const m = Math.floor(days / 30); return m === 1 ? 'a month ago' : `${m} months ago` }
  const y = Math.floor(days / 365); return y === 1 ? 'a year ago' : `${y} years ago`
}
function fmtNum(n) {
  if (n == null) return '—'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toLocaleString()
}

export default function Autopsy({ videos = [], channelId = '', optimizations = [], goToTracked = null }) {
  // Map video_id → boolean for fast lookup of "this video also has a tracked
  // optimisation." Drives the small cross-link on each Reports row that lets
  // the user jump to the deltas-view counterpart of the AI-verdict view.
  const optimizedVideoIds = new Set((optimizations || []).map(o => o.video_id))
  const [activeTab, setActiveTab] = useState('new')
  const [reports,  setReports]    = useState([])
  const [loadingReports,  setLoadingReports]  = useState(false)
  const [running,  setRunning]   = useState(null)  // video_id currently being analysed
  const [result,   setResult]    = useState(null)  // { id, video_id, video_title, thumbnail, result }
  const [error,    setError]     = useState('')
  const [creditsOut, setCreditsOut] = useState(false)
  const [videoSort, setVideoSort] = useState('date')

  // Build "videos at least 7 days old" client-side from the same `videos`
  // array the Videos tab uses — same data, same fields, same formatting.
  const MIN_AGE_DAYS = 7
  const eligible = (videos || []).filter(v => {
    const d = parseUTC(v.published_at)
    if (!d || isNaN(d)) return false
    const age = Math.floor((Date.now() - d.getTime()) / 86400000)
    return age >= MIN_AGE_DAYS
  })

  // Lookup table: which videos already have an autopsy on file?
  const autopsyByVideo = {}
  for (const r of reports) autopsyByVideo[r.video_id] = r

  async function fetchReports() {
    setLoadingReports(true)
    try {
      const r = await fetch(`${API}/autopsy/list`, { credentials: 'include' })
      if (!r.ok) return
      const d = await r.json()
      setReports(d.reports || [])
    } catch {} finally { setLoadingReports(false) }
  }

  useEffect(() => { fetchReports() }, [])

  async function runAutopsy(video) {
    if (running) return
    setRunning(video.video_id)
    setError('')
    setResult(null)
    try {
      const r = await fetch(`${API}/autopsy/analyze`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: video.video_id }),
      })
      if (r.status === 401) { window.location = '/'; return }
      if (r.status === 402) { setCreditsOut(true); return }
      const d = await r.json()
      if (!r.ok) { setError(d.error || "Something went wrong on our end. Email support@ytgrowth.io and we'll sort it out."); return }
      setResult(d)
      window.dispatchEvent(new CustomEvent('ytg:credits-changed'))
      // Refresh the reports list so the eligible cards know which have an
      // autopsy on file (autopsyByVideo lookup keys off `reports`).
      fetchReports()
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError('Could not reach the server.')
    } finally {
      setRunning(null)
    }
  }

  function openReport(r) {
    setResult({
      id:          r.id,
      video_id:    r.video_id,
      video_title: r.video_title,
      thumbnail:   r.thumbnail,
      result:      r.result,
    })
    setActiveTab('new')
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteReport(reportId, e) {
    if (e) e.stopPropagation()
    setReports(prev => prev.filter(x => x.id !== reportId))
    try { await fetch(`${API}/autopsy/${reportId}`, { method: 'DELETE', credentials: 'include' }) } catch {}
  }

  return (
    <div className="au-page" style={{ color: C.text1 }}>

      {/* Header — H1 + single subtitle line. Matches the Outliers / Keywords /
          Competitors header rhythm: 26 / 700 / -0.7px with a 14 / 500 / muted
          subtitle on one line. */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text1,
          letterSpacing: '-0.7px', marginBottom: 6, lineHeight: 1.1 }}>
          Video Review
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(10,10,15,0.55)', fontWeight: 500,
          letterSpacing: '-0.005em', lineHeight: 1.45 }}>
          For videos at least 7 days old · what worked, what didn't, what to test next · 1 credit per review
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          className={`au-tab-btn ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}>
          New review
        </button>
        <button
          className={`au-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}>
          {reports.length > 0 ? `Reports (${reports.length})` : 'Reports'}
        </button>
      </div>

      {/* ── NEW autopsy tab ─────────────────────────────────────────── */}
      {activeTab === 'new' && (<>
        {result && (
          <ReportCard
            data={result.result}
            video={{ title: result.video_title, thumbnail: result.thumbnail }}
            onClose={() => setResult(null)}
          />
        )}

        {error && (
          <div style={{
            background: C.redBg, border: `1px solid ${C.redBdr}`, borderRadius: 10,
            padding: '10px 14px', marginBottom: 14, color: C.red, fontSize: 13.5,
          }}>{error}</div>
        )}

        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(10,10,15,0.50)',
            letterSpacing: '0.10em', textTransform: 'uppercase' }}>
            Pick a video to review
          </p>
          <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(10,10,15,0.50)', letterSpacing: '-0.005em' }}>
            Each review costs 1 credit
          </p>
        </div>

        {eligible.length === 0 ? (
          <div style={{
            padding: '48px 24px', textAlign: 'center',
            background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.text1,
              letterSpacing: '-0.2px', marginBottom: 6 }}>
              No videos eligible yet
            </p>
            <p style={{ fontSize: 13, color: C.text3, maxWidth: 380, margin: '0 auto', lineHeight: 1.55 }}>
              A review needs a video to be at least 7 days old so the metrics
              have stabilised. Come back when your most recent upload has had a
              week to breathe.
            </p>
          </div>
        ) : (
          // Card grid — copied verbatim from Dashboard.jsx Videos tab so
          // Autopsy uses the exact same .ytg-card layout, thumbnail,
          // metric footer and Optimise-style button. The ONLY changes:
          // primary CTA text says "Run autopsy · 1 credit" (or "Re-run …"
          // when there's already a saved autopsy on file), and the click
          // handler runs the autopsy instead of opening the optimise panel.
          <div className="au-eligible-grid">
            {[...eligible].sort((a, b) => {
              if (videoSort === 'views') return (b.views || 0) - (a.views || 0)
              if (videoSort === 'likes') return (b.likes || 0) - (a.likes || 0)
              return (parseUTC(b.published_at) || 0) - (parseUTC(a.published_at) || 0)
            }).map((v, i) => {
              const lr      = v.views > 0 ? (v.likes / v.views * 100).toFixed(1) : null
              const lrN     = lr !== null ? parseFloat(lr) : null
              const lrColor = lrN === null ? C.text3 : lrN >= 3 ? C.green : lrN >= 1 ? C.amber : C.red
              const wtSecs    = typeof v.avg_duration_seconds === 'number' ? v.avg_duration_seconds : null
              const wtDisplay = wtSecs !== null ? `${Math.floor(wtSecs / 60)}:${String(wtSecs % 60).padStart(2, '0')}` : '—'
              const retN      = typeof v.avg_view_percent === 'number' ? v.avg_view_percent : null
              const ytUrl   = v.video_id ? `https://www.youtube.com/watch?v=${v.video_id}` : null
              const durMatch = (v.duration || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
              const durSecs  = durMatch ? (+durMatch[1]||0)*3600 + (+durMatch[2]||0)*60 + (+durMatch[3]||0) : 0
              const durLabel = durSecs > 0 ? (durSecs <= 60 ? `${durSecs}s` : `${Math.floor(durSecs/60)}:${String(durSecs%60).padStart(2,'0')}`) : null
              const isShort  = durSecs > 0 && durSecs <= 60
              const hasAutopsy = !!autopsyByVideo[v.video_id]
              const isRunning  = running === v.video_id
              return (
                <div key={v.video_id || i} className="au-video-card">
                  {/* Thumbnail */}
                  <a href={ytUrl || '#'} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', position: 'relative', textDecoration: 'none', flexShrink: 0, borderRadius: '14px 14px 0 0', overflow: 'hidden' }}>
                    {v.thumbnail || v.video_id
                      ? <img
                          src={v.video_id ? ytMaxThumbUrl(v.video_id) : v.thumbnail}
                          alt=""
                          style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
                          onError={makeThumbOnError(v.video_id, v.thumbnail)}
                          onLoad={makeThumbOnLoad(v.video_id, v.thumbnail)}
                        />
                      : <div style={{ width: '100%', aspectRatio: '16/9', background: '#ebebef' }}/>
                    }
                    {isShort && (
                      <span style={{ position: 'absolute', top: 8, left: 8, background: '#111', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.10em' }}>SHORT</span>
                    )}
                    {durLabel && (
                      <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.82)', color: '#fff', fontSize: 11.5, fontWeight: 700, padding: '3px 7px', borderRadius: 5, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.05px' }}>{durLabel}</span>
                    )}
                  </a>

                  {/* Body */}
                  <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Title — 14.5/600 (was 16/700, too heavy at this card width) */}
                    <p style={{
                      fontSize: 14.5, fontWeight: 600, color: C.text1, lineHeight: 1.4, marginBottom: 8, letterSpacing: '-0.15px',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 41,
                    }}>{v.title}</p>

                    {/* Meta line — all 500, single muted color, no mid-weight spikes */}
                    <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(10,10,15,0.50)', marginBottom: 14, lineHeight: 1.4, letterSpacing: '-0.005em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {fmtNum(v.views)} views · {fmtNum(v.likes)} likes · {relTimeLong(v.published_at) || '—'}
                    </p>

                    {/* Footer: Watch · Retention · Eng + Run-review CTA */}
                    <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(10,10,15,0.06)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                        {[
                          { label: 'Watch',     display: wtDisplay,                                             color: C.text1,  tip: 'Average watch time per view (mm:ss). Longer is better relative to video length.' },
                          { label: 'Retention', display: retN !== null ? `${retN.toFixed(0)}%` : '—',           color: C.text1,  tip: 'Average % of video watched. 50%+ strong, 30–50% avg, <30% weak.' },
                          { label: 'Eng',       display: lrN !== null ? `${lr}%` : '—',                         color: lrColor,  tip: 'Engagement rate = likes ÷ views. 3%+ strong, 1–3% avg, <1% weak.' },
                        ].map(m => (
                          <div key={m.label} title={m.tip} style={{ cursor: 'help', textAlign: 'left' }}>
                            <p style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(10,10,15,0.45)', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5, lineHeight: 1 }}>{m.label}</p>
                            <p style={{ fontSize: 16, fontWeight: 700, color: m.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.3px', lineHeight: 1 }}>{m.display}</p>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => runAutopsy(v)}
                        disabled={isRunning || !!running}
                        className="au-video-cta"
                        style={{ opacity: isRunning ? 0.7 : 1 }}>
                        {isRunning ? 'Analysing…' : (hasAutopsy ? 'Re-run review' : 'Run review')}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </>)}

      {/* ── REPORTS tab ──────────────────────────────────────────────── */}
      {activeTab === 'reports' && (
        <div>
          {loadingReports ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: C.text3, fontSize: 13 }}>
              Loading reports…
            </div>
          ) : reports.length === 0 ? (
            <div style={{
              padding: '56px 24px', textAlign: 'center',
              background: '#fff', border: '1px solid rgba(10,10,15,0.07)', borderRadius: 14,
              boxShadow: '0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
            }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: C.text1,
                letterSpacing: '-0.2px', marginBottom: 8 }}>No reports yet</p>
              <p style={{ fontSize: 13.5, color: 'rgba(10,10,15,0.55)', fontWeight: 500,
                maxWidth: 360, margin: '0 auto', lineHeight: 1.6, letterSpacing: '-0.005em' }}>
                Run a review on any of your eligible videos and it'll show up
                here — so you can always come back to a report you've already
                paid for.
              </p>
            </div>
          ) : (
            <div>
              {reports.map(r => {
                const score = r.result?.score || 0
                const v = verdictMeta(r.result?.verdict, score)
                return (
                  <div key={r.id} className="au-report-wrapper">
                    <button className="au-report-remove" title="Remove report"
                      onClick={e => deleteReport(r.id, e)}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 5.5l.5 5M9 5.5l-.5 5M3 3.5l.7 8.5h6.6L11 3.5"/>
                      </svg>
                    </button>
                    <div className="au-report-header" onClick={() => openReport(r)}>
                      {r.thumbnail && (
                        <img src={r.thumbnail} alt="" referrerPolicy="no-referrer"
                          style={{ width: 96, height: 54, objectFit: 'cover',
                            borderRadius: 8, flexShrink: 0, border: '1px solid rgba(10,10,15,0.07)' }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 14.5, color: C.text1,
                          letterSpacing: '-0.15px',
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                          marginBottom: 8, lineHeight: 1.35 }}>
                          {r.video_title}
                        </p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            fontSize: 11, borderRadius: 100,
                            padding: '3px 4px 3px 10px',
                            fontVariantNumeric: 'tabular-nums',
                            border: `1px solid ${v.bdr}`,
                            color: v.color, background: v.bg,
                          }}>
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', opacity: 0.78, marginRight: 6 }}>{v.label}</span>
                            <span style={{
                              fontSize: 11, fontWeight: 700, color: '#0a0a0f',
                              background: '#fff', border: `1px solid ${v.color}40`,
                              borderRadius: 100, padding: '1px 8px', letterSpacing: '-0.01em',
                            }}>{score}/100</span>
                          </span>
                          <span style={{ fontSize: 12, color: 'rgba(10,10,15,0.50)', fontWeight: 500, letterSpacing: '-0.005em' }}>
                            {relTime(r.updated_at)}
                          </span>
                          {/* Cross-link to the tracked-deltas view of the same video. */}
                          {optimizedVideoIds.has(r.video_id) && goToTracked && (
                            <button
                              onClick={e => { e.stopPropagation(); goToTracked() }}
                              style={{
                                fontSize: 12, fontWeight: 500, color: 'rgba(10,10,15,0.50)',
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                fontFamily: 'inherit', padding: 0, letterSpacing: '-0.005em',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#0a0a0f' }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(10,10,15,0.50)' }}
                            >
                              · View tracked optimisation →
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, paddingRight: 24 }}>
                        <button className="au-btn-primary"
                          onClick={e => { e.stopPropagation(); openReport(r) }}
                          style={{ padding: '8px 16px', fontSize: 12.5, fontWeight: 600, letterSpacing: '-0.01em' }}>
                          Open report
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M4 2l4 4-4 4"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <CreditsEmptyModal
        open={creditsOut}
        onClose={() => setCreditsOut(false)}
        featureName="autopsies"
      />
    </div>
  )
}
