import { useEffect, useState } from 'react'
import { openCheckout } from '../checkout'

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

  const textMuted = dark ? 'rgba(255,255,255,0.45)' : '#9ca3af'
  const trackBg   = dark ? 'rgba(255,255,255,0.10)' : '#e9eaec'

  return (
    <div>
      {/* Label row — count always red */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
          AI Analyses
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#e5251b', fontVariantNumeric: 'tabular-nums' }}>
          {usage.monthly_used} / {usage.monthly_allowance}
        </span>
      </div>

      {/* Bar — always red */}
      <div style={{ background: trackBg, borderRadius: 6, height: 5, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{
          width: `${Math.min(pct, 100)}%`, height: '100%',
          background: '#e5251b', borderRadius: 6,
          transition: 'width 0.8s ease',
        }} />
      </div>

      {/* Pack balance */}
      {hasPack && (
        <p style={{ fontSize: 11, color: textMuted, marginBottom: nearLimit || atLimit ? 8 : 0 }}>
          +{usage.pack_balance} bonus analyses
        </p>
      )}

      {/* Warning */}
      {(nearLimit || atLimit) && (
        <div style={{ marginTop: 8 }}>
          <p style={{ fontSize: 11.5, fontWeight: 500, color: '#e5251b', marginBottom: 9 }}>
            {atLimit
              ? hasPack ? 'Monthly limit reached — using pack' : 'Monthly analyses used up'
              : 'Running low on analyses'}
          </p>
          {(!atLimit || !hasPack) && (
            <div style={{ display: 'flex', gap: 7 }}>
              <button onClick={() => openCheckout('pack_60')} style={topUpStyle}>Top Up</button>
              <button onClick={() => openCheckout('growth_monthly')} style={upgradeStyle}>Upgrade</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const base = {
  flex: 1, fontSize: 11.5, fontWeight: 600, padding: '7px 0',
  borderRadius: 8, cursor: 'pointer',
  fontFamily: "'DM Sans','Inter',sans-serif",
  border: 'none',
}

const topUpStyle = {
  ...base,
  background: '#111114',
  color: '#ffffff',
}

const upgradeStyle = {
  ...base,
  background: '#e5251b',
  color: '#ffffff',
}
