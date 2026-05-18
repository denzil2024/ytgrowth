/*
 * Feed (Dashboard Overview) preview. Mounts the REAL Dashboard with
 * mocked fetches; Dashboard's initial nav is 'Overview' so it lands on
 * Feed. Used to verify the dark Feed port (dark shell + dark page).
 *
 *   ?state=full  (default) — audited channel, rich insights + videos
 *   ?state=fresh           — brand-new channel, no insights (onboarding)
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import Dashboard from './src/pages/Dashboard.jsx'

const state = new URLSearchParams(window.location.search).get('state') || 'full'

const VID = (i, v) => ({
  video_id: ['dQw4w9WgXcQ','9bZkp7q19f0','kJQP7kiw5Fk','JGwWNGJdvx8','OPf0YbXqDm0','3JZ_D3ELwOQ','L_jWHffIx5E','fJ9rUzIMcZQ'][i % 8],
  title: ['I spent 24 hours testing budget meals','Why every creator is switching in 2026','My honest review of working from home','Living on a 5K budget — the real cost','A week of cheap dinners that actually slap','The cafe wifi speed test nobody asked for','30 days, one kitchen, zero takeout','How I doubled retention in a month'][i % 8],
  views: v, likes: Math.round(v * 0.043),
  duration: i % 3 === 0 ? 'PT0M48S' : 'PT11M30S',
  published_at: new Date(Date.now() - 86400_000 * (4 + i * 6)).toISOString(),
  thumbnail: '',
})
const VIDEOS = [VID(0,412000),VID(1,287000),VID(2,198400),VID(3,156800),VID(4,124700),VID(5,98200),VID(6,71200),VID(7,52300)]

const INSIGHTS_FULL = {
  channelScore: 78,
  categoryScores: { 'Titles & SEO': 62, 'Thumbnails': 71, 'Content': 80, 'Consistency': 58 },
  priorityActions: [
    { rank: 1, impact: 'high', title: 'Tighten your titles around one proven keyword', category: 'seo', problem: 'Three of your last five titles bury the hook past 40 characters.', action: 'Rewrite to lead with the payoff.' },
    { rank: 2, impact: 'med', title: 'Post a second video within 7 days of a winner', category: 'content', problem: 'Your 12-day gap after the budget-meal hit cost recommendation momentum.', action: 'Batch-film the follow-up now.' },
    { rank: 3, impact: 'low', title: 'Add a face + number to thumbnails', category: 'thumbnail', problem: 'Text-only thumbnails under-index in your niche.', action: 'Test a face crop on the next upload.' },
  ],
}

const J = (o) => new Response(JSON.stringify(o), { headers: { 'Content-Type': 'application/json' } })
const origFetch = window.fetch
window.fetch = async (url, opts) => {
  const u = String(url)
  if (u.includes('/auth/data')) return J({
    channel: { channel_id: 'UCdemo', channel_name: 'Life with Nthenya', email: 'demo@ytgrowth.app',
      thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_kMR-4cElBYJtJZW6jJ2v9G2YBOe2qj1y3WUJZxR4ldNw=s176-c-k-c0x00ffffff-no-rj',
      subscribers: 41200, total_views: 3_180_000, video_count: 96 },
    videos: state === 'fresh' ? [] : VIDEOS,
    insights: state === 'fresh' ? null : INSIGHTS_FULL,
    stats_fetched_at: new Date().toISOString(),
  })
  if (u.includes('/channels/list'))   return J({ channels: [], channels_allowed: 1, can_add_more: false })
  if (u.includes('/auth/me'))         return J({ plan: 'growth', free_tier_features: {} })
  if (u.includes('/auth/milestones')) return J({ milestones: [] })
  if (u.includes('/dashboard/tracked-lift')) return J({})
  if (u.includes('/dashboard/competitor-activity')) return J({ items: [
    { channel_name: 'Moureen Ngigi', video_title: 'I spent 24 hours in a Nairobi 2-bed', published_at: new Date(Date.now()-86400_000*2).toISOString(), video_id: 'dQw4w9WgXcQ', views: 412000 },
  ] })
  if (u.includes('/video-ideas')) return J([
    { title: 'I tried every budget-meal hack for 7 days', targetKeyword: 'budget meals', why: 'Rides your proven winner.' },
    { title: 'The real cost of living alone at 24', targetKeyword: 'cost of living', why: 'High search, low competition in your tier.' },
  ])
  if (u.includes('/dashboard/niche-outlier')) return J({ ok: false })
  if (u.includes('/chat/state')) return J({ conversations: [], conversation_id: null })
  if (u.includes('/dashboard/')) return J({})
  if (u.startsWith('http')) return origFetch(url, opts)
  return J({})
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Dashboard))
