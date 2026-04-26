import { useEffect, useState, useRef, forwardRef } from 'react'
import Competitors from './Competitors'
import Settings from './Settings'
import SeoOptimizer from './SeoOptimizer'
import VideoOptimizePanel from './VideoOptimizePanel'
import Keywords from './Keywords'
import VideoIdeas from './VideoIdeas'
import ThumbnailScore from './ThumbnailScore'
import Outliers from './Outliers'
import Autopsy from './Autopsy'
import WeeklyReport from './WeeklyReport'
import UsageBar from '../components/UsageBar'
import CreditsEmptyModal from '../components/CreditsEmptyModal'
import WelcomeModal from '../components/WelcomeModal'

/* ─── Inject font + global styles once ─────────────────────────────────── */
function useDashboardStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-dash-styles')) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytg-dash-styles'
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { background: #f5f5f9; color: #0f0f13; font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }

      @keyframes spin    { to { transform: rotate(360deg) } }
      @keyframes fadeUp  { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
      @keyframes pulse   { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }
      @keyframes confettiFall {
        0%   { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 1; }
        85%  { opacity: 1; }
        100% { transform: translate3d(var(--cx, 0), 110vh, 0) rotate(var(--cr, 540deg)); opacity: 0; }
      }
      @keyframes popIn {
        0%   { opacity: 0; transform: scale(0.86); }
        60%  { opacity: 1; transform: scale(1.02); }
        100% { opacity: 1; transform: scale(1); }
      }

      ::-webkit-scrollbar       { width: 4px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background: #e0e0e6; border-radius: 4px }
      ::-webkit-scrollbar-thumb:hover { background: #c8c8d0 }

      .ytg-stat-card {
        background: #ffffff;
        border: 1px solid #e6e6ec;
        border-radius: 16px;
        padding: 22px 24px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06);
        transition: box-shadow 0.2s, transform 0.2s;
        cursor: default;
      }
      .ytg-stat-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.09);
        transform: translateY(-2px);
      }
      .ytg-stat-card.alert {
        border-color: rgba(229,37,27,0.22);
        background: #fff8f8;
      }

      .ytg-card {
        background: #ffffff;
        border: 1px solid #e6e6ec;
        border-radius: 16px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06);
        transition: box-shadow 0.2s, transform 0.2s;
      }
      .ytg-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.09);
        transform: translateY(-1px);
      }

      .ytg-nav-btn {
        display: flex; align-items: center; gap: 10px;
        padding: 9px 13px; border-radius: 100px; cursor: pointer; text-align: left;
        font-size: 13.5px; font-family: 'Inter', system-ui, sans-serif;
        color: #4a4a58;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
        border: 1px solid transparent;
        box-shadow: none; outline: none; -webkit-appearance: none;
      }
      .ytg-nav-btn:hover:not(.active) {
        background: #f4f4f8; color: #0f0f13;
      }

      .ytg-video-row { transition: background 0.15s; }
      .ytg-video-row:hover { background: #f4f4f7 !important; }

      .ytg-insight-card {
        background: #ffffff;
        border: 1px solid #e6e6ec;
        border-radius: 14px;
        overflow: hidden;
        margin-bottom: 8px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06);
        transition: box-shadow 0.2s, transform 0.2s;
      }
      .ytg-insight-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.09);
        transform: translateY(-1px);
      }
      .ytg-inner-block {
        background: #f8f8fb;
        border: 1px solid #eeeef3;
        border-radius: 10px;
        padding: 10px 12px;
      }
      .ytg-insight-card.done {
        opacity: 0.48;
      }
      .ytg-qw-row {
        display: flex; gap: 9px; align-items: flex-start;
        padding: 9px 11px; border-radius: 10px;
        border: 1px solid transparent;
        transition: background 0.15s, border-color 0.15s;
      }
      .ytg-qw-row:hover {
        background: #f4f4f7; border-color: rgba(0,0,0,0.07);
      }
      .ytg-del-btn {
        width: 22px; height: 22px; border-radius: 6px;
        background: #fee2e2; border: 1px solid #fecaca;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; flex-shrink: 0; transition: background 0.15s;
      }
      .ytg-del-btn:hover { background: #fecaca; }

      .ytg-dash-btn {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 9px 20px; border-radius: 100px; border: 1px solid rgba(0,0,0,0.1);
        font-family: 'Inter', system-ui, sans-serif; font-size: 12.5px; font-weight: 600;
        background: #fff; color: #52525b; cursor: pointer;
        box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
        transition: all 0.18s;
      }
      .ytg-dash-btn:hover {
        border-color: rgba(0,0,0,0.18); color: #111114;
        box-shadow: 0 2px 8px rgba(0,0,0,0.10), 0 8px 28px rgba(0,0,0,0.10);
        transform: translateY(-1px);
      }
      .ytg-dash-btn-primary {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 9px 20px; border-radius: 100px; border: none;
        font-family: 'Inter', system-ui, sans-serif; font-size: 12.5px; font-weight: 700;
        background: #e5251b; color: #fff; cursor: pointer;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32);
        transition: all 0.18s;
      }
      .ytg-dash-btn-primary:hover {
        filter: brightness(1.07); transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,37,27,0.42);
      }
      .ytg-optimise-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 6px 14px; border-radius: 100px;
        border: none;
        font-family: 'Inter', system-ui, sans-serif; font-size: 11.5px; font-weight: 700;
        background: #e5251b;
        color: #fff; cursor: pointer; letter-spacing: 0.01em;
        transition: filter 0.15s;
      }
      .ytg-optimise-btn:hover {
        filter: brightness(1.1);
      }
    `
    document.head.appendChild(style)
  }, [])
}

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const C = {
  red:      '#e5251b',
  redBg:    '#fff5f5',
  redBdr:   '#fecaca',
  green:    '#059669',
  greenBg:  '#ecfdf5',
  greenBdr: '#a7f3d0',
  amber:    '#d97706',
  amberBg:  '#fffbeb',
  amberBdr: '#fde68a',
  text1:    '#0f0f13',
  text2:    '#4a4a58',
  text3:    '#9595a4',
  border:   '#e6e6ec',
  bg:       '#f5f5f9',
  surface:  '#ffffff',
}

const MILESTONE_TIERS = {
  subs:        [100, 500, 1000, 5000, 10000, 50000, 100000, 1000000],
  views:       [10000, 50000, 100000, 1000000, 10000000],
  watch_hours: [100, 1000, 4000, 10000, 100000],
  uploads:     [1, 10, 50, 100],
}

const MILESTONE_PLURAL = {
  subs:        'subscribers',
  views:       'total views',
  watch_hours: 'watch hours',
  uploads:     'videos',
}

// Vivid metallic tier palette — radial gradients give true 3D metallic sheen.
const METAL = {
  bronze:   { highlight: '#ffcfa0', mid: '#e28a3f', deep: '#8b4a13', shadow: '#5c2e08', ribbon: '#6b3712', ink: '#6b3712' },
  silver:   { highlight: '#ffffff', mid: '#c8ccd1', deep: '#6d7378', shadow: '#3a4046', ribbon: '#4a5056', ink: '#3a4046' },
  gold:     { highlight: '#fff2a8', mid: '#f1c61f', deep: '#a07500', shadow: '#5a4100', ribbon: '#7a5700', ink: '#5a4100' },
  platinum: { highlight: '#f8fafc', mid: '#a8b2c4', deep: '#4b5563', shadow: '#252d38', ribbon: '#374151', ink: '#252d38' },
}

function tierMetal(category, tier) {
  const tiers = MILESTONE_TIERS[category] || []
  const idx = tiers.indexOf(tier)
  if (idx < 0) return METAL.bronze
  const pct = tiers.length > 1 ? idx / (tiers.length - 1) : 0
  if (pct < 0.26) return METAL.bronze
  if (pct < 0.51) return METAL.silver
  if (pct < 0.85) return METAL.gold
  return METAL.platinum
}

// Each category has its own vivid gradient so badges are visually distinct at a glance.
const CATEGORY_GRADIENT = {
  subs:        { h1: '#ff8a80', h2: '#e5251b', h3: '#7a0f08', stroke: '#4a0903', ink: '#4a0903' },
  views:       { h1: '#7fb3ff', h2: '#2563eb', h3: '#1e3a8a', stroke: '#172554', ink: '#172554' },
  watch_hours: { h1: '#ffe082', h2: '#eab308', h3: '#8a6400', stroke: '#4a3400', ink: '#4a3400' },
  uploads:     { h1: '#6ee7b7', h2: '#059669', h3: '#064e3b', stroke: '#022c1e', ink: '#022c1e' },
}

function YTGLogo({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="#ff3b30"/>
      <path d="M23.2 11.6a2.1 2.1 0 0 0-1.48-1.48C20.55 9.8 16 9.8 16 9.8s-4.55 0-5.72.32A2.1 2.1 0 0 0 8.8 11.6 22 22 0 0 0 8.5 16a22 22 0 0 0 .3 4.4 2.1 2.1 0 0 0 1.48 1.48C11.45 22.2 16 22.2 16 22.2s4.55 0 5.72-.32a2.1 2.1 0 0 0 1.48-1.48A22 22 0 0 0 23.5 16a22 22 0 0 0-.3-4.4z" fill="white"/>
      <polygon points="13.5,19 19.5,16 13.5,13" fill="#ff3b30"/>
    </svg>
  )
}

function StarBadge({ category, tier, size = 108 }) {
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

function TierRibbon({ tier, metal }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: `linear-gradient(180deg, ${metal.ribbon} 0%, ${metal.shadow} 100%)`,
      color: '#fff',
      fontSize: 12.5, fontWeight: 800,
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
const MILESTONE_TITLE = {
  subs:        'Subscribers',
  views:       'Total Views',
  watch_hours: 'Watch Hours',
}
const MILESTONE_VERB = {
  subs:        'subscribers',
  views:       'total views',
  watch_hours: 'watch hours',
}
function formatAchievedDate(iso) {
  if (!iso) return ''
  const d = parseUTC(iso)
  if (!d || isNaN(d)) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const MilestoneShareCard = forwardRef(function MilestoneShareCard(
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
        fontFamily: "'Inter', system-ui, sans-serif",
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
          fontSize: 22, fontWeight: 800, color: '#ffffff',
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
            fontSize: 34, fontWeight: 900, color: '#0f0f13',
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
            fontSize: 84, fontWeight: 900, color: cat.h2,
            letterSpacing: '-3px', lineHeight: 0.95,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {fmtNum(tier)}
          </p>
          <p style={{
            fontSize: 13, fontWeight: 800,
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
            fontSize: 14, fontWeight: 700,
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
                fontSize: 28, fontWeight: 800,
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
            fontSize: 17, fontWeight: 800, color: '#0f0f13',
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
            fontSize: 13, fontWeight: 800, color: '#0f0f13',
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
function MilestoneShareModal({ milestone, channelName, channelThumbnail, onClose }) {
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
              fontSize: 13, fontWeight: 700,
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
              fontSize: 13, fontWeight: 700,
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
const CONFETTI_COLORS = ['#ff3b30', '#ffd60a', '#30d158', '#0a84ff', '#bf5af2', '#ff9f0a', '#ff2d92', '#64d2ff', '#ffffff']
function ConfettiBurst({ count = 180 }) {
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
function MilestoneCelebrationModal({ milestone, channelName, channelThumbnail, onShare, onClose }) {
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
          color: '#ffffff', fontSize: 10.5, fontWeight: 800,
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
              fontSize: 13.5, fontWeight: 700,
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

function MilestoneIcon({ category, color = '#4a4a58', size = 26 }) {
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

/* Severity palette — 3-color system: red critical, amber warnings, slate minor */
const SEV = {
  critical: { color: '#dc2626', bg: '#fff5f5', bdr: '#fecaca' },
  high:     { color: '#d97706', bg: '#fffbeb', bdr: '#fde68a' },
  medium:   { color: '#d97706', bg: '#fffbeb', bdr: '#fde68a' },
  low:      { color: '#6b7280', bg: '#f9fafb', bdr: '#e5e7eb' },
  info:     { color: '#059669', bg: '#ecfdf5', bdr: '#a7f3d0' },
}
function sev(severity) { return SEV[severity] || SEV.critical }

/* YouTube thumbnail cascade — prefers maxresdefault (1280x720), falls back to
   hqdefault (always present at 480x360), finally to the stored thumbnail URL.
   Also detects YouTube's 120x90 grey placeholder (HTTP 200 — onError never
   fires) via onLoad dimension check so broken thumbs don't render. Identical
   to the Outliers page helpers, kept local here to avoid cross-page imports. */
function ytMaxThumbUrl(videoId) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : null
}
function _advanceThumb(target, videoId, fallbackUrl) {
  const step = target.dataset.thumbStep || 'max'
  if (step === 'max' && videoId) {
    target.dataset.thumbStep = 'hq'
    target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  } else if (step !== 'done' && fallbackUrl) {
    target.dataset.thumbStep = 'done'
    target.src = fallbackUrl
  } else {
    target.onerror = null
  }
}
function makeThumbOnError(videoId, fallbackUrl) {
  return (e) => _advanceThumb(e.target, videoId, fallbackUrl)
}
function makeThumbOnLoad(videoId, fallbackUrl) {
  return (e) => {
    const step = e.target.dataset.thumbStep || 'max'
    if (step === 'max' && e.target.naturalWidth === 120 && e.target.naturalHeight === 90) {
      _advanceThumb(e.target, videoId, fallbackUrl)
    }
  }
}

/* Plan badge helper */
function planBadge(plan) {
  if (!plan || plan === 'free') return { label: 'Free', color: '#6b7280', bg: 'rgba(107,114,128,0.08)', bdr: 'rgba(107,114,128,0.18)' }
  const isLife = plan.startsWith('lifetime_')
  const base   = isLife ? plan.replace('lifetime_', '') : plan
  const label  = base.charAt(0).toUpperCase() + base.slice(1) + (isLife ? ' ∞' : '')
  if (base === 'solo')   return { label, color: '#2563eb', bg: 'rgba(37,99,235,0.07)',   bdr: 'rgba(37,99,235,0.18)' }
  if (base === 'growth') return { label, color: '#059669', bg: 'rgba(5,150,105,0.07)',   bdr: 'rgba(5,150,105,0.18)' }
  if (base === 'agency') return { label, color: '#7c3aed', bg: 'rgba(124,58,237,0.07)', bdr: 'rgba(124,58,237,0.18)' }
  return { label, color: '#6b7280', bg: 'rgba(107,114,128,0.08)', bdr: 'rgba(107,114,128,0.18)' }
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */
function healthScore(insights) {
  let s = 100
  insights.forEach(i => {
    if (i.severity === 'critical') s -= 20
    else if (i.severity === 'high') s -= 10
    else if (i.severity === 'medium') s -= 5
  })
  return Math.max(Math.min(s, 100), 0)
}
/* Normalise backend timestamps — Python omits 'Z'; JS treats no-tz strings as local time */
function parseUTC(str) {
  if (!str) return null
  const s = str.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(str) ? str : str + 'Z'
  return new Date(s)
}
function relTime(str) {
  const d = parseUTC(str)
  if (!d || isNaN(d)) return ''
  const diff = Math.round((Date.now() - d.getTime()) / 60000)
  if (diff < 1)  return 'just now'
  if (diff < 60) return `${diff}m ago`
  const h = Math.round(diff / 60)
  if (h < 24)   return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

function relTimeLong(str) {
  const d = parseUTC(str)
  if (!d || isNaN(d)) return ''
  const days = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (days < 1)   return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7)   return `${days} days ago`
  if (days < 30)  { const w = Math.floor(days / 7); return w === 1 ? 'a week ago' : `${w} weeks ago` }
  if (days < 365) { const m = Math.floor(days / 30); return m === 1 ? 'a month ago' : `${m} months ago` }
  const y = Math.floor(days / 365)
  return y === 1 ? 'a year ago' : `${y} years ago`
}

function scoreColor(s)  { return s >= 75 ? C.green : s >= 50 ? C.amber : C.red }
function scoreLabel(s)  { return s >= 75 ? 'Healthy' : s >= 50 ? 'Needs work' : 'Critical' }
function fmtSecs(s)     { return `${Math.floor(s / 60)}m ${s % 60}s` }
function fmtNum(n)      {
  if (n == null) return '—'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toLocaleString()
}

/* ─── Logo (matches landing page) ──────────────────────────────────────── */
function Logo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <rect width="26" height="26" rx="7" fill={C.red}/>
      <path d="M18.5 10.2a1.6 1.6 0 0 0-1.12-1.12C16.4 8.8 13 8.8 13 8.8s-3.4 0-4.38.3A1.6 1.6 0 0 0 7.5 10.2 17 17 0 0 0 7.2 13a17 17 0 0 0 .3 2.8 1.6 1.6 0 0 0 1.12 1.12C9.6 17.2 13 17.2 13 17.2s3.4 0 4.38-.3a1.6 1.6 0 0 0 1.12-1.12A17 17 0 0 0 18.8 13a17 17 0 0 0-.3-2.8z" fill="white"/>
      <polygon points="11.2,16 16,13 11.2,10" fill={C.red}/>
    </svg>
  )
}

/* ─── Score ring ────────────────────────────────────────────────────────── */
function ScoreRing({ score }) {
  const r = 42, cx = 54, cy = 54
  const circ = 2 * Math.PI * r
  const dash  = (score / 100) * circ
  const col   = scoreColor(score)
  return (
    <svg width="108" height="108" viewBox="0 0 108 108">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ebebed" strokeWidth="7"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth="7"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fill={col}
        fontSize="24" fontWeight="800" fontFamily="Inter, sans-serif"
        style={{ fontVariantNumeric: 'tabular-nums' }}>{score}</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fill={C.text3}
        fontSize="10" fontFamily="Inter, sans-serif">{scoreLabel(score)}</text>
    </svg>
  )
}

/* ─── Mini bar sparkline ────────────────────────────────────────────────── */
function MiniBar({ videos }) {
  if (!videos?.length) return null
  const items = [...videos].slice(0, 12).reverse()
  const max   = Math.max(...items.map(v => v.views), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
      {items.map((v, i) => (
        <div key={i} title={v.title} style={{
          flex: 1, minWidth: 4,
          background: C.red,
          opacity: 0.18 + 0.82 * (v.views / max),
          borderRadius: '3px 3px 0 0',
          height: `${Math.max(5, (v.views / max) * 100)}%`,
          transition: 'opacity 0.15s', cursor: 'default',
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity = 1 }}
          onMouseLeave={e => { e.currentTarget.style.opacity = 0.18 + 0.82 * (v.views / max) }}
        />
      ))}
    </div>
  )
}

/* ─── Stat card ─────────────────────────────────────────────────────────── */
function Stat({ label, value, sub, alert, accent }) {
  const col = alert ? C.red : (accent || C.text1)
  return (
    <div className={`ytg-stat-card${alert ? ' alert' : ''}`}>
      <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.text3, marginBottom: 12 }}>{label}</p>
      <p style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-1.4px', color: col, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: alert ? C.red : C.text3, fontWeight: 500, marginTop: 10 }}>{sub}</p>}
    </div>
  )
}

/* ─── Insight card ──────────────────────────────────────────────────────── */
function categoryToNav(category, problem) {
  const c = (category || '').toLowerCase()
  const p = (problem || '').toLowerCase()
  if (c.includes('thumbnail') || p.includes('thumbnail')) return 'Thumbnail Score'
  if (c.includes('competitor') || p.includes('competitor')) return 'Competitors'
  if (c.includes('keyword') || p.includes('keyword')) return 'Keywords'
  if (c.includes('content') || c.includes('posting') || c.includes('frequency') || p.includes('content strategy') || p.includes('video idea')) return 'Video Ideas'
  if (c.includes('seo') || c.includes('ctr') || p.includes('title') || p.includes('description') || p.includes('tag')) return 'SEO Studio'
  return 'SEO Studio'
}

function InsightCard({ insight, index, checked, onToggle, onDelete, onNavigate }) {
  const { color } = sev(insight.impact || insight.severity)
  return (
    <div className={`ytg-insight-card${checked ? ' done' : ''}`} style={{
      transition: 'opacity 0.2s', marginBottom: 10,
      borderTop: `3px solid ${checked ? C.border : color}`,
    }}>
      <div style={{ padding: '16px 22px 18px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: checked ? 0 : 14 }}>

          {/* Checkbox + solid rank badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingTop: 2 }}>
            <input
              type="checkbox"
              checked={!!checked}
              onChange={onToggle}
              style={{ width: 15, height: 15, accentColor: C.green, cursor: 'pointer', flexShrink: 0 }}
            />
            <div style={{ width: 26, height: 26, borderRadius: 8, background: checked ? C.greenBg : color, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {checked
                ? <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5,6.5 5,10 10.5,2"/></svg>
                : <span style={{ fontSize: 12, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{insight.rank ?? index + 1}</span>
              }
            </div>
          </div>

          {/* Category label above problem */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {insight.category && (
              <p style={{ fontSize: 10, fontWeight: 700, color: checked ? C.text3 : color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>{insight.category}</p>
            )}
            <p style={{ fontSize: 14, fontWeight: 700, color: checked ? C.text3 : C.text1, lineHeight: 1.55, textDecoration: checked ? 'line-through' : 'none' }}>{insight.problem}</p>
          </div>

          {/* Severity badge + delete */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color, padding: '3px 9px', borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase', border: `1.5px solid ${color}` }}>
              {insight.impact || insight.severity || 'issue'}
            </span>
            {checked && onDelete && (
              <button className="ytg-del-btn" onClick={onDelete} title="Remove task">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#e5251b" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Divider between header and body */}
        {!checked && <div style={{ height: 1, background: C.border, marginBottom: 14, marginLeft: 46 }} />}

        {/* ── Body — hidden when done ── */}
        {!checked && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 8, marginLeft: 46 }}>

            {/* Why now */}
            <div style={{ background: 'rgba(79,134,247,0.07)', border: '1px solid rgba(79,134,247,0.12)', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#4a7cf7', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Why now</p>
              <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.72 }}>{insight.whyNow || insight.cause}</p>
            </div>

            {/* Action */}
            <div style={{
              background: '#ffffff',
              border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${color}`,
              borderRadius: '0 10px 10px 0',
              padding: '12px 16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              display: 'flex', flexDirection: 'column',
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Action</p>
              <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.72 }}>{insight.action}</p>
            </div>

            {/* Expected outcome */}
            {insight.expectedOutcome
              ? <div style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.14)', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Expected outcome</p>
                  <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.72 }}>{insight.expectedOutcome}</p>
                </div>
              : <div />
            }

          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Nav icons ─────────────────────────────────────────────────────────── */
