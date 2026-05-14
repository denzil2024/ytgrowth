/*
 * Competitors preview screenshot harness. Spawns vite dev, loads each
 * preview state, captures screenshots for visual review. Mirrors the
 * structure of chat.mjs.
 *
 * Usage:  node scripts/verify/competitors.mjs
 */
import { chromium } from 'playwright'
import { spawn, execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')

const PORT = 5180
const VIEWPORT = { width: 1440, height: 1100 }

const ANSI = /\x1B\[[0-?]*[ -/]*[@-~]/g

function waitForReady(child) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('vite dev did not become ready in 30s')), 30000)
    let buf = ''
    const onData = (chunk) => {
      buf += chunk.toString().replace(ANSI, '')
      if (buf.includes('Local:') && buf.includes(`localhost:${PORT}`)) {
        clearTimeout(timer)
        child.stdout.off('data', onData)
        child.stderr.off('data', onData)
        setTimeout(resolve, 500)
      }
    }
    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
  })
}

const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
  cwd: ROOT,
  shell: true,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, BROWSER: 'none' },
})

let viteLog = ''
vite.stdout.on('data', (c) => { viteLog += c.toString() })
vite.stderr.on('data', (c) => { viteLog += c.toString() })

try {
  await waitForReady(vite)
} catch (err) {
  console.error('vite dev failed to start:\n', viteLog)
  vite.kill()
  process.exit(1)
}

const browser = await chromium.launch()
try {
  const states = ['search-empty', 'search-results', 'tracked-empty', 'tracked', 'tracked-open']
  for (const state of states) {
    // Tracked-open expands to a tall report (KPI + videos + chart + title
    // patterns + topics + disclosure). Use a taller viewport for that one
    // state so I can review the whole layout in a single screenshot.
    const vp = state === 'tracked-open' ? { width: 1440, height: 1900 } : VIEWPORT
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 })
    const page = await ctx.newPage()
    await page.goto(`http://localhost:${PORT}/preview-competitors.html?state=${state}`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts ? document.fonts.ready : Promise.resolve())
    await page.waitForTimeout(800)
    const out = path.join(__dirname, `competitors-${state}.png`)
    await page.screenshot({ path: out, fullPage: false })
    if (state === 'tracked') {
      const m = await page.evaluate(() => {
        const cp = document.querySelector('.comp-page')
        if (!cp) return { error: 'no .comp-page' }
        const r = cp.getBoundingClientRect()
        return { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), viewport: window.innerWidth }
      })
      console.log(`MEASURE comp-page: left=${m.left} right=${m.right} width=${m.width} viewport=${m.viewport}`)
    }
    console.log(`OK: wrote ${out}`)
    await ctx.close()
  }
} finally {
  await browser.close()
  vite.kill()
  try { execSync(`npx kill-port ${PORT}`, { stdio: 'ignore' }) } catch {}
}
