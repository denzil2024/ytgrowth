# YTGrowth — Content Strategy Foundation

Process, rules, and history for the keyword-cluster content plan. Read this once; check
`CONTENT-PLAN.md` for the actual cluster map day to day.

Same method as the SavvyHomie project (`niche_website/FOUNDATION.md` + `CONTENT-PLAN.md`),
adapted for this niche.

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

YouTube Studio features → End screens — dropped 2026-07-28
(`keyword-exports/Keyword Stats 2026-07-26 at 17_23_16.csv`, 227 keywords). Only 21 keywords
clear 500/mo and all 21 are near-duplicate phrasings of one concept (end screen / yt end screen
/ endscreen / end card), one post, not a cluster. The remaining 197 sit at 50/mo, mostly
template-download intent (Premiere Pro / green screen / free download), a format this site
doesn't serve. SERP: Clipchamp, Backlinko, HubSpot own the top 3. Do not re-propose end screens,
cards, or outro templates.

---

## Rules

- Titles = exact validated keyword phrase, not final headline copy.
- Only confirmed entries (real Keyword Planner volume plus a passed Google SERP check) belong
  in `CONTENT-PLAN.md`. Unconfirmed candidates live in conversation, or in the parked tracks
  section above, until confirmed.
- 3 confirmed spokes is the floor to keep a sub-cluster, 5 is a first-round target, not a cap.
- Every spoke links back to its pillar and its sibling spokes.
