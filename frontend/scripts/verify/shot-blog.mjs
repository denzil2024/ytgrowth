/* One-off blog post screenshot: desktop + mobile full page.
   Usage: node scripts/verify/shot-blog.mjs <slug> [port] */
import puppeteer from 'puppeteer'
const slug = process.argv[2]
const port = process.argv[3] || 5173
const outDir = 'C:/Users/HP/AppData/Local/Temp/claude/c--Users-HP-OneDrive-Desktop-ytgrowth/e427bb31-54b8-4b55-9999-cb3cc7f3b497/scratchpad'
const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })
await page.goto(`http://localhost:${port}/blog/${slug}`, { waitUntil: 'networkidle0' })
await page.screenshot({ path: `${outDir}/${slug}-desktop.png`, fullPage: true })
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 })
await page.reload({ waitUntil: 'networkidle0' })
await page.screenshot({ path: `${outDir}/${slug}-mobile.png`, fullPage: true })
await browser.close()
console.log('done')
