import { useEffect, useState, useRef, useCallback } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'

/* ─── Free SEO tool: YouTube Thumbnail Resizer ─────────────────────────────
   /tools/youtube-thumbnail-resizer. Targets the "youtube thumbnail resizer"
   keyword (~30K monthly searches, tool intent). 100% client-side using
   HTML5 Canvas — no upload, no backend.

   Output spec: exactly 1280x720 (16:9), JPG by default, auto-compresses
   under 2MB to satisfy YouTube's upload requirement. Center-crops if the
   source has a different aspect ratio.

   Visual DNA matches YoutubeThumbnailDownloader so the two thumbnail
   tools feel like siblings.
*/

const TARGET_W = 1280
const TARGET_H = 720
const MAX_BYTES = 2 * 1024 * 1024  // YouTube's 2MB thumbnail cap

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
        --ytg-nav:          rgba(244,244,246,0.92);
        --ytg-card:         #ffffff;
        --ytg-border:       rgba(10,10,15,0.09);
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
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
        white-space: nowrap;
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
        border-radius: 100px; padding: 5px 12px 5px 10px; margin-bottom: 20px;
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

      .ytr-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }

      /* FAQ pattern matches Landing.jsx */
      .ytr-faq-answer {
        display: grid; grid-template-rows: 0fr; opacity: 0;
        transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
      }
      .ytr-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .ytr-faq-answer-inner { overflow: hidden; }

      @media (max-width: 900px) {
        .ytr-grid-3 { grid-template-columns: 1fr; }
      }
      @media (max-width: 768px) {
        .ytr-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .ytr-drop { padding: 40px 20px; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

/* ── Resize core. Pure HTML5 Canvas, no library, no upload. ───────────── */

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

/* Center-crop to 16:9 then scale to 1280x720 onto an offscreen canvas. */
function drawCenterCropped(img, canvas) {
  const ctx = canvas.getContext('2d')
  canvas.width = TARGET_W
  canvas.height = TARGET_H

  const srcRatio = img.width / img.height
  const tgtRatio = TARGET_W / TARGET_H

  let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height
  if (srcRatio > tgtRatio) {
    // Source is wider — crop horizontal sides
    sWidth = img.height * tgtRatio
    sx = (img.width - sWidth) / 2
  } else if (srcRatio < tgtRatio) {
    // Source is taller — crop top and bottom
    sHeight = img.width / tgtRatio
    sy = (img.height - sHeight) / 2
  }

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, TARGET_W, TARGET_H)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, TARGET_W, TARGET_H)
}

/* Compress with successive quality drops until the blob fits under 2MB.
   PNG isn't quality-controllable, so for PNG we just emit and warn if it
   exceeds the cap. */
function compressToFit(canvas, format) {
  return new Promise((resolve) => {
    const mime = format === 'png' ? 'image/png' : 'image/jpeg'
    if (mime === 'image/png') {
      canvas.toBlob(b => resolve({ blob: b, quality: 1 }), mime)
      return
    }
    const tryQuality = (q) => {
      canvas.toBlob(b => {
        if (!b) { resolve({ blob: null, quality: q }); return }
        if (b.size <= MAX_BYTES || q <= 0.4) {
          resolve({ blob: b, quality: q })
        } else {
          tryQuality(q - 0.08)
        }
      }, mime, q)
    }
    tryQuality(0.92)
  })
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}

/* ── Page ──────────────────────────────────────────────────────────────── */

