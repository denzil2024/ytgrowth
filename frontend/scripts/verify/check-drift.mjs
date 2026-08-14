/* Drift checker for a single blog post.

   Measures the countable tells listed under "KNOWN DRIFTS" in CONTENT-PLAN.md
   Part 3, against the targets taken from the reference post
   (/blog/youtube-demonetization). Static: reads posts.jsx, no dev server
   needed. Run it before presenting a draft, not after feedback.

   Usage from frontend/:  node scripts/verify/check-drift.mjs <slug>
   Exit 1 if anything fails, so it can gate a commit.
*/
import { readFile } from 'node:fs/promises'

const slug = process.argv[2]
if (!slug) {
  console.error('Usage: node scripts/verify/check-drift.mjs <slug>')
  process.exit(1)
}

const src = await readFile(new URL('../../src/blog/posts.jsx', import.meta.url), 'utf-8')

const start = src.indexOf(`slug: '${slug}'`)
if (start === -1) {
  console.error(`Slug "${slug}" not found in posts.jsx`)
  process.exit(1)
}
// The post object runs until the next "slug: '...'" or the end of the array.
const nextSlug = src.indexOf("    slug: '", start + 10)
const post = src.slice(start, nextSlug === -1 ? src.length : nextSlug)

const count = (re) => (post.match(re) || []).length
// Body-only view: strips the faqs array so its prose is not double-counted.
const bodyStart = post.indexOf('content: () => (')
const body = bodyStart === -1 ? post : post.slice(bodyStart)
const countBody = (re) => (body.match(re) || []).length

const paras = countBody(/<p>/g)
const results = [
  ['tables', countBody(/<table>/g), (v) => v <= 4, '<= 4'],
  ['table rows', countBody(/<tr>/g), (v) => v <= 30, '<= 30, content belongs in lists'],
  ['paragraphs', paras, () => true, 'info'],
  ['bold-lead paragraphs', countBody(/<p><strong>/g), (v) => v <= 8, '<= 8 (reference: 5)'],
  ['hedge phrases', countBody(/there is an argument|the practical answer|the more useful answer|it is worth noting|we cannot answer|arguably|that said/gi), (v) => v <= 3, '<= 3 (reference: 2)'],
  ['"rather than"', countBody(/rather than/gi), (v) => v <= 12, '<= 12 (reference: 11)'],
  ['"which is"', countBody(/which is/gi), (v) => v <= 10, '<= 10'],
  ['banned: actually', count(/\bactually\b/gi), (v) => v === 0, '0'],
  ['banned: em-dash', count(/—/g), (v) => v === 0, '0'],
  ['banned: <em>', count(/<em>/g), (v) => v === 0, '0'],
  // Only the figurative senses. "before it lands" (a suspension) is literal and fine.
  ['banned: figurative "land"', countBody(/premise lands?|premises land|mechanism lands?|idea lands?|joke lands?|that is not landing|lands with|land instantly/gi), (v) => v === 0, '0'],
  ['British spellings', count(/\b(organis|realis|recognis|optimis|categoris|apologis)(e|ed|es|ing|ation)\b|\b(defence|licence|behaviour|colour|favourite|neighbourhood|whilst)\w*/gi), (v) => v === 0, '0'],
  ['CtaCard', count(/<CtaCard/g), (v) => v === 1, 'exactly 1, mid-article'],
  ['cover set', count(/cover: '/g), (v) => v === 1, '1'],
]

console.log(`\nDrift check: /blog/${slug}\n`)
let failed = 0
for (const [label, value, ok, target] of results) {
  const pass = ok(value)
  if (!pass) failed++
  console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${label.padEnd(26)} ${String(value).padStart(4)}   target ${target}`)
}

// Skeleton overlap: does this post's H2 list echo another post's?
const h2s = (s) => (s.match(/<h2>([^<]*)<\/h2>/g) || [])
  .map((h) => h.replace(/<[^>]*>/g, '').toLowerCase())
const mine = h2s(body)
const others = [...src.matchAll(/    slug: '([^']+)'/g)].map((m) => m[1]).filter((s) => s !== slug)
let worst = { slug: null, shared: 0 }
for (const other of others) {
  const s = src.indexOf(`slug: '${other}'`)
  const e = src.indexOf("    slug: '", s + 10)
  const oh = h2s(src.slice(s, e === -1 ? src.length : e))
  // Compare on shape: strip the niche word and compare the rest.
  const norm = (h) => h.replace(/\b(comedy|gaming|cooking|tech|music|vlog|shorts)\b/g, 'X')
  const shared = mine.filter((h) => oh.some((o) => norm(o) === norm(h))).length
  if (shared > worst.shared) worst = { slug: other, shared }
}
console.log('')
if (worst.shared >= 3) {
  failed++
  console.log(`  FAIL  skeleton overlap             ${worst.shared} H2s shared with /blog/${worst.slug} after removing the niche word.`)
  console.log('        Structure must come from the coverage matrix, not the last article.')
} else {
  console.log(`  ok    skeleton overlap             ${worst.shared} shared H2s (worst: ${worst.slug || 'none'})`)
}

console.log(`\n${failed === 0 ? 'All drift checks passed.' : `${failed} check(s) failed. See KNOWN DRIFTS in CONTENT-PLAN.md Part 3.`}\n`)
process.exit(failed === 0 ? 0 : 1)
