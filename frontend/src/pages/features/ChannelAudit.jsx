import { useEffect, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import { injectFaqJsonLd } from '../../utils/seo'

/* Channel Audit feature page. Migrated to the editorial design language
   (Fraunces + Barlow, sharp flat cards, warm paper, restrained red). The old
   white→dark→light rhythm is now predominantly warm paper; the product
   visuals (score ring, sample priority-action card) are kept as distinct
   focal panes. Foreign blue/green tints are neutralised to ink/accent
   (see feedback_no_red_icons / no green-blue), data icons are neutral ink,
   and the bottom CTA band was removed (feedback_no_dark_cta_band). ALL copy
   and product detail are preserved. See project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

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
    const style = document.createElement('style')
    style.id = 'ca-styles'
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
      @keyframes caFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .ca-wrap { max-width: 1120px; margin: 0 auto; }
      .ca-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .ca-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .ca-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .ca-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.05; }
      .ca-h1 em { font-style: italic; color: var(--yte-accent); }
      .ca-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .ca-h2 em { font-style: italic; color: var(--yte-accent); }
      .ca-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .ca-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--yte-accent); color: #fff; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 15px 30px; border: none; border-radius: 0; cursor: pointer; text-decoration: none; transition: filter 0.18s, transform 0.18s; }
      .ca-btn:hover { filter: brightness(1.06); transform: translateY(-1px); }
      .ca-btn-lg { font-size: 13px; padding: 17px 36px; }
      .ca-ghost { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 15px 28px; border-radius: 0; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--yte-soft); text-decoration: none; background: var(--yte-surface); border: 1px solid var(--yte-line); transition: color 0.15s, border-color 0.15s; }
      .ca-ghost:hover { color: var(--yte-ink); border-color: var(--yte-line-2); }

      .ca-card { background: var(--yte-surface); border: 1px solid var(--yte-line); }

      .ca-faq-item { border-bottom: 1px solid var(--yte-line); }
      .ca-faq-q { background: none; border: none; cursor: pointer; width: 100%; text-align: left; padding: 22px 0; font-family: ${SERIF}; display: flex; justify-content: space-between; align-items: center; gap: 18px; font-size: 20px; font-weight: 400; color: var(--yte-ink); letter-spacing: -0.2px; line-height: 1.3; transition: color 0.2s; }
      .ca-faq-q:hover { color: var(--yte-accent); }
      .ca-faq-q.open { color: var(--yte-accent); }
      .ca-faq-plus { flex-shrink: 0; font-family: ${SANS}; font-size: 26px; font-weight: 300; color: var(--yte-accent); line-height: 1; transition: transform 0.2s; }
      .ca-faq-plus.open { transform: rotate(45deg); }
      .ca-faq-a { font-family: ${SANS}; font-size: 15.5px; color: var(--yte-soft); line-height: 1.78; padding: 0 0 24px 0; max-width: 720px; display: none; }
      .ca-faq-a.open { display: block; }

      @media (max-width: 900px) {
        .ca-grid-2 { grid-template-columns: 1fr !important; gap: 36px !important; }
        .ca-grid-3 { grid-template-columns: 1fr !important; }
        .ca-grid-4 { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 600px) {
        .ca-grid-4 { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 768px) {
        .ca-section-pad { padding-left: 22px !important; padding-right: 22px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children, center }) {
  return (
    <div className="ca-eyebrow" style={center ? { justifyContent: 'center' } : undefined}>
      <span aria-hidden="true" className="ca-eyebrow-rule" />
      <span className="ca-eyebrow-text">{children}</span>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="ca-faq-item">
      <button className={`ca-faq-q${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span style={{ flex: 1 }}>{q}</span>
        <span aria-hidden="true" className={`ca-faq-plus${open ? ' open' : ''}`}>+</span>
      </button>
      <div className={`ca-faq-a${open ? ' open' : ''}`}>{a}</div>
    </div>
  )
}

/* ── Visual: Score ring + AI assessment (dark focal pane) ──────────────── */
function ScoreVisual() {
  const score = 67
  const circumference = 2 * Math.PI * 50
  const offset = circumference - (score / 100) * circumference
  return (
    <div style={{ background: 'var(--yte-ink)', padding: 32, display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
      {/* Score ring */}
      <div style={{ flexShrink: 0, position: 'relative', width: 140, height: 140 }}>
        <svg width="140" height="140" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="9" />
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.92)" strokeWidth="9" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 60 60)" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: SERIF, fontSize: 46, fontWeight: 400, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>{score}</span>
          <span style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>/ 100</span>
        </div>
      </div>
      <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,0.1)' }} />
      {/* AI assessment */}
      <div style={{ flex: 1, minWidth: 220 }}>
        <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>AI assessment · Sample</p>
        <p style={{ fontFamily: SANS, fontSize: 14.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.78 }}>
          Your channel is publishing consistently and your last 5 videos hold retention above 50%, but Browse + Suggested traffic combined sits at 31%. YouTube isn't pushing you. The bottleneck is packaging, not content. Fixing thumbnail contrast on your next 3 uploads should move CTR from 3.4% to ~5%.
        </p>
        <p style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: '#e6b35c', marginTop: 14, letterSpacing: '0.04em' }}>▲ +6 from last audit · 9 priority actions</p>
      </div>
    </div>
  )
}

