import { useEffect, useMemo, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free tool: YouTube Chapter & Timestamp Generator ─────────────────────
   /tools/youtube-chapter-generator. Validates + formats chapters client-side
   (zero API) against YouTube's rules. Migrated to the editorial design
   language; 2-column matched-height (rows editor left, validated output on
   the dark pane right). All logic + content preserved.
   See project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

function parseTime(s) {
  const t = (s || '').trim()
  if (!/^\d{1,2}(:\d{1,2}){1,2}$/.test(t)) return null
  const parts = t.split(':').map(Number)
  if (parts.some((p) => isNaN(p) || p < 0)) return null
  if (parts.length === 2) {
    if (parts[1] > 59) return null
    return parts[0] * 60 + parts[1]
  }
  if (parts[1] > 59 || parts[2] > 59) return null
  return parts[0] * 3600 + parts[1] * 60 + parts[2]
}

function secToTime(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

function buildChapters(rows) {
  const filled = rows.filter((r) => r.title.trim() !== '' || r.time.trim() !== '')
  const parsed = filled.map((r) => ({ sec: parseTime(r.time), title: r.title.trim() }))
  const issues = []

  const valid = parsed.filter((p) => p.sec !== null && p.title !== '')
  if (filled.some((r) => parseTime(r.time) === null)) issues.push('Every row needs a time like 1:30 or 12:05.')
  if (filled.some((r) => r.title.trim() === '')) issues.push('Every chapter needs a title.')
  if (valid.length < 3) issues.push('YouTube needs at least 3 chapters to show them.')
  if (valid.length && valid[0].sec !== 0) issues.push('The first chapter must start at 0:00.')
  for (let i = 1; i < valid.length; i++) {
    if (valid[i].sec <= valid[i - 1].sec) { issues.push('Times must increase down the list.'); break }
    if (valid[i].sec - valid[i - 1].sec < 10) { issues.push('Each chapter must be at least 10 seconds long.'); break }
  }

  const text = valid.map((p) => `${secToTime(p.sec)} ${p.title}`).join('\n')
  return { text, issues: Array.from(new Set(issues)), ok: valid.length >= 3 && issues.length === 0 }
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
    if (document.getElementById('ch-styles')) return
    const style = document.createElement('style')
    style.id = 'ch-styles'
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
      @keyframes chFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .ch-wrap { max-width: 920px; margin: 0 auto; }
      .ch-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .ch-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .ch-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .ch-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.04; }
      .ch-h1 em { font-style: italic; color: var(--yte-accent); }
      .ch-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .ch-h2 em { font-style: italic; color: var(--yte-accent); }
      .ch-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .ch-input { padding: 11px 13px; font-size: 14.5px; font-weight: 500; font-family: ${SANS}; color: var(--yte-ink); background: var(--yte-bg); border: 1px solid var(--yte-line); border-radius: 0; outline: none; transition: border-color 0.15s, background 0.15s; -webkit-appearance: none; }
      .ch-input:focus { border-color: var(--yte-accent); background: #fff; }
      .ch-time { width: 78px; text-align: center; font-variant-numeric: tabular-nums; }
      .ch-x { width: 30px; height: 30px; flex-shrink: 0; background: none; border: 1px solid var(--yte-line); color: var(--yte-muted); font-size: 16px; line-height: 1; cursor: pointer; transition: all 0.15s; }
      .ch-x:hover:not(:disabled) { border-color: var(--yte-accent); color: var(--yte-accent); }
      .ch-x:disabled { opacity: 0.35; cursor: not-allowed; }
      .ch-ghost { font-family: ${SANS}; font-size: 13px; font-weight: 600; letter-spacing: 0.02em; color: var(--yte-ink); background: transparent; border: 1px solid var(--yte-line-2); border-radius: 0; padding: 9px 16px; cursor: pointer; transition: background 0.15s; }
      .ch-ghost:hover { background: var(--yte-bg-2); }

      .ch-tool { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 12px; align-items: stretch; }
      @media (max-width: 820px) { .ch-tool { grid-template-columns: 1fr; } }
      .ch-pane { background: var(--yte-surface); border: 1px solid var(--yte-line); padding: 26px; }
      .ch-pane-dark { background: var(--yte-ink); padding: 24px; color: #fff; display: flex; flex-direction: column; min-height: 0; }
      .ch-pre { flex: 1; min-height: 0; max-height: 280px; margin: 0; font-family: 'Barlow', ui-monospace, monospace; font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.9); white-space: pre-wrap; word-break: break-word; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); padding: 16px; overflow: auto; font-variant-numeric: tabular-nums; }
      .ch-copy { font-family: ${SANS}; font-size: 11.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.22); background: transparent; color: #fff; padding: 6px 14px; cursor: pointer; transition: background 0.15s; }
      .ch-copy:hover { background: rgba(255,255,255,0.1); }
      .ch-copy:disabled { opacity: 0.4; cursor: not-allowed; }

      .ch-grow-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 760px) { .ch-grow-grid { grid-template-columns: 1fr; } }
      .ch-grow-card { display: block; text-decoration: none; background: var(--yte-surface); padding: 28px; transition: background 0.15s; }
      .ch-grow-card:hover { background: var(--yte-bg-2); }

      .ch-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease; }
      .ch-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .ch-faq-answer-inner { overflow: hidden; }

      @media (max-width: 768px) { .ch-section-pad { padding-left: 22px !important; padding-right: 22px !important; } .ch-cta-pad { padding: 76px 24px !important; } }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children }) {
  return (
    <div className="ch-eyebrow">
      <span aria-hidden="true" className="ch-eyebrow-rule" />
      <span className="ch-eyebrow-text">{children}</span>
    </div>
  )
}

