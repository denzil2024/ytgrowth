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

export default function Refund() {
  useGlobalStyles()
  useEffect(() => { document.title = 'Refund Policy — YTGrowth' }, [])

  const rows = [
    ['Monthly subscription', 'Not refunded', 'Cancel anytime — access continues until period end'],
    ['Annual subscription', '14 days from purchase', 'Less than 10% of monthly tokens used'],
    ['Lifetime plan', '14 days from purchase', 'Fewer than 10 tokens used'],
    ['Founder Bundle', '14 days from purchase', 'Fewer than 10 tokens used'],
    ['Analysis Pack', '14 days from purchase', '0 tokens from the pack used'],
  ]

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
        <h1 style={{ fontWeight: 800, fontSize: 38, letterSpacing: '-1.2px', color: 'var(--ytg-text)', marginBottom: 8, lineHeight: 1.1 }}>Refund Policy</h1>
        <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', marginBottom: 48 }}>Last updated: April 3, 2025</p>

        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>
          We want you to be confident buying YTGrowth. Here's exactly when and how you can get a refund.
        </p>

        <div style={{ height: 1, background: 'var(--ytg-border)', margin: '40px 0' }} />

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginBottom: 16, letterSpacing: '-0.3px' }}>Summary</h2>
        <div style={{ borderRadius: 12, border: '1px solid var(--ytg-border)', overflow: 'hidden', marginBottom: 40 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                {['Product', 'Refund window', 'Condition'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', background: 'rgba(10,10,15,0.04)', borderBottom: '1px solid var(--ytg-border)', fontWeight: 700, color: 'var(--ytg-text)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([product, window, condition], i) => (
                <tr key={i}>
                  <td style={{ padding: '11px 16px', borderBottom: i < rows.length - 1 ? '1px solid var(--ytg-border)' : 'none', color: 'var(--ytg-text)', fontWeight: 500 }}>{product}</td>
                  <td style={{ padding: '11px 16px', borderBottom: i < rows.length - 1 ? '1px solid var(--ytg-border)' : 'none', color: 'var(--ytg-text-2)' }}>{window}</td>
                  <td style={{ padding: '11px 16px', borderBottom: i < rows.length - 1 ? '1px solid var(--ytg-border)' : 'none', color: 'var(--ytg-text-2)' }}>{condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {[
          { t: 'Monthly subscriptions', b: 'Monthly plans are billed in advance. You can cancel at any time — access and remaining tokens continue until the end of the current billing period. We do not issue pro-rated refunds for partial months.' },
          { t: 'Annual subscriptions', b: 'Full refund within 14 days of purchase if less than 10% of that month\'s included tokens have been used. After 14 days, no refund — but you retain full access for the remainder of the annual period.' },
          { t: 'Lifetime plans & Founder Bundles', b: 'Full refund within 14 days if fewer than 10 tokens have been used. After 14 days or 10 tokens consumed (whichever comes first), all sales are final. If YTGrowth shuts down permanently, Lifetime and Founder plan holders receive a pro-rated refund against a 5-year expected service lifespan from their purchase date.' },
          { t: 'Analysis Packs', b: 'Full refund within 14 days of purchase, provided no tokens from that pack have been used. Once any token from a pack is consumed, the pack is non-refundable.' },
        ].map(({ t, b }) => (
          <div key={t}>
            <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>{t}</h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>{b}</p>
          </div>
        ))}

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>How to request a refund</h2>
        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 12 }}>Email <strong>support@ytgrowth.io</strong> with subject "Refund request" and include:</p>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          {['The email address on your account.', 'The product you purchased.', 'Your reason for the refund (optional).'].map((item, i) => (
            <li key={i} style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 8 }}>{item}</li>
          ))}
        </ul>
        <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>We process all refund requests within 3 business days. Refunds are issued to your original payment method via Paddle.</p>

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
