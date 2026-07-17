import { useEffect, useState } from 'react'
import LandingFooter from '../components/LandingFooter'
import SiteHeader from '../components/SiteHeader'

/* Affiliate / partner program page. Migrated to the editorial design
   language (Fraunces + Barlow, sharp flat cards, warm paper, restrained
   red). The earnings calculator logic, comparison data, testimonials, and
   FAQ are preserved; only the skin changed. The repeated bottom CTA card
   was removed (the join action stays in the hero + calculator), see
   feedback_no_dark_cta_band. See project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return { isMobile: width <= 768, isTablet: width <= 1024 }
}

function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-aff-styles')) return
    const style = document.createElement('style')
    style.id = 'ytg-aff-styles'
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
      @keyframes affFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .aff-wrap { max-width: 1100px; margin: 0 auto; }
      .aff-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .aff-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .aff-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .aff-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.05; }
      .aff-h1 em { font-style: italic; color: var(--yte-accent); }
      .aff-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .aff-h2 em { font-style: italic; color: var(--yte-accent); }
      .aff-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .aff-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--yte-accent); color: #fff; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 15px 30px; border: none; border-radius: 0; cursor: pointer; text-decoration: none; transition: filter 0.18s, transform 0.18s; }
      .aff-btn:hover { filter: brightness(1.06); transform: translateY(-1px); }
      .aff-btn-lg { font-size: 13px; padding: 17px 36px; }
      .aff-btn-full { width: 100%; }

      .aff-ghost { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 15px 28px; border-radius: 0; font-family: ${SANS}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--yte-soft); text-decoration: none; background: var(--yte-surface); border: 1px solid var(--yte-line); transition: color 0.15s, border-color 0.15s; }
      .aff-ghost:hover { color: var(--yte-ink); border-color: var(--yte-line-2); }

      .aff-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      .aff-card { background: var(--yte-surface); padding: 30px; }

      .aff-faq-item { border-bottom: 1px solid var(--yte-line); }
      .aff-faq-q { display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 22px 0; cursor: pointer; user-select: none; }

      @media (max-width: 900px) {
        .aff-grid-3 { grid-template-columns: 1fr; }
        .aff-calc-grid { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 768px) {
        .aff-section-pad { padding-left: 22px !important; padding-right: 22px !important; }
        .aff-stats-inner { gap: 28px 20px !important; }
        .aff-compare-grid { grid-template-columns: 1fr 70px 70px 70px !important; padding-left: 16px !important; padding-right: 16px !important; }
        .aff-compare-cell { font-size: 12px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 999 }}>
      <div style={{ height: '100%', width: `${progress}%`, background: 'var(--yte-accent)', transition: 'width 0.08s linear' }} />
    </div>
  )
}

/* ─── Data ───────────────────────────────────────────────────────────── */
const PLANS = [
  { name: 'Solo',   price: 19,  desc: 'Individual creators' },
  { name: 'Growth', price: 49,  desc: 'Growing channels' },
  { name: 'Agency', price: 149, desc: 'Agencies & power users' },
]

