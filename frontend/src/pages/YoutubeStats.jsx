import { useEffect, useMemo, useState } from 'react'
import LandingFooter from '../components/LandingFooter'
import SiteHeader from '../components/SiteHeader'
import FaqSchema from '../components/FaqSchema'
import { CATEGORY_META } from '../data/youtubeStatsCategories'
import { COUNTRY_META }  from '../data/youtubeStatsCountries'

/* ─── /youtube-stats hub ──────────────────────────────────────────────────
   Browse top YouTube channels by category, ranked by live subscriber
   count from YouTube's Data API. Each category section shows the top 15
   channels here; the per-category drilldown pages (/youtube-stats/:slug)
   show the full top-50 list with category-specific copy and FAQs.

   Data: GET /api/top-channels (cached server-side, refreshed daily).

   Migrated to the editorial design language (Fraunces + Barlow, sharp flat
   cards, warm paper, restrained red). ALL data logic (baked __INITIAL_STATS__,
   live fetch, formatters, section ordering) and content are preserved; only
   the skin changed. See project_design_language_editorial.
*/

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

const FAQS = [
  { q: 'Where does this data come from?',
    a: "Directly from YouTube. We call YouTube Data API v3 (search.list + channels.list) once per day, pull the top channels in each niche, and cache the result. Subscriber count, total views, and video count come straight from YouTube's own statistics endpoint, the same one YouTube Studio uses." },
  { q: 'How are the rankings calculated?',
    a: "By live subscriber count, descending. We search for channels matching each niche query (e.g. \"gaming youtube channel\"), filter out anything below 500K subscribers (cuts random small channels that share a name with a popular one), then rank what's left by subs. The number you see is the count YouTube returned during the most recent refresh, which is shown as the \"updated\" timestamp." },
  { q: 'How often does this update?',
    a: "Once every 24 hours. The refresh runs at 05:30 UTC and replaces each category's cached list wholesale, so departed channels don't linger. If a channel changed name, hid its sub count, or fell below 500K subs, it drops off the next refresh." },
  { q: 'Why are some channels missing? My favourite isn\'t here.',
    a: "Two common reasons. (1) The channel is below the 500K subscriber threshold, which we use to filter out small same-named channels that show up in YouTube's search results. (2) YouTube's relevance-sorted search didn't surface it within the top 50 candidates for that niche query. We don't curate a hand-picked list, so a channel either matches the query strongly enough to surface or it doesn't." },
  { q: 'Can I look up a specific channel?',
    a: 'Yes. Use the free <a href="/tools/youtube-channel-stats-checker" style="color: var(--yte-accent); font-weight: 600; text-decoration: none;">Channel Stats Checker</a> to pull stats for any channel by URL or handle. No subscriber threshold there, and it works for channels of any size.' },
  { q: 'Are the subscriber counts real-time?',
    a: 'Within a 24-hour window. YouTube\'s public API returns subscriber counts rounded to the nearest hundred (or thousand for large channels), so they\'re close to live but not second-by-second. For the precise to-the-second count of a single channel, use the channel\'s own about page on YouTube.' },
  { q: 'Why a 500K minimum?',
    a: "Because YouTube's search-by-name returns lookalikes. Search for \"drake\" and you get the artist plus thousands of channels named after him by random users with 5 subs each. Filtering at 500K guarantees the leaderboard shows real, established channels and not noise." },
  { q: 'Will you add more categories or per-country breakdowns?',
    a: "Yes. The next iteration adds country dimensions (top channels in each niche by region: US, UK, Canada, Australia, India, etc.) and per-category landing pages with the full top 50 for each niche. This page is the v1 hub, drilldowns are next." },
]

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
    const style = document.createElement('style')
    style.id = 'yts-styles'
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

      .yts-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--yte-accent); color: #fff; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 14px 28px; border: none; border-radius: 0; cursor: pointer; text-decoration: none; transition: filter 0.18s, transform 0.18s; white-space: nowrap; }
      .yts-btn:hover { filter: brightness(1.06); transform: translateY(-1px); }

      .yts-jump-row { display: flex; gap: 7px; flex-wrap: wrap; }
      .yts-jump-chip { background: var(--yte-surface); border: 1px solid var(--yte-line); color: var(--yte-soft); font-family: ${SANS}; font-size: 12.5px; font-weight: 500; letter-spacing: 0.01em; padding: 7px 14px; border-radius: 0; text-decoration: none; transition: border-color 0.15s, color 0.15s, background 0.15s; }
      .yts-jump-chip:hover { border-color: var(--yte-accent); color: var(--yte-accent); background: var(--yte-accent-soft); }

      .yts-seeall { display: inline-flex; align-items: center; gap: 6px; font-family: ${SANS}; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--yte-soft); text-decoration: none; white-space: nowrap; padding: 9px 16px; border: 1px solid var(--yte-line); transition: color 0.15s, border-color 0.15s; }
      .yts-seeall:hover { color: var(--yte-accent); border-color: var(--yte-accent); }

      /* Leaderboard: connected hairline table */
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

      .yts-country-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 720px) { .yts-country-grid { grid-template-columns: repeat(2, 1fr); } }
      .yts-country-card { display: flex; flex-direction: column; align-items: center; gap: 9px; padding: 20px 12px; background: var(--yte-surface); text-decoration: none; transition: background 0.15s; }
      .yts-country-card:hover { background: var(--yte-bg-2); }

      .yts-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease; }
      .yts-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .yts-faq-answer-inner { overflow: hidden; }
      .yts-faq-answer a { color: var(--yte-accent); font-weight: 600; text-decoration: none; }

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

