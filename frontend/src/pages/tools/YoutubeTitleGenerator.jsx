import { useEffect, useState, useMemo } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free SEO tool: YouTube Title Generator + Analyzer ───────────────────
   /tools/youtube-title-generator. Zero YouTube-API cost: generation and
   scoring run entirely client-side. Visual DNA mirrors YoutubeMoneyCalculator
   (Landing.jsx system: DM Sans headlines, Inter body, --ytg-* tokens, eyebrow
   pills, numbered FAQ). Quiet grey view toggle, never red. No design drift. */

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
    if (document.getElementById('ytg-tg-styles')) return

    const style = document.createElement('style')
    style.id = 'ytg-tg-styles'
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
        --ytg-good:         #1a9d5a;
        --ytg-ok:           #c98a00;
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; scrollbar-width: auto; scrollbar-color: rgba(10,10,15,0.28) transparent; }
      ::-webkit-scrollbar { width: 12px; height: 12px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background-color: rgba(10,10,15,0.28); border-radius: 10px; border: 3px solid transparent; background-clip: content-box; }
      ::-webkit-scrollbar-thumb:hover { background-color: rgba(10,10,15,0.48); background-clip: content-box; }
      @keyframes tgFadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .tg-btn {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
        padding: 14px 28px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .tg-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,48,42,0.42); }
      .tg-btn-lg { font-size: 16px; padding: 17px 36px; }
      .tg-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

      .tg-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid rgba(10,10,15,0.09); border-radius: 100px; padding: 5px 12px 5px 10px; margin-bottom: 20px; box-shadow: 0 1px 2px rgba(10,10,15,0.04); }
      .tg-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ytg-accent); box-shadow: 0 0 0 3px rgba(229,48,42,0.12); }
      .tg-eyebrow-text { font-size: 11px; font-weight: 700; color: var(--ytg-text-2); text-transform: uppercase; letter-spacing: 0.09em; }

      .tg-input { width: 100%; padding: 12px 14px; font-size: 14px; font-weight: 500; font-family: inherit; color: var(--ytg-text); background: #fafafb; border: 1px solid var(--ytg-border); border-radius: 10px; outline: none; transition: border-color 0.15s, background 0.15s; -webkit-appearance: none; }
      .tg-input:focus { border-color: rgba(10,10,15,0.28); background: #fff; }
      textarea.tg-input { resize: vertical; min-height: 96px; line-height: 1.5; }

      /* Quiet view toggle. Soft-grey active, never red. */
      .tg-seg { display: inline-flex; background: var(--ytg-bg-3); border: 1px solid var(--ytg-border); border-radius: 12px; padding: 4px; gap: 4px; }
      .tg-seg button { font-family: inherit; font-size: 13.5px; font-weight: 600; letter-spacing: -0.1px; color: var(--ytg-text-2); background: transparent; border: none; padding: 8px 18px; border-radius: 9px; cursor: pointer; transition: background 0.15s, color 0.15s, box-shadow 0.15s; }
      .tg-seg button.active { background: #fff; color: var(--ytg-text); box-shadow: var(--ytg-shadow-sm); }

      .tg-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700; padding: 3px 9px; border-radius: 100px; letter-spacing: 0.01em; }

      .tg-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease; }
      .tg-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .tg-faq-answer-inner { overflow: hidden; }

      .tg-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
      .tg-tool-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: stretch; }

      @media (max-width: 900px) { .tg-grid-3 { grid-template-columns: 1fr; } .tg-tool-grid { grid-template-columns: 1fr; } }
      @media (max-width: 768px) { .tg-section-pad { padding-left: 20px !important; padding-right: 20px !important; } .tg-cta-pad { padding: 70px 24px !important; } }
    `
    document.head.appendChild(style)
  }, [])
}

/* ── Generation data (client-side, zero API) ─────────────────────────────── */
// No "actually" anywhere (house rule). Frames mirror what ranks on YouTube.
const NUMBERS = [3, 5, 7, 9, 10, 11, 13, 15, 21]
const POWER_WORDS = ['Proven', 'Simple', 'Fast', 'Honest', 'Brutal', 'Essential', 'Hidden', 'Powerful', 'Smart', 'Effortless', 'Foolproof', 'Underrated']

const TEMPLATES = [
  (t, n, p) => `How to ${t} (Even If You're a Beginner)`,
  (t, n, p) => `${n} ${cap(t)} Tips That Really Work`,
  (t, n, p) => `The ${p} Guide to ${cap(t)} in 2026`,
  (t, n, p) => `Why Your ${cap(t)} Isn't Working (And How to Fix It)`,
  (t, n, p) => `${n} ${cap(t)} Mistakes That Are Costing You Views`,
  (t, n, p) => `I Tried ${cap(t)} for 30 Days. Here's What Happened`,
  (t, n, p) => `${cap(t)}: Everything You Need to Know`,
  (t, n, p) => `Stop Doing ${cap(t)} Wrong. Do This Instead`,
  (t, n, p) => `The ${p} Way to ${cap(t)} (Step by Step)`,
  (t, n, p) => `${n} ${cap(t)} Secrets Nobody Tells You`,
  (t, n, p) => `How I ${cap(t)} From Scratch`,
  (t, n, p) => `${cap(t)} in 2026: What Changed and What Still Works`,
  (t, n, p) => `The ${p} Truth About ${cap(t)}`,
  (t, n, p) => `${n} ${cap(t)} Hacks I Wish I Knew Sooner`,
]

