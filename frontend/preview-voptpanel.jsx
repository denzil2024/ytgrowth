/* VideoOptimizePanel standalone preview (My-Videos-only component). */
import React from 'react'
import ReactDOM from 'react-dom/client'
import VideoOptimizePanel from './src/pages/VideoOptimizePanel.jsx'

const J = (o) => new Response(JSON.stringify(o), { headers: { 'Content-Type': 'application/json' } })
const of_ = window.fetch
window.fetch = async (url, opts) => {
  const s = String(url)
  // cached optimize result so the panel renders its full analysed state
  if (s.includes('/seo/optimize-cache/')) return J({ cached: {
    title_score: 64,
    breakdown: { length: 18, front_loading: 10, power_words: 8, numbers: 0, question: 0, hook_format: 7, keyword_relevance: 8, viral_format: 6 },
    suggested_titles: [
      { title: 'I spent 24 hours in a tiny Nairobi apartment (the real cost)', why: 'Specific number + place + stakes' },
      { title: 'The truth about living alone in Nairobi at 24', why: 'Curiosity + relatable anxiety' },
    ],
    description: { type: 'story', text: 'In this video I break down exactly what a month in a Nairobi one-bed costs...' },
    hook: { type: 'curiosity', text: 'What nobody tells you about renting alone here.' },
  } })
  if (s.startsWith('http')) return of_(url, opts)
  return J({})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement('div', { style: { padding: '24px', minHeight: '100vh', background: 'var(--yd-paper)' } },
    React.createElement(VideoOptimizePanel, {
      video: { video_id: 'dQw4w9WgXcQ', title: 'house tour', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg', views: 9200, likes: 300 },
      onClose: () => {}, onVideoUpdated: () => {}, plan: 'growth', freeTierFeatures: {},
    })
  )
)
