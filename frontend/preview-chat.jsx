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
    content: `Your **average CTR slipped from 5.8% in October to 3.2%** over the last 30 days. That fits a thumbnail-fatigue signal: you ran the same yellow-highlight style across six uploads and the audience stopped clicking.

### Three concrete moves

1. **Tighten the title-thumbnail pair.** The title should answer the visual question. \`Why Your Intro Is Killing Retention\` works because the thumbnail shows a stopwatch.
2. **Test a fresh palette.** Drop the yellow on the next three uploads, try a deep teal or charcoal background instead.
3. **Watch the first 24 hours.** If the new style holds above 4% CTR, keep going. If it drops below 2.5%, the framing is off, not the colour.

> The CTR drop is reversible. The next three uploads are the lever.`,
    created_at: new Date(Date.now() - 30000).toISOString(),
    sources: ['Channel stats', '20 recent videos', '90d analytics'],
  },
  { role: 'user', content: 'Compare me to my top competitor', created_at: new Date(Date.now() - 10000).toISOString() },
  {
    role: 'assistant',
    content: `**Moureen Ngigi** is your closest tracked competitor by niche. Here's how you stack up:

- **Subscribers:** she has 268K, you have 880.
- **Avg views per video:** she pulls 56.3K, you pull around 1,450.
- **Upload cadence:** she ships 2x per week, you ship 1x every 15 days.

The view-to-subscriber ratio matters more than the raw numbers. Her ratio is **0.21** (good but not viral). Yours is **1.65** (algorithmically very strong for your size). YouTube is already pushing your videos hard, you just need more shots on goal.`,
    created_at: new Date(Date.now() - 5000).toISOString(),
    sources: ['Channel stats', '2 competitors'],
  },
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
