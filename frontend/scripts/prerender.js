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
import { COUNTRY_META }  from '../src/data/youtubeStatsCountries.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
const DIST       = resolve(__dirname, '..', 'dist')
const POSTS_SRC  = resolve(__dirname, '..', 'src', 'blog', 'posts.jsx')
const PORT       = 4173
const SITE_ORIGIN = 'https://ytgrowth.io'

/* Where to fetch the live channel cache from at build time so we can bake
 * the leaderboard rows into the prerendered HTML for /youtube-stats/*.
 * Defaults to a locally running FastAPI dev server. Override with
 * BUILD_API_URL=https://ytgrowth.io if you want to fetch from production
 * instead. If neither is reachable, the build still succeeds — the stats
 * pages just prerender without channel rows (same as before this feature).
 */
const BUILD_API_URL = process.env.BUILD_API_URL || 'http://localhost:8000'
const STATS_REGIONS = ['global', 'US', 'GB', 'CA', 'AU', 'IN']

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
    title:       'YouTube Earnings Calculator 2026: Free Revenue & Income Estimator',
    description: 'Free YouTube calculator for channel earnings, ad revenue, and income. AdSense, CPM, RPM, and views-to-money math by niche. Monthly and yearly estimates.',
  },
  '/tools/youtube-subscriber-money-calculator': {
    title:       'YouTube Subscriber Money Calculator 2026: Free Earnings Per Sub Estimator',
    description: 'Free YouTube subscriber money calculator. Estimate earnings, ad revenue, and pay per subscriber. View-per-sub ratios, niche CPM, monthly and yearly income.',
  },
  '/tools/youtube-channel-stats-checker': {
    title:       'YouTube Channel Stats Checker 2026: Free Live Statistics & Analytics',
    description: 'Free YouTube channel stats and statistics checker. Live subscriber count, total views, monthly uploads, and engagement for any public YouTube channel. No login.',
  },
  '/tools/youtube-thumbnail-downloader': {
    title:       'YouTube Thumbnail Downloader 2026: Free HD Image Grabber & Saver',
    description: 'Free YouTube thumbnail downloader and grabber. Download or get any thumbnail from a YouTube video URL in HD, Max Res, JPG, or PNG. No watermark, no signup.',
  },
  '/tools/youtube-thumbnail-resizer': {
    title:       'YouTube Thumbnail Resizer 2026: Free Image & Size Converter',
    description: 'Free YouTube thumbnail resizer and size converter. Resize any image or photo to HD (1280x720), Full HD, or 4K. Auto-fits under YouTube\'s 2MB cap, runs in your browser.',
  },
  '/tools/youtube-channel-name-generator': {
    title:       'YouTube Name Generator 2026: Free Channel Name Ideas for YouTubers',
    description: 'Free YouTube channel name generator and name ideas tool. 60+ creative name suggestions for YouTubers, vloggers, and gaming channels. No signup, no AI hallucinations.',
  },
  '/tools/youtube-video-ideas-generator': {
    title:       'YouTube Video Ideas Generator 2026: Free Topic & Content Idea Tool',
    description: 'Free YouTube video ideas generator and topic generator. 90+ proven content idea formats across 9 categories. No signup, no AI hallucinations, instant results.',
  },
  '/tools/youtube-title-generator': {
    title:       'YouTube Title Generator 2026: Free Title Ideas + CTR Analyzer',
    description: 'Free YouTube title generator and analyzer. Get a dozen click-worthy title ideas from your topic, then score any title on length, numbers, power words, and keyword position. No signup.',
  },
  '/tools/youtube-shorts-money-calculator': {
    title:       'YouTube Shorts Money Calculator 2026: Free Shorts Earnings Estimator',
    description: 'Free YouTube Shorts money calculator. Estimate real Shorts ad earnings from the shared-pool RPM by views and audience country. See why Shorts pay far less than long-form. No signup.',
  },
  '/tools/youtube-description-generator': {
    title:       'YouTube Description Generator 2026: Free SEO Description Template',
    description: 'Free YouTube description generator and template. Build an SEO-friendly description with a keyword hook, timestamps, links, and hashtags in seconds. No signup, runs in your browser.',
  },
  '/tools/youtube-tag-generator': {
    title:       'YouTube Tag Generator 2026: Free Video Tags from Any Keyword',
    description: 'Free YouTube tag generator. Enter your topic and get a clean set of relevant tags and variations, trimmed to fit YouTube\'s 500-character limit. Copy and paste, no signup.',
  },
  '/youtube-stats': {
    title:       'Top YouTube Subscribers & Creators 2026: Live Channel Statistics',
    description: 'Top YouTube channels and creators ranked by live subscriber count. 14 niches: gaming, tech, beauty, finance, fitness, music. Free statistics, updated daily, no signup.',
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

/* /youtube-stats/country/:slug pages — same pattern, derived from the
 * shared country metadata. */
for (const country of COUNTRY_META) {
  META_BY_ROUTE[`/youtube-stats/country/${country.id}`] = {
    title:       `${country.seoTitle} | YTGrowth`,
    description: country.seoDescription,
  }
}

/* /youtube-stats/country/:country/:category combo pages — 5x14=70.
 * Title and meta description are baked from both metadata sources so
 * every combo page has a unique long-tail SEO target. */
for (const country of COUNTRY_META) {
  for (const cat of CATEGORY_META) {
    META_BY_ROUTE[`/youtube-stats/country/${country.id}/${cat.id}`] = {
      title:       `Top 50 ${cat.label} YouTube Channels in ${country.label} 2026 | YTGrowth`,
      description: `The top 50 ${cat.label.toLowerCase()} YouTube channels in ${country.label} right now, ranked by live subscriber count from YouTube's official API. Updated daily, free, no signup.`,
    }
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

/* Discover the cover image for each blog post. Returns a Map keyed by route
 * (e.g. `/blog/youtube-thumbnail-size`) so bakeRouteMeta can swap og:image and
 * twitter:image to the post's own featured image instead of the default site
 * og-image.png. We swap `.webp` covers to `.jpg` for OG because LinkedIn,
 * WhatsApp, and a handful of email clients still mishandle WebP previews. The
 * .jpg twin of every cover already exists in frontend/public/blog/.
 */
async function discoverBlogCovers() {
  const src = await readFile(POSTS_SRC, 'utf-8')
  const after = src.split(/export\s+const\s+posts\s*=\s*\[/)[1] || ''
  // Pair each `slug: '...'` with the nearest following `cover: '...'`. The
  // posts.jsx schema defines them in fixed slug→cover order per post, so a
  // non-greedy lookahead is sufficient and resists picking up `cover` strings
  // that might appear inside post bodies.
  const re = /^\s*slug:\s*['"]([^'"]+)['"][\s\S]*?^\s*cover:\s*['"]([^'"]+)['"]/gm
  const map = new Map()
  let m
  while ((m = re.exec(after)) !== null) {
    const slug = m[1]
    const cover = m[2].replace(/\.webp$/i, '.jpg')
    map.set(`/blog/${slug}`, cover)
  }
  return map
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
    '/tools/youtube-title-generator',
    '/tools/youtube-shorts-money-calculator',
    '/tools/youtube-description-generator',
    '/tools/youtube-tag-generator',
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
    '/youtube-stats/country/united-states',
    '/youtube-stats/country/united-states/gaming',
    '/youtube-stats/country/united-states/tech',
    '/youtube-stats/country/united-states/beauty',
    '/youtube-stats/country/united-states/finance',
    '/youtube-stats/country/united-states/cooking',
    '/youtube-stats/country/united-states/fitness',
    '/youtube-stats/country/united-states/music',
    '/youtube-stats/country/united-states/education',
    '/youtube-stats/country/united-states/vlogs',
    '/youtube-stats/country/united-states/travel',
    '/youtube-stats/country/united-states/comedy',
    '/youtube-stats/country/united-states/sports',
    '/youtube-stats/country/united-states/entertainment',
    '/youtube-stats/country/united-states/news',
    '/youtube-stats/country/united-kingdom',
    '/youtube-stats/country/united-kingdom/gaming',
    '/youtube-stats/country/united-kingdom/tech',
    '/youtube-stats/country/united-kingdom/beauty',
    '/youtube-stats/country/united-kingdom/finance',
    '/youtube-stats/country/united-kingdom/cooking',
    '/youtube-stats/country/united-kingdom/fitness',
    '/youtube-stats/country/united-kingdom/music',
    '/youtube-stats/country/united-kingdom/education',
    '/youtube-stats/country/united-kingdom/vlogs',
    '/youtube-stats/country/united-kingdom/travel',
    '/youtube-stats/country/united-kingdom/comedy',
    '/youtube-stats/country/united-kingdom/sports',
    '/youtube-stats/country/united-kingdom/entertainment',
    '/youtube-stats/country/united-kingdom/news',
    '/youtube-stats/country/canada',
    '/youtube-stats/country/canada/gaming',
    '/youtube-stats/country/canada/tech',
    '/youtube-stats/country/canada/beauty',
    '/youtube-stats/country/canada/finance',
    '/youtube-stats/country/canada/cooking',
    '/youtube-stats/country/canada/fitness',
    '/youtube-stats/country/canada/music',
    '/youtube-stats/country/canada/education',
    '/youtube-stats/country/canada/vlogs',
    '/youtube-stats/country/canada/travel',
    '/youtube-stats/country/canada/comedy',
    '/youtube-stats/country/canada/sports',
    '/youtube-stats/country/canada/entertainment',
    '/youtube-stats/country/canada/news',
    '/youtube-stats/country/australia',
    '/youtube-stats/country/australia/gaming',
    '/youtube-stats/country/australia/tech',
    '/youtube-stats/country/australia/beauty',
    '/youtube-stats/country/australia/finance',
    '/youtube-stats/country/australia/cooking',
    '/youtube-stats/country/australia/fitness',
    '/youtube-stats/country/australia/music',
    '/youtube-stats/country/australia/education',
    '/youtube-stats/country/australia/vlogs',
    '/youtube-stats/country/australia/travel',
    '/youtube-stats/country/australia/comedy',
    '/youtube-stats/country/australia/sports',
    '/youtube-stats/country/australia/entertainment',
    '/youtube-stats/country/australia/news',
    '/youtube-stats/country/india',
    '/youtube-stats/country/india/gaming',
    '/youtube-stats/country/india/tech',
    '/youtube-stats/country/india/beauty',
    '/youtube-stats/country/india/finance',
    '/youtube-stats/country/india/cooking',
    '/youtube-stats/country/india/fitness',
    '/youtube-stats/country/india/music',
    '/youtube-stats/country/india/education',
    '/youtube-stats/country/india/vlogs',
    '/youtube-stats/country/india/travel',
    '/youtube-stats/country/india/comedy',
    '/youtube-stats/country/india/sports',
    '/youtube-stats/country/india/entertainment',
    '/youtube-stats/country/india/news',
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
 * If a per-route cover image is provided (blog posts only), og:image and
 * twitter:image are swapped to point at the cover instead of the site default.
 */
function bakeRouteMeta(html, route, coverByRoute) {
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

  // Per-blog-post cover image swap. Only applies if this route has a cover
  // mapping (blog posts). All other routes keep the site-default og-image.png.
  // Covers are 1600x900 (16:9) instead of the site default 1200x630, so the
  // width/height tags get rewritten to match the actual file dimensions.
  const cover = coverByRoute?.get(route)
  if (cover) {
    const absCover = `${SITE_ORIGIN}${cover}`
    out = out.replace(
      /<meta property="og:image"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:image" content="${escapeAttr(absCover)}" />`,
    )
    out = out.replace(
      /<meta property="og:image:width"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:image:width" content="1600" />`,
    )
    out = out.replace(
      /<meta property="og:image:height"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:image:height" content="900" />`,
    )
    out = out.replace(
      /<meta name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:image" content="${escapeAttr(absCover)}" />`,
    )
  }

  return out
}

function outputPathForRoute(route) {
  if (route === '/') return join(DIST, 'index.html')
  const trimmed = route.replace(/^\//, '')
  return join(DIST, trimmed, 'index.html')
}

/* Prefetch the channel cache once per region from the live API. We bake
 * the result into the prerendered HTML for every /youtube-stats/* route so
 * the channel leaderboard renders into static HTML for SEO and LLM
 * crawlers, which currently see an empty list (the React component fetches
 * /api/top-channels in a useEffect that the static-server prerender can't
 * satisfy).
 *
 * Failure-tolerant: any region that fails returns null and we skip
 * injection for routes that depend on it. The build still succeeds.
 */
async function prefetchStats() {
  console.log(`[prerender] prefetching channel stats from ${BUILD_API_URL}`)
  const out = {}
  await Promise.all(STATS_REGIONS.map(async (code) => {
    const url = code === 'global'
      ? `${BUILD_API_URL}/api/top-channels`
      : `${BUILD_API_URL}/api/top-channels?region=${code}`
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 8000)
      const r = await fetch(url, { signal: ctrl.signal })
      clearTimeout(timer)
      if (!r.ok) {
        console.warn(`[prerender] stats ${code}: HTTP ${r.status}, skipping injection`)
        out[code] = null
        return
      }
      const data = await r.json()
      const groupCount = Object.keys(data?.groups || {}).length
      out[code] = data
      console.log(`[prerender] stats ${code}: ok (${groupCount} categories)`)
    } catch (e) {
      console.warn(`[prerender] stats ${code}: ${e.message}, skipping injection`)
      out[code] = null
    }
  }))
  const okCount = Object.values(out).filter(v => v != null).length
  if (okCount === 0) {
    console.warn(
      `[prerender] no stats datasets fetched. /youtube-stats/* will prerender ` +
      `without channel rows (the previous behaviour). Start FastAPI on :8000 ` +
      `or set BUILD_API_URL to enable the channel-row injection.`,
    )
  } else {
    console.log(`[prerender] fetched ${okCount}/${STATS_REGIONS.length} stats datasets`)
  }
  return out
}

/* Map a route to the region code whose dataset should be injected as
 * window.__INITIAL_STATS__ for that route's prerender. Returns null for
 * any non-stats route or any stats route we don't recognize.
 */
function regionForRoute(route) {
  const m = route.match(/^\/youtube-stats\/country\/([^/]+)/)
  if (m) {
    const country = COUNTRY_META.find(c => c.id === m[1])
    return country?.code || null
  }
  if (route === '/youtube-stats' || route.startsWith('/youtube-stats/')) {
    return 'global'
  }
  return null
}

/* Build the <script> tag that re-installs window.__INITIAL_STATS__ on the
 * client so React's hydrate sees the same initial state Puppeteer used.
 * We embed the data via JSON.parse(stringLiteral) rather than as a JS
 * literal so any "</script" or non-ASCII payload bytes can't break HTML
 * parsing. The .replace defends against the (extremely unlikely) case of
 * "</script" appearing literally inside a channel title.
 */
function statsInjectionScript(payload) {
  const json = JSON.stringify(payload)
  const literal = JSON.stringify(json).replace(/<\/script/gi, '<\\/script')
  return `<script>window.__INITIAL_STATS__ = JSON.parse(${literal})</script>`
}

async function main() {
  const routes = await buildRoutes()
  console.log(`[prerender] ${routes.length} routes`)

  const coverByRoute = await discoverBlogCovers()
  console.log(`[prerender] ${coverByRoute.size} blog covers mapped for og:image swap`)

  const statsByRegion = await prefetchStats()

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

      // For /youtube-stats/* routes, prime window.__INITIAL_STATS__ before
      // any page script runs so the React component's lazy useState
      // initializer reads it on first render and bakes the channel rows
      // into the snapshot HTML.
      const region = regionForRoute(route)
      const initialStats = region ? statsByRegion[region] : null
      if (initialStats) {
        await page.evaluateOnNewDocument(
          (data, regionCode) => { window.__INITIAL_STATS__ = { region: regionCode, data } },
          initialStats, region,
        )
      }

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
      let baked = bakeRouteMeta(stamped, route, coverByRoute)

      // For stats routes that received an initialStats payload, inject the
      // same payload as a script tag so client hydration reads matching
      // initial state and produces identical markup. Without this, the
      // useState initializer would return null on the client (no
      // window.__INITIAL_STATS__) and React would throw a hydration
      // mismatch and discard the server-rendered channel rows.
      if (initialStats) {
        const tag = statsInjectionScript({ region, data: initialStats })
        baked = baked.replace('</head>', `${tag}\n  </head>`)
      }

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
