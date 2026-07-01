import { useEffect, useMemo, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free tool: YouTube Title Generator + Analyzer ───────────────────────
   /tools/youtube-title-generator. Generation and CTR scoring run entirely
   client-side (zero API). Migrated to the editorial design language
   (Fraunces + Barlow, sharp flat cards, warm paper, restrained red). The
   generate/analyze logic and all content are preserved from the original;
   only the skin changed. Mode toggle stays quiet-grey, never red (see
   feedback_quiet_toggles). See project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

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
    if (document.getElementById('tg-styles')) return
    const style = document.createElement('style')
    style.id = 'tg-styles'
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
      @keyframes tgFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .tg-wrap { max-width: 920px; margin: 0 auto; }
      .tg-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .tg-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .tg-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .tg-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.04; }
      .tg-h1 em { font-style: italic; color: var(--yte-accent); }
      .tg-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .tg-h2 em { font-style: italic; color: var(--yte-accent); }
      .tg-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .tg-label { display: block; font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-muted); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 9px; }
      .tg-input { width: 100%; padding: 13px 14px; font-size: 15px; font-weight: 500; font-family: ${SANS}; color: var(--yte-ink); background: var(--yte-bg); border: 1px solid var(--yte-line); border-radius: 0; outline: none; transition: border-color 0.15s, background 0.15s; -webkit-appearance: none; }
      .tg-input:focus { border-color: var(--yte-accent); background: #fff; }
      textarea.tg-input { resize: vertical; min-height: 92px; line-height: 1.5; }

      .tg-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--yte-accent); color: #fff; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 14px 24px; border: none; border-radius: 0; cursor: pointer; text-decoration: none; transition: filter 0.18s, transform 0.18s; }
      .tg-btn:hover { filter: brightness(1.06); transform: translateY(-1px); }
      .tg-btn:disabled { background: rgba(20,19,15,0.10); color: var(--yte-muted); cursor: not-allowed; transform: none; filter: none; }

      /* Quiet mode toggle: soft active, never red */
      .tg-seg { display: inline-flex; border: 1px solid var(--yte-line); background: var(--yte-surface); }
      .tg-seg button { font-family: ${SANS}; font-size: 13px; font-weight: 600; letter-spacing: 0.02em; color: var(--yte-muted); background: transparent; border: none; padding: 10px 20px; cursor: pointer; transition: background 0.15s, color 0.15s; }
      .tg-seg button + button { border-left: 1px solid var(--yte-line); }
      .tg-seg button.active { background: var(--yte-ink); color: #fff; }

      .tg-tool { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 12px; align-items: start; }
      @media (max-width: 820px) { .tg-tool { grid-template-columns: 1fr; } }
      .tg-pane { background: var(--yte-surface); border: 1px solid var(--yte-line); padding: 28px; }
      .tg-pane-dark { background: var(--yte-ink); padding: 28px; color: #fff; }

      .tg-titlerow { width: 100%; text-align: left; display: flex; align-items: flex-start; gap: 12px; background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,0.1); padding: 13px 0; cursor: pointer; font-family: ${SANS}; transition: opacity 0.15s; }
      .tg-titlerow:hover { opacity: 0.78; }
      .tg-chip { display: inline-flex; align-items: center; font-family: ${SANS}; font-size: 11.5px; font-weight: 700; padding: 3px 8px; flex-shrink: 0; letter-spacing: 0.02em; }

      .tg-grow-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 760px) { .tg-grow-grid { grid-template-columns: 1fr; } }
      .tg-grow-card { display: block; text-decoration: none; background: var(--yte-surface); padding: 28px; transition: background 0.15s; }
      .tg-grow-card:hover { background: var(--yte-bg-2); }

      .tg-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease; }
      .tg-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .tg-faq-answer-inner { overflow: hidden; }

      @media (max-width: 768px) { .tg-section-pad { padding-left: 22px !important; padding-right: 22px !important; } .tg-cta-pad { padding: 76px 24px !important; } }
    `
    document.head.appendChild(style)
  }, [])
}

/* ── Generation data (client-side, zero API) ─────────────────────────────── */
const NUMBERS = [3, 5, 7, 9, 10, 11, 13, 15, 21]
const POWER_WORDS = ['Proven', 'Simple', 'Fast', 'Honest', 'Brutal', 'Essential', 'Hidden', 'Powerful', 'Smart', 'Effortless', 'Foolproof', 'Underrated']

function cap(s) { return s.replace(/\b\w/g, (c) => c.toUpperCase()) }
function pick(arr, seed) { return arr[seed % arr.length] }

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

function generateTitles(topic) {
  const t = topic.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!t) return []
  const out = []
  TEMPLATES.forEach((fn, i) => {
    const n = pick(NUMBERS, i * 3 + t.length)
    const p = pick(POWER_WORDS, i * 5 + t.length)
    out.push(fn(t, n, p))
  })
  return Array.from(new Set(out)).slice(0, 12)
}

function scoreTitle(title, keyword = '') {
  const s = title.trim()
  const len = s.length
  const checks = []
  let score = 0

  let lenPts = 6
  if (len >= 40 && len <= 60) lenPts = 30
  else if (len >= 30 && len < 70) lenPts = 20
  else if (len < 30) lenPts = 10
  score += lenPts
  checks.push({ key: 'length', label: `Length ${len} chars`, pass: len >= 40 && len <= 60, hint: len > 60 ? 'Long titles get cut off in search and suggested. Aim for 40 to 60.' : len < 40 ? 'A little short. 40 to 60 characters reads best and uses the space you get.' : 'In the sweet spot for search and suggested.' })

  const hasNum = /\d/.test(s)
  if (hasNum) score += 18
  checks.push({ key: 'number', label: 'Has a number', pass: hasNum, hint: hasNum ? 'Numbers set a clear expectation and lift click-through.' : 'A specific number (7, 10, 2026) tends to raise CTR.' })

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

  const caps = (s.match(/[A-Z]/g) || []).length
  if (len > 0 && caps / len > 0.5) {
    score -= 12
    checks.push({ key: 'caps', label: 'Not all caps', pass: false, hint: 'Too many capitals reads as spam. Use Title Case, not ALL CAPS.' })
  }

  score = Math.max(0, Math.min(100, score))
  const band = score >= 65 ? 'Strong' : score >= 42 ? 'Fair' : 'Weak'
  return { score, band, checks, len }
}

/* Band colors tuned for the warm light surface + the dark output panel. */
function bandColor(band, onDark = false) {
  if (band === 'Strong') return onDark ? { fg: '#5dd39e', bg: 'rgba(93,211,158,0.16)' } : { fg: '#0f7a43', bg: 'rgba(15,122,67,0.12)' }
  if (band === 'Fair')   return onDark ? { fg: '#e9b949', bg: 'rgba(233,185,73,0.16)' } : { fg: '#9a6a00', bg: 'rgba(201,138,0,0.13)' }
  return onDark ? { fg: '#e6b35c', bg: 'rgba(230,179,92,0.16)' } : { fg: '#c22b25', bg: 'rgba(229,48,42,0.10)' }
}

const HOW_IT_WORKS = [
  { h: 'Length that survives truncation', p: 'YouTube cuts titles off in search, suggested, and on mobile, often near 55 to 60 characters. Keep the promise and the keyword inside the first 50 and nothing important disappears. The score rewards 40 to 60 and flags anything that will get clipped.' },
  { h: 'A number sets a concrete expectation', p: "'7 mistakes' tells the viewer exactly what they get and how long it takes to skim. Concrete beats vague, and the year (2026) signals freshness. Numbers are one of the most reliable click-through levers, so the analyzer counts them." },
  { h: 'A power word adds curiosity or stakes', p: 'Words like Proven, Secret, Mistake, or Honest raise the emotional temperature of a title without lengthening the core promise. They give the viewer a reason to care, not just to know.' },
  { h: 'Brackets give you a second hook', p: 'An add-on like (Step by Step) or (2026 Update) separates a bonus from the main claim and reliably lifts clicks across large title datasets. The score gives credit for one, used with purpose.' },
]

const GROW = [
  { label: 'SEO Studio', title: 'Title vs the top results', body: 'Score your title against the videos already ranking for your keyword, so you optimize toward what is winning in your niche, not a generic checklist.', href: '/features/seo-studio' },
  { label: 'Thumbnail IQ', title: 'Win the look, not just the read', body: 'The title and thumbnail work as a pair. Score your thumbnail on contrast, faces, and text density against the top performers before you upload.', href: '/features/thumbnail-iq' },
  { label: 'AI Channel Audit', title: 'Find what is holding you back', body: 'A 10-dimension audit across your last 20 videos, CTR, and retention, with a prioritized list of what to fix first.', href: '/features/channel-audit' },
]

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
      <span aria-hidden="true" className="tg-eyebrow-rule" />
      <span className="tg-eyebrow-text">{children}</span>
    </div>
  )
}

export default function YoutubeTitleGenerator() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()

  const [mode, setMode] = useState('generate')
  const [topic, setTopic] = useState('')
  const [titles, setTitles] = useState([])
  const [copied, setCopied] = useState(-1)
  const [draft, setDraft] = useState('')
  const [draftKeyword, setDraftKeyword] = useState('')
  const [openFaq, setOpenFaq] = useState(0)

  const onGenerate = () => { setTitles(generateTitles(topic)); setCopied(-1) }
  const copy = (text, i) => {
    try { navigator.clipboard.writeText(text) } catch (e) { /* no-op */ }
    setCopied(i)
    setTimeout(() => setCopied((c) => (c === i ? -1 : c)), 1400)
  }
  const analysis = useMemo(() => (draft.trim() ? scoreTitle(draft, draftKeyword) : null), [draft, draftKeyword])

  const H1 = isMobile ? 34 : 54
  const H2 = isMobile ? 28 : 40

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', overflowX: 'clip' }}>
      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="tg-section-pad" style={{ padding: isMobile ? '60px 22px 40px' : '104px 48px 48px', background: 'var(--yte-bg)' }}>
        <div className="tg-wrap" style={{ animation: 'tgFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 className="tg-h1" style={{ fontSize: H1, marginBottom: 22, maxWidth: 780, textWrap: 'balance' }}>
            Write YouTube titles that <em>get the click.</em>
          </h1>
          <div style={{ maxWidth: 640 }}>
            <p className="tg-lead" style={{ fontSize: isMobile ? 16 : 17.5, marginBottom: 14, textWrap: 'pretty' }}>
              Generate a dozen title ideas from your topic, then score any title against the signals that move click-through: length, numbers, power words, and keyword position.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>No signup. No email. Free forever.</p>
          </div>
        </div>
      </section>

      {/* ══ TOOL ══ */}
      <section className="tg-section-pad" style={{ padding: isMobile ? '8px 22px 64px' : '0 48px 88px', background: 'var(--yte-bg)' }}>
        <div className="tg-wrap">
          <div style={{ marginBottom: 18 }}>
            <div className="tg-seg" role="tablist">
              <button className={mode === 'generate' ? 'active' : ''} onClick={() => setMode('generate')} role="tab" aria-selected={mode === 'generate'}>Generate titles</button>
              <button className={mode === 'analyze' ? 'active' : ''} onClick={() => setMode('analyze')} role="tab" aria-selected={mode === 'analyze'}>Analyze a title</button>
            </div>
          </div>

          <div className="tg-tool">
            {/* INPUT pane */}
            <div className="tg-pane" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {mode === 'generate' ? (
                <>
                  <div>
                    <label className="tg-label">Your video topic or keyword</label>
                    <input className="tg-input" value={topic} placeholder="e.g. editing in capcut" onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onGenerate() }} />
                  </div>
                  <button className="tg-btn" onClick={onGenerate} disabled={!topic.trim()}>Generate titles →</button>
                  <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', lineHeight: 1.6 }}>
                    Twelve proven title frames, filled with your topic and scored. Tap any result to copy it, then make it yours so it sounds like you, not a template.
                  </p>
                </>
              ) : (
                <>
                  <div>
                    <label className="tg-label">Paste your title</label>
                    <textarea className="tg-input" value={draft} placeholder="e.g. 7 CapCut Editing Tricks That Really Work" onChange={(e) => setDraft(e.target.value)} />
                  </div>
                  <div>
                    <label className="tg-label">Main keyword (optional)</label>
                    <input className="tg-input" value={draftKeyword} placeholder="e.g. capcut editing" onChange={(e) => setDraftKeyword(e.target.value)} />
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', lineHeight: 1.6 }}>
                    The score updates as you type. Add your keyword to also check it sits near the front, where it survives truncation.
                  </p>
                </>
              )}
            </div>

            {/* OUTPUT pane (dark, the focal block) */}
            <div className="tg-pane-dark">
              {mode === 'generate' ? (
                titles.length === 0 ? (
                  <div style={{ minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: '#fff', marginBottom: 8 }}>Your titles appear here</div>
                    <div style={{ fontFamily: SANS, fontSize: 13.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 300 }}>Enter a topic and hit generate. Each title comes scored so you can pick the strongest.</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>12 titles · tap to copy</div>
                    {titles.map((t, i) => {
                      const sc = scoreTitle(t, topic)
                      const col = bandColor(sc.band, true)
                      return (
                        <button key={i} onClick={() => copy(t, i)} className="tg-titlerow" title="Click to copy">
                          <span style={{ flex: 1, fontFamily: SANS, fontSize: 14.5, fontWeight: 500, color: '#fff', lineHeight: 1.4 }}>{t}</span>
                          <span className="tg-chip" style={{ color: col.fg, background: col.bg, marginTop: 1 }}>{sc.score}</span>
                          <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: copied === i ? '#5dd39e' : 'rgba(255,255,255,0.45)', flexShrink: 0, width: 42, textAlign: 'right', marginTop: 3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{copied === i ? 'Copied' : 'Copy'}</span>
                        </button>
                      )
                    })}
                  </div>
                )
              ) : (
                !analysis ? (
                  <div style={{ minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: '#fff', marginBottom: 8 }}>Your score appears here</div>
                    <div style={{ fontFamily: SANS, fontSize: 13.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 300 }}>Paste a title to see its score and a breakdown of what is helping and hurting.</div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
                      <div className="tg-chip" style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, letterSpacing: '-1.5px', lineHeight: 1, padding: 0, background: 'transparent', color: bandColor(analysis.band, true).fg }}>{analysis.score}</div>
                      <div>
                        <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: '#fff', letterSpacing: '-0.3px' }}>{analysis.band}</div>
                        <div style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>out of 100 · {analysis.len} characters</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                      {analysis.checks.map((c) => (
                        <div key={c.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                          <span aria-hidden="true" style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.pass ? 'rgba(93,211,158,0.18)' : 'rgba(230,179,92,0.18)' }}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              {c.pass
                                ? <path d="M1.5 5.2l2.2 2.2L8.5 2.6" stroke="#5dd39e" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                : <path d="M2.2 2.2l5.6 5.6M7.8 2.2l-5.6 5.6" stroke="#e6b35c" strokeWidth="1.7" strokeLinecap="round" />}
                            </svg>
                          </span>
                          <div>
                            <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: '#fff' }}>{c.label}</div>
                            <div style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.58)', lineHeight: 1.5 }}>{c.hint}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="tg-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="tg-wrap">
          <div style={{ marginBottom: 40, maxWidth: 680 }}>
            <Eyebrow>What the score measures</Eyebrow>
            <h2 className="tg-h2" style={{ fontSize: H2, textWrap: 'balance' }}>What makes a title <em>get clicked.</em></h2>
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

      {/* ══ BEYOND THE TITLE (grow cards) ══ */}
      <section className="tg-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="tg-wrap">
          <div style={{ marginBottom: 32, maxWidth: 680 }}>
            <Eyebrow>Beyond the title</Eyebrow>
            <h2 className="tg-h2" style={{ fontSize: H2, marginBottom: 12, textWrap: 'balance' }}>The title gets the click. <em>Then what?</em></h2>
            <p className="tg-lead" style={{ fontSize: 17 }}>A great title only matters if the thumbnail earns the look and the video keeps the viewer. YTGrowth scores all three.</p>
          </div>
          <div className="tg-grow-grid">
            {GROW.map((c, i) => (
              <a key={i} href={c.href} className="tg-grow-card">
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>{c.label}</div>
                <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', marginBottom: 12, lineHeight: 1.2 }}>{c.title}</h3>
                <p style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.65 }}>{c.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div className="tg-section-pad" style={{ background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)', padding: isMobile ? '60px 22px' : '104px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 36 : 80, alignItems: 'start' }}>
          <div>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="tg-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>Titles, <em>answered.</em></h2>
            <p className="tg-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              Everything creators ask about titles that rank and get the click. Still unsure? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
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
                  <div className={`tg-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="tg-faq-answer-inner">
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
