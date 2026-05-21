/* ─── Small shared UI primitives for the Dashboard ──────────────────────────
   Stateless, presentational components composed throughout the Feed and
   the Milestone surfaces. No data fetching, no app state, no callbacks
   that mutate parent state — every prop is a value the caller already has. */
import { C, SHELL } from './tokens'
import {
  scoreColor, scoreLabel,
  fmtNum,
  nextSubMilestone, nextViewMilestone,
} from './utils'

export function YTGLogo({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="#ff3b30"/>
      <path d="M23.2 11.6a2.1 2.1 0 0 0-1.48-1.48C20.55 9.8 16 9.8 16 9.8s-4.55 0-5.72.32A2.1 2.1 0 0 0 8.8 11.6 22 22 0 0 0 8.5 16a22 22 0 0 0 .3 4.4 2.1 2.1 0 0 0 1.48 1.48C11.45 22.2 16 22.2 16 22.2s4.55 0 5.72-.32a2.1 2.1 0 0 0 1.48-1.48A22 22 0 0 0 23.5 16a22 22 0 0 0-.3-4.4z" fill="white"/>
      <polygon points="13.5,19 19.5,16 13.5,13" fill="#ff3b30"/>
    </svg>
  )
}

/* ─── Logo (matches landing page) ──────────────────────────────────────── */
export function Logo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <rect width="26" height="26" rx="7" fill={C.red}/>
      <path d="M18.5 10.2a1.6 1.6 0 0 0-1.12-1.12C16.4 8.8 13 8.8 13 8.8s-3.4 0-4.38.3A1.6 1.6 0 0 0 7.5 10.2 17 17 0 0 0 7.2 13a17 17 0 0 0 .3 2.8 1.6 1.6 0 0 0 1.12 1.12C9.6 17.2 13 17.2 13 17.2s3.4 0 4.38-.3a1.6 1.6 0 0 0 1.12-1.12A17 17 0 0 0 18.8 13a17 17 0 0 0-.3-2.8z" fill="white"/>
      <polygon points="11.2,16 16,13 11.2,10" fill={C.red}/>
    </svg>
  )
}

/* ─── Score ring ────────────────────────────────────────────────────────── */
export function ScoreRing({ score }) {
  const r = 42, cx = 54, cy = 54
  const circ = 2 * Math.PI * r
  const dash  = (score / 100) * circ
  const col   = scoreColor(score)
  return (
    <svg width="108" height="108" viewBox="0 0 108 108">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ebebed" strokeWidth="7"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth="7"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fill={col}
        fontSize="24" fontWeight="700" fontFamily="Geist, Inter, sans-serif"
        style={{ fontVariantNumeric: 'tabular-nums' }}>{score}</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fill={C.text3}
        fontSize="10" fontFamily="Geist, Inter, sans-serif">{scoreLabel(score)}</text>
    </svg>
  )
}

/* ─── Mini bar sparkline ────────────────────────────────────────────────── */
export function MiniBar({ videos }) {
  if (!videos?.length) return null
  const items = [...videos].slice(0, 12).reverse()
  const max   = Math.max(...items.map(v => v.views), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
      {items.map((v, i) => (
        <div key={i} title={v.title} style={{
          flex: 1, minWidth: 4,
          background: C.red,
          opacity: 0.18 + 0.82 * (v.views / max),
          borderRadius: '3px 3px 0 0',
          height: `${Math.max(5, (v.views / max) * 100)}%`,
          transition: 'opacity 0.15s', cursor: 'default',
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity = 1 }}
          onMouseLeave={e => { e.currentTarget.style.opacity = 0.18 + 0.82 * (v.views / max) }}
        />
      ))}
    </div>
  )
}

/* ─── Stat card ─────────────────────────────────────────────────────────── */
export function Stat({ label, value, sub, alert, accent }) {
  const col = alert ? C.red : (accent || C.text1)
  return (
    <div className={`ytg-stat-card${alert ? ' alert' : ''}`}>
      <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.text3, marginBottom: 12 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-1px', color: col, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: alert ? C.red : C.text3, fontWeight: 500, marginTop: 10 }}>{sub}</p>}
    </div>
  )
}

