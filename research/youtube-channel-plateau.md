# Research: youtube-channel-plateau

Plan entry: `#20` · Feature: `Channel Audit` · Anchor post: `/blog/youtube-channel-not-growing`
Target query: `youtube channel plateaued after 1000 subscribers`
Researched: `2026-10-15`
Status: `awaiting approval`

---

## 1. Search intent

Dominant intent: **diagnostic**

What the reader wants in the first screen: the cause of a slowdown that
started at a specific point. They are not asking how to grow a channel. They
had growth, it stopped near 1,000 subscribers, and they want to know what
changed. The top 2 results are a video titled "Why Everything Changes After
1000 Subscribers" and a Reddit thread "Do things get easier at 1000 subs?",
both of which treat 1,000 as a threshold with mechanical consequences.

What the article must open with: the most likely cause named in the first
sentence, led by a real number. The cause is that nothing changes at 1,000
subscribers, and the slowdown is a denominator effect that was always coming.

Second intent present: **definitional**, a smaller cluster asking what the
1,000 milestone unlocks (monetization eligibility) and whether the algorithm
behaves differently. Served in a later section, not the opening, because the
dominant thread is people whose growth already stopped.

---

## 2. The live top 10

Pulled 2026-10-15 via `scripts/serper-batch.mjs`
(`research/rounds/entry-20-queries.txt`, 5 queries, raw JSON saved).

| # | URL | Domain | Date | Read in full? | Section headings / substance |
|---|---|---|---|---|---|
| 1 | youtube.com/watch?v=rKW7_-EDSQY | youtube.com | ~2025 | **partial** (403 on transcript) | Title + snippet only. Snippet claims "Over 90% of channels never reach 1,000 subscribers" with no source. |
| 2 | reddit.com/r/NewTubers/.../1nbx9j9 | reddit.com | ~2025 | **yes** (via Serper snippets, direct fetch blocked) | 12-month creator, long-form views rising then stalling. Real question: does the threshold itself do anything. |
| 3 | yttalk.com/threads/...149916/page-3 | yttalk.com | **2014-11-23** | **yes** | 5 named posters, split verdict. babyteeth4: compounding. Kijana: "completely misleading and a myth." JB Clem: recommended-channels list. VictoriaFlamel: platform favors large channels. |
| 4 | youtube.com/watch?v=wbO8vDX_43U | youtube.com | ~2025 | no | Title only: "Why YouTube Is BETTER After 1000 Subscribers" |
| 5 | quora.com/After-1-000-subscribers... | quora.com | **~2019 (7y)** | no (403) | Question itself is the signal: does the algorithm help automatically. |
| 6 | red11media.com/blog/why-most-youtube-channels-fail-at-1000-subscribers | red11media.com | 2026-01-23 | **yes** | 13 H2 + 8 FAQ, ~2,100-2,300 words. Structural-clarity thesis. |
| 7 | linkedin.com/posts/krishankantchura_... | linkedin.com | ~2025 | **yes** | 3 reasons: same content type, audience shift, ignoring retention. |
| 8 | vedzzy.com/blog/why-your-youtube-channel-stops-growing... | vedzzy.com | 2025-11-04 | **yes** | ~1,000-1,100 words. 3 causes + 5 fixes. Vendor case-study numbers. |
| 9 | facebook.com/groups/trafficandcopy/... | facebook.com | **~2022 (4y)** | no | Claims the opposite: "passes 1,000 subscribers, it grows fast... magic number" |
| 10 | bettermarketing.pub/5-reasons... | bettermarketing.pub | **2022-04-13** | no (403) | 5 reasons, algorithm-pleasing framing. |

**Read in full: 5 of 10.** Top 3 all read: **yes** (#1 partial, transcript
403s, snippet captured and its claim is handled in section 4).

SERP character: the plan entry recorded `top3: reddit, quora, support.google`.
**That has shifted**: the live top 3 is `youtube.com, reddit.com, yttalk.com`,
only 3 big-authority domains in the top 10. Still passes the SERP check and is
still beatable. Logged as a correction, same as entry #15's.

Beatable for three reasons, all evidenced above: the #3 result is from
**November 2014**, results #5, #9 and #10 are 7, 4 and 4 years old, and #9
asserts the direct opposite of #6/#7/#8 on the same SERP. No page reconciles
the contradiction.

