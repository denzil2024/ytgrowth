import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free SEO tool: YouTube Channel Name Generator ────────────────────────
   /tools/youtube-channel-name-generator. Targets ~30K monthly searches.

   Migrated to the editorial design language (Fraunces + Barlow, sharp flat
   cards, warm paper, restrained red). The pattern-template logic, URL sync,
   and ALL content (how-naming-works, grow cards, 15 FAQs) are preserved
   verbatim from the original; only the skin changed. Vibe filters stay
   quiet-grey, never red (see feedback_quiet_toggles). 100% client-side,
   zero API. See project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''

const PATTERNS = {
  pro: [
    (k) => `${cap(k)} HQ`,           (k) => `${cap(k)} Lab`,           (k) => `${cap(k)} Hub`,
    (k) => `${cap(k)} Pro`,          (k) => `${cap(k)} Studio`,        (k) => `${cap(k)} Insider`,
    (k) => `${cap(k)} Decoded`,      (k) => `${cap(k)} Wise`,          (k) => `${cap(k)} Mastery`,
    (k) => `${cap(k)} School`,       (k) => `${cap(k)} Academy`,       (k) => `Mastering ${cap(k)}`,
    (k) => `Inside ${cap(k)}`,       (k) => `Beyond ${cap(k)}`,        (k) => `${cap(k)} Briefing`,
    (k) => `The ${cap(k)} Report`,   (k) => `${cap(k)} Method`,        (k) => `${cap(k)} Institute`,
  ],
  punchy: [
    (k) => `${cap(k)} Daily`,        (k) => `${cap(k)} Nation`,        (k) => `${cap(k)} Crew`,
    (k) => `${cap(k)} Squad`,        (k) => `${cap(k)} Tribe`,         (k) => `${cap(k)} Junkie`,
    (k) => `${cap(k)} Addict`,       (k) => `${cap(k)} Fix`,           (k) => `${cap(k)} Rush`,
    (k) => `${cap(k)} Vibes`,        (k) => `${cap(k)} Gang`,          (k) => `Hacking ${cap(k)}`,
    (k) => `Crushing ${cap(k)}`,     (k) => `${cap(k)} 24/7`,          (k) => `${cap(k)} Unfiltered`,
    (k) => `${cap(k)} Unplugged`,    (k) => `${cap(k)} Loud`,          (k) => `Raw ${cap(k)}`,
  ],
  personal: [
    (k) => `Mr ${cap(k)}`,           (k) => `The ${cap(k)} Guy`,       (k) => `Coach ${cap(k)}`,
    (k) => `${cap(k)} With Me`,      (k) => `My ${cap(k)} Story`,      (k) => `Just ${cap(k)}`,
    (k) => `Honestly ${cap(k)}`,     (k) => `${cap(k)} & Me`,          (k) => `Living ${cap(k)}`,
    (k) => `${cap(k)} Diary`,        (k) => `${cap(k)} Notes`,         (k) => `${cap(k)} Journal`,
    (k) => `${cap(k)} Made Simple`,  (k) => `${cap(k)} Made Easy`,     (k) => `Simply ${cap(k)}`,
    (k) => `Talking ${cap(k)}`,      (k) => `Real ${cap(k)} Talk`,     (k) => `${cap(k)} Honestly`,
  ],
  creative: [
    (k) => `${cap(k)} & Co`,         (k) => `${cap(k)} Files`,         (k) => `${cap(k)} Code`,
    (k) => `${cap(k)} Engine`,       (k) => `${cap(k)} Forge`,         (k) => `${cap(k)} Lens`,
    (k) => `${cap(k)} Atlas`,        (k) => `${cap(k)} Chronicles`,    (k) => `${cap(k)} Field Guide`,
    (k) => `${cap(k)} Blueprint`,    (k) => `Project ${cap(k)}`,       (k) => `The ${cap(k)} Show`,
    (k) => `The ${cap(k)} Edit`,     (k) => `${cap(k)} Untold`,        (k) => `${cap(k)} Effect`,
    (k) => `${cap(k)} Theory`,       (k) => `${cap(k)} Workshop`,      (k) => `${cap(k)} Lab Notes`,
  ],
  combo: [
    (a, b) => `${cap(a)} & ${cap(b)}`,        (a, b) => `${cap(a)} for ${cap(b)}`,
    (a, b) => `${cap(a)} Meets ${cap(b)}`,    (a, b) => `${cap(a)} x ${cap(b)}`,
    (a, b) => `${cap(b)} ${cap(a)}`,          (a, b) => `${cap(a)} ${cap(b)} Lab`,
    (a, b) => `${cap(a)} ${cap(b)} HQ`,       (a, b) => `The ${cap(a)} ${cap(b)} Show`,
  ],
}

