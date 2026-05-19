/*
 * Video Review (Autopsy) preview. Mounts the real component with mocked
 * /autopsy/list so every state can be screenshot on the dark ground.
 *
 *   ?state=new     (default) — eligible-videos grid (New review tab)
 *   ?state=reports           — saved reports list
 *   ?state=report            — an opened autopsy detail
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import Autopsy from './src/pages/Autopsy.jsx'

const state = new URLSearchParams(window.location.search).get('state') || 'new'

const VIDS = ['dQw4w9WgXcQ','9bZkp7q19f0','kJQP7kiw5Fk','JGwWNGJdvx8','OPf0YbXqDm0','3JZ_D3ELwOQ'].map((id, i) => ({
  video_id: id,
  title: ['I spent 24 hours testing budget meals','Why every creator is switching in 2026','My honest review of working from home','Living on a 5K budget — the real cost','A week of cheap dinners that slap','The cafe wifi speed test nobody asked for'][i],
  thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  views: [412000,287000,198400,156800,124700,98200][i],
  likes: [17700,12100,8200,6400,5100,3900][i],
  published_at: new Date(Date.now() - 86400_000 * (3 + i * 4)).toISOString(),
}))

const RESULT = {
  headline: 'Strong hook, but the mid-roll lost half the room',
  score: 64,
  verdict: 'mixed',
  metrics: { ctr: '5.8%', avd: '41%', avg_view_duration: '4:12', views: '124.7K', impressions: '2.1M', subs_gained: '+318' },
  what_worked: [
    'The first 15 seconds delivered the promised payoff — retention held above 80% to 0:18.',
    'Title + thumbnail matched the on-screen hook, so CTR stayed healthy at 5.8%.',
  ],
  what_didnt: [
    'A 40-second setup tangent at 3:10 dropped retention from 62% to 31%.',
    'No pattern interrupt between 4:00 and 7:00 — the flattest stretch of the video.',
  ],
  next_actions: [
    'Cut the 3:10 tangent to one sentence and move the result up.',
    'Add a B-roll or on-screen-text beat every 30–40s through the middle.',
    'Re-test the same topic with a tighter 8-minute cut.',
  ],
}

const REPORTS = [
  { id: 'r1', video_id: 'dQw4w9WgXcQ', video_title: 'I spent 24 hours testing budget meals', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg', created_at: new Date(Date.now()-86400_000*2).toISOString(), result: RESULT },
  { id: 'r2', video_id: '9bZkp7q19f0', video_title: 'Why every creator is switching in 2026', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg', created_at: new Date(Date.now()-86400_000*9).toISOString(), result: { ...RESULT, score: 82, verdict: 'winner', headline: 'A clean winner — replicate the structure' } },
  { id: 'r3', video_id: 'kJQP7kiw5Fk', video_title: 'My honest review of working from home', thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg', created_at: new Date(Date.now()-86400_000*20).toISOString(), result: { ...RESULT, score: 38, verdict: 'underperformer', headline: 'Hook never landed' } },
]

const J = (o) => new Response(JSON.stringify(o), { headers: { 'Content-Type': 'application/json' } })
const origFetch = window.fetch
window.fetch = async (url, opts) => {
  const u = String(url)
  if (u.includes('/autopsy/list')) return J({ reports: REPORTS })
  if (u.startsWith('http')) return origFetch(url, opts)
  return J({})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement('div', {
    style: { padding: '36px 24px', boxSizing: 'border-box', background: '#0e0e10', minHeight: '100vh' },
  },
    React.createElement(Autopsy, { videos: VIDS, channelId: 'UCdemo', optimizations: [], goToTracked: () => {} })
  )
)

// Drive into the requested state.
setTimeout(() => {
  const tabs = Array.from(document.querySelectorAll('.au-tab-btn'))
  if (state === 'reports' || state === 'report') {
    const t = tabs.find(b => /report|saved/i.test(b.textContent || ''))
    if (t) t.click()
    if (state === 'report') {
      setTimeout(() => {
        const h = document.querySelector('.au-report-header')
        if (h) h.click()
      }, 220)
    }
  }
}, 260)
