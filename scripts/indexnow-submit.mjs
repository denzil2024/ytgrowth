#!/usr/bin/env node
/**
 * IndexNow submitter. Tells Bing / Yandex / Seznam that a batch of URLs
 * changed status, so they re-crawl in hours instead of weeks.
 *
 * Why this exists: the 07-09 page cut's redirects never shipped (see
 * FOUNDATION.md item 7). ~225 retired URLs served the Landing page under a
 * self-canonical until e68faef47 fixed them to 301/410 on 2026-10-14.
 * Those URLs are still in the index with their old state. Natural re-crawl
 * on a site this size takes weeks; IndexNow makes it hours. The key file
 * has been live and unused since 74c650e62 (July).
 *
 * Google does NOT support IndexNow. For Google, a 301/410 is still picked up
 * on natural re-crawl, and the sitemap ping below is the only nudge
 * available without Search Console access.
 *
 * Zero YouTube API quota cost: this touches no YouTube endpoint.
 *
 * Usage:
 *   node scripts/indexnow-submit.mjs --retired      # the 225 fixed URLs
 *   node scripts/indexnow-submit.mjs --sitemap      # every live sitemap URL
 *   node scripts/indexnow-submit.mjs --retired --dry-run
 */

const HOST = "ytgrowth.io";
const KEY = "8d8a60f8a4407e834e20f01752dba5c9";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";

// IndexNow accepts up to 10,000 URLs per request. Chunk well under that.
const CHUNK = 500;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const mode = args.includes("--sitemap") ? "sitemap" : "retired";

// Mirrors _retired_route_target() in app/main.py. Kept in sync by hand:
// both lists are short and change only if the geo strategy changes.
const CATEGORIES = [
  "beauty", "comedy", "cooking", "education", "entertainment", "finance",
  "fitness", "gaming", "music", "news", "sports", "tech", "travel", "vlogs",
];
const STATS_COUNTRIES = ["united-states", "united-kingdom", "canada", "australia"];
const EARNINGS_COUNTRIES = [...STATS_COUNTRIES, "germany"];
// Deliberately dropped for the tier-1 push (56b574f74). These now 410.
const DROPPED = ["india", "pakistan", "indonesia", "philippines", "nigeria", "ukraine"];

function retiredUrls() {
  const out = new Set();
  // /youtube-stats/country/<geo>/<category> — 301 for tier-1, 410 for dropped
  for (const geo of [...STATS_COUNTRIES, ...DROPPED]) {
    for (const cat of CATEGORIES) {
      out.add(`https://${HOST}/youtube-stats/country/${geo}/${cat}`);
    }
  }
  // /youtube-earnings/<category>/<geo>
  for (const cat of CATEGORIES) {
    for (const geo of [...EARNINGS_COUNTRIES, ...DROPPED]) {
      out.add(`https://${HOST}/youtube-earnings/${cat}/${geo}`);
    }
  }
  // Dropped country hubs
  for (const geo of DROPPED) {
    out.add(`https://${HOST}/youtube-stats/country/${geo}`);
  }
  return [...out];
}

async function sitemapUrls() {
  const res = await fetch(`https://${HOST}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap fetch failed: ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function submit(urlList) {
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  return res.status;
}

async function main() {
  const urls = mode === "sitemap" ? await sitemapUrls() : retiredUrls();
  console.log(`mode: ${mode}`);
  console.log(`urls: ${urls.length}`);
  console.log(`key:  ${KEY_LOCATION}`);

  // Verify the key file is actually reachable before submitting. A 404 here
  // makes every submission silently invalid.
  const keyCheck = await fetch(KEY_LOCATION);
  const keyBody = (await keyCheck.text()).trim();
  if (!keyCheck.ok || keyBody !== KEY) {
    console.error(`FAIL: key file bad (status ${keyCheck.status}, body "${keyBody}")`);
    process.exit(1);
  }
  console.log("key file verified");

  if (dryRun) {
    console.log("\n--dry-run, nothing submitted. First 10:");
    urls.slice(0, 10).forEach((u) => console.log("  " + u));
    return;
  }

  let ok = 0;
  for (let i = 0; i < urls.length; i += CHUNK) {
    const chunk = urls.slice(i, i + CHUNK);
    const status = await submit(chunk);
    // 200 accepted, 202 accepted pending key validation. Both are success.
    const good = status === 200 || status === 202;
    if (good) ok += chunk.length;
    console.log(`  chunk ${i / CHUNK + 1}: ${chunk.length} urls -> HTTP ${status}${good ? "" : "  <<< FAILED"}`);
  }
  console.log(`\nsubmitted ${ok}/${urls.length}`);
  if (ok !== urls.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
