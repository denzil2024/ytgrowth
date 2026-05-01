import FeaturePage from '../FeaturePage'

/* Custom mockup — title scoring panel matching the dark visual style. */
function Visual() {
  return (
    <div className="ftr-feature-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#ff3b30', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 16 }}>Sample · Title scoring</p>
        <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 30, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.12, marginBottom: 18, color: '#ffffff' }}>Title and description optimization that <span style={{ color: '#ff3b30' }}>actually moves rankings.</span></h3>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72 }}>
          Score every title against search demand, keyword fit, hook strength, length, and your competitors' winning formats. Apply optimized versions to YouTube with one click — no copy-pasting between tabs.
        </p>
      </div>
      <div style={{ background: '#111114', borderRadius: 20, border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 48px rgba(0,0,0,0.6)', padding: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Your title</p>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, padding: '12px 14px', marginBottom: 14, fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>
          How I doubled my YouTube views in 30 days
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
          <span style={{ fontSize: 44, fontWeight: 800, color: '#f59e0b', letterSpacing: '-2px', lineHeight: 1 }}>62</span>
          <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.35)' }}>/100</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', padding: '3px 9px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Needs work</span>
        </div>
        {[
          { label: 'Search demand match', score: 78, color: '#4ade80' },
          { label: 'Hook strength',       score: 54, color: '#f59e0b' },
          { label: 'Keyword position',    score: 42, color: '#ff3b30' },
          { label: 'Length (CTR)',        score: 88, color: '#4ade80' },
        ].map((row, i) => (
          <div key={i} style={{ marginBottom: i < 3 ? 11 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{row.score}</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${row.score}%`, background: row.color, borderRadius: 100 }} />
            </div>
          </div>
        ))}
        <div style={{ borderLeft: '3px solid #4ade80', background: 'rgba(74,222,128,0.07)', borderRadius: 8, padding: '12px 14px', marginTop: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Suggested rewrite · Score 91</p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.55, fontWeight: 500 }}>I Doubled My YouTube Views in 30 Days (Step-by-Step)</p>
        </div>
      </div>
    </div>
  )
}

export default function SeoStudio() {
  return (
    <FeaturePage
      heroLabel="SEO Studio"
      heroHeadline={<>YouTube SEO that actually moves <span style={{ color: 'var(--ytg-accent)' }}>search rankings.</span></>}
      heroSub="Score every title against real search demand, keyword fit, hook strength, length, and the winning patterns from competitors in your niche. Optimize descriptions for discovery. Apply changes back to YouTube with one click via the official API."
      primaryCta="Try SEO Studio free"
      visual={<Visual />}
      visualDark={true}
      howItWorks={[
        {
          title: 'Paste or pick a video',
          body: 'Either paste a draft title to score before publishing, or pick an existing upload from your library to optimize after the fact.',
        },
        {
          title: 'AI scores it across 5 dimensions',
          body: 'Search demand match, keyword position, hook strength, length, and competitor pattern fit — each scored 0–100 so you know exactly what is weak.',
        },
        {
          title: 'Apply the optimized version',
          body: 'AI generates 3 rewrites scored against the same model. Pick the one you like, hit Apply, and the change goes to YouTube via the official API. No copy-pasting tabs.',
        },
      ]}
      whatYouGet={[
        { title: 'Title scoring across 5 dimensions',     body: 'Search demand fit, keyword position, hook strength, length sweet spot, and how your title compares to the format competitors are actually winning with.' },
        { title: 'AI rewrite suggestions',                body: '3 candidate rewrites per video, each pre-scored. Pick the one that fits your voice — keyword position is fixed, hook is sharper, length lands in the CTR sweet spot.' },
        { title: 'Description optimization',              body: 'Score and rewrite descriptions for discoverability. Keyword surfacing in the first 150 characters, link block placement, hashtag suggestions, and length scoring.' },
        { title: 'Featured hashtags from your niche',     body: 'Auto-suggested tags based on what your top-performing competitors actually use — not generic high-volume noise tags.' },
        { title: 'One-click apply to YouTube',            body: 'Authorized via the official YouTube Data API. We update your title and description in place — no tabs, no copy-paste, no risk of pasting into the wrong field.' },
        { title: 'Full edit history',                     body: 'Every score and edit logged per video. Run an audit later to see whether the optimization actually moved views, CTR, and search impressions.' },
      ]}
      whoItsFor={[
        { title: 'Creators publishing weekly+',     body: 'If you ship 4+ videos a month, the difference between a 70-score title and a 90-score title compounds into 1000s of extra views per quarter.' },
        { title: 'Channels stuck on traffic',       body: 'If "Browse" is your dominant traffic source and "Search" is below 15%, your titles are not earning impressions. SEO Studio is the fastest fix.' },
        { title: 'Old upload libraries',            body: 'Got 50+ videos buried in your archive? Run them through SEO Studio one by one — old videos with optimized titles get re-surfaced by the algorithm and find new audiences.' },
      ]}
      faq={[
        {
          q: 'How does SEO Studio know what "good" looks like?',
          a: 'Two layers. First, a search-demand model trained on YouTube\'s autocomplete + actual search volume signals — so it knows whether your keyword has demand. Second, the model checks how the title format compares to the highest-CTR videos in your niche over the last 90 days. If your format consistently underperforms what wins in your niche, the score reflects that.',
        },
        {
          q: 'Will the rewrites still sound like me?',
          a: 'Yes. The AI looks at your existing top videos and uses your voice as a starting point. The rewrite changes structure (keyword position, hook, length), not personality. You also get 3 options per title so you can pick the one that fits.',
        },
        {
          q: 'What happens if I do not like a rewrite?',
          a: 'Nothing. Hit "Regenerate" for 3 new options, or just keep your original — nothing applies until you click Apply. We never auto-update your videos.',
        },
        {
          q: 'Can I optimize old videos that are already live?',
          a: 'Yes — and this is one of the most underrated uses. Old videos with optimized titles often re-trigger algorithmic distribution. We track before/after stats per optimized video so you can see the lift.',
        },
        {
          q: 'Does it work for Shorts?',
          a: 'Yes. The scoring model treats Shorts separately because the title-vs-CTR dynamics differ from long-form. Recommendations adjust automatically based on whether the video is Shorts or long-form.',
        },
      ]}
      bottomHeadline="Stop guessing what titles work"
      bottomSub="Score your next title in 10 seconds. Free to start, no credit card required."
    />
  )
}
