import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initUtm } from './utm.js'

// Capture UTM attribution off the URL on first paint and install the
// /auth/login click interceptor, see utm.js.
initUtm()

/* ── Lazy-loaded third-party scripts ──────────────────────────────────────
 *
 * Paddle and Affonso used to load on initial parse, dragging
 * profitwell.js, paddle.css, and the Affonso pixel onto the critical path
 * (~1.3s of LCP delay on slow 4G per Lighthouse). They're now loaded:
 *   1. On the user's first interaction (mousemove, scroll, keydown, touch)
 *   2. Or after a 2.5s timeout if no interaction has happened
 * whichever comes first. By that point LCP has long resolved, so they
 * stop costing us perf score, while still being ready before any user
 * clicks a checkout CTA or scrolls past the hero.
 *
 * Behavioral safety:
 *  - openCheckout() and initPaddleRetain() in checkout.js await
 *    window.__paddleReady() before calling Paddle.Checkout.open or
 *    Paddle.Initialize, so the click flow works regardless of whether
 *    the script has loaded yet.
 *  - Affonso attribution still works for any session lasting >2.5s,
 *    which covers anyone who reads the hero or scrolls.
 *  - During the prerender build, Puppeteer sets navigator.webdriver=true.
 *    We skip third-party loading so the Paddle/Affonso scripts never end
 *    up baked into the prerendered HTML snapshots.
 */

const PADDLE_TOKEN = 'live_2af860b645fca6f106c9d79f8d2'

let paddleReadyPromise = null
function loadPaddle() {
  if (paddleReadyPromise) return paddleReadyPromise
  paddleReadyPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    s.async = true
    s.onload = () => {
      try {
        window.Paddle.Initialize({ token: PADDLE_TOKEN })
      } catch (err) {
        // If Initialize throws, still resolve so callers don't hang. They
        // can re-Initialize with their own token (e.g., initPaddleRetain).
        console.error('[paddle] Initialize failed:', err)
      }
      resolve(window.Paddle)
    }
    s.onerror = () => reject(new Error('paddle.js failed to load'))
    document.head.appendChild(s)
  })
  return paddleReadyPromise
}

let affonsoLoaded = false
function loadAffonso() {
  if (affonsoLoaded) return
  affonsoLoaded = true
  const s = document.createElement('script')
  s.src   = 'https://cdn.affonso.io/js/pixel.min.js'
  s.async = true
  s.defer = true
  s.setAttribute('data-affonso',         'cmoifufi500062qvcxewv6vqo')
  s.setAttribute('data-cookie_duration', '30')
  document.head.appendChild(s)
}

// Skip the lazy load entirely during the Puppeteer prerender pass so the
// snapshot HTML stays free of Paddle/Affonso script tags.
if (typeof navigator !== 'undefined' && !navigator.webdriver) {
  const trigger = () => {
    loadPaddle().catch(() => {}) // failure is non-fatal until checkout
    loadAffonso()
  }
  const events = ['mousemove', 'keydown', 'touchstart', 'scroll']
  const onceTrigger = () => {
    trigger()
    events.forEach(e => window.removeEventListener(e, onceTrigger))
  }
  events.forEach(e => window.addEventListener(e, onceTrigger, { passive: true, once: true }))
  setTimeout(trigger, 2500)
}

// checkout.js awaits this before calling Paddle.Checkout.open or
// Paddle.Initialize. Returning the promise means callers either get the
// resolved Paddle global (already loaded) or wait for the in-flight load.
window.__paddleReady = loadPaddle

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
