import { useEffect, useState } from 'react'
import BrandLockup from './BrandLockup'
import { isChannelBrain } from '../brandHost'

/* Shared site footer (big editorial sitemap rebuild, 2026-06-30). Dark band
   (#14130f, the editorial ink) as the page floor, bookending the dark
   app-preview panes used across the feature pages. Three tiers: a Fraunces
   serif statement + CTA pair, a 6-block sitemap (brand + Product + Free tools
   + Resources + Company + Legal), and a copyright strip. On-dark accents use
   gold #e6b35c (the locked rule); the solid-red CTA stays red. Social marks
   are bare minimal icons (gold on hover), not round white bubbles.
   See project_design_language_editorial. */

const INK   = '#14130f'
const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"
const GOLD  = '#e6b35c'
const CREAM = '#f6f4ef'

const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/113100340/', size: 23, path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' },
  { label: 'X',        href: 'https://x.com/ytgrowth_x', size: 20, path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z' },
  { label: 'Facebook', href: 'https://www.facebook.com/ytgrowthfb', size: 23, path: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647z' },
  { label: 'Product Hunt', href: 'https://www.producthunt.com/products/ytgrowth', size: 23, path: 'M13.604 8.4h-3.405V12h3.405a1.8 1.8 0 1 0 0-3.6zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.801V6h5.804a4.2 4.2 0 1 1 0 8.4z' },
]

function SocialIcons({ center = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, justifyContent: center ? 'center' : 'flex-start' }}>
      {SOCIAL_LINKS.map((s, i) => (
        <a key={i} href={s.href} target="_blank" rel="noopener noreferrer me" aria-label={s.label}
          style={{ color: 'rgba(255,255,255,0.5)', display: 'inline-flex', transition: 'color 0.15s', flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.color = GOLD }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
        >
          <svg viewBox="0 0 24 24" width={s.size} height={s.size} fill="currentColor" aria-hidden="true"><path d={s.path}/></svg>
        </a>
      ))}
    </div>
  )
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

/* Load Fraunces + Barlow so the footer renders in the editorial type on every
   page, including ones not migrated yet. (Self-hosted at production build.) */
function useFooterFont() {
  useEffect(() => {
    if (document.getElementById('ftr-fonts')) return
    const l = document.createElement('link')
    l.id = 'ftr-fonts'; l.rel = 'stylesheet'
    document.head.appendChild(l)
  }, [])
}

const FEATURES = [
  { label: 'Channel Audit',       href: '/features/channel-audit' },
  { label: 'Competitor Analysis', href: '/features/competitor-analysis' },
  { label: 'SEO Studio',          href: '/features/seo-studio' },
  { label: 'Thumbnail IQ',        href: '/features/thumbnail-iq' },
  { label: 'Keyword Research',    href: '/features/keyword-research' },
  { label: 'Outliers',            href: '/features/outliers' },
]

/* Curated free tools (the popular ones). The full set of 15 lives on the
   /tools hub, reached via the "All tools" link below. */
const TOOLS = [
  { label: 'Money Calculator',      href: '/tools/youtube-money-calculator' },
  { label: 'Keyword Research',      href: '/tools/youtube-keyword-research' },
  { label: 'Title Generator',       href: '/tools/youtube-title-generator' },
  { label: 'Thumbnail Tester',      href: '/tools/youtube-thumbnail-tester' },
  { label: 'Channel Stats Checker', href: '/tools/youtube-channel-stats-checker' },
]

/* Resources = the catch-all of everything outside Product + Free tools, sized
   to match those columns (6 links) so the three columns read as one even row.
   Log in lives in the header, so it's not repeated here. */
const RESOURCES = [
  { label: 'Creator earnings',     href: '/tools#earnings' },
  { label: 'Top YouTube Channels', href: '/youtube-stats' },
  { label: 'Blog',                 href: '/blog' },
  { label: 'Pricing',              href: '/#pricing' },
  { label: 'Affiliates',           href: '/affiliate' },
  { label: 'Contact',              href: '/contact' },
]

const LEGAL = [
  { label: 'Privacy policy',   href: '/privacy' },
  { label: 'Terms of service', href: '/terms' },
  { label: 'Refund policy',    href: '/refund' },
]

const linkStyle = {
  fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
  transition: 'color 0.15s', fontFamily: SANS, fontWeight: 500,
  letterSpacing: '0.01em', display: 'block', padding: '6px 0',
}
const moreStyle = { ...linkStyle, color: GOLD, fontWeight: 600, letterSpacing: '0.03em' }
const colHeading = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.40)', marginBottom: 16, fontFamily: SANS,
}

function FooterLink({ href, label, style = linkStyle }) {
  return (
    <a href={href} style={style}
      onMouseEnter={e => e.currentTarget.style.color = CREAM}
      onMouseLeave={e => e.currentTarget.style.color = style.color}
    >{label}</a>
  )
}

