# Research: youtube-vph-meaning

Plan entry: `#2` · Feature: `Outliers` · Anchor post: `/blog/youtube-view-growth-curve`
Target query: `vph in youtube meaning` / `what does vph mean on youtube`
Researched: `2026-09-04`
Status: `done, awaiting push`

---

## 1. Search intent

Dominant intent: `definitional`

What the reader wants in the first screen: a plain-language answer to "what
does VPH stand for and mean on YouTube," fast, because they almost certainly
just saw the term inside the vidIQ extension or a Reddit thread and don't
know what it is.

What the article must therefore open with: the definition itself, in the
first paragraph, with a real number attached (not a vague "views per hour,
duh" line). Lead with the range: 0.7 VPH to 4,000+ VPH are both real,
documented numbers for real channels, which is the entire reason the term
confuses people, one raw number means nothing without a baseline.

Second intent present in the SERP: diagnostic ("is MY vph good or bad"),
visible in `good vph youtube` and `what is a good views per hour on
youtube`. Served in a dedicated "Is Your VPH Good?" section with a
benchmark table by subscriber tier, after the definition.

---

## 2. The live top 10

| # | URL | Domain | Date published | Words | Read in full? | Section headings |
|---|---|---|---|---|---|---|
| 1 | support.vidiq.com/en/articles/108672-what-is-vph-views-per-hour | support.vidiq.com | 2020 (undated update) | ~150 | yes | Definition, purpose, algorithm note. No benchmarks, no formula. |
| 2 | reddit.com/r/NewTubers/.../my_new_video_has_got_6_vph | reddit.com | 2024-03-09 | thread | yes | OP: 6 VPH on 32 views/5hrs, asks if decent. Replies vary widely, no consensus number. |
| 3 | alanspicer.com/vidiq-outlier-score-vph-explained | alanspicer.com | 2026-04-26 | ~900 | yes | VPH definition, worked examples (2 VPH old video, 150 VPH new video), Outlier Score definition, "combine both" strategy section |
| 4 | youtube.com/watch?v=JUPTwXgIN8E | youtube.com | ~2022 | video | no (video, not text competitor) | N/A |
| 5 | reddit.com/r/PartneredYoutube/.../most_views_per_hour | reddit.com | 2024-04-15 | thread | yes | Creator self-reports 4,000 VPH on a 100K-view viral day |
| 6 | unityfilms.net/youtube-views-per-day | unityfilms.net | undated | ~1200 | yes | Daily-views tiers (50-100 / 500-2,000 / 10,000+ by sub count), analytics how-to, growth strategies. No hourly numbers. |
| 7 | overseeros.com/blog/how-many-views-is-viral-on-youtube | overseeros.com | 2026-08 | data study | yes | Redefines "viral" as 2x+ baseline velocity, not raw views. 2,826-video study, median breakout 2.93x baseline VPH. Directly validates relative-VPH-over-raw. |
| 8 | quora.com/How-many-YouTube-views-per-day-is-good | quora.com | ~2021 | thread | no (403, used Serper snippet only) | Generic "it varies" answers per snippet |
| 9 | modash.io/youtube-average-views-calculator | modash.io | undated | tool page | no (calculator, not article) | Average-views calculator, no VPH concept |
| 10 | facebook.com/groups/.../how_many_views_do_you_get_in_an_hour | facebook.com | ~2024 | thread | no (unreadable via fetch) | Snippet only: "317,000 subs, 327 views/hr is normal" — real per-size data point |

Read in full: 5 of 10 (plus 2 more via search snippet where direct fetch was
blocked: Quora, Facebook). Top 3 all read: yes.

SERP character: no big-authority site owns this term outright. vidIQ's own
help doc ranks #1 but is thin (150 words, no benchmarks, no formula). Reddit
and a solo creator blog (alanspicer) round out top 3. This matches the
plan's `top3: support.vidiq, reddit, alanspicer` exactly and confirms it's
still beatable, a real article with real benchmark data outranks a
150-word help doc and a scattered Reddit thread easily.

---

## 3. Coverage matrix

| Section | vidiq support | alanspicer | unityfilms | overseeros | Reddit (aggregate) | Ours? |
|---|---|---|---|---|---|---|
| What VPH stands for / means | yes | yes | no | no | implicit | yes |
| Worked example (old vs new video) | no | yes | no | no | no | yes |
| Benchmark by subscriber tier | no | vague, one rough example per tier | daily only, tiered | no | scattered self-reports | yes (hourly, tiered, more granular) |
| VPH vs Outlier Score / relative velocity | no | yes (brief) | no | yes (data-backed) | no | yes, with a comparison table (differentiator) |
| Where to see VPH (vidIQ extension) | no | implicit | no | no | implicit | yes |
| Why raw VPH misleads across channel sizes | no | no | no | yes | implicit in thread disagreement | yes |
| Named VPH threshold ("100+ is the sweet spot") | no | yes | no | no | no | intentionally not copied, unsourced claim, see note below |
| Using VPH to catch a rising topic early | no | yes (48h response playbook) | no | no | no | yes, added after a second competitor pass caught this gap |
| FAQ block | no | no | no | no | no | yes |

**Note on the one alanspicer claim we did not copy:** their "100+ VPH is the
sweet spot" and "3x+ Outlier Score is exceptional" thresholds are stated
with no source and contradict their own text two paragraphs earlier, which
says a good VPH is niche-dependent (5 VPH can be excellent for a small
channel). Copying an unsourced fixed threshold would contradict the
article's own benchmark table and its central point that raw thresholds
mislead. Left out deliberately, not missed.

Section counts: strongest competitor (alanspicer) 3 real H2-level sections.
Ours: 6-7. Justified, no competitor combines a real benchmark table with the
relative-velocity correction; each has one piece.

---

## 4. What the top 10 gets wrong

**A claim the ranking pages repeat that is false or unverifiable:**
Every benchmark-adjacent competitor (vidiq support, alanspicer, unityfilms)
says some version of "a good VPH varies by niche and channel size" and then
gives zero or one example, never a real table. alanspicer's two worked
examples (2 VPH on an old 500K video, 150 VPH on a new 50K video) are useful
but aren't framed as a benchmark table a reader can look themselves up in.

**Questions the SERP asks that nobody answers:**
"Is my 6 VPH decent for a small channel" (the literal Reddit post ranking
#2) never gets a real answer in the thread, replies are anecdotal and
contradict each other. No competitor page answers it with a number. We can,
using the Facebook data point (317K subs -> 327 views/hr is "normal") and
the Reddit range (0.7 VPH felt discouraging; 4,000 VPH was a 100K-view viral
day) to build an actual tier table.

**Stale pages in the top 10:**
The #1-ranking vidIQ help doc carries a 2020 date with no visible update,
and gives no numbers at all, just a definition. Six years old and still the
top result for a metric question, that's a thin, beatable incumbent.

**What we can answer from our own tables that they structurally cannot:**
Our Outliers feature already computes outlier_score as a channel-baseline-
adjusted multiplier (see `app/outliers.py`), which is exactly the "relative
velocity beats raw VPH" finding overseeros's data study proves
independently (median breakout = 2.93x baseline, not a fixed view count).
No competitor connects VPH to a real product that automates the
baseline-adjustment calculation for the reader. This is a genuine,
evidence-backed differentiator, not a forced CTA.

---

## 5. The second test (this is a definitional/diagnostic hybrid, not a data study)

Is this a question a creator types when something on their channel is
confusing (yes, "what does this number even mean" and "is my number bad"),
is the top 3 led by Reddit/Quora/a help thread rather than vidIQ/TubeBuddy/
Google (yes, vidiq's own thin help doc, Reddit, and a solo blog, not a
major SEO-optimized guide site), and does the answer send the reader to a
named product feature (yes, Outliers, honestly, since the product's
outlier_score is the fix for the exact confusion the query expresses)?

All three: yes. Proceed.

---

## 6. The data pull

Not applicable. This is a definitional/diagnostic post citing third-party
benchmark data points (Reddit self-reports, Facebook data point, overseeros
published study) with sourcing, not a first-party data study requiring our
own channel/video table floor check.

---

## 7. Outline

Working title: What Does VPH Mean on YouTube? (And Is Yours Good?)
Slug: `youtube-vph-meaning`
Angle in one sentence: VPH (views per hour) is real but the raw number is
almost meaningless without a baseline, here's what counts as good by
channel size and why relative velocity (what Outliers actually measures)
beats raw VPH.

- H2: What VPH Means on YouTube
  - definition, where you see it (vidIQ extension), why it exists (algorithm
    momentum signal)
- H2: A Worked Example: Same Video, Different VPH Meaning
  - the alanspicer-style old-vs-new-video example, adapted with our own
    framing
- H2: Is Your VPH Good? A Benchmark by Channel Size
  - the tier table nobody else builds: sub-1K, 1K-10K, 10K-100K, 100K-1M,
    1M+, sourced from Reddit self-reports + the Facebook data point +
    alanspicer's examples, each cited
- H2: Why Raw VPH Misleads You
  - the overseeros differentiator: relative velocity vs baseline is what
    actually predicts a breakout, cites the 2,826-video study directly
- H2: VPH vs. Outlier Score: What's the Difference
  - ties to our product mechanic honestly: VPH is raw velocity, Outlier
    Score is baseline-adjusted, which is why Outliers uses the latter
- H2: How to Check Your Own VPH
  - practical, short: vidIQ extension steps, or Outliers feature
- H2 (FAQ): Frequently Asked Questions
- Closing H2: creative, content-specific line (not "Conclusion"), TBD at
  draft time once the piece's throughline is fully written

Internal links out: anchor `/blog/youtube-view-growth-curve` (gets the
inbound link back per link-map rule, first of entries 2/6/12/29), also-link
`/blog/youtube-trends` where relevant (algorithm-momentum framing).

Mid-article CTA: Outliers feature, in the "VPH vs Outlier Score" section,
this is the section where the product mechanic is the actual answer to the
reader's confusion, not a bolted-on pitch.

Cover image needed: yes, 1600x900, creator checking a real-time view-count/
analytics number on a laptop or phone, candid over-the-shoulder style
matching house cover conventions (prompt to be written and confirmed
against a real existing cover's dimensions before requesting generation).

---

## 8. Approval

Presented: `2026-09-04`
Outcome: `approved`
Notes: "As long as it is the best outline among the top 10 competitors,
answers the search intent, that is fine."

---

## 9. Stage log

- [x] Stage 1, research file complete
- [x] Stage 2, presented and approved
- [x] Stage 3, written against the full standard in one pass
- [x] Stage 4, verified: parses clean, paragraphs <=5 lines, FAQ array mirrors
      visible (confirmed programmatically, 5/5 match), banned words zero,
      100% body-paragraph bold coverage, 5/5 FAQ answers bolded, 2 Pro Tips
- [x] Stage 5 (partial): built (125 routes), cover wired (1600x900 JPG,
      117KB), sitemap.xml + llms.txt added, committed locally as
      `68b0b5632`. Push still pending user go-ahead.

FAQ sourcing log: 1 of 5 genuinely PAA-sourced ("What is the full form of
VPH?" from the `vph in youtube meaning` PAA pull). The other 4 are editorial,
written to fill real gaps the PAA set didn't surface (VPH vs Outlier Score,
benchmark-by-size, the 24h-drop pattern, whether Studio shows it natively),
since the raw PAA results for this query cluster were mostly off-topic
(monetization income questions, mobile-repair "VPH" which is an unrelated
term, vidIQ-safety questions) and excluded per the FAQ-sourcing rule.

Outstanding for this article:

- Awaiting explicit user go-ahead to `git push`. Nothing else remaining.
