import { useEffect, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'

/* Keyword Research — fully custom landing page.
 *
 * Built around the *actual* product (see app/keywords.py + routers/
 * keyword_routes.py): a 4-stage pipeline — multi-source autocomplete fan-out
 * (YouTube Suggest + Google Suggest via SerpAPI + Google related searches via
 * Serper) → Claude Sonnet 4.6 intent filtering + clustering → real YouTube
 * competition enrichment (top-5 ranked-channel size, view ceiling, days
 * since newest) → opportunity score weighted on feasibility / traffic ceiling
 * / freshness with an intent multiplier. Plus a momentum label
 * (active / steady / unclaimed) derived from days_since_newest.
 *
 * Target keywords: "youtube keyword research tool", "youtube search volume",
 * "low competition youtube keywords", "vidiq alternative".
 *
 * Background rhythm matches Landing.jsx / Channel Audit / Competitor Analysis
 * / SEO Studio / Thumbnail IQ: white > dark > light > dark > white > dark >
 * light > dark > white > light. Classes use the .kwr- prefix to avoid
 * collision with the in-app Keywords product page.
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
    if (document.getElementById('kwr-styles')) return
    const link = document.createElement('link')
    link.id = 'kwr-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'kwr-styles'
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

      .kwr-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--ytg-accent); color: #fff; font-size: 15px; font-weight: 700; padding: 15px 30px; border-radius: 100px; border: none; cursor: pointer; text-decoration: none; letter-spacing: -0.2px; box-shadow: 0 1px 2px rgba(0,0,0,0.14), 0 4px 20px rgba(229,48,42,0.34); transition: filter 0.18s, transform 0.18s, box-shadow 0.18s; font-family: 'Inter', system-ui, sans-serif; }
      .kwr-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,0.16), 0 12px 36px rgba(229,48,42,0.42); }
      .kwr-btn-lg { font-size: 16px; padding: 17px 38px; }
      .kwr-btn-ghost { display: inline-flex; align-items: center; gap: 8px; background: var(--ytg-card); color: var(--ytg-text-2); font-size: 15px; font-weight: 600; padding: 14px 26px; border-radius: 100px; border: 1px solid var(--ytg-border); cursor: pointer; text-decoration: none; letter-spacing: -0.2px; box-shadow: var(--ytg-shadow-sm); transition: color 0.15s, box-shadow 0.18s; font-family: 'Inter', system-ui, sans-serif; }
      .kwr-btn-ghost:hover { color: var(--ytg-text); box-shadow: var(--ytg-shadow); }

      .kwr-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 5px 13px; border-radius: 100px; margin-bottom: 16px; }
      .kwr-eyebrow.light { color: var(--ytg-accent-text); background: var(--ytg-accent-light); }
      .kwr-eyebrow.dark  { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); }

      .kwr-h1 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -2px; line-height: 1.05; text-wrap: balance; }
      .kwr-h2 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -1.4px; line-height: 1.08; text-wrap: balance; }

      .kwr-nav-link { font-size: 14px; color: var(--ytg-text-3); font-weight: 500; text-decoration: none; transition: color 0.15s; letter-spacing: -0.1px; }
      .kwr-nav-link:hover { color: var(--ytg-text-2); }

      .kwr-faq-item { border-bottom: 1px solid var(--ytg-border); }
      .kwr-faq-q { background: none; border: none; cursor: pointer; width: 100%; text-align: left; padding: 22px 0; font-family: inherit; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; font-size: 16.5px; font-weight: 700; color: var(--ytg-text); letter-spacing: -0.2px; line-height: 1.45; }
      .kwr-faq-q:hover { color: var(--ytg-accent); }
      .kwr-faq-icon { transition: transform 0.2s; flex-shrink: 0; color: var(--ytg-text-3); margin-top: 4px; }
      .kwr-faq-icon.open { transform: rotate(45deg); color: var(--ytg-accent); }
      .kwr-faq-a { font-size: 14.5px; color: var(--ytg-text-2); line-height: 1.78; padding: 0 0 22px 0; max-width: 760px; }

      @media (max-width: 900px) {
        .kwr-grid-2 { grid-template-columns: 1fr !important; gap: 32px !important; }
        .kwr-grid-3 { grid-template-columns: 1fr !important; }
        .kwr-grid-4 { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 600px) {
        .kwr-grid-4 { grid-template-columns: 1fr !important; }
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
  { href: '/features/outliers',            label: 'Outliers',            desc: 'Find viral videos and breakout channels' },
]

function FeaturesDropdown() {
  const [open, setOpen] = useState(false)
  return (
    <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} style={{ position: 'relative' }}>
      <a href="/#features" className="kwr-nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
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
    <div className="kwr-faq-item">
      <button className="kwr-faq-q" onClick={() => setOpen(o => !o)}>
        <span style={{ flex: 1 }}>{q}</span>
        <span className={`kwr-faq-icon${open ? ' open' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M8 2v12M2 8h12"/></svg>
        </span>
      </button>
      {open && <div className="kwr-faq-a">{a}</div>}
    </div>
  )
}

/* ── Visual: Keyword opportunity table with score + momentum (dark) ───── */
function KeywordTableVisual() {
  const rows = [
    { kw: 'home office cleaning vlog',  score: 91, mom: 'unclaimed', momColor: '#4ade80', diff: 'EASY',   diffColor: '#4ade80', cluster: 'Vlog' },
    { kw: 'minimalist desk setup tour', score: 84, mom: 'active',    momColor: '#4a7cf7', diff: 'EASY',   diffColor: '#4ade80', cluster: 'Setup' },
    { kw: 'small bedroom organization',  score: 78, mom: 'steady',   momColor: '#a3a3a3', diff: 'FAIR',   diffColor: '#f59e0b', cluster: 'Vlog' },
    { kw: 'cleaning routine motivation', score: 72, mom: 'active',    momColor: '#4a7cf7', diff: 'FAIR',   diffColor: '#f59e0b', cluster: 'Routine' },
    { kw: 'studio apartment cleaning',   score: 68, mom: 'unclaimed', momColor: '#4ade80', diff: 'EASY',   diffColor: '#4ade80', cluster: 'Vlog' },
    { kw: 'how to deep clean apartment', score: 54, mom: 'steady',   momColor: '#a3a3a3', diff: 'HARD',   diffColor: '#ff3b30', cluster: 'Tutorial' },
  ]
  return (
    <div style={{ background: '#111114', borderRadius: 18, border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 48px rgba(0,0,0,0.6)', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Top opportunities · seed "apartment cleaning"</p>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#4a7cf7', background: 'rgba(74,124,247,0.12)', border: '1px solid rgba(74,124,247,0.28)', padding: '2px 8px', borderRadius: 100 }}>22 of 24 kept</span>
      </div>
      {/* Header row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 0.85fr 0.85fr 0.55fr', fontSize: 9.5, fontWeight: 800, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 0 8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <p>Keyword</p>
        <p>Momentum</p>
        <p>Difficulty</p>
        <p style={{ textAlign: 'right' }}>Score</p>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.4fr 0.85fr 0.85fr 0.55fr', alignItems: 'center', padding: '11px 0', borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', fontSize: 12 }}>
          <div style={{ paddingRight: 8, minWidth: 0 }}>
            <p style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.kw}</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.42)', marginTop: 2 }}>cluster · {r.cluster}</p>
          </div>
          <span style={{ fontSize: 9.5, fontWeight: 800, color: r.momColor, background: `${r.momColor}1a`, border: `1px solid ${r.momColor}33`, padding: '2px 7px', borderRadius: 100, justifySelf: 'start', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{r.mom}</span>
          <span style={{ fontSize: 9.5, fontWeight: 800, color: r.diffColor, background: `${r.diffColor}1a`, border: `1px solid ${r.diffColor}33`, padding: '2px 7px', borderRadius: 100, justifySelf: 'start', letterSpacing: '0.04em' }}>{r.diff}</span>
          <p style={{ textAlign: 'right', fontWeight: 800, color: '#fff', fontSize: 13.5, fontVariantNumeric: 'tabular-nums' }}>{r.score}</p>
        </div>
      ))}
      {/* Top pick */}
      <div style={{ borderLeft: '3px solid #4ade80', background: 'rgba(74,222,128,0.07)', borderRadius: 8, padding: '12px 14px', marginTop: 14 }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: '#4ade80', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Top pick</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', fontWeight: 600, marginBottom: 4 }}>"home office cleaning vlog"</p>
        <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>Newest top-5 video is 220 days old · top creators &lt; 50K subs · clear topic gap.</p>
      </div>
    </div>
  )
}

/* ── Visual: Score breakdown — feasibility / traffic / freshness ───────── */
function ScoreBreakdownVisual() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[
        { label: 'Feasibility',  weight: 45, score: 100, color: '#4ade80', body: 'Top-5 channels median &lt; 10K subs — easy to outrank.' },
        { label: 'Traffic ceiling', weight: 30, score: 70, color: '#f59e0b', body: 'Top videos median 24K views — solid headroom for a small channel.' },
        { label: 'Freshness',     weight: 25, score: 100, color: '#4ade80', body: 'Newest top-5 video posted 220 days ago — landscape is wide open.' },
      ].map((d, i) => (
        <div key={i} style={{ background: '#111114', borderRadius: 14, border: '1px solid rgba(255,255,255,0.09)', borderLeft: `3px solid ${d.color}`, padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>{d.label}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}>weight {d.weight}%</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: d.color, fontVariantNumeric: 'tabular-nums' }}>{d.score}</span>
            </div>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${d.score}%`, background: d.color, borderRadius: 100 }} />
          </div>
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: d.body }}/>
        </div>
      ))}
      <div style={{ background: '#1a1018', borderRadius: 14, border: '1px solid rgba(229,48,42,0.45)', padding: '14px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>× intent multiplier (exact match)</p>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#ff3b30', fontVariantNumeric: 'tabular-nums' }}>×1.0</span>
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '10px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <p style={{ fontSize: 11.5, fontWeight: 800, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Final opportunity score</p>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>91</span>
        </div>
      </div>
    </div>
  )
}

/* ── Score signals — what the opportunity score is built from ─────────── */
const SCORE_SIGNALS = [
  { name: 'Feasibility (45% weight)',      what: 'Median subscriber count of the top 5 ranking channels. Below 10K subs scores 100 (easy to outrank). 10–100K = 75. 100K–1M = 45. Above 1M = 15 (brutal — incumbent dominates).' },
  { name: 'Traffic ceiling (30% weight)',  what: 'Median view count of the top 5 ranking videos. 100K+ = 100 (strong traffic to win). 10K–100K = 70 (decent). Below 10K = 45 (thin, may not be worth pursuing).' },
  { name: 'Freshness (25% weight)',        what: 'Days since the most recent top-5 video. Below 30 days = 40 (active competition). 30–180 days = 70 (normal). 180+ days = 100 (landscape stale, opportunity wide open).' },
  { name: 'Intent match multiplier',       what: 'Exact intent = ×1.0. Strong = ×0.9. Partial = ×0.75. Off-intent drift gets scaled down even if the surface metrics look good — keeps the score honest about what your video would actually compete for.' },
  { name: 'Autocomplete rank bonus',       what: 'Where the keyword appears in YouTube’s autocomplete pool. Position 0–4 adds +8. Position 5–14 adds +4. Earlier autocomplete position is the strongest single signal that real viewers type the phrase.' },
  { name: 'Momentum label',                what: 'Active (newest top-5 video &lt; 30 days), Steady (30–180 days), Unclaimed (180+ days). Cheap badge on every keyword so you can see at a glance whether competitors are actively shipping.' },
]

const PIPELINE_OUTPUTS = [
  { icon: 'gauge',  title: 'Opportunity score 0–100',     body: 'Weighted on feasibility (45%) + traffic ceiling (30%) + freshness (25%), with an intent multiplier and autocomplete-rank bonus. Same formula every keyword — explainable, repeatable.' },
  { icon: 'fan',    title: '15–25 filtered keywords',     body: 'Claude reads 30+ raw suggestions, drops off-topic / branded / duplicate, keeps only those that match your seed intent. Each one tagged with content angle and intent strength.' },
  { icon: 'cluster',title: '3–5 named clusters',          body: 'Keywords grouped into thematic clusters (e.g. "Tutorial · cleaning routines", "Vlog · room makeovers"). Tells you what 3-month content arc you could ship from one search.' },
  { icon: 'pulse',  title: 'Momentum tag per keyword',    body: 'Active (creators ship weekly) · Steady (normal) · Unclaimed (top videos &gt; 6 months old). Lets you spot landscapes nobody is currently fighting over.' },
  { icon: 'compass',title: 'Top pick + reason',           body: 'The single highest-opportunity keyword surfaced, with a one-sentence "why this one" — so you stop scrolling and start scripting.' },
  { icon: 'tag',    title: 'Content angle per keyword',   body: 'Each kept keyword carries a one-sentence angle suggestion. Not a template — anchored to the intent and the niche, so the angle reads as a video idea you’d actually publish.' },
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
    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--ytg-accent-light)', border: '1px solid rgba(229,48,42,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#e5302a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d={ICON_PATHS[name]}/>
      </svg>
    </div>
  )
}

const PLAN_LIMITS = [
  { plan: 'Free',    runs: '1',   note: 'One full keyword search per cycle — same engine as paid plans' },
  { plan: 'Solo',    runs: '20',  note: 'Search every video idea · 3 channels' },
  { plan: 'Growth',  runs: '50',  note: 'Same engine, higher monthly allowance · 5 channels' },
  { plan: 'Agency',  runs: '150', note: 'Pooled across 10 channels' },
]

const FAQS = [
  {
    q: 'Where does the search-volume signal come from? You don’t have YouTube’s real volume API.',
    a: <>Correct — YouTube doesn’t expose true search volume publicly. We use a multi-source proxy that’s genuinely close. We pull suggestions from YouTube’s own autocomplete (only surfaces high-volume queries by definition), Google’s autocomplete via SerpAPI, and Google’s "related searches" via Serper. The strongest signal is autocomplete rank — earlier positions correlate strongly with real query volume because that’s how Google ranks them. We’re not estimating an exact monthly number; we’re ranking phrases by relative demand using signals YouTube’s own ranking engine uses.</>,
  },
  {
    q: 'How is "competition" calculated — and why isn’t it just "search result count"?',
    a: <>Result count alone is misleading: 50K results dominated by one mega-channel is easier to break into than 5K results split across small channels. So for the top 10 keywords from your search, we hit the YouTube Data API and pull the real top 5 ranking videos, then look up <i>median subscriber count</i> across those channels. Below 10K = easy. 10–100K = fair. 100K–1M = hard. Above 1M = brutal. Plus median views on those top 5 (your traffic ceiling) and days since the newest one was published (the freshness signal). Three real numbers, not a vague difficulty label.</>,
  },
  {
    q: 'What’s the "momentum" label? Is that Google Trends?',
    a: <>No — pytrends and the paid Trends API are unreliable for niche queries. We derive momentum from data we already have: <b>active</b> (newest top-5 video &lt; 30 days = creators are shipping right now), <b>steady</b> (30–180 days = normal cadence), <b>unclaimed</b> (180+ days = nobody is actively fighting for this keyword). Unclaimed keywords are the highest-leverage gaps because the search demand exists but no recent video is competing for it.</>,
  },
  {
    q: 'How does the opportunity score work — what does 91/100 actually mean?',
    a: <>Score = (feasibility × 0.45 + traffic × 0.30 + freshness × 0.25) × intent multiplier + autocomplete bonus. Each component is 0–100. Feasibility rewards low top-5 channel size. Traffic rewards a strong view ceiling. Freshness rewards stale (i.e. open) landscapes. Intent multiplier (exact / strong / partial) keeps off-topic drift from inflating the score. So a 91 means the top 5 ranking channels are small AND their videos pull strong views AND nobody’s posted recently AND your seed intent matches exactly — the highest-leverage combination.</>,
  },
  {
    q: 'Why does Claude filter the keyword list before scoring?',
    a: <>Raw autocomplete + related-search dumps are noisy — they include branded queries ("VidIQ alternative" when you searched "youtube growth"), off-intent drift ("youtube to mp3" on a creator-tools search), and obvious duplicates. Claude reads all 30+ raw suggestions in one pass, drops the noise, keeps the 15–25 phrases that genuinely match your seed intent, and tags each with a content angle. The competition enrichment then runs only on those — keeps API quota efficient and the final ranking clean.</>,
  },
  {
    q: 'How is this different from VidIQ or TubeBuddy?',
    a: <>Three differences worth knowing. First, our competition score uses real top-5 channel size + real view ceiling + real freshness — not a global difficulty estimate. Second, every kept keyword carries a Claude-written content angle so you don’t leave the tool wondering what to make. Third, the momentum label surfaces unclaimed niches (top videos &gt; 6 months old) that legacy tools don’t flag. We’re not trying to replace global volume estimates; we’re replacing vague difficulty scores with a real-data view of who you’d actually compete with.</>,
  },
  {
    q: 'Will this work for international / non-English niches?',
    a: <>Mostly yes. The autocomplete sources (YouTube Suggest, SerpAPI, Serper) all return localized results when you seed in another language — so the keyword pool will be relevant. The Claude intent filtering works across languages. The competition enrichment is language-agnostic (it’s pulling raw API data). The one weak spot is the autocomplete-rank bonus, which calibrates best for English-language queries — for non-English the bonus contributes a smaller fraction of the final score. Still useful, just lean more on momentum + feasibility for non-English niches.</>,
  },
  {
    q: 'How long does a search take, and what does it cost?',
    a: <>~25–40 seconds end-to-end. Behind the scenes: YouTube Suggest scrape (parallel), SerpAPI autocomplete + Serper related-search (parallel), Claude Sonnet 4.6 intent filter + cluster, then YouTube Data API competition enrichment for the top 10 keywords (parallel, 5 workers). Each search is one credit on paid plans. Free creators get one full search per cycle — same engine, no feature differences. Re-running the same seed charges a new credit because the competition data is fetched fresh.</>,
  },
  {
    q: 'Does the YouTube competition fetch use my OAuth quota?',
    a: <>No — that’s deliberate. The competition enrichment uses an anonymous YouTube Data API key on our side, not your OAuth credential. So even if you run 50 keyword searches in a day, your channel’s OAuth quota is untouched and remains fully available for the SEO Studio analyses, channel audits, and competitor analyses that <i>do</i> need read access to your private data.</>,
  },
  {
    q: 'Can I export the keyword list?',
    a: <>The keyword table stays inside your YTGrowth dashboard for now — every search is saved per channel and reopens with full data + the original seed. PDF / CSV export is on the near-term roadmap; if it’s critical for an agency workflow email support and we’ll prioritize. The faster pattern most users find: copy the top 5 picks straight into the SEO Studio and run title rewrites against each one.</>,
  },
  {
    q: 'Are searches saved? Can I reopen them later?',
    a: <>Yes. Every search persists per channel and shows up in your search history with the seed keyword + timestamp. Click any past search to reopen the full table — keywords, scores, momentum tags, clusters, top pick, competition snapshots. Re-running an old seed creates a fresh entry instead of overwriting, so you can compare how a niche has shifted over time.</>,
  },
  {
    q: 'Does Keyword Research feed into the other tools?',
    a: <>Yes — the keyword data is shared infrastructure. The SEO Studio reuses the same intent-options + autocomplete fan-out for its title scoring. The Outliers feature uses the same intent picker for its viral video search. The clusters from Keyword Research can be sent straight into Competitor Analysis as the niche keyword set. Every tool gets sharper the more keyword searches you run.</>,
  },
]

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function KeywordResearch() {
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
          {!isMobile && <a href="/#pricing" className="kwr-nav-link">Pricing</a>}
          <a href="/auth/login" className="kwr-btn" style={{ padding: isMobile ? '8px 18px' : '9px 22px', fontSize: 13, borderRadius: 100, whiteSpace: 'nowrap', boxShadow: 'none' }}>
            Find a winning keyword
          </a>
        </div>
      </nav>

      {/* ════ 1. HERO — white ════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px 56px' : '110px 40px 80px', textAlign: 'center', background: '#ffffff' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', animation: 'fadeUp 0.5s ease both' }}>
          <span className="kwr-eyebrow light">YouTube Keyword Research</span>
          <h1 className="kwr-h1" style={{ fontSize: isMobile ? 36 : 60, color: 'var(--ytg-text)', marginBottom: 22 }}>
            YouTube keyword research that uses <span style={{ color: 'var(--ytg-accent)' }}>real competition data — not vibes.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18.5, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 36px' }}>
            Type a seed. The studio fans out across YouTube Suggest, Google autocomplete, and Google related searches, filters with AI to keep only on-intent phrases, then scores each one against the real top 5 ranking channels — their median subscriber count, view ceiling, and how stale the landscape is. The keywords your niche is missing, surfaced in 30 seconds.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/login" className="kwr-btn kwr-btn-lg">Find a keyword →</a>
            <a href="#how" className="kwr-btn-ghost" style={{ padding: '15px 26px', fontSize: 15 }}>See how it works</a>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', marginTop: 22 }}>
            Free creators get one full search per cycle · ~30 seconds end-to-end · all signals from real YouTube data
          </p>
        </div>
      </section>

      {/* ════ 2. KEYWORD TABLE VISUAL — dark, SPLIT (text L, visual R) ══ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.16) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="kwr-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 64, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <span className="kwr-eyebrow dark">The keyword table</span>
            <h2 className="kwr-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 18 }}>
              15–25 keywords <span style={{ color: '#ff3b30' }}>scored on what actually moves rankings.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72, marginBottom: 24 }}>
              Every kept phrase carries an opportunity score, momentum tag, difficulty pill, and the cluster it belongs to. Sortable, scannable, and grounded in real YouTube competition data — not a global difficulty estimate that doesn’t know what your channel is targeting.
            </p>
            {[
              'Score weighted on real competitor channel size',
              'Momentum tag — see unclaimed niches at a glance',
              'Difficulty pill from real top-5 channel medians',
              '3–5 thematic clusters surfaced from the same data',
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 11 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#4ade80" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M2.5 7.2 5.4 10l6.1-6"/></svg>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6 }}>{b}</span>
              </div>
            ))}
          </div>
          <div>
            <KeywordTableVisual />
          </div>
        </div>
      </section>

      {/* ════ 3. SCORE SIGNALS — light ══════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 48px' }}>
            <span className="kwr-eyebrow light">What the score is built from</span>
            <h2 className="kwr-h2" style={{ fontSize: isMobile ? 30 : 42, marginBottom: 16 }}>
              Six real signals. <span style={{ color: 'var(--ytg-accent)' }}>One opportunity score.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>
              The opportunity score isn’t a vibe — it’s a weighted formula. Three competition signals (feasibility, traffic, freshness), one intent multiplier, one autocomplete-rank bonus, and a momentum label. Same formula every keyword, so you can trust the comparison across searches.
            </p>
          </div>
          <div className="kwr-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {SCORE_SIGNALS.map((d, i) => (
              <div key={i} style={{ background: 'var(--ytg-card)', borderRadius: 14, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--ytg-accent-light)', border: '1px solid rgba(229,48,42,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ytg-accent)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.2px' }}>{d.name}</p>
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--ytg-text-2)', lineHeight: 1.72 }} dangerouslySetInnerHTML={{ __html: d.what }}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 4. SCORE BREAKDOWN — dark, SPLIT (visual L, text R) ═══════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="kwr-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ order: isMobile ? 1 : 0 }}>
            <ScoreBreakdownVisual />
          </div>
          <div style={{ order: isMobile ? 0 : 1 }}>
            <span className="kwr-eyebrow dark">Anatomy of an opportunity score</span>
            <h2 className="kwr-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 18 }}>
              You see the math. <span style={{ color: '#ff3b30' }}>So you trust the rank.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72, marginBottom: 22 }}>
              Click any keyword to expand the breakdown. Feasibility (45%) measures how dominant the top 5 channels are. Traffic ceiling (30%) measures the view headroom. Freshness (25%) measures whether anyone’s actively shipping in the niche. Multiplied by intent match. Plus a small autocomplete-rank bonus. No black box, no proprietary "DA-equivalent" — just the formula.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Feasibility',   color: '#4ade80', body: 'Top-5 channels — smaller = higher score.' },
                { label: 'Traffic',       color: '#f59e0b', body: 'Top-5 view ceiling — bigger = higher score.' },
                { label: 'Freshness',     color: '#4a7cf7', body: 'Days since newest top-5 video — staler = higher.' },
                { label: 'Intent × bonus', color: '#ff3b30', body: 'Exact / strong / partial. Plus autocomplete-rank lift.' },
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
            <span className="kwr-eyebrow light">How it works</span>
            <h2 className="kwr-h2" style={{ fontSize: isMobile ? 30 : 42 }}>
              From seed keyword to ranked opportunity in 30 seconds
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.7, marginTop: 14, maxWidth: 600, margin: '14px auto 0' }}>
              Five stages, all of them parallelized. The competition enrichment runs only on the top 10 by initial score so you don’t pay for low-signal data.
            </p>
          </div>
          {(() => {
            const steps = [
              { n: '01', t: 'Seed keyword',         b: 'Type the broad topic you want to publish about. The studio uses your channel’s niche keywords as additional context to keep the suggestions on-brand.' },
              { n: '02', t: 'Multi-source fan-out', b: 'In parallel: YouTube Suggest scrape, SerpAPI Google autocomplete, Serper "related searches". 30+ raw suggestions in ~3 seconds.' },
              { n: '03', t: 'Claude intent filter', b: 'Sonnet 4.6 reads all 30+ suggestions, drops off-intent / branded / duplicates, keeps 15–25 phrases that match your seed intent. Tags content angle + intent strength on each.' },
              { n: '04', t: 'Real competition fetch', b: 'For the top 10 by initial score: real YouTube top-5 results — channel size, view ceiling, days since newest. Parallel, anonymous API key, ~10 seconds.' },
              { n: '05', t: 'Score + cluster',      b: 'Final score = feasibility×0.45 + traffic×0.30 + freshness×0.25, intent multiplier, autocomplete bonus. 3–5 thematic clusters surfaced. Top pick named.' },
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

      {/* ════ 6. SEVEN OUTPUT BLOCKS — dark ══════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 44px' }}>
            <span className="kwr-eyebrow dark">Output structure</span>
            <h2 className="kwr-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 16 }}>
              Seven distinct output blocks. <span style={{ color: '#ff3b30' }}>Every keyword is publishable.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72 }}>
              You don’t leave the studio with a list of phrases. You leave with a ranked, scored, clustered, intent-filtered keyword set — each one carrying a content angle so the next step is "open SEO Studio", not "now what".
            </p>
          </div>
          <div className="kwr-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {PIPELINE_OUTPUTS.map((p, i) => (
              <div key={i} style={{ background: '#111114', borderRadius: 14, border: '1px solid rgba(255,255,255,0.09)', padding: '22px 22px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <OutputIcon name={p.icon} />
                  <p style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>{p.title}</p>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: p.body }}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 7. WHAT POWERS IT — light grey, split ═════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: 'var(--ytg-bg-3)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div className="kwr-grid-2" style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <span className="kwr-eyebrow light">What powers it</span>
            <h2 className="kwr-h2" style={{ fontSize: isMobile ? 28 : 38, marginBottom: 16 }}>
              Three live data sources. <span style={{ color: 'var(--ytg-accent)' }}>One AI judgement layer.</span>
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>
              Real autocomplete from YouTube and Google, real "related searches" from Google’s SERP, and real top-5 ranking data from the YouTube Data API. Claude Sonnet 4.6 sits in the middle as the intent filter and clustering layer — but every score component is grounded in numbers we actually fetched, not estimated.
            </p>
          </div>
          <div style={{ background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 16, boxShadow: 'var(--ytg-shadow-lg)', padding: '24px 28px' }}>
            {[
              { k: 'Autocomplete (YouTube)',  v: 'Direct Suggest API · ranked positions surface real demand' },
              { k: 'Autocomplete (Google)',    v: 'SerpAPI Google Suggest · localized to your region' },
              { k: 'Related searches',         v: 'Serper Google SERP · "people also searched" panel' },
              { k: 'Competition data',         v: 'YouTube Data API · search.list + videos.list + channels.list' },
              { k: 'Intent filter + clusters', v: 'Claude Sonnet 4.6 · drops noise, tags angle + intent strength' },
              { k: 'API quota',                v: 'Anonymous YouTube key · doesn’t touch your OAuth quota' },
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
            <span className="kwr-eyebrow dark">By plan</span>
            <h2 className="kwr-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 16 }}>
              How many keyword searches you get each month
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72 }}>
              Free creators get one full search per cycle so you can prove the engine on a real keyword. Paid plans charge one credit per search — same engine, no feature differences. Re-running an old seed creates a fresh entry so you can track how a niche shifts over time.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 14 }}>
            {PLAN_LIMITS.map((p, i) => {
              const isAccent = p.plan === 'Growth'
              return (
                <div key={i} style={{
                  background: isAccent ? '#1a1018' : '#111114',
                  borderRadius: 16,
                  border: isAccent ? '1px solid rgba(229,48,42,0.45)' : '1px solid rgba(255,255,255,0.09)',
                  boxShadow: isAccent ? '0 8px 32px rgba(229,48,42,0.18)' : '0 2px 8px rgba(0,0,0,0.4)',
                  padding: '24px 22px 22px',
                  position: 'relative',
                }}>
                  {isAccent && (
                    <span style={{ position: 'absolute', top: -10, right: 16, fontSize: 9, fontWeight: 800, color: '#fff', background: '#ff3b30', padding: '3px 10px', borderRadius: 100, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Most popular</span>
                  )}
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>{p.plan}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                    <p style={{ fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{p.runs}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{p.plan === 'Free' ? 'search' : 'searches'}</p>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>{p.plan === 'Free' ? 'per cycle' : 'included per month'}</p>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 12 }} />
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 }}>{p.note}</p>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 22, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>Same engine across every plan, including free.</p>
            <a href="/#pricing" style={{ fontSize: 12.5, color: '#ff3b30', textDecoration: 'none', fontWeight: 600 }}>See full pricing →</a>
          </div>
        </div>
      </section>

      {/* ════ 9. FAQ — white ════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '110px 40px', background: '#ffffff' }}>
        <div className="kwr-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: 56, alignItems: 'flex-start' }}>
          <div style={{ position: isMobile ? 'static' : 'sticky', top: 100 }}>
            <span className="kwr-eyebrow light">FAQ</span>
            <h2 className="kwr-h2" style={{ fontSize: isMobile ? 30 : 40, marginBottom: 16 }}>
              Questions about the keyword research engine, answered honestly.
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>
              Real answers from how the product behaves — the data sources, the score formula, the YouTube quota boundary, and what won’t work.
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
          <h2 className="kwr-h2" style={{ fontSize: isMobile ? 30 : 44, marginBottom: 16 }}>
            Find a winning keyword in your niche
          </h2>
          <p style={{ fontSize: isMobile ? 15 : 17, color: 'var(--ytg-text-2)', maxWidth: 540, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Free creators get one full search per cycle. Solo gets 20 / month, Growth 50, Agency 150 pooled. Most users find their first publishable keyword inside the first search.
          </p>
          <a href="/auth/login" className="kwr-btn kwr-btn-lg">Find a keyword →</a>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
