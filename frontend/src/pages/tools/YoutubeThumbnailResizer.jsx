import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free SEO tool: YouTube Thumbnail Resizer ─────────────────────────────
   /tools/youtube-thumbnail-resizer.

   Targets "youtube thumbnail resizer" (~30K monthly searches), "resize
   thumbnail for youtube", "1280x720 thumbnail resizer".

   Scope:
   - 3 quality presets: HD (1280x720), Full HD (1920x1080), 4K (3840x2160).
     All 16:9. Center-crops a non-16:9 source.
   - JPG (default) or PNG output. JPG quality slider for fine control.
   - For HD preset, auto steps quality down until the file fits YouTube's
     2 MB upload cap. Other presets are uncapped (free for archival,
     web-hosting, OBS overlays, etc.).
   - Drop / click / paste support. Image stays in the browser — pure
     HTML5 Canvas, no upload, no server.
*/

const PRESETS = [
  { id: 'hd',     label: 'HD',         sub: '1280×720',   w: 1280, h: 720,  badge: '720p',  recommended: true,  cap: 2 * 1024 * 1024,
    note: 'YouTube\'s recommended thumbnail size. Auto-fits under the 2 MB upload cap.' },
  { id: 'fullhd', label: 'Full HD',    sub: '1920×1080',  w: 1920, h: 1080, badge: '1080p', cap: null,
    note: 'Higher detail for blog use, channel banner crops, or social previews.' },
  { id: '4k',     label: '4K Ultra HD',sub: '3840×2160',  w: 3840, h: 2160, badge: '2160p', cap: null,
    note: 'Future-proof archival quality. Best for source files you re-export from later.' },
]

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
    if (document.getElementById('ytr-styles')) return
    const link = document.createElement('link')
    link.id = 'ytr-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytr-styles'
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
      ::-webkit-scrollbar { width: 12px; height: 12px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background-color: rgba(10,10,15,0.28); border-radius: 10px; border: 3px solid transparent; background-clip: content-box; }
      ::-webkit-scrollbar-thumb:hover { background-color: rgba(10,10,15,0.48); background-clip: content-box; }
      @keyframes ytrFadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .ytr-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
        padding: 14px 28px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px; white-space: nowrap;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .ytr-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,48,42,0.42); }
      .ytr-btn-lg { font-size: 16px; padding: 17px 36px; }
      .ytr-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; filter: none !important; }

      .ytr-btn-ghost {
        display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        background: transparent; color: var(--ytg-text-2);
        font-size: 13px; font-weight: 600; font-family: 'Inter', system-ui, sans-serif;
        padding: 9px 16px; border-radius: 100px;
        border: 1px solid var(--ytg-border);
        cursor: pointer; text-decoration: none; letter-spacing: -0.1px;
        transition: color 0.15s, border-color 0.15s, background 0.15s;
      }
      .ytr-btn-ghost:hover { color: var(--ytg-text); border-color: var(--ytg-text-3); background: rgba(10,10,15,0.02); }

      .ytr-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        background: #ffffff; border: 1px solid rgba(10,10,15,0.09);
        border-radius: 100px; padding: 5px 12px 5px 10px; margin-bottom: 22px;
        box-shadow: 0 1px 2px rgba(10,10,15,0.04);
      }
      .ytr-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ytg-accent); box-shadow: 0 0 0 3px rgba(229,48,42,0.12); }
      .ytr-eyebrow-text { font-size: 11px; font-weight: 700; color: var(--ytg-text-2); text-transform: uppercase; letter-spacing: 0.09em; }

      .ytr-h1 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -2px; line-height: 1.05; text-wrap: balance; }
      .ytr-h2 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -1.4px; line-height: 1.08; text-wrap: balance; }

      /* Drop zone */
      .ytr-drop {
        border: 2px dashed var(--ytg-border);
        background: var(--ytg-card);
        border-radius: 18px;
        padding: 56px 32px;
        text-align: center;
        transition: border-color 0.18s, background 0.18s;
        cursor: pointer;
        position: relative;
      }
      .ytr-drop.drag {
        border-color: var(--ytg-accent);
        background: var(--ytg-accent-light);
      }
      .ytr-drop:hover { border-color: var(--ytg-text-3); }

      /* Preset selector */
      .ytr-presets {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
        margin-bottom: 18px;
      }
      .ytr-preset {
        position: relative;
        cursor: pointer;
        background: var(--ytg-card);
        border: 1.5px solid var(--ytg-border);
        border-radius: 12px;
        padding: 14px 14px 13px;
        text-align: left;
        transition: border-color 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .ytr-preset:hover { border-color: var(--ytg-text-3); transform: translateY(-1px); }
      .ytr-preset.active {
        border-color: var(--ytg-accent);
        background: linear-gradient(0deg, rgba(229,48,42,0.04), rgba(229,48,42,0.04)), var(--ytg-card);
        box-shadow: 0 0 0 3px rgba(229,48,42,0.10);
      }
      .ytr-preset-label { font-size: 14px; font-weight: 800; color: var(--ytg-text); letter-spacing: -0.2px; }
      .ytr-preset-sub   { font-size: 12px; color: var(--ytg-text-2); margin-top: 2px; font-variant-numeric: tabular-nums; }
      .ytr-preset-badge {
        position: absolute; top: 10px; right: 10px;
        font-size: 10px; font-weight: 800; letter-spacing: 0.04em;
        color: var(--ytg-text-3);
        background: var(--ytg-bg-2);
        border-radius: 6px;
        padding: 2px 6px;
      }
      .ytr-preset.active .ytr-preset-badge { color: var(--ytg-accent-text); background: var(--ytg-accent-light); }
      .ytr-preset-rec {
        position: absolute; top: -8px; left: 14px;
        font-size: 9.5px; font-weight: 800; letter-spacing: 0.08em;
        color: #fff;
        background: var(--ytg-accent);
        border-radius: 6px;
        padding: 2px 7px;
        text-transform: uppercase;
      }

      /* Quality slider */
      .ytr-quality {
        display: flex; align-items: center; gap: 14px;
        margin-top: 10px;
        padding: 12px 14px;
        background: var(--ytg-bg-2);
        border-radius: 10px;
      }
      .ytr-quality-label { font-size: 12px; font-weight: 700; color: var(--ytg-text-2); letter-spacing: -0.05px; min-width: 72px; }
      .ytr-quality input[type="range"] {
        flex: 1; height: 4px; appearance: none; background: rgba(10,10,15,0.12); border-radius: 4px; outline: none;
      }
      .ytr-quality input[type="range"]::-webkit-slider-thumb {
        appearance: none; width: 16px; height: 16px; border-radius: 50%;
        background: var(--ytg-accent); cursor: pointer;
        box-shadow: 0 1px 3px rgba(0,0,0,0.20);
      }
      .ytr-quality input[type="range"]::-moz-range-thumb {
        width: 16px; height: 16px; border-radius: 50%; border: 0;
        background: var(--ytg-accent); cursor: pointer;
        box-shadow: 0 1px 3px rgba(0,0,0,0.20);
      }
      .ytr-quality-value { font-size: 12.5px; font-weight: 700; color: var(--ytg-text); min-width: 40px; text-align: right; font-variant-numeric: tabular-nums; }

      /* Result card */
      .ytr-result-card {
        background: var(--ytg-card);
        border: 1px solid var(--ytg-border);
        border-radius: 18px;
        box-shadow: var(--ytg-shadow-lg);
        overflow: hidden;
      }
      .ytr-result-canvas-wrap {
        width: 100%;
        aspect-ratio: 16/9;
        background: #0a0a0f;
        display: flex; align-items: center; justify-content: center;
      }
      .ytr-result-canvas-wrap canvas { width: 100%; height: 100%; object-fit: contain; }

      /* Format toggle */
      .ytr-format-toggle {
        display: inline-flex;
        background: var(--ytg-bg-2);
        border-radius: 100px;
        padding: 3px;
      }
      .ytr-format-toggle button {
        appearance: none; background: transparent; border: 0; cursor: pointer;
        font-family: 'Inter', sans-serif;
        font-size: 12px; font-weight: 700;
        color: var(--ytg-text-2);
        padding: 6px 14px; border-radius: 100px;
        transition: background 0.15s, color 0.15s;
      }
      .ytr-format-toggle button.active {
        background: #ffffff; color: var(--ytg-text);
        box-shadow: 0 1px 2px rgba(10,10,15,0.10);
      }

      .ytr-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
      .ytr-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 18px; }

      .ytr-faq-answer {
        display: grid; grid-template-rows: 0fr; opacity: 0;
        transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
      }
      .ytr-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .ytr-faq-answer-inner { overflow: hidden; }

      @media (max-width: 900px) {
        .ytr-grid-3 { grid-template-columns: 1fr; }
        .ytr-grid-4 { grid-template-columns: 1fr 1fr; }
      }
      @media (max-width: 640px) {
        .ytr-grid-4 { grid-template-columns: 1fr; }
        .ytr-presets { grid-template-columns: 1fr; }
      }
      @media (max-width: 768px) {
        .ytr-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .ytr-drop { padding: 40px 20px; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

/* ── Resize core. HTML5 Canvas. Browser-only. ─────────────────────────── */

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/* Center-crop to 16:9 then scale to the target W×H. */
function drawCenterCropped(img, canvas, targetW, targetH) {
  const ctx = canvas.getContext('2d')
  canvas.width = targetW
  canvas.height = targetH

  const srcRatio = img.width / img.height
  const tgtRatio = targetW / targetH

  let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height
  if (srcRatio > tgtRatio) {
    sWidth = img.height * tgtRatio
    sx = (img.width - sWidth) / 2
  } else if (srcRatio < tgtRatio) {
    sHeight = img.width / tgtRatio
    sy = (img.height - sHeight) / 2
  }

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, targetW, targetH)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH)
}

