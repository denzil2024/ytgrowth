/* True when the app is being served on the ChannelBrain host
   (channelbrain.online). ChannelBrain is the dashboard / OAuth-client brand;
   ytgrowth.io is the content brand. The same bundle serves both domains, so
   brand-facing UI keys off this. SSR/prerender-safe (guards `window`). */
export function isChannelBrain() {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname.toLowerCase()
  return h === 'channelbrain.online' || h.endsWith('.channelbrain.online')
}

/* Support address. One real, always-routing inbox on every host (user
   decision 2026-07-17): no ytgrowth.io email anywhere, and
   support@channelbrain.online never had routing set up, so both hosts show
   the monitored Gmail. */
export function supportEmail() {
  return 'royalbluemedia.agency@gmail.com'
}

/* Brand name for prose (legal pages etc.), host-matched so a Google
   reviewer rendering channelbrain.online never sees "YTGrowth" in the
   hydrated page text. */
export function brandName() {
  return isChannelBrain() ? 'ChannelBrain' : 'YTGrowth'
}
