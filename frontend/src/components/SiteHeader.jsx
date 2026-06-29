import { useEffect, useRef, useState } from 'react'
import {
  Gauge, Search, KeyRound, TrendingUp, Swords, Image,
  DollarSign, Coins, Wallet, Type, AlignLeft, Tags, Hash,
  ListOrdered, Badge, Lightbulb, Columns2, Crop, Download,
  Trophy, BarChart3, BookOpen, Handshake, Mail, ScanSearch,
} from 'lucide-react'
import BrandLockup from './BrandLockup'

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
      { href: '/features/channel-audit', label: 'Channel Audit', desc: '10-dimension AI audit of your channel', Icon: Gauge },
    ],
  },
  {
    label: 'SEO & discovery',
    items: [
      { href: '/features/seo-studio',       label: 'SEO Studio',       desc: 'Score + rewrite titles and descriptions', Icon: Search },
      { href: '/features/keyword-research', label: 'Keyword Research', desc: 'YouTube-native search volume + difficulty', Icon: KeyRound },
      { href: '/features/outliers',         label: 'Outliers',         desc: 'Find viral videos and breakout channels', Icon: TrendingUp },
    ],
  },
  {
    label: 'Compete & convert',
    items: [
      { href: '/features/competitor-analysis', label: 'Competitor Analysis', desc: 'Track rivals, find their content gaps', Icon: Swords },
      { href: '/features/thumbnail-iq',        label: 'Thumbnail IQ',        desc: 'Two-layer thumbnail scoring vs your niche', Icon: Image },
    ],
  },
]

/* Resources, 4-column mega menu. Verb-based categories, clean labels,
   vertical dividers between columns. Same structural pattern as the
   Features mega menu so the two read as a matched set. */
const RESOURCES_GROUPS = [
  {
    label: 'Calculators',
    items: [
      { href: '/tools/youtube-money-calculator',            label: 'YouTube Money Calculator', Icon: DollarSign },
      { href: '/tools/youtube-shorts-money-calculator',     label: 'Shorts Money Calculator',  Icon: Coins },
      { href: '/tools/youtube-subscriber-money-calculator', label: 'Subscriber Money Calculator', Icon: Wallet },
    ],
  },
  {
    label: 'Brainstorm',
    items: [
      { href: '/tools/youtube-title-generator',        label: 'Title Generator',        Icon: Type },
      { href: '/tools/youtube-description-generator',  label: 'Description Generator',   Icon: AlignLeft },
      { href: '/tools/youtube-tag-generator',          label: 'Tag Generator',          Icon: Tags },
      { href: '/tools/youtube-hashtag-generator',      label: 'Hashtag Generator',      Icon: Hash },
      { href: '/tools/youtube-chapter-generator',      label: 'Chapter Generator',      Icon: ListOrdered },
      { href: '/tools/youtube-channel-name-generator', label: 'Channel Name Generator', Icon: Badge },
      { href: '/tools/youtube-video-ideas-generator',  label: 'Video Ideas Generator',  Icon: Lightbulb },
    ],
  },
  {
    label: 'Thumbnails',
    items: [
      { href: '/tools/youtube-thumbnail-tester',     label: 'Thumbnail Tester (A/B)', Icon: Columns2 },
      { href: '/tools/youtube-thumbnail-resizer',    label: 'Thumbnail Resizer',      Icon: Crop },
      { href: '/tools/youtube-thumbnail-downloader', label: 'Thumbnail Downloader',   Icon: Download },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/youtube-stats',                       label: 'Top YouTube Channels',  Icon: Trophy },
      { href: '/tools/youtube-keyword-research',      label: 'Keyword Research',      Icon: ScanSearch },
      { href: '/tools/youtube-channel-stats-checker', label: 'Channel Stats Checker', Icon: BarChart3 },
      { href: '/blog',                                label: 'Blog',                  Icon: BookOpen },
    ],
  },
]

/* Company, a small single-column menu (no eyebrow label). */
const COMPANY_GROUPS = [
  {
    label: '',
    items: [
      { href: '/affiliate', label: 'Affiliates', desc: 'Earn 30% recurring', Icon: Handshake },
      { href: '/contact',   label: 'Contact',    desc: 'Talk to the team',   Icon: Mail },
    ],
  },
]

