import { useEffect, useState } from 'react'

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
    if (document.getElementById('ytg-aff-styles')) return
    const link = document.createElement('link')
    link.id = 'ytg-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytg-aff-styles'
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
        --ytg-shadow-xl:    0 8px 28px rgba(0,0,0,0.13), 0 40px 100px rgba(0,0,0,0.17);
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'DM Sans', system-ui, sans-serif; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 5px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background: rgba(10,10,15,0.16); border-radius: 10px }

      @keyframes fadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .aff-btn {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'DM Sans', system-ui, sans-serif;
        padding: 15px 36px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.14), 0 4px 20px rgba(229,48,42,0.38);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .aff-btn:hover {
        filter: brightness(1.07); transform: translateY(-1px);
        box-shadow: 0 3px 8px rgba(0,0,0,0.16), 0 12px 36px rgba(229,48,42,0.46);
      }
      .aff-btn-lg  { font-size: 16px; padding: 17px 44px; }
      .aff-btn-full { width: 100%; justify-content: center; }

      .aff-section-label {
        display: inline-block; font-size: 11px; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: var(--ytg-accent-text); background: var(--ytg-accent-light);
        padding: 5px 13px; border-radius: 100px; margin-bottom: 16px;
      }

      .aff-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
      .aff-grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 22px; }

      .aff-nav-link {
        font-size: 14px; color: var(--ytg-text-3); font-weight: 500;
        text-decoration: none; transition: color 0.15s; letter-spacing: -0.1px;
      }
      .aff-nav-link:hover { color: var(--ytg-text-2); }

      @media (max-width: 900px) {
        .aff-grid-3 { grid-template-columns: 1fr; }
        .aff-grid-2 { grid-template-columns: 1fr; }
        .aff-calc-grid { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 768px) {
        .aff-hero-h1   { font-size: 34px !important; letter-spacing: -1px !important; }
        .aff-section-h2 { font-size: 28px !important; letter-spacing: -0.8px !important; }
        .aff-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .aff-cta-pad   { padding: 52px 24px !important; }
        .aff-stats-inner { gap: 20px !important; }
        .aff-compare-table { font-size: 12px !important; }
        .aff-compare-col { display: none !important; }
        .aff-compare-grid { grid-template-columns: 1fr 80px 80px !important; }
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
      <div style={{ height: '100%', width: `${progress}%`, background: 'var(--ytg-accent)', transition: 'width 0.08s linear', borderRadius: '0 2px 2px 0' }} />
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
    a: 'You earn 30% of every payment your referrals make — not just the first one. If someone subscribes to the Growth plan at $49/month and stays for two years, you earn 30% of every single renewal for the full two years. Annual plans count too. There is no cliff, no cap, and no expiry on an active customer.',
  },
  {
    q: 'How long does the tracking cookie last?',
    a: 'The cookie window is 60 days. That means anyone who clicks your referral link and completes a purchase within 60 days is attributed to you — even if they close the tab, switch devices, or come back days later. Lemon Squeezy handles the attribution, and their tracking is industry-standard.',
  },
  {
    q: 'Do I need to be a paying YTGrowth customer to join?',
    a: 'No. You can join the affiliate program without ever subscribing to YTGrowth yourself. That said, affiliates who actually use the product tend to convert far better — your audience can tell the difference between someone reading copy off a page and someone who genuinely uses the tool every week.',
  },
  {
    q: 'Is there an approval process or minimum audience size?',
    a: 'No approval required and no minimum subscriber count. Sign up via Lemon Squeezy, get your link, and start sharing immediately. We do reserve the right to remove affiliates who use spam tactics, misleading claims, or paid ads that violate our policy — but for legitimate creators this is a non-issue.',
  },
  {
    q: 'What happens if my referral cancels and resubscribes later?',
    a: 'If they cancel and later return through your link again within the 60-day window, you earn the commission on their new subscription. If they return outside the 60-day window and do not click your link again, the new subscription is not attributed to you. This is standard behaviour across all major affiliate platforms.',
  },
  {
    q: 'How and when do I get paid?',
    a: 'Lemon Squeezy processes payouts monthly, typically within the first two weeks of the following month. The minimum payout threshold is $10. You can receive payment via PayPal or direct bank transfer depending on your region. Everything is managed inside your Lemon Squeezy affiliate dashboard — we do not handle any payment details ourselves.',
  },
  {
    q: 'Can I use paid advertising to promote my affiliate link?',
    a: 'You may use paid social ads and content promotion, but you may not run Google Search ads bidding on branded terms like "YTGrowth" or direct-link ads that send traffic straight to our domain. This protects our own ad spend and keeps commission quality high. Contact us if you want to run a larger paid campaign.',
  },
  {
    q: 'How do I track my clicks, conversions, and earnings?',
    a: 'Everything is tracked inside your Lemon Squeezy affiliate dashboard. You can see total clicks on your link, how many converted, your pending and paid earnings, and a full transaction history. Lemon Squeezy updates the dashboard in real time, so you can see exactly what is happening as it happens.',
  },
  {
    q: 'Does the 30% apply to one-time purchases and annual plans too?',
    a: 'Yes. The 30% commission applies to all plan types — monthly subscriptions, annual subscriptions paid upfront, and any future one-time product purchases. Annual plans pay out a larger single commission because the customer paid for the full year at once, which can mean a significantly bigger cheque per referral.',
  },
  {
    q: 'What marketing materials are available?',
    a: 'We provide talking points, screenshots, and feature descriptions you can use in your content. The most effective affiliates, however, simply record themselves using the tool. A genuine walkthrough of your own channel insights converts far better than any banner or template we could give you. Reach out to support@ytgrowth.io and we will send you everything we have.',
  },
]

