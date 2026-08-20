# Research: music-video-ideas

Target query: `music video ideas` / `youtube content ideas for musicians` cluster
Volume: 950/mo per CONTENT-PLAN.md (validated 08-13, source: direct Keyword Planner
search, not the discovery-mode export in this repo, which caps every variant of this
phrase at 50/mo, same discrepancy already flagged and left unresolved for
tech-video-ideas). Not re-verified this session; the article's case rests on the
one test, not volume alone, same precedent as tech.
Researched: 2026-08-20
Status: `researching — data confirmed, outline drafted, awaiting approval`

## Intent check (done first, because this query is ambiguous)

"Music video ideas" splits into two real, different intents: (1) ideas for an
actual music video (the video accompanying a song, cinematography-focused,
serving artists/production companies), and (2) content ideas for a YouTube
channel run by a musician (the same "video-ideas" intent every sibling spoke
serves). A first search on the bare phrase returned a mixed SERP (Fiverr,
Peerspace, both video-production-service pages for intent 1). Checking the
actual keyword variants sitting in `keyword-exports/` resolved it: every real
query people search is intent 2, e.g. "music youtube channel ideas," "youtube
content ideas for musicians," "ideas for music youtube channel." Re-searched
on `youtube content ideas for music channel musicians` and got the right SERP.
This article is intent 2, channel content strategy for a musician's channel,
matching every sibling spoke, not music-video cinematography advice.

## 1. The live top 10

| # | URL | Fetched | Format | Notes |
|---|---|---|---|---|
| 1 | air.io/en/trending/42-youtube-shorts-ideas-for-music-channels | 2026-08-20 | 42 ideas, Shorts-specific | AIR Media-Tech, a recurring competitor already named in CLAUDE.md for the title-length study. Categories: tutorials, covers, remixes/mashups, original song promo, trends, other. No data, cites unsourced platform stats (70B daily views). |
| 2 | thecraftymusician.com/20-video-content-ideas-for-musicians-on-youtube | 2026-08-20 | 20 ideas | Lifestyle/vlog-heavy: ride-alongs, car chats, storytime, band practice. No data. |
| 3 | orpheusaudioacademy.com/youtube-video-ideas | 2026-08-20 | 32 ideas (some overlapping) | Broadest coverage: music content, BTS, personal/lifestyle, educational/commentary, interactive/community, reviews. No data. |
| 4 | filmora.wondershare.com/youtube/youtube-video-ideas-for-musicians.html | 2026-08-20 | 15 ideas | Covers-heavy (9 of 15 are cover variants). No data. |
| — | mellamusic.com/30-youtube-content-ideas-for-musicians | 2026-08-20 | — | 404, dead page. |
| — | facelesschannels.net/music-youtube-channel-ideas | not fetched | — | Same off-intent pattern seen on the tech research pass (channel concepts with sub/earnings examples, not video ideas). Skipped on that basis without refetching. |

SERP character: fragmented, no dominant authority. Idea counts range 15-42
with real overlap (covers, tutorials, BTS all appear on 3+ pages) but no page
organizes by repeatable format the way our spokes do; all four read as flat
lists.

## 2. Coverage matrix

| Format cluster | AIR | Crafty Musician | Orpheus | Filmora | Ours |
|---|---|---|---|---|---|
| Covers (genre-shift, instrument-based, acapella, remix/mashup) | x | | x | x | pending |
| Original song / songwriting (snippets, meaning behind songs, lyric breakdown) | x | x | x | | pending |
| Behind-the-scenes / recording process | | x | x | | pending |
| Tutorials / education (technique, gear, production software) | x | | x | x | pending |
| Vlog / lifestyle (ride-along, home tour, day in the life) | | x | x | | pending |
| Trends / challenges / viral formats | x | | x | x | pending |
| Interviews / collabs (other musicians, venue owners) | | x | x | | pending |
| Fan engagement / Q&A / requests | x | x | x | | pending |
| Gear talk | | | x | | pending |
| News / commentary / reviews | | x | x | | pending |
| Merch | | x | | | pending |
| Live performance / streaming | x | | x | x | pending |

Strongest competitor section count: Orpheus at 32 items across 6 groupings.
No competitor organizes by nameable, repeatable format the way our spokes do;
all four are flat enumerations. That gap is itself an angle, same as it was
for cooking against Enfroy's padded 155-item list.

## 3. The gap

What every one of them misses: real upload data, same as every spoke so far.
Zero citations, zero measured claims, across all four.

What we can answer that they cannot: median/mean length and Shorts share for
real music channels, the same measured table every spoke carries. Music also
has a genuinely distinctive profile worth leading with: shortest median length
of any tracked niche (2.8 min) and one of the highest Shorts shares (37.0%),
both defensible, specific hooks no competitor can touch.

