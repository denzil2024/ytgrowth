import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import LandingFooter from '../components/LandingFooter'
import SiteHeader from '../components/SiteHeader'
import { posts, formatPostDate } from '../blog/posts.jsx'

/* Pagination tunables. POSTS_PER_PAGE = grid cards per page. The
   featured post is shown on page 1 in addition to the cards (so page 1
   has 1 + POSTS_PER_PAGE visible) and is excluded from the pagination
   math entirely — it doesn't eat into the page budget. */
const POSTS_PER_PAGE = 12

/* Blog index. Visual DNA matches the feature/tool pages exactly:
 * --ytg-accent #e5302a, DM Sans + Inter, eyebrow pill with red dot,
 * stepped backgrounds (white → bg → bg-2), shadow card pattern, sst-style
 * button. Same nav (FeaturesDropdown, Pricing link, primary CTA).
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

/* ─── Mega-menu data — matches the Landing page nav exactly so the
     header reads as one continuous brand surface across the site. */
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

const RESOURCES_GROUPS = [
  {
    label: 'Blog',
    items: [
      { href: '/blog',                          label: 'All articles' },
      { href: '/blog/youtube-shorts-algorithm', label: 'YouTube Shorts algorithm' },
      { href: '/blog/grow-youtube-channel',     label: 'Grow your channel' },
      { href: '/blog/youtube-algorithm',        label: 'YouTube algorithm explained' },
      { href: '/blog/seo-tools-for-youtube',    label: 'SEO tools comparison' },
    ],
  },
  {
    label: 'Free tools',
    items: [
      { href: '/tools/youtube-money-calculator',            label: 'YouTube Money Calculator' },
      { href: '/tools/youtube-subscriber-money-calculator', label: 'Subscriber Money Calculator' },
      { href: '/tools/youtube-channel-stats-checker',       label: 'Channel Stats Checker' },
      { href: '/tools/youtube-thumbnail-downloader',        label: 'Thumbnail Downloader' },
    ],
  },
]

