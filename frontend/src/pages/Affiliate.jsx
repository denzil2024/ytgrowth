import { useEffect, useState } from 'react'

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
    if (document.getElementById('ytg-font')) return
    const link = document.createElement('link')
    link.id = 'ytg-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytg-styles'
    style.textContent = `
      :root {
        --ytg-bg: #f4f4f6; --ytg-text: #0a0a0f; --ytg-text-2: rgba(10,10,15,0.62);
        --ytg-text-3: rgba(10,10,15,0.44); --ytg-nav: rgba(244,244,246,0.9);
        --ytg-card: #ffffff; --ytg-border: rgba(10,10,15,0.11);
        --ytg-accent: #e5302a; --ytg-accent-text: #c22b25;
      }
    `
    document.head.appendChild(style)
  }, [])
}

const PLANS = [
  { name: 'Solo', price: 19 },
  { name: 'Growth', price: 49 },
  { name: 'Agency', price: 149 },
]

const FAQ_ITEMS = [
  {
    q: 'What is the commission rate?',
    a: '30% recurring on every payment — monthly renewals, annual plans, and one-time purchases alike.',
  },
  {
    q: 'How long does the cookie last?',
    a: 'Sixty days. Anyone who clicks your link and subscribes within 60 days is attributed to you.',
  },
  {
    q: 'Who qualifies?',
    a: 'Anyone with a YouTube creator audience — coaches, educators, or creators who make content for other YouTubers.',
  },
  {
    q: 'How do I get paid?',
    a: 'Lemon Squeezy pays out monthly once you hit the $10 minimum. Straight to your connected bank or PayPal.',
  },
]

const TESTIMONIALS = [
  {
    quote: 'I mentioned YTGrowth once in a video and the recurring commissions have been coming in every month since.',
    name: 'Marcus T.',
    role: 'Tech & Productivity · 42K subs',
  },
  {
    quote: "The 30% recurring rate is the best I've seen in this space. VidIQ and TubeBuddy can't touch it.",
    name: 'Priya Nair',
    role: 'Personal Finance · 28K subs',
  },
  {
    quote: 'I share it with every client I onboard. It practically pays for itself through the commissions alone.',
    name: 'James Oduya',
    role: 'Fitness Creator · 67K subs',
  },
]

