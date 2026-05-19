/* Shared gated/onboarding components — dark pass preview.
   Default: stacked column of every non-modal state.
   ?modal=1 : just the UpsellModal open (fixed overlay). */
import React from 'react'
import ReactDOM from 'react-dom/client'
import UpsellGate from './src/components/UpsellGate.jsx'
import UpsellModal from './src/components/UpsellModal.jsx'
import OnboardingCard from './src/components/OnboardingCard.jsx'
import AuditProgress from './src/components/AuditProgress.jsx'

const gateProps = {
  title: 'Unlock Outlier Scoring',
  description: 'See which videos in your niche are massively over-performing, and exactly why.',
  bullets: ['Niche-relative multipliers, not raw views', 'Why each outlier broke out', 'Refreshed every week'],
  note: 'Outlier Scoring requires 3 credits.',
}
const Mock = () => React.createElement('div', { style: { padding: 40, color: '#a1a1aa' } },
  Array.from({ length: 8 }).map((_, i) =>
    React.createElement('div', { key: i, style: { height: 56, background: 'linear-gradient(180deg,#1e1e24 0%,#18181c 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, marginBottom: 12 } })))

const Section = ({ label, children }) =>
  React.createElement('div', { style: { marginBottom: 40 } },
    React.createElement('div', { style: { fontFamily: 'Inter, system-ui', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717a', marginBottom: 12 } }, label),
    children)

const isModal = new URLSearchParams(location.search).get('modal') === '1'

const root = ReactDOM.createRoot(document.getElementById('root'))
if (isModal) {
  root.render(React.createElement(UpsellModal, { open: true, onClose: () => {}, ...gateProps }))
} else {
  root.render(
    React.createElement('div', { style: { maxWidth: 1040, margin: '0 auto', padding: '40px 24px', background: '#0e0e10', minHeight: '100vh' } },
      React.createElement(Section, { label: 'UpsellGate — solo' }, React.createElement(UpsellGate, gateProps)),
      React.createElement(Section, { label: 'UpsellGate — with blurred teaser' }, React.createElement(UpsellGate, { ...gateProps, showPackLink: true, previewContent: React.createElement(Mock) })),
      React.createElement(Section, { label: 'OnboardingCard — in progress' }, React.createElement(OnboardingCard, { channelName: 'Life with Nthenya', trackedCompetitor: true, optimized: false, exploredIdeas: false, onNavigate: () => {}, onDismiss: () => {} })),
      React.createElement(Section, { label: 'OnboardingCard — all done' }, React.createElement(OnboardingCard, { channelName: 'Life with Nthenya', trackedCompetitor: true, optimized: true, exploredIdeas: true, onNavigate: () => {}, onDismiss: () => {} })),
      React.createElement(Section, { label: 'AuditProgress — running' }, React.createElement(AuditProgress, { done: false })),
      React.createElement(Section, { label: 'AuditProgress — done' }, React.createElement(AuditProgress, { done: true })),
    )
  )
}