const TONE_LABELS = { all: 'All vibes', pro: 'Professional', punchy: 'Punchy', personal: 'Personal', creative: 'Creative' }
const TONE_DESCRIPTIONS = {
  pro: 'Authoritative, structured. Reads as expert content.',
  punchy: 'High-energy, repeatable. Reads as community-driven.',
  personal: 'Warm, first-person. Reads as a creator-led brand.',
  creative: 'Distinctive, editorial. Reads as a publication or studio.',
}

function generateNames(keyword, second, tones) {
  const k = (keyword || '').trim()
  if (!k) return []
  const k2 = (second || '').trim()
  const seen = new Set()
  const out = []
  const includeTone = (t) => tones.includes('all') || tones.includes(t)
  for (const tone of ['pro', 'punchy', 'personal', 'creative']) {
    if (!includeTone(tone)) continue
    for (const fn of PATTERNS[tone]) {
      try {
        const name = fn(k).replace(/\s+/g, ' ').trim()
        const key = name.toLowerCase()
        if (name && !seen.has(key)) { seen.add(key); out.push({ name, tone, length: name.length }) }
      } catch (_) { /* swallow */ }
    }
  }
  if (k2) {
    for (const fn of PATTERNS.combo) {
      try {
        const name = fn(k, k2).replace(/\s+/g, ' ').trim()
        const key = name.toLowerCase()
        if (name && !seen.has(key)) { seen.add(key); out.push({ name, tone: 'creative', length: name.length }) }
      } catch (_) { /* swallow */ }
    }
  }
  return out
}

const EXAMPLES = ['fitness', 'finance', 'cooking', 'tech reviews', 'productivity', 'travel', 'gaming', 'photography']

