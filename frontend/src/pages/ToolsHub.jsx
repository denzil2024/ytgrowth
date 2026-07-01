import { useEffect, useState } from 'react'
import LandingFooter from '../components/LandingFooter'
import SiteHeader from '../components/SiteHeader'
import { NICHES, fmtMoney } from '../data/youtubeEarnings'

/* ─── /tools hub ────────────────────────────────────────────────────────────
   The "view all" hub (Windsor-style) that lists every free tool, the per-niche
   earnings pages, and the product features. Header + footer link here with a
   single "Free tools" entry, and this hub passes internal links down to all of
   them (de-orphans the earnings pages). Editorial design language (Fraunces +
   Barlow, sharp flat cards, warm paper). See project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

/* Free tools grouped into labeled clusters so 15 tools read as an organized
   gallery, not one flat wall. */
const TOOL_GROUPS = [
  { label: 'Calculators', items: [
    { href: '/tools/youtube-money-calculator',            name: 'Money Calculator',           blurb: 'Estimate channel earnings by niche and audience country.' },
    { href: '/tools/youtube-subscriber-money-calculator', name: 'Subscriber Money Calculator', blurb: 'See what a subscriber count is worth.' },
    { href: '/tools/youtube-shorts-money-calculator',     name: 'Shorts Money Calculator',     blurb: 'Estimate Shorts earnings from the shared-pool RPM.' },
  ]},
  { label: 'Research & analysis', items: [
    { href: '/tools/youtube-keyword-research',      name: 'Keyword Research',      blurb: 'Find what your audience is searching for.' },
    { href: '/tools/youtube-channel-stats-checker', name: 'Channel Stats Checker', blurb: 'Live subscribers, views, and earnings for any channel.' },
  ]},
  { label: 'Generators', items: [
    { href: '/tools/youtube-title-generator',        name: 'Title Generator',        blurb: 'Headline ideas that earn the click.' },
    { href: '/tools/youtube-description-generator',  name: 'Description Generator',  blurb: 'Write descriptions that rank and convert.' },
    { href: '/tools/youtube-tag-generator',          name: 'Tag Generator',          blurb: 'Generate ranked tags for any video topic.' },
    { href: '/tools/youtube-hashtag-generator',      name: 'Hashtag Generator',      blurb: 'Pull the right hashtags for reach and search.' },
    { href: '/tools/youtube-chapter-generator',      name: 'Chapter Generator',      blurb: 'Auto-build timestamps and chapters.' },
    { href: '/tools/youtube-video-ideas-generator',  name: 'Video Ideas Generator',  blurb: '90+ proven content idea formats.' },
    { href: '/tools/youtube-channel-name-generator', name: 'Channel Name Generator', blurb: 'Name ideas for a brand-new channel.' },
  ]},
  { label: 'Thumbnails', items: [
    { href: '/tools/youtube-thumbnail-tester',     name: 'Thumbnail Tester',     blurb: 'A/B compare thumbnails before you upload.' },
    { href: '/tools/youtube-thumbnail-downloader', name: 'Thumbnail Downloader', blurb: 'Grab any video thumbnail in full resolution.' },
    { href: '/tools/youtube-thumbnail-resizer',    name: 'Thumbnail Resizer',    blurb: 'Resize to the exact YouTube spec and safe zones.' },
  ]},
]

const FEATURES = [
  { href: '/features/channel-audit',       name: 'Channel Audit',       blurb: 'A 10-dimension AI audit of your whole channel.' },
  { href: '/features/competitor-analysis', name: 'Competitor Analysis', blurb: 'See what is working for the channels you compete with.' },
  { href: '/features/outliers',            name: 'Outliers',            blurb: 'Find the videos overperforming in your niche.' },
  { href: '/features/seo-studio',          name: 'SEO Studio',          blurb: 'Score titles and descriptions against top rankers.' },
  { href: '/features/thumbnail-iq',        name: 'Thumbnail IQ',        blurb: 'Score thumbnails on the things that drive clicks.' },
  { href: '/features/keyword-research',    name: 'Keyword Research',    blurb: 'Keyword demand and competition for your niche.' },
]

const TOOL_COUNT = TOOL_GROUPS.reduce((n, g) => n + g.items.length, 0)

function useBreakpoint() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return { isMobile: w <= 768 }
}

