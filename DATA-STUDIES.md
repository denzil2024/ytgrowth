# Data Studies — Working Doc

**Looking for what's next / ship order? That's `CONTENT-PLAN.md`, not this
file.** This doc is methodology, quota math, and moat-logger status for each
study, read it for the "how," not the "what's next."

Living doc. The plan for original-data research articles ("we analyzed X") built
from our own API pulls and moat data. These are the backlink + AI-citation
assets that unlock authority-gated head terms (see project_linkable_data_studies
and MEDIAVINE.md's ranking-reality section). Read this before starting any study,
and add new ideas to the backlog section as they come up.

Last updated: 2026-09-03 (studies #14-16 added from the content-plan
rebuild; #3-#9 marked published; run-order numbers now live only in
`CONTENT-PLAN.md`, this file keeps its own study numbers and each entry
says which plan item it feeds)

## Context

- Quota: **260,000 units/day** (granted 2026-07-17). Batch endpoints make big
  studies cheap: videos.list / channels.list / playlistItems.list cost 1 unit
  per call (up to 50 items each), so analyzing 100K videos costs roughly
  2,000-10,000 units. search.list stays expensive (100 units/call), use the
  existing caches for keyword-level data wherever possible.
- SEARCH CAVEAT (2026-07-17): a separate "Search Queries per day" sub-limit of
  **100 search.list requests/day** was NOT raised with the bump. Studies built
  on batch endpoints are unaffected; anything search.list-heavy (keyword
  seeding, SERP sampling) budgets against 100/day until the user's quota-edit
  request for that sub-limit is approved.
- Every study must state its quota math before it runs, and every fetch script
  must respect `YT_QUOTA_PAUSED=1`.
- Publishing follows the standard workflow (source + prerender + sitemap +
  llms.txt + build + push) plus outreach: these articles exist to earn links,
  so each one ships with a promotion step, not just a publish step.

## Studies we can run NOW (fresh API pulls + existing caches)

| # | Study | Stats needed | Source | Est. quota |
|---|---|---|---|---|
| 1 | ~~The ideal YouTube video length in 2026, by niche~~ **PUBLISHED 2026-08-13** as `/blog/video-length-by-niche` | Durations of tracked uploads per niche | Existing `channel_videos` + `channel_metric_snapshots` (no fresh pull needed) | **0 units** |
| 2 | ~~What winning YouTube titles have in common~~ **PUBLISHED 2026-08-21** as `/blog/youtube-title-length` | Titles, lengths, patterns (numbers, brackets, year tags, questions) vs. performance | `channel_videos` + `video_metric_snapshots` (no fresh pull needed) | **0 units** |
| 3 | ~~When top creators really upload: best time to post, measured~~ **PUBLISHED 2026-08-26** into `/blog/best-time-to-post` | publishedAt timestamps per niche and channel size | Existing `channel_videos.published_at` | **0 units** |
| 4 | ~~How often successful channels upload vs stalled ones~~ **PUBLISHED 2026-08-28** into `/blog/best-time-to-post` | Upload cadence + channel size/views | Same table as #3 | **0 units** |
| 5 | ~~Shorts vs long-form mix by niche~~ shipped inside #1's article | Upload duration classification per channel | Same pull as #1 | shared |
| 6 | ~~How fast views actually come in: the first 30 days~~ **PUBLISHED 2026-08-28** as `/blog/youtube-view-growth-curve` | Weekly view counts per video from upload | `video_metric_snapshots` | **0 units** |
| 7 | ~~Do Shorts grow faster than long-form~~ combined into #6's article | Weekly views by `is_short` flag, first 30 days | `channel_videos.is_short` + `video_metric_snapshots` | **0 units** |
| 8 | ~~Engagement rate by niche~~ **PUBLISHED 2026-08-29** as `/blog/youtube-engagement-rate` | likes, comments, views per video, grouped by category | `video_metric_snapshots` + `channel_metric_snapshots.category` | **0 units** |

Priority order: ~~#1 first~~ (DONE 2026-08-13), ~~#2~~ (DONE 2026-08-21,
turned out to be zero-quota like #1 since `channel_videos.title` and
`video_metric_snapshots` already covered it, no `youtube_search_cache`
top-up needed), then #3/#4 next (they upgrade best-time-to-post, our
highest-impression page). #5 fell out of #1's dataset and shipped inside
that article as its Shorts-adoption-by-niche section rather than as a
separate piece. #6/#7/#8 added 2026-08-22: distinct from #1/#2/#5 because
they use `video_metric_snapshots`' weekly time series (a real growth curve
per video) rather than a single upload-time snapshot, an angle that was
never mined despite the data existing since 2026-07-19. Sequence them after
#3/#4, #7 shares its data pull with #6 so do those two together.

