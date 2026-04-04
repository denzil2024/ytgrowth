import { useEffect, useState } from 'react'
import { openCheckout } from '../paddle'

export default function UsageBar({ channelId, email, dark = false }) {
  const [usage, setUsage] = useState(null)

  useEffect(() => {
    fetch('/billing/usage', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setUsage(d))
      .catch(() => {})
  }, [])

  if (!usage) return null

  const pct       = usage.usage_pct ?? 0
  const atLimit   = pct >= 100
  const nearLimit = pct >= 80 && !atLimit
  const hasPack   = usage.pack_balance > 0
  const user      = { email, channel_id: channelId }

  const barColor  = atLimit ? '#e5251b' : nearLimit ? '#111114' : '#111114'
  const textMuted = dark ? 'rgba(255,255,255,0.45)' : '#9ca3af'
  const textMain  = dark ? 'rgba(255,255,255,0.85)' : '#111114'
  const trackBg   = dark ? 'rgba(255,255,255,0.10)' : '#e5e7eb'

  return (
    <div>
      {/* Label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
          AI Analyses
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: atLimit ? '#e5251b' : textMain, fontVariantNumeric: 'tabular-nums' }}>
          {usage.monthly_used} / {usage.monthly_allowance}
        </span>
      </div>

      {/* Bar */}
      <div style={{ background: trackBg, borderRadius: 6, height: 5, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{
          width: `${Math.min(pct, 100)}%`, height: '100%',
          background: barColor, borderRadius: 6,
          transition: 'width 0.8s ease',
        }} />
      </div>

      {/* Pack balance */}
      {hasPack && (
        <p style={{ fontSize: 11, color: textMuted, marginBottom: nearLimit || atLimit ? 8 : 0 }}>
          +{usage.pack_balance} bonus analyses
        </p>
      )}

      {/* Warning / limit — neutral, no color cocktail */}
      {(nearLimit || atLimit) && (
        <div style={{ marginTop: 4 }}>
          <p style={{ fontSize: 11.5, fontWeight: 500, color: atLimit ? '#e5251b' : textMain, marginBottom: 8 }}>
            {atLimit
              ? hasPack ? 'Monthly limit reached — using pack' : 'Monthly analyses used up'
              : 'Running low on analyses'}
          </p>
          {(!atLimit || !hasPack) && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => openCheckout('pack_power', user)} style={btnStyle('fill')}>Top Up</button>
              <button onClick={() => openCheckout('growth_monthly', user)} style={btnStyle('outline')}>Upgrade</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function btnStyle(variant) {
  const base = {
    flex: 1, fontSize: 11.5, fontWeight: 600, padding: '6px 0',
    borderRadius: 8, cursor: 'pointer', letterSpacing: '-0.1px',
    fontFamily: "'DM Sans','Inter',sans-serif",
    transition: 'opacity 0.15s',
  }
  if (variant === 'fill') {
    return { ...base, background: '#111114', color: '#ffffff', border: 'none' }
  }
  return { ...base, background: 'transparent', color: '#111114', border: '1px solid rgba(0,0,0,0.18)' }
}
