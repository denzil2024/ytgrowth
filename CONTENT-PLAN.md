# YTGrowth — Content Plan

Site: ytgrowth.io · Niche: YouTube SEO/growth SaaS tools

**Read this before starting any content or page work.** The order below is locked.
Jumping between one-off articles and keyword patches is what produced the current
state. Do not skip ahead.

Last updated: 2026-08-13

---

## The one number that matters

**Tier-1 (US/UK/CA/AU) active users: 196 over 28 days. Seven per day.**

The product is $19 to $149/month behind a pay-before-signup wall. Traffic that cannot
buy is close to worthless. Every decision in this file is judged against that seven,
not against total sessions.

Total sessions look like 1,534. That number is misleading and should not be used.

---

## The diagnosis (verified 2026-08-13 from `keyword-exports/`)

**1. Most traffic is not real or not useful.**

| Channel | Sessions (28d) | Reality |
|---|---|---|
| Direct | 701 | 93% first-time visitors. Largely bots (see below). |
| AI Assistant | 579 | Real, but skews low-tier. |
| Organic Search | 232 | Only 15% of sessions. |

Geography: **48.2% low-tier, 16.4% tier-1, 7% Western Europe.** Top low-tier sources
are India (249), Vietnam (86), China (72), Pakistan (48), Bangladesh (39).

**2. A large share of Direct is bot traffic.** The engagement signature proves it:

| | Users/day | Avg engagement |
|---|---|---|
| Spike days (Jul 26-31) | 92, 117, 120 | 8.8s |
| Quiet days | 29-40 | 33.0s |

Real traffic spikes do not collapse engagement 4x. Site-wide: 1.22 pages/session,
15% scroll rate, 87% first-visit. The July 26-31 "spike" was bots, and benchmarking
against it made a normal month look like a collapse.

**3. Every commercial article cluster is authority-gated and earns nothing.**

| Cluster | Queries | Impressions | Clicks | Position |
|---|---|---|---|---|
| Keyword research | 149 | 11,848 | 0 | 51.6 |
| Competitor | 27 | 730 | 0 | 67.5 |
| Thumbnail | 11 | 326 | 0 | 65.4 |
| YouTube SEO | 42 | 2,835 | 1 | 56.2 |
| Analytics | 57 | 1,549 | 2 | 52.6 |
| Brand (ytgrowth) | 4 | 188 | 42 | 2.5 |

42 of 429 total clicks come from people already searching the brand name. Page-1
competitors are vidIQ, TubeBuddy, Ahrefs, Semrush, Wix.

**4. The tier-1 opportunity already exists and is gated on links, not content.**
The US alone is 53,249 impressions (40% of all site impressions) at position 28.78,
converting 58 clicks. The demand is there; the ranking is not. MEDIAVINE.md found
this on 2026-07-10, did full on-page passes across every high-impression US page on
07-11 and 07-13, and positions did not move. Its own conclusion, still correct:
**the gate is authority (backlinks), not on-page work.** Do not redo on-page work
on these pages expecting a different result.

**5. Publishing stopped for a structural reason.** Commits touching posts.jsx: 63 in
May, 27 in June, 14 in July, 4 in August. Both mapped clusters completed 2026-08-08
and nothing was queued behind them. An empty plan file produces an empty schedule.

---

## The plan, in order

### Step 1 — Bot hygiene [START HERE]

Filter bots out of GA4 so decisions stop being made on fake numbers. Everything
downstream depends on measuring honestly, and the July spike already caused one bad
read of the situation.

Success: reported sessions drop, average engagement time rises, tier-1 share rises.
A lower session count here is the correct outcome, not a regression.

### Step 2 — Authority, not volume

Original-data research articles built on proprietary cache and channel-registry data
that nobody else can publish. This is the only lever that moves the 53K tier-1
impressions off page 3, and it is already item 4 of the moat roadmap and
`project_linkable_data_studies` in memory. Never started.