function cap(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}
function pick(arr, seed) {
  return arr[seed % arr.length]
}

function generateTitles(topic) {
  const t = topic.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!t) return []
  const out = []
  TEMPLATES.forEach((fn, i) => {
    const n = pick(NUMBERS, i * 3 + t.length)
    const p = pick(POWER_WORDS, i * 5 + t.length)
    out.push(fn(t, n, p))
  })
  // De-dupe and cap to a clean dozen.
  return Array.from(new Set(out)).slice(0, 12)
}

/* ── Scoring (shared by generated chips + analyzer) ──────────────────────── */
function scoreTitle(title, keyword = '') {
  const s = title.trim()
  const len = s.length
  const checks = []
  let score = 0

  // Length: 40-60 is the sweet spot before search/suggested truncation.
  let lenPts = 6
  if (len >= 40 && len <= 60) lenPts = 30
  else if (len >= 30 && len < 70) lenPts = 20
  else if (len < 30) lenPts = 10
  score += lenPts
  checks.push({ key: 'length', label: `Length ${len} chars`, pass: len >= 40 && len <= 60, hint: len > 60 ? 'Long titles get cut off in search and suggested. Aim for 40 to 60.' : len < 40 ? 'A little short. 40 to 60 characters reads best and uses the space you get.' : 'In the sweet spot for search and suggested.' })

  const hasNum = /\d/.test(s)
  if (hasNum) score += 18
  checks.push({ key: 'number', label: 'Has a number', pass: hasNum, hint: hasNum ? 'Numbers set a clear expectation and lift click-through.' : 'A specific number (7, 10, 2026) tends to raise CTR.' })

  // Stem match (no trailing boundary) so plurals and variants count:
  // 'mistake' hits "Mistakes", 'kill' hits "Killing", 'power' hits "Powerful".
  const POWER_STEMS = ['proven', 'simple', 'fast', 'honest', 'brutal', 'essential', 'hidden', 'power', 'smart', 'effortless', 'foolproof', 'underrated', 'secret', 'mistake', 'truth', 'stop', 'best', 'worst', 'kill', 'ultimate', 'easy', 'free', 'surprising', 'shocking', 'crazy', 'insane', 'genius', 'wrong', 'avoid', 'quit', 'ruin', 'viral', 'instant', 'nobody', 'everyone']
  const hasPower = POWER_STEMS.some((w) => new RegExp('\\b' + w, 'i').test(s))
  if (hasPower) score += 20
  checks.push({ key: 'power', label: 'Emotional / power word', pass: hasPower, hint: hasPower ? 'Good. A strong word adds curiosity or stakes.' : 'A power word (Proven, Secret, Mistake, Honest) adds pull.' })

  const hasBracket = /[\[\]()]/.test(s)
  if (hasBracket) score += 12
  checks.push({ key: 'bracket', label: 'Bracket or parenthesis', pass: hasBracket, hint: hasBracket ? 'Brackets add a second hook and reliably lift CTR.' : 'A bracketed add-on like (Step by Step) often lifts clicks.' })

  const kw = keyword.trim().toLowerCase()
  const front = kw && s.toLowerCase().indexOf(kw.split(' ')[0]) <= Math.max(8, s.length * 0.25)
  if (kw) {
    if (front) score += 12
    checks.push({ key: 'keyword', label: 'Keyword near the front', pass: !!front, hint: front ? 'Your keyword leads, which helps search relevance.' : 'Move your main keyword closer to the start.' })
  }

  const hasCuriosity = /\b(how|why|what|this|stop|never|before)\b/i.test(s)
  if (hasCuriosity) score += 8

  // Penalty for shouting.
  const caps = (s.match(/[A-Z]/g) || []).length
  if (len > 0 && caps / len > 0.5) {
    score -= 12
    checks.push({ key: 'caps', label: 'Not all caps', pass: false, hint: 'Too many capitals reads as spam. Use Title Case, not ALL CAPS.' })
  }

  score = Math.max(0, Math.min(100, score))
  const band = score >= 65 ? 'Strong' : score >= 42 ? 'Fair' : 'Weak'
  return { score, band, checks, len }
}

