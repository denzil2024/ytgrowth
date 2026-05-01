import FeaturePage from '../FeaturePage'

/* Visual lifted/adapted from Landing.jsx Section 2 (Competitor Intelligence). */
function Visual() {
  return (
    <div className="ftr-feature-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
      <div style={{ background: '#ffffff', borderRadius: 20, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-xl)', padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(10,10,15,0.05)', border: '2px solid rgba(10,10,15,0.08)', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ytg-text)' }}>TechCreator Pro</p>
              <p style={{ fontSize: 12, color: 'var(--ytg-text-3)' }}>142K subscribers · 4.6% CTR</p>
            </div>
          </div>
          <span style={{ background: 'rgba(229,48,42,0.08)', color: 'var(--ytg-accent)', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(229,48,42,0.25)' }}>HIGH THREAT</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
          <div style={{ borderLeft: '3px solid #d97706', background: 'rgba(217,119,6,0.05)', borderRadius: 8, padding: '12px 14px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Content gap</p>
            <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.55 }}>Tutorial content — 0 videos in last 90 days. You publish 4/month. Big opening.</p>
          </div>
          <div style={{ borderLeft: '3px solid #16a34a', background: 'rgba(22,163,74,0.05)', borderRadius: 8, padding: '12px 14px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Title opportunity</p>
            <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.55 }}>"How to [niche topic] in 2026 (Step by Step)" — averages 84K views in your niche. They have not used it.</p>
          </div>
          <div style={{ borderLeft: '3px solid #2563eb', background: 'rgba(37,99,235,0.05)', borderRadius: 8, padding: '12px 14px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Posting pattern</p>
            <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.55 }}>Tuesday 4pm EST — their highest-CTR slot. You post Sundays.</p>
          </div>
        </div>
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ytg-accent)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 16 }}>Sample report · Tech niche</p>
        <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 30, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.12, marginBottom: 18, color: 'var(--ytg-text)' }}>Find the gaps your competitors <span style={{ color: 'var(--ytg-accent)' }}>leave open.</span></h3>
        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>
          Connect a competitor's channel and YTGrowth maps exactly which topics they ignore, which title patterns drive their best videos, and where their audience is underserved. Then shows you how to own those gaps.
        </p>
      </div>
    </div>
  )
}

export default function CompetitorAnalysis() {
  return (
    <FeaturePage
      heroLabel="Competitor Analysis"
      heroHeadline={<>See exactly what your competitors are doing right — <span style={{ color: 'var(--ytg-accent)' }}>and where they're leaving openings.</span></>}
      heroSub="Pick 2–10 channels in your niche. YTGrowth analyzes their last 30+ uploads and surfaces the patterns that explain why they're outperforming you — title formats, thumbnail styles, posting times, content gaps. Then turns each gap into a ranked opportunity you can take."
      primaryCta="Start tracking competitors"
      visual={<Visual />}
      visualDark={false}
      howItWorks={[
        {
          title: 'Add competitor channels',
          body: 'Paste any YouTube channel URL or handle. Up to 2 on Solo, 5 on Growth, 10 on Agency. You can swap them out anytime.',
        },
        {
          title: 'AI analyzes their last 30 uploads',
          body: 'We pull their published videos, scrape title patterns, score thumbnails, map posting cadence, and benchmark engagement against the niche baseline.',
        },
        {
          title: 'Get a gap report + ready ideas',
          body: 'Threat level, content gaps, winning title patterns, posting windows, and a list of ready-to-publish video ideas based on what they have not covered yet.',
        },
      ]}
      whatYouGet={[
        { title: 'Threat level per competitor',           body: 'Each competitor scored Low / Medium / High based on subscriber overlap, posting frequency, and topic similarity. Focus your time on the ones actually pulling your audience.' },
        { title: 'Topic gap analysis',                    body: 'Topics they could be covering but aren\'t — broken down by search demand and your content fit. The clearest path to videos your audience already wants.' },
        { title: 'Winning title pattern extraction',      body: 'Which title formats consistently outperform their channel average. Steal the format, plug in your topic, ship.' },
        { title: 'Thumbnail style breakdown',             body: 'Color palettes, text density, face usage — what their highest-CTR thumbnails have in common, so you can match the visual contract their audience expects.' },
        { title: 'Posting time analysis',                 body: 'When their best-performing videos go live. Useful for finding their habits and either matching them or deliberately avoiding the slot.' },
        { title: 'Ready-to-use video ideas',              body: 'Each gap turns into 3–5 fully-formed video ideas with working titles, target keywords, and rationale.' },
      ]}
      whoItsFor={[
        { title: 'Creators with 2–10 direct rivals',  body: 'You know who you compete with. Stop guessing why they pull more views — get a structured breakdown in 90 seconds.' },
        { title: 'Niche channels',                     body: 'In a tight niche, every uncovered topic is yours for the taking. Spot them before another channel does.' },
        { title: 'Agencies pitching new clients',     body: 'Run a competitor analysis on a prospect\'s top rivals before the sales call. Show up with a strategy, not a deck of generic tips.' },
      ]}
      faq={[
        {
          q: 'Do I need permission to analyze a competitor\'s channel?',
          a: 'No. We only read public data — what is on their channel page and what the YouTube API exposes. We never scrape private analytics or pretend to be them. The same data is visible to anyone visiting their channel.',
        },
        {
          q: 'How fresh is the competitor data?',
          a: 'Real-time on first analysis, then re-fetched every 24 hours. So if a competitor uploads tonight, the data reflects it by tomorrow morning. You can trigger a manual refresh anytime if a competitor just posted something big.',
        },
        {
          q: 'Can I track channels outside my niche?',
          a: 'Yes, but the analysis is most useful for channels you actually compete with. Tracking a tangentially-related channel just generates noise. The threat-level scoring helps you weed out competitors who are not really competitors.',
        },
        {
          q: 'How many competitors should I track?',
          a: 'Start with 2–3 of your closest rivals. Adding more dilutes attention. Most users find that 3 well-chosen competitors generate more actionable insight than 10 loosely-related ones.',
        },
        {
          q: 'Does this work for shorts-first channels?',
          a: 'Yes — the analysis treats Shorts and long-form separately so the patterns do not get mixed. If a competitor publishes both, you see two separate breakdowns.',
        },
      ]}
      bottomHeadline="See what your competitors miss"
      bottomSub="Free to start. The first competitor analysis is on us — most users find their first publishable idea inside 10 minutes."
    />
  )
}
