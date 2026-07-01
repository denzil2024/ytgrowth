import { useEffect, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import { injectFaqJsonLd } from '../../utils/seo'

/* Outliers feature page. Migrated to the editorial design language (Fraunces +
   Barlow, sharp flat cards, warm paper, restrained red). The old
   white→dark→light rhythm is now predominantly warm paper; the outlier-video
   card and breakout-channel stack stay dark "app preview" panes (on-dark
   accents use warm gold #e6b35c, since red goes muddy on near-black). Foreign
   green/amber/blue tints neutralised to ink/accent/gold; the mock thumbnail is
   warm/brand-toned; output icons are neutral ink; body italics removed; bottom
   CTA removed. ALL copy, FAQs, the 3 reports, and product detail preserved.
   Classes use the .otl- prefix. See project_design_language_editorial. */

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
    if (document.getElementById('otl-styles')) return
    const style = document.createElement('style')
    style.id = 'otl-styles'
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
      @keyframes otlFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .otl-wrap { max-width: 1120px; margin: 0 auto; }
      .otl-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .otl-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .otl-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .otl-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.05; }
      .otl-h1 em { font-style: italic; color: var(--yte-accent); }
      .otl-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .otl-h2 em { font-style: italic; color: var(--yte-accent); }
      .otl-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .otl-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--yte-accent); color: #fff; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 15px 30px; border: none; border-radius: 0; cursor: pointer; text-decoration: none; transition: filter 0.18s, transform 0.18s; }
      .otl-btn:hover { filter: brightness(1.06); transform: translateY(-1px); }
      .otl-btn-lg { font-size: 13px; padding: 17px 36px; }
      .otl-ghost { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 15px 28px; border-radius: 0; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--yte-soft); text-decoration: none; background: var(--yte-surface); border: 1px solid var(--yte-line); transition: color 0.15s, border-color 0.15s; }
      .otl-ghost:hover { color: var(--yte-ink); border-color: var(--yte-line-2); }

      .otl-faq-item { border-bottom: 1px solid var(--yte-line); }
      .otl-faq-q { background: none; border: none; cursor: pointer; width: 100%; text-align: left; padding: 22px 0; font-family: ${SERIF}; display: flex; justify-content: space-between; align-items: center; gap: 18px; font-size: 20px; font-weight: 400; color: var(--yte-ink); letter-spacing: -0.2px; line-height: 1.3; transition: color 0.2s; }
      .otl-faq-q:hover { color: var(--yte-accent); }
      .otl-faq-q.open { color: var(--yte-accent); }
      .otl-faq-plus { flex-shrink: 0; font-family: ${SANS}; font-size: 26px; font-weight: 300; color: var(--yte-accent); line-height: 1; transition: transform 0.2s; }
      .otl-faq-plus.open { transform: rotate(45deg); }
      .otl-faq-a { font-family: ${SANS}; font-size: 15.5px; color: var(--yte-soft); line-height: 1.78; padding: 0 0 24px 0; max-width: 720px; display: none; }
      .otl-faq-a.open { display: block; }
      .otl-faq-a b { font-weight: 600; color: var(--yte-ink); }

      @media (max-width: 900px) {
        .otl-grid-2 { grid-template-columns: 1fr !important; gap: 36px !important; }
        .otl-grid-3 { grid-template-columns: 1fr !important; }
        .otl-grid-4 { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 600px) {
        .otl-grid-4 { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 768px) {
        .otl-section-pad { padding-left: 22px !important; padding-right: 22px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children, center }) {
  return (
    <div className="otl-eyebrow" style={center ? { justifyContent: 'center' } : undefined}>
      <span aria-hidden="true" className="otl-eyebrow-rule" />
      <span className="otl-eyebrow-text">{children}</span>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="otl-faq-item">
      <button className={`otl-faq-q${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span style={{ flex: 1 }}>{q}</span>
        <span aria-hidden="true" className={`otl-faq-plus${open ? ' open' : ''}`}>+</span>
      </button>
      <div className={`otl-faq-a${open ? ' open' : ''}`}>{a}</div>
    </div>
  )
}

/* ── Visual: Outlier video card with score + why-worked + actions (dark) ── */
function OutlierVideoVisual() {
  return (
    <div style={{ background: 'var(--yte-ink)', padding: 26 }}>
      {/* Thumbnail + title row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 124, height: 70, background: 'linear-gradient(135deg, #e6b35c 0%, #2a241a 100%)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: 5, left: 6, right: 6, fontFamily: SANS, fontSize: 9, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.6)', letterSpacing: '-0.3px' }}>I QUIT MY 9–5 IN 30 DAYS</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.92)', fontWeight: 600, letterSpacing: '-0.1px', marginBottom: 4, lineHeight: 1.4 }}>
            I quit my 9–5 in 30 days | Real numbers
          </p>
          <p style={{ fontFamily: SANS, fontSize: 11.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
            CreatorMike · 8.2K subs · 3 weeks ago · 142K views
          </p>
        </div>
      </div>
      {/* Outlier score row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '12px 14px', background: 'rgba(230,179,92,0.08)', border: '1px solid rgba(230,179,92,0.3)' }}>
        <div>
          <p style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, color: GOLD, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Outlier score</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, color: GOLD, letterSpacing: '-1px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>17.3</span>
            <span style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>×</span>
          </div>
        </div>
        <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.12)' }} />
        <p style={{ fontFamily: SANS, fontSize: 11.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
          17× the normal views-per-subscriber for this niche cohort. Top tier.
        </p>
      </div>
      {/* Why worked */}
      <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Why it worked</p>
      <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, marginBottom: 14 }}>
        First-person quit story with a 30-day timeline plus the words "real numbers". Promises receipts, not motivational fluff.
      </p>
      {/* Quick actions */}
      <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Quick actions</p>
      {[
        'Open with the moment you said "I’m quitting"',
        'Show one real spreadsheet on screen in the first 30s',
        'Title the next vlog "Day 1 after quitting | Real numbers"',
      ].map((a, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: GOLD, flexShrink: 0, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>0{i + 1}</span>
          <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.78)', lineHeight: 1.55 }}>{a}</p>
        </div>
      ))}
      {/* Why now */}
      <div style={{ borderLeft: `3px solid ${GOLD}`, background: 'rgba(230,179,92,0.07)', padding: '10px 12px', marginTop: 14 }}>
        <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Why now</p>
        <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.78)', lineHeight: 1.55 }}>
          The "quit my job" angle is climbing in the last 30 days. Three other channels just shipped variants that hit 50K+ views.
        </p>
      </div>
    </div>
  )
}

/* ── Visual: Breakout channel card stack (dark) ───────────────────────── */
function BreakoutChannelsVisual() {
  const channels = [
    { name: 'CreatorMike',     subs: '8.2K', outlier: '17.3×', why: 'Same niche as you · last 4 videos all 10×+ views' },
    { name: 'IndieFilmHub',    subs: '14K',  outlier: '9.1×',  why: 'Just pivoted topics 6 weeks ago · velocity ramping fast' },
    { name: 'TheLowFi Studio', subs: '24K',  outlier: '6.7×',  why: 'Posts twice your cadence · most uploads 5×+ views' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {channels.map((c, i) => (
        <div key={i} style={{ background: 'var(--yte-ink)', borderLeft: `3px solid ${GOLD}`, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: SERIF, fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.75)' }}>{c.name[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: '#fff', letterSpacing: '-0.2px' }}>{c.name}</p>
              <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{c.subs} subs · in your exact niche</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, color: GOLD, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Outlier</p>
              <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 400, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{c.outlier}</p>
            </div>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            <span style={{ color: GOLD, fontWeight: 700 }}>Why this channel: </span>{c.why}
          </p>
        </div>
      ))}
    </div>
  )
}

/* ── 3 reports the unified search returns ──────────────────────────────── */
const RESULT_TABS = [
  { name: 'Outlier Videos',     count: 'top 8', what: 'Recent niche videos that pulled 1.8× the normal views-per-subscriber for the cohort. Each one carries an outlier score, an AI-written "why it worked", three quick actions you can ship today, and a "why now" tying it to a current momentum signal.' },
  { name: 'Breakout Channels',  count: 'top 8', what: 'Channels in your niche whose recent uploads are systematically over-performing. The score is calculated the same way (views per sub vs cohort median), but at the channel level. Includes "what to do". Three moves you can borrow from their playbook.' },
  { name: 'Thumbnail Patterns', count: 'top 8', what: 'Visual patterns shared across the winning thumbnails. Common color palettes, face vs no-face split, text density bands, composition repeats. Tells you what the niche feed already looks like so your next thumbnail can lean into it or break it.' },
]

const PIPELINE_OUTPUTS = [
  { icon: 'sparkle', title: 'Outlier score (1.8× minimum)',    body: 'Views-per-subscriber divided by the niche cohort median. Normalizes channel size. A 50K-view video on a 10K channel scores higher than a 200K-view video on a 2M channel. Hard floor at 1.8×.' },
  { icon: 'why',     title: 'AI-written "why it worked"',       body: 'One sentence per video naming the exact hook, angle, or pattern that made it overperform. References specific title phrasing or format. Never generic. "first-person quit story with timeline" beats "good thumbnail".' },
  { icon: 'play',    title: 'Three quick actions per video',    body: 'Imperative-voice steps you can ship today. Specific ("Open with a 3-second before/after shot") not vague ("make a better hook"). Each action ≤ 14 words so it fits in your daily checklist.' },
  { icon: 'pulse',   title: '"Why now" urgency tag',            body: 'A current-momentum signal explaining why acting on this is urgent right now. References recency, rising trends, seasonal timing, or audience gaps the data shows. Never "this is a hot topic".' },
  { icon: 'rocket',  title: 'Breakout channel report',          body: 'Top 8 niche channels whose recent uploads are systematically over-performing. Each comes with subscribers, average views, outlier score, and three "what to do" actions you can borrow from them.' },
  { icon: 'palette', title: 'Thumbnail pattern analysis',       body: 'Visual patterns shared across the winning thumbnails. Color palette, face presence, text density, composition repeats. Tells you what the niche feed really looks like.' },
  { icon: 'cache',   title: 'Saved per-channel. Reopen anytime', body: 'Every search persists per channel and rehydrates with the full payload (videos + channels + thumbnails). Re-open a search week later, same data, no second credit charge.' },
]

const ICON_PATHS = {
  sparkle: 'M8 1l1.5 5L14 7.5l-4.5 1.5L8 15l-1.5-6L2 7.5l4.5-1z',
  why:     'M8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12M8 6v3M8 11.5h.01',
  play:    'M3 2v12l10-6z',
  pulse:   'M1 8h3l2-5 4 10 2-5h3',
  rocket:  'M11 1a7 7 0 0 0-7 7l1 4 4 1 7-7zM4 11l-2 4 4-2',
  palette: 'M8 1a7 7 0 0 0 0 14h2a2 2 0 0 0 0-4 2 2 0 1 1 0-4h3A7 7 0 0 0 8 1M5 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2M11 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
  cache:   'M2 4c0-1 3-2 6-2s6 1 6 2-3 2-6 2-6-1-6-2zM2 4v8c0 1 3 2 6 2s6-1 6-2V4M2 8c0 1 3 2 6 2s6-1 6-2',
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
  { plan: 'Free',    runs: '0',   note: 'Not included on free tier. Outliers is paid-only' },
  { plan: 'Solo',    runs: '6',   note: 'Each search returns videos + channels + thumbnails (3 reports)' },
  { plan: 'Growth',  runs: '16',  note: '50 credits / month, 3 credits per Outliers search · 5 channels' },
  { plan: 'Agency',  runs: '50',  note: 'Pooled across 10 channels · 150 credits / month' },
]

const FAQS = [
  {
    q: 'What exactly is an "outlier video"?',
    a: <>A video that pulled significantly more views than normal for its channel size. Specifically: the outlier score is the video’s views-per-subscriber divided by the cohort median for the niche. So a 50K-view video on a 10K-subscriber channel hits 5.0× the cohort median. That’s a big outlier, signaling either a new trend, a fresh angle, or a thumbnail/title that’s breaking through. We only surface scores ≥ 1.8× and we drop the channel-size noise so a giant channel’s "okay" video doesn’t crowd the list.</>,
  },
  {
    q: 'How is this different from "trending" or "most viewed" lists?',
    a: <>Trending shows what’s big <b>everywhere</b>, dominated by mega-channels. Most-viewed is biased toward old viral hits and giant audiences. Outliers shows what’s overperforming <b>relative to channel size in your specific niche, in the last 12 months</b>. That’s the only signal that’s actionable. It surfaces angles and formats working for creators at your size, not formats that only work because the channel already has 5M subs to push them out.</>,
  },
  {
    q: 'How does the "niche match" work?',
    a: <>For every candidate channel surfaced by the YouTube search, we fetch their last 15 video titles and check how many overlap with your channel’s niche keywords. At least one overlap = niche-matched (gets ranked higher). This kills two failure modes: tangentially-related channels (a "tech reviews" channel surfacing on a "home cleaning" search because of one off-topic upload), and creators who recently pivoted away from your niche. Both still appear, just downweighted in the tier sort.</>,
  },
  {
    q: 'Why three reports per search? Can I run just one?',
    a: <>The three reports (videos, breakout channels, thumbnail patterns) come from one unified search. Same YouTube fetch, same niche-matched candidate pool, same cohort. Splitting into separate searches would mean three times the API calls and three different result sets that don’t reconcile against each other. The unified pipeline is honest about that and bills accordingly: 3 credits per search, all three reports included. Most users find the channels report alone justifies the credits.</>,
  },
  {
    q: 'What does "why now" mean?',
    a: <>Each video carries a one-sentence urgency tag explaining why acting on it is urgent right now. Referencing recency ("this angle is climbing in the last 30 days"), seasonal timing ("Black Friday content cycle starts in 9 days"), rising momentum ("three other channels shipped variants this week"), or an audience gap the data shows. The instruction in the Claude prompt is "be concrete; never generic". If a video shows up with a vague why-now you can email support. That’s a prompt regression we want to know about.</>,
  },
  {
    q: 'Will this surface my own videos in the results?',
    a: <>No. Your channel is explicitly excluded from the candidate pool. The point is to find out what <b>other</b> creators in your niche are doing that’s working, not to feed your own data back to you (the Channel Audit covers that). If you happen to be the fastest-rising creator in your exact niche, the candidate pool will surface the next-tier creators below you instead.</>,
  },
  {
    q: 'How fresh is the data?',
    a: <>Real-time on every search. We don’t cache the YouTube fetch beyond the saved-search payload (which exists so you can reopen the same result without burning a second credit). The "last 12 months only" filter is hard. If you re-search the same query a month later you’ll get a fresh fetch, fresh cohort, and likely fresh outliers. Niche velocity shifts fast.</>,
  },
  {
    q: 'Can I search any keyword, or only ones related to my channel?',
    a: <>Any keyword. The search is anchored to your channel for cohort math and niche-matching, but the seed keyword can be anything. Use this to scout a topic before pivoting into it. "is anyone overperforming on home espresso content right now?". Or to validate a video idea before you script it. The cohort is built around the actual top results for the keyword, so the math stays honest even on out-of-niche searches.</>,
  },
  {
    q: 'How long does a search take?',
    a: <>~30–50 seconds. Behind the scenes: YouTube niche search → intent filter → niche-match channel scan (parallel, fetches recent uploads for each candidate) → enrich + score → one Claude call returns videos explanations and channel explanations and thumbnail patterns in batched parallel. Most of the wall-clock time is the per-channel niche-match fetch, which has to scan 10–15 candidate channels.</>,
  },
  {
    q: 'Why doesn’t my own channel’s niche match the keyword I searched?',
    a: <>The niche match runs against the niche keywords your channel was tagged with at connect time. Usually the YouTube channel keywords plus the topics extracted from your last 30 video titles. If those are stale (you pivoted, or YouTube’s keyword data was thin), the niche match will miss. Fix: head to Channel settings → re-extract keywords. Or, in Outliers, just add additional keywords as the seed. The niche match contributes to ranking but doesn’t block results.</>,
  },
  {
    q: 'Why is there a 1.8× minimum outlier score?',
    a: <>Below 1.8× isn’t really an outlier. It’s normal-or-slightly-better performance for the cohort. Including those in the result list pads the response with low-signal videos and hides the genuine over-performers. We applied the floor after seeing it improve the average "actionable insight per result" rate in beta. If the search would otherwise return fewer than 8 results, the system broadens the query and only then drops the floor as a fallback. So you always get a useful payload.</>,
  },
  {
    q: 'Are searches saved? Can I reopen them?',
    a: <>Yes. Every Outliers search persists per channel. The videos, breakout channels, thumbnail patterns, and the original seed keyword. Click any saved search to reopen the full payload without burning a credit. Re-running the same seed creates a fresh entry instead of overwriting, so you can compare how the niche has shifted month over month.</>,
  },
]

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function Outliers() {
  useStyles()
  useEffect(() => { injectFaqJsonLd(FAQS) }, [])
  const { isMobile } = useBreakpoint()

  const H2 = isMobile ? 30 : 42

  return (
    <div style={{ background: 'var(--yte-bg)', minHeight: '100vh', fontFamily: SANS, color: 'var(--yte-ink)' }}>

      {/* ════ NAV ════ */}
      <SiteHeader />

      {/* ════ 1. HERO ════ */}
      <section className="otl-section-pad" style={{ padding: isMobile ? '60px 22px 48px' : '104px 48px 64px', background: 'var(--yte-bg)' }}>
        <div className="otl-wrap" style={{ animation: 'otlFadeUp 0.5s ease both' }}>
          <Eyebrow>Outliers · viral video finder</Eyebrow>
          <h1 className="otl-h1" style={{ fontSize: isMobile ? 34 : 56, marginBottom: 22, maxWidth: 940, textWrap: 'balance' }}>
            Find the videos that hit <em>5×, 10×, even 50× their channel’s normal views.</em>
          </h1>
          <p className="otl-lead" style={{ fontSize: isMobile ? 16 : 17.5, maxWidth: 720, marginBottom: 32, textWrap: 'pretty' }}>
            Outliers surfaces YouTube videos in your exact niche that overperformed their channel size. Last 12 months only, with an AI-written "why it worked", three quick actions you can ship today, and a "why now" urgency tag. Plus a breakout-channels report and a thumbnail-patterns read across the winners. The closest you’ll get to a working playbook in 30 seconds.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/auth/login" className="otl-btn otl-btn-lg">Find a viral video →</a>
            <a href="#how" className="otl-ghost">See how it works</a>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', marginTop: 22, letterSpacing: '0.03em' }}>
            Solo plan and above · ~30 seconds per search · videos + channels + thumbnail patterns in one search
          </p>
        </div>
      </section>

      {/* ════ 2. OUTLIER VIDEO (split) ════ */}
      <section className="otl-section-pad" style={{ padding: isMobile ? '64px 22px' : '88px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="otl-grid-2 otl-wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 56, alignItems: 'center' }}>
          <div>
            <Eyebrow>Per-video card</Eyebrow>
            <h2 className="otl-h2" style={{ fontSize: H2, marginBottom: 18 }}>
              Every viral video comes with <em>the playbook to copy.</em>
            </h2>
            <p className="otl-lead" style={{ fontSize: 17, marginBottom: 24 }}>
              The outlier score is just the entry point. Each card carries a one-sentence "why it worked" naming the specific hook or pattern, three concrete quick actions you can ship today, and a "why now" tag tying it to a current momentum signal. No motivational fluff, no generic "make better content" advice.
            </p>
            {[
              'Score = views-per-sub vs niche cohort median',
              'AI explains what the title / hook / format did right',
              'Three actions ≤ 14 words each. Ship today',
              '"Why now" tag tied to a real momentum signal',
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 11 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--yte-accent)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M2.5 7.2 5.4 10l6.1-6"/></svg>
                <span style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.6 }}>{b}</span>
              </div>
            ))}
          </div>
          <div><OutlierVideoVisual /></div>
        </div>
      </section>

      {/* ════ 3. THREE REPORTS ════ */}
      <section className="otl-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="otl-wrap">
          <div style={{ maxWidth: 760, marginBottom: 44 }}>
            <Eyebrow>Three reports per search</Eyebrow>
            <h2 className="otl-h2" style={{ fontSize: H2, marginBottom: 16, textWrap: 'balance' }}>
              One unified search. <em>Three angles on the same niche.</em>
            </h2>
            <p className="otl-lead" style={{ fontSize: 17 }}>
              Every Outliers search returns three distinct reports. Viral videos, breakout channels, and thumbnail patterns. Built from the same niche-matched candidate pool so the views, channels, and visuals you see all reconcile against each other.
            </p>
          </div>
          <div className="otl-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)' }}>
            {RESULT_TABS.map((t, i) => (
              <div key={i} style={{ background: 'var(--yte-surface)', padding: '24px 24px 26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                  <p style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.2px' }}>{t.name}</p>
                  <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: 'var(--yte-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>{t.count}</span>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-soft)', lineHeight: 1.72 }}>{t.what}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 4. BREAKOUT CHANNELS (split) ════ */}
      <section className="otl-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="otl-grid-2 otl-wrap" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div style={{ order: isMobile ? 1 : 0 }}>
            <BreakoutChannelsVisual />
          </div>
          <div style={{ order: isMobile ? 0 : 1 }}>
            <Eyebrow>Breakout channels</Eyebrow>
            <h2 className="otl-h2" style={{ fontSize: H2, marginBottom: 18 }}>
              Find the creators in your niche <em>before they get big.</em>
            </h2>
            <p className="otl-lead" style={{ fontSize: 17, marginBottom: 22 }}>
              The same scoring math (views-per-sub vs cohort median) applied at the channel level. Surfaces creators in your niche whose recent uploads are systematically over-performing. The ones to study before they hit the trending tab. Each card carries an outlier score, why-this-channel summary, and three concrete moves you can borrow from their playbook.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {[
                { label: 'Niche-matched',     body: 'Recent uploads overlap your channel’s niche keywords.' },
                { label: 'Velocity-scored',   body: 'Channel-level outlier math. Same scale as the videos tab.' },
                { label: 'Why this channel',  body: 'One-sentence summary of what they’re doing right.' },
                { label: 'What to do',        body: 'Three concrete moves you can borrow this week.' },
              ].map((p, i) => (
                <div key={i} style={{ borderLeft: '2px solid var(--yte-accent)', paddingLeft: 12 }}>
                  <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: 'var(--yte-accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{p.label}</p>
                  <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-soft)', lineHeight: 1.6 }}>{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════ 5. HOW IT WORKS ════ */}
      <section id="how" className="otl-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ maxWidth: 720, marginBottom: 44 }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="otl-h2" style={{ fontSize: H2, textWrap: 'balance' }}>
              From seed search to <em>actionable playbook</em> in 30 seconds.
            </h2>
            <p className="otl-lead" style={{ fontSize: 17, marginTop: 14, maxWidth: 600 }}>
              Five stages, all of them parallelized. The Claude explanation pass batches videos + channels + thumbnail patterns into a single call so you don’t pay for three round-trips.
            </p>
          </div>
          {(() => {
            const steps = [
              { n: '01', t: 'Seed query + intent',  b: 'Type a topic. The studio offers 3 keyword intent options so the search is anchored to the right viewer intent. Same picker SEO Studio uses.' },
              { n: '02', t: 'YouTube niche search', b: 'Top 50 results pulled via the official YouTube Data API. Drops your own channel. Filters to last 12 months only.' },
              { n: '03', t: 'Niche-match channels', b: 'For each candidate channel, fetch their last 15 video titles and check overlap against your channel’s niche keywords. Niche-matched channels rank higher.' },
              { n: '04', t: 'Cohort scoring',       b: 'Compute views-per-subscriber for every candidate. Score = video VPS / cohort median VPS. Apply 1.8× outlier floor and a niche-relative views floor.' },
              { n: '05', t: 'Batched Claude pass',  b: 'One Sonnet 4.6 call returns why-it-worked + 3 quick actions + why-now per video, plus per-channel explanations and the thumbnail pattern read.' },
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
      <section className="otl-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ maxWidth: 760, marginBottom: 40 }}>
            <Eyebrow>Output structure</Eyebrow>
            <h2 className="otl-h2" style={{ fontSize: H2, marginBottom: 16, textWrap: 'balance' }}>
              Seven distinct output blocks. <em>Every viral hit comes with a playbook.</em>
            </h2>
            <p className="otl-lead" style={{ fontSize: 17 }}>
              The studio doesn’t hand you a list of trending videos and let you guess. Each output block is structured, named, and actionable. The Claude prompt explicitly forbids generic "make better hooks" advice.
            </p>
          </div>
          <div className="otl-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)' }}>
            {PIPELINE_OUTPUTS.map((p, i) => (
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
      <section className="otl-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="otl-grid-2" style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <Eyebrow>What powers it</Eyebrow>
            <h2 className="otl-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 16, textWrap: 'balance' }}>
              Real YouTube data. <em>One AI pass.</em>
            </h2>
            <p className="otl-lead" style={{ fontSize: 15 }}>
              Public videos via the official YouTube Data API. Niche-match scan over each candidate channel’s recent uploads. Cohort-relative scoring math. One batched Claude Sonnet 4.6 call returns explanations for every video, every breakout channel, and the thumbnail pattern read in parallel. So you’re not waiting on three round-trips.
            </p>
          </div>
          <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', padding: '26px 28px' }}>
            {[
              { k: 'Candidate pool',         v: 'YouTube Data API · top 50 niche results · last 12 months' },
              { k: 'Niche match',             v: 'Last 15 uploads per candidate · keyword overlap scoring' },
              { k: 'Outlier score',           v: 'Views-per-sub / niche cohort median · 1.8× minimum' },
              { k: 'Niche views floor',       v: '5% of cohort median · prevents dead uploads' },
              { k: 'Per-channel cap',         v: 'Max 2 videos from one channel · keeps results diverse' },
              { k: 'Explanations',            v: 'Sonnet 4.6 · batched · why-worked + 3 actions + why-now' },
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
      <section className="otl-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ maxWidth: 720, marginBottom: 40 }}>
            <Eyebrow>By plan</Eyebrow>
            <h2 className="otl-h2" style={{ fontSize: H2, marginBottom: 16, textWrap: 'balance' }}>
              How many Outliers searches you get <em>each month.</em>
            </h2>
            <p className="otl-lead" style={{ fontSize: 17 }}>
              Each Outliers search returns three reports (videos + breakout channels + thumbnail patterns) and charges 3 credits accordingly. Numbers below are the search count each plan’s monthly credit allowance covers if Outliers were the only feature you used. Most users mix Outliers with the other tools.
            </p>
          </div>
          <div className="otl-grid-4" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)' }}>
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
                    <p style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.8px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{p.runs}</p>
                    <p style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)' }}>searches</p>
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)', marginBottom: 14 }}>included per month</p>
                  <div style={{ height: 1, background: 'var(--yte-line)', marginBottom: 12 }} />
                  <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-soft)', lineHeight: 1.55 }}>{p.note}</p>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)' }}>3 credits per Outliers search · same engine across all paid plans.</p>
            <a href="/#pricing" style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-accent)', textDecoration: 'none', fontWeight: 600 }}>See full pricing →</a>
          </div>
        </div>
      </section>

      {/* ════ 9. FAQ ════ */}
      <section className="otl-section-pad" style={{ padding: isMobile ? '64px 22px 80px' : '104px 48px 120px', background: 'var(--yte-bg)' }}>
        <div className="otl-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: 64, alignItems: 'flex-start' }}>
          <div style={{ position: isMobile ? 'static' : 'sticky', top: 100 }}>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="otl-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 16, textWrap: 'balance' }}>
              The outlier engine, <em>answered honestly.</em>
            </h2>
            <p className="otl-lead" style={{ fontSize: 14.5 }}>
              Real answers from how the product behaves. The cohort math, the niche match, the credit cost, and what won’t work.
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
