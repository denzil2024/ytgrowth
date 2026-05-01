import { useEffect, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'

/* Outliers — fully custom landing page.
 *
 * Built around the *actual* product (see app/outliers.py + routers/
 * outliers_routes.py): a unified search that returns videos + breakout
 * channels + thumbnail patterns in one payload. Outlier score = views per
 * subscriber divided by the niche cohort median. Hard floor at 1.8x. Niche
 * matching scans each candidate channel's recent uploads against the user's
 * niche keywords. Last 12 months only. Niche-relative views floor (5% of
 * niche median). One Claude call returns why_worked + quick_actions[3] +
 * why_now per video, and why_this_channel + what_to_do[3] + why_now per
 * breakout channel. Plus _analyze_thumbnail_patterns surfaces visual
 * patterns shared across the winning thumbnails.
 *
 * Target keywords: "youtube outlier finder", "find viral videos in your
 * niche", "youtube viral video tool", "videos that overperformed".
 *
 * Background rhythm matches Landing.jsx and the other feature pages:
 * white > dark > light > dark > white > dark > light > dark > white > light.
 * Classes use the .otl- prefix.
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
    if (document.getElementById('otl-styles')) return
    const link = document.createElement('link')
    link.id = 'otl-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'otl-styles'
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

      .otl-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--ytg-accent); color: #fff; font-size: 15px; font-weight: 700; padding: 15px 30px; border-radius: 100px; border: none; cursor: pointer; text-decoration: none; letter-spacing: -0.2px; box-shadow: 0 1px 2px rgba(0,0,0,0.14), 0 4px 20px rgba(229,48,42,0.34); transition: filter 0.18s, transform 0.18s, box-shadow 0.18s; font-family: 'Inter', system-ui, sans-serif; }
      .otl-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,0.16), 0 12px 36px rgba(229,48,42,0.42); }
      .otl-btn-lg { font-size: 16px; padding: 17px 38px; }
      .otl-btn-ghost { display: inline-flex; align-items: center; gap: 8px; background: var(--ytg-card); color: var(--ytg-text-2); font-size: 15px; font-weight: 600; padding: 14px 26px; border-radius: 100px; border: 1px solid var(--ytg-border); cursor: pointer; text-decoration: none; letter-spacing: -0.2px; box-shadow: var(--ytg-shadow-sm); transition: color 0.15s, box-shadow 0.18s; font-family: 'Inter', system-ui, sans-serif; }
      .otl-btn-ghost:hover { color: var(--ytg-text); box-shadow: var(--ytg-shadow); }

      .otl-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 5px 13px; border-radius: 100px; margin-bottom: 16px; }
      .otl-eyebrow.light { color: var(--ytg-accent-text); background: var(--ytg-accent-light); }
      .otl-eyebrow.dark  { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); }

      .otl-h1 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -2px; line-height: 1.05; text-wrap: balance; }
      .otl-h2 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -1.4px; line-height: 1.08; text-wrap: balance; }

      .otl-nav-link { font-size: 14px; color: var(--ytg-text-3); font-weight: 500; text-decoration: none; transition: color 0.15s; letter-spacing: -0.1px; }
      .otl-nav-link:hover { color: var(--ytg-text-2); }

      .otl-faq-item { border-bottom: 1px solid var(--ytg-border); }
      .otl-faq-q { background: none; border: none; cursor: pointer; width: 100%; text-align: left; padding: 22px 0; font-family: inherit; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; font-size: 16.5px; font-weight: 700; color: var(--ytg-text); letter-spacing: -0.2px; line-height: 1.45; }
      .otl-faq-q:hover { color: var(--ytg-accent); }
      .otl-faq-icon { transition: transform 0.2s; flex-shrink: 0; color: var(--ytg-text-3); margin-top: 4px; }
      .otl-faq-icon.open { transform: rotate(45deg); color: var(--ytg-accent); }
      .otl-faq-a { font-size: 14.5px; color: var(--ytg-text-2); line-height: 1.78; padding: 0 0 22px 0; max-width: 760px; }

      @media (max-width: 900px) {
        .otl-grid-2 { grid-template-columns: 1fr !important; gap: 32px !important; }
        .otl-grid-3 { grid-template-columns: 1fr !important; }
        .otl-grid-4 { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 600px) {
        .otl-grid-4 { grid-template-columns: 1fr !important; }
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
  { href: '/features/outliers',            label: 'Outliers',            desc: 'Find viral videos and breakout channels' },
]

function FeaturesDropdown() {
  const [open, setOpen] = useState(false)
  return (
    <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} style={{ position: 'relative' }}>
      <a href="/#features" className="otl-nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
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
    <div className="otl-faq-item">
      <button className="otl-faq-q" onClick={() => setOpen(o => !o)}>
        <span style={{ flex: 1 }}>{q}</span>
        <span className={`otl-faq-icon${open ? ' open' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M8 2v12M2 8h12"/></svg>
        </span>
      </button>
      {open && <div className="otl-faq-a">{a}</div>}
    </div>
  )
}

/* ── Visual: Outlier video card with score + why-worked + actions ─────── */
function OutlierVideoVisual() {
  return (
    <div style={{ background: '#111114', borderRadius: 18, border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 48px rgba(0,0,0,0.6)', padding: 26 }}>
      {/* Thumbnail + title row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 124, height: 70, borderRadius: 8, background: 'linear-gradient(135deg, #4a7cf7 0%, #ff3b30 70%, #f59e0b 100%)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: 5, left: 6, right: 6, fontSize: 9, fontWeight: 800, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.6)', letterSpacing: '-0.3px' }}>I QUIT MY 9–5 IN 30 DAYS</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', fontWeight: 600, letterSpacing: '-0.1px', marginBottom: 4, lineHeight: 1.4 }}>
            I quit my 9–5 in 30 days | Real numbers
          </p>
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
            CreatorMike · 8.2K subs · 3 weeks ago · 142K views
          </p>
        </div>
      </div>
      {/* Outlier score row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '12px 14px', background: 'rgba(229,48,42,0.08)', border: '1px solid rgba(229,48,42,0.28)', borderRadius: 10 }}>
        <div>
          <p style={{ fontSize: 9.5, fontWeight: 800, color: '#ff3b30', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>Outlier score</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>17.3</span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>×</span>
          </div>
        </div>
        <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)' }} />
        <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
          17× the normal views-per-subscriber for this niche cohort. Top tier.
        </p>
      </div>
      {/* Why worked */}
      <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Why it worked</p>
      <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, marginBottom: 14 }}>
        First-person quit story with a 30-day timeline plus the words "real numbers" — promises receipts, not motivational fluff.
      </p>
      {/* Quick actions */}
      <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Quick actions</p>
      {[
        'Open with the moment you said "I’m quitting"',
        'Show one real spreadsheet on screen in the first 30s',
        'Title the next vlog "Day 1 after quitting | Real numbers"',
      ].map((a, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#4ade80', flexShrink: 0, marginTop: 3 }}>0{i + 1}</span>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.78)', lineHeight: 1.55 }}>{a}</p>
        </div>
      ))}
      {/* Why now */}
      <div style={{ borderLeft: '3px solid #f59e0b', background: 'rgba(245,158,11,0.07)', borderRadius: 8, padding: '10px 12px', marginTop: 14 }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: '#f59e0b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Why now</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.78)', lineHeight: 1.55 }}>
          The "quit my job" angle is climbing in the last 30 days — three other channels just shipped variants that hit 50K+ views.
        </p>
      </div>
    </div>
  )
}