The target is links and citations, not pageviews. Judge each study on referring
domains earned, not on its own traffic.

### Step 3 — Publishing resumes, tier-1 intent only

Not before steps 1 and 2 are underway. Use the `FOUNDATION.md` workflow exactly:
pillar candidates first, real Keyword Planner volume, SERP check per keyword,
3-confirmed floor per sub-cluster.

- Write: tool comparisons, sponsorship rates, gear, business and agency workflows.
- Do not write: "how much does YouTube pay in [country]", free-subscribers,
  grow-fast content. These are what pull the low-tier audience.

---

## NEXT SESSION: KEYWORD RESEARCH ROUND (2026-08-14)

**Tomorrow is entirely keyword research. Do not start anything else first.**

The queue below is empty after the gaming post, and an empty queue is what took
publishing from 63 commits in May to 4 in August. Refilling it is the whole job.

How it runs:
1. User pulls the three seeds in "Keyword seeds to pull" below and drops the
   full CSV exports into `keyword-exports/`. Seed 1 (`youtube sponsorship`)
   first, it has the clearest sub-topic structure.
2. Follow the `FOUNDATION.md` workflow exactly. Pillar confirmed first, then
   mine spokes from inside that same export. Every candidate gets a live Google
   SERP check. 3 confirmed is the floor for a sub-cluster to survive.
3. Report per the FOUNDATION.md format: confirmed (volume, who ranks, which
   signal passed), dropped (why), running counts.
4. Write the survivors into the pipeline table below as named articles.

Do NOT write any article during this round. Research and the plan only. The
process rule below (present outline for approval before writing) has been
broken twice already, both times by starting to write too early.

Note on CSV encoding: Keyword Planner exports are UTF-16, tab-delimited, with
two header lines before the real header. Read with
`open(f, encoding='utf-16')`, skip 2 lines, then `csv.DictReader(delimiter='\t')`.

---

## THE ARTICLE PIPELINE (check here first, every session)

This is the single list. Everything below is an article in `/blog`, shipped through
the standard publishing workflow. "Data study" is not a separate content type, it is
an article whose differentiator is original data.

### Shipped

