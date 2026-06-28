import { useEffect, useState } from 'react'
import LandingFooter from '../components/LandingFooter'
import BrandLockup from '../components/BrandLockup'

function Logo() {
  return <BrandLockup height={24} />
}

function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-styles')) return

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

function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return { isMobile: width <= 768 }
}

export default function Terms() {
  useGlobalStyles()
  useEffect(() => { document.title = 'Terms of Service, YTGrowth' }, [])
  const { isMobile } = useBreakpoint()

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--ytg-border)', padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ytg-nav)', backdropFilter: 'blur(12px)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <Logo size={26} />
        </a>
        <a href="/" style={{ fontSize: 14, color: 'var(--ytg-text-3)', textDecoration: 'none', fontWeight: 500 }}>← Back to home</a>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 100px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontWeight: 800, fontSize: 38, letterSpacing: '-1.2px', color: 'var(--ytg-text)', marginBottom: 8, lineHeight: 1.1 }}>Terms of Service</h1>
        <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 48 }}>Last updated: April 11, 2026</p>

        <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>
          These Terms of Service ("Terms") govern your access to and use of YTGrowth ("Service"). By creating an account or using the Service, you agree to be bound by these Terms.
        </p>

        <div style={{ height: 1, background: 'var(--ytg-border)', margin: '40px 0' }} />

        {[
          { t: '1. The Service', b: 'YTGrowth is an AI-powered YouTube channel analysis platform providing channel insights, competitor analysis, SEO optimization, keyword research, and video optimization tools. Each use of a tool consumes one token from your account balance.' },
          { t: '2. Accounts & Eligibility', b: 'You must be at least 13 years old to use the Service. By connecting your Google account, you authorize us to access your YouTube channel data and analytics as permitted by the scopes you approve. You are responsible for maintaining the security of your account.' },
        ].map(({ t, b }) => (
          <div key={t}>
            <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>{t}</h2>
            <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>{b}</p>
          </div>
        ))}

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>3. Tokens & Usage</h2>
        <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 12 }}>Access to AI-powered tools is metered by tokens. One token equals one analysis run.</p>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          {[
            'Free plan: a one-time trial of analysis credits, no monthly refill, no credit card required.',
            'Subscriptions (Solo, Growth, Agency): tokens reset each billing period. Unused tokens do not roll over.',
            'Lifetime plans: monthly token allocation renews every calendar month, forever.',
            'Analysis Packs: one-time token purchases that never expire and stack with any plan.',
          ].map((item, i) => (
            <li key={i} style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 8 }}>{item}</li>
          ))}
        </ul>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>4. Payments & Billing</h2>
        <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>Payments are processed by Paddle, our authorised reseller and Merchant of Record. All prices are in USD. Subscription plans are billed monthly or annually in advance.</p>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>5. Refunds & Cancellations</h2>
        <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>Refund requests submitted within 14 days of purchase will be honoured. Because YTGrowth provides a free trial before any payment is required, by the time you upgrade you have already used the product and know exactly what you are paying for. Paddle, as our Merchant of Record, also reserves the right to issue refunds at their discretion to prevent chargebacks. Full details at <a href="/refund" style={{ color: 'var(--ytg-accent)' }}>ytgrowth.io/refund</a>.</p>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>6. Acceptable Use</h2>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          {[
            'Do not analyse channels you do not own or have explicit authorization to manage.',
            'Do not attempt to circumvent token limits or account restrictions.',
            'Do not use automated scripts to trigger analyses in bulk.',
          ].map((item, i) => (
            <li key={i} style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 8 }}>{item}</li>
          ))}
        </ul>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>7. Disclaimers</h2>
        <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>The Service is provided "as is". AI-generated insights are for informational purposes only. We do not guarantee specific growth outcomes. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.</p>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>8. Contact</h2>
        <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>Questions? Email <strong>support@ytgrowth.io</strong>.</p>

      </div>

      {/* Footer */}
      <LandingFooter />

    </div>
  )
}
