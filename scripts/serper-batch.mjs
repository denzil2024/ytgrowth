// Research-round helper: one Serper pull per candidate query (top 10 organic +
// People Also Ask + related searches). Prints a grading summary and saves the
// raw JSON next to the query file. See FOUNDATION.md -> "Research round".
//
// Usage (from the repo root, SERPER_KEY in .env):
//   node scripts/serper-batch.mjs research/rounds/<date>-queries.txt
//
// Query file: one query per line, lines starting with # are ignored.
// Output: <same path without .txt>-summary.txt and -raw.json
// Cost: 1 Serper credit per query. Do NOT pipe the output through `head`,
// a closed pipe kills the run before the raw JSON is written.
import fs from 'node:fs';
import path from 'node:path';

const envText = fs.readFileSync(path.resolve('.env'), 'utf8');
const keyMatch = envText.match(/^SERPER_KEY=(.+)$/m);
if (!keyMatch) { console.error('SERPER_KEY not found in .env'); process.exit(1); }
const KEY = keyMatch[1].trim();

const queryFile = process.argv[2];
if (!queryFile) { console.error('usage: node scripts/serper-batch.mjs <queries.txt>'); process.exit(1); }
const base = queryFile.replace(/\.txt$/, '');
const queries = fs.readFileSync(queryFile, 'utf8')
  .split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'));

// Big-authority domains: two or more of these in the top 3 fails the SERP check.
const BIG = ['youtube.com', 'support.google.com', 'vidiq.com', 'tubebuddy.com', 'backlinko.com', 'hubspot.com',
  'hootsuite.com', 'sproutsocial.com', 'buffer.com', 'semrush.com', 'ahrefs.com', 'wikipedia.org', 'forbes.com',
  'business.com', 'shopify.com', 'wix.com', 'canva.com', 'adobe.com', 'descript.com', 'riverside.fm', 'later.com',
  'socialblade.com', 'influencermarketinghub.com', 'thinkific.com', 'kajabi.com', 'blog.google', 'linkedin.com'];
// Forum / UGC domains: at least one in the top 3 (or a small site) passes.
const UGC = ['reddit.com', 'quora.com', 'medium.com', 'community.google', 'stackexchange.com', 'facebook.com',
  'yttalk.com', 'blackhatworld.com'];

const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
const isBig = (d) => BIG.some(b => d.endsWith(b));
const isUgc = (d) => UGC.some(b => d.endsWith(b));

const results = {};
const lines = [];
const say = (s) => { lines.push(s); console.log(s); };

for (const q of queries) {
  const r = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q, num: 10, gl: 'us', hl: 'en' }),
  });
  const j = await r.json();
  results[q] = j;
  const org = (j.organic || []).slice(0, 10);
  const doms = org.map(o => host(o.link));
  const top3 = doms.slice(0, 3);
  const top3big = top3.filter(isBig).length;
  const top3ugc = top3.filter(isUgc).length;
  const verdict = top3big >= 2 ? 'FAIL (2+ big in top 3)' : (top3ugc >= 1 || top3big === 0) ? 'pass' : 'check';
  say(`\n=== ${q}`);
  say(`   ${verdict} | top3: ${top3.join(', ')} | top10 big=${doms.filter(isBig).length} ugc=${doms.filter(isUgc).length}`);
  org.forEach((o, i) => say(`   ${i + 1}. [${doms[i]}] ${o.title}`));
  const paa = (j.peopleAlsoAsk || []).map(p => p.question);
  if (paa.length) say(`   PAA: ${paa.join(' | ')}`);
  const rel = (j.relatedSearches || []).map(p => p.query);
  if (rel.length) say(`   REL: ${rel.join(' | ')}`);
  if (j.message) say(`   ERR: ${j.message}`);
}

fs.writeFileSync(`${base}-raw.json`, JSON.stringify(results, null, 1));
fs.writeFileSync(`${base}-summary.txt`, lines.join('\n') + '\n');
say(`\nsaved ${Object.keys(results).length} queries -> ${base}-summary.txt, ${base}-raw.json`);
