import { useEffect, useState } from 'react'
import LandingFooter from '../components/LandingFooter'

function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return { isMobile: width <= 768 }
}

function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="#ff3b30"/>
      <path d="M23.2 11.6a2.1 2.1 0 0 0-1.48-1.48C20.55 9.8 16 9.8 16 9.8s-4.55 0-5.72.32A2.1 2.1 0 0 0 8.8 11.6 22 22 0 0 0 8.5 16a22 22 0 0 0 .3 4.4 2.1 2.1 0 0 0 1.48 1.48C11.45 22.2 16 22.2 16 22.2s4.55 0 5.72-.32a2.1 2.1 0 0 0 1.48-1.48A22 22 0 0 0 23.5 16a22 22 0 0 0-.3-4.4z" fill="white"/>
      <polygon points="13.5,19 19.5,16 13.5,13" fill="#ff3b30"/>
    </svg>
  )
}

function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-contact-styles')) return
    // DM Sans for display headings + Inter for body — same font pair Landing
    // and Affiliate use. This page is a direct sibling to those two.
    const link = document.createElement('link')
    link.id = 'ytg-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytg-contact-styles'
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
        /* Canonical app red */
        --ytg-accent:       #e5251b;
        --ytg-accent-text:  #b91c1c;
        --ytg-accent-light: rgba(229,37,27,0.07);
        --ytg-shadow-sm:    0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
        --ytg-shadow:       0 2px 6px rgba(0,0,0,0.08), 0 10px 32px rgba(0,0,0,0.11);
        --ytg-shadow-lg:    0 4px 16px rgba(0,0,0,0.11), 0 24px 60px rgba(0,0,0,0.14);
        --ytg-shadow-xl:    0 8px 28px rgba(0,0,0,0.13), 0 40px 100px rgba(0,0,0,0.17);
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 5px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background: rgba(10,10,15,0.16); border-radius: 10px }

      @keyframes fadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      /* Button pattern — copied verbatim from Affiliate's .aff-btn so CTAs
         read identically across the marketing site. */
      .contact-btn {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
        padding: 15px 36px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.14), 0 4px 20px rgba(229,37,27,0.38);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .contact-btn:hover {
        filter: brightness(1.07); transform: translateY(-1px);
        box-shadow: 0 3px 8px rgba(0,0,0,0.16), 0 12px 36px rgba(229,37,27,0.46);
      }
      .contact-btn-lg   { font-size: 16px; padding: 17px 44px; }
      .contact-btn-full { width: 100%; justify-content: center; }

      .contact-section-label {
        display: inline-block; font-size: 11px; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: var(--ytg-accent-text); background: var(--ytg-accent-light);
        padding: 5px 13px; border-radius: 100px; margin-bottom: 16px;
      }

      .contact-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }

      .contact-nav-link {
        font-size: 14px; color: var(--ytg-text-3); font-weight: 500;
        text-decoration: none; transition: color 0.15s; letter-spacing: -0.1px;
      }
      .contact-nav-link:hover { color: var(--ytg-text-2); }

      .contact-card {
        background: var(--ytg-card);
        border-radius: 18px;
        border: 1px solid var(--ytg-border);
        box-shadow: var(--ytg-shadow-lg);
        padding: 36px;
        transition: box-shadow 0.22s, transform 0.22s;
      }
      .contact-card:hover {
        box-shadow: var(--ytg-shadow-xl);
        transform: translateY(-3px);
      }

      @media (max-width: 900px) {
        .contact-grid-3 { grid-template-columns: 1fr; }
        .contact-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
      }
      @media (max-width: 768px) {
        .contact-hero-h1   { font-size: 34px !important; letter-spacing: -1px !important; }
        .contact-section-h2 { font-size: 28px !important; letter-spacing: -0.8px !important; }
        .contact-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .contact-stats-inner { gap: 20px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

/* Thin red scroll progress bar — same pattern as Affiliate. */
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
      <div style={{ height: '100%', width: `${progress}%`, background: 'var(--ytg-accent)', transition: 'width 0.08s linear', borderRadius: '0 2px 2px 0' }} />
    </div>
  )
}

/* Filled check — mirrors Affiliate's Check icon (Affiliate.jsx:219). */
function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="9" fill="rgba(229,37,27,0.1)" />
      <path d="M5 9l3 3 5-5" stroke="#e5251b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* Stroke-icon set for the reasons grid — matches the app's SVG icon
   language (Dashboard nav, SEO Studio pills, Landing feature tiles). */
