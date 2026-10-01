/*
 * NewsletterCapture popup verify harness. Loads a real blog post, scrolls
 * past the 50% trigger, screenshots the card, then checks dismiss works.
 * Mirrors about.mjs. Screenshots capped at deviceScaleFactor 1.3.
 *
 * Usage:  node scripts/verify/newsletter-capture.mjs
 */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')
const OUT = process.env.OUT_DIR || __dirname

const PORT = 5277
const SLUG = 'start-youtube-channel'
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

  await page.goto(`http://localhost:${PORT}/blog/${SLUG}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)

  // Before trigger: should not be visible.
  const beforeFile = path.join(OUT, 'newsletter-capture-before.png')
  await page.screenshot({ path: beforeFile })
  console.log('wrote', beforeFile)

  // Scroll via wheel ticks (fires real 'scroll' events) to a precise 65%
  // depth — mid-band, well clear of both the 50% show and 90% hide edges.
  const target65 = await page.evaluate(() => (document.documentElement.scrollHeight - window.innerHeight) * 0.65)
  for (let i = 0; i < 60; i++) {
    const cur = await page.evaluate(() => window.scrollY)
    if (cur >= target65) break
    await page.mouse.wheel(0, 300)
    await page.waitForTimeout(60)
  }
  await page.waitForTimeout(500)

  const afterFile = path.join(OUT, 'newsletter-capture-triggered.png')
  await page.screenshot({ path: afterFile })
  console.log('wrote', afterFile)

  const cardVisible = await page.evaluate(() => {
    return !!document.body.innerText.includes('Get the next data study first')
  })
  console.log('card visible mid-article (~65% scroll):', cardVisible)

  // Scroll to the very bottom (footer) — card should hide to avoid overlap.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForTimeout(400)
  const bottomFile = path.join(OUT, 'newsletter-capture-bottom.png')
  await page.screenshot({ path: bottomFile })
  console.log('wrote', bottomFile)
  const cardHiddenAtBottom = await page.evaluate(() => !document.body.innerText.includes('Get the next data study first'))
  console.log('card hidden at page bottom (no footer overlap):', cardHiddenAtBottom)

  // Scroll back up into the band — card should reappear (no flicker-gone-forever).
  for (let i = 0; i < 25; i++) {
    await page.mouse.wheel(0, -600)
    await page.waitForTimeout(80)
  }
  await page.waitForTimeout(400)
  const cardReappears = await page.evaluate(() => !!document.body.innerText.includes('Get the next data study first'))
  console.log('card reappears after scrolling back up:', cardReappears)

  // Dismiss, then reload and re-scroll — should stay hidden (localStorage gate).
  const dismissBtn = await page.$('button[aria-label="Dismiss"]')
  if (dismissBtn) {
    await dismissBtn.click()
    await page.waitForTimeout(300)
    const dismissedFile = path.join(OUT, 'newsletter-capture-dismissed.png')
    await page.screenshot({ path: dismissedFile })
    console.log('wrote', dismissedFile)
  } else {
    console.log('WARN: dismiss button not found')
  }

  await page.reload({ waitUntil: 'networkidle' })
  for (let i = 0; i < 20; i++) {
    await page.mouse.wheel(0, 600)
    await page.waitForTimeout(120)
  }
  await page.waitForTimeout(500)
  const stillHidden = await page.evaluate(() => !document.body.innerText.includes('Get the next data study first'))
  console.log('stays hidden after reload (localStorage gate):', stillHidden)

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
