# YTGrowth — Content Strategy Foundation

Process, rules, diagnosis and history for the content plan. Read this once; check
`CONTENT-PLAN.md` for the run order day to day.

Same file split as the SavvyHomie project (`niche_website/FOUNDATION.md` +
`CONTENT-PLAN.md`). The method is not the same: SavvyHomie validates keywords
by Keyword Planner volume and organic difficulty; this site, since the
2026-09-03 rebuild, validates diagnostic questions by SERP composition, a
real demand signal, and a product feature (see "Confirmation standard" and
"The SaaS layer" below). The keyword-cluster seed workflow it started with
was retired the same day, after three rounds produced no proven winner.

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

### The second test (diagnostic posts, added 2026-09-03)

The one test governs data studies. It does not govern the posts that
actually won in the first four months (`too-late-to-start`,
`restart-youtube-channel`, `youtube-channel-not-growing`,
`youtube-demonetization`, `youtube-ai-policy`, `youtube-watch-hours`,
`youtube-ctr`, `shorts-vs-long-form`), none of which needed the database.
They pass a different test:

**Is this a question a creator types when something on their channel is
confusing or going wrong, is the top 3 led by Reddit, Quora or a help
thread rather than vidIQ, TubeBuddy or Google, and does the answer send the
reader to a named product feature?**

All three, or it is not written. The site has two content jobs with two
tests and two KPIs (see "The SaaS layer" below). A post that passes neither
test (a listicle, a tool comparison, a head-term guide) is not written,
whatever its volume.

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

## The SaaS layer (added 2026-09-03)

Until this section existed the plan was a traffic plan for a publisher.
The product is a $5-to-$149 SaaS behind a pay-before-signup wall, and none
of the plan's inputs or outputs mentioned it. This section is what makes it
a SaaS content plan. Every entry in `CONTENT-PLAN.md` carries the four
fields below or it does not go in.

### 1. Feature map

Every article names the feature it sells and links to it from its CtaCard.
The feature is chosen by what the reader would do next, not by what we want
to push.

| Reader's situation | Feature | Page |
|---|---|---|
| A number on their channel dropped, stalled, or looks wrong | Channel Audit | `/features/channel-audit` |
| Wants their own metrics explained weekly, with a verdict | Weekly Report | (in-app, sold via Channel Audit page) |
| CTR, thumbnail, or "did my edit hurt the video" | Thumbnail IQ | `/features/thumbnail-iq` |
| Title, description, search visibility, ranking speed | SEO Studio | `/features/seo-studio` |
| Wants to see another channel's numbers | Competitor Analysis, entered through `/tools/youtube-channel-stats-checker` | `/features/competitor-analysis` |
| One video blew up, "what is viral", VPH, outlier scores | Outliers | `/features/outliers` |
| Money questions (views to $X, RPM, payouts) | Earnings calculators, then Channel Audit | `/tools/youtube-money-calculator` and siblings |
| Brand-new channel, zero views | Free tools, then the $5 Starter pack | `/tools` |

An article whose reader has nowhere to go in this table is not written.
"Keyword Research" is deliberately absent as a destination: its head terms
are authority-gated (157 "free youtube keyword research tool" variants,
12,552 impressions, 0 clicks, positions 45-64) and the feature is reached
through SEO Studio articles instead.

### 2. Funnel stage, and the CTA that fits it

| Stage | Who | CTA | Wrong CTA |
|---|---|---|---|
| Problem-aware, existing channel (Blocks 2-3 in the plan) | Monetized or near-monetized, already reads Studio | Channel Audit / Thumbnail IQ / SEO Studio, $5 Starter pack as the first purchase | "Start free" (there is no free tier), a subscription pitch in the intro |
| Monetized (Block 4) | Already pays for tools | Calculator, then Channel Audit | Beginner framing |
| Awareness / benchmark (Block 5) | Any size, wants a number | Weekly Report ("your number every Monday") | Hard sell; these earn citations, not checkouts |
| Pre-monetization (Block 6) | Zero-view channels | Free tools, Starter pack | Growth/Agency plan pitch |
| Data study (any block) | Journalists, tool blogs, AI assistants | Link to the diagnostic posts that use the finding; the study itself sells nothing | A CtaCard mid-study |

### 3. Two content jobs, two KPIs

