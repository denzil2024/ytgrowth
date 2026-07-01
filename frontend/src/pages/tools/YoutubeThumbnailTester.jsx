import { useEffect, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free SEO tool: YouTube Thumbnail Tester (A/B compare) ───────────────
   /tools/youtube-thumbnail-tester. Zero YouTube-API cost: images are read in
   the browser with FileReader and never leave the device. Renders the user's
   own real thumbnails inside CSS mockups of real YouTube layouts (does not
   generate fake images).

   Migrated to the editorial design language (Fraunces + Barlow, sharp flat
   cards, warm paper, restrained red). ALL canvas analysis/scoring logic and
   content are preserved verbatim; only the page chrome changed. The mock
   YouTube tiles deliberately keep YouTube's own styling (Roboto, real greys)
   so the thumbnail is shown in a realistic context. The context toggle and
   pick buttons are quiet (active = ink, never red, see feedback_quiet_toggles).
   See project_design_language_editorial. */

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
    if (document.getElementById('ytg-ab-styles')) return
    const style = document.createElement('style')
    style.id = 'ytg-ab-styles'
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
      @keyframes abFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .ab-wrap { max-width: 1040px; margin: 0 auto; }
      .ab-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .ab-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .ab-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .ab-h1 { font-family: ${SERIF}; font-weight: 400; letter-spacing: -0.01em; line-height: 1.04; color: var(--yte-ink); }
      .ab-h1 em { font-style: italic; color: var(--yte-accent); }
      .ab-h2 { font-family: ${SERIF}; font-weight: 400; letter-spacing: -0.01em; line-height: 1.08; color: var(--yte-ink); }
      .ab-h2 em { font-style: italic; color: var(--yte-accent); }
      .ab-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      /* Quiet view toggle. Active = ink, never red. */
      .ab-seg { display: inline-flex; border: 1px solid var(--yte-line); background: var(--yte-surface); flex-wrap: wrap; }
      .ab-seg button { font-family: ${SANS}; font-size: 13px; font-weight: 600; letter-spacing: 0.01em; color: var(--yte-muted); background: transparent; border: none; padding: 9px 18px; cursor: pointer; transition: background 0.15s, color 0.15s; }
      .ab-seg button + button { border-left: 1px solid var(--yte-line); }
      .ab-seg button:hover { color: var(--yte-ink); }
      .ab-seg button.active { background: var(--yte-ink); color: #fff; }

      /* Title input keeps YouTube's own typography (this is a mock tile). */
      .ab-title-input { width: 100%; font-family: 'Roboto', 'Barlow', system-ui, sans-serif; border: none; background: transparent; outline: none; color: #0f0f0f; padding: 0; resize: none; }
      .ab-title-input:focus { background: rgba(10,10,15,0.03); border-radius: 4px; }

      .ab-drop { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; width: 100%; height: 100%; cursor: pointer; color: var(--yte-muted); text-align: center; padding: 12px; background: var(--yte-bg-2); transition: background 0.15s; }
      .ab-drop:hover { background: #e4e0d6; }

      /* Quiet pick button: ghost when unpicked, ink when picked. */
      .ab-pick { width: 100%; font-family: ${SANS}; font-size: 11.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 12px; cursor: pointer; transition: background 0.15s, color 0.15s, border-color 0.15s; border: 1px solid var(--yte-line); background: var(--yte-surface); color: var(--yte-soft); }
      .ab-pick:hover { border-color: var(--yte-line-2); color: var(--yte-ink); }
      .ab-pick.picked { background: var(--yte-ink); color: #fff; border-color: var(--yte-ink); }

      .ab-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease; }
      .ab-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .ab-faq-answer-inner { overflow: hidden; }

      .ab-grow-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 760px) { .ab-grow-grid { grid-template-columns: 1fr; } }
      .ab-grow-card { display: block; text-decoration: none; background: var(--yte-surface); padding: 28px; transition: background 0.15s; }
      .ab-grow-card:hover { background: var(--yte-bg-2); }

      @media (max-width: 768px) { .ab-section-pad { padding-left: 22px !important; padding-right: 22px !important; } .ab-cta-pad { padding: 76px 24px !important; } }
    `
    document.head.appendChild(style)
  }, [])
}

/* Real-world display widths (px) of a thumbnail in each YouTube surface. The
   point of the tool is to show the user's thumbnail at the size viewers see. */
const CONTEXTS = {
  feed:   { label: 'Home feed', layout: 'vertical', w: 268 },
  mobile: { label: 'Mobile',    layout: 'vertical', w: 360 },
  sugg:   { label: 'Suggested', layout: 'horizontal', w: 168 },
  search: { label: 'Search',    layout: 'horizontal', w: 246 },
}

/* ── Client-side thumbnail analysis (zero API). Reads pixels via canvas from
   the user's own uploaded image (a data: URL, so not cross-origin) and scores
   the visual signals that help a thumbnail pop at small size. A heuristic
   guide, not a CTR oracle; the real test is YouTube's live Test and Compare. */
function analyzeImage(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const W = 160, H = 90, n = W * H
        const c = document.createElement('canvas')
        c.width = W; c.height = H
        const cx = c.getContext('2d')
        cx.drawImage(img, 0, 0, W, H)
        const d = cx.getImageData(0, 0, W, H).data
        const lum = new Float32Array(n)
        let sL = 0, sL2 = 0, rgS = 0, rgS2 = 0, ybS = 0, ybS2 = 0
        for (let i = 0, p = 0; p < n; i += 4, p++) {
          const r = d[i], g = d[i + 1], b = d[i + 2]
          const L = 0.299 * r + 0.587 * g + 0.114 * b
          lum[p] = L; sL += L; sL2 += L * L
          const rg = r - g, yb = 0.5 * (r + g) - b
          rgS += rg; rgS2 += rg * rg; ybS += yb; ybS2 += yb * yb
        }
        const meanL = sL / n
        const stdL = Math.sqrt(Math.max(0, sL2 / n - meanL * meanL))
        const rgM = rgS / n, rgStd = Math.sqrt(Math.max(0, rgS2 / n - rgM * rgM))
        const ybM = ybS / n, ybStd = Math.sqrt(Math.max(0, ybS2 / n - ybM * ybM))
        const colorful = Math.sqrt(rgStd * rgStd + ybStd * ybStd) + 0.3 * Math.sqrt(rgM * rgM + ybM * ybM)
        // Edge density (clutter) and Laplacian variance (sharpness / blur).
        let edge = 0, lapS = 0, lapS2 = 0, lapN = 0
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const p = y * W + x
          if (x < W - 1) edge += Math.abs(lum[p] - lum[p + 1])
          if (y < H - 1) edge += Math.abs(lum[p] - lum[p + W])
          if (x > 0 && x < W - 1 && y > 0 && y < H - 1) {
            const lap = 4 * lum[p] - lum[p - 1] - lum[p + 1] - lum[p - W] - lum[p + W]
            lapS += lap; lapS2 += lap * lap; lapN++
          }
        }
        const lapVar = lapN ? Math.max(0, lapS2 / lapN - (lapS / lapN) ** 2) : 0
        // Subject isolation: how much a coarse 8x6 grid of block-brightness
        // varies. High = a clear focal area stands out; low = flat/uniform.
        const GX = 8, GY = 6, blocks = new Float32Array(GX * GY), bn = new Float32Array(GX * GY)
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const bi = Math.min(GY - 1, (y / H * GY) | 0) * GX + Math.min(GX - 1, (x / W * GX) | 0)
          blocks[bi] += lum[y * W + x]; bn[bi]++
        }
        let bSum = 0, bSum2 = 0
        for (let i = 0; i < blocks.length; i++) { const v = blocks[i] / bn[i]; bSum += v; bSum2 += v * v }
        const bMean = bSum / blocks.length
        const focusStd = Math.sqrt(Math.max(0, bSum2 / blocks.length - bMean * bMean))
        resolve({ meanL, stdL, colorful, edgeMean: edge / n, lapVar, focusStd })
      } catch (e) { resolve(null) }
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}

const clamp100 = (v) => Math.max(0, Math.min(100, Math.round(v)))
function scoreOne(m) {
  // Gains tuned so strong thumbnails land in the 60-95 band (not pegged at
  // 100), so two good options still differentiate. Heuristic, not exact.
  const contrast = clamp100(m.stdL * 0.95)
  const color = clamp100(m.colorful * 0.8)
  const brightness = clamp100(100 - Math.abs(m.meanL - 150) * 0.55)
  const sharpness = clamp100(Math.sqrt(m.lapVar) * 5.5)
  const subject = clamp100(m.focusStd * 1.9)
  const simplicity = clamp100(100 - Math.abs(m.edgeMean - 11) * 3.0)
  const overall = clamp100(contrast * 0.22 + color * 0.2 + sharpness * 0.18 + subject * 0.16 + brightness * 0.13 + simplicity * 0.11)
  return { contrast, color, brightness, sharpness, subject, simplicity, overall }
}
const METRICS = [
  ['contrast', 'Contrast'],
  ['color', 'Color pop'],
  ['sharpness', 'Sharpness'],
  ['subject', 'Subject focus'],
  ['brightness', 'Brightness'],
  ['simplicity', 'Simplicity'],
]
function reasonText(sa, sb, winner) {
  if (winner === 'tie') return 'These two are very close on the visual signals. Trust your eye, or run them both live with YouTube Test and Compare.'
  const w = winner === 'A' ? sa : sb, l = winner === 'A' ? sb : sa
  const leads = METRICS.filter(([k]) => w[k] - l[k] >= 8).map(([, label]) => label.toLowerCase())
  if (!leads.length) return `Thumbnail ${winner} edges it out overall, but it is close. Your eye is the tie-breaker.`
  const list = leads.length === 1 ? leads[0] : leads.slice(0, -1).join(', ') + ' and ' + leads.slice(-1)
  return `Thumbnail ${winner} wins on ${list}, which help it stand out in a small feed tile.`
}

const FAQS = [
  { q: 'Why should I test my thumbnail at a small size?',
    a: "Because that is the size people see. You design a thumbnail full-screen, but in the home feed, search, and suggested column it shrinks to a small tile, often under 250 pixels wide and far smaller on mobile. Text that looked bold becomes unreadable, a busy background turns to mush, and the focal point disappears. Viewing both options at true display size, side by side, is the fastest way to catch a thumbnail that falls apart small before you publish it." },
  { q: 'How do I A/B test YouTube thumbnails?',
    a: "Two ways. Before publishing, compare your options visually at real size, which is what this tool does: load both, pick the one that reads clearest and pulls hardest as a tiny tile. After publishing, YouTube's own Test and Compare feature (available to many channels in Studio) rotates up to three thumbnails on the live video and reports which one wins on watch time share, so the algorithm picks the real winner from actual viewers. Use this tool to choose your strongest two or three, then let Test and Compare settle it live." },
  { q: 'Does YouTube have built-in thumbnail A/B testing?',
    a: "Yes. YouTube rolled out a Test and Compare feature in YouTube Studio that lets eligible channels upload up to three thumbnails for a video and automatically rotates them, then declares a winner based on which earned the most watch time share. It is the most reliable test because it uses your real audience. This tool is the pre-publish step: it helps you choose the best candidates to feed into that test, since you only get three slots." },
  { q: 'What makes a thumbnail get clicked?',
    a: "At small size, four things do most of the work: high contrast so the image separates from YouTube's white and dark backgrounds, a clear single focal point (often a face with a strong expression) rather than a cluttered scene, large legible text of only three to five words, and a color palette that stands out from the videos around it. A thumbnail that nails these reads instantly as a thumb-sized tile, which is exactly the test this tool puts it through." },
  { q: 'How many thumbnails should I compare?',
    a: "Two or three. More than that and you are no longer comparing, you are guessing, and YouTube's live Test and Compare only allows three anyway. Narrow your rough ideas down to your two strongest, view them here at real size against an editable title, and pick the one that wins the small-tile test. Then if your channel has Test and Compare, run the top two or three live to confirm with real viewers." },
  { q: 'Are my thumbnail images private?',
    a: "Completely. The images you load never leave your browser. This tool uses your device to read and display them locally, with no upload to any server, no storage, and no account. You can compare unreleased thumbnails for unpublished videos with no privacy risk at all." },
  { q: 'Is this tool free?',
    a: "Free forever, no signup, no email. It runs entirely in your browser. We built it as a genuine free tool because the thumbnail is the single biggest lever on click-through rate, and most creators never check theirs at the size that matters. If you want your thumbnails scored against the top performers in your niche on contrast, faces, and text density, you can connect your channel for a free AI audit with Thumbnail IQ, but that is entirely optional." },
]

const HOW_IT_WORKS = [
  { h: 'It has to read at thumb size', p: "Viewers see your thumbnail as a small tile, not a full-screen image. If the focal point, text, or expression does not land at 250 pixels wide (and far smaller on mobile), it does not land at all. Comparing both options at real size is the whole game." },
  { h: 'Contrast separates you from the feed', p: "Your thumbnail competes against a wall of other tiles on YouTube's white or dark background. High contrast and a bold, distinct color palette make yours the one the eye stops on. Side by side, the higher-contrast option usually wins." },
  { h: 'One focal point beats a busy scene', p: "A single clear subject, often a face with a strong expression, reads instantly. A cluttered composition turns to noise when shrunk. Use the comparison to see which option keeps a clean focal point at small size." },
  { h: 'Title and thumbnail work as a pair', p: "Viewers read both together in a fraction of a second. Edit the mock titles here so you are testing the real package, not the image alone. The best combination is the one where the title adds what the thumbnail cannot say." },
]

const GROW = [
  { label: 'Thumbnail IQ', title: 'Score against the winners', body: 'Rate your thumbnail on contrast, faces, and text density against the top performers in your niche before you upload.', href: '/features/thumbnail-iq' },
  { label: 'Title Generator', title: 'Pair it with a title that pulls', body: 'Generate and score titles against the CTR signals that move clicks, so the package wins together.', href: '/tools/youtube-title-generator' },
  { label: 'AI Channel Audit', title: 'See your real CTR', body: 'A 10-dimension audit shows which videos are losing the click war and what to change first.', href: '/features/channel-audit' },
]

function Eyebrow({ children, center }) {
  return (
    <div className="ab-eyebrow" style={center ? { justifyContent: 'center' } : undefined}>
      <span aria-hidden="true" className="ab-eyebrow-rule" />
      <span className="ab-eyebrow-text">{children}</span>
    </div>
  )
}

/* One mock YouTube result card showing the user's uploaded thumbnail. The
   inner tile keeps YouTube's own styling (Roboto, real greys) on purpose so
   the thumbnail is seen in a realistic context; only the card frame around it
   uses the editorial system. */
function MockCard({ label, img, title, onTitle, onFile, picked, onPick, ctx }) {
  const horizontal = ctx.layout === 'horizontal'
  const thumbW = ctx.w
  const thumbStyle = { width: thumbW, aspectRatio: '16 / 9', borderRadius: 10, overflow: 'hidden', flexShrink: 0, position: 'relative', background: '#e6e7ec' }
  const titleSize = ctx.w >= 300 ? 15 : ctx.w >= 240 ? 14 : 13

  const thumb = (
    <div style={thumbStyle}>
      {img ? (
        <img src={img} alt={`Thumbnail ${label}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <label className="ab-drop">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></svg>
          <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600 }}>Upload thumbnail {label}</span>
          <span style={{ fontFamily: SANS, fontSize: 10.5 }}>1280x720, JPG or PNG</span>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files && e.target.files[0])} />
        </label>
      )}
      {/* Mock duration stamp, as on real YouTube */}
      {img && <span style={{ position: 'absolute', right: 6, bottom: 6, background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '1px 4px', borderRadius: 4, fontFamily: 'Roboto, sans-serif' }}>10:24</span>}
    </div>
  )

  const meta = (
    <div style={{ minWidth: 0, flex: horizontal ? 1 : undefined, paddingTop: horizontal ? 0 : 10, display: 'flex', gap: 10 }}>
      {!horizontal && <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e6e7ec', flexShrink: 0 }} />}
      <div style={{ minWidth: 0, flex: 1 }}>
        <textarea className="ab-title-input" rows={2} value={title} onChange={(e) => onTitle(e.target.value)}
          style={{ fontSize: titleSize, fontWeight: 600, lineHeight: 1.3, color: '#0f0f0f', maxHeight: titleSize * 2.8, overflow: 'hidden' }} />
        <div style={{ fontSize: 12.5, color: '#606060', fontFamily: 'Roboto, sans-serif', marginTop: 2 }}>Your Channel</div>
        <div style={{ fontSize: 12.5, color: '#606060', fontFamily: 'Roboto, sans-serif' }}>12K views · 2 days ago</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: 'var(--yte-surface)', border: `1px solid ${picked ? 'var(--yte-ink)' : 'var(--yte-line)'}`, padding: 18, transition: 'border-color 0.15s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: 'var(--yte-ink)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Thumbnail {label}</span>
        {img && (
          <label style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--yte-accent)', cursor: 'pointer' }}>
            Replace
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files && e.target.files[0])} />
          </label>
        )}
      </div>

      {/* The mock YouTube tile at real display size */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 16px' }}>
        <div style={{ display: 'flex', flexDirection: horizontal ? 'row' : 'column', gap: horizontal ? 10 : 0, width: horizontal ? '100%' : thumbW, maxWidth: '100%' }}>
          {thumb}
          {meta}
        </div>
      </div>

      <button onClick={onPick} className={`ab-pick${picked ? ' picked' : ''}`}>
        {picked ? 'Your pick ✓' : "I'd click this one"}
      </button>
    </div>
  )
}

