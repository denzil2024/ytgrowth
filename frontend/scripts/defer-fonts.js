/**
 * Post-prerender font de-blocker.
 *
 * Google Fonts stylesheets ship as render-blocking <link rel="stylesheet">
 * tags: one static one in index.html (Plus Jakarta Sans) plus per-page ones
 * that each page injects via JS (DM Sans + Inter, Geist, ...). The Puppeteer
 * prerender bakes those JS-injected links into the static <head>, so every
 * crawled page carries 2-3 render-blocking font requests on the critical
 * path. PageSpeed flagged ~1.4s of blocked render and a long LCP render
 * delay from exactly this.
 *
 * The standard fix is the media-swap pattern: load the stylesheet with
 * media="print" (so it does not block the first paint), then flip it to
 * media="all" once it has loaded. With display=swap already on every URL,
 * text paints immediately in the fallback face and swaps to the web font
 * when ready, which is what we want for LCP.
 *
 * Why this runs AFTER prerender (not in index.html): the onload swap would
 * execute during the Puppeteer snapshot and get baked back to a plain
 * render-blocking stylesheet. Applying it to the final static output, like
 * inject-ezoic.js, is the only way it survives. A <noscript> copy keeps the
 * fonts working with JS disabled.
 *
 * Idempotent: a link already carrying media="print"/onload is left alone, so
 * re-running the build never double-wraps.
 */

import { readFileSync, writeFileSync, globSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist')

// Any <link> whose href is a Google Fonts stylesheet (css2). The preconnect
// hints point at fonts.googleapis.com too but have no /css2 path, so they are
// excluded. Attribute order varies (href-first or rel-first, optional id), so
// match the whole tag and inspect it.
const FONT_LINK = /<link\b[^>]*\bhref="https:\/\/fonts\.googleapis\.com\/css2[^"]*"[^>]*>/g

const files = globSync('**/index.html', { cwd: DIST }).map((f) => join(DIST, f))

let deferred = 0
let skipped = 0
let touchedFiles = 0

for (const file of files) {
  const html = readFileSync(file, 'utf8')
  // Already processed (a fresh prerender never carries this marker, so a real
  // build still runs; this only no-ops a manual re-run on committed dist and
  // avoids re-wrapping the <noscript> fallback links).
  if (html.includes(`onload="this.media='all'"`)) {
    skipped++
    continue
  }
  let changedHere = 0

  const out = html.replace(FONT_LINK, (tag) => {
    // Already de-blocked (or not a stylesheet, e.g. a preload) -> leave as is.
    if (tag.includes('media="print"') || tag.includes('onload=')) {
      skipped++
      return tag
    }
    if (!tag.includes('rel="stylesheet"')) {
      skipped++
      return tag
    }
    changedHere++
    deferred++
    const nonBlocking = tag.replace(/>$/, ` media="print" onload="this.media='all'">`)
    return `${nonBlocking}<noscript>${tag}</noscript>`
  })

  if (changedHere > 0) {
    writeFileSync(file, out)
    touchedFiles++
  }
}

console.log(
  `[defer-fonts] de-blocked ${deferred} font links across ${touchedFiles} files (left ${skipped} untouched), total ${files.length} pages`,
)
