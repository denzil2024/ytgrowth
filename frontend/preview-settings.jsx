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

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement('div', {
    style: { padding: '36px 24px', boxSizing: 'border-box', background: '#fafafb', minHeight: '100vh' }
  },
    React.createElement(Settings, {
      channelData: { channel: { channel_name: ME.display_name, thumbnail: ME.profile_picture } },
    })
  )
)
