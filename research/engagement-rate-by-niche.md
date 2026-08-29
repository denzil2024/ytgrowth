# Research: engagement-rate-by-niche

Target query: `what is a good engagement rate on youtube` / `youtube engagement rate by niche`
Volume: new standalone article, per standing rule, no patching into existing posts
Researched: 2026-08-28
Status: awaiting approval

CONTENT-PLAN.md data study #7. Unblocked 2026-08-28 via `scripts/check_likecount_coverage.py`: 97.1% like-count coverage, 98.8% comment coverage, 51,405 distinct videos, every niche clears 85%+.

---

## 1. Goal, stated plainly

Show creators which niches actually reward engagement (likes and comments per view), so they know whether their own low engagement rate is a real problem or just normal for what they make.

---

## 2. The live top 10

| # | URL | Domain | Fetched | Format | Notes |
|---|---|---|---|---|---|
| 1 | socialstatus.io/insights/.../youtube-engagement-rate-benchmark | Social Status | 2026-08-28 | Data study (claimed) | "Hundreds of thousands of videos," but the actual page is broken, no real numbers shown, no niche breakdown |
| 2 | sponsorship.so/blog/blog-what-is-a-good-engagement-rate-on-youtube | Sponsorship.so | 2026-08-28 | Guide | Explicitly says "no single average applies to every niche," but only gives subscriber-tier benchmarks, no real per-niche numbers |
| 3 | usesnippet.app/tools/youtube-engagement-calculator/benchmarks | Snippet | not fetched | Tool/calculator | — |
| 4 | mediacube.io/en-US/blog/youtube-engagement-rate | Mediacube | not fetched | Guide | — |
| 5 | hypeauditor.com/free-tools/youtube-engagement-calculator | HypeAuditor | not fetched | Calculator tool | Not comparable content |

SERP character: real competitors exist and are more substantial than some other topics checked this project, but both fetched pages confirm the same gap: they know niche matters, neither shows real per-niche numbers.

---

## 3. The gap

**What every competitor misses:** a real per-niche benchmark. Sponsorship.so states the problem outright, "no single average applies to every niche," then gives subscriber-tier data instead of solving it. Social Status claims a large sample but the page doesn't display real numbers at all.

**What we can answer that they cannot:** real engagement rate (likes+comments / views) per niche, from our own tracked dataset, with a real sample size stated per niche.

**The one test:** could a competitor without our database write this? Not the per-niche numbers specifically, that needs the same tracked, categorized dataset the other studies use. The general "engagement rate matters, formula is X" framing is common knowledge and doesn't clear this bar alone, the per-niche real numbers are what earns the article.

---

## 4. The data pull

```sql
-- video_metric_snapshots (likes, comments, views) joined to channel_videos + category
-- (script: scripts/query_engagement_rate_study.py, to be run via Railway console)
```

Method: for each video, use its latest snapshot with a non-null like count. Engagement rate = (likes + comments) / views. Report median (not mean, avoid a handful of viral outliers skewing the number) per niche, plus N videos and N channels per niche. Floor: 500 videos / 30 channels per niche, matching the site's standard.

Also check: does engagement rate correlate with the earlier growth-vs-cadence findings, or is it a genuinely independent signal? Worth a quick cross-check once real numbers are in, not a blocking requirement.

| Check | Value | Floor | Pass? |
|---|---|---|---|
| Channels behind the figure | pending query run | 30 | pending |
| Videos behind the figure | pending query run | 500 | pending |
| Median AND mean reported | will report both | required | will apply |

---

## 5. Outline

Working title: (to propose once real numbers are in, per goal-before-title process)
Slug: `youtube-engagement-rate` (new page)
Angle in one sentence: real per-niche engagement-rate benchmarks, the thing every competitor admits creators need but none of them actually show.

- H2: the real per-niche benchmark table
- H2: what engagement rate actually predicts (or doesn't), cross-check against growth data if it holds up
- H2: how to read your own number against your niche
- FAQ: PAA-sourced only, pull before writing

Internal links out: `/blog/youtube-ctr` (related metric guide), `/blog/youtube-analytics` (where creators check their own numbers), data-studies hub.
Cover image needed: yes, new article, prompt after the draft is approved.

---

## 6. Approval

Presented: pending
Outcome: pending

---

## 7. Stage log

- [x] Stage 1, research file complete
- [ ] Stage 2, presented and approved
- [ ] Stage 3, written against the full standard in one pass
- [ ] Stage 4, verified
- [ ] Stage 5, built, pushed, verified live

Outstanding: write `scripts/query_engagement_rate_study.py`, get it run on Railway console, get real numbers before writing prose.
