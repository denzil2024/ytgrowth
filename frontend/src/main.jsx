import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initUtm } from './utm.js'
import { isChannelBrain } from './brandHost.js'

// Capture UTM attribution off the URL on first paint and install the
// /auth/login click interceptor, see utm.js.
initUtm()

// On channelbrain.online the page title must read "ChannelBrain", not
// "YTGrowth" — the OAuth consent screen (app name ChannelBrain) has to match
// the home page. Per-page effects set document.title with a hardcoded
// "YTGrowth"; watch the <title> node and swap it on that host only. ytgrowth.io
// is untouched.
if (isChannelBrain()) {
  const titleEl = document.querySelector('title')
  const swap = () => {
    if (titleEl && titleEl.textContent.includes('YTGrowth')) {
      titleEl.textContent = titleEl.textContent.replace(/YTGrowth/g, 'ChannelBrain')
    }
  }
  swap()
  if (titleEl) new MutationObserver(swap).observe(titleEl, { childList: true })
}

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

// Google gtag.js library. The inline snippet in index.html already primed
// window.dataLayer and queued gtag('js') + gtag('config', ...) for both the
// Ads (AW-) and GA4 (G-) properties, so simply attaching the library here
// flushes that queue and fires the pageview. Deferring the library (instead
// of the eager <script async> it replaced) keeps ~310 KB of render-time JS
// off the mobile critical path, where it was pushing LCP from ~4s to ~11s.
let gtagLoaded = false
function loadGtag() {
  if (gtagLoaded) return
  gtagLoaded = true
  const s = document.createElement('script')
  s.src = 'https://www.googletagmanager.com/gtag/js?id=AW-10883831151'
  s.async = true
  document.head.appendChild(s)
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
    loadGtag()
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

// Cross-domain checkout handoff. Paddle only approves ytgrowth.io, so a
// checkout started on channelbrain.online redirects here with the resolved
// price + attribution in the URL (see checkout.js). Open the overlay, then
// strip the params so a refresh doesn't re-trigger it. Skipped during the
// Puppeteer prerender pass (navigator.webdriver).
if (typeof navigator !== 'undefined' && !navigator.webdriver) {
  const q = new URLSearchParams(window.location.search)
  if (q.get('pco') === '1' && q.get('price')) {
    const price      = q.get('price')
    const channel_id = q.get('ch') || ''
    const email      = q.get('em') || ''
    loadPaddle().then(() => {
      window.Paddle.Checkout.open({
        items: [{ priceId: price, quantity: 1 }],
        customData: { channel_id, email },
        customer: email ? { email } : undefined,
      })
    }).catch(() => {})
    ;['pco', 'price', 'ch', 'em'].forEach(k => q.delete(k))
    const clean = window.location.pathname + (q.toString() ? '?' + q.toString() : '')
    window.history.replaceState({}, '', clean)
  }
}

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
