# Research: comedy-video-ideas

Target query: `comedy video ideas`
Volume: 1,650/mo (Keyword Planner export, 2026-08-13, seed "youtube video ideas")
Researched: NOT DONE, see below
Status: `SHIPPED 2026-08-14 (commit 839a04d24), Stages 1 and 2 still owed`

**Read this before touching the comedy post.** It was written on 2026-08-14
before this process existed, in the wrong order, and this file records the real
state rather than pretending otherwise.

---

## 1. The live top 10

**NOT DONE.** No SERP was fetched for this query. No URLs, no dates, nothing to
record. The post shipped anyway on explicit instruction, so this is now an edit
to a live page rather than a blocker.

## 2. Coverage matrix

**NOT DONE.** No competitor sections were mapped. The article's structure came
from the gaming post's shape, which is exactly what Part 3 Stage 3 now
forbids.

## 3. The gap

Not established, because sections 1 and 2 were skipped. The article asserts a
six-mechanism framework that is genuinely original as framing, but nothing
confirms it answers the query better than the pages that currently rank.

## 4. The one test

> Could a competitor without our database have written this article?

**Partly yes, and that is the problem.** The measured quarter (length, format
mix) passes. The 42 ideas and the six-mechanism framework are editorial and any
competent writer could produce them. That is acceptable only if the coverage
matrix shows the framework closes a real gap, which is unverified.

## 5. The data pull

Source: `channel_videos`, comedy niche, `published_at >= '2025-01-01'`.

| Check | Value | Floor | Pass |
|---|---|---|---|
| Videos behind the length and format figures | 699 | 500 | yes |
| Channels behind the cadence figure | 13 | 30 | **NO** |
| Date filter applied | yes | required | yes |
| Median and mean both reported | yes | required | yes |

Published: 9.0 min median, 19.5 min mean (2.17x skew), 26.7% Shorts share,
median clears the 8-minute mid-roll line.

**Dropped for failing the floor:** the 1.8 uploads/week cadence figure, from
only 13 channels. Removed 2026-08-14 from the data table, the intro, both FAQ
copies, and the llms.txt description. Do not reintroduce it.

## 6. Outline

Not derived from research. Current shape: data section, why comedy ideas fail,
six mechanism sections carrying 42 numbered ideas, parody copyright, prank
policy, titles and thumbnails, shooting without a crew, mid-roll, FAQ,
conclusion.

## 7. Approval

Presented: no. The article was written before an outline was ever shown.

---

## 8. Stage log

- [ ] **Stage 1, research file complete** — blocked, sections 1 to 3 empty
- [ ] **Stage 2, presented and approved** — never happened
- [x] Stage 3, written (retroactively brought up to standard, see below)
- [x] Stage 4, verified
- [x] Stage 5, built, pushed and verified live by content check
- [ ] Stage 6, close the loop — CONTENT-PLAN updated 2026-08-14; Search Console
      indexing still to request (needs the user's account)

### Brought up to standard on 2026-08-14 (retroactive Stage 3 and 4)

- 42 ideas converted from six 4-column tables to the house list format with
  real explanation prose. Tables 9 to 3, table rows 68 to 19.
- Bold-lead paragraphs 38 of 55 down to 5, matching the reference post.
- `CtaCard` added mid-article, pointing at the video ideas generator.
- Invented "Reach for a new channel" ranking column removed from the mechanism
  table and replaced with "The hard part". A ranking column beside a measured
  table reads as measured.
- Explicit disclosure added: upload figures are measured, the six mechanisms
  are not.
- Six unbacked superlatives rewritten as flat statements. Hedges cut to 2,
  matching the reference.
- Intro rewritten in the `/blog/youtube-demonetization` mode: taxonomy in
  sentence one, no hook, no roadmap paragraph.
- Headline changed from "42 Premises That Land Without Setup" to "42 for
  People Who Are Not Naturally Funny".
- Every figurative use of "land" removed (10 instances). Only "clapping on
  landing" survives, which is literal.
- Locale fixed to US English and dollars.
- Cover shipped: 1600x900 JPG, 97KB, alt text corrected to match the image.
- Verified: parses clean, all 55 paragraphs within 5 lines, FAQ array mirrors
  the visible section, desktop and mobile screenshots read.

### Outstanding

- **Stage 1 and 2, still owed.** Fetch the top 10, build the coverage matrix,
  and add any section a ranking competitor has that this post lacks. The page
  is live, so this is an edit, not a rewrite. Do not leave it indefinitely.
- **Search Console indexing.** Needs the user's account: URL Inspection on
  `/blog/comedy-video-ideas`, then Request Indexing.
