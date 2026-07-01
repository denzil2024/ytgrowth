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
     a fresh term shows a free sign-in prompt for live data instead of a wall.

   Migrated to the editorial design language (Fraunces + Barlow, sharp flat
   cards, warm paper, restrained red). ALL fetch/scoring logic and content are
   preserved verbatim; only the skin changed. See
   project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

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
        --yte-bg: #f6f4ef; --yte-bg-2: #efece4; --yte-surface: #ffffff;
        --yte-ink: #14130f; --yte-soft: #5c574e; --yte-muted: #8a8378;
        --yte-line: rgba(20,19,15,0.12); --yte-line-2: rgba(20,19,15,0.22);
        --yte-accent: #e5302a; --yte-accent-soft: rgba(229,48,42,0.07); --yte-dark: #0d0d12;
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; scroll-padding-top: 84px; }
      body { background: var(--yte-bg); color: var(--yte-ink); font-family: ${SANS}; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
      @keyframes kwtFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
      @keyframes kwtSpin { to { transform: rotate(360deg) } }

      .kwt-wrap { max-width: 1040px; margin: 0 auto; }
      .kwt-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .kwt-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .kwt-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .kwt-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.04; }
      .kwt-h1 em { font-style: italic; color: var(--yte-accent); }
      .kwt-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .kwt-h2 em { font-style: italic; color: var(--yte-accent); }
      .kwt-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .kwt-label { display: block; font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-muted); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 9px; }
      .kwt-input { width: 100%; padding: 13px 14px; font-size: 15px; font-weight: 500; font-family: ${SANS}; color: var(--yte-ink); background: var(--yte-bg); border: 1px solid var(--yte-line); border-radius: 0; outline: none; transition: border-color 0.15s, background 0.15s; -webkit-appearance: none; }
      .kwt-input:focus { border-color: var(--yte-accent); background: #fff; }
      .kwt-input::placeholder { color: var(--yte-muted); }

      .kwt-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--yte-accent); color: #fff; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 14px 24px; border: none; border-radius: 0; cursor: pointer; text-decoration: none; transition: filter 0.18s, transform 0.18s; white-space: nowrap; }
      .kwt-btn:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-1px); }
      .kwt-btn:disabled { background: rgba(20,19,15,0.10); color: var(--yte-muted); cursor: not-allowed; transform: none; filter: none; }

      .kwt-tool-grid { display: grid; grid-template-columns: 0.82fr 1.18fr; gap: 12px; align-items: stretch; }
      @media (max-width: 900px) { .kwt-tool-grid { grid-template-columns: 1fr; } }
      .kwt-pane { background: var(--yte-surface); border: 1px solid var(--yte-line); padding: 28px; }
      .kwt-pane-dark { background: var(--yte-ink); padding: 28px; color: #fff; }

      /* tier rows live on the dark output pane */
      .kwt-tierdot { width: 8px; height: 8px; flex-shrink: 0; }
      .kwt-tierlabel { font-family: ${SANS}; font-size: 12.5px; font-weight: 600; letter-spacing: 0.02em; color: rgba(255,255,255,0.92); }
      .kwt-tiercount { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.5); font-variant-numeric: tabular-nums; }
      .kwt-kwrow { display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,0.1); padding: 12px 0; cursor: pointer; font-family: ${SANS}; transition: opacity 0.15s; }
      .kwt-kwrow:hover { opacity: 0.78; }
      .kwt-kwrow-kw { flex: 1; min-width: 0; font-family: ${SANS}; font-size: 14.5px; font-weight: 500; color: #fff; line-height: 1.4; letter-spacing: -0.1px; }
      .kwt-chip { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; font-family: ${SANS}; font-size: 11.5px; font-weight: 700; padding: 3px 9px; font-variant-numeric: tabular-nums; flex-shrink: 0; }
      .kwt-kwrow-copy { flex-shrink: 0; width: 46px; text-align: right; font-family: ${SANS}; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255,255,255,0.45); }

      /* popular keyword cards on the light surface */
      .kwt-popcard { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; background: var(--yte-surface); border: 1px solid var(--yte-line); border-radius: 0; cursor: pointer; font-family: ${SANS}; text-align: left; transition: background 0.15s, border-color 0.15s; }
      .kwt-popcard:hover { background: var(--yte-bg-2); border-color: var(--yte-line-2); }

      .kwt-grow-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 760px) { .kwt-grow-grid { grid-template-columns: 1fr; } }
      .kwt-grow-card { display: block; text-decoration: none; background: var(--yte-surface); padding: 28px; transition: background 0.15s; }
      .kwt-grow-card:hover { background: var(--yte-bg-2); }

      .kwt-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease; }
      .kwt-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .kwt-faq-answer-inner { overflow: hidden; }

      @media (max-width: 768px) {
        .kwt-section-pad { padding-left: 22px !important; padding-right: 22px !important; }
        .kwt-cta-pad { padding: 76px 24px !important; }
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

/* Competition badge colors on the light surface. */
const COMP_COLOR = { Low: '#0f7a43', Medium: '#9a6a00', High: '#c22b25' }
function compColor(label) { return COMP_COLOR[label] || 'var(--yte-ink)' }

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

const HOW_IT_WORKS = [
  { h: 'Real ideas from YouTube autocomplete',
    p: "Type a topic and we pull the suggestions YouTube itself surfaces when you search, expanded across the alphabet and common modifiers. That turns one seed into dozens of real long-tail keywords people type, free and for any term." },
  { h: 'The three signals that matter',
    p: "Volume tells you demand exists, but not whether you can win. For keywords in the library, this tool shows the three signals that decide that: the size of the channels you'd compete against, the view ceiling the topic can pull, and how fresh the winning videos are. Small-channel, high-view, stale-field is the sweet spot." },
  { h: 'Free, no login for the ideas',
    p: "Keyword ideas work for every term with no account. A free login only unlocks pulling live competition data for a brand-new keyword nobody has researched yet, and that search adds it to the shared library so the next creator gets it instantly." },
  { h: 'From research to a real plan',
    p: "Sizing up keywords is the start. The full Keyword Research feature scores opportunities, groups them into clusters, matches them to search intent, and ties them back to an AI audit of your own channel so you know which keywords fit you specifically." },
]

const GROW = [
  { label: 'Keyword Research', title: 'Scored, clustered keywords',
    body: 'The full feature: opportunity scores, keyword clusters, and search-intent matching, all tied to your channel size so you target keywords you can realistically win.',
    href: '/features/keyword-research' },
  { label: 'Competitor Analysis', title: 'See what rivals rank for',
    body: 'Track up to 10 channels in your niche, surface their top-performing titles and the content gaps they leave open, delivered as a weekly digest.',
    href: '/features/competitor-analysis' },
  { label: 'AI Channel Audit', title: 'Find your SEO weak spots',
    body: 'A 10-dimension AI audit of your channel that flags which videos are underperforming in search and exactly where you are losing discovery.',
    href: '/features/channel-audit' },
]

/* ── Eyebrow ───────────────────────────────────────────────────────────── */
function Eyebrow({ children, center }) {
  return (
    <div className="kwt-eyebrow" style={center ? { justifyContent: 'center' } : undefined}>
      <span aria-hidden="true" className="kwt-eyebrow-rule" />
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

  const suggestions = result?.suggestions || []

  const H1 = isMobile ? 34 : isTablet ? 50 : 58
  const H2 = isMobile ? 28 : 42

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', overflowX: 'clip' }}>

      {/* ── NAV, shared SiteHeader ── */}
      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="kwt-section-pad" style={{ padding: isMobile ? '60px 22px 40px' : '104px 48px 48px', background: 'var(--yte-bg)' }}>
        <div className="kwt-wrap" style={{ animation: 'kwtFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 className="kwt-h1" style={{ fontSize: H1, marginBottom: 22, maxWidth: 820, textWrap: 'balance' }}>
            Find YouTube keywords <em>you can rank for.</em>
          </h1>
          <div style={{ maxWidth: 640 }}>
            <p className="kwt-lead" style={{ fontSize: isMobile ? 16 : 17.5, marginBottom: 14, textWrap: 'pretty' }}>
              Type any topic and get dozens of real keyword ideas, each scored on how winnable it is for a smaller channel. Free, no signup.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>No signup. No email. Free forever.</p>
          </div>
        </div>
      </section>

      {/* ══ TOOL: input + output (the calculator / generator layout) ══ */}
      <section id="tool" className="kwt-section-pad" style={{ padding: isMobile ? '8px 22px 72px' : '0 48px 96px', background: 'var(--yte-bg)' }}>
        <div className="kwt-wrap">
          <div className="kwt-tool-grid">

            {/* LEFT: input + upsell */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="kwt-pane">
                <label htmlFor="kwt-q" className="kwt-label">Your video topic or keyword</label>
                <form onSubmit={handleSubmit}>
                  <input id="kwt-q" type="text" className="kwt-input" value={query} placeholder="e.g. weight loss" onChange={e => setQuery(e.target.value)} autoFocus />
                  <button type="submit" className="kwt-btn" disabled={loading || !query.trim()} style={{ width: '100%', marginTop: 12 }}>{loading ? 'Researching…' : 'Research →'}</button>
                </form>
                {error && <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-accent)', marginTop: 12, fontWeight: 500, lineHeight: 1.5 }}>{error}</p>}
                <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', marginTop: 16, lineHeight: 1.6 }}>
                  Dozens of real keyword ideas from YouTube autocomplete, each scored on how winnable it is for a smaller channel. Tap any result to copy it.
                </p>
              </div>

              <div className="kwt-pane" style={{ flex: 1, background: 'var(--yte-bg-2)' }}>
                <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>Go deeper</p>
                <p style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: 'var(--yte-ink)', lineHeight: 1.25, marginBottom: 10, letterSpacing: '-0.3px' }}>One keyword is a start. A strategy wins.</p>
                <p style={{ fontFamily: SANS, fontSize: 14, color: 'var(--yte-soft)', lineHeight: 1.65, marginBottom: 18 }}>
                  Connect your channel for the full Keyword Research feature: opportunities scored against your channel size, keyword clusters, and a free AI audit.
                </p>
                <a href="/auth/login" className="kwt-btn" style={{ width: '100%' }}>Get my free audit →</a>
                <p style={{ fontFamily: SANS, fontSize: 11.5, color: 'var(--yte-muted)', textAlign: 'center', marginTop: 10, letterSpacing: '0.03em' }}>Free trial · no card · upgrade anytime</p>
              </div>
            </div>

            {/* RIGHT: output (dark focal pane) */}
            <div ref={resultsRef} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="kwt-pane-dark" style={{ flex: 1, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                  <div style={{ flex: 1, minHeight: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
                    <div style={{ width: 28, height: 28, border: '2.5px solid rgba(255,255,255,0.18)', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'kwtSpin 0.7s linear infinite' }} />
                    <div style={{ fontFamily: SANS, fontSize: 13.5, color: 'rgba(255,255,255,0.6)', marginTop: 14 }}>Pulling keyword ideas…</div>
                  </div>
                ) : !result ? (
                  <div style={{ flex: 1, minHeight: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
                    <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: '#fff', marginBottom: 8 }}>Your keywords appear here</div>
                    <div style={{ fontFamily: SANS, fontSize: 13.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 320 }}>Enter a topic on the left and hit Research. Each keyword comes scored so you can pick the winnable ones.</div>
                  </div>
                ) : (result.reason === 'too_short' || suggestions.length === 0) ? (
                  <div style={{ flex: 1, minHeight: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
                    <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: '#fff', marginBottom: 8 }}>
                      {result.reason === 'too_short' ? 'Try a longer keyword' : result.reason === 'rate_limited' ? 'One moment' : 'No keywords found'}
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 13.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 320 }}>
                      {result.reason === 'too_short' ? 'A real topic like “home workout” works best.'
                        : result.reason === 'rate_limited' ? 'You’re researching quickly. Give it a few seconds and try again.'
                        : 'Nothing came back for this term. Try a slightly broader topic.'}
                    </div>
                  </div>
                ) : (() => {
                  const scored = suggestions.map(s => ({ ...s, _score: keywordScore(s) })).sort((a, b) => b._score - a._score).slice(0, 20)
                  const TIERS = [
                    { label: 'Winnable', color: '#6cd6a2', test: v => v >= 67 },
                    { label: 'Competitive', color: '#ecc15f', test: v => v >= 40 && v < 67 },
                    { label: 'Crowded', color: '#ff8a82', test: v => v < 40 },
                  ]
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                      <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Keywords for “{result.keyword}” · {scored.length}</div>
                      {TIERS.map((t) => {
                        const items = scored.filter(s => t.test(s._score))
                        if (!items.length) return null
                        return (
                          <div key={t.label}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
                              <span className="kwt-tierdot" style={{ background: t.color }} />
                              <span className="kwt-tierlabel">{t.label}</span>
                              <span className="kwt-tiercount">{items.length}</span>
                            </div>
                            <div>
                              {items.map((s, i) => {
                                const c = t.color
                                const isCopied = copiedKw === s.keyword
                                return (
                                  <button key={s.keyword + i} type="button" className="kwt-kwrow" onClick={() => copyKw(s.keyword)} title="Click to copy">
                                    <span className="kwt-kwrow-kw">{s.keyword}</span>
                                    <span className="kwt-chip" style={{ color: c, background: `${c}26` }}>{s._score}</span>
                                    <span className="kwt-kwrow-copy" style={isCopied ? { color: '#6cd6a2' } : null}>{isCopied ? 'Copied' : 'Copy'}</span>
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
        <section className="kwt-section-pad" style={{ padding: isMobile ? '64px 22px' : '88px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
          <div className="kwt-wrap">
            <div style={{ marginBottom: 32, maxWidth: 640 }}>
              <Eyebrow>Browse</Eyebrow>
              <h2 className="kwt-h2" style={{ fontSize: H2, marginBottom: 12, textWrap: 'balance' }}>
                Popular keywords <em>to explore.</em>
              </h2>
              <p className="kwt-lead" style={{ fontSize: 17 }}>
                The most-researched keywords in the library, each with full competition data ready to load. Click any one to see its breakdown.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 10 }}>
              {popular.map((k, i) => (
                <button key={i} onClick={() => research(k.keyword)} className="kwt-popcard">
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 600, color: 'var(--yte-ink)', letterSpacing: '-0.1px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{k.keyword}</p>
                    <p style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(k.top_views_median)} median views</p>
                  </div>
                  <span style={{ flexShrink: 0, fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: compColor(k.competition), background: `${compColor(k.competition)}14`, padding: '4px 9px', whiteSpace: 'nowrap' }}>{k.competition}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ HOW IT WORKS ══ */}
      <section className="kwt-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="kwt-wrap">
          <div style={{ marginBottom: 40, maxWidth: 720 }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="kwt-h2" style={{ fontSize: H2, textWrap: 'balance' }}>
              Keyword ideas plus the <em>competition behind them.</em>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {HOW_IT_WORKS.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 10 : 48, padding: '26px 0', borderTop: i === 0 ? 'none' : '1px solid var(--yte-line)' }}>
                <h3 style={{ fontFamily: SERIF, fontSize: isMobile ? 21 : 23, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', lineHeight: 1.2 }}>{row.h}</h3>
                <p style={{ fontFamily: SANS, fontSize: isMobile ? 15 : 16, color: 'var(--yte-soft)', lineHeight: 1.72 }}>{row.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BEYOND ONE LOOKUP ══ */}
      <section className="kwt-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="kwt-wrap">
          <div style={{ marginBottom: 32, maxWidth: 720 }}>
            <Eyebrow>Beyond a single keyword</Eyebrow>
            <h2 className="kwt-h2" style={{ fontSize: H2, marginBottom: 12, textWrap: 'balance' }}>
              One keyword is a start. <em>A strategy wins.</em>
            </h2>
            <p className="kwt-lead" style={{ fontSize: 17 }}>
              The creators who grow don't check keywords one at a time. They map their whole niche, watch their competitors, and pick topics from data.
            </p>
          </div>

          <div className="kwt-grow-grid">
            {GROW.map((card, i) => (
              <a key={i} href={card.href} className="kwt-grow-card">
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>{card.label}</div>
                <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', marginBottom: 12, lineHeight: 1.2 }}>{card.title}</h3>
                <p style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.65 }}>{card.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div className="kwt-section-pad" style={{ background: 'var(--yte-bg)', padding: isMobile ? '60px 22px' : '104px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 36 : 80, alignItems: 'start' }}>

          <div>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="kwt-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>Keywords, <em>answered.</em></h2>
            <p className="kwt-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              Everything creators ask about researching YouTube keywords. Still unsure? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--yte-line)' }}>
            {FAQS.map((item, i) => {
              const isOpen = openFaq === i
              return (
                <div key={i} style={{ borderBottom: '1px solid var(--yte-line)' }}>
                  <div
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenFaq(isOpen ? null : i) } }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, padding: isMobile ? '20px 0' : '24px 0', cursor: 'pointer', userSelect: 'none' }}
                  >
                    <span style={{ flex: 1, fontFamily: SERIF, fontSize: isMobile ? 18 : 20, fontWeight: 400, color: isOpen ? 'var(--yte-accent)' : 'var(--yte-ink)', lineHeight: 1.3, letterSpacing: '-0.2px', transition: 'color 0.2s' }}>{item.q}</span>
                    <span aria-hidden="true" style={{ flexShrink: 0, fontFamily: SANS, fontSize: 26, fontWeight: 300, color: 'var(--yte-accent)', lineHeight: 1, transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                  </div>
                  <div className={`kwt-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="kwt-faq-answer-inner">
                      <div style={{ paddingBottom: isMobile ? 22 : 26, maxWidth: 680 }}>
                        <p style={{ fontFamily: SANS, fontSize: isMobile ? 14.5 : 15.5, color: 'var(--yte-soft)', lineHeight: 1.78, margin: 0 }}>{item.a}</p>
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
