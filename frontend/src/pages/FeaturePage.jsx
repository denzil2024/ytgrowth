import { useEffect, useState } from 'react'
import LandingFooter from '../components/LandingFooter'

/* Shared layout for /features/* pages.
 *
 * Each feature page is a thin wrapper that passes in:
 *  - meta-style copy (heroLabel/heroHeadline/heroSub)
 *  - a custom visual mockup component
 *  - structured content arrays (howItWorks, whatYouGet, whoItsFor, faq)
 *  - bottom CTA text
 *
 * Layout order: nav → hero → visual → how → what → who → faq → CTA → footer.
 * Reuses --ytg-* CSS variables from the Landing styles so visual mockups
 * look identical to the existing landing-page sections.
 */

function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return { isMobile: width <= 768, isTablet: width <= 1024 }
}

function useFeatureStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-feat-styles')) return
    const link = document.createElement('link')
    link.id = 'ytg-feat-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytg-feat-styles'
    style.textContent = `
      :root {
        --ytg-bg:           #f4f4f6;
        --ytg-bg-2:         #ecedf1;
        --ytg-bg-3:         #e6e7ec;
        --ytg-text:         #0a0a0f;
        --ytg-text-2:       rgba(10,10,15,0.62);
        --ytg-text-3:       rgba(10,10,15,0.40);
        --ytg-text-4:       rgba(10,10,15,0.30);
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
        --ytg-shadow-xl:    0 8px 28px rgba(0,0,0,0.13), 0 40px 100px rgba(0,0,0,0.17);
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 5px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background: rgba(10,10,15,0.16); border-radius: 10px }

      @keyframes fadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .ftr-btn {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
        padding: 15px 30px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.14), 0 4px 20px rgba(229,48,42,0.34);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .ftr-btn:hover {
        filter: brightness(1.07); transform: translateY(-1px);
        box-shadow: 0 3px 8px rgba(0,0,0,0.16), 0 12px 36px rgba(229,48,42,0.42);
      }
      .ftr-btn-lg  { font-size: 16px; padding: 17px 38px; }

      .ftr-btn-ghost {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--ytg-card); color: var(--ytg-text-2);
        font-size: 15px; font-weight: 600; font-family: 'Inter', system-ui, sans-serif;
        padding: 14px 26px; border-radius: 100px; border: 1px solid var(--ytg-border);
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: var(--ytg-shadow-sm);
        transition: color 0.15s, box-shadow 0.18s, border-color 0.15s;
      }
      .ftr-btn-ghost:hover { color: var(--ytg-text); box-shadow: var(--ytg-shadow); border-color: var(--ytg-border-2); }

      .ftr-section-label {
        display: inline-flex; align-items: center; gap: 8px;
        font-size: 11px; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: var(--ytg-accent-text); background: var(--ytg-accent-light);
        padding: 5px 13px; border-radius: 100px; margin-bottom: 16px;
      }

      .ftr-h1 {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-weight: 800; letter-spacing: -2px;
        line-height: 1.05; color: var(--ytg-text);
        margin-bottom: 22px; text-wrap: balance;
      }
      .ftr-h2 {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-weight: 800; letter-spacing: -1.4px;
        line-height: 1.08; color: var(--ytg-text);
        text-wrap: balance;
      }

      .ftr-nav-link {
        font-size: 14px; color: var(--ytg-text-3); font-weight: 500;
        text-decoration: none; transition: color 0.15s; letter-spacing: -0.1px;
      }
      .ftr-nav-link:hover { color: var(--ytg-text-2); }

      .ftr-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }

      .ftr-faq-item {
        border-bottom: 1px solid var(--ytg-border);
      }
      .ftr-faq-q {
        background: none; border: none; cursor: pointer;
        width: 100%; text-align: left;
        padding: 22px 0; font-family: inherit;
        display: flex; justify-content: space-between; align-items: center; gap: 16px;
        font-size: 16px; font-weight: 600; color: var(--ytg-text); letter-spacing: -0.2px;
      }
      .ftr-faq-q:hover { color: var(--ytg-accent); }
      .ftr-faq-icon { transition: transform 0.2s; flex-shrink: 0; color: var(--ytg-text-3); }
      .ftr-faq-icon.open { transform: rotate(45deg); color: var(--ytg-accent); }
      .ftr-faq-a {
        font-size: 14.5px; color: var(--ytg-text-2); line-height: 1.78;
        padding: 0 0 22px 0; max-width: 720px;
      }

      @media (max-width: 900px) {
        .ftr-grid-3 { grid-template-columns: 1fr; }
        .ftr-feature-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="#ff3b30"/>
      <path d="M23.2 11.6a2.1 2.1 0 0 0-1.48-1.48C20.55 9.8 16 9.8 16 9.8s-4.55 0-5.72.32A2.1 2.1 0 0 0 8.8 11.6 22 22 0 0 0 8.5 16a22 22 0 0 0 .3 4.4 2.1 2.1 0 0 0 1.48 1.48C11.45 22.2 16 22.2 16 22.2s4.55 0 5.72-.32a2.1 2.1 0 0 0 1.48-1.48A22 22 0 0 0 23.5 16a22 22 0 0 0-.3-4.4z" fill="white"/>
      <polygon points="13.5,19 19.5,16 13.5,13" fill="#ff3b30"/>
    </svg>
  )
}

function Check({ onDark = false }) {
  const c = onDark ? '#4ade80' : '#16a34a'
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}>
      <path d="M2.5 7.2 5.4 10l6.1-6"/>
    </svg>
  )
}

function Plus() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M7 2v10M2 7h10"/>
    </svg>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="ftr-faq-item">
      <button className="ftr-faq-q" onClick={() => setOpen(o => !o)}>
        <span style={{ flex: 1 }}>{q}</span>
        <span className={`ftr-faq-icon${open ? ' open' : ''}`}><Plus /></span>
      </button>
      {open && <div className="ftr-faq-a">{a}</div>}
    </div>
  )
}

const FEATURE_NAV_ITEMS = [
  { href: '/features/channel-audit',       label: 'Channel Audit',       desc: '10-dimension AI audit of your channel' },
  { href: '/features/competitor-analysis', label: 'Competitor Analysis', desc: 'Track rivals, find their content gaps' },
  { href: '/features/seo-studio',          label: 'SEO Studio',          desc: 'Score + rewrite titles and descriptions' },
  { href: '/features/thumbnail-iq',        label: 'Thumbnail IQ',        desc: 'Two-layer thumbnail scoring vs your niche' },
  { href: '/features/keyword-research',    label: 'Keyword Research',    desc: 'YouTube-native search volume + difficulty' },
]

function FeaturesNavDropdown() {
  const [open, setOpen] = useState(false)
  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{ position: 'relative' }}
    >
      <a href="/#features" className="ftr-nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
        Features
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>
          <path d="M2 3.5l3 3 3-3"/>
        </svg>
      </a>
      {open && (
        <>
          <div style={{ position: 'absolute', top: '100%', left: -20, width: 360, height: 12 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: -20, zIndex: 200,
            background: '#ffffff', border: '1px solid var(--ytg-border)', borderRadius: 14,
            boxShadow: 'var(--ytg-shadow-lg)',
            padding: 8, minWidth: 340,
            animation: 'fadeUp 0.16s ease both',
          }}>
            {FEATURE_NAV_ITEMS.map((item, i) => (
              <a key={i} href={item.href} style={{
                display: 'block', padding: '11px 14px', borderRadius: 9,
                textDecoration: 'none', transition: 'background 0.12s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#f6f6f9'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.2px', marginBottom: 2 }}>{item.label}</p>
                <p style={{ fontSize: 12.5, color: 'var(--ytg-text-2)', lineHeight: 1.45 }}>{item.desc}</p>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function FeaturePage({
  heroLabel,
  heroHeadline,
  heroSub,
  primaryCta = 'Try YTGrowth free',
  visual,
  visualDark = true,
  howItWorks = [],
  whatYouGet = [],
  whoItsFor = [],
  faq = [],
  bottomHeadline,
  bottomSub,
}) {
  useFeatureStyles()
  const { isMobile } = useBreakpoint()

  return (
    <div style={{ background: 'var(--ytg-bg)', minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid var(--ytg-border)',
        padding: isMobile ? '0 20px' : '0 40px 0 64px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--ytg-nav)', backdropFilter: 'blur(16px)',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', minWidth: 0 }}>
          <Logo size={28} />
          <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--ytg-text)', letterSpacing: '-0.4px', whiteSpace: 'nowrap' }}>YTGrowth</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          {!isMobile && <FeaturesNavDropdown />}
          {!isMobile && <a href="/#pricing" className="ftr-nav-link">Pricing</a>}
          <a href="/auth/login" className="ftr-btn"
            style={{ padding: isMobile ? '8px 18px' : '9px 22px', fontSize: 13, borderRadius: 100, whiteSpace: 'nowrap' }}>
            {isMobile ? 'Get started' : primaryCta}
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: isMobile ? '64px 20px 48px' : '96px 40px 72px', textAlign: 'center', background: '#ffffff' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', animation: 'fadeUp 0.5s ease both' }}>
          <span className="ftr-section-label">{heroLabel}</span>
          <h1 className="ftr-h1" style={{ fontSize: isMobile ? 34 : 56 }}>{heroHeadline}</h1>
          <p style={{ fontSize: isMobile ? 16 : 18, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 620, margin: '0 auto 32px' }}>
            {heroSub}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/login" className="ftr-btn ftr-btn-lg">{primaryCta} →</a>
            <a href="#how" className="ftr-btn-ghost" style={{ padding: '15px 26px', fontSize: 15 }}>See how it works</a>
          </div>
        </div>
      </section>

      {/* ── VISUAL ── */}
      <section style={{
        background: visualDark ? '#0d0d12' : 'var(--ytg-bg-2)',
        borderTop: visualDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--ytg-border)',
        borderBottom: visualDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--ytg-border)',
        padding: isMobile ? '60px 20px' : '90px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        {visualDark && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.16) 0%, transparent 65%)', pointerEvents: 'none' }} />
        )}
        <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {visual}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      {howItWorks.length > 0 && (
        <section id="how" style={{ padding: isMobile ? '64px 20px' : '96px 40px', background: '#ffffff' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <span className="ftr-section-label">How it works</span>
              <h2 className="ftr-h2" style={{ fontSize: isMobile ? 28 : 38 }}>Up and running in under 5 minutes</h2>
            </div>
            <div className="ftr-grid-3">
              {howItWorks.map((step, i) => (
                <div key={i} style={{ background: 'var(--ytg-card)', borderRadius: 18, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: 32 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ytg-accent)', letterSpacing: '0.04em', marginBottom: 18, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{String(i + 1).padStart(2, '0')}</div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--ytg-text)', marginBottom: 11, letterSpacing: '-0.3px' }}>{step.title}</p>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── WHAT YOU GET ── */}
      {whatYouGet.length > 0 && (
        <section style={{ padding: isMobile ? '64px 20px' : '96px 40px', background: 'var(--ytg-bg)', borderTop: '1px solid var(--ytg-border)' }}>
          <div style={{ maxWidth: 920, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <span className="ftr-section-label">What you get</span>
              <h2 className="ftr-h2" style={{ fontSize: isMobile ? 28 : 38 }}>Everything in one place</h2>
            </div>
            <div style={{ background: 'var(--ytg-card)', borderRadius: 20, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-lg)', padding: isMobile ? '28px 24px' : '40px 48px' }}>
              {whatYouGet.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 0', borderBottom: i < whatYouGet.length - 1 ? '1px solid var(--ytg-border)' : 'none' }}>
                  <Check />
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.2px', marginBottom: 4 }}>{item.title}</p>
                    <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.65 }}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── WHO IT'S FOR ── */}
      {whoItsFor.length > 0 && (
        <section style={{ padding: isMobile ? '64px 20px' : '96px 40px', background: 'var(--ytg-bg-3)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <span className="ftr-section-label">Who it's for</span>
              <h2 className="ftr-h2" style={{ fontSize: isMobile ? 28 : 38 }}>Built for serious creators</h2>
            </div>
            <div className="ftr-grid-3">
              {whoItsFor.map((p, i) => (
                <div key={i} style={{ background: 'var(--ytg-card)', borderRadius: 18, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: 30 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--ytg-text)', marginBottom: 10, letterSpacing: '-0.3px' }}>{p.title}</p>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      {faq.length > 0 && (
        <section style={{ padding: isMobile ? '64px 20px' : '96px 40px', background: '#ffffff' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <span className="ftr-section-label">Questions</span>
              <h2 className="ftr-h2" style={{ fontSize: isMobile ? 28 : 36 }}>Frequently asked</h2>
            </div>
            <div>
              {faq.map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BOTTOM CTA ── */}
      <section style={{ padding: isMobile ? '64px 20px 40px' : '100px 40px 64px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 24, boxShadow: 'var(--ytg-shadow-xl)', padding: isMobile ? '48px 24px' : '72px 56px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 500, height: 240, background: 'radial-gradient(ellipse, rgba(229,48,42,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <h2 className="ftr-h2" style={{ fontSize: isMobile ? 28 : 40, marginBottom: 14 }}>
            {bottomHeadline || 'Ready to see what your channel is missing?'}
          </h2>
          <p style={{ fontSize: isMobile ? 14 : 16, color: 'var(--ytg-text-2)', maxWidth: 480, margin: '0 auto 26px', lineHeight: 1.7 }}>
            {bottomSub || 'Free to start. No credit card. 3 lifetime AI analyses on the house.'}
          </p>
          <a href="/auth/login" className="ftr-btn ftr-btn-lg">{primaryCta} →</a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <LandingFooter />
    </div>
  )
}
