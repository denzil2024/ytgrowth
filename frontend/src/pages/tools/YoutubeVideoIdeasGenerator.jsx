import { useEffect, useState, useMemo, useCallback } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'

/* ─── Free SEO tool: YouTube Video Ideas Generator ──────────────────────────
   /tools/youtube-video-ideas-generator. Targets ~50K monthly searches.

   100% client-side. We ship a curated database of proven YouTube formats
   grouped by intent (Listicles / Tutorials / Challenges / Mistakes /
   Comparisons / Stories / Quick tips). User types niche; we plug it
   into the templates and surface 50+ ideas.

   No AI. No backend. No API call. Refresh button reshuffles the seed. */

const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''
const lower = (s) => (s || '').toLowerCase()

/* Format library — each tagged with an intent category. The {x} placeholder
   gets the user's niche, capitalized or lowercased depending on context. */
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
    'No-{x} for 30 days — what changed',
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
  { id: 'comparison', label: 'Comparisons', blurb: 'Versus/which-is-better matchups.' },
  { id: 'story',      label: 'Stories',     blurb: 'Personal journey and reflection.' },
  { id: 'quicktip',   label: 'Quick tips',  blurb: 'Bite-size value, ideal for Shorts.' },
  { id: 'deepdive',   label: 'Deep dives',  blurb: 'Long-form authority videos.' },
  { id: 'shorts',     label: 'Shorts',      blurb: 'Hook-first formats for the Shorts feed.' },
]

const CAT_LOOKUP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]))

