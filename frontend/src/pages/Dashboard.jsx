import { useEffect, useState, useRef, forwardRef } from 'react'
import {
  LayoutDashboard,  // Feed
  Sparkles,         // Optimize / promo card
  Telescope,        // Research / Niche Outlier category
  MessageCircle,    // Chat
  Settings as SettingsIcon,
  ShieldCheck,      // Admin
  Gift,             // Refer
  LogOut,
  X as XIcon,
  ArrowRight,
  Target,           // Priority Action category
  Trophy,           // Milestone / Achievement category
  BarChart3,        // Content Mix / Insight category
  Activity,         // Channel Health category
  CalendarDays,     // Posting Consistency category
  Flame,            // Streak indicator
  Clock,            // Best Time to Publish category
  TrendingUp,       // Tracked Optimization Lift category
  Lightbulb,        // Daily Ideas category
  Users,            // Competitor Activity category
  RefreshCw,        // Refresh Ideas button
  ExternalLink,     // External link arrow for competitor uploads
  ChevronDown,      // Collapse toggle on Channel Health
  RefreshCcw,       // Refresh stats (compact topbar)
  RotateCcw,        // Re-Audit (compact topbar)
} from 'lucide-react'
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
import Referrals from './Referrals'
import Admin from './Admin'
import NicheHeroCard from '../components/NicheHeroCard'
import ChatCoach from './ChatCoach'
import AuditProgress from '../components/AuditProgress'
import { loginUrl } from '../utm.js'
import { openCheckout } from '../checkout'
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
      @keyframes ytgShimmer { 0% { background-position: -240px 0 } 100% { background-position: 240px 0 } }

      /* Loading skeleton placeholder. Mirrors the real card shapes so the
         Feed renders structure-first while data loads. */
      .ytg-skel {
        background:
          linear-gradient(
            90deg,
            rgba(15,15,19,0.045) 0%,
            rgba(15,15,19,0.085) 50%,
            rgba(15,15,19,0.045) 100%
          );
        background-size: 240px 100%;
        background-repeat: no-repeat;
        animation: ytgShimmer 1.2s ease-in-out infinite;
      }
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

      ::-webkit-scrollbar       { width: 12px; height: 12px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb {
        background-color: rgba(10,10,15,0.28);
        border-radius: 10px;
        border: 3px solid transparent;
        background-clip: content-box;
        min-height: 48px;
      }
      ::-webkit-scrollbar-thumb:hover { background-color: rgba(10,10,15,0.48); background-clip: content-box; }

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
      /* Videos card grid — 5 cols on large desktops, 4 on laptop-sized
         screens where the 5-col layout was overflowing the ENG metric and
         clamping titles. Big monitors (1500px+) keep the 5-col look.
         Mirrored verbatim by Autopsy.jsx for parity (see .au-eligible-grid). */
      .ytg-videos-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 14px;
      }
      @media (max-width: 1500px) {
        .ytg-videos-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      }
      @media (max-width: 900px) {
        .ytg-videos-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 560px) {
        .ytg-videos-grid { grid-template-columns: 1fr; }
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
      <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-1px', color: col, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: alert ? C.red : C.text3, fontWeight: 500, marginTop: 10 }}>{sub}</p>}
    </div>
  )
}

/* HeroTile — foundational metric. Larger than Stat, with optional delta chip. */
function HeroTile({ label, value, sub, delta, deltaSuffix, deltaIsAbsolute }) {
  const hasDelta = delta !== null && delta !== undefined && !Number.isNaN(Number(delta))
  const deltaNum = hasDelta ? Number(delta) : 0
  const deltaPositive = deltaNum >= 0
  const deltaColor = !hasDelta ? C.text3 : deltaPositive ? C.green : C.red
  const deltaBg    = !hasDelta ? 'transparent' : deltaPositive ? 'rgba(5,150,105,0.08)' : 'rgba(229,37,27,0.07)'
  const deltaBdr   = !hasDelta ? 'transparent' : deltaPositive ? 'rgba(5,150,105,0.18)' : 'rgba(229,37,27,0.18)'
  const deltaLabel = hasDelta
    ? `${deltaPositive ? '+' : ''}${fmtNum(Math.abs(deltaNum)) }${deltaIsAbsolute ? '' : ''}`
    : ''
  return (
    <div className="ytg-stat-card" style={{ padding: '20px 22px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.text3 }}>{label}</p>
        {hasDelta && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 700, color: deltaColor,
            background: deltaBg, border: `1px solid ${deltaBdr}`,
            padding: '3px 9px', borderRadius: 100,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.1px',
          }}>
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transform: deltaPositive ? 'none' : 'rotate(180deg)' }}>
              <path d="M5 8V2M2.5 4.5 5 2l2.5 2.5"/>
            </svg>
            {deltaLabel}
            <span style={{ color: C.text3, fontWeight: 500, marginLeft: 2 }}>{deltaSuffix || ''}</span>
          </span>
        )}
      </div>
      <p style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-2px', color: C.text1, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      {sub && <p style={{ fontSize: 12.5, color: C.text3, fontWeight: 500, marginTop: 12 }}>{sub}</p>}
    </div>
  )
}

/* ─── Feed (Home) primitives ────────────────────────────────────────────────
   Phase 1 of the Home rebuild. Replaces the giant audit wall with a card
   stream organised by category. The card pattern: tinted-icon eyebrow row,
   one headline, one body line, one primary CTA. Mirrors the What's New card
   structure used in the sidebar so the design language is consistent.
*/

// Next round-number target for the milestone-progress bars in the stat
// hero. Tiered so a 50-sub channel sees "100" not "1k", and a 50k channel
// sees "100k" not "51k".
function nextSubMilestone(n) {
  if (n < 100)     return 100
  if (n < 1_000)   return Math.ceil(n / 100) * 100
  if (n < 10_000)  return Math.ceil(n / 1_000) * 1_000
  if (n < 100_000) return Math.ceil(n / 10_000) * 10_000
  if (n < 1_000_000) return Math.ceil(n / 100_000) * 100_000
  return Math.ceil(n / 1_000_000) * 1_000_000
}
function nextViewMilestone(n) {
  if (n < 1_000)    return 1_000
  if (n < 10_000)   return Math.ceil(n / 1_000) * 1_000
  if (n < 100_000)  return Math.ceil(n / 10_000) * 10_000
  if (n < 1_000_000) return Math.ceil(n / 100_000) * 100_000
  return Math.ceil(n / 1_000_000) * 1_000_000
}

// Sparkline. Pure SVG mini line-chart for the Feed cards. No axes, no
// labels — just the trend shape. Uses brand red by default with a soft
// gradient fill below to give the line visual weight at small sizes.
function Sparkline({
  data,
  width = 160,
  height = 48,
  stroke = '#e5251b',
  fill = 'rgba(229,37,27,0.10)',
  strokeWidth = 1.8,
}) {
  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <line x1="0" y1={height - 1} x2={width} y2={height - 1} stroke="#eef0f4" strokeWidth="1"/>
      </svg>
    )
  }
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)
  const padY = 4
  const usableH = height - padY * 2
  const points = data.map((v, i) => {
    const x = i * stepX
    const y = padY + (1 - (v - min) / range) * usableH
    return [x, y]
  })
  const pathLine = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const pathArea = `${pathLine} L${width} ${height} L0 ${height} Z`
  const gradId = `sparkfill_${Math.random().toString(36).slice(2, 8)}`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="1"/>
          <stop offset="100%" stopColor={fill} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={pathArea} fill={`url(#${gradId})`} />
      <path d={pathLine} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      {/* End dot to anchor the line on the right */}
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="2.5" fill={stroke}/>
    </svg>
  )
}

// Rich hero stat card. Replaces the small milestone tile pattern with one
// roomier card per metric: label, big number, delta chip, distance to
// next milestone, AND a real 28-day sparkline of the underlying series.
// This is the "wow" surface — the page top should feel alive, not flat.
function HeroStatCard({ label, value, raw, kind, delta, deltaSuffix, series }) {
  const target = kind === 'subs' ? nextSubMilestone(raw || 0) : nextViewMilestone(raw || 0)
  const pct    = target > 0 ? Math.max(2, Math.min(100, (raw / target) * 100)) : 0
  const hasDelta = delta !== null && delta !== undefined && !Number.isNaN(Number(delta))
  const deltaNum = hasDelta ? Number(delta) : 0
  const deltaPositive = deltaNum >= 0
  const deltaColor = !hasDelta ? C.text3 : deltaPositive ? C.green : C.red
  const deltaBg    = !hasDelta ? 'transparent' : deltaPositive ? 'rgba(5,150,105,0.08)' : 'rgba(229,37,27,0.07)'
  const deltaBdr   = !hasDelta ? 'transparent' : deltaPositive ? 'rgba(5,150,105,0.20)' : 'rgba(229,37,27,0.20)'

  return (
    <div className="ytg-stat-card" style={{ padding: '18px 20px 16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        {/* Left: number + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: C.text3,
            }}>{label}</p>
            {hasDelta && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                fontSize: 10.5, fontWeight: 700, color: deltaColor,
                background: deltaBg, border: `1px solid ${deltaBdr}`,
                padding: '1px 7px', borderRadius: 100,
                letterSpacing: '-0.05px',
                fontVariantNumeric: 'tabular-nums',
              }}>
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ transform: deltaPositive ? 'none' : 'rotate(180deg)' }}>
                  <path d="M5 8V2M2.5 4.5 5 2l2.5 2.5"/>
                </svg>
                {deltaPositive ? '+' : ''}{fmtNum(Math.abs(deltaNum))}
              </span>
            )}
          </div>

          <p style={{
            fontSize: 34, fontWeight: 800, letterSpacing: '-1.5px',
            color: C.text1, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
            marginBottom: 14,
          }}>{value}</p>

          {/* Hairline progress + Next */}
          <div style={{
            background: '#eef0f4', borderRadius: 99, height: 3,
            overflow: 'hidden', marginBottom: 6,
          }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: 'linear-gradient(90deg, rgba(229,37,27,0.55) 0%, #e5251b 100%)',
              borderRadius: 99,
              transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
            }}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <p style={{ fontSize: 10.5, fontWeight: 600, color: C.text3, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
              Next: <span style={{ color: C.text1, fontWeight: 700 }}>{fmtNum(target)}</span>
            </p>
            {hasDelta && (
              <p style={{ fontSize: 10.5, fontWeight: 500, color: C.text3, letterSpacing: '-0.01em' }}>
                {deltaSuffix || ''}
              </p>
            )}
          </div>
        </div>

        {/* Right: real 28-day sparkline. When analytics isn't connected
            (no series), shows a soft prompt instead of a dead line so
            the card doesn't look broken. */}
        {series && series.length >= 2 ? (
          <div style={{ flexShrink: 0, alignSelf: 'stretch', display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
            <Sparkline data={series} width={180} height={68} />
          </div>
        ) : (
          <div style={{
            flexShrink: 0, alignSelf: 'stretch',
            width: 180, minHeight: 68,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 6, paddingBottom: 4,
            background: 'rgba(15,15,19,0.025)',
            border: '1px dashed rgba(15,15,19,0.08)',
            borderRadius: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="rgba(10,10,15,0.30)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 14l4-5 3 3 4-6 3 4"/>
            </svg>
            <p style={{
              fontSize: 10, fontWeight: 700, color: 'rgba(10,10,15,0.40)',
              letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center',
              lineHeight: 1.3,
            }}>Connect Analytics<br/>for 28d trend</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Hero tile with a milestone-progress bar. Matches VidIQ's two-tile pattern
// at the top of their feed: big number, target on the right, a thin bar
// showing distance to the next round milestone, optional delta chip below.
function MilestoneHeroTile({ label, value, raw, kind, delta, deltaSuffix, deltaIsAbsolute }) {
  const target = kind === 'subs' ? nextSubMilestone(raw || 0) : nextViewMilestone(raw || 0)
  const pct    = target > 0 ? Math.max(2, Math.min(100, (raw / target) * 100)) : 0
  const hasDelta = delta !== null && delta !== undefined && !Number.isNaN(Number(delta))
  const deltaNum = hasDelta ? Number(delta) : 0
  const deltaPositive = deltaNum >= 0
  const deltaColor = !hasDelta ? C.text3 : deltaPositive ? C.green : C.red
  const deltaBg    = !hasDelta ? 'transparent' : deltaPositive ? 'rgba(5,150,105,0.08)' : 'rgba(229,37,27,0.07)'
  const deltaBdr   = !hasDelta ? 'transparent' : deltaPositive ? 'rgba(5,150,105,0.18)' : 'rgba(229,37,27,0.18)'

  return (
    <div className="ytg-stat-card" style={{ padding: '14px 16px 12px' }}>
      {/* Top row: tiny label · optional delta chip */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 10, marginBottom: 6,
      }}>
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.11em',
          textTransform: 'uppercase', color: C.text3,
        }}>{label}</p>
        {hasDelta && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 10.5, fontWeight: 700, color: deltaColor,
            background: deltaBg, border: `1px solid ${deltaBdr}`,
            padding: '1px 7px', borderRadius: 100,
            letterSpacing: '-0.05px',
            fontVariantNumeric: 'tabular-nums',
          }}>
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ transform: deltaPositive ? 'none' : 'rotate(180deg)' }}>
              <path d="M5 8V2M2.5 4.5 5 2l2.5 2.5"/>
            </svg>
            {deltaPositive ? '+' : ''}{fmtNum(Math.abs(deltaNum))}
          </span>
        )}
      </div>

      {/* Big number */}
      <p style={{
        fontSize: 28, fontWeight: 800, letterSpacing: '-1.2px',
        color: C.text1, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
        marginBottom: 9,
      }}>{value}</p>

      {/* Hairline progress to next milestone */}
      <div style={{
        position: 'relative',
        background: '#eef0f4', borderRadius: 99, height: 3,
        overflow: 'hidden',
        marginBottom: 5,
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: 'linear-gradient(90deg, rgba(229,37,27,0.55) 0%, #e5251b 100%)',
          borderRadius: 99,
          transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
        }}/>
      </div>

      <p style={{ fontSize: 10.5, fontWeight: 600, color: C.text3, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
        Next: <span style={{ color: C.text1, fontWeight: 700 }}>{fmtNum(target)}</span>
      </p>
    </div>
  )
}

// Filter pills row. Same shape as the Outliers tab pills the user is used
// to, but rendered as a feed filter rather than a tab switcher.
function FeedFilterPills({ value, counts, onChange }) {
  const TABS = [
    { key: 'all',         label: 'All' },
    { key: 'actions',     label: 'Actions' },
    { key: 'insights',    label: 'Insights' },
    { key: 'achievements', label: 'Achievements' },
  ]
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
      {TABS.map(t => {
        const active = value === t.key
        const count = counts?.[t.key] ?? null
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange?.(t.key)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '8px 14px', borderRadius: 100,
              border: `1px solid ${active ? C.red : '#e6e6ec'}`,
              background: active ? C.red : '#fff',
              color: active ? '#fff' : C.text2,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
              cursor: 'pointer',
              boxShadow: active
                ? '0 1px 3px rgba(229,37,27,0.30)'
                : '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(15,15,19,0.04)'; e.currentTarget.style.color = C.text1 } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = C.text2 } }}
          >
            {t.label}
            {count != null && count > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 18, height: 18, padding: '0 6px',
                borderRadius: 100,
                fontSize: 10.5, fontWeight: 800,
                background: active ? 'rgba(255,255,255,0.22)' : '#fafafb',
                color: active ? '#fff' : C.text3,
              }}>{count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// Generic Feed card wrapper. Eyebrow row (tinted-circle Lucide icon +
// category label + age) on top, body slot below, optional dismiss x.
// Every card on the Feed shares this shell so the design language reads
// as one system, not a pile of bespoke surfaces.
function FeedCard({
  Icon,                // Lucide icon component
  iconColor = '#e5251b',
  iconBg = 'rgba(229,37,27,0.08)',
  category,
  age,
  onDismiss,
  rightSlot,
  children,
  fillHeight = false,  // true when card lives in a 2-up grid row so both
                       // cards match heights and the bottom action row
                       // stays anchored to the card's bottom.
}) {
  return (
    <article style={{
      background: '#ffffff',
      border: '1px solid #ececf0',
      borderRadius: 12,
      padding: '14px 18px 16px 18px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 3px 10px rgba(0,0,0,0.05)',
      marginBottom: 12,
      fontFamily: "'Inter', system-ui, sans-serif",
      transition: 'box-shadow 0.18s ease, transform 0.18s ease',
      height: fillHeight ? '100%' : 'auto',
      display: fillHeight ? 'flex' : 'block',
      flexDirection: fillHeight ? 'column' : undefined,
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08), 0 14px 32px rgba(0,0,0,0.08)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04), 0 3px 10px rgba(0,0,0,0.05)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 9,
        marginBottom: 10,
      }}>
        <span style={{
          flexShrink: 0,
          width: 24, height: 24, borderRadius: 7,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: iconBg,
          color: iconColor,
        }}>
          <Icon size={13} strokeWidth={2.1} />
        </span>
        <span style={{
          fontSize: 10, fontWeight: 800, color: C.text3,
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>{category}</span>
        {age && (
          <span style={{ fontSize: 11, color: C.text3, fontWeight: 500, letterSpacing: '-0.01em' }}>
            · {age}
          </span>
        )}
        <div style={{ flex: 1 }}/>
        {rightSlot}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{
              width: 22, height: 22, borderRadius: 6,
              border: 'none', background: 'transparent',
              color: 'rgba(10,10,15,0.36)',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.14s ease, color 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,15,19,0.06)'; e.currentTarget.style.color = '#0a0a0f' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(10,10,15,0.36)' }}
          >
            <XIcon size={12} strokeWidth={2.1} />
          </button>
        )}
      </div>
      {fillHeight ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      ) : children}
    </article>
  )
}

