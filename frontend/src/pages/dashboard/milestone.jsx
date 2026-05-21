/* ─── Milestone components ──────────────────────────────────────────────────
   The "channel hit a round number" celebration system: badges (StarBadge,
   TierRibbon, MilestoneIcon), the PNG-exportable share certificate
   (MilestoneShareCard + its modal MilestoneShareModal), and the popping
   celebration modal (MilestoneCelebrationModal + ConfettiBurst) that
   fires when the user is shown a milestone for the first time. */
import { forwardRef, useRef, useState } from 'react'
import {
  CATEGORY_GRADIENT,
  MILESTONE_TITLE, MILESTONE_VERB,
  CONFETTI_COLORS,
} from './tokens'
import { fmtNum, formatAchievedDate } from './utils'
import { YTGLogo } from './primitives'

export function StarBadge({ category, tier, size = 108 }) {
  const cat = CATEGORY_GRADIENT[category] || CATEGORY_GRADIENT.subs
  const gid = `grad-${category}-${tier}`.replace(/\W/g, '')
  const s = size
  const cx = s / 2
  const cy = s / 2
  const pts = [
    [60, 8], [73, 44], [112, 44], [80, 68], [92, 104],
    [60, 82], [28, 104], [40, 68], [8, 44], [47, 44],
  ].map(([x, y]) => `${(x / 120) * s},${(y / 120) * s}`).join(' ')
  return (
    <div style={{ position: 'relative', width: s, height: s, margin: '0 auto' }}>
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.22))' }}>
        <defs>
          <radialGradient id={gid} cx="36%" cy="30%" r="72%">
            <stop offset="0%"  stopColor={cat.h1}/>
            <stop offset="55%" stopColor={cat.h2}/>
            <stop offset="100%" stopColor={cat.h3}/>
          </radialGradient>
        </defs>
        <polygon
          points={pts}
          fill={`url(#${gid})`}
          stroke={cat.stroke}
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <circle cx={cx} cy={cy * 0.97} r={s * 0.19} fill="rgba(255,255,255,0.96)"/>
      </svg>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: s, height: s,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{ marginTop: -s * 0.03 }}>
          <MilestoneIcon category={category} color={cat.ink} size={s * 0.26}/>
        </div>
      </div>
    </div>
  )
}

export function TierRibbon({ tier, metal }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: `linear-gradient(180deg, ${metal.ribbon} 0%, ${metal.shadow} 100%)`,
      color: '#fff',
      fontSize: 12.5, fontWeight: 700,
      padding: '5px 12px 5px 8px',
      borderRadius: 3,
      letterSpacing: '-0.1px',
      fontVariantNumeric: 'tabular-nums',
      boxShadow: '0 2px 5px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.2)',
      position: 'relative',
      marginTop: -8,
    }}>
      <span style={{
        position: 'absolute', left: -6, top: 0, bottom: 0, width: 0, height: '100%',
        borderRight: `6px solid ${metal.shadow}`,
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
      }}/>
      <span style={{
        position: 'absolute', right: -6, top: 0, bottom: 0, width: 0, height: '100%',
        borderLeft: `6px solid ${metal.shadow}`,
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
      }}/>
      <span style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 3, padding: 1.5 }}>
        <YTGLogo size={11}/>
      </span>
      {fmtNum(tier)}
    </div>
  )
}

