# Research: shorts-share-over-time

Target question: is Shorts adoption still rising per niche, or has it leveled off, month by month.
Volume: no dedicated page, upgrades `/blog/shorts-vs-long-form`'s "The Right Mix and Cadence" section (currently a static percentage recommendation, no trend data)
Researched: 2026-08-28
Status: awaiting approval

CONTENT-PLAN.md data study #8. Zero fresh quota, `channel_videos.is_short` grouped by month since Jan 2025.

---

## 1. Goal, stated plainly

Give a creator a real answer to "is the Shorts share in my niche still climbing, or has it plateaued," so they know whether shifting more of their output to Shorts is riding a wave or arriving late to one that already peaked. Not a single snapshot percentage (the existing "25 to 40 percent" mix guidance already covers that), a trend over time.

---

## 2. The gap

Every "Shorts vs long-form mix" guide states a snapshot ratio as if it's stable. None show whether that ratio is still moving. A creator deciding how much to invest in Shorts right now needs to know if the format's share of their niche is still growing (worth riding) or has flattened (a stable-state, not a growth opportunity). This requires the same month-by-month upload data no competitor's snapshot-style guide has.

**The one test:** could a competitor without our database answer this? No, a trend over 20 months needs tracked upload history, not a single scrape.

---

## 3. The data pull

```sql
-- channel_videos.is_short, grouped by month of published_at, since 2025-01-01
-- (script: scripts/query_shorts_share_over_time_study.py, run via Railway console)
```

Method: for each niche, for each calendar month since Jan 2025, compute the share of that month's tracked uploads that are Shorts. Report the trend (is the most recent 3-month average higher, lower, or flat vs. the first 3 months of real coverage), plus the raw month-by-month series so the shape (still rising, plateaued, ever declined) is visible, not just a start/end comparison.

Floor: a niche needs at least 30 videos in a given month to get a data point for that month; months below the floor are skipped, not interpolated.

| Check | Value | Floor | Pass? |
|---|---|---|---|
| Channels behind the figure | pending query run | 30 | pending |
| Videos behind the figure | pending query run | 500 | pending |
| Date filter applied | published_at >= 2025-01-01, grouped by month | required | will apply |
| Median AND mean reported | share is already a ratio (Shorts/total), not median/mean-sensitive | n/a | — |

---

## 4. Outline

Working title: (section-level, folds into existing article, no new title)
Slug: `shorts-vs-long-form` (upgrade, not a new page)
Angle in one sentence: replace the static "Shorts should be 25-40% of output" framing with a real trend, is that share still climbing per niche or has it already plateaued, so a creator knows if they're catching a wave or arriving late.

- **New section inside "The Right Mix and Cadence"** (or a new H2 right after "The Answer by Niche," decide once the real numbers show whether the trend story is strong enough to earn its own section): month-by-month Shorts share per niche since Jan 2025, real trend, not a snapshot.
- **FAQ: add 1 entry** if the finding is strong. "Is Shorts adoption still growing, or has it plateaued?"

Internal links out: none new needed, stays inside the same article.
Cover image needed: no, existing cover stays.

---

## 5. Approval

Presented: pending
Outcome: pending

---

## 6. Stage log

- [x] Stage 1, research file complete
- [ ] Stage 2, presented and approved
- [ ] Stage 3, written against the full standard in one pass
- [ ] Stage 4, verified
- [ ] Stage 5, built, pushed, verified live

Outstanding: write `scripts/query_shorts_share_over_time_study.py`, get it run on Railway console, get real numbers before writing prose.
