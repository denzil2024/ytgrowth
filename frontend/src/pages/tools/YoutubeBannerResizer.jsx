import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free SEO tool: YouTube Banner Resizer ────────────────────────────────
   /tools/youtube-banner-resizer.

   Targets "youtube banner size", "youtube channel art size", "youtube
   banner resizer", "youtube banner safe zone".

   What makes this different from every competing banner tool (Snappa,
   Wyzowl, Kreatli, Kapwing, Canva): none of them combine the resize/export
   step with a live safe-zone preview in one flow. Some split it into a
   separate "preview tool". This tool draws the safe zone as a permanent
   dashed guide AND lets you flip between TV / Desktop / Mobile tabs to see
   exactly what gets masked out on each surface, on the same canvas you
   download from.

   Scope:
   - One fixed export target: 2560x1440 (YouTube's recommended banner size).
     Center-crops a non-16:9 source, same as the Thumbnail Resizer.
   - JPG (default) or PNG output, auto-fits under YouTube's 6 MB banner cap
     (not the 2 MB thumbnail cap).
   - Device preview tabs (TV / Desktop / Mobile) darken everything outside
     that surface's visible crop on the PREVIEW canvas only. The downloaded
     file is always the full, clean 2560x1440 image, because you upload one
     banner and YouTube itself crops it per device, this tool never exports
     three different files.
   - Drop / click / paste support. Runs entirely in the browser via Canvas,
     no upload, no server, mirrors the Thumbnail Resizer's privacy story.

   Editorial design language (Fraunces + Barlow, sharp flat cards, warm
   paper, restrained red). See project_design_language_editorial.
*/

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

const CANVAS_W = 2560
const CANVAS_H = 1440
const FILE_CAP = 6 * 1024 * 1024 // YouTube's banner upload cap

/* The three surfaces YouTube crops a banner to. Mobile equals the official
   "safe zone", the only region guaranteed visible everywhere. */
const DEVICES = [
  { id: 'tv',      label: 'TV',           sub: '2560×1440', w: 2560, h: 1440,
    note: 'The full canvas, uncropped. What a connected-TV app shows, and the only surface where your full design is ever seen.' },
  { id: 'desktop', label: 'Desktop',      sub: '2560×423',  w: 2560, h: 423,
    note: 'Full width, a short vertical band. What youtube.com shows in a browser on a computer.' },
  { id: 'mobile',  label: 'Mobile / App', sub: '1546×423',  w: 1546, h: 423,
    note: 'The tightest crop there is, centered on the canvas. This is YouTube\'s official safe zone: the only area guaranteed visible on every device, including the mobile app.' },
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
    if (document.getElementById('ybr-styles')) return
    const style = document.createElement('style')
    style.id = 'ybr-styles'
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
      @keyframes ybrFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .ybr-wrap { max-width: 1040px; margin: 0 auto; }
      .ybr-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .ybr-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .ybr-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.14em; }
      .ybr-h1 { font-family: ${SERIF}; font-weight: 400; letter-spacing: -0.01em; line-height: 1.04; color: var(--yte-ink); }
      .ybr-h1 em { font-style: italic; color: var(--yte-accent); }
      .ybr-h2 { font-family: ${SERIF}; font-weight: 400; letter-spacing: -0.01em; line-height: 1.08; color: var(--yte-ink); }
      .ybr-h2 em { font-style: italic; color: var(--yte-accent); }
      .ybr-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .ybr-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--yte-accent); color: #fff; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 14px 28px; border: none; border-radius: 0; cursor: pointer; text-decoration: none; transition: filter 0.18s, transform 0.18s; white-space: nowrap; }
      .ybr-btn:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-1px); }
      .ybr-btn-lg { font-size: 13px; padding: 17px 36px; }
      .ybr-btn:disabled { background: rgba(20,19,15,0.10); color: var(--yte-muted); cursor: not-allowed; transform: none; filter: none; }

      .ybr-btn-ghost { display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: transparent; color: var(--yte-soft); font-family: ${SANS}; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 14px 22px; border-radius: 0; border: 1px solid var(--yte-line); cursor: pointer; text-decoration: none; transition: color 0.15s, border-color 0.15s; }
      .ybr-btn-ghost:hover { color: var(--yte-ink); border-color: var(--yte-line-2); }

      /* Drop zone */
      .ybr-drop { border: 1.5px dashed var(--yte-line-2); background: var(--yte-surface); border-radius: 0; padding: 56px 32px; text-align: center; transition: border-color 0.18s, background 0.18s; cursor: pointer; position: relative; }
      .ybr-drop.drag { border-color: var(--yte-accent); background: var(--yte-accent-soft); }
      .ybr-drop:hover { border-color: var(--yte-ink); }

      /* Device tabs: quiet, active = ink (never red, see feedback_quiet_toggles) */
      .ybr-devices { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
      .ybr-device { position: relative; cursor: pointer; background: var(--yte-surface); border: 1px solid var(--yte-line); border-radius: 0; padding: 15px 14px 13px; text-align: left; transition: border-color 0.18s, background 0.18s; }
      .ybr-device:hover { border-color: var(--yte-line-2); }
      .ybr-device.active { border-color: var(--yte-ink); background: var(--yte-bg-2); }
      .ybr-device-label { font-family: ${SANS}; font-size: 14px; font-weight: 600; color: var(--yte-ink); letter-spacing: -0.1px; }
      .ybr-device-sub { font-family: ${SANS}; font-size: 12px; color: var(--yte-muted); margin-top: 2px; font-variant-numeric: tabular-nums; }
      .ybr-device-badge { position: absolute; top: -9px; left: 14px; font-family: ${SANS}; font-size: 9px; font-weight: 700; letter-spacing: 0.1em; color: #fff; background: var(--yte-accent); padding: 2px 7px; text-transform: uppercase; }

      /* Quality slider */
      .ybr-quality { display: flex; align-items: center; gap: 14px; padding: 13px 16px; background: var(--yte-surface); border: 1px solid var(--yte-line); }
      .ybr-quality-label { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-muted); text-transform: uppercase; letter-spacing: 0.1em; min-width: 78px; }
      .ybr-quality input[type="range"] { flex: 1; height: 3px; appearance: none; background: var(--yte-line); border-radius: 0; outline: none; }
      .ybr-quality input[type="range"]::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; border-radius: 0; background: var(--yte-accent); cursor: pointer; }
      .ybr-quality input[type="range"]::-moz-range-thumb { width: 16px; height: 16px; border-radius: 0; border: 0; background: var(--yte-accent); cursor: pointer; }
      .ybr-quality-value { font-family: ${SANS}; font-size: 12.5px; font-weight: 700; color: var(--yte-ink); min-width: 40px; text-align: right; font-variant-numeric: tabular-nums; }

      /* Result card */
      .ybr-result-card { background: var(--yte-surface); border: 1px solid var(--yte-line); overflow: hidden; }
      .ybr-result-canvas-wrap { width: 100%; aspect-ratio: 16/9; background: #0a0a0f; display: flex; align-items: center; justify-content: center; }
      .ybr-result-canvas-wrap canvas { width: 100%; height: 100%; object-fit: contain; }

      /* Format toggle: quiet seg, active = ink */
      .ybr-format-toggle { display: inline-flex; border: 1px solid var(--yte-line); }
      .ybr-format-toggle button { appearance: none; background: var(--yte-surface); border: 0; cursor: pointer; font-family: ${SANS}; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; color: var(--yte-muted); padding: 8px 16px; transition: background 0.15s, color 0.15s; }
      .ybr-format-toggle button + button { border-left: 1px solid var(--yte-line); }
      .ybr-format-toggle button.active { background: var(--yte-ink); color: #fff; }

      .ybr-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      .ybr-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }

      .ybr-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease; }
      .ybr-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .ybr-faq-answer-inner { overflow: hidden; }

      @media (max-width: 900px) {
        .ybr-grid-3 { grid-template-columns: 1fr; }
        .ybr-grid-4 { grid-template-columns: 1fr 1fr; }
      }
      @media (max-width: 640px) {
        .ybr-grid-4 { grid-template-columns: 1fr; }
        .ybr-devices { grid-template-columns: 1fr; }
      }
      @media (max-width: 768px) {
        .ybr-section-pad { padding-left: 22px !important; padding-right: 22px !important; }
        .ybr-drop { padding: 40px 20px; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

/* ── Resize + preview core. HTML5 Canvas. Browser-only. ─────────────────── */

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

/* Center-crop to 16:9 then scale to the target W×H. Identical logic to the
   Thumbnail Resizer, banners just target a different canvas size. */
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

/* Darken everything outside the selected device's visible crop and draw a
   dashed border around it. Preview-only, never applied to the exported file. */
function drawDeviceOverlay(ctx, deviceId) {
  const device = DEVICES.find(d => d.id === deviceId) || DEVICES[0]
  const cropX = (CANVAS_W - device.w) / 2
  const cropY = (CANVAS_H - device.h) / 2

  if (device.w < CANVAS_W || device.h < CANVAS_H) {
    ctx.fillStyle = 'rgba(8,8,12,0.62)'
    ctx.fillRect(0, 0, CANVAS_W, cropY)                                   // top
    ctx.fillRect(0, cropY + device.h, CANVAS_W, CANVAS_H - (cropY + device.h)) // bottom
    ctx.fillRect(0, cropY, cropX, device.h)                               // left
    ctx.fillRect(cropX + device.w, cropY, CANVAS_W - (cropX + device.w), device.h) // right
  }

  ctx.save()
  ctx.strokeStyle = '#e5302a'
  ctx.lineWidth = 5
  ctx.setLineDash([20, 14])
  ctx.strokeRect(cropX + 2.5, cropY + 2.5, device.w - 5, device.h - 5)
  ctx.restore()
}

/* Encode at chosen format/quality. If the blob exceeds the cap, step quality
   down progressively (JPG only). */
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
    q: 'What is the correct YouTube banner size?',
    a: <>2560×1440 pixels, 16:9. That is the recommended size YouTube itself gives creators, and it is what this tool always exports to. The minimum YouTube will accept is 2048×1152, but starting from the minimum gives you no room for the safe zone math to breathe, so 2560×1440 is the size to design and upload at.</>,
  },
  {
    q: 'Why does my banner look cropped on mobile or in the app?',
    a: <>Because YouTube crops your one banner image differently per surface, and mobile shows by far the smallest slice. The mobile app and mobile web only show the centered 1546×423 pixel "safe zone," desktop shows a wider 2560×423 band, and only TV shows your full 2560×1440 canvas. If your logo or text sits outside that centered 1546×423 box, most of your visitors will never see it. Use the Mobile tab above to check before you upload.</>,
  },
  {
    q: 'Do I need to export three different banners for TV, desktop, and mobile?',
    a: <>No, and that is a common misconception. You upload exactly one 2560×1440 image. YouTube's own interface does the cropping per device automatically. The device tabs on this tool are a preview, showing you what each surface will crop to, so you can move your logo and text inside the safe zone before you upload, not a set of separate exports.</>,
  },
  {
    q: 'What file size and format does YouTube accept for banners?',
    a: <>Up to 6MB, in JPG, PNG, GIF, or BMP. That is a higher cap than the 2MB YouTube enforces on video thumbnails, so banners have more headroom for detail. This tool defaults to JPG and automatically steps the quality down until your file clears 6MB, so a "file too large" rejection should not happen if you export from here.</>,
  },
  {
    q: 'Is my banner image uploaded to your server?',
    a: <>No. The entire resize and preview runs in your browser using HTML5 Canvas. Nothing is uploaded, logged, or stored. Open your browser's DevTools Network tab while using the tool and you will see zero outbound requests carrying image data. A draft banner or an unreleased channel rebrand stays on your device the entire time.</>,
  },
  {
    q: 'JPG or PNG for a channel banner?',
    a: <>JPG for photographic banners (real photos, gradients, textured backgrounds). PNG for flat graphic designs with sharp text or logos, since PNG does not introduce compression artifacts around hard edges. Most channel banners are graphic-led, so if your logo text looks slightly soft after exporting as JPG, switch to PNG.</>,
  },
  {
    q: 'What size should my profile picture and video watermark be?',
    a: <>Your channel profile picture should be 800×800 pixels, square, under 2MB, displayed as a circle. A video watermark (the small logo that appears on your videos) needs a minimum of 150×150 pixels, also square, under 1MB. Neither uses the banner's safe zone rules since both are simple squares with no device cropping to worry about.</>,
  },
  {
    q: 'Can I still add clickable links on my banner?',
    a: <>No. YouTube removed clickable banner links in 2023. Links now live as up to 14 entries directly under your channel description, next to your channel name, not on the banner image itself. Design your banner as a pure visual (name, niche, upload schedule) and put your actual links in the About section instead.</>,
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--yte-line)' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', padding: '22px 0', fontFamily: SERIF, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, fontSize: 20, fontWeight: 400, color: open ? 'var(--yte-accent)' : 'var(--yte-ink)', letterSpacing: '-0.2px', lineHeight: 1.3, transition: 'color 0.2s' }}>
        <span style={{ flex: 1 }}>{q}</span>
        <span aria-hidden="true" style={{ flexShrink: 0, fontFamily: SANS, fontSize: 26, fontWeight: 300, color: 'var(--yte-accent)', lineHeight: 1, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
      </button>
      <div className={`ybr-faq-answer${open ? ' open' : ''}`}>
        <div className="ybr-faq-answer-inner">
          <div style={{ fontFamily: SANS, fontSize: 15.5, color: 'var(--yte-soft)', lineHeight: 1.78, padding: '0 0 22px 0', maxWidth: 760 }}>{a}</div>
        </div>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function YoutubeBannerResizer() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()
  const [drag, setDrag] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [deviceId, setDeviceId] = useState('mobile')
  const [format, setFormat] = useState('jpg')
  const [quality, setQuality] = useState(0.92)  // user override
  const [autoQuality, setAutoQuality] = useState(true)  // when true, slider is hidden / auto
  const fileInputRef = useRef(null)
  const previewCanvasRef = useRef(null)
  const workCanvasRef = useRef(null)
  const lastImgRef = useRef(null)
  const lastFileRef = useRef(null)

  const device = useMemo(() => DEVICES.find(d => d.id === deviceId) || DEVICES[0], [deviceId])

  useEffect(() => {
    document.title = 'YouTube Banner Resizer 2026: Free Safe Zone Preview Tool | YTGrowth'
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = 'Free YouTube banner resizer with a live safe zone preview. Export the exact 2560x1440 spec and see what mobile, desktop, and TV viewers will actually see before you upload.'
  }, [])

  const renderResult = useCallback(async (img, file, devId, fmt, q, auto) => {
    setWorking(true)
    setError('')
    try {
      if (!workCanvasRef.current) workCanvasRef.current = document.createElement('canvas')
      const work = workCanvasRef.current
      drawCenterCropped(img, work, CANVAS_W, CANVAS_H)

      const cap = auto ? FILE_CAP : null
      const startQ = auto ? 0.92 : q
      const { blob, quality: usedQ } = await encodeWithCap(work, fmt, startQ, cap)
      if (!blob) throw new Error('Could not encode the image. Try a different file.')
      const url = URL.createObjectURL(blob)
      setResult({
        url, blob, format: fmt, quality: usedQ,
        sourceName: file?.name || 'image', sourceSize: file?.size || 0,
        originalDims: { w: img.width, h: img.height },
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
      await renderResult(img, file, deviceId, format, quality, autoQuality)
    } catch (e) {
      setError('Could not read that image. Try a different file.')
    }
  }

  /* Re-encode whenever format, quality, or auto toggle change (device tab
     alone doesn't need a re-encode, only a preview redraw, see below). */
  useEffect(() => {
    if (lastImgRef.current) {
      renderResult(lastImgRef.current, lastFileRef.current, deviceId, format, quality, autoQuality)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, quality, autoQuality])

  /* Draw the preview canvas from the clean work canvas whenever the device
     tab changes OR the result (and therefore the <canvas> element itself,
     which only mounts once `result` is set) changes. This runs AFTER the
     canvas has mounted, unlike drawing inline inside renderResult, which
     would silently no-op on the very first drop because the <canvas> is
     gated behind `result &&` and doesn't exist yet at that point. */
  useEffect(() => {
    const work = workCanvasRef.current
    const preview = previewCanvasRef.current
    if (!work || !preview || !result) return
    preview.width = CANVAS_W
    preview.height = CANVAS_H
    const pctx = preview.getContext('2d')
    pctx.drawImage(work, 0, 0)
    drawDeviceOverlay(pctx, deviceId)
  }, [result, deviceId])

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
    const base = (result.sourceName || 'banner').replace(/\.[^.]+$/, '')
    a.download = `${base}-2560x1440.${result.format === 'png' ? 'png' : 'jpg'}`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  const reset = () => {
    if (result?.url) URL.revokeObjectURL(result.url)
    setResult(null); setError('')
    lastImgRef.current = null; lastFileRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /* Warn when the source is smaller than the export target. */
  const upscaleWarning = useMemo(() => {
    if (!result) return null
    const { originalDims } = result
    if (originalDims.w < CANVAS_W || originalDims.h < CANVAS_H) {
      return `Your source is ${originalDims.w}×${originalDims.h}. Scaling up to ${CANVAS_W}×${CANVAS_H} stretches pixels, the output won't be sharper than the source.`
    }
    return null
  }, [result])

  const H2 = isMobile ? 28 : 40

  return (
    <div style={{ background: 'var(--yte-bg)', minHeight: '100vh', fontFamily: SANS, color: 'var(--yte-ink)' }}>

      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* HERO */}
      <section className="ybr-section-pad" style={{ padding: isMobile ? '60px 22px 40px' : '104px 48px 48px', background: 'var(--yte-bg)' }}>
        <div className="ybr-wrap" style={{ animation: 'ybrFadeUp 0.5s ease both' }}>
          <div className="ybr-eyebrow">
            <span aria-hidden="true" className="ybr-eyebrow-rule" />
            <span className="ybr-eyebrow-text">Free · Browser-based · Private</span>
          </div>
          <h1 className="ybr-h1" style={{ fontSize: isMobile ? 36 : 60, marginBottom: 20, maxWidth: 860, textWrap: 'balance' }}>
            YouTube banner resizer. <em>See the crop first.</em>
          </h1>
          <p className="ybr-lead" style={{ fontSize: isMobile ? 16 : 17.5, maxWidth: 720, marginBottom: 12, textWrap: 'pretty' }}>
            Drop any image, export at the exact 2560×1440 YouTube spec, and preview exactly what mobile, desktop, and TV viewers will see before you upload, the safe zone included.
          </p>
          <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-muted)', maxWidth: 720 }}>
            Runs entirely in your browser using HTML5 Canvas. Your image never leaves your device. <a href="#privacy" style={{ color: 'var(--yte-soft)', textDecoration: 'underline' }}>How we know.</a>
          </p>
        </div>
      </section>

      {/* TOOL */}
      <section className="ybr-section-pad" style={{ padding: isMobile ? '8px 22px 64px' : '0 48px 88px', background: 'var(--yte-bg)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          {/* Device preview tabs */}
          <div className="ybr-devices">
            {DEVICES.map(d => (
              <button key={d.id}
                onClick={() => setDeviceId(d.id)}
                className={`ybr-device${deviceId === d.id ? ' active' : ''}`}
                aria-pressed={deviceId === d.id}
              >
                {d.id === 'mobile' && <span className="ybr-device-badge">Safe zone</span>}
                <div className="ybr-device-label">{d.label}</div>
                <div className="ybr-device-sub">{d.sub}</div>
              </button>
            ))}
          </div>
          <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-muted)', marginBottom: 16, lineHeight: 1.6 }}>{device.note}</p>

          {/* Quality controls, only meaningful for JPG */}
          {format === 'jpg' && (
            <div className="ybr-quality">
              <span className="ybr-quality-label">JPG quality</span>
              <input
                type="range" min="40" max="100" step="1"
                value={Math.round(quality * 100)}
                onChange={(e) => { setAutoQuality(false); setQuality(parseInt(e.target.value, 10) / 100) }}
              />
              <span className="ybr-quality-value">{Math.round(quality * 100)}%</span>
              <button
                onClick={() => { setAutoQuality(true); setQuality(0.92) }}
                className="ybr-btn-ghost"
                style={{ padding: '7px 12px', marginLeft: 6 }}
                title="Auto-step down to fit under 6 MB"
              >
                {autoQuality ? 'Auto' : 'Reset'}
              </button>
            </div>
          )}

          {/* Drop zone or result */}
          <div style={{ marginTop: 12 }}>
            {!result && (
              <div
                className={`ybr-drop${drag ? ' drag' : ''}`}
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
                <div style={{ display: 'inline-flex', width: 52, height: 52, background: 'var(--yte-accent-soft)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e5302a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 17, fontWeight: 600, color: 'var(--yte-ink)', marginBottom: 6 }}>
                  Drop an image, click to choose, or paste from clipboard
                </p>
                <p style={{ fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-muted)' }}>
                  JPG, PNG, GIF, WebP, BMP · up to 80 MB · output: <strong style={{ color: 'var(--yte-soft)', fontWeight: 600 }}>2560×1440</strong>
                </p>
              </div>
            )}

            {error && (
              <div style={{ marginTop: 14, padding: '14px 18px', background: 'rgba(229,48,42,0.06)', border: '1px solid rgba(229,48,42,0.28)', color: '#991b1b', fontFamily: SANS, fontSize: 14, fontWeight: 500 }}>
                {error}
              </div>
            )}

            {result && (
              <div style={{ animation: 'ybrFadeUp 0.4s ease both' }}>
                <div className="ybr-result-card">
                  <div className="ybr-result-canvas-wrap">
                    <canvas ref={previewCanvasRef} />
                  </div>
                  <div style={{ padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--yte-line)' }}>
                    <div style={{ minWidth: 0, textAlign: 'left' }}>
                      <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: 'var(--yte-ink)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 360 }}>{result.sourceName}</p>
                      <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)' }}>
                        {result.originalDims.w}×{result.originalDims.h} ({formatBytes(result.sourceSize)}) → <strong style={{ color: 'var(--yte-soft)', fontWeight: 600 }}>2560×1440 ({formatBytes(result.blob.size)})</strong>
                        {result.format === 'jpg' && (<span> · q{Math.round(result.quality * 100)}</span>)}
                      </p>
                    </div>
                    <div className="ybr-format-toggle">
                      <button onClick={() => setFormat('jpg')} className={format === 'jpg' ? 'active' : ''}>JPG</button>
                      <button onClick={() => setFormat('png')} className={format === 'png' ? 'active' : ''}>PNG</button>
                    </div>
                  </div>
                </div>

                {upscaleWarning && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.32)', color: '#854d0e', fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>
                    ⚠ {upscaleWarning}
                  </div>
                )}

                {result.blob.size > FILE_CAP && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.32)', color: '#854d0e', fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>
                    ⚠ {formatBytes(result.blob.size)} is above YouTube's 6 MB cap. Switch to JPG or lower the quality slider.
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
                  <button onClick={onDownload} className="ybr-btn ybr-btn-lg" disabled={working || !result.blob}>
                    Download 2560×1440 {result.format === 'png' ? 'PNG' : 'JPG'} →
                  </button>
                  <button onClick={reset} className="ybr-btn-ghost">
                    Resize another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SAFE ZONE, explained */}
      <section className="ybr-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="ybr-wrap">
          <div style={{ maxWidth: 720, marginBottom: 40 }}>
            <div className="ybr-eyebrow">
              <span aria-hidden="true" className="ybr-eyebrow-rule" />
              <span className="ybr-eyebrow-text">One image, three crops</span>
            </div>
            <h2 className="ybr-h2" style={{ fontSize: H2, marginBottom: 14, textWrap: 'balance' }}>
              Your banner is <em>one file.</em> YouTube shows three of them.
            </h2>
            <p className="ybr-lead" style={{ fontSize: 17 }}>
              You upload a single 2560×1440 image, and YouTube crops it differently depending on where someone views your channel. TV shows everything. Desktop shows a wide band. Mobile, where most of your traffic actually is, shows only the centered core. Design for the tightest crop and every other surface takes care of itself.
            </p>
          </div>
          <div className="ybr-grid-3">
            {DEVICES.map((d, i) => (
              <div key={i} style={{ position: 'relative', background: 'var(--yte-surface)', padding: 28 }}>
                {d.id === 'mobile' && (
                  <span style={{ position: 'absolute', top: -1, left: 28, fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#fff', background: 'var(--yte-accent)', padding: '4px 9px', textTransform: 'uppercase' }}>Safe zone</span>
                )}
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, marginTop: d.id === 'mobile' ? 12 : 0 }}>
                  <p style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: 'var(--yte-ink)', letterSpacing: '-0.2px' }}>{d.label}</p>
                </div>
                <p style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.5px', marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
                  {d.w}<span style={{ color: 'var(--yte-muted)' }}>×</span>{d.h}
                </p>
                <p style={{ fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-soft)', lineHeight: 1.7, marginBottom: 16 }}>{d.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECS COMPARISON */}
      <section className="ybr-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ maxWidth: 720, marginBottom: 36 }}>
            <div className="ybr-eyebrow">
              <span aria-hidden="true" className="ybr-eyebrow-rule" />
              <span className="ybr-eyebrow-text">YouTube spec</span>
            </div>
            <h2 className="ybr-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', textWrap: 'balance' }}>
              The numbers that <em>matter</em> on upload.
            </h2>
          </div>
          <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--yte-bg-2)' }}>
                <tr>
                  <th style={{ padding: '14px 22px', textAlign: 'left', fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--yte-muted)' }}>Field</th>
                  <th style={{ padding: '14px 22px', textAlign: 'left', fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--yte-muted)' }}>YouTube requires</th>
                  <th style={{ padding: '14px 22px', textAlign: 'left', fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--yte-muted)' }}>This tool ships</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: 'Recommended size', y: '2560×1440 (2048×1152 minimum)', t: '2560×1440 exact, always' },
                  { f: 'Aspect ratio',     y: '16:9',                          t: '16:9 (auto-cropped from any source)' },
                  { f: 'Safe zone',        y: '1546×423, centered',            t: 'Live dashed guide + TV/desktop/mobile preview' },
                  { f: 'File size',        y: 'Under 6 MB',                    t: 'Auto-fits under 6 MB' },
                  { f: 'Format',           y: 'JPG, PNG, GIF, BMP',            t: 'JPG (default) or PNG' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--yte-line)' }}>
                    <td style={{ padding: '16px 22px', fontFamily: SANS, fontSize: 14, fontWeight: 600, color: 'var(--yte-ink)' }}>{row.f}</td>
                    <td style={{ padding: '16px 22px', fontFamily: SANS, fontSize: 14, color: 'var(--yte-soft)', lineHeight: 1.55 }}>{row.y}</td>
                    <td style={{ padding: '16px 22px', fontFamily: SANS, fontSize: 14, color: 'var(--yte-accent)', fontWeight: 600, lineHeight: 1.55 }}>{row.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PRIVACY / WHY US */}
      <section id="privacy" className="ybr-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="ybr-wrap">
          <div style={{ maxWidth: 720, marginBottom: 40 }}>
            <div className="ybr-eyebrow">
              <span aria-hidden="true" className="ybr-eyebrow-rule" />
              <span className="ybr-eyebrow-text">Why this tool exists</span>
            </div>
            <h2 className="ybr-h2" style={{ fontSize: H2, marginBottom: 14, textWrap: 'balance' }}>
              Other resizers guess. <em>This one shows you.</em>
            </h2>
            <p className="ybr-lead" style={{ fontSize: 17 }}>
              Most banner tools export a flat 2560×1440 file and leave you to imagine what mobile crops away. A few offer a separate safe-zone preview you have to switch to. This tool puts the live preview and the export in the same canvas, so you catch a clipped logo before you upload, not after.
            </p>
          </div>
          <div className="ybr-grid-4">
            {[
              { num: '01', title: 'Live safe-zone preview', body: 'Flip between TV, desktop, and mobile and watch exactly what gets masked out on each, on the same image you are about to export.' },
              { num: '02', title: 'Browser-based', body: 'Pure HTML5 Canvas. No backend, no server-side processing. Verifiable in your DevTools Network tab, zero outbound requests with image data.' },
              { num: '03', title: 'Auto-fits under 6 MB', body: 'JPG quality steps down progressively until your file passes YouTube\'s banner upload cap. No more "file too large" errors.' },
              { num: '04', title: 'Works offline', body: 'Once the page is loaded, no internet needed. Drop, preview, download, repeat, the whole loop runs locally.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--yte-surface)', padding: 26 }}>
                <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: 'var(--yte-accent)', letterSpacing: '0.08em', marginBottom: 14 }}>{c.num}</p>
                <p style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.2px', marginBottom: 8, lineHeight: 1.2 }}>{c.title}</p>
                <p style={{ fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-soft)', lineHeight: 1.68 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="ybr-section-pad" style={{ padding: isMobile ? '60px 22px' : '104px 48px', background: 'var(--yte-bg)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ marginBottom: 32 }}>
            <div className="ybr-eyebrow">
              <span aria-hidden="true" className="ybr-eyebrow-rule" />
              <span className="ybr-eyebrow-text">Frequently asked</span>
            </div>
            <h2 className="ybr-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', textWrap: 'balance' }}>
              Banner sizing, <em>answered.</em>
            </h2>
          </div>
          <div style={{ borderTop: '1px solid var(--yte-line)' }}>
            {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      <LandingFooter />

    </div>
  )
}