const HOW_IT_WORKS = [
  { h: 'The first timestamp must be 0:00', p: "Chapters only switch on when the first line of your list starts at 0:00. Miss this and YouTube ignores the whole set, so this tool defaults your first chapter to 0:00 and flags it if you change it." },
  { h: 'At least three chapters, in order', p: "You need a minimum of three timestamps, listed in ascending order. Two will not trigger chapters, and times that jump backward break the set. The validator checks both as you type." },
  { h: 'Each chapter is 10 seconds or longer', p: "Every chapter has to run at least 10 seconds, which means your timestamps must be 10 or more seconds apart. Slice too finely and chapters fail to appear." },
  { h: 'Paste into the description', p: "Once the set is valid, drop it into your video description in YouTube Studio. The chapters show on the progress bar within a short time, and you can edit them on existing videos whenever you want." },
]

const GROW = [
  { label: 'Description Generator', title: 'Build the full description', body: 'Drop your chapters into a complete, keyword-rich description with links and hashtags, in seconds.', href: '/tools/youtube-description-generator' },
  { label: 'Title Generator', title: 'Write titles that pull', body: 'Generate and score titles against the CTR signals that earn the click your chapters then hold.', href: '/tools/youtube-title-generator' },
  { label: 'AI Channel Audit', title: 'Find your drop-offs', body: 'A 10-dimension audit reads your retention curves and shows exactly where viewers leave, and what to fix.', href: '/features/channel-audit' },
]

