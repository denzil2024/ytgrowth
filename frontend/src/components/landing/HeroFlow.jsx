/* Hero product flow. Replaces the static dashboard screenshot.

   The screenshot showed one frozen state, so it could not show the thing the
   hero actually promises: a channel goes in, ten dimensions get scored, and a
   ranked fix list comes out, in about 30 seconds. This runs that sequence on
   a loop so the promise is legible above the fold without reading a word.

   Three steps, ~2.4s each, then it holds on step 3 (the payoff) before
   restarting. Everything is CSS transitions driven by a step index, no
   animation library and no canvas: the whole thing is ~6KB and it respects
   prefers-reduced-motion by jumping straight to the final state.

   Design notes: same editorial skin as the rest of the site (white surface,
   hairline borders, Jakarta, restrained red). The red accent is reserved for
   the ACTIVE step and the final fix list, so the eye is pulled down the
   sequence rather than spread across it. */
import { useEffect, useState } from 'react'
import { isChannelBrain } from '../../brandHost'

const SANS = "'Plus Jakarta Sans', system-ui, sans-serif"
const INK = '#14130f'
const SOFT = '#5c574e'
const MUT = '#8a8378'
const LINE = 'rgba(20,19,15,0.12)'
const ACCENT = '#e5302a'

/* The ten audited dimensions, with the scores the ring counts up to. Weak
   ones are flagged so step 3's fix list has something to point at. */
const DIMS = [
  { label: 'Retention',   score: 41, weak: true },
  { label: 'CTR',         score: 58, weak: true },
  { label: 'Hook',        score: 38, weak: true },
  { label: 'Titles',      score: 72 },
  { label: 'Thumbnails',  score: 64 },
  { label: 'SEO',         score: 81 },
  { label: 'Upload pace', score: 88 },
  { label: 'Watch time',  score: 55, weak: true },
  { label: 'Engagement',  score: 76 },
  { label: 'Browse',      score: 69 },
]

const FIXES = [
  { rank: 1, text: 'Rewrite weak intros. Open on the payoff in 15s.', lift: 'Retention +18%' },
  { rank: 2, text: 'Raise contrast on 6 thumbnails below 60.',        lift: 'CTR +2.1pt' },
  { rank: 3, text: 'Re-cut 4 videos that lose 50% before 0:30.',      lift: 'Watch time +12%' },
]

const STEPS = ['Connect your channel', 'We score 10 dimensions', 'You get a ranked fix list']

