import { useEffect, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import { injectFaqJsonLd } from '../../utils/seo'

/* SEO Studio feature page. Migrated to the editorial design language
   (Fraunces + Barlow, sharp flat cards, warm paper, restrained red). The old
   white→dark→light rhythm is now predominantly warm paper; the title scorecard
   and description rewrites stay dark "app preview" panes (on-dark accents use
   warm gold #e6b35c, since red goes muddy on near-black). Foreign amber/green/
   blue tints neutralised to ink/accent/gold, output icons are neutral ink, body
   italics removed, bottom
   CTA removed. ALL copy, FAQs, dimensions, and product detail preserved.
   See project_design_language_editorial. */

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
    if (document.getElementById('sst-styles')) return
    const style = document.createElement('style')
    style.id = 'sst-styles'
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
      @keyframes sstFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .sst-wrap { max-width: 1120px; margin: 0 auto; }
      .sst-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .sst-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .sst-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .sst-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.05; }
      .sst-h1 em { font-style: italic; color: var(--yte-accent); }
      .sst-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .sst-h2 em { font-style: italic; color: var(--yte-accent); }
      .sst-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .sst-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--yte-accent); color: #fff; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 15px 30px; border: none; border-radius: 0; cursor: pointer; text-decoration: none; transition: filter 0.18s, transform 0.18s; }
      .sst-btn:hover { filter: brightness(1.06); transform: translateY(-1px); }
      .sst-btn-lg { font-size: 13px; padding: 17px 36px; }
      .sst-ghost { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 15px 28px; border-radius: 0; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--yte-soft); text-decoration: none; background: var(--yte-surface); border: 1px solid var(--yte-line); transition: color 0.15s, border-color 0.15s; }
      .sst-ghost:hover { color: var(--yte-ink); border-color: var(--yte-line-2); }

      .sst-faq-item { border-bottom: 1px solid var(--yte-line); }
      .sst-faq-q { background: none; border: none; cursor: pointer; width: 100%; text-align: left; padding: 22px 0; font-family: ${SERIF}; display: flex; justify-content: space-between; align-items: center; gap: 18px; font-size: 20px; font-weight: 400; color: var(--yte-ink); letter-spacing: -0.2px; line-height: 1.3; transition: color 0.2s; }
      .sst-faq-q:hover { color: var(--yte-accent); }
      .sst-faq-q.open { color: var(--yte-accent); }
      .sst-faq-plus { flex-shrink: 0; font-family: ${SANS}; font-size: 26px; font-weight: 300; color: var(--yte-accent); line-height: 1; transition: transform 0.2s; }
      .sst-faq-plus.open { transform: rotate(45deg); }
      .sst-faq-a { font-family: ${SANS}; font-size: 15.5px; color: var(--yte-soft); line-height: 1.78; padding: 0 0 24px 0; max-width: 720px; display: none; }
      .sst-faq-a.open { display: block; }
      .sst-faq-a b, .sst-faq-a code { font-weight: 600; color: var(--yte-ink); }
      .sst-faq-a code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13.5px; background: var(--yte-bg-2); padding: 1px 5px; }

      @media (max-width: 900px) {
        .sst-grid-2 { grid-template-columns: 1fr !important; gap: 36px !important; }
        .sst-grid-3 { grid-template-columns: 1fr !important; }
        .sst-grid-4 { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 600px) {
        .sst-grid-4 { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 768px) {
        .sst-section-pad { padding-left: 22px !important; padding-right: 22px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children, center }) {
  return (
    <div className="sst-eyebrow" style={center ? { justifyContent: 'center' } : undefined}>
      <span aria-hidden="true" className="sst-eyebrow-rule" />
      <span className="sst-eyebrow-text">{children}</span>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="sst-faq-item">
      <button className={`sst-faq-q${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span style={{ flex: 1 }}>{q}</span>
        <span aria-hidden="true" className={`sst-faq-plus${open ? ' open' : ''}`}>+</span>
      </button>
      <div className={`sst-faq-a${open ? ' open' : ''}`}>{a}</div>
    </div>
  )
}

/* ── Visual: Title scorecard with rubric breakdown + AI rewrite (dark pane) ── */
function TitleScorecardVisual() {
  const rows = [
    { label: 'SEO · keyword overlap',   score: 72 },
    { label: 'CTR · click-through pull', score: 58 },
    { label: 'Hook · opener strength',   score: 51 },
    { label: 'Length 50–70 chars',       score: 88 },
  ]
  return (
    <div style={{ background: 'var(--yte-ink)', padding: 26 }}>
      <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Your title</p>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 14px', marginBottom: 18, fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
        How I doubled my YouTube views in 30 days
      </div>
      {/* Score header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 18 }}>
        <span style={{ fontFamily: SERIF, fontSize: 48, fontWeight: 400, color: GOLD, letterSpacing: '-1px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>62</span>
        <span style={{ fontFamily: SANS, fontSize: 18, color: 'rgba(255,255,255,0.35)' }}>/100</span>
        <span style={{ marginLeft: 'auto', fontFamily: SANS, fontSize: 10, fontWeight: 700, color: GOLD, border: `1px solid rgba(230,179,92,0.4)`, padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Needs work</span>
      </div>
      {/* Rubric bars */}
      {rows.map((row, i) => (
        <div key={i} style={{ marginBottom: i < 3 ? 11 : 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>{row.label}</span>
            <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.85)', fontVariantNumeric: 'tabular-nums' }}>{row.score}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${row.score}%`, background: GOLD }} />
          </div>
        </div>
      ))}
      {/* AI rewrite. Top of the 3 returned */}
      <div style={{ borderLeft: `3px solid ${GOLD}`, background: 'rgba(230,179,92,0.08)', padding: '13px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI rewrite · score 91</p>
          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.07)', padding: '2px 8px' }}>1 of 3</span>
        </div>
        <p style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,0.92)', lineHeight: 1.55, fontWeight: 600, marginBottom: 8 }}>
          I Tried 3 YouTube Strategies for 30 Days | What Truly Doubled My Views
        </p>
        <p style={{ fontFamily: SANS, fontSize: 11.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>
          <span style={{ color: GOLD, fontWeight: 700 }}>Why: </span>first-person opener, pipe structure, no year, anchored to the gap surfaced from competitor analysis
        </p>
      </div>
    </div>
  )
}