| Job | What it earns | KPI | Never judged by |
|---|---|---|---|
| Diagnostic posts (Blocks 1-6) | Tier-1 visitors with a problem the product solves | Tier-1 users/day and tier-1 sessions that reach a `/features/*` page, `/tools/*` page, or checkout | Referring domains |
| Data studies | Links and citations, which lift every other page | Referring domains and AI-assistant referrals per study | Tier-1 visitors |

Mixing the two is how the previous plan judged a data study by clicks and a
listicle by nothing. The monthly measurement below reports both columns
separately.

### 4. Distribution is part of shipping a data study

The diagnosis (item 4) says the site is gated on links, not content. A data
study that is published and not sent anywhere earns nothing. Each study's
research file carries an outreach list built before the study is written:
the sites that ranked in its SERP and cited a weaker number, the newsletters
and tool blogs that covered the previous study, and the Reddit threads where
the question was asked. The study is "done" when the list has been sent,
same session as the publish. The user sends; the research file holds the
list and the one-paragraph pitch.

### 5. Free tools are content

`/tools/youtube-channel-stats-checker` earned 15 clicks in the 08-25
export, more than 70 of the 73 articles. Tools survive zero-click SERPs and
AI answers because an assistant cannot run them. Two rules:

- When a confirmed query's SERP is tool-shaped (checker, generator,
  calculator), the answer is a tool page with the article underneath it,
  not an article. Quota math first: a tool that needs search.list per use
  (100 units, uncacheable across users) is not built. The shadowban checker
  failed on exactly this.
- Diagnostic articles link to the matching free tool before the paid
  feature where one exists (stats checker before Competitor Analysis,
  thumbnail tester before Thumbnail IQ, calculators before Channel Audit).

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
The July 2026 work found this on 2026-07-10, did full on-page passes across every
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

### 8. What won, and where it came from (verified 2026-09-02 against the 08-25 export and git)

Pages with real clicks at position under ~15 share one shape: a specific,
answerable question a creator types when something is confusing or going
wrong. `too-late-to-start` (pos 7.4), `restart-youtube-channel` (8.1),
`youtube-demonetization` (10.4), `youtube-watch-hours` (10.2),
`youtube-ctr` (10.7), `shorts-vs-long-form` (9.7), `shorts-tagging` (10.1),
`youtube-channel-audit` (12.8), `youtube-channel-not-growing` (14.5). The
losers are the other shape: broad advice, tool comparisons, listicles
(63 hand-written articles averaged 2.2 clicks per page; 1 of 73,
`youtube-trends`, carried 22% of all clicks).

Where the winners came from is on record, not guessed: Reddit-style
question mining plus PAA clustering (the July 2026 conversational-query
queue, run 07-13 to 07-16 with no Keyword Planner volume and no Search
Console export), GSC-verified content gaps (demonetization), and deep
real-SERP research on a factual topic (watch-hours, ctr). The later
Keyword Planner cluster process (video-ideas, Aug) has no proven winner in
the data yet. The confirmation standard below is built from the method that
worked, and the Keyword Planner seed workflow is retired.

**The July queue's hit rate is the evidence for that standard.** Five topics
were proposed, one was dropped for cannibalizing live posts, and all four
that shipped (`youtube-ai-policy`, `shorts-vs-long-form`, `too-late-to-start`,
`restart-youtube-channel`) are in the winner set above. Each was written from
a deep SERP read, 8 competitor pages fetched for `restart-youtube-channel`
alone, and each corrected a specific false claim the ranking pages carried.
Four for four is why the 2026-09-03 research round scaled the same method to
94 queries rather than replacing it.

The plan itself was also part of the problem: it never held more than about
six items ahead, three files tracked the same studies under different
numbers, and one confirmed zero-quota study (posting time vs. performance)
was marked "superseded" by mistake. Rebuilt 2026-09-03 with 51 confirmed
entries, one number sequence, and the SaaS layer above.

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

## Confirmation standard (replaced 2026-09-03)

An entry goes into `CONTENT-PLAN.md` when it passes all four. Record the
evidence on the entry.

