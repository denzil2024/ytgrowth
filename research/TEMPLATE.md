# Research: <slug>

Plan entry: `#<n>` · Feature: `<feature>` · Anchor post: `/blog/<slug>`
Target query: `<exact query phrase from the plan entry>`
Researched: `<YYYY-MM-DD>`
Status: `researching | awaiting approval | approved, writing | verifying | done`

Copy this file to `research/<slug>.md` and fill it in BEFORE writing a word.
No research file, no article. The process is `FOUNDATION.md` → "Stage 1 —
Research"; the data floor and voice rules are in the same file.

**This file is also the state file.** A resumed session reads `Status:` and the
stage log at the bottom to know where things stand, instead of re-deriving it
by reading the article and guessing. Keep both current.

Volume is not required. This site confirms entries on SERP composition, a
demand signal, question shape and a product feature, not on Keyword Planner
volume. If a volume figure exists, cite its export; never estimate one.

---

## 1. Search intent

Answer this BEFORE opening any competitor, from the SERP alone.

Dominant intent (pick one): `diagnostic | definitional | decision | procedural`

What the reader wants in the first screen:

What the article must therefore open with (see the intent table in
FOUNDATION.md Stage 1.1):

Second intent present in the SERP, if any, and where it gets served:

---

## 2. The live top 10

Every row is a page opened this session. Do not list a URL from memory, and do
not pad to ten if fewer were reachable; note the failures instead. **At least
5 read in full, including every result in the top 3.** Forum threads count as
competitors and are read the same way.

| # | URL | Domain | Date published | Words | Read in full? | Section headings |
|---|---|---|---|---|---|---|
| 1 | | | | | yes/no | |
| 2 | | | | | yes/no | |

Read in full: `<n>` of 10. Top 3 all read: `yes/no`.

SERP character: who owns this query, and is it beatable? The plan entry's
`top3:` evidence is the starting point; confirm it still holds.

---

## 3. Coverage matrix

Every H2-level section any competitor covers, down the left. One column per
competitor. **Cover the UNION, not the intersection:** a section only one page
has is still a long-tail we cede by skipping it.

| Section | C1 | C2 | C3 | C4 | C5 | Ours? |
|---|---|---|---|---|---|---|
| | | | | | | |

Section counts: strongest competitor `<n>` H2s. Ours: `<n>`. If ours is lower,
justify it here or fix the outline.

---

## 4. What the top 10 gets wrong

The step that makes this the best answer rather than the longest. Each line
needs evidence, not an assertion.

**A claim the ranking pages repeat that is false or unverifiable:**
(with the page that says it, and the primary source that contradicts it)

**Questions the SERP asks that nobody answers:**
(from PAA on the query plus 2-4 variants; mark which no competitor covers)

**Stale pages in the top 10:**
(publish dates; a 2023 page still ranking is an opening)

**What we can answer from our own tables that they structurally cannot:**
(name the study or the table; for a diagnostic post this is usually one
section citing a published study)

If all four are empty, say so and stop. Moving to the next plan entry is the
correct outcome, not a failure.

---

## 5. The one test

> Could a competitor without our database have written this article?

Answer:

If YES, stop here. Record the reason and do not write the article. A rejected
research file is a successful outcome, not a wasted one, and it is cheaper than
a published post that competes on advice against DR-80 incumbents.

---

## 6. The data pull

```sql
-- must include: published_at >= '2025-01-01'
```

| Check | Value | Floor | Pass? |
|---|---|---|---|
| Channels behind the figure | | 30 | |
| Videos behind the figure | | 500 | |
| Date filter applied | | required | |
| Median AND mean reported | | required | |

Figures to publish:

Figures dropped for failing the floor (list them, so nobody re-derives them
later and assumes they are usable):

---

## 7. Outline

Derived from sections 2 and 3 above, not from any previous article. If two
posts in the same cluster end up with the same shape, that has to be because
their SERPs have the same shape, and this section is where that gets checked.

Working title:
Slug (2-4 words):
Angle in one sentence:

- H2:
  - what it covers, and which competitor section or gap it answers
- H2:
  - ...

Internal links out (pillar + siblings):
Mid-article CTA (which feature or tool, and why it fits here):
Cover image needed: yes/no, and what it should show

---

## 8. Approval

Presented: `<date>`
Outcome: `pending | approved | changes requested`
Notes:

---

## 9. Stage log

Tick as each stage of `FOUNDATION.md` → "The runbook" completes. A resumed session
reads this instead of re-inspecting the article to work out what is left.

- [ ] Stage 1, research file complete
- [ ] Stage 2, presented and approved
- [ ] Stage 3, written against the full standard in one pass
- [ ] Stage 4, verified: parses clean, paragraphs <=5 lines, FAQ array mirrors
      visible, banned words zero, cover 1600x900 JPG loading, desktop and
      mobile screenshots read, counts compared to the reference post
- [ ] Stage 5, built with `BUILD_API_URL`, pushed, verified live, indexing
      requested

Outstanding for this article (keep this list honest, it is what a resumed
session trusts):

-
