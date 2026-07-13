import { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import LandingFooter from '../components/LandingFooter'
import SiteHeader from '../components/SiteHeader'
import { getPostBySlug, getRelatedPosts, formatPostDate } from '../blog/posts.jsx'
import { BLOG_SEO } from '../blog/seoMeta'

/* Single blog post. Migrated to the editorial design language (Fraunces +
   Barlow, sharp flat cards, warm paper, restrained red). ALL post-rendering
   and SEO logic (per-slug meta, BlogPosting + BreadcrumbList JSON-LD, scroll
   reset, related posts) are preserved. The .bp-prose class names are kept
   EXACTLY because the post content in posts.jsx references them
   (.bp-cta-card-link, .bp-cta-inline, .bp-template-block, etc.) — only the
   styling changed. Per feedback_cta_mid_article + feedback_no_dark_cta_band,
   the page-level bottom CTA was removed; posts end on their conclusion and
   carry their CTA mid-article. See project_design_language_editorial. */

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
    if (document.getElementById('bp-styles')) return
    const style = document.createElement('style')
    style.id = 'bp-styles'
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
      @keyframes bpFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .bp-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .bp-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .bp-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }

      /* Category tag at the top of a post: flat solid accent, sharp. */
      .bp-category { display: inline-block; padding: 6px 14px; background: var(--yte-accent); color: #fff; font-family: ${SANS}; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; margin-bottom: 26px; transition: filter 0.18s; }
      .bp-category:hover { filter: brightness(1.06); }

      .bp-h1 { font-family: ${SERIF}; font-weight: 400; letter-spacing: -0.01em; line-height: 1.06; color: var(--yte-ink); }
      .bp-h1 em { font-style: italic; color: var(--yte-accent); }
      .bp-h2 { font-family: ${SERIF}; font-weight: 400; letter-spacing: -0.01em; line-height: 1.08; color: var(--yte-ink); }
      .bp-h2 em { font-style: italic; color: var(--yte-accent); }

      /* Byline */
      .bp-byline { text-align: center; position: relative; }
      .bp-byline-rule { width: 28px; height: 1px; background: var(--yte-accent); margin: 0 auto 16px; }
      .bp-byline-author { font-family: ${SANS}; font-size: 14px; font-weight: 600; color: var(--yte-ink); letter-spacing: 0.01em; margin: 0; line-height: 1.3; }
      .bp-byline-meta { font-family: ${SANS}; font-size: 13px; color: var(--yte-muted); margin: 6px 0 0; line-height: 1.4; }

      /* Hero image, 16:9, sharp flat */
      .bp-hero-image { max-width: 1080px; width: 100%; margin: 40px auto 0; aspect-ratio: 16/9; background: linear-gradient(135deg, var(--yte-bg-2), #e6e1d6); border: 1px solid var(--yte-line); overflow: hidden; position: relative; }
      .bp-hero-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .bp-hero-image-fallback { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: ${SERIF}; font-weight: 400; font-size: 96px; color: rgba(20,19,15,0.14); }

      /* PROSE, post body typography */
      .bp-prose { max-width: 760px; margin: 0 auto; font-family: ${SANS}; font-size: 17.5px; line-height: 1.78; color: var(--yte-ink); }
      .bp-prose > * + * { margin-top: 1.6em; }
      .bp-prose > p + p { margin-top: 1.5em; }
      .bp-prose p { margin: 0; color: #312e26; }
      .bp-prose strong { font-weight: 600; color: var(--yte-ink); }
      .bp-prose em { font-style: italic; }

      .bp-prose h2 { font-family: ${SERIF}; font-size: 30px; font-weight: 400; letter-spacing: -0.3px; line-height: 1.15; color: var(--yte-ink); margin-top: 1.9em !important; margin-bottom: 0.5em !important; }
      .bp-prose h2 + p { margin-top: 0.5em !important; }
      .bp-prose h3 { font-family: ${SERIF}; font-size: 22px; font-weight: 400; letter-spacing: -0.2px; line-height: 1.3; color: var(--yte-ink); margin-top: 1.7em !important; margin-bottom: 0.45em !important; }
      .bp-prose h3 + p { margin-top: 0.5em !important; }

      .bp-prose a { color: var(--yte-accent); text-decoration: none; font-weight: 600; background-image: linear-gradient(transparent calc(100% - 1px), rgba(229,48,42,0.35) 1px); background-size: 100% 100%; background-repeat: no-repeat; transition: background-image 0.18s, color 0.18s; }
      .bp-prose a:hover { background-image: linear-gradient(transparent calc(100% - 1px), var(--yte-accent) 1px); }

      .bp-prose ul { padding-left: 1.5em; list-style: none; }
      .bp-prose ul > li { position: relative; padding-left: 0.5em; margin: 0.6em 0; line-height: 1.72; color: #312e26; }
      .bp-prose ul > li::before { content: ''; position: absolute; left: -0.85em; top: 0.62em; width: 5px; height: 5px; background: var(--yte-accent); }

      .bp-prose ol { padding-left: 1.6em; list-style: none; counter-reset: bp-list-counter; }
      .bp-prose ol > li { position: relative; padding-left: 0.4em; margin: 0.6em 0; line-height: 1.72; counter-increment: bp-list-counter; color: #312e26; }
      .bp-prose ol > li::before { content: counter(bp-list-counter) '.'; position: absolute; left: -1.5em; top: 0; color: var(--yte-accent); font-weight: 700; font-size: 0.95em; font-family: ${SANS}; }

      /* Callout (Quick Tip / Pro Tip): a distinct tip panel, full-contrast
         body text (not bold, not a heavy serif pull-quote) inside a flat
         card with an accent left rule so it stands out without shouting. */
      .bp-prose blockquote { margin: 2em 0; padding: 18px 22px; background: var(--yte-surface); border: 1px solid var(--yte-line); border-left: 3px solid var(--yte-accent); border-radius: 0; font-family: ${SANS}; font-size: 16px; font-style: normal; font-weight: 400; color: var(--yte-ink); line-height: 1.7; }
      .bp-prose blockquote p { margin: 0; color: var(--yte-ink); }
      .bp-prose blockquote strong { color: var(--yte-accent); font-weight: 700; font-style: normal; }

      /* Inline CTA button (authors drop into body) */
      .bp-prose .bp-cta-inline { display: inline-flex; align-items: center; gap: 6px; background: var(--yte-accent) !important; color: #fff !important; padding: 10px 22px; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 0; text-decoration: none !important; background-image: none !important; transition: filter 0.18s, transform 0.18s; }
      .bp-prose .bp-cta-inline:hover { filter: brightness(1.06); transform: translateY(-1px); color: #fff !important; }

      /* Mid-article CTA card (approved): sharp flat row */
      .bp-prose .bp-cta-card-link { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin: 2.5em 0; padding: 26px 30px; background: var(--yte-surface) !important; border: 1px solid var(--yte-line); border-radius: 0; text-decoration: none !important; background-image: none !important; color: var(--yte-ink) !important; transition: border-color 0.2s, background 0.2s; }
      .bp-prose .bp-cta-card-link:hover { border-color: var(--yte-line-2); background: var(--yte-bg-2) !important; color: var(--yte-ink) !important; }
      .bp-cta-card-text { display: block; flex: 1; min-width: 0; }
      .bp-cta-card-title { display: block; font-family: ${SERIF}; font-size: 20px; font-weight: 400; letter-spacing: -0.2px; color: var(--yte-ink); margin: 0 0 6px 0 !important; line-height: 1.25; }
      .bp-cta-card-sub { display: block; font-family: ${SANS}; font-size: 14px; color: var(--yte-soft); margin: 0 !important; line-height: 1.55; }
      .bp-cta-card-pill { flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px; background: var(--yte-accent); color: #fff; padding: 13px 24px; font-family: ${SANS}; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 0; white-space: nowrap; transition: filter 0.18s; }
      .bp-prose .bp-cta-card-link:hover .bp-cta-card-pill { filter: brightness(1.06); }
      @media (max-width: 720px) {
        .bp-prose .bp-cta-card-link { flex-direction: column; align-items: flex-start; padding: 22px 24px; gap: 18px; }
      }

      .bp-prose img { width: 100%; height: auto; border: 1px solid var(--yte-line); border-radius: 0; margin: 2.4em 0; }

      .bp-prose code { background: var(--yte-bg-2); padding: 2px 7px; border-radius: 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.86em; color: var(--yte-accent); font-weight: 500; }
      .bp-prose pre { background: var(--yte-ink); color: rgba(255,255,255,0.92); padding: 22px 24px; border-radius: 0; overflow-x: auto; margin: 2.4em 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 14px; line-height: 1.65; }
      .bp-prose pre code { background: transparent; color: inherit; padding: 0; font-size: inherit; }

      .bp-prose hr { border: 0; border-top: 1px solid var(--yte-line); margin: 2.8em 0; }

      /* Template block: paste-ready text, warm card + copy pill */
      .bp-prose .bp-template-block { position: relative; background: var(--yte-bg); border: 1px solid var(--yte-line); border-radius: 0; margin: 2.4em 0; padding: 52px 30px 28px 30px; }
      .bp-prose .bp-template-copy { position: absolute; top: 12px; right: 14px; display: inline-flex; align-items: center; gap: 6px; background: var(--yte-surface); border: 1px solid var(--yte-line); padding: 7px 13px; font-family: ${SANS}; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--yte-accent); cursor: pointer; border-radius: 0; transition: background 0.15s, border-color 0.15s; }
      .bp-prose .bp-template-copy:hover { background: var(--yte-accent-soft); border-color: var(--yte-accent); }
      .bp-prose .bp-template-copy svg { flex-shrink: 0; }
      .bp-prose .bp-template-text { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13.5px; line-height: 1.75; color: var(--yte-ink); white-space: pre-wrap; word-wrap: break-word; margin: 0; }
      @media (max-width: 768px) {
        .bp-prose .bp-template-block { padding: 48px 18px 20px; }
        .bp-prose .bp-template-text { font-size: 12.5px; line-height: 1.7; }
        .bp-prose .bp-template-copy { top: 10px; right: 10px; font-size: 10.5px; padding: 6px 11px; }
      }

      .bp-prose table { width: 100%; border-collapse: collapse; margin: 2em 0; font-size: 15px; border: 1px solid var(--yte-line); border-radius: 0; overflow: hidden; background: var(--yte-surface); }
      .bp-prose thead { background: var(--yte-bg-2); }
      .bp-prose th { padding: 13px 18px; font-family: ${SANS}; font-weight: 600; text-align: left; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--yte-muted); }
      .bp-prose td { padding: 15px 18px; border-top: 1px solid var(--yte-line); vertical-align: top; line-height: 1.6; color: #312e26; }

      /* RELATED POSTS */
      .bp-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
      .bp-related-card { display: flex; flex-direction: column; background: var(--yte-surface); border: 1px solid var(--yte-line); overflow: hidden; text-decoration: none; color: inherit; transition: border-color 0.18s, transform 0.18s, box-shadow 0.18s; }
      .bp-related-card:hover { transform: translateY(-2px); border-color: var(--yte-line-2); box-shadow: 0 10px 30px -16px rgba(20,19,15,0.28); }
      .bp-related-card-cover { width: 100%; aspect-ratio: 16/9; background: linear-gradient(135deg, var(--yte-bg-2), #e6e1d6); position: relative; overflow: hidden; }
      .bp-related-card-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .bp-related-card-cover-fallback { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: ${SERIF}; font-weight: 400; font-size: 56px; color: rgba(20,19,15,0.14); }
      .bp-related-card-body { padding: 20px 20px 22px; display: flex; flex-direction: column; flex: 1; gap: 8px; }
      .bp-related-card-cat { font-family: ${SANS}; font-size: 10px; font-weight: 700; color: var(--yte-accent); letter-spacing: 0.1em; text-transform: uppercase; }
      .bp-related-card-title { font-family: ${SERIF}; font-size: 18px; font-weight: 400; letter-spacing: -0.2px; line-height: 1.28; color: var(--yte-ink); text-wrap: balance; transition: color 0.18s; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      .bp-related-card:hover .bp-related-card-title { color: var(--yte-accent); }
      .bp-related-card-meta { margin-top: auto; padding-top: 12px; font-family: ${SANS}; font-size: 12.5px; color: var(--yte-muted); display: flex; align-items: center; gap: 8px; border-top: 1px solid var(--yte-line); }
      .bp-related-card-meta-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--yte-muted); }

      @media (max-width: 1024px) { .bp-grid-3 { grid-template-columns: repeat(2,1fr); } }
      @media (max-width: 768px) {
        .bp-prose { font-size: 16.5px; line-height: 1.74; }
        .bp-prose > * + * { margin-top: 1.4em; }
        .bp-prose > p + p { margin-top: 1.4em; }
        .bp-prose h2 { font-size: 25px; letter-spacing: -0.2px; margin-top: 1.7em !important; margin-bottom: 0.5em !important; }
        .bp-prose h3 { font-size: 20px; margin-top: 1.5em !important; }
        .bp-prose blockquote { padding: 15px 18px; font-size: 15px; margin: 1.6em 0; line-height: 1.65; }
        .bp-prose ul > li, .bp-prose ol > li { margin: 0.5em 0; }
        .bp-prose img { margin: 1.6em 0; }
        .bp-prose table { font-size: 13px; }
        .bp-prose th { padding: 10px 12px; font-size: 10px; }
        .bp-prose td { padding: 12px 12px; }
        .bp-grid-3 { grid-template-columns: 1fr; }
        .bp-section-pad { padding-left: 22px !important; padding-right: 22px !important; }
        .bp-hero-image { margin-top: 22px; }
        .bp-cta-card-title { font-size: 18px; }
        .bp-cta-card-sub { font-size: 13px; line-height: 1.5; }
        .bp-cta-card-pill { padding: 12px 20px; font-size: 11.5px; width: 100%; justify-content: center; }
        .bp-related-card-body { padding: 18px 18px 20px; gap: 6px; }
        .bp-related-card-title { font-size: 17px; line-height: 1.25; }
      }
      @media (max-width: 420px) {
        .bp-prose { font-size: 16px; }
        .bp-prose h2 { font-size: 23px; }
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
    // SEO title + description come from the per-slug override map (kept <=60 /
    // <=155 for clean SERP display); fall back to the on-page title/excerpt for
    // any post without an explicit override.
    const seo = BLOG_SEO[post.slug] || {}
    document.title = seo.title || `${post.title} | YTGrowth Blog`
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = seo.description || post.excerpt

    // BlogPosting + BreadcrumbList JSON-LD, packed into one @graph so a
    // single <script> tag carries both. Baked into the prerendered HTML at
    // build time (puppeteer waits for networkidle0, so this effect has run
    // before the snapshot) and refreshed on client-side nav between posts.
    // Reused via id so we never accumulate duplicates.
    const ORIGIN = 'https://ytgrowth.io'
    const canonical = `${ORIGIN}/blog/${post.slug}`
    const image = post.cover ? `${ORIGIN}${post.cover}` : `${ORIGIN}/og-image.png`
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type':          'BlogPosting',
          headline:         post.title,
          description:      post.excerpt,
          image,
          datePublished:    post.date,
          dateModified:     post.updated || post.date,
          author:           { '@type': 'Person', name: post.author },
          publisher: {
            '@type': 'Organization',
            name:    'YTGrowth',
            logo:    { '@type': 'ImageObject', url: `${ORIGIN}/favicon.png` },
          },
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
          articleSection:   post.category?.label,
          url:              canonical,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${ORIGIN}/blog` },
            { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
          ],
        },
        // FAQPage, emitted only for posts that carry a `faqs` array whose Q&As
        // mirror the visible FAQ section (Google requires schema to match the
        // page). Feeds Google rich results and AI answer engines. See MEDIAVINE.md.
        ...(Array.isArray(post.faqs) && post.faqs.length ? [{
          '@type': 'FAQPage',
          mainEntity: post.faqs.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }] : []),
      ],
    }
    let script = document.getElementById('bp-jsonld')
    if (!script) {
      script = document.createElement('script')
      script.id = 'bp-jsonld'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(jsonLd)

    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [post])

  if (!post) return <Navigate to="/blog" replace />

  const Body = post.content
  const related = getRelatedPosts(post.slug, 3)

  return (
    <div style={{ background: 'var(--yte-bg)', minHeight: '100vh', fontFamily: SANS, color: 'var(--yte-ink)' }}>

      <ScrollProgress />

      {/* NAV, shared SiteHeader */}
      <SiteHeader />

      {/* 1, HEADER */}
      <section className="bp-section-pad" style={{ padding: isMobile ? '32px 22px 0' : '72px 48px 0', textAlign: 'center', background: 'var(--yte-bg)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', animation: 'bpFadeUp 0.5s ease both' }}>
          <Link to="/blog" className="bp-category">{post.category.label}</Link>
          <h1 className="bp-h1" style={{ fontSize: isMobile ? 30 : 48, marginBottom: isMobile ? 16 : 22, letterSpacing: '-0.4px' }}>
            {post.title}
          </h1>
          <p style={{ fontFamily: SANS, fontSize: isMobile ? 16 : 19, color: 'var(--yte-soft)', lineHeight: 1.6, maxWidth: 660, margin: isMobile ? '0 auto 24px' : '0 auto 32px' }}>
            {post.excerpt}
          </p>
          <div className="bp-byline">
            <div className="bp-byline-rule" />
            <p className="bp-byline-author">Published by {post.author}</p>
            <p className="bp-byline-meta">Updated {formatPostDate(post.updated || post.date)} · {post.readTime}</p>
          </div>
        </div>

        {/* Hero image */}
        <div className="bp-section-pad" style={{ maxWidth: 1180, margin: '0 auto', position: 'relative' }}>
          <div className="bp-hero-image">
            {post.cover
              ? <img src={post.cover} alt={post.coverAlt || post.title} onError={(e) => { e.currentTarget.style.display = 'none' }} />
              : <HeroImageFallback title={post.title} />}
          </div>
        </div>
      </section>

      {/* 2, POST BODY */}
      <section className="bp-section-pad" style={{ padding: isMobile ? '36px 22px 64px' : '72px 48px 96px', background: 'var(--yte-bg)' }}>
        <article className="bp-prose">
          <Body />
        </article>
      </section>

      {/* 3, RELATED POSTS */}
      {related.length > 0 && (
        <section className="bp-section-pad" style={{ padding: isMobile ? '8px 22px 64px' : '24px 48px 110px', background: 'var(--yte-bg)', borderTop: '1px solid var(--yte-line)' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', paddingTop: isMobile ? 48 : 72 }}>
            <div style={{ marginBottom: isMobile ? 18 : 28 }}>
              <span className="bp-eyebrow">
                <span aria-hidden="true" className="bp-eyebrow-rule" />
                <span className="bp-eyebrow-text">Keep reading</span>
              </span>
              <h2 className="bp-h2" style={{ fontSize: isMobile ? 24 : 32 }}>
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