/* Capitalize first letter only when {cap} placeholder is used; lowercase
   everywhere else. Avoids "How to FITNESS" type bugs. */
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
      out.push({ title: fillTemplate(t, n), category: cat, length: fillTemplate(t, n).length })
    }
  }
  return out
}

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
    const link = document.createElement('link')
    link.id = 'vig-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'vig-styles'
    style.textContent = `
      :root {
        --ytg-bg:           #f4f4f6;
        --ytg-bg-2:         #ecedf1;
        --ytg-bg-3:         #e6e7ec;
        --ytg-text:         #0a0a0f;
        --ytg-text-2:       rgba(10,10,15,0.62);
        --ytg-text-3:       rgba(10,10,15,0.40);
        --ytg-card:         #ffffff;
        --ytg-border:       rgba(10,10,15,0.09);
        --ytg-accent:       #e5302a;
        --ytg-accent-text:  #c22b25;
        --ytg-accent-light: rgba(229,48,42,0.07);
        --ytg-shadow-sm:    0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
        --ytg-shadow-lg:    0 4px 16px rgba(0,0,0,0.11), 0 24px 60px rgba(0,0,0,0.14);
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 12px; height: 12px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background-color: rgba(10,10,15,0.28); border-radius: 10px; border: 3px solid transparent; background-clip: content-box; }
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
        border-radius: 100px; padding: 5px 12px 5px 10px; margin-bottom: 22px;
        box-shadow: 0 1px 2px rgba(10,10,15,0.04);
      }
      .vig-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ytg-accent); box-shadow: 0 0 0 3px rgba(229,48,42,0.12); }
      .vig-eyebrow-text { font-size: 11px; font-weight: 700; color: var(--ytg-text-2); text-transform: uppercase; letter-spacing: 0.09em; }

      .vig-h1 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -2px; line-height: 1.05; text-wrap: balance; }
      .vig-h2 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -1.4px; line-height: 1.08; text-wrap: balance; }

      .vig-input {
        width: 100%; padding: 14px 16px;
        font-size: 16px; font-weight: 500; font-family: inherit;
        color: var(--ytg-text);
        background: var(--ytg-card); border: 1.5px solid var(--ytg-border);
        border-radius: 12px; outline: none;
        transition: border-color 0.15s;
      }
      .vig-input:focus { border-color: var(--ytg-accent); box-shadow: 0 0 0 3px rgba(229,48,42,0.10); }

      .vig-cat-row { display: flex; gap: 8px; flex-wrap: wrap; }
      .vig-cat {
        background: var(--ytg-card);
        border: 1.5px solid var(--ytg-border);
        color: var(--ytg-text-2);
        font-size: 13px; font-weight: 600; letter-spacing: -0.1px;
        padding: 8px 14px; border-radius: 100px;
        cursor: pointer; transition: border-color 0.15s, color 0.15s, background 0.15s;
      }
      .vig-cat:hover { border-color: var(--ytg-text-3); color: var(--ytg-text); }
      .vig-cat.active {
        background: var(--ytg-accent); color: #fff; border-color: var(--ytg-accent);
        box-shadow: 0 1px 3px rgba(0,0,0,0.10), 0 4px 12px rgba(229,48,42,0.28);
      }

      .vig-list { display: flex; flex-direction: column; gap: 10px; }
      .vig-card {
        background: var(--ytg-card);
        border: 1px solid var(--ytg-border);
        border-radius: 14px;
        padding: 16px 18px;
        display: flex; align-items: center; justify-content: space-between; gap: 14px;
        animation: vigPop 0.22s ease both;
        transition: border-color 0.15s, transform 0.15s;
      }
      .vig-card:hover { border-color: var(--ytg-text-3); transform: translateY(-1px); }
      .vig-card-left { flex: 1; min-width: 0; }
      .vig-card-title {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 16px; font-weight: 700; color: var(--ytg-text);
        letter-spacing: -0.2px; line-height: 1.4;
        margin-bottom: 6px;
      }
      .vig-card-meta { display: flex; align-items: center; gap: 10px; font-size: 11px; color: var(--ytg-text-3); }
      .vig-cat-pill {
        font-size: 9.5px; font-weight: 800; letter-spacing: 0.06em;
        text-transform: uppercase; padding: 2px 8px; border-radius: 6px;
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
        background: transparent; border: 0; cursor: pointer;
        font-size: 11px; font-weight: 700; color: var(--ytg-text-3);
        padding: 6px 10px; border-radius: 8px; flex-shrink: 0;
        transition: color 0.15s, background 0.15s;
        display: inline-flex; align-items: center; gap: 5px;
      }
      .vig-copy-btn:hover { color: var(--ytg-accent); background: var(--ytg-accent-light); }
      .vig-copy-btn.copied { color: #166534; background: rgba(74,222,128,0.12); }

      .vig-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
      .vig-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 18px; }
      @media (max-width: 900px) { .vig-grid-3 { grid-template-columns: 1fr; } .vig-grid-4 { grid-template-columns: 1fr 1fr; } }
      @media (max-width: 600px) { .vig-grid-4 { grid-template-columns: 1fr; } }

      .vig-faq-answer {
        display: grid; grid-template-rows: 0fr; opacity: 0;
        transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
      }
      .vig-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .vig-faq-answer-inner { overflow: hidden; }

      @media (max-width: 768px) {
        .vig-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .vig-card { flex-wrap: wrap; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

const EXAMPLES = ['fitness', 'finance', 'cooking', 'tech reviews', 'productivity', 'travel', 'gaming']

const FAQS = [
  {
    q: 'Are these video ideas AI-generated?',
    a: <>No. They're built from a curated library of 90+ proven YouTube format templates — the same kinds of titles top creators use over and over because they work. The tool combines the formats with your niche keyword. No AI hallucinations, no nonsense outputs, no waiting for a model to respond. Pure pattern matching, instant results.</>,
  },
  {
    q: 'How do I know which format will actually rank?',
    a: <>Format matters less than execution. A "Top 5 mistakes" video can flop or go viral depending on the thumbnail, hook, and retention. That said, formats with strong loss-aversion ("mistakes", "wrong"), high specificity (numbered lists, time-bound challenges), and curiosity gaps tend to outperform vague titles. Once you have a candidate, run the title through <a href="/features/seo-studio" style={{ color: 'var(--ytg-accent)', fontWeight: 600 }}>SEO Studio</a> to score it on the live niche.</>,
  },
  {
    q: 'Should I copy these titles word-for-word?',
    a: <>No. Use them as starting structures, then customize. "I tried [X] every day for 30 days" is the proven format — your version should be specific and personal: "I tried cold plunges every morning for 30 days. Here's what changed." The format is the skeleton. The specifics are what earn the click.</>,
  },
  {
    q: 'What if my niche needs a different angle?',
    a: <>Filter by format category. If you're in finance, "Challenges" might feel forced but "Comparisons" and "Mistakes" will fit naturally. If you're a vlogger, "Stories" and "Personal" formats dominate. Toggle off the categories that don't suit your style and the list narrows to what actually works for you.</>,
  },
  {
    q: 'Does this work for YouTube Shorts?',
    a: <>Yes — toggle on the Shorts category. Those formats are designed for the swipe-or-watch decision, with hooks in the first 2 seconds and POV/save-this framings the Shorts algorithm rewards. Long-form formats can also be repurposed into Shorts (a 10-minute "5 mistakes" video makes 5 separate 30-second hooks).</>,
  },
  {
    q: 'Can I use these for my title or description?',
    a: <>The formats are designed as title structures. Once you pick one and customize it, paste your full title into <a href="/features/seo-studio" style={{ color: 'var(--ytg-accent)', fontWeight: 600 }}>SEO Studio</a> for a 0–100 score across SEO, CTR, hook, and length. SEO Studio also generates description rewrites built around your title's primary keyword. The Ideas Generator gets you to the title; SEO Studio gets you the click.</>,
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--ytg-border)' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', padding: '22px 0', fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, fontSize: 16.5, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.2px', lineHeight: 1.45 }}>
        <span style={{ flex: 1 }}>{q}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" style={{ transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, color: open ? 'var(--ytg-accent)' : 'var(--ytg-text-3)', marginTop: 4 }}>
          <path d="M8 2v12M2 8h12"/>
        </svg>
      </button>
      <div className={`vig-faq-answer${open ? ' open' : ''}`}>
        <div className="vig-faq-answer-inner">
          <div style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.78, padding: '0 0 22px 0', maxWidth: 760 }}>{a}</div>
        </div>
      </div>
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const onClick = useCallback(async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch (_) { /* swallow */ }
  }, [text])
  return (
    <button onClick={onClick} className={`vig-copy-btn${copied ? ' copied' : ''}`} aria-label={`Copy ${text}`}>
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6.5l3 3 5-6"/></svg>
          Copied
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="3.5" width="6" height="6" rx="1.2"/><path d="M2.5 8V2.5h5.5"/></svg>
          Copy
        </>
      )}
    </button>
  )
}

export default function YoutubeVideoIdeasGenerator() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()
  const [niche,    setNiche]    = useState('')
  const [activeCats, setActiveCats] = useState(['all'])

  useEffect(() => {
    document.title = 'Free YouTube Video Ideas Generator — 90+ proven formats — YTGrowth'
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = 'Free YouTube video ideas generator. 90+ proven format templates across listicles, tutorials, challenges, mistakes, comparisons, and more. 100% browser-based, no AI, no signup.'
  }, [])

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
  const totalCount = ideas.length

  return (
    <div style={{ background: 'var(--ytg-bg)', minHeight: '100vh' }}>

      <SiteHeader />

      {/* HERO + INPUT */}
      <section className="vig-section-pad" style={{ padding: isMobile ? '56px 24px 32px' : '88px 48px 48px', textAlign: 'center', background: '#ffffff' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', animation: 'vigFadeUp 0.5s ease both' }}>
          <span className="vig-eyebrow">
            <span className="vig-eyebrow-dot" />
            <span className="vig-eyebrow-text">Free · Browser-based · No signup</span>
          </span>
          <h1 className="vig-h1" style={{ fontSize: isMobile ? 36 : 56, color: 'var(--ytg-text)', marginBottom: 18 }}>
            YouTube video ideas generator. <span style={{ color: 'var(--ytg-accent)' }}>Ninety+ formats.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18.5, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 36px' }}>
            Type your niche and get a list of proven YouTube video formats — listicles, tutorials, challenges, mistakes, comparisons, stories, deep dives, and Shorts. Filter by category, copy your favorite, customize, and ship.
          </p>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="text"
            className="vig-input"
            placeholder="Your niche (e.g. fitness, finance, productivity)"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            autoFocus
          />

          <div className="vig-cat-row" style={{ marginTop: 4 }}>
            <button onClick={() => toggleCat('all')} className={`vig-cat${activeCats.includes('all') ? ' active' : ''}`}>All formats</button>
            {CATEGORIES.map(c => (
              <button key={c.id}
                onClick={() => toggleCat(c.id)}
                className={`vig-cat${activeCats.includes(c.id) ? ' active' : ''}`}
              >{c.label}</button>
            ))}
          </div>

          {!showResults && (
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--ytg-text-3)', textAlign: 'left' }}>
              Try one of these:&nbsp;
              {EXAMPLES.map((ex, i) => (
                <button key={i}
                  onClick={() => setNiche(ex)}
                  style={{ background: 'transparent', border: 0, padding: '2px 6px', cursor: 'pointer', color: 'var(--ytg-accent)', fontSize: 13, fontWeight: 600 }}
                >{ex}{i < EXAMPLES.length - 1 ? ',' : ''}</button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* RESULTS */}
      {showResults && (
        <section className="vig-section-pad" style={{ padding: isMobile ? '8px 24px 56px' : '8px 48px 88px', background: '#ffffff' }}>
          <div style={{ maxWidth: 880, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
              <p style={{ fontSize: 13, color: 'var(--ytg-text-3)' }}>
                <strong style={{ color: 'var(--ytg-text-2)' }}>{totalCount}</strong> video idea{totalCount === 1 ? '' : 's'} for <strong style={{ color: 'var(--ytg-text)' }}>{niche}</strong>
              </p>
            </div>
            {totalCount > 0 ? (
              <div className="vig-list">
                {ideas.map((it, i) => (
                  <div key={i} className="vig-card">
                    <div className="vig-card-left">
                      <div className="vig-card-title">{it.title}</div>
                      <div className="vig-card-meta">
                        <span className={`vig-cat-pill ${it.category}`}>{CAT_LOOKUP[it.category]?.label || it.category}</span>
                        <span>{it.length} chars</span>
                      </div>
                    </div>
                    <CopyButton text={it.title} />
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--ytg-text-3)', fontSize: 14, padding: '32px 16px' }}>
                No results for those filters. Toggle on more categories above.
              </p>
            )}
          </div>
        </section>
      )}

      {/* FORMAT CATEGORIES — explainer */}
      <section className="vig-section-pad" style={{ padding: isMobile ? '64px 20px' : '96px 48px', background: 'var(--ytg-bg)', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
            <span className="vig-eyebrow">
              <span className="vig-eyebrow-dot" />
              <span className="vig-eyebrow-text">Nine format categories</span>
            </span>
            <h2 className="vig-h2" style={{ fontSize: isMobile ? 30 : 42, marginBottom: 14, color: 'var(--ytg-text)' }}>
              Every format <span style={{ color: 'var(--ytg-accent)' }}>does a different job.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>
              Each category solves a specific viewer intent. Listicles win clicks. Tutorials capture search demand. Challenges drive watch time. Pick the formats that match what your niche needs most right now.
            </p>
          </div>
          <div className="vig-grid-3">
            {CATEGORIES.map((c, i) => (
              <div key={i} style={{ background: 'var(--ytg-card)', borderRadius: 16, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.2px' }}>{c.label}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-text-3)' }}>{(FORMATS[c.id] || []).length} formats</p>
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--ytg-text-2)', lineHeight: 1.65 }}>{c.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO PICK A WINNER — 4-card grid */}
      <section className="vig-section-pad" style={{ padding: isMobile ? '64px 20px' : '96px 48px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
            <span className="vig-eyebrow">
              <span className="vig-eyebrow-dot" />
              <span className="vig-eyebrow-text">How to use this</span>
            </span>
            <h2 className="vig-h2" style={{ fontSize: isMobile ? 30 : 42, marginBottom: 14, color: 'var(--ytg-text)' }}>
              Generated ideas <span style={{ color: 'var(--ytg-accent)' }}>are starting points.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>
              The tool gives you a structure. You bring the specificity. Four steps to turn a generic format into a video with real CTR.
            </p>
          </div>
          <div className="vig-grid-4">
            {[
              { num: '01', title: 'Add specificity', body: '"5 mistakes new creators make" → "5 thumbnail mistakes that killed my CTR." The format gets the click. Specificity earns it.' },
              { num: '02', title: 'Match search demand', body: 'Cross-reference your title against YouTube Suggest. If real people are typing it, you\'ve got demand. If not, the format won\'t save it.' },
              { num: '03', title: 'Score it before filming', body: 'Run your candidate title through SEO Studio to score it on the live niche, then pick the rewrite with the strongest CTR/hook combination.' },
              { num: '04', title: 'Plan the thumbnail in parallel', body: 'A great title with a weak thumbnail still loses. Sketch the visual concept the moment you pick the format. They have to work together.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--ytg-card)', borderRadius: 16, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', padding: 26 }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--ytg-accent)', letterSpacing: '0.06em', fontFamily: 'monospace', marginBottom: 14 }}>{c.num}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.3px', marginBottom: 8 }}>{c.title}</p>
                <p style={{ fontSize: 13.5, color: 'var(--ytg-text-2)', lineHeight: 1.68 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: isMobile ? '0 16px 0' : '0 48px 0', background: 'var(--ytg-bg)', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', paddingTop: isMobile ? 56 : 88, paddingBottom: isMobile ? 56 : 88 }}>
          <div style={{
            borderRadius: isMobile ? 18 : 24,
            border: '1px solid var(--ytg-border)',
            boxShadow: 'var(--ytg-shadow-lg)',
            padding: isMobile ? '40px 24px 36px' : '64px 56px',
            textAlign: 'center',
            background: 'var(--ytg-card)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 460, height: 220, background: 'radial-gradient(ellipse, rgba(229,48,42,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <span className="vig-eyebrow" style={{ position: 'relative' }}>
              <span className="vig-eyebrow-dot" />
              <span className="vig-eyebrow-text">Next step</span>
            </span>
            <h2 className="vig-h2" style={{ fontSize: isMobile ? 28 : 38, marginBottom: 14, position: 'relative' }}>
              An idea is just structure. <br />
              <span style={{ color: 'var(--ytg-accent)' }}>SEO Studio gets you the click.</span>
            </h2>
            <p style={{ fontSize: isMobile ? 14 : 16, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 26px', position: 'relative' }}>
              Pick a format, customize the title, then paste it into SEO Studio for a 0-100 score across SEO, CTR, hook, and length — plus 3 AI rewrites built against the live niche.
            </p>
            <a href="/features/seo-studio" className="vig-btn vig-btn-lg" style={{ position: 'relative' }}>
              Score it with SEO Studio →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="vig-section-pad" style={{ padding: isMobile ? '64px 20px' : '96px 48px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="vig-eyebrow">
              <span className="vig-eyebrow-dot" />
              <span className="vig-eyebrow-text">Frequently asked</span>
            </span>
            <h2 className="vig-h2" style={{ fontSize: isMobile ? 28 : 36, color: 'var(--ytg-text)' }}>
              Video ideas, sorted.
            </h2>
          </div>
          <div>
            {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      <LandingFooter />

    </div>
  )
}
