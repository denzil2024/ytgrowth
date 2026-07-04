import { useEffect, useMemo, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import LandingFooter from '../components/LandingFooter'
import SiteHeader from '../components/SiteHeader'
import FaqSchema from '../components/FaqSchema'
import { CATEGORY_META, getCategory } from '../data/youtubeStatsCategories'
import { COUNTRY_META, getCountry } from '../data/youtubeStatsCountries'

/* ─── /youtube-stats/country/:countrySlug/:categorySlug page ───────────
   Country-by-category combo drilldown. Filters the cache by both
   region AND category to produce a deeply-targeted ranked list, e.g.
   "Top 50 Gaming YouTube channels in the United States".

   SEO target: long-tail queries like "top gaming youtube channels in
   america" or "best finance youtubers in canada". Each combo has a
   unique title + description baked from the shared category and
   country metadata.

   Migrated to the editorial design language (Fraunces + Barlow, sharp flat
   cards, warm paper, restrained red). ALL data logic and content are
   preserved; only the skin changed. See project_design_language_editorial. */

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

function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('yts-cc-styles')) return
    const style = document.createElement('style')
    style.id = 'yts-cc-styles'
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
      @keyframes ytsFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .yts-wrap { max-width: 920px; margin: 0 auto; }
      .yts-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .yts-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .yts-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .yts-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.05; }
      .yts-h1 em { font-style: italic; color: var(--yte-accent); }
      .yts-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .yts-h2 em { font-style: italic; color: var(--yte-accent); }
      .yts-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .yts-board { background: var(--yte-surface); border: 1px solid var(--yte-line); }
      .yts-row { display: grid; grid-template-columns: 40px 48px minmax(0, 1fr) auto; gap: 16px; align-items: center; padding: 13px 18px; text-decoration: none; color: inherit; border-bottom: 1px solid var(--yte-line); transition: background 0.15s; }
      .yts-row:last-child { border-bottom: 0; }
      .yts-row:hover { background: var(--yte-bg-2); }
      .yts-row-rank { font-family: ${SANS}; font-size: 13px; font-weight: 700; color: var(--yte-muted); font-variant-numeric: tabular-nums; text-align: center; }
      .yts-row-rank.top3 { color: var(--yte-accent); }
      .yts-row-thumb { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; flex-shrink: 0; background: var(--yte-bg-2); }
      .yts-row-name { font-family: ${SANS}; font-size: 15px; font-weight: 600; color: var(--yte-ink); letter-spacing: -0.1px; line-height: 1.25; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .yts-row-meta { font-family: ${SANS}; font-size: 12px; color: var(--yte-muted); font-weight: 500; margin-top: 3px; font-variant-numeric: tabular-nums; }
      .yts-row-subs { font-family: ${SERIF}; font-size: 19px; font-weight: 400; color: var(--yte-ink); letter-spacing: -0.3px; font-variant-numeric: tabular-nums; text-align: right; }
      .yts-row-subs-label { font-family: ${SANS}; font-size: 10px; color: var(--yte-muted); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 2px; text-align: right; }

      @media (max-width: 720px) {
        .yts-row { grid-template-columns: 28px 40px minmax(0, 1fr) auto; gap: 12px; padding: 12px 14px; }
        .yts-row-thumb { width: 40px; height: 40px; }
        .yts-row-name { font-size: 14px; }
        .yts-row-subs { font-size: 16px; }
        .yts-row-meta { font-size: 11px; }
      }

      .yts-related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      .yts-related-card { display: block; text-decoration: none; padding: 18px 18px; background: var(--yte-surface); transition: background 0.15s; }
      .yts-related-card:hover { background: var(--yte-bg-2); }
      .yts-related-label { font-family: ${SANS}; font-size: 14.5px; font-weight: 600; color: var(--yte-ink); letter-spacing: -0.1px; line-height: 1.2; }
      .yts-related-meta { font-family: ${SANS}; font-size: 11.5px; color: var(--yte-muted); font-weight: 500; margin-top: 4px; }

      .yts-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease; }
      .yts-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .yts-faq-answer-inner { overflow: hidden; }

      @media (max-width: 768px) {
        .yts-section-pad { padding-left: 22px !important; padding-right: 22px !important; }
        .yts-cta-pad { padding: 76px 24px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children, center }) {
  return (
    <div className="yts-eyebrow" style={center ? { justifyContent: 'center' } : undefined}>
      <span aria-hidden="true" className="yts-eyebrow-rule" />
      <span className="yts-eyebrow-text">{children}</span>
    </div>
  )
}