const ICON_PROPS = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }

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
    tagColor: '#0a84ff',
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
    tagColor: '#16a34a',
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
    title: 'You email us — anything',
    body: 'Write support@ytgrowth.io from any address. One line or ten paragraphs. Attach a screenshot or don\'t. We\'ll figure it out from whatever you send.',
  },
  {
    n: '02',
    title: 'A human reads it — personally',
    body: 'No auto-responder. No ticket queue. No "your issue has been assigned ticket #48219" email. One of us opens your message and reads it through, usually within the hour.',
  },
  {
    n: '03',
    title: 'You get a real reply',
    body: 'Usually in under 4 hours during our working day. With an actual answer, a fix, or a follow-up question — not a templated reply that ignores what you wrote.',
  },
]

export default function Contact() {
  useGlobalStyles()
  useEffect(() => { document.title = 'Contact — YTGrowth' }, [])
  const { isMobile } = useBreakpoint()

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', minHeight: '100vh' }}>

      <ScrollProgress />

      {/* ── NAV ── same pattern as Affiliate: left brand, right back-link + pill CTA */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--ytg-border)', padding: isMobile ? '0 20px' : '0 40px 0 72px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ytg-nav)', backdropFilter: 'blur(16px)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', minWidth: 0 }}>
          <Logo size={28} />
          <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--ytg-text)', letterSpacing: '-0.4px', whiteSpace: 'nowrap' }}>YTGrowth</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {!isMobile && <a href="/" className="contact-nav-link">← Back to home</a>}
          <a href="mailto:support@ytgrowth.io"
            className="contact-btn"
            style={{ padding: isMobile ? '8px 18px' : '9px 22px', fontSize: 13, borderRadius: 100, whiteSpace: 'nowrap' }}>
            {isMobile ? 'Email us' : 'Send email'}
          </a>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — HERO   bg: #ffffff  (matches Affiliate hero)
      ══════════════════════════════════════════════════════════ */}
      <section className="contact-section-pad" style={{ padding: isMobile ? '72px 20px 60px' : '110px 40px 88px', textAlign: 'center', background: '#ffffff' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', animation: 'fadeUp 0.5s ease both' }}>
          <span className="contact-section-label">Contact</span>
          <h1 className="contact-hero-h1" style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 36 : 58, fontWeight: 800, letterSpacing: isMobile ? '-1.5px' : '-2.5px', lineHeight: 1.06, color: 'var(--ytg-text)', marginBottom: 24, textWrap: 'balance' }}>
            Real people.<br />
            Same-day replies.<br />
            <span style={{ color: 'var(--ytg-accent)' }}>No ticket queues.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18, color: 'var(--ytg-text-2)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto 14px' }}>
            One inbox. One human at the other end. Write anything — a bug, a billing question, a feature idea, or just hello — and we'll reply with an actual answer, usually within 4 hours.
          </p>
          <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 40 }}>
            No auto-responders. No forms to fill. No routing bots.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:support@ytgrowth.io" className="contact-btn contact-btn-lg">
              Email support@ytgrowth.io →
            </a>
            <a href="#contact-how"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 28px', borderRadius: 100, fontSize: 14, fontWeight: 600, color: 'var(--ytg-text-2)', textDecoration: 'none', background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', transition: 'color 0.15s, box-shadow 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--ytg-text)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--ytg-text-2)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow-sm)' }}
            >
              See how we handle email
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — STATS BAR   bg: --ytg-bg-2  (stepped)
      ══════════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)', padding: isMobile ? '52px 24px' : '60px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="contact-stats-inner contact-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', alignItems: 'center', gap: 32 }}>
            {[
              { value: '< 4h',  label: 'Median reply time',        sub: 'Weekdays, during working hours' },
              { value: '100%',  label: 'Emails that get a reply',  sub: 'No exceptions — ever' },
              { value: '0',     label: 'Auto-responders or bots',  sub: 'Only humans answer your email' },
              { value: '7d',    label: 'Inbox monitored',          sub: 'Urgent issues handled at weekends too' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', minWidth: 140 }}>
                <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 34 : 40, fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--ytg-accent)', lineHeight: 1.1, marginBottom: 7 }}>{s.value}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ytg-text)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: 'var(--ytg-text-3)', lineHeight: 1.5 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — HOW IT WORKS   bg: --ytg-bg-3  (darkest step)
      ══════════════════════════════════════════════════════════ */}
      <section id="contact-how" className="contact-section-pad" style={{ padding: isMobile ? '72px 20px' : '100px 40px', background: 'var(--ytg-bg-3)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="contact-section-label">How it works</span>
            <h2 className="contact-section-h2" style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 36, fontWeight: 800, letterSpacing: '-1.2px', color: 'var(--ytg-text)', lineHeight: 1.08, textWrap: 'balance' }}>
              No tickets. <span style={{ color: 'var(--ytg-accent)' }}>Just email and a reply.</span>
            </h2>
          </div>
          <div className="contact-grid-3">
            {STEPS.map((step, i) => (
              <div key={i} style={{ background: 'var(--ytg-card)', borderRadius: 18, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-lg)', padding: 36 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ytg-accent)', letterSpacing: '0.04em', marginBottom: 22, fontFamily: 'monospace' }}>{step.n}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ytg-text)', marginBottom: 12, letterSpacing: '-0.3px' }}>{step.title}</div>
                <div style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.78 }}>{step.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4 — REASONS GRID   bg: --ytg-bg
      ══════════════════════════════════════════════════════════ */}
      <section className="contact-section-pad" style={{ padding: isMobile ? '72px 20px' : '100px 40px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="contact-section-label">Why people reach out</span>
            <h2 className="contact-section-h2" style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 36, fontWeight: 800, letterSpacing: '-1.2px', color: 'var(--ytg-text)', lineHeight: 1.08, marginBottom: 14, textWrap: 'balance' }}>
              No question is <span style={{ color: 'var(--ytg-accent)' }}>too small.</span>
            </h2>
            <p style={{ fontSize: isMobile ? 14 : 15, color: 'var(--ytg-text-2)', maxWidth: 520, margin: '14px auto 0', lineHeight: 1.75 }}>
              Here's what usually lands in our inbox. If your reason isn't listed, email anyway — we'll figure out where it needs to go.
            </p>
          </div>

          <div className="contact-grid-3">
            {REASONS.map((r, i) => (
              <div key={i} className="contact-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--ytg-accent-light)', border: '1px solid rgba(229,37,27,0.14)', color: 'var(--ytg-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <r.Icon />
                  </div>
                  {r.tag && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: r.tagColor, background: `${r.tagColor}14`, border: `1px solid ${r.tagColor}30`, padding: '3px 10px', borderRadius: 100, letterSpacing: '0.04em' }}>
                      {r.tag}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.3px', marginBottom: 10 }}>{r.title}</p>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.75 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 5 — BOTTOM CTA   bg: --ytg-bg-3  (matches Affiliate's bottom CTA)
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '0 16px 80px' : '0 40px 120px', background: 'var(--ytg-bg-3)', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', paddingTop: isMobile ? 48 : 80 }}>
          <div style={{
            borderRadius: isMobile ? 18 : 24,
            border: '1px solid var(--ytg-border)',
            boxShadow: 'var(--ytg-shadow-xl)',
            padding: isMobile ? '48px 24px 40px' : '88px 60px',
            textAlign: 'center',
            background: 'var(--ytg-card)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* radial red glow — same trick Affiliate uses on its bottom CTA */}
            <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 500, height: 240, background: 'radial-gradient(ellipse, rgba(229,37,27,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <span className="contact-section-label">The inbox is open</span>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 30 : 44, fontWeight: 800, letterSpacing: isMobile ? '-0.8px' : '-1.6px', marginBottom: 14, lineHeight: 1.1, textWrap: 'balance' }}>
              Got something to say?<br />
              <span style={{ color: 'var(--ytg-accent)' }}>Send the first email.</span>
            </h2>
            <p style={{ fontSize: isMobile ? 14 : 16, color: 'var(--ytg-text-2)', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.75 }}>
              We read every message. We reply to every message. If you've been waiting more than one business day, email again with <strong style={{ color: 'var(--ytg-text)' }}>URGENT</strong> in the subject — we'll prioritise it immediately.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,auto)',
              gap: isMobile ? '10px 16px' : 24,
              justifyContent: isMobile ? 'stretch' : 'center',
              justifyItems: 'center',
              marginBottom: isMobile ? 32 : 44,
              maxWidth: isMobile ? 280 : 'none',
              marginLeft: 'auto', marginRight: 'auto',
            }}>
              {['Reply under 4h', 'Real humans only', 'No ticket queue', 'Weekend urgents'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--ytg-text-3)' }}>
                  <Check /><span style={{ whiteSpace: 'nowrap' }}>{t}</span>
                </div>
              ))}
            </div>
            <a href="mailto:support@ytgrowth.io"
              className={`contact-btn${isMobile ? ' contact-btn-full' : ' contact-btn-lg'}`}
              style={isMobile ? { borderRadius: 14, padding: '15px 24px', fontSize: 14 } : {}}>
              Email support@ytgrowth.io →
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />

    </div>
  )
}
