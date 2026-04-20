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
          fontSize: 14, fontWeight: 700,
          color: C.text1, lineHeight: 1.65,
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

export default function WeeklyReport({ channelId, channelEmail, plan, channelStats, analytics, healthScore }) {
  const [reports,    setReports]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [emailOn,    setEmailOn]    = useState(true)
  const [toggling,   setToggling]   = useState(false)
  const [expanded,   setExpanded]   = useState({})
  const [creditNotice, setCreditNotice] = useState(false)

  const isFree = plan === 'free' || plan == null

  useEffect(() => {
    if (!channelId) return
    if (isFree) { setLoading(false); return }

    fetch(`/api/reports/history?channel_id=${channelId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReports(data)
          if (data.length > 0) setExpanded({ 0: true })
        } else {
          setReports([])
        }
        setLoading(false)
      })
      .catch(() => { setReports([]); setLoading(false) })

    // Current email preference — seeds the toggle from real state
    fetch(`/api/reports/email-preference?channel_id=${channelId}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && typeof d.weekly_report === 'boolean') setEmailOn(d.weekly_report) })
      .catch(() => {})

    // Out-of-credits notice — paid plan with 0 credits available
    fetch(`/api/reports/status?channel_id=${channelId}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setCreditNotice(!!d.should_show_credit_notice) })
      .catch(() => {})
  }, [channelId, isFree])

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

  const subSubtitle = isFree
    ? 'Weekly AI insights — available on paid plans.'
    : 'Your channel performance, delivered every week.'

  const header = (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 44, height: 44, borderRadius: 11,
          background: 'rgba(229,37,27,0.09)',
          border: '1px solid rgba(229,37,27,0.18)',
          flexShrink: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="5" width="16" height="16" rx="2"/>
            <path d="M8 3v4M16 3v4M4 11h16"/>
            <path d="M8 15h4"/>
          </svg>
        </span>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4, lineHeight: 1.1 }}>Weekly Report</h1>
          <p style={{ fontSize: 14, color: C.text3, lineHeight: 1.3 }}>{subSubtitle}</p>
        </div>
      </div>

      {/* Email delivery toggle — paid only (free users have nothing to toggle) */}
      {!isFree && (
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
      )}
    </div>
  )

  // ── Free plan: live metric snapshot + BLURRED preview with gated CTA ────
  if (isFree) {
    const subsVal   = channelStats?.subscribers != null ? fmtNum(channelStats.subscribers) : '—'
    const viewsVal  = channelStats?.total_views != null ? fmtNum(channelStats.total_views) : '—'
    const retRaw    = analytics?.avg_retention_percent
    const retVal    = retRaw != null ? `${retRaw}%` : '—'
    const scoreVal  = healthScore != null ? `${healthScore}/100` : '—'
    const retColor   = healthColor(retRaw,      { red: 40, amber: 50 })
    const scoreColor = healthColor(healthScore, { red: 50, amber: 75 })
    const channelFirstName = (channelStats?.channel_name || 'your channel').split(' ')[0]

    return (
      <div>
        {header}

        {/* Live metric snapshot */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 14, marginBottom: 32,
        }}>
          <MetricCard label="Subscribers"    value={subsVal}  />
          <MetricCard label="Total Views"    value={viewsVal} />
          <MetricCard label="Avg Retention"  value={retVal}   valueColor={retColor} />
          <MetricCard label="Channel Score"  value={scoreVal} valueColor={scoreColor} />
        </div>

        {/* Blurred preview of a real report, gated with a centered CTA */}
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', minHeight: 520 }}>

          {/* ─── Blurred mock report (what paid users see) ──────────────── */}
          <div aria-hidden="true" style={{
            filter: 'blur(6px)',
            pointerEvents: 'none', userSelect: 'none',
            transform: 'scale(1.015)', // hide blur halo at edges
          }}>
            <div style={{
              background: '#fff', borderRadius: 16,
              border: '1px solid rgba(0,0,0,0.08)',
              borderTop: `3px solid ${C.red}`,
              boxShadow: '0 2px 6px rgba(0,0,0,0.08), 0 10px 36px rgba(0,0,0,0.10)',
              padding: '28px 28px 30px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.text1, letterSpacing: '-0.4px', marginBottom: 5 }}>
                    Your Week on YouTube — Apr 13 – 19
                  </div>
                  <div style={{ fontSize: 12.5, color: C.text3 }}>2026-04-13 – 2026-04-19</div>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 11, fontWeight: 800, color: C.green,
                  background: '#f0fdf4', border: '1px solid rgba(134,239,172,0.65)',
                  borderRadius: 999, padding: '4px 11px',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }}/>
                  Latest
                </span>
              </div>

              <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, lineHeight: 1.65, marginBottom: 14 }}>
                {channelFirstName} grew 12% this week with strong retention on the house tour, but the 14-day posting gap is starting to hurt recommendation surfaces — here&rsquo;s what&rsquo;s working and what to focus on next.
              </p>

              <div style={{ height: 1, background: C.border, marginBottom: 14 }}/>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 8 }}>
                <div style={{ background: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.14)', borderRadius: 10, padding: '12px 14px' }}>
                  <ColLabel color={C.amber}>Watch out</ColLabel>
                  <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.72 }}>Posting frequency dropped to one video in 14 days and the algorithm is deprioritizing the channel.</p>
                </div>
                <div style={{ background: '#ffffff', border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.red}`, borderRadius: '0 10px 10px 0', padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <ColLabel color={C.red}>Your Priority</ColLabel>
                  <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.72 }}>Film two shopping hauls this week — they are your repeatable winner, and a second one inside 7 days compounds the algorithm boost.</p>
                </div>
                <div style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.14)', borderRadius: 10, padding: '12px 14px' }}>
                  <ColLabel color={C.green}>Biggest Win</ColLabel>
                  <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.72 }}>The house tour hit 13,908 views and pulled in 25 new subs — your best single video this quarter.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Overlay with the actual conversion card ────────────────── */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(245,245,249,0.78) 0%, rgba(245,245,249,0.55) 30%, rgba(245,245,249,0.55) 70%, rgba(245,245,249,0.82) 100%)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid rgba(229,37,27,0.2)',
              borderRadius: 20,
              boxShadow: '0 20px 50px rgba(0,0,0,0.16)',
              padding: '30px 36px 28px',
              maxWidth: 540, width: '100%',
              textAlign: 'center',
            }}>
              {/* Lock icon */}
              <div style={{
                width: 50, height: 50, borderRadius: 14,
                background: `linear-gradient(180deg, ${C.red} 0%, #a50f07 100%)`,
                margin: '0 auto 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 8px 22px ${C.red}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 10 }}>
                Unlock weekly AI reports
              </h2>
              <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.6, marginBottom: 22, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
                YTGrowth audits your channel every week and tells you the single thing to fix next — not a wall of data, a clear priority.
              </p>

              {/* Benefits */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, textAlign: 'left', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
                {[
                  'Biggest win, watch out, and priority — every week',
                  'Fresh analysis delivered straight to your inbox',
                  '4 emails/month · 1 credit each on Solo, Growth, Agency',
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 20, height: 20, borderRadius: '50%',
                      background: `${C.green}18`, flexShrink: 0, marginTop: 1,
                    }}>
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={C.green} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1.5,6.5 5,10 10.5,2"/>
                      </svg>
                    </span>
                    <span style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.55 }}>{t}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <a
                href="/?tab=monthly#pricing"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', maxWidth: 360,
                  background: `linear-gradient(180deg, ${C.red} 0%, #a50f07 100%)`,
                  color: '#ffffff',
                  fontSize: 14, fontWeight: 700,
                  padding: '13px 24px', borderRadius: 999,
                  textDecoration: 'none', letterSpacing: '-0.1px',
                  boxShadow: `0 8px 22px ${C.red}50, inset 0 1px 0 rgba(255,255,255,0.22)`,
                }}
              >
                See monthly plans
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </a>
              <div style={{ fontSize: 12.5, color: C.text3, fontWeight: 500, marginTop: 10, marginBottom: 8 }}>
                Plans from <span style={{ fontWeight: 700, color: C.text2 }}>$19/mo</span> · cancel anytime
              </div>
              <div>
                <a
                  href="/?tab=packs#pricing"
                  style={{
                    fontSize: 12.5, fontWeight: 600, color: C.text3,
                    textDecoration: 'none',
                  }}
                >
                  Or grab a one-time credit pack →
                </a>
              </div>

              {/* Trust stack */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                marginTop: 22, paddingTop: 20,
                borderTop: `1px solid ${C.border}`,
              }}>
                <div style={{ display: 'flex' }}>
                  {['sophie', 'james', 'priya', 'amara', 'marcus'].map((name, i, arr) => (
                    <img
                      key={name}
                      src={`/avatars/${name}.jpg`}
                      alt=""
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        border: '2px solid #ffffff',
                        marginLeft: i === 0 ? 0 : -9,
                        objectFit: 'cover',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                        zIndex: arr.length - i,
                        position: 'relative',
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 12.5, color: C.text3, fontWeight: 500, textAlign: 'left', lineHeight: 1.4 }}>
                  Trusted by creators growing<br/>their channels every week
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Paid plan ───────────────────────────────────────────────────────────
  return (
    <div>
      {header}

      {/* Out-of-credits notice — paid plan with 0 credits available */}
      {creditNotice && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          background: '#fffbeb',
          border: '1px solid rgba(217,119,6,0.25)',
          borderLeft: `3px solid ${C.amber}`,
          borderRadius: 12,
          padding: '14px 18px',
          marginBottom: 16,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: C.text1, lineHeight: 1.5, marginBottom: 2 }}>
              You&rsquo;re out of credits
            </p>
            <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>
              This week&rsquo;s report will be skipped. Top up or upgrade to resume weekly delivery.{' '}
              <a href="/#pricing" style={{ color: C.red, fontWeight: 700, textDecoration: 'none' }}>Top up →</a>
            </p>
          </div>
        </div>
      )}

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
