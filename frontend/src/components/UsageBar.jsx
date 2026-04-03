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

  const pct          = usage.usage_pct ?? 0
  const atLimit      = pct >= 100
  const nearLimit    = pct >= 80 && !atLimit
  const hasPack      = usage.pack_balance > 0
  const user         = { email, channel_id: channelId }

  const textColor    = dark ? 'rgba(255,255,255,0.55)' : '#71717a'
  const labelColor   = dark ? 'rgba(255,255,255,0.85)' : '#111114'
  const trackBg      = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const barColor     = atLimit ? '#e5251b' : nearLimit ? '#d97706' : '#16a34a'
  const warnBg       = dark ? 'rgba(217,119,6,0.15)' : '#fffbeb'
  const warnBorder   = dark ? 'rgba(217,119,6,0.3)'  : '#fde68a'
  const blockBg      = dark ? 'rgba(229,37,27,0.15)' : '#fff5f5'
  const blockBorder  = dark ? 'rgba(229,37,27,0.3)'  : '#fecaca'

  return (
    <div style={{ padding: '0 2px' }}>
      {/* Bar + label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 500, color: textColor, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
          AI Analyses
        </span>
        <span style={{ fontSize: 10.5, fontWeight: 600, color: atLimit ? '#e5251b' : nearLimit ? '#d97706' : textColor }}>
          {pct}% used
        </span>
      </div>
      <div style={{ background: trackBg, borderRadius: 100, height: 4, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{
          width: `${Math.min(pct, 100)}%`, height: '100%',
          background: barColor, borderRadius: 100,
          transition: 'width 0.8s ease',
        }} />
      </div>

      {/* Pack balance */}
      {hasPack && (
        <p style={{ fontSize: 10, color: textColor, marginBottom: nearLimit || atLimit ? 8 : 0 }}>
          +{usage.pack_balance} bonus analyses available
        </p>
      )}

      {/* Near limit warning */}
      {nearLimit && (
        <div style={{ background: warnBg, border: `1px solid ${warnBorder}`, borderRadius: 8, padding: '8px 10px', marginTop: 6 }}>
          <p style={{ fontSize: 11, color: '#92400e', fontWeight: 600, marginBottom: 6 }}>
            Running low on analyses
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => openCheckout('pack_power', user)} style={btnStyle('#d97706')}>Top Up</button>
            <button onClick={() => openCheckout('growth_monthly', user)} style={btnStyle('#2563eb')}>Upgrade</button>
          </div>
        </div>
      )}

      {/* At limit */}
      {atLimit && (
        <div style={{ background: blockBg, border: `1px solid ${blockBorder}`, borderRadius: 8, padding: '8px 10px', marginTop: 6 }}>
          <p style={{ fontSize: 11, color: '#991b1b', fontWeight: 600, marginBottom: 6 }}>
            {hasPack ? 'Monthly analyses used — drawing from your pack' : 'All analyses used for this month'}
          </p>
          {!hasPack && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => openCheckout('pack_power', user)} style={btnStyle('#e5251b')}>Top Up</button>
              <button onClick={() => openCheckout('growth_monthly', user)} style={btnStyle('#2563eb')}>Upgrade</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function btnStyle(color) {
  return {
    fontSize: 11, fontWeight: 700, padding: '4px 10px',
    borderRadius: 6, border: 'none', cursor: 'pointer',
    background: color, color: '#fff',
  }
}
