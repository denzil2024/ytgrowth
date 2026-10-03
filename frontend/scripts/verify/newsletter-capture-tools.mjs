/*
 * NewsletterCaptureTimed verify harness (free tool pages). Loads a real tool
 * page, waits past the delay, screenshots the card, checks dismiss works.
 * Mirrors newsletter-capture.mjs (blog variant). Screenshots capped at
 * deviceScaleFactor 1.3.
 *
 * Usage:  node scripts/verify/newsletter-capture-tools.mjs
 */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')
const OUT = process.env.OUT_DIR || __dirname

const PORT = 5283
const ROUTE = '/tools/youtube-money-calculator'
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
        setTimeout(resolve, 600)
      }
    }
    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
  })
}

const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
  cwd: ROOT, shell: true, stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, BROWSER: 'none' },
})
let viteLog = ''
vite.stdout.on('data', (c) => { viteLog += c.toString() })
vite.stderr.on('data', (c) => { viteLog += c.toString() })

try { await waitForReady(vite) } catch (err) {
  console.error('vite dev failed to start:\n', viteLog); vite.kill(); process.exit(1)
}

const browser = await chromium.launch()
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1.3 })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })

  await page.goto(`http://localhost:${PORT}${ROUTE}`, { waitUntil: 'networkidle' })

  const beforeFile = path.join(OUT, 'newsletter-tools-before.png')
  await page.screenshot({ path: beforeFile })
  console.log('wrote', beforeFile)

  // Default delay is 20s in the component; wait a bit past that.
  await page.waitForTimeout(21000)

  const afterFile = path.join(OUT, 'newsletter-tools-triggered.png')
  await page.screenshot({ path: afterFile })
  console.log('wrote', afterFile)

  const cardVisible = await page.evaluate(() => document.body.innerText.includes('More free tools, one email away'))
  console.log('card visible after delay:', cardVisible)

  const dismissBtn = await page.$('button[aria-label="Dismiss"]')
  if (dismissBtn) {
    await dismissBtn.click()
    await page.waitForTimeout(300)
    const dismissedFile = path.join(OUT, 'newsletter-tools-dismissed.png')
    await page.screenshot({ path: dismissedFile })
    console.log('wrote', dismissedFile)
  } else {
    console.log('WARN: dismiss button not found')
  }

  if (errors.length) {
    console.log('console/page errors:', JSON.stringify(errors, null, 2))
  } else {
    console.log('no console/page errors')
  }

  await ctx.close()
} finally {
  await browser.close()
  vite.kill()
}
