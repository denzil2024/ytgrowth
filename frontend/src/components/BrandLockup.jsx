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

export default function BrandLockup({ height = 24, tone = 'dark', gap = 9, boxed = false }) {
  // When boxed, the lockup sits inside a dark capsule (mirrors Windsor's
  // enclosed logo), so force the wordmark to white regardless of tone.
  const wordColor = boxed || tone === 'light' ? '#ffffff' : INK
  const fontSize = Math.round(height * 0.72 * 10) / 10

  const inner = (
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

  if (!boxed) return inner

  // Boxed = a branded red capsule sized to the nav pill: a white tile holding
  // the red play-mark (inverted so it reads on red), then the white wordmark.
  // Same shadow material as the CTA button so the header reads as one system.
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 9,
      height: 48, padding: '0 20px 0 7px',
      background: '#e5302a', borderRadius: 999,
      boxShadow: '0 1px 2px rgba(0,0,0,0.12), 0 5px 16px rgba(229,48,42,0.32), inset 0 1px 0 rgba(255,255,255,0.22)',
    }}>
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" style={{ display: 'block', flexShrink: 0 }} aria-hidden="true">
        <rect width="34" height="34" rx="9" fill="#ffffff" />
        <path d="M14 10.5 24.5 17 14 23.5z" fill="#e5302a" />
      </svg>
      <span style={{
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontWeight: 700, fontSize: 16.5, letterSpacing: '-0.3px',
        lineHeight: 1, color: '#ffffff', whiteSpace: 'nowrap',
      }}>ytgrowth</span>
    </span>
  )
}
