import { useEffect, useState, useRef } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free SEO tool: YouTube Keyword Research ──────────────────────────────
   /tools/youtube-keyword-research. Targets "free youtube keyword research
   tool", "youtube keyword tool free", "youtube keyword competition" queries,
   the single largest demand cluster in Search Console.

   Two layers (see routers/keyword_tool_routes.py):
   - Suggestions: free keyword ideas from Google autocomplete, ANY term, no
     login, zero Data API quota. The always-useful core.
   - Competition: channel size / view ceiling / top videos. Cache-only here, so
     a fresh term shows a free sign-in prompt for live data instead of a wall. */

function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return { isMobile: width <= 768, isTablet: width <= 1024 }
}

function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-kwt-styles')) return
    const style = document.createElement('style')
    style.id = 'ytg-kwt-styles'
    style.textContent = `
      :root {
        --ytg-bg:           #f4f4f6;
        --ytg-bg-2:         #ecedf1;
        --ytg-bg-3:         #e6e7ec;
        --ytg-text:         #0a0a0f;
        --ytg-text-2:       rgba(10,10,15,0.62);
        --ytg-text-3:       rgba(10,10,15,0.40);
        --ytg-nav:          rgba(244,244,246,0.92);
        --ytg-card:         #ffffff;
        --ytg-border:       rgba(10,10,15,0.09);
        --ytg-border-2:     rgba(10,10,15,0.16);
        --ytg-accent:       #e5302a;
        --ytg-accent-text:  #c22b25;
        --ytg-accent-light: rgba(229,48,42,0.07);
        --ytg-shadow-sm:    0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
        --ytg-shadow:       0 2px 6px rgba(0,0,0,0.08), 0 10px 32px rgba(0,0,0,0.11);
        --ytg-shadow-lg:    0 4px 16px rgba(0,0,0,0.11), 0 24px 60px rgba(0,0,0,0.14);
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden;  scrollbar-width: auto; scrollbar-color: rgba(10,10,15,0.28) transparent; }
      ::-webkit-scrollbar { width: 12px; height: 12px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb {
        background-color: rgba(10,10,15,0.28);
        border-radius: 10px;
        border: 3px solid transparent;
        background-clip: content-box;
      }
      ::-webkit-scrollbar-thumb:hover { background-color: rgba(10,10,15,0.48); background-clip: content-box; }

      @keyframes kwtFadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
      @keyframes kwtSpin { to { transform: rotate(360deg) } }

      .kwt-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
        padding: 14px 28px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
        white-space: nowrap;
      }
      .kwt-btn:hover:not(:disabled) {
        filter: brightness(1.07); transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,48,42,0.42);
      }
      .kwt-btn-lg { font-size: 16px; padding: 17px 36px; }
      .kwt-btn:disabled { opacity: 0.55; cursor: not-allowed; }

      .kwt-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        background: #ffffff;
        border: 1px solid rgba(10,10,15,0.09);
        border-radius: 100px;
        padding: 5px 12px 5px 10px;
        margin-bottom: 20px;
        box-shadow: 0 1px 2px rgba(10,10,15,0.04);
      }
      .kwt-eyebrow-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--ytg-accent);
        box-shadow: 0 0 0 3px rgba(229,48,42,0.12);
      }
      .kwt-eyebrow-text {
        font-size: 11px; font-weight: 700; color: var(--ytg-text-2);
        text-transform: uppercase; letter-spacing: 0.09em;
      }

      .kwt-input {
        width: 100%; padding: 13px 15px;
        font-size: 14.5px; font-weight: 500; font-family: inherit;
        color: var(--ytg-text);
        background: #fafafb; border: 1px solid var(--ytg-border);
        border-radius: 11px; outline: none; -webkit-appearance: none;
        transition: border-color 0.15s, background 0.15s;
      }
      .kwt-input:focus { border-color: rgba(10,10,15,0.28); background: #fff; }
      .kwt-input::placeholder { color: var(--ytg-text-3); }

      .kwt-chip {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 10px 15px; border-radius: 100px;
        background: #fff; border: 1px solid var(--ytg-border);
        color: var(--ytg-text); font-size: 13.5px; font-weight: 600;
        font-family: inherit; cursor: pointer; letter-spacing: -0.1px;
        box-shadow: var(--ytg-shadow-sm);
        transition: transform 0.14s, box-shadow 0.14s, border-color 0.14s, color 0.14s;
      }
      .kwt-chip:hover { transform: translateY(-1px); border-color: rgba(229,48,42,0.40); color: var(--ytg-accent-text); box-shadow: var(--ytg-shadow); }
      .kwt-chip svg { opacity: 0.4; flex-shrink: 0; }
      .kwt-chip:hover svg { opacity: 0.9; }

      .kwt-row {
        display: flex; align-items: center; justify-content: space-between; gap: 14px;
        width: 100%; padding: 13px 16px; background: #fff;
        border: 1px solid var(--ytg-border); border-radius: 12px;
        cursor: pointer; font-family: inherit; text-align: left;
        transition: transform 0.14s, box-shadow 0.14s, border-color 0.14s;
      }
      .kwt-row:hover { transform: translateY(-1px); border-color: rgba(229,48,42,0.30); box-shadow: var(--ytg-shadow-sm); }
      .kwt-row:hover .kwt-chevron { transform: translateX(2px); color: var(--ytg-accent); }
      .kwt-chevron { color: var(--ytg-text-3); flex-shrink: 0; transition: transform 0.15s, color 0.15s; }
      .kwt-tag {
        display: inline-flex; align-items: center; gap: 5px;
        font-size: 10px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
        padding: 3px 8px; border-radius: 100px; white-space: nowrap;
      }

      .kwt-kwchip {
        display: inline-flex; align-items: center; gap: 9px;
        padding: 7px 8px 7px 16px; border-radius: 100px;
        background: #fff; border: 1px solid var(--ytg-border);
        font-family: inherit; cursor: pointer; text-align: left;
        transition: transform 0.13s, box-shadow 0.13s, border-color 0.13s;
      }
      .kwt-kwchip:hover { transform: translateY(-1px); border-color: rgba(229,48,42,0.38); box-shadow: var(--ytg-shadow-sm); }

      .kwt-th { display: grid; align-items: center; gap: 12px; padding: 11px 14px; background: #fafafc; border-bottom: 1px solid var(--ytg-border); }
      .kwt-trow {
        display: grid; align-items: center; gap: 12px; width: 100%;
        padding: 12px 14px; background: #fff; border: none; border-top: 1px solid var(--ytg-border);
        cursor: pointer; font-family: inherit; text-align: left; transition: background 0.13s;
      }
      .kwt-trow:hover { background: #fafafb; }
      .kwt-trow:hover .kwt-chevron { transform: translateX(2px); color: var(--ytg-accent); }
      /* ── overview scorecard (restrained house type scale, dense) ── */
      .kwt-ov { background: #fff; border: 1px solid var(--ytg-border); border-radius: 16px; box-shadow: 0 1px 2px rgba(10,10,15,0.04), 0 12px 32px -14px rgba(10,10,15,0.16); padding: 24px 26px; margin-bottom: 14px; }
      .kwt-ov-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ytg-text-3); }
      .kwt-ov-kw { font-family: 'DM Sans', system-ui, sans-serif; font-size: 24px; font-weight: 600; color: var(--ytg-text); letter-spacing: -0.5px; line-height: 1.15; margin-top: 6px; }
      .kwt-verdict { display: flex; align-items: center; gap: 22px; margin: 20px 0; }
      .kwt-verdict-word { font-family: 'DM Sans', system-ui, sans-serif; font-size: 20px; font-weight: 600; letter-spacing: -0.4px; line-height: 1.1; margin-bottom: 6px; }
      .kwt-read { font-size: 13.5px; color: var(--ytg-text-2); line-height: 1.6; font-weight: 450; max-width: 560px; }

      .kwt-statstrip { display: flex; border: 1px solid var(--ytg-border); border-radius: 12px; overflow: hidden; background: #fcfcfd; }
      .kwt-stat { flex: 1; padding: 14px 18px; border-left: 1px solid var(--ytg-border); }
      .kwt-stat:first-child { border-left: none; }
      .kwt-stat-label { font-size: 10.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ytg-text-3); }
      .kwt-stat-val { font-family: 'DM Sans', system-ui, sans-serif; font-size: 21px; font-weight: 600; letter-spacing: -0.5px; line-height: 1; margin-top: 9px; color: var(--ytg-text); font-variant-numeric: tabular-nums; }
      .kwt-stat-unit { font-size: 12px; font-weight: 600; color: var(--ytg-text-3); letter-spacing: 0; margin-left: 1px; }
      .kwt-stat-cap { font-size: 11.5px; color: var(--ytg-text-3); font-weight: 450; margin-top: 6px; line-height: 1.35; }
      @media (max-width: 680px) {
        .kwt-statstrip { flex-wrap: wrap; }
        .kwt-stat { flex: 1 1 50%; border-top: 1px solid var(--ytg-border); }
        .kwt-stat:nth-child(-n+2) { border-top: none; }
        .kwt-stat:nth-child(odd) { border-left: none; }
      }

      /* ── generated-keywords card ── */
      .kwt-gencard { background: var(--ytg-card); border: 1px solid var(--ytg-border); border-radius: 16px; box-shadow: 0 1px 2px rgba(10,10,15,0.04), 0 12px 32px -14px rgba(10,10,15,0.16); padding: 20px 22px; margin-bottom: 14px; }
      .kwt-genhead { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 16px; }
      .kwt-genlabel { font-size: 11px; font-weight: 600; color: var(--ytg-text-3); text-transform: uppercase; letter-spacing: 0.08em; }
      .kwt-gensub { font-size: 12.5px; color: var(--ytg-text-3); font-weight: 450; margin-top: 5px; text-transform: none; letter-spacing: 0; }
      /* tool layout (mirrors the calculator / generator pages) */
      .kwt-tool-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: stretch; }
      @media (max-width: 900px) { .kwt-tool-grid { grid-template-columns: 1fr; } }
      .kwt-tierdot { width: 9px; height: 9px; border-radius: 3px; flex-shrink: 0; }
      .kwt-tierlabel { font-size: 12.5px; font-weight: 600; letter-spacing: -0.1px; color: var(--ytg-text); }
      .kwt-tiercount { font-size: 11px; font-weight: 600; color: var(--ytg-text-3); background: var(--ytg-bg-2); border-radius: 100px; padding: 2px 8px; font-variant-numeric: tabular-nums; }
      .kwt-chip { display: inline-flex; align-items: center; justify-content: center; min-width: 26px; font-size: 11.5px; font-weight: 700; padding: 3px 9px; border-radius: 100px; font-variant-numeric: tabular-nums; flex-shrink: 0; }
      .kwt-kwrow { display: flex; align-items: center; gap: 12px; width: 100%; background: #fafafb; border: 1px solid var(--ytg-border); border-radius: 12px; padding: 11px 14px; cursor: pointer; text-align: left; font-family: inherit; transition: border-color 0.15s, background 0.15s; }
      .kwt-kwrow:hover { border-color: var(--ytg-border-2); background: #fff; }
      .kwt-kwrow-kw { flex: 1; min-width: 0; font-size: 14px; font-weight: 500; color: var(--ytg-text); line-height: 1.4; letter-spacing: -0.1px; }
      .kwt-kwrow-copy { flex-shrink: 0; width: 44px; text-align: right; font-size: 11.5px; font-weight: 700; color: var(--ytg-text-3); }

      /* ── breakdown side panels (top videos, questions) ── */
      .kwt-panel { background: #fff; border: 1px solid var(--ytg-border); border-radius: 16px; box-shadow: 0 1px 2px rgba(10,10,15,0.04), 0 12px 32px -14px rgba(10,10,15,0.16); overflow: hidden; }
      .kwt-panel-head { padding: 15px 18px; border-bottom: 1px solid var(--ytg-border); }
      .kwt-panel-title { font-family: 'DM Sans', system-ui, sans-serif; font-size: 14px; font-weight: 600; color: var(--ytg-text); letter-spacing: -0.2px; }
      .kwt-vid { display: flex; gap: 11px; align-items: center; text-decoration: none; padding: 8px; border-radius: 9px; transition: background 0.13s; }
      .kwt-vid:hover { background: #fafafb; }
      .kwt-vid-rank { flex-shrink: 0; width: 14px; text-align: center; font-size: 12px; font-weight: 600; color: var(--ytg-text-3); font-variant-numeric: tabular-nums; }
      .kwt-qrow { display: flex; align-items: center; gap: 9px; padding: 10px 11px; background: none; border: none; border-radius: 9px; cursor: pointer; font-family: inherit; text-align: left; width: 100%; transition: background 0.13s; }
      .kwt-qrow:hover { background: #fafafb; }

      .kwt-faq-answer {
        display: grid; grid-template-rows: 0fr; opacity: 0;
        transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
      }
      .kwt-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .kwt-faq-answer-inner { overflow: hidden; }

      .kwt-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
      .kwt-video-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

      @media (max-width: 900px) {
        .kwt-grid-3 { grid-template-columns: 1fr; }
        .kwt-video-grid { grid-template-columns: 1fr; }
      }
      @media (max-width: 768px) {
        .kwt-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .kwt-cta-pad { padding: 70px 24px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
function fmtNum(n) {
  if (n == null || !isFinite(n)) return '0'
  if (n >= 1e9) return (n / 1e9).toFixed(n >= 1e10 ? 0 : 1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + 'K'
  return n.toLocaleString()
}


const COMP_COLOR = { Low: '#16a34a', Medium: '#d97706', High: '#e5302a' }
function compColor(label) { return COMP_COLOR[label] || 'var(--ytg-text)' }

/* ── FAQ ────────────────────────────────────────────────────────────────── */
const FAQS = [
  { q: 'Is this YouTube keyword research tool really free?',
    a: "Yes, completely free, no signup and no card. Type any topic and you instantly get a list of real keyword ideas (the searches people type into YouTube). For keywords in our library you also get the competition behind them: how big the ranking channels are, the views the top videos pull, and how crowded the term is." },
  { q: 'Do I need to log in?',
    a: "No. The keyword ideas work for any term with no account at all. The only thing a free login unlocks is pulling live competition data for a brand-new keyword that nobody has researched yet. Everything else, including every keyword in the library, is open." },
  { q: 'Where do the keyword ideas come from?',
    a: "From YouTube's own autocomplete, the same suggestions that drop down when you start typing in the YouTube search bar. We expand your seed across the alphabet and common modifiers to surface dozens of real long-tail variations, then dedupe them into a clean list." },
  { q: 'How is this different from a keyword volume tool?',
    a: "Most free tools spit out a search-volume guess and stop. Volume tells you demand exists but not whether you can win. This tool pairs keyword ideas with the competitive landscape: the size of the channels you'd be up against, the view ceiling, and whether the top results are stale. That's the half of keyword research that decides if a video is worth making." },
  { q: 'Why do some terms not show competition numbers?',
    a: "Competition data (channel sizes, view ceilings, top videos) comes from a heavier lookup, so to keep the tool free and fast it's served from a shared library that grows over time. Popular and seeded keywords already have it. For a term that isn't in the library yet, you still get all the keyword ideas free, and a one-click free sign-in pulls the live competition for that exact term." },
  { q: 'How accurate is the competition data?',
    a: "It's pulled straight from YouTube's Data API v3, the official source. The Low / Medium / High read is derived from the median subscriber size of the channels currently ranking and how recently they posted. It's a directional signal to help you prioritize, not a guarantee, because the algorithm also weighs your packaging and retention." },
  { q: 'How do I do keyword research for YouTube the right way?',
    a: "Start broad with a topic you can make videos about, expand it into long-tail ideas, then look for the gap: keywords where the ranking channels are smaller than you'd expect, the view ceiling is still high, and the top videos are months old. Those three signals together mean demand exists and the field is beatable. This tool surfaces all three in one view." },
  { q: 'Can I use this for YouTube Shorts keywords?',
    a: "Yes. The keyword ideas apply to any format, and the competition logic is the same for Shorts: find topics with real demand where the field isn't saturated by huge channels. For Shorts, pay extra attention to how fresh the top results are, since Shorts trends move fast." },
  { q: 'Does this replace vidIQ or TubeBuddy keyword tools?',
    a: "For the core job, finding keyword ideas and sizing up whether they're worth targeting, it covers the same ground free. The paid tools add features like daily rank tracking and browser overlays. The full workflow (opportunity scores, keyword clusters, one-click optimization) is YTGrowth's Keyword Research feature once you connect your channel." },
  { q: 'How many keywords can I check?',
    a: "As many as you like. Keyword ideas are unlimited, and every keyword already in the library loads instantly with its competition data. There's no daily cap on browsing the tool." },
]

/* ── Eyebrow ───────────────────────────────────────────────────────────── */
function Eyebrow({ children }) {
  return (
    <div className="kwt-eyebrow">
      <span aria-hidden="true" className="kwt-eyebrow-dot" />
      <span className="kwt-eyebrow-text">{children}</span>
    </div>
  )
}

/* Opportunity from the cached competition signals, used when Keyword Planner
   volume isn't available yet (its score is null until the Ads token lands).
   Smaller ranking channels + a stale field + real reach = a more winnable term.
   This is a directional read off real YouTube data, never a fabricated number. */
function compScore(comp, daysSince, viewCeiling) {
  if (!comp) return null
  let s = comp === 'Low' ? 80 : comp === 'Medium' ? 56 : 30
  if (typeof daysSince === 'number' && daysSince >= 180) s += 9   // stale top results = an opening
  if (viewCeiling >= 250000) s += 5                                // headroom to pull views
  else if (viewCeiling && viewCeiling < 40000) s -= 6             // thin ceiling
  return Math.max(4, Math.min(98, s))
}

/* A directional score for EVERY keyword so the list reads as one uniform
   system. Best signal first: real Keyword-Planner score, else the cached
   competition read, else a winnability heuristic from the attributes we always
   have (longer-tail and higher-intent terms are easier to rank, demand rank
   nudges it). Never presented as exact volume, only a 0-100 opportunity read. */
function keywordScore(s) {
  if (s.opportunity != null) return s.opportunity
  const fromComp = compScore(s.competition, null, s.top_views_median)
  if (fromComp != null) return fromComp
  let v = s.specificity === 'long-tail' ? 68 : s.specificity === 'specific' ? 54 : 42
  if (s.highIntent) v += 8
  if (typeof s.demand_rel === 'number') v += Math.round((s.demand_rel - 50) / 12)
  return Math.max(8, Math.min(96, v))
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function YoutubeKeywordResearch() {
  useGlobalStyles()
  const { isMobile, isTablet } = useBreakpoint()

  const [query, setQuery]     = useState('')
  const [result, setResult]   = useState(null)   // {keyword, suggestions, ...}
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [openFaq, setOpenFaq] = useState(0)
  const [copiedKw, setCopiedKw] = useState(null) // keyword just copied (for feedback)
  const resultsRef = useRef(null)

  /* Popular keywords browser, fetched once on mount. Surfaces terms that
     already have full competition data, every card a one-click lookup. */
  const [popular, setPopular] = useState(null)
  useEffect(() => {
    fetch('/api/keyword-tool/popular?limit=24')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && Array.isArray(d.keywords)) setPopular(d.keywords) })
      .catch(() => {})
  }, [])

  function fetchLookup(q) {
    return fetch(`/api/keyword-tool/lookup?q=${encodeURIComponent(q)}`).then(async r => {
      const body = await r.json().catch(() => ({}))
      if (!r.ok) {
        if (r.status >= 500) throw new Error('The server is busy right now. Give it a few seconds and try again.')
        throw new Error(body.error || `Lookup failed (${r.status})`)
      }
      return body
    }).catch(e => {
      // Network / proxy failures (backend down) reject before a response.
      if (e instanceof TypeError) throw new Error('Could not reach the server. Check your connection and try again.')
      throw e
    })
  }

  /* New topic: fetch the keyword and its scored related ideas. */
  function research(kw) {
    const q = (kw || '').trim()
    if (!q) return
    setQuery(q); setError(''); setLoading(true); setResult(null)
    fetchLookup(q)
      .then(d => {
        setResult(d || null); setLoading(false)
        if (isMobile) setTimeout(() => { if (resultsRef.current) resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 80)
      })
      .catch(e => { setError(e.message || 'Something went wrong.'); setLoading(false) })
  }

  function handleSubmit(e) {
    if (e) e.preventDefault()
    research(query)
  }

  function copyKw(text) {
    try { navigator.clipboard.writeText(text); setCopiedKw(text); setTimeout(() => setCopiedKw(null), 1400) } catch { /* clipboard blocked */ }
  }

  const showResults = result && !loading
  const suggestions = result?.suggestions || []

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', overflowX: 'clip' }}>

      {/* ── NAV, shared SiteHeader ── */}
      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="kwt-section-pad" style={{ position: 'relative', padding: isMobile ? '60px 24px 36px' : '100px 48px 48px', textAlign: 'center', background: '#ffffff', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120vw', maxWidth: 1400, height: 620, background: 'radial-gradient(ellipse at center top, rgba(229,48,42,0.07) 0%, rgba(229,48,42,0.02) 40%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'kwtFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 34 : isTablet ? 56 : 64, lineHeight: isMobile ? 1.1 : 1.04, letterSpacing: isMobile ? '-0.6px' : '-2.2px', color: 'var(--ytg-text)', marginBottom: 22, textWrap: 'balance' }}>
            Find YouTube keywords <span style={{ color: 'var(--ytg-accent)' }}>you can rank for.</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 18, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto', textWrap: 'pretty' }}>
            Type any topic and get dozens of real keyword ideas, each scored on how winnable it is for a smaller channel. Free, no signup.
          </p>
        </div>
      </section>

      {/* ══ TOOL: input + output (the calculator / generator layout) ══ */}
      <section id="tool" className="kwt-section-pad" style={{ padding: isMobile ? '8px 20px 80px' : '12px 48px 96px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div className="kwt-tool-grid">

            {/* LEFT: input + upsell */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-lg)', padding: isMobile ? 26 : 34 }}>
                <label htmlFor="kwt-q" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Your video topic or keyword</label>
                <form onSubmit={handleSubmit}>
                  <input id="kwt-q" type="text" className="kwt-input" value={query} placeholder="e.g. weight loss" onChange={e => setQuery(e.target.value)} autoFocus />
                  <button type="submit" className="kwt-btn" disabled={loading || !query.trim()} style={{ width: '100%', justifyContent: 'center', marginTop: 14, borderRadius: 14 }}>{loading ? 'Researching…' : 'Research →'}</button>
                </form>
                {error && <p style={{ fontSize: 12.5, color: 'var(--ytg-accent)', marginTop: 12, fontWeight: 500, lineHeight: 1.5 }}>{error}</p>}
                <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', marginTop: 16, lineHeight: 1.6 }}>
                  Dozens of real keyword ideas from YouTube autocomplete, each scored on how winnable it is for a smaller channel. Tap any result to copy it.
                </p>
              </div>

              <div style={{ flex: 1, background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: 26 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Go deeper</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ytg-text)', lineHeight: 1.5, marginBottom: 8, letterSpacing: '-0.2px' }}>One keyword is a start. A strategy wins.</p>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.65, marginBottom: 18 }}>
                  Connect your channel for the full Keyword Research feature: opportunities scored against your channel size, keyword clusters, and a free AI audit.
                </p>
                <a href="/auth/login" className="kwt-btn" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 14, borderRadius: 14 }}>Get my free audit →</a>
                <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', textAlign: 'center', marginTop: 10 }}>Free trial · no card · upgrade anytime</p>
              </div>
            </div>

            {/* RIGHT: output */}
            <div ref={resultsRef} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: isMobile ? 18 : 22, minHeight: 380, display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                  <div style={{ flex: 1, minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--ytg-text-3)', padding: 24 }}>
                    <div style={{ width: 28, height: 28, border: '2.5px solid var(--ytg-border)', borderTop: '2.5px solid var(--ytg-accent)', borderRadius: '50%', animation: 'kwtSpin 0.7s linear infinite' }} />
                    <div style={{ fontSize: 13.5, color: 'var(--ytg-text-2)', marginTop: 14 }}>Pulling keyword ideas…</div>
                  </div>
                ) : !result ? (
                  <div style={{ flex: 1, minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--ytg-text-3)', padding: 24 }}>
                    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 17, fontWeight: 700, color: 'var(--ytg-text-2)', marginBottom: 6 }}>Your keywords will appear here</div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.6, maxWidth: 320 }}>Enter a topic on the left and hit Research. Each keyword comes scored so you can pick the winnable ones.</div>
                  </div>
                ) : (result.reason === 'too_short' || suggestions.length === 0) ? (
                  <div style={{ flex: 1, minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--ytg-text-3)', padding: 24 }}>
                    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 17, fontWeight: 700, color: 'var(--ytg-text-2)', marginBottom: 6 }}>
                      {result.reason === 'too_short' ? 'Try a longer keyword' : result.reason === 'rate_limited' ? 'One moment' : 'No keywords found'}
                    </div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.6, maxWidth: 320 }}>
                      {result.reason === 'too_short' ? 'A real topic like “home workout” works best.'
                        : result.reason === 'rate_limited' ? 'You’re researching quickly. Give it a few seconds and try again.'
                        : 'Nothing came back for this term. Try a slightly broader topic.'}
                    </div>
                  </div>
                ) : (() => {
                  const scored = suggestions.map(s => ({ ...s, _score: keywordScore(s) })).sort((a, b) => b._score - a._score).slice(0, 20)
                  const TIERS = [
                    { label: 'Winnable', color: '#16a34a', test: v => v >= 67 },
                    { label: 'Competitive', color: '#d97706', test: v => v >= 40 && v < 67 },
                    { label: 'Crowded', color: '#e5302a', test: v => v < 40 },
                  ]
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Keywords for “{result.keyword}” ({scored.length})</div>
                      {TIERS.map((t) => {
                        const items = scored.filter(s => t.test(s._score))
                        if (!items.length) return null
                        return (
                          <div key={t.label}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                              <span className="kwt-tierdot" style={{ background: t.color }} />
                              <span className="kwt-tierlabel">{t.label}</span>
                              <span className="kwt-tiercount">{items.length}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {items.map((s, i) => {
                                const c = t.color
                                const isCopied = copiedKw === s.keyword
                                return (
                                  <button key={s.keyword + i} type="button" className="kwt-kwrow" onClick={() => copyKw(s.keyword)} title="Click to copy">
                                    <span className="kwt-kwrow-kw">{s.keyword}</span>
                                    <span className="kwt-chip" style={{ color: c, background: `${c}1a` }}>{s._score}</span>
                                    <span className="kwt-kwrow-copy" style={isCopied ? { color: 'var(--ytg-accent-text)' } : null}>{isCopied ? 'Copied' : 'Copy'}</span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ POPULAR KEYWORDS BROWSER ══ */}
      {popular && popular.length > 0 && (
        <section className="kwt-section-pad" style={{ padding: isMobile ? '64px 20px 80px' : '88px 48px 110px', background: '#ffffff', borderTop: '1px solid var(--ytg-border)' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div style={{ marginBottom: 28, maxWidth: 640 }}>
              <Eyebrow>Browse</Eyebrow>
              <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 30 : 42, letterSpacing: '-1.4px', color: 'var(--ytg-text)', lineHeight: 1.08, marginBottom: 10, textWrap: 'balance' }}>
                Popular keywords <span style={{ color: 'var(--ytg-accent)' }}>to explore.</span>
              </h2>
              <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.6 }}>
                The most-researched keywords in the library, each with full competition data ready to load. Click any one to see its breakdown.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 12 }}>
              {popular.map((k, i) => (
                <button key={i} onClick={() => research(k.keyword)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  padding: '16px 18px', background: '#fff', border: '1px solid var(--ytg-border)', borderRadius: 14,
                  boxShadow: 'var(--ytg-shadow-sm)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow)'; e.currentTarget.style.borderColor = 'rgba(229,48,42,0.30)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow-sm)'; e.currentTarget.style.borderColor = 'var(--ytg-border)' }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.2px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{k.keyword}</p>
                    <p style={{ fontSize: 12, color: 'var(--ytg-text-3)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(k.top_views_median)} median views</p>
                  </div>
                  <span style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 700, color: compColor(k.competition), background: `${compColor(k.competition)}14`, border: `1px solid ${compColor(k.competition)}33`, borderRadius: 100, padding: '4px 10px', whiteSpace: 'nowrap' }}>{k.competition}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ HOW IT WORKS ══ */}
      <section className="kwt-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, maxWidth: 720 }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, textWrap: 'balance' }}>
              Keyword ideas plus the <span style={{ color: 'var(--ytg-accent)' }}>competition behind them.</span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {[
              { h: 'Real ideas from YouTube autocomplete',
                p: "Type a topic and we pull the suggestions YouTube itself surfaces when you search, expanded across the alphabet and common modifiers. That turns one seed into dozens of real long-tail keywords people type, free and for any term." },
              { h: 'The three signals that matter',
                p: "Volume tells you demand exists, but not whether you can win. For keywords in the library, this tool shows the three signals that decide that: the size of the channels you'd compete against, the view ceiling the topic can pull, and how fresh the winning videos are. Small-channel, high-view, stale-field is the sweet spot." },
              { h: 'Free, no login for the ideas',
                p: "Keyword ideas work for every term with no account. A free login only unlocks pulling live competition data for a brand-new keyword nobody has researched yet, and that search adds it to the shared library so the next creator gets it instantly." },
              { h: 'From research to a real plan',
                p: "Sizing up keywords is the start. The full Keyword Research feature scores opportunities, groups them into clusters, matches them to search intent, and ties them back to an AI audit of your own channel so you know which keywords fit you specifically." },
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', gap: isMobile ? 12 : 56, paddingTop: i === 0 ? 0 : 28, borderTop: i === 0 ? 'none' : '1px solid var(--ytg-border)' }}>
                <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 20 : 22, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.5px', lineHeight: 1.25 }}>{row.h}</h3>
                <p style={{ fontSize: 15.5, color: 'var(--ytg-text-2)', lineHeight: 1.75 }}>{row.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BEYOND ONE LOOKUP ══ */}
      <section className="kwt-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ marginBottom: 44, textAlign: 'center', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            <Eyebrow>Beyond a single keyword</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
              One keyword is a start. <span style={{ color: 'var(--ytg-accent)' }}>A strategy wins.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>
              The creators who grow don't check keywords one at a time. They map their whole niche, watch their competitors, and pick topics from data.
            </p>
          </div>

          <div className="kwt-grid-3">
            {[
              { label: 'Keyword Research', title: 'Scored, clustered keywords',
                body: 'The full feature: opportunity scores, keyword clusters, and search-intent matching, all tied to your channel size so you target keywords you can realistically win.',
                href: '/features/keyword-research' },
              { label: 'Competitor Analysis', title: 'See what rivals rank for',
                body: 'Track up to 10 channels in your niche, surface their top-performing titles and the content gaps they leave open, delivered as a weekly digest.',
                href: '/features/competitor-analysis' },
              { label: 'AI Channel Audit', title: 'Find your SEO weak spots',
                body: 'A 10-dimension AI audit of your channel that flags which videos are underperforming in search and exactly where you are losing discovery.',
                href: '/features/channel-audit' },
            ].map((card, i) => (
              <a key={i} href={card.href}
                style={{ display: 'block', background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 22, padding: 30, boxShadow: 'var(--ytg-shadow-sm)', textDecoration: 'none', transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow)'; e.currentTarget.style.borderColor = 'var(--ytg-border-2)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow-sm)'; e.currentTarget.style.borderColor = 'var(--ytg-border)' }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>{card.label}</p>
                <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.4px', marginBottom: 12, lineHeight: 1.25 }}>{card.title}</h3>
                <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.65 }}>{card.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DARK CTA ══ */}
      <section className="kwt-section-pad kwt-cta-pad" style={{ padding: isMobile ? '88px 24px' : '120px 48px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', width: 1000, height: isMobile ? 600 : 800, background: 'radial-gradient(ellipse, rgba(229,48,42,0.20) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '5px 12px 5px 10px', marginBottom: 22 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 0 3px rgba(229,48,42,0.18)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Free AI audit</span>
          </div>
          <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: '#ffffff', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
            Stop guessing keywords. <span style={{ color: '#ff3b30' }}>Start ranking.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, marginBottom: 32, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Connect your channel for a free AI audit and a keyword plan built around topics you can win.
          </p>
          <a href="/auth/login" className="kwt-btn kwt-btn-lg">Get my free audit →</a>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', marginTop: 16 }}>
            Free trial · no card · upgrade anytime
          </p>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div style={{ background: '#f4f4f6', borderTop: '1px solid rgba(10,10,15,0.08)', borderBottom: '1px solid rgba(10,10,15,0.08)', padding: isMobile ? '60px 20px' : '110px 64px', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '-10%', left: '-5%', width: 700, height: 600, background: 'radial-gradient(ellipse, rgba(229,48,42,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1160, margin: '0 auto', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '340px 1fr', gap: isMobile ? 40 : 88, alignItems: 'start' }}>

          <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.05, marginBottom: 14, textWrap: 'balance' }}>
              Questions <span style={{ color: 'var(--ytg-accent)' }}>answered.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.7, margin: 0, maxWidth: isMobile ? 520 : 320, marginLeft: isMobile ? 'auto' : 0, marginRight: isMobile ? 'auto' : 0 }}>
              Everything creators ask about researching YouTube keywords. Still unsure? <a href="/contact" style={{ color: 'var(--ytg-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
            </p>
          </div>

          <div style={{ borderTop: '1px solid rgba(10,10,15,0.10)' }}>
            {FAQS.map((item, i) => {
              const isOpen = openFaq === i
              const num = String(i + 1).padStart(2, '0')
              return (
                <div key={i} style={{ borderBottom: '1px solid rgba(10,10,15,0.10)', position: 'relative' }}>
                  {isOpen && <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 2, background: 'var(--ytg-accent)', borderRadius: 2 }} />}
                  <div
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenFaq(isOpen ? null : i) } }}
                    style={{
                      display: 'flex', alignItems: 'flex-start',
                      gap: isMobile ? 14 : 20,
                      padding: isMobile ? '20px 0' : '24px 0',
                      paddingLeft: isOpen ? (isMobile ? 16 : 22) : 0,
                      cursor: 'pointer', transition: 'padding-left 0.25s ease', userSelect: 'none',
                    }}
                  >
                    <span style={{
                      fontSize: isMobile ? 12 : 13, fontWeight: 700,
                      color: isOpen ? 'var(--ytg-accent)' : 'var(--ytg-text-3)',
                      fontVariantNumeric: 'tabular-nums', lineHeight: 1.5, flexShrink: 0,
                      width: isMobile ? 22 : 28, paddingTop: 2, transition: 'color 0.2s',
                    }}>{num}</span>
                    <span style={{
                      flex: 1, fontSize: isMobile ? 15 : 16, fontWeight: 600,
                      color: 'var(--ytg-text)', lineHeight: 1.45, letterSpacing: '-0.2px',
                    }}>{item.q}</span>
                    <span aria-hidden="true" style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isOpen ? 'var(--ytg-accent)' : 'rgba(10,10,15,0.05)',
                      border: `1px solid ${isOpen ? 'var(--ytg-accent)' : 'rgba(10,10,15,0.10)'}`,
                      transition: 'background 0.2s, border-color 0.2s', marginTop: 1,
                    }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 5h8" stroke={isOpen ? '#ffffff' : 'var(--ytg-text-2)'} strokeWidth="1.8" strokeLinecap="round" />
                        {!isOpen && <path d="M5 1v8" stroke="var(--ytg-text-2)" strokeWidth="1.8" strokeLinecap="round" />}
                      </svg>
                    </span>
                  </div>
                  <div className={`kwt-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="kwt-faq-answer-inner">
                      <div style={{ paddingLeft: isMobile ? 36 : 48, paddingRight: isMobile ? 40 : 48, paddingBottom: isMobile ? 22 : 26 }}>
                        <p style={{ fontSize: isMobile ? 14 : 15, color: 'var(--ytg-text-2)', lineHeight: 1.72, margin: 0 }}>{item.a}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  )
}
