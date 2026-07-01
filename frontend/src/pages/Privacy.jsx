import { useEffect, useState } from 'react'
import LandingFooter from '../components/LandingFooter'
import SiteHeader from '../components/SiteHeader'
import { useProseStyles } from '../blog/proseStyles.jsx'

/* Privacy Policy. Styled as a single blog post (the .bp-prose editorial
   system: Fraunces serif headings, Barlow body, warm paper, sharp flat
   cards, accent links). All legal content preserved verbatim. */

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

export default function Privacy() {
  useProseStyles()
  useEffect(() => { document.title = 'Privacy Policy, YTGrowth' }, [])
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
          <h1 className="bp-h1" style={{ fontSize: isMobile ? 32 : 48, letterSpacing: '-0.4px' }}>Privacy Policy</h1>
          <p className="bp-byline-meta" style={{ marginTop: 18 }}>Last updated April 10, 2026</p>
        </div>
      </section>

      {/* Body */}
      <section className="bp-section-pad" style={{ padding: isMobile ? '36px 22px 64px' : '64px 48px 96px', background: 'var(--yte-bg)' }}>
        <article className="bp-prose">
          <p>YTGrowth is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights over it.</p>

          <hr />

          <h2>1. Data We Collect</h2>
          <p>When you connect your Google account we receive:</p>
          <ul>
            <li>Google account email address, used to identify your account.</li>
            <li>YouTube channel data, channel name, subscriber count, video list, view counts, and public metadata via the YouTube Data API.</li>
            <li>YouTube Analytics data, impressions, CTR, watch time, and traffic source data via the YouTube Analytics API.</li>
            <li>OAuth credentials, access and refresh tokens required to fetch your data. Stored encrypted in our database.</li>
            <li>Usage data, which tools you run, token consumption, and timestamps.</li>
            <li>Payment data, handled entirely by Paddle. We only receive your plan type and Paddle customer ID. We never store card details.</li>
          </ul>

          <h2>2. How We Use Your Data</h2>
          <ul>
            <li>To provide AI-powered analysis of your YouTube channel.</li>
            <li>To enforce token limits and billing entitlements.</li>
            <li>To send transactional emails (billing receipts, usage warnings). No marketing emails without consent.</li>
            <li>To improve our AI using aggregated, anonymised patterns only, never your personal channel data.</li>
          </ul>

          <h2>3. Third-Party Services</h2>
          <ul>
            <li>Google / YouTube APIs, subject to Google's Privacy Policy and YouTube's Terms of Service.</li>
            <li>Paddle, our payment processor and Merchant of Record. Handles all payment data under their own privacy policy.</li>
            <li>Anthropic (Claude API), we send anonymised channel data to generate AI insights. No personally identifiable information is included.</li>
          </ul>
          <p>We do not sell your data to any third party, ever.</p>

          <h2>4. Google API Limited Use Disclosure</h2>
          <p>YTGrowth's use and transfer of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements. We only access scopes required to provide the Service and do not use your Google data to serve advertising or for any purpose beyond delivering the features described in this policy.</p>

          <h2>4a. OAuth Scopes We Request</h2>
          <p>When you sign in with Google, YTGrowth requests the following OAuth scopes. We request only what is necessary to provide the Service:</p>
          <table>
            <thead>
              <tr>
                <th>Scope</th>
                <th>Why we need it</th>
              </tr>
            </thead>
            <tbody>
              {[
                { scope: 'openid', reason: 'Confirms your identity via Google Sign-In.' },
                { scope: 'https://www.googleapis.com/auth/userinfo.email', reason: 'Retrieves your email address to create and identify your YTGrowth account.' },
                { scope: 'https://www.googleapis.com/auth/userinfo.profile', reason: 'Retrieves your name and profile picture to personalise your dashboard.' },
                { scope: 'https://www.googleapis.com/auth/youtube', reason: 'Reads your YouTube channel data (videos, titles, descriptions, thumbnails) and allows updating video metadata (title, description, tags) when you use the SEO Studio editor.' },
                { scope: 'https://www.googleapis.com/auth/yt-analytics.readonly', reason: 'Reads YouTube Analytics data (impressions, CTR, watch time, traffic sources) to power the growth insights on your dashboard. Read-only, we never modify analytics data.' },
              ].map(({ scope, reason }, i) => (
                <tr key={i}>
                  <td><code style={{ wordBreak: 'break-all' }}>{scope}</code></td>
                  <td>{reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>You can revoke any of these permissions at any time via <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">Google Account Permissions</a>. Revoking access will disconnect your YouTube channel from YTGrowth.</p>

          <h2>5. Data Security &amp; Protection Mechanisms</h2>
          <p>We take the following technical and organisational measures to protect your data, including sensitive information such as OAuth tokens and YouTube Analytics data:</p>
          <ul>
            <li>Encryption in transit, all data transmitted between your browser, our servers, and third-party APIs is encrypted via TLS 1.2 or higher (HTTPS).</li>
            <li>Encryption at rest, OAuth access tokens and refresh tokens are encrypted at rest in our database using AES-256 encryption. They are never stored or logged in plain text.</li>
            <li>Minimal data retention, we store only the data required to operate the Service. YouTube Analytics data is fetched on-demand and not persisted beyond your session.</li>
            <li>Access controls, access to the production database is restricted to authorised personnel only, using role-based access controls and strong authentication.</li>
            <li>No third-party data sharing, your YouTube and analytics data is never sold, rented, or shared with third parties for advertising or any non-essential purpose.</li>
            <li>Anthropic (Claude API), when generating AI insights, only anonymised channel metrics are sent. No personally identifiable information, OAuth tokens, or raw Analytics data is included in AI prompts.</li>
            <li>Incident response, in the event of a data breach affecting your personal data, we will notify affected users in accordance with applicable data protection laws.</li>
          </ul>

          <h2>6. Your Rights</h2>
          <ul>
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data (right to be forgotten).</li>
            <li>Revoke Google OAuth access at any time via your Google account settings.</li>
          </ul>
          <p>To exercise any of these rights, email <strong>support@ytgrowth.io</strong>.</p>

          <h2>7. Cookies</h2>
          <p>We use a single session cookie (<code>ytg_session</code>) to keep you logged in. We do not use advertising or tracking cookies.</p>

          <h2>8. Contact</h2>
          <p>Privacy questions? Email <strong>support@ytgrowth.io</strong>.</p>
        </article>
      </section>

      <LandingFooter />

    </div>
  )
}
