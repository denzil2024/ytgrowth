/* AuditProgress, staged audit-progress card.

   Replaces the previous "Running AI audit…" spinner with a staged
   progress card that explains what's happening while Claude is
   thinking. The 4 stages are timed on the client to roughly match
   the backend's actual flow (10-25 seconds total). The component
   transitions through them on a soft curve; even if the backend
   finishes early, we hold the final stage open until the parent
   passes done=true so the user always sees the "Almost ready..."
   moment land.

   Chassis mirrors .ytg-card (editorial system): flat surface, hairline
   border, radius 0, no shadow, themed via the --yd-* variables so the
   light/dark toggle covers it. Accent is gold; green marks done stages.

   Props:
     done   , flips true when the parent has the insights payload
     onDone , optional callback fired once the progress bar reaches
               100% AND done=true; lets the parent reveal results
               with a coordinated fade.
*/

import { useEffect, useRef, useState } from 'react'

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
    sub: 'Where your videos are leaking views, retention, or subscribers',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    weight: 0.42,  // the long one, Claude is running here
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

  // Latest-ref for onDone. The parent passes a fresh inline arrow on every
  // render, so we must NOT depend on it in the teardown effect below.
  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone }, [onDone])

  useEffect(() => {
    let raf
    const tick = () => {
      setElapsed(Date.now() - startRef.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Fire onDone ~700ms after the parent flips done=true, so the bar visually
  // lands on 100% before we're torn down. Depend ONLY on `done`: when insights
  // arrive the parent re-renders (e.g. setPrevScore), which used to hand us a
  // new onDone reference, run the effect cleanup, clear this timeout, and never
  // reschedule it, freezing the card at 100% forever. Reading onDone from a
  // ref breaks that race.
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => onDoneRef.current?.(), 700)
    return () => clearTimeout(t)
  }, [done])

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
          background: var(--yd-surface);
          border: 1px solid var(--yd-line);
          border-radius: 0;
          box-shadow: none;
          padding: 28px 32px;
          margin-bottom: 24px;
          font-family: 'Barlow', system-ui, sans-serif;
          animation: apIn 0.4s cubic-bezier(0.2, 0.7, 0.3, 1);
        }
        @keyframes apIn { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
        @keyframes apDot { 0%, 100% { opacity: 1 } 50% { opacity: 0.35 } }
        @keyframes apChip { 0%, 100% { opacity: 1 } 50% { opacity: 0.72 } }

        .ap-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--yd-gold-ink);
          margin-bottom: 10px;
        }
        .ap-eyebrow .ap-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--yd-gold);
          animation: apDot 1.4s ease-in-out infinite;
        }
        .ap-title {
          font-size: 22px; font-weight: 700; color: var(--yd-ink);
          letter-spacing: -0.5px; line-height: 1.25;
          margin-bottom: 6px;
        }
        .ap-sub {
          font-size: 14px; font-weight: 400; color: var(--yd-soft);
          line-height: 1.55; max-width: 560px;
          margin-bottom: 24px;
        }

        .ap-track-wrap {
          margin-bottom: 24px;
        }
        .ap-track {
          height: 6px; border-radius: 0;
          background: var(--yd-wash2);
          overflow: hidden;
        }
        .ap-track-fill {
          height: 100%;
          background: var(--yd-gold);
          transition: width 0.4s cubic-bezier(0.2, 0.7, 0.3, 1);
        }
        .ap-track-row {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-top: 9px;
        }
        .ap-track-status {
          font-size: 12.5px; font-weight: 400; color: var(--yd-muted);
        }
        .ap-track-pct {
          font-size: 13px; color: var(--yd-ink); font-weight: 600;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.2px;
        }

        .ap-stages {
          display: flex; flex-direction: column;
        }
        .ap-stage {
          display: flex; align-items: center; gap: 14px;
          padding: 11px 0;
          border-top: 1px solid var(--yd-line-lo);
          transition: opacity 0.4s;
        }
        .ap-stage[data-state="pending"] { opacity: 0.46; }
        .ap-stage[data-state="active"]  { opacity: 1; }
        .ap-stage[data-state="done"]    { opacity: 1; }
        .ap-stage-ico {
          width: 32px; height: 32px; border-radius: 0;
          display: inline-flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.3s, color 0.3s;
        }
        .ap-stage[data-state="pending"] .ap-stage-ico { background: var(--yd-wash); color: var(--yd-muted); }
        .ap-stage[data-state="active"]  .ap-stage-ico { background: var(--yd-gold); color: var(--yd-on-gold); animation: apChip 1.4s ease-in-out infinite; }
        .ap-stage[data-state="done"]    .ap-stage-ico { background: var(--yd-green-soft); color: var(--yd-green); }

        .ap-stage-text { flex: 1; min-width: 0; }
        .ap-stage-label {
          font-size: 14px; font-weight: 600; color: var(--yd-ink);
          letter-spacing: -0.15px; line-height: 1.35; margin-bottom: 2px;
        }
        .ap-stage[data-state="pending"] .ap-stage-label { color: var(--yd-soft); }
        .ap-stage-sub {
          font-size: 12.5px; font-weight: 400; color: var(--yd-muted); line-height: 1.5;
        }

        .ap-stage-end {
          flex-shrink: 0;
          font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--yd-muted);
        }
        .ap-stage[data-state="active"] .ap-stage-end { color: var(--yd-gold-ink); }
        .ap-stage[data-state="done"]   .ap-stage-end { color: var(--yd-green); }

        @media (max-width: 540px) {
          .ap-wrap { padding: 22px 20px; }
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
                  <span style={{ display: 'inline-flex' }}>{s.icon}</span>
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
