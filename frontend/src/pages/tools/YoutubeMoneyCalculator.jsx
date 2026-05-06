import { useEffect, useState, useMemo } from 'react'
import LandingFooter from '../../components/LandingFooter'

/* ─── Free SEO tool: YouTube Money Calculator ─────────────────────────────
   Lives at /tools/youtube-money-calculator. Targets "youtube money calculator"
   tool-intent search (high volume, low competition for own-tool plays).
   Visual DNA is a deliberate lift of Affiliate.jsx — same nav, design tokens,
   section rhythm, calculator card pattern. Don't reinvent.
*/

function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return { isMobile: width <= 768, isTablet: width <= 1024 }
}

function Logo({ size = 32 }) {
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
    if (document.getElementById('ytg-ymc-styles')) return
    const link = document.createElement('link')
    link.id = 'ytg-ymc-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytg-ymc-styles'
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
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 5px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background: rgba(10,10,15,0.16); border-radius: 10px }

      @keyframes ymcFadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .ymc-btn {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
        padding: 15px 36px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.14), 0 4px 20px rgba(229,48,42,0.38);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .ymc-btn:hover {
        filter: brightness(1.07); transform: translateY(-1px);
        box-shadow: 0 3px 8px rgba(0,0,0,0.16), 0 12px 36px rgba(229,48,42,0.46);
      }
      .ymc-btn-lg { font-size: 16px; padding: 17px 44px; }

      .ymc-section-label {
        display: inline-block; font-size: 11px; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: var(--ytg-accent-text); background: var(--ytg-accent-light);
        padding: 5px 13px; border-radius: 100px; margin-bottom: 16px;
      }
      .ymc-nav-link {
        font-size: 14px; color: var(--ytg-text-3); font-weight: 500;
        text-decoration: none; transition: color 0.15s; letter-spacing: -0.1px;
      }
      .ymc-nav-link:hover { color: var(--ytg-text-2); }

      .ymc-input {
        width: 100%; padding: 12px 14px;
        font-size: 14px; font-weight: 500; font-family: inherit;
        color: var(--ytg-text);
        background: #fafafb; border: 1px solid var(--ytg-border);
        border-radius: 10px; outline: none;
        transition: border-color 0.15s, background 0.15s;
        -webkit-appearance: none;
      }
      .ymc-input:focus { border-color: rgba(10,10,15,0.28); background: #fff; }

      .ymc-faq-item {
        border-bottom: 1px solid var(--ytg-border);
        padding: 22px 0;
      }
      .ymc-faq-q {
        display: flex; justify-content: space-between; align-items: center;
        cursor: pointer; user-select: none;
        font-size: 16px; font-weight: 700; color: var(--ytg-text);
        letter-spacing: -0.2px;
      }
      .ymc-faq-a {
        font-size: 14.5px; color: var(--ytg-text-2);
        line-height: 1.7; padding-top: 12px; max-width: 720px;
      }

      .ymc-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
      .ymc-calc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }

      @media (max-width: 900px) {
        .ymc-grid-3 { grid-template-columns: 1fr; }
        .ymc-calc-grid { grid-template-columns: 1fr; }
      }
      @media (max-width: 768px) {
        .ymc-hero-h1   { font-size: 34px !important; letter-spacing: -1px !important; }
        .ymc-section-h2 { font-size: 28px !important; letter-spacing: -0.8px !important; }
        .ymc-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .ymc-cta-pad   { padding: 52px 24px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

/* ── Niche RPM tables ───────────────────────────────────────────────────── */
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

/* ── Helpers ────────────────────────────────────────────────────────────── */
function fmtMoney(n) {
  const v = Math.max(0, Math.round(n))
  return '$' + v.toLocaleString()
}
function fmtViews(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K'
  return n.toString()
}

/* ── FAQ data ───────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: 'How accurate is this YouTube money calculator?',
    a: "The numbers are realistic estimates based on industry-reported RPM ranges by niche and audience country. Real earnings vary with watch time, mid-roll placement, ad blocker rates, season (Q4 ads pay roughly 30–40% more than Q1), the percentage of your viewers watching with YouTube Premium, and whether your videos qualify for skippable in-stream ads. Treat the output as a sensible range, not a precise paycheck — most channels land somewhere inside the low–high band shown, and some land outside it for niche-specific reasons.",
  },
  {
    q: 'What is RPM vs CPM, and which one matters?',
    a: "CPM (Cost Per Mille) is what advertisers pay per 1,000 ad impressions — it's their cost, not your income. RPM (Revenue Per Mille) is what you actually take home per 1,000 video views, after YouTube's 45% cut, after the views that never saw an ad, after the videos that ran without monetization at all. RPM is always significantly lower than CPM — usually 30–50% of it. RPM is the only number you should care about as a creator, and it's what this calculator estimates.",
  },
  {
    q: "Why does my niche change the result so much?",
    a: 'Advertisers bid wildly different amounts depending on the audience they want to reach. A finance viewer might be worth $40 to a credit card or brokerage advertiser because that viewer might sign up for a $200/month product. A kids-content viewer is worth a fraction of that — fewer advertisers compete for the slot, and the products being sold are lower-margin. Niche is the single biggest lever in YouTube earnings, often bigger than view count. A 100K/month finance channel can out-earn a 1M/month gaming channel.',
  },
  {
    q: "Why does audience country matter so much?",
    a: 'Advertiser spending power varies dramatically by country. US, UK, Canada, and Australia have the highest ad spend on the planet. A view from a US viewer can be worth 4–5x a view from a tier-3 country, and 8–10x a view from India or parts of Africa. The same video, with the same niche, the same length, the same retention — earns wildly different amounts depending on who watches it. This is why creators producing English content for global audiences (rather than language-locked regional content) scale revenue so much faster.',
  },
  {
    q: 'Do I have to be in the YouTube Partner Program (YPP) to earn from my videos?',
    a: "Yes — to earn from ads on your videos you need to be in the YouTube Partner Program. The current eligibility thresholds are 1,000 subscribers + either 4,000 valid public watch hours in the last 12 months OR 10 million Shorts views in the last 90 days. Once accepted, you can monetize through ads, channel memberships, Super Chat, Super Thanks, and YouTube Premium revenue. You also need to live in a country where YPP is available and have an AdSense account in good standing.",
  },
  {
    q: 'How much do YouTube Shorts pay?',
    a: "Shorts pay much less per view than long-form. There are no mid-rolls, no skippable in-stream ads, and Shorts revenue comes from a shared pool funded by ads in the Shorts feed — not from ads on your specific Short. Typical Shorts RPM is $0.04–$0.10 per 1,000 views, vs $3–$30 for long-form. A Short with 10 million views might earn $400–$1,000, where a long-form video with the same view count in the right niche could earn $10,000–$40,000. Shorts are a discovery tool, not a revenue tool.",
  },
  {
    q: 'How long do my videos need to be to run mid-roll ads?',
    a: 'Videos must be at least 8 minutes long to qualify for mid-roll ads (the slots that play partway through the video). This is the single biggest "free" RPM upgrade available — going from 5-minute videos to 10-minute videos can roughly double your earnings per view, because each mid-roll slot is its own ad impression. Don\'t pad video length artificially (retention will tank) — but if you\'re routinely cutting at 6 minutes, consider whether the topic could justify 10–12 minutes of real content.',
  },
  {
    q: "Why do my actual earnings look lower than this calculator predicts?",
    a: 'A few common reasons: (1) you have a high percentage of Shorts views, which pay almost nothing; (2) a chunk of your audience uses ad blockers, which removes those views from the monetizable pool; (3) your videos are flagged as "limited or no ads" due to controversial content, language, or copyrighted music; (4) you upload during a low ad-spend season (Q1 is brutal — Q4 is the gold rush); or (5) your audience country mix is more tier-3-heavy than you think. Check YouTube Studio → Analytics → Revenue → Geography to see your real audience country breakdown.',
  },
  {
    q: 'When do I get paid by YouTube?',
    a: 'YouTube pays via Google AdSense on a monthly cycle. You need to hit a $100 minimum threshold in your AdSense account; once you cross it, payment is issued around the 21st–26th of the following month. So earnings from October typically arrive in late November. Payment methods depend on country — bank transfer (EFT), wire, check, and Western Union are the most common. Tax forms (W-9 in the US, W-8BEN internationally) must be on file or your earnings get withheld.',
  },
  {
    q: 'Will I owe taxes on my YouTube earnings?',
    a: "Yes. YouTube ad revenue is self-employment income for most creators and is taxed accordingly. In the US that means federal income tax + 15.3% self-employment tax (covering Social Security and Medicare). You'll receive a 1099 form from Google if you earn over $600/year. Outside the US, treatment varies — most countries treat YouTube income as freelance/self-employment, and YouTube also withholds 30% of US-derived earnings unless you've submitted a W-8BEN tax form claiming a treaty rate. Talk to an accountant once you cross $1,000/month — the structuring decisions (LLC, expenses, retirement contributions) start to matter.",
  },
  {
    q: 'Beyond ad revenue, what other ways do YouTubers make money?',
    a: "Most full-time creators have 4–6 income streams, not just ads: (1) brand sponsorships and integrations — often the biggest line item, paying roughly $20–$50 per 1,000 views in tier-1 niches; (2) affiliate marketing (Amazon, Skillshare, software referrals); (3) selling your own digital products (courses, templates, presets); (4) memberships via YouTube Channel Memberships or Patreon; (5) merchandise; (6) Super Chat, Super Thanks, Super Stickers during live streams. A channel earning $2,000/month from ads might be earning $8,000/month total once you count the rest.",
  },
  {
    q: 'How do I increase my RPM without growing my view count?',
    a: 'Three high-impact moves: (1) Lengthen your videos past 8 minutes so they qualify for mid-rolls — and add 2–3 mid-roll slots manually in YouTube Studio rather than relying on auto-placement; (2) Pivot your content angle toward higher-RPM topics within your existing niche (a beauty channel covering luxury skincare earns multiples more than one covering drugstore hauls); (3) Improve your audience country mix by creating English-first content with hooks that travel internationally rather than geo-locked references. None of these require more views — they just earn more from the views you already have.',
  },
  {
    q: 'How do I actually grow these numbers?',
    a: "Two levers: (1) get more views by ranking better in YouTube search and suggested, and (2) earn higher RPM through longer-form videos with strategic mid-rolls and a higher-paying niche pivot. YTGrowth's free AI audit looks at both — it tells you which of your videos are SEO-underperformers, which titles and thumbnails are losing the click war, and which video lengths are leaving ad slots on the table. It costs nothing to run on a free account.",
  },
  {
    q: 'Is this calculator free? Will you sell my data?',
    a: "Yes, free forever — and no data collection beyond what your browser sends to any website. The calculator runs entirely in your browser; no inputs are sent to our servers, no email required, no signup gate. We built it as a genuine free tool because creators deserve a realistic estimate before they pour months into a niche. If you want a real, personalised growth plan beyond just an earnings estimate, you can connect your channel for a free AI audit — but that's entirely optional.",
  },
]

/* ── Main component ─────────────────────────────────────────────────────── */
export default function YoutubeMoneyCalculator() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()

  // Calculator state
  const [views, setViews]       = useState(50_000)
  const [niche, setNiche]       = useState('tech')
  const [country, setCountry]   = useState('tier1')

  // Open FAQ index (0 default)
  const [openFaq, setOpenFaq] = useState(0)

  /* Earnings math */
  const result = useMemo(() => {
    const n = NICHES.find(x => x.key === niche) || NICHES[0]
    const c = COUNTRIES.find(x => x.key === country) || COUNTRIES[0]
    const lowRpm  = n.low  * c.mult
    const highRpm = n.high * c.mult
    const monthlyLow  = views * (lowRpm  / 1000)
    const monthlyHigh = views * (highRpm / 1000)
    return {
      lowRpm, highRpm,
      monthlyLow, monthlyHigh,
      annualLow:  monthlyLow  * 12,
      annualHigh: monthlyHigh * 12,
      perThousandLow:  lowRpm,
      perThousandHigh: highRpm,
    }
  }, [views, niche, country])

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--ytg-border)', padding: isMobile ? '0 20px' : '0 40px 0 72px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ytg-nav)', backdropFilter: 'blur(16px)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', minWidth: 0 }}>
          <Logo size={28} />
          <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--ytg-text)', letterSpacing: '-0.4px', whiteSpace: 'nowrap' }}>YTGrowth</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {!isMobile && <a href="/" className="ymc-nav-link">← Back to home</a>}
          <a href="/auth/login" className="ymc-btn"
            style={{ padding: isMobile ? '8px 18px' : '9px 22px', fontSize: 13, borderRadius: 100, whiteSpace: 'nowrap' }}>
            {isMobile ? 'Try free' : 'Try YTGrowth free'}
          </a>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="ymc-section-pad" style={{ padding: isMobile ? '64px 20px 48px' : '96px 40px 72px', textAlign: 'center', background: '#ffffff' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', animation: 'ymcFadeUp 0.5s ease both' }}>
          <span className="ymc-section-label">Free tool</span>
          <h1 className="ymc-hero-h1" style={{ fontSize: isMobile ? 36 : 54, fontWeight: 800, letterSpacing: isMobile ? '-1.5px' : '-2.2px', lineHeight: 1.06, color: 'var(--ytg-text)', marginBottom: 22 }}>
            YouTube Money Calculator
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 14px' }}>
            Estimate what a YouTube channel actually earns based on monthly views, niche, and audience country — using realistic RPM ranges, not the inflated "potential earnings" most calculators show.
          </p>
          <p style={{ fontSize: 13.5, color: 'var(--ytg-text-3)', marginBottom: 28 }}>
            No signup. No email. Free forever.
          </p>
        </div>
      </section>

      {/* ══ CALCULATOR ══ */}
      <section id="calculator" className="ymc-section-pad" style={{ padding: isMobile ? '40px 20px 80px' : '64px 40px 100px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div className="ymc-calc-grid">

            {/* LEFT — inputs card */}
            <div style={{ background: 'var(--ytg-card)', borderRadius: 20, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-lg)', padding: isMobile ? 26 : 36 }}>

              {/* Monthly views */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly views</label>
                  <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--ytg-accent)', letterSpacing: '-0.8px', fontVariantNumeric: 'tabular-nums' }}>{fmtViews(views)}</span>
                </div>
                <input type="range" min={1000} max={10000000} step={1000} value={views}
                  onChange={e => setViews(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--ytg-accent)', cursor: 'pointer', height: 4 }}/>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ytg-text-3)', marginTop: 4 }}>
                  <span>1K</span><span>500K</span><span>5M</span><span>10M</span>
                </div>
              </div>

              {/* Niche */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Niche</label>
                <select className="ymc-input" value={niche} onChange={e => setNiche(e.target.value)}>
                  {NICHES.map(n => <option key={n.key} value={n.key}>{n.label}</option>)}
                </select>
              </div>

              {/* Country */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Audience country</label>
                <select className="ymc-input" value={country} onChange={e => setCountry(e.target.value)}>
                  {COUNTRIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>

              <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', marginTop: 22, lineHeight: 1.6 }}>
                Earnings shown are realistic ranges based on YouTube's standard ad share (creators receive 55%). Actual earnings depend on watch time, mid-roll placement, season, and viewer ad-block rates.
              </p>
            </div>

            {/* RIGHT — result column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Headline result — accent card */}
              <div style={{ background: 'var(--ytg-accent)', borderRadius: 20, color: '#fff', padding: isMobile ? 26 : 36, boxShadow: '0 4px 18px rgba(229,48,42,0.32), 0 24px 60px rgba(229,48,42,0.18)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.78, marginBottom: 12 }}>
                  Estimated monthly earnings
                </div>
                <div style={{ fontSize: isMobile ? 36 : 46, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.05, marginBottom: 8 }}>
                  {fmtMoney(result.monthlyLow)} – {fmtMoney(result.monthlyHigh)}
                </div>
                <div style={{ fontSize: 13.5, opacity: 0.82 }}>
                  {fmtViews(views)} views/mo · {(NICHES.find(n => n.key === niche) || NICHES[0]).label}
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '22px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.74, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Per year</div>
                    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.8px' }}>{fmtMoney(result.annualLow)} – {fmtMoney(result.annualHigh)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, opacity: 0.74, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>RPM range</div>
                    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.8px' }}>${result.perThousandLow.toFixed(2)} – ${result.perThousandHigh.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Want to grow these numbers? */}
              <div style={{ background: 'var(--ytg-card)', borderRadius: 20, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: 26 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Grow these numbers</p>
                <p style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ytg-text)', lineHeight: 1.5, marginBottom: 8 }}>
                  An estimate is just a number. A growth plan moves it.
                </p>
                <p style={{ fontSize: 13.5, color: 'var(--ytg-text-2)', lineHeight: 1.65, marginBottom: 18 }}>
                  YTGrowth's free AI audit looks at your last 20 videos, your CTR, and your retention curves — then tells you exactly which titles, thumbnails, and posting habits are leaving money on the table.
                </p>
                <a href="/auth/login" className="ymc-btn" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 14, borderRadius: 12 }}>
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

      {/* ══ HOW EARNINGS WORK ══ */}
      <section className="ymc-section-pad" style={{ padding: isMobile ? '72px 20px' : '96px 40px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <div style={{ marginBottom: 36 }}>
            <span className="ymc-section-label">How it works</span>
            <h2 className="ymc-section-h2" style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.2px' }}>How YouTube earnings actually work</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ytg-text)', marginBottom: 10, letterSpacing: '-0.5px' }}>RPM is the only number that matters to your wallet</h3>
              <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.75 }}>
                CPM (Cost Per Mille) is what advertisers pay per 1,000 ad impressions. RPM (Revenue Per Mille) is what you receive per 1,000 video views — after YouTube's 45% cut, after the views that didn't see an ad, after the videos that ran without monetization at all. RPM is always lower than CPM. RPM is your number.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ytg-text)', marginBottom: 10, letterSpacing: '-0.5px' }}>Niche is a bigger lever than view count</h3>
              <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.75 }}>
                A finance channel with 100K monthly views can out-earn a gaming channel with 1M monthly views. That's not an exaggeration — it's a 10x view gap that doesn't close the earnings gap. Advertisers will pay $30+ to put a credit card or brokerage ad in front of a finance viewer; they pay $3 for a gaming viewer. Pick your niche with this in mind, especially if you're starting from scratch.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ytg-text)', marginBottom: 10, letterSpacing: '-0.5px' }}>Audience country multiplies (or divides) everything</h3>
              <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.75 }}>
                US, UK, Canada, and Australia viewers earn you the highest ad spend on the planet. The same video, with the same niche and view count, earns 4–5x more from a tier-1 audience than a tier-3 one. This is why creators producing English content for global niches scale revenue so much faster than language-locked channels.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ytg-text)', marginBottom: 10, letterSpacing: '-0.5px' }}>Long-form videos earn more per view</h3>
              <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.75 }}>
                Videos over 8 minutes can run mid-roll ads — multiple ad slots inside a single view. A 20-minute video with 3 mid-rolls earns roughly 2–3x more per view than the same niche's 5-minute video. This is also why YouTube Shorts pay so little: no mid-rolls, ad share comes from the Shorts pool, not the standard model.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW TO GROW ══ */}
      <section className="ymc-section-pad" style={{ padding: isMobile ? '72px 20px' : '96px 40px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 36, textAlign: 'center' }}>
            <span className="ymc-section-label">Grow your earnings</span>
            <h2 className="ymc-section-h2" style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.2px' }}>How to actually move these numbers</h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.75, maxWidth: 640, margin: '14px auto 0' }}>
              The estimate above changes when you move two levers: more views (rank better) and more RPM (more mid-rolls, longer watch time). Both are coachable.
            </p>
          </div>

          <div className="ymc-grid-3">
            {[
              {
                label: 'AI Channel Audit',
                title: 'Find what is broken',
                body: 'YTGrowth runs a 10-dimension audit across your last 20 videos, CTR, retention, and posting cadence — and gives you a prioritized punch list of what to fix first.',
                href: '/features/channel-audit',
              },
              {
                label: 'SEO Studio',
                title: 'Rank for searches that pay',
                body: 'Score every title and description against the actual top-ranking videos in your niche — so the SEO work goes into keywords with real search volume, not guesses.',
                href: '/features/seo-studio',
              },
              {
                label: 'Thumbnail IQ',
                title: 'Win the click war',
                body: 'CTR is a primary ranking signal. Score your thumbnails against the top performers in your niche on contrast, face presence, and text density before you upload.',
                href: '/features/thumbnail-iq',
              },
            ].map((card, i) => (
              <a key={i} href={card.href}
                style={{ display: 'block', background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 18, padding: 28, boxShadow: 'var(--ytg-shadow-sm)', textDecoration: 'none', transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow)'; e.currentTarget.style.borderColor = 'var(--ytg-border-2)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow-sm)'; e.currentTarget.style.borderColor = 'var(--ytg-border)' }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>{card.label}</p>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.4px', marginBottom: 10 }}>{card.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.65 }}>{card.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="ymc-section-pad ymc-cta-pad" style={{ padding: isMobile ? '64px 24px' : '92px 40px', background: 'var(--ytg-bg-3)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 className="ymc-section-h2" style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.2px', marginBottom: 14 }}>
            Stop estimating. <span style={{ color: 'var(--ytg-accent)' }}>Start growing.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--ytg-text-2)', lineHeight: 1.7, marginBottom: 28, maxWidth: 540, margin: '0 auto 28px' }}>
            Connect your channel for a free AI audit and get a real, prioritized growth plan — not just a number.
          </p>
          <a href="/auth/login" className="ymc-btn ymc-btn-lg">Get my free audit →</a>
          <p style={{ fontSize: 12.5, color: 'var(--ytg-text-3)', marginTop: 14 }}>
            Free forever plan · no card · 3 audits per month
          </p>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="ymc-section-pad" style={{ padding: isMobile ? '72px 20px' : '96px 40px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ marginBottom: 28, textAlign: 'center' }}>
            <span className="ymc-section-label">FAQ</span>
            <h2 className="ymc-section-h2" style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.2px' }}>Common questions</h2>
          </div>
          <div>
            {FAQS.map((f, i) => {
              const open = openFaq === i
              return (
                <div key={i} className="ymc-faq-item">
                  <div className="ymc-faq-q" onClick={() => setOpenFaq(open ? -1 : i)}>
                    <span>{f.q}</span>
                    <span style={{ color: 'var(--ytg-text-3)', fontSize: 22, fontWeight: 400, lineHeight: 1, transform: open ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>+</span>
                  </div>
                  {open && <p className="ymc-faq-a">{f.a}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