**Study #2 notes:** scoped originally as a length-only stat destined to
fold into `/blog/youtube-title`; promoted to its own article after
feedback that it needed real depth ("a real study with loads of insights
that people can link to without me even reaching out," then "I hope I'm
now going to read a Backlinko or Ahrefs level article"). Ended up measuring
9 angles (length in chars and words, plus 8 binary title patterns) with a
Spearman correlation as the headline stat (not bucket averages), decile
curves instead of coarse buckets, and cross-tabs checking whether the
length effect changes conditional on other patterns. Finding: title length
explains approximately none of the variance in performance (r = 0.0046
pooled, negligible in all 15 niches). See `research/youtube-title-length.md`
for the full competitor audit and methodology writeup.

**Study #1 notes for whoever runs #3/#4** (the same dataset powers them):
- The loggers already hold everything needed. #1 cost **zero** fresh quota, not
  the 5-10K estimated, because `channel_videos` stores `published_at` and
  `duration_seconds` at discovery time. #3 (best time to post) and #4 (upload
  cadence) read the same `published_at` column, so they should also cost zero.
- The finding worth reusing: **average duration is wildly skewed by livestream
  VODs and lecture recordings**. Education's mean is 3.83x its median, news
  3.75x, gaming 3.00x, while travel and tech are ~1.03x. Always report medians, and check the mean/median ratio before
  publishing any duration or cadence figure.
- Category comes from `channel_metric_snapshots.category` (only populated for
  TopChannelCache channels). About 3,098 videos landed `uncategorized` and were
  excluded from the per-niche tables. 14 niches cleared a usable sample; the
  thinnest were music (633) and education (670) long-form videos on the
  2025+ cutoff.
- Publish honest N and date range in the article. #1 uses 30,360 long-form
  videos published since 2026-01-01.

**CRITICAL METHODOLOGY RULE (learned the hard way 2026-08-13, after publishing):**
`channel_videos.published_at` is NOT bounded by the collection window. Discovery
pulls each channel's 50 newest uploads, so a slow channel drags history back
years. The full table spans **2006-04-26 to 2026-08-09**. Distribution is
78.6% in 2026, 12.2% in 2025, and ~5.9% before 2024.

Study #1 shipped saying the data was "collected between 2026-07-19 and
2026-08-13", which described `discovered_at`, not `published_at`, and implied
the videos were recent. It was corrected the same day to a 2025-01-01 cutoff.
Most medians moved under a minute, but education moved 11.6 -> 8.6 and became
the WORST skew at 3.83x (it had been reported as 2.67x), and comedy crossed the
8-minute line. **Always add `AND published_at >= '2025-01-01'` (or tighter) to
every query behind a published figure.** This matters most for #3/#4, since
day-of-week and hour-of-day upload norms have shifted enormously since 2006.

## More studies we can run NOW, found 2026-08-22 mining the schema properly

Two more angles inside the same zero-quota tables, on top of #3/#4/#6/#7/#8 above:

| # | Study | Stats needed | Source | Est. quota |
|---|---|---|---|---|
| 9 | ~~Shorts ratio over time, by niche~~ **PUBLISHED 2026-08-28** into `/blog/shorts-vs-long-form` | `is_short` ratio grouped by month of `published_at`, Jan 2025 to now | `channel_videos` (no fresh pull) | **0 units** |
| 10 | **"What Posting Time Does to YouTube Performance, Measured Across [N] Videos."** Confirmed 2026-08-22. Feeds `CONTENT-PLAN.md` #26. Was wrongly marked "superseded by best-time-to-post" in the old plan; it is not, that article measures WHEN top creators post, this one asks whether posting time correlates with views at all. | `published_at` hour/weekday vs. views normalized to channel median, same Spearman method as study #2 | `channel_videos` + `video_metric_snapshots` | **0 units** |

## Studies confirmed in the 2026-09-03 research round (feed the diagnostic blocks)

Each one answers a Reddit-led question the plan already carries, so the
study is written toward the diagnostic posts that will cite it. Zero quota,
same tables, same data floor (30 channels, 500 videos, `published_at >=
'2025-01-01'`, median alongside mean).

| # | Study | Stats needed | Source | Gate |
|---|---|---|---|---|
| 14 | **How many views counts as viral on YouTube, measured as a multiple of the channel's own median.** Feeds plan #12 (and the "is 2,000 views in a day good" section). Goal: replace the internet's guessed thresholds ("10k is viral", "30k is viral") with the share of videos that reach 2x / 5x / 10x / 50x their channel's median, by niche and subscriber tier, plus what first-week views look like by tier. This is the Outliers feature's own definition, published. | Per video: latest `video_metric_snapshots.views` (or 30-day view), channel median across that channel's tracked videos, `channel_metric_snapshots` subscriber tier and category | `video_metric_snapshots` + `channel_videos` + `channel_metric_snapshots` | None. Run the count; clears the floor if #6 did (18,423 videos) |
| 15 | **Average views per video by subscriber count.** Feeds plan #19. Goal: the median 30-day views per upload for channels at 1K, 10K, 100K, 1M subscribers, and the implied share of subscribers who watch a new upload, by niche. The SERP (modash, reddit, sanishtech) runs on small hand samples. | Median views at ~30 days per video, grouped by subscriber tier and category | Same tables as #14 | None. Same floor check |
| 16 | **How fast YouTube channels grow, by size tier** (+ how long to 1,000 subscribers). Feeds plan #35 and #51. Goal: median monthly subscriber growth rate per tier and niche, from weekly snapshots, plus the implied time from 500 to 1,000 subscribers. This is moat study M2, which was "too thin" at 7 snapshot dates on 2026-08-22. | Subscriber count per channel per weekly snapshot | `channel_metric_snapshots` | **GATED.** Needs 8+ distinct snapshot dates AND 30+ channels per tier with 5+ snapshots each. Check with: `SELECT COUNT(DISTINCT snapshot_date) FROM channel_metric_snapshots;` and a per-tier channel count. If it fails, skip plan #35, re-check monthly, and write #51 from public sources with one disclosure |

