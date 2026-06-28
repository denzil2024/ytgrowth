import { useEffect, useState, useMemo } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free SEO tool: YouTube Thumbnail Tester (A/B compare) ───────────────
   /tools/youtube-thumbnail-tester. Zero YouTube-API cost: images are read in
   the browser with FileReader and never leave the device. Renders the user's
   own real thumbnails inside CSS mockups of real YouTube layouts (does not
   generate fake images). Visual DNA mirrors the other tool pages. */

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
        --ytg-bg:           #f4f4f6;
        --ytg-bg-2:         #ecedf1;
        --ytg-bg-3:         #e6e7ec;
        --ytg-text:         #0a0a0f;
        --ytg-text-2:       rgba(10,10,15,0.62);
        --ytg-text-3:       rgba(10,10,15,0.40);
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
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; scrollbar-width: auto; scrollbar-color: rgba(10,10,15,0.28) transparent; }
      ::-webkit-scrollbar { width: 12px; height: 12px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background-color: rgba(10,10,15,0.28); border-radius: 10px; border: 3px solid transparent; background-clip: content-box; }
      ::-webkit-scrollbar-thumb:hover { background-color: rgba(10,10,15,0.48); background-clip: content-box; }
      @keyframes abFadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .ab-btn {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
        padding: 14px 28px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .ab-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,48,42,0.42); }
      .ab-btn-lg { font-size: 16px; padding: 17px 36px; }

      .ab-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid rgba(10,10,15,0.09); border-radius: 100px; padding: 5px 12px 5px 10px; margin-bottom: 20px; box-shadow: 0 1px 2px rgba(10,10,15,0.04); }
      .ab-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ytg-accent); box-shadow: 0 0 0 3px rgba(229,48,42,0.12); }
      .ab-eyebrow-text { font-size: 11px; font-weight: 700; color: var(--ytg-text-2); text-transform: uppercase; letter-spacing: 0.09em; }

      /* Quiet view toggle. Soft-grey active, never red. */
      .ab-seg { display: inline-flex; background: var(--ytg-bg-3); border: 1px solid var(--ytg-border); border-radius: 12px; padding: 4px; gap: 4px; flex-wrap: wrap; }
      .ab-seg button { font-family: inherit; font-size: 13px; font-weight: 600; letter-spacing: -0.1px; color: var(--ytg-text-2); background: transparent; border: none; padding: 8px 16px; border-radius: 9px; cursor: pointer; transition: background 0.15s, color 0.15s, box-shadow 0.15s; }
      .ab-seg button.active { background: var(--ytg-accent); color: #fff; box-shadow: 0 1px 3px rgba(229,48,42,0.28); }

      .ab-title-input { width: 100%; font-family: 'Roboto', 'Inter', system-ui, sans-serif; border: none; background: transparent; outline: none; color: #0f0f0f; padding: 0; resize: none; }
      .ab-title-input:focus { background: rgba(10,10,15,0.03); border-radius: 4px; }

      .ab-drop { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; width: 100%; height: 100%; cursor: pointer; color: var(--ytg-text-3); text-align: center; padding: 12px; background: var(--ytg-bg-3); transition: background 0.15s; }
      .ab-drop:hover { background: #dfe0e6; }

      .ab-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease; }
      .ab-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .ab-faq-answer-inner { overflow: hidden; }

      .ab-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }

      @media (max-width: 900px) { .ab-grid-3 { grid-template-columns: 1fr; } }
      @media (max-width: 768px) { .ab-section-pad { padding-left: 20px !important; padding-right: 20px !important; } .ab-cta-pad { padding: 70px 24px !important; } }
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

function Eyebrow({ children }) {
  return (
    <div className="ab-eyebrow">
      <span aria-hidden="true" className="ab-eyebrow-dot" />
      <span className="ab-eyebrow-text">{children}</span>
    </div>
  )
}

/* One mock YouTube result card showing the user's uploaded thumbnail. */
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
          <span style={{ fontSize: 12, fontWeight: 600 }}>Upload thumbnail {label}</span>
          <span style={{ fontSize: 10.5 }}>1280x720, JPG or PNG</span>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files && e.target.files[0])} />
        </label>
      )}
      {/* Mock duration stamp, as on real YouTube */}
      {img && <span style={{ position: 'absolute', right: 6, bottom: 6, background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '1px 4px', borderRadius: 4, fontFamily: 'Roboto, Inter, sans-serif' }}>10:24</span>}
    </div>
  )

  const meta = (
    <div style={{ minWidth: 0, flex: horizontal ? 1 : undefined, paddingTop: horizontal ? 0 : 10, display: 'flex', gap: 10 }}>
      {!horizontal && <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ytg-bg-3)', flexShrink: 0 }} />}
      <div style={{ minWidth: 0, flex: 1 }}>
        <textarea className="ab-title-input" rows={2} value={title} onChange={(e) => onTitle(e.target.value)}
          style={{ fontSize: titleSize, fontWeight: 600, lineHeight: 1.3, color: '#0f0f0f', maxHeight: titleSize * 2.8, overflow: 'hidden' }} />
        <div style={{ fontSize: 12.5, color: '#606060', fontFamily: 'Roboto, Inter, sans-serif', marginTop: 2 }}>Your Channel</div>
        <div style={{ fontSize: 12.5, color: '#606060', fontFamily: 'Roboto, Inter, sans-serif' }}>12K views · 2 days ago</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#fff', border: `1px solid ${picked ? 'var(--ytg-accent)' : 'var(--ytg-border)'}`, boxShadow: picked ? '0 0 0 3px var(--ytg-accent-light), var(--ytg-shadow)' : 'var(--ytg-shadow-sm)', borderRadius: 16, padding: 18, transition: 'border-color 0.15s, box-shadow 0.15s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 15, fontWeight: 800, color: 'var(--ytg-text)' }}>Thumbnail {label}</span>
        {img && (
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ytg-accent-text)', cursor: 'pointer' }}>
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

      <button onClick={onPick}
        style={{ width: '100%', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, padding: '11px', borderRadius: 10, cursor: 'pointer', border: 'none', background: 'var(--ytg-accent)', color: '#fff', boxShadow: picked ? '0 0 0 3px var(--ytg-accent-light), 0 4px 14px rgba(229,48,42,0.32)' : '0 1px 3px rgba(229,48,42,0.28)', transition: 'box-shadow 0.15s, filter 0.15s' }}
        onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.06)' }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}>
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

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', overflowX: 'hidden' }}>

      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="ab-section-pad" style={{ position: 'relative', padding: isMobile ? '64px 24px 56px' : '110px 48px 84px', textAlign: 'center', background: '#ffffff', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120vw', maxWidth: 1400, height: 620, background: 'radial-gradient(ellipse at center top, rgba(229,48,42,0.07) 0%, rgba(229,48,42,0.02) 40%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'abFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 34 : 60, lineHeight: isMobile ? 1.1 : 1.04, letterSpacing: isMobile ? '-0.6px' : '-2.2px', color: 'var(--ytg-text)', marginBottom: 22, textWrap: 'balance' }}>
            Test your thumbnails <span style={{ color: 'var(--ytg-accent)' }}>before you post.</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 660, margin: '0 auto 28px', textWrap: 'pretty' }}>
            Load two thumbnails and see them side by side at the real size viewers see in the feed, on mobile, and in suggested. Pick the one that wins the small-tile test.
          </p>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', fontWeight: 500 }}>No signup. Your images never leave your browser.</p>
        </div>
      </section>

      {/* ══ TOOL ══ */}
      <section id="tool" className="ab-section-pad" style={{ padding: isMobile ? '40px 20px 80px' : '56px 48px 110px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          {/* Context toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <div className="ab-seg" role="tablist">
              {Object.entries(CONTEXTS).map(([key, c]) => (
                <button key={key} className={ctxKey === key ? 'active' : ''} onClick={() => setCtxKey(key)} role="tab" aria-selected={ctxKey === key}>{c.label}</button>
              ))}
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--ytg-text-3)', marginBottom: 28 }}>Each thumbnail is shown at its true display width in this surface. Edit the titles to test the full package.</p>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 22, alignItems: 'start' }}>
            <MockCard label="A" img={imgs[0]} title={titles[0]} ctx={ctx}
              onTitle={(v) => setTitles((t) => [v, t[1]])} onFile={(f) => onFile(0, f)}
              picked={picked === 0} onPick={() => setPicked(picked === 0 ? null : 0)} />
            <MockCard label="B" img={imgs[1]} title={titles[1]} ctx={ctx}
              onTitle={(v) => setTitles((t) => [t[0], v])} onFile={(f) => onFile(1, f)}
              picked={picked === 1} onPick={() => setPicked(picked === 1 ? null : 1)} />
          </div>

          {/* ── ANALYSIS ─────────────────────────────────────────────── */}
          <div style={{ marginTop: 22, background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 18, boxShadow: 'var(--ytg-shadow)', padding: isMobile ? 22 : 30 }}>
            {!analysis ? (
              <div style={{ textAlign: 'center', color: 'var(--ytg-text-3)', padding: '18px 0' }}>
                <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 17, fontWeight: 700, color: 'var(--ytg-text-2)', marginBottom: 6 }}>Upload both thumbnails to analyze</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, maxWidth: 440, margin: '0 auto' }}>We read each image in your browser and score contrast, color, brightness, and clarity, then call the stronger one with the reasons.</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Our pick</div>
                    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 22 : 26, fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--ytg-text)' }}>
                      {analysis.winner === 'tie' ? 'Too close to call' : `Thumbnail ${analysis.winner} wins`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[['A', analysis.sa.overall], ['B', analysis.sb.overall]].map(([lbl, sc]) => {
                      const win = analysis.winner === lbl
                      return (
                        <div key={lbl} style={{ textAlign: 'center', minWidth: 62, padding: '8px 12px', borderRadius: 12, background: win ? 'var(--ytg-accent)' : 'var(--ytg-bg-3)', color: win ? '#fff' : 'var(--ytg-text-2)' }}>
                          <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{sc}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, marginTop: 3, opacity: 0.85 }}>{lbl}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.6, marginBottom: 20 }}>{reasonText(analysis.sa, analysis.sb, analysis.winner)}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                  {METRICS.map(([key, label]) => {
                    const av = analysis.sa[key], bv = analysis.sb[key], aWin = av >= bv
                    return (
                      <div key={key}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ytg-text-2)', marginBottom: 6 }}>{label}</div>
                        {[['A', av, aWin], ['B', bv, !aWin]].map(([lbl, v, win]) => (
                          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <span style={{ width: 14, fontSize: 11, fontWeight: 700, color: 'var(--ytg-text-3)' }}>{lbl}</span>
                            <div style={{ flex: 1, height: 8, borderRadius: 100, background: 'var(--ytg-bg-3)', overflow: 'hidden' }}>
                              <div style={{ width: `${v}%`, height: '100%', borderRadius: 100, background: win ? 'var(--ytg-accent)' : 'rgba(10,10,15,0.22)', transition: 'width 0.3s ease' }} />
                            </div>
                            <span style={{ width: 26, fontSize: 12, fontWeight: 700, textAlign: 'right', color: win ? 'var(--ytg-accent-text)' : 'var(--ytg-text-3)', fontVariantNumeric: 'tabular-nums' }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>

                <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', lineHeight: 1.6, marginTop: 18 }}>
                  Scored on the visual signals that help a thumbnail pop at small size. A guide, not a guarantee. The real test is YouTube's live Test and Compare with your actual audience.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="ab-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, maxWidth: 720 }}>
            <Eyebrow>What wins the click</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, textWrap: 'balance' }}>
              The test your thumbnail <span style={{ color: 'var(--ytg-accent)' }}>has to pass.</span>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {[
              { h: 'It has to read at thumb size', p: "Viewers see your thumbnail as a small tile, not a full-screen image. If the focal point, text, or expression does not land at 250 pixels wide (and far smaller on mobile), it does not land at all. Comparing both options at real size is the whole game." },
              { h: 'Contrast separates you from the feed', p: "Your thumbnail competes against a wall of other tiles on YouTube's white or dark background. High contrast and a bold, distinct color palette make yours the one the eye stops on. Side by side, the higher-contrast option usually wins." },
              { h: 'One focal point beats a busy scene', p: "A single clear subject, often a face with a strong expression, reads instantly. A cluttered composition turns to noise when shrunk. Use the comparison to see which option keeps a clean focal point at small size." },
              { h: 'Title and thumbnail work as a pair', p: "Viewers read both together in a fraction of a second. Edit the mock titles here so you are testing the real package, not the image alone. The best combination is the one where the title adds what the thumbnail cannot say." },
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', gap: isMobile ? 12 : 56, paddingTop: i === 0 ? 0 : 28, borderTop: i === 0 ? 'none' : '1px solid var(--ytg-border)' }}>
                <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 20 : 22, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.5px', lineHeight: 1.25 }}>{row.h}</h3>
                <p style={{ fontSize: 15.5, color: 'var(--ytg-text-2)', lineHeight: 1.75 }}>{row.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW TO GROW (3 cards) ══ */}
      <section className="ab-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ marginBottom: 44, textAlign: 'center', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            <Eyebrow>Beyond the eye test</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
              Trust your gut, then <span style={{ color: 'var(--ytg-accent)' }}>check the data.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>The side-by-side test picks your best two. YTGrowth scores them against what is winning in your niche.</p>
          </div>
          <div className="ab-grid-3">
            {[
              { label: 'Thumbnail IQ', title: 'Score against the winners', body: 'Rate your thumbnail on contrast, faces, and text density against the top performers in your niche before you upload.', href: '/features/thumbnail-iq' },
              { label: 'Title Generator', title: 'Pair it with a title that pulls', body: 'Generate and score titles against the CTR signals that move clicks, so the package wins together.', href: '/tools/youtube-title-generator' },
              { label: 'AI Channel Audit', title: 'See your real CTR', body: 'A 10-dimension audit shows which videos are losing the click war and what to change first.', href: '/features/channel-audit' },
            ].map((card, i) => (
              <a key={i} href={card.href} style={{ display: 'block', background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 22, padding: 30, boxShadow: 'var(--ytg-shadow-sm)', textDecoration: 'none', transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow)'; e.currentTarget.style.borderColor = 'var(--ytg-border-2)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow-sm)'; e.currentTarget.style.borderColor = 'var(--ytg-border)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>{card.label}</p>
                <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.4px', marginBottom: 12, lineHeight: 1.25 }}>{card.title}</h3>
                <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.65 }}>{card.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DARK CTA ══ */}
      <section className="ab-section-pad ab-cta-pad" style={{ padding: isMobile ? '88px 24px' : '120px 48px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', width: 1000, height: isMobile ? 600 : 800, background: 'radial-gradient(ellipse, rgba(229,48,42,0.20) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '5px 12px 5px 10px', marginBottom: 22 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 0 3px rgba(229,48,42,0.18)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Free AI audit</span>
          </div>
          <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: '#ffffff', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
            You picked a winner. <span style={{ color: '#ff3b30' }}>Make every thumbnail one.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, marginBottom: 32, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Connect your channel for a free AI audit that scores your thumbnails, titles, and SEO against the videos winning in your niche.
          </p>
          <a href="/auth/login" className="ab-btn ab-btn-lg">Get my free audit →</a>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', marginTop: 16 }}>Free trial · no card · upgrade anytime</p>
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
              Everything creators ask about testing thumbnails. Still unsure? <a href="/contact" style={{ color: 'var(--ytg-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
            </p>
          </div>
          <div style={{ borderTop: '1px solid rgba(10,10,15,0.10)' }}>
            {FAQS.map((item, i) => {
              const isOpen = openFaq === i
              const num = String(i + 1).padStart(2, '0')
              return (
                <div key={i} style={{ borderBottom: '1px solid rgba(10,10,15,0.10)', position: 'relative' }}>
                  {isOpen && <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 2, background: 'var(--ytg-accent)', borderRadius: 2 }} />}
                  <div onClick={() => setOpenFaq(isOpen ? null : i)} role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenFaq(isOpen ? null : i) } }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 14 : 20, padding: isMobile ? '20px 0' : '24px 0', paddingLeft: isOpen ? (isMobile ? 16 : 22) : 0, cursor: 'pointer', transition: 'padding-left 0.25s ease', userSelect: 'none' }}>
                    <span style={{ fontSize: isMobile ? 12 : 13, fontWeight: 700, color: isOpen ? 'var(--ytg-accent)' : 'var(--ytg-text-3)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.5, flexShrink: 0, width: isMobile ? 22 : 28, paddingTop: 2, transition: 'color 0.2s' }}>{num}</span>
                    <span style={{ flex: 1, fontSize: isMobile ? 15 : 16, fontWeight: 600, color: 'var(--ytg-text)', lineHeight: 1.45, letterSpacing: '-0.2px' }}>{item.q}</span>
                    <span aria-hidden="true" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isOpen ? 'var(--ytg-accent)' : 'rgba(10,10,15,0.05)', border: `1px solid ${isOpen ? 'var(--ytg-accent)' : 'rgba(10,10,15,0.10)'}`, transition: 'background 0.2s, border-color 0.2s', marginTop: 1 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 5h8" stroke={isOpen ? '#ffffff' : 'var(--ytg-text-2)'} strokeWidth="1.8" strokeLinecap="round" />
                        {!isOpen && <path d="M5 1v8" stroke="var(--ytg-text-2)" strokeWidth="1.8" strokeLinecap="round" />}
                      </svg>
                    </span>
                  </div>
                  <div className={`ab-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="ab-faq-answer-inner">
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