const FAQS = [
  { q: 'Are these channel names available on YouTube?',
    a: "This generator creates name ideas from pattern templates. It does not check real-time YouTube handle or display name availability. Once you find a name you like, copy it and check directly inside YouTube Studio (Settings → Channel → Basic info) where YouTube validates handles in real time. Note that the handle (@yourname) is what determines uniqueness, not the channel display name. Two channels can share the same display name, but every handle is globally unique." },
  { q: 'How do I pick the right name from this list?',
    a: "Three rules. One: easy to spell and easy to say out loud, because viewers will recommend you verbally and type your name into search. Two: related to your niche so the algorithm and viewers can categorize you instantly. Three: not too narrow. \"BeginnerYogaForRunners\" boxes you in if you ever pivot. \"FlowAcademy\" gives you room to expand. Pick a name you can grow into at 100K subscribers, not just one that fits where you are at zero." },
  { q: "What is the difference between channel name and handle?",
    a: 'Your display name is what viewers see (e.g., "MrBeast"). It can be changed twice every 14 days, can include spaces, and does not have to be unique. Your handle is your @username (e.g., @MrBeast). It must be globally unique, no spaces, 3-30 characters, and is used in your URL (youtube.com/@yourhandle). Pick a strong display name first, then claim a matching or close handle while it is still available.' },
  { q: 'Can I change my YouTube channel name later?',
    a: "Yes. YouTube lets you change both your display name and handle, though there are rate limits (typically 2 changes per 14 days). What you cannot easily do is rebuild brand recognition once you have grown an audience under one name. Pick something you would still be happy to keep at 100K subscribers, not just at zero. Frequent name changes also confuse the algorithm and dilute your channel's topical signal." },
  { q: "Do channel names matter for SEO?",
    a: "Channel names are a relatively weak ranking signal compared to titles, descriptions, and retention. But a niche-aligned name does help. When YouTube's algorithm sees a viewer search for \"running tips\" and your channel is called \"Run Lab\", that's one more relevance hint. Don't keyword-stuff (\"Best Running Tips Channel For Beginners 2026\"). Just pick a name that hints at what you do, and let your titles and thumbnails do the heavy lifting on SEO." },
  { q: 'Why are the same patterns repeated across niches?',
    a: "Because formats like \"X HQ\", \"X Lab\", \"Mr X\", and \"Project X\" work in any niche. They're proven patterns, not niche-specific inventions. Generating thousands of unique names per niche would just give you noise. The pattern templates are the signal: pick a tone, plug in your niche, and you have a name that follows a structure successful channels already use." },
  { q: "Should my channel name be my real name?",
    a: "Depends on your strategy. Real names work best if your channel is built around personal expertise, vlogs, lifestyle content, or anything where viewers are subscribing to YOU as much as the topic. Brand names (FlowAcademy, Run Lab) work better for faceless channels, multi-creator channels, or anything you might sell or hand off later. Hybrid approach: real name in the channel description, brand name on the channel itself." },
  { q: "How long should a YouTube channel name be?",
    a: "Display names should fit comfortably under 30 characters, ideally 8-20. Anything longer gets truncated in the sidebar, in search results, and on mobile. Handles must be 3-30 characters with no spaces. Shorter is more memorable and easier to type. The most successful channels on YouTube have names averaging 10-15 characters: MrBeast (7), Veritasium (10), Ali Abdaal (10), Mark Rober (10)." },
  { q: 'What makes a channel name "memorable"?',
    a: "Three traits show up in nearly every memorable YouTube name: (1) it is short, usually under 12 characters; (2) it has a rhythm or sound pattern that makes it easy to say (alliteration, rhyme, or punchy syllables); (3) it ties to a specific identity or topic that gives the brain a category to file it under. \"Veritasium\" works because it sounds scientific. \"MrBeast\" works because it sounds bold and personal. Patterns matter more than originality." },
  { q: "Can I use trademarked words in my channel name?",
    a: "Avoid. YouTube takes down channels that include trademarked brand names without permission (Apple, Nike, Disney, etc.). Even if you get away with it for a while, your channel can be terminated retroactively and you lose all your subscribers. Pattern names like \"Apple Tips\" or \"NikeRunner\" are common takedown targets. Build your brand around a name you own. The free generator above avoids brand-trademark patterns entirely for this reason." },
  { q: "Should I include 'TV', 'Channel', or 'YouTube' in my name?",
    a: "Generally no, on all three. \"X TV\" feels dated (it's a relic of when YouTube channels were trying to mimic broadcast TV). \"X Channel\" is redundant, since viewers already know it's a channel. Including \"YouTube\" in your name is a guidelines violation and can trigger removal. The strongest names skip these entirely and just lean on the topic word plus a pattern (X Lab, Project X, Daily X)." },
  { q: 'What is a good naming pattern for a faceless channel?',
    a: "Brand-style names work best for faceless content because they remove the personality dependency. Patterns like \"X Files\", \"X Academy\", \"Project X\", \"X Decoded\", or \"The X Report\" set the expectation that the channel is about the topic, not the creator. Avoid personal patterns (\"Mr X\", \"X With Me\") because they create a creator-identity gap viewers will notice. Pure brand names also make the channel easier to sell, license, or hand off to another team later." },
  { q: 'How do I check if a name is already taken on YouTube?',
    a: 'Two checks. (1) Display name: search for it on YouTube. If a popular channel already uses it, your channel will be hard to discover. (2) Handle: try to claim @yourname inside YouTube Studio → Settings → Channel → Handle. YouTube tells you in real time if the handle is available. If the handle is taken but the display name is free, consider a slight variation (@RunLabHQ, @TheRunLab) so your URL is still memorable.' },
  { q: 'Should my name reflect my niche or my personality?',
    a: 'Both, ideally. But if you have to pick, niche wins for early-stage growth. The algorithm and new viewers need topical clues to know whether to recommend you. Personality-driven names work great once you have an audience, but they cost you discoverability when you are unknown. The best compromise: pick a name that hints at the niche but does not fully limit it (e.g., "FlowAcademy" hints at fitness/wellness without locking you into yoga forever).' },
  { q: 'Is this generator free? Will you collect my data?',
    a: "Yes, free forever. And no data collection. The generator runs entirely in your browser, with no inputs sent to our servers, no email required, no signup gate, no analytics tied to the names you type. We built it as a genuine free tool because every new creator deserves a starting list of solid names without paying for one. If you want a full growth plan once you've launched, you can connect your channel for a free AI audit on the main app, but it is entirely optional." },
]