function formatMoney(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function CtaButton({ children, style = {} }) {
  return (
    <a
      href="https://ytgrowth.lemonsqueezy.com/affiliates"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-block',
        background: 'var(--ytg-accent)',
        color: '#fff',
        fontSize: 15,
        fontWeight: 600,
        padding: '14px 34px',
        borderRadius: 10,
        border: 'none',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'opacity 0.18s',
        ...style,
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      {children}
    </a>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        flexShrink: 0,
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s',
      }}
    >
      <path d="M3 6l5 5 5-5" stroke="var(--ytg-text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Affiliate() {
  useGlobalStyles()
  useEffect(() => { document.title = 'Affiliates — YTGrowth' }, [])

  const [referrals, setReferrals] = useState(10)
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--ytg-border)', padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ytg-nav)', backdropFilter: 'blur(12px)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <Logo size={28} />
          <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--ytg-text)', letterSpacing: '-0.4px' }}>YTGrowth</span>
        </a>
        <a href="/" style={{ fontSize: 13, color: 'var(--ytg-text-3)', textDecoration: 'none', fontWeight: 500 }}>← Back to home</a>
      </nav>

      {/* ── SECTION 1: HERO ── */}
      <section style={{ background: 'var(--ytg-bg)', padding: '120px 40px 80px', textAlign: 'center' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
            Partner Program
          </p>
          <h1 style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.08, color: 'var(--ytg-text)', marginBottom: 22, margin: '0 0 22px' }}>
            Your audience is already buying<br />
            YouTube tools. You should be<br />
            earning from it.
          </h1>
          <p style={{ fontSize: 17, color: 'var(--ytg-text-2)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 36px' }}>
            30% recurring commission on every payment. Not just the first sale — every renewal, every month, for as long as they stay.
          </p>
          <CtaButton>Claim your affiliate link →</CtaButton>
        </div>
      </section>

      {/* ── SECTION 2: EARNINGS CALCULATOR ── */}
      <section style={{ background: 'var(--ytg-bg)', padding: '0 40px 100px' }}>
        <div style={{
          maxWidth: 700,
          margin: '0 auto',
          background: 'var(--ytg-card)',
          borderRadius: 20,
          border: '1px solid var(--ytg-border)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.09)',
          padding: 48,
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.6px', marginBottom: 6, margin: '0 0 6px' }}>
            See what you could earn
          </h2>
          <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 36 }}>
            Drag the slider to your estimated monthly referrals.
          </p>

          {/* Slider row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ytg-text-2)' }}>Referrals / month</span>
            <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--ytg-accent)', letterSpacing: '-1px', minWidth: 56, textAlign: 'right' }}>
              {referrals}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={referrals}
            onChange={e => setReferrals(Number(e.target.value))}
            style={{ width: '100%', marginTop: 14, marginBottom: 36, accentColor: 'var(--ytg-accent)', cursor: 'pointer' }}
          />

          {/* Earnings rows */}
          <div style={{ borderTop: '1px solid var(--ytg-border)' }}>
            {PLANS.map(plan => (
              <div
                key={plan.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 0',
                  borderBottom: '1px solid var(--ytg-border)',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ytg-text)' }}>{plan.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ytg-text-3)', marginTop: 2 }}>${plan.price}/mo</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ytg-accent)', letterSpacing: '-0.5px' }}>
                  {formatMoney(referrals * plan.price * 0.30)}
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, color: 'var(--ytg-text-3)', marginTop: 18 }}>
            Based on 30% of monthly plan price. Recurring — not one-off.
          </p>

          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <CtaButton style={{ display: 'block', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
              Start earning this month →
            </CtaButton>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: HOW IT WORKS ── */}
      <section style={{ padding: '100px 40px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 48, textAlign: 'center' }}>
            How it works
          </h2>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              {
                n: 1,
                title: 'Get your link',
                body: 'Sign up via Lemon Squeezy and get a unique referral link instantly.',
              },
              {
                n: 2,
                title: 'Share it',
                body: 'Drop it in your videos, newsletter, or anywhere your audience hangs out.',
              },
              {
                n: 3,
                title: 'Earn every month',
                body: 'Every renewal your referral makes, 30% comes to you — automatically.',
              },
            ].map(step => (
              <div
                key={step.n}
                style={{
                  flex: '1 1 280px',
                  background: 'var(--ytg-card)',
                  borderRadius: 16,
                  border: '1px solid var(--ytg-border)',
                  padding: 32,
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'var(--ytg-accent)', color: '#fff',
                  fontSize: 16, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  {step.n}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ytg-text)', marginBottom: 8 }}>{step.title}</div>
                <div style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>{step.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: TESTIMONIALS ── */}
      <section style={{ background: 'var(--ytg-card)', padding: '100px 40px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 48, textAlign: 'center' }}>
            What affiliates say
          </h2>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                style={{
                  flex: '1 1 280px',
                  background: 'var(--ytg-bg)',
                  borderRadius: 16,
                  border: '1px solid var(--ytg-border)',
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--ytg-accent)', lineHeight: 1, marginBottom: 12, opacity: 0.4 }}>"</div>
                <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.75, marginBottom: 24, fontWeight: 400, flex: 1 }}>
                  {t.quote}
                </p>
                <div style={{ height: 1, background: 'var(--ytg-border)', marginBottom: 16 }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ytg-text)' }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ytg-text-3)', marginTop: 2 }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: FAQ ── */}
      <section style={{ padding: '100px 40px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 32, textAlign: 'center' }}>
            Common questions
          </h2>
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              style={{
                background: 'var(--ytg-card)',
                borderRadius: 12,
                border: '1px solid var(--ytg-border)',
                marginBottom: 8,
                overflow: 'hidden',
              }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                onKeyDown={e => e.key === 'Enter' && setOpenFaq(openFaq === i ? -1 : i)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px 20px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--ytg-text)',
                }}
              >
                {item.q}
                <ChevronIcon open={openFaq === i} />
              </div>
              {openFaq === i && (
                <div style={{ padding: '0 20px 18px', fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.75 }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 6: BOTTOM CTA ── */}
      <section style={{ padding: '0 40px 120px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{
            borderRadius: 20,
            border: '1px solid var(--ytg-border)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05), 0 12px 40px rgba(0,0,0,0.08)',
            padding: '80px 40px',
            textAlign: 'center',
            background: 'var(--ytg-card)',
          }}>
            <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1.2px', marginBottom: 14 }}>
              Ready to start earning?
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ytg-text-2)', marginBottom: 36 }}>
              Free to join. No approval fee. First commission this month.
            </p>
            <CtaButton>Join the Affiliate Program →</CtaButton>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: '1px solid var(--ytg-border)', padding: '28px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Logo size={24} />
            <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--ytg-text)', letterSpacing: '-0.4px' }}>YTGrowth</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)' }}>Built for creators serious about growth.</p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <a href="/privacy" style={{ fontSize: 13, color: 'var(--ytg-text-3)', textDecoration: 'none' }}>Privacy policy</a>
            <a href="/terms" style={{ fontSize: 13, color: 'var(--ytg-text-3)', textDecoration: 'none' }}>Terms of service</a>
            <a href="/refund" style={{ fontSize: 13, color: 'var(--ytg-text-3)', textDecoration: 'none' }}>Refund policy</a>
            <a href="/affiliate" style={{ fontSize: 13, color: 'var(--ytg-text-3)', textDecoration: 'none' }}>Affiliates</a>
            <a href="/auth/login" style={{ fontSize: 13, color: 'var(--ytg-text-3)', textDecoration: 'none' }}>Log in</a>
          </div>
        </div>
      </div>

    </div>
  )
}
