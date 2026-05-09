/**
 * Pre-render public pages to static HTML so AI crawlers (ChatGPT, Claude,
 * Perplexity) and non-JS-executing search bots see real content instead of an
 * empty <div id="root">.
 *
 * Flow: spin up a tiny static server pointed at dist/, navigate Puppeteer to
 * each route, wait for React to render, snapshot the HTML, write back to
 * dist/<route>/index.html (overwriting the SPA shell for the index route, and
 * creating a per-route subdirectory with index.html for nested routes).
 * FastAPI serves the matching dist/<path>/index.html when present; routes we
 * don't pre-render fall back to the SPA shell + per-route meta as before.
 *
 * Runs on the developer's machine at build time (npm run build). Railway
 * never executes this; it only serves the resulting static files.
 */

import { createServer } from 'node:http'
import { readFile, writeFile, stat, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import puppeteer from 'puppeteer'
import { CATEGORY_META } from '../src/data/youtubeStatsCategories.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
const DIST       = resolve(__dirname, '..', 'dist')
const POSTS_SRC  = resolve(__dirname, '..', 'src', 'blog', 'posts.jsx')
const PORT       = 4173
const SITE_ORIGIN = 'https://ytgrowth.io'

/* Per-route SEO meta, used when the React page does NOT set its own
 * document.title and meta description in a useEffect. Feature pages and
 * tool pages currently rely on the FastAPI catch-all to inject these via
 * _render_index_with_meta. Now that the catch-all serves the prerendered
 * file directly, prerender has to bake the per-route meta in itself.
 *
 * The /features/* entries here mirror ROUTE_META in app/main.py exactly.
 * Keep them in sync if you change one. The /tools/* entries are new and
 * don't have a counterpart in main.py (FastAPI was previously serving the
 * homepage default for those routes).
 *
 * Routes that DO self-set their meta (Blog.jsx, BlogPost.jsx, Contact.jsx,
 * Affiliate.jsx, Terms.jsx, Privacy.jsx, Refund.jsx) are intentionally
 * absent here. For those, the snapshot's title/description, written by the
 * page's useEffect, is authoritative.
 */
const META_BY_ROUTE = {
  '/features/channel-audit': {
    title:       'AI YouTube Channel Audit: Score and Priority Fixes',
    description: '10-dimension AI YouTube channel audit covering traffic, retention, CTR, SEO, and thumbnails. Scored, benchmarked vs your niche, with priority fixes.',
  },
  '/features/competitor-analysis': {
    title:       'YouTube Competitor Analysis: Track Up to 10 Channels',
    description: 'Track up to 10 YouTube competitors. AI surfaces winning title patterns, content gaps, and posting times you can copy. Free to start.',
  },
  '/features/seo-studio': {
    title:       'YouTube SEO Tool: Title and Description Optimizer',
    description: 'Score every YouTube title against search demand, keyword fit, and competitor patterns. Optimize descriptions for discovery. Apply via YouTube API.',
  },
  '/features/thumbnail-iq': {
    title:       'YouTube Thumbnail Analyzer: AI Score + CTR Tips',
    description: 'Two-layer YouTube thumbnail scoring. Algorithmic CTR check plus vision AI compared against winning thumbnails in your niche.',
  },
  '/features/keyword-research': {
    title:       'Free YouTube Keyword Research Tool with Real Data',
    description: 'Find low-competition YouTube keywords with real ranking data. Score by competitor size, view ceiling, and content freshness. Free tier included.',
  },
  '/features/outliers': {
    title:       'YouTube Outlier Finder: Spot Viral Videos in Your Niche',
    description: "Find YouTube videos that hit 5x, 10x, or 50x their channel's normal views in your niche. Outlier score, breakout channels, top thumbnails.",
  },
  '/tools/youtube-money-calculator': {
    title:       'Free YouTube Money Calculator: Estimate Channel Earnings',
    description: 'Estimate YouTube ad revenue from views, niche, and engagement. Niche-specific RPM ranges, monthly and yearly earnings, full math behind every estimate.',
  },
  '/tools/youtube-subscriber-money-calculator': {
    title:       'YouTube Subscriber Money Calculator: How Much Subs Pay',
    description: 'See how much your subscriber count is worth in ad revenue. View-per-subscriber ratios, niche CPM, monthly and yearly earnings. Free, no login.',
  },
  '/tools/youtube-channel-stats-checker': {
    title:       'Free YouTube Channel Stats Checker: Subs, Views, CTR',
    description: 'Look up subscriber count, total views, monthly uploads, and engagement for any public YouTube channel. Instant lookup, no login required.',
  },
  '/tools/youtube-thumbnail-downloader': {
    title:       'Free YouTube Thumbnail Downloader: HD, Max Res, JPG/PNG',
    description: 'Download any YouTube video thumbnail in seconds. Max-res, HQ, MQ, SD sizes in JPG and PNG. No watermark, no login, instant.',
  },
  '/youtube-stats': {
    title:       'Top YouTube Channels by Category 2026: Live Subscriber Rankings',
    description: 'Browse top YouTube channels in 14 niches: gaming, tech, beauty, finance, fitness, music, and more. Ranked by live subscriber count from YouTube\'s official API. Updated daily, free, no signup.',
  },
}

/* /youtube-stats/:slug pages — derived from the shared category metadata
 * so the SEO title and meta description on each landing page match the
 * runtime React page exactly. */
for (const cat of CATEGORY_META) {
  META_BY_ROUTE[`/youtube-stats/${cat.id}`] = {
    title:       `${cat.seoTitle} | YTGrowth`,
    description: cat.seoDescription,
  }
}

/* Discover blog slugs from the source data file. We slice from
 * `export const posts = [` so we never pick up the CATEGORIES `slug:` keys
 * that live above it. The line-anchored regex avoids matching slug strings
 * that appear inside post bodies.
 */
async function discoverBlogSlugs() {
  const src = await readFile(POSTS_SRC, 'utf-8')
  const after = src.split(/export\s+const\s+posts\s*=\s*\[/)[1] || ''
  const slugs = [...after.matchAll(/^\s*slug:\s*['"]([^'"]+)['"]/gm)].map(m => m[1])
  if (slugs.length === 0) throw new Error('[prerender] no blog slugs found in posts.jsx')
  return slugs
}

/* Routes to pre-render. All public, indexable pages. Auth-required routes
 * (/dashboard, /settings, /auth/*) MUST NOT be added.
 */
async function buildRoutes() {
  const slugs = await discoverBlogSlugs()
  return [
    '/',
    '/blog',
    ...slugs.map(s => `/blog/${s}`),
    '/features/channel-audit',
    '/features/competitor-analysis',
    '/features/seo-studio',
    '/features/thumbnail-iq',
    '/features/keyword-research',
    '/features/outliers',
    '/tools/youtube-money-calculator',
    '/tools/youtube-subscriber-money-calculator',
    '/tools/youtube-channel-stats-checker',
    '/tools/youtube-thumbnail-downloader',
    '/tools/youtube-thumbnail-resizer',
    '/tools/youtube-channel-name-generator',
    '/tools/youtube-video-ideas-generator',
    '/youtube-stats',
    '/youtube-stats/gaming',
    '/youtube-stats/tech',
    '/youtube-stats/beauty',
    '/youtube-stats/finance',
    '/youtube-stats/cooking',
    '/youtube-stats/fitness',
    '/youtube-stats/music',
    '/youtube-stats/education',
    '/youtube-stats/vlogs',
    '/youtube-stats/travel',
    '/youtube-stats/comedy',
    '/youtube-stats/sports',
    '/youtube-stats/entertainment',
    '/youtube-stats/news',
    '/contact',
    '/affiliate',
    '/terms',
    '/privacy',
    '/refund',
  ]
}

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

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

/* For routes in META_BY_ROUTE, use the canonical map values. For routes
 * not in the map (blog posts, /contact, /terms, etc.), use whatever the
 * React page wrote into the document via useEffect, which the snapshot
 * already contains. Either way we then sync canonical, og:url, og:title,
 * og:description, twitter:title, twitter:description so all of them agree.
 */
function bakeRouteMeta(html, route) {
  const docTitleMatch = html.match(/<title>([^<]*)<\/title>/i)
  const docDescMatch  = html.match(/<meta\s+name="description"\s+content="([^"]*)"\s*\/?>/i)
  const docTitle = docTitleMatch ? docTitleMatch[1] : ''
  const docDesc  = docDescMatch  ? docDescMatch[1]  : ''

  const override = META_BY_ROUTE[route]
  const title = override?.title       || docTitle
  const desc  = override?.description || docDesc
  const canonical = route === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${route}`

  let out = html

  if (override?.title) {
    out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(title)}</title>`)
  }
  if (override?.description) {
    out = out.replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${escapeAttr(desc)}" />`,
    )
  }

  out = out.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${escapeAttr(canonical)}" />`,
  )
  out = out.replace(
    /<meta property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${escapeAttr(canonical)}" />`,
  )
  if (title) {
    out = out.replace(
      /<meta property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${escapeAttr(title)}" />`,
    )
    out = out.replace(
      /<meta name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
    )
  }
  if (desc) {
    out = out.replace(
      /<meta property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${escapeAttr(desc)}" />`,
    )
    out = out.replace(
      /<meta name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:description" content="${escapeAttr(desc)}" />`,
    )
  }
  return out
}

function outputPathForRoute(route) {
  if (route === '/') return join(DIST, 'index.html')
  const trimmed = route.replace(/^\//, '')
  return join(DIST, trimmed, 'index.html')
}

async function main() {
  const routes = await buildRoutes()
  console.log(`[prerender] ${routes.length} routes`)

  console.log('[prerender] starting static server on :' + PORT)
  const server = await startServer()

  console.log('[prerender] launching headless Chromium')
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    for (const route of routes) {
      console.log(`[prerender] rendering ${route}`)
      const page = await browser.newPage()
      // Desktop viewport. Matches the SSR-safe default in useBreakpoint so
      // hydration on the client does not see a width mismatch on first paint.
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

      const raw = await page.content()

      // Mark the doc as pre-rendered so main.jsx knows to hydrate (vs render),
      // then bake the URL-aware meta tags.
      const stamped = raw.replace(
        '<html lang="en">',
        '<html lang="en" data-prerendered="true">',
      )
      const baked = bakeRouteMeta(stamped, route)

      const outPath = outputPathForRoute(route)
      await mkdir(dirname(outPath), { recursive: true })
      await writeFile(outPath, baked, 'utf-8')
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
