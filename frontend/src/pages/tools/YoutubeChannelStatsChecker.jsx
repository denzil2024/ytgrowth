import { useEffect, useState, useRef } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free SEO tool: YouTube Channel Stats Checker ────────────────────────
   /tools/youtube-channel-stats-checker. Targets "youtube channel stats",
   "youtube subscriber count", "social blade alternative" search queries.
   Calls a small backend route that proxies the YouTube Data API v3.
   No Anthropic credits. Quota is the daily YouTube API quota (10k units),
   responses cached server-side for an hour. */

function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return { isMobile: width <= 768, isTablet: width <= 1024 }
}

function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="#ff3b30"/>
      <path d="M23.2 11.6a2.1 2.1 0 0 0-1.48-1.48C20.55 9.8 16 9.8 16 9.8s-4.55 0-5.72.32A2.1 2.1 0 0 0 8.8 11.6 22 22 0 0 0 8.5 16a22 22 0 0 0 .3 4.4 2.1 2.1 0 0 0 1.48 1.48C11.45 22.2 16 22.2 16 22.2s4.55 0 5.72-.32a2.1 2.1 0 0 0 1.48-1.48A22 22 0 0 0 23.5 16a22 22 0 0 0-.3-4.4z" fill="white"/>
      <polygon points="13.5,19 19.5,16 13.5,13" fill="#ff3b30"/>
    </svg>
  )
}