const NAV_ICONS = {
  Overview:          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="1" y="1" width="5" height="5" rx="1.5"/><rect x="8" y="1" width="5" height="5" rx="1.5"/><rect x="1" y="8" width="5" height="5" rx="1.5"/><rect x="8" y="8" width="5" height="5" rx="1.5"/></svg>,
  Videos:            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="9" height="8" rx="1.5"/><path d="M10 5.5l3.5-2v7L10 8.5"/></svg>,
  Outliers:          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 10.5l3.2-3.2 2.3 2.3L12 5"/><path d="M8.5 5H12v3.5"/></svg>,
  'SEO Studio':      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 11V8M5 11V6M8 11V4M11 11V2"/></svg>,
  'Thumbnail Score': <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="12" height="8" rx="1.5"/><path d="M5 6l2 2 4-3"/></svg>,
  'Video Ideas':     <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="7" cy="6" r="4"/><path d="M5 10.5h4M7 10.5v2.5"/><path d="M5.5 5.5l1.5 1 1.5-1"/></svg>,
  Keywords:          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="6" cy="6" r="4"/><line x1="9.2" y1="9.2" x2="13" y2="13"/></svg>,
  Competitors:       <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="5" cy="7" r="4"/><circle cx="9" cy="7" r="4"/></svg>,
  'Weekly Report':   <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="2" width="12" height="10" rx="2"/><path d="M1 6h12M4 2v4M10 2v4"/></svg>,
  'Post-Publish Review': <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.8" cy="5.8" r="3.8"/><path d="M8.6 8.6l3.4 3.4"/><path d="M4.7 4.3l2.4 1.5-2.4 1.5z"/></svg>,
  Settings:          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="6.5" cy="6.5" r="1.8"/><path d="M6.5 1v1.2M6.5 10.8V12M1 6.5h1.2M10.8 6.5H12M2.8 2.8l.85.85M9.35 9.35l.85.85M2.8 10.2l.85-.85M9.35 4.65l.85-.85"/></svg>,
}