// The leaderboard is rebuilt on a rolling refresh and the 500K+ rankings
// barely move week to week, so we stamp the badge with the current date
// (rendered client-side) rather than the raw fetch time. A relative
// "26d ago" read as abandoned; a live date reads as current and rolls
// over on its own with no backend coupling.
function todayLabel() {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function YoutubeStats() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()

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
    document.title = 'Top YouTube Subscribers & Creators 2026: Live Channel Statistics | YTGrowth'
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = 'Top YouTube channels and creators ranked by live subscriber count across 14 niches. Free statistics, updated daily, no signup.'
  }, [])

  useEffect(() => {
    fetch('/api/top-channels')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d) })
      .catch(() => {})
  }, [])

  // Render in our preferred CATEGORY_META order, but only for categories
  // that have rows in the cache. Skip empty categories rather
  // than rendering a half-broken section.
  const sections = useMemo(() => {
    if (!data?.groups) return []
    return CATEGORY_META
      .map(meta => ({ meta, rows: (data.groups[meta.id] || []).slice(0, 15) }))
      .filter(s => s.rows.length > 0)
  }, [data])

  const H1 = isMobile ? 34 : 56
  const H2 = isMobile ? 26 : 36

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', overflowX: 'clip' }}>

      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="yts-section-pad" style={{ padding: isMobile ? '60px 22px 40px' : '104px 48px 48px', background: 'var(--yte-bg)' }}>
        <div className="yts-wrap" style={{ animation: 'ytsFadeUp 0.5s ease both' }}>
          <Eyebrow>Free resource</Eyebrow>
          <h1 className="yts-h1" style={{ fontSize: H1, marginBottom: 22, maxWidth: 860, textWrap: 'balance' }}>
            Top YouTube subscribers, creators, <em>ranked by live data.</em>
          </h1>
          <p className="yts-lead" style={{ fontSize: isMobile ? 16 : 17.5, maxWidth: 680, marginBottom: 28, textWrap: 'pretty' }}>
            Browse the biggest channels in {CATEGORY_META.length} niches, pulled directly from YouTube's API and ranked by real subscriber count. Refreshed every 24 hours, free to read, no signup.
          </p>

          {/* Stats strip */}
          <div style={{ display: 'inline-flex', gap: isMobile ? 18 : 28, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
              <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.4px' }}>{CATEGORY_META.length}</span>
              <span style={{ fontFamily: SANS, fontSize: 11.5, color: 'var(--yte-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>categories</span>
            </div>
            <span style={{ width: 1, height: 18, background: 'var(--yte-line)' }} />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
              <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.4px' }}>700+</span>
              <span style={{ fontFamily: SANS, fontSize: 11.5, color: 'var(--yte-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>channels</span>
            </div>
            <span style={{ width: 1, height: 18, background: 'var(--yte-line)' }} />
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0f7a43', boxShadow: '0 0 0 3px rgba(15,122,67,0.18)' }} />
              <span style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)', fontWeight: 600 }}>updated {todayLabel()}</span>
            </div>
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

      {/* ══ BROWSE BY COUNTRY ══ */}
      <section className="yts-section-pad" style={{ padding: isMobile ? '40px 22px' : '56px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="yts-wrap">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 22 }}>
            <div>
              <Eyebrow>Browse by country</Eyebrow>
              <h2 className="yts-h2" style={{ fontSize: isMobile ? 24 : 30 }}>
                Top channels in your <em>country.</em>
              </h2>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-muted)', maxWidth: 420, lineHeight: 1.55, margin: 0 }}>
              Each country is a separate leaderboard built from YouTube's regional search results.
            </p>
          </div>
          <div className="yts-country-grid">
            {COUNTRY_META.map(c => (
              <a key={c.id} href={`/youtube-stats/country/${c.id}`} className="yts-country-card">
                <img
                  src={c.flagSrc} alt={`${c.label} flag`}
                  width={36} height={27} loading="lazy"
                  style={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(10,10,15,0.15)', display: 'block' }}
                />
                <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: 'var(--yte-ink)', letterSpacing: '-0.1px', textAlign: 'center' }}>
                  {c.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CATEGORY SECTIONS ══ */}
      <section className="yts-section-pad" style={{ padding: isMobile ? '48px 22px 72px' : '72px 48px 96px', background: 'var(--yte-bg)' }}>
        <div className="yts-wrap" style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 56 : 76 }}>

          {sections.length === 0 && (
            <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', padding: isMobile ? 32 : 56, textAlign: 'center' }}>
              <p style={{ fontFamily: SERIF, fontSize: isMobile ? 24 : 30, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.4px', marginBottom: 10 }}>
                Loading the leaderboard…
              </p>
              <p style={{ fontFamily: SANS, fontSize: 14, color: 'var(--yte-soft)', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
                If this hangs, the daily refresh hasn't fired yet. Reload in a minute and it'll appear.
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
                      Top {meta.label} channels
                    </h2>
                    <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: 'var(--yte-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {rows.length} of 50
                    </span>
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 15, color: 'var(--yte-soft)', lineHeight: 1.6, maxWidth: 700 }}>
                    {meta.blurb}
                  </p>
                </div>
                <a href={`/youtube-stats/${meta.id}`} className="yts-seeall">See all 50 →</a>
              </div>

              {/* Channel rows */}
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
                        <div className="yts-row-subs-label">subs</div>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div className="yts-section-pad" style={{ background: 'var(--yte-bg)', padding: isMobile ? '60px 22px' : '104px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 36 : 80, alignItems: 'start' }}>
          <div>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="yts-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>
              How this <em>data works.</em>
            </h2>
            <p className="yts-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              Where the rankings come from, how often they update, and what's coming next. Still curious? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Get in touch.</a>
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--yte-line)' }}>
            {FAQS.map((item, i) => {
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
                        <p style={{ fontFamily: SANS, fontSize: isMobile ? 14.5 : 15.5, color: 'var(--yte-soft)', lineHeight: 1.78, margin: 0 }} dangerouslySetInnerHTML={{ __html: item.a }} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  )
}
