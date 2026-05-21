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
  UserPlus,         // Suggested Competitors category
  Eye,              // Related Traffic — total view-count icon
  Wand2,            // Title Suggestion category (legacy import, kept for parity)
  ArrowDown,        // Title Suggestion before-/after arrow
  Pencil,           // Title Suggestion inline edit action
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
import OnboardingCard from '../components/OnboardingCard'

/* ─── Inject font + global styles once ─────────────────────────────────── */
function useDashboardStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-dash-styles')) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
    document.head.appendChild(link)

    // Geist for the Overview/Feed page. Scoped to .ov-page so other
    // Dashboard sections (Overview-redesign-in-progress) keep Inter.
    const geist = document.createElement('link')
    geist.rel = 'stylesheet'
    geist.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap'
    document.head.appendChild(geist)

    const style = document.createElement('style')
    style.id = 'ytg-dash-styles'
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { background: #f5f5f9; color: #0f0f13; font-family: 'Geist', 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }

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
        font-size: 13.5px; font-family: 'Geist', 'Inter', system-ui, sans-serif;
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

      /* ── OVERVIEW (FEED) — page-scoped redesign ──────────────────────────
         Migrates the Feed onto Geist + the Competitors design north-star
         (hairline borders, single soft shadow + inset highlight, 14px
         radius, 200ms cubic-bezier hover) without touching other pages
         that still use the global card classes. */
      .ov-page, .ov-page * {
        font-family: 'Geist', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-feature-settings: 'cv11', 'ss01', 'ss03';
      }
      .ytg-dark .ytg-card,
      .ytg-dark .ytg-stat-card,
      .ytg-dark .ytg-insight-card {
        background: ${SHELL.cardBg};
        border: 1px solid ${SHELL.hair};
        border-radius: 14px;
        box-shadow: ${SHELL.cardShadow};
        transition: box-shadow 0.2s cubic-bezier(0.2,0.7,0.3,1), transform 0.2s cubic-bezier(0.2,0.7,0.3,1), border-color 0.2s cubic-bezier(0.2,0.7,0.3,1);
      }
      .ytg-dark .ytg-card:hover,
      .ytg-dark .ytg-stat-card:hover,
      .ytg-dark .ytg-insight-card:hover {
        box-shadow: ${SHELL.cardShadowLift};
        transform: translateY(-1px);
        border-color: ${SHELL.hair};
      }
      .ytg-dark .ytg-stat-card.alert {
        border-color: rgba(229,37,27,0.32);
        background: rgba(229,37,27,0.10);
      }

      /* Hero tile (inline, no surrounding card). 4-up strip at top of Feed. */
      .ov-hero-tile {
        position: relative;
        padding: 16px 18px 18px;
        display: flex; flex-direction: column; gap: 10px;
        background: transparent;
      }
      .ov-hero-strip {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        border: 1px solid ${SHELL.hair};
        border-radius: 14px;
        background: ${SHELL.cardBg};
        box-shadow: ${SHELL.cardShadow};
        overflow: hidden;
        margin-bottom: 28px;
      }
      .ov-hero-strip > .ov-hero-tile + .ov-hero-tile {
        border-left: 1px solid ${SHELL.hair};
      }
      @media (max-width: 740px) {
        .ov-hero-strip { grid-template-columns: repeat(2, 1fr); }
        .ov-hero-strip > .ov-hero-tile:nth-child(3) { border-left: none; border-top: 1px solid ${SHELL.hair}; }
        .ov-hero-strip > .ov-hero-tile:nth-child(4) { border-top: 1px solid ${SHELL.hair}; }
      }

      .ov-section-head {
        display: flex; align-items: baseline; justify-content: space-between;
        gap: 12px; flex-wrap: wrap;
        margin: 36px 0 16px;
      }
      .ov-section-head h2 {
        font-size: 22px; font-weight: 600; color: ${SHELL.text1};
        letter-spacing: -0.5px; line-height: 1.2; margin: 0;
      }
      .ov-section-head .ov-section-meta {
        font-size: 12px; font-weight: 500; color: ${SHELL.text2};
        letter-spacing: -0.05px;
      }
      .ov-section-head + * { margin-top: 0 !important; }
      .ov-page .ov-stack > * + * { margin-top: 12px; }
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
        font-family: 'Geist', 'Inter', system-ui, sans-serif; font-size: 12.5px; font-weight: 600;
        background: #fff; color: #87878f; cursor: pointer;
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
        font-family: 'Geist', 'Inter', system-ui, sans-serif; font-size: 12.5px; font-weight: 600;
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
        font-family: 'Geist', 'Inter', system-ui, sans-serif; font-size: 11.5px; font-weight: 600;
        background: #e5251b;
        color: #fff; cursor: pointer; letter-spacing: 0.01em;
        transition: filter 0.15s;
      }
      .ytg-optimise-btn:hover {
        filter: brightness(1.1);
      }
      /* Videos card grid — 4 cols default (consistent with Video Review).
         Was 5 cols above 1500px which crammed the metrics; 4-up rhythm
         across all desktop widths reads cleaner. */
      .ytg-videos-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
      }
      @media (max-width: 900px) {
        .ytg-videos-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 560px) {
        .ytg-videos-grid { grid-template-columns: 1fr; }
      }
      /* Meta-chip in My Videos header — Lucide icon in tinted circle + label.
         Replaces the emoji header chips per the no-generic-icons rule. */
      .ytg-myvid-chip {
        display: inline-flex; align-items: center; gap: 7px;
        font-size: 12.5px; font-weight: 600; color: #4a4a58;
        background: #fff; border: 1px solid rgba(10,10,15,0.08);
        border-radius: 100px; padding: 4px 12px 4px 4px;
        box-shadow: 0 1px 2px rgba(15,15,25,0.04);
        letter-spacing: -0.01em;
      }
      .ytg-myvid-chip-icon {
        display: inline-flex; align-items: center; justify-content: center;
        width: 20px; height: 20px; border-radius: 99px;
        flex-shrink: 0;
      }
      /* Quiet sort group for My Videos — soft-grey active, no red glow. */
      .ytg-myvid-sort-grp {
        display: inline-flex; gap: 4px; padding: 4px;
        background: #eeeef3; border-radius: 100px;
      }
      .ytg-myvid-sort-btn {
        padding: 7px 14px; border-radius: 100px;
        font-family: inherit; font-size: 12.5px; font-weight: 500;
        background: transparent; color: rgba(10,10,15,0.55);
        border: 1px solid transparent;
        cursor: pointer; letter-spacing: -0.01em;
        transition: background 180ms cubic-bezier(0.32,0.72,0,1), color 180ms cubic-bezier(0.32,0.72,0,1);
      }
      .ytg-myvid-sort-btn:hover:not(.active) { background: rgba(10,10,15,0.03); color: #0a0a0f; }
      .ytg-myvid-sort-btn.active {
        background: #ffffff; color: #0a0a0f;
        border-color: rgba(10,10,15,0.10);
        box-shadow: 0 1px 2px rgba(15,15,25,0.04);
        font-weight: 600;
      }

      /* ── Feed (.ov-page) dark overrides for the shared global .ytg-*
         classes. Scoped to .ov-page so My Videos / other still-light
         pages that share these globals are untouched. Mirrors the
         shipped dark surface system (SHELL). ── */
      .ytg-dark .ytg-inner-block {
        background: ${SHELL.cardFlat};
        border: 1px solid ${SHELL.hair};
      }
      .ytg-dark .ytg-qw-row:hover {
        background: ${SHELL.hoverBg}; border-color: ${SHELL.hair};
      }
      .ytg-dark .ytg-del-btn {
        background: rgba(229,37,27,0.12); border: 1px solid rgba(229,37,27,0.30);
      }
      .ytg-dark .ytg-del-btn:hover { background: rgba(229,37,27,0.20); }
      .ytg-dark .ytg-dash-btn {
        background: ${SHELL.cardBg}; color: ${SHELL.text2};
        border: 1px solid ${SHELL.hair};
        box-shadow: ${SHELL.cardShadow};
      }
      .ytg-dark .ytg-dash-btn:hover {
        border-color: rgba(255,255,255,0.16); color: ${SHELL.text1};
        box-shadow: ${SHELL.cardShadowLift};
      }
      .ytg-dark .ytg-myvid-chip {
        color: ${SHELL.text2};
        background: ${SHELL.cardBg}; border: 1px solid ${SHELL.hair};
        box-shadow: ${SHELL.cardShadow};
      }
      .ytg-dark .ytg-myvid-sort-grp {
        background: ${SHELL.cardFlat};
      }
      .ytg-dark .ytg-myvid-sort-btn {
        color: ${SHELL.text2};
      }
      .ytg-dark .ytg-myvid-sort-btn:hover:not(.active) {
        background: ${SHELL.hoverBg}; color: ${SHELL.text1};
      }
      .ytg-dark .ytg-myvid-sort-btn.active {
        background: ${SHELL.activeBg}; color: ${SHELL.text1};
        border-color: ${SHELL.hair};
        box-shadow: none;
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

/* ─── SHELL: dark palette for the app shell only (sidebar + its nav /
       footer sub-components). Pages stay on the light `C` palette. These
       tokens mirror the ChatCoach dark surface that's already shipped, so
       the rail and the Chat page read as one system. Every consumer of
       SHELL is shell-only and never renders on a light page. ───────── */
const SHELL = {
  bg:        '#0c0c0e',                 // aside background (= ChatCoach rail)
  surface:   '#18181b',                 // flat fallback (rarely used)
  // Raised surfaces (profile card, What's-new, channel-switcher popover)
  // use the SAME lit gradient + single soft shadow as every ChatCoach
  // dark surface, so the rail and the Chat page read as one system.
  cardBg:    'linear-gradient(180deg, #1e1e24 0%, #18181c 100%)',
  cardFlat:  '#1c1c21',                 // flat inner blocks / chips
  cardShadow:'0 1px 3px rgba(0,0,0,0.4)',
  cardShadowLift: '0 6px 20px rgba(0,0,0,0.55)',
  popShadow: '0 12px 32px rgba(0,0,0,0.6)',
  hair:      'rgba(255,255,255,0.08)',  // borders + dividers
  hairLo:    'rgba(255,255,255,0.06)',
  text1:     '#f4f4f5',
  text2:     '#cfd0d6',
  text3:     '#b2b3bb',
  iconIdle:  '#5b5b66',                 // idle nav icons / carets / sub-dots
  // Quiet selection grammar, identical to the shipped ChatCoach rail:
  // hover = faint white wash, active = slightly stronger white wash.
  // Brand red stays an ACCENT only (the left stripe + icon), never a
  // background wash — matches the "red is for CTAs, not toggles" rule.
  hoverBg:   'rgba(255,255,255,0.035)',
  activeBg:  'rgba(255,255,255,0.06)',
  track:     'rgba(255,255,255,0.10)',  // health-bar track (= UsageBar dark)
  red:       '#e5251b',
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
  high:     { color: '#f0a23b', bg: '#fffbeb', bdr: '#fde68a' },
  medium:   { color: '#f0a23b', bg: '#fffbeb', bdr: '#fde68a' },
  low:      { color: '#6b7280', bg: '#f9fafb', bdr: '#e5e7eb' },
  info:     { color: '#34d27b', bg: '#ecfdf5', bdr: '#a7f3d0' },
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
  if (base === 'growth') return { label, color: '#34d27b', bg: 'rgba(5,150,105,0.07)',   bdr: 'rgba(5,150,105,0.18)' }
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
        fontSize="24" fontWeight="700" fontFamily="Geist, Inter, sans-serif"
        style={{ fontVariantNumeric: 'tabular-nums' }}>{score}</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fill={C.text3}
        fontSize="10" fontFamily="Geist, Inter, sans-serif">{scoreLabel(score)}</text>
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
      <p style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-1px', color: col, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
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
            fontSize: 11, fontWeight: 600, color: deltaColor,
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
      <p style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-2px', color: C.text1, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
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
              fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: C.text3,
            }}>{label}</p>
            {hasDelta && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                fontSize: 10.5, fontWeight: 600, color: deltaColor,
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
            fontSize: 34, fontWeight: 700, letterSpacing: '-1.5px',
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
              Next: <span style={{ color: C.text1, fontWeight: 600 }}>{fmtNum(target)}</span>
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
              fontSize: 10, fontWeight: 600, color: 'rgba(10,10,15,0.40)',
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
          fontSize: 10, fontWeight: 600, letterSpacing: '0.11em',
          textTransform: 'uppercase', color: C.text3,
        }}>{label}</p>
        {hasDelta && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 10.5, fontWeight: 600, color: deltaColor,
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
        fontSize: 28, fontWeight: 700, letterSpacing: '-1.2px',
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
        Next: <span style={{ color: C.text1, fontWeight: 600 }}>{fmtNum(target)}</span>
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
              padding: '7px 14px', borderRadius: 100,
              border: `1px solid ${active ? SHELL.hair : 'transparent'}`,
              background: active ? SHELL.activeBg : 'transparent',
              color: active ? SHELL.text1 : SHELL.text2,
              fontSize: 13, fontWeight: active ? 600 : 500, letterSpacing: '-0.05px',
              cursor: 'pointer',
              boxShadow: 'none',
              transition: 'background 0.18s cubic-bezier(0.2,0.7,0.3,1), color 0.18s, border-color 0.18s',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = SHELL.hoverBg; e.currentTarget.style.color = SHELL.text1 } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SHELL.text2 } }}
          >
            {t.label}
            {count != null && count > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 18, height: 18, padding: '0 6px',
                borderRadius: 100,
                fontSize: 10.5, fontWeight: 600,
                background: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                color: active ? SHELL.text1 : SHELL.text2,
                fontVariantNumeric: 'tabular-nums',
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
      background: SHELL.cardFlat,
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '14px 18px 16px 18px',
      boxShadow: '0 1px 2px rgba(255,255,255,0.04), 0 6px 18px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
      marginBottom: 12,
      transition: 'box-shadow 0.2s cubic-bezier(0.2,0.7,0.3,1), transform 0.2s cubic-bezier(0.2,0.7,0.3,1), border-color 0.2s',
      height: fillHeight ? '100%' : 'auto',
      display: fillHeight ? 'flex' : 'block',
      flexDirection: fillHeight ? 'column' : undefined,
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(255,255,255,0.06), 0 12px 32px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.7)'
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(255,255,255,0.04), 0 6px 18px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.7)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
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
          fontSize: 11, fontWeight: 600, color: SHELL.text2,
          letterSpacing: '0.10em', textTransform: 'uppercase',
        }}>{category}</span>
        {age && (
          <span style={{ fontSize: 11, color: SHELL.text3, fontWeight: 500, letterSpacing: '-0.01em' }}>
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
              color: 'rgba(255,255,255,0.36)',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.14s ease, color 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text1 }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.36)' }}
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
// One card, three compact rows. Replaces the wall of three stacked
// PriorityActionCards that each rendered the full analytical `problem`
// paragraph as a bold headline. Each row here shows ONE short action line
// (action.action, falling back to a clamped problem). Click a row to expand
// the diagnostic prose + "why this works"; otherwise nothing is shown.
function ActionsRailCard({ items, totalCount }) {
  const [openKey, setOpenKey] = useState(null)
  if (!items || items.length === 0) return null

  const impactColor = (impact) => {
    const k = (impact || 'med').toLowerCase()
    // Dark-mode text variants of the brand red/amber. The saturated brand
    // values (#e5251b / #d97706) are reserved for CTA backgrounds; using
    // them as small label text on dark shimmers/halates. #fb6a60 / #f0a23b
    // are the canonical text-on-dark equivalents used elsewhere in the app.
    return k === 'high' ? '#fb6a60' : k === 'low' ? SHELL.text3 : '#f0a23b'
  }
  const impactLabel = (impact) => {
    const k = (impact || 'med').toLowerCase()
    return k === 'high' ? 'High' : k === 'low' ? 'Low' : 'Medium'
  }

  // Short, scannable one-liner. action.action is usually a verb phrase ("Add
  // chapters to your three newest uploads"). If the API only sent a long
  // `problem` diagnosis, take the first clause and clamp it - the whole
  // paragraph belongs in the expander, not the always-visible row.
  const headlineFor = (a) => {
    const raw = (a.action && a.action.length > 8 ? a.action : a.problem) || ''
    const clean = raw.replace(/\s+/g, ' ').trim()
    if (clean.length <= 120) return clean
    const cut = clean.slice(0, 117)
    return cut.replace(/\s+\S*$/, '') + '…'
  }

  return (
    <article style={{
      background: SHELL.cardFlat,
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      boxShadow: '0 1px 2px rgba(255,255,255,0.04), 0 6px 18px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
      overflow: 'hidden',
      marginBottom: 12,
    }}>
      {/* Header — single eyebrow line, no big bold paragraph */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
      }}>
        <span style={{
          fontSize: 11, fontWeight: 600, color: SHELL.text2,
          letterSpacing: '0.10em', textTransform: 'uppercase',
        }}>Priority actions</span>
        <span style={{
          fontSize: 11, fontWeight: 600, color: SHELL.text3,
          background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 99,
          fontVariantNumeric: 'tabular-nums',
        }}>{items.length} of {totalCount}</span>
      </div>

      {/* Rows */}
      <div>
        {items.map((it, i) => {
          const isOpen = openKey === it.key
          const label = impactLabel(it.impact)
          const showFix = it.action.action && it.action.action !== it.action.problem
          const showWhy = !!it.action.expected_outcome
          return (
            <div key={it.key} style={{
              borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.10)',
              transition: 'background 0.14s',
              background: isOpen ? 'rgba(255,255,255,0.015)' : 'transparent',
            }}>
              {/* Row */}
              <div
                role="button" tabIndex={0}
                onClick={() => setOpenKey(o => o === it.key ? null : it.key)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenKey(o => o === it.key ? null : it.key) } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 18px', cursor: 'pointer', userSelect: 'none',
                }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: 7,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.06)',
                  fontSize: 11, fontWeight: 600, color: SHELL.text1,
                  fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.2px',
                }}>{i + 1}</span>

                <p style={{
                  flex: 1, minWidth: 0,
                  fontSize: 13.5, fontWeight: 450, color: SHELL.text1,
                  letterSpacing: '-0.1px', lineHeight: 1.45,
                  margin: 0,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>{headlineFor(it.action)}</p>

                <span style={{
                  flexShrink: 0,
                  fontSize: 10.5, fontWeight: 600, color: impactColor(it.impact),
                  letterSpacing: '-0.05px',
                  whiteSpace: 'nowrap',
                }}>{label}</span>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); it.onAct() }}
                  style={{
                    flexShrink: 0,
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '7px 14px', borderRadius: 99,
                    border: 'none', cursor: 'pointer',
                    background: '#e5251b', color: '#fff',
                    fontFamily: 'inherit',
                    fontSize: 12, fontWeight: 600, letterSpacing: '-0.05px',
                    boxShadow: '0 1px 3px rgba(229,37,27,0.30)',
                    transition: 'filter 0.14s, transform 0.14s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  {it.ctaLabel}
                  <ArrowRight size={11} strokeWidth={2.4}/>
                </button>

                <ChevronDown size={14} strokeWidth={2}
                  style={{
                    flexShrink: 0, color: SHELL.text3,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}/>
              </div>

              {/* Expanded detail (per row) */}
              {isOpen && (
                <div style={{ padding: '0 18px 14px 60px' }}>
                  {it.action.problem && (
                    <p style={{
                      fontSize: 12.5, fontWeight: 400, color: 'rgba(255,255,255,0.65)',
                      lineHeight: 1.6, letterSpacing: '-0.02em',
                      marginBottom: (showFix || showWhy) ? 10 : 8,
                    }}>{it.action.problem}</p>
                  )}
                  {(showFix || showWhy) && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: showFix && showWhy ? '1fr 1fr' : '1fr',
                      gap: 8, marginBottom: 8,
                    }}>
                      {showFix && (
                        <div style={{
                          background: 'rgba(229,37,27,0.04)',
                          border: '1px solid rgba(229,37,27,0.10)',
                          borderLeft: '3px solid #e5251b',
                          borderRadius: '0 8px 8px 0',
                          padding: '8px 12px',
                        }}>
                          <p style={{ fontSize: 9.5, fontWeight: 600, color: '#fb6a60', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4 }}>Fix</p>
                          <p style={{ fontSize: 12, fontWeight: 500, color: SHELL.text1, lineHeight: 1.55 }}>{it.action.action}</p>
                        </div>
                      )}
                      {showWhy && (
                        <div style={{
                          background: 'rgba(5,150,105,0.04)',
                          border: '1px solid rgba(5,150,105,0.12)',
                          borderLeft: '3px solid #059669',
                          borderRadius: '0 8px 8px 0',
                          padding: '8px 12px',
                        }}>
                          <p style={{ fontSize: 9.5, fontWeight: 600, color: '#34d27b', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4 }}>Why this works</p>
                          <p style={{ fontSize: 12, fontWeight: 500, color: SHELL.text1, lineHeight: 1.55 }}>{it.action.expected_outcome}</p>
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); it.onDone() }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 99,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: SHELL.cardFlat, color: 'rgba(255,255,255,0.65)',
                        fontFamily: 'inherit',
                        fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.05px',
                        cursor: 'pointer',
                        transition: 'background 0.14s, color 0.14s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text1 }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
                    >Mark done</button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); it.onDismiss() }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 99,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: SHELL.cardFlat, color: SHELL.text2,
                        fontFamily: 'inherit',
                        fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.05px',
                        cursor: 'pointer',
                        transition: 'background 0.14s, color 0.14s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text1 }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.78)' }}
                    >Dismiss</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </article>
  )
}

