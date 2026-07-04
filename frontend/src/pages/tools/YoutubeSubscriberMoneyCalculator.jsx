import { useEffect, useMemo, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free tool: Subscriber Money Calculator ──────────────────────────────
   /tools/youtube-subscriber-money-calculator. Migrated to the editorial design
   language (Fraunces + Barlow, sharp flat cards, warm paper, restrained red),
   typed inputs (no sliders). Goes from subscribers → estimated views → income,
   the inverse of the views-first Money Calculator. Keeps the full content
   (how-it-works, milestone table, 12 FAQs) since the page carries ads.
   See project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

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
  { key: 'tier7',  label: 'Africa / Other',                          mult: 0.18 },
  { key: 'mixed',  label: 'Mixed / Global audience',                  mult: 0.55 },
]

const REACH_COEF_LOW  = 0.13
const REACH_COEF_HIGH = 0.32
const TARGETS = [500, 1000, 3000, 5000, 10000]
const QUICK_SUBS = [1000, 10_000, 100_000, 1_000_000]
const QUICK_UPLOADS = [1, 4, 8, 16]

function fmtMoney(n) { return '$' + Math.max(0, Math.round(n)).toLocaleString() }
function fmtNum(n) {
  if (n == null || !isFinite(n)) return '—'
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + 'K'
  return Math.round(n).toLocaleString()
}

function useBreakpoint() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return { isMobile: w <= 768 }
}

