/*
 * Playwright smoke test. Loads example.com, screenshots it, exits.
 * Confirms the install + headless Chromium are working before we wire
 * up the real Chat-page screenshot harness.
 */
import { chromium } from 'playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'smoke.png')

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
await page.goto('https://example.com', { waitUntil: 'networkidle' })
await page.screenshot({ path: OUT, fullPage: false })
await browser.close()
console.log('OK: screenshot written to', OUT)
