/* Thumbnail Score standalone preview — idle (upload) state, dark. */
import React from 'react'
import ReactDOM from 'react-dom/client'
import ThumbnailScore from './src/pages/ThumbnailScore.jsx'

const J = (o) => new Response(JSON.stringify(o), { headers: { 'Content-Type': 'application/json' } })
const of_ = window.fetch
window.fetch = async (url, opts) => {
  const s = String(url)
  if (s.includes('/thumbnail/video-ideas')) return J({ has_ideas: false, ideas: [] })
  if (s.includes('/thumbnail/history'))     return J({ analyses: [], history: [], items: [] })
  if (s.startsWith('http')) return of_(url, opts)
  return J({})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement('div', { style: { padding: '36px 24px', minHeight: '100vh', background: 'var(--yd-paper)' } },
    React.createElement(ThumbnailScore, {
      channelData: { channel: { channel_id: 'UCdemo', channel_name: 'Life with Nthenya', subscribers: 41200 } },
      onNavigate: () => {}, plan: 'growth', freeTierFeatures: {},
    })
  )
)
