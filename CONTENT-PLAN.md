# YTGrowth: Content Plan

Site: ytgrowth.io · Niche: YouTube SEO/growth SaaS ($5 Starter pack, Growth
$49/mo, Agency $149/mo, pay-before-signup)

This file is the run order, top to bottom, titles only. Every entry below
passed the confirmation standard in `FOUNDATION.md` → "Confirmation
standard" (SERP top-3 check, a real demand signal, the diagnostic-question
shape, a named product feature). The process, voice, diagnosis, dropped log
and runbook live in `FOUNDATION.md`. Data-study methodology and quota math
live in `DATA-STUDIES.md`. Read this file for what's next, follow a link
only if you need the why.

Rebuilt 2026-09-03 from one research round (94 Serper SERP + PAA pulls, the
2026-08-25 Search Console export, Reddit thread mining). Previous plan
archived in git history (`43d5b9562`). What shipped before the rebuild is in
`FOUNDATION.md`'s history log; what was killed is at the bottom of this file.

Expanded 2026-09-03b with Blocks 7 to 10 (entries 52-74): a second round of
45 pulls seeded from the Search Console gap list, Reddit thread mining per
feature, and PAA follow-through. 39 passed the SERP check, 6 were dropped
for cannibalizing live posts. Evidence in
`research/rounds/2026-09-03b-queries-summary.txt`.

Expanded again 2026-09-03c with Blocks 11 to 16 (entries 75-94): 38 pulls
into the retention, AI-era, format, positioning, distribution and
revenue-diagnostic seams. 35 passed the SERP check, 6 were dropped as owned
by live posts. Evidence in
`research/rounds/2026-09-03c-queries-summary.txt`.

Expanded again 2026-09-03d with Blocks 17 to 23 (entries 95-117): 35 pulls
into comments and community, collaborations, housekeeping, subscriber
psychology, platform choice, production workflow and pre-upload checks.
30 passed the SERP check, 7 were dropped as owned by live posts. Evidence in
`research/rounds/2026-09-03d-queries-summary.txt`.

Last updated: 2026-09-03

**Guardrails for whoever is working this list** (the full set is in
`CLAUDE.md` → "Content strategy is locked"):

- The next article is the top unstruck entry. No picking, no reordering.
- Nothing gets added here without the four-part confirmation standard and
  the evidence written on the entry. A title you thought of is not an entry.
- No keyword clusters, no Keyword Planner pulls per article, no listicles,
  no "ideas" posts, no tool comparisons, no relaunching old pages.
- Every article links to the feature named on its entry, and only that one.
- Below 40 unshipped entries, run a full research round (`FOUNDATION.md`),
  never add one entry at a time.
- Dropped items stay dropped. Their reasons are at the bottom of this file.
- Update this file the same session something ships or the order changes.
- Structure comes from the research file's coverage matrix every time. No
  fixed idea counts, no fixed FAQ counts, no reused skeleton.

## How to read an entry

`N. Title phrase · feature · evidence`

- **Title phrase** is the validated query, not final headline copy.
- **Feature** is the product feature the article sells and links to (its
  `/features/*` page or `/tools/*` page). Mandatory. No feature, no entry.
- **Evidence** is what confirmed it: the real top-3 domains on 2026-09-03
  (`top3:`), Search Console position with no dedicated page (`GSC:`), and
  the Reddit/PAA signal. `(+ x)` means query x is folded in as a section,
  not its own page.
- **DATA STUDY** entries use our own tables, zero quota, and follow
  `DATA-STUDIES.md`. They ship with the outreach step, not just a publish.

**What a block is, and how its articles link.** A block is a group of readers
in the same state, not a pillar/spoke cluster. There is no hub page and no
hierarchy; the old cluster model was retired 2026-09-03. Linking follows the
reader, not the block boundary:

- **Link to a sibling only when the same reader plausibly has both
  questions.** Some blocks are genuine clusters (Block 11's three retention
  entries are one problem at different points in a video; Blocks 6 and 10 are
  each one symptom seen from different angles). Link those freely.
- **Some blocks are a shared state, not a shared topic.** Block 7's four
  entries (video removed, age restricted, processing stuck, deleted comment)
  are unrelated emergencies. Do not cross-link them just because they sit in
  the same block. A forced link is worse than none.
- **The scope notes on entries are the real link map.** Where an entry says
  "pairs with #N" or "write #N first", those two link to each other. Where it
  says a live post owns a topic, link out to that post instead.
- **Every article links to its feature** (mandatory, above) and to any live
  post named in its scope note. Sibling links are on top of that, not instead.

Cadence: **1 to 2 articles per day**, with a data study roughly every two
weeks. At that pace this list is 9 to 17 weeks of work. Strike items as they
ship, same session. Do not add an entry that skipped the standard.

**The order is the write order. Work straight down.** Every entry is
writable on its own the day you reach it; nothing waits on a later entry.
Two things to know:

- **A forward reference is a scope note, not a dependency.** Where an entry
  says a topic "belongs to #N" further down the list, that means leave the
  topic out, not wait for it.
