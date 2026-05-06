import { useEffect, useState, useMemo, useRef } from 'react'
import LandingFooter from '../../components/LandingFooter'

/* ─── Free SEO tool: YouTube Thumbnail Downloader ─────────────────────────
   /tools/youtube-thumbnail-downloader. Targets the "youtube thumbnail
   downloader" search keyword (very high volume, tool-intent).
   Visual DNA = Landing.jsx + YoutubeMoneyCalculator.jsx parity. DM Sans
   for headlines, Inter for body, eyebrow pills (dot + text), Landing's
   FAQ pattern. No design drift.
   100% client-side. No backend, no API call, no Anthropic credits. */

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
    if (document.getElementById('ytg-ytd-styles')) return
    const link = document.createElement('link')
    link.id = 'ytg-ytd-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytg-ytd-styles'
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
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 5px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background: rgba(10,10,15,0.16); border-radius: 10px }

      @keyframes ytdFadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .ytd-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
        padding: 14px 28px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
        white-space: nowrap;
      }
      .ytd-btn:hover {
        filter: brightness(1.07); transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,48,42,0.42);
      }
      .ytd-btn-lg { font-size: 16px; padding: 17px 36px; }
      .ytd-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; filter: none !important; }

      .ytd-btn-ghost {
        display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        background: transparent; color: var(--ytg-text-2);
        font-size: 13px; font-weight: 600; font-family: 'Inter', system-ui, sans-serif;
        padding: 9px 16px; border-radius: 100px;
        border: 1px solid var(--ytg-border);
        cursor: pointer; text-decoration: none; letter-spacing: -0.1px;
        transition: color 0.15s, border-color 0.15s, background 0.15s;
      }
      .ytd-btn-ghost:hover {
        color: var(--ytg-text); border-color: var(--ytg-border-2);
        background: rgba(10,10,15,0.03);
      }

      .ytd-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        background: #ffffff;
        border: 1px solid rgba(10,10,15,0.09);
        border-radius: 100px;
        padding: 5px 12px 5px 10px;
        margin-bottom: 20px;
        box-shadow: 0 1px 2px rgba(10,10,15,0.04);
      }
      .ytd-eyebrow-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--ytg-accent);
        box-shadow: 0 0 0 3px rgba(229,48,42,0.12);
      }
      .ytd-eyebrow-text {
        font-size: 11px; font-weight: 700; color: var(--ytg-text-2);
        text-transform: uppercase; letter-spacing: 0.09em;
      }

      .ytd-nav-link {
        font-size: 15px; color: rgba(10,10,15,0.52); font-weight: 500;
        text-decoration: none; transition: color 0.15s; letter-spacing: -0.1px;
      }
      .ytd-nav-link:hover { color: rgba(10,10,15,0.88); }

      .ytd-input {
        width: 100%; padding: 16px 18px;
        font-size: 15px; font-weight: 500; font-family: inherit;
        color: var(--ytg-text);
        background: #ffffff; border: 1px solid var(--ytg-border);
        border-radius: 14px; outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .ytd-input:focus {
        border-color: rgba(229,48,42,0.45);
        box-shadow: 0 0 0 4px rgba(229,48,42,0.10);
      }
      .ytd-input::placeholder { color: var(--ytg-text-3); }

      .ytd-faq-answer {
        display: grid; grid-template-rows: 0fr; opacity: 0;
        transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
      }
      .ytd-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .ytd-faq-answer-inner { overflow: hidden; }

      .ytd-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
      .ytd-thumb-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }

      @media (max-width: 900px) {
        .ytd-grid-3 { grid-template-columns: 1fr; }
        .ytd-thumb-grid { grid-template-columns: 1fr; }
      }
      @media (max-width: 768px) {
        .ytd-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .ytd-cta-pad { padding: 70px 24px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

/* ── Sizes ──────────────────────────────────────────────────────────────── */
const SIZES = [
  { key: 'maxresdefault', label: 'HD',     dims: '1280 × 720',  filename: 'maxresdefault.jpg' },
  { key: 'sddefault',     label: 'SD',     dims: '640 × 480',   filename: 'sddefault.jpg' },
  { key: 'hqdefault',     label: 'High',   dims: '480 × 360',   filename: 'hqdefault.jpg' },
  { key: 'mqdefault',     label: 'Medium', dims: '320 × 180',   filename: 'mqdefault.jpg' },
]

/* ── Video ID extraction ────────────────────────────────────────────────── */
// Handles: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID,
// youtube.com/embed/ID, youtube.com/v/ID, raw 11-char ID
function extractVideoId(input) {
  if (!input) return null
  const trimmed = input.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed

  const patterns = [
    /(?:v=|\/)([a-zA-Z0-9_-]{11})(?:[?&#/]|$)/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const re of patterns) {
    const m = trimmed.match(re)
    if (m) return m[1]
  }
  return null
}

/* ── FAQ data ───────────────────────────────────────────────────────────── */
const FAQS = [
  { q: 'How does this YouTube thumbnail downloader work?',
    a: "Every YouTube video has its thumbnail hosted on a public Google CDN at predictable URLs (img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg, hqdefault.jpg, etc.). When you paste a video URL, this tool extracts the 11-character video ID and shows you the four standard thumbnail resolutions Google exposes. Nothing happens server-side. Your browser fetches the images directly from YouTube's CDN. No middleman, no signup, no rate limits." },
  { q: 'Is this thumbnail downloader free? Will you sell my data?',
    a: "Yes, free forever. And no data leaves your browser. The video URL you paste is never sent to our server because it doesn't need to be: thumbnail extraction is pure client-side string manipulation. We don't log video IDs, we don't track which thumbnails you view, and we don't require an email or account." },
  { q: 'Are YouTube thumbnails copyrighted? Can I use them legally?',
    a: "YouTube thumbnails are owned by the creator who uploaded them. Downloading a thumbnail for personal study, internal moodboards, or fair-use commentary (reaction videos, criticism, news reporting) is generally fine. Using someone else's thumbnail in your own video, blog, or commercial material without permission can be copyright infringement. If you're not the original creator and you intend to publish or monetize, get permission, or use it under a clear fair-use rationale." },
  { q: 'Why is the HD (1280×720) thumbnail not available for some videos?',
    a: "Google only generates the maxresdefault.jpg (1280×720) version for videos uploaded at HD or higher resolution. Older videos, low-resolution uploads, and most YouTube Shorts only have the smaller variants. If maxres doesn't load, the next best is the High resolution version (480×360, hqdefault.jpg), which is generated for every video on the platform." },
  { q: 'Can I download a YouTube Shorts thumbnail?',
    a: "Yes. Paste the Shorts URL (youtube.com/shorts/VIDEO_ID) the same way you'd paste a regular video URL. The tool extracts the same 11-character video ID and pulls the available thumbnails. Note that most Shorts only have the lower resolution variants, since they're recorded vertically in 1080×1920 and Google generates the standard horizontal thumbnail crops automatically." },
  { q: "Can I download the thumbnail from a private or unlisted video?",
    a: 'For unlisted videos, yes, as long as you have the URL the thumbnail is accessible the same way as a public video. For private videos, no. Private video thumbnails are gated behind YouTube authentication and are not exposed on the public CDN. This tool only fetches thumbnails that YouTube already serves publicly.' },
  { q: 'What format are the downloaded thumbnails in?',
    a: 'JPEG. Every YouTube thumbnail is served as .jpg, encoded in standard sRGB at quality settings Google chooses. There is no PNG or WebP option. If you need a transparent or higher-fidelity version for graphic design work, the .jpg is your starting point and you would need to manually edit it.' },
  { q: 'Why does my downloaded thumbnail show a "play button" placeholder image?',
    a: 'YouTube returns a default placeholder image (a film strip with a generic icon) when the requested resolution does not exist for that video. This happens most often with the maxresdefault.jpg on older or non-HD videos. If you see a placeholder instead of the real thumbnail, drop down to the High (480×360) or Medium (320×180) version. Those are generated for every video.' },
  { q: 'Can I use this to extract a thumbnail from a video that was deleted?',
    a: "If the video was permanently deleted from YouTube, no. The video ID stops resolving and Google removes the thumbnail from the CDN. If the video was just made private (the creator hid it but didn't delete it), the thumbnail may still be available for a window of time, but it is not reliable. The best practice is to download thumbnails you care about while the video is still live." },
  { q: 'Is this different from just right-clicking the thumbnail on YouTube?',
    a: "Yes. Right-clicking on YouTube's video page often saves a low-resolution preview (the small thumbnail used in the watch page UI), not the full HD source. This tool fetches the actual maxresdefault.jpg directly from Google's CDN, which is the highest-resolution source file YouTube exposes publicly. You get a real 1280×720 image, not a 320×180 thumbnail snippet." },
  { q: 'Can I batch-download thumbnails from multiple videos at once?',
    a: 'Not in this tool. We deliberately kept it simple: one video URL, one set of thumbnails. If you need batch processing for competitor research, the better approach is to use YTGrowth Competitor Analysis, which surfaces the top videos in your niche and lets you study thumbnail patterns at scale rather than downloading them one at a time.' },
  { q: 'A thumbnail is just an image. Why does it matter for growth?',
    a: "CTR (click-through rate) is one of YouTube's primary ranking signals. A weak thumbnail kills a well-optimized video before a single person clicks. Studying high-performing thumbnails in your niche is one of the most leveraged things you can do as a creator. If you want to go further than just downloading examples, YTGrowth's Thumbnail IQ scores your own thumbnails against the top performers in your niche on contrast, face presence, text density, and AI vision analysis. That tells you whether your design is competitive before you upload." },
]

/* ── Eyebrow component ──────────────────────────────────────────────────── */
function Eyebrow({ children }) {
  return (
    <div className="ytd-eyebrow">
      <span aria-hidden="true" className="ytd-eyebrow-dot" />
      <span className="ytd-eyebrow-text">{children}</span>
    </div>
  )
}

/* ── Thumbnail card ─────────────────────────────────────────────────────── */
function ThumbnailCard({ videoId, size }) {
  const url = `https://img.youtube.com/vi/${videoId}/${size.filename}`
  const [state, setState] = useState('loading')   // loading | ok | error
  const [copied, setCopied] = useState(false)

  // YouTube's "this size doesn't exist" placeholder is 120x90. If the loaded
  // image dims match the placeholder for any size other than the default
  // 120x90 request, treat it as a missing variant.
  function onLoad(e) {
    const img = e.currentTarget
    if (size.key !== 'mqdefault' && size.key !== 'hqdefault' && img.naturalWidth <= 120 && img.naturalHeight <= 90) {
      setState('error')
      return
    }
    setState('ok')
  }

  async function handleDownload() {
    try {
      const res = await fetch(url, { mode: 'cors' })
      if (!res.ok) throw new Error('fetch failed')
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `youtube-thumbnail-${videoId}-${size.key}.jpg`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      // Fallback: open in new tab so user can right-click → save
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  function handleCopy() {
    try {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {}
  }

  return (
    <div style={{
      background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)',
      borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--ytg-shadow-sm)',
      display: 'flex', flexDirection: 'column',
      transition: 'box-shadow 0.18s, transform 0.18s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--ytg-shadow)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--ytg-shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* Image area */}
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '16 / 9',
        background: '#0a0a0f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {state === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 24, height: 24, border: '2.5px solid rgba(255,255,255,0.15)', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
          </div>
        )}
        {state === 'error' && (
          <div style={{ textAlign: 'center', padding: 18, color: 'rgba(255,255,255,0.62)', fontSize: 13, lineHeight: 1.6 }}>
            Not available at this resolution
          </div>
        )}
        {/* Real img always rendered so onLoad/onError fire */}
        <img
          src={url}
          alt={`${size.label} thumbnail`}
          onLoad={onLoad}
          onError={() => setState('error')}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            display: state === 'ok' ? 'block' : 'none',
          }}
        />
      </div>

      {/* Meta + actions */}
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 17, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.4px' }}>
            {size.label}
          </span>
          <span style={{ fontSize: 12, color: 'var(--ytg-text-3)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
            {size.dims}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleDownload}
            disabled={state !== 'ok'}
            className="ytd-btn"
            style={{ flex: 1, padding: '10px 16px', fontSize: 13, borderRadius: 100 }}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 1.5v9M3 7l4 4 4-4M2 12.5h10"/>
            </svg>
            Download
          </button>
          <button
            onClick={handleCopy}
            disabled={state !== 'ok'}
            className="ytd-btn-ghost"
            style={{ padding: '9px 14px' }}
            title="Copy image URL"
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2,6.5 5,9.5 10,3.5"/>
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="8" height="8" rx="1.5"/>
                  <path d="M2 9V3a1 1 0 0 1 1-1h6"/>
                </svg>
                Copy URL
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function YoutubeThumbnailDownloader() {
  useGlobalStyles()
  const { isMobile, isTablet } = useBreakpoint()

  const [inputUrl, setInputUrl] = useState('')
  const [videoId, setVideoId]   = useState(null)
  const [error, setError]       = useState('')
  const [openFaq, setOpenFaq]   = useState(0)
  const resultsRef = useRef(null)

  function handleSubmit(e) {
    if (e) e.preventDefault()
    setError('')
    const id = extractVideoId(inputUrl)
    if (!id) {
      setError("That doesn't look like a valid YouTube URL. Try pasting a link like https://youtube.com/watch?v=…")
      setVideoId(null)
      return
    }
    setVideoId(id)
    // Defer scroll until results render
    setTimeout(() => {
      if (resultsRef.current) resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(10,10,15,0.1)', padding: isMobile ? '0 20px' : '0 48px 0 80px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(244,244,246,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', minWidth: 0 }}>
          <Logo size={28} />
          <span style={{ fontWeight: 800, fontSize: 14, color: '#0a0a0f', letterSpacing: '-0.4px', whiteSpace: 'nowrap' }}>YTGrowth</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {!isMobile && <a href="/" className="ytd-nav-link">← Back to home</a>}
          <a href="/auth/login" className="ytd-btn"
            style={{ padding: isMobile ? '8px 18px' : '9px 22px', fontSize: 13, borderRadius: 100, whiteSpace: 'nowrap' }}>
            {isMobile ? 'Try free' : 'Try YTGrowth free'}
          </a>
        </div>
      </nav>

      {/* ══ HERO + INPUT ══ */}
      <section className="ytd-section-pad" style={{ position: 'relative', padding: isMobile ? '64px 24px 56px' : '110px 48px 84px', textAlign: 'center', background: '#ffffff', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120vw', maxWidth: 1400, height: 620, background: 'radial-gradient(ellipse at center top, rgba(229,48,42,0.07) 0%, rgba(229,48,42,0.02) 40%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'ytdFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 34 : isTablet ? 56 : 64, lineHeight: isMobile ? 1.1 : 1.04, letterSpacing: isMobile ? '-0.6px' : '-2.2px', color: 'var(--ytg-text)', marginBottom: 22, textWrap: 'balance' }}>
            Download any YouTube thumbnail in <span style={{ color: 'var(--ytg-accent)' }}>seconds.</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 620, margin: '0 auto 32px', textWrap: 'pretty' }}>
            Paste a YouTube URL. Get every available thumbnail size, including the full HD source, in one click.
          </p>

          {/* Input form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, maxWidth: 640, margin: '0 auto', flexDirection: isMobile ? 'column' : 'row' }}>
            <input
              type="text"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              placeholder="Paste a YouTube video URL"
              className="ytd-input"
              autoFocus
            />
            <button type="submit" className="ytd-btn" style={{ padding: '14px 28px', whiteSpace: 'nowrap' }}>
              Get thumbnails
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

      {/* ══ RESULTS ══ */}
      {videoId && (
        <section ref={resultsRef} className="ytd-section-pad" style={{ padding: isMobile ? '24px 20px 80px' : '40px 48px 110px', background: 'var(--ytg-bg)' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            <div style={{ marginBottom: 28, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Video ID</p>
              <p style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: 15, fontWeight: 600, color: 'var(--ytg-text)', letterSpacing: '0.5px' }}>{videoId}</p>
            </div>

            <div className="ytd-thumb-grid">
              {SIZES.map(s => (
                <ThumbnailCard key={s.key} videoId={videoId} size={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ HOW IT WORKS ══ */}
      <section className="ytd-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, maxWidth: 720 }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, textWrap: 'balance' }}>
              The simplest way to grab a <span style={{ color: 'var(--ytg-accent)' }}>YouTube thumbnail.</span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {[
              { h: 'YouTube exposes thumbnails publicly',
                p: "Every YouTube video has its thumbnail hosted on Google's public CDN at a predictable URL based on the video ID. We do nothing more than build that URL for you, fetch the image directly to your browser, and let you download it. No backend, no API key, no rate limits." },
              { h: 'Four standard resolutions, on demand',
                p: "Google generates up to four versions of every thumbnail: HD (1280×720), SD (640×480), High (480×360), and Medium (320×180). HD is only available for videos uploaded at HD or above. The High and Medium variants are generated for every video on the platform, so they always work." },
              { h: 'Why creators study competitor thumbnails',
                p: "Click-through rate is one of YouTube's primary ranking signals. The thumbnail is doing more for your views than your title in most cases. Saving the thumbnails of the top-performing videos in your niche is one of the cheapest research moves you can make: build a moodboard, look for patterns, see what hooks land, then design against the same standard." },
              { h: 'Use the thumbnails responsibly',
                p: "Thumbnails are owned by the creator who uploaded them. Use them for personal study, internal moodboards, or fair-use commentary. Don't republish someone else's thumbnail in your own video, blog, or commercial work without permission. If you're not the original creator, get consent or have a clear fair-use rationale." },
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
      <section className="ytd-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ marginBottom: 44, textAlign: 'center', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            <Eyebrow>Beyond downloading</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
              Studying thumbnails is good. <span style={{ color: 'var(--ytg-accent)' }}>Designing better ones is better.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>
              You downloaded a thumbnail to learn from it. The next step is knowing whether your own thumbnails actually compete on the metrics that drive clicks.
            </p>
          </div>

          <div className="ytd-grid-3">
            {[
              { label: 'Thumbnail IQ',
                title: 'Score your own thumbnails',
                body: 'Two-layer scoring (algorithmic + AI vision) against the actual top performers in your niche. Know whether your design is competitive before you upload, not after the CTR data comes in three days later.',
                href: '/features/thumbnail-iq' },
              { label: 'AI Channel Audit',
                title: 'Find what is actually broken',
                body: 'A 10-dimension audit of your last 20 videos, CTR, retention, and posting habits. Tells you which videos are SEO-underperformers and which thumbnails are losing the click war.',
                href: '/features/channel-audit' },
              { label: 'SEO Studio',
                title: 'Match the thumbnail to a winning title',
                body: 'A killer thumbnail with a weak title still loses. Score every title against the actual top-ranking videos in your niche so the SEO work goes into keywords with real search volume.',
                href: '/features/seo-studio' },
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
      <section className="ytd-section-pad ytd-cta-pad" style={{ padding: isMobile ? '88px 24px' : '120px 48px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', width: 1000, height: isMobile ? 600 : 800, background: 'radial-gradient(ellipse, rgba(229,48,42,0.20) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '5px 12px 5px 10px', marginBottom: 22 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 0 3px rgba(229,48,42,0.18)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Free AI audit</span>
          </div>
          <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: '#ffffff', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
            Stop studying. <span style={{ color: '#ff3b30' }}>Start scoring.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, marginBottom: 32, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Connect your channel for a free AI audit and find out exactly which of your thumbnails are losing the click war, with a real prioritized fix list.
          </p>
          <a href="/auth/login" className="ytd-btn ytd-btn-lg">Get my free audit →</a>
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
              Everything creators ask about thumbnails, downloads, and copyright. Still unsure? <a href="/contact" style={{ color: 'var(--ytg-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
            </p>
          </div>

          <div style={{ borderTop: '1px solid rgba(10,10,15,0.10)' }}>
            {FAQS.map((item, i) => {
              const isOpen = openFaq === i
              const num = String(i + 1).padStart(2, '0')
              return (
                <div key={i} style={{ borderBottom: '1px solid rgba(10,10,15,0.10)', position: 'relative' }}>
                  {isOpen && (
                    <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 2, background: 'var(--ytg-accent)', borderRadius: 2 }} />
                  )}
                  <div
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenFaq(isOpen ? null : i) } }}
                    style={{
                      display: 'flex', alignItems: 'flex-start',
                      gap: isMobile ? 14 : 20,
                      padding: isMobile ? '20px 0' : '24px 0',
                      paddingLeft: isOpen ? (isMobile ? 16 : 22) : 0,
                      cursor: 'pointer',
                      transition: 'padding-left 0.25s ease',
                      userSelect: 'none',
                    }}
                  >
                    <span style={{
                      fontSize: isMobile ? 12 : 13, fontWeight: 700,
                      color: isOpen ? 'var(--ytg-accent)' : 'var(--ytg-text-3)',
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1.5, flexShrink: 0,
                      width: isMobile ? 22 : 28, paddingTop: 2,
                      transition: 'color 0.2s',
                    }}>{num}</span>
                    <span style={{
                      flex: 1,
                      fontSize: isMobile ? 15 : 16, fontWeight: 600,
                      color: 'var(--ytg-text)', lineHeight: 1.45,
                      letterSpacing: '-0.2px',
                    }}>{item.q}</span>
                    <span aria-hidden="true" style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isOpen ? 'var(--ytg-accent)' : 'rgba(10,10,15,0.05)',
                      border: `1px solid ${isOpen ? 'var(--ytg-accent)' : 'rgba(10,10,15,0.10)'}`,
                      transition: 'background 0.2s, border-color 0.2s',
                      marginTop: 1,
                    }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 5h8" stroke={isOpen ? '#ffffff' : 'var(--ytg-text-2)'} strokeWidth="1.8" strokeLinecap="round" />
                        {!isOpen && <path d="M5 1v8" stroke="var(--ytg-text-2)" strokeWidth="1.8" strokeLinecap="round" />}
                      </svg>
                    </span>
                  </div>
                  <div className={`ytd-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="ytd-faq-answer-inner">
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
