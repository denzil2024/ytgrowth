import { useEffect, useMemo, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import LandingFooter from '../components/LandingFooter'
import SiteHeader from '../components/SiteHeader'
import FaqSchema from '../components/FaqSchema'
import { CATEGORY_META, getCategory } from '../data/youtubeStatsCategories'
import { COUNTRY_META } from '../data/youtubeStatsCountries'

/* ─── /youtube-stats/:slug drilldown page ───────────────────────────────
   Per-category landing page. Pulls the same /api/top-channels payload as
   the hub, but renders the FULL top-50 list for one category, plus
   category-specific copy and FAQ. SEO-targeted at queries like "top
   gaming youtube channels", "top finance youtube channels", etc.

   Migrated to the editorial design language (Fraunces + Barlow, sharp flat
   cards, warm paper, restrained red). ALL data logic and content are
   preserved; only the skin changed. Each stats page scopes its own style
   id so page-specific classes survive client-side nav between them.
   See project_design_language_editorial.
*/

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
    if (document.getElementById('yts-cat-styles')) return
    const style = document.createElement('style')
    style.id = 'yts-cat-styles'
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
      .yts-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.04; }
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

      .yts-country-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 720px) { .yts-country-grid { grid-template-columns: repeat(2, 1fr); } }
      .yts-country-card { display: flex; flex-direction: column; align-items: center; gap: 9px; padding: 20px 12px; background: var(--yte-surface); text-decoration: none; transition: background 0.15s; }
      .yts-country-card:hover { background: var(--yte-bg-2); }

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