| Date | Article | Type |
|---|---|---|
| 2026-08-13 | YouTube Gaming Video Ideas (`/blog/gaming-video-ideas`), 18 numbered concrete ideas + gaming upload data | Cluster spoke |
| 2026-08-13 | Upgraded `/blog/best-time-to-post` with cadence + day-of-week data (studies #3+#4) | Upgrade |
| 2026-08-13 | The Ideal YouTube Video Length in 2026 (`/blog/video-length-by-niche`), corrected same day (date-filter bug) | Data study #1 |
| 2026-08-08 | YouTube Vlog Ideas | Cluster spoke |
| 2026-07-28 | Shorts Ideas, Challenge Ideas, Start a Channel, Phone Channel, Brand Account, Gaming Channel | Cluster, 6 posts |

### Queued, ready to run

| Order | Work | Type | Quota | Blocked on |
|---|---|---|---|---|
| 1 | **Keyword research round** | Research, no writing | 0 | User pulls the 3 seeds. THIS IS TOMORROW'S JOB. |
| 2 | Title-pattern study, folded INTO `/blog/youtube-title` | Upgrade, not a new post | 0 | Nothing. Decided 2026-08-13: a separate post would split authority with the existing page, same as the best-time-to-post call. Uses `channel_videos.title`, already collected. |
| 3 | Promotion pass on both studies | Outreach | 0 | User is sourcing leads independently and will bring them. Do not pursue unprompted. See `OUTREACH.md`. |

**Why item 1 is an upgrade, not a new article.** `/blog/best-time-to-post` already
exists and is a high-impression page. A separate "when creators really upload" post
would compete with it for the same query. The data goes INTO that post.

**Cannibalization warning on item 2.** `/blog/youtube-title` already owns the
how-to intent for titles. A title data study has to target research intent
(a study, a measurement) and not that how-to intent, or it splits the same
authority two ways. Decide before writing. This is the exact trap that produced
the three-way keyword-research split now sitting at position 51.

### After that, the queue is EMPTY

No further articles are planned. This is the real problem, and it is the same one
that took publishing from 63 commits in May to 4 in August: both mapped clusters
finished on 2026-08-08 with nothing queued behind them.

Filling it needs a keyword research round (`FOUNDATION.md` workflow), which needs
Keyword Planner exports from the user, so it cannot be done unattended.

### Keyword seeds to pull (user action, 2026-08-13)

Pull each of these in Google Keyword Planner ("Discover new keywords"), export
the FULL results as CSV (not just top rows, the niche long tail is what gets
mined), and drop into `keyword-exports/`. One seed at a time is fine.

**Seed 1: `youtube sponsorship`**
Why: `/blog/youtube-sponsorships` exists but covers the topic in one post. The
sub-topics look genuinely distinct (rates/how much to charge, media kits,
pitching and outreach, contracts and deliverables, FTC disclosure), which is
what the FOUNDATION.md structure test requires. Strong tier-1 fit: brand money
concentrates in US/UK markets.

**Seed 2: `youtube equipment`**
Why: only `best-youtube-mic` is live. Camera, lighting, audio treatment,
backgrounds, and capture are all uncovered and each is a real buying decision
with its own search demand. Gear buyers skew tier-1 by definition, since the
searcher has money to spend. Watch for affiliate-listicle SERPs on the head
term; the sub-topics matter more than the pillar here.

**Seed 3 (lower confidence): `youtube automation` or `youtube channel management`**
Why: the agency and multi-channel angle has zero coverage and maps to the
Agency plan. Flagged lower confidence because "automation" may return
cash-cow/faceless intent already covered by two live posts, and
"channel management" may be too thin. Pull it third, drop it fast if the
export is shallow.

**Explicitly NOT seeds** (already tested and dead, see FOUNDATION.md):
tool comparisons, vidiq alternative, vidiq/tubebuddy pricing, channel audit
tool, youtube subscribers, channel growth, live streaming, merch, playlists,
end screens. Do not re-propose these.

Each surviving keyword still needs a passed Google SERP check before it enters
the queue above.

### Parked

An 18-idea gaming video-ideas draft sits untracked at
`frontend/src/data/youtubeVideoIdeas.js`. Built as a programmatic page by mistake
when it is an article. Converts to a blog spoke under the existing
`/blog/youtube-video-ideas` pillar (position 8.95) whenever the queue needs filling.

### Process rule, violated 2026-08-13, do not repeat

Before writing ANY article: research the live top 10 for the target query, build a
coverage matrix, and PRESENT THE OUTLINE FOR APPROVAL. Study #1 was written and
shipped without this step, so the user first saw the article only after it existed.
See `feedback_article_research_process`.

### Step 4 — Measure on tier-1, monthly

The metric is tier-1 active users per day and referring domains earned. Not total
sessions, not GSC position (15% of traffic), not AI-assistant volume.

---

## Deferred and rejected

**Combo layer restore (14 niches x 4 tier-1 countries, ~112 pages). DEFERRED
2026-08-13.** Components are 11-line redirect stubs; bodies are recoverable from git
history near commit 56b574f74. The case for restoring was citable surface for AI
assistants. That case is now against it: AI traffic skews low-tier, so this
manufactures more of the traffic that cannot buy. Revisit only if tier-1 share rises
enough that added AI reach is worth it.

Correcting a misleading comparison made during this analysis, so nobody rebuilds a
plan on it: per page the combos were **worse** than the hubs, not better.

| | Pages | Clicks/page (3mo) | Impressions/page | Position |
|---|---|---|---|---|
| Combo (retired 07-09) | 176 | 0.57 | 77 | 8.6 |
| Hub (kept) | 27 | 2.07 | 240 | 12.8 |

Combos ranked higher on much smaller queries. Restoring all 126 recovers roughly
1 click/day. The July session drop was never a combo-cut story.

**Mediavine. ABANDONED 2026-08-13** (user started a separate niche site). The tier-1
preference survives its cancellation for a different and more durable reason: the
paywall. See "The one number that matters".

**Commercial keyword track. DEAD 2026-07-28.** vidiq alternative, youtube channel
audit tool, vidiq pricing all returned Keyword Planner's lowest volume bucket. The
real commercial volume is already held by four live posts (vidiq-review,
tubebuddy-vs-vidiq, seo-tools-for-youtube, youtube-keyword-research-tools). If
commercial intent needs more coverage, it is a CRO pass on those four, not new pages.

---

## What NOT to do

- Do not do more on-page work on the authority-gated pages expecting rank movement.
  It was done in July across every high-impression US page and did not work.
- Do not write articles targeting keyword research, YouTube SEO, competitor analysis,
  analytics, or thumbnail head terms.
- Do not build a page or page dimension named after a low-tier country.
- Do not optimize for total sessions, AI-assistant volume, or Direct. Direct is not an
  acquisition channel and nothing should be built to grow it.
- Do not ship a programmatic page without page-specific substance. Thin content is
  what got 126 URLs deleted on 2026-07-09.
- Do not confuse an article at a programmatic URL for a programmatic page. A
  programmatic page has a data spine that generates it. If a human writes the body for
  every slug, it is an article and belongs in `/blog`.
- Do not start a new initiative while steps above it are unstarted.

---

## Honest limits

Authority takes months, not weeks, and `FOUNDATION.md` already established the
commercial keyword volume in this niche is thin. If revenue is needed sooner than
authority can deliver, that is a paid-acquisition or business-model question and
belongs on a separate track. Content will not solve it on that timeline. Do not let
this file imply otherwise.

---

## Keyword research on file

`keyword-exports/Keyword Stats 2026-08-13 at 00_05_13.csv` (seed: "youtube video
ideas", 2,232 rows, UTF-16 tab-delimited).

- Only 86 keywords clear 500/mo. The niche-modified long tail sits at 50/mo each.
- Channel-name intent is the biggest cluster at 48,700/mo across 268 keywords, but
  **91% is generic head terms** (44,500/mo) already targeted by
  `/tools/youtube-channel-name-generator` at position 64.5. SERP is vidIQ,
  Renderforest, Wix, Squarespace. Authority-gated. Niche-modified slice is 4,200/mo.
- Video-ideas niches surviving an intent check: gaming (2,850/mo), comedy (1,650),
  cooking (1,550), tech (1,300), music (950).
- **vlogs (8,250/mo) excluded**: `/blog/youtube-vlog-ideas` shipped 2026-08-08 and a
  second page would cannibalize it.
- **diy/crafts (4,200/mo) excluded**: watch intent, not creator intent. Its 500/mo
  terms are "youtube diy crafts", "diy five minute crafts", "you tube arts and
  crafts". Same failure mode logged in FOUNDATION.md for playlist, merch, live stream.

---

## Completed clusters (do not re-propose)

**Video Ideas** (mapped 2026-07-28): pillar `youtube-video-ideas` (pre-existing),
`youtube-shorts-ideas` and `youtube-challenge-ideas` (07-28), `youtube-vlog-ideas`
(08-08). "Video Ideas For Beginners" merged into the pillar, same intent.

**Starting a Channel** (mapped 2026-07-28): pillar `start-youtube-channel`, plus
`youtube-channel-phone`, `youtube-brand-account`, `gaming-youtube-channel`.

---

## Rules

- Titles = exact validated keyword phrase, not final headline copy.
- Only confirmed entries belong here: real Keyword Planner volume plus a passed
  Google SERP check.
- 3 confirmed is the floor for a sub-cluster; 5 is a first-round target.
- Every spoke links back to its pillar and sibling spokes.
- Every new public route ships with its prerender route, sitemap entry, and llms.txt
  entry in the same commit. This has been missed three times.
