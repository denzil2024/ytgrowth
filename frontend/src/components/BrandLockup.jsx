/* ─── Brand lockup ───────────────────────────────────────────────────────
   The play-mark + "ytgrowth" wordmark as live text, NOT a baked SVG.

   The old /logo.svg had the wordmark outlined as font paths, so weight,
   size and tracking were frozen and it crushed at small header sizes.
   This renders the mark inline and sets the wordmark in Plus Jakarta Sans
   (already loaded site-wide), so it stays crisp at any size and the type
   is fully tunable.

   Single-tone wordmark: the whole "ytgrowth" is one colour so it reads
   clean next to the red play-mark. Near-black on light backgrounds;
   pass tone="light" on dark backgrounds (app shell, footer) for white.

   Props:
     height  icon size in px (wordmark scales from it). Default 24.
     tone    'dark'  → wordmark near-black (light backgrounds)
             'light' → wordmark white       (dark backgrounds)
     gap     space between mark and wordmark. Default 9. */

const RED = '#e5251b'
const INK = '#0a0a0f'

export default function BrandLockup({ height = 24, tone = 'dark', gap = 9 }) {
  const wordColor = tone === 'light' ? '#ffffff' : INK
  const fontSize = Math.round(height * 0.72 * 10) / 10

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <svg width={height} height={height} viewBox="0 0 26 26" fill="none"
        style={{ display: 'block', flexShrink: 0 }} aria-hidden="true">
        <rect width="26" height="26" rx="7" fill={RED} />
        <path d="M18.5 10.2a1.6 1.6 0 0 0-1.12-1.12C16.4 8.8 13 8.8 13 8.8s-3.4 0-4.38.3A1.6 1.6 0 0 0 7.5 10.2 17 17 0 0 0 7.2 13a17 17 0 0 0 .3 2.8 1.6 1.6 0 0 0 1.12 1.12C9.6 17.2 13 17.2 13 17.2s3.4 0 4.38-.3a1.6 1.6 0 0 0 1.12-1.12A17 17 0 0 0 18.8 13a17 17 0 0 0-.3-2.8z" fill="white" />
        <polygon points="11.2,16 16,13 11.2,10" fill={RED} />
      </svg>
      <span style={{
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontWeight: 600,
        fontSize,
        letterSpacing: '-0.3px',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        color: wordColor,
      }}>ytgrowth</span>
    </span>
  )
}