/* ── Visual: Description rewrite. Before (dull) → after (gold) dark panes ── */
function DescriptionVisual() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* BEFORE. Dull, neutral */}
      <div style={{ background: 'var(--yte-ink)', borderLeft: '3px solid rgba(255,255,255,0.18)', padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Before</p>
          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.45)', fontVariantNumeric: 'tabular-nums' }}>48 words · score 38</span>
        </div>
        <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
          "Hey guys! Welcome back to my channel. In this video I'm going to show you how I doubled my YouTube views. Don't forget to like and subscribe! Hit the bell icon..."
        </p>
      </div>
      {/* AFTER. The product's win, gold-accented */}
      <div style={{ background: 'var(--yte-ink)', borderLeft: `3px solid ${GOLD}`, padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: '0.1em', textTransform: 'uppercase' }}>After · option 1 of 3</p>
          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontVariantNumeric: 'tabular-nums' }}>342 words · score 89</span>
        </div>
        <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Visible before "Show more"</p>
        <p style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.92)', lineHeight: 1.65, fontWeight: 500, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
          The exact 3-strategy YouTube growth experiment that doubled my channel views in 30 days. Full breakdown of what worked, what flopped, and the data behind every change.
        </p>
        <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Body excerpt</p>
        <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 12 }}>
          I ran three different growth tactics over 30 days. Keyword research, retention hooks, and end-screen optimization. Two of them moved the needle. One didn't. Here's the full breakdown so you can skip the dead ends...
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['#YouTubeGrowth', '#YouTubeViews', '#YouTubeStrategy'].map((h, i) => (
            <span key={i} style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: GOLD, background: 'rgba(230,179,92,0.1)', border: '1px solid rgba(230,179,92,0.28)', padding: '4px 10px' }}>{h}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Visual: Keyword scoring panel. Volume + competition (light pane) ──── */
