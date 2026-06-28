import { useEffect, useState } from 'react'

/* Shared landing-style footer. Used on every public page (Landing, Affiliate,
   feature pages, Privacy/Terms/Refund/Contact). Windsor-style: navy ground,
   Manrope, brand block on the left (logo + tagline + CTA + white circular
   social buttons), link columns on the right, copyright + legal strip below.
   Stacks centered on mobile. */

import BrandLockup from './BrandLockup'

const INK = '#0d0d12'
const FONT = "'Manrope', 'Inter', system-ui, sans-serif"

const SOCIAL_LINKS = [
  {
    label: 'LinkedIn',
    href:  'https://www.linkedin.com/company/113100340/',
    icon: (
      <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    ),
  },
  {
    label: 'X',
    href:  'https://x.com/ytgrowth_x',
    icon: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href:  'https://www.facebook.com/ytgrowthfb',
    icon: (
      <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
        <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647z"/>
      </svg>
    ),
  },
  {
    label: 'Product Hunt',
    href:  'https://www.producthunt.com/products/ytgrowth',
    icon: (
      <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
        <path d="M13.604 8.4h-3.405V12h3.405a1.8 1.8 0 1 0 0-3.6zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.801V6h5.804a4.2 4.2 0 1 1 0 8.4z"/>
      </svg>
    ),
  },
]

/* White circular social buttons with the navy glyph inside, the distinctive
   Windsor footer detail. rel="me" pairs with the homepage Organization JSON-LD
   sameAs list so both signals point at the same set of profiles. */
