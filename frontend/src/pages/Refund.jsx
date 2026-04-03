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
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: 14 },
  th: { textAlign: 'left', padding: '10px 14px', background: 'rgba(10,10,15,0.04)', borderBottom: '1px solid rgba(10,10,15,0.1)', fontWeight: 700, color: '#0a0a0f' },
  td: { padding: '10px 14px', borderBottom: '1px solid rgba(10,10,15,0.07)', color: 'rgba(10,10,15,0.7)', verticalAlign: 'top' },
}

export default function Refund() {
  useEffect(() => { injectStyles(); document.title = 'Refund Policy — YTGrowth' }, [])

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/" style={s.logo}>YTGrowth</a>
        <Link to="/" style={s.back}>← Back to home</Link>
      </nav>

      <div style={s.wrap}>
        <h1 style={s.h1}>Refund Policy</h1>
        <p style={s.meta}>Last updated: April 3, 2025 &nbsp;·&nbsp; Effective immediately</p>

        <p style={s.p}>
          We want you to be confident buying YTGrowth. This policy explains exactly when and how you can get a refund, no questions asked.
        </p>

        <div style={s.divider} />

        <h2 style={s.h2}>Summary by product type</h2>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Product</th>
              <th style={s.th}>Refund window</th>
              <th style={s.th}>Condition</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={s.td}>Monthly subscription</td>
              <td style={s.td}>Not refunded</td>
              <td style={s.td}>Cancel anytime — access continues until period end</td>
            </tr>
            <tr>
              <td style={s.td}>Annual subscription</td>
              <td style={s.td}>14 days from purchase</td>
              <td style={s.td}>Less than 10% of monthly tokens used</td>
            </tr>
            <tr>
              <td style={s.td}>Lifetime plan</td>
              <td style={s.td}>14 days from purchase</td>
              <td style={s.td}>Fewer than 10 tokens used</td>
            </tr>
            <tr>
              <td style={s.td}>Founder Bundle</td>
              <td style={s.td}>14 days from purchase</td>
              <td style={s.td}>Fewer than 10 tokens used</td>
            </tr>
            <tr>
              <td style={s.td}>Analysis Pack</td>
              <td style={s.td}>14 days from purchase</td>
              <td style={s.td}>0 tokens from the pack used</td>
            </tr>
          </tbody>
        </table>

        <h2 style={s.h2}>Monthly subscriptions</h2>
        <p style={s.p}>Monthly plans are billed in advance for the month ahead. You can cancel at any time — your access and remaining token balance continue until the end of the current billing period. We do not issue pro-rated refunds for partial months.</p>

        <h2 style={s.h2}>Annual subscriptions</h2>
        <p style={s.p}>If you purchased an annual plan and change your mind, we'll issue a full refund within 14 days of the original purchase date, provided less than 10% of that month's included tokens have been consumed. After 14 days, no refund is issued — but you retain full access for the remainder of the annual period.</p>

        <h2 style={s.h2}>Lifetime plans & Founder Bundles</h2>
        <p style={s.p}>These are one-time purchases granting perpetual monthly token allocations. We offer a full refund within 14 days of purchase if fewer than 10 tokens have been used. After 14 days or 10 tokens consumed (whichever comes first), all sales are final.</p>
        <p style={s.p}><strong>If YTGrowth shuts down permanently:</strong> Lifetime and Founder plan holders receive a pro-rated refund calculated against a 5-year expected service lifespan from their purchase date. For example, if you bought a Lifetime plan 18 months ago, you'd receive 42/60ths of your purchase price back.</p>

        <h2 style={s.h2}>Analysis Packs</h2>
        <p style={s.p}>Analysis Packs are one-time top-ups of tokens that never expire. We offer a full refund within 14 days of purchase, provided no tokens from that pack have been used. Once any token from a pack has been consumed, the pack is non-refundable.</p>

        <h2 style={s.h2}>How to request a refund</h2>
        <p style={s.p}>Email <strong>support@ytgrowth.io</strong> with the subject line "Refund request" and include:</p>
        <ul style={s.ul}>
          <li style={s.li}>The email address on your account.</li>
          <li style={s.li}>The product you purchased.</li>
          <li style={s.li}>Your reason for the refund (optional, but helps us improve).</li>
        </ul>
        <p style={s.p}>We aim to process all refund requests within 3 business days. Refunds are issued to your original payment method via Paddle.</p>

        <h2 style={s.h2}>Chargebacks</h2>
        <p style={s.p}>If you initiate a chargeback before contacting us, your account will be suspended pending resolution. We encourage you to reach out first — we're a small team and we'll make it right.</p>

        <div style={s.divider} />
        <p style={{ ...s.p, fontSize: 13 }}>
          <Link to="/terms" style={{ color: '#e5302a', textDecoration: 'none', marginRight: 20 }}>Terms of Service</Link>
          <Link to="/privacy" style={{ color: '#e5302a', textDecoration: 'none' }}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
