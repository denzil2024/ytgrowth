/* AuditProgress — premium full-screen-card audit experience.

   Replaces the previous "Running AI audit…" spinner with a staged
   progress card that explains what's happening while Claude is
   thinking. The 4 stages are timed on the client to roughly match
   the backend's actual flow (10-25 seconds total). The component
   transitions through them on a soft curve; even if the backend
   finishes early, we hold the final stage open until the parent
   passes done=true so the user always sees the "Almost ready..."
   moment land.

   Props:
     done    — flips true when the parent has the insights payload
     onDone  — optional callback fired once the progress bar reaches
               100% AND done=true; lets the parent reveal results
               with a coordinated fade.
*/

import { useEffect, useRef, useState } from 'react'

const C = {
  red: '#e5251b', redDeep: '#a50f07',
  text1: '#f4f4f5', text2: '#a1a1aa', text3: '#71717a',
  border: 'rgba(255,255,255,0.08)', borderSoft: 'rgba(255,255,255,0.06)',
  green: '#34d27b', greenSoft: 'rgba(22,163,74,0.16)',
}

const STAGES = [
  {
    label: 'Reading your latest videos',
    sub: 'Pulling titles, descriptions, retention, and CTR',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    ),
    weight: 0.18,  // share of total bar progress
  },
  {
    label: 'Comparing to your niche cohort',
    sub: 'Benchmarking against channels at your subscriber tier',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    weight: 0.18,
  },
  {
    label: 'Identifying growth bottlenecks',
    sub: 'Where your videos are leaking views, retention, or subs',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    weight: 0.42,  // the long one — Claude is actually running here
  },
  {
    label: 'Writing your Priority Actions',
    sub: 'Specific, ranked moves you can ship this week',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    weight: 0.22,
  },
]

const TOTAL_DURATION_MS = 22000   // ~22s baseline before "Almost ready" hold

