/* ─── Brand lockup ───────────────────────────────────────────────────────
   "yt | growth.io" set as live text in DM Sans. A thin vertical divider
   separates the red "yt" from "growth", which is what gives the mark its
   distinction (so it reads as a brand, not as another nav label).

   Red "yt"  |  ink "growth"  red ".io".

   Live vector text, not an image: crisp at every size, perfect spacing,
   ~0 asset weight, and no premium-export dependency.

   Props:
     height  visual size in px; font-size maps at 0.72 of it. Default 30.
     tone    'dark'  → ink "growth" + ink divider   (light backgrounds)
             'light' → white "growth" + white divider (dark backgrounds) */

const RED = '#e5251b'
const INK = '#17171c'
/* Wordmark set in the global UI sans (Barlow), not a bespoke font, so it
   coheres with the rest of the site and adds zero extra font weight. */
const FONT = "'Barlow', system-ui, sans-serif"
const WEIGHT = 600

export default function BrandLockup({ height = 30, tone = 'dark' }) {
  const ink = tone === 'light' ? '#ffffff' : INK
  const fontSize = Math.round(height * 0.72)

  // Baseline-aligned inline divider: a hairline rule that spans the cap
  // height and sits optically centred between the two words.
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
      <span style={{ color: RED }}>yt</span>
      <span aria-hidden="true" style={divider} />
      <span style={{ color: ink }}>growth</span>
      <span style={{ color: RED }}>.io</span>
    </span>
  )
}
