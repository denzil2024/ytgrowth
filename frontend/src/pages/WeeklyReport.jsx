import { useEffect, useState } from 'react'

const C = {
  red: '#e5251b', redBg: '#fef2f2', redBdr: 'rgba(229,37,27,0.15)',
  green: '#16a34a', greenBg: '#f0fdf4', greenBdr: 'rgba(134,239,172,0.7)',
  amber: '#d97706', amberBg: '#fffbeb',
  text1: '#111114', text2: '#374151', text3: '#6b7280', text4: '#9ca3af',
  border: 'rgba(0,0,0,0.08)',
}

function fmtNum(n) {
  if (n == null) return '—'
  n = Number(n)
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toLocaleString()
}

function DeltaBadge({ metric, unit, isScore }) {
  if (!metric) return null
  const { delta, direction } = metric
  if (delta === null || delta === undefined) {
    return <span style={{ fontSize: 12, color: C.text4, fontWeight: 500 }}>First report</span>
  }
  if (direction === 'flat') {
    return <span style={{ fontSize: 12, color: C.text4, fontWeight: 500 }}>→ No change</span>
  }
  const up    = direction === 'up'
  const color = up ? C.green : C.red
  const arrow = up ? '↑' : '↓'
  let val
  if (isScore) val = `${up ? '+' : ''}${Math.round(delta)} pts`
  else if (unit === '%') val = `${up ? '+' : ''}${Math.abs(delta).toFixed(1)}%`
  else val = `${up ? '+' : ''}${fmtNum(Math.abs(delta))}`
  return <span style={{ fontSize: 12, color, fontWeight: 600 }}>{arrow} {val}</span>
}

function MetricCard({ label, value, metric, unit, isScore, valueColor }) {
  return (
    <div className="ytg-stat-card" style={{ cursor: 'default' }}>
      <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.text3, marginBottom: 12 }}>{label}</p>
      <p style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-1.4px', color: valueColor || C.text1, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      <div style={{ marginTop: 10 }}>
        <DeltaBadge metric={metric} unit={unit} isScore={isScore} />
      </div>
    </div>
  )
}

/* Health color for metric numbers — red when below healthy, amber mid, green good. */
function healthColor(n, { red, amber }) {
  if (n == null) return null
  if (n < red)   return C.red
  if (n < amber) return C.amber
  return C.green
}

function ColLabel({ color, children }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, color,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      marginBottom: 6,
    }}>
      {children}
    </p>
  )
}

function ReportCard({ report, expanded, onToggle }) {
  const rd = report.reportData || {}
  const m  = rd.metrics || {}

  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.08)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 6px 24px rgba(0,0,0,0.09)',
      overflow: 'hidden',
    }}>
      {/* Header row — always visible */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '18px 22px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 12, textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text1, letterSpacing: '-0.2px', marginBottom: 3 }}>
            {rd.reportTitle || 'Weekly Report'}
          </div>
          <div style={{ fontSize: 12, color: C.text3 }}>
            {report.weekStart} – {report.weekEnd}
            {m.channelScore?.delta != null && (
              <span style={{ marginLeft: 10, color: m.channelScore.direction === 'up' ? C.green : C.red, fontWeight: 600 }}>
                {m.channelScore.direction === 'up' ? '↑' : '↓'} {Math.abs(m.channelScore.delta)} pts
              </span>
            )}
          </div>
          {!expanded && rd.weeklySummary && (
            <div style={{ fontSize: 12, color: C.text3, marginTop: 6, lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
              {rd.weeklySummary}
            </div>
          )}
        </div>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          stroke={C.text4} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path d="M4 6l4 4 4-4"/>
        </svg>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: '0 22px 22px' }}>
          <ReportBody rd={rd} />
        </div>
      )}
    </div>
  )
}

