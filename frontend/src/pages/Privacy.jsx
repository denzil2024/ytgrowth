import { useEffect } from 'react'
import { Link } from 'react-router-dom'

function injectStyles() {
  if (document.getElementById('ytg-legal-font')) return
  const link = document.createElement('link')
  link.id = 'ytg-legal-font'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap'
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

export default function Privacy() {
  useEffect(() => { injectStyles(); document.title = 'Privacy Policy — YTGrowth' }, [])

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/" style={s.logo}>YTGrowth</a>
        <Link to="/" style={s.back}>← Back to home</Link>
      </nav>

      <div style={s.wrap}>
        <h1 style={s.h1}>Privacy Policy</h1>
        <p style={s.meta}>Last updated: April 3, 2025 &nbsp;·&nbsp; Effective immediately</p>

        <p style={s.p}>
          YTGrowth ("we", "us", "our") is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights over it. By using YTGrowth you agree to the practices described here.
        </p>

        <div style={s.divider} />

        <h2 style={s.h2}>1. Data We Collect</h2>
        <p style={s.p}>When you connect your Google account we receive:</p>
        <ul style={s.ul}>
          <li style={s.li}><strong>Google account email address</strong> — used to identify your account.</li>
          <li style={s.li}><strong>YouTube channel data</strong> — channel name, subscriber count, video list, view counts, and public metadata, accessed via the YouTube Data API.</li>
          <li style={s.li}><strong>YouTube Analytics data</strong> — impressions, click-through rate, watch time, and traffic source data, accessed via the YouTube Analytics API.</li>
          <li style={s.li}><strong>OAuth credentials</strong> — access and refresh tokens required to fetch your data. These are stored encrypted in our database.</li>
        </ul>
        <p style={s.p}>We also collect:</p>
        <ul style={s.ul}>
          <li style={s.li}><strong>Usage data</strong> — which tools you run, token consumption, and timestamps. Used to enforce plan limits and improve the Service.</li>
          <li style={s.li}><strong>Payment data</strong> — handled entirely by Paddle. We receive only your plan type, subscription status, and Paddle customer ID. We never see or store your card details.</li>
        </ul>

        <h2 style={s.h2}>2. How We Use Your Data</h2>
        <ul style={s.ul}>
          <li style={s.li}>To provide AI-powered analysis of your YouTube channel.</li>
          <li style={s.li}>To enforce token limits and billing entitlements.</li>
          <li style={s.li}>To send transactional emails (e.g. billing receipts, usage warnings). We do not send marketing emails without your explicit consent.</li>
          <li style={s.li}>To improve the accuracy and relevance of our AI models (using aggregated, anonymised patterns only — never your personal channel data).</li>
        </ul>

        <h2 style={s.h2}>3. Data Storage & Security</h2>
        <p style={s.p}>Your data is stored on servers hosted by our cloud provider. OAuth credentials are encrypted at rest. We use industry-standard TLS for all data in transit. We retain your session and channel data for as long as your account is active. You can delete your account and all associated data at any time by emailing <strong>support@ytgrowth.io</strong>.</p>

        <h2 style={s.h2}>4. Third-Party Services</h2>
        <ul style={s.ul}>
          <li style={s.li}><strong>Google / YouTube APIs</strong> — governs access to your channel and analytics data. Subject to Google's Privacy Policy and YouTube's Terms of Service.</li>
          <li style={s.li}><strong>Paddle</strong> — our payment processor and Merchant of Record. Handles all payment data under their own privacy policy.</li>
          <li style={s.li}><strong>Anthropic (Claude API)</strong> — we send anonymised channel data to Anthropic's API to generate AI insights. No personally identifiable information is included in these requests.</li>
        </ul>
        <p style={s.p}>We do not sell your data to any third party, ever.</p>

        <h2 style={s.h2}>5. Google API Limited Use Disclosure</h2>
        <p style={s.p}>YTGrowth's use and transfer of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#e5302a' }}>Google API Services User Data Policy</a>, including the Limited Use requirements. We only access the scopes required to provide the Service, and we do not use your Google data to serve advertising.</p>

        <h2 style={s.h2}>6. Your Rights</h2>
        <p style={s.p}>Depending on your location, you may have the right to:</p>
        <ul style={s.ul}>
          <li style={s.li}>Access the personal data we hold about you.</li>
          <li style={s.li}>Request correction of inaccurate data.</li>
          <li style={s.li}>Request deletion of your data ("right to be forgotten").</li>
          <li style={s.li}>Revoke Google OAuth access at any time via your Google account settings.</li>
        </ul>
        <p style={s.p}>To exercise any of these rights, email <strong>support@ytgrowth.io</strong>.</p>

        <h2 style={s.h2}>7. Cookies</h2>
        <p style={s.p}>We use a single session cookie (<code>ytg_session</code>) to keep you logged in. We do not use advertising or tracking cookies.</p>

        <h2 style={s.h2}>8. Changes to This Policy</h2>
        <p style={s.p}>We may update this policy. Material changes will be communicated via email or in-app notice. Continued use of the Service after the effective date constitutes acceptance.</p>

        <h2 style={s.h2}>9. Contact</h2>
        <p style={s.p}>Privacy questions? Email <strong>support@ytgrowth.io</strong>.</p>

        <div style={s.divider} />
        <p style={{ ...s.p, fontSize: 13 }}>
          <Link to="/terms" style={{ color: '#e5302a', textDecoration: 'none', marginRight: 20 }}>Terms of Service</Link>
          <Link to="/refund" style={{ color: '#e5302a', textDecoration: 'none' }}>Refund Policy</Link>
        </p>
      </div>
    </div>
  )
}