function NavBtn({ label, active, onClick, badge }) {
  return (
    <button
      className={`ytg-nav-btn${active ? ' active' : ''}`}
      onClick={onClick}
      style={{
        margin: '2px 12px',
        width: 'calc(100% - 24px)',
        background: active ? 'rgba(15,15,19,0.07)' : 'transparent',
        color: active ? C.text1 : C.text2,
        fontWeight: active ? 600 : 400,
        letterSpacing: '-0.1px',
        border: active ? '1px solid rgba(0,0,0,0.09)' : '1px solid transparent',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.color = C.text1 } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.color = C.text2 } }}
    >
      <span style={{ display: 'flex', flexShrink: 0, color: active ? C.text1 : '#c0c0cc' }}>{NAV_ICONS[label]}</span>
      <span style={{ flex: 1, letterSpacing: '-0.1px' }}>{label}</span>
      {badge > 0 && (
        <span style={{ background: C.amberBg, color: C.amber, border: `1px solid ${C.amberBdr}`, fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 20, minWidth: 18, textAlign: 'center' }}>{badge}</span>
      )}
    </button>
  )
}

/* ─── Channel switcher dropdown ─────────────────────────────────────────── */
function ChannelSwitcher({ channels, channelsAllowed, canAddMore, currentChannelId }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = channels.find(c => c.is_current) || channels[0]

  function scoreColor(s) { return s >= 75 ? '#16a34a' : s >= 50 ? '#d97706' : '#e5251b' }

  function doSwitch(channelId) {
    setOpen(false)
    fetch('/channels/switch', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_id: channelId }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) window.location.reload()
        else if (d.needs_auth) window.location.href = '/auth/login'
      })
  }

  function fmtSubs(n) {
    if (!n) return '0'
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
    return n.toLocaleString()
  }

  if (!current) return null

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        {current.channel_thumbnail
          ? <img src={current.channel_thumbnail} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1.5px solid rgba(0,0,0,0.08)' }} />
          : <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#e5251b', flexShrink: 0 }}>{(current.channel_name || '?')[0].toUpperCase()}</div>
        }
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#111114', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.2px' }}>{current.channel_name}</p>
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{fmtSubs(current.subscribers)} subscribers</p>
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="2,4 6,8 10,4" />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          background: '#ffffff',
          border: '0.5px solid rgba(0,0,0,0.1)',
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          padding: 6,
          zIndex: 100,
        }}>
          {channels.map(ch => (
            <div
              key={ch.channel_id}
              onClick={() => !ch.is_current && doSwitch(ch.channel_id)}
              style={{
                padding: '8px 10px', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 10,
                cursor: ch.is_current ? 'default' : 'pointer',
                background: 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!ch.is_current) e.currentTarget.style.background = '#f9fafb' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {ch.channel_thumbnail
                ? <img src={ch.channel_thumbnail} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#e5251b', flexShrink: 0 }}>{(ch.channel_name || '?')[0].toUpperCase()}</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#111114', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.channel_name}</p>
                <p style={{ fontSize: 12, color: '#9ca3af' }}>{fmtSubs(ch.subscribers)} subscribers</p>
              </div>
              {ch.is_current
                ? <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
                : ch.channel_score > 0
                  ? <span style={{ fontSize: 12, fontWeight: 500, color: scoreColor(ch.channel_score), background: '#f9fafb', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: '2px 7px', flexShrink: 0 }}>{ch.channel_score}</span>
                  : null
              }
            </div>
          ))}

          <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.06)', margin: '4px 4px' }} />

          {canAddMore
            ? <div
                onClick={() => { setOpen(false); window.location.href = '/auth/login' }}
                style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 14, color: '#e5251b', fontWeight: 500 }}>+ Connect another channel</span>
              </div>
            : <div
                onClick={() => { setOpen(false); window.location.href = '/#pricing' }}
                style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 14, color: '#9ca3af' }}>Upgrade to connect more channels</span>
              </div>
          }
        </div>
      )}
    </div>
  )
}

