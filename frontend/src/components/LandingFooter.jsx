import { useEffect, useState } from 'react'

/* Shared landing-style footer. Used on every public page (Landing, Affiliate,
   feature pages, Privacy/Terms/Refund/Contact). Multi-column on desktop —
   brand + Features + Legal — for clean internal linking. Stacks on mobile. */

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

const FEATURES = [
  { label: 'Channel Audit',         href: '/features/channel-audit' },
  { label: 'Competitor Analysis',   href: '/features/competitor-analysis' },
  { label: 'SEO Studio',            href: '/features/seo-studio' },
  { label: 'Thumbnail IQ',          href: '/features/thumbnail-iq' },
  { label: 'Keyword Research',      href: '/features/keyword-research' },
]

const COMPANY = [
  { label: 'Affiliates',       href: '/affiliate' },
  { label: 'Contact',          href: '/contact' },
  { label: 'Pricing',          href: '/#pricing' },
  { label: 'Log in',           href: '/auth/login' },
]

const LEGAL = [
  { label: 'Privacy policy',   href: '/privacy' },
  { label: 'Terms of service', href: '/terms' },
  { label: 'Refund policy',    href: '/refund' },
]

const linkStyle = {
  fontSize: 13.5, color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
  transition: 'color 0.15s', fontFamily: "'Inter', system-ui, sans-serif",
  fontWeight: 500, letterSpacing: '-0.1px', display: 'block',
  padding: '4px 0',
}
const colHeading = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.35)', marginBottom: 14,
}

function Col({ heading, links }) {
  return (
    <div>
      <p style={colHeading}>{heading}</p>
      <div>
        {links.map((l, i) => (
          <a key={i} href={l.href} style={linkStyle}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
          >{l.label}</a>
        ))}
      </div>
    </div>
  )
}

export default function LandingFooter() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <footer style={{ background: '#07070a', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '36px 24px 26px' }}>
        <div style={{ maxWidth: 360, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Logo size={36} />
            <span style={{ fontWeight: 800, fontSize: 17, color: '#ffffff', letterSpacing: '-0.5px' }}>YTGrowth</span>
          </a>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.42)', textAlign: 'center', marginBottom: 24, lineHeight: 1.55 }}>
            Built for creators serious about growth.
          </p>
          <div style={{ height: 1, width: 48, background: 'rgba(255,255,255,0.10)', marginBottom: 22 }} />

          {/* Mobile: collapse all sections into single-line link rows with separators */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>Features</p>
          <div style={{ fontSize: 13, textAlign: 'center', marginBottom: 22, lineHeight: 1.85 }}>
            {FEATURES.map((l, i, arr) => (
              <span key={i}>
                <a href={l.href} style={{ color: 'rgba(255,255,255,0.62)', textDecoration: 'none', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500 }}>{l.label}</a>
                {i < arr.length - 1 && <span style={{ margin: '0 8px', color: 'rgba(255,255,255,0.22)' }}>·</span>}
              </span>
            ))}
          </div>

          <div style={{ fontSize: 12.5, textAlign: 'center', marginBottom: 18, lineHeight: 1.85 }}>
            {[...COMPANY, ...LEGAL].map((l, i, arr) => (
              <span key={i}>
                <a href={l.href} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500 }}>{l.label}</a>
                {i < arr.length - 1 && <span style={{ margin: '0 8px', color: 'rgba(255,255,255,0.22)' }}>·</span>}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.28)', textAlign: 'center' }}>© 2026 YTGrowth. All rights reserved.</p>
        </div>
      </footer>
    )
  }

  return (
    <footer style={{ background: '#07070a', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '56px 64px 36px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40, marginBottom: 44 }}>
          {/* Brand block */}
          <div>
            <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Logo size={28} />
              <span style={{ fontWeight: 800, fontSize: 15, color: '#ffffff', letterSpacing: '-0.4px' }}>YTGrowth</span>
            </a>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.42)', maxWidth: 280, lineHeight: 1.65 }}>
              AI-powered YouTube analytics. Built for creators serious about growth.
            </p>
          </div>

          <Col heading="Features" links={FEATURES} />
          <Col heading="Company"  links={COMPANY} />
          <Col heading="Legal"    links={LEGAL} />
        </div>

        {/* Bottom strip */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>© 2026 YTGrowth. All rights reserved.</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>Built for creators serious about growth.</p>
        </div>
      </div>
    </footer>
  )
}
