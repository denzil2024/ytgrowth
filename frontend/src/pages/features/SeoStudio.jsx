import { useEffect, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'

/* SEO Studio — fully custom landing page.
 *
 * Built around the *actual* product (see app/seo.py + routers/seo_routes.py):
 * a 3-stage pipeline — title scoring (deterministic SEO/CTR/Hook rubric) →
 * 5-then-3 AI title rewrites (Claude Sonnet 4.6, with live YouTube competitor
 * data + creator's own viral history) → 3 rewritten descriptions with a
 * 3-hashtag CamelCase footer. Plus video-level critique (title + description +
 * thumbnail vision) and one-click apply via the official YouTube Data API.
 *
 * Background rhythm matches Landing.jsx and the Channel Audit / Competitor
 * Analysis pages: white → dark → light → dark → white → dark → light → dark →
 * white → light.
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
    if (document.getElementById('seo-styles')) return
    const link = document.createElement('link')
    link.id = 'seo-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'seo-styles'
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

      .seo-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--ytg-accent); color: #fff; font-size: 15px; font-weight: 700; padding: 15px 30px; border-radius: 100px; border: none; cursor: pointer; text-decoration: none; letter-spacing: -0.2px; box-shadow: 0 1px 2px rgba(0,0,0,0.14), 0 4px 20px rgba(229,48,42,0.34); transition: filter 0.18s, transform 0.18s, box-shadow 0.18s; font-family: 'Inter', system-ui, sans-serif; }
      .seo-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,0.16), 0 12px 36px rgba(229,48,42,0.42); }
      .seo-btn-lg { font-size: 16px; padding: 17px 38px; }
      .seo-btn-ghost { display: inline-flex; align-items: center; gap: 8px; background: var(--ytg-card); color: var(--ytg-text-2); font-size: 15px; font-weight: 600; padding: 14px 26px; border-radius: 100px; border: 1px solid var(--ytg-border); cursor: pointer; text-decoration: none; letter-spacing: -0.2px; box-shadow: var(--ytg-shadow-sm); transition: color 0.15s, box-shadow 0.18s; font-family: 'Inter', system-ui, sans-serif; }
      .seo-btn-ghost:hover { color: var(--ytg-text); box-shadow: var(--ytg-shadow); }

      .seo-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        font-size: 11px; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase;
        padding: 5px 13px; border-radius: 100px; margin-bottom: 16px;
      }
      .seo-eyebrow.light { color: var(--ytg-accent-text); background: var(--ytg-accent-light); }
      .seo-eyebrow.dark  { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); }

      .seo-h1 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -2px; line-height: 1.05; text-wrap: balance; }
      .seo-h2 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -1.4px; line-height: 1.08; text-wrap: balance; }

      .seo-nav-link { font-size: 14px; color: var(--ytg-text-3); font-weight: 500; text-decoration: none; transition: color 0.15s; letter-spacing: -0.1px; }
      .seo-nav-link:hover { color: var(--ytg-text-2); }

      .seo-faq-item { border-bottom: 1px solid var(--ytg-border); }
      .seo-faq-q { background: none; border: none; cursor: pointer; width: 100%; text-align: left; padding: 22px 0; font-family: inherit; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; font-size: 16.5px; font-weight: 700; color: var(--ytg-text); letter-spacing: -0.2px; line-height: 1.45; }
      .seo-faq-q:hover { color: var(--ytg-accent); }
      .seo-faq-icon { transition: transform 0.2s; flex-shrink: 0; color: var(--ytg-text-3); margin-top: 4px; }
      .seo-faq-icon.open { transform: rotate(45deg); color: var(--ytg-accent); }
      .seo-faq-a { font-size: 14.5px; color: var(--ytg-text-2); line-height: 1.78; padding: 0 0 22px 0; max-width: 760px; }

      @media (max-width: 900px) {
        .seo-grid-2 { grid-template-columns: 1fr !important; gap: 32px !important; }
        .seo-grid-3 { grid-template-columns: 1fr !important; }
        .seo-grid-4 { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 600px) {
        .seo-grid-4 { grid-template-columns: 1fr !important; }
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
      <a href="/#features" className="seo-nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
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
    <div className="seo-faq-item">
      <button className="seo-faq-q" onClick={() => setOpen(o => !o)}>
        <span style={{ flex: 1 }}>{q}</span>
        <span className={`seo-faq-icon${open ? ' open' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M8 2v12M2 8h12"/></svg>
        </span>
      </button>
      {open && <div className="seo-faq-a">{a}</div>}
    </div>
  )
}

/* ── Visual: Title scorecard with rubric breakdown + AI rewrites (dark) ── */
function TitleScorecardVisual() {
  return (
    <div style={{ background: '#111114', borderRadius: 18, border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 48px rgba(0,0,0,0.6)', padding: 26 }}>
      {/* Original title pill */}
      <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Your title</p>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, padding: '12px 14px', marginBottom: 18, fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
        How I doubled my YouTube views in 30 days
      </div>
      {/* Score header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 46, fontWeight: 800, color: '#f59e0b', letterSpacing: '-2px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>62</span>
        <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.35)' }}>/100</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, color: '#f59e0b', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', padding: '3px 9px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Needs work</span>
      </div>
      {/* Rubric bars — same dimensions the deterministic rubric scores */}
      {[
        { label: 'SEO · keyword overlap',   score: 72, color: '#4ade80' },
        { label: 'CTR · click-through pull', score: 58, color: '#f59e0b' },
        { label: 'Hook · opener strength',   score: 51, color: '#f59e0b' },
        { label: 'Length 50–70 chars',       score: 88, color: '#4ade80' },
      ].map((row, i) => (
        <div key={i} style={{ marginBottom: i < 3 ? 11 : 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>{row.label}</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: row.color, fontVariantNumeric: 'tabular-nums' }}>{row.score}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${row.score}%`, background: row.color, borderRadius: 100 }} />
          </div>
        </div>
      ))}
      {/* AI rewrite — top of the 3 returned */}
      <div style={{ borderLeft: '3px solid #4ade80', background: 'rgba(74,222,128,0.07)', borderRadius: 8, padding: '13px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI rewrite · score 91</p>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 100 }}>1 of 3</span>
        </div>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.92)', lineHeight: 1.55, fontWeight: 600, marginBottom: 8 }}>
          I Tried 3 YouTube Strategies for 30 Days | What Actually Doubled My Views
        </p>
        <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>
          <span style={{ color: '#4ade80', fontWeight: 700 }}>Why: </span>first-person opener, pipe structure, no year, anchored to gap_opportunity from competitor analysis
        </p>
      </div>
    </div>
  )
}

/* ── Visual: Description rewrite — opening + body + 3 hashtags (dark) ─── */
function DescriptionVisual() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* BEFORE */}
      <div style={{ background: '#111114', borderRadius: 14, border: '1px solid rgba(255,255,255,0.09)', borderLeft: '3px solid #ff3b30', padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: '#ff3b30', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Before</p>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontVariantNumeric: 'tabular-nums' }}>48 words · score 38</span>
        </div>
        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, fontStyle: 'italic' }}>
          "Hey guys! Welcome back to my channel. In this video I'm going to show you how I doubled my YouTube views. Don't forget to like and subscribe! Hit the bell icon..."
        </p>
      </div>
      {/* AFTER — opening visible above the fold */}
      <div style={{ background: '#111114', borderRadius: 14, border: '1px solid rgba(255,255,255,0.09)', borderLeft: '3px solid #4ade80', padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: '#4ade80', letterSpacing: '0.08em', textTransform: 'uppercase' }}>After · option 1 of 3</p>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontVariantNumeric: 'tabular-nums' }}>342 words · score 89</span>
        </div>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Visible before "Show more"</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', lineHeight: 1.65, fontWeight: 500, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          The exact 3-strategy YouTube growth experiment that doubled my channel views in 30 days — full breakdown of what worked, what flopped, and the data behind every change.
        </p>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Body excerpt</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 12 }}>
          I ran three different growth tactics over 30 days — keyword research, retention hooks, and end-screen optimization. Two of them moved the needle. One didn't. Here's the full breakdown so you can skip the dead ends...
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['#YouTubeGrowth', '#YouTubeViews', '#YouTubeStrategy'].map((h, i) => (
            <span key={i} style={{ fontSize: 11, fontWeight: 700, color: '#4a7cf7', background: 'rgba(74,124,247,0.1)', border: '1px solid rgba(74,124,247,0.25)', padding: '4px 10px', borderRadius: 100 }}>{h}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Visual: Keyword scoring panel — volume + competition like VidIQ ──── */
function KeywordPanelVisual() {
  const rows = [
    { kw: 'youtube growth strategy', vol: 'HIGH', volColor: '#4ade80', comp: 'LOW',  compColor: '#4ade80', score: 92 },
    { kw: 'double youtube views',    vol: 'MED',  volColor: '#f59e0b', comp: 'LOW',  compColor: '#4ade80', score: 84 },
    { kw: '30 day youtube challenge', vol: 'MED',  volColor: '#f59e0b', comp: 'MED',  compColor: '#f59e0b', score: 71 },
    { kw: 'youtube algorithm 2026',  vol: 'HIGH', volColor: '#4ade80', comp: 'HIGH', compColor: '#ff3b30', score: 54 },
    { kw: 'small channel tips',      vol: 'LOW',  volColor: '#ff3b30', comp: 'LOW',  compColor: '#4ade80', score: 48 },
  ]
  return (
    <div style={{ background: '#ffffff', borderRadius: 18, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-lg)', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--ytg-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>High-opportunity keywords</p>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent)', background: 'var(--ytg-accent-light)', padding: '3px 9px', borderRadius: 100 }}>5 of 15</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.7fr 0.9fr 0.5fr', fontSize: 10, fontWeight: 700, color: 'var(--ytg-text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0 0 8px', borderBottom: '1px solid var(--ytg-border)' }}>
        <p>Phrase</p>
        <p>Volume</p>
        <p>Competition</p>
        <p style={{ textAlign: 'right' }}>Score</p>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.7fr 0.9fr 0.5fr', alignItems: 'center', padding: '11px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--ytg-border)' : 'none', fontSize: 12.5 }}>
          <p style={{ color: 'var(--ytg-text)', fontWeight: 600, paddingRight: 8 }}>{r.kw}</p>
          <span style={{ fontSize: 10, fontWeight: 800, color: r.volColor, background: `${r.volColor}1a`, padding: '2px 8px', borderRadius: 100, justifySelf: 'start', letterSpacing: '0.04em' }}>{r.vol}</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: r.compColor, background: `${r.compColor}1a`, padding: '2px 8px', borderRadius: 100, justifySelf: 'start', letterSpacing: '0.04em' }}>{r.comp}</span>
          <p style={{ textAlign: 'right', fontWeight: 800, color: 'var(--ytg-text)', fontVariantNumeric: 'tabular-nums' }}>{r.score}</p>
        </div>
      ))}
    </div>
  )
}

/* ── 6 dimensions the rubric scores (deterministic + AI hybrid) ────────── */
const DIMENSIONS = [
  { name: 'Length & character count',   what: 'Your title scored against the 50–70 character sweet spot. Lengths outside that band lose CTR on mobile and get truncated on desktop search results.' },
  { name: 'Keyword overlap (fuzzy stem)', what: 'How many words from the niche keyword actually appear in the title — using stem matching so "shop", "shopping", "shopped" all count. Anti-stuffing penalty applies above the threshold.' },
  { name: 'Front-loading',              what: 'Whether the first three words contain a power word, question starter, or number. Front-loaded titles win the scroll because YouTube truncates after the first ~30 characters on mobile.' },
  { name: 'Hook structure (pipe / brackets)', what: 'Detects whether the title uses YouTube’s proven structural patterns: pipe dividers, brackets, parens. These add a second-beat curiosity layer without spending more characters.' },
  { name: 'Viral format match',         what: 'Pattern-matches against the proven viral title formats — listicle, transformation, contrast, journey, deep-dive. Anchors the title to a frame YouTube’s recommendation engine already understands.' },
  { name: 'Power words + numbers',      what: 'Power-word density and presence of any number. Strict caps so the title doesn’t feel templated; the rubric rewards naturally-placed words over keyword bingo.' },
]

const PIPELINE_OUTPUTS = [
  { icon: 'gauge',  title: 'Title score (0–100)',         body: 'Deterministic rubric across SEO, CTR, hook, and length — same numbers every time. Plus Claude’s subjective CTR + Hook scores so subjective qualities aren’t fudged with regex.' },
  { icon: 'edit',   title: '3 AI title rewrites',           body: 'Claude generates 5, the system ranks them, you see the strongest 3. Each anchored to a gap_opportunity surfaced from the live competitor data — not generic templates.' },
  { icon: 'gap',    title: 'Gap analysis from live data',   body: 'The AI reads the actual top YouTube results for your niche, names the angle every competitor shares (overused), and the angle every competitor misses (your wedge).' },
  { icon: 'layers', title: 'Keyword opportunity table',     body: 'Up to 15 keyword phrases scored on volume + competition. Volume from autocomplete frequency. Competition from how many top videos already target the exact phrase in their title.' },
  { icon: 'pen',    title: '3 description rewrites',        body: '300–400 words each, opening hook above the fold, primary keywords woven naturally into the body, and 3 CamelCase hashtags pulled from real autocomplete data — not invented.' },
  { icon: 'eye',    title: 'Per-video critique (vision)',   body: 'On any uploaded video: title score, description verdict + rewrite, plus a Claude-vision read of the thumbnail (face, contrast, text-overlay, composition) with specific tips.' },
  { icon: 'apply',  title: 'One-click apply to YouTube',    body: 'Picked a rewrite? Push it back to YouTube with one click via the official Data API. We snapshot the before/after so you can track which optimizations actually moved views.' },
]

const ICON_PATHS = {
  gauge:  'M3 11a5 5 0 0 1 10 0M8 8v3l2 2',
  edit:   'M3 13l3-1 8-8-2-2-8 8zM10 4l2 2',
  gap:    'M2 8h5M9 8h5M5 5l-3 3 3 3M11 5l3 3-3 3',
  layers: 'M2 4l6-2 6 2-6 2zM2 8l6 2 6-2M2 12l6 2 6-2',
  pen:    'M3 13l8-8 2 2-8 8H3v-2zM10 4l2 2',
  eye:    'M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
  apply:  'M2 8.5l3 3 7-7M11 9v3.5l3-1.5',
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
  { plan: 'Free',    runs: '0',   note: 'Not included on free tier — SEO Studio is paid-only' },
  { plan: 'Solo',    runs: '20',  note: 'Title + description + apply-to-YouTube · 3 channels' },
  { plan: 'Growth',  runs: '50',  note: 'Same engine, higher monthly allowance · 5 channels' },
  { plan: 'Agency',  runs: '150', note: 'Pooled across 10 channels · per-video critique included' },
]

const FAQS = [
  {
    q: 'How is the title score actually calculated — is it just a vibe check from AI?',
    a: <>No. The score is a hybrid: the SEO component is fully deterministic (length, keyword overlap with fuzzy stem matching, anti-stuffing checks, pipe discipline, viral format detection) so it returns the same number every time. The CTR and Hook components come from Claude’s judgement against a rubric that’s embedded in the prompt — because regex can’t reliably score subjective qualities like emotional pull or opener strength. The combined score is what you see; the breakdown is shown so you can see exactly which dimensions cost you points.</>,
  },
  {
    q: 'Why do you pick a "confirmed keyword" before running the analysis?',
    a: <>Because most titles are ambiguous. A title like "My morning routine" could be a wellness video, a productivity video, or a parenting video — the search competition is wildly different in each case. Before the full analysis runs, the studio shows 3 keyword intent options and you pick the one that matches your actual video. That choice anchors the YouTube search, the keyword scoring, and the AI’s gap analysis. If you skip the picker, the AI will best-guess from the title alone — still useful, just less precise.</>,
  },
  {
    q: 'Where do the AI title rewrites come from? Are they generic templates?',
    a: <>No. Claude reads the live top 10 YouTube results for your niche keyword (titles + view counts), the YouTube autocomplete suggestions, the keyword opportunity table, and — critically — your channel’s own viral history. From that data it identifies the dominant pattern every competitor shares ("overused angle") and the angle nobody is using ("gap opportunity"), then writes 5 titles aimed at that gap, in your voice. The system ranks all 5 by combined score and surfaces the top 3.</>,
  },
  {
    q: 'What’s the deal with the hard rules — no colons, no em-dashes, no years?',
    a: <>Those are non-negotiable rules baked into the prompt because we tested them against thousands of titles in our beta. Colons and em-dashes feel like marketing copy and tank CTR. Year-stamped titles (2024, 2025, 2026) decay fast — a "Best apps for 2025" video stops getting clicks the day 2026 starts. The required structure (one pipe, opening beat + closing beat) is the format that consistently wins for personal vlog and tutorial content. If Claude slips on any rule the post-processor cleans it up before you see the title.</>,
  },
  {
    q: 'How do you score keyword opportunity — do you actually have YouTube search volume data?',
    a: <>YouTube doesn’t expose true search volume publicly. We use two strong proxies. <b>Volume:</b> how many YouTube autocomplete suggestions contain the phrase — autocomplete only surfaces high-volume queries, so this is a real demand signal. <b>Competition:</b> how many of the top 50 videos for the niche already target the exact phrase in their title plus how many tag it. The combined score weights low competition + decent volume, which is the same logic VidIQ’s "keyword opportunity" surface uses, but our pool is built from your actual niche search rather than an estimated global average.</>,
  },
  {
    q: 'Can the description generator write something my audience won’t notice as AI?',
    a: <>The output is intentionally not corporate. The prompt forbids generic openers ("Welcome to my channel"), bullet lists, sub-headers, emojis, fake CTAs ("SMASH that like button"), and stock keyword stuffing. It writes 2–3 flowing paragraphs in a conversational voice with the primary keyword woven into the opening (visible before "Show more"), the next 2 most important keywords once each in the body, and exactly 3 hashtags on the final line in CamelCase format. We strip em-dashes from every output as a safety net — they’re a common AI tell.</>,
  },
  {
    q: 'How does the per-video critique differ from running an analysis on a draft title?',
    a: <>The draft analyzer optimizes <b>before</b> you upload. The per-video critique runs <b>on already-uploaded videos</b> — it pulls the live title, current description, and thumbnail from your channel, scores all three, runs Claude vision on the thumbnail (face detection, contrast read, composition assessment, text-overlay check), and returns a rewritten description plus specific thumbnail tips. The point is to fix existing videos in your back-catalog that are underperforming relative to their topic.</>,
  },
  {
    q: 'What does "apply to YouTube" actually do?',
    a: <>It pushes the rewritten title and/or description back to YouTube via the official Data API — the same write endpoint the YouTube Studio app uses. The change is live within seconds. We snapshot the before/after view + like + comment counts at the moment of the apply so you can come back later and see whether the rewrite actually moved the numbers. Each apply is logged to your "Your optimizations" panel and the stats refresh lazily every 6 hours.</>,
  },
  {
    q: 'Will applying a new title hurt a video that’s already performing well?',
    a: <>YouTube doesn’t penalize title changes by themselves. What hurts performance is changing a title in a way that breaks the search intent of the people who were already finding the video — e.g. swapping "How to grow basil" to "My garden tour" mid-flight. The AI rewrites are anchored to the same primary keyword as your original, so search ranking should hold or improve. We still recommend you only apply to videos where the original title is clearly underperforming — the studio will tell you when that’s the case.</>,
  },
  {
    q: 'Are past SEO analyses saved? Can I reopen them later?',
    a: <>Yes. Every <code>/seo/analyze</code> run is persisted per channel and shows up in the Reports tab — newest first, up to 50 rows. Click any one to reopen the full analysis (score, rubric breakdown, AI rewrites, intent, gap, keyword scores, top videos for the niche). Re-running the same title updates the existing row instead of stacking duplicates, so the Reports list stays clean. Description outputs are tagged onto the most recent analysis row so the whole report rehydrates as one unit.</>,
  },
  {
    q: 'Does this work for Shorts?',
    a: <>Title scoring works the same — the rubric isn’t format-aware because Shorts and long-form share the same ranking signals. The keyword research and competitor pool work better for long-form because Shorts thumbnails get less play in search and Shorts titles often get truncated to a few words. For Shorts-only content we recommend the title rewrites still, but pay less attention to the description critique — Shorts descriptions don’t carry meaningful SEO weight.</>,
  },
  {
    q: 'How long does an analysis take, and how many credits does it cost?',
    a: <>~25–40 seconds end-to-end. The analysis fans out: YouTube niche search (last 50 results), YouTube autocomplete + Serper related searches + SerpAPI Google autocomplete in parallel, n-gram extraction + scoring, then Claude Sonnet 4.6 for the gap analysis + 5 title rewrites. Each <code>/seo/analyze</code> run is one credit. The description generator is a separate one-credit charge (because it’s a separate Claude call producing 3 description options). Per-video critique is the description-side half of an analyze run — no double charge.</>,
  },
]

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function SeoStudio() {
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
          {!isMobile && <a href="/#pricing" className="seo-nav-link">Pricing</a>}
          <a href="/auth/login" className="seo-btn" style={{ padding: isMobile ? '8px 18px' : '9px 22px', fontSize: 13, borderRadius: 100, whiteSpace: 'nowrap', boxShadow: 'none' }}>
            Score my next title
          </a>
        </div>
      </nav>

      {/* ════ 1. HERO — white ════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px 56px' : '110px 40px 80px', textAlign: 'center', background: '#ffffff' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', animation: 'fadeUp 0.5s ease both' }}>
          <span className="seo-eyebrow light">SEO Studio</span>
          <h1 className="seo-h1" style={{ fontSize: isMobile ? 36 : 60, color: 'var(--ytg-text)', marginBottom: 22 }}>
            Score every title against the live YouTube niche — <span style={{ color: 'var(--ytg-accent)' }}>then rewrite it to win.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18.5, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 36px' }}>
            Paste a title. We pull the top 50 YouTube results for that niche, score your title on a 6-dimension rubric, surface the gap your competitors are missing, and hand back 3 AI rewrites — plus a 300-word description and 3 hashtags pulled from real search demand. One click pushes the new title and description back to YouTube.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/login" className="seo-btn seo-btn-lg">Score a title →</a>
            <a href="#how" className="seo-btn-ghost" style={{ padding: '15px 26px', fontSize: 15 }}>See how it works</a>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', marginTop: 22 }}>
            Solo plan and above · ~30 seconds per run · one-click apply via official YouTube API
          </p>
        </div>
      </section>

      {/* ════ 2. TITLE SCORECARD VISUAL — dark, SPLIT (text L, visual R) ═ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.16) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="seo-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 64, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <span className="seo-eyebrow dark">Per-title scorecard</span>
            <h2 className="seo-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 18 }}>
              The number first — then <span style={{ color: '#ff3b30' }}>the rewrite that earns a higher one.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72, marginBottom: 24 }}>
              Every title gets a 0–100 score on the deterministic rubric, then up to 3 AI rewrites scored against the same rubric. The breakdown is always visible so you can see exactly which dimensions are costing you points — keyword overlap, hook strength, length band, viral-format match.
            </p>
            {[
              'Hybrid scoring — deterministic SEO, AI-judged CTR + hook',
              'Same rubric applied to your title and the AI rewrites',
              '5-then-3 generation — strongest titles only ever surface',
              'Quality-floor retry if first pass isn’t strong enough',
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 11 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#4ade80" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M2.5 7.2 5.4 10l6.1-6"/></svg>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6 }}>{b}</span>
              </div>
            ))}
          </div>
          <div>
            <TitleScorecardVisual />
          </div>
        </div>
      </section>

      {/* ════ 3. THE 6 DIMENSIONS — light ════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 48px' }}>
            <span className="seo-eyebrow light">Six dimensions, one score</span>
            <h2 className="seo-h2" style={{ fontSize: isMobile ? 30 : 42, marginBottom: 16 }}>
              We don’t guess at what makes a title work. <span style={{ color: 'var(--ytg-accent)' }}>We measure it.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>
              The deterministic rubric is six dimensions, each weighted to reflect how YouTube’s recommendation engine actually ranks titles. Same rubric runs on your draft and on every AI rewrite, so the comparison is honest.
            </p>
          </div>
          <div className="seo-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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

      {/* ════ 4. DESCRIPTION REWRITE — dark, SPLIT (visual L, text R) ═══ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="seo-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ order: isMobile ? 1 : 0 }}>
            <DescriptionVisual />
          </div>
          <div style={{ order: isMobile ? 0 : 1 }}>
            <span className="seo-eyebrow dark">Description rewrites</span>
            <h2 className="seo-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 18 }}>
              Three descriptions — each <span style={{ color: '#ff3b30' }}>built for the first 150 characters.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72, marginBottom: 22 }}>
              YouTube only shows the first ~150 characters before "Show more" — that’s the part that has to earn the click into your description. We rewrite from scratch: opening hook with the primary keyword, body that weaves the next 2 most important keywords once each, real CTA, and exactly 3 CamelCase hashtags pulled from autocomplete data — not invented.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Length',    color: '#4ade80', body: '300–400 words — short ones lose search ranking.' },
                { label: 'Opening',   color: '#ff3b30', body: 'Primary keyword in the first 150 chars. No "Welcome to my channel".' },
                { label: 'Body',      color: '#f59e0b', body: 'Flowing paragraphs. No bullets, no sub-headers, no emoji.' },
                { label: 'Hashtags',  color: '#4a7cf7', body: 'Exactly 3 — CamelCase — derived from real autocomplete demand.' },
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
            <span className="seo-eyebrow light">How it works</span>
            <h2 className="seo-h2" style={{ fontSize: isMobile ? 30 : 42 }}>
              From draft title to live YouTube edit in under 60 seconds
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.7, marginTop: 14, maxWidth: 580, margin: '14px auto 0' }}>
              Five stages, all of them yours to interrupt or skip. Your title, your call — the studio just makes it the most-informed call you’ve ever made.
            </p>
          </div>
          {(() => {
            const steps = [
              { n: '01', t: 'Pick the keyword',      b: 'Paste your title. The studio offers 3 keyword intent options so you anchor the analysis to the right search intent before any data is fetched.' },
              { n: '02', t: 'Live YouTube fetch',    b: 'Top 50 results pulled for your niche keyword via the official Data API — titles, view counts, channels, tags. Plus YouTube autocomplete + Serper + SerpAPI in parallel.' },
              { n: '03', t: 'Score your title',      b: 'The deterministic rubric runs on your draft — length, keyword overlap with stem matching, front-loading, hook structure, viral format, power words.' },
              { n: '04', t: 'AI gap + 5 rewrites',   b: 'Claude Sonnet 4.6 reads the live data and your channel’s viral history, names the angle every competitor shares, the one they all miss, and writes 5 titles aimed at the gap.' },
              { n: '05', t: 'You see the result',    b: 'Score, rubric breakdown, top 3 rewrites, gap analysis, keyword opportunity table, and — if you ask for it — 3 ready-to-paste descriptions with hashtags.' },
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
            <span className="seo-eyebrow dark">Output structure</span>
            <h2 className="seo-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 16 }}>
              Seven distinct output blocks. <span style={{ color: '#ff3b30' }}>Every one is publishable.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72 }}>
              The studio doesn’t hand you a wall of text. Each block renders in its own card so you can scan, mark, and apply without re-reading — and the whole report rehydrates from the Reports tab whenever you want it back.
            </p>
          </div>
          <div className="seo-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {PIPELINE_OUTPUTS.map((p, i) => (
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

      {/* ════ 7. KEYWORD OPPORTUNITY — light, SPLIT (visual L, text R) ═══ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: 'var(--ytg-bg-3)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div className="seo-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 56, alignItems: 'center' }}>
          <div style={{ order: isMobile ? 1 : 0 }}>
            <KeywordPanelVisual />
          </div>
          <div style={{ order: isMobile ? 0 : 1 }}>
            <span className="seo-eyebrow light">Keyword opportunity</span>
            <h2 className="seo-h2" style={{ fontSize: isMobile ? 28 : 38, marginBottom: 16 }}>
              Up to 15 phrases scored on <span style={{ color: 'var(--ytg-accent)' }}>real volume + real competition.</span>
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.72, marginBottom: 18 }}>
              Volume comes from how many YouTube autocomplete suggestions contain the phrase — autocomplete only surfaces high-volume queries, so it’s a real demand signal. Competition comes from how many of the top 50 videos for your niche already target the exact phrase. Score weights low competition + decent volume — the same opportunity logic VidIQ uses, sourced from your actual niche search.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { l: 'Volume signal',  d: 'Autocomplete frequency — only surfaces queries people actually type.' },
                { l: 'Competition signal', d: 'Top-video title hits — already-targeted phrases are harder to win.' },
              ].map((c, i) => (
                <div key={i} style={{ borderLeft: '2px solid var(--ytg-accent)', paddingLeft: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{c.l}</p>
                  <p style={{ fontSize: 12.5, color: 'var(--ytg-text-2)', lineHeight: 1.6 }}>{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════ 8. PLAN LIMITS — dark ═════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 44px' }}>
            <span className="seo-eyebrow dark">By plan</span>
            <h2 className="seo-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 16 }}>
              How many SEO runs you get each month
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72 }}>
              Each title analysis is one credit. Each description rewrite is one credit. Per-video critique is the description-side half of an analyze run — no double charge. Allowances are per-channel; multi-channel Agency accounts pool credits across all channels.
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
                    <p style={{ fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{p.runs}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>SEO runs</p>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>included per month</p>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 12 }} />
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 }}>{p.note}</p>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 22, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>Same hybrid rubric + Sonnet 4.6 generation across all paid plans.</p>
            <a href="/#pricing" style={{ fontSize: 12.5, color: '#ff3b30', textDecoration: 'none', fontWeight: 600 }}>See full pricing →</a>
          </div>
        </div>
      </section>

      {/* ════ 9. FAQ — white ════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '110px 40px', background: '#ffffff' }}>
        <div className="seo-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: 56, alignItems: 'flex-start' }}>
          <div style={{ position: isMobile ? 'static' : 'sticky', top: 100 }}>
            <span className="seo-eyebrow light">FAQ</span>
            <h2 className="seo-h2" style={{ fontSize: isMobile ? 30 : 40, marginBottom: 16 }}>
              Questions about the SEO engine, answered honestly.
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>
              Real answers from how the product behaves — the rubric, the rewrite logic, the apply-to-YouTube boundaries, and what it won’t do.
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
          <h2 className="seo-h2" style={{ fontSize: isMobile ? 30 : 44, marginBottom: 16 }}>
            Score your next title against the live niche
          </h2>
          <p style={{ fontSize: isMobile ? 15 : 17, color: 'var(--ytg-text-2)', maxWidth: 540, margin: '0 auto 28px', lineHeight: 1.7 }}>
            ~30 seconds per run. Solo gets 20 runs / month, Growth 50, Agency 150 pooled. Most users surface a measurably better title inside the first 3 runs.
          </p>
          <a href="/auth/login" className="seo-btn seo-btn-lg">Score a title →</a>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
