import { useEffect, useState } from 'react'

/* ─── inject font + global styles into <head> once ─────────────────────── */
function useGlobalStyles(light) {
  useEffect(() => {
    document.documentElement.classList.toggle('ytg-light', light)
  }, [light])

  useEffect(() => {
    if (document.getElementById('ytg-styles')) return

    const link = document.createElement('link')
    link.id = 'ytg-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytg-styles'
    style.textContent = `
      :root {
        --ytg-bg: #09090b;
        --ytg-text: #f4f4f5;
        --ytg-text-2: rgba(255,255,255,0.6);
        --ytg-text-3: rgba(255,255,255,0.5);
        --ytg-text-4: rgba(255,255,255,0.4);
        --ytg-nav: rgba(9,9,11,0.8);
        --ytg-section: rgba(255,255,255,0.015);
        --ytg-card: rgba(255,255,255,0.03);
        --ytg-card-2: rgba(255,255,255,0.05);
        --ytg-border: rgba(255,255,255,0.07);
        --ytg-border-2: rgba(255,255,255,0.09);
        --ytg-divider: rgba(255,255,255,0.05);
      }
      :root.ytg-light {
        --ytg-bg: #f9f9fb;
        --ytg-text: #09090b;
        --ytg-text-2: rgba(0,0,0,0.65);
        --ytg-text-3: rgba(0,0,0,0.5);
        --ytg-text-4: rgba(0,0,0,0.4);
        --ytg-nav: rgba(249,249,251,0.85);
        --ytg-section: rgba(0,0,0,0.03);
        --ytg-card: rgba(0,0,0,0.03);
        --ytg-card-2: rgba(0,0,0,0.05);
        --ytg-border: rgba(0,0,0,0.08);
        --ytg-border-2: rgba(0,0,0,0.1);
        --ytg-divider: rgba(0,0,0,0.05);
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'DM Sans', system-ui, sans-serif; overflow-x: hidden; transition: background 0.25s, color 0.25s; }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
      @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
      ::-webkit-scrollbar { width: 4px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background: var(--ytg-card-2); border-radius: 2px }

      .ytg-btn-primary {
        display: inline-flex; align-items: center; gap: 10px;
        padding: 14px 30px; border-radius: 12px; font-weight: 700;
        font-size: 15px; text-decoration: none; background: #ff3b30;
        color: #fff; transition: all 0.2s; cursor: pointer;
        border: none; font-family: 'DM Sans', system-ui, sans-serif;
        letter-spacing: -0.2px;
      }
      .ytg-btn-primary:hover { background: #ff2d20; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(255,59,48,0.35); }

      .ytg-btn-ghost {
        display: inline-flex; align-items: center; gap: 10px;
        padding: 14px 30px; border-radius: 12px; font-weight: 600;
        font-size: 15px; text-decoration: none;
        background: var(--ytg-card);
        color: var(--ytg-text-2);
        border: 1px solid var(--ytg-border-2);
        transition: all 0.2s; cursor: pointer;
        font-family: 'DM Sans', system-ui, sans-serif;
      }
      .ytg-btn-ghost:hover { background: var(--ytg-card-2); border-color: var(--ytg-border); }

      .ytg-feature-card {
        background: var(--ytg-card);
        border: 1px solid var(--ytg-border);
        border-radius: 18px; padding: 28px;
        transition: all 0.2s; cursor: default;
      }
      .ytg-feature-card:hover {
        background: var(--ytg-card-2);
        border-color: var(--ytg-border-2);
        transform: translateY(-2px);
      }

      .ytg-nav-link {
        font-size: 14px; color: var(--ytg-text-3); font-weight: 500;
        text-decoration: none; transition: color 0.2s; letter-spacing: -0.1px;
      }
      .ytg-nav-link:hover { color: var(--ytg-text-2); }

      .ytg-faq-item {
        border-bottom: 1px solid var(--ytg-border);
        padding: 26px 0;
      }
      .ytg-faq-item:last-child { border-bottom: none; }

      .ytg-stat-row-item {
        text-align: center; padding: 0 32px;
      }
      .ytg-stat-row-item + .ytg-stat-row-item {
        border-left: 1px solid var(--ytg-border);
      }
    `
    document.head.appendChild(style)
  }, [])
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
function Check({ color = '#0a84ff' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" flexShrink="0" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7" fill={`${color}18`} stroke={`${color}40`}/>
      <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
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

/* ─── Theme toggle ──────────────────────────────────────────────────────── */
function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="2.6" fill="currentColor"/>
      <path d="M6.5 1v1.2M6.5 10.8V12M1 6.5h1.2M10.8 6.5H12M2.8 2.8l.85.85M9.35 9.35l.85.85M2.8 10.2l.85-.85M9.35 3.65l.85-.85" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M10.5 7A5 5 0 0 1 5 1.5a5 5 0 1 0 5.5 5.5z" fill="currentColor"/>
    </svg>
  )
}
function ThemeToggle({ light, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={light ? 'Switch to dark mode' : 'Switch to light mode'}
      style={{
        display: 'flex', alignItems: 'center',
        background: 'var(--ytg-card)',
        border: '1px solid var(--ytg-border-2)',
        borderRadius: 100, padding: 3,
        cursor: 'pointer', gap: 2,
        transition: 'border-color 0.2s',
      }}
    >
      {[
        { mode: true,  Icon: SunIcon,  activeColor: '#f59e0b', activeBg: light ? 'rgba(245,158,11,0.12)' : 'transparent' },
        { mode: false, Icon: MoonIcon, activeColor: '#a78bfa', activeBg: !light ? 'rgba(167,139,250,0.14)' : 'transparent' },
      ].map(({ mode, Icon, activeColor, activeBg }) => {
        const isActive = light === mode
        return (
          <span key={String(mode)} style={{
            width: 28, height: 28, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: activeBg,
            boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
            color: isActive ? activeColor : 'var(--ytg-text-4)',
            transition: 'all 0.22s ease',
          }}>
            <Icon />
          </span>
        )
      })}
    </button>
  )
}

/* ─── Section badge ─────────────────────────────────────────────────────── */
function Badge({ children }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)',
      borderRadius: 100, padding: '6px 16px', marginBottom: 18,
    }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff3b30' }} />
      <span style={{ fontSize: 11.5, fontWeight: 700, color: '#ff6b63', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{children}</span>
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

function ScrollDots() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = SECTIONS.findIndex(s => s.id === entry.target.id)
            if (idx !== -1) setActive(idx)
          }
        })
      },
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
    <div style={{ position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      {SECTIONS.map((s, i) => (
        <button key={i} onClick={() => scrollTo(s.id)} title={s.label} style={{
          width: 6, height: active === i ? 22 : 6,
          borderRadius: 3, border: 'none', cursor: 'pointer', padding: 0,
          background: active === i ? '#ff3b30' : 'var(--ytg-border-2)',
          transition: 'all 0.25s ease',
          display: 'block',
        }} />
      ))}
    </div>
  )
}

