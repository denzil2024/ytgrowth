# Research: youtube-video-ideas (PILLAR REWRITE)

Target query: `youtube video ideas`
Volume: not re-pulled this session, pillar since 2026-05-17, ranking already established.
Researched: 2026-08-19
Status: `researching — data complete (14/14 niches), outline drafted, awaiting approval`

This is a rewrite of the existing pillar, not a new post. Current version
(live since 2026-05-17) predates the data-driven approach and the voice
standard: 10 generic formats, zero measured data, framed narrowly for
"beginners with zero subscribers," no FAQ. Every spoke it anchors (gaming,
tech, cooking, comedy, soon music) now has 28-36 ideas and a real upload-data
table. The pillar is currently the weakest page in its own cluster.

## 1. The live top 10

| # | URL | Fetched | Format | Notes |
|---|---|---|---|---|
| 1 | studiobinder.com/blog/creative-youtube-video-ideas-list | 2026-08-19 | 161-165 ideas, niche-segmented | Biggest competitor. Organizes by NICHE (tech, gaming, beauty, music, fitness, food, funny/entertainment, etc.), not by format. Zero real data. |
| 2 | veed.io/learn/youtube-video-ideas | 2026-08-19 | 105 ideas, goal-segmented | Beginners / how-to / review / funny / listicle / kids / other. One weak third-party stat (86% Think with Google), nothing proprietary. |
| 3 | uppbeat.io/blog/youtube/youtube-video-ideas | 2026-08-19 | 61 ideas, goal-segmented | Intro / educational / entertain / reaction / community / think-outside-box. Anecdotal creator name-drops (MrBeast, PewDiePie), no data. |
| 4 | jasper.ai/blog/video-ideas | 2026-08-19 | 39 ideas, audience-segmented | B2B slant: content marketers / businesses / creators / affiliate marketers. Off-angle for our individual-creator audience. No data. |
| 5 | quickframe.com/blog/best-youtube-video-content-ideas | 2026-08-19 | 25 ideas, format-segmented | Closest in shape to our existing pillar: intro, BTS, how-to, day-in-life, review, Q&A, etc. One external citation (July 2025 monetization update), no proprietary data. |
| — | pinterest.com/.../youtube-video-ideas | 2026-08-19 | — | Pinterest board, not a real competing page, skipped. |
| — | goodreads.com/author_blog_posts/... | 2026-08-19 | — | Author blog post on a book site, off-topic host, skipped. |
| — | trenalittle.com/.../15-video-ideas | 2026-08-19 | — | Small personal blog, thin, not a real SERP competitor at this volume, skipped. |

SERP character: dominated by scale (25 to 165 ideas), zero real data anywhere.
Two structural approaches exist: niche-segmented (StudioBinder, tries to be
the one-stop shop for every niche in one page) and format-segmented (VEED,
Uppbeat, QuickFrame, our current pillar). Format-segmented is the right call
for us specifically because we already have dedicated, deeper niche spokes
(gaming, tech, cooking, comedy, music) that a niche-segmented pillar would
just duplicate and dilute. Nobody else in this SERP has that hub-and-spoke
architecture; it is a structural advantage independent of the data angle.

## 2. Coverage matrix

Format-level union across all 5 fetched competitors (niche-specific
categories from StudioBinder folded out, since those belong to our spokes,
not the pillar):

| Format | StudioBinder | VEED | Uppbeat | Jasper | QuickFrame | Ours (current) |
|---|---|---|---|---|---|---|
| Channel intro | x | x | x | x | x | x |
| How-to / tutorial | x | x | x | x | x | x |
| Day in the life / routine | x | x | x | | x | x |
| Behind the scenes | | | | | x | x |
| Listicle / ranked | x | x | | | | x |
| Explainer | x | x | | | x | x |
| Reaction / commentary | x | x | x | | | x |
| Q&A / FAQ | | x | x | | x | x |
| Before/after / transformation | x | | | | x | x |
| Review / comparison | x | x | x | x | x | x (folded into "product reviews") |
| Unboxing / haul | x | | | | x | **missing** |
| Travel | x | | | | x | **missing** |
| Collab / interview / mini-doc | | | | | x | **missing** |
| Time-lapse / progress | x | | | | x | **missing** |
| Live streaming | | | x | | x | **missing** |
| Video podcast / episodic show | | | | | x | **missing** |
| Challenge / trend remix | | | x | | x | **missing** |
| Community-powered (submissions, debates, polls) | x | | x | | x | **missing** |
| Branded / case-study examples | x | | | | | not relevant to our audience |
| Kids content | | x | | | | not relevant to our audience |