function ReportBody({ rd, isLatest }) {
  const m = rd.metrics || {}

  const subsVal  = m.subscribers?.value  != null ? fmtNum(m.subscribers.value)       : '—'
  const viewsVal = m.weeklyViews?.value  != null ? fmtNum(m.weeklyViews.value)       : '—'
  const retVal   = m.avgRetention?.value != null ? `${m.avgRetention.value}%`        : '—'
  const scoreVal = m.channelScore?.value != null ? `${m.channelScore.value}/100`     : '—'

  const retColor   = healthColor(m.avgRetention?.value,  { red: 40, amber: 50 })
  const scoreColor = healthColor(m.channelScore?.value,  { red: 50, amber: 75 })

  const hasBody = rd.weeklySummary || rd.biggestWin || rd.watchOut || rd.priorityAction

  return (
    <>
      {/* Metrics grid — elevated cards, Overview-style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: 14, marginBottom: hasBody ? 22 : 0,
      }}>
        <MetricCard label="Subscribers"    value={subsVal}  metric={m.subscribers} />
        <MetricCard label="Weekly Views"   value={viewsVal} metric={m.weeklyViews} />
        <MetricCard label="Avg Retention"  value={retVal}   metric={m.avgRetention} unit="%" valueColor={retColor} />
        <MetricCard label="Channel Score"  value={scoreVal} metric={m.channelScore} isScore valueColor={scoreColor} />
      </div>

      {/* Weekly summary — bold statement (like Overview insight problem) */}
      {rd.weeklySummary && (
        <p style={{
          fontSize: 14, fontWeight: 600,
          color: C.text1, lineHeight: 1.72,
          marginBottom: 14,
        }}>
          {rd.weeklySummary}
        </p>
      )}

      {/* Divider before 3-column grid */}
      {(rd.biggestWin || rd.watchOut || rd.priorityAction) && (
        <div style={{ height: 1, background: C.border, marginBottom: 14 }}/>
      )}

      {/* 3-column grid — Overview priority-action pattern */}
      {(rd.biggestWin || rd.watchOut || rd.priorityAction) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr 1fr',
          gap: 8,
        }}>
          {/* Watch out (amber — context/warning, like "Why now") */}
          {rd.watchOut
            ? <div style={{ background: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.14)', borderRadius: 10, padding: '12px 14px' }}>
                <ColLabel color={C.amber}>Watch out</ColLabel>
                <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.72 }}>{rd.watchOut}</p>
              </div>
            : <div />
          }

          {/* Priority (hero — white with red left border + shadow, like "Action") */}
          {rd.priorityAction
            ? <div style={{
                background: '#ffffff',
                border: `1px solid ${C.border}`,
                borderLeft: `3px solid ${C.red}`,
                borderRadius: '0 10px 10px 0',
                padding: '12px 16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}>
                <ColLabel color={C.red}>Your Priority</ColLabel>
                <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.72 }}>{rd.priorityAction}</p>
              </div>
            : <div />
          }

          {/* Biggest win (green — positive outcome, like "Expected outcome") */}
          {rd.biggestWin
            ? <div style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.14)', borderRadius: 10, padding: '12px 14px' }}>
                <ColLabel color={C.green}>Biggest Win</ColLabel>
                <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.72 }}>{rd.biggestWin}</p>
              </div>
            : <div />
          }
        </div>
      )}

      {/* Motivational close — muted, no italic */}
      {rd.motivationalClose && (
        <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.65, marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
          {rd.motivationalClose}
        </p>
      )}
    </>
  )
}

