import { useEffect, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'

/* Channel Audit — fully custom landing page.
 *
 * Built around the *actual* product (see app/insights.py): an AI audit
 * powered by Claude Sonnet 4.6 over 8 weighted scoring categories +
 * 2 informational ones, with priority actions structured as
 * problem / why-now / action / expected-outcome. Background rhythm
 * mirrors Landing.jsx (white → dark → light → dark → light → white).
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
    if (document.getElementById('ca-styles')) return
    const link = document.createElement('link')
    link.id = 'ca-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ca-styles'
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

      .ca-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--ytg-accent); color: #fff; font-size: 15px; font-weight: 700; padding: 15px 30px; border-radius: 100px; border: none; cursor: pointer; text-decoration: none; letter-spacing: -0.2px; box-shadow: 0 1px 2px rgba(0,0,0,0.14), 0 4px 20px rgba(229,48,42,0.34); transition: filter 0.18s, transform 0.18s, box-shadow 0.18s; font-family: 'Inter', system-ui, sans-serif; }
      .ca-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,0.16), 0 12px 36px rgba(229,48,42,0.42); }
      .ca-btn-lg { font-size: 16px; padding: 17px 38px; }
      .ca-btn-ghost { display: inline-flex; align-items: center; gap: 8px; background: var(--ytg-card); color: var(--ytg-text-2); font-size: 15px; font-weight: 600; padding: 14px 26px; border-radius: 100px; border: 1px solid var(--ytg-border); cursor: pointer; text-decoration: none; letter-spacing: -0.2px; box-shadow: var(--ytg-shadow-sm); transition: color 0.15s, box-shadow 0.18s; font-family: 'Inter', system-ui, sans-serif; }
      .ca-btn-ghost:hover { color: var(--ytg-text); box-shadow: var(--ytg-shadow); }

      .ca-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        font-size: 11px; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase;
        padding: 5px 13px; border-radius: 100px; margin-bottom: 16px;
      }
      .ca-eyebrow.light { color: var(--ytg-accent-text); background: var(--ytg-accent-light); }
      .ca-eyebrow.dark  { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); }

      .ca-h1 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -2px; line-height: 1.05; text-wrap: balance; }
      .ca-h2 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -1.4px; line-height: 1.08; text-wrap: balance; }

      .ca-nav-link { font-size: 14px; color: var(--ytg-text-3); font-weight: 500; text-decoration: none; transition: color 0.15s; letter-spacing: -0.1px; }
      .ca-nav-link:hover { color: var(--ytg-text-2); }

      .ca-faq-item { border-bottom: 1px solid var(--ytg-border); }
      .ca-faq-q { background: none; border: none; cursor: pointer; width: 100%; text-align: left; padding: 22px 0; font-family: inherit; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; font-size: 16.5px; font-weight: 700; color: var(--ytg-text); letter-spacing: -0.2px; line-height: 1.45; }
      .ca-faq-q:hover { color: var(--ytg-accent); }
      .ca-faq-icon { transition: transform 0.2s; flex-shrink: 0; color: var(--ytg-text-3); margin-top: 4px; }
      .ca-faq-icon.open { transform: rotate(45deg); color: var(--ytg-accent); }
      .ca-faq-a { font-size: 14.5px; color: var(--ytg-text-2); line-height: 1.78; padding: 0 0 22px 0; max-width: 760px; }

      @media (max-width: 900px) {
        .ca-grid-2 { grid-template-columns: 1fr !important; gap: 32px !important; }
        .ca-grid-3 { grid-template-columns: 1fr !important; }
        .ca-grid-4 { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 600px) {
        .ca-grid-4 { grid-template-columns: 1fr !important; }
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
]

function FeaturesDropdown() {
  const [open, setOpen] = useState(false)
  return (
    <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} style={{ position: 'relative' }}>
      <a href="/#features" className="ca-nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
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
    <div className="ca-faq-item">
      <button className="ca-faq-q" onClick={() => setOpen(o => !o)}>
        <span style={{ flex: 1 }}>{q}</span>
        <span className={`ca-faq-icon${open ? ' open' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M8 2v12M2 8h12"/></svg>
        </span>
      </button>
      {open && <div className="ca-faq-a">{a}</div>}
    </div>
  )
}

/* ── Visual: Score ring + AI assessment (dark) ─────────────────────────── */
function ScoreVisual() {
  const score = 67
  const circumference = 2 * Math.PI * 50
  const offset = circumference - (score / 100) * circumference
  return (
    <div style={{ background: '#111114', borderRadius: 22, border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 48px rgba(0,0,0,0.6)', padding: 32, display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
      {/* Score ring */}
      <div style={{ flexShrink: 0, position: 'relative', width: 140, height: 140 }}>
        <svg width="140" height="140" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
          <circle cx="60" cy="60" r="50" fill="none" stroke="#60a5fa" strokeWidth="9" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 60 60)" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 44, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>/ 100</span>
        </div>
      </div>
      <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,0.08)' }} />
      {/* AI assessment */}
      <div style={{ flex: 1, minWidth: 220 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>AI assessment · Sample</p>
        <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.88)', lineHeight: 1.78 }}>
          Your channel is publishing consistently and your last 5 videos hold retention above 50%, but Browse + Suggested traffic combined sits at 31% — YouTube isn&apos;t pushing you. The bottleneck is packaging, not content. Fixing thumbnail contrast on your next 3 uploads should move CTR from 3.4% to ~5%.
        </p>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#60a5fa', marginTop: 14, letterSpacing: '0.04em' }}>▲ +6 from last audit · 9 priority actions</p>
      </div>
    </div>
  )
}

/* ── Visual: Sample priority action card (dark) ────────────────────────── */
function PriorityActionVisual() {
  return (
    <div style={{ background: '#ffffff', borderRadius: 16, borderTop: '3px solid #ff3b30', boxShadow: '0 8px 48px rgba(0,0,0,0.6)', padding: '20px 24px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingTop: 2 }}>
          <input type="checkbox" readOnly style={{ width: 15, height: 15, accentColor: '#16a34a' }} />
          <div style={{ width: 26, height: 26, borderRadius: 8, background: '#ff3b30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 900, color: '#fff' }}>1</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#ff3b30', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>CTR Health</p>
          <p style={{ fontSize: 14.5, fontWeight: 700, color: '#0a0a0f', lineHeight: 1.55 }}>
            Browse + Suggested traffic at 31%, well below the 40% threshold for healthy algo push. Your packaging (titles + thumbnails) isn&apos;t earning impressions.
          </p>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#ff3b30', padding: '3px 9px', borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase', border: '1.5px solid #ff3b30', flexShrink: 0 }}>HIGH</span>
      </div>
      <div style={{ height: 1, background: 'rgba(10,10,15,0.09)', marginBottom: 14, marginLeft: 46 }} />
      {/* Body */}
      <div className="ca-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 8, marginLeft: 46 }}>
        <div style={{ background: 'rgba(79,134,247,0.07)', border: '1px solid rgba(79,134,247,0.12)', borderRadius: 10, padding: '12px 14px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#4a7cf7', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Why now</p>
          <p style={{ fontSize: 13, color: '#0a0a0f', lineHeight: 1.7 }}>If browse + suggested stays under 40% for another 30 days, the algorithm classifies your videos as &ldquo;low-value&rdquo; and stops surfacing them entirely.</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid rgba(10,10,15,0.09)', borderLeft: '3px solid #ff3b30', borderRadius: '0 10px 10px 0', padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#ff3b30', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Action</p>
          <p style={{ fontSize: 13, color: '#0a0a0f', lineHeight: 1.7 }}>Re-do thumbnails on your last 3 uploads using high-contrast text (4.5:1 minimum) and a face occupying 35–50% of frame. Score each in Thumbnail IQ before applying.</p>
        </div>
        <div style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.14)', borderRadius: 10, padding: '12px 14px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Expected outcome</p>
          <p style={{ fontSize: 13, color: '#0a0a0f', lineHeight: 1.7 }}>CTR climbs from 3.4% to ~5%, browse share rises to 38–45% within 14–21 days as the algorithm re-tests your videos.</p>
        </div>
      </div>
    </div>
  )
}

/* ── The 8 weighted + 2 informational categories — straight from app/insights.py ── */
const CATEGORIES = [
  { name: 'CTR Health',                weight: '20%', what: 'Click-through rate per video, scored against the 4–6% benchmark for established channels (2–4% for newer ones). Identifies which titles + thumbnails earn impressions and which kill them.' },
  { name: 'Audience Retention',        weight: '20%', what: 'Average view percentage across your last 20 uploads. Below 40% is a red flag; above 50% is strong. Surfaces which videos hold attention and what they share in common.' },
  { name: 'Content Strategy',          weight: '15%', what: 'Whether your last 20 titles read like one channel or three. Identifies your highest-engagement topic clusters and flags scattered topics that dilute YouTube&apos;s niche classification.' },
  { name: 'Posting Consistency',       weight: '15%', what: '90-day cadence — videos published, average gap, peak day + hour, Shorts vs long-form split. Flags irregular patterns and timing that misses your audience&apos;s active windows.' },
  { name: 'Engagement Quality',        weight: '10%', what: 'Like-to-view, comment-to-view, and subs-gained-per-video ratios. Surfaces which content types drive subscribers vs which generate passive views that don&apos;t convert.' },
  { name: 'SEO Discoverability',       weight: '10%', what: 'Channel keywords, title structure (primary keyword in first half, 50–70 chars), and description quality. Flags missing setup, weak titles, and untargeted descriptions.' },
  { name: 'Video Length',              weight: '5%',  what: 'Sweet-spot analysis comparing video duration against retention. Flags outliers that are too long for your audience to finish, or too short to capture session-watch-time signal.' },
  { name: 'Traffic Source Intelligence',weight: '5%', what: 'Where views come from — Browse, Suggested, Search, External. Diagnoses whether your problem is algorithmic push (packaging fix) or discovery (SEO fix). Flags over-reliance on one source.' },
  { name: 'Audience Profile',          weight: 'Info',what: 'Device split, top geographies, age + gender breakdown. Mobile-dominant means thumbnail text needs to be larger; unexpected geography means a localization opportunity.' },
  { name: 'Content Shareability',      weight: 'Info',what: 'Shares + playlist-adds vs views. Low share rate on entertainment/educational content is a red flag; high playlist-adds means evergreen content worth doubling down on.' },
]

const ALGO_LEVERS = [
  {
    name: 'Browse + Suggested traffic share',
    benchmark: 'Healthy: combined 40%+. Below 40% = weak algorithmic push.',
    what: 'This is YouTube literally pushing your videos onto homepages and "Up Next" panels. If it&apos;s low, no amount of SEO will save you — the fix is packaging (titles + thumbnails) and early-video retention, in that order.',
  },
  {
    name: 'Session-keeping signal',
    benchmark: 'High APV × high shares-per-1k-views combined.',
    what: 'YouTube rewards videos that extend a viewer&apos;s session more than videos with great retention alone. The audit identifies your top "session-keeper" video by name — the format YouTube actively wants more of from you.',
  },
  {
    name: 'Audience-builder ratio',
    benchmark: 'Subs gained per 1,000 views. Higher = the algorithm sees you growing the platform.',
    what: 'Identifies which video types convert viewers to subscribers. If your &ldquo;Top audience-builder&rdquo; is a tutorial but you publish mostly reaction content, the algorithm is telling you what to make more of.',
  },
  {
    name: 'Retention normalised by duration',
    benchmark: '50% APV on a 10-min video > 50% APV on a 4-min video.',
    what: 'Surfaces your true watch-time leader — the video that earns the most absolute minutes-watched per impression. This is the channel&apos;s real winner; long mid-APV videos beat short high-APV ones in the algorithm&apos;s ranking.',
  },
]

const ICON_PATHS = {
  stats:    'M3 12V8m4 4V6m4 6V4m4 8V9',
  video:    'M2 4h10v8H2zM12 6l4-2v8l-4-2',
  calendar: 'M2 3h12v11H2zM2 6h12M5 1v4M11 1v4',
  traffic:  'M8 2v6l4 4',
  globe:    'M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1zM1 8h14M8 1c2 1.8 3 4.4 3 7s-1 5.2-3 7c-2-1.8-3-4.4-3-7s1-5.2 3-7z',
  users:    'M5.5 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM10.5 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM1.5 14c0-2.5 1.8-4 4-4s4 1.5 4 4M14.5 14c0-2.5-1.5-3.7-4-4',
  share:    'M11 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM11 15a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6.7 7l2.6-1.5M6.7 9l2.6 1.5',
  zap:      'M9 1L3 9h4l-1 6 6-8H8l1-6z',
  eye:      'M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5zM8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
}

function DataIcon({ name, color = '#e5302a' }) {
  return (
    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--ytg-accent-light)', border: '1px solid rgba(229,48,42,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d={ICON_PATHS[name]}/>
      </svg>
    </div>
  )
}

const DATA_INPUTS = [
  { icon: 'stats',    label: 'Channel stats',         body: 'Subscribers, total views, video count, channel age, channel keywords.' },
  { icon: 'video',    label: 'Last 20 videos',        body: 'Title, duration, views, CTR, impressions, average view duration, retention %, likes, comments, subs gained.' },
  { icon: 'calendar', label: 'Posting behavior',      body: 'Upload cadence, gaps, peak day + hour, Shorts vs long-form ratio across the last 90 days.' },
  { icon: 'traffic',  label: 'Traffic sources',       body: 'Browse, Suggested, Search, External and other sources — share % and watch minutes per source.' },
  { icon: 'globe',    label: 'Device + geography',    body: 'Mobile vs desktop vs TV split, top 5 countries with subscribers gained per country.' },
  { icon: 'users',    label: 'Audience demographics', body: 'Age and gender breakdown (when sample size is statistically meaningful).' },
  { icon: 'share',    label: 'Engagement signals',    body: 'Total shares, dislikes, playlist adds across the last 90 days.' },
  { icon: 'zap',      label: 'Algorithm metrics',     body: 'Browse %, suggested %, search %, external %, shares / 1k, comments / 1k, subs / 1k, top session-keeper, top audience-builder, top watch-time leader.' },
  { icon: 'eye',      label: 'Competitor data',       body: 'If Competitor Analysis has run, the audit benchmarks you against your 3 most recent rivals — title patterns, view averages, content gaps.' },
]

const PLAN_LIMITS = [
  { plan: 'Free',    actions: '5',   note: 'Lifetime limit · 3 audits' },
  { plan: 'Solo',    actions: '8',   note: '20 audits / month · 3 channels' },
  { plan: 'Growth',  actions: '12',  note: '50 audits / month · 5 channels' },
  { plan: 'Agency',  actions: '15',  note: '150 audits / month · 10 pooled channels' },
]

const FAQS = [
  {
    q: 'How is the channel score actually calculated?',
    a: <>It&apos;s a deterministic weighted formula across 8 categories — not an AI guess. CTR Health and Audience Retention each count 20%, Content Strategy and Posting Consistency each count 15%, Engagement Quality and SEO Discoverability each count 10%, Video Length and Traffic Source Intelligence each count 5%. The same data always produces the same score, so improvements between audits are real and measurable. Audience Profile and Content Shareability are scored too but kept informational — they&apos;re context for the actions, not part of the headline number.</>,
  },
  {
    q: 'What&apos;s the difference between Priority Actions and Quick Wins?',
    a: <>Priority Actions are ranked, structured fixes — each with a specific problem, why-now urgency, the exact action to take, and the expected metric outcome. They&apos;re sized to take 1–4 hours of work each and they&apos;re what move your score. Quick Wins are smaller items you can fix in under 10 minutes (a missing description, a tag fix, a thumbnail re-crop) — they don&apos;t need the full structure because the action is obvious.</>,
  },
  {
    q: 'My Browse + Suggested traffic share is 31%. What does that mean?',
    a: <>Below 40% combined means YouTube isn&apos;t actively recommending your videos — you&apos;re relying on people finding you through Search or External links. That&apos;s a packaging problem (titles + thumbnails), not a SEO problem. The audit explicitly flags this in the &ldquo;Algorithm-push diagnosis&rdquo; line and at least one of your top 3 priority actions will address it. Fixing packaging on your next 3 uploads typically moves browse + suggested above 40% within 2–3 weeks.</>,
  },
  {
    q: 'Why does my retention category score so low?',
    a: <>Average View Percentage (APV) below 30% triggers a hard score penalty because YouTube stops recommending videos at that level — the algorithm reads it as &ldquo;not worth showing.&rdquo; Below 40% is a red flag; above 50% is strong; above 60% is exceptional. The audit pinpoints which specific videos drag your average down and what they share in common (length, intro pattern, topic), so the fix is concrete instead of &ldquo;improve retention.&rdquo;</>,
  },
  {
    q: 'How often should I re-audit?',
    a: <>After you&apos;ve actually changed something. Re-auditing without shipping new videos or updates won&apos;t move the score because the underlying data hasn&apos;t changed. The most useful pattern is: audit → work through priority actions → publish 2–3 new videos that apply the fixes → re-audit and watch the score delta. Most users see meaningful score movement after 4–6 weeks of consistent application. Free tier gets 3 lifetime audits, Solo gets 20/month, Growth gets 50/month, Agency gets 150/month.</>,
  },
  {
    q: 'Can I see what changed between audits?',
    a: <>Yes — the score ring shows a delta arrow (▲ +6 from last audit) on the Overview tab once you&apos;ve run more than one. Category scores get the same treatment, so you can see which areas actually improved versus which regressed. Priority actions you marked done stay tracked, so the next audit knows what you already worked on and prioritizes new bottlenecks instead of repeating fixes.</>,
  },
  {
    q: 'Does the audit work for Shorts-only channels?',
    a: <>Yes, but with caveats. Shorts retention reads differently from long-form (people swipe at the title, not after a 15-second hook), so the audit splits the analysis when it sees Shorts in your last 20. CTR Health gets less weight for Shorts because YouTube doesn&apos;t expose CTR for them via the API. Audience Retention, Posting Consistency, and Algorithm signals (sub-builder ratio especially) work normally and are usually the most important categories for Shorts channels.</>,
  },
  {
    q: 'What if my channel is brand new?',
    a: <>You need at least 5 published videos and roughly 30 days of channel history for the audit to be statistically meaningful. With less data, the AI can&apos;t separate noise from signal — it would pretend to know things it doesn&apos;t. We tell you upfront if your channel doesn&apos;t have enough data and let you wait until it does, instead of producing an audit that&apos;s mostly hallucination.</>,
  },
  {
    q: 'How is this different from VidIQ&apos;s &ldquo;score&rdquo; or YouTube Studio&apos;s analytics?',
    a: <>YouTube Studio shows you what happened. VidIQ shows you a score on every video. Neither tells you what to do next, in what order, and why. YTGrowth&apos;s audit reads all of that data plus 90 days of traffic-source breakdown and demographic data, runs it through an AI tuned specifically on YouTube&apos;s 2025 ranking signals, and produces a ranked action list with specific numbers (&ldquo;CTR climbs from 3.4% to ~5%&rdquo;) instead of generic advice (&ldquo;improve your CTR&rdquo;).</>,
  },
  {
    q: 'Will the audit ever change anything on my channel?',
    a: <>No. The audit is read-only. We pull your stats and analytics via the official YouTube Data API but we cannot upload, edit, comment on, or delete anything. The only place anything ever gets changed on YouTube is when you click &ldquo;Apply&rdquo; in SEO Studio after reviewing a title or description rewrite — and that&apos;s an explicit, per-video action.</>,
  },
]

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function ChannelAudit() {
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
          {!isMobile && <a href="/#pricing" className="ca-nav-link">Pricing</a>}
          <a href="/auth/login" className="ca-btn" style={{ padding: isMobile ? '8px 18px' : '9px 22px', fontSize: 13, borderRadius: 100, whiteSpace: 'nowrap', boxShadow: 'none' }}>
            Audit my channel free
          </a>
        </div>
      </nav>

      {/* ════ 1. HERO — white ════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px 56px' : '110px 40px 80px', textAlign: 'center', background: '#ffffff' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', animation: 'fadeUp 0.5s ease both' }}>
          <span className="ca-eyebrow light">AI Channel Audit</span>
          <h1 className="ca-h1" style={{ fontSize: isMobile ? 36 : 60, color: 'var(--ytg-text)', marginBottom: 22 }}>
            10 categories. <span style={{ color: 'var(--ytg-accent)' }}>One ranked list of fixes.</span><br/>No more guessing.
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18.5, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 700, margin: '0 auto 36px' }}>
            YTGrowth pulls your full YouTube data, runs it through an AI tuned on the signals YouTube&apos;s recommendation engine actually rewards, and returns a prioritized list of fixes — each with the specific problem, why it matters now, the exact action to take, and the metric you&apos;ll see move.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/login" className="ca-btn ca-btn-lg">Audit my channel free →</a>
            <a href="#how" className="ca-btn-ghost" style={{ padding: '15px 26px', fontSize: 15 }}>See how it works</a>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', marginTop: 22 }}>
            Free tier · 3 audits on the house · no credit card · ~60 seconds per run
          </p>
        </div>
      </section>

      {/* ════ 2. SCORE + ASSESSMENT — dark, SPLIT layout (text L, visual R) ═ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.16) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="ca-grid-2" style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 64, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <span className="ca-eyebrow dark">What you get</span>
            <h2 className="ca-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 18 }}>
              A single weighted score, with the <span style={{ color: '#ff3b30' }}>actual reason it&apos;s where it is.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72, marginBottom: 24 }}>
              The deterministic formula means score changes between audits are real, not noise. The AI assessment paragraph is what most users read first — plain English, naming the specific lever holding the channel back.
            </p>
            {[
              'Weighted 0–100 score with delta vs your last audit',
              '2–3 sentence assessment that names the bottleneck',
              'Eight scored categories, each colour-coded by health',
              'Updates instantly when you re-audit after shipping fixes',
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 11 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#4ade80" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M2.5 7.2 5.4 10l6.1-6"/></svg>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6 }}>{b}</span>
              </div>
            ))}
          </div>
          <div>
            <ScoreVisual />
          </div>
        </div>
      </section>

      {/* ════ 3. THE 10 CATEGORIES — light gray ═════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 48px' }}>
            <span className="ca-eyebrow light">The 10 categories</span>
            <h2 className="ca-h2" style={{ fontSize: isMobile ? 30 : 42, marginBottom: 16 }}>
              Every dimension of channel health, <span style={{ color: 'var(--ytg-accent)' }}>weighted by what YouTube actually rewards.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>
              Eight categories carry weight in the headline score; two more (Audience Profile and Content Shareability) are scored for context but don&apos;t inflate or deflate the number. Weights aren&apos;t arbitrary — they reflect how heavily each lever moves the recommendation engine.
            </p>
          </div>
          <div className="ca-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {CATEGORIES.map((cat, i) => (
              <div key={i} style={{ background: 'var(--ytg-card)', borderRadius: 14, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10, gap: 12 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.2px' }}>{cat.name}</p>
                  <span style={{ fontSize: 11, fontWeight: 700, color: cat.weight === 'Info' ? 'var(--ytg-text-3)' : 'var(--ytg-accent)', background: cat.weight === 'Info' ? '#f1f1f6' : 'var(--ytg-accent-light)', border: '1px solid ' + (cat.weight === 'Info' ? 'var(--ytg-border)' : 'rgba(229,48,42,0.18)'), padding: '2px 10px', borderRadius: 100, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                    {cat.weight === 'Info' ? 'Info only' : `Weight · ${cat.weight}`}
                  </span>
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>{cat.what}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 4. PRIORITY ACTION ANATOMY — dark, SPLIT (visual L, text R) ══ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="ca-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 56, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          {/* Visual on left */}
          <div style={{ order: isMobile ? 1 : 0 }}>
            <PriorityActionVisual />
          </div>
          {/* Text on right */}
          <div style={{ order: isMobile ? 0 : 1 }}>
            <span className="ca-eyebrow dark">Priority action anatomy</span>
            <h2 className="ca-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 18 }}>
              Every fix is structured like <span style={{ color: '#ff3b30' }}>a real diagnosis.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72, marginBottom: 26 }}>
              Each priority action has four parts. You don&apos;t just learn what&apos;s wrong — you learn why it matters now, exactly what to do, and what number to watch. Check them off as you ship; the next audit measures the delta against what you actually completed.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Problem',          color: '#ff3b30', body: 'The specific issue, with a real number from your data.' },
                { label: 'Why now',          color: '#4a7cf7', body: 'What breaks if you don&apos;t fix it in the next 14–30 days.' },
                { label: 'Action',           color: '#ffffff', body: 'The exact, do-able step. No vague advice.' },
                { label: 'Expected outcome', color: '#4ade80', body: 'The metric that will move, and roughly by how much.' },
              ].map((p, i) => (
                <div key={i} style={{ borderLeft: `2px solid ${p.color}`, paddingLeft: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: p.color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{p.label}</p>
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: p.body }} />
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
            <span className="ca-eyebrow light">How it works</span>
            <h2 className="ca-h2" style={{ fontSize: isMobile ? 30 : 42 }}>
              One audit, ~60 seconds, end-to-end
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.7, marginTop: 14, maxWidth: 580, margin: '14px auto 0' }}>
              Five stages from sign-in to ranked action list. Steps 2–4 run in parallel, so most users see the result within 60 seconds.
            </p>
          </div>
          {(() => {
            const steps = [
              { n: '01', t: 'Connect your channel', b: 'Sign in with the Google account that owns your YouTube channel. Read-only access via the official YouTube Data API — we never touch your videos, comments, or settings.' },
              { n: '02', t: 'Data pull begins',     b: 'Last 20 videos, 90 days of analytics, traffic sources, demographics, engagement signals — pulled in parallel. Takes 15–25 seconds.' },
              { n: '03', t: 'Algorithm signals',    b: 'We compute the metrics YouTube&apos;s recommendation engine actually rewards — browse %, session-keeper, audience-builder ratio, watch-time leader.' },
              { n: '04', t: 'AI runs the audit',    b: 'Claude Sonnet 4.6 reads the full data plus any stored competitor analyses and produces score, summary, and priority actions in ~30 seconds.' },
              { n: '05', t: 'You see the result',   b: 'Score ring + AI assessment, score breakdown across 8 weighted categories, priority actions you can check off as you ship them, plus quick wins.' },
            ]
            const Card = ({ s }) => (
              <div style={{ background: 'var(--ytg-card)', borderRadius: 14, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', padding: '22px 22px 24px', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--ytg-accent-light)', border: '1px solid rgba(229,48,42,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ytg-accent)', letterSpacing: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{s.n}</span>
                  </div>
                </div>
                <p style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ytg-text)', marginBottom: 10, letterSpacing: '-0.2px' }}>{s.t}</p>
                <p style={{ fontSize: 13, color: 'var(--ytg-text-2)', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: s.b }} />
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

      {/* ════ 6. ALGORITHM LEVERS — dark ════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 44px' }}>
            <span className="ca-eyebrow dark">Algorithm levers it surfaces</span>
            <h2 className="ca-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 16 }}>
              We pre-compute the metrics <span style={{ color: '#ff3b30' }}>YouTube&apos;s recommendation engine actually weights.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72 }}>
              Most YouTube tools score you on vanity metrics — views, likes, subs. The algorithm doesn&apos;t care about those directly. It cares about these four signals, in this order. The audit reads each one off your real data and builds priority actions specifically to move them.
            </p>
          </div>
          <div className="ca-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {ALGO_LEVERS.map((lever, i) => (
              <div key={i} style={{ background: '#111114', borderRadius: 16, border: '1px solid rgba(255,255,255,0.09)', padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(229,48,42,0.12)', border: '1px solid rgba(229,48,42,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#ff3b30', letterSpacing: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <p style={{ fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.3, marginTop: 4 }}>{lever.name}</p>
                </div>
                <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 6, background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.18)', borderRadius: 100, padding: '4px 11px' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80' }} />
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: '#4ade80', letterSpacing: '-0.05px' }}>{lever.benchmark}</span>
                </div>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72 }} dangerouslySetInnerHTML={{ __html: lever.what }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 7. WHAT DATA FEEDS IT — light, 3-col icon grid ════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: 'var(--ytg-bg-3)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 44px' }}>
            <span className="ca-eyebrow light">Full transparency</span>
            <h2 className="ca-h2" style={{ fontSize: isMobile ? 30 : 42, marginBottom: 16 }}>
              Exactly what we pull from your channel
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.72 }}>
              Read-only access via the official YouTube Data API. Nine data sources feed every audit. We never write, edit, or store anything outside our analytics tables.
            </p>
          </div>
          <div className="ca-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {DATA_INPUTS.map((d, i) => (
              <div key={i} style={{ background: 'var(--ytg-card)', borderRadius: 16, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', padding: '22px 22px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <DataIcon name={d.icon} />
                  <p style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.2px' }}>{d.label}</p>
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--ytg-text-2)', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: d.body }} />
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--ytg-card)', borderRadius: 14, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', padding: '14px 22px', marginTop: 18, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M11 4.5v-1A2.5 2.5 0 0 0 8.5 1h-3A2.5 2.5 0 0 0 3 3.5v1M2 4.5h10v8H2zM7 7v3"/>
            </svg>
            <p style={{ fontSize: 13, color: 'var(--ytg-text-2)', letterSpacing: '-0.1px' }}>
              <span style={{ fontWeight: 700, color: 'var(--ytg-text)' }}>Read-only OAuth scope.</span> Revoke access anytime from your Google account settings.
            </p>
          </div>
        </div>
      </section>

      {/* ════ 8. PLAN LIMITS — dark ═════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '100px 40px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(229,48,42,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 44px' }}>
            <span className="ca-eyebrow dark">By plan</span>
            <h2 className="ca-h2" style={{ fontSize: isMobile ? 30 : 42, color: '#fff', marginBottom: 16 }}>
              Same audit. <span style={{ color: '#ff3b30' }}>More fixes per run as you scale.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.72 }}>
              Higher tiers don&apos;t unlock different categories — every plan reads the same 10 dimensions. They unlock more depth: more priority actions returned per audit, more audits per month, more channels under one account.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 14 }}>
            {PLAN_LIMITS.map((p, i) => {
              const isAccent = p.plan === 'Growth'
              return (
                <div key={i} style={{
                  background: isAccent ? '#1a1018' : '#111114',
                  borderRadius: 16,
                  border: isAccent ? '1px solid rgba(229,48,42,0.45)' : '1px solid rgba(255,255,255,0.09)',
                  boxShadow: isAccent ? '0 8px 32px rgba(229,48,42,0.18)' : '0 2px 8px rgba(0,0,0,0.4)',
                  padding: '24px 22px 22px',
                  position: 'relative',
                }}>
                  {isAccent && (
                    <span style={{ position: 'absolute', top: -10, right: 16, fontSize: 9, fontWeight: 800, color: '#fff', background: '#ff3b30', padding: '3px 10px', borderRadius: 100, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Most popular</span>
                  )}
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>{p.plan}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                    <p style={{ fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1 }}>{p.actions}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>priority actions</p>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>per audit</p>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 12 }} />
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 }}>{p.note}</p>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 22, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>Same scoring formula across all plans.</p>
            <a href="/#pricing" style={{ fontSize: 12.5, color: '#ff3b30', textDecoration: 'none', fontWeight: 600 }}>See full pricing →</a>
          </div>
        </div>
      </section>

      {/* ════ 9. FAQ — white ════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '110px 40px', background: '#ffffff' }}>
        <div className="ca-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: 56, alignItems: 'flex-start' }}>
          {/* Left: heading panel */}
          <div style={{ position: isMobile ? 'static' : 'sticky', top: 100 }}>
            <span className="ca-eyebrow light">FAQ</span>
            <h2 className="ca-h2" style={{ fontSize: isMobile ? 30 : 40, marginBottom: 16 }}>
              Questions about the audit, answered honestly.
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>
              Real answers from how the product actually behaves — including the unflattering ones (when it won&apos;t work, what it doesn&apos;t do, where the limits are).
            </p>
            <a href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--ytg-accent)', textDecoration: 'none', fontWeight: 600, marginTop: 16 }}>
              Still have questions? Email us →
            </a>
          </div>
          {/* Right: questions */}
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
          <h2 className="ca-h2" style={{ fontSize: isMobile ? 30 : 44, marginBottom: 16 }}>
            See which lever your channel is missing
          </h2>
          <p style={{ fontSize: isMobile ? 15 : 17, color: 'var(--ytg-text-2)', maxWidth: 520, margin: '0 auto 28px', lineHeight: 1.7 }}>
            ~60 seconds end-to-end. Free tier gives you 3 lifetime audits — no credit card. Most users find their #1 fix in the first 5 minutes of reading the result.
          </p>
          <a href="/auth/login" className="ca-btn ca-btn-lg">Audit my channel free →</a>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
