import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Upload, Lightbulb } from 'lucide-react'
import CreditsEmptyModal from '../components/CreditsEmptyModal'
import UpsellModal from '../components/UpsellModal'

// Load the editorial app fonts once, SCOPED to this page (each page owns its
// font loading, never global). Cormorant Garamond = display H1 + score numbers,
// Barlow = body/UI, Barlow Condensed = labels/buttons. Mirrors SeoOptimizer.
if (typeof document !== 'undefined' && !document.getElementById('thumb-iq-editorial-font')) {
  const link = document.createElement('link')
  link.id = 'thumb-iq-editorial-font'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@500;600;700&display=swap'
  document.head.appendChild(link)
}

// Cormorant display face, used for the H1 and every big number/score, matches
// the shipped SeoOptimizer / Overview treatment (weight 500).
const SERIF = "'Cormorant Garamond', Georgia, serif"
const COND  = "'Barlow Condensed', sans-serif"

/* Dark, mirrors the shipped app-shell / Competitors dark system.
   Defined above the injected stylesheet so it can interpolate ${C.*}.
   Semantic hues kept; *Hi-bright text for the dark tinted chips. */
const C = {
  red:    '#c9a030', redBg:   'rgba(201,160,48,0.13)', redBdr:   'rgba(201,160,48,0.32)', redHi:   '#7a5b14',
  green:  '#16a34a', greenBg: 'rgba(22,163,74,0.14)', greenBdr: 'rgba(22,163,74,0.34)', greenHi: '#2d7a4f',
  // "amber" kept as a token name but remapped to the warm gold accent family
  // so no foreign orange survives (mid/neutral states read as gold, not orange).
  amber:  '#c9a030', amberBg: 'rgba(201,160,48,0.13)', amberBdr: 'rgba(201,160,48,0.32)', amberHi: '#7a5b14',
  text1:  '#14130f', text2: '#6b6862', text3: '#6b6862',
  border: 'rgba(20,19,15,0.08)',
  card:        'linear-gradient(180deg, var(--yd-surface) 0%, var(--yd-surface) 100%)',
  cardFlat:    'var(--yd-surface)',
  surfaceInput:'var(--yd-surface)',
  hair:        'rgba(20,19,15,0.08)',
  hairHi:      'rgba(20,19,15,0.16)',
  wash:        'rgba(20,19,15,0.04)',
  washActive:  'rgba(20,19,15,0.06)',
  // Flat editorial system: cards are hairline + radius 0, NO shadow.
  cardShadow:     'none',
  cardShadowLift: 'none',
}

