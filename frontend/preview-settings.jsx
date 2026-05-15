/*
 * Preview harness for Settings. Mocks /auth/me + /feedback/mine so the page
 * renders standalone for visual review.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import Settings from './src/pages/Settings.jsx'

const ME = {
  display_name: 'Royal Blue Media',
  email: 'royalbluemedia.agency@gmail.com',
  member_since: '2025-09-14T00:00:00Z',
  profile_picture: null,
  plan: 'growth',
  is_lifetime: false,
  billing_cycle: 'monthly',
  reset_date: new Date(Date.now() + 18 * 86400000).toISOString(),
  status: 'active',
  monthly_allowance: 60,
  monthly_used: 38,
  pack_balance: 12,
  weekly_report_enabled: true,
  channels_allowed: 3,
  can_add_more: true,
  channels: [
    {
      channel_id: 'UC1',
      channel_name: 'Royal Blue Media',
      channel_thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_lLDpw=s176-c-k-c0x00ffffff-no-rj',
      subscribers: 14_350,
      connected_at: '2025-09-14T00:00:00Z',
      is_current: true,
    },
    {
      channel_id: 'UC2',
      channel_name: 'Side Project Studio',
      channel_thumbnail: null,
      subscribers: 3_240,
      connected_at: '2025-11-02T00:00:00Z',
      is_current: false,
    },
  ],
}

const FR_MINE = {
  requests: [
    { id: 1, title: 'Bulk-edit video tags from the dashboard', status: 'planned',  created_at: '2026-04-22T00:00:00Z' },
    { id: 2, title: 'Export keyword reports as CSV',           status: 'shipped',  created_at: '2026-03-30T00:00:00Z' },
    { id: 3, title: 'Per-channel email digest customisation',  status: 'under_review', created_at: '2026-05-08T00:00:00Z' },
  ],
}

const realFetch = window.fetch
window.fetch = (input, init) => {
  const url = typeof input === 'string' ? input : input?.url
  if (url && url.includes('/auth/me')) {
    return Promise.resolve(new Response(JSON.stringify(ME), { status: 200, headers: { 'Content-Type': 'application/json' } }))
  }
  if (url && url.includes('/feedback/mine')) {
    return Promise.resolve(new Response(JSON.stringify(FR_MINE), { status: 200, headers: { 'Content-Type': 'application/json' } }))
  }
  // Everything else: respond with a benign success so toggles don't break the UI.
  return Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
}

ReactDOM.createRoot(document.getElementById('root')).render(<Settings channelData={null} />)