const HOW_NAMING_WORKS = [
  { h: 'Easy to say beats clever every time',
    p: 'A channel name spreads when viewers can recommend it out loud. If your name has silent letters, unusual spellings, or inside jokes only your friends get, you just put a tax on every word-of-mouth referral. The biggest channels on the platform (MrBeast, Veritasium, Mark Rober, Ali Abdaal) all pass a simple test: read it aloud and your friend can spell it back without asking how.' },
  { h: 'Niche signal beats personality signal early',
    p: 'When you have zero subscribers, viewers and the algorithm both need a topical clue to know whether to engage with you. A name that hints at your niche ("Run Lab", "FlowAcademy", "TechDecoded") gives you that clue. A pure personal-brand name ("Sarah & Ben", "JustMike") wins later, once you have an audience that already knows what you do, but it costs you discoverability when you are unknown.' },
  { h: 'Specificity is a trap. Categories are an asset.',
    p: 'A name like "BeginnerYogaForRunners" sounds focused but boxes you in. The day you want to cover meditation, mobility, or running form, your name fights you. Smart names pick a category you can grow inside (fitness, finance, photography) without locking you to one sub-topic. Pattern templates like "X Lab" and "Project X" deliberately keep that flexibility.' },
  { h: 'The handle decision matters more than the display name',
    p: 'Display names can be edited. Handles get sticky. Once people are sharing youtube.com/@yourname, sponsors are tagging it, and your own analytics are linked to it, changing the handle costs you traffic and brand recognition. Pick a handle you would still want at 100K subscribers, and pair it with a display name that can flex over time as your channel evolves.' },
]

const GROW = [
  { label: 'Video Ideas Generator', title: 'Find what to film first', body: 'Ninety+ proven YouTube format templates plug into your niche to surface a list of ideas with real CTR potential. Same browser-based, free, no signup model as this tool.', href: '/tools/youtube-video-ideas-generator' },
  { label: 'SEO Studio',             title: 'Score titles before you publish', body: 'Every title gets a 0–100 score against the live niche, plus 3 AI rewrites built around the top-ranking videos in your category. Stops you publishing weak titles.', href: '/features/seo-studio' },
  { label: 'Thumbnail IQ',           title: 'Win the click war from day one', body: 'Score every thumbnail against the top performers in your niche on contrast, face presence, and curiosity-gap signals, before the upload, not after the CTR data comes in.', href: '/features/thumbnail-iq' },
]

/* Per-vibe accent tints, tuned to read on the dark output pane. The four
   vibes are the one place color is semantically meaningful, so each gets a
   restrained, distinct hue instead of uniform grey. */
const TONE_DARK = {
  pro:      { fg: '#8fb4f2', bg: 'rgba(143,180,242,0.14)' },
  punchy:   { fg: '#ff8a82', bg: 'rgba(255,138,130,0.15)' },
  personal: { fg: '#6cd6a2', bg: 'rgba(108,214,162,0.14)' },
  creative: { fg: '#ecc15f', bg: 'rgba(236,193,95,0.14)' },
}

