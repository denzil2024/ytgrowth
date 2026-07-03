import { useEffect, useState } from 'react'
import LandingFooter from '../components/LandingFooter'
import SiteHeader from '../components/SiteHeader'
import { useProseStyles } from '../blog/proseStyles.jsx'

/* Terms of Service. Styled as a single blog post (the .bp-prose editorial
   system). All legal content preserved verbatim. */

const SANS = "'Barlow', system-ui, sans-serif"

function useBreakpoint() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return { isMobile: w <= 768 }
}

export default function Terms() {
  useProseStyles()
  useEffect(() => { document.title = 'Terms of Service, YTGrowth' }, [])
  const { isMobile } = useBreakpoint()

  return (
    <div style={{ background: 'var(--yte-bg)', minHeight: '100vh', fontFamily: SANS, color: 'var(--yte-ink)' }}>

      <SiteHeader />

      {/* Header, left-aligned to match the prose column */}
      <section className="bp-section-pad" style={{ padding: isMobile ? '32px 22px 0' : '72px 48px 0', textAlign: 'left', background: 'var(--yte-bg)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', animation: 'bpFadeUp 0.5s ease both' }}>
          <span className="bp-eyebrow">
            <span aria-hidden="true" className="bp-eyebrow-rule" />
            <span className="bp-eyebrow-text">Legal</span>
          </span>
          <h1 className="bp-h1" style={{ fontSize: isMobile ? 32 : 48, letterSpacing: '-0.4px' }}>Terms of Service</h1>
          <p className="bp-byline-meta" style={{ marginTop: 18 }}>Last updated April 11, 2026</p>
        </div>
      </section>

      {/* Body */}
      <section className="bp-section-pad" style={{ padding: isMobile ? '36px 22px 64px' : '64px 48px 96px', background: 'var(--yte-bg)' }}>
        <article className="bp-prose">
          <p>These Terms of Service ("Terms") govern your access to and use of YTGrowth ("Service"). By creating an account or using the Service, you agree to be bound by these Terms.</p>

          <hr />

          <h2>1. The Service</h2>
          <p>YTGrowth is an AI-powered YouTube channel analysis platform providing channel insights, competitor analysis, SEO optimization, keyword research, and video optimization tools. Each use of a tool consumes one token from your account balance.</p>
          <p>YTGrowth uses YouTube API Services. By accessing or using the Service, you also agree to be bound by the <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer">YouTube Terms of Service</a>. Your use of any YouTube data through the Service is subject to those terms and to the <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google Privacy Policy</a>.</p>

          <h2>2. Accounts &amp; Eligibility</h2>
          <p>You must be at least 13 years old to use the Service. By connecting your Google account, you authorize us to access your YouTube channel data and analytics as permitted by the scopes you approve. You are responsible for maintaining the security of your account.</p>

          <h2>3. Tokens &amp; Usage</h2>
          <p>Access to AI-powered tools is metered by tokens. One token equals one analysis run.</p>
          <ul>
            <li>Free plan: a one-time trial of analysis credits, no monthly refill, no credit card required.</li>
            <li>Subscriptions (Solo, Growth, Agency): tokens reset each billing period. Unused tokens do not roll over.</li>
            <li>Lifetime plans: monthly token allocation renews every calendar month, forever.</li>
            <li>Analysis Packs: one-time token purchases that never expire and stack with any plan.</li>
          </ul>

          <h2>4. Payments &amp; Billing</h2>
          <p>Payments are processed by Paddle, our authorised reseller and Merchant of Record. All prices are in USD. Subscription plans are billed monthly or annually in advance.</p>

          <h2>5. Refunds &amp; Cancellations</h2>
          <p>Refund requests submitted within 14 days of purchase will be honoured. Because YTGrowth provides a free trial before any payment is required, by the time you upgrade you have already used the product and know exactly what you are paying for. Paddle, as our Merchant of Record, also reserves the right to issue refunds at their discretion to prevent chargebacks. Full details at <a href="/refund">ytgrowth.io/refund</a>.</p>

          <h2>6. Acceptable Use</h2>
          <ul>
            <li>Do not analyse channels you do not own or have explicit authorization to manage.</li>
            <li>Do not attempt to circumvent token limits or account restrictions.</li>
            <li>Do not use automated scripts to trigger analyses in bulk.</li>
          </ul>

          <h2>7. Disclaimers</h2>
          <p>The Service is provided "as is". AI-generated insights are for informational purposes only. We do not guarantee specific growth outcomes. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.</p>

          <h2>8. Contact</h2>
          <p>Questions? Email <strong>support@ytgrowth.io</strong>.</p>
        </article>
      </section>

      <LandingFooter />

    </div>
  )
}
