import { useEffect, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'

/* Thumbnail IQ — fully custom landing page.
 *
 * Built around the *actual* product (see app/thumbnail.py + routers/
 * thumbnail_routes.py): a two-layer scorer — Layer 1 is deterministic CV
 * (OpenCV face detection, pytesseract OCR, WCAG contrast, k-means dominant
 * colors, HSV vibrancy) producing 60 algorithm points across 7 components.
 * Layer 2 is Claude Sonnet 4.6 vision against the user's thumbnail + the
 * top 3 benchmark thumbnails for the same keyword + format + size bracket,
 * scoring 6 psychological dimensions for 40 points. Combined 0–100 score,
 * benchmarked against the cached niche pool of top performers.
 *
 * Background rhythm matches Landing.jsx and the Channel Audit / Competitor
 * Analysis / SEO Studio pages: white > dark > light > dark > white > dark >
 * light > dark > white > light. All classes use the .tiq- prefix to avoid
 * collision with the in-app product page.
 */

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
    const link = document.createElement('link')
    link.id = 'tiq-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'tiq-styles'
    style.textContent = `
      :root {
        --ytg-bg:           #f4f4f6;
        --ytg-bg-2:         #ecedf1;
        --ytg-bg-3:         #e6e7ec;
        --ytg-text:         #0a0a0f;
        --ytg-text-2:       rgba(10,10,15,0.62);
        --ytg-text-3:       rgba(10,10,15,0.40);
        --ytg-text-4:       rgba(10,10,15,0.30);
        --ytg-nav:          rgba(244,244,246,0.92);
        --ytg-card:         #ffffff;
        --ytg-border:       rgba(10,10,15,0.09);
        --ytg-accent:       #e5302a;
        --ytg-accent-text:  #c22b25;
        --ytg-accent-light: rgba(229,48,42,0.07);
        --ytg-shadow-sm:    0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
        --ytg-shadow:       0 2px 6px rgba(0,0,0,0.08), 0 10px 32px rgba(0,0,0,0.11);
        --ytg-shadow-lg:    0 4px 16px rgba(0,0,0,0.11), 0 24px 60px rgba(0,0,0,0.14);
        --ytg-shadow-xl:    0 8px 28px rgba(0,0,0,0.13), 0 40px 100px rgba(0,0,0,0.17);
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 5px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background: rgba(10,10,15,0.16); border-radius: 10px }

      @keyframes fadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .tiq-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--ytg-accent); color: #fff; font-size: 15px; font-weight: 700; padding: 15px 30px; border-radius: 100px; border: none; cursor: pointer; text-decoration: none; letter-spacing: -0.2px; box-shadow: 0 1px 2px rgba(0,0,0,0.14), 0 4px 20px rgba(229,48,42,0.34); transition: filter 0.18s, transform 0.18s, box-shadow 0.18s; font-family: 'Inter', system-ui, sans-serif; }
      .tiq-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,0.16), 0 12px 36px rgba(229,48,42,0.42); }
      .tiq-btn-lg { font-size: 16px; padding: 17px 38px; }
      .tiq-btn-ghost { display: inline-flex; align-items: center; gap: 8px; background: var(--ytg-card); color: var(--ytg-text-2); font-size: 15px; font-weight: 600; padding: 14px 26px; border-radius: 100px; border: 1px solid var(--ytg-border); cursor: pointer; text-decoration: none; letter-spacing: -0.2px; box-shadow: var(--ytg-shadow-sm); transition: color 0.15s, box-shadow 0.18s; font-family: 'Inter', system-ui, sans-serif; }
      .tiq-btn-ghost:hover { color: var(--ytg-text); box-shadow: var(--ytg-shadow); }

      .tiq-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        font-size: 11px; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase;
        padding: 5px 13px; border-radius: 100px; margin-bottom: 16px;
      }
      .tiq-eyebrow.light { color: var(--ytg-accent-text); background: var(--ytg-accent-light); }
      .tiq-eyebrow.dark  { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); }

      .tiq-h1 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -2px; line-height: 1.05; text-wrap: balance; }
      .tiq-h2 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -1.4px; line-height: 1.08; text-wrap: balance; }

      .tiq-nav-link { font-size: 14px; color: var(--ytg-text-3); font-weight: 500; text-decoration: none; transition: color 0.15s; letter-spacing: -0.1px; }
      .tiq-nav-link:hover { color: var(--ytg-text-2); }

      .tiq-faq-item { border-bottom: 1px solid var(--ytg-border); }
      .tiq-faq-q { background: none; border: none; cursor: pointer; width: 100%; text-align: left; padding: 22px 0; font-family: inherit; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; font-size: 16.5px; font-weight: 700; color: var(--ytg-text); letter-spacing: -0.2px; line-height: 1.45; }
      .tiq-faq-q:hover { color: var(--ytg-accent); }
      .tiq-faq-icon { transition: transform 0.2s; flex-shrink: 0; color: var(--ytg-text-3); margin-top: 4px; }
      .tiq-faq-icon.open { transform: rotate(45deg); color: var(--ytg-accent); }
      .tiq-faq-a { font-size: 14.5px; color: var(--ytg-text-2); line-height: 1.78; padding: 0 0 22px 0; max-width: 760px; }

      @media (max-width: 900px) {
        .tiq-grid-2 { grid-template-columns: 1fr !important; gap: 32px !important; }
        .tiq-grid-3 { grid-template-columns: 1fr !important; }
        .tiq-grid-4 { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 600px) {
        .tiq-grid-4 { grid-template-columns: 1fr !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill="#ff3b30"/>
      <path d="M23.2 11.6a2.1 2.1 0 0 0-1.48-1.48C20.55 9.8 16 9.8 16 9.8s-4.55 0-5.72.32A2.1 2.1 0 0 0 8.8 11.6 22 22 0 0 0 8.5 16a22 22 0 0 0 .3 4.4 2.1 2.1 0 0 0 1.48 1.48C11.45 22.2 16 22.2 16 22.2s4.55 0 5.72-.32a2.1 2.1 0 0 0 1.48-1.48A22 22 0 0 0 23.5 16a22 22 0 0 0-.3-4.4z" fill="white"/>
      <polygon points="13.5,19 19.5,16 13.5,13" fill="#ff3b30"/>
    </svg>
  )
}

const FEATURE_NAV = [
  { href: '/features/channel-audit',       label: 'Channel Audit',       desc: '10-category AI audit of your channel' },
  { href: '/features/competitor-analysis', label: 'Competitor Analysis', desc: 'Track rivals, find their content gaps' },
  { href: '/features/seo-studio',          label: 'SEO Studio',          desc: 'Score + rewrite titles and descriptions' },
  { href: '/features/thumbnail-iq',        label: 'Thumbnail IQ',        desc: 'Two-layer thumbnail scoring vs your niche' },
  { href: '/features/keyword-research',    label: 'Keyword Research',    desc: 'YouTube-native search volume + difficulty' },
]

function FeaturesDropdown() {
  const [open, setOpen] = useState(false)
  return (
    <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} style={{ position: 'relative' }}>
      <a href="/#features" className="tiq-nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
        Features
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>
          <path d="M2 3.5l3 3 3-3"/>
        </svg>
      </a>
      {open && (
        <>
          <div style={{ position: 'absolute', top: '100%', left: -20, width: 360, height: 12 }} />
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: -20, zIndex: 200, background: '#fff', border: '1px solid var(--ytg-border)', borderRadius: 14, boxShadow: 'var(--ytg-shadow-lg)', padding: 8, minWidth: 340, animation: 'fadeUp 0.16s ease both' }}>
            {FEATURE_NAV.map((item, i) => (
              <a key={i} href={item.href} style={{ display: 'block', padding: '11px 14px', borderRadius: 9, textDecoration: 'none', transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f6f6f9'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.2px', marginBottom: 2 }}>{item.label}</p>
                <p style={{ fontSize: 12.5, color: 'var(--ytg-text-2)', lineHeight: 1.45 }}>{item.desc}</p>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="tiq-faq-item">
      <button className="tiq-faq-q" onClick={() => setOpen(o => !o)}>
        <span style={{ flex: 1 }}>{q}</span>
        <span className={`tiq-faq-icon${open ? ' open' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M8 2v12M2 8h12"/></svg>
        </span>
      </button>
      {open && <div className="tiq-faq-a">{a}</div>}
    </div>
  )
}

