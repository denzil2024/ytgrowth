import { useEffect, useState } from 'react'
import LandingFooter from '../components/LandingFooter'
import SiteHeader from '../components/SiteHeader'
import { injectFaqJsonLd } from '../utils/seo'
import founderImg from '../assets/founder.jpg'

/* About page. Editorial design system (Fraunces + Barlow, warm paper, sharp
   hairline cards, restrained red). Spine: a thesis, the founder's real story
   (Denzil), proof the product is real, what we believe, the compounding moat,
   concrete numbers, FAQ, light closing band. See project_design_language_editorial,
   feedback_no_bold_body_paragraphs, feedback_no_dark_cta_band (closing band is a
   light tint), feedback_no_italics (the one Fraunces red em keyword is sanctioned
   by the design system), feedback_no_actually. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

function useBreakpoint() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return { isMobile: w <= 800 }
}

function useStyles() {
  useEffect(() => {
    if (document.getElementById('ab-styles')) return
    const style = document.createElement('style')
    style.id = 'ab-styles'
    style.textContent = `
      :root {
        --yte-bg: #f6f4ef; --yte-bg-alt: #efece4; --yte-surface: #ffffff;
        --yte-ink: #14130f; --yte-soft: #5c574e; --yte-muted: #8a8378;
        --yte-bd: rgba(20,19,15,0.12); --yte-bd-2: rgba(20,19,15,0.22);
        --yte-line: rgba(20,19,15,0.12); --yte-bg-2: #efece4;
        --yte-accent: #e5302a; --yte-glow: rgba(229,48,42,0.06); --yte-accent-b: rgba(229,48,42,0.20);
        --yte-dark: #0d0d12; --yte-gold: #e6b35c;
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; scroll-padding-top: 84px; }
      body { background: var(--yte-bg); color: var(--yte-ink); font-family: ${SANS}; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
      @keyframes abFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .ab-wrap { max-width: 1120px; margin: 0 auto; padding: 0 48px; }
      .ab-sec { padding: 92px 0; }
      .ab-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .ab-erule { width: 26px; height: 1px; background: var(--yte-accent); }
      .ab-elabel { font: 600 11px/1 ${SANS}; letter-spacing: 0.18em; text-transform: uppercase; color: var(--yte-accent); }
      .ab-sectitle { font: 300 clamp(30px, 4vw, 44px)/1.1 ${SERIF}; letter-spacing: -0.01em; color: var(--yte-ink); max-width: 760px; }
      .ab-sublead { margin-top: 16px; font-size: 17px; line-height: 1.75; color: var(--yte-soft); max-width: 640px; }
      .ab-red { color: var(--yte-accent); font-style: italic; }

      /* hero */
      .ab-h1 { font: 300 clamp(38px, 5.4vw, 58px)/1.05 ${SERIF}; letter-spacing: -0.02em; color: var(--yte-ink); margin-bottom: 24px; max-width: 900px; }
      .ab-hlead { font-size: 18px; line-height: 1.75; color: var(--yte-soft); max-width: 680px; }

      /* founder story */
      .ab-founder { display: grid; grid-template-columns: 320px 1fr; gap: 60px; align-items: start; margin-top: 12px; }
      .ab-founder-media { position: sticky; top: 100px; }
      .ab-founder-photo { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; display: block; border: 1px solid var(--yte-bd); background: var(--yte-bg-alt); filter: grayscale(1) contrast(1.02); }
      .ab-founder-name { margin-top: 18px; font: 400 26px/1.1 ${SERIF}; color: var(--yte-ink); }
      .ab-founder-role { margin-top: 6px; font: 700 11px/1.3 ${SANS}; letter-spacing: 0.14em; text-transform: uppercase; color: var(--yte-muted); }
      .ab-founder-body p { font-size: 16.5px; line-height: 1.82; color: var(--yte-soft); margin-bottom: 20px; }
      .ab-founder-body p:last-child { margin-bottom: 0; }
      .ab-pullquote { margin: 30px 0; padding-left: 26px; border-left: 2px solid var(--yte-accent); font: 300 clamp(24px, 2.8vw, 32px)/1.28 ${SERIF}; color: var(--yte-ink); letter-spacing: -0.01em; }
      .ab-sign { margin-top: 30px; padding-top: 22px; border-top: 1px solid var(--yte-bd); display: flex; align-items: baseline; gap: 12px; }
      .ab-sign-name { font: 400 20px/1 ${SERIF}; color: var(--yte-ink); }
      .ab-sign-role { font: 700 10.5px/1 ${SANS}; letter-spacing: 0.14em; text-transform: uppercase; color: var(--yte-muted); }

      /* product proof — priority-action split (duplicated from features/ChannelAudit) */
      .ab-split { display: grid; grid-template-columns: 1.15fr 1fr; gap: 56px; align-items: center; margin-top: 40px; }
      .ab-split-lead { font-size: 17px; line-height: 1.72; color: var(--yte-soft); margin: 16px 0 26px; max-width: 520px; }
      .ab-split-4 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
      .ab-split-4 .lbl { font: 700 11px/1 ${SANS}; letter-spacing: 0.08em; text-transform: uppercase; color: var(--yte-accent); margin-bottom: 6px; }
      .ab-split-4 .bd { font-size: 13px; line-height: 1.6; color: var(--yte-soft); }
      .ab-grid-3 { display: grid; grid-template-columns: 1fr 1.4fr 1fr; gap: 8px; margin-left: 46px; }

      /* beliefs — editorial divided row */
      .ab-pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; margin-top: 34px; border-top: 1px solid var(--yte-bd); }
      .ab-pillar { padding: 30px 30px 26px 30px; border-left: 1px solid var(--yte-bd); }
      .ab-pillar:nth-child(3n+1) { border-left: none; padding-left: 0; }
      .ab-pn { font: 700 9px/1 ${SANS}; letter-spacing: 0.14em; color: var(--yte-accent); text-transform: uppercase; margin-bottom: 8px; }
      .ab-pv { font: 400 23px/1.15 ${SERIF}; color: var(--yte-ink); }
      .ab-pd { margin-top: 12px; font-size: 14px; line-height: 1.65; color: var(--yte-soft); }

      /* moat — numbered flow */
      .ab-moat { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-top: 40px; }
      .ab-moat-item { }
      .ab-moat-n { font: 300 40px/1 ${SERIF}; color: var(--yte-accent); }
      .ab-moat-t { margin-top: 16px; font: 400 20px/1.2 ${SERIF}; color: var(--yte-ink); }
      .ab-moat-d { margin-top: 12px; font-size: 15px; line-height: 1.72; color: var(--yte-soft); }

      /* proof numbers band */
      .ab-proof { background: var(--yte-surface); border-top: 1px solid var(--yte-bd); border-bottom: 1px solid var(--yte-bd); }
      .ab-proof-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
      .ab-proof-cell { padding: 46px 34px; border-left: 1px solid var(--yte-bd); }
      .ab-proof-cell:first-child { border-left: none; padding-left: 0; }
      .ab-proof-n { font: 300 44px/1 ${SERIF}; color: var(--yte-ink); letter-spacing: -0.01em; }
      .ab-proof-plus { color: var(--yte-ink); }
      .ab-proof-l { margin-top: 10px; font: 700 11px/1.3 ${SANS}; letter-spacing: 0.1em; text-transform: uppercase; color: var(--yte-accent); }
      .ab-proof-d { margin-top: 10px; font-size: 13px; line-height: 1.6; color: var(--yte-soft); }

      /* faq accordion */
      .ab-faq { margin-top: 8px; max-width: 820px; }
      .ab-faq-item { border-bottom: 1px solid var(--yte-bd); }
      .ab-faq-q { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; background: none; border: none; text-align: left; cursor: pointer; padding: 22px 0; font: 500 17px/1.45 ${SANS}; color: var(--yte-ink); transition: color 0.2s; }
      .ab-faq-q:hover, .ab-faq-item.open .ab-faq-q { color: var(--yte-accent); }
      .ab-faq-ic { flex-shrink: 0; font: 300 26px/1 ${SANS}; color: var(--yte-accent); transition: transform 0.2s; }
      .ab-faq-item.open .ab-faq-ic { transform: rotate(45deg); }
      .ab-faq-a { padding: 0 0 24px; max-width: 720px; font-size: 15px; line-height: 1.8; color: var(--yte-soft); display: none; }
      .ab-faq-item.open .ab-faq-a { display: block; }

      @media (max-width: 800px) {
        .ab-wrap { padding: 0 22px; }
        .ab-sec { padding: 58px 0; }
        .ab-h1 { font-size: 40px; }
        .ab-hlead { font-size: 17px; }
        .ab-founder { grid-template-columns: 1fr; gap: 30px; }
        .ab-founder-media { position: static; top: auto; max-width: 260px; }
        .ab-split { grid-template-columns: 1fr; gap: 34px; }
        .ab-grid-3 { grid-template-columns: 1fr; margin-left: 0; }
        .ab-pillars, .ab-moat, .ab-proof-grid { grid-template-columns: 1fr; }
        .ab-pillar { border-left: none; border-top: 1px solid var(--yte-bd); padding: 24px 0 6px; }
        .ab-pillar:first-child { border-top: none; padding-top: 6px; }
        .ab-moat { gap: 30px; }
        .ab-proof-cell { border-left: none; border-top: 1px solid var(--yte-bd); padding: 30px 0; }
        .ab-proof-cell:first-child { border-top: none; padding-top: 0; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children }) {
  return (
    <div className="ab-eyebrow">
      <span aria-hidden="true" className="ab-erule" />
      <span className="ab-elabel">{children}</span>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`ab-faq-item${open ? ' open' : ''}`}>
      <button className="ab-faq-q" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>{q}</span>
        <span aria-hidden="true" className="ab-faq-ic">+</span>
      </button>
      <div className="ab-faq-a">{a}</div>
    </div>
  )
}