1. **SERP top-3 check.** Pull the live top 10 (Serper, `gl: us`). At most
   one big-authority domain in the top 3 (youtube.com, support.google,
   vidIQ, TubeBuddy, Backlinko, HubSpot, Hootsuite, Semrush, Ahrefs,
   Wikipedia, Shopify, Canva and the like), and at least one Reddit, Quora,
   help-forum or small-site result. Two big domains in the top 3 is a fail.
   Tool-shaped SERPs (checker, generator, calculator) fail an article and
   go to the free-tools rule in "The SaaS layer".
2. **A real demand signal.** One of: a Reddit thread on page 1 for the
   query; the query or a variant in Google's People Also Ask; the query in
   our Search Console export with impressions and no dedicated page. A
   query with none of the three is a guess.
3. **The shape.** A creator's question about their own channel (something
   dropped, stalled, is missing, or needs a benchmark), or a data-study
   question our tables can answer. Head terms, listicles, "best tools", and
   viewer-intent queries fail here whatever the SERP looks like.
4. **A product feature.** The reader has a next step in the feature map
   table. No feature, no entry.

Keyword Planner is a sanity pass, not a gate: once per research round the
user pastes the confirmed phrases into Keyword Planner and drops one export
into `keyword-exports/` ("uploaded"). Lowest-bucket entries with no Search
Console evidence move to the bottom of their block. Nothing is removed on
volume alone, because the July winners never had a volume figure.

AI-answer-engine fit stays a bonus, never a confirmation.

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

## Research round (replaced 2026-09-03; the Keyword Planner seed workflow is retired)

A research round refills `CONTENT-PLAN.md`. It runs when the plan holds
fewer than 40 unshipped entries, never article by article. The site ships
1 to 2 articles per day, so 40 entries is only 3 to 6 weeks of runway and a
round takes a full session; do not let it run closer than that. The 2026-09-03
round is the reference: 94 queries, 51 confirmed, in one session.

1. **Seed from three sources, in this order.** (a) The latest Search
   Console query export: every query at position 5-40 with impressions and
   no page whose title answers it. (b) Reddit mining via Serper: queries of
   the form "reddit youtube <symptom>" for each feature in the feature map
   (views dropped, impressions, CTR, search, shorts, monetization review),
   collecting thread titles, which are the creators' own phrasing.
   (c) PAA follow-through: every People Also Ask question returned in (a)
   and (b) becomes a candidate, and the related-searches list shows which
   variants to fold in.
2. **One Serper pull per candidate** (`scripts/serper-batch.mjs`:
   top 10 + PAA + related searches, saved raw). Grade each against the
   confirmation standard. Fold near-duplicates into one entry with `(+ x)`.
3. **Cannibalization check against live titles**, not slugs. Grep
   `posts.jsx` titles and H2s for the intent. A query the live post's
   subtitle already answers is dropped (this round: "how to increase rpm",
   "how does youtube decide who to show your video to").
4. **Assign feature, block and KPI** from the SaaS layer. Order the plan:
   Search Console gaps first, then the paying segment's diagnostics, then
   monetization, then benchmarks, then zero-view beginners last. Interleave
   one data study per six diagnostic posts.
5. **Log every failure in the dropped log** with the top-3 domains, so it is
   not re-proposed.
6. **Hand the user the Keyword Planner sanity pass** (one export).
7. Report once: confirmed count per block, dropped count with reasons,
   weeks of runway at 1 to 2 articles per day.

Pillar/spoke clusters are not the unit any more; the block is. The three
pillar clusters that exist (video ideas, starting a channel, monetization
beyond ads) keep their linking rules, and the monetization pillar keeps
taking spokes from Block 4.

---

## Existing coverage (73 posts live as of 2026-09-02, see `frontend/src/blog/posts.jsx`)

Check before proposing anything, to avoid cannibalizing a post that's already live.
The list below is the 2026-07 snapshot; for the current set grep `slug:` in
`posts.jsx` and check live titles, not slugs (see the research round, step 3).
Added since this list: video-length-by-niche, youtube-title-length,
youtube-view-growth-curve, youtube-engagement-rate, youtube-data-studies,
youtube-monetization-beyond-ads, youtube-channel-memberships,
youtube-super-thanks, the five video-ideas spokes, start-youtube-channel and
its three spokes, youtube-challenge-ideas, youtube-shorts-ideas.

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

**This is the only content process.** A separate 43-check SEO checklist
existed from 2026-07-13, was never used once, and was folded into this
runbook on 2026-08-14 (the file itself was deleted 2026-09-03). A process
split across two files got skipped for a month.

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