/* MegaMenu — same VidIQ-pattern panel the Landing page uses */
function MegaMenu({ trigger, groups, columns = 2, viewAllHref, viewAllLabel, panelLeft = -24 }) {
  const [open, setOpen] = useState(false)
  const panelWidth = columns === 3 ? 780 : 540
  return (
    <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} style={{ position: 'relative' }}>
      <a href={groups[0].items[0].href} className="bl-nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
        {trigger}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>
          <path d="M2 3.5l3 3 3-3"/>
        </svg>
      </a>
      {open && (
        <>
          <div style={{ position: 'absolute', top: '100%', left: panelLeft, width: panelWidth + 48, height: 14 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 10px)', left: panelLeft,
            background: '#ffffff', border: '1px solid rgba(10,10,15,0.08)', borderRadius: 18,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.13)',
            padding: '32px 32px 22px',
            width: panelWidth,
            animation: 'fadeUp 0.16s ease both',
            zIndex: 110,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 36 }}>
              {groups.map((group, gi) => (
                <div key={gi}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(10,10,15,0.38)', marginBottom: 14, whiteSpace: 'nowrap' }}>{group.label}</p>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {group.items.map((item, i) => (
                      <a key={i} href={item.href}
                        style={{ display: 'block', padding: '8px 0', fontSize: 14.5, fontWeight: 500, color: '#0a0a0f', letterSpacing: '-0.15px', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'color 0.13s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--ytg-accent)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#0a0a0f' }}
                      >{item.label}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {viewAllHref && (
              <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid rgba(10,10,15,0.07)' }}>
                <a href={viewAllHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13.5, fontWeight: 600, color: 'var(--ytg-accent)', textDecoration: 'none', letterSpacing: '-0.1px' }}>
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
    if (document.getElementById('bl-styles')) return
    const link = document.createElement('link')
    link.id = 'bl-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'bl-styles'
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

      .bl-btn {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; padding: 15px 30px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.14), 0 4px 20px rgba(229,48,42,0.34);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
        font-family: 'Inter', system-ui, sans-serif;
      }
      .bl-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,0.16), 0 12px 36px rgba(229,48,42,0.42); }
      .bl-btn-lg { font-size: 16px; padding: 17px 38px; }

      .bl-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        background: #fff;
        border: 1px solid rgba(10,10,15,0.09);
        border-radius: 100px;
        padding: 5px 12px 5px 10px;
        margin-bottom: 20px;
        box-shadow: 0 1px 2px rgba(10,10,15,0.04);
      }
      .bl-eyebrow-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--ytg-accent);
        box-shadow: 0 0 0 3px rgba(229,48,42,0.12);
      }
      .bl-eyebrow-text {
        font-size: 11px; font-weight: 700; color: var(--ytg-text-2);
        text-transform: uppercase; letter-spacing: 0.09em;
      }

      .bl-h1 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -2px; line-height: 1.05; text-wrap: balance; }
      .bl-h2 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -1.4px; line-height: 1.08; text-wrap: balance; }

      .bl-nav-link { font-size: 14px; color: var(--ytg-text-3); font-weight: 500; text-decoration: none; transition: color 0.15s; letter-spacing: -0.1px; }
      .bl-nav-link:hover { color: var(--ytg-text-2); }

      .bl-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }

      /* Card */
      .bl-card {
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
      .bl-card:hover { box-shadow: var(--ytg-shadow-lg); transform: translateY(-3px); }

      .bl-card-cover {
        width: 100%; aspect-ratio: 16/9;
        background: linear-gradient(135deg, var(--ytg-bg-2), var(--ytg-bg-3));
        position: relative; overflow: hidden;
      }
      .bl-card-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .bl-card-cover-fallback {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        font-family: 'DM Sans', sans-serif;
        font-weight: 800; font-size: 64px; letter-spacing: -2px;
        color: rgba(10,10,15,0.16);
      }

      .bl-card-cat-pill {
        position: absolute; top: 14px; left: 14px;
        background: rgba(255,255,255,0.94);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(10,10,15,0.06);
        border-radius: 100px;
        padding: 4px 11px;
        font-size: 10.5px; font-weight: 800;
        color: var(--ytg-accent-text);
        letter-spacing: 0.08em; text-transform: uppercase;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      }

      .bl-card-body { padding: 24px 24px 26px; display: flex; flex-direction: column; flex: 1; gap: 10px; }

      .bl-card-title {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 20px; font-weight: 800;
        letter-spacing: -0.5px; line-height: 1.22;
        color: var(--ytg-text);
        text-wrap: balance;
        transition: color 0.18s;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .bl-card:hover .bl-card-title { color: var(--ytg-accent); }

      .bl-card-excerpt {
        font-size: 14px; line-height: 1.7;
        color: var(--ytg-text-2);
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .bl-card-meta {
        margin-top: auto; padding-top: 14px;
        font-size: 13px; color: var(--ytg-text-3);
        display: flex; align-items: center; gap: 10px;
        border-top: 1px solid var(--ytg-border);
      }
      .bl-card-meta-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--ytg-text-3); }

      /* Featured row */
      .bl-featured {
        display: grid; grid-template-columns: 1.15fr 1fr; gap: 0;
        background: var(--ytg-card);
        border-radius: 22px;
        border: 1px solid var(--ytg-border);
        box-shadow: var(--ytg-shadow-lg);
        overflow: hidden;
        margin-bottom: 56px;
        text-decoration: none; color: inherit;
        transition: box-shadow 0.22s, transform 0.22s;
      }
      .bl-featured:hover { box-shadow: var(--ytg-shadow-xl); transform: translateY(-3px); }
      .bl-featured-cover {
        aspect-ratio: 16/9;
        background: linear-gradient(135deg, var(--ytg-bg-2), var(--ytg-bg-3));
        position: relative; overflow: hidden;
      }
      .bl-featured-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .bl-featured-body { padding: 56px 56px 56px 48px; display: flex; flex-direction: column; justify-content: center; gap: 16px; }
      .bl-featured-title {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 38px; font-weight: 800;
        letter-spacing: -1.1px; line-height: 1.08;
        color: var(--ytg-text);
        text-wrap: balance;
        transition: color 0.18s;
      }
      .bl-featured:hover .bl-featured-title { color: var(--ytg-accent); }
      .bl-featured-excerpt { font-size: 16px; line-height: 1.7; color: var(--ytg-text-2); }

      /* Pagination */
      .bl-pagination {
        display: flex; align-items: center; justify-content: center;
        gap: 6px; margin-top: 56px;
      }
      .bl-page-btn {
        min-width: 38px; height: 38px;
        display: inline-flex; align-items: center; justify-content: center;
        padding: 0 12px;
        background: #fff; border: 1px solid var(--ytg-border);
        border-radius: 100px;
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 13.5px; font-weight: 600; color: var(--ytg-text-2);
        text-decoration: none; cursor: pointer;
        font-variant-numeric: tabular-nums;
        letter-spacing: -0.1px;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
      }
      .bl-page-btn:hover { border-color: rgba(229,48,42,0.32); color: var(--ytg-accent); background: var(--ytg-accent-light); }
      .bl-page-btn.active {
        background: var(--ytg-accent); color: #fff;
        border-color: var(--ytg-accent);
        box-shadow: 0 1px 3px rgba(0,0,0,0.10), 0 4px 12px rgba(229,48,42,0.28);
        cursor: default;
      }
      .bl-page-btn.active:hover { background: var(--ytg-accent); color: #fff; }
      .bl-page-btn.disabled {
        opacity: 0.35; cursor: not-allowed; pointer-events: none;
      }
      .bl-page-ellipsis {
        min-width: 24px; height: 38px;
        display: inline-flex; align-items: center; justify-content: center;
        font-size: 13.5px; color: var(--ytg-text-3); font-weight: 600;
      }

      @media (max-width: 1024px) {
        .bl-grid-3 { grid-template-columns: repeat(2,1fr); }
      }
      @media (max-width: 768px) {
        .bl-grid-3 { grid-template-columns: 1fr; gap: 16px; }
        .bl-featured { grid-template-columns: 1fr; border-radius: 16px; margin-bottom: 32px; }
        .bl-featured-cover { aspect-ratio: 16/9; }
        .bl-featured-body { padding: 22px 22px 26px; gap: 10px; }
        .bl-featured-title { font-size: 22px; letter-spacing: -0.4px; line-height: 1.18; }
        .bl-featured-excerpt { font-size: 14.5px; line-height: 1.6; }
        .bl-card { border-radius: 14px; }
        .bl-card-body { padding: 20px 20px 22px; gap: 8px; }
        .bl-card-title { font-size: 18px; line-height: 1.25; }
        .bl-card-excerpt { font-size: 13.5px; -webkit-line-clamp: 2; }
        .bl-card-cat-pill { font-size: 10px; padding: 3px 9px; top: 12px; left: 12px; }
        .bl-section-pad { padding-left: 18px !important; padding-right: 18px !important; }
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

function CoverFallback({ title }) {
  const letter = (title || 'Y').trim()[0].toUpperCase()
  return <div className="bl-card-cover-fallback">{letter}</div>
}

function PostCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} className="bl-card">
      <div className="bl-card-cover">
        {post.cover
          ? <img src={post.cover} alt={post.title} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          : <CoverFallback title={post.title} />}
        <span className="bl-card-cat-pill">{post.category.label}</span>
      </div>
      <div className="bl-card-body">
        <h3 className="bl-card-title">{post.title}</h3>
        <p className="bl-card-excerpt">{post.excerpt}</p>
        <div className="bl-card-meta">
          <span>{formatPostDate(post.date)}</span>
          <span className="bl-card-meta-dot" />
          <span>{post.readTime}</span>
        </div>
      </div>
    </Link>
  )
}