function Col({ heading, links, more }) {
  return (
    <div>
      <p style={colHeading}>{heading}</p>
      <div>
        {links.map((l, i) => <FooterLink key={i} href={l.href} label={l.label} />)}
        {more && <FooterLink href={more.href} label={more.label} style={moreStyle} />}
      </div>
    </div>
  )
}

function CtaButtons() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <a href="/auth/login" style={{
        background: '#e5302a', color: '#fff', fontWeight: 700, fontSize: 12.5,
        padding: '14px 24px', borderRadius: 0, textDecoration: 'none', fontFamily: SANS,
        letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap',
        transition: 'filter 0.15s, transform 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.07)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
      >Get started free</a>
      <a href="/#pricing" style={{
        background: 'transparent', color: '#fff', fontWeight: 600, fontSize: 12.5,
        padding: '14px 24px', borderRadius: 0, textDecoration: 'none', fontFamily: SANS,
        letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap',
        border: '1px solid rgba(255,255,255,0.28)', transition: 'background 0.15s, border-color 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)' }}
      >Pricing</a>
    </div>
  )
}

function Statement({ size }) {
  return (
    <h2 style={{ fontFamily: SERIF, fontWeight: 400, color: CREAM, fontSize: size, lineHeight: 1.1, letterSpacing: '-0.01em', textWrap: 'balance', margin: 0 }}>
      Grow on YouTube with <em style={{ fontStyle: 'italic', color: GOLD }}>data</em>, not guesswork.
    </h2>
  )
}

export default function LandingFooter() {
  const isMobile = useIsMobile()
  useFooterFont()

  if (isMobile) {
    return (
      <footer style={{ background: INK, padding: '52px 24px 32px', fontFamily: SANS }}>
        <div style={{ maxWidth: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}><Statement size={26} /></div>
          <div style={{ width: '100%', maxWidth: 340, marginTop: 22, marginBottom: 34, display: 'flex', justifyContent: 'center' }}>
            <CtaButtons />
          </div>
          <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 30 }} />

          <a href="/" style={{ textDecoration: 'none', marginBottom: 12 }}>
            <BrandLockup height={30} tone="light" />
          </a>
          <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 26, lineHeight: 1.6, maxWidth: 300, fontFamily: SANS }}>
            AI-powered YouTube analytics for creators serious about growth.
          </p>

          {[['Product', FEATURES, null], ['Free tools', TOOLS, { label: 'All tools →', href: '/tools' }], ['Resources', RESOURCES, null], ['Legal', LEGAL, null]].map(([heading, links, more], i) => (
            <div key={i} style={{ marginBottom: 26, textAlign: 'center' }}>
              <p style={{ ...colHeading, marginBottom: 12 }}>{heading}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {links.map((l, j) => (
                  <a key={j} href={l.href} style={{ ...linkStyle, fontSize: 15, padding: 0, color: 'rgba(255,255,255,0.64)' }}>{l.label}</a>
                ))}
                {more && <a href={more.href} style={{ ...moreStyle, fontSize: 15, padding: 0 }}>{more.label}</a>}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 6, marginBottom: 24 }}>
            <SocialIcons center />
          </div>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontFamily: SANS }}>© 2026 {isChannelBrain() ? 'ChannelBrain' : 'YTGrowth'}. All rights reserved.</p>
        </div>
      </footer>
    )
  }

  return (
    <footer style={{ background: INK, padding: '72px 64px 36px', fontFamily: SANS }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Tier 1. Serif statement + CTA pair */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, marginBottom: 44, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 460 }}><Statement size={38} /></div>
          <CtaButtons />
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 48 }} />

        {/* Tier 2. Sitemap: brand block + 3 even single-heading columns. */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1.5fr) 1fr 1fr 1fr', gap: 48, marginBottom: 52 }}>
          <div style={{ maxWidth: 320 }}>
            <a href="/" style={{ textDecoration: 'none', display: 'inline-flex', marginBottom: 16 }}>
              <BrandLockup height={30} tone="light" />
            </a>
            <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: 26, maxWidth: 270, fontFamily: SANS }}>
              AI-powered YouTube analytics for creators serious about growth.
            </p>
            <SocialIcons />
          </div>

          <Col heading="Product"    links={FEATURES} />
          <Col heading="Free tools" links={TOOLS} more={{ label: 'All tools →', href: '/tools' }} />
          <Col heading="Resources" links={RESOURCES} />
        </div>

        {/* Tier 3. Copyright + legal strip */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 500, letterSpacing: '0.01em', fontFamily: SANS }}>© 2026 {isChannelBrain() ? 'ChannelBrain' : 'YTGrowth'}. All rights reserved.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {LEGAL.map((l, i) => (
              <a key={i} href={l.href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: SANS, fontWeight: 500, letterSpacing: '0.01em', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = CREAM}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              >{l.label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
