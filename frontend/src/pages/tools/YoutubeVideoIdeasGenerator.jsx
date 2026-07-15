import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free tool: YouTube Video Ideas Generator ─────────────────────────────
   /tools/youtube-video-ideas-generator. 90+ proven format templates across 9
   categories, matched to a niche client-side (zero API). Migrated to the
   editorial design language (Fraunces + Barlow, sharp flat cards, warm
   paper). All format data, URL sync, copy logic, and content preserved.
   See project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

const cap = (s) => { const t = (s || '').trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1) : t }
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
    '5 {X} habits that work',
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
    '{cap} vs alternatives: which works?',
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
    '{cap} life hack you\'ll use',
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

const HOW_IT_WORKS = [
  { h: 'A format gets you in the door, not over the line',
    p: 'Every successful YouTube video uses a recognizable format because formats prime the viewer\'s expectation. "5 mistakes" tells me I\'m about to learn what to avoid. "I tried X for 30 days" tells me I\'m about to see a documented experiment with a verdict. The format is a contract with the viewer. But the format alone is a generic title. Specificity (your number, your timeframe, your unique angle, your surprising result) is what turns the format into a click.' },
  { h: 'High-CTR formats and high-retention formats are different animals',
    p: 'Loss-aversion formats ("mistakes", "wrong", "stop doing this") earn the highest click-through rates because they trigger an immediate "wait, am I doing this?" response. But they can struggle to hold attention if the content doesn\'t deliver fast. Long-form formats (tutorials, deep dives, challenge documentation) hold attention naturally because they have built-in narrative arcs. The strongest channels mix both: high-CTR titles attached to high-retention content.' },
  { h: 'Niche fit matters more than format originality',
    p: 'A finance channel can technically use a "challenge" format ("I tracked every dollar for 30 days"), but loss-aversion and comparison formats fit naturally and deliver consistently. A vlog channel can technically use a "tutorial" format, but stories and personal-journey formats are where it wins. Filter the categories above to the formats that match your channel\'s natural voice. Forced formats read as forced and viewers feel it within the first 10 seconds.' },
  { h: 'The same format works in every niche when you customize',
    p: '"5 mistakes" works for finance, fitness, photography, gaming, and pottery; every niche has 5 mistakes. The reason most generators feel useless is that creators copy the format verbatim instead of customizing it. "5 mistakes new YouTubers make" is generic. "5 thumbnail mistakes that killed my CTR (and how I fixed them)" is a specific video. Use the generator to find the structure. Use your own experience to write the title.' },
]

const GROW = [
  { label: 'SEO Studio', title: 'Score the title against the live niche', body: 'Every title gets a 0-100 score across SEO, CTR, hook, and length, plus 3 AI rewrites built around the top-ranking videos in your category. Stops you publishing weak titles.', href: '/features/seo-studio' },
  { label: 'Thumbnail IQ', title: 'Win the click war from frame one', body: 'Score every thumbnail against the top performers in your niche on contrast, face presence, and curiosity-gap signals, before the upload, not after the CTR data comes in.', href: '/features/thumbnail-iq' },
  { label: 'Channel Audit', title: 'Find which formats already work for you', body: 'Connect your channel and YTGrowth audits your last 20 videos to surface which formats get your highest retention and CTR. Doubles down on what is working instead of guessing.', href: '/features/channel-audit' },
]

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
    a: 'The formats are designed as title structures. Once you pick one and customize it, paste your full title into SEO Studio for a 0-100 score across SEO, CTR, hook, and length. SEO Studio also generates description rewrites built around your title\'s primary keyword, so you don\'t have to write the description from scratch. The Ideas Generator gets you to the title; SEO Studio gets you the click.' },
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
  return { isMobile: w <= 768 }
}

