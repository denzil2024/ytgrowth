import { useEffect, useState } from 'react'
import LandingFooter from '../components/LandingFooter'
import SiteHeader from '../components/SiteHeader'

/* Contact page. Migrated to the editorial design language (Fraunces +
   Barlow, sharp flat cards, warm paper, restrained red). The bottom
   "email support" card is the page's core action (a contextual contact
   CTA, not the banned generic dark band, see feedback_no_dark_cta_band),
   so it stays. See project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return { isMobile: width <= 768 }
}

function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-contact-styles')) return
    const style = document.createElement('style')
    style.id = 'ytg-contact-styles'
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
      @keyframes ctFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .contact-wrap { max-width: 1080px; margin: 0 auto; }
      .ct-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .ct-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .ct-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .ct-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.05; }
      .ct-h1 em { font-style: italic; color: var(--yte-accent); }
      .ct-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .ct-h2 em { font-style: italic; color: var(--yte-accent); }
      .ct-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .contact-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--yte-accent); color: #fff; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 15px 30px; border: none; border-radius: 0; cursor: pointer; text-decoration: none; transition: filter 0.18s, transform 0.18s; }
      .contact-btn:hover { filter: brightness(1.06); transform: translateY(-1px); }
      .contact-btn-lg { font-size: 13px; padding: 17px 36px; }
      .contact-btn-full { width: 100%; }

      .contact-ghost { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 15px 28px; border-radius: 0; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--yte-soft); text-decoration: none; background: var(--yte-surface); border: 1px solid var(--yte-line); transition: color 0.15s, border-color 0.15s; }
      .contact-ghost:hover { color: var(--yte-ink); border-color: var(--yte-line-2); }

      .contact-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      .contact-card { background: var(--yte-surface); padding: 30px; transition: background 0.15s; }
      .contact-card:hover { background: var(--yte-bg-2); }

      @media (max-width: 900px) {
        .contact-grid-3 { grid-template-columns: 1fr; }
        .contact-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
      }
      @media (max-width: 768px) {
        .contact-section-pad { padding-left: 22px !important; padding-right: 22px !important; }
        .contact-stats-inner { gap: 28px 20px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

/* Thin red scroll progress bar. */
function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 999 }}>
      <div style={{ height: '100%', width: `${progress}%`, background: 'var(--yte-accent)', transition: 'width 0.08s linear' }} />
    </div>
  )
}

/* Stroke-icon set for the reasons grid. */
const ICON_PROPS = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }

function BillingIcon()   { return (<svg {...ICON_PROPS}><rect x="2.5" y="6" width="19" height="13" rx="2"/><line x1="2.5" y1="10" x2="21.5" y2="10"/><line x1="6.5" y1="15" x2="10.5" y2="15"/></svg>) }
function WrenchIcon()    { return (<svg {...ICON_PROPS}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>) }
function LightbulbIcon() { return (<svg {...ICON_PROPS}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8a6 6 0 0 0-12 0c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>) }
function HelpIcon()      { return (<svg {...ICON_PROPS}><circle cx="12" cy="12" r="9.5"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>) }
function LinkIcon()      { return (<svg {...ICON_PROPS}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>) }
function MegaphoneIcon() { return (<svg {...ICON_PROPS}><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>) }

const REASONS = [
  {
    Icon: BillingIcon,
    title: 'Billing & payments',
    desc: 'Questions about charges, invoices, plan upgrades, or cancellations. We can also issue manual adjustments if something went wrong.',
    tag: 'Most common',
    tagColor: '#1e40af',
  },
  {
    Icon: WrenchIcon,
    title: 'Technical support',
    desc: 'An analysis that didn\'t run, an error you can\'t explain, or something behaving unexpectedly. Include a screenshot if you can.',
    tag: null,
    tagColor: null,
  },
  {
    Icon: LightbulbIcon,
    title: 'Feature requests',
    desc: 'An idea for something we should build or improve. Every request gets read and logged. The best ones ship.',
    tag: 'We love these',
    tagColor: '#0f7a43',
  },
  {
    Icon: HelpIcon,
    title: 'General questions',
    desc: 'Not sure how something works, what\'s included in your plan, or whether YTGrowth is right for your channel? Ask.',
    tag: null,
    tagColor: null,
  },
  {
    Icon: LinkIcon,
    title: 'Press & partnerships',
    desc: 'Media enquiries, brand collaborations, or affiliate program questions. We\'re open to the right partnerships.',
    tag: null,
    tagColor: null,
  },
  {
    Icon: MegaphoneIcon,
    title: 'Feedback',
    desc: 'Loved something? Hated something? Both are equally useful. Honest feedback is how we get better.',
    tag: null,
    tagColor: null,
  },
]

