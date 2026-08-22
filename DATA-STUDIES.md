# Data Studies — Working Doc

**Looking for what's next / ship order? That's `CONTENT-PLAN.md`, not this
file.** This doc is methodology, quota math, and moat-logger status for each
study, read it for the "how," not the "what's next."

Living doc. The plan for original-data research articles ("we analyzed X") built
from our own API pulls and moat data. These are the backlink + AI-citation
assets that unlock authority-gated head terms (see project_linkable_data_studies
and MEDIAVINE.md's ranking-reality section). Read this before starting any study,
and add new ideas to the backlog section as they come up.

Last updated: 2026-08-22 (added 5 more studies + 2 status-check scripts)

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
| 3 | When top creators really upload: best time to post, measured | publishedAt timestamps per niche and channel size | Existing `channel_videos.published_at` (no fresh pull needed, corrected 2026-08-22, matches the #1 notes below) | **0 units** |
| 4 | How often successful channels upload vs stalled ones | Upload cadence + channel size/views | Same table as #3 | **0 units** |
| 5 | Shorts vs long-form mix by niche, from real channels | Upload duration classification per channel | Same pull as #1 (reuse the dataset) | shared |
| 6 | How fast views actually come in: the first 30 days of a YouTube video | Weekly view counts per video from upload | Existing `video_metric_snapshots` (weekly snapshots for videos <180 days old, this is a real per-video growth curve, no fresh pull) | **0 units** |
| 7 | Do Shorts actually grow faster than long-form, or just get posted more? | Weekly views by `is_short` flag, first 30 days | `channel_videos.is_short` + `video_metric_snapshots` | **0 units** |
| 8 | Engagement rate by niche: which categories get the most likes/comments per view | likes, comments, views per video, grouped by category | `video_metric_snapshots` + `channel_metric_snapshots.category`. Caveat: verify likeCount is populated at reasonable coverage before committing, YouTube lets creators hide public like counts | **0 units**, pending the coverage check |

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
| 9 | ~~CONFIRMED 2026-08-22, title agreed~~ **"We Analyzed [N] YouTube Uploads to See Whether Creators Are Uploading More Shorts Over Time, By Niche."** Goal: not a snapshot percentage, whether the month-by-month Shorts ratio is rising per niche or has leveled off. | `is_short` ratio grouped by month of `published_at`, Jan 2025 to now | `channel_videos` (no fresh pull) | **0 units** |
| 10 | ~~CONFIRMED 2026-08-22, title agreed~~ **"What Posting Time Does to YouTube Performance, Measured Across [N] Videos."** Goal: find out whether posting time has any real relationship to performance, or whether it's an unproven assumption like title length turned out to be. | `published_at` hour/weekday vs. views normalized to channel median, same method as study #2's title-length correlation | `channel_videos` + `video_metric_snapshots` | **0 units** |

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
| 11 | What CTR do real YouTube channels actually get, measured (not estimated) | `avgCtr` across all `WeeklyReport` rows, aggregated and anonymized | `weekly_reports.report_data` (JSON) | Volume unconfirmed, run `scripts/check_weekly_report_coverage.py` first |
| 12 | What retention rate is actually normal, measured across real channels | `avgRetention`, same table | `weekly_reports.report_data` (JSON) | Same, run the same script |

**Do not queue either as a confirmed article until the coverage check runs.**
If the real N is too thin (a handful of channels, a few weeks), these fail
the data floor exactly like any other figure would and should wait, not get
published on a small sample. If it clears 30+ channels, this is a real,
differentiated study nothing else on the internet can publish, actual
measured CTR/retention are almost never shared publicly by anyone.

## Compound study: needs real design work, not just a query

| # | Study | Mechanism | Status |
|---|---|---|---|
| 13 | How micro-channels (sub-10k subs) out-grow bigger ones by hitting search demand nobody else is covering | Identify disproportionate-view micro-channels via `channel_metric_snapshots`, cross-reference their upload topics (`channel_videos.title`) against `youtube_search_cache` demand that top channels in the same niche are NOT covering | Real angle, proposed by the user 2026-08-22. Needs a research file before starting, this is design work (a gap-detection method), not a ready query. |

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

## Rules for every study

1. State the quota math before running any fetch.
2. Never fabricate or extrapolate a "we analyzed N" claim; N is what we
   actually pulled (see the data floor in `CONTENT-PLAN.md` Part 1: 30 channels and 500 videos
   minimum, and figures that fail it get dropped rather than caveated).
3. Publish honest methodology + limitations in the article; that is what makes
   it citable by journalists and AI assistants.
4. Aggregated data only, never individual user behavior.