/* ── Visual: Breakout channel card stack ──────────────────────────────── */
function BreakoutChannelsVisual() {
  const channels = [
    { name: 'CreatorMike',    subs: '8.2K',  outlier: '17.3×', why: 'Same niche as you · last 4 videos all 10×+ views',         color: '#ff3b30' },
    { name: 'IndieFilmHub',   subs: '14K',   outlier: '9.1×',  why: 'Just pivoted topics 6 weeks ago · velocity ramping fast',  color: '#f59e0b' },
    { name: 'TheLowFi Studio', subs: '24K',  outlier: '6.7×',  why: 'Posts twice your cadence · most uploads 5×+ views',        color: '#4a7cf7' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {channels.map((c, i) => (
        <div key={i} style={{ background: '#111114', borderRadius: 14, border: '1px solid rgba(255,255,255,0.09)', borderLeft: `3px solid ${c.color}`, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>{c.name[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>{c.name}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{c.subs} subs · in your exact niche</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: 9.5, fontWeight: 800, color: c.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Outlier</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>{c.outlier}</p>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            <span style={{ color: c.color, fontWeight: 700 }}>Why this channel: </span>{c.why}
          </p>
        </div>
      ))}
    </div>
  )
}

/* ── 3 tabs the unified search returns ─────────────────────────────────── */
const RESULT_TABS = [
  { name: 'Outlier Videos',     count: 'top 8', what: 'Recent niche videos that pulled 1.8× the normal views-per-subscriber for the cohort. Each one carries an outlier score, an AI-written "why it worked", three quick actions you can ship today, and a "why now" tying it to a current momentum signal.' },
  { name: 'Breakout Channels',  count: 'top 8', what: 'Channels in your niche whose recent uploads are systematically over-performing. The score is calculated the same way (views per sub vs cohort median), but at the channel level. Includes "what to do" — three moves you can borrow from their playbook.' },
  { name: 'Thumbnail Patterns', count: 'top 8', what: 'Visual patterns shared across the winning thumbnails — common color palettes, face vs no-face split, text density bands, composition repeats. Tells you what the niche feed already looks like so your next thumbnail can lean into it or break it.' },
]

const PIPELINE_OUTPUTS = [
  { icon: 'sparkle', title: 'Outlier score (1.8× minimum)',    body: 'Views-per-subscriber divided by the niche cohort median. Normalizes channel size — a 50K-view video on a 10K channel scores higher than a 200K-view video on a 2M channel. Hard floor at 1.8×.' },
  { icon: 'why',     title: 'AI-written "why it worked"',       body: 'One sentence per video naming the exact hook, angle, or pattern that made it overperform. References specific title phrasing or format. Never generic — "first-person quit story with timeline" beats "good thumbnail".' },
  { icon: 'play',    title: 'Three quick actions per video',    body: 'Imperative-voice steps you can ship today. Specific ("Open with a 3-second before/after shot") not vague ("make a better hook"). Each action ≤ 14 words so it fits in your daily checklist.' },
  { icon: 'pulse',   title: '"Why now" urgency tag',            body: 'A current-momentum signal explaining why acting on this is urgent right now. References recency, rising trends, seasonal timing, or audience gaps the data shows. Never "this is a hot topic".' },
  { icon: 'rocket',  title: 'Breakout channel report',          body: 'Top 8 niche channels whose recent uploads are systematically over-performing. Each comes with subscribers, average views, outlier score, and three "what to do" actions you can borrow from them.' },
  { icon: 'palette', title: 'Thumbnail pattern analysis',       body: 'Visual patterns shared across the winning thumbnails — color palette, face presence, text density, composition repeats. Tells you what the niche feed actually looks like.' },
  { icon: 'cache',   title: 'Saved per-channel — reopen anytime', body: 'Every search persists per channel and rehydrates with the full payload (videos + channels + thumbnails). Re-open a search week later, same data, no second credit charge.' },
]

const ICON_PATHS = {
  sparkle: 'M8 1l1.5 5L14 7.5l-4.5 1.5L8 15l-1.5-6L2 7.5l4.5-1z',
  why:     'M8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12M8 6v3M8 11.5h.01',
  play:    'M3 2v12l10-6z',
  pulse:   'M1 8h3l2-5 4 10 2-5h3',
  rocket:  'M11 1a7 7 0 0 0-7 7l1 4 4 1 7-7zM4 11l-2 4 4-2',
  palette: 'M8 1a7 7 0 0 0 0 14h2a2 2 0 0 0 0-4 2 2 0 1 1 0-4h3A7 7 0 0 0 8 1M5 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2M11 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
  cache:   'M2 4c0-1 3-2 6-2s6 1 6 2-3 2-6 2-6-1-6-2zM2 4v8c0 1 3 2 6 2s6-1 6-2V4M2 8c0 1 3 2 6 2s6-1 6-2',
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
  { plan: 'Free',    runs: '0',   note: 'Not included on free tier — Outliers is paid-only' },
  { plan: 'Solo',    runs: '6',   note: 'Each search returns videos + channels + thumbnails (3 reports)' },
  { plan: 'Growth',  runs: '16',  note: '50 credits / month, 3 credits per Outliers search · 5 channels' },
  { plan: 'Agency',  runs: '50',  note: 'Pooled across 10 channels · 150 credits / month' },
]

const FAQS = [
  {
    q: 'What exactly is an "outlier video"?',
    a: <>A video that pulled significantly more views than normal for its channel size. Specifically: the outlier score is the video’s views-per-subscriber divided by the cohort median for the niche. So a 50K-view video on a 10K-subscriber channel hits 5.0× the cohort median — that’s a big outlier, signaling either a new trend, a fresh angle, or a thumbnail/title that’s breaking through. We only surface scores ≥ 1.8× and we drop the channel-size noise so a giant channel’s "okay" video doesn’t crowd the list.</>,
  },
  {
    q: 'How is this different from "trending" or "most viewed" lists?',
    a: <>Trending shows what’s big <i>everywhere</i>, dominated by mega-channels. Most-viewed is biased toward old viral hits and giant audiences. Outliers shows what’s overperforming <i>relative to channel size in your specific niche, in the last 12 months</i>. That’s the only signal that’s actionable — it surfaces angles and formats working for creators at your size, not formats that only work because the channel already has 5M subs to push them out.</>,
  },
  {
    q: 'How does the "niche match" work?',
    a: <>For every candidate channel surfaced by the YouTube search, we fetch their last 15 video titles and check how many overlap with your channel’s niche keywords. At least one overlap = niche-matched (gets ranked higher). This kills two failure modes: tangentially-related channels (a "tech reviews" channel surfacing on a "home cleaning" search because of one off-topic upload), and creators who recently pivoted away from your niche. Both still appear, just downweighted in the tier sort.</>,
  },
  {
    q: 'Why three reports per search? Can I run just one?',
    a: <>The three reports (videos, breakout channels, thumbnail patterns) come from one unified search — same YouTube fetch, same niche-matched candidate pool, same cohort. Splitting into separate searches would mean three times the API calls and three different result sets that don’t reconcile against each other. The unified pipeline is honest about that and bills accordingly: 3 credits per search, all three reports included. Most users find the channels report alone justifies the credits.</>,
  },
  {
    q: 'What does "why now" actually mean?',
    a: <>Each video carries a one-sentence urgency tag explaining why acting on it is urgent right now — referencing recency ("this angle is climbing in the last 30 days"), seasonal timing ("Black Friday content cycle starts in 9 days"), rising momentum ("three other channels shipped variants this week"), or an audience gap the data shows. The instruction in the Claude prompt is "be concrete; never generic". If a video shows up with a vague why-now you can email support — that’s a prompt regression we want to know about.</>,
  },
  {
    q: 'Will this surface my own videos in the results?',
    a: <>No — your channel is explicitly excluded from the candidate pool. The point is to find out what <i>other</i> creators in your niche are doing that’s working, not to feed your own data back to you (the Channel Audit covers that). If you happen to be the fastest-rising creator in your exact niche, the candidate pool will surface the next-tier creators below you instead.</>,
  },
  {
    q: 'How fresh is the data?',
    a: <>Real-time on every search — we don’t cache the YouTube fetch beyond the saved-search payload (which exists so you can reopen the same result without burning a second credit). The "last 12 months only" filter is hard. If you re-search the same query a month later you’ll get a fresh fetch, fresh cohort, and likely fresh outliers — niche velocity shifts fast.</>,
  },
  {
    q: 'Can I search any keyword, or only ones related to my channel?',
    a: <>Any keyword. The search is anchored to your channel for cohort math and niche-matching, but the seed keyword can be anything. Use this to scout a topic before pivoting into it — "is anyone overperforming on home espresso content right now?" — or to validate a video idea before you script it. The cohort is built around the actual top results for the keyword, so the math stays honest even on out-of-niche searches.</>,
  },
  {
    q: 'How long does a search take?',
    a: <>~30–50 seconds. Behind the scenes: YouTube niche search → intent filter → niche-match channel scan (parallel, fetches recent uploads for each candidate) → enrich + score → one Claude call returns videos explanations and channel explanations and thumbnail patterns in batched parallel. Most of the wall-clock time is the per-channel niche-match fetch, which has to scan 10–15 candidate channels.</>,
  },
  {
    q: 'Why doesn’t my own channel’s niche match the keyword I searched?',
    a: <>The niche match runs against the niche keywords your channel was tagged with at connect time — usually the YouTube channel keywords plus the topics extracted from your last 30 video titles. If those are stale (you pivoted, or YouTube’s keyword data was thin), the niche match will miss. Fix: head to Channel settings → re-extract keywords. Or, in Outliers, just add additional keywords as the seed — the niche match contributes to ranking but doesn’t block results.</>,
  },
  {
    q: 'Why is there a 1.8× minimum outlier score?',
    a: <>Below 1.8× isn’t really an outlier — it’s normal-or-slightly-better performance for the cohort. Including those in the result list pads the response with low-signal videos and hides the genuine over-performers. We applied the floor after seeing it improve the average "actionable insight per result" rate in beta. If the search would otherwise return fewer than 8 results, the system broadens the query and only then drops the floor as a fallback — so you always get a useful payload.</>,
  },
  {
    q: 'Are searches saved? Can I reopen them?',
    a: <>Yes. Every Outliers search persists per channel — the videos, breakout channels, thumbnail patterns, and the original seed keyword. Click any saved search to reopen the full payload without burning a credit. Re-running the same seed creates a fresh entry instead of overwriting, so you can compare how the niche has shifted month over month.</>,
  },
]

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function Outliers() {
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
          {!isMobile && <a href="/#pricing" className="otl-nav-link">Pricing</a>}
          <a href="/auth/login" className="otl-btn" style={{ padding: isMobile ? '8px 18px' : '9px 22px', fontSize: 13, borderRadius: 100, whiteSpace: 'nowrap', boxShadow: 'none' }}>
            Find a viral video
          </a>
        </div>
      </nav>

      {/* ════ 1. HERO — white ════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px 56px' : '110px 40px 80px', textAlign: 'center', background: '#ffffff' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', animation: 'fadeUp 0.5s ease both' }}>
          <span className="otl-eyebrow light">Outliers · viral video finder</span>
          <h1 className="otl-h1" style={{ fontSize: isMobile ? 36 : 60, color: 'var(--ytg-text)', marginBottom: 22 }}>
            Find the videos that hit <span style={{ color: 'var(--ytg-accent)' }}>5×, 10×, even 50× their channel’s normal views.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18.5, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 36px' }}>
            Outliers surfaces YouTube videos in your exact niche that overperformed their channel size — last 12 months only, with an AI-written "why it worked", three quick actions you can ship today, and a "why now" urgency tag. Plus a breakout-channels report and a thumbnail-patterns read across the winners. The closest you’ll get to a working playbook in 30 seconds.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/login" className="otl-btn otl-btn-lg">Find a viral video →</a>
            <a href="#how" className="otl-btn-ghost" style={{ padding: '15px 26px', fontSize: 15 }}>See how it works</a>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', marginTop: 22 }}>
            Solo plan and above · ~30 seconds per search · videos + channels + thumbnail patterns in one search
          </p>
        </div>
      </section>

      {/* ════ 2. OUTLIER VIDEO VISUAL — dark, SPLIT (text L, visual R) ══ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.16) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="otl-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 64, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <span className="otl-eyebrow dark">Per-video card</span>
            <h2 className="otl-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 18 }}>
              Every viral video comes with <span style={{ color: '#ff3b30' }}>the playbook to copy.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72, marginBottom: 24 }}>
              The outlier score is just the entry point. Each card carries a one-sentence "why it worked" naming the specific hook or pattern, three concrete quick actions you can ship today, and a "why now" tag tying it to a current momentum signal. No motivational fluff, no generic "make better content" advice.
            </p>
            {[
              'Score = views-per-sub vs niche cohort median',
              'AI explains what the title / hook / format did right',
              'Three actions ≤ 14 words each — ship today',
              '"Why now" tag tied to a real momentum signal',
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 11 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#4ade80" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M2.5 7.2 5.4 10l6.1-6"/></svg>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6 }}>{b}</span>
              </div>
            ))}
          </div>
          <div>
            <OutlierVideoVisual />
          </div>
        </div>
      </section>

      {/* ════ 3. THREE TABS — light ═════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 48px' }}>
            <span className="otl-eyebrow light">Three reports per search</span>
            <h2 className="otl-h2" style={{ fontSize: isMobile ? 30 : 42, marginBottom: 16 }}>
              One unified search. <span style={{ color: 'var(--ytg-accent)' }}>Three angles on the same niche.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>
              Every Outliers search returns three distinct reports — viral videos, breakout channels, and thumbnail patterns — built from the same niche-matched candidate pool so the views, channels, and visuals you see all reconcile against each other.
            </p>
          </div>
          <div className="otl-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {RESULT_TABS.map((t, i) => (
              <div key={i} style={{ background: 'var(--ytg-card)', borderRadius: 14, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', padding: '24px 24px 26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <p style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.3px' }}>{t.name}</p>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--ytg-accent)', background: 'var(--ytg-accent-light)', border: '1px solid rgba(229,48,42,0.16)', padding: '3px 9px', borderRadius: 100, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{t.count}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>{t.what}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 4. BREAKOUT CHANNELS — dark, SPLIT (visual L, text R) ═════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="otl-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ order: isMobile ? 1 : 0 }}>
            <BreakoutChannelsVisual />
          </div>
          <div style={{ order: isMobile ? 0 : 1 }}>
            <span className="otl-eyebrow dark">Breakout channels</span>
            <h2 className="otl-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 18 }}>
              Find the creators in your niche <span style={{ color: '#ff3b30' }}>before they get big.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72, marginBottom: 22 }}>
              The same scoring math (views-per-sub vs cohort median) applied at the channel level. Surfaces creators in your niche whose recent uploads are systematically over-performing — the ones to study before they hit the trending tab. Each card carries an outlier score, why-this-channel summary, and three concrete moves you can borrow from their playbook.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Niche-matched',     color: '#ff3b30', body: 'Recent uploads overlap your channel’s niche keywords.' },
                { label: 'Velocity-scored',   color: '#4a7cf7', body: 'Channel-level outlier math. Same scale as the videos tab.' },
                { label: 'Why this channel',  color: '#f59e0b', body: 'One-sentence summary of what they’re doing right.' },
                { label: 'What to do',        color: '#4ade80', body: 'Three concrete moves you can borrow this week.' },
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
            <span className="otl-eyebrow light">How it works</span>
            <h2 className="otl-h2" style={{ fontSize: isMobile ? 30 : 42 }}>
              From seed search to actionable playbook in 30 seconds
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.7, marginTop: 14, maxWidth: 600, margin: '14px auto 0' }}>
              Five stages, all of them parallelized. The Claude explanation pass batches videos + channels + thumbnail patterns into a single call so you don’t pay for three round-trips.
            </p>
          </div>
          {(() => {
            const steps = [
              { n: '01', t: 'Seed query + intent',  b: 'Type a topic. The studio offers 3 keyword intent options so the search is anchored to the right viewer intent — same picker SEO Studio uses.' },
              { n: '02', t: 'YouTube niche search', b: 'Top 50 results pulled via the official YouTube Data API. Drops your own channel. Filters to last 12 months only.' },
              { n: '03', t: 'Niche-match channels', b: 'For each candidate channel, fetch their last 15 video titles and check overlap against your channel’s niche keywords. Niche-matched channels rank higher.' },
              { n: '04', t: 'Cohort scoring',       b: 'Compute views-per-subscriber for every candidate. Score = video VPS / cohort median VPS. Apply 1.8× outlier floor and a niche-relative views floor.' },
              { n: '05', t: 'Batched Claude pass',  b: 'One Sonnet 4.6 call returns why-it-worked + 3 quick actions + why-now per video, plus per-channel explanations and the thumbnail pattern read.' },
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
            <span className="otl-eyebrow dark">Output structure</span>
            <h2 className="otl-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 16 }}>
              Seven distinct output blocks. <span style={{ color: '#ff3b30' }}>Every viral hit comes with a playbook.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72 }}>
              The studio doesn’t hand you a list of trending videos and let you guess. Each output block is structured, named, and actionable — the Claude prompt explicitly forbids generic "make better hooks" advice.
            </p>
          </div>
          <div className="otl-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
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
        <div className="otl-grid-2" style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <span className="otl-eyebrow light">What powers it</span>
            <h2 className="otl-h2" style={{ fontSize: isMobile ? 28 : 38, marginBottom: 16 }}>
              Real YouTube data. <span style={{ color: 'var(--ytg-accent)' }}>One AI pass.</span>
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>
              Public videos via the official YouTube Data API. Niche-match scan over each candidate channel’s recent uploads. Cohort-relative scoring math. One batched Claude Sonnet 4.6 call returns explanations for every video, every breakout channel, and the thumbnail pattern read in parallel — so you’re not waiting on three round-trips.
            </p>
          </div>
          <div style={{ background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 16, boxShadow: 'var(--ytg-shadow-lg)', padding: '24px 28px' }}>
            {[
              { k: 'Candidate pool',         v: 'YouTube Data API · top 50 niche results · last 12 months' },
              { k: 'Niche match',             v: 'Last 15 uploads per candidate · keyword overlap scoring' },
              { k: 'Outlier score',           v: 'Views-per-sub / niche cohort median · 1.8× minimum' },
              { k: 'Niche views floor',       v: '5% of cohort median · prevents dead uploads' },
              { k: 'Per-channel cap',         v: 'Max 2 videos from one channel · keeps results diverse' },
              { k: 'Explanations',            v: 'Sonnet 4.6 · batched · why-worked + 3 actions + why-now' },
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
            <span className="otl-eyebrow dark">By plan</span>
            <h2 className="otl-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 16 }}>
              How many Outliers searches you get each month
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72 }}>
              Each Outliers search returns three reports (videos + breakout channels + thumbnail patterns) and charges 3 credits accordingly. Numbers below are the search count each plan’s monthly credit allowance covers if Outliers were the only feature you used. Most users mix Outliers with the other tools.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 14 }}>
            {PLAN_LIMITS.map((p, i) => {
              const isAccent = p.plan === 'Growth'
              const isLocked = p.plan === 'Free'
              return (
                <div key={i} style={{
                  background: isAccent ? '#1a1018' : '#111114',
                  borderRadius: 16,
                  border: isAccent ? '1px solid rgba(229,48,42,0.45)' : '1px solid rgba(255,255,255,0.09)',
                  boxShadow: isAccent ? '0 8px 32px rgba(229,48,42,0.18)' : '0 2px 8px rgba(0,0,0,0.4)',
                  padding: '24px 22px 22px',
                  position: 'relative',
                  opacity: isLocked ? 0.66 : 1,
                }}>
                  {isAccent && (
                    <span style={{ position: 'absolute', top: -10, right: 16, fontSize: 9, fontWeight: 800, color: '#fff', background: '#ff3b30', padding: '3px 10px', borderRadius: 100, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Most popular</span>
                  )}
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>{p.plan}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                    <p style={{ fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{p.runs}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>searches</p>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>included per month</p>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 12 }} />
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 }}>{p.note}</p>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 22, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>3 credits per Outliers search · same engine across all paid plans.</p>
            <a href="/#pricing" style={{ fontSize: 12.5, color: '#ff3b30', textDecoration: 'none', fontWeight: 600 }}>See full pricing →</a>
          </div>
        </div>
      </section>

      {/* ════ 9. FAQ — white ════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '110px 40px', background: '#ffffff' }}>
        <div className="otl-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: 56, alignItems: 'flex-start' }}>
          <div style={{ position: isMobile ? 'static' : 'sticky', top: 100 }}>
            <span className="otl-eyebrow light">FAQ</span>
            <h2 className="otl-h2" style={{ fontSize: isMobile ? 30 : 40, marginBottom: 16 }}>
              Questions about the outlier engine, answered honestly.
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>
              Real answers from how the product behaves — the cohort math, the niche match, the credit cost, and what won’t work.
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
          <h2 className="otl-h2" style={{ fontSize: isMobile ? 30 : 44, marginBottom: 16 }}>
            Find what’s already working in your niche
          </h2>
          <p style={{ fontSize: isMobile ? 15 : 17, color: 'var(--ytg-text-2)', maxWidth: 540, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Solo gets 6 Outliers searches per month, Growth 16, Agency 50 pooled. Each search returns videos + breakout channels + thumbnail patterns — three reports for the price of one search.
          </p>
          <a href="/auth/login" className="otl-btn otl-btn-lg">Find a viral video →</a>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
