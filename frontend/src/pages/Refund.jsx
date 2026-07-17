import { useEffect, useState } from 'react'
import LandingFooter from '../components/LandingFooter'
import SiteHeader from '../components/SiteHeader'
import { useProseStyles } from '../blog/proseStyles.jsx'

/* Refund Policy. Styled as a single blog post (the .bp-prose editorial
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

export default function Refund() {
  useProseStyles()
  useEffect(() => { document.title = 'Refund Policy, YTGrowth' }, [])
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
          <h1 className="bp-h1" style={{ fontSize: isMobile ? 32 : 48, letterSpacing: '-0.4px' }}>Refund Policy</h1>
          <p className="bp-byline-meta" style={{ marginTop: 18 }}>Last updated April 11, 2026</p>
        </div>
      </section>

      {/* Body */}
      <section className="bp-section-pad" style={{ padding: isMobile ? '36px 22px 64px' : '64px 48px 96px', background: 'var(--yte-bg)' }}>
        <article className="bp-prose">
          <p>Because YTGrowth provides a free trial before any payment is required, all purchases are non-refundable. By the time you upgrade, you have already used the product and know exactly what you are paying for.</p>

          <hr />

          <h2>Exception</h2>
          <p>The only exception is a major technical failure on our end that makes the product completely unusable for more than 7 consecutive days. In that case, contact <strong>royalbluemedia.agency@gmail.com</strong> and we will make it right.</p>

          <h2>Merchant of Record</h2>
          <p>As our Merchant of Record, Paddle reserves the right to issue refunds at their discretion to prevent chargebacks.</p>

          <h2>Contact</h2>
          <p>Questions? Email <strong>royalbluemedia.agency@gmail.com</strong>.</p>
        </article>
      </section>

      <LandingFooter />

    </div>
  )
}
