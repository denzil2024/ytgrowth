/*
 * Preview harness for ChatCoach. Mounts the component standalone with
 * mocked fetch responses so I can render the empty + active states in
 * isolation and screenshot via Playwright before shipping any design
 * change. Not shipped to production — only served by `vite dev` on the
 * preview-chat.html entry.
 *
 * Query params:
 *   ?state=empty   (default) — no messages, shows hero + composer + pills
 *   ?state=active           — pre-seeded conversation, scroll viewport
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import ChatCoach from './src/pages/ChatCoach.jsx'

const params = new URLSearchParams(window.location.search)
const stateMode = params.get('state') || 'empty'

const MOCK_SOURCES = [
  'Channel stats',
  '20 recent videos',
  '90d analytics',
  'Audit',
  '2 competitors',
  '1 SEO edit',
  '7 milestones',
]

const SEED_MESSAGES = stateMode === 'active' ? [
  { role: 'user', content: 'Why are my CTRs dropping?', created_at: new Date(Date.now() - 60000).toISOString() },
  {
    role: 'assistant',
    content: "Looking at your last 20 uploads, your average CTR slipped from 5.8% in October to 3.2% in the last 30 days. The pattern fits a thumbnail-fatigue signal: you ran the same yellow-highlight visual style across six consecutive videos and the audience stopped clicking.\n\nThree concrete moves: tighten your title-thumbnail pair (the title should answer the visual question), test a fresh color palette on the next three thumbnails, and watch the first 24 hours of CTR closely. If the new style holds above 4%, keep going.",
    created_at: new Date(Date.now() - 30000).toISOString(),
    sources: ['Channel stats', '20 recent videos', '90d analytics'],
  },
  { role: 'user', content: 'Compare me to my top competitor', created_at: new Date(Date.now() - 10000).toISOString() },
] : []

// Mock fetch for any /chat/* or /auth/* endpoints the component hits.
const origFetch = window.fetch
window.fetch = async (url, opts) => {
  const u = String(url)
  if (u.includes('/chat/state')) {
    return new Response(JSON.stringify({
      messages:  SEED_MESSAGES,
      allowance: 100,
      used:      stateMode === 'active' ? 12 : 4,
      plan:      'pro',
      sources:   MOCK_SOURCES,
    }), { headers: { 'Content-Type': 'application/json' } })
  }
  if (u.includes('/chat/send')) {
    return new Response(JSON.stringify({
      message: {
        role: 'assistant',
        content: 'Mock response from preview harness.',
        created_at: new Date().toISOString(),
        sources: MOCK_SOURCES.slice(0, 3),
      },
      allowance: 100,
      used:      (stateMode === 'active' ? 12 : 4) + 1,
      sources:   MOCK_SOURCES,
    }), { headers: { 'Content-Type': 'application/json' } })
  }
  if (u.includes('/chat/new')) {
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
  }
  return origFetch(url, opts)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement('div', {
    // Approximate the app shell padding so the preview matches the real
    // app layout (sidebar + topbar offsets are stripped in this harness).
    style: { padding: '36px 24px', height: '100vh', boxSizing: 'border-box', background: '#fafafb' }
  },
    React.createElement(ChatCoach, {
      onNavigate: (target) => console.log('[preview] navigate to', target),
      billingPlan: 'pro',
    })
  )
)