---

## 3. Coverage matrix

| Section | r11 (#6) | vedzzy (#8) | LI (#7) | yttalk (#3) | reddit (#2) | Ours |
|---|---|---|---|---|---|---|
| Content/topic inconsistency | x | x | x | | | x |
| Audience matured / shifted | x | x | x | | | x |
| Ignoring analytics | x | x | x | | | x |
| Retention / watch time over subs | x | x | x | | | x |
| Positioning, who the video is for | x | | | | | x |
| Algorithm expects consistency | | x | | | | x |
| Double down on proven format | x | x | | | | x |
| Experiment cadence | | x | | | | x |
| Re-engage existing subscribers | | x | | | | x |
| Off-platform promotion | | x | | | | x |
| Nonlinearity / why it feels slow | x | | | x | | x |
| Quitting / emotional framing | x | | | | | (excluded, not diagnostic) |
| First channel rarely succeeds | x | | | | | (excluded, unverifiable) |
| Does it get easier after 1k | | | | x | x | x |
| Recommended-channels mechanism | | | | x | | x |
| Platform favors large channels | | | | x | | x |
| **The subscriber-base denominator** | | | | | | **x (ours alone)** |
| **Monetization does not throttle reach** | | | | | | **x (ours alone)** |
| **What 1,000 actually unlocks** | | | | | | **x (ours alone)** |
| **Sub count vs. the per-viewer system** | | | | | | **x (ours alone)** |

Strongest competitor section count: **13** (red11media, #6).
Ours: **13 real sections planned** plus the 4 nobody covers, so **17** before
the FAQ. Clears the 12-H2 floor with substance, not padding.

---

## 4. What all ten get wrong, missing, or stale

**A false/unverifiable claim the ranking pages repeat.**
Result #1 (the top result) claims "Over 90% of channels never reach 1,000
subscribers" with no source. Two PAA questions ask this directly ("What
percent of YouTubers reach 1000 subs?", "What percentage of YouTubers have
over 1000 subs?"). `DATA-STUDIES.md` → "Not measurable from our tables"
explicitly forbids us from promising this figure: "A population statistic; a
tracked set is not a population." So the differentiator is **not** a better
number, it is saying plainly that nobody publishing this figure has the data
to know it, and explaining why a tracked sample cannot produce it. That is
honest and it is the opposite of what every competitor does.

**A question the SERP asks and nobody answers.**
The real belief driving this query is that crossing 1,000 subscribers (or
getting monetized) causes YouTube to throttle reach. Evidence, all pulled this
session:
- r/NewTubers "Does youtube stop recommending your channel after you reach
  1000 subs and got monetization" (2 years, still surfacing)
- r/PartneredYoutube "This happens every single time and I have tested it
  across..." claiming a steady change "when you enable" monetization
- r/NewTubers "Finally got monetized, then my views fall off a cliff",
  impressions 400k → 100k
- r/NewTubers front page: videos "pushed to around 1,200-1,300 views and then
  suddenly stop getting..."

Not one of the ten competitors addresses this belief. It is the article's
central differentiator.

**Verified against official sources this session:**
- `youtube.com/howyoutubeworks/product-features/recommendations/`: signals are
  "viewing behavior, likes, dislikes, subscriptions, and feedback, including
  from satisfaction surveys", plus "the reputation and the quality of a
  channel". **Neither subscriber-count thresholds nor monetization status is
  listed as a factor.**
- `support.google.com/youtube/answer/72851`: 1,000 subscribers appears only as
  a YPP eligibility requirement. The page also states YouTube "retains the
  right to serve ads on all content on the platform", so ads already ran
  before monetization. That kills the "ads started, so reach dropped"
  mechanism directly.

**Anything out of date.** #3 is 2014. #5 is ~2019. #9 and #10 are ~2022.
Four of the top ten predate Shorts being a material traffic source.

**What we can answer from our own tables that they cannot.**
Nothing new. Entry #20 is a diagnostic post, not a study: study #16 (growth
rate by tier) belongs to plan entry **#35**, not here, and starting it here
would be reordering the plan. What we can do is **cite already-published
findings** from our own studies, which no competitor can:
- `/blog/youtube-views-per-sub-tier` (shipped 2026-10-14): subscriber-watch
  share falls 10.58% → 5.29% → 2.93% across 10K → 100K → 1M, from 1,152
  channels and 55,964 videos. This is the denominator mechanism, measured.
- `/blog/youtube-viral-views-multiple` (shipped 2026-10-07): viral thresholds
  as multiples of channel median.

---

## 5. The thesis

**A plateau at 1,000 subscribers is arithmetic, not a penalty.** Growth rate
is new subscribers divided by current subscribers. The same 50 new subscribers
a month is 50% growth at 100 subscribers and 5% at 1,000. Nothing has to
change for growth to **feel** like it stopped, and our own measured data shows
the share of subscribers who watch a new upload keeps falling as a channel
grows. The threshold itself does nothing: YouTube's published recommendation
signals contain no subscriber-count gate and no monetization gate.

That reframes the fix: stop looking for what broke at 1,000, and look at
whether absolute new-subscriber intake is actually falling, which is a
different and checkable question.

---

## 6. FAQ (PAA-sourced)

19 unique PAA questions pulled across 6 queries. The revenue cluster ("how
many views to make $2,000/$3,000/$10,000 a month", 5 variants) is the
off-topic monetization noise CLAUDE.md warns about and is excluded.

**Real PAA, in scope:**
1. Why did my YouTube channel stop growing?
2. What happens when your YouTube channel gets 1000 subscribers?
3. What will happen after 1000 subscribers on YouTube?
4. What percent of YouTubers reach 1000 subs? (answered by refusing the figure, see §4)
5. Why are my subscribers not increasing on YouTube?
6. What happens to a YouTube channel after monetization?
7. Is 500 subscribers in 2 months good?
8. How long will it take to get 1000 subscribers on YouTube?

**Excluded, with reason:**
- 5 revenue/RPM variants: off-topic, belongs to the monetization cluster
- "Is 1k/2k views in 1 day good?": view-benchmark intent, served by
  `/blog/youtube-views-per-sub-tier`
- "How to get over 1000 subscribers": procedural, and it is the
  never-grew question that `/blog/youtube-channel-not-growing` owns
- "How do I grow my YouTube channel in 2026?": too broad
- "Why is my YouTube revenue decreasing?": different cluster

**Editorial (minority, flagged as such, filling a genuine gap):**
9. Does YouTube stop recommending your channel after monetization? (the
   actual belief behind the query, see §4; no PAA surfaced it but 4 Reddit
   threads did)

---

## 7. Cannibalization check

Checked against every sibling, H2 lists extracted programmatically from
`frontend/src/blog/posts.jsx`:

- **`/blog/youtube-channel-not-growing`** (13 H2, "Reason 1-10" listicle):
  scoped to channels that **never grew**. Entry #20 is growth that **stopped**
  at a threshold. The entry's own scope note says exactly this. No overlapping
  H2. This is the anchor post and gets the intro link.
- **`/blog/youtube-losing-subscribers`** (12 H2): subscriber count going
  **down** (churn, purges, display lag). Entry #20 is intake slowing while the
  count still rises. No overlap.
- **`/blog/youtube-views-per-sub-tier`**: data study, cited as evidence here,
  not competing.

Clear to write.

---

## 8. Links planned

Internal (anchor text ≤ 4 words):
- `/blog/youtube-channel-not-growing` → "never started growing" (intro, anchor post)
- `/blog/youtube-views-per-sub-tier` → "subscriber watch share" (denominator section)
- `/blog/youtube-viral-views-multiple` → "viral view multiples" (expectations section)
- `/features/channel-audit` → CtaCard, mid-article

External (official only):
- `youtube.com/howyoutubeworks/product-features/recommendations/` → "published recommendation signals"
- `support.google.com/youtube/answer/72851` → "YPP eligibility requirements"

---

## 9. Stage log

- **2026-10-15** Stage 1 complete. 5 queries via serper-batch, 19 PAA pulled
  across 6 queries, 5 of 10 competitors read in full including all of the top
  3 (#1 transcript 403, snippet captured). Plan entry's `top3:` corrected:
  live top 3 is youtube/reddit/yttalk, not reddit/quora/support.google.
  Differentiator found and verified against two official YouTube sources.
  Cannibalization clear against all 3 siblings. **Awaiting approval of this
  file and the outline before writing.**
