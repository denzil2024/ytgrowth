/* AuthErrorModal, centred modal for auth-callback failures.

   Mounted from Landing.jsx (routers/auth.py redirects to /?error=<code> on
   every host, including channelbrain.online) — so this follows Landing's
   own editorial system (Fraunces headings, flat radius-0, solid accent red,
   no gradients) instead of a generic SaaS gradient-modal look. Redesigned
   2026-08 to actually match the page it's shown on.

   Each error gets:
     - an icon that fits the cause (YouTube glyph for no_channel, etc.)
     - a clear title and explanation
     - a primary action that moves the user forward
     - optional secondary link

   Props:
     open      , show/hide
     errorCode , one of the keys in ERRORS below; falls back to 'generic'
     onClose   , dismiss handler */

import { useEffect } from 'react'
import { supportEmail } from '../brandHost'

/* Editorial tokens, matching Landing.jsx's ED_* constants exactly. */
const SERIF  = "'Fraunces', Georgia, serif"
const SANS   = "'Barlow', system-ui, sans-serif"
const INK    = '#14130f'
const SOFT   = '#5c574e'
const MUTED  = '#8a8378'
const ACCENT = '#e5302a'
const LINE   = 'rgba(20,19,15,0.12)'

/* ── Icons ──────────────────────────────────────────────────────────────── */
const IconYoutube = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff" stroke="none"/>
  </svg>
)
const IconLock = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="10" rx="2"/>
    <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
  </svg>
)
const IconAlert = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9.5"/>
    <line x1="12" y1="7.5" x2="12" y2="13"/>
    <circle cx="12" cy="16.5" r="0.7" fill="#fff" stroke="none"/>
  </svg>
)
const IconClock = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9.5"/><polyline points="12 7 12 12 15.5 14"/>
  </svg>
)
const IconStack = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/><polyline points="2 7 12 2 22 7 12 12 2 7"/>
  </svg>
)

/* ── Per-error copy + actions ──────────────────────────────────────────── */
const ERRORS = {
  no_channel: {
    icon: IconYoutube,
    title: 'No YouTube channel found',
    body:  "We couldn't find a YouTube channel on the Google account you signed in with. Make sure the account owns a channel, or sign in with a different one.",
    primary: { label: 'Open YouTube Studio', href: 'https://studio.youtube.com', external: true },
    secondary: { label: 'Try a different Google account', href: '/auth/login' },
  },
  channel_taken: {
    icon: IconLock,
    title: 'Channel already connected',
    body: "This YouTube channel is already linked to another YTGrowth account. Sign in with that account, or pick a different channel.",
    primary: { label: 'Try a different channel', href: '/auth/login' },
    secondary: { label: 'Need help? Contact support', href: 'mailto:' + supportEmail()},
  },
  channel_locked: {
    icon: IconClock,
    title: 'Channel temporarily locked',
    body: "This channel was disconnected from another account in the last 30 days. We hold it for a short cool-down before it can be re-connected.",
    primary: { label: 'Try a different channel', href: '/auth/login' },
    secondary: { label: 'Email support if this is your channel', href: 'mailto:' + supportEmail()},
  },
  channel_limit: {
    icon: IconStack,
    title: 'Channel limit reached',
    body: "Your current plan doesn't allow another channel. Upgrade to add more, or disconnect one in Settings to swap it out.",
    primary: { label: 'View plans', href: '/#pricing' },
    secondary: { label: 'Manage channels in Settings', href: '/dashboard' },
  },
  no_code: {
    icon: IconAlert,
    title: "Sign-in didn't complete",
    body: "Looks like the Google prompt was closed before sign-in finished. No problem, try again and you'll be in within seconds.",
    primary: { label: 'Try again', href: '/auth/login' },
    secondary: null,
  },
  session_expired: {
    icon: IconClock,
    title: 'Sign-in session expired',
    body: "Your sign-in took longer than expected and the secure session timed out. This is rare, usually a quick retry sorts it.",
    primary: { label: 'Try again', href: '/auth/login' },
    secondary: null,
  },
  analysis_failed: {
    icon: IconAlert,
    title: 'Something went wrong after sign-in',
    body: "Google sign-in worked, but we hit an unexpected error setting up your channel. Nothing was charged. Try signing in again.",
    primary: { label: 'Try again', href: '/auth/login' },
    secondary: { label: 'Email support if this keeps happening', href: 'mailto:' + supportEmail()},
  },
  insufficient_scope: {
    icon: IconYoutube,
    title: "YouTube access wasn't granted",
    body: "Google's sign-in screen needs every permission checked to work, and it looks like YouTube access got unchecked this time. Try again and leave all boxes checked.",
    primary: { label: 'Try again', href: '/auth/login' },
    secondary: { label: 'Email support if this keeps happening', href: 'mailto:' + supportEmail()},
  },
  quota_exceeded: {
    icon: IconClock,
    title: 'YTGrowth is temporarily at capacity',
    body: "We've hit our YouTube API quota for the day. This resets at midnight Pacific Time. Please try signing in again in a few hours, your account is fine, nothing is lost.",
    primary: { label: 'Try again', href: '/auth/login' },
    secondary: { label: 'Email support if this keeps happening', href: 'mailto:' + supportEmail()},
  },
  generic: {
    icon: IconAlert,
    title: 'Something went wrong signing you in',
    body: "We hit an unexpected error during sign-in. Try once more, if it keeps happening, our support team can dig in.",
    primary: { label: 'Try again', href: '/auth/login' },
    secondary: { label: 'Email support', href: 'mailto:' + supportEmail()},
  },
  payment_required: {
    icon: IconLock,
    title: 'Purchase a plan first',
    body: "YTGrowth no longer offers free accounts. Pick a plan or the $5 starter pack, then connect your YouTube channel using the same Google account you used to pay.",
    primary: { label: 'View plans', href: '/#pricing' },
    secondary: { label: 'Already paid? Email support', href: 'mailto:' + supportEmail()},
  },
}