Intent gap: none of the four distinguish between content that promotes an
artist's actual music (covers, originals, live performance) and content that
builds a channel around the artist as a personality (vlogs, BTS, commentary).
Conflating the two is why Crafty Musician's list reads as generic vlogger
advice with "musician" pasted on, and why Filmora's list is 9/15 cover
variants with nothing else. Separating "promotes the music" from "builds the
channel" is a structural difference worth making explicit.

## 4. The one test

> Could a competitor without our database have written this article?

The format list itself: yes, same as every spoke, these are recognizable
content types. **The measured table is the differentiator, and it is a
strong one here**: music's 2.8-minute median and 37.0% Shorts share are the
most distinctive numbers of any niche in the 14-category dataset, both
already gathered and confirmed. Passes.

## 5. The data pull

```sql
SELECT COUNT(DISTINCT cv.channel_id) AS channels, COUNT(*) AS videos,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_seconds) / 60.0 AS median_min,
  AVG(duration_seconds) / 60.0 AS mean_min,
  AVG(CASE WHEN duration_seconds <= 60 THEN 1.0 ELSE 0.0 END) AS shorts_share
FROM channel_videos cv
WHERE cv.channel_id IN (SELECT DISTINCT channel_id FROM top_channel_cache WHERE category = 'music')
AND cv.published_at >= '2025-01-01' AND cv.duration_seconds IS NOT NULL
```

Already run 2026-08-19 during the pillar's 14-category sweep, category
`music` cleared the floor easily on the first pass, no expanded discovery
needed (unlike tech/education/vlogs/comedy/sports/entertainment, which all
needed the discovery fix).

| Check | Value | Floor | Pass? |
|---|---|---|---|
| Channels behind the figure | **181** | 30 | **yes** |
| Videos behind the figure | 6,801 | 500 | yes |
| Date filter applied | yes (`published_at >= '2025-01-01'`) | required | yes |
| Median AND mean reported | 2.8 min / 8.3 min (2.96x skew) | required | yes |

Figures to publish: median length 2.8 min, mean 8.3 min, 2.96x skew, 37.0%
Shorts share. 181 channels, 6,801 videos. Shortest median and second-highest
Shorts share of all 14 tracked niches (after beauty's 44.5%), both worth
naming explicitly against the other 13 for context, same cross-niche framing
device the pillar uses.

Figures dropped for failing the floor: none.

## 6. Outline

Working title: TBD, not a template count.
Slug: `music-video-ideas`
Angle: format-first, split explicitly into "promotes the music" and "builds
the channel" formats, since no competitor makes that distinction, backed by
the most distinctive length/Shorts profile of any tracked niche.

- H2: What Music Channels Really Publish — wait, drop "Really" per the
  cluster-wide fix made today. "What Music Channels Publish" — the measured
  table (2.8 min median, 8.3 min mean, 37.0% Shorts, 181 channels/6,801
  videos), with the shortest-median / near-highest-Shorts framing against
  the other 13 niches
- H2 explaining the promotes-the-music vs. builds-the-channel split, the
  identified structural gap
- Format sections covering the UNION from Section 2: covers, original
  song/songwriting, behind-the-scenes, tutorials/education, vlog/lifestyle,
  trends/challenges, interviews/collabs, fan engagement/Q&A, gear talk,
  news/commentary/reviews. Exact grouping and idea count TBD at drafting,
  likely consolidating some of these 10 clusters the way tech consolidated
  live-streaming with challenges, to avoid an unwieldy H2 count
- FAQ, count driven by genuinely distinct questions, real PAA data pulled
  before writing (per the correction made on the pillar), not guessed
- Creative closing H2, not "Final Thoughts," not reused from any sibling

Internal links out: `/blog/youtube-video-ideas` (pillar) added to its
`## Which Niche Guide to Read Next` list once this ships; siblings gaming,
tech, cooking, comedy linked inline near the format-intro section, matching
the pattern fixed across all four spokes today.
Mid-article CTA: video ideas generator tool, matching every sibling.
Cover image: real sourced photo needed, house pattern (musician creator
mid-task: instrument, mic, or recording setup visible, warm/candid), same
brief pattern as every other spoke.

## 7. Approval

Presented: 2026-08-20
Outcome: pending

---

## 8. Stage log

- [x] Stage 1, research file complete
- [ ] Stage 2, presented and approved — pending
- [ ] Stage 3 — not reached
- [ ] Stage 4 — not reached
- [ ] Stage 5 — not reached

### Outstanding

- Awaiting outline approval (Stage 2 gate).
- PAA data must be pulled for real before writing the FAQ section, per the
  correction made on the pillar today. Not done yet, do during Stage 3.
- The 950/mo volume CONTENT-PLAN.md carries for this slug does not match the
  keyword export in this repo (every real variant caps at 50/mo there), same
  unresolved flag as tech. Not blocking.
