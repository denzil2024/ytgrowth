# Research: How many views counts as viral on YouTube

Plan entry: CONTENT-PLAN.md #12. Data study #14 (DATA-STUDIES.md).
Feature: Outliers.

## 1. Goal (confirmed before title work, per standing process)

Answer "how many views is viral" with real data instead of the internet's
guessed flat thresholds (1M, 5M, 10K, whatever), by measuring the actual
share of videos that hit 2x / 5x / 10x / 50x their OWN channel's median
views. The thesis: virality is relative to channel size, not an absolute
number, and most of the internet's content on this question ignores that
entirely.

## 2. Scope cut from the original plan entry (flagged, not silently dropped)

The plan entry includes "is 2,000 views in a day good" and "first-week
views by channel size." Both are undeliverable from our tables:

- `video_metric_snapshots` is a WEEKLY snapshot (DATA-STUDIES.md → "Not
  measurable": "Any first 24 hours figure. Snapshots are weekly.").
  A per-day figure cannot be produced honestly.
- "First-week" would really mean "views at whatever snapshot landed 0-7
  days after publish," which is a materially weaker claim than the entry
  implies, and still needs per-video snapshot-age data this analysis
  doesn't pull.

Floor check (`scripts/check_study14_floor.py`) passed clean: 1,130
channels, 55,142 videos, both well above the 30/500 floor. Confirmed with
the user 2026-10-07, option A: ship the viral-multiples core, drop the
day/first-week claims, answer the "2,000 views in a day" PAA editorially
using the multiples framing instead of a flat figure.

## 3. The data (scripts/query_viral_multiples_study.py, run 2026-10-07)

Method: each video's latest snapshot views, expressed as a multiple of its
own channel's median (channels need 5+ videos for a meaningful median).
54,880 videos across 1,040 qualifying channels, published 2025-01-01+.

**Overall:**
| Multiple | Share of videos clearing it |
|---|---|
| 2x | 22.40% |
| 5x | 8.08% |
| 10x | 3.91% |
| 50x | 0.66% |

Percentiles of the multiple itself: p50 = 1.00x (half of all videos don't
even match their own channel's median), p75 = 1.81x, p90 = 4.14x,
p95 = 7.86x, p99 = 34.12x.

**By subscriber tier** (2x / 5x / 10x / 50x):
- 10K-100K (n=1,896): 19.67% / 6.07% / 2.64% / 0.26%
- 100K-1M (n=8,109): 21.38% / 7.84% / 3.91% / 0.58%
- 1M+ (n=14,172): 23.17% / 8.74% / 4.00% / 0.54%

Finding: size barely moves the odds. 1M+ channels hit 2x only ~3.5 points
more often than 10K-100K channels. Going viral relative to your own
baseline is not meaningfully easier at scale.

**By format:**
- Long-form (n=38,378): 22.01% / 7.66% / 3.63% / 0.56%
- Shorts (n=16,502): 23.29% / 9.06% / 4.58% / 0.88%

Finding: Shorts outperform long-form at every threshold, most sharply at
50x (0.88% vs 0.56%, roughly 57% higher rate).

**By niche** (30-channel floor applies; below-floor niches excluded from
published claims per DATA-STUDIES.md):

Clears the floor:
- news (34ch, n=5,087): 26.83% / 11.09% / 5.88% / 0.69% — strongest clean niche
- cooking (47ch, n=2,743): 23.84% / 8.68% / 4.16% / 0.73%
- travel (30ch, n=1,535): 17.59% / 6.91% / 3.13% / 0.20%
- fitness (39ch, n=2,129): 17.29% / 5.50% / 2.54% / 0.28%
- beauty (36ch, n=1,707): 18.86% / 4.80% / 2.05% / 0.53%
- gaming (52ch, n=3,090): 16.73% / 4.05% / 1.20% / 0.06% — hardest niche to break out in

Below the 30-channel floor, NOT publishable as standalone claims (sports,
entertainment, finance, tech, education, comedy, music — all 7-21
channels). Omitted from the article entirely, not mentioned even as a
caveat, per rule 10.

uncategorized (698ch, n=30,703) shown in the script for scale only, not
used in the article — not a real category.

## 4. Competitor research (5 full reads + SERP, 2026-10-07)

Queries run via scripts/serper-batch.mjs: "how many views is viral on
youtube", "is 2000 views in a day good", "how many views counts as viral
on youtube", "is 10k views viral", "what is a good view count for a small
youtube channel".

**Top-3 per query**, consistently: reddit.com, learningrevolution.net,
bluehost.com (first query), with quora/reddit/facebook dominating the
"2,000 views" and "10k views" variants. Full competitor reads:

1. **learningrevolution.net** — "How Many Views Is Viral? 2026
   Benchmarks by Platform." 17 sections. Platform-by-platform flat
   thresholds (YouTube long-form: 2-5M views in 1-2 days; Shorts: 1-3M in
   5-7 days). Does mention relativity in passing ("a 30x-40x spike from
   baseline is more meaningful" for small creators) but never quantifies
   it — no real data behind the claim, just an assertion.
2. **bluehost.com** — "How Many Views Is Viral? Social Media Benchmarks."
   9 sections. Flat platform thresholds (YouTube long-form: 5M/week;
   Shorts: 1-2M). Explicitly says it does NOT break down by channel size,
   subscriber count, or niche. "First-hour engagement determines 80% of
   viral potential" — an unsourced claim.
3. **jogg.ai** — "How Many Views Is Viral? Crack the Code." 5 sections.
   Flat thresholds again (YouTube: 1M+, 5-10M for "competitive niches").
   Mentions niche variance but no data.
4. **zelios.agency** — "How Many Views Makes a Video Viral?" 7 sections.
   The ONE competitor with something close to our method: "views
   exceeding subscriber count by 10x ratio" as an alternative definition,
   and acknowledges niche content can be viral at "tens of thousands"
   fewer views. Closest any competitor gets to the relative-to-baseline
   idea, but still no real measured distribution, just a rule of thumb.
5. **levitatemedia.com** — "How Many Views Is Viral? The Answers to Your
   Questions." 10 sections, mostly about what makes content shareable
   (emotion, timing, clarity), not thresholds. Flat numbers given
   in passing (TikTok 250K/24h, YouTube 5M/week). No breakdown by
   channel size, niche, or format.

**Union coverage matrix** — sections any competitor has that this article
must address or deliberately exclude with reason:

| Section | Competitors with it | Our coverage |
|---|---|---|
| Flat platform-by-platform thresholds | All 5 | Deliberately excluded — this article is YouTube-only and relative-to-channel by design, not a platform comparison. Named directly in the intro as the thing we're not doing. |
| "What makes content go viral" (shareability factors) | 4 of 5 | Excluded — off-topic for a data study; that's a different article (not this one's job per the two-KPI split in FOUNDATION.md). |
| Relativity to channel size / baseline | learningrevolution (asserted), zelios (10x rule of thumb) | THIS IS OUR CORE, but with real measured data instead of a guess. Clear differentiator. |
| Shorts vs. long-form split | learningrevolution, zelios (partial) | Covered with real numbers (ours is the only one with an actual measured rate gap). |
| Niche/category breakdown | None have real data; only passing mentions | Covered with real numbers, floor-gated. Clear differentiator. |
| First-24/72-hour timing | learningrevolution, bluehost, levitatemedia | Excluded, stated directly as not measurable from weekly snapshots (honesty beats guessing, matches this article's whole thesis). |
| "How to make content go viral" tactics | 3 of 5 | Excluded — not a data study's job. |

**Differentiator, with evidence:** every competitor either gives a flat
number with zero backing, or gestures at relativity without measuring it.
None publish an actual distribution: no competitor states what share of
videos actually clear 2x/5x/10x their own baseline. This is the gap. Our
data fills it directly, at a sample size (54,880 videos, 1,040 channels)
no single-creator or agency blog post could produce.

**Search intent:** informational, comparison-shopping an unclear concept.
Searcher has a specific number in mind (their own view count) and wants to
know if it's good. Outline opens with the real finding (p50 = 1.00x, most
videos don't even hit their own median) rather than a definition or
scene-setting, matching the "lead with a number" voice rule.

## 5. PAA (pulled via Serper, logged real vs. editorial)

Real PAA, verbatim from the 5 queries above:
1. "Is 5,000 views considered viral?" — real PAA
2. "Is 20k views considered viral?" — real PAA
3. "Is 10,000 views considered viral?" — real PAA
4. "Is 2,000 views in 1 day good?" — real PAA (answered via the multiples
   framing, not a flat day-figure, since we can't measure days — see
   section 2's scope cut)
5. "Is 2 million views considered viral?" — real PAA (matches the plan
   entry's own PAA target)
6. "Is 30k views viral?" — NOT found verbatim in any of the 5 pulls. The
   plan entry lists it as a target PAA but it didn't surface. Treating as
   editorial: close enough in shape to #1-3 that answering the general
   "is X views viral" pattern with the multiples method covers it without
   a fabricated verbatim claim.

5 of 6 are real PAA; 1 (30k) is editorial, filling a gap the plan assumed
but the live pull didn't confirm. Logged per the FAQ-sourcing rule.

## 6. Outline (draft, for approval)

1. Open with the real finding: half of all videos don't even match their
   own channel's median (p50 = 1.00x). Lead with that number, not a
   definition.
2. The method, explained plainly: why "10K views" means nothing without
   knowing the channel's own baseline, and how we measured multiples of
   each channel's median across 54,880 videos.
3. The real thresholds: share of videos clearing 2x / 5x / 10x / 50x,
   with the percentile table (p50/p75/p90/p95/p99) showing how rare each
   tier actually is.
4. Does channel size change the odds? (subscriber tier breakdown — no,
   not much, directly contradicting the assumption that virality gets
   easier once you're bigger).
5. Shorts vs. long-form: the real gap, with numbers.
6. By niche: the 6 niches that clear the data floor, framed as "where
   breaking out is easiest / hardest" (gaming hardest, news easiest).
7. FAQ (6 questions above, "is X views viral" answered via the multiples
   method each time, not a flat number).
8. Where Outliers automates this (the differentiator: the feature finds
   a creator's own 2x/5x/10x videos automatically instead of making them
   run this math by hand).
9. Closing H2: plain, declarative, stating the thesis directly (e.g. "Your
   Median Is the Only Baseline That Matters" — to be finalized at write
   stage, no clever wordplay per the data-study voice standard).

No pillar/spoke link applies (not part of an existing cluster). Internal
link candidates: `/blog/youtube-vph-meaning` (VPH is a related early
-signal metric), to be verified two-way per the link-map rule if a
natural anchor exists in that post.

CtaCard: Outliers, per the plan entry's assigned feature. Copy should
tie directly to the thesis: Outliers finds the videos that already beat
a channel's own baseline, automatically, which is exactly the multiple
this article teaches readers to compute by hand.