function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-csc-styles')) return
    const link = document.createElement('link')
    link.id  = 'ytg-csc-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytg-csc-styles'
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
        --ytg-border-2:     rgba(10,10,15,0.16);
        --ytg-accent:       #e5302a;
        --ytg-accent-text:  #c22b25;
        --ytg-accent-light: rgba(229,48,42,0.07);
        --ytg-shadow-sm:    0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
        --ytg-shadow:       0 2px 6px rgba(0,0,0,0.08), 0 10px 32px rgba(0,0,0,0.11);
        --ytg-shadow-lg:    0 4px 16px rgba(0,0,0,0.11), 0 24px 60px rgba(0,0,0,0.14);
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden;  scrollbar-width: auto; scrollbar-color: rgba(10,10,15,0.28) transparent; }
      ::-webkit-scrollbar { width: 12px; height: 12px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb {
        background-color: rgba(10,10,15,0.28);
        border-radius: 10px;
        border: 3px solid transparent;
        background-clip: content-box;
      }
      ::-webkit-scrollbar-thumb:hover { background-color: rgba(10,10,15,0.48); background-clip: content-box; }

      @keyframes cscFadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
      @keyframes cscSpin { to { transform: rotate(360deg) } }

      .csc-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
        padding: 14px 28px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
        white-space: nowrap;
      }
      .csc-btn:hover:not(:disabled) {
        filter: brightness(1.07); transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,48,42,0.42);
      }
      .csc-btn-lg { font-size: 16px; padding: 17px 36px; }
      .csc-btn:disabled { opacity: 0.55; cursor: not-allowed; }

      .csc-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        background: #ffffff;
        border: 1px solid rgba(10,10,15,0.09);
        border-radius: 100px;
        padding: 5px 12px 5px 10px;
        margin-bottom: 20px;
        box-shadow: 0 1px 2px rgba(10,10,15,0.04);
      }
      .csc-eyebrow-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--ytg-accent);
        box-shadow: 0 0 0 3px rgba(229,48,42,0.12);
      }
      .csc-eyebrow-text {
        font-size: 11px; font-weight: 700; color: var(--ytg-text-2);
        text-transform: uppercase; letter-spacing: 0.09em;
      }

      .csc-nav-link {
        font-size: 15px; color: rgba(10,10,15,0.52); font-weight: 500;
        text-decoration: none; transition: color 0.15s; letter-spacing: -0.1px;
      }
      .csc-nav-link:hover { color: rgba(10,10,15,0.88); }

      .csc-input {
        width: 100%; padding: 16px 18px;
        font-size: 15px; font-weight: 500; font-family: inherit;
        color: var(--ytg-text);
        background: #ffffff; border: 1px solid var(--ytg-border);
        border-radius: 14px; outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .csc-input:focus {
        border-color: rgba(229,48,42,0.45);
        box-shadow: 0 0 0 4px rgba(229,48,42,0.10);
      }
      .csc-input::placeholder { color: var(--ytg-text-3); }

      .csc-faq-answer {
        display: grid; grid-template-rows: 0fr; opacity: 0;
        transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
      }
      .csc-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .csc-faq-answer-inner { overflow: hidden; }

      .csc-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
      .csc-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
      .csc-video-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }

      @media (max-width: 1024px) { .csc-stat-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 900px) {
        .csc-grid-3 { grid-template-columns: 1fr; }
        .csc-video-grid { grid-template-columns: 1fr; }
      }
      @media (max-width: 768px) {
        .csc-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .csc-cta-pad { padding: 70px 24px !important; }
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

/* ── Eyebrow ───────────────────────────────────────────────────────────── */
function Eyebrow({ children }) {
  return (
    <div className="csc-eyebrow">
      <span aria-hidden="true" className="csc-eyebrow-dot" />
      <span className="csc-eyebrow-text">{children}</span>
    </div>
  )
}

/* ── Stat tile ─────────────────────────────────────────────────────────── */
function StatTile({ label, value, sub }) {
  return (
    <div style={{
      background: 'linear-gradient(165deg, #ffffff 0%, #fafafd 60%, #f6f5fa 100%)',
      border: '1px solid var(--ytg-border)',
      borderRadius: 18,
      padding: '20px 22px',
      position: 'relative', overflow: 'hidden',
      boxShadow: 'var(--ytg-shadow-sm)',
    }}>
      <div aria-hidden="true" style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,37,27,0.10) 0%, rgba(229,37,27,0.04) 40%, transparent 70%)', pointerEvents: 'none' }} />
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ytg-text-3)', marginBottom: 12, position: 'relative' }}>{label}</p>
      <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 30, fontWeight: 800, letterSpacing: '-1.2px', color: 'var(--ytg-text)', lineHeight: 1, position: 'relative' }}>{value}</p>
      {sub && <p style={{ fontSize: 13, color: 'var(--ytg-text-2)', fontWeight: 500, marginTop: 10, lineHeight: 1.5, position: 'relative' }}>{sub}</p>}
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

  /* Top-channels browser — fetches the daily-refreshed cache once on
     mount. Shows category tabs + 5-column card grid. Click a card to
     load that channel via the existing lookup flow. */
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

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', overflowX: 'hidden' }}>

      {/* ── NAV — shared SiteHeader ── */}
      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO + INPUT ══ */}
      <section className="csc-section-pad" style={{ position: 'relative', padding: isMobile ? '64px 24px 56px' : '110px 48px 84px', textAlign: 'center', background: '#ffffff', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120vw', maxWidth: 1400, height: 620, background: 'radial-gradient(ellipse at center top, rgba(229,48,42,0.07) 0%, rgba(229,48,42,0.02) 40%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'cscFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 34 : isTablet ? 56 : 64, lineHeight: isMobile ? 1.1 : 1.04, letterSpacing: isMobile ? '-0.6px' : '-2.2px', color: 'var(--ytg-text)', marginBottom: 22, textWrap: 'balance' }}>
            Look up <span style={{ color: 'var(--ytg-accent)' }}>any YouTube channel's</span> public stats.
          </h1>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 32px', textWrap: 'pretty' }}>
            Paste a channel URL or @handle. Get subscribers, total views, upload cadence, channel age, and recent video performance in one shot.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, maxWidth: 660, margin: '0 auto', flexDirection: isMobile ? 'column' : 'row' }}>
            <input
              type="text"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              placeholder="youtube.com/@channelname  or  @handle  or  UCxxxxx..."
              className="csc-input"
              autoFocus
            />
            <button type="submit" className="csc-btn" disabled={loading || !inputUrl.trim()} style={{ padding: '14px 28px', whiteSpace: 'nowrap' }}>
              {loading ? 'Looking up…' : 'Get stats'}
            </button>
          </form>

          {error && (
            <p style={{ fontSize: 13.5, color: 'var(--ytg-accent)', marginTop: 14, fontWeight: 500 }}>{error}</p>
          )}
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', marginTop: error ? 10 : 18, fontWeight: 500 }}>
            No signup. No email. Free forever.
          </p>
        </div>
      </section>

      {/* ══ LOADING ══ */}
      {loading && (
        <section className="csc-section-pad" style={{ padding: '40px 24px 80px', background: 'var(--ytg-bg)' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 30, height: 30, border: `2.5px solid var(--ytg-border)`, borderTop: `2.5px solid var(--ytg-accent)`, borderRadius: '50%', animation: 'cscSpin 0.7s linear infinite' }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--ytg-text-2)' }}>Pulling channel data from YouTube…</p>
          </div>
        </section>
      )}

      {/* ══ RESULTS ══ */}
      {ch && !loading && (
        <section ref={resultsRef} className="csc-section-pad" style={{ padding: isMobile ? '32px 20px 80px' : '48px 48px 110px', background: 'var(--ytg-bg)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>

            {/* Header card with channel identity */}
            <div style={{
              background: '#ffffff', border: '1px solid var(--ytg-border)', borderRadius: 22,
              boxShadow: 'var(--ytg-shadow-lg)', padding: isMobile ? 24 : 32, marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: isMobile ? 18 : 24, flexWrap: 'wrap',
            }}>
              {ch.thumbnail
                ? <img src={ch.thumbnail} alt={ch.title} style={{ width: isMobile ? 72 : 88, height: isMobile ? 72 : 88, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} />
                : <div style={{ width: isMobile ? 72 : 88, height: isMobile ? 72 : 88, borderRadius: '50%', background: '#f0f0f4', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: 'var(--ytg-text-2)' }}>
                    {(ch.title || '?').charAt(0).toUpperCase()}
                  </div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 22 : 28, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.7px', marginBottom: 6, lineHeight: 1.15 }}>{ch.title}</h2>
                <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', fontWeight: 500, marginBottom: 10 }}>
                  {ch.handle && <span>{ch.handle.startsWith('@') ? ch.handle : '@' + ch.handle}</span>}
                  {ch.handle && ch.country && <span> · </span>}
                  {ch.country && <span>{ch.country}</span>}
                  {(ch.handle || ch.country) && ch.published_at && <span> · </span>}
                  {ch.published_at && <span>{fmtChannelAge(ch.published_at)}</span>}
                </p>
                {ch.description && (
                  <p style={{ fontSize: 13.5, color: 'var(--ytg-text-2)', lineHeight: 1.6, maxWidth: 720 }}>
                    {ch.description.length > 180 ? ch.description.slice(0, 180).trim() + '…' : ch.description}
                  </p>
                )}
              </div>
              <a
                href={`https://youtube.com/channel/${ch.id}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 12.5, fontWeight: 600, color: 'var(--ytg-text-2)', textDecoration: 'none', background: '#fafafb', border: '1px solid var(--ytg-border)', borderRadius: 100, whiteSpace: 'nowrap' }}
              >
                Open on YouTube ↗
              </a>
            </div>

            {/* KPI tiles */}
            <div className="csc-stat-grid" style={{ marginBottom: 24 }}>
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
            <div style={{ background: '#ffffff', border: '1px solid var(--ytg-border)', borderRadius: 22, boxShadow: 'var(--ytg-shadow)', overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ padding: '20px 26px', borderBottom: '1px solid var(--ytg-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg, #ffffff 0%, #fafafc 100%)' }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.4px' }}>Recent uploads</h3>
                  <p style={{ fontSize: 13.5, color: 'var(--ytg-text-2)', fontWeight: 500, marginTop: 4 }}>
                    {videos.length ? `Latest ${videos.length} videos` : 'No recent uploads'}
                  </p>
                </div>
              </div>
              <div className="csc-video-grid" style={{ padding: 16 }}>
                {videos.slice(0, 8).map(v => (
                  <a
                    key={v.id}
                    href={`https://youtube.com/watch?v=${v.id}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', gap: 12, padding: 10, borderRadius: 12, background: '#fafafb', border: '1px solid var(--ytg-border)', textDecoration: 'none', transition: 'background 0.15s, border-color 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f4f4f8'; e.currentTarget.style.borderColor = 'rgba(10,10,15,0.18)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fafafb'; e.currentTarget.style.borderColor = 'var(--ytg-border)' }}
                  >
                    <div style={{ flexShrink: 0, position: 'relative', width: 144, aspectRatio: '16/9', background: '#0a0a0f', borderRadius: 8, overflow: 'hidden' }}>
                      {v.thumbnail && <img src={v.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      {v.duration && (
                        <span style={{ position: 'absolute', bottom: 5, right: 5, fontSize: 10, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.78)', padding: '2px 6px', borderRadius: 4, fontVariantNumeric: 'tabular-nums' }}>
                          {fmtDuration(v.duration)}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ytg-text)', letterSpacing: '-0.15px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 6 }}>{v.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--ytg-text-3)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                        {fmtNum(v.views)} views · {fmtPublished(v.published_at)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Funnel CTA. Track this channel */}
            <div style={{ background: 'linear-gradient(160deg, #ff3b30 0%, #e5251b 45%, #a50f07 100%)', borderRadius: 22, padding: isMobile ? 24 : 32, color: '#ffffff', boxShadow: '0 4px 18px rgba(229,37,27,0.32), 0 24px 60px rgba(229,37,27,0.18)', position: 'relative', overflow: 'hidden' }}>
              <div aria-hidden="true" style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 50%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 18 : 24 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.78)', marginBottom: 10 }}>Want to track this channel?</p>
                  <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 22 : 26, fontWeight: 800, letterSpacing: '-0.7px', lineHeight: 1.2, marginBottom: 10 }}>
                    Track {ch.title}'s every upload, title, and thumbnail
                  </h3>
                  <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.88)', lineHeight: 1.6 }}>
                    Competitor Analysis tracks up to 10 channels weekly, surfaces their top-performing titles, finds content gaps in your niche, and emails you a digest. Free AI audit included.
                  </p>
                </div>
                <a href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 28px', borderRadius: 100, background: '#ffffff', color: 'var(--ytg-accent)', fontSize: 14, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 8px 22px rgba(0,0,0,0.18)' }}>
                  Get started free →
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ BROWSE TOP CHANNELS ══ */}
      {topChannels && (topChannels.groups?.[topCat]?.length > 0) && (
        <section className="csc-section-pad" style={{ padding: isMobile ? '64px 20px 80px' : '88px 48px 110px', background: '#ffffff', borderTop: '1px solid var(--ytg-border)' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
              <div>
                <Eyebrow>Browse</Eyebrow>
                <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 30 : 42, letterSpacing: '-1.4px', color: 'var(--ytg-text)', lineHeight: 1.08, marginBottom: 10, textWrap: 'balance' }}>
                  Top channels in your <span style={{ color: 'var(--ytg-accent)' }}>niche.</span>
                </h2>
                <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.6, maxWidth: 620 }}>
                  Click any channel to pull their full stats. Refreshed daily from the YouTube Data API.
                </p>
              </div>
              {topChannels.fetched_at && (
                <span style={{ fontSize: 12, color: 'var(--ytg-text-3)', fontWeight: 500 }}>
                  Updated {new Date(topChannels.fetched_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>

            {/* Category tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {(topChannels.categories || []).filter(c => (topChannels.groups?.[c] || []).length > 0).map(cat => {
                const isActive = cat === topCat
                return (
                  <button key={cat} onClick={() => setTopCat(cat)} style={{
                    padding: '8px 16px', borderRadius: 100, border: '1.5px solid',
                    borderColor: isActive ? 'var(--ytg-accent)' : 'var(--ytg-border)',
                    background: isActive ? 'var(--ytg-accent)' : '#fff',
                    color: isActive ? '#fff' : 'var(--ytg-text-2)',
                    fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                    letterSpacing: '-0.1px', textTransform: 'capitalize',
                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.10), 0 4px 12px rgba(229,48,42,0.28)' : 'none',
                    transition: 'all 0.15s',
                  }}>{cat}</button>
                )
              })}
            </div>

            {/* Channel cards grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12 }}>
              {(topChannels.groups[topCat] || []).map((c) => (
                <button key={c.channel_id} onClick={() => loadTopChannel(c.handle)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                  background: '#fff', border: '1px solid var(--ytg-border)', borderRadius: 14,
                  boxShadow: 'var(--ytg-shadow-sm)',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow)'; e.currentTarget.style.borderColor = 'rgba(229,48,42,0.30)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow-sm)'; e.currentTarget.style.borderColor = 'var(--ytg-border)' }}
                >
                  {c.thumbnail
                    ? <img src={c.thumbnail} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    : <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f0f0f4', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: 'var(--ytg-text-2)' }}>{(c.title || '?').charAt(0).toUpperCase()}</div>
                  }
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.2px', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{c.title}</p>
                    <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                      {c.subscribers >= 1e6 ? (c.subscribers / 1e6).toFixed(1) + 'M' : c.subscribers >= 1e3 ? (c.subscribers / 1e3).toFixed(1) + 'K' : c.subscribers} subs
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ HOW IT WORKS ══ */}
      <section className="csc-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, maxWidth: 720 }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, textWrap: 'balance' }}>
              Powered by YouTube's <span style={{ color: 'var(--ytg-accent)' }}>own data API.</span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {[
              { h: 'Direct from YouTube, not scraped',
                p: "We hit YouTube Data API v3 with your channel URL or handle. Same source YouTube Studio uses for analytics, but limited to fields YouTube exposes publicly. No scraping, no third-party hacks, no broken results when YouTube redesigns their pages." },
              { h: 'What you get in the lookup',
                p: "Subscriber count (unless the channel has hidden it), total channel views, total video count, channel creation date, upload cadence inferred from recent videos, and the latest 8 uploads with view counts and durations. Enough to size up any channel in 5 seconds." },
              { h: 'Why creators study other creators',
                p: "Niche research. Before you commit to a content angle, you want to know what's working in your category. Looking up 10 channels in your niche tells you average upload cadence, video lengths that work, content patterns. Cheaper than guessing." },
              { h: 'Use it ethically',
                p: "Public stats are public. Use lookups to research competitors, study creators you admire, or vet potential collaborators. Don't use lookup data to harass or impersonate anyone. The API doesn't expose anything private and we wouldn't surface it if it did." },
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', gap: isMobile ? 12 : 56, paddingTop: i === 0 ? 0 : 28, borderTop: i === 0 ? 'none' : '1px solid var(--ytg-border)' }}>
                <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 20 : 22, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.5px', lineHeight: 1.25 }}>{row.h}</h3>
                <p style={{ fontSize: 15.5, color: 'var(--ytg-text-2)', lineHeight: 1.75 }}>{row.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW TO GROW ══ */}
      <section className="csc-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ marginBottom: 44, textAlign: 'center', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            <Eyebrow>Beyond a one-shot lookup</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
              Researching one channel is good. <span style={{ color: 'var(--ytg-accent)' }}>Tracking your niche is better.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>
              A single lookup is a moment. Real growth comes from watching your competitive landscape over time and adjusting before the gap widens.
            </p>
          </div>

          <div className="csc-grid-3">
            {[
              { label: 'Competitor Analysis', title: 'Track 10 channels weekly',
                body: 'Pick the channels in your niche, get a weekly email digest of every new upload, top-performing title, and content gap. The data this lookup gives you, on autopilot.',
                href: '/features/competitor-analysis' },
              { label: 'AI Channel Audit', title: 'Audit your own channel',
                body: 'Run YTGrowth on your channel and get a 10-dimension AI audit. Know exactly which of your videos are SEO-underperformers and where you are losing the click war.',
                href: '/features/channel-audit' },
              { label: 'Outliers', title: 'Find what is going viral now',
                body: 'See videos in your niche that are dramatically over-performing their channel\'s baseline. Outliers shows you the breakouts before they go mainstream.',
                href: '/features/outliers' },
            ].map((card, i) => (
              <a key={i} href={card.href}
                style={{ display: 'block', background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 22, padding: 30, boxShadow: 'var(--ytg-shadow-sm)', textDecoration: 'none', transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow)'; e.currentTarget.style.borderColor = 'var(--ytg-border-2)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow-sm)'; e.currentTarget.style.borderColor = 'var(--ytg-border)' }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>{card.label}</p>
                <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.4px', marginBottom: 12, lineHeight: 1.25 }}>{card.title}</h3>
                <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.65 }}>{card.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DARK CTA ══ */}
      <section className="csc-section-pad csc-cta-pad" style={{ padding: isMobile ? '88px 24px' : '120px 48px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', width: 1000, height: isMobile ? 600 : 800, background: 'radial-gradient(ellipse, rgba(229,48,42,0.20) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '5px 12px 5px 10px', marginBottom: 22 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 0 3px rgba(229,48,42,0.18)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Free AI audit</span>
          </div>
          <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: '#ffffff', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
            Stop researching. <span style={{ color: '#ff3b30' }}>Start growing.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, marginBottom: 32, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Connect your channel for a free AI audit. Get a real prioritized growth plan, not just stats.
          </p>
          <a href="/auth/login" className="csc-btn csc-btn-lg">Get my free audit →</a>
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
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.05, marginBottom: 14, textWrap: 'balance' }}>
              Questions <span style={{ color: 'var(--ytg-accent)' }}>answered.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.7, margin: 0, maxWidth: isMobile ? 520 : 320, marginLeft: isMobile ? 'auto' : 0, marginRight: isMobile ? 'auto' : 0 }}>
              Everything creators ask about looking up channel stats. Still unsure? <a href="/contact" style={{ color: 'var(--ytg-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
            </p>
          </div>

          <div style={{ borderTop: '1px solid rgba(10,10,15,0.10)' }}>
            {FAQS.map((item, i) => {
              const isOpen = openFaq === i
              const num = String(i + 1).padStart(2, '0')
              return (
                <div key={i} style={{ borderBottom: '1px solid rgba(10,10,15,0.10)', position: 'relative' }}>
                  {isOpen && <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 2, background: 'var(--ytg-accent)', borderRadius: 2 }} />}
                  <div
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenFaq(isOpen ? null : i) } }}
                    style={{
                      display: 'flex', alignItems: 'flex-start',
                      gap: isMobile ? 14 : 20,
                      padding: isMobile ? '20px 0' : '24px 0',
                      paddingLeft: isOpen ? (isMobile ? 16 : 22) : 0,
                      cursor: 'pointer', transition: 'padding-left 0.25s ease', userSelect: 'none',
                    }}
                  >
                    <span style={{
                      fontSize: isMobile ? 12 : 13, fontWeight: 700,
                      color: isOpen ? 'var(--ytg-accent)' : 'var(--ytg-text-3)',
                      fontVariantNumeric: 'tabular-nums', lineHeight: 1.5, flexShrink: 0,
                      width: isMobile ? 22 : 28, paddingTop: 2, transition: 'color 0.2s',
                    }}>{num}</span>
                    <span style={{
                      flex: 1, fontSize: isMobile ? 15 : 16, fontWeight: 600,
                      color: 'var(--ytg-text)', lineHeight: 1.45, letterSpacing: '-0.2px',
                    }}>{item.q}</span>
                    <span aria-hidden="true" style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isOpen ? 'var(--ytg-accent)' : 'rgba(10,10,15,0.05)',
                      border: `1px solid ${isOpen ? 'var(--ytg-accent)' : 'rgba(10,10,15,0.10)'}`,
                      transition: 'background 0.2s, border-color 0.2s', marginTop: 1,
                    }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 5h8" stroke={isOpen ? '#ffffff' : 'var(--ytg-text-2)'} strokeWidth="1.8" strokeLinecap="round" />
                        {!isOpen && <path d="M5 1v8" stroke="var(--ytg-text-2)" strokeWidth="1.8" strokeLinecap="round" />}
                      </svg>
                    </span>
                  </div>
                  <div className={`csc-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="csc-faq-answer-inner">
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

      <LandingFooter />
    </div>
  )
}