const FAQ_ITEMS = [
  {
    q: 'What is the commission rate and does it really recur?',
    a: 'You earn 30% of every payment your referrals make, not just the first one. If someone subscribes to the Growth plan at $49/month and stays for two years, you earn 30% of every single renewal for the full two years. Annual plans count too. There is no cliff, no cap, and no expiry on an active customer.',
  },
  {
    q: 'How long does the tracking cookie last?',
    a: 'The cookie window is 30 days. That means anyone who clicks your referral link and completes a purchase within 30 days is attributed to you, even if they close the tab, switch devices, or come back later. Attribution is industry-standard and works across browsers and sessions.',
  },
  {
    q: 'Do I need to be a paying YTGrowth customer to join?',
    a: 'No. You can join the affiliate program without ever subscribing to YTGrowth yourself. That said, affiliates who use the product tend to convert far better, your audience can tell the difference between someone reading copy off a page and someone who genuinely uses the tool every week.',
  },
  {
    q: 'Is there an approval process or minimum audience size?',
    a: 'No approval required and no minimum subscriber count. Sign up at the YTGrowth affiliate portal, get your link, and start sharing immediately. We do reserve the right to remove affiliates who use spam tactics, misleading claims, or paid ads that violate our policy, but for legitimate creators this is a non-issue.',
  },
  {
    q: 'What happens if my referral cancels and resubscribes later?',
    a: 'If they cancel and later return through your link again within the 30-day window, you earn the commission on their new subscription. If they return outside the 30-day window and do not click your link again, the new subscription is not attributed to you. This is standard behaviour across all major affiliate platforms.',
  },
  {
    q: 'How and when do I get paid?',
    a: 'Payouts are processed monthly, typically within the first two weeks of the following month. The minimum payout threshold is $50. You can receive payment via PayPal or direct bank transfer depending on your region. Everything is managed inside your YTGrowth affiliate dashboard.',
  },
  {
    q: 'Can I use paid advertising to promote my affiliate link?',
    a: 'You may use paid social ads and content promotion, but you may not run Google Search ads bidding on branded terms like "YTGrowth" or direct-link ads that send traffic straight to our domain. This protects our own ad spend and keeps commission quality high. Contact us if you want to run a larger paid campaign.',
  },
  {
    q: 'How do I track my clicks, conversions, and earnings?',
    a: 'Everything is tracked inside your YTGrowth affiliate dashboard. You can see total clicks on your link, how many converted, your pending and paid earnings, and a full transaction history. The dashboard updates in real time, so you can see exactly what is happening as it happens.',
  },
  {
    q: 'Does the 30% apply to one-time purchases and annual plans too?',
    a: 'Yes. The 30% commission applies to all plan types, monthly subscriptions, annual subscriptions paid upfront, and any future one-time product purchases. Annual plans pay out a larger single commission because the customer paid for the full year at once, which can mean a significantly bigger cheque per referral.',
  },
  {
    q: 'What marketing materials are available?',
    a: 'We provide talking points, screenshots, and feature descriptions you can use in your content. The most effective affiliates, however, simply record themselves using the tool. A genuine walkthrough of your own channel insights converts far better than any banner or template we could give you. Reach out to royalbluemedia.agency@gmail.com and we will send you everything we have.',
  },
]

const TESTIMONIALS = [
  {
    quote: 'I mentioned YTGrowth in one video, not even a dedicated review, just a passing recommendation in a tools roundup. Six months later I am still collecting recurring commissions from that single video. That has never happened with any other affiliate program I have promoted.',
    name: 'Marcus T.',
    role: 'Tech & Productivity · 42K subscribers',
    earning: '$340/mo',
  },
  {
    quote: 'The 30% recurring rate is genuinely the best I have seen in the YouTube tools space. VidIQ and TubeBuddy both offer one-time or lower-rate commissions. With YTGrowth I make more per referral, and I keep making it every single month. It is passive income that compounds.',
    name: 'Priya Nair',
    role: 'Personal Finance · 28K subscribers',
    earning: '$510/mo',
  },
  {
    quote: 'I run a YouTube coaching business and I send every new client through my affiliate link. It practically offsets my own subscription cost within the first few referrals, and the ongoing commissions have become a meaningful line item in my monthly income.',
    name: 'James Oduya',
    role: 'YouTube Coach · 67K subscribers',
    earning: '$890/mo',
  },
]