function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('vig-styles')) return
    const style = document.createElement('style')
    style.id = 'vig-styles'
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
      @keyframes vigFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .vig-wrap { max-width: 920px; margin: 0 auto; }
      .vig-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .vig-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .vig-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .vig-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.04; }
      .vig-h1 em { font-style: italic; color: var(--yte-accent); }
      .vig-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .vig-h2 em { font-style: italic; color: var(--yte-accent); }
      .vig-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }
      .vig-label { display: block; font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-muted); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 10px; }
      .vig-input { width: 100%; padding: 14px 15px; font-size: 16px; font-weight: 500; font-family: ${SANS}; color: var(--yte-ink); background: var(--yte-bg); border: 1px solid var(--yte-line); border-radius: 0; outline: none; transition: border-color 0.15s, background 0.15s; -webkit-appearance: none; }
      .vig-input:focus { border-color: var(--yte-accent); background: #fff; }

      .vig-cat-row { display: flex; flex-wrap: wrap; gap: 7px; }
      .vig-cat { font-family: ${SANS}; font-size: 12.5px; font-weight: 600; color: var(--yte-soft); background: transparent; border: 1px solid var(--yte-line); border-radius: 0; padding: 7px 13px; cursor: pointer; transition: all 0.15s; letter-spacing: 0.02em; }
      .vig-cat:hover { border-color: var(--yte-ink); color: var(--yte-ink); }
      .vig-cat.active { background: var(--yte-ink); border-color: var(--yte-ink); color: #fff; }
      .vig-sample-row { display: flex; flex-wrap: wrap; gap: 7px; }
      .vig-sample-chip { font-family: ${SANS}; font-size: 12.5px; font-weight: 500; color: var(--yte-accent); background: var(--yte-accent-soft); border: 1px solid rgba(229,48,42,0.18); border-radius: 0; padding: 6px 12px; cursor: pointer; transition: all 0.15s; }
      .vig-sample-chip:hover { background: rgba(229,48,42,0.12); }

      .vig-tool-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: stretch; }
      @media (max-width: 820px) { .vig-tool-grid { grid-template-columns: 1fr; } }
      .vig-pane { background: var(--yte-surface); border: 1px solid var(--yte-line); padding: 28px; }
      .vig-pane-dark { background: var(--yte-ink); padding: 30px; color: #fff; display: flex; flex-direction: column; }

      .vig-results { background: var(--yte-surface); border: 1px solid var(--yte-line); padding: 28px; }
      .vig-results-scroll { max-height: 560px; overflow: auto; margin-top: 6px; }
      .vig-section { padding: 18px 0; border-bottom: 1px solid var(--yte-line); }
      .vig-section:last-child { border-bottom: none; }
      .vig-section-head { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
      .vig-section-label { font-family: ${SERIF}; font-size: 18px; font-weight: 400; color: var(--yte-ink); letter-spacing: -0.2px; }
      .vig-section-count { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-muted); text-transform: uppercase; letter-spacing: 0.08em; }
      .vig-section-blurb { font-family: ${SANS}; font-size: 12.5px; color: var(--yte-muted); flex: 1; min-width: 120px; }
      .vig-section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      @media (max-width: 700px) { .vig-section-grid { grid-template-columns: 1fr; } }
      .vig-result-row { display: flex; align-items: flex-start; gap: 10px; padding: 11px 13px; background: var(--yte-bg); border: 1px solid var(--yte-line); }
      .vig-result-title { font-family: ${SANS}; font-size: 14px; font-weight: 500; color: var(--yte-ink); line-height: 1.4; }
      .vig-result-meta { font-family: ${SANS}; font-size: 11.5px; color: var(--yte-muted); margin-top: 3px; }
      .vig-copy-btn { display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0; font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-muted); background: transparent; border: none; cursor: pointer; padding: 4px 6px; opacity: 0.55; transition: all 0.15s; }
      .vig-result-row:hover .vig-copy-btn { opacity: 1; }
      .vig-copy-btn:hover { color: var(--yte-accent); }
      .vig-copy-btn.copied { color: #0f7a43; opacity: 1; }
      .vig-copy-all { display: inline-flex; align-items: center; gap: 5px; font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-soft); background: transparent; border: 1px solid var(--yte-line); padding: 5px 11px; cursor: pointer; transition: all 0.15s; }
      .vig-copy-all:hover { border-color: var(--yte-accent); color: var(--yte-accent); }
      .vig-copy-all.copied { color: #0f7a43; border-color: rgba(15,122,67,0.4); }

      .vig-grow-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 760px) { .vig-grow-grid { grid-template-columns: 1fr; } }
      .vig-grow-card { display: block; text-decoration: none; background: var(--yte-surface); padding: 28px; transition: background 0.15s; }
      .vig-grow-card:hover { background: var(--yte-bg-2); }

      .vig-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease; }
      .vig-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .vig-faq-answer-inner { overflow: hidden; }

      @media (max-width: 768px) { .vig-section-pad { padding-left: 22px !important; padding-right: 22px !important; } .vig-cta-pad { padding: 76px 24px !important; } }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children }) {
  return (
    <div className="vig-eyebrow">
      <span aria-hidden="true" className="vig-eyebrow-rule" />
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
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function CopyAllButton({ titles, label }) {
  const [copied, setCopied] = useState(false)
  const onClick = useCallback(async () => {
    try { await navigator.clipboard.writeText(titles.join('\n')); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch (_) {}
  }, [titles])
  return (
    <button onClick={onClick} className={`vig-copy-all${copied ? ' copied' : ''}`} aria-label={`Copy all ${titles.length} ${label} ideas`}>
      {copied ? `Copied ${titles.length}` : `Copy all ${titles.length}`}
    </button>
  )
}

export default function YoutubeVideoIdeasGenerator() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()

  const [niche, setNiche]           = useState('')
  const [activeCats, setActiveCats] = useState(['all'])
  const [openFaq, setOpenFaq]       = useState(0)
  const urlInitRef = useRef(false)

  useEffect(() => {
    document.title = 'YouTube Video Ideas Generator 2026: Free Topic Ideas'
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = 'Free YouTube video ideas generator and topic generator. 90+ proven content idea formats across 9 categories. No signup, no AI hallucinations, instant results.'
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!urlInitRef.current) {
      urlInitRef.current = true
      const fromUrl = new URLSearchParams(window.location.search).get('niche') || ''
      if (fromUrl) setNiche(fromUrl)
      return
    }
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

  const H1 = isMobile ? 34 : 54
  const H2 = isMobile ? 28 : 40

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', overflowX: 'clip' }}>
      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="vig-section-pad" style={{ padding: isMobile ? '60px 22px 40px' : '104px 48px 48px', background: 'var(--yte-bg)' }}>
        <div className="vig-wrap" style={{ animation: 'vigFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 className="vig-h1" style={{ fontSize: H1, marginBottom: 22, maxWidth: 780, textWrap: 'balance' }}>
            What should your next video <em>be about?</em>
          </h1>
          <div style={{ maxWidth: 640 }}>
            <p className="vig-lead" style={{ fontSize: isMobile ? 16 : 17.5, marginBottom: 14, textWrap: 'pretty' }}>
              Ninety+ proven YouTube format templates instantly matched to your niche. Filter by intent, copy your favorite, customize, and ship.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>No signup. No AI. Free forever.</p>
          </div>
        </div>
      </section>

      {/* ══ TOOL ══ */}
      <section className="vig-section-pad" style={{ padding: isMobile ? '8px 22px 64px' : '0 48px 88px', background: 'var(--yte-bg)' }}>
        <div className="vig-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="vig-tool-grid">
            {/* Input + filters */}
            <div className="vig-pane">
              <div style={{ marginBottom: 22 }}>
                <label className="vig-label">Your niche</label>
                <input type="text" className="vig-input" placeholder="e.g. fitness, finance, productivity" value={niche} onChange={(e) => setNiche(e.target.value)} autoFocus />
              </div>
              <div>
                <label className="vig-label">Format categories</label>
                <div className="vig-cat-row">
                  <button onClick={() => toggleCat('all')} className={`vig-cat${activeCats.includes('all') ? ' active' : ''}`}>All</button>
                  {CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => toggleCat(c.id)} className={`vig-cat${activeCats.includes(c.id) ? ' active' : ''}`}>{c.label}</button>
                  ))}
                </div>
                <p style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)', marginTop: 12, lineHeight: 1.6 }}>
                  Tap multiple categories to mix formats. "All" gives you the full 90-format library.
                </p>
              </div>
              {!showResults && (
                <div style={{ marginTop: 22 }}>
                  <label className="vig-label">Try a sample</label>
                  <div className="vig-sample-row">
                    {EXAMPLES.map(ex => <button key={ex} onClick={() => setNiche(ex)} className="vig-sample-chip">{ex}</button>)}
                  </div>
                </div>
              )}
            </div>

            {/* Featured / preview (dark) */}
            {showResults && featured ? (
              <div className="vig-pane-dark">
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>Top idea for {niche}</div>
                <div className="vig-h1" style={{ fontSize: isMobile ? 24 : 30, color: '#fff', marginBottom: 14, wordBreak: 'break-word' }}>{featured.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                  <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 9px', background: 'rgba(255,255,255,0.14)', color: '#fff' }}>{CAT_LOOKUP[featured.category]?.label || featured.category}</span>
                  <span style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{featured.length} characters</span>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.16)', marginBottom: 20 }} />
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 26 }}>
                    <div>
                      <div style={{ fontFamily: SANS, fontSize: 10.5, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Total ideas</div>
                      <div className="vig-h1" style={{ fontSize: 24, color: '#fff' }}>{ideas.length}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: SANS, fontSize: 10.5, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Categories</div>
                      <div className="vig-h1" style={{ fontSize: 24, color: '#fff' }}>{catCount}</div>
                    </div>
                  </div>
                  <button onClick={() => navigator.clipboard?.writeText(featured.title)} style={{ background: '#fff', color: 'var(--yte-ink)', border: 0, fontFamily: SANS, fontWeight: 700, fontSize: 11.5, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '11px 20px', cursor: 'pointer' }}>Copy this idea</button>
                </div>
              </div>
            ) : (
              <div className="vig-pane" style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--yte-bg-2)' }}>
                <div>
                  <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Sample preview</p>
                  <p className="vig-h1" style={{ fontSize: isMobile ? 20 : 23 }}>Titles like these, for any niche</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {[
                    { title: 'Top 7 Fitness Mistakes New Creators Make', cat: 'listicle' },
                    { title: 'How to Start Cooking in 2026 (Complete Guide)', cat: 'tutorial' },
                    { title: 'I Tried Productivity Every Day for 30 Days', cat: 'challenge' },
                    { title: 'Why Your Finance Strategy Isn’t Working', cat: 'mistakes' },
                    { title: 'Cheap vs Expensive: Does Tech Gear Matter?', cat: 'comparison' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px', background: '#fff', border: '1px solid var(--yte-line)' }}>
                      <span style={{ alignSelf: 'flex-start', fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--yte-accent)' }}>{CAT_LOOKUP[s.cat]?.label || s.cat}</span>
                      <span style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 500, color: 'var(--yte-ink)', lineHeight: 1.4 }}>{s.title}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', lineHeight: 1.55, margin: 0 }}>Type any niche above to generate 90+ titles across 9 formats.</p>
              </div>
            )}
          </div>

          {/* Grouped results */}
          {showResults && featured && rest.length > 0 && (() => {
            const grouped = CATEGORIES.map(cat => ({ ...cat, items: rest.filter(r => r.category === cat.id) })).filter(g => g.items.length > 0)
            return (
              <div className="vig-results">
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--yte-line)' }}>
                  <div>
                    <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>More ideas</p>
                    <h3 className="vig-h1" style={{ fontSize: isMobile ? 19 : 22 }}>{rest.length} more, grouped by format</h3>
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-muted)', maxWidth: isMobile ? '100%' : 320, lineHeight: 1.55 }}>Pick the format that matches your channel's rhythm, then make the angle yours.</p>
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
      </section>

      {/* ══ HOW IDEAS WORK ══ */}
      <section className="vig-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="vig-wrap">
          <div style={{ marginBottom: 40, maxWidth: 680 }}>
            <Eyebrow>How ideas become videos</Eyebrow>
            <h2 className="vig-h2" style={{ fontSize: H2, textWrap: 'balance' }}>Format is the structure. <em>Specifics earn the click.</em></h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {HOW_IT_WORKS.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', gap: isMobile ? 10 : 48, padding: '26px 0', borderTop: i === 0 ? 'none' : '1px solid var(--yte-line)' }}>
                <h3 style={{ fontFamily: SERIF, fontSize: isMobile ? 21 : 23, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', lineHeight: 1.2 }}>{row.h}</h3>
                <p style={{ fontFamily: SANS, fontSize: isMobile ? 15 : 16, color: 'var(--yte-soft)', lineHeight: 1.72 }}>{row.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GROW cards ══ */}
      <section className="vig-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="vig-wrap">
          <div style={{ marginBottom: 32, maxWidth: 680 }}>
            <Eyebrow>From idea to upload</Eyebrow>
            <h2 className="vig-h2" style={{ fontSize: H2, marginBottom: 12, textWrap: 'balance' }}>You picked an idea. <em>Now make it rank.</em></h2>
            <p className="vig-lead" style={{ fontSize: 17 }}>Three tools that turn a generated idea into an upload that performs.</p>
          </div>
          <div className="vig-grow-grid">
            {GROW.map((c, i) => (
              <a key={i} href={c.href} className="vig-grow-card">
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>{c.label}</div>
                <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', marginBottom: 12, lineHeight: 1.2 }}>{c.title}</h3>
                <p style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.65 }}>{c.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div className="vig-section-pad" style={{ background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)', padding: isMobile ? '60px 22px' : '104px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 36 : 80, alignItems: 'start' }}>
          <div>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="vig-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>Ideas, <em>answered.</em></h2>
            <p className="vig-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              Everything creators ask before picking their next video format. Still unsure? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
            </p>
          </div>
          <div style={{ borderTop: '1px solid var(--yte-line)' }}>
            {FAQS.map((item, i) => {
              const isOpen = openFaq === i
              return (
                <div key={i} style={{ borderBottom: '1px solid var(--yte-line)' }}>
                  <div onClick={() => setOpenFaq(isOpen ? null : i)} role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenFaq(isOpen ? null : i) } }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, padding: isMobile ? '20px 0' : '24px 0', cursor: 'pointer', userSelect: 'none' }}
                  >
                    <span style={{ flex: 1, fontFamily: SERIF, fontSize: isMobile ? 18 : 20, fontWeight: 400, color: isOpen ? 'var(--yte-accent)' : 'var(--yte-ink)', lineHeight: 1.3, letterSpacing: '-0.2px', transition: 'color 0.2s' }}>{item.q}</span>
                    <span aria-hidden="true" style={{ flexShrink: 0, fontFamily: SANS, fontSize: 26, fontWeight: 300, color: 'var(--yte-accent)', lineHeight: 1, transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                  </div>
                  <div className={`vig-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="vig-faq-answer-inner">
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
