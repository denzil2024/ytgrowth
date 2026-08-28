# Research: best-time-to-post

Target query: `best time to post on youtube`
Volume: existing page, site's highest-impression page already (see CONTENT-PLAN.md #3)
Researched: 2026-08-26
Status: done, awaiting push go-ahead

This is an UPGRADE of the live `/blog/best-time-to-post` page, not a new page. Slug, title, and most sections stay. The "Best Times by Niche" section (currently 7 guessed bullet points, no data) gets replaced with real numbers. A new short section explains why every guide disagrees. FAQ gets 2 new real-data entries.

---

## 1. The live top 10

| # | URL | Domain | Fetched | Format | Notes |
|---|---|---|---|---|---|
| 1 | socialpilot.co/insights/best-time-to-post-on-youtube | SocialPilot | 2026-08-26 | Data study | 301K videos/27K channels, engagement-rate normalized, has industry breakdown |
| 2 | webfx.com/blog/social-media/best-time-to-post-youtube | WebFX | 2026-08-26 | Listicle | Cites a HubSpot trends report, no sample size given |
| 3 | postfa.st/blog/best-time-to-post-on-youtube | PostFast | 2026-08-26 | Data study | 8,067 posts/126 workspaces, 97% Shorts, cites Buffer's 1.8M-video study too |
| 4 | nexlev.io/best-time-to-post-on-youtube | NexLev | 2026-08-26 | Listicle | No sample size, leans on "use TubeBuddy/VidIQ" advice |
| 5 | iqfluence.io/public/blog/best-time-to-post-on-youtube | iQfluence | 2026-08-26 | Data study | 325 influencer campaigns, sponsored-content only, not organic uploads |
| 6 | wordstream.com/blog/.../best-time-to-post-on-youtube | WordStream | fetch failed (ECONNRESET) | — | Search snippet only: cites HubSpot, no methodology |

