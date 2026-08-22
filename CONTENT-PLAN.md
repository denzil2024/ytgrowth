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
5. M1/M2/M3 moat studies (fastest-rising topics, channel growth rates, seasonality) — gated on the data loggers having enough runway, see `DATA-STUDIES.md`

## Video Ideas cluster (pillar `youtube-video-ideas`, mapped 2026-07-28)

6. ~~Pillar~~ — published, rewritten to full depth 2026-08-20 (111 ideas, 15 formats, 83,423 videos)
7. ~~Gaming Video Ideas~~ — published 2026-08-13
8. ~~Cooking Video Ideas~~ — published 2026-08-15
9. ~~Comedy Video Ideas~~ — published 2026-08-14 (Stage 1/2 retroactive SERP check still owed, see below)
10. ~~Tech Video Ideas~~ — published 2026-08-19
11. ~~Music Video Ideas~~ — published 2026-08-20
12. Comedy spoke: retroactive SERP check + coverage matrix — owed since 2026-08-14, edit not a rewrite
13. Vlog ideas rewrite — candidate, needs its own research file first
14. Shorts ideas rewrite — candidate, needs its own research file first
15. Challenge ideas rewrite — candidate, needs its own research file first

## Starting a Channel cluster (pillar `start-youtube-channel`, mapped 2026-07-28)

16. ~~Pillar~~ — published
17. ~~YouTube Channel on Phone~~ — published
18. ~~YouTube Brand Account~~ — published
19. ~~Gaming YouTube Channel~~ — published

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