export default function YoutubeThumbnailTester() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()

  const [ctxKey, setCtxKey] = useState('feed')
  const [imgs, setImgs] = useState([null, null])
  const [titles, setTitles] = useState(['How I Edited This in 10 Minutes', 'The Editing Trick Nobody Tells You'])
  const [picked, setPicked] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [openFaq, setOpenFaq] = useState(0)

  const ctx = CONTEXTS[ctxKey]

  // Auto-analyze the moment both thumbnails are present.
  useEffect(() => {
    let cancelled = false
    if (imgs[0] && imgs[1]) {
      Promise.all([analyzeImage(imgs[0]), analyzeImage(imgs[1])]).then(([a, b]) => {
        if (cancelled) return
        if (!a || !b) { setAnalysis(null); return }
        const sa = scoreOne(a), sb = scoreOne(b)
        const winner = Math.abs(sa.overall - sb.overall) <= 1 ? 'tie' : (sa.overall > sb.overall ? 'A' : 'B')
        setAnalysis({ sa, sb, winner })
      })
    } else {
      setAnalysis(null)
    }
    return () => { cancelled = true }
  }, [imgs])

  const onFile = (idx, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => setImgs((prev) => prev.map((v, i) => (i === idx ? e.target.result : v)))
    reader.readAsDataURL(file)
  }

  const H2 = isMobile ? 28 : 42

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', overflowX: 'clip' }}>

      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="ab-section-pad" style={{ padding: isMobile ? '60px 22px 40px' : '104px 48px 48px', background: 'var(--yte-bg)' }}>
        <div className="ab-wrap" style={{ animation: 'abFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 className="ab-h1" style={{ fontSize: isMobile ? 34 : 56, marginBottom: 22, maxWidth: 860, textWrap: 'balance' }}>
            Test your thumbnails <em>before you post.</em>
          </h1>
          <p className="ab-lead" style={{ fontSize: isMobile ? 16 : 17.5, maxWidth: 660, marginBottom: 14, textWrap: 'pretty' }}>
            Load two thumbnails and see them side by side at the real size viewers see in the feed, on mobile, and in suggested. Pick the one that wins the small-tile test.
          </p>
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>No signup. Your images never leave your browser.</p>
        </div>
      </section>

      {/* ══ TOOL ══ */}
      <section id="tool" className="ab-section-pad" style={{ padding: isMobile ? '8px 22px 80px' : '12px 48px 96px', background: 'var(--yte-bg)' }}>
        <div className="ab-wrap">
          {/* Context toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <div className="ab-seg" role="tablist">
              {Object.entries(CONTEXTS).map(([key, c]) => (
                <button key={key} className={ctxKey === key ? 'active' : ''} onClick={() => setCtxKey(key)} role="tab" aria-selected={ctxKey === key}>{c.label}</button>
              ))}
            </div>
          </div>
          <p style={{ textAlign: 'center', fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', marginBottom: 28 }}>Each thumbnail is shown at its true display width in this surface. Edit the titles to test the full package.</p>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, alignItems: 'start' }}>
            <MockCard label="A" img={imgs[0]} title={titles[0]} ctx={ctx}
              onTitle={(v) => setTitles((t) => [v, t[1]])} onFile={(f) => onFile(0, f)}
              picked={picked === 0} onPick={() => setPicked(picked === 0 ? null : 0)} />
            <MockCard label="B" img={imgs[1]} title={titles[1]} ctx={ctx}
              onTitle={(v) => setTitles((t) => [t[0], v])} onFile={(f) => onFile(1, f)}
              picked={picked === 1} onPick={() => setPicked(picked === 1 ? null : 1)} />
          </div>

          {/* ── ANALYSIS ─────────────────────────────────────────────── */}
          <div style={{ marginTop: 12, background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', padding: isMobile ? 22 : 30 }}>
            {!analysis ? (
              <div style={{ textAlign: 'center', padding: '18px 0' }}>
                <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: 'var(--yte-ink)', marginBottom: 8 }}>Upload both thumbnails to analyze</div>
                <div style={{ fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-muted)', lineHeight: 1.6, maxWidth: 440, margin: '0 auto' }}>We read each image in your browser and score contrast, color, brightness, and clarity, then call the stronger one with the reasons.</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>Our pick</div>
                    <div className="ab-h2" style={{ fontSize: isMobile ? 24 : 30 }}>
                      {analysis.winner === 'tie' ? 'Too close to call' : <>Thumbnail <em>{analysis.winner}</em> wins</>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[['A', analysis.sa.overall], ['B', analysis.sb.overall]].map(([lbl, sc]) => {
                      const win = analysis.winner === lbl
                      return (
                        <div key={lbl} style={{ textAlign: 'center', minWidth: 62, padding: '10px 14px', background: win ? 'var(--yte-ink)' : 'var(--yte-bg-2)', color: win ? '#fff' : 'var(--yte-muted)' }}>
                          <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 400, lineHeight: 1 }}>{sc}</div>
                          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, marginTop: 4, opacity: 0.8, letterSpacing: '0.06em' }}>{lbl}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <p style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.65, marginBottom: 22 }}>{reasonText(analysis.sa, analysis.sb, analysis.winner)}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {METRICS.map(([key, label]) => {
                    const av = analysis.sa[key], bv = analysis.sb[key], aWin = av >= bv
                    return (
                      <div key={key}>
                        <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: 'var(--yte-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>{label}</div>
                        {[['A', av, aWin], ['B', bv, !aWin]].map(([lbl, v, win]) => (
                          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                            <span style={{ width: 14, fontFamily: SANS, fontSize: 11, fontWeight: 700, color: 'var(--yte-muted)' }}>{lbl}</span>
                            <div style={{ flex: 1, height: 6, background: 'var(--yte-bg-2)', overflow: 'hidden' }}>
                              <div style={{ width: `${v}%`, height: '100%', background: win ? 'var(--yte-accent)' : 'var(--yte-line-2)', transition: 'width 0.3s ease' }} />
                            </div>
                            <span style={{ width: 26, fontFamily: SANS, fontSize: 12, fontWeight: 700, textAlign: 'right', color: win ? 'var(--yte-accent)' : 'var(--yte-muted)', fontVariantNumeric: 'tabular-nums' }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>

                <p style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)', lineHeight: 1.6, marginTop: 20 }}>
                  Scored on the visual signals that help a thumbnail pop at small size. A guide, not a guarantee. The real test is YouTube's live Test and Compare with your actual audience.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="ab-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="ab-wrap">
          <div style={{ marginBottom: 40, maxWidth: 720 }}>
            <Eyebrow>What wins the click</Eyebrow>
            <h2 className="ab-h2" style={{ fontSize: H2, textWrap: 'balance' }}>
              The test your thumbnail <em>has to pass.</em>
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

      {/* ══ HOW TO GROW (3 cards) ══ */}
      <section className="ab-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="ab-wrap">
          <div style={{ marginBottom: 32, maxWidth: 720 }}>
            <Eyebrow>Beyond the eye test</Eyebrow>
            <h2 className="ab-h2" style={{ fontSize: H2, marginBottom: 12, textWrap: 'balance' }}>
              Trust your gut, then <em>check the data.</em>
            </h2>
            <p className="ab-lead" style={{ fontSize: 17 }}>The side-by-side test picks your best two. YTGrowth scores them against what is winning in your niche.</p>
          </div>
          <div className="ab-grow-grid">
            {GROW.map((card, i) => (
              <a key={i} href={card.href} className="ab-grow-card">
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>{card.label}</div>
                <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', marginBottom: 12, lineHeight: 1.2 }}>{card.title}</h3>
                <p style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.65 }}>{card.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div className="ab-section-pad" style={{ background: 'var(--yte-bg)', padding: isMobile ? '60px 22px' : '104px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 36 : 80, alignItems: 'start' }}>
          <div>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="ab-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>Testing, <em>answered.</em></h2>
            <p className="ab-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              Everything creators ask about testing thumbnails. Still unsure? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
            </p>
          </div>
          <div style={{ borderTop: '1px solid var(--yte-line)' }}>
            {FAQS.map((item, i) => {
              const isOpen = openFaq === i
              return (
                <div key={i} style={{ borderBottom: '1px solid var(--yte-line)' }}>
                  <div onClick={() => setOpenFaq(isOpen ? null : i)} role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenFaq(isOpen ? null : i) } }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, padding: isMobile ? '20px 0' : '24px 0', cursor: 'pointer', userSelect: 'none' }}>
                    <span style={{ flex: 1, fontFamily: SERIF, fontSize: isMobile ? 18 : 20, fontWeight: 400, color: isOpen ? 'var(--yte-accent)' : 'var(--yte-ink)', lineHeight: 1.3, letterSpacing: '-0.2px', transition: 'color 0.2s' }}>{item.q}</span>
                    <span aria-hidden="true" style={{ flexShrink: 0, fontFamily: SANS, fontSize: 26, fontWeight: 300, color: 'var(--yte-accent)', lineHeight: 1, transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                  </div>
                  <div className={`ab-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="ab-faq-answer-inner">
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
