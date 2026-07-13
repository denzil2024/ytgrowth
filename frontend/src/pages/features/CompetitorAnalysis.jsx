import { useEffect, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import { injectFaqJsonLd } from '../../utils/seo'

/* Competitor Analysis feature page. Migrated to the editorial design language
   (Fraunces + Barlow, sharp flat cards, warm paper, restrained red). Old
   white→dark→light rhythm is now predominantly warm paper; the competitor
   card stays a dark "app preview" pane (on-dark accents use coral, not raw
   red). Foreign blue/green tints neutralised to ink/accent, output icons are
   neutral ink, bottom CTA removed. ALL copy and product detail preserved.
   See project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

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
    if (document.getElementById('cmp-styles')) return
    const style = document.createElement('style')
    style.id = 'cmp-styles'
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
      @keyframes cmpFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .cmp-wrap { max-width: 1120px; margin: 0 auto; }
      .cmp-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .cmp-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .cmp-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .cmp-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.05; }
      .cmp-h1 em { font-style: italic; color: var(--yte-accent); }
      .cmp-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .cmp-h2 em { font-style: italic; color: var(--yte-accent); }
      .cmp-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .cmp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--yte-accent); color: #fff; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 15px 30px; border: none; border-radius: 0; cursor: pointer; text-decoration: none; transition: filter 0.18s, transform 0.18s; }
      .cmp-btn:hover { filter: brightness(1.06); transform: translateY(-1px); }
      .cmp-btn-lg { font-size: 13px; padding: 17px 36px; }
      .cmp-ghost { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 15px 28px; border-radius: 0; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--yte-soft); text-decoration: none; background: var(--yte-surface); border: 1px solid var(--yte-line); transition: color 0.15s, border-color 0.15s; }
      .cmp-ghost:hover { color: var(--yte-ink); border-color: var(--yte-line-2); }

      .cmp-faq-item { border-bottom: 1px solid var(--yte-line); }
      .cmp-faq-q { background: none; border: none; cursor: pointer; width: 100%; text-align: left; padding: 22px 0; font-family: ${SERIF}; display: flex; justify-content: space-between; align-items: center; gap: 18px; font-size: 20px; font-weight: 400; color: var(--yte-ink); letter-spacing: -0.2px; line-height: 1.3; transition: color 0.2s; }
      .cmp-faq-q:hover { color: var(--yte-accent); }
      .cmp-faq-q.open { color: var(--yte-accent); }
      .cmp-faq-plus { flex-shrink: 0; font-family: ${SANS}; font-size: 26px; font-weight: 300; color: var(--yte-accent); line-height: 1; transition: transform 0.2s; }
      .cmp-faq-plus.open { transform: rotate(45deg); }
      .cmp-faq-a { font-family: ${SANS}; font-size: 15.5px; color: var(--yte-soft); line-height: 1.78; padding: 0 0 24px 0; max-width: 720px; display: none; }
      .cmp-faq-a.open { display: block; }

      @media (max-width: 900px) {
        .cmp-grid-2 { grid-template-columns: 1fr !important; gap: 36px !important; }
        .cmp-grid-3 { grid-template-columns: 1fr !important; }
        .cmp-grid-4 { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 600px) {
        .cmp-grid-4 { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 768px) {
        .cmp-section-pad { padding-left: 22px !important; padding-right: 22px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children, center }) {
  return (
    <div className="cmp-eyebrow" style={center ? { justifyContent: 'center' } : undefined}>
      <span aria-hidden="true" className="cmp-eyebrow-rule" />
      <span className="cmp-eyebrow-text">{children}</span>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="cmp-faq-item">
      <button className={`cmp-faq-q${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span style={{ flex: 1 }}>{q}</span>
        <span aria-hidden="true" className={`cmp-faq-plus${open ? ' open' : ''}`}>+</span>
      </button>
      <div className={`cmp-faq-a${open ? ' open' : ''}`}>{a}</div>
    </div>
  )
}

/* ── Visual: Competitor card (dark focal pane) ─────────────────────────── */
function CompetitorCardVisual() {
  return (
    <div style={{ background: 'var(--yte-ink)', padding: 26 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: SERIF, fontSize: 18, fontWeight: 400, color: 'rgba(255,255,255,0.75)' }}>T</div>
          <div>
            <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: '-0.1px' }}>TechCreator Pro</p>
            <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>142K subscribers · 4.6% avg CTR · posts every 4 days</p>
          </div>
        </div>
        <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: '#e6b35c', background: 'rgba(230,179,92,0.12)', border: '1px solid rgba(230,179,92,0.3)', padding: '4px 10px', letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>High threat</span>
      </div>
      {/* Summary */}
      <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>AI assessment</p>
      <p style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: 18 }}>
        TechCreator Pro publishes twice the cadence you do, but their topic mix is narrow. They ignore tutorials entirely, and that&apos;s where 64% of search volume in your shared niche lives. They&apos;re beatable on tutorial content within 60 days.
      </p>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { k: '142K', l: 'Subscribers' },
          { k: '4.2K',  l: 'Avg views / video' },
          { k: '2.1M', l: 'Total views' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '11px 13px' }}>
            <p style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, color: '#fff', letterSpacing: '-0.4px', lineHeight: 1, marginBottom: 5, fontVariantNumeric: 'tabular-nums' }}>{s.k}</p>
            <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{s.l}</p>
          </div>
        ))}
      </div>
      {/* Top videos to study */}
      <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Top videos to study</p>
      {[
        { title: 'I tested every YouTube AI tool so you don’t have to', views: '124K', why: 'List + curiosity hook · pulled new subs from 4 niches' },
        { title: 'My exact YouTube setup in 2026 (under $500)',          views: '88K',  why: 'Specificity + price hook · evergreen format' },
      ].map((v, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: 56, height: 32, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{v.title}</p>
            <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{v.views} views · {v.why}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Visual: Gap to exploit cards (light, sharp) ───────────────────────── */
function GapVisual() {
  const gaps = [
    { gap: 'Tutorial content. 0 videos in last 90 days', action: 'Ship a 6-part "How to X in 2026" series. Their audience is searching for these terms but landing on smaller channels.', impact: 'HIGH', high: true },
    { gap: 'Posting Tuesday 4pm-2.3x their average CTR', action: 'Match the slot for your next 3 uploads. Their audience is conditioned to watch on Tuesday.', impact: 'MED', high: false },
    { gap: '"Beginner" keyword absent from any title', action: 'Their audience skews intermediate. Beginner-targeted titles in the same niche get 5x search volume on YouTube.', impact: 'HIGH', high: true },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {gaps.map((g, i) => (
        <div key={i} style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', borderLeft: '3px solid var(--yte-accent)', padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
            <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: 'var(--yte-ink)', letterSpacing: '-0.1px', lineHeight: 1.4 }}>{g.gap}</p>
            <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: g.high ? 'var(--yte-accent)' : 'var(--yte-muted)', border: `1.5px solid ${g.high ? 'var(--yte-accent)' : 'var(--yte-line-2)'}`, padding: '2px 8px', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>{g.impact}</span>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-soft)', lineHeight: 1.6 }}><span style={{ color: 'var(--yte-accent)', fontWeight: 700 }}>How to capture: </span>{g.action}</p>
        </div>
      ))}
    </div>
  )
}

