import { useEffect, useState } from 'react'

/* Shared landing-style footer, extracted verbatim from Landing.jsx's FOOTER
   block so the policy/info pages (Privacy, Terms, Refund, Affiliate,
   Contact) render the exact same design as the marketing home. Ships with
   its own Logo + breakpoint hook so pages can drop it in without adding
   props. */

function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="#ff3b30"/>
      <path d="M23.2 11.6a2.1 2.1 0 0 0-1.48-1.48C20.55 9.8 16 9.8 16 9.8s-4.55 0-5.72.32A2.1 2.1 0 0 0 8.8 11.6 22 22 0 0 0 8.5 16a22 22 0 0 0 .3 4.4 2.1 2.1 0 0 0 1.48 1.48C11.45 22.2 16 22.2 16 22.2s4.55 0 5.72-.32a2.1 2.1 0 0 0 1.48-1.48A22 22 0 0 0 23.5 16a22 22 0 0 0-.3-4.4z" fill="white"/>
      <polygon points="13.5,19 19.5,16 13.5,13" fill="#ff3b30"/>
    </svg>
  )
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  )
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

export default function LandingFooter() {
  const isMobile = useIsMobile()

  return (
    <footer style={{ background: '#07070a', borderTop: '1px solid rgba(255,255,255,0.07)', padding: isMobile ? '34px 24px 24px' : '36px 64px' }}>
      {isMobile ? (
        <div style={{ maxWidth: 360, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Brand block */}
          <a href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Logo size={36} />
            <span style={{ fontWeight: 800, fontSize: 17, color: '#ffffff', letterSpacing: '-0.5px' }}>YTGrowth</span>
          </a>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', textAlign: 'center', margin: 0, marginBottom: 22, lineHeight: 1.55 }}>
            Built for creators serious about growth.
          </p>
          {/* Seam */}
          <div style={{ height: 1, width: 48, background: 'rgba(255,255,255,0.10)', marginBottom: 16 }} />
          {/* Links — single line with middot separators */}
          <div style={{ fontSize: 12.5, textAlign: 'center', marginBottom: 18, lineHeight: 1.8 }}>
            {[
              { label: 'Privacy',    href: '/privacy' },
              { label: 'Terms',      href: '/terms' },
              { label: 'Refunds',    href: '/refund' },
              { label: 'Affiliates', href: '/affiliate' },
            ].map((l, i, arr) => (
              <span key={i}>
                <a href={l.href} style={{ color: 'rgba(255,255,255,0.58)', textDecoration: 'none', transition: 'color 0.15s', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.58)'}
                >{l.label}</a>
                {i < arr.length - 1 && <span aria-hidden="true" style={{ margin: '0 10px', color: 'rgba(255,255,255,0.22)' }}>·</span>}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.28)', margin: 0, textAlign: 'center' }}>© 2026 YTGrowth. All rights reserved.</p>
        </div>
      ) : (
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0 }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
            <Logo size={26} />
            <span style={{ fontWeight: 800, fontSize: 14, color: '#ffffff', letterSpacing: '-0.4px' }}>YTGrowth</span>
          </a>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.32)' }}>Built for creators serious about growth.</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)' }}>© 2026 YTGrowth. All rights reserved.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, justifyContent: 'flex-end' }}>
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
      )}
    </footer>
  )
}
