# YTGrowth — Content Plan

Site: ytgrowth.io · Niche: YouTube SEO/growth SaaS tools

Only entries that have gone through the process in `FOUNDATION.md` belong in
this file: for a keyword article, real Keyword Planner volume plus a passed
SERP check plus the one test; for a data study, a data floor that clears
FOUNDATION.md's four rules. No guessed titles, no guessed figures. This file
is the order things ship in, titles only. Full methodology, source tables,
and blocked-on reasons for each data study live in `DATA-STUDIES.md`. Voice,
process, and diagnosis live in `FOUNDATION.md`. Read this file for what's
next, follow a link only if you need the why.

Last updated: 2026-08-28

## Data studies (the primary lever, see FOUNDATION.md → What we are building)

1. ~~Video length by niche~~ — published 2026-08-13
2. ~~Title length~~ — published 2026-08-21
3. ~~Best time to post, measured~~ — upgraded 2026-08-26 into `/blog/best-time-to-post`
4. ~~Upload cadence: growing vs. stalled channels~~ — upgraded 2026-08-28 into `/blog/best-time-to-post`
5. ~~View growth curve: how fast views come in, first 30 days~~ — published 2026-08-28 as `/blog/youtube-view-growth-curve`
6. ~~Shorts vs. long-form: which front-loads views faster~~ — combined into #5's article
7. ~~Engagement rate by niche~~ — published 2026-08-29 as `/blog/youtube-engagement-rate`
8. ~~Shorts share over time, by niche~~ — published 2026-08-28 into `/blog/shorts-vs-long-form`
9. ~~Posting time vs. performance~~ — superseded by #3
10. CTR benchmark by niche — blocked on `scripts/check_weekly_report_coverage.py`
11. Retention benchmark by niche — blocked on `scripts/check_weekly_report_coverage.py`
12. M1/M2/M3 moat studies — blocked. M1: contaminated by the nightly niche-warmer's own seed list, not a runway issue, see `research/fastest-rising-topics.md`. M2: only 7 snapshot dates, too thin. M3: needs 6+ months, have 1.5.
13. Topics small channels still win on — killed. `channel_tracked` has near-zero small-channel (<50K subs) coverage in every named niche (gaming, cooking, fitness, etc. all show 0 small channels with tracked videos), only "uncategorized" has any (109), which isn't a real niche signal. No small-vs-large comparison is possible with current tracking data. See `scripts/check_micro_channel_feasibility.py`.

## Video Ideas cluster (pillar `youtube-video-ideas`)

14. ~~Pillar~~ — published, rewritten to full depth 2026-08-20
15. ~~Gaming~~ — published 2026-08-13
16. ~~Cooking~~ — published 2026-08-15
17. ~~Comedy~~ — published 2026-08-14 (retroactive SERP check still owed)
18. ~~Tech~~ — published 2026-08-19
19. ~~Music~~ — published 2026-08-20
20. Comedy spoke: retroactive SERP check + coverage matrix — owed
21. Vlog ideas rewrite — needs a research file
22. Shorts ideas rewrite — needs a research file
23. Challenge ideas rewrite — needs a research file

## Starting a Channel cluster (pillar `start-youtube-channel`)

24. ~~Pillar~~ — published
25. ~~YouTube Channel on Phone~~ — published
26. ~~YouTube Brand Account~~ — published
27. ~~Gaming YouTube Channel~~ — published

## Monetization Beyond Ads cluster (sourced from real Reddit/PAA demand)

28. ~~Making Money on YouTube Beyond Ads~~ — pillar, published as `/blog/youtube-monetization-beyond-ads`
29. ~~Are YouTube Channel Memberships Worth It?~~ — published 2026-09-02 as `/blog/youtube-channel-memberships`
30. YouTube Super Thanks Explained — spoke
31. Do You Need a Big Following for Affiliate Marketing? — spoke
32. `youtube-sponsorships` — existing post, link in as a spoke
33. Merch shelf — not confirmed, weak evidence so far

## Dropped, not queued

- Sponsor-companies article — fails the one test, no differentiator vs. OutlierKit
- Promotion pass on published studies — user sourcing leads directly, not a content task

## Programmatic pages — built out, not a source of new work

`/youtube-stats/*` and `/youtube-earnings/*` are fully live. See `FOUNDATION.md` for what was checked and why nothing further is queued here.

## After the run order above

Not a keyword round. The real next lever is backlinks/authority for the
unconverted tier-1 US impressions. Needs its own scoped plan before it
becomes a numbered item here.

## Rules

- Only confirmed entries belong here. Unconfirmed candidates live in
  `FOUNDATION.md`'s parked tracks or dropped log until confirmed.
- Update this file the same session something ships or the order changes.
- No fixed idea counts, no fixed FAQ counts, no reused skeleton, structure
  comes from the research file's coverage matrix every time.
- Every spoke links back to its pillar and its sibling spokes.