export default function WeeklyReport({ channelId, channelEmail }) {
  const [reports,    setReports]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [emailOn,    setEmailOn]    = useState(true)
  const [toggling,   setToggling]   = useState(false)
  const [expanded,   setExpanded]   = useState({})

  useEffect(() => {
    if (!channelId) return
    fetch(`/api/reports/history?channel_id=${channelId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReports(data)
          // Expand latest by default
          if (data.length > 0) setExpanded({ 0: true })
        } else {
          setReports([])
        }
        setLoading(false)
      })
      .catch(() => { setReports([]); setLoading(false) })

    // Load current email preference so toggle reflects real state
    fetch(`/api/reports/email-preference?channel_id=${channelId}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && typeof d.weekly_report === 'boolean') setEmailOn(d.weekly_report) })
      .catch(() => {})
  }, [channelId])

  function toggleEmail() {
    if (toggling) return
    setToggling(true)
    const next = !emailOn
    fetch('/api/reports/email-preference', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_id: channelId, weekly_report: next }),
    })
      .then(r => r.json())
      .then(d => { if (d.success) setEmailOn(next) })
      .finally(() => setToggling(false))
  }

  function toggleExpand(idx) {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
        <div style={{ width: 28, height: 28, border: `2.5px solid rgba(0,0,0,0.1)`, borderTop: `2.5px solid ${C.red}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
      </div>
    )
  }

  const hasReports = reports && reports.length > 0
  const latest     = hasReports ? reports[0] : null
  const previous   = hasReports ? reports.slice(1) : []

  return (
    <div>
      {/* ── Header row ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(229,37,27,0.09)',
            border: '1px solid rgba(229,37,27,0.18)',
            flexShrink: 0, marginTop: 2,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="5" width="16" height="16" rx="2"/>
              <path d="M8 3v4M16 3v4M4 11h16"/>
              <path d="M8 15h4"/>
            </svg>
          </span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Weekly Report</h1>
            <p style={{ fontSize: 14, color: C.text3 }}>Your channel performance, delivered every week.</p>
          </div>
        </div>

        {/* Email delivery toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, color: C.text2, fontWeight: 500 }}>Email delivery</span>
            <button
              onClick={toggleEmail}
              disabled={toggling}
              style={{
                width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                background: emailOn ? C.red : '#d1d5db',
                position: 'relative', transition: 'background 0.2s',
                opacity: toggling ? 0.6 : 1,
              }}
            >
              <span style={{
                display: 'block', width: 16, height: 16, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3, transition: 'left 0.2s',
                left: emailOn ? 21 : 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}/>
            </button>
          </div>
          {!emailOn && (
            <span style={{ fontSize: 12, color: C.text4 }}>You can resubscribe anytime</span>
          )}
        </div>
      </div>

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {!hasReports && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '80px 32px', textAlign: 'center',
          background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 6px 24px rgba(0,0,0,0.09)',
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke={C.text4} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
            <rect x="8" y="10" width="32" height="34" rx="4"/>
            <path d="M16 6v8M32 6v8M8 22h32"/>
            <path d="M16 30h8M16 36h16"/>
          </svg>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text1, marginBottom: 8, letterSpacing: '-0.3px' }}>Your first report is on its way</h2>
          <p style={{ fontSize: 14, color: C.text3, maxWidth: 320, lineHeight: 1.7 }}>
            We generate your first weekly report right after your channel connects. Check back in a few minutes.
          </p>
        </div>
      )}

      {/* ── Latest report ───────────────────────────────────────────────── */}
      {latest && (
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.08)',
          borderTop: `3px solid ${C.red}`,
          boxShadow: '0 2px 6px rgba(0,0,0,0.08), 0 10px 36px rgba(0,0,0,0.10)',
          padding: '28px 28px 30px', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.text1, letterSpacing: '-0.4px', marginBottom: 5 }}>
                {latest.reportData?.reportTitle || 'Weekly Report'}
              </div>
              <div style={{ fontSize: 12.5, color: C.text3, fontVariantNumeric: 'tabular-nums' }}>{latest.weekStart} – {latest.weekEnd}</div>
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 800, color: C.green,
              background: '#f0fdf4', border: '1px solid rgba(134,239,172,0.65)',
              borderRadius: 999, padding: '4px 11px',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              flexShrink: 0,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, boxShadow: `0 0 8px ${C.green}` }}/>
              Latest
            </span>
          </div>
          <ReportBody rd={latest.reportData || {}} isLatest />
        </div>
      )}

      {/* ── Previous reports ────────────────────────────────────────────── */}
      {previous.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text4, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, marginTop: 8 }}>Previous Reports</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {previous.map((r, i) => (
              <ReportCard
                key={r.id}
                report={r}
                expanded={!!expanded[i + 1]}
                onToggle={() => toggleExpand(i + 1)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
