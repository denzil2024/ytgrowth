import { useEffect, useState } from 'react'
import { initPaddleRetain } from '../checkout'

export default function UsageBar({ channelId, email, dark = false }) {
  const [usage, setUsage] = useState(null)

  useEffect(() => {
    fetch('/billing/usage', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        setUsage(d)
        if (d.paddle_customer_id) initPaddleRetain(d.paddle_customer_id)
      })
      .catch(() => {})
  }, [])

  if (!usage) return null

  const pct       = usage.usage_pct ?? 0
  const atLimit   = pct >= 100
  const nearLimit = pct >= 80 && !atLimit
  const hasPack   = usage.pack_balance > 0
  const showCTA   = (nearLimit || atLimit) && !hasPack

  const barColor  = atLimit ? '#e5251b' : nearLimit ? '#d97706' : '#22c55e'
  const textMuted = dark ? 'rgba(255,255,255,0.45)' : '#9595a4'
  const trackBg   = dark ? 'rgba(255,255,255,0.10)' : '#eeeef3'

  return (
    <div>
      {/* Label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: textMuted, letterSpacing: '0.03em' }}>
          AI analyses
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: atLimit ? '#e5251b' : dark ? '#fff' : '#4a4a58' }}>
          {usage.monthly_used}<span style={{ fontWeight: 400, color: textMuted }}>/{usage.monthly_allowance}</span>
        </span>
      </div>

      {/* Bar */}
      <div style={{ background: trackBg, borderRadius: 99, height: 4, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{
          width: `${Math.min(pct, 100)}%`,
          height: '100%',
          background: barColor,
          borderRadius: 99,
          transition: 'width 0.8s ease',
        }} />
      </div>

      {/* Pack balance */}
      {hasPack && (
        <p style={{ fontSize: 11, color: textMuted, marginBottom: showCTA ? 8 : 0 }}>
          +{usage.pack_balance} pack analyses available
        </p>
      )}

      {/* Warning + CTAs — only when near/at limit with no pack */}
      {showCTA && (
        <div>
          <p style={{ fontSize: 11.5, fontWeight: 500, color: atLimit ? '#e5251b' : '#d97706', marginBottom: 10 }}>
            {atLimit ? 'Monthly limit reached' : 'Running low on analyses'}
          </p>
          <div style={{ display: 'flex', gap: 7 }}>
            <button
              onClick={() => window.location.href = '/?tab=monthly'}
              style={{
                flex: 1, fontSize: 12, fontWeight: 600,
                padding: '7px 0', borderRadius: 8,
                cursor: 'pointer', border: 'none',
                background: '#e5251b', color: '#fff',
                fontFamily: 'inherit',
                transition: 'filter 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
            >
              Upgrade
            </button>
            <button
              onClick={() => window.location.href = '/?tab=packs'}
              style={{
                flex: 1, fontSize: 12, fontWeight: 600,
                padding: '7px 0', borderRadius: 8,
                cursor: 'pointer',
                background: 'transparent',
                border: '1px solid #e6e6ec',
                color: dark ? 'rgba(255,255,255,0.7)' : '#4a4a58',
                fontFamily: 'inherit',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f4f4f8'; e.currentTarget.style.borderColor = '#d0d0d8' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e6e6ec' }}
            >
              + Pack
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
