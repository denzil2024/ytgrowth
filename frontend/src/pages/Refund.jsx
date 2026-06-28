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

export default function Refund() {
  useGlobalStyles()
  useEffect(() => { document.title = 'Refund Policy, YTGrowth' }, [])
  const { isMobile } = useBreakpoint()

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', minHeight: '100vh' }}>

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--ytg-border)', padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ytg-nav)', backdropFilter: 'blur(12px)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <Logo size={26} />
        </a>
        <a href="/" style={{ fontSize: 14, color: 'var(--ytg-text-3)', textDecoration: 'none', fontWeight: 500 }}>← Back to home</a>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 100px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-accent-text)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontWeight: 800, fontSize: 38, letterSpacing: '-1.2px', color: 'var(--ytg-text)', marginBottom: 8, lineHeight: 1.1 }}>Refund Policy</h1>
        <p style={{ fontSize: 14, color: 'var(--ytg-text-3)', marginBottom: 48 }}>Last updated: April 11, 2026</p>

        <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>
          Because YTGrowth provides a free trial before any payment is required, all purchases are non-refundable. By the time you upgrade, you have already used the product and know exactly what you are paying for.
        </p>

        <div style={{ height: 1, background: 'var(--ytg-border)', margin: '40px 0' }} />

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>Exception</h2>
        <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>The only exception is a major technical failure on our end that makes the product completely unusable for more than 7 consecutive days. In that case, contact <strong>support@ytgrowth.io</strong> and we will make it right.</p>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>Merchant of Record</h2>
        <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.8, marginBottom: 16 }}>As our Merchant of Record, Lemon Squeezy reserves the right to issue refunds at their discretion to prevent chargebacks.</p>

        <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--ytg-text)', marginTop: 36, marginBottom: 10, letterSpacing: '-0.3px' }}>Contact</h2>
        <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.8 }}>Questions? Email <strong>support@ytgrowth.io</strong>.</p>
      </div>

      <LandingFooter />

    </div>
  )
}
