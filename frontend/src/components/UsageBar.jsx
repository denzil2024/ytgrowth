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
  const remainingPct = allowance > 0 ? (remaining / allowance) * 100 : 0

  const atLimit   = remaining === 0
  const nearLimit = !atLimit && remainingPct <= 20
  const hasPack   = (usage.pack_balance ?? 0) > 0
  const showCTA   = (nearLimit || atLimit) && !hasPack

  // Canonical palette — matches Dashboard C tokens.
  const C = {
    red:    '#e5251b',
    redDim: '#b91c1c',
    amber:  '#d97706',
    amberDim:'#b45309',
    green:  '#059669',
    greenDim:'#047857',
    text1:  dark ? '#ffffff' : '#0f0f13',
    text2:  dark ? 'rgba(255,255,255,0.62)' : '#4a4a58',
    text3:  dark ? 'rgba(255,255,255,0.45)' : '#9595a4',
    track:  dark ? 'rgba(255,255,255,0.10)' : '#eceef2',
    cardBg: dark ? 'rgba(255,255,255,0.04)' : '#ffffff',
    cardBdr:dark ? 'rgba(255,255,255,0.08)' : '#ececf0',
  }

  // Color logic: healthy is intentionally NEUTRAL so the UsageBar visually
  // complements the brand-red What's New card above it instead of fighting
  // it with a green-on-green stat block. State color is reserved for
  // amber (near limit) and red (at limit), so when those DO show up they
  // actually mean something.
  //   accent = the dot + the number + the bar "in case of" color
  //   numClr = the big "N" color (charcoal when healthy, state color otherwise)
  //   barFrom / barTo = the gradient stops for the remaining-bar fill
  const accent    = atLimit ? C.red    : nearLimit ? C.amber    : '#3a3a45'
  const accentDim = atLimit ? C.redDim : nearLimit ? C.amberDim : '#5a5a6a'
  const numClr    = atLimit ? C.red    : nearLimit ? C.amber    : C.text1
  const barFrom   = atLimit ? C.redDim : nearLimit ? C.amberDim : '#3a3a45'
  const barTo     = atLimit ? C.red    : nearLimit ? C.amber    : '#3a3a45'

  return (
    <div style={{
      background: C.cardBg,
      border: `1px solid ${C.cardBdr}`,
      borderRadius: 11,
      padding: '10px 12px 11px',
      boxShadow: dark ? 'inset 0 1px 0 rgba(255,255,255,0.04)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: accent,
            flexShrink: 0,
          }} />
          <p style={{
            fontSize: 11, fontWeight: 500, color: C.text2,
          }}>
            AI analyses
          </p>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 3, fontVariantNumeric: 'tabular-nums' }}>
          <span style={{
            fontSize: 18, fontWeight: 600, color: numClr,
            letterSpacing: '-0.3px', lineHeight: 1,
          }}>
            {remaining}
          </span>
          <span style={{ fontSize: 12, fontWeight: 500, color: C.text3 }}>
            / {allowance}
          </span>
          <span style={{ fontSize: 11, fontWeight: 500, color: C.text2, marginLeft: 3 }}>
            left
          </span>
        </span>
      </div>

      <div style={{
        background: C.track, borderRadius: 99, height: 4,
        overflow: 'hidden', marginBottom: 8,
        position: 'relative',
      }}>
        <div style={{
          width: `${remainingPct}%`,
          height: '100%',
          background: barFrom,
          borderRadius: 99,
          transition: 'width 0.8s ease, background 0.2s',
        }}/>
      </div>

      {/* Refill countdown + pack chip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.text3, fontWeight: 500 }}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.85 }}>
            <circle cx="6" cy="6" r="4.5"/><path d="M6 3.5v2.5l1.6 1"/>
          </svg>
          {refillLabel(usage.reset_date)}
        </span>
        {hasPack && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: C.green,
            background: dark ? 'rgba(5,150,105,0.18)' : '#ecfdf5',
            border: `1px solid ${dark ? 'rgba(5,150,105,0.3)' : '#a7f3d0'}`,
            padding: '1px 7px', borderRadius: 99,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em',
          }}>
            +{usage.pack_balance} pack
          </span>
        )}
      </div>

      {/* CTAs — only when near/at limit with no pack. Stay full-width so
          the urgency lands; reduced vertical padding only. */}
      {showCTA && (
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button
            onClick={() => window.location.href = '/?tab=monthly'}
            style={{
              flex: 1, fontSize: 12, fontWeight: 700,
              padding: '6px 0', borderRadius: 100,
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
              padding: '6px 0', borderRadius: 100,
              cursor: 'pointer',
              background: 'transparent',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.18)' : '#e6e6ec'}`,
              color: C.text2,
              fontFamily: 'inherit',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.06)' : '#f4f4f8'; e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.28)' : '#d0d0d8' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.18)' : '#e6e6ec' }}
          >
            + Pack
          </button>
        </div>
      )}
    </div>
  )
}