/* ─── Shareable milestone certificate (PNG-exportable) ─────────────────── */
export const MilestoneShareCard = forwardRef(function MilestoneShareCard(
  { category, tier, achievedAt, channelName, channelThumbnail },
  ref
) {
  const cat       = CATEGORY_GRADIENT[category] || CATEGORY_GRADIENT.subs
  const title     = MILESTONE_TITLE[category] || ''
  const verbLabel = MILESTONE_VERB[category] || ''
  const dateStr   = formatAchievedDate(achievedAt) || formatAchievedDate(new Date().toISOString())
  const initial   = (channelName || '?').charAt(0).toUpperCase()

  return (
    <div
      ref={ref}
      style={{
        width: 600,
        background: '#ffffff',
        fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
        color: '#0f0f13',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
        border: '1px solid #e8e8ee',
      }}
    >
      {/* ── Top dark band with YTGrowth wordmark ── */}
      <div style={{
        background: 'linear-gradient(180deg, #15151c 0%, #0a0a0f 100%)',
        padding: '22px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: '#ff3b30',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(255,59,48,0.45)',
        }}>
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path d="M23.2 11.6a2.1 2.1 0 0 0-1.48-1.48C20.55 9.8 16 9.8 16 9.8s-4.55 0-5.72.32A2.1 2.1 0 0 0 8.8 11.6 22 22 0 0 0 8.5 16a22 22 0 0 0 .3 4.4 2.1 2.1 0 0 0 1.48 1.48C11.45 22.2 16 22.2 16 22.2s4.55 0 5.72-.32a2.1 2.1 0 0 0 1.48-1.48A22 22 0 0 0 23.5 16a22 22 0 0 0-.3-4.4z" fill="white"/>
            <polygon points="13.5,19 19.5,16 13.5,13" fill="#ff3b30"/>
          </svg>
        </div>
        <span style={{
          fontSize: 22, fontWeight: 700, color: '#ffffff',
          letterSpacing: '-0.6px',
        }}>
          YTGrowth<span style={{ color: '#ff3b30' }}>.io</span>
        </span>
      </div>

      {/* ── Inner certificate body ── */}
      <div style={{
        position: 'relative',
        padding: '0 56px 40px',
        background: `linear-gradient(180deg, ${cat.h1}18 0%, #ffffff 38%, #ffffff 100%)`,
      }}>
        {/* Hanging ribbon V-drape + star badge */}
        <div style={{
          position: 'relative', width: '100%', height: 200,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          {/* V-drape: two folded straps meeting behind the star */}
          <svg
            width="200" height="140"
            viewBox="0 0 200 140"
            style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }}
          >
            <defs>
              <linearGradient id={`ribbonL-${category}-${tier}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#ff5246"/>
                <stop offset="100%" stopColor="#c1150c"/>
              </linearGradient>
              <linearGradient id={`ribbonR-${category}-${tier}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#d31a10"/>
                <stop offset="100%" stopColor="#8a0e07"/>
              </linearGradient>
            </defs>
            <polygon points="56,0 98,0 112,112 90,128 78,112" fill={`url(#ribbonL-${category}-${tier})`}/>
            <polygon points="102,0 144,0 122,112 110,128 88,112" fill={`url(#ribbonR-${category}-${tier})`}/>
            <polygon points="92,118 108,118 100,134" fill="#5e0a04"/>
          </svg>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <StarBadge category={category} tier={tier} size={148}/>
          </div>
        </div>

        {/* Headline */}
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <h1 style={{
            fontSize: 34, fontWeight: 700, color: '#0f0f13',
            letterSpacing: '-1.1px', lineHeight: 1,
          }}>
            Congratulations!
          </h1>
          <p style={{
            fontSize: 15, color: '#6a6a78',
            marginTop: 10, fontWeight: 500,
            letterSpacing: '-0.1px',
          }}>
            You&rsquo;ve reached {fmtNum(tier)} {verbLabel}
          </p>
        </div>

        {/* Hero stat */}
        <div style={{ textAlign: 'center', marginTop: 30 }}>
          <p style={{
            fontSize: 84, fontWeight: 700, color: cat.h2,
            letterSpacing: '-3px', lineHeight: 0.95,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {fmtNum(tier)}
          </p>
          <p style={{
            fontSize: 13, fontWeight: 700,
            color: cat.h2,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            marginTop: 12,
          }}>
            {title}
          </p>
        </div>

        {/* Date ribbon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}>
          <div style={{
            position: 'relative',
            background: 'linear-gradient(180deg, #ff4a3f 0%, #e5251b 100%)',
            color: '#ffffff',
            fontSize: 14, fontWeight: 600,
            letterSpacing: '-0.1px',
            padding: '11px 32px',
            boxShadow: '0 3px 10px rgba(229,37,27,0.28)',
            clipPath: 'polygon(0 0, 100% 0, 96% 50%, 100% 100%, 0 100%, 4% 50%)',
          }}>
            Achieved {dateStr}
          </div>
        </div>

        {/* Channel identity */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginTop: 32, gap: 10,
        }}>
          <div style={{ position: 'relative', width: 68, height: 68 }}>
            {channelThumbnail ? (
              <img
                src={channelThumbnail}
                alt=""
                crossOrigin="anonymous"
                style={{
                  width: 68, height: 68, borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #ffffff',
                  boxShadow: '0 0 0 1.5px #e5e5ec, 0 4px 14px rgba(0,0,0,0.12)',
                }}
              />
            ) : (
              <div style={{
                width: 68, height: 68, borderRadius: '50%',
                background: '#ff3b30', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 700,
                border: '3px solid #ffffff',
                boxShadow: '0 0 0 1.5px #e5e5ec, 0 4px 14px rgba(0,0,0,0.12)',
              }}>
                {initial}
              </div>
            )}
            {/* YouTube badge on avatar */}
            <div style={{
              position: 'absolute', bottom: -2, right: -2,
              width: 26, height: 26, borderRadius: 7,
              background: '#ff3b30',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          <p style={{
            fontSize: 17, fontWeight: 700, color: '#0f0f13',
            letterSpacing: '-0.3px',
          }}>
            {channelName || 'Your Channel'}
          </p>
        </div>

        {/* Footer watermark */}
        <div style={{
          marginTop: 30, paddingTop: 20,
          borderTop: '1px solid #ececf2',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <span style={{
            fontSize: 13, fontWeight: 700, color: '#0f0f13',
            letterSpacing: '-0.2px',
          }}>
            YTGrowth.io
          </span>
          <span style={{ color: '#c8c8d0', fontSize: 14 }}>·</span>
          <span style={{
            fontSize: 12, fontWeight: 600, color: '#6a6a78',
            letterSpacing: '0.02em',
          }}>
            YouTube Growth Analytics
          </span>
        </div>
      </div>
    </div>
  )
})

/* ─── Share modal: preview + download PNG + share on X ─────────────────── */
export function MilestoneShareModal({ milestone, channelName, channelThumbnail, onClose }) {
  const cardRef = useRef(null)
  const [downloading, setDownloading] = useState(false)

  if (!milestone) return null

  const handleDownload = async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      })
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `ytgrowth-milestone-${milestone.category}-${milestone.tier}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (e) {
      console.error('[share] download error:', e)
      alert('Could not generate image. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const handleShareX = () => {
    const text = `I just hit ${fmtNum(milestone.tier)} ${MILESTONE_VERB[milestone.category]} on YouTube! 🎉\n\nTracked with YTGrowth.io`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(8,8,14,0.78)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, overflowY: 'auto',
        animation: 'fadeUp 0.22s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          maxWidth: 640, width: '100%',
        }}
      >
        {/* Scaled-down preview on small screens, full-size otherwise */}
        <div style={{
          transform: 'scale(var(--ytg-share-scale, 1))',
          transformOrigin: 'top center',
        }}>
          <MilestoneShareCard
            ref={cardRef}
            category={milestone.category}
            tier={milestone.tier}
            achievedAt={milestone.achieved_at}
            channelName={channelName}
            channelThumbnail={channelThumbnail}
          />
        </div>

        {/* Action row */}
        <div style={{
          display: 'flex', gap: 8, marginTop: 6,
          background: 'rgba(255,255,255,0.06)',
          padding: 6, borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.12)',
        }}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'linear-gradient(180deg, #ffffff 0%, #f1f1f6 100%)',
              color: '#0f0f13',
              fontSize: 13, fontWeight: 600,
              padding: '9px 18px', borderRadius: 999,
              border: 'none', cursor: downloading ? 'wait' : 'pointer',
              opacity: downloading ? 0.7 : 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.9)',
              letterSpacing: '-0.1px',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={(e) => { if (!downloading) e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {downloading ? 'Preparing…' : 'Download PNG'}
          </button>
          <button
            onClick={handleShareX}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'linear-gradient(180deg, #1a1a22 0%, #0a0a0f 100%)',
              color: '#ffffff',
              fontSize: 13, fontWeight: 600,
              padding: '9px 18px', borderRadius: 999,
              border: '1px solid #2a2a33', cursor: 'pointer',
              letterSpacing: '-0.1px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Share on X
          </button>
          <button
            onClick={onClose}
            style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'transparent', color: '#ffffff',
              fontSize: 13, fontWeight: 600,
              padding: '9px 16px', borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.28)', cursor: 'pointer',
              letterSpacing: '-0.1px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Confetti burst (CSS, no deps) ───────────────────────────────────── */
export function ConfettiBurst({ count = 180 }) {
  const pieces = useRef(null)
  if (pieces.current === null) {
    pieces.current = Array.from({ length: count }, () => {
      const shape = Math.random()
      const isRound  = shape < 0.28
      const isRibbon = !isRound && shape < 0.55
      const w = 5 + Math.random() * 7
      return {
        left:     Math.random() * 100,
        cx:       (Math.random() - 0.5) * 60,
        cr:       (Math.random() * 900 + 240) * (Math.random() < 0.5 ? -1 : 1),
        delay:    Math.random() * 2.8,
        duration: 4.8 + Math.random() * 4.2,
        w:        isRibbon ? w * 0.55 : w,
        h:        isRibbon ? w * 3.2  : (isRound ? w : w * 1.6),
        color:    CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        round:    isRound,
      }
    })
  }
  return (
    <div aria-hidden="true" style={{
      position: 'fixed', inset: 0, pointerEvents: 'none',
      overflow: 'hidden', zIndex: 1,
    }}>
      {pieces.current.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: 0, left: `${p.left}vw`,
          width: p.w, height: p.h,
          background: p.color,
          borderRadius: p.round ? '50%' : 1.5,
          boxShadow: `0 0 6px ${p.color}50`,
          animation: `confettiFall ${p.duration}s cubic-bezier(0.22,0.7,0.32,1) ${p.delay}s both`,
          '--cx': `${p.cx}vw`,
          '--cr': `${p.cr}deg`,
        }}/>
      ))}
    </div>
  )
}

/* ─── Milestone unlocked celebration modal ────────────────────────────── */
export function MilestoneCelebrationModal({ milestone, channelName, channelThumbnail, onShare, onClose }) {
  if (!milestone) return null
  const cat = CATEGORY_GRADIENT[milestone.category] || CATEGORY_GRADIENT.subs

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(8,8,14,0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, overflowY: 'auto',
        animation: 'fadeUp 0.22s ease-out',
      }}
    >
      <ConfettiBurst />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22,
          maxWidth: 640, width: '100%',
          animation: 'popIn 0.55s cubic-bezier(0.22,1.3,0.36,1)',
        }}
      >
        {/* Eyebrow — category-tinted pill with star */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 14px 5px 11px', borderRadius: 999,
          background: `linear-gradient(90deg, ${cat.h2}33 0%, ${cat.h2}1a 100%)`,
          border: `1px solid ${cat.h2}55`,
          color: '#ffffff', fontSize: 10.5, fontWeight: 700,
          letterSpacing: '0.26em', textTransform: 'uppercase',
          boxShadow: `0 0 20px ${cat.h2}30`,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill={cat.h2} stroke={cat.h2} strokeWidth="1" strokeLinejoin="round">
            <polygon points="12,2 14.9,8.7 22,9.6 16.8,14.6 18.2,21.6 12,18.1 5.8,21.6 7.2,14.6 2,9.6 9.1,8.7"/>
          </svg>
          Milestone Unlocked
        </div>

        <MilestoneShareCard
          category={milestone.category}
          tier={milestone.tier}
          achievedAt={milestone.achieved_at}
          channelName={channelName}
          channelThumbnail={channelThumbnail}
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 2 }}>
          <button
            onClick={onShare}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: `linear-gradient(180deg, ${cat.h2} 0%, ${cat.h3} 100%)`,
              color: '#ffffff',
              fontSize: 13.5, fontWeight: 600,
              padding: '11px 22px', borderRadius: 999,
              border: 'none', cursor: 'pointer',
              letterSpacing: '-0.1px',
              boxShadow: `0 6px 18px ${cat.h2}55, inset 0 1px 0 rgba(255,255,255,0.22)`,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1.5px)'; e.currentTarget.style.boxShadow = `0 10px 24px ${cat.h2}70, inset 0 1px 0 rgba(255,255,255,0.22)` }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 18px ${cat.h2}55, inset 0 1px 0 rgba(255,255,255,0.22)` }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share milestone
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', color: '#ffffff',
              fontSize: 13, fontWeight: 600,
              padding: '11px 18px', borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.28)', cursor: 'pointer',
              letterSpacing: '-0.1px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export function MilestoneIcon({ category, color = '#4a4a58', size = 26 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (category === 'subs') return (
    <svg {...p}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
  if (category === 'views') return (
    <svg {...p}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
  if (category === 'watch_hours') return (
    <svg {...p}>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
  if (category === 'uploads') return (
    <svg {...p}>
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  )
  return null
}
