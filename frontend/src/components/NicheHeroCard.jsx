/* NicheHeroCard — the dashboard hero. "Here's what YouTube is pushing
   in your niche this week" with a single picked video, AI breakdown,
   and a tailored angle the creator can ship next.

   Data shape (from GET /dashboard/niche-outlier):
   {
     ok: true,
     niche: "tech",
     creator: "Channel Name",
     outlier: {
       video_id, title, channel_title, channel_id, thumbnail_url,
       view_count, sub_ratio, outlier_score,
       published_at, why_working[3], angle_template, angle_keyword,
       refreshed_at,
     }
   }
*/

import { useEffect, useState } from 'react'

const C = {
  bg: '#ffffff',
  card: '#ffffff',
  border: '#e6e6ec',
  borderSoft: '#f0f0f4',
  text1: '#0f0f13',
  text2: '#4a4a58',
  text3: '#9595a4',
  text4: '#b8b8c8',
  red: '#e5251b',
  redSoft: '#fff5f5',
  redBorder: 'rgba(229,37,27,0.18)',
  green: '#059669',
  greenSoft: '#ecfdf5',
  amber: '#d97706',
  amberSoft: '#fffbeb',
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

export default function NicheHeroCard({ onOpenSeoStudio }) {
  const [state, setState] = useState({ loading: true, data: null, error: null })

  // Initial fetch + polling while the niche is being generated server-side.
  // The endpoint returns reason: 'generating_now' on the first hit if there's
  // no cache yet, and a background refresh has been kicked off. We poll every
  // 5s until ok: true (typically 10-30s) or until we hit the cap.
  useEffect(() => {
    let cancelled = false
    let pollCount = 0
    const MAX_POLLS = 18  // 18 x 5s = 90s

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

  if (state.loading) return <HeroSkeleton />
  if (!state.data?.ok) {
    return <HeroEmpty niche={state.data?.niche} reason={state.data?.reason} />
  }

  const { niche, creator, outlier } = state.data
  const nicheLabel = NICHE_LABELS[niche] || niche
  let why = outlier.why_working || []
  if (!Array.isArray(why)) why = []
  const scoreColor = outlier.outlier_score >= 80 ? C.green
                   : outlier.outlier_score >= 60 ? C.amber
                   : C.red

  return (
    <div className="nh-card">
      <style>{`
        .nh-card {
          position: relative;
          background: linear-gradient(180deg, #ffffff 0%, #fafafb 100%);
          border: 1px solid ${C.border};
          border-radius: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.06);
          padding: 28px 30px;
          margin-bottom: 28px;
          font-family: 'Inter', system-ui, sans-serif;
          overflow: hidden;
          animation: nhRise 0.5s cubic-bezier(0.2, 0.7, 0.3, 1);
        }
        .nh-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, ${C.red} 0%, #fca5a5 50%, ${C.red} 100%);
          opacity: 0.9;
        }
        @keyframes nhRise { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
        @keyframes nhPulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.55 } }
        .nh-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: ${C.red};
          margin-bottom: 12px;
        }
        .nh-eyebrow .nh-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${C.red};
          animation: nhPulse 2.4s ease-in-out infinite;
        }
        .nh-title {
          font-size: 22px; font-weight: 800; color: ${C.text1};
          letterSpacing: -0.4px; line-height: 1.25; margin-bottom: 6px;
        }
        .nh-sub {
          font-size: 13.5px; color: ${C.text3}; line-height: 1.5;
          margin-bottom: 22px;
        }
        .nh-grid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 26px;
          align-items: start;
        }
        @media (max-width: 880px) {
          .nh-grid { grid-template-columns: 1fr; gap: 20px; }
          .nh-thumb-wrap { max-width: 100% }
        }
        .nh-thumb-wrap {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          aspect-ratio: 16 / 9;
          background: #f0f0f4;
          box-shadow: 0 4px 14px rgba(0,0,0,0.10), 0 16px 40px rgba(0,0,0,0.08);
          transition: transform 0.3s cubic-bezier(0.2, 0.7, 0.3, 1), box-shadow 0.3s;
        }
        .nh-thumb-wrap:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.13), 0 20px 50px rgba(0,0,0,0.10); }
        .nh-thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
        .nh-score-badge {
          position: absolute; top: 12px; right: 12px;
          background: rgba(0,0,0,0.78);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #fff;
          padding: 5px 11px 5px 9px;
          border-radius: 999px;
          font-size: 11px; font-weight: 800; letter-spacing: -0.1px;
          display: inline-flex; align-items: center; gap: 6px;
          line-height: 1;
        }
        .nh-score-badge .nh-score-dot {
          width: 7px; height: 7px; border-radius: 50%;
        }
        .nh-watch-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0); opacity: 0;
          transition: background 0.2s, opacity 0.2s;
          text-decoration: none;
        }
        .nh-thumb-wrap:hover .nh-watch-overlay {
          background: rgba(0,0,0,0.28);
          opacity: 1;
        }
        .nh-watch-overlay span {
          background: rgba(255,255,255,0.95);
          color: ${C.text1};
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 12px; font-weight: 700;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .nh-video-meta {
          display: flex; flex-direction: column; gap: 14px;
        }
        .nh-video-title {
          font-size: 17px; font-weight: 700; color: ${C.text1};
          letter-spacing: -0.25px; line-height: 1.4;
        }
        .nh-meta-line {
          display: flex; flex-wrap: wrap; gap: 6px 14px;
          font-size: 12.5px; color: ${C.text3}; font-weight: 500;
        }
        .nh-meta-line .nh-ch { color: ${C.text2}; font-weight: 600; }
        .nh-stats-row {
          display: flex; gap: 18px;
          padding: 12px 0;
          border-top: 1px solid ${C.borderSoft};
          border-bottom: 1px solid ${C.borderSoft};
        }
        .nh-stat { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .nh-stat-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
          color: ${C.text3}; text-transform: uppercase;
        }
        .nh-stat-value {
          font-size: 15px; font-weight: 800; color: ${C.text1};
          letter-spacing: -0.25px; font-variant-numeric: tabular-nums;
        }
        .nh-stat-value .nh-mute { color: ${C.text3}; font-weight: 600; font-size: 12px; }
        .nh-section-label {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 10px; font-weight: 800; letter-spacing: 0.1em;
          text-transform: uppercase; color: ${C.text3};
          margin-bottom: 10px;
        }
        .nh-why {
          display: flex; flex-direction: column; gap: 9px;
          margin-bottom: 22px;
        }
        .nh-why-item {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 13.5px; color: ${C.text2}; line-height: 1.55;
        }
        .nh-why-bullet {
          width: 18px; height: 18px; border-radius: 50%;
          background: ${C.greenSoft};
          color: ${C.green};
          display: inline-flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px;
        }
        .nh-angle-block {
          background: linear-gradient(180deg, ${C.redSoft} 0%, #ffffff 100%);
          border: 1px solid ${C.redBorder};
          border-radius: 14px;
          padding: 16px 18px 14px;
          margin-top: 4px;
        }
        .nh-angle-title {
          font-size: 14.5px; font-weight: 700; color: ${C.text1};
          line-height: 1.45; margin-bottom: 8px; letter-spacing: -0.15px;
        }
        .nh-angle-keyword {
          font-size: 11.5px; color: ${C.text3}; font-weight: 600;
          margin-bottom: 14px;
        }
        .nh-angle-keyword .nh-kw-tag {
          color: ${C.text2}; background: #ffffff;
          border: 1px solid ${C.border};
          border-radius: 100px;
          padding: 2px 9px;
          margin-left: 6px;
          font-weight: 500;
        }
        .nh-cta {
          display: inline-flex; align-items: center; gap: 7px;
          background: linear-gradient(180deg, ${C.red} 0%, #a50f07 100%);
          color: #ffffff;
          border: none;
          padding: 10px 18px;
          border-radius: 100px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12.5px; font-weight: 700;
          letter-spacing: -0.1px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(229,37,27,0.30), inset 0 1px 0 rgba(255,255,255,0.22);
          transition: filter 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .nh-cta:hover {
          filter: brightness(1.07);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(229,37,27,0.38), inset 0 1px 0 rgba(255,255,255,0.25);
        }
        .nh-footer {
          margin-top: 22px;
          padding-top: 16px;
          border-top: 1px solid ${C.borderSoft};
          display: flex; align-items: center; justify-content: space-between;
          font-size: 11.5px; color: ${C.text3}; font-weight: 500;
        }
        .nh-footer .nh-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: #fafafb;
          border: 1px solid ${C.border};
          padding: 3px 10px;
          border-radius: 100px;
          font-weight: 600; color: ${C.text2};
        }
      `}</style>

      <div className="nh-eyebrow">
        <span className="nh-dot" />
        Winning in your niche this week
      </div>
      <h2 className="nh-title">
        {creator ? `Hi ${creator},` : 'Welcome back,'} here's what YouTube is pushing in {nicheLabel} right now.
      </h2>
      <p className="nh-sub">
        We scan the {nicheLabel.toLowerCase()} niche every week for videos beating their channel's own subscriber base. Here's the one to study, and the angle you can ship.
      </p>

      <div className="nh-grid">
        <div className="nh-thumb-wrap">
          {outlier.thumbnail_url ? (
            <img className="nh-thumb" src={outlier.thumbnail_url} alt={outlier.title} loading="lazy" />
          ) : (
            <div className="nh-thumb" style={{ background: 'linear-gradient(135deg, #fde68a, #fca5a5)' }} />
          )}
          <span className="nh-score-badge">
            <span className="nh-score-dot" style={{ background: scoreColor }} />
            Outlier {outlier.outlier_score}
          </span>
          <a
            className="nh-watch-overlay"
            href={`https://www.youtube.com/watch?v=${outlier.video_id}`}
            target="_blank" rel="noopener noreferrer"
          >
            <span>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><polygon points="3,2 10,6 3,10"/></svg>
              Watch on YouTube
            </span>
          </a>
        </div>

        <div className="nh-video-meta">
          <div>
            <p className="nh-video-title">{outlier.title}</p>
            <p className="nh-meta-line" style={{ marginTop: 6 }}>
              <span className="nh-ch">{outlier.channel_title}</span>
              <span>·</span>
              <span>{relTime(outlier.published_at)}</span>
            </p>
          </div>

          <div className="nh-stats-row">
            <div className="nh-stat">
              <span className="nh-stat-label">Views</span>
              <span className="nh-stat-value">{formatViews(outlier.view_count)}</span>
            </div>
            <div className="nh-stat">
              <span className="nh-stat-label">Sub ratio</span>
              <span className="nh-stat-value">{outlier.sub_ratio}<span className="nh-mute">x</span></span>
            </div>
            <div className="nh-stat">
              <span className="nh-stat-label">Outlier score</span>
              <span className="nh-stat-value" style={{ color: scoreColor }}>{outlier.outlier_score}</span>
            </div>
          </div>

          <div>
            <div className="nh-section-label">Why it's working</div>
            <div className="nh-why">
              {why.slice(0, 3).map((reason, i) => (
                <div key={i} className="nh-why-item">
                  <span className="nh-why-bullet">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1.5,6.5 5,10 10.5,2"/>
                    </svg>
                  </span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>

            <div className="nh-section-label">Your angle</div>
            <div className="nh-angle-block">
              <p className="nh-angle-title">{outlier.angle_template}</p>
              {outlier.angle_keyword && (
                <p className="nh-angle-keyword">
                  Target keyword
                  <span className="nh-kw-tag">{outlier.angle_keyword}</span>
                </p>
              )}
              <button
                type="button"
                className="nh-cta"
                onClick={() => onOpenSeoStudio?.(outlier.angle_template, outlier.angle_keyword)}
              >
                Open in SEO Studio
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="nh-footer">
        <span>
          Niche detected: <span className="nh-pill">{nicheLabel}</span>
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
      borderRadius: 20,
      padding: '28px 30px',
      marginBottom: 28,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.06)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <style>{`
        @keyframes nhShimmer {
          0%   { background-position: -300px 0; }
          100% { background-position: 300px 0; }
        }
        .nh-sk {
          background: linear-gradient(90deg, #f4f4f6 0%, #ececef 50%, #f4f4f6 100%);
          background-size: 600px 100%;
          animation: nhShimmer 1.4s linear infinite;
          border-radius: 8px;
        }
      `}</style>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #e5251b 0%, #fca5a5 50%, #e5251b 100%)', opacity: 0.6 }} />
      <div className="nh-sk" style={{ width: 220, height: 12, marginBottom: 14 }} />
      <div className="nh-sk" style={{ width: '70%', height: 24, marginBottom: 8 }} />
      <div className="nh-sk" style={{ width: '85%', height: 14, marginBottom: 22 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 26 }}>
        <div className="nh-sk" style={{ aspectRatio: '16 / 9', borderRadius: 14 }} />
        <div>
          <div className="nh-sk" style={{ width: '90%', height: 18, marginBottom: 8 }} />
          <div className="nh-sk" style={{ width: '40%', height: 12, marginBottom: 20 }} />
          <div className="nh-sk" style={{ width: '100%', height: 60, marginBottom: 20 }} />
          <div className="nh-sk" style={{ width: '60%', height: 14, marginBottom: 10 }} />
          <div className="nh-sk" style={{ width: '85%', height: 14, marginBottom: 10 }} />
          <div className="nh-sk" style={{ width: '70%', height: 14, marginBottom: 20 }} />
          <div className="nh-sk" style={{ width: '100%', height: 84, borderRadius: 14 }} />
        </div>
      </div>
    </div>
  )
}


// ─── Empty state (niche is being generated right now, or generation failed) ──

function HeroEmpty({ niche, reason }) {
  const label = NICHE_LABELS[niche] || niche || 'your niche'
  const isGenerating = reason === 'generating_now' || reason === 'no_cache_yet'

  return (
    <div className="nh-gen">
      <style>{`
        .nh-gen {
          position: relative;
          background: linear-gradient(180deg, #ffffff 0%, #fafafb 100%);
          border: 1px solid ${C.border};
          border-radius: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.06);
          padding: 26px 30px;
          margin-bottom: 28px;
          font-family: 'Inter', system-ui, sans-serif;
          overflow: hidden;
          animation: nhRise 0.4s cubic-bezier(0.2, 0.7, 0.3, 1);
        }
        .nh-gen::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, ${C.red} 0%, #fca5a5 50%, ${C.red} 100%);
          background-size: 200% 100%;
          opacity: 0.95;
          animation: nhSlide 2s linear infinite;
        }
        @keyframes nhSlide { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
        @keyframes nhRise  { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
        @keyframes nhRingSpin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes nhDotBounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.45 } 40% { transform: translateY(-4px); opacity: 1 } }
        .nh-gen-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: ${C.red};
          margin-bottom: 14px;
        }
        .nh-gen-row { display: flex; align-items: center; gap: 22px; }
        @media (max-width: 720px) {
          .nh-gen-row { flex-direction: column; align-items: flex-start; gap: 18px; }
        }
        .nh-gen-ring {
          position: relative;
          width: 56px; height: 56px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .nh-gen-ring::before {
          content: '';
          position: absolute; inset: 0;
          border-radius: 50%;
          background: conic-gradient(${C.red}, #fca5a5, transparent 70%, ${C.red});
          animation: nhRingSpin 1.4s linear infinite;
          mask: radial-gradient(circle, transparent 56%, black 58%);
          -webkit-mask: radial-gradient(circle, transparent 56%, black 58%);
        }
        .nh-gen-ring-core {
          position: absolute; inset: 8px;
          background: #ffffff;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: inset 0 0 0 1px ${C.border};
        }
        .nh-gen-text { flex: 1; min-width: 0; }
        .nh-gen-h2 {
          font-size: 18px; font-weight: 800; color: ${C.text1};
          letter-spacing: -0.3px; line-height: 1.3; margin-bottom: 6px;
        }
        .nh-gen-h2 .nh-niche-pill {
          display: inline-flex; align-items: center;
          font-size: 12.5px; font-weight: 700;
          background: #fff5f5; color: ${C.red};
          border: 1px solid rgba(229,37,27,0.18);
          padding: 2px 9px; border-radius: 100px;
          margin: 0 4px; vertical-align: middle;
          letter-spacing: -0.05px;
        }
        .nh-gen-p {
          font-size: 13px; color: ${C.text3}; line-height: 1.55;
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }
        .nh-gen-dots { display: inline-flex; gap: 3px; align-items: center; }
        .nh-gen-dots span {
          width: 4px; height: 4px; border-radius: 50%;
          background: ${C.red};
          animation: nhDotBounce 1.2s ease-in-out infinite;
        }
        .nh-gen-dots span:nth-child(2) { animation-delay: 0.15s }
        .nh-gen-dots span:nth-child(3) { animation-delay: 0.3s }
        .nh-gen-steps {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid ${C.borderSoft};
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
        }
        @media (max-width: 720px) {
          .nh-gen-steps { grid-template-columns: 1fr; gap: 10px; }
        }
        .nh-gen-step {
          display: flex; align-items: center; gap: 9px;
          font-size: 12px; color: ${C.text2}; line-height: 1.4;
        }
        .nh-gen-step-num {
          width: 18px; height: 18px; border-radius: 50%;
          background: #f1f1f6; color: ${C.text3};
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 800;
          flex-shrink: 0;
        }
      `}</style>

      <div className="nh-gen-eyebrow">
        <span>{isGenerating ? 'Discovering' : 'Just a moment'}</span>
      </div>
      <div className="nh-gen-row">
        <div className="nh-gen-ring">
          <div className="nh-gen-ring-core">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/>
              <line x1="20" y1="20" x2="16.65" y2="16.65"/>
            </svg>
          </div>
        </div>
        <div className="nh-gen-text">
          <p className="nh-gen-h2">
            Picking the top
            <span className="nh-niche-pill">{label}</span>
            outlier winning on YouTube right now
          </p>
          <p className="nh-gen-p">
            {isGenerating
              ? 'Usually takes 15 to 30 seconds. The card refreshes here automatically.'
              : 'Try refreshing the page. If this keeps happening, email support@ytgrowth.io.'}
            {isGenerating && (
              <span className="nh-gen-dots">
                <span /><span /><span />
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="nh-gen-steps">
        <div className="nh-gen-step">
          <span className="nh-gen-step-num">1</span>
          Scanning niche search results
        </div>
        <div className="nh-gen-step">
          <span className="nh-gen-step-num">2</span>
          Scoring views vs. channel subs
        </div>
        <div className="nh-gen-step">
          <span className="nh-gen-step-num">3</span>
          Writing your angle
        </div>
      </div>
    </div>
  )
}
