# Research: youtube-shadowban

Plan entry: `#18` · Feature: `Channel Audit`
Target query: `is my youtube channel shadowbanned`
Researched: `2026-10-12`

---

## 1. SERP (4 queries, scripts/serper-batch.mjs) — top-3 confirmed exactly

Top-3: **reddit, tubepilot.ai, support.google**, matching the plan entry
exactly. PAA strong and consistent: "How do I find out if my YouTube
channel is shadowbanned?" and "How long does a YouTube shadowban last?"
appear across 3 of 4 pulls.

**Confirmed per FOUNDATION.md's free-tools note:** the SERP is
tool-shaped (tubepilot.ai, ytlarge.com, youtubetoolkit.com, bulkoid.com,
therehankadri.com all rank with "checker/detector" tools). This product
already tried and failed to build a shadowban checker tool on quota
grounds (would need an uncacheable search.list call per use, 100 units,
unsustainable under the 100/day search sub-limit). Confirmed: this stays
an article, not a tool, per FOUNDATION.md's own rule.

## 2. The real finding, verified against YouTube's own official source

**YouTube has never used the word "shadowban."** It does officially
describe a real, named mechanism: reduced recommendation of "borderline"
content (material that comes close to violating Community Guidelines
without crossing the line) to non-subscribed viewers specifically.
Source: YouTube's own blog, <blog.youtube/inside-youtube/the-four-rs-of-
responsibility-raise-and-reduce>, "The Four Rs of Responsibility, Part 2"
(Dec 2019, still YouTube's standing position as of 2026 per secondary
confirmation). Real, citable numbers from that post: borderline content
is "a fraction of 1% of what's watched," and the described changes
produced a reported 70% average drop in watch time from non-subscribed
recommendations for that content category (self-reported by YouTube, no
independent verification found, must be labeled as YouTube's own figure).

**The scope detail matters and is the real differentiator:** the
reduction applies specifically to non-subscribed recommendation surfaces
(Browse, Suggested to non-subscribers). Existing subscribers still see
the content normally. This gives a concrete, checkable diagnostic: if
Search and subscriber-driven traffic hold steady while Browse/Suggested
to new viewers drops, that's consistent with the real, named mechanism.
If everything drops at once including subscriber traffic, it's something
else entirely (a different, more common cause).

## 3. Competitor research

**onetube.io** ("Am I Shadowbanned on YouTube? The Real Diagnostic
Checklist") — full read via WebFetch, the strongest real competitor
found, title almost exactly matches the plan entry's framing. 9 sections:
what YouTube has actually said, a 60-second Traffic Sources diagnostic
(3 patterns), "the 4 things it's usually actually about" (borderline
-content reduction, made-for-kids misclassification, niche/audience
drift, a 2026 ranking-signal rebalance), a 6-step real test, an
assessment of third-party checker tools, a 2026-algorithm-change
section, a fix section, FAQ, and a close.

**Important caveat on this source:** OneTube sells a competing
comment-analysis tool, so its "checkers deliver nothing actionable"
argument, while directionally credible and consistent with the quota
logic that killed this product's own checker attempt, comes from a
source with its own product to sell. Treat its specific claims about
checker-tool mechanics (that they only check search-title indexing, not
real Studio data) as plausible and independently sensible, not as a
neutral, disinterested source.

**The checker tools themselves** (tubepilot.ai, ytlarge.com,
youtubetoolkit.com) were not deep-read individually; their mechanism is
already established as fundamentally limited (no access to a creator's
real Studio data, since that requires OAuth a public tool can't have),
which matches directly with why this product couldn't build one either.

## 4. Coverage matrix and differentiator

| Section | onetube.io | Our coverage |
|---|---|---|
| YouTube's official position (never says "shadowban") | yes | Covered, cited directly to the real blog post, not secondhand |
| The real named mechanism (borderline-content reduction) | yes | Covered, with the real 70%/<1% figures cited |
| Traffic-source diagnostic (Search vs. Browse/Suggested) | yes | Covered, matches the pattern already used across this site's Channel Audit posts |
| Why checker tools don't work | yes (from a competing-product source) | Covered independently, grounded in the same quota/access logic that killed this product's own tool attempt, a more credible and specific reason than OneTube gives |
| Made-for-kids misclassification as a real cause | yes | Covered |
| Non-shadowban causes already owned by sibling posts | n/a | NOT duplicated, two-way linked instead to `/blog/youtube-stopped-recommending-videos` and `/blog/youtube-views-dropped-suddenly` |

**Differentiator:** this product's own failed quota math on a shadowban
checker is a concrete, specific, first-party reason checker tools can't
work that no competitor article has (they argue it in the abstract;
we can explain the actual technical reason: no uncacheable, per-user
search.list call survives at scale, and neither does any other tool
attempting live cross-user verification of a private account signal).

## 5. PAA (logged real vs. editorial)

Real, on-topic PAA, verbatim:
1. "How do I find out if my YouTube channel is shadowbanned?" — real
2. "How long does a YouTube shadowban last?" — real
3. "How to fix a YouTube shadowban?" / "How can I fix a YouTube
   shadowban?" — real (near-duplicate, kept distinct)
4. "What causes shadowban on YouTube?" — real
5. "Why is my reach so low on YouTube?" — real, appeared on the
   "reach drop vs shadowban" query specifically

Filtered off-topic: "$10,000/$2,000 a month" cluster, "7 second rule"
(known false-positive patterns).

5 of 5 used FAQs are real PAA, 0 editorial needed.

## 6. Outline (for approval)

1. Open with the real finding: YouTube has never used the word
   "shadowban," but it does officially describe a real mechanism,
   reduced recommendation of borderline content to non-subscribers,
   cited directly to YouTube's own blog post with the real numbers.
2. What "borderline content" actually means (YouTube's own definition,
   the <1% figure), and why it rarely applies to most creators asking
   this question.
3. The real diagnostic: Search/subscriber traffic holding steady while
   Browse/Suggested-to-new-viewers drops is consistent with the named
   mechanism; everything dropping at once points elsewhere.
4. Why shadowban checker tools can't actually tell you anything,
   explained with this product's own concrete quota reasoning (the real
   differentiator), not vague "they don't work" claims.
5. The other real causes a reach drop usually is (made-for-kids
   misclassification, audience drift), each two-way linked to the
   sibling posts that already cover the deeper mechanism rather than
   re-explaining them.
6. What to actually check in Studio, step by step.
7. FAQ (5 questions above).
8. Where Channel Audit reads the real traffic-source signal instead of
   guessing or running a fake checker (differentiator, CTA).
9. Closing H2: plain, declarative.

Internal links: two-way with `/blog/youtube-stopped-recommending-videos`
(Suggested-traffic mechanism) and `/blog/youtube-views-dropped-suddenly`
(general causes). External citation: YouTube's own blog post.

CtaCard: Channel Audit, per the plan entry.
