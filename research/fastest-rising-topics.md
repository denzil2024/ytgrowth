# Research: fastest-rising-topics

Target question: which YouTube topics/keywords are gaining real research demand right now.
Volume: new standalone article, no patching into an existing post.
Researched: 2026-08-29
Status: awaiting approval

CONTENT-PLAN.md moat study M1. Unblocked 2026-08-29 via `scripts/check_moat_logger_status.py`: 19,274 rows, 47 distinct daily snapshots over 46 days (2026-07-17 to 2026-09-01).

---

## 1. Goal, stated plainly

Show creators which topics real people are researching more of right now, using our own logged usage data, not a trends tool's opaque black box or a guess.

---

## 2. What this data actually is

`cache_hit_snapshots` is a nightly copy of `hit_count` (a running, never-reset counter incremented every time that exact search is reused from cache) for every real query in `youtube_search_cache` (SEO Studio, Keyword Research, Competitor search) and `ai_output_cache` (AI Chat features). This is not a trends estimate, it is a direct count of how many times our own users and public tool visitors actually searched or asked about a topic, real usage, not modeled demand.

**A real limit to disclose:** this only reflects demand among ytgrowth.io's own users and public-tool visitors, not all of YouTube's global search demand. It is a real, first-party signal, not a Google Trends substitute, and the article needs to say so plainly, not imply it is bigger than it is.

---

## 3. The data pull

```sql
-- cache_hit_snapshots, source = 'search', comparing each cache_key's
-- hit_count in its earliest vs latest snapshot within the 46-day window
-- (script: scripts/query_fastest_rising_topics.py, to be run via Railway console)
```

Method: for each (source, cache_key) present in both the first week and the last week of the window, compute the increase in hit_count over that span. Rank by raw increase (real additional hits earned, not just a ratio that a 1-hit-to-2-hit query could win on). Report the real query text (`label`), not the hashed cache_key. Floor: must appear in both an early and late snapshot to count as "rising" rather than a single new entry.

| Check | Value | Floor | Pass? |
|---|---|---|---|
| Distinct cache_keys behind the figure | pending query run | to be judged once real | pending |
| Snapshot dates spanned | 47 | n/a, real | Pass |
| Date filter applied | full 2026-07-17 to 2026-09-01 window | required | will apply |

---

## 4. Outline

Working title: (to propose once real numbers are in, per goal-before-title process)
Slug: `youtube-trending-topics` or similar (new page, exact slug TBD once title is agreed)
Angle in one sentence: real, first-party usage data on which YouTube topics are gaining research demand, not a trends-tool guess.

- H2: the real fastest-rising topics, ranked
- H2: what this data source is and its honest limit (our own users, not all of YouTube)
- H2: how to act on a rising topic
- FAQ: PAA-sourced only, pull before writing

Internal links out: data-studies hub, relevant tool pages (Keyword Research, SEO Studio) since this data comes directly from their usage.
Cover image needed: yes, new article, prompt after the draft is approved.

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

Outstanding: write `scripts/query_fastest_rising_topics.py`, get it run on Railway console, get real numbers before writing prose.
