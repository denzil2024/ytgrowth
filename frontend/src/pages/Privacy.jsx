import { useEffect } from 'react'

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

export default function Privacy() {
  useGlobalStyles()
  useEffect(() => { document.title = 'Privacy Policy — YTGrowth' }, [])

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', minHeight: '100vh' }}>

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--ytg-border)', padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ytg-nav)', backdropFilter: 'blur(12px)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <Logo size={28} />
          <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--ytg-text)', letterSpacing: '-0.4px' }}>YTGrowth</span>
        </a>
        <a href="/" style={{ fontSize: 13, color: 'var(--ytg-text-3)', textDecoration: 'none', fontWeight: 500 }}>← Back to home</a>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 100px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontWeight: 800, fontSize: 38, letterSpacing: '-1.2px', color: 'var(--ytg-text)', marginBottom: 8, lineHeight: 1.1 }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', marginBottom: 48 }}>Last updated: April 10, 2026</p>

        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>
          YTGrowth is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights over it.
        </p>

        <div style={{ height: 1, background: 'var(--ytg-border)', margin: '40px 0' }} />

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>1. Data We Collect</h2>
        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 12 }}>When you connect your Google account we receive:</p>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          {[
            'Google account email address — used to identify your account.',
            'YouTube channel data — channel name, subscriber count, video list, view counts, and public metadata via the YouTube Data API.',
            'YouTube Analytics data — impressions, CTR, watch time, and traffic source data via the YouTube Analytics API.',
            'OAuth credentials — access and refresh tokens required to fetch your data. Stored encrypted in our database.',
            'Usage data — which tools you run, token consumption, and timestamps.',
            'Payment data — handled entirely by Paddle. We only receive your plan type and Paddle customer ID. We never store card details.',
          ].map((item, i) => (
            <li key={i} style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 8 }}>{item}</li>
          ))}
        </ul>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>2. How We Use Your Data</h2>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          {[
            'To provide AI-powered analysis of your YouTube channel.',
            'To enforce token limits and billing entitlements.',
            'To send transactional emails (billing receipts, usage warnings). No marketing emails without consent.',
            'To improve our AI using aggregated, anonymised patterns only — never your personal channel data.',
          ].map((item, i) => (
            <li key={i} style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 8 }}>{item}</li>
          ))}
        </ul>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>3. Third-Party Services</h2>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          {[
            'Google / YouTube APIs — subject to Google\'s Privacy Policy and YouTube\'s Terms of Service.',
            'Paddle — our payment processor and Merchant of Record. Handles all payment data under their own privacy policy.',
            'Anthropic (Claude API) — we send anonymised channel data to generate AI insights. No personally identifiable information is included.',
          ].map((item, i) => (
            <li key={i} style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 8 }}>{item}</li>
          ))}
        </ul>
        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>We do not sell your data to any third party, ever.</p>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>4. Google API Limited Use Disclosure</h2>
        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>YTGrowth's use and transfer of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" style={{ color: 'var(--ytg-accent-text)' }}>Google API Services User Data Policy</a>, including the Limited Use requirements. We only access scopes required to provide the Service and do not use your Google data to serve advertising or for any purpose beyond delivering the features described in this policy.</p>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>4a. OAuth Scopes We Request</h2>
        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 12 }}>When you sign in with Google, YTGrowth requests the following OAuth scopes. We request only what is necessary to provide the Service:</p>
        <div style={{ overflowX: 'auto', marginBottom: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ytg-border)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--ytg-text)', fontWeight: 700 }}>Scope</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--ytg-text)', fontWeight: 700 }}>Why we need it</th>
              </tr>
            </thead>
            <tbody>
              {[
                { scope: 'openid', reason: 'Confirms your identity via Google Sign-In.' },
                { scope: 'https://www.googleapis.com/auth/userinfo.email', reason: 'Retrieves your email address to create and identify your YTGrowth account.' },
                { scope: 'https://www.googleapis.com/auth/userinfo.profile', reason: 'Retrieves your name and profile picture to personalise your dashboard.' },
                { scope: 'https://www.googleapis.com/auth/youtube', reason: 'Reads your YouTube channel data (videos, titles, descriptions, thumbnails) and allows updating video metadata (title, description, tags) when you use the SEO Studio editor.' },
                { scope: 'https://www.googleapis.com/auth/yt-analytics.readonly', reason: 'Reads YouTube Analytics data (impressions, CTR, watch time, traffic sources) to power the growth insights on your dashboard. Read-only — we never modify analytics data.' },
              ].map(({ scope, reason }, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--ytg-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(10,10,15,0.02)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--ytg-text)', fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all', verticalAlign: 'top' }}>{scope}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--ytg-text-2)', fontSize: 15, lineHeight: 1.6, verticalAlign: 'top' }}>{reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>You can revoke any of these permissions at any time via <a href="https://myaccount.google.com/permissions" style={{ color: 'var(--ytg-accent-text)' }}>Google Account Permissions</a>. Revoking access will disconnect your YouTube channel from YTGrowth.</p>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>5. Data Security &amp; Protection Mechanisms</h2>
        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 12 }}>We take the following technical and organisational measures to protect your data, including sensitive information such as OAuth tokens and YouTube Analytics data:</p>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          {[
            'Encryption in transit — all data transmitted between your browser, our servers, and third-party APIs is encrypted via TLS 1.2 or higher (HTTPS).',
            'Encryption at rest — OAuth access tokens and refresh tokens are encrypted at rest in our database using AES-256 encryption. They are never stored or logged in plain text.',
            'Minimal data retention — we store only the data required to operate the Service. YouTube Analytics data is fetched on-demand and not persisted beyond your session.',
            'Access controls — access to the production database is restricted to authorised personnel only, using role-based access controls and strong authentication.',
            'No third-party data sharing — your YouTube and analytics data is never sold, rented, or shared with third parties for advertising or any non-essential purpose.',
            'Anthropic (Claude API) — when generating AI insights, only anonymised channel metrics are sent. No personally identifiable information, OAuth tokens, or raw Analytics data is included in AI prompts.',
            'Incident response — in the event of a data breach affecting your personal data, we will notify affected users in accordance with applicable data protection laws.',
          ].map((item, i) => (
            <li key={i} style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 8 }}>{item}</li>
          ))}
        </ul>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>6. Your Rights</h2>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          {[
            'Access the personal data we hold about you.',
            'Request correction of inaccurate data.',
            'Request deletion of your data (right to be forgotten).',
            'Revoke Google OAuth access at any time via your Google account settings.',
          ].map((item, i) => (
            <li key={i} style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 8 }}>{item}</li>
          ))}
        </ul>
        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>To exercise any of these rights, email <strong>support@ytgrowth.io</strong>.</p>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>7. Cookies</h2>
        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>We use a single session cookie (<code>ytg_session</code>) to keep you logged in. We do not use advertising or tracking cookies.</p>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>8. Contact</h2>
        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>Privacy questions? Email <strong>support@ytgrowth.io</strong>.</p>

      </div>

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
