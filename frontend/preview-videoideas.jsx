/* Video Ideas standalone preview (paid plan, AI ideas list). */
import React from 'react'
import ReactDOM from 'react-dom/client'
import VideoIdeas from './src/pages/VideoIdeas.jsx'

const state = new URLSearchParams(window.location.search).get('state') || 'ideas'

const TCV = (id, t) => ({ title: t, ytimg: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, video_id: id })
const IDEAS = [
  { rank: 1, title: 'I lived on a 5,000 KSh food budget for 30 days', angle: 'Numeric promise + relatable stakes; beats the niche on specificity.', targetKeyword: 'budget meals kenya', opportunityScore: 84, source: 'ai', thumbnail_ready: true,
    top_competing_videos: [TCV('dQw4w9WgXcQ','Budget grocery haul'), TCV('9bZkp7q19f0','A week of cheap dinners')] },
  { rank: 2, title: 'The real cost of living alone in Nairobi at 24', angle: 'Cost-transparency angle is your proven winner; expand it.', targetKeyword: 'cost of living nairobi', opportunityScore: 72, source: 'ai', thumbnail_ready: false,
    top_competing_videos: [TCV('kJQP7kiw5Fk','Living alone in Nairobi')] },
  { rank: 3, title: '5 cafes in Nairobi actually worth working from', angle: 'Listicle + place anchor; speedtest screenshots = strong thumbnail.', targetKeyword: 'nairobi cafe wifi', opportunityScore: 58, source: 'ai', thumbnail_ready: false,
    top_competing_videos: [TCV('JGwWNGJdvx8','Cafe wifi speed test')] },
]

const J = (o) => new Response(JSON.stringify(o), { headers: { 'Content-Type': 'application/json' } })
const of_ = window.fetch
window.fetch = async (url, opts) => {
  const s = String(url)
  if (s.includes('/video-ideas')) return J(
    state === 'empty'
      ? { source: 'empty', ideas: [] }
      : { source: 'ai', ideas: IDEAS, last_updated: new Date(Date.now()-86400_000*1).toISOString(), credits: { remaining: 7 } }
  )
  if (s.startsWith('http')) return of_(url, opts)
  return J({})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement('div', { style: { padding: '36px 24px', minHeight: '100vh', background: '#0e0e10' } },
    React.createElement(VideoIdeas, { onNavigate: () => {}, plan: 'growth', freeTierFeatures: {} })
  )
)
