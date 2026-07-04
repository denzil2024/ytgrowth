import { useEffect, useMemo, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import LandingFooter from '../components/LandingFooter'
import SiteHeader from '../components/SiteHeader'
import FaqSchema from '../components/FaqSchema'
import { CATEGORY_META } from '../data/youtubeStatsCategories'
import { COUNTRY_META, getCountry } from '../data/youtubeStatsCountries'

/* ─── /youtube-stats/country/:slug page ─────────────────────────────────
   Country drilldown. Same structure as the main hub but filtered to one
   regionCode. Pulls /api/top-channels?region=<code>, renders 14 category
   sections with the top channels for that (category, region) pair.

   SEO target: "top youtube channels in [country]" + per-category
   variations. Each country has its own SEO copy + FAQ in
   src/data/youtubeStatsCountries.js.

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
    if (document.getElementById('yts-country-styles')) return
    const style = document.createElement('style')
    style.id = 'yts-country-styles'
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

      .yts-wrap { max-width: 1080px; margin: 0 auto; }
      .yts-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .yts-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .yts-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .yts-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.04; }
      .yts-h1 em { font-style: italic; color: var(--yte-accent); }
      .yts-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .yts-h2 em { font-style: italic; color: var(--yte-accent); }
      .yts-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .yts-jump-row { display: flex; gap: 7px; flex-wrap: wrap; }
      .yts-jump-chip { background: var(--yte-surface); border: 1px solid var(--yte-line); color: var(--yte-soft); font-family: ${SANS}; font-size: 12.5px; font-weight: 500; letter-spacing: 0.01em; padding: 7px 14px; border-radius: 0; text-decoration: none; transition: border-color 0.15s, color 0.15s, background 0.15s; }
      .yts-jump-chip:hover { border-color: var(--yte-accent); color: var(--yte-accent); background: var(--yte-accent-soft); }

      .yts-seeall { display: inline-flex; align-items: center; gap: 6px; font-family: ${SANS}; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--yte-soft); text-decoration: none; white-space: nowrap; padding: 9px 16px; border: 1px solid var(--yte-line); transition: color 0.15s, border-color 0.15s; }
      .yts-seeall:hover { color: var(--yte-accent); border-color: var(--yte-accent); }

      .yts-board { background: var(--yte-surface); border: 1px solid var(--yte-line); }
      .yts-row { display: grid; grid-template-columns: 34px 48px minmax(0, 1fr) auto; gap: 16px; align-items: center; padding: 13px 18px; text-decoration: none; color: inherit; border-bottom: 1px solid var(--yte-line); transition: background 0.15s; }
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
        .yts-row { grid-template-columns: 24px 40px minmax(0, 1fr) auto; gap: 12px; padding: 12px 14px; }
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

export default function YoutubeStatsCountry() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()
  const { slug } = useParams()
  const country = getCountry(slug)

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

  useEffect(() => {
    if (!country) return
    document.title = country.seoTitle + ' | YTGrowth'
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = country.seoDescription
  }, [country])

  useEffect(() => {
    if (!country) return
    fetch(`/api/top-channels?region=${encodeURIComponent(country.code)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d) })
      .catch(() => {})
  }, [country])

  if (slug && !country) return <Navigate to="/youtube-stats" replace />
  if (!country) return null

  const sections = useMemo(() => {
    if (!data?.groups) return []
    return CATEGORY_META
      .map(meta => ({ meta, rows: (data.groups[meta.id] || []).slice(0, 10) }))
      .filter(s => s.rows.length > 0)
  }, [data])

  const totalChannels = useMemo(
    () => sections.reduce((sum, s) => sum + s.rows.length, 0),
    [sections],
  )

  // Other countries to surface in the related grid.
  const related = COUNTRY_META.filter(c => c.id !== country.id)

  const H2 = isMobile ? 26 : 34

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', overflowX: 'clip' }}>

      <SiteHeader />
      <FaqSchema items={country.faqs} />

      {/* ══ HERO ══ */}
      <section className="yts-section-pad" style={{ padding: isMobile ? '52px 22px 40px' : '88px 48px 48px', background: 'var(--yte-bg)' }}>
        <div className="yts-wrap" style={{ animation: 'ytsFadeUp 0.5s ease both' }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: 20, fontFamily: SANS, fontSize: 13, color: 'var(--yte-muted)' }}>
            <a href="/youtube-stats" style={{ color: 'var(--yte-soft)', textDecoration: 'none', fontWeight: 600 }}>YouTube Stats</a>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--yte-soft)', fontWeight: 600 }}>By country</span>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--yte-ink)', fontWeight: 600 }}>{country.label}</span>
          </nav>

          <Eyebrow>Live rankings</Eyebrow>

          <h1 className="yts-h1" style={{ fontSize: isMobile ? 32 : 52, marginBottom: 22, maxWidth: 860, textWrap: 'balance', display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 18, flexWrap: 'wrap' }}>
            <img
              src={country.flagSrc} alt={`${country.label} flag`}
              width={isMobile ? 40 : 56} height={isMobile ? 30 : 42}
              style={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(10,10,15,0.18)', display: 'block', flexShrink: 0 }}
            />
            <span>Top YouTube channels in <em>{country.label}</em></span>
          </h1>

          {country.intro.map((para, i) => (
            <p key={i} className="yts-lead" style={{ fontSize: isMobile ? 16 : 17.5, marginBottom: 14, maxWidth: 720, textWrap: 'pretty' }}>
              {para}
            </p>
          ))}

          {/* Stats strip */}
          <div style={{ display: 'inline-flex', gap: isMobile ? 18 : 28, alignItems: 'center', flexWrap: 'wrap', marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
              <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.4px' }}>{sections.length || 14}</span>
              <span style={{ fontFamily: SANS, fontSize: 11.5, color: 'var(--yte-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>categories</span>
            </div>
            <span style={{ width: 1, height: 18, background: 'var(--yte-line)' }} />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
              <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.4px' }}>{totalChannels || 'Loading'}</span>
              <span style={{ fontFamily: SANS, fontSize: 11.5, color: 'var(--yte-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>channels</span>
            </div>
            {data?.fetched_at && (
              <>
                <span style={{ width: 1, height: 18, background: 'var(--yte-line)' }} />
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0f7a43', boxShadow: '0 0 0 3px rgba(15,122,67,0.18)' }} />
                  <span style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)', fontWeight: 600 }}>updated {timeAgo(data.fetched_at)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ══ JUMP NAV ══ */}
      <section className="yts-section-pad" style={{ padding: isMobile ? '4px 22px 36px' : '4px 48px 44px', background: 'var(--yte-bg)' }}>
        <div className="yts-wrap">
          <div className="yts-jump-row">
            {CATEGORY_META.map(c => (
              <a key={c.id} href={`#${c.id}`} className="yts-jump-chip">{c.label}</a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CATEGORY SECTIONS ══ */}
      <section className="yts-section-pad" style={{ padding: isMobile ? '40px 22px 72px' : '56px 48px 96px', background: 'var(--yte-bg)', borderTop: '1px solid var(--yte-line)' }}>
        <div className="yts-wrap" style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 56 : 76 }}>

          {sections.length === 0 && (
            <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', padding: isMobile ? 32 : 56, textAlign: 'center' }}>
              <p style={{ fontFamily: SERIF, fontSize: isMobile ? 24 : 30, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.4px', marginBottom: 10 }}>
                Loading the {country.label} leaderboard…
              </p>
              <p style={{ fontFamily: SANS, fontSize: 14, color: 'var(--yte-soft)', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
                If this is the first request for this country, the cache is being populated in the background. Reload in 10-20 seconds and the rankings will appear.
              </p>
            </div>
          )}

          {sections.map(({ meta, rows }) => (
            <div key={meta.id} id={meta.id} style={{ scrollMarginTop: 84 }}>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                    <h2 className="yts-h2" style={{ fontSize: H2 }}>
                      Top {meta.label} channels in {country.label}
                    </h2>
                    <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: 'var(--yte-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {rows.length} channels
                    </span>
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 15, color: 'var(--yte-soft)', lineHeight: 1.6, maxWidth: 700 }}>
                    {meta.blurb}
                  </p>
                </div>
                <a href={`/youtube-stats/country/${country.id}/${meta.id}`} className="yts-seeall">See full top 50 →</a>
              </div>

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
            </div>
          ))}
        </div>
      </section>

      {/* ══ HIGHLIGHTS ══ */}
      <section className="yts-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <div style={{ marginBottom: 36, maxWidth: 720 }}>
            <Eyebrow>What sets it apart</Eyebrow>
            <h2 className="yts-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', textWrap: 'balance' }}>
              What makes {country.label} a distinctive YouTube market.
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {country.highlights.map((h, i) => (
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
            <h2 className="yts-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>
              {country.label} YouTube, <em>answered.</em>
            </h2>
            <p className="yts-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              How the {country.label} YouTube market works for creators and viewers. Still curious? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Get in touch.</a>
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--yte-line)' }}>
            {country.faqs.map((item, i) => {
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

      {/* ══ RELATED COUNTRIES ══ */}
      <section className="yts-section-pad" style={{ padding: isMobile ? '60px 22px' : '88px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <Eyebrow>Browse other countries</Eyebrow>
            <h2 className="yts-h2" style={{ fontSize: isMobile ? 26 : 32 }}>
              Top YouTube channels by country.
            </h2>
          </div>
          <div className="yts-related-grid">
            {related.map(r => (
              <a key={r.id} href={`/youtube-stats/country/${r.id}`} className="yts-related-card">
                <div className="yts-related-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={r.flagSrc} alt={`${r.label} flag`} width={20} height={15} style={{ borderRadius: 2, boxShadow: '0 1px 2px rgba(10,10,15,0.15)', flexShrink: 0 }} />
                  <span>{r.label}</span>
                </div>
                <div className="yts-related-meta">Live rankings →</div>
              </a>
            ))}
            <a href="/youtube-stats" className="yts-related-card" style={{ background: 'var(--yte-accent-soft)' }}>
              <div className="yts-related-label" style={{ color: 'var(--yte-accent)' }}>Global hub</div>
              <div className="yts-related-meta">All categories →</div>
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
