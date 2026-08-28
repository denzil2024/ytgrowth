/* Compliance label for YouTube API policy III.E.4h.

   Every score, grade, or multiplier that YTGrowth calculates itself (as
   opposed to a raw value returned by the YouTube Data / Analytics API) must
   be visibly marked as our own analysis, not a YouTube metric. This label
   sits next to each derived-score cluster and states the disclaimer in the
   visible text itself (not just a hover tooltip), so it reads correctly in
   a static screenshot.

   Colour is inherited (currentColor + opacity) so the tag reads correctly on
   both the light editorial pages and the dark app shell. Pass `color` to pin
   it to a page's muted token when currentColor is too strong. */

import { isChannelBrain } from '../brandHost'

export default function EstimateTag({ label, color, style }) {
  const brand = isChannelBrain() ? 'ChannelBrain' : 'YTGrowth'
  return (
    <span
      title={`Calculated by ${brand}. This is our own analysis, not a YouTube metric.`}
      style={{
        fontSize: 11.5,
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: color || 'currentColor',
        opacity: color ? 1 : 0.85,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {label || `Not a YouTube metric — ${brand} estimate`}
    </span>
  )
}