function MegaMenu({ trigger, groups, columns = 2, viewAllHref, viewAllLabel }) {
  const [open, setOpen] = useState(false)
  const [leftOffset, setLeftOffset] = useState(-14)
  const wrapRef = useRef(null)
  const closeTimer = useRef(null)
  const panelWidth = columns === 4 ? 1000 : columns === 3 ? 860 : 260
  // Open the panel directly under its own trigger. If a wide panel would spill
  // off the right edge, shift it left just enough to stay on screen.
  const position = () => {
    const el = wrapRef.current
    if (!el || typeof window === 'undefined') return
    const triggerLeft = el.getBoundingClientRect().left
    const vw = document.documentElement.clientWidth
    const margin = 16
    const desired = triggerLeft - 14
    const clamped = Math.min(Math.max(margin, desired), vw - panelWidth - margin)
    setLeftOffset(clamped - triggerLeft)
  }
  // Open instantly; close on a short delay so moving from the trigger down into
  // the panel doesn't snap it shut before you can click a tool.
  const show = () => { if (closeTimer.current) clearTimeout(closeTimer.current); position(); setOpen(true) }
  const hide = () => { closeTimer.current = setTimeout(() => setOpen(false), 180) }
  return (
    <div ref={wrapRef} onMouseEnter={show} onMouseLeave={hide} style={{ position: 'relative' }}>
      <a href={groups[0].items[0].href} className="sh-pill-item">
        {trigger}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>
          <path d="M2 3.5l3 3 3-3"/>
        </svg>
      </a>
      {open && (
        <>
          {/* Hover bridge: spans the panel width and overlaps up into the pill
              so there's no dead gap between the trigger and the panel. */}
          <div style={{ position: 'absolute', top: 'calc(100% - 10px)', height: 28, left: leftOffset, width: panelWidth }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 12px)', left: leftOffset, width: panelWidth,
            background: '#ffffff', border: '1px solid rgba(10,10,15,0.08)', borderRadius: 28,
            boxShadow: '0 4px 16px rgba(0,0,0,0.07), 0 24px 64px rgba(0,0,0,0.12)',
            padding: '24px 26px 18px',
            animation: 'shFadeUp 0.16s ease both',
            zIndex: 110,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, columnGap: 14 }}>
              {groups.map((group, gi) => (
                <div key={gi}>
                  {group.label && <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(10,10,15,0.38)', margin: '0 0 8px 10px', whiteSpace: 'nowrap' }}>{group.label}</p>}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {group.items.map((item, i) => (
                      <a key={i} href={item.href}
                        style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 10px', borderRadius: 12, textDecoration: 'none', transition: 'background 0.14s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,48,42,0.05)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: '50%', background: 'rgba(229,48,42,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <item.Icon size={17} strokeWidth={1.9} color="#e5302a" />
                        </span>
                        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0f', letterSpacing: '-0.15px', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{item.label}</span>
                          {item.desc && <span style={{ fontSize: 12, fontWeight: 450, color: 'rgba(10,10,15,0.5)', letterSpacing: '-0.05px', lineHeight: 1.35, marginTop: 1 }}>{item.desc}</span>}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
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
        height: 68px;
        display: flex; align-items: center; justify-content: center; gap: 22px;
        padding: 0 32px;
        background: #ffffff;
        border-bottom: 1px solid rgba(10,10,15,0.08);
        font-family: 'Manrope', 'Inter', system-ui, sans-serif;
      }

      /* Center nav capsule, Windsor-style: the links live inside one
         outlined pill. Border-only on the white bar. */
      .sh-pill {
        position: relative;
        display: flex; align-items: center; gap: 2px;
        padding: 4px 6px;
        border: 1px solid rgba(10,10,15,0.12);
        border-radius: 999px;
        background: transparent;
      }

      /* Natural-width sides so the whole logo + pill + CTA group centers as one
         cluster (balanced left-to-right), instead of pinning just the pill and
         leaving the wider CTA side to lean the header right. Can shrink on
         narrow desktops; on mobile the nav switches to space-between. */
      .sh-side { flex: 0 1 auto; display: flex; align-items: center; gap: 10px; min-width: 0; }
      .sh-pill-item {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 8px 16px;
        border-radius: 999px;
        font-size: 14px; font-weight: 500;
        color: rgba(10,10,15,0.55);
        text-decoration: none; letter-spacing: -0.1px;
        white-space: nowrap; cursor: pointer;
        transition: background 0.15s, color 0.15s;
      }
      .sh-pill-item:hover { background: rgba(10,10,15,0.05); color: #0a0a0f; }
      @media (max-width: 768px)  { .sh-nav { padding: 0 20px; height: 60px; justify-content: space-between; } }

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
      /* Mobile overlay, full-screen dark sheet to match the Landing
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
      /* Centered variant keeps the -50% X shift through the animation so the
         panel stays centered under the pill (a plain translateY keyframe would
         clobber the inline translateX and shove the panel off to the right). */
      @keyframes shFadeUpCenter { from { opacity:0; transform:translate(-50%,8px) } to { opacity:1; transform:translate(-50%,0) } }
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
        {/* Equal-flex sides keep the pill centered on the viewport (so the
            mega-menus open dead-center), with the logo and CTA hugging it. */}
        <div className="sh-side sh-side-start">
          <a href="/" className="sh-brand" aria-label="ytgrowth home">
            <BrandLockup height={30} />
          </a>
        </div>

        {!isMobile && (
          <div className="sh-pill">
            <MegaMenu trigger="Features"  groups={FEATURE_GROUPS}   columns={3} viewAllHref="/#features" viewAllLabel="Explore all features →" />
            <MegaMenu trigger="Resources" groups={RESOURCES_GROUPS} columns={4} viewAllHref="/blog"      viewAllLabel="Read the latest from the blog →" />
            <a href="/#pricing"  className="sh-pill-item">Pricing</a>
            <MegaMenu trigger="Company"   groups={COMPANY_GROUPS}   columns={1} />
          </div>
        )}

        <div className="sh-side sh-side-end">
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