/* ── 7 dimensions analysed. Straight from the prompt in app/competitors.py ── */
const DIMENSIONS = [
  { name: 'Content topics',         what: 'Which topic clusters dominate their channel and which ones drive their highest-view videos. Surfaces the topics they’ve never covered that their audience clearly wants.' },
  { name: 'Title & SEO strategy',   what: 'Title patterns, dominant formats, top keywords, and power words used. Identifies high-volume keywords they rank for that you aren’t targeting yet.' },
  { name: 'Posting frequency & timing', what: 'How often and when they post. Pinpoints the day-and-hour windows their audience converts in. Sometimes worth matching, sometimes worth deliberately avoiding.' },
  { name: 'Video length patterns',  what: 'Their duration sweet spot scored against their own retention. Flags format gaps you can exploit (e.g. they don’t do longform, you do).' },
  { name: 'Engagement patterns',    what: 'Like-to-view and comment-to-view ratios across their last 30. Identifies whether their audience is engaged or passive and which topics drive the most comments.' },
  { name: 'Thumbnail style',        what: 'Visual patterns repeated across their thumbnails. Palette, text density, faces, composition. Tells you exactly how to stand out in the same recommendation feed.' },
  { name: 'Content gaps',           what: 'Topics the competitor has never covered but their audience is clearly asking for. The shortest path to videos that already have demand and no incumbent.' },
]

