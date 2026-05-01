import FeaturePage from '../FeaturePage'

/* Custom mockup — keyword table matching the dark visual style. */
function Visual() {
  const rows = [
    { kw: 'youtube channel audit',       vol: '8.1K', diff: 'Low',    color: '#4ade80', score: 87 },
    { kw: 'how to grow on youtube 2026', vol: '14K',  diff: 'Med',    color: '#f59e0b', score: 71 },
    { kw: 'youtube seo guide',           vol: '22K',  diff: 'High',   color: '#ff3b30', score: 42 },
    { kw: 'best thumbnail tools',        vol: '6.4K', diff: 'Low',    color: '#4ade80', score: 81 },
    { kw: 'tube buddy alternatives',     vol: '3.2K', diff: 'Low',    color: '#4ade80', score: 79 },
  ]
  return (
    <div className="ftr-feature-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
      <div style={{ background: '#111114', borderRadius: 20, border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 48px rgba(0,0,0,0.6)', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Search · "youtube growth"</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>5 of 47 keywords · sorted by opportunity</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 60px 60px 50px', padding: '10px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          <div>Keyword</div>
          <div style={{ textAlign: 'right' }}>Vol</div>
          <div style={{ textAlign: 'right' }}>Diff</div>
          <div style={{ textAlign: 'right' }}>Score</div>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.6fr 60px 60px 50px', padding: '11px 24px', alignItems: 'center', borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>{r.kw}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.vol}</div>
            <div style={{ textAlign: 'right' }}><span style={{ fontSize: 10, fontWeight: 700, color: r.color, background: `${r.color}1f`, border: `1px solid ${r.color}40`, padding: '2px 7px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.diff}</span></div>
            <div style={{ fontSize: 13, fontWeight: 700, color: r.color, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.score}</div>
          </div>
        ))}
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#ff3b30', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 16 }}>Sample · Keyword research</p>
        <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 30, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.12, marginBottom: 18, color: '#ffffff' }}>Find the keywords your competitors <span style={{ color: '#ff3b30' }}>aren't ranking for.</span></h3>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72 }}>
          Real search volume from YouTube's autocomplete + suggest API. Difficulty scoring based on actual top-ranking video competition. Opportunity score combines both — highest-score keywords are the ones you can realistically rank for.
        </p>
      </div>
    </div>
  )
}

export default function KeywordResearch() {
  return (
    <FeaturePage
      heroLabel="Keyword Explorer"
      heroHeadline={<>Find the YouTube keywords <span style={{ color: 'var(--ytg-accent)' }}>your competitors aren't ranking for.</span></>}
      heroSub="Search volume, competition, and ranking difficulty for any topic. Built on YouTube's actual search signals — not generic Google data. Surfaces low-competition / high-intent keywords that creators in your niche are missing."
      primaryCta="Explore keywords free"
      visual={<Visual />}
      visualDark={true}
      howItWorks={[
        {
          title: 'Enter a topic or seed keyword',
          body: 'Type any topic — "youtube growth", "react tutorial", "kettlebell workout". YTGrowth pulls the related keyword universe from YouTube\'s autocomplete and suggest endpoints.',
        },
        {
          title: 'See volume, difficulty, and opportunity',
          body: 'Each keyword scored on 3 axes: monthly search volume, ranking difficulty (based on the strength of currently-ranking videos), and opportunity score (volume / difficulty ratio).',
        },
        {
          title: 'Pick the wins',
          body: 'Sort by opportunity score and you see the keywords with real demand and beatable competition. Click any keyword to see who currently ranks for it and what their videos look like.',
        },
      ]}
      whatYouGet={[
        { title: 'Real YouTube search volume',           body: 'Volume comes from YouTube\'s autocomplete + suggest signals — not extrapolated from Google. So the numbers reflect what people actually type into YouTube\'s search bar, not Google search.' },
        { title: 'Ranking difficulty scoring',           body: 'Difficulty score based on subscriber count, upload velocity, and engagement of the channels currently in the top 10 results. A "Low" difficulty keyword means a small channel can realistically beat the incumbents.' },
        { title: 'Opportunity score (volume ÷ difficulty)',body: 'Single sortable score that combines volume and difficulty. The top of this list is where you should be publishing — high demand, beatable competition, all in one ranking.' },
        { title: 'Keyword universe expansion',           body: 'For every seed keyword, YTGrowth surfaces 30–60 related variations. Most creators stop at the obvious 5; the wins are usually 6–20 in.' },
        { title: 'Top 10 ranking videos per keyword',    body: 'Click any keyword to see who is currently winning it — channel, subs, video age, view velocity. So you know exactly what you are up against.' },
        { title: 'Keyword history per channel',          body: 'Every keyword you research is saved to your channel\'s history. Reopen past research without re-running queries (and re-spending credits).' },
      ]}
      whoItsFor={[
        { title: 'New channels (under 10K subs)',     body: 'Big keywords are unwinnable for small channels. Keyword Explorer surfaces the low-difficulty keywords with real demand — the ones that actually move your subscriber count.' },
        { title: 'Creators planning a content series', body: 'Map out a 10-video series in one session. Pick a topic cluster, find 10 low-competition keywords inside it, build the calendar.' },
        { title: 'Researchers and SEO teams',          body: 'For agencies running keyword research across multiple client channels, Keyword Explorer is faster and YouTube-native compared to bolting Google keyword tools onto YouTube planning.' },
      ]}
      faq={[
        {
          q: 'How is this different from VidIQ\'s keyword tool?',
          a: 'VidIQ\'s keyword scoring blends Google + YouTube signals heavily and is famously noisy — keywords show as "great" that nobody actually searches for on YouTube. YTGrowth pulls volume directly from YouTube\'s autocomplete + suggest, which mirrors what users actually type. The opportunity score is also more aggressive about weighting difficulty — so you don\'t spend a week on a keyword you can never rank for.',
        },
        {
          q: 'How accurate are the volume numbers?',
          a: 'Volume is a relative-strength signal, not absolute monthly searches. Two keywords with volume 14K vs 6K means one gets ~2.3x the search volume of the other on YouTube. We deliberately do not pretend to know exact search counts because YouTube has never published them — anyone who shows you "exactly 14,200 monthly searches" is making it up.',
        },
        {
          q: 'How is difficulty calculated?',
          a: 'For each keyword, we look at the top 10 currently-ranking videos and score the median channel by subscribers, upload cadence, and engagement velocity. A "Low" difficulty means most ranking channels are smaller than 50K subs and have moderate engagement — beatable. "High" means the top 10 are mostly 500K+ channels with strong velocity — usually not worth fighting unless you already have authority.',
        },
        {
          q: 'How many keywords can I research per month?',
          a: 'Free tier is view-only on a small sample. Solo gets 20 deep researches/month, Growth gets 50, Agency gets 150. Each "research" returns the full keyword universe for one seed — usually 30–60 keywords per query.',
        },
        {
          q: 'Does the data update?',
          a: 'Volume and difficulty are re-scored on every fresh query — no stale cached scores. We keep history so you can reopen past research without rerunning the API call (saves you credits).',
        },
      ]}
      bottomHeadline="Find your next ranking video"
      bottomSub="Free to start. Most users find at least 3 underutilized keywords in their niche on the first search."
    />
  )
}
