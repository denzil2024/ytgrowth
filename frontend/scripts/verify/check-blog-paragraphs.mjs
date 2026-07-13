/* Blog paragraph line-length checker. Flags any <p> whose rendered height
   exceeds maxLines at the real .bp-prose content column width (760px), so
   long paragraphs get caught by an actual measurement instead of a guessed
   character count. Requires the dev server already running (npm run dev).
   Usage: node scripts/verify/check-blog-paragraphs.mjs <slug> [maxLines] [port]
*/
import puppeteer from 'puppeteer'

const slug = process.argv[2]
const maxLines = Number(process.argv[3] || 5)
const port = process.argv[4] || 5173
if (!slug) {
  console.error('Usage: node scripts/verify/check-blog-paragraphs.mjs <slug> [maxLines] [port]')
  process.exit(1)
}

const browser = await puppeteer.launch()
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 1000, deviceScaleFactor: 1 })
  await page.goto(`http://localhost:${port}/blog/${slug}`, { waitUntil: 'networkidle0' })

  const results = await page.evaluate(() => {
    const paras = Array.from(document.querySelectorAll('.bp-prose p'))
    return paras.map((p) => {
      const rect = p.getBoundingClientRect()
      const lineHeight = parseFloat(getComputedStyle(p).lineHeight)
      return { lines: Math.round(rect.height / lineHeight), text: p.textContent.trim().slice(0, 80) }
    })
  })

  const offenders = results.filter(r => r.lines > maxLines)
  console.log(`Checked ${results.length} paragraphs on /blog/${slug} at the real content width.`)
  if (offenders.length) {
    console.log(`${offenders.length} paragraph(s) over ${maxLines} lines:`)
    offenders.forEach(o => console.log(`  ${o.lines} lines: "${o.text}..."`))
    process.exitCode = 1
  } else {
    console.log(`All paragraphs are ${maxLines} lines or fewer.`)
  }
} finally {
  await browser.close()
}
