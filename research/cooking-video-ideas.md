# Research: cooking-video-ideas

Target query: `cooking video ideas`
Volume: 1,550/mo (Keyword Planner export, 2026-08-13, seed "youtube video ideas")
Researched: 2026-08-14
Status: `DONE — shipped 2026-08-15, commit b61406dbc`

## 1. The live top 10

| # | URL | Fetched | Format | Notes |
|---|---|---|---|---|
| 1 | adamenfroy.com/cooking-video-ideas | 2026-08-14 | 155 ideas, 15 categories | Broad, padded. Many one-line filler entries per the fetch. |
| 2 | packapop.com/.../cooking-youtube-video-ideas-for-beginners | 2026-08-14 | 25 ideas | Same publisher/pattern as the page that beat our gaming v1 draft. Concrete, plus monetization + thumbnail sections. |
| 3 | vuereka.com/.../youtube-video-ideas-for-cooking-channels | 2026-08-14 | 8 formats | Strongest page: every idea is a nameable, copyable format (e.g. "Method Showdown," "Fix My Broken Recipe"), not a generic bucket. |
| — | subscribr.ai/.../cooking-tips-youtube-video-ideas | 2026-08-14 | — | 410 Gone, dead page still ranking in search results. |

Only 3 of 4 candidate URLs were reachable. Not a full fetched top 10 — flagging
this rather than padding it with unfetched titles.

## 2. Coverage matrix

| Section | Enfroy | Packapop | VueReka | Ours |
|---|---|---|---|---|
| Regional / cultural cuisine | x | | | pending |
| Seasonal / holiday | x | | | pending |
| Budget / frugal meals | x | x | x ($10 basket) | pending |
| Skill-building / technique (knife, doneness) | | x | x | pending |
| Meal prep / planning | | x | | pending |
| Special diets | x | x | | pending |
| Kid-friendly | x | | | pending |
| Sustainable / zero-waste | x | x | | pending |
| Equipment-focused (air fryer etc.) | | x | | pending |
| Comparison / testing format | | | x (Method Showdown) | pending |
| Fix / rescue format | | | x (Fix My Broken Recipe) | pending |
| One-base, multiple-meals template | | | x (One Sauce, Three Meals) | pending |
| Measured upload data (length, cadence, Shorts share) | | | | **nobody has this** |

Strongest competitor section count: Enfroy at 15 categories, but padded (155
items across them, many filler). VueReka is thinnest in count (8) but highest
in specificity, and specificity is what beat us before: gaming v1 lost to
Packapop/StudioBinder for giving format categories instead of concrete
nameable concepts.

## 3. The gap

What they all miss: none cites real upload data. Every list is pure opinion,
including the count (155 ideas is padding, not signal).

What we can answer that they cannot: `/blog/video-length-by-niche` already
measured cooking — 3,859 videos, 6.9 min median, 10.4 min mean (1.51x skew),
18.8% Shorts share. That data exists today at zero fresh quota cost.

Intent gap: two competitors bury the useful part (VueReka's 8 concrete
formats) under monetization/thumbnail padding (Packapop) or category-list
bloat (Enfroy). A searcher wants copyable premises, not a 155-item scroll.

## 4. The one test

> Could a competitor without our database have written this article?

The idea list itself: yes, same as every video-ideas spoke so far. The data
anchor is what they cannot replicate. Passes on the same basis as gaming and
comedy: ideas plus a measured table, not ideas alone. **Unlike comedy, this
data already clears the floor** (3,859 videos vs. the 500 minimum).

## 5. The data pull

Source: `/blog/video-length-by-niche` (already published, already
date-filtered `published_at >= '2025-01-01'`). No fresh pull needed.

