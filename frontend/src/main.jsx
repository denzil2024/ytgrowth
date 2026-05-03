import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initUtm } from './utm.js'

// Capture UTM attribution off the URL on first paint and install the
// /auth/login click interceptor — see utm.js.
initUtm()

// Initialise Paddle on every page load (public baseline — no customer context yet).
// Authenticated pages call initPaddleRetain() via UsageBar to add pwCustomer.
Paddle.Initialize({ token: 'live_2af860b645fca6f106c9d79f8d2' })

// If scripts/prerender.js stamped the doc as pre-rendered, hydrate the
// existing markup so AI crawlers see real HTML and users don't get a
// flash-of-empty-content. Otherwise fall back to a normal client render.
const rootEl = document.getElementById('root')
const tree = (
  <StrictMode>
    <App />
  </StrictMode>
)
if (document.documentElement.dataset.prerendered === 'true' && rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, tree)
} else {
  createRoot(rootEl).render(tree)
}