function FeaturedPost({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} className="bl-featured">
      <div className="bl-featured-cover">
        {post.cover
          ? <img src={post.cover} alt={post.title} onError={(e) => { e.currentTarget.style.display = 'none' }} />
          : <CoverFallback title={post.title} />}
        <span className="bl-card-cat-pill">{post.category.label}</span>
      </div>
      <div className="bl-featured-body">
        <span className="bl-eyebrow" style={{ marginBottom: 0 }}>
          <span className="bl-eyebrow-dot" />
          <span className="bl-eyebrow-text">Featured</span>
        </span>
        <h2 className="bl-featured-title">{post.title}</h2>
        <p className="bl-featured-excerpt">{post.excerpt}</p>
        <div className="bl-card-meta" style={{ marginTop: 4, paddingTop: 14, borderTop: '1px solid var(--ytg-border)' }}>
          <span>By {post.author}</span>
          <span className="bl-card-meta-dot" />
          <span>{formatPostDate(post.date)}</span>
          <span className="bl-card-meta-dot" />
          <span>{post.readTime}</span>
        </div>
      </div>
    </Link>
  )
}

/* Build a compact list of page numbers with ellipses for the pagination
   strip. e.g. for current=5 of 10 pages: [1, '…', 4, 5, 6, '…', 10].
   Always shows first/last and a window of 1 around current. */