export default function AuthErrorModal({ open, errorCode, onClose }) {
  // ESC + body scroll lock
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

  const cfg = ERRORS[errorCode] || ERRORS.generic

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(20,19,15,0.5)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        fontFamily: SANS,
        animation: 'aem-fade 0.16s ease',
      }}>
      <style>{`
        @keyframes aem-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes aem-pop  { from { opacity: 0; transform: translateY(8px) scale(0.98) } to { opacity: 1; transform: none } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          background: '#ffffff',
          border: `1px solid ${LINE}`,
          borderRadius: 0,
          boxShadow: '0 12px 32px rgba(20,19,15,0.14)',
          padding: '32px 36px 28px',
          maxWidth: 480, width: '100%',
          textAlign: 'center',
          animation: 'aem-pop 0.22s cubic-bezier(0.2, 0.7, 0.3, 1)',
        }}>

        {/* Close X */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 30, height: 30, borderRadius: 0,
            border: 'none', background: 'transparent',
            color: MUTED, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,19,15,0.06)'; e.currentTarget.style.color = INK }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = MUTED }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8"/>
          </svg>
        </button>

        {/* Flat solid-red icon square, matches the pricing badges elsewhere on the page */}
        <div style={{
          width: 48, height: 48, borderRadius: 0,
          background: ACCENT,
          margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {cfg.icon}
        </div>

        <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 28, color: INK, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: 12 }}>
          {cfg.title}
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 14.5, color: SOFT, lineHeight: 1.65, marginBottom: 24, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
          {cfg.body}
        </p>

        {/* Primary CTA, flat solid red, matches the pricing CTAs on the page */}
        <a
          href={cfg.primary.href}
          target={cfg.primary.external ? '_blank' : undefined}
          rel={cfg.primary.external ? 'noopener noreferrer' : undefined}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', maxWidth: 340,
            background: ACCENT,
            color: '#ffffff',
            fontFamily: SANS, fontSize: 14, fontWeight: 600,
            padding: '13px 24px', borderRadius: 0,
            textDecoration: 'none', letterSpacing: '-0.1px',
          }}>
          {cfg.primary.label}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>

        {/* Secondary text link */}
        {cfg.secondary && (
          <div style={{ marginTop: 16 }}>
            <a
              href={cfg.secondary.href}
              style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: MUTED, textDecoration: 'none' }}>
              {cfg.secondary.label} →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