/* ── Visual: Sample priority action card (light, sharp) ────────────────── */
function PriorityActionVisual() {
  return (
    <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', borderTop: '3px solid var(--yte-accent)', padding: '20px 24px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingTop: 2 }}>
          <input type="checkbox" readOnly style={{ width: 15, height: 15, accentColor: '#14130f' }} />
          <div style={{ width: 26, height: 26, background: 'var(--yte-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#fff' }}>1</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: 'var(--yte-accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>CTR Health</p>
          <p style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 600, color: 'var(--yte-ink)', lineHeight: 1.5 }}>
            Browse + Suggested traffic at 31%, well below the 40% threshold for healthy algo push. Your packaging (titles + thumbnails) isn't earning impressions.
          </p>
        </div>
        <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: 'var(--yte-accent)', padding: '3px 9px', letterSpacing: '0.08em', textTransform: 'uppercase', border: '1.5px solid var(--yte-accent)', flexShrink: 0 }}>HIGH</span>
      </div>
      <div style={{ height: 1, background: 'var(--yte-line)', marginBottom: 14, marginLeft: 46 }} />
      {/* Body */}
      <div className="ca-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 8, marginLeft: 46 }}>
        <div style={{ background: 'var(--yte-bg-2)', padding: '12px 14px' }}>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: 'var(--yte-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Why now</p>
          <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-soft)', lineHeight: 1.6 }}>If browse + suggested stays under 40% for another 30 days, the algorithm classifies your videos as "low-value" and stops surfacing them entirely.</p>
        </div>
        <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', borderLeft: '3px solid var(--yte-accent)', padding: '12px 16px' }}>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: 'var(--yte-accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Action</p>
          <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-ink)', lineHeight: 1.6 }}>Re-do thumbnails on your last 3 uploads using high-contrast text (4.5:1 minimum) and a face occupying 35–50% of frame. Score each in Thumbnail IQ before applying.</p>
        </div>
        <div style={{ background: 'var(--yte-bg-2)', padding: '12px 14px' }}>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: 'var(--yte-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Expected outcome</p>
          <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-soft)', lineHeight: 1.6 }}>CTR climbs from 3.4% to ~5%, browse share rises to 38–45% within 14–21 days as the algorithm re-tests your videos.</p>
        </div>
      </div>
    </div>
  )
}