// Priority Action card. Collapsed first: lighter headline + meta + CTAs.
// The impact pill in the eyebrow already signals weight, so no redundant
// impact bar. Prose lives behind Detail.
function PriorityActionCard({ action, rank, total, impact, onAct, onDone, onDismiss, ctaLabel }) {
  const [open, setOpen] = useState(false)
  const impactKey = (impact || 'med').toLowerCase()
  const impactClr = impactKey === 'high' ? C.red : impactKey === 'low' ? C.text3 : C.amber
  const impactBg  = impactKey === 'high' ? 'rgba(229,37,27,0.07)' : impactKey === 'low' ? 'rgba(15,15,19,0.04)' : 'rgba(217,119,6,0.08)'
  const impactBdr = impactKey === 'high' ? 'rgba(229,37,27,0.18)' : impactKey === 'low' ? 'rgba(15,15,19,0.10)' : 'rgba(217,119,6,0.18)'

  const cat = action.category || categoryToNav(action.category, action.problem)

  return (
    <FeedCard
      Icon={Target}
      iconColor={C.red}
      iconBg="rgba(229,37,27,0.08)"
      category={`Priority Action · ${rank} of ${total}`}
      onDismiss={onDismiss}
      rightSlot={
        <span style={{
          fontSize: 9.5, fontWeight: 700, color: impactClr,
          background: impactBg, border: `1px solid ${impactBdr}`,
          padding: '3px 8px', borderRadius: 100,
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>{impactKey} impact</span>
      }
    >
      {/* Headline — lighter weight so the Actions tab doesn't read like a
          wall of bold. The eyebrow chip already signals the weight. */}
      <h3 style={{
        fontSize: 13.5, fontWeight: 600, color: C.text1,
        letterSpacing: '-0.15px', lineHeight: 1.45,
        marginBottom: 10,
      }}>{action.problem || action.action || 'Action'}</h3>

      {/* Meta row + CTAs + Detail chevron */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 11, fontWeight: 500, color: C.text3,
          letterSpacing: '-0.01em',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: 99, background: impactClr }}/>
          {cat}
        </span>

        <div style={{ flex: 1 }}/>

        <button
          type="button"
          onClick={onAct}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '7px 13px', borderRadius: 100,
            border: 'none', cursor: 'pointer',
            background: C.red, color: '#fff',
            fontFamily: 'inherit',
            fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
            boxShadow: '0 1px 3px rgba(229,37,27,0.30)',
            transition: 'filter 0.14s ease, transform 0.14s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          {ctaLabel || 'Open tool'}
          <ArrowRight size={12} strokeWidth={2.4} />
        </button>

        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Hide detail' : 'Show detail'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '6px 11px', borderRadius: 100,
            border: '1px solid #e6e6ec',
            background: '#fff', color: C.text2,
            fontFamily: 'inherit',
            fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
            cursor: 'pointer',
            transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,15,19,0.04)'; e.currentTarget.style.color = C.text1; e.currentTarget.style.borderColor = '#d0d0d8' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = C.text2; e.currentTarget.style.borderColor = '#e6e6ec' }}
        >
          Detail
          <ChevronDown size={11} strokeWidth={2.4} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}/>
        </button>
      </div>

      {/* Detail (collapsed by default). The Fix and Why blocks each get
          a tinted card so they don't sit on plain white. Fix = red tint
          (this is the action, matches the card's brand identity); Why =
          green tint (the positive outcome). Mirrors the Insight Card
          pattern in the legacy audit detail. */}
      {open && (
        <div style={{
          marginTop: 14, paddingTop: 14,
          borderTop: '1px solid #f1f1f4',
        }}>
          {(() => {
            const showFix = action.action && action.action !== action.problem
            const showWhy = !!action.expected_outcome
            if (!showFix && !showWhy) return null
            return (
              <div style={{
                display: 'grid',
                gridTemplateColumns: showFix && showWhy ? '1fr 1fr' : '1fr',
                gap: 10, marginBottom: 14,
              }}>
                {showFix && (
                  <div style={{
                    background: 'rgba(229,37,27,0.05)',
                    border: '1px solid rgba(229,37,27,0.12)',
                    borderLeft: `3px solid ${C.red}`,
                    borderRadius: '0 10px 10px 0',
                    padding: '11px 14px',
                  }}>
                    <p style={{
                      fontSize: 9.5, fontWeight: 700, color: C.red,
                      letterSpacing: '0.10em', textTransform: 'uppercase',
                      marginBottom: 6,
                    }}>Fix</p>
                    <p style={{
                      fontSize: 12.5, fontWeight: 500, color: C.text1,
                      letterSpacing: '-0.01em', lineHeight: 1.65,
                    }}>{action.action}</p>
                  </div>
                )}
                {showWhy && (
                  <div style={{
                    background: 'rgba(5,150,105,0.06)',
                    border: '1px solid rgba(5,150,105,0.14)',
                    borderLeft: `3px solid ${C.green}`,
                    borderRadius: '0 10px 10px 0',
                    padding: '11px 14px',
                  }}>
                    <p style={{
                      fontSize: 9.5, fontWeight: 700, color: C.green,
                      letterSpacing: '0.10em', textTransform: 'uppercase',
                      marginBottom: 6,
                    }}>Why this works</p>
                    <p style={{
                      fontSize: 12.5, fontWeight: 500, color: C.text1,
                      letterSpacing: '-0.01em', lineHeight: 1.65,
                    }}>{action.expected_outcome}</p>
                  </div>
                )}
              </div>
            )
          })()}
          <button
            type="button"
            onClick={onDone}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 100,
              border: '1px solid #e6e6ec',
              background: '#fff', color: C.text2,
              fontFamily: 'inherit',
              fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
              cursor: 'pointer',
              transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,15,19,0.04)'; e.currentTarget.style.color = C.text1; e.currentTarget.style.borderColor = '#d0d0d8' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = C.text2; e.currentTarget.style.borderColor = '#e6e6ec' }}
          >
            Mark done
          </button>
        </div>
      )}
    </FeedCard>
  )
}

// Milestone Unlocked card. Collapsed first: headline + a "100% bar" visual
// confirming the threshold was crossed + Share CTA. The celebration line
// lives behind a Detail chevron.
function MilestoneFeedCard({ milestone, onShare, onDownload, onDismiss }) {
  const [open, setOpen] = useState(false)
  return (
    <FeedCard
      Icon={Trophy}
      iconColor={C.amber}
      iconBg="rgba(217,119,6,0.10)"
      category="Milestone Unlocked"
      age={milestone.earned_age || ''}
      onDismiss={onDismiss}
    >
      <h3 style={{
        fontSize: 15, fontWeight: 700, color: C.text1,
        letterSpacing: '-0.25px', lineHeight: 1.35,
        marginBottom: 12,
      }}>{milestone.headline}</h3>

      {/* Visual band: filled-to-100 bar in amber, signalling crossed */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          position: 'relative',
          background: '#eef0f4', borderRadius: 99, height: 6,
          overflow: 'hidden',
        }}>
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(90deg, rgba(217,119,6,0.55) 0%, #d97706 100%)',
            borderRadius: 99,
          }}/>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 11.5, fontWeight: 500, color: C.text3, letterSpacing: '-0.01em',
        }}>Achievement unlocked</span>
        <div style={{ flex: 1 }}/>
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '7px 13px', borderRadius: 100,
              border: 'none', cursor: 'pointer',
              background: C.red, color: '#fff',
              fontFamily: 'inherit',
              fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
              boxShadow: '0 1px 3px rgba(229,37,27,0.30)',
              transition: 'filter 0.14s ease, transform 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Share milestone
            <ArrowRight size={12} strokeWidth={2.4} />
          </button>
        )}
        {milestone.body && (
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Hide detail' : 'Show detail'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '6px 11px', borderRadius: 100,
              border: '1px solid #e6e6ec',
              background: '#fff', color: C.text2,
              fontFamily: 'inherit',
              fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
              cursor: 'pointer',
              transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,15,19,0.04)'; e.currentTarget.style.color = C.text1; e.currentTarget.style.borderColor = '#d0d0d8' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = C.text2; e.currentTarget.style.borderColor = '#e6e6ec' }}
          >
            Detail
            <ChevronDown size={11} strokeWidth={2.4} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}/>
          </button>
        )}
      </div>

      {open && milestone.body && (
        <div style={{
          marginTop: 14, paddingTop: 14,
          borderTop: '1px solid #f1f1f4',
        }}>
          <p style={{
            fontSize: 12.5, fontWeight: 500, color: C.text2,
            letterSpacing: '-0.01em', lineHeight: 1.65,
          }}>{milestone.body}</p>
        </div>
      )}
    </FeedCard>
  )
}

// Content Mix card. Collapsed first: headline + stacked Shorts-vs-Long
// bar + a single-line recommendation. The AI insight prose lives behind
// Detail. Uses fillHeight so it pairs cleanly with Channel Health in a
// 2-up grid row.
function ContentMixFeedCard({ patterns, mix, onDismiss, fillHeight = false }) {
  const [open, setOpen] = useState(false)
  if (!patterns) return null
  const sCount = mix?.shortsCount ?? null
  const lCount = mix?.longsCount ?? null
  const total = (sCount ?? 0) + (lCount ?? 0)
  const sPct = total > 0 ? Math.round(((sCount || 0) / total) * 100) : 50
  const lPct = 100 - sPct

  // Short recommendation that fills the visual gap and tells the user what
  // to do next. Picked from real signals (shorts vs long performance, or
  // the mix balance if performance is unknown).
  const shortAvg = patterns.shortAvg || 0
  const longAvg  = patterns.longAvg  || 0
  let recommendation
  if (shortAvg > longAvg * 1.5) {
    recommendation = 'Shorts are pulling new viewers. Add 2-3 per week.'
  } else if (longAvg > shortAvg * 1.5) {
    recommendation = 'Long-form is your strength. Keep building depth.'
  } else if (sPct < 15 && total > 5) {
    recommendation = 'Almost no Shorts. Test the format for discovery reach.'
  } else if (sPct > 85 && total > 5) {
    recommendation = 'Heavy on Shorts. Add long-form to deepen retention.'
  } else {
    recommendation = 'Healthy mix. Lean into whichever format wins this month.'
  }

  return (
    <FeedCard
      Icon={BarChart3}
      iconColor={C.text1}
      iconBg="rgba(15,15,19,0.06)"
      category="Content Mix"
      onDismiss={onDismiss}
      fillHeight={fillHeight}
    >
      <h3 style={{
        fontSize: 15, fontWeight: 700, color: C.text1,
        letterSpacing: '-0.25px', lineHeight: 1.35,
        marginBottom: 12,
      }}>{patterns.headline || 'Your content mix'}</h3>

      <div style={{ marginBottom: 10 }}>
        <div style={{
          display: 'flex',
          background: '#eef0f4', borderRadius: 99, height: 7,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${sPct}%`, height: '100%',
            background: 'linear-gradient(90deg, rgba(229,37,27,0.55) 0%, #e5251b 100%)',
          }}/>
          <div style={{
            width: `${lPct}%`, height: '100%',
            background: 'linear-gradient(90deg, rgba(15,15,19,0.45) 0%, rgba(15,15,19,0.72) 100%)',
          }}/>
        </div>
      </div>

      {/* Legend row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 11.5, fontWeight: 500, color: C.text2, letterSpacing: '-0.01em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: '#e5251b' }}/>
          Shorts {sCount != null && (<><strong style={{ color: C.text1, fontWeight: 700 }}> {sCount}</strong> · {sPct}%</>)}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 11.5, fontWeight: 500, color: C.text2, letterSpacing: '-0.01em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: 'rgba(15,15,19,0.72)' }}/>
          Long {lCount != null && (<><strong style={{ color: C.text1, fontWeight: 700 }}> {lCount}</strong> · {lPct}%</>)}
        </span>
      </div>

      {/* Recommendation line — fills the height gap with real signal */}
      <p style={{
        fontSize: 12.5, fontWeight: 500, color: C.text2,
        letterSpacing: '-0.01em', lineHeight: 1.55,
        marginBottom: 14,
      }}>
        <span style={{ fontWeight: 700, color: C.text1 }}>Recommendation: </span>
        {recommendation}
      </p>

      {/* Action row — pinned to the bottom when fillHeight is on */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        marginTop: fillHeight ? 'auto' : 0,
        paddingTop: fillHeight ? 4 : 0,
      }}>
        <div style={{ flex: 1 }}/>
        {(patterns.body || patterns.text) && (
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Hide detail' : 'Show detail'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '6px 11px', borderRadius: 100,
              border: '1px solid #e6e6ec',
              background: '#fff', color: C.text2,
              fontFamily: 'inherit',
              fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
              cursor: 'pointer',
              transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,15,19,0.04)'; e.currentTarget.style.color = C.text1; e.currentTarget.style.borderColor = '#d0d0d8' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = C.text2; e.currentTarget.style.borderColor = '#e6e6ec' }}
          >
            Detail
            <ChevronDown size={11} strokeWidth={2.4} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}/>
          </button>
        )}
      </div>

      {open && (patterns.body || patterns.text) && (
        <div style={{
          marginTop: 14, paddingTop: 14,
          borderTop: '1px solid #f1f1f4',
        }}>
          <p style={{
            fontSize: 12.5, fontWeight: 500, color: C.text2,
            letterSpacing: '-0.01em', lineHeight: 1.65,
          }}>{patterns.body || patterns.text || ''}</p>
        </div>
      )}
    </FeedCard>
  )
}

// Channel Health card. Collapsed first: one bold line of state + a row of
// per-category score dots (visual), with the score chip on the right of
// the eyebrow. The full audit (priority actions checklist, category bars,
// quick wins, biggest risk) renders below when expanded.
function ChannelHealthFeedCard({ score, categories, weakest, children, open, onToggle, fillHeight = false }) {
  const scoreClr =
    score >= 75 ? C.green : score >= 50 ? C.amber : C.red
  const scoreBdr =
    score >= 75 ? 'rgba(5,150,105,0.25)' : score >= 50 ? 'rgba(217,119,6,0.22)' : 'rgba(229,37,27,0.22)'
  const scoreBg =
    score >= 75 ? 'rgba(5,150,105,0.06)' : score >= 50 ? 'rgba(217,119,6,0.06)' : 'rgba(229,37,27,0.05)'

  // Map each category score to a dot color. We surface the 5 categories
  // VidIQ users instantly recognise: CTR, retention, strategy,
  // consistency, engagement. Hover reveals the label + score.
  const dotFor = (v) => {
    if (v == null) return { c: '#dcdde3', bdr: '#dcdde3' }
    if (v >= 75) return { c: C.green, bdr: 'rgba(5,150,105,0.35)' }
    if (v >= 50) return { c: C.amber, bdr: 'rgba(217,119,6,0.35)' }
    return { c: C.red, bdr: 'rgba(229,37,27,0.30)' }
  }
  const dots = (categories || []).map(([label, value]) => ({ label, value, ...dotFor(value) }))

  return (
    <FeedCard
      Icon={Activity}
      iconColor={scoreClr}
      iconBg={scoreBg}
      category="Channel Health"
      fillHeight={fillHeight}
      rightSlot={
        <span style={{
          display: 'inline-flex', alignItems: 'baseline', gap: 2,
          padding: '3px 10px', borderRadius: 100,
          border: `1px solid ${scoreBdr}`,
          background: scoreBg,
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: scoreClr, letterSpacing: '-0.3px', lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: C.text3 }}>/100</span>
        </span>
      }
    >
      <h3 style={{
        fontSize: 15, fontWeight: 700, color: C.text1,
        letterSpacing: '-0.25px', lineHeight: 1.35,
        marginBottom: 12,
      }}>
        {score >= 75 ? 'Your channel is healthy. Keep doing what works.'
          : score >= 50 ? "Solid, with clear room to improve."
          : 'Underperforming for your size. Fix list below.'}
      </h3>

      {/* Visual band: per-category dots */}
      {dots.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          marginBottom: 12,
        }}>
          {dots.map(d => (
            <span
              key={d.label}
              title={`${d.label}: ${d.value ?? '—'}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <span style={{
                width: 10, height: 10, borderRadius: 99,
                background: d.c, border: `1px solid ${d.bdr}`,
              }}/>
              <span style={{ fontSize: 11.5, fontWeight: 500, color: C.text3, letterSpacing: '-0.01em' }}>{d.label}</span>
            </span>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        marginTop: fillHeight ? 'auto' : 0,
        paddingTop: fillHeight ? 4 : 0,
      }}>
        {weakest && weakest.length > 0 && (
          <span style={{ fontSize: 11.5, fontWeight: 500, color: C.text3, letterSpacing: '-0.01em' }}>
            Weakest: <span style={{ color: C.text2, fontWeight: 600 }}>{weakest.join(', ')}</span>
          </span>
        )}
        <div style={{ flex: 1 }}/>
        <button
          type="button"
          onClick={onToggle}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '6px 11px', borderRadius: 100,
            border: '1px solid #e6e6ec',
            background: '#fff', color: C.text2,
            fontFamily: 'inherit',
            fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
            cursor: 'pointer',
            transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,15,19,0.04)'; e.currentTarget.style.color = C.text1; e.currentTarget.style.borderColor = '#d0d0d8' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = C.text2; e.currentTarget.style.borderColor = '#e6e6ec' }}
        >
          {open ? 'Hide audit' : 'See full audit'}
          <ChevronDown size={11} strokeWidth={2.4} style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}/>
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 18 }}>
          {children}
        </div>
      )}
    </FeedCard>
  )
}

