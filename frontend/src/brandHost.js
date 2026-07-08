/* True when the app is being served on the ChannelBrain host
   (channelbrain.online). ChannelBrain is the dashboard / OAuth-client brand;
   ytgrowth.io is the content brand. The same bundle serves both domains, so
   brand-facing UI keys off this. SSR/prerender-safe (guards `window`). */
export function isChannelBrain() {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname.toLowerCase()
  return h === 'channelbrain.online' || h.endsWith('.channelbrain.online')
}