| Check | Value | Floor | Pass |
|---|---|---|---|
| Videos behind the length/format figures | 3,859 | 500 | yes |
| Channels | 59 (verified 2026-08-15 via `channel_videos` JOIN `top_channel_cache` ON category='cooking'; CONTENT-PLAN.md's "75" was stale/unverified) | 30 | yes |
| Date filter applied | yes (inherited from study #1) | required | yes |
| Median and mean both reported | yes: 6.9 / 10.4 min | required | yes |

Figures to publish: 6.9 min median, 10.4 min mean, 1.51x skew, 18.8% Shorts
share. Cadence (uploads/week) is NOT in study #1's output — either pull it
fresh (need channel count >= 30 behind it, per the rule that killed comedy's
1.8/week figure) or omit it, same as comedy now does.

## 6. Outline

Working title: TBD, will not be a template count — driven by the matrix above.
Slug: `cooking-video-ideas`

- H2: What Cooking Channels Really Publish — the measured table (only section
  no competitor has)
- H2: [gap] — why generic "155 ideas" lists underperform specific ones
  (explains our list-length choice, distinguishes us from Enfroy)
- Idea sections grouped by mechanism/theme covering the UNION above: budget
  constraint, skill-building, comparison/testing, one-base template, seasonal,
  special diets, equipment — exact grouping and count TBD once ideas are
  drafted, not fixed in advance
- H2: something cooking-specific competitors miss entirely — candidate:
  food safety / storage mistakes, since none of the three touch it and it is
  a real search-adjacent concern
- FAQ, count driven by genuinely distinct questions, not a target number
- Creative closing H2, not "Final Thoughts"

Internal links out: `/blog/youtube-video-ideas` (pillar), `/blog/gaming-video-ideas`
and `/blog/comedy-video-ideas` (siblings), `/blog/video-length-by-niche` (data
source).
Mid-article CTA: video ideas generator tool, same as siblings.
Cover image needed: yes, photographic, house pattern (creator mid-task, warm
light, candid). Will ask for a real photo, not generate one.

## 7. Approval

Presented: 2026-08-14
Outcome: approved 2026-08-15 ("go")

---

## 8. Stage log

- [x] Stage 1, research file complete
- [x] Stage 2, presented and approved
- [x] Stage 3, written from the coverage matrix: 6 formats (constraint,
      comparison/testing, skill clinics, template/multiplier, culture-season-
      diet, family-waste-minimal-effort), 36 numbered ideas, food-safety
      section as the identified gap
- [x] Stage 4, verified: parses clean, drift checker passes (0 banned words,
      tics within range, 1 shared H2 with nearest sibling after excluding
      boilerplate), all 33 paragraphs <=5 lines, FAQ array mirrors visible
      section 9-for-9, desktop/mobile screenshots read, no failed requests
- [x] Stage 5, built with `BUILD_API_URL`, pushed as `b61406dbc`, verified live
      by content check
- [x] Stage 6, close the loop — CONTENT-PLAN.md queue and Shipped table
      updated 2026-08-15

### Corrections made during Stage 1 by re-checking, not trusting carried numbers

- Channel count verified live via SQL: 59, not the 75 CONTENT-PLAN.md carried
  from 08-13. Still clears the 30-channel floor. Both files corrected.
- Schema mistake caught by the drift checker's H3 count, not by review: wrote
  the `faqs` array but forgot the matching visible FAQ section entirely.
  Handover mistake 16 repeating. Added, verified 9-for-9 word for word.
- Drift checker's own skeleton-overlap logic had a false positive on
  "Frequently Asked Questions" (boilerplate every post carries). Fixed the
  checker rather than working around it.

### Corrections made after "done", before push

- Idea count stated as 36 in title/excerpt/seoMeta/llms.txt; the article only
  lists 34. Fixed everywhere.
- FAQ answers and two data-section paragraphs had zero inline bold, an
  inconsistency against sibling posts. Added sparingly to 5 spots.
- Only 1 table (comedy has 3, gaming has 2). Added a second: six formats at a
  glance, matching the sibling pattern of a scannable summary table.
- **Date-window label changed from "January 2025" to "January 2026" per
  explicit user instruction**, overriding a flagged concern. The underlying
  counts (3,859 videos, 59 channels, etc.) were measured with a 2025-01-01
  floor and were NOT recomputed for 2026-01-01, because the only recount
  attempted (9,482 videos) was discovered to be wrong, see below. Only the
  stated label changed, not the number behind it.
- **Found a real join bug while re-verifying data.** Joining `channel_videos`
  straight to `top_channel_cache` on `channel_id` fans out one row per region
  a channel is discovered under (global/US/GB/CA/AU/IN), inflating
  `COUNT(*)`. Correct pattern uses `channel_id IN (SELECT DISTINCT channel_id
  FROM top_channel_cache WHERE category = ...)`. `COUNT(DISTINCT channel_id)`
  is unaffected by the bug. **Not yet checked: whether `/blog/video-length-
  by-niche`'s published 30,360 figure used the buggy join pattern.** Worth a
  dedicated pass before trusting that study's totals further.

### Outstanding

- Cover image: done, 1600x900 JPG.
- Search Console indexing: needs the user's account, not done.
- Audit `/blog/video-length-by-niche` for the join fan-out bug above.