export default function AuditProgress({ done = false, onDone }) {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())
  const finishedRef = useRef(false)

  useEffect(() => {
    let raf
    const tick = () => {
      setElapsed(Date.now() - startRef.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (done && !finishedRef.current) {
      finishedRef.current = true
      // Let the bar visually catch up before the parent removes us.
      const t = setTimeout(() => onDone?.(), 700)
      return () => clearTimeout(t)
    }
  }, [done, onDone])

  // Compute progress 0..1. Eases toward 0.94 while waiting, snaps to 1.0
  // when done=true. The asymptote prevents the "100% but still waiting"
  // dishonesty trap; user always sees a final completion bump.
  const raw = Math.min(1, elapsed / TOTAL_DURATION_MS)
  // Soft ease toward 0.94 cap when not done.
  const eased = 1 - Math.pow(1 - raw, 1.4)
  const progress = done ? 1 : Math.min(0.94, eased)

  // Determine which stages are complete, active, pending.
  let cumulative = 0
  const stageStates = STAGES.map((s) => {
    const start = cumulative
    cumulative += s.weight
    const end = cumulative
    if (progress >= end - 0.001) return 'done'
    if (progress >= start)       return 'active'
    return 'pending'
  })
  // When done=true everything reads as done.
  const finalStates = done ? STAGES.map(() => 'done') : stageStates

  const pctLabel = Math.round(progress * 100)

  return (
    <div className="ap-wrap">
      <style>{`
        .ap-wrap {
          position: relative;
          background: linear-gradient(180deg,#1e1e24 0%,#18181c 100%);
          border: 1px solid ${C.border};
          border-radius: 22px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.4), 0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04);
          padding: 30px 34px 28px;
          font-family: 'Inter', system-ui, sans-serif;
          overflow: hidden;
          animation: apIn 0.4s cubic-bezier(0.2, 0.7, 0.3, 1);
          max-width: 640px; width: 100%;
          margin: 0 auto;
        }
        .ap-wrap::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, ${C.red} 0%, #fca5a5 50%, ${C.red} 100%);
          background-size: 200% 100%;
          animation: apSlide 1.8s linear infinite;
        }
        @keyframes apSlide { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
        @keyframes apIn { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
        @keyframes apPulse { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.08) } }
        @keyframes apSpin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }

        .ap-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: ${C.red};
          margin-bottom: 14px;
        }
        .ap-eyebrow .ap-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: ${C.red};
          animation: apPulse 1.4s ease-in-out infinite;
        }
        .ap-title {
          font-size: 22px; font-weight: 800; color: ${C.text1};
          letter-spacing: -0.45px; line-height: 1.25;
          margin-bottom: 6px;
        }
        .ap-sub {
          font-size: 13.5px; color: ${C.text3}; line-height: 1.55;
          margin-bottom: 24px;
        }

        .ap-track-wrap {
          margin-bottom: 24px;
        }
        .ap-track {
          height: 6px; border-radius: 100px;
          background: rgba(255,255,255,0.08);
          overflow: hidden;
          position: relative;
        }
        .ap-track-fill {
          height: 100%;
          background: linear-gradient(90deg, ${C.red} 0%, #fca5a5 100%);
          border-radius: 100px;
          transition: width 0.4s cubic-bezier(0.2, 0.7, 0.3, 1);
          box-shadow: 0 0 8px rgba(229,37,27,0.35);
        }
        .ap-track-row {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-top: 9px;
        }
        .ap-track-status {
          font-size: 12px; color: ${C.text2}; font-weight: 600;
          letter-spacing: -0.1px;
        }
        .ap-track-pct {
          font-size: 13px; color: ${C.text1}; font-weight: 800;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.2px;
        }

        .ap-stages {
          display: flex; flex-direction: column; gap: 4px;
        }
        .ap-stage {
          display: flex; align-items: center; gap: 14px;
          padding: 10px 0;
          border-top: 1px solid ${C.borderSoft};
          transition: opacity 0.4s, filter 0.4s;
        }
        .ap-stage:first-child { border-top: none; }
        .ap-stage[data-state="pending"] { opacity: 0.46; }
        .ap-stage[data-state="active"]  { opacity: 1; }
        .ap-stage[data-state="done"]    { opacity: 1; }
        .ap-stage-ico {
          width: 32px; height: 32px; border-radius: 10px;
          display: inline-flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.3s, color 0.3s, transform 0.3s;
        }
        .ap-stage[data-state="pending"] .ap-stage-ico { background: rgba(255,255,255,0.06); color: ${C.text3}; }
        .ap-stage[data-state="active"]  .ap-stage-ico { background: ${C.red}; color: #ffffff; box-shadow: 0 4px 12px rgba(229,37,27,0.35); }
        .ap-stage[data-state="done"]    .ap-stage-ico { background: ${C.greenSoft}; color: ${C.green}; }
        .ap-stage[data-state="active"]  .ap-stage-ico-inner { animation: apSpin 1.8s linear infinite; transform-origin: center; }

        .ap-stage-text { flex: 1; min-width: 0; }
        .ap-stage-label {
          font-size: 14px; font-weight: 700; color: ${C.text1};
          letter-spacing: -0.15px; line-height: 1.35; margin-bottom: 2px;
        }
        .ap-stage[data-state="pending"] .ap-stage-label { color: ${C.text2}; }
        .ap-stage-sub {
          font-size: 12.5px; color: ${C.text3}; line-height: 1.5;
        }

        .ap-stage-end {
          flex-shrink: 0;
          font-size: 11px; font-weight: 700; letter-spacing: 0.05em;
          text-transform: uppercase;
          color: ${C.text3};
        }
        .ap-stage[data-state="active"] .ap-stage-end { color: ${C.red}; }
        .ap-stage[data-state="done"]   .ap-stage-end { color: ${C.green}; }

        @media (max-width: 540px) {
          .ap-wrap { padding: 24px 22px 22px; }
          .ap-title { font-size: 19px; }
          .ap-stage-sub { display: none; }
        }
      `}</style>

      <div className="ap-eyebrow">
        <span className="ap-dot" />
        {done ? 'Almost ready' : 'Running your audit'}
      </div>
      <h2 className="ap-title">
        {done ? "Wrapping up your insights" : 'Your channel audit is in progress'}
      </h2>
      <p className="ap-sub">
        We are studying your last 20 videos, your audience signals, and the videos winning in your niche right now. Hang tight, this is the depth that beats a generic SEO score.
      </p>

      <div className="ap-track-wrap">
        <div className="ap-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pctLabel}>
          <div className="ap-track-fill" style={{ width: `${pctLabel}%` }} />
        </div>
        <div className="ap-track-row">
          <span className="ap-track-status">
            {done ? "We're saving everything to your dashboard now."
                  : "This typically takes 20 to 30 seconds."}
          </span>
          <span className="ap-track-pct">{pctLabel}%</span>
        </div>
      </div>

      <div className="ap-stages">
        {STAGES.map((s, i) => {
          const state = finalStates[i]
          return (
            <div key={i} className="ap-stage" data-state={state}>
              <span className="ap-stage-ico">
                {state === 'done' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <span className="ap-stage-ico-inner" style={{ display: 'inline-flex' }}>{s.icon}</span>
                )}
              </span>
              <div className="ap-stage-text">
                <p className="ap-stage-label">{s.label}</p>
                <p className="ap-stage-sub">{s.sub}</p>
              </div>
              <span className="ap-stage-end">
                {state === 'done' ? 'Done' : state === 'active' ? 'Running' : 'Pending'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
