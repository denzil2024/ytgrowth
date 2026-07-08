/* Channel Audit product preview. Same editorial skin as HeroDashboardPreview:
   white surface, sharp hairline cards, Fraunces numbers, Barlow labels,
   restrained red accent. Shows the audit view, a score ring over a ranked
   set of scored dimensions, ending on the single priority action. */

import { isChannelBrain } from '../../brandHost'

const SERIF = "'Fraunces', Georgia, serif"
const SANS = "'Barlow', system-ui, sans-serif"
const INK = '#14130f'
const SOFT = '#5c574e'
const MUT = '#8a8378'
const LINE = 'rgba(20,19,15,0.12)'
const ACCENT = '#e5302a'

/* Editorial score ring: red arc, Fraunces serif number. */
function ScoreRing({ score, size = 64 }) {
  const r = 27, c = 33, circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 66 66">
        <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(20,19,15,0.10)" strokeWidth="6" />
        <circle cx={c} cy={c} r={r} fill="none" stroke={ACCENT} strokeWidth="6" strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" transform="rotate(-90 33 33)" />
      </svg>
      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: size * 0.32, fontWeight: 400, color: INK, letterSpacing: '-0.5px' }}>{score}</span>
    </div>
  )
}

/* One scored dimension row: label, hairline bar, Fraunces score. The weak
   one carries a small accent flag so the eye lands on what needs fixing. */
function DimRow({ label, score, weak }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderTop: '1px solid ' + LINE }}>
      <span style={{ width: 96, flexShrink: 0, fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: weak ? ACCENT : MUT }}>{label}</span>
      <span style={{ flex: 1, height: 5, background: 'rgba(20,19,15,0.08)', position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', inset: 0, width: score + '%', background: weak ? ACCENT : 'rgba(20,19,15,0.55)' }} />
      </span>
      <span style={{ width: 26, flexShrink: 0, textAlign: 'right', fontFamily: SERIF, fontSize: 16, fontWeight: 400, color: weak ? ACCENT : INK, letterSpacing: '-0.5px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{score}</span>
    </div>
  )
}

export default function ChannelAuditPreview({ isMobile }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid ' + LINE, boxShadow: '0 28px 70px rgba(20,19,15,0.14), 0 2px 4px rgba(20,19,15,0.05)', overflow: 'hidden' }}>
      {/* Window chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 18px', borderBottom: '1px solid ' + LINE, background: '#faf9f6' }}>
        <span style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(20,19,15,0.16)' }} />)}
        </span>
        <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 500, color: MUT, marginLeft: 6 }}>{isChannelBrain() ? 'channelbrain.online' : 'ytgrowth.io'} / audit</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT }} />
          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: ACCENT, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Live</span>
        </span>
      </div>

      {/* Channel header + overall score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: isMobile ? '16px 18px' : '20px 24px', borderBottom: '1px solid ' + LINE }}>
        <img src="/avatars/amara.jpg" alt="" width="50" height="50" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: INK, letterSpacing: '-0.2px' }}>Amara Diallo</p>
          <p style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginTop: 2 }}>Beauty · 73.4K subscribers</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <p style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUT, textAlign: 'right', lineHeight: 1.3 }}>Channel<br />health</p>
          <ScoreRing score={68} size={isMobile ? 54 : 64} />
        </div>
      </div>

      {/* Scored dimensions */}
      <div style={{ padding: isMobile ? '6px 18px 14px' : '8px 24px 18px' }}>
        {[
          { label: 'Traffic mix', score: 71 },
          { label: 'Retention', score: 38, weak: true },
          { label: 'CTR health', score: 64 },
          { label: 'SEO', score: 55 },
          { label: 'Consistency', score: 82 },
        ].map((d, i) => <DimRow key={i} {...d} />)}
      </div>

      {/* Priority action */}
      <div style={{ padding: isMobile ? '15px 18px' : '16px 24px 18px', display: 'flex', alignItems: 'center', gap: 14, borderTop: '1px solid ' + LINE, background: '#faf9f6' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
            <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT }}>Priority action</span>
            <span style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, color: ACCENT, border: '1px solid rgba(229,48,42,0.32)', padding: '2px 8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>High impact</span>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 500, color: INK, lineHeight: 1.45 }}>Retention drops at 0:18. Rewrite your intros to open on the payoff.</p>
        </div>
        {!isMobile && <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, background: ACCENT, color: '#fff', fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '11px 18px', whiteSpace: 'nowrap' }}>Fix it →</span>}
      </div>
    </div>
  )
}
