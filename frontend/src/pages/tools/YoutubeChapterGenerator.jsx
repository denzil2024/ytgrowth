import { useEffect, useState, useMemo } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free SEO tool: YouTube Chapter & Timestamp Generator ────────────────
   /tools/youtube-chapter-generator. Zero YouTube-API cost: formats and
   validates chapters client-side. Visual DNA mirrors the other tool pages
   (Landing system: DM Sans headlines, Inter body, --ytg-* tokens, eyebrow
   pills, numbered FAQ). No emoji, no em-dash, no filler word. */

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
    if (document.getElementById('ytg-ch-styles')) return

    const style = document.createElement('style')
    style.id = 'ytg-ch-styles'
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
        --ytg-border-2:     rgba(10,10,15,0.16);
        --ytg-accent:       #e5302a;
        --ytg-accent-text:  #c22b25;
        --ytg-accent-light: rgba(229,48,42,0.07);
        --ytg-shadow-sm:    0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
        --ytg-shadow:       0 2px 6px rgba(0,0,0,0.08), 0 10px 32px rgba(0,0,0,0.11);
        --ytg-shadow-lg:    0 4px 16px rgba(0,0,0,0.11), 0 24px 60px rgba(0,0,0,0.14);
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; scrollbar-width: auto; scrollbar-color: rgba(10,10,15,0.28) transparent; }
      ::-webkit-scrollbar { width: 12px; height: 12px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background-color: rgba(10,10,15,0.28); border-radius: 10px; border: 3px solid transparent; background-clip: content-box; }
      ::-webkit-scrollbar-thumb:hover { background-color: rgba(10,10,15,0.48); background-clip: content-box; }
      @keyframes chFadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .ch-btn {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
        padding: 14px 28px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .ch-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,48,42,0.42); }
      .ch-btn-lg { font-size: 16px; padding: 17px 36px; }

      .ch-ghost { display: inline-flex; align-items: center; justify-content: center; gap: 7px; width: 100%; font-family: inherit; font-size: 13.5px; font-weight: 600; color: var(--ytg-text-2); background: var(--ytg-bg-3); border: 1px dashed var(--ytg-border-2); border-radius: 10px; padding: 11px; cursor: pointer; transition: background 0.15s, color 0.15s; }
      .ch-ghost:hover { background: #e2e3e8; color: var(--ytg-text); }

      .ch-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid rgba(10,10,15,0.09); border-radius: 100px; padding: 5px 12px 5px 10px; margin-bottom: 20px; box-shadow: 0 1px 2px rgba(10,10,15,0.04); }
      .ch-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ytg-accent); box-shadow: 0 0 0 3px rgba(229,48,42,0.12); }
      .ch-eyebrow-text { font-size: 11px; font-weight: 700; color: var(--ytg-text-2); text-transform: uppercase; letter-spacing: 0.09em; }

      .ch-input { padding: 10px 12px; font-size: 14px; font-weight: 500; font-family: inherit; color: var(--ytg-text); background: #fafafb; border: 1px solid var(--ytg-border); border-radius: 9px; outline: none; transition: border-color 0.15s, background 0.15s; -webkit-appearance: none; }
      .ch-input:focus { border-color: rgba(10,10,15,0.28); background: #fff; }
      .ch-time { width: 78px; text-align: center; font-variant-numeric: tabular-nums; }

      .ch-x { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; flex-shrink: 0; border: 1px solid var(--ytg-border); background: #fff; color: var(--ytg-text-3); border-radius: 8px; cursor: pointer; font-size: 15px; line-height: 1; transition: background 0.15s, color 0.15s, border-color 0.15s; }
      .ch-x:hover { background: var(--ytg-accent-light); color: var(--ytg-accent-text); border-color: rgba(229,48,42,0.2); }
      .ch-x:disabled { opacity: 0.35; cursor: not-allowed; }

      .ch-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease; }
      .ch-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .ch-faq-answer-inner { overflow: hidden; }

      .ch-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
      .ch-tool-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: stretch; }

      @media (max-width: 900px) { .ch-grid-3 { grid-template-columns: 1fr; } .ch-tool-grid { grid-template-columns: 1fr; } }
      @media (max-width: 768px) { .ch-section-pad { padding-left: 20px !important; padding-right: 20px !important; } .ch-cta-pad { padding: 70px 24px !important; } }
    `
    document.head.appendChild(style)
  }, [])
}

/* ── Time parsing + validation (client-side, zero API) ───────────────────── */
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
  if (filled.some((r, i) => parseTime(r.time) === null)) issues.push('Every row needs a time like 1:30 or 12:05.')
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

function Eyebrow({ children }) {
  return (
    <div className="ch-eyebrow">
      <span aria-hidden="true" className="ch-eyebrow-dot" />
      <span className="ch-eyebrow-text">{children}</span>
    </div>
  )
}

export default function YoutubeChapterGenerator() {
  useGlobalStyles()
  const { isMobile, isTablet } = useBreakpoint()

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

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', overflowX: 'hidden' }}>

      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="ch-section-pad" style={{ position: 'relative', padding: isMobile ? '64px 24px 56px' : '110px 48px 84px', textAlign: 'center', background: '#ffffff', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120vw', maxWidth: 1400, height: 620, background: 'radial-gradient(ellipse at center top, rgba(229,48,42,0.07) 0%, rgba(229,48,42,0.02) 40%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'chFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 34 : isTablet ? 56 : 64, lineHeight: isMobile ? 1.1 : 1.04, letterSpacing: isMobile ? '-0.6px' : '-2.2px', color: 'var(--ytg-text)', marginBottom: 22, textWrap: 'balance' }}>
            YouTube chapters, <span style={{ color: 'var(--ytg-accent)' }}>formatted right.</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 28px', textWrap: 'pretty' }}>
            Add your sections and times, and get a clean chapter block that passes YouTube's rules: first at 0:00, three or more, ten seconds apart. Copy and paste into your description.
          </p>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', fontWeight: 500 }}>No signup. No email. Runs in your browser.</p>
        </div>
      </section>

      {/* ══ TOOL ══ */}
      <section id="tool" className="ch-section-pad" style={{ padding: isMobile ? '48px 20px 80px' : '72px 48px 110px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div className="ch-tool-grid">

            {/* LEFT: editor + grow CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-lg)', padding: isMobile ? 22 : 30 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingLeft: 2, paddingRight: 40 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', width: 78, textAlign: 'center' }}>Time</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', flex: 1, marginLeft: 10 }}>Chapter title</span>
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
                <button className="ch-ghost" style={{ marginTop: 12 }} onClick={addRow}>+ Add chapter</button>
              </div>

              <div style={{ flex: 1, background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: 26 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Chapters help retention</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ytg-text)', lineHeight: 1.5, marginBottom: 8, letterSpacing: '-0.2px' }}>Chapters keep viewers in. Retention is what ranks.</p>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.65, marginBottom: 18 }}>
                  YTGrowth's free AI audit reads your retention curves and tells you which videos lose viewers and where, so you fix the drop-offs chapters cannot.
                </p>
                <a href="/auth/login" className="ch-btn" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 14, borderRadius: 14 }}>Get my free audit →</a>
                <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', textAlign: 'center', marginTop: 10 }}>Free trial · no card · upgrade anytime</p>
              </div>
            </div>

            {/* RIGHT: output + validity */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: isMobile ? 20 : 24, display: 'flex', flexDirection: 'column', minHeight: 360 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your chapters</span>
                  <button onClick={copy} disabled={!result.text}
                    style={{ fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, color: copied ? '#0f7a43' : 'var(--ytg-accent-text)', background: copied ? 'rgba(26,157,90,0.10)' : 'var(--ytg-accent-light)', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: result.text ? 'pointer' : 'not-allowed', opacity: result.text ? 1 : 0.5 }}>
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                {/* Validity banner */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 13px', borderRadius: 11, marginBottom: 14, background: result.ok ? 'rgba(26,157,90,0.08)' : 'rgba(201,138,0,0.10)', border: `1px solid ${result.ok ? 'rgba(26,157,90,0.18)' : 'rgba(201,138,0,0.22)'}` }}>
                  <span aria-hidden="true" style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: result.ok ? 'rgba(26,157,90,0.16)' : 'rgba(201,138,0,0.18)' }}>
                    {result.ok
                      ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5.2l2.2 2.2L8.5 2.6" stroke="#1a9d5a" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      : <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1.4v4.2M5 7.8v.2" stroke="#9a6a00" strokeWidth="1.9" strokeLinecap="round" /></svg>}
                  </span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: result.ok ? '#0f7a43' : '#9a6a00' }}>{result.ok ? 'Valid YouTube chapters' : 'Almost there'}</div>
                    {result.ok
                      ? <div style={{ fontSize: 12.5, color: 'var(--ytg-text-2)', marginTop: 2 }}>Copy and paste this into your video description.</div>
                      : <ul style={{ margin: '4px 0 0', paddingLeft: 16, fontSize: 12.5, color: 'var(--ytg-text-2)', lineHeight: 1.5 }}>{result.issues.map((iss, k) => <li key={k}>{iss}</li>)}</ul>}
                  </div>
                </div>

                {result.text ? (
                  <pre style={{ flex: 1, margin: 0, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, lineHeight: 1.7, color: 'var(--ytg-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#fafafb', border: '1px solid var(--ytg-border)', borderRadius: 12, padding: 16, overflow: 'auto', fontVariantNumeric: 'tabular-nums' }}>{result.text}</pre>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--ytg-text-3)', padding: 24, background: '#fafafb', border: '1px solid var(--ytg-border)', borderRadius: 12 }}>
                    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 17, fontWeight: 700, color: 'var(--ytg-text-2)', marginBottom: 6 }}>Your chapters will appear here</div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.6, maxWidth: 320 }}>Fill in a time and title for each section on the left.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="ch-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, maxWidth: 720 }}>
            <Eyebrow>The chapter rules</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, textWrap: 'balance' }}>
              Three rules, or <span style={{ color: 'var(--ytg-accent)' }}>no chapters at all.</span>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {[
              { h: 'The first timestamp must be 0:00', p: "Chapters only switch on when the first line of your list starts at 0:00. Miss this and YouTube ignores the whole set, so this tool defaults your first chapter to 0:00 and flags it if you change it." },
              { h: 'At least three chapters, in order', p: "You need a minimum of three timestamps, listed in ascending order. Two will not trigger chapters, and times that jump backward break the set. The validator checks both as you type." },
              { h: 'Each chapter is 10 seconds or longer', p: "Every chapter has to run at least 10 seconds, which means your timestamps must be 10 or more seconds apart. Slice too finely and chapters fail to appear." },
              { h: 'Paste into the description', p: "Once the set is valid, drop it into your video description in YouTube Studio. The chapters show on the progress bar within a short time, and you can edit them on existing videos whenever you want." },
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
      <section className="ch-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ marginBottom: 44, textAlign: 'center', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            <Eyebrow>Beyond chapters</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
              Chapters keep them watching. <span style={{ color: 'var(--ytg-accent)' }}>Get them there first.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>Retention only matters once a click happens. YTGrowth helps you win the click and the rank.</p>
          </div>
          <div className="ch-grid-3">
            {[
              { label: 'Description Generator', title: 'Build the full description', body: 'Drop your chapters into a complete, keyword-rich description with links and hashtags, in seconds.', href: '/tools/youtube-description-generator' },
              { label: 'Title Generator', title: 'Write titles that pull', body: 'Generate and score titles against the CTR signals that earn the click your chapters then hold.', href: '/tools/youtube-title-generator' },
              { label: 'AI Channel Audit', title: 'Find your drop-offs', body: 'A 10-dimension audit reads your retention curves and shows exactly where viewers leave, and what to fix.', href: '/features/channel-audit' },
            ].map((card, i) => (
              <a key={i} href={card.href} style={{ display: 'block', background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 22, padding: 30, boxShadow: 'var(--ytg-shadow-sm)', textDecoration: 'none', transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow)'; e.currentTarget.style.borderColor = 'var(--ytg-border-2)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow-sm)'; e.currentTarget.style.borderColor = 'var(--ytg-border)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>{card.label}</p>
                <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.4px', marginBottom: 12, lineHeight: 1.25 }}>{card.title}</h3>
                <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.65 }}>{card.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DARK CTA ══ */}
      <section className="ch-section-pad ch-cta-pad" style={{ padding: isMobile ? '88px 24px' : '120px 48px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', width: 1000, height: isMobile ? 600 : 800, background: 'radial-gradient(ellipse, rgba(229,48,42,0.20) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '5px 12px 5px 10px', marginBottom: 22 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 0 3px rgba(229,48,42,0.18)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Free AI audit</span>
          </div>
          <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: '#ffffff', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
            Chapters are done. <span style={{ color: '#ff3b30' }}>Fix the drop-offs.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, marginBottom: 32, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Connect your channel for a free AI audit that reads your retention curves and shows where viewers leave, plus the titles and thumbnails to fix.
          </p>
          <a href="/auth/login" className="ch-btn ch-btn-lg">Get my free audit →</a>
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
              Everything creators ask about YouTube chapters and timestamps. Still unsure? <a href="/contact" style={{ color: 'var(--ytg-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
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
                  <div className={`ch-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="ch-faq-answer-inner">
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
