import { useEffect, useRef, useState } from 'react'
import {
  Gauge, Search, KeyRound, TrendingUp, Swords, Image,
  DollarSign, Coins, Wallet, Type, AlignLeft, Tags, Hash,
  ListOrdered, Badge as BadgeIcon, Lightbulb, Columns2, Crop, Download,
  Trophy, BarChart3, BookOpen, Handshake, Mail,
} from 'lucide-react'
import { openCheckout } from '../checkout'
import LandingFooter from '../components/LandingFooter'
import SiteHeader from '../components/SiteHeader'

/* Editorial design tokens for the in-progress Landing rebuild (Fraunces +
   Barlow, warm paper, gold on dark). Sections migrate one at a time; until a
   section is rebuilt it still uses the old --ytg- tokens. */
const ED_SERIF  = "'Fraunces', Georgia, serif"
const ED_SANS   = "'Barlow', system-ui, sans-serif"
const ED_INK    = '#14130f'
const ED_SOFT   = '#5c574e'
const ED_MUTED  = '#8a8378'
const ED_ACCENT = '#e5302a'
const ED_GOLD   = '#e6b35c'
const ED_LINE   = 'rgba(20,19,15,0.12)'
import AuthErrorModal from '../components/AuthErrorModal'
import BrandLockup from '../components/BrandLockup'
import HeroDashboardPreview from '../components/landing/HeroDashboardPreview'
import ChannelAuditPreview from '../components/landing/ChannelAuditPreview'
import CompetitorPreview from '../components/landing/CompetitorPreview'
import ThumbnailPreview from '../components/landing/ThumbnailPreview'
import WeeklyReportPreview from '../components/landing/WeeklyReportPreview'
import { postsMeta as posts, formatPostDate } from '../blog/postsMeta.js'