/* Priority-action card, duplicated from features/ChannelAudit.jsx (PriorityActionVisual).
   A real diagnosis: the problem in the channel's own numbers, why it matters now,
   the exact fix, and the metric that moves. This is what an answer looks like. */
function PriorityActionVisual() {
  return (
    <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', borderTop: '3px solid var(--yte-accent)', padding: '20px 24px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingTop: 2 }}>
          <input type="checkbox" readOnly style={{ width: 15, height: 15, accentColor: '#14130f' }} />
          <div style={{ width: 26, height: 26, background: 'var(--yte-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#fff' }}>1</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: 'var(--yte-accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>CTR Health</p>
          <p style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 600, color: 'var(--yte-ink)', lineHeight: 1.5 }}>
            Browse + Suggested traffic at 31%, well below the 40% threshold for healthy algo push. Your packaging (titles + thumbnails) isn't earning impressions.
          </p>
        </div>
        <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: 'var(--yte-accent)', padding: '3px 9px', letterSpacing: '0.08em', textTransform: 'uppercase', border: '1.5px solid var(--yte-accent)', flexShrink: 0 }}>HIGH</span>
      </div>
      <div style={{ height: 1, background: 'var(--yte-line)', marginBottom: 14, marginLeft: 46 }} />
      <div className="ab-grid-3">
        <div style={{ background: 'var(--yte-bg-2)', padding: '12px 14px' }}>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: 'var(--yte-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Why now</p>
          <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-soft)', lineHeight: 1.6 }}>If browse + suggested stays under 40% for another 30 days, the algorithm classifies your videos as "low-value" and stops surfacing them entirely.</p>
        </div>
        <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', borderLeft: '3px solid var(--yte-accent)', padding: '12px 16px' }}>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: 'var(--yte-accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Action</p>
          <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-ink)', lineHeight: 1.6 }}>Re-do thumbnails on your last 3 uploads using high-contrast text (4.5:1 minimum) and a face occupying 35–50% of frame. Score each in Thumbnail IQ before applying.</p>
        </div>
        <div style={{ background: 'var(--yte-bg-2)', padding: '12px 14px' }}>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: 'var(--yte-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Expected outcome</p>
          <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-soft)', lineHeight: 1.6 }}>CTR climbs from 3.4% to ~5%, browse share rises to 38–45% within 14–21 days as the algorithm re-tests your videos.</p>
        </div>
      </div>
    </div>
  )
}

