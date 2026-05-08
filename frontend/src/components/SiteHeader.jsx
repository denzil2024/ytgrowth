import { useEffect, useState } from 'react'

/* ─── Shared site header ─────────────────────────────────────────────────
   One nav, used on every public page outside Landing (Affiliate, Contact,
   the 6 feature pages, the 4 free tool pages, Blog index, every blog
   post). Landing.jsx keeps its own version because it has logged-in
   detection and other landing-specific bits.

   To change the nav anywhere on the site, edit this file. */

const FEATURE_GROUPS = [
  {
    label: 'Audit & strategy',
    items: [
      { href: '/features/channel-audit', label: 'Channel Audit' },
    ],
  },
  {
    label: 'SEO & discovery',
    items: [
      { href: '/features/seo-studio',       label: 'SEO Studio' },
      { href: '/features/keyword-research', label: 'Keyword Research' },
      { href: '/features/outliers',         label: 'Outliers' },
    ],
  },
  {
    label: 'Compete & convert',
    items: [
      { href: '/features/competitor-analysis', label: 'Competitor Analysis' },
      { href: '/features/thumbnail-iq',        label: 'Thumbnail IQ' },
    ],
  },
]

/* Resources — 3-column mega menu. Verb-based categories, clean labels,
   no descriptions. Vertical dividers between columns. Same structural
   pattern as the Features mega menu so the two read as a matched set. */
const RESOURCES_GROUPS = [
  {
    label: 'Calculators',
    items: [
      { href: '/tools/youtube-money-calculator',            label: 'YouTube Money Calculator' },
      { href: '/tools/youtube-subscriber-money-calculator', label: 'Subscriber Money Calculator' },
    ],
  },
  {
    label: 'Thumbnails',
    items: [
      { href: '/tools/youtube-thumbnail-resizer',    label: 'Thumbnail Resizer' },
      { href: '/tools/youtube-thumbnail-downloader', label: 'Thumbnail Downloader' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/tools/youtube-channel-stats-checker', label: 'Channel Stats Checker' },
      { href: '/blog',                                label: 'Blog' },
    ],
  },
]

function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill="#ff3b30"/>
      <path d="M23.2 11.6a2.1 2.1 0 0 0-1.48-1.48C20.55 9.8 16 9.8 16 9.8s-4.55 0-5.72.32A2.1 2.1 0 0 0 8.8 11.6 22 22 0 0 0 8.5 16a22 22 0 0 0 .3 4.4 2.1 2.1 0 0 0 1.48 1.48C11.45 22.2 16 22.2 16 22.2s4.55 0 5.72-.32a2.1 2.1 0 0 0 1.48-1.48A22 22 0 0 0 23.5 16a22 22 0 0 0-.3-4.4z" fill="white"/>
      <polygon points="13.5,19 19.5,16 13.5,13" fill="#ff3b30"/>
    </svg>
  )
}

