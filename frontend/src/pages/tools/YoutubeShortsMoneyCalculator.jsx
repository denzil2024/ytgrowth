import { useEffect, useMemo, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'
import { COUNTRIES, COUNTRY_LOOKUP, fmtMoney, fmtViews } from '../../data/youtubeEarnings'

/* ─── Free tool: YouTube Shorts Money Calculator ──────────────────────────
   /tools/youtube-shorts-money-calculator. Migrated to the editorial design
   language (Fraunces + Barlow, sharp flat cards, warm paper, restrained red),
   typed views input (no slider). Shorts pay from a shared ad pool, so RPM is
   far lower and flatter than long-form; audience country is the dominant
   lever. See project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

const SHORTS_RPM_LOW = 0.04
const SHORTS_RPM_HIGH = 0.10
const QUICK_VIEWS = [100_000, 1_000_000, 10_000_000, 50_000_000]

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
    if (document.getElementById('smc-styles')) return
    const style = document.createElement('style')
    style.id = 'smc-styles'
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
      @keyframes smcFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .smc-wrap { max-width: 920px; margin: 0 auto; }
      .smc-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .smc-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .smc-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .smc-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.04; }
      .smc-h1 em { font-style: italic; color: var(--yte-accent); }
      .smc-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .smc-h2 em { font-style: italic; color: var(--yte-accent); }
      .smc-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .smc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; align-items: stretch; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 760px) { .smc-grid { grid-template-columns: 1fr; } }
      .smc-card { background: var(--yte-surface); padding: 30px; display: flex; flex-direction: column; gap: 20px; }
      .smc-label { display: block; font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-muted); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 9px; }
      .smc-input { width: 100%; padding: 13px 14px; font-size: 16px; font-weight: 500; font-family: ${SANS}; color: var(--yte-ink); background: var(--yte-bg); border: 1px solid var(--yte-line); border-radius: 0; outline: none; transition: border-color 0.15s, background 0.15s; -webkit-appearance: none; font-variant-numeric: tabular-nums; }
      .smc-input:focus { border-color: var(--yte-accent); background: #fff; }
      select.smc-input { font-size: 14px; }
      .smc-chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 11px; }
      .smc-chip { font-family: ${SANS}; font-size: 12px; font-weight: 600; color: var(--yte-soft); background: transparent; border: 1px solid var(--yte-line); border-radius: 0; padding: 6px 13px; cursor: pointer; transition: all 0.15s; letter-spacing: 0.02em; }
      .smc-chip:hover { border-color: var(--yte-ink); color: var(--yte-ink); }
      .smc-chip.active { background: var(--yte-ink); border-color: var(--yte-ink); color: #fff; }
      .smc-result { display: flex; flex-direction: column; background: var(--yte-ink); color: #fff; padding: 32px; }
      .smc-serif { font-family: ${SERIF}; }

      .smc-grow-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 760px) { .smc-grow-grid { grid-template-columns: 1fr; } }
      .smc-grow-card { display: block; text-decoration: none; background: var(--yte-surface); padding: 28px; transition: background 0.15s; }
      .smc-grow-card:hover { background: var(--yte-bg-2); }

      .smc-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease; }
      .smc-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .smc-faq-answer-inner { overflow: hidden; }

      @media (max-width: 768px) { .smc-section-pad { padding-left: 22px !important; padding-right: 22px !important; } .smc-cta-pad { padding: 76px 24px !important; } }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children }) {
  return (
    <div className="smc-eyebrow">
      <span aria-hidden="true" className="smc-eyebrow-rule" />
      <span className="smc-eyebrow-text">{children}</span>
    </div>
  )
}

const HOW_IT_WORKS = [
  { h: 'Shorts pay from a shared pool, not from ads on your Short',
    p: 'YouTube pools the ad money from the Shorts feed, sets aside the music-licensing share, then splits the rest among eligible creators by their share of monetizing-Shorts views. You keep 45% of your allocated slice. That pooled model is why Shorts RPM is far lower and flatter than long-form.' },
  { h: 'Audience country is the dominant lever',
    p: 'The Shorts pool in a high-spend country is simply bigger. Tier-1 views (US, UK, Canada, Australia) are worth several times tier-3 views. The same Short with the same view count earns wildly different amounts depending on where the viewers are.' },
  { h: 'Licensed music takes a cut before yours',
    p: 'When a Short uses commercial music, a portion of its revenue goes to the rights holders before your share is worked out. Shorts using original or royalty-free audio keep the full creator share, so they pay more per view.' },
  { h: 'Shorts are a growth tool, not a revenue tool',
    p: 'A Short with a million views might earn $40 to $100. The smart play is to use Shorts to win new viewers, then monetize that audience with long-form mid-rolls, sponsorships, and your own products, where the real money lives.' },
]

const GROW = [
  { label: 'Channel Audit', title: 'See why Shorts viewers leave',
    body: 'A 10-dimension AI audit shows why the new viewers Shorts bring in are not sticking around for your long-form, where the real RPM lives.', href: '/features/channel-audit' },
  { label: 'SEO Studio', title: 'Rank the videos Shorts feed into',
    body: 'Score your long-form titles and descriptions against the top-ranking videos in your niche so the watch time Shorts send converts to revenue.', href: '/features/seo-studio' },
  { label: 'Thumbnail IQ', title: 'Win the click on the payoff',
    body: 'Score your long-form thumbnails against the top performers on contrast, faces, and text so Shorts viewers click through to the videos that pay.', href: '/features/thumbnail-iq' },
]

const FAQS = [
  { q: 'How much do YouTube Shorts pay?',
    a: "Far less per view than long-form. Typical Shorts RPM is roughly $0.04 to $0.10 per 1,000 views for a tier-1 audience, versus $3 to $30 for long-form videos. That is because Shorts have no mid-rolls and no skippable in-stream ads. Revenue comes from a shared pool funded by ads running between Shorts in the feed, and creators receive 45% of the portion allocated to them. A Short with 1 million views might earn $40 to $100; the same million views on a long-form video in the right niche could earn thousands." },
  { q: 'How is Shorts revenue calculated?',
    a: "YouTube pools the ad money generated in the Shorts feed, sets aside the share owed to music licensing, and then distributes the rest to eligible creators based on their share of total Shorts views (specifically views on monetizing Shorts). From that allocated pool, creators keep 45%. Because it is a pooled, view-share model rather than ads-on-your-specific-video, your exact RPM moves with overall advertiser demand, your audience country, and how much licensed music your Shorts use." },
  { q: 'Why does audience country change my Shorts earnings so much?',
    a: "Advertiser spending power varies dramatically by region, and the Shorts pool in a high-spend country is simply bigger. Views from the US, UK, Canada, and Australia are worth several times more than views from many tier-3 regions. The same Short, with the same view count, earns very different amounts depending on where the viewers are. This calculator applies a country multiplier on top of the base Shorts RPM so the estimate reflects your real audience mix, which you can check in YouTube Studio under Analytics, Audience, Top geographies." },
  { q: 'Do I need to be in the YouTube Partner Program to earn from Shorts?',
    a: "Yes. To earn ad revenue from Shorts you must be accepted into the YouTube Partner Program. The Shorts path to eligibility is 1,000 subscribers plus 10 million valid public Shorts views in the last 90 days (the long-form path of 4,000 watch hours also qualifies you). Once you are in, you opt into Shorts monetization in YouTube Studio, and you also need an AdSense account in good standing and to live in a country where the program is available." },
  { q: 'Does using popular music lower my Shorts payout?',
    a: "It can. When your Short uses licensed commercial music, a portion of the revenue that Short generates is shared with the music rights holders before your cut is calculated, which reduces your take. Shorts that use no music, original audio, or royalty-free tracks keep the full creator share. If maximizing revenue matters more than trend-chasing, original or license-free audio pays better per view." },
  { q: 'Are Shorts even worth making if they pay so little?',
    a: "Yes, but as a growth tool, not a revenue tool. Shorts are one of the fastest ways to put your channel in front of new viewers, and a Short that goes viral can send a wave of subscribers to your long-form catalogue, which is where the real money is. The smart play is to use Shorts to grow the audience, then monetize that audience with long-form videos, memberships, sponsorships, and your own products. Treat the Shorts ad revenue as a small bonus on top." },
  { q: 'How do I earn more than just Shorts ad revenue?',
    a: "Most creators who grow on Shorts make far more from everything around the ads: brand sponsorships and integrations (often paying many times the ad RPM), affiliate links in the description, selling your own digital products or merch, channel memberships and Patreon, and converting Shorts viewers into long-form watchers who see higher-paying mid-roll ads. A channel earning a few hundred dollars a month from Shorts ads can be earning several times that once you count the rest." },
  { q: 'Why is my real Shorts revenue different from this estimate?',
    a: "A few reasons: the Shorts pool size shifts with advertiser demand and season (Q4 pays more than Q1), your real audience-country mix may differ from what you picked, the share of your Shorts using licensed music changes your cut, and only views on monetizing Shorts count toward the payout. Treat the number here as a realistic range, not a guarantee. Check YouTube Studio, Analytics, Revenue for your actual Shorts RPM once you are monetized." },
]

export default function YoutubeShortsMoneyCalculator() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()
  const [views, setViews]     = useState(1_000_000)
  const [country, setCountry] = useState('tier1')
  const [openFaq, setOpenFaq] = useState(0)

  const r = useMemo(() => {
    const c = COUNTRY_LOOKUP[country] || COUNTRIES[0]
    const lowRpm  = SHORTS_RPM_LOW  * c.mult
    const highRpm = SHORTS_RPM_HIGH * c.mult
    return {
      lowRpm, highRpm,
      monthlyLow: views * (lowRpm / 1000), monthlyHigh: views * (highRpm / 1000),
      annualLow: views * (lowRpm / 1000) * 12, annualHigh: views * (highRpm / 1000) * 12,
    }
  }, [views, country])

  function onViewsChange(e) {
    const digits = e.target.value.replace(/[^0-9]/g, '')
    setViews(digits === '' ? 0 : Math.min(Number(digits), 10_000_000_000))
  }

  const H1 = isMobile ? 36 : 56
  const H2 = isMobile ? 28 : 40

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', overflowX: 'clip' }}>
      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="smc-section-pad" style={{ padding: isMobile ? '60px 22px 40px' : '104px 48px 48px', background: 'var(--yte-bg)' }}>
        <div className="smc-wrap" style={{ animation: 'smcFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 className="smc-h1" style={{ fontSize: H1, marginBottom: 22, maxWidth: 760, textWrap: 'balance' }}>
            How much do YouTube Shorts <em>pay?</em>
          </h1>
          <div style={{ maxWidth: 620 }}>
            <p className="smc-lead" style={{ fontSize: isMobile ? 16 : 17.5, marginBottom: 14, textWrap: 'pretty' }}>
              A realistic Shorts money calculator built on the actual shared-pool RPM, not the inflated numbers most calculators show. Type your monthly Shorts views and pick your audience country for a sensible range.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
              No signup. No email. Free forever.
            </p>
          </div>
        </div>
      </section>

      {/* ══ CALCULATOR ══ */}
      <section className="smc-section-pad" style={{ padding: isMobile ? '8px 22px 64px' : '0 48px 88px', background: 'var(--yte-bg)' }}>
        <div className="smc-wrap">
          <div className="smc-grid">
            {/* Inputs */}
            <div className="smc-card">
              <div>
                <label className="smc-label" htmlFor="smc-views">Monthly Shorts views</label>
                <input id="smc-views" className="smc-input" type="text" inputMode="numeric"
                  value={views ? views.toLocaleString() : ''} onChange={onViewsChange}
                  placeholder="e.g. 1,000,000" aria-label="Monthly Shorts views" />
                <div className="smc-chips">
                  {QUICK_VIEWS.map(v => (
                    <button key={v} type="button" className={'smc-chip' + (views === v ? ' active' : '')} onClick={() => setViews(v)}>{fmtViews(v)}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="smc-label" htmlFor="smc-country">Audience country</label>
                <select id="smc-country" className="smc-input" value={country} onChange={e => setCountry(e.target.value)}>
                  {COUNTRIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {/* Result */}
            <div className="smc-result">
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.62, marginBottom: 14 }}>
                Estimated Shorts earnings
              </div>
              <div className="smc-serif" style={{ fontSize: 46, fontWeight: 400, letterSpacing: '-1px', lineHeight: 1.02, marginBottom: 10 }}>
                {fmtMoney(r.monthlyLow)} – {fmtMoney(r.monthlyHigh)}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, opacity: 0.7 }}>{fmtViews(views)} Shorts views/mo</div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.16)', margin: '24px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 10.5, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 7 }}>Per year</div>
                  <div className="smc-serif" style={{ fontSize: 22, fontWeight: 400, letterSpacing: '-0.3px' }}>{fmtMoney(r.annualLow)} – {fmtMoney(r.annualHigh)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: SANS, fontSize: 10.5, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 7 }}>Shorts RPM</div>
                  <div className="smc-serif" style={{ fontSize: 22, fontWeight: 400, letterSpacing: '-0.3px' }}>${r.lowRpm.toFixed(3)} – ${r.highRpm.toFixed(3)}</div>
                </div>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: 26, fontFamily: SANS, fontSize: 12.5, opacity: 0.7, lineHeight: 1.55 }}>
                Shorts pay from a shared ad pool (you keep 45% of your allocated slice), so RPM runs far below long-form.{' '}
                <a href="/tools/youtube-money-calculator" style={{ color: '#fff', textDecoration: 'underline', textUnderlineOffset: 2 }}>Compare long-form earnings →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="smc-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="smc-wrap">
          <div style={{ marginBottom: 40, maxWidth: 680 }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="smc-h2" style={{ fontSize: H2, textWrap: 'balance' }}>Why Shorts pay <em>so little.</em></h2>
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

      {/* ══ EARN MORE (grow cards) ══ */}
      <section className="smc-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="smc-wrap">
          <div style={{ marginBottom: 32, maxWidth: 680 }}>
            <Eyebrow>Earn more from Shorts</Eyebrow>
            <h2 className="smc-h2" style={{ fontSize: H2, marginBottom: 12, textWrap: 'balance' }}>The real money is <em>downstream.</em></h2>
            <p className="smc-lead" style={{ fontSize: 17 }}>The money is in converting Shorts viewers into long-form watchers, where mid-roll ads pay multiples of the Shorts pool. YTGrowth helps you do exactly that.</p>
          </div>
          <div className="smc-grow-grid">
            {GROW.map((c, i) => (
              <a key={i} href={c.href} className="smc-grow-card">
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>{c.label}</div>
                <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', marginBottom: 12, lineHeight: 1.2 }}>{c.title}</h3>
                <p style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.65 }}>{c.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div className="smc-section-pad" style={{ background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)', padding: isMobile ? '60px 22px' : '104px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 36 : 80, alignItems: 'start' }}>
          <div>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="smc-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>Shorts pay, <em>answered.</em></h2>
            <p className="smc-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              What creators ask before betting on Shorts. Still unsure? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
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
                  <div className={`smc-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="smc-faq-answer-inner">
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
