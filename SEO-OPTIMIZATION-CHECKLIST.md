# SEO Optimization Checklist — MOVED

**Folded into `CONTENT-PLAN.md` Part 3 (The Runbook) on 2026-08-14.**

This file existed from 2026-07-13 with 43 checks and was not used once. A
process split across two files gets skipped, so there is now one runbook in one
place. Go to `CONTENT-PLAN.md` Part 3.

Nothing was lost in the move. The gaps this file was written to catch are now
Stage 3 (write the whole standard in one pass) and Stage 4 (verify before
presenting): stale `excerpt` feeding the JSON-LD description, unmeasured
`seoMeta.js` lengths, un-bumped `sitemap.xml` lastmod, missing `llms.txt`
coverage, paragraph length guessed instead of measured, and FAQ schema that
does not mirror the visible section.

Two notes worth keeping that did not fit cleanly into the runbook:

**Which existing pages to optimize.** Pull Search Console over 28 to 90 days,
sort by impressions, and look for pages with real impressions at a weak
position or a low CTR for their position. Prioritise beatable SERPs over
authority-gated head terms. Per `CONTENT-PLAN.md` Part 2 item 4, on-page work
on the authority-gated pages was already done across every high-impression US
page in July and did not move them, so do not redo it expecting a different
result.

**llms.txt descriptions for `/tools/*` pages.** Write every line from the
page's own verified source, its `prerender.js` meta entry or the component
itself, never from `ToolsHub.jsx` card text. The 2026-07-13 pass copied hub
marketing blurbs and shipped two factual errors: a tool credited with an
earnings estimate it does not have, and another given a different tool's
feature. If a description makes a checkable claim, grep the component for it.
