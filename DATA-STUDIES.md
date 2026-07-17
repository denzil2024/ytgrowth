# Data Studies — Working Doc

Living doc. The plan for original-data research articles ("we analyzed X") built
from our own API pulls and moat data. These are the backlink + AI-citation
assets that unlock authority-gated head terms (see project_linkable_data_studies
and MEDIAVINE.md's ranking-reality section). Read this before starting any study,
and add new ideas to the backlog section as they come up.

Last updated: 2026-07-17

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
| 1 | The ideal YouTube video length in 2026, by niche (analyzed ~100K top videos) | Durations + views of top videos per niche | Fresh pull: channel uploads via playlistItems + videos.list | ~5-10K units |
| 2 | What 10,000 winning YouTube titles have in common | Titles, lengths, patterns (numbers, brackets, year tags, questions) of top-ranking videos | youtube_search_cache (already stored) + cheap top-up | ~0-2K units |
| 3 | When top creators really upload: best time to post, measured | publishedAt timestamps per niche and channel size | Fresh pull via uploads playlists | ~5K units |
| 4 | How often successful channels upload vs stalled ones | Upload cadence + channel size/views | Fresh pull; plugs the known data gap in blog/best-time-to-post | ~5K units |
| 5 | Shorts vs long-form mix by niche, from real channels | Upload duration classification per channel | Same pull as #1 (reuse the dataset) | shared |

Priority order: #1 first (most broadly linkable, no fresh 2026 numbers exist),
then #3/#4 (they upgrade best-time-to-post, our highest-impression page), then
#2 (near-free). #5 falls out of #1's dataset.

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

Status: ALL FOUR LOGGERS BUILT AND DEPLOYED 2026-07-17. First nightly snapshot
expected the night of 2026-07-17; first weekly runs Sunday 2026-07-20 — next
session must VERIFY rows are appearing in all four tables. Quota-extension form
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
   actually pulled (see the never-fabricate rule in SEO-OPTIMIZATION-CHECKLIST.md).
3. Publish honest methodology + limitations in the article; that is what makes
   it citable by journalists and AI assistants.
4. Aggregated data only, never individual user behavior.
