/* NicheHeroCard — the dashboard hero. Premium feel, vertical layout,
   personalized angle pulled per-creator from /dashboard/personalize-angle.

   Data flow:
   1. GET /dashboard/niche-outlier — niche-wide cached pick + breakdown.
      Returns generating_now state if cache is empty; we poll until ready.
   2. GET /dashboard/personalize-angle — channel-specific angle tailored
      to this creator. Result cached client-side for 7 days keyed by
      (niche, channel_id). Falls back to the niche's generic angle on miss.
*/

import { useEffect, useState } from 'react'

const C = {
  bg: '#ffffff',
  border: '#e6e6ec',
  borderSoft: '#f0f0f4',
  text1: '#0f0f13',
  text2: '#4a4a58',
  text3: '#9595a4',
  text4: '#b8b8c8',
  red: '#e5251b',
  redDeep: '#a50f07',
  redSoft: '#fff5f5',
  redBorder: 'rgba(229,37,27,0.18)',
  green: '#059669',
  greenSoft: '#ecfdf5',
  amber: '#d97706',
}

const NICHE_LABELS = {
  gaming: 'Gaming', tech: 'Tech', beauty: 'Beauty', finance: 'Finance',
  cooking: 'Cooking', fitness: 'Fitness', music: 'Music',
  education: 'Education', vlogs: 'Vlogs', travel: 'Travel',
  comedy: 'Comedy', sports: 'Sports', entertainment: 'Entertainment',
  news: 'News',
}

function formatViews(n) {
  if (!n && n !== 0) return ''
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}

function relTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const diffMs = Date.now() - d.getTime()
  const sec = Math.floor(diffMs / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7)  return `${day}d ago`
  if (day < 30) return `${Math.floor(day / 7)}w ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// ─── Client-side cache for the personalized angle ─────────────────────────────
// Stored per (niche, channel_id). TTL 7 days. Avoids re-running Haiku on
// every dashboard load.
const PERSONALIZE_TTL_MS = 7 * 24 * 60 * 60 * 1000
function loadPersonalized(niche, channelId) {
  try {
    const raw = localStorage.getItem(`nh_personalized_v2:${niche}:${channelId}`)
    if (!raw) return null
    const obj = JSON.parse(raw)
    if (!obj || !obj.ts || Date.now() - obj.ts > PERSONALIZE_TTL_MS) return null
    return obj
  } catch { return null }
}
function savePersonalized(niche, channelId, data) {
  try {
    localStorage.setItem(
      `nh_personalized_v2:${niche}:${channelId}`,
      JSON.stringify({ ...data, ts: Date.now() }),
    )
  } catch {}
}

export default function NicheHeroCard({ onOpenSeoStudio, channelId }) {
  const [state, setState] = useState({ loading: true, data: null, error: null })
  const [personalized, setPersonalized] = useState(null)

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
        setState({ loading: false, data: d, error: null })
        if (!d.ok && d.reason === 'generating_now' && pollCount < MAX_POLLS) {
          pollCount += 1
          setTimeout(fetchOnce, 5000)
        }
      } catch {
        if (!cancelled) setState({ loading: false, data: null, error: 'fetch_failed' })
      }
    }
    fetchOnce()
    return () => { cancelled = true }
  }, [])

  // Once we know the niche, try to load the personalized angle.
  useEffect(() => {
    if (!state.data?.ok) return
    const niche = state.data.niche
    if (!niche) return

    const cached = loadPersonalized(niche, channelId || 'unknown')
    if (cached) {
      setPersonalized(cached)
      return
    }

    let cancelled = false
    fetch('/dashboard/personalize-angle', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (cancelled || !d?.ok) return
        const next = {
          angle:           d.angle || '',
          angle_reasoning: d.angle_reasoning || '',
          keyword:         d.keyword || '',
          personalized:    !!d.personalized,
        }
        setPersonalized(next)
        savePersonalized(niche, channelId || 'unknown', next)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [state.data?.ok, state.data?.niche, channelId])

  if (state.loading) return <HeroSkeleton />
  if (!state.data?.ok) {
    return <HeroEmpty niche={state.data?.niche} reason={state.data?.reason} />
  }

  const { niche, creator, outlier } = state.data
  const nicheLabel = NICHE_LABELS[niche] || niche
  const why = Array.isArray(outlier.why_working) ? outlier.why_working : []
  const angle           = personalized?.angle           || outlier.angle_template
  const angleReasoning  = personalized?.angle_reasoning || outlier.angle_reasoning || ''
  const angleKeyword    = personalized?.keyword        || outlier.angle_keyword
  const isPersonalized  = !!personalized?.personalized

  const scoreColor = outlier.outlier_score >= 80 ? C.green
                   : outlier.outlier_score >= 60 ? C.amber
                   : C.red

  return (
    <div className="nh2">
      <style>{`
        .nh2 {
          position: relative;
          background: linear-gradient(180deg, #ffffff 0%, #fafafb 100%);
          border: 1px solid ${C.border};
          border-radius: 24px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04), 0 16px 44px rgba(0,0,0,0.08);
          padding: 32px 36px 30px;
          margin-bottom: 32px;
          font-family: 'Inter', system-ui, sans-serif;
          overflow: hidden;
          animation: nh2Rise 0.5s cubic-bezier(0.2, 0.7, 0.3, 1);
        }
        .nh2::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, ${C.red} 0%, #fca5a5 50%, ${C.red} 100%);
          opacity: 0.95;
        }
        @keyframes nh2Rise { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
        @keyframes nh2Pulse { 0%, 100% { opacity: 1; transform: scale(1) } 50% { opacity: 0.55; transform: scale(1.18) } }

        .nh2-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 24px; margin-bottom: 22px;
        }
        .nh2-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 800; letter-spacing: 0.1em;
          text-transform: uppercase; color: ${C.red};
          margin-bottom: 10px;
        }
        .nh2-eyebrow .nh2-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: ${C.red};
          animation: nh2Pulse 2.2s ease-in-out infinite;
        }
        .nh2-h1 {
          font-size: 24px; font-weight: 800; color: ${C.text1};
          letter-spacing: -0.5px; line-height: 1.22;
          margin: 0;
        }
        .nh2-h1 .nh2-niche-pill {
          display: inline-flex; align-items: center;
          font-size: 14.5px; font-weight: 800;
          background: linear-gradient(180deg, ${C.red}10 0%, ${C.red}05 100%);
          color: ${C.red};
          border: 1px solid ${C.redBorder};
          padding: 2px 11px;
          border-radius: 100px;
          margin: 0 6px;
          vertical-align: middle;
          letter-spacing: -0.1px;
        }

        .nh2-thumb-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 18px;
          overflow: hidden;
          background: #f0f0f4;
          box-shadow: 0 6px 20px rgba(0,0,0,0.10), 0 24px 60px rgba(0,0,0,0.10);
          margin-bottom: 22px;
          transition: transform 0.3s cubic-bezier(0.2, 0.7, 0.3, 1), box-shadow 0.3s;
          cursor: pointer;
        }
        .nh2-thumb-wrap:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.14), 0 32px 80px rgba(0,0,0,0.12); }
        .nh2-thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
        .nh2-score {
          position: absolute; top: 14px; left: 14px;
          background: rgba(15,15,19,0.82);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: #ffffff;
          padding: 8px 14px 8px 12px;
          border-radius: 14px;
          display: inline-flex; align-items: center; gap: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }
        .nh2-score-num {
          font-size: 28px; font-weight: 900;
          line-height: 1; letter-spacing: -0.8px;
          font-variant-numeric: tabular-nums;
        }
        .nh2-score-label {
          font-size: 9.5px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          opacity: 0.78; line-height: 1.1;
        }
        .nh2-score-label .nh2-score-tier {
          display: block; font-size: 11px; font-weight: 800;
          letter-spacing: 0.06em; margin-top: 1px;
        }
        .nh2-watch-pill {
          position: absolute; bottom: 14px; right: 14px;
          background: rgba(255,255,255,0.96);
          color: ${C.text1};
          padding: 8px 14px;
          border-radius: 100px;
          font-size: 12.5px; font-weight: 700;
          display: inline-flex; align-items: center; gap: 7px;
          text-decoration: none;
          letter-spacing: -0.1px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.18);
          opacity: 0;
          transform: translateY(4px);
          transition: opacity 0.2s, transform 0.2s;
        }
        .nh2-thumb-wrap:hover .nh2-watch-pill { opacity: 1; transform: none; }

        .nh2-video-title {
          font-size: 20px; font-weight: 800; color: ${C.text1};
          letter-spacing: -0.3px; line-height: 1.35;
          margin: 0 0 8px 0;
        }
        .nh2-meta-line {
          display: flex; flex-wrap: wrap; gap: 6px 14px;
          font-size: 13px; color: ${C.text3}; font-weight: 500;
          margin-bottom: 22px;
        }
        .nh2-meta-line .nh2-ch { color: ${C.text2}; font-weight: 600; }
        .nh2-meta-line .nh2-sep { color: ${C.text4}; }

        .nh2-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 0;
          padding: 16px 0;
          border-top: 1px solid ${C.borderSoft};
          border-bottom: 1px solid ${C.borderSoft};
          margin-bottom: 24px;
        }
        .nh2-stat {
          display: flex; flex-direction: column; gap: 4px;
          padding: 0 20px;
          border-right: 1px solid ${C.borderSoft};
        }
        .nh2-stat:first-child { padding-left: 0; }
        .nh2-stat:last-child  { padding-right: 0; border-right: none; }
        .nh2-stat-label {
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em;
          color: ${C.text3}; text-transform: uppercase;
        }
        .nh2-stat-value {
          font-size: 22px; font-weight: 800; color: ${C.text1};
          letter-spacing: -0.5px; font-variant-numeric: tabular-nums;
          line-height: 1.1;
        }
        .nh2-stat-value .nh2-unit { color: ${C.text3}; font-weight: 700; font-size: 14px; margin-left: 1px; }

        .nh2-section-h {
          display: flex; align-items: center; gap: 9px;
          font-size: 11px; font-weight: 800; letter-spacing: 0.1em;
          text-transform: uppercase; color: ${C.text3};
          margin-bottom: 14px;
        }
        .nh2-section-h::before {
          content: ''; width: 5px; height: 5px; border-radius: 50%;
          background: ${C.text3};
        }

        .nh2-why {
          display: flex; flex-direction: column; gap: 12px;
          margin-bottom: 28px;
        }
        .nh2-why-item {
          display: flex; align-items: flex-start; gap: 12px;
          font-size: 14px; color: ${C.text2}; line-height: 1.55;
          letter-spacing: -0.05px;
        }
        .nh2-why-bullet {
          width: 22px; height: 22px; border-radius: 50%;
          background: ${C.greenSoft};
          color: ${C.green};
          display: inline-flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px;
        }

        .nh2-angle {
          position: relative;
          background: linear-gradient(180deg, ${C.redSoft} 0%, #ffffff 100%);
          border: 1.5px solid ${C.redBorder};
          border-radius: 18px;
          padding: 22px 24px 20px;
          margin-bottom: 6px;
        }
        .nh2-angle-tag {
          position: absolute; top: -10px; left: 24px;
          background: linear-gradient(180deg, ${C.red} 0%, ${C.redDeep} 100%);
          color: #ffffff;
          font-size: 10.5px; font-weight: 800; letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 5px 11px;
          border-radius: 100px;
          box-shadow: 0 4px 12px rgba(229,37,27,0.30);
          display: inline-flex; align-items: center; gap: 6px;
        }
        .nh2-angle-tag .nh2-angle-sparkle {
          width: 10px; height: 10px; display: inline-flex;
        }
        .nh2-angle-title {
          font-size: 18px; font-weight: 800; color: ${C.text1};
          letter-spacing: -0.3px; line-height: 1.4;
          margin: 8px 0 10px 0;
        }
        .nh2-angle-reason {
          font-size: 13.5px; color: ${C.text2}; line-height: 1.6;
          margin-bottom: 16px;
        }
        .nh2-angle-keyword {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: ${C.text3}; font-weight: 600;
          margin-bottom: 18px; letter-spacing: -0.05px;
        }
        .nh2-angle-keyword .nh2-kw-tag {
          color: ${C.text1}; background: #ffffff;
          border: 1px solid ${C.border};
          border-radius: 100px;
          padding: 3px 11px;
          font-weight: 700; font-size: 12px;
          letter-spacing: -0.1px;
        }
        .nh2-angle-bottom {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
        }
        .nh2-personalized-pill {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 700; color: ${C.green};
          background: ${C.greenSoft};
          border: 1px solid rgba(5,150,105,0.22);
          padding: 4px 10px;
          border-radius: 100px;
          letter-spacing: -0.05px;
        }
        .nh2-cta {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(180deg, ${C.red} 0%, ${C.redDeep} 100%);
          color: #ffffff;
          border: none;
          padding: 11px 20px;
          border-radius: 100px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px; font-weight: 800;
          letter-spacing: -0.1px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(229,37,27,0.32), inset 0 1px 0 rgba(255,255,255,0.25);
          transition: filter 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .nh2-cta:hover {
          filter: brightness(1.07);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(229,37,27,0.40), inset 0 1px 0 rgba(255,255,255,0.28);
        }

        .nh2-footer {
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid ${C.borderSoft};
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 8px;
          font-size: 12px; color: ${C.text3}; font-weight: 500;
        }
        .nh2-footer .nh2-pill {
          display: inline-flex; align-items: center; gap: 7px;
          background: #fafafb;
          border: 1px solid ${C.border};
          padding: 4px 11px;
          border-radius: 100px;
          font-weight: 700; color: ${C.text2};
          letter-spacing: -0.1px;
        }
        .nh2-footer .nh2-pill::before {
          content: ''; width: 5px; height: 5px; border-radius: 50%;
          background: ${C.green};
        }

        @media (max-width: 720px) {
          .nh2 { padding: 24px 22px 20px; }
          .nh2-h1 { font-size: 20px; }
          .nh2-video-title { font-size: 17px; }
          .nh2-score-num { font-size: 22px; }
          .nh2-stat { padding: 0 12px; }
          .nh2-stat-value { font-size: 18px; }
          .nh2-angle { padding: 18px 18px 16px; }
        }
      `}</style>

      <div className="nh2-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="nh2-eyebrow">
            <span className="nh2-dot" />
            Winning in your niche this week
          </div>
          <h2 className="nh2-h1">
            {creator ? `Hi ${creator},` : 'Welcome back,'} here's what YouTube is pushing in
            <span className="nh2-niche-pill">{nicheLabel}</span>
            right now.
          </h2>
        </div>
      </div>

      <a
        className="nh2-thumb-wrap"
        href={`https://www.youtube.com/watch?v=${outlier.video_id}`}
        target="_blank" rel="noopener noreferrer"
        aria-label={`Watch ${outlier.title} on YouTube`}
      >
        {outlier.thumbnail_url ? (
          <img className="nh2-thumb" src={outlier.thumbnail_url} alt={outlier.title} loading="lazy" />
        ) : (
          <div className="nh2-thumb" style={{ background: 'linear-gradient(135deg, #fde68a, #fca5a5)' }} />
        )}
        <div className="nh2-score">
          <span className="nh2-score-num" style={{ color: scoreColor }}>{outlier.outlier_score}</span>
          <span className="nh2-score-label">
            Outlier
            <span className="nh2-score-tier">
              {outlier.outlier_score >= 80 ? 'Top tier' : outlier.outlier_score >= 60 ? 'Strong' : 'Notable'}
            </span>
          </span>
        </div>
        <span className="nh2-watch-pill">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><polygon points="3,2 10,6 3,10"/></svg>
          Watch on YouTube
        </span>
      </a>

      <h3 className="nh2-video-title">{outlier.title}</h3>
      <p className="nh2-meta-line">
        <span className="nh2-ch">{outlier.channel_title}</span>
        <span className="nh2-sep">·</span>
        <span>{relTime(outlier.published_at)}</span>
      </p>

      <div className="nh2-stats">
        <div className="nh2-stat">
          <span className="nh2-stat-label">Views</span>
          <span className="nh2-stat-value">{formatViews(outlier.view_count)}</span>
        </div>
        <div className="nh2-stat">
          <span className="nh2-stat-label">Sub ratio</span>
          <span className="nh2-stat-value">{outlier.sub_ratio}<span className="nh2-unit">x</span></span>
        </div>
        <div className="nh2-stat">
          <span className="nh2-stat-label">Outlier score</span>
          <span className="nh2-stat-value" style={{ color: scoreColor }}>{outlier.outlier_score}</span>
        </div>
      </div>

      <div className="nh2-section-h">Why YouTube is pushing it</div>
      <div className="nh2-why">
        {why.slice(0, 3).map((reason, i) => (
          <div key={i} className="nh2-why-item">
            <span className="nh2-why-bullet">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1.5,6.5 5,10 10.5,2"/>
              </svg>
            </span>
            <span>{reason}</span>
          </div>
        ))}
      </div>

      <div className="nh2-section-h">Your angle</div>
      <div className="nh2-angle">
        <span className="nh2-angle-tag">
          <svg className="nh2-angle-sparkle" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 0L7.5 4.5 12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0z"/>
          </svg>
          {isPersonalized ? 'Tailored to your channel' : 'Adaptable for your channel'}
        </span>
        <p className="nh2-angle-title">{angle}</p>
        {angleReasoning && <p className="nh2-angle-reason">{angleReasoning}</p>}
        {angleKeyword && (
          <p className="nh2-angle-keyword">
            Target keyword
            <span className="nh2-kw-tag">{angleKeyword}</span>
          </p>
        )}
        <div className="nh2-angle-bottom">
          {isPersonalized ? (
            <span className="nh2-personalized-pill">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1.5,6.5 5,10 10.5,2"/>
              </svg>
              Personalized to your channel
            </span>
          ) : <span />}
          <button
            type="button"
            className="nh2-cta"
            onClick={() => onOpenSeoStudio?.(angle, angleKeyword)}
          >
            Open in SEO Studio
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="nh2-footer">
        <span>
          Niche detected: <span className="nh2-pill">{nicheLabel}</span>
        </span>
        <span>
          {outlier.refreshed_at ? `Refreshed ${relTime(outlier.refreshed_at)}` : 'Refreshed this week'}
        </span>
      </div>
    </div>
  )
}


