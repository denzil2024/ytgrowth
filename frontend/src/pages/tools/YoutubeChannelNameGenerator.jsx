import { useEffect, useState, useMemo, useCallback } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'

/* ─── Free SEO tool: YouTube Channel Name Generator ────────────────────────
   /tools/youtube-channel-name-generator. Targets ~30K monthly searches.

   100% client-side. We ship a curated set of pattern templates and
   combine them with the user's niche keyword(s). No AI, no API calls.

   Patterns are grouped by tone (Pro / Punchy / Personal / Creative) so
   the user can filter to the vibe they want. Each generated name has a
   one-click copy button. */

/* Each pattern is a function that takes 1-2 keyword strings and returns
   a name. Capitalize / lowercase / compound spacing all handled here. */
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''
const upper = (s) => (s || '').toUpperCase()

const PATTERNS = {
  pro: [
    (k) => `${cap(k)} HQ`,
    (k) => `${cap(k)} Lab`,
    (k) => `${cap(k)} Hub`,
    (k) => `${cap(k)} Pro`,
    (k) => `${cap(k)} Studio`,
    (k) => `${cap(k)} Insider`,
    (k) => `${cap(k)} Decoded`,
    (k) => `${cap(k)} Wise`,
    (k) => `${cap(k)} Mastery`,
    (k) => `${cap(k)} School`,
    (k) => `${cap(k)} Academy`,
    (k) => `Mastering ${cap(k)}`,
    (k) => `Inside ${cap(k)}`,
    (k) => `Beyond ${cap(k)}`,
    (k) => `${cap(k)} Briefing`,
    (k) => `The ${cap(k)} Report`,
  ],
  punchy: [
    (k) => `${cap(k)} Daily`,
    (k) => `${cap(k)} Nation`,
    (k) => `${cap(k)} Crew`,
    (k) => `${cap(k)} Squad`,
    (k) => `${cap(k)} Tribe`,
    (k) => `${cap(k)} Junkie`,
    (k) => `${cap(k)} Addict`,
    (k) => `${cap(k)} Fix`,
    (k) => `${cap(k)} Rush`,
    (k) => `${cap(k)} Vibes`,
    (k) => `${cap(k)} Gang`,
    (k) => `Hacking ${cap(k)}`,
    (k) => `Crushing ${cap(k)}`,
    (k) => `${cap(k)} 24/7`,
    (k) => `${cap(k)} Unfiltered`,
    (k) => `${cap(k)} Unplugged`,
  ],
  personal: [
    (k) => `Mr ${cap(k)}`,
    (k) => `The ${cap(k)} Guy`,
    (k) => `Coach ${cap(k)}`,
    (k) => `${cap(k)} With Me`,
    (k) => `My ${cap(k)} Story`,
    (k) => `Just ${cap(k)}`,
    (k) => `Honestly ${cap(k)}`,
    (k) => `${cap(k)} & Me`,
    (k) => `Living ${cap(k)}`,
    (k) => `${cap(k)} Diary`,
    (k) => `${cap(k)} Notes`,
    (k) => `${cap(k)} Journal`,
    (k) => `${cap(k)} Made Simple`,
    (k) => `${cap(k)} Made Easy`,
    (k) => `Simply ${cap(k)}`,
    (k) => `Talking ${cap(k)}`,
  ],
  creative: [
    (k) => `${cap(k)} & Co`,
    (k) => `${cap(k)} Files`,
    (k) => `${cap(k)} Code`,
    (k) => `${cap(k)} Engine`,
    (k) => `${cap(k)} Forge`,
    (k) => `${cap(k)} Lens`,
    (k) => `${cap(k)} Atlas`,
    (k) => `${cap(k)} Chronicles`,
    (k) => `${cap(k)} Field Guide`,
    (k) => `${cap(k)} Blueprint`,
    (k) => `Project ${cap(k)}`,
    (k) => `The ${cap(k)} Show`,
    (k) => `The ${cap(k)} Edit`,
    (k) => `${cap(k)} Untold`,
    (k) => `${cap(k)} Effect`,
    (k) => `${cap(k)} Theory`,
  ],
  /* Two-keyword patterns — only used when the user enters a second word */
  combo: [
    (a, b) => `${cap(a)} & ${cap(b)}`,
    (a, b) => `${cap(a)} for ${cap(b)}`,
    (a, b) => `${cap(a)} Meets ${cap(b)}`,
    (a, b) => `${cap(a)} x ${cap(b)}`,
    (a, b) => `${cap(b)} ${cap(a)}`,
    (a, b) => `${cap(a)} ${cap(b)} Lab`,
    (a, b) => `${cap(a)} ${cap(b)} HQ`,
    (a, b) => `The ${cap(a)} ${cap(b)} Show`,
  ],
}

