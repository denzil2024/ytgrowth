# Research: tech-video-ideas

Target query: `tech video ideas for youtube`
Volume: 50/mo per `keyword-exports/Keyword Stats 2026-08-13 at 00_05_13.csv` — CONTENT-PLAN.md's queue carried 1,300/mo, unverified against the actual export. Every tech-ideas variant in that file caps at 50/mo. Not re-checked against a direct Keyword Planner search (only the discovery-mode export), so this is a flag, not the kill reason.
Researched: 2026-08-19
Status: `DONE — shipped 2026-08-19`

## 1. The live top 10

| # | URL | Fetched | Format | Notes |
|---|---|---|---|---|
| 1 | packapop.com/.../25-tech-youtube-video-ideas | 2026-08-19 | 25 ideas | Thumbnail styles, monetization, tool-plug sections. No measured data. |
| 2 | jaisonchristopher.in/.../top-10-tech-video-topics | 2026-08-19 | 10 broad categories | Product reviews, unboxings, how-to, news, app reviews, comparisons, setups, explainers, hacks, predictions. No data. |
| 3 | armchairarcade.com/.../6-best-youtube-tech-content-ideas | 2026-08-19 | 6 categories | Product reviews, tech news, DIY, how-to, tips, comparisons. No data. |
| 4 | facelesschannels.net/tech-youtube-channel-ideas | 2026-08-19 | 9 channel concepts | Off-intent: channel ideas with sub/earnings examples, not video ideas. |
| — | subscribr.ai/.../tech-youtube-video-ideas | 2026-08-19 | — | 410 Gone, dead page still ranking. Same pattern as cooking's research. |

## 2. Coverage matrix

Every competitor's idea set collapses into the same handful of buckets: product
reviews, unboxings, how-to/tutorials, tech news, comparisons, tips/hacks,
setups, explainers/predictions. No competitor cites measured data. This is the
thinnest, most genuinely-interchangeable SERP of any video-ideas spoke so far —
every page could have been written by any of the others.

## 3. The gap

What they all miss: real upload data (same gap as every other spoke). The
question is whether we can fill it.

## 4. The one test

> Could a competitor without our database have written this article?

The idea list itself: no, same shape as every competitor reviewed (Packapop,
jaisonchristopher, armchairarcade — all pure opinion, no data, and largely
interchangeable with each other). The measured table is the differentiator.
**Passes, now that Section 5 clears the floor.**

## 5. The data pull

```sql
SELECT COUNT(DISTINCT cv.channel_id) AS channels, COUNT(*) AS videos
FROM channel_videos cv
WHERE cv.channel_id IN (
    SELECT DISTINCT channel_id FROM top_channel_cache WHERE category = 'tech'
)
AND cv.published_at >= '2025-01-01';
```

First run 2026-08-19 via Railway Postgres console: **17 channels, failed the
floor.** Root cause: `top_channel_cache`'s single discovery query ("tech
reviews") only ever surfaced 17 distinct channels total — not a backfill gap,
a discovery gap (cooking cleared the floor at 59 channels under the same
mechanism, so this was category-specific).

Fixed 2026-08-19 via `scripts/expand_category_discovery.py`: ran 6 broader
search terms ("tech reviews", "tech youtuber", "gadget review channel",
"smartphone review channel", "tech unboxing channel", "consumer tech
channel"), found 281 unique candidate channels, 129 qualified (>=5,000 subs,
>=15 videos), persisted 10 new `top_channel_cache` rows (most of the 129 were
already present as candidates from other categories/regions) and 5,715 new
`channel_videos` rows. Re-ran the floor query after:

| Check | Value | Floor | Pass? |
|---|---|---|---|
| Channels behind the figure | **127** | 30 | **yes** |
| Videos behind the figure | 5,876 | 500 | yes |
| Date filter applied | yes (`published_at >= '2025-01-01'`) | required | yes |
| Median AND mean reported | 6.2 min / 10.3 min (1.66x skew) | required | yes |

Figures to publish: median length 6.2 min, mean 10.3 min, 1.66x skew, 22.6%
Shorts share. 127 channels, 5,876 videos.

Figures dropped for failing the floor: none — the fixed dataset clears every
check.

## 6. Outline

Working title: TBD, will not be a template count — driven by the matrix in
Section 2.
Slug: `tech-video-ideas`
Angle: measured upload data (length, format, Shorts share across 127 real
tech channels) plus a curated idea list, same recipe as cooking/gaming/comedy.