- **The four data studies (#12, #19, #26, #35) are the only entries that can
  be blocked.** Each needs its data-floor count run first
  (`DATA-STUDIES.md`). If a study fails its floor, skip it, note the date on
  its entry, and carry on to the next number. Do not stall the queue and do
  not write it thin. #35 is gated today and will likely fail until the
  snapshot table has more weeks in it.

**Refill trigger.** At this cadence the plan drains fast: 30 remaining
entries is only 2 to 4 weeks of runway, and a research round takes a full
session. Run the next round (`FOUNDATION.md` → "Research round") when the
list drops below **40 unshipped entries**, not 30.

## Block 1 · Already earning impressions with no page (write first)

Search Console shows these queries ranking on pages that don't answer them.
A dedicated page is the cheapest win on the list.

Funnel: existing creators reading their own Studio. CTA: Channel Audit /
Weekly Report ("the specific issue, with a real number from your data").

~~1. YouTube traffic sources explained (+ direct or unknown traffic source,
   + reach tab) · Channel Audit · GSC pos 8.4-10.9 on 4 variants ·
   top3: humbleandbrag, support.google, databox · Reddit #4~~ — published
   2026-09-04 as `/blog/youtube-traffic-sources`, commit `480e8eab7`
2. VPH on YouTube, views per hour meaning · Outliers · GSC pos 6.5-8.0 on
   3 variants ("vph in youtube meaning", "what does vph mean on youtube") ·
   top3: support.vidiq, reddit, alanspicer
3. How often YouTube Analytics updates (+ subscriber count not updating,
   + watch hours not updating) · Weekly Report · GSC pos 12.5 ·
   top3: reddit, qqtube, webapps.stackexchange
4. Multiple YouTube channels on one AdSense account · Monetization pillar
   spoke · GSC pos 11.3 ("youtube multiple channels one adsense account
   policy 2026") and 26.9 ("2 youtube channel 1 adsense") ·
   top3: reddit, support.google, quora
5. YouTube monetization under 18 · Monetization pillar spoke · GSC pos
   10.7 · top3: reddit, quora, support.google
6. What an outlier video is on YouTube (+ outlier score, + free outlier
   finder) · Outliers · GSC: "youtube outlier finder" 1 click at pos 35,
   "youtube outliers" pos 33, "youtube outliers finder" pos 34 ·
   top3: viewstats.zendesk, reddit, outlierkit
7. How to see YouTube Analytics for other channels · Competitor Analysis
   (via `/tools/youtube-channel-stats-checker`, the site's best-converting
   tool page: 15 clicks) · GSC pos 54-56 on 3 variants, currently landing
   on the analytics mega-guide · top3: clipchamp, reddit, reddit
8. How to get more impressions on YouTube · Channel Audit · GSC pos 36.5 ·
   top3: reddit, reddit, quora · PAA: "Why are my YouTube impressions low?"

## Block 2 · "Something dropped" (existing channels, the paying segment)

The shape that won in the first four months: a creator's numbers moved and
they want to know why. Every SERP here is led by Reddit, Quora or a Google
help thread, none by vidIQ or TubeBuddy.

Funnel: problem-aware, monetized or near-monetized channel. CTA: Channel
Audit ($5 Starter pack is the natural first purchase). KPI: tier-1 visitors
reaching `/features/channel-audit` or checkout.

9. Why did my YouTube views drop suddenly · Channel Audit ·
   top3: reddit, subscribr, youtube · Reddit #1 (r/NewTubers), 11 related
   "reddit" variants
10. YouTube impressions dropped suddenly · Channel Audit ·
    top3: reddit, blackhatworld, facebook · PAA x4
11. YouTube stopped recommending my videos (+ suggested traffic dropped) ·
    Channel Audit · top3: reddit, support.google, quora · PAA x4
12. **DATA STUDY** How many views counts as viral on YouTube, measured as
    multiples of the channel's own median (+ is 2,000 views in a day good,
    first-week views by channel size) · Outliers · top3: reddit,
    learningrevolution, bluehost · PAA "Is 30k views viral?", "Is 2 million
    views viral?" · source: `video_metric_snapshots` + `channel_videos`,
    zero quota, see `DATA-STUDIES.md` #14
13. YouTube views dropped after monetization · Channel Audit ·
    top3: reddit, facebook, support.google · PAA x4
14. YouTube watch hours dropping (+ what happens if you miss 4,000 hours
    in a year) · Channel Audit · top3: reddit, support.google, quora ·
    PAA x4 · distinct from `/blog/youtube-watch-hours` (how to reach 4,000)
15. Why am I losing subscribers on YouTube · Channel Audit ·
    top3: reddit, facebook, yourdigitalresource · PAA x4
16. The "performing worse than usual" notification in YouTube Studio ·
    Channel Audit · top3: reddit, facebook, support.google
17. Why YouTube is showing my video to the wrong audience · Channel Audit /
    SEO Studio · top3: reddit, facebook, blackhatworld · PAA x4
18. Is my YouTube channel shadowbanned (what a real reach drop looks like
    vs. a ban) · Channel Audit · top3: reddit, tubepilot, support.google ·
    PAA x4 · SERP also carries "checker" tools, see the free-tools note in
    `FOUNDATION.md`
19. **DATA STUDY** Average views per video by subscriber count (+ what
    share of subscribers watch a new upload) · Channel Audit ·
    top3: modash, reddit, sanishtech · source: `channel_metric_snapshots`
    + `video_metric_snapshots`, zero quota, see `DATA-STUDIES.md` #15
20. YouTube channel plateaued after 1,000 subscribers · Channel Audit ·
    top3: reddit, quora, support.google · "reddit youtube channel plateau"
    returns 9 threads · scope: growth that stopped, not growth that never
    started (that is `/blog/youtube-channel-not-growing`)
21. YouTube subscribers not increasing while views are fine · Channel
    Audit · top3: reddit, quora, support.google · PAA x4 · scope: the
    viewer-to-subscriber step only, check it does not restate the 10
    reasons in `/blog/youtube-channel-not-growing` before outlining

## Block 3 · Click-through, titles, search (Thumbnail IQ / SEO Studio)

Funnel: problem-aware, existing channel. CTA: Thumbnail IQ for 22-23 and 25,
SEO Studio for 24 and 27-28, Weekly Report for 26 (data study), Outliers for
29-30. KPI: tier-1 visitors reaching the named feature page.

22. Why is my YouTube CTR so low (+ what CTR is normal for a new channel)
    · Thumbnail IQ · top3: reddit, quora, facebook · 10 Reddit threads on
    "thumbnail feedback low ctr", incl. the contrarian "Low CTR? It's
    probably not your thumbnail" thread, which is the angle: CTR by traffic
    source. Distinct from `/blog/youtube-ctr` (benchmarks)
23. Does changing a thumbnail after upload hurt views · Thumbnail IQ ·
    top3: reddit, youtube, quora
24. Does changing a YouTube title after upload affect views · SEO Studio
    (title rewrite is the feature) · top3: reddit, quora, tuberanker ·
    PAA x4
25. YouTube "Test & compare" thumbnails not showing · Thumbnail IQ (via
    `/tools/youtube-thumbnail-tester`) · top3: support.google, reddit,
    testmythumbnails · PAA x4
26. **DATA STUDY** Posting time vs. performance, correlation-based (was
    #9 in the old plan, `DATA-STUDIES.md` #10) · Weekly Report ·
    confirmed 2026-08-22, zero quota, nothing blocking it · distinct from
    `/blog/best-time-to-post` (when top creators post) because this asks
    whether posting time correlates with views at all, same Spearman method
    as the title-length study
27. YouTube video not showing up in search · SEO Studio ·
    top3: reddit, support.google, quora · PAA x4
28. How long it takes a YouTube video to rank in search · SEO Studio /
    Keyword Research · top3: reddit, quora, blackhatworld
29. One video blew up and the rest get no views · Outliers ·
    top3: reddit, youtube, quora · Reddit #1 "One video blew up and then
    nothing"
30. Evergreen vs. trending content on YouTube (+ which one the view-growth
    curve favors) · Outliers / Trends · top3: reddit, tubebuddy, bird ·
    PAA x4 · reuse `/blog/youtube-view-growth-curve` data

## Block 4 · Monetization diagnostics (pillar `youtube-monetization-beyond-ads` continues)

Funnel: monetized creators, the segment that already pays for tools. CTA:
earnings calculators (`/tools/youtube-money-calculator` and siblings), then
Channel Audit. KPI: tier-1 visitors, calculator use, checkout.

31. How many views you need to make $1,000, $2,000, $3,000 and $10,000 a
    month on YouTube (by niche RPM) · money calculators ·
    top3: reddit, milx, quora · this PAA appeared on 30+ of the 94 queries
    pulled this round, the single most repeated question in the data ·
    distinct from `/blog/youtube-1-million-views` (the inverse question)
32. YouTube monetization review taking long · Channel Audit ·
    top3: reddit, vidiq, facebook · "reddit" variant returns 9 threads
33. YouTube reused-content rejection and the appeal · Channel Audit ·
    top3: reddit, support.google, facebook · PAA x4 · check
    `/blog/youtube-demonetization`'s reused-content section first; if it
    is already deep, scope this to the YPP application appeal
34. Do you need a big following for affiliate marketing on YouTube ·
    Monetization pillar spoke (carried from old plan #31) ·
    top3: reddit, reddit, quora · PAA x4 · scope: the pillar mentions
    affiliate 17 times as one of eight methods; check its affiliate
    section does not already answer the following-size question before
    outlining, same check as #33
35. **DATA STUDY** How fast YouTube channels grow, by size tier (+ how
    long it takes to reach 1,000 subscribers) · Channel Audit ·
    top3: reddit, socialstatus, berryviral · PAA x4 · GATED: needs
    `channel_metric_snapshots` to hold 8+ weekly dates and 30+ channels per
    tier; run the count first, see `DATA-STUDIES.md` #16. If it fails the
    floor, skip to 36 and re-check monthly.

## Block 5 · Benchmarks and definitions (awareness, AI-citation surface)

Definition questions where the SERP is Reddit-led and the answer needs a
number. Each maps to a metric the Weekly Report or Channel Audit shows the
user for their own channel.

Funnel: awareness. CTA: Weekly Report ("your number, every Monday"). KPI:
tier-1 visitors, AI-assistant referrals.

36. YouTube impressions explained: impressions vs. views, how many is good,
    views per 1,000 impressions · Weekly Report · top3: reddit,
    support.google, reddit · three query variants, each Reddit-led
37. Browse features vs. suggested videos (+ how to get more browse
    traffic) · Channel Audit · top3: reddit, tubeanalytics, yttalk ·
    GSC related-searches on the traffic-sources cluster
38. Returning viewers vs. new viewers (+ casual and regular viewers) ·
    Weekly Report · top3: support.google, reddit, reddit · PAA x4
39. What a good average view duration is on YouTube · Channel Audit ·
    top3: reddit, reddit, quora · PAA x4 · no own data (AVD is private),
    source public benchmarks and say so in one disclosure
40. Is 30% audience retention good (retention benchmarks) · Channel Audit
    · top3: reddit, reddit, blackhatworld · PAA x4 · same disclosure as 39
41. Unique viewers vs. views on YouTube · Weekly Report ·
    top3: reddit, reddit, quora · PAA x4
42. Engaged views vs. views on YouTube · Weekly Report ·
    top3: reddit, reddit, support.google · PAA x4
43. Does rewatching a video count as watch time · Channel Audit ·
    top3: quora, reddit, veefly
44. What a good end-screen click rate is · Channel Audit ·
    top3: reddit, tella, medium · PAA x4

## Block 6 · New creators, zero views (top of funnel, write last)

Largest demand on the list, weakest fit for a $49/mo product. Written last,
and each one links to the free tools and the $5 Starter pack rather than a
subscription. Every SERP here is Reddit #1.

Funnel: pre-monetization. CTA: free tools, then Starter pack. KPI: tier-1
visitors, tool use.

45. YouTube video getting 0 views after 24 hours (+ "0 view jail") ·
    Channel Audit · top3: reddit, quora, medium · PAA x4 · cites
    `/blog/youtube-view-growth-curve` for what a normal first week looks
    like; scope is "something is wrong", not "how long is normal"
46. YouTube video stuck at 0 impressions · Channel Audit ·
    top3: reddit, support.google, quora · PAA x4
47. YouTube Shorts getting 0 views · Channel Audit ·
    top3: reddit, support.google, quora · PAA x4 · scope for 47-49: these
    are troubleshooting, `/blog/shorts-vs-long-form` is strategy (does
    Shorts hurt the channel). Three Shorts entries is the densest cluster
    in the plan; before writing 48 and 49, confirm 47 did not absorb them
48. YouTube Shorts views stopped suddenly (+ why Shorts stop getting views
    after an hour, + views freeze) · Channel Audit ·
    top3: reddit, youtube, subscribr · PAA x4
49. YouTube Shorts not showing in the Shorts feed · Channel Audit ·
    top3: reddit, support.google, smashballoon · PAA x4
50. How many videos before a YouTube channel takes off · Channel Audit ·
    top3: reddit, quora, facebook · PAA x4 · no own data on this (we hold
    each channel's 50 newest uploads, not full history), source honestly
51. How long it takes to get 1,000 subscribers · Channel Audit ·
    top3: reddit, scalelab, quora · PAA x4 · uses study #35's figure once
    it clears the floor, otherwise public sources with one disclosure ·
    scope: leave "should I delete old videos with no views" out entirely,
    it is #62's topic. No dependency, write #51 when you reach it

## Block 7 · Policy and enforcement panic (existing channels, high urgency)

Added 2026-09-03b. A creator whose video was removed, restricted or claimed is
in the most urgent state on the site, and every SERP here is forum-led because
Google's own help pages answer the policy but not the panic.

Funnel: problem-aware, any size, often monetized. CTA: Channel Audit. KPI:
tier-1 visitors reaching `/features/channel-audit`.

52. YouTube removed my video, what to do · Channel Audit ·
    top3: support.google, reddit, quora · scope: the removal-and-appeal path
    only; `/blog/youtube-demonetization` owns strikes and the yellow icon
53. Why did my YouTube video get age restricted · Channel Audit ·
    top3: reddit, reddit, facebook · CLEAN: zero mentions in
    `/blog/youtube-demonetization`
54. YouTube video processing stuck · Channel Audit ·
    top3: reddit, support.google, yttalk
55. YouTube deleted my comment · Channel Audit ·
    top3: reddit, quora, support.google

## Block 8 · Studio mechanics nobody documents well

Added 2026-09-03b. Small, concrete "how does this actually work" questions
where the SERP is Reddit plus a scattering of small sites. Each one maps to a
setting a creator can change today.

Funnel: problem-aware, any size. CTA: SEO Studio for 56-58, Channel Audit for
59-61. KPI: tier-1 visitors reaching the named feature page.

56. Where to add YouTube channel keywords · SEO Studio ·
    top3: youtube, reddit, bu.edu · CLEAN: zero mentions in
    `/blog/youtube-channel-optimization`
57. Do YouTube subtitles help views · SEO Studio ·
    top3: reddit, amberscript, broadstream · CLEAN: zero mentions in
    `/blog/youtube-seo-best-practices`
58. YouTube video chapters not working · SEO Studio ·
    top3: reddit, support.google, tubealfred · scope: the troubleshooting
    case only; `/blog/youtube-description-template` owns how to write them
59. YouTube pinned comment strategy · Channel Audit ·
    top3: reddit, reddit, support.google · CLEAN: zero mentions in
    `/blog/more-views-on-youtube`
60. YouTube community post reach · Channel Audit ·
    top3: support.google, reddit, navigatevideo · CLEAN: zero mentions in
    `/blog/grow-youtube-channel`
61. How to know if a topic is saturated on YouTube · Competitor Analysis ·
    top3: reddit, reddit, linkedin · `/blog/youtube-niche` mentions
    saturation twice and owns no heading on it

## Block 9 · Decisions creators agonize over (Reddit-native)

Added 2026-09-03b. Sourced by mining Reddit thread titles per feature, the
method that produced the July winners. Every SERP here is 8-10 Reddit results,
which means no publisher has written the definitive answer.

Funnel: pre-monetization to early-monetized. CTA: Channel Audit, free tools
for 64 and 66. KPI: tier-1 visitors.

62. Should I delete a bad YouTube video · Channel Audit ·
    top3: reddit x3, 9 of 10 results are forums · pairs with #51's
    "should I delete old videos with no views", write 62 first
63. Unlisted vs private for old YouTube videos · Channel Audit ·
    top3: reddit x3, 6 of 10 forums
64. How to tell if your YouTube thumbnail is bad · Thumbnail IQ (via
    `/tools/youtube-thumbnail-tester`) · top3: reddit x3, 9 of 10 forums ·
    CLEAN: zero overlap with `/blog/youtube-thumbnail-ideas`
65. Is my YouTube niche too broad · Competitor Analysis ·
    top3: reddit x3, 9 of 10 forums · `/blog/youtube-niche` owns no
    heading on breadth
66. Changing YouTube niche mid-channel · Channel Audit ·
    top3: reddit x3 · one mention in `/blog/youtube-niche`, no heading
67. Should I use my real name on YouTube · free tools, then Starter pack ·
    top3: reddit x3, 8 of 10 forums
68. How long to get your first 100 YouTube subscribers · Channel Audit ·
    top3: reddit x3, 9 of 10 forums · CLEAN vs `/blog/free-subs-on-youtube`
69. YouTube upload schedule and burnout · Channel Audit ·
    top3: reddit x3, 7 of 10 forums · scope: sustainability, not cadence
    optimization, which `/blog/best-time-to-post` owns with 19 mentions
    and its own heading

## Block 10 · Wrong-audience and decay diagnostics

Added 2026-09-03b. The queries a creator types when the numbers are fine but
wrong, or were fine and stopped. Distinct from Block 2, which is a sudden drop.

Funnel: problem-aware, existing channel. CTA: Channel Audit for 70-72,
Competitor Analysis for 73. KPI: tier-1 visitors reaching the feature page.

70. Why are my YouTube views from the wrong country · Channel Audit ·
    top3: reddit, quora, vpntous · zero big-authority domains in the top 10
71. My YouTube audience is not my target audience · Channel Audit ·
    top3: reddit, strikesocial, support.google
72. YouTube old videos stopped getting views · Channel Audit ·
    top3: reddit, quora, tunepocket · scope: decay on an established
    channel; #9 is a sudden sitewide drop
73. YouTube views down but subscribers up · Channel Audit ·
    top3: support.google, quora, reddit
74. YouTube realtime analytics not matching · Weekly Report ·
    top3: reddit, support.google, quora · pairs with #3 (how often
    analytics updates), write #3 first and confirm it did not absorb this

## Block 11 · Retention and the first 30 seconds

Added 2026-09-03c. The single biggest lever a creator can pull, and the SERP
is forum-led on every phrasing. `/blog/youtube-analytics` owns how to READ
the retention graph; none of these are about reading it.

Funnel: problem-aware, existing channel. CTA: Channel Audit. KPI: tier-1
visitors reaching `/features/channel-audit`.

75. Why viewers click off in the first 30 seconds · Channel Audit ·
    top3: reddit x3, 8 of 10 forums · CLEAN vs `/blog/youtube-ctr`
76. YouTube retention drops right at the start · Channel Audit ·
    top3: reddit, humbleandbrag, etwell · zero big-authority in the top 10 ·
    scope: the drop-off itself; `/blog/how-to-start-a-youtube-video` owns
    how to script a hook, this diagnoses why one failed
77. Why do viewers leave my YouTube video (mid-video drop-off) · Channel
    Audit · top3: reddit, youtube, trenalittle · scope: mid-video, not the
    opening, which is #75/#76

## Block 12 · The AI-content era

Added 2026-09-03c. `/blog/youtube-ai-policy` owns the policy and the
disclosure label. These are the adjacent questions it does not answer, and
the Reddit SERPs show the anxiety is live.

Funnel: pre-monetization to monetized. CTA: Thumbnail IQ for 78, Channel
Audit for 79-80. KPI: tier-1 visitors.

78. Can you use AI thumbnails on YouTube · Thumbnail IQ ·
    top3: reddit, youtube, gyre · CLEAN: `/blog/youtube-ai-policy` owns no
    heading on thumbnails
79. Are AI slop channels killing reach for everyone else · Channel Audit ·
    top3: reddit x3, 8 of 10 forums · the creator-side complaint, not the
    policy question
80. Is a faceless AI YouTube channel still worth starting · Channel Audit ·
    top3: reddit, medium, youtube · scope:
    `/blog/faceless-youtube-channel-ideas` owns the niches and the tools
    question; this one answers whether the model still works in 2026

## Block 13 · Format and production decisions

Added 2026-09-03c. Every SERP here is 4 to 10 forum results, which is the
signal that no publisher owns the answer. These are the questions that stall
a channel before it starts.

Funnel: pre-monetization mostly. CTA: free tools then Starter pack for 81-83,
Channel Audit for 84. KPI: tier-1 visitors, tool use.

81. Should I show my face on YouTube (and is a face reveal worth it) ·
    free tools, then Starter pack · top3: reddit x3, 9 of 10 forums ·
    CLEAN: `/blog/faceless-youtube-channel-ideas` owns no face-reveal
    heading
82. Script vs improvise for YouTube videos · free tools, then Starter pack ·
    top3: reddit x3, 10 of 10 forums, the cleanest SERP in this round
83. YouTube editing takes too long, what to cut · free tools, then Starter
    pack · top3: reddit x3, 8 of 10 forums
84. Long-form or Shorts first for a new channel · Channel Audit ·
    top3: reddit x3, 9 of 10 forums · CLEAN:
    `/blog/shorts-vs-long-form` owns the "do Shorts hurt you" question,
    not the sequencing one

## Block 14 · Positioning against bigger channels

Added 2026-09-03c. `/blog/youtube-competitor-analysis` is 100% unbolded and
owns no heading on any of these, so they are additive rather than competing.

Funnel: problem-aware, any size. CTA: Competitor Analysis. KPI: tier-1
visitors reaching `/features/competitor-analysis`.

85. How to find low-competition YouTube niches · Competitor Analysis ·
    top3: packapop, reddit, reddit · CLEAN vs `/blog/youtube-niche`
86. How to differentiate when every channel in your niche is bigger ·
    Competitor Analysis · top3: reddit, medium, quora · zero
    big-authority domains in the top 10
87. How to find a competitor's keywords · Competitor Analysis ·
    top3: vidiq, keywordtool, reddit · 6 of 10 big, but the top 3 carries
    Reddit and the query maps directly to the feature · CLEAN vs the live
    competitor-analysis post
88. Is copying a successful channel's format a viable strategy ·
    Competitor Analysis · top3: reddit x3, 9 of 10 forums

## Block 15 · Traffic sources and distribution

Added 2026-09-03c. Sits alongside Block 1's traffic-sources entry (#1), which
explains the tab; these answer what to do about specific sources.

Funnel: problem-aware, existing channel. CTA: Channel Audit for 89-91, SEO
Studio for 92. KPI: tier-1 visitors reaching the named feature page.

89. What "external" traffic source means and whether to chase it · Channel
    Audit · top3: reddit, humbleandbrag, creationdepot · CLEAN vs
    `/blog/youtube-analytics` · write after #1
90. Subscribers not getting notified (the bell problem) · Channel Audit ·
    top3: support.google, reddit, tella · CLEAN vs `/blog/youtube-algorithm`
91. Does sharing YouTube videos on social media actually help · Channel
    Audit · top3: reddit, linkedin, facebook · scope:
    `/blog/more-views-on-youtube` has one heading ("8. Promote Across
    Platforms"); this answers whether it moves the algorithm, which that
    section does not
92. How to get YouTube videos ranking in Google search · SEO Studio ·
    top3: support.google, reddit, quora · CLEAN:
    `/blog/what-is-youtube-seo` owns no heading on Google SERP placement

## Block 16 · Revenue diagnostics (money is fine, then it is not)

Added 2026-09-03c. Distinct from Block 4, which is about qualifying for and
understanding payouts. These are the "my money changed and my views did not"
questions.

Funnel: monetized creators. CTA: earnings calculators, then Channel Audit.
KPI: tier-1 visitors, calculator use.

93. YouTube revenue dropped but views stayed the same · money calculators ·
    top3: reddit, facebook, bettermarketing · CLEAN:
    `/blog/youtube-rpm` owns "Why Did My RPM Suddenly Drop?", so this
    entry covers the views-flat case specifically and links there
94. The seasonal ad-revenue drop (January and Q1) · money calculators ·
    top3: reddit, reddit, support.google · CLEAN vs `/blog/youtube-cpm` ·
    fold in "reddit youtube january revenue drop", 8 of 10 forums

## Block 17 · Comments and community management

Added 2026-09-03d. `/blog/grow-youtube-channel` owns no heading on comments
or community at all, so this whole block is additive rather than competing.

Funnel: problem-aware, any size. CTA: Channel Audit. KPI: tier-1 visitors.

95. Dealing with hate comments on YouTube · Channel Audit ·
    top3: reddit x3, 7 of 10 forums · CLEAN vs `/blog/grow-youtube-channel`
96. YouTube comment spam and bot replies · Channel Audit ·
    top3: reddit x3, 9 of 10 forums · CLEAN
97. Comments held for review, and how moderation settings work · Channel
    Audit · top3: support.google, reddit, yttalk · folds in "how to
    moderate youtube comments" (top3: support.google, reddit, quora)
98. How to build a community on a small channel · Channel Audit ·
    top3: reddit x3, 9 of 10 forums · CLEAN
99. Parasocial dynamics and audience boundaries · Channel Audit ·
    top3: reddit x3, 7 of 10 forums · CLEAN · the creator-wellbeing angle
    nobody in this SERP has written properly

## Block 18 · Collaborations

Added 2026-09-03d. `/blog/more-views-on-youtube` has one heading
("11. Collaborate With Other Creators"), so these are the questions that
heading raises and does not answer.

Funnel: pre-monetization to mid-size. CTA: Competitor Analysis for 100-101,
Channel Audit for 102. KPI: tier-1 visitors.

100. How to find YouTube collab partners at your size · Competitor Analysis
     · top3: reddit x3, 9 of 10 forums · scope: the finding-and-vetting
     problem; `/blog/more-views-on-youtube` owns the "you should collab"
     argument
101. How to approach a bigger YouTube channel for a collab · Competitor
     Analysis · top3: reddit x3, 9 of 10 forums
102. Is shoutout-for-shoutout worth it · Channel Audit ·
     top3: reddit x3, 7 of 10 forums · scope: S4S specifically;
     `/blog/free-subs-on-youtube` owns sub4sub and generators, link there

## Block 19 · Channel housekeeping

Added 2026-09-03d. Small structural decisions that stall people.
`/blog/youtube-channel-optimization` owns the About section and the channel
trailer, so those two were dropped; what remains is clean.

Funnel: any size. CTA: Channel Audit for 103-104, Thumbnail IQ for 105.
KPI: tier-1 visitors.

103. Should I rebrand my YouTube channel · Channel Audit ·
     top3: reddit, tubebuddy, quora · scope: the strategic decision;
     `/blog/restart-youtube-channel` owns "do subscribers carry over if I
     rename", link there for the mechanics
104. How many playlists should a channel have, and how to order them ·
     Channel Audit · top3: reddit, yttalk, support.google · scope:
     `/blog/youtube-watch-hours` owns playlist sequencing for watch time;
     this is the organization question
105. Does the channel banner actually matter · Thumbnail IQ ·
     top3: reddit x3, 9 of 10 forums · CLEAN:
     `/blog/youtube-banner-size` owns the specs, not whether it moves
     anything

## Block 20 · Subscriber psychology

Added 2026-09-03d. Why viewers subscribe, and why they leave. Both SERPs are
forum-led and neither live post owns a heading on either question.

Funnel: problem-aware, any size. CTA: Channel Audit. KPI: tier-1 visitors.

106. Why people unsubscribe from a YouTube channel · Channel Audit ·
     top3: reddit x3, 8 of 10 forums · CLEAN vs
     `/blog/youtube-channel-not-growing` · pairs with #15 (losing
     subscribers), write #15 first
107. What actually makes a viewer hit subscribe · Channel Audit ·
     top3: reddit, quora, socialvideoplaza · CLEAN vs
     `/blog/free-subs-on-youtube`

## Block 21 · Platform choice, from the creator's side

Added 2026-09-03d. `/blog/shorts-vs-long-form` compares formats inside
YouTube and mentions no other platform. These compare platforms, which is a
different decision.

Funnel: pre-monetization mostly. CTA: free tools, then Starter pack.
KPI: tier-1 visitors, tool use.

108. YouTube vs TikTok for a creator starting today · free tools, then
     Starter pack · top3: reddit x3, 10 of 10 forums, the cleanest SERP in
     this round
109. Should I post the same video to TikTok and YouTube · free tools, then
     Starter pack · top3: reddit, tiktok, blackhatworld · zero
     big-authority domains in the top 10
110. YouTube vs Instagram Reels for growth · free tools, then Starter pack ·
     top3: reddit x3, 9 of 10 forums
111. YouTube vs podcasting for the same content · Channel Audit ·
     top3: elizabethmccravy, reddit, reddit · CLEAN vs
     `/blog/youtube-as-a-business`

## Block 22 · Production workflow

Added 2026-09-03d. How the work actually gets done, which stalls more
channels than strategy does. `/blog/best-time-to-post` owns cadence; none of
these are cadence.

Funnel: pre-monetization to mid-size. CTA: Channel Audit for 112-114, free
tools for 115. KPI: tier-1 visitors.

112. Is batch filming worth it · Channel Audit ·
     top3: reddit x3, 6 of 10 forums · CLEAN
113. Consistency vs quality, which to sacrifice · Channel Audit ·
     top3: reddit x3, 8 of 10 forums · CLEAN · scope: the trade-off itself,
     not how often to post, which `/blog/best-time-to-post` owns
114. Is outsourcing YouTube editing worth it · Channel Audit ·
     top3: reddit x3, 9 of 10 forums · CLEAN vs `/blog/youtube-as-a-business`
115. How many videos to have ready before launching a channel · free tools,
     then Starter pack · top3: reddit, subscribr, quora · CLEAN vs
     `/blog/start-youtube-channel`

## Block 23 · Pre-upload checks

Added 2026-09-03d. The two settings people get wrong before they hit publish,
both with real consequences and neither owned by a live post.

Funnel: any size. CTA: Channel Audit. KPI: tier-1 visitors.

116. How to check for copyright issues before uploading · Channel Audit ·
     top3: reddit, support.google, mubert · scope:
     `/blog/copyright-free-music` owns sourcing safe music; this is the
     pre-upload check on a finished video
117. What "made for kids" actually means and what it costs you · Channel
     Audit · top3: reddit, reddit, quora · CLEAN vs
     `/blog/youtube-demonetization` · the comment-and-personalization
     losses are the part nobody quantifies

## The internal link map

Every entry gets its links from this section plus its own scope note. Nothing
is left to the writer's judgment on the day, which is how orphan articles and
ad-hoc patching happened before.

**Three links minimum, per article, in this order of priority:**

1. **The feature page named on the entry.** Mandatory, in the CtaCard. Never
   a different feature.
2. **The anchor post for its topic** (table below). This is the established
   live post that owns the broad topic; the new article links up to it in the
   body, and the anchor gets one inbound link back to the new article in the
   same commit.
3. **A sibling** only where the entry's scope note names one ("pairs with
   #N", "write #N first"), or where the block is a genuine cluster (11, 6,
   10). Do not force a sibling link inside a shared-state block such as 7.

### Anchor posts by topic

The anchor is the live post a reader of this topic would want next. Chosen by
what the post's own headings cover, not by keyword overlap.

| Entries | Topic | Anchor post | Also link when relevant |
|---|---|---|---|
| 1, 3, 36-38, 41, 42, 74, 89 | Analytics, metrics, traffic sources | `/blog/youtube-analytics` | `/blog/youtube-channel-audit` |
| 2, 6, 12, 29 | Outliers, VPH, viral multiples | `/blog/youtube-view-growth-curve` | `/blog/youtube-trends` |
| 4, 5, 31-33, 93, 94 | Money, payouts, AdSense | `/blog/google-adsense-youtube` | `/blog/youtube-rpm` |
| 7, 61, 85-88 | Competitors, niche, positioning | `/blog/youtube-competitor-analysis` | `/blog/youtube-niche` |
| 8, 9-11, 13, 16-18, 70-73 | Reach and view drops | `/blog/youtube-channel-not-growing` | `/blog/youtube-algorithm` |
| 14, 39, 40, 43, 75-77 | Watch time and retention | `/blog/youtube-watch-hours` | `/blog/youtube-ctr` |
| 15, 20, 21, 51, 68 | Subscribers and plateaus | `/blog/youtube-channel-not-growing` | `/blog/free-subs-on-youtube` |
| 22-25, 44, 64, 78 | Thumbnails and CTR | `/blog/youtube-ctr` | `/blog/youtube-thumbnail-ideas` |
| 26-28, 56-58, 92 | Search, titles, metadata | `/blog/what-is-youtube-seo` | `/blog/youtube-seo-best-practices` |
| 30, 91 | Evergreen, trends, promotion | `/blog/youtube-trends` | `/blog/more-views-on-youtube` |
| 34 | Affiliate | `/blog/youtube-monetization-beyond-ads` | `/blog/youtube-sponsorships` |
| 45-49 | Zero views, Shorts troubleshooting | `/blog/shorts-vs-long-form` | `/blog/youtube-shorts-algorithm` |
| 50, 62, 63, 65-67, 81-84 | Starting out, format decisions | `/blog/start-youtube-channel` | `/blog/too-late-to-start` |
| 69 | Upload cadence and burnout | `/blog/best-time-to-post` | `/blog/youtube-channel-not-growing` |
| 52-55 | Policy, strikes, enforcement | `/blog/youtube-demonetization` | `/blog/youtube-ai-policy` |
| 59, 60, 90 | Community, comments, notifications | `/blog/grow-youtube-channel` | `/blog/youtube-algorithm` |
| 79, 80 | AI content | `/blog/youtube-ai-policy` | `/blog/faceless-youtube-channel-ideas` |
| 19, 35 | Growth-rate data studies | `/blog/youtube-engagement-rate` | `/blog/video-length-by-niche` |
| 95-99 | Comments and community | `/blog/grow-youtube-channel` | `/blog/youtube-channel-audit` |
| 100-102 | Collaborations | `/blog/more-views-on-youtube` | `/blog/grow-youtube-channel` |
| 103, 104 | Channel housekeeping | `/blog/youtube-channel-optimization` | `/blog/restart-youtube-channel` |
| 105 | Banner impact | `/blog/youtube-banner-size` | `/blog/youtube-thumbnail-ideas` |
| 106, 107 | Subscriber psychology | `/blog/youtube-channel-not-growing` | `/blog/free-subs-on-youtube` |
| 108-110 | Platform choice | `/blog/shorts-vs-long-form` | `/blog/youtube-shorts-algorithm` |
| 111, 114 | Treating the channel as a business | `/blog/youtube-as-a-business` | `/blog/cash-cow-youtube-channels` |
| 112, 113, 115 | Production workflow | `/blog/best-time-to-post` | `/blog/start-youtube-channel` |
| 116 | Copyright pre-checks | `/blog/copyright-free-music` | `/blog/youtube-demonetization` |
| 117 | Made-for-kids | `/blog/youtube-demonetization` | `/blog/google-adsense-youtube` |

### Rules for the anchor link

- **The inbound link ships in the same commit.** Adding the new article
  without editing its anchor leaves the new page orphaned. Both edits, one
  commit, per the runbook's Stage 3.
- **One inbound link per anchor per new article**, placed in the section that
  is actually about the sub-topic. Never a link dump at the bottom.
- **A data study links out to every diagnostic entry that cites its numbers**,
  and each of those entries cites the study. That pairing is listed on the
  study's own entry.
- **The link runs one way once an anchor is busy.** Several anchors serve a
  lot of entries: `/blog/youtube-channel-not-growing` (17),
  `/blog/start-youtube-channel` (10), `/blog/youtube-analytics` (9). The new
  article always links UP to its anchor. The anchor only links back for the
  **first three** articles in its group; after that, the new article links
  sideways to the nearest already-shipped sibling in the same anchor group
  instead, and the anchor is left alone. An anchor with seventeen outbound
  links to its own cluster reads as a link farm and dilutes the page that is
  already ranking.
- **Which three get the inbound link:** the first three shipped in run order,
  because they are the ones live longest. Note them on the anchor's row as
  they ship.
- **Never link to an entry that has not shipped.** Check the strike-through
  first; a link to an unwritten article is a 404.

## Keyword Planner sanity pass (user step, one export)

The July winners (`youtube-ai-policy`, `shorts-vs-long-form`,
`too-late-to-start`, `restart-youtube-channel`) were sourced from Reddit
and PAA clustering, not Keyword Planner volume (the July 2026 queue, 07-13 to
07-16). Volume is a sanity check here, not the gate. Once: paste all 51
title phrases into Keyword Planner, one export into `keyword-exports/`, say
"uploaded". Entries in the lowest bucket AND with no Search Console
evidence move to the bottom of their block. Nothing gets removed on volume
alone.

## Data studies

Status, methodology, quota math and the gate conditions for every study live
in `DATA-STUDIES.md`. Do not track study status here as well: a second copy
is what let study #9 sit wrongly marked "superseded" while it was a real,
confirmed, zero-quota study. The four studies in the run order above (#12,
#19, #26, #35) each name their `DATA-STUDIES.md` number.

## AI-citation fitness sweep

Moved to `AI-CITATION-SWEEP.md` (2026-09-03). It is a maintenance backlog
for 65 older posts, not a run order, and it was crowding this file. One
sweep pass runs after a new entry ships, never instead of one.

## The existing articles: what happens to them

Nothing is deleted and nothing is rewritten. Decided 2026-09-03.

- **No deletions.** The 07-09 cut removed thin programmatic pages and still
  cost five weeks of impressions when the purge landed. The articles are
  not thin, they rank for the site's only real clicks, and cutting any of
  them would repeat that cliff for no gain.
- **No rewrites, retitles, or "relaunches."** On-page passes across the
  high-impression pages were done in July and moved nothing
  (`FOUNDATION.md` → "What NOT to do"). The authority-gated commercial
  posts (keyword tools, analytics tools, SEO tools, competitor analysis,
  vidIQ, TubeBuddy) stay live as they are; they are gated on links, not
  copy.
- **Winners get linked into, not touched.** Each new entry links to the
  existing posts on the same problem, and the existing post gets one
  inbound link to the new sibling in the same commit (Stage 3 inbound
  links). Pairs to wire as entries ship: `youtube-ctr` ↔ #22,
  `youtube-channel-not-growing` ↔ #20/#21, `youtube-watch-hours` ↔ #14,
  `youtube-analytics` ↔ #1/#3/#36-42, `youtube-algorithm` ↔ #11,
  `shorts-vs-long-form` ↔ #47-49, `restart-youtube-channel` ↔ #20,
  `youtube-demonetization` ↔ #33, monetization pillar "Read Next" ↔ #4/#5/#34,
  `youtube-view-growth-curve` ↔ #12/#45.
- **The only edit allowed on an old post** is the AI-citation sweep in
  `AI-CITATION-SWEEP.md`:
  one post per pass, after a new entry ships, bold pass + false-"free"
  check + American spelling + a real PAA-sourced FAQ array. Adding the
  inbound link above is the other exception. Nothing else.
- **Judgment waits for data.** Every post shipped 08-13 to 08-21 is
  unjudgeable before a Search Console export dated 2026-09-05 or later.
  Any post that later shows position 8-20 with 500+ impressions and no
  clicks gets a title/meta review at that point, proposed to the user
  first, never done on sight.

## Dropped this round (reasons, so they don't come back)

Failed the SERP top-3 check on 2026-09-03 (two or more big-authority domains
in the top 3, or wrong searcher):

- "what is the 7 second rule on youtube": top 3 is two YouTube videos
- "youtube title vs thumbnail which matters more": youtube.com +
  support.google in top 3
- "what keywords should i put in my channel description": Hootsuite +
  youtube.com, 6 of 10 big
- "youtube reach tab explained": support.google twice, folded into #1
- "youtube adsense payment threshold": Google owns 5 of top 8, even though
  GSC shows us at pos 8-10 on the "official 2026" variants
- "how to increase rpm on youtube": already the subtitle of
  `/blog/youtube-rpm`, would cannibalize
- "how does youtube decide who to show your video to": same intent as
  `/blog/youtube-algorithm`, would cannibalize
- "youtube algorithm reset": viewer intent (resetting recommendations)
- "youtube search traffic zero": SERP is web-SEO zero-click articles
- "youtube views stuck at 301": historical curiosity, the freeze was
  removed in 2015
- "what percentage of youtube channels have 1000 subscribers": a population
  statistic we cannot measure from a tracked set, fails the one test
- YouTube shadowban checker as a free tool: real detection needs a
  search.list call per check (100 units) and cannot be cached across users.
  Not viable. #18 is the article; no tool.

Dropped in the 2026-09-03b expansion round. Six failed the SERP top-3 check
(two or more big-authority domains in the top 3):

- "how to find what is trending on youtube right now": youtube.com,
  trends.google.com and support.google all in the top 3
- "youtube trending tab how it works": support.google + youtube.com
- "youtube upload defaults settings": youtube.com + tubebuddy
- "how to change youtube channel name without losing subscribers":
  youtube.com + support.google, 5 of 10 big
- "youtube handle vs channel name": support.google + vidiq
- "youtube channel strike appeal": support.google twice in the top 3

Six more passed the SERP check but were dropped for cannibalizing a live post
that already owns the topic with its own headings, checked against
`posts.jsx` rather than assumed:

- "how to find trending topics for youtube": `/blog/youtube-trends` has 18
  headings on trend discovery, including "The 7 Best Free Ways to Find
  Trending YouTube Topics" and "How Do I Find Trending Topics for My
  Specific Niche?"
- "how often should i upload to youtube" and "how to schedule youtube
  videos": `/blog/best-time-to-post` owns "How Often Should You Post on
  YouTube?" and "Should I use YouTube's scheduler?"
- "what happens with a youtube copyright claim": `/blog/copyright-free-music`
  owns "What is the difference between a copyright claim and a copyright
  strike?"
- "youtube copyright claim vs strike" and "youtube limited ads yellow icon":
  `/blog/youtube-demonetization` owns "Problem 1: Limited Ads on One Video
  (the Yellow Icon)" and "Problem 2: Copyright Claims and Strikes (Two Very
  Different Things)"
- "how much to charge for a youtube sponsorship": `/blog/youtube-sponsorships`
  owns "How Much Sponsors Pay and How to Set Your Rate"

Dropped in the 2026-09-03c expansion round. Three failed the SERP top-3
check:

- "will ai voice get my youtube channel demonetized": tubebuddy +
  support.google in the top 3
- "youtube notifications not reaching subscribers": support.google twice
- "why is my youtube cpm so low": youtube.com + support.google, 4 of 10 big

Six passed the SERP check but a live post already owns the topic with its own
headings:

- "how to fix low audience retention": `/blog/youtube-watch-hours` owns
  "Master the 30-Second Hook to Protect Your AVD"
- "average view duration too low" and "youtube retention graph spikes":
  `/blog/youtube-analytics` owns "How to Read the Audience Retention Graph"
  and "Spikes: Moments Worth Repeating"
- "does an intro hurt retention": `/blog/how-to-start-a-youtube-video` owns
  "Step 2: Script the Hook First" and "Five Hooks That Work"
- "youtube ai content policy 2026" and "reddit youtube ai generated content
  demonetized": `/blog/youtube-ai-policy` owns "What YouTube's Inauthentic
  Content Policy Says", "Do You Need the AI Disclosure Label?" and "Does
  YouTube demonetize AI content?"
- "youtube video length for beginners": `/blog/video-length-by-niche` owns
  per-niche length headings and is a published data study
- "do i need a good camera to start youtube": `/blog/best-youtube-mic` owns
  "Why Your Microphone Matters More Than Your Camera"
- "reddit youtube rpm dropped suddenly": `/blog/youtube-rpm` owns "Why Did
  My RPM Suddenly Drop?" (entry #93 covers the views-flat case instead)
- "youtube shorts vs long form which pays more": `/blog/youtube-shorts-pay`
  owns "Shorts vs Long-Form: Why Shorts Pay 10 to 100x Less"

Dropped in the 2026-09-03d expansion round. Five failed the SERP top-3 check:

- "should i reply to every youtube comment": youtube.com + vidiq in the top 3
- "how to get viewers to come back youtube": youtube.com twice, 5 of 10 big
- "youtube video visibility settings explained": support.google + youtube.com
- "youtube monetization tab explained": support.google + youtube.com
- "youtube video quality processing 4k": support.google twice

Seven passed the SERP check but a live post owns the topic with its own
headings:

- "does collaborating help youtube growth": `/blog/more-views-on-youtube`
  owns "11. Collaborate With Other Creators" (entries 100-102 cover the
  questions that heading raises instead)
- "youtube channel trailer worth it" and "youtube about section what to
  write": `/blog/youtube-channel-optimization` owns "Channel Trailer", "The
  About Section" and "The 3-Part Description Strategy"
- "youtube channel sections how to organize": same post, same headings
- "reddit youtube shoutout for shoutout worth it" partially: 
  `/blog/free-subs-on-youtube` owns "The 'Free Subscriber' Trap: Why
  Generators and Sub4Sub Will Kill Your Channel", so entry #102 is scoped to
  S4S specifically and links there
- "should i rebrand my youtube channel" partially:
  `/blog/restart-youtube-channel` owns "Do subscribers carry over if I rename
  or rebrand my channel?", so entry #103 is scoped to the strategic decision
- "how many playlists should a youtube channel have" partially:
  `/blog/youtube-watch-hours` owns "Engineer Binge-Watching with Playlist
  Sequencing", so entry #104 is scoped to organization

Carried-over items killed on the new standard:

- Comedy spoke retroactive SERP check: article is live; a SERP check
  changes nothing unless a rewrite follows, and rewrites wait for the
  September Search Console export.
- Vlog / Shorts / Challenge ideas rewrites: the listicle shape is the
  losing shape in the data (63 hand-written articles averaged 2.2 clicks
  per page, none of the ideas posts is in the winner set;
  `youtube-vlog-ideas` sat at 48 impressions, pos 19.8 over the window).
  No rewrite until a page shows position 8-20 with 500+ impressions.
- Merch shelf spoke: FOUNDATION.md's merch export already showed 2
  advice-shaped keywords and a SERP owned by Google's shop, Amazon and
  Etsy.
- Sponsor-companies article: fails the one test, no differentiator vs.
  OutlierKit (carried from old plan).
- Promotion pass on published studies: replaced by the per-study outreach
  step in `FOUNDATION.md` → "The SaaS layer".
