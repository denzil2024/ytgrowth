/*
 * Preview harness for the Refer & earn page. Mounts it inside a faithful
 * copy of the Dashboard shell (52px topbar + 36/40/72 content padding +
 * #fafafb wash). The affiliate iframe is external; the harness stubs the
 * embed-token fetch so we can screenshot loading / error / loaded chrome.
 *
 * Query params (?state=):
 *   loaded  (default) — token returned, iframe card frame shown
 *   loading           — spinner state
 *   error             — error state
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import Referrals from './src/pages/Referrals.jsx'

const MODE = new URLSearchParams(window.location.search).get('state') || 'loaded'

const origFetch = window.fetch
window.fetch = (url, opts) => {
  if (String(url).includes('/api/affiliate/embed-token')) {
    if (MODE === 'loading') return new Promise(() => {})  // never resolves -> spinner
    if (MODE === 'error') {
      return Promise.resolve(new Response(JSON.stringify({ error: 'Affiliate account not provisioned yet. Try again shortly.' }), { status: 500, headers: { 'Content-Type': 'application/json' } }))
    }
    return Promise.resolve(new Response(JSON.stringify({ token: 'demo-token-123' }), { headers: { 'Content-Type': 'application/json' } }))
  }
  return origFetch(url, opts)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement('div', {
    style: { minHeight: '100vh', background: '#fafafb', boxSizing: 'border-box' },
  },
    React.createElement('div', { style: { height: 52, background: '#fff', borderBottom: '1px solid rgba(10,10,15,0.06)' } }),
    React.createElement('div', { style: { padding: '36px 40px 72px' } },
      React.createElement(Referrals, {})
    )
  )
)
