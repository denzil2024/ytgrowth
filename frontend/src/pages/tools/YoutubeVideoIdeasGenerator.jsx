import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free SEO tool: YouTube Video Ideas Generator ──────────────────────────
   /tools/youtube-video-ideas-generator. Targets ~50K monthly searches.

   Visual DNA matches YoutubeMoneyCalculator.jsx: hero with red radial,
   two-card tool layout (inputs left, prominent featured-result right
   plus a long list), 4-row how-it-works deep-dive, 3-card feature
   grid, dark CTA band, 2-column numbered FAQ.

   100% client-side. 90+ pattern templates across 9 intent categories.
   No AI calls. No backend. */

const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''
const lower = (s) => (s || '').toLowerCase()

const TC_KEEP_LOWER = new Set([
  'a','an','and','as','at','but','by','for','from','if','in','into','nor','of','off','on','or','so','the','to','up','via','vs','with',
])
function toTitleCase(str) {
  if (!str) return str
  const tokens = str.split(/(\s+)/)
  let firstIdx = -1, lastIdx = -1
  for (let i = 0; i < tokens.length; i++) if (/[A-Za-z]/.test(tokens[i])) { firstIdx = i; break }
  for (let i = tokens.length - 1; i >= 0; i--) if (/[A-Za-z]/.test(tokens[i])) { lastIdx = i; break }
  return tokens.map((tok, i) => {
    if (!/[A-Za-z]/.test(tok)) return tok
    const m = tok.match(/^([^A-Za-z]*)([A-Za-z][A-Za-z']*)(.*)$/)
    if (!m) return tok
    const [, lead, word, trail] = m
    const isEdge = i === firstIdx || i === lastIdx
    const startsClause = /[(\[{"]/.test(lead)
    if (!isEdge && !startsClause && TC_KEEP_LOWER.has(word.toLowerCase())) {
      return lead + word.toLowerCase() + trail
    }
    return lead + word.charAt(0).toUpperCase() + word.slice(1) + trail
  }).join('')
}

const FORMATS = {
  listicle: [
    'Top 7 {X} mistakes new creators make',
    '5 {X} habits that actually work',
    '10 {X} rules every beginner should know',
    'The 3 {X} tools I use every single day',
    '7 {X} questions everyone asks (answered)',
    'Top 5 {X} myths debunked',
    '10 {X} hacks I wish I knew sooner',
    '12 {X} tips that took me from 0 to 1',
    '5 {X} things you\'re probably doing wrong',
    'The only 6 {X} principles that matter',
  ],
  tutorial: [
    'How to start {x} in 2026 (complete guide)',
    'How to {x} without spending money',
    '{cap} for absolute beginners',
    'Master {x} in 30 days: the framework',
    'How I learned {x} in 90 days (and what I\'d do differently)',
    'The simplest way to start {x} from scratch',
    'How to set up your first {x} workflow',
    '{cap} 101: everything you need to know',
    'The fastest way to get good at {x}',
    'Step-by-step: my entire {x} system',
  ],
  challenge: [
    'I tried {x} every day for 30 days',
    '24 hours of nothing but {x}',
    'I followed {x} advice from 5 experts. Here\'s what happened.',
    'Doing {x} wrong on purpose for a week',
    'I rebuilt my {x} from scratch in 7 days',
    'Trying every {x} method so you don\'t have to',
    'I copied a top {x} creator for 30 days',
    'I tried the most extreme {x} method',
    'No-{x} for 30 days, what changed',
    'I let AI plan my {x} for a month',
  ],
  mistakes: [
    'Why your {x} isn\'t working',
    'The biggest {x} mistakes (and how to fix them)',
    'Stop doing this if you want better {x}',
    '5 {x} red flags everyone misses',
    'Why most people fail at {x}',
    'The {x} mistake that cost me 2 years',
    '{cap} myths that keep beginners stuck',
    'You\'re not bad at {x}. You\'re missing this.',
    'Why your {x} progress stalled',
    'Common {x} traps and how to avoid them',
  ],
  comparison: [
    '{cap} vs alternatives: which actually works?',
    'I tested 5 {x} methods. The winner surprised me.',
    'Cheap vs expensive: does {x} gear matter?',
    'Old-school {x} vs new-school: which wins?',
    'Free vs paid {x}: the honest comparison',
    'The {x} debate that\'s splitting the community',
    '{cap} in 2024 vs 2026: what changed',
    'Beginner {x} vs pro {x}: side-by-side',
    'Two {x} approaches, one tested for 30 days',
    'Which {x} method is worth your time?',
  ],
  story: [
    'My {x} journey: from zero to here',
    'Why I quit {x} (and why I came back)',
    'How {x} changed my life',
    'The biggest lesson I learned from {x}',
    'A year of {x}: what worked, what didn\'t',
    'My {x} setup tour (everything I use)',
    'How I went full-time on {x}',
    'The day I almost gave up on {x}',
    'My honest review of getting into {x}',
    'What I\'d tell my younger self about {x}',
  ],
  quicktip: [
    '60-second {x} tip that changes everything',
    'The {x} hack nobody talks about',
    'Do this every morning to improve your {x}',
    'One small {x} change with huge results',
    'A {x} shortcut you can use today',
    'The fastest {x} fix I know',
    'Try this {x} trick for one week',
    'A 5-minute {x} routine that works',
    '{cap} pro tip: this single change matters',
    'Why this {x} micro-habit wins long-term',
  ],
  deepdive: [
    'The truth about {x} nobody is saying',
    'Why {x} is harder than people admit',
    'A behind-the-scenes look at {x}',
    'Inside the world of {x}: what really happens',
    'The hidden cost of {x}',
    'Everything I learned from a year of {x}',
    'The {x} blueprint top creators don\'t share',
    'The science of {x}, explained simply',
    'A complete breakdown of {x}',
    'Why {x} works (and when it doesn\'t)',
  ],
  shorts: [
    'POV: you\'re starting {x} today',
    '{cap} beginners need to hear this',
    'The fastest way to start {x}',
    'No, you don\'t need that for {x}',
    '{cap} tip in under 30 seconds',
    'Everyone gets this {x} thing wrong',
    'If you\'re into {x}, save this',
    '3 {x} red flags you can\'t miss',
    '{cap} life hack you\'ll actually use',
    'POV: you\'re a {x} pro now',
  ],
}

const CATEGORIES = [
  { id: 'listicle',   label: 'Listicles',   blurb: 'Numbered lists with high CTR.' },
  { id: 'tutorial',   label: 'Tutorials',   blurb: 'How-to formats with search demand.' },
  { id: 'challenge',  label: 'Challenges',  blurb: 'Time-bound experiments people watch.' },
  { id: 'mistakes',   label: 'Mistakes',    blurb: 'Loss-aversion hooks that earn clicks.' },
  { id: 'comparison', label: 'Comparisons', blurb: 'Versus / which-is-better matchups.' },
  { id: 'story',      label: 'Stories',     blurb: 'Personal journey and reflection.' },
  { id: 'quicktip',   label: 'Quick tips',  blurb: 'Bite-size value, ideal for Shorts.' },
  { id: 'deepdive',   label: 'Deep dives',  blurb: 'Long-form authority videos.' },
  { id: 'shorts',     label: 'Shorts',      blurb: 'Hook-first formats for the Shorts feed.' },
]
const CAT_LOOKUP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]))

function fillTemplate(template, niche) {
  const lc = lower(niche)
  const cc = cap(niche)
  return template.replace(/\{cap\}/g, cc).replace(/\{X\}/g, cc).replace(/\{x\}/g, lc)
}

function generateIdeas(niche, activeCats) {
  const n = (niche || '').trim()
  if (!n) return []
  const cats = activeCats.includes('all') ? Object.keys(FORMATS) : activeCats
  const out = []
  for (const cat of cats) {
    const list = FORMATS[cat] || []
    for (const t of list) {
      const title = toTitleCase(fillTemplate(t, n))
      out.push({ title, category: cat, length: title.length })
    }
  }
  return out
}

const EXAMPLES = ['fitness', 'finance', 'cooking', 'tech reviews', 'productivity', 'travel', 'gaming', 'photography']

const FAQS = [
  { q: 'Are these video ideas AI-generated?',
    a: "No. They're built from a curated library of 90+ proven YouTube format templates, the same kinds of titles top creators use over and over because they work. The tool combines the formats with your niche keyword. No AI hallucinations, no nonsense outputs, no waiting for a model to respond. Pure pattern matching, instant results, zero cost to run." },
  { q: 'How do I know which format will rank in my niche?',
    a: "Format matters less than execution. A \"Top 5 mistakes\" video can flop or go viral depending on the thumbnail, the hook, and the retention curve. That said, formats with strong loss-aversion (\"mistakes\", \"wrong\", \"truth\"), high specificity (numbered lists, time-bound challenges), and curiosity gaps tend to outperform vague titles in nearly every niche. Once you have a candidate, run the title through SEO Studio to score it against the live niche before you commit to filming." },
  { q: 'Should I copy these titles word-for-word?',
    a: "No. Use them as starting structures, then customize them with the specifics that make YOUR version different. \"I tried [X] every day for 30 days\" is the proven format. Your version should be specific and personal: \"I tried cold plunges every morning for 30 days. Here's what changed.\" The format is the skeleton. The specifics (the number, the timeframe, the personal angle, the surprising result) are what earn the click." },
  { q: 'What if my niche needs a different angle that\'s not here?',
    a: 'Filter by format category. If you\'re in finance, "Challenges" might feel forced but "Comparisons" and "Mistakes" will fit naturally. If you\'re a vlogger, "Stories" and "Personal" formats dominate. If you\'re in education, "Tutorials" and "Deep dives" are your bread and butter. Toggle off the categories that don\'t suit your style and the list narrows to formats that fit your content type.' },
  { q: 'Does this work for YouTube Shorts?',
    a: 'Yes, there\'s a dedicated Shorts category. Those formats are designed for the swipe-or-watch decision, with hooks in the first 2 seconds and POV/save-this framings the Shorts algorithm rewards. Long-form formats can also be repurposed into Shorts: a 10-minute "5 mistakes" video can be split into 5 separate 30-second hooks, each one a standalone Short that funnels back to the long-form for the full breakdown.' },
  { q: 'How many videos a week should I publish from this list?',
    a: "For long-form, 1-2 videos per week is the sustainable maximum for most creators producing solo. More than that and quality drops, retention falls, and the algorithm starts down-ranking your channel. For Shorts, 3-5 per week is the sweet spot, enough volume for the algorithm to test your content but not so much that you burn out. Quality videos consistently published always outperform daily uploads of weak content." },
  { q: 'What\'s a "high CTR" format vs a "high retention" format?',
    a: "High-CTR formats earn the click: \"5 mistakes\", \"vs\", \"truth about\", \"why your X isn't working\". They create curiosity gaps that demand resolution. High-retention formats hold attention once clicked: tutorials, deep dives, challenge documentation, and stories with clear narrative arcs. The best videos combine both, a high-CTR title attached to a high-retention format. This generator gives you both kinds; the category filters help you balance the mix." },
  { q: 'How do I validate an idea before I film it?',
    a: 'Three checks. (1) Type your customized title into the YouTube search bar. If autocomplete suggests similar phrases, real people are searching for it. (2) Look at the top 5 videos for that search and check their view counts. If the highest is 50K and the lowest is 5K, demand is steady; if everything is sub-1K, the keyword is dead. (3) Run the title through SEO Studio for a 0-100 score against the live niche. The format gives you the structure; validation tells you if anyone will watch.' },
  { q: 'Should I publish the same format every week or rotate?',
    a: "Rotate, but anchor on 2-3 formats that work consistently. The algorithm benefits from variety in your topical signal, and viewers benefit from variety in their feed. But channels that publish 7+ different format types feel scattered. The pattern that works for most growing channels: pick 2 \"core\" formats (often listicles + tutorials) and rotate in 1 \"high-engagement\" format every 3-4 weeks (challenges, deep dives, or comparisons)." },
  { q: 'What format works best for a brand-new channel with no audience?',
    a: 'Search-driven formats: tutorials and listicles tied to specific keywords with proven search volume. New channels have zero algorithmic momentum; the only way viewers find you is through search results. A "How to X" or "5 X mistakes" video targeting a low-competition keyword will outperform a personal story or vlog every time when you have no subscribers. Once you cross 500-1000 subs, the algorithm starts surfacing your content in Browse and Suggested, and you can experiment more.' },
  { q: 'How do I find what\'s trending in my niche right now?',
    a: "Two free methods. (1) YouTube search autocomplete: type your topic and note what auto-fills; those are real high-volume queries. (2) Google Trends with the YouTube Search filter (toggle from \"Web Search\"), which shows seasonal demand and rising interest by topic. Combine both: pick a format from this generator, customize it with a trending sub-topic from autocomplete, validate the demand in Google Trends, then film." },
  { q: 'Should I pivot my whole channel if my videos aren\'t working?',
    a: "Not yet. First, fix one variable at a time: better thumbnails, then stronger hooks, then tighter editing, then more search-aligned titles. Most channels that stall are not broken; they just have one weak link. Pivoting your entire niche resets the algorithm's understanding of your channel and adds 3-6 months of recovery time. Only pivot if you've genuinely tried optimizing for 3+ months across 8+ videos with no movement, or if the niche itself is dying." },
  { q: 'Why are some formats only suggested for certain niches?',
    a: "They aren't. Every format here works in every niche when customized correctly. \"Challenges\" might feel weird for a finance channel, but \"I tried 5 budgeting methods for 30 days\" is a finance challenge. \"Stories\" might feel off for a tech reviewer, but \"How I went from broke to building my dream studio\" is a tech-creator story. The category labels suggest natural fit, but creative customization can adapt any format to any niche." },
  { q: 'Can I use these for my title or description?',
    a: 'The formats are designed as title structures. Once you pick one and customize it, paste your full title into SEO Studio for a 0–100 score across SEO, CTR, hook, and length. SEO Studio also generates description rewrites built around your title\'s primary keyword, so you don\'t have to write the description from scratch. The Ideas Generator gets you to the title; SEO Studio gets you the click.' },
  { q: 'Is this generator free? Will you collect my data?',
    a: "Yes, free forever. And no data collection beyond what your browser sends to any website. The generator runs entirely in your browser, with no inputs sent to our servers, no email required, no signup gate. We built it as a genuine free tool because every creator deserves a starting list of ideas backed by proven formats. If you want a full growth plan once you've shipped, you can connect your channel for a free AI audit on the main app, but it is entirely optional." },
]

function useBreakpoint() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return { isMobile: w <= 768, isTablet: w <= 1024 }
}

function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('vig-styles')) return
    const link = document.createElement('link')
    link.id = 'vig-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'vig-styles'
    style.textContent = `
      :root {
        --ytg-bg: #f4f4f6; --ytg-bg-2: #ecedf1; --ytg-bg-3: #e6e7ec;
        --ytg-text: #0a0a0f; --ytg-text-2: rgba(10,10,15,0.62); --ytg-text-3: rgba(10,10,15,0.40);
        --ytg-card: #ffffff; --ytg-border: rgba(10,10,15,0.09); --ytg-border-2: rgba(10,10,15,0.16);
        --ytg-accent: #e5302a; --ytg-accent-text: #c22b25; --ytg-accent-light: rgba(229,48,42,0.07);
        --ytg-shadow-sm: 0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
        --ytg-shadow: 0 2px 6px rgba(0,0,0,0.08), 0 10px 32px rgba(0,0,0,0.11);
        --ytg-shadow-lg: 0 4px 16px rgba(0,0,0,0.11), 0 24px 60px rgba(0,0,0,0.14);
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; scrollbar-width: auto; scrollbar-color: rgba(10,10,15,0.28) transparent; }
      ::-webkit-scrollbar { width: 12px; height: 12px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background-color: rgba(10,10,15,0.28); border-radius: 10px; border: 3px solid transparent; background-clip: content-box; }
      ::-webkit-scrollbar-thumb:hover { background-color: rgba(10,10,15,0.48); background-clip: content-box; }
      @keyframes vigFadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
      @keyframes vigPop { 0% { transform: scale(0.97); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }

      .vig-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
        padding: 14px 28px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px; white-space: nowrap;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .vig-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,48,42,0.42); }
      .vig-btn-lg { font-size: 16px; padding: 17px 36px; }

      .vig-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        background: #fff; border: 1px solid rgba(10,10,15,0.09);
        border-radius: 100px; padding: 5px 12px 5px 10px; margin-bottom: 20px;
        box-shadow: 0 1px 2px rgba(10,10,15,0.04);
      }
      .vig-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ytg-accent); box-shadow: 0 0 0 3px rgba(229,48,42,0.12); }
      .vig-eyebrow-text { font-size: 11px; font-weight: 700; color: var(--ytg-text-2); text-transform: uppercase; letter-spacing: 0.09em; }

      .vig-input {
        width: 100%; padding: 14px 16px;
        font-size: 15px; font-weight: 500; font-family: inherit;
        color: var(--ytg-text);
        background: #fafafb; border: 1px solid var(--ytg-border);
        border-radius: 10px; outline: none;
        transition: border-color 0.15s, background 0.15s;
        -webkit-appearance: none;
      }
      .vig-input:focus { border-color: rgba(10,10,15,0.28); background: #fff; }

      .vig-tool-grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: 24px; align-items: start; }
      @media (max-width: 900px) { .vig-tool-grid { grid-template-columns: 1fr; } }

      .vig-cat-row { display: flex; gap: 6px; flex-wrap: wrap; }
      .vig-cat {
        background: #fff; border: 1.5px solid var(--ytg-border); color: var(--ytg-text-2);
        font-size: 12.5px; font-weight: 600; letter-spacing: -0.1px;
        padding: 7px 12px; border-radius: 100px;
        cursor: pointer; transition: border-color 0.15s, color 0.15s, background 0.15s;
      }
      .vig-cat:hover { border-color: var(--ytg-text-3); color: var(--ytg-text); }
      .vig-cat.active { background: var(--ytg-accent); color: #fff; border-color: var(--ytg-accent); box-shadow: 0 1px 3px rgba(0,0,0,0.10), 0 4px 12px rgba(229,48,42,0.28); }

      .vig-sample-row { display: flex; flex-wrap: wrap; gap: 6px; }
      .vig-sample-chip {
        background: #fff; border: 1px solid var(--ytg-border); color: var(--ytg-text-2);
        font-size: 12px; font-weight: 600; letter-spacing: -0.05px;
        padding: 5px 12px; border-radius: 100px;
        cursor: pointer; font-family: inherit;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
      }
      .vig-sample-chip:hover {
        border-color: rgba(229,48,42,0.32);
        color: var(--ytg-accent);
        background: var(--ytg-accent-light);
      }

      .vig-results-scroll { max-height: 720px; overflow-y: auto; padding-right: 6px; }
      .vig-results-scroll::-webkit-scrollbar { width: 8px }
      .vig-results-scroll::-webkit-scrollbar-thumb { background-color: rgba(10,10,15,0.18); border-radius: 8px; border: 2px solid transparent; background-clip: content-box; }

      .vig-section { padding: 18px 0 22px; border-bottom: 1px solid var(--ytg-border); }
      .vig-section:last-child { border-bottom: 0; padding-bottom: 6px; }
      .vig-section:first-child { padding-top: 4px; }
      .vig-section-head {
        display: flex; align-items: center; gap: 14px;
        padding: 0 0 14px 14px; position: relative;
      }
      .vig-section-head::before {
        content: ''; position: absolute; left: 0; top: 2px; bottom: 14px;
        width: 3px; border-radius: 3px; background: var(--ytg-accent);
      }
      .vig-section-label {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 17px; font-weight: 800; letter-spacing: -0.3px; color: var(--ytg-text);
      }
      .vig-section-count { font-size: 12px; font-weight: 700; color: var(--ytg-text-3); letter-spacing: 0.04em; }
      .vig-section-blurb { font-size: 13px; color: var(--ytg-text-3); margin-left: auto; line-height: 1.5; text-align: right; max-width: 340px; }
      @media (max-width: 720px) {
        .vig-section-head { flex-wrap: wrap; }
        /* On mobile, push blurb to row 2 (full width) and keep the
           Copy-all button inline with the label on row 1. */
        .vig-section-blurb { order: 1; margin-left: 0; text-align: left; max-width: 100%; flex-basis: 100%; padding-top: 8px; }
        .vig-copy-all { margin-left: auto; }
      }

      .vig-section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 18px; }
      @media (max-width: 720px) { .vig-section-grid { grid-template-columns: 1fr; } }

      .vig-result-row {
        display: flex; align-items: center; justify-content: space-between; gap: 12px;
        padding: 11px 12px 11px 14px;
        background: transparent; border-radius: 8px;
        animation: vigPop 0.2s ease both;
        transition: background 0.15s;
      }
      .vig-result-row:hover { background: var(--ytg-bg-2); }
      .vig-result-row:hover .vig-copy-btn { opacity: 1; }
      .vig-result-title {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 14.5px; font-weight: 600; color: var(--ytg-text);
        letter-spacing: -0.2px; line-height: 1.4;
      }
      .vig-result-meta { font-size: 11.5px; color: var(--ytg-text-3); margin-top: 2px; }

      .vig-cat-pill {
        font-size: 9.5px; font-weight: 800; letter-spacing: 0.06em;
        text-transform: uppercase; padding: 2px 7px; border-radius: 5px;
        margin-bottom: 4px; display: inline-block;
      }
      .vig-cat-pill.listicle    { background: rgba(74,124,247,0.10); color: #1e40af; }
      .vig-cat-pill.tutorial    { background: rgba(74,222,128,0.12); color: #166534; }
      .vig-cat-pill.challenge   { background: rgba(245,158,11,0.12); color: #92400e; }
      .vig-cat-pill.mistakes    { background: rgba(229,48,42,0.10);  color: var(--ytg-accent-text); }
      .vig-cat-pill.comparison  { background: rgba(168,85,247,0.10); color: #6b21a8; }
      .vig-cat-pill.story       { background: rgba(236,72,153,0.10); color: #9f1239; }
      .vig-cat-pill.quicktip    { background: rgba(20,184,166,0.10); color: #115e59; }
      .vig-cat-pill.deepdive    { background: rgba(100,116,139,0.10); color: #334155; }
      .vig-cat-pill.shorts      { background: rgba(239,68,68,0.10);  color: #991b1b; }

      .vig-copy-btn {
        background: transparent; border: 0; cursor: pointer; flex-shrink: 0;
        font-size: 11px; font-weight: 700; color: var(--ytg-text-3);
        padding: 6px 10px; border-radius: 8px;
        opacity: 0.5;
        transition: opacity 0.15s, color 0.15s, background 0.15s;
        display: inline-flex; align-items: center; gap: 5px;
      }
      .vig-copy-btn:hover { color: var(--ytg-accent); background: var(--ytg-accent-light); opacity: 1; }
      .vig-copy-btn.copied { color: #166534; background: rgba(74,222,128,0.12); opacity: 1; }

      .vig-copy-all {
        background: transparent; border: 1px solid var(--ytg-border); cursor: pointer; flex-shrink: 0;
        font-family: inherit; font-size: 12px; font-weight: 700; letter-spacing: -0.1px;
        color: var(--ytg-text-2);
        padding: 6px 12px; border-radius: 100px;
        display: inline-flex; align-items: center; gap: 6px;
        transition: color 0.15s, background 0.15s, border-color 0.15s;
      }
      .vig-copy-all:hover { color: var(--ytg-accent); background: var(--ytg-accent-light); border-color: var(--ytg-accent-light); }
      .vig-copy-all.copied { color: #166534; background: rgba(74,222,128,0.12); border-color: rgba(74,222,128,0.30); }

      .vig-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
      @media (max-width: 900px) { .vig-grid-3 { grid-template-columns: 1fr; } }

      .vig-faq-answer {
        display: grid; grid-template-rows: 0fr; opacity: 0;
        transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
      }
      .vig-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .vig-faq-answer-inner { overflow: hidden; }

      @media (max-width: 768px) {
        .vig-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .vig-cta-pad { padding: 70px 24px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children }) {
  return (
    <div className="vig-eyebrow">
      <span aria-hidden="true" className="vig-eyebrow-dot" />
      <span className="vig-eyebrow-text">{children}</span>
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const onClick = useCallback(async (e) => {
    e.stopPropagation()
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1400) } catch (_) {}
  }, [text])
  return (
    <button onClick={onClick} className={`vig-copy-btn${copied ? ' copied' : ''}`} aria-label={`Copy ${text}`}>
      {copied ? (
        <><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6.5l3 3 5-6"/></svg>Copied</>
      ) : (
        <><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="3.5" width="6" height="6" rx="1.2"/><path d="M2.5 8V2.5h5.5"/></svg>Copy</>
      )}
    </button>
  )
}

function CopyAllButton({ titles, label }) {
  const [copied, setCopied] = useState(false)
  const onClick = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(titles.join('\n'))
      setCopied(true); setTimeout(() => setCopied(false), 1600)
    } catch (_) {}
  }, [titles])
  return (
    <button onClick={onClick} className={`vig-copy-all${copied ? ' copied' : ''}`} aria-label={`Copy all ${titles.length} ${label} ideas`}>
      {copied ? (
        <><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6.5l3 3 5-6"/></svg>Copied {titles.length}</>
      ) : (
        <><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="3.5" width="6" height="6" rx="1.2"/><path d="M2.5 8V2.5h5.5"/></svg>Copy all {titles.length}</>
      )}
    </button>
  )
}

export default function YoutubeVideoIdeasGenerator() {
  useGlobalStyles()
  const { isMobile, isTablet } = useBreakpoint()
  /* Niche is mirrored to ?niche= so creators can bookmark or share a
     generated list. Initial state is empty (matches prerendered HTML
     for hydration), then we read the URL once on mount in the same
     effect that handles ongoing sync. Filters + faq state stay out of
     the URL to keep share links short. */
  const [niche, setNiche]           = useState('')
  const [activeCats, setActiveCats] = useState(['all'])
  const [openFaq, setOpenFaq]       = useState(0)
  const urlInitRef = useRef(false)

  useEffect(() => {
    document.title = 'Free YouTube Video Ideas Generator (90+ proven formats) | YTGrowth'
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = 'Free YouTube video ideas generator. 90+ proven format templates across 9 categories. 100% browser-based, no AI hallucinations, no signup, instant results.'
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!urlInitRef.current) {
      urlInitRef.current = true
      const fromUrl = new URLSearchParams(window.location.search).get('niche') || ''
      if (fromUrl) setNiche(fromUrl)
      return
    }
    /* Subsequent state changes: replaceState (not pushState) so the
       back button doesn't walk every keystroke. */
    const params = new URLSearchParams(window.location.search)
    const trimmed = niche.trim()
    if (trimmed) params.set('niche', trimmed)
    else params.delete('niche')
    const qs = params.toString()
    const next = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash
    const curr = window.location.pathname + window.location.search + window.location.hash
    if (next !== curr) window.history.replaceState(null, '', next)
  }, [niche])

  const ideas = useMemo(() => generateIdeas(niche, activeCats), [niche, activeCats])

  const toggleCat = (id) => {
    if (id === 'all') { setActiveCats(['all']); return }
    setActiveCats((curr) => {
      const without = curr.filter(x => x !== 'all' && x !== id)
      const next = curr.includes(id) ? without : [...without, id]
      return next.length === 0 ? ['all'] : next
    })
  }

  const showResults = niche.trim().length > 0
  const featured = ideas[0]
  const rest = ideas.slice(1)
  const catCount = activeCats.includes('all') ? CATEGORIES.length : activeCats.length

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', overflowX: 'hidden' }}>

      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="vig-section-pad" style={{ position: 'relative', padding: isMobile ? '64px 24px 56px' : '110px 48px 84px', textAlign: 'center', background: '#ffffff', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120vw', maxWidth: 1400, height: 620, background: 'radial-gradient(ellipse at center top, rgba(229,48,42,0.07) 0%, rgba(229,48,42,0.02) 40%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'vigFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 34 : isTablet ? 56 : 64, lineHeight: isMobile ? 1.1 : 1.04, letterSpacing: isMobile ? '-0.6px' : '-2.2px', color: 'var(--ytg-text)', marginBottom: 22, textWrap: 'balance' }}>
            What should your <span style={{ color: 'var(--ytg-accent)' }}>next video be about?</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 660, margin: '0 auto 28px', textWrap: 'pretty' }}>
            Ninety+ proven YouTube format templates instantly matched to your niche. Filter by intent, copy your favorite, customize, and ship.
          </p>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', fontWeight: 500 }}>
            No signup. No AI. Free forever.
          </p>
        </div>
      </section>

      {/* ══ TOOL ══ */}
      <section id="generator" className="vig-section-pad" style={{ padding: isMobile ? '48px 20px 80px' : '72px 48px 110px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="vig-tool-grid">

            {/* LEFT, input card */}
            <div style={{ background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-lg)', padding: isMobile ? 26 : 36 }}>
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Your niche</label>
                <input type="text" className="vig-input" placeholder="e.g. fitness, finance, productivity" value={niche} onChange={(e) => setNiche(e.target.value)} autoFocus />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Format categories</label>
                <div className="vig-cat-row">
                  <button onClick={() => toggleCat('all')} className={`vig-cat${activeCats.includes('all') ? ' active' : ''}`}>All</button>
                  {CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => toggleCat(c.id)} className={`vig-cat${activeCats.includes(c.id) ? ' active' : ''}`}>{c.label}</button>
                  ))}
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', marginTop: 12, lineHeight: 1.6 }}>
                  Tap multiple categories to mix formats. "All" gives you the full 90-format library.
                </p>
              </div>

              {!showResults && (
                <div style={{ marginTop: 22 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Try a sample</label>
                  <div className="vig-sample-row">
                    {EXAMPLES.map(ex => (
                      <button key={ex} onClick={() => setNiche(ex)} className="vig-sample-chip">{ex}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT, top idea OR empty state */}
            {showResults && featured ? (
              <div style={{ background: 'var(--ytg-accent)', borderRadius: 22, color: '#fff', padding: isMobile ? 28 : 36, boxShadow: '0 4px 18px rgba(229,48,42,0.32), 0 24px 60px rgba(229,48,42,0.18)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.78, marginBottom: 14 }}>
                  Top idea for {niche}
                </div>
                <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 26 : 32, fontWeight: 800, letterSpacing: '-0.8px', lineHeight: 1.18, marginBottom: 14, wordBreak: 'break-word' }}>
                  {featured.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.16)' }}>{CAT_LOOKUP[featured.category]?.label || featured.category}</span>
                  <span style={{ fontSize: 13, opacity: 0.78 }}>{featured.length} characters</span>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '0 0 22px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.74, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Total ideas</div>
                    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: '-0.8px' }}>{ideas.length}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.74, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Categories</div>
                    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: '-0.8px' }}>{catCount}</div>
                  </div>
                  <button onClick={() => navigator.clipboard?.writeText(featured.title)} style={{ background: '#fff', color: 'var(--ytg-accent)', border: 0, fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, padding: '11px 22px', borderRadius: 100, cursor: 'pointer', letterSpacing: '-0.1px' }}>
                    Copy this idea
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: 'var(--ytg-bg-2)', border: '1px solid var(--ytg-border)', borderRadius: 22, padding: isMobile ? 26 : 32, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Sample preview</p>
                  <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 19 : 22, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                    Titles like these, for any niche
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {[
                    { title: 'Top 7 Fitness Mistakes New Creators Make',   cat: 'listicle' },
                    { title: 'How to Start Cooking in 2026 (Complete Guide)', cat: 'tutorial' },
                    { title: 'I Tried Productivity Every Day for 30 Days', cat: 'challenge' },
                    { title: 'Why Your Finance Strategy Isn’t Working', cat: 'mistakes' },
                    { title: 'Cheap vs Expensive: Does Tech Gear Matter?', cat: 'comparison' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px', background: '#fff', border: '1px solid var(--ytg-border)', borderRadius: 10 }}>
                      <span className={`vig-cat-pill ${s.cat}`} style={{ alignSelf: 'flex-start' }}>{CAT_LOOKUP[s.cat]?.label || s.cat}</span>
                      <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.2px', lineHeight: 1.4 }}>{s.title}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--ytg-text-3)', lineHeight: 1.55, margin: 0 }}>
                  Type any niche above to generate 90+ titles across 9 formats.
                </p>
              </div>
            )}
          </div>

          {/* BOTTOM, full-width more ideas, grouped by category */}
          {showResults && featured && rest.length > 0 && (() => {
            const grouped = CATEGORIES
              .map(cat => ({ ...cat, items: rest.filter(r => r.category === cat.id) }))
              .filter(g => g.items.length > 0)
            return (
              <div style={{ background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: isMobile ? 22 : 32 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8, paddingBottom: 16, borderBottom: '1px solid var(--ytg-border)' }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>More ideas</p>
                    <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 18 : 22, fontWeight: 800, letterSpacing: '-0.6px', color: 'var(--ytg-text)' }}>
                      {rest.length} more, grouped by format
                    </h3>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', maxWidth: isMobile ? '100%' : 320, lineHeight: 1.55 }}>
                    Pick the format that matches your channel’s rhythm. Each one comes with the exact angle creators are using right now.
                  </p>
                </div>
                <div className="vig-results-scroll">
                  {grouped.map(group => (
                    <div key={group.id} className="vig-section">
                      <div className="vig-section-head">
                        <span className="vig-section-label">{group.label}</span>
                        <span className="vig-section-count">{group.items.length} {group.items.length === 1 ? 'idea' : 'ideas'}</span>
                        <span className="vig-section-blurb">{group.blurb}</span>
                        <CopyAllButton titles={group.items.map(it => it.title)} label={group.label.toLowerCase()} />
                      </div>
                      <div className="vig-section-grid">
                        {group.items.map((it, i) => (
                          <div key={i} className="vig-result-row">
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div className="vig-result-title">{it.title}</div>
                              <div className="vig-result-meta">{it.length} characters</div>
                            </div>
                            <CopyButton text={it.title} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
          </div>
        </div>
      </section>

      {/* ══ HOW IDEAS WORK ══ */}
      <section className="vig-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, maxWidth: 720 }}>
            <Eyebrow>How ideas become videos</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, textWrap: 'balance' }}>
              Format is the structure. <span style={{ color: 'var(--ytg-accent)' }}>Specifics earn the click.</span>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {[
              { h: 'A format gets you in the door, not over the line',
                p: 'Every successful YouTube video uses a recognizable format because formats prime the viewer\'s expectation. "5 mistakes" tells me I\'m about to learn what to avoid. "I tried X for 30 days" tells me I\'m about to see a documented experiment with a verdict. The format is a contract with the viewer. But the format alone is a generic title. Specificity (your number, your timeframe, your unique angle, your surprising result) is what turns the format into a click.' },
              { h: 'High-CTR formats and high-retention formats are different animals',
                p: 'Loss-aversion formats ("mistakes", "wrong", "stop doing this") earn the highest click-through rates because they trigger an immediate "wait, am I doing this?" response. But they can struggle to hold attention if the content doesn\'t deliver fast. Long-form formats (tutorials, deep dives, challenge documentation) hold attention naturally because they have built-in narrative arcs. The strongest channels mix both: high-CTR titles attached to high-retention content.' },
              { h: 'Niche fit matters more than format originality',
                p: 'A finance channel can technically use a "challenge" format ("I tracked every dollar for 30 days"), but loss-aversion and comparison formats fit naturally and deliver consistently. A vlog channel can technically use a "tutorial" format, but stories and personal-journey formats are where it wins. Filter the categories above to the formats that match your channel\'s natural voice. Forced formats read as forced and viewers feel it within the first 10 seconds.' },
              { h: 'The same format works in every niche when you customize',
                p: '"5 mistakes" works for finance, fitness, photography, gaming, and pottery; every niche has 5 mistakes. The reason most generators feel useless is that creators copy the format verbatim instead of customizing it. "5 mistakes new YouTubers make" is generic. "5 thumbnail mistakes that killed my CTR (and how I fixed them)" is a specific video. Use the generator to find the structure. Use your own experience to write the title.' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', gap: isMobile ? 12 : 56, paddingTop: i === 0 ? 0 : 28, borderTop: i === 0 ? 'none' : '1px solid var(--ytg-border)' }}>
                <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 20 : 22, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.5px', lineHeight: 1.25 }}>{row.h}</h3>
                <p style={{ fontSize: 15.5, color: 'var(--ytg-text-2)', lineHeight: 1.75 }}>{row.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GROW WITH FEATURES ══ */}
      <section className="vig-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ marginBottom: 44, textAlign: 'center', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            <Eyebrow>From idea to upload</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
              You picked an idea. <span style={{ color: 'var(--ytg-accent)' }}>Now make it rank.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>
              Three tools and features that turn a generated idea into an upload that performs.
            </p>
          </div>
          <div className="vig-grid-3">
            {[
              { label: 'SEO Studio', title: 'Score the title against the live niche', body: 'Every title gets a 0–100 score across SEO, CTR, hook, and length, plus 3 AI rewrites built around the top-ranking videos in your category. Stops you publishing weak titles.', href: '/features/seo-studio' },
              { label: 'Thumbnail IQ', title: 'Win the click war from frame one', body: 'Score every thumbnail against the top performers in your niche on contrast, face presence, and curiosity-gap signals, before the upload, not after the CTR data comes in.', href: '/features/thumbnail-iq' },
              { label: 'Channel Audit', title: 'Find which formats already work for you', body: 'Connect your channel and YTGrowth audits your last 20 videos to surface which formats get your highest retention and CTR. Doubles down on what is working instead of guessing.', href: '/features/channel-audit' },
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
      <section className="vig-section-pad vig-cta-pad" style={{ padding: isMobile ? '88px 24px' : '120px 48px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', width: 1000, height: isMobile ? 600 : 800, background: 'radial-gradient(ellipse, rgba(229,48,42,0.20) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '5px 12px 5px 10px', marginBottom: 22 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 0 3px rgba(229,48,42,0.18)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Free AI audit</span>
          </div>
          <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: '#ffffff', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
            Stop brainstorming. <span style={{ color: '#ff3b30' }}>Start growing.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, marginBottom: 32, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Connect your channel for a free AI audit and a real, prioritised growth plan. Find out which of these formats your audience already responds to before you film the next one.
          </p>
          <a href="/auth/login" className="vig-btn vig-btn-lg">Get my free audit →</a>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', marginTop: 16 }}>
            Free forever plan · no card · 3 audits per month
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
              Everything creators ask before they pick their next video format. Still unsure? <a href="/contact" style={{ color: 'var(--ytg-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
            </p>
          </div>

          <div style={{ borderTop: '1px solid rgba(10,10,15,0.10)' }}>
            {FAQS.map((item, i) => {
              const isOpen = openFaq === i
              const num = String(i + 1).padStart(2, '0')
              return (
                <div key={i} style={{ borderBottom: '1px solid rgba(10,10,15,0.10)', position: 'relative' }}>
                  {isOpen && <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 2, background: 'var(--ytg-accent)', borderRadius: 2 }} />}
                  <div onClick={() => setOpenFaq(isOpen ? null : i)} role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenFaq(isOpen ? null : i) } }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 14 : 20, padding: isMobile ? '20px 0' : '24px 0', paddingLeft: isOpen ? (isMobile ? 16 : 22) : 0, cursor: 'pointer', transition: 'padding-left 0.25s ease', userSelect: 'none' }}
                  >
                    <span style={{ fontSize: isMobile ? 12 : 13, fontWeight: 700, color: isOpen ? 'var(--ytg-accent)' : 'var(--ytg-text-3)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.5, flexShrink: 0, width: isMobile ? 22 : 28, paddingTop: 2, transition: 'color 0.2s' }}>{num}</span>
                    <span style={{ flex: 1, fontSize: isMobile ? 15 : 16, fontWeight: 600, color: 'var(--ytg-text)', lineHeight: 1.45, letterSpacing: '-0.2px' }}>{item.q}</span>
                    <span aria-hidden="true" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isOpen ? 'var(--ytg-accent)' : 'rgba(10,10,15,0.05)', border: `1px solid ${isOpen ? 'var(--ytg-accent)' : 'rgba(10,10,15,0.10)'}`, transition: 'background 0.2s, border-color 0.2s', marginTop: 1 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 5h8" stroke={isOpen ? '#ffffff' : 'var(--ytg-text-2)'} strokeWidth="1.8" strokeLinecap="round" />
                        {!isOpen && <path d="M5 1v8" stroke="var(--ytg-text-2)" strokeWidth="1.8" strokeLinecap="round" />}
                      </svg>
                    </span>
                  </div>
                  <div className={`vig-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="vig-faq-answer-inner">
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