// Top Performer card. Celebrates the user's strongest video this month
// instead of only nagging about problems. Real thumbnail on the left, the
// title + a "X.Xx your average" multiplier on the right. This is the
// single most powerful retention card we ship: the user sees a win.
function TopPerformerCard({ video, channelAvgViews, onOpen, onDismiss }) {
  if (!video) return null
  const multiplier = channelAvgViews > 0 ? (video.views / channelAvgViews) : 0
  const mDisplay = multiplier >= 10 ? `${multiplier.toFixed(0)}x`
    : multiplier >= 1 ? `${multiplier.toFixed(1)}x`
    : null
  const engagement = video.views > 0
    ? Number(((video.likes || 0) / video.views * 100).toFixed(2))
    : 0
  const ageDays = video.published_at
    ? Math.floor((Date.now() - new Date(video.published_at).getTime()) / 86400000)
    : null
  const ageStr = ageDays == null ? '' : ageDays === 0 ? 'today' : ageDays === 1 ? 'yesterday' : `${ageDays}d ago`

  return (
    <FeedCard
      Icon={Trophy}
      iconColor={C.green}
      iconBg="rgba(5,150,105,0.08)"
      category="Top Performer"
      age={ageStr}
      onDismiss={onDismiss}
      rightSlot={mDisplay && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: 10.5, fontWeight: 800, color: C.green,
          background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.22)',
          padding: '3px 8px', borderRadius: 100,
          letterSpacing: '-0.05px',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {mDisplay} your avg
        </span>
      )}
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        {/* Thumbnail */}
        {video.thumbnail ? (
          <div style={{
            flexShrink: 0, width: 200, aspectRatio: '16/9',
            borderRadius: 10, overflow: 'hidden',
            background: '#ebebef',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 18px rgba(0,0,0,0.08)',
          }}>
            <img
              src={video.thumbnail}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ) : (
          <div style={{
            flexShrink: 0, width: 200, aspectRatio: '16/9',
            borderRadius: 10, background: '#ebebef',
          }}/>
        )}

        {/* Right side: title + metrics */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            fontSize: 15, fontWeight: 700, color: C.text1,
            letterSpacing: '-0.25px', lineHeight: 1.4,
            marginBottom: 12,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{video.title}</h3>

          {/* Three-stat row */}
          <div style={{ display: 'flex', gap: 22, marginBottom: 'auto', alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Views</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(video.views || 0)}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Likes</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(video.likes || 0)}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Engagement</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: engagement >= 3 ? C.green : C.text1, letterSpacing: '-0.5px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{engagement}%</p>
            </div>
          </div>

          {/* CTA row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            <span style={{ fontSize: 11.5, fontWeight: 500, color: C.text3, letterSpacing: '-0.01em' }}>
              Replicate this format
            </span>
            <div style={{ flex: 1 }}/>
            {onOpen && (
              <button
                type="button"
                onClick={onOpen}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '7px 13px', borderRadius: 100,
                  border: 'none', cursor: 'pointer',
                  background: C.red, color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
                  boxShadow: '0 1px 3px rgba(229,37,27,0.30)',
                  transition: 'filter 0.14s ease, transform 0.14s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Study video
                <ArrowRight size={12} strokeWidth={2.4} />
              </button>
            )}
          </div>
        </div>
      </div>
    </FeedCard>
  )
}


// Compute posting cadence stats from the channel's videos array. All
// counts use the past 28 days. Returns the per-day upload grid (28
// entries, oldest first), the current streak (consecutive days from
// today backwards with at least one upload), the longest 28-day
// streak, and the simple count + pace numbers.
function computePostingStats(videos) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const dayMs = 86400000
  const daysBack = 28

  // Bin uploads per day, keyed by days-ago (0 = today).
  const perDay = new Array(daysBack).fill(0)
  for (const v of videos || []) {
    if (!v.published_at) continue
    const t = new Date(v.published_at).getTime()
    if (Number.isNaN(t)) continue
    const daysAgo = Math.floor((now.getTime() - t) / dayMs)
    if (daysAgo >= 0 && daysAgo < daysBack) perDay[daysAgo] += 1
  }

  const count = perDay.reduce((s, n) => s + n, 0)
  const pacePerWeek = (count / (daysBack / 7))

  // Current streak: walk back from today (allowing today to be empty).
  let currentStreak = 0
  for (let i = 0; i < daysBack; i++) {
    if (perDay[i] > 0) currentStreak += 1
    else if (i === 0) continue // skip today if empty so a yesterday-upload still counts as 1d streak
    else break
  }

  // Longest streak inside the 28-day window.
  let longestStreak = 0
  let run = 0
  for (let i = 0; i < daysBack; i++) {
    if (perDay[i] > 0) { run += 1; longestStreak = Math.max(longestStreak, run) }
    else run = 0
  }

  // Grid for rendering: oldest -> newest (left to right when 7 cols x 4 rows
  // with rows = weeks). We return 28 entries in REVERSE of perDay so index 0
  // is 27 days ago and index 27 is today.
  const gridOldestFirst = perDay.slice().reverse()

  return {
    count,
    pacePerWeek: Number(pacePerWeek.toFixed(1)),
    currentStreak,
    longestStreak,
    gridOldestFirst,
  }
}

// Posting timeline chart. Real SVG cumulative line chart, not a tile of
// squares. Shows the climb each upload day with soft red area fill, white
// dots at each upload event, and real date labels along the bottom.
function PostingTimeline({ uploadDays }) {
  const width = 720
  const height = 110
  const padX = 6
  const padTop = 8
  const padBot = 22 // room for date labels
  const usableW = width - padX * 2
  const usableH = height - padTop - padBot

  // Cumulative uploads array (28 entries).
  const cumulative = []
  let total = 0
  for (const c of uploadDays) { total += c; cumulative.push(total) }

  // If zero uploads, render a flat baseline with "no activity" label.
  if (total === 0) {
    return (
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        <line x1={padX} y1={height - padBot} x2={width - padX} y2={height - padBot} stroke="#eef0f4" strokeWidth="1.2"/>
        <text x={width / 2} y={height / 2} textAnchor="middle" fontSize="12" fontWeight="600" fill="rgba(10,10,15,0.40)">No uploads in this window</text>
      </svg>
    )
  }

  const maxY = Math.max(total, 1)
  const points = cumulative.map((v, i) => {
    const x = padX + (i / (cumulative.length - 1)) * usableW
    const y = padTop + (1 - v / maxY) * usableH
    return [x, y]
  })
  const uploadIdxes = uploadDays.reduce((acc, c, i) => (c > 0 ? [...acc, i] : acc), [])

  const pathLine = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')
  const pathArea = `${pathLine} L${points[points.length - 1][0]} ${height - padBot} L${points[0][0]} ${height - padBot} Z`

  // Date labels: 5 points across (today, ~week ago, ~2wk ago, ~3wk ago, 28d ago).
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const labelIdxes = [0, 7, 14, 21, 27]
  const labels = labelIdxes.map(idx => {
    const d = new Date(today.getTime() - (27 - idx) * 86400000)
    const x = padX + (idx / 27) * usableW
    return {
      x,
      label: idx === 27 ? 'Today' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      anchor: idx === 0 ? 'start' : idx === 27 ? 'end' : 'middle',
    }
  })

  // Y-axis tick marks (faint horizontal guides) at quartiles.
  const guides = [0.25, 0.5, 0.75].map(p => padTop + (1 - p) * usableH)

  const gradId = `posting_grad_${Math.random().toString(36).slice(2, 8)}`

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(229,37,27,0.22)"/>
          <stop offset="100%" stopColor="rgba(229,37,27,0)"/>
        </linearGradient>
      </defs>

      {/* Faint horizontal guides */}
      {guides.map((y, i) => (
        <line key={i} x1={padX} y1={y} x2={width - padX} y2={y} stroke="#f1f1f4" strokeWidth="1" strokeDasharray="2 4"/>
      ))}

      {/* Baseline */}
      <line x1={padX} y1={height - padBot} x2={width - padX} y2={height - padBot} stroke="#e6e6ec" strokeWidth="1"/>

      {/* Area + line */}
      <path d={pathArea} fill={`url(#${gradId})`}/>
      <path d={pathLine} fill="none" stroke="#e5251b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Upload-day dots */}
      {uploadIdxes.map(i => (
        <circle key={i} cx={points[i][0]} cy={points[i][1]} r="3.6" fill="#fff" stroke="#e5251b" strokeWidth="2"/>
      ))}

      {/* X-axis date labels */}
      {labels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={height - 6}
          textAnchor={l.anchor}
          fontSize="9.5"
          fontWeight="600"
          fill="rgba(10,10,15,0.40)"
          letterSpacing="0.04em"
        >{l.label}</text>
      ))}
    </svg>
  )
}