/* ── The 8 weighted + 2 informational categories. Straight from app/insights.py ── */
const CATEGORIES = [
  { name: 'CTR Health',                weight: '20%', what: 'Click-through rate per video, scored against the 4–6% benchmark for established channels (2–4% for newer ones). Identifies which titles + thumbnails earn impressions and which kill them.' },
  { name: 'Audience Retention',        weight: '20%', what: 'Average view percentage across your last 20 uploads. Below 40% is a red flag; above 50% is strong. Surfaces which videos hold attention and what they share in common.' },
  { name: 'Content Strategy',          weight: '15%', what: 'Whether your last 20 titles read like one channel or three. Identifies your highest-engagement topic clusters and flags scattered topics that dilute YouTube’s niche classification.' },
  { name: 'Posting Consistency',       weight: '15%', what: '90-day cadence. Videos published, average gap, peak day + hour, Shorts vs long-form split. Flags irregular patterns and timing that misses your audience’s active windows.' },
  { name: 'Engagement Quality',        weight: '10%', what: 'Like-to-view, comment-to-view, and subs-gained-per-video ratios. Surfaces which content types drive subscribers vs which generate passive views that don’t convert.' },
  { name: 'SEO Discoverability',       weight: '10%', what: 'Channel keywords, title structure (primary keyword in first half, 50–70 chars), and description quality. Flags missing setup, weak titles, and untargeted descriptions.' },
  { name: 'Video Length',              weight: '5%',  what: 'Sweet-spot analysis comparing video duration against retention. Flags outliers that are too long for your audience to finish, or too short to capture session-watch-time signal.' },
  { name: 'Traffic Source Intelligence',weight: '5%', what: 'Where views come from. Browse, Suggested, Search, External. Diagnoses whether your problem is algorithmic push (packaging fix) or discovery (SEO fix). Flags over-reliance on one source.' },
  { name: 'Audience Profile',          weight: 'Info',what: 'Device split, top geographies, age + gender breakdown. Mobile-dominant means thumbnail text needs to be larger; unexpected geography means a localization opportunity.' },
  { name: 'Content Shareability',      weight: 'Info',what: 'Shares + playlist-adds vs views. Low share rate on entertainment/educational content is a red flag; high playlist-adds means evergreen content worth doubling down on.' },
]