function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('tlh-styles')) return
    const style = document.createElement('style')
    style.id = 'tlh-styles'
    style.textContent = `
      :root {
        --yte-bg: #f6f4ef; --yte-bg-2: #efece4; --yte-surface: #ffffff;
        --yte-ink: #14130f; --yte-soft: #5c574e; --yte-muted: #8a8378;
        --yte-line: rgba(20,19,15,0.12); --yte-line-2: rgba(20,19,15,0.22);
        --yte-accent: #e5302a; --yte-accent-soft: rgba(229,48,42,0.07); --yte-dark: #0d0d12;
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; scroll-padding-top: 84px; }
      body { background: var(--yte-bg); color: var(--yte-ink); font-family: ${SANS}; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
      @keyframes tlhFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .tlh-wrap { max-width: 1080px; margin: 0 auto; }
      .tlh-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .tlh-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .tlh-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .tlh-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.04; }
      .tlh-h1 em { font-style: italic; color: var(--yte-accent); }
      .tlh-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.1; }
      .tlh-h2 em { font-style: italic; color: var(--yte-accent); }
      .tlh-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      /* Hero stat strip (connected hairline, controlled count = 3) */
      .tlh-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); max-width: 560px; }
      .tlh-stat { background: var(--yte-surface); padding: 20px 22px; }
      .tlh-stat-n { font-family: ${SERIF}; font-size: 34px; font-weight: 400; color: var(--yte-ink); letter-spacing: -0.5px; line-height: 1; }
      .tlh-stat-l { font-family: ${SANS}; font-size: 12px; font-weight: 600; color: var(--yte-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px; }

      /* Jump index */
      .tlh-index { display: flex; flex-wrap: wrap; gap: 26px; margin-top: 34px; padding-top: 22px; border-top: 1px solid var(--yte-line); }
      .tlh-index a { font-family: ${SANS}; font-size: 12px; font-weight: 600; color: var(--yte-soft); text-transform: uppercase; letter-spacing: 0.12em; text-decoration: none; transition: color 0.15s; }
      .tlh-index a:hover { color: var(--yte-accent); }
      .tlh-index a span { color: var(--yte-muted); }

      /* Cluster label */
      .tlh-cluster-label { font-family: ${SANS}; font-size: 12px; font-weight: 700; color: var(--yte-ink); text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 14px; display: flex; align-items: center; gap: 10px; }
      .tlh-cluster-label::after { content: ''; flex: 1; height: 1px; background: var(--yte-line); }

      /* Gapped individual cards (no trailing empty-cell gap) */
      .tlh-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
      @media (max-width: 900px) { .tlh-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 600px) { .tlh-grid { grid-template-columns: 1fr; } }
      .tlh-card { display: flex; flex-direction: column; gap: 7px; background: var(--yte-surface); border: 1px solid var(--yte-line); padding: 20px 22px 22px; text-decoration: none; transition: border-color 0.15s, transform 0.15s; }
      .tlh-card:hover { border-color: var(--yte-line-2); transform: translateY(-2px); }
      .tlh-card-row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
      .tlh-card-name { font-family: ${SERIF}; font-size: 19px; font-weight: 400; color: var(--yte-ink); letter-spacing: -0.2px; line-height: 1.15; }
      .tlh-card-arrow { font-family: ${SANS}; font-size: 15px; color: var(--yte-accent); flex-shrink: 0; }
      .tlh-card-blurb { font-family: ${SANS}; font-size: 13.5px; color: var(--yte-soft); line-height: 1.55; }

      /* Earnings: data-forward card, RPM as the visual */
      .tlh-earn { display: flex; flex-direction: column; background: var(--yte-surface); border: 1px solid var(--yte-line); padding: 20px 22px; text-decoration: none; transition: border-color 0.15s, transform 0.15s; }
      .tlh-earn:hover { border-color: var(--yte-line-2); transform: translateY(-2px); }
      .tlh-earn-name { font-family: ${SANS}; font-size: 12px; font-weight: 600; color: var(--yte-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
      .tlh-earn-rpm { font-family: ${SERIF}; font-size: 28px; font-weight: 400; color: var(--yte-ink); letter-spacing: -0.5px; line-height: 1; }
      .tlh-earn-rpm .em { color: var(--yte-accent); }
      .tlh-earn-sub { font-family: ${SANS}; font-size: 12px; color: var(--yte-muted); margin-top: 8px; }

      @media (max-width: 768px) { .tlh-section-pad { padding-left: 22px !important; padding-right: 22px !important; } }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children }) {
  return (
    <div className="tlh-eyebrow">
      <span aria-hidden="true" className="tlh-eyebrow-rule" />
      <span className="tlh-eyebrow-text">{children}</span>
    </div>
  )
}

export default function ToolsHub() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()

  useEffect(() => {
    document.title = 'Free YouTube Tools: Calculators, Generators & Audits'
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = 'Every free YouTube tool in one place: money and earnings calculators, keyword research, tag, title, description, and thumbnail tools, plus AI channel audits.'
  }, [])

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', overflowX: 'clip' }}>
      <SiteHeader />

      {/* ══ HERO ══ */}
      <section className="tlh-section-pad" style={{ padding: isMobile ? '60px 22px 40px' : '104px 48px 56px', background: 'var(--yte-bg)' }}>
        <div className="tlh-wrap" style={{ animation: 'tlhFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tools</Eyebrow>
          <h1 className="tlh-h1" style={{ fontSize: isMobile ? 36 : 56, marginBottom: 22, maxWidth: 820, textWrap: 'balance' }}>
            Every YouTube tool we build, <em>in one place.</em>
          </h1>
          <p className="tlh-lead" style={{ fontSize: isMobile ? 16 : 17.5, maxWidth: 600, marginBottom: 34 }}>
            Free calculators, generators, and research tools, plus the AI features inside YTGrowth. No signup needed for the free tools.
          </p>

          <div className="tlh-stats">
            <div className="tlh-stat"><div className="tlh-stat-n">{TOOL_COUNT}</div><div className="tlh-stat-l">Free tools</div></div>
            <div className="tlh-stat"><div className="tlh-stat-n">{NICHES.length}</div><div className="tlh-stat-l">Earnings niches</div></div>
            <div className="tlh-stat"><div className="tlh-stat-n">0</div><div className="tlh-stat-l">Signups</div></div>
          </div>

          <nav className="tlh-index" aria-label="Sections">
            <a href="#tools">Free tools <span>{TOOL_COUNT}</span></a>
            <a href="#earnings">Earnings <span>{NICHES.length}</span></a>
            <a href="#features">AI features <span>{FEATURES.length}</span></a>
            <a href="/youtube-stats">Live stats <span>→</span></a>
          </nav>
        </div>
      </section>

      {/* ══ FREE TOOLS (clustered) ══ */}
      <section id="tools" className="tlh-section-pad" style={{ padding: isMobile ? '40px 22px' : '40px 48px 64px', background: 'var(--yte-bg)' }}>
        <div className="tlh-wrap">
          <div style={{ marginBottom: 32 }}>
            <Eyebrow>No signup</Eyebrow>
            <h2 className="tlh-h2" style={{ fontSize: isMobile ? 26 : 34 }}>Free tools</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            {TOOL_GROUPS.map(group => (
              <div key={group.label}>
                <p className="tlh-cluster-label">{group.label}</p>
                <div className="tlh-grid">
                  {group.items.map(t => (
                    <a key={t.href} href={t.href} className="tlh-card">
                      <div className="tlh-card-row">
                        <span className="tlh-card-name">{t.name}</span>
                        <span className="tlh-card-arrow" aria-hidden="true">→</span>
                      </div>
                      <span className="tlh-card-blurb">{t.blurb}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ EARNINGS BY NICHE ══ */}
      <section id="earnings" className="tlh-section-pad" style={{ padding: isMobile ? '48px 22px' : '64px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="tlh-wrap">
          <div style={{ marginBottom: 28, maxWidth: 640 }}>
            <Eyebrow>By niche</Eyebrow>
            <h2 className="tlh-h2" style={{ fontSize: isMobile ? 26 : 34 }}>What YouTubers <em>earn.</em></h2>
            <p className="tlh-lead" style={{ fontSize: 15, marginTop: 12 }}>Real RPM ranges and per-million earnings for 14 niches, with a calculator on every page.</p>
          </div>
          <div className="tlh-grid">
            {NICHES.map(n => (
              <a key={n.key} href={`/youtube-earnings/${n.key}`} className="tlh-earn">
                <div className="tlh-earn-name">{n.label}</div>
                <div className="tlh-earn-rpm"><span className="em">${n.low}</span> – ${n.high}</div>
                <div className="tlh-earn-sub">RPM · up to {fmtMoney(n.high * 1000)} per 1M views</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" className="tlh-section-pad" style={{ padding: isMobile ? '48px 22px' : '64px 48px', background: 'var(--yte-bg)' }}>
        <div className="tlh-wrap">
          <div style={{ marginBottom: 28 }}>
            <Eyebrow>Inside YTGrowth</Eyebrow>
            <h2 className="tlh-h2" style={{ fontSize: isMobile ? 26 : 34 }}>AI features</h2>
          </div>
          <div className="tlh-grid">
            {FEATURES.map(f => (
              <a key={f.href} href={f.href} className="tlh-card">
                <div className="tlh-card-row">
                  <span className="tlh-card-name">{f.name}</span>
                  <span className="tlh-card-arrow" aria-hidden="true">→</span>
                </div>
                <span className="tlh-card-blurb">{f.blurb}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
