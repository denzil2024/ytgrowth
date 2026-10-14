# Research: youtube-views-per-sub-tier

Plan entry: `#19` (DATA STUDY) · Feature: `Channel Audit`
Target query: `average views per video by subscriber count`
Researched: `2026-10-13`

---

## 1. SERP (5 queries, scripts/serper-batch.mjs)

Target query "average views per video by subscriber count youtube" **passes**:
top-3 = socialblade.com, modash.io, reddit.com. The plan's named competitors
(modash, sanishtech) both appear on page 1 (modash #2, sanishtech #4),
confirming the plan entry's top-3 claim close enough to proceed — socialblade
replaces reddit's expected #1 slot but reddit is still top-3.

Two of the four other queries failed the SERP check (dominated by monetization
/ "how much does YouTube pay" content, an unrelated cluster that kept
surfacing, same pattern noted in prior rounds) and were not used for PAA.

PAA used (filtered for relevance, monetization-cluster questions excluded):
1. "What is the average number of views per subscriber on YouTube?" — real
2. "What percentage of subscribers watch your videos?" (phrasing merged from
   two near-duplicate PAA hits) — real
3. "What is the average amount of views for a successful YouTube channel?" — real

**Correction, 2026-10-14:** the 4th FAQ was drafted as "Is 2000 views in 1
day good?", real PAA but already an FAQ on both `/blog/youtube-views-dropped
-suddenly` and `/blog/youtube-view-growth-curve` (3 articles answering the
identical question would have diluted which page Google treats as
authoritative for it). Shipped initially with the duplicate anyway, caught
on a later pass and swapped for an editorial question this article alone
can answer with real data: "How many views should a video with 100,000
subscribers get?", answered with the measured 7,722 median. Logged here so
the next research round checks this FAQ against sibling articles before
drafting, not just at write time.

## 2. Competitor research: no one publishes this data

**modash.io** (`/youtube-average-views-calculator`) and **sanishtech.com**
(`/youtube-average-views-calculator`) are both **single-channel calculator
tools**, not benchmark articles. You paste in a channel and it averages
*that channel's own* last N videos. Neither publishes a views-by-subscriber
-tier table. sanishtech explicitly says "there is no universal good average."

**shortsgenerator.ai** (`/views-to-subscriber-ratio`) claims to cover a
"views to subscriber ratio benchmark" per its title but the actual page has
no benchmark numbers, percentages, or tier breakdown — only unrelated,
unsourced engagement-growth claims in its FAQ.

**The Reddit thread** cited in the SERP ("Average views per video is 41
views as per study") could not be verified via WebSearch; no study matching
that figure was found, and 41 views is implausibly low for any of our
tiers. Not citing it. Reddit threads in this space (`r/NewTubers` "what
percentage of subs watch your videos") are individual self-reports, useful
as color/anecdote, not as a dataset.

**No competitor in the top 10 of any query publishes an actual tiered
dataset.** This is the full differentiator: every result is either a
single-channel calculator or an anecdotal forum thread. This product has
the only real cross-channel dataset in the space for this specific
question.

## 3. Floor check (scripts/check_study15_floor.py, run 2026-10-13)

Overall: 1,152 channels, 55,964 videos — passes easily.

Per-tier:
| Tier | Channels | Videos | Result |
|---|---|---|---|
| 1M+ | 583 | 32,653 | PASS |
| 100K | 378 | 17,480 | PASS |
| 10K | 113 | 3,281 | PASS |
| 1K | 24 | 1,301 | **FAIL** (need 30+ channels) |
| below 1K | 54 | 1,249 | n/a, not in plan scope |

**The 1K tier is dropped from the study.** The plan entry named 1K/10K/100K/1M;
this ships as 10K/100K/1M only, with the 1K drop stated plainly in the
article rather than silently omitted. All 1K-tier channels are uncategorized
(no niche data at all), consistent with dropping it.

## 4. The real numbers (scripts/query_views_per_sub_tier_study.py, run 2026-10-13)

Method: each channel tiered by its latest `channel_metric_snapshots`
subscriber count. Each video's latest `video_metric_snapshots` views count,
`published_at >= 2025-01-01`, channels need 5+ videos. Per-channel median
views, then the tier figure is the **median of those per-channel medians**
(a median of medians, so one outlier channel can't skew a tier). Subscriber
-watch share = per-channel median views / that channel's subscriber count,
again reported as a median across channels, not a pooled ratio.

**Caveat to state in the article:** "median views per upload" here means
views as of our most recent weekly snapshot, not a true 30-day window
(snapshots are weekly; see DATA-STUDIES.md "not measurable" list for why a
true first-30-days figure isn't available). Phrase as "views as of our
latest check" or similar, not literally "30-day views."

### Tier-wide figures

| Tier | Median views/upload | Channels |
|---|---|---|
| 10K | 1,502 | 96 |
| 100K | 7,722 | 343 |
| 1M | 65,414 | 561 |

### Implied share of subscribers who watch a new upload

| Tier | Median share | Channels |
|---|---|---|
| 10K | 10.58% | 96 |
| 100K | 5.29% | 343 |
| 1M | 2.93% | 561 |

Clean, monotonic decline — the bigger a channel gets, the smaller the share
of its subscriber base actually watches any single new upload. This is the
strongest, most ownable single finding: it directly answers "why do my views
feel low compared to my subscriber count," reframing a common anxiety as a
universal pattern, not something broken.

### Niche breakdowns (only cells clearing 30 channels / 500 videos)

**1M tier — 9 of 15 niches clear the floor:**
| Niche | Median views/upload | Channels |
|---|---|---|
| travel | 155,916 | 55 |
| gaming | 127,354 | 91 |
| tech | 109,076 | 34 |
| uncategorized | 169,792 | 31 |
| music | 61,572 | 56 |
| fitness | 47,660 | 45 |
| cooking | 41,110 | 71 |
| beauty | 40,478 | 47 |
| education | 33,245 | 50 |

(news, sports, finance, entertainment, comedy, vlogs all below floor at 1M,
not reported individually)

**100K tier — only 3 of 15 niches clear the floor:**
| Niche | Median views/upload | Channels |
|---|---|---|
| travel | 29,702 | 30 |
| education | 6,473 | 78 |
| music | 4,220 | 51 |

**10K tier — only 2 of 5 niches clear the floor:**
| Niche | Median views/upload | Channels |
|---|---|---|
| music | 5,710 | 30 |
| education | 740 | 30 |

**Flagged finding, education at 10K vs. 100K:** 740 views/upload at 10K
subs vs. 6,473 at 100K is a much bigger jump than any other niche shows
across the same tier gap (e.g. travel goes 29,702 → 155,916, roughly 5x;
education goes 740 → 33,245 at 1M, roughly 45x). State this plainly as an
observed pattern, with the likely explanation being that small education
channels skew toward long-tail, slow-burn tutorial content that a weekly
snapshot catches early in its view-accumulation curve, understating its
eventual total versus a channel with a more front-loaded view curve (viral
/ trend-driven content). Do not claim certainty on the cause; state it as
the probable explanation, not a proven one.

## 5. Coverage matrix and differentiator

| What a strong resource needs | modash/sanishtech | Our coverage |
|---|---|---|
| Single-channel average calculator | yes (their whole product) | Not building this, Channel Audit already shows the owner their own numbers in context |
| Cross-channel benchmark by subscriber tier | no | Yes, real tiered medians, 1,152 channels |
| Niche-level breakdown | no | Yes, where the cell clears the floor |
| Implied subscriber-watch-share | no | Yes, the standout finding |
| Mean vs. median discussion | yes (sanishtech) | Medians used throughout per DATA-STUDIES.md's data floor rule; brief note on why |

**Differentiator:** no competitor publishes a real cross-channel dataset for
this question at all. Every ranking result is a per-channel calculator tool
or an anecdotal thread. This is a genuine, citable first for this specific
query.

## 6. Outline (for approval)

1. Open with the subscriber-watch-share finding (the real number, stated
   first per house style): 10.58% / 5.29% / 2.93% at 10K/100K/1M, framed as
   answering "why do my views feel small compared to my subscriber count."
2. Method section: what counts as a "view," the weekly-snapshot caveat
   stated honestly, median-of-medians explained plainly, 1K tier dropped
   with the floor-check reason given directly.
3. Tier-wide table: median views per upload at 10K/100K/1M.
4. Why the share shrinks as channels grow (bigger audience, same rough
   number of people who see any one notification/feed placement; not every
   subscriber is still active).
5. Niche breakdown at 1M (9 niches, full table).
6. Niche breakdown at 100K (3 niches only, explicitly note why the rest
   are excluded, floor-check language).
7. Niche breakdown at 10K (2 niches only, same treatment).
8. The education-at-10K anomaly, flagged and explained as probable
   snapshot-timing effect, not asserted as fact.
9. What this means for a channel that feels "stuck" relative to its
   subscriber count (reframe: normal pattern, not a broken channel).
10. How to read your own numbers against these benchmarks (practical
    section, ties to Channel Audit).
11. FAQ (4 real PAA-sourced questions above).
12. Closing H2, plain and declarative, stating the core finding again.

Internal links: two-way candidates — `/blog/youtube-channel-not-growing`
(views feel stuck), `/blog/youtube-view-growth-curve` (views-over-time
mechanics), both to be confirmed against actual content before final
linking.

CtaCard: Channel Audit, per the plan entry — frame around comparing your
own channel's numbers against these real benchmarks.

**KPI note per CLAUDE.md rule 7:** this is a data study, not a diagnostic
post. Judge it by citations/shares, not by internal link clicks, per
FOUNDATION.md "The SaaS layer."