Strongest competitor section count: StudioBinder at ~11 major categories (once
niche-specific ones are excluded) covering 165 ideas total. Ours currently:
10 categories, 10 ideas. If ours stays at 10 formats, that is competitive on
category count already; the real gap is ideas-per-format (StudioBinder
clears dozens per category, we have exactly one idea per format) and the
missing 8 format categories above.

## 3. The gap

What every one of them misses: real upload data, same as every spoke gap.
Nobody backs a single claim with measured numbers.

What we can answer that they cannot: a real cross-niche comparison, actual
median/mean length and Shorts share for every major content niche, pulled
from our own tracked channel data, not estimated or assumed. This is the
pillar-level equivalent of what each spoke's measured table already does for
one niche, scaled up to show the pattern across all of them at once (see
Section 5).

Intent gap: every competitor dumps format ideas and niche ideas into one
undifferentiated wall of 25-165 items with no routing. A reader in the
cooking niche has to wade through unrelated tech and gaming entries to find
their five relevant ones. Our hub-and-spoke structure already solves this
better in principle; the rewrite needs to make that structure obvious on the
page itself, not just in the URL graph.

## 4. The one test

> Could a competitor without our database have written this article?

The format list itself: yes, largely, same as every spoke. **The cross-niche
data table is the differentiator, and it clears this test more decisively
than any single spoke does**, since no competitor tracks upload behavior
across multiple niches simultaneously, let alone with a consistent
methodology. Passes.

## 5. The data pull

```sql
SELECT COUNT(DISTINCT cv.channel_id) AS channels, COUNT(*) AS videos,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_seconds) / 60.0 AS median_min,
  AVG(duration_seconds) / 60.0 AS mean_min,
  AVG(CASE WHEN duration_seconds <= 60 THEN 1.0 ELSE 0.0 END) AS shorts_share
FROM channel_videos cv
WHERE cv.channel_id IN (SELECT DISTINCT channel_id FROM top_channel_cache WHERE category = $1)
AND cv.published_at >= '2025-01-01' AND cv.duration_seconds IS NOT NULL
```

Run 2026-08-19 across all 14 tracked categories:

| Category | Channels | Videos | Median | Mean | Shorts | Floor |
|---|---|---|---|---|---|---|
| Gaming | 69 | 4,141 | 17.9 min | 61.2 min | 20.5% | PASS |
| Tech | 127 | 5,876 | 6.2 min | 10.3 min | 22.6% | PASS |
| Beauty | 46 | 2,618 | 1.3 min | 7.5 min | 44.5% | PASS |
| Finance | 32 | 2,065 | 10.1 min | 13.3 min | 24.0% | PASS |
| Cooking | 59 | 3,480 | 4.7 min | 8.7 min | 20.4% | PASS |
| Fitness | 65 | 4,236 | 2.1 min | 8.8 min | 42.4% | PASS |
| Music | 181 | 6,801 | 2.8 min | 8.3 min | 37.0% | PASS |
| Travel | 75 | 4,192 | 18.7 min | 20.0 min | 22.4% | PASS |
| News | 37 | 5,978 | 4.9 min | 23.0 min | 12.3% | PASS |
| Education | 183 | 8,219 | 8.8 min | 28.1 min | 20.2% | PASS (fixed 08-20) |
| Vlogs | 250 | 12,645 | 8.6 min | 12.6 min | 31.1% | PASS (fixed 08-20) |
| Comedy | 155 | 6,750 | 1.6 min | 11.7 min | 34.4% | PASS (fixed 08-20) |
| Sports | 141 | 8,513 | 2.9 min | 19.9 min | 31.0% | PASS (fixed 08-20) |
| Entertainment | 141 | 7,909 | 3.2 min | 11.3 min | 25.1% | PASS (fixed 08-20) |

**All 14 of 14 tracked categories now clear the floor**, confirmed 2026-08-20
via the expanded-discovery run (commit `6714b02bf`, 30 search.list calls,
well under the 100/day sub-limit). The pillar's cross-niche table is fully
data-backed, no gaps, no categories missing. Gaming's mean (61.2 min) is a genuine outlier worth a
sentence in the article, not a data error: long-form Let's Plays and full
playthroughs pull it up hard against a 17.9-minute median. Education shows
the same pattern even more sharply (8.8 min median vs 28.1 min mean),
worth its own callout: a few very long lecture-style uploads sit inside an
otherwise short-form-heavy sample.