export default function HeroFlow({ isMobile }) {
  /* `mounted` keeps the first client render byte-identical to the prerendered
     HTML. Without it the server emitted step 0 while the client's effect had
     already advanced the step, which React reported as hydration error #418
     and then bailed out of, leaving the card blank after the first tick.
     The loop only starts once hydration has committed. */
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(0)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) { setReduced(true); setStep(2); return }
    const id = setInterval(() => setStep(s => (s + 1) % 3), 2400)
    return () => clearInterval(id)
  }, [])

  /* Before hydration commits, always render step 0 so SSR and client agree. */
  const active = mounted ? step : 0

  const host = isChannelBrain() ? 'channelbrain.online' : 'ytgrowth.io'

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        @keyframes hfRing { from { stroke-dashoffset: 170 } to { stroke-dashoffset: var(--hf-off) } }
        @keyframes hfBar  { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        @keyframes hfIn   { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes hfPulse{ 0%,100% { opacity: 1 } 50% { opacity: 0.55 } }
        .hf-card { background:#fff; border:1px solid ${LINE}; box-shadow: 0 28px 70px rgba(20,19,15,0.14), 0 2px 4px rgba(20,19,15,0.05); overflow:hidden; }
        .hf-row  { animation: hfIn 0.45s ease both; }
        .hf-bar  { transform-origin: left; animation: hfBar 0.7s cubic-bezier(.22,.8,.3,1) both; }
      `}</style>

      {/* Window chrome, matching the rest of the product previews. */}
      <div className="hf-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 18px', borderBottom: '1px solid ' + LINE, background: '#faf9f6' }}>
          <span style={{ display: 'flex', gap: 6 }}>
            {[0, 1, 2].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(20,19,15,0.16)' }} />)}
          </span>
          <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 500, color: MUT, marginLeft: 6 }}>{host} / audit</span>
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT, animation: reduced ? 'none' : 'hfPulse 1.6s ease-in-out infinite' }} />
            <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: ACCENT, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              {active === 2 ? 'Done' : 'Running'}
            </span>
          </span>
        </div>

        {/* Stage: fixed height so the three steps swap without the page jumping. */}
        <div style={{ position: 'relative', height: isMobile ? 268 : 300, padding: isMobile ? '18px 18px' : '22px 24px' }}>

          {/* ── STEP 1: channel connects ─────────────────────────────── */}
          {active === 0 && (
            <div className="hf-row" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img src="/avatars/sophie.jpg" alt="" width="54" height="54"
                  style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', border: '2px solid ' + LINE }} />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: INK, lineHeight: 1.2 }}>Your channel</p>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginTop: 3 }}>Connected · 284 videos found</p>
                </div>
              </div>
              <div style={{ width: '72%', height: 3, background: 'rgba(20,19,15,0.08)', overflow: 'hidden' }}>
                <div className="hf-bar" style={{ height: '100%', background: ACCENT, animationDuration: '2.2s' }} />
              </div>
              <p style={{ fontFamily: SANS, fontSize: 12.5, color: SOFT }}>Reading 12 months of analytics…</p>

              {/* What is being pulled, so step 1 carries the same density as
                  steps 2 and 3 instead of leaving the stage half-empty. */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 18px', width: '82%', marginTop: 4 }}>
                {['Watch time', 'Impressions', 'Traffic sources', 'Retention curves', 'Click-through', 'Audience'].map((x, i) => (
                  <div key={x} style={{ display: 'flex', alignItems: 'center', gap: 7, animation: `hfIn 0.4s ease ${0.3 + i * 0.12}s both` }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke={ACCENT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M2.5 6.5l2.5 2.5 4.5-5.5" />
                    </svg>
                    <span style={{ fontFamily: SANS, fontSize: 11.5, color: SOFT }}>{x}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: ten dimensions score ─────────────────────────── */}
          {active === 1 && (
            <div className="hf-row" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, color: MUT, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
                Scoring 10 dimensions
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? '7px 14px' : '9px 20px', flex: 1, alignContent: 'center' }}>
                {DIMS.map((d, i) => (
                  <div key={d.label} style={{ animation: `hfIn 0.4s ease ${i * 0.055}s both` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 500, color: SOFT }}>{d.label}</span>
                      <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: d.weak ? ACCENT : INK, fontVariantNumeric: 'tabular-nums' }}>{d.score}</span>
                    </div>
                    <div style={{ height: 3, background: 'rgba(20,19,15,0.08)' }}>
                      <div className="hf-bar" style={{
                        height: '100%', width: d.score + '%',
                        background: d.weak ? ACCENT : 'rgba(20,19,15,0.30)',
                        animationDelay: (i * 0.055 + 0.1) + 's',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 3: the ranked fix list, the payoff ──────────────── */}
          {active === 2 && (
            <div className="hf-row" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                <p style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, color: ACCENT, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  Do these, in order
                </p>
                <p style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: MUT }}>Score 61 / 100</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                {FIXES.map((f, i) => (
                  <div key={f.rank} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    border: '1px solid ' + (i === 0 ? 'rgba(229,48,42,0.28)' : LINE),
                    background: i === 0 ? 'rgba(229,48,42,0.04)' : '#fff',
                    padding: isMobile ? '10px 12px' : '12px 14px',
                    animation: `hfIn 0.45s ease ${i * 0.12}s both`,
                  }}>
                    <span style={{
                      fontFamily: SANS, fontSize: 12, fontWeight: 700, lineHeight: 1.5,
                      color: i === 0 ? ACCENT : MUT, flexShrink: 0, fontVariantNumeric: 'tabular-nums',
                    }}>{f.rank}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: SANS, fontSize: isMobile ? 12.5 : 13.5, fontWeight: 600, color: INK, lineHeight: 1.4 }}>{f.text}</p>
                      <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: ACCENT, marginTop: 4 }}>{f.lift}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step rail: names the sequence so the loop reads as a process. */}
        <div style={{ display: 'flex', borderTop: '1px solid ' + LINE }}>
          {STEPS.map((label, i) => (
            <div key={label} style={{
              flex: 1, padding: isMobile ? '10px 8px' : '12px 14px',
              borderRight: i < 2 ? '1px solid ' + LINE : 'none',
              background: active === i ? 'rgba(229,48,42,0.04)' : 'transparent',
              transition: 'background 0.3s',
            }}>
              <p style={{
                fontFamily: SANS, fontSize: isMobile ? 9.5 : 10.5, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: active === i ? ACCENT : MUT, transition: 'color 0.3s',
              }}>{isMobile ? label.split(' ').slice(0, 2).join(' ') : label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