const FAQS = [
  { q: 'What are YouTube chapters and timestamps?',
    a: "Chapters split your video into labeled sections that appear as markers on the progress bar and as a clickable list, so viewers can jump straight to the part they want. You create them by adding timestamps to your video description: a time followed by a label, one per line. When the format is right, YouTube turns them into chapters automatically. They improve the viewing experience and can lift watch time because people find what they came for instead of bouncing." },
  { q: 'What are the rules for chapters to work?',
    a: "Three rules. First, the very first timestamp must be 0:00. Second, you need at least three timestamps in ascending order. Third, each chapter must be at least 10 seconds long, so your timestamps have to be 10 or more seconds apart. If any rule is broken, YouTube quietly ignores all of them and you get no chapters. This tool checks all three as you type and tells you the moment something is off." },
  { q: 'Where do I paste the timestamps?',
    a: "Put them in your video description. Open YouTube Studio, go to the video, then Details, and paste the chapter block into the description box, ideally near the top or in a clearly labeled section. Save, and within a short time the chapters appear on the player. You can add or edit chapters on existing videos at any time without affecting their performance history." },
  { q: 'Do chapters help my video perform?',
    a: "They help the viewer experience, which feeds the metrics that matter. When viewers can jump to the section they want, they are more likely to keep watching instead of leaving, and better retention is a strong signal to YouTube. Chapters also give the algorithm extra structured context about what your video covers. They will not rescue a weak video, but on a solid one they are a free, easy win." },
  { q: 'How many chapters should a video have?',
    a: "Enough to map the real sections of your video without slicing it so finely that each chapter is a few seconds long. For most videos that means somewhere between three and ten chapters. Name them clearly and usefully (a viewer scanning the list should understand what each section delivers), and remember the 10-second minimum length per chapter." },
  { q: 'Can I use chapters on Shorts?',
    a: "No. Chapters apply to regular long-form videos, not to Shorts, which are too short to benefit and do not show a chapter list. Use chapters on your standard uploads, especially tutorials, guides, reviews, and any video long enough that viewers will want to navigate it." },
  { q: 'Is this tool free, and do you store my data?',
    a: "Free forever, no signup, no email. The generator runs entirely in your browser, so nothing you type is sent to or stored on our servers. We built it as a genuine free tool to make a fiddly formatting job painless. If you want your titles and descriptions scored against the videos already ranking for your keyword, you can connect your channel for a free AI audit, but that is entirely optional." },
]

