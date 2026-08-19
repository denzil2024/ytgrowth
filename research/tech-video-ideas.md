# Research: tech-video-ideas

Target query: `tech video ideas for youtube`
Volume: 50/mo per `keyword-exports/Keyword Stats 2026-08-13 at 00_05_13.csv` — CONTENT-PLAN.md's queue carried 1,300/mo, unverified against the actual export. Every tech-ideas variant in that file caps at 50/mo. Not re-checked against a direct Keyword Planner search (only the discovery-mode export), so this is a flag, not the kill reason.
Researched: 2026-08-19
Status: `REJECTED — data floor fail`

## 1. The live top 10

| # | URL | Fetched | Format | Notes |
|---|---|---|---|---|
| 1 | packapop.com/.../25-tech-youtube-video-ideas | 2026-08-19 | 25 ideas | Thumbnail styles, monetization, tool-plug sections. No measured data. |
| 2 | jaisonchristopher.in/.../top-10-tech-video-topics | 2026-08-19 | 10 broad categories | Product reviews, unboxings, how-to, news, app reviews, comparisons, setups, explainers, hacks, predictions. No data. |
| 3 | armchairarcade.com/.../6-best-youtube-tech-content-ideas | 2026-08-19 | 6 categories | Product reviews, tech news, DIY, how-to, tips, comparisons. No data. |
| 4 | facelesschannels.net/tech-youtube-channel-ideas | 2026-08-19 | 9 channel concepts | Off-intent: channel ideas with sub/earnings examples, not video ideas. |
| — | subscribr.ai/.../tech-youtube-video-ideas | 2026-08-19 | — | 410 Gone, dead page still ranking. Same pattern as cooking's research. |

## 2. Coverage matrix

Every competitor's idea set collapses into the same handful of buckets: product
reviews, unboxings, how-to/tutorials, tech news, comparisons, tips/hacks,
setups, explainers/predictions. No competitor cites measured data. This is the
thinnest, most genuinely-interchangeable SERP of any video-ideas spoke so far —
every page could have been written by any of the others.

## 3. The gap

What they all miss: real upload data (same gap as every other spoke). The
question is whether we can fill it.

## 4. The one test

> Could a competitor without our database have written this article?

**Fails the data pull (Section 5). Without the measured table, this is
identical to the four pages above — a generic ideas list any competitor
already publishes. YES, a competitor could write it, because right now so
could we, minus the one thing that would have made it different.**

## 5. The data pull

```sql
SELECT COUNT(DISTINCT cv.channel_id) AS channels, COUNT(*) AS videos
FROM channel_videos cv
WHERE cv.channel_id IN (
    SELECT DISTINCT channel_id FROM top_channel_cache WHERE category = 'tech'
)
AND cv.published_at >= '2025-01-01';
```

Run 2026-08-19 via Railway Postgres console.

| Check | Value | Floor | Pass? |
|---|---|---|---|
| Channels behind the figure | **17** | 30 | **NO** |
| Videos behind the figure | 1,010 | 500 | yes |
| Date filter applied | yes | required | yes |
| Median AND mean reported | 9.5 / 9.98 min, 7.0% Shorts (computed, unpublishable) | required | n/a — figure dropped |

Figures to publish: none.

Figures dropped for failing the floor: median length 9.5 min, mean 9.98 min,
Shorts share 7.0%. All computed from only 17 channels — 13 short of the floor.
Per Part 1's rule, this is a drop, not a caveat.

Root cause worth flagging, not fixing here: `top_channel_cache` discovers up
to 50 channels x 6 regions for the `tech` category (query: "tech reviews"),
but `channel_videos` only has video-level data for 17 distinct channels in
that set. The discovery layer and the video-collection layer are out of sync
for this category specifically — cooking cleared the floor at 59 channels, so
this isn't a database-wide gap, it's specific to how few discovered `tech`
channels have ever had their videos backfilled.

## 6. Outline

Not built. Rejected before outline stage.

## 7. Approval

Presented: 2026-08-19
Outcome: n/a — self-rejected at Stage 1 per the one test, no draft written.

---

## 8. Stage log

- [x] Stage 1, research file complete — rejected
- [ ] Stage 2 — not reached
- [ ] Stage 3 — not reached
- [ ] Stage 4 — not reached
- [ ] Stage 5 — not reached

### Outstanding

- Queue item 1 status needs updating in CONTENT-PLAN.md Part 4.
- If `tech` category's channel_videos backfill gap is ever closed (more of
  the discovered 50x6 channels get video-level collection), this can be
  re-run without redoing the SERP/matrix work above.
- The 1,300/mo volume CONTENT-PLAN.md carried for this slug does not match
  the keyword export in this repo (50/mo). Not the reason this was rejected
  (data floor was), but worth a direct Keyword Planner re-check before trusting
  that number for any other decision.
