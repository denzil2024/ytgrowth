/*
 * Settings preview screenshot harness. Spawns vite dev, loads the Settings
 * preview, captures a screenshot for visual review.
 */
import { chromium } from 'playwright'
import { spawn, execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')

const PORT = 5181
const VIEWPORT = { width: 1440, height: 2000 }

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
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  await page.goto(`http://localhost:${PORT}/preview-settings.html`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts ? document.fonts.ready : Promise.resolve())
  await page.waitForTimeout(800)
  const out = path.join(__dirname, 'settings.png')
  await page.screenshot({ path: out, fullPage: true })
  console.log(`OK: wrote ${out}`)
  await ctx.close()
} finally {
  await browser.close()
  vite.kill()
  try { execSync(`npx kill-port ${PORT}`, { stdio: 'ignore' }) } catch {}
}