const OUTPUT_PARTS = [
  { icon: 'shield',  title: 'Threat level',           body: 'Low / Medium / High based on subscriber overlap, topic similarity, and posting velocity. So you know which competitors pull your audience vs which look similar but aren’t.' },
  { icon: 'clip',    title: 'Top topics + view data', body: 'The 5–8 topic clusters that drive their views, with avg views per topic and video count per topic. Tells you what to model and what to ignore.' },
  { icon: 'tag',     title: 'Title patterns',         body: 'Average title length, dominant title formats, top keywords across all 30 uploads, and the power words they rely on. Steal what works.' },
  { icon: 'gap',     title: 'Gaps to exploit',        body: 'A ranked list of opportunities. Each gap comes with an exact "how to capture" action and an estimated impact tag (low / med / high).' },
  { icon: 'film',    title: 'Top videos to study',    body: 'Their top 5 by views with the AI’s explanation of "why it worked". Use it as a deconstruct cheat sheet before you ship something similar.' },
  { icon: 'idea',    title: 'Ready-to-use video ideas', body: 'Working titles you can publish, each with the angle ("how this steals or counters") and target keyword. The shortest path from analysis to your next upload.' },
  { icon: 'sword',   title: 'Winning moves',          body: 'Tactical, specific recommendations the AI surfaces from the data. Not "post more" generic advice. Moves like "match their Tuesday 4pm slot for next 3 uploads".' },
]

const ICON_PATHS = {
  shield: 'M8 1L2 3v5c0 4 6 7 6 7s6-3 6-7V3l-6-2z',
  clip:   'M3 2h7l3 3v9H3zM10 2v3h3',
  tag:    'M2 8l6-6 6 1 1 6-7 5-6-6zM10 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
  gap:    'M2 8h5M9 8h5M5 5l-3 3 3 3M11 5l3 3-3 3',
  film:   'M2 4h10v8H2zM12 6l4-2v8l-4-2',
  idea:   'M5.5 9.5a4 4 0 1 1 5 0V12h-5zM6.5 14h3M7.5 16h1',
  sword:  'M3 13l8-8M11 5l2-2M5 13H3v-2',
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
  { plan: 'Free',    rivals: '0',  note: 'Not included on free tier' },
  { plan: 'Solo',    rivals: '2',  note: '20 audits / month · 3 channels' },
  { plan: 'Growth',  rivals: '5',  note: '50 audits / month · 5 channels' },
  { plan: 'Agency',  rivals: '10', note: '150 audits / month · 10 pooled channels' },
]