// Small stat tile used in card-bottom strips. Tight, uppercase label,
// chunky value, single-line hint underneath.
function StatTile({ label, value, hint, valueColor }) {
  return (
    <div>
      <p style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(10,10,15,0.40)', letterSpacing: '0.11em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</p>
      <p style={{ fontSize: 17, fontWeight: 700, color: valueColor || '#0a0a0f', letterSpacing: '-0.4px', lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>{value}</p>
      {hint && <p style={{ fontSize: 10.5, fontWeight: 500, color: 'rgba(10,10,15,0.40)', letterSpacing: '-0.01em' }}>{hint}</p>}
    </div>
  )
}

// Posting Consistency card v2. Real SaaS chart (cumulative line) as the
// primary visual, 4-stat strip across the bottom. The legacy 28-day
// heatmap lives in Detail-expanded state for users who want the
// per-day breakdown.
function PostingConsistencyCard({ videos, onDismiss }) {
  const [open, setOpen] = useState(false)
  const stats = computePostingStats(videos)
  const { count, pacePerWeek, currentStreak, longestStreak, gridOldestFirst } = stats

  if (count === 0) return null

  const verdict = pacePerWeek >= 3 ? 'Strong pace for your size'
    : pacePerWeek >= 1 ? 'Healthy weekly cadence'
    : pacePerWeek > 0 ? 'Posting irregularly'
    : 'No recent uploads'
  const verdictClr = pacePerWeek >= 3 ? C.green
    : pacePerWeek >= 1 ? C.text2
    : C.amber

  const headline = currentStreak >= 7 ? `${currentStreak}-day posting streak`
    : currentStreak >= 3 ? `On a ${currentStreak}-day streak`
    : count >= 8 ? `${count} videos in 28 days`
    : pacePerWeek >= 1 ? `Posting ${pacePerWeek}× per week`
    : `${count} ${count === 1 ? 'video' : 'videos'} in 28 days`

  // Cell color for the (now collapsed) detail heatmap.
  const cellColor = (n) => {
    if (n === 0) return '#eef0f4'
    if (n === 1) return 'rgba(229,37,27,0.40)'
    if (n === 2) return 'rgba(229,37,27,0.70)'
    return '#e5251b'
  }

  return (
    <FeedCard
      Icon={CalendarDays}
      iconColor={C.text1}
      iconBg="rgba(15,15,19,0.06)"
      category="Posting Consistency · 28 days"
      onDismiss={onDismiss}
      rightSlot={currentStreak >= 2 && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10.5, fontWeight: 800, color: C.red,
          background: 'rgba(229,37,27,0.07)', border: '1px solid rgba(229,37,27,0.20)',
          padding: '3px 8px', borderRadius: 100,
          letterSpacing: '-0.05px', fontVariantNumeric: 'tabular-nums',
        }}>
          <Flame size={10} strokeWidth={2.4} />
          {currentStreak}d streak
        </span>
      )}
    >
      {/* Headline + verdict on one row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <h3 style={{
          fontSize: 18, fontWeight: 700, color: C.text1,
          letterSpacing: '-0.4px', lineHeight: 1.2,
        }}>{headline}</h3>
        <span style={{
          fontSize: 12, fontWeight: 500, color: verdictClr, letterSpacing: '-0.01em',
        }}>{verdict}</span>
      </div>

      {/* The chart */}
      <div style={{ marginBottom: 16 }}>
        <PostingTimeline uploadDays={gridOldestFirst} />
      </div>

      {/* Stat strip — 4 tiles edge to edge across the card */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
        paddingTop: 14, borderTop: '1px solid #f1f1f4',
      }}>
        <StatTile
          label="Uploads"
          value={count}
          hint="in 28 days"
        />
        <StatTile
          label="Pace"
          value={`${pacePerWeek}/wk`}
          hint={pacePerWeek >= 1 ? 'weekly cadence' : 'below weekly'}
          valueColor={verdictClr}
        />
        <StatTile
          label="Streak"
          value={`${currentStreak}d`}
          hint={currentStreak >= 3 ? 'active now' : 'inactive'}
          valueColor={currentStreak >= 3 ? C.red : null}
        />
        <StatTile
          label="Best run"
          value={`${longestStreak}d`}
          hint="in window"
        />
      </div>

      {/* Detail toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Hide heatmap' : 'Show daily heatmap'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '6px 11px', borderRadius: 100,
            border: '1px solid #e6e6ec',
            background: '#fff', color: C.text2,
            fontFamily: 'inherit',
            fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
            cursor: 'pointer',
            transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,15,19,0.04)'; e.currentTarget.style.color = C.text1; e.currentTarget.style.borderColor = '#d0d0d8' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = C.text2; e.currentTarget.style.borderColor = '#e6e6ec' }}
        >
          {open ? 'Hide heatmap' : 'Daily heatmap'}
          <ChevronDown size={11} strokeWidth={2.4} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}/>
        </button>
      </div>

      {/* Daily heatmap inside the detail expansion */}
      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f1f4' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 12 }}>
            Daily uploads — last 28 days
          </p>
          {/* Horizontal strip: 28 cells in a single row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(28, 1fr)', gap: 4 }}>
            {gridOldestFirst.map((c, i) => (
              <div
                key={i}
                title={c === 0 ? 'No upload' : c === 1 ? '1 upload' : `${c} uploads`}
                style={{
                  aspectRatio: '1 / 1',
                  borderRadius: 4,
                  background: cellColor(c),
                  border: c === 0 ? '1px solid rgba(15,15,19,0.04)' : '1px solid rgba(229,37,27,0.10)',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
            <span style={{ fontSize: 10, color: C.text3, fontWeight: 600, letterSpacing: '0.04em', marginRight: 4 }}>Less</span>
            {[0, 1, 2, 3].map(n => (
              <span key={n} style={{
                width: 11, height: 11, borderRadius: 3,
                background: cellColor(n),
                border: n === 0 ? '1px solid rgba(15,15,19,0.04)' : '1px solid rgba(229,37,27,0.10)',
              }}/>
            ))}
            <span style={{ fontSize: 10, color: C.text3, fontWeight: 600, letterSpacing: '0.04em', marginLeft: 4 }}>More</span>
          </div>
        </div>
      )}
    </FeedCard>
  )
}


// Compute per-hour and per-(day,hour) average views from the channel's
// videos. Bins by upload time (published_at). Used by BestTimeCard to
// surface the slot when the user's audience watches most.
function computeBestTime(videos) {
  if (!videos || videos.length < 5) return null

  // Per-hour aggregate: views and count across all days.
  const hourViews = new Array(24).fill(0)
  const hourCount = new Array(24).fill(0)
  // Per (dayOfWeek, hour) for the headline best slot.
  const slotViews = {}
  const slotCount = {}
  // Per dayOfWeek aggregate so we can hint "your audience is most active
  // on Sundays" even if hour-of-day data is thin.
  const dayViews = new Array(7).fill(0)
  const dayCount = new Array(7).fill(0)

  for (const v of videos) {
    if (!v.published_at) continue
    const d = new Date(v.published_at)
    if (Number.isNaN(d.getTime())) continue
    const h = d.getHours()
    const dow = d.getDay() // 0=Sun, 1=Mon...6=Sat
    const views = v.views || 0
    hourViews[h] += views
    hourCount[h] += 1
    dayViews[dow] += views
    dayCount[dow] += 1
    const key = `${dow}-${h}`
    slotViews[key] = (slotViews[key] || 0) + views
    slotCount[key] = (slotCount[key] || 0) + 1
  }

  const hourAvg = hourViews.map((v, i) => (hourCount[i] > 0 ? v / hourCount[i] : 0))
  const dayAvg  = dayViews.map((v, i) => (dayCount[i] > 0 ? v / dayCount[i] : 0))

  // Top slots: rank (day,hour) buckets with at least 1 video by avg views.
  const slotEntries = Object.keys(slotViews).map(key => {
    const [dow, h] = key.split('-').map(Number)
    return {
      dow, h,
      avg: slotViews[key] / slotCount[key],
      count: slotCount[key],
    }
  })
  slotEntries.sort((a, b) => b.avg - a.avg)
  const top = slotEntries[0] || null
  const second = slotEntries.find(s => !(s.dow === top?.dow && s.h === top?.h)) || null
  const worst = slotEntries.length > 2 ? slotEntries[slotEntries.length - 1] : null

  return {
    hourAvg,
    dayAvg,
    top,
    second,
    worst,
    sampleSize: videos.length,
  }
}

function formatHour12(h) {
  const suf = h < 12 ? 'AM' : 'PM'
  const hh  = h % 12 === 0 ? 12 : h % 12
  return `${hh} ${suf}`
}
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_LONG  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Best Time to Publish card. Bins all the channel's videos by hour of
// day and surfaces the slot with the highest avg views. The visual: a
// 24-bar mini chart of avg views per hour with the peak bar highlighted
// in brand red, plus three stat tiles below (Best, Runner-up, Avoid).
function BestTimeCard({ videos, onDismiss }) {
  const [open, setOpen] = useState(false)
  const data = computeBestTime(videos)
  if (!data || !data.top) return null

  const { hourAvg, dayAvg, top, second, worst, sampleSize } = data
  const peakHour = top.h
  const maxBar = Math.max(...hourAvg, 1)

  // Headline: best slot named in natural English.
  const headline = `Audience peaks ${DAYS_LONG[top.dow]}s around ${formatHour12(top.h)}`

  // Verdict line below the headline.
  const verdict = `Based on ${sampleSize} uploads. ${
    second
      ? `Runner-up: ${DAYS_SHORT[second.dow]} ${formatHour12(second.h)}.`
      : 'Need more uploads for a runner-up.'
  }`

  // 24-bar chart geometry.
  const chartW = 720
  const chartH = 90
  const padX = 4
  const padTop = 8
  const padBot = 22
  const barW = (chartW - padX * 2) / 24 - 2
  const usableH = chartH - padTop - padBot

  return (
    <FeedCard
      Icon={Clock}
      iconColor={C.text1}
      iconBg="rgba(15,15,19,0.06)"
      category="Best Time To Publish · your data"
      onDismiss={onDismiss}
      rightSlot={
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10.5, fontWeight: 800, color: C.red,
          background: 'rgba(229,37,27,0.07)', border: '1px solid rgba(229,37,27,0.20)',
          padding: '3px 8px', borderRadius: 100,
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          {DAYS_SHORT[top.dow]} · {formatHour12(top.h)}
        </span>
      }
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
        <h3 style={{
          fontSize: 18, fontWeight: 700, color: C.text1,
          letterSpacing: '-0.4px', lineHeight: 1.25,
        }}>{headline}</h3>
      </div>
      <p style={{
        fontSize: 12, fontWeight: 500, color: C.text3,
        letterSpacing: '-0.01em', marginBottom: 16,
      }}>{verdict}</p>

      {/* 24-bar chart of avg views per hour-of-day */}
      <div style={{ marginBottom: 16 }}>
        <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none" style={{ display: 'block' }}>
          {/* Baseline */}
          <line x1={padX} y1={chartH - padBot} x2={chartW - padX} y2={chartH - padBot} stroke="#e6e6ec" strokeWidth="1"/>
          {/* Bars */}
          {hourAvg.map((v, h) => {
            const heightPct = v / maxBar
            const barH = Math.max(2, heightPct * usableH)
            const x = padX + h * ((chartW - padX * 2) / 24) + 1
            const y = chartH - padBot - barH
            const isPeak = h === peakHour
            return (
              <rect
                key={h}
                x={x.toFixed(2)} y={y.toFixed(2)}
                width={barW.toFixed(2)} height={barH.toFixed(2)}
                rx="2" ry="2"
                fill={isPeak ? '#e5251b' : 'rgba(15,15,19,0.12)'}
              >
                <title>{`${formatHour12(h)}: ${fmtNum(Math.round(v))} avg views`}</title>
              </rect>
            )
          })}
          {/* X-axis hour labels at 0, 6, 12, 18 */}
          {[0, 6, 12, 18].map(h => {
            const x = padX + h * ((chartW - padX * 2) / 24) + barW / 2 + 1
            return (
              <text key={h} x={x} y={chartH - 6} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="rgba(10,10,15,0.40)" letterSpacing="0.04em">
                {formatHour12(h).replace(' ', '')}
              </text>
            )
          })}
          <text x={chartW - padX} y={chartH - 6} textAnchor="end" fontSize="9.5" fontWeight="600" fill="rgba(10,10,15,0.40)" letterSpacing="0.04em">
            11PM
          </text>
        </svg>
      </div>

      {/* Stat strip: Best, Runner-up, Avoid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
        paddingTop: 14, borderTop: '1px solid #f1f1f4',
      }}>
        <div>
          <p style={{ fontSize: 9.5, fontWeight: 700, color: C.red, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Best time</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.text1, letterSpacing: '-0.3px', lineHeight: 1.15, marginBottom: 4 }}>
            {DAYS_SHORT[top.dow]} · {formatHour12(top.h)}
          </p>
          <p style={{ fontSize: 11, fontWeight: 500, color: C.text3, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
            {fmtNum(Math.round(top.avg))} avg views
          </p>
        </div>
        <div>
          <p style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(10,10,15,0.40)', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Runner-up</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.text1, letterSpacing: '-0.3px', lineHeight: 1.15, marginBottom: 4 }}>
            {second ? `${DAYS_SHORT[second.dow]} · ${formatHour12(second.h)}` : '—'}
          </p>
          <p style={{ fontSize: 11, fontWeight: 500, color: C.text3, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
            {second ? `${fmtNum(Math.round(second.avg))} avg views` : 'Need more uploads'}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 9.5, fontWeight: 700, color: C.amber, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Avoid</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.text1, letterSpacing: '-0.3px', lineHeight: 1.15, marginBottom: 4 }}>
            {worst ? `${DAYS_SHORT[worst.dow]} · ${formatHour12(worst.h)}` : '—'}
          </p>
          <p style={{ fontSize: 11, fontWeight: 500, color: C.text3, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
            {worst ? `${fmtNum(Math.round(worst.avg))} avg views` : 'Need more uploads'}
          </p>
        </div>
      </div>

      {/* Detail: per-day-of-week breakdown */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Hide weekly breakdown' : 'Show weekly breakdown'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '6px 11px', borderRadius: 100,
            border: '1px solid #e6e6ec',
            background: '#fff', color: C.text2,
            fontFamily: 'inherit',
            fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
            cursor: 'pointer',
            transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,15,19,0.04)'; e.currentTarget.style.color = C.text1; e.currentTarget.style.borderColor = '#d0d0d8' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = C.text2; e.currentTarget.style.borderColor = '#e6e6ec' }}
        >
          {open ? 'Hide weekly view' : 'Weekly view'}
          <ChevronDown size={11} strokeWidth={2.4} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}/>
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f1f4' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 12 }}>
            Avg views per upload by day of week
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {dayAvg.map((avg, i) => {
              const maxDay = Math.max(...dayAvg, 1)
              const heightPct = avg / maxDay
              const isTop = i === top.dow
              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    height: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                    marginBottom: 6,
                  }}>
                    <div style={{
                      width: '60%',
                      height: `${Math.max(4, heightPct * 100)}%`,
                      background: isTop ? '#e5251b' : 'rgba(15,15,19,0.12)',
                      borderRadius: 3,
                      transition: 'height 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                    }} title={`${DAYS_LONG[i]}: ${fmtNum(Math.round(avg))} avg views`}/>
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: isTop ? C.red : C.text3, letterSpacing: '0.04em' }}>
                    {DAYS_SHORT[i].slice(0, 1)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </FeedCard>
  )
}


// Tracked Optimization Lift card. The proof loop: shows the user's best
// SEO Optimizer win. Real thumbnail on the left, title-change diff on
// the right, big +Δ views chip in the eyebrow. Single card per channel
// surfaces the strongest win; the rest live on the SEO Studio page.
function TrackedLiftCard({ win, moreCount, onOpenAll, onDismiss }) {
  if (!win) return null
  const beforeViews = win.before_views || 0
  const currentViews = win.current_views || 0
  const deltaViews = win.delta_views || 0
  const deltaPct = win.delta_pct || 0

  const titleChanged = win.before_title && win.after_title && win.before_title !== win.after_title

  const ageDays = win.optimized_at
    ? Math.floor((Date.now() - new Date(win.optimized_at).getTime()) / 86400000)
    : null
  const ageStr = ageDays == null ? '' : ageDays === 0 ? 'today' : ageDays === 1 ? 'yesterday' : `${ageDays}d ago`

  return (
    <FeedCard
      Icon={TrendingUp}
      iconColor={C.green}
      iconBg="rgba(5,150,105,0.08)"
      category="Tracked Lift · SEO Optimizer"
      age={ageStr}
      onDismiss={onDismiss}
      rightSlot={
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10.5, fontWeight: 800, color: C.green,
          background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.22)',
          padding: '3px 8px', borderRadius: 100,
          letterSpacing: '-0.05px', fontVariantNumeric: 'tabular-nums',
        }}>
          +{fmtNum(deltaViews)} views · +{deltaPct}%
        </span>
      }
    >
      <h3 style={{
        fontSize: 16, fontWeight: 700, color: C.text1,
        letterSpacing: '-0.3px', lineHeight: 1.3,
        marginBottom: 14,
      }}>Your update is outperforming the old version</h3>

      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch', marginBottom: 14 }}>
        {/* Thumbnail */}
        {win.thumbnail_url ? (
          <div style={{
            flexShrink: 0, width: 180, aspectRatio: '16/9',
            borderRadius: 10, overflow: 'hidden',
            background: '#ebebef',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 18px rgba(0,0,0,0.08)',
          }}>
            <img
              src={win.thumbnail_url}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ) : (
          <div style={{
            flexShrink: 0, width: 180, aspectRatio: '16/9',
            borderRadius: 10, background: '#ebebef',
          }}/>
        )}

        {/* Diff + numbers */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Title diff */}
          {titleChanged && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <p style={{
                fontSize: 10, fontWeight: 700, color: C.text3,
                letterSpacing: '0.10em', textTransform: 'uppercase',
              }}>Title change</p>
              <p style={{
                fontSize: 12, fontWeight: 500, color: C.text3,
                letterSpacing: '-0.01em', lineHeight: 1.4,
                textDecoration: 'line-through',
                display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>{win.before_title}</p>
              <p style={{
                fontSize: 13, fontWeight: 700, color: C.text1,
                letterSpacing: '-0.15px', lineHeight: 1.4,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>{win.after_title}</p>
            </div>
          )}

          {/* Stat row: before -> after views */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'auto auto 1fr', gap: 14, alignItems: 'flex-end',
            marginTop: 'auto',
          }}>
            <div>
              <p style={{ fontSize: 9.5, fontWeight: 700, color: C.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4 }}>Before</p>
              <p style={{ fontSize: 17, fontWeight: 700, color: C.text2, letterSpacing: '-0.4px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(beforeViews)}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', paddingTop: 14 }}>
              <ArrowRight size={16} strokeWidth={2.4} color={C.text3} />
            </div>
            <div>
              <p style={{ fontSize: 9.5, fontWeight: 700, color: C.green, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4 }}>Now</p>
              <p style={{ fontSize: 17, fontWeight: 700, color: C.text1, letterSpacing: '-0.4px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(currentViews)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: more wins + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid #f1f1f4' }}>
        <span style={{ fontSize: 11.5, fontWeight: 500, color: C.text3, letterSpacing: '-0.01em' }}>
          {moreCount > 0 ? `+ ${moreCount} more win${moreCount === 1 ? '' : 's'} this month` : 'Single tracked win'}
        </span>
        <div style={{ flex: 1 }}/>
        {onOpenAll && (
          <button
            type="button"
            onClick={onOpenAll}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '7px 13px', borderRadius: 100,
              border: 'none', cursor: 'pointer',
              background: C.red, color: '#fff',
              fontFamily: 'inherit',
              fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
              boxShadow: '0 1px 3px rgba(229,37,27,0.30)',
              transition: 'filter 0.14s ease, transform 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            See all wins
            <ArrowRight size={12} strokeWidth={2.4} />
          </button>
        )}
      </div>
    </FeedCard>
  )
}


