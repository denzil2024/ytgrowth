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
    fetch('/billing/usage', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        setUsage(d)
        if (d.paddle_customer_id) initPaddleRetain(d.paddle_customer_id)
        if (onPlan && d.plan) onPlan(d.plan)
        if (onUsage) onUsage(d.usage_pct ?? 0)
      })
      .catch(() => {})
  }, [])

  if (!usage) return null

  const allowance = usage.monthly_allowance ?? 0
  const used      = usage.monthly_used ?? 0
  const remaining = Math.max(0, allowance - used)
  const remainingPct = allowance > 0 ? (remaining / allowance) * 100 : 0

  const atLimit     = remaining === 0
  const nearLimit   = !atLimit && remainingPct <= 20
  const hasPack     = (usage.pack_balance ?? 0) > 0
  const showCTA     = (nearLimit || atLimit) && !hasPack

  // Canonical palette — matches Dashboard C tokens.
  const C = {
    red:   '#e5251b',
    amber: '#d97706',
    green: '#059669',
    text1: dark ? '#ffffff' : '#0f0f13',
    text2: dark ? 'rgba(255,255,255,0.62)' : '#4a4a58',
    text3: dark ? 'rgba(255,255,255,0.45)' : '#9595a4',
    track: dark ? 'rgba(255,255,255,0.10)' : '#eeeef3',
  }

  const accent = atLimit ? C.red : nearLimit ? C.amber : C.green

  return (
    <div>
      {/* Eyebrow */}
      <p style={{
        fontSize: 10.5, fontWeight: 700, color: C.text3,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        marginBottom: 6,
      }}>
        AI analyses
      </p>

      {/* Main row — big "N" + "of M left" */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
        <span style={{
          fontSize: 24, fontWeight: 800, color: accent,
          letterSpacing: '-0.8px', lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {remaining}
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 500, color: C.text2 }}>
          of {allowance} left
        </span>
      </div>

      {/* Remaining bar — fills from left with the accent color. Empties as
          the user burns through. At zero the track alone is visible. */}
      <div style={{
        background: C.track, borderRadius: 99, height: 5,
        overflow: 'hidden', marginBottom: 8,
      }}>
        <div style={{
          width: `${remainingPct}%`,
          height: '100%',
          background: accent,
          borderRadius: 99,
          transition: 'width 0.8s ease, background 0.2s',
        }} />
      </div>

      {/* Refill countdown + pack line */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: C.text3, fontWeight: 500 }}>
          {refillLabel(usage.reset_date)}
        </span>
        {hasPack && (
          <span style={{ fontSize: 11, color: C.green, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            +{usage.pack_balance} pack
          </span>
        )}
      </div>

      {/* CTAs — only when near/at limit with no pack */}
      {showCTA && (
        <div style={{ display: 'flex', gap: 7, marginTop: 12 }}>
          <button
            onClick={() => window.location.href = '/?tab=monthly'}
            style={{
              flex: 1, fontSize: 12, fontWeight: 700,
              padding: '7px 0', borderRadius: 100,
              cursor: 'pointer', border: 'none',
              background: C.red, color: '#fff',
              fontFamily: 'inherit',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32)',
              transition: 'filter 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Upgrade
          </button>
          <button
            onClick={() => window.location.href = '/?tab=packs'}
            style={{
              flex: 1, fontSize: 12, fontWeight: 600,
              padding: '7px 0', borderRadius: 100,
              cursor: 'pointer',
              background: 'transparent',
              border: '1px solid #e6e6ec',
              color: C.text2,
              fontFamily: 'inherit',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f4f4f8'; e.currentTarget.style.borderColor = '#d0d0d8' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e6e6ec' }}
          >
            + Pack
          </button>
        </div>
      )}
    </div>
  )
}
