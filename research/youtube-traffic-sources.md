# Research: youtube-traffic-sources

Plan entry: `#1` · Feature: Channel Audit / Weekly Report · Anchor post: `/blog/youtube-analytics`
Target query: `youtube traffic sources explained` (+ `direct or unknown traffic source`, `youtube browse features meaning`, `youtube suggested videos traffic source`, `how to increase browse features youtube`, `youtube traffic source types`)
Researched: 2026-09-04
Status: verified, ready to push (awaiting go-ahead)

Volume not required (site standard). Confirmation is GSC position 8.4-10.9
across 4 real query variants with real impressions and no dedicated page
(see `CONTENT-PLAN.md` #1), plus a passing SERP check on all 6 variants
pulled 2026-09-03 (`research/rounds/entry-01-queries-summary.txt`).

---

## 1. Search intent

Dominant intent: **definitional**, with a **procedural** tail.

What the reader wants in the first screen: a plain-language explanation of
what each line in the YouTube Studio "Traffic sources" card means, because
the in-product labels (Browse features, Suggested videos, Direct or unknown)
are jargon with no explanation attached in Studio itself. Several query
variants ("how to increase browse features") show a chunk of readers already
know what the label means and want to act on it.

What the article must therefore open with: define the traffic-source system
in one paragraph (there are 17 official categories, most readers only see
6-8 populated), then immediately answer the question every competitor
ducks: what's a healthy split, with real numbers.

Second intent, procedural, served in: a dedicated section per source with
one action a creator can actually take, not buried in prose.

---

## 2. The live top 10

Union across all 6 query variants pulled 2026-09-03, deduplicated.

| # | URL | Domain | Date published | Words | Read in full? | Section headings |
|---|---|---|---|---|---|---|
| 1 | humbleandbrag.com/blog/youtube-traffic-sources | humbleandbrag.com | not visible on page | ~2,200 | yes | Discovery Engine (Browse/Suggested) · Intent Engine (Search/External) · Engagement Engine (Shorts) · 4 Channel Archetypes · Healthy Split |
| 2 | support.google.com/youtube/answer/9314355 | Google (official) | not dated | ~900 | yes | 17 traffic-source definitions, no benchmarks |
| 3 | databox.com/metric-library/.../views-by-traffic-source | databox.com | not visible | ~240 | yes | metric definition only, no per-source detail |
| 4 | reddit.com/r/letsplay/.../what_are_your_traffic_sources | Reddit | 2017 (old thread, still ranking) | forum | yes (via Serper snippets, WebFetch blocked on reddit.com) | real creator % splits in replies |
| 5 | tella.com/definition/traffic-sources | tella.com | 2026-05-28 | ~690 | yes | 4 Q&A sections, 8 sources named, no benchmarks |
| 6 | socialvideoplaza.com/.../traffic-sources-explained | socialvideoplaza.com | not visible | not measured | yes (earlier this session) | per-source list, one ad-specific trigger note |
| 7 | tubeanalytics.net/blog/.../actually-mean-reddit-4 | tubeanalytics.net | not visible | not measured | yes | AI-marketing-filler page; unverifiable growth claims, no real Reddit citations despite the URL slug |
| 8 | blogpros.com/traffic-sources-listed-unknown/ | blogpros.com | fetch timed out twice | — | no | not read; genuinely inaccessible this session |
| 9 | reddit.com/r/youtubers/.../direct_or_unknown | Reddit | not visible | forum | yes (via Serper snippets) | direct-or-unknown cause discussion |
| 10 | yttalk.com/threads/traffic-sources-what-is... | yttalk.com forum | not visible | forum | no, snippet only | not opened directly, lower priority than the two Reddit threads |

Read in full: 7 of 10 (2 via Serper snippets since WebFetch cannot reach
reddit.com — documented site limitation, not a shortcut). Top 3 all read: yes.

SERP character: the plan entry's `top3:` (humbleandbrag, support.google,
databox) holds. No DR-80 incumbent (no vidIQ, TubeBuddy, HubSpot, Backlinko)
anywhere in the union across all 6 variants. This is a beatable SERP: the
strongest page (humbleandbrag) is a small independent blog, and two of the
top 3 pages structurally cannot compete on depth (Google's own page has no
benchmarks by design; Databox's is a one-paragraph metric glossary entry).

---

## 3. Coverage matrix

| Section | humbleandbrag | Google Help | Databox | Reddit (2 threads) | tella.com | Ours? |
|---|---|---|---|---|---|---|
| What a traffic source is (1-paragraph) | yes | yes | yes | no | yes | yes |
| Full list of all 17 official categories | no (covers 5) | yes (all 17) | no | no | no (covers 8) | yes |
| Browse features definition + how it works | yes | yes (1 line) | no | implied | yes (1 line) | yes |
| Suggested videos definition + how it works | yes | yes (1 line) | no | implied | yes (1 line) | yes |
| YouTube search | yes | yes (1 line) | mentioned | no | yes (1 line) | yes |
| External traffic | yes | yes (1 line) | mentioned | no | yes (1 line) | yes |
| Direct or unknown: what causes it | no | yes (1 line) | no | **yes, deep** | yes (1 line) | yes |
| Direct or unknown: is a high % bad | no | no | no | **yes, real numbers** | no | yes |
| Shorts feed as a traffic source | yes | yes (1 line) | no | no | no | yes |
| Notifications | no | yes (1 line) | no | no | no | yes |
| Playlists | no | yes (1 line) | no | no | yes (1 line) | yes |
| Channel pages / end screens / video cards | no | yes (1 line each) | no | no | no | yes, condensed |
| Benchmark % for what's "healthy" per source | yes, one table | no | no | **yes, real creator #s** | no | yes |
| Real Browse-vs-Suggested CTR comparison | no | no | no | **yes (10-12% vs 0.6%)** | no | yes |
| 4-archetype reading of your own split | yes | no | no | no | no | no (see gap notes) |
| How to increase browse features specifically | no | no | no | partial | no | yes |
| Product tie-in (own-channel data) | no | no | no | no | no | yes (unique) |

Section counts: strongest competitor (humbleandbrag) 8 H2-level sections.
Ours: 12 planned (see outline). Higher because the official-17-category list
and the direct-or-unknown deep dive are union sections no single competitor
carries in full.

---

## 4. What the top 10 gets wrong

**A claim the ranking pages repeat that is false or unverifiable:**
tubeanalytics.net (ranks position 8-9 across variants) presents itself via
its URL as citing real Reddit discussion ("...actually-mean-reddit-4") but
contains zero actual Reddit links or quotes, and its cited numbers ("revenue
increased 127% after optimizing for high-CPM topics", "2-3x faster growth
within 2-4 weeks") are unsourced and generic enough to be templated
AI-marketing copy, not measured findings. This is worth naming directly: it
is exactly the kind of unverifiable proprietary-sounding claim `FOUNDATION.md`
warns against fabricating, printed by a competitor as fact.

**Questions the SERP asks that nobody in the top 10 answers with real numbers:**
- "Is my Direct or Unknown percentage normal?" — Google's help page defines
  the category but gives zero benchmark. **We can answer this**: real
  creators self-report 1.3%-3.0% as their steady-state number (multiple
  independent Reddit threads, not one outlier), with r/PartneredYoutube
  explicitly flagging high external as the actual red flag, not direct.
- "Is Browse Features actually better than Suggested Videos?" — no
  competitor gives a real comparison. **We can answer this**: creators in
  r/NewTubers report Browse Features CTR at 10-12% versus Suggested Videos
  at 0.6-0.64%, with an explanation (Suggested's thumbnails render small in
  a sidebar, which structurally caps CTR regardless of thumbnail quality).
  This is the single most citable number in this research.
- PAA "What does 'direct or unknown traffic source' mean on YouTube?" is
  answered adequately by Google and tella.com already; not a gap.
- PAA results also surfaced unrelated noise (the "$10,000/month views"
  and "7-second rule" questions are cross-contamination from other queries
  in this niche, unrelated to traffic sources; correctly excluded).

**Stale pages in the top 10:** the Reddit thread at position 4 for the
primary query dates to 2017 and still ranks, meaning the SERP tolerates old
UGC when it has real numbers in it. That is itself informative for the
article's own credibility bar: real numbers outrank recency here.

**What we can answer from our own tables that they structurally cannot:**
None. This is a diagnostic post, not a data study; the differentiator is
sourced from real creator-reported numbers (Reddit) that no competitor
compiled, not from our proprietary tables. The one test below is answered on
that basis, consistent with how the plan already treats diagnostic posts
(`FOUNDATION.md` → "The second test").

---

## 5. The one test (adapted: the second test, this is a diagnostic post)

> Is this a question a creator types when something is confusing, is the
> top 3 led by forums/small sites rather than DR-80 authority, and does the
> answer send the reader to a named product feature?

Answer: **Yes on all three.** Confusing (jargon with no in-product
explanation); top 3 is humbleandbrag/Google/Databox, no DR-80 incumbent;
sends the reader to Channel Audit / Weekly Report, which surfaces their own
traffic-source split with a verdict, exactly the "healthy split" judgment
this SERP fails to give with real numbers.

---

## 6. The data pull

Not applicable. This is a diagnostic post with no proprietary-data claim; the
"our own data" gap is intentionally not filled here (see section 4). No SQL,
no data floor check required.

---

## 7. Outline

Working title: **YouTube Traffic Sources Explained: What's Normal, and What
to Fix First**
Slug: `youtube-traffic-sources`
Angle in one sentence: Google names 17 traffic-source categories and
explains none of them in Studio; this piece explains all 17 in plain
language, then gives the real-number benchmarks (Browse-vs-Suggested CTR,
Direct-or-Unknown "normal" range) that no competitor has compiled.

- H2: What a Traffic Source Is (and Why Studio Doesn't Explain It)
  - 1-paragraph orientation; states there are 17 categories, most channels
    populate 6-8
- H2: The Full List of YouTube Traffic Sources
  - condensed table of all 17 from the Google Help page (fills the union gap
    no independent blog covers)
- H2: Browse Features vs. Suggested Videos, the Real CTR Gap
  - leads with the 10-12% vs 0.6-0.64% real numbers and why (sidebar
    thumbnail size), answers "how to increase browse features"
- H2: YouTube Search and External, the High-Intent Sources
  - what each means, condensed vs. competitors since this is well-covered
    ground
- H2: Direct or Unknown, What It Actually Means
  - Google's own definition plus the real cause list from the Reddit thread
- H2: Is Your Direct-or-Unknown Percentage Normal?
  - the 1.3%-3.0% real-creator range, and the actual red flag (high
    external, not high direct), sourced to r/PartneredYoutube
- H2: Shorts, Notifications, Playlists, and the Smaller Sources
  - condensed, since no competitor differentiates meaningfully here
- H2: What a Healthy Traffic-Source Split Looks Like
  - synthesizes the numbers above into a practical read, without inventing
    a percentage table we cannot source (humbleandbrag's benchmark table is
    unsourced marketing copy; we do not repeat that pattern)
- H2: Frequently Asked Questions
  - PAA-sourced, mirrored per the FAQ-schema house rule

Internal links out: anchor post `/blog/youtube-analytics` (per the link map),
plus forward to entries #37 (browse vs. suggested) and #89 (external
traffic) once those ship, per their scope notes which name this entry as the
overview they build on.

Mid-article CTA: Channel Audit — "see your own traffic-source split with a
verdict on what to fix first," placed after the Browse-vs-Suggested section
since that is the highest-curiosity point in the piece.

Cover image needed: yes. A creator looking at the YouTube Studio Analytics
"Traffic sources" tab on a laptop, matching the site's photographic
creator-at-work style. Exact prompt to be written once outline is approved
(per house cover-image process, prompt only, user generates the image).

---

## 8. Approval

Presented: 2026-09-04
Outcome: approved
Notes: approved as-is, no changes requested

---

## 9. Stage log

- [x] Stage 1, research file complete
- [x] Stage 2, presented and approved
- [x] Stage 3, written against the full standard in one pass
- [x] Stage 4, verified: paragraphs <=5 lines (28/28 pass), FAQ array mirrors
      visible exactly (6/6, checked programmatically), drift check 0
      failures (banned "actually" caught and fixed, 4 uses), desktop and
      mobile screenshots read and look correct, anchor post
      (`youtube-analytics`) linked back in the same pass and its own
      paragraph check still passes
- [x] Stage 5a, cover resized to 1600x900 JPG (131KB), source PNG deleted,
      coverAlt corrected to describe what the image actually shows, sitemap
      and llms.txt entries added (llms.txt numeric claims re-verified against
      the article text after writing), full production build run: 124 routes
      prerendered (up from 123), title tag and FAQPage schema confirmed
      present in the built HTML, cover path confirmed correct in the
      prerendered output
- [ ] Stage 5b, push and go live — BLOCKED on explicit user go-ahead only.
      Nothing else remains.

Outstanding for this article:

- Not pushed. `frontend/dist/` output is generated but untracked; per the
  session's own prior incident (new articles 404'd because dist/ was never
  committed), this must be staged in the same commit as the source changes,
  not assumed.
- blogpros.com never loaded (timed out twice) during research; not a
  blocker, its content on "direct or unknown" is covered more deeply by the
  two Reddit threads that did load.
