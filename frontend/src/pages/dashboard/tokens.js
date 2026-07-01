/* ─── Design tokens for the Dashboard surface ──────────────────────────────
   Pure data only. No JSX, no React, no hooks. Anything imported here must
   itself be pure data, keep this file leaf-level so it can be consumed by
   every other dashboard/* module without import cycles. */

/* Editorial (Zennara) fonts. Cormorant for display + big numbers, Barlow
   Condensed for labels/nav/buttons, Barlow for body. Shared so components
   can reference the exact families instead of hardcoding font strings. */
export const F = {
  serif: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
  cond:  "'Barlow Condensed', system-ui, sans-serif",
  sans:  "'Barlow', system-ui, -apple-system, sans-serif",
}

/* Themed palette. Every value is a CSS variable (defined in styles.js) so a
   light/dark toggle is one attribute flip (`data-theme="dark"` on <html>),
   not a second set of components. Default theme is LIGHT (warm paper),
   matching the marketing site.

   Editorial translation: the brand accent is GOLD (was red). `red` keeps its
   key name so every existing consumer switches to gold automatically; true
   error/delete states use `danger`. Green stays for positive/healthy. Gold
   text uses the darker `goldInk` (readable on white); gold FILLS use `gold`
   with ink text (var(--yd-on-gold)). */
export const C = {
  red:      'var(--yd-gold)',       // accent (GOLD) — key kept for free remap
  redBg:    'var(--yd-gold-soft)',
  redBdr:   'var(--yd-gold-line)',
  gold:     'var(--yd-gold)',
  goldL:    'var(--yd-gold)',
  goldInk:  'var(--yd-gold-ink)',   // darker gold, readable as text
  onGold:   'var(--yd-on-gold)',    // ink text on a gold fill
  danger:   'var(--yd-danger)',     // reserved: true errors / delete confirm
  green:    'var(--yd-green)',
  greenBg:  'var(--yd-green-soft)',
  greenBdr: 'var(--yd-green-line)',
  greenInk: 'var(--yd-green-ink)',
  amber:    'var(--yd-amber)',
  amberBg:  'var(--yd-amber-soft)',
  amberBdr: 'var(--yd-amber-line)',
  text1:    'var(--yd-ink)',
  text2:    'var(--yd-soft)',
  text3:    'var(--yd-muted)',
  border:   'var(--yd-line)',
  bg:       'var(--yd-paper)',
  surface:  'var(--yd-surface)',
  serif:    F.serif,
  cond:     F.cond,
  sans:     F.sans,
}

/* SHELL: dark palette for the app shell only (sidebar + its nav / footer
   sub-components). Pages stay on the light `C` palette. These tokens
   mirror the ChatCoach dark surface that's already shipped, so the rail
   and the Chat page read as one system. Every consumer of SHELL is
   shell-only and never renders on a light page. */
/* SHELL: the app shell + pages palette. Same themed CSS variables as C, so
   the whole app (rail + pages) flips together with the light/dark toggle.
   Default LIGHT (warm paper), matching the marketing site. Sharp + flat: no
   gradients, no soft shadows, hairline borders. Accent GOLD (`red` key kept);
   green stays for positive; `danger` reserved for true errors. */
export const SHELL = {
  bg:        'var(--yd-paper)',         // aside + page background
  surface:   'var(--yd-surface)',       // raised surface
  cardBg:    'var(--yd-surface)',       // card background (flat)
  cardFlat:  'var(--yd-surface)',       // flat inner blocks / chips
  cardShadow:'none',
  cardShadowLift: 'none',
  popShadow: '0 16px 44px rgba(20,19,15,0.14)',
  hair:      'var(--yd-line)',          // borders + dividers (sharp hairline)
  hairLo:    'var(--yd-line-lo)',
  text1:     'var(--yd-ink)',
  text2:     'var(--yd-soft)',
  text3:     'var(--yd-muted)',
  iconIdle:  'var(--yd-muted)',         // idle nav icons / carets / sub-dots
  // Quiet selection grammar: hover = faint wash, active = stronger wash.
  // Gold stays an ACCENT (left stripe + icon), never a background wash.
  hoverBg:   'var(--yd-wash)',
  activeBg:  'var(--yd-wash2)',
  track:     'var(--yd-line)',          // health-bar track
  red:       'var(--yd-gold)',          // accent (GOLD) — key kept
  gold:      'var(--yd-gold)',
  goldL:     'var(--yd-gold)',
  goldInk:   'var(--yd-gold-ink)',      // brighter/darker gold text per theme
  onGold:    'var(--yd-on-gold)',       // ink text on a gold fill
  green:     'var(--yd-green)',
  greenInk:  'var(--yd-green-ink)',
  danger:    'var(--yd-danger)',        // true error / delete
  serif:     "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
  cond:      "'Barlow Condensed', system-ui, sans-serif",
  sans:      "'Barlow', system-ui, -apple-system, sans-serif",
}