const ANATOMY = [
  { label: 'Problem',          body: 'The specific issue, with a real number pulled from your data.' },
  { label: 'Why now',          body: 'What breaks if you leave it for the next 14 to 30 days.' },
  { label: 'Action',           body: 'The exact, do-able step. No vague advice to interpret.' },
  { label: 'Expected outcome', body: 'The metric that will move, and roughly by how much.' },
]

const PILLARS = [
  { n: 'Principle 01', v: 'Clarity over volume', d: 'You do not need more charts. You need to know the one thing worth doing next. Every screen names it and drops the rest.' },
  { n: 'Principle 02', v: 'Focus over features', d: 'Every tool earns its place or it gets cut. Fewer, sharper features instead of a wall of badges that all look important and change nothing.' },
  { n: 'Principle 03', v: 'Honesty over hype', d: 'Live data from the official YouTube API, aggregate patterns never individuals, and straight answers even when they are the unflattering ones.' },
]

const MOAT = [
  { n: '01', t: 'Grounded in official data', d: 'Every number comes from the official YouTube Data API, current at the moment you ask. No estimates, no scraped guesses, no made-up scores.' },
  { n: '02', t: 'Research that compounds', d: 'A shared, cached data layer means the platform gets faster and sharper the more creators use it. The questions people ask most are answered instantly, for everyone.' },
  { n: '03', t: 'Patterns, never people', d: 'YTGrowth surfaces aggregate signal across the creator base. It never exposes individuals or their private work. It learns from the crowd, not from you specifically.' },
]

