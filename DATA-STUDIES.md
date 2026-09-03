# Data Studies

**Looking for what ships next? That's `CONTENT-PLAN.md`.** This file is the
study list plus the methodology, quota math and gate conditions behind each
one. Studies are numbered here and only here; the run order references these
numbers.

Last updated: 2026-09-03

## Ready to write, in this order

Three studies. All zero quota, all sourced from tables we already hold.

1. **What posting time does to YouTube performance** (study #10, feeds plan
   #26). Nothing blocking it at all.
2. **How many views counts as viral**, as a multiple of the channel's own
   median (study #14, feeds plan #12). Run the data-floor count first.
3. **Average views per video by subscriber count** (study #15, feeds plan
   #19). Run the data-floor count first.

Details for each are under "What each ready study needs" below. Everything
after this section is status for studies you cannot start today.

## Not ready

| # | Study | Feeds | Why not |
|---|---|---|---|
| 16 | How fast channels grow, by size tier (+ time to 1,000 subs) | plan #35, #51 | **GATED.** Needs 8+ snapshot dates and 30+ channels per tier. Gate check is below |
| 13 | Topics small channels still win on | none yet | **DESIGN WORK.** A gap-detection method, not a query. Needs a research file first |

Blocked on data that must accumulate first (cannot be backfilled):

| # | Study | Blocker |
|---|---|---|
| M1 | The fastest-rising YouTube topics of 2026 | Contaminated by the nightly niche warmer's own seed list, see `research/fastest-rising-topics.md` |
| M3 | Seasonality: what creators research by month | Needs 6+ months of daily cache-hit data, have ~1.5 |

## Not measurable from our tables

Do not promise a figure for any of these:

- **How many videos before a channel takes off.** We hold each channel's 50
  newest uploads, not full history.
- **Any "first 24 hours" figure.** Snapshots are weekly.
- **What percentage of channels reach 1,000 subscribers.** A population
  statistic; a tracked set is not a population.
- **Average view duration and audience retention.** Private per-channel data.
  The only source was 4 channels, which killed studies #11 and #12.

## What each ready study needs

**#10, posting time vs. performance.** Confirmed 2026-08-22. `published_at`
hour and weekday vs. views normalized to channel median, same Spearman method
as study #2. Distinct from `/blog/best-time-to-post`, which measures WHEN top
creators post; this asks whether posting time correlates with views at all.
It was wrongly marked "superseded" in the old plan for weeks. It is not.

**#14, viral multiples.** The share of videos reaching 2x / 5x / 10x / 50x
their channel's median, by niche and subscriber tier, plus first-week views by
tier. Replaces the internet's guessed thresholds ("10k is viral"). This is the
Outliers feature's own definition, published.

**#15, views per video by subscriber count.** Median 30-day views per upload at
1K, 10K, 100K, 1M subscribers, and the implied share of subscribers who watch a
new upload, by niche. The current SERP runs on small hand samples.

**#16, growth rate by tier.** Median monthly subscriber growth per tier and
niche from weekly snapshots, plus implied time from 500 to 1,000 subscribers.
Gate check before starting:
`SELECT COUNT(DISTINCT snapshot_date) FROM channel_metric_snapshots;` needs 8+,
plus 30+ channels per tier with 5+ snapshots each. If it fails, skip plan #35,
re-check monthly, and write plan #51 from public sources with one disclosure.

## The data floor (every figure clears all four)

| Rule | Threshold |
|---|---|
| Channels behind the figure | 30 minimum |
| Videos behind the figure | 500 minimum for a length/format claim |
| Date filter | `published_at >= '2025-01-01'`, always |
| Median alongside mean | Both, always |

**Why the date filter is not optional.** `channel_videos.published_at` is NOT
bounded by the collection window. Discovery pulls each channel's 50 newest
uploads, so a slow channel drags history back years: the table spans 2006 to
2026. Study #1 shipped describing `discovered_at` as if it were
`published_at` and had to be corrected the same day. Education's median moved
11.6 to 8.6 minutes and became the worst mean/median skew at 3.83x.

**Report medians.** Average duration is wildly skewed by livestream VODs and
lecture recordings. Education's mean is 3.83x its median, news 3.75x, gaming
3.00x, while travel and tech are ~1.03x.

**Category coverage.** `channel_metric_snapshots.category` is only populated
for TopChannelCache channels. About 3,098 videos land `uncategorized` and are
excluded from per-niche tables. 14 niches cleared a usable sample in study #1;
the thinnest were music (633) and education (670).

## Quota

- **260,000 units/day** (granted 2026-07-17). Batch endpoints are cheap:
  videos.list / channels.list / playlistItems.list cost 1 unit per call (up to
  50 items each), so analyzing 100K videos costs roughly 2,000-10,000 units.
- **search.list is 100 units** and carries a separate 100 requests/day
  sub-limit that was NOT raised with the bump. Every study currently listed
  uses batch endpoints or existing tables only, so all of them cost zero.
- State the quota math before running any fetch. Every fetch script must
  respect `YT_QUOTA_PAUSED=1`.

## Rules for every study

1. State the quota math before running any fetch.
2. Never fabricate or extrapolate a "we analyzed N" claim. N is what was
   actually pulled, and figures failing the data floor get dropped, not
   caveated.
3. Publish honest methodology and limitations in the article. That is what
   makes it citable.
4. Aggregated data only, never individual user behavior.
5. Ship with the outreach step, not just a publish. These exist to earn links.

## Backlog

- Repeat-question signal from the 2026-09-03 round: "how many views do I need
  to make $1,000 / $2,000 / $3,000 / $10,000 a month" appeared as PAA on 30+ of
  94 queries. Plan #31 answers it from published RPM ranges; if
  `weekly_reports` ever clears 30+ channels with real revenue fields, it
  becomes a measured study instead.

---

## Archive: killed and published

Killed, with the evidence. Do not restart these without new data:

| # | Study | Why |
|---|---|---|
| 11 | CTR benchmark by niche | `scripts/check_weekly_report_coverage.py`, run 2026-08-29: 0 of 17 `weekly_reports` rows have real CTR populated, 4 distinct channels total. Far below the data floor |
| 12 | Retention benchmark by niche | Same run, same table, same result |
| M2 | How fast channels grow (original framing) | Superseded by #16, which is the same question with a defined gate |

Published:

| # | Study | Shipped as |
|---|---|---|
| 1 | The ideal YouTube video length by niche | `/blog/video-length-by-niche`, 2026-08-13 |
| 2 | What winning YouTube titles have in common | `/blog/youtube-title-length`, 2026-08-21 |
| 3 | When top creators really upload | `/blog/best-time-to-post`, 2026-08-26 |
| 4 | How often successful channels upload vs stalled | `/blog/best-time-to-post`, 2026-08-28 |
| 5 | Shorts vs long-form mix by niche | Inside #1's article |
| 6 | How fast views come in, the first 30 days | `/blog/youtube-view-growth-curve`, 2026-08-28 |
| 7 | Do Shorts grow faster than long-form | Combined into #6's article |
| 8 | Engagement rate by niche | `/blog/youtube-engagement-rate`, 2026-08-29 |
| 9 | Shorts ratio over time, by niche | `/blog/shorts-vs-long-form`, 2026-08-28 |

# Reference: the moat infrastructure

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
