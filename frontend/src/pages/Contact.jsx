import { useEffect, useState } from 'react'

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
    const link = document.createElement('link')
    link.id = 'ytg-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytg-contact-styles'
    style.textContent = `
      :root {
        --ytg-bg:           #f4f4f6;
        --ytg-bg-2:         #ecedf1;
        --ytg-text:         #0a0a0f;
        --ytg-text-2:       rgba(10,10,15,0.62);
        --ytg-text-3:       rgba(10,10,15,0.40);
        --ytg-nav:          rgba(244,244,246,0.92);
        --ytg-card:         #ffffff;
        --ytg-border:       rgba(10,10,15,0.09);
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
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'DM Sans', system-ui, sans-serif; overflow-x: hidden; }
      @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
      .contact-reason-card {
        background: var(--ytg-card);
        border-radius: 20px;
        border: 1px solid var(--ytg-border);
        box-shadow: var(--ytg-shadow-lg);
        padding: 32px 36px;
        transition: box-shadow 0.22s, transform 0.22s;
      }
      .contact-reason-card:hover {
        box-shadow: var(--ytg-shadow-xl);
        transform: translateY(-3px);
      }
    `
    document.head.appendChild(style)
  }, [])
}

function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return { isMobile: width <= 768 }
}

const REASONS = [
  {
    emoji: '💳',
    title: 'Billing & payments',
    desc: 'Questions about charges, invoices, plan upgrades, or cancellations. We can also issue manual adjustments if something went wrong.',
    tag: 'Most common',
    tagColor: '#0a84ff',
  },
  {
    emoji: '🔧',
    title: 'Technical support',
    desc: 'An analysis that didn\'t run, an error you can\'t explain, or something behaving unexpectedly. Include a screenshot if you can.',
    tag: null,
    tagColor: null,
  },
  {
    emoji: '💡',
    title: 'Feature requests',
    desc: 'An idea for something we should build or improve. Every request gets read and logged. The best ones ship.',
    tag: 'We love these',
    tagColor: '#16a34a',
  },
  {
    emoji: '❓',
    title: 'General questions',
    desc: 'Not sure how something works, what\'s included in your plan, or whether YTGrowth is right for your channel? Ask.',
    tag: null,
    tagColor: null,
  },
  {
    emoji: '🤝',
    title: 'Press & partnerships',
    desc: 'Media enquiries, brand collaborations, or affiliate program questions. We\'re open to the right partnerships.',
    tag: null,
    tagColor: null,
  },
  {
    emoji: '📣',
    title: 'Feedback',
    desc: 'Loved something? Hated something? Both are equally useful. Honest feedback is how we get better.',
    tag: null,
    tagColor: null,
  },
]

export default function Contact() {
  useGlobalStyles()
  useEffect(() => { document.title = 'Contact — YTGrowth' }, [])
  const { isMobile } = useBreakpoint()

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--ytg-border)', padding: isMobile ? '0 20px' : '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ytg-nav)', backdropFilter: 'blur(16px)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <Logo size={28} />
          <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--ytg-text)', letterSpacing: '-0.4px' }}>YTGrowth</span>
        </a>
        <a href="/" style={{ fontSize: 14, color: 'var(--ytg-text-3)', textDecoration: 'none', fontWeight: 500 }}>← Back to home</a>
      </nav>

      {/* Hero */}
      <section style={{ padding: isMobile ? '64px 24px 52px' : '100px 40px 80px', textAlign: 'center', background: 'var(--ytg-bg)', animation: 'fadeUp 0.5s ease both' }}>
        <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ytg-accent-text)', background: 'var(--ytg-accent-light)', padding: '5px 14px', borderRadius: 100, marginBottom: 20 }}>Contact</span>
        <h1 style={{ fontWeight: 800, fontSize: isMobile ? 36 : 56, letterSpacing: isMobile ? '-1.2px' : '-2px', lineHeight: 1.06, color: 'var(--ytg-text)', marginBottom: 20 }}>
          Real people.<br />Same-day replies.
        </h1>
        <p style={{ fontSize: isMobile ? 16 : 18, color: 'var(--ytg-text-2)', lineHeight: 1.8, maxWidth: 480, margin: '0 auto 0' }}>
          No ticket queues, no bots, no runaround. One inbox — and we actually answer it.
        </p>
      </section>

      {/* Email hero card */}
      <section style={{ background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)', padding: isMobile ? '48px 24px' : '72px 40px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ background: 'var(--ytg-card)', borderRadius: 24, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-xl)', padding: isMobile ? '36px 28px' : '52px 56px' }}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 28 : 48 }}>
              <div style={{ flex: 1 }}>
                <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ytg-accent-text)', background: 'var(--ytg-accent-light)', padding: '4px 12px', borderRadius: 100, marginBottom: 18 }}>Write to us</span>
                <p style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.8px', marginBottom: 10, lineHeight: 1.2 }}>support@ytgrowth.io</p>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.75, marginBottom: 8 }}>
                  Send us anything — a question, a bug report, feedback, or just a hello. We reply to every email, personally.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#16a34a' }}>Average response time: under 4 hours</span>
                </div>
              </div>
              <a
                href="mailto:support@ytgrowth.io"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--ytg-accent)', color: '#ffffff', fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 700, fontSize: 14, padding: '15px 32px', borderRadius: 100, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.12), 0 8px 28px rgba(229,48,42,0.36)', transition: 'filter 0.18s, transform 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.07)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none' }}
              >
                Send an email →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Reasons grid */}
      <section style={{ padding: isMobile ? '64px 24px 80px' : '100px 40px 120px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ytg-accent-text)', background: 'var(--ytg-accent-light)', padding: '5px 14px', borderRadius: 100, marginBottom: 18 }}>Why people reach out</span>
            <h2 style={{ fontWeight: 800, fontSize: isMobile ? 28 : 40, letterSpacing: '-1.2px', color: 'var(--ytg-text)', lineHeight: 1.1, marginBottom: 14 }}>No question is too small.</h2>
            <p style={{ fontSize: isMobile ? 15 : 16, color: 'var(--ytg-text-2)', lineHeight: 1.8, maxWidth: 480, margin: '0 auto' }}>
              Here's what usually lands in our inbox. If your reason isn't listed — email anyway.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 22 }}>
            {REASONS.map((r, i) => (
              <div key={i} className="contact-reason-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--ytg-accent-light)', border: '1px solid rgba(229,48,42,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                    {r.emoji}
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

      {/* Promise strip */}
      <section style={{ background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', padding: isMobile ? '48px 24px' : '64px 40px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.6px', lineHeight: 1.35, marginBottom: 16 }}>
            We respond to every email.<br />No exceptions.
          </p>
          <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.8, maxWidth: 480, margin: '0 auto' }}>
            If you've been waiting more than one business day, email again with <strong>URGENT</strong> in the subject — we'll prioritise it immediately.
          </p>
        </div>
      </section>

      {/* Footer */}
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
              <a key={i} href={l.href} style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textDecoration: 'none', fontFamily: "'DM Sans', system-ui, sans-serif" }}
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