export default function YoutubeChapterGenerator() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()

  const [rows, setRows] = useState([
    { time: '0:00', title: 'Intro' },
    { time: '0:45', title: '' },
    { time: '2:30', title: '' },
  ])
  const [copied, setCopied] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)

  const result = useMemo(() => buildChapters(rows), [rows])

  const setRow = (i, key, val) => setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)))
  const addRow = () => setRows((r) => [...r, { time: '', title: '' }])
  const removeRow = (i) => setRows((r) => (r.length > 1 ? r.filter((_, idx) => idx !== i) : r))

  const copy = () => {
    if (!result.text) return
    try { navigator.clipboard.writeText(result.text) } catch (e) { /* no-op */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const H1 = isMobile ? 34 : 54
  const H2 = isMobile ? 28 : 40

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', overflowX: 'clip' }}>
      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="ch-section-pad" style={{ padding: isMobile ? '60px 22px 40px' : '104px 48px 48px', background: 'var(--yte-bg)' }}>
        <div className="ch-wrap" style={{ animation: 'chFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 className="ch-h1" style={{ fontSize: H1, marginBottom: 22, maxWidth: 760, textWrap: 'balance' }}>
            YouTube chapters, <em>formatted right.</em>
          </h1>
          <div style={{ maxWidth: 640 }}>
            <p className="ch-lead" style={{ fontSize: isMobile ? 16 : 17.5, marginBottom: 14, textWrap: 'pretty' }}>
              Add your sections and times and get a clean chapter block that passes YouTube's rules: first at 0:00, three or more, ten seconds apart. Copy and paste into your description.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>No signup. No email. Free forever.</p>
          </div>
        </div>
      </section>

      {/* ══ TOOL ══ */}
      <section className="ch-section-pad" style={{ padding: isMobile ? '8px 22px 64px' : '0 48px 88px', background: 'var(--yte-bg)' }}>
        <div className="ch-wrap">
          <div className="ch-tool">
            {/* Editor */}
            <div className="ch-pane">
              <div style={{ display: 'flex', marginBottom: 12, paddingRight: 40 }}>
                <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', width: 88 }}>Time</span>
                <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Chapter title</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rows.map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input className="ch-input ch-time" value={row.time} placeholder="0:00" onChange={(e) => setRow(i, 'time', e.target.value)} />
                    <input className="ch-input" style={{ flex: 1 }} value={row.title} placeholder={i === 0 ? 'Intro' : 'Section title'} onChange={(e) => setRow(i, 'title', e.target.value)} />
                    <button className="ch-x" aria-label="Remove chapter" onClick={() => removeRow(i)} disabled={rows.length <= 1}>×</button>
                  </div>
                ))}
              </div>
              <button className="ch-ghost" style={{ marginTop: 14 }} onClick={addRow}>+ Add chapter</button>
            </div>

            {/* Output (dark) */}
            <div className="ch-pane-dark">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Your chapters</span>
                <button className="ch-copy" onClick={copy} disabled={!result.text}>{copied ? 'Copied' : 'Copy'}</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 13px', marginBottom: 14, background: result.ok ? 'rgba(93,211,158,0.12)' : 'rgba(233,185,73,0.12)', border: `1px solid ${result.ok ? 'rgba(93,211,158,0.3)' : 'rgba(233,185,73,0.3)'}` }}>
                <span aria-hidden="true" style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: result.ok ? 'rgba(93,211,158,0.2)' : 'rgba(233,185,73,0.2)' }}>
                  {result.ok
                    ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5.2l2.2 2.2L8.5 2.6" stroke="#5dd39e" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1.4v4.2M5 7.8v.2" stroke="#e9b949" strokeWidth="1.9" strokeLinecap="round" /></svg>}
                </span>
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: result.ok ? '#5dd39e' : '#e9b949' }}>{result.ok ? 'Valid YouTube chapters' : 'Almost there'}</div>
                  {result.ok
                    ? <div style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Copy and paste this into your video description.</div>
                    : <ul style={{ margin: '4px 0 0', paddingLeft: 16, fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{result.issues.map((iss, k) => <li key={k}>{iss}</li>)}</ul>}
                </div>
              </div>

              {result.text ? (
                <pre className="ch-pre">{result.text}</pre>
              ) : (
                <div style={{ flex: 1, minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: '#fff', marginBottom: 8 }}>Your chapters appear here</div>
                  <div style={{ fontFamily: SANS, fontSize: 13.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 300 }}>Fill in a time and title for each section on the left.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="ch-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="ch-wrap">
          <div style={{ marginBottom: 40, maxWidth: 680 }}>
            <Eyebrow>The chapter rules</Eyebrow>
            <h2 className="ch-h2" style={{ fontSize: H2, textWrap: 'balance' }}>Three rules, or <em>no chapters at all.</em></h2>
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
      <section className="ch-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="ch-wrap">
          <div style={{ marginBottom: 32, maxWidth: 680 }}>
            <Eyebrow>Beyond chapters</Eyebrow>
            <h2 className="ch-h2" style={{ fontSize: H2, marginBottom: 12, textWrap: 'balance' }}>Chapters keep viewers. <em>Get them there first.</em></h2>
            <p className="ch-lead" style={{ fontSize: 17 }}>Chapters help the people who already clicked. Your title and thumbnail decide whether they click at all, and your retention decides whether they stay.</p>
          </div>
          <div className="ch-grow-grid">
            {GROW.map((c, i) => (
              <a key={i} href={c.href} className="ch-grow-card">
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>{c.label}</div>
                <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', marginBottom: 12, lineHeight: 1.2 }}>{c.title}</h3>
                <p style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.65 }}>{c.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div className="ch-section-pad" style={{ background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)', padding: isMobile ? '60px 22px' : '104px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 36 : 80, alignItems: 'start' }}>
          <div>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="ch-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>Chapters, <em>answered.</em></h2>
            <p className="ch-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              What creators ask about chapters and timestamps. Still unsure? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
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
                  <div className={`ch-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="ch-faq-answer-inner">
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
