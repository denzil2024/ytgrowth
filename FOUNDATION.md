# YTGrowth — Content Strategy Foundation

Process, rules, and history for the keyword-cluster content plan. Read this once; check
`CONTENT-PLAN.md` for the actual cluster map day to day.

Same method as the SavvyHomie project (`niche_website/FOUNDATION.md` + `CONTENT-PLAN.md`),
adapted for this niche.

---

## What we are building

This section did not exist before 2026-08-14, and its absence is why the blog
drifted into templates. There was plenty written about what to target next and
what not to do, and nothing about what the thing is supposed to become. When
there is no destination, the only available structure at writing time is the
previous article's structure. That is how we got two posts with the same
skeleton and a different niche word swapped in.

### The destination

**The YouTube publisher that answers questions from measured data on real
channels, when every competitor can only offer opinion.**

We hold data nobody else in this SERP has: `channel_videos` (upload dates,
lengths, titles, formats), `video_metric_snapshots` (performance over time),
`ChannelRegistry` (channel size and niche), `youtube_search_cache` (what
creators actually research), and `ai_output_cache`. vidIQ and TubeBuddy have
more authority than us and always will. They do not publish measured answers
to creator questions, they publish advice. That gap is the whole business case
for this blog.

Every article should read like it was written by someone who went and counted,
because it was.

### The one test

**Could a competitor without our database have written this article?**

If yes, do not write it. There are a hundred sites publishing the same advice
with more authority, and the diagnosis below shows what happens when we
compete with them on their terms: position 51 to 67, zero clicks, across every
commercial cluster.

This test replaces the template. It is not a style rule, it decides whether the
article exists at all:

- "18 comedy video ideas" fails. Anyone can list ideas.
- "18 comedy video ideas, plus what 699 comedy uploads since Jan 2025 show
  about length, cadence and format mix" passes, but only if the sample is real.
- Comedy's cadence figure rests on **13 channels**, which is too thin to
  publish. That is a fail, and the honest fix is dropping the figure, not
  caveating it twice in the body.

### The data floor

A measured figure is publishable when it clears all four:

| Rule | Threshold |
|---|---|
| Channels behind the figure | 30 minimum. Below that, do not publish it. |
| Videos behind the figure | 500 minimum for a length/format claim. |
| Date filter | `published_at >= '2025-01-01'`, always. `channel_videos` spans 2006-2026 and is NOT bounded by the collection window. |
| Median alongside mean | Both, always. Study #1's niches skew up to 3.83x. |

Never write "we analysed X channels" without running the count first. A
fabricated proprietary-data claim is the one mistake that would cost more than
it earns.

### What this means for structure

**Article structure comes out of the research file, never out of the last
article.** Two posts in the same cluster should only share a shape if their
SERPs genuinely share a shape. No fixed idea counts, no fixed FAQ counts, no
reusable skeleton. The previous version of this file specified "18 numbered
titles, 8 FAQs" as a template, which was wrong and is deleted.

### Voice

**The reference post is `/blog/youtube-demonetization`.** Named by the user
2026-08-14. When the voice is in question, open that post and match it. Before
this, "house voice" was asserted in four files and pinned to no example, which
is why it drifted.

What makes it the standard: **authoritative, and no fluff.** Concretely, from
measuring it against a post that had drifted:

- **The first sentence carries information, not a hook.** Demonetization opens
  by naming all five problems, then states the consequence flat: "Each one
  carries its own fix and its own deadline." No rhetorical opener, no scene
  setting.
- **No roadmap paragraph.** Never tell the reader what the article is about to
  do. Two paragraphs of intro, then the first H2.
- **Declarative.** State the claim. Do not hedge it, and do not soften it with
  "the practical answer is", "there is an argument that", "it is worth noting".
  Where a claim cannot be backed, cut it rather than hedging it. Honesty about
  sourcing belongs in one clear disclosure, not sprinkled per sentence.
- **Never restate.** If paragraph two makes the same point as paragraph one in
  different words, delete one.

Measurable targets, taken from the reference:

| | Reference |
|---|---|
| Hedge phrases per post | ~2 |
| Paragraphs opening with a bolded clause | ~5, never most of them |
| Paragraph length | 3 to 4 rendered lines, 5 max, verified with `check-blog-paragraphs.mjs` |

Also: US English, dollars, US reader assumed throughout. The remaining
per-rule detail lives in `CLAUDE.md` and memory and is not restated here,
because restating rules in a fifth file is the patching problem.

---

## The diagnosis (verified 2026-08-13)

### The one number that matters

**Tier-1 (US/UK/CA/AU) active users: 196 over 28 days. Seven per day.**

The product is $19 to $149/month behind a pay-before-signup wall. Traffic that
cannot buy is close to worthless. Every decision here is judged against that
seven, not against total sessions. Total sessions look like 1,534. That number
is misleading and should not be used.

### 1. Most traffic is not real or not useful

| Channel | Sessions (28d) | Reality |
|---|---|---|
| Direct | 701 | 93% first-time visitors. Largely bots (see below). |
| AI Assistant | 579 | Real, but skews low-tier. |
| Organic Search | 232 | Only 15% of sessions. |

Geography: **48.2% low-tier, 16.4% tier-1, 7% Western Europe.** Top low-tier
sources are India (249), Vietnam (86), China (72), Pakistan (48),
Bangladesh (39).

### 2. A large share of Direct is bot traffic

| | Users/day | Avg engagement |
|---|---|---|
| Spike days (Jul 26-31) | 92, 117, 120 | 8.8s |
| Quiet days | 29-40 | 33.0s |

Real traffic spikes do not collapse engagement 4x. Site-wide: 1.22
pages/session, 15% scroll rate, 87% first-visit. The July 26-31 spike was bots,
and benchmarking against it made a normal month look like a collapse.

### 3. Every commercial article cluster is authority-gated and earns nothing

| Cluster | Queries | Impressions | Clicks | Position |
|---|---|---|---|---|
| Keyword research | 149 | 11,848 | 0 | 51.6 |
| Competitor | 27 | 730 | 0 | 67.5 |
| Thumbnail | 11 | 326 | 0 | 65.4 |
| YouTube SEO | 42 | 2,835 | 1 | 56.2 |
| Analytics | 57 | 1,549 | 2 | 52.6 |
| Brand (ytgrowth) | 4 | 188 | 42 | 2.5 |

