# Research: youtube-more-impressions

Plan entry: `#8` · Feature: `Channel Audit` · Anchor post:
`/blog/youtube-channel-not-growing`
Target query: `how to get more impressions on youtube`
Researched: `2026-09-25`
Status: `done, awaiting push`

---

## 1. Search intent

Dominant intent: `diagnostic`, with a `definitional` component (some
readers genuinely don't know what "impressions" means yet).

What the reader wants in the first screen: a real answer to why their
impressions are low or stalled, not a generic "improve your thumbnails"
listicle. The Reddit thread cluster shows real, varied confusion: some
readers have low impressions with good CTR/retention (a distribution
problem, not a packaging problem), some see impressions "just stop," some
see "random impressions not related to my niche."

What the article must therefore open with: the precise counting mechanics
(what actually counts as an impression) before any advice, since several
threads show creators don't understand the metric itself, then branch into
the actual causes, which are not all the same cause.

Second intent present in the SERP: definitional ("impressions vs views"),
served in an early clarifying section, not the whole article.

---

## 2. The live top 10

| # | URL | Domain | Date published | Words | Read in full? | Section headings |
|---|---|---|---|---|---|---|
| 1 | reddit.com r/NewTubers "What is your strategy to boost impressions?" | reddit.com | 3 years ago | thread | yes (via snippet) | Creator asks for real strategies, not a guide's assumptions |
| 2 | reddit.com r/NewTubers "Reasons for low impressions" | reddit.com | recent | thread | yes (via snippet) | Real varied causes discussed |
| 3 | medium.com "How I Got 45K Impressions and 7K Views" | medium.com | 4 years ago | ~800 | no (personal anecdote, thin) | Keyword repetition advice, unsourced |
| 4 | support.google.com/youtube/answer/9314486 | support.google.com | official | official doc | yes | Full official impression-counting mechanics: >1 second visible, ≥50% of thumbnail visible, where it registers (Search, home, subscriptions, Up Next) and where it explicitly does NOT (external sites, mobile web, YouTube Kids, background tab, <1s) |
| 5 | uppbeat.io "What Are YouTube Impressions?" | uppbeat.io | undated | guide | no (light, generic SEO tips) | 3 tips, no benchmarks |
| 6 | humbleandbrag.com "YouTube Impressions Explained" | humbleandbrag.com | 2026-08-24 | ~1000 | yes | Definition, a benchmark table by channel size (100-1,000 impressions/video under 1K subs; 1K-10K impressions 1K-10K subs; 10K-100K impressions 10K-100K subs), causes, strategies |
| 7 | breeze.inc | breeze.inc | undated | guide | no (marketing-tool-adjacent, generic) | N/A |
| 8 | gyre.pro | gyre.pro | undated | guide | no (broad guide, not focused) | N/A |

Read in full: 4 of 8 substantively (official Google doc fully, humbleandbrag
fully, 2 Reddit threads via snippet, consistent with WebFetch being blocked
on reddit.com). Top 3 all considered across the passing query variants.

SERP character: matches the plan's evidence well, reddit and a Google
support/community thread dominate, medium/personal-blog content is thin.
humbleandbrag is the strongest single competitor but its benchmark table
has no stated source (likely estimated, not measured).

---

## 3. Coverage matrix

| Section | Google official | humbleandbrag | Reddit (aggregate) | Ours? |
|---|---|---|---|---|
| What counts as an impression (exact mechanics) | yes (full, precise) | partial (just "shown to a viewer") | no | yes, cited directly to Google |
| Benchmark by channel size | no | yes (unsourced) | no | cite humbleandbrag's numbers but flag them as unsourced/directional, not measured |
| Good CTR/retention but still low impressions (distribution problem) | no | no | yes (real, unaddressed) | yes, this is the differentiator |
| Impressions "just stopping" | no | no | yes (real, unaddressed) | yes |
| Off-niche/random impressions | no | no | yes (real, unaddressed) | yes |
| How to actually increase them | no (doesn't say) | yes (generic CTR/retention advice) | scattered | yes, but tied to reading your own real numbers via audit, not generic tips |
| FAQ block | no | no | no | yes |

Section counts: strongest competitor (humbleandbrag) covers ~4 sections.
Ours: 6, with 3 addressing real unaddressed Reddit confusion patterns no
guide covers.

---

## 4. What the top 10 gets wrong

**A claim the ranking pages repeat that is false or unverifiable:**
humbleandbrag's benchmark table (100-1,000 impressions under 1K subs, etc.)
carries no stated source or methodology, presented as fact. Not
necessarily wrong, but unverifiable, worth citing as directional only, not
as if it were measured data.

**Questions the SERP asks that nobody answers:**
Multiple real, distinct patterns from Reddit go unaddressed by every guide:
(1) a video with good CTR and retention still getting low impressions,
which points to a distribution/reach problem the algorithm controls
separately from packaging quality; (2) impressions "just stopping" after
an initial period, a distinct pattern from never having impressions at
all; (3) impressions showing up for off-niche content, suggesting
metadata/categorization confusion. No guide in the top 10 separates these
into distinct diagnoses.

**Stale pages in the top 10:**
The Medium post is 4 years old and gives unsourced anecdotal advice
("repeat the keyword 2-3 times in the first 150 words") with no evidence
it worked beyond the author's own one video.

**What we can answer from our own tables that they structurally cannot:**
Not a first-party data study, but a real product mechanic: Channel Audit
already ingests a connected channel's real impressions data (confirmed in
`app/insights.py`) and ties CTR improvement directly to impressions-to-
views conversion. This lets the article honestly point to "read your own
numbers" rather than a generic benchmark table as the real answer to "is
my number low."

---

## 5. The second test (diagnostic post)

Is this a question a creator types when something is confusing (yes,
directly confirmed by real Reddit threads: "why do impressions just stop,"
"good CTR and retention but still low impressions"), is the top 3 led by
Reddit/forums rather than a major authority guide (yes, on the passing
query variants: reddit, reddit/medium, quora), does the answer send the
reader to a named product feature (yes, Channel Audit, honestly, since it
reads the reader's actual impressions data rather than a generic
benchmark)?

All three: yes. Proceed.

---

## 6. The data pull

Not applicable. Diagnostic post citing Google's own official counting
mechanics plus real Reddit-sourced confusion patterns, not a first-party
data study.

---

## 7. Outline

Working title: How to Get More Impressions on YouTube (and Why Yours Might Be Stuck)
Slug: `youtube-more-impressions` (3 words)
Angle in one sentence: Most guides explain what impressions are and stop
at generic CTR advice, but "low impressions" is actually several different
problems (never had them, they stopped, they're off-niche, or CTR/retention
is fine and reach is still capped), each with a different real cause.

- H2: What Actually Counts as an Impression
  - the precise official mechanics: >1 second, ≥50% visible, where it
    registers vs. explicitly doesn't (cited directly to Google)
- H2: Impressions vs. Views, Quickly
  - short clarifying section for the definitional searchers
- H2: Is Your Impression Count Actually Low?
  - the humbleandbrag-style benchmark table, cited and flagged as
    directional/unsourced, not measured
- H2: Good CTR and Retention, Still Low Impressions? That's a Different Problem
  - the differentiator: this pattern means a distribution/reach ceiling,
    not a packaging problem, real Reddit-sourced pattern
- H2: When Impressions Suddenly Stop
  - the second differentiator pattern
- H2: How to Actually Increase Them
  - ties to Channel Audit: read your own real impressions/CTR numbers
    instead of guessing from a generic table
- H2 (FAQ): Frequently Asked Questions
- Closing H2: plain, declarative

Internal links out: anchor `/blog/youtube-channel-not-growing` (first
entry into this group), also-link `/blog/youtube-algorithm` where
relevant.

Mid-article CTA: Channel Audit, in the "How to Actually Increase Them"
section, where reading real numbers is the genuine answer.

Cover image needed: yes, 1600x900, distinct scene from recent covers
(avoid repeating "person + laptop + desk" formula per user feedback).

---

## 8. Approval

Presented: `2026-09-25`
Outcome: `approved`
Notes: "okay"

---

## 9. Stage log

- [x] Stage 1, research file complete
- [x] Stage 2, presented and approved
- [x] Stage 3, written against the full standard in one pass
- [x] Stage 4, verified: drift clean, paragraphs <=5 lines (Puppeteer
      confirmed), FAQ array mirrors visible exactly (5/5), banned words
      zero, 100% body-paragraph bold coverage (15/15), 5/5 FAQ answers
      bolded, 2 Pro Tips, desktop/mobile screenshots read and clean, all
      links verified two-way (anchor youtube-channel-not-growing,
      also-link youtube-algorithm one-way as a genuine sibling reference)
- [ ] Stage 5, built with `BUILD_API_URL`, pushed, verified live, indexing
      requested

FAQ sourcing log, corrected after audit (the original entry here
overclaimed "all 5 genuinely PAA-sourced," which was checked against the
real raw PAA and was wrong for 3 of 5):

- "Why are my YouTube impressions low?" — real PAA, exact match (the
  plan's own cited PAA, query 1).
- "Why do my YouTube impressions suddenly stop?" — real PAA, near-exact
  match ("Why do YouTube impressions suddenly stop?", query 3).
- "How do I get my impressions up on YouTube?" — editorial. Paraphrased
  from real PAA themes ("How can I increase my YouTube impressions?",
  "How do I increase my YouTube impressions?", "How do I make my YouTube
  video get more impressions?") but rewritten, not the actual PAA text.
- "What is a good number of YouTube impressions?" — editorial. Paraphrased
  from real PAA ("How many YouTube impressions are good?", query 5), not
  used verbatim.
- "What is the difference between YouTube impressions and views?" —
  editorial, not sourced from any PAA question in this round. Closest real
  PAA was "What's more important, views or impressions?", a different
  question. Written to cover the definitional intent (see section 1) since
  no PAA in this round asked the impressions-vs-views distinction directly.

Off-topic PAA excluded: monetization/income questions, "7 second rule"
(unrelated trivia recurring across queries).

Date set to 2026-09-26 (one day ahead of same-day sibling
youtube-channel-stats) so it sorts as the latest post under the blog's
stable date-sort, per the same pattern established on the prior article.

- [x] Stage 5 (partial): built (129 routes), cover wired (1600x900 JPG,
      147KB, a genuinely different flat-lay/no-person composition per user
      feedback), sitemap.xml + llms.txt added, intro and closing heading
      rewritten after user feedback (removed a templated "every guide
      opens with X" scaffold reused from sibling articles, replaced a
      clever-metaphor closing heading with a plain declarative one), added
      a missing "where to find it in Studio" section after a fresh
      competitor coverage audit, both link relationships (anchor + also-
      link) confirmed genuinely two-way after the also-link was initially
      one-way only, committed locally as `9aa084845`. Push still pending
      user go-ahead.

Outstanding for this article:

- Awaiting explicit user go-ahead to `git push`. Nothing else remaining.
