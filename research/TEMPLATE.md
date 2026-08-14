# Research: <slug>

Target query: `<exact keyword phrase>`
Volume: `<n>/mo` (source: Keyword Planner export, date)
Researched: `<YYYY-MM-DD>`
Status: `researching | awaiting approval | approved, writing | verifying | done`

Copy this file to `research/<slug>.md` and fill it in BEFORE writing a word of
the article. No research file, no article. Rules and thresholds referenced
below live in `CONTENT-PLAN.md` Part 1, and the stage-by-stage process is
Part 3.

**This file is also the state file.** A resumed session reads `Status:` and the
stage log at the bottom to know exactly where things stand, instead of
re-deriving it by reading the article and guessing. Keep both current.

---

## 1. The live top 10

Every row must be a page opened this session. Do not list a URL from memory,
and do not pad the table to ten if fewer were reachable. Note the ones that
failed to fetch rather than dropping them silently.

| # | URL | Domain | Fetched | Format | Notes |
|---|---|---|---|---|---|
| 1 | | | YYYY-MM-DD | | |
| 2 | | | YYYY-MM-DD | | |

SERP character: who owns this query, and is it beatable or authority-gated?
Check against the position data in `CONTENT-PLAN.md` Part 2 before assuming
it is winnable.

---

## 2. Coverage matrix

Every H2-level section any competitor covers, down the left. One column per
competitor. Cover the UNION, not the intersection: a section only one strong
page has is still a long-tail we cede by skipping it.

| Section | C1 | C2 | C3 | C4 | C5 | Ours? |
|---|---|---|---|---|---|---|
| | | | | | | |

Section counts: strongest competitor `<n>` H2s. Ours: `<n>`. If ours is lower,
justify it here or fix the outline.

---

## 3. The gap

What every one of them misses:

What we can answer from our own data that they structurally cannot:

Intent the SERP does not close (what is the reader really trying to do, and
does any ranking page finish the job?):

---

## 4. The one test

> Could a competitor without our database have written this article?

Answer:

If YES, stop here. Record the reason and do not write the article. A rejected
research file is a successful outcome, not a wasted one, and it is cheaper than
a published post that competes on advice against DR-80 incumbents.

---

## 5. The data pull

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

## 6. Outline

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

## 7. Approval

Presented: `<date>`
Outcome: `pending | approved | changes requested`
Notes:

---

## 8. Stage log

Tick as each stage of `CONTENT-PLAN.md` Part 3 completes. A resumed session
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