function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('subc-styles')) return
    const style = document.createElement('style')
    style.id = 'subc-styles'
    style.textContent = `
      :root {
        --yte-bg: #f6f4ef; --yte-bg-2: #efece4; --yte-surface: #ffffff;
        --yte-ink: #14130f; --yte-soft: #5c574e; --yte-muted: #8a8378;
        --yte-line: rgba(20,19,15,0.12); --yte-accent: #e5302a; --yte-accent-soft: rgba(229,48,42,0.07);
        --yte-dark: #0d0d12;
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; scroll-padding-top: 84px; }
      body { background: var(--yte-bg); color: var(--yte-ink); font-family: ${SANS}; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
      @keyframes subcFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .subc-wrap { max-width: 920px; margin: 0 auto; }
      .subc-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .subc-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .subc-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .subc-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.04; }
      .subc-h1 em { font-style: italic; color: var(--yte-accent); }
      .subc-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .subc-h2 em { font-style: italic; color: var(--yte-accent); }
      .subc-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .subc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; align-items: stretch; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 760px) { .subc-grid { grid-template-columns: 1fr; } }
      .subc-card { background: var(--yte-surface); padding: 30px; display: flex; flex-direction: column; gap: 18px; }
      .subc-label { display: block; font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-muted); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 9px; }
      .subc-input { width: 100%; padding: 13px 14px; font-size: 16px; font-weight: 500; font-family: ${SANS}; color: var(--yte-ink); background: var(--yte-bg); border: 1px solid var(--yte-line); border-radius: 0; outline: none; transition: border-color 0.15s, background 0.15s; -webkit-appearance: none; font-variant-numeric: tabular-nums; }
      .subc-input:focus { border-color: var(--yte-accent); background: #fff; }
      select.subc-input { font-size: 14px; }
      .subc-chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 11px; }
      .subc-chip { font-family: ${SANS}; font-size: 12px; font-weight: 600; color: var(--yte-soft); background: transparent; border: 1px solid var(--yte-line); border-radius: 0; padding: 6px 13px; cursor: pointer; transition: all 0.15s; letter-spacing: 0.02em; }
      .subc-chip:hover { border-color: var(--yte-ink); color: var(--yte-ink); }
      .subc-chip.active { background: var(--yte-ink); border-color: var(--yte-ink); color: #fff; }
      .subc-result { display: flex; flex-direction: column; background: var(--yte-ink); color: #fff; padding: 32px; }
      .subc-serif { font-family: ${SERIF}; }

      .subc-table { width: 100%; border-collapse: collapse; background: var(--yte-surface); border: 1px solid var(--yte-line); }
      .subc-table th, .subc-table td { text-align: left; padding: 14px 18px; font-size: 14px; border-bottom: 1px solid var(--yte-line); }
      .subc-table th { font-family: ${SANS}; font-size: 10.5px; font-weight: 600; color: var(--yte-muted); text-transform: uppercase; letter-spacing: 0.12em; }
      .subc-table td { font-family: ${SANS}; color: var(--yte-soft); font-variant-numeric: tabular-nums; }
      .subc-table tr:last-child td { border-bottom: none; }
      .subc-table .subc-target { font-family: ${SERIF}; font-size: 18px; font-weight: 400; color: var(--yte-ink); }

      .subc-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease; }
      .subc-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .subc-faq-answer-inner { overflow: hidden; }

      @media (max-width: 768px) { .subc-section-pad { padding-left: 22px !important; padding-right: 22px !important; } .subc-cta-pad { padding: 76px 24px !important; } }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children }) {
  return (
    <div className="subc-eyebrow">
      <span aria-hidden="true" className="subc-eyebrow-rule" />
      <span className="subc-eyebrow-text">{children}</span>
    </div>
  )
}

const HOW_IT_WORKS = [
  { h: 'Subscribers are not income, views are',
    p: 'Most subscribers never watch a given upload. Platform-wide, only about 10 to 25% of subs see each video. This calculator turns your sub count into a realistic view estimate first, then into earnings, because the badge count on your channel page is not what monetizes.' },
  { h: 'The reach coefficient does the work',
    p: 'We model two scenarios: a conservative 13% of subs watching each upload, and an optimistic 32% with healthy search and suggested discovery on top. Multiply by how often you upload to get monthly views. Real channels land between the two depending on hooks, thumbnails, and cadence.' },
  { h: 'Niche and country set the rate',
    p: 'Once views are estimated, niche and audience country decide the RPM, and that swing is huge: a tier-1 finance subscriber is worth many times a tier-3 gaming subscriber. Niche outweighs sub count, a 50k finance channel can out-earn a 500k gaming channel.' },
]

const FAQS = [
  { q: 'How does this subscriber-to-money calculator work?',
    a: "It uses three inputs to estimate your earnings: subscriber count, how many videos you upload per month, and a niche-and-country RPM range. Subscribers don't equal income directly. What matters is how many of those subs watch your uploads (the reach coefficient) plus the discovery views from search and suggested. We multiply your effective monthly views by realistic RPM ranges per niche and country to give you a low-to-high earnings estimate." },
  { q: 'Why are subscribers a bad direct measure of income?',
    a: "Most subscribers do not watch your videos. The platform-wide average is roughly 10-25% of subs watching any given upload. The rest are dormant, watch occasionally, or never come back. A 100k channel with sleeping subs can earn less than a 20k channel with high engagement. Income tracks views, not the badge count on your channel page." },
  { q: 'What is the reach coefficient this calculator uses?',
    a: "We model two scenarios: a conservative 13% of subs watching each upload (light non-sub discovery overflow on top), and an optimistic 32% (healthy search and suggested traffic stacking on the sub base). Real channels land between these depending on how strong their hooks are, how often they upload, and how well their thumbnails work in suggested feeds." },
  { q: 'How is this different from the YouTube Money Calculator?',
    a: "The Money Calculator goes from views to income (you tell it your monthly views, it estimates earnings). This calculator goes from subscribers to income (it estimates your views first, then your earnings). It's the right tool when you don't know your view count yet, or when you're planning a channel and only have a target subscriber count in mind." },
  { q: 'How many subscribers do I need to be eligible to monetize?',
    a: "YouTube Partner Program (YPP) eligibility requires 1,000 subscribers AND either 4,000 valid public watch hours in the past 12 months OR 10 million Shorts views in the past 90 days. The 1,000 sub threshold is a gate, not a paycheck: most 1,000-sub channels earn under $20/month from ads. Real income kicks in around 10k-50k subs depending on niche." },
  { q: 'Why does my niche change the result so much?',
    a: 'Advertisers bid wildly different amounts depending on the audience. A finance subscriber is worth tens of dollars in lifetime ad value; a kids-content subscriber is worth a fraction of that. Niche outweighs subscriber count: a 50k finance channel can earn more than a 500k gaming channel. Pick your niche with this in mind, especially early.' },
  { q: 'Why does audience country matter?',
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

export default function YoutubeSubscriberMoneyCalculator() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()

  const [subs, setSubs]             = useState(10000)
  const [videosPerMonth, setVideos] = useState(4)
  const [niche, setNiche]           = useState('tech')
  const [country, setCountry]       = useState('tier1')
  const [openFaq, setOpenFaq]       = useState(0)

  const r = useMemo(() => {
    const n = NICHES.find(x => x.key === niche) || NICHES[0]
    const c = COUNTRIES.find(x => x.key === country) || COUNTRIES[0]
    const lowRpm  = n.low  * c.mult
    const highRpm = n.high * c.mult
    const monthlyViewsLow  = subs * REACH_COEF_LOW  * videosPerMonth
    const monthlyViewsHigh = subs * REACH_COEF_HIGH * videosPerMonth
    const monthlyLow  = monthlyViewsLow  * (lowRpm  / 1000)
    const monthlyHigh = monthlyViewsHigh * (highRpm / 1000)
    const midRpm   = (lowRpm + highRpm) / 2
    const midReach = (REACH_COEF_LOW + REACH_COEF_HIGH) / 2
    const targetRows = TARGETS.map(target => ({
      target,
      subsNeeded: midRpm > 0 && videosPerMonth > 0 ? (target * 1000) / (midReach * videosPerMonth * midRpm) : null,
    }))
    return {
      monthlyViewsLow, monthlyViewsHigh, monthlyLow, monthlyHigh,
      annualLow: monthlyLow * 12, annualHigh: monthlyHigh * 12,
      label: n.label, targetRows,
    }
  }, [subs, videosPerMonth, niche, country])

  function onSubsChange(e) {
    const d = e.target.value.replace(/[^0-9]/g, '')
    setSubs(d === '' ? 0 : Math.min(Number(d), 500_000_000))
  }
  function onVideosChange(e) {
    const d = e.target.value.replace(/[^0-9]/g, '')
    setVideos(d === '' ? 0 : Math.min(Number(d), 60))
  }

  const H1 = isMobile ? 34 : 54
  const H2 = isMobile ? 28 : 40

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', overflowX: 'clip' }}>
      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="subc-section-pad" style={{ padding: isMobile ? '60px 22px 40px' : '104px 48px 48px', background: 'var(--yte-bg)' }}>
        <div className="subc-wrap" style={{ animation: 'subcFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 className="subc-h1" style={{ fontSize: H1, marginBottom: 22, maxWidth: 780, textWrap: 'balance' }}>
            How much can your <em>subscribers</em> earn you?
          </h1>
          <div style={{ maxWidth: 640 }}>
            <p className="subc-lead" style={{ fontSize: isMobile ? 16 : 17.5, marginBottom: 14, textWrap: 'pretty' }}>
              Subscribers do not equal income, views do. This calculator estimates your real monthly views from your sub count and upload pace, then turns that into a realistic earnings range by niche and audience country.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
              No signup. No email. Free forever.
            </p>
          </div>
        </div>
      </section>

      {/* ══ CALCULATOR ══ */}
      <section className="subc-section-pad" style={{ padding: isMobile ? '8px 22px 56px' : '0 48px 72px', background: 'var(--yte-bg)' }}>
        <div className="subc-wrap">
          <div className="subc-grid">
            {/* Inputs */}
            <div className="subc-card">
              <div>
                <label className="subc-label" htmlFor="subc-subs">Subscribers</label>
                <input id="subc-subs" className="subc-input" type="text" inputMode="numeric"
                  value={subs ? subs.toLocaleString() : ''} onChange={onSubsChange} placeholder="e.g. 10,000" aria-label="Subscribers" />
                <div className="subc-chips">
                  {QUICK_SUBS.map(v => <button key={v} type="button" className={'subc-chip' + (subs === v ? ' active' : '')} onClick={() => setSubs(v)}>{fmtNum(v)}</button>)}
                </div>
              </div>
              <div>
                <label className="subc-label" htmlFor="subc-vids">Uploads per month</label>
                <input id="subc-vids" className="subc-input" type="text" inputMode="numeric"
                  value={videosPerMonth || ''} onChange={onVideosChange} placeholder="e.g. 4" aria-label="Uploads per month" />
                <div className="subc-chips">
                  {QUICK_UPLOADS.map(v => <button key={v} type="button" className={'subc-chip' + (videosPerMonth === v ? ' active' : '')} onClick={() => setVideos(v)}>{v}/mo</button>)}
                </div>
              </div>
              <div>
                <label className="subc-label" htmlFor="subc-niche">Niche</label>
                <select id="subc-niche" className="subc-input" value={niche} onChange={e => setNiche(e.target.value)}>
                  {NICHES.map(n => <option key={n.key} value={n.key}>{n.label}</option>)}
                </select>
              </div>
              <div>
                <label className="subc-label" htmlFor="subc-country">Audience country</label>
                <select id="subc-country" className="subc-input" value={country} onChange={e => setCountry(e.target.value)}>
                  {COUNTRIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {/* Result */}
            <div className="subc-result">
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.62, marginBottom: 14 }}>
                Estimated monthly earnings
              </div>
              <div className="subc-serif" style={{ fontSize: 44, fontWeight: 400, letterSpacing: '-1px', lineHeight: 1.02, marginBottom: 10 }}>
                {fmtMoney(r.monthlyLow)} – {fmtMoney(r.monthlyHigh)}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, opacity: 0.7 }}>
                {fmtNum(subs)} subscribers · {videosPerMonth} {videosPerMonth === 1 ? 'upload' : 'uploads'}/mo · {r.label}
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.16)', margin: '24px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 10.5, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 7 }}>Per year</div>
                  <div className="subc-serif" style={{ fontSize: 22, fontWeight: 400, letterSpacing: '-0.3px' }}>{fmtMoney(r.annualLow)} – {fmtMoney(r.annualHigh)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: SANS, fontSize: 10.5, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 7 }}>Est. monthly views</div>
                  <div className="subc-serif" style={{ fontSize: 22, fontWeight: 400, letterSpacing: '-0.3px' }}>{fmtNum(r.monthlyViewsLow)} – {fmtNum(r.monthlyViewsHigh)}</div>
                </div>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: 26, fontFamily: SANS, fontSize: 12.5, opacity: 0.7, lineHeight: 1.55 }}>
                Based on 13 to 32% of subs watching each upload. Already know your views?{' '}
                <a href="/tools/youtube-money-calculator" style={{ color: '#fff', textDecoration: 'underline', textUnderlineOffset: 2 }}>Use the views calculator →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ MILESTONE TABLE ══ */}
      <section className="subc-section-pad" style={{ padding: isMobile ? '0 22px 64px' : '0 48px 88px', background: 'var(--yte-bg)' }}>
        <div className="subc-wrap">
          <div style={{ marginBottom: 22, maxWidth: 680 }}>
            <Eyebrow>Milestones</Eyebrow>
            <h2 className="subc-h2" style={{ fontSize: isMobile ? 24 : 32 }}>Subscribers needed to hit each income.</h2>
            <p className="subc-lead" style={{ fontSize: 14.5, marginTop: 10 }}>For your current niche, country, and {videosPerMonth} {videosPerMonth === 1 ? 'upload' : 'uploads'}/month, at mid-range assumptions.</p>
          </div>
          <table className="subc-table">
            <thead><tr><th>Monthly income</th><th>Subscribers needed</th></tr></thead>
            <tbody>
              {r.targetRows.map(row => (
                <tr key={row.target}>
                  <td className="subc-target">{fmtMoney(row.target)}/mo</td>
                  <td>{row.subsNeeded ? fmtNum(row.subsNeeded) + ' subscribers' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', marginTop: 14, lineHeight: 1.6 }}>
            From ads alone. Sponsorships and affiliates can hit these incomes at far fewer subscribers, especially in high-RPM niches. These figures are YTGrowth estimates, not YouTube data.
          </p>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="subc-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="subc-wrap">
          <div style={{ marginBottom: 40, maxWidth: 680 }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="subc-h2" style={{ fontSize: H2, textWrap: 'balance' }}>Why subscriber count <em>misleads.</em></h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {HOW_IT_WORKS.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', gap: isMobile ? 10 : 48, padding: '26px 0', borderTop: i === 0 ? 'none' : '1px solid var(--yte-line)' }}>
                <h3 style={{ fontFamily: SERIF, fontSize: isMobile ? 21 : 23, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', lineHeight: 1.2 }}>{row.h}</h3>
                <p style={{ fontFamily: SANS, fontSize: isMobile ? 15 : 16, color: 'var(--yte-soft)', lineHeight: 1.72 }}>{row.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div className="subc-section-pad" style={{ background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)', padding: isMobile ? '60px 22px' : '104px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 36 : 80, alignItems: 'start' }}>
          <div>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="subc-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>Subs and income, <em>answered.</em></h2>
            <p className="subc-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              What creators ask before chasing a subscriber number. Still unsure? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
            </p>
          </div>
          <div style={{ borderTop: '1px solid var(--yte-line)' }}>
            {FAQS.map((item, i) => {
              const isOpen = openFaq === i
              return (
                <div key={i} style={{ borderBottom: '1px solid var(--yte-line)' }}>
                  <div onClick={() => setOpenFaq(isOpen ? null : i)} role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenFaq(isOpen ? null : i) } }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, padding: isMobile ? '20px 0' : '24px 0', cursor: 'pointer', userSelect: 'none' }}
                  >
                    <span style={{ flex: 1, fontFamily: SERIF, fontSize: isMobile ? 18 : 20, fontWeight: 400, color: isOpen ? 'var(--yte-accent)' : 'var(--yte-ink)', lineHeight: 1.3, letterSpacing: '-0.2px', transition: 'color 0.2s' }}>{item.q}</span>
                    <span aria-hidden="true" style={{ flexShrink: 0, fontFamily: SANS, fontSize: 26, fontWeight: 300, color: 'var(--yte-accent)', lineHeight: 1, transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                  </div>
                  <div className={`subc-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="subc-faq-answer-inner">
                      <div style={{ paddingBottom: isMobile ? 22 : 26, maxWidth: 680 }}>
                        <p style={{ fontFamily: SANS, fontSize: isMobile ? 14.5 : 15.5, color: 'var(--yte-soft)', lineHeight: 1.78, margin: 0 }}>{item.a}</p>
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