Do not read `DATA-STUDIES.md`, `HANDOVER.md` or the memory
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
- Answer the applicable test in writing: the one test for a data study, the
  second test for a diagnostic post. A rejected research file is a success.
- Copy the entry's feature, funnel stage and CTA from `CONTENT-PLAN.md` into
  the research file, and name the free tool that links before the feature,
  if one exists.
- Pull the PAA for the query plus 2-4 variants (Serper) and log which FAQ
  questions are PAA-sourced vs. editorial.
- Run the data pull. Check every figure against the data floor above. Figures
  that fail the floor get dropped, not caveated.
- For a data study: build the outreach list (SaaS layer, item 4) now, before
  writing, so the study is written toward the people who will link it.

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
  from the page's own verified content (its `prerender.js` meta entry or the
  component itself), never from a hub or marketing blurb. The 2026-07-13 pass
  copied `ToolsHub.jsx` card text and shipped two factual errors: a tool
  credited with an earnings estimate it does not have, and another given a
  different tool's feature. If a description makes a checkable claim, grep the
  component for it.
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
- [ ] Confirm the next unstruck entry in `CONTENT-PLAN.md` is still the right
      next one (a gated data study whose floor check has not run gets skipped,
      not started).
- [ ] For a data study: confirm the outreach list in its research file has
      been handed over, same session.

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
was already built, shipped, and retired 2026-07-09 as a templated
thin-content liability. A
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
- Do not write an article that names no product feature, or a listicle, a
  tool comparison, or an "ideas" post: the 08-25 export shows that shape
  averaging 2.2 clicks per page over four months.
- Do not redo on-page optimization on the authority-gated pages. If a page
  ever does warrant a look, the selection rule is: pull Search Console over
  28 to 90 days, sort by impressions, and take pages with real impressions at
  a weak position or a low CTR for their position, preferring beatable SERPs
  over head terms. That pass was already run across every high-impression US
  page in July and moved nothing, so the bar for repeating it is new evidence,
  not a hunch.
- Do not refill the plan one article at a time. A research round refills it
  to 30+ entries or it has not run.
- Do not build a page or page dimension named after a low-tier country.
- Do not optimize for total sessions, AI-assistant volume, or Direct.
- Do not ship a programmatic page without page-specific substance. Thin content
  is what got 126 URLs deleted on 2026-07-09.
- Do not confuse an article at a programmatic URL for a programmatic page. If a
  human writes the body for every slug, it is an article and belongs in `/blog`.

---

## Measurement

Monthly, from a fresh Search Console export (Queries + Pages) and GA4
filtered to US/UK/CA/AU. Two columns, never merged:

| Column | Metric | Source |
|---|---|---|
| Diagnostic posts | Tier-1 active users/day, and tier-1 sessions that reach a `/features/*` page, a `/tools/*` page, or checkout, per landing post | GA4 landing-page report, tier-1 filter |
| Data studies | Referring domains earned per study, AI-assistant referrals per study | Search Console links report, GA4 referrer domains |

Also tracked per month: the Search Console gap list (queries at position
5-40 with no dedicated page), which seeds the next research round. Not
tracked as goals: total sessions, average position, AI-assistant volume,
Direct.

First judgment on the 2026-09-03 plan: the export dated 2026-10-05 or
later, after Block 1 has had a month of runway.

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

- Titles = exact validated query phrase, not final headline copy.
- Only entries that passed the four-part confirmation standard belong in
  `CONTENT-PLAN.md`, with the evidence written on the entry. Unconfirmed
  candidates live in conversation, or in the parked tracks section above.
- Every entry names a product feature, a funnel stage and a KPI column.
- The plan holds 30+ unshipped entries at all times; below that, run a
  research round before writing the next article.
- Every spoke in the three legacy pillar clusters (video ideas, starting a
  channel, monetization beyond ads) links back to its pillar and its sibling
  spokes. Blocks are not clusters and have no pillar: a block article links
  to a block sibling only when the same reader plausibly has both questions,
  to any live post named in its scope note, and to the study that supplies
  its numbers. See `CONTENT-PLAN.md` → "What a block is, and how its
  articles link". Do not force a link just because two entries share a block.
