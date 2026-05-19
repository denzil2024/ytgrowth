/* My Videos + VideoOptimizePanel screenshot harness.
 * Usage: node scripts/verify/myvideos.mjs */
import { chromium } from 'playwright'
import { spawn, execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')
const PORT = 5188
const ANSI = /\x1B\[[0-?]*[ -/]*[@-~]/g

function waitForReady(child) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('vite did not become ready')), 30000)
    let buf = ''
    const onData = (c) => { buf += c.toString().replace(ANSI, '')
      if (buf.includes('Local:') && buf.includes(`localhost:${PORT}`)) {
        clearTimeout(timer); child.stdout.off('data', onData); child.stderr.off('data', onData); setTimeout(resolve, 500) } }
    child.stdout.on('data', onData); child.stderr.on('data', onData)
  })
}
const vite = spawn('npx', ['vite','--port',String(PORT),'--strictPort'], { cwd: ROOT, shell: true, stdio: ['ignore','pipe','pipe'], env: { ...process.env, BROWSER: 'none' } })
let log=''; vite.stdout.on('data',c=>log+=c); vite.stderr.on('data',c=>log+=c)
try { await waitForReady(vite) } catch { console.error(log); vite.kill(); process.exit(1) }

const browser = await chromium.launch()
try {
  const shots = [
    ['preview-myvideos.html?state=all',     'myvideos-all',     2000],
    ['preview-myvideos.html?state=tracked', 'myvideos-tracked', 2400],
    ['preview-voptpanel.html',              'voptpanel',        1600],
  ]
  for (const [url, name, wait] of shots) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1700 }, deviceScaleFactor: 1 })
    const page = await ctx.newPage()
    await page.goto(`http://localhost:${PORT}/${url}`, { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => document.fonts ? document.fonts.ready : Promise.resolve())
    await page.waitForTimeout(wait)
    const out = path.join(__dirname, `${name}.png`)
    await page.screenshot({ path: out, fullPage: false })
    console.log(`OK: wrote ${out}`)
    await ctx.close()
  }
} finally {
  await browser.close(); vite.kill()
  try { execSync(`npx kill-port ${PORT}`, { stdio: 'ignore' }) } catch {}
}
