import { useEffect, useState } from 'react'
import UpsellGate from '../components/UpsellGate'

// Load Geist page-scoped, matches Chat / Competitors / Keywords / Outliers.
if (typeof document !== 'undefined' && !document.getElementById('wr-geist-font')) {
  const link = document.createElement('link')
  link.id = 'wr-geist-font'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap'
  document.head.appendChild(link)
}
/* ─── C: dark palette for this page. Mirrors the shipped app-shell /
       Competitors / Keywords / Outliers dark system. Defined ABOVE the
       scoped-styles block so the injected stylesheet can interpolate
       ${C.*} (it runs at module eval). Semantic red/green/amber keep
       their hue; fill tints re-tuned for dark, *Hi variants give legible
       text on the dark tinted chips. ─── */
const C = {
  red:   '#c9a030', redBg:   'rgba(201,160,48,0.13)', redBdr:   'rgba(201,160,48,0.32)', redHi:   '#7a5b14',
  green: '#16a34a', greenBg: 'rgba(22,163,74,0.14)', greenBdr: 'rgba(22,163,74,0.34)', greenHi: '#2d7a4f',
  amber: '#d97706', amberBg: 'rgba(217,119,6,0.14)', amberBdr: 'rgba(217,119,6,0.34)', amberHi: '#b07d1a',
  text1: '#14130f', text2: '#6b6862', text3: '#6b6862',
  border: 'rgba(20,19,15,0.08)',
  card:           'linear-gradient(180deg, var(--yd-surface) 0%, var(--yd-surface) 100%)',
  cardFlat:       'var(--yd-surface)',
  hair:           'rgba(20,19,15,0.08)',
  hairHi:         'rgba(20,19,15,0.16)',
  cardShadow:     '0 1px 3px rgba(0,0,0,0.4)',
  cardShadowLift: '0 6px 20px rgba(0,0,0,0.55)',
}

if (typeof document !== 'undefined' && !document.getElementById('wr-styles')) {
  const s = document.createElement('style')
  s.id = 'wr-styles'
  s.textContent = `
    .wr-page { max-width: 1040px; margin: 0 auto; }
    .wr-page * { font-family: 'Barlow', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }

    /* WeeklyReport renders inside Dashboard, which injects light
       .ytg-card / .ytg-stat-card. Scope-override them to the dark surface
       system here so they only go dark on this page, not on Overview
       (which targets .ov-page .ytg-stat-card). */
    .wr-page .ytg-card, .wr-page .ytg-stat-card {
      background: ${C.card};
      border: 1px solid ${C.hair};
      box-shadow: ${C.cardShadow};
    }
    .wr-page .ytg-card:hover, .wr-page .ytg-stat-card:hover {
      box-shadow: ${C.cardShadowLift};
      border-color: ${C.hairHi};
    }
    .wr-page .ytg-stat-card.alert {
      border-color: ${C.redBdr};
      background: ${C.redBg};
    }
  `
  document.head.appendChild(s)
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
    return <span style={{ fontSize: 12, color: C.text3, fontWeight: 500 }}>First report</span>
  }
  if (direction === 'flat') {
    return <span style={{ fontSize: 12, color: C.text3, fontWeight: 500 }}>→ No change</span>
  }
  const up    = direction === 'up'
  const color = up ? C.greenHi : C.redHi
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
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.text3, marginBottom: 12 }}>{label}</p>
      <p style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-1.4px', color: valueColor || C.text1, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      <div style={{ marginTop: 10 }}>
        <DeltaBadge metric={metric} unit={unit} isScore={isScore} />
      </div>
    </div>
  )
}

/* Health color for metric numbers, red when below healthy, amber mid, green good. */
function healthColor(n, { red, amber }) {
  if (n == null) return null
  if (n < red)   return C.redHi
  if (n < amber) return C.amberHi
  return C.greenHi
}

