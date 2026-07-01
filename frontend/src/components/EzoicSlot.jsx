import { useEffect } from 'react'

/* Ezoic standalone ad slot.
 *
 * Renders an empty placeholder div. When the Ezoic runtime is present (only in
 * EZOIC_ENABLED builds, i.e. AFTER the Ezoic account is approved and
 * scripts/inject-ezoic.js has injected sa.min.js), it fills the slot with an ad.
 * Until then it is an empty div: no ad, no network, no layout shift, no
 * PageSpeed cost. Safe to ship now so the pages are ad-ready the day Ezoic goes
 * live.
 *
 * `id` must match an Ad Position created in the Ezoic dashboard. The IDs used on
 * the earnings pages (101/102/103) are provisional placeholders to reconcile
 * with the dashboard once the account is approved. See
 * [[project_traffic_monetization_plan]].
 */
export default function EzoicSlot({ id }) {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ezstandalone) return
    try {
      window.ezstandalone.cmd = window.ezstandalone.cmd || []
      window.ezstandalone.cmd.push(() => window.ezstandalone.showAds(id))
    } catch { /* Ezoic not ready; slot stays empty */ }
    return () => {
      try {
        if (window.ezstandalone && window.ezstandalone.destroyPlaceholders) {
          window.ezstandalone.cmd.push(() => window.ezstandalone.destroyPlaceholders(id))
        }
      } catch { /* no-op */ }
    }
  }, [id])

  return (
    <div className="yte-section-pad" style={{ padding: '0 48px', display: 'flex', justifyContent: 'center' }}>
      <div id={`ezoic-pub-ad-placeholder-${id}`} style={{ width: '100%', maxWidth: 920 }} />
    </div>
  )
}
