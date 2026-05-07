import { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import LandingFooter from '../components/LandingFooter'
import { getPostBySlug, getRelatedPosts, formatPostDate } from '../blog/posts.jsx'

/* Single blog post. Same visual DNA as feature pages: white hero,
 * stepped backgrounds, eyebrow pill, DM Sans h1, card-styled CTA.
 *
 * The post body is rendered inside .bp-prose which scopes
 * typography for h2, h3, p, ul, ol, li, blockquote, a, strong, em, img,
 * code, pre. Every element has explicit styling so anything in the
 * post.content() function looks correct without inline styles.
 */

function useBreakpoint() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return { isMobile: w <= 768, isTablet: w <= 1024 }
}

function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill="#ff3b30"/>
      <path d="M23.2 11.6a2.1 2.1 0 0 0-1.48-1.48C20.55 9.8 16 9.8 16 9.8s-4.55 0-5.72.32A2.1 2.1 0 0 0 8.8 11.6 22 22 0 0 0 8.5 16a22 22 0 0 0 .3 4.4 2.1 2.1 0 0 0 1.48 1.48C11.45 22.2 16 22.2 16 22.2s4.55 0 5.72-.32a2.1 2.1 0 0 0 1.48-1.48A22 22 0 0 0 23.5 16a22 22 0 0 0-.3-4.4z" fill="white"/>
      <polygon points="13.5,19 19.5,16 13.5,13" fill="#ff3b30"/>
    </svg>
  )
}

const FEATURE_NAV = [
  { href: '/features/channel-audit',       label: 'Channel Audit',       desc: '10-category AI audit of your channel' },
  { href: '/features/competitor-analysis', label: 'Competitor Analysis', desc: 'Track rivals, find their content gaps' },
  { href: '/features/seo-studio',          label: 'SEO Studio',          desc: 'Score + rewrite titles and descriptions' },
  { href: '/features/thumbnail-iq',        label: 'Thumbnail IQ',        desc: 'Two-layer thumbnail scoring vs your niche' },
  { href: '/features/keyword-research',    label: 'Keyword Research',    desc: 'YouTube-native search volume + difficulty' },
  { href: '/features/outliers',            label: 'Outliers',            desc: 'Find viral videos and breakout channels' },
]

