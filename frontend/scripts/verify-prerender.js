/**
 * Verify that every public route declared in scripts/prerender.js has a
 * corresponding prerendered HTML file in dist/, and that the file actually
 * carries body content (not just the empty SPA shell).
 *
 * Why: in a previous deploy, a build was run somewhere without the
 * prerender step (e.g., `vite build` directly, which Vite cleans dist
 * before rewriting), and the resulting commit dropped every prerendered
 * subdirectory. Crawlers were back to fetching `<div id="root"></div>`
 * for every non-homepage route. This script makes that failure mode
 * impossible to ship: it runs at the end of `npm run build` and from a
 * git pre-commit hook, and it exits non-zero if any expected file is
 * missing, empty, or shell-only.
 *
 * Run manually: `node scripts/verify-prerender.js` from frontend/.
 */

import { readFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
const ROOT       = resolve(__dirname, '..')
const DIST       = join(ROOT, 'dist')
const PRERENDER  = join(__dirname, 'prerender.js')
const POSTS_SRC  = join(ROOT, 'src', 'blog', 'posts.jsx')

/* Pull the route list from prerender.js by grepping the buildRoutes()
   array literal. Avoids importing the file (which would also import
   puppeteer and try to launch chromium just for the route list). */
async function readPrerenderRoutes() {
  const src = await readFile(PRERENDER, 'utf-8')
  const fnMatch = src.match(/async function buildRoutes\([^)]*\)\s*\{([\s\S]*?)\n\}/)
  if (!fnMatch) throw new Error('[verify] could not find buildRoutes() in prerender.js')
  const body = fnMatch[1]

  const literals = [...body.matchAll(/['"](\/[^'"]*)['"]/g)].map(m => m[1])

  const postsSrc = await readFile(POSTS_SRC, 'utf-8')
  const after = postsSrc.split(/export\s+const\s+posts\s*=\s*\[/)[1] || ''
  const slugs = [...after.matchAll(/^\s*slug:\s*['"]([^'"]+)['"]/gm)].map(m => m[1])

  return [...new Set([...literals, ...slugs.map(s => `/blog/${s}`)])]
}

function outputPathForRoute(route) {
  if (route === '/') return join(DIST, 'index.html')
  const trimmed = route.replace(/^\//, '')
  return join(DIST, trimmed, 'index.html')
}

const SHELL_MARKERS = [
  '<div id="root"></div>',
  '<div id=\\"root\\"></div>',
]

async function check(route) {
  const path = outputPathForRoute(route)
  let s
  try { s = await stat(path) } catch { return { route, path, status: 'missing' } }
  if (!s.isFile() || s.size < 1024) {
    return { route, path, status: 'empty', size: s.size }
  }
  const html = await readFile(path, 'utf-8')
  for (const m of SHELL_MARKERS) {
    if (html.includes(m)) return { route, path, status: 'shell-only' }
  }
  return { route, path, status: 'ok', size: s.size }
}

async function main() {
  const routes = await readPrerenderRoutes()
  const results = await Promise.all(routes.map(check))

  const failed = results.filter(r => r.status !== 'ok')
  if (failed.length === 0) {
    console.log(`[verify] OK: ${routes.length} routes prerendered correctly`)
    return
  }

  console.error(`[verify] FAILED: ${failed.length}/${routes.length} routes have problems\n`)
  for (const f of failed) {
    console.error(`  - ${f.route}`)
    console.error(`    expected: ${f.path}`)
    console.error(`    status:   ${f.status}${f.size != null ? ` (size=${f.size})` : ''}`)
  }
  console.error(`\n[verify] Run \`npm run build\` to regenerate the prerendered files.`)
  console.error(`[verify] Do NOT commit dist/ until this passes.\n`)
  process.exit(1)
}

main().catch(err => {
  console.error('[verify] script error:', err)
  process.exit(1)
})
