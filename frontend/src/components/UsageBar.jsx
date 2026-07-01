import { useEffect, useState } from 'react'
import { initPaddleRetain } from '../checkout'

/* Compact sidebar usage widget, shows what's LEFT (not used) so a fresh
   account with 3/3 reads as alive instead of dead-space. Number scales
   with state (green remaining, amber near-limit, red at zero) and sits
   above a remaining-bar + refill-in countdown. Upgrade/Pack CTAs appear
   only when near/at limit with no pack fallback. */

function daysUntil(iso) {
  if (!iso) return null
  try {
    const diff = new Date(iso).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / 86400000))
  } catch { return null }
}

function refillLabel(iso) {
  const d = daysUntil(iso)
  if (d == null) return ''
  if (d === 0) return 'Refills today'
  if (d === 1) return 'Refills tomorrow'
  return `Refills in ${d} day${d === 1 ? '' : 's'}`
}

export default function UsageBar({ channelId, email, dark = false, onPlan, onUsage }) {
  const [usage, setUsage] = useState(null)

  useEffect(() => {
    let active = true
    const load = () => {
      fetch('/billing/usage', { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (!active || !d) return
          setUsage(d)
          if (d.paddle_customer_id) initPaddleRetain(d.paddle_customer_id)
          if (onPlan && d.plan) onPlan(d.plan)
          if (onUsage) onUsage(d.usage_pct ?? 0)
        })
        .catch(() => {})
    }
    load()
    const refresh = () => load()
    window.addEventListener('ytg:credits-changed', refresh)
    return () => { active = false; window.removeEventListener('ytg:credits-changed', refresh) }
  }, [])

  if (!usage) return null

  const allowance    = usage.monthly_allowance ?? 0
  const used         = usage.monthly_used ?? 0
  const remaining    = Math.max(0, allowance - used)
  const remainingPct = allowance > 0 ? (remaining / allowance) * 100 : 0

  const atLimit   = remaining === 0
  const nearLimit = !atLimit && remainingPct <= 20
  const hasPack   = (usage.pack_balance ?? 0) > 0
  const showCTA   = (nearLimit || atLimit) && !hasPack

  // Free plan is a 5-credit lifetime trial (no monthly refill), so the
  // "Refills in N days" countdown is wrong for it, reset_date is NULL.
  // Show trial-appropriate copy instead. Paid keeps the refill countdown.
  const isFreePlan = (usage.plan || 'free') === 'free'
  const refillText = isFreePlan
    ? (atLimit ? 'Trial used up, upgrade for more' : 'Free trial · no monthly refill')
    : refillLabel(usage.reset_date)

  // Canonical palette, matches Dashboard C tokens.
  const C = {
    red:    '#c0392b',   // danger: genuine out-of-credits state
    redHi:  '#c0392b',
    gold:   '#c9a030',
    goldInk: dark ? '#e2b84a' : '#7a5b14',
    amber:  '#b07d1a',
    green:  '#2d7a4f',
    text1:  'var(--yd-ink)',
    text2:  'var(--yd-soft)',
    text3:  'var(--yd-muted)',
    track:  'var(--yd-line)',
  }

  // State colour: green healthy, amber as it drains, red when critical.
  // Threshold aligned with nearLimit (20%) so colour and CTA agree.
  const stateColor = remainingPct > 50 ? C.green : remainingPct > 20 ? C.amber : C.red

  const PackChip = hasPack ? (
    <span style={{
      fontSize: 10, fontWeight: 700, color: C.green,
      background: dark ? 'rgba(5,150,105,0.18)' : '#ecfdf5',
      border: `1px solid ${dark ? 'rgba(5,150,105,0.3)' : '#a7f3d0'}`,
      padding: '1px 7px', borderRadius: 99,
      fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em',
      flexShrink: 0,
    }}>
      +{usage.pack_balance} pack
    </span>
  ) : null

  // Quiet, always-present upgrade path for free users, so the nudge exists
  // before they ever hit the limit (alert mode only fires near/at zero).
  // A text link, not a button: brand red (red is for CTAs), no chrome.
  const UpgradeLink = isFreePlan ? (
    <button
      onClick={() => window.location.href = '/?tab=monthly'}
      style={{
        fontSize: 10.5, fontWeight: 700, color: C.goldInk,
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        fontFamily: 'inherit', letterSpacing: '0.01em', flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', gap: 3,
        transition: 'filter 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)' }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
    >
      Upgrade
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
      </svg>
    </button>
  ) : null

  /* ── Quiet mode (default). No card chrome, a borderless slim strip so
        it recedes into the footer instead of stacking as a second box
        next to the What's-new card. ──────────────────────────────────── */
  if (!showCTA) {
    return (
      <div style={{ padding: '1px 2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 7 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: C.text3,
            letterSpacing: '0.10em', textTransform: 'uppercase',
          }}>
            AI analyses
          </span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: stateColor }}>{remaining}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: C.text3 }}> / {allowance}</span>
          </span>
        </div>
        <div style={{ height: 4, background: C.track, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            width: `${remainingPct}%`, height: '100%',
            background: stateColor, borderRadius: 99,
            transition: 'width 0.6s ease, background 0.2s',
          }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 6 }}>
          <span style={{ fontSize: 10.5, color: C.text3, fontWeight: 500 }}>
            {refillText}
          </span>
          {isFreePlan ? UpgradeLink : PackChip}
        </div>
      </div>
    )
  }

  /* ── Alert mode. Only when near/at limit with no pack fallback, i.e.
        exactly when the space and the CTA are earned. A soft tinted card
        (amber draining, red empty) that draws the eye, with the
        shout removed: no glow drop-shadow on Upgrade. ─────────────────── */
  const alertBg  = atLimit ? 'rgba(192,57,43,0.05)'  : 'rgba(217,119,6,0.06)'
  const alertBdr = atLimit ? 'rgba(192,57,43,0.18)'  : 'rgba(217,119,6,0.20)'

  return (
    <div style={{
      background: dark ? 'rgba(255,255,255,0.04)' : alertBg,
      border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : alertBdr}`,
      borderRadius: 0,
      padding: '10px 12px 11px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: stateColor, flexShrink: 0 }} />
          <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
            AI analyses
          </p>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 3, fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ fontSize: 19, fontWeight: 800, color: stateColor, letterSpacing: '-0.5px', lineHeight: 1 }}>
            {remaining}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.text3 }}>/ {allowance}</span>
        </span>
      </div>

      <div style={{ background: C.track, borderRadius: 99, height: 5, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{
          width: `${remainingPct}%`, height: '100%',
          background: stateColor, borderRadius: 99,
          transition: 'width 0.8s ease, background 0.2s',
        }} />
      </div>

      <div style={{ fontSize: 10.5, color: C.text3, fontWeight: 500 }}>
        {refillText}
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <button
          onClick={() => window.location.href = '/?tab=monthly'}
          style={{
            flex: 1, fontSize: 13, fontWeight: 700,
            padding: '8px 0', borderRadius: 0,
            cursor: 'pointer', border: 'none',
            fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em',
            background: 'var(--yd-gold)',
            color: 'var(--yd-on-gold)',
            boxShadow: 'none',
            transition: 'filter 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.06)' }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
        >
          Upgrade
        </button>
        <button
          onClick={() => window.location.href = '/?tab=packs'}
          style={{
            flex: 1, fontSize: 12, fontWeight: 600,
            padding: '7px 0', borderRadius: 0,
            cursor: 'pointer',
            background: dark ? 'transparent' : '#ffffff',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.18)' : '#e6e6ec'}`,
            color: C.text2, fontFamily: 'inherit',
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.06)' : '#f7f7fa'; e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.28)' : '#d6d6de' }}
          onMouseLeave={e => { e.currentTarget.style.background = dark ? 'transparent' : '#ffffff'; e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.18)' : '#e6e6ec' }}
        >
          + Pack
        </button>
      </div>
    </div>
  )
}
