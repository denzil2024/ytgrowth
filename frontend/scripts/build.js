/**
 * Build wrapper.
 *
 * On a developer's machine: runs `vite build` then the Puppeteer prerender
 * step, producing a fully-rendered dist/index.html for AI crawlers.
 *
 * On Railway (or any CI): exits early without touching dist/. The reason —
 * Railway auto-detects frontend/package.json and runs `npm run build` as part
 * of its build pipeline, but its build image lacks the system libraries
 * Puppeteer's bundled Chromium needs. We don't actually need Railway to build
 * the frontend at all: dist/ is committed to the repo and FastAPI serves it
 * as static files. So we detect Railway via its env vars and skip.
 *
 * Escape hatch: set FORCE_BUILD=1 to force the full build regardless of
 * environment.
 */

import { execSync } from 'node:child_process'

const isCI =
  !!process.env.RAILWAY_ENVIRONMENT ||
  !!process.env.RAILWAY_PROJECT_ID ||
  !!process.env.RAILWAY_SERVICE_ID ||
  !!process.env.RAILPACK ||
  !!process.env.NIXPACKS_METADATA ||
  !!process.env.CI

if (isCI && !process.env.FORCE_BUILD) {
  console.log('[build] CI environment detected — skipping vite + prerender. Serving committed dist/.')
  process.exit(0)
}

console.log('[build] vite build')
execSync('vite build', { stdio: 'inherit' })
console.log('[build] prerender')
execSync('node scripts/prerender.js', { stdio: 'inherit' })