function VibeTag({ tone }) {
  const t = TONE_DARK[tone] || TONE_DARK.creative
  return (
    <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 9px', color: t.fg, background: t.bg }}>{tone}</span>
  )
}

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
    if (document.getElementById('cng-styles')) return
    const style = document.createElement('style')
    style.id = 'cng-styles'
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
      @keyframes cngFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
      @keyframes cngPop { 0% { transform: translateY(4px); opacity: 0 } 100% { transform: translateY(0); opacity: 1 } }

      .cng-wrap { max-width: 1040px; margin: 0 auto; }
      .cng-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .cng-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .cng-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .cng-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.04; }
      .cng-h1 em { font-style: italic; color: var(--yte-accent); }
      .cng-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .cng-h2 em { font-style: italic; color: var(--yte-accent); }
      .cng-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .cng-label { display: block; font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-muted); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 9px; }
      .cng-input { width: 100%; padding: 13px 14px; font-size: 15px; font-weight: 500; font-family: ${SANS}; color: var(--yte-ink); background: var(--yte-bg); border: 1px solid var(--yte-line); border-radius: 0; outline: none; transition: border-color 0.15s, background 0.15s; -webkit-appearance: none; }
      .cng-input:focus { border-color: var(--yte-accent); background: #fff; }

      /* Vibe filters: quiet, active = ink, never red */
      .cng-tone-row { display: flex; gap: 0; flex-wrap: wrap; border: 1px solid var(--yte-line); width: fit-content; max-width: 100%; }
      .cng-tone { font-family: ${SANS}; font-size: 12.5px; font-weight: 600; letter-spacing: 0.01em; color: var(--yte-muted); background: var(--yte-surface); border: none; padding: 9px 15px; cursor: pointer; transition: background 0.15s, color 0.15s; }
      .cng-tone + .cng-tone { border-left: 1px solid var(--yte-line); }
      .cng-tone:hover { color: var(--yte-ink); }
      .cng-tone.active { background: var(--yte-ink); color: #fff; }

      .cng-sample-row { display: flex; flex-wrap: wrap; gap: 6px; }
      .cng-sample-chip { background: var(--yte-bg); border: 1px solid var(--yte-line); color: var(--yte-soft); font-family: ${SANS}; font-size: 12.5px; font-weight: 500; padding: 6px 12px; border-radius: 0; cursor: pointer; transition: border-color 0.15s, color 0.15s, background 0.15s; }
      .cng-sample-chip:hover { border-color: var(--yte-accent); color: var(--yte-accent); background: var(--yte-accent-soft); }

      .cng-tool-grid { display: grid; grid-template-columns: 0.92fr 1.08fr; gap: 12px; align-items: stretch; }
      @media (max-width: 880px) { .cng-tool-grid { grid-template-columns: 1fr; } }
      .cng-pane { background: var(--yte-surface); border: 1px solid var(--yte-line); padding: 28px; }
      .cng-pane-dark { background: var(--yte-ink); padding: 32px; color: #fff; }

      .cng-results-card { background: var(--yte-surface); border: 1px solid var(--yte-line); padding: 28px; }
      .cng-results-scroll { max-height: 760px; overflow-y: auto; padding-right: 4px; }
      .cng-results-scroll::-webkit-scrollbar { width: 8px }
      .cng-results-scroll::-webkit-scrollbar-thumb { background-color: rgba(20,19,15,0.18); border-radius: 0; }

      .cng-group { padding: 22px 0 24px; border-bottom: 1px solid var(--yte-line); }
      .cng-group:last-child { border-bottom: 0; padding-bottom: 4px; }
      .cng-group:first-child { padding-top: 4px; }
      .cng-group-head { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
      .cng-group-label { font-family: ${SERIF}; font-size: 22px; font-weight: 400; letter-spacing: -0.3px; color: var(--yte-ink); }
      .cng-group-count { font-family: ${SANS}; font-size: 12px; font-weight: 600; color: var(--yte-muted); letter-spacing: 0.06em; text-transform: uppercase; }
      .cng-group-blurb { font-family: ${SANS}; font-size: 13px; color: var(--yte-muted); margin-left: auto; line-height: 1.5; text-align: right; max-width: 320px; }
      @media (max-width: 720px) { .cng-group-blurb { order: 1; margin-left: 0; text-align: left; max-width: 100%; flex-basis: 100%; } .cng-copy-all { margin-left: auto; } }

      .cng-group-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 18px; }
      @media (max-width: 720px) { .cng-group-grid { grid-template-columns: 1fr; } }

      .cng-result-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 10px 10px 0; border-bottom: 1px solid var(--yte-line); animation: cngPop 0.2s ease both; transition: background 0.15s; }
      .cng-result-row:hover { background: var(--yte-bg-2); }
      .cng-result-row:hover .cng-copy-btn { opacity: 1; }
      .cng-result-name { font-family: ${SANS}; font-size: 15.5px; font-weight: 500; color: var(--yte-ink); letter-spacing: -0.1px; line-height: 1.3; word-break: break-word; }

      .cng-copy-btn { background: transparent; border: 0; cursor: pointer; flex-shrink: 0; font-family: ${SANS}; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--yte-muted); padding: 6px 8px; opacity: 0.55; transition: opacity 0.15s, color 0.15s; display: inline-flex; align-items: center; gap: 5px; }
      .cng-copy-btn:hover { color: var(--yte-accent); opacity: 1; }
      .cng-copy-btn.copied { color: #0f7a43; opacity: 1; }

      .cng-copy-all { background: transparent; border: 1px solid var(--yte-line); cursor: pointer; flex-shrink: 0; font-family: ${SANS}; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--yte-soft); padding: 7px 12px; display: inline-flex; align-items: center; gap: 6px; transition: color 0.15s, border-color 0.15s; }
      .cng-copy-all:hover { color: var(--yte-accent); border-color: var(--yte-accent); }
      .cng-copy-all.copied { color: #0f7a43; border-color: rgba(15,122,67,0.4); }

      .cng-grow-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 760px) { .cng-grow-grid { grid-template-columns: 1fr; } }
      .cng-grow-card { display: block; text-decoration: none; background: var(--yte-surface); padding: 28px; transition: background 0.15s; }
      .cng-grow-card:hover { background: var(--yte-bg-2); }

      .cng-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease; }
      .cng-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .cng-faq-answer-inner { overflow: hidden; }

      @media (max-width: 768px) { .cng-section-pad { padding-left: 22px !important; padding-right: 22px !important; } .cng-cta-pad { padding: 76px 24px !important; } }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children, center }) {
  return (
    <div className="cng-eyebrow" style={center ? { justifyContent: 'center' } : undefined}>
      <span aria-hidden="true" className="cng-eyebrow-rule" />
      <span className="cng-eyebrow-text">{children}</span>
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
    } catch (_) {}
  }, [text])
  return (
    <button onClick={onClick} className={`cng-copy-btn${copied ? ' copied' : ''}`} aria-label={`Copy ${text}`}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function CopyAllButton({ names, label }) {
  const [copied, setCopied] = useState(false)
  const onClick = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(names.join('\n'))
      setCopied(true); setTimeout(() => setCopied(false), 1600)
    } catch (_) {}
  }, [names])
  return (
    <button onClick={onClick} className={`cng-copy-all${copied ? ' copied' : ''}`} aria-label={`Copy all ${names.length} ${label} names`}>
      {copied ? `Copied ${names.length}` : `Copy all ${names.length}`}
    </button>
  )
}