function bandColor(band) {
  if (band === 'Strong') return { fg: '#0f7a43', bg: 'rgba(26,157,90,0.12)' }
  if (band === 'Fair') return { fg: '#9a6a00', bg: 'rgba(201,138,0,0.13)' }
  return { fg: 'var(--ytg-accent-text)', bg: 'var(--ytg-accent-light)' }
}

/* ── FAQ ─────────────────────────────────────────────────────────────────── */
const FAQS = [
  { q: 'What makes a good YouTube title?',
    a: "A good title sets a clear, specific expectation and gives the viewer a reason to click in the half-second they spend deciding. The strongest titles usually do three things at once: they name the payoff (what the viewer gets), they add a hook (a number, a power word, or a bracketed twist like 'Step by Step'), and they stay short enough that nothing gets cut off in search or suggested. This tool scores each of those signals so you can see where a title is strong and where it is leaving clicks on the table." },
  { q: 'How long should a YouTube title be?',
    a: "Aim for 40 to 60 characters. YouTube allows up to 100, but search results, suggested, and mobile all truncate long titles, often around the 55 to 60 character mark, so anything past that risks hiding the most important words. Front-load the part that earns the click. If your main keyword and your hook both live in the first 50 characters, you are safe everywhere the title appears." },
  { q: 'Do numbers in titles really increase clicks?',
    a: "Usually, yes. A number sets a concrete expectation ('7 mistakes' tells the viewer exactly what they are getting and how long it will take to skim), and concrete beats vague almost every time. Odd numbers and the current year both tend to perform well. Numbers are not magic on their own, but paired with a clear topic and a strong word they are one of the most reliable CTR levers you have, which is why the analyzer rewards them." },
  { q: 'Should I put my keyword at the front of the title?',
    a: "When you can do it naturally, yes. Leading with your main keyword helps YouTube and Google understand what the video is about, and it guarantees the keyword survives truncation. That said, never bend a title into something awkward just to front-load a keyword. A title that reads naturally and earns the click will always beat a keyword-stuffed one that no one taps. Put the keyword as early as it fits, then optimize the rest for the human." },
  { q: 'Are brackets and parentheses worth using?',
    a: "Often. A bracketed add-on like (Step by Step), (2026 Update), or (Honest Review) gives the title a second hook without lengthening the core promise, and it visually separates the bonus from the main claim. Studies of large title datasets have repeatedly found a click-through lift on titles with brackets. Use them when they add real information; skip them when they are just decoration." },
  { q: 'Is clickbait bad for my channel?',
    a: "Over-promising is. A title that sets an expectation the video does not deliver will earn the click but tank your retention, and retention is a far stronger ranking signal than the click itself. The goal is a title that is irresistible AND true: tease the most interesting real thing in the video, do not invent one. A strong, honest title plus a video that pays it off is what compounds. A misleading one trains the algorithm that your clicks are hollow." },
  { q: 'How is this different from an AI title generator?',
    a: "This tool is deterministic and runs entirely in your browser: it fills proven title frames with your topic and scores each one against measurable CTR signals (length, numbers, power words, brackets, keyword position). It will not hallucinate, it works instantly, and it never sends your ideas to a server. Treat the generated titles as starting points to adapt in your own voice, and use the analyzer to pressure-test the final version you write yourself." },
  { q: 'Does the title affect YouTube SEO and ranking?',
    a: "Yes, in two ways. Directly, the title is one of the text fields YouTube reads to match your video to a search, so your keyword belongs there. Indirectly, and more powerfully, the title drives click-through rate, and a higher CTR on impressions tells YouTube your video is worth showing to more people. A title that ranks the keyword but no one clicks will not climb. The win is relevance plus pull, which is exactly what the score measures." },
  { q: 'How do I test which title performs?',
    a: "Publish your best version, then watch the impressions click-through rate in YouTube Studio over the first 24 to 48 hours. If it lands below your channel average for that type of video, swap the title (you can edit it any time without losing the video's history) and compare. Some creators run this manually every few days on new uploads. For a faster read on what is winning in your niche before you publish, YTGrowth scores your titles against the top-ranking videos for your keyword." },
  { q: 'Is this tool free, and do you store my titles?',
    a: "Free forever, no signup, no email. Generation and scoring happen entirely in your browser, so nothing you type is sent to or stored on our servers. We built it as a genuine free tool for creators. If you want titles scored against the real top-ranking videos in your niche, plus thumbnail and SEO help, you can connect your channel for a free AI audit, but that is entirely optional." },
]

