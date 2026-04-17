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
    if (document.getElementById('ytg-font')) return
    const link = document.createElement('link')
    link.id = 'ytg-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytg-styles'
    style.textContent = `
      :root {
        --ytg-bg: #f4f4f6; --ytg-text: #0a0a0f; --ytg-text-2: rgba(10,10,15,0.62);
        --ytg-text-3: rgba(10,10,15,0.44); --ytg-nav: rgba(244,244,246,0.92);
        --ytg-card: #ffffff; --ytg-border: rgba(10,10,15,0.11);
        --ytg-accent: #e5302a; --ytg-accent-text: #c22b25;
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
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 3v5l3 3" stroke="var(--ytg-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Billing & payments',
    desc: 'Questions about charges, invoices, plan changes, or cancellations.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 5h14M3 10h10M3 15h7" stroke="var(--ytg-accent)" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Technical support',
    desc: 'Something broken, an analysis not running, or an error you can\'t explain.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2l2.4 5 5.6.8-4 3.9.9 5.3L10 14.5l-4.9 2.5.9-5.3L2 7.8l5.6-.8L10 2z" stroke="var(--ytg-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Feature requests',
    desc: 'An idea for something we should build. We read every one.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M17 12a5 5 0 0 1-5 5H6l-3 2V7a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v5z" stroke="var(--ytg-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'General questions',
    desc: 'Anything about how YTGrowth works, what\'s included, or how to get the most out of it.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 4h12v9H4zM8 13v3M12 13v3M6 16h8" stroke="var(--ytg-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Press & partnerships',
    desc: 'Media enquiries, collaboration proposals, or affiliate program questions.',
  },
]

export default function Contact() {
  useGlobalStyles()
  useEffect(() => { document.title = 'Contact — YTGrowth' }, [])
  const { isMobile } = useBreakpoint()

  return (
    <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', minHeight: '100vh' }}>

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--ytg-border)', padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ytg-nav)', backdropFilter: 'blur(12px)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <Logo size={28} />
          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--ytg-text)', letterSpacing: '-0.4px' }}>YTGrowth</span>
        </a>
        <a href="/" style={{ fontSize: 13, color: 'var(--ytg-text-3)', textDecoration: 'none', fontWeight: 500 }}>← Back to home</a>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 100px' }}>

        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Get in touch</p>
        <h1 style={{ fontWeight: 800, fontSize: isMobile ? 32 : 38, letterSpacing: '-1.2px', color: 'var(--ytg-text)', marginBottom: 16, lineHeight: 1.1 }}>We reply same day.</h1>
        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 8, maxWidth: 560 }}>
          One inbox, real people. Email us at <strong>support@ytgrowth.io</strong> and you'll hear back within a few hours — usually sooner.
        </p>
        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 48 }}>
          No ticket system. No bots. Just email.
        </p>

        <div style={{ height: 1, background: 'var(--ytg-border)', margin: '0 0 48px' }} />

        {/* Email CTA card */}
        <div style={{ background: '#ffffff', border: '1px solid var(--ytg-border)', borderRadius: 20, padding: isMobile ? '28px 24px' : '36px 40px', marginBottom: 48, boxShadow: '0 2px 8px rgba(0,0,0,0.05), 0 12px 40px rgba(0,0,0,0.08)', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Email us directly</p>
            <p style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.5px', marginBottom: 6 }}>support@ytgrowth.io</p>
            <p style={{ fontSize: 13, color: 'var(--ytg-text-3)' }}>Average response time: under 4 hours</p>
          </div>
          <a
            href="mailto:support@ytgrowth.io"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--ytg-accent)', color: '#ffffff', fontFamily: "'Poppins', system-ui, sans-serif", fontWeight: 700, fontSize: 14, padding: '12px 26px', borderRadius: 100, textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(229,48,42,0.3)', flexShrink: 0 }}
          >
            Send an email
          </a>
        </div>

        {/* Reasons section */}
        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginBottom: 6, letterSpacing: '-0.3px' }}>What people contact us about</h2>
        <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 28, lineHeight: 1.7 }}>No question is too small. Here's what lands in our inbox most often.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {REASONS.map((r, i) => (
            <div key={i} style={{ background: '#ffffff', border: '1px solid var(--ytg-border)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(229,48,42,0.07)', border: '1px solid rgba(229,48,42,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                {r.icon}
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ytg-text)', marginBottom: 4, letterSpacing: '-0.2px' }}>{r.title}</p>
                <p style={{ fontSize: 13.5, color: 'var(--ytg-text-2)', lineHeight: 1.65 }}>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: 'var(--ytg-border)', margin: '48px 0 40px' }} />

        {/* Response promise */}
        <div style={{ background: 'rgba(229,48,42,0.04)', border: '1px solid rgba(229,48,42,0.14)', borderRadius: 14, padding: '20px 24px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Our promise</p>
          <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.75 }}>
            We respond to every single email, personally, within one business day. If you've been waiting longer than that — email again and put "URGENT" in the subject line.
          </p>
        </div>

      </div>

      <footer style={{ background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.07)', padding: isMobile ? '28px 20px' : '36px 64px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 20 : 0, textAlign: isMobile ? 'center' : 'left' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
            <Logo size={26} />
            <span style={{ fontWeight: 800, fontSize: 15, color: '#ffffff', letterSpacing: '-0.4px' }}>YTGrowth</span>
          </a>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.32)' }}>Built for creators serious about growth.</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)' }}>© 2026 YTGrowth. All rights reserved.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? '12px 20px' : 28, justifyContent: isMobile ? 'center' : 'flex-end' }}>
            {[
              { label: 'Privacy policy',   href: '/privacy' },
              { label: 'Terms of service', href: '/terms' },
              { label: 'Refund policy',    href: '/refund' },
              { label: 'Affiliates',       href: '/affiliate' },
              { label: 'Log in',           href: '/auth/login' },
            ].map((l, i) => (
              <a key={i} href={l.href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', textDecoration: 'none', fontFamily: "'Poppins', system-ui, sans-serif" }}
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