const TESTIMONIALS = [
  {
    quote: 'I mentioned YTGrowth in one video — not even a dedicated review, just a passing recommendation in a tools roundup. Six months later I am still collecting recurring commissions from that single video. That has never happened with any other affiliate program I have promoted.',
    name: 'Marcus T.',
    role: 'Tech & Productivity · 42K subs',
    earning: '$340/mo',
  },
  {
    quote: 'The 30% recurring rate is genuinely the best I have seen in the YouTube tools space. VidIQ and TubeBuddy both offer one-time or lower-rate commissions. With YTGrowth I make more per referral, and I keep making it every single month. It is passive income that actually compounds.',
    name: 'Priya Nair',
    role: 'Personal Finance · 28K subs',
    earning: '$510/mo',
  },
  {
    quote: 'I run a YouTube coaching business and I send every new client through my affiliate link. It practically offsets my own subscription cost within the first few referrals, and the ongoing commissions have become a meaningful line item in my monthly income.',
    name: 'James Oduya',
    role: 'YouTube Coach · 67K subs',
    earning: '$890/mo',
  },
]

const COMPARE_ROWS = [
  { feature: 'Commission rate',            ytg: '30%',      vidiq: '15%',      tubebuddy: '20%' },
  { feature: 'Recurring commissions',      ytg: true,       vidiq: false,      tubebuddy: false },
  { feature: 'Cookie duration',            ytg: '60 days',  vidiq: '30 days',  tubebuddy: '30 days' },
  { feature: 'Instant link (no approval)', ytg: true,       vidiq: false,      tubebuddy: false },
  { feature: 'Annual plan commission',     ytg: true,       vidiq: true,       tubebuddy: true },
  { feature: 'Payout minimum',             ytg: '$10',      vidiq: '$50',      tubebuddy: '$10' },
]

