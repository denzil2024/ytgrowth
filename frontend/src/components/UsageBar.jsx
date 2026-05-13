import { useEffect, useState } from 'react'
import { initPaddleRetain } from '../checkout'

/* Compact sidebar usage widget — shows what's LEFT (not used) so a fresh
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
  const usedPct      = allowance > 0 ? (used / allowance) * 100 : 0

  const atLimit   = remaining === 0
  const nearLimit = !atLimit && (remaining / Math.max(1, allowance)) <= 0.2
  const hasPack   = (usage.pack_balance ?? 0) > 0
  const showCTA   = (nearLimit || atLimit) && !hasPack

  // Canonical palette — matches Dashboard C tokens. Bar fills from left as
  // credits get USED, in a state color: neutral when plenty left, amber
  // when near limit, red at zero. No giant numbers, no green banner.
  const C = {
    red:    '#e5251b',
    amber:  '#d97706',
    text1:  dark ? '#ffffff' : '#0f0f13',
    text2:  dark ? 'rgba(255,255,255,0.62)' : '#4a4a58',
    text3:  dark ? 'rgba(255,255,255,0.45)' : '#9595a4',
    track:  dark ? 'rgba(255,255,255,0.10)' : '#eaeaef',
  }
  const fillClr = atLimit ? C.red : nearLimit ? C.amber : 'rgba(15,15,19,0.30)'
  const valueClr = atLimit ? C.red : nearLimit ? C.amber : C.text1

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Single tight line: label + value */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 8,
      }}>
        <span style={{
          fontSize: 12, fontWeight: 500, color: C.text3,
          letterSpacing: '-0.01em',
        }}>
          Credits
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'baseline', gap: 3,
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span style={{
            fontSize: 13, fontWeight: 700, color: valueClr,
            letterSpacing: '-0.01em',
          }}>
            {remaining}
          </span>
          <span style={{
            fontSize: 11.5, fontWeight: 500, color: C.text3,
          }}>
            / {allowance}
          </span>
        </span>
      </div>

      {/* Thin neutral bar — fills with USED credits from the left in a
          state color. Solid fill, no glow, no shimmer. */}
      <div style={{
        background: C.track, borderRadius: 99, height: 4,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${Math.max(2, usedPct)}%`,
          height: '100%',
          background: fillClr,
          borderRadius: 99,
          transition: 'width 0.6s ease, background 0.2s',
        }}/>
      </div>

      {/* Bottom line — refill date + optional pack chip */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8, marginTop: 1,
      }}>
        <span style={{
          fontSize: 11, color: C.text3, fontWeight: 500,
          letterSpacing: '-0.01em',
        }}>
          {refillLabel(usage.reset_date)}
        </span>
        {hasPack && (
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: C.text2,
            background: 'rgba(15,15,19,0.05)',
            padding: '1px 7px', borderRadius: 99,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
          }}>
            +{usage.pack_balance} pack
          </span>
        )}
      </div>

      {/* Upgrade CTA — only when near/at limit with no pack. Same scale as
          the rest of the sidebar bottom, not a banner. */}
      {showCTA && (
        <button
          onClick={() => window.location.href = '/?tab=monthly'}
          style={{
            marginTop: 4,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 8,
            cursor: 'pointer', border: 'none',
            background: C.red, color: '#fff',
            fontFamily: 'inherit',
            fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
            boxShadow: '0 1px 2px rgba(229,37,27,0.30)',
            transition: 'filter 0.14s, transform 0.14s',
          }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          Upgrade for more credits
        </button>
      )}
    </div>
  )
}
