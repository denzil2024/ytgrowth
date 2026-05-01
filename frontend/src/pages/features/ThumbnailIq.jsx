import FeaturePage from '../FeaturePage'

/* Visual lifted/adapted from Landing.jsx Section 3 (Thumbnail IQ). */
function Visual() {
  return (
    <div className="ftr-feature-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#ff3b30', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 16 }}>Sample · Thumbnail score</p>
        <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 30, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.12, marginBottom: 18, color: '#ffffff' }}>Scored against the videos <span style={{ color: '#ff3b30' }}>actually winning in your niche.</span></h3>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72 }}>
          Two layers — a deterministic algorithm checking contrast, text clarity, faces, and composition; then a vision model comparing it against the top-performing thumbnails in your exact niche over the last 90 days.
        </p>
      </div>
      <div style={{ background: '#111114', borderRadius: 20, border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 48px rgba(0,0,0,0.6)', padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 20 }}>
          <span style={{ fontSize: 56, fontWeight: 800, color: '#4ade80', letterSpacing: '-2px', lineHeight: 1 }}>74</span>
          <span style={{ fontSize: 22, fontWeight: 400, color: 'rgba(255,255,255,0.35)' }}>/100</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', padding: '3px 9px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Above niche avg</span>
        </div>
        {[
          { label: 'Algorithm score', value: '42 / 60' },
          { label: 'Vision score',    value: '32 / 40' },
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 0' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{row.label}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>{row.value}</span>
          </div>
        ))}
        <div style={{ borderLeft: '3px solid var(--ytg-accent)', background: 'rgba(229,48,42,0.08)', borderRadius: 8, padding: '12px 16px', marginTop: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#ff3b30', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Priority fix</p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 }}>Text too small for mobile — increase font weight or reduce to 4 words max.</p>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>Top thumbnails in your niche average 81/100</p>
      </div>
    </div>
  )
}

export default function ThumbnailIq() {
  return (
    <FeaturePage
      heroLabel="Thumbnail IQ"
      heroHeadline={<>Thumbnail scoring against the videos <span style={{ color: 'var(--ytg-accent)' }}>actually winning in your niche.</span></>}
      heroSub="Two layers of analysis. An algorithm checks contrast, text clarity, face detection, and composition. A vision model compares your thumbnail against the highest-CTR videos in your exact niche over the last 90 days. Score out of 100, with specific fixes."
      primaryCta="Score my thumbnail"
      visual={<Visual />}
      visualDark={true}
      howItWorks={[
        {
          title: 'Upload or pick a thumbnail',
          body: 'Drag-and-drop a draft thumbnail before you publish, or pick one from your existing video library to score after the fact.',
        },
        {
          title: 'Two-layer AI analysis runs',
          body: 'The algorithm layer checks contrast ratios, text size for mobile, face placement, and composition rules. The vision layer compares against top-performing thumbnails in your niche over the last 90 days.',
        },
        {
          title: 'Get a score out of 100 + specific fixes',
          body: 'Every weak area gets a concrete fix — "text below 8% of frame height", "background contrast 2.1:1, target 4.5:1+", "no face in frame, niche standard is 73% with face". You know exactly what to change.',
        },
      ]}
      whatYouGet={[
        { title: 'Two-layer scoring (algorithm + vision)',  body: 'Algorithm catches the rule-based stuff (contrast, text size, composition). Vision model catches the niche-specific stuff (style match, color palette, emotion match). Together they reach what a human designer would catch.' },
        { title: 'Niche-specific benchmarks',                body: 'Your score is compared against the actual top performers in your subscriber bracket and topic niche — not a generic "good thumbnail" template. Cooking thumbnails are scored differently than tech ones.' },
        { title: 'Mobile readability check',                 body: '74% of YouTube watch time is mobile. We render your thumbnail at mobile size and check whether the text is still readable. Most failed thumbnails fail this single check.' },
        { title: 'Face / object detection',                  body: 'Whether your thumbnail has a face (and how prominent it is) heavily affects CTR in most niches. We score it and tell you whether your niche\'s top performers use faces or not.' },
        { title: 'Specific, actionable fixes',               body: 'No generic "improve contrast" advice. We tell you "background contrast is 2.1:1, target 4.5:1, try shifting the subject left so the dark background fills 60% of the right side."' },
        { title: 'Full thumbnail history',                   body: 'Every thumbnail you score is logged with its score and the video\'s eventual CTR. Over time you see which design choices actually move CTR for your specific channel.' },
      ]}
      whoItsFor={[
        { title: 'Creators with low CTR (under 4%)',        body: 'CTR under 4% almost always means the thumbnail is the bottleneck, not the title. Score every thumbnail before you publish and the average creeps up over months.' },
        { title: 'A/B testing without YouTube\'s tools',     body: 'Score 3–4 thumbnail variants and pick the highest-scoring one before you ship. The free YouTube A/B test takes 2 weeks; this takes 2 minutes.' },
        { title: 'Designers handing off to creators',       body: 'If a designer ships a thumbnail, run it through Thumbnail IQ before signing off. Catches mobile readability and contrast issues that look fine at desktop scale.' },
      ]}
      faq={[
        {
          q: 'How does the niche benchmark work?',
          a: 'When you connect your channel, we identify your niche from your topic mix and your competitor set. The vision model then compares your thumbnail against the highest-CTR videos in that exact niche over the last 90 days — so you\'re benchmarked against what works for your audience, not a generic YouTube average.',
        },
        {
          q: 'What\'s the difference between the algorithm score and the vision score?',
          a: 'Algorithm score (out of 60) is deterministic — contrast ratios, text size for mobile, composition rules, face detection. Same image always gets the same score. Vision score (out of 40) is the AI judging style fit against your niche\'s winners. Together they make a 100-point score that catches both rule-based and aesthetic issues.',
        },
        {
          q: 'Can I score thumbnails for videos already live?',
          a: 'Yes. Pick any video from your library and we score its current thumbnail. Useful for spotting under-performing videos whose thumbnail is the actual bottleneck — you can update the thumbnail in YouTube Studio and often see CTR climb within days.',
        },
        {
          q: 'How accurate is the score vs actual CTR?',
          a: 'The score correlates strongly with CTR within a niche — high-scoring thumbnails systematically outperform low-scoring ones for the same channel. It is not a perfect predictor (title and content matter too), but it consistently identifies the thumbnails that need work before they hurt your channel.',
        },
        {
          q: 'Do you store my thumbnail uploads?',
          a: 'We store thumbnails you upload so we can show you the history. We never use them to train models or share them with anyone. You can delete any thumbnail (and its score) from your dashboard.',
        },
      ]}
      bottomHeadline="See what your thumbnail is worth"
      bottomSub="Free credits to start. Score a thumbnail in under 10 seconds — no credit card."
    />
  )
}
