/* UpsellModal — wraps UpsellGate in a dismissible modal overlay.
   Same visual DNA as the page-takeover version (lock icon, title,
   description, bullets, teaser, CTA, trust stack), just floating over
   the existing page so users see the feature UI first and only meet
   the gate when they actually click Run. */

import { useEffect } from 'react'
import UpsellGate from './UpsellGate'

export default function UpsellModal({
  open,
  onClose,
  ...gateProps
}) {
  // ESC to close + lock body scroll while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,10,15,0.52)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        overflowY: 'auto',
        padding: '40px 24px',
        fontFamily: "'Inter', system-ui, sans-serif",
        animation: 'upmFade 0.16s ease',
      }}
    >
      <style>{`
        @keyframes upmFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes upmPop  { from { opacity: 0; transform: translateY(8px) scale(0.98) } to { opacity: 1; transform: none } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: 560, width: '100%',
          margin: '0 auto',
          animation: 'upmPop 0.22s cubic-bezier(0.2, 0.7, 0.3, 1)',
        }}
      >
        {/* Close button — floats top-right above the card */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: -8, right: -8, zIndex: 2,
            width: 32, height: 32, borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.10)', background: '#1c1c21',
            color: '#a1a1aa', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f4f4f5' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#a1a1aa' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8"/>
          </svg>
        </button>

        <UpsellGate {...gateProps} />
      </div>
    </div>
  )
}