export default function YoutubeStatsCategory() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()
  const { slug } = useParams()
  const category = getCategory(slug)

  // Initial state reads from window.__INITIAL_STATS__ if scripts/prerender.js
  // baked it in for this route. Lets the channel rows render into the static
  // HTML for SEO and LLM crawlers. Falls back to null for normal client
  // navigation, where the useEffect below fetches live data as before.
  const [data, setData]       = useState(() => {
    if (typeof window === 'undefined') return null
    const i = window.__INITIAL_STATS__
    return (i && i.region === 'global') ? i.data : null
  })
  const [openFaq, setOpenFaq] = useState(0)

  useEffect(() => {
    if (!category) return
    document.title = category.seoTitle + ' | YTGrowth'
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = category.seoDescription
  }, [category])

  useEffect(() => {
    if (!category) return
    fetch('/api/top-channels')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d) })
      .catch(() => {})
  }, [category])

  // No category match → 404 fallback to the hub. Avoid rendering an
  // empty page that would index for nothing.
  if (slug && !category) {
    return <Navigate to="/youtube-stats" replace />
  }
  if (!category) return null

  const rows = useMemo(() => (data?.groups?.[category.id] || []).slice(0, 50), [data, category.id])

  // Sibling categories, show 6 random others to seed internal navigation.
  const related = useMemo(() => {
    const others = CATEGORY_META.filter(c => c.id !== category.id)
    // Stable shuffle by id hash so prerendered HTML matches client render.
    return others.slice(0, 6)
  }, [category.id])

  const H2 = isMobile ? 24 : 32

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', overflowX: 'clip' }}>

      <SiteHeader />
      <FaqSchema items={category.faqs} />

      {/* ══ HERO ══ */}
      <section className="yts-section-pad" style={{ padding: isMobile ? '52px 22px 40px' : '88px 48px 48px', background: 'var(--yte-bg)' }}>
        <div className="yts-wrap" style={{ animation: 'ytsFadeUp 0.5s ease both' }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: 20, fontFamily: SANS, fontSize: 13, color: 'var(--yte-muted)' }}>
            <a href="/youtube-stats" style={{ color: 'var(--yte-soft)', textDecoration: 'none', fontWeight: 600 }}>YouTube Stats</a>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--yte-ink)', fontWeight: 600 }}>{category.label}</span>
          </nav>

          <Eyebrow>Live rankings</Eyebrow>
          <h1 className="yts-h1" style={{ fontSize: isMobile ? 34 : 54, marginBottom: 22, maxWidth: 820, textWrap: 'balance' }}>
            Top 50 <em>{category.label}</em> YouTube channels
          </h1>

          {category.intro.map((para, i) => (
            <p key={i} className="yts-lead" style={{ fontSize: isMobile ? 16 : 17.5, marginBottom: 14, maxWidth: 720, textWrap: 'pretty' }}>
              {para}
            </p>
          ))}

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
            <h2 className="yts-h2" style={{ fontSize: H2 }}>
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
                If this hangs, the daily refresh hasn't fired yet. Reload in a minute and the list will appear.
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

      {/* ══ HIGHLIGHTS / WHAT MAKES THEM BIG ══ */}
      <section className="yts-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="yts-wrap">
          <div style={{ marginBottom: 36, maxWidth: 720 }}>
            <Eyebrow>What sets them apart</Eyebrow>
            <h2 className="yts-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', textWrap: 'balance' }}>
              What separates the top {category.label.toLowerCase()} channels.
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {category.highlights.map((h, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 18, alignItems: 'flex-start', padding: '22px 0', borderTop: i === 0 ? 'none' : '1px solid var(--yte-line)' }}>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: 'var(--yte-accent)', letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums', paddingTop: 4 }}>
                  0{i + 1}
                </span>
                <p style={{ fontFamily: SANS, fontSize: isMobile ? 15 : 16.5, color: 'var(--yte-soft)', lineHeight: 1.7 }}>
                  {h}
                </p>
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
            <h2 className="yts-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>
              {category.label} channels, <em>answered.</em>
            </h2>
            <p className="yts-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              Real questions about how the {category.label.toLowerCase()} niche works on YouTube. Still curious? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Get in touch.</a>
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--yte-line)' }}>
            {category.faqs.map((item, i) => {
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

      {/* ══ FILTER BY COUNTRY, combo page links ══ */}
      <section className="yts-section-pad" style={{ padding: isMobile ? '60px 22px 36px' : '88px 48px 44px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 22 }}>
            <div>
              <Eyebrow>Filter by country</Eyebrow>
              <h2 className="yts-h2" style={{ fontSize: isMobile ? 24 : 30 }}>
                Top {category.label.toLowerCase()} channels by <em>country.</em>
              </h2>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-muted)', maxWidth: 420, lineHeight: 1.55, margin: 0 }}>
              Drill into the {category.label.toLowerCase()} leaderboard for one specific YouTube market.
            </p>
          </div>
          <div className="yts-country-grid">
            {COUNTRY_META.map(co => (
              <a key={co.id} href={`/youtube-stats/country/${co.id}/${category.id}`} className="yts-country-card">
                <img src={co.flagSrc} alt={`${co.label} flag`} width={36} height={27} loading="lazy" style={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(10,10,15,0.15)', display: 'block' }} />
                <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: 'var(--yte-ink)', letterSpacing: '-0.1px', textAlign: 'center' }}>
                  {co.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ RELATED CATEGORIES ══ */}
      <section className="yts-section-pad" style={{ padding: isMobile ? '24px 22px 64px' : '32px 48px 96px', background: 'var(--yte-surface)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <Eyebrow>Browse other niches</Eyebrow>
            <h2 className="yts-h2" style={{ fontSize: isMobile ? 26 : 32 }}>
              More YouTube channel rankings.
            </h2>
          </div>
          <div className="yts-related-grid">
            {related.map(r => (
              <a key={r.id} href={`/youtube-stats/${r.id}`} className="yts-related-card">
                <div className="yts-related-label">{r.label}</div>
                <div className="yts-related-meta">Top 50 →</div>
              </a>
            ))}
            <a href="/youtube-stats" className="yts-related-card" style={{ background: 'var(--yte-accent-soft)' }}>
              <div className="yts-related-label" style={{ color: 'var(--yte-accent)' }}>All categories</div>
              <div className="yts-related-meta">Hub →</div>
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