const FAQS = [
  {
    q: 'What dimensions does YouTube actually require for thumbnails?',
    a: <>YouTube's official spec is <b>1280x720 pixels</b> (16:9 aspect ratio), under <b>2MB</b>, in JPG, GIF, BMP, or PNG. Anything smaller than 640x360 gets rejected. This tool always outputs exactly 1280x720, the recommended size that displays sharp on every device, from the mobile feed up to the YouTube TV app.</>,
  },
  {
    q: 'Why does my final file have to be under 2MB?',
    a: <>It's a hard cap on the upload endpoint. Files larger than 2MB are silently rejected. JPG outputs from this tool start at 92% quality and step down automatically until the file fits, so you never have to think about it. PNG outputs preserve full quality but can sometimes exceed 2MB on photographic source material; if that happens, switch the output to JPG.</>,
  },
  {
    q: 'What happens if my image is not 16:9 to begin with?',
    a: <>The tool center-crops your image to a 16:9 region before scaling. So a square Instagram post or a vertical phone screenshot will keep its center subject and trim the edges. If you need pixel-precise positioning, design your source thumbnail at 1280x720 in Canva or Figma before uploading.</>,
  },
  {
    q: 'Is my image uploaded anywhere?',
    a: <>No. The entire resize runs in your browser using HTML5 Canvas. The image never leaves your device, never touches our servers, and is not stored anywhere. You can verify this by opening DevTools and checking the network tab while you use the tool.</>,
  },
  {
    q: 'JPG or PNG. Which should I pick?',
    a: <>JPG for photographic thumbnails (faces, product shots, real-world imagery). It compresses far smaller and the quality loss is invisible at 1280x720. PNG for graphic-heavy thumbnails (text overlays, illustrations, hard edges, transparency). It's lossless but can be 5 to 10 times larger. Default is JPG because 95% of YouTube thumbnails benefit from it.</>,
  },
  {
    q: 'Will the resized thumbnail rank better than my original?',
    a: <>The resize itself is a technical fix, not a CTR boost. What ranks thumbnails is composition, contrast, and the curiosity gap they create with the title. Once you have a properly sized thumbnail, the next move is scoring it against the top videos in your niche. <a href="/features/thumbnail-iq" style={{ color: 'var(--ytg-accent)', fontWeight: 600 }}>Thumbnail IQ</a> runs face detection, contrast analysis, and a vision-model curiosity-gap read so you know whether your design is competitive before you publish.</>,
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

export default function YoutubeThumbnailResizer() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()
  const [drag, setDrag] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)  // { url, blob, format, sourceName, sourceSize, originalDims }
  const [format, setFormat] = useState('jpg')
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const lastImgRef = useRef(null)
  const lastFileNameRef = useRef('')
  const lastSourceSizeRef = useRef(0)

  useEffect(() => {
    document.title = 'Free YouTube Thumbnail Resizer (1280×720, under 2MB) — YTGrowth'
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = 'Free YouTube thumbnail resizer. Drop any image and get an exact 1280x720 thumbnail under 2MB, ready to upload. 100% browser-based. JPG or PNG.'
  }, [])

  /* Re-render when the user toggles JPG/PNG without re-uploading. */
  const renderResult = useCallback(async (img, sourceName, sourceSize, fmt) => {
    setWorking(true)
    setError('')
    try {
      const canvas = canvasRef.current || document.createElement('canvas')
      drawCenterCropped(img, canvas)
      const { blob, quality } = await compressToFit(canvas, fmt)
      if (!blob) throw new Error('Could not encode the image. Try a different file.')
      const url = URL.createObjectURL(blob)
      setResult({ url, blob, format: fmt, quality, sourceName, sourceSize, originalDims: { w: img.width, h: img.height } })
    } catch (e) {
      setError(e.message || 'Something went wrong while resizing.')
    } finally {
      setWorking(false)
    }
  }, [])

  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('That does not look like an image. Try a JPG, PNG, GIF, or BMP.')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File is over 50MB. Pick a smaller source image.')
      return
    }
    setError('')
    try {
      const img = await loadImageFromFile(file)
      lastImgRef.current = img
      lastFileNameRef.current = file.name
      lastSourceSizeRef.current = file.size
      await renderResult(img, file.name, file.size, format)
    } catch (e) {
      setError('Could not read that image. Try a different file.')
    }
  }

  /* When format changes, re-render the existing image (no re-upload needed). */
  useEffect(() => {
    if (lastImgRef.current) {
      renderResult(lastImgRef.current, lastFileNameRef.current, lastSourceSizeRef.current, format)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format])

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
    a.download = `${base}-1280x720.${result.format === 'png' ? 'png' : 'jpg'}`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  const reset = () => {
    if (result?.url) URL.revokeObjectURL(result.url)
    setResult(null); setError(''); lastImgRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div style={{ background: 'var(--ytg-bg)', minHeight: '100vh' }}>

      <SiteHeader />

      {/* HERO + TOOL */}
      <section className="ytr-section-pad" style={{ padding: isMobile ? '64px 24px 48px' : '88px 48px 64px', textAlign: 'center', background: '#ffffff' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', animation: 'ytrFadeUp 0.5s ease both' }}>
          <span className="ytr-eyebrow">
            <span className="ytr-eyebrow-dot" />
            <span className="ytr-eyebrow-text">Free tool · No upload</span>
          </span>
          <h1 className="ytr-h1" style={{ fontSize: isMobile ? 36 : 56, color: 'var(--ytg-text)', marginBottom: 18 }}>
            YouTube thumbnail resizer. <span style={{ color: 'var(--ytg-accent)' }}>1280×720, under 2MB.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18.5, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 32px' }}>
            Drop any image, get back an exact 1280×720 thumbnail compressed under YouTube's 2MB limit. Runs entirely in your browser — your image never leaves your device.
          </p>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto' }}>
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
                Drop an image here, click to choose, or paste from clipboard
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--ytg-text-3)' }}>
                JPG, PNG, GIF, BMP · up to 50MB · output is exactly 1280×720
              </p>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 18, padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#991b1b', fontSize: 14, fontWeight: 500 }}>
              {error}
            </div>
          )}

          {result && (
            <div style={{ marginTop: 0, animation: 'ytrFadeUp 0.4s ease both' }}>
              <div className="ytr-result-card">
                <div className="ytr-result-canvas-wrap">
                  <canvas ref={canvasRef} />
                </div>
                <div style={{ padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ textAlign: 'left', minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ytg-text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 360 }}>{result.sourceName || 'thumbnail'}</p>
                    <p style={{ fontSize: 12.5, color: 'var(--ytg-text-3)' }}>
                      {result.originalDims.w}×{result.originalDims.h} ({formatBytes(result.sourceSize)}) → <strong style={{ color: 'var(--ytg-text-2)' }}>1280×720 ({formatBytes(result.blob.size)})</strong>
                      {result.format === 'jpg' && result.quality < 0.92 && (
                        <span> · JPG quality {Math.round(result.quality * 100)}%</span>
                      )}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setFormat('jpg')}
                      className="ytr-btn-ghost"
                      style={{ borderColor: format === 'jpg' ? 'var(--ytg-accent)' : 'var(--ytg-border)', color: format === 'jpg' ? 'var(--ytg-accent)' : 'var(--ytg-text-2)' }}
                    >JPG</button>
                    <button
                      onClick={() => setFormat('png')}
                      className="ytr-btn-ghost"
                      style={{ borderColor: format === 'png' ? 'var(--ytg-accent)' : 'var(--ytg-border)', color: format === 'png' ? 'var(--ytg-accent)' : 'var(--ytg-text-2)' }}
                    >PNG</button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 22 }}>
                <button onClick={onDownload} className="ytr-btn ytr-btn-lg" disabled={working || !result.blob}>
                  Download {result.format === 'png' ? 'PNG' : 'JPG'} →
                </button>
                <button onClick={reset} className="ytr-btn-ghost" style={{ padding: '14px 22px' }}>
                  Resize another
                </button>
              </div>

              {result.format === 'png' && result.blob.size > MAX_BYTES && (
                <p style={{ fontSize: 13, color: '#b45309', marginTop: 14, textAlign: 'center' }}>
                  ⚠ This PNG is over YouTube's 2MB cap. Switch to JPG to compress automatically.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* WHY USE THIS */}
      <section className="ytr-section-pad" style={{ padding: isMobile ? '56px 20px' : '88px 48px', background: 'var(--ytg-bg)', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
            <span className="ytr-eyebrow">
              <span className="ytr-eyebrow-dot" />
              <span className="ytr-eyebrow-text">Why this exists</span>
            </span>
            <h2 className="ytr-h2" style={{ fontSize: isMobile ? 30 : 42, marginBottom: 14, color: 'var(--ytg-text)' }}>
              YouTube has rules. <span style={{ color: 'var(--ytg-accent)' }}>This tool follows them.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>
              The official thumbnail spec is 1280×720 pixels, under 2MB, in JPG, GIF, BMP, or PNG. Anything smaller than 640×360 gets rejected. Wrong dimensions get cropped awkwardly in the feed. Files over 2MB get silently refused. This tool handles all three.
            </p>
          </div>
          <div className="ytr-grid-3">
            {[
              { num: '01', title: 'Exact 1280×720 output', body: 'Center-crops to 16:9 if your source is square, vertical, or any other ratio. Always exports the recommended thumbnail size, never a downscale that softens the image.' },
              { num: '02', title: 'Auto-compresses under 2MB', body: 'JPG output starts at 92% quality and steps down progressively until the file fits YouTube\'s 2MB upload cap. PNG output preserves full quality for graphic-heavy thumbnails.' },
              { num: '03', title: 'Nothing leaves your browser', body: 'Pure HTML5 Canvas in your browser. No upload, no server, no storage. Drop in a private screenshot, and it stays private. Verifiable in DevTools.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--ytg-card)', borderRadius: 16, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', padding: 28 }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--ytg-accent)', letterSpacing: '0.06em', fontFamily: 'monospace', marginBottom: 14 }}>{c.num}</p>
                <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.3px', marginBottom: 10 }}>{c.title}</p>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.68 }}>{c.body}</p>
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
              <span style={{ color: 'var(--ytg-accent)' }}>Sized to win is step two.</span>
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
      <section className="ytr-section-pad" style={{ padding: isMobile ? '56px 20px' : '88px 48px', background: 'var(--ytg-bg)', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="ytr-eyebrow">
              <span className="ytr-eyebrow-dot" />
              <span className="ytr-eyebrow-text">Frequently asked</span>
            </span>
            <h2 className="ytr-h2" style={{ fontSize: isMobile ? 28 : 36, color: 'var(--ytg-text)' }}>
              Thumbnail resizing, sorted.
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
