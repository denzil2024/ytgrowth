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

Last updated: 2026-09-03

**Guardrails for whoever is working this list** (the full set is in
`CLAUDE.md` → "Content strategy is locked"):

- The next article is the top unstruck entry. No picking, no reordering.
- Nothing gets added here without the four-part confirmation standard and
  the evidence written on the entry. A title you thought of is not an entry.
- No keyword clusters, no Keyword Planner pulls per article, no listicles,
  no "ideas" posts, no tool comparisons, no relaunching old pages.
- Every article links to the feature named on its entry, and only that one.
- Below 30 unshipped entries, run a full research round (`FOUNDATION.md`),
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

Cadence target: 3 articles per week, one of them a data study every other
week. At that pace this list is ~17 weeks of work (through mid-January
2027). Strike items as they ship, same session. Do not add an entry that
skipped the standard.

## Block 1 · Already earning impressions with no page (write first)

Search Console shows these queries ranking on pages that don't answer them.
A dedicated page is the cheapest win on the list.

Funnel: existing creators reading their own Studio. CTA: Channel Audit /
Weekly Report ("the specific issue, with a real number from your data").

1. YouTube traffic sources explained (+ direct or unknown traffic source,
   + reach tab) · Channel Audit · GSC pos 8.4-10.9 on 4 variants ·
   top3: humbleandbrag, support.google, databox · Reddit #4
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
    it clears the floor, otherwise public sources with one disclosure

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