/* Encode at chosen format/quality. If the preset has a byte cap and the
   blob exceeds it, step quality down progressively (JPG only). */
function encodeWithCap(canvas, format, quality, cap) {
  return new Promise((resolve) => {
    const mime = format === 'png' ? 'image/png' : 'image/jpeg'
    if (mime === 'image/png') {
      canvas.toBlob(b => resolve({ blob: b, quality: 1 }), mime)
      return
    }
    const tryQuality = (q) => {
      canvas.toBlob(b => {
        if (!b) { resolve({ blob: null, quality: q }); return }
        if (!cap || b.size <= cap || q <= 0.4) {
          resolve({ blob: b, quality: q })
        } else {
          tryQuality(Math.max(0.4, q - 0.06))
        }
      }, mime, q)
    }
    tryQuality(quality)
  })
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}

/* ── FAQ ──────────────────────────────────────────────────────────────── */

const FAQS = [
  {
    q: 'Why are there three resolution presets if YouTube only accepts 1280×720?',
    a: <>YouTube's official upload spec is 1280×720, but creators often need higher-resolution exports for other use cases. Full HD (1920×1080) is what most embed players and blog features want. 4K (3840×2160) is for archival masters you'll re-export from in a year when YouTube inevitably bumps the spec or you need a bigger crop. The HD preset is what you upload to YouTube. The other two cover everything else.</>,
  },
  {
    q: 'What does the 2 MB cap actually do?',
    a: <>YouTube silently rejects thumbnail uploads larger than 2 MB. Many tools quietly skip this check and you find out only when the upload fails. On the HD preset, this tool starts JPG quality at 92% and steps it down automatically until the file fits under 2 MB. You can override the auto-quality with the slider if you want to try a different point on the size/quality curve. Full HD and 4K presets don't enforce the cap because they're not for direct YouTube upload.</>,
  },
  {
    q: 'Is my image actually private?',
    a: <>Yes — verifiably. The entire resize runs in your browser via HTML5 Canvas. The image never touches our server, never gets logged, never gets stored anywhere. Open the Network tab in your browser's DevTools while you use the tool: you'll see zero outbound requests with image data. Drop in a private screenshot, a draft thumbnail, an internal mockup, anything. It stays on your device.</>,
  },
  {
    q: 'What happens if my source image isn\'t 16:9?',
    a: <>The tool center-crops to 16:9 before scaling. So a 1080×1080 Instagram square keeps its center subject and trims the sides. A 9:16 phone screenshot keeps the middle horizontal slice. If you need pixel-precise placement (like a face exactly in the right third of the frame), design your source at the target resolution in Canva, Figma, or Photoshop before uploading.</>,
  },
  {
    q: 'JPG or PNG. Which should I pick?',
    a: <>JPG for photographic content (real-world imagery, faces, product shots, gradients). 5–10× smaller than PNG and the quality loss is invisible at thumbnail sizes. PNG for graphic-heavy content (text overlays, illustrations, hard edges, transparency, screenshots of UIs). Lossless but bigger. The default is JPG because 95% of YouTube thumbnails benefit from it. The toggle is right next to the preset selector — no need to re-upload to switch.</>,
  },
  {
    q: 'Can I upscale a small source image to 4K?',
    a: <>You can, but the output won't actually be sharper than the source. The tool scales the pixels up using high-quality bilinear interpolation, but no algorithm can invent detail that wasn't there. If you upload a 640×360 thumbnail and pick the 4K preset, you'll get a 3840×2160 file that looks like a stretched 360p image. For genuinely higher detail, use a higher-resolution source.</>,
  },
  {
    q: 'Will the resized thumbnail rank better than my original?',
    a: <>The resize itself is a technical fix, not a CTR boost. What ranks thumbnails is composition, contrast, and the curiosity gap they create with the title. Once you have a properly sized thumbnail, the next move is scoring it against the top videos in your niche. <a href="/features/thumbnail-iq" style={{ color: 'var(--ytg-accent)', fontWeight: 600 }}>Thumbnail IQ</a> runs face detection, contrast analysis, and a vision-model curiosity-gap read so you know whether your design is competitive before you publish.</>,
  },
  {
    q: 'Does this tool work offline?',
    a: <>Once the page is loaded, yes. Drop an image, switch presets, change quality, download — no network request happens after the initial page load. You can disconnect from the internet entirely and the tool keeps working.</>,
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--ytg-border)' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', padding: '22px 0', fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, fontSize: 16.5, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.2px', lineHeight: 1.45 }}>
        <span style={{ flex: 1 }}>{q}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" style={{ transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, color: open ? 'var(--ytg-accent)' : 'var(--ytg-text-3)', marginTop: 4 }}>
          <path d="M8 2v12M2 8h12"/>
        </svg>
      </button>
      <div className={`ytr-faq-answer${open ? ' open' : ''}`}>
        <div className="ytr-faq-answer-inner">
          <div style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.78, padding: '0 0 22px 0', maxWidth: 760 }}>{a}</div>
        </div>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function YoutubeThumbnailResizer() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()
  const [drag, setDrag] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [presetId, setPresetId] = useState('hd')
  const [format, setFormat] = useState('jpg')
  const [quality, setQuality] = useState(0.92)  // user override
  const [autoQuality, setAutoQuality] = useState(true)  // when true, slider is hidden / auto
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const lastImgRef = useRef(null)
  const lastFileRef = useRef(null)

  const preset = useMemo(() => PRESETS.find(p => p.id === presetId) || PRESETS[0], [presetId])

  useEffect(() => {
    document.title = 'YouTube Thumbnail Resizer 2026: Free Image & Size Converter | YTGrowth'
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = 'Free YouTube thumbnail resizer and size converter. Resize any image or photo to HD (1280x720), Full HD, or 4K. Auto-fits under YouTube\'s 2MB cap, runs in your browser.'
  }, [])

  const renderResult = useCallback(async (img, file, p, fmt, q, auto) => {
    setWorking(true)
    setError('')
    try {
      const canvas = canvasRef.current || document.createElement('canvas')
      drawCenterCropped(img, canvas, p.w, p.h)
      const cap = auto ? p.cap : null  // when slider override is on, no auto step-down
      const startQ = auto ? 0.92 : q
      const { blob, quality: usedQ } = await encodeWithCap(canvas, fmt, startQ, cap)
      if (!blob) throw new Error('Could not encode the image. Try a different file.')
      const url = URL.createObjectURL(blob)
      setResult({
        url, blob, format: fmt, quality: usedQ,
        sourceName: file?.name || 'image', sourceSize: file?.size || 0,
        originalDims: { w: img.width, h: img.height },
        preset: p,
      })
    } catch (e) {
      setError(e.message || 'Something went wrong while resizing.')
    } finally {
      setWorking(false)
    }
  }, [])

  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('That doesn\'t look like an image. Try a JPG, PNG, GIF, or WebP.')
      return
    }
    if (file.size > 80 * 1024 * 1024) {
      setError('File is over 80 MB. Pick a smaller source.')
      return
    }
    setError('')
    try {
      const img = await loadImageFromFile(file)
      lastImgRef.current = img
      lastFileRef.current = file
      await renderResult(img, file, preset, format, quality, autoQuality)
    } catch (e) {
      setError('Could not read that image. Try a different file.')
    }
  }

  /* Re-render whenever preset, format, quality, or auto toggle change. */
  useEffect(() => {
    if (lastImgRef.current) {
      renderResult(lastImgRef.current, lastFileRef.current, preset, format, quality, autoQuality)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetId, format, quality, autoQuality])

  const onDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }
  const onDragOver = (e) => { e.preventDefault(); setDrag(true) }
  const onDragLeave = () => setDrag(false)

  const onPaste = useCallback((e) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const it of items) {
      if (it.type.startsWith('image/')) {
        const file = it.getAsFile()
        if (file) handleFile(file)
        break
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [onPaste])

  const onDownload = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.url
    const base = (result.sourceName || 'thumbnail').replace(/\.[^.]+$/, '')
    a.download = `${base}-${result.preset.w}x${result.preset.h}.${result.format === 'png' ? 'png' : 'jpg'}`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  const reset = () => {
    if (result?.url) URL.revokeObjectURL(result.url)
    setResult(null); setError('')
    lastImgRef.current = null; lastFileRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /* Warn when output preset is bigger than source. */
  const upscaleWarning = useMemo(() => {
    if (!result) return null
    const { originalDims, preset: p } = result
    if (originalDims.w < p.w || originalDims.h < p.h) {
      return `Your source is ${originalDims.w}×${originalDims.h}. Scaling up to ${p.w}×${p.h} stretches pixels — the output won't be sharper than the source.`
    }
    return null
  }, [result])

  return (
    <div style={{ background: 'var(--ytg-bg)', minHeight: '100vh' }}>

      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* HERO */}
      <section className="ytr-section-pad" style={{ padding: isMobile ? '56px 24px 32px' : '88px 48px 48px', textAlign: 'center', background: '#ffffff' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', animation: 'ytrFadeUp 0.5s ease both' }}>
          <span className="ytr-eyebrow">
            <span className="ytr-eyebrow-dot" />
            <span className="ytr-eyebrow-text">Free · Browser-based · Private</span>
          </span>
          <h1 className="ytr-h1" style={{ fontSize: isMobile ? 36 : 56, color: 'var(--ytg-text)', marginBottom: 18 }}>
            YouTube thumbnail resizer. <span style={{ color: 'var(--ytg-accent)' }}>HD, Full HD, 4K.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18.5, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 12px' }}>
            Drop any image, pick a quality, and get a perfectly sized thumbnail. The HD preset auto-compresses under YouTube's 2 MB upload cap. Full HD and 4K give you higher-detail exports for blog use, channel banners, and archival.
          </p>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', maxWidth: 720, margin: '0 auto' }}>
            Runs entirely in your browser using HTML5 Canvas. Your image never leaves your device. <a href="#privacy" style={{ color: 'var(--ytg-text-2)', textDecoration: 'underline' }}>How we know.</a>
          </p>
        </div>
      </section>

      {/* TOOL */}
      <section className="ytr-section-pad" style={{ padding: isMobile ? '0 20px 64px' : '0 48px 88px', background: '#ffffff' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          {/* Preset selector */}
          <div className="ytr-presets">
            {PRESETS.map(p => (
              <button key={p.id}
                onClick={() => setPresetId(p.id)}
                className={`ytr-preset${presetId === p.id ? ' active' : ''}`}
                aria-pressed={presetId === p.id}
              >
                {p.recommended && <span className="ytr-preset-rec">Recommended</span>}
                <div className="ytr-preset-label">{p.label}</div>
                <div className="ytr-preset-sub">{p.sub}</div>
                <span className="ytr-preset-badge">{p.badge}</span>
              </button>
            ))}
          </div>

          {/* Quality controls — only meaningful for JPG */}
          {format === 'jpg' && (
            <div className="ytr-quality">
              <span className="ytr-quality-label">JPG quality</span>
              <input
                type="range" min="40" max="100" step="1"
                value={Math.round(quality * 100)}
                onChange={(e) => { setAutoQuality(false); setQuality(parseInt(e.target.value, 10) / 100) }}
              />
              <span className="ytr-quality-value">{Math.round(quality * 100)}%</span>
              <button
                onClick={() => { setAutoQuality(true); setQuality(0.92) }}
                className="ytr-btn-ghost"
                style={{ padding: '6px 12px', fontSize: 11, marginLeft: 6 }}
                title={preset.cap ? 'Auto-step down to fit under 2 MB' : 'Reset to 92%'}
              >
                {autoQuality ? 'Auto' : 'Reset'}
              </button>
            </div>
          )}

          {/* Drop zone or result */}
          <div style={{ marginTop: 18 }}>
            {!result && (
              <div
                className={`ytr-drop${drag ? ' drag' : ''}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <div style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: 16, background: 'var(--ytg-accent-light)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e5302a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--ytg-text)', marginBottom: 6 }}>
                  Drop an image, click to choose, or paste from clipboard
                </p>
                <p style={{ fontSize: 13.5, color: 'var(--ytg-text-3)' }}>
                  JPG, PNG, GIF, WebP, BMP · up to 80 MB · output: <strong style={{ color: 'var(--ytg-text-2)' }}>{preset.label} ({preset.sub})</strong>
                </p>
              </div>
            )}

            {error && (
              <div style={{ marginTop: 14, padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#991b1b', fontSize: 14, fontWeight: 500 }}>
                {error}
              </div>
            )}

            {result && (
              <div style={{ animation: 'ytrFadeUp 0.4s ease both' }}>
                <div className="ytr-result-card">
                  <div className="ytr-result-canvas-wrap">
                    <canvas ref={canvasRef} />
                  </div>
                  <div style={{ padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ minWidth: 0, textAlign: 'left' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ytg-text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 360 }}>{result.sourceName}</p>
                      <p style={{ fontSize: 12.5, color: 'var(--ytg-text-3)' }}>
                        {result.originalDims.w}×{result.originalDims.h} ({formatBytes(result.sourceSize)}) → <strong style={{ color: 'var(--ytg-text-2)' }}>{result.preset.w}×{result.preset.h} ({formatBytes(result.blob.size)})</strong>
                        {result.format === 'jpg' && (<span> · q{Math.round(result.quality * 100)}</span>)}
                      </p>
                    </div>
                    <div className="ytr-format-toggle">
                      <button onClick={() => setFormat('jpg')} className={format === 'jpg' ? 'active' : ''}>JPG</button>
                      <button onClick={() => setFormat('png')} className={format === 'png' ? 'active' : ''}>PNG</button>
                    </div>
                  </div>
                </div>

                {upscaleWarning && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, color: '#854d0e', fontSize: 13, fontWeight: 500 }}>
                    ⚠ {upscaleWarning}
                  </div>
                )}

                {result.preset.cap && result.blob.size > result.preset.cap && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, color: '#854d0e', fontSize: 13, fontWeight: 500 }}>
                    ⚠ {formatBytes(result.blob.size)} is above YouTube's 2 MB cap. Switch to JPG, lower the quality slider, or pick a smaller preset.
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 22 }}>
                  <button onClick={onDownload} className="ytr-btn ytr-btn-lg" disabled={working || !result.blob}>
                    Download {result.preset.label} {result.format === 'png' ? 'PNG' : 'JPG'} →
                  </button>
                  <button onClick={reset} className="ytr-btn-ghost" style={{ padding: '14px 22px' }}>
                    Resize another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* QUALITY PRESETS — explained */}
      <section className="ytr-section-pad" style={{ padding: isMobile ? '64px 20px' : '96px 48px', background: 'var(--ytg-bg)', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
            <span className="ytr-eyebrow">
              <span className="ytr-eyebrow-dot" />
              <span className="ytr-eyebrow-text">Three presets, one tool</span>
            </span>
            <h2 className="ytr-h2" style={{ fontSize: isMobile ? 30 : 42, marginBottom: 14, color: 'var(--ytg-text)' }}>
              Pick the resolution your <span style={{ color: 'var(--ytg-accent)' }}>workflow needs.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>
              YouTube's upload spec is 1280×720, but a thumbnail rarely lives in just one place. Embed players, blog hero images, channel banner crops, social previews — every destination wants something a little different. Three presets cover all of them.
            </p>
          </div>
          <div className="ytr-grid-3">
            {PRESETS.map((p, i) => (
              <div key={i} style={{ position: 'relative', background: 'var(--ytg-card)', borderRadius: 18, border: `1px solid ${p.recommended ? 'rgba(229,48,42,0.20)' : 'var(--ytg-border)'}`, boxShadow: p.recommended ? '0 0 0 1px rgba(229,48,42,0.10), var(--ytg-shadow-sm)' : 'var(--ytg-shadow-sm)', padding: 28 }}>
                {p.recommended && (
                  <span style={{ position: 'absolute', top: -10, left: 28, fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: '#fff', background: 'var(--ytg-accent)', borderRadius: 6, padding: '3px 9px', textTransform: 'uppercase' }}>For YouTube</span>
                )}
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.4px' }}>{p.label}</p>
                  <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--ytg-text-3)', letterSpacing: '0.08em', fontFamily: 'monospace' }}>{p.badge.toUpperCase()}</p>
                </div>
                <p style={{ fontSize: 28, fontWeight: 800, fontFamily: 'DM Sans, sans-serif', color: 'var(--ytg-text)', letterSpacing: '-1px', marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>
                  {p.w}<span style={{ color: 'var(--ytg-text-3)' }}>×</span>{p.h}
                </p>
                <p style={{ fontSize: 13, color: 'var(--ytg-text-2)', lineHeight: 1.7, marginBottom: 14 }}>{p.note}</p>
                <div style={{ paddingTop: 14, borderTop: '1px solid var(--ytg-border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ytg-text-3)' }}>
                  {p.cap ? (
                    <><span style={{ color: 'var(--ytg-accent-text)', fontWeight: 700 }}>≤ 2 MB</span> · auto-compressed for upload</>
                  ) : (
                    <>No file-size cap · use as a master export</>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECS COMPARISON */}
      <section className="ytr-section-pad" style={{ padding: isMobile ? '64px 20px' : '96px 48px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 40px' }}>
            <span className="ytr-eyebrow">
              <span className="ytr-eyebrow-dot" />
              <span className="ytr-eyebrow-text">YouTube spec</span>
            </span>
            <h2 className="ytr-h2" style={{ fontSize: isMobile ? 28 : 38, color: 'var(--ytg-text)' }}>
              The numbers that <span style={{ color: 'var(--ytg-accent)' }}>actually matter</span> on upload.
            </h2>
          </div>
          <div style={{ background: 'var(--ytg-card)', borderRadius: 18, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--ytg-bg)' }}>
                <tr>
                  <th style={{ padding: '14px 22px', textAlign: 'left', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ytg-text-3)' }}>Field</th>
                  <th style={{ padding: '14px 22px', textAlign: 'left', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ytg-text-3)' }}>YouTube requires</th>
                  <th style={{ padding: '14px 22px', textAlign: 'left', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ytg-text-3)' }}>This tool ships</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: 'Resolution',  y: '1280×720 recommended (640×360 minimum)', t: '1280×720 exact (HD preset)' },
                  { f: 'Aspect ratio',y: '16:9', t: '16:9 (auto-cropped from any source)' },
                  { f: 'File size',   y: 'Under 2 MB',                  t: 'Auto-fits under 2 MB on HD preset' },
                  { f: 'Format',      y: 'JPG, PNG, GIF, BMP',          t: 'JPG (default) or PNG' },
                  { f: 'Color space', y: 'sRGB',                        t: 'sRGB (default browser canvas)' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--ytg-border)' }}>
                    <td style={{ padding: '16px 22px', fontSize: 14, fontWeight: 700, color: 'var(--ytg-text)' }}>{row.f}</td>
                    <td style={{ padding: '16px 22px', fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.55 }}>{row.y}</td>
                    <td style={{ padding: '16px 22px', fontSize: 14, color: 'var(--ytg-accent-text)', fontWeight: 600, lineHeight: 1.55 }}>{row.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PRIVACY / WHY US */}
      <section id="privacy" className="ytr-section-pad" style={{ padding: isMobile ? '64px 20px' : '96px 48px', background: 'var(--ytg-bg)', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
            <span className="ytr-eyebrow">
              <span className="ytr-eyebrow-dot" />
              <span className="ytr-eyebrow-text">Why this tool exists</span>
            </span>
            <h2 className="ytr-h2" style={{ fontSize: isMobile ? 30 : 42, marginBottom: 14, color: 'var(--ytg-text)' }}>
              Most resizers <span style={{ color: 'var(--ytg-accent)' }}>upload your image.</span> This one doesn't.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>
              Search for a thumbnail resizer and you'll find dozens of sites that send your file to a server you don't control, log it, and serve you ads while you wait. Drafts, internal mockups, screenshots — none of that should leave your machine. This tool runs entirely on your device.
            </p>
          </div>
          <div className="ytr-grid-4">
            {[
              { num: '01', title: 'Browser-based', body: 'Pure HTML5 Canvas. No backend, no server-side processing. Verifiable in your DevTools Network tab — zero outbound requests with image data.' },
              { num: '02', title: 'Three quality presets', body: 'HD for direct YouTube upload, Full HD for embeds and blogs, 4K for archival masters. One tool, three workflows.' },
              { num: '03', title: 'Auto-fits under 2 MB', body: 'On the HD preset, JPG quality steps down progressively until your file passes YouTube\'s upload cap. No more "thumbnail too large" errors.' },
              { num: '04', title: 'Works offline', body: 'Once the page is loaded, no internet needed. Drop, switch, download, repeat — the whole loop runs locally.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--ytg-card)', borderRadius: 16, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', padding: 26 }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--ytg-accent)', letterSpacing: '0.06em', fontFamily: 'monospace', marginBottom: 14 }}>{c.num}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.3px', marginBottom: 8 }}>{c.title}</p>
                <p style={{ fontSize: 13.5, color: 'var(--ytg-text-2)', lineHeight: 1.68 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA INTO THUMBNAIL IQ */}
      <section style={{ padding: isMobile ? '0 16px 0' : '0 48px 0', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', paddingTop: isMobile ? 56 : 88, paddingBottom: isMobile ? 56 : 88 }}>
          <div style={{
            borderRadius: isMobile ? 18 : 24,
            border: '1px solid var(--ytg-border)',
            boxShadow: 'var(--ytg-shadow-lg)',
            padding: isMobile ? '40px 24px 36px' : '64px 56px',
            textAlign: 'center',
            background: 'var(--ytg-card)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 460, height: 220, background: 'radial-gradient(ellipse, rgba(229,48,42,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <span className="ytr-eyebrow" style={{ position: 'relative' }}>
              <span className="ytr-eyebrow-dot" />
              <span className="ytr-eyebrow-text">Next step</span>
            </span>
            <h2 className="ytr-h2" style={{ fontSize: isMobile ? 28 : 38, marginBottom: 14, position: 'relative' }}>
              Sized correctly is step one. <br />
              <span style={{ color: 'var(--ytg-accent)' }}>Sized to win the click is step two.</span>
            </h2>
            <p style={{ fontSize: isMobile ? 14 : 16, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 26px', position: 'relative' }}>
              A 1280×720 thumbnail still has to earn the click. Score yours against the top videos in your niche on contrast, face presence, text density, and curiosity-gap signals.
            </p>
            <a href="/features/thumbnail-iq" className="ytr-btn ytr-btn-lg" style={{ position: 'relative' }}>
              Score it with Thumbnail IQ →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="ytr-section-pad" style={{ padding: isMobile ? '64px 20px' : '96px 48px', background: 'var(--ytg-bg)', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="ytr-eyebrow">
              <span className="ytr-eyebrow-dot" />
              <span className="ytr-eyebrow-text">Frequently asked</span>
            </span>
            <h2 className="ytr-h2" style={{ fontSize: isMobile ? 28 : 36, color: 'var(--ytg-text)' }}>
              Questions <span style={{ color: 'var(--ytg-accent)' }}>answered.</span>
            </h2>
          </div>
          <div>
            {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      <LandingFooter />

    </div>
  )
}
