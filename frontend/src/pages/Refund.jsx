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
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytg-styles'
    style.textContent = `
      :root {
        --ytg-bg: #f4f4f6; --ytg-text: #0a0a0f; --ytg-text-2: rgba(10,10,15,0.62);
        --ytg-text-3: rgba(10,10,15,0.44); --ytg-nav: rgba(244,244,246,0.9);
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

export default function Refund() {
  useGlobalStyles()
  useEffect(() => { document.title = 'Refund Policy — YTGrowth' }, [])
  const { isMobile } = useBreakpoint()

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', minHeight: '100vh' }}>

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--ytg-border)', padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ytg-nav)', backdropFilter: 'blur(12px)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <Logo size={28} />
          <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--ytg-text)', letterSpacing: '-0.4px' }}>YTGrowth</span>
        </a>
        <a href="/" style={{ fontSize: 14, color: 'var(--ytg-text-3)', textDecoration: 'none', fontWeight: 500 }}>← Back to home</a>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 100px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontWeight: 800, fontSize: 38, letterSpacing: '-1.2px', color: 'var(--ytg-text)', marginBottom: 8, lineHeight: 1.1 }}>Refund Policy</h1>
        <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 48 }}>Last updated: April 11, 2026</p>

        <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>
          Because YTGrowth provides a free plan with 5 analyses before any payment is required, all purchases are non-refundable. By the time you upgrade, you have already used the product and know exactly what you are paying for.
        </p>

        <div style={{ height: 1, background: 'var(--ytg-border)', margin: '40px 0' }} />

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>Exception</h2>
        <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>The only exception is a major technical failure on our end that makes the product completely unusable for more than 7 consecutive days. In that case, contact <strong>support@ytgrowth.io</strong> and we will make it right.</p>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>Merchant of Record</h2>
        <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>As our Merchant of Record, Lemon Squeezy reserves the right to issue refunds at their discretion to prevent chargebacks.</p>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>Contact</h2>
        <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.8 }}>Questions? Email <strong>support@ytgrowth.io</strong>.</p>
      </div>

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
              <a key={i} href={l.href} style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textDecoration: 'none', fontFamily: "'Inter', system-ui, sans-serif" }}
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