const PROOF = [
  { n: '15', plus: true, l: 'Free tools', d: 'Calculators, generators, and research surfaces, all free and client-side.' },
  { n: '6', plus: true, l: 'Deep features', d: 'Channel audit, competitor intel, SEO, thumbnails, keywords, outliers.' },
  { n: 'API', l: 'Official, read-only', d: 'We connect through YouTube and can never edit, upload, or delete anything.' },
  { n: 'Free', l: 'To start, no card', d: 'Real results before any paywall. Research and decide before you pay.' },
]

const FAQS = [
  { q: 'How is YTGrowth different from vidIQ or TubeBuddy?', a: <>Those are browser extensions that score every metric and leave you to interpret a wall of badges. YTGrowth runs a full audit of your channel, names the single bottleneck in plain English, and hands you a ranked list of what to fix first. The output is a decision, not another dashboard to read.</> },
  { q: 'Can YTGrowth change anything on my channel?', a: <>No. We connect through the official YouTube Data API using a read-only OAuth scope, so the product can only read public and analytics data. It cannot upload, edit, comment, or delete anything. You can revoke access at any time from your Google account security settings.</> },
  { q: 'Do I have to connect my channel to use it?', a: <>Only for the channel-connected features. The 15 free tools (calculators, generators, keyword and competitor research) run in your browser on public data and need no account or sign-in. The channel audit and the deeper features ask for read-only access so they can analyze your own numbers.</> },
  { q: 'What does YTGrowth cost?', a: <>The research tools are free with no account. Creating a free account gives you audit credits to run a full channel audit and try the connected features. Ongoing, heavier use, such as re-running audits and tracking competitors over time, is on a paid plan you can start or cancel anytime. Full breakdown is on the pricing page.</> },
  { q: 'Is my data ever sold or shared?', a: <>No. YTGrowth learns from aggregate patterns across the creator base to make research faster and sharper for everyone, but it never exposes an individual channel to other users and never sells your data. What is yours stays yours.</> },
  { q: 'Is this a real business or a side project?', a: <>A real business, and it ships continuously. YTGrowth was founded by Denzil Otieno and is run by a small, deliberately lean team: co-founders based in the United States and collaborators spread globally. Running lean is a choice, not a limitation. It means no feature committees and no pressure to bolt on whatever a competitor launched last week, so every release has to earn its place by moving growth.</> },
]

