/*
 * Chat preview screenshot harness.
 *
 * 1. Spawns `vite dev` (port 5173 by default).
 * 2. Waits for the server to be ready.
 * 3. Loads /preview-chat.html in headless Chromium at desktop viewport.
 * 4. Screenshots both empty + active states.
 * 5. Writes empty.png and active.png next to this script.
 * 6. Tears down the dev server.
 *
 * Usage:  node scripts/verify/chat.mjs
 */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')

const PORT = 5179  // avoid clashing with a dev server the user has running
const VIEWPORT = { width: 1440, height: 900 }

// Strip ANSI escape sequences so substring matches don't fail because
// Vite wraps the port number in color codes.
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
        // Give the server a beat to settle before the first request.
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
  for (const mode of ['empty', 'active']) {
    const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 })
    const page = await ctx.newPage()
    const url = `http://localhost:${PORT}/preview-chat.html?state=${mode}`
    await page.goto(url, { waitUntil: 'networkidle' })
    // Wait for fonts + first paint to settle
    await page.evaluate(() => document.fonts ? document.fonts.ready : Promise.resolve())
    await page.waitForTimeout(450)
    const out = path.join(__dirname, `chat-${mode}.png`)
    await page.screenshot({ path: out, fullPage: false })
    console.log(`OK: wrote ${out}`)
    await ctx.close()
  }
} finally {
  await browser.close()
  vite.kill()
  // On Windows, child Node processes survive a parent kill — make sure we
  // don't leave a zombie vite dev server holding the port.
  try {
    const { execSync } = await import('node:child_process')
    execSync(`npx kill-port ${PORT}`, { stdio: 'ignore' })
  } catch {}
}