42 of 429 total clicks come from people already searching the brand name.
Page-1 competitors are vidIQ, TubeBuddy, Ahrefs, Semrush, Wix.

### 4. The tier-1 opportunity is gated on links, not content

The US alone is 53,249 impressions (40% of all site impressions) at position
28.78, converting 58 clicks. The demand is there; the ranking is not.
`MEDIAVINE.md` found this on 2026-07-10, did full on-page passes across every
high-impression US page on 07-11 and 07-13, and positions did not move. Its own
conclusion, still correct: **the gate is authority (backlinks), not on-page
work.** Do not redo on-page work on these pages expecting a different result.

### 5. Publishing stopped for a structural reason

Commits touching posts.jsx: 63 in May, 27 in June, 14 in July, 4 in August.
Both mapped clusters completed 2026-08-08 and nothing was queued behind them.
An empty plan file produces an empty schedule.

### 6. The keyword-cluster model is close to exhausted

Three consecutive research rounds came back mostly dead:

| Round | Result |
|---|---|
| 2026-07-28 | Subscribers, channel growth, live streaming, merch, playlists, end screens and the entire commercial track, all dropped. |
| 2026-08-13 | Video-ideas niches mostly too thin; only gaming clearly survived. |
| 2026-08-14 | `youtube equipment` and `youtube automation` dropped; `youtube sponsorship` yields one post, not a cluster. |

The dropped log below is now longer than the confirmed list. The obvious
creator-advice topics are either already covered by the ~50 live posts, owned
by DR-80+ incumbents, or polluted with watch intent.

**Do not pull a fourth seed.** That repeats the motion and returns the same
result. This finding is what makes "What we are building" above necessary: the
way forward is data we own, not keywords we find.

### 7. The 2026-08-16 impressions cliff is the delayed tail of the 07-09 page cuts, not a new incident

`gsc-exports/Chart.csv` shows daily impressions falling from ~2,000/day to
~70/day, and average position from ~20 to ~55, in one day (08-16), sustained
through the end of that export (08-20). Checked and ruled out: no page-cutting
or robots/sitemap commit landed that week (git log 08-13 to 08-17 is publish
commits only); the live site serves gaming-video-ideas with full prerendered
content, no noindex, robots.txt matches the repo.