function KeywordPanelVisual() {
  const rows = [
    { kw: 'youtube growth strategy', vol: 'HIGH', comp: 'LOW',  score: 92 },
    { kw: 'double youtube views',    vol: 'MED',  comp: 'LOW',  score: 84 },
    { kw: '30 day youtube challenge', vol: 'MED',  comp: 'MED',  score: 71 },
    { kw: 'youtube algorithm 2026',  vol: 'HIGH', comp: 'HIGH', score: 54 },
    { kw: 'small channel tips',      vol: 'LOW',  comp: 'LOW',  score: 48 },
  ]
  return (
    <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: 'var(--yte-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>High-opportunity keywords</p>
        <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: 'var(--yte-accent)' }}>5 of 15</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.7fr 0.9fr 0.5fr', fontFamily: SANS, fontSize: 10, fontWeight: 700, color: 'var(--yte-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 0 8px', borderBottom: '1px solid var(--yte-line)' }}>
        <p>Phrase</p>
        <p>Volume</p>
        <p>Competition</p>
        <p style={{ textAlign: 'right' }}>Score</p>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.7fr 0.9fr 0.5fr', alignItems: 'center', padding: '11px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--yte-line)' : 'none', fontFamily: SANS, fontSize: 12.5 }}>
          <p style={{ color: 'var(--yte-ink)', fontWeight: 600, paddingRight: 8 }}>{r.kw}</p>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--yte-muted)', letterSpacing: '0.04em' }}>{r.vol}</span>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--yte-muted)', letterSpacing: '0.04em' }}>{r.comp}</span>
          <p style={{ textAlign: 'right', fontFamily: SERIF, fontSize: 18, fontWeight: 400, color: r.score >= 80 ? 'var(--yte-accent)' : 'var(--yte-ink)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{r.score}</p>
        </div>
      ))}
    </div>
  )
}

/* ── 6 dimensions the rubric scores (deterministic + AI hybrid) ────────── */
const DIMENSIONS = [
  { name: 'Length & character count',   what: 'Your title scored against the 50–70 character sweet spot. Lengths outside that band lose CTR on mobile and get truncated on desktop search results.' },
  { name: 'Keyword overlap (fuzzy stem)', what: 'How many words from the niche keyword appear in the title. Using stem matching so "shop", "shopping", "shopped" all count. Anti-stuffing penalty applies above the threshold.' },
  { name: 'Front-loading',              what: 'Whether the first three words contain a power word, question starter, or number. Front-loaded titles win the scroll because YouTube truncates after the first ~30 characters on mobile.' },
  { name: 'Hook structure (pipe / brackets)', what: 'Detects whether the title uses YouTube’s proven structural patterns: pipe dividers, brackets, parens. These add a second-beat curiosity layer without spending more characters.' },
  { name: 'Viral format match',         what: 'Pattern-matches against the proven viral title formats. Listicle, transformation, contrast, journey, deep-dive. Anchors the title to a frame YouTube’s recommendation engine already understands.' },
  { name: 'Power words + numbers',      what: 'Power-word density and presence of any number. Strict caps so the title doesn’t feel templated; the rubric rewards naturally-placed words over keyword bingo.' },
]

