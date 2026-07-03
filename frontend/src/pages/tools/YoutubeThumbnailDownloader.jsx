import { useEffect, useState, useRef } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free SEO tool: YouTube Thumbnail Downloader ─────────────────────────
   /tools/youtube-thumbnail-downloader. Targets the "youtube thumbnail
   downloader" search keyword (very high volume, tool-intent).

   Migrated to the editorial design language (Fraunces + Barlow, sharp flat
   cards, warm paper, restrained red). The video-ID extraction, thumbnail
   load/error detection, download, and copy logic are preserved verbatim;
   only the skin changed. 100% client-side, zero API. See
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
    if (document.getElementById('ytg-ytd-styles')) return
    const style = document.createElement('style')
    style.id = 'ytg-ytd-styles'
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
      @keyframes ytdFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
      @keyframes ytdSpin { to { transform: rotate(360deg) } }

      .ytd-wrap { max-width: 1040px; margin: 0 auto; }
      .ytd-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .ytd-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .ytd-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .ytd-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.04; }
      .ytd-h1 em { font-style: italic; color: var(--yte-accent); }
      .ytd-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .ytd-h2 em { font-style: italic; color: var(--yte-accent); }
      .ytd-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .ytd-input { width: 100%; padding: 14px 16px; font-size: 15px; font-weight: 500; font-family: ${SANS}; color: var(--yte-ink); background: var(--yte-surface); border: 1px solid var(--yte-line); border-radius: 0; outline: none; transition: border-color 0.15s; -webkit-appearance: none; }
      .ytd-input:focus { border-color: var(--yte-accent); }
      .ytd-input::placeholder { color: var(--yte-muted); }

      .ytd-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--yte-accent); color: #fff; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 14px 28px; border: none; border-radius: 0; cursor: pointer; text-decoration: none; transition: filter 0.18s, transform 0.18s; white-space: nowrap; }
      .ytd-btn:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-1px); }
      .ytd-btn:disabled { background: rgba(20,19,15,0.10); color: var(--yte-muted); cursor: not-allowed; transform: none; filter: none; }

      .ytd-btn-ghost { display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: transparent; color: var(--yte-soft); font-family: ${SANS}; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 11px 14px; border-radius: 0; border: 1px solid var(--yte-line); cursor: pointer; text-decoration: none; transition: color 0.15s, border-color 0.15s; }
      .ytd-btn-ghost:hover:not(:disabled) { color: var(--yte-ink); border-color: var(--yte-line-2); }
      .ytd-btn-ghost:disabled { color: var(--yte-muted); opacity: 0.5; cursor: not-allowed; }

      .ytd-grow-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 760px) { .ytd-grow-grid { grid-template-columns: 1fr; } }
      .ytd-grow-card { display: block; text-decoration: none; background: var(--yte-surface); padding: 28px; transition: background 0.15s; }
      .ytd-grow-card:hover { background: var(--yte-bg-2); }

      .ytd-thumb-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
      @media (max-width: 760px) { .ytd-thumb-grid { grid-template-columns: 1fr; } }

      .ytd-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease; }
      .ytd-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .ytd-faq-answer-inner { overflow: hidden; }

      @media (max-width: 768px) {
        .ytd-section-pad { padding-left: 22px !important; padding-right: 22px !important; }
        .ytd-cta-pad { padding: 76px 24px !important; }
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

const HOW_IT_WORKS = [
  { h: 'YouTube exposes thumbnails publicly',
    p: "Every YouTube video has its thumbnail hosted on Google's public CDN at a predictable URL based on the video ID. We do nothing more than build that URL for you, fetch the image directly to your browser, and let you download it. No backend, no API key, no rate limits." },
  { h: 'Four standard resolutions, on demand',
    p: "Google generates up to four versions of every thumbnail: HD (1280×720), SD (640×480), High (480×360), and Medium (320×180). HD is only available for videos uploaded at HD or above. The High and Medium variants are generated for every video on the platform, so they always work." },
  { h: 'Why creators study competitor thumbnails',
    p: "Click-through rate is one of YouTube's primary ranking signals. The thumbnail is doing more for your views than your title in most cases. Saving the thumbnails of the top-performing videos in your niche is one of the cheapest research moves you can make: build a moodboard, look for patterns, see what hooks land, then design against the same standard." },
  { h: 'Use the thumbnails responsibly',
    p: "Thumbnails are owned by the creator who uploaded them. Use them for personal study, internal moodboards, or fair-use commentary. Don't republish someone else's thumbnail in your own video, blog, or commercial work without permission. If you're not the original creator, get consent or have a clear fair-use rationale." },
]

const GROW = [
  { label: 'Thumbnail IQ',
    title: 'Score your own thumbnails',
    body: 'Two-layer scoring (algorithmic + AI vision) against the actual top performers in your niche. Know whether your design is competitive before you upload, not after the CTR data comes in three days later.',
    href: '/features/thumbnail-iq' },
  { label: 'AI Channel Audit',
    title: 'Find what is broken',
    body: 'A 10-dimension audit of your last 20 videos, CTR, retention, and posting habits. Tells you which videos are SEO-underperformers and which thumbnails are losing the click war.',
    href: '/features/channel-audit' },
  { label: 'SEO Studio',
    title: 'Match the thumbnail to a winning title',
    body: 'A killer thumbnail with a weak title still loses. Score every title against the actual top-ranking videos in your niche so the SEO work goes into keywords with real search volume.',
    href: '/features/seo-studio' },
]

/* ── Eyebrow component ──────────────────────────────────────────────────── */
function Eyebrow({ children, center }) {
  return (
    <div className="ytd-eyebrow" style={center ? { justifyContent: 'center' } : undefined}>
      <span aria-hidden="true" className="ytd-eyebrow-rule" />
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

  function handleCopy() {
    try {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {}
  }

  return (
    <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Image area */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {state === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 24, height: 24, border: '2.5px solid rgba(255,255,255,0.15)', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'ytdSpin 0.8s linear infinite' }} />
          </div>
        )}
        {state === 'error' && (
          <div style={{ textAlign: 'center', padding: 18, color: 'rgba(255,255,255,0.62)', fontFamily: SANS, fontSize: 13, lineHeight: 1.6 }}>
            Not available at this resolution
          </div>
        )}
        {/* Real img always rendered so onLoad/onError fire */}
        <img
          src={url}
          alt={`${size.label} thumbnail`}
          onLoad={onLoad}
          onError={() => setState('error')}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: state === 'ok' ? 'block' : 'none' }}
        />
      </div>

      {/* Meta + actions */}
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px' }}>
            {size.label}
          </span>
          <span style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
            {size.dims}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleCopy} disabled={state !== 'ok'} className="ytd-btn-ghost" title="Copy image URL" style={{ flex: 1, padding: '11px 14px' }}>
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

  const H1 = isMobile ? 34 : isTablet ? 50 : 58
  const H2 = isMobile ? 28 : 42

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', overflowX: 'clip' }}>

      {/* ── NAV, shared SiteHeader ── */}
      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO + INPUT ══ */}
      <section className="ytd-section-pad" style={{ padding: isMobile ? '60px 22px 48px' : '104px 48px 64px', background: 'var(--yte-bg)' }}>
        <div className="ytd-wrap" style={{ animation: 'ytdFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 className="ytd-h1" style={{ fontSize: H1, marginBottom: 22, maxWidth: 820, textWrap: 'balance' }}>
            Preview any YouTube thumbnail in <em>seconds.</em>
          </h1>
          <p className="ytd-lead" style={{ fontSize: isMobile ? 16 : 17.5, marginBottom: 28, maxWidth: 620, textWrap: 'pretty' }}>
            Paste a YouTube URL. See every available thumbnail size, including the full HD source.
          </p>

          {/* Input form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, maxWidth: 640, flexDirection: isMobile ? 'column' : 'row' }}>
            <input
              type="text"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              placeholder="Paste a YouTube video URL"
              className="ytd-input"
              autoFocus
            />
            <button type="submit" className="ytd-btn">
              Get thumbnails
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

      {/* ══ RESULTS ══ */}
      {videoId && (
        <section ref={resultsRef} className="ytd-section-pad" style={{ padding: isMobile ? '8px 22px 80px' : '12px 48px 96px', background: 'var(--yte-bg)' }}>
          <div className="ytd-wrap">
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontFamily: SANS, fontSize: 11, color: 'var(--yte-muted)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Video ID</span>
              <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: 15, fontWeight: 600, color: 'var(--yte-ink)', letterSpacing: '0.5px' }}>{videoId}</span>
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
      <section className="ytd-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="ytd-wrap">
          <div style={{ marginBottom: 40, maxWidth: 720 }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="ytd-h2" style={{ fontSize: H2, textWrap: 'balance' }}>
              The simplest way to grab a <em>YouTube thumbnail.</em>
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
      <section className="ytd-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="ytd-wrap">
          <div style={{ marginBottom: 32, maxWidth: 720 }}>
            <Eyebrow>Beyond downloading</Eyebrow>
            <h2 className="ytd-h2" style={{ fontSize: H2, marginBottom: 12, textWrap: 'balance' }}>
              Studying thumbnails is good. <em>Designing better ones is better.</em>
            </h2>
            <p className="ytd-lead" style={{ fontSize: 17 }}>
              You downloaded a thumbnail to learn from it. The next step is knowing whether your own thumbnails compete on the metrics that drive clicks.
            </p>
          </div>

          <div className="ytd-grow-grid">
            {GROW.map((card, i) => (
              <a key={i} href={card.href} className="ytd-grow-card">
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>{card.label}</div>
                <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', marginBottom: 12, lineHeight: 1.2 }}>{card.title}</h3>
                <p style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.65 }}>{card.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div className="ytd-section-pad" style={{ background: 'var(--yte-bg)', padding: isMobile ? '60px 22px' : '104px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 36 : 80, alignItems: 'start' }}>

          <div>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="ytd-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>Thumbnails, <em>answered.</em></h2>
            <p className="ytd-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              Everything creators ask about thumbnails, downloads, and copyright. Still unsure? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
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
                  <div className={`ytd-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="ytd-faq-answer-inner">
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
