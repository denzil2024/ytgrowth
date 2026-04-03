import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const FONT_URL = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap'

function injectStyles() {
  if (document.getElementById('ytg-legal-font')) return
  const link = document.createElement('link')
  link.id = 'ytg-legal-font'
  link.rel = 'stylesheet'
  link.href = FONT_URL
  document.head.appendChild(link)
}

const s = {
  page: { fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f4f4f6', color: '#0a0a0f', minHeight: '100vh' },
  nav: { borderBottom: '1px solid rgba(10,10,15,0.1)', padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' },
  logo: { fontWeight: 800, fontSize: 18, color: '#0a0a0f', textDecoration: 'none', letterSpacing: '-0.5px' },
  back: { fontSize: 13, color: 'rgba(10,10,15,0.5)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 },
  wrap: { maxWidth: 760, margin: '0 auto', padding: '60px 24px 100px' },
  h1: { fontWeight: 800, fontSize: 38, letterSpacing: '-1.2px', color: '#0a0a0f', marginBottom: 8 },
  meta: { fontSize: 13, color: 'rgba(10,10,15,0.45)', marginBottom: 48 },
  h2: { fontWeight: 700, fontSize: 18, color: '#0a0a0f', marginTop: 40, marginBottom: 12, letterSpacing: '-0.3px' },
  p: { fontSize: 15, color: 'rgba(10,10,15,0.7)', lineHeight: 1.8, marginBottom: 16 },
  li: { fontSize: 15, color: 'rgba(10,10,15,0.7)', lineHeight: 1.8, marginBottom: 8 },
  ul: { paddingLeft: 20, marginBottom: 16 },
  divider: { height: 1, background: 'rgba(10,10,15,0.08)', margin: '48px 0' },
}

export default function Terms() {
  useEffect(() => { injectStyles(); document.title = 'Terms of Service — YTGrowth' }, [])

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/" style={s.logo}>YTGrowth</a>
        <Link to="/" style={s.back}>← Back to home</Link>
      </nav>

      <div style={s.wrap}>
        <h1 style={s.h1}>Terms of Service</h1>
        <p style={s.meta}>Last updated: April 3, 2025 &nbsp;·&nbsp; Effective immediately</p>

        <p style={s.p}>
          These Terms of Service ("Terms") govern your access to and use of YTGrowth ("Service"), operated by YTGrowth ("we", "us", or "our"). By creating an account or using the Service, you agree to be bound by these Terms.
        </p>

        <div style={s.divider} />

        <h2 style={s.h2}>1. The Service</h2>
        <p style={s.p}>
          YTGrowth is an AI-powered YouTube channel analysis platform. The Service provides channel insights, competitor analysis, SEO optimization, keyword research, and video optimization tools ("Tools"). Each use of a Tool consumes one token from your account balance.
        </p>

        <h2 style={s.h2}>2. Accounts & Eligibility</h2>
        <p style={s.p}>You must be at least 13 years old to use the Service. By connecting your Google account, you authorize us to access your YouTube channel data and analytics as permitted by the scopes you approve. You are responsible for maintaining the security of your account.</p>

        <h2 style={s.h2}>3. Tokens & Usage</h2>
        <p style={s.p}>Access to AI-powered Tools is metered by tokens. One token equals one analysis run across any of the five Tools.</p>
        <ul style={s.ul}>
          <li style={s.li}><strong>Free plan:</strong> 5 tokens granted on signup, no monthly refill, no credit card required.</li>
          <li style={s.li}><strong>Subscription plans (Solo, Growth, Agency):</strong> tokens reset at the start of each billing period. Unused monthly tokens do not roll over.</li>
          <li style={s.li}><strong>Lifetime plans:</strong> monthly token allocation renews every calendar month, forever, as long as the Service operates.</li>
          <li style={s.li}><strong>Analysis Packs:</strong> one-time token purchases that never expire and stack with any plan.</li>
        </ul>
        <p style={s.p}>We reserve the right to throttle or suspend accounts that exhibit abusive usage patterns (e.g. automated bulk requests).</p>

        <h2 style={s.h2}>4. Payments & Billing</h2>
        <p style={s.p}>Payments are processed by Paddle, our authorised reseller and Merchant of Record. By purchasing a plan or pack, you agree to Paddle's terms of service and privacy policy in addition to these Terms. All prices are in USD and inclusive of applicable taxes where Paddle is required to collect them.</p>
        <ul style={s.ul}>
          <li style={s.li}>Subscription plans are billed monthly or annually in advance.</li>
          <li style={s.li}>Annual plans are non-refundable except as described in Section 5.</li>
          <li style={s.li}>One-time purchases (Lifetime plans, Founder Bundles, Analysis Packs) are non-refundable after 14 days, or once more than 10% of the included tokens have been used.</li>
        </ul>

        <h2 style={s.h2}>5. Refunds & Cancellations</h2>
        <p style={s.p}>Monthly subscriptions may be cancelled at any time. Cancellation takes effect at the end of the current billing period — you retain access and your token balance until then. We do not issue pro-rated refunds for monthly plans.</p>
        <p style={s.p}>For annual plans, we offer a full refund within 14 days of purchase if fewer than 10% of monthly tokens for the period have been used. After 14 days, no refund is issued but you retain access for the remainder of the year.</p>
        <p style={s.p}>If we shut down the Service permanently, Lifetime plan holders will receive a pro-rated refund calculated against a 5-year expected lifespan from date of purchase.</p>
        <p style={s.p}>To request a refund, email <strong>support@ytgrowth.io</strong>.</p>

        <h2 style={s.h2}>6. Intellectual Property</h2>
        <p style={s.p}>YTGrowth and its content (excluding your YouTube data) are owned by us and protected by applicable intellectual property laws. You may not copy, resell, or reverse-engineer any part of the Service. AI-generated outputs are provided for your personal or business use — you own the outputs you generate.</p>

        <h2 style={s.h2}>7. Acceptable Use</h2>
        <p style={s.p}>You agree not to:</p>
        <ul style={s.ul}>
          <li style={s.li}>Use the Service to analyse channels you do not own or have explicit authorization to manage.</li>
          <li style={s.li}>Attempt to circumvent token limits or account restrictions.</li>
          <li style={s.li}>Share account credentials with third parties outside of legitimate agency use.</li>
          <li style={s.li}>Use automated scripts to trigger analyses in bulk.</li>
        </ul>

        <h2 style={s.h2}>8. Disclaimers</h2>
        <p style={s.p}>The Service is provided "as is". AI-generated insights are for informational purposes only and do not constitute professional advice. We do not guarantee any specific growth outcomes from using YTGrowth. YouTube's API policies and data availability may affect the quality of analyses.</p>

        <h2 style={s.h2}>9. Limitation of Liability</h2>
        <p style={s.p}>To the fullest extent permitted by law, YTGrowth shall not be liable for indirect, incidental, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.</p>

        <h2 style={s.h2}>10. Changes to These Terms</h2>
        <p style={s.p}>We may update these Terms from time to time. We will notify you of material changes via email or an in-app notice. Continued use of the Service after the effective date constitutes acceptance of the revised Terms.</p>

        <h2 style={s.h2}>11. Governing Law</h2>
        <p style={s.p}>These Terms are governed by the laws of the jurisdiction in which YTGrowth is incorporated. Any disputes shall be resolved by binding arbitration or in the courts of that jurisdiction.</p>

        <h2 style={s.h2}>12. Contact</h2>
        <p style={s.p}>Questions about these Terms? Email us at <strong>support@ytgrowth.io</strong>.</p>

        <div style={s.divider} />
        <p style={{ ...s.p, fontSize: 13 }}>
          <Link to="/privacy" style={{ color: '#e5302a', textDecoration: 'none', marginRight: 20 }}>Privacy Policy</Link>
          <Link to="/refund" style={{ color: '#e5302a', textDecoration: 'none' }}>Refund Policy</Link>
        </p>
      </div>
    </div>
  )
}
