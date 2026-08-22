# YTGrowth — Content Plan

Site: ytgrowth.io · Niche: YouTube SEO/growth SaaS tools

Only entries that have gone through the process in `FOUNDATION.md` belong in
this file: for a keyword article, real Keyword Planner volume plus a passed
SERP check plus the one test; for a data study, a data floor that clears
FOUNDATION.md's four rules. No guessed titles, no guessed figures. This file
is the order things ship in. It is not the reasoning, the standards, or the
history, that's all in `FOUNDATION.md`, read this first, follow a link only
if you need the why.

Last updated: 2026-08-22

## Data studies (the primary lever, see FOUNDATION.md → What we are building)

1. ~~Video length by niche~~ — published 2026-08-13 as `/blog/video-length-by-niche`
2. ~~Title length / what winning titles have in common~~ — published 2026-08-21 as `/blog/youtube-title-length`, commit `e4c95478b`
3. Best time to post, measured — **NEXT.** ~0 quota, upgrades `/blog/best-time-to-post`, the highest-impression page on the site
4. Upload cadence: successful channels vs. stalled ones — shares #3's data pull, do back to back
5. How fast views come in: the first 30 days of a YouTube video — 0 quota, `video_metric_snapshots`' weekly time series, never mined before 2026-08-22
6. Do Shorts grow faster than long-form, or just get posted more? — 0 quota, shares #5's data pull, do back to back
7. Engagement rate by niche: which categories get the most likes/comments per view — 0 quota, pending a likeCount-coverage check first (see `scripts/check_moat_logger_status.py`)
8. Shorts adoption over time: how fast is the shift actually happening, by niche — 0 quota, `channel_videos.is_short` by month since Jan 2025, see `DATA-STUDIES.md`
9. Does upload timing predict a video's own channel-relative performance — 0 quota, same channel-normalized method as study #2
10. What CTR do real YouTube channels actually get, measured — own connected-user data (`weekly_reports.report_data`, real Analytics via each user's own OAuth grant, never competitor data), volume unconfirmed, run `scripts/check_weekly_report_coverage.py` first
11. What retention rate is actually normal, measured across real channels — same source and same gate as #10
12. How micro-channels (sub-10k subs) out-grow bigger ones by hitting search demand nobody else covers — compound study (`channel_metric_snapshots` + `channel_videos` + `youtube_search_cache`), needs a research file, this is design work not a ready query
13. M1/M2/M3 moat studies (fastest-rising topics, channel growth rates, seasonality) — status unconfirmed since 2026-08-13, run `scripts/check_moat_logger_status.py` on Railway console before assuming still blocked, five-plus weeks of runway have accumulated since

## Video Ideas cluster (pillar `youtube-video-ideas`, mapped 2026-07-28)

14. ~~Pillar~~ — published, rewritten to full depth 2026-08-20 (111 ideas, 15 formats, 83,423 videos)
15. ~~Gaming Video Ideas~~ — published 2026-08-13
16. ~~Cooking Video Ideas~~ — published 2026-08-15
17. ~~Comedy Video Ideas~~ — published 2026-08-14 (Stage 1/2 retroactive SERP check still owed, see below)
18. ~~Tech Video Ideas~~ — published 2026-08-19
19. ~~Music Video Ideas~~ — published 2026-08-20
20. Comedy spoke: retroactive SERP check + coverage matrix — owed since 2026-08-14, edit not a rewrite
21. Vlog ideas rewrite — candidate, needs its own research file first
22. Shorts ideas rewrite — candidate, needs its own research file first
23. Challenge ideas rewrite — candidate, needs its own research file first

## Starting a Channel cluster (pillar `start-youtube-channel`, mapped 2026-07-28)

24. ~~Pillar~~ — published
25. ~~YouTube Channel on Phone~~ — published
26. ~~YouTube Brand Account~~ — published
27. ~~Gaming YouTube Channel~~ — published

## Dropped, not queued

- **Sponsor-companies article** (`youtube-sponsor-companies`, 5,500/mo) — SERP passes the diversity test, but OutlierKit ranks there on original sponsor data we don't have. No differentiator, fails the one test.
- **Promotion pass on published studies** — user is sourcing leads and will bring them. Do not pursue unprompted, see `OUTREACH.md`.

## Programmatic pages — status: built out, not a source of new work

Checked 2026-08-22. `/youtube-stats/*`: 14/14 categories live, plus 4/4
tier-1 countries (US/UK/Canada/Australia). `/youtube-earnings/*`: 14/14
niches live. The one further combination anyone might reach for, niche x
country earnings pages, was already built, shipped, and retired 2026-07-09
as a templated thin-content liability, see `MEDIAVINE.md`. A
`/youtube-stats/country/:slug/:category` route exists in `App.jsx` but has
no prerendered pages, treat it as unbuilt scaffolding and apply the same
thin-content scrutiny before ever populating it, not a default next step.

## After the run order above

Not a keyword round: FOUNDATION.md's dropped log shows the keyword-cluster
model is close to exhausted. The real next lever is backlinks/authority for
the 53K tier-1 US impressions sitting unconverted. That needs its own
scoped plan before it becomes a numbered item here.

## Rules

- Only confirmed entries belong here. Unconfirmed candidates live in
  `FOUNDATION.md`'s parked tracks or dropped log until confirmed.
- Update this file the same session something ships or the order changes.
  A plan that describes a state the repo has left is worse than no plan.
- No fixed idea counts, no fixed FAQ counts, no reused skeleton, structure
  comes from the research file's coverage matrix every time.
- Every spoke links back to its pillar and its sibling spokes.