// Daily Ideas card. Three fresh video idea concepts the user can act on
// today. Reads from the existing /video-ideas cache so the data flow
// matches the standalone Video Ideas page. Each idea row shows the
// title + angle + a single CTA that drops the title into SEO Studio so
// the user can start writing in one click.
function DailyIdeasCard({ ideas, lastUpdated, isStale, isFree, refreshing, onRefresh, onUse, onOpenAll, onDismiss }) {
  const [open, setOpen] = useState(false)
  const top3 = (ideas || []).slice(0, 3)
  if (top3.length === 0) return null

  // Subline pulled from the most recent data point. "today" feels active;
  // anything older nudges a refresh.
  const subline = isStale
    ? 'These look stale, hit refresh for fresh angles'
    : lastUpdated === 'today' ? 'Fresh ideas, generated today'
    : `Last refreshed ${lastUpdated || 'recently'}`

  return (
    <FeedCard
      Icon={Lightbulb}
      iconColor={C.amber}
      iconBg="rgba(217,119,6,0.10)"
      category="Daily Ideas"
      onDismiss={onDismiss}
      rightSlot={
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10.5, fontWeight: 700, color: C.amber,
          background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.22)',
          padding: '3px 8px', borderRadius: 100,
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          {top3.length} ready
        </span>
      }
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <h3 style={{
          fontSize: 16, fontWeight: 700, color: C.text1,
          letterSpacing: '-0.3px', lineHeight: 1.25,
        }}>Start writing one of these today</h3>
        <span style={{
          fontSize: 12, fontWeight: 500, color: isStale ? C.amber : C.text3,
          letterSpacing: '-0.01em',
        }}>{subline}</span>
      </div>

      {/* Idea rows. Each row: rank dot + title + angle + Use CTA. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        {top3.map((idea, i) => {
          const score = idea.opportunityScore != null
            ? idea.opportunityScore
            : Math.max(65, 85 - i * 4)
          const scoreClr = score >= 80 ? C.green : score >= 65 ? C.amber : C.text3
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 14px',
                background: '#fafafb',
                border: '1px solid #ececf0',
                borderRadius: 10,
                transition: 'background 0.14s ease, border-color 0.14s ease, transform 0.14s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#d6d6dc'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fafafb'; e.currentTarget.style.borderColor = '#ececf0'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {/* Rank badge */}
              <div style={{
                flexShrink: 0,
                width: 28, height: 28, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(217,119,6,0.08)',
                border: '1px solid rgba(217,119,6,0.22)',
                fontSize: 12, fontWeight: 800, color: C.amber,
                letterSpacing: '-0.3px',
                fontVariantNumeric: 'tabular-nums',
              }}>{i + 1}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Title */}
                <p style={{
                  fontSize: 13.5, fontWeight: 700, color: C.text1,
                  letterSpacing: '-0.2px', lineHeight: 1.35,
                  marginBottom: 4,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>{idea.title}</p>
                {/* Angle (one-line truncated) */}
                {idea.angle && (
                  <p style={{
                    fontSize: 11.5, fontWeight: 500, color: C.text3,
                    letterSpacing: '-0.01em', lineHeight: 1.45,
                    display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>{idea.angle}</p>
                )}
                {/* Meta: keyword + score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  {idea.targetKeyword && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: C.text3,
                      letterSpacing: '0.04em',
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
                      <span style={{ width: 4, height: 4, borderRadius: 99, background: C.text3 }}/>
                      {idea.targetKeyword}
                    </span>
                  )}
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: scoreClr,
                    letterSpacing: '0.04em',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    Score {score}
                  </span>
                </div>
              </div>

              {/* Use CTA */}
              <button
                type="button"
                onClick={() => onUse?.(idea)}
                style={{
                  flexShrink: 0, alignSelf: 'center',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '7px 13px', borderRadius: 100,
                  border: 'none', cursor: 'pointer',
                  background: C.red, color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: 11.5, fontWeight: 700, letterSpacing: '-0.01em',
                  boxShadow: '0 1px 3px rgba(229,37,27,0.28)',
                  transition: 'filter 0.14s ease, transform 0.14s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Use idea
                <ArrowRight size={11} strokeWidth={2.4} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Bottom row: refresh + open full ideas */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid #f1f1f4' }}>
        <span style={{ fontSize: 11.5, fontWeight: 500, color: C.text3, letterSpacing: '-0.01em' }}>
          {isFree ? 'Free plan shows top 3, upgrade for the full feed' : 'Full feed in Video Ideas'}
        </span>
        <div style={{ flex: 1 }}/>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 11px', borderRadius: 100,
              border: '1px solid #e6e6ec',
              background: refreshing ? '#f6f6f9' : '#fff',
              color: refreshing ? C.text3 : C.text2,
              fontFamily: 'inherit',
              fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
              cursor: refreshing ? 'wait' : 'pointer',
              transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
            }}
            onMouseEnter={e => { if (!refreshing) { e.currentTarget.style.background = 'rgba(15,15,19,0.04)'; e.currentTarget.style.color = C.text1; e.currentTarget.style.borderColor = '#d0d0d8' } }}
            onMouseLeave={e => { if (!refreshing) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = C.text2; e.currentTarget.style.borderColor = '#e6e6ec' } }}
          >
            <RefreshCw size={11} strokeWidth={2.4} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}/>
            {refreshing ? 'Refreshing…' : 'Refresh ideas'}
          </button>
        )}
        {onOpenAll && (
          <button
            type="button"
            onClick={onOpenAll}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '7px 13px', borderRadius: 100,
              border: 'none', cursor: 'pointer',
              background: C.text1, color: '#fff',
              fontFamily: 'inherit',
              fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
              boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
              transition: 'filter 0.14s ease, transform 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.10)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Open Video Ideas
            <ArrowRight size={12} strokeWidth={2.4} />
          </button>
        )}
      </div>
    </FeedCard>
  )
}

