import { useEffect, useState, useMemo } from 'react'
import LandingFooter from '../../components/LandingFooter'

/* ─── Free SEO tool: YouTube Subscriber Money Calculator ──────────────────
   /tools/youtube-subscriber-money-calculator. Targets "how many
   subscribers to make money on youtube" + "youtube subscriber money
   calculator" search queries.

   Two-mode calculator:
     1. "How much will I make?" given subs + cadence + niche + country
     2. "How many subs do I need?" to hit common income targets

   Visual DNA = Landing.jsx + YoutubeMoneyCalculator.jsx parity. DM Sans
   for headlines, Inter for body, eyebrow pills, Landing FAQ pattern.
   100% client-side. No backend, no AI cost. */

function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return { isMobile: width <= 768, isTablet: width <= 1024 }
}

function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="#ff3b30"/>
      <path d="M23.2 11.6a2.1 2.1 0 0 0-1.48-1.48C20.55 9.8 16 9.8 16 9.8s-4.55 0-5.72.32A2.1 2.1 0 0 0 8.8 11.6 22 22 0 0 0 8.5 16a22 22 0 0 0 .3 4.4 2.1 2.1 0 0 0 1.48 1.48C11.45 22.2 16 22.2 16 22.2s4.55 0 5.72-.32a2.1 2.1 0 0 0 1.48-1.48A22 22 0 0 0 23.5 16a22 22 0 0 0-.3-4.4z" fill="white"/>
      <polygon points="13.5,19 19.5,16 13.5,13" fill="#ff3b30"/>
    </svg>
  )
}

