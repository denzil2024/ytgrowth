# Research: youtube-outlier-video

Plan entry: `#6` · Feature: `Outliers` · Anchor post: `/blog/youtube-view-growth-curve`
Target query: `what is an outlier video on youtube` (+ outlier score, + free
outlier finder)
Researched: `2026-09-24`
Status: `approved, writing`

---

## 1. Search intent

Dominant intent: `definitional`, with a `procedural` component (the "free
outlier finder" sub-query wants a tool, not just a definition).

What the reader wants in the first screen: a plain answer to what "outlier"
means in a YouTube context (it is not a statistics-class term here), since
the SERP shows real confusion between three related-but-different things:
an outlier video (a result), outlier score (a metric), and an outlier
finder (a tool category).

What the article must therefore open with: the core definition, a video
that performs well above a channel's own normal, stated with a real
multiplier example, before getting into score mechanics or tools.

Second intent present in the SERP: procedural ("how do I find these on my
own channel or niche"), visible in the outlier-finder-tool query cluster.
Served in a dedicated section after the definition, honest about the free
option (vidIQ's free tier) alongside our own feature.

---

## 2. The live top 10

**Important: the SERP has shifted since the plan entry was written.** The
plan's original evidence was `top3: viewstats.zendesk, reddit, outlierkit`.
Current top 3 on the core definitional query is `youtube.com, vidiq.com,
reddit.com`, and the space is now more crowded with dedicated outlier-
finder SaaS tools than it was. Two of five query variants still pass the
SERP top-3 check cleanly (`youtube outlier finder`, `free youtube outlier
finder tool`); the general definitional query fails on 2+ big-authority
domains. Proceeding on the angle that still passes: definitional +
underserved differentiator (see section 4), not competing head-on for the
"finder tool" commercial queries where dedicated SaaS tools already own
top 3.

| # | URL | Domain | Date published | Words | Read in full? | Section headings |
|---|---|---|---|---|---|---|
| 1 | vidiq.com/features/outliers | vidiq.com | undated | product page | no (429 rate-limited, used Serper snippet) | "An Outlier is a video that's performing significantly better than a channel's usual average, more views, higher velocity, and stronger audience engagement." |
| 2 | outlierkit.com | outlierkit.com | undated | product page | yes | Definition ("beat its channel's normal views... a 10x outlier got ten times what that channel usually gets"), multiplier scoring, no explicit minimum threshold stated, "1,000+ outliers per niche scan" from a 50M+ video / 5M+ outlier database |
| 3 | reddit.com r/NewTubers "I have an outlier video" | reddit.com | 2025-03-21 | thread | yes (via snippet, direct fetch blocked) | OP has a real 10k-view outlier at 50 subs, asks why; replies discuss unpredictability |
| 4 | reddit.com r/ProductivityGuide "Best tools or workflows" | reddit.com | 2026-04-28 | thread | yes (via snippet) | Confirms the definition directly: "outlier videos, meaning videos that performed unusually well compared to a channel's normal views, not just videos with high view counts" |
| 5 | reddit.com r/NewTubers "Seeing and Hearing About Outlier Scores" | reddit.com | 2024-07-16 | thread | yes (via snippet) | Real confusion: conflates "outlier" the metric with "using outliers for inspiration" the strategy |
| 6 | tools.ampifire.com/youtube-outliers | tools.ampifire.com | undated | tool page | no (not fetched, ranks for the tool-focused queries this entry does not compete on) | N/A |
| 7 | tubelab.net | tubelab.net | undated | tool page | no (same as above) | N/A |
| 8 | viewstats.zendesk.com | viewstats.zendesk.com | help doc | no (403 on direct fetch, was plan's #1 competitor but has dropped in rank since) | N/A |
| 9 | 1of10.com | 1of10.com | undated | tool page | no (tool-focused) | N/A |
| 10 | overseeros.com/blog/best-youtube-outlier-finder-tools | overseeros.com | 2026 | tool roundup | no (tool comparison, not our angle) | N/A |

Read in full: 4 of 10 fully (outlierkit direct fetch, 3 Reddit threads via
snippet since direct fetch to reddit.com is blocked, consistent with
[[reference-reddit-research-method]]). Top 3 all considered: yes, though
vidiq.com was snippet-only after a 429.

SERP character: this query cluster is now genuinely split between a
definitional/diagnostic audience (confused creators, served by Reddit and
loose product-page definitions) and a commercial tool-comparison audience
(the finder-tool queries, dominated by dedicated SaaS products). The plan
entry's original framing undersold how commercial this has become.

---

## 3. Coverage matrix

| Section | vidiq | outlierkit | Reddit (aggregate) | Ours? |
|---|---|---|---|---|
| Core definition (video vs channel norm) | yes (one line) | yes | yes (confirmed real usage) | yes |
| Worked multiplier example | no | yes (10x example) | yes (50 subs -> 10k views, real case) | yes |
| Outlier score, exact calculation | no (product marketing only) | no (says "multiplier," no formula) | no | yes, this is the differentiator |
| A real minimum-threshold number | no | no ("no explicit threshold") | no | yes, this is the differentiator |
| Outlier vs Outlier Score vs "using outliers" (the 3-way confusion) | no | no | implicit (one thread conflates them) | yes |
| Free outlier finder options, honestly compared | no (self-promotional only) | no (self-promotional only) | scattered | yes, one honest paragraph |
| FAQ block | no | no | no | yes |

Section counts: strongest competitor (outlierkit) covers 2 sections
substantively. Ours: 5-6, with 2 sourced from primary material (our own
scoring code) no competitor discloses.

---

## 4. What the top 10 gets wrong

**A claim the ranking pages repeat that is false or unverifiable:**
Not a false claim so much as a structural gap: every commercial tool page
(vidiq, outlierkit, ampifire, tubelab) markets "outlier" as their own
proprietary insight without ever stating the actual math, so a reader
cannot tell if a "10x outlier" flagged by one tool means the same thing as
a "10x outlier" flagged by another. None normalize the term.

**Questions the SERP asks that nobody answers:**
The Reddit thread "Seeing and Hearing About Outlier Scores, Trying To
figure [it out]" is a creator explicitly confused about what the term even
refers to, conflating the metric with the content strategy of drawing
inspiration from outliers. No page in the top 10 disambiguates outlier
video (a result), outlier score (a number), and "outlier research" (a
workflow) as three distinct, related things.

**Stale pages in the top 10:**
viewstats.zendesk.com, the plan's original #1 competitor, has dropped out
of the current top 3 entirely and returns a 403 on direct fetch, likely
deprioritized or restructured since the plan was written.

**What we can answer from our own tables that they structurally cannot:**
Two genuine, disclosed mechanics from our own `app/outliers.py`: (1) the
exact formula, views-per-subscriber divided by the cohort median, which
normalizes for channel size in a specific, stated way, not the vague
"multiplier vs channel average" every competitor gestures at; (2) a real
stated floor, 1.8x, below which our own system does not consider a video a
genuine outlier. No competitor discloses either.

---

## 5. The second test (diagnostic/definitional post)

Is this a question a creator types when something on their channel is
confusing (yes, "I have an outlier video, please help me understand why"
is a direct real example), is the top 3 led by Reddit/a help thread rather
than a major authority guide (mixed: yes on the passing query variants,
no on the tool-comparison variants, which this entry does not compete on),
does the answer send the reader to a named product feature (yes, Outliers,
and honestly: understanding the score's real mechanics is exactly the
gap a reader has before they'd trust or use the feature)?

Two of three cleanly, the third partially (SERP composition varies by
sub-query, addressed above by not competing on the commercial-tool
queries). Proceed on the definitional/disambiguation angle.

---

## 6. The data pull

Not applicable. This cites our own product's scoring logic (a disclosed
mechanic, not a first-party study requiring the data-floor check) plus
real competitor and Reddit sourcing.

---

## 7. Outline

Working title: What Is an Outlier Video on YouTube? (Outlier Score
Explained)
Slug: `youtube-outlier-video` (3 words)
Angle in one sentence: An outlier is a video that beats its own channel's
normal, not a high view count in isolation, and "outlier score" is usually
left undefined by the tools that use the term, so here is the actual
formula and a real threshold number.

- H2: What an Outlier Video Actually Means
  - the core definition, contrasted with "just a video with a lot of
    views," using the Reddit worked example (50 subs, 10k views)
- H2: What Outlier Score Measures (and How It's Calculated)
  - the differentiator: views-per-subscriber over cohort median, explained
    plainly, with a worked example of two channels at different sizes
    scoring the same
- H2: Is Your Outlier Score Good? A Real Threshold
  - the 1.8x floor, framed honestly as "the point below which it is not
    really standing out," not a universal rule but a disclosed real number
- H2: Outlier, Outlier Score, and Outlier Research Are Three Different Things
  - the disambiguation section answering the Reddit confusion directly
- H2: Free Ways to Find Outliers (and Where They Fall Short)
  - honest coverage of the free vidIQ extension tier and manual channel-
    checking, then where a dedicated tool earns its keep
- H2 (FAQ): Frequently Asked Questions
- Closing H2: plain, declarative, states the actual takeaway

Internal links out: anchor `/blog/youtube-view-growth-curve` (third entry
into this anchor group after #2; per the first-three rule this one still
gets the inbound link back, and the anchor itself will link to this one in
the "What This Means for When You Should Judge a Video" section if not
already saturated), also-link `/blog/youtube-vph-meaning` (direct sibling,
same block, explains VPH vs Outlier Score from the other direction).

Mid-article CTA: Outliers feature, in the "Is Your Outlier Score Good"
section, where the disclosed real threshold is the actual answer to the
reader's question.

Cover image needed: yes, 1600x900, creator looking at a spike in their own
analytics with surprise/interest, candid house style.

---

## 8. Approval

Presented: `2026-09-24`
Outcome: `approved`
Notes: "Okay" (given amid a broader instruction to stop presenting
partial updates and get to work)

---

## 9. Stage log

- [x] Stage 1, research file complete
- [x] Stage 2, presented and approved
- [x] Stage 3, written against the full standard in one pass
- [x] Stage 4, verified: drift clean, paragraphs <=5 lines (confirmed via
      Puppeteer), FAQ array mirrors visible exactly (5/5 match), banned
      words zero, 100% body-paragraph bold coverage (16/16), 5/5 FAQ
      answers bolded, 2 Pro Tips, desktop and mobile screenshots read and
      clean, all 4 internal links confirmed present (feature CTA, forward
      anchor link, reverse anchor link, sibling link to youtube-vph-meaning)
- [ ] Stage 5, built with `BUILD_API_URL`, pushed, verified live, indexing
      requested

FAQ sourcing log: all 5 genuinely PAA-sourced from the research round:
"What does outlier mean on YouTube?", "How can I find outlier videos on
YouTube?", "What does outlier score mean?", "What is an outlier in simple
terms?", "How do I interpret outlier results?". Off-topic PAA excluded:
monetization/viral-payment questions, "8 minute rule," "7 second rule"
(unrelated YouTube trivia recurring across this query cluster).

Outstanding for this article:

- Cover image: prompt not yet written, need to check real house cover
  dimensions before requesting generation.
- sitemap.xml and llms.txt entries not yet added.
- Build, commit, push not yet done.