// Competitor Activity card. Shows recent uploads from the channels the
// user tracks via the Competitors feature. Habit-forming surface: every
// time a competitor posts, this card updates. Three uploads shown as a
// row of mini cards (thumbnail + title + competitor name + views + age).
// Click any to open the video on YouTube.
function CompetitorActivityCard({ items, refreshing, onRefresh, onOpen, onOpenAll, onDismiss }) {
  const top3 = (items || []).slice(0, 3)
  if (top3.length === 0) return null

  return (
    <FeedCard
      Icon={Users}
      iconColor={C.text1}
      iconBg="rgba(15,15,19,0.06)"
      category="Competitor Moves · last 7 days"
      onDismiss={onDismiss}
      rightSlot={
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10.5, fontWeight: 700, color: C.text2,
          background: 'rgba(15,15,19,0.04)', border: '1px solid rgba(15,15,19,0.10)',
          padding: '3px 8px', borderRadius: 100,
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          {top3.length} new
        </span>
      }
    >
      <h3 style={{
        fontSize: 16, fontWeight: 700, color: C.text1,
        letterSpacing: '-0.3px', lineHeight: 1.25,
        marginBottom: 14,
      }}>What your competition just posted</h3>

      {/* 3-up grid of recent uploads */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
        {top3.map((item, i) => (
          <a
            key={i}
            href={item.video_id ? `https://www.youtube.com/watch?v=${item.video_id}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { if (onOpen) { e.preventDefault(); onOpen(item) } }}
            style={{
              display: 'block',
              background: '#fafafb',
              border: '1px solid #ececf0',
              borderRadius: 10,
              overflow: 'hidden',
              textDecoration: 'none',
              transition: 'background 0.14s ease, border-color 0.14s ease, transform 0.14s ease, box-shadow 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#d6d6dc'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fafafb'; e.currentTarget.style.borderColor = '#ececf0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            {/* Thumbnail */}
            <div style={{ position: 'relative', aspectRatio: '16/9', background: '#ebebef', overflow: 'hidden' }}>
              {item.thumbnail && (
                <img src={item.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
              )}
              {/* Channel avatar overlay (bottom-left of thumb) */}
              {item.channel_thumbnail && (
                <div style={{
                  position: 'absolute', left: 8, bottom: 8,
                  width: 26, height: 26, borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: '0 0 0 2px #fff, 0 2px 8px rgba(0,0,0,0.30)',
                }}>
                  <img src={item.channel_thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
                </div>
              )}
              {/* External link badge top-right */}
              <div style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
                color: '#fff', width: 22, height: 22, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ExternalLink size={11} strokeWidth={2.4}/>
              </div>
            </div>

            {/* Title + meta */}
            <div style={{ padding: '10px 12px' }}>
              <p style={{
                fontSize: 12.5, fontWeight: 700, color: C.text1,
                letterSpacing: '-0.15px', lineHeight: 1.35,
                marginBottom: 6,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: 34,
              }}>{item.title}</p>
              <p style={{
                fontSize: 10.5, fontWeight: 600, color: C.text2,
                letterSpacing: '-0.05px', lineHeight: 1.3,
                marginBottom: 4,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{item.channel_name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 500, color: C.text3, fontVariantNumeric: 'tabular-nums' }}>
                <span>{fmtNum(item.views || 0)} views</span>
                <span style={{ color: '#dcdde3' }}>·</span>
                <span>{item.age_label || ''}</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid #f1f1f4' }}>
        <span style={{ fontSize: 11.5, fontWeight: 500, color: C.text3, letterSpacing: '-0.01em' }}>
          From the channels you track
        </span>
        <div style={{ flex: 1 }}/>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 11px', borderRadius: 100,
              border: '1px solid #e6e6ec',
              background: refreshing ? '#f6f6f9' : '#fff',
              color: refreshing ? C.text3 : C.text2,
              fontFamily: 'inherit',
              fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
              cursor: refreshing ? 'wait' : 'pointer',
              transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
            }}
            onMouseEnter={e => { if (!refreshing) { e.currentTarget.style.background = 'rgba(15,15,19,0.04)'; e.currentTarget.style.color = C.text1; e.currentTarget.style.borderColor = '#d0d0d8' } }}
            onMouseLeave={e => { if (!refreshing) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = C.text2; e.currentTarget.style.borderColor = '#e6e6ec' } }}
          >
            <RefreshCw size={11} strokeWidth={2.4} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}/>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        )}
        {onOpenAll && (
          <button
            type="button"
            onClick={onOpenAll}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '7px 13px', borderRadius: 100,
              border: 'none', cursor: 'pointer',
              background: C.text1, color: '#fff',
              fontFamily: 'inherit',
              fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
              boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
              transition: 'filter 0.14s ease, transform 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.10)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Open Competitors
            <ArrowRight size={12} strokeWidth={2.4} />
          </button>
        )}
      </div>
    </FeedCard>
  )
}


/* ─── Insight card (legacy, still used by collapsed audit detail) ────────── */
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
            <div style={{ background: 'rgba(15,15,19,0.04)', border: '1px solid rgba(15,15,19,0.08)', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.text2, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Why now</p>
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
// Lucide icons across the whole nav. Single visual language, consistent
// stroke weight (1.75) and size (18px primary, 16px footer). Replaces the
// previous hand-drawn 14px SVGs that read as amateur.
const ICON_SIZE = 18
const ICON_STROKE = 1.75

const NAV_ICONS = {
  Feed:     <LayoutDashboard size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  Optimize: <Sparkles        size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  Research: <Telescope       size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  Chat:     <MessageCircle   size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  Settings: <SettingsIcon    size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  Admin:    <ShieldCheck     size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
}

// Shared geometry constants. The icon column is the visual spine of the
// sidebar; sub-items align their leading dot to it so the nav reads as a
// single column of items, not a ragged stack.
const NAV_ICON_COL = 18     // matches ICON_SIZE
const NAV_GUTTER   = 12     // outer horizontal gutter
const NAV_PAD_X    = 12     // inner left padding inside the button
const SUB_INDENT   = NAV_PAD_X + NAV_ICON_COL + 12  // 42, lines up with icon-text gap

// Primary verb button.
function NavBtn({ label, active, onClick, badge, dot }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        margin: `1px ${NAV_GUTTER}px`,
        width: `calc(100% - ${NAV_GUTTER * 2}px)`,
        background: active ? 'rgba(229,37,27,0.07)' : 'transparent',
        color: active ? C.text1 : C.text2,
        fontWeight: active ? 600 : 500,
        fontSize: 14,
        letterSpacing: '-0.01em',
        border: 'none',
        padding: `9px ${NAV_PAD_X}px`,
        borderRadius: 10,
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: "'Inter', system-ui, sans-serif",
        display: 'flex', alignItems: 'center', gap: 12,
        transition: 'background 0.14s ease, color 0.14s ease',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(15,15,19,0.04)'; e.currentTarget.style.color = C.text1 } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text2 } }}
    >
      {active && (
        <span aria-hidden style={{
          position: 'absolute', left: -NAV_GUTTER, top: 8, bottom: 8,
          width: 3, borderRadius: 100,
          background: C.red,
        }}/>
      )}
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: NAV_ICON_COL, height: NAV_ICON_COL, flexShrink: 0,
        color: active ? C.red : '#9da0aa',
      }}>{NAV_ICONS[label]}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {typeof badge === 'string' && badge && (
        <span style={{
          background: 'rgba(229,37,27,0.10)', color: C.red,
          fontSize: 9.5, fontWeight: 800, padding: '2px 7px',
          borderRadius: 20, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>{badge}</span>
      )}
      {typeof badge === 'number' && badge > 0 && (
        <span style={{
          background: C.red, color: '#fff',
          fontSize: 10.5, fontWeight: 800, padding: '1px 7px',
          borderRadius: 20, minWidth: 18, textAlign: 'center',
          letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.45,
        }}>{badge}</span>
      )}
      {dot && (typeof badge === 'undefined' || badge === null || badge === '' || badge === 0) && (
        <span aria-label="new" style={{
          width: 7, height: 7, borderRadius: '50%',
          background: C.red,
          boxShadow: `0 0 0 3px rgba(229,37,27,0.16)`,
          flexShrink: 0,
        }}/>
      )}
    </button>
  )
}

// Sub-item button. No icon. Indented under the parent verb, aligned to
// the icon column so the visual gutter is consistent.
function NavSubBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        margin: `1px ${NAV_GUTTER}px 1px ${NAV_GUTTER + SUB_INDENT}px`,
        width: `calc(100% - ${NAV_GUTTER * 2 + SUB_INDENT}px)`,
        background: 'transparent',
        color: active ? C.text1 : C.text2,
        fontWeight: active ? 600 : 450,
        fontSize: 13.5,
        letterSpacing: '-0.01em',
        border: 'none',
        padding: '7px 10px 7px 12px',
        borderRadius: 8,
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: "'Inter', system-ui, sans-serif",
        display: 'flex', alignItems: 'center', gap: 10,
        transition: 'background 0.14s ease, color 0.14s ease',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(15,15,19,0.04)'; e.currentTarget.style.color = C.text1 } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text2 } }}
    >
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: active ? C.red : '#cbcdd6',
        flexShrink: 0,
        boxShadow: active ? `0 0 0 3px rgba(229,37,27,0.10)` : 'none',
        transition: 'background 0.14s ease, box-shadow 0.14s ease',
      }}/>
      <span style={{ flex: 1 }}>{label}</span>
    </button>
  )
}

// Expandable verb group (Optimize / Research). Click parent toggles open.
// Open state persists in localStorage. Auto-opens when a child becomes
// active so the user is never lost.
function NavGroup({ label, children, anyChildActive, defaultOpen = true, badge, dot }) {
  const storageKey = `ytg_nav_group_open:${label}`
  const [open, setOpen] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw === '0') return false
      if (raw === '1') return true
    } catch {}
    return defaultOpen
  })
  useEffect(() => {
    if (anyChildActive && !open) setOpen(true)
  }, [anyChildActive])  // eslint-disable-line react-hooks/exhaustive-deps
  function toggle() {
    setOpen(o => {
      const next = !o
      try { localStorage.setItem(storageKey, next ? '1' : '0') } catch {}
      return next
    })
  }
  return (
    <>
      <button
        onClick={toggle}
        style={{
          position: 'relative',
          margin: `1px ${NAV_GUTTER}px`,
          width: `calc(100% - ${NAV_GUTTER * 2}px)`,
          background: 'transparent',
          color: anyChildActive ? C.text1 : C.text2,
          fontWeight: anyChildActive ? 600 : 500,
          fontSize: 14,
          letterSpacing: '-0.01em',
          border: 'none',
          padding: `9px ${NAV_PAD_X}px`,
          borderRadius: 10,
          textAlign: 'left',
          cursor: 'pointer',
          fontFamily: "'Inter', system-ui, sans-serif",
          display: 'flex', alignItems: 'center', gap: 12,
          transition: 'background 0.14s ease, color 0.14s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,15,19,0.04)'; e.currentTarget.style.color = C.text1 }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = anyChildActive ? C.text1 : C.text2 }}
      >
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: NAV_ICON_COL, height: NAV_ICON_COL, flexShrink: 0,
          color: anyChildActive ? C.red : '#9da0aa',
        }}>{NAV_ICONS[label]}</span>
        <span style={{ flex: 1 }}>{label}</span>
        {typeof badge === 'number' && badge > 0 && (
          <span style={{
            background: C.red, color: '#fff',
            fontSize: 10.5, fontWeight: 800, padding: '1px 7px',
            borderRadius: 20, minWidth: 18, textAlign: 'center',
            letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums',
            lineHeight: 1.45,
          }}>{badge}</span>
        )}
        {dot && (typeof badge === 'undefined' || badge === null || badge === 0) && (
          <span aria-label="new" style={{
            width: 7, height: 7, borderRadius: '50%',
            background: C.red,
            boxShadow: `0 0 0 3px rgba(229,37,27,0.16)`,
            flexShrink: 0,
          }}/>
        )}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          style={{
            color: '#9da0aa',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{ position: 'relative', paddingTop: 2, paddingBottom: 4 }}>
          {/* Vertical guideline that visually groups the children, aligned
              to the icon column. */}
          <span aria-hidden style={{
            position: 'absolute',
            left: NAV_GUTTER + NAV_PAD_X + (NAV_ICON_COL / 2),
            top: 4, bottom: 6,
            width: 1, background: 'rgba(15,15,19,0.08)',
          }}/>
          {children}
        </div>
      )}
    </>
  )
}

/* ─── What's new promo card ─────────────────────────────────────────────────
   Sells features the user hasn't dismissed, one card at a time. This is the
   in-product feature-discovery surface — same role VidIQ's "vidIQ for
   Instagram" launch card plays in their sidebar. Rotates among undismissed
   features; when all are dismissed, nothing renders.
*/
const WHATS_NEW = [
  {
    id: 'niche-outlier-interactive',
    headline: 'Your niche outlier card is now interactive',
    body: 'Switch between Videos, Thumbnails, and Breakout Channels from one card.',
    cta: 'See it on Feed',
    target: 'Overview',
  },
  {
    id: 'tracked-optimizations',
    headline: 'We measure whether your changes worked',
    body: 'Edit a title or thumbnail. We track the views delta and show the lift.',
    cta: 'Open My Videos',
    target: 'Videos',
  },
  {
    id: 'thumbnail-score',
    headline: 'Score your thumbnail before you ship',
    body: 'Drop in your design, get a score against winning thumbnails in your niche.',
    cta: 'Try Thumbnail Score',
    target: 'Thumbnail Score',
  },
  {
    id: 'video-review',
    headline: 'See where viewers drop off',
    body: 'Per-video retention curve + the exact second you lost the room.',
    cta: 'Open Video Review',
    target: 'Autopsy',
  },
]

function WhatsNewCard({ channelId, onNavigate }) {
  const storageKey = `ytg_whatsnew_dismissed:${channelId || 'unknown'}`
  const [dismissed, setDismissedState] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return {}
      const parsed = JSON.parse(raw)
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch { return {} }
  })

  // Pick the first feature this user hasn't dismissed. Static order so a
  // refresh doesn't surprise the user with a different card mid-session.
  const feature = WHATS_NEW.find(f => !dismissed[f.id])
  if (!feature) return null

  function dismiss() {
    const next = { ...dismissed, [feature.id]: Date.now() }
    setDismissedState(next)
    try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
  }

  function activate() {
    onNavigate?.(feature.target)
    dismiss()
  }

  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(180deg, #ffffff 0%, #fafafc 100%)',
      border: '1px solid #ececf0',
      borderRadius: 11,
      padding: '13px 14px 14px 14px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.025), inset 0 1px 0 rgba(255,255,255,0.7)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Brand-tinted left accent rail so the card reads as a promo, not a
          duplicate of the UsageBar below it. */}
      <span aria-hidden style={{
        position: 'absolute', left: 0, top: 12, bottom: 12,
        width: 2, borderRadius: 100,
        background: 'linear-gradient(180deg, #e5251b 0%, rgba(229,37,27,0.35) 100%)',
      }}/>

      {/* Dismiss × */}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          position: 'absolute', top: 8, right: 8,
          width: 22, height: 22, borderRadius: 6,
          border: 'none', background: 'transparent',
          color: 'rgba(10,10,15,0.40)',
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.14s ease, color 0.14s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,15,19,0.06)'; e.currentTarget.style.color = '#0a0a0f' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(10,10,15,0.40)' }}
      >
        <XIcon size={12} strokeWidth={2} />
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, paddingLeft: 6 }}>
        {/* Sparkle icon in a brand-tinted circle */}
        <span style={{
          flexShrink: 0,
          width: 28, height: 28, borderRadius: 8,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(229,37,27,0.08)',
          color: '#e5251b',
          marginTop: 1,
        }}>
          <Sparkles size={15} strokeWidth={2} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            fontSize: 9.5, fontWeight: 600, color: '#e5251b',
            letterSpacing: '0.11em', textTransform: 'uppercase',
            marginBottom: 5,
          }}>
            What's new
          </p>
          <p style={{
            fontSize: 13.5, fontWeight: 600, color: '#0a0a0f',
            letterSpacing: '-0.012em', lineHeight: 1.35,
            paddingRight: 22,  // clear the dismiss x
            marginBottom: 5,
          }}>
            {feature.headline}
          </p>
          <p style={{
            fontSize: 12.5, fontWeight: 450, color: 'rgba(10,10,15,0.58)',
            letterSpacing: '-0.01em', lineHeight: 1.55,
            marginBottom: 10,
          }}>
            {feature.body}
          </p>
          <button
            type="button"
            onClick={activate}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: 0, border: 'none', background: 'transparent',
              cursor: 'pointer',
              color: '#e5251b',
              fontSize: 13, fontWeight: 600,
              letterSpacing: '-0.01em',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#a50f07' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#e5251b' }}
          >
            {feature.cta}
            <ArrowRight size={13} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
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
        else if (d.needs_auth) window.location.href = loginUrl()
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
                onClick={() => { setOpen(false); window.location.href = loginUrl() }}
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
              <div style={{ background: 'rgba(15,15,19,0.04)', border: `1px solid rgba(15,15,19,0.08)`, borderLeft: `3px solid ${s.color}`, borderRadius: '0 10px 10px 0', padding: '12px 15px' }}>
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
  const [videosTab,    setVideosTab]    = useState('all')    // 'all' | 'tracked'
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
  const [isAdmin,     setIsAdmin]     = useState(false)
  // Sidebar live signals. Drive the nav badges so the sidebar reads as a
  // status surface, not just a list of links.
  const [freshOutlier, setFreshOutlier] = useState(false)
  // Feed state.
  const [feedFilter, setFeedFilter] = useState(() => {
    try { return localStorage.getItem('ytg_feed_filter') || 'all' } catch { return 'all' }
  })
  const [auditOpen, setAuditOpen] = useState(false)
  // Tracked Optimization Lift — the proof loop card. Fetched on mount when
  // the user is on the Overview. Null while loading or when there's no
  // meaningful win to surface yet.
  const [trackedLift, setTrackedLift] = useState(null)
  // Daily Ideas (Video Ideas top 3 surfaced on the Feed).
  const [dailyIdeas, setDailyIdeas] = useState(null)
  const [refreshingIdeas, setRefreshingIdeas] = useState(false)
  // Competitor Activity (recent uploads from tracked competitors).
  const [competitorActivity, setCompetitorActivity] = useState(null)
  const [refreshingCompActivity, setRefreshingCompActivity] = useState(false)
  const setFeedFilterPersist = (k) => {
    setFeedFilter(k)
    try { localStorage.setItem('ytg_feed_filter', k) } catch {}
  }
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

  // Admin check — fire-and-forget. Determines whether the Admin nav item
  // appears in the sidebar. Returns { is_admin: false } for everyone whose
  // session email isn't in the ADMIN_EMAILS env var.
  useEffect(() => {
    fetch('/admin/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { is_admin: false })
      .then(d => setIsAdmin(!!d.is_admin))
      .catch(() => {})
  }, [])

  // Probe the niche-outlier bundle on mount so the Research nav can show
  // a "● new" dot when this week's outlier is fresh and the user hasn't
  // yet navigated to Outliers to see it. NicheHeroCard hits the same
  // endpoint; the browser caches the response so this is effectively free.
  useEffect(() => {
    fetch('/dashboard/niche-outlier', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.ok) return
        const refreshed = d.bundle?.refreshed_at || d.outlier?.refreshed_at
        if (!refreshed) return
        const ageMs = Date.now() - new Date(refreshed).getTime()
        const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
        if (!Number.isFinite(ageMs) || ageMs > SEVEN_DAYS) return
        const channelId = d.outlier?.channel_id || d.creator || 'unknown'
        // Suppress the dot once the user has visited Outliers since this
        // outlier appeared. Keyed by the outlier's video_id or the
        // refreshed_at so a fresh refresh resets the seen flag.
        const seenKey = `ytg_outlier_seen:${channelId}:${d.bundle?.videos?.[0]?.video_id || d.outlier?.video_id || refreshed}`
        try { if (localStorage.getItem(seenKey)) return } catch {}
        setFreshOutlier(true)
      })
      .catch(() => {})
  }, [])

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
        // Resume checkout if the user picked a paid plan on the landing page
        // before signing in. The plan key was stashed by openCheckout() before
        // the redirect to /auth/login; consume it once and open Paddle now
        // that they're authenticated.
        let pending = null
        try { pending = sessionStorage.getItem('ytg_pending_plan') } catch {}
        if (pending) {
          try { sessionStorage.removeItem('ytg_pending_plan') } catch {}
          openCheckout(pending)
        }
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

    // Load tracked optimization lift (proof loop). Returns null when the
    // user hasn't optimized any videos yet or no wins have materialized.
    fetch('/dashboard/tracked-lift', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error && d.top) setTrackedLift(d) })
      .catch(() => {})

    // Load Daily Ideas (top 3 from the channel's video idea cache). The
    // backend pools ideas from competitor analyses + AI generations.
    fetch('/video-ideas', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error) setDailyIdeas(d) })
      .catch(() => {})

    // Load Competitor Activity (recent uploads from tracked competitors).
    // The endpoint reads CompetitorAnalysisCache for the tracked list and
    // fetches their latest videos via the YouTube Data API.
    fetch('/dashboard/competitor-activity', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error && d.items?.length) setCompetitorActivity(d) })
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

    // ?nav=<Tab> deep link — used by share links like /feedback to land users
    // on a specific tab. Settings reads its own ?focus param to scroll into view.
    try {
      const params = new URLSearchParams(window.location.search)
      const navTarget = params.get('nav')
      const VALID_NAV = ['Overview','Videos','Autopsy','Weekly Report','SEO Studio','Thumbnail Score','Video Ideas','Outliers','Keywords','Competitors','Settings','Referrals','Admin']
      if (navTarget && VALID_NAV.includes(navTarget)) {
        setNav(navTarget)
        // Don't strip ?focus — Settings reads it on mount.
        params.delete('nav')
        const qs = params.toString()
        window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''))
      }
    } catch {}

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

  // Poll for AI analysis completion when insights are still pending.
  // When insights arrive we flip auditFinishing=true so AuditProgress can
  // play its "Almost ready" outro before we tear it down via onDone.
  const [auditFinishing, setAuditFinishing] = useState(false)
  useEffect(() => {
    if (!analyzingAI) return
    let polledData = null
    const interval = setInterval(() => {
      fetch('/auth/data', { credentials: 'include' })
        .then(r => r.json())
        .then(d => {
          if (d.insights !== null) {
            polledData = d
            setData(d)
            setAuditFinishing(true)
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

  // Sidebar live signals — derived, not stored.
  const openPriorityCount = (() => {
    const all = data?.insights?.priorityActions || []
    if (!all.length) return 0
    let open = 0
    for (let i = 0; i < all.length; i++) {
      const a = all[i]
      const rank = a.rank ?? (i + 1)
      const k = `rank_${rank}`
      if (!checked[k] && !deleted[k]) open += 1
    }
    return open
  })()

  // Wrap setNav so navigating to Outliers also clears the "new" dot. We
  // mark the current outlier as seen in localStorage so a refresh of the
  // niche cache (new video_id) re-triggers the dot.
  const navigateTo = (target) => {
    if (target === 'Outliers' && freshOutlier) {
      try {
        // Fire-and-forget: read current outlier id, write seen flag.
        fetch('/dashboard/niche-outlier', { credentials: 'include' })
          .then(r => r.ok ? r.json() : null)
          .then(d => {
            if (!d?.ok) return
            const channelId = d.outlier?.channel_id || data?.channel?.channel_id || 'unknown'
            const refreshed = d.bundle?.refreshed_at || d.outlier?.refreshed_at || ''
            const vid = d.bundle?.videos?.[0]?.video_id || d.outlier?.video_id || refreshed
            const seenKey = `ytg_outlier_seen:${channelId}:${vid}`
            try { localStorage.setItem(seenKey, '1') } catch {}
          })
          .catch(() => {})
      } catch {}
      setFreshOutlier(false)
    }
    setNav(target)
  }

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
        <a href="/" style={{ padding: '22px 22px 18px', display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
          <Logo size={26} />
          <span style={{
            fontSize: 18, fontWeight: 800, letterSpacing: '-0.65px', lineHeight: 1,
            background: 'linear-gradient(180deg, #0f0f13 0%, #2a2a35 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', color: 'transparent',
          }}>YTGrowth</span>
          {(() => { const pb = planBadge(billingPlan); return (
            <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: pb.color, background: pb.bg, border: `1px solid ${pb.bdr}`, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.07em', textTransform: 'uppercase', flexShrink: 0 }}>{pb.label}</span>
          ) })()}
        </a>

        {/* Channel profile block */}
        {data && (
          <div style={{ padding: '16px 22px', flexShrink: 0 }}>
           <div style={{
             background: '#fafafc',
             border: '1px solid #ececf0',
             borderRadius: 12,
             padding: '15px 16px 14px',
           }}>
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
              : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
                  {data.channel.thumbnail
                    ? <img src={data.channel.thumbnail} alt="" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: '0 0 0 2px #ececf0' }}/>
                    : <div style={{ width: 42, height: 42, borderRadius: '50%', background: C.redBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: C.red, flexShrink: 0, boxShadow: '0 0 0 2px #ececf0' }}>{data.channel.channel_name[0].toUpperCase()}</div>
                  }
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 14.5, fontWeight: 700, color: C.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.25px', lineHeight: 1.2 }}>{data.channel.channel_name}</p>
                    <p style={{ fontSize: 12, color: C.text3, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(data.channel.subscribers)} subs</p>
                  </div>
                </div>
              )
            }
            {/* Health score bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: C.text3, letterSpacing: '0.09em', textTransform: 'uppercase' }}>Channel health</span>
                <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2, fontVariantNumeric: 'tabular-nums' }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: scoreColor(score), letterSpacing: '-0.4px', lineHeight: 1 }}>{score}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(149,149,164,0.6)' }}>/100</span>
                </span>
              </div>
              <div style={{ background: '#eaeaef', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                <div style={{
                  width: `${score}%`, height: '100%', background: scoreColor(score), borderRadius: 99,
                  transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)',
                }}/>
              </div>
            </div>
           </div>
          </div>
        )}

        {/* Nav — verbs first, features nested. Down from 14 flat items to
            4 primary verbs + Settings. Optimize and Research expand to
            show the existing feature pages; the verb itself is just the
            group toggle for now (verb landing pages come in a later
            commit). The 'nav' state values are unchanged so every
            existing page render below still works. */}
        <nav style={{ overflowY: 'auto', flex: 1, paddingTop: 12, paddingBottom: 8 }}>

          <NavBtn
            label="Feed"
            active={nav === 'Overview'}
            onClick={() => setNav('Overview')}
            badge={openPriorityCount}
          />

          <NavGroup
            label="Optimize"
            anyChildActive={['SEO Studio','Thumbnail Score','Video Ideas','Videos','Autopsy','Weekly Report'].includes(nav)}
          >
            <NavSubBtn label="SEO Studio"    active={nav === 'SEO Studio'}       onClick={() => setNav('SEO Studio')} />
            <NavSubBtn label="Thumbnails"    active={nav === 'Thumbnail Score'}  onClick={() => setNav('Thumbnail Score')} />
            <NavSubBtn label="Video Ideas"   active={nav === 'Video Ideas'}      onClick={() => setNav('Video Ideas')} />
            <NavSubBtn label="My Videos"     active={nav === 'Videos'}           onClick={() => setNav('Videos')} />
            <NavSubBtn label="Video Review"  active={nav === 'Autopsy'}          onClick={() => setNav('Autopsy')} />
            <NavSubBtn label="Weekly Report" active={nav === 'Weekly Report'}    onClick={() => setNav('Weekly Report')} />
          </NavGroup>

          <NavGroup
            label="Research"
            anyChildActive={['Outliers','Keywords','Competitors'].includes(nav)}
            dot={freshOutlier}
          >
            <NavSubBtn label="Outliers"    active={nav === 'Outliers'}    onClick={() => navigateTo('Outliers')} />
            <NavSubBtn label="Keywords"    active={nav === 'Keywords'}    onClick={() => setNav('Keywords')} />
            <NavSubBtn label="Competitors" active={nav === 'Competitors'} onClick={() => setNav('Competitors')} />
          </NavGroup>

          <NavBtn label="Chat" active={nav === 'Chat'} onClick={() => setNav('Chat')} badge="New" />

          <div style={{ height: 18 }}/>

          {isAdmin && <NavBtn label="Admin" active={nav === 'Admin'} onClick={() => setNav('Admin')} />}
          <NavBtn label="Settings" active={nav === 'Settings'} onClick={() => setNav('Settings')} />

        </nav>

        {/* Sidebar footer — one tight block. Single divider, then a
            What's-new promo card, then UsageBar, then Refer | Sign out. */}
        {data && (
          <div style={{
            padding: '14px 16px 12px',
            borderTop: `1px solid ${C.border}`,
            flexShrink: 0,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <WhatsNewCard
              channelId={data.channel?.channel_id}
              onNavigate={(target) => setNav(target)}
            />
            <UsageBar
              channelId={data.channel?.channel_id}
              email={data.channel?.email}
              dark={false}
              onPlan={setBillingPlan}
              onUsage={setUsagePct}
            />
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: "'Inter', system-ui, sans-serif",
              marginTop: 2,
            }}>
              <button
                onClick={() => setNav('Referrals')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 9px', borderRadius: 7,
                  background: nav === 'Referrals' ? 'rgba(229,37,27,0.07)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  color: nav === 'Referrals' ? C.red : C.text3,
                  fontSize: 12, fontWeight: 500, letterSpacing: '-0.01em',
                  fontFamily: 'inherit',
                  transition: 'color 0.14s ease, background 0.14s ease',
                }}
                onMouseEnter={e => { if (nav !== 'Referrals') { e.currentTarget.style.color = C.text2; e.currentTarget.style.background = 'rgba(15,15,19,0.04)' } }}
                onMouseLeave={e => { if (nav !== 'Referrals') { e.currentTarget.style.color = C.text3; e.currentTarget.style.background = 'transparent' } }}
              >
                <Gift size={13} strokeWidth={1.75} />
                <span>Refer & earn</span>
              </button>
              <a
                href="/auth/logout"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 9px', borderRadius: 7,
                  color: C.text3, fontSize: 12, fontWeight: 500, letterSpacing: '-0.01em',
                  textDecoration: 'none',
                  transition: 'color 0.14s ease, background 0.14s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = C.text2; e.currentTarget.style.background = 'rgba(15,15,19,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.color = C.text3; e.currentTarget.style.background = 'transparent' }}
              >
                <span>Sign out</span>
                <LogOut size={13} strokeWidth={1.75} />
              </a>
            </div>
          </div>
        )}
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

          {/* Loading — skeleton placeholders matching the real Feed layout
              so the page doesn't feel like a blank spinner while data loads. */}
          {loading && (
            <div style={{ maxWidth: 1040, margin: '0 auto' }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <div className="ytg-skel" style={{ width: 280, height: 26, borderRadius: 6, marginBottom: 10 }}/>
                  <div className="ytg-skel" style={{ width: 180, height: 14, borderRadius: 4 }}/>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="ytg-skel" style={{ width: 130, height: 34, borderRadius: 100 }}/>
                  <div className="ytg-skel" style={{ width: 130, height: 34, borderRadius: 100 }}/>
                </div>
              </div>
              {/* Hero tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div className="ytg-skel" style={{ height: 140, borderRadius: 12 }}/>
                <div className="ytg-skel" style={{ height: 140, borderRadius: 12 }}/>
              </div>
              {/* Filter pills */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="ytg-skel" style={{ width: 90, height: 32, borderRadius: 100 }}/>
                ))}
              </div>
              {/* Card stream */}
              {[0, 1, 2].map(i => (
                <div key={i} className="ytg-skel" style={{ height: 140, borderRadius: 12, marginBottom: 12 }}/>
              ))}
              <p style={{
                textAlign: 'center', color: C.text3, fontSize: 12, fontWeight: 500,
                marginTop: 18, letterSpacing: '0.04em',
              }}>Analyzing your channel…</p>
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
          {/* Feed lives in a centered 720px column inside the main area. The
              column stops cards from stretching edge to edge on wide screens
              and gives the page the focused, scannable feel of VidIQ. The
              sidebar is untouched; the whitespace either side of the column
              is just the main area minus 720px. */}
          {data && nav === 'Overview' && (
            <div style={{ maxWidth: 1040, margin: '0 auto' }}>
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

              {/* Rich hero cards. One per metric, each with a real 28-day
                  sparkline of the underlying series (when analytics is
                  connected). Falls back to the milestone-progress hairline
                  when timeseries data isn't available. */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <HeroStatCard
                  label="Subscribers"
                  value={fmtNum(data.channel.subscribers)}
                  raw={data.channel.subscribers || 0}
                  kind="subs"
                  delta={data.analytics?.net_subscribers_90d}
                  deltaSuffix="last 90d"
                  series={data.analytics?.subs_series_28d}
                />
                <HeroStatCard
                  label="Total views"
                  value={fmtNum(data.channel.total_views)}
                  raw={data.channel.total_views || 0}
                  kind="views"
                  delta={data.analytics?.views_90d}
                  deltaSuffix="last 90d"
                  series={data.analytics?.views_series_28d}
                />
              </div>

              {/* Analytics-missing nudge — moved here from the quick-stats
                  strip (the strip is gone in the Feed redesign). */}
              {!data.analytics && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.amberBg, border: `1px solid ${C.amberBdr}`, borderLeft: `3px solid ${C.amber}`, borderRadius: '0 12px 12px 0', padding: '10px 16px', marginBottom: 18 }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={C.amber} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="8" cy="8" r="6.5"/><line x1="8" y1="5" x2="8" y2="8.5"/><circle cx="8" cy="11" r="0.7" fill={C.amber} stroke="none"/>
                  </svg>
                  <p style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.55 }}>
                    Grant <strong style={{ fontWeight: 600 }}>YouTube Analytics read access</strong> on the next reconnect to unlock retention, duration, and 90-day subscriber data.
                  </p>
                </div>
              )}

              {/* Filter pills — All | Actions | Insights | Achievements.
                  Counts populate from real data (open priority actions,
                  recently-earned milestones). */}
              {(() => {
                const openPriorityCount = (() => {
                  const all = data?.insights?.priorityActions || []
                  let n = 0
                  for (let i = 0; i < all.length; i++) {
                    const a = all[i]
                    const rank = a.rank ?? (i + 1)
                    const k = `rank_${rank}`
                    if (!checked[k] && !deleted[k]) n += 1
                  }
                  return n
                })()
                const recentMilestone = milestones?.earned?.[0] || null
                const counts = {
                  all: null,
                  actions: openPriorityCount,
                  insights: null,
                  achievements: recentMilestone ? 1 : 0,
                }
                return (
                  <FeedFilterPills
                    value={feedFilter}
                    counts={counts}
                    onChange={setFeedFilterPersist}
                  />
                )
              })()}

              {/* ── FEED CARD STREAM ──────────────────────────────────────
                  Niche Outlier first (the wedge), then Priority Action
                  cards (top 3 open), then any recent Milestone, then
                  Content Mix insight, then Channel Health which holds the
                  legacy audit detail behind its "See full audit" collapse.
                  Each card opts in/out of the active filter pill. */}

              {/* Niche Outlier — Insights */}
              {(feedFilter === 'all' || feedFilter === 'insights') && (
                <NicheHeroCard
                  channelId={data?.channel?.channel_id}
                  onNavigate={(target) => setNav(target)}
                  onOpenSeoStudio={(title, keyword) => {
                    try {
                      if (title) {
                        sessionStorage.setItem('seoOptimizer_prefilledTitle', title)
                        if (keyword) sessionStorage.setItem('seoOptimizer_prefilledKeyword', keyword)
                      }
                    } catch {}
                    setNav('SEO Studio')
                  }}
                />
              )}

              {/* Priority Actions — Actions. Top 3 OPEN actions become
                  their own cards. Done / dismissed state is shared with
                  the legacy checklist inside the audit collapse, so
                  ticking either updates the same localStorage. */}
              {(feedFilter === 'all' || feedFilter === 'actions') && data.insights?.priorityActions && (() => {
                const all = data.insights.priorityActions
                const open = []
                for (let i = 0; i < all.length; i++) {
                  const a = all[i]
                  const rank = a.rank ?? (i + 1)
                  const k = `rank_${rank}`
                  if (!checked[k] && !deleted[k]) open.push({ a, rank, k, idx: i })
                  if (open.length >= 3) break
                }
                if (open.length === 0) return null
                return open.map(({ a, rank, k, idx }) => {
                  const impact = (a.impact || (idx === 0 ? 'high' : idx === 1 ? 'med' : 'low'))
                  const target = categoryToNav(a.category, a.problem)
                  const ctaLabel = target === 'SEO Studio' ? 'Open SEO Studio'
                    : target === 'Thumbnail Score' ? 'Open Thumbnails'
                    : target === 'Video Ideas' ? 'Open Video Ideas'
                    : target === 'Outliers' ? 'Open Outliers'
                    : target === 'Keywords' ? 'Open Keywords'
                    : target === 'Competitors' ? 'Open Competitors'
                    : 'See full audit'
                  return (
                    <PriorityActionCard
                      key={`pa-${rank}`}
                      action={a}
                      rank={open.findIndex(x => x.rank === rank) + 1}
                      total={all.length}
                      impact={impact}
                      ctaLabel={ctaLabel}
                      onAct={() => target ? setNav(target) : setAuditOpen(true)}
                      onDone={() => {
                        const next = { ...checked, [k]: true }
                        setChecked(next)
                        if (data?.channel?.channel_id) {
                          try { localStorage.setItem(`ytg_checked_${data.channel.channel_id}`, JSON.stringify(next)) } catch {}
                        }
                      }}
                      onDismiss={() => {
                        const next = { ...deleted, [k]: true }
                        setDeleted(next)
                        if (data?.channel?.channel_id) {
                          try { localStorage.setItem(`ytg_deleted_${data.channel.channel_id}`, JSON.stringify(next)) } catch {}
                        }
                      }}
                    />
                  )
                })
              })()}

              {/* Milestone Unlocked — Achievements. Surfaces the most
                  recently earned milestone (within the last 30 days) so
                  the user lands on the win. Dismiss persists per channel. */}
              {(feedFilter === 'all' || feedFilter === 'achievements') && milestones?.earned?.[0] && (() => {
                const m = milestones.earned[0]
                const earnedAt = m.earned_at ? new Date(m.earned_at).getTime() : 0
                const ageMs = Date.now() - earnedAt
                const SHOW_FOR = 30 * 24 * 60 * 60 * 1000
                if (!earnedAt || ageMs > SHOW_FOR) return null
                const dismissKey = `ytg_milestone_dismissed:${data.channel?.channel_id || 'x'}:${m.category}:${m.tier}`
                try { if (localStorage.getItem(dismissKey)) return null } catch {}
                const labelCat = m.category === 'subs' ? 'subscribers'
                  : m.category === 'views' ? 'total views'
                  : m.category === 'watch_hours' ? 'watch hours'
                  : m.category
                const headline = `${fmtNum(m.threshold || m.value)} ${labelCat}`
                const days = Math.floor(ageMs / 86400000)
                return (
                  <MilestoneFeedCard
                    milestone={{
                      headline,
                      body: m.celebration || `You crossed ${fmtNum(m.threshold || m.value)} ${labelCat}. Worth a screenshot.`,
                      earned_age: days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days}d ago`,
                    }}
                    onShare={() => setShareMilestone(m)}
                    onDismiss={() => {
                      try { localStorage.setItem(dismissKey, '1') } catch {}
                      // Force re-render. Cheapest way: bump checked state.
                      setChecked(prev => ({ ...prev }))
                    }}
                  />
                )
              })()}

              {/* Top Performer — Achievements. Celebrates the user's
                  strongest video. The single best retention card we ship:
                  every other surface nags about problems, this one shows
                  a win. Computes "X.Xx your average" inline. */}
              {(feedFilter === 'all' || feedFilter === 'achievements') && patterns?.bestVideo && (() => {
                const totalV = videos?.reduce((s, v) => s + (v.views || 0), 0) || 0
                const avgV = videos?.length > 0 ? totalV / videos.length : 0
                const dismissKey = `ytg_top_perf_dismissed:${data?.channel?.channel_id || 'x'}:${patterns.bestVideo.video_id || patterns.bestVideo.title}`
                try { if (localStorage.getItem(dismissKey)) return null } catch {}
                return (
                  <TopPerformerCard
                    video={patterns.bestVideo}
                    channelAvgViews={avgV}
                    onOpen={() => {
                      if (patterns.bestVideo.video_id) setSelectedVideoId(patterns.bestVideo.video_id)
                      else setNav('Videos')
                    }}
                    onDismiss={() => {
                      try { localStorage.setItem(dismissKey, '1') } catch {}
                      setChecked(prev => ({ ...prev }))
                    }}
                  />
                )
              })()}

              {/* Daily Ideas — Actions. Three fresh video idea concepts
                  from the channel's idea pool. Refreshing pulls a new
                  batch from competitor analyses. Each row routes the
                  user into SEO Studio with the title pre-filled so they
                  can start writing in one click. */}
              {(feedFilter === 'all' || feedFilter === 'actions') && dailyIdeas?.ideas?.length > 0 && (() => {
                const dismissKey = `ytg_daily_ideas_dismissed:${data?.channel?.channel_id || 'x'}`
                try { if (localStorage.getItem(dismissKey)) return null } catch {}
                return (
                  <DailyIdeasCard
                    ideas={dailyIdeas.ideas}
                    lastUpdated={dailyIdeas.last_updated}
                    isStale={dailyIdeas.stale}
                    isFree={dailyIdeas.free_capped}
                    refreshing={refreshingIdeas}
                    onUse={(idea) => {
                      try {
                        if (idea.title) sessionStorage.setItem('seoOptimizer_prefilledTitle', idea.title)
                        if (idea.targetKeyword) sessionStorage.setItem('seoOptimizer_prefilledKeyword', idea.targetKeyword)
                      } catch {}
                      setNav('SEO Studio')
                    }}
                    onRefresh={() => {
                      if (refreshingIdeas) return
                      setRefreshingIdeas(true)
                      fetch('/video-ideas/refresh', { method: 'POST', credentials: 'include' })
                        .then(r => r.ok ? r.json() : null)
                        .then(d => { if (d && !d.error) setDailyIdeas(d) })
                        .catch(() => {})
                        .finally(() => setRefreshingIdeas(false))
                    }}
                    onOpenAll={() => setNav('Video Ideas')}
                    onDismiss={() => {
                      try { localStorage.setItem(dismissKey, '1') } catch {}
                      setChecked(prev => ({ ...prev }))
                    }}
                  />
                )
              })()}

              {/* Competitor Activity — Insights. Recent uploads from the
                  channels the user tracks via the Competitors feature.
                  Habit-forming surface: every time a competitor posts,
                  this card refreshes. Click any tile to open the video
                  on YouTube. */}
              {(feedFilter === 'all' || feedFilter === 'insights') && competitorActivity?.items?.length > 0 && (() => {
                const dismissKey = `ytg_competitor_activity_dismissed:${data?.channel?.channel_id || 'x'}`
                try { if (localStorage.getItem(dismissKey)) return null } catch {}
                return (
                  <CompetitorActivityCard
                    items={competitorActivity.items}
                    refreshing={refreshingCompActivity}
                    onRefresh={() => {
                      if (refreshingCompActivity) return
                      setRefreshingCompActivity(true)
                      fetch('/dashboard/competitor-activity?force=1', { credentials: 'include' })
                        .then(r => r.ok ? r.json() : null)
                        .then(d => { if (d && !d.error) setCompetitorActivity(d) })
                        .catch(() => {})
                        .finally(() => setRefreshingCompActivity(false))
                    }}
                    onOpenAll={() => setNav('Competitors')}
                    onDismiss={() => {
                      try { localStorage.setItem(dismissKey, '1') } catch {}
                      setChecked(prev => ({ ...prev }))
                    }}
                  />
                )
              })()}

              {/* Posting Consistency — Insights. The 28-day calendar
                  grid + four numeric stats. Genuinely unique to us:
                  VidIQ doesn't surface a heatmap like this. */}
              {(feedFilter === 'all' || feedFilter === 'insights') && videos && videos.length > 0 && (() => {
                const dismissKey = `ytg_posting_consistency_dismissed:${data?.channel?.channel_id || 'x'}`
                try { if (localStorage.getItem(dismissKey)) return null } catch {}
                return (
                  <PostingConsistencyCard
                    videos={videos}
                    onDismiss={() => {
                      try { localStorage.setItem(dismissKey, '1') } catch {}
                      setChecked(prev => ({ ...prev }))
                    }}
                  />
                )
              })()}

              {/* Best Time to Publish — Insights. Bins all the channel's
                  videos by hour-of-day and surfaces the slot when the
                  user's audience watches most. Renders only when there
                  are enough uploads to make the signal meaningful. */}
              {(feedFilter === 'all' || feedFilter === 'insights') && videos && videos.length >= 5 && (() => {
                const dismissKey = `ytg_best_time_dismissed:${data?.channel?.channel_id || 'x'}`
                try { if (localStorage.getItem(dismissKey)) return null } catch {}
                return (
                  <BestTimeCard
                    videos={videos}
                    onDismiss={() => {
                      try { localStorage.setItem(dismissKey, '1') } catch {}
                      setChecked(prev => ({ ...prev }))
                    }}
                  />
                )
              })()}

              {/* Tracked Optimization Lift — Achievements. Proof loop:
                  shows the user's best post-update win from SEO Optimizer.
                  trackedLift state is fetched on Overview mount. */}
              {(feedFilter === 'all' || feedFilter === 'achievements') && trackedLift && trackedLift.top && (() => {
                const w = trackedLift.top
                const dismissKey = `ytg_tracked_lift_dismissed:${data?.channel?.channel_id || 'x'}:${w.video_id}:${w.optimized_at}`
                try { if (localStorage.getItem(dismissKey)) return null } catch {}
                return (
                  <TrackedLiftCard
                    win={w}
                    moreCount={trackedLift.count > 1 ? trackedLift.count - 1 : 0}
                    onOpenAll={() => setNav('SEO Studio')}
                    onDismiss={() => {
                      try { localStorage.setItem(dismissKey, '1') } catch {}
                      setChecked(prev => ({ ...prev }))
                    }}
                  />
                )
              })()}

              {/* Insights row — Content Mix + Channel Health sit side by
                  side at half width. Denser, less scroll, more loaded.
                  Expanded audit detail renders full-width below this
                  block via the auditOpen condition further down. */}
              {(feedFilter === 'all' || feedFilter === 'insights') && (patterns || data.insights) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'stretch' }}>
                  {patterns && (
                    <ContentMixFeedCard
                      patterns={{
                        headline: patterns.headline || (
                          patterns.shortAvg > patterns.longAvg
                            ? 'Shorts beat your long-form'
                            : patterns.longAvg > patterns.shortAvg
                              ? 'Long-form beats your Shorts'
                              : 'Your content mix'
                        ),
                        body: patterns.body || patterns.text || patterns.summary || (
                          patterns.shortAvg > patterns.longAvg
                            ? `Shorts outperform long-form by ${fmtNum(patterns.shortAvg - patterns.longAvg)} views on average. Lean into Shorts for discovery.`
                            : patterns.longAvg > patterns.shortAvg
                              ? `Long-form outperforms Shorts by ${fmtNum(patterns.longAvg - patterns.shortAvg)} views. Your audience wants depth.`
                              : 'Both formats are performing similarly on your channel.'
                        ),
                        shortAvg: patterns.shortAvg,
                        longAvg: patterns.longAvg,
                      }}
                      mix={{
                        shortsCount: patterns.shortsCount,
                        longsCount: patterns.longsCount,
                      }}
                      fillHeight
                    />
                  )}

                  {data.insights && (() => {
                    const cs = data.insights.categoryScores || {}
                    const surfaced = [
                      ['CTR',         cs.ctrHealth],
                      ['Retention',   cs.audienceRetention],
                      ['Strategy',    cs.contentStrategy],
                      ['Consistency', cs.postingConsistency],
                      ['Engagement',  cs.engagementQuality],
                    ].filter(([, v]) => typeof v === 'number')
                    const fullEntries = [
                      ['CTR health', cs.ctrHealth],
                      ['Audience retention', cs.audienceRetention],
                      ['Content strategy', cs.contentStrategy],
                      ['Posting consistency', cs.postingConsistency],
                      ['Engagement quality', cs.engagementQuality],
                      ['SEO discoverability', cs.seoDiscoverability],
                      ['Video length', cs.videoLength],
                      ['Traffic source intel', cs.trafficSourceIntelligence],
                    ].filter(([, v]) => typeof v === 'number')
                    const weakest = fullEntries
                      .filter(([, v]) => v != null && v < 50)
                      .sort((a, b) => a[1] - b[1])
                      .slice(0, 2)
                      .map(([k]) => k)
                    return (
                      <ChannelHealthFeedCard
                        score={score}
                        categories={surfaced}
                        weakest={weakest}
                        open={auditOpen}
                        onToggle={() => setAuditOpen(o => !o)}
                        fillHeight
                      />
                    )
                  })()}
                </div>
              )}

            </div>
          )}

          {/* ── MILESTONES (legacy grid) ────────────────────────────────
              Hidden by default in the new Feed pattern. Recent milestone
              now surfaces as a Feed card up above; the full grid (every
              tier per category) only renders when the user expands the
              Channel Health audit collapse. */}
          {data && nav === 'Overview' && milestones && auditOpen && (() => {
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
              <div style={{ maxWidth: 1040, margin: '40px auto 0' }}>
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
            <div style={{ padding: '24px 0 36px' }}>
              <AuditProgress
                done={auditFinishing}
                onDone={() => {
                  setAnalyzingAI(false)
                  setAuditFinishing(false)
                }}
              />
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

          {/* ── AUDIT DETAIL (legacy block) ─────────────────────────────
              Hidden by default. Renders only when the user expands the
              new Channel Health Feed card's "See full audit" collapse.
              The new PriorityActionCards on the Feed read from the same
              checked/deleted state, so ticking either updates both. */}
          {data && nav === 'Overview' && data.insights && auditOpen && (
            <div style={{ maxWidth: 1040, margin: '0 auto' }}>
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

              {/* Priority actions — same visual language as the Feed.
                  Renders ALL open actions here (Feed only shows top 3).
                  Mark done / Dismiss share state with the Feed cards via
                  the same localStorage keys, so ticking either updates
                  both surfaces. */}
              {data.insights.priorityActions?.length > 0 && (() => {
                const allActions = data.insights.priorityActions
                const openActions = []
                for (let i = 0; i < allActions.length; i++) {
                  const a = allActions[i]
                  const rank = a.rank ?? (i + 1)
                  const k = `rank_${rank}`
                  if (!checked[k] && !deleted[k]) openActions.push({ a, rank, k, idx: i })
                }
                const total = allActions.length
                const doneCount = total - openActions.length

                if (openActions.length === 0) {
                  return (
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <p style={{ fontSize: 20, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px' }}>Priority actions</p>
                          <span style={{ fontSize: 10, fontWeight: 700, color: C.green, background: C.greenBg, padding: '3px 9px', borderRadius: 100, border: `1px solid ${C.greenBdr}`, letterSpacing: '0.08em', textTransform: 'uppercase' }}>All clear</span>
                        </div>
                      </div>
                      <div style={{
                        background: C.greenBg,
                        border: `1px solid ${C.greenBdr}`,
                        borderLeft: `3px solid ${C.green}`,
                        borderRadius: '0 12px 12px 0',
                        padding: '14px 18px',
                      }}>
                        <p style={{ fontSize: 13, color: C.text1, fontWeight: 600, marginBottom: 2 }}>You've handled every priority action.</p>
                        <p style={{ fontSize: 12.5, color: C.text3 }}>Re-audit to surface new ones, or come back next month.</p>
                      </div>
                    </div>
                  )
                }

                return (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <p style={{ fontSize: 20, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px' }}>Priority actions</p>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.text3, background: '#f1f1f6', padding: '3px 9px', borderRadius: 100, border: '1px solid #e6e6ec', fontVariantNumeric: 'tabular-nums' }}>{openActions.length} open</span>
                      </div>
                      {doneCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontVariantNumeric: 'tabular-nums' }}>
                          <div style={{ width: 72, height: 3, background: '#eef0f4', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ width: `${(doneCount / total) * 100}%`, height: '100%', background: C.green, borderRadius: 99, transition: 'width 0.6s ease' }}/>
                          </div>
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: C.text3 }}>
                            {doneCount} of {total} done
                          </span>
                        </div>
                      )}
                    </div>

                    {openActions.map(({ a, rank, k }, i) => {
                      const impact = a.impact || (i === 0 ? 'high' : i === 1 ? 'med' : 'low')
                      const target = categoryToNav(a.category, a.problem)
                      const ctaLabel = target === 'SEO Studio' ? 'Open SEO Studio'
                        : target === 'Thumbnail Score' ? 'Open Thumbnails'
                        : target === 'Video Ideas' ? 'Open Video Ideas'
                        : target === 'Outliers' ? 'Open Outliers'
                        : target === 'Keywords' ? 'Open Keywords'
                        : target === 'Competitors' ? 'Open Competitors'
                        : 'Open tool'
                      return (
                        <PriorityActionCard
                          key={`audit-pa-${rank}`}
                          action={a}
                          rank={i + 1}
                          total={openActions.length}
                          impact={impact}
                          ctaLabel={ctaLabel}
                          onAct={() => target ? setNav(target) : null}
                          onDone={() => {
                            const next = { ...checked, [k]: true }
                            setChecked(next)
                            if (data?.channel?.channel_id) {
                              try { localStorage.setItem(`ytg_checked_${data.channel.channel_id}`, JSON.stringify(next)) } catch {}
                            }
                          }}
                          onDismiss={() => {
                            const next = { ...deleted, [k]: true }
                            setDeleted(next)
                            if (data?.channel?.channel_id) {
                              try { localStorage.setItem(`ytg_deleted_${data.channel.channel_id}`, JSON.stringify(next)) } catch {}
                            }
                          }}
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
            </div>
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
                {videosTab === 'all' && (
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
                )}
              </div>

              {/* ── Tabs — All videos vs. Tracked optimisations ─────────────────
                  Mirrors the SEO Studio New/Reports tab pattern verbatim — same
                  pill button, red-on-active, white-with-border-on-inactive. */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[
                  { key: 'all',     label: 'All videos' },
                  { key: 'tracked', label: optimizations.length > 0 ? `Tracked optimisations (${optimizations.length})` : 'Tracked optimisations' },
                ].map(({ key, label }) => {
                  const active = videosTab === key
                  return (
                    <button key={key}
                      onClick={() => setVideosTab(key)}
                      style={{
                        fontSize: 12.5, fontWeight: 700, padding: '7px 16px',
                        borderRadius: 100,
                        border: active ? 'none' : `1px solid ${C.border}`,
                        background: active ? C.red : '#ffffff',
                        color: active ? '#ffffff' : C.text2,
                        cursor: 'pointer', fontFamily: 'inherit',
                        letterSpacing: '-0.1px',
                        boxShadow: active ? '0 1px 3px rgba(229,37,27,0.28), 0 4px 14px rgba(229,37,27,0.22)' : 'none',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = C.text3; e.currentTarget.style.color = C.text1 } }}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = C.border;  e.currentTarget.style.color = C.text2 } }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>

              {/* ── Your optimizations — each row is its own ytg-insight-card (same pattern as Overview's Priority Actions).
                    Green top border + green rank badge = "tracked/active", 3-col body grid with tinted views/likes/comments deltas. ── */}
              {videosTab === 'tracked' && optimizations.length > 0 && (() => {
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

                // Tinted delta cell — palette is brand-only now: charcoal/white+green/green.
                // Views=charcoal (info), Likes=white+green-bar (action), Comments=green (outcome).
                const DeltaCell = ({ label, before, current, pctVal, tint }) => {
                  const tintMap = {
                    blue:  { bg: 'rgba(15,15,19,0.04)', border: '1px solid rgba(15,15,19,0.08)', labelColor: C.text2 },
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

                    {optimizations.map((o, i) => {
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

                            {/* Cross-link to Post-Publish Review — different lens on the same video,
                                surfaces the AI verdict on what worked / didn't. Tiny inline link, no
                                duplicate content (autopsy has its own page). */}
                            <div style={{ marginTop: 12, marginLeft: 46, display: 'flex', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => setNav('Autopsy')}
                                style={{
                                  fontSize: 11.5, fontWeight: 600, color: C.text3,
                                  background: 'transparent', border: 'none', cursor: 'pointer',
                                  fontFamily: 'inherit', padding: 0, letterSpacing: '-0.05px',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = C.text1 }}
                                onMouseLeave={e => { e.currentTarget.style.color = C.text3 }}
                              >
                                Run post-publish review on this video →
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

              {/* Empty state for the Tracked tab when nothing's been optimised yet. */}
              {videosTab === 'tracked' && optimizations.length === 0 && (
                <div className="ytg-card" style={{ padding: '40px 32px', textAlign: 'center' }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: C.text1, letterSpacing: '-0.2px', marginBottom: 8 }}>
                    No tracked optimisations yet
                  </p>
                  <p style={{ fontSize: 13.5, color: C.text3, lineHeight: 1.6, maxWidth: 420, margin: '0 auto' }}>
                    Open any video below and run an SEO optimisation. Once you publish the new title or description, the lift in views, likes, and comments shows up here.
                  </p>
                </div>
              )}

              {/* Card grid — All Videos tab only */}
              {videosTab === 'all' && (
              <div className="ytg-videos-grid">
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
              )}

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

          {/* ── PATTERNS (legacy block) ─────────────────────────────────
              Hidden by default. The Content Mix insight surfaces as a
              Feed card above; this detailed Shorts vs long-form breakdown
              only renders when the user expands the audit collapse. */}
          {data && nav === 'Overview' && patterns && auditOpen && (
            <div style={{ maxWidth: 1040, margin: '0 auto' }}>
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
            </div>
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

          {nav === 'Autopsy' && <Autopsy videos={videos} channelId={data?.channel?.channel_id} optimizations={optimizations} goToTracked={() => { setNav('Videos'); setVideosTab('tracked') }} />}

          {/* ── REFERRALS ────────────────────────────────────────────── */}
          {nav === 'Referrals' && <Referrals />}

          {/* ── ADMIN ────────────────────────────────────────────────── */}
          {nav === 'Admin' && isAdmin && <Admin />}

          {/* ── CHAT — AI Coach ──────────────────────────────────────── */}
          {nav === 'Chat' && (
            <ChatCoach onNavigate={setNav} billingPlan={billingPlan} />
          )}

          {/* ── SETTINGS ─────────────────────────────────────────────── */}
          {nav === 'Settings' && <Settings channelData={data} />}

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