/* ─── Inject styles once ─────────────────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('thumb-iq-styles')) {
  const s = document.createElement('style')
  s.id = 'thumb-iq-styles'
  s.textContent = `
    @keyframes thumbFadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
    @keyframes thumbSpin    { to { transform: rotate(360deg) } }

    /* Page-scoped Geist inheritance, every element inside .tiq-page picks up
       Geist via the descendant universal selector. Other pages keep their own
       font loaders untouched. */
    .tiq-page, .tiq-page * {
      font-family: 'Barlow', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .tiq-card {
      background: ${C.card};
      border: 1px solid ${C.hair};
      border-radius: 0;
      box-shadow: ${C.cardShadow};
      transition: box-shadow 0.2s cubic-bezier(0.2,0.7,0.3,1), border-color 0.2s cubic-bezier(0.2,0.7,0.3,1);
    }
    .tiq-section { animation: thumbFadeUp 0.28s ease both; }
    .tiq-upload-zone {
      border: 2px dashed ${C.hairHi};
      border-radius: 0;
      padding: 36px 32px;
      text-align: center;
      transition: border-color 0.2s cubic-bezier(0.2,0.7,0.3,1), background 0.2s;
    }
    .tiq-upload-zone.clickable {
      cursor: pointer;
    }
    .tiq-upload-zone.clickable:hover, .tiq-upload-zone.drag-over {
      border-color: #c9a030;
      background: rgba(201,160,48,0.10);
    }
    .tiq-bar-track {
      height: 6px; border-radius: 3px; background: rgba(20,19,15,0.10); overflow: hidden;
    }
    .tiq-bar-fill {
      height: 100%; border-radius: 3px;
      transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1);
    }

    /* ── Tabs, quiet soft-grey active (NEVER red). Matches the
         feedback-quiet-toggles rule used across every redesigned page. ── */
    .tiq-tab-strip {
      display: flex; gap: 4px;
      margin-bottom: 24px;
      padding: 4px;
      background: ${C.cardFlat};
      border: 1px solid ${C.hair};
      border-radius: 0;
      width: fit-content;
    }
    .tiq-tab-btn {
      padding: 7px 16px; border-radius: 0;
      border: 1px solid transparent;
      background: transparent; color: ${C.text2};
      cursor: pointer; font-family: inherit;
      font-size: 13px; font-weight: 500; letter-spacing: -0.05px;
      transition: background 0.18s cubic-bezier(0.2,0.7,0.3,1),
                  color 0.18s, border-color 0.18s;
    }
    .tiq-tab-btn:hover { background: ${C.wash}; color: ${C.text1}; }
    .tiq-tab-btn.active {
      background: ${C.washActive}; color: ${C.text1};
      border-color: ${C.hair};
      font-weight: 600;
      box-shadow: none;
    }

    /* ── Previous tab accordion ── */
    .tiq-acc-wrapper { margin-bottom: 10px; position: relative; }

    .tiq-acc-header {
      background: ${C.card};
      border: 1px solid ${C.hair};
      border-radius: 0;
      box-shadow: ${C.cardShadow};
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: box-shadow 0.2s cubic-bezier(0.2,0.7,0.3,1),
                  border-color 0.2s cubic-bezier(0.2,0.7,0.3,1),
                  transform 0.2s cubic-bezier(0.2,0.7,0.3,1);
      cursor: pointer;
      user-select: none;
    }
    .tiq-acc-header:hover {
      box-shadow: ${C.cardShadowLift};
      border-color: ${C.hairHi};
      transform: translateY(-1px);
    }
    .tiq-acc-header.open {
      border-radius: 0;
      border-bottom-color: ${C.hair};
      transform: none;
    }

    .tiq-acc-body {
      border: 1px solid ${C.hair};
      border-top: none;
      border-radius: 0;
      background: rgba(20,19,15,0.02);
      padding: 24px 20px 28px;
      box-shadow: ${C.cardShadow};
    }

    /* Trash button, hidden until wrapper hovered */
    .tiq-remove-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 26px;
      height: 26px;
      border-radius: 0;
      border: 1px solid transparent;
      background: transparent;
      color: ${C.text3};
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.18s, background 0.15s, color 0.15s, border-color 0.15s;
      z-index: 2;
      flex-shrink: 0;
    }
    .tiq-acc-wrapper:hover .tiq-remove-btn { opacity: 1; }
    .tiq-remove-btn:hover {
      background: rgba(201,160,48,0.08);
      border-color: rgba(201,160,48,0.2);
      color: #c9a030;
    }

    /* "Open report" button, red pill, primary CTA */
    .tiq-btn-report {
      background: #c9a030;
      color: var(--yd-on-gold);
      border: none;
      border-radius: 0;
      padding: 9px 16px;
      font-size: 12px;
      font-weight: 600;
      font-family: 'Barlow Condensed', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      cursor: pointer;
      white-space: nowrap;
      transition: filter 0.18s cubic-bezier(0.2,0.7,0.3,1);
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: none;
    }
    .tiq-btn-report:hover {
      filter: brightness(1.08);
    }
    .tiq-btn-report.open {
      background: #7a5b14;
    }
  `
  document.head.appendChild(s)
}

/* ─── Design tokens, match Dashboard/SeoOptimizer C object exactly. Brand palette
       is red/amber/green + charcoal text tiers; no blue, no orange. Reasoning
       context goes neutral so red can stay semantic for action. ─────────── */
/* (dark C palette defined above the injected stylesheet) */

// Canonical tiers, matches the shipped SeoOptimizer scale exactly
// (score >= 75 green / >= 50 neutral grey / else gold-danger). The old amber
// mid-tier and gold "danger" were pre-editorial and clashed; killed here.
function scoreColor(s, max = 100) {
  const pct = s / max * 100
  return pct >= 75 ? C.greenHi : pct >= 50 ? C.text2 : C.redHi
}
function scoreLabel(s, max = 100) {
  const pct = s / max * 100
  return pct >= 75 ? 'Strong' : pct >= 50 ? 'Needs work' : 'Weak'
}
function fmtPct(n) { return `${Math.round(n)}%` }

/* ─── Circular score ring ─────────────────────────────────────────────────── */
function ScoreRing({ score, max = 100, label, size = 120, strokeW = 8 }) {
  const r    = (size - strokeW * 2) / 2
  const cx   = size / 2
  const circ = 2 * Math.PI * r
  const dash = Math.max(0, Math.min(1, score / max)) * circ
  const col  = scoreColor(score, max)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#ebebed" strokeWidth={strokeW}/>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={col} strokeWidth={strokeW}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
      <text x={cx} y={cx - 4} textAnchor="middle" fill={col}
        fontSize={size * 0.28} fontWeight="500" fontFamily={SERIF}
        style={{ fontVariantNumeric: 'tabular-nums' }}>{score}</text>
      <text x={cx} y={cx + 15} textAnchor="middle" fill={C.text3}
        fontSize="10" fontFamily="'Barlow', sans-serif">{label}</text>
    </svg>
  )
}

/* ─── Mini progress bar ───────────────────────────────────────────────────── */
function MiniBar({ value, max, color }) {
  return (
    <div className="tiq-bar-track">
      <div className="tiq-bar-fill" style={{ width: `${Math.min(100, value / max * 100)}%`, background: color }}/>
    </div>
  )
}

/* ─── Badge pill ──────────────────────────────────────────────────────────── */
function Badge({ text, color, bg, bdr }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: bg, color, border: `1px solid ${bdr}`,
      fontSize: 12, fontWeight: 600, padding: '4px 11px', borderRadius: 0,
      letterSpacing: '0.03em',
    }}>{text}</span>
  )
}

/* ─── Layer 1 breakdown row ───────────────────────────────────────────────── */
const L1_META = {
  dimensions:      { label: 'Dimensions',       max: 5  },
  file_size:       { label: 'File Size',         max: 5  },
  contrast:        { label: 'Contrast',          max: 15 },
  face:            { label: 'Face & Emotion',    max: 10 },
  text_presence:   { label: 'Text Presence',     max: 10 },
  text_readability:{ label: 'Text Readability',  max: 10 },
  vibrancy:        { label: 'Color Vibrancy',    max: 5  },
}

function getL1Explanation(keyName, score, benchFaceRate, benchTextRate) {
  switch (keyName) {
    case 'dimensions':
      if (score === 5) return {
        explanation: 'Your thumbnail is at the correct resolution. YouTube will display it sharply on every device and screen size.',
        fix: null,
      }
      if (score === 3) return {
        explanation: 'Your thumbnail is the right aspect ratio but not exactly 1280x720 pixels. YouTube may scale it in ways that reduce sharpness.',
        fix: 'Export your thumbnail at exactly 1280x720 pixels from your editing tool before uploading.',
      }
      return {
        explanation: 'Your thumbnail has the wrong aspect ratio. YouTube will crop or stretch it, cutting off parts of your image.',
        fix: 'Recreate your thumbnail at 1280x720 pixels with a 16:9 aspect ratio. Any other ratio will be distorted on YouTube.',
      }

    case 'file_size':
      if (score === 5) return {
        explanation: 'Your file size is optimal. It will load fast on all connections and devices.',
        fix: null,
      }
      if (score === 2) return {
        explanation: 'Your file is larger than the recommended 2MB. It may load slowly for viewers on mobile connections.',
        fix: 'Compress your thumbnail using a free tool like TinyPNG or Squoosh and re-upload. Aim for under 2MB without visible quality loss.',
      }
      return {
        explanation: 'Your file exceeds 4MB. YouTube may reject it or display a placeholder instead of your thumbnail.',
        fix: 'Compress your file immediately using TinyPNG or Squoosh. Get it under 2MB before uploading to YouTube.',
      }

    case 'contrast':
      if (score === 15) return {
        explanation: 'Excellent contrast between the light and dark areas of your thumbnail. It will stand out clearly in a crowded feed.',
        fix: null,
      }
      if (score >= 10) return {
        explanation: 'Your contrast is good but there is room to make the thumbnail punch harder in the feed. Increasing the separation between light and dark areas will improve visibility.',
        fix: 'In your editing tool, increase the contrast or brightness of your subject against the background. A darker background behind a bright subject works well.',
      }
      if (score >= 5) return {
        explanation: 'Your thumbnail has low contrast. It will look flat next to higher-contrast thumbnails in the same feed and is likely to be skipped.',
        fix: 'Add a strongly contrasting background color behind your subject. If your subject is bright, use a dark background. If your subject is dark, use a bright or saturated background.',
      }
      return {
        explanation: 'No meaningful contrast was detected. This thumbnail will visually disappear in the feed against any competing video.',
        fix: 'Rethink the color separation completely. The lightest and darkest areas of your thumbnail need to be dramatically different. Start with a plain colored background and a clearly lit subject.',
      }

    case 'face': {
      if (score === 10) return {
        explanation: 'A clear face was detected covering a strong portion of the thumbnail. Faces consistently drive higher CTR because viewers connect with human expression instantly.',
        fix: null,
      }
      if (score === 6) return {
        explanation: 'A face was detected but it covers less than 20% of the thumbnail. At thumbnail size on mobile, small faces lose their emotional impact and become hard to read.',
        fix: 'Crop your thumbnail tighter or physically move closer to the camera when filming your thumbnail shot. The face should be the dominant element, not a small part of a wider scene.',
      }
      if (score === 3) {
        const faceRef = benchFaceRate > 0 ? ` ${benchFaceRate}% of top performers in your niche use a prominent face as the anchor of their thumbnail.` : ''
        return {
          explanation: 'A face was detected but it is very small relative to the thumbnail. Viewers will not register the expression at a glance, which removes one of the strongest CTR drivers available.',
          fix: `Make the face fill at least the left or right half of the thumbnail. Zoom in aggressively.${faceRef}`,
        }
      }
      const faceIntro = benchFaceRate > 0
        ? `${benchFaceRate}% of top performing videos in your niche use a face. Faces create immediate human connection and are one of the most reliable drivers of higher CTR.`
        : 'Faces create immediate human connection and are one of the most reliable drivers of higher CTR.'
      return {
        explanation: `No face was detected in this thumbnail. ${faceIntro}`,
        fix: "Consider adding your face or a person's face to this thumbnail. If the video does not feature a person, use a strong object or scene that creates visual tension on its own.",
      }
    }

    case 'text_presence': {
      if (score === 10) return {
        explanation: 'Text was detected covering an optimal area of your thumbnail. The text is giving viewers additional context that works alongside the visual.',
        fix: null,
      }
      if (score >= 5) return {
        explanation: 'Text was detected but it covers a small area of the thumbnail. At mobile thumbnail size, small text becomes unreadable and loses its impact on CTR.',
        fix: 'Make your text significantly larger and bolder. Every word on a thumbnail should be readable when the thumbnail is displayed at 200 pixels wide on a phone screen.',
      }
      const textIntro = benchTextRate > 0
        ? `${benchTextRate}% of top performing videos in your niche use a text overlay. Text gives viewers an additional reason to click beyond the visual alone.`
        : 'Text gives viewers an additional reason to click beyond the visual alone.'
      return {
        explanation: `No text was detected on this thumbnail. ${textIntro}`,
        fix: 'Add a bold number, a strong question, or a short statement directly on the thumbnail image. Use white or yellow text with a thick black stroke so it reads on any background. Keep it under 5 words.',
      }
    }

    case 'text_readability':
      if (score === 10) return {
        explanation: 'Your text has excellent contrast against its background. It will be readable on any device and at any thumbnail size.',
        fix: null,
      }
      if (score >= 7) return {
        explanation: 'Your text is readable but the contrast against its background is borderline. On some screens or in bright conditions, it may be hard to read.',
        fix: 'Add a thick black stroke around your text or place a semi-transparent dark rectangle behind it. This separates the text from the background on any color.',
      }
      if (score >= 4) return {
        explanation: 'Your text is difficult to read against its background. Viewers scanning the feed will not be able to register the words before moving on.',
        fix: 'Switch to white or bright yellow text with a thick black stroke applied in your editing tool. Never place light-colored text on a light background or dark text on a dark background.',
      }
      return {
        explanation: 'Text readability could not be measured because no text was detected on this thumbnail.',
        fix: 'Add text to your thumbnail first, then re-upload for a readability score. See the Text Presence fix above for guidance on what to add.',
      }

    case 'vibrancy':
      if (score === 5) return {
        explanation: 'Your colors are vibrant and will catch the eye in a feed. Strong saturation is one of the clearest signals of a high-performing thumbnail.',
        fix: null,
      }
      if (score === 3) return {
        explanation: 'Your colors are moderately vibrant but have room to pop more. Slightly muted colors lose energy when placed next to more saturated thumbnails in the same feed.',
        fix: 'In your editing tool, increase the saturation by 15 to 20 percent and slightly boost the vibrancy. Compare the result to a top performer in your niche and match their energy level.',
      }
      if (score === 1) return {
        explanation: 'Your colors are muted. The thumbnail lacks visual energy and will look dull next to more saturated competitor thumbnails in the same feed row.',
        fix: 'Significantly boost the saturation and contrast in your editing tool. Consider switching to a background color that is bold and bright. Yellows, reds, and oranges consistently outperform muted or grey-toned backgrounds in YouTube feeds.',
      }
      return {
        explanation: 'Your thumbnail has very flat, desaturated colors. It has almost no visual energy and will be overlooked in any feed.',
        fix: 'Rethink the color palette entirely. Start with a bold, highly saturated background color and build the composition on top of it. Look at the top 5 thumbnails in your niche and match the energy of their color choices.',
      }

    default:
      return { explanation: '', fix: null }
  }
}

function L1Row({ keyName, data, benchComp }) {
  const [open, setOpen] = useState(false)
  const meta      = L1_META[keyName] || { label: keyName, max: 10 }
  const score     = data?.score ?? 0
  const max       = meta.max
  const col       = scoreColor(score, max)
  const bench     = benchComp?.[keyName]
  const faceRate  = benchComp?.benchmark_face_rate ?? 0
  const textRate  = benchComp?.benchmark_text_rate ?? 0

  const { explanation, fix } = getL1Explanation(keyName, score, faceRate, textRate)
  const hasContent = !!explanation

  let indicator = null
  if (bench) {
    const diff = bench.pct_diff ?? 0
    if (diff >= 0)       indicator = { icon: '✓', color: C.greenHi, label: `Niche avg: ${bench.benchmark}/${max}` }
    else if (diff > -20) indicator = { icon: '·', color: C.text2,  label: `Niche avg: ${bench.benchmark}/${max}` }
    else                 indicator = { icon: '✗', color: '#7a5b14', label: `Niche avg: ${bench.benchmark}/${max}` }
  }

  return (
    <div style={{ borderBottom: `1px solid rgba(20,19,15,0.06)` }}>
      <button
        onClick={() => { if (hasContent) setOpen(o => !o) }}
        style={{
          width: '100%', background: 'none', border: 'none',
          cursor: hasContent ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
          fontFamily: 'inherit', textAlign: 'left',
        }}
      >
        <div style={{ width: 130, flexShrink: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.text1 }}>{meta.label}</p>
        </div>
        <div style={{ flex: 1 }}>
          <MiniBar value={score} max={max} color={col}/>
        </div>
        <div style={{ width: 48, textAlign: 'right', flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: col, fontVariantNumeric: 'tabular-nums' }}>
            {score}/{max}
          </span>
        </div>
        {indicator && (
          <div style={{ width: 130, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 12, color: indicator.color, fontWeight: 600 }}>{indicator.icon}</span>
            <span style={{ fontSize: 12, color: C.text3 }}>{indicator.label}</span>
          </div>
        )}
        {hasContent && (
          <ChevronDown size={14} color={C.text3} style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}/>
        )}
      </button>

      {open && explanation && (
        <div style={{ paddingBottom: 14, display: 'grid', gridTemplateColumns: fix ? '1fr 1fr' : '1fr', gap: 8 }}>
          {/* Why, charcoal-neutral tint. Reasoning context goes neutral so red stays semantic for the actionable Fix. */}
          <div style={{ background: 'rgba(20,19,15,0.04)', border: '1px solid rgba(15,15,19,0.08)', borderRadius: 0, padding: '11px 13px' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Why</p>
            <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.7 }}>{explanation}</p>
          </div>
          {fix && (
            /* Fix, symmetric red-tinted card, matches WeeklyReport priority pattern */
            <div style={{
              background: 'linear-gradient(160deg, rgba(201,160,48,0.07) 0%, rgba(201,160,48,0.025) 100%)',
              border: '1px solid rgba(201,160,48,0.22)',
              borderRadius: 0,
              padding: '11px 14px',
              boxShadow: 'none',
            }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#7a5b14', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Fix</p>
              <p style={{ fontSize: 14, color: C.text1, lineHeight: 1.7 }}>{fix}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Layer 2 dimension row ───────────────────────────────────────────────── */
const L2_LABELS = {
  facialEmotion:      'Facial Emotion',
  textPsychology:     'Text Psychology',
  colorPsychology:    'Color Psychology',
  composition:        'Composition',
  titleRelationship:  'Title Relationship',
  feedDistinctiveness:'Feed Distinctiveness',
}

function L2Row({ dimKey, dim }) {
  const [open, setOpen] = useState(false)
  if (!dim) return null
  const score = dim.score ?? 0
  const col   = scoreColor(score, 10)
  const hasFix = score < 8 && dim.fix

  return (
    <div style={{ borderBottom: `1px solid rgba(20,19,15,0.06)` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                 display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
                 fontFamily: 'inherit', textAlign: 'left' }}
      >
        <div style={{ width: 160, flexShrink: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.text1 }}>{L2_LABELS[dimKey] || dimKey}</p>
        </div>
        <div style={{ flex: 1 }}>
          <MiniBar value={score} max={10} color={col}/>
        </div>
        <div style={{ width: 36, textAlign: 'right', flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: col, fontVariantNumeric: 'tabular-nums' }}>
            {score}/10
          </span>
        </div>
        <ChevronDown size={14} color={C.text3} style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}/>
      </button>

      {open && (
        <div style={{ paddingBottom: 12 }}>
          {dim.verdict && (
            <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.65, marginBottom: 8 }}>
              {dim.verdict}
            </p>
          )}
          {dim.vs_benchmark && (
            <p style={{ fontSize: 12.5, color: C.text3, lineHeight: 1.6, marginBottom: hasFix ? 8 : 0 }}>
              vs. top performers: {dim.vs_benchmark}
            </p>
          )}
          {hasFix && (
            <div style={{
              background: 'rgba(201,160,48,0.07)',
              border: '1px solid rgba(201,160,48,0.22)',
              borderRadius: 0,
              padding: '10px 12px',
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#7a5b14', marginBottom: 4,
                          letterSpacing: '0.06em', textTransform: 'uppercase' }}>Fix</p>
              <p style={{ fontSize: 14, color: C.text1, lineHeight: 1.6 }}>{dim.fix}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Linked idea context card ────────────────────────────────────────────── */
function LinkedIdeaCard({ idea }) {
  if (!idea) return null
  return (
    <div style={{
      background: 'rgba(20,19,15,0.035)',
      border: '1px solid rgba(15,15,19,0.08)',
      borderRadius: 0, padding: '12px 14px', marginBottom: 16,
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 10.5, fontWeight: 600, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
          Benchmarked for
        </p>
        <p style={{ fontSize: 14, fontWeight: 600, color: C.text1, marginBottom: idea.angle ? 4 : 0, letterSpacing: '-0.1px', lineHeight: 1.35 }}>
          {idea.title}
        </p>
        {idea.angle && (
          <p style={{ fontSize: 12.5, color: C.text2, fontWeight: 400, lineHeight: 1.55 }}>
            {idea.angle}
          </p>
        )}
      </div>
      <span style={{
        flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 11, fontWeight: 600, color: C.greenHi,
        background: C.greenBg, border: `1px solid ${C.greenBdr}`,
        borderRadius: 0, padding: '3px 9px',
        letterSpacing: '0.04em',
        fontVariantNumeric: 'tabular-nums',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: C.green }}/>
        Gap · {idea.opportunityScore}/100
      </span>
    </div>
  )
}

/* ─── Time helper ────────────────────────────────────────────────────────── */
function timeAgo(isoStr) {
  if (!isoStr) return ''
  const d = Math.floor((Date.now() - new Date(isoStr).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return '1 day ago'
  if (d < 30) return `${d} days ago`
  const m = Math.floor(d / 30)
  return `${m} month${m > 1 ? 's' : ''} ago`
}

/* ─── History panel ───────────────────────────────────────────────────────── */
function HistoryPanel({ history, activeId, onSelect, onDelete }) {
  if (!history || history.length < 2) return null
  return (
    <div style={{ marginTop: 24 }}>
      <p style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase',
                  letterSpacing: '0.06em', marginBottom: 10 }}>Previous Thumbnails</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {history.map(item => {
          const isActive = item.id === activeId
          const score = item.final_score ?? item.algorithm_score ?? 0
          const max   = item.final_score != null ? 100 : 60
          const col   = scoreColor(score, max)
          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 10px', borderRadius: 0, cursor: 'pointer',
                border: `1px solid ${isActive ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.06)'}`,
                background: isActive ? C.cardFlat : C.surfaceInput,
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f9f9fb' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = C.cardFlat }}
            >
              {item.thumbnail_b64
                ? <img src={`data:image/jpeg;base64,${item.thumbnail_b64}`} alt=""
                       style={{ width: 48, height: 27, borderRadius: 0, objectFit: 'cover', flexShrink: 0 }}/>
                : <div style={{ width: 48, height: 27, borderRadius: 0, background: '#e8e4dc', flexShrink: 0 }}/>
              }
              <span style={{ fontSize: 12, fontWeight: 500, color: col, flexShrink: 0,
                             fontVariantNumeric: 'tabular-nums' }}>{score}/{max}</span>
              {item.confirmed_keyword && (
                <span style={{ fontSize: 12, color: '#9ca3af', flex: 1, overflow: 'hidden',
                               textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.confirmed_keyword}
                </span>
              )}
              <span style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>
                {timeAgo(item.uploaded_at)}
              </span>
              {item.linked_video_idea?.thumbnail_ready && (
                <span style={{ fontSize: 12, fontWeight: 500, color: '#2d7a4f',
                               background: '#dcfce7', borderRadius: 0, padding: '2px 6px', flexShrink: 0 }}>
                  Ready
                </span>
              )}
              <button
                onClick={e => { e.stopPropagation(); onDelete(item.id) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
                         color: '#d1d5db', padding: '0 2px', flexShrink: 0, lineHeight: 1,
                         fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#c0392b' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#d1d5db' }}
                title="Remove"
              >×</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Upload panel (ideas dropdown + topic + file zone) ───────────────────── */
/* Custom dropdown, replaces native <select> which renders as OS-default (ugly on Windows/Linux).
   Supports options with a primary label, optional right-side meta chip, optional divider. Closes on outside click. */
function Dropdown({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  useEffect(() => {
    const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    if (open) document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])
  const selected = options.find(o => o.value === value)
  return (
    <div ref={wrapRef} style={{ position: 'relative', fontFamily: 'inherit' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', boxSizing: 'border-box', textAlign: 'left',
          border: `1px solid ${open ? 'rgba(201,160,48,0.35)' : C.border}`,
          borderRadius: 0,
          padding: '12px 40px 12px 14px', fontSize: 13, fontWeight: 500,
          color: selected ? C.text1 : C.text3,
          background: C.cardFlat, fontFamily: 'inherit', outline: 'none',
          cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: open ? '0 0 0 3px rgba(201,160,48,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? selected.label : placeholder}
        </span>
        {selected?.meta && (
          <span style={{ fontSize: 11, fontWeight: 600, color: C.amberHi, background: C.amberBg, border: `1px solid ${C.amberBdr}`, borderRadius: 0, padding: '2px 8px', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
            {selected.meta}
          </span>
        )}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={C.text3} strokeWidth="2"
             style={{ position: 'absolute', right: 14, top: '50%', transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`, transition: 'transform 0.2s', pointerEvents: 'none' }}>
          <path d="M2 4l4 4 4-4"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: C.cardFlat,
          border: `1px solid rgba(0,0,0,0.1)`,
          borderRadius: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.16)',
          maxHeight: 320, overflowY: 'auto', overflowX: 'hidden',
          padding: 6, zIndex: 20,
          animation: 'thumbFadeUp 0.16s ease both',
        }}>
          {options.map((opt, i) => {
            const isSelected = opt.value === value
            return (
              <div key={opt.value || `sep-${i}`}>
                {opt.divider && <div style={{ height: 1, background: C.border, margin: '6px 8px' }}/>}
                <button
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fafafb' }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'rgba(201,160,48,0.05)' : 'transparent' }}
                  style={{
                    width: '100%', boxSizing: 'border-box', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', border: 'none', borderRadius: 0,
                    background: isSelected ? 'rgba(201,160,48,0.05)' : 'transparent',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: C.text1, fontWeight: isSelected ? 600 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.1px' }}>
                    {opt.label}
                  </span>
                  {opt.meta && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.amberHi, background: C.amberBg, border: `1px solid ${C.amberBdr}`, borderRadius: 0, padding: '2px 9px', flexShrink: 0, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.1px' }}>
                      {opt.meta}
                    </span>
                  )}
                  {isSelected && (
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke={C.red} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polyline points="1.5,7.5 5.5,11.5 12.5,2.5"/>
                    </svg>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function UploadPanel({ videoIdeas, hasIdeas, initialIdea, initialTopic, topicSource, onNavigate, onUpload }) {
  const inputRef = useRef(null)
  const [drag, setDrag]             = useState(false)
  const [file, setFile]             = useState(null)
  const [selectedIdea, setSelected] = useState(initialIdea || null)
  const [dropdownVal, setDropdown]  = useState(initialIdea ? String(initialIdea.rank) : '')
  const [topicInput, setTopic]      = useState(
    initialIdea ? initialIdea.targetKeyword : (initialTopic || '')
  )
  const [topicEdited, setEdited]    = useState(false)
  const [bannerDismissed, setBanner]= useState(
    () => !!localStorage.getItem('ytg_vi_banner_dismissed')
  )

  const confirmedKeyword = topicInput.trim()
  const canUpload = !!file && !!confirmedKeyword

  // Topic hint text
  let topicHint = ''
  if (selectedIdea) {
    topicHint = 'From your video ideas · powered by competitor research'
  } else if (!topicEdited && initialTopic && topicInput === initialTopic) {
    if (topicSource === 'channel_keywords') topicHint = 'Detected from your channel · Edit if different'
    else if (topicSource === 'video_titles') topicHint = 'Based on your top performing videos · Edit if needed'
  }

  function handleIdeaSelect(val) {
    setDropdown(val)
    if (val === 'manual') {
      setSelected(null)
      setTopic('')
      setEdited(false)
    } else if (val) {
      const idea = videoIdeas.find(i => String(i.rank) === val)
      if (idea) {
        setSelected(idea)
        setTopic(idea.targetKeyword)
        setEdited(false)
      }
    } else {
      setSelected(null)
    }
  }

  function handleFileSelect(files) {
    const f = files[0]
    if (!f) return
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(f.type)) {
      alert('Only JPG and PNG files are accepted.')
      return
    }
    setFile(f)
  }

  function handleUploadClick() {
    if (!canUpload) return
    const videoTitle = selectedIdea ? selectedIdea.title : topicInput
    onUpload(file, confirmedKeyword, videoTitle, selectedIdea ? selectedIdea.rank : null, selectedIdea)
  }

  const dropdownOptions = [
    ...videoIdeas.map(idea => ({
      value: String(idea.rank),
      label: idea.title,
      meta: `${idea.opportunityScore}/100`,
    })),
    { value: 'manual', label: 'My own topic', divider: true },
  ]

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', fontFamily: 'inherit' }}>
     {/* Font scoped explicitly so dropdown + inputs inherit Inter. */}
     <div className="tiq-card" style={{
       padding: '26px 28px',
       fontFamily: 'inherit',
     }}>

      {/* Card header, neutral grey eyebrow (red stays semantic for CTAs, not generic labels).
          Typography scale: 11 eyebrow · 13 desc (matches Overview's card headers). */}
      <div style={{ marginBottom: 18, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>Score a new thumbnail</p>
        <p style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.6 }}>
          Match your thumbnail to a video idea. You'll get a benchmark from videos already winning on YouTube for that topic.
        </p>
      </div>

      {/* Part A: Video Ideas dropdown */}
      {hasIdeas && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            Is this thumbnail for one of your video ideas?
          </p>
          <Dropdown
            value={dropdownVal}
            onChange={handleIdeaSelect}
            options={dropdownOptions}
            placeholder="Select a video idea…"
          />

          {selectedIdea && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 3, background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.18)', borderRadius: 0, padding: '12px 14px' }}>
              <p style={{ fontSize: 12.5, color: C.greenHi, fontWeight: 600, letterSpacing: '-0.1px' }}>
                Using competitor-researched keyword: &quot;{selectedIdea.targetKeyword}&quot;
              </p>
              {selectedIdea.angle && (
                <p style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.5 }}>Gap: {selectedIdea.angle}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Part B: Topic input */}
      <div style={{ marginBottom: 14 }}>
        {hasIdeas && (
          <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            Your video topic
          </p>
        )}
        <input
          value={topicInput}
          readOnly={!!selectedIdea}
          onChange={e => {
            if (selectedIdea) return
            setTopic(e.target.value)
            setEdited(true)
          }}
          placeholder="e.g. how to save money in your 20s"
          style={{
            width: '100%', boxSizing: 'border-box',
            border: `1px solid ${C.border}`, borderRadius: 0,
            padding: '12px 14px', fontSize: 14,
            color: selectedIdea ? C.text3 : C.text1,
            background: selectedIdea ? C.cardFlat : C.surfaceInput,
            fontFamily: 'inherit', outline: 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={e => {
            if (selectedIdea) return
            e.currentTarget.style.borderColor = 'rgba(201,160,48,0.35)'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,160,48,0.08)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = C.border
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'
          }}
        />
        {topicHint && (
          <p style={{ fontSize: 12, color: C.text3, marginTop: 4 }}>{topicHint}</p>
        )}
      </div>

      {/* Info banner when no video ideas, amber warning tint (no blue), Lightbulb in a soft tinted circle. */}
      {!hasIdeas && !bannerDismissed && (
        <div style={{
          marginBottom: 14, background: C.amberBg, border: `1px solid ${C.amberBdr}`,
          borderRadius: 0, padding: '12px 14px',
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 99,
            background: 'rgba(201,160,48,0.14)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Lightbulb size={14} color={C.amber}/>
          </div>
          <p style={{ flex: 1, fontSize: 12.5, color: C.text1, lineHeight: 1.6, margin: 0 }}>
            Run <strong style={{ fontWeight: 600 }}>Video Ideas</strong> first for the most accurate thumbnail benchmarks. Your ideas are built from real competitor research.{' '}
            {onNavigate && (
              <button
                onClick={() => onNavigate('Video Ideas')}
                style={{ background: 'none', border: 'none', color: '#7a5b14', cursor: 'pointer',
                         fontWeight: 600, padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}
              >
                Go to Video Ideas →
              </button>
            )}
          </p>
          <button
            onClick={() => {
              setBanner(true)
              localStorage.setItem('ytg_vi_banner_dismissed', '1')
            }}
            style={{ background: 'none', border: 'none', color: C.text3, cursor: 'pointer',
                     fontSize: 18, padding: '0 0 0 4px', flexShrink: 0, lineHeight: 1, fontFamily: 'inherit' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        className={`tiq-upload-zone${file ? '' : ' clickable'}${drag ? ' drag-over' : ''}`}
        onClick={() => { if (!file) inputRef.current?.click() }}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFileSelect(e.dataTransfer.files) }}
      >
        {file ? (
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.text1, marginBottom: 4 }}>{file.name}</p>
            <p style={{ fontSize: 12, color: C.text3, marginBottom: 10 }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB · ready to analyze
            </p>
            <button
              onClick={e => { e.stopPropagation(); setFile(null) }}
              style={{ fontSize: 12, color: '#7a5b14', background: 'none', border: 'none',
                       cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <div style={{
              width: 44, height: 44, borderRadius: 99,
              background: 'rgba(201,160,48,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <Upload size={20} color={C.red} strokeWidth={2}/>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.text1, marginBottom: 6 }}>
              Drop your thumbnail here or click to upload
            </p>
            <p style={{ fontSize: 12, color: C.text3 }}>JPG or PNG · Max 4MB · Best at 1280×720</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png"
               style={{ display: 'none' }}
               onChange={e => handleFileSelect(e.target.files)}/>
      </div>

      {/* Analyze button, matches the full-width red pill CTA used site-wide
          (Overview / Videos / Outliers / SEO Optimizer): radius 100, 13.5/700 */}
      <button
        onClick={handleUploadClick}
        disabled={!canUpload}
        style={{
          marginTop: 14, width: '100%',
          padding: '12px 16px',
          background: canUpload ? C.red : '#e0e0e6',
          color: canUpload ? 'var(--yd-on-gold)' : C.text3,
          border: 'none', borderRadius: 0, fontSize: 13, fontWeight: 600,
          cursor: canUpload ? 'pointer' : 'not-allowed',
          fontFamily: COND, textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'filter 0.15s',
        }}
        onMouseEnter={e => { if (canUpload) e.currentTarget.style.filter = 'brightness(1.1)' }}
        onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
      >
        {!file ? 'Select a thumbnail first' : !confirmedKeyword ? 'Enter a topic first' : 'Analyze Thumbnail'}
      </button>
     </div>
    </div>
  )
}


/* ─── Main component ──────────────────────────────────────────────────────── */
export default function ThumbnailScore({ channelData, onNavigate, plan, freeTierFeatures }) {
  // Free-tier one-run gate. `gated` starts true when the user has already
  // used their run this cycle (from /auth/me); flips to true if a live
  // /thumbnail/analyze call returns 403. Backend remains the source of truth.
  const [gated, setGated] = useState(
    (plan || 'free') === 'free'
    && (freeTierFeatures?.thumbnail_score === 'locked' || freeTierFeatures?.thumbnail_score === 'used')
  )

  // state: 'loading' | 'idle' | 'uploading' | 'ready1' | 'analyzing' | 'ready2'
  const [state,        setState]      = useState('loading')
  const [analysis,     setAnalysis]   = useState(null)
  const [error,        setError]      = useState('')
  const [l1open,       setL1Open]     = useState(false)
  const [creditsOut,   setCreditsOut] = useState(false)

  // Tabs: 'new' | 'previous'
  const [activeTab,    setActiveTab]  = useState('new')
  // Which history item is expanded in the Previous tab
  const [historyOpen,  setHistoryOpen]= useState(null)   // id string

  // Video ideas integration
  const [videoIdeas,   setVideoIdeas] = useState([])
  const [hasIdeas,     setHasIdeas]   = useState(false)
  const [preFillIdea,  setPreFill]    = useState(null)
  const [initialTopic, setInitTopic]  = useState('')
  const [topicSource,  setTopicSrc]   = useState('')  // 'channel_keywords'|'video_titles'|'channel_name'|''

  // Mark ready
  const [markingReady, setMarkingReady] = useState(false)
  const [markedReady,  setMarkedReady]  = useState(false)

  // History
  const [history,     setHistory]    = useState([])
  const [dupMessage,  setDupMsg]     = useState('')

  const preloadRef = useRef(null)

  // ── Derive initial topic from channel data ────────────────────────────────
  function deriveTopicFromChannel() {
    const ch       = channelData?.channel || {}
    const keywords = ch.keywords
    if (keywords && keywords !== 'Not set' && String(keywords).trim()) {
      const first = Array.isArray(keywords) ? keywords[0] : String(keywords).split(',')[0].trim()
      if (first) { setTopicSrc('channel_keywords'); return first }
    }
    const videos = channelData?.videos
    if (Array.isArray(videos) && videos.length > 0) {
      const sorted = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0))
      const titles = sorted.slice(0, 5).map(v => v.title).filter(Boolean)
      if (titles.length > 0) { setTopicSrc('video_titles'); return titles[0] }
    }
    const name = ch.channel_name
    if (name) { setTopicSrc('channel_name'); return name }
    return ''
  }

  // ── On mount ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // Read localStorage synchronously before any async calls
    const prefillRaw = localStorage.getItem('ytg_prefill_idea')
    if (prefillRaw) {
      localStorage.removeItem('ytg_prefill_idea')
      try { setPreFill(JSON.parse(prefillRaw)) } catch {}
    }

    const scoreRaw = localStorage.getItem('ytg_score_this')
    if (scoreRaw) {
      localStorage.removeItem('ytg_score_this')
      try { preloadRef.current = JSON.parse(scoreRaw) } catch {}
    }

    // Render the page as soon as video-ideas resolves. History was previously
    // blocked behind a Promise.all and could carry up to 5 full base64-encoded
    // thumbnails (~1 MB of JSON) on a cold Postgres connection, that's what
    // produced the ~20s spinner on Thumbnails. The user lands on "New Thumbnail"
    // by default, so history can populate in the background and the Previous
    // tab will light up when it's ready.
    const topic = deriveTopicFromChannel()
    setInitTopic(topic)

    fetch('/thumbnail/video-ideas', { credentials: 'include' })
      .then(r => r.json()).catch(() => ({}))
      .then(viData => {
        if (viData.has_ideas && viData.ideas?.length) {
          setVideoIdeas(viData.ideas)
          setHasIdeas(true)
        }
        setState('idle')
      })

    fetch('/thumbnail/history', { credentials: 'include' })
      .then(r => r.json()).catch(() => ({}))
      .then(histData => {
        const analyses = histData.analyses || []
        setHistory(analyses)
      })
  }, []) // eslint-disable-line

  // ── Auto-trigger score_this preload ──────────────────────────────────────
  useEffect(() => {
    if (state === 'idle' && preloadRef.current) {
      const { dataUrl, title } = preloadRef.current
      preloadRef.current = null
      fetch(dataUrl).then(r => r.blob()).then(blob => {
        const f = new File([blob], 'thumbnail.jpg', { type: blob.type || 'image/jpeg' })
        handleUpload(f, title, title, null, null)
      }).catch(() => {})
    }
  }, [state]) // eslint-disable-line

  // ── Upload handler ─────────────────────────────────────────────────────────
  async function handleUpload(file, confirmedKeyword, videoTitle, ideaId, ideaData) {
    setState('uploading')
    setError('')
    setDupMsg('')

    const fd = new FormData()
    fd.append('file', file)
    fd.append('video_title', videoTitle || '')
    fd.append('confirmed_keyword', confirmedKeyword || '')
    if (ideaId != null) fd.append('video_idea_id', String(ideaId))
    if (ideaData)       fd.append('video_idea_data', JSON.stringify(ideaData))

    try {
      const r = await fetch('/thumbnail/upload', { method: 'POST', credentials: 'include', body: fd })
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error || 'Upload failed')
      setAnalysis(d.analysis)
      setMarkedReady(false)
      if (d.already_analyzed) setDupMsg('This thumbnail was analyzed before. Here are your saved results.')
      setState(d.analysis.layer2_scores ? 'ready2' : 'ready1')
      setActiveTab('new')
      // Refresh history
      fetch('/thumbnail/history', { credentials: 'include' }).then(r => r.json())
        .then(hd => setHistory(hd.analyses || [])).catch(() => {})
    } catch (e) {
      setError(e.message || 'Upload failed')
      setState('idle')
    }
  }

  // ── Layer 2 handler ────────────────────────────────────────────────────────
  async function handleAnalyze() {
    if (!analysis?.id) return
    // Client-side short-circuit for free-tier one-run users.
    if (gated) {
      setCreditsOut(true)
      return
    }
    setState('analyzing')
    setError('')
    const controller = new AbortController()
    const timeoutId  = setTimeout(() => controller.abort(), 70000)  // 70s client timeout
    try {
      const r = await fetch('/thumbnail/analyze', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thumbnail_id: analysis.id }),
        signal: controller.signal,
      })
      if (r.status === 401) { window.location = '/'; return }
      // 403 with {error:"locked"} = free-tier one-run gate hit. Flip to the
      // upsell view; don't treat it as a retryable analysis failure.
      if (r.status === 403) {
        const d = await r.json().catch(() => ({}))
        if (d.error === 'locked' || d.reason === 'used' || d.reason === 'locked') {
          setGated(true)
          setCreditsOut(true)
          setState('ready1')
          return
        }
      }
      if (r.status === 402) { setCreditsOut(true); setState('ready1'); return }
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error || "Something went wrong on our end. Email support@ytgrowth.io and we'll sort it out.")
      setAnalysis(d.analysis)
      setState('ready2')
      window.dispatchEvent(new CustomEvent('ytg:credits-changed'))
    } catch (e) {
      const msg = e.name === 'AbortError'
        ? "Analysis timed out. Email support@ytgrowth.io if you need a credit refunded."
        : (e.message || "Something went wrong on our end. Email support@ytgrowth.io and we'll sort it out.")
      setError(msg)
      setState('ready1')
    } finally {
      clearTimeout(timeoutId)
    }
  }

  // ── Delete a history entry (hard delete, explicit only) ───────────────────
  async function handleDelete(thumbnailId) {
    await fetch('/thumbnail/delete', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thumbnail_id: thumbnailId }),
    }).catch(() => {})
    const remaining = history.filter(h => h.id !== thumbnailId)
    setHistory(remaining)
    if (analysis?.id === thumbnailId) {
      if (remaining.length > 0) {
        setAnalysis(remaining[0])
        setState(remaining[0].layer2_scores ? 'ready2' : 'ready1')
      } else {
        setAnalysis(null)
        setMarkedReady(false)
        setState('idle')
      }
    }
  }

  // ── Restore a history entry as active ─────────────────────────────────────
  function handleRestoreHistory(item) {
    setAnalysis(item)
    setMarkedReady(!!item.linked_video_idea?.thumbnail_ready)
    setState(item.layer2_scores ? 'ready2' : 'ready1')
    setDupMsg('')
    setActiveTab('previous')
  }

  // ── Mark idea as Thumbnail Ready ───────────────────────────────────────────
  async function handleMarkReady() {
    if (!analysis?.id || !analysis?.linked_video_idea) return
    setMarkingReady(true)
    try {
      const r = await fetch('/video-ideas/mark-ready', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id:   analysis.channel_id,
          idea_rank:    analysis.linked_video_idea.rank,
          thumbnail_id: analysis.id,
        }),
      })
      if (r.ok) setMarkedReady(true)
    } catch {}
    setMarkingReady(false)
  }

  // ── Copy share card ────────────────────────────────────────────────────────
  async function handleCopyCard() {
    const el = document.getElementById('tiq-share-card')
    if (!el) return
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(el, { useCORS: true, scale: 2 })
      canvas.toBlob(blob => {
        if (blob) navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      })
    } catch {}
  }

  // ─────────────────────────────────────────────────────────────────────────
  const l1         = analysis?.layer1_scores
  const l2         = analysis?.layer2_scores
  const bcomp      = analysis?.benchmark_comparison || {}
  const algoScore  = analysis?.algorithm_score ?? 0
  const finalScore = analysis?.final_score ?? 0
  const keyword    = analysis?.confirmed_keyword || ''
  const fmt        = analysis?.format || ''
  const bracket    = analysis?.size_bracket || ''
  const linkedIdea = analysis?.linked_video_idea || null

  // ── Loading ────────────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, gap: 12 }}>
        <div style={{ width: 24, height: 24, border: `2.5px solid #e8e4dc`,
                      borderTop: `2.5px solid ${C.red}`, borderRadius: '50%',
                      animation: 'thumbSpin 0.7s linear infinite' }}/>
        <p style={{ color: C.text3, fontSize: 14 }}>Loading…</p>
      </div>
    )
  }

  const TABS = [
    { key: 'new',      label: 'New Thumbnail' },
    { key: 'previous', label: history.length > 0 ? `Previous (${history.length})` : 'Previous' },
  ]

  // Intent-based paywall: always render the page. Gated users see the modal
  // when they hit Analyze. History remains browsable.

  return (
    <div style={{
      // Negative margin + matching padding so the page extends to the
      // scroll container edges, the same trick Overview / SEO use.
      // No background here: the dark-route ground in Dashboard.jsx
      // (var(--yd-paper)) shows through, so this page reads as one system with
      // Competitors / Keywords / Outliers instead of a lighter var(--yd-surface)
      // band that broke the topbar→body continuity.
      margin: '-36px -40px -72px',
      padding: '36px 40px 72px',
      minHeight: 'calc(100vh - 52px)',
    }}>
     {/* 1040 centered column, every polished feature page (Video Ideas / SEO / Overview) wraps content
         in this. Don't drop it; the 2fr/3fr results grid stretches without an upper bound otherwise. */}
     <div className="tiq-page" style={{ maxWidth: 1040, margin: '0 auto' }}>

      {/* Header, H1 26/700, matching every other redesigned page */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 500, color: C.text1, letterSpacing: '-0.01em', marginBottom: 6, lineHeight: 1.12 }}>Thumbnail IQ</h1>
            <p style={{ fontSize: 14, color: C.text2, fontWeight: 400, lineHeight: 1.5, letterSpacing: '-0.05px' }}>
              See how your thumbnail performs before you publish
              <span> · Benchmarked against real top-ranked channels</span>
              {history.length > 0 && <span> · <span style={{ color: C.text1, fontWeight: 600 }}>{history.length}</span> saved</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs, quiet soft-grey active (matches the feedback-quiet-toggles rule
          used across every redesigned page; the red underline pattern violated it). */}
      <div className="tiq-tab-strip">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`tiq-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: C.redBg, border: `1px solid ${C.redBdr}`, borderRadius: 0,
                      padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#7a5b14' }}>
          {error}
        </div>
      )}

      {/* Duplicate message */}
      {dupMessage && (
        <p style={{ fontSize: 14, color: C.text2, fontWeight: 400, marginBottom: 14 }}>
          {dupMessage}
        </p>
      )}

      {/* ── PREVIOUS TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'previous' && (
        <div className="tiq-section">
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '72px 24px' }}>
              <span style={{
                fontSize: 11, fontWeight: 600, color: C.text3,
                letterSpacing: '0.10em', textTransform: 'uppercase',
                display: 'inline-block', marginBottom: 12,
              }}>History</span>
              <p style={{ fontSize: 16, fontWeight: 600, color: C.text1, letterSpacing: '-0.2px', marginBottom: 8, lineHeight: 1.3 }}>No previous thumbnails</p>
              <p style={{ fontSize: 14, color: C.text2, maxWidth: 340, margin: '0 auto', lineHeight: 1.6 }}>
                Upload a thumbnail to get started. It will be saved here automatically.
              </p>
            </div>
          ) : (
            history.map(item => {
              const isOpen     = historyOpen === item.id
              const score      = item.final_score ?? item.algorithm_score ?? 0
              const max        = item.final_score != null ? 100 : 60
              const col        = scoreColor(score, max)
              const itemL1     = item.layer1_scores
              const itemL2     = item.layer2_scores
              const itemLinked = item.linked_video_idea || null
              const savedAt    = item.uploaded_at
                ? new Date(item.uploaded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                : ''

              const Chevron = () => (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                  <path d="M2 4l4 4 4-4"/>
                </svg>
              )

              return (
                <div key={item.id} className="tiq-acc-wrapper">

                  {/* Trash, hidden until wrapper hovered */}
                  <button className="tiq-remove-btn"
                    title="Remove thumbnail"
                    onClick={e => { e.stopPropagation(); handleDelete(item.id) }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 5.5l.5 5M9 5.5l-.5 5M3 3.5l.7 8.5h6.6L11 3.5"/>
                    </svg>
                  </button>

                  {/* The 3px severity stripe above each card was dropped - the
                      score chip + verdict pill carry the tier signal cleanly. */}

                  {/* Accordion header */}
                  <div className={`tiq-acc-header ${isOpen ? 'open' : ''}`}
                    onClick={() => setHistoryOpen(isOpen ? null : item.id)}>

                    {item.thumbnail_b64
                      ? <img src={`data:image/jpeg;base64,${item.thumbnail_b64}`} alt=""
                             style={{ width: 64, height: 36, borderRadius: 0, objectFit: 'cover',
                                      flexShrink: 0, boxShadow: '0 1px 3px rgba(15,15,25,0.08), 0 4px 12px rgba(15,15,25,0.08)' }}/>
                      : <div style={{ width: 64, height: 36, borderRadius: 0, background: '#e8e4dc', flexShrink: 0 }}/>
                    }

                    {/* Left: keyword + chips */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, color: C.text1,
                                    letterSpacing: '-0.15px', overflow: 'hidden',
                                    textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.confirmed_keyword || 'Untitled'}
                        </p>
                        {item.linked_video_idea?.thumbnail_ready && (
                          <span style={{ fontSize: 11, fontWeight: 600, color: C.greenHi,
                                         background: C.greenBg, border: `1px solid ${C.greenBdr}`,
                                         borderRadius: 0, padding: '2px 8px', flexShrink: 0, letterSpacing: '-0.05px' }}>
                            Thumbnail Ready
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Score chip, number is the data point, kept at 13/700 for emphasis (numbers are the one
                            place 700 still earns its keep) but the chip chrome is neutral, not coloured-border. */}
                        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2,
                                       background: C.cardFlat, border: `1px solid ${col}33`,
                                       borderRadius: 0, padding: '3px 10px', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: col, letterSpacing: '-0.2px' }}>{score}</span>
                          <span style={{ color: C.text3, fontWeight: 500 }}>/{max}</span>
                        </span>
                        {/* Verdict pill */}
                        <span style={{ fontSize: 10, fontWeight: 600, color: col, letterSpacing: '0.10em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 0, border: `1px solid ${col}55` }}>
                          {scoreLabel(score, max)}
                        </span>
                        {item.format && (
                          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 3,
                                         background: 'rgba(20,19,15,0.060)', border: '1px solid rgba(10,10,15,0.07)',
                                         borderRadius: 0, padding: '3px 9px', fontSize: 11, color: C.text2, fontWeight: 500, letterSpacing: '-0.05px' }}>
                            {item.format}
                          </span>
                        )}
                        {savedAt && (
                          <span style={{ fontSize: 12, color: C.text3, fontWeight: 500, marginLeft: 2 }}>
                            · {savedAt}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Open report button */}
                    <div style={{ flexShrink: 0, borderLeft: '1px solid rgba(0,0,0,0.07)',
                                  paddingLeft: 16, marginLeft: 4, paddingRight: 32 }}>
                      <button className={`tiq-btn-report ${isOpen ? 'open' : ''}`}
                        onClick={e => { e.stopPropagation(); setHistoryOpen(isOpen ? null : item.id) }}>
                        {isOpen ? 'Close' : 'Open report'}
                        <Chevron />
                      </button>
                    </div>
                  </div>

                  {/* Expanded body */}
                  {isOpen && itemL1 && (
                    <div className="tiq-acc-body">
                      <LinkedIdeaCard idea={itemLinked} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 20 }}>
                        {/* Left: image + inline AI-tag pills + Biggest Win/Fix below to fill the column height */}
                        <div>
                          <div style={{ borderRadius: 0, overflow: 'hidden', border: `1px solid ${C.border}`, background: C.cardFlat }}>
                            {item.thumbnail_b64
                              ? <img src={`data:image/jpeg;base64,${item.thumbnail_b64}`} alt=""
                                     style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }}/>
                              : <div style={{ width: '100%', aspectRatio: '16/9', background: '#e8e4dc' }}/>
                            }
                            {itemL2 && (itemL2.emotionLabel || itemL2.feedPosition) && (
                              <div style={{ borderTop: `1px solid ${C.border}`, padding: '10px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {itemL2.emotionLabel && (
                                  <Badge text={itemL2.emotionLabel}
                                    color={itemL2.emotionLabel.toLowerCase().includes('neutral') ? C.amber : C.green}
                                    bg={itemL2.emotionLabel.toLowerCase().includes('neutral') ? C.amberBg : C.greenBg}
                                    bdr={itemL2.emotionLabel.toLowerCase().includes('neutral') ? C.amberBdr : C.greenBdr}
                                  />
                                )}
                                {itemL2.feedPosition && (
                                  <Badge
                                    text={itemL2.feedPosition === 'stands out' ? 'Stands Out' : itemL2.feedPosition === 'disappears' ? 'Disappears' : 'Blends In'}
                                    color={itemL2.feedPosition === 'stands out' ? C.green : itemL2.feedPosition === 'disappears' ? C.red : C.amber}
                                    bg={itemL2.feedPosition === 'stands out' ? C.greenBg : itemL2.feedPosition === 'disappears' ? C.redBg : C.amberBg}
                                    bdr={itemL2.feedPosition === 'stands out' ? C.greenBdr : itemL2.feedPosition === 'disappears' ? C.redBdr : C.amberBdr}
                                  />
                                )}
                              </div>
                            )}
                          </div>

                          {/* Biggest Win / Fix stacked below thumbnail (fills the left-column void) */}
                          {itemL2 && (itemL2.biggestWin || itemL2.biggestFix) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                              {itemL2.biggestWin && (
                                <div style={{ background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.18)', borderRadius: 0, padding: '12px 16px' }}>
                                  <p style={{ fontSize: 10, fontWeight: 600, color: C.greenHi, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>Biggest win</p>
                                  <p style={{ fontSize: 14, color: C.text1, lineHeight: 1.65 }}>{itemL2.biggestWin}</p>
                                </div>
                              )}
                              {itemL2.biggestFix && (
                                <div style={{
                                  background: 'linear-gradient(160deg, rgba(201,160,48,0.07) 0%, rgba(201,160,48,0.025) 100%)',
                                  border: '1px solid rgba(201,160,48,0.22)',
                                  borderRadius: 0,
                                  padding: '12px 16px',
                                  boxShadow: 'none',
                                }}>
                                  <p style={{ fontSize: 10, fontWeight: 600, color: '#7a5b14', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>Biggest fix</p>
                                  <p style={{ fontSize: 14, color: C.text1, lineHeight: 1.65 }}>{itemL2.biggestFix}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {/* Right, Overview Channel-audit pattern: Summary → Technical breakdown → AI analysis → Win/Fix */}
                        <div>
                          {/* Summary card, ScoreRing + divider + verdict text */}
                          <div className="tiq-card" style={{ padding: '18px 20px', marginBottom: 10, background: C.cardFlat }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                              <div style={{ flexShrink: 0 }}>
                                <ScoreRing score={score} max={max} label={max === 100 ? 'Thumbnail IQ' : 'Technical'} size={88} strokeW={7}/>
                              </div>
                              <div style={{ width: 1, alignSelf: 'stretch', background: C.border, flexShrink: 0 }}/>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 10, fontWeight: 600, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>AI assessment</p>
                                <p style={{ fontSize: 13, fontWeight: 600, color: col, marginBottom: 4, letterSpacing: '-0.1px' }}>
                                  {scoreLabel(score, max)}{!itemL2 && <span style={{ fontSize: 11, fontWeight: 500, color: C.text3 }}> · technical only</span>}
                                </p>
                                {itemL2?.overallVerdict
                                  ? <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.65 }}>{itemL2.overallVerdict}</p>
                                  : <p style={{ fontSize: 12, color: C.text3 }}>{item.format} · {item.size_bracket}</p>
                                }
                              </div>
                            </div>
                          </div>

                          {/* Technical breakdown card */}
                          <div className="tiq-card" style={{ padding: '16px 20px', marginBottom: 10, background: C.cardFlat }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                              <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Technical breakdown</p>
                              <p style={{ fontSize: 11, color: C.text3, fontWeight: 500 }}>{item.algorithm_score ?? '—'}/60</p>
                            </div>
                            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 4 }}>
                              {Object.entries(L1_META).map(([k]) => (
                                <L1Row key={k} keyName={k} data={itemL1[k]} benchComp={item.benchmark_comparison || {}}/>
                              ))}
                            </div>
                          </div>

                          {/* AI analysis card (no marginBottom, last card in right column) */}
                          {itemL2 && (
                            <div className="tiq-card" style={{ padding: '16px 20px', background: C.cardFlat }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                                <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase' }}>AI analysis</p>
                                <p style={{ fontSize: 11, color: C.text3, fontWeight: 500 }}>{itemL2.claude_score ?? 0}/40</p>
                              </div>
                              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 4 }}>
                                {Object.entries(itemL2.scores || {}).map(([k, v]) => (
                                  <L2Row key={k} dimKey={k} dim={v}/>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── NEW TAB ───────────────────────────────────────────────────────── */}
      {activeTab === 'new' && (state === 'idle' || state === 'uploading') && (
        <div className="tiq-section">
          {state === 'uploading' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                          justifyContent: 'center', minHeight: 280, gap: 14 }}>
              <div style={{ width: 32, height: 32, border: `2.5px solid #e8e4dc`,
                            borderTop: `2.5px solid ${C.red}`, borderRadius: '50%',
                            animation: 'thumbSpin 0.7s linear infinite' }}/>
              <p style={{ color: C.text3, fontSize: 14 }}>Analyzing your thumbnail…</p>
            </div>
          ) : (
            <UploadPanel
              videoIdeas={videoIdeas}
              hasIdeas={hasIdeas}
              initialIdea={preFillIdea}
              initialTopic={initialTopic}
              topicSource={topicSource}
              onNavigate={onNavigate}
              onUpload={handleUpload}
            />
          )}
        </div>
      )}

      {/* ── NEW TAB: results ─────────────────────────────────────────────── */}
      {activeTab === 'new' && (state === 'ready1' || state === 'analyzing' || state === 'ready2') && l1 && (
        <div className="tiq-section">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 20 }}>

            {/* LEFT, thumbnail, AI-tag pill strip inline at the bottom of the card, then Win/Fix stacked below to fill the column */}
            <div>
              <div className="tiq-card" style={{ overflow: 'hidden' }}>
                {analysis.thumbnail_b64
                  ? <img src={`data:image/jpeg;base64,${analysis.thumbnail_b64}`} alt="Your thumbnail"
                         style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }}/>
                  : <div style={{ width: '100%', aspectRatio: '16/9', background: '#e8e4dc' }}/>
                }

                {/* AI-tag pill strip, Emotion / Feed / CTR as compact pills in the card footer */}
                {state === 'ready2' && l2 && (l2.emotionLabel || l2.feedPosition || l2.clickPrediction) && (
                  <div style={{ borderTop: `1px solid ${C.border}`, padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {l2.emotionLabel && (
                      <Badge text={l2.emotionLabel}
                        color={l2.emotionLabel.toLowerCase().includes('neutral') ? C.amber : C.green}
                        bg={l2.emotionLabel.toLowerCase().includes('neutral') ? C.amberBg : C.greenBg}
                        bdr={l2.emotionLabel.toLowerCase().includes('neutral') ? C.amberBdr : C.greenBdr}
                      />
                    )}
                    {l2.feedPosition && (
                      <Badge
                        text={l2.feedPosition === 'stands out' ? 'Stands Out' : l2.feedPosition === 'disappears' ? 'Disappears' : 'Blends In'}
                        color={l2.feedPosition === 'stands out' ? C.green : l2.feedPosition === 'disappears' ? C.red : C.amber}
                        bg={l2.feedPosition === 'stands out' ? C.greenBg : l2.feedPosition === 'disappears' ? C.redBg : C.amberBg}
                        bdr={l2.feedPosition === 'stands out' ? C.greenBdr : l2.feedPosition === 'disappears' ? C.redBdr : C.amberBdr}
                      />
                    )}
                    {l2.clickPrediction && (
                      <Badge
                        text={l2.clickPrediction === 'above niche average' ? 'Above Niche Avg' : l2.clickPrediction === 'below niche average' ? 'Below Niche Avg' : 'At Niche Avg'}
                        color={l2.clickPrediction === 'above niche average' ? C.green : l2.clickPrediction === 'below niche average' ? C.red : C.amber}
                        bg={l2.clickPrediction === 'above niche average' ? C.greenBg : l2.clickPrediction === 'below niche average' ? C.redBg : C.amberBg}
                        bdr={l2.clickPrediction === 'above niche average' ? C.greenBdr : l2.clickPrediction === 'below niche average' ? C.redBdr : C.amberBdr}
                      />
                    )}
                  </div>
                )}

                {/* Benchmark context, small muted strip at the very bottom of the card */}
                {keyword && (
                  <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}` }}>
                    <p style={{ fontSize: 12.5, color: C.text3, lineHeight: 1.55 }}>
                      Benchmarked against <strong style={{ color: C.text2 }}>top {fmt}</strong> videos
                      {' · '}<strong style={{ color: C.text2 }}>{bracket}</strong> channels
                      {' · '}<strong style={{ color: C.text2 }}>"{keyword}"</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Biggest Win / Fix stacked below the thumbnail, fills the left-column height */}
              {state === 'ready2' && l2 && (l2.biggestWin || l2.biggestFix) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                  {l2.biggestWin && (
                    <div style={{ background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.18)', borderRadius: 0, padding: '14px 18px' }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: C.greenHi, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Biggest win</p>
                      <p style={{ fontSize: 14, color: C.text1, lineHeight: 1.65 }}>{l2.biggestWin}</p>
                    </div>
                  )}
                  {l2.biggestFix && (
                    <div style={{
                      background: 'linear-gradient(160deg, rgba(201,160,48,0.07) 0%, rgba(201,160,48,0.025) 100%)',
                      border: '1px solid rgba(201,160,48,0.22)',
                      borderRadius: 0,
                      padding: '14px 18px',
                      boxShadow: 'none',
                    }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: '#7a5b14', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Biggest fix</p>
                      <p style={{ fontSize: 14, color: C.text1, lineHeight: 1.65 }}>{l2.biggestFix}</p>
                    </div>
                  )}
                </div>
              )}

              {/* New thumbnail, switch to idle */}
              <button
                onClick={() => { setAnalysis(null); setMarkedReady(false); setState('idle') }}
                style={{
                  marginTop: 12, background: 'none', cursor: 'pointer',
                  fontFamily: COND, textTransform: 'uppercase', letterSpacing: '0.06em',
                  border: `1px solid ${C.border}`, borderRadius: 0,
                  padding: '8px 16px', fontSize: 12, fontWeight: 600, color: C.text2,
                  transition: 'background 0.12s, border-color 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f4f4f7'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)' }}
              >
                Upload New Thumbnail
              </button>
            </div>

            {/* RIGHT, Overview Channel-audit pattern: Summary card → Score breakdown → AI analysis → Insights */}
            <div>
              {/* Linked idea context card */}
              <LinkedIdeaCard idea={linkedIdea} />

              {(() => {
                const currentScore = state === 'ready2' && l2 ? finalScore : algoScore
                const currentMax   = state === 'ready2' && l2 ? 100 : 60
                const currentCol   = scoreColor(currentScore, currentMax)
                const currentLabel = scoreLabel(currentScore, currentMax)
                const isFinal      = state === 'ready2' && !!l2
                return (
                  <>
                    {/* ── 1. Summary card, ScoreRing + vertical divider + AI-assessment text ── */}
                    <div className="tiq-card" style={{ padding: '26px 28px', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                        <div style={{ flexShrink: 0 }}>
                          <ScoreRing score={currentScore} max={currentMax} label={isFinal ? 'Thumbnail IQ' : 'Technical'} size={120} strokeW={8}/>
                        </div>
                        <div style={{ width: 1, alignSelf: 'stretch', background: C.border, flexShrink: 0 }}/>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>AI assessment</p>
                          <p style={{ fontSize: 14, fontWeight: 600, color: currentCol, marginBottom: 8, letterSpacing: '-0.15px' }}>
                            {currentLabel}{!isFinal && <span style={{ fontSize: 12, fontWeight: 500, color: C.text3 }}> · technical only</span>}
                          </p>
                          {isFinal && l2.overallVerdict && (
                            <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.7 }}>{l2.overallVerdict}</p>
                          )}
                          {!isFinal && (
                            <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.7 }}>
                              Technical scan complete. Run the full AI analysis below to add emotion, composition, and feed-distinctiveness scoring.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Benchmark stats strip, 3 small tiles below the main row */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 20, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
                        {[
                          { label: 'Your score',    value: `${currentScore}/${currentMax}` },
                          { label: 'Niche average', value: analysis.niche_avg_score ? `${Math.round(analysis.niche_avg_score)}/60` : '—' },
                          { label: 'You beat',      value: analysis.user_percentile != null ? fmtPct(analysis.user_percentile) : '—', sub: 'of similar channels' },
                        ].map(s => (
                          <div key={s.label}>
                            <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</p>
                            <p style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 500, color: C.text1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', lineHeight: 1 }}>{s.value}</p>
                            {s.sub && <p style={{ fontSize: 11, color: C.text3, marginTop: 4, fontWeight: 500 }}>{s.sub}</p>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── 2. Score breakdown, Overview Category-scores pattern (Dashboard.jsx:2101-2133) ── */}
                    <div className="tiq-card" style={{ padding: '22px 28px', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Technical breakdown</p>
                        <p style={{ fontSize: 11, color: C.text3, fontWeight: 500 }}>{algoScore}/60 · click a row for detail</p>
                      </div>
                      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 4 }}>
                        {Object.entries(L1_META).map(([k]) => (
                          <L1Row key={k} keyName={k} data={l1[k]} benchComp={bcomp}/>
                        ))}
                      </div>
                    </div>

                    {/* ── 3. AI Analysis, same Category-scores pattern, separate card for its own identity ── */}
                    {isFinal && l2 && (
                      <div className="tiq-card" style={{ padding: '22px 28px', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
                          <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase' }}>AI analysis</p>
                          <p style={{ fontSize: 11, color: C.text3, fontWeight: 500 }}>{l2.claude_score ?? 0}/40 · click a row for detail</p>
                        </div>
                        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 4 }}>
                          {Object.entries(l2.scores || {}).map(([k, v]) => (
                            <L2Row key={k} dimKey={k} dim={v}/>
                          ))}
                        </div>
                      </div>
                    )}

                  </>
                )
              })()}

              {/* CTA: Run Full Thumbnail IQ, same pill CTA as Overview / Videos / Outliers */}
              {state === 'ready1' && (
                <div style={{ marginTop: 4 }}>
                  <button
                    onClick={handleAnalyze}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: C.red, color: 'var(--yd-on-gold)',
                      border: 'none', borderRadius: 0, fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: COND, textTransform: 'uppercase', letterSpacing: '0.06em',
                      transition: 'filter 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                  >
                    Run Full Thumbnail IQ · 1 credit
                  </button>
                </div>
              )}

              {/* Analyzing spinner */}
              {state === 'analyzing' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                              gap: 12, padding: '20px 0' }}>
                  <div style={{ width: 20, height: 20, border: `2.5px solid #e8e4dc`,
                                borderTop: `2.5px solid ${C.red}`, borderRadius: '50%',
                                animation: 'thumbSpin 0.7s linear infinite' }}/>
                  <p style={{ color: C.text3, fontSize: 14 }}>Running Thumbnail IQ…</p>
                </div>
              )}

              {/* Mark as Thumbnail Ready (Layer 2 + linked idea) */}
              {state === 'ready2' && linkedIdea && (
                <div style={{ marginTop: 12 }}>
                  {markedReady ? (
                    <div style={{
                      background: C.greenBg, border: `1px solid ${C.greenBdr}`,
                      borderRadius: 0, padding: '12px 16px', textAlign: 'center',
                    }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: C.greenHi }}>
                        ✓ Idea marked as Thumbnail Ready · {finalScore}/100
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleMarkReady}
                      disabled={markingReady}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: markingReady ? '#e0e0e6' : C.green,
                        color: '#fff', border: 'none', borderRadius: 0,
                        fontSize: 13, fontWeight: 600,
                        cursor: markingReady ? 'not-allowed' : 'pointer',
                        fontFamily: COND, textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'filter 0.15s',
                      }}
                      onMouseEnter={e => { if (!markingReady) e.currentTarget.style.filter = 'brightness(1.08)' }}
                      onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
                    >
                      {markingReady ? 'Saving…' : 'Mark idea as Thumbnail Ready →'}
                    </button>
                  )}
                </div>
              )}

              {/* Shareable card (Layer 2 only) */}
              {state === 'ready2' && l2 && (
                <div style={{ marginTop: 8 }}>
                  <div id="tiq-share-card" style={{
                    background: 'linear-gradient(135deg, var(--yd-paper) 0%, var(--yd-surface) 100%)',
                    borderRadius: 0, padding: '24px', display: 'flex', gap: 16, alignItems: 'flex-start',
                  }}>
                    {analysis.thumbnail_b64 && (
                      <img src={`data:image/jpeg;base64,${analysis.thumbnail_b64}`} alt=""
                           style={{ width: 80, height: 45, borderRadius: 0, objectFit: 'cover', flexShrink: 0 }}/>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(20,19,15,0.5)',
                                       letterSpacing: '0.12em', textTransform: 'uppercase' }}>YTGrowth</span>
                        <span style={{ fontSize: 12, color: 'rgba(20,19,15,0.2)' }}>·</span>
                        <span style={{ fontSize: 12, color: 'rgba(20,19,15,0.4)' }}>Thumbnail IQ</span>
                      </div>
                      <p style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 500, color: C.text1, marginBottom: 8,
                                  fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                        {finalScore}<span style={{ fontSize: 16, fontWeight: 500, color: 'rgba(20,19,15,0.4)' }}>/100</span>
                      </p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {l2.emotionLabel && (
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(20,19,15,0.7)',
                                         background: 'rgba(20,19,15,0.1)', borderRadius: 0, padding: '3px 8px' }}>
                            {l2.emotionLabel}
                          </span>
                        )}
                        {l2.feedPosition && (
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(20,19,15,0.7)',
                                         background: 'rgba(20,19,15,0.1)', borderRadius: 0, padding: '3px 8px' }}>
                            {l2.feedPosition}
                          </span>
                        )}
                        {keyword && (
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(20,19,15,0.5)',
                                         background: 'rgba(20,19,15,0.07)', borderRadius: 0, padding: '3px 8px' }}>
                            &quot;{keyword}&quot;
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyCard}
                    style={{ marginTop: 8, width: '100%', background: C.cardFlat, border: `1px solid ${C.border}`,
                             borderRadius: 0, padding: '11px', fontSize: 12, fontWeight: 600,
                             color: C.text2, cursor: 'pointer', fontFamily: COND, textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#e8e4dc' }}
                    onMouseLeave={e => { e.currentTarget.style.background = C.cardFlat }}
                  >
                    Copy Result Card
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

     </div>{/* /1040 column */}

      {gated ? (
        <UpsellModal
          open={creditsOut}
          onClose={() => setCreditsOut(false)}
          title="You've used your free Thumbnail Score"
          description="Free accounts can score one thumbnail per monthly cycle. Upgrade to keep scoring every thumbnail you upload, against the exact videos winning in your niche."
          bullets={[
            'Score unlimited thumbnails against your niche benchmark',
            'Layer 2 AI critique, why it works and what to change',
            "Full history across every thumbnail you've scored",
          ]}
          showPackLink={false}
        />
      ) : (
        <CreditsEmptyModal
          open={creditsOut}
          onClose={() => setCreditsOut(false)}
          featureName="thumbnail analyses"
        />
      )}
    </div>
  )
}
