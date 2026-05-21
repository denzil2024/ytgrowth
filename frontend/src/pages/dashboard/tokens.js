/* ─── Design tokens for the Dashboard surface ──────────────────────────────
   Pure data only. No JSX, no React, no hooks. Anything imported here must
   itself be pure data — keep this file leaf-level so it can be consumed by
   every other dashboard/* module without import cycles. */

/* Light-page palette. Pages stay on this; only the app shell uses SHELL. */
export const C = {
  red:      '#e5251b',
  redBg:    '#fff5f5',
  redBdr:   '#fecaca',
  green:    '#059669',
  greenBg:  '#ecfdf5',
  greenBdr: '#a7f3d0',
  amber:    '#d97706',
  amberBg:  '#fffbeb',
  amberBdr: '#fde68a',
  text1:    '#0f0f13',
  text2:    '#4a4a58',
  text3:    '#9595a4',
  border:   '#e6e6ec',
  bg:       '#f5f5f9',
  surface:  '#ffffff',
}

/* SHELL: dark palette for the app shell only (sidebar + its nav / footer
   sub-components). Pages stay on the light `C` palette. These tokens
   mirror the ChatCoach dark surface that's already shipped, so the rail
   and the Chat page read as one system. Every consumer of SHELL is
   shell-only and never renders on a light page. */
export const SHELL = {
  bg:        '#0c0c0e',                 // aside background (= ChatCoach rail)
  surface:   '#18181b',                 // flat fallback (rarely used)
  // Raised surfaces (profile card, What's-new, channel-switcher popover)
  // use the SAME lit gradient + single soft shadow as every ChatCoach
  // dark surface, so the rail and the Chat page read as one system.
  cardBg:    'linear-gradient(180deg, #1e1e24 0%, #18181c 100%)',
  cardFlat:  '#1c1c21',                 // flat inner blocks / chips
  cardShadow:'0 1px 3px rgba(0,0,0,0.4)',
  cardShadowLift: '0 6px 20px rgba(0,0,0,0.55)',
  popShadow: '0 12px 32px rgba(0,0,0,0.6)',
  hair:      'rgba(255,255,255,0.08)',  // borders + dividers
  hairLo:    'rgba(255,255,255,0.06)',
  text1:     '#f4f4f5',
  text2:     '#cfd0d6',
  text3:     '#b2b3bb',
  iconIdle:  '#5b5b66',                 // idle nav icons / carets / sub-dots
  // Quiet selection grammar, identical to the shipped ChatCoach rail:
  // hover = faint white wash, active = slightly stronger white wash.
  // Brand red stays an ACCENT only (the left stripe + icon), never a
  // background wash, matches the "red is for CTAs, not toggles" rule.
  hoverBg:   'rgba(255,255,255,0.035)',
  activeBg:  'rgba(255,255,255,0.06)',
  track:     'rgba(255,255,255,0.10)',  // health-bar track (= UsageBar dark)
  red:       '#e5251b',
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

/* Vivid metallic tier palette — radial gradients give true 3D metallic sheen. */
export const METAL = {
  bronze:   { highlight: '#ffcfa0', mid: '#e28a3f', deep: '#8b4a13', shadow: '#5c2e08', ribbon: '#6b3712', ink: '#6b3712' },
  silver:   { highlight: '#ffffff', mid: '#c8ccd1', deep: '#6d7378', shadow: '#3a4046', ribbon: '#4a5056', ink: '#3a4046' },
  gold:     { highlight: '#fff2a8', mid: '#f1c61f', deep: '#a07500', shadow: '#5a4100', ribbon: '#7a5700', ink: '#5a4100' },
  platinum: { highlight: '#f8fafc', mid: '#a8b2c4', deep: '#4b5563', shadow: '#252d38', ribbon: '#374151', ink: '#252d38' },
}

/* Each category has its own vivid gradient so badges are visually distinct
   at a glance. */
export const CATEGORY_GRADIENT = {
  subs:        { h1: '#ff8a80', h2: '#e5251b', h3: '#7a0f08', stroke: '#4a0903', ink: '#4a0903' },
  views:       { h1: '#7fb3ff', h2: '#2563eb', h3: '#1e3a8a', stroke: '#172554', ink: '#172554' },
  watch_hours: { h1: '#ffe082', h2: '#eab308', h3: '#8a6400', stroke: '#4a3400', ink: '#4a3400' },
  uploads:     { h1: '#6ee7b7', h2: '#059669', h3: '#064e3b', stroke: '#022c1e', ink: '#022c1e' },
}

/* Confetti palette for the milestone celebration modal. */
export const CONFETTI_COLORS = ['#ff3b30', '#ffd60a', '#30d158', '#0a84ff', '#bf5af2', '#ff9f0a', '#ff2d92', '#64d2ff', '#ffffff']

/* Severity palette — 3-color system: red critical, amber warnings, slate minor */
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