// ─── Skeleton ────────────────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e6e6ec',
      borderRadius: 24,
      padding: '32px 36px 30px',
      marginBottom: 32,
      boxShadow: '0 2px 6px rgba(0,0,0,0.04), 0 16px 44px rgba(0,0,0,0.08)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <style>{`
        @keyframes nh2Shimmer { 0% { background-position: -400px 0 } 100% { background-position: 400px 0 } }
        .nh2-sk {
          background: linear-gradient(90deg, #f4f4f6 0%, #ececef 50%, #f4f4f6 100%);
          background-size: 800px 100%;
          animation: nh2Shimmer 1.6s linear infinite;
          border-radius: 10px;
        }
      `}</style>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #e5251b 0%, #fca5a5 50%, #e5251b 100%)', opacity: 0.6 }} />
      <div className="nh2-sk" style={{ width: 240, height: 14, marginBottom: 16 }} />
      <div className="nh2-sk" style={{ width: '75%', height: 28, marginBottom: 24 }} />
      <div className="nh2-sk" style={{ width: '100%', aspectRatio: '16 / 9', borderRadius: 18, marginBottom: 22 }} />
      <div className="nh2-sk" style={{ width: '85%', height: 20, marginBottom: 10 }} />
      <div className="nh2-sk" style={{ width: '40%', height: 14, marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, padding: '16px 0', borderTop: '1px solid #f0f0f4', borderBottom: '1px solid #f0f0f4', marginBottom: 24 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ padding: '0 20px' }}>
            <div className="nh2-sk" style={{ width: 64, height: 10, marginBottom: 8 }} />
            <div className="nh2-sk" style={{ width: 80, height: 22 }} />
          </div>
        ))}
      </div>
      <div className="nh2-sk" style={{ width: 150, height: 12, marginBottom: 16 }} />
      <div className="nh2-sk" style={{ width: '95%', height: 16, marginBottom: 10 }} />
      <div className="nh2-sk" style={{ width: '88%', height: 16, marginBottom: 10 }} />
      <div className="nh2-sk" style={{ width: '92%', height: 16, marginBottom: 24 }} />
      <div className="nh2-sk" style={{ width: '100%', height: 140, borderRadius: 18 }} />
    </div>
  )
}


// ─── Empty state: niche is generating ──────────────────────────────────────────

function HeroEmpty({ niche, reason }) {
  const label = NICHE_LABELS[niche] || niche || 'your niche'
  const isGenerating = reason === 'generating_now' || reason === 'no_cache_yet'

  return (
    <div className="nh2-gen">
      <style>{`
        .nh2-gen {
          position: relative;
          background: linear-gradient(180deg, #ffffff 0%, #fafafb 100%);
          border: 1px solid ${C.border};
          border-radius: 24px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04), 0 16px 44px rgba(0,0,0,0.08);
          padding: 30px 36px 28px;
          margin-bottom: 32px;
          font-family: 'Inter', system-ui, sans-serif;
          overflow: hidden;
          animation: nh2GenIn 0.4s cubic-bezier(0.2, 0.7, 0.3, 1);
        }
        .nh2-gen::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, ${C.red} 0%, #fca5a5 50%, ${C.red} 100%);
          background-size: 200% 100%;
          animation: nh2GenSlide 2s linear infinite;
        }
        @keyframes nh2GenSlide { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
        @keyframes nh2GenIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
        @keyframes nh2GenRing { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }

        .nh2-gen-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 800; letter-spacing: 0.1em;
          text-transform: uppercase; color: ${C.red};
          margin-bottom: 14px;
        }
        .nh2-gen-row { display: flex; align-items: center; gap: 24px; }
        @media (max-width: 720px) { .nh2-gen-row { flex-direction: column; align-items: flex-start; gap: 18px; } }
        .nh2-gen-ring {
          position: relative; width: 62px; height: 62px;
          border-radius: 50%; flex-shrink: 0;
        }
        .nh2-gen-ring::before {
          content: ''; position: absolute; inset: 0; border-radius: 50%;
          background: conic-gradient(${C.red}, #fca5a5, transparent 70%, ${C.red});
          animation: nh2GenRing 1.4s linear infinite;
          mask: radial-gradient(circle, transparent 56%, black 58%);
          -webkit-mask: radial-gradient(circle, transparent 56%, black 58%);
        }
        .nh2-gen-ring-core {
          position: absolute; inset: 9px; background: #ffffff; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: inset 0 0 0 1px ${C.border};
        }
        .nh2-gen-text { flex: 1; min-width: 0; }
        .nh2-gen-h {
          font-size: 19px; font-weight: 800; color: ${C.text1};
          letter-spacing: -0.3px; line-height: 1.3; margin-bottom: 8px;
        }
        .nh2-gen-h .nh2-gen-pill {
          display: inline-flex; align-items: center;
          font-size: 13.5px; font-weight: 700;
          background: #fff5f5; color: ${C.red};
          border: 1px solid ${C.redBorder};
          padding: 2px 11px; border-radius: 100px;
          margin: 0 4px; vertical-align: middle; letter-spacing: -0.05px;
        }
        .nh2-gen-p {
          font-size: 13.5px; color: ${C.text3}; line-height: 1.55;
        }
        .nh2-gen-steps {
          margin-top: 22px; padding-top: 20px;
          border-top: 1px solid ${C.borderSoft};
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
        }
        @media (max-width: 720px) { .nh2-gen-steps { grid-template-columns: 1fr; gap: 10px; } }
        .nh2-gen-step {
          display: flex; align-items: center; gap: 10px;
          font-size: 12.5px; color: ${C.text2}; line-height: 1.4;
        }
        .nh2-gen-step-num {
          width: 22px; height: 22px; border-radius: 50%;
          background: #f1f1f6; color: ${C.text3};
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; flex-shrink: 0;
        }
      `}</style>

      <div className="nh2-gen-eyebrow">Discovering</div>
      <div className="nh2-gen-row">
        <div className="nh2-gen-ring">
          <div className="nh2-gen-ring-core">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/>
              <line x1="20" y1="20" x2="16.65" y2="16.65"/>
            </svg>
          </div>
        </div>
        <div className="nh2-gen-text">
          <p className="nh2-gen-h">
            Picking the top
            <span className="nh2-gen-pill">{label}</span>
            outlier winning on YouTube right now
          </p>
          <p className="nh2-gen-p">
            {isGenerating
              ? 'Usually takes 15 to 30 seconds. The card refreshes here automatically.'
              : 'Try refreshing the page. If this keeps happening, email support@ytgrowth.io.'}
          </p>
        </div>
      </div>
      <div className="nh2-gen-steps">
        <div className="nh2-gen-step"><span className="nh2-gen-step-num">1</span> Scanning niche search results</div>
        <div className="nh2-gen-step"><span className="nh2-gen-step-num">2</span> Scoring views vs. channel subs</div>
        <div className="nh2-gen-step"><span className="nh2-gen-step-num">3</span> Writing your tailored angle</div>
      </div>
    </div>
  )
}