/* ─── First-time welcome banner ─────────────────────────────────────────── */
function FirstTimeWelcome({ data, onDismiss, onNavigate }) {
  const channelId = data?.channel?.channel_id
  if (!data?.insights || !channelId) return null
  if (localStorage.getItem(`ytg_welcomed_${channelId}`) === '1') return null

  const score = data.insights.channelScore ?? 0
  const top   = data.insights.priorityActions?.[0]
  const s     = top ? sev(top.impact) : null

  const scores = data.insights.categoryScores || {}
  const weakest = Object.entries(scores).sort((a, b) => a[1] - b[1])[0]?.[0] || ''

  let ctaLabel, ctaNav
  if (weakest.toLowerCase().includes('ctr') || weakest.toLowerCase().includes('seo')) {
    ctaLabel = 'Fix your titles →'
    ctaNav   = 'SEO Studio'
  } else if (weakest.toLowerCase().includes('content') || weakest.toLowerCase().includes('posting')) {
    ctaLabel = 'Get video ideas →'
    ctaNav   = 'Video Ideas'
  } else if (data.insights.competitorBenchmark === null) {
    ctaLabel = 'Analyse a competitor →'
    ctaNav   = 'Competitors'
  } else {
    ctaLabel = 'Score your thumbnail →'
    ctaNav   = 'Thumbnail Score'
  }

  function dismiss() {
    localStorage.setItem(`ytg_welcomed_${channelId}`, '1')
    onDismiss()
  }

  return (
    <div style={{
      position: 'relative',
      marginBottom: 20,
      background: '#ffffff',
      border: '1px solid rgba(0,0,0,0.09)',
      borderRadius: 20,
      boxShadow: '0 2px 6px rgba(0,0,0,0.08), 0 12px 40px rgba(0,0,0,0.10)',
      padding: '24px 28px',
      animation: 'fadeUp 0.3s ease',
    }}>
      {/* Dismiss button */}
      <button
        onClick={dismiss}
        style={{
          position: 'absolute', top: 16, right: 16,
          width: 24, height: 24, borderRadius: 8,
          background: 'rgba(0,0,0,0.05)', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round">
          <line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/>
        </svg>
      </button>

      <div style={{ display: 'flex', gap: 28, alignItems: 'stretch' }}>

        {/* LEFT — score */}
        <div style={{ flex: '0 0 auto', width: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, flexShrink: 0, animation: 'pulse 2s infinite' }}/>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your audit is ready</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, lineHeight: 1 }}>
            <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1, color: scoreColor(score), fontVariantNumeric: 'tabular-nums' }}>{score}</span>
            <span style={{ fontSize: 16, color: '#a0a0b0', fontWeight: 400, paddingBottom: 8 }}>/100</span>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: scoreColor(score), marginTop: 4 }}>{scoreLabel(score)}</p>
          {data.insights.channelSummary && (
            <p style={{
              fontSize: 12, color: '#52525b', lineHeight: 1.7, marginTop: 10,
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>{data.insights.channelSummary}</p>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: 'rgba(0,0,0,0.07)', alignSelf: 'stretch', flexShrink: 0 }}/>

        {/* CENTER — top priority */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Your #1 priority right now</p>
          {top && s ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 3 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111114', lineHeight: 1.4, flex: 1 }}>{top.problem}</p>
                <span style={{ background: s.bg, color: s.color, fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.07em', border: `1px solid ${s.bdr}` }}>{top.impact}</span>
              </div>
              {top.category && <p style={{ fontSize: 12, color: '#a0a0b0', marginTop: 3, marginBottom: 10 }}>{top.category}</p>}
              <div style={{ background: 'rgba(79,134,247,0.07)', border: `1px solid rgba(79,134,247,0.12)`, borderLeft: `3px solid ${s.color}`, borderRadius: '0 10px 10px 0', padding: '12px 15px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: s.color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Action</p>
                <p style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.72 }}>{top.action}</p>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 14, color: '#a0a0b0' }}>No priority actions found.</p>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: 'rgba(0,0,0,0.07)', alignSelf: 'stretch', flexShrink: 0 }}/>

        {/* RIGHT — CTA */}
        <div style={{ flex: '0 0 auto', width: 190, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Start here</p>
          <button
            className="ytg-dash-btn-primary"
            onClick={() => { onNavigate(ctaNav); dismiss() }}
            style={{ width: '100%', justifyContent: 'center', fontSize: 14 }}
          >
            {ctaLabel}
          </button>
          <button
            onClick={dismiss}
            style={{
              fontSize: 12, color: '#9ca3af', textAlign: 'center',
              cursor: 'pointer', background: 'none', border: 'none',
              fontFamily: 'inherit', textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            See full audit
          </button>
        </div>

      </div>
    </div>
  )
}

/* ─── Dashboard ─────────────────────────────────────────────────────────── */
export default function Dashboard() {
  useDashboardStyles()

  const [data,    setData]   = useState(null)
  const [videos,       setVideos]       = useState(null)
  const [videoSort,    setVideoSort]    = useState('date')   // 'date' | 'views' | 'likes'
  const [videoFlash,   setVideoFlash]   = useState(null)     // 'ok' | 'err' | null
  const [error,   setError]  = useState(null)
  const [loading, setLoad]   = useState(true)
  const [nav,     setNav]    = useState('Overview')
  const [selectedVideoId, setSelectedVideoId] = useState(null)
  const [analyzingAI, setAnalyzingAI] = useState(false)
  const [reAuditError, setReAuditError] = useState('')
  const [refreshingStats, setRefreshingStats] = useState(false)
  const [creditsOut, setCreditsOut] = useState(false)
  const [checked,  setChecked]  = useState({})
  const [deleted,  setDeleted]  = useState({})
  const [channels, setChannels] = useState([])
  const [channelsAllowed, setChannelsAllowed] = useState(1)
  const [canAddMore, setCanAddMore] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [billingPlan, setBillingPlan] = useState(null)
  // Free-tier per-feature gate status. Map of feature id → 'allowed' | 'locked' | 'used'.
  // Fetched from /auth/me on mount; empty {} for paid plans. Passed to gated
  // child pages so they can show the upsell modal on first render.
  const [freeTierFeatures, setFreeTierFeatures] = useState({})
  const [prevScore,   setPrevScore]   = useState(null)
  const [statsFlash,  setStatsFlash]  = useState(null)  // 'ok' | 'err' | null
  const [usagePct,    setUsagePct]    = useState(0)
  const [milestones,  setMilestones]  = useState(null)  // { earned: [...], upcoming: [...] }
  const [shareMilestone, setShareMilestone] = useState(null) // { category, tier, achieved_at }
  const [celebrateQueue, setCelebrateQueue] = useState([])   // [{ category, tier, achieved_at }]
  // Result tracking — videos the user optimized via /seo/update-video, fetched when Videos tab opens
  const [optimizations, setOptimizations] = useState([])

  useEffect(() => {
    fetch('/auth/data', { credentials: 'include' })
      .then(r => {
        // Auth expired — bounce to login rather than showing a broken dashboard.
        if (r.status === 401) { window.location = '/'; throw new Error('Auth expired') }
        if (!r.ok) throw new Error('No data')
        return r.json()
      })
      .then(d => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setVideos(d.videos || [])
        setLoad(false)
        if (d.insights === null) setAnalyzingAI(true)
        if (d.insights && d.channel?.channel_id) {
          const wKey = `ytg_welcomed_${d.channel.channel_id}`
          if (!localStorage.getItem(wKey)) setShowWelcome(true)
        }
        if (d.channel?.channel_id) {
          const saved = localStorage.getItem(`ytg_checked_${d.channel.channel_id}`)
          if (saved) setChecked(JSON.parse(saved))
          const savedDel = localStorage.getItem(`ytg_deleted_${d.channel.channel_id}`)
          if (savedDel) setDeleted(JSON.parse(savedDel))
        }
      })
      .catch(e => { setError(e.message); setLoad(false) })

    // Load channel list for switcher
    fetch('/channels/list', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          setChannels(d.channels || [])
          setChannelsAllowed(d.channels_allowed || 1)
          setCanAddMore(d.can_add_more || false)
        }
      })
      .catch(() => {})

    // Load milestones
    fetch('/auth/milestones', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error) setMilestones(d) })
      .catch(() => {})

    // Load plan + per-feature gate state (for free-tier gating on child pages).
    fetch('/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        if (d.plan) setBillingPlan(d.plan)
        setFreeTierFeatures(d.free_tier_features || {})
      })
      .catch(() => {})

    // DEV: ?preview_milestone=subs:1000 fires the celebration modal for testing. Safe to remove.
    try {
      const params = new URLSearchParams(window.location.search)
      const raw = params.get('preview_milestone')
      if (raw) {
        const [category, tierStr] = raw.split(':')
        const tier = parseInt(tierStr, 10)
        if (category && !isNaN(tier)) {
          setCelebrateQueue([{ category, tier, achieved_at: new Date().toISOString() }])
        }
        params.delete('preview_milestone')
        const qs = params.toString()
        window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''))
      }
    } catch {}
  }, [])

  // Track score delta across audits
  useEffect(() => {
    if (data?.insights?.channelScore == null || !data?.channel?.channel_id) return
    const key = `ytg_prev_score_${data.channel.channel_id}`
    const stored = localStorage.getItem(key)
    if (stored !== null) setPrevScore(+stored)
    localStorage.setItem(key, data.insights.channelScore)
  }, [data?.insights?.channelScore, data?.channel?.channel_id])

  // Load tracked SEO optimizations for the Videos tab. Refetches on window focus so
  // deltas update when the user returns from YouTube.
  useEffect(() => {
    let cancelled = false
    const load = () => {
      fetch('/seo/optimizations', { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d && !cancelled) setOptimizations(d.optimizations || []) })
        .catch(() => {})
    }
    load()
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => { cancelled = true; window.removeEventListener('focus', onFocus) }
  }, [])

  // Poll for AI analysis completion when insights are still pending
  useEffect(() => {
    if (!analyzingAI) return
    const interval = setInterval(() => {
      fetch('/auth/data', { credentials: 'include' })
        .then(r => r.json())
        .then(d => {
          if (d.insights !== null) {
            setData(d)
            setAnalyzingAI(false)
            clearInterval(interval)
          }
        })
        .catch(() => {})
    }, 4000)
    return () => clearInterval(interval)
  }, [analyzingAI])

  function handleVideoUpdated(videoId, changes) {
    setVideos(prev => prev.map(v => v.video_id === videoId ? { ...v, ...changes } : v))
  }

  function handleToggleCheck(key) {
    const next = { ...checked, [key]: !checked[key] }
    setChecked(next)
    if (data?.channel?.channel_id) {
      localStorage.setItem(`ytg_checked_${data.channel.channel_id}`, JSON.stringify(next))
    }
  }

  function handleDelete(key) {
    const nextDel = { ...deleted, [key]: true }
    const nextChk = { ...checked }
    delete nextChk[key]
    setDeleted(nextDel)
    setChecked(nextChk)
    if (data?.channel?.channel_id) {
      localStorage.setItem(`ytg_deleted_${data.channel.channel_id}`, JSON.stringify(nextDel))
      localStorage.setItem(`ytg_checked_${data.channel.channel_id}`, JSON.stringify(nextChk))
    }
  }

  const score    = data?.insights?.channelScore ?? 0
  const avgViews = data ? Math.round(data.channel.total_views / Math.max(data.channel.video_count, 1)) : 0

  const patterns = data ? (() => {
    const vids = data.videos || []
    const dur  = v => { const m = (v.duration||'').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/); return m ? (+m[1]||0)*3600+(+m[2]||0)*60+(+m[3]||0) : 0 }
    const shorts = vids.filter(v => dur(v) <= 60)
    const longs  = vids.filter(v => dur(v) >  60)
    const avg    = a  => a.length ? Math.round(a.reduce((s,v) => s+v.views, 0) / a.length) : 0
    const totL   = vids.reduce((s,v) => s+v.likes,  0)
    const totV   = vids.reduce((s,v) => s+v.views,  0)
    return {
      shortAvg:    avg(shorts),
      longAvg:     avg(longs),
      shortsCount: shorts.length,
      longsCount:  longs.length,
      likeRate:    totV > 0 ? (totL / totV * 100).toFixed(2) : 0,
      bestVideo:   [...vids].sort((a,b) => b.views-a.views)[0],
      worstVideo:  [...vids].sort((a,b) => a.views-b.views)[0],
    }
  })() : null

  const mainNavItems = [
    { label: 'Overview' },
    { label: 'Videos' },
    { label: 'SEO Studio' },
    { label: 'Keywords' },
    { label: 'Competitors' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", background: C.bg }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════ */}
      <aside style={{
        width: 320, flexShrink: 0,
        background: '#ffffff',
        borderRight: `1px solid ${C.border}`,
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        zIndex: 10,
      }}>

        {/* Brand */}
        <a href="/" style={{ padding: '22px 22px 18px', display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
          <Logo size={26} />
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text1, letterSpacing: '-0.5px', lineHeight: 1 }}>YTGrowth</span>
          {(() => { const pb = planBadge(billingPlan); return (
            <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: pb.color, background: pb.bg, border: `1px solid ${pb.bdr}`, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.07em', textTransform: 'uppercase', flexShrink: 0 }}>{pb.label}</span>
          ) })()}
        </a>

        {/* Channel profile block */}
        {data && (
          <div style={{ padding: '16px 22px 14px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            {/* Avatar + name */}
            {channels.length >= 2
              ? <div style={{ marginBottom: 14 }}>
                  <ChannelSwitcher
                    channels={channels}
                    channelsAllowed={channelsAllowed}
                    canAddMore={canAddMore}
                    currentChannelId={data.channel.channel_id}
                  />
                </div>
              : <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  {data.channel.thumbnail
                    ? <img src={data.channel.thumbnail} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: `0 0 0 2.5px #fff, 0 0 0 4.5px ${scoreColor(score)}, 0 0 14px ${scoreColor(score)}55` }}/>
                    : <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.redBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: C.red, flexShrink: 0, boxShadow: `0 0 0 2.5px #fff, 0 0 0 4.5px ${scoreColor(score)}, 0 0 14px ${scoreColor(score)}55` }}>{data.channel.channel_name[0].toUpperCase()}</div>
                  }
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.2px' }}>{data.channel.channel_name}</p>
                    <p style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>{fmtNum(data.channel.subscribers)} subs</p>
                  </div>
                </div>
            }
            {/* Health score bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.04em' }}>Channel health</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(score), fontVariantNumeric: 'tabular-nums' }}>{score}<span style={{ fontSize: 11, fontWeight: 500, color: C.text3 }}>/100</span></span>
              </div>
              <div style={{ background: '#eeeef3', borderRadius: 99, height: 5, overflow: 'hidden' }}>
                <div style={{ width: `${score}%`, height: '100%', background: scoreColor(score), borderRadius: 99, transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}/>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ overflowY: 'auto', flex: 1, paddingTop: 8, paddingBottom: 8 }}>

          {/* Section: MY CHANNEL */}
          <div style={{ padding: '12px 22px 4px' }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: C.text1, textTransform: 'uppercase', letterSpacing: '0.09em' }}>My Channel</span>
          </div>
          <NavBtn label="Overview"            active={nav === 'Overview'}       onClick={() => setNav('Overview')} />
          <NavBtn label="Videos"              active={nav === 'Videos'}         onClick={() => setNav('Videos')} />
          <NavBtn label="Post-Publish Review" active={nav === 'Autopsy'}        onClick={() => setNav('Autopsy')} />
          <NavBtn label="Weekly Report"       active={nav === 'Weekly Report'}  onClick={() => setNav('Weekly Report')} />

          {/* Section: OPTIMIZE A VIDEO */}
          <div style={{ padding: '20px 22px 4px' }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: C.text1, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Optimize a Video</span>
          </div>
          <NavBtn label="SEO Studio"      active={nav === 'SEO Studio'}      onClick={() => setNav('SEO Studio')} />
          <NavBtn label="Thumbnail Score" active={nav === 'Thumbnail Score'} onClick={() => setNav('Thumbnail Score')} />

          {/* Section: IDEAS & RESEARCH */}
          <div style={{ padding: '20px 22px 4px' }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: C.text1, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Ideas & Research</span>
          </div>
          <NavBtn label="Video Ideas" active={nav === 'Video Ideas'} onClick={() => setNav('Video Ideas')} />
          <NavBtn label="Outliers"    active={nav === 'Outliers'}    onClick={() => setNav('Outliers')} />
          <NavBtn label="Keywords"    active={nav === 'Keywords'}    onClick={() => setNav('Keywords')} />
          <NavBtn label="Competitors" active={nav === 'Competitors'} onClick={() => setNav('Competitors')} />

          <div style={{ height: 1, background: C.border, margin: '16px 20px 8px' }}/>

          <NavBtn label="Settings" active={nav === 'Settings'} onClick={() => setNav('Settings')} />

        </nav>

        {/* Usage bar */}
        {data && (
          <div style={{
            padding: '16px 22px',
            borderTop: `1px solid ${C.border}`,
            flexShrink: 0,
          }}>
            <UsageBar
              channelId={data.channel?.channel_id}
              email={data.channel?.email}
              dark={false}
              onPlan={setBillingPlan}
              onUsage={setUsagePct}
            />
          </div>
        )}

        {/* Footer: Sign Out */}
        <div style={{ padding: '10px 22px 16px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
          <a
            href="/auth/logout"
            style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.text3, fontSize: 13, fontWeight: 500, textDecoration: 'none', padding: '6px 8px', borderRadius: 8, transition: 'color 0.15s, background 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = C.text2; e.currentTarget.style.background = '#f4f4f8' }}
            onMouseLeave={e => { e.currentTarget.style.color = C.text3; e.currentTarget.style.background = 'transparent' }}
          >
            <svg width="14" height="14" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 2H2.5A1 1 0 0 0 1.5 3v7a1 1 0 0 0 1 1H5M9 9.5l3-3-3-3M12 6.5H5"/></svg>
            Sign out
          </a>
        </div>
      </aside>

      {/* ══ MAIN ═════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, overflow: 'auto', background: C.bg }}>

        {/* Topbar */}
        <div style={{
          borderBottom: `1px solid ${C.border}`,
          background: 'rgba(241,241,246,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '0 32px', height: 52,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text1, letterSpacing: '-0.3px' }}>{nav}</span>
            {data && <>
              <span style={{ color: C.border, fontSize: 14 }}>·</span>
              <span style={{ fontSize: 13, fontWeight: 400, color: C.text3, letterSpacing: '-0.1px' }}>{data.channel?.channel_name}</span>
            </>}
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 100, padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }}/>
            <span style={{ fontSize: 12, color: C.text3, fontWeight: 600 }}>Connected</span>
          </div>
        </div>

        {/* Page */}
        <div style={{ padding: '36px 40px 72px', animation: 'fadeUp 0.25s ease' }}>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 14 }}>
              <div style={{ width: 32, height: 32, border: `2.5px solid ${C.border}`, borderTop: `2.5px solid ${C.red}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
              <p style={{ color: C.text3, fontSize: 14, fontWeight: 500 }}>Analyzing your channel…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: C.redBg, border: `1px solid ${C.redBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚠</div>
              <p style={{ fontSize: 18, fontWeight: 700, color: C.text1, letterSpacing: '-0.4px' }}>No channel data</p>
              <p style={{ fontSize: 14, color: C.text2, maxWidth: 280, lineHeight: 1.7 }}>Connect your YouTube channel to see your analytics.</p>
              <a href="/auth/login" className="ytg-dash-btn-primary" style={{ textDecoration: 'none', marginTop: 8 }}>Connect channel →</a>
            </div>
          )}

          {/* ── OVERVIEW ─────────────────────────────────────────────── */}
          {data && nav === 'Overview' && (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 6 }}>
                    Good to see you{data.channel.channel_name ? <>, <span style={{ color: C.red }}>{data.channel.channel_name}</span></> : ''}.</h1>
                  <p style={{ fontSize: 13, color: C.text3, display: 'flex', gap: 0, flexWrap: 'wrap' }}>
                    {data.stats_fetched_at && (
                      <span>Stats from {relTime(data.stats_fetched_at)}</span>
                    )}
                    {data.analyzed_at && (
                      <span style={{ marginLeft: 8 }}>· Audited {relTime(data.analyzed_at)}</span>
                    )}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginBottom: 2 }}>
                  {/* Stale nudge — inline, only when credits available */}
                  {(() => {
                    const auditDate = parseUTC(data.analyzed_at)
                    const daysOld = auditDate ? (Date.now() - auditDate.getTime()) / 86400000 : 0
                    return daysOld > 7 && usagePct < 100 ? (
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.amber }}>Audit may be outdated</span>
                    ) : null
                  })()}

                  {/* Re-Audit */}
                  <button
                    className="ytg-dash-btn-primary"
                    disabled={analyzingAI}
                    onClick={() => {
                      const prevInsights = data?.insights
                      setReAuditError('')
                      setAnalyzingAI(true)
                      setData(prev => ({ ...prev, insights: null }))
                      fetch('/auth/refresh-analysis', { method: 'POST', credentials: 'include' })
                        .then(async r => {
                          if (r.ok) {
                            window.dispatchEvent(new CustomEvent('ytg:credits-changed'))
                            return
                          }
                          // Failure: restore prior insights, surface a clear message
                          setData(prev => ({ ...prev, insights: prevInsights }))
                          setAnalyzingAI(false)
                          if (r.status === 401) {
                            // Auth expired — bounce back to login.
                            window.location = '/'
                            return
                          }
                          if (r.status === 402) { setCreditsOut(true); return }
                          const d = await r.json().catch(() => ({}))
                          setReAuditError(d.error || "Something went wrong on our end. Email support@ytgrowth.io and we'll sort it out.")
                          setTimeout(() => setReAuditError(''), 8000)
                        })
                        .catch(() => {
                          setData(prev => ({ ...prev, insights: prevInsights }))
                          setAnalyzingAI(false)
                          setReAuditError("Couldn't reach our servers. Check your connection and try again.")
                          setTimeout(() => setReAuditError(''), 8000)
                        })
                    }}
                    style={{ opacity: analyzingAI ? 0.65 : 1 }}
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M11.5 2A6 6 0 1 0 12 6.5"/><path d="M11.5 2v3h-3"/>
                    </svg>
                    {analyzingAI ? 'Auditing…' : <><span>Re-Audit</span><span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginLeft: 2 }}>· 1 credit</span></>}
                  </button>

                  {/* Refresh stats — with flash feedback */}
                  <button
                    className="ytg-dash-btn"
                    disabled={refreshingStats}
                    onClick={() => {
                      setRefreshingStats(true)
                      setStatsFlash(null)
                      fetch('/auth/refresh-stats', { method: 'POST', credentials: 'include' })
                        .then(r => r.json())
                        .then(d => {
                          if (!d.error) {
                            setData(prev => ({
                              ...prev,
                              channel: d.channel,
                              videos: d.videos,
                              stats_fetched_at: d.stats_fetched_at,
                            }))
                            setVideos(d.videos || [])
                            setStatsFlash('ok')
                            if (d.new_milestones && d.new_milestones.length > 0) {
                              const nowIso = new Date().toISOString()
                              setCelebrateQueue(d.new_milestones.map(m => ({ ...m, achieved_at: nowIso })))
                              fetch('/auth/milestones', { credentials: 'include' })
                                .then(r => r.ok ? r.json() : null)
                                .then(m => { if (m && !m.error) setMilestones(m) })
                                .catch(() => {})
                            }
                          } else {
                            setStatsFlash('err')
                          }
                        })
                        .catch(() => setStatsFlash('err'))
                        .finally(() => {
                          setRefreshingStats(false)
                          setTimeout(() => setStatsFlash(null), 3000)
                        })
                    }}
                    style={{ position: 'relative' }}
                  >
                    {refreshingStats ? 'Refreshing…'
                      : statsFlash === 'ok'  ? <span style={{ color: C.green }}>Updated ✓</span>
                      : statsFlash === 'err' ? <span style={{ color: C.red }}>Failed ✕</span>
                      : 'Refresh stats'}
                  </button>
                </div>
              </div>

              {/* Re-Audit error message — surfaces backend errors / network drops so the user
                  isn't left wondering why nothing happened after clicking Re-Audit. */}
              {reAuditError && (
                <div style={{
                  marginBottom: 14,
                  display: 'flex', alignItems: 'center', gap: 9,
                  fontSize: 13, color: C.red,
                  background: 'rgba(229,37,27,0.06)',
                  border: '1px solid rgba(229,37,27,0.18)',
                  borderRadius: 9, padding: '9px 13px',
                }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="6.5" cy="6.5" r="5"/><path d="M6.5 4v3M6.5 9v.5"/>
                  </svg>
                  {reAuditError}
                </div>
              )}

              {/* Row 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16, marginBottom: 16 }}>
                <Stat label="Subscribers"  value={fmtNum(data.channel.subscribers)}  sub="All time" />
                <Stat label="Total views"  value={fmtNum(data.channel.total_views)}  sub="All time" />
                <Stat label="Avg views"    value={fmtNum(avgViews)} sub={avgViews < 500 ? 'Below average' : 'On track'} alert={avgViews < 500} />
                <Stat label="Channel score" value={score} sub={score >= 75 ? 'Healthy' : score >= 50 ? 'Needs work' : 'Critical'} alert={score < 50} accent={scoreColor(score)} />
              </div>

              {/* Row 2 */}
              {data.analytics ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16, marginBottom: 0 }}>
                  <Stat label="Views (90d)"    value={fmtNum(data.analytics.views_90d)} />
                  <Stat label="Avg retention"  value={`${data.analytics.avg_retention_percent}%`}
                    sub={data.analytics.avg_retention_percent >= 50 ? 'Good' : 'Below 50% target'}
                    alert={data.analytics.avg_retention_percent < 40}
                    accent={data.analytics.avg_retention_percent >= 50 ? C.green : undefined}
                  />
                  <Stat label="Avg duration"   value={fmtSecs(data.analytics.avg_view_duration_seconds)}
                    sub={data.analytics.avg_view_duration_seconds < 120 ? 'Critical — under 2 min' : 'Good'}
                    alert={data.analytics.avg_view_duration_seconds < 120}
                  />
                  <Stat label="Net subs (90d)"
                    value={data.analytics.net_subscribers_90d >= 0 ? `+${fmtNum(data.analytics.net_subscribers_90d)}` : fmtNum(data.analytics.net_subscribers_90d)}
                    sub={data.analytics.net_subscribers_90d >= 0 ? 'Growing' : 'Losing subscribers'}
                    alert={data.analytics.net_subscribers_90d < 0}
                    accent={data.analytics.net_subscribers_90d >= 0 ? C.green : undefined}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.amberBg, border: `1px solid ${C.amberBdr}`, borderLeft: `3px solid ${C.amber}`, borderRadius: '0 12px 12px 0', padding: '12px 18px', marginBottom: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={C.amber} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="8" cy="8" r="6.5"/><line x1="8" y1="5" x2="8" y2="8.5"/><circle cx="8" cy="11" r="0.7" fill={C.amber} stroke="none"/>
                  </svg>
                  <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>
                    <strong style={{ color: C.text1, fontWeight: 600 }}>Retention, duration &amp; subscriber data unavailable.</strong>
                    {' '}Grant <strong style={{ fontWeight: 600 }}>YouTube Analytics read access</strong> when connecting your channel to unlock these metrics.
                  </p>
                </div>
              )}

            </>
          )}

          {/* ── MILESTONES ─────────────────────────────────────────────── */}
          {data && nav === 'Overview' && milestones && (() => {
            const cats = [
              { key: 'subs',        Title: 'Subscribers' },
              { key: 'views',       Title: 'Total Views' },
              { key: 'watch_hours', Title: 'Watch Hours' },
            ]
            const perCat = cats.map(c => {
              const earnedForCat = milestones.earned.filter(e => e.category === c.key)
              const latestTier = earnedForCat.length ? Math.max(...earnedForCat.map(e => e.tier)) : null
              const latestRecord = latestTier != null
                ? earnedForCat.find(e => e.tier === latestTier)
                : null
              const upcoming = milestones.upcoming.find(u => u.category === c.key) || null
              return { ...c, latestTier, latestAchievedAt: latestRecord?.achieved_at || null, upcoming }
            })
            const totalEarned = perCat.filter(p => p.latestTier !== null).length
            return (
              <div style={{ marginTop: 40 }}>
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Milestones</h2>
                  <p style={{ fontSize: 13, color: C.text3 }}>
                    {totalEarned} of 3 categories started{perCat.some(p => p.upcoming) ? ' · progress to next tier below' : ''}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
                  {perCat.map(p => {
                    const cat = CATEGORY_GRADIENT[p.key]
                    const displayTier = p.latestTier ?? (p.upcoming ? p.upcoming.tier : 0)
                    const hasEarned = p.latestTier !== null
                    const current = p.upcoming ? p.upcoming.current : (p.latestTier || 0)
                    return (
                      <div key={p.key} className="ytg-card" style={{
                        padding: '26px 24px 22px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        background: `linear-gradient(180deg, ${cat.h1}12 0%, #ffffff 45%, #ffffff 100%)`,
                        position: 'relative', overflow: 'hidden',
                      }}>
                        {/* Top category banner */}
                        <div style={{
                          alignSelf: 'stretch', textAlign: 'center', marginBottom: 14,
                          fontSize: 10.5, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
                          color: cat.h3,
                        }}>{p.Title}</div>

                        {/* Star badge */}
                        <div style={{ opacity: hasEarned ? 1 : 0.38 }}>
                          <StarBadge category={p.key} tier={displayTier} size={124}/>
                        </div>

                        {/* Tier value */}
                        <p style={{
                          fontSize: 38, fontWeight: 800, color: C.text1,
                          letterSpacing: '-1.5px', lineHeight: 1,
                          marginTop: 18, marginBottom: 6,
                          fontVariantNumeric: 'tabular-nums',
                        }}>{hasEarned ? fmtNum(p.latestTier) : '—'}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.text3, letterSpacing: '-0.1px' }}>
                          {hasEarned ? p.Title : 'Not yet earned'}
                        </p>

                        {/* Progress toward next */}
                        {p.upcoming && (
                          <div style={{ alignSelf: 'stretch', marginTop: 22 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Next: {fmtNum(p.upcoming.tier)}
                              </span>
                              <span style={{ fontSize: 11.5, fontWeight: 700, color: cat.h3, fontVariantNumeric: 'tabular-nums' }}>
                                {fmtNum(current)} / {fmtNum(p.upcoming.tier)}
                              </span>
                            </div>
                            <div style={{ height: 6, background: '#f1f2f6', borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{
                                width: `${Math.max(p.upcoming.pct, 2)}%`, height: '100%',
                                background: `linear-gradient(90deg, ${cat.h2} 0%, ${cat.h3} 100%)`,
                                borderRadius: 99,
                                transition: 'width 0.8s ease',
                              }}/>
                            </div>
                          </div>
                        )}

                        {/* Share button (earned only) — full pill with gradient */}
                        {hasEarned ? (
                          <button
                            onClick={() => setShareMilestone({
                              category: p.key,
                              tier: p.latestTier,
                              achieved_at: p.latestAchievedAt,
                            })}
                            style={{
                              alignSelf: 'stretch', marginTop: 24,
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                              background: `linear-gradient(180deg, ${cat.h2} 0%, ${cat.h3} 100%)`,
                              color: '#ffffff',
                              fontSize: 13.5, fontWeight: 700,
                              padding: '13px 20px', borderRadius: 999,
                              border: 'none', cursor: 'pointer',
                              letterSpacing: '-0.1px',
                              boxShadow: `0 4px 14px ${cat.h2}40, inset 0 1px 0 rgba(255,255,255,0.22)`,
                              transition: 'transform 0.15s, box-shadow 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1.5px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${cat.h2}55, inset 0 1px 0 rgba(255,255,255,0.22)` }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 14px ${cat.h2}40, inset 0 1px 0 rgba(255,255,255,0.22)` }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                            </svg>
                            Share milestone
                          </button>
                        ) : (
                          /* Brand footer for unearned cards only */
                          <div style={{
                            alignSelf: 'stretch', marginTop: 22, paddingTop: 14,
                            borderTop: `1px solid #eeeef3`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          }}>
                            <YTGLogo size={18}/>
                            <span style={{ fontSize: 14, fontWeight: 800, color: C.text1, letterSpacing: '-0.3px' }}>
                              YTGrowth<span style={{ color: C.red }}>.io</span>
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* ── INSIGHTS ─────────────────────────────────────────────── */}
          {data && nav === 'Overview' && analyzingAI && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 14 }}>
              <div style={{ width: 32, height: 32, border: `2.5px solid ${C.border}`, borderTop: `2.5px solid ${C.red}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.text1 }}>Running AI audit…</p>
              <p style={{ fontSize: 14, color: C.text3, maxWidth: 320, textAlign: 'center', lineHeight: 1.6 }}>YTGrowth is analyzing your last 20 videos, CTR, retention, and posting patterns. This takes about 20–30 seconds.</p>
            </div>
          )}

          {/* Start-here callout — visible when user has data but no audit yet
              and isn't mid-analysis (e.g. first-time reconnect at 0 credits, or
              background audit was skipped). Mirrors the existing .ytg-card
              pattern used by audit result cards. */}
          {data && nav === 'Overview' && !analyzingAI && !data.insights && (
            <div className="ytg-card" style={{ padding: '28px 32px', marginTop: 32, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Start here</p>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 6 }}>Run your first audit</h2>
                <p style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.55, maxWidth: 520 }}>
                  We need to analyse your channel before we can show Priority Actions, growth patterns, and milestone tracking. Costs 1 credit and takes about 30 seconds.
                </p>
              </div>
              <button
                className="ytg-dash-btn-primary"
                disabled={analyzingAI}
                onClick={() => {
                  setReAuditError('')
                  setAnalyzingAI(true)
                  fetch('/auth/refresh-analysis', { method: 'POST', credentials: 'include' })
                    .then(async r => {
                      if (r.ok) {
                        window.dispatchEvent(new CustomEvent('ytg:credits-changed'))
                        return
                      }
                      setAnalyzingAI(false)
                      if (r.status === 401) { window.location = '/'; return }
                      if (r.status === 402) { setCreditsOut(true); return }
                      const d = await r.json().catch(() => ({}))
                      setReAuditError(d.error || "Something went wrong on our end. Email support@ytgrowth.io and we'll sort it out.")
                      setTimeout(() => setReAuditError(''), 8000)
                    })
                    .catch(() => {
                      setAnalyzingAI(false)
                      setReAuditError("Couldn't reach our servers. Check your connection and try again.")
                      setTimeout(() => setReAuditError(''), 8000)
                    })
                }}
                style={{ flexShrink: 0 }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M11.5 2A6 6 0 1 0 12 6.5"/><path d="M11.5 2v3h-3"/>
                </svg>
                <span>Run audit</span><span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginLeft: 2 }}>· 1 credit</span>
              </button>
            </div>
          )}

          {data && nav === 'Overview' && data.insights && (
            <>
              <div style={{ marginBottom: 20, marginTop: 44 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Channel audit</h2>
                <p style={{ fontSize: 13, color: C.text3 }}>{data.insights.priorityActions?.length ?? 0} priority actions{data.analyzed_at ? ` · Audited ${parseUTC(data.analyzed_at)?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) ?? ''}` : ''}</p>
              </div>

              {/* Summary + overall score */}
              {data.insights.channelSummary && (
                <div className="ytg-card" style={{ padding: '28px 32px', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
                    {/* Score ring — left */}
                    <div style={{ flexShrink: 0, textAlign: 'center' }}>
                      <ScoreRing score={score} />
                      <p style={{ fontSize: 11, color: C.text3, fontWeight: 500, marginTop: 4, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Overall</p>
                      {prevScore != null && prevScore !== score && (
                        <p style={{ fontSize: 11, fontWeight: 700, color: score > prevScore ? C.green : C.red, marginTop: 3 }}>
                          {score > prevScore ? '▲' : '▼'} {Math.abs(score - prevScore)} from last audit
                        </p>
                      )}
                    </div>
                    {/* Divider */}
                    <div style={{ width: 1, alignSelf: 'stretch', background: C.border, flexShrink: 0 }}/>
                    {/* Summary text */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>AI assessment</p>
                      <p style={{ fontSize: 14, color: C.text1, lineHeight: 1.85 }}>{data.insights.channelSummary}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Category scores */}
              {data.insights.categoryScores && (
                <div className="ytg-card" style={{ padding: '24px 32px', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Score breakdown</p>
                    <p style={{ fontSize: 11, color: C.text3 }}>Weighted formula · CTR &amp; retention count most</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 40px' }}>
                    {[
                      ['CTR health',                data.insights.categoryScores.ctrHealth,                '20%'],
                      ['Audience retention',        data.insights.categoryScores.audienceRetention,        '20%'],
                      ['Content strategy',          data.insights.categoryScores.contentStrategy,          '15%'],
                      ['Posting consistency',       data.insights.categoryScores.postingConsistency,       '15%'],
                      ['Engagement quality',        data.insights.categoryScores.engagementQuality,        '10%'],
                      ['SEO discoverability',       data.insights.categoryScores.seoDiscoverability,       '10%'],
                      ['Video length',              data.insights.categoryScores.videoLength,               '5%'],
                      ['Traffic source intel',      data.insights.categoryScores.trafficSourceIntelligence,'5%'],
                    ].map(([label, val, weight]) => {
                      const col = scoreColor(val)
                      return (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 11, fontWeight: 500, color: C.text3, flexShrink: 0, width: 36, textAlign: 'right' }}>{weight}</span>
                          <span style={{ fontSize: 13, color: C.text2, fontWeight: 400, flexShrink: 0, width: 148 }}>{label}</span>
                          <div style={{ flex: 1, height: 4, background: '#eeeef3', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ width: `${val ?? 0}%`, height: '100%', background: col, borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}/>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: col, fontVariantNumeric: 'tabular-nums', minWidth: 26, textAlign: 'right' }}>{val ?? '—'}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Priority actions */}
              {data.insights.priorityActions?.length > 0 && (() => {
                const allActions = data.insights.priorityActions
                const actions = allActions.filter((a, i) => !deleted[`rank_${a.rank ?? (i + 1)}`])
                const doneCount = actions.filter((a, i) => {
                  const rank = a.rank ?? (allActions.indexOf(a) + 1)
                  return checked[`rank_${rank}`]
                }).length
                const hasDone = doneCount > 0
                return (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontSize: 20, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px' }}>Priority actions</p>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.text3, background: '#f1f1f6', padding: '2px 8px', borderRadius: 20, border: '1px solid #e6e6ec' }}>{actions.length}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {hasDone && (
                          <button
                            onClick={() => {
                              const nextDel = { ...deleted }
                              const nextChk = { ...checked }
                              actions.forEach(a => {
                                const rank = a.rank ?? (allActions.indexOf(a) + 1)
                                const k = `rank_${rank}`
                                if (nextChk[k]) { nextDel[k] = true; delete nextChk[k] }
                              })
                              setDeleted(nextDel)
                              setChecked(nextChk)
                              if (data?.channel?.channel_id) {
                                localStorage.setItem(`ytg_deleted_${data.channel.channel_id}`, JSON.stringify(nextDel))
                                localStorage.setItem(`ytg_checked_${data.channel.channel_id}`, JSON.stringify(nextChk))
                              }
                            }}
                            style={{ fontSize: 12, fontWeight: 600, color: C.red, background: C.redBg, border: `1px solid ${C.redBdr}`, borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                          >
                            Clear completed
                          </button>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 72, height: 4, background: '#ebebef', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: actions.length ? `${(doneCount / actions.length) * 100}%` : '0%', height: '100%', background: C.green, borderRadius: 2, transition: 'width 0.4s' }}/>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: doneCount > 0 && doneCount === actions.length ? C.green : C.text3, fontVariantNumeric: 'tabular-nums' }}>
                            {doneCount}/{actions.length}
                          </span>
                        </div>
                      </div>
                    </div>
                    {actions.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '32px 20px', background: C.greenBg, border: `1px solid ${C.greenBdr}`, borderRadius: 16 }}>
                        <p style={{ fontSize: 22, marginBottom: 6 }}>✓</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: C.green, marginBottom: 4 }}>All tasks cleared</p>
                        <p style={{ fontSize: 14, color: '#166534' }}>Great work — you've handled every priority action.</p>
                      </div>
                    )}
                    {actions.map((ins, i) => {
                      const rank = ins.rank ?? (allActions.indexOf(ins) + 1)
                      const key = `rank_${rank}`
                      return (
                        <InsightCard
                          key={rank}
                          insight={ins}
                          index={i}
                          checked={!!checked[key]}
                          onToggle={() => handleToggleCheck(key)}
                          onDelete={() => handleDelete(key)}
                          onNavigate={setNav}
                        />
                      )
                    })}
                  </div>
                )
              })()}

              {/* Quick wins + big risk */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {data.insights.quickWins?.length > 0 && (() => {
                  const wins = data.insights.quickWins.filter((_, i) => !deleted[`qw_${i}`])
                  return (
                    <div className="ytg-card" style={{ padding: '20px 22px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Quick wins</p>
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.text3, background: '#f1f1f6', padding: '2px 7px', borderRadius: 20, border: '1px solid #e6e6ec' }}>{wins.length} left</span>
                      </div>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {data.insights.quickWins.map((w, i) => {
                          if (deleted[`qw_${i}`]) return null
                          const key = `qw_${i}`
                          const isDone = !!checked[key]
                          return (
                            <li key={i} className="ytg-qw-row" style={{ opacity: isDone ? 0.5 : 1 }}>
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => handleToggleCheck(key)}
                                style={{ width: 14, height: 14, accentColor: C.green, cursor: 'pointer', flexShrink: 0, marginTop: 3 }}
                              />
                              <p style={{ fontSize: 14, color: isDone ? C.text3 : C.text2, lineHeight: 1.6, flex: 1, textDecoration: isDone ? 'line-through' : 'none' }}>{w}</p>
                              {isDone && (
                                <button className="ytg-del-btn" onClick={() => handleDelete(key)} title="Remove">
                                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="#e5251b" strokeWidth="1.8" strokeLinecap="round">
                                    <line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/>
                                  </svg>
                                </button>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )
                })()}
                <div className="ytg-card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {data.insights.biggestRisk && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Biggest risk</p>
                      <p style={{ fontSize: 14, color: C.text1, lineHeight: 1.7 }}>{data.insights.biggestRisk}</p>
                    </div>
                  )}
                  {data.insights.topPerformingPattern && (
                    <div style={{ paddingTop: data.insights.biggestRisk ? 16 : 0, borderTop: data.insights.biggestRisk ? `1px solid ${C.border}` : 'none' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>What's working</p>
                      <p style={{ fontSize: 14, color: C.text1, lineHeight: 1.7 }}>{data.insights.topPerformingPattern}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── VIDEOS ───────────────────────────────────────────────── */}
          {data && nav === 'Videos' && videos && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 26, fontWeight: 800, color: C.text1, letterSpacing: '-0.7px', marginBottom: 10 }}>Video performance</h2>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[
                      ['📹', `${videos.length} videos`],
                      ['👁', `${fmtNum(videos.reduce((s, v) => s + (v.views || 0), 0))} total views`],
                      ['👍', `${fmtNum(videos.reduce((s, v) => s + (v.likes || 0), 0))} total likes`],
                      ['💬', `${fmtNum(videos.reduce((s, v) => s + (v.comments || 0), 0))} comments`],
                    ].map(([icon, label]) => (
                      <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: C.text2, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 100, padding: '5px 12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <span>{icon}</span>{label}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: '#fff', borderRadius: 100,
                    border: '1px solid rgba(0,0,0,0.08)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 14px rgba(0,0,0,0.06)',
                    padding: 3, gap: 2,
                  }}>
                    {[
                      { k: 'date',  label: 'Newest' },
                      { k: 'views', label: 'Most views' },
                      { k: 'likes', label: 'Most likes' },
                    ].map(opt => {
                      const active = videoSort === opt.k
                      return (
                        <button
                          key={opt.k}
                          onClick={() => setVideoSort(opt.k)}
                          style={{
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontSize: 12.5, fontWeight: 600,
                            padding: '7px 14px', borderRadius: 100,
                            border: 'none', cursor: 'pointer',
                            background: active ? '#e5251b' : 'transparent',
                            color: active ? '#fff' : '#52525b',
                            boxShadow: active ? '0 1px 3px rgba(229,37,27,0.35)' : 'none',
                            transition: 'all 0.18s',
                          }}
                          onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#111114' }}
                          onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#52525b' }}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    className="ytg-dash-btn-primary"
                    disabled={refreshingStats}
                    onClick={() => {
                      setRefreshingStats(true)
                      setVideoFlash(null)
                      fetch('/auth/refresh-stats', { method: 'POST', credentials: 'include' })
                        .then(r => r.json())
                        .then(d => {
                          if (!d.error) {
                            setData(prev => ({ ...prev, channel: d.channel, videos: d.videos, stats_fetched_at: d.stats_fetched_at }))
                            setVideos(d.videos || [])
                            setVideoFlash('ok')
                            if (d.new_milestones && d.new_milestones.length > 0) {
                              const nowIso = new Date().toISOString()
                              setCelebrateQueue(d.new_milestones.map(m => ({ ...m, achieved_at: nowIso })))
                              fetch('/auth/milestones', { credentials: 'include' })
                                .then(r => r.ok ? r.json() : null)
                                .then(m => { if (m && !m.error) setMilestones(m) })
                                .catch(() => {})
                            }
                          } else {
                            setVideoFlash('err')
                          }
                        })
                        .catch(() => setVideoFlash('err'))
                        .finally(() => {
                          setRefreshingStats(false)
                          setTimeout(() => setVideoFlash(null), 3000)
                        })
                    }}
                    style={{ flexShrink: 0 }}
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M11.5 2A6 6 0 1 0 12 6.5"/><path d="M11.5 2v3h-3"/>
                    </svg>
                    {refreshingStats ? 'Refreshing…'
                      : videoFlash === 'ok'  ? 'Updated ✓'
                      : videoFlash === 'err' ? 'Failed ✕'
                      : 'Refresh'}
                  </button>
                </div>
              </div>

              {/* ── Your optimizations — each row is its own ytg-insight-card (same pattern as Overview's Priority Actions).
                    Green top border + green rank badge = "tracked/active", 3-col body grid with tinted views/likes/comments deltas. ── */}
              {optimizations.length > 0 && (() => {
                const daysSince = (iso) => {
                  if (!iso) return null
                  const d = new Date(iso)
                  if (isNaN(d.getTime())) return null
                  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000))
                }
                const pct = (before, after) => {
                  if (before <= 0) return null
                  return Math.round(((after - before) / before) * 100)
                }

                // Tinted delta cell — mirrors Priority Actions' 3-col body (blue/white/green tints).
                // We use the same palette: Views=blue (info), Likes=white+bar (action), Comments=green (outcome).
                const DeltaCell = ({ label, before, current, pctVal, tint }) => {
                  const tintMap = {
                    blue:  { bg: 'rgba(79,134,247,0.07)', border: '1px solid rgba(79,134,247,0.12)', labelColor: '#4a7cf7' },
                    white: { bg: '#ffffff', border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.green}`, borderRadius: '0 10px 10px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', labelColor: C.green },
                    green: { bg: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.14)', labelColor: C.green },
                  }[tint]
                  // Hide the delta label entirely when nothing has changed (pct is 0 or null).
                  // 0% everywhere is noise — we only show the badge when there's a real move.
                  const showDelta = pctVal != null && pctVal !== 0
                  const col  = showDelta && pctVal > 0 ? C.green : showDelta && pctVal < 0 ? C.red : C.text3
                  const sign = showDelta ? (pctVal > 0 ? `+${pctVal}%` : `${pctVal}%`) : null
                  return (
                    <div style={{
                      background: tintMap.bg,
                      border: tintMap.border,
                      borderLeft: tintMap.borderLeft,
                      borderRadius: tintMap.borderRadius || 10,
                      padding: '12px 14px',
                      boxShadow: tintMap.boxShadow,
                    }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: tintMap.labelColor, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <p style={{ fontSize: 18, fontWeight: 800, color: C.text1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.4px', lineHeight: 1 }}>{fmtNum(current)}</p>
                        {showDelta && <p style={{ fontSize: 12, fontWeight: 700, color: col, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{sign}</p>}
                      </div>
                      <p style={{ fontSize: 11, color: C.text3, marginTop: 4, fontWeight: 500 }}>was {fmtNum(before)}</p>
                    </div>
                  )
                }

                return (
                  <div style={{ marginBottom: 28 }}>
                    {/* Subtler secondary eyebrow — lets "Video performance" keep its H2 identity at the top */}
                    <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>
                      Tracked updates · {optimizations.length} video{optimizations.length === 1 ? '' : 's'}
                    </p>

                    {optimizations.slice(0, 8).map((o, i) => {
                      const days         = daysSince(o.optimized_at)
                      const vPct         = pct(o.before_views,    o.current_views)
                      const lPct         = pct(o.before_likes,    o.current_likes)
                      const cPct         = pct(o.before_comments, o.current_comments)
                      const titleChanged = o.before_title && o.after_title && o.before_title !== o.after_title
                      const daysLabel    = days === 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`
                      return (
                        <div key={`${o.video_id}-${o.optimized_at}`} className="ytg-insight-card" style={{ marginBottom: 10, borderTop: `3px solid ${C.amber}` }}>
                          <div style={{ padding: '16px 22px 18px' }}>

                            {/* Header — amber rank badge + category eyebrow + title diff + days pill.
                                Thumbnail sized 100×56 so its height matches the 3-line text block (eyebrow + strike + new title),
                                and alignSelf:center keeps it rooted to the text instead of hanging from the top. */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                              <div style={{ width: 26, height: 26, borderRadius: 8, background: C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                                <span style={{ fontSize: 12, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
                              </div>

                              {o.thumbnail_url && (
                                <a href={`https://www.youtube.com/watch?v=${o.video_id}`} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, lineHeight: 0, textDecoration: 'none', alignSelf: 'center' }}>
                                  <img src={o.thumbnail_url} alt="" style={{ width: 100, height: 56, borderRadius: 7, objectFit: 'cover', display: 'block' }}/>
                                </a>
                              )}

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>Tracked update</p>
                                {titleChanged ? (
                                  <>
                                    <p style={{ fontSize: 12, color: C.text3, fontWeight: 500, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: 'line-through', marginBottom: 3 }}>{o.before_title}</p>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.1px' }}>{o.after_title}</p>
                                  </>
                                ) : (
                                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.1px' }}>{o.after_title || o.before_title}</p>
                                )}
                              </div>

                              <span style={{ fontSize: 10, fontWeight: 700, color: C.green, padding: '3px 9px', borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase', border: `1.5px solid ${C.green}`, flexShrink: 0 }}>
                                {daysLabel}
                              </span>
                            </div>

                            {/* Hairline divider — aligned with content start, same offset Priority Actions uses */}
                            <div style={{ height: 1, background: C.border, marginBottom: 14, marginLeft: 46 }}/>

                            {/* 3-col body — Views (blue) / Likes (white+bar) / Comments (green), parallel stats in Priority Actions tint pattern */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 8, marginLeft: 46 }}>
                              <DeltaCell label="Views"    before={o.before_views}    current={o.current_views}    pctVal={vPct} tint="blue"/>
                              <DeltaCell label="Likes"    before={o.before_likes}    current={o.current_likes}    pctVal={lPct} tint="white"/>
                              <DeltaCell label="Comments" before={o.before_comments} current={o.current_comments} pctVal={cPct} tint="green"/>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

              {/* Card grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 14 }}>
                {[...videos].sort((a, b) => {
                  if (videoSort === 'views') return (b.views || 0) - (a.views || 0)
                  if (videoSort === 'likes') return (b.likes || 0) - (a.likes || 0)
                  return (parseUTC(b.published_at) || 0) - (parseUTC(a.published_at) || 0)
                }).map((v, i) => {
                  const lr      = v.views > 0 ? (v.likes / v.views * 100).toFixed(1) : null
                  const lrN     = lr !== null ? parseFloat(lr) : null
                  const lrColor = lrN === null ? C.text3 : lrN >= 3 ? C.green : lrN >= 1 ? C.amber : C.red
                  const wtSecs    = typeof v.avg_duration_seconds === 'number' ? v.avg_duration_seconds : null
                  const wtDisplay = wtSecs !== null ? `${Math.floor(wtSecs / 60)}:${String(wtSecs % 60).padStart(2, '0')}` : '—'
                  const retN      = typeof v.avg_view_percent === 'number' ? v.avg_view_percent : null
                  const isSelected = selectedVideoId === v.video_id
                  const ytUrl   = v.video_id ? `https://www.youtube.com/watch?v=${v.video_id}` : null
                  const durMatch = (v.duration || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
                  const durSecs  = durMatch ? (+durMatch[1]||0)*3600 + (+durMatch[2]||0)*60 + (+durMatch[3]||0) : 0
                  const durLabel = durSecs > 0 ? (durSecs <= 60 ? `${durSecs}s` : `${Math.floor(durSecs/60)}:${String(durSecs%60).padStart(2,'0')}`) : null
                  const isShort  = durSecs > 0 && durSecs <= 60
                  return (
                    <div key={v.video_id || i} className="ytg-card" style={{ display: 'flex', flexDirection: 'column' }}>
                      {/* Thumbnail */}
                      <a href={ytUrl || '#'} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'block', position: 'relative', textDecoration: 'none', flexShrink: 0, borderRadius: '19px 19px 0 0', overflow: 'hidden' }}>
                        {v.thumbnail || v.video_id
                          ? <img
                              src={v.video_id ? ytMaxThumbUrl(v.video_id) : v.thumbnail}
                              alt=""
                              style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
                              onError={makeThumbOnError(v.video_id, v.thumbnail)}
                              onLoad={makeThumbOnLoad(v.video_id, v.thumbnail)}
                            />
                          : <div style={{ width: '100%', aspectRatio: '16/9', background: '#ebebef' }}/>
                        }
                        {isShort && (
                          <span style={{ position: 'absolute', top: 8, left: 8, background: '#111', color: '#fff', fontSize: 12, fontWeight: 800, padding: '2px 6px', borderRadius: 4, letterSpacing: '0.06em' }}>SHORT</span>
                        )}
                        {durLabel && (
                          <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.72)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '2px 7px', borderRadius: 5, fontVariantNumeric: 'tabular-nums' }}>{durLabel}</span>
                        )}
                      </a>

                      {/* Body */}
                      <div style={{ padding: '20px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        {/* Title */}
                        <p style={{
                          fontSize: 16, fontWeight: 700, color: C.text1, lineHeight: 1.45, marginBottom: 14, letterSpacing: '-0.3px',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>{v.title}</p>

                        {/* Meta line */}
                        <p style={{ fontSize: 13.5, fontWeight: 500, color: C.text3, marginBottom: 14, lineHeight: 1.4 }}>
                          <span style={{ color: C.text2, fontWeight: 600 }}>{fmtNum(v.views)}</span> views
                          <span style={{ margin: '0 8px', color: '#d4d4dc' }}>·</span>
                          <span style={{ color: C.text2, fontWeight: 600 }}>{fmtNum(v.likes)}</span> likes
                          <span style={{ margin: '0 8px', color: '#d4d4dc' }}>·</span>
                          {relTimeLong(v.published_at) || '—'}
                        </p>

                        {/* Footer: Watch · Retention · Eng + Optimise */}
                        <div style={{ marginTop: 'auto', paddingTop: 18, borderTop: `1px solid #eeeef3` }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
                            {[
                              { label: 'Watch',     display: wtDisplay,                                             color: C.text1,  tip: 'Average watch time per view (mm:ss). Longer is better relative to video length.' },
                              { label: 'Retention', display: retN !== null ? `${retN.toFixed(0)}%` : '—',           color: C.text1,  tip: 'Average % of video watched. 50%+ strong, 30–50% avg, <30% weak.' },
                              { label: 'Eng',       display: lrN !== null ? `${lr}%` : '—',                         color: lrColor,  tip: 'Engagement rate = likes ÷ views. 3%+ strong, 1–3% avg, <1% weak.' },
                            ].map(m => (
                              <div key={m.label} title={m.tip} style={{ cursor: 'help', textAlign: 'left' }}>
                                <p style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 7, lineHeight: 1 }}>{m.label}</p>
                                <p style={{ fontSize: 17, fontWeight: 800, color: m.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.4px', lineHeight: 1 }}>{m.display}</p>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => setSelectedVideoId(v.video_id)}
                            className="ytg-optimise-btn"
                            style={{ width: '100%', justifyContent: 'center', padding: '11px 16px', fontSize: 13.5, fontWeight: 700 }}>
                            Optimise
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Optimise panel — modal overlay */}
              {selectedVideoId && (() => {
                const sv = videos.find(v => v.video_id === selectedVideoId)
                return sv ? (
                  <div
                    onClick={e => { if (e.target === e.currentTarget) setSelectedVideoId(null) }}
                    style={{
                      position: 'fixed', inset: 0, zIndex: 200,
                      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '32px 24px',
                    }}
                  >
                    <div style={{ width: '100%', maxWidth: 1280, maxHeight: 'calc(100vh - 64px)', overflowY: 'auto', borderRadius: 22, flexShrink: 0 }}>
                      <VideoOptimizePanel
                        video={sv}
                        onClose={() => setSelectedVideoId(null)}
                        onVideoUpdated={handleVideoUpdated}
                        plan={billingPlan}
                        freeTierFeatures={freeTierFeatures}
                      />
                    </div>
                  </div>
                ) : null
              })()}
            </>
          )}

          {/* ── PATTERNS ─────────────────────────────────────────────── */}
          {data && nav === 'Overview' && patterns && (
            <>
              <div style={{ marginBottom: 20, marginTop: 44 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Content patterns</h2>
                <p style={{ fontSize: 13, color: C.text3 }}>What's working and what isn't</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16, marginBottom: 16 }}>
                {[
                  { label: 'Shorts avg views',    value: fmtNum(patterns.shortAvg), verdict: patterns.shortAvg > patterns.longAvg ? 'Beats long-form' : 'Below long-form', good: patterns.shortAvg > patterns.longAvg },
                  { label: 'Long-form avg views', value: fmtNum(patterns.longAvg),  verdict: patterns.longAvg > patterns.shortAvg ? 'Beats Shorts'     : 'Below Shorts',    good: patterns.longAvg  > patterns.shortAvg },
                  { label: 'Avg engagement rate', value: `${patterns.likeRate}%`,   verdict: patterns.likeRate >= 3 ? 'Healthy' : patterns.likeRate >= 1 ? 'Average' : 'Below average', good: patterns.likeRate >= 3, hint: 'likes ÷ views — 3%+ is strong' },
                ].map(p => (
                  <div key={p.label} className="ytg-card" title={p.hint || undefined} style={{ padding: '20px 22px', cursor: p.hint ? 'help' : 'default' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>{p.label}</p>
                    <p style={{ fontSize: 26, fontWeight: 800, color: C.text1, letterSpacing: '-0.8px', marginBottom: 10, fontVariantNumeric: 'tabular-nums' }}>{p.value}</p>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color:   p.good ? C.green  : C.amber,
                      background: 'transparent',
                      padding: '3px 10px', borderRadius: 20,
                      border: `1.5px solid ${p.good ? C.greenBdr : C.amberBdr}`,
                    }}>{p.verdict}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {[
                  { label: 'Best performing',  video: patterns.bestVideo,  isGood: true  },
                  { label: 'Worst performing', video: patterns.worstVideo, isGood: false },
                ].map(({ label, video, isGood }) => (
                  <div key={label} className="ytg-card" style={{ padding: '20px 22px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: isGood ? C.green : C.red, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>{label}</p>
                    {video && (
                      <>
                        <div style={{ display: 'flex', gap: 11, marginBottom: 13, alignItems: 'flex-start' }}>
                          {video.thumbnail && <img src={video.thumbnail} alt="" style={{ width: 68, height: 43, borderRadius: 7, objectFit: 'cover', flexShrink: 0 }}/>}
                          <p style={{ fontSize: 14, fontWeight: 600, color: C.text1, lineHeight: 1.5 }}>{video.title}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
                          {[['Views', fmtNum(video.views), isGood ? C.green : C.red], ['Likes', fmtNum(video.likes), C.text1]].map(([lbl, val, col]) => (
                            <div key={lbl}>
                              <p style={{ fontSize: 12, color: C.text3, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{lbl}</p>
                              <p style={{ fontSize: 21, fontWeight: 800, color: col, letterSpacing: '-0.8px', fontVariantNumeric: 'tabular-nums' }}>{val}</p>
                            </div>
                          ))}
                        </div>
                        <div style={{
                          background: isGood ? C.greenBg : C.redBg,
                          border: `1px solid ${isGood ? C.greenBdr : C.redBdr}`,
                          borderRadius: 10, padding: '9px 12px',
                        }}>
                          <p style={{ fontSize: 12, color: isGood ? '#166534' : '#991b1b', lineHeight: 1.7 }}>
                            {isGood ? 'Study this — replicate its title style, length, and topic angle.' : 'Avoid this format or topic — it isn\'t connecting with your audience.'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="ytg-card" style={{ padding: '20px 22px' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16 }}>Content mix</p>
                <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
                  {[{ l: 'Shorts', v: patterns.shortsCount, s: '≤60s' }, { l: 'Long-form', v: patterns.longsCount, s: '>60s' }].map(p => (
                    <div key={p.l}>
                      <p style={{ fontSize: 12, color: C.text3, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{p.l}</p>
                      <p style={{ fontSize: 26, fontWeight: 800, color: C.text1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>{p.v}</p>
                      <p style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>{p.s}</p>
                    </div>
                  ))}
                  <div style={{ flex: 1, paddingLeft: 28, borderLeft: `1px solid #ebebef` }}>
                    <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.85 }}>
                      {patterns.shortAvg > patterns.longAvg
                        ? `Shorts outperform long-form by ${fmtNum(patterns.shortAvg - patterns.longAvg)} views on average. Lean into Shorts for discovery.`
                        : patterns.longAvg > patterns.shortAvg
                        ? `Long-form outperforms Shorts by ${fmtNum(patterns.longAvg - patterns.shortAvg)} views. Your audience wants depth.`
                        : 'Both formats are performing similarly on your channel.'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {nav === 'Competitors' && <Competitors plan={billingPlan} freeTierFeatures={freeTierFeatures} />}

          {nav === 'Keywords' && <Keywords plan={billingPlan} freeTierFeatures={freeTierFeatures} />}

          {nav === 'Weekly Report' && (
            <WeeklyReport
              channelId={data?.channel?.channel_id}
              channelEmail={data?.email}
              plan={billingPlan}
              channelStats={data?.channel}
              analytics={data?.analytics}
              healthScore={score}
            />
          )}

          {nav === 'SEO Studio' && <SeoOptimizer onNavigate={setNav} plan={billingPlan} freeTierFeatures={freeTierFeatures} videos={videos} />}

          {nav === 'Thumbnail Score' && <ThumbnailScore channelData={data} onNavigate={setNav} plan={billingPlan} freeTierFeatures={freeTierFeatures} />}

          {nav === 'Video Ideas' && <VideoIdeas onNavigate={setNav} plan={billingPlan} freeTierFeatures={freeTierFeatures} />}

          {nav === 'Outliers' && <Outliers channelData={data} onNavigate={setNav} plan={billingPlan} freeTierFeatures={freeTierFeatures} />}

          {nav === 'Autopsy' && <Autopsy videos={videos} channelId={data?.channel?.channel_id} />}

          {/* ── SETTINGS ─────────────────────────────────────────────── */}
          {nav === 'Settings' && <Settings />}

        </div>
      </div>

      {/* ── Milestone unlocked celebration (only when share modal isn't open) ── */}
      {celebrateQueue.length > 0 && !shareMilestone && (
        <MilestoneCelebrationModal
          milestone={celebrateQueue[0]}
          channelName={data?.channel?.channel_name}
          channelThumbnail={data?.channel?.thumbnail}
          onShare={() => {
            setShareMilestone(celebrateQueue[0])
            setCelebrateQueue(q => q.slice(1))
          }}
          onClose={() => setCelebrateQueue(q => q.slice(1))}
        />
      )}

      {/* ── Milestone share modal ─────────────────────────────────────── */}
      {shareMilestone && (
        <MilestoneShareModal
          milestone={shareMilestone}
          channelName={data?.channel?.channel_name}
          channelThumbnail={data?.channel?.thumbnail}
          onClose={() => setShareMilestone(null)}
        />
      )}

      <CreditsEmptyModal
        open={creditsOut}
        onClose={() => setCreditsOut(false)}
        featureName="channel audits"
      />

      <WelcomeModal
        open={showWelcome}
        onClose={() => {
          setShowWelcome(false)
          const cid = data?.channel?.channel_id
          if (cid) {
            try { localStorage.setItem(`ytg_welcomed_${cid}`, '1') } catch {}
          }
        }}
      />
    </div>
  )
}