Note: comedy's fresh numbers here (155 channels, 1.6 min median, 34.4%
Shorts) are far more usable than what `research/comedy-video-ideas.md`
had available when that spoke shipped (13 channels, dropped for failing the
floor). Worth a note for whoever next touches the comedy spoke: the
underlying data gap that forced dropping its cadence figure is now fixed.

Known inconsistency to flag, not hide: `/blog/video-length-by-niche`
published different tech and cooking figures under a different sample and
date window (all tracked channels, not `top_channel_cache`-scoped, `>=
2026-01-01` not `2025-01-01`). The pillar will use the same methodology as
every spoke (`top_channel_cache` category join, `>= 2025-01-01`) for
internal consistency across the whole video-ideas cluster, and will not
cite the video-length-by-niche numbers directly to avoid contradicting
itself. That older study's own numbers still need a dedicated audit, logged
already in `research/cooking-video-ideas.md`.

Figures to publish: the full 14-row table above (once the 5 pending rows are
confirmed), plus the specific callouts: gaming's 61.2-min mean vs 17.9-min
median as the widest skew in the dataset, beauty and fitness both over 40%
Shorts share as the two most Shorts-heavy niches tracked, news at 12.3% as
the least.

## 6. Outline

Working title: TBD, driven by scope below, likely keeping "YouTube Video
Ideas" as the core phrase with a scale claim, not the current beginner-only
framing (the beginner angle undersells a page meant to anchor experienced
creators researching a new niche too).

Slug: `youtube-video-ideas` (unchanged, do not touch the URL, it already
ranks).

Angle: the format-first pillar every niche spoke rolls up to, backed by a
real cross-niche data table instead of assumed rules of thumb, at a scale
that matches or beats the biggest competitor (StudioBinder's ~165) while
staying evergreen and format-first instead of duplicating spoke-level
niche content.

Scope target: "many many ideas" per direction. Given StudioBinder's 165 is
achieved by folding in dedicated niche sections we already cover better in
spokes, matching format-category count and going deeper per format (roughly
8-12 ideas per format across 14-16 formats) lands in the 100-150 range
without re-doing niche-specific work the spokes already own. Exact count
falls out of drafting, not fixed here, per the standing rule against fixed
counts.

- H2: What YouTube Channels Actually Publish (Across 14 Niches) — the
  cross-niche data table, the section no competitor has at all
- Expand every one of the current 10 formats from 1 idea to roughly 8-12
  concrete, nameable ideas each (not generic restatements): channel intro,
  how-to/tutorial, review/comparison, day-in-life/routine, behind-the-scenes,
  listicle/ranked, explainer, reaction/commentary, Q&A/FAQ,
  before-after/transformation
- Add the 8 format categories identified as gaps in Section 2: unboxing/haul,
  travel format (not the niche, the format: travel-adjacent formats any
  niche can use), collab/interview/mini-doc, time-lapse/progress,
  live streaming, video podcast/episodic, challenge/trend-remix,
  community-powered (submissions/debates/polls)
- H2: Which Niche Guide to Read Next — replaces the two scattered link
  sentences added today with a real, labeled section, one line per spoke
  with a genuine differentiator, modeled on SavvyHomie's
  `## More [Cluster] Guides` pattern (see CONTENT-PLAN.md Part 5). This is
  the internal-linking half of the work, done properly once the pillar
  itself is deep enough to deserve linking to.
- FAQ, count driven by real distinct questions
- Creative closing H2, not "Final Thoughts", not reused from any spoke

Internal links out: every current spoke (shorts, vlog, challenge, gaming,
tech, cooking, comedy), music once it ships, plus tool links already present
(keyword explorer, competitor analysis, channel audit, video ideas
generator).

Mid-article CTA: video ideas generator tool, matching every spoke.

Cover image: keep existing `/blog/youtube-video-ideas-cover.webp` unless a
rewrite of this scale warrants a refresh; not urgent, decide at Stage 3.

## 7. Approval

Presented: pending
Outcome: pending

---

## 8. Stage log

- [x] Stage 1, research file complete (data pull pending 5 of 14 categories,
      script pushed and ready, awaiting one console run)
- [ ] Stage 2, presented and approved — pending
- [ ] Stage 3 — not reached
- [ ] Stage 4 — not reached
- [ ] Stage 5 — not reached

### Outstanding

- Data pull is complete, 14/14 categories. Nothing left to run.
- This is a rewrite of a live, ranking page. Confirm before Stage 5 whether
  to preserve the exact URL/slug (yes, per above) and whether old inbound
  links/anchor text elsewhere in the site still make sense against a
  reframed, less beginner-only title.