/* ── Visual: Combined scorecard (algorithm 60 + vision 40 = 100) ──────── */
function ThumbnailScorecardVisual() {
  return (
    <div style={{ background: '#111114', borderRadius: 18, border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 48px rgba(0,0,0,0.6)', padding: 26 }}>
      {/* Faux thumbnail strip */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <div style={{ width: 96, height: 54, borderRadius: 7, background: 'linear-gradient(135deg, #ff3b30 0%, #f59e0b 50%, #4a7cf7 100%)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: 4, left: 5, right: 5, fontSize: 8, fontWeight: 800, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.6)', letterSpacing: '-0.3px' }}>I TRIED THIS FOR 30 DAYS</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>I tried this for 30 days...</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>1280×720 · listicle · micro channel</p>
        </div>
      </div>
      {/* Score header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 18 }}>
        <span style={{ fontSize: 46, fontWeight: 800, color: '#4ade80', letterSpacing: '-2px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>78</span>
        <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.35)' }}>/100</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, color: '#4ade80', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', padding: '3px 9px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stands out</span>
      </div>
      {/* Layer 1 + Layer 2 split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px' }}>
          <p style={{ fontSize: 9.5, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Layer 1 · algorithm</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>48</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>/60</span>
          </div>
          <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>OpenCV · OCR · WCAG</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px' }}>
          <p style={{ fontSize: 9.5, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Layer 2 · vision AI</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>30</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>/40</span>
          </div>
          <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Sonnet 4.6 vs niche</p>
        </div>
      </div>
      {/* Component bars */}
      {[
        { label: 'Contrast (stddev 87)',      score: 100, color: '#4ade80' },
        { label: 'Face coverage 24%',         score: 100, color: '#4ade80' },
        { label: 'Text readability (WCAG)',   score: 70,  color: '#f59e0b' },
        { label: 'Feed distinctiveness',      score: 80,  color: '#4ade80' },
      ].map((row, i) => (
        <div key={i} style={{ marginBottom: i < 3 ? 11 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>{row.label}</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: row.color, fontVariantNumeric: 'tabular-nums' }}>{row.score}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${row.score}%`, background: row.color, borderRadius: 100 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Visual: Niche benchmark comparison (your thumb vs top 3) ─────────── */
function BenchmarkVisual() {
  return (
    <div style={{ background: '#111114', borderRadius: 18, border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 48px rgba(0,0,0,0.6)', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Niche benchmark · listicle · micro</p>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#4a7cf7', background: 'rgba(74,124,247,0.12)', border: '1px solid rgba(74,124,247,0.28)', padding: '2px 8px', borderRadius: 100 }}>10 top performers</span>
      </div>
      {/* Your thumb row */}
      <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Yours</p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ width: 84, height: 47, borderRadius: 6, background: 'linear-gradient(135deg, #ff3b30 0%, #f59e0b 60%, #4a7cf7 100%)', flexShrink: 0 }} />
        <div style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
          <p>Contrast <span style={{ color: '#4ade80', fontWeight: 700 }}>87</span> · benchmark avg 64 → <span style={{ color: '#4ade80' }}>+36%</span></p>
          <p>Face <span style={{ color: '#4ade80', fontWeight: 700 }}>yes (24%)</span> · 80% of top performers also have a face</p>
        </div>
      </div>
      {/* Top 3 benchmark thumbnails */}
      <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Top 3 by velocity</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
        {[
          { g: 'linear-gradient(135deg, #4a7cf7 0%, #111 70%)', v: '12.4K/d' },
          { g: 'linear-gradient(135deg, #f59e0b 0%, #ff3b30 100%)', v: '9.1K/d' },
          { g: 'linear-gradient(135deg, #4ade80 0%, #4a7cf7 100%)', v: '6.7K/d' },
        ].map((b, i) => (
          <div key={i}>
            <div style={{ aspectRatio: '16/9', borderRadius: 6, background: b.g, marginBottom: 4 }} />
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>{b.v}</p>
          </div>
        ))}
      </div>
      {/* Niche averages */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 12px' }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Niche signature</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
          <span>Face rate</span><span style={{ fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>80%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
          <span>Text-overlay rate</span><span style={{ fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>90%</span>
        </div>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Common color palette</p>
        <div style={{ display: 'flex', gap: 4 }}>
          {['#ff3b30', '#f59e0b', '#1a1a2e', '#4a7cf7', '#fff', '#4ade80'].map((c, i) => (
            <div key={i} style={{ width: 18, height: 18, borderRadius: 4, background: c, border: '1px solid rgba(255,255,255,0.12)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── 13 scoring components (7 algorithm + 6 vision) ────────────────────── */
const ALGORITHM_DIMENSIONS = [
  { name: 'Dimensions',           weight: 5,  what: 'Full credit at 1280×720 (YouTube’s recommended resolution). Partial at any 16:9 ratio. Zero off-ratio — those get cropped or letterboxed in feeds and tank CTR.' },
  { name: 'File size',            weight: 5,  what: 'Full credit under 2 MB. Partial under 4 MB. Zero above 4 MB (loads slow on mobile data, hurts the first-frame impression).' },
  { name: 'Contrast (stddev)',    weight: 15, what: 'Greyscale standard deviation across the whole image. >80 wins full credit — high contrast separates from feed neighbours. <30 means the thumbnail looks washed out.' },
  { name: 'Face presence',        weight: 10, what: 'Haar cascade face detection. >20% of image area = full credit (faces drive CTR). 10–20% = partial. Detected at all = base credit. Zero faces is OK if vision Layer 2 says the scene compensates.' },
  { name: 'Text presence',        weight: 10, what: '10–30% of image covered by text wins full credit (sweet spot — readable on mobile, doesn’t crowd the visual). >30% feels cluttered, gets capped.' },
  { name: 'Text readability (WCAG)', weight: 10, what: 'Real WCAG luminance-contrast ratio between text and its background. >7:1 wins full credit (AAA). >4.5:1 is partial. Below 3 reads as a smear at 200px.' },
  { name: 'Color vibrancy',       weight: 5,  what: 'Mean HSV saturation. >120 wins full credit (vivid). Plus k-means dominant color extraction so Layer 2 can compare against the niche palette.' },
]

const VISION_DIMENSIONS = [
  { name: 'Facial emotion',          weight: 10, what: 'What specific emotion is expressed? Is it readable at 200px (mobile feed size)? Does it match the video’s promise? If no face, does the scene create equivalent emotional pull?' },
  { name: 'Text psychology',         weight: 10, what: 'Does the text create curiosity tension without revealing the answer? Does it complement or contradict the image? Bold enough for mobile? If no text, scored against whether the visual is strong enough alone.' },
  { name: 'Color psychology',        weight: 10, what: 'Are colors emotionally congruent with the topic? Is there a single dominant color that separates this in the feed? Compared directly against the benchmark color palette.' },
  { name: 'Composition & visual hierarchy', weight: 10, what: 'Where does the eye go first? Is there visual tension? Is the most important element in a rule-of-thirds power zone? Mobile-first read, since most YouTube viewing is mobile.' },
  { name: 'Title-thumbnail relationship', weight: 10, what: 'Do the title and thumbnail tell DIFFERENT parts of the same story (the gold standard) — or is the thumbnail just illustrating the title? Scored zero if no title was provided.' },
  { name: 'Feed distinctiveness',    weight: 10, what: 'Compared against the actual top 3 benchmark thumbnails for your niche. Would this stand out, blend in, or disappear? Names the single most distinctive element — or explains exactly why it blends.' },
]

const PIPELINE_OUTPUTS = [
  { icon: 'gauge',  title: 'Combined score 0–100',         body: 'Layer 1 contributes up to 60 (deterministic CV). Layer 2 contributes up to 40 (Claude vision). Same scale every time so you can track improvement across versions.' },
  { icon: 'eye',    title: 'Niche-aware vision read',       body: 'Claude scores against the actual top 3 benchmark thumbnails for your keyword + format + size bracket — not generic best practices. Feed distinctiveness is real.' },
  { icon: 'pulse',  title: 'Per-dimension verdict + fix',   body: 'Each of the 13 dimensions returns a one-sentence verdict referencing exact visual elements, plus one concrete fix when the score is below 8 — names colors, words, positions.' },
  { icon: 'sword',  title: 'Biggest win + biggest fix',     body: 'The single strongest element to keep. The single highest-impact change to make. Plus an emotion label, feed-position tag, and click-through prediction vs niche average.' },
  { icon: 'gap',    title: 'Niche benchmark comparison',    body: 'Your face %, text %, vibrancy, contrast each plotted against the niche average. Same metrics from the same algorithm — apples to apples.' },
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
    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--ytg-accent-light)', border: '1px solid rgba(229,48,42,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#e5302a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d={ICON_PATHS[name]}/>
      </svg>
    </div>
  )
}

const PLAN_LIMITS = [
  { plan: 'Free',    runs: '1',   note: 'One thumbnail score per cycle — full two-layer analysis' },
  { plan: 'Solo',    runs: '20',  note: 'Score every iteration · 3 channels' },
  { plan: 'Growth',  runs: '50',  note: 'Same engine, higher monthly allowance · 5 channels' },
  { plan: 'Agency',  runs: '150', note: 'Pooled across 10 channels · per-version history' },
]

const FAQS = [
  {
    q: 'Why two layers? Isn’t the AI smart enough on its own?',
    a: <>Vision models are good at semantic reads (emotion, composition, psychology) but unreliable at measurements. Asking Claude "what’s the contrast ratio of this text?" gets a confident guess. Layer 1 measures the things that should be measured — actual pixel stddev for contrast, real Haar-cascade face detection, OCR for text coverage, WCAG luminance ratios for readability, k-means for dominant colors. Layer 2 then judges what only judgment can judge — does the emotion match the topic, does the composition lead the eye, does this stand out against the actual niche feed. The split is the whole point.</>,
  },
  {
    q: 'How is the niche benchmark built? Where does the comparison come from?',
    a: <>For your keyword + format + size bracket we fetch the top 50 YouTube videos via the official Data API, filter for above-median view velocity, last-12-months only, &gt;10K views, format match (tutorial / listicle / story / comparison / revelation), and channel-size bracket match (nano &lt;10K, micro &lt;100K, mid &lt;1M, macro 1M+). The top 10 by velocity become your benchmark pool. We run Layer 1 on each of their thumbnails and average the metrics. The pool is cached for 30 days and shared across users on the same niche, so your run isn’t paying for someone else’s benchmark build.</>,
  },
  {
    q: 'What does "channel size bracket" actually do?',
    a: <>Comparing a 5K-sub thumbnail against MrBeast’s feed is useless. The benchmark pool only includes top performers in <i>your</i> size bracket (nano / micro / mid / macro), so the score reflects what actually wins among channels that real viewers see alongside yours. A 78 on Thumbnail IQ for a nano channel means the thumbnail beats the average top-performing nano thumbnail in your niche — a target you can actually hit.</>,
  },
  {
    q: 'How accurate is the face detection — can it tell emotion?',
    a: <>Layer 1 uses OpenCV’s Haar cascade for detection (presence, count, position, coverage percentage). Detection is reliable for forward-facing faces; it misses heavy profile shots and partial faces. <b>Emotion</b> is a Layer 2 read — Claude vision describes the specific emotion ("intense focus", "barely-suppressed laugh") and judges whether it’s readable at 200px. If Layer 1 misses your face but Layer 2 sees it, the vision score still credits you; nothing is double-penalized.</>,
  },
  {
    q: 'What if my thumbnail has no text?',
    a: <>Text presence scores zero in Layer 1. Layer 2’s text-psychology dimension also scores 0 — UNLESS the visual is exceptionally strong, in which case Claude is allowed to flag it as an intentional choice (some niches like ASMR or cinematic vlogs win without text). The combined score will still come out reasonable if the rest of the thumbnail compensates. We don’t hand back "ADD TEXT" as the universal fix; the suggestion is contextual to your niche.</>,
  },
  {
    q: 'Can I score a thumbnail before I publish the video?',
    a: <>Yes, that’s the primary use case. Upload the image, paste your draft title, pick the keyword you’re targeting. The studio runs both layers, compares against the niche pool, returns the score and the per-dimension fixes. Iterate, re-upload, score again — every version is tracked in the history panel so you can see exactly which change moved the score, and by how much.</>,
  },
  {
    q: 'Do you compare thumbnails to the same competitors my SEO Studio analyzes?',
    a: <>Often, yes — both surfaces use YouTube’s niche-search results as the source of truth for "who’s winning here". The benchmark pool for thumbnails additionally filters by channel-size bracket and format, so the comparison set is sharper than what SEO Studio uses for title rewrites. If you’ve linked a video idea from competitor research, Thumbnail IQ explicitly references the competitor gap that idea exploits — and judges whether your thumbnail can win against those exact channels.</>,
  },
  {
    q: 'How does the percentile work?',
    a: <>For every Thumbnail IQ analysis run on your same keyword + format + size bracket (across all users, since most niches have multiple creators using the tool), we compute the average algorithm score. Your percentile is "how many of those analyses scored below yours". A 78/100 might be 92nd percentile in some niches and 60th in others — the percentile is what tells you whether your number is competitive. New niches with no peers yet show 50th percentile by default until enough data accumulates.</>,
  },
  {
    q: 'Will Thumbnail IQ work for Shorts thumbnails?',
    a: <>Layer 1 works the same — pixel measurements don’t care about the platform. Layer 2 currently judges against the standard 16:9 long-form benchmark pool, so feed-distinctiveness scoring for vertical Shorts thumbnails is approximate. Shorts get less play from the thumbnail itself (most plays start before the thumbnail loads), so this is intentionally not the top priority right now. If your Shorts thumbnails are critical to your funnel, email support and we’ll prioritize the Shorts pool build.</>,
  },
  {
    q: 'How long does an analysis take, and what does it cost?',
    a: <>~20–35 seconds end-to-end on a fresh niche (Layer 1 on your image, fetch + Layer 1 on benchmark thumbnails if pool isn’t cached, then Layer 2 vision call). Cached niches return in ~10–15 seconds. Free tier gets 1 thumbnail analysis per cycle; paid plans charge one credit per run (Solo 20, Growth 50, Agency 150 pooled). Re-uploading a revised version of the same thumbnail charges a new credit because we re-run both layers from scratch.</>,
  },
  {
    q: 'Are my thumbnails stored? Can other users see them?',
    a: <>Your uploaded thumbnail is stored on our infrastructure so the analysis can rehydrate when you reopen it later, and so the version-history panel can compare iterations. It is never shown to other users and never used as benchmark data for other channels. The benchmark pool only ever contains <i>public</i> thumbnails from the YouTube API — videos that are already published and ranking. You can permanently clear an upload from the analysis history at any time.</>,
  },
  {
    q: 'What does "feed distinctiveness" actually measure?',
    a: <>It’s the highest-impact Layer 2 dimension. We show Claude your thumbnail alongside the actual top 3 benchmark thumbnails (by view velocity) for your exact niche, format, and size bracket — and ask: would this stand out, blend in, or disappear in that feed? The score is anchored to the visual context a real viewer would see your thumbnail in, which is the only honest way to judge "click-worthiness" — generic best-practice advice can’t do this.</>,
  },
]

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function ThumbnailIq() {
  useStyles()
  const { isMobile } = useBreakpoint()

  return (
    <div style={{ background: 'var(--ytg-bg)', minHeight: '100vh' }}>

      {/* ════ NAV ════════════════════════════════════════════════════════ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--ytg-border)', padding: isMobile ? '0 20px' : '0 40px 0 64px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ytg-nav)', backdropFilter: 'blur(16px)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <Logo size={28} />
          <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--ytg-text)', letterSpacing: '-0.4px' }}>YTGrowth</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          {!isMobile && <FeaturesDropdown />}
          {!isMobile && <a href="/#pricing" className="tiq-nav-link">Pricing</a>}
          <a href="/auth/login" className="tiq-btn" style={{ padding: isMobile ? '8px 18px' : '9px 22px', fontSize: 13, borderRadius: 100, whiteSpace: 'nowrap', boxShadow: 'none' }}>
            Score my thumbnail
          </a>
        </div>
      </nav>

      {/* ════ 1. HERO — white ════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px 56px' : '110px 40px 80px', textAlign: 'center', background: '#ffffff' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', animation: 'fadeUp 0.5s ease both' }}>
          <span className="tiq-eyebrow light">Thumbnail IQ</span>
          <h1 className="tiq-h1" style={{ fontSize: isMobile ? 36 : 60, color: 'var(--ytg-text)', marginBottom: 22 }}>
            The only thumbnail score that <span style={{ color: 'var(--ytg-accent)' }}>compares against your actual niche feed.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18.5, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 36px' }}>
            Two layers, one number. Layer 1 measures contrast, faces, text coverage, WCAG readability, vibrancy with real computer vision. Layer 2 hands the image to Claude vision and asks if it can stand out against the top 3 thumbnails actually winning in your keyword + format + size bracket. Free creators get one full run per cycle.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/login" className="tiq-btn tiq-btn-lg">Score a thumbnail →</a>
            <a href="#how" className="tiq-btn-ghost" style={{ padding: '15px 26px', fontSize: 15 }}>See how it works</a>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', marginTop: 22 }}>
            Free plan unlocks one full analysis · ~25 seconds per run · re-upload revised versions for side-by-side history
          </p>
        </div>
      </section>

      {/* ════ 2. SCORECARD VISUAL — dark, SPLIT (text L, visual R) ══════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.16) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="tiq-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 64, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <span className="tiq-eyebrow dark">The 0–100 score</span>
            <h2 className="tiq-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 18 }}>
              One number that fuses pixel measurements <span style={{ color: '#ff3b30' }}>with niche-aware judgement.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72, marginBottom: 24 }}>
              Layer 1 contributes up to 60 deterministic points (contrast, face, text, readability, vibrancy, dimensions, file size). Layer 2 contributes up to 40 vision points (emotion, text psychology, color psychology, composition, title-thumbnail fit, feed distinctiveness). Same scale every time — so an 81 next month is genuinely better than tonight’s 78.
            </p>
            {[
              'Layer 1 — pixel measurements that should be measured',
              'Layer 2 — judgements that only judgement can make',
              'Same scale every run — track improvement across versions',
              'Compared against your niche, not generic best practice',
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 11 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#4ade80" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M2.5 7.2 5.4 10l6.1-6"/></svg>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6 }}>{b}</span>
              </div>
            ))}
          </div>
          <div>
            <ThumbnailScorecardVisual />
          </div>
        </div>
      </section>

      {/* ════ 3. THE 13 DIMENSIONS — light ══════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 48px' }}>
            <span className="tiq-eyebrow light">Thirteen scoring dimensions</span>
            <h2 className="tiq-h2" style={{ fontSize: isMobile ? 30 : 42, marginBottom: 16 }}>
              We measure what should be measured — <span style={{ color: 'var(--ytg-accent)' }}>and judge what should be judged.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>
              Seven Layer 1 components run pixel-level computer vision (60 points). Six Layer 2 dimensions run Claude Sonnet 4.6 vision against your niche feed (40 points). Each one returns a score, a one-sentence verdict referencing exact visual elements, and a concrete fix when below 8.
            </p>
          </div>

          {/* Layer 1 grid */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ytg-accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Layer 1 · algorithm</span>
            <span style={{ flex: 1, height: 1, background: 'var(--ytg-border)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-text-3)', fontVariantNumeric: 'tabular-nums' }}>60 points · 7 components</span>
          </div>
          <div className="tiq-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 36 }}>
            {ALGORITHM_DIMENSIONS.map((d, i) => (
              <div key={i} style={{ background: 'var(--ytg-card)', borderRadius: 14, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--ytg-accent-light)', border: '1px solid rgba(229,48,42,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ytg-accent)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <p style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.2px', flex: 1 }}>{d.name}</p>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--ytg-text-3)', background: 'var(--ytg-bg-2)', padding: '2px 7px', borderRadius: 100, letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{d.weight} pts</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>{d.what}</p>
              </div>
            ))}
          </div>

          {/* Layer 2 grid */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ytg-accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Layer 2 · vision AI</span>
            <span style={{ flex: 1, height: 1, background: 'var(--ytg-border)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-text-3)', fontVariantNumeric: 'tabular-nums' }}>40 points · 6 dimensions</span>
          </div>
          <div className="tiq-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {VISION_DIMENSIONS.map((d, i) => (
              <div key={i} style={{ background: 'var(--ytg-card)', borderRadius: 14, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--ytg-accent-light)', border: '1px solid rgba(229,48,42,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ytg-accent)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{String(i + 8).padStart(2, '0')}</span>
                  </div>
                  <p style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.2px', flex: 1 }}>{d.name}</p>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--ytg-text-3)', background: 'var(--ytg-bg-2)', padding: '2px 7px', borderRadius: 100, letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{d.weight} pts</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>{d.what}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 4. NICHE BENCHMARK COMPARISON — dark, SPLIT (visual L, text R) ═ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="tiq-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ order: isMobile ? 1 : 0 }}>
            <BenchmarkVisual />
          </div>
          <div style={{ order: isMobile ? 0 : 1 }}>
            <span className="tiq-eyebrow dark">Niche-aware benchmarking</span>
            <h2 className="tiq-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 18 }}>
              Compared against the channels <span style={{ color: '#ff3b30' }}>you’ll actually be next to.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72, marginBottom: 22 }}>
              For every analysis we build a benchmark pool: top 50 niche videos → above-median velocity → last 12 months → &gt;10K views → format match → size-bracket match. The top 10 by velocity become the comparison set. Layer 1 runs on each of their thumbnails, the metrics are averaged, and your face %, text %, contrast, vibrancy are compared head-to-head. The pool is cached per-niche for 30 days and shared across users — so most runs hit a warm cache.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Format-aware',     color: '#ff3b30', body: 'Tutorial / listicle / story / comparison / revelation — pulled separately.' },
                { label: 'Size-bracketed',   color: '#4a7cf7', body: 'Nano / micro / mid / macro — your peers, not MrBeast.' },
                { label: 'Velocity-ranked',  color: '#f59e0b', body: 'Views per day since publish — recent winners, not stale viral hits.' },
                { label: 'Cached & shared',  color: '#4ade80', body: '30-day pool TTL across users — most runs hit a warm pool.' },
              ].map((p, i) => (
                <div key={i} style={{ borderLeft: `2px solid ${p.color}`, paddingLeft: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: p.color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{p.label}</p>
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════ 5. HOW IT WORKS — white, with arrow connectors ════════════ */}
      <section id="how" style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#ffffff' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 52px' }}>
            <span className="tiq-eyebrow light">How it works</span>
            <h2 className="tiq-h2" style={{ fontSize: isMobile ? 30 : 42 }}>
              From upload to scored verdict in under 30 seconds
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.7, marginTop: 14, maxWidth: 580, margin: '14px auto 0' }}>
              Five stages. Re-upload a revised version anytime — the version-history panel tracks the score across iterations so you can see exactly what moved the needle.
            </p>
          </div>
          {(() => {
            const steps = [
              { n: '01', t: 'Upload + context',     b: 'Drop the image, paste the draft title, pick the keyword you’re targeting. Or pull the title and keyword from a video idea you generated in Competitor Analysis.' },
              { n: '02', t: 'Layer 1 measures',      b: 'OpenCV detects faces, pytesseract reads any text, WCAG luminance ratio scores readability, k-means extracts dominant colors, HSV measures vibrancy. 60 points.' },
              { n: '03', t: 'Niche pool built',      b: 'Top 10 thumbnails for your keyword + format + size bracket are fetched + scored. Pool cached 30 days, shared across users — most runs hit a warm pool.' },
              { n: '04', t: 'Layer 2 vision call',   b: 'Claude Sonnet 4.6 sees your thumbnail alongside the top 3 benchmark thumbnails and scores 6 psychological dimensions in context. 40 points.' },
              { n: '05', t: 'Combined result',       b: 'Score 0–100, per-dimension verdict + fix, biggest win, biggest fix, emotion label, feed-position tag, percentile vs peers, version saved to history.' },
            ]
            const Card = ({ s }) => (
              <div style={{ background: 'var(--ytg-card)', borderRadius: 14, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', padding: '22px 22px 24px', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--ytg-accent-light)', border: '1px solid rgba(229,48,42,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ytg-accent)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{s.n}</span>
                  </div>
                </div>
                <p style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ytg-text)', marginBottom: 10, letterSpacing: '-0.2px' }}>{s.t}</p>
                <p style={{ fontSize: 13, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>{s.b}</p>
              </div>
            )
            const Arrow = () => (
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', width: 26, height: 26, borderRadius: '50%', background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', color: 'var(--ytg-accent)' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6h8M7 3l3 3-3 3"/>
                </svg>
              </div>
            )
            const ArrowDown = () => (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', color: 'var(--ytg-accent)', margin: '8px auto' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2v8M3 7l3 3 3-3"/>
                </svg>
              </div>
            )
            if (isMobile) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {steps.map((s, i) => (
                    <div key={i}>
                      <Card s={s} />
                      {i < steps.length - 1 && <ArrowDown />}
                    </div>
                  ))}
                </div>
              )
            }
            return (
              <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
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

      {/* ════ 6. SEVEN OUTPUT BLOCKS — dark ══════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 44px' }}>
            <span className="tiq-eyebrow dark">Output structure</span>
            <h2 className="tiq-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 16 }}>
              Seven distinct output blocks. <span style={{ color: '#ff3b30' }}>Every one is fixable.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72 }}>
              The studio doesn’t hand you a number and a vague verdict. Each block renders separately so you can scan, iterate, re-upload — and the history panel keeps every version side by side.
            </p>
          </div>
          <div className="tiq-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {PIPELINE_OUTPUTS.map((p, i) => (
              <div key={i} style={{ background: '#111114', borderRadius: 14, border: '1px solid rgba(255,255,255,0.09)', padding: '22px 22px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <OutputIcon name={p.icon} />
                  <p style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>{p.title}</p>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 7. WHAT POWERS IT — light grey, split ═════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: 'var(--ytg-bg-3)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div className="tiq-grid-2" style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <span className="tiq-eyebrow light">What powers it</span>
            <h2 className="tiq-h2" style={{ fontSize: isMobile ? 28 : 38, marginBottom: 16 }}>
              Open-source CV + Sonnet 4.6 vision. <span style={{ color: 'var(--ytg-accent)' }}>Public data only.</span>
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>
              Layer 1 runs entirely on our infrastructure — no third-party scoring API, no per-image fees. Layer 2 calls Claude Sonnet 4.6 with your thumbnail and the top 3 benchmark images. Benchmark thumbnails come from the official YouTube Data API; the same public images anyone visiting those channels can see. Each analysis spends one credit on paid plans; free tier gets one full analysis per cycle.
            </p>
          </div>
          <div style={{ background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 16, boxShadow: 'var(--ytg-shadow-lg)', padding: '24px 28px' }}>
            {[
              { k: 'Face detection',         v: 'OpenCV Haar cascade · frontal-face classifier' },
              { k: 'Text OCR',                v: 'pytesseract · sparse-text page mode (psm 11)' },
              { k: 'Color extraction',        v: 'OpenCV k-means · k=3 dominant + HSV saturation' },
              { k: 'Readability ratio',       v: 'WCAG 2.2 luminance contrast · sampled per text box' },
              { k: 'Niche benchmark',         v: 'YouTube Data API · top 10 by view velocity, 30-day cache' },
              { k: 'Vision model',            v: 'Claude Sonnet 4.6 · 4-image input · ~12s on warm cache' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '11px 0', borderBottom: i < 5 ? '1px solid var(--ytg-border)' : 'none', alignItems: 'baseline' }}>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.1px', flexShrink: 0 }}>{row.k}</p>
                <p style={{ fontSize: 12.5, color: 'var(--ytg-text-2)', lineHeight: 1.55, textAlign: 'right' }}>{row.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 8. PLAN LIMITS — dark ═════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 44px' }}>
            <span className="tiq-eyebrow dark">By plan</span>
            <h2 className="tiq-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 16 }}>
              How many thumbnail scores you get each month
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72 }}>
              Free creators get one full two-layer analysis per cycle so you can try the engine on a real thumbnail. Paid plans charge one credit per run — the same engine, no feature differences. Each re-uploaded version is a fresh analysis and a fresh credit.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 14 }}>
            {PLAN_LIMITS.map((p, i) => {
              const isAccent = p.plan === 'Growth'
              return (
                <div key={i} style={{
                  background: isAccent ? '#1a1018' : '#111114',
                  borderRadius: 16,
                  border: isAccent ? '1px solid rgba(229,48,42,0.45)' : '1px solid rgba(255,255,255,0.09)',
                  boxShadow: isAccent ? '0 8px 32px rgba(229,48,42,0.18)' : '0 2px 8px rgba(0,0,0,0.4)',
                  padding: '24px 22px 22px',
                  position: 'relative',
                }}>
                  {isAccent && (
                    <span style={{ position: 'absolute', top: -10, right: 16, fontSize: 9, fontWeight: 800, color: '#fff', background: '#ff3b30', padding: '3px 10px', borderRadius: 100, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Most popular</span>
                  )}
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>{p.plan}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                    <p style={{ fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{p.runs}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{p.plan === 'Free' ? 'analysis' : 'analyses'}</p>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>{p.plan === 'Free' ? 'per cycle' : 'included per month'}</p>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 12 }} />
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 }}>{p.note}</p>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 22, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>Same two-layer engine across every plan, including free.</p>
            <a href="/#pricing" style={{ fontSize: 12.5, color: '#ff3b30', textDecoration: 'none', fontWeight: 600 }}>See full pricing →</a>
          </div>
        </div>
      </section>

      {/* ════ 9. FAQ — white ════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '110px 40px', background: '#ffffff' }}>
        <div className="tiq-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: 56, alignItems: 'flex-start' }}>
          <div style={{ position: isMobile ? 'static' : 'sticky', top: 100 }}>
            <span className="tiq-eyebrow light">FAQ</span>
            <h2 className="tiq-h2" style={{ fontSize: isMobile ? 30 : 40, marginBottom: 16 }}>
              Questions about the scoring engine, answered honestly.
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>
              Real answers from how the product behaves — the two layers, the niche pool, the size brackets, version history, and what won’t work.
            </p>
            <a href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--ytg-accent)', textDecoration: 'none', fontWeight: 600, marginTop: 16 }}>
              Still have questions? Email us →
            </a>
          </div>
          <div>
            {FAQS.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ════ 10. BOTTOM CTA — light ════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '60px 20px 56px' : '110px 40px 80px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center', background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 24, boxShadow: 'var(--ytg-shadow-xl)', padding: isMobile ? '52px 24px' : '76px 60px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 540, height: 260, background: 'radial-gradient(ellipse, rgba(229,48,42,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <h2 className="tiq-h2" style={{ fontSize: isMobile ? 30 : 44, marginBottom: 16 }}>
            Score your next thumbnail against the niche
          </h2>
          <p style={{ fontSize: isMobile ? 15 : 17, color: 'var(--ytg-text-2)', maxWidth: 540, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Free plan unlocks one full two-layer analysis. Solo gets 20 / month, Growth 50, Agency 150 pooled. Most users move their score 12+ points within the first three iterations.
          </p>
          <a href="/auth/login" className="tiq-btn tiq-btn-lg">Score a thumbnail →</a>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