function FeaturesDropdown() {
  const [open, setOpen] = useState(false)
  return (
    <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} style={{ position: 'relative' }}>
      <a href="/#features" className="bp-nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
        Features
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>
          <path d="M2 3.5l3 3 3-3"/>
        </svg>
      </a>
      {open && (
        <>
          <div style={{ position: 'absolute', top: '100%', left: -20, width: 360, height: 12 }} />
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: -20, zIndex: 200, background: '#fff', border: '1px solid var(--ytg-border)', borderRadius: 14, boxShadow: 'var(--ytg-shadow-lg)', padding: 8, minWidth: 340, animation: 'fadeUp 0.16s ease both' }}>
            {FEATURE_NAV.map((item, i) => (
              <a key={i} href={item.href} style={{ display: 'block', padding: '11px 14px', borderRadius: 9, textDecoration: 'none', transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f6f6f9'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.2px', marginBottom: 2 }}>{item.label}</p>
                <p style={{ fontSize: 12.5, color: 'var(--ytg-text-2)', lineHeight: 1.45 }}>{item.desc}</p>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function useStyles() {
  useEffect(() => {
    if (document.getElementById('bp-styles')) return
    const link = document.createElement('link')
    link.id = 'bp-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'bp-styles'
    style.textContent = `
      :root {
        --ytg-bg:           #f4f4f6;
        --ytg-bg-2:         #ecedf1;
        --ytg-bg-3:         #e6e7ec;
        --ytg-text:         #0a0a0f;
        --ytg-text-2:       rgba(10,10,15,0.62);
        --ytg-text-3:       rgba(10,10,15,0.40);
        --ytg-nav:          rgba(244,244,246,0.92);
        --ytg-card:         #ffffff;
        --ytg-border:       rgba(10,10,15,0.09);
        --ytg-accent:       #e5302a;
        --ytg-accent-text:  #c22b25;
        --ytg-accent-light: rgba(229,48,42,0.07);
        --ytg-shadow-sm:    0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
        --ytg-shadow:       0 2px 6px rgba(0,0,0,0.08), 0 10px 32px rgba(0,0,0,0.11);
        --ytg-shadow-lg:    0 4px 16px rgba(0,0,0,0.11), 0 24px 60px rgba(0,0,0,0.14);
        --ytg-shadow-xl:    0 8px 28px rgba(0,0,0,0.13), 0 40px 100px rgba(0,0,0,0.17);
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; scrollbar-width: auto; scrollbar-color: rgba(10,10,15,0.28) transparent; }
      ::-webkit-scrollbar { width: 12px; height: 12px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb {
        background-color: rgba(10,10,15,0.28);
        border-radius: 10px;
        border: 3px solid transparent;
        background-clip: content-box;
      }
      ::-webkit-scrollbar-thumb:hover { background-color: rgba(10,10,15,0.48); background-clip: content-box; }
      @keyframes fadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .bp-btn {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; padding: 15px 30px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.14), 0 4px 20px rgba(229,48,42,0.34);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
        font-family: 'Inter', system-ui, sans-serif;
      }
      .bp-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,0.16), 0 12px 36px rgba(229,48,42,0.42); }
      .bp-btn-lg { font-size: 16px; padding: 17px 38px; }

      .bp-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        background: #fff;
        border: 1px solid rgba(10,10,15,0.09);
        border-radius: 100px;
        padding: 5px 12px 5px 10px;
        margin-bottom: 22px;
        box-shadow: 0 1px 2px rgba(10,10,15,0.04);
      }
      .bp-eyebrow-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--ytg-accent);
        box-shadow: 0 0 0 3px rgba(229,48,42,0.12);
      }
      .bp-eyebrow-text {
        font-size: 11px; font-weight: 700; color: var(--ytg-text-2);
        text-transform: uppercase; letter-spacing: 0.09em;
      }

      /* Category pill — used at the top of single posts. Distinct from
         the generic eyebrow: solid red, more presence, links to /blog. */
      .bp-category {
        display: inline-block;
        padding: 8px 18px;
        background: var(--ytg-accent);
        color: #fff;
        font-size: 11.5px;
        font-weight: 800;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        border-radius: 100px;
        text-decoration: none;
        margin-bottom: 28px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.10), 0 4px 16px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .bp-category:hover {
        filter: brightness(1.07);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.12), 0 8px 24px rgba(229,48,42,0.40);
      }

      .bp-h1 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -2px; line-height: 1.05; text-wrap: balance; }
      .bp-h2 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -1.4px; line-height: 1.08; text-wrap: balance; }

      .bp-nav-link { font-size: 14px; color: var(--ytg-text-3); font-weight: 500; text-decoration: none; transition: color 0.15s; letter-spacing: -0.1px; }
      .bp-nav-link:hover { color: var(--ytg-text-2); }

      /* Byline — clean two-line stacked treatment. Big author name on
         top in DM Sans, smaller meta line below in muted gray. No labels,
         no dividers, no avatar — just the credit, the way Stripe or
         Linear do it. */
      .bp-byline {
        text-align: center;
        position: relative;
      }
      .bp-byline-rule {
        width: 32px;
        height: 2px;
        background: var(--ytg-accent);
        border-radius: 2px;
        margin: 0 auto 18px;
      }
      .bp-byline-author {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 17px;
        font-weight: 700;
        color: var(--ytg-text);
        letter-spacing: -0.3px;
        margin: 0;
        line-height: 1.3;
      }
      .bp-byline-meta {
        font-size: 13.5px;
        color: var(--ytg-text-3);
        margin: 6px 0 0;
        letter-spacing: -0.05px;
        line-height: 1.4;
      }

      /* HERO IMAGE — 16:9 (matches YouTube thumbnail ratio).
         Recommended source size: 1600x900 (or 1200x675 lighter). */
      .bp-hero-image {
        max-width: 1080px;
        width: 100%;
        margin: 40px auto 0;
        aspect-ratio: 16/9;
        background: linear-gradient(135deg, var(--ytg-bg-2), var(--ytg-bg-3));
        border-radius: 24px;
        overflow: hidden;
        box-shadow: var(--ytg-shadow-lg);
        position: relative;
      }
      .bp-hero-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .bp-hero-image-fallback {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        font-family: 'DM Sans', sans-serif;
        font-weight: 800; font-size: 96px; letter-spacing: -3px;
        color: rgba(10,10,15,0.16);
      }

      /* PROSE — typography for the post body */
      .bp-prose {
        max-width: 820px;
        margin: 0 auto;
        font-size: 16px;
        line-height: 1.72;
        color: var(--ytg-text);
        font-family: 'Inter', system-ui, sans-serif;
      }
      /* Generous paragraph rhythm. Roughly one full line of empty
         space between blocks so the body reads, not feels packed. */
      .bp-prose > * + * { margin-top: 1.65em; }
      .bp-prose > p + p { margin-top: 1.75em; }
      .bp-prose p { margin: 0; }
      .bp-prose strong { font-weight: 700; color: var(--ytg-text); }
      .bp-prose em { font-style: italic; }

      .bp-prose h2 {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 24px; font-weight: 800; letter-spacing: -0.5px;
        line-height: 1.22;
        color: var(--ytg-text);
        margin-top: 2em !important;
        margin-bottom: 0.6em !important;
      }
      .bp-prose h2 + p { margin-top: 0.5em !important; }

      .bp-prose h3 {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 18px; font-weight: 700; letter-spacing: -0.2px;
        line-height: 1.32;
        color: var(--ytg-text);
        margin-top: 1.7em !important;
        margin-bottom: 0.5em !important;
      }
      .bp-prose h3 + p { margin-top: 0.5em !important; }

      .bp-prose a {
        color: var(--ytg-accent);
        text-decoration: none;
        font-weight: 600;
        background-image: linear-gradient(transparent calc(100% - 1px), rgba(229,48,42,0.4) 1px);
        background-size: 100% 100%;
        background-repeat: no-repeat;
        transition: background-size 0.18s, color 0.18s;
      }
      .bp-prose a:hover {
        color: var(--ytg-accent-text);
        background-image: linear-gradient(transparent calc(100% - 1px), var(--ytg-accent) 1px);
      }

      /* UNORDERED list — clear red dot markers, not the default invisible glyph */
      .bp-prose ul {
        padding-left: 1.5em;
        list-style: none;
      }
      .bp-prose ul > li {
        position: relative;
        padding-left: 0.5em;
        margin: 0.7em 0;
        line-height: 1.7;
      }
      .bp-prose ul > li::before {
        content: '';
        position: absolute;
        left: -0.85em;
        top: 0.6em;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--ytg-text);
      }

      /* ORDERED list — red bold numerals */
      .bp-prose ol {
        padding-left: 1.6em;
        list-style: none;
        counter-reset: bp-list-counter;
      }
      .bp-prose ol > li {
        position: relative;
        padding-left: 0.4em;
        margin: 0.7em 0;
        line-height: 1.7;
        counter-increment: bp-list-counter;
      }
      .bp-prose ol > li::before {
        content: counter(bp-list-counter) '.';
        position: absolute;
        left: -1.5em;
        top: 0;
        color: var(--ytg-text);
        font-weight: 700;
        font-size: 0.95em;
      }

      /* Callout — clean red left line, no background, label in red. Reads
         as a quiet pull-quote, not a card. The bold prefix (Pro Tip:,
         The Formula:, Warning:) inherits the accent so it scans first. */
      .bp-prose blockquote {
        margin: 1.8em 0;
        padding: 2px 0 2px 22px;
        background: transparent;
        border: 0;
        border-left: 3px solid var(--ytg-accent);
        border-radius: 0;
        font-size: 16px;
        font-style: normal;
        color: var(--ytg-text);
        font-weight: 400;
        line-height: 1.7;
      }
      .bp-prose blockquote p { margin: 0; }
      .bp-prose blockquote strong {
        color: var(--ytg-accent);
        font-weight: 700;
      }

      /* Inline CTA button — solid red pill that authors can drop into
         the post body to drive to signup or any internal route. */
      .bp-prose .bp-cta-inline {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--ytg-accent) !important;
        color: #fff !important;
        padding: 10px 22px;
        font-size: 14px;
        font-weight: 700;
        border-radius: 100px;
        text-decoration: none !important;
        background-image: none !important;
        letter-spacing: -0.1px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.10), 0 4px 16px rgba(229,48,42,0.30);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .bp-prose .bp-cta-inline:hover {
        filter: brightness(1.07);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.12), 0 8px 24px rgba(229,48,42,0.40);
        color: #fff !important;
      }

      /* CTA card — bigger row-style promo block. Title + sub-line on the
         left, red pill button on the right. Drops into a post anywhere
         to upsell a feature or push signups. */
      .bp-prose .bp-cta-card-link {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        margin: 2.5em 0;
        padding: 26px 30px;
        background: var(--ytg-card) !important;
        border: 1px solid var(--ytg-border);
        border-radius: 16px;
        box-shadow: var(--ytg-shadow-sm);
        text-decoration: none !important;
        background-image: none !important;
        color: var(--ytg-text) !important;
        position: relative;
        overflow: hidden;
        transition: box-shadow 0.22s, transform 0.22s, border-color 0.22s;
      }
      .bp-prose .bp-cta-card-link:hover {
        box-shadow: var(--ytg-shadow-lg);
        transform: translateY(-2px);
        border-color: rgba(229,48,42,0.18);
        color: var(--ytg-text) !important;
      }
      .bp-prose .bp-cta-card-link::before {
        content: '';
        position: absolute;
        top: -50px; right: -50px;
        width: 220px; height: 140px;
        background: radial-gradient(ellipse, rgba(229,48,42,0.10) 0%, transparent 70%);
        pointer-events: none;
      }
      .bp-cta-card-text { display: block; flex: 1; min-width: 0; position: relative; z-index: 1; }
      .bp-cta-card-title {
        display: block;
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 17px;
        font-weight: 800;
        letter-spacing: -0.3px;
        color: var(--ytg-text);
        margin: 0 0 6px 0 !important;
        line-height: 1.3;
      }
      .bp-cta-card-sub {
        display: block;
        font-size: 14px;
        color: var(--ytg-text-2);
        margin: 0 !important;
        line-height: 1.55;
      }
      .bp-cta-card-pill {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--ytg-accent);
        color: #fff;
        padding: 11px 22px;
        font-size: 14px;
        font-weight: 700;
        border-radius: 100px;
        white-space: nowrap;
        box-shadow: 0 1px 2px rgba(0,0,0,0.10), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s;
        position: relative; z-index: 1;
      }
      .bp-prose .bp-cta-card-link:hover .bp-cta-card-pill {
        filter: brightness(1.07);
        transform: translateY(-1px);
      }
      @media (max-width: 720px) {
        .bp-prose .bp-cta-card-link {
          flex-direction: column;
          align-items: flex-start;
          padding: 22px 24px;
          gap: 18px;
        }
      }

      .bp-prose img {
        width: 100%;
        height: auto;
        border-radius: 16px;
        margin: 2.4em 0;
        box-shadow: var(--ytg-shadow-sm);
      }

      .bp-prose code {
        background: var(--ytg-bg-2);
        padding: 2px 7px;
        border-radius: 6px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.88em;
        color: var(--ytg-accent-text);
        font-weight: 500;
      }
      .bp-prose pre {
        background: #0d0d12;
        color: rgba(255,255,255,0.92);
        padding: 22px 24px;
        border-radius: 14px;
        overflow-x: auto;
        margin: 2.4em 0;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 14px;
        line-height: 1.65;
      }
      .bp-prose pre code {
        background: transparent;
        color: inherit;
        padding: 0;
        font-size: inherit;
      }

      .bp-prose hr {
        border: 0;
        border-top: 1px solid var(--ytg-border);
        margin: 2.8em 0;
      }

      .bp-prose table {
        width: 100%;
        border-collapse: collapse;
        margin: 2em 0;
        font-size: 15px;
        border: 1px solid var(--ytg-border);
        border-radius: 14px;
        overflow: hidden;
        background: var(--ytg-card);
        box-shadow: var(--ytg-shadow-sm);
      }
      .bp-prose thead {
        background: var(--ytg-bg-2);
      }
      .bp-prose th {
        padding: 14px 18px;
        font-weight: 700;
        text-align: left;
        font-size: 11.5px;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        color: var(--ytg-text-2);
        font-family: 'Inter', system-ui, sans-serif;
      }
      .bp-prose td {
        padding: 16px 18px;
        border-top: 1px solid var(--ytg-border);
        vertical-align: top;
        line-height: 1.6;
      }

      /* RELATED POSTS */
      .bp-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }

      .bp-related-card {
        display: flex; flex-direction: column;
        background: var(--ytg-card);
        border-radius: 16px;
        border: 1px solid var(--ytg-border);
        box-shadow: var(--ytg-shadow-sm);
        overflow: hidden;
        text-decoration: none;
        color: inherit;
        transition: box-shadow 0.22s, transform 0.22s;
      }
      .bp-related-card:hover { box-shadow: var(--ytg-shadow-lg); transform: translateY(-3px); }
      .bp-related-card-cover {
        width: 100%; aspect-ratio: 16/10;
        background: linear-gradient(135deg, var(--ytg-bg-2), var(--ytg-bg-3));
        position: relative; overflow: hidden;
      }
      .bp-related-card-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .bp-related-card-cover-fallback {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        font-family: 'DM Sans', sans-serif;
        font-weight: 800; font-size: 56px; letter-spacing: -2px;
        color: rgba(10,10,15,0.16);
      }
      .bp-related-card-body { padding: 22px 22px 24px; display: flex; flex-direction: column; flex: 1; gap: 8px; }
      .bp-related-card-cat {
        font-size: 11px; font-weight: 800;
        color: var(--ytg-accent-text);
        letter-spacing: 0.1em; text-transform: uppercase;
      }
      .bp-related-card-title {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 17px; font-weight: 800;
        letter-spacing: -0.4px; line-height: 1.28;
        color: var(--ytg-text);
        text-wrap: balance;
        transition: color 0.18s;
      }
      .bp-related-card:hover .bp-related-card-title { color: var(--ytg-accent); }
      .bp-related-card-meta {
        margin-top: auto; padding-top: 12px;
        font-size: 12.5px; color: var(--ytg-text-3);
        display: flex; align-items: center; gap: 8px;
        border-top: 1px solid var(--ytg-border);
      }
      .bp-related-card-meta-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--ytg-text-3); }

      @media (max-width: 1024px) {
        .bp-grid-3 { grid-template-columns: repeat(2,1fr); }
      }
      @media (max-width: 768px) {
        .bp-prose { font-size: 15.5px; line-height: 1.7; }
        .bp-prose h2 { font-size: 22px; letter-spacing: -0.5px; }
        .bp-prose h3 { font-size: 18px; }
        .bp-prose blockquote { padding: 18px 20px; font-size: 15px; margin: 1.6em 0; }
        .bp-grid-3 { grid-template-columns: 1fr; }
        .bp-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .bp-hero-image { border-radius: 16px; margin-top: 24px; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 999 }}>
      <div style={{ height: '100%', width: `${progress}%`, background: 'var(--ytg-accent)', transition: 'width 0.08s linear', borderRadius: '0 2px 2px 0' }} />
    </div>
  )
}

function HeroImageFallback({ title }) {
  const letter = (title || 'Y').trim()[0].toUpperCase()
  return <div className="bp-hero-image-fallback">{letter}</div>
}

function RelatedCardFallback({ title }) {
  const letter = (title || 'Y').trim()[0].toUpperCase()
  return <div className="bp-related-card-cover-fallback">{letter}</div>
}

function RelatedCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} className="bp-related-card">
      <div className="bp-related-card-cover">
        {post.cover
          ? <img src={post.cover} alt={post.title} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          : <RelatedCardFallback title={post.title} />}
      </div>
      <div className="bp-related-card-body">
        <span className="bp-related-card-cat">{post.category.label}</span>
        <h3 className="bp-related-card-title">{post.title}</h3>
        <div className="bp-related-card-meta">
          <span>{formatPostDate(post.date)}</span>
          <span className="bp-related-card-meta-dot" />
          <span>{post.readTime}</span>
        </div>
      </div>
    </Link>
  )
}

export default function BlogPost() {
  useStyles()
  const { slug } = useParams()
  const post = getPostBySlug(slug)
  const { isMobile } = useBreakpoint()

  useEffect(() => {
    if (!post) return
    document.title = `${post.title} — YTGrowth Blog`
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = post.excerpt
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [post])

  if (!post) return <Navigate to="/blog" replace />

  const Body = post.content
  const related = getRelatedPosts(post.slug, 3)

  return (
    <div style={{ background: 'var(--ytg-bg)', minHeight: '100vh' }}>

      <ScrollProgress />

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--ytg-border)', padding: isMobile ? '0 20px' : '0 40px 0 64px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ytg-nav)', backdropFilter: 'blur(16px)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <Logo size={28} />
          <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--ytg-text)', letterSpacing: '-0.4px' }}>YTGrowth</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          {!isMobile && <FeaturesDropdown />}
          {!isMobile && <a href="/#pricing" className="bp-nav-link">Pricing</a>}
          {!isMobile && <Link to="/blog" className="bp-nav-link">Blog</Link>}
          <Link to="/dashboard" className="bp-btn" style={{ padding: isMobile ? '8px 18px' : '9px 22px', fontSize: 13, borderRadius: 100, whiteSpace: 'nowrap', boxShadow: 'none' }}>
            {isMobile ? 'Try free' : 'Try YTGrowth'}
          </Link>
        </div>
      </nav>

      {/* 1 — HEADER. White */}
      <section style={{ padding: isMobile ? '36px 20px 0' : '56px 40px 0', textAlign: 'center', background: '#ffffff' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', animation: 'fadeUp 0.5s ease both' }}>
          <Link to="/blog" className="bp-category">{post.category.label}</Link>
          <h1 className="bp-h1" style={{ fontSize: isMobile ? 30 : 46, color: 'var(--ytg-text)', marginBottom: 22 }}>
            {post.title}
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18.5, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 32px' }}>
            {post.excerpt}
          </p>
          <div className="bp-byline">
            <div className="bp-byline-rule" />
            <p className="bp-byline-author">Written by {post.author}</p>
            <p className="bp-byline-meta">{formatPostDate(post.date)} · {post.readTime}</p>
          </div>
        </div>

        {/* Hero image — flush against the top of the next section */}
        <div className="bp-section-pad" style={{ maxWidth: 1180, margin: '0 auto', position: 'relative' }}>
          <div className="bp-hero-image">
            {post.cover
              ? <img src={post.cover} alt={post.title} onError={(e) => { e.currentTarget.style.display = 'none' }} />
              : <HeroImageFallback title={post.title} />}
          </div>
        </div>
      </section>

      {/* 2 — POST BODY. Light bg, prose typography */}
      <section className="bp-section-pad" style={{ padding: isMobile ? '48px 20px 72px' : '72px 40px 96px', background: '#ffffff' }}>
        <article className="bp-prose">
          <Body />
        </article>
      </section>

      {/* 3 — BOTTOM CTA. Centered card, matches the rhythm of the
          feature/contact page bottom CTAs. */}
      <section style={{ padding: isMobile ? '0 16px 0' : '0 40px 0', background: 'var(--ytg-bg)', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', paddingTop: isMobile ? 56 : 80, paddingBottom: isMobile ? 56 : 80 }}>
          <div style={{
            borderRadius: isMobile ? 18 : 22,
            border: '1px solid var(--ytg-border)',
            boxShadow: 'var(--ytg-shadow-xl)',
            padding: isMobile ? '40px 24px 36px' : '56px 48px 52px',
            textAlign: 'center',
            background: 'var(--ytg-card)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 460, height: 220, background: 'radial-gradient(ellipse, rgba(229,48,42,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <span className="bp-eyebrow" style={{ marginBottom: 18, position: 'relative' }}>
              <span className="bp-eyebrow-dot" />
              <span className="bp-eyebrow-text">Try YTGrowth</span>
            </span>
            <h2 className="bp-h2" style={{ fontSize: isMobile ? 26 : 32, marginBottom: 12, position: 'relative' }}>
              Don't just read the playbook.<br />
              <span style={{ color: 'var(--ytg-accent)' }}>Run it on your channel.</span>
            </h2>
            <p style={{ fontSize: isMobile ? 14 : 15.5, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 26px', position: 'relative' }}>
              YTGrowth scores your titles, audits your channel against the live niche, and surfaces the gaps your competitors are missing. In 30 seconds.
            </p>
            <Link to="/dashboard" className={`bp-btn${isMobile ? '' : ' bp-btn-lg'}`} style={{ position: 'relative' }}>
              Try YTGrowth free →
            </Link>
            <p style={{ fontSize: 12.5, color: 'var(--ytg-text-3)', marginTop: 14, position: 'relative' }}>
              3 free analyses · No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* 4 — RELATED POSTS */}
      {related.length > 0 && (
        <section className="bp-section-pad" style={{ padding: isMobile ? '0 20px 88px' : '0 40px 120px', background: 'var(--ytg-bg)' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ marginBottom: 28 }}>
              <span className="bp-eyebrow">
                <span className="bp-eyebrow-dot" />
                <span className="bp-eyebrow-text">Keep reading</span>
              </span>
              <h2 className="bp-h2" style={{ fontSize: isMobile ? 26 : 32 }}>
                More from the blog
              </h2>
            </div>
            <div className="bp-grid-3">
              {related.map(p => <RelatedCard key={p.slug} post={p} />)}
            </div>
          </div>
        </section>
      )}

      <LandingFooter />

    </div>
  )
}