/* ─── inject font + global styles into <head> once ─────────────────────── */
function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-styles')) return

    const style = document.createElement('style')
    style.id = 'ytg-styles'
    style.textContent = `
      :root {
        --ytg-bg: #f4f4f6;
        --ytg-text: #0a0a0f;
        --ytg-text-2: rgba(10,10,15,0.62);
        --ytg-text-3: rgba(10,10,15,0.44);
        --ytg-text-4: rgba(10,10,15,0.28);
        --ytg-nav: rgba(13,13,18,0.96);
        --ytg-section: rgba(10,10,15,0.03);
        --ytg-card: #ffffff;
        --ytg-card-2: #e8e8ec;
        --ytg-border: rgba(10,10,15,0.11);
        --ytg-border-2: rgba(10,10,15,0.18);
        --ytg-divider: rgba(10,10,15,0.06);
        --ytg-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 6px 28px rgba(0,0,0,0.11);
        --ytg-shadow-lg: 0 4px 14px rgba(0,0,0,0.12), 0 24px 64px rgba(0,0,0,0.14);
        --ytg-shadow-xl: 0 8px 24px rgba(0,0,0,0.15), 0 40px 100px rgba(0,0,0,0.18);
        --ytg-card-border: rgba(10,10,15,0.11);
        --ytg-accent: #e5302a;
        --ytg-accent-text: #c22b25;
        --ytg-accent-light: rgba(229,48,42,0.08);
        --ytg-accent-border: rgba(229,48,42,0.18);
        --ytg-check: #0066cc;
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Barlow', system-ui, sans-serif; overflow-x: hidden; transition: background 0.3s, color 0.3s;  scrollbar-width: auto; scrollbar-color: rgba(10,10,15,0.28) transparent; }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      /* Centered variant keeps the -50% X shift so the mega panel stays centered
         under the pill (a plain translateY keyframe would clobber the centering). */
      @keyframes fadeUpCenter { from{opacity:0;transform:translate(-50%,12px)} to{opacity:1;transform:translate(-50%,0)} }
      @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
      .section-animate { opacity: 0; transform: translateY(24px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
      .section-animate.visible { opacity: 1; transform: translateY(0); }
      ::-webkit-scrollbar { width: 12px; height: 12px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb {
        background-color: rgba(10,10,15,0.28);
        border-radius: 10px;
        border: 3px solid transparent;
        background-clip: content-box;
        min-height: 48px;
      }
      ::-webkit-scrollbar-thumb:hover { background-color: rgba(10,10,15,0.48); background-clip: content-box; }

      .ytg-btn-primary {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        padding: 14px 28px; border-radius: 0; font-weight: 700;
        font-size: 12.5px; text-decoration: none;
        background: var(--ytg-accent);
        color: #fff; transition: filter 0.18s, transform 0.18s; cursor: pointer;
        border: none; font-family: 'Barlow', system-ui, sans-serif;
        letter-spacing: 0.08em; text-transform: uppercase;
      }
      .ytg-btn-primary:hover {
        filter: brightness(1.06);
        transform: translateY(-1px);
      }

      .ytg-btn-ghost {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        padding: 14px 28px; border-radius: 0; font-weight: 700;
        font-size: 12.5px; text-decoration: none;
        background: transparent;
        color: #5c574e;
        border: 1px solid rgba(20,19,15,0.18);
        transition: color 0.15s, border-color 0.15s; cursor: pointer;
        font-family: 'Barlow', system-ui, sans-serif;
        letter-spacing: 0.08em; text-transform: uppercase;
      }
      .ytg-btn-ghost:hover {
        background: transparent;
        color: #14130f;
        border-color: rgba(20,19,15,0.32);
      }

      .ytg-feature-card {
        background: var(--ytg-card);
        border: 1px solid var(--ytg-border);
        border-radius: 24px; padding: 28px;
        transition: all 0.2s ease; cursor: default;
        box-shadow: var(--ytg-shadow-lg);
        border-color: var(--ytg-card-border);
      }
      .ytg-feature-card:hover {
        border-color: var(--ytg-border-2);
        transform: translateY(-3px);
        box-shadow: var(--ytg-shadow-xl);
      }

      .ytg-nav-link {
        font-size: 15px; color: rgba(10,10,15,0.52); font-weight: 500;
        text-decoration: none; transition: color 0.15s; letter-spacing: -0.1px;
      }
      .ytg-nav-link:hover { color: rgba(10,10,15,0.88); }

      /* Center nav capsule, Windsor-style: links live inside one outlined pill. */
      .ytg-pill {
        position: relative;
        display: flex; align-items: center; gap: 2px;
        padding: 4px 6px;
        border: 1px solid rgba(10,10,15,0.12);
        border-radius: 999px;
        background: transparent;
      }
      .ytg-pill-item {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 8px 15px;
        border-radius: 999px;
        font-size: 15px; font-weight: 500;
        color: rgba(10,10,15,0.55);
        text-decoration: none; letter-spacing: -0.1px;
        white-space: nowrap; cursor: pointer;
        transition: background 0.15s, color 0.15s;
      }
      .ytg-pill-item:hover { background: rgba(10,10,15,0.05); color: #0a0a0f; }

      .ytg-faq-item {
        border-bottom: 1px solid var(--ytg-border);
        padding: 28px 0;
      }
      .ytg-faq-item:last-child { border-bottom: none; }

      .ytg-faq-card {
        background: var(--ytg-card);
        border-radius: 18px;
        overflow: hidden;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        box-shadow: 0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.1);
      }
      .ytg-faq-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.13), 0 2px 6px rgba(0,0,0,0.07);
      }
      .ytg-faq-answer {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
        opacity: 0;
      }
      .ytg-faq-answer.open {
        grid-template-rows: 1fr;
        opacity: 1;
      }
      .ytg-faq-answer-inner {
        overflow: hidden;
      }

      .ytg-objection-card {
        background: var(--ytg-card);
        border: 1px solid var(--ytg-border);
        border-radius: 16px;
        padding: 22px 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 8px 28px rgba(0,0,0,0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        cursor: default;
      }
      .ytg-objection-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.14), 0 3px 8px rgba(0,0,0,0.08);
        border-color: var(--ytg-border-2);
      }

      .ytg-stat-row-item {
        text-align: center; padding: 0 32px;
      }
      .ytg-stat-row-item + .ytg-stat-row-item {
        border-left: 1px solid var(--ytg-border);
      }

      .ytg-card-base {
        background: var(--ytg-card);
        border: 1px solid var(--ytg-border);
        border-radius: 22px;
        box-shadow: var(--ytg-shadow);
      }
      .ytg-card {
        background: var(--ytg-card);
        border: 1px solid var(--ytg-border);
        border-radius: 24px;
        box-shadow: var(--ytg-shadow-lg);
        transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
      }
      .ytg-card:hover {
        box-shadow: var(--ytg-shadow-xl);
        transform: translateY(-2px);
        border-color: var(--ytg-border-2);
      }
      .ytg-stat-card-premium:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05), 0 12px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(229,37,27,0.15), inset 0 1px 0 rgba(255,255,255,0.9);
      }
      .ytg-card-accent {
        background: var(--ytg-accent-light);
        border: 1px solid var(--ytg-accent-border);
        border-radius: 24px;
        box-shadow: var(--ytg-shadow-xl);
        position: relative;
        overflow: hidden;
      }
      .ytg-step-card {
        background: var(--ytg-card);
        border: 1px solid var(--ytg-border);
        border-radius: 24px;
        padding: 26px;
        box-shadow: var(--ytg-shadow-lg);
        transition: box-shadow 0.2s, transform 0.2s;
      }
      .ytg-step-card:hover {
        box-shadow: var(--ytg-shadow-xl);
        transform: translateY(-2px);
      }
      .ytg-testimonial-card {
        background: var(--ytg-card);
        border: 1px solid var(--ytg-border);
        border-radius: 24px;
        padding: 28px 30px;
        box-shadow: var(--ytg-shadow-lg);
        transition: box-shadow 0.2s, transform 0.2s;
      }
      .ytg-testimonial-card:hover {
        box-shadow: var(--ytg-shadow-xl);
        transform: translateY(-2px);
      }
      .ytg-pricing-card {
        background: #ffffff;
        border: 1px solid rgba(20,19,15,0.12);
        border-radius: 0;
        padding: 30px 28px;
        transition: border-color 0.2s;
        font-family: 'Barlow', system-ui, sans-serif;
      }
      .ytg-pricing-card:hover {
        border-color: rgba(20,19,15,0.22);
      }
      .ytg-pricing-card-featured {
        background: #ffffff;
        border: 1px solid rgba(20,19,15,0.12);
        border-radius: 0;
        padding: 30px 28px;
        position: relative;
        overflow: hidden;
        box-shadow: inset 0 2px 0 var(--ytg-accent);
        font-family: 'Barlow', system-ui, sans-serif;
      }

      /* ── Mobile nav menu ─────────────────────────────────── */
      .ytg-mobile-menu {
        display: flex; position: fixed; inset: 0; z-index: 99;
        background: #0d0d12;
        flex-direction: column; align-items: stretch; justify-content: flex-start;
        padding: 32px 28px 28px;
        overflow-y: auto;
        opacity: 0; pointer-events: none; transition: opacity 0.2s ease;
      }
      .ytg-mobile-menu.open { opacity: 1; pointer-events: auto; }
      .ytg-mm-section { margin-bottom: 32px; }
      .ytg-mm-section:last-of-type { margin-bottom: 24px; }
      .ytg-mm-label {
        display: block; margin-bottom: 14px;
        font-size: 11px; font-weight: 700;
        letter-spacing: 0.12em; text-transform: uppercase;
        color: rgba(255,255,255,0.38);
      }
      .ytg-mm-link {
        display: block; padding: 6px 0;
        font-size: 18px; font-weight: 600;
        color: #ffffff; text-decoration: none;
        letter-spacing: -0.3px; line-height: 1.35;
        transition: color 0.15s;
      }
      .ytg-mm-link:hover { color: rgba(255,255,255,0.78); }
      .ytg-mm-cta-row {
        display: flex; flex-direction: column; gap: 10px;
        padding-top: 18px;
        border-top: 1px solid rgba(255,255,255,0.08);
        margin-top: auto;
      }

      /* ── Responsive card grids ───────────────────────────── */
      @media (max-width: 768px) {
        .ytg-features-grid { grid-template-columns: 1fr !important; }
        .ytg-feature-card { border-radius: 20px; padding: 22px; }
        .ytg-step-card { border-radius: 20px; padding: 22px; }
        .ytg-testimonial-card { border-radius: 20px; padding: 22px 24px; }
        .ytg-pricing-card { border-radius: 0; padding: 28px 24px; }
        .ytg-pricing-card-featured { border-radius: 0; padding: 28px 24px; }
        .ytg-faq-card { border-radius: 16px; }
        .ytg-objection-card { border-radius: 14px; padding: 18px 16px; }
        .ytg-btn-primary { padding: 13px 26px !important; font-size: 14px !important; }
        .ytg-btn-ghost { padding: 13px 26px !important; font-size: 14px !important; }
        .ytg-stat-row-item { padding: 0 16px; text-align: center; }
        .ytg-stat-row-item + .ytg-stat-row-item { border-left: none; border-top: 1px solid var(--ytg-border); padding-top: 36px; margin-top: 36px; } /* IMPROVED: 28→36px */
      }
      /* ── Scroll-triggered section entrance ───────────────── */
      .section-animate { opacity: 0; transform: translateY(12px); transition: opacity 0.5s ease, transform 0.5s ease; } /* IMPROVED: added */
      .section-animate.visible { opacity: 1; transform: translateY(0); }
      @keyframes ytg-ticker { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
      .ytg-ticker-track { display: flex; animation: ytg-ticker 52s linear infinite; width: max-content; }
      .ytg-ticker-track:hover { animation-play-state: paused; }
      .ytg-footer-link { display: block; font-size: 14px; color: rgba(255,255,255,0.42); text-decoration: none; margin-bottom: 13px; transition: color 0.15s; font-family: 'Barlow',system-ui,sans-serif; line-height: 1; }
      .ytg-footer-link:hover { color: rgba(255,255,255,0.82); }
      .ytg-footer-link:last-child { margin-bottom: 0; }
      .ytg-creator-avatar { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; display: block; }
      .ytg-creator-avatar-fallback { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 17px; flex-shrink: 0; }
      @keyframes ytg-shimmer { 0%,100%{opacity:0.45} 50%{opacity:0.9} }
      .ytg-shimmer { animation: ytg-shimmer 1.6s ease-in-out infinite; background: rgba(10,10,15,0.07); border-radius: 50%; }

      /* ── Hero: responsive via CSS, not JS. The prerendered markup bakes the
         desktop viewport (useBreakpoint defaults to 1280 to avoid a hydration
         mismatch), so without this the hero repainted from desktop to mobile
         after hydration, causing the LCP delay + layout shift PageSpeed flagged
         on mobile. These rules reproduce the exact isMobile/isTablet values so
         the static HTML is correct on every viewport with no JS re-render. ── */
      .ytg-hero { padding: 110px 48px 90px; }
      .ytg-hero-h1 { font-size: 72px; line-height: 1.02; letter-spacing: -2.5px; }
      .ytg-hero-sub { font-size: 17.5px; }
      .ytg-hero-cta { flex-direction: row; width: auto; }
      .ytg-hero-cta .ytg-btn-primary, .ytg-hero-cta .ytg-btn-ghost, .ytg-hero-cta a { width: auto; }
      .ytg-hero-trust { gap: 18px; }
      .ytg-hero-ph { margin-top: 28px; }
      @media (max-width: 1024px) {
        .ytg-hero-h1 { font-size: 62px; }
      }
      @media (max-width: 768px) {
        .ytg-hero { padding: 48px 24px 60px; }
        .ytg-hero-h1 { font-size: 34px; line-height: 1.1; letter-spacing: -0.6px; }
        .ytg-hero-sub { font-size: 16px; }
        .ytg-hero-cta { flex-direction: column; width: 100%; }
        .ytg-hero-cta .ytg-btn-primary, .ytg-hero-cta .ytg-btn-ghost { width: 100%; }
        .ytg-hero-cta .ytg-btn-ghost { opacity: 0.85; }
        .ytg-hero-trust { gap: 10px; }
        .ytg-hero-ph { margin-top: 24px; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

/* ─── Responsive hooks ──────────────────────────────────────────────────── */
function useBreakpoint() {
  // Stable initial value (1280 = desktop) so server-pre-rendered HTML and the
  // client's first render agree, avoiding hydration mismatches in React 19.
  // The real viewport is read in useEffect below, so mobile users get the
  // correct layout after first paint with no console warning.
  const [width, setWidth] = useState(1280)
  useEffect(() => {
    setWidth(window.innerWidth)
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return { isMobile: width <= 768, isTablet: width <= 1024 }
}

/* ─── Logo: Canva lockup as a single img ──────────────────────────────── */
function Logo({ size = 32, iconOnly = false }) {
  if (iconOnly) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="9" fill="#e5251b"/>
        <path d="M23.2 11.6a2.1 2.1 0 0 0-1.48-1.48C20.55 9.8 16 9.8 16 9.8s-4.55 0-5.72.32A2.1 2.1 0 0 0 8.8 11.6 22 22 0 0 0 8.5 16a22 22 0 0 0 .3 4.4 2.1 2.1 0 0 0 1.48 1.48C11.45 22.2 16 22.2 16 22.2s4.55 0 5.72-.32a2.1 2.1 0 0 0 1.48-1.48A22 22 0 0 0 23.5 16a22 22 0 0 0-.3-4.4z" fill="white"/>
        <polygon points="13.5,19 19.5,16 13.5,13" fill="#e5251b"/>
      </svg>
    )
  }
  return <BrandLockup height={size - 2} />
}

/* ─── Per-card Monthly / Yearly toggle ─────────────────────────────────────
   Lives INSIDE each pricing card (sibling-card pattern, à la Kitemaker /
   Linear). 2-button segmented pill. Never a dropdown. Active side fills
   red to match the global tab pill (line 1429 of pricing tabs). */
function CycleToggle({ value, onChange }) {
  return (
    <div style={{
      display: 'inline-flex',
      background: '#efece4',
      border: '1px solid rgba(20,19,15,0.10)',
      borderRadius: 0,
      padding: 3,
      gap: 2,
      marginBottom: 14,
    }}>
      {[
        ['monthly', 'Monthly'],
        ['yearly',  'Yearly'],
      ].map(([val, label]) => (
        <button
          key={val}
          onClick={() => onChange(val)}
          style={{
            padding: '5px 14px',
            borderRadius: 0,
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Barlow', system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            background: value === val ? '#14130f' : 'transparent',
            color: value === val ? '#fff' : '#8a8378',
            transition: 'all 0.15s',
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/* ─── Check icon ────────────────────────────────────────────────────────── */
function Check({ color = '#e5302a' }) {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <path d="M2.5 7.2 5.4 10l6.1-6" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function NoCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7" fill="rgba(0,0,0,0.04)" stroke="rgba(0,0,0,0.1)"/>
      <path d="M5.5 10.5l5-5M10.5 10.5l-5-5" stroke="var(--ytg-text-4)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

/* Larger, more visually present bullet for feature-section lists. */
function FeatureBullet({ onDark = false }) {
  const bg     = onDark ? 'rgba(74,222,128,0.16)' : 'rgba(22,163,74,0.12)'
  const border = onDark ? 'rgba(74,222,128,0.38)' : 'rgba(22,163,74,0.28)'
  const stroke = onDark ? '#4ade80' : '#16a34a'
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="10" fill={bg} stroke={border} strokeWidth="1"/>
      <path d="M6.8 11.2l3 3 5.4-6" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function FeatureBulletRow({ onDark = false, children }) {
  const textColor = onDark ? 'rgba(255,255,255,0.78)' : 'var(--ytg-text)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
      <FeatureBullet onDark={onDark} />
      <span style={{ fontSize: 15, fontWeight: 500, color: textColor, lineHeight: 1.5, letterSpacing: '-0.1px' }}>{children}</span>
    </div>
  )
}

/* ─── Arrow icon ────────────────────────────────────────────────────────── */
function Arrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2 7.5h11M9 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* ─── Mega-menu data: Features grouped by category ─────────────────────── */
const FEATURE_GROUPS = [
  {
    label: 'Audit & strategy',
    items: [
      { href: '/features/channel-audit', label: 'Channel Audit', desc: '10-dimension AI audit of your channel', Icon: Gauge },
    ],
  },
  {
    label: 'SEO & discovery',
    items: [
      { href: '/features/seo-studio',       label: 'SEO Studio',       desc: 'Score + rewrite titles and descriptions', Icon: Search },
      { href: '/features/keyword-research', label: 'Keyword Research', desc: 'YouTube-native search volume + difficulty', Icon: KeyRound },
      { href: '/features/outliers',         label: 'Outliers',         desc: 'Find viral videos and breakout channels', Icon: TrendingUp },
    ],
  },
  {
    label: 'Compete & convert',
    items: [
      { href: '/features/competitor-analysis', label: 'Competitor Analysis', desc: 'Track rivals, find their content gaps', Icon: Swords },
      { href: '/features/thumbnail-iq',        label: 'Thumbnail IQ',        desc: 'Two-layer thumbnail scoring vs your niche', Icon: Image },
    ],
  },
]
// Flat list, kept for the mobile menu and anywhere else that wants every item
const FEATURE_NAV_ITEMS = FEATURE_GROUPS.flatMap(g => g.items)

/* ─── Mega-menu data: Resources, 4 verb-based columns. Clean labels, no
   descriptions, vertical dividers between columns (matches Features). */
const RESOURCES_GROUPS = [
  {
    label: 'Calculators',
    items: [
      { href: '/tools/youtube-money-calculator',            label: 'YouTube Money Calculator', Icon: DollarSign },
      { href: '/tools/youtube-shorts-money-calculator',     label: 'Shorts Money Calculator',  Icon: Coins },
      { href: '/tools/youtube-subscriber-money-calculator', label: 'Subscriber Money Calculator', Icon: Wallet },
    ],
  },
  {
    label: 'Brainstorm',
    items: [
      { href: '/tools/youtube-title-generator',        label: 'Title Generator',        Icon: Type },
      { href: '/tools/youtube-description-generator',  label: 'Description Generator',   Icon: AlignLeft },
      { href: '/tools/youtube-tag-generator',          label: 'Tag Generator',          Icon: Tags },
      { href: '/tools/youtube-hashtag-generator',      label: 'Hashtag Generator',      Icon: Hash },
      { href: '/tools/youtube-chapter-generator',      label: 'Chapter Generator',      Icon: ListOrdered },
      { href: '/tools/youtube-channel-name-generator', label: 'Channel Name Generator', Icon: BadgeIcon },
      { href: '/tools/youtube-video-ideas-generator',  label: 'Video Ideas Generator',  Icon: Lightbulb },
    ],
  },
  {
    label: 'Thumbnails',
    items: [
      { href: '/tools/youtube-thumbnail-tester',     label: 'Thumbnail Tester (A/B)', Icon: Columns2 },
      { href: '/tools/youtube-thumbnail-resizer',    label: 'Thumbnail Resizer',      Icon: Crop },
      { href: '/tools/youtube-thumbnail-downloader', label: 'Thumbnail Downloader',   Icon: Download },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/youtube-stats',                       label: 'Top YouTube Channels',  Icon: Trophy },
      { href: '/tools/youtube-channel-stats-checker', label: 'Channel Stats Checker', Icon: BarChart3 },
      { href: '/blog',                                label: 'Blog',                  Icon: BookOpen },
    ],
  },
]
const RESOURCES_NAV_ITEMS = RESOURCES_GROUPS.flatMap(g => g.items || [])

/* Company, a small single-column menu (no eyebrow label). */
const COMPANY_GROUPS = [
  {
    label: '',
    items: [
      { href: '/affiliate', label: 'Affiliates', desc: 'Earn 30% recurring', Icon: Handshake },
      { href: '/contact',   label: 'Contact',    desc: 'Talk to the team',   Icon: Mail },
    ],
  },
]

/* ─── Mega-menu component, VidIQ pattern: clean titles, no descriptions ─ */
function MegaMenu({ trigger, groups, viewAllHref, viewAllLabel, columns = 3 }) {
  const [open, setOpen] = useState(false)
  const [leftOffset, setLeftOffset] = useState(-14)
  const wrapRef = useRef(null)
  const closeTimer = useRef(null)
  const panelWidth = columns === 4 ? 1000 : columns === 3 ? 860 : 260
  // Open the panel directly under its own trigger. If a wide panel would spill
  // off the right edge, shift it left just enough to stay on screen.
  const position = () => {
    const el = wrapRef.current
    if (!el || typeof window === 'undefined') return
    const triggerLeft = el.getBoundingClientRect().left
    const vw = document.documentElement.clientWidth
    const margin = 16
    const desired = triggerLeft - 14
    const clamped = Math.min(Math.max(margin, desired), vw - panelWidth - margin)
    setLeftOffset(clamped - triggerLeft)
  }
  // Open instantly; close on a short delay so moving from the trigger down into
  // the panel doesn't snap it shut before you can click a tool.
  const show = () => { if (closeTimer.current) clearTimeout(closeTimer.current); position(); setOpen(true) }
  const hide = () => { closeTimer.current = setTimeout(() => setOpen(false), 180) }
  return (
    <div
      ref={wrapRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      style={{ position: 'relative' }}
    >
      <a href={groups[0].items[0].href} className="ytg-pill-item">
        {trigger}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>
          <path d="M2 3.5l3 3 3-3"/>
        </svg>
      </a>
      {open && (
        <>
          {/* Hover bridge: spans the panel width and overlaps up into the pill
              so there's no dead gap between the trigger and the panel. */}
          <div style={{ position: 'absolute', top: 'calc(100% - 10px)', height: 28, left: leftOffset, width: panelWidth }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 12px)', left: leftOffset, width: panelWidth,
            background: '#ffffff', border: '1px solid rgba(10,10,15,0.08)', borderRadius: 28,
            boxShadow: '0 4px 16px rgba(0,0,0,0.07), 0 24px 64px rgba(0,0,0,0.12)',
            padding: '24px 26px 18px',
            animation: 'fadeUp 0.16s ease both',
            zIndex: 110,
          }}>
            {/* Icon cards, grouped by category. Tinted-circle Lucide icon +
                title (+ one-line description on Features). */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, columnGap: 14 }}>
              {groups.map((group, gi) => (
                <div key={gi}>
                  {group.label && <p style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'rgba(10,10,15,0.38)', margin: '0 0 8px 10px', whiteSpace: 'nowrap',
                  }}>{group.label}</p>}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {group.items.map((item, i) => (
                      <a
                        key={i} href={item.href}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 11,
                          padding: '9px 10px', borderRadius: 12,
                          textDecoration: 'none', transition: 'background 0.14s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,19,15,0.04)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <span style={{
                          flexShrink: 0, width: 34, height: 34, borderRadius: '50%',
                          background: 'rgba(20,19,15,0.05)',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <item.Icon size={17} strokeWidth={1.9} color="#14130f" />
                        </span>
                        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0f', letterSpacing: '-0.15px', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{item.label}</span>
                          {item.desc && <span style={{ fontSize: 12, fontWeight: 450, color: 'rgba(10,10,15,0.5)', letterSpacing: '-0.05px', lineHeight: 1.35, marginTop: 1 }}>{item.desc}</span>}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {viewAllHref && (
              <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid rgba(10,10,15,0.07)' }}>
                <a href={viewAllHref} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 13.5, fontWeight: 600, color: 'var(--ytg-accent)',
                  textDecoration: 'none', letterSpacing: '-0.1px',
                }}>
                  {viewAllLabel}
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function FeaturesNavDropdown() {
  return (
    <MegaMenu
      trigger="Features"
      groups={FEATURE_GROUPS}
      columns={3}
      viewAllHref="#features"
      viewAllLabel="Explore all features"
    />
  )
}

function ResourcesNavDropdown() {
  return (
    <MegaMenu
      trigger="Resources"
      groups={RESOURCES_GROUPS}
      columns={4}
      viewAllHref="/blog"
      viewAllLabel="Read the latest from the blog →"
    />
  )
}

function CompanyNavDropdown() {
  return (
    <MegaMenu
      trigger="Company"
      groups={COMPANY_GROUPS}
      columns={1}
    />
  )
}

/* ─── Section badge ─────────────────────────────────────────────────────── */
function Badge({ children }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: 'var(--ytg-accent-light)', border: '1px solid var(--ytg-accent-border)',
      borderRadius: 100, padding: '6px 16px', marginBottom: 20, /* IMPROVED: 18→20px */
    }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ytg-accent)' }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{children}</span>
    </div>
  )
}

/* ─── Section nav dots ──────────────────────────────────────────────────── */
const SECTIONS = [
  { id: 'hero',         label: 'Top' },
  { id: 'features',    label: 'Features' },
  { id: 'all-in-one',  label: 'All in one' },
  { id: 'pricing',     label: 'Pricing' },
  { id: 'faq',         label: 'FAQ' },
]

function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = SECTIONS.findIndex(s => s.id === entry.target.id)
          if (idx !== -1) setActive(idx)
        }
      }),
      { threshold: 0.35 }
    )
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id) => {
    if (id === 'hero') { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Top scroll progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 999, background: 'transparent' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--ytg-accent)', transition: 'width 0.08s linear', borderRadius: '0 2px 2px 0' }} />
      </div>
      {/* Side section nav. Horizontal dashes */}
      <div style={{ position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 200, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SECTIONS.map((s, i) => {
          const isActive = active === i
          const isHovered = hovered === i
          return (
            <button
              key={i}
              onClick={() => scrollTo(s.id)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {(isActive || isHovered) && (
                <span style={{
                  fontSize: 12, fontWeight: isActive ? 700 : 500, whiteSpace: 'nowrap',
                  color: isActive ? 'var(--ytg-accent-text)' : 'var(--ytg-text-3)',
                  background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)',
                  padding: '3px 9px', borderRadius: 6, boxShadow: 'var(--ytg-shadow)',
                  letterSpacing: '-0.1px', pointerEvents: 'none',
                  opacity: isActive || isHovered ? 1 : 0, transition: 'opacity 0.15s',
                }}>{s.label}</span>
              )}
              <div style={{
                height: 2, borderRadius: 2, flexShrink: 0,
                width: isActive ? 24 : isHovered ? 14 : 8,
                background: isActive ? 'var(--ytg-accent)' : isHovered ? 'var(--ytg-border-2)' : 'var(--ytg-border)',
                transition: 'width 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.2s',
              }} />
            </button>
          )
        })}
      </div>
    </>
  )
}

/* ─── Data-driven reviews (placeholder until real reviews arrive) ────────── */
import reviewsData from '../data/reviews.json'

function Testimonials({ isMobile }) {
  const list = Array.isArray(reviewsData?.reviews) ? reviewsData.reviews : []
  if (list.length < 3) return null

  const avg   = reviewsData.average_rating
  const total = reviewsData.total_reviews

  return (
    <div className="section-animate" style={{ background: '#ffffff', borderTop: '1px solid ' + ED_LINE, borderBottom: '1px solid ' + ED_LINE, padding: isMobile ? '64px 24px' : '96px 48px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          {avg != null && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 3 }}>
                {[...Array(5)].map((_, i) => <span key={i} style={{ fontSize: 19, color: ED_GOLD }}>★</span>)}
              </div>
              <div style={{ width: 1, height: 22, background: ED_LINE }} />
              <span style={{ fontFamily: ED_SERIF, fontSize: 24, fontWeight: 400, color: ED_INK, letterSpacing: '-0.5px' }}>{avg} / 5</span>
              {total != null && (
                <>
                  <div style={{ width: 1, height: 22, background: ED_LINE }} />
                  <span style={{ fontFamily: ED_SANS, fontSize: 14, fontWeight: 500, color: ED_MUTED }}>Based on {total}+ reviews</span>
                </>
              )}
            </div>
          )}
          <h2 style={{ fontFamily: ED_SERIF, fontWeight: 300, fontSize: 'clamp(34px, 4.4vw, 54px)', letterSpacing: '-0.01em', color: ED_INK, lineHeight: 1.08, marginBottom: 12, textWrap: 'balance' }}>The YouTube growth tool creators <em style={{ fontStyle: 'italic', color: ED_ACCENT }}>recommend.</em></h2>
          <p style={{ fontFamily: ED_SANS, fontSize: 15, color: ED_SOFT, lineHeight: 1.72 }}>Real channels. Real numbers.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 1, background: ED_LINE, border: '1px solid ' + ED_LINE }}>
          {list.map((r, i) => (
            <a key={i} href={r.platform_url || '#'} target="_blank" rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block', background: '#ffffff', padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {r.avatar
                  ? <img src={r.avatar} alt={r.name} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 46, height: 46, borderRadius: '50%', background: ED_ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ED_SERIF, fontSize: 18, fontWeight: 400, flexShrink: 0 }}>{(r.name || '?')[0]}</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: ED_SANS, fontSize: 14, fontWeight: 600, color: ED_INK, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</p>
                  {r.handle_or_title && <p style={{ fontFamily: ED_SANS, fontSize: 12, color: ED_MUTED, marginTop: 2, marginBottom: 0 }}>{r.handle_or_title}</p>}
                </div>
                {r.platform && (
                  <span style={{ fontFamily: ED_SANS, fontSize: 11, fontWeight: 700, color: ED_MUTED, border: '1px solid ' + ED_LINE, padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>{r.platform}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 3, marginTop: 14, marginBottom: 14 }}>
                {[...Array(r.rating || 5)].map((_, j) => <span key={j} style={{ fontSize: 14, color: ED_GOLD }}>★</span>)}
              </div>
              {r.metric && (
                <div style={{ background: 'rgba(229,48,42,0.07)', borderLeft: '2px solid ' + ED_ACCENT, padding: '8px 14px', marginBottom: 14 }}>
                  <span style={{ fontFamily: ED_SANS, fontSize: 14, fontWeight: 700, color: ED_ACCENT }}>{r.metric}</span>
                </div>
              )}
              <p style={{ fontFamily: ED_SANS, fontSize: 14, color: ED_SOFT, lineHeight: 1.75, margin: 0 }}>{r.quote}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Landing page ──────────────────────────────────────────────────────── */
// Valid auth-error codes returned by routers/auth.py /callback. See
// AuthErrorModal.jsx for the per-code copy & action wiring. Keep the
// list in sync with routers/auth.py. Every RedirectResponse(?error=...)
// must have a matching key here, otherwise users see the generic fallback.
const AUTH_ERROR_CODES = new Set([
  'no_channel', 'channel_taken', 'channel_locked', 'channel_limit',
  'no_code', 'session_expired', 'analysis_failed', 'quota_exceeded',
])

export default function Landing() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [pricingTab, setPricingTab] = useState(() => {
    const tab = new URLSearchParams(window.location.search).get('tab')
    // Backward compat: old links pointed at ?tab=monthly / ?tab=annual.
    // Both now resolve to the consolidated Subscription tab; the per-card
    // toggle decides cycle.
    if (tab === 'monthly' || tab === 'annual') return 'subscription'
    return ['subscription','lifetime','founder','packs'].includes(tab) ? tab : 'subscription'
  })
  // Per-card billing cycle inside the Subscription tab. Each plan flips
  // independently so the page only ever shows one toggle (the segmented
  // pill inside that card), not a global one above the grid.
  const [cycle, setCycle] = useState({ solo: 'monthly', growth: 'monthly', agency: 'monthly' })
  const [openFaq, setOpenFaq] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [authError, setAuthError] = useState(null)
  const { isMobile, isTablet } = useBreakpoint()
  useGlobalStyles()

  useEffect(() => {
    fetch('/auth/data', { credentials: 'include' })
      .then(r => {
        if (!r.ok) return
        setLoggedIn(true)
        // Resume a checkout the visitor started before logging in.
        let pending = null
        try { pending = sessionStorage.getItem('ytg_pending_plan') } catch {}
        if (pending) {
          try { sessionStorage.removeItem('ytg_pending_plan') } catch {}
          openCheckout(pending)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const err = params.get('error')
    if (err) {
      // Show the modal for known codes, or fall back to 'generic' for anything
      // unrecognised so users always get an explanation rather than a silent bounce.
      setAuthError(AUTH_ERROR_CODES.has(err) ? err : 'generic')
      // Strip ?error from URL so refresh / share doesn't keep re-firing the modal
      params.delete('error')
      const qs = params.toString()
      window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''))
    }
    if (params.get('tab')) {
      setTimeout(() => {
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
      }, 600)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // IMPROVED: scroll-triggered fade-up on section content
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) } }),
      { threshold: 0.15 }
    )
    document.querySelectorAll('.section-animate').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div style={{ fontFamily: "'Barlow', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', overflowX: 'clip' }}>

      {/* ── AUTH ERROR. Paywall-style modal, replaces the old toast ─────── */}
      <AuthErrorModal
        open={!!authError}
        errorCode={authError}
        onClose={() => setAuthError(null)}
      />


      {/* ── NAV. Shared editorial SiteHeader (logged-in aware) ──────────── */}
      <SiteHeader loggedIn={loggedIn} />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <div id="hero" className="ytg-hero" style={{ position: 'relative', overflow: 'hidden', background: '#f6f4ef' }}>

        <div className="ytg-hero-grid" style={{ maxWidth: 1240, margin: '0 auto', padding: isMobile ? '0 4px' : '0 32px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.02fr', gap: isMobile ? 44 : 52, alignItems: 'center', position: 'relative', zIndex: 1, animation: 'fadeUp 0.5s ease' }}>
          <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
          {/* Eyebrow */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <span aria-hidden="true" style={{ width: 26, height: 1, background: ED_ACCENT }} />
            <span style={{ fontFamily: ED_SANS, fontSize: 11, fontWeight: 600, color: ED_ACCENT, textTransform: 'uppercase', letterSpacing: '0.18em' }}>AI YouTube growth platform</span>
          </div>

          <h1 className="ytg-hero-h1" style={{ fontFamily: ED_SERIF, fontWeight: 300, color: ED_INK, fontSize: 'clamp(34px, 4.8vw, 60px)', marginBottom: 20, textWrap: 'balance', letterSpacing: '-0.01em', lineHeight: 1.06 }}>
            Your analytics already know why you're stuck. <em style={{ fontStyle: 'italic', color: ED_ACCENT }}>Now you will too.</em>
          </h1>

          <p className="ytg-hero-sub" style={{ fontFamily: ED_SANS, color: ED_SOFT, lineHeight: 1.7, maxWidth: 660, margin: isMobile ? '0 auto 28px' : '0 0 32px', textWrap: 'pretty' }}>
            YouTube Studio gives you fifty charts and zero answers. YTGrowth reads every one, pinpoints what's holding your channel back, and hands you a ranked plan, starting with the single fix that moves the needle most. The vidIQ, TubeBuddy, and Viewstats alternative built around your next move, not another dashboard.
          </p>

          <div className="ytg-hero-cta" style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 26 }}>
            <a href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: ED_ACCENT, color: '#fff', fontFamily: ED_SANS, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '17px 34px', textDecoration: 'none', transition: 'filter 0.18s, transform 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.06)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
            >Audit my channel free →</a>
            <a href="#pricing" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', color: ED_SOFT, fontFamily: ED_SANS, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '17px 30px', textDecoration: 'none', border: '1px solid rgba(20,19,15,0.14)', transition: 'color 0.15s, border-color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = ED_INK; e.currentTarget.style.borderColor = 'rgba(20,19,15,0.28)' }}
              onMouseLeave={e => { e.currentTarget.style.color = ED_SOFT; e.currentTarget.style.borderColor = 'rgba(20,19,15,0.14)' }}
            >See pricing</a>
          </div>

          {/* Trust line */}
          <p style={{ fontFamily: ED_SANS, fontSize: 13, fontWeight: 500, color: ED_MUTED, letterSpacing: '0.02em' }}>
            No card required &nbsp;·&nbsp; 5 free audits when you sign up &nbsp;·&nbsp; Cancel anytime
          </p>

          {/* Product Hunt badge */}
          <div className="ytg-hero-ph" style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 20 : 18, flexWrap: 'wrap', marginTop: isMobile ? 26 : 30 }}>
            <a
              href="https://www.producthunt.com/products/ytgrowth?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-ytgrowth"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                alt="YTGrowth - YouTube audit tool that turns data into growth actions | Product Hunt"
                width="250"
                height="54"
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1132935&theme=light&t=1777325565998"
              />
            </a>

            {/* Creator social proof: overlapping avatars (from the in-app gate) */}
            <div style={{ display: 'flex', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 9 : 11 }}>
              <div style={{ display: 'flex' }}>
                {['sophie', 'james', 'priya', 'amara', 'marcus'].map((name, i, arr) => (
                  <img
                    key={name}
                    src={`/avatars/${name}.jpg`}
                    alt=""
                    width="32" height="32"
                    style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid #f6f4ef', marginLeft: i === 0 ? 0 : -9, objectFit: 'cover', position: 'relative', zIndex: arr.length - i, boxShadow: '0 1px 3px rgba(20,19,15,0.12)' }}
                  />
                ))}
              </div>
              <span style={{ fontFamily: ED_SANS, fontSize: 12.5, fontWeight: 500, color: ED_SOFT, lineHeight: 1.35, maxWidth: isMobile ? 240 : 150, textAlign: isMobile ? 'center' : 'left' }}>
                Trusted by over <b style={{ fontWeight: 700, color: ED_INK }}>300k creators</b> like you
              </span>
            </div>
          </div>
        </div>

        <HeroDashboardPreview isMobile={isMobile} />
        </div>
      </div>

      {/* ── STATS BAR. Connected hairline strip, Fraunces serif figures ─── */}
      <div className="section-animate" style={{
        background: '#ffffff',
        borderTop: '1px solid ' + ED_LINE,
        borderBottom: '1px solid ' + ED_LINE,
      }}>
        <div style={{
          maxWidth: 1240, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)',
          gap: 1, background: ED_LINE,
        }}>
          {[
            ['10',       'Audit dimensions',      'Traffic, retention, CTR, and 7 more'],
            ['3',        'Competitor benchmarks', "See who's winning and what's working"],
            ['2-layer',  'Thumbnail scoring',     'Algorithm + vision model in one pass'],
            ['Weekly',   'Automated reports',     'One priority action, every Monday'],
            ['7+',       'Core growth tools',     'Audit, SEO, keywords, ideas, thumbnails'],
          ].map(([stat, label, desc], i) => (
            <div key={i} style={{ background: '#ffffff', padding: isMobile ? '24px 22px' : '34px 28px 32px' }}>
              <p style={{ fontFamily: ED_SERIF, fontWeight: 400, fontSize: isMobile ? 32 : 38, color: ED_INK, letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 12 }}>{stat}</p>
              <p style={{ fontFamily: ED_SANS, fontSize: 11, fontWeight: 700, color: ED_MUTED, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>{label}</p>
              <p style={{ fontFamily: ED_SANS, fontSize: 12.5, fontWeight: 450, color: ED_SOFT, lineHeight: 1.55, maxWidth: 220 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}

      {/* Section 1. Channel Audit */}
      <div id="features" className="section-animate" style={{ background: '#f6f4ef', borderTop: '1px solid ' + ED_LINE, borderBottom: '1px solid ' + ED_LINE, padding: isMobile ? '64px 24px' : '96px 48px' }}>
        {/* Text left (headline + lead + bullets + hero-style CTA), white
            audit preview right. Mirrors the approved hero composition. */}
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.04fr', gap: isMobile ? 36 : 72, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <span aria-hidden="true" style={{ width: 26, height: 1, background: ED_ACCENT }} />
              <span style={{ fontFamily: ED_SANS, fontSize: 11, fontWeight: 600, color: ED_ACCENT, textTransform: 'uppercase', letterSpacing: '0.18em' }}>YouTube Channel Audit</span>
            </div>
            <h2 style={{ fontFamily: ED_SERIF, fontSize: 'clamp(34px, 4.4vw, 54px)', fontWeight: 300, letterSpacing: '-0.01em', lineHeight: 1.08, color: ED_INK, textWrap: 'balance' }}>10 dimensions. <em style={{ fontStyle: 'italic', color: ED_ACCENT }}>One brutally honest assessment.</em></h2>
            <p style={{ fontFamily: ED_SANS, fontSize: 17, color: ED_SOFT, lineHeight: 1.72, marginTop: 18, marginBottom: 26 }}>This is the read a $500/hour consultant would give your channel, in about 30 seconds. Most tools stop at a score. YTGrowth shows you why, then hands you one ranked to-do list: traffic, retention, CTR, SEO, and how you stack up against the channels beating you.</p>
            {[
              'Traffic source breakdown. Search vs browse vs external',
              'Competitor benchmarking against channels in your niche',
              'Audience demographics and device profile',
              'Exact priority actions ranked by impact',
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 11 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={ED_ACCENT} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M2.5 7.2 5.4 10l6.1-6"/></svg>
                <span style={{ fontFamily: ED_SANS, fontSize: 15, color: ED_SOFT, lineHeight: 1.6 }}>{t}</span>
              </div>
            ))}
            <a href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 22, background: ED_ACCENT, color: '#fff', fontFamily: ED_SANS, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '16px 32px', textDecoration: 'none', transition: 'filter 0.18s, transform 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.06)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
            >Run my free audit →</a>
            <p style={{ fontFamily: ED_SANS, fontSize: 12.5, color: ED_MUTED, marginTop: 13 }}>Your first audit is free. No card required.</p>
          </div>
          <ChannelAuditPreview isMobile={isMobile} />
        </div>

        {/* Channel Audit reviews, full-width below the build. Tied to the
            audit feature (Gauge). PLACEHOLDER quotes — swap for real ones. */}
        <div style={{ maxWidth: 1160, margin: isMobile ? '40px auto 0' : '60px auto 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 1, background: ED_LINE, border: '1px solid ' + ED_LINE }}>
            {[
              { av: 'blessing', name: 'Level up with Blessing', handle: '@LevelupwithBlessing · 31K', metric: '+38% watch time', quote: "I'd stared at my own analytics for months with no clue what was wrong. The audit just said it: your intros. I fixed three and watch time finally moved." },
              { av: 'adnane', name: 'ADN7', handle: '@Adnanehm7 · 48.7K', metric: 'Retention up 22%', quote: "It's blunt, which is exactly what I needed. It showed me where I was losing people and what to fix first, no fifty-tab spreadsheet to decode." },
              { av: 'tberry', name: 'Tberry AI', handle: '@TberryAI · 1K', metric: 'CTR 3% → 6%', quote: "Ran it expecting fluff and got a ranked to-do list instead. I did the top item first and my click-through climbed within a couple of uploads." },
            ].map((r, i) => (
              <div key={i} style={{ background: '#fff', padding: isMobile ? '24px 22px' : '28px 26px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: 2.5, marginBottom: 16 }}>
                  {[...Array(5)].map((_, s) => <svg key={s} width="14" height="14" viewBox="0 0 20 20" fill={ED_GOLD}><path d="M10 1.5l2.6 5.3 5.9.86-4.25 4.14 1 5.86L10 15.9l-5.25 2.76 1-5.86L1.5 7.66l5.9-.86z" /></svg>)}
                </div>
                <p style={{ fontFamily: ED_SANS, fontSize: 14.5, color: ED_INK, lineHeight: 1.62, flex: 1, marginBottom: 20 }}>{r.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, paddingTop: 16, borderTop: '1px solid ' + ED_LINE }}>
                  <img src={`/avatars/${r.av}.jpg`} alt="" width="34" height="34" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: ED_SANS, fontSize: 13, fontWeight: 600, color: ED_INK, lineHeight: 1.2 }}>{r.name}</p>
                    <p style={{ fontFamily: ED_SANS, fontSize: 11.5, color: ED_MUTED, marginTop: 2 }}>{r.handle}</p>
                  </div>
                  <span style={{ fontFamily: ED_SANS, fontSize: 12, fontWeight: 700, color: ED_ACCENT, whiteSpace: 'nowrap' }}>{r.metric}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2. Competitor Intelligence */}
      <div className="section-animate" style={{ background: '#ffffff', borderTop: '1px solid ' + ED_LINE, borderBottom: '1px solid ' + ED_LINE, padding: isMobile ? '64px 24px' : '96px 48px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 44 : 72, alignItems: 'center' }}>
          {/* Visual. Left on desktop. White editorial competitor preview,
              same skin as the hero + audit previews. */}
          <div style={{ order: isMobile ? 1 : 0 }}>
            <CompetitorPreview isMobile={isMobile} />
          </div>
          {/* Text. Right on desktop */}
          <div style={{ order: isMobile ? 0 : 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <span aria-hidden="true" style={{ width: 26, height: 1, background: ED_ACCENT }} />
              <span style={{ fontFamily: ED_SANS, fontSize: 11, fontWeight: 600, color: ED_ACCENT, textTransform: 'uppercase', letterSpacing: '0.18em' }}>Competitive Edge</span>
            </div>
            <h2 style={{ fontFamily: ED_SERIF, fontSize: 'clamp(34px, 4.4vw, 54px)', fontWeight: 300, letterSpacing: '-0.01em', lineHeight: 1.08, marginBottom: 18, color: ED_INK, textWrap: 'balance' }}>Find the gaps your competitors <em style={{ fontStyle: 'italic', color: ED_ACCENT }}>leave open.</em></h2>
            <p style={{ fontFamily: ED_SANS, fontSize: 17, color: ED_SOFT, lineHeight: 1.72, marginBottom: 26 }}>Point YTGrowth at any competitor and it maps the topics they skip, the title patterns driving their views, and the audience they're leaving underserved. Then it shows you how to take that ground before they do.</p>
            {[
              'Topic gap analysis from real video data',
              'Title pattern and keyword extraction',
              'Threat level assessment per competitor',
              'Ready-to-use video ideas from gap analysis',
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 11 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={ED_ACCENT} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M2.5 7.2 5.4 10l6.1-6"/></svg>
                <span style={{ fontFamily: ED_SANS, fontSize: 15, color: ED_SOFT, lineHeight: 1.6 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selling point: proof the gap is real. Real videos winning in the
            exact gap the tracked competitor leaves open. */}
        <div style={{ maxWidth: 1160, margin: isMobile ? '52px auto 0' : '76px auto 0' }}>
          <div style={{ marginBottom: isMobile ? 26 : 34, maxWidth: 660 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span aria-hidden="true" style={{ width: 26, height: 1, background: ED_ACCENT }} />
              <span style={{ fontFamily: ED_SANS, fontSize: 11, fontWeight: 600, color: ED_ACCENT, textTransform: 'uppercase', letterSpacing: '0.18em' }}>Proof, not a guess</span>
            </div>
            <h3 style={{ fontFamily: ED_SERIF, fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 300, letterSpacing: '-0.01em', lineHeight: 1.12, color: ED_INK, textWrap: 'balance' }}>The hooks they won't touch are <em style={{ fontStyle: 'italic', color: ED_ACCENT }}>quietly winning.</em></h3>
            <p style={{ fontFamily: ED_SANS, fontSize: 16, color: ED_SOFT, lineHeight: 1.7, marginTop: 14 }}>These are real videos winning the exact angle your competitor refuses to cover. YTGrowth surfaces every one the moment you add a rival, then shows you the pattern to copy.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 18 : 22 }}>
            {[
              { img: 'yt-jZQ_clu2DTY.jpg', views: '225K views', tag: 'Tutorial hook', channel: 'Level up with Blessing', url: 'https://www.youtube.com/watch?v=jZQ_clu2DTY' },
              { img: 'yt-rTQzixWplRQ.jpg', views: '83K views', tag: 'Story hook', channel: 'Tales by Titus254', url: 'https://www.youtube.com/watch?v=rTQzixWplRQ' },
              { img: 'yt-O2HgyToWu9Q.jpg', views: '315K views', tag: 'Curiosity hook', channel: 'Vaibhav Sisinty', url: 'https://www.youtube.com/watch?v=O2HgyToWu9Q' },
            ].map((v, i) => (
              <a key={i} href={v.url} target="_blank" rel="noreferrer" style={{ display: 'block', textDecoration: 'none', background: '#fff', border: '1px solid ' + ED_LINE, overflow: 'hidden', transition: 'transform 0.18s, box-shadow 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 18px 40px rgba(20,19,15,0.13)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ aspectRatio: '16 / 9', overflow: 'hidden', background: '#000' }}>
                  <img src={`/blog/${v.img}`} alt={v.channel + ' thumbnail'} loading="lazy" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 5 }}>
                    <span style={{ fontFamily: ED_SERIF, fontSize: 19, fontWeight: 400, color: ED_INK, letterSpacing: '-0.4px', fontVariantNumeric: 'tabular-nums' }}>{v.views}</span>
                    <span style={{ fontFamily: ED_SANS, fontSize: 10, fontWeight: 700, color: ED_ACCENT, border: '1px solid rgba(229,48,42,0.3)', padding: '3px 9px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{v.tag}</span>
                  </div>
                  <p style={{ fontFamily: ED_SANS, fontSize: 12.5, fontWeight: 500, color: ED_MUTED }}>{v.channel}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3. Thumbnail IQ */}
      <div className="section-animate" style={{ background: '#f6f4ef', borderTop: '1px solid ' + ED_LINE, borderBottom: '1px solid ' + ED_LINE, padding: isMobile ? '64px 24px' : '96px 48px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 44 : 72, alignItems: 'center' }}>
          {/* Text */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <span aria-hidden="true" style={{ width: 26, height: 1, background: ED_ACCENT }} />
              <span style={{ fontFamily: ED_SANS, fontSize: 11, fontWeight: 600, color: ED_ACCENT, textTransform: 'uppercase', letterSpacing: '0.18em' }}>Thumbnail Intelligence</span>
            </div>
            <h2 style={{ fontFamily: ED_SERIF, fontSize: 'clamp(34px, 4.4vw, 54px)', fontWeight: 300, letterSpacing: '-0.01em', lineHeight: 1.08, marginBottom: 18, color: ED_INK, textWrap: 'balance' }}>Scored against the videos <em style={{ fontStyle: 'italic', color: ED_ACCENT }}>winning in your niche.</em></h2>
            <p style={{ fontFamily: ED_SANS, fontSize: 17, color: ED_SOFT, lineHeight: 1.72, marginBottom: 26 }}>Two passes on every thumbnail. An algorithm checks contrast, text clarity, faces, and composition; a vision model weighs it against the top-performing videos in your exact niche. You get a score out of 100 and a punch list of what to change before you hit publish.</p>
            {[
              'Layer 1. Algorithm, instant, free',
              'Layer 2. YTGrowth vision vs real niche benchmarks',
              'Benchmarked by velocity, recency, and channel size bracket',
              'Full history. Every thumbnail scored',
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 11 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={ED_ACCENT} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M2.5 7.2 5.4 10l6.1-6"/></svg>
                <span style={{ fontFamily: ED_SANS, fontSize: 15, color: ED_SOFT, lineHeight: 1.6 }}>{t}</span>
              </div>
            ))}
            <a href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 22, background: ED_ACCENT, color: '#fff', fontFamily: ED_SANS, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '16px 32px', textDecoration: 'none', transition: 'filter 0.18s, transform 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.06)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
            >Score my thumbnail free →</a>
            <p style={{ fontFamily: ED_SANS, fontSize: 12.5, color: ED_MUTED, marginTop: 13 }}>Layer 1 is free. No card required.</p>
          </div>
          {/* Visual. White editorial thumbnail-scoring preview. */}
          <ThumbnailPreview isMobile={isMobile} />
        </div>
      </div>

      {/* Section 4. Weekly Report */}
      <div className="section-animate" style={{ background: '#ffffff', borderTop: '1px solid ' + ED_LINE, borderBottom: '1px solid ' + ED_LINE, padding: isMobile ? '64px 24px' : '96px 48px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 44 : 72, alignItems: 'center' }}>
          {/* Visual. Left on desktop. White editorial weekly-digest preview. */}
          <div style={{ order: isMobile ? 1 : 0 }}>
            <WeeklyReportPreview isMobile={isMobile} />
          </div>
          {/* Text. Right on desktop */}
          <div style={{ order: isMobile ? 0 : 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <span aria-hidden="true" style={{ width: 26, height: 1, background: ED_ACCENT }} />
              <span style={{ fontFamily: ED_SANS, fontSize: 11, fontWeight: 600, color: ED_ACCENT, textTransform: 'uppercase', letterSpacing: '0.18em' }}>Automated Intelligence</span>
            </div>
            <h2 style={{ fontFamily: ED_SERIF, fontSize: 'clamp(34px, 4.4vw, 54px)', fontWeight: 300, letterSpacing: '-0.01em', lineHeight: 1.08, marginBottom: 18, color: ED_INK, textWrap: 'balance' }}>Your channel's weekly performance, <em style={{ fontStyle: 'italic', color: ED_ACCENT }}>in your inbox.</em></h2>
            <p style={{ fontFamily: ED_SANS, fontSize: 17, color: ED_SOFT, lineHeight: 1.72, marginBottom: 26 }}>Every Monday, one short report: what moved, your biggest win, what to watch, and the single action worth doing this week. It lands in your inbox and stays in your dashboard, even if you never open the email.</p>
            {[
              'Subscribers, views, retention, channel score',
              'Week-on-week delta on every metric',
              'One priority action per week',
              'Full history in your dashboard',
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 11 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={ED_ACCENT} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M2.5 7.2 5.4 10l6.1-6"/></svg>
                <span style={{ fontFamily: ED_SANS, fontSize: 15, color: ED_SOFT, lineHeight: 1.6 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selling point: the report compounds into a track record of wins */}
        <div style={{ maxWidth: 1160, margin: isMobile ? '52px auto 0' : '76px auto 0' }}>
          <div style={{ marginBottom: isMobile ? 26 : 34, maxWidth: 680 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span aria-hidden="true" style={{ width: 26, height: 1, background: ED_ACCENT }} />
              <span style={{ fontFamily: ED_SANS, fontSize: 11, fontWeight: 600, color: ED_ACCENT, textTransform: 'uppercase', letterSpacing: '0.18em' }}>It compounds</span>
            </div>
            <h3 style={{ fontFamily: ED_SERIF, fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 300, letterSpacing: '-0.01em', lineHeight: 1.12, color: ED_INK, textWrap: 'balance' }}>One Monday is a nudge. <em style={{ fontStyle: 'italic', color: ED_ACCENT }}>A year of them is a different channel.</em></h3>
            <p style={{ fontFamily: ED_SANS, fontSize: 16, color: ED_SOFT, lineHeight: 1.7, marginTop: 14 }}>Every report ends with one action. They stack up in your dashboard into a record of exactly what moved the needle, week after week.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 1, background: ED_LINE, border: '1px solid ' + ED_LINE }}>
            {[
              { wk: 'Mar 17', action: 'Rewrote weak intros', result: 'Retention +6%' },
              { wk: 'Mar 24', action: 'Moved uploads to Tuesday', result: 'Views +14%' },
              { wk: 'Mar 31', action: 'Tightened thumbnail text', result: 'CTR +0.7 pts' },
              { wk: 'Apr 7', action: 'Leaned into the series', result: '+124 subscribers' },
            ].map((w, i) => (
              <div key={i} style={{ background: '#fff', padding: isMobile ? '20px 22px' : '22px 24px', display: 'flex', flexDirection: 'column', gap: 11 }}>
                <span style={{ fontFamily: ED_SANS, fontSize: 10.5, fontWeight: 700, color: ED_MUTED, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Week of {w.wk}</span>
                <span style={{ fontFamily: ED_SANS, fontSize: 14.5, fontWeight: 500, color: ED_INK, lineHeight: 1.4, flex: 1 }}>{w.action}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: ED_SANS, fontSize: 12.5, fontWeight: 700, color: ED_ACCENT }}>
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8V2M2.5 4.5 5 2l2.5 2.5" /></svg>
                  {w.result}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS. Renders only when reviews.json has 3+ entries ── */}
      <Testimonials isMobile={isMobile} />

      {/* ── LATEST FROM THE BLOG. Real posts, blog order ────────────────── */}
      <div className="section-animate" style={{ background: '#f6f4ef', borderTop: '1px solid ' + ED_LINE, borderBottom: '1px solid ' + ED_LINE, padding: isMobile ? '64px 24px' : '96px 48px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: isMobile ? 32 : 44, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span aria-hidden="true" style={{ width: 26, height: 1, background: ED_ACCENT }} />
                <span style={{ fontFamily: ED_SANS, fontSize: 11, fontWeight: 600, color: ED_ACCENT, textTransform: 'uppercase', letterSpacing: '0.18em' }}>From the blog</span>
              </div>
              <h2 style={{ fontFamily: ED_SERIF, fontWeight: 300, fontSize: 'clamp(30px, 3.6vw, 44px)', letterSpacing: '-0.01em', color: ED_INK, lineHeight: 1.08, textWrap: 'balance' }}>Sharpen your edge <em style={{ fontStyle: 'italic', color: ED_ACCENT }}>between uploads.</em></h2>
            </div>
            <a href="/blog" style={{ fontFamily: ED_SANS, fontSize: 13, fontWeight: 700, color: ED_INK, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none', borderBottom: '2px solid ' + ED_ACCENT, paddingBottom: 3, whiteSpace: 'nowrap' }}>All articles →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 24 : 28 }}>
            {posts.slice(0, 3).map((p) => (
              <a key={p.slug} href={`/blog/${p.slug}`} style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', background: '#fff', border: '1px solid ' + ED_LINE, overflow: 'hidden', transition: 'transform 0.18s, box-shadow 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 18px 40px rgba(20,19,15,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ aspectRatio: '16 / 9', overflow: 'hidden', background: '#efe9df' }}>
                  {p.cover && <img src={p.cover} alt={p.title} loading="lazy" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none' }} />}
                </div>
                <div style={{ padding: isMobile ? '20px 22px 22px' : '22px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontFamily: ED_SANS, fontSize: 10.5, fontWeight: 700, color: ED_ACCENT, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{p.category?.label}</span>
                  <h3 style={{ fontFamily: ED_SERIF, fontSize: 21, fontWeight: 400, color: ED_INK, letterSpacing: '-0.3px', lineHeight: 1.18, margin: '10px 0' }}>{p.title}</h3>
                  <p style={{ fontFamily: ED_SANS, fontSize: 14, color: ED_SOFT, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 14 }}>{p.excerpt}</p>
                  <p style={{ fontFamily: ED_SANS, fontSize: 12, fontWeight: 500, color: ED_MUTED, marginTop: 'auto' }}>{formatPostDate(p.date)} · {p.readTime}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <div id="pricing" style={{ background: '#f6f4ef', borderTop: '1px solid ' + ED_LINE, borderBottom: '1px solid ' + ED_LINE, padding: isMobile ? '64px 20px' : '96px 48px', position: 'relative', overflow: 'hidden', fontFamily: ED_SANS }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="section-animate" style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <span aria-hidden="true" style={{ width: 26, height: 1, background: ED_ACCENT }} />
              <span style={{ fontFamily: ED_SANS, fontSize: 11, fontWeight: 600, color: ED_ACCENT, textTransform: 'uppercase', letterSpacing: '0.18em' }}>Pricing</span>
              <span aria-hidden="true" style={{ width: 26, height: 1, background: ED_ACCENT }} />
            </div>
            <h2 style={{ fontFamily: ED_SERIF, fontWeight: 300, fontSize: 'clamp(34px, 4.4vw, 54px)', letterSpacing: '-0.01em', color: ED_INK, lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>One good video idea <em style={{ fontStyle: 'italic', color: ED_ACCENT }}>pays for a year.</em></h2>
            <p style={{ fontFamily: ED_SANS, fontSize: 17, color: ED_SOFT, lineHeight: 1.72, maxWidth: 640, margin: '0 auto' }}>The best YouTube tools for creators in one suite. AI-powered analysis across 5 tools that finds what's working in your niche, then tells you how to do more of it.</p>
          </div>

          {/* Tab switcher */}
          <div style={{ overflowX: isMobile ? 'auto' : 'visible', marginBottom: isMobile ? 32 : 48, display: 'flex', justifyContent: isMobile ? 'flex-start' : 'center', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', paddingLeft: isMobile ? 20 : 0 }}>
            <div style={{ display: 'inline-flex', background: '#efece4', border: '1px solid rgba(20,19,15,0.10)', borderRadius: 0, padding: 4, gap: 2, flexWrap: 'nowrap', flexShrink: 0, margin: isMobile ? '0 auto' : undefined }}>
              {[
                ['subscription', 'Subscription'],
                ['lifetime',     'Lifetime'],
                ['founder',      isMobile ? 'Bundles' : 'Founder Bundles'],
                ['packs',        isMobile ? 'Packs' : 'Analysis Packs'],
              ].map(([val, label]) => (
                <button key={val} onClick={() => setPricingTab(val)} style={{
                  padding: '9px 18px', borderRadius: 0, border: 'none', cursor: 'pointer',
                  fontFamily: ED_SANS, fontSize: isMobile ? 11 : 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                  background: pricingTab === val ? '#14130f' : 'transparent',
                  color: pricingTab === val ? '#fff' : '#8a8378',
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* ── SUBSCRIPTION ── (Monthly + Annual collapsed; cycle lives per-card) */}
          {pricingTab === 'subscription' && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 14, maxWidth: isMobile ? 480 : '100%', margin: '0 auto' }}>
              {/* Free. No toggle (no cycle to choose) */}
              <div className="ytg-pricing-card">
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Free</p>
                <p style={{ fontFamily: ED_SERIF, fontWeight: 400, fontSize: 46, letterSpacing: '-1px', color: ED_INK, lineHeight: 1, marginBottom: 4 }}>$0</p>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>5 free analyses</p>
                <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>Full access to our best features, then upgrade</p>
                {['Full channel audit (first one free)', '5 analyses to spend on the tools below', 'Outliers, find proven winning videos', 'Competitor Analysis (1 rival)', 'SEO Studio (full)'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text-2)' }}>{f}</span></div>
                ))}
                <div style={{ borderTop: '1px solid rgba(10,10,15,0.07)', marginTop: 6, paddingTop: 12 }}>
                  <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', lineHeight: 1.6, margin: 0 }}>Paid only: Keyword Explorer, Thumbnail IQ, Title Optimizer, Video Ideas, Autopsy, weekly reports.</p>
                </div>
                <a href="/auth/login" className="ytg-btn-ghost" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Start free</a>
              </div>

              {/* Solo. Per-card cycle toggle */}
              {(() => {
                const yr = cycle.solo === 'yearly'
                return (
                  <div className="ytg-pricing-card">
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Solo</p>
                    <CycleToggle value={cycle.solo} onChange={v => setCycle(c => ({ ...c, solo: v }))} />
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 2 }}>
                      <p style={{ fontFamily: ED_SERIF, fontWeight: 400, fontSize: 46, letterSpacing: '-1px', color: ED_INK, lineHeight: 1 }}>{yr ? '$190' : '$19'}</p>
                      <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 7 }}>{yr ? '/year' : '/mo'}</p>
                    </div>
                    {yr ? (
                      <>
                        <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 2 }}>$15.83 / month equivalent</p>
                        <p style={{ fontFamily: ED_SANS, fontSize: 12.5, fontWeight: 700, color: ED_ACCENT, marginBottom: 22 }}>You save $38</p>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>20 analyses/month</p>
                        <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>Built for solo creators who post consistently</p>
                      </>
                    )}
                    {['Full channel audit (up to 3 channels)', '20 AI analyses/month', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer', 'Video Ideas', 'Competitor Analysis (up to 2 rivals)', 'Thumbnail IQ (standard credits)'].map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text-2)' }}>{f}</span></div>
                    ))}
                    <button onClick={() => openCheckout(yr ? 'solo_annual' : 'solo_monthly')} className="ytg-btn-ghost" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>{yr ? 'Commit to Solo' : 'Get Solo'}</button>
                  </div>
                )
              })()}

              {/* Growth. Featured, per-card cycle toggle */}
              {(() => {
                const yr = cycle.growth === 'yearly'
                return (
                  <div className="ytg-pricing-card-featured">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Growth</p>
                      <span style={{ fontFamily: ED_SANS, fontSize: 10, fontWeight: 700, color: '#fff', background: ED_ACCENT, padding: '4px 9px', borderRadius: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{yr ? 'Best value' : 'Most popular'}</span>
                    </div>
                    <CycleToggle value={cycle.growth} onChange={v => setCycle(c => ({ ...c, growth: v }))} />
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 2 }}>
                      <p style={{ fontFamily: ED_SERIF, fontWeight: 400, fontSize: 46, letterSpacing: '-1px', color: ED_INK, lineHeight: 1 }}>{yr ? '$490' : '$49'}</p>
                      <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 7 }}>{yr ? '/year' : '/mo'}</p>
                    </div>
                    {yr ? (
                      <>
                        <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 2 }}>$40.83 / month equivalent</p>
                        <p style={{ fontFamily: ED_SANS, fontSize: 12.5, fontWeight: 700, color: ED_ACCENT, marginBottom: 22 }}>You save $98</p>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>50 analyses/month</p>
                        <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>Built for creators serious about hitting 100k</p>
                      </>
                    )}
                    {['Full channel audit (up to 5 channels)', '50 AI analyses/month', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer', 'Video Ideas', 'Competitor Analysis (up to 5 rivals)', 'Thumbnail IQ (increased credits)', 'Weekly report emails'].map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text)' }}>{f}</span></div>
                    ))}
                    <button onClick={() => openCheckout(yr ? 'growth_annual' : 'growth_monthly')} className="ytg-btn-primary" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>{yr ? 'Commit to Growth' : 'Get Growth'}</button>
                  </div>
                )
              })()}

              {/* Agency. Per-card cycle toggle */}
              {(() => {
                const yr = cycle.agency === 'yearly'
                return (
                  <div className="ytg-pricing-card">
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Agency</p>
                    <CycleToggle value={cycle.agency} onChange={v => setCycle(c => ({ ...c, agency: v }))} />
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 2 }}>
                      <p style={{ fontFamily: ED_SERIF, fontWeight: 400, fontSize: yr ? 38 : 46, letterSpacing: '-1px', color: ED_INK, lineHeight: 1 }}>{yr ? '$1,490' : '$149'}</p>
                      <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 7 }}>{yr ? '/year' : '/mo'}</p>
                    </div>
                    {yr ? (
                      <>
                        <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 2 }}>$124.17 / month equivalent</p>
                        <p style={{ fontFamily: ED_SANS, fontSize: 12.5, fontWeight: 700, color: ED_ACCENT, marginBottom: 22 }}>You save $298</p>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>150 analyses/month</p>
                        <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>Built for agencies and multi-channel operators</p>
                      </>
                    )}
                    {['Full channel audit (up to 10 channels, pooled)', '150 AI analyses/month', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer', 'Video Ideas', 'Competitor Analysis (up to 10 rivals)', 'Thumbnail IQ (maximum credits)', 'Weekly reports + priority support'].map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text-2)' }}>{f}</span></div>
                    ))}
                    <button onClick={() => openCheckout(yr ? 'agency_annual' : 'agency_monthly')} className="ytg-btn-ghost" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>{yr ? 'Commit to Agency' : 'Get Agency'}</button>
                  </div>
                )
              })()}
            </div>
          )}

          {/* ── LIFETIME ── */}
          {pricingTab === 'lifetime' && (
            <div>
              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 36, lineHeight: 1.8 }}>
                Pay once. Get the monthly analyses forever. Limited to the first <strong style={{ color: 'var(--ytg-text)' }}>500 buyers</strong>. After that, this page goes away.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 14, maxWidth: isMobile ? 480 : '100%', margin: '0 auto' }}>
                <div className="ytg-pricing-card" style={{ padding: '36px 32px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Lifetime Solo</p>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 18, lineHeight: 1.6 }}>Pay once. Keep the analyses coming, forever.</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                    <p style={{ fontFamily: ED_SERIF, fontWeight: 400, fontSize: 52, letterSpacing: '-1px', color: ED_INK, lineHeight: 1 }}>$149</p>
                    <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>one-time</p>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>Equivalent to ~8 months of Solo</p>
                  <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>Worth $456 over 2 years of subscription</p>
                  {['Full channel audit (up to 3 channels)', '20 AI analyses/month. Forever', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer', 'Video Ideas', 'Competitor Analysis (up to 2 rivals)', 'Thumbnail IQ (standard credits)', 'One-time payment, no subscription'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text-2)' }}>{f}</span></div>
                  ))}
                  <p style={{ fontFamily: ED_SANS, fontSize: 12, color: ED_ACCENT, fontWeight: 700, marginTop: 18, marginBottom: 12 }}>Only 500 available. Limited spots</p>
                  <button onClick={() => openCheckout('solo_lifetime')} className="ytg-btn-ghost" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>Lock In Lifetime Access</button>
                </div>

                <div className="ytg-pricing-card-featured" style={{ padding: '36px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Lifetime Growth</p>
                    <span style={{ fontFamily: ED_SANS, fontSize: 10, fontWeight: 700, color: '#fff', background: ED_ACCENT, padding: '4px 9px', borderRadius: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Best deal</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 18, lineHeight: 1.6 }}>Pay once. Keep the analyses coming, forever.</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                    <p style={{ fontFamily: ED_SERIF, fontWeight: 400, fontSize: 52, letterSpacing: '-1px', color: ED_INK, lineHeight: 1 }}>$349</p>
                    <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>one-time</p>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>Equivalent to ~7 months of Growth</p>
                  <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>Worth $1,176 over 2 years of subscription</p>
                  {['Full channel audit (up to 5 channels)', '50 AI analyses/month. Forever', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer', 'Video Ideas', 'Competitor Analysis (up to 5 rivals)', 'Thumbnail IQ (increased credits)', 'Weekly report emails', 'One-time payment, no subscription'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text)' }}>{f}</span></div>
                  ))}
                  <p style={{ fontFamily: ED_SANS, fontSize: 12, color: ED_ACCENT, fontWeight: 700, marginTop: 18, marginBottom: 12 }}>Only 500 available. Limited spots</p>
                  <button onClick={() => openCheckout('growth_lifetime')} className="ytg-btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>Lock In Lifetime Access</button>
                </div>

                <div className="ytg-pricing-card" style={{ padding: '36px 32px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Lifetime Agency</p>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 18, lineHeight: 1.6 }}>Pay once. Manage your whole roster of channels, forever.</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                    <p style={{ fontFamily: ED_SERIF, fontWeight: 400, fontSize: 52, letterSpacing: '-1px', color: ED_INK, lineHeight: 1 }}>$897</p>
                    <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>one-time</p>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>Equivalent to ~6 months of Agency</p>
                  <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>Worth $3,576 over 2 years of subscription</p>
                  {['Full channel audit (up to 10 channels, pooled)', '150 AI analyses/month. Forever', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer', 'Video Ideas', 'Competitor Analysis (up to 10 rivals)', 'Thumbnail IQ (maximum credits)', 'Weekly reports + priority support', 'One-time payment, no subscription'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text-2)' }}>{f}</span></div>
                  ))}
                  <p style={{ fontFamily: ED_SANS, fontSize: 12, color: ED_ACCENT, fontWeight: 700, marginTop: 18, marginBottom: 12 }}>Only 500 available. Limited spots</p>
                  <button onClick={() => openCheckout('agency_lifetime')} className="ytg-btn-ghost" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>Lock In Lifetime Access</button>
                </div>
              </div>
            </div>
          )}

          {/* ── FOUNDER BUNDLES ── */}
          {pricingTab === 'founder' && (
            <div>
              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 36, lineHeight: 1.8 }}>
                The all-in option. Lifetime access plus a bonus stack of analyses to hit the ground running. For the early believers.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 14, maxWidth: isMobile ? 480 : '100%', margin: '0 auto' }}>
                <div className="ytg-pricing-card" style={{ padding: '36px 32px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Founder Solo</p>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 18, lineHeight: 1.6 }}>Pay once, grow forever, start with ammo loaded.</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                    <p style={{ fontFamily: ED_SERIF, fontWeight: 400, fontSize: 52, letterSpacing: '-1px', color: ED_INK, lineHeight: 1 }}>$169</p>
                    <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>one-time</p>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 2 }}>Lifetime Solo + 60 bonus analyses</p>
                  <p style={{ fontFamily: ED_SANS, fontSize: 12.5, fontWeight: 700, color: ED_ACCENT, marginBottom: 22 }}>You're getting $190+ in value</p>
                  {['Full channel audit (up to 3 channels)', '20 AI analyses/month. Forever', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer', 'Video Ideas', 'Competitor Analysis (up to 2 rivals)', 'Thumbnail IQ (standard credits)', '+60 bonus analyses, on us. Never expire'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text-2)' }}>{f}</span></div>
                  ))}
                  <button onClick={() => openCheckout('founder_solo')} className="ytg-btn-ghost" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Become a Founder</button>
                </div>

                <div className="ytg-pricing-card-featured" style={{ padding: '36px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Founder Growth</p>
                    <span style={{ fontFamily: ED_SANS, fontSize: 10, fontWeight: 700, color: '#fff', background: ED_ACCENT, padding: '4px 9px', borderRadius: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Most popular</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 18, lineHeight: 1.6 }}>Pay once, grow forever, start with ammo loaded.</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                    <p style={{ fontFamily: ED_SERIF, fontWeight: 400, fontSize: 52, letterSpacing: '-1px', color: ED_INK, lineHeight: 1 }}>$389</p>
                    <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>one-time</p>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 2 }}>Lifetime Growth + 75 bonus analyses</p>
                  <p style={{ fontFamily: ED_SANS, fontSize: 12.5, fontWeight: 700, color: ED_ACCENT, marginBottom: 22 }}>You're getting $490+ in value</p>
                  {['Full channel audit (up to 5 channels)', '50 AI analyses/month. Forever', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer + Video Ideas', 'Competitor Analysis (up to 5 rivals)', 'Thumbnail IQ (increased credits)', 'Weekly report emails', '+75 bonus analyses, on us. Never expire'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text)' }}>{f}</span></div>
                  ))}
                  <button onClick={() => openCheckout('founder_growth')} className="ytg-btn-primary" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Become a Founder</button>
                </div>

                <div className="ytg-pricing-card" style={{ padding: '36px 32px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Founder Agency</p>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 18, lineHeight: 1.6 }}>Pay once, grow your whole roster, start with ammo loaded.</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                    <p style={{ fontFamily: ED_SERIF, fontWeight: 400, fontSize: 52, letterSpacing: '-1px', color: ED_INK, lineHeight: 1 }}>$949</p>
                    <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>one-time</p>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 2 }}>Lifetime Agency + 150 bonus analyses</p>
                  <p style={{ fontFamily: ED_SANS, fontSize: 12.5, fontWeight: 700, color: ED_ACCENT, marginBottom: 22 }}>You're getting $1,100+ in value</p>
                  {['Full channel audit (up to 10 channels, pooled)', '150 AI analyses/month. Forever', 'SEO Studio (full)', 'Keyword Explorer (full)', 'Title Optimizer + Video Ideas', 'Competitor Analysis (up to 10 rivals)', 'Thumbnail IQ (maximum credits)', 'Weekly reports + priority support', '+150 bonus analyses, on us. Never expire'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text-2)' }}>{f}</span></div>
                  ))}
                  <button onClick={() => openCheckout('founder_agency')} className="ytg-btn-ghost" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Become a Founder</button>
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYSIS PACKS ── */}
          {pricingTab === 'packs' && (
            <div>
              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 36, lineHeight: 1.8 }}>
                No subscription needed. Buy a pack, run analyses whenever you want. They never expire and work across all tools.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 14, marginBottom: 20, maxWidth: isMobile ? 480 : '100%', margin: isMobile ? '0 auto 20px' : '0 0 20px' }}>
                <div className="ytg-pricing-card" style={{ padding: '36px 32px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Quick Boost</p>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 18, lineHeight: 1.6 }}>A top-up when you run low mid-sprint.</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                    <p style={{ fontFamily: ED_SERIF, fontWeight: 400, fontSize: 52, letterSpacing: '-1px', color: ED_INK, lineHeight: 1 }}>$15</p>
                    <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>one-time</p>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>20 AI analyses</p>
                  <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>$0.75 per analysis</p>
                  {['20 AI analyses, yours to keep', 'Works with any plan. Or no plan', 'Use across all tools', 'Stack on top of your monthly allowance', 'Never expire'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text-2)' }}>{f}</span></div>
                  ))}
                  <button onClick={() => openCheckout('pack_20')} className="ytg-btn-ghost" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Buy Analyses</button>
                </div>

                <div className="ytg-pricing-card-featured" style={{ padding: '36px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Power Pack</p>
                    <span style={{ fontFamily: ED_SANS, fontSize: 10, fontWeight: 700, color: '#fff', background: ED_ACCENT, padding: '4px 9px', borderRadius: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Most popular</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 18, lineHeight: 1.6 }}>Two solid months of deep dives.</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                    <p style={{ fontFamily: ED_SERIF, fontWeight: 400, fontSize: 52, letterSpacing: '-1px', color: ED_INK, lineHeight: 1 }}>$42</p>
                    <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>one-time</p>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>60 AI analyses</p>
                  <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>$0.70 per analysis</p>
                  {['60 AI analyses, yours to keep', 'Works with any plan. Or no plan', 'Use across all tools', 'Stack on top of your monthly allowance', 'Never expire'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text)' }}>{f}</span></div>
                  ))}
                  <button onClick={() => openCheckout('pack_60')} className="ytg-btn-primary" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Buy Analyses</button>
                </div>

                <div className="ytg-pricing-card" style={{ padding: '36px 32px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Full Arsenal</p>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', marginBottom: 18, lineHeight: 1.6 }}>Go deep. Analyse everything. Leave nothing unturned.</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                    <p style={{ fontFamily: ED_SERIF, fontWeight: 400, fontSize: 52, letterSpacing: '-1px', color: ED_INK, lineHeight: 1 }}>$99</p>
                    <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 8 }}>one-time</p>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 4 }}>150 AI analyses</p>
                  <p style={{ fontSize: 12, color: 'var(--ytg-text-4)', marginBottom: 22 }}>$0.66 per analysis</p>
                  {['150 AI analyses, yours to keep', 'Works with any plan. Or no plan', 'Use across all tools', 'Stack on top of your monthly allowance', 'Never expire'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><Check /><span style={{ fontSize: 14, color: 'var(--ytg-text-2)' }}>{f}</span></div>
                  ))}
                  <button onClick={() => openCheckout('pack_150')} className="ytg-btn-ghost" style={{ marginTop: 22, width: '100%', justifyContent: 'center', display: 'flex' }}>Buy Analyses</button>
                </div>
              </div>
              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ytg-text-3)', lineHeight: 1.8 }}>
                Pack analyses never expire and work across all tools. Subscribe later and your pack analyses stack on top of your monthly allowance.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <div id="faq" style={{ background: '#ffffff', borderTop: '1px solid ' + ED_LINE, borderBottom: '1px solid ' + ED_LINE, padding: isMobile ? '64px 20px' : '96px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '340px 1fr', gap: isMobile ? 40 : 88, alignItems: 'start' }}>
          {/* Header column */}
          <div style={{ textAlign: isMobile ? 'center' : 'left', position: isMobile ? 'static' : 'sticky', top: 100 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 18, justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <span aria-hidden="true" style={{ width: 26, height: 1, background: ED_ACCENT }} />
              <span style={{ fontFamily: ED_SANS, fontSize: 11, fontWeight: 600, color: ED_ACCENT, textTransform: 'uppercase', letterSpacing: '0.18em' }}>Frequently asked</span>
            </div>
            <h2 style={{ fontFamily: ED_SERIF, fontWeight: 300, fontSize: 'clamp(34px, 4.4vw, 54px)', letterSpacing: '-0.01em', color: ED_INK, lineHeight: 1.06, marginBottom: 14, textWrap: 'balance' }}>
              Questions <em style={{ fontStyle: 'italic', color: ED_ACCENT }}>answered.</em>
            </h2>
            <p style={{ fontFamily: ED_SANS, fontSize: 15, color: ED_SOFT, lineHeight: 1.7, margin: 0, maxWidth: isMobile ? 520 : 320, marginLeft: isMobile ? 'auto' : 0, marginRight: isMobile ? 'auto' : 0 }}>
              Everything you want to know before you decide. Still unsure? <a href="/contact" style={{ color: ED_ACCENT, fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
            </p>
          </div>

          {/* FAQ list */}
          <div style={{ borderTop: '1px solid ' + ED_LINE }}>
            {[
              { q: 'Is YTGrowth worth it when my channel is under 1,000 subscribers?', a: "Especially then. The smaller your channel, the higher the leverage of a single good decision. Right title, right topic, right timing. You can't afford to guess when you're getting 200 views a video." },
              { q: 'What happens when I run out of AI analyses before my month resets?', a: "Your features pause until your monthly analyses refill on the 1st, or until you grab a top-up pack. You'll see a warning banner at 80% so you're never surprised mid-sprint." },
              { q: 'How is YTGrowth different from TubeBuddy or VidIQ, exactly?', a: "TubeBuddy and VidIQ show you dashboards and data. YTGrowth runs the actual AI analysis. Competitor gaps, keyword intent, title variants. And hands you the conclusion, not the raw numbers." },
              { q: 'Can I cancel or change my subscription at any time?', a: "Yes. Monthly is month-to-month. Cancel whenever. Annual gives you the rest of your year. No cancellation fees, no guilt-trip retention email. Just done." },
              { q: 'Do unused monthly analyses roll over to the following month?', a: "Monthly included analyses reset every month. Use them or lose them. But top-up pack analyses never expire and never reset. They sit in your account until you need them." },
              { q: 'Can I purchase and use analysis packs without a subscription plan?', a: "Yes. Packs work standalone. Buy a pack, run analyses, no subscription required. If you have analyses, you have full access. Subscribe later and your pack analyses stack on top." },
              { q: 'Is the lifetime deal truly lifetime, and what happens if you shut down?', a: "If we shut down, you get a pro-rated refund based on time remaining against a 5-year expected lifespan. We're also small enough that your lifetime deal revenue genuinely helps us stay running. You're part of the bet." },
              { q: 'Can I manage and analyze multiple client channels on the agency plan?', a: "Yes. Agency supports up to 10 channels (5 on lifetime agency deals) with pooled analyses. You run the analyses, you own the insights, your clients see the results." },
            ].map((item, i) => {
              const isOpen = openFaq === i
              const num = String(i + 1).padStart(2, '0')
              return (
                <div key={i} style={{ borderBottom: '1px solid ' + ED_LINE, position: 'relative' }}>
                  {isOpen && (
                    <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 2, background: ED_ACCENT }} />
                  )}
                  <div
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenFaq(isOpen ? null : i) } }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: isMobile ? 14 : 18,
                      padding: isMobile ? '20px 0' : '22px 0',
                      paddingLeft: isOpen ? (isMobile ? 16 : 22) : 0,
                      cursor: 'pointer',
                      transition: 'padding-left 0.25s ease',
                      userSelect: 'none',
                    }}
                  >
                    <span style={{
                      fontFamily: ED_SANS,
                      fontSize: 12, fontWeight: 700,
                      color: isOpen ? ED_ACCENT : ED_MUTED,
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1.6, flexShrink: 0,
                      width: isMobile ? 22 : 28,
                      paddingTop: isMobile ? 3 : 4,
                      transition: 'color 0.2s',
                    }}>{num}</span>
                    <span style={{
                      flex: 1,
                      fontFamily: ED_SERIF,
                      fontSize: isMobile ? 18 : 20, fontWeight: 400,
                      color: isOpen ? ED_ACCENT : ED_INK,
                      lineHeight: 1.3, letterSpacing: '-0.2px',
                      transition: 'color 0.2s',
                    }}>{item.q}</span>
                    <span aria-hidden="true" style={{
                      flexShrink: 0, fontFamily: ED_SANS,
                      fontSize: 26, fontWeight: 300, color: ED_ACCENT, lineHeight: 1,
                      marginTop: isMobile ? 1 : 3,
                      transform: isOpen ? 'rotate(45deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}>+</span>
                  </div>
                  <div className={`ytg-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="ytg-faq-answer-inner">
                      <div style={{ paddingLeft: isMobile ? 36 : 46, paddingRight: isMobile ? 20 : 40, paddingBottom: isMobile ? 22 : 26, paddingTop: 0 }}>
                        <p style={{ fontFamily: ED_SANS, fontSize: isMobile ? 14.5 : 15, color: ED_SOFT, lineHeight: 1.75, margin: 0 }}>{item.a}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <LandingFooter />

    </div>
  )
}
