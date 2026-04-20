import { useEffect, useState } from 'react'
import { openCheckout } from '../checkout'

/* ─── inject font + global styles into <head> once ─────────────────────── */
function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-styles')) return

    const link = document.createElement('link')
    link.id = 'ytg-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytg-styles'
    style.textContent = `
      :root {
        --ytg-bg: #f4f4f6;
        --ytg-text: #0a0a0f;
        --ytg-text-2: rgba(10,10,15,0.62);
        --ytg-text-3: rgba(10,10,15,0.44);
        --ytg-text-4: rgba(10,10,15,0.28);
        --ytg-nav: rgba(13,13,18,0.96);
        --ytg-section: rgba(10,10,15,0.03);
        --ytg-card: #ffffff;
        --ytg-card-2: #e8e8ec;
        --ytg-border: rgba(10,10,15,0.11);
        --ytg-border-2: rgba(10,10,15,0.18);
        --ytg-divider: rgba(10,10,15,0.06);
        --ytg-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 6px 28px rgba(0,0,0,0.11);
        --ytg-shadow-lg: 0 4px 14px rgba(0,0,0,0.12), 0 24px 64px rgba(0,0,0,0.14);
        --ytg-shadow-xl: 0 8px 24px rgba(0,0,0,0.15), 0 40px 100px rgba(0,0,0,0.18);
        --ytg-card-border: rgba(10,10,15,0.11);
        --ytg-accent: #e5302a;
        --ytg-accent-text: #c22b25;
        --ytg-accent-light: rgba(229,48,42,0.08);
        --ytg-accent-border: rgba(229,48,42,0.18);
        --ytg-check: #0066cc;
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; transition: background 0.3s, color 0.3s; }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
      .section-animate { opacity: 0; transform: translateY(24px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
      .section-animate.visible { opacity: 1; transform: translateY(0); }
      ::-webkit-scrollbar { width: 8px }
      ::-webkit-scrollbar-track { background: rgba(10,10,15,0.04) }
      ::-webkit-scrollbar-thumb { background: rgba(10,10,15,0.18); border-radius: 10px; min-height: 48px }
      ::-webkit-scrollbar-thumb:hover { background: rgba(10,10,15,0.28) }

      .ytg-btn-primary {
        display: inline-flex; align-items: center; gap: 10px;
        padding: 14px 30px; border-radius: 100px; font-weight: 700;
        font-size: 15px; text-decoration: none;
        background: var(--ytg-accent);
        color: #fff; transition: all 0.18s ease; cursor: pointer;
        border: none; font-family: 'Inter', system-ui, sans-serif;
        letter-spacing: -0.2px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32);
      }
      .ytg-btn-primary:hover {
        filter: brightness(1.07);
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(0,0,0,0.15), 0 8px 28px rgba(229,48,42,0.42);
      }

      .ytg-btn-ghost {
        display: inline-flex; align-items: center; gap: 10px;
        padding: 14px 30px; border-radius: 100px; font-weight: 600;
        font-size: 15px; text-decoration: none;
        background: var(--ytg-card);
        color: var(--ytg-text-2);
        border: 1px solid var(--ytg-border-2);
        transition: all 0.18s ease; cursor: pointer;
        font-family: 'Inter', system-ui, sans-serif;
        box-shadow: var(--ytg-shadow);
      }
      .ytg-btn-ghost:hover {
        background: var(--ytg-card);
        color: var(--ytg-text);
        border-color: var(--ytg-border-2);
        transform: translateY(-1px);
        box-shadow: var(--ytg-shadow-lg);
      }

      .ytg-feature-card {
        background: var(--ytg-card);
        border: 1px solid var(--ytg-border);
        border-radius: 24px; padding: 28px;
        transition: all 0.2s ease; cursor: default;
        box-shadow: var(--ytg-shadow-lg);
        border-color: var(--ytg-card-border);
      }
      .ytg-feature-card:hover {
        border-color: var(--ytg-border-2);
        transform: translateY(-3px);
        box-shadow: var(--ytg-shadow-xl);
      }

      .ytg-nav-link {
        font-size: 15px; color: rgba(10,10,15,0.52); font-weight: 500;
        text-decoration: none; transition: color 0.15s; letter-spacing: -0.1px;
      }
      .ytg-nav-link:hover { color: rgba(10,10,15,0.88); }

      .ytg-faq-item {
        border-bottom: 1px solid var(--ytg-border);
        padding: 28px 0;
      }
      .ytg-faq-item:last-child { border-bottom: none; }

      .ytg-faq-card {
        background: var(--ytg-card);
        border-radius: 18px;
        overflow: hidden;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        box-shadow: 0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.1);
      }
      .ytg-faq-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.13), 0 2px 6px rgba(0,0,0,0.07);
      }
      .ytg-faq-answer {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
        opacity: 0;
      }
      .ytg-faq-answer.open {
        grid-template-rows: 1fr;
        opacity: 1;
      }
      .ytg-faq-answer-inner {
        overflow: hidden;
      }

      .ytg-objection-card {
        background: var(--ytg-card);
        border: 1px solid var(--ytg-border);
        border-radius: 16px;
        padding: 22px 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 8px 28px rgba(0,0,0,0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        cursor: default;
      }
      .ytg-objection-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.14), 0 3px 8px rgba(0,0,0,0.08);
        border-color: var(--ytg-border-2);
      }

      .ytg-stat-row-item {
        text-align: center; padding: 0 32px;
      }
      .ytg-stat-row-item + .ytg-stat-row-item {
        border-left: 1px solid var(--ytg-border);
      }

      .ytg-card-base {
        background: var(--ytg-card);
        border: 1px solid var(--ytg-border);
        border-radius: 22px;
        box-shadow: var(--ytg-shadow);
      }
      .ytg-card {
        background: var(--ytg-card);
        border: 1px solid var(--ytg-border);
        border-radius: 24px;
        box-shadow: var(--ytg-shadow-lg);
        transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
      }
      .ytg-card:hover {
        box-shadow: var(--ytg-shadow-xl);
        transform: translateY(-2px);
        border-color: var(--ytg-border-2);
      }
      .ytg-card-accent {
        background: var(--ytg-accent-light);
        border: 1px solid var(--ytg-accent-border);
        border-radius: 24px;
        box-shadow: var(--ytg-shadow-xl);
        position: relative;
        overflow: hidden;
      }
      .ytg-step-card {
        background: var(--ytg-card);
        border: 1px solid var(--ytg-border);
        border-radius: 24px;
        padding: 26px;
        box-shadow: var(--ytg-shadow-lg);
        transition: box-shadow 0.2s, transform 0.2s;
      }
      .ytg-step-card:hover {
        box-shadow: var(--ytg-shadow-xl);
        transform: translateY(-2px);
      }
      .ytg-testimonial-card {
        background: var(--ytg-card);
        border: 1px solid var(--ytg-border);
        border-radius: 24px;
        padding: 28px 30px;
        box-shadow: var(--ytg-shadow-lg);
        transition: box-shadow 0.2s, transform 0.2s;
      }
      .ytg-testimonial-card:hover {
        box-shadow: var(--ytg-shadow-xl);
        transform: translateY(-2px);
      }
      .ytg-pricing-card {
        background: var(--ytg-card);
        border: 1px solid var(--ytg-border);
        border-radius: 24px;
        padding: 32px 28px;
        box-shadow: var(--ytg-shadow-lg);
        transition: box-shadow 0.2s, transform 0.2s;
      }
      .ytg-pricing-card:hover {
        box-shadow: var(--ytg-shadow-xl);
        transform: translateY(-2px);
      }
      .ytg-pricing-card-featured {
        background: var(--ytg-accent-light);
        border: 1px solid var(--ytg-accent-border);
        border-radius: 24px;
        padding: 32px 28px;
        position: relative;
        overflow: hidden;
        box-shadow: var(--ytg-shadow-xl);
      }

      /* ── Mobile nav menu ─────────────────────────────────── */
      .ytg-mobile-menu {
        display: flex; position: fixed; inset: 0; z-index: 99; /* IMPROVED: always flex, use opacity for transition */
        background: var(--ytg-nav); backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        flex-direction: column; align-items: center; justify-content: center; gap: 24px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        opacity: 0; pointer-events: none; transition: opacity 0.2s ease; /* IMPROVED: fade-in animation */
      }
      .ytg-mobile-menu.open { opacity: 1; pointer-events: auto; } /* IMPROVED: was display:flex */

      /* ── Responsive card grids ───────────────────────────── */
      @media (max-width: 768px) {
        .ytg-features-grid { grid-template-columns: 1fr !important; }
        .ytg-feature-card { border-radius: 20px; padding: 22px; }
        .ytg-step-card { border-radius: 20px; padding: 22px; }
        .ytg-testimonial-card { border-radius: 20px; padding: 22px 24px; }
        .ytg-pricing-card { border-radius: 20px; padding: 28px 24px; }
        .ytg-pricing-card-featured { border-radius: 20px; padding: 28px 24px; }
        .ytg-faq-card { border-radius: 16px; }
        .ytg-objection-card { border-radius: 14px; padding: 18px 16px; }
        .ytg-btn-primary { padding: 13px 26px !important; font-size: 14px !important; }
        .ytg-btn-ghost { padding: 13px 26px !important; font-size: 14px !important; }
        .ytg-stat-row-item { padding: 0 16px; text-align: center; }
        .ytg-stat-row-item + .ytg-stat-row-item { border-left: none; border-top: 1px solid var(--ytg-border); padding-top: 36px; margin-top: 36px; } /* IMPROVED: 28→36px */
      }
      /* ── Scroll-triggered section entrance ───────────────── */
      .section-animate { opacity: 0; transform: translateY(12px); transition: opacity 0.5s ease, transform 0.5s ease; } /* IMPROVED: added */
      .section-animate.visible { opacity: 1; transform: translateY(0); }
      @keyframes ytg-ticker { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
      .ytg-ticker-track { display: flex; animation: ytg-ticker 52s linear infinite; width: max-content; }
      .ytg-ticker-track:hover { animation-play-state: paused; }
      .ytg-footer-link { display: block; font-size: 14px; color: rgba(255,255,255,0.42); text-decoration: none; margin-bottom: 13px; transition: color 0.15s; font-family: 'Inter',system-ui,sans-serif; line-height: 1; }
      .ytg-footer-link:hover { color: rgba(255,255,255,0.82); }
      .ytg-footer-link:last-child { margin-bottom: 0; }
      .ytg-creator-avatar { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; display: block; }
      .ytg-creator-avatar-fallback { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px; flex-shrink: 0; }
      @keyframes ytg-shimmer { 0%,100%{opacity:0.45} 50%{opacity:0.9} }
      .ytg-shimmer { animation: ytg-shimmer 1.6s ease-in-out infinite; background: rgba(10,10,15,0.07); border-radius: 50%; }
    `
    document.head.appendChild(style)
  }, [])
}