/* HeroTile — foundational metric. Larger than Stat, with optional delta chip. */
export function HeroTile({ label, value, sub, delta, deltaSuffix, deltaIsAbsolute }) {
  const hasDelta = delta !== null && delta !== undefined && !Number.isNaN(Number(delta))
  const deltaNum = hasDelta ? Number(delta) : 0
  const deltaPositive = deltaNum >= 0
  const deltaColor = !hasDelta ? C.text3 : deltaPositive ? C.green : C.red
  const deltaBg    = !hasDelta ? 'transparent' : deltaPositive ? 'rgba(5,150,105,0.08)' : 'rgba(229,37,27,0.07)'
  const deltaBdr   = !hasDelta ? 'transparent' : deltaPositive ? 'rgba(5,150,105,0.18)' : 'rgba(229,37,27,0.18)'
  const deltaLabel = hasDelta
    ? `${deltaPositive ? '+' : ''}${fmtNum(Math.abs(deltaNum)) }${deltaIsAbsolute ? '' : ''}`
    : ''
  return (
    <div className="ytg-stat-card" style={{ padding: '20px 22px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.text3 }}>{label}</p>
        {hasDelta && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 600, color: deltaColor,
            background: deltaBg, border: `1px solid ${deltaBdr}`,
            padding: '3px 9px', borderRadius: 100,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.1px',
          }}>
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transform: deltaPositive ? 'none' : 'rotate(180deg)' }}>
              <path d="M5 8V2M2.5 4.5 5 2l2.5 2.5"/>
            </svg>
            {deltaLabel}
            <span style={{ color: C.text3, fontWeight: 500, marginLeft: 2 }}>{deltaSuffix || ''}</span>
          </span>
        )}
      </div>
      <p style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-2px', color: C.text1, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      {sub && <p style={{ fontSize: 12.5, color: C.text3, fontWeight: 500, marginTop: 12 }}>{sub}</p>}
    </div>
  )
}

/* Sparkline. Pure SVG mini line-chart for the Feed cards. No axes, no
   labels — just the trend shape. Uses brand red by default with a soft
   gradient fill below to give the line visual weight at small sizes. */
export function Sparkline({
  data,
  width = 160,
  height = 48,
  stroke = '#e5251b',
  fill = 'rgba(229,37,27,0.10)',
  strokeWidth = 1.8,
}) {
  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <line x1="0" y1={height - 1} x2={width} y2={height - 1} stroke="#eef0f4" strokeWidth="1"/>
      </svg>
    )
  }
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)
  const padY = 4
  const usableH = height - padY * 2
  const points = data.map((v, i) => {
    const x = i * stepX
    const y = padY + (1 - (v - min) / range) * usableH
    return [x, y]
  })
  const pathLine = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const pathArea = `${pathLine} L${width} ${height} L0 ${height} Z`
  const gradId = `sparkfill_${Math.random().toString(36).slice(2, 8)}`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="1"/>
          <stop offset="100%" stopColor={fill} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={pathArea} fill={`url(#${gradId})`} />
      <path d={pathLine} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      {/* End dot to anchor the line on the right */}
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="2.5" fill={stroke}/>
    </svg>
  )
}

/* Rich hero stat card. Replaces the small milestone tile pattern with one
   roomier card per metric: label, big number, delta chip, distance to
   next milestone, AND a real 28-day sparkline of the underlying series.
   This is the "wow" surface — the page top should feel alive, not flat. */
