/* Thumbnail IQ product preview. Same editorial skin as the hero, audit, and
   competitor previews: white surface, sharp hairline cards, Fraunces numbers,
   Barlow labels, restrained red accent. Shows a real thumbnail being scored,
   the two-layer breakdown, and the single highest-impact fix. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS = "'Barlow', system-ui, sans-serif"
const INK = '#14130f'
const SOFT = '#5c574e'
const MUT = '#8a8378'
const LINE = 'rgba(20,19,15,0.12)'
const ACCENT = '#e5302a'

/* One scored layer: label, hairline bar (out of its max), score fraction. */
function LayerRow({ label, score, max }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderTop: '1px solid ' + LINE }}>
      <span style={{ width: 116, flexShrink: 0, fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUT }}>{label}</span>
      <span style={{ flex: 1, height: 5, background: 'rgba(20,19,15,0.08)', position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', inset: 0, width: (score / max * 100) + '%', background: 'rgba(20,19,15,0.55)' }} />
      </span>
      <span style={{ width: 44, flexShrink: 0, textAlign: 'right', fontFamily: SERIF, fontSize: 15, fontWeight: 400, color: INK, letterSpacing: '-0.3px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{score}<span style={{ fontFamily: SANS, fontSize: 11, color: MUT }}>/{max}</span></span>
    </div>
  )
}

export default function ThumbnailPreview({ isMobile }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid ' + LINE, boxShadow: '0 28px 70px rgba(20,19,15,0.14), 0 2px 4px rgba(20,19,15,0.05)', overflow: 'hidden' }}>
      {/* Window chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 18px', borderBottom: '1px solid ' + LINE, background: '#faf9f6' }}>
        <span style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(20,19,15,0.16)' }} />)}
        </span>
        <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 500, color: MUT, marginLeft: 6 }}>ytgrowth.io / thumbnail</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT }} />
          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: ACCENT, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Scored</span>
        </span>
      </div>

      {/* The thumbnail under analysis */}
      <div style={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', background: '#000', borderBottom: '1px solid ' + LINE }}>
        <img src="/blog/youtube-thumbnail-ideas-colors.jpg" alt="Thumbnail being scored" loading="lazy" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Overall score + verdict */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: isMobile ? '16px 18px' : '18px 24px', borderBottom: '1px solid ' + LINE }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontFamily: SERIF, fontSize: isMobile ? 38 : 46, fontWeight: 400, color: INK, letterSpacing: '-1px', lineHeight: 1 }}>74</span>
          <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 500, color: MUT }}>/100</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: INK, lineHeight: 1.3 }}>Stands out, but it's leaving clicks on the table.</p>
          <p style={{ fontFamily: SANS, fontSize: 12, color: MUT, marginTop: 3 }}>Top thumbnails in this niche average 81.</p>
        </div>
      </div>

      {/* Two-layer breakdown */}
      <div style={{ padding: isMobile ? '4px 18px 12px' : '6px 24px 14px' }}>
        <LayerRow label="Algorithm" score={42} max={60} />
        <LayerRow label="Vision model" score={32} max={40} />
      </div>

      {/* Highest-impact fix */}
      <div style={{ padding: isMobile ? '15px 18px' : '16px 24px 18px', display: 'flex', alignItems: 'center', gap: 14, borderTop: '1px solid ' + LINE, background: '#faf9f6' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
            <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT }}>Highest-impact fix</span>
            <span style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, color: ACCENT, border: '1px solid rgba(229,48,42,0.32)', padding: '2px 8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>+9 est.</span>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 500, color: INK, lineHeight: 1.45 }}>Title competes with the subject. Trim to 3 words so the face leads the frame.</p>
        </div>
      </div>
    </div>
  )
}
