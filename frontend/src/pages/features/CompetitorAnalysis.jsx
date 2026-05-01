import { useEffect, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'

/* Competitor Analysis — fully custom landing page.
 *
 * Built around the *actual* product (see app/competitors.py): a 7-dimension
 * AI competitive analysis powered by Claude Sonnet 4.6 with output in
 * threatLevel + topTopics + titlePatterns + gapsToExploit + topVideosToStudy
 * + videoIdeas + winningMoves. Background rhythm mirrors Landing.jsx and the
 * Channel Audit page (white → dark → light → dark → white → dark → light →
 * dark → white → light).
 */

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
    const link = document.createElement('link')
    link.id = 'cmp-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'cmp-styles'
    style.textContent = `
      :root {
        --ytg-bg:           #f4f4f6;
        --ytg-bg-2:         #ecedf1;
        --ytg-bg-3:         #e6e7ec;
        --ytg-text:         #0a0a0f;
        --ytg-text-2:       rgba(10,10,15,0.62);
        --ytg-text-3:       rgba(10,10,15,0.40);
        --ytg-text-4:       rgba(10,10,15,0.30);
        --ytg-nav:          rgba(244,244,246,0.92);
        --ytg-card:         #ffffff;
        --ytg-border:       rgba(10,10,15,0.09);
        --ytg-accent:       #e5302a;
        --ytg-accent-text:  #c22b25;
        --ytg-accent-light: rgba(229,48,42,0.07);
        --ytg-shadow-sm:    0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
        --ytg-shadow:       0 2px 6px rgba(0,0,0,0.08), 0 10px 32px rgba(0,0,0,0.11);
        --ytg-shadow-lg:    0 4px 16px rgba(0,0,0,0.11), 0 24px 60px rgba(0,0,0,0.14);
        --ytg-shadow-xl:    0 8px 28px rgba(0,0,0,0.13), 0 40px 100px rgba(0,0,0,0.17);
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 5px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background: rgba(10,10,15,0.16); border-radius: 10px }

      @keyframes fadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .cmp-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--ytg-accent); color: #fff; font-size: 15px; font-weight: 700; padding: 15px 30px; border-radius: 100px; border: none; cursor: pointer; text-decoration: none; letter-spacing: -0.2px; box-shadow: 0 1px 2px rgba(0,0,0,0.14), 0 4px 20px rgba(229,48,42,0.34); transition: filter 0.18s, transform 0.18s, box-shadow 0.18s; font-family: 'Inter', system-ui, sans-serif; }
      .cmp-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,0.16), 0 12px 36px rgba(229,48,42,0.42); }
      .cmp-btn-lg { font-size: 16px; padding: 17px 38px; }
      .cmp-btn-ghost { display: inline-flex; align-items: center; gap: 8px; background: var(--ytg-card); color: var(--ytg-text-2); font-size: 15px; font-weight: 600; padding: 14px 26px; border-radius: 100px; border: 1px solid var(--ytg-border); cursor: pointer; text-decoration: none; letter-spacing: -0.2px; box-shadow: var(--ytg-shadow-sm); transition: color 0.15s, box-shadow 0.18s; font-family: 'Inter', system-ui, sans-serif; }
      .cmp-btn-ghost:hover { color: var(--ytg-text); box-shadow: var(--ytg-shadow); }

      .cmp-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        font-size: 11px; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase;
        padding: 5px 13px; border-radius: 100px; margin-bottom: 16px;
      }
      .cmp-eyebrow.light { color: var(--ytg-accent-text); background: var(--ytg-accent-light); }
      .cmp-eyebrow.dark  { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); }

      .cmp-h1 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -2px; line-height: 1.05; text-wrap: balance; }
      .cmp-h2 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -1.4px; line-height: 1.08; text-wrap: balance; }

      .cmp-nav-link { font-size: 14px; color: var(--ytg-text-3); font-weight: 500; text-decoration: none; transition: color 0.15s; letter-spacing: -0.1px; }
      .cmp-nav-link:hover { color: var(--ytg-text-2); }

      .cmp-faq-item { border-bottom: 1px solid var(--ytg-border); }
      .cmp-faq-q { background: none; border: none; cursor: pointer; width: 100%; text-align: left; padding: 22px 0; font-family: inherit; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; font-size: 16.5px; font-weight: 700; color: var(--ytg-text); letter-spacing: -0.2px; line-height: 1.45; }
      .cmp-faq-q:hover { color: var(--ytg-accent); }
      .cmp-faq-icon { transition: transform 0.2s; flex-shrink: 0; color: var(--ytg-text-3); margin-top: 4px; }
      .cmp-faq-icon.open { transform: rotate(45deg); color: var(--ytg-accent); }
      .cmp-faq-a { font-size: 14.5px; color: var(--ytg-text-2); line-height: 1.78; padding: 0 0 22px 0; max-width: 760px; }

      @media (max-width: 900px) {
        .cmp-grid-2 { grid-template-columns: 1fr !important; gap: 32px !important; }
        .cmp-grid-3 { grid-template-columns: 1fr !important; }
        .cmp-grid-4 { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 600px) {
        .cmp-grid-4 { grid-template-columns: 1fr !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill="#ff3b30"/>
      <path d="M23.2 11.6a2.1 2.1 0 0 0-1.48-1.48C20.55 9.8 16 9.8 16 9.8s-4.55 0-5.72.32A2.1 2.1 0 0 0 8.8 11.6 22 22 0 0 0 8.5 16a22 22 0 0 0 .3 4.4 2.1 2.1 0 0 0 1.48 1.48C11.45 22.2 16 22.2 16 22.2s4.55 0 5.72-.32a2.1 2.1 0 0 0 1.48-1.48A22 22 0 0 0 23.5 16a22 22 0 0 0-.3-4.4z" fill="white"/>
      <polygon points="13.5,19 19.5,16 13.5,13" fill="#ff3b30"/>
    </svg>
  )
}

const FEATURE_NAV = [
  { href: '/features/channel-audit',       label: 'Channel Audit',       desc: '10-category AI audit of your channel' },
  { href: '/features/competitor-analysis', label: 'Competitor Analysis', desc: 'Track rivals, find their content gaps' },
  { href: '/features/seo-studio',          label: 'SEO Studio',          desc: 'Score + rewrite titles and descriptions' },
  { href: '/features/thumbnail-iq',        label: 'Thumbnail IQ',        desc: 'Two-layer thumbnail scoring vs your niche' },
  { href: '/features/keyword-research',    label: 'Keyword Research',    desc: 'YouTube-native search volume + difficulty' },
]

function FeaturesDropdown() {
  const [open, setOpen] = useState(false)
  return (
    <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} style={{ position: 'relative' }}>
      <a href="/#features" className="cmp-nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
        Features
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>
          <path d="M2 3.5l3 3 3-3"/>
        </svg>
      </a>
      {open && (
        <>
          <div style={{ position: 'absolute', top: '100%', left: -20, width: 360, height: 12 }} />
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: -20, zIndex: 200, background: '#fff', border: '1px solid var(--ytg-border)', borderRadius: 14, boxShadow: 'var(--ytg-shadow-lg)', padding: 8, minWidth: 340, animation: 'fadeUp 0.16s ease both' }}>
            {FEATURE_NAV.map((item, i) => (
              <a key={i} href={item.href} style={{ display: 'block', padding: '11px 14px', borderRadius: 9, textDecoration: 'none', transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f6f6f9'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.2px', marginBottom: 2 }}>{item.label}</p>
                <p style={{ fontSize: 12.5, color: 'var(--ytg-text-2)', lineHeight: 1.45 }}>{item.desc}</p>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="cmp-faq-item">
      <button className="cmp-faq-q" onClick={() => setOpen(o => !o)}>
        <span style={{ flex: 1 }}>{q}</span>
        <span className={`cmp-faq-icon${open ? ' open' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M8 2v12M2 8h12"/></svg>
        </span>
      </button>
      {open && <div className="cmp-faq-a">{a}</div>}
    </div>
  )
}