function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter(n => n >= 1 && n <= total).sort((a, b) => a - b)
  const out = []
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i])
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) out.push('…')
  }
  return out
}

function Pagination({ current, total }) {
  if (total <= 1) return null
  const pages = buildPageList(current, total)
  const hrefFor = (n) => n === 1 ? '/blog' : `/blog?page=${n}`
  const prevDisabled = current <= 1
  const nextDisabled = current >= total
  return (
    <nav className="bl-pagination" aria-label="Blog pagination">
      <a href={hrefFor(current - 1)}
         className={`bl-page-btn${prevDisabled ? ' disabled' : ''}`}
         aria-label="Previous page" aria-disabled={prevDisabled}>← Prev</a>
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`e${i}`} className="bl-page-ellipsis" aria-hidden="true">…</span>
          : <a key={p} href={hrefFor(p)}
               className={`bl-page-btn${p === current ? ' active' : ''}`}
               aria-current={p === current ? 'page' : undefined}>{p}</a>
      )}
      <a href={hrefFor(current + 1)}
         className={`bl-page-btn${nextDisabled ? ' disabled' : ''}`}
         aria-label="Next page" aria-disabled={nextDisabled}>Next →</a>
    </nav>
  )
}

export default function Blog() {
  useStyles()
  const [searchParams] = useSearchParams()
  const { isMobile } = useBreakpoint()

  const sorted = useMemo(
    () => [...posts].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [],
  )

  // Featured = newest post, shown on page 1 only and outside pagination.
  // Pagination is over `paginatable` (everything else). 12 cards/page.
  const featuredPost = sorted[0] || null
  const paginatable  = useMemo(() => sorted.slice(1), [sorted])
  const totalPages   = Math.max(1, Math.ceil(paginatable.length / POSTS_PER_PAGE))
  const requested    = parseInt(searchParams.get('page') || '1', 10)
  const page         = Number.isFinite(requested) ? Math.min(Math.max(1, requested), totalPages) : 1

  const { featured, gridPosts } = useMemo(() => {
    const start = (page - 1) * POSTS_PER_PAGE
    return {
      featured:  page === 1 ? featuredPost : null,
      gridPosts: paginatable.slice(start, start + POSTS_PER_PAGE),
    }
  }, [featuredPost, paginatable, page])

  // Title + description per page so paged URLs index distinctly without
  // looking like duplicate content. Canonical points back to the current
  // paginated URL (don't collapse to /blog — that would let Google
  // ignore page 2+ entirely).
  useEffect(() => {
    document.title = page === 1 ? 'Blog — YTGrowth' : `Blog (Page ${page}) — YTGrowth`
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = page === 1
      ? 'YouTube growth tactics, channel deep-dives, and creator playbooks from the YTGrowth team.'
      : `More posts from the YTGrowth blog — page ${page} of ${totalPages}. YouTube growth tactics, channel deep-dives, and creator playbooks.`
  }, [page, totalPages])

  // rel=prev/next link tags so search engines understand the paged
  // sequence as one logical resource. Cleaned up on unmount/page change.
  useEffect(() => {
    const origin = window.location.origin
    const href = (n) => n === 1 ? `${origin}/blog` : `${origin}/blog?page=${n}`
    const set = (rel, url) => {
      let tag = document.querySelector(`link[rel="${rel}"]`)
      if (!url) { if (tag) tag.remove(); return }
      if (!tag) { tag = document.createElement('link'); tag.rel = rel; document.head.appendChild(tag) }
      tag.href = url
    }
    set('prev', page > 1 ? href(page - 1) : null)
    set('next', page < totalPages ? href(page + 1) : null)
    return () => { set('prev', null); set('next', null) }
  }, [page, totalPages])

  // Reset scroll on page change so users land at the top of the new
  // grid rather than wherever the last page left them.
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [page])

  return (
    <div style={{ background: 'var(--ytg-bg)', minHeight: '100vh' }}>

      <ScrollProgress />

      {/* NAV — shared SiteHeader */}
      <SiteHeader />

      {/* 1 — HERO. White */}
      <section style={{ padding: isMobile ? '40px 18px 40px' : '110px 40px 72px', textAlign: 'center', background: '#ffffff' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', animation: 'fadeUp 0.5s ease both' }}>
          <span className="bl-eyebrow">
            <span className="bl-eyebrow-dot" />
            <span className="bl-eyebrow-text">The blog</span>
          </span>
          <h1 className="bl-h1" style={{ fontSize: isMobile ? 32 : 60, color: 'var(--ytg-text)', marginBottom: isMobile ? 16 : 22, letterSpacing: isMobile ? '-1.2px' : '-2px' }}>
            YouTube growth, <span style={{ color: 'var(--ytg-accent)' }}>without the noise.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 15 : 18.5, color: 'var(--ytg-text-2)', lineHeight: 1.65, maxWidth: 680, margin: '0 auto' }}>
            Tactics, channel deep-dives, and creator playbooks from the team behind YTGrowth. Written by humans, tested on real channels.
          </p>
        </div>
      </section>

      {/* 2 — FEATURED + GRID. Light bg */}
      <section className="bl-section-pad" style={{ padding: isMobile ? '36px 18px 56px' : '80px 40px 120px', background: 'var(--ytg-bg)', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>

          {featured && <FeaturedPost post={featured} />}

          {gridPosts.length > 0 && (
            <>
              <div style={{ marginBottom: isMobile ? 16 : 24, marginTop: isMobile ? 8 : 16 }}>
                <h2 className="bl-h2" style={{ fontSize: isMobile ? 22 : 32, color: 'var(--ytg-text)', letterSpacing: isMobile ? '-0.6px' : '-1.4px' }}>
                  {page === 1 ? 'More from the blog' : `Page ${page} of ${totalPages}`}
                </h2>
              </div>
              <div className="bl-grid-3">
                {gridPosts.map(p => <PostCard key={p.slug} post={p} />)}
              </div>
            </>
          )}

          <Pagination current={page} total={totalPages} />

          {posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--ytg-text-3)' }}>
              No posts yet. Check back soon.
            </div>
          )}
        </div>
      </section>

      {/* 3 — BOTTOM CTA. Stepped bg */}
      <section style={{ padding: isMobile ? '0 14px 56px' : '0 40px 120px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', paddingTop: isMobile ? 36 : 88 }}>
          <div style={{
            borderRadius: isMobile ? 16 : 24,
            border: '1px solid var(--ytg-border)',
            boxShadow: 'var(--ytg-shadow-xl)',
            padding: isMobile ? '36px 20px 32px' : '80px 60px',
            textAlign: 'center',
            background: 'var(--ytg-card)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 500, height: 240, background: 'radial-gradient(ellipse, rgba(229,48,42,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <span className="bl-eyebrow" style={{ position: 'relative' }}>
              <span className="bl-eyebrow-dot" />
              <span className="bl-eyebrow-text">Try YTGrowth</span>
            </span>
            <h2 className="bl-h2" style={{ fontSize: isMobile ? 26 : 44, marginBottom: isMobile ? 10 : 14, letterSpacing: isMobile ? '-0.8px' : '-1.4px', position: 'relative' }}>
              Reading is good.<br />
              <span style={{ color: 'var(--ytg-accent)' }}>Doing is better.</span>
            </h2>
            <p style={{ fontSize: isMobile ? 14 : 16, color: 'var(--ytg-text-2)', maxWidth: 520, margin: '0 auto 22px', lineHeight: 1.65, position: 'relative' }}>
              Run your channel through YTGrowth and get a complete audit, SEO recommendations, and competitor breakdowns. Free to try.
            </p>
            <Link to="/dashboard" className={`bl-btn${isMobile ? '' : ' bl-btn-lg'}`} style={{ position: 'relative' }}>
              Try YTGrowth free →
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />

    </div>
  )
}
