/*
 * Preview harness for the new-signup OnboardingCard. Renders it inside a
 * faithful copy of where it lives in the app: the Feed (.ov-page, Geist,
 * 1040 centered) sitting in the Dashboard content area (52px topbar +
 * 36/40/72 padding). Mocks the new-user signal states.
 *
 * Query params (?state=):
 *   fresh   (default) — 1/4, only channel connected
 *   comp              — 2/4, competitor tracked, "Optimize a video" active
 *   seo               — 3/4, only "Find your next idea" left
 *   done              — 4/4, collapsed "You're all set" state
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import OnboardingCard from './src/components/OnboardingCard.jsx'

const MODE = new URLSearchParams(window.location.search).get('state') || 'fresh'

const SIG = {
  fresh: { trackedCompetitor: false, optimized: false, exploredIdeas: false },
  comp:  { trackedCompetitor: true,  optimized: false, exploredIdeas: false },
  seo:   { trackedCompetitor: true,  optimized: true,  exploredIdeas: false },
  done:  { trackedCompetitor: true,  optimized: true,  exploredIdeas: true  },
}[MODE] || {}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement('div', {
    style: { minHeight: '100vh', background: '#fafafb', boxSizing: 'border-box' },
  },
    React.createElement('div', { style: { height: 52, background: '#fff', borderBottom: '1px solid rgba(10,10,15,0.06)' } }),
    React.createElement('div', { style: { padding: '36px 40px 72px' } },
      React.createElement('div', { className: 'ov-page', style: { maxWidth: 1040, margin: '0 auto' } },
        React.createElement(OnboardingCard, {
          channelName: 'Royal Blue Media',
          trackedCompetitor: SIG.trackedCompetitor,
          optimized: SIG.optimized,
          exploredIdeas: SIG.exploredIdeas,
          onNavigate: (t) => console.log('[preview] navigate', t),
          onDismiss: () => console.log('[preview] dismiss'),
        }),
        // A faint placeholder of the Feed below, so the card is seen in context.
        React.createElement('div', {
          style: { height: 120, borderRadius: 14, border: '1px dashed rgba(10,10,15,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(10,10,15,0.30)', fontSize: 13 },
        }, 'your Feed continues here …'),
      )
    )
  )
)
