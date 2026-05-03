/**
 * Pre-render the landing page to static HTML so AI crawlers (ChatGPT, Claude,
 * Perplexity) and non-JS-executing search bots see real content instead of an
 * empty <div id="root">.
 *
 * Flow: spin up a tiny static server pointed at dist/, navigate Puppeteer to
 * "/", wait for React to render, snapshot the HTML, write back to
 * dist/index.html (overwriting the SPA shell). Routes we don't pre-render fall
 * back to the SPA shell as before.
 *
 * Runs on the developer's machine at build time (npm run build). Railway never
 * executes this — it only serves the resulting static files.
 */

import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { writeFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import puppeteer from 'puppeteer'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
const DIST       = resolve(__dirname, '..', 'dist')
const PORT       = 4173

// Routes to pre-render. Keep this conservative — only public, indexable
// routes that benefit from being readable to AI crawlers without JS.
// Auth-required routes (/dashboard, /settings, /auth/*) MUST NOT be added.
const ROUTES = [
  '/',
]

// Tiny static file server. Serves dist/<path> if it's a file; otherwise
// returns dist/index.html (SPA fallback) so the React router can handle the
// route inside Puppeteer.
function startServer() {
  return new Promise((res, rej) => {
    const server = createServer(async (req, response) => {
      try {
        const url = new URL(req.url, `http://localhost:${PORT}`)
        let path = url.pathname.replace(/\/$/, '') || '/index.html'
        let filePath = join(DIST, path)

        let s
        try { s = await stat(filePath) } catch { s = null }

        if (!s || s.isDirectory()) {
          filePath = join(DIST, 'index.html')
        }

        const buf = await readFile(filePath)
        const contentType =
          filePath.endsWith('.html') ? 'text/html; charset=utf-8' :
          filePath.endsWith('.js')   ? 'application/javascript; charset=utf-8' :
          filePath.endsWith('.css')  ? 'text/css; charset=utf-8' :
          filePath.endsWith('.svg')  ? 'image/svg+xml' :
          filePath.endsWith('.png')  ? 'image/png' :
          filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') ? 'image/jpeg' :
          filePath.endsWith('.json') ? 'application/json' :
          'application/octet-stream'
        response.setHeader('Content-Type', contentType)
        response.end(buf)
      } catch (err) {
        response.statusCode = 500
        response.end(`prerender server error: ${err.message}`)
      }
    })
    server.listen(PORT, '127.0.0.1', () => res(server))
    server.on('error', rej)
  })
}

async function main() {
  console.log('[prerender] starting static server on :' + PORT)
  const server = await startServer()

  console.log('[prerender] launching headless Chromium')
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    for (const route of ROUTES) {
      console.log(`[prerender] rendering ${route}`)
      const page = await browser.newPage()
      // Desktop viewport — matches the SSR-safe default in useBreakpoint so
      // hydration on the client doesn't see a width mismatch on first paint.
      await page.setViewport({ width: 1280, height: 800 })

      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: 'networkidle0',
        timeout: 30_000,
      })

      // Belt-and-suspenders: make sure React has actually rendered something
      // into #root before snapshotting.
      await page.waitForFunction(
        () => {
          const r = document.getElementById('root')
          return r && r.children.length > 0
        },
        { timeout: 15_000 },
      )

      const html = await page.content()

      // Mark the doc as pre-rendered so main.jsx knows to hydrate (vs render).
      const stamped = html.replace(
        '<html lang="en">',
        '<html lang="en" data-prerendered="true">',
      )

      const outPath = route === '/'
        ? join(DIST, 'index.html')
        : join(DIST, route.replace(/^\//, ''), 'index.html')

      await writeFile(outPath, stamped, 'utf-8')
      console.log(`[prerender] wrote ${outPath}`)

      await page.close()
    }
  } finally {
    await browser.close()
    server.close()
  }

  console.log('[prerender] done')
}

main().catch(err => {
  console.error('[prerender] failed:', err)
  process.exit(1)
})