function Eyebrow({ children }) {
  return (
    <div className="tg-eyebrow">
      <span aria-hidden="true" className="tg-eyebrow-dot" />
      <span className="tg-eyebrow-text">{children}</span>
    </div>
  )
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function YoutubeTitleGenerator() {
  useGlobalStyles()
  const { isMobile, isTablet } = useBreakpoint()

  const [mode, setMode] = useState('generate') // 'generate' | 'analyze'
  const [topic, setTopic] = useState('')
  const [titles, setTitles] = useState([])
  const [copied, setCopied] = useState(-1)
  const [draft, setDraft] = useState('')
  const [draftKeyword, setDraftKeyword] = useState('')
  const [openFaq, setOpenFaq] = useState(0)

  const onGenerate = () => {
    setTitles(generateTitles(topic))
    setCopied(-1)
  }
  const copy = (text, i) => {
    try { navigator.clipboard.writeText(text) } catch (e) { /* no-op */ }
    setCopied(i)
    setTimeout(() => setCopied((c) => (c === i ? -1 : c)), 1400)
  }

  const analysis = useMemo(() => (draft.trim() ? scoreTitle(draft, draftKeyword) : null), [draft, draftKeyword])

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', overflowX: 'hidden' }}>

      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="tg-section-pad" style={{ position: 'relative', padding: isMobile ? '64px 24px 56px' : '110px 48px 84px', textAlign: 'center', background: '#ffffff', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120vw', maxWidth: 1400, height: 620, background: 'radial-gradient(ellipse at center top, rgba(229,48,42,0.07) 0%, rgba(229,48,42,0.02) 40%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'tgFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 34 : isTablet ? 56 : 64, lineHeight: isMobile ? 1.1 : 1.04, letterSpacing: isMobile ? '-0.6px' : '-2.2px', color: 'var(--ytg-text)', marginBottom: 22, textWrap: 'balance' }}>
            Write YouTube titles that <span style={{ color: 'var(--ytg-accent)' }}>get the click.</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 660, margin: '0 auto 28px', textWrap: 'pretty' }}>
            Generate a dozen title ideas from your topic, then score any title against the signals that move click-through: length, numbers, power words, and keyword position.
          </p>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', fontWeight: 500 }}>No signup. No email. Runs in your browser.</p>
        </div>
      </section>

      {/* ══ TOOL ══ */}
      <section id="tool" className="tg-section-pad" style={{ padding: isMobile ? '40px 20px 80px' : '56px 48px 110px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>

          {/* Quiet view toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div className="tg-seg" role="tablist">
              <button className={mode === 'generate' ? 'active' : ''} onClick={() => setMode('generate')} role="tab" aria-selected={mode === 'generate'}>Generate titles</button>
              <button className={mode === 'analyze' ? 'active' : ''} onClick={() => setMode('analyze')} role="tab" aria-selected={mode === 'analyze'}>Analyze a title</button>
            </div>
          </div>

          <div className="tg-tool-grid">

            {/* LEFT column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-lg)', padding: isMobile ? 26 : 36 }}>
                {mode === 'generate' ? (
                  <>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Your video topic or keyword</label>
                    <input className="tg-input" value={topic} placeholder="e.g. editing in capcut" onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onGenerate() }} />
                    <button className="tg-btn" onClick={onGenerate} disabled={!topic.trim()} style={{ width: '100%', justifyContent: 'center', marginTop: 16, borderRadius: 14 }}>Generate titles →</button>
                    <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', marginTop: 16, lineHeight: 1.6 }}>
                      Twelve proven title frames, filled with your topic. Tap any result to copy it, then make it yours. Adapt the wording so it sounds like you, not a template.
                    </p>
                  </>
                ) : (
                  <>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Paste your title</label>
                    <textarea className="tg-input" value={draft} placeholder="e.g. 7 CapCut Editing Tricks That Really Work" onChange={(e) => setDraft(e.target.value)} />
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '18px 0 8px' }}>Main keyword (optional)</label>
                    <input className="tg-input" value={draftKeyword} placeholder="e.g. capcut editing" onChange={(e) => setDraftKeyword(e.target.value)} />
                    <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', marginTop: 16, lineHeight: 1.6 }}>
                      The score updates as you type. Add your keyword to also check that it sits near the front, where it survives truncation.
                    </p>
                  </>
                )}
              </div>

              {/* Grow CTA */}
              <div style={{ flex: 1, background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: 26 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Score against real rivals</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ytg-text)', lineHeight: 1.5, marginBottom: 8, letterSpacing: '-0.2px' }}>A checklist is a start. The top-ranking titles are the bar.</p>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.65, marginBottom: 18 }}>
                  YTGrowth's SEO Studio scores your title against the videos already ranking for your keyword, so you optimize toward what is winning in your niche, not a generic rule.
                </p>
                <a href="/auth/login" className="tg-btn" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 14, borderRadius: 14 }}>Get my free audit →</a>
                <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', textAlign: 'center', marginTop: 10 }}>Free trial · no card · upgrade anytime</p>
              </div>
            </div>

            {/* RIGHT column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {mode === 'generate' ? (
                <div style={{ flex: 1, background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: isMobile ? 20 : 24, minHeight: 320 }}>
                  {titles.length === 0 ? (
                    <div style={{ height: '100%', minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--ytg-text-3)', padding: 24 }}>
                      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 17, fontWeight: 700, color: 'var(--ytg-text-2)', marginBottom: 6 }}>Your titles will appear here</div>
                      <div style={{ fontSize: 13.5, lineHeight: 1.6, maxWidth: 320 }}>Enter a topic on the left and hit Generate. Each title comes scored so you can pick the strongest.</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {titles.map((t, i) => {
                        const sc = scoreTitle(t, topic)
                        const col = bandColor(sc.band)
                        return (
                          <button key={i} onClick={() => copy(t, i)} title="Click to copy"
                            style={{ textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 12, background: copied === i ? 'var(--ytg-accent-light)' : '#fafafb', border: '1px solid var(--ytg-border)', borderRadius: 12, padding: '12px 14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s, border-color 0.15s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ytg-border-2)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ytg-border)' }}>
                            <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500, color: 'var(--ytg-text)', lineHeight: 1.45 }}>{t}</span>
                            <span className="tg-chip" style={{ color: col.fg, background: col.bg, flexShrink: 0, marginTop: 1 }}>{sc.score}</span>
                            <span style={{ fontSize: 11.5, fontWeight: 700, color: copied === i ? 'var(--ytg-accent-text)' : 'var(--ytg-text-3)', flexShrink: 0, width: 38, textAlign: 'right', marginTop: 2 }}>{copied === i ? 'Copied' : 'Copy'}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ flex: 1, background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: isMobile ? 24 : 30, minHeight: 320 }}>
                  {!analysis ? (
                    <div style={{ height: '100%', minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--ytg-text-3)', padding: 24 }}>
                      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 17, fontWeight: 700, color: 'var(--ytg-text-2)', marginBottom: 6 }}>Your score will appear here</div>
                      <div style={{ fontSize: 13.5, lineHeight: 1.6, maxWidth: 320 }}>Paste a title on the left to see its score and a breakdown of what is helping and hurting.</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
                        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 46, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1, color: bandColor(analysis.band).fg }}>{analysis.score}</div>
                        <div>
                          <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.4px' }}>{analysis.band}</div>
                          <div style={{ fontSize: 12.5, color: 'var(--ytg-text-3)' }}>out of 100 · {analysis.len} characters</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {analysis.checks.map((c) => (
                          <div key={c.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                            <span aria-hidden="true" style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.pass ? 'rgba(26,157,90,0.13)' : 'var(--ytg-accent-light)' }}>
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                {c.pass
                                  ? <path d="M1.5 5.2l2.2 2.2L8.5 2.6" stroke="#1a9d5a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                  : <path d="M2.2 2.2l5.6 5.6M7.8 2.2l-5.6 5.6" stroke="var(--ytg-accent)" strokeWidth="1.7" strokeLinecap="round" />}
                              </svg>
                            </span>
                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ytg-text)', letterSpacing: '-0.1px' }}>{c.label}</div>
                              <div style={{ fontSize: 12.5, color: 'var(--ytg-text-2)', lineHeight: 1.5 }}>{c.hint}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="tg-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, maxWidth: 720 }}>
            <Eyebrow>What the score measures</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, textWrap: 'balance' }}>
              What makes a title <span style={{ color: 'var(--ytg-accent)' }}>get clicked.</span>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {[
              { h: 'Length that survives truncation', p: 'YouTube cuts titles off in search, suggested, and on mobile, often near 55 to 60 characters. Keep the promise and the keyword inside the first 50 and nothing important disappears. The score rewards 40 to 60 and flags anything that will get clipped.' },
              { h: 'A number sets a concrete expectation', p: "'7 mistakes' tells the viewer exactly what they get and how long it takes to skim. Concrete beats vague, and the year (2026) signals freshness. Numbers are one of the most reliable click-through levers, so the analyzer counts them." },
              { h: 'A power word adds curiosity or stakes', p: 'Words like Proven, Secret, Mistake, or Honest raise the emotional temperature of a title without lengthening the core promise. They give the viewer a reason to care, not just to know.' },
              { h: 'Brackets give you a second hook', p: 'An add-on like (Step by Step) or (2026 Update) separates a bonus from the main claim and reliably lifts clicks across large title datasets. The score gives credit for one, used with purpose.' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', gap: isMobile ? 12 : 56, paddingTop: i === 0 ? 0 : 28, borderTop: i === 0 ? 'none' : '1px solid var(--ytg-border)' }}>
                <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 20 : 22, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.5px', lineHeight: 1.25 }}>{row.h}</h3>
                <p style={{ fontSize: 15.5, color: 'var(--ytg-text-2)', lineHeight: 1.75 }}>{row.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW TO GROW (3 cards) ══ */}
      <section className="tg-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ marginBottom: 44, textAlign: 'center', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            <Eyebrow>Beyond the title</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
              The title gets the click. <span style={{ color: 'var(--ytg-accent)' }}>Then what?</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>A great title only matters if the thumbnail earns the look and the video keeps the viewer. YTGrowth scores all three.</p>
          </div>
          <div className="tg-grid-3">
            {[
              { label: 'SEO Studio', title: 'Title vs the top results', body: 'Score your title against the videos already ranking for your keyword, so you optimize toward what is winning in your niche, not a generic checklist.', href: '/features/seo-studio' },
              { label: 'Thumbnail IQ', title: 'Win the look, not just the read', body: 'The title and thumbnail work as a pair. Score your thumbnail on contrast, faces, and text density against the top performers before you upload.', href: '/features/thumbnail-iq' },
              { label: 'AI Channel Audit', title: 'Find what is holding you back', body: 'A 10-dimension audit across your last 20 videos, CTR, and retention, with a prioritized list of what to fix first.', href: '/features/channel-audit' },
            ].map((card, i) => (
              <a key={i} href={card.href} style={{ display: 'block', background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 22, padding: 30, boxShadow: 'var(--ytg-shadow-sm)', textDecoration: 'none', transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow)'; e.currentTarget.style.borderColor = 'var(--ytg-border-2)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow-sm)'; e.currentTarget.style.borderColor = 'var(--ytg-border)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>{card.label}</p>
                <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.4px', marginBottom: 12, lineHeight: 1.25 }}>{card.title}</h3>
                <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.65 }}>{card.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DARK CTA ══ */}
      <section className="tg-section-pad tg-cta-pad" style={{ padding: isMobile ? '88px 24px' : '120px 48px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', width: 1000, height: isMobile ? 600 : 800, background: 'radial-gradient(ellipse, rgba(229,48,42,0.20) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '5px 12px 5px 10px', marginBottom: 22 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 0 3px rgba(229,48,42,0.18)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Free AI audit</span>
          </div>
          <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: '#ffffff', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
            A strong title is step one. <span style={{ color: '#ff3b30' }}>Grow the rest.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, marginBottom: 32, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Connect your channel for a free AI audit and get titles, thumbnails, and SEO scored against the videos winning in your niche.
          </p>
          <a href="/auth/login" className="tg-btn tg-btn-lg">Get my free audit →</a>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', marginTop: 16 }}>Free trial · no card · upgrade anytime</p>
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
              Everything creators ask about writing titles that rank and get the click. Still unsure? <a href="/contact" style={{ color: 'var(--ytg-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
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
                    style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 14 : 20, padding: isMobile ? '20px 0' : '24px 0', paddingLeft: isOpen ? (isMobile ? 16 : 22) : 0, cursor: 'pointer', transition: 'padding-left 0.25s ease', userSelect: 'none' }}>
                    <span style={{ fontSize: isMobile ? 12 : 13, fontWeight: 700, color: isOpen ? 'var(--ytg-accent)' : 'var(--ytg-text-3)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.5, flexShrink: 0, width: isMobile ? 22 : 28, paddingTop: 2, transition: 'color 0.2s' }}>{num}</span>
                    <span style={{ flex: 1, fontSize: isMobile ? 15 : 16, fontWeight: 600, color: 'var(--ytg-text)', lineHeight: 1.45, letterSpacing: '-0.2px' }}>{item.q}</span>
                    <span aria-hidden="true" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isOpen ? 'var(--ytg-accent)' : 'rgba(10,10,15,0.05)', border: `1px solid ${isOpen ? 'var(--ytg-accent)' : 'rgba(10,10,15,0.10)'}`, transition: 'background 0.2s, border-color 0.2s', marginTop: 1 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 5h8" stroke={isOpen ? '#ffffff' : 'var(--ytg-text-2)'} strokeWidth="1.8" strokeLinecap="round" />
                        {!isOpen && <path d="M5 1v8" stroke="var(--ytg-text-2)" strokeWidth="1.8" strokeLinecap="round" />}
                      </svg>
                    </span>
                  </div>
                  <div className={`tg-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="tg-faq-answer-inner">
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
