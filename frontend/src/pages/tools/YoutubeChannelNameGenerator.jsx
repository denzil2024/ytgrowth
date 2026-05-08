import { useEffect, useState, useMemo, useCallback } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'

/* ─── Free SEO tool: YouTube Channel Name Generator ────────────────────────
   /tools/youtube-channel-name-generator. Targets ~30K monthly searches.

   Visual DNA matches YoutubeMoneyCalculator.jsx exactly: hero with red
   radial backdrop, two-card calculator layout (inputs left, prominent
   result right), 4-row "how it works" deep-dive, 3-card feature grid,
   dark CTA band with red glow, 2-column numbered FAQ.

   100% client-side. Pattern templates only — no AI calls. */

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
  { q: 'Are these channel names actually available on YouTube?',
    a: "This generator creates name ideas from pattern templates — it does not check real-time YouTube handle or display name availability. Once you find a name you like, copy it and check directly inside YouTube Studio (Settings → Channel → Basic info) where YouTube validates handles in real time. Note that the handle (@yourname) is what determines uniqueness, not the channel display name. Two channels can share the same display name, but every handle is globally unique." },
  { q: 'How do I pick the right name from this list?',
    a: "Three rules. One: easy to spell and easy to say out loud, because viewers will recommend you verbally and type your name into search. Two: related to your niche so the algorithm and viewers can categorize you instantly. Three: not too narrow. \"BeginnerYogaForRunners\" boxes you in if you ever pivot. \"FlowAcademy\" gives you room to expand. Pick a name you can grow into at 100K subscribers, not just one that fits where you are at zero." },
  { q: "What is the difference between channel name and handle?",
    a: 'Your display name is what viewers see (e.g., "MrBeast"). It can be changed twice every 14 days, can include spaces, and does not have to be unique. Your handle is your @username (e.g., @MrBeast) — it must be globally unique, no spaces, 3-30 characters, and is used in your URL (youtube.com/@yourhandle). Pick a strong display name first, then claim a matching or close handle while it is still available.' },
  { q: 'Can I change my YouTube channel name later?',
    a: "Yes. YouTube lets you change both your display name and handle, though there are rate limits (typically 2 changes per 14 days). What you cannot easily do is rebuild brand recognition once you have grown an audience under one name. Pick something you would still be happy to keep at 100K subscribers, not just at zero. Frequent name changes also confuse the algorithm and dilute your channel's topical signal." },
  { q: "Do channel names matter for SEO?",
    a: "Channel names are a relatively weak ranking signal compared to titles, descriptions, and retention. But a niche-aligned name does help — when YouTube's algorithm sees a viewer search for \"running tips\" and your channel is called \"Run Lab\", that's one more relevance hint. Don't keyword-stuff (\"Best Running Tips Channel For Beginners 2026\"). Just pick a name that hints at what you do, and let your titles and thumbnails do the heavy lifting on SEO." },
  { q: 'Why are the same patterns repeated across niches?',
    a: "Because formats like \"X HQ\", \"X Lab\", \"Mr X\", and \"Project X\" work in any niche — they're proven patterns, not niche-specific inventions. Generating thousands of unique names per niche would just give you noise. The pattern templates are the signal: pick a tone, plug in your niche, and you have a name that follows a structure successful channels already use." },
  { q: "Should my channel name be my real name?",
    a: "Depends on your strategy. Real names work best if your channel is built around personal expertise, vlogs, lifestyle content, or anything where viewers are subscribing to YOU as much as the topic. Brand names (FlowAcademy, Run Lab) work better for faceless channels, multi-creator channels, or anything you might sell or hand off later. Hybrid approach: real name in the channel description, brand name on the channel itself." },
  { q: "How long should a YouTube channel name be?",
    a: "Display names should fit comfortably under 30 characters, ideally 8-20. Anything longer gets truncated in the sidebar, in search results, and on mobile. Handles must be 3-30 characters with no spaces. Shorter is more memorable and easier to type. The most successful channels on YouTube have names averaging 10-15 characters: MrBeast (7), Veritasium (10), Ali Abdaal (10), Mark Rober (10)." },
  { q: 'What makes a channel name "memorable"?',
    a: "Three traits show up in nearly every memorable YouTube name: (1) it is short, usually under 12 characters; (2) it has a rhythm or sound pattern that makes it easy to say (alliteration, rhyme, or punchy syllables); (3) it ties to a specific identity or topic that gives the brain a category to file it under. \"Veritasium\" works because it sounds scientific. \"MrBeast\" works because it sounds bold and personal. Patterns matter more than originality." },
  { q: "Can I use trademarked words in my channel name?",
    a: "Avoid. YouTube takes down channels that include trademarked brand names without permission (Apple, Nike, Disney, etc.). Even if you get away with it for a while, your channel can be terminated retroactively and you lose all your subscribers. Pattern names like \"Apple Tips\" or \"NikeRunner\" are common takedown targets. Build your brand around a name you own. The free generator above avoids brand-trademark patterns entirely for this reason." },
  { q: "Should I include 'TV', 'Channel', or 'YouTube' in my name?",
    a: "Generally no, on all three. \"X TV\" feels dated (it's a relic of when YouTube channels were trying to mimic broadcast TV). \"X Channel\" is redundant — viewers already know it's a channel. Including \"YouTube\" in your name is a guidelines violation and can trigger removal. The strongest names skip these entirely and just lean on the topic word plus a pattern (X Lab, Project X, Daily X)." },
  { q: 'What is a good naming pattern for a faceless channel?',
    a: "Brand-style names work best for faceless content because they remove the personality dependency. Patterns like \"X Files\", \"X Academy\", \"Project X\", \"X Decoded\", or \"The X Report\" set the expectation that the channel is about the topic, not the creator. Avoid personal patterns (\"Mr X\", \"X With Me\") because they create a creator-identity gap viewers will notice. Pure brand names also make the channel easier to sell, license, or hand off to another team later." },
  { q: 'How do I check if a name is already taken on YouTube?',
    a: 'Two checks. (1) Display name: search for it on YouTube. If a popular channel already uses it, your channel will be hard to discover. (2) Handle: try to claim @yourname inside YouTube Studio → Settings → Channel → Handle. YouTube tells you in real time if the handle is available. If the handle is taken but the display name is free, consider a slight variation (@RunLabHQ, @TheRunLab) so your URL is still memorable.' },
  { q: 'Should my name reflect my niche or my personality?',
    a: 'Both, ideally — but if you have to pick, niche wins for early-stage growth. The algorithm and new viewers need topical clues to know whether to recommend you. Personality-driven names work great once you have an audience, but they cost you discoverability when you are unknown. The best compromise: pick a name that hints at the niche but does not fully limit it (e.g., "FlowAcademy" hints at fitness/wellness without locking you into yoga forever).' },
  { q: 'Is this generator free? Will you collect my data?',
    a: "Yes, free forever. And no data collection. The generator runs entirely in your browser — no inputs sent to our servers, no email required, no signup gate, no analytics tied to the names you type. We built it as a genuine free tool because every new creator deserves a starting list of solid names without paying for one. If you want a full growth plan once you've launched, you can connect your channel for a free AI audit on the main app, but it is entirely optional." },
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
    if (document.getElementById('cng-styles')) return
    const link = document.createElement('link')
    link.id = 'cng-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'cng-styles'
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
      @keyframes cngFadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
      @keyframes cngPop { 0% { transform: scale(0.97); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }

      .cng-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
        padding: 14px 28px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px; white-space: nowrap;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .cng-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,48,42,0.42); }
      .cng-btn-lg { font-size: 16px; padding: 17px 36px; }

      .cng-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        background: #fff; border: 1px solid rgba(10,10,15,0.09);
        border-radius: 100px; padding: 5px 12px 5px 10px; margin-bottom: 20px;
        box-shadow: 0 1px 2px rgba(10,10,15,0.04);
      }
      .cng-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ytg-accent); box-shadow: 0 0 0 3px rgba(229,48,42,0.12); }
      .cng-eyebrow-text { font-size: 11px; font-weight: 700; color: var(--ytg-text-2); text-transform: uppercase; letter-spacing: 0.09em; }

      .cng-input {
        width: 100%; padding: 14px 16px;
        font-size: 15px; font-weight: 500; font-family: inherit;
        color: var(--ytg-text);
        background: #fafafb; border: 1px solid var(--ytg-border);
        border-radius: 10px; outline: none;
        transition: border-color 0.15s, background 0.15s;
        -webkit-appearance: none;
      }
      .cng-input:focus { border-color: rgba(10,10,15,0.28); background: #fff; }

      /* Tool layout — mirrors ymc-calc-grid */
      .cng-tool-grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: 24px; align-items: start; }
      @media (max-width: 900px) { .cng-tool-grid { grid-template-columns: 1fr; } }

      .cng-tone-row { display: flex; gap: 8px; flex-wrap: wrap; }
      .cng-tone {
        background: #fff; border: 1.5px solid var(--ytg-border); color: var(--ytg-text-2);
        font-size: 13px; font-weight: 600; letter-spacing: -0.1px;
        padding: 8px 14px; border-radius: 100px;
        cursor: pointer; transition: border-color 0.15s, color 0.15s, background 0.15s;
      }
      .cng-tone:hover { border-color: var(--ytg-text-3); color: var(--ytg-text); }
      .cng-tone.active { background: var(--ytg-accent); color: #fff; border-color: var(--ytg-accent); box-shadow: 0 1px 3px rgba(0,0,0,0.10), 0 4px 12px rgba(229,48,42,0.28); }

      .cng-results-scroll { max-height: 720px; overflow-y: auto; padding-right: 6px; }
      .cng-results-scroll::-webkit-scrollbar { width: 8px }
      .cng-results-scroll::-webkit-scrollbar-thumb { background-color: rgba(10,10,15,0.18); border-radius: 8px; border: 2px solid transparent; background-clip: content-box; }

      .cng-section { padding: 18px 0 22px; border-bottom: 1px solid var(--ytg-border); }
      .cng-section:last-child { border-bottom: 0; padding-bottom: 6px; }
      .cng-section:first-child { padding-top: 4px; }
      .cng-section-head {
        display: flex; align-items: center; gap: 14px;
        padding: 0 0 14px 14px; position: relative;
      }
      .cng-section-head::before {
        content: ''; position: absolute; left: 0; top: 2px; bottom: 14px;
        width: 3px; border-radius: 3px; background: var(--ytg-accent);
      }
      .cng-section-label {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 17px; font-weight: 800; letter-spacing: -0.3px; color: var(--ytg-text);
      }
      .cng-section-count { font-size: 12px; font-weight: 700; color: var(--ytg-text-3); letter-spacing: 0.04em; }
      .cng-section-blurb { font-size: 13px; color: var(--ytg-text-3); margin-left: auto; line-height: 1.5; text-align: right; max-width: 360px; }
      @media (max-width: 720px) {
        .cng-section-head { flex-wrap: wrap; }
        .cng-section-blurb { margin-left: 0; text-align: left; max-width: 100%; flex-basis: 100%; padding-top: 4px; }
      }

      .cng-section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 18px; }
      @media (max-width: 720px) { .cng-section-grid { grid-template-columns: 1fr; } }

      .cng-result-row {
        display: flex; align-items: center; justify-content: space-between; gap: 12px;
        padding: 11px 12px 11px 14px;
        background: transparent; border-radius: 8px;
        animation: cngPop 0.2s ease both;
        transition: background 0.15s;
      }
      .cng-result-row:hover { background: var(--ytg-bg-2); }
      .cng-result-row:hover .cng-copy-btn { opacity: 1; }
      .cng-result-name {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 16px; font-weight: 700; color: var(--ytg-text);
        letter-spacing: -0.2px; line-height: 1.3;
        word-break: break-word;
      }
      .cng-tone-pill {
        font-size: 9.5px; font-weight: 800; letter-spacing: 0.06em;
        text-transform: uppercase; padding: 2px 7px; border-radius: 5px;
        margin-right: 8px;
      }
      .cng-tone-pill.pro      { background: rgba(74,124,247,0.10); color: #1e40af; }
      .cng-tone-pill.punchy   { background: rgba(229,48,42,0.10);  color: var(--ytg-accent-text); }
      .cng-tone-pill.personal { background: rgba(74,222,128,0.12); color: #166534; }
      .cng-tone-pill.creative { background: rgba(245,158,11,0.12); color: #92400e; }
      .cng-result-meta { font-size: 11px; color: var(--ytg-text-3); display: flex; align-items: center; }

      .cng-copy-btn {
        background: transparent; border: 0; cursor: pointer; flex-shrink: 0;
        font-size: 11px; font-weight: 700; color: var(--ytg-text-3);
        padding: 6px 10px; border-radius: 8px;
        opacity: 0.5;
        transition: opacity 0.15s, color 0.15s, background 0.15s;
        display: inline-flex; align-items: center; gap: 5px;
      }
      .cng-copy-btn:hover { color: var(--ytg-accent); background: var(--ytg-accent-light); opacity: 1; }
      .cng-copy-btn.copied { color: #166534; background: rgba(74,222,128,0.12); opacity: 1; }

      .cng-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
      @media (max-width: 900px) { .cng-grid-3 { grid-template-columns: 1fr; } }

      .cng-faq-answer {
        display: grid; grid-template-rows: 0fr; opacity: 0;
        transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
      }
      .cng-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .cng-faq-answer-inner { overflow: hidden; }

      @media (max-width: 768px) {
        .cng-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .cng-cta-pad { padding: 70px 24px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children }) {
  return (
    <div className="cng-eyebrow">
      <span aria-hidden="true" className="cng-eyebrow-dot" />
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
      {copied ? (
        <><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6.5l3 3 5-6"/></svg>Copied</>
      ) : (
        <><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="3.5" width="6" height="6" rx="1.2"/><path d="M2.5 8V2.5h5.5"/></svg>Copy</>
      )}
    </button>
  )
}

export default function YoutubeChannelNameGenerator() {
  useGlobalStyles()
  const { isMobile, isTablet } = useBreakpoint()
  const [keyword, setKeyword] = useState('')
  const [second,  setSecond]  = useState('')
  const [tones,   setTones]   = useState(['all'])
  const [openFaq, setOpenFaq] = useState(0)

  useEffect(() => {
    document.title = 'Free YouTube Channel Name Generator (60+ ideas, any niche) — YTGrowth'
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = 'Free YouTube channel name generator. 60+ name ideas across professional, punchy, personal, and creative tones. 100% browser-based, no signup, no AI hallucinations.'
  }, [])

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

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', overflowX: 'hidden' }}>

      <SiteHeader />

      {/* ══ HERO ══ */}
      <section className="cng-section-pad" style={{ position: 'relative', padding: isMobile ? '64px 24px 56px' : '110px 48px 84px', textAlign: 'center', background: '#ffffff', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120vw', maxWidth: 1400, height: 620, background: 'radial-gradient(ellipse at center top, rgba(229,48,42,0.07) 0%, rgba(229,48,42,0.02) 40%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'cngFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 34 : isTablet ? 56 : 64, lineHeight: isMobile ? 1.1 : 1.04, letterSpacing: isMobile ? '-0.6px' : '-2.2px', color: 'var(--ytg-text)', marginBottom: 22, textWrap: 'balance' }}>
            What should your <span style={{ color: 'var(--ytg-accent)' }}>YouTube channel be called?</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 660, margin: '0 auto 28px', textWrap: 'pretty' }}>
            Sixty+ name ideas built from proven YouTube name patterns. Type your niche, pick a vibe, and pick a name you can grow into.
          </p>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', fontWeight: 500 }}>
            No signup. No email. Free forever.
          </p>
        </div>
      </section>

      {/* ══ TOOL ══ */}
      <section id="generator" className="cng-section-pad" style={{ padding: isMobile ? '48px 20px 80px' : '72px 48px 110px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="cng-tool-grid">

            {/* LEFT — input card */}
            <div style={{ background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-lg)', padding: isMobile ? 26 : 36 }}>
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Your niche</label>
                <input type="text" className="cng-input" placeholder="e.g. fitness, finance, cooking" value={keyword} onChange={(e) => setKeyword(e.target.value)} autoFocus />
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Optional second word</label>
                <input type="text" className="cng-input" placeholder="e.g. beginners, daily, weekly" value={second} onChange={(e) => setSecond(e.target.value)} />
                <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', marginTop: 6, lineHeight: 1.5 }}>
                  Adds combo patterns like "Fitness for Beginners" and "Fitness x Beginners".
                </p>
              </div>

              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Vibe</label>
                <div className="cng-tone-row">
                  {['all', 'pro', 'punchy', 'personal', 'creative'].map(t => (
                    <button key={t} onClick={() => toggleTone(t)} className={`cng-tone${tones.includes(t) ? ' active' : ''}`}>{TONE_LABELS[t]}</button>
                  ))}
                </div>
              </div>

              {!showResults && (
                <p style={{ fontSize: 12, color: 'var(--ytg-text-3)', marginTop: 22, lineHeight: 1.6 }}>
                  Try one of these:&nbsp;
                  {EXAMPLES.map((ex, i) => (
                    <button key={i} onClick={() => setKeyword(ex)} style={{ background: 'transparent', border: 0, padding: '2px 6px', cursor: 'pointer', color: 'var(--ytg-accent)', fontSize: 12, fontWeight: 600 }}>{ex}{i < EXAMPLES.length - 1 ? ',' : ''}</button>
                  ))}
                </p>
              )}
            </div>

            {/* RIGHT — top pick OR empty state */}
            {showResults && featured ? (
              <div style={{ background: 'var(--ytg-accent)', borderRadius: 22, color: '#fff', padding: isMobile ? 28 : 36, boxShadow: '0 4px 18px rgba(229,48,42,0.32), 0 24px 60px rgba(229,48,42,0.18)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.78, marginBottom: 14 }}>
                  Top pick for {keyword}{second ? ` × ${second}` : ''}
                </div>
                <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 36 : 46, fontWeight: 800, letterSpacing: '-1.6px', lineHeight: 1.05, marginBottom: 14, wordBreak: 'break-word' }}>
                  {featured.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.16)' }}>{featured.tone}</span>
                  <span style={{ fontSize: 13, opacity: 0.78 }}>{featured.length} characters</span>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '0 0 22px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.74, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Total ideas</div>
                    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: '-0.8px' }}>{names.length}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.74, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Vibes</div>
                    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: '-0.8px' }}>{toneCount}</div>
                  </div>
                  <button onClick={() => navigator.clipboard?.writeText(featured.name)} style={{ background: '#fff', color: 'var(--ytg-accent)', border: 0, fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, padding: '11px 22px', borderRadius: 100, cursor: 'pointer', letterSpacing: '-0.1px' }}>
                    Copy this name
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: 'var(--ytg-card)', borderRadius: 22, border: '2px dashed var(--ytg-border)', padding: isMobile ? 36 : 56, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: 16, background: 'var(--ytg-accent-light)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e5302a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 10v6M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M1 12h6m10 0h6M4.22 19.78l4.24-4.24m7.08-7.08l4.24-4.24"/></svg>
                </div>
                <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--ytg-text)', marginBottom: 8, fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: '-0.3px' }}>
                  Type a niche to get started
                </p>
                <p style={{ fontSize: 13.5, color: 'var(--ytg-text-3)', maxWidth: 320, margin: '0 auto', lineHeight: 1.6 }}>
                  Sixty+ name ideas appear here the moment you type a single word.
                </p>
              </div>
            )}
          </div>

          {/* BOTTOM — full-width more options, grouped by vibe */}
          {showResults && featured && rest.length > 0 && (() => {
            const TONE_ORDER = ['pro', 'punchy', 'personal', 'creative']
            const grouped = TONE_ORDER
              .map(id => ({ id, label: TONE_LABELS[id], blurb: TONE_DESCRIPTIONS[id], items: rest.filter(r => r.tone === id) }))
              .filter(g => g.items.length > 0)
            return (
              <div style={{ background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: isMobile ? 22 : 32 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8, paddingBottom: 16, borderBottom: '1px solid var(--ytg-border)' }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>More names</p>
                    <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 18 : 22, fontWeight: 800, letterSpacing: '-0.6px', color: 'var(--ytg-text)' }}>
                      {rest.length} more, grouped by vibe
                    </h3>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', maxWidth: isMobile ? '100%' : 340, lineHeight: 1.55 }}>
                    Pick a vibe that matches the channel you want to run a year from now, not the one you have today.
                  </p>
                </div>
                <div className="cng-results-scroll">
                  {grouped.map(group => (
                    <div key={group.id} className="cng-section">
                      <div className="cng-section-head">
                        <span className="cng-section-label">{group.label}</span>
                        <span className="cng-section-count">{group.items.length} {group.items.length === 1 ? 'name' : 'names'}</span>
                        <span className="cng-section-blurb">{group.blurb}</span>
                      </div>
                      <div className="cng-section-grid">
                        {group.items.map((n, i) => (
                          <div key={i} className="cng-result-row">
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div className="cng-result-name">{n.name}</div>
                              <div style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', marginTop: 2 }}>{n.length} characters</div>
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
      <section className="cng-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, maxWidth: 720 }}>
            <Eyebrow>How naming works</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, textWrap: 'balance' }}>
              What makes a YouTube name <span style={{ color: 'var(--ytg-accent)' }}>actually stick.</span>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {[
              { h: 'Easy to say beats clever every time',
                p: 'A channel name spreads when viewers can recommend it out loud. If your name has silent letters, unusual spellings, or inside jokes only your friends get, you just put a tax on every word-of-mouth referral. The biggest channels on the platform — MrBeast, Veritasium, Mark Rober, Ali Abdaal — all pass a simple test: read it aloud and your friend can spell it back without asking how.' },
              { h: 'Niche signal beats personality signal early',
                p: 'When you have zero subscribers, viewers and the algorithm both need a topical clue to know whether to engage with you. A name that hints at your niche ("Run Lab", "FlowAcademy", "TechDecoded") gives you that clue. A pure personal-brand name ("Sarah & Ben", "JustMike") wins later, once you have an audience that already knows what you do — but it costs you discoverability when you are unknown.' },
              { h: 'Specificity is a trap. Categories are an asset.',
                p: 'A name like "BeginnerYogaForRunners" sounds focused but boxes you in. The day you want to cover meditation, mobility, or running form, your name fights you. Smart names pick a category you can grow inside — fitness, finance, photography — without locking you to one sub-topic. Pattern templates like "X Lab" and "Project X" deliberately keep that flexibility.' },
              { h: 'The handle decision matters more than the display name',
                p: 'Display names can be edited. Handles get sticky. Once people are sharing youtube.com/@yourname, sponsors are tagging it, and your own analytics are linked to it, changing the handle costs you traffic and brand recognition. Pick a handle you would still want at 100K subscribers, and pair it with a display name that can flex over time as your channel evolves.' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', gap: isMobile ? 12 : 56, paddingTop: i === 0 ? 0 : 28, borderTop: i === 0 ? 'none' : '1px solid var(--ytg-border)' }}>
                <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 20 : 22, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.5px', lineHeight: 1.25 }}>{row.h}</h3>
                <p style={{ fontSize: 15.5, color: 'var(--ytg-text-2)', lineHeight: 1.75 }}>{row.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GROW WITH FEATURES — 3-card grid ══ */}
      <section className="cng-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ marginBottom: 44, textAlign: 'center', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            <Eyebrow>After you launch</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
              You picked a name. <span style={{ color: 'var(--ytg-accent)' }}>Now grow into it.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>
              Three free tools and features that take you from name to first subscribers.
            </p>
          </div>
          <div className="cng-grid-3">
            {[
              { label: 'Video Ideas Generator', title: 'Find what to film first', body: 'Ninety+ proven YouTube format templates plug into your niche to surface a list of ideas with real CTR potential. Same browser-based, free, no signup model as this tool.', href: '/tools/youtube-video-ideas-generator' },
              { label: 'SEO Studio',             title: 'Score titles before you publish', body: 'Every title gets a 0–100 score against the live niche, plus 3 AI rewrites built around the top-ranking videos in your category. Stops you publishing weak titles.',                  href: '/features/seo-studio' },
              { label: 'Thumbnail IQ',           title: 'Win the click war from day one',  body: 'Score every thumbnail against the top performers in your niche on contrast, face presence, and curiosity-gap signals — before the upload, not after the CTR data comes in.',                href: '/features/thumbnail-iq' },
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
      <section className="cng-section-pad cng-cta-pad" style={{ padding: isMobile ? '88px 24px' : '120px 48px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', width: 1000, height: isMobile ? 600 : 800, background: 'radial-gradient(ellipse, rgba(229,48,42,0.20) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '5px 12px 5px 10px', marginBottom: 22 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 0 3px rgba(229,48,42,0.18)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Free AI audit</span>
          </div>
          <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: '#ffffff', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
            Stop naming. <span style={{ color: '#ff3b30' }}>Start growing.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, marginBottom: 32, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Once your channel exists, connect it to YTGrowth for a free AI audit. Get a real, prioritised growth plan instead of just another name.
          </p>
          <a href="/auth/login" className="cng-btn cng-btn-lg">Get my free audit →</a>
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
              Everything new creators ask before locking in a channel name. Still unsure? <a href="/contact" style={{ color: 'var(--ytg-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
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
                  <div className={`cng-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="cng-faq-answer-inner">
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