Not measurable from our tables, do not promise a figure: "how many videos
before a channel takes off" (we hold each channel's 50 newest uploads, not
full history), "first 24 hours" figures (snapshots are weekly), "what
percentage of channels reach 1,000 subscribers" (a population statistic; a
tracked set is not a population), average view duration and audience
retention (private per-channel data, the #11/#12 source was 4 channels).

## Own-user Analytics data: CTR and retention, a source no prior study used

Found 2026-08-22: `app/weekly_report.py`'s `_assemble_report` persists real
`avgCtr` and `avgRetention` (pulled from each connected channel's own
authorized YouTube Analytics via OAuth, not modeled or estimated) into
`WeeklyReport.report_data` every week, and has been doing so since the
weekly-report feature shipped. Nobody mined this for a public study before
now. This is NOT available for arbitrary/competitor channels, retention and
CTR are private per-channel data that only the channel owner's own app
grant can see, so this only ever covers our own connected users, same as
vidIQ/TubeBuddy face for their own users. That is a real, honest, aggregate,
anonymized proprietary dataset, not competitor data, and the two studies
below should be scoped and framed that way (real N of connected channels,
never per-user, no channel identified individually).

| # | Study | Stats needed | Source | Status |
|---|---|---|---|---|
| 11 | ~~CONFIRMED 2026-08-22, title agreed~~ **"What a Good CTR Looks Like By Niche, Based on a [N]-Channel Study."** Goal: give creators a benchmark broken down by niche so they can tell whether their own CTR is good or bad, not just a topic label. | `avgCtr` across all `WeeklyReport` rows, aggregated and anonymized, joined to category | `weekly_reports.report_data` (JSON) + `channel_metric_snapshots.category` | Volume AND category-join coverage both unconfirmed, run `scripts/check_weekly_report_coverage.py` first — if category join is under 50%, this becomes an overall benchmark, not by-niche, and the title needs revisiting |
| 12 | ~~CONFIRMED 2026-08-22, title agreed~~ **"We Analyzed [N] Channels to Show What Good Audience Retention Looks Like, By Niche."** Goal: same shape as #11 (CTR), give creators a benchmark broken down by niche so they can tell whether their own audience retention is good or bad. | `avgRetention`, same table, joined to category same as #11 | `weekly_reports.report_data` (JSON) + `channel_metric_snapshots.category` | Same gate as #11, run `scripts/check_weekly_report_coverage.py` first |

**Do not queue either as a confirmed article until the coverage check runs.**
If the real N is too thin (a handful of channels, a few weeks), these fail
the data floor exactly like any other figure would and should wait, not get
published on a small sample. If it clears 30+ channels, this is a real,
differentiated study nothing else on the internet can publish, actual
measured CTR/retention are almost never shared publicly by anyone.

## Compound study: needs real design work, not just a query

| # | Study | Mechanism | Status |
|---|---|---|---|
| 13 | ~~CONFIRMED 2026-08-22, title agreed~~ **"We Analyzed [N] Small YouTube Channels to Find Topics Still Worth Covering in Your Niche."** Goal: help a small or new creator find real topics with actual search demand that big channels in their niche aren't covering, proven by small channels already winning there, not theorized. | Identify disproportionate-view micro-channels via `channel_metric_snapshots`, cross-reference their upload topics (`channel_videos.title`) against `youtube_search_cache` demand that top channels in the same niche are NOT covering | Proposed by the user 2026-08-22. Needs a research file before starting, this is design work (a gap-detection method), not a ready query. |

## Studies that need the moat running first (cannot be backfilled)

| # | Study | Stats needed | Logger |
|---|---|---|---|
| M1 | The fastest-rising YouTube topics of 2026 | Keyword research demand per day | Daily cache hit snapshots |
| M2 | How fast channels really grow, by niche and size tier | Subscriber/view counts over time | Weekly channel metrics snapshots |
| M3 | Seasonality: what creators research by month | Long-run daily hit data | Daily cache hit snapshots (6+ months) |

## The moat loggers (infrastructure)

1. **Daily cache hit snapshots** — nightly scheduler job (23:55 UTC) copying
   non-zero hit counts from `youtube_search_cache` and `ai_output_cache` into a
   `cache_hit_snapshots` table (cache_key, hit_count, snapshot_date). Zero
   YouTube quota. Captures BOTH logged-in dashboard usage and the anonymous
   free tools, because both write to the same shared cache tables; we snapshot
   the tables, not the users. No user identities are logged anywhere.
2. **Weekly channel metrics snapshots** — weekly job saving each known channel's
   subscriber count, total views, and video count into a `channel_metric_snapshots`
   table instead of overwriting. Sources: ChannelRegistry (logged-in),
   public_channel_stats_cache (anonymous tool lookups), top_channel_cache
   (public leaderboards). Cost: ~1 unit per 50 channels via batched
   channels.list, negligible.

3. **Weekly upload history** (moat #3c) — Sundays 05:30 UTC, walks each tracked
   channel's uploads playlist (ChannelRegistry + TopChannelCache channels only,
   cap 3,000 = 3,000 units) and stores video id, publish time, duration, and a
   Shorts flag in `channel_videos`, written once, never overwritten. Powers
   cadence, best-time-to-post, and Shorts-mix studies from real upload logs.
4. **Weekly video stats** (moat #3d) — same run, views/likes/comments for every
   tracked video under 180 days old into `video_metric_snapshots` (cap 50,000
   videos = 1,000 units). Powers "how videos age" studies. Worst case for the
   whole run ~4,100 units/week.

Status: ALL FOUR LOGGERS BUILT AND DEPLOYED 2026-07-17. **VERIFIED WORKING
2026-08-13** (a month later, first actual check). Live row counts:

| Table | Rows | First | Last |
|---|---|---|---|
| cache_hit_snapshots | 10,785 | 2026-07-17 | 2026-08-12 |
| channel_metric_snapshots | 31,144 | 2026-07-19 | 2026-08-09 |
| channel_videos | 48,672 | 2026-07-19 | 2026-08-09 |
| video_metric_snapshots | 118,038 | 2026-07-19 | 2026-08-09 |

All four are firing on their schedules (nightly for cache hits, Sundays for
the weekly jobs). The moat is real and accumulating. Verify again periodically:
there is no alerting on these jobs, and the scheduler wrappers swallow
exceptions into a print statement, so a silent failure would look exactly like
this table not advancing.

Query to re-check (Railway Postgres console, `psql -c "..."`):
`SELECT 'channel_videos', COUNT(*), MIN(discovered_at)::date, MAX(discovered_at)::date FROM channel_videos;` Quota-extension form
for the search.list sub-limit (2,600/day) SUBMITTED to Google 2026-07-17;
top_n 3→5, weekly top-channels, and the last 3 seed keywords are user-approved
but GATED on that approval. Study #1 (video length by niche) is NOT gated:
batch endpoints only, can start any time. Logger 1 runs nightly at
23:55 UTC (scheduler job `cache_hit_snapshots`); logger 2 runs Sundays 05:00 UTC
(job `channel_snapshots`, module app/channel_snapshots.py, MAX_CHANNELS cap
10,000 = ~200 units/run, YT_QUOTA_PAUSED-guarded). Both tested idempotent on a
scratch DB before deploy. Next: run study #1.

## Coverage: what gets captured (updated 2026-07-17)

Everything YouTube-shaped that any visitor generates, logged in or out:
keyword searches (incl. anonymous free-tool reads — ac: suggestion reads now
bump hit_count so misses on the competition cache still count), AI analyses,
connected channels, leaderboard channels, anonymous stats-checker lookups
(both id- and handle-keyed), and competitor channels users analyze. All
aggregate, never per-user.

## Proactive seeding policy

We do not wait for traffic to grow the moat. When a planned study or product
area needs data we don't organically have yet, we seed it deliberately with
the 260K/day quota:

- Expand the nightly niche warmer's seed list toward the niches a study needs.
- Expand the top-channels universe (more categories/regions) to widen the
  channel-snapshot base.
- One-off keyword seeds via scripts/seed_keyword_cache.py-style scripts.

Rules: state quota math first, keep every seed inside the existing cache
tables so the loggers pick it up automatically, and prefer seeding areas tied
to a named study or page, not indiscriminate crawling.

## Backlog — add new study ideas here

- (add ideas as they come up; include the stats needed and whether they exist
  yet, so each idea lands in the right table above)
- Repeat-question signal from the 2026-09-03 round: "how many views do I
  need to make $1,000 / $2,000 / $3,000 / $10,000 a month" appeared as PAA
  on 30+ of 94 queries. Plan #31 answers it from published RPM ranges; if
  `weekly_reports` ever clears 30+ channels with real revenue fields, it
  becomes a measured study instead.

## Rules for every study

1. State the quota math before running any fetch.
2. Never fabricate or extrapolate a "we analyzed N" claim; N is what we
   actually pulled (see the data floor in `CONTENT-PLAN.md` Part 1: 30 channels and 500 videos
   minimum, and figures that fail it get dropped rather than caveated).
3. Publish honest methodology + limitations in the article; that is what makes
   it citable by journalists and AI assistants.
4. Aggregated data only, never individual user behavior.
