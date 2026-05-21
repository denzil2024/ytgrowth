/* ─── First-time welcome banner ─────────────────────────────────────────────
   Self-contained onboarding banner. Not currently wired into the Dashboard
   render path — kept here as a future surface the user can reactivate
   without spelunking through git history. */
import { C, SHELL } from './tokens'

export function FirstTimeWelcome({ data, onDismiss, onNavigate }) {
  const channelId = data?.channel?.channel_id
  if (!data?.insights || !channelId) return null
  if (localStorage.getItem(`ytg_welcomed_${channelId}`) === '1') return null

  const score = data.insights.channelScore ?? 0
  const top   = data.insights.priorityActions?.[0]
  const s     = top ? sev(top.impact) : null

  const scores = data.insights.categoryScores || {}
  const weakest = Object.entries(scores).sort((a, b) => a[1] - b[1])[0]?.[0] || ''

  let ctaLabel, ctaNav
  if (weakest.toLowerCase().includes('ctr') || weakest.toLowerCase().includes('seo')) {
    ctaLabel = 'Fix your titles →'
    ctaNav   = 'SEO Studio'
  } else if (weakest.toLowerCase().includes('content') || weakest.toLowerCase().includes('posting')) {
    ctaLabel = 'Get video ideas →'
    ctaNav   = 'Video Ideas'
  } else if (data.insights.competitorBenchmark === null) {
    ctaLabel = 'Analyse a competitor →'
    ctaNav   = 'Competitors'
  } else {
    ctaLabel = 'Score your thumbnail →'
    ctaNav   = 'Thumbnail Score'
  }

  function dismiss() {
    localStorage.setItem(`ytg_welcomed_${channelId}`, '1')
    onDismiss()
  }

  return (
    <div style={{
      position: 'relative',
      marginBottom: 20,
      background: SHELL.cardFlat,
      border: '1px solid rgba(0,0,0,0.09)',
      borderRadius: 20,
      boxShadow: '0 2px 6px rgba(0,0,0,0.08), 0 12px 40px rgba(0,0,0,0.10)',
      padding: '24px 28px',
      animation: 'fadeUp 0.3s ease',
    }}>
      {/* Dismiss button */}
      <button
        onClick={dismiss}
        style={{
          position: 'absolute', top: 16, right: 16,
          width: 24, height: 24, borderRadius: 8,
          background: 'rgba(0,0,0,0.05)', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round">
          <line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/>
        </svg>
      </button>

      <div style={{ display: 'flex', gap: 28, alignItems: 'stretch' }}>

        {/* LEFT — score */}
        <div style={{ flex: '0 0 auto', width: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, flexShrink: 0, animation: 'pulse 2s infinite' }}/>
            <span style={{ fontSize: 12, fontWeight: 600, color: SHELL.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your audit is ready</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, lineHeight: 1 }}>
            <span style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-2px', lineHeight: 1, color: scoreColor(score), fontVariantNumeric: 'tabular-nums' }}>{score}</span>
            <span style={{ fontSize: 16, color: SHELL.text3, fontWeight: 400, paddingBottom: 8 }}>/100</span>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: scoreColor(score), marginTop: 4 }}>{scoreLabel(score)}</p>
          {data.insights.channelSummary && (
            <p style={{
              fontSize: 12, color: SHELL.text2, lineHeight: 1.7, marginTop: 10,
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>{data.insights.channelSummary}</p>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: 'rgba(0,0,0,0.07)', alignSelf: 'stretch', flexShrink: 0 }}/>

        {/* CENTER — top priority */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: SHELL.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Your #1 priority right now</p>
          {top && s ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 3 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: SHELL.text1, lineHeight: 1.4, flex: 1 }}>{top.problem}</p>
                <span style={{ background: s.bg, color: s.color, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.07em', border: `1px solid ${s.bdr}` }}>{top.impact}</span>
              </div>
              {top.category && <p style={{ fontSize: 12, color: SHELL.text3, marginTop: 3, marginBottom: 10 }}>{top.category}</p>}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)`, borderLeft: `3px solid ${s.color}`, borderRadius: '0 10px 10px 0', padding: '12px 15px' }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: s.color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Action</p>
                <p style={{ fontSize: 13.5, color: SHELL.text1, lineHeight: 1.72 }}>{top.action}</p>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 14, color: SHELL.text3 }}>No priority actions found.</p>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: 'rgba(0,0,0,0.07)', alignSelf: 'stretch', flexShrink: 0 }}/>

        {/* RIGHT — CTA */}
        <div style={{ flex: '0 0 auto', width: 190, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: SHELL.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Start here</p>
          <button
            className="ytg-dash-btn-primary"
            onClick={() => { onNavigate(ctaNav); dismiss() }}
            style={{ width: '100%', justifyContent: 'center', fontSize: 14 }}
          >
            {ctaLabel}
          </button>
          <button
            onClick={dismiss}
            style={{
              fontSize: 12, color: '#9ca3af', textAlign: 'center',
              cursor: 'pointer', background: 'none', border: 'none',
              fontFamily: 'inherit', textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            See full audit
          </button>
        </div>

      </div>
    </div>
  )
}

/* ─── Dashboard ─────────────────────────────────────────────────────────── */