The actual cause is `1c494b37d`/`56b574f74` (2026-07-09, retiring ~302 thin
programmatic pages, see the history log's Combo layer entry): Google took
about five weeks to finish purging that batch from its index, which is
ordinary lag for a redirect-based removal with no explicit Search Console
removal request. The math confirms it rather than just the dates: the retired
pages averaged position 8.6, so losing them both crashes impressions AND
drags the average position *up* (worse), landing exactly in the 51-67 range
item 3 above already documented for the authority-gated commercial clusters
that are what's left. Nothing broken, nothing to fix, this was the expected
outcome of a deliberate cut finally landing in the data five weeks later.

**Consequence for reading new content's performance:** every spoke and study
shipped 08-13 through 08-21 (gaming, comedy, cooking, tech, music,
video-length-by-niche, title-length) shipped into or right before this
cliff, so a "zero impressions" read on any of them right now is confounded,
not a verdict. Do not judge them before a GSC export dated 2026-09-05 or
later, once the site has had real runway past the cliff.

---

## How this site differs from SavvyHomie

SavvyHomie is Amazon-affiliate/Pinterest content with no existing posts, so its difficulty test
is "does an indie blog beat the retailers" and its traffic model is Pinterest-first. YTGrowth is
a SaaS content site, Google plus AI-answer-engine driven, with around 50 posts already live and
real competitors (vidIQ, TubeBuddy, Backlinko, Social Blade, HubSpot) instead of retailers.

Organic Search is the target #1 channel, not AI Assistant. AI Assistant currently leads in raw
sessions (833 vs Organic Search's smaller share, GA4 pull 2026-07-26) but that's a byproduct of
ranking and being cited well, not the goal to chase directly.

---

## Confirmation signals

1. Google SERP test, the primary one. Is there at least one smaller or independent site (a solo
   creator's blog, a smaller SaaS competitor, a niche YouTube-tips site) in the top 3, not
   entirely Backlinko, HubSpot, vidIQ's own blog, or TubeBuddy's own blog? If the whole top 3 is
   huge authority, it's hard. A keyword must pass this to confirm, the signal below is extra
   credit, never a substitute. Also watch for tool-intent SERPs (name generators, intro makers,
   trend trackers) — those fail an article regardless of who ranks, see the dropped log below.
2. AI-answer-engine signal, secondary and a bonus. A candidate that's a clear, specific,
   answerable question gets noted as a bonus. Never confirms a keyword that fails the SERP test.

Volume source: real Google Keyword Planner exports only, never invented or estimated. Drop
CSVs into `keyword-exports/`, say "uploaded" when done.

---

## The structure test (added 2026-07-28)

Before proposing a seed, ask: does this topic split into genuinely distinct sub-topics, or is
it one question asked many ways? SavvyHomie's clusters work because pantry, fridge, drawers,
and linen closet are physically different things with different queries. "Get subscribers" is
not, it's one intent with 98 synonym phrasings, which yields one post, not a cluster.

Seeds that pass have a real second dimension: by niche (gaming, cooking, finance), by audience,
by format, or by distinct product feature. Seeds that fail are the generic advice head terms
(grow, subscribers, views, growth), also the ones vidIQ and TubeBuddy already own.

---

## Workflow

1. Pick one cluster or gap at a time, never map everything at once.
2. Pillar first, always. Propose 2-3 broad head-term pillar candidates (never long-tail question
   phrases, a narrow seed returns a shallow export with nothing to mine), never a single
   guessed pillar.
3. Pull the pillar candidates through Google Keyword Planner, drop CSVs into `keyword-exports/`.
4. Confirm the pillar: strongest real volume, on-topic, doesn't duplicate an existing live
   post's angle, passes the Google SERP test.
5. Only after the pillar is confirmed, mine spoke candidates from inside that same Keyword
   Planner export. Extract every keyword at 500+/mo that's on-topic, isn't a near-duplicate of
   an existing live post or another confirmed keyword, isn't off-format.
6. Every surviving spoke candidate gets the Google SERP check, that decides confirm or drop.
7. 3 confirmed is the floor for a sub-cluster to stay in the plan, below that, drop it, don't
   leave a stub. 5 is a first-round target, not a hard cap.
8. Pillar gets written first even if it's the hardest term in the cluster.
9. Report back every time: confirmed (volume, who ranks, which signal passed), dropped (why),
   running sub-cluster count, running cluster total. Track pillar separate from spoke count.

---

## Existing coverage (around 50 posts live, see `frontend/src/blog/posts.jsx`)

Check before proposing anything, to avoid cannibalizing a post that's already live.

Demonetization / policy: youtube-demonetization, youtube-ai-policy, google-adsense-youtube,
youtube-partner-program

Monetization / earnings: cash-cow-youtube-channels, youtube-shorts-pay, youtube-rpm,
youtube-cpm, youtube-1-million-views, youtube-sponsorships

Growth strategy, general: restart-youtube-channel, too-late-to-start, more-views-on-youtube,
youtube-channel-not-growing, grow-youtube-channel, youtube-as-a-business, youtube-niche,
faceless-youtube-channel-ideas, youtube-video-ideas, how-to-start-a-youtube-video

Shorts: shorts-vs-long-form, shorts-tagging, youtube-shorts-algorithm

SEO / discovery: what-is-youtube-seo, youtube-seo-best-practices, youtube-tags,
youtube-tag-finder, video-tagging, youtube-algorithm, youtube-competitor-analysis,
youtube-channel-audit, youtube-channel-optimization

Analytics / metrics: youtube-ctr, youtube-analytics, best-time-to-post, youtube-watch-hours,
youtube-trends, youtube-analytics-tools

Thumbnails / titles / descriptions: youtube-thumbnail-ideas, youtube-maker,
youtube-thumbnail-size, youtube-banner-size, youtube-description-template, youtube-title

Tools / comparisons: best-youtube-mic, copyright-free-music, chrome-extensions-for-youtube,
youtube-keyword-research-tools, tubebuddy-vs-vidiq, vidiq-review, thumbnail-tester,
seo-tools-for-youtube

Subscribers: free-subs-on-youtube

Gaps not yet covered: platform-specific comparison content beyond vidIQ/TubeBuddy (Social
Blade, Creator Studio native tools), monetization beyond ads (memberships, Super Thanks, brand
deals), live-streaming growth. Channel growth stages was also a gap, tested 2026-07-28, see the
dropped log below, it's dead.

---

## Parked tracks (queued behind the cluster map, per user 2026-07-28)

Commercial keywords: bottom-funnel, buyer-intent keywords aimed at $5 Starter pack conversions
rather than authority. Same confirm-before-build rule applies. Candidates proposed but not yet
pulled:

1. "vidiq alternative" (plus cheaper vidiq alternative, vidiq alternative free, best vidiq
   alternative) — displacement intent.
2. "youtube channel audit tool" / "free youtube channel audit" — direct match to the Channel
   Audit feature page.
3. "vidiq pricing" / "tubebuddy pricing" — comparison-shopping, pricing-undercut page.

Pinterest: separate initiative, not a keyword-validation signal. Create a Pinterest account,
start pinning (checklists, cheat-sheet infographics, thumbnail-template mockups, before/after
channel-audit graphics) linking back to posts, same channel SavvyHomie uses as primary.
Deprioritized 2026-07-28: weak lever for direct sales, Pinterest audience is browse/inspiration
mode, not "buying a SaaS tool" mode. Parked, not killed.

Commercial keywords track — DEAD, 2026-07-28. All 3 candidates (vidiq alternative, youtube
channel audit tool, vidiq pricing/tubebuddy pricing) came back in Keyword Planner's lowest
volume bucket, low enough the user didn't consider them worth even exporting. Makes sense in
hindsight: this niche is small, and the real commercial volume is already owned by 4 live posts
(vidiq-review, tubebuddy-vs-vidiq, seo-tools-for-youtube, youtube-keyword-research-tools). Do
not re-propose new alternative/pricing/tool-comparison pillars, there isn't fresh ground here.
If commercial intent needs more coverage later, it's a CRO pass on those 4 existing posts
(stronger $5-pack CTAs), not new pages.

Two product opportunities surfaced by real keyword data (2026-07-28), not yet built:

1. `/youtube-video-ideas/:niche` programmatic column. 568 niche/audience-modified variants in
   the Video Ideas cluster export sit at 50/mo each, too small individually but substantial
   collectively. Same shape `/youtube-earnings/:niche` already handles, near-zero marginal
   cost, zero YouTube quota.
2. Free YouTube channel name generator. "youtube channel name ideas" (5,000/mo, the single
   biggest term found in this research round) fails as a post because the SERP is entirely name
   generators (vidIQ, Renderforest, Hootsuite, Squarespace). Buildable with the existing Claude
   wiring, zero YouTube quota, and a free tool converts to signup far better than a listicle.

---

## Dropped clusters / candidates (log, so they don't get re-proposed)

Channel growth stages / subscribers — all three pillar seeds dropped 2026-07-28.

- "youtube subscribers" (835 rows, head term 50,000/mo): real volume, wrong intent. Export
  polluted with YouTube Premium / Twitch subscription queries ("youtube premium subscription"
  500,000/mo, "twitch subs"), SERP is subscriber-counter tools, Wikipedia, Statista, SubPals
  (a sub-bot service). Format mismatch.
- "youtube channel growth" (43 rows, tops at 500/mo): too shallow to mine. Its 500/mo tier is
  mostly "fastest growing youtube channels", listicle/curiosity intent owned by Social Blade.
- "how to get subscribers on youtube" (852 rows, 5,000/mo): deepest export of the three, still
  a fail. 98 keywords clear 500/mo but are one question reworded ("how do i get subscribers",
  "how to get subs fast"), no sub-cluster structure. What differs is either already owned by a
  live post or bot/spam intent ("how to get free subscribers", "how to bot subs"). SERP:
  Network Solutions, Backstage, WordStream, all big authority, no independent site.

Video Ideas cluster, spokes that failed:

- "youtube intro ideas" (500/mo) — SERP wants an intro maker (Canva, Renderforest, Wyzowl), not
  advice.
- "trending youtube topics" (500/mo) — SERP wants live data (Google Trends, yttrendz,
  CreatorDB). An article can't serve that intent.
- "youtube channel name ideas" (5,000/mo, biggest term in either export) — SERP is AI name
  generators (vidIQ, Renderforest, Hootsuite, Squarespace, Wix, Thinkific). Not dead, see the
  tool opportunity above, it just needs a tool instead of a post.
- "youtube content ideas" (500/mo) — near-duplicate of the pillar, would cannibalize it.
- "youtube thumbnail ideas", "faceless youtube channel ideas", "youtube banner ideas" — live
  posts already cover these.
- "youtube video ideas for beginners" — confirmed as a spoke back on 2026-07-28, caught 2026-07-28
  right before writing it: the live pillar's actual title is "YouTube Video Ideas for Beginners:
  10 Ideas That Work With Zero Subscribers", same intent already. Would have cannibalized the
  pillar. This one slipped through the original spoke-confirmation pass because the check was
  against the pillar's slug and keyword, not its actual on-page title/framing — worth checking
  the live title, not just the slug, when confirming future spokes against an existing pillar.

Faceless youtube channel — dropped 2026-07-28. Only 68 rows total, and only 9 clear 500/mo.
After removing near-duplicates of the pillar itself and of the already-live post
(faceless-youtube-channel-ideas), only 2 genuinely distinct angles remain: "top faceless
youtube niches" and "faceless youtube automation". Below the 3-confirmed floor, doesn't stand
as its own cluster. Worth a look later as single one-off posts, not a cluster.

Youtube playlist — dropped 2026-07-28. 1,992 rows but almost entirely watch/listen intent even
after stripping obvious download/mp3/music noise: people searching to listen to a specific
artist's playlist on YouTube (bruno mars playlist, taylor swift playlist, abba playlist, adele
playlist, dozens more), not creators wanting advice on organizing their own channel's playlists.
Zero genuine creator-advice queries found at 500+/mo. Same watch-intent failure as "youtube live
stream".

Live streaming / merch (the two flagged coverage gaps, tested 2026-07-28) — both dropped, real
volume but wrong searcher in both cases.

- "youtube live stream" (1,858 rows, head term 50,000/mo): the head term is dominated by
  watch-intent pollution, YouTube TV, NFL/ESPN/sports, news, church livestreams, celebrity
  streamers like iShowSpeed, not creators looking to start streaming. After stripping that
  pollution, real creator-advice queries (go live on youtube, obs youtube stream, stream to
  youtube and twitch) barely clear 500/mo each and there are only about 6 of them. Too thin for
  a cluster despite the huge head-term number.
- "youtube merch" (837 rows, head term 5,000/mo): almost the entire export is fans searching a
  specific creator's store by name (unspeakable merch, shane dawson merch, smosh merch, mkbhd
  merchandise), shopping intent for someone else's brand, not "how do I start selling merch"
  advice intent. Only 2 keywords in the export are actually advice-shaped ("merch for youtube",
  "merch by youtubers"), both at 500/mo, nowhere near the 3-confirmed floor. SERP confirms it:
  Google's official merch shop, Amazon, Etsy own the head term, no advice content in sight.
- Both gaps (live-streaming growth, monetization-beyond-ads) stay marked as gaps in Existing
  coverage above, they're real, just not winnable as blog-post clusters on this evidence. Do
  not re-propose "youtube live stream" or "youtube merch" as pillar seeds.

Gear / equipment — dropped 2026-08-14 (`keyword-exports/Keyword Stats 2026-08-14
at 05_32_26.csv`, 597 rows, 38 clear 500/mo). Two independent failures. (1) Watch-intent
pollution: "c&c equipment youtube" (5,000/mo), "diggers on youtube", "machinery pete you
tube", "keith rucker vintage machinery", "tractor john deere youtube", people looking for
videos ABOUT equipment, not creators buying it. Same failure as playlist / merch / live
stream. (2) After stripping that, all 88 remaining keywords are ONE intent (what camera
should a beginner buy), 20,500/mo of synonym phrasings. The predicted sub-topics do not
exist at volume: lighting tops out at 50/mo (1,000/mo across 20 keywords), audio/mic
50/mo, tripod 150/mo total, backgrounds ZERO keywords. SERP for the camera term is owned
by manufacturers and gear publications (OBSBOT, DJI, UniquePhoto, DigitalCameraWorld),
a hardware-review vertical where we have no first-hand product testing and cannot
credibly compete. Do not re-propose equipment, cameras, lighting, or gear.

YouTube automation — dropped 2026-08-14 (`keyword-exports/Keyword Stats 2026-08-14 at
05_32_44.csv`, 196 rows, 9 clear 500/mo). The head term (5,000/mo) means the cash-cow /
faceless business model, already owned by two live posts (cash-cow-youtube-channels,
faceless-youtube-channel-ideas), so it cannibalises. The one distinct angle, workflow
tooling ("youtube automation tools", "n8n youtube", "automatic youtube upload", ~1,500/mo),
has a SERP owned by automation SaaS vendors (Make.com, n8n.io) and serves a developer /
ops intent, not a creator-growth intent. Wrong audience for the product. Do not
re-propose automation or workflow tooling.

Sponsorship — NOT a cluster, 2026-08-14 (`keyword-exports/Keyword Stats 2026-08-14 at
05_31_38.csv`, 126 rows, 11 clear 500/mo). Seven of the eleven are synonym phrasings of
the existing /blog/youtube-sponsorships post ("sponsor youtube video", "sponsor for
youtube channel", "sponsoring video youtube"). "sponsor block youtube" is the SponsorBlock
extension, viewer intent. ONE distinct angle survives: sponsor-company lists ("youtube
sponsor companies" + "youtube sponsorship companies" + "common youtube sponsors",
5,500/mo). SERP has real independents (OutlierKit, sponsorship.so, SponsorTrace) alongside
vidIQ and Wikipedia, so it passes the diversity test, but OutlierKit ranks on original
sponsor data we do not have. Viable as ONE post, not a cluster, and only worth writing if
we can find a genuine differentiator beyond another list of company names.

YouTube Studio features → End screens — dropped 2026-07-28
(`keyword-exports/Keyword Stats 2026-07-26 at 17_23_16.csv`, 227 keywords). Only 21 keywords
clear 500/mo and all 21 are near-duplicate phrasings of one concept (end screen / yt end screen
/ endscreen / end card), one post, not a cluster. The remaining 197 sit at 50/mo, mostly
template-download intent (Premiere Pro / green screen / free download), a format this site
doesn't serve. SERP: Clipchamp, Backlinko, HubSpot own the top 3. Do not re-propose end screens,
cards, or outro templates.

---

## The runbook

**This is the only content process.** `SEO-OPTIMIZATION-CHECKLIST.md` was
folded into it on 2026-08-14 and is now a stub. A process split across two
files got skipped for a month.

### Why this exists in this shape

The 2026-08-14 session cost far more than it should have. The causes, so the
runbook can be judged against them:

| What happened | Cost | Fixed by |
|---|---|---|
| One article reviewed in six separate rounds (tables, then sourcing, then voice, then headline, then cover, then a date bug) | 6x re-read and re-measure of the same file | Stage 3: run the WHOLE standard before showing anything |
| Turns spent diagnosing contradictory plan files instead of working | 3 turns | Two plan files with one job each: `CONTENT-PLAN.md` is the list, this file is everything else |
| Re-derived what "house voice" means from scratch | 2 turns | Voice reference named above |
| Four consecutive replies ended in a question instead of an action | 4 turns | Stage 0 defaults |
| No way to tell what was already done | rework | The research file doubles as the state file |

**The single most expensive mistake is presenting partial work.** Every partial
present costs a full review round. Do the complete pass, then present once.

### Stage 0 — Session start (read exactly two files)

1. `CONTENT-PLAN.md`, for what ships next.
2. `research/<slug>.md` for the article in flight, if there is one. Its
   `Status:` line says where things stand. If there is no article in flight,
   the top unstarted entry in `CONTENT-PLAN.md` is next.

Do not read `MEDIAVINE.md`, `DATA-STUDIES.md`, `HANDOVER.md` or the memory
index unless this file or `CONTENT-PLAN.md` sends you there for a specific
reason. Grep-wandering across a dozen markdown files at session start is a
real and recurring cost.

**Defaults, so no turn is spent asking:**

- Next article is the top unstarted entry in `CONTENT-PLAN.md`. Start it.
- Never ask which of two approaches to take. Pick the one this file implies,
  state the choice in one line, proceed.
- Never ask for permission to run `gen-blog-meta.js`, a verification script, or
  a screenshot. Just run them.
- Only two things genuinely require asking: **approval of the research file and
  outline** (Stage 2), and **the go-ahead to push** (Stage 5).

### Stage 1 — Research

Fill `research/<slug>.md` from `research/TEMPLATE.md`. **No research file, no
article.** The research rule previously lived in four files and was skipped
anyway, because skipping left no trace. A missing file leaves a trace.

- Fetch the live top 10. Real URLs, opened this session, dated in the file.
  Never cite a source that was not fetched: two domains were fabricated on
  2026-07-28.
- Build the coverage matrix. Cover the UNION of competitor sections, not the
  intersection. Compare your section count against the strongest competitor.
- Name the gap, and what we can answer from our data that they cannot.
- Answer the one test in writing. If a competitor without our database could
  write this, stop. A rejected research file is a success.
- Run the data pull. Check every figure against the data floor above. Figures
  that fail the floor get dropped, not caveated.

### Stage 2 — Present and wait

Present the research file and the outline. **Wait for approval.** This is one
of only two blocking gates.

### Stage 3 — Write the whole standard in one pass

Write against every item below on the first draft. Do not write first and clean
up after: that is what produced six review rounds on one article.

**Substance**
- Structure comes from the matrix, never from the previous article's shape.
- No fixed idea counts, no fixed FAQ counts, no reused skeleton.
- Every claim is either measured or plainly reasoned. Never dress judgement as
  data: a ranking column in a table next to a measured table reads as measured.
- Where a claim cannot be backed, cut it. Do not hedge it. Hedging is fluff and
  is not the same thing as honesty. Put sourcing honesty in ONE disclosure.

**Voice** (reference post: `/blog/youtube-demonetization`)
- First sentence carries information, not a hook.
- No roadmap paragraph. Two intro paragraphs, then the first H2.
- Declarative. Target ~2 hedge phrases for the whole post.
- Never restate a point in different words.
- Paragraphs 3 to 4 rendered lines, 5 max.
- Bold-lead paragraphs: about 5 per post, never most of them.
- Banned: "actually" (check headings too), em-dashes, italics, the word "land"
  in its figurative sense, generic "Final Thoughts" or "Conclusion" endings.
- Grep existing intros before finalising a new one. No repeated opening move.
- US English, dollars, US reader.

**Ideas and lists**
- List items use the house format: `<li><strong>N. "Title"</strong><br />two or
  three sentences of real explanation.</li>`. Never a bare table cell. A
  4-column table of 40 rows is unreadable on mobile and contains no writing.

**Furniture**
- `CtaCard` mid-article, never at the end.
- Internal links both directions: link out to the pillar and siblings, and add
  at least one inbound link from an existing relevant post.
- Cover image needed: say so explicitly. Never generate one.

**Metadata, all in the same pass**
- `excerpt` in posts.jsx. Feeds the visible dek AND the JSON-LD description.
- `seoMeta.js`: title <=60 chars, description <=155. Measure, do not eyeball.
- `faqs` array mirrors the visible FAQ section word for word. Same count, same
  order, same text. Read both blocks side by side. Escaping differs (JS string
  needs `\'`, JSX text does not) but the rendered words must be identical.
- `sitemap.xml` entry with today's `lastmod`.
- `llms.txt` entry. Live acquisition channel, not an afterthought. Write it
  from the page's own verified content, never from a hub or marketing blurb.
- `updated` date bumped when revising an existing post.
- `readTime` roughly matches the word count.
- Prerender route is automatic via `discoverBlogSlugs()`. Nothing to add.

### KNOWN DRIFTS — check yourself against these before presenting

Every one of these happened on 2026-08-14, on a single article, and each was
caught by the user rather than by the model. They are listed with a tell you
can measure, because "write well" is not checkable and a number is.

**Writing drifts**

| Drift | The tell | Do this instead |
|---|---|---|
| Copying the last article's shape | Your H2 list matches another post's with a niche word swapped. Compare them literally. | Structure comes from the coverage matrix. If two posts in a cluster share a skeleton, that has to be because their SERPs do. |
| Content dumped into tables | Tables >4, or a table with more than ~8 rows carrying the article's actual substance. 42 ideas once shipped as six 4-column tables: no prose in the middle of the article and unreadable on mobile. | Ideas and lists use `<li><strong>N. "Title"</strong><br />two or three sentences</li>`. Tables are for comparison, not for content. |
| Bolded clause opening every paragraph | Count `<p><strong>`. It hit 38 of 55. Target ~5. | Bold the few genuinely load-bearing claims. When most paragraphs open bold, none of them are emphasised. |
| Judgement dressed as data | A ranking column (Highest/High/Medium) or a "score" sitting in the same visual format as a measured table. A reader cannot tell them apart. | Either measure it or do not present it as a measurement. Put craft guidance in that column instead, and state plainly which figures are measured. |
| Hedging instead of cutting | Count hedges: "there is an argument that", "the practical answer is", "it is worth noting", "we cannot answer that". Target ~2 per post. | Where a claim cannot be backed, CUT it. Hedging is fluff and is not honesty. Put sourcing honesty in ONE disclosure. |
| Hook-and-roadmap intro | Paragraph 1 is a rhetorical opener with no information, paragraph 2 restates it, paragraph 3 says what the article will do. | Reference post opens by naming all five problems, then states the consequence flat. Two paragraphs, then the first H2. |
| AI-sounding headline | Abstract noun plus a vague verb: "42 Premises That Land Without Setup". | Say the article's actual argument the way a person would. |
| One-substitute find-and-replace | You removed a crutch word by swapping every instance for the same replacement. That is a new crutch. | Vary the replacements and check the density of whatever you replaced it with. |
| A repeated phrase doing all the connective work | Grep the draft for your own tics. "rather than" hit 23 in one post. | Vary the construction. Also check "which is", "because", "so". |
| Caveating a figure that fails the data floor | Any sentence apologising for a sample size. One post caveated 13 channels twice. | Drop the figure. A caveat is not a substitute for having the data. |

**Process drifts, which cost more than the writing ones**

| Drift | Why it is expensive |
|---|---|
| Presenting partial work | The single biggest cost on 2026-08-14. Six review rounds on one article, each a full re-read. Run the WHOLE standard, verify, present once with the numbers. |
| Fixing the surface complaint instead of the real one | "We write in different voices" was answered by auditing spelling, which was not what it meant. Ask what the complaint is actually about before doing the work. |
| Proposing a fix that IS the problem | The first proposal for "there is no process" was to write the process rule into a fifth file. Adding a rule is the patching behaviour. Check whether your fix is another instance of the thing being complained about. |
| Asking instead of deciding | Four consecutive turns ended in a question. Only two things block: outline approval, and the push go-ahead. |
| Re-deriving what is written down | The voice reference, the data floor, and the queue are all written down. Measuring them again from the posts is rework. |
| Leaving the plan stale after shipping | This section of the history log went stale twenty minutes after being written, once. Stage 6 exists for this. |

**Technical drifts**

| Drift | Guard |
|---|---|
| Scripted edit to the `faqs` array breaks the file | An apostrophe inside a JS single-quoted string needs `\'`; the visible JSX copy does not. This has broken `posts.jsx` twice. Always lint immediately after a scripted edit. |
| FAQ array and visible section drift apart | They must render identical words. Escaping may differ, text may not. Check after every FAQ edit. |
| Editing generated files | `postsMeta.js` is generated. Fixing it without fixing `gen-blog-meta.js` gets silently reverted on the next run. Check whether a file has a generator before editing it. |
| Trusting a green deploy | Railway reporting Active does not mean it serves the new build. Verify by grepping the live HTML for a specific new phrase. |

### Stage 4 — Verify before presenting, every time

```bash
cd frontend
npx eslint src/blog/posts.jsx                      # must show no "Parsing error"
node scripts/verify/check-drift.mjs <slug>         # the KNOWN DRIFTS above, measured
node scripts/gen-blog-meta.js                      # always, no asking
npm run dev                                        # then, in another shell:
node scripts/verify/check-blog-paragraphs.mjs <slug> 5 <port>
```

`check-drift.mjs` exits non-zero on failure and needs no dev server. It counts
tables, bold-lead paragraphs, hedges, the "rather than" and "which is" tics,
every banned word, British spellings, the CtaCard, and H2 overlap with every
other post. Thresholds are calibrated so the reference post passes. **It is not
optional and it is not a formality: run on the comedy post the first time, it
immediately found three instances of the banned word "actually" that four
manual review rounds had missed, on a page that was already live.**

- [ ] Parses clean. A scripted edit to the `faqs` array has broken this file
      twice with an unescaped apostrophe. Always lint after one.
- [ ] Zero paragraphs over 5 lines.
- [ ] FAQ array count equals visible `<h3>` count, and the text matches.
- [ ] Grep the post for: "actually" (case-insensitive), em-dashes, figurative
      "land", British spellings.
- [ ] Cover file exists, is a 1600x900 JPG around 100 to 150KB, and the page
      loads it with no failed requests. Convert and delete any PNG source.
- [ ] Screenshot desktop AND mobile, and actually read them. The 42-ideas-in-
      tables problem was invisible in source and obvious in one screenshot.
- [ ] Counts against the reference post: tables, bold-lead paragraphs, hedges.

**Then present once, with the numbers.** Not a partial fix.

### Stage 5 — Build and deploy (only on explicit go-ahead)

- `BUILD_API_URL=https://ytgrowth.io npm run build`. Never the bare build, or
  every `/youtube-stats/*` page ships an empty leaderboard.
- Railway serves the committed `frontend/dist/`. Every `src` change needs a
  rebuilt dist in the same commit. Never `git checkout -- dist/`.
- Stage files by name. Never `git add -A`.
- Verify live by checking for a specific new phrase, not just an HTTP 200.
- Request indexing in Search Console.

### Stage 6 — Close the loop, in the same session

**Non-negotiable.** A plan that describes a state the repo has left is worse
than no plan.

Immediately after a successful deploy, in the same session:

- [ ] Strike the item through in `CONTENT-PLAN.md` with the ship date and commit hash.
- [ ] Add anything still open about it to the history log below, or leave it
      out if nothing is.
- [ ] Set `Status:` in `research/<slug>.md` to `done`, tick the stage log, and
      empty or update its Outstanding list.
- [ ] Re-read `CONTENT-PLAN.md`'s "NEXT" marker. If it names the article you
      just shipped, move it.

### Definition of done

An article is done when Stage 4 passes with every box ticked, Stage 5 is
verified live by content, and Stage 6 has left the plan matching reality. Not
before. "The tables are fixed" is not done, and neither is "it is deployed"
while the plan still says otherwise.

### Publishing

Every new route ships in ONE commit: source page, `prerender.js`
`buildRoutes()`, sitemap entry, llms.txt entry, rebuilt dist, cover image.
Missed three times. Slugs are 2 to 4 words.

---

## History log

**Comedy shipped without Stages 1 and 2.** Live at
`/blog/comedy-video-ideas` since 2026-08-14, commit `839a04d24`. No SERP was
fetched and no coverage matrix was built, so nothing confirms it covers what
the ranking pages cover. Everything else was brought up to standard before it
went out, and `research/comedy-video-ideas.md` records the real state. To
close it: fetch the top 10, build the matrix, add any section a ranking
competitor has that we lack. The post is live, so this is an edit, not a
rewrite. Tracked as an open item in `CONTENT-PLAN.md`.

**The parked gaming ideas file.** `frontend/src/data/youtubeVideoIdeas.js`,
still untracked, superseded by `/blog/gaming-video-ideas` shipping 2026-08-13.
Delete it or ignore it; it is not a queue item.

**Three spokes predate the current standard, flagged by the user 2026-08-20.**
`/blog/youtube-vlog-ideas` (shipped 2026-08-08), `/blog/youtube-shorts-ideas`,
and `/blog/youtube-challenge-ideas` (both 2026-07-28) all predate the
numbered-idea-plus-measured-upload-data format every post from cooking
(2026-08-15) onward uses. Confirmed: none of the three has a single numbered
idea in the current `N. "Title"` pattern, and none carries a real
cross-referenced upload-data table in the current style. Do not start without
a research file per the standard process; these are candidate rewrites in
`CONTENT-PLAN.md`, not confirmed yet.

**Video Ideas pillar/spoke system overhaul. DECIDED 2026-08-19, done
2026-08-20.** Checked how the sister project (`niche_website`, SavvyHomie, at
`C:\Users\HP\OneDrive\Desktop\niche_website`) handles this, since it runs the
same pillar/spoke model across many more clusters. Its pattern: every pillar
ends with a dedicated, explicitly labeled `## More [Cluster] Guides` section,
one bullet per spoke, each with a real one-line differentiator, kept in sync
as spokes ship. Spokes do not mirror that section; they carry one inline
sentence near the intro linking back to the pillar and the closest sibling or
two. Our pillar had none of that: two scattered sentences wedged into
unrelated body paragraphs, no dedicated section, and it read thinner than the
spokes it was supposed to anchor.

Two steps, in order:
1. Rewrite the pillar itself first, to a depth on par with the spokes it
   anchors, before touching any linking. **DONE 2026-08-20.** Pillar
   rewritten from 10 generic ideas with zero data to 111 ideas across 15
   formats, backed by a real cross-niche upload-data table (14 tracked
   niches, 83,423 videos, data floor expanded live via
   `scripts/expand_category_discovery.py` for the 5 niches that were short).
   FAQ section corrected mid-build after the first draft was written from
   reasoning, not real search data, then pulled for real via the Serper
   People Also Ask API, see `research/youtube-video-ideas.md`.
2. Internal-linking pass across the full cluster. **DONE 2026-08-20.**
   Audited all 4 shipped spokes: tech already linked to the pillar and every
   sibling. Gaming, cooking, and comedy had zero links to the pillar or to
   any sibling spoke, confirmed by grepping every `href="/blog/..."` in each.
   Added one inline sentence to each, near its own "why format beats a single
   idea" section, in that article's own voice, not copy-pasted between them.

Music, shipped after this, got the same treatment on the way out.

**Found in passing, now fixed (2026-08-21):**
- `gaming-video-ideas` had 18 bold-lead paragraphs against a target of 8
  (shipped 2026-08-13, before the drift checker existed, so it was never
  checked). Unbolded 11 non-load-bearing lead clauses, kept the 2 thesis
  statements, the 3 measured-data claims, the opening, and the closing
  payoff. Now 7, drift check passes.
- `comedy-video-ideas`'s data section cited 699 videos / 17 channels from
  its original, thin pull. Re-queried live via `scripts/query_comedy_refresh.py`
  (run on the Railway app-service console): comedy is now 155 channels,
  8,351 videos, median 1.9 min (not 9.0), mean 11.9 min, 31.7% Shorts share
  (not 26.7%). The median dropped enough to flip the mid-roll framing
  entirely: the old text said comedy's typical upload "just clears" the
  8-minute mid-roll line; the real figure falls nowhere close, so comedy
  reads as a Shorts-first niche, not a borderline-mid-roll one. Rewrote the
  data table, the two body paragraphs built on the old framing, the "Which
  of These Clear the Mid-Roll Line" section's opening claim, both FAQ
  entries citing length/Shorts share (array and visible HTML both), and the
  Compression section's Shorts-share callout. Also synced the pillar's
  comedy row to the same fresh numbers. Both drift checks and paragraph-
  length checks pass.

**Title-length study (data study #2), shipped 2026-08-21, commit
`e4c95478b`.** Promoted from a fold-in stat into `/blog/youtube-title` to a
standalone article per `DATA-STUDIES.md` study #2, after user feedback that it
needed real depth. 28,947 videos / 707 channels, r = 0.0046 pooled (no
relationship), negligible in every niche and every cross-tab. Competitor
research was redone once after being flagged as thin (8 URLs opened, 4 fully
read on the first pass; 13 opened, 9 fully read on the second); found that one
of the four competing studies' "3M-video" claim traces to an unreachable
domain, echoed uncredited across duplicate pages on another site with two
different numbers. Also corrected `/blog/youtube-title`'s unsourced "eight
words" claim to cite this instead. First push went out without approval and
got substantially reworked in 12 follow-up commits, see `research/youtube-title-length.md`.

**Music Video Ideas, shipped 2026-08-20, commit `a60c79781`.** 43 ideas, 7
formats, split explicitly between promoting the song and building the
channel. 181 channels / 6,801 videos, data floor cleared on the first pass,
no expanded discovery needed. First FAQ built from real Google People Also
Ask data pulled before writing, not guessed and corrected after.

**Tech Video Ideas, shipped 2026-08-19, commit `fdaae2220`.** Data floor
failed on the first pass (17 channels), fixed live by running broader
discovery queries instead of waiting on the weekly sweep: 127 channels /
5,876 videos. See `scripts/expand_category_discovery.py` and
`research/tech-video-ideas.md` Section 5.

**Cooking Video Ideas, shipped 2026-08-15, commit `b61406dbc`.** First
article to run the full runbook (Stages 1 through 6) in order.

**Programmatic pages lane, checked 2026-08-22: built out, not a source of new
work.** `/youtube-stats/*` is 14/14 categories live plus 4/4 tier-1 countries
(US/UK/Canada/Australia). `/youtube-earnings/*` is 14/14 niches live. The one
further combination anyone might reach for, niche x country earnings pages,
was already built, shipped, and retired 2026-07-09 as a templated Mediavine
thin-content liability, see `MEDIAVINE.md`. A
`/youtube-stats/country/:slug/:category` route exists in `App.jsx` but has no
prerendered pages and no queue entry, treat it as unbuilt scaffolding and
apply the same thin-content scrutiny before ever populating it.

**Combo layer restore (14 niches x 4 tier-1 countries, ~112 pages). DEFERRED
2026-08-13.** Components are 11-line redirect stubs; bodies are recoverable
from git history near commit 56b574f74. The case for restoring was citable
surface for AI assistants. That case is now against it: AI traffic skews
low-tier, so this manufactures more traffic that cannot buy.

Correcting a misleading comparison made during that analysis, so nobody
rebuilds a plan on it: per page the combos were **worse** than the hubs.

| | Pages | Clicks/page (3mo) | Impressions/page | Position |
|---|---|---|---|---|
| Combo (retired 07-09) | 176 | 0.57 | 77 | 8.6 |
| Hub (kept) | 27 | 2.07 | 240 | 12.8 |

Restoring all 126 recovers roughly 1 click/day. The July session drop was never
a combo-cut story.

**Mediavine. ABANDONED 2026-08-13** (user started a separate niche site). The
tier-1 preference survives for a more durable reason: the paywall.

**Commercial keyword track. DEAD 2026-07-28.** vidiq alternative, youtube
channel audit tool, vidiq pricing all returned Keyword Planner's lowest volume
bucket. The real commercial volume is held by four live posts (vidiq-review,
tubebuddy-vs-vidiq, seo-tools-for-youtube, youtube-keyword-research-tools). If
commercial intent needs more coverage, it is a CRO pass on those four, not new
pages.

**Dead seeds, do not re-propose:** tool comparisons, vidiq alternative,
vidiq/tubebuddy pricing, channel audit tool, youtube subscribers, channel
growth, live streaming, merch, playlists, end screens, youtube equipment,
youtube automation.

---

## What NOT to do

- Do not write an article that fails the one test above.
- Do not write an article without a research file.
- Do not publish a figure that fails the data floor. Caveating a thin sample is
  not a substitute for having the data.
- Do not reuse a previous article's structure. Derive it from the matrix.
- Do not do more on-page work on the authority-gated pages expecting rank
  movement. It was done across every high-impression US page in July and did
  not work.
- Do not write articles targeting keyword research, YouTube SEO, competitor
  analysis, analytics, or thumbnail head terms.
- Do not build a page or page dimension named after a low-tier country.
- Do not optimize for total sessions, AI-assistant volume, or Direct.
- Do not ship a programmatic page without page-specific substance. Thin content
  is what got 126 URLs deleted on 2026-07-09.
- Do not confuse an article at a programmatic URL for a programmatic page. If a
  human writes the body for every slug, it is an article and belongs in `/blog`.

---

## Measurement

Monthly. The metric is tier-1 active users per day and referring domains
earned. Not total sessions, not GSC position (15% of traffic), not
AI-assistant volume.

---

## Keyword research on file

`keyword-exports/Keyword Stats 2026-08-13 at 00_05_13.csv` (seed: "youtube
video ideas", 2,232 rows, UTF-16 tab-delimited), plus three 2026-08-14 exports
for the sponsorship, equipment and automation seeds.

- Only 86 keywords clear 500/mo. The niche-modified long tail sits at 50/mo.
- Channel-name intent is the biggest cluster at 48,700/mo across 268 keywords,
  but **91% is generic head terms** (44,500/mo) already targeted by
  `/tools/youtube-channel-name-generator` at position 64.5. Authority-gated.
- Video-ideas niches surviving an intent check: gaming (2,850/mo), comedy
  (1,650), cooking (1,550), tech (1,300), music (950).
- **vlogs (8,250/mo) excluded**: `/blog/youtube-vlog-ideas` shipped 2026-08-08
  and a second page would cannibalize it.
- **diy/crafts (4,200/mo) excluded**: watch intent, not creator intent.

CSV encoding note: Keyword Planner exports are UTF-16, tab-delimited, with two
header lines before the real header. Read with `open(f, encoding='utf-16')`,
skip 2 lines, then `csv.DictReader(delimiter='\t')`.

---

## Honest limits

Authority takes months, not weeks, and the dropped log above established that
the commercial keyword volume in this niche is thin. If revenue is needed
sooner than authority can deliver, that is a paid-acquisition or
business-model question on a separate track. Content will not solve it on
that timeline. Do not let this file imply otherwise.

---

## Rules

- Titles = exact validated keyword phrase, not final headline copy.
- Only confirmed entries (real Keyword Planner volume plus a passed Google SERP check) belong
  in `CONTENT-PLAN.md`. Unconfirmed candidates live in conversation, or in the parked tracks
  section above, until confirmed.
- 3 confirmed spokes is the floor to keep a sub-cluster, 5 is a first-round target, not a cap.
- Every spoke links back to its pillar and its sibling spokes.