function SocialIcons({ center = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: center ? 'center' : 'flex-start' }}>
      {SOCIAL_LINKS.map((s, i) => (
        <a
          key={i}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer me"
          aria-label={s.label}
          style={{
            width: 44, height: 44, borderRadius: '50%', background: '#ffffff', color: INK,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
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
  { label: 'Top YouTube Channels', href: '/youtube-stats' },
  { label: 'Blog',                 href: '/blog' },
]

/* Every free tool gets a static, crawlable link here. The header mega menu
   only renders its tool links on hover (conditional), so the footer is the
   one place crawlers reliably see them, prevents Ahrefs "orphan page" flags.
   Keep this list in sync with the tool routes in App.jsx. Labels drop the
   "YouTube" prefix since the column heading already supplies the context. */
const TOOLS = [
  { label: 'Money Calculator',            href: '/tools/youtube-money-calculator' },
  { label: 'Subscriber Money Calculator', href: '/tools/youtube-subscriber-money-calculator' },
  { label: 'Shorts Money Calculator',     href: '/tools/youtube-shorts-money-calculator' },
  { label: 'Title Generator',             href: '/tools/youtube-title-generator' },
  { label: 'Description Generator',        href: '/tools/youtube-description-generator' },
  { label: 'Tag Generator',               href: '/tools/youtube-tag-generator' },
  { label: 'Hashtag Generator',           href: '/tools/youtube-hashtag-generator' },
  { label: 'Chapter Generator',           href: '/tools/youtube-chapter-generator' },
  { label: 'Channel Name Generator',      href: '/tools/youtube-channel-name-generator' },
  { label: 'Video Ideas Generator',       href: '/tools/youtube-video-ideas-generator' },
  { label: 'Thumbnail Tester',            href: '/tools/youtube-thumbnail-tester' },
  { label: 'Thumbnail Resizer',           href: '/tools/youtube-thumbnail-resizer' },
  { label: 'Thumbnail Downloader',        href: '/tools/youtube-thumbnail-downloader' },
  { label: 'Channel Stats Checker',       href: '/tools/youtube-channel-stats-checker' },
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
  fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'none',
  transition: 'color 0.15s', fontFamily: FONT,
  fontWeight: 400, letterSpacing: '-0.1px', display: 'block',
  padding: '5px 0',
}
const colHeading = {
  fontSize: 14.5, fontWeight: 600, letterSpacing: '-0.1px',
  color: 'rgba(255,255,255,0.95)', marginBottom: 15, fontFamily: FONT,
}

function Col({ heading, links }) {
  return (
    <div>
      <p style={colHeading}>{heading}</p>
      <div>
        {links.map((l, i) => (
          <a key={i} href={l.href} style={linkStyle}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
          >{l.label}</a>
        ))}
      </div>
    </div>
  )
}

/* CTA block: red primary + outline secondary, capped at 430px (Windsor's
   .cta_bot). Primary keeps our brand red instead of Windsor's blue. */
function CtaButtons() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', maxWidth: 430 }}>
      <a href="/auth/login" style={{
        flex: 1, textAlign: 'center', background: '#e5302a', color: '#fff',
        fontWeight: 700, fontSize: 14, padding: '13px 18px', borderRadius: 100,
        textDecoration: 'none', fontFamily: FONT, letterSpacing: '-0.1px', whiteSpace: 'nowrap',
        boxShadow: '0 1px 2px rgba(0,0,0,0.18), 0 6px 18px rgba(229,48,42,0.30)',
        transition: 'filter 0.15s, transform 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.07)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
      >Get started free</a>
      <a href="/#pricing" style={{
        flex: 1, textAlign: 'center', background: 'transparent', color: '#fff',
        fontWeight: 600, fontSize: 14, padding: '13px 18px', borderRadius: 100,
        textDecoration: 'none', fontFamily: FONT, letterSpacing: '-0.1px', whiteSpace: 'nowrap',
        border: '1px solid rgba(255,255,255,0.28)', transition: 'background 0.15s, border-color 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)' }}
      >Pricing</a>
    </div>
  )
}

const legalRow = {
  display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
}
const legalLink = {
  fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none',
  fontFamily: FONT, fontWeight: 400, letterSpacing: '-0.1px', transition: 'color 0.15s',
}

export default function LandingFooter() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <footer style={{ background: INK, padding: '40px 24px 30px', fontFamily: FONT }}>
        <div style={{ maxWidth: 380, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <a href="/" style={{ textDecoration: 'none', marginBottom: 14 }}>
            <BrandLockup height={30} tone="light" />
          </a>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 24, lineHeight: 1.6, maxWidth: 300 }}>
            AI-powered YouTube analytics. Built for creators serious about growth.
          </p>
          <div style={{ width: '100%', maxWidth: 320, marginBottom: 30 }}>
            <CtaButtons />
          </div>

          {[['Features', FEATURES], ['Free tools', TOOLS], ['Resources', RESOURCES], ['Company', COMPANY], ['Legal', LEGAL]].map(([heading, links], i) => (
            <div key={i} style={{ marginBottom: 26, textAlign: 'center' }}>
              <p style={{ ...colHeading, marginBottom: 12 }}>{heading}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {links.map((l, j) => (
                  <a key={j} href={l.href} style={{ ...linkStyle, fontSize: 15, padding: 0, color: 'rgba(255,255,255,0.62)' }}>{l.label}</a>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 6, marginBottom: 24 }}>
            <SocialIcons center />
          </div>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>© 2026 YTGrowth. All rights reserved.</p>
        </div>
      </footer>
    )
  }

  return (
    <footer style={{ background: INK, padding: '64px 64px 36px', fontFamily: FONT }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 2fr 1fr', gap: 40, marginBottom: 48 }}>
          {/* Brand block */}
          <div style={{ maxWidth: 360 }}>
            <a href="/" style={{ textDecoration: 'none', display: 'inline-flex', marginBottom: 16 }}>
              <BrandLockup height={30} tone="light" />
            </a>
            <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: 26, maxWidth: 300 }}>
              AI-powered YouTube analytics. Built for creators serious about growth.
            </p>
            <CtaButtons />
            <div style={{ marginTop: 32 }}>
              <SocialIcons />
            </div>
          </div>

          <Col heading="Features" links={FEATURES} />

          {/* Free tools split across two sub-columns so it doesn't tower over
              the rest of the footer. */}
          <div>
            <p style={colHeading}>Free tools</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 28 }}>
              {[TOOLS.slice(0, 7), TOOLS.slice(7)].map((group, gi) => (
                <div key={gi}>
                  {group.map((l, i) => (
                    <a key={i} href={l.href} style={linkStyle}
                      onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                    >{l.label}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Company + Resources combined into one full-height column so the
              right side matches the dense tool columns instead of trailing off
              into two short, sparse columns. */}
          <div>
            <Col heading="Company" links={COMPANY} />
            <div style={{ marginTop: 24 }}>
              <Col heading="Resources" links={RESOURCES} />
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 400, letterSpacing: '-0.1px' }}>© 2026 YTGrowth. All rights reserved.</p>
          <div style={legalRow}>
            {LEGAL.map((l, i) => (
              <a key={i} href={l.href} style={legalLink}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
              >{l.label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
