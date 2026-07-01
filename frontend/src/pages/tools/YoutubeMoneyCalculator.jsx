import { useEffect, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'
import MoneyCalculatorWidget from '../../components/MoneyCalculatorWidget'

/* ─── Free SEO tool: YouTube Money Calculator ─────────────────────────────
   /tools/youtube-money-calculator. Rebuilt on the editorial design language
   (Fraunces serif + Barlow, sharp flat cards, warm paper, restrained red) and
   the shared MoneyCalculatorWidget (typed views input, no slider). This is the
   first tool page migrated to the standard; see memory
   project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

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
    if (document.getElementById('ymc-styles')) return
    const style = document.createElement('style')
    style.id = 'ymc-styles'
    style.textContent = `
      :root {
        --yte-bg: #f6f4ef; --yte-bg-2: #efece4; --yte-surface: #ffffff;
        --yte-ink: #14130f; --yte-soft: #5c574e; --yte-muted: #8a8378;
        --yte-line: rgba(20,19,15,0.12); --yte-line-2: rgba(20,19,15,0.20);
        --yte-accent: #e5302a; --yte-accent-soft: rgba(229,48,42,0.07);
        --yte-dark: #0d0d12;
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; scroll-padding-top: 84px; }
      body { background: var(--yte-bg); color: var(--yte-ink); font-family: ${SANS}; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
      @keyframes ymcFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .ymc-wrap { max-width: 920px; margin: 0 auto; }

      .ymc-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 9px;
        background: var(--yte-accent); color: #fff;
        font-family: ${SANS}; font-size: 12.5px; font-weight: 700;
        letter-spacing: 0.1em; text-transform: uppercase;
        padding: 15px 30px; border: none; border-radius: 0;
        cursor: pointer; text-decoration: none; white-space: nowrap;
        transition: filter 0.18s, transform 0.18s;
      }
      .ymc-btn:hover { filter: brightness(1.06); transform: translateY(-2px); }
      .ymc-btn-lg { font-size: 13px; padding: 18px 40px; }

      .ymc-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .ymc-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .ymc-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }

      .ymc-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.04; }
      .ymc-h1 em { font-style: italic; color: var(--yte-accent); }
      .ymc-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .ymc-h2 em { font-style: italic; color: var(--yte-accent); }
      .ymc-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .ymc-num { font-family: ${SERIF}; font-size: 30px; font-weight: 300; color: var(--yte-accent); letter-spacing: -0.5px; line-height: 1; }

      .ymc-grow-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 760px) { .ymc-grow-grid { grid-template-columns: 1fr; } }
      .ymc-grow-card { display: block; text-decoration: none; background: var(--yte-surface); padding: 30px; transition: background 0.15s; }
      .ymc-grow-card:hover { background: var(--yte-bg-2); }

      .ymc-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease; }
      .ymc-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .ymc-faq-answer-inner { overflow: hidden; }

      @media (max-width: 768px) {
        .ymc-section-pad { padding-left: 22px !important; padding-right: 22px !important; }
        .ymc-cta-pad { padding: 76px 24px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children }) {
  return (
    <div className="ymc-eyebrow">
      <span aria-hidden="true" className="ymc-eyebrow-rule" />
      <span className="ymc-eyebrow-text">{children}</span>
    </div>
  )
}

const HOW_EARNINGS = [
  { h: 'RPM is the only number that matters to your wallet',
    p: "CPM is what advertisers pay per 1,000 ad impressions. RPM is what you receive per 1,000 video views, after YouTube's 45% cut, after the views that did not see an ad, after the videos that ran without monetization. RPM is always lower than CPM. RPM is your number." },
  { h: 'Niche is a bigger lever than view count',
    p: "A finance channel with 100K monthly views can out-earn a gaming channel with 1M. Advertisers pay $30+ to reach a finance viewer and $3 for a gaming viewer. Pick your niche with this in mind, especially starting from scratch." },
  { h: 'Audience country multiplies everything',
    p: "US, UK, Canada, and Australia viewers earn the highest ad spend on the planet. The same video, same niche, same view count, earns 4 to 5x more from a tier-1 audience than a tier-3 one. English content for global niches scales revenue fastest." },
  { h: 'Long-form videos earn more per view',
    p: "Videos over 8 minutes can run mid-roll ads, multiple ad slots inside one view. A 20-minute video with 3 mid-rolls earns 2 to 3x more per view than a 5-minute one. This is also why Shorts pay so little: no mid-rolls." },
]

const GROW = [
  { label: 'AI Channel Audit', title: 'Find what is broken',
    body: 'A 10-dimension audit across your last 20 videos, CTR, retention, and cadence, with a prioritized punch list of what to fix first.', href: '/features/channel-audit' },
  { label: 'SEO Studio', title: 'Rank for searches that pay',
    body: 'Score every title and description against the actual top-ranking videos in your niche, so the work goes into keywords with real volume.', href: '/features/seo-studio' },
  { label: 'Thumbnail IQ', title: 'Win the click war',
    body: 'CTR is a primary ranking signal. Score thumbnails against the top performers in your niche on contrast, faces, and text before you upload.', href: '/features/thumbnail-iq' },
]

const FAQS = [
  { q: 'How accurate is this YouTube money calculator?',
    a: "The numbers are realistic estimates based on industry-reported RPM ranges by niche and audience country. Real earnings vary with watch time, mid-roll placement, ad blocker rates, season (Q4 ads pay roughly 30-40% more than Q1), the percentage of your viewers watching with YouTube Premium, and whether your videos qualify for skippable in-stream ads. Treat the output as a sensible range, not a precise paycheck." },
  { q: 'What is RPM vs CPM, and which one matters?',
    a: "CPM (Cost Per Mille) is what advertisers pay per 1,000 ad impressions. It's their cost, not your income. RPM (Revenue Per Mille) is what you take home per 1,000 video views, after YouTube's 45% cut, after the views that never saw an ad, after the videos that ran without monetization at all. RPM is always significantly lower than CPM, usually 30-50% of it. RPM is the only number you should care about as a creator, and it's what this calculator estimates." },
  { q: 'Why does my niche change the result so much?',
    a: 'Advertisers bid wildly different amounts depending on the audience they want to reach. A finance viewer might be worth $40 to a credit card or brokerage advertiser because that viewer might sign up for a $200/month product. A kids-content viewer is worth a fraction of that. Niche is the single biggest lever in YouTube earnings, often bigger than view count. A 100K/month finance channel can out-earn a 1M/month gaming channel.' },
  { q: 'Why does audience country matter so much?',
    a: 'Advertiser spending power varies dramatically by country. US, UK, Canada, and Australia have the highest ad spend on the planet. A view from a US viewer can be worth 4-5x a view from a tier-3 country, and 8-10x a view from India or parts of Africa. The same video, with the same niche, the same length, the same retention, earns wildly different amounts depending on who watches it.' },
  { q: 'Do I have to be in the YouTube Partner Program to earn from my videos?',
    a: "Yes. To earn from ads you need to be in the YouTube Partner Program. The current eligibility thresholds are 1,000 subscribers plus either 4,000 valid public watch hours in the last 12 months OR 10 million Shorts views in the last 90 days. Once accepted, you can monetize through ads, channel memberships, Super Chat, Super Thanks, and YouTube Premium revenue." },
  { q: 'How much do YouTube Shorts pay?',
    a: "Shorts pay much less per view than long-form. There are no mid-rolls, and Shorts revenue comes from a shared pool funded by ads in the Shorts feed, not from ads on your specific Short. Typical Shorts RPM is $0.04-$0.10 per 1,000 views, vs $3-$30 for long-form. Shorts are a discovery tool, not a revenue tool." },
  { q: 'How long do my videos need to be to run mid-roll ads?',
    a: 'Videos must be at least 8 minutes long to qualify for mid-roll ads (the slots that play partway through). This is the single biggest free RPM upgrade available. Going from 5-minute videos to 10-minute videos can roughly double your earnings per view, because each mid-roll slot is its own ad impression. Do not pad video length artificially, retention will tank.' },
  { q: 'Why do my actual earnings look lower than this calculator predicts?',
    a: 'A few common reasons: a high percentage of Shorts views, which pay almost nothing; a chunk of your audience using ad blockers; videos flagged as limited or no ads due to content, language, or copyrighted music; uploading during a low ad-spend season (Q1 is brutal, Q4 is the gold rush); or an audience country mix that is more tier-3-heavy than you think. Check YouTube Studio, Analytics, Revenue, Geography for your real country breakdown.' },
  { q: 'Beyond ad revenue, what other ways do YouTubers make money?',
    a: "Most full-time creators have 4-6 income streams, not just ads: brand sponsorships and integrations, often the biggest line item; affiliate marketing; selling their own digital products (courses, templates, presets); memberships via YouTube or Patreon; merchandise; and Super Chat, Super Thanks, and Super Stickers during live streams. A channel earning $2,000/month from ads might be earning $8,000/month total." },
  { q: 'How do I increase my RPM without growing my view count?',
    a: 'Three high-impact moves: (1) lengthen your videos past 8 minutes so they qualify for mid-rolls, and add 2 to 3 mid-roll slots manually in YouTube Studio rather than relying on auto-placement; (2) pivot your content angle toward higher-RPM topics within your existing niche (a beauty channel covering luxury skincare earns multiples more than one covering drugstore hauls); (3) improve your audience country mix by creating English-first content with hooks that travel internationally rather than geo-locked references. None of these require more views, they just earn more from the views you already have.' },
  { q: 'When do I get paid by YouTube?',
    a: 'YouTube pays via Google AdSense on a monthly cycle. You need to hit a $100 minimum threshold in your AdSense account; once you cross it, payment is issued around the 21st to 26th of the following month. So earnings from October typically arrive in late November. Payment methods depend on country: bank transfer (EFT), wire, check, and Western Union are the most common. Tax forms (W-9 in the US, W-8BEN internationally) must be on file or your earnings get withheld.' },
  { q: 'Will I owe taxes on my YouTube earnings?',
    a: "Yes. YouTube ad revenue is self-employment income for most creators and is taxed accordingly. In the US that means federal income tax plus 15.3% self-employment tax (covering Social Security and Medicare). You'll receive a 1099 form from Google if you earn over $600/year. Outside the US, treatment varies, but most countries treat YouTube income as freelance or self-employment, and YouTube withholds 30% of US-derived earnings unless you've submitted a W-8BEN tax form claiming a treaty rate. Talk to an accountant once you cross $1,000/month, when the structuring decisions (LLC, expenses, retirement contributions) start to matter." },
  { q: 'Is this calculator free? Will you sell my data?',
    a: "Yes, free, and no data collection. The calculator runs entirely in your browser; no inputs are sent to our servers, no email required, no signup gate. If you want a real, personalised growth plan beyond an earnings estimate, you can connect your channel for a free AI audit, but that is entirely optional." },
]

export default function YoutubeMoneyCalculator() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()
  const [openFaq, setOpenFaq] = useState(0)

  const H1 = isMobile ? 36 : 60
  const H2 = isMobile ? 28 : 40

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', overflowX: 'clip' }}>
      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="ymc-section-pad" style={{ padding: isMobile ? '60px 22px 44px' : '104px 48px 56px', background: 'var(--yte-bg)' }}>
        <div className="ymc-wrap" style={{ animation: 'ymcFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 className="ymc-h1" style={{ fontSize: H1, marginBottom: 24, maxWidth: 760, textWrap: 'balance' }}>
            What does a YouTube channel <em>earn?</em>
          </h1>
          <div style={{ maxWidth: 640 }}>
            <p className="ymc-lead" style={{ fontSize: isMobile ? 16 : 17.5, marginBottom: 14, textWrap: 'pretty' }}>
              A realistic YouTube money calculator built on real RPM ranges by niche and audience country, not the inflated potential-earnings most calculators show. Type your monthly views and get a sensible range.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
              No signup. No email. Free forever.
            </p>
          </div>
        </div>
      </section>

      {/* ══ CALCULATOR ══ */}
      <section className="ymc-section-pad" style={{ padding: isMobile ? '8px 22px 64px' : '0 48px 88px', background: 'var(--yte-bg)' }}>
        <div className="ymc-wrap">
          <MoneyCalculatorWidget initialNiche="tech" initialCountry="tier1" />
        </div>
      </section>

      {/* ══ HOW EARNINGS WORK ══ */}
      <section className="ymc-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="ymc-wrap">
          <div style={{ marginBottom: 40, maxWidth: 680 }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="ymc-h2" style={{ fontSize: H2, textWrap: 'balance' }}>How YouTube earnings <em>work.</em></h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {HOW_EARNINGS.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', gap: isMobile ? 10 : 48, padding: '26px 0', borderTop: i === 0 ? 'none' : '1px solid var(--yte-line)' }}>
                <h3 style={{ fontFamily: SERIF, fontSize: isMobile ? 21 : 23, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', lineHeight: 1.2 }}>{row.h}</h3>
                <p style={{ fontFamily: SANS, fontSize: isMobile ? 15 : 16, color: 'var(--yte-soft)', lineHeight: 1.72 }}>{row.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW TO GROW ══ */}
      <section className="ymc-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 36, maxWidth: 680 }}>
            <Eyebrow>Grow your earnings</Eyebrow>
            <h2 className="ymc-h2" style={{ fontSize: H2, textWrap: 'balance' }}>How to <em>move these numbers.</em></h2>
          </div>
          <div className="ymc-grow-grid">
            {GROW.map((c, i) => (
              <a key={i} href={c.href} className="ymc-grow-card">
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>{c.label}</div>
                <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', marginBottom: 12, lineHeight: 1.2 }}>{c.title}</h3>
                <p style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.65 }}>{c.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div className="ymc-section-pad" style={{ background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)', padding: isMobile ? '60px 22px' : '104px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 36 : 80, alignItems: 'start' }}>
          <div>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="ymc-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>
              Questions <em>answered.</em>
            </h2>
            <p className="ymc-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              Everything creators ask before they estimate income. Still unsure? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
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
                  <div className={`ymc-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="ymc-faq-answer-inner">
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
