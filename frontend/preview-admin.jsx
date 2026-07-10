/*
 * Preview harness for Admin. Mounts the component inside a faithful copy
 * of the real Dashboard shell (52px topbar + content box padding
 * 36/40/72 + #fafafb wash) with mocked endpoints, so screenshots reflect
 * exactly what the user sees in the app. Not served in production.
 *
 * Query params:
 *   ?state=default  (default) — rich data, all sections populated
 *   ?state=quiet              — near-empty: no signups, no paid, no MRR
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import './src/index.css'
import Admin from './src/pages/Admin.jsx'

const params = new URLSearchParams(window.location.search)
const MODE   = params.get('state') === 'quiet' ? 'quiet' : 'default'

const THUMB = 'https://yt3.googleusercontent.com/ytc/AIdro_kMR-4cElBYJtJZW6jJ2v9G2YBOe2qj1y3WUJZxR4ldNw=s176-c-k-c0x00ffffff-no-rj'
const now = Date.now()
const iso = (msAgo) => new Date(now - msAgo).toISOString()
const H = 3600_000, D = 86400_000

const PLANS = ['free', 'solo', 'growth', 'agency', 'lifetime_growth']
function signup(i) {
  const plan = i < 3 ? ['solo', 'growth', 'agency'][i] : (i % 5 === 0 ? 'solo' : 'free')
  return {
    display_name: ['Maya Okello', 'Devon Carter', 'Aisha Rahman', 'Liam Brooks', 'Noah Kim', 'Priya Nair', 'Ethan Cole', 'Sara Lindqvist', 'Tom Becker', 'Yuki Tanaka', 'Grace Mwangi', 'Owen Park'][i % 12],
    channel_name: null,
    email: `user${i}@example.com`,
    profile_picture: i % 3 === 0 ? THUMB : '',
    plan,
    utm_source: ['youtube', 'twitter', 'reddit', '', 'producthunt', 'newsletter'][i % 6],
    created_at: iso(i < 4 ? i * 2 * H : (i - 3) * 7 * H),
  }
}
function topUser(i) {
  const allowance = [30, 100, 300, 30, 100][i % 5]
  const used = [28, 71, 96, 12, 140][i % 5]
  return {
    channel_id: `UC${i}`,
    channel_name: ['Royal Blue Media', 'Pixel Forge', 'The Growth Lab', 'Quiet Riot FM', 'Studio North', 'Hooked', 'Frame by Frame', 'Signal', 'Lumen', 'Cadence'][i % 10],
    channel_thumbnail: i % 2 === 0 ? THUMB : '',
    owner_email: `owner${i}@example.com`,
    plan: ['growth', 'agency', 'solo', 'growth', 'solo'][i % 5],
    monthly_used: used,
    monthly_allowance: allowance,
    subscribers: [152400, 44100, 8200, 903000, 12700, 3300, 670000, 51000, 2100, 88800][i % 10],
    last_audit_at: iso((i + 1) * 6 * H),
  }
}

const overviewDefault = {
  generated_at: iso(2 * 60_000),
  stats: {
    total_users: 1284, paid_users: 96, free_users: 1188, conversion_pct: 7.5,
    signups_7d: 73, signups_prev_7d: 58, signups_trend: 15, active_7d: 412,
  },
  plan_breakdown: [
    { plan: 'free', count: 1188 }, { plan: 'solo', count: 54 },
    { plan: 'growth', count: 31 }, { plan: 'agency', count: 8 },
    { plan: 'lifetime_growth', count: 3 },
  ],
  utm_breakdown: [
    { source: 'youtube', count: 289 }, { source: 'twitter', count: 142 },
    { source: 'reddit', count: 88 }, { source: 'producthunt', count: 51 },
    { source: 'newsletter', count: 33 },
  ],
  country_breakdown: [
    { country: 'United States', count: 402 }, { country: 'India', count: 233 },
    { country: 'United Kingdom', count: 121 }, { country: 'Canada', count: 88 },
    { country: 'Australia', count: 64 },
  ],
  unknown_country_count: 376,
  recent_signups: Array.from({ length: 24 }, (_, i) => signup(i)),
  top_users: Array.from({ length: 10 }, (_, i) => topUser(i)),
}

const overviewQuiet = {
  generated_at: iso(60_000),
  stats: {
    total_users: 12, paid_users: 0, free_users: 12, conversion_pct: 0,
    signups_7d: 2, signups_prev_7d: 0, signups_trend: 2, active_7d: 1,
  },
  plan_breakdown: [{ plan: 'free', count: 12 }],
  utm_breakdown: [],
  country_breakdown: [],
  unknown_country_count: 12,
  recent_signups: [signup(0), signup(11)],
  top_users: [],
}

const feedbackDefault = {
  counts: { new: 5, planned: 3, shipped: 4, declined: 2 },
  requests: [
    { id: 1, title: 'Bulk-edit video tags across a playlist', status: 'new', display_name: 'Maya Okello', email: 'maya@example.com', created_at: iso(4 * D), body: 'It would save hours to select multiple uploads and update tags in one pass instead of editing each video.' },
    { id: 2, title: 'Export keyword reports to CSV', status: 'planned', display_name: 'Devon Carter', email: 'devon@example.com', created_at: iso(9 * D), body: '' },
    { id: 3, title: 'Dark mode for the dashboard', status: 'shipped', display_name: 'Aisha Rahman', email: 'aisha@example.com', created_at: iso(21 * D), body: '' },
    { id: 4, title: 'Slack alerts when a competitor uploads', status: 'new', display_name: 'Liam Brooks', email: 'liam@example.com', created_at: iso(2 * D), body: '' },
    { id: 5, title: 'A/B test thumbnail variants', status: 'declined', display_name: 'Noah Kim', email: 'noah@example.com', created_at: iso(33 * D), body: 'Out of scope for now, YouTube Studio handles this natively.' },
  ],
}

const ME = MODE === 'quiet' ? overviewQuiet : overviewDefault
const FB = MODE === 'quiet' ? { counts: {}, requests: [] } : feedbackDefault
const TOPUP = MODE === 'quiet'
  ? { eligible_count: 0, sample: [] }
  : { eligible_count: 23, sample: Array.from({ length: 6 }, (_, i) => ({ email: `free${i}@example.com`, display_name: ['Maya Okello', 'Devon Carter', 'Aisha Rahman', 'Liam Brooks', 'Noah Kim', 'Priya Nair'][i] })) }

const origFetch = window.fetch
window.fetch = async (url) => {
  const u = String(url)
  if (u.includes('/admin/overview'))        return new Response(JSON.stringify(ME),    { headers: { 'Content-Type': 'application/json' } })
  if (u.includes('/feedback/admin/list'))   return new Response(JSON.stringify(FB),    { headers: { 'Content-Type': 'application/json' } })
  if (u.includes('/admin/topup-offer/preview')) return new Response(JSON.stringify(TOPUP), { headers: { 'Content-Type': 'application/json' } })
  return origFetch(url)
}

/* Faithful Dashboard shell: scroll-shell (#fafafb) > 52px topbar >
 * content box (padding 36/40/72) > <Page/>. Mirrors the real app so
 * screenshots show exactly what the user sees. */
ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement('div', {
    style: { height: '100vh', overflow: 'auto', background: '#fafafb', boxSizing: 'border-box' },
  },
    React.createElement('div', {
      style: { height: 52, flexShrink: 0, borderBottom: '1px solid rgba(10,10,15,0.06)', background: '#ffffff' },
    }),
    React.createElement('div', {
      style: { padding: '36px 40px 72px', boxSizing: 'border-box' },
    },
      React.createElement(Admin, {})
    )
  )
)
