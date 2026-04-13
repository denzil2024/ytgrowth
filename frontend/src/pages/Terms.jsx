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
        --ytg-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 6px 28px rgba(0,0,0,0.11);
      }
    `
    document.head.appendChild(style)
  }, [])
}

export default function Terms() {
  useGlobalStyles()
  useEffect(() => { document.title = 'Terms of Service — YTGrowth' }, [])

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--ytg-border)', padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ytg-nav)', backdropFilter: 'blur(12px)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <Logo size={28} />
          <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--ytg-text)', letterSpacing: '-0.4px' }}>YTGrowth</span>
        </a>
        <a href="/" style={{ fontSize: 13, color: 'var(--ytg-text-3)', textDecoration: 'none', fontWeight: 500 }}>← Back to home</a>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 100px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontWeight: 800, fontSize: 38, letterSpacing: '-1.2px', color: 'var(--ytg-text)', marginBottom: 8, lineHeight: 1.1 }}>Terms of Service</h1>
        <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', marginBottom: 48 }}>Last updated: April 11, 2026</p>

        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>
          These Terms of Service ("Terms") govern your access to and use of YTGrowth ("Service"). By creating an account or using the Service, you agree to be bound by these Terms.
        </p>

        <div style={{ height: 1, background: 'var(--ytg-border)', margin: '40px 0' }} />

        {[
          { t: '1. The Service', b: 'YTGrowth is an AI-powered YouTube channel analysis platform providing channel insights, competitor analysis, SEO optimization, keyword research, and video optimization tools. Each use of a tool consumes one token from your account balance.' },
          { t: '2. Accounts & Eligibility', b: 'You must be at least 13 years old to use the Service. By connecting your Google account, you authorize us to access your YouTube channel data and analytics as permitted by the scopes you approve. You are responsible for maintaining the security of your account.' },
        ].map(({ t, b }) => (
          <div key={t}>
            <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>{t}</h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>{b}</p>
          </div>
        ))}

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>3. Tokens & Usage</h2>
        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 12 }}>Access to AI-powered tools is metered by tokens. One token equals one analysis run.</p>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          {[
            'Free plan: 5 tokens on signup, no monthly refill, no credit card required.',
            'Subscriptions (Solo, Growth, Agency): tokens reset each billing period. Unused tokens do not roll over.',
            'Lifetime plans: monthly token allocation renews every calendar month, forever.',
            'Analysis Packs: one-time token purchases that never expire and stack with any plan.',
          ].map((item, i) => (
            <li key={i} style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 8 }}>{item}</li>
          ))}
        </ul>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>4. Payments & Billing</h2>
        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>Payments are processed by Paddle, our authorised reseller and Merchant of Record. All prices are in USD. Subscription plans are billed monthly or annually in advance.</p>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>5. Refunds & Cancellations</h2>
        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>Refund requests submitted within 14 days of purchase will be honoured. Because YTGrowth provides a free plan with 5 analyses before any payment is required, by the time you upgrade you have already used the product and know exactly what you are paying for. Paddle, as our Merchant of Record, also reserves the right to issue refunds at their discretion to prevent chargebacks. Full details at <a href="/refund" style={{ color: 'var(--ytg-accent)' }}>ytgrowth.io/refund</a>.</p>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>6. Acceptable Use</h2>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          {[
            'Do not analyse channels you do not own or have explicit authorization to manage.',
            'Do not attempt to circumvent token limits or account restrictions.',
            'Do not use automated scripts to trigger analyses in bulk.',
          ].map((item, i) => (
            <li key={i} style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 8 }}>{item}</li>
          ))}
        </ul>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>7. Disclaimers</h2>
        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>The Service is provided "as is". AI-generated insights are for informational purposes only. We do not guarantee specific growth outcomes. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.</p>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>8. Contact</h2>
        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>Questions? Email <strong>support@ytgrowth.io</strong>.</p>

      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--ytg-border)', padding: '28px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Logo size={24} />
            <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--ytg-text)', letterSpacing: '-0.4px' }}>YTGrowth</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)' }}>Built for creators serious about growth.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="/privacy" style={{ fontSize: 13, color: 'var(--ytg-text-3)', textDecoration: 'none' }}>Privacy policy</a>
            <a href="/terms" style={{ fontSize: 13, color: 'var(--ytg-text-3)', textDecoration: 'none' }}>Terms of service</a>
            <a href="/refund" style={{ fontSize: 13, color: 'var(--ytg-text-3)', textDecoration: 'none' }}>Refund policy</a>
            <a href="/auth/login" style={{ fontSize: 13, color: 'var(--ytg-text-3)', textDecoration: 'none' }}>Log in</a>
          </div>
        </div>
      </div>

    </div>
  )
}
