import { useEffect, useState, useRef } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free SEO tool: YouTube Channel Stats Checker ────────────────────────
   /tools/youtube-channel-stats-checker. Targets "youtube channel stats",
   "youtube subscriber count", "social blade alternative" search queries.
   Calls a small backend route that proxies the YouTube Data API v3.
   No Anthropic credits. Quota is the daily YouTube API quota (10k units),
   responses cached server-side for an hour.

   Migrated to the editorial design language (Fraunces + Barlow, sharp flat
   cards, warm paper, restrained red). ALL fetch/format logic and content are
   preserved verbatim; only the skin changed. Category tabs are quiet
   (active = ink, never red, see feedback_quiet_toggles). See
   project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return { isMobile: width <= 768, isTablet: width <= 1024 }
}

function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-csc-styles')) return
    const style = document.createElement('style')
    style.id = 'ytg-csc-styles'
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
      @keyframes cscFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
      @keyframes cscSpin { to { transform: rotate(360deg) } }

      .csc-wrap { max-width: 1040px; margin: 0 auto; }
      .csc-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .csc-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .csc-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .csc-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.04; }
      .csc-h1 em { font-style: italic; color: var(--yte-accent); }
      .csc-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .csc-h2 em { font-style: italic; color: var(--yte-accent); }
      .csc-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .csc-input { width: 100%; padding: 14px 16px; font-size: 15px; font-weight: 500; font-family: ${SANS}; color: var(--yte-ink); background: var(--yte-surface); border: 1px solid var(--yte-line); border-radius: 0; outline: none; transition: border-color 0.15s; -webkit-appearance: none; }
      .csc-input:focus { border-color: var(--yte-accent); }
      .csc-input::placeholder { color: var(--yte-muted); }

      .csc-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--yte-accent); color: #fff; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 14px 28px; border: none; border-radius: 0; cursor: pointer; text-decoration: none; transition: filter 0.18s, transform 0.18s; white-space: nowrap; }
      .csc-btn:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-1px); }
      .csc-btn:disabled { background: rgba(20,19,15,0.10); color: var(--yte-muted); cursor: not-allowed; transform: none; filter: none; }

      /* quiet category tabs: active = ink, never red */
      .csc-tab { font-family: ${SANS}; font-size: 13px; font-weight: 600; letter-spacing: 0.01em; text-transform: capitalize; color: var(--yte-muted); background: var(--yte-surface); border: 1px solid var(--yte-line); padding: 8px 16px; cursor: pointer; transition: background 0.15s, color 0.15s, border-color 0.15s; }
      .csc-tab:hover { color: var(--yte-ink); border-color: var(--yte-line-2); }
      .csc-tab.active { background: var(--yte-ink); color: #fff; border-color: var(--yte-ink); }

      .csc-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 1024px) { .csc-stat-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 520px) { .csc-stat-grid { grid-template-columns: 1fr; } }

      .csc-video-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: var(--yte-line); }
      @media (max-width: 760px) { .csc-video-grid { grid-template-columns: 1fr; } }

      .csc-grow-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 760px) { .csc-grow-grid { grid-template-columns: 1fr; } }
      .csc-grow-card { display: block; text-decoration: none; background: var(--yte-surface); padding: 28px; transition: background 0.15s; }
      .csc-grow-card:hover { background: var(--yte-bg-2); }

      .csc-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease; }
      .csc-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .csc-faq-answer-inner { overflow: hidden; }

      @media (max-width: 768px) {
        .csc-section-pad { padding-left: 22px !important; padding-right: 22px !important; }
        .csc-cta-pad { padding: 76px 24px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
function fmtNum(n) {
  if (n == null || !isFinite(n)) return '0'
  if (n >= 1e9) return (n / 1e9).toFixed(n >= 1e10 ? 0 : 1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + 'K'
  return n.toLocaleString()
}

function fmtChannelAge(iso) {
  if (!iso) return ''
  const created = new Date(iso)
  const now = new Date()
  const years = (now - created) / (1000 * 60 * 60 * 24 * 365.25)
  if (years < 1) {
    const months = Math.max(1, Math.floor(years * 12))
    return `${months} ${months === 1 ? 'month' : 'months'} old`
  }
  return `${years.toFixed(1)} years old`
}

function fmtPublished(iso) {
  if (!iso) return ', '
  const d = new Date(iso)
  const days = (Date.now() - d.getTime()) / 86400000
  if (days < 1) return 'today'
  if (days < 2) return 'yesterday'
  if (days < 7) return `${Math.floor(days)}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${(days / 365).toFixed(1)}y ago`
}

function fmtDuration(iso) {
  if (!iso) return ''
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/)
  if (!m) return ''
  const h = parseInt(m[1] || 0, 10)
  const mins = parseInt(m[2] || 0, 10)
  const s = parseInt(m[3] || 0, 10)
  if (h) return `${h}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${mins}:${String(s).padStart(2, '0')}`
}

/* ── FAQ ────────────────────────────────────────────────────────────────── */
const FAQS = [
  { q: 'How does this YouTube channel stats checker work?',
    a: "We call YouTube's official Data API v3 with your channel URL or handle and pull back the public stats Google publishes for that channel: subscriber count, total views, video count, channel age, and the most recent uploads. Nothing private. Nothing scraped. Same source YouTube Studio analytics use, but limited to the public-facing fields any visitor could see." },
  { q: 'What URL formats can I paste?',
    a: "Anything that uniquely identifies the channel: a full URL like youtube.com/@channelname or youtube.com/channel/UCxxxxx, the @handle on its own, or the 24-character channel ID. Custom legacy URLs (youtube.com/c/somename, youtube.com/user/somename) work too. If you have just the channel name with no @, paste it as a handle and we'll resolve it." },
  { q: "Are the subscriber counts hidden for some channels?",
    a: "Yes. YouTube lets channel owners opt into hidden subscriber counts, in which case the API returns zero. If a channel shows 0 subs but has obvious view counts and many videos, that's almost certainly a hidden-subs channel rather than a brand-new one." },
  { q: "How fresh is the data?",
    a: "We cache lookups for one hour to be kind to YouTube's API quota. Subscribers and view counts on YouTube don't update in real-time anyway. Big channels show counts that lag actual activity by minutes to hours, so a 1-hour cache is well within YouTube's own update cadence." },
  { q: 'Can I look up YouTube Shorts channels?',
    a: 'Yes. Shorts are uploaded to a regular channel, so the channel-level stats are the same. The recent uploads list mixes long-form and Shorts. Duration tells you which is which: anything under 60 seconds is a Short.' },
  { q: 'Why are the recent video view counts different from when I checked yesterday?',
    a: "View counts on YouTube are live. As a video accumulates views, the API reflects them. Older videos can also drop in count if YouTube removes spam or fraudulent views, which the platform does silently in the background." },
  { q: 'Is this a Social Blade replacement?',
    a: "For point-in-time stats, yes. For historical tracking (sub graphs over weeks and months), no. We don't build the daily snapshots that Social Blade's projection charts depend on. If you need ongoing tracking of competitor channels with weekly insights, that's what YTGrowth's Competitor Analysis does as a paid feature." },
  { q: 'Can I track multiple channels over time?',
    a: "Not in this free tool. Every lookup is one channel, one moment. If you want continuous tracking with weekly reports on channels in your niche (their upload cadence, top-performing titles, content gaps), that's exactly what Competitor Analysis is built for. Connect your channel for a free AI audit and you'll see how it fits with the rest of YTGrowth." },
  { q: 'Does this cost anything? Is the data accurate?',
    a: "Free, forever. We charge nothing for lookups. Accuracy: same as the official YouTube Data API, which is what powers most third-party tools you already trust. The only differences from YouTube Studio's own numbers come from cache windows and YouTube's spam-view filtering. Both invisible from the outside." },
  { q: 'Does the channel owner know I looked them up?',
    a: 'No. Public stats are public. Channel owners do not get notified about API lookups. You can research competitors freely.' },
]

const HOW_IT_WORKS = [
  { h: 'Direct from YouTube, not scraped',
    p: "We hit YouTube Data API v3 with your channel URL or handle. Same source YouTube Studio uses for analytics, but limited to fields YouTube exposes publicly. No scraping, no third-party hacks, no broken results when YouTube redesigns their pages." },
  { h: 'What you get in the lookup',
    p: "Subscriber count (unless the channel has hidden it), total channel views, total video count, channel creation date, upload cadence inferred from recent videos, and the latest 8 uploads with view counts and durations. Enough to size up any channel in 5 seconds." },
  { h: 'Why creators study other creators',
    p: "Niche research. Before you commit to a content angle, you want to know what's working in your category. Looking up 10 channels in your niche tells you average upload cadence, video lengths that work, content patterns. Cheaper than guessing." },
  { h: 'Use it ethically',
    p: "Public stats are public. Use lookups to research competitors, study creators you admire, or vet potential collaborators. Don't use lookup data to harass or impersonate anyone. The API doesn't expose anything private and we wouldn't surface it if it did." },
]

const GROW = [
  { label: 'Competitor Analysis', title: 'Track 10 channels weekly',
    body: 'Pick the channels in your niche, get a weekly email digest of every new upload, top-performing title, and content gap. The data this lookup gives you, on autopilot.',
    href: '/features/competitor-analysis' },
  { label: 'AI Channel Audit', title: 'Audit your own channel',
    body: 'Run YTGrowth on your channel and get a 10-dimension AI audit. Know exactly which of your videos are SEO-underperformers and where you are losing the click war.',
    href: '/features/channel-audit' },
  { label: 'Outliers', title: 'Find what is going viral now',
    body: 'See videos in your niche that are dramatically over-performing their channel\'s baseline. Outliers shows you the breakouts before they go mainstream.',
    href: '/features/outliers' },
]

/* ── Eyebrow ───────────────────────────────────────────────────────────── */
function Eyebrow({ children, center }) {
  return (
    <div className="csc-eyebrow" style={center ? { justifyContent: 'center' } : undefined}>
      <span aria-hidden="true" className="csc-eyebrow-rule" />
      <span className="csc-eyebrow-text">{children}</span>
    </div>
  )
}

/* ── Stat tile ─────────────────────────────────────────────────────────── */
function StatTile({ label, value, sub }) {
  return (
    <div style={{ background: 'var(--yte-surface)', padding: '22px 24px' }}>
      <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--yte-muted)', marginBottom: 14 }}>{label}</p>
      <p style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 400, letterSpacing: '-0.6px', color: 'var(--yte-ink)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-soft)', fontWeight: 400, marginTop: 10, lineHeight: 1.5 }}>{sub}</p>}
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function YoutubeChannelStatsChecker() {
  useGlobalStyles()
  const { isMobile, isTablet } = useBreakpoint()

  const [inputUrl, setInputUrl] = useState('')
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [openFaq, setOpenFaq]   = useState(0)
  const resultsRef = useRef(null)

  /* Top-channels browser, fetches the daily-refreshed cache once on
     mount. Shows category tabs + card grid. Click a card to load that
     channel via the existing lookup flow. */
  const [topChannels, setTopChannels] = useState(null)
  const [topCat, setTopCat]           = useState('gaming')
  useEffect(() => {
    fetch('/api/top-channels')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        setTopChannels(d)
        const firstWithRows = (d.categories || []).find(c => (d.groups?.[c] || []).length > 0)
        if (firstWithRows) setTopCat(firstWithRows)
      })
      .catch(() => {})
  }, [])

  function loadTopChannel(handle) {
    if (!handle) return
    const q = handle.startsWith('@') ? handle : '@' + handle
    setInputUrl(q)
    setError('')
    setLoading(true)
    setData(null)
    fetch(`/api/channel-stats/lookup?q=${encodeURIComponent(q)}`)
      .then(async r => {
        const body = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(body.error || `Lookup failed (${r.status})`)
        return body
      })
      .then(d => {
        setData(d)
        setLoading(false)
        setTimeout(() => { if (resultsRef.current) resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 80)
      })
      .catch(e => {
        setError(e.message || 'Something went wrong.')
        setLoading(false)
      })
  }

  function handleSubmit(e) {
    if (e) e.preventDefault()
    const q = inputUrl.trim()
    if (!q) return
    setError('')
    setLoading(true)
    setData(null)
    fetch(`/api/channel-stats/lookup?q=${encodeURIComponent(q)}`)
      .then(async r => {
        const body = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(body.error || `Lookup failed (${r.status})`)
        return body
      })
      .then(d => {
        setData(d)
        setLoading(false)
        setTimeout(() => { if (resultsRef.current) resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 80)
      })
      .catch(e => {
        setError(e.message || 'Something went wrong.')
        setLoading(false)
      })
  }

  // Derived metrics from fetched data
  const ch = data?.channel
  const videos = data?.recent_videos || []
  const avgViews = ch && ch.video_count > 0 ? Math.round(ch.total_views / ch.video_count) : 0

  // Estimate uploads per month from the recent videos (date span)
  let uploadsPerMonth = null
  if (videos.length >= 2) {
    const dates = videos.map(v => new Date(v.published_at).getTime()).sort((a, b) => b - a)
    const spanDays = Math.max(1, (dates[0] - dates[dates.length - 1]) / 86400000)
    uploadsPerMonth = +(videos.length * 30 / spanDays).toFixed(1)
  }
  const lastUploadAt = videos.length ? videos[0].published_at : null

  const H1 = isMobile ? 34 : isTablet ? 50 : 58
  const H2 = isMobile ? 28 : 42

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', overflowX: 'clip' }}>

      {/* ── NAV, shared SiteHeader ── */}
      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO + INPUT ══ */}
      <section className="csc-section-pad" style={{ padding: isMobile ? '60px 22px 48px' : '104px 48px 64px', background: 'var(--yte-bg)' }}>
        <div className="csc-wrap" style={{ animation: 'cscFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 className="csc-h1" style={{ fontSize: H1, marginBottom: 22, maxWidth: 860, textWrap: 'balance' }}>
            Look up <em>any YouTube channel's</em> public stats.
          </h1>
          <p className="csc-lead" style={{ fontSize: isMobile ? 16 : 17.5, marginBottom: 28, maxWidth: 660, textWrap: 'pretty' }}>
            Paste a channel URL or @handle. Get subscribers, total views, upload cadence, channel age, and recent video performance in one shot.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, maxWidth: 660, flexDirection: isMobile ? 'column' : 'row' }}>
            <input
              type="text"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              placeholder="youtube.com/@channelname  or  @handle  or  UCxxxxx..."
              className="csc-input"
              autoFocus
            />
            <button type="submit" className="csc-btn" disabled={loading || !inputUrl.trim()}>
              {loading ? 'Looking up…' : 'Get stats'}
            </button>
          </form>

          {error && (
            <p style={{ fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-accent)', marginTop: 14, fontWeight: 500 }}>{error}</p>
          )}
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', marginTop: error ? 10 : 18, fontWeight: 600, letterSpacing: '0.04em' }}>
            No signup. No email. Free forever.
          </p>
        </div>
      </section>

      {/* ══ LOADING ══ */}
      {loading && (
        <section className="csc-section-pad" style={{ padding: '12px 48px 80px', background: 'var(--yte-bg)' }}>
          <div className="csc-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 30, height: 30, border: `2.5px solid var(--yte-line)`, borderTop: `2.5px solid var(--yte-accent)`, borderRadius: '50%', animation: 'cscSpin 0.7s linear infinite' }} />
            <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: 'var(--yte-soft)' }}>Pulling channel data from YouTube…</p>
          </div>
        </section>
      )}

      {/* ══ RESULTS ══ */}
      {ch && !loading && (
        <section ref={resultsRef} className="csc-section-pad" style={{ padding: isMobile ? '8px 22px 80px' : '12px 48px 96px', background: 'var(--yte-bg)' }}>
          <div className="csc-wrap">

            {/* Header card with channel identity */}
            <div style={{
              background: 'var(--yte-surface)', border: '1px solid var(--yte-line)',
              padding: isMobile ? 24 : 30, marginBottom: 12,
              display: 'flex', alignItems: 'center', gap: isMobile ? 18 : 24, flexWrap: 'wrap',
            }}>
              {ch.thumbnail
                ? <img src={ch.thumbnail} alt={ch.title} style={{ width: isMobile ? 72 : 88, height: isMobile ? 72 : 88, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} />
                : <div style={{ width: isMobile ? 72 : 88, height: isMobile ? 72 : 88, borderRadius: '50%', background: 'var(--yte-bg-2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 32, fontWeight: 400, color: 'var(--yte-soft)' }}>
                    {(ch.title || '?').charAt(0).toUpperCase()}
                  </div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? 24 : 30, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.4px', marginBottom: 6, lineHeight: 1.12 }}>{ch.title}</h2>
                <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-muted)', fontWeight: 500, marginBottom: 10 }}>
                  {ch.handle && <span>{ch.handle.startsWith('@') ? ch.handle : '@' + ch.handle}</span>}
                  {ch.handle && ch.country && <span> · </span>}
                  {ch.country && <span>{ch.country}</span>}
                  {(ch.handle || ch.country) && ch.published_at && <span> · </span>}
                  {ch.published_at && <span>{fmtChannelAge(ch.published_at)}</span>}
                </p>
                {ch.description && (
                  <p style={{ fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-soft)', lineHeight: 1.6, maxWidth: 720 }}>
                    {ch.description.length > 180 ? ch.description.slice(0, 180).trim() + '…' : ch.description}
                  </p>
                )}
              </div>
              <a
                href={`https://youtube.com/channel/${ch.id}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', fontFamily: SANS, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--yte-soft)', textDecoration: 'none', background: 'var(--yte-bg)', border: '1px solid var(--yte-line)', whiteSpace: 'nowrap' }}
              >
                Open on YouTube ↗
              </a>
            </div>

            {/* KPI tiles */}
            <div className="csc-stat-grid" style={{ marginBottom: 12 }}>
              <StatTile
                label="Subscribers"
                value={ch.subscriberHidden ? 'Hidden' : fmtNum(ch.subscribers)}
                sub={ch.subscriberHidden ? 'Channel hides its sub count' : 'Public count from YouTube'}
              />
              <StatTile
                label="Total views"
                value={fmtNum(ch.total_views)}
                sub="All-time across every video"
              />
              <StatTile
                label="Videos"
                value={fmtNum(ch.video_count)}
                sub={uploadsPerMonth != null ? `~${uploadsPerMonth} uploads / month recently` : 'Total uploads'}
              />
              <StatTile
                label="Avg views / video"
                value={fmtNum(avgViews)}
                sub={lastUploadAt ? `Last upload ${fmtPublished(lastUploadAt)}` : null}
              />
            </div>

            {/* Recent videos */}
            <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', marginBottom: 12 }}>
              <div style={{ padding: '20px 26px', borderBottom: '1px solid var(--yte-line)' }}>
                <h3 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px' }}>Recent uploads</h3>
                <p style={{ fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-muted)', fontWeight: 500, marginTop: 4 }}>
                  {videos.length ? `Latest ${videos.length} videos` : 'No recent uploads'}
                </p>
              </div>
              <div className="csc-video-grid">
                {videos.slice(0, 8).map(v => (
                  <a
                    key={v.id}
                    href={`https://youtube.com/watch?v=${v.id}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', gap: 12, padding: 14, background: 'var(--yte-surface)', textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--yte-bg-2)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--yte-surface)' }}
                  >
                    <div style={{ flexShrink: 0, position: 'relative', width: 144, aspectRatio: '16/9', background: '#0a0a0f', overflow: 'hidden' }}>
                      {v.thumbnail && <img src={v.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      {v.duration && (
                        <span style={{ position: 'absolute', bottom: 5, right: 5, fontFamily: SANS, fontSize: 10, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.78)', padding: '2px 6px', fontVariantNumeric: 'tabular-nums' }}>
                          {fmtDuration(v.duration)}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 500, color: 'var(--yte-ink)', letterSpacing: '-0.1px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 6 }}>{v.title}</p>
                      <p style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                        {fmtNum(v.views)} views · {fmtPublished(v.published_at)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Funnel CTA. Track this channel (dark editorial band) */}
            <div style={{ background: 'var(--yte-ink)', padding: isMobile ? 26 : 34, color: '#fff' }}>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 18 : 28 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>Want to track this channel?</p>
                  <h3 style={{ fontFamily: SERIF, fontSize: isMobile ? 24 : 28, fontWeight: 400, letterSpacing: '-0.4px', lineHeight: 1.18, marginBottom: 12, color: '#fff' }}>
                    Track {ch.title}'s every upload, title, and thumbnail
                  </h3>
                  <p style={{ fontFamily: SANS, fontSize: 14.5, color: 'rgba(255,255,255,0.68)', lineHeight: 1.65 }}>
                    Competitor Analysis tracks up to 10 channels weekly, surfaces their top-performing titles, finds content gaps in your niche, and emails you a digest. Free AI audit included.
                  </p>
                </div>
                <a href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 32px', background: 'var(--yte-accent)', color: '#fff', fontFamily: SANS, fontSize: 12.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Get started free →
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ BROWSE TOP CHANNELS ══
         Only renders when at least one category has data. Tabs filter to
         categories with non-empty rows so a click never lands on an empty
         tab. If the cache is fully empty, the entire section is hidden. */}
      {(() => {
        if (!topChannels) return null
        const filledCats = (topChannels.categories || []).filter(c => (topChannels.groups?.[c] || []).length > 0)
        if (filledCats.length === 0) return null
        const activeCat = filledCats.includes(topCat) ? topCat : filledCats[0]
        const cards = topChannels.groups[activeCat] || []
        return (
          <section className="csc-section-pad" style={{ padding: isMobile ? '64px 22px' : '88px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
            <div className="csc-wrap">
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
                <div style={{ maxWidth: 640 }}>
                  <Eyebrow>Browse</Eyebrow>
                  <h2 className="csc-h2" style={{ fontSize: H2, marginBottom: 12, textWrap: 'balance' }}>
                    Top channels in your <em>niche.</em>
                  </h2>
                  <p className="csc-lead" style={{ fontSize: 17 }}>
                    The actual top channels in each niche, ranked by live subscriber count from YouTube. Click any card to pull the full breakdown.
                  </p>
                </div>
                {topChannels.fetched_at && (() => {
                  const ago = Math.floor((Date.now() - new Date(topChannels.fetched_at).getTime()) / 1000)
                  let label
                  if (ago < 60)         label = 'just now'
                  else if (ago < 3600)  label = `${Math.floor(ago / 60)}m ago`
                  else if (ago < 86400) label = `${Math.floor(ago / 3600)}h ago`
                  else                  label = `${Math.floor(ago / 86400)}d ago`
                  return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: SANS, fontSize: 11.5, color: 'var(--yte-muted)', fontWeight: 600, background: 'var(--yte-bg)', border: '1px solid var(--yte-line)', padding: '6px 12px' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0f7a43', boxShadow: '0 0 0 3px rgba(15,122,67,0.18)' }} />
                      Updated {label}
                    </span>
                  )
                })()}
              </div>

              {/* Category tabs, only categories that have rows */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {filledCats.map(cat => (
                  <button key={cat} onClick={() => setTopCat(cat)} className={`csc-tab${cat === activeCat ? ' active' : ''}`}>{cat}</button>
                ))}
              </div>

              {/* Channel cards grid. Rank badge in the top-left corner makes
                 the leaderboard order obvious at a glance. */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: 10 }}>
                {cards.map((c) => {
                  const isTop3 = c.rank <= 3
                  return (
                    <button key={c.channel_id} onClick={() => loadTopChannel(c.handle)} style={{
                      position: 'relative',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 10, padding: '22px 14px 18px',
                      background: 'var(--yte-surface)', border: '1px solid var(--yte-line)',
                      cursor: 'pointer', fontFamily: SANS, textAlign: 'center',
                      transition: 'background 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--yte-bg-2)'; e.currentTarget.style.borderColor = 'var(--yte-line-2)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--yte-surface)'; e.currentTarget.style.borderColor = 'var(--yte-line)' }}
                    >
                      {/* Rank badge */}
                      <span style={{
                        position: 'absolute', top: 10, left: 10,
                        fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.02em',
                        fontVariantNumeric: 'tabular-nums',
                        padding: '2px 7px',
                        color: isTop3 ? '#fff' : 'var(--yte-muted)',
                        background: isTop3 ? 'var(--yte-ink)' : 'var(--yte-bg-2)',
                      }}>#{c.rank}</span>

                      {c.thumbnail
                        ? <img src={c.thumbnail} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginTop: 6 }} />
                        : <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--yte-bg-2)', flexShrink: 0, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: 'var(--yte-soft)' }}>{(c.title || '?').charAt(0).toUpperCase()}</div>
                      }
                      <div style={{ minWidth: 0, width: '100%' }}>
                        <p style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: 'var(--yte-ink)', letterSpacing: '-0.1px', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{c.title}</p>
                        <p style={{ fontFamily: SANS, fontSize: 11.5, color: 'var(--yte-muted)', fontWeight: 600, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.1px' }}>
                          {c.subscribers >= 1e6 ? (c.subscribers / 1e6).toFixed(1) + 'M' : c.subscribers >= 1e3 ? (c.subscribers / 1e3).toFixed(1) + 'K' : c.subscribers} subscribers
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })()}

      {/* ══ HOW IT WORKS ══ */}
      <section className="csc-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="csc-wrap">
          <div style={{ marginBottom: 40, maxWidth: 720 }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="csc-h2" style={{ fontSize: H2, textWrap: 'balance' }}>
              Powered by YouTube's <em>own data API.</em>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {HOW_IT_WORKS.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 10 : 48, padding: '26px 0', borderTop: i === 0 ? 'none' : '1px solid var(--yte-line)' }}>
                <h3 style={{ fontFamily: SERIF, fontSize: isMobile ? 21 : 23, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', lineHeight: 1.2 }}>{row.h}</h3>
                <p style={{ fontFamily: SANS, fontSize: isMobile ? 15 : 16, color: 'var(--yte-soft)', lineHeight: 1.72 }}>{row.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW TO GROW ══ */}
      <section className="csc-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="csc-wrap">
          <div style={{ marginBottom: 32, maxWidth: 720 }}>
            <Eyebrow>Beyond a one-shot lookup</Eyebrow>
            <h2 className="csc-h2" style={{ fontSize: H2, marginBottom: 12, textWrap: 'balance' }}>
              Researching one channel is good. <em>Tracking your niche is better.</em>
            </h2>
            <p className="csc-lead" style={{ fontSize: 17 }}>
              A single lookup is a moment. Real growth comes from watching your competitive landscape over time and adjusting before the gap widens.
            </p>
          </div>

          <div className="csc-grow-grid">
            {GROW.map((card, i) => (
              <a key={i} href={card.href} className="csc-grow-card">
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>{card.label}</div>
                <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', marginBottom: 12, lineHeight: 1.2 }}>{card.title}</h3>
                <p style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.65 }}>{card.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div className="csc-section-pad" style={{ background: 'var(--yte-bg)', padding: isMobile ? '60px 22px' : '104px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 36 : 80, alignItems: 'start' }}>

          <div>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="csc-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>Stats, <em>answered.</em></h2>
            <p className="csc-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              Everything creators ask about looking up channel stats. Still unsure? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--yte-line)' }}>
            {FAQS.map((item, i) => {
              const isOpen = openFaq === i
              return (
                <div key={i} style={{ borderBottom: '1px solid var(--yte-line)' }}>
                  <div
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenFaq(isOpen ? null : i) } }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, padding: isMobile ? '20px 0' : '24px 0', cursor: 'pointer', userSelect: 'none' }}
                  >
                    <span style={{ flex: 1, fontFamily: SERIF, fontSize: isMobile ? 18 : 20, fontWeight: 400, color: isOpen ? 'var(--yte-accent)' : 'var(--yte-ink)', lineHeight: 1.3, letterSpacing: '-0.2px', transition: 'color 0.2s' }}>{item.q}</span>
                    <span aria-hidden="true" style={{ flexShrink: 0, fontFamily: SANS, fontSize: 26, fontWeight: 300, color: 'var(--yte-accent)', lineHeight: 1, transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                  </div>
                  <div className={`csc-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="csc-faq-answer-inner">
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

      <LandingFooter />
    </div>
  )
}
