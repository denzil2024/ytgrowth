import { useEffect, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import { injectFaqJsonLd } from '../../utils/seo'

/* Thumbnail IQ feature page. Migrated to the editorial design language
   (Fraunces + Barlow, sharp flat cards, warm paper, restrained red). The old
   white→dark→light rhythm is now predominantly warm paper; the scorecard and
   niche-benchmark stay dark "app preview" panes (on-dark accents use warm gold
   #e6b35c, since red goes muddy on near-black). Foreign green/amber/blue tints
   neutralised to ink/accent/gold; mock thumbnails + the niche palette swatch
   are warm/brand-toned rather than rainbow; output icons are neutral ink; body
   italics removed; bottom CTA removed. ALL copy, FAQs, the 13 scoring
   dimensions, and product detail preserved. Classes use the .tiq- prefix to
   avoid collision with the in-app product page. See
   project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"
/* On-dark accent. Red goes muddy on near-black, so the dark "app preview"
   panes use a warm gold (the Zennara-lineage on-dark tone) instead. */
const GOLD = '#e6b35c'

function useBreakpoint() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return { isMobile: w <= 768, isTablet: w <= 1024 }
}

function useStyles() {
  useEffect(() => {
    if (document.getElementById('tiq-styles')) return
    const style = document.createElement('style')
    style.id = 'tiq-styles'
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
      @keyframes tiqFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .tiq-wrap { max-width: 1120px; margin: 0 auto; }
      .tiq-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .tiq-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .tiq-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .tiq-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.05; }
      .tiq-h1 em { font-style: italic; color: var(--yte-accent); }
      .tiq-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .tiq-h2 em { font-style: italic; color: var(--yte-accent); }
      .tiq-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .tiq-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--yte-accent); color: #fff; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 15px 30px; border: none; border-radius: 0; cursor: pointer; text-decoration: none; transition: filter 0.18s, transform 0.18s; }
      .tiq-btn:hover { filter: brightness(1.06); transform: translateY(-1px); }
      .tiq-btn-lg { font-size: 13px; padding: 17px 36px; }
      .tiq-ghost { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 15px 28px; border-radius: 0; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--yte-soft); text-decoration: none; background: var(--yte-surface); border: 1px solid var(--yte-line); transition: color 0.15s, border-color 0.15s; }
      .tiq-ghost:hover { color: var(--yte-ink); border-color: var(--yte-line-2); }

      .tiq-faq-item { border-bottom: 1px solid var(--yte-line); }
      .tiq-faq-q { background: none; border: none; cursor: pointer; width: 100%; text-align: left; padding: 22px 0; font-family: ${SERIF}; display: flex; justify-content: space-between; align-items: center; gap: 18px; font-size: 20px; font-weight: 400; color: var(--yte-ink); letter-spacing: -0.2px; line-height: 1.3; transition: color 0.2s; }
      .tiq-faq-q:hover { color: var(--yte-accent); }
      .tiq-faq-q.open { color: var(--yte-accent); }
      .tiq-faq-plus { flex-shrink: 0; font-family: ${SANS}; font-size: 26px; font-weight: 300; color: var(--yte-accent); line-height: 1; transition: transform 0.2s; }
      .tiq-faq-plus.open { transform: rotate(45deg); }
      .tiq-faq-a { font-family: ${SANS}; font-size: 15.5px; color: var(--yte-soft); line-height: 1.78; padding: 0 0 24px 0; max-width: 720px; display: none; }
      .tiq-faq-a.open { display: block; }
      .tiq-faq-a b { font-weight: 600; color: var(--yte-ink); }

      @media (max-width: 900px) {
        .tiq-grid-2 { grid-template-columns: 1fr !important; gap: 36px !important; }
        .tiq-grid-3 { grid-template-columns: 1fr !important; }
        .tiq-grid-4 { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 600px) {
        .tiq-grid-4 { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 768px) {
        .tiq-section-pad { padding-left: 22px !important; padding-right: 22px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children, center }) {
  return (
    <div className="tiq-eyebrow" style={center ? { justifyContent: 'center' } : undefined}>
      <span aria-hidden="true" className="tiq-eyebrow-rule" />
      <span className="tiq-eyebrow-text">{children}</span>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="tiq-faq-item">
      <button className={`tiq-faq-q${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span style={{ flex: 1 }}>{q}</span>
        <span aria-hidden="true" className={`tiq-faq-plus${open ? ' open' : ''}`}>+</span>
      </button>
      <div className={`tiq-faq-a${open ? ' open' : ''}`}>{a}</div>
    </div>
  )
}

/* ── Visual: Combined scorecard (algorithm 60 + vision 40 = 100, dark) ──── */
function ThumbnailScorecardVisual() {
  const rows = [
    { label: 'Contrast (stddev 87)',    score: 100 },
    { label: 'Face coverage 24%',       score: 100 },
    { label: 'Text readability (WCAG)', score: 70 },
    { label: 'Feed distinctiveness',    score: 80 },
  ]
  return (
    <div style={{ background: 'var(--yte-ink)', padding: 26 }}>
      {/* Faux thumbnail strip */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <div style={{ width: 96, height: 54, background: 'linear-gradient(135deg, #e6b35c 0%, #2a241a 100%)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: 4, left: 5, right: 5, fontFamily: SANS, fontSize: 8, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.6)', letterSpacing: '-0.3px' }}>I TRIED THIS FOR 30 DAYS</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>I tried this for 30 days...</p>
          <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>1280×720 · listicle · micro channel</p>
        </div>
      </div>
      {/* Score header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 18 }}>
        <span style={{ fontFamily: SERIF, fontSize: 48, fontWeight: 400, color: GOLD, letterSpacing: '-1px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>78</span>
        <span style={{ fontFamily: SANS, fontSize: 18, color: 'rgba(255,255,255,0.35)' }}>/100</span>
        <span style={{ marginLeft: 'auto', fontFamily: SANS, fontSize: 10, fontWeight: 700, color: GOLD, border: '1px solid rgba(230,179,92,0.4)', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Stands out</span>
      </div>
      {/* Layer 1 + Layer 2 split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
        {[
          { l: 'Layer 1 · algorithm', n: 48, d: 60, sub: 'OpenCV · OCR · WCAG' },
          { l: 'Layer 2 · vision AI', n: 30, d: 40, sub: 'Sonnet 4.6 vs niche' },
        ].map((c, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 14px' }}>
            <p style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{c.l}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: '#fff', letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{c.n}</span>
              <span style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>/{c.d}</span>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 10.5, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{c.sub}</p>
          </div>
        ))}
      </div>
      {/* Component bars */}
      {rows.map((row, i) => (
        <div key={i} style={{ marginBottom: i < 3 ? 11 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>{row.label}</span>
            <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.85)', fontVariantNumeric: 'tabular-nums' }}>{row.score}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${row.score}%`, background: GOLD }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Visual: Niche benchmark comparison (your thumb vs top 3, dark) ─────── */
function BenchmarkVisual() {
  return (
    <div style={{ background: 'var(--yte-ink)', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14, gap: 12 }}>
        <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Niche benchmark · listicle · micro</p>
        <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: '0.04em', flexShrink: 0 }}>10 top performers</span>
      </div>
      {/* Your thumb row */}
      <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Yours</p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ width: 84, height: 47, background: 'linear-gradient(135deg, #e6b35c 0%, #2a241a 100%)', flexShrink: 0 }} />
        <div style={{ flex: 1, fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
          <p>Contrast <span style={{ color: GOLD, fontWeight: 700 }}>87</span> · benchmark avg 64 → <span style={{ color: GOLD }}>+36%</span></p>
          <p>Face <span style={{ color: GOLD, fontWeight: 700 }}>yes (24%)</span> · 80% of top performers also have a face</p>
        </div>
      </div>
      {/* Top 3 benchmark thumbnails */}
      <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Top 3 by velocity</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
        {[
          { g: 'linear-gradient(135deg, #b98a3e 0%, #1a160e 70%)', v: '12.4K/d' },
          { g: 'linear-gradient(135deg, #e6b35c 0%, #3a2f1e 100%)', v: '9.1K/d' },
          { g: 'linear-gradient(135deg, #6b6052 0%, #1a160e 100%)', v: '6.7K/d' },
        ].map((b, i) => (
          <div key={i}>
            <div style={{ aspectRatio: '16/9', background: b.g, marginBottom: 4 }} />
            <p style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>{b.v}</p>
          </div>
        ))}
      </div>
      {/* Niche averages */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', padding: '10px 12px' }}>
        <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Niche signature</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
          <span>Face rate</span><span style={{ fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>80%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
          <span>Text-overlay rate</span><span style={{ fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>90%</span>
        </div>
        <p style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Common color palette</p>
        <div style={{ display: 'flex', gap: 4 }}>
          {['#e5302a', '#e6b35c', '#1a1a2e', '#3a2f1e', '#f6f4ef', '#8a8378'].map((c, i) => (
            <div key={i} style={{ width: 18, height: 18, background: c, border: '1px solid rgba(255,255,255,0.14)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── 13 scoring components (7 algorithm + 6 vision) ────────────────────── */
const ALGORITHM_DIMENSIONS = [
  { name: 'Dimensions',           weight: 5,  what: 'Full credit at 1280×720 (YouTube’s recommended resolution). Partial at any 16:9 ratio. Zero off-ratio. Those get cropped or letterboxed in feeds and tank CTR.' },
  { name: 'File size',            weight: 5,  what: 'Full credit under 2 MB. Partial under 4 MB. Zero above 4 MB (loads slow on mobile data, hurts the first-frame impression).' },
  { name: 'Contrast (stddev)',    weight: 15, what: 'Greyscale standard deviation across the whole image. >80 wins full credit. High contrast separates from feed neighbours. <30 means the thumbnail looks washed out.' },
  { name: 'Face presence',        weight: 10, what: 'Haar cascade face detection. >20% of image area = full credit (faces drive CTR). 10–20% = partial. Detected at all = base credit. Zero faces is OK if vision Layer 2 says the scene compensates.' },
  { name: 'Text presence',        weight: 10, what: '10–30% of image covered by text wins full credit (sweet spot. Readable on mobile, doesn’t crowd the visual). >30% feels cluttered, gets capped.' },
  { name: 'Text readability (WCAG)', weight: 10, what: 'Real WCAG luminance-contrast ratio between text and its background. >7:1 wins full credit (AAA). >4.5:1 is partial. Below 3 reads as a smear at 200px.' },
  { name: 'Color vibrancy',       weight: 5,  what: 'Mean HSV saturation. >120 wins full credit (vivid). Plus k-means dominant color extraction so Layer 2 can compare against the niche palette.' },
]

const VISION_DIMENSIONS = [
  { name: 'Facial emotion',          weight: 10, what: 'What specific emotion is expressed? Is it readable at 200px (mobile feed size)? Does it match the video’s promise? If no face, does the scene create equivalent emotional pull?' },
  { name: 'Text psychology',         weight: 10, what: 'Does the text create curiosity tension without revealing the answer? Does it complement or contradict the image? Bold enough for mobile? If no text, scored against whether the visual is strong enough alone.' },
  { name: 'Color psychology',        weight: 10, what: 'Are colors emotionally congruent with the topic? Is there a single dominant color that separates this in the feed? Compared directly against the benchmark color palette.' },
  { name: 'Composition & visual hierarchy', weight: 10, what: 'Where does the eye go first? Is there visual tension? Is the most important element in a rule-of-thirds power zone? Mobile-first read, since most YouTube viewing is mobile.' },
  { name: 'Title-thumbnail relationship', weight: 10, what: 'Do the title and thumbnail tell DIFFERENT parts of the same story (the gold standard). Or is the thumbnail just illustrating the title? Scored zero if no title was provided.' },
  { name: 'Feed distinctiveness',    weight: 10, what: 'Compared against the actual top 3 benchmark thumbnails for your niche. Would this stand out, blend in, or disappear? Names the single most distinctive element. Or explains exactly why it blends.' },
]

const PIPELINE_OUTPUTS = [
  { icon: 'gauge',  title: 'Combined score 0–100',         body: 'Layer 1 contributes up to 60 (deterministic CV). Layer 2 contributes up to 40 (Claude vision). Same scale every time so you can track improvement across versions.' },
  { icon: 'eye',    title: 'Niche-aware vision read',       body: 'Claude scores against the actual top 3 benchmark thumbnails for your keyword + format + size bracket. Not generic best practices. Feed distinctiveness is real.' },
  { icon: 'pulse',  title: 'Per-dimension verdict + fix',   body: 'Each of the 13 dimensions returns a one-sentence verdict referencing exact visual elements, plus one concrete fix when the score is below 8. Names colors, words, positions.' },
  { icon: 'sword',  title: 'Biggest win + biggest fix',     body: 'The single strongest element to keep. The single highest-impact change to make. Plus an emotion label, feed-position tag, and click-through prediction vs niche average.' },
  { icon: 'gap',    title: 'Niche benchmark comparison',    body: 'Your face %, text %, vibrancy, contrast each plotted against the niche average. Same metrics from the same algorithm. Apples to apples.' },
  { icon: 'percent',title: 'Percentile vs peers',           body: 'Where your thumbnail ranks among every other Thumbnail IQ analysis run for this exact keyword + format + size bracket. So you know whether 78/100 is good for THIS niche.' },
  { icon: 'history',title: 'Version history',               body: 'Re-upload a revised version and the score is tracked side by side. The history panel shows which iteration moved which dimension and how close you are to the niche top.' },
]

const ICON_PATHS = {
  gauge:   'M3 11a5 5 0 0 1 10 0M8 8v3l2 2',
  eye:     'M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
  pulse:   'M1 8h3l2-5 4 10 2-5h3',
  sword:   'M3 13l8-8M11 5l2-2M5 13H3v-2',
  gap:     'M2 8h5M9 8h5M5 5l-3 3 3 3M11 5l3 3-3 3',
  percent: 'M3 13L13 3M5 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M11 14a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3',
  history: 'M2 8a6 6 0 1 0 6-6M2 8V4M2 8h4M8 5v3l2 2',
}

function OutputIcon({ name }) {
  return (
    <div style={{ width: 38, height: 38, background: 'rgba(20,19,15,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="var(--yte-ink)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d={ICON_PATHS[name]}/>
      </svg>
    </div>
  )
}

const PLAN_LIMITS = [
  { plan: 'Free',    runs: '1',   note: 'One thumbnail score per cycle. Full two-layer analysis' },
  { plan: 'Solo',    runs: '20',  note: 'Score every iteration · 3 channels' },
  { plan: 'Growth',  runs: '50',  note: 'Same engine, higher monthly allowance · 5 channels' },
  { plan: 'Agency',  runs: '150', note: 'Pooled across 10 channels · per-version history' },
]

const FAQS = [
  {
    q: 'Why two layers? Isn’t the AI smart enough on its own?',
    a: <>Vision models are good at semantic reads (emotion, composition, psychology) but unreliable at measurements. Asking Claude "what’s the contrast ratio of this text?" gets a confident guess. Layer 1 measures the things that should be measured. Actual pixel stddev for contrast, real Haar-cascade face detection, OCR for text coverage, WCAG luminance ratios for readability, k-means for dominant colors. Layer 2 then judges what only judgment can judge. Does the emotion match the topic, does the composition lead the eye, does this stand out against the actual niche feed. The split is the whole point.</>,
  },
  {
    q: 'How is the niche benchmark built? Where does the comparison come from?',
    a: <>For your keyword + format + size bracket we fetch the top 50 YouTube videos via the official Data API, filter for above-median view velocity, last-12-months only, &gt;10K views, format match (tutorial / listicle / story / comparison / revelation), and channel-size bracket match (nano &lt;10K, micro &lt;100K, mid &lt;1M, macro 1M+). The top 10 by velocity become your benchmark pool. We run Layer 1 on each of their thumbnails and average the metrics. The pool is cached for 30 days and shared across users on the same niche, so your run isn’t paying for someone else’s benchmark build.</>,
  },
  {
    q: 'What does "channel size bracket" do?',
    a: <>Comparing a 5K-sub thumbnail against MrBeast’s feed is useless. The benchmark pool only includes top performers in <b>your</b> size bracket (nano / micro / mid / macro), so the score reflects what really wins among channels that real viewers see alongside yours. A 78 on Thumbnail IQ for a nano channel means the thumbnail beats the average top-performing nano thumbnail in your niche. A target you can genuinely hit.</>,
  },
  {
    q: 'How accurate is the face detection. Can it tell emotion?',
    a: <>Layer 1 uses OpenCV’s Haar cascade for detection (presence, count, position, coverage percentage). Detection is reliable for forward-facing faces; it misses heavy profile shots and partial faces. <b>Emotion</b> is a Layer 2 read. Claude vision describes the specific emotion ("intense focus", "barely-suppressed laugh") and judges whether it’s readable at 200px. If Layer 1 misses your face but Layer 2 sees it, the vision score still credits you; nothing is double-penalized.</>,
  },
  {
    q: 'What if my thumbnail has no text?',
    a: <>Text presence scores zero in Layer 1. Layer 2’s text-psychology dimension also scores 0. UNLESS the visual is exceptionally strong, in which case Claude is allowed to flag it as an intentional choice (some niches like ASMR or cinematic vlogs win without text). The combined score will still come out reasonable if the rest of the thumbnail compensates. We don’t hand back "ADD TEXT" as the universal fix; the suggestion is contextual to your niche.</>,
  },
  {
    q: 'Can I score a thumbnail before I publish the video?',
    a: <>Yes, that’s the primary use case. Upload the image, paste your draft title, pick the keyword you’re targeting. The studio runs both layers, compares against the niche pool, returns the score and the per-dimension fixes. Iterate, re-upload, score again. Every version is tracked in the history panel so you can see exactly which change moved the score, and by how much.</>,
  },
  {
    q: 'Do you compare thumbnails to the same competitors my SEO Studio analyzes?',
    a: <>Often, yes. Both surfaces use YouTube’s niche-search results as the source of truth for "who’s winning here". The benchmark pool for thumbnails additionally filters by channel-size bracket and format, so the comparison set is sharper than what SEO Studio uses for title rewrites. If you’ve linked a video idea from competitor research, Thumbnail IQ explicitly references the competitor gap that idea exploits. And judges whether your thumbnail can win against those exact channels.</>,
  },
  {
    q: 'How does the percentile work?',
    a: <>For every Thumbnail IQ analysis run on your same keyword + format + size bracket (across all users, since most niches have multiple creators using the tool), we compute the average algorithm score. Your percentile is "how many of those analyses scored below yours". A 78/100 might be 92nd percentile in some niches and 60th in others. The percentile is what tells you whether your number is competitive. New niches with no peers yet show 50th percentile by default until enough data accumulates.</>,
  },
  {
    q: 'Will Thumbnail IQ work for Shorts thumbnails?',
    a: <>Layer 1 works the same. Pixel measurements don’t care about the platform. Layer 2 currently judges against the standard 16:9 long-form benchmark pool, so feed-distinctiveness scoring for vertical Shorts thumbnails is approximate. Shorts get less play from the thumbnail itself (most plays start before the thumbnail loads), so this is intentionally not the top priority right now. If your Shorts thumbnails are critical to your funnel, email support and we’ll prioritize the Shorts pool build.</>,
  },
  {
    q: 'How long does an analysis take, and what does it cost?',
    a: <>~20–35 seconds end-to-end on a fresh niche (Layer 1 on your image, fetch + Layer 1 on benchmark thumbnails if pool isn’t cached, then Layer 2 vision call). Cached niches return in ~10–15 seconds. Free tier gets 1 thumbnail analysis per cycle; paid plans charge one credit per run (Solo 20, Growth 50, Agency 150 pooled). Re-uploading a revised version of the same thumbnail charges a new credit because we re-run both layers from scratch.</>,
  },
  {
    q: 'Are my thumbnails stored? Can other users see them?',
    a: <>Your uploaded thumbnail is stored on our infrastructure so the analysis can rehydrate when you reopen it later, and so the version-history panel can compare iterations. It is never shown to other users and never used as benchmark data for other channels. The benchmark pool only ever contains <b>public</b> thumbnails from the YouTube API. Videos that are already published and ranking. You can permanently clear an upload from the analysis history at any time.</>,
  },
  {
    q: 'What does "feed distinctiveness" measure?',
    a: <>It’s the highest-impact Layer 2 dimension. We show Claude your thumbnail alongside the actual top 3 benchmark thumbnails (by view velocity) for your exact niche, format, and size bracket. And ask: would this stand out, blend in, or disappear in that feed? The score is anchored to the visual context a real viewer would see your thumbnail in, which is the only honest way to judge "click-worthiness". Generic best-practice advice can’t do this.</>,
  },
]

/* Layer-divider label: accent eyebrow text + hairline rule + points count */
function LayerDivider({ label, points }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
      <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-accent)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: 'var(--yte-line)' }} />
      <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-muted)', letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums' }}>{points}</span>
    </div>
  )
}

function DimensionCard({ index, d }) {
  return (
    <div style={{ background: 'var(--yte-surface)', padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: 'var(--yte-accent)' }}>{String(index).padStart(2, '0')}</span>
        <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.2px', flex: 1 }}>{d.name}</p>
        <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: 'var(--yte-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{d.weight} pts</span>
      </div>
      <p style={{ fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-soft)', lineHeight: 1.72 }}>{d.what}</p>
    </div>
  )
}

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function ThumbnailIq() {
  useStyles()
  useEffect(() => { injectFaqJsonLd(FAQS) }, [])
  const { isMobile } = useBreakpoint()

  const H2 = isMobile ? 30 : 42

  return (
    <div style={{ background: 'var(--yte-bg)', minHeight: '100vh', fontFamily: SANS, color: 'var(--yte-ink)' }}>

      {/* ════ NAV ════ */}
      <SiteHeader />

      {/* ════ 1. HERO ════ */}
      <section className="tiq-section-pad" style={{ padding: isMobile ? '60px 22px 48px' : '104px 48px 64px', background: 'var(--yte-bg)' }}>
        <div className="tiq-wrap" style={{ animation: 'tiqFadeUp 0.5s ease both' }}>
          <Eyebrow>Thumbnail IQ</Eyebrow>
          <h1 className="tiq-h1" style={{ fontSize: isMobile ? 34 : 56, marginBottom: 22, maxWidth: 940, textWrap: 'balance' }}>
            The only thumbnail score that <em>compares against your real niche feed.</em>
          </h1>
          <p className="tiq-lead" style={{ fontSize: isMobile ? 16 : 17.5, maxWidth: 720, marginBottom: 32, textWrap: 'pretty' }}>
            Two layers, one number. Layer 1 measures contrast, faces, text coverage, WCAG readability, vibrancy with real computer vision. Layer 2 hands the image to Claude vision and asks if it can stand out against the top 3 thumbnails really winning in your keyword + format + size bracket. Free creators get one full run per cycle.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/auth/login" className="tiq-btn tiq-btn-lg">Score a thumbnail →</a>
            <a href="#how" className="tiq-ghost">See how it works</a>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', marginTop: 22, letterSpacing: '0.03em' }}>
            Free plan unlocks one full analysis · ~25 seconds per run · re-upload revised versions for side-by-side history
          </p>
        </div>
      </section>

      {/* ════ 2. SCORECARD (split) ════ */}
      <section className="tiq-section-pad" style={{ padding: isMobile ? '64px 22px' : '88px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="tiq-grid-2 tiq-wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 56, alignItems: 'center' }}>
          <div>
            <Eyebrow>The 0–100 score</Eyebrow>
            <h2 className="tiq-h2" style={{ fontSize: H2, marginBottom: 18 }}>
              One number that fuses pixel measurements <em>with niche-aware judgement.</em>
            </h2>
            <p className="tiq-lead" style={{ fontSize: 17, marginBottom: 24 }}>
              Layer 1 contributes up to 60 deterministic points (contrast, face, text, readability, vibrancy, dimensions, file size). Layer 2 contributes up to 40 vision points (emotion, text psychology, color psychology, composition, title-thumbnail fit, feed distinctiveness). Same scale every time. So an 81 next month is genuinely better than tonight’s 78.
            </p>
            {[
              'Layer 1. Pixel measurements that should be measured',
              'Layer 2. Judgements that only judgement can make',
              'Same scale every run. Track improvement across versions',
              'Compared against your niche, not generic best practice',
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 11 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--yte-accent)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M2.5 7.2 5.4 10l6.1-6"/></svg>
                <span style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.6 }}>{b}</span>
              </div>
            ))}
          </div>
          <div><ThumbnailScorecardVisual /></div>
        </div>
      </section>

      {/* ════ 3. THE 13 DIMENSIONS ════ */}
      <section className="tiq-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="tiq-wrap">
          <div style={{ maxWidth: 780, marginBottom: 44 }}>
            <Eyebrow>Thirteen scoring dimensions</Eyebrow>
            <h2 className="tiq-h2" style={{ fontSize: H2, marginBottom: 16, textWrap: 'balance' }}>
              We measure what should be measured. <em>And judge what should be judged.</em>
            </h2>
            <p className="tiq-lead" style={{ fontSize: 17 }}>
              Seven Layer 1 components run pixel-level computer vision (60 points). Six Layer 2 dimensions run Claude Sonnet 4.6 vision against your niche feed (40 points). Each one returns a score, a one-sentence verdict referencing exact visual elements, and a concrete fix when below 8.
            </p>
          </div>

          {/* Layer 1 grid */}
          <LayerDivider label="Layer 1 · algorithm" points="60 points · 7 components" />
          <div className="tiq-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)', marginBottom: 40 }}>
            {ALGORITHM_DIMENSIONS.map((d, i) => (
              <DimensionCard key={i} index={i + 1} d={d} />
            ))}
          </div>

          {/* Layer 2 grid */}
          <LayerDivider label="Layer 2 · vision AI" points="40 points · 6 dimensions" />
          <div className="tiq-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)' }}>
            {VISION_DIMENSIONS.map((d, i) => (
              <DimensionCard key={i} index={i + 8} d={d} />
            ))}
          </div>
        </div>
      </section>

      {/* ════ 4. NICHE BENCHMARK (split) ════ */}
      <section className="tiq-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="tiq-grid-2 tiq-wrap" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div style={{ order: isMobile ? 1 : 0 }}>
            <BenchmarkVisual />
          </div>
          <div style={{ order: isMobile ? 0 : 1 }}>
            <Eyebrow>Niche-aware benchmarking</Eyebrow>
            <h2 className="tiq-h2" style={{ fontSize: H2, marginBottom: 18 }}>
              Compared against the channels <em>you’ll really be next to.</em>
            </h2>
            <p className="tiq-lead" style={{ fontSize: 17, marginBottom: 22 }}>
              For every analysis we build a benchmark pool: top 50 niche videos → above-median velocity → last 12 months → &gt;10K views → format match → size-bracket match. The top 10 by velocity become the comparison set. Layer 1 runs on each of their thumbnails, the metrics are averaged, and your face %, text %, contrast, vibrancy are compared head-to-head. The pool is cached per-niche for 30 days and shared across users. So most runs hit a warm cache.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {[
                { label: 'Format-aware',     body: 'Tutorial / listicle / story / comparison / revelation. Pulled separately.' },
                { label: 'Size-bracketed',   body: 'Nano / micro / mid / macro. Your peers, not MrBeast.' },
                { label: 'Velocity-ranked',  body: 'Views per day since publish. Recent winners, not stale viral hits.' },
                { label: 'Cached & shared',  body: '30-day pool TTL across users. Most runs hit a warm pool.' },
              ].map((p, i) => (
                <div key={i} style={{ borderLeft: '2px solid var(--yte-accent)', paddingLeft: 12 }}>
                  <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: 'var(--yte-accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{p.label}</p>
                  <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-soft)', lineHeight: 1.6 }}>{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════ 5. HOW IT WORKS ════ */}
      <section id="how" className="tiq-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ maxWidth: 720, marginBottom: 44 }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="tiq-h2" style={{ fontSize: H2, textWrap: 'balance' }}>
              From upload to scored verdict in <em>under 30 seconds.</em>
            </h2>
            <p className="tiq-lead" style={{ fontSize: 17, marginTop: 14, maxWidth: 600 }}>
              Five stages. Re-upload a revised version anytime. The version-history panel tracks the score across iterations so you can see exactly what moved the needle.
            </p>
          </div>
          {(() => {
            const steps = [
              { n: '01', t: 'Upload + context',     b: 'Drop the image, paste the draft title, pick the keyword you’re targeting. Or pull the title and keyword from a video idea you generated in Competitor Analysis.' },
              { n: '02', t: 'Layer 1 measures',      b: 'OpenCV detects faces, pytesseract reads any text, WCAG luminance ratio scores readability, k-means extracts dominant colors, HSV measures vibrancy. 60 points.' },
              { n: '03', t: 'Niche pool built',      b: 'Top 10 thumbnails for your keyword + format + size bracket are fetched + scored. Pool cached 30 days, shared across users. Most runs hit a warm pool.' },
              { n: '04', t: 'Layer 2 vision call',   b: 'Claude Sonnet 4.6 sees your thumbnail alongside the top 3 benchmark thumbnails and scores 6 psychological dimensions in context. 40 points.' },
              { n: '05', t: 'Combined result',       b: 'Score 0–100, per-dimension verdict + fix, biggest win, biggest fix, emotion label, feed-position tag, percentile vs peers, version saved to history.' },
            ]
            const Card = ({ s }) => (
              <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', padding: '22px 22px 24px', flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: 'var(--yte-accent)', letterSpacing: '0.06em', marginBottom: 14 }}>{s.n}</div>
                <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 400, color: 'var(--yte-ink)', marginBottom: 10, letterSpacing: '-0.2px', lineHeight: 1.2 }}>{s.t}</p>
                <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-soft)', lineHeight: 1.65 }}>{s.b}</p>
              </div>
            )
            const Arrow = ({ down }) => (
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', color: 'var(--yte-muted)', margin: down ? '8px auto' : 0 }}>
                <svg width="16" height="16" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {down ? <path d="M6 2v8M3 7l3 3 3-3"/> : <path d="M2 6h8M7 3l3 3-3 3"/>}
                </svg>
              </div>
            )
            if (isMobile) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {steps.map((s, i) => (
                    <div key={i}>
                      <Card s={s} />
                      {i < steps.length - 1 && <Arrow down />}
                    </div>
                  ))}
                </div>
              )
            }
            return (
              <div style={{ display: 'flex', alignItems: 'stretch', gap: 10 }}>
                {steps.flatMap((s, i) => {
                  const items = [<Card key={`c${i}`} s={s} />]
                  if (i < steps.length - 1) items.push(<Arrow key={`a${i}`} />)
                  return items
                })}
              </div>
            )
          })()}
        </div>
      </section>

      {/* ════ 6. SEVEN OUTPUT BLOCKS ════ */}
      <section className="tiq-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ maxWidth: 760, marginBottom: 40 }}>
            <Eyebrow>Output structure</Eyebrow>
            <h2 className="tiq-h2" style={{ fontSize: H2, marginBottom: 16, textWrap: 'balance' }}>
              Seven distinct output blocks. <em>Every one is fixable.</em>
            </h2>
            <p className="tiq-lead" style={{ fontSize: 17 }}>
              The studio doesn’t hand you a number and a vague verdict. Each block renders separately so you can scan, iterate, re-upload. And the history panel keeps every version side by side.
            </p>
          </div>
          <div className="tiq-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)' }}>
            {PIPELINE_OUTPUTS.map((p, i) => (
              <div key={i} style={{ background: 'var(--yte-surface)', padding: '22px 22px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <OutputIcon name={p.icon} />
                  <p style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 600, color: 'var(--yte-ink)', letterSpacing: '-0.1px' }}>{p.title}</p>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-soft)', lineHeight: 1.65 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 7. WHAT POWERS IT (split) ════ */}
      <section className="tiq-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="tiq-grid-2" style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <Eyebrow>What powers it</Eyebrow>
            <h2 className="tiq-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 16, textWrap: 'balance' }}>
              Open-source CV + Sonnet 4.6 vision. <em>Public data only.</em>
            </h2>
            <p className="tiq-lead" style={{ fontSize: 15 }}>
              Layer 1 runs entirely on our infrastructure. No third-party scoring API, no per-image fees. Layer 2 calls Claude Sonnet 4.6 with your thumbnail and the top 3 benchmark images. Benchmark thumbnails come from the official YouTube Data API; the same public images anyone visiting those channels can see. Each analysis spends one credit on paid plans; free tier gets one full analysis per cycle.
            </p>
          </div>
          <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', padding: '26px 28px' }}>
            {[
              { k: 'Face detection',         v: 'OpenCV Haar cascade · frontal-face classifier' },
              { k: 'Text OCR',                v: 'pytesseract · sparse-text page mode (psm 11)' },
              { k: 'Color extraction',        v: 'OpenCV k-means · k=3 dominant + HSV saturation' },
              { k: 'Readability ratio',       v: 'WCAG 2.2 luminance contrast · sampled per text box' },
              { k: 'Niche benchmark',         v: 'YouTube Data API · top 10 by view velocity, 30-day cache' },
              { k: 'Vision model',            v: 'Claude Sonnet 4.6 · 4-image input · ~12s on warm cache' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '11px 0', borderBottom: i < 5 ? '1px solid var(--yte-line)' : 'none', alignItems: 'baseline' }}>
                <p style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: 'var(--yte-ink)', letterSpacing: '-0.1px', flexShrink: 0 }}>{row.k}</p>
                <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-soft)', lineHeight: 1.55, textAlign: 'right' }}>{row.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 8. PLAN LIMITS ════ */}
      <section className="tiq-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ maxWidth: 720, marginBottom: 40 }}>
            <Eyebrow>By plan</Eyebrow>
            <h2 className="tiq-h2" style={{ fontSize: H2, marginBottom: 16, textWrap: 'balance' }}>
              How many thumbnail scores you get <em>each month.</em>
            </h2>
            <p className="tiq-lead" style={{ fontSize: 17 }}>
              Free creators get one full two-layer analysis per cycle so you can try the engine on a real thumbnail. Paid plans charge one credit per run. The same engine, no feature differences. Each re-uploaded version is a fresh analysis and a fresh credit.
            </p>
          </div>
          <div className="tiq-grid-4" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)' }}>
            {PLAN_LIMITS.map((p, i) => {
              const isAccent = p.plan === 'Growth'
              return (
                <div key={i} style={{ background: 'var(--yte-surface)', padding: '24px 22px 22px', position: 'relative', boxShadow: isAccent ? 'inset 0 2px 0 var(--yte-accent)' : 'none' }}>
                  {isAccent && (
                    <span style={{ position: 'absolute', top: 0, right: 16, fontFamily: SANS, fontSize: 9, fontWeight: 700, color: '#fff', background: 'var(--yte-accent)', padding: '3px 9px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Most popular</span>
                  )}
                  <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>{p.plan}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                    <p style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.8px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{p.runs}</p>
                    <p style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)' }}>{p.plan === 'Free' ? 'analysis' : 'analyses'}</p>
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)', marginBottom: 14 }}>{p.plan === 'Free' ? 'per cycle' : 'included per month'}</p>
                  <div style={{ height: 1, background: 'var(--yte-line)', marginBottom: 12 }} />
                  <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-soft)', lineHeight: 1.55 }}>{p.note}</p>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)' }}>Same two-layer engine across every plan, including free.</p>
            <a href="/#pricing" style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-accent)', textDecoration: 'none', fontWeight: 600 }}>See full pricing →</a>
          </div>
        </div>
      </section>

      {/* ════ 9. FAQ ════ */}
      <section className="tiq-section-pad" style={{ padding: isMobile ? '64px 22px 80px' : '104px 48px 120px', background: 'var(--yte-bg)' }}>
        <div className="tiq-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: 64, alignItems: 'flex-start' }}>
          <div style={{ position: isMobile ? 'static' : 'sticky', top: 100 }}>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="tiq-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 16, textWrap: 'balance' }}>
              The scoring engine, <em>answered honestly.</em>
            </h2>
            <p className="tiq-lead" style={{ fontSize: 14.5 }}>
              Real answers from how the product behaves. The two layers, the niche pool, the size brackets, version history, and what won’t work.
            </p>
            <a href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-accent)', textDecoration: 'none', fontWeight: 600, marginTop: 16 }}>
              Still have questions? Email us →
            </a>
          </div>
          <div style={{ borderTop: '1px solid var(--yte-line)' }}>
            {FAQS.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