const TONE_LABELS = {
  all: 'All vibes',
  pro: 'Professional',
  punchy: 'Punchy',
  personal: 'Personal',
  creative: 'Creative',
}

function generateNames(keyword, second, tones) {
  const k = (keyword || '').trim()
  if (!k) return []
  const k2 = (second || '').trim()

  const seen = new Set()
  const out = []

  const push = (name, tone) => {
    const trimmed = name.replace(/\s+/g, ' ').trim()
    if (!trimmed) return
    const key = trimmed.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    out.push({ name: trimmed, tone, length: trimmed.length })
  }

  const includeTone = (t) => tones.includes('all') || tones.includes(t)

  for (const tone of ['pro', 'punchy', 'personal', 'creative']) {
    if (!includeTone(tone)) continue
    for (const fn of PATTERNS[tone]) {
      try { push(fn(k), tone) } catch (_) { /* swallow */ }
    }
  }
  if (k2 && includeTone('creative')) {
    for (const fn of PATTERNS.combo) {
      try { push(fn(k, k2), 'creative') } catch (_) { /* swallow */ }
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
        --ytg-shadow-xl:    0 8px 28px rgba(0,0,0,0.13), 0 40px 100px rgba(0,0,0,0.17);
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 12px; height: 12px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background-color: rgba(10,10,15,0.28); border-radius: 10px; border: 3px solid transparent; background-clip: content-box; }
      @keyframes cngFadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
      @keyframes cngPop { 0% { transform: scale(0.96); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }

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
      .cng-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; filter: none !important; }
      .cng-btn-lg { font-size: 16px; padding: 17px 36px; }

      .cng-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        background: #fff; border: 1px solid rgba(10,10,15,0.09);
        border-radius: 100px; padding: 5px 12px 5px 10px; margin-bottom: 22px;
        box-shadow: 0 1px 2px rgba(10,10,15,0.04);
      }
      .cng-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ytg-accent); box-shadow: 0 0 0 3px rgba(229,48,42,0.12); }
      .cng-eyebrow-text { font-size: 11px; font-weight: 700; color: var(--ytg-text-2); text-transform: uppercase; letter-spacing: 0.09em; }

      .cng-h1 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -2px; line-height: 1.05; text-wrap: balance; }
      .cng-h2 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -1.4px; line-height: 1.08; text-wrap: balance; }

      .cng-input {
        width: 100%; padding: 14px 16px;
        font-size: 16px; font-weight: 500; font-family: inherit;
        color: var(--ytg-text);
        background: var(--ytg-card); border: 1.5px solid var(--ytg-border);
        border-radius: 12px; outline: none;
        transition: border-color 0.15s;
      }
      .cng-input:focus { border-color: var(--ytg-accent); box-shadow: 0 0 0 3px rgba(229,48,42,0.10); }

      .cng-tone-row { display: flex; gap: 8px; flex-wrap: wrap; }
      .cng-tone {
        background: var(--ytg-card);
        border: 1.5px solid var(--ytg-border);
        color: var(--ytg-text-2);
        font-size: 13px; font-weight: 600; letter-spacing: -0.1px;
        padding: 8px 16px; border-radius: 100px;
        cursor: pointer; transition: border-color 0.15s, color 0.15s, background 0.15s;
      }
      .cng-tone:hover { border-color: var(--ytg-text-3); color: var(--ytg-text); }
      .cng-tone.active {
        background: var(--ytg-accent); color: #fff; border-color: var(--ytg-accent);
        box-shadow: 0 1px 3px rgba(0,0,0,0.10), 0 4px 12px rgba(229,48,42,0.28);
      }

      /* Result grid */
      .cng-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
      @media (max-width: 900px) { .cng-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 560px) { .cng-grid { grid-template-columns: 1fr; } }

      .cng-card {
        background: var(--ytg-card);
        border: 1px solid var(--ytg-border);
        border-radius: 14px;
        padding: 18px 18px 14px;
        display: flex; flex-direction: column; gap: 8px;
        animation: cngPop 0.25s ease both;
        transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
      }
      .cng-card:hover { border-color: var(--ytg-text-3); transform: translateY(-1px); box-shadow: var(--ytg-shadow-sm); }
      .cng-card-name {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 18px; font-weight: 800; color: var(--ytg-text);
        letter-spacing: -0.3px; line-height: 1.25;
        word-break: break-word;
      }
      .cng-card-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 8px; border-top: 1px solid var(--ytg-border); }
      .cng-card-meta { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--ytg-text-3); }
      .cng-tone-pill {
        font-size: 9.5px; font-weight: 800; letter-spacing: 0.06em;
        text-transform: uppercase; padding: 2px 8px; border-radius: 6px;
      }
      .cng-tone-pill.pro      { background: rgba(74,124,247,0.10); color: #1e40af; }
      .cng-tone-pill.punchy   { background: rgba(229,48,42,0.10);  color: var(--ytg-accent-text); }
      .cng-tone-pill.personal { background: rgba(74,222,128,0.12); color: #166534; }
      .cng-tone-pill.creative { background: rgba(245,158,11,0.12); color: #92400e; }

      .cng-copy-btn {
        background: transparent; border: 0; cursor: pointer;
        font-size: 11px; font-weight: 700; color: var(--ytg-text-3);
        padding: 6px 10px; border-radius: 8px;
        transition: color 0.15s, background 0.15s;
        display: inline-flex; align-items: center; gap: 5px;
      }
      .cng-copy-btn:hover { color: var(--ytg-accent); background: var(--ytg-accent-light); }
      .cng-copy-btn.copied { color: #166534; background: rgba(74,222,128,0.12); }

      .cng-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
      .cng-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 18px; }
      @media (max-width: 900px) { .cng-grid-3 { grid-template-columns: 1fr; } .cng-grid-4 { grid-template-columns: 1fr 1fr; } }
      @media (max-width: 600px) { .cng-grid-4 { grid-template-columns: 1fr; } }

      .cng-faq-answer {
        display: grid; grid-template-rows: 0fr; opacity: 0;
        transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
      }
      .cng-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .cng-faq-answer-inner { overflow: hidden; }

      @media (max-width: 768px) {
        .cng-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

/* Examples to seed the input on first visit so the page never feels empty */
const EXAMPLES = ['fitness', 'finance', 'cooking', 'tech reviews', 'productivity', 'travel', 'gaming']

const FAQS = [
  {
    q: 'Are these names actually available on YouTube?',
    a: <>This generator creates name ideas from pattern templates — it does not check real-time YouTube handle or channel name availability. Once you find a name you like, copy it and check directly inside YouTube Studio (Settings → Channel → Basic info) where YouTube validates handles in real time. The handle (@yourname) is what determines uniqueness, not the channel display name itself.</>,
  },
  {
    q: 'How do I pick the right name for my channel?',
    a: <>Three rules. <b>One:</b> easy to spell and easy to say out loud, because viewers will recommend you verbally. <b>Two:</b> related to your niche so the algorithm and viewers can categorize you instantly. <b>Three:</b> not too narrow. "BeginnerYogaForRunners" boxes you in if you ever pivot. "FlowAcademy" gives you room to expand. Pick a name you can grow into, not a name that limits you.</>,
  },
  {
    q: 'What\'s the difference between channel name and handle?',
    a: <>Your <b>display name</b> is what viewers see (e.g., "MrBeast"). It can be changed later, can include spaces, and doesn't have to be unique. Your <b>handle</b> is your @username (e.g., @MrBeast) — must be globally unique, no spaces, 3-30 characters, used in your URL. Pick a strong display name first, then claim a matching handle while it's still available.</>,
  },
  {
    q: 'Can I change my channel name later?',
    a: <>Yes. YouTube lets you change both your display name and handle, though there are rate limits (usually 2 changes per 14 days). What you can't easily do is rebuild brand recognition once you've grown an audience under one name. Pick something you'd be happy to keep at 100K subscribers, not just at zero.</>,
  },
  {
    q: 'Do channel names matter for SEO?',
    a: <>Channel names are a relatively weak ranking signal compared to titles, descriptions, and retention. But a niche-aligned name does help — when YouTube's algorithm sees a viewer search for "running tips" and your channel is called "Run Lab", that's one more relevance hint. Don't keyword-stuff ("Best Running Tips Channel For Beginners 2026"). Just pick a name that hints at what you do.</>,
  },
  {
    q: 'Why are the same patterns repeated across niches?',
    a: <>Because formats like "X HQ", "X Lab", and "Mr X" work in any niche — they're proven patterns, not niche-specific. Generating thousands of unique names per niche would just give you noise. The pattern templates are the signal. Pick the pattern, plug in your niche, ship.</>,
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
      <div className={`cng-faq-answer${open ? ' open' : ''}`}>
        <div className="cng-faq-answer-inner">
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
    } catch (_) { /* fall back silently */ }
  }, [text])
  return (
    <button onClick={onClick} className={`cng-copy-btn${copied ? ' copied' : ''}`} aria-label={`Copy ${text}`}>
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

export default function YoutubeChannelNameGenerator() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()
  const [keyword, setKeyword] = useState('')
  const [second,  setSecond]  = useState('')
  const [tones,   setTones]   = useState(['all'])

  useEffect(() => {
    document.title = 'Free YouTube Channel Name Generator — 60+ ideas in any niche — YTGrowth'
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = 'Free YouTube channel name generator. Type your niche and get 60+ name ideas across professional, punchy, personal, and creative tones. 100% browser-based, no signup.'
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
  const totalCount = names.length

  return (
    <div style={{ background: 'var(--ytg-bg)', minHeight: '100vh' }}>

      <SiteHeader />

      {/* HERO + INPUT */}
      <section className="cng-section-pad" style={{ padding: isMobile ? '56px 24px 32px' : '88px 48px 48px', textAlign: 'center', background: '#ffffff' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', animation: 'cngFadeUp 0.5s ease both' }}>
          <span className="cng-eyebrow">
            <span className="cng-eyebrow-dot" />
            <span className="cng-eyebrow-text">Free · Browser-based · No signup</span>
          </span>
          <h1 className="cng-h1" style={{ fontSize: isMobile ? 36 : 56, color: 'var(--ytg-text)', marginBottom: 18 }}>
            YouTube channel name generator. <span style={{ color: 'var(--ytg-accent)' }}>Sixty+ ideas.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18.5, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 36px' }}>
            Type your niche, pick a vibe, and get a wall of channel name ideas built from proven patterns. Filter by tone, copy your favorite, and check it inside YouTube Studio when you're ready.
          </p>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr', gap: 10 }}>
            <input
              type="text"
              className="cng-input"
              placeholder="Your niche (e.g. fitness, finance, cooking)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              autoFocus
            />
            <input
              type="text"
              className="cng-input"
              placeholder="Optional second word (e.g. beginners)"
              value={second}
              onChange={(e) => setSecond(e.target.value)}
            />
          </div>

          <div className="cng-tone-row" style={{ marginTop: 4 }}>
            {['all', 'pro', 'punchy', 'personal', 'creative'].map(t => (
              <button key={t}
                onClick={() => toggleTone(t)}
                className={`cng-tone${tones.includes(t) ? ' active' : ''}`}
              >{TONE_LABELS[t]}</button>
            ))}
          </div>

          {!showResults && (
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--ytg-text-3)', textAlign: 'left' }}>
              Try one of these:&nbsp;
              {EXAMPLES.map((ex, i) => (
                <button key={i}
                  onClick={() => setKeyword(ex)}
                  style={{ background: 'transparent', border: 0, padding: '2px 6px', cursor: 'pointer', color: 'var(--ytg-accent)', fontSize: 13, fontWeight: 600 }}
                >{ex}{i < EXAMPLES.length - 1 ? ',' : ''}</button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* RESULTS */}
      {showResults && (
        <section className="cng-section-pad" style={{ padding: isMobile ? '8px 24px 56px' : '8px 48px 88px', background: '#ffffff' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
              <p style={{ fontSize: 13, color: 'var(--ytg-text-3)' }}>
                <strong style={{ color: 'var(--ytg-text-2)' }}>{totalCount}</strong> name idea{totalCount === 1 ? '' : 's'} for <strong style={{ color: 'var(--ytg-text)' }}>{keyword}{second ? ` × ${second}` : ''}</strong>
              </p>
            </div>
            {totalCount > 0 ? (
              <div className="cng-grid">
                {names.map((n, i) => (
                  <div key={i} className="cng-card">
                    <div className="cng-card-name">{n.name}</div>
                    <div className="cng-card-row">
                      <div className="cng-card-meta">
                        <span className={`cng-tone-pill ${n.tone}`}>{n.tone}</span>
                        <span>{n.length} chars</span>
                      </div>
                      <CopyButton text={n.name} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--ytg-text-3)', fontSize: 14, padding: '32px 16px' }}>
                No results for those filters. Try toggling on more tones above.
              </p>
            )}
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="cng-section-pad" style={{ padding: isMobile ? '64px 20px' : '96px 48px', background: 'var(--ytg-bg)', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
            <span className="cng-eyebrow">
              <span className="cng-eyebrow-dot" />
              <span className="cng-eyebrow-text">How it works</span>
            </span>
            <h2 className="cng-h2" style={{ fontSize: isMobile ? 30 : 42, marginBottom: 14, color: 'var(--ytg-text)' }}>
              Pattern templates, <span style={{ color: 'var(--ytg-accent)' }}>not random AI.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>
              Most channel name generators feed your keyword to a language model and pray. We don't. We use a curated library of 60+ proven name patterns — the formats real YouTube channels use — and combine them with your niche keyword. Predictable, fast, free.
            </p>
          </div>
          <div className="cng-grid-3">
            {[
              { num: '01', title: 'Type your niche', body: 'A single word like "fitness" or a phrase like "personal finance". The optional second field is for combo names — "Fitness for Beginners" patterns and similar.' },
              { num: '02', title: 'Pick a vibe', body: 'Professional (HQ, Lab, Pro), Punchy (Daily, Nation, 24/7), Personal (Mr X, With Me, My Story), or Creative (Files, Chronicles, Project X). Combine multiple to widen the pool.' },
              { num: '03', title: 'Copy and validate', body: 'Click the copy button on your favorite. Paste into YouTube Studio (Settings → Channel) where YouTube checks handle availability in real time. The display name itself doesn\'t need to be unique.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--ytg-card)', borderRadius: 16, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', padding: 28 }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--ytg-accent)', letterSpacing: '0.06em', fontFamily: 'monospace', marginBottom: 14 }}>{c.num}</p>
                <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.3px', marginBottom: 10 }}>{c.title}</p>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.68 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT MAKES A GOOD NAME — 4-card grid */}
      <section className="cng-section-pad" style={{ padding: isMobile ? '64px 20px' : '96px 48px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
            <span className="cng-eyebrow">
              <span className="cng-eyebrow-dot" />
              <span className="cng-eyebrow-text">What to look for</span>
            </span>
            <h2 className="cng-h2" style={{ fontSize: isMobile ? 30 : 42, marginBottom: 14, color: 'var(--ytg-text)' }}>
              Four checks before <span style={{ color: 'var(--ytg-accent)' }}>you commit.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>
              Generated names are starting points. Use these four rules to filter the list down to the one you'll actually keep at 100K subscribers.
            </p>
          </div>
          <div className="cng-grid-4">
            {[
              { num: '01', title: 'Easy to say out loud', body: 'If a viewer can\'t recommend you verbally, your channel will never spread by word of mouth. Avoid silent letters, unusual spellings, and inside jokes.' },
              { num: '02', title: 'Niche-aligned', body: 'A name that hints at what you do gives the algorithm and viewers an instant category match. "FlowAcademy" tells a yoga story before they\'ve clicked anything.' },
              { num: '03', title: 'Room to grow', body: 'Avoid hyper-narrow names ("YogaForRunners") that box you in if you ever pivot. Pick a name that lets you expand your topic without rebranding.' },
              { num: '04', title: 'Handle available', body: 'Whatever name you pick, claim the matching @handle inside YouTube Studio. The display name doesn\'t need to be unique. The handle does, and YouTube tells you in real time.' },
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
            <span className="cng-eyebrow" style={{ position: 'relative' }}>
              <span className="cng-eyebrow-dot" />
              <span className="cng-eyebrow-text">Next step</span>
            </span>
            <h2 className="cng-h2" style={{ fontSize: isMobile ? 28 : 38, marginBottom: 14, position: 'relative' }}>
              Picked a name? <br />
              <span style={{ color: 'var(--ytg-accent)' }}>Now figure out what to film first.</span>
            </h2>
            <p style={{ fontSize: isMobile ? 14 : 16, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 26px', position: 'relative' }}>
              The Video Ideas Generator gives you 50+ proven YouTube formats matched to your niche. Then SEO Studio scores your title before you publish.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
              <a href="/tools/youtube-video-ideas-generator" className="cng-btn cng-btn-lg">Get video ideas →</a>
              <a href="/features/seo-studio" className="cng-btn cng-btn-lg" style={{ background: 'var(--ytg-card)', color: 'var(--ytg-text)', border: '1px solid var(--ytg-border)', boxShadow: 'none' }}>Try SEO Studio</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="cng-section-pad" style={{ padding: isMobile ? '64px 20px' : '96px 48px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="cng-eyebrow">
              <span className="cng-eyebrow-dot" />
              <span className="cng-eyebrow-text">Frequently asked</span>
            </span>
            <h2 className="cng-h2" style={{ fontSize: isMobile ? 28 : 36, color: 'var(--ytg-text)' }}>
              Naming your channel, sorted.
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