export function HeroStatCard({ label, value, raw, kind, delta, deltaSuffix, series }) {
  const target = kind === 'subs' ? nextSubMilestone(raw || 0) : nextViewMilestone(raw || 0)
  const pct    = target > 0 ? Math.max(2, Math.min(100, (raw / target) * 100)) : 0
  const hasDelta = delta !== null && delta !== undefined && !Number.isNaN(Number(delta))
  const deltaNum = hasDelta ? Number(delta) : 0
  const deltaPositive = deltaNum >= 0
  const deltaColor = !hasDelta ? C.text3 : deltaPositive ? C.green : C.red
  const deltaBg    = !hasDelta ? 'transparent' : deltaPositive ? 'rgba(5,150,105,0.08)' : 'rgba(229,37,27,0.07)'
  const deltaBdr   = !hasDelta ? 'transparent' : deltaPositive ? 'rgba(5,150,105,0.20)' : 'rgba(229,37,27,0.20)'

  return (
    <div className="ytg-stat-card" style={{ padding: '18px 20px 16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        {/* Left: number + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <p style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: C.text3,
            }}>{label}</p>
            {hasDelta && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                fontSize: 10.5, fontWeight: 600, color: deltaColor,
                background: deltaBg, border: `1px solid ${deltaBdr}`,
                padding: '1px 7px', borderRadius: 100,
                letterSpacing: '-0.05px',
                fontVariantNumeric: 'tabular-nums',
              }}>
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ transform: deltaPositive ? 'none' : 'rotate(180deg)' }}>
                  <path d="M5 8V2M2.5 4.5 5 2l2.5 2.5"/>
                </svg>
                {deltaPositive ? '+' : ''}{fmtNum(Math.abs(deltaNum))}
              </span>
            )}
          </div>

          <p style={{
            fontSize: 34, fontWeight: 700, letterSpacing: '-1.5px',
            color: C.text1, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
            marginBottom: 14,
          }}>{value}</p>

          {/* Hairline progress + Next */}
          <div style={{
            background: '#eef0f4', borderRadius: 99, height: 3,
            overflow: 'hidden', marginBottom: 6,
          }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: 'linear-gradient(90deg, rgba(229,37,27,0.55) 0%, #e5251b 100%)',
              borderRadius: 99,
              transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
            }}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <p style={{ fontSize: 10.5, fontWeight: 600, color: C.text3, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
              Next: <span style={{ color: C.text1, fontWeight: 600 }}>{fmtNum(target)}</span>
            </p>
            {hasDelta && (
              <p style={{ fontSize: 10.5, fontWeight: 500, color: C.text3, letterSpacing: '-0.01em' }}>
                {deltaSuffix || ''}
              </p>
            )}
          </div>
        </div>

        {/* Right: real 28-day sparkline. When analytics isn't connected
            (no series), shows a soft prompt instead of a dead line so
            the card doesn't look broken. */}
        {series && series.length >= 2 ? (
          <div style={{ flexShrink: 0, alignSelf: 'stretch', display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
            <Sparkline data={series} width={180} height={68} />
          </div>
        ) : (
          <div style={{
            flexShrink: 0, alignSelf: 'stretch',
            width: 180, minHeight: 68,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 6, paddingBottom: 4,
            background: 'rgba(15,15,19,0.025)',
            border: '1px dashed rgba(15,15,19,0.08)',
            borderRadius: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="rgba(10,10,15,0.30)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 14l4-5 3 3 4-6 3 4"/>
            </svg>
            <p style={{
              fontSize: 10, fontWeight: 600, color: 'rgba(10,10,15,0.40)',
              letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center',
              lineHeight: 1.3,
            }}>Connect Analytics<br/>for 28d trend</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* Hero tile with a milestone-progress bar. Matches VidIQ's two-tile pattern
   at the top of their feed: big number, target on the right, a thin bar
   showing distance to the next round milestone, optional delta chip below. */
export function MilestoneHeroTile({ label, value, raw, kind, delta, deltaSuffix, deltaIsAbsolute }) {
  const target = kind === 'subs' ? nextSubMilestone(raw || 0) : nextViewMilestone(raw || 0)
  const pct    = target > 0 ? Math.max(2, Math.min(100, (raw / target) * 100)) : 0
  const hasDelta = delta !== null && delta !== undefined && !Number.isNaN(Number(delta))
  const deltaNum = hasDelta ? Number(delta) : 0
  const deltaPositive = deltaNum >= 0
  const deltaColor = !hasDelta ? C.text3 : deltaPositive ? C.green : C.red
  const deltaBg    = !hasDelta ? 'transparent' : deltaPositive ? 'rgba(5,150,105,0.08)' : 'rgba(229,37,27,0.07)'
  const deltaBdr   = !hasDelta ? 'transparent' : deltaPositive ? 'rgba(5,150,105,0.18)' : 'rgba(229,37,27,0.18)'

  return (
    <div className="ytg-stat-card" style={{ padding: '14px 16px 12px' }}>
      {/* Top row: tiny label · optional delta chip */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 10, marginBottom: 6,
      }}>
        <p style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.11em',
          textTransform: 'uppercase', color: C.text3,
        }}>{label}</p>
        {hasDelta && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 10.5, fontWeight: 600, color: deltaColor,
            background: deltaBg, border: `1px solid ${deltaBdr}`,
            padding: '1px 7px', borderRadius: 100,
            letterSpacing: '-0.05px',
            fontVariantNumeric: 'tabular-nums',
          }}>
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ transform: deltaPositive ? 'none' : 'rotate(180deg)' }}>
              <path d="M5 8V2M2.5 4.5 5 2l2.5 2.5"/>
            </svg>
            {deltaPositive ? '+' : ''}{fmtNum(Math.abs(deltaNum))}
          </span>
        )}
      </div>

      {/* Big number */}
      <p style={{
        fontSize: 28, fontWeight: 700, letterSpacing: '-1.2px',
        color: C.text1, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
        marginBottom: 9,
      }}>{value}</p>

      {/* Hairline progress to next milestone */}
      <div style={{
        position: 'relative',
        background: '#eef0f4', borderRadius: 99, height: 3,
        overflow: 'hidden',
        marginBottom: 5,
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: 'linear-gradient(90deg, rgba(229,37,27,0.55) 0%, #e5251b 100%)',
          borderRadius: 99,
          transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
        }}/>
      </div>

      <p style={{ fontSize: 10.5, fontWeight: 600, color: C.text3, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
        Next: <span style={{ color: C.text1, fontWeight: 600 }}>{fmtNum(target)}</span>
      </p>
    </div>
  )
}

/* Small stat tile used inside the dark-shell posting cards. Same shape
   as a chip-sized metric: tiny eyebrow label, mid number, optional hint. */
export function StatTile({ label, value, hint, valueColor }) {
  return (
    <div>
      <p style={{ fontSize: 9.5, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.11em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</p>
      <p style={{ fontSize: 17, fontWeight: 600, color: valueColor || SHELL.text1, letterSpacing: '-0.4px', lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>{value}</p>
      {hint && <p style={{ fontSize: 10.5, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em' }}>{hint}</p>}
    </div>
  )
}
