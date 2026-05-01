/* UTM attribution capture.
 *
 * On app boot we read utm_* params off the URL and stash them in
 * sessionStorage so they survive intra-app navigation but reset per browser
 * session. Any click on a /auth/login link is intercepted globally and the
 * stored UTMs are appended as query params, so the backend can persist them
 * against the new UserAccount row in the OAuth callback.
 *
 * This file is loaded once from main.jsx — no React tree involvement.
 */

const STORAGE_KEY = 'ytg_utms'
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

function readStored() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeStored(obj) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
  } catch {}
}

/* Read utm_* off the current URL. If we find any, store them — otherwise
 * leave whatever's already in sessionStorage from an earlier page in the
 * same tab. We don't clear stored UTMs on a UTM-less navigation because
 * users often land via a tagged URL and click around before signing up. */
function captureFromUrl() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const found = {}
  UTM_KEYS.forEach(k => {
    const v = params.get(k)
    if (v) found[k] = v
  })
  if (Object.keys(found).length > 0) {
    writeStored({ ...readStored(), ...found })
  }
}

/* Build a /auth/login URL with stored UTMs appended. Use this anywhere you
 * would otherwise hard-code "/auth/login" in JS (e.g. window.location.href). */
export function loginUrl() {
  const utms = readStored()
  const qs = new URLSearchParams(utms).toString()
  return qs ? `/auth/login?${qs}` : '/auth/login'
}

/* Document-wide interceptor: rewrite any clicked anchor pointing at
 * /auth/login so it carries the stored UTMs. Runs in capture phase to fire
 * before the browser follows the link. Tolerant of relative + absolute
 * hrefs and ignores any link that already has a utm_source. */
function installLinkInterceptor() {
  if (typeof document === 'undefined') return
  document.addEventListener('click', e => {
    const a = e.target && e.target.closest && e.target.closest('a[href]')
    if (!a) return
    const href = a.getAttribute('href') || ''
    const isLogin = href === '/auth/login' || href.startsWith('/auth/login?')
    if (!isLogin) return
    if (href.includes('utm_source=')) return
    const next = loginUrl()
    if (next !== href) a.setAttribute('href', next)
  }, true)
}

export function initUtm() {
  captureFromUrl()
  installLinkInterceptor()
}