/* ── Visual: Competitor card with threat level + summary (dark) ────────── */
function CompetitorCardVisual() {
  return (
    <div style={{ background: '#111114', borderRadius: 18, border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 48px rgba(0,0,0,0.6)', padding: 26 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>T</div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>TechCreator Pro</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>142K subs · 4.6% avg CTR · posts every 4 days</p>
          </div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 800, color: '#ff3b30', background: 'rgba(229,48,42,0.12)', border: '1px solid rgba(229,48,42,0.35)', padding: '4px 10px', borderRadius: 100, letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>High threat</span>
      </div>
      {/* Summary */}
      <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>AI assessment</p>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: 18 }}>
        TechCreator Pro publishes twice the cadence you do, but their topic mix is narrow — they ignore tutorials entirely, and that&apos;s where 64% of search volume in your shared niche actually lives. They&apos;re beatable on tutorial content within 60 days.
      </p>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { k: '142K', l: 'Subscribers' },
          { k: '4.2K',  l: 'Avg views / video' },
          { k: '2.1M', l: 'Total views' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '11px 13px' }}>
            <p style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>{s.k}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{s.l}</p>
          </div>
        ))}
      </div>
      {/* Top videos to study */}
      <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Top videos to study</p>
      {[
        { title: 'I tested every YouTube AI tool so you don’t have to', views: '124K', why: 'List + curiosity hook · pulled new subs from 4 niches' },
        { title: 'My exact YouTube setup in 2026 (under $500)',          views: '88K',  why: 'Specificity + price hook · evergreen format' },
      ].map((v, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 56, height: 32, background: 'linear-gradient(135deg, rgba(229,48,42,0.25), rgba(74,124,247,0.18))', borderRadius: 5, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{v.title}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{v.views} views · {v.why}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Visual: Gap to exploit card (dark cards on dark bg) ───────────────── */
function GapVisual() {
  const gaps = [
    {
      gap: 'Tutorial content — 0 videos in last 90 days',
      action: 'Ship a 6-part "How to X in 2026" series. Their audience is searching for these terms but landing on smaller channels.',
      impact: 'HIGH',
      impactColor: '#ff3b30',
    },
    {
      gap: 'Posting Tuesday 4pm — 2.3x their average CTR',
      action: 'Match the slot for your next 3 uploads. Their audience is conditioned to watch on Tuesday.',
      impact: 'MED',
      impactColor: '#f59e0b',
    },
    {
      gap: '"Beginner" keyword absent from any title',
      action: 'Their audience skews intermediate. Beginner-targeted titles in the same niche get 5x search volume on YouTube.',
      impact: 'HIGH',
      impactColor: '#ff3b30',
    },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {gaps.map((g, i) => (
        <div key={i} style={{ background: '#111114', borderRadius: 14, border: '1px solid rgba(255,255,255,0.09)', borderLeft: `3px solid ${g.impactColor}`, padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px', lineHeight: 1.4 }}>{g.gap}</p>
            <span style={{ fontSize: 10, fontWeight: 800, color: g.impactColor, border: `1.5px solid ${g.impactColor}`, padding: '2px 8px', borderRadius: 100, letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>{g.impact}</span>
          </div>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}><span style={{ color: '#4ade80', fontWeight: 700 }}>How to capture: </span>{g.action}</p>
        </div>
      ))}
    </div>
  )
}

/* ── 7 dimensions analysed — straight from the prompt in app/competitors.py ── */
const DIMENSIONS = [
  { name: 'Content topics',         what: 'Which topic clusters dominate their channel and which ones drive their highest-view videos. Surfaces the topics they’ve never covered that their audience clearly wants.' },
  { name: 'Title & SEO strategy',   what: 'Title patterns, dominant formats, top keywords, and power words used. Identifies high-volume keywords they rank for that you aren’t targeting yet.' },
  { name: 'Posting frequency & timing', what: 'How often and when they post. Pinpoints the day-and-hour windows their audience converts in — sometimes worth matching, sometimes worth deliberately avoiding.' },
  { name: 'Video length patterns',  what: 'Their duration sweet spot scored against their own retention. Flags format gaps you can exploit (e.g. they don’t do longform, you do).' },
  { name: 'Engagement patterns',    what: 'Like-to-view and comment-to-view ratios across their last 30. Identifies whether their audience is engaged or passive and which topics drive the most comments.' },
  { name: 'Thumbnail style',        what: 'Visual patterns repeated across their thumbnails — palette, text density, faces, composition. Tells you exactly how to stand out in the same recommendation feed.' },
  { name: 'Content gaps',           what: 'Topics the competitor has never covered but their audience is clearly asking for. The shortest path to videos that already have demand and no incumbent.' },
]

const OUTPUT_PARTS = [
  { icon: 'shield',  title: 'Threat level',           body: 'Low / Medium / High based on subscriber overlap, topic similarity, and posting velocity. So you know which competitors actually pull your audience vs which look similar but aren’t.' },
  { icon: 'clip',    title: 'Top topics + view data', body: 'The 5–8 topic clusters that drive their views, with avg views per topic and video count per topic. Tells you what to model and what to ignore.' },
  { icon: 'tag',     title: 'Title patterns',         body: 'Average title length, dominant title formats, top keywords across all 30 uploads, and the power words they rely on. Steal what works.' },
  { icon: 'gap',     title: 'Gaps to exploit',        body: 'A ranked list of opportunities. Each gap comes with an exact "how to capture" action and an estimated impact tag (low / med / high).' },
  { icon: 'film',    title: 'Top videos to study',    body: 'Their top 5 by views with the AI’s explanation of "why it worked". Use it as a deconstruct cheat sheet before you ship something similar.' },
  { icon: 'idea',    title: 'Ready-to-use video ideas', body: 'Working titles you can publish, each with the angle ("how this steals or counters") and target keyword. The shortest path from analysis to your next upload.' },
  { icon: 'sword',   title: 'Winning moves',          body: 'Tactical, specific recommendations the AI surfaces from the data. Not "post more" generic advice — moves like "match their Tuesday 4pm slot for next 3 uploads".' },
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
    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--ytg-accent-light)', border: '1px solid rgba(229,48,42,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#e5302a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
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
    q: 'Do I need permission from a competitor to analyze their channel?',
    a: <>No. We only read public data — what is on their channel page and what the YouTube API exposes about videos that are already published. We never scrape private analytics, never pretend to be them, and never contact them. Anyone visiting their channel can see the same numbers; we just structure them and run an AI competitive analysis on top.</>,
  },
  {
    q: 'How fresh is the competitor data?',
    a: <>Real-time on the first analysis. After that, the data is re-fetched on demand whenever you re-run the analysis on that competitor — which spends one credit. Most users don&apos;t need daily refresh; the patterns the AI surfaces are stable over weeks. If a competitor has a viral moment you can manually re-run to capture the new data.</>,
  },
  {
    q: 'How many competitors should I track?',
    a: <>Start with 2–3 of your closest direct rivals. More dilutes your attention. The AI is very good at finding gaps in any channel, but those insights only matter if you actually use them — and you can&apos;t act on findings from 10 competitors. Most users find 3 well-chosen competitors generate more publishable ideas than 10 loosely-related ones.</>,
  },
  {
    q: 'What counts as a "high threat" competitor?',
    a: <>The AI scores threat level (low / medium / high) based on three things: how much subscriber overlap is likely (similar niche signal), topic similarity to your channel, and their posting velocity. A creator with 142K subs publishing 2x your cadence in your exact topic gets HIGH. A 1M-sub creator who only tangentially overlaps is usually MEDIUM or LOW because they&apos;re not actually pulling your audience.</>,
  },
  {
    q: 'Will this work for shorts-first channels?',
    a: <>Yes. The analysis treats Shorts and long-form separately when it sees both, so the patterns don&apos;t get mixed. For Shorts-only competitors, "title patterns" downweights and "thumbnail style" reads more loosely (Shorts thumbnails get less play than long-form). Engagement and topic patterns work the same.</>,
  },
  {
    q: 'How is the gap analysis different from just watching their videos myself?',
    a: <>You&apos;d need to watch all 30 of their recent uploads, log titles, dates, durations, view counts, then look up search volume for missing keywords, then cross-reference against what your channel covers, then prioritize. That&apos;s a 6–10 hour exercise per competitor. The AI does it in 60 seconds with the same rigor — and structures the output so each gap comes with a specific "how to capture" action and an impact tag, not just observations.</>,
  },
  {
    q: 'Will the audit benchmark my channel against their stats?',
    a: <>Yes. Every analysis carries your channel context (subs, avg views, posting cadence) into the prompt, so insights are framed relative to where you actually are. "Their avg views are 4.2K, yours are 1.8K — these 3 of their topics consistently outperform that gap" is what you get, not "they get 4.2K average views" with no context.</>,
  },
  {
    q: 'Are the "video ideas" generated by AI safe to publish?',
    a: <>They&apos;re titles + angles + target keywords. Not scripts. Treat them as starting points — your voice and execution still need to do the work. The angle is what&apos;s valuable: it explains how the idea takes a slice of the competitor&apos;s audience that they&apos;re currently not serving. The AI won&apos;t write the video for you, and that&apos;s on purpose.</>,
  },
  {
    q: 'What if the competitor I want to analyze has fewer than 30 videos?',
    a: <>The analysis works with whatever public history exists. 10 videos give a rougher pattern read than 30, and the AI flags that explicitly in the summary ("limited data — patterns may not generalize"). Below 5 videos there&apos;s genuinely not enough signal to analyze; we tell you upfront and don&apos;t spend the credit.</>,
  },
  {
    q: 'Can I export the analysis or share it with a client?',
    a: <>The analysis stays inside your YTGrowth dashboard for now — every result is saved per channel and can be re-opened anytime, and it feeds into your next channel audit as additional context (the audit becomes more useful the more competitors you&apos;ve analyzed). PDF / shareable-link export is on the roadmap; if it&apos;s a deal-breaker for your agency workflow, email support and we&apos;ll prioritize.</>,
  },
]

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function CompetitorAnalysis() {
  useStyles()
  const { isMobile } = useBreakpoint()

  return (
    <div style={{ background: 'var(--ytg-bg)', minHeight: '100vh' }}>

      {/* ════ NAV ════════════════════════════════════════════════════════ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--ytg-border)', padding: isMobile ? '0 20px' : '0 40px 0 64px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ytg-nav)', backdropFilter: 'blur(16px)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <Logo size={28} />
          <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--ytg-text)', letterSpacing: '-0.4px' }}>YTGrowth</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          {!isMobile && <FeaturesDropdown />}
          {!isMobile && <a href="/#pricing" className="cmp-nav-link">Pricing</a>}
          <a href="/auth/login" className="cmp-btn" style={{ padding: isMobile ? '8px 18px' : '9px 22px', fontSize: 13, borderRadius: 100, whiteSpace: 'nowrap', boxShadow: 'none' }}>
            Start tracking competitors
          </a>
        </div>
      </nav>

      {/* ════ 1. HERO — white ════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px 56px' : '110px 40px 80px', textAlign: 'center', background: '#ffffff' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', animation: 'fadeUp 0.5s ease both' }}>
          <span className="cmp-eyebrow light">Competitor Analysis</span>
          <h1 className="cmp-h1" style={{ fontSize: isMobile ? 36 : 60, color: 'var(--ytg-text)', marginBottom: 22 }}>
            See exactly what your rivals are doing right — <span style={{ color: 'var(--ytg-accent)' }}>and where they&apos;re leaving openings.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18.5, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 36px' }}>
            Pick 2–10 channels in your niche. YTGrowth pulls their last 30 uploads, runs a 7-dimension AI analysis, and returns a ranked list of content gaps, winning patterns, and ready-to-publish video ideas — with a threat level for each rival so you know which ones to focus on.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/login" className="cmp-btn cmp-btn-lg">Analyze a competitor →</a>
            <a href="#how" className="cmp-btn-ghost" style={{ padding: '15px 26px', fontSize: 15 }}>See how it works</a>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', marginTop: 22 }}>
            Solo plan and above · ~60 seconds per analysis · re-run anytime to capture fresh data
          </p>
        </div>
      </section>

      {/* ════ 2. COMPETITOR SUMMARY VISUAL — dark, SPLIT (text L, visual R) ═ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.16) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="cmp-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 64, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <span className="cmp-eyebrow dark">What you get per competitor</span>
            <h2 className="cmp-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 18 }}>
              A complete read on every rival — <span style={{ color: '#ff3b30' }}>not just their numbers, but their playbook.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72, marginBottom: 24 }}>
              Each competitor returns a structured report: a threat-level tag, a 2–3 sentence AI assessment naming the actual opportunity against them, their headline stats, and the top 5 videos worth deconstructing — each with a "why it worked" one-liner.
            </p>
            {[
              'Threat level scored from subscriber overlap + topic match + posting velocity',
              'AI-written assessment naming the specific weakness to exploit',
              'Top 5 videos by views with deconstruction notes',
              'Re-fetched on demand so the analysis stays current',
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 11 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#4ade80" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M2.5 7.2 5.4 10l6.1-6"/></svg>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6 }}>{b}</span>
              </div>
            ))}
          </div>
          <div>
            <CompetitorCardVisual />
          </div>
        </div>
      </section>

      {/* ════ 3. THE 7 DIMENSIONS — light ═══════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 48px' }}>
            <span className="cmp-eyebrow light">Seven dimensions analyzed</span>
            <h2 className="cmp-h2" style={{ fontSize: isMobile ? 30 : 42, marginBottom: 16 }}>
              We don&apos;t just count their videos. <span style={{ color: 'var(--ytg-accent)' }}>We map their playbook.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>
              Every competitor analysis runs the same seven dimensions over their last 30 uploads. The AI cross-references each one against your channel&apos;s context — so the output isn&apos;t a description of them, it&apos;s a list of moves you can actually take.
            </p>
          </div>
          <div className="cmp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {DIMENSIONS.map((d, i) => (
              <div key={i} style={{ background: 'var(--ytg-card)', borderRadius: 14, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--ytg-accent-light)', border: '1px solid rgba(229,48,42,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ytg-accent)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.2px' }}>{d.name}</p>
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>{d.what}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 4. GAPS TO EXPLOIT — dark, SPLIT (visual L, text R) ═══════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="cmp-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ order: isMobile ? 1 : 0 }}>
            <GapVisual />
          </div>
          <div style={{ order: isMobile ? 0 : 1 }}>
            <span className="cmp-eyebrow dark">The gap report</span>
            <h2 className="cmp-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 18 }}>
              Every gap comes with the <span style={{ color: '#ff3b30' }}>exact action to take.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72, marginBottom: 22 }}>
              The gap report is the highest-leverage output. Each entry names a specific opening — a topic they ignore, a slot they don&apos;t cover, a keyword they&apos;ve never used — paired with the move you should make and an impact tag (low / med / high). No vague advice; this is what you publish next.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Gap',           color: '#ff3b30', body: 'The specific opening, named with their data.' },
                { label: 'How to capture', color: '#4ade80', body: 'The exact action to take. Specific, not generic.' },
                { label: 'Impact',        color: '#f59e0b', body: 'Low / med / high — based on the size of the opening.' },
                { label: 'Re-runnable',   color: '#4a7cf7', body: 'Re-analyze anytime to refresh against their newest uploads.' },
              ].map((p, i) => (
                <div key={i} style={{ borderLeft: `2px solid ${p.color}`, paddingLeft: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: p.color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{p.label}</p>
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════ 5. HOW IT WORKS — white, with arrow connectors ════════════ */}
      <section id="how" style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#ffffff' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 52px' }}>
            <span className="cmp-eyebrow light">How it works</span>
            <h2 className="cmp-h2" style={{ fontSize: isMobile ? 30 : 42 }}>
              From rival channel to publishable idea in under 60 seconds
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.7, marginTop: 14, maxWidth: 560, margin: '14px auto 0' }}>
              Five stages, all of them yours to control. Re-run any analysis anytime to capture a competitor&apos;s newest uploads.
            </p>
          </div>
          {(() => {
            const steps = [
              { n: '01', t: 'Add a competitor',   b: 'Paste their channel URL or handle. Or search by keyword and pick from the matches we surface.' },
              { n: '02', t: 'Public data fetch',  b: 'Last 30 uploads pulled via the official YouTube Data API: titles, durations, dates, view counts, like counts, comment counts.' },
              { n: '03', t: 'Pattern derivation', b: 'We compute their posting cadence, top day + hour, average title length, top 5 by views, and engagement ratios.' },
              { n: '04', t: 'AI runs 7 dimensions', b: 'Claude Sonnet 4.6 analyzes content topics, SEO strategy, length, engagement, thumbnail style, and the gaps you can exploit — with your channel as context.' },
              { n: '05', t: 'You see the result',  b: 'Threat level, summary, top topics, title patterns, ranked gaps with how-to-capture moves, top videos to study, and ready-to-publish ideas.' },
            ]
            const Card = ({ s }) => (
              <div style={{ background: 'var(--ytg-card)', borderRadius: 14, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', padding: '22px 22px 24px', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--ytg-accent-light)', border: '1px solid rgba(229,48,42,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ytg-accent)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{s.n}</span>
                  </div>
                </div>
                <p style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ytg-text)', marginBottom: 10, letterSpacing: '-0.2px' }}>{s.t}</p>
                <p style={{ fontSize: 13, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>{s.b}</p>
              </div>
            )
            const Arrow = () => (
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', width: 26, height: 26, borderRadius: '50%', background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', color: 'var(--ytg-accent)' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6h8M7 3l3 3-3 3"/>
                </svg>
              </div>
            )
            const ArrowDown = () => (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', color: 'var(--ytg-accent)', margin: '8px auto' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2v8M3 7l3 3 3-3"/>
                </svg>
              </div>
            )
            if (isMobile) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {steps.map((s, i) => (
                    <div key={i}>
                      <Card s={s} />
                      {i < steps.length - 1 && <ArrowDown />}
                    </div>
                  ))}
                </div>
              )
            }
            return (
              <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
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

      {/* ════ 6. SEVEN OUTPUT PARTS — dark ═══════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 44px' }}>
            <span className="cmp-eyebrow dark">Output structure</span>
            <h2 className="cmp-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 16 }}>
              Seven distinct output blocks. <span style={{ color: '#ff3b30' }}>Every one is actionable.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72 }}>
              We don&apos;t hand you a wall of text. The AI returns a structured report, and the dashboard renders each block in its own card so you can scan, mark, and action without re-reading.
            </p>
          </div>
          <div className="cmp-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {OUTPUT_PARTS.map((p, i) => (
              <div key={i} style={{ background: '#111114', borderRadius: 14, border: '1px solid rgba(255,255,255,0.09)', padding: '22px 22px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <OutputIcon name={p.icon} />
                  <p style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>{p.title}</p>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 7. WHAT POWERS IT — light ═════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: 'var(--ytg-bg-3)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div className="cmp-grid-2" style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <span className="cmp-eyebrow light">What powers it</span>
            <h2 className="cmp-h2" style={{ fontSize: isMobile ? 28 : 38, marginBottom: 16 }}>
              Public data only. <span style={{ color: 'var(--ytg-accent)' }}>Read-only API.</span> No scraping.
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>
              We use the official YouTube Data API to read public information — the same data anyone visiting the channel can see. No private analytics, no impersonation, no terms-of-service grey areas. Each analysis costs one credit and the data is saved per channel so it feeds your channel audit context too.
            </p>
          </div>
          <div style={{ background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 16, boxShadow: 'var(--ytg-shadow-lg)', padding: '24px 28px' }}>
            {[
              { k: 'Last 30 uploads',          v: 'Titles, durations, dates, views, likes, comments, thumbnails' },
              { k: 'Channel metadata',          v: 'Subscribers, total views, video count, channel age, channel keywords' },
              { k: 'Posting behavior',          v: 'Average gap, top day, top hour, videos in last 30 days' },
              { k: 'Engagement signals',        v: 'Like-to-view, comment-to-view, like rate' },
              { k: 'Your channel context',      v: 'Your subs, avg views, posting cadence, niche keywords' },
              { k: 'AI model',                  v: 'Claude Sonnet 4.6 · 8K-token analysis · ~30s' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '11px 0', borderBottom: i < 5 ? '1px solid var(--ytg-border)' : 'none', alignItems: 'baseline' }}>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.1px', flexShrink: 0 }}>{row.k}</p>
                <p style={{ fontSize: 12.5, color: 'var(--ytg-text-2)', lineHeight: 1.55, textAlign: 'right' }}>{row.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 8. PLAN LIMITS — dark ═════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 44px' }}>
            <span className="cmp-eyebrow dark">By plan</span>
            <h2 className="cmp-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 16 }}>
              How many rivals you can track at once
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72 }}>
              Re-run any tracked competitor anytime. Counts are per-channel, so multi-channel accounts on Agency can run a full competitor stack per channel under their pooled credit allowance.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 14 }}>
            {PLAN_LIMITS.map((p, i) => {
              const isAccent = p.plan === 'Growth'
              const isLocked = p.plan === 'Free'
              return (
                <div key={i} style={{
                  background: isAccent ? '#1a1018' : '#111114',
                  borderRadius: 16,
                  border: isAccent ? '1px solid rgba(229,48,42,0.45)' : '1px solid rgba(255,255,255,0.09)',
                  boxShadow: isAccent ? '0 8px 32px rgba(229,48,42,0.18)' : '0 2px 8px rgba(0,0,0,0.4)',
                  padding: '24px 22px 22px',
                  position: 'relative',
                  opacity: isLocked ? 0.66 : 1,
                }}>
                  {isAccent && (
                    <span style={{ position: 'absolute', top: -10, right: 16, fontSize: 9, fontWeight: 800, color: '#fff', background: '#ff3b30', padding: '3px 10px', borderRadius: 100, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Most popular</span>
                  )}
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>{p.plan}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                    <p style={{ fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1 }}>{p.rivals}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>competitors</p>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>tracked at once</p>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 12 }} />
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 }}>{p.note}</p>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 22, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>Same 7-dimension analysis across all paid plans.</p>
            <a href="/#pricing" style={{ fontSize: 12.5, color: '#ff3b30', textDecoration: 'none', fontWeight: 600 }}>See full pricing →</a>
          </div>
        </div>
      </section>

      {/* ════ 9. FAQ — white ════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '110px 40px', background: '#ffffff' }}>
        <div className="cmp-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: 56, alignItems: 'flex-start' }}>
          <div style={{ position: isMobile ? 'static' : 'sticky', top: 100 }}>
            <span className="cmp-eyebrow light">FAQ</span>
            <h2 className="cmp-h2" style={{ fontSize: isMobile ? 30 : 40, marginBottom: 16 }}>
              Questions about competitive intelligence, answered honestly.
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>
              Real answers from how the product behaves — including the limits, the privacy boundaries, and what it won&apos;t do.
            </p>
            <a href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--ytg-accent)', textDecoration: 'none', fontWeight: 600, marginTop: 16 }}>
              Still have questions? Email us →
            </a>
          </div>
          <div>
            {FAQS.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ════ 10. BOTTOM CTA — light ════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '60px 20px 56px' : '110px 40px 80px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center', background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 24, boxShadow: 'var(--ytg-shadow-xl)', padding: isMobile ? '52px 24px' : '76px 60px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 540, height: 260, background: 'radial-gradient(ellipse, rgba(229,48,42,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <h2 className="cmp-h2" style={{ fontSize: isMobile ? 30 : 44, marginBottom: 16 }}>
            Find the openings your rivals are leaving
          </h2>
          <p style={{ fontSize: isMobile ? 15 : 17, color: 'var(--ytg-text-2)', maxWidth: 520, margin: '0 auto 28px', lineHeight: 1.7 }}>
            ~60 seconds per analysis. Solo plan adds 2 competitors, Growth adds 5, Agency adds 10. Most users find their first publishable idea inside 10 minutes of reading the report.
          </p>
          <a href="/auth/login" className="cmp-btn cmp-btn-lg">Analyze a competitor →</a>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