/* Milestone tier thresholds per category. */
export const MILESTONE_TIERS = {
  subs:        [100, 500, 1000, 5000, 10000, 50000, 100000, 1000000],
  views:       [10000, 50000, 100000, 1000000, 10000000],
  watch_hours: [100, 1000, 4000, 10000, 100000],
  uploads:     [1, 10, 50, 100],
}

export const MILESTONE_PLURAL = {
  subs:        'subscribers',
  views:       'total views',
  watch_hours: 'watch hours',
  uploads:     'videos',
}

export const MILESTONE_TITLE = {
  subs:        'Subscribers',
  views:       'Total Views',
  watch_hours: 'Watch Hours',
}

export const MILESTONE_VERB = {
  subs:        'subscribers',
  views:       'total views',
  watch_hours: 'watch hours',
}

/* Vivid metallic tier palette, radial gradients give true 3D metallic sheen. */
export const METAL = {
  bronze:   { highlight: '#ffcfa0', mid: '#e28a3f', deep: '#8b4a13', shadow: '#5c2e08', ribbon: '#6b3712', ink: '#6b3712' },
  silver:   { highlight: '#ffffff', mid: '#c8ccd1', deep: '#6d7378', shadow: '#3a4046', ribbon: '#4a5056', ink: '#3a4046' },
  gold:     { highlight: '#fff2a8', mid: '#f1c61f', deep: '#a07500', shadow: '#5a4100', ribbon: '#7a5700', ink: '#5a4100' },
  platinum: { highlight: '#f8fafc', mid: '#a8b2c4', deep: '#4b5563', shadow: '#252d38', ribbon: '#374151', ink: '#252d38' },
}

/* Each category has its own vivid gradient so badges are visually distinct
   at a glance. */
/* Editorial-safe category tones: medal metals (gold / silver / bronze) plus
   green. No brand red, no blue. Each category still reads distinct. */
export const CATEGORY_GRADIENT = {
  subs:        { h1: '#ffe08a', h2: '#c9a030', h3: '#7a5b14', stroke: '#5a4100', ink: '#5a4100' },
  views:       { h1: '#dedad0', h2: '#9a948a', h3: '#4a4843', stroke: '#2a2824', ink: '#2a2824' },
  watch_hours: { h1: '#ffcf8a', h2: '#b07d1a', h3: '#6a4a0e', stroke: '#4a3400', ink: '#4a3400' },
  uploads:     { h1: '#6ee7b7', h2: '#2d7a4f', h3: '#1d5235', stroke: '#022c1e', ink: '#022c1e' },
}

/* Confetti palette for the milestone celebration modal. */
export const CONFETTI_COLORS = ['#ff3b30', '#ffd60a', '#30d158', '#0a84ff', '#bf5af2', '#ff9f0a', '#ff2d92', '#64d2ff', '#ffffff']

/* Severity palette, 3-color system: red critical, amber warnings, slate minor */
export const SEV = {
  critical: { color: '#dc2626', bg: '#fff5f5', bdr: '#fecaca' },
  high:     { color: '#f0a23b', bg: '#fffbeb', bdr: '#fde68a' },
  medium:   { color: '#f0a23b', bg: '#fffbeb', bdr: '#fde68a' },
  low:      { color: '#6b7280', bg: '#f9fafb', bdr: '#e5e7eb' },
  info:     { color: '#34d27b', bg: '#ecfdf5', bdr: '#a7f3d0' },
}

/* Day labels for the Best Time to Publish card. */
export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DAYS_LONG  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/* Sidebar icon + geometry constants. The icon column is the visual spine
   of the sidebar; sub-items align their leading dot to it so the nav
   reads as a single column of items, not a ragged stack. */
export const ICON_SIZE   = 18
export const ICON_STROKE = 1.75
export const NAV_ICON_COL = 18     // matches ICON_SIZE
export const NAV_GUTTER   = 12     // outer horizontal gutter
export const NAV_PAD_X    = 12     // inner left padding inside the button
export const SUB_INDENT   = NAV_PAD_X + NAV_ICON_COL + 12  // 42, lines up with icon-text gap
