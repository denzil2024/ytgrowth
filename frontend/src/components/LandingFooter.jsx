import { useEffect, useState } from 'react'

/* Shared landing-style footer. Used on every public page (Landing, Affiliate,
   feature pages, Privacy/Terms/Refund/Contact). Multi-column on desktop , 
   brand + Features + Legal. For clean internal linking. Stacks on mobile. */

function Logo({ size = 32 }) {
  return (
    <img src="/logo-light.svg" alt="ytgrowth"
      style={{ height: size, width: 'auto', display: 'block' }} />
  )
}

const SOCIAL_LINKS = [
  {
    label: 'LinkedIn',
    href:  'https://www.linkedin.com/company/113100340/',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    ),
  },
  {
    label: 'X',
    href:  'https://x.com/ytgrowth_x',
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href:  'https://www.facebook.com/ytgrowthfb',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647z"/>
      </svg>
    ),
  },
  {
    label: 'Product Hunt',
    href:  'https://www.producthunt.com/products/ytgrowth',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M13.604 8.4h-3.405V12h3.405a1.8 1.8 0 1 0 0-3.6zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.801V6h5.804a4.2 4.2 0 1 1 0 8.4z"/>
      </svg>
    ),
  },
]

/* Social icons. Match the existing footer link aesthetic exactly:
   color rgba(255,255,255,0.5) default, white on hover, no borders or
   background fills, no extra padding beyond the icon's own glyph.
   rel="me" pairs with the sameAs entries in the homepage Organization
   JSON-LD so both signals point at the same set of profiles. */
function SocialIcons() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      {SOCIAL_LINKS.map((s, i) => (
        <a
          key={i}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer me"
          aria-label={s.label}
          style={{
            color: 'rgba(255,255,255,0.5)',
            display: 'inline-flex', alignItems: 'center',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ffffff' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
        >
          {s.icon}
        </a>
      ))}
    </div>
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
  { label: 'Outliers',              href: '/features/outliers' },
]

const RESOURCES = [
  { label: 'Top YouTube Channels',                href: '/youtube-stats' },
  { label: 'Blog',                                href: '/blog' },
  { label: 'YouTube Money Calculator',            href: '/tools/youtube-money-calculator' },
  { label: 'YouTube Subscriber Money Calculator', href: '/tools/youtube-subscriber-money-calculator' },
  { label: 'YouTube Channel Name Generator',      href: '/tools/youtube-channel-name-generator' },
  { label: 'YouTube Video Ideas Generator',       href: '/tools/youtube-video-ideas-generator' },
  { label: 'YouTube Thumbnail Resizer',           href: '/tools/youtube-thumbnail-resizer' },
  { label: 'YouTube Thumbnail Downloader',        href: '/tools/youtube-thumbnail-downloader' },
  { label: 'YouTube Channel Stats Checker',       href: '/tools/youtube-channel-stats-checker' },
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
            <Logo size={34} />
          </a>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.42)', textAlign: 'center', marginBottom: 24, lineHeight: 1.55 }}>
            Built for creators serious about growth.
          </p>
          <div style={{ height: 1, width: 48, background: 'rgba(255,255,255,0.10)', marginBottom: 22 }} />

          {/* Mobile: stack columns vertically (no more cramped dot-separated rows) */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>Features</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, alignItems: 'center' }}>
            {FEATURES.map((l, i) => (
              <a key={i} href={l.href} style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500, fontSize: 15, letterSpacing: '-0.1px' }}>
                {l.label}
              </a>
            ))}
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>Resources</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, alignItems: 'center' }}>
            {RESOURCES.map((l, i) => (
              <a key={i} href={l.href} style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500, fontSize: 15, letterSpacing: '-0.1px' }}>
                {l.label}
              </a>
            ))}
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>Company &amp; Legal</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22, alignItems: 'center' }}>
            {[...COMPANY, ...LEGAL].map((l, i) => (
              <a key={i} href={l.href} style={{ color: 'rgba(255,255,255,0.62)', textDecoration: 'none', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500, fontSize: 14.5, letterSpacing: '-0.1px' }}>
                {l.label}
              </a>
            ))}
          </div>
          <div style={{ marginBottom: 18 }}>
            <SocialIcons />
          </div>
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.28)', textAlign: 'center' }}>© 2026 YTGrowth. All rights reserved.</p>
        </div>
      </footer>
    )
  }

  return (
    <footer style={{ background: '#07070a', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '56px 64px 36px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr', gap: 36, marginBottom: 44 }}>
          {/* Brand block */}
          <div>
            <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginBottom: 14 }}>
              <Logo size={28} />
            </a>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.42)', maxWidth: 280, lineHeight: 1.65 }}>
              AI-powered YouTube analytics. Built for creators serious about growth.
            </p>
          </div>

          <Col heading="Features"  links={FEATURES} />
          <Col heading="Resources" links={RESOURCES} />
          <Col heading="Company"   links={COMPANY} />
          <Col heading="Legal"     links={LEGAL} />
        </div>

        {/* Bottom strip */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>© 2026 YTGrowth. All rights reserved.</p>
          <SocialIcons />
        </div>
      </div>
    </footer>
  )
}