/* ─── Responsive hooks ──────────────────────────────────────────────────── */
function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return { isMobile: width <= 768, isTablet: width <= 1024 }
}

/* ─── Logo ──────────────────────────────────────────────────────────────── */
function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="#ff3b30"/>
      <path d="M23.2 11.6a2.1 2.1 0 0 0-1.48-1.48C20.55 9.8 16 9.8 16 9.8s-4.55 0-5.72.32A2.1 2.1 0 0 0 8.8 11.6 22 22 0 0 0 8.5 16a22 22 0 0 0 .3 4.4 2.1 2.1 0 0 0 1.48 1.48C11.45 22.2 16 22.2 16 22.2s4.55 0 5.72-.32a2.1 2.1 0 0 0 1.48-1.48A22 22 0 0 0 23.5 16a22 22 0 0 0-.3-4.4z" fill="white"/>
      <polygon points="13.5,19 19.5,16 13.5,13" fill="#ff3b30"/>
    </svg>
  )
}

/* ─── Check icon ────────────────────────────────────────────────────────── */
function Check({ color = 'var(--ytg-check)' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" flexShrink="0" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7" fill={`${color}18`} stroke={`${color}40`}/>
      <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function NoCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7" fill="rgba(0,0,0,0.04)" stroke="rgba(0,0,0,0.1)"/>
      <path d="M5.5 10.5l5-5M10.5 10.5l-5-5" stroke="var(--ytg-text-4)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

/* Larger, more visually present bullet for feature-section lists. */
function FeatureBullet({ onDark = false }) {
  const bg     = onDark ? 'rgba(74,222,128,0.16)' : 'rgba(22,163,74,0.12)'
  const border = onDark ? 'rgba(74,222,128,0.38)' : 'rgba(22,163,74,0.28)'
  const stroke = onDark ? '#4ade80' : '#16a34a'
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="10" fill={bg} stroke={border} strokeWidth="1"/>
      <path d="M6.8 11.2l3 3 5.4-6" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function FeatureBulletRow({ onDark = false, children }) {
  const textColor = onDark ? 'rgba(255,255,255,0.78)' : 'var(--ytg-text)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
      <FeatureBullet onDark={onDark} />
      <span style={{ fontSize: 15, fontWeight: 500, color: textColor, lineHeight: 1.5, letterSpacing: '-0.1px' }}>{children}</span>
    </div>
  )
}

/* ─── Arrow icon ────────────────────────────────────────────────────────── */
function Arrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2 7.5h11M9 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* ─── Section badge ─────────────────────────────────────────────────────── */
function Badge({ children }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: 'var(--ytg-accent-light)', border: '1px solid var(--ytg-accent-border)',
      borderRadius: 100, padding: '6px 16px', marginBottom: 20, /* IMPROVED: 18→20px */
    }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ytg-accent)' }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{children}</span>
    </div>
  )
}

/* ─── Section nav dots ──────────────────────────────────────────────────── */
const SECTIONS = [
  { id: 'hero',         label: 'Top' },
  { id: 'features',    label: 'Features' },
  { id: 'how-it-works',label: 'How it works' },
  { id: 'pricing',     label: 'Pricing' },
  { id: 'faq',         label: 'FAQ' },
]

function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = SECTIONS.findIndex(s => s.id === entry.target.id)
          if (idx !== -1) setActive(idx)
        }
      }),
      { threshold: 0.35 }
    )
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id) => {
    if (id === 'hero') { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Top scroll progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 999, background: 'transparent' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--ytg-accent)', transition: 'width 0.08s linear', borderRadius: '0 2px 2px 0' }} />
      </div>
      {/* Side section nav — horizontal dashes */}
      <div style={{ position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 200, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SECTIONS.map((s, i) => {
          const isActive = active === i
          const isHovered = hovered === i
          return (
            <button
              key={i}
              onClick={() => scrollTo(s.id)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {(isActive || isHovered) && (
                <span style={{
                  fontSize: 12, fontWeight: isActive ? 700 : 500, whiteSpace: 'nowrap',
                  color: isActive ? 'var(--ytg-accent-text)' : 'var(--ytg-text-3)',
                  background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)',
                  padding: '3px 9px', borderRadius: 6, boxShadow: 'var(--ytg-shadow)',
                  letterSpacing: '-0.1px', pointerEvents: 'none',
                  opacity: isActive || isHovered ? 1 : 0, transition: 'opacity 0.15s',
                }}>{s.label}</span>
              )}
              <div style={{
                height: 2, borderRadius: 2, flexShrink: 0,
                width: isActive ? 24 : isHovered ? 14 : 8,
                background: isActive ? 'var(--ytg-accent)' : isHovered ? 'var(--ytg-border-2)' : 'var(--ytg-border)',
                transition: 'width 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.2s',
              }} />
            </button>
          )
        })}
      </div>
    </>
  )
}

/* ─── Data-driven reviews (placeholder until real reviews arrive) ────────── */
import reviewsData from '../data/reviews.json'

