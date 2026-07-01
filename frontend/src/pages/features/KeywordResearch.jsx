import { useEffect, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import { injectFaqJsonLd } from '../../utils/seo'

/* Keyword Research feature page. Migrated to the editorial design language
   (Fraunces + Barlow, sharp flat cards, warm paper, restrained red). The old
   white→dark→light rhythm is now predominantly warm paper; the keyword table
   and score breakdown stay dark "app preview" panes (on-dark accents use warm
   gold #e6b35c, since red goes muddy on near-black). Foreign green/amber/blue
   tints neutralised to ink/accent/gold, output icons are neutral ink, body
   italics removed, bottom CTA removed. ALL copy, FAQs, score signals, and
   product detail preserved. Classes use the .kwr- prefix to avoid collision
   with the in-app Keywords product page. See project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"
/* On-dark accent. Red goes muddy on near-black, so the dark "app preview"
   panes use a warm gold (the Zennara-lineage on-dark tone) instead. */
const GOLD = '#e6b35c'

function useBreakpoint() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return { isMobile: w <= 768, isTablet: w <= 1024 }
}

function useStyles() {
  useEffect(() => {
    if (document.getElementById('kwr-styles')) return
    const style = document.createElement('style')
    style.id = 'kwr-styles'
    style.textContent = `
      :root {
        --yte-bg: #f6f4ef; --yte-bg-2: #efece4; --yte-surface: #ffffff;
        --yte-ink: #14130f; --yte-soft: #5c574e; --yte-muted: #8a8378;
        --yte-line: rgba(20,19,15,0.12); --yte-line-2: rgba(20,19,15,0.22);
        --yte-accent: #e5302a; --yte-accent-soft: rgba(229,48,42,0.07); --yte-dark: #0d0d12;
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; scroll-padding-top: 84px; }
      body { background: var(--yte-bg); color: var(--yte-ink); font-family: ${SANS}; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
      @keyframes kwrFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .kwr-wrap { max-width: 1120px; margin: 0 auto; }
      .kwr-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .kwr-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .kwr-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .kwr-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.05; }
      .kwr-h1 em { font-style: italic; color: var(--yte-accent); }
      .kwr-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .kwr-h2 em { font-style: italic; color: var(--yte-accent); }
      .kwr-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .kwr-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--yte-accent); color: #fff; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 15px 30px; border: none; border-radius: 0; cursor: pointer; text-decoration: none; transition: filter 0.18s, transform 0.18s; }
      .kwr-btn:hover { filter: brightness(1.06); transform: translateY(-1px); }
      .kwr-btn-lg { font-size: 13px; padding: 17px 36px; }
      .kwr-ghost { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 15px 28px; border-radius: 0; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--yte-soft); text-decoration: none; background: var(--yte-surface); border: 1px solid var(--yte-line); transition: color 0.15s, border-color 0.15s; }
      .kwr-ghost:hover { color: var(--yte-ink); border-color: var(--yte-line-2); }

      .kwr-faq-item { border-bottom: 1px solid var(--yte-line); }
      .kwr-faq-q { background: none; border: none; cursor: pointer; width: 100%; text-align: left; padding: 22px 0; font-family: ${SERIF}; display: flex; justify-content: space-between; align-items: center; gap: 18px; font-size: 20px; font-weight: 400; color: var(--yte-ink); letter-spacing: -0.2px; line-height: 1.3; transition: color 0.2s; }
      .kwr-faq-q:hover { color: var(--yte-accent); }
      .kwr-faq-q.open { color: var(--yte-accent); }
      .kwr-faq-plus { flex-shrink: 0; font-family: ${SANS}; font-size: 26px; font-weight: 300; color: var(--yte-accent); line-height: 1; transition: transform 0.2s; }
      .kwr-faq-plus.open { transform: rotate(45deg); }
      .kwr-faq-a { font-family: ${SANS}; font-size: 15.5px; color: var(--yte-soft); line-height: 1.78; padding: 0 0 24px 0; max-width: 720px; display: none; }
      .kwr-faq-a.open { display: block; }
      .kwr-faq-a b { font-weight: 600; color: var(--yte-ink); }
      .kwr-faq-a a { color: var(--yte-accent); font-weight: 600; text-decoration: none; }

      @media (max-width: 900px) {
        .kwr-grid-2 { grid-template-columns: 1fr !important; gap: 36px !important; }
        .kwr-grid-3 { grid-template-columns: 1fr !important; }
        .kwr-grid-4 { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 600px) {
        .kwr-grid-4 { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 768px) {
        .kwr-section-pad { padding-left: 22px !important; padding-right: 22px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children, center }) {
  return (
    <div className="kwr-eyebrow" style={center ? { justifyContent: 'center' } : undefined}>
      <span aria-hidden="true" className="kwr-eyebrow-rule" />
      <span className="kwr-eyebrow-text">{children}</span>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="kwr-faq-item">
      <button className={`kwr-faq-q${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span style={{ flex: 1 }}>{q}</span>
        <span aria-hidden="true" className={`kwr-faq-plus${open ? ' open' : ''}`}>+</span>
      </button>
      <div className={`kwr-faq-a${open ? ' open' : ''}`}>{a}</div>
    </div>
  )
}

/* ── Visual: Keyword opportunity table with score + momentum (dark pane) ── */
function KeywordTableVisual() {
  const rows = [
    { kw: 'home office cleaning vlog',  score: 91, mom: 'unclaimed', diff: 'EASY', cluster: 'Vlog' },
    { kw: 'minimalist desk setup tour', score: 84, mom: 'active',    diff: 'EASY', cluster: 'Setup' },
    { kw: 'small bedroom organization',  score: 78, mom: 'steady',   diff: 'FAIR', cluster: 'Vlog' },
    { kw: 'cleaning routine motivation', score: 72, mom: 'active',    diff: 'FAIR', cluster: 'Routine' },
    { kw: 'studio apartment cleaning',   score: 68, mom: 'unclaimed', diff: 'EASY', cluster: 'Vlog' },
    { kw: 'how to deep clean apartment', score: 54, mom: 'steady',   diff: 'HARD', cluster: 'Tutorial' },
  ]
  return (
    <div style={{ background: 'var(--yte-ink)', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14, gap: 12 }}>
        <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Top opportunities · seed "apartment cleaning"</p>
        <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: '0.04em', flexShrink: 0 }}>22 of 24 kept</span>
      </div>
      {/* Header row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 0.85fr 0.85fr 0.55fr', fontFamily: SANS, fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 0 8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <p>Keyword</p>
        <p>Momentum</p>
        <p>Difficulty</p>
        <p style={{ textAlign: 'right' }}>Score</p>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.4fr 0.85fr 0.85fr 0.55fr', alignItems: 'center', padding: '11px 0', borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', fontSize: 12 }}>
          <div style={{ paddingRight: 8, minWidth: 0 }}>
            <p style={{ fontFamily: SANS, color: 'rgba(255,255,255,0.92)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.kw}</p>
            <p style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(255,255,255,0.42)', marginTop: 2 }}>cluster · {r.cluster}</p>
          </div>
          <span style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.62)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{r.mom}</span>
          <span style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.62)', letterSpacing: '0.06em' }}>{r.diff}</span>
          <p style={{ textAlign: 'right', fontFamily: SERIF, fontWeight: 400, fontSize: 18, color: r.score >= 80 ? GOLD : 'rgba(255,255,255,0.92)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{r.score}</p>
        </div>
      ))}
      {/* Top pick */}
      <div style={{ borderLeft: `3px solid ${GOLD}`, background: 'rgba(230,179,92,0.08)', padding: '12px 14px', marginTop: 14 }}>
        <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Top pick</p>
        <p style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.92)', fontWeight: 600, marginBottom: 4 }}>"home office cleaning vlog"</p>
        <p style={{ fontFamily: SANS, fontSize: 11.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>Newest top-5 video is 220 days old · top creators &lt; 50K subs · clear topic gap.</p>
      </div>
    </div>
  )
}

/* ── Visual: Score breakdown. Feasibility / traffic / freshness (dark) ──── */
function ScoreBreakdownVisual() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[
        { label: 'Feasibility',  weight: 45, score: 100, body: 'Top-5 channels median &lt; 10K subs. Easy to outrank.' },
        { label: 'Traffic ceiling', weight: 30, score: 70, body: 'Top videos median 24K views. Solid headroom for a small channel.' },
        { label: 'Freshness',     weight: 25, score: 100, body: 'Newest top-5 video posted 220 days ago. Landscape is wide open.' },
      ].map((d, i) => (
        <div key={i} style={{ background: 'var(--yte-ink)', borderLeft: `3px solid ${GOLD}`, padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: '-0.2px' }}>{d.label}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}>weight {d.weight}%</span>
              <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 400, color: GOLD, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{d.score}</span>
            </div>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${d.score}%`, background: GOLD }} />
          </div>
          <p style={{ fontFamily: SANS, fontSize: 11.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: d.body }}/>
        </div>
      ))}
      <div style={{ background: 'var(--yte-ink)', border: `1px solid rgba(230,179,92,0.4)`, padding: '14px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>× intent multiplier (exact match)</p>
          <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: GOLD, fontVariantNumeric: 'tabular-nums' }}>×1.0</span>
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <p style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Final opportunity score</p>
          <span style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 400, color: GOLD, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>91</span>
        </div>
      </div>
    </div>
  )
}

/* ── Score signals. What the opportunity score is built from ─────────── */
const SCORE_SIGNALS = [
  { name: 'Feasibility (45% weight)',      what: 'Median subscriber count of the top 5 ranking channels. Below 10K subs scores 100 (easy to outrank). 10–100K = 75. 100K–1M = 45. Above 1M = 15 (brutal. Incumbent dominates).' },
  { name: 'Traffic ceiling (30% weight)',  what: 'Median view count of the top 5 ranking videos. 100K+ = 100 (strong traffic to win). 10K–100K = 70 (decent). Below 10K = 45 (thin, may not be worth pursuing).' },
  { name: 'Freshness (25% weight)',        what: 'Days since the most recent top-5 video. Below 30 days = 40 (active competition). 30–180 days = 70 (normal). 180+ days = 100 (landscape stale, opportunity wide open).' },
  { name: 'Intent match multiplier',       what: 'Exact intent = ×1.0. Strong = ×0.9. Partial = ×0.75. Off-intent drift gets scaled down even if the surface metrics look good. Keeps the score honest about what your video would really compete for.' },
  { name: 'Autocomplete rank bonus',       what: 'Where the keyword appears in YouTube’s autocomplete pool. Position 0–4 adds +8. Position 5–14 adds +4. Earlier autocomplete position is the strongest single signal that real viewers type the phrase.' },
  { name: 'Momentum label',                what: 'Active (newest top-5 video &lt; 30 days), Steady (30–180 days), Unclaimed (180+ days). Cheap badge on every keyword so you can see at a glance whether competitors are actively shipping.' },
]

const PIPELINE_OUTPUTS = [
  { icon: 'gauge',  title: 'Opportunity score 0–100',     body: 'Weighted on feasibility (45%) + traffic ceiling (30%) + freshness (25%), with an intent multiplier and autocomplete-rank bonus. Same formula every keyword. Explainable, repeatable.' },
  { icon: 'fan',    title: '15–25 filtered keywords',     body: 'Claude reads 30+ raw suggestions, drops off-topic / branded / duplicate, keeps only those that match your seed intent. Each one tagged with content angle and intent strength.' },
  { icon: 'cluster',title: '3–5 named clusters',          body: 'Keywords grouped into thematic clusters (e.g. "Tutorial · cleaning routines", "Vlog · room makeovers"). Tells you what 3-month content arc you could ship from one search.' },
  { icon: 'pulse',  title: 'Momentum tag per keyword',    body: 'Active (creators ship weekly) · Steady (normal) · Unclaimed (top videos &gt; 6 months old). Lets you spot landscapes nobody is currently fighting over.' },
  { icon: 'compass',title: 'Top pick + reason',           body: 'The single highest-opportunity keyword surfaced, with a one-sentence "why this one". So you stop scrolling and start scripting.' },
  { icon: 'tag',    title: 'Content angle per keyword',   body: 'Each kept keyword carries a one-sentence angle suggestion. Not a template. Anchored to the intent and the niche, so the angle reads as a video idea you’d publish.' },
  { icon: 'gap',    title: 'Real competition snapshot',   body: 'For the top 10 by initial score: result count, top-5 median subs, top-5 median views, days since newest. Live YouTube data, not estimated. Your score is built on these numbers.' },
]

const ICON_PATHS = {
  gauge:   'M3 11a5 5 0 0 1 10 0M8 8v3l2 2',
  fan:     'M8 2C5 2 3 4 3 8s2 6 5 6c2 0 3-1 4-3M8 2c3 0 5 2 5 6 0 1-1 2-2 2M8 14c-1-2-1-4 0-6 1-2 3-2 5 0',
  cluster: 'M3 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M13 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M8 14a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M4 4l3 7M12 4L9 11',
  pulse:   'M1 8h3l2-5 4 10 2-5h3',
  compass: 'M8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12M5 11l1.5-4.5L11 5l-1.5 4.5z',
  tag:     'M2 8l6-6 6 1 1 6-7 5-6-6zM10 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
  gap:     'M2 8h5M9 8h5M5 5l-3 3 3 3M11 5l3 3-3 3',
}

function OutputIcon({ name }) {
  return (
    <div style={{ width: 38, height: 38, background: 'rgba(20,19,15,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="var(--yte-ink)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d={ICON_PATHS[name]}/>
      </svg>
    </div>
  )
}

const PLAN_LIMITS = [
  { plan: 'Free',    runs: '1',   note: 'One full keyword search per cycle. Same engine as paid plans' },
  { plan: 'Solo',    runs: '20',  note: 'Search every video idea · 3 channels' },
  { plan: 'Growth',  runs: '50',  note: 'Same engine, higher monthly allowance · 5 channels' },
  { plan: 'Agency',  runs: '150', note: 'Pooled across 10 channels' },
]

const FAQS = [
  {
    q: 'Where does the search-volume signal come from? You don’t have YouTube’s real volume API.',
    a: <>Correct. YouTube doesn’t expose true search volume publicly. We use a multi-source proxy that’s genuinely close. We pull suggestions from YouTube’s own autocomplete (only surfaces high-volume queries by definition), Google’s autocomplete via SerpAPI, and Google’s "related searches" via Serper. The strongest signal is autocomplete rank. Earlier positions correlate strongly with real query volume because that’s how Google ranks them. We’re not estimating an exact monthly number; we’re ranking phrases by relative demand using signals YouTube’s own ranking engine uses.</>,
  },
  {
    q: 'How is "competition" calculated. And why isn’t it just "search result count"?',
    a: <>Result count alone is misleading: 50K results dominated by one mega-channel is easier to break into than 5K results split across small channels. So for the top 10 keywords from your search, we hit the YouTube Data API and pull the real top 5 ranking videos, then look up <b>median subscriber count</b> across those channels. Below 10K = easy. 10–100K = fair. 100K–1M = hard. Above 1M = brutal. Plus median views on those top 5 (your traffic ceiling) and days since the newest one was published (the freshness signal). Three real numbers, not a vague difficulty label.</>,
  },
  {
    q: 'What’s the "momentum" label? Is that Google Trends?',
    a: <>No. Pytrends and the paid Trends API are unreliable for niche queries. We derive momentum from data we already have: <b>active</b> (newest top-5 video &lt; 30 days = creators are shipping right now), <b>steady</b> (30–180 days = normal cadence), <b>unclaimed</b> (180+ days = nobody is actively fighting for this keyword). Unclaimed keywords are the highest-leverage gaps because the search demand exists but no recent video is competing for it.</>,
  },
  {
    q: 'How does the opportunity score work. What does 91/100 mean?',
    a: <>Score = (feasibility × 0.45 + traffic × 0.30 + freshness × 0.25) × intent multiplier + autocomplete bonus. Each component is 0–100. Feasibility rewards low top-5 channel size. Traffic rewards a strong view ceiling. Freshness rewards stale (i.e. open) landscapes. Intent multiplier (exact / strong / partial) keeps off-topic drift from inflating the score. So a 91 means the top 5 ranking channels are small AND their videos pull strong views AND nobody’s posted recently AND your seed intent matches exactly. The highest-leverage combination.</>,
  },
  {
    q: 'Why does Claude filter the keyword list before scoring?',
    a: <>Raw autocomplete + related-search dumps are noisy. They include branded queries ("VidIQ alternative" when you searched "youtube growth"), off-intent drift ("youtube to mp3" on a creator-tools search), and obvious duplicates. Claude reads all 30+ raw suggestions in one pass, drops the noise, keeps the 15–25 phrases that genuinely match your seed intent, and tags each with a content angle. The competition enrichment then runs only on those. Keeps API quota efficient and the final ranking clean.</>,
  },
  {
    q: 'How is this different from VidIQ or TubeBuddy?',
    a: <>Three differences worth knowing. First, our competition score uses real top-5 channel size + real view ceiling + real freshness. Not a global difficulty estimate. Second, every kept keyword carries a Claude-written content angle so you don’t leave the tool wondering what to make. Third, the momentum label surfaces unclaimed niches (top videos &gt; 6 months old) that legacy tools don’t flag. We’re not trying to replace global volume estimates; we’re replacing vague difficulty scores with a real-data view of who you’d compete with. For a full side-by-side of vidIQ, TubeBuddy, Keyword Tool IO, and the free options, see our <a href="/blog/youtube-keyword-research-tools">YouTube keyword research tools comparison</a>.</>,
  },
  {
    q: 'Will this work for international / non-English niches?',
    a: <>Mostly yes. The autocomplete sources (YouTube Suggest, SerpAPI, Serper) all return localized results when you seed in another language. So the keyword pool will be relevant. The Claude intent filtering works across languages. The competition enrichment is language-agnostic (it’s pulling raw API data). The one weak spot is the autocomplete-rank bonus, which calibrates best for English-language queries. For non-English the bonus contributes a smaller fraction of the final score. Still useful, just lean more on momentum + feasibility for non-English niches.</>,
  },
  {
    q: 'How long does a search take, and what does it cost?',
    a: <>~25–40 seconds end-to-end. Behind the scenes: YouTube Suggest scrape (parallel), SerpAPI autocomplete + Serper related-search (parallel), Claude Sonnet 4.6 intent filter + cluster, then YouTube Data API competition enrichment for the top 10 keywords (parallel, 5 workers). Each search is one credit on paid plans. Free creators get one full search per cycle. Same engine, no feature differences. Re-running the same seed charges a new credit because the competition data is fetched fresh.</>,
  },
  {
    q: 'Does the YouTube competition fetch use my OAuth quota?',
    a: <>No. That’s deliberate. The competition enrichment uses an anonymous YouTube Data API key on our side, not your OAuth credential. So even if you run 50 keyword searches in a day, your channel’s OAuth quota is untouched and remains fully available for the SEO Studio analyses, channel audits, and competitor analyses that <b>do</b> need read access to your private data.</>,
  },
  {
    q: 'Can I export the keyword list?',
    a: <>The keyword table stays inside your YTGrowth dashboard for now. Every search is saved per channel and reopens with full data + the original seed. PDF / CSV export is on the near-term roadmap; if it’s critical for an agency workflow email support and we’ll prioritize. The faster pattern most users find: copy the top 5 picks straight into the SEO Studio and run title rewrites against each one.</>,
  },
  {
    q: 'Are searches saved? Can I reopen them later?',
    a: <>Yes. Every search persists per channel and shows up in your search history with the seed keyword + timestamp. Click any past search to reopen the full table. Keywords, scores, momentum tags, clusters, top pick, competition snapshots. Re-running an old seed creates a fresh entry instead of overwriting, so you can compare how a niche has shifted over time.</>,
  },
  {
    q: 'Does Keyword Research feed into the other tools?',
    a: <>Yes. The keyword data is shared infrastructure. The SEO Studio reuses the same intent-options + autocomplete fan-out for its title scoring. The Outliers feature uses the same intent picker for its viral video search. The clusters from Keyword Research can be sent straight into Competitor Analysis as the niche keyword set. Every tool gets sharper the more keyword searches you run.</>,
  },
]

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function KeywordResearch() {
  useStyles()
  useEffect(() => { injectFaqJsonLd(FAQS) }, [])
  const { isMobile } = useBreakpoint()

  const H2 = isMobile ? 30 : 42

  return (
    <div style={{ background: 'var(--yte-bg)', minHeight: '100vh', fontFamily: SANS, color: 'var(--yte-ink)' }}>

      {/* ════ NAV ════ */}
      <SiteHeader />

      {/* ════ 1. HERO ════ */}
      <section className="kwr-section-pad" style={{ padding: isMobile ? '60px 22px 48px' : '104px 48px 64px', background: 'var(--yte-bg)' }}>
        <div className="kwr-wrap" style={{ animation: 'kwrFadeUp 0.5s ease both' }}>
          <Eyebrow>YouTube Keyword Research</Eyebrow>
          <h1 className="kwr-h1" style={{ fontSize: isMobile ? 34 : 56, marginBottom: 22, maxWidth: 940, textWrap: 'balance' }}>
            Keyword research that uses <em>real competition data, not vibes.</em>
          </h1>
          <p className="kwr-lead" style={{ fontSize: isMobile ? 16 : 17.5, maxWidth: 720, marginBottom: 32, textWrap: 'pretty' }}>
            Type a seed. The studio fans out across YouTube Suggest, Google autocomplete, and Google related searches, filters with AI to keep only on-intent phrases, then scores each one against the real top 5 ranking channels. Their median subscriber count, view ceiling, and how stale the landscape is. The keywords your niche is missing, surfaced in 30 seconds.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/auth/login" className="kwr-btn kwr-btn-lg">Find a keyword →</a>
            <a href="#how" className="kwr-ghost">See how it works</a>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', marginTop: 22, letterSpacing: '0.03em' }}>
            Free creators get one full search per cycle · ~30 seconds end-to-end · all signals from real YouTube data
          </p>
        </div>
      </section>

      {/* ════ 2. KEYWORD TABLE (split) ════ */}
      <section className="kwr-section-pad" style={{ padding: isMobile ? '64px 22px' : '88px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="kwr-grid-2 kwr-wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 56, alignItems: 'center' }}>
          <div>
            <Eyebrow>The keyword table</Eyebrow>
            <h2 className="kwr-h2" style={{ fontSize: H2, marginBottom: 18 }}>
              15–25 keywords <em>scored on what really moves rankings.</em>
            </h2>
            <p className="kwr-lead" style={{ fontSize: 17, marginBottom: 24 }}>
              Every kept phrase carries an opportunity score, momentum tag, difficulty pill, and the cluster it belongs to. Sortable, scannable, and grounded in real YouTube competition data. Not a global difficulty estimate that doesn’t know what your channel is targeting.
            </p>
            {[
              'Score weighted on real competitor channel size',
              'Momentum tag. See unclaimed niches at a glance',
              'Difficulty pill from real top-5 channel medians',
              '3–5 thematic clusters surfaced from the same data',
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 11 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--yte-accent)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M2.5 7.2 5.4 10l6.1-6"/></svg>
                <span style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.6 }}>{b}</span>
              </div>
            ))}
          </div>
          <div><KeywordTableVisual /></div>
        </div>
      </section>

      {/* ════ 3. SCORE SIGNALS ════ */}
      <section className="kwr-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="kwr-wrap">
          <div style={{ maxWidth: 760, marginBottom: 44 }}>
            <Eyebrow>What the score is built from</Eyebrow>
            <h2 className="kwr-h2" style={{ fontSize: H2, marginBottom: 16, textWrap: 'balance' }}>
              Six real signals. <em>One opportunity score.</em>
            </h2>
            <p className="kwr-lead" style={{ fontSize: 17 }}>
              The opportunity score isn’t a vibe. It’s a weighted formula. Three competition signals (feasibility, traffic, freshness), one intent multiplier, one autocomplete-rank bonus, and a momentum label. Same formula every keyword, so you can trust the comparison across searches.
            </p>
          </div>
          <div className="kwr-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)' }}>
            {SCORE_SIGNALS.map((d, i) => (
              <div key={i} style={{ background: 'var(--yte-surface)', padding: '22px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: 'var(--yte-accent)' }}>{String(i + 1).padStart(2, '0')}</span>
                  <p style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.2px' }}>{d.name}</p>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-soft)', lineHeight: 1.72 }} dangerouslySetInnerHTML={{ __html: d.what }}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 4. SCORE BREAKDOWN (split) ════ */}
      <section className="kwr-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="kwr-grid-2 kwr-wrap" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div style={{ order: isMobile ? 1 : 0 }}>
            <ScoreBreakdownVisual />
          </div>
          <div style={{ order: isMobile ? 0 : 1 }}>
            <Eyebrow>Anatomy of an opportunity score</Eyebrow>
            <h2 className="kwr-h2" style={{ fontSize: H2, marginBottom: 18 }}>
              You see the math. <em>So you trust the rank.</em>
            </h2>
            <p className="kwr-lead" style={{ fontSize: 17, marginBottom: 22 }}>
              Click any keyword to expand the breakdown. Feasibility (45%) measures how dominant the top 5 channels are. Traffic ceiling (30%) measures the view headroom. Freshness (25%) measures whether anyone’s actively shipping in the niche. Multiplied by intent match. Plus a small autocomplete-rank bonus. No black box, no proprietary "DA-equivalent". Just the formula.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {[
                { label: 'Feasibility',   body: 'Top-5 channels. Smaller = higher score.' },
                { label: 'Traffic',       body: 'Top-5 view ceiling. Bigger = higher score.' },
                { label: 'Freshness',     body: 'Days since newest top-5 video. Staler = higher.' },
                { label: 'Intent × bonus', body: 'Exact / strong / partial. Plus autocomplete-rank lift.' },
              ].map((p, i) => (
                <div key={i} style={{ borderLeft: '2px solid var(--yte-accent)', paddingLeft: 12 }}>
                  <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: 'var(--yte-accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{p.label}</p>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-soft)', lineHeight: 1.6 }}>{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════ 5. HOW IT WORKS ════ */}
      <section id="how" className="kwr-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ maxWidth: 720, marginBottom: 44 }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="kwr-h2" style={{ fontSize: H2, textWrap: 'balance' }}>
              From seed keyword to <em>ranked opportunity</em> in 30 seconds.
            </h2>
            <p className="kwr-lead" style={{ fontSize: 17, marginTop: 14, maxWidth: 600 }}>
              Five stages, all of them parallelized. The competition enrichment runs only on the top 10 by initial score so you don’t pay for low-signal data.
            </p>
          </div>
          {(() => {
            const steps = [
              { n: '01', t: 'Seed keyword',         b: 'Type the broad topic you want to publish about. The studio uses your channel’s niche keywords as additional context to keep the suggestions on-brand.' },
              { n: '02', t: 'Multi-source fan-out', b: 'In parallel: YouTube Suggest scrape, SerpAPI Google autocomplete, Serper "related searches". 30+ raw suggestions in ~3 seconds.' },
              { n: '03', t: 'Claude intent filter', b: 'Sonnet 4.6 reads all 30+ suggestions, drops off-intent / branded / duplicates, keeps 15–25 phrases that match your seed intent. Tags content angle + intent strength on each.' },
              { n: '04', t: 'Real competition fetch', b: 'For the top 10 by initial score: real YouTube top-5 results. Channel size, view ceiling, days since newest. Parallel, anonymous API key, ~10 seconds.' },
              { n: '05', t: 'Score + cluster',      b: 'Final score = feasibility×0.45 + traffic×0.30 + freshness×0.25, intent multiplier, autocomplete bonus. 3–5 thematic clusters surfaced. Top pick named.' },
            ]
            const Card = ({ s }) => (
              <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', padding: '22px 22px 24px', flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: 'var(--yte-accent)', letterSpacing: '0.06em', marginBottom: 14 }}>{s.n}</div>
                <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 400, color: 'var(--yte-ink)', marginBottom: 10, letterSpacing: '-0.2px', lineHeight: 1.2 }}>{s.t}</p>
                <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-soft)', lineHeight: 1.65 }}>{s.b}</p>
              </div>
            )
            const Arrow = ({ down }) => (
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', color: 'var(--yte-muted)', margin: down ? '8px auto' : 0 }}>
                <svg width="16" height="16" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {down ? <path d="M6 2v8M3 7l3 3 3-3"/> : <path d="M2 6h8M7 3l3 3-3 3"/>}
                </svg>
              </div>
            )
            if (isMobile) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {steps.map((s, i) => (
                    <div key={i}>
                      <Card s={s} />
                      {i < steps.length - 1 && <Arrow down />}
                    </div>
                  ))}
                </div>
              )
            }
            return (
              <div style={{ display: 'flex', alignItems: 'stretch', gap: 10 }}>
                {steps.flatMap((s, i) => {
                  const items = [<Card key={`c${i}`} s={s} />]
                  if (i < steps.length - 1) items.push(<Arrow key={`a${i}`} />)
                  return items
                })}
              </div>
            )
          })()}
        </div>
      </section>

      {/* ════ 6. SEVEN OUTPUT BLOCKS ════ */}
      <section className="kwr-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ maxWidth: 760, marginBottom: 40 }}>
            <Eyebrow>Output structure</Eyebrow>
            <h2 className="kwr-h2" style={{ fontSize: H2, marginBottom: 16, textWrap: 'balance' }}>
              Seven distinct output blocks. <em>Every keyword is publishable.</em>
            </h2>
            <p className="kwr-lead" style={{ fontSize: 17 }}>
              You don’t leave the studio with a list of phrases. You leave with a ranked, scored, clustered, intent-filtered keyword set. Each one carrying a content angle so the next step is "open SEO Studio", not "now what".
            </p>
          </div>
          <div className="kwr-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)' }}>
            {PIPELINE_OUTPUTS.map((p, i) => (
              <div key={i} style={{ background: 'var(--yte-surface)', padding: '22px 22px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <OutputIcon name={p.icon} />
                  <p style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 600, color: 'var(--yte-ink)', letterSpacing: '-0.1px' }}>{p.title}</p>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-soft)', lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: p.body }}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 7. WHAT POWERS IT (split) ════ */}
      <section className="kwr-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="kwr-grid-2" style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <Eyebrow>What powers it</Eyebrow>
            <h2 className="kwr-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 16, textWrap: 'balance' }}>
              Three live data sources. <em>One AI judgement layer.</em>
            </h2>
            <p className="kwr-lead" style={{ fontSize: 15 }}>
              Real autocomplete from YouTube and Google, real "related searches" from Google’s SERP, and real top-5 ranking data from the YouTube Data API. Claude Sonnet 4.6 sits in the middle as the intent filter and clustering layer. But every score component is grounded in numbers we genuinely fetched, not estimated.
            </p>
          </div>
          <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', padding: '26px 28px' }}>
            {[
              { k: 'Autocomplete (YouTube)',  v: 'Direct Suggest API · ranked positions surface real demand' },
              { k: 'Autocomplete (Google)',    v: 'SerpAPI Google Suggest · localized to your region' },
              { k: 'Related searches',         v: 'Serper Google SERP · "people also searched" panel' },
              { k: 'Competition data',         v: 'YouTube Data API · search.list + videos.list + channels.list' },
              { k: 'Intent filter + clusters', v: 'Claude Sonnet 4.6 · drops noise, tags angle + intent strength' },
              { k: 'API quota',                v: 'Anonymous YouTube key · doesn’t touch your OAuth quota' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '11px 0', borderBottom: i < 5 ? '1px solid var(--yte-line)' : 'none', alignItems: 'baseline' }}>
                <p style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: 'var(--yte-ink)', letterSpacing: '-0.1px', flexShrink: 0 }}>{row.k}</p>
                <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-soft)', lineHeight: 1.55, textAlign: 'right' }}>{row.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 8. PLAN LIMITS ════ */}
      <section className="kwr-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ maxWidth: 720, marginBottom: 40 }}>
            <Eyebrow>By plan</Eyebrow>
            <h2 className="kwr-h2" style={{ fontSize: H2, marginBottom: 16, textWrap: 'balance' }}>
              How many keyword searches you get <em>each month.</em>
            </h2>
            <p className="kwr-lead" style={{ fontSize: 17 }}>
              Free creators get one full search per cycle so you can prove the engine on a real keyword. Paid plans charge one credit per search. Same engine, no feature differences. Re-running an old seed creates a fresh entry so you can track how a niche shifts over time.
            </p>
          </div>
          <div className="kwr-grid-4" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)' }}>
            {PLAN_LIMITS.map((p, i) => {
              const isAccent = p.plan === 'Growth'
              return (
                <div key={i} style={{ background: 'var(--yte-surface)', padding: '24px 22px 22px', position: 'relative', boxShadow: isAccent ? 'inset 0 2px 0 var(--yte-accent)' : 'none' }}>
                  {isAccent && (
                    <span style={{ position: 'absolute', top: 0, right: 16, fontFamily: SANS, fontSize: 9, fontWeight: 700, color: '#fff', background: 'var(--yte-accent)', padding: '3px 9px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Most popular</span>
                  )}
                  <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>{p.plan}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                    <p style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.8px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{p.runs}</p>
                    <p style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)' }}>{p.plan === 'Free' ? 'search' : 'searches'}</p>
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)', marginBottom: 14 }}>{p.plan === 'Free' ? 'per cycle' : 'included per month'}</p>
                  <div style={{ height: 1, background: 'var(--yte-line)', marginBottom: 12 }} />
                  <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-soft)', lineHeight: 1.55 }}>{p.note}</p>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)' }}>Same engine across every plan, including free.</p>
            <a href="/#pricing" style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-accent)', textDecoration: 'none', fontWeight: 600 }}>See full pricing →</a>
          </div>
        </div>
      </section>

      {/* ════ 9. FAQ ════ */}
      <section className="kwr-section-pad" style={{ padding: isMobile ? '64px 22px 80px' : '104px 48px 120px', background: 'var(--yte-bg)' }}>
        <div className="kwr-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: 64, alignItems: 'flex-start' }}>
          <div style={{ position: isMobile ? 'static' : 'sticky', top: 100 }}>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="kwr-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 16, textWrap: 'balance' }}>
              The keyword engine, <em>answered honestly.</em>
            </h2>
            <p className="kwr-lead" style={{ fontSize: 14.5 }}>
              Real answers from how the product behaves. The data sources, the score formula, the YouTube quota boundary, and what won’t work.
            </p>
            <a href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-accent)', textDecoration: 'none', fontWeight: 600, marginTop: 16 }}>
              Still have questions? Email us →
            </a>
          </div>
          <div style={{ borderTop: '1px solid var(--yte-line)' }}>
            {FAQS.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
