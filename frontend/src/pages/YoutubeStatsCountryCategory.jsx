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
   country metadata. */

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
    if (document.getElementById('yts-styles')) return
    const link = document.createElement('link')
    link.id = 'yts-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'yts-styles'
    style.textContent = `
      :root {
        --ytg-bg: #f4f4f6; --ytg-bg-2: #ecedf1; --ytg-bg-3: #e6e7ec;
        --ytg-text: #0a0a0f; --ytg-text-2: rgba(10,10,15,0.62); --ytg-text-3: rgba(10,10,15,0.40);
        --ytg-card: #ffffff; --ytg-border: rgba(10,10,15,0.09); --ytg-border-2: rgba(10,10,15,0.16);
        --ytg-accent: #e5302a; --ytg-accent-text: #c22b25; --ytg-accent-light: rgba(229,48,42,0.07);
        --ytg-shadow-sm: 0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
        --ytg-shadow: 0 2px 6px rgba(0,0,0,0.08), 0 10px 32px rgba(0,0,0,0.11);
        --ytg-shadow-lg: 0 4px 16px rgba(0,0,0,0.11), 0 24px 60px rgba(0,0,0,0.14);
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; scroll-padding-top: 84px; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; scrollbar-width: auto; scrollbar-color: rgba(10,10,15,0.28) transparent; }
      ::-webkit-scrollbar { width: 12px; height: 12px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background-color: rgba(10,10,15,0.28); border-radius: 10px; border: 3px solid transparent; background-clip: content-box; }
      ::-webkit-scrollbar-thumb:hover { background-color: rgba(10,10,15,0.48); background-clip: content-box; }

      @keyframes ytsFadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .yts-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--ytg-accent); color: #fff; font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif; padding: 14px 28px; border-radius: 100px; border: none; cursor: pointer; text-decoration: none; letter-spacing: -0.2px; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32); transition: filter 0.18s, transform 0.18s, box-shadow 0.18s; }
      .yts-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,48,42,0.42); }
      .yts-btn-lg { font-size: 16px; padding: 17px 36px; }

      .yts-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1px solid rgba(10,10,15,0.09); border-radius: 100px; padding: 5px 12px 5px 10px; margin-bottom: 20px; box-shadow: 0 1px 2px rgba(10,10,15,0.04); }
      .yts-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ytg-accent); box-shadow: 0 0 0 3px rgba(229,48,42,0.12); }
      .yts-eyebrow-text { font-size: 11px; font-weight: 700; color: var(--ytg-text-2); text-transform: uppercase; letter-spacing: 0.09em; }

      .yts-row { display: grid; grid-template-columns: 36px 56px minmax(0, 1fr) auto; gap: 16px; align-items: center; padding: 14px 16px; background: #fff; border: 1px solid var(--ytg-border); border-radius: 12px; text-decoration: none; color: inherit; transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s; }
      .yts-row:hover { transform: translateY(-1px); box-shadow: var(--ytg-shadow-sm); border-color: rgba(229,48,42,0.30); }
      .yts-row-rank { font-family: 'DM Sans', system-ui, sans-serif; font-size: 14px; font-weight: 800; letter-spacing: -0.4px; color: var(--ytg-text-3); font-variant-numeric: tabular-nums; text-align: center; }
      .yts-row-rank.top3 { color: var(--ytg-accent); }
      .yts-row-thumb { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; flex-shrink: 0; background: #f0f0f4; }
      .yts-row-name { font-family: 'DM Sans', system-ui, sans-serif; font-size: 15px; font-weight: 700; color: var(--ytg-text); letter-spacing: -0.2px; line-height: 1.25; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .yts-row-meta { font-size: 12px; color: var(--ytg-text-3); font-weight: 500; margin-top: 3px; font-variant-numeric: tabular-nums; }
      .yts-row-subs { font-family: 'DM Sans', system-ui, sans-serif; font-size: 16px; font-weight: 800; color: var(--ytg-text); letter-spacing: -0.4px; font-variant-numeric: tabular-nums; text-align: right; }
      .yts-row-subs-label { font-size: 10.5px; color: var(--ytg-text-3); font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 2px; }

      @media (max-width: 720px) {
        .yts-row { grid-template-columns: 28px 44px minmax(0, 1fr) auto; gap: 12px; padding: 12px 14px; }
        .yts-row-thumb { width: 44px; height: 44px; }
        .yts-row-name { font-size: 14px; }
        .yts-row-subs { font-size: 14px; }
        .yts-row-meta { font-size: 11px; }
      }

      .yts-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease; }
      .yts-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .yts-faq-answer-inner { overflow: hidden; }

      .yts-related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }
      .yts-related-card { display: block; text-decoration: none; padding: 14px 16px; background: #fff; border: 1px solid var(--ytg-border); border-radius: 12px; transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s; }
      .yts-related-card:hover { transform: translateY(-1px); box-shadow: var(--ytg-shadow-sm); border-color: rgba(229,48,42,0.30); }
      .yts-related-label { font-family: 'DM Sans', system-ui, sans-serif; font-size: 14px; font-weight: 700; color: var(--ytg-text); letter-spacing: -0.2px; line-height: 1.2; }
      .yts-related-meta { font-size: 11.5px; color: var(--ytg-text-3); font-weight: 500; margin-top: 4px; }

      @media (max-width: 768px) {
        .yts-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .yts-cta-pad { padding: 70px 24px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children }) {
  return (
    <div className="yts-eyebrow">
      <span aria-hidden="true" className="yts-eyebrow-dot" />
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
    meta.content = `The top 50 ${category.label.toLowerCase()} YouTube channels in ${country.label} right now, ranked by live subscriber count from YouTube's official API. Updated daily, free, no signup.`
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

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', overflowX: 'hidden' }}>

      <SiteHeader />
      <FaqSchema items={faqs} />

      {/* ══ HERO ══ */}
      <section className="yts-section-pad" style={{ position: 'relative', padding: isMobile ? '64px 24px 48px' : '110px 48px 72px', background: '#ffffff', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120vw', maxWidth: 1400, height: 620, background: 'radial-gradient(ellipse at center top, rgba(229,48,42,0.07) 0%, rgba(229,48,42,0.02) 40%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'ytsFadeUp 0.5s ease both' }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: 16, fontSize: 13, color: 'var(--ytg-text-3)' }}>
            <a href="/youtube-stats" style={{ color: 'var(--ytg-text-2)', textDecoration: 'none', fontWeight: 600 }}>YouTube Stats</a>
            <span style={{ margin: '0 8px' }}>/</span>
            <a href={`/youtube-stats/country/${country.id}`} style={{ color: 'var(--ytg-text-2)', textDecoration: 'none', fontWeight: 600 }}>{country.label}</a>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--ytg-text)', fontWeight: 600 }}>{category.label}</span>
          </nav>

          <Eyebrow>Live rankings</Eyebrow>

          <h1 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 30 : 50, lineHeight: isMobile ? 1.1 : 1.05, letterSpacing: isMobile ? '-0.6px' : '-1.8px', color: 'var(--ytg-text)', marginBottom: 20, textWrap: 'balance', display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 18, flexWrap: 'wrap' }}>
            <img
              src={country.flagSrc} alt=""
              width={isMobile ? 36 : 50} height={isMobile ? 27 : 38}
              style={{ borderRadius: 4, boxShadow: '0 1px 3px rgba(10,10,15,0.18)', display: 'block', flexShrink: 0 }}
            />
            <span>Top 50 <span style={{ color: 'var(--ytg-accent)' }}>{category.label}</span> channels in {country.label}</span>
          </h1>

          {/* Combined intro, first paragraph from category, first paragraph
              from country. Together they give ~400 words of unique SEO copy
              per combo without manually writing 70 pages. */}
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 18, color: 'var(--ytg-text-2)', lineHeight: 1.7, marginBottom: 16, textWrap: 'pretty' }}>
            {category.intro?.[0]}
          </p>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 18, color: 'var(--ytg-text-2)', lineHeight: 1.7, marginBottom: 16, textWrap: 'pretty' }}>
            {country.intro?.[0]}
          </p>

          {data?.fetched_at && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: 'var(--ytg-text-3)', fontWeight: 600, background: '#fff', border: '1px solid var(--ytg-border)', borderRadius: 100, padding: '5px 12px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 0 3px rgba(22,163,74,0.18)' }} />
              Live data, updated {timeAgo(data.fetched_at)}
            </div>
          )}
        </div>
      </section>

      {/* ══ THE LIST ══ */}
      <section className="yts-section-pad" style={{ padding: isMobile ? '32px 20px 64px' : '56px 48px 96px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 24 : 32, letterSpacing: '-1px', color: 'var(--ytg-text)' }}>
              The leaderboard
            </h2>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {rows.length > 0 ? `${rows.length} channels` : 'loading'}
            </span>
          </div>

          {rows.length === 0 && (
            <div style={{ background: '#fff', border: '1px solid var(--ytg-border)', borderRadius: 16, padding: isMobile ? 32 : 48, textAlign: 'center', boxShadow: 'var(--ytg-shadow-sm)' }}>
              <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 18 : 22, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.4px', marginBottom: 8 }}>
                Loading the leaderboard…
              </p>
              <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
                If this hangs, the daily refresh hasn't fired yet for this region. Reload in a minute and the list will appear.
              </p>
            </div>
          )}

          {rows.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                      ? <img src={c.thumbnail} alt="" className="yts-row-thumb" loading="lazy" />
                      : <div className="yts-row-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--ytg-text-2)' }}>{(c.title || '?').charAt(0).toUpperCase()}</div>
                    }
                    <div style={{ minWidth: 0 }}>
                      <div className="yts-row-name">{c.title}</div>
                      {meta2 && <div className="yts-row-meta">{meta2}</div>}
                    </div>
                    <div>
                      <div className="yts-row-subs">{fmtSubs(c.subscribers)}</div>
                      <div className="yts-row-subs-label">subs</div>
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══ HIGHLIGHTS, combine country + category bullets ══ */}
      <section className="yts-section-pad" style={{ padding: isMobile ? '64px 20px' : '96px 48px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ marginBottom: 32, maxWidth: 700 }}>
            <Eyebrow>What sets them apart</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 28 : 40, letterSpacing: '-1.2px', color: 'var(--ytg-text)', lineHeight: 1.08, textWrap: 'balance' }}>
              The {category.label.toLowerCase()} channels winning in {country.label}.
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[...(category.highlights || []).slice(0, 2), ...(country.highlights || []).slice(0, 2)].map((h, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 18, alignItems: 'flex-start' }}>
                <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--ytg-accent)', letterSpacing: '-0.4px', fontVariantNumeric: 'tabular-nums' }}>0{i + 1}</span>
                <p style={{ fontSize: isMobile ? 15 : 16.5, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>{h}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DARK CTA ══ */}
      <section className="yts-section-pad yts-cta-pad" style={{ padding: isMobile ? '88px 24px' : '120px 48px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', width: 1000, height: isMobile ? 600 : 800, background: 'radial-gradient(ellipse, rgba(229,48,42,0.20) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '5px 12px 5px 10px', marginBottom: 22 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 0 3px rgba(229,48,42,0.18)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Free AI audit</span>
          </div>
          <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 30 : 44, letterSpacing: '-1.4px', color: '#ffffff', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
            Competing in {country.label} {category.label.toLowerCase()}? <span style={{ color: '#ff3b30' }}>Audit your channel first.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 18, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, marginBottom: 30, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Get a free AI audit benchmarked against the top {category.label.toLowerCase()} performers in your country. See exactly which titles, thumbnails, and posting habits are leaving growth on the table.
          </p>
          <a href="/auth/login" className="yts-btn yts-btn-lg">Get my free audit →</a>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', marginTop: 16 }}>
            Free forever plan · no card · 3 audits per month
          </p>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div style={{ background: '#f4f4f6', borderTop: '1px solid rgba(10,10,15,0.08)', borderBottom: '1px solid rgba(10,10,15,0.08)', padding: isMobile ? '60px 20px' : '110px 64px', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '-10%', left: '-5%', width: 700, height: 600, background: 'radial-gradient(ellipse, rgba(229,48,42,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1160, margin: '0 auto', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '340px 1fr', gap: isMobile ? 40 : 88, alignItems: 'start' }}>
          <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 30 : 44, letterSpacing: '-1.4px', color: 'var(--ytg-text)', lineHeight: 1.05, marginBottom: 14, textWrap: 'balance' }}>
              {category.label} in {country.label}, <span style={{ color: 'var(--ytg-accent)' }}>answered.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.7, margin: 0, maxWidth: isMobile ? 520 : 320, marginLeft: isMobile ? 'auto' : 0, marginRight: isMobile ? 'auto' : 0 }}>
              Real questions about how the {category.label.toLowerCase()} niche operates inside the {country.label} market. Still curious? <a href="/contact" style={{ color: 'var(--ytg-accent)', fontWeight: 600, textDecoration: 'none' }}>Get in touch.</a>
            </p>
          </div>

          <div style={{ borderTop: '1px solid rgba(10,10,15,0.10)' }}>
            {faqs.map((item, i) => {
              const isOpen = openFaq === i
              const num = String(i + 1).padStart(2, '0')
              return (
                <div key={i} style={{ borderBottom: '1px solid rgba(10,10,15,0.10)', position: 'relative' }}>
                  {isOpen && <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 2, background: 'var(--ytg-accent)', borderRadius: 2 }} />}
                  <div onClick={() => setOpenFaq(isOpen ? null : i)} role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenFaq(isOpen ? null : i) } }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 14 : 20, padding: isMobile ? '20px 0' : '24px 0', paddingLeft: isOpen ? (isMobile ? 16 : 22) : 0, cursor: 'pointer', transition: 'padding-left 0.25s ease', userSelect: 'none' }}
                  >
                    <span style={{ fontSize: isMobile ? 12 : 13, fontWeight: 700, color: isOpen ? 'var(--ytg-accent)' : 'var(--ytg-text-3)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.5, flexShrink: 0, width: isMobile ? 22 : 28, paddingTop: 2, transition: 'color 0.2s' }}>{num}</span>
                    <span style={{ flex: 1, fontSize: isMobile ? 15 : 16, fontWeight: 600, color: 'var(--ytg-text)', lineHeight: 1.45, letterSpacing: '-0.2px' }}>{item.q}</span>
                    <span aria-hidden="true" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isOpen ? 'var(--ytg-accent)' : 'rgba(10,10,15,0.05)', border: `1px solid ${isOpen ? 'var(--ytg-accent)' : 'rgba(10,10,15,0.10)'}`, transition: 'background 0.2s, border-color 0.2s', marginTop: 1 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 5h8" stroke={isOpen ? '#ffffff' : 'var(--ytg-text-2)'} strokeWidth="1.8" strokeLinecap="round" />
                        {!isOpen && <path d="M5 1v8" stroke="var(--ytg-text-2)" strokeWidth="1.8" strokeLinecap="round" />}
                      </svg>
                    </span>
                  </div>
                  <div className={`yts-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="yts-faq-answer-inner">
                      <div style={{ paddingLeft: isMobile ? 36 : 48, paddingRight: isMobile ? 40 : 48, paddingBottom: isMobile ? 22 : 26 }}>
                        <p style={{ fontSize: isMobile ? 14 : 15, color: 'var(--ytg-text-2)', lineHeight: 1.72, margin: 0 }}>{item.a}</p>
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
      <section className="yts-section-pad" style={{ padding: isMobile ? '64px 20px' : '96px 48px', background: '#fff', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 48 }}>

          {/* Same category, other countries */}
          <div>
            <div style={{ marginBottom: 18 }}>
              <Eyebrow>Same niche, other countries</Eyebrow>
              <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 22 : 28, letterSpacing: '-0.9px', color: 'var(--ytg-text)', lineHeight: 1.1 }}>
                Top {category.label.toLowerCase()} channels by country.
              </h2>
            </div>
            <div className="yts-related-grid">
              {otherCountries.map(c => (
                <a key={c.id} href={`/youtube-stats/country/${c.id}/${category.id}`} className="yts-related-card">
                  <div className="yts-related-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={c.flagSrc} alt="" width={20} height={15} style={{ borderRadius: 2, boxShadow: '0 1px 2px rgba(10,10,15,0.15)', flexShrink: 0 }} />
                    <span>{c.label}</span>
                  </div>
                  <div className="yts-related-meta">{category.label} →</div>
                </a>
              ))}
              <a href={`/youtube-stats/${category.id}`} className="yts-related-card" style={{ background: 'var(--ytg-accent-light)', borderColor: 'rgba(229,48,42,0.18)' }}>
                <div className="yts-related-label" style={{ color: 'var(--ytg-accent-text)' }}>Global</div>
                <div className="yts-related-meta">{category.label} top 50 →</div>
              </a>
            </div>
          </div>

          {/* Same country, other categories */}
          <div>
            <div style={{ marginBottom: 18 }}>
              <Eyebrow>Same country, other niches</Eyebrow>
              <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 22 : 28, letterSpacing: '-0.9px', color: 'var(--ytg-text)', lineHeight: 1.1 }}>
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
              <a href={`/youtube-stats/country/${country.id}`} className="yts-related-card" style={{ background: 'var(--ytg-accent-light)', borderColor: 'rgba(229,48,42,0.18)' }}>
                <div className="yts-related-label" style={{ color: 'var(--ytg-accent-text)' }}>All categories</div>
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
