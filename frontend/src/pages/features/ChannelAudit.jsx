import FeaturePage from '../FeaturePage'

/* Visual lifted/adapted from Landing.jsx Section 1 (Channel Audit). */
function Visual() {
  const rows = [
    { label: 'CTR Health',          score: 82 },
    { label: 'Audience Retention',  score: 67 },
    { label: 'Content Strategy',    score: 71 },
    { label: 'SEO Discovery',       score: 54 },
    { label: 'Posting Consistency', score: 90 },
  ]
  return (
    <div className="ftr-feature-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#ff3b30', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 16 }}>Sample audit · Tech channel · 42K subs</p>
        <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 30, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.12, marginBottom: 18, color: '#ffffff' }}>10 dimensions. <span style={{ color: '#ff3b30' }}>One brutal honest assessment.</span></h3>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72 }}>
          Every score is benchmarked against the top 10% of channels in your subscriber bracket and niche. No vanity metrics, no "your channel is doing great" platitudes — just where you actually rank and what to fix first.
        </p>
      </div>
      <div style={{ background: '#111114', borderRadius: 20, border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 48px rgba(0,0,0,0.6)', padding: 28 }}>
        {rows.map((row, i) => {
          const color = row.score >= 75 ? '#4ade80' : row.score >= 60 ? '#60a5fa' : row.score >= 40 ? '#f59e0b' : '#ff3b30'
          return (
            <div key={i} style={{ marginBottom: i < rows.length - 1 ? 16 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>{row.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color }}>{row.score}</span>
              </div>
              <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${row.score}%`, background: color, borderRadius: 100 }} />
              </div>
            </div>
          )
        })}
        <div style={{ borderLeft: '3px solid var(--ytg-accent)', background: 'rgba(229,48,42,0.08)', borderRadius: 8, padding: '12px 16px', marginTop: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#ff3b30', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Priority fix</p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>SEO Discovery at 54. Competitors average 6.8% CTR. Fix thumbnail text contrast first.</p>
        </div>
      </div>
    </div>
  )
}

export default function ChannelAudit() {
  return (
    <FeaturePage
      heroLabel="AI Channel Audit"
      heroHeadline={<>The AI channel audit that tells you <span style={{ color: 'var(--ytg-accent)' }}>exactly what to fix first.</span></>}
      heroSub="Connect your YouTube channel and YTGrowth runs a 10-dimension audit covering traffic sources, retention, CTR, audience demographics, content strategy, SEO, thumbnails, and competitor positioning. The output is a ranked action list — not another dashboard you have to interpret."
      primaryCta="Audit my channel free"
      visual={<Visual />}
      visualDark={true}
      howItWorks={[
        {
          title: 'Connect your channel',
          body: 'Sign in with the Google account that owns your YouTube channel. Read-only access — we never touch your videos, comments, or settings.',
        },
        {
          title: 'AI runs the 10-dimension audit',
          body: 'Traffic sources, device split, demographics, posting cadence, CTR, retention, engagement, content strategy, SEO discovery, and competitor benchmarking — all scored in ~60 seconds.',
        },
        {
          title: 'Get a prioritized action list',
          body: 'Every fix is ranked by impact and tagged with a severity. Start at the top, work your way down. No guessing what matters most.',
        },
      ]}
      whatYouGet={[
        { title: 'Health scores across 10 dimensions',     body: 'CTR, retention, posting consistency, SEO, engagement quality, content strategy fit, audience match, competitor positioning, thumbnail health, and traffic mix — each scored 0–100 against your subscriber bracket.' },
        { title: 'Traffic source breakdown',                body: 'Search vs Browse vs External vs Suggested — see where views actually come from and which sources are stalling.' },
        { title: 'Audience demographics + device split',    body: 'Who watches you (age, gender, geography) and how (mobile vs desktop vs TV). Critical for thumbnail and pacing decisions.' },
        { title: 'Posting cadence analysis',                body: 'Whether your upload pattern matches what works in your niche, and what to change if not.' },
        { title: 'Real competitor benchmarks',              body: 'Your scores compared against top 10% of channels in your niche and subscriber bracket — not against generic YouTube averages.' },
        { title: 'Priority action list',                    body: 'Every finding turns into a ranked, severity-tagged fix. Apply them in order and your channel score improves over time, measurably.' },
      ]}
      whoItsFor={[
        { title: 'Solo creators (1K–100K subs)',  body: 'Ditch the generic "post consistently!" advice and find the actual bottlenecks holding your channel back this month.' },
        { title: 'Multi-channel operators',       body: 'Run audits across all your channels in one workspace. Spot which one needs attention before its growth stalls.' },
        { title: 'Coaches and consultants',       body: 'Use YTGrowth as your diagnostic tool with clients. Charge for strategy, not for spending two hours pulling data into spreadsheets.' },
      ]}
      faq={[
        {
          q: 'How is this different from VidIQ or TubeBuddy?',
          a: 'VidIQ and TubeBuddy show you data and let you interpret it. YTGrowth runs an AI audit on top of the same data and tells you specifically what to change, in what order, and why. It replaces the kind of report a YouTube growth consultant would charge $300–$500 for.',
        },
        {
          q: 'How long does an audit take?',
          a: 'Around 60 seconds end-to-end. We pull your YouTube data via the official API, run the 10-dimension scoring in parallel, then synthesize the priority action list with our AI layer. You watch a progress bar, not a spinner.',
        },
        {
          q: 'Do I get unlimited audits?',
          a: 'Free tier gets 3 lifetime audits. Solo gets 20/month, Growth gets 50/month, Agency gets 150/month. Re-auditing the same channel after you implement fixes is the most useful pattern — that is how you measure whether the changes worked.',
        },
        {
          q: 'Will you change anything on my channel?',
          a: 'No. We have read-only access. The audit reads your stats, your videos, your demographics — but it cannot upload, edit, comment, or delete anything. The only way YTGrowth ever changes your channel is when you explicitly hit "Apply" on an SEO Studio recommendation.',
        },
        {
          q: 'What if my channel is brand new?',
          a: 'You need at least 5 published videos and ~30 days of channel history for the audit to be meaningful. Below that the data is too thin to score reliably — we will tell you that upfront and let you wait until you have enough.',
        },
      ]}
      bottomHeadline="See what your channel is missing"
      bottomSub="Free to start, no credit card. The first audit is on us — most users find their #1 fix in the first 5 minutes."
    />
  )
}
