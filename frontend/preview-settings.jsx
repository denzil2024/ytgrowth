/*
 * Preview harness for Settings. Mounts the component standalone with a
 * mocked /auth/me + /feedback/mine so I can render each state and
 * screenshot via Playwright before shipping a design change.
 *
 * Query params:
 *   ?state=default  (default) — Solo plan, 2 of 3 channels, healthy credits,
 *                               past feature requests, weekly report on
 *   ?state=low      — Free plan, 1 channel at limit, credits near zero,
 *                     no past requests, weekly report off
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import Settings from './src/pages/Settings.jsx'

const params = new URLSearchParams(window.location.search)
const state  = params.get('state') || 'default'

const THUMB = 'https://yt3.googleusercontent.com/ytc/AIdro_kMR-4cElBYJtJZW6jJ2v9G2YBOe2qj1y3WUJZxR4ldNw=s176-c-k-c0x00ffffff-no-rj'

function meDefault() {
  return {
    display_name: 'Royal Blue Media',
    email: 'royalbluemedia.agency@gmail.com',
    profile_picture: THUMB,
    member_since: new Date(Date.now() - 86400_000 * 320).toISOString(),
    plan: 'solo',
    billing_cycle: 'monthly',
    is_lifetime: false,
    status: 'active',
    reset_date: new Date(Date.now() + 86400_000 * 9).toISOString(),
    monthly_allowance: 30,
    monthly_used: 18,
    pack_balance: 0,
    channels_allowed: 3,
    can_add_more: true,
    weekly_report_enabled: true,
    channels: [
      { channel_id: 'UC1', channel_name: 'Royal Blue Media', channel_thumbnail: THUMB, subscribers: 152_400, connected_at: new Date(Date.now() - 86400_000 * 300).toISOString(), is_current: true },
      { channel_id: 'UC2', channel_name: 'Blue Media Shorts', channel_thumbnail: '', subscribers: 44_100, connected_at: new Date(Date.now() - 86400_000 * 120).toISOString(), is_current: false },
    ],
  }
}

function meLow() {
  return {
    display_name: 'Royal Blue Media',
    email: 'royalbluemedia.agency@gmail.com',
    profile_picture: '',
    member_since: new Date(Date.now() - 86400_000 * 40).toISOString(),
    plan: 'free',
    billing_cycle: 'monthly',
    is_lifetime: false,
    status: 'free',
    reset_date: new Date(Date.now() + 86400_000 * 1).toISOString(),
    monthly_allowance: 3,
    monthly_used: 3,
    pack_balance: 2,
    channels_allowed: 1,
    can_add_more: false,
    weekly_report_enabled: false,
    channels: [
      { channel_id: 'UC1', channel_name: 'Royal Blue Media', channel_thumbnail: THUMB, subscribers: 8_200, connected_at: new Date(Date.now() - 86400_000 * 38).toISOString(), is_current: true },
    ],
  }
}

const ME = state === 'low' ? meLow() : meDefault()

const FEEDBACK = state === 'low' ? [] : [
  { id: 'f1', title: 'Bulk-edit video tags across a playlist', created_at: new Date(Date.now() - 86400_000 * 4).toISOString(), status: 'under_review' },
  { id: 'f2', title: 'Export keyword reports to CSV', created_at: new Date(Date.now() - 86400_000 * 21).toISOString(), status: 'shipped' },
  { id: 'f3', title: 'Dark mode for the dashboard', created_at: new Date(Date.now() - 86400_000 * 48).toISOString(), status: 'planned' },
]

const origFetch = window.fetch
window.fetch = async (url, opts) => {
  const u = String(url)
  if (u.includes('/auth/me'))      return new Response(JSON.stringify(ME),                 { headers: { 'Content-Type': 'application/json' } })
  if (u.includes('/feedback/mine')) return new Response(JSON.stringify({ requests: FEEDBACK }), { headers: { 'Content-Type': 'application/json' } })
  return origFetch(url, opts)
}

// Variant B mimics the landing-page type system: DM Sans for display
// (h1 / card titles / eyebrows), Inter for body + UI. Variant A is the
// shipped app font (Geist), untouched.
const fontOverride = `
  .font-landing .set-page, .font-landing .set-page * { font-family: 'Inter', system-ui, sans-serif !important; }
  .font-landing .set-h1, .font-landing .set-card-title, .font-landing .set-eyebrow,
  .font-landing .set-btn-primary, .font-landing .set-btn-secondary { font-family: 'DM Sans', system-ui, sans-serif !important; }
`

const Label = (t, sub) => React.createElement('div', {
  style: { maxWidth: 1040, margin: '0 auto 14px', fontFamily: "'Geist',system-ui", }
},
  React.createElement('div', { style: { fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fb6a60' } }, t),
  React.createElement('div', { style: { fontSize: 13, color: '#b2b3bb', marginTop: 4 } }, sub),
)

const settingsEl = () => React.createElement(Settings, {
  channelData: { channel: { channel_name: ME.display_name, thumbnail: ME.profile_picture } },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement('div', {
    style: { padding: '40px 24px 80px', boxSizing: 'border-box', background: '#0e0e10', minHeight: '100vh' }
  },
    React.createElement('style', null, fontOverride),
    Label('A — Current app font (Geist)', 'What ships today across the dark app'),
    settingsEl(),
    React.createElement('div', { style: { height: 64 } }),
    Label('B — Landing fonts (DM Sans + Inter)', 'Matches the marketing site: DM Sans titles, Inter body'),
    React.createElement('div', { className: 'font-landing' }, settingsEl()),
  )
)