const COMPARE_ROWS = [
  { feature: 'Commission rate',            ytg: '30%',      vidiq: '15%',      tubebuddy: '20%' },
  { feature: 'Recurring commissions',      ytg: true,       vidiq: false,      tubebuddy: false },
  { feature: 'Cookie duration',            ytg: '30 days',  vidiq: '30 days',  tubebuddy: '30 days' },
  { feature: 'Instant link (no approval)', ytg: true,       vidiq: false,      tubebuddy: false },
  { feature: 'Annual plan commission',     ytg: true,       vidiq: true,       tubebuddy: true },
  { feature: 'Payout minimum',             ytg: '$50',      vidiq: '$50',      tubebuddy: '$10' },
]

function formatMoney(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path d="M3.5 9.2l3 3 8-8.4" stroke="var(--yte-accent)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Cross() {
  return (
    <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
      <path d="M5 5l8 8M13 5l-8 8" stroke="rgba(20,19,15,0.26)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function Affiliate() {
  useGlobalStyles()
  useEffect(() => { document.title = 'Affiliates, YTGrowth' }, [])

  const [referrals, setReferrals] = useState(10)
  const [openFaq, setOpenFaq]     = useState(0)
  const { isMobile }              = useBreakpoint()

  const H2 = isMobile ? 28 : 40

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', minHeight: '100vh' }}>

      <ScrollProgress />

      {/* ── NAV, shared SiteHeader ── */}
      <SiteHeader />

      {/* ══ SECTION 1, HERO ══ */}
      <section id="aff-hero" className="aff-section-pad" style={{ padding: isMobile ? '60px 22px 48px' : '104px 48px 72px', background: 'var(--yte-bg)' }}>
        <div className="aff-wrap" style={{ animation: 'affFadeUp 0.5s ease both' }}>
          <div className="aff-eyebrow">
            <span aria-hidden="true" className="aff-eyebrow-rule" />
            <span className="aff-eyebrow-text">Partner Program</span>
          </div>
          <h1 className="aff-h1" style={{ fontSize: isMobile ? 34 : 56, marginBottom: 22, maxWidth: 880, textWrap: 'balance' }}>
            Your audience is already buying YouTube tools. <em>You should be earning from it.</em>
          </h1>
          <p className="aff-lead" style={{ fontSize: isMobile ? 16 : 17.5, maxWidth: 580, marginBottom: 12, textWrap: 'pretty' }}>
            30% recurring commission on every payment, not just the first sale. Every renewal, every month, for the full lifetime of each customer you refer.
          </p>
          <p style={{ fontFamily: SANS, fontSize: 13, color: 'var(--yte-muted)', marginBottom: 34 }}>
            Free to join. No approval wait. Link in under 2 minutes.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="https://affiliates.ytgrowth.io" target="_blank" rel="noopener noreferrer" className="aff-btn aff-btn-lg">
              Claim your affiliate link →
            </a>
            <a href="#aff-calculator" className="aff-ghost">
              See earnings calculator
            </a>
          </div>
        </div>
      </section>

      {/* ══ SECTION 2, STATS BAR ══ */}
      <section id="aff-stats" style={{ background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)', padding: isMobile ? '48px 24px' : '56px 48px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="aff-stats-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32 }}>
            {[
              { value: '30%',    label: 'Recurring commission',    sub: 'Every payment, not just the first' },
              { value: '30 days', label: 'Cookie window',          sub: 'Standard attribution window' },
              { value: '$50',    label: 'Payout minimum',          sub: 'Monthly via PayPal or bank' },
              { value: '∞',      label: 'Earnings cap',            sub: 'No limit, no ceiling, ever' },
            ].map((s, i) => (
              <div key={i} style={{ minWidth: 150 }}>
                <div style={{ fontFamily: SERIF, fontSize: isMobile ? 36 : 42, fontWeight: 400, letterSpacing: '-0.8px', color: 'var(--yte-ink)', lineHeight: 1, marginBottom: 10 }}>{s.value}</div>
                <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: 'var(--yte-ink)', marginBottom: 5 }}>{s.label}</div>
                <div style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', lineHeight: 1.5 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 3, CALCULATOR ══ */}
      <section id="aff-calculator" className="aff-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="aff-wrap">
          <div style={{ marginBottom: 40, maxWidth: 680 }}>
            <div className="aff-eyebrow">
              <span aria-hidden="true" className="aff-eyebrow-rule" />
              <span className="aff-eyebrow-text">Earnings calculator</span>
            </div>
            <h2 className="aff-h2" style={{ fontSize: H2, textWrap: 'balance' }}>See exactly what you could <em>earn.</em></h2>
          </div>

          <div className="aff-calc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>

            {/* Slider card */}
            <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', padding: isMobile ? 26 : 36 }}>
              <p style={{ fontFamily: SANS, fontSize: 14, color: 'var(--yte-muted)', marginBottom: 28, lineHeight: 1.65 }}>
                Drag the slider to your estimated monthly referrals and see your projected income across all plans.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Referrals per month</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontFamily: SERIF, fontSize: 52, fontWeight: 400, color: 'var(--yte-accent)', letterSpacing: '-1.5px', lineHeight: 1 }}>{referrals}</span>
                  <span style={{ fontFamily: SANS, fontSize: 14, color: 'var(--yte-muted)' }}>/ mo</span>
                </div>
              </div>
              <input type="range" min={1} max={100} value={referrals}
                onChange={e => setReferrals(Number(e.target.value))}
                style={{ width: '100%', marginBottom: 8, accentColor: 'var(--yte-accent)', cursor: 'pointer', height: 4 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)', marginBottom: 32 }}>
                <span>1</span><span>50</span><span>100</span>
              </div>
              {PLANS.map((plan, i) => (
                <div key={plan.name} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '15px 0', borderTop: '1px solid var(--yte-line)',
                  borderBottom: i === PLANS.length - 1 ? '1px solid var(--yte-line)' : 'none',
                }}>
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: 'var(--yte-ink)' }}>{plan.name}</div>
                    <div style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', marginTop: 2 }}>${plan.price}/mo · {plan.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 400, color: 'var(--yte-accent)', letterSpacing: '-0.3px' }}>
                      {formatMoney(referrals * plan.price * 0.30)}
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)', marginTop: 2 }}>per month</div>
                  </div>
                </div>
              ))}
              <p style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)', marginTop: 18, lineHeight: 1.65 }}>
                Based on 30% of monthly plan price. Recurring, not one-off. Annual plans pay out more in a single commission.
              </p>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Annual projection card, dark editorial pane */}
              <div style={{ background: 'var(--yte-ink)', color: '#fff', padding: isMobile ? 28 : 36 }}>
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
                  If all {referrals} referrals take Growth ($49/mo)
                </div>
                <div style={{ fontFamily: SANS, fontSize: 13.5, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Monthly recurring</div>
                <div style={{ fontFamily: SERIF, fontSize: isMobile ? 42 : 50, fontWeight: 400, letterSpacing: '-1.5px', lineHeight: 1, marginBottom: 22, color: '#fff' }}>
                  {formatMoney(referrals * 49 * 0.30)}
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.14)', marginBottom: 22 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20 }}>
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Year 1 projection</div>
                    <div style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 400, letterSpacing: '-0.6px', color: '#fff' }}>{formatMoney(referrals * 49 * 0.30 * 12)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Per referral / yr</div>
                    <div style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 400, letterSpacing: '-0.6px', color: '#fff' }}>{formatMoney(49 * 0.30 * 12)}</div>
                  </div>
                </div>
              </div>

              {/* What they get */}
              <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', padding: 28 }}>
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 18 }}>What your referrals get</div>
                {[
                  'AI-powered channel analysis & insights',
                  'SEO Studio, title, description & tag optimiser',
                  'Competitor tracking & benchmarking',
                  'Keyword research with search volume data',
                  'Weekly performance reports via email',
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 11 }}>
                    <span style={{ marginTop: 2, flexShrink: 0 }}><Check /></span>
                    <span style={{ fontFamily: SANS, fontSize: 14, color: 'var(--yte-soft)', lineHeight: 1.55 }}>{f}</span>
                  </div>
                ))}
              </div>

              <a href="https://affiliates.ytgrowth.io" target="_blank" rel="noopener noreferrer" className="aff-btn aff-btn-full aff-btn-lg">
                Start earning this month →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTION 4, HOW IT WORKS ══ */}
      <section id="aff-how" className="aff-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="aff-wrap">
          <div style={{ marginBottom: 40, maxWidth: 680 }}>
            <div className="aff-eyebrow">
              <span aria-hidden="true" className="aff-eyebrow-rule" />
              <span className="aff-eyebrow-text">Simple process</span>
            </div>
            <h2 className="aff-h2" style={{ fontSize: H2, textWrap: 'balance' }}>Up and running in <em>under 5 minutes.</em></h2>
          </div>
          <div className="aff-grid-3">
            {[
              {
                n: '01', title: 'Sign up, instantly',
                body: 'Visit the YTGrowth affiliate portal, create a free account, and your unique tracking link is generated immediately. No application form, no waiting for approval, no minimum follower requirement.',
              },
              {
                n: '02', title: 'Share your link',
                body: 'Drop it in a YouTube video description, a newsletter, a tweet, a community post, or a pinned comment. The best-converting placements are honest tool recommendations in your regular content, not dedicated review videos.',
              },
              {
                n: '03', title: 'Earn every single month',
                body: 'Whenever someone you referred pays their subscription, month after month, or in one annual lump, 30% lands in your affiliate balance. Withdraw at any time once you clear $50.',
              },
            ].map((step, i) => (
              <div key={i} className="aff-card">
                <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: 'var(--yte-accent)', letterSpacing: '0.06em', marginBottom: 20 }}>{step.n}</div>
                <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: 'var(--yte-ink)', marginBottom: 12, letterSpacing: '-0.2px', lineHeight: 1.2 }}>{step.title}</div>
                <div style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.7 }}>{step.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 5, COMPARISON ══ */}
      <section id="aff-compare" className="aff-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ marginBottom: 36, maxWidth: 640 }}>
            <div className="aff-eyebrow">
              <span aria-hidden="true" className="aff-eyebrow-rule" />
              <span className="aff-eyebrow-text">How we compare</span>
            </div>
            <h2 className="aff-h2" style={{ fontSize: isMobile ? 26 : 36, marginBottom: 12, textWrap: 'balance' }}>The best affiliate deal in the YouTube tools market.</h2>
            <p className="aff-lead" style={{ fontSize: 15 }}>
              We looked at every major competitor program before setting ours. We set out to be meaningfully better, not just slightly higher on paper.
            </p>
          </div>
          <div style={{ background: 'var(--yte-surface)', border: '1px solid var(--yte-line)', overflow: 'hidden' }}>
            {/* Header */}
            <div className="aff-compare-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px', background: 'var(--yte-bg-2)', borderBottom: '1px solid var(--yte-line)', padding: '14px 28px' }}>
              <div className="aff-compare-cell" style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Feature</div>
              <div className="aff-compare-cell" style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: 'var(--yte-accent)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>YTGrowth</div>
              <div className="aff-compare-cell" style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>VidIQ</div>
              <div className="aff-compare-cell" style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>TubeBuddy</div>
            </div>
            {COMPARE_ROWS.map((row, i) => (
              <div key={i} className="aff-compare-grid" style={{
                display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px',
                padding: '15px 28px', alignItems: 'center',
                borderBottom: i < COMPARE_ROWS.length - 1 ? '1px solid var(--yte-line)' : 'none',
              }}>
                <div className="aff-compare-cell" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: 'var(--yte-ink)' }}>{row.feature}</div>
                <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {row.ytg === true ? <Check /> : row.ytg === false ? <Cross /> : <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: 'var(--yte-accent)' }}>{row.ytg}</span>}
                </div>
                <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {row.vidiq === true ? <Check /> : row.vidiq === false ? <Cross /> : <span style={{ fontFamily: SANS, fontSize: 14, color: 'var(--yte-muted)' }}>{row.vidiq}</span>}
                </div>
                <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {row.tubebuddy === true ? <Check /> : row.tubebuddy === false ? <Cross /> : <span style={{ fontFamily: SANS, fontSize: 14, color: 'var(--yte-muted)' }}>{row.tubebuddy}</span>}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: SANS, fontSize: 12, color: 'var(--yte-muted)', marginTop: 14 }}>
            Competitor data sourced from their publicly listed affiliate program pages. Subject to change.
          </p>
        </div>
      </section>

      {/* ══ SECTION 6, TESTIMONIALS ══ */}
      <section id="aff-testimonials" className="aff-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="aff-wrap">
          <div style={{ marginBottom: 40, maxWidth: 680 }}>
            <div className="aff-eyebrow">
              <span aria-hidden="true" className="aff-eyebrow-rule" />
              <span className="aff-eyebrow-text">Real affiliates</span>
            </div>
            <h2 className="aff-h2" style={{ fontSize: H2, textWrap: 'balance' }}>Results from creators <em>already earning.</em></h2>
          </div>
          <div className="aff-grid-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="aff-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ alignSelf: 'flex-start', fontFamily: SANS, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--yte-accent)', background: 'var(--yte-accent-soft)', padding: '5px 11px', marginBottom: 22 }}>
                  {t.earning} recurring
                </div>
                <p style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.72, marginBottom: 26, flex: 1 }}>
                  "{t.quote}"
                </p>
                <div style={{ height: 1, background: 'var(--yte-line)', marginBottom: 18 }} />
                <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: 'var(--yte-ink)' }}>{t.name}</div>
                <div style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', marginTop: 3 }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 7, FAQ ══ */}
      <section id="aff-faq" className="aff-section-pad" style={{ padding: isMobile ? '64px 22px 80px' : '96px 48px 120px', background: 'var(--yte-bg)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 36 : 80, alignItems: 'start' }}>
          <div>
            <div className="aff-eyebrow">
              <span aria-hidden="true" className="aff-eyebrow-rule" />
              <span className="aff-eyebrow-text">FAQ</span>
            </div>
            <h2 className="aff-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>Every question <em>answered.</em></h2>
            <p className="aff-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              If something is not covered here, email <span style={{ color: 'var(--yte-ink)', fontWeight: 600 }}>royalbluemedia.agency@gmail.com</span>, we reply same day.
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--yte-line)' }}>
            {FAQ_ITEMS.map((item, i) => {
              const isOpen = openFaq === i
              return (
                <div key={i} className="aff-faq-item">
                  <div className="aff-faq-q" role="button" tabIndex={0}
                    onClick={() => setOpenFaq(isOpen ? -1 : i)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenFaq(isOpen ? -1 : i) } }}>
                    <span style={{ flex: 1, fontFamily: SERIF, fontSize: isMobile ? 18 : 20, fontWeight: 400, color: isOpen ? 'var(--yte-accent)' : 'var(--yte-ink)', lineHeight: 1.3, letterSpacing: '-0.2px', transition: 'color 0.2s' }}>{item.q}</span>
                    <span aria-hidden="true" style={{ flexShrink: 0, fontFamily: SANS, fontSize: 26, fontWeight: 300, color: 'var(--yte-accent)', lineHeight: 1, transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                  </div>
                  {isOpen && (
                    <div style={{ paddingBottom: isMobile ? 22 : 26, maxWidth: 680 }}>
                      <p style={{ fontFamily: SANS, fontSize: isMobile ? 14.5 : 15.5, color: 'var(--yte-soft)', lineHeight: 1.78, margin: 0 }}>{item.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <LandingFooter />

    </div>
  )
}
