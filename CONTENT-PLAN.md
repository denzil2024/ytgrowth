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

**Shipped:**

1. ~~Video length by niche~~ — published 2026-08-13 as `/blog/video-length-by-niche`
2. ~~Title length / what winning titles have in common~~ — published 2026-08-21 as `/blog/youtube-title-length`, commit `e4c95478b`

**Ready now, no blockers:**

3. ~~Best time to post, measured~~ — upgraded 2026-08-26, real per-niche table + mechanism section replaces guessed advice on `/blog/best-time-to-post`
4. ~~Upload cadence: successful channels vs. stalled ones~~ — upgraded 2026-08-28, real growing-vs-stalled cadence data (pooled + per-niche) added to `/blog/best-time-to-post`
5. **How fast views come in: the first 30 days of a YouTube video**
   Source: `video_metric_snapshots`' weekly time series, 0 quota, never mined before 2026-08-22.
6. **Do Shorts grow faster than long-form, or just get posted more?**
   Source: shares #5's data pull, do back to back.
7. **Engagement rate by niche: which categories get the most likes/comments per view**
   Source: 0 quota, pending a likeCount-coverage check first.
8. **We Analyzed [N] YouTube Uploads to See Whether Creators Are Uploading More Shorts Over Time, By Niche**
   Source: `channel_videos.is_short` by month since Jan 2025, 0 quota.
   Goal: not a snapshot percentage, whether the month-by-month Shorts ratio is rising per niche or has leveled off.
9. ~~What Posting Time Does to YouTube Performance~~ — superseded by #3's 2026-08-26 upgrade, same method, same question, already answered (pooled effect nearly flat, real per niche).

**Blocked on `scripts/check_weekly_report_coverage.py` (volume + category-join coverage):**

10. **What a Good CTR Looks Like By Niche, Based on a [N]-Channel Study**
    Source: `weekly_reports.report_data`, real Analytics via each connected creator's own OAuth grant, never competitor data.
    Goal: give creators a benchmark broken down by niche so they can tell whether their own CTR is good or bad.
    Note: if the per-niche join rate is too low, this reverts to an overall benchmark and the title needs revisiting.
11. **We Analyzed [N] Channels to Show What Good Audience Retention Looks Like, By Niche**
    Source: same as #10, `weekly_reports.report_data` + `channel_metric_snapshots.category`.
    Goal: same shape as #10, for audience retention instead of CTR.

**Blocked on `scripts/check_moat_logger_status.py` (logger runway):**

12. **M1/M2/M3 moat studies** (fastest-rising topics, channel growth rates, seasonality)
    Status unconfirmed since 2026-08-13. Five-plus weeks of runway have accumulated since, check before assuming still blocked.

**Needs a research file before it can start (design work, not a ready query):**

13. **We Analyzed [N] Small YouTube Channels to Find Topics Still Worth Covering in Your Niche**
    Source: compound study, `channel_metric_snapshots` + `channel_videos` + `youtube_search_cache`.
    Goal: help a small or new creator find real topics with actual search demand that bigger channels aren't covering, proven by small channels already winning there.

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

## Monetization Beyond Ads cluster (mapped 2026-08-22, sourced from real Reddit/PAA demand, not Keyword Planner)

Method: real question mining (Reddit threads + Google PAA via Serper), same method that produced the Demonetization/Policy cluster (see `FOUNDATION.md` history log). Every topic below passed a real SERP diversity check (no wall-to-wall Backlinko/HubSpot/vidIQ-blog/TubeBuddy-blog) and a real-questions check before being confirmed.

28. **Making Money on YouTube Beyond Ads** — pillar, new page. Real evidence: r/NewTubers "Do you make money without ads?", r/PartneredYoutube "How do I monetize my channel beyond Adsense." Needs a research file before writing.
29. **Are YouTube Channel Memberships Worth It?** — spoke. Real evidence: r/PartneredYoutube "Yay or Nay?", plus 4 real PAA questions (cost, how it works, do people actually pay).
30. **YouTube Super Thanks Explained: How Much You Actually Keep** — spoke. Real evidence: 4 real PAA questions (what it is, how much is one, YouTube's cut, what happens when you press it).
31. **Do You Need a Big Following for YouTube Affiliate Marketing?** — spoke. Real evidence: real PAA "Can I start affiliate marketing with 0 followers?"
32. `youtube-sponsorships` — existing post, not new writing, gets linked in as a spoke (brand deals territory already covered here, confirmed no overlap risk).
33. Merch shelf — candidate, NOT confirmed. Weakest evidence found (0 PAA across 2 query variants, 1 Reddit thread title only). Needs more real evidence before it counts as a spoke.

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
