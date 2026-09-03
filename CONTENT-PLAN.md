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
9. Posting time vs. performance, correlation-based (DATA-STUDIES.md study #10) — NOT superseded by #3, wrongly marked done. `best-time-to-post` measures WHEN top creators post (frequency by hour/day); this study asks whether posting time actually CORRELATES with performance, same Spearman-correlation method that made the title-length study real ("title length explains ~0% of variance" was the finding there). Confirmed, titled, zero quota, `channel_videos` + `video_metric_snapshots`, ready to research and write, nothing blocking it.
10. CTR benchmark by niche — killed. `scripts/check_weekly_report_coverage.py` run 2026-08-29: 0/17 `weekly_reports` rows have real CTR/retention populated, only 4 distinct channels total. Far below any usable floor. Revisit only if `_assemble_report` coverage grows substantially.
11. Retention benchmark by niche — killed, same reason as #10 (same source table, same run).
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
30. ~~YouTube Super Thanks Explained~~ — published 2026-09-02 as `/blog/youtube-super-thanks`
31. Do You Need a Big Following for Affiliate Marketing? — spoke
32. `youtube-sponsorships` — existing post, link in as a spoke
33. Merch shelf — not confirmed, weak evidence so far

## AI-citation fitness sweep (older posts, fix one at a time)

Audited 2026-09-02 after the youtube-super-thanks pass surfaced that recent
articles (data studies, monetization spokes) are bolded and FAQ-schema'd for
AI citation, but the site's 73 older posts mostly are not. Two real gaps per
post, checked independently:

1. **Bold coverage** — % of `<p>` paragraphs with zero `<strong>` tags. Low
   bold means a citation engine has nothing to extract a clean quotable claim
   from. Target: match the recent articles' ~85-95% bolded rate, not 100%
   (lead-ins to lists/tables are fine unbolded).
2. **FAQ schema** — whether the post has a real `faqs` array at all (feeds
   FAQPage JSON-LD). A post with zero FAQs has zero FAQ-citation surface,
   independent of its bold coverage.

Fix one post per pass: bold pass (real claims only, no mechanical
bold-everything), false-"free"-claim check, British-spelling normalize to
American English (site standard), and if FAQ:NO, a real Serper-PAA-sourced
FAQ array added (not guessed, per FOUNDATION.md's FAQ sourcing rule). Verify
with `check-drift.mjs` + `check-blog-paragraphs.mjs` before moving to the next.

Ordered worst-first by bold %. ~~Struck~~ once done.

- ~~video-tagging~~ — done 2026-09-02 (bold 0%→93%, free-claim fixed, British
  spellings fixed; still needs a real FAQ array, not yet done)
- youtube-competitor-analysis — 100% unbolded, no FAQ
- youtube-thumbnail-size — 100% unbolded, no FAQ
- youtube-as-a-business — 100% unbolded, no FAQ
- youtube-channel-optimization — 100% unbolded, no FAQ
- free-subs-on-youtube — 100% unbolded, no FAQ
- youtube-niche — 97% unbolded, no FAQ
- vidiq-review — 97% unbolded, has FAQ
- youtube-tag-finder — 96% unbolded, no FAQ
- youtube-channel-audit — 95% unbolded, no FAQ
- more-views-on-youtube — 95% unbolded, no FAQ
- youtube-partner-program — 93% unbolded, no FAQ
- youtube-maker — 92% unbolded, has FAQ
- youtube-analytics — 91% unbolded, has FAQ
- youtube-analytics-tools — 90% unbolded, has FAQ
- youtube-algorithm — 89% unbolded, no FAQ
- youtube-seo-best-practices — 89% unbolded, has FAQ
- tubebuddy-vs-vidiq — 88% unbolded, has FAQ
- thumbnail-tester — 88% unbolded, no FAQ
- youtube-title — 88% unbolded, no FAQ
- youtube-channel-not-growing — 86% unbolded, no FAQ
- youtube-thumbnail-ideas — 86% unbolded, no FAQ
- google-adsense-youtube — 85% unbolded, has FAQ
- what-is-youtube-seo — 85% unbolded, has FAQ
- youtube-data-studies — 83% unbolded, no FAQ
- seo-tools-for-youtube — 83% unbolded, no FAQ
- youtube-watch-hours — 83% unbolded, has FAQ
- youtube-cpm — 82% unbolded, has FAQ
- comedy-video-ideas — 80% unbolded, has FAQ
- shorts-tagging — 79% unbolded, has FAQ
- grow-youtube-channel — 78% unbolded, no FAQ
- youtube-description-template — 78% unbolded, has FAQ
- youtube-vlog-ideas — 76% unbolded, has FAQ
- youtube-tags — 75% unbolded, has FAQ
- youtube-shorts-algorithm — 74% unbolded, has FAQ
- youtube-sponsorships — 74% unbolded, has FAQ
- cooking-video-ideas — 73% unbolded, has FAQ
- youtube-trends — 69% unbolded, has FAQ
- youtube-keyword-research-tools — 65% unbolded, has FAQ
- youtube-rpm — 65% unbolded, has FAQ
- youtube-title-length — 62% unbolded, has FAQ
- youtube-ctr — 50% unbolded, has FAQ
- youtube-shorts-pay — 49% unbolded, no FAQ
- youtube-challenge-ideas — 48% unbolded, has FAQ
- tech-video-ideas — 47% unbolded, has FAQ
- gaming-youtube-channel — 47% unbolded, has FAQ
- best-time-to-post — 44% unbolded, has FAQ
- gaming-video-ideas — 42% unbolded, has FAQ
- youtube-channel-phone — 41% unbolded, has FAQ
- youtube-shorts-ideas — 41% unbolded, has FAQ
- copyright-free-music — 41% unbolded, has FAQ
- youtube-monetization-beyond-ads — 38% unbolded, has FAQ (pillar, already
  gets frequent touch-ups from spoke work)
- youtube-1-million-views — 34% unbolded, has FAQ
- faceless-youtube-channel-ideas — 33% unbolded, no FAQ
- youtube-video-ideas — 32% unbolded, has FAQ
- youtube-banner-size — 27% unbolded, has FAQ
- start-youtube-channel — 23% unbolded, has FAQ
- youtube-brand-account — 22% unbolded, has FAQ
- chrome-extensions-for-youtube — 22% unbolded, no FAQ
- how-to-start-a-youtube-video — 13% unbolded, has FAQ
- youtube-demonetization — 14% unbolded, has FAQ
- too-late-to-start — 14% unbolded, has FAQ
- cash-cow-youtube-channels — 7% unbolded, has FAQ
- restart-youtube-channel — 6% unbolded, has FAQ
- youtube-ai-policy — 6% unbolded, has FAQ
- best-youtube-mic — 3% unbolded, has FAQ

Already clean, no action needed (recent data studies / monetization spokes,
all bolded during original write, all skip this list): youtube-super-thanks,
youtube-channel-memberships, video-length-by-niche, shorts-vs-long-form,
youtube-view-growth-curve, youtube-engagement-rate, music-video-ideas.

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