function fmtSubs(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
  return n.toLocaleString()
}

function fmtViewsShort(n) {
  if (!n) return null
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B views'
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M views'
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K views'
  return n.toLocaleString() + ' views'
}

function fmtVideoCount(n) {
  if (!n) return null
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K videos'
  return n + ' videos'
}

function timeAgo(iso) {
  if (!iso) return null
  const ago = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (ago < 60)         return 'just now'
  if (ago < 3600)       return `${Math.floor(ago / 60)}m ago`
  if (ago < 86400)      return `${Math.floor(ago / 3600)}h ago`
  return `${Math.floor(ago / 86400)}d ago`
}

export default function YoutubeStatsCountryCategory() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()
  const { countrySlug, categorySlug } = useParams()
  const country  = getCountry(countrySlug)
  const category = getCategory(categorySlug)

  // Initial state reads from window.__INITIAL_STATS__ if scripts/prerender.js
  // baked the country-specific dataset in for this route. Lets the channel
  // rows render into the static HTML for SEO and LLM crawlers. Falls back
  // to null for normal client navigation, where the useEffect below fetches
  // live data as before.
  const [data, setData]       = useState(() => {
    if (typeof window === 'undefined' || !country) return null
    const i = window.__INITIAL_STATS__
    return (i && i.region === country.code) ? i.data : null
  })
  const [openFaq, setOpenFaq] = useState(0)

  // SEO meta, bake from both country + category metadata so every combo
  // has a unique title and description.
  useEffect(() => {
    if (!country || !category) return
    document.title = `Top 50 ${category.label} YouTube channels in ${country.label} 2026 | YTGrowth`
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = `The top 50 ${category.label.toLowerCase()} YouTube channels in ${country.label}, ranked by live subscriber count from YouTube's API. Updated daily, free.`
  }, [country, category])

  useEffect(() => {
    if (!country || !category) return
    fetch(`/api/top-channels?region=${encodeURIComponent(country.code)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d) })
      .catch(() => {})
  }, [country, category])

  // 404-style fallback if either slug is bad. Avoid rendering empty
  // pages that would index for nothing.
  if ((countrySlug && !country) || (categorySlug && !category)) {
    return <Navigate to="/youtube-stats" replace />
  }
  if (!country || !category) return null

  const rows = useMemo(() => (data?.groups?.[category.id] || []).slice(0, 50), [data, category.id])

  // Build a 5-question combo FAQ by mixing 3 from category + 2 from
  // country. Most niche-specific questions stay on the category page
  // (where they earn primary SEO); country-specific monetization
  // questions add depth here.
  const faqs = useMemo(() => {
    const fromCategory = (category.faqs || []).slice(0, 3)
    const fromCountry  = (country.faqs || []).slice(0, 2)
    return [...fromCategory, ...fromCountry]
  }, [category, country])

  // Other categories within this country, plus a link back up to the
  // country hub and the category-only (global) page.
  const otherCategories = CATEGORY_META.filter(c => c.id !== category.id).slice(0, 5)
  const otherCountries  = COUNTRY_META.filter(c => c.id !== country.id)

  const H2 = isMobile ? 22 : 28

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', overflowX: 'clip' }}>

      <SiteHeader />
      <FaqSchema items={faqs} />

      {/* ══ HERO ══ */}
      <section className="yts-section-pad" style={{ padding: isMobile ? '52px 22px 40px' : '88px 48px 48px', background: 'var(--yte-bg)' }}>
        <div className="yts-wrap" style={{ animation: 'ytsFadeUp 0.5s ease both' }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: 20, fontFamily: SANS, fontSize: 13, color: 'var(--yte-muted)' }}>
            <a href="/youtube-stats" style={{ color: 'var(--yte-soft)', textDecoration: 'none', fontWeight: 600 }}>YouTube Stats</a>
            <span style={{ margin: '0 8px' }}>/</span>
            <a href={`/youtube-stats/country/${country.id}`} style={{ color: 'var(--yte-soft)', textDecoration: 'none', fontWeight: 600 }}>{country.label}</a>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--yte-ink)', fontWeight: 600 }}>{category.label}</span>
          </nav>

          <Eyebrow>Live rankings</Eyebrow>

          <h1 className="yts-h1" style={{ fontSize: isMobile ? 30 : 48, marginBottom: 22, maxWidth: 860, textWrap: 'balance', display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 18, flexWrap: 'wrap' }}>
            <img
              src={country.flagSrc} alt={`${country.label} flag`}
              width={isMobile ? 36 : 50} height={isMobile ? 27 : 38}
              style={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(10,10,15,0.18)', display: 'block', flexShrink: 0 }}
            />
            <span>Top 50 <em>{category.label}</em> channels in {country.label}</span>
          </h1>

          {/* Combined intro, first paragraph from category, first paragraph
              from country. Together they give ~400 words of unique SEO copy
              per combo without manually writing 70 pages. */}
          <p className="yts-lead" style={{ fontSize: isMobile ? 16 : 17.5, marginBottom: 14, maxWidth: 720, textWrap: 'pretty' }}>
            {category.intro?.[0]}
          </p>
          <p className="yts-lead" style={{ fontSize: isMobile ? 16 : 17.5, marginBottom: 14, maxWidth: 720, textWrap: 'pretty' }}>
            {country.intro?.[0]}
          </p>

          {data?.fetched_at && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 10, fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)', fontWeight: 600, background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', padding: '6px 12px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0f7a43', boxShadow: '0 0 0 3px rgba(15,122,67,0.18)' }} />
              Live data, updated {timeAgo(data.fetched_at)}
            </div>
          )}
        </div>
      </section>

      {/* ══ THE LIST ══ */}
      <section className="yts-section-pad" style={{ padding: isMobile ? '8px 22px 64px' : '12px 48px 88px', background: 'var(--yte-bg)' }}>
        <div className="yts-wrap">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
            <h2 className="yts-h2" style={{ fontSize: isMobile ? 24 : 32 }}>
              The leaderboard
            </h2>
            <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: 'var(--yte-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {rows.length > 0 ? `${rows.length} channels` : 'loading'}
            </span>
          </div>

          {rows.length === 0 && (
            <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', padding: isMobile ? 32 : 48, textAlign: 'center' }}>
              <p style={{ fontFamily: SERIF, fontSize: isMobile ? 22 : 26, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.4px', marginBottom: 8 }}>
                Loading the leaderboard…
              </p>
              <p style={{ fontFamily: SANS, fontSize: 14, color: 'var(--yte-soft)', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
                If this hangs, the daily refresh hasn't fired yet for this region. Reload in a minute and the list will appear.
              </p>
            </div>
          )}

          {rows.length > 0 && (
            <div className="yts-board">
              {rows.map((c, i) => {
                const rank = i + 1
                const href = c.handle ? `https://www.youtube.com/@${c.handle}`
                          : c.channel_id ? `https://www.youtube.com/channel/${c.channel_id}`
                          : '#'
                const meta2 = [fmtViewsShort(c.total_views), fmtVideoCount(c.video_count)].filter(Boolean).join(' · ')
                return (
                  <a key={c.channel_id || rank} href={href} target="_blank" rel="noopener noreferrer" className="yts-row">
                    <span className={`yts-row-rank${rank <= 3 ? ' top3' : ''}`}>#{rank}</span>
                    {c.thumbnail
                      ? <img src={c.thumbnail} alt={c.title || "YouTube channel avatar"} className="yts-row-thumb" loading="lazy" />
                      : <div className="yts-row-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 20, fontWeight: 400, color: 'var(--yte-soft)' }}>{(c.title || '?').charAt(0).toUpperCase()}</div>
                    }
                    <div style={{ minWidth: 0 }}>
                      <div className="yts-row-name">{c.title}</div>
                      {meta2 && <div className="yts-row-meta">{meta2}</div>}
                    </div>
                    <div>
                      <div className="yts-row-subs">{fmtSubs(c.subscribers)}</div>
                      <div className="yts-row-subs-label">subscribers</div>
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══ HIGHLIGHTS, combine country + category bullets ══ */}
      <section className="yts-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="yts-wrap">
          <div style={{ marginBottom: 36, maxWidth: 720 }}>
            <Eyebrow>What sets them apart</Eyebrow>
            <h2 className="yts-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', textWrap: 'balance' }}>
              The {category.label.toLowerCase()} channels winning in {country.label}.
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[...(category.highlights || []).slice(0, 2), ...(country.highlights || []).slice(0, 2)].map((h, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 18, alignItems: 'flex-start', padding: '22px 0', borderTop: i === 0 ? 'none' : '1px solid var(--yte-line)' }}>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: 'var(--yte-accent)', letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums', paddingTop: 4 }}>0{i + 1}</span>
                <p style={{ fontFamily: SANS, fontSize: isMobile ? 15 : 16.5, color: 'var(--yte-soft)', lineHeight: 1.7 }}>{h}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div className="yts-section-pad" style={{ background: 'var(--yte-bg)', padding: isMobile ? '60px 22px' : '104px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 36 : 80, alignItems: 'start' }}>
          <div>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="yts-h2" style={{ fontSize: isMobile ? 28 : 36, marginBottom: 14, textWrap: 'balance' }}>
              {category.label} in {country.label}, <em>answered.</em>
            </h2>
            <p className="yts-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              Real questions about how the {category.label.toLowerCase()} niche operates inside the {country.label} market. Still curious? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Get in touch.</a>
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--yte-line)' }}>
            {faqs.map((item, i) => {
              const isOpen = openFaq === i
              return (
                <div key={i} style={{ borderBottom: '1px solid var(--yte-line)' }}>
                  <div onClick={() => setOpenFaq(isOpen ? null : i)} role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenFaq(isOpen ? null : i) } }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, padding: isMobile ? '20px 0' : '24px 0', cursor: 'pointer', userSelect: 'none' }}
                  >
                    <span style={{ flex: 1, fontFamily: SERIF, fontSize: isMobile ? 18 : 20, fontWeight: 400, color: isOpen ? 'var(--yte-accent)' : 'var(--yte-ink)', lineHeight: 1.3, letterSpacing: '-0.2px', transition: 'color 0.2s' }}>{item.q}</span>
                    <span aria-hidden="true" style={{ flexShrink: 0, fontFamily: SANS, fontSize: 26, fontWeight: 300, color: 'var(--yte-accent)', lineHeight: 1, transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                  </div>
                  <div className={`yts-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="yts-faq-answer-inner">
                      <div style={{ paddingBottom: isMobile ? 22 : 26, maxWidth: 680 }}>
                        <p style={{ fontFamily: SANS, fontSize: isMobile ? 14.5 : 15.5, color: 'var(--yte-soft)', lineHeight: 1.78, margin: 0 }}>{item.a}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ══ CROSS-LINKS ══ */}
      <section className="yts-section-pad" style={{ padding: isMobile ? '60px 22px' : '88px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 44 }}>

          {/* Same category, other countries */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <Eyebrow>Same niche, other countries</Eyebrow>
              <h2 className="yts-h2" style={{ fontSize: H2 }}>
                Top {category.label.toLowerCase()} channels by country.
              </h2>
            </div>
            <div className="yts-related-grid">
              {otherCountries.map(c => (
                <a key={c.id} href={`/youtube-stats/country/${c.id}/${category.id}`} className="yts-related-card">
                  <div className="yts-related-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={c.flagSrc} alt={`${c.label} flag`} width={20} height={15} style={{ borderRadius: 2, boxShadow: '0 1px 2px rgba(10,10,15,0.15)', flexShrink: 0 }} />
                    <span>{c.label}</span>
                  </div>
                  <div className="yts-related-meta">{category.label} →</div>
                </a>
              ))}
              <a href={`/youtube-stats/${category.id}`} className="yts-related-card" style={{ background: 'var(--yte-accent-soft)' }}>
                <div className="yts-related-label" style={{ color: 'var(--yte-accent)' }}>Global</div>
                <div className="yts-related-meta">{category.label} top 50 →</div>
              </a>
            </div>
          </div>

          {/* Same country, other categories */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <Eyebrow>Same country, other niches</Eyebrow>
              <h2 className="yts-h2" style={{ fontSize: H2 }}>
                More {country.label} YouTube niches.
              </h2>
            </div>
            <div className="yts-related-grid">
              {otherCategories.map(c => (
                <a key={c.id} href={`/youtube-stats/country/${country.id}/${c.id}`} className="yts-related-card">
                  <div className="yts-related-label">{c.label}</div>
                  <div className="yts-related-meta">in {country.label} →</div>
                </a>
              ))}
              <a href={`/youtube-stats/country/${country.id}`} className="yts-related-card" style={{ background: 'var(--yte-accent-soft)' }}>
                <div className="yts-related-label" style={{ color: 'var(--yte-accent)' }}>All categories</div>
                <div className="yts-related-meta">{country.label} hub →</div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