function ColLabel({ color, children }) {
  return (
    <p style={{
      fontSize: 10.5, fontWeight: 600, color,
      letterSpacing: '0.10em', textTransform: 'uppercase',
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
    // .ytg-card carries canonical bg/border/shadow + hover lift. Injected
    // by Dashboard.useDashboardStyles() (WeeklyReport renders inside it).
    <div className="ytg-card" style={{ overflow: 'hidden' }}>
      {/* Header row, always visible */}
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
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text1, letterSpacing: '-0.2px', marginBottom: 3 }}>
            {rd.reportTitle || 'Weekly Report'}
          </div>
          <div style={{ fontSize: 12, color: C.text3 }}>
            {report.weekStart} – {report.weekEnd}
            {m.channelScore?.delta != null && (
              <span style={{ marginLeft: 10, color: m.channelScore.direction === 'up' ? C.greenHi : C.redHi, fontWeight: 600 }}>
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
          stroke={C.text3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
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
      {/* Metrics grid, elevated cards, Overview-style */}
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

      {/* Weekly summary, bold statement (like Overview insight problem) */}
      {rd.weeklySummary && (
        <p style={{
          fontSize: 14.5, fontWeight: 600,
          color: C.text1, lineHeight: 1.65,
          letterSpacing: '-0.15px',
          marginBottom: 18,
        }}>
          {rd.weeklySummary}
        </p>
      )}

      {/* 3-column grid, Watch out / Priority / Biggest Win.
         Unified shape language: same radius, same border weight, same
         padding rhythm. Priority gets visual weight via a richer red
         tint + glow shadow rather than an asymmetric border-radius. */}
      {(rd.biggestWin || rd.watchOut || rd.priorityAction) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr 1fr',
          gap: 10,
        }}>
          {/* Watch out (amber) */}
          {rd.watchOut
            ? <div style={{ background: C.amberBg, border: `1px solid ${C.amberBdr}`, borderRadius: 12, padding: '14px 16px' }}>
                <ColLabel color={C.amber}>Watch out</ColLabel>
                <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.72 }}>{rd.watchOut}</p>
              </div>
            : <div />
          }

          {/* Priority (red, the hero, slightly louder tint + glow) */}
          {rd.priorityAction
            ? <div style={{
                background: 'linear-gradient(160deg, rgba(201,160,48,0.16) 0%, rgba(201,160,48,0.06) 100%)',
                border: `1px solid ${C.redBdr}`,
                borderRadius: 12,
                padding: '14px 16px',
                boxShadow: '0 1px 2px rgba(201,160,48,0.05), 0 8px 22px rgba(201,160,48,0.08)',
              }}>
                <ColLabel color={C.red}>Your priority</ColLabel>
                <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.72 }}>{rd.priorityAction}</p>
              </div>
            : <div />
          }

          {/* Biggest win (green) */}
          {rd.biggestWin
            ? <div style={{ background: C.greenBg, border: `1px solid ${C.greenBdr}`, borderRadius: 12, padding: '14px 16px' }}>
                <ColLabel color={C.green}>Biggest win</ColLabel>
                <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.72 }}>{rd.biggestWin}</p>
              </div>
            : <div />
          }
        </div>
      )}

      {/* Motivational close, muted, no divider line above (just spacing) */}
      {rd.motivationalClose && (
        <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.65, marginTop: 22 }}>
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

    // Current email preference, seeds the toggle from real state
    fetch(`/api/reports/email-preference?channel_id=${channelId}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && typeof d.weekly_report === 'boolean') setEmailOn(d.weekly_report) })
      .catch(() => {})

    // Out-of-credits notice, paid plan with 0 credits available
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
        <div style={{ width: 28, height: 28, border: `2.5px solid rgba(20,19,15,0.12)`, borderTop: `2.5px solid ${C.red}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
      </div>
    )
  }

  const hasReports = reports && reports.length > 0
  const latest     = hasReports ? reports[0] : null
  const previous   = hasReports ? reports.slice(1) : []

  const subSubtitle = isFree
    ? 'Weekly AI insights, available on paid plans.'
    : 'Your channel performance, delivered every week.'

  const header = (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: C.text1, letterSpacing: '-0.7px', marginBottom: 6, lineHeight: 1.1 }}>Weekly Report</h1>
        <p style={{ fontSize: 14, color: C.text2, fontWeight: 500, letterSpacing: '-0.005em', lineHeight: 1.45 }}>{subSubtitle}</p>
      </div>

      {/* Email delivery toggle, paid only (free users have nothing to toggle) */}
      {!isFree && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, color: C.text2, fontWeight: 500 }}>Email delivery</span>
            <button
              onClick={toggleEmail}
              disabled={toggling}
              style={{
                width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                background: emailOn ? C.red : 'rgba(20,19,15,0.16)',
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
            <span style={{ fontSize: 12, color: C.text3 }}>You can resubscribe anytime</span>
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
      <div className="wr-page">
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

        {/* Gate with inline blurred preview (mock report tease), handled
            by UpsellGate's previewContent prop. Same visual as before,
            now shared across every gated page. */}
        <UpsellGate
          title="Unlock weekly AI reports"
          description="YTGrowth audits your channel every week and tells you the single thing to fix next, not a wall of data, a clear priority."
          bullets={[
            'Biggest win, watch out, and priority, every week',
            'Fresh analysis delivered straight to your inbox',
            '4 AI reports delivered to your inbox every month.',
          ]}
          previewContent={
            <div className="ytg-card" style={{ padding: '30px 30px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.text1, letterSpacing: '-0.2px', marginBottom: 5 }}>
                    Your Week on YouTube, Apr 13 – 19
                  </div>
                  <div style={{ fontSize: 12.5, color: C.text3 }}>2026-04-13 – 2026-04-19</div>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 11, fontWeight: 600, color: C.greenHi,
                  background: C.greenBg, border: `1px solid ${C.greenBdr}`,
                  borderRadius: 999, padding: '4px 11px',
                  letterSpacing: '0.10em', textTransform: 'uppercase',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }}/>
                  Latest
                </span>
              </div>

              <p style={{ fontSize: 14.5, fontWeight: 600, color: C.text1, lineHeight: 1.65, letterSpacing: '-0.15px', marginBottom: 18 }}>
                {channelFirstName} grew 12% this week with strong retention on the house tour, but the 14-day posting gap is starting to hurt recommendation surfaces, here&rsquo;s what&rsquo;s working and what to focus on next.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 10 }}>
                <div style={{ background: C.amberBg, border: `1px solid ${C.amberBdr}`, borderRadius: 12, padding: '14px 16px' }}>
                  <ColLabel color={C.amber}>Watch out</ColLabel>
                  <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.72 }}>Posting frequency dropped to one video in 14 days and the algorithm is deprioritizing the channel.</p>
                </div>
                <div style={{
                  background: 'linear-gradient(160deg, rgba(201,160,48,0.16) 0%, rgba(201,160,48,0.06) 100%)',
                  border: `1px solid ${C.redBdr}`,
                  borderRadius: 12,
                  padding: '14px 16px',
                  boxShadow: '0 1px 2px rgba(201,160,48,0.05), 0 8px 22px rgba(201,160,48,0.08)',
                }}>
                  <ColLabel color={C.red}>Your priority</ColLabel>
                  <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.72 }}>Film two shopping hauls this week, they are your repeatable winner, and a second one inside 7 days compounds the algorithm boost.</p>
                </div>
                <div style={{ background: C.greenBg, border: `1px solid ${C.greenBdr}`, borderRadius: 12, padding: '14px 16px' }}>
                  <ColLabel color={C.green}>Biggest win</ColLabel>
                  <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.72 }}>The house tour hit 13,908 views and pulled in 25 new subs, your best single video this quarter.</p>
                </div>
              </div>
            </div>
          }
        />
      </div>
    )
  }

  // ── Paid plan ───────────────────────────────────────────────────────────
  return (
    <div className="wr-page">
      {header}

      {/* Out-of-credits notice, paid plan with 0 credits available */}
      {creditNotice && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          background: C.amberBg,
          border: `1px solid ${C.amberBdr}`,
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
            <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text1, lineHeight: 1.5, marginBottom: 2 }}>
              You&rsquo;re out of credits
            </p>
            <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>
              This week&rsquo;s report will be skipped. Top up or upgrade to resume weekly delivery.{' '}
              <a href="/#pricing" style={{ color: C.redHi, fontWeight: 600, textDecoration: 'none' }}>Top up →</a>
            </p>
          </div>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {!hasReports && (
        <div className="ytg-card" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '88px 32px', textAlign: 'center',
        }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color: C.text3,
            letterSpacing: '0.10em', textTransform: 'uppercase',
            marginBottom: 14,
          }}>Generating</span>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: C.text1, marginBottom: 10, letterSpacing: '-0.2px', lineHeight: 1.3 }}>Your first report is on its way</h2>
          <p style={{ fontSize: 14, color: C.text3, maxWidth: 360, lineHeight: 1.7 }}>
            We generate your first weekly report right after your channel connects. Check back in a few minutes.
          </p>
        </div>
      )}

      {/* ── Latest report ───────────────────────────────────────────────── */}
      {latest && (
        <div className="ytg-card" style={{
          padding: '30px 30px 32px', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.text1, letterSpacing: '-0.2px', marginBottom: 5 }}>
                {latest.reportData?.reportTitle || 'Weekly Report'}
              </div>
              <div style={{ fontSize: 12.5, color: C.text3, fontVariantNumeric: 'tabular-nums' }}>{latest.weekStart} – {latest.weekEnd}</div>
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, color: C.greenHi,
              background: C.greenBg, border: `1px solid ${C.greenBdr}`,
              borderRadius: 999, padding: '4px 11px',
              letterSpacing: '0.10em', textTransform: 'uppercase',
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
          <div style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 12, marginTop: 8 }}>Previous Reports</div>
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