const FAQS = [
  {
    q: 'How do I know which channels are my real competitors?',
    a: <>Start with channels serving the same audience at a similar size, not just the biggest names in your niche. Search your core keywords in an incognito window and note who shows up repeatedly, or check who YouTube suggests after your own videos. Inside the tool, search by keyword instead of pasting a URL and we surface matching channels to pick from.</>,
  },
  {
    q: 'Do I need permission from a competitor to analyze their channel?',
    a: <>No. We only read public data. What is on their channel page and what the YouTube API exposes about videos that are already published. We never scrape private analytics, never pretend to be them, and never contact them. Anyone visiting their channel can see the same numbers; we just structure them and run an AI competitive analysis on top.</>,
  },
  {
    q: 'How fresh is the competitor data?',
    a: <>Real-time on the first analysis. After that, the data is re-fetched on demand whenever you re-run the analysis on that competitor. Which spends one credit. Most users don&apos;t need daily refresh; the patterns the AI surfaces are stable over weeks. If a competitor has a viral moment you can manually re-run to capture the new data.</>,
  },
  {
    q: 'How many competitors should I track?',
    a: <>Start with 2–3 of your closest direct rivals. More dilutes your attention. The AI is very good at finding gaps in any channel, but those insights only matter if you use them. And you can&apos;t act on findings from 10 competitors. Most users find 3 well-chosen competitors generate more publishable ideas than 10 loosely-related ones.</>,
  },
  {
    q: 'What counts as a "high threat" competitor?',
    a: <>The AI scores threat level (low / medium / high) based on three things: how much subscriber overlap is likely (similar niche signal), topic similarity to your channel, and their posting velocity. A creator with 142K subscribers publishing 2x your cadence in your exact topic gets HIGH. A 1M-sub creator who only tangentially overlaps is usually MEDIUM or LOW because they&apos;re not pulling your audience.</>,
  },
  {
    q: 'Will this work for shorts-first channels?',
    a: <>Yes. The analysis treats Shorts and long-form separately when it sees both, so the patterns don&apos;t get mixed. For Shorts-only competitors, "title patterns" downweights and "thumbnail style" reads more loosely (Shorts thumbnails get less play than long-form). Engagement and topic patterns work the same.</>,
  },
  {
    q: 'How is the gap analysis different from just watching their videos myself?',
    a: <>You&apos;d need to watch all 30 of their recent uploads, log titles, dates, durations, view counts, then look up search volume for missing keywords, then cross-reference against what your channel covers, then prioritize. That&apos;s a 6–10 hour exercise per competitor, and our <a href="/blog/youtube-competitor-analysis" style={{ color: 'var(--yte-accent)', fontWeight: 600 }}>full manual method</a> walks through exactly how to do it by hand. The AI does it in 60 seconds with the same rigor. And structures the output so each gap comes with a specific "how to capture" action and an impact tag, not just observations.</>,
  },
  {
    q: 'Will the audit benchmark my channel against their stats?',
    a: <>Yes. Every analysis carries your channel context (subs, avg views, posting cadence) into the prompt, so insights are framed relative to where you are. "Their avg views are 4.2K, yours are 1.8K. These 3 of their topics consistently outperform that gap" is what you get, not "they get 4.2K average views" with no context.</>,
  },
  {
    q: 'Are the "video ideas" generated by AI safe to publish?',
    a: <>They&apos;re titles + angles + target keywords. Not scripts. Treat them as starting points. Your voice and execution still need to do the work. The angle is what&apos;s valuable: it explains how the idea takes a slice of the competitor&apos;s audience that they&apos;re currently not serving. The AI won&apos;t write the video for you, and that&apos;s on purpose.</>,
  },
  {
    q: 'What if the competitor I want to analyze has fewer than 30 videos?',
    a: <>The analysis works with whatever public history exists. 10 videos give a rougher pattern read than 30, and the AI flags that explicitly in the summary ("limited data. Patterns may not generalize"). Below 5 videos there&apos;s genuinely not enough signal to analyze; we tell you upfront and don&apos;t spend the credit.</>,
  },
  {
    q: 'Can I export the analysis or share it with a client?',
    a: <>The analysis stays inside your YTGrowth dashboard for now. Every result is saved per channel and can be re-opened anytime, and it feeds into your next channel audit as additional context (the audit becomes more useful the more competitors you&apos;ve analyzed). PDF / shareable-link export is on the roadmap; if it&apos;s a deal-breaker for your agency workflow, email support and we&apos;ll prioritize.</>,
  },
  {
    q: 'Is there a standard view-to-subscriber ratio I should benchmark against?',
    a: <>Be wary of any fixed target. View-to-subscriber ratios swing hugely by niche and channel size, so a one-size-fits-all number is misleading. The honest benchmark is relative, how a video performs against that channel&apos;s own recent median, which is how our <a href="/features/outliers" style={{ color: 'var(--yte-accent)', fontWeight: 600 }}>Outliers tool</a> scores it, as a multiplier of the niche median, not a flat percentage.</>,
  },
  {
    q: 'Is this useful for agencies reporting to a client, not just solo creators?',
    a: <>Yes. The Agency plan pools 10 tracked channels, and the threat-level tag plus the ranked gap report are built to summarize in a client update without you writing the narrative from scratch: what changed, which rival is pulling ahead, and the specific move to counter it. It won&apos;t generate a branded slide deck (see the export question above), but the substance of the report is there.</>,
  },
  {
    q: 'How is this different from vidIQ or TubeBuddy\'s competitor tracking?',
    a: <>VidIQ and TubeBuddy show you the raw numbers, views-per-hour, growth rates, keyword lists, and leave the interpretation to you. YTGrowth runs an AI analysis on the same kind of public data and tells you specifically what to change: which gap to fill first, which title pattern to copy, each with an impact tag. If you want more dashboards, they&apos;re the better fit. If you want a ranked list of moves, this is built for that.</>,
  },
]

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function CompetitorAnalysis() {
  useStyles()
  useEffect(() => { injectFaqJsonLd(FAQS) }, [])
  const { isMobile } = useBreakpoint()

  const H2 = isMobile ? 30 : 42

  return (
    <div style={{ background: 'var(--yte-bg)', minHeight: '100vh', fontFamily: SANS, color: 'var(--yte-ink)' }}>

      {/* ════ NAV ════ */}
      <SiteHeader />

      {/* ════ 1. HERO ════ */}
      <section className="cmp-section-pad" style={{ padding: isMobile ? '60px 22px 48px' : '104px 48px 64px', background: 'var(--yte-bg)' }}>
        <div className="cmp-wrap" style={{ animation: 'cmpFadeUp 0.5s ease both' }}>
          <Eyebrow>Competitor Analysis</Eyebrow>
          <h1 className="cmp-h1" style={{ fontSize: isMobile ? 34 : 56, marginBottom: 22, maxWidth: 900, textWrap: 'balance' }}>
            See exactly what your rivals are doing right. <em>And where they’re leaving openings.</em>
          </h1>
          <p className="cmp-lead" style={{ fontSize: isMobile ? 16 : 17.5, maxWidth: 720, marginBottom: 32, textWrap: 'pretty' }}>
            Pick 2–10 channels in your niche. YTGrowth pulls their last 30 uploads, runs a 7-dimension AI analysis, and returns a ranked list of content gaps, winning patterns, and ready-to-publish video ideas. With a threat level for each rival so you know which ones to focus on.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/auth/login" className="cmp-btn cmp-btn-lg">Analyze a competitor →</a>
            <a href="#how" className="cmp-ghost">See how it works</a>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', marginTop: 22, letterSpacing: '0.03em' }}>
            Solo plan and above · ~60 seconds per analysis · re-run anytime to capture fresh data
          </p>
        </div>
      </section>

      {/* ════ 2. COMPETITOR SUMMARY (split) ════ */}
      <section className="cmp-section-pad" style={{ padding: isMobile ? '64px 22px' : '88px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="cmp-grid-2 cmp-wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 56, alignItems: 'center' }}>
          <div>
            <Eyebrow>What you get per competitor</Eyebrow>
            <h2 className="cmp-h2" style={{ fontSize: H2, marginBottom: 18 }}>
              A complete read on every rival. <em>Not just their numbers, but their playbook.</em>
            </h2>
            <p className="cmp-lead" style={{ fontSize: 17, marginBottom: 24 }}>
              Each competitor returns a structured report: a threat-level tag, a 2–3 sentence AI assessment naming the real opportunity against them, their headline stats, and the top 5 videos worth deconstructing. Each with a "why it worked" one-liner.
            </p>
            {[
              'Threat level scored from subscriber overlap + topic match + posting velocity',
              'AI-written assessment naming the specific weakness to exploit',
              'Top 5 videos by views with deconstruction notes',
              'Re-fetched on demand so the analysis stays current',
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 11 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--yte-accent)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M2.5 7.2 5.4 10l6.1-6"/></svg>
                <span style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.6 }}>{b}</span>
              </div>
            ))}
          </div>
          <div><CompetitorCardVisual /></div>
        </div>
      </section>

      {/* ════ 3. THE 7 DIMENSIONS ════ */}
      <section className="cmp-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="cmp-wrap">
          <div style={{ maxWidth: 760, marginBottom: 44 }}>
            <Eyebrow>Seven dimensions analyzed</Eyebrow>
            <h2 className="cmp-h2" style={{ fontSize: H2, marginBottom: 16, textWrap: 'balance' }}>
              We don’t just count their videos. <em>We map their playbook.</em>
            </h2>
            <p className="cmp-lead" style={{ fontSize: 17 }}>
              Every competitor analysis runs the same seven dimensions over their last 30 uploads. The AI cross-references each one against your channel’s context. So the output isn’t a description of them, it’s a list of moves you can take.
            </p>
          </div>
          <div className="cmp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)' }}>
            {DIMENSIONS.map((d, i) => (
              <div key={i} style={{ background: 'var(--yte-surface)', padding: '22px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: 'var(--yte-accent)' }}>{String(i + 1).padStart(2, '0')}</span>
                  <p style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.2px' }}>{d.name}</p>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-soft)', lineHeight: 1.72 }}>{d.what}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 4. GAPS TO EXPLOIT (split) ════ */}
      <section className="cmp-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="cmp-grid-2 cmp-wrap" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div style={{ order: isMobile ? 1 : 0 }}>
            <GapVisual />
          </div>
          <div style={{ order: isMobile ? 0 : 1 }}>
            <Eyebrow>The gap report</Eyebrow>
            <h2 className="cmp-h2" style={{ fontSize: H2, marginBottom: 18 }}>
              Every gap comes with the <em>exact action to take.</em>
            </h2>
            <p className="cmp-lead" style={{ fontSize: 17, marginBottom: 22 }}>
              The gap report is the highest-leverage output. Each entry names a specific opening. A topic they ignore, a slot they don’t cover, a keyword they’ve never used. Paired with the move you should make and an impact tag (low / med / high). No vague advice; this is what you publish next.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {[
                { label: 'Gap',            body: 'The specific opening, named with their data.' },
                { label: 'How to capture', body: 'The exact action to take. Specific, not generic.' },
                { label: 'Impact',         body: 'Low / med / high. Based on the size of the opening.' },
                { label: 'Re-runnable',    body: 'Re-analyze anytime to refresh against their newest uploads.' },
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
      <section id="how" className="cmp-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ maxWidth: 720, marginBottom: 44 }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="cmp-h2" style={{ fontSize: H2, textWrap: 'balance' }}>From rival channel to <em>publishable idea</em> in under 60 seconds.</h2>
            <p className="cmp-lead" style={{ fontSize: 17, marginTop: 14, maxWidth: 560 }}>
              Five stages, all of them yours to control. Re-run any analysis anytime to capture a competitor’s newest uploads.
            </p>
          </div>
          {(() => {
            const steps = [
              { n: '01', t: 'Add a competitor',   b: 'Paste their channel URL or handle. Or search by keyword and pick from the matches we surface.' },
              { n: '02', t: 'Public data fetch',  b: 'Last 30 uploads pulled via the official YouTube Data API: titles, durations, dates, view counts, like counts, comment counts.' },
              { n: '03', t: 'Pattern derivation', b: 'We compute their posting cadence, top day + hour, average title length, top 5 by views, and engagement ratios.' },
              { n: '04', t: 'AI runs 7 dimensions', b: 'Claude Sonnet 4.6 analyzes content topics, SEO strategy, length, engagement, thumbnail style, and the gaps you can exploit. With your channel as context.' },
              { n: '05', t: 'You see the result',  b: 'Threat level, summary, top topics, title patterns, ranked gaps with how-to-capture moves, top videos to study, and ready-to-publish ideas.' },
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

      {/* ════ 6. SEVEN OUTPUT PARTS ════ */}
      <section className="cmp-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ maxWidth: 760, marginBottom: 40 }}>
            <Eyebrow>Output structure</Eyebrow>
            <h2 className="cmp-h2" style={{ fontSize: H2, marginBottom: 16, textWrap: 'balance' }}>
              Seven distinct output blocks. <em>Every one is actionable.</em>
            </h2>
            <p className="cmp-lead" style={{ fontSize: 17 }}>
              We don’t hand you a wall of text. The AI returns a structured report, and the dashboard renders each block in its own card so you can scan, mark, and action without re-reading.
            </p>
          </div>
          <div className="cmp-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)' }}>
            {OUTPUT_PARTS.map((p, i) => (
              <div key={i} style={{ background: 'var(--yte-surface)', padding: '22px 22px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <OutputIcon name={p.icon} />
                  <p style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 600, color: 'var(--yte-ink)', letterSpacing: '-0.1px' }}>{p.title}</p>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-soft)', lineHeight: 1.65 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 7. WHAT POWERS IT (split) ════ */}
      <section className="cmp-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="cmp-grid-2" style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <Eyebrow>What powers it</Eyebrow>
            <h2 className="cmp-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 16, textWrap: 'balance' }}>
              Public data only. <em>Read-only API.</em> No scraping.
            </h2>
            <p className="cmp-lead" style={{ fontSize: 15 }}>
              We use the official YouTube Data API to read public information. The same data anyone visiting the channel can see. No private analytics, no impersonation, no terms-of-service grey areas. Each analysis costs one credit and the data is saved per channel so it feeds your channel audit context too.
            </p>
          </div>
          <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', padding: '26px 28px' }}>
            {[
              { k: 'Last 30 uploads',          v: 'Titles, durations, dates, views, likes, comments, thumbnails' },
              { k: 'Channel metadata',          v: 'Subscribers, total views, video count, channel age, channel keywords' },
              { k: 'Posting behavior',          v: 'Average gap, top day, top hour, videos in last 30 days' },
              { k: 'Engagement signals',        v: 'Like-to-view, comment-to-view, like rate' },
              { k: 'Your channel context',      v: 'Your subscribers, avg views, posting cadence, niche keywords' },
              { k: 'AI model',                  v: 'Claude Sonnet 4.6 · 8K-token analysis · ~30s' },
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
      <section className="cmp-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ maxWidth: 720, marginBottom: 40 }}>
            <Eyebrow>By plan</Eyebrow>
            <h2 className="cmp-h2" style={{ fontSize: H2, marginBottom: 16, textWrap: 'balance' }}>
              How many rivals you can <em>track at once.</em>
            </h2>
            <p className="cmp-lead" style={{ fontSize: 17 }}>
              Re-run any tracked competitor anytime. Counts are per-channel, so multi-channel accounts on Agency can run a full competitor stack per channel under their pooled credit allowance.
            </p>
          </div>
          <div className="cmp-grid-4" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)' }}>
            {PLAN_LIMITS.map((p, i) => {
              const isAccent = p.plan === 'Growth'
              const isLocked = p.plan === 'Free'
              return (
                <div key={i} style={{ background: 'var(--yte-surface)', padding: '24px 22px 22px', position: 'relative', opacity: isLocked ? 0.62 : 1, boxShadow: isAccent ? 'inset 0 2px 0 var(--yte-accent)' : 'none' }}>
                  {isAccent && (
                    <span style={{ position: 'absolute', top: 0, right: 16, fontFamily: SANS, fontSize: 9, fontWeight: 700, color: '#fff', background: 'var(--yte-accent)', padding: '3px 9px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Most popular</span>
                  )}
                  <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>{p.plan}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                    <p style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.8px', lineHeight: 1 }}>{p.rivals}</p>
                    <p style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)' }}>competitors</p>
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)', marginBottom: 14 }}>tracked at once</p>
                  <div style={{ height: 1, background: 'var(--yte-line)', marginBottom: 12 }} />
                  <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-soft)', lineHeight: 1.55 }}>{p.note}</p>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)' }}>Same 7-dimension analysis across all paid plans.</p>
            <a href="/#pricing" style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-accent)', textDecoration: 'none', fontWeight: 600 }}>See full pricing →</a>
          </div>
        </div>
      </section>

      {/* ════ 9. FAQ ════ */}
      <section className="cmp-section-pad" style={{ padding: isMobile ? '64px 22px 80px' : '104px 48px 120px', background: 'var(--yte-bg)' }}>
        <div className="cmp-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: 64, alignItems: 'flex-start' }}>
          <div style={{ position: isMobile ? 'static' : 'sticky', top: 100 }}>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="cmp-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 16, textWrap: 'balance' }}>
              Competitive intelligence, <em>answered honestly.</em>
            </h2>
            <p className="cmp-lead" style={{ fontSize: 14.5 }}>
              Real answers from how the product behaves. Including the limits, the privacy boundaries, and what it won’t do.
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