SERP character: mixed. 3 of 5 fetched are "data studies" with real-sounding sample sizes but none show their actual per-bucket numbers or a spread/confidence signal, they state a conclusion and move on. Beatable on transparency and mechanism, not on raw N (SocialPilot's 301K > our 35,466).

---

## 2. Coverage matrix

| Section | SocialPilot | WebFX | PostFast | NexLev | iQfluence | Ours? |
|---|---|---|---|---|---|---|
| Overall best hour/day | Y | Y | Y | Y | Y | Y (have) |
| Worst hour/day to avoid | Y | Y | Y | Y | Y | Y (have) |
| Long-form vs Shorts split | Y | — | Y | Y | Y | Y (have) |
| Day-by-day breakdown | — | Y | Y | Y | — | Y (have) |
| By region/timezone | — | — | — | Y | Y | Y (have) |
| By industry/niche | Y | — | — | Y | Y | **replacing guessed version with real data** |
| Why timing matters (algorithm) | — | — | Y | Y | — | Y (have, "Why Timing Is a Small Lever") |
| How to find your own best time (Studio) | Y | Y | Y | Y | Y | Y (have) |
| Upload frequency | — | Y | — | — | — | Y (have, own section) |
| Why studies disagree with each other | — | — | — | — | — | **gap, nobody covers this** |
| FAQ | — | Y | Y | — | Y | Y (have) |

Section counts: strongest competitor (iQfluence) ~12 H2s once sub-headings are collapsed. Ours: 10 existing + 1 new = 11, on par.

---

## 3. The gap

**What every one of them misses:** none show their actual per-bucket numbers. They state "best hour: 2-4 PM" as a flat conclusion with no visible spread, so a reader can't tell if that's a strong or trivial effect. None discuss sample-size floors per bucket. None address that every one of these five guides gives a *different* answer (2-4pm vs 4-5pm vs "Wednesday" vs "Friday/Saturday/Sunday") without explaining why they disagree.

**What we can answer that they structurally cannot:** we have channel-normalized, per-video tracked data (not campaign or scheduling-tool data) across 974 channels and 14 real niches, with visible median multipliers and sample counts per bucket. That lets us show the actual mechanism: pooled across niches, the effect nearly vanishes (spread 0.167 by hour, 0.039 by weekday), but within a single niche it's large (up to 4.8x spread). That's *why* every generic guide's number is different and weak, they're each reporting some blend of niches, not a real universal pattern. No competitor's dataset structure (campaign-based, scheduling-tool-based, or unsourced) lets them show that mechanism, they'd need the same channel-normalized per-niche tracking we already run.

**Intent the SERP does not close:** a reader who has already read 2-3 of these guides and noticed they contradict each other. None of the five explain the contradiction. We can.

---

## 4. The one test

> Could a competitor without our database have written this article?

Answer: No for the core new finding (the pooled-vs-per-niche mechanism, and real per-niche numbers with visible multipliers and sample sizes). Yes for the surrounding sections (day-of-week generalities, Shorts timing, how to check your own Studio analytics), which is why those sections stay as-is rather than being rewritten, the upgrade is targeted at the one section that was pure guessing.

---

## 5. The data pull

```sql
-- channel_videos.published_at joined to latest video_metric_snapshots per video,
-- views-per-day normalized to each channel's own median, since Jan 2025
-- (script: scripts/query_best_time_to_post_study.py, run via Railway console 2026-08-26)
```

| Check | Value | Floor | Pass? |
|---|---|---|---|
| Channels behind the figure | 974 | 30 | Pass |
| Videos behind the figure | 35,466 | 500 | Pass |
| Date filter applied | published_at coverage since tracking began | required | Pass |
| Median AND mean reported | both reported (median_x, mean_x) | required | Pass |
| Per-niche floor | 15-video floor per hour-bucket | n/a | Applied |

**Figures to publish:**
- Pooled by hour (UTC): best 1am (x1.109), worst 6pm (x0.942), spread 0.167
- Pooled by weekday: best Sunday (x1.030), worst Friday (x0.991), spread 0.039
- Per-niche best hour (UTC), for niches with n>=1200: news (n=5291) 2am x1.429; tech (n=3682) 12am x1.457; gaming (n=2922) 8pm x1.164; music (n=2864) 2am x1.285; cooking (n=2353) 4am x2.713; travel (n=2283) 8am x1.444; fitness (n=1903) 10am x1.294; education (n=1601) 7pm x1.787; sports (n=1395) 10pm x1.994; entertainment (n=1243) 6am x1.955; finance (n=1229) 1am x3.267
- Per-niche spread is real and large: finance 2.585, cooking 2.226, entertainment 1.547, sports 1.297

**Figures dropped for failing the floor:**
- vlogs (n=1218), beauty (n=985), comedy (n=544): kept in the table since they clear the 500-video floor, but flagged in-article with a lighter-sample caveat since several individual hour-buckets within them likely sit near the 15-video floor and their spreads (vlogs 1.079, beauty 0.770, comedy 0.333) are less stable than the larger-n niches. Not dropped, caveated.
- "Uncategorized" (n=5953) dropped from the published niche table entirely, it's not a real niche, it's unclassified channels, publishing a "best hour for uncategorized" number would be meaningless to a reader.

---

## 6. Outline

Working title: (unchanged) "The Best Time to Post on YouTube in 2026 (and Why Your Own Data Beats Any Chart)"
Slug: `best-time-to-post` (unchanged)
Angle in one sentence: replace the guessed "Best Times by Niche" section with real per-niche numbers from 35,466 tracked videos, and add the one thing no competitor explains, why every guide's answer disagrees (pooling flattens a real per-niche effect into near-noise).

Changes only, rest of the live article stays:

- Keep: intro, day-by-day table, Shorts section, content-type section, region section, frequency section, established-channels-cadence section, "find your own best time" section, "why timing is a small lever," common mistakes, FAQ intro block.
- **Replace `<h2>The Best Times by Niche</h2>`** (currently 7 guessed bullets) with a real table: niche, best hour (UTC), median multiplier, N, plus the lighter-sample caveat for the three thin niches.
  - Answers: SocialPilot/NexLev/iQfluence's "by industry" sections, but with visible real numbers instead of a flat claim.
- **New short section, placed right after the niche table: "Why Every Guide Gives You a Different Answer."** Pooled numbers (spread 0.167 by hour, 0.039 by weekday) vs. the per-niche spreads, explains the mechanism in 2-3 short paragraphs.
  - Answers: the gap nobody covers.
- **FAQ: add 2 entries.** "Is there really a universal best time to post?" (no, here's the pooled-vs-niche numbers) and "What's the best time to post for my niche?" (point to the table, note UTC not local time).
- Update `excerpt` and the intro's opening claim to mention the real study lightly, keep the existing voice.

Internal links out: none new needed, existing links to `/blog/youtube-analytics` and `/blog/youtube-title-length` (sibling data study) already present, add one more to `/blog/video-length-by-niche` and `/blog/youtube-title-length` as "part of the same tracked-data series," matching the site's existing cross-study linking pattern.
Mid-article CTA: keep existing (Channel Audit), no change.
Cover image needed: no, existing cover stays, this is a section-level content upgrade, not a new article.

---

## 7. Approval

Presented: 2026-08-26
Outcome: approved
Notes: verbal go-ahead to write immediately after the research file was presented.

---

## 8. Stage log

- [x] Stage 1, research file complete
- [x] Stage 2, presented and approved
- [x] Stage 3, written against the full standard in one pass
- [x] Stage 4, verified: parses clean (JSX valid), paragraphs <=5 lines (61/61 pass after one split),
      FAQ array mirrors visible exactly (12/12 entries, byte-diffed), banned words zero (actually/em-dash/
      em/British spellings all 0), table count and table rows are a pre-existing drift on this article
      (7 tables/52 rows before this edit, 8/64 after, this edit added exactly 1 table for real data replacing
      guessed prose), screenshots confirm the niche table and mechanism section render correctly with the
      site's existing table styling.
- [ ] Stage 5, built with `BUILD_API_URL`, pushed, verified live, indexing requested

Outstanding for this article:
- Get push go-ahead, then build + push + verify live + request re-indexing (Stage 5)
