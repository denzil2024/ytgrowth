/**
 * One-shot image optimizer for public/blog/.
 *
 * Generates a .webp next to every .jpg / .jpeg / .png. Originals are
 * preserved so any external link or social-card scraper that already
 * hit the .jpg URL still works. New references in the app point at
 * .webp via this script's posts.jsx rewrite step.
 *
 * Run from frontend/: `node scripts/optimize-images.js`
 *
 * Re-runnable. Skips files whose .webp already exists and is newer
 * than the source. Reports total size delta at the end.
 */

import { readdir, stat, readFile, writeFile } from 'node:fs/promises'
import { join, dirname, resolve, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
const ROOT       = resolve(__dirname, '..')
const BLOG_DIR   = join(ROOT, 'public', 'blog')
const POSTS_SRC  = join(ROOT, 'src', 'blog', 'posts.jsx')

const QUALITY = 82
const SRC_EXT = new Set(['.jpg', '.jpeg', '.png'])

function fmtKb(bytes) {
  return (bytes / 1024).toFixed(1) + ' KB'
}

async function convertOne(srcPath) {
  const ext   = extname(srcPath).toLowerCase()
  const base  = basename(srcPath, ext)
  const dst   = join(dirname(srcPath), `${base}.webp`)

  let dstStat = null
  try { dstStat = await stat(dst) } catch {}
  const srcStat = await stat(srcPath)
  if (dstStat && dstStat.mtimeMs >= srcStat.mtimeMs) {
    return { srcPath, dst, srcSize: srcStat.size, dstSize: dstStat.size, skipped: true }
  }

  await sharp(srcPath)
    .webp({ quality: QUALITY })
    .toFile(dst)

  const out = await stat(dst)
  return { srcPath, dst, srcSize: srcStat.size, dstSize: out.size, skipped: false }
}

async function rewritePostsJsx() {
  const original = await readFile(POSTS_SRC, 'utf-8')

  // Only rewrite paths under /blog/ ending in .jpg / .jpeg / .png. This
  // protects unrelated assets like /og-image.png and /favicon.svg.
  const rewritten = original.replace(
    /(["'`])(\/blog\/[^"'`\s]+?)\.(jpg|jpeg|png)(["'`])/g,
    (_, q1, path, _ext, q2) => `${q1}${path}.webp${q2}`,
  )

  if (rewritten === original) return { changed: false }
  await writeFile(POSTS_SRC, rewritten, 'utf-8')
  const before = (original.match(/\.(jpg|jpeg|png)["'`]/g) || []).length
  const after  = (rewritten.match(/\.(jpg|jpeg|png)["'`]/g) || []).length
  return { changed: true, refsRewritten: before - after }
}

async function main() {
  const entries = await readdir(BLOG_DIR)
  const candidates = entries
    .map(name => join(BLOG_DIR, name))
    .filter(p => SRC_EXT.has(extname(p).toLowerCase()))

  console.log(`[images] ${candidates.length} candidate files in public/blog/`)

  let totalSrc = 0
  let totalDst = 0
  let converted = 0
  let skipped = 0

  for (const src of candidates) {
    const r = await convertOne(src)
    totalSrc += r.srcSize
    totalDst += r.dstSize
    if (r.skipped) {
      skipped++
    } else {
      converted++
      console.log(
        `[images] ${basename(src)} ${fmtKb(r.srcSize)} -> ${fmtKb(r.dstSize)} ` +
        `(${(100 - r.dstSize / r.srcSize * 100).toFixed(0)}% smaller)`,
      )
    }
  }

  console.log(
    `[images] converted=${converted} skipped=${skipped} ` +
    `total ${fmtKb(totalSrc)} -> ${fmtKb(totalDst)} ` +
    `(saved ${fmtKb(totalSrc - totalDst)})`,
  )

  const r = await rewritePostsJsx()
  if (r.changed) {
    console.log(`[images] rewrote ${r.refsRewritten} blog image refs in posts.jsx to .webp`)
  } else {
    console.log('[images] posts.jsx already references .webp paths, no rewrite needed')
  }
}

main().catch(err => {
  console.error('[images] failed:', err)
  process.exit(1)
})
