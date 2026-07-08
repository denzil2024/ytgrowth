/* Competitor Intelligence product preview. Same editorial skin as the hero
   and audit previews: white surface, sharp hairline cards, Fraunces numbers,
   Barlow labels, restrained red accent. Shows a tracked rival: the AI read,
   their headline stats, and the top videos worth studying. */

import { isChannelBrain } from '../../brandHost'

const SERIF = "'Fraunces', Georgia, serif"
const SANS = "'Barlow', system-ui, sans-serif"
const INK = '#14130f'
const SOFT = '#5c574e'
const MUT = '#8a8378'
const LINE = 'rgba(20,19,15,0.12)'
const ACCENT = '#e5302a'

export default function CompetitorPreview({ isMobile }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid ' + LINE, boxShadow: '0 28px 70px rgba(20,19,15,0.14), 0 2px 4px rgba(20,19,15,0.05)', overflow: 'hidden' }}>
      {/* Window chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 18px', borderBottom: '1px solid ' + LINE, background: '#faf9f6' }}>
        <span style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(20,19,15,0.16)' }} />)}
        </span>
        <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 500, color: MUT, marginLeft: 6 }}>{isChannelBrain() ? 'channelbrain.online' : 'ytgrowth.io'} / competitors</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT }} />
          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: ACCENT, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Live</span>
        </span>
      </div>

      {/* Rival header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: isMobile ? '16px 18px' : '18px 24px', borderBottom: '1px solid ' + LINE }}>
        <img src="/avatars/daniel.jpg" alt="" width="46" height="46" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: INK, letterSpacing: '-0.2px' }}>Creator Lab</p>
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: MUT, marginTop: 2 }}>142K subs · 4.6% CTR · posts every 4 days</p>
        </div>
        <span style={{ flexShrink: 0, fontFamily: SANS, fontSize: 9.5, fontWeight: 700, color: ACCENT, border: '1px solid rgba(229,48,42,0.32)', padding: '3px 9px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>High threat</span>
      </div>

      {/* AI assessment */}
      <div style={{ padding: isMobile ? '16px 18px 4px' : '18px 24px 6px' }}>
        <p style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, color: MUT, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 9 }}>AI assessment</p>
        <p style={{ fontFamily: SANS, fontSize: 13.5, color: SOFT, lineHeight: 1.62 }}>Creator Lab posts polished, safe reviews on a tight cadence, but their packaging is flat. The high-CTR hooks racking up views in your shared niche? They never touch them.</p>
      </div>

      {/* Headline stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: LINE, margin: isMobile ? '14px 18px' : '16px 24px', border: '1px solid ' + LINE }}>
        {[{ k: '142K', l: 'Subscribers' }, { k: '4.2K', l: 'Avg / video' }, { k: '4.6%', l: 'Avg CTR' }].map((s, i) => (
          <div key={i} style={{ background: '#fff', padding: '12px 14px' }}>
            <p style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: INK, letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 5, fontVariantNumeric: 'tabular-nums' }}>{s.k}</p>
            <p style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: MUT, letterSpacing: '0.04em' }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Gap detected punchline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: isMobile ? '15px 18px' : '16px 24px 18px', borderTop: '1px solid ' + LINE, background: '#faf9f6' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
            <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT }}>Gap detected</span>
            <span style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, color: ACCENT, border: '1px solid rgba(229,48,42,0.32)', padding: '2px 8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>64% of search</span>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 500, color: INK, lineHeight: 1.45 }}>High-CTR hooks. Proven demand in your niche, and Creator Lab posts none.</p>
        </div>
        {!isMobile && <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, background: ACCENT, color: '#fff', fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '11px 18px', whiteSpace: 'nowrap' }}>Take it →</span>}
      </div>
    </div>
  )
}
