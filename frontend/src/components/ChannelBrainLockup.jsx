/* ─── ChannelBrain lockup ─────────────────────────────────────────────────
   "Channel | Brain" set as live text, mirroring the ytgrowth BrandLockup
   grammar: same font (Barlow 600), same hairline divider, same red accent.
   ChannelBrain is the dashboard / OAuth-client brand (channelbrain.online);
   this keeps it visually of-a-piece with ytgrowth without reusing the name.

   Ink "Channel"  |  red "Brain".

   Live vector text, not an image: crisp at every size, perfect spacing,
   ~0 asset weight.

   Props:
     height  visual size in px; font-size maps at 0.72 of it. Default 30.
     tone    'dark'  → ink "Channel" + ink divider   (light backgrounds)
             'light' → white "Channel" + white divider (dark backgrounds) */

const RED = '#e5251b'
const INK = '#17171c'
const FONT = "'Barlow', system-ui, sans-serif"
const WEIGHT = 600

export default function ChannelBrainLockup({ height = 30, tone = 'dark' }) {
  const ink = tone === 'light' ? '#ffffff' : INK
  const fontSize = Math.round(height * 0.72)

  const divider = {
    display: 'inline-block',
    width: Math.max(2, Math.round(fontSize * 0.075)),
    height: '0.72em',
    margin: '0 0.2em',
    verticalAlign: '-0.04em',
    background: ink,
    borderRadius: 1,
  }

  return (
    <span style={{
      fontFamily: FONT, fontWeight: WEIGHT, fontSize,
      letterSpacing: '-0.014em', lineHeight: 1, whiteSpace: 'nowrap',
    }}>
      <span style={{ color: ink }}>Channel</span>
      <span aria-hidden="true" style={divider} />
      <span style={{ color: RED }}>Brain</span>
    </span>
  )
}
