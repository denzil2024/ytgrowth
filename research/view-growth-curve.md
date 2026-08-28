# Research: view-growth-curve

Target query: `how long does it take for a youtube video to get views` / `do youtube shorts grow faster than long form`
Volume: new standalone article, no existing page to upgrade
Researched: 2026-08-28
Status: awaiting approval

CONTENT-PLAN.md data studies #5 and #6, combined into one article since they share the same data pull (`video_metric_snapshots`' weekly time series) and are naturally the same reader question asked two ways: how fast do views actually arrive, and does that pace differ between Shorts and long-form.

---

## 1. The live top 10

| # | URL | Domain | Fetched | Format | Notes |
|---|---|---|---|---|---|
| 1 | reddit.com/r/NewTubers/.../how_long_does_it_take_for_yt_to_push_a_video | Reddit | 2026-08-28 | Thread | Anecdotal |
| 2 | socialvideoplaza.com/.../how-long-before-youtube-video-gets-views | SocialVideoPlaza | 2026-08-28 | Listicle | Zero data, "author's personal experience," no sample size, no visualized curve |
| 3 | quora.com/How-long-does-it-typically-take | Quora | not fetched | Q&A | Not comparable |
| 4 | facebook.com/groups/tubemagic/... | Facebook | not fetched | Thread | Not comparable |
| 5 | socialinsider.io/blog/how-long-does-it-take-for-yt-shorts-to-get-views | SocialInsider | not fetched | Listicle | Shorts-specific angle |
| 6 | miraflow.ai/blog/youtube-shorts-vs-long-form-which-grows-channel-faster-2026 | Miraflow | 2026-08-28 | Guide | Zero empirical data, "contains no empirical data, sample sizes, or measurable metrics," pure framework/opinion content |
| 7 | mediacube.io/en-US/blog/youtube-shorts-vs-long-videos | Mediacube | not fetched | Guide | Real MCN, worth a look but not required, pattern already clear |

SERP character: wide open. Every real competitor fetched has zero real data, no sample size, no visualized growth curve, and openly admits (per Miraflow's own hedged language) it's giving frameworks, not measurements.

---

## 2. Coverage matrix

| Section | SocialVideoPlaza | Miraflow | Ours? |
|---|---|---|---|
| First 24-48 hour behavior | Y (anecdotal) | — | Y, real curve |
| Longer-term (weeks/months) climb | Y (anecdotal, "3-6 months") | — | Y, real curve |
| Shorts vs long-form growth speed | — | Y (anecdotal only) | Y, real, this is the core new angle |
| A real visualized/tabulated growth curve | — | — | **gap, nobody has this** |
| Per-niche variation | — | — | Y, real |
| Practical "when should I judge a video" guidance | Y (anecdotal) | — | Y, backed by the real curve |

---

## 3. The gap

**What every competitor misses:** a real, measured growth curve. Every guide describes the shape in words ("boost in the first 24 hours, dip, then a slow climb") without ever showing the actual numbers behind that shape. None can say what percentage of a video's 30-day views arrive in the first week versus the last, because none have tracked real videos over time.

**What we can answer that they structurally cannot:** `video_metric_snapshots` has weekly view counts per video since 2026-07-19, for every tracked video under 180 days old. That is a real per-video time series, not a single snapshot. No competitor's dataset (campaign data, one-off scraped counts, or pure anecdote) has this.

**Intent the SERP does not close:** "should I be worried my video only has X views after Y days" is the real anxiety behind this query, and no guide gives a real benchmark curve to check against.

---

## 4. The one test

> Could a competitor without our database have written this article?

Answer: No. A real growth curve needs repeated observations of the same videos over time. Every competitor fetched either has no data or a single end-state number. This is a clean pass.

---

## 5. The data pull

```sql
-- video_metric_snapshots (weekly, videos <180 days old) joined to channel_videos.published_at + is_short
-- since 2026-07-19 (when the weekly snapshot job went live)
```

Method:
1. For each tracked video, build its (days_since_published, views) series from weekly snapshots.
2. Bucket by days-live: 0-7, 8-14, 15-21, 22-30, 31-60, 61-90 (videos need enough history to reach later buckets, so later buckets will have a smaller N, report it honestly per bucket).
3. For each video that has a snapshot at 30+ days, compute what share of its day-30 view count had already arrived by day 7 and day 14. That is the real "how fast do views come in" number.
4. Repeat the same share-of-day-30 calculation split by `is_short`, that is study #6, same pull, no separate query needed.
5. Repeat split by category (Simpson's-paradox guard, same floor logic as prior studies: 30 videos minimum per niche cell).

| Check | Value | Floor | Pass? |
|---|---|---|---|
| Channels behind the figure | pending query run | 30 | pending |
| Videos behind the figure | pending query run | 500 | pending |
| Videos with 30+ days of tracked history | pending, this is the binding constraint since the logger only started 2026-07-19 (about 6 weeks of runway as of this research date) | needs checking first | pending |
| Median AND mean reported | will report both | required | will apply |

**Real risk to check before writing:** the weekly snapshot job started 2026-07-19, about 40 days before this research date. A video needs to be tracked for 30+ days AND have been uploaded recently enough to still be under the 180-day tracking window, so the pool of videos with a full 30-day observed curve could be thin. The query must report this count explicitly before any figure gets written up, per the data floor rule, a thin 30-day cohort would mean shipping only the 7/14-day findings and flagging 30-day as directional.

---

## 6. Outline

Working title: "How Fast Views Actually Come In: A Real 30-Day YouTube Growth Curve"
Slug: `youtube-view-growth-curve`
Angle in one sentence: show the real, measured share of a video's views that arrives in the first week vs. the first month, then show whether Shorts front-load faster than long-form or not, replacing every competitor's anecdotal "boost then dip then climb" description with real numbers.

- H2: The Real 30-Day Growth Curve (the headline table/chart, share of eventual views by day-bucket)
- H2: Does the Curve Differ by Niche
- H2: Shorts vs. Long-Form: Which Front-Loads Faster (study #6's angle, direct answer)
- H2: What This Means for When You Should Judge a Video (practical section, ties to the site's existing "why timing is a small lever" honesty standard)
- H2: How We Tracked This (methodology, matches the site's existing pattern)
- FAQ, built from real PAA: "how long does it take for my first video to get views," "is 2000 views in 1 day good," "how long does it take to get 1000 views" (need real numbers to answer each, not guesses)

Internal links out: `/blog/youtube-data-studies` (hub), `/blog/shorts-vs-long-form`, `/blog/youtube-shorts-algorithm` (existing claim to cross-check against), `/blog/video-length-by-niche` and `/blog/youtube-title-length` (sibling studies)
Mid-article CTA: Channel Audit, matches every sibling study
Cover image needed: yes, new article. Will scope the prompt after the outline is approved, matching house process.

---

## 7. Approval

Presented: pending
Outcome: pending
Notes:

---

## 8. Stage log

- [x] Stage 1, research file complete
- [ ] Stage 2, presented and approved
- [ ] Stage 3, written against the full standard in one pass
- [ ] Stage 4, verified
- [ ] Stage 5, built, pushed, verified live

Outstanding for this article:
- Write `scripts/query_view_growth_curve_study.py`
- Run on Railway console, check the 30-day cohort size first before committing to that angle
- Real PAA pull for FAQ before writing
- Cover prompt after outline approval
