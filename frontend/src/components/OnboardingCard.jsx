/* OnboardingCard, the real getting-started flow for new signups.
   Lives at the top of the Feed (.ov-page) for new users only, in the
   Feed's own card grammar (dark SHELL gradient, hairline
   rgba(255,255,255,0.08), 14px radius, soft shadow + inset). Replaces the lone
   "Run your first audit" card and the dismiss-and-forget WelcomeModal.

   Completion is derived from server-backed signals the app already
   loads (audited / optimized / exploredIdeas) so it is correct across
   devices; only the dismissal is local. Step 1 (channel connected) is
   always done on arrival so the user opens at 1/4, never 0.

   Props:
     channelName    , for the step-1 trailing label
     audited        , has the AI audit run (data.insights present)
     optimized      , has run an SEO optimization
     exploredIdeas  , has used Video Ideas / Outliers
     running        , audit currently in progress
     onRunAudit()   , trigger the first audit (same flow as the old card)
     onNavigate(tab), jump to a feature tab
     onDismiss()    , skip / finish */

import { useEffect, useState } from 'react'

const C = {
  ink:    '#f4f4f5',
  sub:    '#cfd0d6',
  eyebrow:'#b2b3bb',
  hair:   'rgba(255,255,255,0.08)',
  hair2:  'rgba(255,255,255,0.14)',
  tint:   'rgba(255,255,255,0.04)',
  green:  '#34d27b',
  red:    '#e5251b',
  redHi:  '#ef3a31',
  faint:  '#b2b3bb',
}

function CheckIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1.5,6.2 4.6,9.2 10.5,2.8" />
    </svg>
  )
}

function ArrowIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export default function OnboardingCard({
  channelName,
  trackedCompetitor = false,
  optimized = false,
  exploredIdeas = false,
  onNavigate,
  onDismiss,
}) {
  const steps = [
    { id: 'connect',    title: 'Channel connected', body: 'Your YouTube channel is linked and ready.', trailing: channelName || 'Connected', done: true },
    { id: 'competitor', title: 'Track a competitor', body: 'See exactly what is working for channels in your niche.', cta: 'Open Competitors', target: 'Competitors', done: trackedCompetitor },
    { id: 'seo',        title: 'Optimize a video', body: 'SEO Studio rewrites a title and description that gets clicks.', cta: 'Open SEO Studio', target: 'SEO Studio', done: optimized },
    { id: 'idea',       title: 'Find your next idea', body: "See what's working in your niche right now.", cta: 'Open Video Ideas', target: 'Video Ideas', done: exploredIdeas },
  ]

  const doneCount = steps.filter(s => s.done).length
  const total = steps.length
  const activeIndex = steps.findIndex(s => !s.done)
  const allDone = activeIndex === -1

  // Mount fade-up + per-row stagger (Feed's own curve).
  const [shown, setShown] = useState(false)
  useEffect(() => { const t = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(t) }, [])

  const cardStyle = {
    background: 'linear-gradient(180deg,#1e1e24 0%,#18181c 100%)',
    border: `1px solid ${C.hair}`,
    borderRadius: 14,
    boxShadow: '0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
    marginTop: 32, marginBottom: 24,
    opacity: shown ? 1 : 0,
    transform: shown ? 'none' : 'translateY(8px)',
    transition: 'opacity 0.5s cubic-bezier(0.2,0.7,0.3,1), transform 0.5s cubic-bezier(0.2,0.7,0.3,1)',
  }

  /* ── All-done collapsed state ──────────────────────────────────────── */
  if (allDone) {
    return (
      <div className="ytg-card" style={{ ...cardStyle, padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{
          flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
          background: 'rgba(22,163,74,0.16)', color: '#34d27b',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckIcon size={14} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.ink, letterSpacing: '-0.2px' }}>You're all set</p>
          <p style={{ fontSize: 13, fontWeight: 450, color: C.sub, marginTop: 2 }}>Your channel is set up. Your Feed is below.</p>
        </div>
        <button onClick={onDismiss} style={primaryBtn}>
          Go to my Feed <ArrowIcon size={12} />
        </button>
      </div>
    )
  }

  return (
    <div className="ytg-card" style={{ ...cardStyle, padding: '24px 28px 12px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.eyebrow, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 7 }}>
            Get started
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: C.ink, letterSpacing: '-0.5px', lineHeight: 1.2, margin: 0 }}>
            Set up your channel
          </h2>
          <p style={{ fontSize: 13.5, fontWeight: 450, color: C.sub, marginTop: 6, lineHeight: 1.5 }}>
            A few steps to your first wins. Takes about two minutes.
          </p>
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>
              {doneCount}<span style={{ color: C.faint, fontWeight: 500 }}> / {total}</span>
            </span>
            <button onClick={onDismiss} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500,
              color: C.faint, padding: '2px 2px',
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = C.ink }}
              onMouseLeave={e => { e.currentTarget.style.color = C.faint }}
            >Skip</button>
          </div>
          <div style={{ width: 132, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden', marginTop: 9, marginLeft: 'auto' }}>
            <div style={{
              width: `${(doneCount / total) * 100}%`, height: '100%',
              background: C.green, borderRadius: 99,
              transition: 'width 0.7s cubic-bezier(0.34,1.56,0.64,1)',
            }} />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ marginTop: 18 }}>
        {steps.map((s, i) => {
          const isActive = i === activeIndex
          const last = i === steps.length - 1
          return (
            <div key={s.id} style={{
              opacity: shown ? (s.done ? 0.5 : 1) : 0,
              transform: shown ? 'none' : 'translateY(6px)',
              transition: `opacity 0.45s cubic-bezier(0.2,0.7,0.3,1) ${60 + i * 55}ms, transform 0.45s cubic-bezier(0.2,0.7,0.3,1) ${60 + i * 55}ms`,
            }}>
              {i > 0 && <div style={{ height: 1, background: C.hair, margin: '0 -10px' }} />}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 13,
                padding: '14px 10px',
                margin: '0 -10px',
                borderRadius: 10,
                background: isActive ? C.tint : 'transparent',
              }}>
                {/* Marker */}
                <span style={{
                  flexShrink: 0, marginTop: 1,
                  width: 22, height: 22, borderRadius: '50%',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: s.done ? 'rgba(22,163,74,0.16)' : isActive ? '#1c1c21' : 'transparent',
                  border: s.done ? 'none' : `1.5px solid ${isActive ? C.hair2 : 'rgba(255,255,255,0.16)'}`,
                  color: s.done ? C.green : isActive ? C.ink : C.faint,
                  fontSize: 11, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                }}>
                  {s.done ? <CheckIcon /> : i + 1}
                </span>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.ink, letterSpacing: '-0.1px' }}>{s.title}</p>
                    {s.done && s.trailing && (
                      <span style={{ fontSize: 12, fontWeight: 500, color: C.faint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                        {s.trailing}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12.5, fontWeight: 450, color: C.sub, marginTop: 3, lineHeight: 1.5 }}>{s.body}</p>
                </div>

                {/* Action */}
                <div style={{ flexShrink: 0, alignSelf: 'center' }}>
                  {s.done ? (
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#34d27b', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <CheckIcon size={11} /> Done
                    </span>
                  ) : (
                    <button
                      onClick={() => onNavigate?.(s.target)}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600,
                        color: C.faint, display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '4px 2px', transition: 'color 0.15s, gap 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = C.ink; e.currentTarget.style.gap = '7px' }}
                      onMouseLeave={e => { e.currentTarget.style.color = C.faint; e.currentTarget.style.gap = '5px' }}
                    >
                      Start <ArrowIcon size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const primaryBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: `linear-gradient(180deg, ${C.redHi} 0%, ${C.red} 100%)`,
  color: '#ffffff', border: 'none', cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
  letterSpacing: '-0.01em', padding: '8px 16px', borderRadius: 100,
  whiteSpace: 'nowrap',
  boxShadow: '0 1px 2px rgba(229,37,27,0.30), inset 0 1px 0 rgba(255,255,255,0.22)',
  transition: 'filter 0.15s',
}