/* ─── Landing page ──────────────────────────────────────────────────────── */
export default function Landing() {
  const [light, setLight] = useState(false)
  useGlobalStyles(light)

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', overflowX: 'hidden' }}>
      <ScrollDots />

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--ytg-nav)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--ytg-border)',
        height: 60, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 64px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Logo size={28} />
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.4px', color: 'var(--ytg-text)' }}>YTGrowth</span>
          <span style={{ background: 'rgba(255,59,48,0.12)', color: '#ff6b63', fontSize: 9.5, fontWeight: 700, padding: '3px 8px', borderRadius: 100, border: '1px solid rgba(255,59,48,0.2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Beta</span>
        </div>

        <div style={{ display: 'flex', gap: 32 }}>
          {['Features', 'How it works', 'Pricing', 'FAQ'].map((l, i) => (
            <a key={i} href={`#${l.toLowerCase().replace(/ /g, '-')}`} className="ytg-nav-link">{l}</a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ThemeToggle light={light} onToggle={() => setLight(l => !l)} />
          <a href="/auth/login" className="ytg-nav-link" style={{ padding: '8px 16px', borderRadius: 10 }}>Log in</a>
          <a href="/auth/login" className="ytg-btn-primary" style={{ padding: '9px 20px', fontSize: 13.5 }}>
            Get started free
          </a>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <div id="hero" style={{ position: 'relative', padding: '110px 48px 90px', overflow: 'hidden' }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(255,59,48,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1, animation: 'fadeUp 0.5s ease' }}>
          {/* Live badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--ytg-card)', border: '1px solid var(--ytg-border-2)', borderRadius: 100, padding: '7px 17px', marginBottom: 32 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#30d158', animation: 'pulse 2s infinite', boxShadow: '0 0 0 3px rgba(48,209,88,0.15)' }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ytg-text-3)', letterSpacing: '-0.1px' }}>Free during beta — no credit card needed</span>
          </div>

          <h1 style={{ fontWeight: 800, fontSize: 72, lineHeight: 1.02, letterSpacing: '-2px', color: 'var(--ytg-text)', marginBottom: 22 }}>
            Know exactly what<br />
            <span style={{ color: '#ff3b30' }}>to fix</span> on your<br />
            YouTube channel.
          </h1>

          <p style={{ fontSize: 19, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 44, maxWidth: 620, margin: '0 auto 44px' }}>
            Connect your channel and get a full AI-powered diagnosis in 30 seconds — health score, competitor gaps, and one clear action for every problem.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 48 }}>
            <a href="/auth/login" className="ytg-btn-primary" style={{ fontSize: 15.5, padding: '15px 32px' }}>
              Analyze my channel — it's free <Arrow />
            </a>
            <a href="#how-it-works" className="ytg-btn-ghost" style={{ fontSize: 15.5, padding: '15px 32px' }}>
              See how it works
            </a>
          </div>

          {/* Trust row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, flexWrap: 'wrap' }}>
            {['Read-only access', 'Google OAuth secured', '30-second setup', 'Cancel anytime'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Check />
                <span style={{ fontSize: 13, color: 'var(--ytg-text-2)', fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard mockup */}
        <div style={{ maxWidth: 1280, margin: '72px auto 0', position: 'relative' }}>
          <div style={{
            background: '#111114', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 22, overflow: 'hidden',
            boxShadow: '0 48px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
          }}>
            {/* Browser chrome */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
              {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.65 }} />)}
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 7, padding: '5px 14px', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginLeft: 10, maxWidth: 300, fontFamily: 'monospace', letterSpacing: '-0.2px' }}>ytgrowth.io/dashboard</div>
            </div>

            {/* Mock dashboard content */}
            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '260px 1fr', gap: 18, minHeight: 360 }}>
              {/* Sidebar mock */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.18)', borderRadius: 14, padding: 18 }}>
                  <p style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 12 }}>Channel health</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <svg width="52" height="52" viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
                      <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
                      <circle cx="26" cy="26" r="20" fill="none" stroke="#ff3b30" strokeWidth="5" strokeDasharray="56 70" strokeLinecap="round" transform="rotate(-90 26 26)" />
                    </svg>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 32, color: '#ff3b30', letterSpacing: '-2px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>45</div>
                      <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>out of 100 · Critical</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[{ l: 'Avg views', v: '980', warn: true }, { l: 'Retention', v: '55.6%', warn: false }, { l: 'Duration', v: '0m 38s', warn: true }, { l: 'Net subs', v: '−1', warn: true }].map((m, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${m.warn ? 'rgba(255,59,48,0.18)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10, padding: '11px 13px' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>{m.l}</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: m.warn ? '#ff6b63' : '#f4f4f5', fontVariantNumeric: 'tabular-nums' }}>{m.v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main mock */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 2 }}>Your action plan</p>
                {[
                  { c: '#ff3b30', t: 'Watch time is critically short', desc: 'Viewers only watch 38 seconds on average.', action: 'Rewrite your openings — hook in first 30s.', p: 'Critical' },
                  { c: '#ffd60a', t: 'Upload frequency too low', desc: 'You post 0.5× per week vs 2–3× niche avg.', action: 'Commit to 1 upload per week minimum.', p: 'High' },
                  { c: '#0a84ff', t: 'CTR below niche average', desc: '2.1% vs 4.8% niche average.', action: 'A/B test thumbnails with clearer focal points.', p: 'Medium' },
                ].map((item, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ borderLeft: `3px solid ${item.c}`, padding: '13px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 600, color: '#f4f4f5' }}>{item.t}</p>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: item.c, background: `${item.c}18`, padding: '3px 9px', borderRadius: 100, flexShrink: 0, marginLeft: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.p}</span>
                      </div>
                      <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                    <div style={{ background: 'rgba(10,132,255,0.06)', borderTop: '1px solid rgba(10,132,255,0.15)', padding: '9px 16px', fontSize: 11.5, color: 'rgba(10,132,255,0.85)' }}>
                      <span style={{ fontWeight: 600 }}>Fix — </span>{item.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating cards */}
          <div style={{ animation: 'floatA 4.5s ease-in-out infinite', position: 'absolute', top: -24, right: -28, background: 'rgba(17,17,20,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px 20px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
            <p style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>You vs competitor</p>
            {[['Avg views', '980', '12.4k'], ['Upload freq', '0.5×/wk', '3×/wk'], ['Like rate', '2.7%', '5.1%']].map(([m, y, t], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, marginBottom: i < 2 ? 8 : 0, paddingBottom: i < 2 ? 8 : 0, borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{m}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#ff6b63', fontVariantNumeric: 'tabular-nums' }}>{y}</span>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>vs</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.65)', fontVariantNumeric: 'tabular-nums' }}>{t}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ animation: 'floatB 5.5s ease-in-out infinite 1s', position: 'absolute', bottom: -24, left: -28, background: 'rgba(17,17,20,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px 20px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
            <p style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>Analysis complete</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(10,132,255,0.12)', border: '1px solid rgba(10,132,255,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="#0a84ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#f4f4f5' }}>12 metrics scanned</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>Done in 28 seconds</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS BAR ───────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)', background: 'var(--ytg-section)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '52px 64px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[['30s', 'To your first full diagnosis'], ['12+', 'Metrics analyzed per channel'], ['5', 'Issues identified on average'], ['100%', 'Free during beta']].map(([n, l], i) => (
            <div key={i} className="ytg-stat-row-item">
              <p style={{ fontWeight: 800, fontSize: 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1, marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>{n}</p>
              <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', lineHeight: 1.5 }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <div id="features" style={{ padding: '100px 64px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Badge>Features</Badge>
            <h2 style={{ fontWeight: 800, fontSize: 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 14 }}>Everything you need to grow.</h2>
            <p style={{ fontSize: 17, color: 'var(--ytg-text-2)', maxWidth: 540, margin: '0 auto', lineHeight: 1.8 }}>Not just data — real answers with a clear action behind every metric.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {[
              { icon: '◎', color: '#ff3b30', title: 'Channel Health Score', desc: 'A single score out of 100 that captures retention, engagement, growth velocity, and consistency — updated live.', tag: 'Instant', tagColor: '#0a84ff' },
              { icon: '▲', color: '#ffd60a', title: 'Video Performance', desc: 'See exactly which videos drag your channel down and which the algorithm loves — with metric-by-metric breakdowns.', tag: 'Detailed', tagColor: '#ffd60a' },
              { icon: '◈', color: '#0a84ff', title: 'Competitor Analysis', desc: 'Compare against top creators in your niche. See where you\'re behind, by how much, and what they\'re doing differently.', tag: 'Competitive', tagColor: '#0a84ff' },
              { icon: '⏱', color: '#bf5af2', title: 'Upload Frequency Audit', desc: 'Find out if your posting schedule helps or hurts your recommendation rate — with a specific weekly target for your niche.', tag: 'Scheduling', tagColor: '#bf5af2' },
              { icon: '◐', color: '#0a84ff', title: 'Retention Analysis', desc: 'Average view duration is the #1 metric YouTube uses to recommend videos. We benchmark yours and tell you how to fix it.', tag: 'Critical', tagColor: '#0a84ff' },
              { icon: '⚡', color: '#ff9f0a', title: 'Prioritized Action Plan', desc: 'Every issue ranked by impact with a specific action attached. No guesswork, no vague advice — a numbered list of what to do first.', tag: 'Actionable', tagColor: '#ff9f0a' },
            ].map((f, i) => (
              <div key={i} className="ytg-feature-card">
                <div style={{ width: 42, height: 42, background: `${f.color}14`, border: `1px solid ${f.color}28`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, fontSize: 17, color: f.color }}>
                  {f.icon}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                  <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--ytg-text)', letterSpacing: '-0.3px', lineHeight: 1.3 }}>{f.title}</p>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: f.tagColor, background: `${f.tagColor}18`, padding: '3px 9px', borderRadius: 100, flexShrink: 0, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.tag}</span>
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--ytg-text-2)', lineHeight: 1.8 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BEFORE / AFTER ──────────────────────────────────────────────── */}
      <div style={{ background: 'var(--ytg-section)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)', padding: '100px 64px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Badge>The difference</Badge>
            <h2 style={{ fontWeight: 800, fontSize: 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 14 }}>Data vs clarity.</h2>
            <p style={{ fontSize: 17, color: 'var(--ytg-text-2)', maxWidth: 620, margin: '0 auto', lineHeight: 1.8 }}>YouTube Studio shows you numbers. YTGrowth tells you what they mean and what to do.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Without */}
            <div style={{ background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ padding: '16px 26px', borderBottom: '1px solid var(--ytg-divider)', display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ytg-text-4)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ytg-text-4)' }}>Without YTGrowth</span>
              </div>
              {[
                ['Views dropped 40% this month', 'No idea why'],
                ['CTR is 2.1%', 'Good or bad?'],
                ['Watch time 0m 38s', 'What do I do?'],
                ['Competitor gets 12k views', 'What are they doing?'],
                ['Posted 3 videos this month', 'Is that enough?'],
              ].map(([s, f], i) => (
                <div key={i} style={{ padding: '17px 26px', borderBottom: i < 4 ? '1px solid var(--ytg-divider)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 13.5, color: 'var(--ytg-text-2)' }}>{s}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--ytg-text-3)', flexShrink: 0 }}>{f}</span>
                </div>
              ))}
            </div>
            {/* With */}
            <div style={{ background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.28)', borderRadius: 18, overflow: 'hidden', position: 'relative', boxShadow: '0 0 48px rgba(255,59,48,0.07)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #ff3b30, #ff6b63)' }} />
              <div style={{ padding: '16px 26px', borderBottom: '1px solid rgba(255,59,48,0.15)', display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff3b30' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ytg-text-2)' }}>With YTGrowth</span>
              </div>
              {[
                ['Views dropped 40%', 'Your last 5 videos have 70% lower watch time. Fix your hooks immediately.'],
                ['CTR is 2.1%', 'Niche average is 4.8%. Your thumbnails lack contrast and a clear focal point.'],
                ['Watch time 0m 38s', 'Critical. Cut your first 30 seconds and open with the payoff.'],
                ['Competitor gets 12k views', 'They post 3× per week with question-based titles. You post 0.5×.'],
                ['Posted 3 videos this month', 'Below average. 1 video/week minimum to stay in recommendation cycle.'],
              ].map(([s, insight], i) => (
                <div key={i} style={{ padding: '15px 26px', borderBottom: i < 4 ? '1px solid rgba(255,59,48,0.1)' : 'none' }}>
                  <p style={{ fontSize: 10.5, color: 'var(--ytg-text-3)', marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s}</p>
                  <p style={{ fontSize: 13.5, color: 'var(--ytg-text)', lineHeight: 1.65 }}>{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <div id="how-it-works" style={{ padding: '100px 64px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Badge>How it works</Badge>
            <h2 style={{ fontWeight: 800, fontSize: 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 14 }}>From zero to action plan<br />in 30 seconds.</h2>
            <p style={{ fontSize: 17, color: 'var(--ytg-text-2)', maxWidth: 620, margin: '0 auto', lineHeight: 1.8 }}>No setup, no configuration, no API keys. Just connect and go.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {[
              {
                n: '01', t: 'Connect your channel', d: 'Sign in with Google and grant read-only access. We never post, edit, or store your content.',
                card: (
                  <div style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 13, padding: 18, marginBottom: 22 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
                      <Logo size={32} />
                      <div>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#f4f4f5' }}>YTGrowth</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>wants YouTube read access</p>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 12px', marginBottom: 11, fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>Read-only · No posting · Fully secure</div>
                    <div style={{ display: 'flex', gap: 7 }}>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '9px', textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Cancel</div>
                      <div style={{ flex: 1, background: '#ff3b30', borderRadius: 8, padding: '9px', textAlign: 'center', fontSize: 12, color: '#fff', fontWeight: 700 }}>Allow</div>
                    </div>
                  </div>
                )
              },
              {
                n: '02', t: 'We scan everything', d: '12+ metrics analyzed automatically — retention, watch time, upload cadence, engagement, and your top competitors.',
                card: (
                  <div style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 13, padding: 18, marginBottom: 22 }}>
                    <p style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.45)', fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Analyzing your channel</p>
                    {[{ l: 'Channel metrics', w: '100%', c: '#0a84ff' }, { l: 'Video performance', w: '100%', c: '#0a84ff' }, { l: 'Competitor data', w: '72%', c: '#0a84ff' }, { l: 'Generating insights', w: '38%', c: '#ffd60a' }].map((item, i) => (
                      <div key={i} style={{ marginBottom: i < 3 ? 11 : 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.58)', fontWeight: 500 }}>{item.l}</span>
                          <span style={{ fontSize: 11.5, color: item.c, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{item.w}</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 100, height: 3, overflow: 'hidden' }}>
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
                  <div style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 13, padding: 18, marginBottom: 22 }}>
                    <p style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.45)', fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your action plan</p>
                    {[{ c: '#ff3b30', t: 'Rewrite video openings', s: 'Critical' }, { c: '#ffd60a', t: 'Post 1 video per week', s: 'High' }, { c: '#0a84ff', t: 'Add like CTA at 30%', s: 'Medium' }].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, marginBottom: i < 2 ? 7 : 0 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.c, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500, flex: 1 }}>{item.t}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: item.c, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.s}</span>
                      </div>
                    ))}
                  </div>
                )
              },
            ].map((step, i) => (
              <div key={i} style={{ background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 18, padding: '26px' }}>
                {step.card}
                <div style={{ width: 36, height: 36, background: 'var(--ytg-card-2)', border: '1px solid var(--ytg-border-2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <span style={{ fontWeight: 800, fontSize: 12.5, color: 'var(--ytg-text-3)', fontVariantNumeric: 'tabular-nums' }}>{step.n}</span>
                </div>
                <p style={{ fontWeight: 700, fontSize: 17, color: 'var(--ytg-text)', marginBottom: 9, letterSpacing: '-0.3px' }}>{step.t}</p>
                <p style={{ fontSize: 13.5, color: 'var(--ytg-text-2)', lineHeight: 1.8 }}>{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--ytg-section)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)', padding: '100px 64px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Badge>Beta creators</Badge>
            <h2 style={{ fontWeight: 800, fontSize: 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06 }}>What creators are saying.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
            {[
              { q: 'Finally understand why my views dropped. The watch time insight alone changed everything — I had no idea my openings were killing my channel.', n: 'Finance creator', s: '8.2k subs' },
              { q: 'YouTube Studio shows numbers. YTGrowth shows answers. They are not the same thing at all. I wish I had this a year ago.', n: 'Tech reviews', s: '22k subs' },
              { q: 'The competitor gap analysis was eye-opening. I thought I was doing fine. Turns out I was 92% behind on average views. Now I know what to fix.', n: 'Personal development', s: '4.1k subs' },
              { q: 'Got 3 specific actions and implemented all of them the same day. My CTR went from 2.1% to 3.8% in under two weeks.', n: 'Cooking niche', s: '11k subs' },
            ].map((t, i) => (
              <div key={i} style={{ background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 18, padding: '28px 30px' }}>
                <div style={{ marginBottom: 14 }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: '#ff3b30', fontSize: 13, marginRight: 2 }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 20 }}>"{t.q}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{ width: 34, height: 34, background: 'var(--ytg-card-2)', borderRadius: '50%', border: '1px solid var(--ytg-border-2)', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ytg-text-2)' }}>{t.n}</p>
                    <p style={{ fontSize: 11.5, color: 'var(--ytg-text-4)', marginTop: 1 }}>{t.s}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <div id="pricing" style={{ padding: '100px 64px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Badge>Pricing</Badge>
            <h2 style={{ fontWeight: 800, fontSize: 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 14 }}>Simple, honest pricing.</h2>
            <p style={{ fontSize: 17, color: 'var(--ytg-text-2)', lineHeight: 1.8 }}>Start free. Upgrade when you're ready to scale.</p>
          </div>

          {/* Plan cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 52, textAlign: 'left' }}>
            {/* Starter */}
            <div style={{ background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 22, padding: '36px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Starter</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                <p style={{ fontWeight: 800, fontSize: 50, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>$0</p>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--ytg-text-3)', marginBottom: 28 }}>Free forever</p>
              {[
                'Basic channel stats',
                '1 competitor channel',
                '3 keyword searches / day',
                '1 AI idea / day',
                'Weekly SEO audit',
                'Basic thumbnail preview',
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
                  <Check />
                  <span style={{ fontSize: 13.5, color: 'var(--ytg-text-2)' }}>{f}</span>
                </div>
              ))}
              <a href="/auth/login" className="ytg-btn-ghost" style={{ marginTop: 24, width: '100%', justifyContent: 'center', display: 'flex' }}>Get started free</a>
            </div>

            {/* Growth — recommended */}
            <div style={{ background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.28)', borderRadius: 22, padding: '36px', position: 'relative', overflow: 'hidden', boxShadow: '0 0 48px rgba(255,59,48,0.07)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #ff3b30, #ff6b63)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#ff6b63', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Growth</p>
                <span style={{ fontSize: 9.5, fontWeight: 700, background: 'rgba(255,59,48,0.15)', color: '#ff6b63', border: '1px solid rgba(255,59,48,0.25)', padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Most popular</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                <p style={{ fontWeight: 800, fontSize: 50, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>$14.99</p>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>/mo</p>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--ytg-text-3)', marginBottom: 28 }}>or $11.99/mo billed annually</p>
              {[
                'Full channel history',
                '10 competitor channels',
                '250 keyword searches / day',
                'Live VPH tracking',
                'Outlier discovery',
                '20 AI ideas / day',
                '50 AI titles & hooks / month',
                'Real-time SEO audit',
                'Thumbnail preview',
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
                  <Check color="#ff3b30" />
                  <span style={{ fontSize: 13.5, color: 'var(--ytg-text)' }}>{f}</span>
                </div>
              ))}
              <a href="/auth/login" className="ytg-btn-primary" style={{ marginTop: 24, width: '100%', justifyContent: 'center', display: 'flex' }}>Start with Growth</a>
            </div>

            {/* Pro */}
            <div style={{ background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 22, padding: '36px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Pro</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                <p style={{ fontWeight: 800, fontSize: 50, letterSpacing: '-2px', color: 'var(--ytg-text)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>$24.99</p>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>/mo</p>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--ytg-text-3)', marginBottom: 28 }}>or $19.99/mo billed annually</p>
              {[
                'Full channel history',
                '50 competitor channels',
                'Unlimited keyword searches',
                'Live VPH tracking',
                'Outlier discovery',
                '100 AI ideas / day',
                'Unlimited AI titles & hooks',
                'Real-time SEO audit',
                'Bulk metadata editing',
                'Thumbnail preview',
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
                  <Check />
                  <span style={{ fontSize: 13.5, color: 'var(--ytg-text-2)' }}>{f}</span>
                </div>
              ))}
              <a href="/auth/login" className="ytg-btn-ghost" style={{ marginTop: 24, width: '100%', justifyContent: 'center', display: 'flex' }}>Start with Pro</a>
            </div>
          </div>

          {/* Early bird + PAYG row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 18, padding: '28px 32px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Early Bird Annual Deal — 20% off</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
                {[
                  ['Growth', '$11.99 / mo', '$144 billed annually'],
                  ['Pro', '$19.99 / mo', '$240 billed annually'],
                ].map(([plan, price, note], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--ytg-card)', borderRadius: 12, border: '1px solid var(--ytg-divider)' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ytg-text)' }}>{plan}</span>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#ff6b63' }}>{price}</p>
                      <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', marginTop: 1 }}>{note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 18, padding: '28px 32px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Pay-As-You-Go Credits</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
                {[
                  ['AI Viral Shorts Extraction', '$15', '30 clips'],
                  ['AI Script Writing (Deep Dive)', '$10', '10 scripts'],
                ].map(([name, price, unit], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--ytg-card)', borderRadius: 12, border: '1px solid var(--ytg-divider)' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ytg-text)' }}>{name}</span>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#ff6b63' }}>{price}</p>
                      <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', marginTop: 1 }}>per {unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <div id="faq" style={{ background: 'var(--ytg-section)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)', padding: '100px 64px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <Badge>FAQ</Badge>
            <h2 style={{ fontWeight: 800, fontSize: 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06 }}>Questions answered.</h2>
          </div>
          {[
            { q: 'Is it really free?', a: 'Yes — completely free during the beta period. No credit card required, no hidden fees. When paid plans launch, we\'ll give you plenty of notice.' },
            { q: 'What data do you access?', a: 'We request read-only access to your YouTube channel analytics. We never post, modify, delete, or interact with your content in any way. You can revoke access anytime from your Google account.' },
            { q: 'How is this different from YouTube Studio?', a: 'YouTube Studio gives you raw numbers. YTGrowth tells you what those numbers mean and exactly what to do. We benchmark against your niche, rank issues by impact, and give you one specific action per problem.' },
            { q: 'How often is data updated?', a: 'Every time you visit your dashboard, we pull fresh data. You always see your most current state.' },
            { q: 'What channels is this for?', a: 'Any YouTube channel at any stage — 100 subscribers or 100,000. The insights scale with your channel size.' },
            { q: 'Can I cancel?', a: 'Yes, anytime. Since it\'s free there\'s nothing to cancel — just stop using it. Contact us to delete your data and we\'ll handle it within 48 hours.' },
          ].map((item, i) => (
            <div key={i} className="ytg-faq-item">
              <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--ytg-text)', marginBottom: 10, letterSpacing: '-0.3px' }}>{item.q}</p>
              <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.85 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
      <div style={{ padding: '120px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(255,59,48,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--ytg-card)', border: '1px solid var(--ytg-border-2)', borderRadius: 100, padding: '7px 18px', marginBottom: 32 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#30d158', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 13, color: 'var(--ytg-text-2)', fontWeight: 500 }}>Free during beta — join now</span>
          </div>
          <h2 style={{ fontWeight: 800, fontSize: 64, letterSpacing: '-2px', color: 'var(--ytg-text)', marginBottom: 18, lineHeight: 1.02 }}>
            Stop guessing.<br />
            <span style={{ color: '#ff3b30' }}>Start growing.</span>
          </h2>
          <p style={{ fontSize: 17, color: 'var(--ytg-text-2)', marginBottom: 48, lineHeight: 1.8, maxWidth: 620, margin: '0 auto 48px' }}>
            Connect your channel in 30 seconds and get your full diagnosis — free. No credit card. No setup.
          </p>
          <a href="/auth/login" className="ytg-btn-primary" style={{ fontSize: 16, padding: '16px 38px' }}>
            Analyze my channel — it's free <Arrow />
          </a>
          <p style={{ fontSize: 12.5, color: 'var(--ytg-text-3)', marginTop: 16 }}>No credit card. No setup. Cancel anytime.</p>
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--ytg-border)', padding: '36px 64px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Logo size={26} />
            <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--ytg-text)', letterSpacing: '-0.4px' }}>YTGrowth</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)' }}>Built for creators serious about growth.</p>
          <div style={{ display: 'flex', gap: 28 }}>
            {['Privacy policy', 'Terms of service', 'Log in'].map((l, i) => (
              <a key={i} href="/auth/login" className="ytg-nav-link" style={{ fontSize: 13 }}>{l}</a>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