function MegaMenu({ trigger, groups, columns = 2, viewAllHref, viewAllLabel, panelLeft = -24 }) {
  const [open, setOpen] = useState(false)
  // Wider panels — 2-col was looking cramped at 540px. Both column layouts
  // now give items plenty of horizontal room so the panel reads as a proper
  // resource surface, not a small dropdown box.
  const panelWidth = columns === 3 ? 820 : 720
  return (
    <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} style={{ position: 'relative' }}>
      <a href={groups[0].items[0].href} className="sh-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
        {trigger}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>
          <path d="M2 3.5l3 3 3-3"/>
        </svg>
      </a>
      {open && (
        <>
          {/* Hover bridge — keeps the panel open while moving the cursor down */}
          <div style={{ position: 'absolute', top: '100%', left: panelLeft, width: panelWidth + 48, height: 14 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 10px)', left: panelLeft,
            background: '#ffffff', border: '1px solid rgba(10,10,15,0.08)', borderRadius: 18,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.13)',
            padding: '36px 40px 26px',
            width: panelWidth,
            animation: 'shFadeUp 0.16s ease both',
            zIndex: 110,
          }}>
            {/* Columns separated by thin vertical dividers — uses gap-as-divider
                pattern: each column gets right padding and a right border, the
                last one omits both. */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 0 }}>
              {groups.map((group, gi) => {
                const isLast = gi === groups.length - 1
                return (
                  <div key={gi} style={{
                    paddingLeft: gi === 0 ? 0 : 28,
                    paddingRight: isLast ? 0 : 28,
                    borderRight: isLast ? 'none' : '1px solid rgba(10,10,15,0.08)',
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(10,10,15,0.38)', marginBottom: 14, whiteSpace: 'nowrap' }}>{group.label}</p>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {group.items.map((item, i) => (
                        <a key={i} href={item.href}
                          style={{ display: 'block', padding: '8px 0', fontSize: 14.5, fontWeight: 500, color: '#0a0a0f', letterSpacing: '-0.15px', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'color 0.13s' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#e5302a' }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#0a0a0f' }}
                        >{item.label}</a>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            {viewAllHref && (
              <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid rgba(10,10,15,0.07)' }}>
                <a href={viewAllHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13.5, fontWeight: 600, color: '#e5302a', textDecoration: 'none', letterSpacing: '-0.1px' }}>
                  {viewAllLabel}
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function useStyles() {
  useEffect(() => {
    if (document.getElementById('sh-styles')) return
    const style = document.createElement('style')
    style.id = 'sh-styles'
    style.textContent = `
      .sh-nav {
        position: sticky; top: 0; z-index: 100;
        height: 60px;
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 48px 0 80px;
        background: rgba(244,244,246,0.92);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-bottom: 1px solid rgba(10,10,15,0.09);
        font-family: 'Inter', system-ui, sans-serif;
      }
      @media (max-width: 1024px) { .sh-nav { padding: 0 32px; } }
      @media (max-width: 768px)  { .sh-nav { padding: 0 20px; } }

      .sh-brand { display: flex; align-items: center; gap: 9px; text-decoration: none; }
      .sh-brand-name { font-weight: 800; font-size: 17px; line-height: 1; letter-spacing: -0.4px; color: #0a0a0f; }

      .sh-link {
        font-size: 14px; color: rgba(10,10,15,0.40);
        font-weight: 500; text-decoration: none;
        transition: color 0.15s; letter-spacing: -0.1px;
      }
      .sh-link:hover { color: rgba(10,10,15,0.62); }

      .sh-cta {
        display: inline-flex; align-items: center; gap: 6px;
        background: #e5302a; color: #fff;
        padding: 9px 22px; border-radius: 100px;
        font-size: 13px; font-weight: 700;
        text-decoration: none;
        letter-spacing: -0.1px;
        white-space: nowrap;
        box-shadow: 0 1px 2px rgba(0,0,0,0.10), 0 4px 14px rgba(229,48,42,0.30);
        transition: filter 0.18s, transform 0.18s;
      }
      .sh-cta:hover { filter: brightness(1.07); transform: translateY(-1px); color: #fff; }

      .sh-mobile-toggle {
        background: none; border: none; cursor: pointer; padding: 6px;
        color: #0a0a0f;
        display: flex; flex-direction: column; gap: 4.5px;
      }
      /* Mobile overlay — full-screen dark sheet to match the Landing
         mobile menu so the brand surface stays consistent across the
         site. White overlays read as "abandoned" against feature/tool
         pages that already have light bg. */
      .sh-mobile-overlay {
        position: fixed; top: 60px; left: 0; right: 0; bottom: 0;
        background: #0d0d12;
        padding: 28px 24px 24px;
        z-index: 99;
        overflow-y: auto;
        display: flex; flex-direction: column;
      }
      .sh-mm-section { margin-bottom: 28px; }
      .sh-mm-section:last-of-type { margin-bottom: 18px; }
      .sh-mm-label {
        display: block; font-size: 11px; font-weight: 700;
        letter-spacing: 0.12em; text-transform: uppercase;
        color: rgba(255,255,255,0.38); margin-bottom: 12px;
      }
      .sh-mm-link {
        display: block; font-size: 18px; font-weight: 600;
        color: #ffffff; text-decoration: none; padding: 6px 0;
        letter-spacing: -0.3px; line-height: 1.35;
        transition: color 0.15s;
      }
      .sh-mm-link:hover { color: rgba(255,255,255,0.78); }
      .sh-mm-cta-row {
        display: flex; flex-direction: column; gap: 10px;
        padding-top: 18px;
        border-top: 1px solid rgba(255,255,255,0.08);
        margin-top: auto;
      }
      .sh-mm-loginlink {
        display: block; text-align: center; padding: 8px 0;
        font-size: 14px; font-weight: 500; text-decoration: none;
        color: rgba(255,255,255,0.62); letter-spacing: -0.1px;
      }
      @keyframes shFadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
    `
    document.head.appendChild(style)
  }, [])
}

export default function SiteHeader() {
  useStyles()
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <>
      <nav className="sh-nav">
        <a href="/" className="sh-brand">
          <Logo size={28} />
          <span className="sh-brand-name">YTGrowth</span>
        </a>

        {!isMobile && (
          <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
            <MegaMenu trigger="Features"  groups={FEATURE_GROUPS}   columns={3} viewAllHref="/#features" viewAllLabel="Explore all features →" />
            <MegaMenu trigger="Resources" groups={RESOURCES_GROUPS} columns={3} viewAllHref="/blog"      viewAllLabel="Read the latest from the blog →" />
            <a href="/#pricing"  className="sh-link">Pricing</a>
            <a href="/affiliate" className="sh-link">Affiliates</a>
            <a href="/contact"   className="sh-link">Contact</a>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!isMobile && <a href="/auth/login" className="sh-link">Log in</a>}
          {isMobile ? (
            <button onClick={() => setMobileOpen(o => !o)} className="sh-mobile-toggle" aria-label="Toggle menu">
              {mobileOpen ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              ) : (
                <>
                  <span style={{ display: 'block', width: 20, height: 2, background: '#0a0a0f', borderRadius: 2 }} />
                  <span style={{ display: 'block', width: 20, height: 2, background: '#0a0a0f', borderRadius: 2 }} />
                  <span style={{ display: 'block', width: 14, height: 2, background: '#0a0a0f', borderRadius: 2 }} />
                </>
              )}
            </button>
          ) : (
            <a href="/auth/login" className="sh-cta">Get started free</a>
          )}
        </div>
      </nav>

      {isMobile && mobileOpen && (
        <div className="sh-mobile-overlay">
          <div className="sh-mm-section">
            <span className="sh-mm-label">Features</span>
            {FEATURE_GROUPS.flatMap(g => g.items).map((it, i) => (
              <a key={i} href={it.href} onClick={() => setMobileOpen(false)} className="sh-mm-link">{it.label}</a>
            ))}
          </div>
          <div className="sh-mm-section">
            <span className="sh-mm-label">Resources</span>
            {RESOURCES_GROUPS.flatMap(g => {
              if (g.sections) return g.sections.flatMap(s => s.items)
              return g.items
            }).map((it, i) => (
              <a key={i} href={it.href} onClick={() => setMobileOpen(false)} className="sh-mm-link">{it.label}</a>
            ))}
          </div>
          <div className="sh-mm-section">
            <span className="sh-mm-label">Explore</span>
            <a href="/#pricing"  onClick={() => setMobileOpen(false)} className="sh-mm-link">Pricing</a>
            <a href="/affiliate" onClick={() => setMobileOpen(false)} className="sh-mm-link">Affiliates</a>
            <a href="/contact"   onClick={() => setMobileOpen(false)} className="sh-mm-link">Contact</a>
          </div>
          <div className="sh-mm-cta-row">
            <a href="/auth/login" className="sh-cta" style={{ justifyContent: 'center', padding: '13px 22px', fontSize: 14 }}>Get started free</a>
            <a href="/auth/login" className="sh-mm-loginlink">Log in</a>
          </div>
        </div>
      )}
    </>
  )
}