export default function About() {
  useStyles()
  useEffect(() => {
    document.title = 'About YTGrowth'
    const desc = 'About YTGrowth: an independent YouTube research and optimization studio founded by Denzil Otieno on one idea, that better information beats more of it. Meet the founder and the philosophy behind the product.'
    let tag = document.querySelector('meta[name="description"]')
    if (!tag) { tag = document.createElement('meta'); tag.setAttribute('name', 'description'); document.head.appendChild(tag) }
    tag.setAttribute('content', desc)
    injectFaqJsonLd(FAQS)
  }, [])
  useBreakpoint()

  return (
    <div style={{ background: 'var(--yte-bg)', minHeight: '100vh', fontFamily: SANS, color: 'var(--yte-ink)' }}>

      <SiteHeader />

      {/* ════ HERO ════ */}
      <section className="ab-sec" style={{ paddingTop: 108, paddingBottom: 76 }}>
        <div className="ab-wrap" style={{ animation: 'abFadeUp 0.5s ease both' }}>
          <Eyebrow>Why we exist</Eyebrow>
          <h1 className="ab-h1">
            Every creator is drowning in data. Almost none of it tells them <span className="ab-red">what to do next.</span>
          </h1>
          <p className="ab-hlead">
            YTGrowth is a YouTube research and optimization platform for serious creators. It reads your channel through the official YouTube API and runs a full audit across the signals that decide whether you grow: click-through, retention, posting consistency, discoverability, engagement, and where your traffic really comes from. Those become one honest health score and a ranked list of fixes, starting with the single change that moves the needle most.
          </p>
          <p className="ab-hlead" style={{ marginTop: 18 }}>
            Around that audit sit competitor intelligence, SEO, thumbnail scoring, keyword research, and outlier detection, plus a full suite of free tools that need no account. One idea runs through all of it: you do not need more information, you need better information, and it should always end in a decision. Here is who builds it, and why.
          </p>
        </div>
      </section>

      {/* ════ FOUNDER STORY ════ */}
      <section className="ab-sec" style={{ background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-bd)', paddingTop: 84 }}>
        <div className="ab-wrap">
          <Eyebrow>The founder</Eyebrow>
          <div className="ab-founder">
            <div className="ab-founder-media">
              <img className="ab-founder-photo" src={founderImg} alt="Denzil Otieno, founder of YTGrowth" width="320" height="320" />
              <div className="ab-founder-name">Denzil Otieno</div>
              <div className="ab-founder-role">Founder, YTGrowth</div>
            </div>
            <div className="ab-founder-body">
              <p>Most YouTube tools exist to sell subscriptions. They bundle features, add metrics, and call it progress. The problems that decide whether a channel grows get buried underneath: understanding your competitive dynamics, seeing where growth is genuinely possible, and knowing what to act on first.</p>
              <p>Denzil spent years building products and watching how this industry works, and the pattern never changes. Creators are drowning in data but starving for insight. The tools measure everything and clarify nothing.</p>
              <div className="ab-pullquote">You do not need more information. You need better information.</div>
              <p>YTGrowth came out of that gap. Better information is the kind that separates what is working from what only looks impressive. The kind that shows where your competition is weak and where the opening really sits. Every feature serves that purpose, and everything else is gone.</p>
              <p>Denzil runs YTGrowth with co-founders based in the United States and a team of collaborators spread across the world. The team stays deliberately lean. No approval layers, no feature committees, no pressure to chase whatever a competitor shipped last week. The only question that decides what goes out is whether it moves growth. The work draws on years across content operations, automation architecture, and SaaS development, and that range is where the instinct for clarity and simplicity comes from.</p>
              <p>YTGrowth is built for creators running serious operations. Not hobbyists. The people who need tools that work.</p>
              <div className="ab-sign">
                <span className="ab-sign-name">Denzil Otieno</span>
                <span className="ab-sign-role">Founder</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ PRODUCT PROOF — priority-action anatomy (from features/ChannelAudit) ════ */}
      <section className="ab-sec">
        <div className="ab-wrap">
          <div className="ab-split">
            <div><PriorityActionVisual /></div>
            <div>
              <Eyebrow>The product</Eyebrow>
              <h2 className="ab-sectitle">This is what <span className="ab-red">an answer</span> looks like.</h2>
              <p className="ab-split-lead">No wall of charts to interpret. Every priority action has four parts: the problem in your own numbers, why it matters now, the exact step to take, and the metric that will move. You do not just learn what is wrong, you learn what to do about it.</p>
              <div className="ab-split-4">
                {ANATOMY.map((p, i) => (
                  <div key={i} style={{ borderLeft: '2px solid var(--yte-accent)', paddingLeft: 12 }}>
                    <p className="lbl">{p.label}</p>
                    <p className="bd">{p.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ WHAT WE BELIEVE ════ */}
      <section className="ab-sec" style={{ background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-bd)' }}>
        <div className="ab-wrap">
          <Eyebrow>What we stand for</Eyebrow>
          <h2 className="ab-sectitle">Three beliefs the whole product answers to.</h2>
          <div className="ab-pillars">
            {PILLARS.map((p, i) => (
              <div key={i} className="ab-pillar">
                <div className="ab-pn">{p.n}</div>
                <div className="ab-pv">{p.v}</div>
                <p className="ab-pd">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ HOW IT COMPOUNDS (moat) ════ */}
      <section className="ab-sec">
        <div className="ab-wrap">
          <Eyebrow>Why it gets better</Eyebrow>
          <h2 className="ab-sectitle">The product compounds while you sleep.</h2>
          <p className="ab-sublead">The heavy work is a shared, cached research layer. It is what keeps the core free, the answers fast, and the platform sharper every week without a single new release.</p>
          <div className="ab-moat">
            {MOAT.map((m, i) => (
              <div key={i} className="ab-moat-item">
                <div className="ab-moat-n">{m.n}</div>
                <div className="ab-moat-t">{m.t}</div>
                <p className="ab-moat-d">{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ PROOF NUMBERS ════ */}
      <section className="ab-proof">
        <div className="ab-wrap">
          <div className="ab-proof-grid">
            {PROOF.map((p, i) => (
              <div key={i} className="ab-proof-cell">
                <div className="ab-proof-n">{p.n}{p.plus && <span className="ab-proof-plus">+</span>}</div>
                <div className="ab-proof-l">{p.l}</div>
                <p className="ab-proof-d">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FAQ ════ */}
      <section className="ab-sec">
        <div className="ab-wrap">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="ab-sectitle">YTGrowth, answered honestly.</h2>
          <div className="ab-faq">
            {FAQS.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