function PriorityActionCard({ action, rank, total, impact, onAct, onDone, onDismiss, ctaLabel }) {
  const [open, setOpen] = useState(false)
  const impactKey = (impact || 'med').toLowerCase()
  const impactClr = impactKey === 'high' ? '#fb6a60' : impactKey === 'low' ? SHELL.text3 : '#f0a23b'
  const impactBg  = impactKey === 'high' ? 'rgba(229,37,27,0.07)' : impactKey === 'low' ? 'rgba(255,255,255,0.04)' : 'rgba(217,119,6,0.08)'
  const impactBdr = impactKey === 'high' ? 'rgba(229,37,27,0.18)' : impactKey === 'low' ? 'rgba(255,255,255,0.10)' : 'rgba(217,119,6,0.18)'

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
          fontSize: 9.5, fontWeight: 600, color: impactClr,
          background: impactBg, border: `1px solid ${impactBdr}`,
          padding: '3px 8px', borderRadius: 100,
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>{impactKey} impact</span>
      }
    >
      {/* Headline — lighter weight so the Actions tab doesn't read like a
          wall of bold. The eyebrow chip already signals the weight. */}
      <h3 style={{
        fontSize: 13.5, fontWeight: 450, color: SHELL.text1,
        letterSpacing: '-0.1px', lineHeight: 1.5,
        marginBottom: 10,
      }}>{action.problem || action.action || 'Action'}</h3>

      {/* Meta row + CTAs + Detail chevron */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 11, fontWeight: 500, color: SHELL.text3,
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
            fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
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
            border: '1px solid rgba(255,255,255,0.08)',
            background: SHELL.cardFlat, color: SHELL.text2,
            fontFamily: 'inherit',
            fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
            cursor: 'pointer',
            transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
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
          borderTop: '1px solid rgba(255,255,255,0.08)',
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
                      fontSize: 9.5, fontWeight: 600, color: '#fb6a60',
                      letterSpacing: '0.10em', textTransform: 'uppercase',
                      marginBottom: 6,
                    }}>Fix</p>
                    <p style={{
                      fontSize: 12.5, fontWeight: 450, color: SHELL.text1,
                      letterSpacing: '-0.01em', lineHeight: 1.65,
                    }}>{action.action}</p>
                  </div>
                )}
                {showWhy && (
                  <div style={{
                    background: 'rgba(22,163,74,0.14)',
                    border: '1px solid rgba(5,150,105,0.14)',
                    borderLeft: `3px solid ${'#34d27b'}`,
                    borderRadius: '0 10px 10px 0',
                    padding: '11px 14px',
                  }}>
                    <p style={{
                      fontSize: 9.5, fontWeight: 600, color: '#34d27b',
                      letterSpacing: '0.10em', textTransform: 'uppercase',
                      marginBottom: 6,
                    }}>Why this works</p>
                    <p style={{
                      fontSize: 12.5, fontWeight: 450, color: SHELL.text1,
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
              border: '1px solid rgba(255,255,255,0.08)',
              background: SHELL.cardFlat, color: SHELL.text2,
              fontFamily: 'inherit',
              fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
              cursor: 'pointer',
              transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
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
      iconColor={'#f0a23b'}
      iconBg="rgba(217,119,6,0.10)"
      category="Milestone Unlocked"
      age={milestone.earned_age || ''}
      onDismiss={onDismiss}
    >
      <h3 style={{
        fontSize: 14, fontWeight: 600, color: SHELL.text1,
        letterSpacing: '-0.25px', lineHeight: 1.35,
        marginBottom: 12,
      }}>{milestone.headline}</h3>

      {/* Visual band: filled-to-100 bar in amber, signalling crossed */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 6,
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
          fontSize: 11.5, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em',
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
              fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
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
              border: '1px solid rgba(255,255,255,0.08)',
              background: SHELL.cardFlat, color: SHELL.text2,
              fontFamily: 'inherit',
              fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
              cursor: 'pointer',
              transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            Detail
            <ChevronDown size={11} strokeWidth={2.4} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}/>
          </button>
        )}
      </div>

      {open && milestone.body && (
        <div style={{
          marginTop: 14, paddingTop: 14,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <p style={{
            fontSize: 12.5, fontWeight: 500, color: SHELL.text2,
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
      iconColor={SHELL.text1}
      iconBg="rgba(255,255,255,0.06)"
      category="Content Mix"
      onDismiss={onDismiss}
      fillHeight={fillHeight}
    >
      <h3 style={{
        fontSize: 14, fontWeight: 600, color: SHELL.text1,
        letterSpacing: '-0.25px', lineHeight: 1.35,
        marginBottom: 12,
      }}>{patterns.headline || 'Your content mix'}</h3>

      <div style={{ marginBottom: 10 }}>
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 7,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${sPct}%`, height: '100%',
            background: 'linear-gradient(90deg, rgba(229,37,27,0.55) 0%, #e5251b 100%)',
          }}/>
          <div style={{
            width: `${lPct}%`, height: '100%',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.72) 100%)',
          }}/>
        </div>
      </div>

      {/* Legend row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 11.5, fontWeight: 500, color: SHELL.text2, letterSpacing: '-0.01em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: '#e5251b' }}/>
          Shorts {sCount != null && (<><strong style={{ color: SHELL.text1, fontWeight: 600 }}> {sCount}</strong> · {sPct}%</>)}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 11.5, fontWeight: 500, color: SHELL.text2, letterSpacing: '-0.01em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.72)' }}/>
          Long {lCount != null && (<><strong style={{ color: SHELL.text1, fontWeight: 600 }}> {lCount}</strong> · {lPct}%</>)}
        </span>
      </div>

      {/* Recommendation line — fills the height gap with real signal */}
      <p style={{
        fontSize: 12.5, fontWeight: 500, color: SHELL.text2,
        letterSpacing: '-0.01em', lineHeight: 1.55,
        marginBottom: 14,
      }}>
        <span style={{ fontWeight: 600, color: SHELL.text1 }}>Recommendation: </span>
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
              border: '1px solid rgba(255,255,255,0.08)',
              background: SHELL.cardFlat, color: SHELL.text2,
              fontFamily: 'inherit',
              fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
              cursor: 'pointer',
              transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            Detail
            <ChevronDown size={11} strokeWidth={2.4} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}/>
          </button>
        )}
      </div>

      {open && (patterns.body || patterns.text) && (
        <div style={{
          marginTop: 14, paddingTop: 14,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <p style={{
            fontSize: 12.5, fontWeight: 500, color: SHELL.text2,
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
    score >= 75 ? '#34d27b' : score >= 50 ? '#f0a23b' : C.red
  const scoreBdr =
    score >= 75 ? 'rgba(5,150,105,0.25)' : score >= 50 ? 'rgba(217,119,6,0.22)' : 'rgba(229,37,27,0.22)'
  const scoreBg =
    score >= 75 ? 'rgba(22,163,74,0.14)' : score >= 50 ? 'rgba(217,119,6,0.06)' : 'rgba(229,37,27,0.05)'

  // Map each category score to a dot color. We surface the 5 categories
  // VidIQ users instantly recognise: CTR, retention, strategy,
  // consistency, engagement. Hover reveals the label + score.
  const dotFor = (v) => {
    if (v == null) return { c: 'rgba(255,255,255,0.20)', bdr: 'rgba(255,255,255,0.20)' }
    if (v >= 75) return { c: '#34d27b', bdr: 'rgba(5,150,105,0.35)' }
    if (v >= 50) return { c: '#f0a23b', bdr: 'rgba(217,119,6,0.35)' }
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
          <span style={{ fontSize: 13, fontWeight: 700, color: scoreClr, letterSpacing: '-0.3px', lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: SHELL.text3 }}>/100</span>
        </span>
      }
    >
      <h3 style={{
        fontSize: 14, fontWeight: 600, color: SHELL.text1,
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
              <span style={{ fontSize: 11.5, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em' }}>{d.label}</span>
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
          <span style={{ fontSize: 11.5, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em' }}>
            Weakest: <span style={{ color: SHELL.text2, fontWeight: 600 }}>{weakest.join(', ')}</span>
          </span>
        )}
        <div style={{ flex: 1 }}/>
        <button
          type="button"
          onClick={onToggle}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '6px 11px', borderRadius: 100,
            border: '1px solid rgba(255,255,255,0.08)',
            background: SHELL.cardFlat, color: SHELL.text2,
            fontFamily: 'inherit',
            fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
            cursor: 'pointer',
            transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
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
      iconColor={'#34d27b'}
      iconBg="rgba(22,163,74,0.14)"
      category="Top Performer"
      age={ageStr}
      onDismiss={onDismiss}
      rightSlot={mDisplay && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: 10.5, fontWeight: 700, color: '#34d27b',
          background: 'rgba(22,163,74,0.14)', border: '1px solid rgba(5,150,105,0.22)',
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
            background: '#26262b',
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
            borderRadius: 10, background: '#26262b',
          }}/>
        )}

        {/* Right side: title + metrics */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            fontSize: 14, fontWeight: 600, color: SHELL.text1,
            letterSpacing: '-0.25px', lineHeight: 1.4,
            marginBottom: 12,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{video.title}</h3>

          {/* Three-stat row */}
          <div style={{ display: 'flex', gap: 22, marginBottom: 'auto', alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Views</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.5px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(video.views || 0)}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Likes</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.5px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(video.likes || 0)}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Engagement</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: engagement >= 3 ? '#34d27b' : SHELL.text1, letterSpacing: '-0.5px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{engagement}%</p>
            </div>
          </div>

          {/* CTA row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            <span style={{ fontSize: 11.5, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em' }}>
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
                  fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
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
        <line x1={padX} y1={height - padBot} x2={width - padX} y2={height - padBot} stroke="rgba(255,255,255,0.08)" strokeWidth="1.2"/>
        <text x={width / 2} y={height / 2} textAnchor="middle" fontSize="12" fontWeight="600" fill="rgba(255,255,255,0.40)">No uploads in this window</text>
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
        <line key={i} x1={padX} y1={y} x2={width - padX} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 4"/>
      ))}

      {/* Baseline */}
      <line x1={padX} y1={height - padBot} x2={width - padX} y2={height - padBot} stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>

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
          fill="rgba(255,255,255,0.40)"
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
      <p style={{ fontSize: 9.5, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.11em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</p>
      <p style={{ fontSize: 17, fontWeight: 600, color: valueColor || SHELL.text1, letterSpacing: '-0.4px', lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>{value}</p>
      {hint && <p style={{ fontSize: 10.5, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em' }}>{hint}</p>}
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
  const verdictClr = pacePerWeek >= 3 ? '#34d27b'
    : pacePerWeek >= 1 ? SHELL.text2
    : '#f0a23b'

  const headline = currentStreak >= 7 ? `${currentStreak}-day posting streak`
    : currentStreak >= 3 ? `On a ${currentStreak}-day streak`
    : count >= 8 ? `${count} videos in 28 days`
    : pacePerWeek >= 1 ? `Posting ${pacePerWeek}× per week`
    : `${count} ${count === 1 ? 'video' : 'videos'} in 28 days`

  // Cell color for the (now collapsed) detail heatmap.
  const cellColor = (n) => {
    if (n === 0) return 'rgba(255,255,255,0.08)'
    if (n === 1) return 'rgba(229,37,27,0.40)'
    if (n === 2) return 'rgba(229,37,27,0.70)'
    return '#e5251b'
  }

  return (
    <FeedCard
      Icon={CalendarDays}
      iconColor={SHELL.text1}
      iconBg="rgba(255,255,255,0.06)"
      category="Posting Consistency · 28 days"
      onDismiss={onDismiss}
      rightSlot={currentStreak >= 2 && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10.5, fontWeight: 700, color: '#fb6a60',
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
          fontSize: 18, fontWeight: 600, color: SHELL.text1,
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
        paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)',
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
            border: '1px solid rgba(255,255,255,0.08)',
            background: SHELL.cardFlat, color: SHELL.text2,
            fontFamily: 'inherit',
            fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
            cursor: 'pointer',
            transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
        >
          {open ? 'Hide heatmap' : 'Daily heatmap'}
          <ChevronDown size={11} strokeWidth={2.4} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}/>
        </button>
      </div>

      {/* Daily heatmap inside the detail expansion */}
      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 12 }}>
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
                  border: c === 0 ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(229,37,27,0.10)',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
            <span style={{ fontSize: 10, color: SHELL.text3, fontWeight: 600, letterSpacing: '0.04em', marginRight: 4 }}>Less</span>
            {[0, 1, 2, 3].map(n => (
              <span key={n} style={{
                width: 11, height: 11, borderRadius: 3,
                background: cellColor(n),
                border: n === 0 ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(229,37,27,0.10)',
              }}/>
            ))}
            <span style={{ fontSize: 10, color: SHELL.text3, fontWeight: 600, letterSpacing: '0.04em', marginLeft: 4 }}>More</span>
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
      iconColor={SHELL.text1}
      iconBg="rgba(255,255,255,0.06)"
      category="Best Time To Publish · your data"
      onDismiss={onDismiss}
      rightSlot={
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10.5, fontWeight: 700, color: '#fb6a60',
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
          fontSize: 18, fontWeight: 600, color: SHELL.text1,
          letterSpacing: '-0.4px', lineHeight: 1.25,
        }}>{headline}</h3>
      </div>
      <p style={{
        fontSize: 12, fontWeight: 500, color: SHELL.text3,
        letterSpacing: '-0.01em', marginBottom: 16,
      }}>{verdict}</p>

      {/* 24-bar chart of avg views per hour-of-day */}
      <div style={{ marginBottom: 16 }}>
        <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none" style={{ display: 'block' }}>
          {/* Baseline */}
          <line x1={padX} y1={chartH - padBot} x2={chartW - padX} y2={chartH - padBot} stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>
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
                fill={isPeak ? '#e5251b' : 'rgba(255,255,255,0.12)'}
              >
                <title>{`${formatHour12(h)}: ${fmtNum(Math.round(v))} avg views`}</title>
              </rect>
            )
          })}
          {/* X-axis hour labels at 0, 6, 12, 18 */}
          {[0, 6, 12, 18].map(h => {
            const x = padX + h * ((chartW - padX * 2) / 24) + barW / 2 + 1
            return (
              <text key={h} x={x} y={chartH - 6} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="rgba(255,255,255,0.40)" letterSpacing="0.04em">
                {formatHour12(h).replace(' ', '')}
              </text>
            )
          })}
          <text x={chartW - padX} y={chartH - 6} textAnchor="end" fontSize="9.5" fontWeight="600" fill="rgba(255,255,255,0.40)" letterSpacing="0.04em">
            11PM
          </text>
        </svg>
      </div>

      {/* Stat strip: Best, Runner-up, Avoid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
        paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div>
          <p style={{ fontSize: 9.5, fontWeight: 600, color: '#fb6a60', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Best time</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: SHELL.text1, letterSpacing: '-0.3px', lineHeight: 1.15, marginBottom: 4 }}>
            {DAYS_SHORT[top.dow]} · {formatHour12(top.h)}
          </p>
          <p style={{ fontSize: 11, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
            {fmtNum(Math.round(top.avg))} avg views
          </p>
        </div>
        <div>
          <p style={{ fontSize: 9.5, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Runner-up</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: SHELL.text1, letterSpacing: '-0.3px', lineHeight: 1.15, marginBottom: 4 }}>
            {second ? `${DAYS_SHORT[second.dow]} · ${formatHour12(second.h)}` : '—'}
          </p>
          <p style={{ fontSize: 11, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
            {second ? `${fmtNum(Math.round(second.avg))} avg views` : 'Need more uploads'}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 9.5, fontWeight: 600, color: '#f0a23b', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Avoid</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: SHELL.text1, letterSpacing: '-0.3px', lineHeight: 1.15, marginBottom: 4 }}>
            {worst ? `${DAYS_SHORT[worst.dow]} · ${formatHour12(worst.h)}` : '—'}
          </p>
          <p style={{ fontSize: 11, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
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
            border: '1px solid rgba(255,255,255,0.08)',
            background: SHELL.cardFlat, color: SHELL.text2,
            fontFamily: 'inherit',
            fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
            cursor: 'pointer',
            transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
        >
          {open ? 'Hide weekly view' : 'Weekly view'}
          <ChevronDown size={11} strokeWidth={2.4} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}/>
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 12 }}>
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
                      background: isTop ? '#e5251b' : 'rgba(255,255,255,0.12)',
                      borderRadius: 3,
                      transition: 'height 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                    }} title={`${DAYS_LONG[i]}: ${fmtNum(Math.round(avg))} avg views`}/>
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: isTop ? C.red : SHELL.text3, letterSpacing: '0.04em' }}>
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
      iconColor={'#34d27b'}
      iconBg="rgba(22,163,74,0.14)"
      category="Tracked Lift · SEO Optimizer"
      age={ageStr}
      onDismiss={onDismiss}
      rightSlot={
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10.5, fontWeight: 700, color: '#34d27b',
          background: 'rgba(22,163,74,0.14)', border: '1px solid rgba(5,150,105,0.22)',
          padding: '3px 8px', borderRadius: 100,
          letterSpacing: '-0.05px', fontVariantNumeric: 'tabular-nums',
        }}>
          +{fmtNum(deltaViews)} views · +{deltaPct}%
        </span>
      }
    >
      <h3 style={{
        fontSize: 14, fontWeight: 600, color: SHELL.text1,
        letterSpacing: '-0.3px', lineHeight: 1.3,
        marginBottom: 14,
      }}>Your update is outperforming the old version</h3>

      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch', marginBottom: 14 }}>
        {/* Thumbnail */}
        {win.thumbnail_url ? (
          <div style={{
            flexShrink: 0, width: 180, aspectRatio: '16/9',
            borderRadius: 10, overflow: 'hidden',
            background: '#26262b',
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
            borderRadius: 10, background: '#26262b',
          }}/>
        )}

        {/* Diff + numbers */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Title diff */}
          {titleChanged && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <p style={{
                fontSize: 10, fontWeight: 600, color: SHELL.text3,
                letterSpacing: '0.10em', textTransform: 'uppercase',
              }}>Title change</p>
              <p style={{
                fontSize: 12, fontWeight: 500, color: SHELL.text3,
                letterSpacing: '-0.01em', lineHeight: 1.4,
                textDecoration: 'line-through',
                display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>{win.before_title}</p>
              <p style={{
                fontSize: 13, fontWeight: 600, color: SHELL.text1,
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
              <p style={{ fontSize: 9.5, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4 }}>Before</p>
              <p style={{ fontSize: 17, fontWeight: 600, color: SHELL.text2, letterSpacing: '-0.4px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(beforeViews)}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', paddingTop: 14 }}>
              <ArrowRight size={16} strokeWidth={2.4} color={SHELL.text3} />
            </div>
            <div>
              <p style={{ fontSize: 9.5, fontWeight: 600, color: '#34d27b', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4 }}>Now</p>
              <p style={{ fontSize: 17, fontWeight: 600, color: SHELL.text1, letterSpacing: '-0.4px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(currentViews)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: more wins + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 11.5, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em' }}>
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
              fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
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
      iconColor={'#f0a23b'}
      iconBg="rgba(217,119,6,0.10)"
      category="Daily Ideas"
      onDismiss={onDismiss}
      rightSlot={
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 10.5, fontWeight: 600, color: '#34d27b',
          background: 'rgba(22,163,74,0.14)', border: '1px solid rgba(5,150,105,0.22)',
          padding: '3px 9px', borderRadius: 100,
          letterSpacing: '0.10em', textTransform: 'uppercase',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: 99, background: '#34d27b' }}/>
          {top3.length} ready
        </span>
      }
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <h3 style={{
          fontSize: 14, fontWeight: 600, color: SHELL.text1,
          letterSpacing: '-0.15px', lineHeight: 1.3, margin: 0,
        }}>Start shooting one of these today</h3>
        <span style={{
          fontSize: 12, fontWeight: 500, color: isStale ? '#f0a23b' : 'rgba(255,255,255,0.78)',
          letterSpacing: '-0.05px',
        }}>{subline}</span>
      </div>

      {/* Idea rows. Each row: rank chip + title + angle + Use CTA. White
          backgrounds + readable text (not faint) for legibility. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {top3.map((idea, i) => {
          const score = idea.opportunityScore != null
            ? idea.opportunityScore
            : Math.max(65, 85 - i * 4)
          const scoreClr = score >= 80 ? '#34d27b' : score >= 65 ? '#f0a23b' : 'rgba(255,255,255,0.78)'
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 14px',
                background: SHELL.cardFlat,
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                transition: 'background 0.14s, border-color 0.14s, transform 0.14s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = SHELL.cardFlat; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {/* Rank badge — neutral charcoal, no amber tint */}
              <div style={{
                flexShrink: 0,
                width: 24, height: 24, borderRadius: 7,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.06)',
                fontSize: 11.5, fontWeight: 600, color: SHELL.text1,
                letterSpacing: '-0.2px',
                fontVariantNumeric: 'tabular-nums',
              }}>{i + 1}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Title */}
                <p style={{
                  fontSize: 13.5, fontWeight: 450, color: SHELL.text1,
                  letterSpacing: '-0.1px', lineHeight: 1.45,
                  marginBottom: 4,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>{idea.title}</p>
                {/* Angle (one-line truncated) — text2 for readability, not faint text3 */}
                {idea.angle && (
                  <p style={{
                    fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.65)',
                    letterSpacing: '-0.05px', lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>{idea.angle}</p>
                )}
                {/* Meta: keyword + score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  {idea.targetKeyword && (
                    <span style={{
                      fontSize: 10.5, fontWeight: 500, color: SHELL.text2,
                      letterSpacing: '-0.01em',
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                    }}>
                      <span style={{ width: 4, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.35)' }}/>
                      {idea.targetKeyword}
                    </span>
                  )}
                  <span style={{
                    fontSize: 10.5, fontWeight: 600, color: scoreClr,
                    letterSpacing: '-0.05px',
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
                  padding: '7px 14px', borderRadius: 100,
                  border: 'none', cursor: 'pointer',
                  background: '#e5251b', color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: 12, fontWeight: 600, letterSpacing: '-0.05px',
                  boxShadow: '0 1px 3px rgba(229,37,27,0.28)',
                  transition: 'filter 0.14s, transform 0.14s',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 11.5, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em' }}>
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
              border: '1px solid rgba(255,255,255,0.08)',
              background: refreshing ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
              color: refreshing ? SHELL.text3 : SHELL.text2,
              fontFamily: 'inherit',
              fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
              cursor: refreshing ? 'wait' : 'pointer',
              transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
            }}
            onMouseEnter={e => { if (!refreshing) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' } }}
            onMouseLeave={e => { if (!refreshing) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' } }}
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
              background: SHELL.text1, color: '#0e0e10',
              fontFamily: 'inherit',
              fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
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

// Suggested Competitors card. Auto-curated discovery surface: pulls
// channels from top_channel_cache (curated category leaderboards) and
// from comp:<niche_kw> rows in the cross-user youtube_search_cache.
// Zero new YouTube quota — everything comes from caches that were
// already populated by other features.
//
// Each row: avatar + name + sub count + Track CTA. The Track CTA stashes
// the channel name in sessionStorage and switches to the Competitors
// page, which reads the prefill and pre-runs the search. The user then
// hits the actual Track button there (which IS the analyze call). This
// avoids surprise credit burn from a one-click track on the Feed.
function TitleSuggestionCard({ video, suggestions, ageLabel, applyingIdx, appliedIdx, applyError, onApply, onOpenStudio, onDismiss }) {
  const [activeIdx, setActiveIdx] = useState(0)
  if (!video || !suggestions?.length) return null
  const thumbAspect = video.is_short ? '9 / 16' : '16 / 9'
  const thumbWidth  = video.is_short ? 150 : 280
  const idx     = Math.max(0, Math.min(suggestions.length - 1, activeIdx))
  const focused = suggestions[idx]
  const score   = Math.max(0, Math.min(100, Math.round(Number(focused?.score || 0))))
  const tone    = score >= 80 ? { bg: 'rgba(22,163,74,0.16)',  text: '#34d27b', bdr: 'rgba(22,163,74,0.32)' }
                : score >= 50 ? { bg: 'rgba(217,118,6,0.16)',  text: '#f0a23b', bdr: 'rgba(217,118,6,0.32)' }
                :                { bg: 'rgba(229,37,27,0.13)', text: '#fb6a60', bdr: 'rgba(229,37,27,0.32)' }
  const isApplying = applyingIdx === idx
  const isApplied  = appliedIdx  === idx
  const ctaLabel   = isApplied ? 'Applied to YouTube' : isApplying ? 'Applying…' : 'Apply Title'
  const canCycle   = suggestions.length > 1

  return (
    <article style={{
      background: SHELL.cardFlat,
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '14px 18px 16px 18px',
      boxShadow: '0 1px 2px rgba(255,255,255,0.04), 0 6px 18px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <h3 style={{
          fontSize: 16, fontWeight: 600, color: SHELL.text1,
          letterSpacing: '-0.2px', lineHeight: 1.3, margin: 0,
        }}>Title Suggestion</h3>
        {ageLabel && (
          <span style={{
            fontSize: 12.5, fontWeight: 450, color: SHELL.text3,
            letterSpacing: '-0.01em',
          }}>· {ageLabel}</span>
        )}
        <div style={{ flex: 1 }}/>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{
              width: 28, height: 28, borderRadius: 8,
              border: 'none', background: 'transparent',
              color: 'rgba(255,255,255,0.36)',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.14s, color 0.14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text1 }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.36)' }}
          >
            <XIcon size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Inset compare panel: HD thumb LEFT, current → rewrite stack RIGHT */}
      <div style={{
        display: 'flex',
        gap: 18,
        alignItems: 'stretch',
        padding: 14,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        marginBottom: 14,
      }}>
        <div style={{ flexShrink: 0, width: thumbWidth }}>
          {(video.video_id || video.thumbnail) ? (
            <img
              src={ytMaxThumbUrl(video.video_id) || video.thumbnail}
              alt=""
              loading="lazy"
              onLoad={makeThumbOnLoad(video.video_id, video.thumbnail)}
              onError={makeThumbOnError(video.video_id, video.thumbnail)}
              style={{
                display: 'block',
                width: '100%', aspectRatio: thumbAspect,
                objectFit: 'cover',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          ) : (
            <div style={{
              width: '100%', aspectRatio: thumbAspect,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}/>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
          {/* Current title (no score; SEO Studio doesn't score the original) */}
          <div style={{ minWidth: 0 }}>
            <p style={{
              margin: '0 0 4px',
              fontSize: 11, fontWeight: 600, color: SHELL.text3,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>Your title now</p>
            <p style={{
              margin: 0, fontSize: 13.5, fontWeight: 600, color: SHELL.text2,
              letterSpacing: '-0.1px', lineHeight: 1.4,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{video.title}</p>
          </div>

          {/* Divider with centered arrow circle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }}/>
            <span style={{
              flexShrink: 0,
              width: 22, height: 22, borderRadius: 99,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: SHELL.text3,
            }}>
              <ArrowDown size={12} strokeWidth={2.2} />
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }}/>
          </div>

          {/* Focused rewrite (score chip + title) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <span style={{
              flexShrink: 0,
              width: 34, height: 34, borderRadius: 99,
              background: tone.bg, color: tone.text,
              border: `1px solid ${tone.bdr}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12.5, fontWeight: 600,
              letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}>{score}</span>
            <p style={{
              flex: 1, minWidth: 0, margin: 0,
              fontSize: 14, fontWeight: 600, color: SHELL.text1,
              letterSpacing: '-0.15px', lineHeight: 1.4,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{focused.title}</p>
          </div>

          {/* Why this works */}
          {focused.why_it_works && (
            <p style={{
              margin: '8px 0 0 46px',
              fontSize: 12.5, fontWeight: 450, color: SHELL.text3,
              letterSpacing: '-0.01em', lineHeight: 1.45,
            }}>{focused.why_it_works}</p>
          )}
        </div>
      </div>

      {/* Pagination dots — only when there are multiple suggestions */}
      {canCycle && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
          {suggestions.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIdx(i)}
              aria-label={`Suggestion ${i + 1} of ${suggestions.length}`}
              style={{
                width: i === idx ? 18 : 6, height: 6,
                borderRadius: 99,
                border: 'none',
                background: i === idx ? '#e5251b' : 'rgba(255,255,255,0.18)',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.2s, background 0.2s',
              }}
            />
          ))}
        </div>
      )}

      {/* Bottom action row: Regenerate (cycle) + Apply Title (primary) */}
      <div style={{ display: 'grid', gridTemplateColumns: canCycle ? '1fr 1fr' : '1fr', gap: 10 }}>
        {canCycle && (
          <button
            type="button"
            onClick={() => setActiveIdx((idx + 1) % suggestions.length)}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '10px 14px', borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(255,255,255,0.03)',
              color: SHELL.text1,
              fontFamily: 'inherit',
              fontSize: 13, fontWeight: 600, letterSpacing: '-0.05px',
              cursor: 'pointer',
              transition: 'background 0.14s, border-color 0.14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)' }}
          >
            <RefreshCw size={13} strokeWidth={2.1} />
            Next suggestion
          </button>
        )}

        <button
          type="button"
          disabled={isApplying || isApplied}
          onClick={() => onApply?.(focused, idx, video)}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '10px 14px', borderRadius: 100,
            border: 'none',
            background: isApplied ? 'rgba(22,163,74,0.85)' : '#e5251b',
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, letterSpacing: '-0.05px',
            boxShadow: isApplied ? 'none' : '0 1px 3px rgba(229,37,27,0.28)',
            cursor: (isApplying || isApplied) ? 'default' : 'pointer',
            transition: 'filter 0.14s, transform 0.14s, background 0.2s',
          }}
          onMouseEnter={e => { if (!isApplying && !isApplied) { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          {isApplying && <RefreshCw size={13} strokeWidth={2.1} style={{ animation: 'spin 1s linear infinite' }} />}
          {ctaLabel}
        </button>
      </div>

      {applyError && (
        <p style={{ margin: '8px 2px 0', fontSize: 12, fontWeight: 500, color: '#fb6a60' }}>
          {applyError}
        </p>
      )}
    </article>
  )
}

function SuggestedCompetitorsCard({ suggestions, category, onTrack, onDismiss, onOpenAll }) {
  const top = (suggestions || []).slice(0, 4)
  if (top.length < 3) return null  // hide if signal is thin

  const subline = category
    ? `Based on your top niche: ${category.replace(/-/g, ' ')}`
    : 'Based on the keywords your channel ranks for'

  return (
    <FeedCard
      Icon={UserPlus}
      iconColor={'#fb6a60'}
      iconBg="rgba(229,37,27,0.10)"
      category="Suggested Competitors"
      onDismiss={onDismiss}
      rightSlot={
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 10.5, fontWeight: 600, color: SHELL.text2,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '3px 9px', borderRadius: 100,
          letterSpacing: '0.10em', textTransform: 'uppercase',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.45)' }}/>
          {top.length} picks
        </span>
      }
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <h3 style={{
          fontSize: 14, fontWeight: 600, color: SHELL.text1,
          letterSpacing: '-0.15px', lineHeight: 1.3, margin: 0,
        }}>Channels in your niche worth tracking</h3>
        <span style={{
          fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.78)',
          letterSpacing: '-0.05px',
        }}>{subline}</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
        gap: 10,
        marginBottom: 12,
      }}>
        {top.map((c, i) => {
          const subs = Number(c.subscribers || 0)
          const subsLabel = subs > 0 ? `${fmtNum(subs)} subs` : ''
          const handle = c.handle ? (c.handle.startsWith('@') ? c.handle : `@${c.handle}`) : ''
          return (
            <div
              key={c.channel_id || i}
              style={{
                display: 'flex', flexDirection: 'column', gap: 10,
                padding: '14px 14px 12px',
                background: SHELL.cardFlat,
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                transition: 'background 0.14s, border-color 0.14s, transform 0.14s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = SHELL.cardFlat; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {/* Avatar row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {c.thumbnail ? (
                  <img
                    src={c.thumbnail}
                    alt=""
                    loading="lazy"
                    onError={e => { e.currentTarget.style.visibility = 'hidden' }}
                    style={{
                      flexShrink: 0,
                      width: 36, height: 36, borderRadius: 99,
                      objectFit: 'cover',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  />
                ) : (
                  <div style={{
                    flexShrink: 0,
                    width: 36, height: 36, borderRadius: 99,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: SHELL.text3,
                  }}>
                    <Users size={15} strokeWidth={2} />
                  </div>
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{
                    fontSize: 13, fontWeight: 600, color: SHELL.text1,
                    letterSpacing: '-0.15px', lineHeight: 1.25,
                    margin: 0,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{c.channel_name || 'Unknown channel'}</p>
                  {(subsLabel || handle) && (
                    <p style={{
                      fontSize: 11.5, fontWeight: 500, color: SHELL.text3,
                      letterSpacing: '-0.01em', lineHeight: 1.3,
                      margin: '3px 0 0',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {[subsLabel, handle].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Track CTA */}
              <button
                type="button"
                onClick={() => onTrack?.(c)}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  padding: '7px 14px', borderRadius: 100,
                  border: 'none', cursor: 'pointer',
                  background: '#e5251b', color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: 12, fontWeight: 600, letterSpacing: '-0.05px',
                  boxShadow: '0 1px 3px rgba(229,37,27,0.28)',
                  transition: 'filter 0.14s, transform 0.14s',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Track
                <ArrowRight size={11} strokeWidth={2.4} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Bottom row: open Competitors */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 11.5, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em' }}>
          Picked from caches, no new search burned
        </span>
        <div style={{ flex: 1 }}/>
        {onOpenAll && (
          <button
            type="button"
            onClick={onOpenAll}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 11px', borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.02)',
              color: SHELL.text2,
              fontFamily: 'inherit',
              fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.05px',
              cursor: 'pointer',
              transition: 'background 0.14s, border-color 0.14s, color 0.14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = SHELL.text1 }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = SHELL.text2 }}
          >
            Open Competitors
            <ArrowRight size={11} strokeWidth={2.4} />
          </button>
        )}
      </div>
    </FeedCard>
  )
}

// Competitor Activity card. Shows recent uploads from the channels the
// Related Traffic card. Auto-curated, zero-credit. Shows up to 6 OTHER
// videos on YouTube that recently sent views to this creator (via the
// "Suggested videos" surface), surfaced from Analytics. Visual model
// mirrors the VidIQ Feed reference: large HD thumbnails in a 2-up grid,
// duration badge bottom-right of each thumb, title 2-line clamp, stats
// row showing the source video's total views with an arrow to a brand-
// red "N views to you" pill. Click anywhere on a tile opens the video
// on YouTube in a new tab.
function RelatedTrafficCard({ items, ageLabel, reason, rawSourceCount, onOpen, onDismiss }) {
  const top = (items || []).slice(0, 6)
  // Empty-state explainer. Renders the card head with a clear "why
  // nothing showed" message instead of silently disappearing.
  const reasonCopy = top.length === 0 ? (() => {
    if (reason === 'no_analytics_traffic') return 'No suggested-video traffic recorded for your channel in the last 14 days. As your watch time grows, YouTube will start surfacing your videos as suggestions and this card will populate.'
    if (reason === 'all_filtered')         return `Found ${rawSourceCount || 0} source video${rawSourceCount === 1 ? '' : 's'} sending traffic, but none cleared the 10K-view quality floor. Either the sources are tiny channels, or your own uploads, so we're hiding them.`
    if (reason === 'resolve_failed')       return 'Could not resolve the source videos via YouTube. We will retry on the next refresh.'
    if (reason === 'no_source_ids')        return 'No source video IDs in the Analytics response. Common when a channel is brand new or has zero suggested-video traffic.'
    return null
  })() : null
  if (top.length === 0 && !reasonCopy) return null

  function fmtDuration(sec) {
    sec = Math.max(0, Math.floor(Number(sec || 0)))
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <article style={{
      background: SHELL.cardFlat,
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '14px 18px 16px 18px',
      boxShadow: '0 1px 2px rgba(255,255,255,0.04), 0 6px 18px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
      marginBottom: 12,
    }}>
      {/* Plain head: title + age + dismiss */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <h3 style={{
          fontSize: 16, fontWeight: 600, color: SHELL.text1,
          letterSpacing: '-0.2px', lineHeight: 1.3, margin: 0,
        }}>{top.length > 0
          ? `New Traffic From ${top.length} Related ${top.length === 1 ? 'Video' : 'Videos'}`
          : 'New Traffic From Related Videos'}</h3>
        {ageLabel && (
          <span style={{
            fontSize: 12.5, fontWeight: 450, color: SHELL.text3,
            letterSpacing: '-0.01em',
          }}>· {ageLabel}</span>
        )}
        <div style={{ flex: 1 }}/>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{
              width: 28, height: 28, borderRadius: 8,
              border: 'none', background: 'transparent',
              color: 'rgba(255,255,255,0.36)',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.14s, color 0.14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text1 }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.36)' }}
          >
            <XIcon size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Empty-state explainer — silent failures become visible failures. */}
      {top.length === 0 && reasonCopy && (
        <div style={{
          padding: '16px 18px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.10)',
          borderRadius: 12,
          color: SHELL.text2,
          fontSize: 13, fontWeight: 450, lineHeight: 1.55,
          letterSpacing: '-0.01em',
        }}>{reasonCopy}</div>
      )}

      {/* 2-up grid (auto-fill, collapses to 1-up on narrow widths) */}
      {top.length > 0 && <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 14,
      }}>
        {top.map((it, i) => {
          const dur = fmtDuration(it.duration_seconds)
          return (
            <button
              key={it.video_id || i}
              type="button"
              onClick={() => onOpen?.(it)}
              aria-label={`Open ${it.title} on YouTube`}
              style={{
                display: 'flex', flexDirection: 'column', gap: 0,
                padding: 0,
                background: 'transparent',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'transform 0.18s cubic-bezier(0.2,0.7,0.3,1)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {/* HD thumbnail with duration badge */}
              <div style={{ position: 'relative', width: '100%' }}>
                {(it.video_id || it.thumbnail) ? (
                  <img
                    src={ytMaxThumbUrl(it.video_id) || it.thumbnail}
                    alt=""
                    loading="lazy"
                    onLoad={makeThumbOnLoad(it.video_id, it.thumbnail)}
                    onError={makeThumbOnError(it.video_id, it.thumbnail)}
                    style={{
                      display: 'block',
                      width: '100%', aspectRatio: '16 / 9',
                      objectFit: 'cover',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%', aspectRatio: '16 / 9',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}/>
                )}
                {dur && dur !== '0:00' && (
                  <span style={{
                    position: 'absolute', right: 8, bottom: 8,
                    padding: '3px 7px', borderRadius: 6,
                    background: 'rgba(0,0,0,0.82)',
                    color: '#fff',
                    fontSize: 11.5, fontWeight: 600,
                    letterSpacing: '-0.01em',
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1.1,
                  }}>{dur}</span>
                )}
              </div>

              {/* Title */}
              <p style={{
                margin: '10px 2px 0',
                fontSize: 13.5, fontWeight: 600, color: SHELL.text1,
                letterSpacing: '-0.1px', lineHeight: 1.35,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden', textOverflow: 'ellipsis',
                minHeight: 36,
              }}>{it.title || 'Untitled'}</p>

              {/* Channel name (subtle) */}
              {it.channel_name && (
                <p style={{
                  margin: '4px 2px 0',
                  fontSize: 12, fontWeight: 450, color: SHELL.text3,
                  letterSpacing: '-0.01em', lineHeight: 1.3,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{it.channel_name}</p>
              )}

              {/* Stats row: eye + view count → "N views to you" pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                margin: '8px 2px 0',
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  color: SHELL.text3,
                  fontSize: 12, fontWeight: 500,
                  letterSpacing: '-0.01em',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  <Eye size={12} strokeWidth={2.2} />
                  {fmtNum(it.view_count || 0)}
                </span>
                <ArrowRight size={12} strokeWidth={2.2} style={{ color: SHELL.text3 }}/>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 9px', borderRadius: 100,
                  background: 'rgba(229,37,27,0.13)',
                  border: '1px solid rgba(229,37,27,0.32)',
                  color: '#fb6a60',
                  fontSize: 11.5, fontWeight: 600,
                  letterSpacing: '-0.01em',
                  fontVariantNumeric: 'tabular-nums',
                }}>{fmtNum(it.views_to_you || 0)} {it.views_to_you === 1 ? 'view to you' : 'views to you'}</span>
              </div>
            </button>
          )
        })}
      </div>}
    </article>
  )
}


function CompetitorActivityCard({ items, refreshing, onRefresh, onOpen, onOpenAll, onDismiss }) {
  const top3 = (items || []).slice(0, 3)
  if (top3.length === 0) return null

  return (
    <FeedCard
      Icon={Users}
      iconColor={SHELL.text1}
      iconBg="rgba(255,255,255,0.06)"
      category="Competitor Moves · last 7 days"
      onDismiss={onDismiss}
      rightSlot={
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10.5, fontWeight: 600, color: SHELL.text2,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
          padding: '3px 8px', borderRadius: 100,
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          {top3.length} new
        </span>
      }
    >
      <h3 style={{
        fontSize: 14, fontWeight: 600, color: SHELL.text1,
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
              background: SHELL.cardFlat,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              overflow: 'hidden',
              textDecoration: 'none',
              transition: 'background 0.14s ease, border-color 0.14s ease, transform 0.14s ease, box-shadow 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            {/* Thumbnail */}
            <div style={{ position: 'relative', aspectRatio: '16/9', background: '#26262b', overflow: 'hidden' }}>
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
                fontSize: 12.5, fontWeight: 600, color: SHELL.text1,
                letterSpacing: '-0.15px', lineHeight: 1.35,
                marginBottom: 6,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: 34,
              }}>{item.title}</p>
              <p style={{
                fontSize: 10.5, fontWeight: 600, color: SHELL.text2,
                letterSpacing: '-0.05px', lineHeight: 1.3,
                marginBottom: 4,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{item.channel_name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 500, color: SHELL.text3, fontVariantNumeric: 'tabular-nums' }}>
                <span>{fmtNum(item.views || 0)} views</span>
                <span style={{ color: 'rgba(255,255,255,0.20)' }}>·</span>
                <span>{item.age_label || ''}</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 11.5, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em' }}>
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
              border: '1px solid rgba(255,255,255,0.08)',
              background: refreshing ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
              color: refreshing ? SHELL.text3 : SHELL.text2,
              fontFamily: 'inherit',
              fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
              cursor: refreshing ? 'wait' : 'pointer',
              transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
            }}
            onMouseEnter={e => { if (!refreshing) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' } }}
            onMouseLeave={e => { if (!refreshing) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' } }}
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
              background: SHELL.text1, color: '#0e0e10',
              fontFamily: 'inherit',
              fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
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
      borderTop: `3px solid ${checked ? 'rgba(255,255,255,0.08)' : color}`,
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
              style={{ width: 15, height: 15, accentColor: '#34d27b', cursor: 'pointer', flexShrink: 0 }}
            />
            <div style={{ width: 26, height: 26, borderRadius: 8, background: checked ? 'rgba(22,163,74,0.14)' : color, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {checked
                ? <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={'#34d27b'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5,6.5 5,10 10.5,2"/></svg>
                : <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{insight.rank ?? index + 1}</span>
              }
            </div>
          </div>

          {/* Category label above problem */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {insight.category && (
              <p style={{ fontSize: 10, fontWeight: 600, color: checked ? SHELL.text3 : color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>{insight.category}</p>
            )}
            <p style={{ fontSize: 14, fontWeight: 600, color: checked ? SHELL.text3 : SHELL.text1, lineHeight: 1.55, textDecoration: checked ? 'line-through' : 'none' }}>{insight.problem}</p>
          </div>

          {/* Severity badge + delete */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color, padding: '3px 9px', borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase', border: `1.5px solid ${color}` }}>
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
        {!checked && <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 14, marginLeft: 46 }} />}

        {/* ── Body — hidden when done ── */}
        {!checked && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 8, marginLeft: 46 }}>

            {/* Why now */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: SHELL.text2, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Why now</p>
              <p style={{ fontSize: 13.5, color: SHELL.text1, lineHeight: 1.72 }}>{insight.whyNow || insight.cause}</p>
            </div>

            {/* Action */}
            <div style={{
              background: SHELL.cardFlat,
              border: `1px solid ${'rgba(255,255,255,0.08)'}`,
              borderLeft: `3px solid ${color}`,
              borderRadius: '0 10px 10px 0',
              padding: '12px 16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              display: 'flex', flexDirection: 'column',
            }}>
              <p style={{ fontSize: 10, fontWeight: 600, color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Action</p>
              <p style={{ fontSize: 13.5, color: SHELL.text1, lineHeight: 1.72 }}>{insight.action}</p>
            </div>

            {/* Expected outcome */}
            {insight.expectedOutcome
              ? <div style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.14)', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: '#34d27b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Expected outcome</p>
                  <p style={{ fontSize: 13.5, color: SHELL.text1, lineHeight: 1.72 }}>{insight.expectedOutcome}</p>
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
        background: active ? SHELL.activeBg : 'transparent',
        color: active ? SHELL.text1 : SHELL.text2,
        fontWeight: active ? 600 : 500,
        fontSize: 14,
        letterSpacing: '-0.01em',
        border: 'none',
        padding: `9px ${NAV_PAD_X}px`,
        borderRadius: 10,
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
        display: 'flex', alignItems: 'center', gap: 12,
        transition: 'background 0.14s ease, color 0.14s ease',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = SHELL.hoverBg; e.currentTarget.style.color = SHELL.text1 } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SHELL.text2 } }}
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
        color: active ? C.red : SHELL.iconIdle,
      }}>{NAV_ICONS[label]}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {typeof badge === 'string' && badge && (
        <span style={{
          background: 'rgba(229,37,27,0.10)', color: '#fb6a60',
          fontSize: 9.5, fontWeight: 700, padding: '2px 7px',
          borderRadius: 20, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>{badge}</span>
      )}
      {typeof badge === 'number' && badge > 0 && (
        <span style={{
          background: C.red, color: '#fff',
          fontSize: 10.5, fontWeight: 700, padding: '1px 7px',
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
        color: active ? SHELL.text1 : SHELL.text2,
        fontWeight: active ? 600 : 450,
        fontSize: 13.5,
        letterSpacing: '-0.01em',
        border: 'none',
        padding: '7px 10px 7px 12px',
        borderRadius: 8,
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
        display: 'flex', alignItems: 'center', gap: 10,
        transition: 'background 0.14s ease, color 0.14s ease',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = SHELL.hoverBg; e.currentTarget.style.color = SHELL.text1 } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SHELL.text2 } }}
    >
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: active ? C.red : SHELL.iconIdle,
        flexShrink: 0,
        boxShadow: active ? `0 0 0 3px rgba(229,37,27,0.10)` : 'none',
        transition: 'background 0.14s ease, box-shadow 0.14s ease',
      }}/>
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
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
          color: anyChildActive ? SHELL.text1 : SHELL.text2,
          fontWeight: anyChildActive ? 600 : 500,
          fontSize: 14,
          letterSpacing: '-0.01em',
          border: 'none',
          padding: `9px ${NAV_PAD_X}px`,
          borderRadius: 10,
          textAlign: 'left',
          cursor: 'pointer',
          fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
          display: 'flex', alignItems: 'center', gap: 12,
          transition: 'background 0.14s ease, color 0.14s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = SHELL.hoverBg; e.currentTarget.style.color = SHELL.text1 }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = anyChildActive ? SHELL.text1 : SHELL.text2 }}
      >
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: NAV_ICON_COL, height: NAV_ICON_COL, flexShrink: 0,
          color: anyChildActive ? C.red : SHELL.iconIdle,
        }}>{NAV_ICONS[label]}</span>
        <span style={{ flex: 1 }}>{label}</span>
        {typeof badge === 'number' && badge > 0 && (
          <span style={{
            background: C.red, color: '#fff',
            fontSize: 10.5, fontWeight: 700, padding: '1px 7px',
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
            color: SHELL.iconIdle,
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
            width: 1, background: SHELL.hair,
          }}/>
          {children}
        </div>
      )}
    </>
  )
}

/* ─── Chat nav. Mirrors the verb-group grammar (same gutters, type,
       hover, active red) but: clicking the row opens a NEW chat and
       navigates to the Chat page; the caret alone toggles the list;
       children are real conversations only, each with the message
       icon. The dedicated "New chat" action lives on the Chat page. */
function ChatNav({ nav, recent, activeId, onNew, onOpen }) {
  const active = nav === 'Chat'
  const storageKey = 'ytg_nav_group_open:Chat'
  const [open, setOpen] = useState(() => {
    try { const raw = localStorage.getItem(storageKey); if (raw === '0') return false; if (raw === '1') return true } catch {}
    return false
  })
  useEffect(() => { if (active && !open) setOpen(true) }, [active])  // eslint-disable-line react-hooks/exhaustive-deps
  function toggle(e) {
    e.stopPropagation()
    setOpen(o => { const n = !o; try { localStorage.setItem(storageKey, n ? '1' : '0') } catch {} ; return n })
  }
  return (
    <>
      <div
        style={{
          position: 'relative',
          margin: `1px ${NAV_GUTTER}px`,
          width: `calc(100% - ${NAV_GUTTER * 2}px)`,
          display: 'flex', alignItems: 'center',
          borderRadius: 10,
          background: active ? SHELL.activeBg : 'transparent',
          transition: 'background 0.14s ease',
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = SHELL.hoverBg }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
      >
        {active && (
          <span aria-hidden style={{ position: 'absolute', left: -NAV_GUTTER, top: 8, bottom: 8, width: 3, borderRadius: 100, background: C.red }}/>
        )}
        <button
          onClick={onNew}
          title="New chat"
          style={{
            flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12,
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: `9px 4px 9px ${NAV_PAD_X}px`,
            color: active ? SHELL.text1 : SHELL.text2,
            fontWeight: active ? 600 : 500, fontSize: 14, letterSpacing: '-0.01em',
            fontFamily: "'Geist', 'Inter', system-ui, sans-serif", textAlign: 'left',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: NAV_ICON_COL, height: NAV_ICON_COL, flexShrink: 0, color: active ? C.red : SHELL.iconIdle }}>{NAV_ICONS['Chat']}</span>
          <span style={{ flex: 1 }}>Chat</span>
        </button>
        <button
          onClick={toggle}
          aria-label={open ? 'Collapse chats' : 'Expand chats'}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: `9px ${NAV_PAD_X}px 9px 6px`, color: SHELL.iconIdle,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>
      {open && (
        <div style={{ position: 'relative', paddingTop: 2, paddingBottom: 4 }}>
          <span aria-hidden style={{ position: 'absolute', left: NAV_GUTTER + NAV_PAD_X + (NAV_ICON_COL / 2), top: 4, bottom: 6, width: 1, background: SHELL.hair }}/>
          {recent.length === 0 ? (
            <p style={{ margin: `2px ${NAV_GUTTER}px 4px ${NAV_GUTTER + SUB_INDENT}px`, padding: '6px 10px', fontSize: 12.5, color: SHELL.text3, fontFamily: "'Geist', 'Inter', system-ui, sans-serif" }}>No chats yet</p>
          ) : recent.map(c => {
            const on = nav === 'Chat' && c.id === activeId
            return (
              <button
                key={c.id}
                onClick={() => onOpen(c.id)}
                style={{
                  position: 'relative',
                  margin: `1px ${NAV_GUTTER}px 1px ${NAV_GUTTER + SUB_INDENT}px`,
                  width: `calc(100% - ${NAV_GUTTER * 2 + SUB_INDENT}px)`,
                  background: on ? SHELL.activeBg : 'transparent',
                  color: on ? SHELL.text1 : SHELL.text2,
                  fontWeight: on ? 600 : 450, fontSize: 13.5, letterSpacing: '-0.01em',
                  border: 'none', padding: '7px 10px', borderRadius: 8,
                  textAlign: 'left', cursor: 'pointer',
                  fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
                  display: 'flex', alignItems: 'center', gap: 9,
                  transition: 'background 0.14s ease, color 0.14s ease',
                }}
                onMouseEnter={e => { if (!on) { e.currentTarget.style.background = SHELL.hoverBg; e.currentTarget.style.color = SHELL.text1 } }}
                onMouseLeave={e => { if (!on) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SHELL.text2 } }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, flexShrink: 0, color: on ? C.red : SHELL.iconIdle }}>
                  <MessageCircle size={14} strokeWidth={1.9} />
                </span>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title || 'Untitled chat'}</span>
              </button>
            )
          })}
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
      background: SHELL.cardBg,
      border: `1px solid ${SHELL.hair}`,
      borderRadius: 11,
      padding: '13px 14px 14px 14px',
      boxShadow: SHELL.cardShadow,
      fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
    }}>
      {/* Dismiss × */}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          position: 'absolute', top: 8, right: 8,
          width: 22, height: 22, borderRadius: 6,
          border: 'none', background: 'transparent',
          color: SHELL.text3,
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.14s ease, color 0.14s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = SHELL.hoverBg; e.currentTarget.style.color = SHELL.text1 }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SHELL.text3 }}
      >
        <XIcon size={12} strokeWidth={2} />
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
        {/* Sparkle icon in a brand-tinted circle */}
        <span style={{
          flexShrink: 0,
          width: 28, height: 28, borderRadius: 8,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(229,37,27,0.08)',
          color: '#fb6a60',
          marginTop: 1,
        }}>
          <Sparkles size={15} strokeWidth={2} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            fontSize: 9.5, fontWeight: 600, color: '#fb6a60',
            letterSpacing: '0.11em', textTransform: 'uppercase',
            marginBottom: 5,
          }}>
            What's new
          </p>
          <p style={{
            fontSize: 13.5, fontWeight: 600, color: SHELL.text1,
            letterSpacing: '-0.012em', lineHeight: 1.35,
            paddingRight: 22,  // clear the dismiss x
            marginBottom: 5,
          }}>
            {feature.headline}
          </p>
          <p style={{
            fontSize: 12.5, fontWeight: 450, color: SHELL.text2,
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
              color: '#fb6a60',
              fontSize: 13, fontWeight: 600,
              letterSpacing: '-0.01em',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ff5a4f' }}
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
          ? <img src={current.channel_thumbnail} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `1.5px solid ${SHELL.hair}` }} />
          : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(229,37,27,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#e5251b', flexShrink: 0 }}>{(current.channel_name || '?')[0].toUpperCase()}</div>
        }
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: SHELL.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.2px' }}>{current.channel_name}</p>
          <p style={{ fontSize: 12, color: SHELL.text2, marginTop: 2 }}>{fmtSubs(current.subscribers)} subscribers</p>
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={SHELL.iconIdle} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="2,4 6,8 10,4" />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          background: SHELL.cardBg,
          border: `0.5px solid ${SHELL.hair}`,
          borderRadius: 12,
          boxShadow: SHELL.popShadow,
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
              onMouseEnter={e => { if (!ch.is_current) e.currentTarget.style.background = SHELL.hoverBg }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {ch.channel_thumbnail
                ? <img src={ch.channel_thumbnail} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(229,37,27,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#e5251b', flexShrink: 0 }}>{(ch.channel_name || '?')[0].toUpperCase()}</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: SHELL.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.channel_name}</p>
                <p style={{ fontSize: 12, color: SHELL.text2 }}>{fmtSubs(ch.subscribers)} subscribers</p>
              </div>
              {ch.is_current
                ? <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
                : ch.channel_score > 0
                  ? <span style={{ fontSize: 12, fontWeight: 500, color: scoreColor(ch.channel_score), background: SHELL.hoverBg, border: `0.5px solid ${SHELL.hair}`, borderRadius: 20, padding: '2px 7px', flexShrink: 0 }}>{ch.channel_score}</span>
                  : null
              }
            </div>
          ))}

          <div style={{ height: '0.5px', background: SHELL.hair, margin: '4px 4px' }} />

          {canAddMore
            ? <div
                onClick={() => { setOpen(false); window.location.href = loginUrl() }}
                style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = SHELL.hoverBg }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 14, color: '#fb6a60', fontWeight: 500 }}>+ Connect another channel</span>
              </div>
            : <div
                onClick={() => { setOpen(false); window.location.href = '/#pricing' }}
                style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = SHELL.hoverBg }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 14, color: SHELL.text2 }}>Upgrade to connect more channels</span>
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
      background: SHELL.cardFlat,
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
            <span style={{ fontSize: 12, fontWeight: 600, color: SHELL.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your audit is ready</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, lineHeight: 1 }}>
            <span style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-2px', lineHeight: 1, color: scoreColor(score), fontVariantNumeric: 'tabular-nums' }}>{score}</span>
            <span style={{ fontSize: 16, color: SHELL.text3, fontWeight: 400, paddingBottom: 8 }}>/100</span>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: scoreColor(score), marginTop: 4 }}>{scoreLabel(score)}</p>
          {data.insights.channelSummary && (
            <p style={{
              fontSize: 12, color: SHELL.text2, lineHeight: 1.7, marginTop: 10,
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>{data.insights.channelSummary}</p>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: 'rgba(0,0,0,0.07)', alignSelf: 'stretch', flexShrink: 0 }}/>

        {/* CENTER — top priority */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: SHELL.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Your #1 priority right now</p>
          {top && s ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 3 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: SHELL.text1, lineHeight: 1.4, flex: 1 }}>{top.problem}</p>
                <span style={{ background: s.bg, color: s.color, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.07em', border: `1px solid ${s.bdr}` }}>{top.impact}</span>
              </div>
              {top.category && <p style={{ fontSize: 12, color: SHELL.text3, marginTop: 3, marginBottom: 10 }}>{top.category}</p>}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)`, borderLeft: `3px solid ${s.color}`, borderRadius: '0 10px 10px 0', padding: '12px 15px' }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: s.color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Action</p>
                <p style={{ fontSize: 13.5, color: SHELL.text1, lineHeight: 1.72 }}>{top.action}</p>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 14, color: SHELL.text3 }}>No priority actions found.</p>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: 'rgba(0,0,0,0.07)', alignSelf: 'stretch', flexShrink: 0 }}/>

        {/* RIGHT — CTA */}
        <div style={{ flex: '0 0 auto', width: 190, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: SHELL.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Start here</p>
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
  const [, setObVer] = useState(0)  // bump to re-derive onboarding flags from localStorage
  const [billingPlan, setBillingPlan] = useState(null)
  const [isAdmin,     setIsAdmin]     = useState(false)
  // Sidebar live signals. Drive the nav badges so the sidebar reads as a
  // status surface, not just a list of links.
  const [freshOutlier, setFreshOutlier] = useState(false)
  // Chat history, surfaced in the sidebar (Chat group). Dashboard seeds
  // the list once from /chat/state (chat DB only, no YouTube quota);
  // ChatCoach reports back via onChatState so the sidebar stays the
  // single source of truth as chats are created / switched / deleted.
  const [chatConvos, setChatConvos]   = useState([])
  const [chatActiveId, setChatActiveId] = useState(null)
  const [chatMode, setChatMode]       = useState(null)   // 'open' | 'new' | null
  const [chatTargetId, setChatTargetId] = useState(null)
  const [chatNonce, setChatNonce]     = useState(0)       // bump to dispatch a command
  useEffect(() => {
    let cancelled = false
    fetch('/chat/state', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(d => { if (!cancelled) { setChatConvos(d.conversations || []); setChatActiveId(d.conversation_id ?? null) } })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])
  const openChatConversation = (id) => { setChatMode('open'); setChatTargetId(id); setChatNonce(n => n + 1); setNav('Chat') }
  const startNewChat = () => { setChatMode('new'); setChatTargetId(null); setChatNonce(n => n + 1); setNav('Chat') }
  const onChatState = ({ conversations, activeConversationId }) => {
    setChatConvos(conversations || [])
    setChatActiveId(activeConversationId ?? null)
  }
  const recentChats = [...chatConvos]
    .sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0))
    .slice(0, 7)
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
  const [suggestedCompetitors, setSuggestedCompetitors] = useState(null)
  const [titleSuggestion, setTitleSuggestion] = useState(null)
  const [titleApplyingIdx, setTitleApplyingIdx] = useState(null)
  const [titleAppliedIdx, setTitleAppliedIdx] = useState(null)
  const [titleApplyError, setTitleApplyError] = useState('')
  const [relatedTraffic, setRelatedTraffic] = useState(null)
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

  // Onboarding step signals: mark "optimized a video" / "found an idea"
  // when the user actually visits those surfaces (by any path), so the
  // getting-started flow checks them off. Bump obVer to re-derive.
  useEffect(() => {
    const cid = data?.channel?.channel_id
    if (!cid) return
    let changed = false
    if (nav === 'Competitors' && localStorage.getItem(`ytg_ob_comp_${cid}`) !== '1') {
      try { localStorage.setItem(`ytg_ob_comp_${cid}`, '1'); changed = true } catch {}
    }
    if (nav === 'SEO Studio' && localStorage.getItem(`ytg_ob_seo_${cid}`) !== '1') {
      try { localStorage.setItem(`ytg_ob_seo_${cid}`, '1'); changed = true } catch {}
    }
    if ((nav === 'Video Ideas' || nav === 'Outliers') && localStorage.getItem(`ytg_ob_idea_${cid}`) !== '1') {
      try { localStorage.setItem(`ytg_ob_idea_${cid}`, '1'); changed = true } catch {}
    }
    if (changed) setObVer(v => v + 1)
  }, [nav, data])

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
        // Mark genuinely new users (no audit yet) as in onboarding. Only
        // they ever see the getting-started flow; established users never
        // get the flag, so the flow never spams them.
        if ((d.insights === null || d.insights === undefined) && d.channel?.channel_id) {
          try { localStorage.setItem(`ytg_ob_started_${d.channel.channel_id}`, '1') } catch {}
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

    // Load Suggested Competitors (auto-curated from cross-user caches, zero
    // new YouTube quota). Card hides itself when fewer than ~3 suggestions
    // come back, so a low-signal response just means a quiet Feed.
    fetch('/dashboard/suggested-competitors', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && d.ok && d.suggestions?.length) setSuggestedCompetitors(d) })
      .catch(() => {})

    // Load Title Suggestion: backend walks the user's videos most-recent
    // first and returns the first one that already has a SeoAnalysisCache
    // row. The suggestions are copied verbatim from that cached SEO Studio
    // analysis, so the Feed reuses Studio's output (no new Claude / quota).
    fetch('/dashboard/title-suggestion', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && d.ok && d.video && d.suggestions?.length) setTitleSuggestion(d) })
      .catch(() => {})

    // Load Related Traffic: YouTube Analytics detail of which OTHER
    // videos are sending us suggested-video traffic. We ALWAYS store the
    // response (even when ok=false with a reason) so the card can render
    // an explainer state instead of silently disappearing.
    fetch('/dashboard/related-traffic', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setRelatedTraffic(d) })
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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Geist', 'Inter', system-ui, sans-serif", background: C.bg }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════ */}
      <aside style={{
        width: 320, flexShrink: 0,
        background: SHELL.bg,
        borderRight: `1px solid ${SHELL.hair}`,
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        zIndex: 10,
      }}>

        {/* Brand */}
        <a href="/" style={{ padding: '22px 22px 18px', display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0, borderBottom: `1px solid ${SHELL.hair}` }}>
          <Logo size={26} />
          <span style={{
            fontSize: 18, fontWeight: 700, letterSpacing: '-0.65px', lineHeight: 1,
            background: 'linear-gradient(180deg, #ffffff 0%, #c9c9d2 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', color: 'transparent',
          }}>YTGrowth</span>
          {(() => { const pb = planBadge(billingPlan); return (
            <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 600, color: pb.color, background: pb.bg, border: `1px solid ${pb.bdr}`, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.07em', textTransform: 'uppercase', flexShrink: 0 }}>{pb.label}</span>
          ) })()}
        </a>

        {/* Channel profile block */}
        {data && (
          <div style={{ padding: '16px 22px', flexShrink: 0 }}>
           <div style={{
             background: SHELL.cardBg,
             border: `1px solid ${SHELL.hair}`,
             borderRadius: 12,
             padding: '15px 16px 14px',
             boxShadow: SHELL.cardShadow,
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
                    ? <img src={data.channel.thumbnail} alt="" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: `0 0 0 2px ${SHELL.hair}` }}/>
                    : <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(229,37,27,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: C.red, flexShrink: 0, boxShadow: `0 0 0 2px ${SHELL.hair}` }}>{data.channel.channel_name[0].toUpperCase()}</div>
                  }
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 14.5, fontWeight: 600, color: SHELL.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.25px', lineHeight: 1.2 }}>{data.channel.channel_name}</p>
                    <p style={{ fontSize: 12, color: SHELL.text2, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(data.channel.subscribers)} subs</p>
                  </div>
                </div>
              )
            }
            {/* Health score bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: SHELL.text2, letterSpacing: '0.09em', textTransform: 'uppercase' }}>Channel health</span>
                <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2, fontVariantNumeric: 'tabular-nums' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: scoreColor(score), letterSpacing: '-0.4px', lineHeight: 1 }}>{score}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: SHELL.text3 }}>/100</span>
                </span>
              </div>
              <div style={{ background: SHELL.track, borderRadius: 99, height: 6, overflow: 'hidden' }}>
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

          <ChatNav
            nav={nav}
            recent={recentChats}
            activeId={chatActiveId}
            onNew={startNewChat}
            onOpen={openChatConversation}
          />

          <div style={{ height: 18 }}/>

          {isAdmin && <NavBtn label="Admin" active={nav === 'Admin'} onClick={() => setNav('Admin')} />}
          <NavBtn label="Settings" active={nav === 'Settings'} onClick={() => setNav('Settings')} />

        </nav>

        {/* Sidebar footer — one tight block. Single divider, then a
            What's-new promo card, then UsageBar, then Refer | Sign out. */}
        {data && (
          <div style={{
            padding: '14px 16px 12px',
            borderTop: `1px solid ${SHELL.hair}`,
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
              dark={true}
              onPlan={setBillingPlan}
              onUsage={setUsagePct}
            />
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
              marginTop: 2,
            }}>
              <button
                onClick={() => setNav('Referrals')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 9px', borderRadius: 7,
                  background: nav === 'Referrals' ? SHELL.activeBg : 'transparent',
                  border: 'none', cursor: 'pointer',
                  color: nav === 'Referrals' ? C.red : SHELL.text2,
                  fontSize: 12, fontWeight: 500, letterSpacing: '-0.01em',
                  fontFamily: 'inherit',
                  transition: 'color 0.14s ease, background 0.14s ease',
                }}
                onMouseEnter={e => { if (nav !== 'Referrals') { e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.background = SHELL.hoverBg } }}
                onMouseLeave={e => { if (nav !== 'Referrals') { e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.background = 'transparent' } }}
              >
                <Gift size={13} strokeWidth={1.75} />
                <span>Refer & earn</span>
              </button>
              <a
                href="/auth/logout"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 9px', borderRadius: 7,
                  color: SHELL.text2, fontSize: 12, fontWeight: 500, letterSpacing: '-0.01em',
                  textDecoration: 'none',
                  transition: 'color 0.14s ease, background 0.14s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.background = SHELL.hoverBg }}
                onMouseLeave={e => { e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.background = 'transparent' }}
              >
                <span>Sign out</span>
                <LogOut size={13} strokeWidth={1.75} />
              </a>
            </div>
          </div>
        )}
      </aside>

      {/* ══ MAIN ═════════════════════════════════════════════════════════ */}
      {/* Dark routes: pages already on the dark design system. The main
          column ground + topbar go dark for these so a dark page never
          sits on a light gutter / under a white topbar band. Add a route
          here as it is converted to dark. */}
      {(() => {
      const darkRoute = nav === 'Chat' || nav === 'Competitors' || nav === 'Keywords' || nav === 'Outliers' || nav === 'Weekly Report' || nav === 'Overview' || nav === 'Autopsy' || nav === 'Videos' || nav === 'Video Ideas' || nav === 'Thumbnail Score' || nav === 'SEO Studio' || nav === 'Settings'
      // The dark topbar is #0e0e10. For non-Chat dark pages the page
      // ground is the SAME #0e0e10 so the topbar is seamless (no lighter
      // band), matching how Chat reads. Chat keeps its own tuned ground
      // (#0a0a0c) because ChatCoach paints its own surface on top.
      const darkGround = nav === 'Chat' ? '#0a0a0c' : '#0e0e10'
      return (
      <div className={darkRoute ? 'ytg-dark' : undefined} style={{ flex: 1, overflow: 'auto', background: darkRoute ? darkGround : C.bg }}>

        {/* Topbar — light everywhere; dark on dark routes, using the
            locked shell shade so it does not sit as a white band over a
            dark page. Other pages are untouched. */}
        {(() => {
          const darkBar = darkRoute
          return (
        <div style={{
          borderBottom: darkBar ? 'none' : `1px solid ${C.border}`,
          background: darkBar ? '#0e0e10' : 'rgba(241,241,246,0.95)',
          backdropFilter: darkBar ? 'none' : 'blur(20px)',
          WebkitBackdropFilter: darkBar ? 'none' : 'blur(20px)',
          padding: '0 32px', height: 52,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: darkBar ? '#f4f4f5' : C.text1, letterSpacing: '-0.3px' }}>{nav}</span>
            {data && <>
              <span style={{ color: darkBar ? 'rgba(255,255,255,0.18)' : C.border, fontSize: 14 }}>·</span>
              <span style={{ fontSize: 13, fontWeight: 400, color: darkBar ? '#b2b3bb' : C.text3, letterSpacing: '-0.1px' }}>{data.channel?.channel_name}</span>
            </>}
          </div>
          <div style={{
            background: darkBar ? 'transparent' : C.surface,
            border: darkBar ? '1px solid rgba(255,255,255,0.08)' : `1px solid ${C.border}`,
            borderRadius: 100, padding: '5px 14px',
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: darkBar ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }}/>
            <span style={{ fontSize: 12, color: darkBar ? '#b2b3bb' : C.text3, fontWeight: 600 }}>Connected</span>
          </div>
        </div>
          )
        })()}

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
              <p style={{ fontSize: 18, fontWeight: 600, color: C.text1, letterSpacing: '-0.4px' }}>No channel data</p>
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
            <div className="ov-page" style={{ maxWidth: 1040, margin: '0 auto' }}>
              {(() => {
                const cid     = data.channel?.channel_id
                const forceOb = new URLSearchParams(window.location.search).get('onboarding') === 'preview'
                const ls      = (k) => { try { return cid && localStorage.getItem(`ytg_ob_${k}_${cid}`) === '1' } catch { return false } }
                const showOnboarding = !ls('dismissed') && (forceOb || ls('started'))

                const runFirstAudit = () => {
                  setReAuditError('')
                  setAnalyzingAI(true)
                  fetch('/auth/refresh-analysis', { method: 'POST', credentials: 'include' })
                    .then(async r => {
                      if (r.ok) { window.dispatchEvent(new CustomEvent('ytg:credits-changed')); return }
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
                }

                if (showOnboarding) {
                  return (
                    <OnboardingCard
                      channelName={data.channel?.channel_name}
                      trackedCompetitor={forceOb ? false : ls('comp')}
                      optimized={forceOb ? false : ls('seo')}
                      exploredIdeas={forceOb ? false : ls('idea')}
                      onNavigate={(t) => setNav(t)}
                      onDismiss={() => {
                        try { if (cid) localStorage.setItem(`ytg_ob_dismissed_${cid}`, '1') } catch {}
                        setObVer(v => v + 1)
                      }}
                    />
                  )
                }
                if (!analyzingAI && !data.insights) {
                  return (
                    <div className="ytg-card" style={{ padding: '28px 32px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: SHELL.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Start here</p>
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.5px', marginBottom: 6 }}>Run your first audit</h2>
                        <p style={{ fontSize: 13.5, color: SHELL.text2, lineHeight: 1.55, maxWidth: 520 }}>
                          We need to analyse your channel before we can show Priority Actions, growth patterns, and milestone tracking. Costs 1 credit and takes about 30 seconds.
                        </p>
                      </div>
                      <button className="ytg-dash-btn-primary" disabled={analyzingAI} onClick={runFirstAudit} style={{ flexShrink: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <path d="M11.5 2A6 6 0 1 0 12 6.5"/><path d="M11.5 2v3h-3"/>
                        </svg>
                        <span>Run audit</span><span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginLeft: 2 }}>· 1 credit</span>
                      </button>
                    </div>
                  )
                }
                return null
              })()}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 600, color: SHELL.text1, letterSpacing: '-0.7px', marginBottom: 6, lineHeight: 1.1 }}>
                    Good to see you{data.channel.channel_name ? <>, <span style={{ color: SHELL.text1, fontWeight: 600 }}>{data.channel.channel_name}</span></> : ''}.</h1>
                  <p style={{ fontSize: 13.5, color: SHELL.text2, fontWeight: 500, display: 'flex', gap: 0, flexWrap: 'wrap', letterSpacing: '-0.05px' }}>
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
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#f0a23b' }}>Audit may be outdated</span>
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
                      : statsFlash === 'ok'  ? <span style={{ color: '#34d27b' }}>Updated ✓</span>
                      : statsFlash === 'err' ? <span style={{ color: '#fb6a60' }}>Failed ✕</span>
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
                  fontSize: 13, color: '#fb6a60',
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

              {/* ── HERO STRIP — 4 inline tiles separated by hairlines, no
                    per-tile card border. One unified surface that reads as
                    a scoreboard. Replaces the 2 fat HeroStatCards. ───── */}
              {(() => {
                const subs = data.channel.subscribers || 0
                const tv   = data.channel.total_views || 0
                const subTarget = nextSubMilestone(subs)
                const viewTarget = nextViewMilestone(tv)
                const subPct  = subTarget > 0 ? Math.max(2, Math.min(100, (subs / subTarget) * 100)) : 0
                const viewPct = viewTarget > 0 ? Math.max(2, Math.min(100, (tv / viewTarget) * 100)) : 0
                const subDelta  = data.analytics?.net_subscribers_90d
                const viewDelta = data.analytics?.views_90d
                const subsSeries = data.analytics?.subs_series_28d
                const channelScore = data.insights?.channelScore
                const haveScore = typeof channelScore === 'number'
                const scoreColor = !haveScore ? SHELL.text3
                  : channelScore >= 70 ? '#059669'
                  : channelScore >= 50 ? SHELL.text1
                  : '#dc2626'
                const scoreLabel = !haveScore ? 'Awaiting audit'
                  : channelScore >= 70 ? 'Strong'
                  : channelScore >= 50 ? 'Steady'
                  : 'Needs work'

                const eyebrow = {
                  fontSize: 11, fontWeight: 600, color: SHELL.text3,
                  letterSpacing: '0.10em', textTransform: 'uppercase', margin: 0,
                }
                const bigNum = {
                  fontSize: 30, fontWeight: 600, color: SHELL.text1,
                  letterSpacing: '-1.0px', lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }
                const subMeta = {
                  fontSize: 11.5, fontWeight: 500, color: SHELL.text2,
                  letterSpacing: '-0.05px', fontVariantNumeric: 'tabular-nums',
                  margin: 0,
                }
                const renderDeltaChip = (d) => {
                  if (d === null || d === undefined || Number.isNaN(Number(d))) return null
                  const n = Number(d)
                  const pos = n >= 0
                  const color = pos ? '#059669' : '#dc2626'
                  const bg    = pos ? 'rgba(22,163,74,0.14)' : 'rgba(229,37,27,0.07)'
                  const bdr   = pos ? 'rgba(22,163,74,0.34)' : 'rgba(229,37,27,0.20)'
                  return (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      fontSize: 10.5, fontWeight: 600, color,
                      background: bg, border: `1px solid ${bdr}`,
                      padding: '1px 7px', borderRadius: 100,
                      letterSpacing: '-0.05px', fontVariantNumeric: 'tabular-nums',
                    }}>
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ transform: pos ? 'none' : 'rotate(180deg)' }}>
                        <path d="M5 8V2M2.5 4.5 5 2l2.5 2.5"/>
                      </svg>
                      {pos ? '+' : ''}{fmtNum(Math.abs(n))}
                    </span>
                  )
                }
                const renderMilestoneBar = (pct) => (
                  <div style={{
                    height: 3, background: 'rgba(255,255,255,0.10)', borderRadius: 99, overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: 'linear-gradient(90deg, rgba(229,37,27,0.55) 0%, #e5251b 100%)',
                      borderRadius: 99,
                      transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
                    }}/>
                  </div>
                )

                return (
                  <div className="ov-hero-strip">

                    {/* Tile 1: Subscribers + 90d delta + milestone bar */}
                    <div className="ov-hero-tile">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <p style={eyebrow}>Subscribers</p>
                        {renderDeltaChip(subDelta)}
                      </div>
                      <p style={bigNum}>{fmtNum(subs)}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 'auto' }}>
                        {renderMilestoneBar(subPct)}
                        <p style={subMeta}>Next <span style={{ color: SHELL.text1, fontWeight: 600 }}>{fmtNum(subTarget)}</span></p>
                      </div>
                    </div>

                    {/* Tile 2: Total views + 90d delta + milestone bar */}
                    <div className="ov-hero-tile">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <p style={eyebrow}>Total views</p>
                        {renderDeltaChip(viewDelta)}
                      </div>
                      <p style={bigNum}>{fmtNum(tv)}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 'auto' }}>
                        {renderMilestoneBar(viewPct)}
                        <p style={subMeta}>Next <span style={{ color: SHELL.text1, fontWeight: 600 }}>{fmtNum(viewTarget)}</span></p>
                      </div>
                    </div>

                    {/* Tile 3: 28-day momentum (real sparkline or analytics nudge) */}
                    <div className="ov-hero-tile">
                      <p style={eyebrow}>28-day momentum</p>
                      {subsSeries && subsSeries.length >= 2 ? (
                        <>
                          <div style={{ marginTop: -2 }}>
                            <Sparkline data={subsSeries} width={200} height={54} />
                          </div>
                          <p style={{ ...subMeta, marginTop: 'auto' }}>
                            Daily subscriber net since {new Date(Date.now() - 27 * 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </>
                      ) : (
                        <>
                          <p style={{ fontSize: 13, fontWeight: 500, color: SHELL.text2, lineHeight: 1.4, margin: 0 }}>
                            Connect YouTube Analytics on your next reconnect to unlock the 28-day trend line.
                          </p>
                          <p style={{ ...subMeta, marginTop: 'auto', color: SHELL.text3 }}>Not connected</p>
                        </>
                      )}
                    </div>

                    {/* Tile 4: Channel health score */}
                    <div className="ov-hero-tile">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <p style={eyebrow}>Channel health</p>
                        {haveScore && (
                          <span style={{
                            fontSize: 10.5, fontWeight: 600, color: scoreColor,
                            background: channelScore >= 70 ? 'rgba(22,163,74,0.14)'
                                      : channelScore >= 50 ? 'rgba(255,255,255,0.06)'
                                      : 'rgba(229,37,27,0.07)',
                            border: `1px solid ${channelScore >= 70 ? 'rgba(22,163,74,0.34)' : channelScore >= 50 ? 'rgba(255,255,255,0.12)' : 'rgba(229,37,27,0.20)'}`,
                            padding: '1px 8px', borderRadius: 100, letterSpacing: '-0.05px',
                          }}>{scoreLabel}</span>
                        )}
                      </div>
                      <p style={{ ...bigNum, color: scoreColor }}>{haveScore ? channelScore : '—'}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 'auto' }}>
                        <div style={{ height: 3, background: 'rgba(255,255,255,0.10)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{
                            width: haveScore ? `${channelScore}%` : '0%', height: '100%',
                            background: scoreColor, borderRadius: 99,
                            transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
                          }}/>
                        </div>
                        <p style={subMeta}>{haveScore ? <>Out of <span style={{ color: SHELL.text1, fontWeight: 600 }}>100</span></> : 'Run an audit'}</p>
                      </div>
                    </div>

                  </div>
                )
              })()}

              {/* Analytics-missing nudge — moved here from the quick-stats
                  strip (the strip is gone in the Feed redesign). */}
              {!data.analytics && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(217,119,6,0.14)', border: `1px solid rgba(217,119,6,0.34)`, borderLeft: `3px solid ${'#f0a23b'}`, borderRadius: '0 12px 12px 0', padding: '10px 16px', marginBottom: 18 }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={'#f0a23b'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="8" cy="8" r="6.5"/><line x1="8" y1="5" x2="8" y2="8.5"/><circle cx="8" cy="11" r="0.7" fill={'#f0a23b'} stroke="none"/>
                  </svg>
                  <p style={{ fontSize: 12.5, color: SHELL.text2, lineHeight: 1.55 }}>
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
                  Restructured into 5 themed sections under H2 headers
                  ("What to do next", "Recent wins", "Your niche", "How
                  you publish", "Channel health"). Each card is rendered
                  inside the section that matches its purpose, instead of
                  one long mixed stream. Filter-pill behaviour is
                  preserved per card. */}

              {/* All the per-card render blocks are computed up-front into
                  variables so the JSX layout below can place them under
                  themed H2 sections without losing any conditional logic,
                  filter behaviour, or dismiss handlers. A `null` block
                  means that card has no data / was dismissed / is filtered
                  out — the section header only renders when at least one
                  block in the group will render. */}
              {(() => {
                // ── WHAT TO DO NEXT blocks ──
                // The 3 stacked PriorityActionCards (each rendering the full
                // AI `problem` diagnosis as a bold paragraph headline) are
                // replaced with ONE compact rail card holding 3 short rows.
                // Each row shows just the action verb (action.action, ~1
                // sentence) - the long analytical problem text is now only
                // visible when the row is expanded.
                const priorityActionsBlock = (feedFilter === 'all' || feedFilter === 'actions') && data.insights?.priorityActions ? (() => {
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
                  return (
                    <ActionsRailCard
                      key="actions-rail"
                      items={open.map(({ a, rank, k, idx }) => {
                        const impact = (a.impact || (idx === 0 ? 'high' : idx === 1 ? 'med' : 'low'))
                        const target = categoryToNav(a.category, a.problem)
                        const ctaLabel = target === 'SEO Studio' ? 'SEO Studio'
                          : target === 'Thumbnail Score' ? 'Thumbnails'
                          : target === 'Video Ideas' ? 'Video Ideas'
                          : target === 'Outliers' ? 'Outliers'
                          : target === 'Keywords' ? 'Keywords'
                          : target === 'Competitors' ? 'Competitors'
                          : 'Audit'
                        return {
                          rank, key: k, action: a, impact, ctaLabel,
                          onAct: () => target ? setNav(target) : setAuditOpen(true),
                          onDone: () => {
                            const next = { ...checked, [k]: true }
                            setChecked(next)
                            if (data?.channel?.channel_id) {
                              try { localStorage.setItem(`ytg_checked_${data.channel.channel_id}`, JSON.stringify(next)) } catch {}
                            }
                          },
                          onDismiss: () => {
                            const next = { ...deleted, [k]: true }
                            setDeleted(next)
                            if (data?.channel?.channel_id) {
                              try { localStorage.setItem(`ytg_deleted_${data.channel.channel_id}`, JSON.stringify(next)) } catch {}
                            }
                          },
                        }
                      })}
                      totalCount={all.length}
                    />
                  )
                })() : null

                const dailyIdeasBlock = (feedFilter === 'all' || feedFilter === 'actions') && dailyIdeas?.ideas?.length > 0 ? (() => {
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
                })() : null

                // ── RECENT WINS blocks ──
                const milestoneBlock = (feedFilter === 'all' || feedFilter === 'achievements') && milestones?.earned?.[0] ? (() => {
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
                        setChecked(prev => ({ ...prev }))
                      }}
                    />
                  )
                })() : null

                const topPerformerBlock = (feedFilter === 'all' || feedFilter === 'achievements') && patterns?.bestVideo ? (() => {
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
                })() : null

                const trackedLiftBlock = (feedFilter === 'all' || feedFilter === 'achievements') && trackedLift && trackedLift.top ? (() => {
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
                })() : null

                // ── YOUR NICHE blocks ──
                const nicheHeroBlock = (feedFilter === 'all' || feedFilter === 'insights') ? (
                  <NicheHeroCard
                    key="nichehero"
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
                ) : null

                const titleSuggestionBlock = (feedFilter === 'all' || feedFilter === 'insights') && titleSuggestion?.video && titleSuggestion?.suggestions?.length ? (() => {
                  const dismissKey = `ytg_title_suggestion_dismissed_v5:${data?.channel?.channel_id || 'x'}:${titleSuggestion.video.video_id || 'x'}`
                  try { if (localStorage.getItem(dismissKey)) return null } catch {}
                  return (
                    <TitleSuggestionCard
                      key="title-suggestion"
                      video={titleSuggestion.video}
                      suggestions={titleSuggestion.suggestions}
                      ageLabel={titleSuggestion.age_label || ''}
                      applyingIdx={titleApplyingIdx}
                      appliedIdx={titleAppliedIdx}
                      applyError={titleApplyError}
                      onApply={async (s, i, vid) => {
                        if (!s?.title || !vid?.video_id) return
                        setTitleApplyingIdx(i)
                        setTitleApplyError('')
                        try {
                          const res = await fetch('/seo/update-video', {
                            method: 'POST',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ video_id: vid.video_id, title: s.title }),
                          })
                          const d = await res.json().catch(() => ({}))
                          if (!res.ok || d?.error) {
                            setTitleApplyError(d?.error || 'Update failed. Try again.')
                          } else {
                            setTitleAppliedIdx(i)
                          }
                        } catch {
                          setTitleApplyError('Could not reach the server.')
                        } finally {
                          setTitleApplyingIdx(null)
                        }
                      }}
                      onOpenStudio={() => {
                        try {
                          if (titleSuggestion.video?.title) sessionStorage.setItem('seoOptimizer_prefilledTitle', titleSuggestion.video.title)
                        } catch {}
                        setNav('SEO Studio')
                      }}
                      onDismiss={() => {
                        try { localStorage.setItem(dismissKey, '1') } catch {}
                        setChecked(prev => ({ ...prev }))
                      }}
                    />
                  )
                })() : null

                const suggestedCompetitorsBlock = (feedFilter === 'all' || feedFilter === 'insights') && suggestedCompetitors?.suggestions?.length >= 1 ? (() => {
                  const dismissKey = `ytg_suggested_competitors_dismissed:${data?.channel?.channel_id || 'x'}`
                  try { if (localStorage.getItem(dismissKey)) return null } catch {}
                  return (
                    <SuggestedCompetitorsCard
                      key="suggested-competitors"
                      suggestions={suggestedCompetitors.suggestions}
                      category={suggestedCompetitors.category}
                      onTrack={(c) => {
                        // Stash the channel name and land the user on the
                        // Competitors page's Search tab with that query
                        // pre-run. They hit the actual Track (analyze)
                        // button there — keeps the credit-spend explicit.
                        try {
                          const q = c.channel_name || c.handle || ''
                          if (q) sessionStorage.setItem('competitors_prefilledQuery', q)
                        } catch {}
                        setNav('Competitors')
                      }}
                      onOpenAll={() => setNav('Competitors')}
                      onDismiss={() => {
                        try { localStorage.setItem(dismissKey, '1') } catch {}
                        setChecked(prev => ({ ...prev }))
                      }}
                    />
                  )
                })() : null

                const relatedTrafficBlock = (feedFilter === 'all' || feedFilter === 'insights') && relatedTraffic ? (() => {
                  const dismissKey = `ytg_related_traffic_dismissed:${data?.channel?.channel_id || 'x'}`
                  try { if (localStorage.getItem(dismissKey)) return null } catch {}
                  // Relative age from refreshed_at — soft "Nd ago" label.
                  let ageLabel = ''
                  try {
                    if (relatedTraffic.refreshed_at) {
                      const ts = new Date(relatedTraffic.refreshed_at).getTime()
                      const days = Math.max(0, Math.floor((Date.now() - ts) / 86400000))
                      ageLabel = days === 0 ? 'today' : days === 1 ? '1d ago' : `${days}d ago`
                    }
                  } catch {}
                  return (
                    <RelatedTrafficCard
                      key="related-traffic"
                      items={relatedTraffic.items || []}
                      ageLabel={ageLabel}
                      reason={relatedTraffic.reason || ''}
                      rawSourceCount={relatedTraffic.raw_source_count || 0}
                      onOpen={(it) => {
                        if (!it?.video_id) return
                        try { window.open(`https://www.youtube.com/watch?v=${it.video_id}`, '_blank', 'noopener,noreferrer') } catch {}
                      }}
                      onDismiss={() => {
                        try { localStorage.setItem(dismissKey, '1') } catch {}
                        setChecked(prev => ({ ...prev }))
                      }}
                    />
                  )
                })() : null

                const competitorActivityBlock = (feedFilter === 'all' || feedFilter === 'insights') && competitorActivity?.items?.length > 0 ? (() => {
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
                })() : null

                // ── HOW YOU PUBLISH blocks ──
                const postingConsistencyBlock = (feedFilter === 'all' || feedFilter === 'insights') && videos && videos.length > 0 ? (() => {
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
                })() : null

                const bestTimeBlock = (feedFilter === 'all' || feedFilter === 'insights') && videos && videos.length >= 5 ? (() => {
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
                })() : null

                // ── CHANNEL HEALTH block (full row) ──
                const channelHealthBlock = (feedFilter === 'all' || feedFilter === 'insights') && (patterns || data.insights) ? (
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
                ) : null

                const hasWhatToDoNext = priorityActionsBlock || dailyIdeasBlock
                const hasRecentWins = milestoneBlock || topPerformerBlock || trackedLiftBlock
                const hasYourNiche = nicheHeroBlock || titleSuggestionBlock || suggestedCompetitorsBlock || relatedTrafficBlock || competitorActivityBlock
                const hasHowYouPublish = postingConsistencyBlock || bestTimeBlock

                return (
                  <>
                    {hasWhatToDoNext && (
                      <>
                        <div className="ov-section-head">
                          <h2>What to do next</h2>
                        </div>
                        <div className="ov-stack">
                          {priorityActionsBlock}
                          {dailyIdeasBlock}
                        </div>
                      </>
                    )}

                    {hasRecentWins && (
                      <>
                        <div className="ov-section-head">
                          <h2>Recent wins</h2>
                        </div>
                        <div className="ov-stack">
                          {milestoneBlock}
                          {topPerformerBlock}
                          {trackedLiftBlock}
                        </div>
                      </>
                    )}

                    {hasYourNiche && (
                      <>
                        <div className="ov-section-head">
                          <h2>Your niche</h2>
                        </div>
                        <div className="ov-stack">
                          {nicheHeroBlock}
                          {titleSuggestionBlock}
                          {suggestedCompetitorsBlock}
                          {relatedTrafficBlock}
                          {competitorActivityBlock}
                        </div>
                      </>
                    )}

                    {hasHowYouPublish && (
                      <>
                        <div className="ov-section-head">
                          <h2>How you publish</h2>
                          <span className="ov-section-meta">28-day rhythm</span>
                        </div>
                        <div className="ov-stack">
                          {postingConsistencyBlock}
                          {bestTimeBlock}
                        </div>
                      </>
                    )}

                    {channelHealthBlock && (
                      <>
                        <div className="ov-section-head">
                          <h2>Channel health</h2>
                          {data.insights && <span className="ov-section-meta">See full audit ↓</span>}
                        </div>
                        {channelHealthBlock}
                      </>
                    )}
                  </>
                )
              })()}

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
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Milestones</h2>
                  <p style={{ fontSize: 13, color: SHELL.text3 }}>
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
                        background: `linear-gradient(180deg, ${cat.h1}26 0%, #1c1c21 45%, #1c1c21 100%)`,
                        position: 'relative', overflow: 'hidden',
                      }}>
                        {/* Top category banner */}
                        <div style={{
                          alignSelf: 'stretch', textAlign: 'center', marginBottom: 14,
                          fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                          color: cat.h3,
                        }}>{p.Title}</div>

                        {/* Star badge */}
                        <div style={{ opacity: hasEarned ? 1 : 0.38 }}>
                          <StarBadge category={p.key} tier={displayTier} size={124}/>
                        </div>

                        {/* Tier value */}
                        <p style={{
                          fontSize: 38, fontWeight: 700, color: SHELL.text1,
                          letterSpacing: '-1.5px', lineHeight: 1,
                          marginTop: 18, marginBottom: 6,
                          fontVariantNumeric: 'tabular-nums',
                        }}>{hasEarned ? fmtNum(p.latestTier) : '—'}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: SHELL.text3, letterSpacing: '-0.1px' }}>
                          {hasEarned ? p.Title : 'Not yet earned'}
                        </p>

                        {/* Progress toward next */}
                        {p.upcoming && (
                          <div style={{ alignSelf: 'stretch', marginTop: 22 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Next: {fmtNum(p.upcoming.tier)}
                              </span>
                              <span style={{ fontSize: 11.5, fontWeight: 600, color: cat.h3, fontVariantNumeric: 'tabular-nums' }}>
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
                              fontSize: 13.5, fontWeight: 600,
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
                            <span style={{ fontSize: 14, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.3px' }}>
                              YTGrowth<span style={{ color: '#fb6a60' }}>.io</span>
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


          {/* ── AUDIT DETAIL (legacy block) ─────────────────────────────
              Hidden by default. Renders only when the user expands the
              new Channel Health Feed card's "See full audit" collapse.
              The new PriorityActionCards on the Feed read from the same
              checked/deleted state, so ticking either updates both. */}
          {data && nav === 'Overview' && data.insights && auditOpen && (
            <div style={{ maxWidth: 1040, margin: '0 auto' }}>
              <div style={{ marginBottom: 20, marginTop: 44 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Channel audit</h2>
                <p style={{ fontSize: 13, color: SHELL.text3 }}>{data.insights.priorityActions?.length ?? 0} priority actions{data.analyzed_at ? ` · Audited ${parseUTC(data.analyzed_at)?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) ?? ''}` : ''}</p>
              </div>

              {/* Summary + overall score */}
              {data.insights.channelSummary && (
                <div className="ytg-card" style={{ padding: '28px 32px', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
                    {/* Score ring — left */}
                    <div style={{ flexShrink: 0, textAlign: 'center' }}>
                      <ScoreRing score={score} />
                      <p style={{ fontSize: 11, color: SHELL.text3, fontWeight: 500, marginTop: 4, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Overall</p>
                      {prevScore != null && prevScore !== score && (
                        <p style={{ fontSize: 11, fontWeight: 600, color: score > prevScore ? '#34d27b' : C.red, marginTop: 3 }}>
                          {score > prevScore ? '▲' : '▼'} {Math.abs(score - prevScore)} from last audit
                        </p>
                      )}
                    </div>
                    {/* Divider */}
                    <div style={{ width: 1, alignSelf: 'stretch', background: SHELL.hair, flexShrink: 0 }}/>
                    {/* Summary text */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>AI assessment</p>
                      <p style={{ fontSize: 14, color: SHELL.text1, lineHeight: 1.85 }}>{data.insights.channelSummary}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Category scores */}
              {data.insights.categoryScores && (
                <div className="ytg-card" style={{ padding: '24px 32px', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Score breakdown</p>
                    <p style={{ fontSize: 11, color: SHELL.text3 }}>Weighted formula · CTR &amp; retention count most</p>
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
                          <span style={{ fontSize: 11, fontWeight: 500, color: SHELL.text3, flexShrink: 0, width: 36, textAlign: 'right' }}>{weight}</span>
                          <span style={{ fontSize: 13, color: SHELL.text2, fontWeight: 400, flexShrink: 0, width: 148 }}>{label}</span>
                          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ width: `${val ?? 0}%`, height: '100%', background: col, borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}/>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: col, fontVariantNumeric: 'tabular-nums', minWidth: 26, textAlign: 'right' }}>{val ?? '—'}</span>
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
                          <p style={{ fontSize: 20, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.5px' }}>Priority actions</p>
                          <span style={{ fontSize: 10, fontWeight: 600, color: '#34d27b', background: 'rgba(22,163,74,0.14)', padding: '3px 9px', borderRadius: 100, border: `1px solid ${'rgba(22,163,74,0.34)'}`, letterSpacing: '0.08em', textTransform: 'uppercase' }}>All clear</span>
                        </div>
                      </div>
                      <div style={{
                        background: 'rgba(22,163,74,0.14)',
                        border: `1px solid ${'rgba(22,163,74,0.34)'}`,
                        borderLeft: `3px solid ${'#34d27b'}`,
                        borderRadius: '0 12px 12px 0',
                        padding: '14px 18px',
                      }}>
                        <p style={{ fontSize: 13, color: SHELL.text1, fontWeight: 600, marginBottom: 2 }}>You've handled every priority action.</p>
                        <p style={{ fontSize: 12.5, color: SHELL.text3 }}>Re-audit to surface new ones, or come back next month.</p>
                      </div>
                    </div>
                  )
                }

                return (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <p style={{ fontSize: 20, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.5px' }}>Priority actions</p>
                        <span style={{ fontSize: 11, fontWeight: 600, color: SHELL.text3, background: '#f1f1f6', padding: '3px 9px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.08)', fontVariantNumeric: 'tabular-nums' }}>{openActions.length} open</span>
                      </div>
                      {doneCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontVariantNumeric: 'tabular-nums' }}>
                          <div style={{ width: 72, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ width: `${(doneCount / total) * 100}%`, height: '100%', background: '#34d27b', borderRadius: 99, transition: 'width 0.6s ease' }}/>
                          </div>
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: SHELL.text3 }}>
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
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#34d27b', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Quick wins</p>
                        <span style={{ fontSize: 11, fontWeight: 600, color: SHELL.text3, background: '#f1f1f6', padding: '2px 7px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)' }}>{wins.length} left</span>
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
                                style={{ width: 14, height: 14, accentColor: '#34d27b', cursor: 'pointer', flexShrink: 0, marginTop: 3 }}
                              />
                              <p style={{ fontSize: 14, color: isDone ? SHELL.text3 : SHELL.text2, lineHeight: 1.6, flex: 1, textDecoration: isDone ? 'line-through' : 'none' }}>{w}</p>
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
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#fb6a60', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Biggest risk</p>
                      <p style={{ fontSize: 14, color: SHELL.text1, lineHeight: 1.7 }}>{data.insights.biggestRisk}</p>
                    </div>
                  )}
                  {data.insights.topPerformingPattern && (
                    <div style={{ paddingTop: data.insights.biggestRisk ? 16 : 0, borderTop: data.insights.biggestRisk ? `1px solid ${SHELL.hair}` : 'none' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#34d27b', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>What's working</p>
                      <p style={{ fontSize: 14, color: SHELL.text1, lineHeight: 1.7 }}>{data.insights.topPerformingPattern}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── VIDEOS ───────────────────────────────────────────────── */}
          {data && nav === 'Videos' && videos && (
            <div style={{ maxWidth: 1040, margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 600, color: SHELL.text1, letterSpacing: '-0.7px', marginBottom: 6, lineHeight: 1.1 }}>My Videos</h1>
                  <p style={{ fontSize: 14, color: SHELL.text2, fontWeight: 500, letterSpacing: '-0.005em', lineHeight: 1.45 }}>
                    Every video on your channel · {videos.length.toLocaleString()} total · {fmtNum(videos.reduce((s, v) => s + (v.views || 0), 0))} views
                  </p>
                </div>
                {videosTab === 'all' && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                  <div className="ytg-myvid-sort-grp">
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
                          className={`ytg-myvid-sort-btn${active ? ' active' : ''}`}
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
                        fontSize: 13, fontWeight: active ? 600 : 500, padding: '8px 16px',
                        borderRadius: 100,
                        border: active ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                        background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                        color: active ? SHELL.text1 : SHELL.text2,
                        cursor: 'pointer', fontFamily: 'inherit',
                        letterSpacing: '-0.01em',
                        transition: 'background 180ms cubic-bezier(0.32,0.72,0,1), color 180ms cubic-bezier(0.32,0.72,0,1), border-color 180ms cubic-bezier(0.32,0.72,0,1)',
                      }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = SHELL.text1 } }}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SHELL.text2 } }}
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
                    blue:  { bg: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', labelColor: SHELL.text2 },
                    white: { bg: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: '3px solid #34d27b', borderRadius: '0 10px 10px 0', boxShadow: 'none', labelColor: '#34d27b' },
                    green: { bg: 'rgba(22,163,74,0.14)', border: '1px solid rgba(22,163,74,0.34)', labelColor: '#34d27b' },
                  }[tint]
                  // Hide the delta label entirely when nothing has changed (pct is 0 or null).
                  // 0% everywhere is noise — we only show the badge when there's a real move.
                  const showDelta = pctVal != null && pctVal !== 0
                  const col  = showDelta && pctVal > 0 ? '#34d27b' : showDelta && pctVal < 0 ? '#fb6a60' : SHELL.text3
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
                      <p style={{ fontSize: 10.5, fontWeight: 600, color: tintMap.labelColor, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <p style={{ fontSize: 18, fontWeight: 600, color: SHELL.text1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.4px', lineHeight: 1 }}>{fmtNum(current)}</p>
                        {showDelta && <p style={{ fontSize: 12, fontWeight: 600, color: col, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{sign}</p>}
                      </div>
                      <p style={{ fontSize: 11, color: SHELL.text3, marginTop: 4, fontWeight: 500, letterSpacing: '-0.005em' }}>was {fmtNum(before)}</p>
                    </div>
                  )
                }

                return (
                  <div style={{ marginBottom: 28 }}>
                    {/* Subtler secondary eyebrow — lets "My Videos" keep its H1 identity at the top */}
                    <p style={{ fontSize: 11, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 12 }}>
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
                        <div key={`${o.video_id}-${o.optimized_at}`} className="ytg-insight-card" style={{ marginBottom: 12, borderTop: `3px solid ${C.amber}` }}>
                          <div style={{ padding: '18px 22px 20px' }}>

                            {/* Header — thumbnail + eyebrow + title diff + days pill.
                                Dropped the filled amber 26x26 rank-badge tile (was carrying
                                visual weight that the amber top stripe already provides).
                                Cleaner: just the thumbnail + content + pill. */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                              {o.thumbnail_url && (
                                <a href={`https://www.youtube.com/watch?v=${o.video_id}`} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, lineHeight: 0, textDecoration: 'none', alignSelf: 'center' }}>
                                  <img src={o.thumbnail_url} alt="" style={{ width: 100, height: 56, borderRadius: 8, objectFit: 'cover', display: 'block', border: '1px solid rgba(255,255,255,0.08)' }}/>
                                </a>
                              )}

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 11, fontWeight: 600, color: '#34d27b', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Tracked update</p>
                                {titleChanged ? (
                                  <>
                                    <p style={{ fontSize: 12, color: SHELL.text3, fontWeight: 500, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: 'line-through', marginBottom: 4, letterSpacing: '-0.005em' }}>{o.before_title}</p>
                                    <p style={{ fontSize: 14.5, fontWeight: 600, color: SHELL.text1, lineHeight: 1.45, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.15px' }}>{o.after_title}</p>
                                  </>
                                ) : (
                                  <p style={{ fontSize: 14.5, fontWeight: 600, color: SHELL.text1, lineHeight: 1.45, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.15px' }}>{o.after_title || o.before_title}</p>
                                )}
                              </div>

                              <span style={{ fontSize: 11, fontWeight: 600, color: '#34d27b', padding: '3px 11px', borderRadius: 100, letterSpacing: '0.10em', textTransform: 'uppercase', border: `1px solid ${'rgba(22,163,74,0.34)'}`, background: 'rgba(22,163,74,0.14)', flexShrink: 0 }}>
                                {daysLabel}
                              </span>
                            </div>

                            {/* Hairline divider — aligned with the thumbnail edge (100 + 14 gap = 114) */}
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.10)', marginBottom: 14, marginLeft: 114 }}/>

                            {/* 3-col body — Views / Likes (amber bar centre) / Comments. Brand-only palette. */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 8, marginLeft: 114 }}>
                              <DeltaCell label="Views"    before={o.before_views}    current={o.current_views}    pctVal={vPct} tint="blue"/>
                              <DeltaCell label="Likes"    before={o.before_likes}    current={o.current_likes}    pctVal={lPct} tint="white"/>
                              <DeltaCell label="Comments" before={o.before_comments} current={o.current_comments} pctVal={cPct} tint="green"/>
                            </div>

                            {/* Cross-link to Video Review — different lens on the same video. */}
                            <div style={{ marginTop: 14, marginLeft: 114, display: 'flex', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => setNav('Autopsy')}
                                style={{
                                  fontSize: 12, fontWeight: 500, color: SHELL.text3,
                                  background: 'transparent', border: 'none', cursor: 'pointer',
                                  fontFamily: 'inherit', padding: 0, letterSpacing: '-0.005em',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = SHELL.text1 }}
                                onMouseLeave={e => { e.currentTarget.style.color = SHELL.text3 }}
                              >
                                Run video review on this one →
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
                  <p style={{ fontSize: 16, fontWeight: 600, color: SHELL.text1, letterSpacing: '-0.2px', marginBottom: 8 }}>
                    No tracked optimisations yet
                  </p>
                  <p style={{ fontSize: 13.5, color: SHELL.text2, fontWeight: 500, lineHeight: 1.6, maxWidth: 420, margin: '0 auto', letterSpacing: '-0.005em' }}>
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
                        style={{ display: 'block', position: 'relative', textDecoration: 'none', flexShrink: 0, borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
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
                          <span style={{ position: 'absolute', top: 8, left: 8, background: '#111', color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.10em' }}>SHORT</span>
                        )}
                        {durLabel && (
                          <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.82)', color: '#fff', fontSize: 11.5, fontWeight: 600, padding: '3px 7px', borderRadius: 5, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.05px' }}>{durLabel}</span>
                        )}
                      </a>

                      {/* Body */}
                      <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        {/* Title — 14.5/600 (was 16/700, too heavy at this card width) */}
                        <p style={{
                          fontSize: 14.5, fontWeight: 600, color: SHELL.text1, lineHeight: 1.4, marginBottom: 8, letterSpacing: '-0.15px',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 41,
                        }}>{v.title}</p>

                        {/* Meta line — uniform 12/500 muted, no mid-weight spikes */}
                        <p style={{ fontSize: 12, fontWeight: 500, color: SHELL.text3, marginBottom: 14, lineHeight: 1.4, letterSpacing: '-0.005em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {fmtNum(v.views)} views · {fmtNum(v.likes)} likes · {relTimeLong(v.published_at) || '—'}
                        </p>

                        {/* Footer: Watch · Retention · Eng + Optimise */}
                        <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                            {[
                              { label: 'Watch',     display: wtDisplay,                                             color: SHELL.text1,  tip: 'Average watch time per view (mm:ss). Longer is better relative to video length.' },
                              { label: 'Retention', display: retN !== null ? `${retN.toFixed(0)}%` : '—',           color: SHELL.text1,  tip: 'Average % of video watched. 50%+ strong, 30–50% avg, <30% weak.' },
                              { label: 'Eng',       display: lrN !== null ? `${lr}%` : '—',                         color: lrColor,  tip: 'Engagement rate = likes ÷ views. 3%+ strong, 1–3% avg, <1% weak.' },
                            ].map(m => (
                              <div key={m.label} title={m.tip} style={{ cursor: 'help', textAlign: 'left' }}>
                                <p style={{ fontSize: 10.5, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5, lineHeight: 1 }}>{m.label}</p>
                                <p style={{ fontSize: 16, fontWeight: 600, color: m.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.3px', lineHeight: 1 }}>{m.display}</p>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => setSelectedVideoId(v.video_id)}
                            className="ytg-optimise-btn"
                            style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>
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
            </div>
          )}

          {/* ── PATTERNS (legacy block) ─────────────────────────────────
              Hidden by default. The Content Mix insight surfaces as a
              Feed card above; this detailed Shorts vs long-form breakdown
              only renders when the user expands the audit collapse. */}
          {data && nav === 'Overview' && patterns && auditOpen && (
            <div style={{ maxWidth: 1040, margin: '0 auto' }}>
              <div style={{ marginBottom: 20, marginTop: 44 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Content patterns</h2>
                <p style={{ fontSize: 13, color: SHELL.text3 }}>What's working and what isn't</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16, marginBottom: 16 }}>
                {[
                  { label: 'Shorts avg views',    value: fmtNum(patterns.shortAvg), verdict: patterns.shortAvg > patterns.longAvg ? 'Beats long-form' : 'Below long-form', good: patterns.shortAvg > patterns.longAvg },
                  { label: 'Long-form avg views', value: fmtNum(patterns.longAvg),  verdict: patterns.longAvg > patterns.shortAvg ? 'Beats Shorts'     : 'Below Shorts',    good: patterns.longAvg  > patterns.shortAvg },
                  { label: 'Avg engagement rate', value: `${patterns.likeRate}%`,   verdict: patterns.likeRate >= 3 ? 'Healthy' : patterns.likeRate >= 1 ? 'Average' : 'Below average', good: patterns.likeRate >= 3, hint: 'likes ÷ views — 3%+ is strong' },
                ].map(p => (
                  <div key={p.label} className="ytg-card" title={p.hint || undefined} style={{ padding: '20px 22px', cursor: p.hint ? 'help' : 'default' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>{p.label}</p>
                    <p style={{ fontSize: 26, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.8px', marginBottom: 10, fontVariantNumeric: 'tabular-nums' }}>{p.value}</p>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color:   p.good ? '#34d27b'  : '#f0a23b',
                      background: 'transparent',
                      padding: '3px 10px', borderRadius: 20,
                      border: `1.5px solid ${p.good ? 'rgba(22,163,74,0.34)' : 'rgba(217,119,6,0.34)'}`,
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
                    <p style={{ fontSize: 11, fontWeight: 600, color: isGood ? '#34d27b' : C.red, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>{label}</p>
                    {video && (
                      <>
                        <div style={{ display: 'flex', gap: 11, marginBottom: 13, alignItems: 'flex-start' }}>
                          {video.thumbnail && <img src={video.thumbnail} alt="" style={{ width: 68, height: 43, borderRadius: 7, objectFit: 'cover', flexShrink: 0 }}/>}
                          <p style={{ fontSize: 14, fontWeight: 600, color: SHELL.text1, lineHeight: 1.5 }}>{video.title}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
                          {[['Views', fmtNum(video.views), isGood ? '#34d27b' : C.red], ['Likes', fmtNum(video.likes), SHELL.text1]].map(([lbl, val, col]) => (
                            <div key={lbl}>
                              <p style={{ fontSize: 12, color: SHELL.text3, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{lbl}</p>
                              <p style={{ fontSize: 21, fontWeight: 700, color: col, letterSpacing: '-0.8px', fontVariantNumeric: 'tabular-nums' }}>{val}</p>
                            </div>
                          ))}
                        </div>
                        <div style={{
                          background: isGood ? 'rgba(22,163,74,0.14)' : 'rgba(229,37,27,0.13)',
                          border: `1px solid ${isGood ? 'rgba(22,163,74,0.34)' : 'rgba(229,37,27,0.32)'}`,
                          borderRadius: 10, padding: '9px 12px',
                        }}>
                          <p style={{ fontSize: 12, color: isGood ? '#34d27b' : '#fb6a60', lineHeight: 1.7 }}>
                            {isGood ? 'Study this — replicate its title style, length, and topic angle.' : 'Avoid this format or topic — it isn\'t connecting with your audience.'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="ytg-card" style={{ padding: '20px 22px' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16 }}>Content mix</p>
                <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
                  {[{ l: 'Shorts', v: patterns.shortsCount, s: '≤60s' }, { l: 'Long-form', v: patterns.longsCount, s: '>60s' }].map(p => (
                    <div key={p.l}>
                      <p style={{ fontSize: 12, color: SHELL.text3, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{p.l}</p>
                      <p style={{ fontSize: 26, fontWeight: 700, color: SHELL.text1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>{p.v}</p>
                      <p style={{ fontSize: 12, color: SHELL.text3, marginTop: 2 }}>{p.s}</p>
                    </div>
                  ))}
                  <div style={{ flex: 1, paddingLeft: 28, borderLeft: `1px solid #26262b` }}>
                    <p style={{ fontSize: 14, color: SHELL.text2, lineHeight: 1.85 }}>
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
            <ChatCoach
              onNavigate={setNav}
              billingPlan={billingPlan}
              chatMode={chatMode}
              chatTargetId={chatTargetId}
              chatNonce={chatNonce}
              onChatState={onChatState}
            />
          )}

          {/* ── SETTINGS ─────────────────────────────────────────────── */}
          {nav === 'Settings' && <Settings channelData={data} />}

        </div>
      </div>
      ) })()}

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
    </div>
  )
}
