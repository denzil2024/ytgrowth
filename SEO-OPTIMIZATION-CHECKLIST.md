# SEO Optimization Checklist

Living doc. Read this before optimizing any existing post. This is the reusable
process behind the weekly pass: pull Search Console, find pages gaining
impressions but under-ranking, and run them through the steps below in order.
Skipping steps is how gaps like the ones caught on best-time-to-post (stale
excerpt, un-mirrored FAQ schema, 160-char meta description) slip through.

Last updated: 2026-07-13

## When to run this

Weekly. Pull Google Search Console (last 28 to 90 days), sort by impressions,
and look for pages with meaningful impressions but a weak position (page 2+)
or a low CTR relative to position. Those are the candidates. Prioritize
beatable SERPs (mid-tier competitors) over authority-gated head terms; see
MEDIAVINE.md's ranking-reality section for how to tell the two apart.

## 1. Research (do this first, every time, unprompted)

- [ ] Pull the live top-10 SERP for the target query. Full top 10, not top 3.
- [ ] Build a coverage matrix: the union of every section any strong
      competitor covers, plus what they all ignore.
- [ ] Check for intent/question gaps, not just missing sections. What is the
      reader (or the AI answering on their behalf) really trying to
      accomplish, and does the page fully close it?
- [ ] If citing any stat or study, check more than one source. If sources
      disagree, that is the differentiated angle, explain the contradiction
      honestly rather than picking a side blindly.
- [ ] Before claiming "we analyzed X channels" or similar, verify we
      actually have that data (see [[project_linkable_data_studies]] and the
      moat tables in CLAUDE.md). Never fabricate a proprietary-data claim.
- [ ] Present the outline (or the gap found) before writing, per
      feedback_article_research_process.

## 2. Content pass

- [ ] Close genuine gaps only. No thin padding, no filler FAQ.
- [ ] Paragraphs 3 to 4 rendered lines, 5 only when unavoidable. Verify with
      the real tool (see Verification below), not a character-count guess.
- [ ] Banned: "actually" (check headings too, not just `<p>` tags), em-dashes,
      italics.
- [ ] FAQs: lean toward more, each genuinely distinct and helpful.
- [ ] Keep the house voice: flowing prose, no repeated intro formula (grep
      existing posts first), no long comma-chain run-ons.

## 3. Schema pass

- [ ] `faqs` array present and mirrors the visible FAQ section exactly: same
      count, same order, same text word-for-word (Google requires this).
      Verify by reading both blocks side by side, do not trust a count match
      alone.
- [ ] `updated` date bumped to today.
- [ ] `dateModified` in JSON-LD reads `post.updated || post.date` already
      (BlogPost.jsx), so bumping `updated` is enough, no separate schema edit.
- [ ] `description` in the BlogPosting schema is `post.excerpt` directly, not
      the seoMeta description. If the excerpt is stale, the schema is stale
      even if the meta tag was fixed. Update both.
- [ ] readTime still roughly matches word count after content changes.

## 4. Metadata pass

- [ ] `seoMeta.js`: title <=60 chars, description <=155 chars. Check actual
      lengths, do not eyeball it.
- [ ] `excerpt` in posts.jsx: feeds the visible dek AND the JSON-LD
      description. Update it to reflect any new section, not just the title.
- [ ] `sitemap.xml`: bump `<lastmod>` to today for any page with a
      substantial content change.
- [ ] `llms.txt`: update the one-line description to mention new coverage.
      This is a live acquisition channel (see project_llms_txt_traffic), not
      an afterthought.

## 5. Internal links pass (both directions)

- [ ] Count current inbound links: `grep -c 'href="/blog/<slug>"' posts.jsx`.
      Under-linked pages (fewer than ~3 to 5 inbound) gain the most from this
      pass.
- [ ] Find topically strong, relevant pages that discuss the same subject but
      do not yet link in. Add a natural contextual link, real anchor text
      inside an existing sentence, not a bolted-on reference. Never force a
      link where there is no genuine spot, that is stuffing and it hurts.
- [ ] Add at least one outbound link from any new section to a relevant page,
      so authority flows both directions, not just in.

## 6. Verification pass (run all of these before build)

```bash
cd frontend
npx esbuild src/blog/posts.jsx --outfile=/tmp/posts-check.js   # parse check
node scripts/gen-blog-meta.js                                  # regen postsMeta.js, always, no asking
node scripts/verify/check-blog-paragraphs.mjs <slug>            # needs `npm run dev` already running
```

- [ ] Parses clean (exit 0).
- [ ] `check-blog-paragraphs.mjs <slug>` reports zero paragraphs over 5 lines.
      Measures actual rendered height at the real 760px content column, not a
      guess. Add `[maxLines] [port]` args if needed.
- [ ] Grep the changed section for "actually" and em-dashes, confirm zero.
- [ ] FAQ array count equals visible `<h3>` count for this post.
- [ ] Dev server still returns 200 for `/blog/<slug>`.

## 7. Build and deploy (only on explicit go-ahead, batch, do not push per edit)

- [ ] `BUILD_API_URL=https://ytgrowth.io npm run build` (never the bare
      `npm run build`, or every /youtube-stats/* page ships an empty
      leaderboard, see project_build_api_url_stats_baking).
- [ ] Confirm the prerender verify step reports all routes OK.
- [ ] Stage specific files by name, never `git add -A`.
- [ ] Commit, push. Railway auto-deploys.
- [ ] Verify live by an actual content check (title, a specific new phrase),
      not just an HTTP 200. See feedback_verify_deploy_actually_serves.
- [ ] Submit the changed URL for re-indexing in Search Console (URL
      Inspection -> Request Indexing).

## Common gaps this checklist exists to catch

Found on the best-time-to-post pass (2026-07-13), listed so future passes
check for them by default instead of rediscovering them one at a time:

1. `excerpt` (feeds JSON-LD description + visible dek) left stale after
   adding a whole new section.
2. `seoMeta.js` description over the 155-char guideline, undetected because
   nobody had measured it, just written to "look about right."
3. `sitemap.xml` `lastmod` not bumped despite a substantial content change.
4. `llms.txt` description not updated to reflect new coverage.
5. Paragraph line length checked by eyeballing character counts instead of
   an actual rendered measurement, missing paragraphs that ran 6 to 9 lines.
6. New content authored in the same session introducing its own "actually"
   or forced links, not just pre-existing issues.