- H2: What Tech Channels Really Publish — the measured table (median 6.2 min,
  mean 10.3 min, 22.6% Shorts share, 127 channels/5,876 videos), the section
  no competitor has
- H2: idea sections grouped by mechanism, covering the UNION of Section 2:
  product reviews/comparisons, unboxings, how-to/tutorials, tech news,
  app reviews, setups/workspace, explainers (AI/blockchain/etc.), tips/hacks,
  predictions — exact grouping and count TBD once ideas are drafted
- H2: a tech-specific gap competitors miss — candidate: privacy/security
  walkthroughs (none of the four reviewed touch it directly as its own
  section) or a "channel setup mistakes" angle, confirm during drafting
- FAQ, count driven by genuinely distinct questions
- Creative closing H2, not "Final Thoughts"

Internal links out: `/blog/youtube-video-ideas` (pillar), `/blog/gaming-video-ideas`,
`/blog/comedy-video-ideas`, `/blog/cooking-video-ideas` (siblings).
Mid-article CTA: video ideas generator tool, same as siblings.
Cover image needed: yes, photographic, house pattern (creator mid-task, warm
light, candid) — ask for a real photo, matching cooking's approach, not
generated.

## 7. Approval

Presented: 2026-08-19
Outcome: approved

---

## 8. Stage log

- [x] Stage 1, research file complete
- [x] Stage 2, presented and approved
- [x] Stage 3, full draft written in one pass (33 ideas, six named formats:
      The Verdict, First Contact, Tested Not Assumed, Explain It From Zero,
      My Actual Setup, The News Nobody Explained Right; plus the privacy and
      security gap section)
- [x] Stage 4, verified: `check-drift.mjs` passed clean (0 banned words, 1
      shared H2 with cooking, well under the fail threshold), FAQ array
      matches the visible section word for word (8/8), idea count consistent
      across title/excerpt/seoMeta/llms.txt (33), `npm run build` vite+prerender
      succeeded and the new route was confirmed prerendered with real content,
      paragraph checker passed (38/38 paragraphs <=5 lines), screenshots read.
- [x] Stage 5, built with `BUILD_API_URL=https://ytgrowth.io`, 115 routes
      prerendered clean, committed and pushed.
- [x] Stage 6, close the loop — CONTENT-PLAN.md queue and Shipped table
      updated 2026-08-19.

### Corrections made after "verified", before push

- A real cover photo was sourced (creator unboxing headphones at a desk,
  camera and monitor visible) and converted to 1600x900 JPG.
- `frontend/scripts/inject-ezoic.js` used `node:fs`'s `globSync`, Node 22+
  only, which crashed `npm run build` on this machine's Node 20.17.0 after
  vite build and prerender both completed successfully. Fixed with a plain
  recursive directory walk, no version dependency, unrelated to this
  article but blocking every future `npm run build` until fixed.
- Full second-pass proofread against the `/blog/youtube-demonetization`
  voice reference, user-directed, after the first draft read as too close
  to cooking's phrasing and too soft ("builds trust", "beats X every time"
  style unsupported claims) to match "authority, no fluff." Rewrote the
  intro, cut a real restatement bug (the same "4-minute video padded to
  8 minutes" argument was made twice, once mid-article and again near the
  length table), and replaced several vague claims with the actual
  mechanism behind them. `check-drift.mjs` and the paragraph checker both
  re-verified clean after each round.
- The 1,300/mo volume CONTENT-PLAN.md originally carried for this slug does
  not match the keyword export in this repo (every tech-ideas variant caps at
  50/mo there). Not blocking — worth a direct Keyword Planner re-check before
  relying on that number elsewhere, but the article's case rests on the one
  test passing, not on volume alone.
- Cross-post data discrepancy, not fixed here (out of scope for Stage 3/4 on
  this article): the already-live `/blog/video-length-by-niche` post reports
  tech at a 9.9-minute median / 10.4-minute mean / 9.7% Shorts share (1,198
  videos, "since January 2026", drawn from all tracked tech channels). This
  article's approved research figures are 6.2-minute median / 10.3-minute
  mean / 22.6% Shorts share (5,876 videos, `published_at >= 2025-01-01`,
  drawn specifically from `top_channel_cache` category='tech' channels after
  the 08-19 discovery expansion). Different sample population and different
  date filter explain the gap, but a reader who opens both posts will see two
  different tech-length numbers with no cross-reference explaining why. This
  article does not link to `video-length-by-niche` for that reason. Worth a
  decision on whether to reconcile or annotate the older post.
