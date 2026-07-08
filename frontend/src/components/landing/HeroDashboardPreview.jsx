/* Hero product preview. Real product data + the real Sparkline chart
   primitive, rendered in OUR editorial skin: light/white surface, sharp
   hairline cards, Fraunces numbers, Barlow labels, restrained red accent. */
import { Sparkline } from '../../pages/dashboard/primitives'
import { isChannelBrain } from '../../brandHost'

const SERIF = "'Fraunces', Georgia, serif"
const SANS = "'Barlow', system-ui, sans-serif"
const INK = '#14130f'
const SOFT = '#5c574e'
const MUT = '#8a8378'
const LINE = 'rgba(20,19,15,0.12)'
const ACCENT = '#e5302a'

const SUBS = [37.4, 37.6, 37.5, 37.9, 38.2, 38.1, 38.6, 38.9, 39.1, 39.0, 39.5, 39.8, 40.0, 40.3, 40.2, 40.7, 41.0, 41.2, 41.5, 41.4, 41.9, 42.1, 42.4, 42.6, 42.5, 43.0, 43.4, 43.8]
const VIEWS = [12, 13, 12.5, 14, 13.5, 15, 16, 15.5, 14.8, 16.2, 17, 16.5, 18, 17.5, 19, 18.4, 17.8, 19.5, 20, 19.2, 21, 20.4, 18.4, 19, 20.8, 21.5, 20.9, 22]

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

function Delta({ children }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: SANS, fontSize: 11, fontWeight: 700, color: ACCENT }}>
      <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8V2M2.5 4.5 5 2l2.5 2.5" /></svg>
      {children}
    </span>
  )
}

export default function HeroDashboardPreview({ isMobile }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid ' + LINE, boxShadow: '0 28px 70px rgba(20,19,15,0.14), 0 2px 4px rgba(20,19,15,0.05)', overflow: 'hidden' }}>
      {/* Window chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 18px', borderBottom: '1px solid ' + LINE, background: '#faf9f6' }}>
        <span style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(20,19,15,0.16)' }} />)}
        </span>
        <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 500, color: MUT, marginLeft: 6 }}>{isChannelBrain() ? 'channelbrain.online' : 'ytgrowth.io'} / dashboard</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT }} />
          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: ACCENT, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Live</span>
        </span>
      </div>

      {/* Channel header + audit score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: isMobile ? '16px 18px' : '20px 24px', borderBottom: '1px solid ' + LINE }}>
        <img src="/avatars/sophie.webp" alt="" width="50" height="50" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: INK, letterSpacing: '-0.2px' }}>Sophie Brandt</p>
          <p style={{ fontFamily: SANS, fontSize: 13, color: MUT, marginTop: 2 }}>Travel · 42.1K subscribers</p>
        </div>
        <ScoreRing score={72} size={isMobile ? 54 : 64} />
      </div>

      {/* Two real metric tiles with real sparklines */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid ' + LINE }}>
        {[
          { label: 'Subscribers', value: '42,100', delta: '+1.2K', series: SUBS, br: true },
          { label: 'Avg views / video', value: '18,400', delta: '+9%', series: VIEWS, br: false },
        ].map((t, i) => (
          <div key={i} style={{ padding: isMobile ? '15px 15px' : '18px 20px', borderRight: t.br ? '1px solid ' + LINE : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MUT }}>{t.label}</span>
              <Delta>{t.delta}</Delta>
            </div>
            <p style={{ fontFamily: SERIF, fontSize: isMobile ? 26 : 32, fontWeight: 400, letterSpacing: '-0.5px', color: INK, lineHeight: 1, marginBottom: 12, fontVariantNumeric: 'tabular-nums' }}>{t.value}</p>
            <Sparkline data={t.series} width={isMobile ? 140 : 200} height={42} stroke={ACCENT} fill="rgba(229,48,42,0.10)" strokeWidth={2} />
          </div>
        ))}
      </div>

      {/* Real priority action row */}
      <div style={{ padding: isMobile ? '15px 18px' : '18px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
            <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT }}>Priority action</span>
            <span style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, color: ACCENT, border: '1px solid rgba(229,48,42,0.32)', padding: '2px 8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>High impact</span>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 500, color: INK, lineHeight: 1.45 }}>Rewrite weak intros. Open on the payoff in the first 15 seconds.</p>
        </div>
        {!isMobile && <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, background: ACCENT, color: '#fff', fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '11px 18px', whiteSpace: 'nowrap' }}>Do this →</span>}
      </div>
    </div>
  )
}