const PIPELINE_OUTPUTS = [
  { icon: 'gauge',  title: 'Title score (0–100)',         body: 'Deterministic rubric across SEO, CTR, hook, and length. Same numbers every time. Plus Claude’s subjective CTR + Hook scores so subjective qualities aren’t fudged with regex.' },
  { icon: 'edit',   title: '3 AI title rewrites',           body: 'Claude generates 5, the system ranks them, you see the strongest 3. Each anchored to a gap_opportunity surfaced from the live competitor data. Not generic templates.' },
  { icon: 'gap',    title: 'Gap analysis from live data',   body: 'The AI reads the actual top YouTube results for your niche, names the angle every competitor shares (overused), and the angle every competitor misses (your wedge).' },
  { icon: 'layers', title: 'Keyword opportunity table',     body: 'Up to 15 keyword phrases scored on volume + competition. Volume from autocomplete frequency. Competition from how many top videos already target the exact phrase in their title.' },
  { icon: 'pen',    title: '3 description rewrites',        body: '300–400 words each, opening hook above the fold, primary keywords woven naturally into the body, and 3 CamelCase hashtags pulled from real autocomplete data. Not invented.' },
  { icon: 'eye',    title: 'Per-video critique (vision)',   body: 'On any uploaded video: title score, description verdict + rewrite, plus a Claude-vision read of the thumbnail (face, contrast, text-overlay, composition) with specific tips.' },
  { icon: 'apply',  title: 'One-click apply to YouTube',    body: 'Picked a rewrite? Push it back to YouTube with one click via the official Data API. We snapshot the before/after so you can track which optimizations moved views.' },
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
    <div style={{ width: 38, height: 38, background: 'rgba(20,19,15,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="var(--yte-ink)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d={ICON_PATHS[name]}/>
      </svg>
    </div>
  )
}

const PLAN_LIMITS = [
  { plan: 'Free',    runs: '0',   note: 'Not included on free tier. SEO Studio is paid-only' },
  { plan: 'Solo',    runs: '20',  note: 'Title + description + apply-to-YouTube · 3 channels' },
  { plan: 'Growth',  runs: '50',  note: 'Same engine, higher monthly allowance · 5 channels' },
  { plan: 'Agency',  runs: '150', note: 'Pooled across 10 channels · per-video critique included' },
]

const FAQS = [
  {
    q: 'How is the title score calculated. Is it just a vibe check from AI?',
    a: <>No. The score is a hybrid: the SEO component is fully deterministic (length, keyword overlap with fuzzy stem matching, anti-stuffing checks, pipe discipline, viral format detection) so it returns the same number every time. The CTR and Hook components come from Claude’s judgement against a rubric that’s embedded in the prompt. Because regex can’t reliably score subjective qualities like emotional pull or opener strength. The combined score is what you see; the breakdown is shown so you can see exactly which dimensions cost you points.</>,
  },
  {
    q: 'Why do you pick a "confirmed keyword" before running the analysis?',
    a: <>Because most titles are ambiguous. A title like "My morning routine" could be a wellness video, a productivity video, or a parenting video. The search competition is wildly different in each case. Before the full analysis runs, the studio shows 3 keyword intent options and you pick the one that matches your actual video. That choice anchors the YouTube search, the keyword scoring, and the AI’s gap analysis. If you skip the picker, the AI will best-guess from the title alone. Still useful, just less precise.</>,
  },
  {
    q: 'Where do the AI title rewrites come from? Are they generic templates?',
    a: <>No. Claude reads the live top 10 YouTube results for your niche keyword (titles + view counts), the YouTube autocomplete suggestions, the keyword opportunity table, and. Critically. Your channel’s own viral history. From that data it identifies the dominant pattern every competitor shares ("overused angle") and the angle nobody is using ("gap opportunity"), then writes 5 titles aimed at that gap, in your voice. The system ranks all 5 by combined score and surfaces the top 3.</>,
  },
  {
    q: 'What’s the deal with the hard rules. No colons, no em-dashes, no years?',
    a: <>Those are non-negotiable rules baked into the prompt because we tested them against thousands of titles in our beta. Colons and em-dashes feel like marketing copy and tank CTR. Year-stamped titles (2024, 2025, 2026) decay fast. A "Best apps for 2025" video stops getting clicks the day 2026 starts. The required structure (one pipe, opening beat + closing beat) is the format that consistently wins for personal vlog and tutorial content. If Claude slips on any rule the post-processor cleans it up before you see the title.</>,
  },
  {
    q: 'How do you score keyword opportunity. Do you have YouTube search volume data?',
    a: <>YouTube doesn’t expose true search volume publicly. We use two strong proxies. <b>Volume:</b> how many YouTube autocomplete suggestions contain the phrase. Autocomplete only surfaces high-volume queries, so this is a real demand signal. <b>Competition:</b> how many of the top 50 videos for the niche already target the exact phrase in their title plus how many tag it. The combined score weights low competition + decent volume, which is the same logic VidIQ’s "keyword opportunity" surface uses, but our pool is built from your actual niche search rather than an estimated global average.</>,
  },
  {
    q: 'Can the description generator write something my audience won’t notice as AI?',
    a: <>The output is intentionally not corporate. The prompt forbids generic openers ("Welcome to my channel"), bullet lists, sub-headers, emojis, fake CTAs ("SMASH that like button"), and stock keyword stuffing. It writes 2–3 flowing paragraphs in a conversational voice with the primary keyword woven into the opening (visible before "Show more"), the next 2 most important keywords once each in the body, and exactly 3 hashtags on the final line in CamelCase format. We strip em-dashes from every output as a safety net. They’re a common AI tell.</>,
  },
  {
    q: 'How does the per-video critique differ from running an analysis on a draft title?',
    a: <>The draft analyzer optimizes <b>before</b> you upload. The per-video critique runs <b>on already-uploaded videos</b>. It pulls the live title, current description, and thumbnail from your channel, scores all three, runs Claude vision on the thumbnail (face detection, contrast read, composition assessment, text-overlay check), and returns a rewritten description plus specific thumbnail tips. The point is to fix existing videos in your back-catalog that are underperforming relative to their topic.</>,
  },
  {
    q: 'What does "apply to YouTube" do?',
    a: <>It pushes the rewritten title and/or description back to YouTube via the official Data API. The same write endpoint the YouTube Studio app uses. The change is live within seconds. We snapshot the before/after view + like + comment counts at the moment of the apply so you can come back later and see whether the rewrite moved the numbers. Each apply is logged to your "Your optimizations" panel and the stats refresh lazily every 6 hours.</>,
  },
  {
    q: 'Will applying a new title hurt a video that’s already performing well?',
    a: <>YouTube doesn’t penalize title changes by themselves. What hurts performance is changing a title in a way that breaks the search intent of the people who were already finding the video. E.g. swapping "How to grow basil" to "My garden tour" mid-flight. The AI rewrites are anchored to the same primary keyword as your original, so search ranking should hold or improve. We still recommend you only apply to videos where the original title is clearly underperforming. The studio will tell you when that’s the case.</>,
  },
  {
    q: 'Are past SEO analyses saved? Can I reopen them later?',
    a: <>Yes. Every <code>/seo/analyze</code> run is persisted per channel and shows up in the Reports tab. Newest first, up to 50 rows. Click any one to reopen the full analysis (score, rubric breakdown, AI rewrites, intent, gap, keyword scores, top videos for the niche). Re-running the same title updates the existing row instead of stacking duplicates, so the Reports list stays clean. Description outputs are tagged onto the most recent analysis row so the whole report rehydrates as one unit.</>,
  },
  {
    q: 'Does this work for Shorts?',
    a: <>Title scoring works the same. The rubric isn’t format-aware because Shorts and long-form share the same ranking signals. The keyword research and competitor pool work better for long-form because Shorts thumbnails get less play in search and Shorts titles often get truncated to a few words. For Shorts-only content we recommend the title rewrites still, but pay less attention to the description critique. Shorts descriptions don’t carry meaningful SEO weight.</>,
  },
  {
    q: 'How long does an analysis take, and how many credits does it cost?',
    a: <>~25–40 seconds end-to-end. The analysis fans out: YouTube niche search (last 50 results), YouTube autocomplete + Serper related searches + SerpAPI Google autocomplete in parallel, n-gram extraction + scoring, then Claude Sonnet 4.6 for the gap analysis + 5 title rewrites. Each <code>/seo/analyze</code> run is one credit. The description generator is a separate one-credit charge (because it’s a separate Claude call producing 3 description options). Per-video critique is the description-side half of an analyze run. No double charge.</>,
  },
]

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function SeoStudio() {
  useStyles()
  useEffect(() => { injectFaqJsonLd(FAQS) }, [])
  const { isMobile } = useBreakpoint()

  const H2 = isMobile ? 30 : 42

  return (
    <div style={{ background: 'var(--yte-bg)', minHeight: '100vh', fontFamily: SANS, color: 'var(--yte-ink)' }}>

      {/* ════ NAV ════ */}
      <SiteHeader />

      {/* ════ 1. HERO ════ */}
      <section className="sst-section-pad" style={{ padding: isMobile ? '60px 22px 48px' : '104px 48px 64px', background: 'var(--yte-bg)' }}>
        <div className="sst-wrap" style={{ animation: 'sstFadeUp 0.5s ease both' }}>
          <Eyebrow>SEO Studio</Eyebrow>
          <h1 className="sst-h1" style={{ fontSize: isMobile ? 34 : 56, marginBottom: 22, maxWidth: 920, textWrap: 'balance' }}>
            Score every title against the live YouTube niche. <em>Then rewrite it to win.</em>
          </h1>
          <p className="sst-lead" style={{ fontSize: isMobile ? 16 : 17.5, maxWidth: 720, marginBottom: 32, textWrap: 'pretty' }}>
            Paste a title. We pull the top 50 YouTube results for that niche, score your title on a 6-dimension rubric, surface the gap your competitors are missing, and hand back 3 AI rewrites. Plus a 300-word description and 3 hashtags pulled from real search demand. One click pushes the new title and description back to YouTube.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/auth/login" className="sst-btn sst-btn-lg">Score a title →</a>
            <a href="#how" className="sst-ghost">See how it works</a>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', marginTop: 22, letterSpacing: '0.03em' }}>
            Solo plan and above · ~30 seconds per run · one-click apply via official YouTube API
          </p>
        </div>
      </section>

      {/* ════ 2. TITLE SCORECARD (split) ════ */}
      <section className="sst-section-pad" style={{ padding: isMobile ? '64px 22px' : '88px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="sst-grid-2 sst-wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 56, alignItems: 'center' }}>
          <div>
            <Eyebrow>Per-title scorecard</Eyebrow>
            <h2 className="sst-h2" style={{ fontSize: H2, marginBottom: 18 }}>
              The number first. <em>Then the rewrite that earns a higher one.</em>
            </h2>
            <p className="sst-lead" style={{ fontSize: 17, marginBottom: 24 }}>
              Every title gets a 0–100 score on the deterministic rubric, then up to 3 AI rewrites scored against the same rubric. The breakdown is always visible so you can see exactly which dimensions are costing you points. Keyword overlap, hook strength, length band, viral-format match.
            </p>
            {[
              'Hybrid scoring. Deterministic SEO, AI-judged CTR + hook',
              'Same rubric applied to your title and the AI rewrites',
              '5-then-3 generation. Strongest titles only ever surface',
              'Quality-floor retry if the first pass isn’t strong enough',
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 11 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--yte-accent)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M2.5 7.2 5.4 10l6.1-6"/></svg>
                <span style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.6 }}>{b}</span>
              </div>
            ))}
          </div>
          <div><TitleScorecardVisual /></div>
        </div>
      </section>

      {/* ════ 3. THE 6 DIMENSIONS ════ */}
      <section className="sst-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="sst-wrap">
          <div style={{ maxWidth: 760, marginBottom: 44 }}>
            <Eyebrow>Six dimensions, one score</Eyebrow>
            <h2 className="sst-h2" style={{ fontSize: H2, marginBottom: 16, textWrap: 'balance' }}>
              We don’t guess at what makes a title work. <em>We measure it.</em>
            </h2>
            <p className="sst-lead" style={{ fontSize: 17 }}>
              The deterministic rubric is six dimensions, each weighted to reflect how YouTube’s recommendation engine really ranks titles. Same rubric runs on your draft and on every AI rewrite, so the comparison is honest.
            </p>
          </div>
          <div className="sst-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)' }}>
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

      {/* ════ 4. DESCRIPTION REWRITE (split) ════ */}
      <section className="sst-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="sst-grid-2 sst-wrap" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div style={{ order: isMobile ? 1 : 0 }}>
            <DescriptionVisual />
          </div>
          <div style={{ order: isMobile ? 0 : 1 }}>
            <Eyebrow>Description rewrites</Eyebrow>
            <h2 className="sst-h2" style={{ fontSize: H2, marginBottom: 18 }}>
              Three descriptions. Each <em>built for the first 150 characters.</em>
            </h2>
            <p className="sst-lead" style={{ fontSize: 17, marginBottom: 22 }}>
              YouTube only shows the first ~150 characters before "Show more". That’s the part that has to earn the click into your description. We rewrite from scratch: opening hook with the primary keyword, body that weaves the next 2 most important keywords once each, real CTA, and exactly 3 CamelCase hashtags pulled from autocomplete data. Not invented.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {[
                { label: 'Length',    body: '300–400 words. Short ones lose search ranking.' },
                { label: 'Opening',   body: 'Primary keyword in the first 150 chars. No "Welcome to my channel".' },
                { label: 'Body',      body: 'Flowing paragraphs. No bullets, no sub-headers, no emoji.' },
                { label: 'Hashtags',  body: 'Exactly 3. CamelCase. Derived from real autocomplete demand.' },
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
      <section id="how" className="sst-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ maxWidth: 720, marginBottom: 44 }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="sst-h2" style={{ fontSize: H2, textWrap: 'balance' }}>
              From draft title to <em>live YouTube edit</em> in under 60 seconds.
            </h2>
            <p className="sst-lead" style={{ fontSize: 17, marginTop: 14, maxWidth: 580 }}>
              Five stages, all of them yours to interrupt or skip. Your title, your call. The studio just makes it the most-informed call you’ve ever made.
            </p>
          </div>
          {(() => {
            const steps = [
              { n: '01', t: 'Pick the keyword',      b: 'Paste your title. The studio offers 3 keyword intent options so you anchor the analysis to the right search intent before any data is fetched.' },
              { n: '02', t: 'Live YouTube fetch',    b: 'Top 50 results pulled for your niche keyword via the official Data API. Titles, view counts, channels, tags. Plus YouTube autocomplete + Serper + SerpAPI in parallel.' },
              { n: '03', t: 'Score your title',      b: 'The deterministic rubric runs on your draft. Length, keyword overlap with stem matching, front-loading, hook structure, viral format, power words.' },
              { n: '04', t: 'AI gap + 5 rewrites',   b: 'Claude Sonnet 4.6 reads the live data and your channel’s viral history, names the angle every competitor shares, the one they all miss, and writes 5 titles aimed at the gap.' },
              { n: '05', t: 'You see the result',    b: 'Score, rubric breakdown, top 3 rewrites, gap analysis, keyword opportunity table, and. If you ask for it. 3 ready-to-paste descriptions with hashtags.' },
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
      <section className="sst-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ maxWidth: 760, marginBottom: 40 }}>
            <Eyebrow>Output structure</Eyebrow>
            <h2 className="sst-h2" style={{ fontSize: H2, marginBottom: 16, textWrap: 'balance' }}>
              Seven distinct output blocks. <em>Every one is publishable.</em>
            </h2>
            <p className="sst-lead" style={{ fontSize: 17 }}>
              The studio doesn’t hand you a wall of text. Each block renders in its own card so you can scan, mark, and apply without re-reading. And the whole report rehydrates from the Reports tab whenever you want it back.
            </p>
          </div>
          <div className="sst-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)' }}>
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

      {/* ════ 7. KEYWORD OPPORTUNITY (split) ════ */}
      <section className="sst-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="sst-grid-2" style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 56, alignItems: 'center' }}>
          <div style={{ order: isMobile ? 1 : 0 }}>
            <KeywordPanelVisual />
          </div>
          <div style={{ order: isMobile ? 0 : 1 }}>
            <Eyebrow>Keyword opportunity</Eyebrow>
            <h2 className="sst-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 16, textWrap: 'balance' }}>
              Up to 15 phrases scored on <em>real volume + real competition.</em>
            </h2>
            <p className="sst-lead" style={{ fontSize: 15, marginBottom: 18 }}>
              Volume comes from how many YouTube autocomplete suggestions contain the phrase. Autocomplete only surfaces high-volume queries, so it’s a real demand signal. Competition comes from how many of the top 50 videos for your niche already target the exact phrase. Score weights low competition + decent volume. The same opportunity logic VidIQ uses, sourced from your actual niche search.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {[
                { l: 'Volume signal',  d: 'Autocomplete frequency. Only surfaces queries people really type.' },
                { l: 'Competition signal', d: 'Top-video title hits. Already-targeted phrases are harder to win.' },
              ].map((c, i) => (
                <div key={i} style={{ borderLeft: '2px solid var(--yte-accent)', paddingLeft: 12 }}>
                  <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: 'var(--yte-accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{c.l}</p>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-soft)', lineHeight: 1.6 }}>{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════ 8. PLAN LIMITS ════ */}
      <section className="sst-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ maxWidth: 720, marginBottom: 40 }}>
            <Eyebrow>By plan</Eyebrow>
            <h2 className="sst-h2" style={{ fontSize: H2, marginBottom: 16, textWrap: 'balance' }}>
              How many SEO runs you get <em>each month.</em>
            </h2>
            <p className="sst-lead" style={{ fontSize: 17 }}>
              Each title analysis is one credit. Each description rewrite is one credit. Per-video critique is the description-side half of an analyze run. No double charge. Allowances are per-channel; multi-channel Agency accounts pool credits across all channels.
            </p>
          </div>
          <div className="sst-grid-4" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)' }}>
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
                    <p style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)' }}>SEO runs</p>
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)', marginBottom: 14 }}>included per month</p>
                  <div style={{ height: 1, background: 'var(--yte-line)', marginBottom: 12 }} />
                  <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-soft)', lineHeight: 1.55 }}>{p.note}</p>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)' }}>Same hybrid rubric + Sonnet 4.6 generation across all paid plans.</p>
            <a href="/#pricing" style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-accent)', textDecoration: 'none', fontWeight: 600 }}>See full pricing →</a>
          </div>
        </div>
      </section>

      {/* ════ 9. FAQ ════ */}
      <section className="sst-section-pad" style={{ padding: isMobile ? '64px 22px 80px' : '104px 48px 120px', background: 'var(--yte-bg)' }}>
        <div className="sst-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: 64, alignItems: 'flex-start' }}>
          <div style={{ position: isMobile ? 'static' : 'sticky', top: 100 }}>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="sst-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 16, textWrap: 'balance' }}>
              The SEO engine, <em>answered honestly.</em>
            </h2>
            <p className="sst-lead" style={{ fontSize: 14.5 }}>
              Real answers from how the product behaves. The rubric, the rewrite logic, the apply-to-YouTube boundaries, and what it won’t do.
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