function formatMoney(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="9" fill="rgba(229,48,42,0.1)" />
      <path d="M5 9l3 3 5-5" stroke="#e5302a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Cross() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="9" fill="rgba(10,10,15,0.05)" />
      <path d="M6 6l6 6M12 6l-6 6" stroke="rgba(10,10,15,0.28)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none"
      style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.22s' }}>
      <path d="M3 6l5 5 5-5" stroke="var(--ytg-text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function Affiliate() {
  useGlobalStyles()
  useEffect(() => { document.title = 'Affiliates — YTGrowth' }, [])

  const [referrals, setReferrals] = useState(10)
  const [openFaq, setOpenFaq]     = useState(0)
  const { isMobile }              = useBreakpoint()

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', minHeight: '100vh' }}>

      <ScrollProgress />

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--ytg-border)', padding: isMobile ? '0 20px' : '0 40px 0 72px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ytg-nav)', backdropFilter: 'blur(16px)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', minWidth: 0 }}>
          <Logo size={28} />
          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--ytg-text)', letterSpacing: '-0.4px', whiteSpace: 'nowrap' }}>YTGrowth</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {!isMobile && <a href="/" className="aff-nav-link">← Back to home</a>}
          <a href="https://ytgrowth.lemonsqueezy.com/affiliates" target="_blank" rel="noopener noreferrer"
            className="aff-btn"
            style={{ padding: isMobile ? '8px 18px' : '9px 22px', fontSize: isMobile ? 13 : 13, borderRadius: 100, whiteSpace: 'nowrap' }}>
            {isMobile ? 'Get link' : 'Get your link'}
          </a>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — HERO   bg: var(--ytg-bg)  #f4f4f6
      ══════════════════════════════════════════════════════════ */}
      <section id="aff-hero" className="aff-section-pad" style={{ padding: isMobile ? '72px 20px 60px' : '110px 40px 88px', textAlign: 'center', background: '#ffffff' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', animation: 'fadeUp 0.5s ease both' }}>
          <span className="aff-section-label">Partner Program</span>
          <h1 className="aff-hero-h1" style={{ fontSize: 58, fontWeight: 800, letterSpacing: '-2.5px', lineHeight: 1.06, color: 'var(--ytg-text)', marginBottom: 24 }}>
            Your audience is already<br />
            buying YouTube tools.<br />
            <span style={{ color: 'var(--ytg-accent)' }}>You should be earning from it.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18, color: 'var(--ytg-text-2)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto 14px' }}>
            30% recurring commission on every payment — not just the first sale. Every renewal, every month, for the full lifetime of each customer you refer.
          </p>
          <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 40 }}>
            Free to join. No approval wait. Link in under 2 minutes.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://ytgrowth.lemonsqueezy.com/affiliates" target="_blank" rel="noopener noreferrer" className="aff-btn aff-btn-lg">
              Claim your affiliate link →
            </a>
            <a href="#aff-calculator"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 28px', borderRadius: 100, fontSize: 15, fontWeight: 600, color: 'var(--ytg-text-2)', textDecoration: 'none', background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-sm)', transition: 'color 0.15s, box-shadow 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--ytg-text)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--ytg-text-2)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow-sm)' }}
            >
              See earnings calculator
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — STATS BAR   bg: --ytg-bg-2  #ecedf1  (stepped darker)
      ══════════════════════════════════════════════════════════ */}
      <section id="aff-stats" style={{ background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)', padding: '60px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="aff-stats-inner" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 32 }}>
            {[
              { value: '30%',    label: 'Recurring commission',    sub: 'Every payment — not just the first' },
              { value: '60 days', label: 'Cookie window',          sub: 'Industry-leading attribution' },
              { value: '$10',    label: 'Payout minimum',          sub: 'Monthly via PayPal or bank' },
              { value: '∞',      label: 'Earnings cap',            sub: 'No limit, no ceiling, ever' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', minWidth: 160 }}>
                <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--ytg-accent)', lineHeight: 1.1, marginBottom: 7 }}>{s.value}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ytg-text)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: 'var(--ytg-text-3)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — CALCULATOR   bg: var(--ytg-bg)  #f4f4f6
      ══════════════════════════════════════════════════════════ */}
      <section id="aff-calculator" className="aff-section-pad" style={{ padding: '100px 40px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="aff-section-label">Earnings calculator</span>
            <h2 className="aff-section-h2" style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.2px', color: 'var(--ytg-text)' }}>See exactly what you could earn</h2>
          </div>

          <div className="aff-calc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

            {/* Slider card */}
            <div style={{ background: 'var(--ytg-card)', borderRadius: 20, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-lg)', padding: 40 }}>
              <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 32, lineHeight: 1.65 }}>
                Drag the slider to your estimated monthly referrals and see your projected income across all plans.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Referrals per month</div>
                <div>
                  <span style={{ fontSize: 52, fontWeight: 800, color: 'var(--ytg-accent)', letterSpacing: '-2px', lineHeight: 1 }}>{referrals}</span>
                  <span style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginLeft: 4 }}>/ mo</span>
                </div>
              </div>
              <input type="range" min={1} max={100} value={referrals}
                onChange={e => setReferrals(Number(e.target.value))}
                style={{ width: '100%', marginBottom: 8, accentColor: 'var(--ytg-accent)', cursor: 'pointer', height: 4 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ytg-text-3)', marginBottom: 36 }}>
                <span>1</span><span>50</span><span>100</span>
              </div>
              {PLANS.map((plan, i) => (
                <div key={plan.name} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '15px 0', borderTop: '1px solid var(--ytg-border)',
                  borderBottom: i === PLANS.length - 1 ? '1px solid var(--ytg-border)' : 'none',
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ytg-text)' }}>{plan.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ytg-text-3)', marginTop: 2 }}>${plan.price}/mo · {plan.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ytg-accent)', letterSpacing: '-0.5px' }}>
                      {formatMoney(referrals * plan.price * 0.30)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ytg-text-3)', marginTop: 2 }}>per month</div>
                  </div>
                </div>
              ))}
              <p style={{ fontSize: 12, color: 'var(--ytg-text-3)', marginTop: 18, lineHeight: 1.65 }}>
                Based on 30% of monthly plan price. Recurring — not one-off. Annual plans pay out more in a single commission.
              </p>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Annual projection card — accent background */}
              <div style={{ background: 'var(--ytg-accent)', borderRadius: 20, border: 'none', boxShadow: '0 4px 18px rgba(229,48,42,0.32), 0 24px 60px rgba(229,48,42,0.18)', color: '#fff', padding: 36 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.72, marginBottom: 14 }}>
                  If all {referrals} referrals take Growth ($49/mo)
                </div>
                <div style={{ fontSize: 13, opacity: 0.78, marginBottom: 6 }}>Monthly recurring</div>
                <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2.5px', lineHeight: 1, marginBottom: 20 }}>
                  {formatMoney(referrals * 49 * 0.30)}
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', marginBottom: 20 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.72, marginBottom: 5 }}>Year 1 projection</div>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px' }}>{formatMoney(referrals * 49 * 0.30 * 12)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, opacity: 0.72, marginBottom: 5 }}>Per referral / yr</div>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px' }}>{formatMoney(49 * 0.30 * 12)}</div>
                  </div>
                </div>
              </div>

              {/* What they get */}
              <div style={{ background: 'var(--ytg-card)', borderRadius: 20, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ytg-text)', marginBottom: 18 }}>What your referrals actually get</div>
                {[
                  'AI-powered channel analysis & insights',
                  'SEO Studio — title, description & tag optimiser',
                  'Competitor tracking & benchmarking',
                  'Keyword research with search volume data',
                  'Weekly performance reports via email',
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 11 }}>
                    <Check />
                    <span style={{ fontSize: 13, color: 'var(--ytg-text-2)', lineHeight: 1.55 }}>{f}</span>
                  </div>
                ))}
              </div>

              <a href="https://ytgrowth.lemonsqueezy.com/affiliates" target="_blank" rel="noopener noreferrer"
                className="aff-btn aff-btn-full" style={{ padding: 17, fontSize: 15, borderRadius: 14 }}>
                Start earning this month →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4 — HOW IT WORKS   bg: --ytg-bg-3  #e6e7ec  (darkest step)
      ══════════════════════════════════════════════════════════ */}
      <section id="aff-how" className="aff-section-pad" style={{ padding: '100px 40px', background: 'var(--ytg-bg-3)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="aff-section-label">Simple process</span>
            <h2 className="aff-section-h2" style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.2px' }}>Up and running in under 5 minutes</h2>
          </div>
          <div className="aff-grid-3">
            {[
              {
                n: '01', title: 'Sign up — instantly',
                body: 'Visit the Lemon Squeezy affiliate portal, create a free account, and your unique tracking link is generated immediately. No application form, no waiting for approval, no minimum follower requirement.',
              },
              {
                n: '02', title: 'Share your link',
                body: 'Drop it in a YouTube video description, a newsletter, a tweet, a community post, or a pinned comment. The best-converting placements are honest tool recommendations in your regular content — not dedicated review videos.',
              },
              {
                n: '03', title: 'Earn every single month',
                body: 'Whenever someone you referred pays their subscription — month after month, or in one annual lump — 30% lands in your Lemon Squeezy balance. Withdraw at any time once you clear $10.',
              },
            ].map((step, i) => (
              <div key={i} style={{ background: 'var(--ytg-card)', borderRadius: 18, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-lg)', padding: 36 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ytg-accent)', letterSpacing: '0.04em', marginBottom: 22, fontFamily: 'monospace' }}>{step.n}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ytg-text)', marginBottom: 12, letterSpacing: '-0.3px' }}>{step.title}</div>
                <div style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.78 }}>{step.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 5 — COMPARISON   bg: var(--ytg-bg)  #f4f4f6
      ══════════════════════════════════════════════════════════ */}
      <section id="aff-compare" className="aff-section-pad" style={{ padding: '100px 40px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="aff-section-label">How we compare</span>
            <h2 className="aff-section-h2" style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.2px' }}>The best affiliate deal in the YouTube tools market</h2>
            <p style={{ fontSize: isMobile ? 14 : 15, color: 'var(--ytg-text-2)', marginTop: 14, maxWidth: 520, margin: '14px auto 0', lineHeight: 1.75 }}>
              We looked at every major competitor program before setting ours. We set out to be meaningfully better — not just slightly higher on paper.
            </p>
          </div>
          <div style={{ background: 'var(--ytg-card)', borderRadius: 20, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-lg)', overflow: 'hidden', fontSize: 14 }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px', background: 'var(--ytg-bg-2)', borderBottom: '1px solid var(--ytg-border)', padding: '14px 28px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ytg-text-3)' }}>Feature</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ytg-accent)', textAlign: 'center' }}>YTGrowth</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ytg-text-3)', textAlign: 'center' }}>VidIQ</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ytg-text-3)', textAlign: 'center' }}>TubeBuddy</div>
            </div>
            {COMPARE_ROWS.map((row, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px',
                padding: '16px 28px', alignItems: 'center',
                borderBottom: i < COMPARE_ROWS.length - 1 ? '1px solid var(--ytg-border)' : 'none',
                background: i % 2 === 1 ? 'rgba(10,10,15,0.018)' : 'transparent',
              }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ytg-text)' }}>{row.feature}</div>
                <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {row.ytg === true ? <Check /> : row.ytg === false ? <Cross /> : <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ytg-accent)' }}>{row.ytg}</span>}
                </div>
                <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {row.vidiq === true ? <Check /> : row.vidiq === false ? <Cross /> : <span style={{ fontSize: 13, color: 'var(--ytg-text-3)' }}>{row.vidiq}</span>}
                </div>
                <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {row.tubebuddy === true ? <Check /> : row.tubebuddy === false ? <Cross /> : <span style={{ fontSize: 13, color: 'var(--ytg-text-3)' }}>{row.tubebuddy}</span>}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--ytg-text-3)', marginTop: 14, textAlign: 'center' }}>
            Competitor data sourced from their publicly listed affiliate program pages. Subject to change.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 6 — TESTIMONIALS   bg: --ytg-bg-2  #ecedf1
      ══════════════════════════════════════════════════════════ */}
      <section id="aff-testimonials" className="aff-section-pad" style={{ padding: '100px 40px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="aff-section-label">Real affiliates</span>
            <h2 className="aff-section-h2" style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.2px' }}>Results from creators already earning</h2>
          </div>
          <div className="aff-grid-3">
            {(isMobile ? TESTIMONIALS.slice(0, 3) : TESTIMONIALS).map((t, i) => (
              <div key={i} style={{ background: 'var(--ytg-card)', borderRadius: 18, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-lg)', padding: 36, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ytg-accent-light)', borderRadius: 100, padding: '5px 12px', marginBottom: 22, alignSelf: 'flex-start' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ytg-accent)' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-accent-text)' }}>{t.earning} recurring</span>
                </div>
                <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.78, marginBottom: 28, fontWeight: 400, flex: 1 }}>
                  "{t.quote}"
                </p>
                <div style={{ height: 1, background: 'var(--ytg-border)', marginBottom: 18 }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ytg-text)' }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ytg-text-3)', marginTop: 3 }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 7 — FAQ   bg: var(--ytg-bg)  #f4f4f6
      ══════════════════════════════════════════════════════════ */}
      <section id="aff-faq" className="aff-section-pad" style={{ padding: '100px 40px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="aff-section-label">FAQ</span>
            <h2 className="aff-section-h2" style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.2px' }}>Every question answered</h2>
            <p style={{ fontSize: isMobile ? 14 : 15, color: 'var(--ytg-text-2)', marginTop: 14, lineHeight: 1.75 }}>
              If something is not covered here, email <span style={{ color: 'var(--ytg-text)', fontWeight: 600 }}>support@ytgrowth.io</span> — we reply same day.
            </p>
          </div>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} style={{
              background: 'var(--ytg-card)', borderRadius: 14,
              border: '1px solid var(--ytg-border)', marginBottom: 10, overflow: 'hidden',
              boxShadow: openFaq === i ? 'var(--ytg-shadow-lg)' : 'var(--ytg-shadow-sm)',
              transition: 'box-shadow 0.22s',
            }}>
              <div role="button" tabIndex={0}
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                onKeyDown={e => e.key === 'Enter' && setOpenFaq(openFaq === i ? -1 : i)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', cursor: 'pointer', userSelect: 'none' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ytg-text)', paddingRight: 16, lineHeight: 1.4 }}>{item.q}</span>
                <ChevronIcon open={openFaq === i} />
              </div>
              {openFaq === i && (
                <div style={{ padding: '0 24px 22px', fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.82 }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 8 — BOTTOM CTA   bg: --ytg-bg-3  #e6e7ec
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: isMobile ? '0 16px 80px' : '0 40px 120px', background: 'var(--ytg-bg-3)', borderTop: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', paddingTop: isMobile ? 48 : 80 }}>
          <div style={{
            borderRadius: isMobile ? 18 : 24,
            border: '1px solid var(--ytg-border)',
            boxShadow: 'var(--ytg-shadow-xl)',
            padding: isMobile ? '48px 24px 40px' : '88px 60px',
            textAlign: 'center',
            background: 'var(--ytg-card)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 500, height: 240, background: 'radial-gradient(ellipse, rgba(229,48,42,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <span className="aff-section-label">Ready to start?</span>
            <h2 style={{ fontSize: isMobile ? 30 : 44, fontWeight: 800, letterSpacing: isMobile ? '-0.8px' : '-1.6px', marginBottom: 14, lineHeight: 1.1 }}>
              Turn your recommendations<br />into recurring revenue.
            </h2>
            <p style={{ fontSize: isMobile ? 14 : 16, color: 'var(--ytg-text-2)', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.75 }}>
              Free to join. No minimum audience. No approval process. Get your link and earn your first commission this month.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,auto)',
              gap: isMobile ? '10px 16px' : 24,
              justifyContent: isMobile ? 'stretch' : 'center',
              justifyItems: 'center',
              marginBottom: isMobile ? 32 : 44,
              maxWidth: isMobile ? 280 : 'none',
              marginLeft: 'auto', marginRight: 'auto',
            }}>
              {['30% recurring', '60-day cookie', 'Instant access', 'Monthly payouts'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ytg-text-3)' }}>
                  <Check /><span style={{ whiteSpace: 'nowrap' }}>{t}</span>
                </div>
              ))}
            </div>
            <a href="https://ytgrowth.lemonsqueezy.com/affiliates" target="_blank" rel="noopener noreferrer"
              className={`aff-btn${isMobile ? ' aff-btn-full' : ' aff-btn-lg'}`}
              style={isMobile ? { borderRadius: 14, padding: '15px 24px', fontSize: 15 } : {}}>
              Join the Affiliate Program →
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.07)', padding: isMobile ? '28px 20px' : '36px 64px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 20 : 0, textAlign: isMobile ? 'center' : 'left' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
            <Logo size={26} />
            <span style={{ fontWeight: 800, fontSize: 15, color: '#ffffff', letterSpacing: '-0.4px' }}>YTGrowth</span>
          </a>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.32)' }}>Built for creators serious about growth.</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)' }}>© 2026 YTGrowth. All rights reserved.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? '12px 20px' : 28, justifyContent: isMobile ? 'center' : 'flex-end' }}>
            {[
              { label: 'Privacy policy',   href: '/privacy' },
              { label: 'Terms of service', href: '/terms' },
              { label: 'Refund policy',    href: '/refund' },
              { label: 'Affiliates',       href: '/affiliate' },
              { label: 'Log in',           href: '/auth/login' },
            ].map((l, i) => (
              <a key={i} href={l.href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', textDecoration: 'none', fontFamily: "'DM Sans', system-ui, sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.72)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}
              >{l.label}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