const ALGO_LEVERS = [
  {
    name: 'Browse + Suggested traffic share',
    benchmark: 'Healthy: combined 40%+. Below 40% = weak algorithmic push.',
    what: 'This is YouTube literally pushing your videos onto homepages and "Up Next" panels. If it’s low, no amount of SEO will save you. The fix is packaging (titles + thumbnails) and early-video retention, in that order.',
  },
  {
    name: 'Session-keeping signal',
    benchmark: 'High APV × high shares-per-1k-views combined.',
    what: 'YouTube rewards videos that extend a viewer’s session more than videos with great retention alone. The audit identifies your top "session-keeper" video by name. The format YouTube actively wants more of from you.',
  },
  {
    name: 'Audience-builder ratio',
    benchmark: 'Subs gained per 1,000 views. Higher = the algorithm sees you growing the platform.',
    what: 'Identifies which video types convert viewers to subscribers. If your “Top audience-builder” is a tutorial but you publish mostly reaction content, the algorithm is telling you what to make more of.',
  },
  {
    name: 'Retention normalised by duration',
    benchmark: '50% APV on a 10-min video > 50% APV on a 4-min video.',
    what: 'Surfaces your true watch-time leader. The video that earns the most absolute minutes-watched per impression. This is the channel’s real winner; long mid-APV videos beat short high-APV ones in the algorithm’s ranking.',
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

function DataIcon({ name }) {
  return (
    <div style={{ width: 38, height: 38, background: 'rgba(20,19,15,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="var(--yte-ink)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d={ICON_PATHS[name]}/>
      </svg>
    </div>
  )
}

const DATA_INPUTS = [
  { icon: 'stats',    label: 'Channel stats',         body: 'Subscribers, total views, video count, channel age, channel keywords.' },
  { icon: 'video',    label: 'Last 20 videos',        body: 'Title, duration, views, CTR, impressions, average view duration, retention %, likes, comments, subs gained.' },
  { icon: 'calendar', label: 'Posting behavior',      body: 'Upload cadence, gaps, peak day + hour, Shorts vs long-form ratio across the last 90 days.' },
  { icon: 'traffic',  label: 'Traffic sources',       body: 'Browse, Suggested, Search, External and other sources. Share % and watch minutes per source.' },
  { icon: 'globe',    label: 'Device + geography',    body: 'Mobile vs desktop vs TV split, top 5 countries with subscribers gained per country.' },
  { icon: 'users',    label: 'Audience demographics', body: 'Age and gender breakdown (when sample size is statistically meaningful).' },
  { icon: 'share',    label: 'Engagement signals',    body: 'Total shares, dislikes, playlist adds across the last 90 days.' },
  { icon: 'zap',      label: 'Algorithm metrics',     body: 'Browse %, suggested %, search %, external %, shares / 1k, comments / 1k, subs / 1k, top session-keeper, top audience-builder, top watch-time leader.' },
  { icon: 'eye',      label: 'Competitor data',       body: 'If Competitor Analysis has run, the audit benchmarks you against your 3 most recent rivals. Title patterns, view averages, content gaps.' },
]

const PLAN_LIMITS = [
  { plan: 'Free',    actions: '5',   note: 'Trial · first audit free' },
  { plan: 'Solo',    actions: '8',   note: '20 audits / month · 3 channels' },
  { plan: 'Growth',  actions: '12',  note: '50 audits / month · 5 channels' },
  { plan: 'Agency',  actions: '15',  note: '150 audits / month · 10 pooled channels' },
]

const FAQS = [
  {
    q: 'How is the channel score calculated?',
    a: <>It’s a deterministic weighted formula across 8 categories. Not an AI guess. CTR Health and Audience Retention each count 20%, Content Strategy and Posting Consistency each count 15%, Engagement Quality and SEO Discoverability each count 10%, Video Length and Traffic Source Intelligence each count 5%. The same data always produces the same score, so improvements between audits are real and measurable. Audience Profile and Content Shareability are scored too but kept informational. They’re context for the actions, not part of the headline number.</>,
  },
  {
    q: 'What’s the difference between Priority Actions and Quick Wins?',
    a: <>Priority Actions are ranked, structured fixes. Each with a specific problem, why-now urgency, the exact action to take, and the expected metric outcome. They’re sized to take 1–4 hours of work each and they’re what move your score. Quick Wins are smaller items you can fix in under 10 minutes (a missing description, a tag fix, a thumbnail re-crop). They don’t need the full structure because the action is obvious.</>,
  },
  {
    q: 'My Browse + Suggested traffic share is 31%. What does that mean?',
    a: <>Below 40% combined means YouTube isn’t actively recommending your videos. You’re relying on people finding you through Search or External links. That’s a packaging problem (titles + thumbnails), not a SEO problem. The audit explicitly flags this in the “Algorithm-push diagnosis” line and at least one of your top 3 priority actions will address it. Fixing packaging on your next 3 uploads typically moves browse + suggested above 40% within 2–3 weeks.</>,
  },
  {
    q: 'Why does my retention category score so low?',
    a: <>Average View Percentage (APV) below 30% triggers a hard score penalty because YouTube stops recommending videos at that level. The algorithm reads it as “not worth showing.” Below 40% is a red flag; above 50% is strong; above 60% is exceptional. The audit pinpoints which specific videos drag your average down and what they share in common (length, intro pattern, topic), so the fix is concrete instead of “improve retention.”</>,
  },
  {
    q: 'How often should I re-audit?',
    a: <>After you’ve changed something. Re-auditing without shipping new videos or updates won’t move the score because the underlying data hasn’t changed. The most useful pattern is: audit → work through priority actions → publish 2–3 new videos that apply the fixes → re-audit and watch the score delta. Most users see meaningful score movement after 4–6 weeks of consistent application. The free trial includes your first audit free, Solo gets 20/month, Growth gets 50/month, Agency gets 150/month.</>,
  },
  {
    q: 'Can I see what changed between audits?',
    a: <>Yes. The score ring shows a delta arrow (▲ +6 from last audit) on the Overview tab once you’ve run more than one. Category scores get the same treatment, so you can see which areas improved versus which regressed. Priority actions you marked done stay tracked, so the next audit knows what you already worked on and prioritizes new bottlenecks instead of repeating fixes.</>,
  },
  {
    q: 'Does the audit work for Shorts-only channels?',
    a: <>Yes, but with caveats. Shorts retention reads differently from long-form (people swipe at the title, not after a 15-second hook), so the audit splits the analysis when it sees Shorts in your last 20. CTR Health gets less weight for Shorts because YouTube doesn’t expose CTR for them via the API. Audience Retention, Posting Consistency, and Algorithm signals (sub-builder ratio especially) work normally and are usually the most important categories for Shorts channels.</>,
  },
  {
    q: 'What if my channel is brand new?',
    a: <>You need at least 5 published videos and roughly 30 days of channel history for the audit to be statistically meaningful. With less data, the AI can’t separate noise from signal. It would pretend to know things it doesn’t. We tell you upfront if your channel doesn’t have enough data and let you wait until it does, instead of producing an audit that’s mostly hallucination.</>,
  },
  {
    q: 'How is this different from VidIQ’s “score” or YouTube Studio’s analytics?',
    a: <>YouTube Studio shows you what happened. VidIQ shows you a score on every video. Neither tells you what to do next, in what order, and why. YTGrowth’s audit reads all of that data plus 90 days of traffic-source breakdown and demographic data, runs it through an AI tuned specifically on YouTube’s 2025 ranking signals, and produces a ranked action list with specific numbers (“CTR climbs from 3.4% to ~5%”) instead of generic advice (“improve your CTR”).</>,
  },
  {
    q: 'Will the audit ever change anything on my channel?',
    a: <>No. The audit is read-only. We pull your stats and analytics via the official YouTube Data API but we cannot upload, edit, comment on, or delete anything. The only place anything ever gets changed on YouTube is when you click “Apply” in SEO Studio after reviewing a title or description rewrite. And that’s an explicit, per-video action.</>,
  },
]

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function ChannelAudit() {
  useStyles()
  useEffect(() => { injectFaqJsonLd(FAQS) }, [])
  const { isMobile } = useBreakpoint()

  const H2 = isMobile ? 30 : 42

  return (
    <div style={{ background: 'var(--yte-bg)', minHeight: '100vh', fontFamily: SANS, color: 'var(--yte-ink)' }}>

      {/* ════ NAV ════ */}
      <SiteHeader />

      {/* ════ 1. HERO ════ */}
      <section className="ca-section-pad" style={{ padding: isMobile ? '60px 22px 48px' : '104px 48px 64px', background: 'var(--yte-bg)' }}>
        <div className="ca-wrap" style={{ animation: 'caFadeUp 0.5s ease both' }}>
          <Eyebrow>AI Channel Audit</Eyebrow>
          <h1 className="ca-h1" style={{ fontSize: isMobile ? 34 : 56, marginBottom: 22, maxWidth: 880, textWrap: 'balance' }}>
            10 categories. <em>One ranked list of fixes.</em> No more guessing.
          </h1>
          <p className="ca-lead" style={{ fontSize: isMobile ? 16 : 17.5, maxWidth: 700, marginBottom: 32, textWrap: 'pretty' }}>
            YTGrowth pulls your full YouTube data, runs it through an AI tuned on the signals YouTube’s recommendation engine rewards, and returns a prioritized list of fixes. Each with the specific problem, why it matters now, the exact action to take, and the metric you’ll see move.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/auth/login" className="ca-btn ca-btn-lg">Audit my channel free →</a>
            <a href="#how" className="ca-ghost">See how it works</a>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', marginTop: 22, letterSpacing: '0.03em' }}>
            Free trial · first audit free · no credit card · ~60 seconds per run
          </p>
        </div>
      </section>

      {/* ════ 2. SCORE + ASSESSMENT (split) ════ */}
      <section className="ca-section-pad" style={{ padding: isMobile ? '64px 22px' : '88px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="ca-grid-2 ca-wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 56, alignItems: 'center' }}>
          <div>
            <Eyebrow>What you get</Eyebrow>
            <h2 className="ca-h2" style={{ fontSize: H2, marginBottom: 18 }}>
              A single weighted score, with the <em>actual reason it’s where it is.</em>
            </h2>
            <p className="ca-lead" style={{ fontSize: 17, marginBottom: 24 }}>
              The deterministic formula means score changes between audits are real, not noise. The AI assessment paragraph is what most users read first. Plain English, naming the specific lever holding the channel back.
            </p>
            {[
              'Weighted 0–100 score with delta vs your last audit',
              '2–3 sentence assessment that names the bottleneck',
              'Eight scored categories, each colour-coded by health',
              'Updates instantly when you re-audit after shipping fixes',
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 11 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--yte-accent)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M2.5 7.2 5.4 10l6.1-6"/></svg>
                <span style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.6 }}>{b}</span>
              </div>
            ))}
          </div>
          <div><ScoreVisual /></div>
        </div>
      </section>

      {/* ════ 3. THE 10 CATEGORIES ════ */}
      <section className="ca-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="ca-wrap">
          <div style={{ maxWidth: 760, marginBottom: 44 }}>
            <Eyebrow>The 10 categories</Eyebrow>
            <h2 className="ca-h2" style={{ fontSize: H2, marginBottom: 16, textWrap: 'balance' }}>
              Every dimension of channel health, <em>weighted by what YouTube rewards.</em>
            </h2>
            <p className="ca-lead" style={{ fontSize: 17 }}>
              Eight categories carry weight in the headline score; two more (Audience Profile and Content Shareability) are scored for context but don’t inflate or deflate the number. Weights aren’t arbitrary. They reflect how heavily each lever moves the recommendation engine.
            </p>
          </div>
          <div className="ca-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)' }}>
            {CATEGORIES.map((cat, i) => (
              <div key={i} style={{ background: 'var(--yte-surface)', padding: '22px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10, gap: 12 }}>
                  <p style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.2px' }}>{cat.name}</p>
                  <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', color: cat.weight === 'Info' ? 'var(--yte-muted)' : 'var(--yte-accent)', background: cat.weight === 'Info' ? 'rgba(20,19,15,0.05)' : 'var(--yte-accent-soft)', padding: '3px 9px' }}>
                    {cat.weight === 'Info' ? 'Info only' : `Weight · ${cat.weight}`}
                  </span>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-soft)', lineHeight: 1.72 }}>{cat.what}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 4. PRIORITY ACTION ANATOMY (split) ════ */}
      <section className="ca-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="ca-grid-2 ca-wrap" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 56, alignItems: 'center' }}>
          <div style={{ order: isMobile ? 1 : 0 }}>
            <PriorityActionVisual />
          </div>
          <div style={{ order: isMobile ? 0 : 1 }}>
            <Eyebrow>Priority action anatomy</Eyebrow>
            <h2 className="ca-h2" style={{ fontSize: H2, marginBottom: 18 }}>
              Every fix is structured like <em>a real diagnosis.</em>
            </h2>
            <p className="ca-lead" style={{ fontSize: 17, marginBottom: 26 }}>
              Each priority action has four parts. You don’t just learn what’s wrong. You learn why it matters now, exactly what to do, and what number to watch. Check them off as you ship; the next audit measures the delta against what you completed.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {[
                { label: 'Problem',          body: 'The specific issue, with a real number from your data.' },
                { label: 'Why now',          body: 'What breaks if you don’t fix it in the next 14–30 days.' },
                { label: 'Action',           body: 'The exact, do-able step. No vague advice.' },
                { label: 'Expected outcome', body: 'The metric that will move, and roughly by how much.' },
              ].map((p, i) => (
                <div key={i} style={{ borderLeft: '2px solid var(--yte-accent)', paddingLeft: 12 }}>
                  <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: 'var(--yte-accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{p.label}</p>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-soft)', lineHeight: 1.6 }}>{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════ 5. HOW IT WORKS ════ */}
      <section id="how" className="ca-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ maxWidth: 720, marginBottom: 44 }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="ca-h2" style={{ fontSize: H2 }}>One audit, <em>~60 seconds, end-to-end.</em></h2>
            <p className="ca-lead" style={{ fontSize: 17, marginTop: 14, maxWidth: 580 }}>
              Five stages from sign-in to ranked action list. Steps 2–4 run in parallel, so most users see the result within 60 seconds.
            </p>
          </div>
          {(() => {
            const steps = [
              { n: '01', t: 'Connect your channel', b: 'Sign in with the Google account that owns your YouTube channel. Read-only access via the official YouTube Data API. We never touch your videos, comments, or settings.' },
              { n: '02', t: 'Data pull begins',     b: 'Last 20 videos, 90 days of analytics, traffic sources, demographics, engagement signals. Pulled in parallel. Takes 15–25 seconds.' },
              { n: '03', t: 'Algorithm signals',    b: 'We compute the metrics YouTube’s recommendation engine rewards. Browse %, session-keeper, audience-builder ratio, watch-time leader.' },
              { n: '04', t: 'AI runs the audit',    b: 'Claude Sonnet 4.6 reads the full data plus any stored competitor analyses and produces score, summary, and priority actions in ~30 seconds.' },
              { n: '05', t: 'You see the result',   b: 'Score ring + AI assessment, score breakdown across 8 weighted categories, priority actions you can check off as you ship them, plus quick wins.' },
            ]
            const Card = ({ s }) => (
              <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', padding: '22px 22px 24px', flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: 'var(--yte-accent)', letterSpacing: '0.06em', marginBottom: 14 }}>{s.n}</div>
                <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 400, color: 'var(--yte-ink)', marginBottom: 10, letterSpacing: '-0.2px', lineHeight: 1.2 }}>{s.t}</p>
                <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-soft)', lineHeight: 1.65 }}>{s.b}</p>
              </div>
            )
            const Arrow = ({ down }) => (
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', color: 'var(--yte-muted)', margin: down ? '8px auto' : 0 }}>
                <svg width="16" height="16" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {down ? <path d="M6 2v8M3 7l3 3 3-3"/> : <path d="M2 6h8M7 3l3 3-3 3"/>}
                </svg>
              </div>
            )
            if (isMobile) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {steps.map((s, i) => (
                    <div key={i}>
                      <Card s={s} />
                      {i < steps.length - 1 && <Arrow down />}
                    </div>
                  ))}
                </div>
              )
            }
            return (
              <div style={{ display: 'flex', alignItems: 'stretch', gap: 10 }}>
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

      {/* ════ 6. ALGORITHM LEVERS ════ */}
      <section className="ca-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ maxWidth: 760, marginBottom: 40 }}>
            <Eyebrow>Algorithm levers it surfaces</Eyebrow>
            <h2 className="ca-h2" style={{ fontSize: H2, marginBottom: 16, textWrap: 'balance' }}>
              We pre-compute the metrics <em>YouTube’s recommendation engine weights.</em>
            </h2>
            <p className="ca-lead" style={{ fontSize: 17 }}>
              Most YouTube tools score you on vanity metrics. Views, likes, subs. The algorithm doesn’t care about those directly. It cares about these four signals, in this order. The audit reads each one off your real data and builds priority actions specifically to move them.
            </p>
          </div>
          <div className="ca-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)' }}>
            {ALGO_LEVERS.map((lever, i) => (
              <div key={i} style={{ background: 'var(--yte-surface)', padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: 13 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: 'var(--yte-accent)', marginTop: 5 }}>{String(i + 1).padStart(2, '0')}</span>
                  <p style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', lineHeight: 1.25 }}>{lever.name}</p>
                </div>
                <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 7, background: 'rgba(20,19,15,0.05)', padding: '5px 11px' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--yte-ink)' }} />
                  <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: 'var(--yte-soft)' }}>{lever.benchmark}</span>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-soft)', lineHeight: 1.72 }}>{lever.what}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 7. WHAT DATA FEEDS IT ════ */}
      <section className="ca-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="ca-wrap">
          <div style={{ maxWidth: 720, marginBottom: 40 }}>
            <Eyebrow>Full transparency</Eyebrow>
            <h2 className="ca-h2" style={{ fontSize: H2, marginBottom: 16 }}>
              Exactly what we pull from your channel.
            </h2>
            <p className="ca-lead" style={{ fontSize: 17 }}>
              Read-only access via the official YouTube Data API. Nine data sources feed every audit. We never write, edit, or store anything outside our analytics tables.
            </p>
          </div>
          <div className="ca-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)' }}>
            {DATA_INPUTS.map((d, i) => (
              <div key={i} style={{ background: 'var(--yte-surface)', padding: '22px 22px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <DataIcon name={d.icon} />
                  <p style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 600, color: 'var(--yte-ink)', letterSpacing: '-0.1px' }}>{d.label}</p>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-soft)', lineHeight: 1.65 }}>{d.body}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', padding: '14px 22px', marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--yte-ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M11 4.5v-1A2.5 2.5 0 0 0 8.5 1h-3A2.5 2.5 0 0 0 3 3.5v1M2 4.5h10v8H2zM7 7v3"/>
            </svg>
            <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-soft)' }}>
              <span style={{ fontWeight: 600, color: 'var(--yte-ink)' }}>Read-only OAuth scope.</span> Revoke access anytime from your Google account settings.
            </p>
          </div>
        </div>
      </section>

      {/* ════ 8. PLAN LIMITS ════ */}
      <section className="ca-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ maxWidth: 720, marginBottom: 40 }}>
            <Eyebrow>By plan</Eyebrow>
            <h2 className="ca-h2" style={{ fontSize: H2, marginBottom: 16, textWrap: 'balance' }}>
              Same audit. <em>More fixes per run as you scale.</em>
            </h2>
            <p className="ca-lead" style={{ fontSize: 17 }}>
              Higher tiers don’t unlock different categories. Every plan reads the same 10 dimensions. They unlock more depth: more priority actions returned per audit, more audits per month, more channels under one account.
            </p>
          </div>
          <div className="ca-grid-4" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 1, background: 'var(--yte-line)', border: '1px solid var(--yte-line)' }}>
            {PLAN_LIMITS.map((p, i) => {
              const isAccent = p.plan === 'Growth'
              return (
                <div key={i} style={{ background: 'var(--yte-surface)', padding: '24px 22px 22px', position: 'relative', boxShadow: isAccent ? 'inset 0 2px 0 var(--yte-accent)' : 'none' }}>
                  {isAccent && (
                    <span style={{ position: 'absolute', top: 0, right: 16, fontFamily: SANS, fontSize: 9, fontWeight: 700, color: '#fff', background: 'var(--yte-accent)', padding: '3px 9px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Most popular</span>
                  )}
                  <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>{p.plan}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                    <p style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.8px', lineHeight: 1 }}>{p.actions}</p>
                    <p style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)' }}>priority actions</p>
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)', marginBottom: 14 }}>per audit</p>
                  <div style={{ height: 1, background: 'var(--yte-line)', marginBottom: 12 }} />
                  <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-soft)', lineHeight: 1.55 }}>{p.note}</p>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)' }}>Same scoring formula across all plans.</p>
            <a href="/#pricing" style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-accent)', textDecoration: 'none', fontWeight: 600 }}>See full pricing →</a>
          </div>
        </div>
      </section>

      {/* ════ 9. FAQ ════ */}
      <section className="ca-section-pad" style={{ padding: isMobile ? '64px 22px 80px' : '104px 48px 120px', background: 'var(--yte-bg)' }}>
        <div className="ca-grid-2" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: 64, alignItems: 'flex-start' }}>
          <div style={{ position: isMobile ? 'static' : 'sticky', top: 100 }}>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="ca-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 16, textWrap: 'balance' }}>
              The audit, <em>answered honestly.</em>
            </h2>
            <p className="ca-lead" style={{ fontSize: 14.5 }}>
              Real answers from how the product behaves. Including the unflattering ones (when it won’t work, what it doesn’t do, where the limits are).
            </p>
            <a href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-accent)', textDecoration: 'none', fontWeight: 600, marginTop: 16 }}>
              Still have questions? Email us →
            </a>
          </div>
          <div style={{ borderTop: '1px solid var(--yte-line)' }}>
            {FAQS.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