export default function YoutubeChannelNameGenerator() {
  useGlobalStyles()
  const { isMobile, isTablet } = useBreakpoint()
  /* Niche + second word are mirrored to ?niche=&second= so creators
     can bookmark or share a generated list. Initial state is empty
     (matches prerendered HTML for hydration), URL is read once on
     mount in the same effect that handles ongoing sync. Vibe filters
     stay out of the URL to keep share links short. */
  const [keyword, setKeyword] = useState('')
  const [second,  setSecond]  = useState('')
  const [tones,   setTones]   = useState(['all'])
  const [openFaq, setOpenFaq] = useState(0)
  const urlInitRef = useRef(false)

  useEffect(() => {
    document.title = 'YouTube Name Generator 2026: Free Channel Name Ideas for YouTubers | YTGrowth'
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = 'Free YouTube channel name generator and name ideas tool. 60+ creative name suggestions for YouTubers, vloggers, and gaming channels. No signup, no AI hallucinations.'
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!urlInitRef.current) {
      urlInitRef.current = true
      const params = new URLSearchParams(window.location.search)
      const niche = params.get('niche') || ''
      const sec   = params.get('second') || ''
      if (niche) setKeyword(niche)
      if (sec)   setSecond(sec)
      return
    }
    /* Subsequent state changes: replaceState (not pushState) so the
       back button doesn't walk every keystroke. */
    const params = new URLSearchParams(window.location.search)
    const k = keyword.trim()
    const s = second.trim()
    if (k) params.set('niche', k); else params.delete('niche')
    if (s) params.set('second', s); else params.delete('second')
    const qs = params.toString()
    const next = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash
    const curr = window.location.pathname + window.location.search + window.location.hash
    if (next !== curr) window.history.replaceState(null, '', next)
  }, [keyword, second])

  const names = useMemo(() => generateNames(keyword, second, tones), [keyword, second, tones])

  const toggleTone = (t) => {
    if (t === 'all') { setTones(['all']); return }
    setTones((curr) => {
      const without = curr.filter(x => x !== 'all' && x !== t)
      const next = curr.includes(t) ? without : [...without, t]
      return next.length === 0 ? ['all'] : next
    })
  }

  const showResults = keyword.trim().length > 0
  const featured = names[0]
  const rest = names.slice(1)
  const toneCount = tones.includes('all') ? 4 : tones.length

  const H1 = isMobile ? 34 : isTablet ? 50 : 58
  const H2 = isMobile ? 28 : 42

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', overflowX: 'clip' }}>

      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="cng-section-pad" style={{ padding: isMobile ? '60px 22px 40px' : '104px 48px 48px', background: 'var(--yte-bg)' }}>
        <div className="cng-wrap" style={{ animation: 'cngFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 className="cng-h1" style={{ fontSize: H1, marginBottom: 22, maxWidth: 820, textWrap: 'balance' }}>
            What should your <em>YouTube channel be called?</em>
          </h1>
          <div style={{ maxWidth: 660 }}>
            <p className="cng-lead" style={{ fontSize: isMobile ? 16 : 17.5, marginBottom: 14, textWrap: 'pretty' }}>
              Sixty+ name ideas built from proven YouTube name patterns. Type your niche, pick a vibe, and pick a name you can grow into.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>No signup. No email. Free forever.</p>
          </div>
        </div>
      </section>

      {/* ══ TOOL ══ */}
      <section id="generator" className="cng-section-pad" style={{ padding: isMobile ? '8px 22px 72px' : '0 48px 96px', background: 'var(--yte-bg)' }}>
        <div className="cng-wrap">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="cng-tool-grid">

              {/* LEFT, input pane */}
              <div className="cng-pane" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: 20 }}>
                  <label className="cng-label">Your niche</label>
                  <input type="text" className="cng-input" placeholder="e.g. fitness, finance, cooking" value={keyword} onChange={(e) => setKeyword(e.target.value)} autoFocus />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label className="cng-label">Optional second word</label>
                  <input type="text" className="cng-input" placeholder="e.g. beginners, daily, weekly" value={second} onChange={(e) => setSecond(e.target.value)} />
                  <p style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)', marginTop: 7, lineHeight: 1.55 }}>
                    Adds combo patterns like "Fitness for Beginners" and "Fitness x Beginners".
                  </p>
                </div>

                <div>
                  <label className="cng-label">Vibe</label>
                  <div className="cng-tone-row">
                    {['all', 'pro', 'punchy', 'personal', 'creative'].map(t => (
                      <button key={t} onClick={() => toggleTone(t)} className={`cng-tone${tones.includes(t) ? ' active' : ''}`}>{TONE_LABELS[t]}</button>
                    ))}
                  </div>
                </div>

                {!showResults && (
                  <div style={{ marginTop: 22 }}>
                    <label className="cng-label">Try a sample</label>
                    <div className="cng-sample-row">
                      {EXAMPLES.map(ex => (
                        <button key={ex} onClick={() => setKeyword(ex)} className="cng-sample-chip">{ex}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT, top pick (dark) OR empty state */}
              {showResults && featured ? (
                <div className="cng-pane-dark">
                  <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
                    Top pick for {keyword}{second ? ` × ${second}` : ''}
                  </div>
                  <div style={{ fontFamily: SERIF, fontSize: isMobile ? 38 : 50, fontWeight: 400, letterSpacing: '-1px', lineHeight: 1.04, marginBottom: 16, wordBreak: 'break-word', color: '#fff' }}>
                    {featured.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                    <VibeTag tone={featured.tone} />
                    <span style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{featured.length} characters</span>
                  </div>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.14)', margin: '0 0 24px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 32 }}>
                      <div>
                        <div style={{ fontFamily: SANS, fontSize: 10.5, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>Total ideas</div>
                        <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, letterSpacing: '-0.5px', color: '#fff' }}>{names.length}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: SANS, fontSize: 10.5, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>Vibes</div>
                        <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, letterSpacing: '-0.5px', color: '#fff' }}>{toneCount}</div>
                      </div>
                    </div>
                    <button onClick={() => navigator.clipboard?.writeText(featured.name)} style={{ background: '#fff', color: 'var(--yte-ink)', border: 0, fontFamily: SANS, fontWeight: 700, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 22px', cursor: 'pointer' }}>
                      Copy name
                    </button>
                  </div>
                </div>
              ) : (
                <div className="cng-pane-dark" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>Sample preview</p>
                    <p style={{ fontFamily: SERIF, fontSize: isMobile ? 22 : 26, fontWeight: 400, color: '#fff', letterSpacing: '-0.4px', lineHeight: 1.2 }}>
                      Names like these, for any niche
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {[
                      { name: 'Fitness HQ',          tone: 'pro' },
                      { name: 'Daily Finance',       tone: 'punchy' },
                      { name: 'Coach Productivity',  tone: 'personal' },
                      { name: 'Project Cooking',     tone: 'creative' },
                      { name: 'TechDecoded',         tone: 'creative' },
                    ].map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                        <span style={{ width: 76, flexShrink: 0 }}><VibeTag tone={s.tone} /></span>
                        <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: '#fff', letterSpacing: '-0.1px' }}>{s.name}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55, margin: 0 }}>
                    Type any niche to generate 60+ ideas across 4 vibes.
                  </p>
                </div>
              )}
            </div>

            {/* BOTTOM, full-width more options, grouped by vibe */}
            {showResults && featured && rest.length > 0 && (() => {
              const TONE_ORDER = ['pro', 'punchy', 'personal', 'creative']
              const grouped = TONE_ORDER
                .map(id => ({ id, label: TONE_LABELS[id], blurb: TONE_DESCRIPTIONS[id], items: rest.filter(r => r.tone === id) }))
                .filter(g => g.items.length > 0)
              return (
                <div className="cng-results-card">
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 6, paddingBottom: 18, borderBottom: '1px solid var(--yte-line)' }}>
                    <div>
                      <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>More names</p>
                      <h3 className="cng-h2" style={{ fontSize: isMobile ? 22 : 26 }}>
                        {rest.length} more, grouped by vibe
                      </h3>
                    </div>
                    <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-muted)', maxWidth: isMobile ? '100%' : 320, lineHeight: 1.55 }}>
                      Pick a vibe that matches the channel you want to run a year from now, not the one you have today.
                    </p>
                  </div>
                  <div className="cng-results-scroll">
                    {grouped.map(group => (
                      <div key={group.id} className="cng-group">
                        <div className="cng-group-head">
                          <span className="cng-group-label">{group.label}</span>
                          <span className="cng-group-count">{group.items.length} {group.items.length === 1 ? 'name' : 'names'}</span>
                          <span className="cng-group-blurb">{group.blurb}</span>
                          <CopyAllButton names={group.items.map(n => n.name)} label={group.label.toLowerCase()} />
                        </div>
                        <div className="cng-group-grid">
                          {group.items.map((n, i) => (
                            <div key={i} className="cng-result-row">
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div className="cng-result-name">{n.name}</div>
                                <div style={{ fontFamily: SANS, fontSize: 11.5, color: 'var(--yte-muted)', marginTop: 2 }}>{n.length} characters</div>
                              </div>
                              <CopyButton text={n.name} />
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

      {/* ══ HOW NAMING WORKS ══ */}
      <section className="cng-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="cng-wrap">
          <div style={{ marginBottom: 40, maxWidth: 700 }}>
            <Eyebrow>How naming works</Eyebrow>
            <h2 className="cng-h2" style={{ fontSize: H2, textWrap: 'balance' }}>
              What makes a YouTube name <em>stick.</em>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {HOW_NAMING_WORKS.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 10 : 48, padding: '26px 0', borderTop: i === 0 ? 'none' : '1px solid var(--yte-line)' }}>
                <h3 style={{ fontFamily: SERIF, fontSize: isMobile ? 21 : 23, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', lineHeight: 1.2 }}>{row.h}</h3>
                <p style={{ fontFamily: SANS, fontSize: isMobile ? 15 : 16, color: 'var(--yte-soft)', lineHeight: 1.72 }}>{row.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GROW WITH FEATURES, 3-card grid ══ */}
      <section className="cng-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="cng-wrap">
          <div style={{ marginBottom: 32, maxWidth: 700 }}>
            <Eyebrow>After you launch</Eyebrow>
            <h2 className="cng-h2" style={{ fontSize: H2, marginBottom: 12, textWrap: 'balance' }}>
              You picked a name. <em>Now grow into it.</em>
            </h2>
            <p className="cng-lead" style={{ fontSize: 17 }}>
              Three free tools and features that take you from name to first subscribers.
            </p>
          </div>
          <div className="cng-grow-grid">
            {GROW.map((card, i) => (
              <a key={i} href={card.href} className="cng-grow-card">
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>{card.label}</div>
                <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', marginBottom: 12, lineHeight: 1.2 }}>{card.title}</h3>
                <p style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.65 }}>{card.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div className="cng-section-pad" style={{ background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)', padding: isMobile ? '60px 22px' : '104px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 36 : 80, alignItems: 'start' }}>
          <div>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="cng-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>Names, <em>answered.</em></h2>
            <p className="cng-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              Everything new creators ask before locking in a channel name. Still unsure? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
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
                  <div className={`cng-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="cng-faq-answer-inner">
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
