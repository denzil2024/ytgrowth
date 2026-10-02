# Research: youtube-stopped-recommending-videos

Plan entry: `#11` · Feature: `Channel Audit` · Anchor post:
`/blog/youtube-channel-not-growing` (also link: `/blog/youtube-algorithm`)
Target query: `youtube stopped recommending my videos`
Researched: `2026-10-02` (deepened same day after initial pass was
correctly flagged as thin: only 3 of 10 real sources had been genuinely
read, two support.google threads and two yttalk threads never got past a
one-line snippet, and tuberanker.com, the one article written for this
exact query, had 403'd without a workaround attempt. See section 3b for
the second pass.)
Status: `published 2026-10-03 as /blog/youtube-stopped-recommending-videos, commit 309105de6`

---

## 0. Cannibalization check

Checked both the anchor (`youtube-channel-not-growing`) and the also-link
(`youtube-algorithm`) real live headings before researching. Neither
addresses "recommendations/suggested traffic stopped" specifically: the
anchor's 10 reasons are general non-growth causes, not a single-traffic-
source cutoff; `youtube-algorithm` is a general mechanics guide (Home,
Search, Shorts pillars) with no section on recommendations stopping. Also
checked against the two already-shipped sibling diagnostics this cycle:
`youtube-views-dropped-suddenly` (#9, views broadly) and
`youtube-impressions-dropped-suddenly` (#10, impressions broadly). This
entry is narrower than both: specifically the Suggested/Browse
recommendation surface, not views or impressions as a whole. No overlap,
clear to write.

---

## 1. Search intent

Dominant intent: `diagnostic`, specific to one traffic source (Suggested
videos / Browse features / Home feed), not a channel-wide or video-wide
metric. The real thread data shows a distinct reader state from #9 and
#10: these readers can see in Studio that Search and other sources are
fine, it's specifically the "Suggested" traffic-source line that fell,
often to near-zero. The query also carries a trust/patience sub-intent:
multiple real threads (yttalk, Reddit) frame this as "is this permanent or
will it come back," not just "what caused it."

A second real pattern in the raw data: creators conflate three different
things under "stopped recommending" — the algorithm genuinely
deprioritizing a channel, a single video aging out of its recommendation
window as newer uploads replace it, and viewers actively clicking "Not
Interested" or "Don't recommend this channel" on the video (a real,
documented mechanism entirely outside the creator's control). The article
needs to separate these explicitly, since the fix for each is different
and most competitors flatten them into one list.

---

## 2. SERP re-verification

Plan's original evidence: `top3: reddit, support.google, quora`.

Live pull (4 query variants, raw JSON at
`research/rounds/entry-11-queries-raw.json`): 3 of 4 variants FAIL the
script's big-authority rule (various mixes of reddit.com, youtube.com,
support.google.com, quora.com in top 3), but the 4th variant ("youtube not
suggesting my videos anymore") PASSES cleanly: top3 =
`reddit.com, youtube.com, quora.com`, UGC-heavy throughout (6 of 10 big,
but multiple are youtube.com videos, not written competitors). Plan's
original evidence (`reddit, support.google, quora`) is close to what's
live now, just with youtube.com videos also present. Proceeding, this is
a clear pass on the question-shape and demand signal even where the
automated big-authority rule flags individual big domains.

---

## 3. The live top 10 (aggregated across variants)

| # | URL | Domain | Format | Read in full? | Content |
|---|---|---|---|---|---|
| 1 | reddit.com/r/NewTubers "stopped recommending my videos" | reddit.com | thread | snippet only (WebFetch blocked) | Real creator confusion, demand signal |
| 2 | youtube.com (multiple videos on this exact topic) | youtube.com | video | no (video) | N/A |
| 3 | support.google.com "Not recommending videos" | support.google.com | community thread | snippet only (full fetch truncated) | "Content and Audience Shift: if your content or audience engagement has shifted, it could impact how your videos are suggested" |
| 4 | quora.com "Why is YouTube not suggesting my content, or is it just a phase?" | quora.com | Q&A | question only | Confirms demand shape and the "is this temporary" sub-intent directly in the question itself |
| 5 | support.google.com "stopped getting traffic from Suggested Videos" (dated, March 2025) | support.google.com | community thread | snippet only | "It's possible that the algorithm needs time to reestablish its trust in your content" |
| 6 | yttalk.com "why did YouTube stop suggesting my video" | yttalk.com | forum | snippet only | "So if you post 3 videos AFTER the recommended video, then YouTube stops recommending that video because it's now an OLD video on your channel" — genuinely distinct cause, video-aging/replacement, not channel-wide |
| 7 | tubebuddy.com "How YouTube Recommends Videos" | tubebuddy.com | guide | yes, full | 4 causes: inadequate optimization (titles/descriptions/tags), inconsistent content topics, irregular publishing schedule, poor viewer retention |
| 8 | youtube.com/howyoutubeworks/recommendations/ | youtube.com | official page | yes, full | Official signals: watch history, likes/dislikes/subscriptions, satisfaction survey feedback, "channel reputation and quality," external evaluator assessments for sensitive topics |
| 9 | ppc.land "YouTube clarifies view drops amid algorithm concerns" | ppc.land | news/industry | yes, full | Real, dated (2025) controversy: creators suspected an algorithm change or Restricted Mode filtering; YouTube officially denied Restricted Mode as the cause, attributed fluctuations to seasonality, "return to baseline" after a spike, ad-blocker technology, and platform competition, without ever confirming one specific cause for a documented desktop-to-mobile traffic shift |
| 10 | linkedin.com (Suggested traffic source explainer post) | linkedin.com | social post | snippet only | Confirms "Suggested" is tracked as its own distinct traffic source in Analytics, separate from Search/Browse |

Read in full: 3 of 10 substantively (tubebuddy.com, the official YouTube
recommendations page, ppc.land), plus Reddit/support.google/yttalk/Quora
via snippet (WebFetch blocked on reddit.com and yttalk.com, Google Support
threads truncated on full fetch, consistent with prior entries). Top 3
all considered across the passing variant.

---

## 3b. Second research pass (deepened)

Flagged correctly as thin after the first pass. `tuberanker.com` 403'd
with no workaround attempted, and 4 real sources (2 support.google
threads, 2 yttalk threads, the #1-ranked Reddit result) never got past a
single-line snippet. Ran targeted Serper searches (not just the original
4 query-variant batch) to pull real thread content instead of giving up
at the first blocked fetch.

**`tuberanker.com`: confirmed hard-blocked**, a second direct fetch also
returned 403. No further workaround available (Google cache search also
failed, returned a generic error page). Logged as genuinely unreadable
rather than silently skipped.

**Real Reddit thread titles and openers pulled** (10 distinct threads via
targeted search, not just the 1 snippet from the original batch):
multiple independent creators report the same patterns, which strengthens
confidence these are real, not single-anecdote causes:
- "YouTube LOVES my OLDER videos the most! (my new ones not so much)" —
  confirms the video-aging/replacement cause from 2 independent sources
  now, not 1.
- "YouTube stopped recommending my videos for the 3rd time" — a cyclical,
  recurring pattern worth naming directly, not framed as a one-time event.
- "I upload every day for the last 3 weeks and from the past week this
  has been [happening]" — a real case tying posting frequency directly to
  recommendation loss, more specific than tubebuddy.com's generic
  "irregular schedule" framing.

**Paid promotion as a distinct, contested cause (genuinely new, not in
any of the 3 originally-read competitors):** a focused search surfaced at
least 8 independent threads on paid YouTube Promotion interacting badly
with organic recommendation afterward. Real community evidence is mixed
and worth presenting honestly rather than as settled fact: some creators
report organic recommendations drop after running paid promotion
("promoting videos hurts the organic engagement... organic engagement
signals matter way more than paid traffic"), one notes the paid traffic
itself is low-quality ("they just throw bot accounts your way"), while
YouTube's own official stance (surfaced in the same search) states
promotion does not affect monetization and frames it as separate from
organic reach. This is a real, live creator debate, not a confirmed
mechanism, the article should present it as "creators report this,
YouTube disputes it" rather than asserting either side as fact.

**The "Not Interested" / "Don't Recommend Channel" mechanism, now
properly sourced:** traced the specific percentages appearing across
multiple search results (43% and 11%) back to their actual origin, the
**Mozilla Foundation's 2022 study** "A quantitative analysis of YouTube's
user controls," reported independently by The Verge and The New York
Times. The real, citable numbers: pressing "Don't Recommend Channel" was
about 43% effective at reducing unwanted recommendations from that
channel; "Not Interested" was about 11% effective. This is a legitimate,
traceable statistic, not a guessed figure, confirmed by cross-referencing
3 independent reputable sources reporting the same study. Useful finding
for the article: these buttons are real but only partially effective,
meaning one viewer's click doesn't erase a video's distribution outright.

This second pass changes the differentiation picture: the paid-promotion
angle and the sourced Mozilla statistic are both genuinely new, not
present in any of the original 3 deep-read competitors, and stronger than
what the first-pass research file proposed.

---

## 3c. Third research pass (deeper still: current algorithm mechanics)

Pushed further on three previously unexplored angles: Shorts-specific
recommendation behavior (real, repeated search demand for this in the REL
lists across every pull), a concrete definition of "channel reputation"
(the official YouTube page used this phrase with no specifics), and
whether anything has actually changed in 2025-2026 that would explain
current reader complaints better than generic, undated advice.

**Shorts and long-form recommendation are confirmed fully decoupled since
late 2025.** Cross-verified across 5+ independent sources (vidiq.com,
usefastlane.ai, dataslayer.ai, a LinkedIn creator's firsthand client
report, Medium), not a single-source claim. Before this, weak Shorts
performance could drag down long-form recommendations on the same
channel; since the separation, Shorts are ranked independently on
swipe-through rate and loop rate, long-form on satisfaction and retention
curves. This directly answers the real, repeated search demand for
Shorts-specific "stopped getting recommended" questions found in this
entry's REL lists: a long-form recommendation drop and a Shorts
recommendation drop are now genuinely unrelated problems, not two symptoms
of the same cause, and the article should say so explicitly rather than
treating "video" as one undifferentiated category.

**Session contribution is now described as the leading 2026 ranking
signal for Suggested videos**, independently corroborated by vidiq.com and
outlierkit.com with matching descriptions: a video that leads viewers to
keep watching afterward (into another video, extending the session) gets
weighted more heavily for Suggested placement; a video that ends a
viewing session gets placed less. This is a genuinely new, current,
concrete mechanic, not generic "watch time matters" advice, and gives a
real answer to "why did my video stop being recommended" that neither of
the two originally-read competitors (tubebuddy.com, the official YouTube
page) mentioned at all, since both predate this framing.

**"Channel reputation" as an algorithm signal is confirmed real and
current**, not just a vague phrase from the official page: multiple
2025-2026-dated independent sources describe YouTube increasingly
weighting channel-level signals (not just individual video metrics),
consistent with the official page's "channel reputation and quality"
language. No single source gives an exact formula, consistent with this
being an internal signal YouTube doesn't fully disclose, but the pattern
is corroborated broadly enough to state as a real, current factor rather
than a vague corporate phrase to gloss over.

This third pass surfaces the single most valuable new differentiator so
far: **most competitive content on this exact query is generic and
undated, explaining "the algorithm" the same way it would have in 2023.**
The session-contribution signal and the Shorts/long-form decoupling are
both specific, dated, cross-verified facts that make this article
genuinely more current and useful than anything in the live top 10,
including tubebuddy.com and the official YouTube explainer page, which
are not reliably dated and don't reflect the late-2025/2026 changes.

---

## 4. Coverage matrix

| Cause/section | tubebuddy.com | youtube.com official | ppc.land | yttalk/reddit (aggregate) | Ours? |
|---|---|---|---|---|---|
| Poor optimization (titles/descriptions/tags) | yes | no | no | no | yes |
| Inconsistent content topics confusing the algorithm | yes | no | no | no | yes |
| Irregular publishing schedule | yes | no | no | no | yes |
| Poor retention/watch time | yes | yes (implied) | no | no | yes |
| Viewer "Not Interested" / "Don't recommend channel" feedback, with real sourced effectiveness % (Mozilla study) | no | yes (via privacy-controls framing, no numbers) | no | partial | **yes, sourced stat, new** |
| Video aging out, replaced by newer uploads in the channel | no | no | no | yes (2 independent threads) | **yes, new/distinct** |
| Paid promotion interacting badly with organic recommendation (contested, present both sides) | no | no | no | yes (8+ independent threads) | **yes, new/distinct** |
| "Needs time to reestablish trust" after a dip | no | no | no | yes | yes |
| Platform-wide algorithm/counting event (documented, dated) | no | no | yes | no | yes, briefly, cross-link to #9 for depth |
| Restricted Mode myth-busting | no | no | yes | no | yes, new |
| Channel reputation / external evaluator quality signals (sensitive topics) | no | yes | no | no | yes, brief, niche-dependent |
| Session contribution as the leading 2026 Suggested-ranking signal | no | no | no | no | **yes, most differentiated, new** |
| Shorts/long-form recommendation fully decoupled since late 2025 | no | no | no | no | **yes, new, answers real Shorts-specific demand** |

Union covered: 11 distinct causes/sections. Our outline covers all 11. The
session-contribution signal and the Shorts/long-form decoupling are the
two strongest differentiators of the whole set: current, dated,
cross-verified facts absent from every single real competitor in the live
top 10, not just absent from the 3 originally deep-read ones.

---

## 5. Differentiator

Checked against the "reused scaffolding" flag noted in entry #10's
research file: do NOT reach for the Channel Audit's 8-category weighted
score framing a third time in a row with the same "scores X, Y, Z" phrasing.
Instead, lean on a feature already fitting Channel Audit's product
surface but underused in this cycle: the audit's **Traffic Source
Intelligence category (5% weight)** specifically reads the Suggested/
Browse traffic-source split from the user's real Studio data, which is
the exact distinction this article's readers need (confirming whether
Suggested specifically dropped, vs. a broad decline the reader is
misreading as a "stopped recommending" event). This is a different
category of the same tool, not a repeat of the same sentence.

---

## 6. PAA and FAQ sourcing

Raw PAA across the 4 query variants (`research/rounds/entry-11-queries-raw.json`):

- "Why is YouTube not suggesting my videos anymore?"
- "Why is my YouTube not showing recommended videos?"
- "What happened to my recommended videos on YouTube?"
- "What is going on with YouTube right now in 2026?" (off-topic generic, already addressed differently on #10)
- "Why did my YouTube recommendations suddenly change?"
- "How many views do I need to make $10,000 a month on YouTube?" (off-topic, monetization cluster)
- "Why are my YouTube views suddenly dropping?" (belongs to #9, not this entry)
- "Why did my YouTube views suddenly drop?" (belongs to #9)
- "How many YouTube views do I need to make $2000 a month?" (off-topic)
- "Why is YouTube suggesting videos with no views?" (different question, about low-view videos appearing in MY feed, not about MY video being suggested, off-topic)
- "What is going on with YouTube views right now?" (off-topic generic)
- "Why did YouTube suddenly stop recommending my videos?"
- "Why is my YouTube not showing suggested videos?"
- "What happened to YouTube suggested videos?"
- "How do I get suggested videos back on YouTube?"

Filtered and deduplicated to the most distinct on-topic questions not
already used on #9 or #10:

1. "Why is YouTube not suggesting my videos anymore?" — real PAA, verbatim
2. "What happened to my recommended videos on YouTube?" — real PAA, verbatim
3. "Why did my YouTube recommendations suddenly change?" — real PAA, verbatim
4. "Why did YouTube suddenly stop recommending my videos?" — real PAA, verbatim (close to #1 but the direct target-query phrasing, keeping both since they're genuinely how two different searchers phrase it)
5. "How do I get suggested videos back on YouTube?" — real PAA, verbatim (the recovery-focused question, distinct intent from the diagnostic ones above)

5 of 5 genuinely PAA-sourced, each checked against the raw JSON above
before writing this log.

**Updated 2026-10-03** after the user pasted a fresh PAA pull for this
exact query. Checked it against the 5 questions above: "What happened to
my recommended videos on YouTube?" matched verbatim (kept as-is). Two new,
more current real phrasings appeared that weren't in the original pull:
"Why is YouTube not pushing my videos?" and "How do I get YouTube to
recommend my videos?" Swapped these in for #3 ("Why did my YouTube
recommendations suddenly change?", a weaker near-duplicate of #1) and #5
(the older "suggested videos back" phrasing), since the new pull's wording
is closer to live, current search demand. Final shipped set:

1. "Why is YouTube not suggesting my videos anymore?"
2. "What happened to my recommended videos on YouTube?"
3. "Why is YouTube not pushing my videos?"
4. "Why did YouTube suddenly stop recommending my videos?"
5. "How do I get YouTube to recommend my videos?"

All 5 verbatim-matched against a real PAA pull (3 from the original
research round, 2 from the 2026-10-03 fresh pull), none invented.

---

## 7. Outline (draft, for approval)

1. Open leading with the direct answer and the single most current fact:
   session contribution, not watch time alone, is the leading 2026 signal
   for Suggested placement, name the real distinction between causes
   immediately (algorithm response to session contribution vs. a video
   aging out vs. viewer feedback vs. a self-inflicted cause like paid
   promotion), no scene-setting.
2. Section: Shorts and long-form are different problems now. State the
   late-2025 decoupling plainly up front, since a reader with a Shorts-only
   drop needs to stop looking at long-form causes entirely, and vice versa.
   This section alone answers real, repeated search demand nothing else in
   the top 10 addresses directly.
3. Section: Session contribution and satisfaction signals (the current
   mechanic), explained plainly: a video that ends a viewing session gets
   placed less in Suggested than one that leads into another video.
4. Section: Poor optimization / inconsistent topics / irregular posting
   (the "this is something you can fix" cluster, tubebuddy.com's 3 causes
   condensed, cross-referencing without repeating #10's phrasing).
5. Section: A video ages out as newer uploads replace it (confirmed from 2
   independent Reddit threads, explain the mechanic plainly).
6. Section: Viewers are telling YouTube not to show it ("Not Interested" /
   "Don't recommend this channel"), with the real Mozilla-study numbers
   (43% / 11% effectiveness), framed as "real but only partially
   effective, one click doesn't erase a video."
7. Section: Paid promotion, presented honestly as a contested, not-settled
   cause, creator reports on one side, YouTube's own stance on the other,
   rather than asserting either as fact.
8. Section: Is this a platform-wide event? (brief, cross-link to #9's
   fuller ad-blocker/counting-shift coverage rather than repeating it,
   plus the Restricted Mode myth-bust from ppc.land, genuinely new here).
9. Differentiator: Channel Audit's Traffic Source Intelligence category
   confirms whether Suggested specifically dropped vs. a broader decline.
10. FAQ (5 questions above).
11. Closing H2: plain, declarative.

Anchor link: up to `/blog/youtube-channel-not-growing`. Also-link:
`/blog/youtube-algorithm` (natural tie-in on the recommendation-signals
section). Cross-link to `/blog/youtube-views-dropped-suddenly` for the
platform-wide-event section rather than re-explaining the ad-blocker
finding. CtaCard: Channel Audit.

Title direction: avoid the "Why Did My YouTube X Drop/Stop Suddenly?"
template used on #9 and #10. This is the third entry in the same anchor
group in a row; title and structure both need a genuinely different shape,
not just a different noun. Candidate direction: lead with the real
distinction ("Three Reasons..." or a direct statement of the video-aging
mechanic, which is the most differentiated finding) rather than a question
mirroring the prior two titles.

Slug: `youtube-stopped-recommending-videos` (4 words, within the 2-4 word
limit... actually 4 words, at the limit, matches the primary query shape).
