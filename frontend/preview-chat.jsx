/*
 * Preview harness for ChatCoach. Mounts the component standalone with
 * mocked fetch responses so I can render every state in isolation and
 * screenshot via Playwright before shipping any design change. Not
 * served in production.
 *
 * Query params:
 *   ?state=empty    (default) — no conversations, no messages
 *   ?state=active            — pre-seeded active conversation, with a rail of past chats
 *   ?state=rail              — empty active conversation but past chats in the rail
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

const ACTIVE_CONV_ID = 42

const SEED_CONVERSATIONS = (stateMode === 'active' || stateMode === 'rail') ? [
  { id: ACTIVE_CONV_ID, title: 'Why are my CTRs dropping?',     created_at: new Date(Date.now() - 3600_000).toISOString(),     last_message_at: new Date(Date.now() - 10_000).toISOString() },
  { id: 41,             title: 'Thumbnail style review',         created_at: new Date(Date.now() - 86400_000).toISOString(),   last_message_at: new Date(Date.now() - 80000_000).toISOString() },
  { id: 40,             title: 'Compare to Moureen Ngigi',       created_at: new Date(Date.now() - 86400_000 * 2).toISOString(), last_message_at: new Date(Date.now() - 86400_000 * 2 + 600_000).toISOString() },
  { id: 39,             title: 'Best time to post on weekdays',  created_at: new Date(Date.now() - 86400_000 * 5).toISOString(), last_message_at: new Date(Date.now() - 86400_000 * 5).toISOString() },
  { id: 38,             title: 'Why my long-form is stuck',      created_at: new Date(Date.now() - 86400_000 * 12).toISOString(), last_message_at: new Date(Date.now() - 86400_000 * 12).toISOString() },
] : []

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

const origFetch = window.fetch
window.fetch = async (url, opts) => {
  const u = String(url)
  if (u.includes('/chat/state')) {
    return new Response(JSON.stringify({
      messages:        SEED_MESSAGES,
      conversation_id: SEED_CONVERSATIONS.length ? ACTIVE_CONV_ID : null,
      conversations:   SEED_CONVERSATIONS,
      allowance:       100,
      used:            stateMode === 'active' ? 12 : 4,
      plan:            'pro',
      sources:         MOCK_SOURCES,
    }), { headers: { 'Content-Type': 'application/json' } })
  }
  if (u.includes('/chat/conversations') && (opts?.method === 'DELETE')) {
    return new Response(JSON.stringify({ ok: true, conversations: SEED_CONVERSATIONS.slice(1) }), { headers: { 'Content-Type': 'application/json' } })
  }
  if (u.includes('/chat/conversations')) {
    return new Response(JSON.stringify({ conversations: SEED_CONVERSATIONS }), { headers: { 'Content-Type': 'application/json' } })
  }
  if (u.includes('/chat/new')) {
    return new Response(JSON.stringify({
      conversation_id:    999,
      conversation_title: null,
      conversations:      [{ id: 999, title: null, created_at: new Date().toISOString(), last_message_at: new Date().toISOString() }, ...SEED_CONVERSATIONS],
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
      conversation_id:    ACTIVE_CONV_ID,
      conversation_title: 'Why are my CTRs dropping?',
      conversations:      SEED_CONVERSATIONS,
      allowance:          100,
      used:               (stateMode === 'active' ? 12 : 4) + 1,
      sources:            MOCK_SOURCES,
    }), { headers: { 'Content-Type': 'application/json' } })
  }
  return origFetch(url, opts)
}

/* Faithful Dashboard shell. The real app renders every page inside:
 *   scroll-shell (flex:1, overflow:auto, background #fafafb)
 *     └ 52px topbar
 *     └ content box  (padding: 36px 40px 72px)
 *          └ <Page/>
 * The old harness used `padding: 36px 24px; height: 100vh` with no
 * topbar — which is exactly why Chat looked fine here while it
 * overflowed and read as a slab in production. This now mirrors the
 * real shell so screenshots reflect what the user actually sees. */
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
      React.createElement(ChatCoach, {
        onNavigate: (target) => console.log('[preview] navigate to', target),
        billingPlan: 'pro',
      })
    )
  )
)
