/*
 * Preview harness for the sidebar UsageBar. Mounts it inside a faithful
 * copy of the real sidebar footer (320px white column, #e6e6ec borderTop,
 * 14/16/12 padding, a What's-new placeholder above, Refer | Sign out
 * below) so screenshots show exactly how it sits in the app.
 *
 * Query params (?state=):
 *   healthy (default) — 24/30, plenty left, no pack
 *   mid               — 12/30, amber-ish, no pack
 *   pack              — 3/30 but a 5-credit pack (no CTA)
 *   low               — 4/30, near limit, no pack (alert + CTAs)
 *   empty             — 0/30, at limit, no pack (alert + CTAs)
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import UsageBar from './src/components/UsageBar.jsx'

const MODE = new URLSearchParams(window.location.search).get('state') || 'healthy'
const now = Date.now()
const iso = (d) => new Date(now + d * 86400_000).toISOString()

const USAGE = {
  healthy: { monthly_allowance: 30, monthly_used: 6,  pack_balance: 0, reset_date: iso(9),  plan: 'growth' },
  mid:     { monthly_allowance: 30, monthly_used: 18, pack_balance: 0, reset_date: iso(5),  plan: 'growth' },
  pack:    { monthly_allowance: 30, monthly_used: 27, pack_balance: 5, reset_date: iso(2),  plan: 'solo'   },
  low:     { monthly_allowance: 30, monthly_used: 26, pack_balance: 0, reset_date: iso(2),  plan: 'solo'   },
  empty:   { monthly_allowance: 3,  monthly_used: 3,  pack_balance: 0, reset_date: iso(1),  plan: 'free'   },
}[MODE] || {}

const origFetch = window.fetch
window.fetch = async (url, opts) => {
  if (String(url).includes('/billing/usage')) {
    return new Response(JSON.stringify(USAGE), { headers: { 'Content-Type': 'application/json' } })
  }
  return origFetch(url, opts)
}

const C = { border: '#e6e6ec', text2: '#4a4a58', text3: '#9595a4' }

/* Faithful sidebar footer. 320px white column; the footer block matches
 * Dashboard.jsx exactly: borderTop #e6e6ec, padding 14/16/12, gap 10,
 * with a What's-new placeholder above and Refer | Sign out below. */
/* Mirrors the real WhatsNewCard's NEW flat styling (white, C.border, no
   gradient, no red rail) so the footer composition screenshots true. */
function WhatsNewPlaceholder() {
  return React.createElement('div', {
    style: {
      position: 'relative', background: '#ffffff', border: `1px solid ${C.border}`,
      borderRadius: 11, padding: '13px 14px 14px 14px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.025), inset 0 1px 0 rgba(255,255,255,0.7)',
      display: 'flex', alignItems: 'flex-start', gap: 11,
    },
  },
    React.createElement('span', { style: { flexShrink: 0, width: 28, height: 28, borderRadius: 8, background: 'rgba(229,37,27,0.08)', color: '#e5251b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, marginTop: 1 } }, '✦'),
    React.createElement('div', { style: { minWidth: 0, flex: 1 } },
      React.createElement('div', { style: { fontSize: 9.5, fontWeight: 600, color: '#e5251b', letterSpacing: '0.11em', textTransform: 'uppercase', marginBottom: 5 } }, "What's new"),
      React.createElement('div', { style: { fontSize: 13.5, fontWeight: 600, color: '#0a0a0f', lineHeight: 1.35, marginBottom: 5 } }, 'Instagram tools just launched'),
      React.createElement('div', { style: { fontSize: 12.5, fontWeight: 450, color: 'rgba(10,10,15,0.58)', lineHeight: 1.55, marginBottom: 10 } }, 'Pull Reels ideas and hooks straight from your niche.'),
      React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: '#e5251b' } }, 'Try it now →'),
    ),
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement('div', {
    style: { minHeight: '100vh', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', padding: 40, boxSizing: 'border-box' },
  },
    React.createElement('div', {
      style: { width: 320, background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 10px 40px rgba(15,15,25,0.10)' },
    },
      React.createElement('div', { style: { height: 120, background: '#fff', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text3, fontSize: 12 } }, 'nav items …'),
      React.createElement('div', {
        style: { padding: '14px 16px 12px', borderTop: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 10 },
      },
        React.createElement(WhatsNewPlaceholder),
        React.createElement(UsageBar, { channelId: 'UC123', email: 'demo@example.com', dark: false }),
        React.createElement('div', {
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2, fontSize: 12.5, fontWeight: 600 },
        },
          React.createElement('span', { style: { color: C.text2 } }, 'Refer a friend'),
          React.createElement('span', { style: { color: C.text3 } }, 'Sign out'),
        ),
      ),
    )
  )
)