function Testimonials({ isMobile }) {
  const list = Array.isArray(reviewsData?.reviews) ? reviewsData.reviews : []
  if (list.length < 3) return null

  const avg   = reviewsData.average_rating
  const total = reviewsData.total_reviews

  return (
    <div className="section-animate" style={{ background: '#e8e9ee', borderTop: '1px solid rgba(10,10,15,0.06)', borderBottom: '1px solid rgba(10,10,15,0.06)', padding: isMobile ? '60px 24px' : '100px 64px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          {avg != null && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 3 }}>
                {[...Array(5)].map((_, i) => <span key={i} style={{ fontSize: 20, color: '#f59e0b' }}>★</span>)}
              </div>
              <div style={{ width: 1, height: 24, background: 'rgba(10,10,15,0.12)' }} />
              <span style={{ fontSize: 22, fontWeight: 800, color: '#0a0a0f', letterSpacing: '-0.5px' }}>{avg} / 5</span>
              {total != null && (
                <>
                  <div style={{ width: 1, height: 24, background: 'rgba(10,10,15,0.12)' }} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(10,10,15,0.45)' }}>Based on {total}+ reviews</span>
                </>
              )}
            </div>
          )}
          <h2 style={{ fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: '#0a0a0f', lineHeight: 1.06, marginBottom: 12 }}>The tool creators <span style={{ color: 'var(--ytg-accent)' }}>actually recommend.</span></h2>
          <p style={{ fontSize: 16, color: 'rgba(10,10,15,0.6)', lineHeight: 1.8 }}>Real channels. Real numbers.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
          {list.map((r, i) => (
            <a key={i} href={r.platform_url || '#'} target="_blank" rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block', background: '#ffffff', borderRadius: 20, border: '1px solid rgba(10,10,15,0.06)', padding: 28, boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.1), 0 32px 64px rgba(0,0,0,0.14)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {r.avatar
                  ? <img src={r.avatar} alt={r.name} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#e5251b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, flexShrink: 0 }}>{(r.name || '?')[0]}</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0a0a0f', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</p>
                  {r.handle_or_title && <p style={{ fontSize: 12, color: 'rgba(10,10,15,0.4)', marginTop: 2, marginBottom: 0 }}>{r.handle_or_title}</p>}
                </div>
                {r.platform && (
                  <span style={{ background: 'rgba(10,10,15,0.04)', border: '1px solid rgba(10,10,15,0.08)', borderRadius: 6, padding: '4px 8px', fontSize: 12, fontWeight: 700, color: 'rgba(10,10,15,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>{r.platform}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 3, marginTop: 14, marginBottom: 14 }}>
                {[...Array(r.rating || 5)].map((_, j) => <span key={j} style={{ fontSize: 14, color: '#f59e0b' }}>★</span>)}
              </div>
              {r.metric && (
                <div style={{ background: 'rgba(229,48,42,0.06)', border: '1px solid rgba(229,48,42,0.14)', borderRadius: 8, padding: '8px 14px', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#c22b25' }}>{r.metric}</span>
                </div>
              )}
              <p style={{ fontSize: 14, color: 'rgba(10,10,15,0.65)', lineHeight: 1.75, margin: 0 }}>{r.quote}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function FounderPricingBand({ isMobile }) {
  return (
    <div className="section-animate" style={{
      background: '#e8e9ee',
      borderTop: '1px solid rgba(10,10,15,0.06)',
      borderBottom: '1px solid rgba(10,10,15,0.06)',
      padding: isMobile ? '48px 24px' : '64px 64px',
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 999,
          background: 'rgba(229,37,27,0.09)',
          border: '1px solid rgba(229,37,27,0.18)',
          marginBottom: 20,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#e5251b', boxShadow: '0 0 8px #e5251b' }}/>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#e5251b', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Early access</span>
        </div>
        <h2 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, letterSpacing: '-1.2px', color: '#0a0a0f', lineHeight: 1.15, marginBottom: 14 }}>
          Founder pricing while we&rsquo;re early
        </h2>
        <p style={{ fontSize: isMobile ? 15 : 16, color: 'rgba(10,10,15,0.6)', lineHeight: 1.7, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
          YTGrowth is new. Pricing today is lower than it will be once reviews roll in — lock in the founder rate for the lifetime of your subscription.
        </p>
      </div>
    </div>
  )
}

/* ─── Landing page ──────────────────────────────────────────────────────── */
const AUTH_ERROR_MESSAGES = {
  channel_locked: 'This channel was recently connected to another account. You can connect it again after 30 days.',
  channel_taken:  'This channel is already connected to another YTGrowth account.',
  channel_limit:  'You have reached the channel limit for your plan. Upgrade to connect more channels.',
}

export default function Landing() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [pricingTab, setPricingTab] = useState(() => {
    const tab = new URLSearchParams(window.location.search).get('tab')
    return ['monthly','annual','lifetime','founder','packs'].includes(tab) ? tab : 'monthly'
  })
  const [openFaq, setOpenFaq] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [authError, setAuthError] = useState(null)
  const { isMobile, isTablet } = useBreakpoint()
  useGlobalStyles()

  useEffect(() => {
    fetch('/auth/data', { credentials: 'include' })
      .then(r => { if (r.ok) setLoggedIn(true) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const err = params.get('error')
    if (err && AUTH_ERROR_MESSAGES[err]) {
      setAuthError(AUTH_ERROR_MESSAGES[err])
      setTimeout(() => setAuthError(null), 8000)
    }
    if (params.get('tab')) {
      setTimeout(() => {
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
      }, 600)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // IMPROVED: scroll-triggered fade-up on section content
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) } }),
      { threshold: 0.15 }
    )
    document.querySelectorAll('.section-animate').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', overflowX: 'hidden' }}>

      {/* ── AUTH ERROR BANNER ────────────────────────────────────────────── */}
      {authError && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          background: '#fff', border: '1px solid rgba(229,37,27,0.25)',
          borderRadius: 10, padding: '14px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.14)',
          zIndex: 200, maxWidth: 480, width: '90%',
          display: 'flex', alignItems: 'flex-start', gap: 12,
          animation: 'fadeUp 0.3s ease',
        }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fef2f2', border: '1px solid rgba(229,37,27,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#e5251b" strokeWidth="1.8" strokeLinecap="round"><line x1="5" y1="2" x2="5" y2="5.5"/><circle cx="5" cy="7.5" r="0.5" fill="#e5251b" stroke="none"/></svg>
          </div>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, flex: 1 }}>{authError}</p>
          <button onClick={() => setAuthError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2, flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>
          </button>
        </div>
      )}

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(244,244,246,0.92)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(10,10,15,0.1)',
        boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
        transition: 'box-shadow 0.3s ease',
        height: 60, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: isMobile ? '0 20px' : '0 48px 0 80px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Logo size={28} />
          <span style={{ fontWeight: 800, fontSize: 14, lineHeight: 1, letterSpacing: '-0.4px', color: '#0a0a0f' }}>YTGrowth</span>
        </div>

        {!isMobile && (
          <div style={{ display: 'flex', gap: 30 }}>
            {['Features', 'How it works', 'Pricing', 'FAQ'].map((l, i) => (
              <a key={i} href={`#${l.toLowerCase().replace(/ /g, '-')}`} className="ytg-nav-link">{l}</a>
            ))}
            <a href="/affiliate" className="ytg-nav-link">Affiliates</a>
            <a href="/contact" className="ytg-nav-link">Contact</a>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isMobile ? (
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#0a0a0f', display: 'flex', flexDirection: 'column', gap: 4.5 }}
            >
              {mobileMenuOpen ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              ) : (
                <>
                  <span style={{ display: 'block', width: 20, height: 2, background: '#0a0a0f', borderRadius: 2 }} />
                  <span style={{ display: 'block', width: 20, height: 2, background: '#0a0a0f', borderRadius: 2 }} />
                  <span style={{ display: 'block', width: 14, height: 2, background: '#0a0a0f', borderRadius: 2 }} />
                </>
              )}
            </button>
          ) : loggedIn ? (
            <a href="/dashboard" className="ytg-btn-primary" style={{ padding: '9px 20px', fontSize: 14 }}>
              Dashboard
            </a>
          ) : (
            <>
              <a href="/auth/login" className="ytg-nav-link" style={{ padding: '8px 16px', borderRadius: 100 }}>Log in</a>
              <a href="/auth/login" className="ytg-btn-primary" style={{ padding: '9px 20px', fontSize: 14 }}>
                Get started free
              </a>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div className={`ytg-mobile-menu${mobileMenuOpen ? ' open' : ''}`} style={{ top: 60 }}>
        {['Features', 'How it works', 'Pricing', 'FAQ', 'Affiliates', 'Contact'].map((l, i) => (
          <a key={i}
            href={l === 'Affiliates' ? '/affiliate' : l === 'Contact' ? '/contact' : `#${l.toLowerCase().replace(/ /g, '-')}`}
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.88)', textDecoration: 'none', letterSpacing: '-0.5px' }}>
            {l}
          </a>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', padding: '0 32px', alignItems: 'center' }}>
          {loggedIn ? (
            <a href="/dashboard" className="ytg-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Dashboard</a>
          ) : (
            <>
              <a href="/auth/login" className="ytg-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Get started free</a>
              <a href="/auth/login" className="ytg-btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Log in</a>
            </>
          )}
        </div>
      </div>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <div id="hero" style={{ position: 'relative', padding: isMobile ? '80px 24px 60px' : '110px 48px 90px', overflow: 'hidden', background: '#ffffff' }}>

        {/* Subtle red radial glow — warms the hero without competing with content */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '120vw', maxWidth: 1400, height: 620,
          background: 'radial-gradient(ellipse at center top, rgba(229,48,42,0.07) 0%, rgba(229,48,42,0.02) 40%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }}/>

        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1, animation: 'fadeUp 0.5s ease' }}>
          {/* Live badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 100, padding: '7px 17px', marginBottom: 24, boxShadow: 'var(--ytg-shadow)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', animation: 'pulse 2s infinite', boxShadow: '0 0 0 3px rgba(22,163,74,0.15)' }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ytg-text-3)', letterSpacing: '-0.1px' }}>AI-Powered YouTube Intelligence</span>
          </div>

          <h1 style={{ fontWeight: 800, fontSize: isMobile ? 40 : isTablet ? 62 : 72, lineHeight: 1.02, letterSpacing: isMobile ? '-1.5px' : '-2.5px', color: 'var(--ytg-text)', marginBottom: 22, textWrap: 'balance' }}>
            The AI that audits your channel like a <span style={{ color: 'var(--ytg-accent)' }}>$500/hour consultant</span>
          </h1>

          <p style={{ fontSize: isMobile ? 16 : 19, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 620, margin: '0 auto 32px', textWrap: 'pretty' }}>
            10-dimension channel audit. Competitor gap analysis. Thumbnail scoring against real benchmarks. Weekly performance reports. Everything VidIQ shows you as data — YTGrowth tells you what to do with it.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28, flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto' }}>
            <a href="/auth/login" className="ytg-btn-primary" style={{ fontSize: 16, padding: '15px 32px', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
              Analyse my channel free <Arrow />
            </a>
            <a href="#pricing" className="ytg-btn-ghost" style={{ fontSize: 16, padding: '15px 32px', width: isMobile ? '100%' : 'auto', justifyContent: 'center', opacity: isMobile ? 0.85 : 1 }}>
              See pricing
            </a>
          </div>

          {/* Trust row — small green-check pills, mobile-wraps naturally */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: isMobile ? 10 : 18, rowGap: 10 }}>
            {['No credit card required', '5 free analyses on signup', 'Cancel anytime'].map((t, i) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 500, color: 'var(--ytg-text-3)', letterSpacing: '-0.1px' }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="8" cy="8" r="7" fill="rgba(22,163,74,0.11)" stroke="rgba(22,163,74,0.28)" strokeWidth="1"/>
                  <path d="M5 8l2 2 4-4" stroke="#16a34a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile dashboard mockup — same windsor-frame aesthetic, scaled for small screens */}
        {isMobile && (
          <div style={{
            marginTop: 48,
            background: 'linear-gradient(180deg, #0e1020 0%, #0a0d1c 100%)',
            borderRadius: 22,
            padding: '28px 14px 22px',
            boxShadow: '0 24px 60px rgba(10,13,30,0.35)',
          }}>
            {/* Headline */}
            <h2 style={{
              fontSize: 16, fontWeight: 600, color: '#ffffff',
              letterSpacing: '-0.2px', lineHeight: 1.5,
              textAlign: 'center', margin: '0 16px 18px',
            }}>
              The one thing to fix next — no guessing.
            </h2>

            {/* Single active tab pill */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
              <div style={{
                padding: '7px 16px', borderRadius: 999,
                fontSize: 12, fontWeight: 700,
                background: '#ffffff', color: '#0a0d1c',
                boxShadow: '0 2px 10px rgba(255,255,255,0.1)',
              }}>
                Your priority
              </div>
            </div>

            {/* Inner white product card */}
            <div style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: '18px 16px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
            }}>
              {/* Channel + score row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                paddingBottom: 14, borderBottom: '1px solid #f0f0f5',
                marginBottom: 16,
              }}>
                <img
                  src="/avatars/sophie.jpg" alt=""
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0a0a0f', letterSpacing: '-0.2px' }}>Sophie Brandt</p>
                  <p style={{ fontSize: 11.5, color: '#6a6a78', marginTop: 2 }}>42K subscribers</p>
                </div>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <svg width="44" height="44" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#ececf2" strokeWidth="4"/>
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#16a34a" strokeWidth="4" strokeDasharray="81.4 113" strokeLinecap="round" transform="rotate(-90 22 22)"/>
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#0a0a0f', letterSpacing: '-0.3px' }}>72</span>
                  </div>
                </div>
              </div>

              {/* Priority eyebrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 9.5, fontWeight: 800, color: '#d97706', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Priority this week</span>
                <span style={{ flex: 1, height: 1, background: '#ececf2' }}/>
                <span style={{
                  fontSize: 9, fontWeight: 700, color: '#d97706',
                  border: '1.5px solid #d97706', padding: '2px 8px',
                  borderRadius: 999, letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>High</span>
              </div>

              {/* Problem statement */}
              <h3 style={{
                fontSize: 15, fontWeight: 800, color: '#0a0a0f',
                letterSpacing: '-0.3px', lineHeight: 1.4,
                marginBottom: 14,
              }}>
                Watch time is critically short — rewrite openings to hook viewers in the first 15 seconds.
              </h3>

              {/* Stacked details (1 column on mobile) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div style={{ background: 'rgba(79,134,247,0.06)', border: '1px solid rgba(79,134,247,0.15)', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 9.5, fontWeight: 700, color: '#4a7cf7', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Why now</p>
                  <p style={{ fontSize: 12, color: '#3a3a44', lineHeight: 1.5 }}>Avg watch 38s vs 2:30 niche — viewers bail in the first 15s.</p>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #ececf2', borderLeft: '3px solid #d97706', borderRadius: '0 10px 10px 0', padding: '10px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <p style={{ fontSize: 9.5, fontWeight: 700, color: '#d97706', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Action</p>
                  <p style={{ fontSize: 12, color: '#0a0a0f', lineHeight: 1.5, fontWeight: 500 }}>Cold-open hook. Drop the intro, lead with the payoff.</p>
                </div>
                <div style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.18)', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 9.5, fontWeight: 700, color: '#16a34a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Expected outcome</p>
                  <p style={{ fontSize: 12, color: '#3a3a44', lineHeight: 1.5 }}>+40% watch time in 3 weeks.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard mockup — dark frame with headline + tabs, clean white product card nested inside. */}
        <div style={{ maxWidth: 960, margin: '64px auto 0', position: 'relative', display: isMobile ? 'none' : 'block', padding: '0 32px' }}>
          <div style={{
            background: 'linear-gradient(180deg, #0e1020 0%, #0a0d1c 100%)',
            borderRadius: 28,
            padding: '46px 46px 42px',
            boxShadow: '0 40px 100px rgba(10,13,30,0.28), 0 0 0 1px rgba(255,255,255,0.04)',
          }}>
            {/* Headline */}
            <h2 style={{
              fontSize: 22, fontWeight: 600, color: '#ffffff',
              letterSpacing: '-0.3px', lineHeight: 1.5,
              textAlign: 'center', maxWidth: 640, margin: '0 auto 30px',
            }}>
              See your channel the way a $500/hour consultant would — and the one thing to fix next.
            </h2>

            {/* Tab pills */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
              {['Overview', 'Priority actions', 'Competitor gaps', 'Weekly report', 'Milestones'].map((label, i) => (
                <div key={i} style={{
                  padding: '9px 18px', borderRadius: 999,
                  fontSize: 13, fontWeight: 600,
                  background: i === 0 ? '#ffffff' : 'transparent',
                  color: i === 0 ? '#0a0d1c' : 'rgba(255,255,255,0.65)',
                  border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.14)',
                  boxShadow: i === 0 ? '0 2px 10px rgba(255,255,255,0.08)' : 'none',
                  letterSpacing: '-0.1px',
                }}>
                  {label}
                </div>
              ))}
            </div>

            {/* Inner white product card */}
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '26px 28px',
              boxShadow: '0 16px 44px rgba(0,0,0,0.22)',
            }}>
              {/* Channel header + score */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16,
                paddingBottom: 20, borderBottom: '1px solid #f0f0f5',
              }}>
                <img
                  src="/avatars/sophie.jpg" alt=""
                  style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0a0a0f', letterSpacing: '-0.2px' }}>Sophie Brandt</p>
                  <p style={{ fontSize: 12.5, color: '#6a6a78', marginTop: 3 }}>Travel · 42K subscribers · 187K views</p>
                </div>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <svg width="56" height="56" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="23" fill="none" stroke="#ececf2" strokeWidth="5"/>
                    <circle cx="28" cy="28" r="23" fill="none" stroke="#16a34a" strokeWidth="5" strokeDasharray="104 145" strokeLinecap="round" transform="rotate(-90 28 28)"/>
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#0a0a0f', letterSpacing: '-0.4px' }}>72</span>
                  </div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid rgba(134,239,172,0.65)', borderRadius: 999, padding: '4px 11px', flexShrink: 0 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a' }}/>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Healthy</span>
                </span>
              </div>

              {/* Priority action */}
              <div style={{ paddingTop: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: '#d97706', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Priority this week</span>
                  <span style={{ flex: 1, height: 1, background: '#ececf2' }}/>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#d97706',
                    border: '1.5px solid #d97706', padding: '3px 10px',
                    borderRadius: 999, letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>High impact</span>
                </div>

                <h3 style={{
                  fontSize: 18, fontWeight: 800, color: '#0a0a0f',
                  letterSpacing: '-0.4px', lineHeight: 1.4,
                  marginBottom: 18,
                }}>
                  Watch time is critically short — rewrite openings to hook viewers in the first 15 seconds.
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: 8 }}>
                  <div style={{ background: 'rgba(79,134,247,0.06)', border: '1px solid rgba(79,134,247,0.15)', borderRadius: 10, padding: '12px 14px' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#4a7cf7', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Why now</p>
                    <p style={{ fontSize: 12.5, color: '#3a3a44', lineHeight: 1.55 }}>Avg watch 38s vs 2:30 niche — viewers bail in the first 15 seconds.</p>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #ececf2', borderLeft: '3px solid #d97706', borderRadius: '0 10px 10px 0', padding: '12px 14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#d97706', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Action</p>
                    <p style={{ fontSize: 12.5, color: '#0a0a0f', lineHeight: 1.55, fontWeight: 500 }}>Cold-open hook. Drop the intro, lead with the most visual moment or payoff.</p>
                  </div>
                  <div style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.18)', borderRadius: 10, padding: '12px 14px' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Expected outcome</p>
                    <p style={{ fontSize: 12.5, color: '#3a3a44', lineHeight: 1.55 }}>+40% watch time in 3 weeks. Algorithm picks the channel up again.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS BAR — elevated white stat cards, grid layout ─────────── */}
      <div className="section-animate" style={{
        background: '#f4f4f6',
        borderTop: '1px solid rgba(10,10,15,0.06)',
        borderBottom: '1px solid rgba(10,10,15,0.06)',
        padding: isMobile ? '32px 20px' : '44px 64px',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
          gap: isMobile ? 10 : 14,
        }}>
          {[
            ['10',       'Audit dimensions'],
            ['3',        'Competitor benchmarks'],
            ['2-layer',  'Thumbnail scoring'],
            ['Weekly',   'Automated reports'],
            ['7+',       'Core growth tools'],
          ].map(([stat, label], i) => (
            <div key={i} style={{
              background: '#ffffff',
              border: '1px solid rgba(10,10,15,0.07)',
              borderRadius: 14,
              padding: isMobile ? '18px 14px' : '22px 22px',
              textAlign: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 14px rgba(0,0,0,0.05)',
              gridColumn: isMobile && i === 4 ? '1 / -1' : undefined,
            }}>
              <p style={{
                fontSize: isMobile ? 26 : 30, fontWeight: 800,
                color: 'var(--ytg-accent)',
                letterSpacing: '-1px', lineHeight: 1,
                marginBottom: 8,
              }}>{stat}</p>
              <p style={{
                fontSize: 11, fontWeight: 700,
                color: 'rgba(10,10,15,0.52)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}

      {/* Section 1 — Channel Audit */}
      <div id="features" className="section-animate" style={{ background: '#f4f4f6', borderTop: '1px solid rgba(10,10,15,0.08)', borderBottom: '1px solid rgba(10,10,15,0.08)', padding: isMobile ? '60px 24px' : '100px 64px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 40 : 80, alignItems: 'center' }}>
          {/* Text */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Deep Channel Intelligence</p>
            <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 800, letterSpacing: '-1.2px', lineHeight: 1.1, marginBottom: 18, color: 'var(--ytg-text)' }}>10 dimensions. <span style={{ color: 'var(--ytg-accent)' }}>One brutal honest assessment.</span></h2>
            <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.78, marginBottom: 28 }}>Most tools show you a score. YTGrowth shows you why — traffic sources, device breakdown, audience demographics, posting patterns, CTR health, retention, engagement quality, content strategy, SEO, and how you stack up against your actual competitors. All in one audit.</p>
            {[
              'Traffic source breakdown — search vs browse vs external',
              'Competitor benchmarking against channels in your niche',
              'Audience demographics and device profile',
              'Exact priority actions ranked by impact',
            ].map((t, i) => (
              <FeatureBulletRow key={i}>{t}</FeatureBulletRow>
            ))}
          </div>
          {/* Visual */}
          <div style={{ background: '#ffffff', borderRadius: 20, border: '1px solid rgba(10,10,15,0.07)', boxShadow: 'var(--ytg-shadow-xl)', padding: 28 }}>
            {[
              { label: 'CTR Health',          score: 82, pct: '82%' },
              { label: 'Audience Retention',  score: 67, pct: '67%' },
              { label: 'Content Strategy',    score: 71, pct: '71%' },
              { label: 'SEO Discovery',       score: 54, pct: '54%' },
              { label: 'Posting Consistency', score: 90, pct: '90%' },
            ].map((row, i) => {
              const textColor = row.score >= 75 ? '#16a34a' : row.score >= 60 ? '#0a84ff' : row.score >= 40 ? '#f59e0b' : '#e5302a'
              const barColor  = row.score >= 75 ? '#16a34a' : row.score >= 60 ? '#0a84ff' : row.score >= 40 ? '#f59e0b' : '#e5302a'
              return (
                <div key={i} style={{ marginBottom: i < 4 ? 16 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ytg-text-2)' }}>{row.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: textColor }}>{row.score}</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(10,10,15,0.07)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: row.pct, background: barColor, borderRadius: 100 }} />
                  </div>
                </div>
              )
            })}
            <div style={{ borderLeft: '3px solid #d97706', background: 'rgba(217,119,6,0.04)', borderRadius: 8, padding: '12px 16px', marginTop: 16 }}>
              <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.6 }}>SEO Discovery at 54. Competitors average 6.8% CTR. Fix thumbnail text contrast first.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 — Competitor Intelligence */}
      <div className="section-animate" style={{ background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '60px 24px' : '100px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 40 : 80, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          {/* Visual — left on desktop */}
          <div style={{ order: isMobile ? 1 : 0, background: '#111114', borderRadius: 20, border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 48px rgba(0,0,0,0.6)', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.14)', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>TechCreator Pro</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>142K subscribers</p>
                </div>
              </div>
              <span style={{ background: 'rgba(229,48,42,0.22)', color: '#ff3b30', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(229,48,42,0.45)' }}>HIGH</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              <div style={{ borderLeft: '3px solid #f59e0b', background: 'rgba(217,119,6,0.10)', borderRadius: 8, padding: '12px 14px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Content Gap</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.58)' }}>Tutorial content — 0 videos in last 90 days</p>
              </div>
              <div style={{ borderLeft: '3px solid #4ade80', background: 'rgba(22,163,74,0.10)', borderRadius: 8, padding: '12px 14px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Title Opportunity</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.58)' }}>How to [niche topic] in 2026 (Step by Step) — avg 84K views for this format in your niche</p>
              </div>
            </div>
          </div>
          {/* Text — right on desktop */}
          <div style={{ order: isMobile ? 0 : 1 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#ff3b30', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Competitive Edge</p>
            <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 800, letterSpacing: '-1.2px', lineHeight: 1.1, marginBottom: 18, color: '#ffffff' }}>Find the gaps your competitors <span style={{ color: '#ff3b30' }}>leave open.</span></h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.78, marginBottom: 28 }}>Connect a competitor channel and YTGrowth maps exactly what topics they ignore, which title patterns drive their views, and where their audience is underserved. Then tells you how to own those gaps.</p>
            {[
              'Topic gap analysis from real video data',
              'Title pattern and keyword extraction',
              'Threat level assessment per competitor',
              'Ready-to-use video ideas from gap analysis',
            ].map((t, i) => (
              <FeatureBulletRow key={i} onDark>{t}</FeatureBulletRow>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3 — Thumbnail IQ */}
      <div className="section-animate" style={{ background: '#f4f4f6', borderTop: '1px solid rgba(10,10,15,0.08)', borderBottom: '1px solid rgba(10,10,15,0.08)', padding: isMobile ? '60px 24px' : '100px 64px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 40 : 80, alignItems: 'center' }}>
          {/* Text */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Thumbnail Intelligence</p>
            <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 800, letterSpacing: '-1.2px', lineHeight: 1.1, marginBottom: 18, color: 'var(--ytg-text)' }}>Scored against the videos <span style={{ color: 'var(--ytg-accent)' }}>actually winning in your niche.</span></h2>
            <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.78, marginBottom: 28 }}>Two layers of analysis — a deterministic algorithm checking contrast, text clarity, face detection, and composition, then Claude Vision comparing it against top-performing videos in your exact niche. You get a score out of 100 and know exactly what to fix.</p>
            {[
              'Layer 1 — algorithm, instant, free',
              'Layer 2 — YTGrowth vision vs real niche benchmarks',
              'Benchmarked by velocity, recency, and channel size bracket',
              'Full history — every thumbnail scored',
            ].map((t, i) => (
              <FeatureBulletRow key={i}>{t}</FeatureBulletRow>
            ))}
          </div>
          {/* Visual */}
          <div style={{ background: '#ffffff', borderRadius: 20, boxShadow: 'var(--ytg-shadow-xl)', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 20 }}>
              <span style={{ fontSize: 52, fontWeight: 800, color: '#16a34a', letterSpacing: '-2px', lineHeight: 1 }}>74</span>
              <span style={{ fontSize: 20, fontWeight: 400, color: 'var(--ytg-text-3)' }}>/100</span>
            </div>
            {[
              { label: 'Algorithm score', value: '42 / 60' },
              { label: 'Vision score',    value: '32 / 40' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ytg-border)', padding: '12px 0' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ytg-text-2)' }}>{row.label}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ytg-text)' }}>{row.value}</span>
              </div>
            ))}
            <div style={{ borderLeft: '3px solid #d97706', background: 'rgba(217,119,6,0.04)', borderRadius: 8, padding: '12px 14px', marginTop: 16 }}>
              <p style={{ fontSize: 14, color: 'var(--ytg-text-2)' }}>Text too small for mobile — increase font weight or reduce to 4 words max.</p>
            </div>
            <p style={{ fontSize: 12, color: 'var(--ytg-text-3)', marginTop: 12 }}>Top thumbnails in your niche average 81/100</p>
          </div>
        </div>
      </div>

      {/* Section 4 — Weekly Report */}
      <div className="section-animate" style={{ background: '#e6e7ec', borderTop: '1px solid rgba(10,10,15,0.08)', borderBottom: '1px solid rgba(10,10,15,0.08)', padding: isMobile ? '60px 24px' : '100px 64px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 40 : 80, alignItems: 'center' }}>
          {/* Visual — left on desktop */}
          <div style={{ order: isMobile ? 1 : 0, background: '#ffffff', borderRadius: 20, border: '1px solid rgba(10,10,15,0.07)', boxShadow: 'var(--ytg-shadow-xl)', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ytg-text)' }}>Week of Apr 7 – Apr 13</span>
              <span style={{ background: '#f0fdf4', border: '1px solid rgba(134,239,172,0.6)', color: '#16a34a', fontSize: 12, fontWeight: 600, borderRadius: 20, padding: '3px 10px' }}>Latest</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { val: '+124 subs',  delta: '↑ this week',   dc: '#16a34a' },
                { val: '+8.2K views', delta: '↑ vs last week', dc: '#16a34a' },
                { val: 'CTR 4.8%',   delta: '↑ +0.6%',       dc: '#16a34a' },
                { val: 'Score 71',   delta: '→ steady',       dc: 'var(--ytg-text-3)' },
              ].map((pill, i) => (
                <div key={i} style={{ background: 'var(--ytg-bg)', border: '1px solid var(--ytg-border)', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.5px', lineHeight: 1 }}>{pill.val}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: pill.dc, marginTop: 3 }}>{pill.delta}</p>
                </div>
              ))}
            </div>
            <div style={{ borderLeft: '3px solid var(--ytg-accent)', background: 'rgba(229,48,42,0.04)', borderRadius: 8, padding: '14px 16px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-accent)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Priority this week</p>
              <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.6 }}>Upload on Tuesday before 10am — your last 3 best weeks all started with a Tuesday upload.</p>
            </div>
          </div>
          {/* Text — right on desktop */}
          <div style={{ order: isMobile ? 0 : 1 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Automated Intelligence</p>
            <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 800, letterSpacing: '-1.2px', lineHeight: 1.1, marginBottom: 18, color: 'var(--ytg-text)' }}>Your channel's weekly performance, <span style={{ color: 'var(--ytg-accent)' }}>in your inbox.</span></h2>
            <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.78, marginBottom: 28 }}>Every week YTGrowth generates a performance report — key metrics, biggest win, what to watch out for, and one priority action. Sent automatically every week. Always in your dashboard even if you unsubscribe from email.</p>
            {[
              'Subscribers, views, retention, channel score',
              'Week-on-week delta on every metric',
              'One priority action per week',
              'Full history in your dashboard',
            ].map((t, i) => (
              <FeatureBulletRow key={i}>{t}</FeatureBulletRow>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <div id="how-it-works" className="section-animate" style={{ background: '#e8e9ee', borderTop: '1px solid rgba(10,10,15,0.06)', borderBottom: '1px solid rgba(10,10,15,0.06)', padding: isMobile ? '60px 20px' : '100px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 600, background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="section-animate" style={{ textAlign: 'center', marginBottom: 56 }}> {/* IMPROVED: section-animate */}
            <Badge>How it works</Badge>
            <h2 style={{ fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 16 }}>From zero to action plan<br />in 30 seconds.</h2> {/* IMPROVED: 14→16 */}
            <p style={{ fontSize: 16, color: 'var(--ytg-text-2)', maxWidth: 620, margin: '0 auto', lineHeight: 1.8 }}>No setup, no configuration, no API keys. Just connect and go.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 14, maxWidth: isMobile ? 480 : '100%', margin: '0 auto' }}>
            {[
              {
                n: '01', t: 'Connect your channel', d: 'Sign in with Google and grant read-only access. We never post, edit, or store your content.',
                card: (
                  <div style={{ background: '#f0f0f4', border: `1px solid var(--ytg-border)`, borderRadius: 13, padding: 18, marginBottom: 22 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
                      <Logo size={32} />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ytg-text)' }}>YTGrowth</p>
                        <p style={{ fontSize: 12, color: 'var(--ytg-text-3)' }}>wants YouTube read access</p>
                      </div>
                    </div>
                    <div style={{ background: 'var(--ytg-section)', borderRadius: 8, padding: '8px 12px', marginBottom: 11, fontSize: 12, color: 'var(--ytg-text-3)' }}>Read-only · No posting · Fully secure</div>
                    <div style={{ display: 'flex', gap: 7 }}>
                      <div style={{ flex: 1, background: 'var(--ytg-card-2)', borderRadius: 8, padding: '9px', textAlign: 'center', fontSize: 12, color: 'var(--ytg-text-2)', fontWeight: 500 }}>Cancel</div>
                      <div style={{ flex: 1, background: '#ff3b30', borderRadius: 8, padding: '9px', textAlign: 'center', fontSize: 12, color: '#fff', fontWeight: 700 }}>Allow</div>
                    </div>
                  </div>
                )
              },
              {
                n: '02', t: 'We scan everything', d: '12+ metrics analyzed automatically: retention, watch time, upload cadence, engagement, and your top competitors.',
                card: (
                  <div style={{ background: '#f0f0f4', border: `1px solid var(--ytg-border)`, borderRadius: 13, padding: 18, marginBottom: 22 }}>
                    <p style={{ fontSize: 12, color: 'var(--ytg-text-3)', fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Analyzing your channel</p>
                    {[{ l: 'Channel metrics', w: '100%', c: '#0a84ff' }, { l: 'Video performance', w: '100%', c: '#0a84ff' }, { l: 'Competitor data', w: '72%', c: '#0a84ff' }, { l: 'Generating insights', w: '38%', c: '#ffd60a' }].map((item, i) => (
                      <div key={i} style={{ marginBottom: i < 3 ? 11 : 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 12, color: 'var(--ytg-text-2)', fontWeight: 500 }}>{item.l}</span>
                          <span style={{ fontSize: 12, color: item.c, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{item.w}</span>
                        </div>
                        <div style={{ background: 'var(--ytg-border)', borderRadius: 100, height: 3, overflow: 'hidden' }}>
                          <div style={{ width: item.w, height: '100%', background: item.c, borderRadius: 100 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              },
              {
                n: '03', t: 'Get your action plan', d: 'Every issue ranked by impact with one specific action. Concrete steps based on your actual channel data.',
                card: (
                  <div style={{ background: '#f0f0f4', border: `1px solid var(--ytg-border)`, borderRadius: 13, padding: 18, marginBottom: 22 }}>
                    <p style={{ fontSize: 12, color: 'var(--ytg-text-3)', fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your action plan</p>
                    {[{ c: '#ff3b30', t: 'Rewrite video openings', s: 'Critical' }, { c: '#ffd60a', t: 'Post 1 video per week', s: 'High' }, { c: '#0a84ff', t: 'Add like CTA at 30%', s: 'Medium' }].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', background: 'var(--ytg-section)', border: `1px solid var(--ytg-border)`, borderRadius: 9, marginBottom: i < 2 ? 7 : 0 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.c, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: 'var(--ytg-text-2)', fontWeight: 500, flex: 1 }}>{item.t}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: item.c, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.s}</span>
                      </div>
                    ))}
                  </div>
                )
              },
            ].map((step, i) => (
              <div key={i} className="ytg-step-card">
                {step.card}
                <div style={{ width: 36, height: 36, background: 'var(--ytg-card-2)', border: '1px solid var(--ytg-border-2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}> {/* IMPROVED: 12→16px marginBottom */}
                  <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--ytg-text-3)', fontVariantNumeric: 'tabular-nums' }}>{step.n}</span>
                </div>
                <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--ytg-text)', marginBottom: 9, letterSpacing: '-0.3px' }}>{step.t}</p>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.9 }}>{step.d}</p> {/* IMPROVED: 13.5→14.5px, 1.8→1.9 */}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS — renders only when reviews.json has 3+ entries ── */}
      <Testimonials isMobile={isMobile} />

      {/* ── FOUNDER PRICING BAND ─────────────────────────────────────────── */}
      <FounderPricingBand isMobile={isMobile} />

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <div id="pricing" style={{ background: '#f4f4f6', borderTop: '1px solid rgba(10,10,15,0.06)', borderBottom: '1px solid rgba(10,10,15,0.06)', padding: isMobile ? '60px 20px' : '100px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 1000, height: 600, background: 'radial-gradient(ellipse, rgba(229,48,42,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '10%', width: 500, height: 400, background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="section-animate" style={{ textAlign: 'center', marginBottom: 48 }}> {/* IMPROVED: section-animate */}
            <Badge>Pricing</Badge>
            <h2 style={{ fontWeight: 800, fontSize: isMobile ? 28 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 16 }}>One good video idea pays for a year.</h2> {/* IMPROVED: 14→16 */}
            <p style={{ fontSize: 16, color: 'var(--ytg-text-2)', lineHeight: 1.8 }}>AI-powered analysis across 5 tools — find what's working in your niche, then do more of it.</p>
          </div>

          {/* Tab switcher */}
          <div style={{ overflowX: isMobile ? 'auto' : 'visible', marginBottom: isMobile ? 32 : 52, display: 'flex', justifyContent: isMobile ? 'flex-start' : 'center', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', paddingLeft: isMobile ? 20 : 0 }}> {/* IMPROVED: paddingLeft on mobile to prevent first tab clip */}
            <div style={{ display: 'inline-flex', background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 100, padding: 4, gap: 2, flexWrap: 'nowrap', flexShrink: 0, margin: isMobile ? '0 auto' : undefined }}>
              {[
                ['monthly',  isMobile ? 'Monthly' : 'Monthly'],
                ['annual',   isMobile ? 'Annual' : 'Annual · 2 months free'],
                ['lifetime', 'Lifetime'],
                ['founder',  isMobile ? 'Bundles' : 'Founder Bundles'],
                ['packs',    isMobile ? 'Packs' : 'Analysis Packs'],
              ].map(([val, label]) => (
                <button key={val} onClick={() => setPricingTab(val)} style={{
                  padding: '9px 18px', borderRadius: 100, border: 'none', cursor: 'pointer',
                  fontFamily: "'Inter', system-ui, sans-serif", fontSize: isMobile ? 11 : 13, fontWeight: 600,
                  background: pricingTab === val ? '#ff3b30' : 'transparent',
                  color: pricingTab === val ? '#fff' : 'var(--ytg-text-3)',
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* ── MONTHLY ── */}
          {pricingTab === 'monthly' && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 14, maxWidth: isMobile ? 480 : '100%', margin: '0 auto' }}>
              <div className="ytg-pricing-card">
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Free</p>
                <p style={{ fontWeight: 800, fontSize: 46, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1, marginBottom: 4 }}>$0</p>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>Forever free</p>
                <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>Built for dipping your toes in</p>
                {['Full channel audit (1 channel)', '5 lifetime AI analyses', 'SEO Studio (limited)', 'Keyword Explorer (view only)', 'Thumbnail IQ (limited credits)', 'No Competitor Analysis', 'No Title Optimizer', 'No Video Ideas', 'No weekly reports'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>{f.startsWith('No ') ? <NoCheck /> : <Check />}<span style={{ fontSize: 14, color: f.startsWith('No ') ? 'var(--ytg-text-4)' : 'var(--ytg-text-2)' }}>{f}</span></div>
                ))}
                <a href="/auth/login" className="ytg-btn-ghost" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Start free</a>
              </div>

              <div className="ytg-pricing-card">
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Solo</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                  <p style={{ fontWeight: 800, fontSize: 46, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1 }}>$19</p>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 7 }}>/mo</p>
                </div>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>20 analyses/month</p>
                <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>Built for solo creators who post consistently</p>
                {['Full channel audit (up to 3 channels)', '20 AI analyses/month', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer', 'Video Ideas', 'Competitor Analysis (up to 2 rivals)', 'Thumbnail IQ (standard credits)', 'No weekly reports'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>{f.startsWith('No ') ? <NoCheck /> : <Check />}<span style={{ fontSize: 14, color: f.startsWith('No ') ? 'var(--ytg-text-4)' : 'var(--ytg-text-2)' }}>{f}</span></div>
                ))}
                <button onClick={() => openCheckout('solo_monthly')} className="ytg-btn-ghost" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Get Solo</button>
              </div>

              <div className="ytg-pricing-card-featured">
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--ytg-accent), #ff7a73)' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Growth</p>
                  <span style={{ fontSize: 12, fontWeight: 700, background: 'var(--ytg-accent-light)', color: 'var(--ytg-accent-text)', border: '1px solid var(--ytg-accent-border)', padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Most popular</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                  <p style={{ fontWeight: 800, fontSize: 46, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1 }}>$49</p>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 7 }}>/mo</p>
                </div>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>50 analyses/month</p>
                <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>Built for creators serious about hitting 100k</p>
                {['Full channel audit (up to 5 channels)', '50 AI analyses/month', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer', 'Video Ideas', 'Competitor Analysis (up to 5 rivals)', 'Thumbnail IQ (increased credits)', 'Weekly report emails'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check color="var(--ytg-accent)" /><span style={{ fontSize: 14, color: 'var(--ytg-text)' }}>{f}</span></div>
                ))}
                <button onClick={() => openCheckout('growth_monthly')} className="ytg-btn-primary" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Start with Growth</button>
              </div>

              <div className="ytg-pricing-card">
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Agency</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                  <p style={{ fontWeight: 800, fontSize: 46, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1 }}>$149</p>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 7 }}>/mo</p>
                </div>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>150 analyses/month</p>
                <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>Built for agencies and multi-channel operators</p>
                {['Full channel audit (up to 10 channels, pooled)', '150 AI analyses/month', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer', 'Video Ideas', 'Competitor Analysis (up to 10 rivals)', 'Thumbnail IQ (maximum credits)', 'Weekly reports + priority support'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text-2)' }}>{f}</span></div>
                ))}
                <button onClick={() => openCheckout('agency_monthly')} className="ytg-btn-ghost" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Get Agency</button>
              </div>
            </div>
          )}

          {/* ── ANNUAL ── */}
          {pricingTab === 'annual' && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 14, maxWidth: isMobile ? 480 : '100%', margin: '0 auto' }}>
              <div className="ytg-pricing-card">
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Free</p>
                <p style={{ fontWeight: 800, fontSize: 46, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1, marginBottom: 4 }}>$0</p>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 22 }}>Forever free</p>
                {['Full channel audit (1 channel)', '5 lifetime AI analyses', 'SEO Studio (limited)', 'Keyword Explorer (view only)', 'Thumbnail IQ (limited credits)', 'No Competitor Analysis', 'No Title Optimizer', 'No Video Ideas', 'No weekly reports'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>{f.startsWith('No ') ? <NoCheck /> : <Check />}<span style={{ fontSize: 14, color: f.startsWith('No ') ? 'var(--ytg-text-4)' : 'var(--ytg-text-2)' }}>{f}</span></div>
                ))}
                <a href="/auth/login" className="ytg-btn-ghost" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Start free</a>
              </div>

              <div className="ytg-pricing-card">
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Solo — Annual</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 2 }}>
                  <p style={{ fontWeight: 800, fontSize: 46, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1 }}>$190</p>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 7 }}>/year</p>
                </div>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 2 }}>$15.83 / month equivalent</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#30d158', marginBottom: 22 }}>You save $38</p>
                {['Full channel audit (up to 3 channels)', '20 AI analyses/month', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer', 'Video Ideas', 'Competitor Analysis (up to 2 rivals)', 'Thumbnail IQ (standard credits)', 'No weekly reports'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>{f.startsWith('No ') ? <NoCheck /> : <Check />}<span style={{ fontSize: 14, color: f.startsWith('No ') ? 'var(--ytg-text-4)' : 'var(--ytg-text-2)' }}>{f}</span></div>
                ))}
                <button onClick={() => openCheckout('solo_annual')} className="ytg-btn-ghost" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Commit to Solo</button>
              </div>

              <div className="ytg-pricing-card-featured">
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--ytg-accent), #ff7a73)' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Growth — Annual</p>
                  <span style={{ fontSize: 12, fontWeight: 700, background: 'var(--ytg-accent-light)', color: 'var(--ytg-accent-text)', border: '1px solid var(--ytg-accent-border)', padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Best value</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 2 }}>
                  <p style={{ fontWeight: 800, fontSize: 46, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1 }}>$490</p>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 7 }}>/year</p>
                </div>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 2 }}>$40.83 / month equivalent</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#30d158', marginBottom: 22 }}>You save $98</p>
                {['Full channel audit (up to 5 channels)', '50 AI analyses/month', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer', 'Video Ideas', 'Competitor Analysis (up to 5 rivals)', 'Thumbnail IQ (increased credits)', 'Weekly report emails'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check color="var(--ytg-accent)" /><span style={{ fontSize: 14, color: 'var(--ytg-text)' }}>{f}</span></div>
                ))}
                <button onClick={() => openCheckout('growth_annual')} className="ytg-btn-primary" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Commit to Growth</button>
              </div>

              <div className="ytg-pricing-card">
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Agency — Annual</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 2 }}>
                  <p style={{ fontWeight: 800, fontSize: 38, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1 }}>$1,490</p> {/* IMPROVED: 42→38px for 4-digit price */}
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 7 }}>/year</p>
                </div>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 2 }}>$124.17 / month equivalent</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#30d158', marginBottom: 22 }}>You save $298</p>
                {['Full channel audit (up to 10 channels, pooled)', '150 AI analyses/month', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer', 'Video Ideas', 'Competitor Analysis (up to 10 rivals)', 'Thumbnail IQ (maximum credits)', 'Weekly reports + priority support'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text-2)' }}>{f}</span></div>
                ))}
                <button onClick={() => openCheckout('agency_annual')} className="ytg-btn-ghost" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Commit to Agency</button>
              </div>
            </div>
          )}

          {/* ── LIFETIME ── */}
          {pricingTab === 'lifetime' && (
            <div>
              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 36, lineHeight: 1.8 }}>
                Pay once. Get the monthly analyses forever. Limited to the first <strong style={{ color: 'var(--ytg-text)' }}>500 buyers</strong> — after that, this page goes away.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 14, maxWidth: isMobile ? 480 : '100%', margin: '0 auto' }}>
                <div className="ytg-pricing-card" style={{ padding: '36px 32px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Lifetime Solo</p>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 18, lineHeight: 1.6 }}>Pay once. Keep the analyses coming, forever.</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                    <p style={{ fontWeight: 800, fontSize: 52, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1 }}>$149</p>
                    <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>one-time</p>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>Equivalent to ~8 months of Solo</p>
                  <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>Worth $456 over 2 years of subscription</p>
                  {['Full channel audit (up to 3 channels)', '20 AI analyses/month — forever', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer', 'Video Ideas', 'Competitor Analysis (up to 2 rivals)', 'Thumbnail IQ (standard credits)', 'No weekly reports', 'One-time payment, no subscription'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>{f.startsWith('No ') ? <NoCheck /> : <Check />}<span style={{ fontSize: 14, color: f.startsWith('No ') ? 'var(--ytg-text-4)' : 'var(--ytg-text-2)' }}>{f}</span></div>
                  ))}
                  <p style={{ fontSize: 12, color: '#ff3b30', fontWeight: 700, marginTop: 18, marginBottom: 12 }}>Only 500 available — limited spots</p>
                  <button onClick={() => openCheckout('solo_lifetime')} className="ytg-btn-ghost" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>Lock In Lifetime Access</button>
                </div>

                <div className="ytg-pricing-card-featured" style={{ padding: '36px 32px' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--ytg-accent), #ff7a73)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Lifetime Growth</p>
                    <span style={{ fontSize: 12, fontWeight: 700, background: 'var(--ytg-accent-light)', color: 'var(--ytg-accent-text)', border: '1px solid var(--ytg-accent-border)', padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Best deal</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 18, lineHeight: 1.6 }}>Pay once. Keep the analyses coming, forever.</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                    <p style={{ fontWeight: 800, fontSize: 52, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1 }}>$349</p>
                    <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>one-time</p>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>Equivalent to ~7 months of Growth</p>
                  <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>Worth $1,176 over 2 years of subscription</p>
                  {['Full channel audit (up to 5 channels)', '50 AI analyses/month — forever', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer', 'Video Ideas', 'Competitor Analysis (up to 5 rivals)', 'Thumbnail IQ (increased credits)', 'Weekly report emails', 'One-time payment, no subscription'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check color="var(--ytg-accent)" /><span style={{ fontSize: 14, color: 'var(--ytg-text)' }}>{f}</span></div>
                  ))}
                  <p style={{ fontSize: 12, color: '#ff3b30', fontWeight: 700, marginTop: 18, marginBottom: 12 }}>Only 500 available — limited spots</p>
                  <button onClick={() => openCheckout('growth_lifetime')} className="ytg-btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>Lock In Lifetime Access</button>
                </div>

                <div className="ytg-pricing-card" style={{ padding: '36px 32px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Lifetime Agency</p>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 18, lineHeight: 1.6 }}>Pay once. Manage your whole roster of channels, forever.</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                    <p style={{ fontWeight: 800, fontSize: 52, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1 }}>$897</p>
                    <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>one-time</p>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>Equivalent to ~6 months of Agency</p>
                  <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>Worth $3,576 over 2 years of subscription</p>
                  {['Full channel audit (up to 10 channels, pooled)', '150 AI analyses/month — forever', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer', 'Video Ideas', 'Competitor Analysis (up to 10 rivals)', 'Thumbnail IQ (maximum credits)', 'Weekly reports + priority support', 'One-time payment, no subscription'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text-2)' }}>{f}</span></div>
                  ))}
                  <p style={{ fontSize: 12, color: '#ff3b30', fontWeight: 700, marginTop: 18, marginBottom: 12 }}>Only 500 available — limited spots</p>
                  <button onClick={() => openCheckout('agency_lifetime')} className="ytg-btn-ghost" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>Lock In Lifetime Access</button>
                </div>
              </div>
            </div>
          )}

          {/* ── FOUNDER BUNDLES ── */}
          {pricingTab === 'founder' && (
            <div>
              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 36, lineHeight: 1.8 }}>
                The all-in option. Lifetime access plus a bonus stack of analyses to hit the ground running — for the early believers.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 14, maxWidth: isMobile ? 480 : '100%', margin: '0 auto' }}>
                <div className="ytg-pricing-card" style={{ padding: '36px 32px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Founder Solo</p>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 18, lineHeight: 1.6 }}>Pay once, grow forever, start with ammo loaded.</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                    <p style={{ fontWeight: 800, fontSize: 52, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1 }}>$169</p>
                    <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>one-time</p>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 2 }}>Lifetime Solo + 60 bonus analyses</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#30d158', marginBottom: 22 }}>You're getting $190+ in value</p>
                  {['Full channel audit (up to 3 channels)', '20 AI analyses/month — forever', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer', 'Video Ideas', 'Competitor Analysis (up to 2 rivals)', 'Thumbnail IQ (standard credits)', '+60 bonus analyses, on us — never expire'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text-2)' }}>{f}</span></div>
                  ))}
                  <button onClick={() => openCheckout('founder_solo')} className="ytg-btn-ghost" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Become a Founder</button>
                </div>

                <div className="ytg-pricing-card-featured" style={{ padding: '36px 32px' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--ytg-accent), #ff7a73)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Founder Growth</p>
                    <span style={{ fontSize: 12, fontWeight: 700, background: 'var(--ytg-accent-light)', color: 'var(--ytg-accent-text)', border: '1px solid var(--ytg-accent-border)', padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Most popular</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 18, lineHeight: 1.6 }}>Pay once, grow forever, start with ammo loaded.</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                    <p style={{ fontWeight: 800, fontSize: 52, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1 }}>$389</p>
                    <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>one-time</p>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 2 }}>Lifetime Growth + 75 bonus analyses</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#30d158', marginBottom: 22 }}>You're getting $490+ in value</p>
                  {['Full channel audit (up to 5 channels)', '50 AI analyses/month — forever', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer + Video Ideas', 'Competitor Analysis (up to 5 rivals)', 'Thumbnail IQ (increased credits)', 'Weekly report emails', '+75 bonus analyses, on us — never expire'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check color="var(--ytg-accent)" /><span style={{ fontSize: 14, color: 'var(--ytg-text)' }}>{f}</span></div>
                  ))}
                  <button onClick={() => openCheckout('founder_growth')} className="ytg-btn-primary" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Become a Founder</button>
                </div>

                <div className="ytg-pricing-card" style={{ padding: '36px 32px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Founder Agency</p>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 18, lineHeight: 1.6 }}>Pay once, grow your whole roster, start with ammo loaded.</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                    <p style={{ fontWeight: 800, fontSize: 52, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1 }}>$949</p>
                    <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>one-time</p>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 2 }}>Lifetime Agency + 150 bonus analyses</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#30d158', marginBottom: 22 }}>You're getting $1,100+ in value</p>
                  {['Full channel audit (up to 10 channels, pooled)', '150 AI analyses/month — forever', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer + Video Ideas', 'Competitor Analysis (up to 10 rivals)', 'Thumbnail IQ (maximum credits)', 'Weekly reports + priority support', '+150 bonus analyses, on us — never expire'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text-2)' }}>{f}</span></div>
                  ))}
                  <button onClick={() => openCheckout('founder_agency')} className="ytg-btn-ghost" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Become a Founder</button>
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYSIS PACKS ── */}
          {pricingTab === 'packs' && (
            <div>
              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 36, lineHeight: 1.8 }}>
                No subscription needed. Buy a pack, run analyses whenever you want — they never expire and work across all tools.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 14, marginBottom: 20, maxWidth: isMobile ? 480 : '100%', margin: isMobile ? '0 auto 20px' : '0 0 20px' }}>
                <div className="ytg-pricing-card" style={{ padding: '36px 32px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Quick Boost</p>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 18, lineHeight: 1.6 }}>A top-up when you run low mid-sprint.</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                    <p style={{ fontWeight: 800, fontSize: 52, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1 }}>$15</p>
                    <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>one-time</p>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>20 AI analyses</p>
                  <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>$0.75 per analysis</p>
                  {['20 AI analyses, yours to keep', 'Works with any plan — or no plan', 'Use across all tools', 'Stack on top of your monthly allowance', 'Never expire'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text-2)' }}>{f}</span></div>
                  ))}
                  <button onClick={() => openCheckout('pack_20')} className="ytg-btn-ghost" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Buy Analyses</button>
                </div>

                <div className="ytg-pricing-card-featured" style={{ padding: '36px 32px' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--ytg-accent), #ff7a73)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Power Pack</p>
                    <span style={{ fontSize: 12, fontWeight: 700, background: 'var(--ytg-accent-light)', color: 'var(--ytg-accent-text)', border: '1px solid var(--ytg-accent-border)', padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Most popular</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 18, lineHeight: 1.6 }}>Two solid months of deep dives.</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                    <p style={{ fontWeight: 800, fontSize: 52, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1 }}>$42</p>
                    <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>one-time</p>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>60 AI analyses</p>
                  <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>$0.70 per analysis</p>
                  {['60 AI analyses, yours to keep', 'Works with any plan — or no plan', 'Use across all tools', 'Stack on top of your monthly allowance', 'Never expire'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check color="var(--ytg-accent)" /><span style={{ fontSize: 14, color: 'var(--ytg-text)' }}>{f}</span></div>
                  ))}
                  <button onClick={() => openCheckout('pack_60')} className="ytg-btn-primary" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Buy Analyses</button>
                </div>

                <div className="ytg-pricing-card" style={{ padding: '36px 32px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Full Arsenal</p>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 18, lineHeight: 1.6 }}>Go deep. Analyse everything. Leave nothing unturned.</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                    <p style={{ fontWeight: 800, fontSize: 52, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1 }}>$99</p>
                    <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>one-time</p>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>150 AI analyses</p>
                  <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>$0.66 per analysis</p>
                  {['150 AI analyses, yours to keep', 'Works with any plan — or no plan', 'Use across all tools', 'Stack on top of your monthly allowance', 'Never expire'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text-2)' }}>{f}</span></div>
                  ))}
                  <button onClick={() => openCheckout('pack_150')} className="ytg-btn-ghost" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Buy Analyses</button>
                </div>
              </div>
              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ytg-text-3)', lineHeight: 1.8 }}>
                Pack analyses never expire and work across all tools. Subscribe later and your pack analyses stack on top of your monthly allowance.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <div id="faq" style={{ background: '#f4f4f6', borderTop: '1px solid rgba(10,10,15,0.08)', borderBottom: '1px solid rgba(10,10,15,0.08)', padding: isMobile ? '60px 20px' : '100px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 600, background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Badge>Frequently Asked Questions</Badge>
            <h2 style={{ fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 14 }}>Questions answered.</h2>
            <p style={{ fontSize: 16, color: 'var(--ytg-text-2)', lineHeight: 1.8 }}>Everything you want to know before you decide.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { q: 'Is YTGrowth worth it when my channel is under 1,000 subscribers?', a: "Especially then. The smaller your channel, the higher the leverage of a single good decision — right title, right topic, right timing. You can't afford to guess when you're getting 200 views a video." },
              { q: 'What happens when I run out of AI analyses before my month resets?', a: "Your features pause until your monthly analyses refill on the 1st, or until you grab a top-up pack. You'll see a warning banner at 80% so you're never surprised mid-sprint." },
              { q: 'How is YTGrowth different from TubeBuddy or VidIQ, exactly?', a: "TubeBuddy and VidIQ show you dashboards and data. YTGrowth runs the actual AI analysis — competitor gaps, keyword intent, title variants — and hands you the conclusion, not the raw numbers." },
              { q: 'Can I cancel or change my subscription at any time?', a: "Yes. Monthly is month-to-month — cancel whenever. Annual gives you the rest of your year. No cancellation fees, no guilt-trip retention email. Just done." },
              { q: 'Do unused monthly analyses roll over to the following month?', a: "Monthly included analyses reset every month — use them or lose them. But top-up pack analyses never expire and never reset. They sit in your account until you need them." },
              { q: 'Can I purchase and use analysis packs without a subscription plan?', a: "Yes. Packs work standalone — buy a pack, run analyses, no subscription required. If you have analyses, you have full access. Subscribe later and your pack analyses stack on top." },
              { q: 'Is the lifetime deal truly lifetime, and what happens if you shut down?', a: "If we shut down, you get a pro-rated refund based on time remaining against a 5-year expected lifespan. We're also small enough that your lifetime deal revenue genuinely helps us stay running — you're part of the bet." },
              { q: 'Can I manage and analyze multiple client channels on the agency plan?', a: "Yes. Agency supports up to 10 channels (5 on lifetime agency deals) with pooled analyses. You run the analyses, you own the insights, your clients see the results." },
            ].map((item, i) => {
              const isOpen = openFaq === i
              return (
                <div
                  key={i}
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="ytg-faq-card"
                  style={{
                    border: `1px solid ${isOpen ? 'var(--ytg-accent-border)' : 'var(--ytg-border)'}`,
                    borderLeft: isOpen ? '3px solid var(--ytg-accent)' : undefined, /* IMPROVED: accent left border when open */
                    boxShadow: isOpen ? '0 8px 28px rgba(99,102,241,0.1), 0 2px 8px rgba(0,0,0,0.06)' : undefined,
                    transform: isOpen ? 'translateY(-1px)' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '18px 18px' : '22px 26px', gap: 14 }}>
                    <p style={{ fontWeight: 700, fontSize: isMobile ? 14 : 15.5, color: 'var(--ytg-text)', letterSpacing: '-0.3px', lineHeight: 1.4, margin: 0 }}>{item.q}</p>
                    <div style={{
                      width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                      background: isOpen ? 'var(--ytg-accent-light)' : 'var(--ytg-card-2)',
                      border: `1px solid ${isOpen ? 'var(--ytg-accent-border)' : 'var(--ytg-border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}>
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1)' }}>
                        <path d="M6 1v10M1 6h10" stroke={isOpen ? 'var(--ytg-accent)' : 'var(--ytg-text-3)'} strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <div className={`ytg-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="ytg-faq-answer-inner">
                      <div style={{ padding: isMobile ? '0 18px 20px' : '0 26px 24px', borderTop: '1px solid var(--ytg-border)' }}>
                        <p style={{ fontSize: isMobile ? 14 : 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.85, paddingTop: 18, margin: 0 }}>{item.a}</p> {/* IMPROVED: mobile 13.5→14px */}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
      <div style={{ background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.07)', padding: isMobile ? '70px 24px' : '120px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Badge>Get started</Badge>
          <h2 style={{ fontWeight: 800, fontSize: isMobile ? 44 : 64, letterSpacing: isMobile ? '-1.5px' : '-2.5px', color: '#ffffff', marginBottom: 18, lineHeight: 1.02 }}>
            Stop making videos<br />
            <span style={{ color: 'var(--ytg-accent)' }}>nobody finds.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.52)', marginBottom: 48, lineHeight: 1.8, maxWidth: 620, margin: '0 auto 48px' }}>
            Start free. Run your first AI analysis on the house. See exactly what's holding your channel back.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' }}>
            <a href="/auth/login" className="ytg-btn-primary" style={{ fontSize: 16, padding: '16px 38px' }}>
              Start free <Arrow />
            </a>
            <button onClick={() => { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); setPricingTab('lifetime') }} className="ytg-btn-ghost" style={{ fontSize: 16, padding: '16px 38px', background: 'rgba(255,255,255,0.07)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)', boxShadow: 'none' }}>
              View lifetime deals
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 16 }}>No credit card · Lifetime deals capped at 500.</p>
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.07)', padding: isMobile ? '28px 20px' : '36px 64px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 20 : 0, textAlign: isMobile ? 'center' : 'left' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
            <Logo size={26} />
            <span style={{ fontWeight: 800, fontSize: 14, color: '#ffffff', letterSpacing: '-0.4px' }}>YTGrowth</span>
          </a>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.32)' }}>Built for creators serious about growth.</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)' }}>© 2026 YTGrowth. All rights reserved.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? '12px 20px' : 28, justifyContent: isMobile ? 'center' : 'flex-end' }}>
            {[
              { label: 'Privacy policy',   href: '/privacy' },
              { label: 'Terms of service', href: '/terms' },
              { label: 'Refund policy',    href: '/refund' },
              { label: 'Affiliates',       href: '/affiliate' },
              { label: 'Log in',           href: '/auth/login' },
            ].map((l, i) => (
              <a key={i} href={l.href} style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textDecoration: 'none', transition: 'color 0.15s', fontFamily: "'Inter', system-ui, sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.72)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}
              >{l.label}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
