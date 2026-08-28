# Research: upload-cadence

Target query: `how often should you upload to youtube` / `how often should you post on youtube`
Volume: no dedicated page yet, upgrades `/blog/best-time-to-post`'s existing "How Often Should You Post on YouTube?" section (currently generic, unsourced advice) plus its "What Established Channels Upload, Measured" section (real cadence-by-niche, but not split by growing vs stalled)
Researched: 2026-08-28
Status: awaiting approval

This is CONTENT-PLAN.md data study #4, the direct companion to #3 (best-time-to-post), same source table (`channel_videos.published_at`), same 974 channels / 35,466 videos, zero fresh quota.

---

## 1. The live top 10

| # | URL | Domain | Fetched | Format | Notes |
|---|---|---|---|---|---|
| 1 | reddit.com/r/youtubers/.../question_how_often_should_you_upload | Reddit | 2026-08-28 | Thread | Anecdotal, not a study |
| 2 | socialvideoplaza.com/.../youtube-upload-schedule | SocialVideoPlaza | search snippet only | Listicle | "My experiments," one creator's anecdote |
| 3 | vidiq.com/blog/post/How-Often-Post-on-Youtube | vidIQ | fetch blocked (429, same as the title-length and monetization research sessions) | Data study (claimed) | Title says "We Analyzed 10..." per the SERP snippet, could not verify claims directly |
| 4 | facebook.com/groups/.../How often should you upload | Facebook | not fetched | Community thread | Not comparable content |
| 5 | quora.com/How-often-should-I-upload | Quora | not fetched | Q&A | Not comparable content |
| 6 | mixcord.co/blogs/.../how-often-should-you-post-on-youtube | Mixcord | 2026-08-28 | Listicle | No sample size, no comparison of cadence between growing and stalled channels, just general assertions |

SERP character: thin. No PAA beyond "how many times a week," and most of the top 6 aren't even real articles (Reddit, Facebook, Quora). Mixcord, the one real competitor blog fetched, explicitly has no comparative data. vidIQ is unverifiable (blocked again) but even its own headline ("Analyzed 10...") suggests a small sample if the claim is real.

---

## 2. Coverage matrix

| Section | Mixcord | vidIQ (unverified) | Ours? |
|---|---|---|---|
| A flat "X times a week" recommendation | Y | Y (assumed) | Y (have, in the existing intro) |
| Long-form vs Shorts cadence split | Y | ? | Y (have) |
| Quality vs quantity framing | Y | ? | Y (have, "Not automatically" FAQ) |
| Real cadence-by-niche data | — | ? | Y (have, "What Established Channels Upload, Measured") |
| Cadence compared between growing and stalled channels | — | ? (claim unverified) | **gap, building now** |

---

## 3. The gap

**What every real competitor misses:** nobody shows whether uploading more actually correlates with growth, versus channels that upload a lot and are still stalled. Every guide states a frequency recommendation as if it's self-evidently true.

**What we can answer that they structurally cannot:** using the same tracked dataset as studies #1-#3, split each channel's own upload history into an early half and a late half by publish date, compare each half's median view-velocity (views-per-day-live, same metric as the title-length and best-time-to-post studies). A channel whose later videos outperform its earlier videos (self-normalized, not compared against other channels) is growing; one whose later videos do the same or worse is stalled. Then compare each group's upload cadence (videos/week). This is a real growth signal, not a snapshot popularity tier, and it needs the same per-video time-series data no listicle writer has.

**Intent the SERP does not close:** "does posting more actually work, or am I just burning out for nothing" is the real question behind "how often should I upload." No competitor answers it with data.

---

## 4. The one test

> Could a competitor without our database have written this article?

Answer: No, for the core new finding (cadence compared between self-normalized growing vs. stalled channels). A generic guide can state "post 1-2x/week," but showing whether that actually correlates with a channel's own trajectory requires the same per-video, per-channel time series this project already tracks. The surrounding sections (quality vs quantity, Shorts vs long-form cadence, the existing niche-cadence table) stay as-is since they already clear this bar from the earlier studies.

---

## 5. The data pull

```sql
-- channel_videos.published_at + video_metric_snapshots, since 2025-01-01, is_short IS NOT TRUE
-- (script: scripts/query_upload_cadence_study.py, to be run via Railway console)
```

Method:
1. For each channel, split its tracked videos into an early half and late half by `published_at` (median split).
2. Compute median velocity (views / days live, using latest snapshot) per half.
3. Growth ratio = late-half median velocity / early-half median velocity. Growing: ratio >= 1.15. Stalled: ratio <= 1.0. (Middle band excluded from the two-group comparison, reported separately as "flat.")
4. Cadence = videos/week across the channel's full tracked window.
5. Compare median cadence between the Growing and Stalled groups, pooled and per niche (Simpson's-paradox guard, same as #3).
6. Floor: a channel needs at least 10 tracked videos to be split into two meaningful halves. Below that, exclude from this analysis (still counted in the existing niche-cadence table, different question).

| Check | Value | Floor | Pass? |
|---|---|---|---|
| Channels behind the figure | pending query run | 30 | pending |
| Videos behind the figure | pending query run | 500 | pending |
| Date filter applied | published_at >= 2025-01-01 | required | will apply |
| Median AND mean reported | will report both | required | will apply |

Figures to publish: pending the actual query run (Railway console).
Figures dropped for failing the floor: pending.

**Honest limit to state in the article, up front, not as a buried caveat:** this is correlational. A channel could upload more BECAUSE it's growing (more resources, more motivation) rather than growing BECAUSE it uploads more. The article should say this plainly in one sentence rather than imply causation, matching this site's own "Honest limits" standard.

---

## 6. Outline

Working title: (section-level, folds into existing article, no new title)
Slug: `best-time-to-post` (upgrade, not a new page)
Angle in one sentence: replace the unsourced "post 1-2x/week" advice with a real comparison of upload cadence between channels that are actually growing and channels that are stalled, from the same tracked dataset, and state plainly that it's correlation, not proof of causation.

- **Rewrite the intro of `<h2>How Often Should You Post on YouTube?</h2>`**: keep the practical guidance, add the real growing-vs-stalled comparison as the lead data point instead of the current unsourced "realistic ceiling" framing.
  - Answers: the core gap, nobody else has this.
- **Leave `<h2>What Established Channels Upload, Measured</h2>` mostly intact**: it's a different, already-real, already-cited (in the FAQ) study. Add one bridging sentence connecting it to the new growing-vs-stalled figure so the two don't read as disconnected.
- **FAQ: add 1 entry.** "Does uploading more often actually help you grow?" with the real ratio and the causation caveat stated directly in the answer.

Internal links out: none new needed, this stays inside the same article as #3.
Mid-article CTA: unchanged.
Cover image needed: no, just refreshed for #3, stays.

---

## 7. Approval

Presented: pending
Outcome: pending
Notes:

---

## 8. Stage log

- [x] Stage 1, research file complete
- [ ] Stage 2, presented and approved
- [ ] Stage 3, written against the full standard in one pass
- [ ] Stage 4, verified
- [ ] Stage 5, built, pushed, verified live

Outstanding for this article:
- Write `scripts/query_upload_cadence_study.py` (adapt from `scripts/query_best_time_to_post_study.py`)
- Get it run on Railway console, get real numbers
- Present real numbers for approval before writing prose