function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-smc-styles')) return
    const link = document.createElement('link')
    link.id = 'ytg-smc-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytg-smc-styles'
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
        --ytg-border-2:     rgba(10,10,15,0.16);
        --ytg-accent:       #e5302a;
        --ytg-accent-text:  #c22b25;
        --ytg-accent-light: rgba(229,48,42,0.07);
        --ytg-shadow-sm:    0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
        --ytg-shadow:       0 2px 6px rgba(0,0,0,0.08), 0 10px 32px rgba(0,0,0,0.11);
        --ytg-shadow-lg:    0 4px 16px rgba(0,0,0,0.11), 0 24px 60px rgba(0,0,0,0.14);
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden;  scrollbar-width: auto; scrollbar-color: rgba(10,10,15,0.28) transparent; }
      ::-webkit-scrollbar { width: 12px; height: 12px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb {
        background-color: rgba(10,10,15,0.28);
        border-radius: 10px;
        border: 3px solid transparent;
        background-clip: content-box;
      }
      ::-webkit-scrollbar-thumb:hover { background-color: rgba(10,10,15,0.48); background-clip: content-box; }@keyframes smcFadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .smc-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
        padding: 14px 28px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
        white-space: nowrap;
      }
      .smc-btn:hover {
        filter: brightness(1.07); transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,48,42,0.42);
      }
      .smc-btn-lg { font-size: 16px; padding: 17px 36px; }

      .smc-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        background: #ffffff;
        border: 1px solid rgba(10,10,15,0.09);
        border-radius: 100px;
        padding: 5px 12px 5px 10px;
        margin-bottom: 20px;
        box-shadow: 0 1px 2px rgba(10,10,15,0.04);
      }
      .smc-eyebrow-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--ytg-accent);
        box-shadow: 0 0 0 3px rgba(229,48,42,0.12);
      }
      .smc-eyebrow-text {
        font-size: 11px; font-weight: 700; color: var(--ytg-text-2);
        text-transform: uppercase; letter-spacing: 0.09em;
      }

      .smc-nav-link {
        font-size: 15px; color: rgba(10,10,15,0.52); font-weight: 500;
        text-decoration: none; transition: color 0.15s; letter-spacing: -0.1px;
      }
      .smc-nav-link:hover { color: rgba(10,10,15,0.88); }

      .smc-input {
        width: 100%; padding: 12px 14px;
        font-size: 14px; font-weight: 500; font-family: inherit;
        color: var(--ytg-text);
        background: #fafafb; border: 1px solid var(--ytg-border);
        border-radius: 10px; outline: none;
        transition: border-color 0.15s, background 0.15s;
        -webkit-appearance: none;
      }
      .smc-input:focus { border-color: rgba(10,10,15,0.28); background: #fff; }

      .smc-faq-answer {
        display: grid; grid-template-rows: 0fr; opacity: 0;
        transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
      }
      .smc-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .smc-faq-answer-inner { overflow: hidden; }

      .smc-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
      .smc-calc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }

      @media (max-width: 900px) {
        .smc-grid-3 { grid-template-columns: 1fr; }
        .smc-calc-grid { grid-template-columns: 1fr; }
      }
      @media (max-width: 768px) {
        .smc-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .smc-cta-pad { padding: 70px 24px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

/* ── Niche RPM tables (mirror YoutubeMoneyCalculator) ─────────────────── */
const NICHES = [
  { key: 'finance',   label: 'Finance / Investing / Crypto',  low: 20, high: 40 },
  { key: 'tech',      label: 'Tech / Software / SaaS reviews', low: 12, high: 22 },
  { key: 'business',  label: 'Business / Marketing',           low: 15, high: 28 },
  { key: 'education', label: 'Education / Tutorials',          low: 8,  high: 16 },
  { key: 'beauty',    label: 'Beauty / Fashion / Luxury',      low: 7,  high: 14 },
  { key: 'lifestyle', label: 'Lifestyle / Vlog',               low: 4,  high: 9 },
  { key: 'fitness',   label: 'Fitness / Health',               low: 6,  high: 12 },
  { key: 'travel',    label: 'Travel',                         low: 5,  high: 11 },
  { key: 'food',      label: 'Food / Cooking',                 low: 4,  high: 9 },
  { key: 'gaming',    label: 'Gaming',                         low: 2,  high: 6 },
  { key: 'music',     label: 'Music',                          low: 1.5, high: 4 },
  { key: 'entertain', label: 'Entertainment / Comedy',         low: 2,  high: 5 },
  { key: 'kids',      label: "Kids' content",                  low: 1,  high: 3 },
]

const COUNTRIES = [
  { key: 'tier1',  label: 'United States / UK / Canada / Australia', mult: 1.0 },
  { key: 'tier2',  label: 'Western Europe (Germany, France, NL...)', mult: 0.72 },
  { key: 'tier3',  label: 'Developed Asia (Japan, S. Korea, SG)',     mult: 0.62 },
  { key: 'tier4',  label: 'Eastern Europe (Poland, Czech, etc.)',     mult: 0.45 },
  { key: 'tier5',  label: 'Latin America (Brazil, Mexico, Arg...)',   mult: 0.32 },
  { key: 'tier6',  label: 'India / SE Asia',                          mult: 0.22 },
  { key: 'tier7',  label: 'Africa / Other',                           mult: 0.18 },
  { key: 'mixed',  label: 'Mixed / Global audience',                  mult: 0.55 },
]

/* Sub-watch-rate model: across the platform, ~10-25% of total subs watch
   any given upload, with non-sub views adding another 30-80% multiplier
   from search / suggested / browse. Combine into a per-video reach
   coefficient: subs * coef = views per video. */
const REACH_COEF_LOW  = 0.13   // conservative: 13% of subs see each upload, light non-sub overflow
const REACH_COEF_HIGH = 0.32   // optimistic: 32% reach, healthy non-sub discovery

/* ── Helpers ────────────────────────────────────────────────────────────── */
function fmtMoney(n) {
  const v = Math.max(0, Math.round(n))
  return '$' + v.toLocaleString()
}
function fmtNum(n) {
  if (n == null || !isFinite(n)) return ', '
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + 'K'
  return Math.round(n).toLocaleString()
}

const TARGETS = [500, 1000, 3000, 5000, 10000]

/* ── FAQ data ───────────────────────────────────────────────────────────── */
const FAQS = [
  { q: 'How does this subscriber-to-money calculator work?',
    a: "It uses three inputs to estimate your earnings: subscriber count, how many videos you upload per month, and a niche-and-country RPM range. Subscribers don't equal income directly. What matters is how many of those subs actually watch your uploads (the reach coefficient) plus the discovery views from search and suggested. We multiply your effective monthly views by realistic RPM ranges per niche and country to give you a low-to-high earnings estimate." },
  { q: 'Why are subscribers a bad direct measure of income?',
    a: "Most subscribers do not watch your videos. The platform-wide average is roughly 10-25% of subs watching any given upload. The rest are dormant, watch occasionally, or never come back. A 100k channel with sleeping subs can earn less than a 20k channel with high engagement. Income tracks views, not the badge count on your channel page." },
  { q: 'What is the reach coefficient this calculator uses?',
    a: "We model two scenarios: a conservative 13% of subs watching each upload (light non-sub discovery overflow on top), and an optimistic 32% (healthy search and suggested traffic stacking on the sub base). Real channels land between these depending on how strong their hooks are, how often they upload, and how well their thumbnails work in suggested feeds." },
  { q: 'How is this different from the YouTube Money Calculator?',
    a: "The Money Calculator goes from views to income (you tell it your monthly views, it estimates earnings). This calculator goes from subscribers to income (it estimates your views first, then your earnings). It's the right tool when you don't know your view count yet, or when you're planning a channel and only have a target subscriber count in mind." },
  { q: 'How many subscribers do I need to be eligible to monetize?',
    a: "YouTube Partner Program (YPP) eligibility requires 1,000 subscribers AND either 4,000 valid public watch hours in the past 12 months OR 10 million Shorts views in the past 90 days. The 1,000 sub threshold is a gate, not a paycheck: most 1,000-sub channels earn under $20/month from ads. Real income kicks in around 10k-50k subs depending on niche." },
  { q: "Why does my niche change the result so much?",
    a: 'Advertisers bid wildly different amounts depending on the audience. A finance subscriber is worth tens of dollars in lifetime ad value; a kids-content subscriber is worth a fraction of that. Niche outweighs subscriber count: a 50k finance channel can earn more than a 500k gaming channel. Pick your niche with this in mind, especially early.' },
  { q: "Why does audience country matter?",
    a: 'US, UK, Canada, and Australia have the highest ad spend on the planet. A subscriber from a tier-1 country can be worth 4-5x a subscriber from a tier-3 country in ad-revenue terms. The same channel with the same content earns dramatically different amounts depending on who clicked subscribe. This is why creators producing English content for global audiences scale revenue faster.' },
  { q: 'Should I optimize for subscribers or for views?',
    a: "Views, every time. Subscribers are a lagging indicator of content quality, but views are what monetizes. A growth strategy that targets views (better titles, thumbnails, hooks, retention) drives subs as a side effect. A strategy that targets subscribers directly (sub-baiting, giveaways, follow-for-follow) attracts low-quality subs who never watch and depress your reach coefficient over time." },
  { q: 'How does upload cadence change my income?',
    a: 'More uploads roughly equals more monthly views, with diminishing returns once you exceed your audience\'s tolerance for new content. Going from 1 to 4 uploads per month often doubles or triples income; going from 4 to 16 rarely 4x\'s it because each video gets less attention from your existing sub base. The sweet spot for most niches is 4-8 uploads per month.' },
  { q: 'Beyond ads, what other income streams should I plan for?',
    a: "Most full-time creators have 4-6 income streams: brand sponsorships (often the largest line item, paying $20-$50 per 1,000 views in tier-1 niches), affiliate marketing, digital products (courses, templates), channel memberships or Patreon, merchandise, and Super Chat during live streams. A channel earning $2,000/mo from ads might earn $8,000/mo total once you count the rest." },
  { q: 'Why is there such a wide low-to-high range in the estimate?',
    a: "Ad rates vary wildly within the same niche. A finance channel covering crypto memes earns very different RPM than one covering tax planning, even though both file under \"finance\". Add seasonality (Q4 ads pay 30-40% more than Q1), watch-time variance, mid-roll placement, and ad-blocker rates. The range we show is the realistic band for that niche-and-country combination." },
  { q: 'Is this calculator free? Will you sell my data?',
    a: "Yes, free forever. The calculator runs entirely in your browser. No inputs are sent to our servers, no email required, no signup. We built it as a genuine free tool because creators deserve a realistic forecast before they pour months into a niche. If you want a real personalised growth plan beyond just an estimate, you can connect your channel for a free AI audit, but that's entirely optional." },
]

/* ── Eyebrow component ──────────────────────────────────────────────────── */
function Eyebrow({ children }) {
  return (
    <div className="smc-eyebrow">
      <span aria-hidden="true" className="smc-eyebrow-dot" />
      <span className="smc-eyebrow-text">{children}</span>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function YoutubeSubscriberMoneyCalculator() {
  useGlobalStyles()
  const { isMobile, isTablet } = useBreakpoint()

  const [subs, setSubs]               = useState(10000)
  const [videosPerMonth, setVideos]   = useState(4)
  const [niche, setNiche]             = useState('tech')
  const [country, setCountry]         = useState('tier1')
  const [openFaq, setOpenFaq]         = useState(0)

  const result = useMemo(() => {
    const n = NICHES.find(x => x.key === niche) || NICHES[0]
    const c = COUNTRIES.find(x => x.key === country) || COUNTRIES[0]
    const lowRpm  = n.low  * c.mult
    const highRpm = n.high * c.mult

    // Effective views per upload = subs * reach coefficient
    // Monthly views = views/upload * uploads
    const monthlyViewsLow  = subs * REACH_COEF_LOW  * videosPerMonth
    const monthlyViewsHigh = subs * REACH_COEF_HIGH * videosPerMonth

    const monthlyLow  = monthlyViewsLow  * (lowRpm  / 1000)
    const monthlyHigh = monthlyViewsHigh * (highRpm / 1000)

    // Per-target subs needed to hit each milestone (use mid-point assumptions)
    const midRpm   = (lowRpm + highRpm) / 2
    const midReach = (REACH_COEF_LOW + REACH_COEF_HIGH) / 2
    const targetRows = TARGETS.map(target => {
      // target = subsNeeded * midReach * videosPerMonth * (midRpm/1000)
      // → subsNeeded = target * 1000 / (midReach * videosPerMonth * midRpm)
      const denom = midReach * Math.max(1, videosPerMonth) * midRpm
      const subsNeeded = denom > 0 ? (target * 1000) / denom : Infinity
      return { target, subsNeeded, gap: subsNeeded - subs }
    })

    return {
      lowRpm, highRpm,
      monthlyViewsLow, monthlyViewsHigh,
      monthlyLow, monthlyHigh,
      annualLow:  monthlyLow  * 12,
      annualHigh: monthlyHigh * 12,
      targetRows,
    }
  }, [subs, videosPerMonth, niche, country])

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(10,10,15,0.1)', padding: isMobile ? '0 20px' : '0 48px 0 80px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(244,244,246,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', minWidth: 0 }}>
          <Logo size={28} />
          <span style={{ fontWeight: 800, fontSize: 17, color: '#0a0a0f', letterSpacing: '-0.4px', whiteSpace: 'nowrap' }}>YTGrowth</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {!isMobile && <a href="/" className="smc-nav-link">← Back to home</a>}
          <a href="/auth/login" className="smc-btn"
            style={{ padding: isMobile ? '8px 18px' : '9px 22px', fontSize: 13, borderRadius: 100, whiteSpace: 'nowrap' }}>
            {isMobile ? 'Try free' : 'Try YTGrowth free'}
          </a>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="smc-section-pad" style={{ position: 'relative', padding: isMobile ? '64px 24px 56px' : '110px 48px 84px', textAlign: 'center', background: '#ffffff', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120vw', maxWidth: 1400, height: 620, background: 'radial-gradient(ellipse at center top, rgba(229,48,42,0.07) 0%, rgba(229,48,42,0.02) 40%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'smcFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 34 : isTablet ? 56 : 64, lineHeight: isMobile ? 1.1 : 1.04, letterSpacing: isMobile ? '-0.6px' : '-2.2px', color: 'var(--ytg-text)', marginBottom: 22, textWrap: 'balance' }}>
            How much will <span style={{ color: 'var(--ytg-accent)' }}>your subscriber count</span> earn you?
          </h1>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 660, margin: '0 auto 28px', textWrap: 'pretty' }}>
            A realistic estimate of YouTube income based on your subscriber count, upload cadence, niche, and audience country. Plus how many subs you'd need to hit common income targets.
          </p>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', fontWeight: 500 }}>
            No signup. No email. Free forever.
          </p>
        </div>
      </section>

      {/* ══ CALCULATOR ══ */}
      <section id="calculator" className="smc-section-pad" style={{ padding: isMobile ? '48px 20px 80px' : '72px 48px 110px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div className="smc-calc-grid">

            {/* LEFT. Inputs card */}
            <div style={{ background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-lg)', padding: isMobile ? 26 : 36 }}>

              {/* Subscribers */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Subscribers</label>
                  <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--ytg-accent)', letterSpacing: '-0.8px', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(subs)}</span>
                </div>
                <input type="range" min={100} max={5000000} step={100} value={subs}
                  onChange={e => setSubs(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--ytg-accent)', cursor: 'pointer', height: 4 }}/>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ytg-text-3)', marginTop: 4 }}>
                  <span>100</span><span>50K</span><span>500K</span><span>5M</span>
                </div>
              </div>

              {/* Uploads per month */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Uploads per month</label>
                  <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--ytg-accent)', letterSpacing: '-0.8px', fontVariantNumeric: 'tabular-nums' }}>{videosPerMonth}</span>
                </div>
                <input type="range" min={1} max={30} step={1} value={videosPerMonth}
                  onChange={e => setVideos(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--ytg-accent)', cursor: 'pointer', height: 4 }}/>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ytg-text-3)', marginTop: 4 }}>
                  <span>1</span><span>8</span><span>16</span><span>30</span>
                </div>
              </div>

              {/* Niche */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Niche</label>
                <select className="smc-input" value={niche} onChange={e => setNiche(e.target.value)}>
                  {NICHES.map(n => <option key={n.key} value={n.key}>{n.label}</option>)}
                </select>
              </div>

              {/* Country */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Audience country</label>
                <select className="smc-input" value={country} onChange={e => setCountry(e.target.value)}>
                  {COUNTRIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>

              <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', marginTop: 22, lineHeight: 1.6 }}>
                Estimates assume 13-32% of your subscribers watch each upload, with realistic RPM ranges by niche and audience country. Real earnings vary with watch time, mid-roll placement, and seasonal ad demand.
              </p>
            </div>

            {/* RIGHT. Result column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Headline result */}
              <div style={{ background: 'var(--ytg-accent)', borderRadius: 22, color: '#fff', padding: isMobile ? 28 : 36, boxShadow: '0 4px 18px rgba(229,48,42,0.32), 0 24px 60px rgba(229,48,42,0.18)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.78, marginBottom: 12 }}>
                  Estimated monthly earnings
                </div>
                <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 36 : 46, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.05, marginBottom: 8 }}>
                  {fmtMoney(result.monthlyLow)} - {fmtMoney(result.monthlyHigh)}
                </div>
                <div style={{ fontSize: 13.5, opacity: 0.82 }}>
                  {fmtNum(subs)} subs · {videosPerMonth} {videosPerMonth === 1 ? 'upload' : 'uploads'}/mo · {(NICHES.find(n => n.key === niche) || NICHES[0]).label}
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '22px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.74, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Per year</div>
                    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: '-0.8px' }}>{fmtMoney(result.annualLow)} - {fmtMoney(result.annualHigh)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, opacity: 0.74, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Monthly views</div>
                    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: '-0.8px' }}>{fmtNum(result.monthlyViewsLow)} - {fmtNum(result.monthlyViewsHigh)}</div>
                  </div>
                </div>
              </div>

              {/* Targets card */}
              <div style={{ background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: isMobile ? 22 : 26 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>To hit these targets</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.targetRows.map(row => {
                    const reached = row.gap <= 0
                    return (
                      <div key={row.target} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 14px', borderRadius: 12,
                        background: reached ? 'rgba(5,150,105,0.06)' : '#fafafb',
                        border: `1px solid ${reached ? 'rgba(5,150,105,0.18)' : 'var(--ytg-border)'}`,
                      }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ytg-text)', letterSpacing: '-0.2px' }}>
                            {fmtMoney(row.target)}<span style={{ fontSize: 12, color: 'var(--ytg-text-3)', fontWeight: 500 }}> /mo</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--ytg-text-3)', marginTop: 2 }}>
                            {reached
                              ? `Already reachable at ${fmtNum(subs)} subs`
                              : `Need ~${fmtNum(row.subsNeeded)} subs (${fmtNum(row.gap)} more)`}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {reached ? (
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '3px 9px', borderRadius: 100, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                              Reached
                            </span>
                          ) : (
                            <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 18, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.5px' }}>
                              {fmtNum(row.subsNeeded)}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', marginTop: 14, lineHeight: 1.55 }}>
                  Targets assume your current upload cadence, niche, and audience country stay constant. Move any of those and the math changes.
                </p>
              </div>

              {/* Grow CTA */}
              <div style={{ background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: 26 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Grow these numbers</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ytg-text)', lineHeight: 1.5, marginBottom: 8, letterSpacing: '-0.2px' }}>
                  Subscribers without engagement is just a vanity number.
                </p>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.65, marginBottom: 18 }}>
                  YTGrowth's free AI audit looks at your actual reach coefficient, your CTR, and your retention curves. It tells you which videos are losing your existing subs and which titles are leaving discovery views on the table.
                </p>
                <a href="/auth/login" className="smc-btn" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 14, borderRadius: 14 }}>
                  Get my free audit →
                </a>
                <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', textAlign: 'center', marginTop: 10 }}>
                  Free forever plan · 3 audits/month · no card
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="smc-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, maxWidth: 720 }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, textWrap: 'balance' }}>
              Why subscribers are not <span style={{ color: 'var(--ytg-accent)' }}>the same as income.</span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {[
              { h: 'Subscribers are a permission, not a paycheck',
                p: "When someone subscribes, they're telling YouTube it's okay to show them your future uploads in their subscription feed. They don't promise to watch. Most subs are dormant. Across the platform, only 10-25% of subs typically watch any given upload, and that fraction shrinks as your channel grows because your sub base accumulates faster than your engagement does." },
              { h: 'Income tracks views, not the subscriber badge',
                p: "Ad revenue is paid against monetized views. A 100,000-sub channel where only 10,000 subs watch each video earns less than a 30,000-sub channel where 15,000 watch. The visible subscriber number is a status signal, not a revenue input. This is why creators with smaller, hyper-engaged audiences often out-earn creators with bigger but quieter ones." },
              { h: 'Niche outweighs subscriber count',
                p: "A 50,000-sub finance channel can earn more than a 500,000-sub gaming channel. Advertisers pay tens of dollars to reach a finance viewer because the products being sold (brokerage accounts, credit cards, software) carry high lifetime value. Gaming viewers are valuable to fewer advertisers, with lower-margin products. Pick your niche with this in mind." },
              { h: 'Audience country is a 4-5x multiplier',
                p: "A subscriber from the US, UK, Canada, or Australia is worth 4-5x a subscriber from a tier-3 country in ad-revenue terms. The same content, the same engagement, can earn radically different amounts depending on where your viewers live. This is why creators producing English content for global audiences scale revenue so much faster than language-locked regional channels." },
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', gap: isMobile ? 12 : 56, paddingTop: i === 0 ? 0 : 28, borderTop: i === 0 ? 'none' : '1px solid var(--ytg-border)' }}>
                <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 20 : 22, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.5px', lineHeight: 1.25 }}>{row.h}</h3>
                <p style={{ fontSize: 15.5, color: 'var(--ytg-text-2)', lineHeight: 1.75 }}>{row.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW TO GROW ══ */}
      <section className="smc-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ marginBottom: 44, textAlign: 'center', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            <Eyebrow>Beyond the estimate</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
              Move your reach coefficient, <span style={{ color: 'var(--ytg-accent)' }}>not just your sub count.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>
              The fastest way to grow income is not more subs. It's more of your existing subs actually watching. Three levers that move that number.
            </p>
          </div>

          <div className="smc-grid-3">
            {[
              { label: 'AI Channel Audit',
                title: 'Find your dead subs',
                body: 'A 10-dimension audit of your last 20 videos, CTR, retention, and posting cadence. Tells you exactly which uploads are getting ignored by your existing sub base, and why.',
                href: '/features/channel-audit' },
              { label: 'SEO Studio',
                title: 'Win discovery views',
                body: 'Sub-views alone cap your income. Stack discovery views from search and suggested by scoring every title against the actual top-ranking videos in your niche.',
                href: '/features/seo-studio' },
              { label: 'Thumbnail IQ',
                title: 'Make subs actually click',
                body: 'CTR drives whether your existing subscribers see the video at all. Score your thumbnails against the top performers in your niche on contrast, face presence, and text density.',
                href: '/features/thumbnail-iq' },
            ].map((card, i) => (
              <a key={i} href={card.href}
                style={{ display: 'block', background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 22, padding: 30, boxShadow: 'var(--ytg-shadow-sm)', textDecoration: 'none', transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow)'; e.currentTarget.style.borderColor = 'var(--ytg-border-2)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow-sm)'; e.currentTarget.style.borderColor = 'var(--ytg-border)' }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>{card.label}</p>
                <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.4px', marginBottom: 12, lineHeight: 1.25 }}>{card.title}</h3>
                <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.65 }}>{card.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DARK CTA ══ */}
      <section className="smc-section-pad smc-cta-pad" style={{ padding: isMobile ? '88px 24px' : '120px 48px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', width: 1000, height: isMobile ? 600 : 800, background: 'radial-gradient(ellipse, rgba(229,48,42,0.20) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '5px 12px 5px 10px', marginBottom: 22 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 0 3px rgba(229,48,42,0.18)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Free AI audit</span>
          </div>
          <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: '#ffffff', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
            Stop estimating. <span style={{ color: '#ff3b30' }}>Start growing.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, marginBottom: 32, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Connect your channel for a free AI audit and get a real prioritized growth plan, not just an estimate.
          </p>
          <a href="/auth/login" className="smc-btn smc-btn-lg">Get my free audit →</a>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', marginTop: 16 }}>
            Free forever plan · no card · 3 audits per month
          </p>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div style={{ background: '#f4f4f6', borderTop: '1px solid rgba(10,10,15,0.08)', borderBottom: '1px solid rgba(10,10,15,0.08)', padding: isMobile ? '60px 20px' : '110px 64px', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '-10%', left: '-5%', width: 700, height: 600, background: 'radial-gradient(ellipse, rgba(229,48,42,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1160, margin: '0 auto', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '340px 1fr', gap: isMobile ? 40 : 88, alignItems: 'start' }}>

          <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.05, marginBottom: 14, textWrap: 'balance' }}>
              Questions <span style={{ color: 'var(--ytg-accent)' }}>answered.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.7, margin: 0, maxWidth: isMobile ? 520 : 320, marginLeft: isMobile ? 'auto' : 0, marginRight: isMobile ? 'auto' : 0 }}>
              Everything creators ask about turning subscribers into income. Still unsure? <a href="/contact" style={{ color: 'var(--ytg-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
            </p>
          </div>

          <div style={{ borderTop: '1px solid rgba(10,10,15,0.10)' }}>
            {FAQS.map((item, i) => {
              const isOpen = openFaq === i
              const num = String(i + 1).padStart(2, '0')
              return (
                <div key={i} style={{ borderBottom: '1px solid rgba(10,10,15,0.10)', position: 'relative' }}>
                  {isOpen && (
                    <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 2, background: 'var(--ytg-accent)', borderRadius: 2 }} />
                  )}
                  <div
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenFaq(isOpen ? null : i) } }}
                    style={{
                      display: 'flex', alignItems: 'flex-start',
                      gap: isMobile ? 14 : 20,
                      padding: isMobile ? '20px 0' : '24px 0',
                      paddingLeft: isOpen ? (isMobile ? 16 : 22) : 0,
                      cursor: 'pointer',
                      transition: 'padding-left 0.25s ease',
                      userSelect: 'none',
                    }}
                  >
                    <span style={{
                      fontSize: isMobile ? 12 : 13, fontWeight: 700,
                      color: isOpen ? 'var(--ytg-accent)' : 'var(--ytg-text-3)',
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1.5, flexShrink: 0,
                      width: isMobile ? 22 : 28, paddingTop: 2,
                      transition: 'color 0.2s',
                    }}>{num}</span>
                    <span style={{
                      flex: 1,
                      fontSize: isMobile ? 15 : 16, fontWeight: 600,
                      color: 'var(--ytg-text)', lineHeight: 1.45,
                      letterSpacing: '-0.2px',
                    }}>{item.q}</span>
                    <span aria-hidden="true" style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isOpen ? 'var(--ytg-accent)' : 'rgba(10,10,15,0.05)',
                      border: `1px solid ${isOpen ? 'var(--ytg-accent)' : 'rgba(10,10,15,0.10)'}`,
                      transition: 'background 0.2s, border-color 0.2s',
                      marginTop: 1,
                    }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 5h8" stroke={isOpen ? '#ffffff' : 'var(--ytg-text-2)'} strokeWidth="1.8" strokeLinecap="round" />
                        {!isOpen && <path d="M5 1v8" stroke="var(--ytg-text-2)" strokeWidth="1.8" strokeLinecap="round" />}
                      </svg>
                    </span>
                  </div>
                  <div className={`smc-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="smc-faq-answer-inner">
                      <div style={{ paddingLeft: isMobile ? 36 : 48, paddingRight: isMobile ? 40 : 48, paddingBottom: isMobile ? 22 : 26 }}>
                        <p style={{ fontSize: isMobile ? 14 : 15, color: 'var(--ytg-text-2)', lineHeight: 1.72, margin: 0 }}>{item.a}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  )
}
