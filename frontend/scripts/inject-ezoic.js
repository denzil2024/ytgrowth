/**
 * Post-prerender Ezoic injector.
 *
 * The Ezoic JavaScript (standalone) header script (sa.min.js + ezstandalone
 * init + analytics.js) MUST live in the served HTML, but it must NOT be present
 * while Puppeteer prerenders. If it is, sa.min.js executes during the snapshot
 * and bakes Ezoic's entire runtime (go.ezodn.com loaders, identity.js, the
 * __ez.queue bootstrap, and localhost-scoped consent cookies from the build
 * server) straight into every static page. On a real visit that frozen runtime
 * loads AND sa.min.js runs again, double-loading Ezoic's infra, which their
 * docs forbid and which skews ad serving and analytics.
 *
 * So Ezoic is kept out of frontend/index.html (the prerender input) and added
 * here, after prerender, as plain static <script> tags. The result is the
 * clean three-line header on every page with no executed-at-build-time junk.
 *
 * Idempotent: pages that already carry the script are skipped, so re-running
 * the build (or this script) never duplicates the tags.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { globSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist')

// Serialized form Puppeteer emits (no self-closing slash). Stable anchor.
const ANCHOR = '<meta name="viewport" content="width=device-width, initial-scale=1.0">'

const EZOIC = `
    <!-- Ezoic JavaScript (standalone) integration. Injected post-prerender by
         scripts/inject-ezoic.js so sa.min.js never executes during the
         Puppeteer snapshot. Header script alone renders no ads; ad units only
         appear where an ezoic-pub-ad-placeholder div is added (blog and public
         pages only). Must not be deferred, lazy-loaded, or moved lower. -->
    <script async src="//www.ezojs.com/ezoic/sa.min.js"></script>
    <script>
      window.ezstandalone = window.ezstandalone || {};
      ezstandalone.cmd = ezstandalone.cmd || [];
    </script>
    <script src="//ezoicanalytics.com/analytics.js"></script>`

// Gated OFF until Ezoic actually approves the account. Pre-approval the
// scripts serve zero ads (no revenue to protect) but still load ~400KB of
// render-blocking, main-thread JS (sa.min.js -> ezorca, identity, ID5, ezodn)
// that tanks the mobile PageSpeed score. The ezoic-site-verification meta in
// index.html stays, so approval can still proceed. Re-enable once live:
//   EZOIC_ENABLED=1 npm run build
if (!process.env.EZOIC_ENABLED) {
  console.log('[inject-ezoic] skipped: Ezoic not yet approved. Set EZOIC_ENABLED=1 to re-enable once the account is live.')
  process.exit(0)
}

const files = globSync('**/index.html', { cwd: DIST }).map((f) => join(DIST, f))

let injected = 0
let skipped = 0
let missingAnchor = 0

for (const file of files) {
  const html = readFileSync(file, 'utf8')
  if (html.includes('ezojs.com/ezoic/sa.min.js')) {
    skipped++
    continue
  }
  if (!html.includes(ANCHOR)) {
    missingAnchor++
    console.warn(`[inject-ezoic] anchor not found, skipped: ${file}`)
    continue
  }
  writeFileSync(file, html.replace(ANCHOR, ANCHOR + EZOIC))
  injected++
}

console.log(
  `[inject-ezoic] injected ${injected}, already-present ${skipped}, missing-anchor ${missingAnchor}, total ${files.length}`,
)

if (missingAnchor > 0) {
  console.error('[inject-ezoic] FAILED: some pages had no viewport anchor — Ezoic header missing on those pages.')
  process.exit(1)
}
