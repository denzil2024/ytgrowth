# YTGrowth — Content Plan

Site: ytgrowth.io · Niche: YouTube SEO/growth SaaS tools

**This is the only content plan. Read it before any content work.**

Last updated: 2026-08-14

---

## PART 1 — WHAT WE ARE BUILDING

This section did not exist before 2026-08-14, and its absence is why the blog
drifted into templates. There was plenty written about what to target next and
what not to do, and nothing about what the thing is supposed to become. When
there is no destination, the only available structure at writing time is the
previous article's structure. That is how we got two posts with the same
skeleton and a different niche word swapped in.

### The destination

**The YouTube publisher that answers questions from measured data on real
channels, when every competitor can only offer opinion.**

We hold data nobody else in this SERP has: `channel_videos` (upload dates,
lengths, titles, formats), `video_metric_snapshots` (performance over time),
`ChannelRegistry` (channel size and niche), `youtube_search_cache` (what
creators actually research), and `ai_output_cache`. vidIQ and TubeBuddy have
more authority than us and always will. They do not publish measured answers
to creator questions, they publish advice. That gap is the whole business case
for this blog.

Every article should read like it was written by someone who went and counted,
because it was.

### The one test

**Could a competitor without our database have written this article?**

If yes, do not write it. There are a hundred sites publishing the same advice
with more authority, and [Part 2](#part-2--the-diagnosis-verified-2026-08-13)
shows what happens when we compete with them on their terms: position 51 to 67,
zero clicks, across every commercial cluster.

This test replaces the template. It is not a style rule, it decides whether the
article exists at all:

- "18 comedy video ideas" fails. Anyone can list ideas.
- "18 comedy video ideas, plus what 699 comedy uploads since Jan 2025 show
  about length, cadence and format mix" passes, but only if the sample is real.
- Comedy's cadence figure rests on **13 channels**, which is too thin to
  publish. That is a fail, and the honest fix is dropping the figure, not
  caveating it twice in the body.

### The data floor

A measured figure is publishable when it clears all four:

| Rule | Threshold |
|---|---|
| Channels behind the figure | 30 minimum. Below that, do not publish it. |
| Videos behind the figure | 500 minimum for a length/format claim. |
| Date filter | `published_at >= '2025-01-01'`, always. `channel_videos` spans 2006-2026 and is NOT bounded by the collection window. |
| Median alongside mean | Both, always. Study #1's niches skew up to 3.83x. |

Never write "we analysed X channels" without running the count first. A
fabricated proprietary-data claim is the one mistake that would cost more than
it earns.

### What this means for structure

**Article structure comes out of the research file, never out of the last
article.** Two posts in the same cluster should only share a shape if their
SERPs genuinely share a shape. No fixed idea counts, no fixed FAQ counts, no
reusable skeleton. The previous version of this file specified "18 numbered
titles, 8 FAQs" as a template, which was wrong and is deleted.

### Voice

**The reference post is `/blog/youtube-demonetization`.** Named by the user
2026-08-14. When the voice is in question, open that post and match it. Before
this, "house voice" was asserted in four files and pinned to no example, which
is why it drifted.

What makes it the standard: **authoritative, and no fluff.** Concretely, from
measuring it against a post that had drifted:

- **The first sentence carries information, not a hook.** Demonetization opens
  by naming all five problems, then states the consequence flat: "Each one
  carries its own fix and its own deadline." No rhetorical opener, no scene
  setting.
- **No roadmap paragraph.** Never tell the reader what the article is about to
  do. Two paragraphs of intro, then the first H2.
- **Declarative.** State the claim. Do not hedge it, and do not soften it with
  "the practical answer is", "there is an argument that", "it is worth noting".
  Where a claim cannot be backed, cut it rather than hedging it. Honesty about
  sourcing belongs in one clear disclosure, not sprinkled per sentence.
- **Never restate.** If paragraph two makes the same point as paragraph one in
  different words, delete one.

Measurable targets, taken from the reference:

| | Reference |
|---|---|
| Hedge phrases per post | ~2 |
| Paragraphs opening with a bolded clause | ~5, never most of them |
| Paragraph length | 3 to 4 rendered lines, 5 max, verified with `check-blog-paragraphs.mjs` |

Also: US English, dollars, US reader assumed throughout. The remaining
per-rule detail lives in `CLAUDE.md` and memory and is not restated here,
because restating rules in a fifth file is the patching problem.

---

## PART 2 — THE DIAGNOSIS (verified 2026-08-13)

### The one number that matters

**Tier-1 (US/UK/CA/AU) active users: 196 over 28 days. Seven per day.**

The product is $19 to $149/month behind a pay-before-signup wall. Traffic that
cannot buy is close to worthless. Every decision here is judged against that
seven, not against total sessions. Total sessions look like 1,534. That number
is misleading and should not be used.

### 1. Most traffic is not real or not useful

| Channel | Sessions (28d) | Reality |
|---|---|---|
| Direct | 701 | 93% first-time visitors. Largely bots (see below). |
| AI Assistant | 579 | Real, but skews low-tier. |
| Organic Search | 232 | Only 15% of sessions. |

Geography: **48.2% low-tier, 16.4% tier-1, 7% Western Europe.** Top low-tier
sources are India (249), Vietnam (86), China (72), Pakistan (48),
Bangladesh (39).

### 2. A large share of Direct is bot traffic

| | Users/day | Avg engagement |
|---|---|---|
| Spike days (Jul 26-31) | 92, 117, 120 | 8.8s |
| Quiet days | 29-40 | 33.0s |

Real traffic spikes do not collapse engagement 4x. Site-wide: 1.22
pages/session, 15% scroll rate, 87% first-visit. The July 26-31 spike was bots,
and benchmarking against it made a normal month look like a collapse.

### 3. Every commercial article cluster is authority-gated and earns nothing

| Cluster | Queries | Impressions | Clicks | Position |
|---|---|---|---|---|
| Keyword research | 149 | 11,848 | 0 | 51.6 |
| Competitor | 27 | 730 | 0 | 67.5 |
| Thumbnail | 11 | 326 | 0 | 65.4 |
| YouTube SEO | 42 | 2,835 | 1 | 56.2 |
| Analytics | 57 | 1,549 | 2 | 52.6 |
| Brand (ytgrowth) | 4 | 188 | 42 | 2.5 |

42 of 429 total clicks come from people already searching the brand name.
Page-1 competitors are vidIQ, TubeBuddy, Ahrefs, Semrush, Wix.

### 4. The tier-1 opportunity is gated on links, not content

The US alone is 53,249 impressions (40% of all site impressions) at position
28.78, converting 58 clicks. The demand is there; the ranking is not.
`MEDIAVINE.md` found this on 2026-07-10, did full on-page passes across every
high-impression US page on 07-11 and 07-13, and positions did not move. Its own
conclusion, still correct: **the gate is authority (backlinks), not on-page
work.** Do not redo on-page work on these pages expecting a different result.

### 5. Publishing stopped for a structural reason

Commits touching posts.jsx: 63 in May, 27 in June, 14 in July, 4 in August.
Both mapped clusters completed 2026-08-08 and nothing was queued behind them.
An empty plan file produces an empty schedule.

### 6. The keyword-cluster model is close to exhausted

Three consecutive research rounds came back mostly dead:

| Round | Result |
|---|---|
| 2026-07-28 | Subscribers, channel growth, live streaming, merch, playlists, end screens and the entire commercial track, all dropped. |
| 2026-08-13 | Video-ideas niches mostly too thin; only gaming clearly survived. |
| 2026-08-14 | `youtube equipment` and `youtube automation` dropped; `youtube sponsorship` yields one post, not a cluster. |

The dropped log in `FOUNDATION.md` is now longer than the confirmed list. The
obvious creator-advice topics are either already covered by the 62 live posts,
owned by DR-80+ incumbents, or polluted with watch intent.

**Do not pull a fourth seed.** That repeats the motion and returns the same
result. This finding is what makes Part 1 necessary: the way forward is data we
own, not keywords we find.

---

## PART 3 — THE RUNBOOK

**This is the only content process. `SEO-OPTIMIZATION-CHECKLIST.md` was folded
into it on 2026-08-14 and is now a stub.** A process split across two files got
skipped for a month.

### Why this exists in this shape

The 2026-08-14 session cost far more than it should have. The causes, so the
runbook can be judged against them:

| What happened | Cost | Fixed by |
|---|---|---|
| One article reviewed in six separate rounds (tables, then sourcing, then voice, then headline, then cover, then a date bug) | 6x re-read and re-measure of the same file | Stage 3: run the WHOLE standard before showing anything |
| Turns spent diagnosing contradictory plan files instead of working | 3 turns | One plan file, this one |
| Re-derived what "house voice" means from scratch | 2 turns | Voice reference named in Part 1 |
| Four consecutive replies ended in a question instead of an action | 4 turns | Stage 0 defaults |
| No way to tell what was already done | rework | The research file doubles as the state file |

**The single most expensive mistake is presenting partial work.** Every partial
present costs a full review round. Do the complete pass, then present once.

### Stage 0 — Session start (read exactly two files)

1. This file.
2. `research/<slug>.md` for the article in flight, if there is one. Its
   `Status:` line says where things stand. If there is no article in flight,
   the queue in Part 4 says what is next.

Do not read `FOUNDATION.md`, `MEDIAVINE.md`, `DATA-STUDIES.md`, `HANDOVER.md`
or the memory index unless this file sends you there for a specific reason.
Grep-wandering across eleven markdown files at session start is a real and
recurring cost.

**Defaults, so no turn is spent asking:**

- Next article is the top unstarted row of the queue in Part 4. Start it.
- Never ask which of two approaches to take. Pick the one this file implies,
  state the choice in one line, proceed.
- Never ask for permission to run `gen-blog-meta.js`, a verification script, or
  a screenshot. Just run them.
- Only two things genuinely require asking: **approval of the research file and
  outline** (Stage 2), and **the go-ahead to push** (Stage 5).

### Stage 1 — Research

Fill `research/<slug>.md` from `research/TEMPLATE.md`. **No research file, no
article.** The research rule previously lived in four files and was skipped
anyway, because skipping left no trace. A missing file leaves a trace.

- Fetch the live top 10. Real URLs, opened this session, dated in the file.
  Never cite a source that was not fetched: two domains were fabricated on
  2026-07-28.
- Build the coverage matrix. Cover the UNION of competitor sections, not the
  intersection. Compare your section count against the strongest competitor.
- Name the gap, and what we can answer from our data that they cannot.
- Answer the one test from Part 1 in writing. If a competitor without our
  database could write this, stop. A rejected research file is a success.
- Run the data pull. Check every figure against the data floor in Part 1.
  Figures that fail the floor get dropped, not caveated.

### Stage 2 — Present and wait

Present the research file and the outline. **Wait for approval.** This is one
of only two blocking gates.

### Stage 3 — Write the whole standard in one pass

Write against every item below on the first draft. Do not write first and clean
up after: that is what produced six review rounds on one article.

**Substance**
- Structure comes from the matrix, never from the previous article's shape.
- No fixed idea counts, no fixed FAQ counts, no reused skeleton.
- Every claim is either measured or plainly reasoned. Never dress judgement as
  data: a ranking column in a table next to a measured table reads as measured.
- Where a claim cannot be backed, cut it. Do not hedge it. Hedging is fluff and
  is not the same thing as honesty. Put sourcing honesty in ONE disclosure.

**Voice** (reference post: `/blog/youtube-demonetization`)
- First sentence carries information, not a hook.
- No roadmap paragraph. Two intro paragraphs, then the first H2.
- Declarative. Target ~2 hedge phrases for the whole post.
- Never restate a point in different words.
- Paragraphs 3 to 4 rendered lines, 5 max.
- Bold-lead paragraphs: about 5 per post, never most of them.
- Banned: "actually" (check headings too), em-dashes, italics, the word "land"
  in its figurative sense, generic "Final Thoughts" or "Conclusion" endings.
- Grep existing intros before finalising a new one. No repeated opening move.
- US English, dollars, US reader.

**Ideas and lists**
- List items use the house format: `<li><strong>N. "Title"</strong><br />two or
  three sentences of real explanation.</li>`. Never a bare table cell. A
  4-column table of 40 rows is unreadable on mobile and contains no writing.

**Furniture**
- `CtaCard` mid-article, never at the end.
- Internal links both directions: link out to the pillar and siblings, and add
  at least one inbound link from an existing relevant post.
- Cover image needed: say so explicitly. Never generate one.

**Metadata, all in the same pass**
- `excerpt` in posts.jsx. Feeds the visible dek AND the JSON-LD description.
- `seoMeta.js`: title <=60 chars, description <=155. Measure, do not eyeball.
- `faqs` array mirrors the visible FAQ section word for word. Same count, same
  order, same text. Read both blocks side by side. Escaping differs (JS string
  needs `\'`, JSX text does not) but the rendered words must be identical.
- `sitemap.xml` entry with today's `lastmod`.
- `llms.txt` entry. Live acquisition channel, not an afterthought. Write it
  from the page's own verified content, never from a hub or marketing blurb.
- `updated` date bumped when revising an existing post.
- `readTime` roughly matches the word count.
- Prerender route is automatic via `discoverBlogSlugs()`. Nothing to add.

### Stage 4 — Verify before presenting, every time

```bash
cd frontend
npx eslint src/blog/posts.jsx            # must show no "Parsing error"
node scripts/gen-blog-meta.js            # always, no asking
npm run dev                              # then, in another shell:
node scripts/verify/check-blog-paragraphs.mjs <slug> 5 <port>
```

- [ ] Parses clean. A scripted edit to the `faqs` array has broken this file
      twice with an unescaped apostrophe. Always lint after one.
- [ ] Zero paragraphs over 5 lines.
- [ ] FAQ array count equals visible `<h3>` count, and the text matches.
- [ ] Grep the post for: "actually" (case-insensitive), em-dashes, figurative
      "land", British spellings.
- [ ] Cover file exists, is a 1600x900 JPG around 100 to 150KB, and the page
      loads it with no failed requests. Convert and delete any PNG source.
- [ ] Screenshot desktop AND mobile, and actually read them. The 42-ideas-in-
      tables problem was invisible in source and obvious in one screenshot.
- [ ] Counts against the reference post: tables, bold-lead paragraphs, hedges.

**Then present once, with the numbers.** Not a partial fix.

### Stage 5 — Build and deploy (only on explicit go-ahead)

- `BUILD_API_URL=https://ytgrowth.io npm run build`. Never the bare build, or
  every `/youtube-stats/*` page ships an empty leaderboard.
- Railway serves the committed `frontend/dist/`. Every `src` change needs a
  rebuilt dist in the same commit. Never `git checkout -- dist/`.
- Stage files by name. Never `git add -A`.
- Verify live by checking for a specific new phrase, not just an HTTP 200.
- Request indexing in Search Console.

### Definition of done

An article is done when Stage 4 passes with every box ticked, the research file
`Status:` reads `approved`, and Stage 5 has been run and verified live. Not
before. "The tables are fixed" is not done.

### Publishing

Every new route ships in ONE commit: source page, `prerender.js`
`buildRoutes()`, sitemap entry, llms.txt entry, rebuilt dist, cover image.
Missed three times. Slugs are 2 to 4 words.

---

## PART 4 — THE QUEUE

One list. Work top to bottom. Nothing enters without real Keyword Planner
volume, a passed SERP check, and a route through the one test.

| # | Article | Slug | Volume | Status |
|---|---|---|---|---|
| 1 | Cooking video ideas | `cooking-video-ideas` | 1,550/mo | **NEXT.** 3,859 videos, 75 channels. Clears the data floor. Needs research file. |
| 2 | Tech video ideas | `tech-video-ideas` | 1,300/mo | Validated 08-13. Verify channel count against the data floor first. |
| 3 | Music video ideas | `music-video-ideas` | 950/mo | Validated 08-13. Verify channel count against the data floor first. |
| 4 | Title-length study, folds INTO `/blog/youtube-title` | n/a | n/a | Angle confirmed 08-14. Needs 2 SQL pulls joining `video_metric_snapshots` to `channel_videos.title`. |
| 5 | Companies that sponsor YouTubers | `youtube-sponsor-companies` | 5,500/mo | Weak confirm. Only write with a differentiator, see below. |
| 6 | Promotion pass on the published studies | n/a | n/a | User is sourcing leads and will bring them. Do not pursue unprompted. See `OUTREACH.md`. |

**Item 1 is next, not comedy.** Comedy has higher volume (1,650/mo) but only 13
channels of data, which fails the data floor in Part 1. A comedy draft exists
uncommitted and is unresolved, see Part 5.

**Item 4 is the strongest item on this list.** Three published studies
contradict each other (AIR Media-Tech says 30-50 chars, 10xCreator says 70-100,
ViewsKit says under 30). Nobody has reconciled them and we can test the
performance claim directly. It passes the one test outright. It goes INTO the
existing post, since `/blog/youtube-title` already owns that intent and a
separate page would split authority the same way the three-way keyword-research
split did.

**Item 5 caveat.** The SERP has real independents so it passes the diversity
test, but OutlierKit ranks there on original sponsor data we do not have.
Without a differentiator it fails the one test and should be dropped.

### After item 6

The queue is empty and a fourth keyword seed will not refill it (Part 2, item
6). The next decision is strategic, and the three real levers are already
known: original-data studies, programmatic expansion on the patterns that
already rank (`/youtube-stats/*` and `/youtube-earnings/*` sit at position 7-12
and are the best per-page performers), and authority/backlinks for the 53K
tier-1 US impressions. All three are in Part 1's direction. None of them is a
keyword round.

---

## PART 5 — OPEN AND UNRESOLVED

**The comedy draft.** 371 uncommitted lines in `posts.jsx`, plus seoMeta,
postsMeta, llms.txt and sitemap entries already added, with no cover image and
no mid-article CTA. It was written out of order, with no research file, on a
sample that fails the data floor. Not deleted, not shipped. Decide before
touching the queue: either cut it back to what the data supports and finish it
properly, or park it and revert the four plumbing files so nothing half-published
leaks.

**The parked gaming ideas file.** `frontend/src/data/youtubeVideoIdeas.js`,
still untracked, superseded by `/blog/gaming-video-ideas` shipping 2026-08-13.
Delete it or ignore it; it is not a queue item.

---

## Shipped

| Date | Article | Type |
|---|---|---|
| 2026-08-13 | Gaming Video Ideas (`/blog/gaming-video-ideas`) | Cluster spoke |
| 2026-08-13 | `/blog/best-time-to-post` upgraded with cadence + day-of-week data | Upgrade |
| 2026-08-13 | Ideal YouTube Video Length (`/blog/video-length-by-niche`), corrected same day for the date-filter bug | Data study #1 |
| 2026-08-08 | YouTube Vlog Ideas | Cluster spoke |
| 2026-07-28 | Shorts Ideas, Challenge Ideas, Start a Channel, Phone Channel, Brand Account, Gaming Channel | Cluster, 6 posts |

### Completed clusters (do not re-propose)

**Video Ideas** (mapped 2026-07-28): pillar `youtube-video-ideas`,
`youtube-shorts-ideas`, `youtube-challenge-ideas`, `youtube-vlog-ideas`,
`gaming-video-ideas`.

**Starting a Channel** (mapped 2026-07-28): pillar `start-youtube-channel`,
plus `youtube-channel-phone`, `youtube-brand-account`,
`gaming-youtube-channel`.

---

## Deferred and rejected

**Combo layer restore (14 niches x 4 tier-1 countries, ~112 pages). DEFERRED
2026-08-13.** Components are 11-line redirect stubs; bodies are recoverable
from git history near commit 56b574f74. The case for restoring was citable
surface for AI assistants. That case is now against it: AI traffic skews
low-tier, so this manufactures more traffic that cannot buy.

Correcting a misleading comparison made during that analysis, so nobody
rebuilds a plan on it: per page the combos were **worse** than the hubs.

| | Pages | Clicks/page (3mo) | Impressions/page | Position |
|---|---|---|---|---|
| Combo (retired 07-09) | 176 | 0.57 | 77 | 8.6 |
| Hub (kept) | 27 | 2.07 | 240 | 12.8 |

Restoring all 126 recovers roughly 1 click/day. The July session drop was never
a combo-cut story.

**Mediavine. ABANDONED 2026-08-13** (user started a separate niche site). The
tier-1 preference survives for a more durable reason: the paywall.

**Commercial keyword track. DEAD 2026-07-28.** vidiq alternative, youtube
channel audit tool, vidiq pricing all returned Keyword Planner's lowest volume
bucket. The real commercial volume is held by four live posts (vidiq-review,
tubebuddy-vs-vidiq, seo-tools-for-youtube, youtube-keyword-research-tools). If
commercial intent needs more coverage, it is a CRO pass on those four, not new
pages.

**Dead seeds, do not re-propose:** tool comparisons, vidiq alternative,
vidiq/tubebuddy pricing, channel audit tool, youtube subscribers, channel
growth, live streaming, merch, playlists, end screens, youtube equipment,
youtube automation.

---

## What NOT to do

- Do not write an article that fails the one test in Part 1.
- Do not write an article without a research file.
- Do not publish a figure that fails the data floor. Caveating a thin sample is
  not a substitute for having the data.
- Do not reuse a previous article's structure. Derive it from the matrix.
- Do not do more on-page work on the authority-gated pages expecting rank
  movement. It was done across every high-impression US page in July and did
  not work.
- Do not write articles targeting keyword research, YouTube SEO, competitor
  analysis, analytics, or thumbnail head terms.
- Do not build a page or page dimension named after a low-tier country.
- Do not optimize for total sessions, AI-assistant volume, or Direct.
- Do not ship a programmatic page without page-specific substance. Thin content
  is what got 126 URLs deleted on 2026-07-09.
- Do not confuse an article at a programmatic URL for a programmatic page. If a
  human writes the body for every slug, it is an article and belongs in `/blog`.

---

## Measurement

Monthly. The metric is tier-1 active users per day and referring domains
earned. Not total sessions, not GSC position (15% of traffic), not
AI-assistant volume.

---

## Keyword research on file

`keyword-exports/Keyword Stats 2026-08-13 at 00_05_13.csv` (seed: "youtube
video ideas", 2,232 rows, UTF-16 tab-delimited), plus three 2026-08-14 exports
for the sponsorship, equipment and automation seeds.

- Only 86 keywords clear 500/mo. The niche-modified long tail sits at 50/mo.
- Channel-name intent is the biggest cluster at 48,700/mo across 268 keywords,
  but **91% is generic head terms** (44,500/mo) already targeted by
  `/tools/youtube-channel-name-generator` at position 64.5. Authority-gated.
- Video-ideas niches surviving an intent check: gaming (2,850/mo), comedy
  (1,650), cooking (1,550), tech (1,300), music (950).
- **vlogs (8,250/mo) excluded**: `/blog/youtube-vlog-ideas` shipped 2026-08-08
  and a second page would cannibalize it.
- **diy/crafts (4,200/mo) excluded**: watch intent, not creator intent.

CSV encoding note: Keyword Planner exports are UTF-16, tab-delimited, with two
header lines before the real header. Read with `open(f, encoding='utf-16')`,
skip 2 lines, then `csv.DictReader(delimiter='\t')`.

---

## Honest limits

Authority takes months, not weeks, and `FOUNDATION.md` established that the
commercial keyword volume in this niche is thin. If revenue is needed sooner
than authority can deliver, that is a paid-acquisition or business-model
question on a separate track. Content will not solve it on that timeline. Do
not let this file imply otherwise.