const STEPS = [
  {
    n: '01',
    title: 'You email us, anything',
    body: 'Write support@ytgrowth.io from any address. One line or ten paragraphs. Attach a screenshot or don\'t. We\'ll figure it out from whatever you send.',
  },
  {
    n: '02',
    title: 'A human reads it, personally',
    body: 'No auto-responder. No ticket queue. No "your issue has been assigned ticket #48219" email. One of us opens your message and reads it through, usually within the hour.',
  },
  {
    n: '03',
    title: 'You get a real reply',
    body: 'Usually in under 4 hours during our working day. With an actual answer, a fix, or a follow-up question, not a templated reply that ignores what you wrote.',
  },
]

export default function Contact() {
  useGlobalStyles()
  useEffect(() => { document.title = 'Contact, YTGrowth' }, [])
  const { isMobile } = useBreakpoint()

  const H2 = isMobile ? 28 : 40

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', minHeight: '100vh' }}>

      <ScrollProgress />

      {/* ── NAV, shared SiteHeader ── */}
      <SiteHeader />

      {/* ══ SECTION 1, HERO (text + direct-line card) ══ */}
      <section className="contact-section-pad" style={{ padding: isMobile ? '56px 22px 52px' : '100px 48px 80px', background: 'var(--yte-bg)' }}>
        <div className="contact-wrap">
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.05fr 0.95fr', gap: isMobile ? 40 : 64, alignItems: 'center' }}>

            {/* LEFT, copy */}
            <div style={{ animation: 'ctFadeUp 0.5s ease both' }}>
              <div className="ct-eyebrow">
                <span aria-hidden="true" className="ct-eyebrow-rule" />
                <span className="ct-eyebrow-text">Contact</span>
              </div>
              <h1 className="ct-h1" style={{ fontSize: isMobile ? 34 : 52, marginBottom: 22, textWrap: 'balance' }}>
                Real people. Same-day replies. <em>No ticket queues.</em>
              </h1>
              <p className="ct-lead" style={{ fontSize: isMobile ? 16 : 17.5, maxWidth: 520, marginBottom: 12, textWrap: 'pretty' }}>
                One inbox. One human at the other end. Write anything, a bug, a billing question, a feature idea, or just hello, and we'll reply with an actual answer, usually within 4 hours.
              </p>
              <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-muted)' }}>
                No auto-responders. No forms to fill. No routing bots.
              </p>
            </div>

            {/* RIGHT, direct-line card */}
            <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', padding: isMobile ? 28 : 38, animation: 'ctFadeUp 0.5s ease 0.08s both' }}>
              <div className="ct-eyebrow" style={{ marginBottom: 16 }}>
                <span aria-hidden="true" className="ct-eyebrow-rule" />
                <span className="ct-eyebrow-text">Direct line</span>
              </div>
              <a href="mailto:support@ytgrowth.io" style={{ display: 'inline-block', fontFamily: SERIF, fontSize: isMobile ? 26 : 32, fontWeight: 400, letterSpacing: '-0.6px', color: 'var(--yte-ink)', textDecoration: 'none', lineHeight: 1.15, marginBottom: 10, wordBreak: 'break-word' }}>
                support@ytgrowth.io
              </a>
              <p style={{ fontFamily: SANS, fontSize: 14, color: 'var(--yte-soft)', lineHeight: 1.6, marginBottom: 24 }}>
                One human reads every message and replies, usually within four hours, seven days a week.
              </p>
              <div style={{ borderTop: '1px solid var(--yte-line)', paddingTop: 20, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['Reply time', 'Under 4 hours'],
                  ['Coverage', '7 days a week'],
                  ['Answered by', 'Real humans only'],
                ].map(([k, v], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                    <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k}</span>
                    <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: 'var(--yte-ink)' }}>{v}</span>
                  </div>
                ))}
              </div>
              <a href="mailto:support@ytgrowth.io" className="contact-btn contact-btn-full">
                Email us →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTION 2, STATS BAR ══ */}
      <section style={{ background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)', padding: isMobile ? '48px 24px' : '56px 48px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="contact-stats-inner contact-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', alignItems: 'flex-start', gap: 32 }}>
            {[
              { value: '< 4h',  label: 'Median reply time',        sub: 'Weekdays, during working hours' },
              { value: '100%',  label: 'Emails that get a reply',  sub: 'No exceptions, ever' },
              { value: '0',     label: 'Auto-responders or bots',  sub: 'Only humans answer your email' },
              { value: '7d',    label: 'Inbox monitored',          sub: 'Urgent issues handled at weekends too' },
            ].map((s, i) => (
              <div key={i} style={{ minWidth: 120 }}>
                <div style={{ fontFamily: SERIF, fontSize: isMobile ? 34 : 42, fontWeight: 400, letterSpacing: '-0.8px', color: 'var(--yte-ink)', lineHeight: 1, marginBottom: 10 }}>{s.value}</div>
                <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: 'var(--yte-ink)', marginBottom: 5 }}>{s.label}</div>
                <div style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', lineHeight: 1.5 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 3, HOW IT WORKS ══ */}
      <section id="contact-how" className="contact-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="contact-wrap">
          <div style={{ marginBottom: 40, maxWidth: 680 }}>
            <div className="ct-eyebrow">
              <span aria-hidden="true" className="ct-eyebrow-rule" />
              <span className="ct-eyebrow-text">How it works</span>
            </div>
            <h2 className="ct-h2" style={{ fontSize: H2, textWrap: 'balance' }}>
              No tickets. <em>Just email and a reply.</em>
            </h2>
          </div>
          <div className="contact-grid-3">
            {STEPS.map((step, i) => (
              <div key={i} className="contact-card">
                <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: 'var(--yte-accent)', letterSpacing: '0.06em', marginBottom: 20 }}>{step.n}</div>
                <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: 'var(--yte-ink)', marginBottom: 12, letterSpacing: '-0.2px', lineHeight: 1.2 }}>{step.title}</div>
                <div style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.7 }}>{step.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 4, REASONS GRID ══ */}
      <section className="contact-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="contact-wrap">
          <div style={{ marginBottom: 40, maxWidth: 680 }}>
            <div className="ct-eyebrow">
              <span aria-hidden="true" className="ct-eyebrow-rule" />
              <span className="ct-eyebrow-text">Why people reach out</span>
            </div>
            <h2 className="ct-h2" style={{ fontSize: H2, marginBottom: 12, textWrap: 'balance' }}>
              No question is <em>too small.</em>
            </h2>
            <p className="ct-lead" style={{ fontSize: 17 }}>
              Here's what usually lands in our inbox. If your reason isn't listed, email anyway, we'll figure out where it needs to go.
            </p>
          </div>

          <div className="contact-grid-3">
            {REASONS.map((r, i) => (
              <div key={i} className="contact-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ width: 46, height: 46, background: 'rgba(20,19,15,0.05)', color: 'var(--yte-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <r.Icon />
                  </div>
                  {r.tag && (
                    <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--yte-soft)', background: 'rgba(20,19,15,0.05)', padding: '4px 10px' }}>
                      {r.tag}
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.2px', marginBottom: 10, lineHeight: 1.2 }}>{r.title}</p>
                <p style={{ fontFamily: SANS, fontSize: 14, color: 'var(--yte-soft)', lineHeight: 1.7 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />

    </div>
  )
}
