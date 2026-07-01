import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import LandingFooter from '../components/LandingFooter'
import SiteHeader from '../components/SiteHeader'
import { postsMeta as posts, formatPostDate } from '../blog/postsMeta.js'

/* Pagination tunables. POSTS_PER_PAGE = grid cards per page. The
   featured post is shown on page 1 in addition to the cards (so page 1
   has 1 + POSTS_PER_PAGE visible) and is excluded from the pagination
   math entirely, it doesn't eat into the page budget. */
const POSTS_PER_PAGE = 12

/* Blog index. Migrated to the editorial design language (Fraunces +
   Barlow, sharp flat cards, warm paper, restrained red). ALL pagination,
   SEO (title/description/rel prev-next), and scroll logic are preserved;
   only the skin changed. See project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

function useBreakpoint() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return { isMobile: w <= 768, isTablet: w <= 1024 }
}

function useStyles() {
  useEffect(() => {
    if (document.getElementById('bl-styles')) return
    const style = document.createElement('style')
    style.id = 'bl-styles'
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
      @keyframes blFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .bl-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .bl-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .bl-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .bl-h1 { font-family: ${SERIF}; font-weight: 400; letter-spacing: -0.01em; line-height: 1.04; color: var(--yte-ink); }
      .bl-h1 em { font-style: italic; color: var(--yte-accent); }
      .bl-h2 { font-family: ${SERIF}; font-weight: 400; letter-spacing: -0.01em; line-height: 1.08; color: var(--yte-ink); }
      .bl-h2 em { font-style: italic; color: var(--yte-accent); }
      .bl-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.7; }

      .bl-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }

      /* Card */
      .bl-card { display: flex; flex-direction: column; background: var(--yte-surface); border: 1px solid var(--yte-line); overflow: hidden; text-decoration: none; color: inherit; transition: border-color 0.18s, transform 0.18s, box-shadow 0.18s; }
      .bl-card:hover { transform: translateY(-2px); border-color: var(--yte-line-2); box-shadow: 0 10px 30px -16px rgba(20,19,15,0.28); }
      .bl-card-cover { width: 100%; aspect-ratio: 16/9; background: linear-gradient(135deg, var(--yte-bg-2), #e6e1d6); position: relative; overflow: hidden; }
      .bl-card-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .bl-card-cover-fallback { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: ${SERIF}; font-weight: 400; font-size: 64px; color: rgba(20,19,15,0.14); }
      .bl-card-cat { position: absolute; top: 12px; left: 12px; background: var(--yte-surface); padding: 4px 10px; font-family: ${SANS}; font-size: 10px; font-weight: 700; color: var(--yte-accent); letter-spacing: 0.1em; text-transform: uppercase; }
      .bl-card-body { padding: 22px 22px 24px; display: flex; flex-direction: column; flex: 1; gap: 10px; }
      .bl-card-title { font-family: ${SERIF}; font-size: 21px; font-weight: 400; letter-spacing: -0.2px; line-height: 1.22; color: var(--yte-ink); text-wrap: balance; transition: color 0.18s; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      .bl-card:hover .bl-card-title { color: var(--yte-accent); }
      .bl-card-excerpt { font-family: ${SANS}; font-size: 14px; line-height: 1.65; color: var(--yte-soft); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      .bl-card-meta { margin-top: auto; padding-top: 14px; font-family: ${SANS}; font-size: 12.5px; color: var(--yte-muted); font-weight: 500; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; border-top: 1px solid var(--yte-line); }
      .bl-card-meta-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--yte-muted); }

      /* Featured row */
      .bl-featured { display: grid; grid-template-columns: 1.15fr 1fr; gap: 0; background: var(--yte-surface); border: 1px solid var(--yte-line); overflow: hidden; margin-bottom: 56px; text-decoration: none; color: inherit; transition: border-color 0.2s, box-shadow 0.2s; }
      .bl-featured:hover { border-color: var(--yte-line-2); box-shadow: 0 14px 40px -20px rgba(20,19,15,0.3); }
      .bl-featured-cover { aspect-ratio: 16/9; background: linear-gradient(135deg, var(--yte-bg-2), #e6e1d6); position: relative; overflow: hidden; }
      .bl-featured-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .bl-featured-body { padding: 48px 48px 48px 44px; display: flex; flex-direction: column; justify-content: center; gap: 16px; }
      .bl-featured-title { font-family: ${SERIF}; font-size: 36px; font-weight: 400; letter-spacing: -0.4px; line-height: 1.1; color: var(--yte-ink); text-wrap: balance; transition: color 0.18s; }
      .bl-featured:hover .bl-featured-title { color: var(--yte-accent); }
      .bl-featured-excerpt { font-family: ${SANS}; font-size: 16px; line-height: 1.65; color: var(--yte-soft); }

      /* Pagination, quiet: active = ink, never red */
      .bl-pagination { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 56px; flex-wrap: wrap; }
      .bl-page-btn { min-width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center; padding: 0 14px; background: var(--yte-surface); border: 1px solid var(--yte-line); font-family: ${SANS}; font-size: 12.5px; font-weight: 600; letter-spacing: 0.02em; color: var(--yte-soft); text-decoration: none; cursor: pointer; font-variant-numeric: tabular-nums; transition: border-color 0.15s, color 0.15s, background 0.15s; }
      .bl-page-btn:hover { border-color: var(--yte-accent); color: var(--yte-accent); }
      .bl-page-btn.active { background: var(--yte-ink); color: #fff; border-color: var(--yte-ink); cursor: default; }
      .bl-page-btn.active:hover { background: var(--yte-ink); color: #fff; }
      .bl-page-btn.disabled { opacity: 0.35; cursor: not-allowed; pointer-events: none; }
      .bl-page-ellipsis { min-width: 24px; height: 38px; display: inline-flex; align-items: center; justify-content: center; font-family: ${SANS}; font-size: 13.5px; color: var(--yte-muted); font-weight: 600; }

      @media (max-width: 1024px) { .bl-grid-3 { grid-template-columns: repeat(2,1fr); } }
      @media (max-width: 768px) {
        .bl-grid-3 { grid-template-columns: 1fr; gap: 16px; }
        .bl-featured { grid-template-columns: 1fr; margin-bottom: 32px; }
        .bl-featured-body { padding: 26px 22px 28px; gap: 12px; }
        .bl-featured-title { font-size: 25px; letter-spacing: -0.3px; line-height: 1.16; }
        .bl-featured-excerpt { font-size: 14.5px; line-height: 1.6; }
        .bl-card-body { padding: 20px 20px 22px; gap: 8px; }
        .bl-card-title { font-size: 19px; line-height: 1.25; }
        .bl-card-excerpt { font-size: 13.5px; -webkit-line-clamp: 2; }
        .bl-section-pad { padding-left: 22px !important; padding-right: 22px !important; }
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
      <div style={{ height: '100%', width: `${progress}%`, background: 'var(--yte-accent)', transition: 'width 0.08s linear' }} />
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
        <span className="bl-card-cat">{post.category.label}</span>
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
        <span className="bl-card-cat">{post.category.label}</span>
      </div>
      <div className="bl-featured-body">
        <span className="bl-eyebrow" style={{ marginBottom: 0 }}>
          <span aria-hidden="true" className="bl-eyebrow-rule" />
          <span className="bl-eyebrow-text">Featured</span>
        </span>
        <h2 className="bl-featured-title">{post.title}</h2>
        <p className="bl-featured-excerpt">{post.excerpt}</p>
        <div className="bl-card-meta" style={{ marginTop: 4, paddingTop: 14, borderTop: '1px solid var(--yte-line)' }}>
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
  // paginated URL (don't collapse to /blog, that would let Google
  // ignore page 2+ entirely).
  useEffect(() => {
    document.title = page === 1 ? 'Blog, YTGrowth' : `Blog (Page ${page}), YTGrowth`
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = page === 1
      ? 'YouTube growth tactics, channel deep-dives, and creator playbooks from the YTGrowth team: SEO, thumbnails, monetization, and the algorithm, explained.'
      : `More posts from the YTGrowth blog, page ${page} of ${totalPages}. YouTube growth tactics, channel deep-dives, and creator playbooks.`
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
    <div style={{ background: 'var(--yte-bg)', minHeight: '100vh', fontFamily: SANS, color: 'var(--yte-ink)' }}>

      <ScrollProgress />

      {/* NAV, shared SiteHeader */}
      <SiteHeader />

      {/* 1, HERO */}
      <section className="bl-section-pad" style={{ padding: isMobile ? '52px 22px 36px' : '100px 48px 56px', background: 'var(--yte-bg)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', animation: 'blFadeUp 0.5s ease both' }}>
          <span className="bl-eyebrow">
            <span aria-hidden="true" className="bl-eyebrow-rule" />
            <span className="bl-eyebrow-text">The blog</span>
          </span>
          <h1 className="bl-h1" style={{ fontSize: isMobile ? 34 : 58, marginBottom: isMobile ? 16 : 20, maxWidth: 820, textWrap: 'balance' }}>
            YouTube growth, <em>without the noise.</em>
          </h1>
          <p className="bl-lead" style={{ fontSize: isMobile ? 16 : 18, maxWidth: 660 }}>
            Tactics, channel deep-dives, and creator playbooks from the team behind YTGrowth. Written by humans, tested on real channels.
          </p>
        </div>
      </section>

      {/* 2, FEATURED + GRID */}
      <section className="bl-section-pad" style={{ padding: isMobile ? '24px 22px 56px' : '40px 48px 110px', background: 'var(--yte-bg)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>

          {featured && <FeaturedPost post={featured} />}

          {gridPosts.length > 0 && (
            <>
              <div style={{ marginBottom: isMobile ? 16 : 24, marginTop: isMobile ? 8 : 8 }}>
                <h2 className="bl-h2" style={{ fontSize: isMobile ? 24 : 32 }}>
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
            <div style={{ textAlign: 'center', padding: '80px 20px', fontFamily: SANS, color: 'var(--yte-muted)' }}>
              No posts yet. Check back soon.
            </div>
          )}
        </div>
      </section>

      <LandingFooter />

    </div>
  )
}
