import { useEffect, useRef, useState } from 'react'
import BrandLockup from './BrandLockup'

/* ─── Shared site header (editorial rebuild) ─────────────────────────────
   Re-imagined 2026-06-30. Logo in an outlined sharp "card" hard-left (mirrors
   the CTA geometry, outline instead of fill), text nav in the middle, Log in +
   solid-red CTA hard-right. Dropdowns are small, sharp, text-forward panels
   (no big icon circles, no rounded mega-cards, no heavy shadow). Matches the
   editorial design language (Barlow, warm paper, sharp flat, restrained red).
   See project_design_language_editorial.

   To change the nav anywhere on the site, edit this file. */

const FEATURES = [
  { href: '/features/channel-audit',       label: 'Channel Audit',       desc: '10-dimension AI channel audit' },
  { href: '/features/competitor-analysis', label: 'Competitor Analysis', desc: 'Track rivals, find their gaps' },
  { href: '/features/seo-studio',          label: 'SEO Studio',          desc: 'Score + rewrite titles' },
  { href: '/features/keyword-research',    label: 'Keyword Research',    desc: 'Real search volume + difficulty' },
  { href: '/features/thumbnail-iq',        label: 'Thumbnail IQ',        desc: 'Two-layer thumbnail scoring' },
  { href: '/features/outliers',            label: 'Outliers',            desc: 'Find viral videos + channels' },
]

const TOOLS_POPULAR = [
  { href: '/tools/youtube-money-calculator',        label: 'Money Calculator' },
  { href: '/tools/youtube-title-generator',         label: 'Title Generator' },
  { href: '/tools/youtube-thumbnail-tester',        label: 'Thumbnail Tester (A/B)' },
  { href: '/tools/youtube-keyword-research',        label: 'Keyword Research' },
  { href: '/tools/youtube-channel-stats-checker',   label: 'Channel Stats Checker' },
  { href: '/tools/youtube-video-ideas-generator',   label: 'Video Ideas Generator' },
]

/* All free-tool links for the mobile sheet. */
const TOOLS_ALL = [
  ...TOOLS_POPULAR,
  { href: '/tools/youtube-shorts-money-calculator',     label: 'Shorts Money Calculator' },
  { href: '/tools/youtube-subscriber-money-calculator', label: 'Subscriber Money Calculator' },
  { href: '/tools/youtube-description-generator',       label: 'Description Generator' },
  { href: '/tools/youtube-tag-generator',               label: 'Tag Generator' },
  { href: '/tools/youtube-hashtag-generator',           label: 'Hashtag Generator' },
  { href: '/tools/youtube-chapter-generator',           label: 'Chapter Generator' },
  { href: '/tools/youtube-channel-name-generator',      label: 'Channel Name Generator' },
  { href: '/tools/youtube-thumbnail-resizer',           label: 'Thumbnail Resizer' },
  { href: '/tools/youtube-thumbnail-downloader',        label: 'Thumbnail Downloader' },
]

