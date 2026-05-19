/* SEO Studio standalone preview — dark. ?tab=reports drives the Reports list. */
import React from 'react'
import ReactDOM from 'react-dom/client'
import SeoOptimizer from './src/pages/SeoOptimizer.jsx'

const J = (o) => new Response(JSON.stringify(o), { headers: { 'Content-Type': 'application/json' } })
const of_ = window.fetch
const REPORTS = [
  { id: 1, title: 'I Tried Living On $1 For 24 Hours (Brutal)', confirmed_keyword: 'budget challenge',
    result: { suggestions: ['a', 'b', 'c', 'd'] }, desc_result: { text: 'x' },
    updated_at: new Date(Date.now() - 3 * 3600e3).toISOString() },
  { id: 2, title: 'How I Grew My Channel From 0 to 50K In 90 Days', confirmed_keyword: 'channel growth',
    result: { suggestions: ['a', 'b'] }, desc_result: null,
    updated_at: new Date(Date.now() - 2 * 86400e3).toISOString() },
  { id: 3, title: 'The Truth About YouTube Automation Nobody Tells You',
    result: { suggestions: [] }, desc_result: { text: 'y' },
    updated_at: new Date(Date.now() - 6 * 86400e3).toISOString() },
]
window.fetch = async (url, opts) => {
  const s = String(url)
  if (s.includes('/seo/reports')) return J({ reports: REPORTS })
  if (s.includes('/seo/intent-options')) return J({ options: [] })
  if (s.startsWith('http')) return of_(url, opts)
  return J({})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement('div', { style: { padding: '36px 24px', minHeight: '100vh', background: '#0e0e10' } },
    React.createElement(SeoOptimizer, {
      onNavigate: () => {}, plan: 'growth', freeTierFeatures: {}, videos: [],
    })
  )
)
