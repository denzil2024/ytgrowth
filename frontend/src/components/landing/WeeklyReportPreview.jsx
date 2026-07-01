/* Weekly Report product preview. Same editorial skin as the hero, audit,
   competitor, and thumbnail previews: white surface, sharp hairline cards,
   Fraunces numbers, Barlow labels, restrained red accent. Shows the Monday
   digest, the week's movement and the one action worth doing. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS = "'Barlow', system-ui, sans-serif"
const INK = '#14130f'
const SOFT = '#5c574e'
const MUT = '#8a8378'
const LINE = 'rgba(20,19,15,0.12)'
const ACCENT = '#e5302a'

function Delta({ children, steady }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: SANS, fontSize: 11, fontWeight: 700, color: steady ? MUT : ACCENT }}>
      {steady
        ? <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 5h6" /></svg>
        : <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8V2M2.5 4.5 5 2l2.5 2.5" /></svg>}
      {children}
    </span>
  )
}

export default function WeeklyReportPreview({ isMobile }) {
  const tiles = [
    { val: '+124', label: 'New subscribers', delta: 'vs last week' },
    { val: '+8.2K', label: 'Views', delta: '12%' },
    { val: '4.8%', label: 'Avg CTR', delta: '0.6 pts', br: true },
    { val: '71', label: 'Channel score', delta: 'steady', steady: true },
  ]
  return (
    <div style={{ background: '#ffffff', border: '1px solid ' + LINE, boxShadow: '0 28px 70px rgba(20,19,15,0.14), 0 2px 4px rgba(20,19,15,0.05)', overflow: 'hidden' }}>
      {/* Window chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 18px', borderBottom: '1px solid ' + LINE, background: '#faf9f6' }}>
        <span style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(20,19,15,0.16)' }} />)}
        </span>
        <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 500, color: MUT, marginLeft: 6 }}>ytgrowth.io / weekly</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT }} />
          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: ACCENT, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Monday 8AM</span>
        </span>
      </div>

      {/* Digest header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: isMobile ? '16px 18px' : '18px 24px', borderBottom: '1px solid ' + LINE }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MUT, marginBottom: 4 }}>Apr 7 – Apr 13</p>
          <p style={{ fontFamily: SERIF, fontSize: isMobile ? 19 : 22, fontWeight: 400, color: INK, letterSpacing: '-0.3px', lineHeight: 1.1 }}>Your strongest week in six.</p>
        </div>
        <span style={{ flexShrink: 0, fontFamily: SANS, fontSize: 9.5, fontWeight: 700, color: ACCENT, border: '1px solid rgba(229,48,42,0.32)', padding: '3px 9px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Latest</span>
      </div>

      {/* Movement tiles, 2x2 connected hairline grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {tiles.map((t, i) => (
          <div key={i} style={{ padding: isMobile ? '15px 18px' : '17px 24px', borderRight: i % 2 === 0 ? '1px solid ' + LINE : 'none', borderBottom: i < 2 ? '1px solid ' + LINE : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUT }}>{t.label}</span>
              <Delta steady={t.steady}>{t.delta}</Delta>
            </div>
            <p style={{ fontFamily: SERIF, fontSize: isMobile ? 26 : 30, fontWeight: 400, color: INK, letterSpacing: '-0.6px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{t.val}</p>
          </div>
        ))}
      </div>

      {/* The one action */}
      <div style={{ padding: isMobile ? '15px 18px' : '16px 24px 18px', display: 'flex', alignItems: 'center', gap: 14, borderTop: '1px solid ' + LINE, background: '#faf9f6' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
            <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT }}>Do this week</span>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 500, color: INK, lineHeight: 1.45 }}>Upload Tuesday before 10am. Your last three best weeks all opened with a Tuesday upload.</p>
        </div>
      </div>
    </div>
  )
}