function Dropdown({ trigger, items, width = 320, footer }) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef(null)
  const show = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setOpen(true) }
  const hide = () => { closeTimer.current = setTimeout(() => setOpen(false), 160) }
  return (
    <div onMouseEnter={show} onMouseLeave={hide} style={{ position: 'relative' }}>
      <span className={`sh-trig${open ? ' open' : ''}`} role="button" tabIndex={0} aria-expanded={open}>
        {trigger}
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s', marginTop: 1 }}>
          <path d="M2 3.5l3 3 3-3"/>
        </svg>
      </span>
      {open && (
        <>
          {/* hover bridge over the gap so the panel doesn't snap shut */}
          <div style={{ position: 'absolute', top: '100%', left: 0, width, height: 14 }} />
          <div className="sh-panel" style={{ width }}>
            {items.map((item, i) => (
              <a key={i} href={item.href} className="sh-panel-item">
                <span className="sh-panel-label">{item.label}</span>
                {item.desc && <span className="sh-panel-desc">{item.desc}</span>}
              </a>
            ))}
            {footer && (
              <a href={footer.href} className="sh-panel-foot">{footer.label}</a>
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
        height: 66px;
        display: flex; align-items: center; justify-content: center;
        padding: 0 32px;
        background: #f6f4ef;
        border-bottom: 1px solid rgba(20,19,15,0.10);
        font-family: 'Barlow', system-ui, sans-serif;
      }
      /* Inner container, aligns the logo + nav + CTA to the same content grid
         (≈1240) used by the page below, so nothing floats off the edge. */
      /* Three zones: logo left, nav centered, actions right. The left and
         right zones flex evenly so the nav sits dead-centre and the spacing
         is symmetric (no lopsided void next to the actions). */
      .sh-inner { width: 100%; max-width: 1176px; display: flex; align-items: center; gap: 20px; }
      .sh-brand-zone { flex: 1; display: flex; align-items: center; min-width: 0; }
      .sh-right { flex: 1; display: flex; align-items: center; justify-content: flex-end; gap: 20px; }

      /* Logo: live-text wordmark, stands on its own (no rule, no box). */
      .sh-brand {
        display: inline-flex; align-items: center;
        text-decoration: none;
        transition: opacity 0.15s;
      }
      .sh-brand:hover { opacity: 0.82; }

      .sh-links { flex: 0 0 auto; display: flex; align-items: center; gap: 4px; }
      .sh-trig, .sh-link {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 8px 14px;
        font-size: 15px; font-weight: 500;
        color: rgba(20,19,15,0.60);
        text-decoration: none; letter-spacing: -0.1px;
        white-space: nowrap; cursor: pointer;
        transition: color 0.15s;
      }
      .sh-trig:hover, .sh-link:hover, .sh-trig.open { color: #14130f; }

      /* Dropdown panel: sharp, hairline, light shadow, tight. */
      .sh-panel {
        position: absolute; top: calc(100% + 12px); left: 0;
        background: #ffffff;
        border: 1px solid rgba(20,19,15,0.12);
        box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        padding: 7px;
        z-index: 110;
        animation: shFadeUp 0.15s ease both;
      }
      .sh-panel-item {
        display: flex; flex-direction: column; gap: 2px;
        padding: 9px 13px;
        border-left: 2px solid transparent;
        text-decoration: none;
        transition: background 0.13s, border-color 0.13s;
      }
      .sh-panel-item:hover { background: rgba(20,19,15,0.04); border-left-color: #e5302a; }
      .sh-panel-label { font-size: 14px; font-weight: 600; color: #14130f; letter-spacing: -0.15px; line-height: 1.3; }
      .sh-panel-desc  { font-size: 12px; font-weight: 400; color: rgba(20,19,15,0.5); letter-spacing: -0.05px; line-height: 1.35; }
      .sh-panel-foot {
        display: block; margin-top: 5px; padding: 11px 13px 7px;
        border-top: 1px solid rgba(20,19,15,0.10);
        font-size: 13px; font-weight: 600; color: #e5302a;
        text-decoration: none; letter-spacing: -0.1px;
      }
      /* Right side */
      .sh-login {
        font-size: 15px; font-weight: 600; color: #14130f;
        text-decoration: none; letter-spacing: -0.1px;
        transition: opacity 0.15s; white-space: nowrap;
      }
      .sh-login:hover { opacity: 0.65; }
      .sh-cta {
        display: inline-flex; align-items: center;
        height: 42px; padding: 0 22px;
        background: #e5302a; color: #fff;
        font-size: 12px; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.08em;
        text-decoration: none; white-space: nowrap;
        transition: filter 0.18s, transform 0.18s;
      }
      .sh-cta:hover { filter: brightness(1.07); transform: translateY(-1px); color: #fff; }

      @media (max-width: 860px) { .sh-nav { padding: 0 18px; height: 60px; } }

      .sh-mobile-toggle { background: none; border: none; cursor: pointer; padding: 4px; color: #14130f; display: flex; align-items: center; }
      .sh-mobile-overlay {
        position: fixed; top: 60px; left: 0; right: 0; bottom: 0;
        background: #f6f4ef; padding: 26px 24px 24px; z-index: 99;
        overflow-y: auto; display: flex; flex-direction: column;
        font-family: 'Barlow', system-ui, sans-serif;
      }
      .sh-mm-section { margin-bottom: 22px; }
      .sh-mm-label { display: block; font-family: 'Barlow', system-ui, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(20,19,15,0.45); margin-bottom: 8px; }
      .sh-mm-link { display: block; font-family: 'Barlow', system-ui, sans-serif; font-size: 15.5px; font-weight: 600; color: #14130f; text-decoration: none; padding: 7px 0; letter-spacing: -0.1px; line-height: 1.3; transition: color 0.15s; }
      .sh-mm-link:hover { color: #e5302a; }
      .sh-mm-seeall { display: inline-block; font-family: 'Barlow', system-ui, sans-serif; font-size: 13px; font-weight: 600; color: #e5302a; text-decoration: none; padding-top: 8px; letter-spacing: 0.02em; }
      .sh-mm-cta-row { display: flex; flex-direction: column; gap: 10px; padding-top: 18px; border-top: 1px solid rgba(20,19,15,0.12); margin-top: auto; }
      .sh-mm-loginlink { display: block; text-align: center; font-family: 'Barlow', system-ui, sans-serif; padding: 8px 0; font-size: 14px; font-weight: 500; text-decoration: none; color: rgba(20,19,15,0.55); letter-spacing: -0.1px; }

      @keyframes shFadeUp { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
    `
    document.head.appendChild(style)
  }, [])
}

export default function SiteHeader({ loggedIn = false }) {
  useStyles()
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 860 : false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 860)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <>
      <nav className="sh-nav">
        <div className="sh-inner">
        <div className="sh-brand-zone">
          <a href="/" className="sh-brand" aria-label="ytgrowth home">
            <BrandLockup height={28} />
          </a>
        </div>
        {!isMobile && (
          <div className="sh-links">
            <Dropdown trigger="Features" items={FEATURES} width={320} />
            <Dropdown
              trigger="Free tools"
              items={[...TOOLS_POPULAR, { href: '/youtube-stats', label: 'Top YouTube Channels' }]}
              width={300}
              footer={{ href: '/tools', label: 'All 15 free tools →' }}
            />
            <a href="/#pricing" className="sh-link">Pricing</a>
            <a href="/blog" className="sh-link">Blog</a>
          </div>
        )}

        <div className="sh-right">
          {!isMobile && !loggedIn && <a href="/auth/login" className="sh-login">Log in</a>}
          {isMobile ? (
            <button onClick={() => setMobileOpen(o => !o)} className="sh-mobile-toggle" aria-label="Toggle menu">
              {mobileOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14130f" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14130f" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
              )}
            </button>
          ) : loggedIn ? (
            <a href="/dashboard" className="sh-cta">Dashboard</a>
          ) : (
            <a href="/auth/login" className="sh-cta">Get started free</a>
          )}
        </div>
        </div>
      </nav>

      {isMobile && mobileOpen && (
        <div className="sh-mobile-overlay">
          <div className="sh-mm-section">
            <span className="sh-mm-label">Features</span>
            {FEATURES.map((it, i) => (
              <a key={i} href={it.href} onClick={() => setMobileOpen(false)} className="sh-mm-link">{it.label}</a>
            ))}
          </div>
          <div className="sh-mm-section">
            <span className="sh-mm-label">Free tools</span>
            {TOOLS_POPULAR.map((it, i) => (
              <a key={i} href={it.href} onClick={() => setMobileOpen(false)} className="sh-mm-link">{it.label}</a>
            ))}
            <a href="/youtube-stats" onClick={() => setMobileOpen(false)} className="sh-mm-link">Top YouTube Channels</a>
            <a href="/tools" onClick={() => setMobileOpen(false)} className="sh-mm-seeall">All 15 free tools →</a>
          </div>
          <div className="sh-mm-section">
            <span className="sh-mm-label">More</span>
            <a href="/#pricing"  onClick={() => setMobileOpen(false)} className="sh-mm-link">Pricing</a>
            <a href="/blog"      onClick={() => setMobileOpen(false)} className="sh-mm-link">Blog</a>
            <a href="/affiliate" onClick={() => setMobileOpen(false)} className="sh-mm-link">Affiliates</a>
            <a href="/contact"   onClick={() => setMobileOpen(false)} className="sh-mm-link">Contact</a>
          </div>
          <div className="sh-mm-cta-row">
            {loggedIn ? (
              <a href="/dashboard" className="sh-cta" style={{ justifyContent: 'center', height: 'auto', padding: '13px 22px', fontSize: 14 }}>Dashboard</a>
            ) : (
              <>
                <a href="/auth/login" className="sh-cta" style={{ justifyContent: 'center', height: 'auto', padding: '13px 22px', fontSize: 14 }}>Get started free</a>
                <a href="/auth/login" className="sh-mm-loginlink">Log in</a>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
