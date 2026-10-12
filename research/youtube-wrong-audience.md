# Research: youtube-wrong-audience

Plan entry: `#17` · Feature: `Channel Audit`
Target query: `why is youtube showing my video to the wrong audience`
Researched: `2026-10-11`

---

## 1. SERP (7 queries total, scripts/serper-batch.mjs) — top-3 confirmed

Top-3 consistent: **reddit, youtube.com, facebook/blackhatworld**,
matching the plan entry. PAA: "Why is YouTube showing/suggesting my
videos to the wrong audience?" is the #1 real PAA hit on 6 of 7 pulls,
strong, direct, confirmed demand.

## 2. Cannibalization check

`/blog/youtube-algorithm` is a broad "how discovery works" explainer,
no wrong-audience diagnostic angle. Confirmed clear to write.

## 3. Competitor research

**ytthumbnails.org** (full read) — real, structured article, 7 causes:
niche-jumping, thumbnail/title mismatch, vague metadata, cross-niche
collabs, early-viewer skew, inconsistent format, stale metadata. Fixes:
narrow the niche, honest packaging, per-video metadata, format
consistency, let realignment happen over several uploads.

**blackhatworld.com** thread — blocked (403), reconstructed via
secondary sourcing: a real creator case where views fell sharply while
CTR held steady, read by commenters as a sign the video got tested with
a mismatched audience pool, not a quality problem.

**Google's own help page** (support.google.com/youtube/answer/141805,
via secondary sourcing) confirms the real mechanism: ranking depends on
performance **relative to the audience a video is tested with**, not an
absolute score. This is the differentiator: no competitor explicitly
separates "bad video" from "good video, wrong test pool," they jump
straight to generic packaging advice.

## 4. The real differentiator

**The CTR-holds-steady-but-views-fall signal is the tell**, and no
competitor article uses it as a diagnostic. ytthumbnails.org's 7 causes
are all real and worth covering, but the piece never tells a reader how
to confirm which one applies from their own Studio data. This site's
Channel Audit, which already reads CTR/retention/traffic-source signals,
is a natural fit: it can separate "this is a packaging problem" (CTR
genuinely low) from "this is a wrong-audience problem" (CTR fine,
suggested/traffic-source mismatch) using the creator's real numbers
instead of guessing from a checklist.

## 5. PAA (logged real vs. editorial)

Real PAA, verbatim, confirmed across multiple pulls:
1. "Why is YouTube showing my videos to the wrong audience?" — real
2. "Why is YouTube suggesting my videos to the wrong audience?" — real
   (near-duplicate, kept distinct)
3. "Can I turn off the YouTube algorithm?" — real, on-topic (addresses
   the "make it stop" instinct directly)
4. "Why is my YouTube recommending weird videos?" — real, adjacent
   (viewer-side framing of the same confusion, worth addressing)

Filtered off-topic: the "$2,000/$10,000 a month," "7 second rule," "is
3% CTR good" clusters (known false-positive patterns).

4 of 4 used FAQs are real PAA, 0 editorial needed.

## 6. Outline (for approval)

1. Open with the real tell: CTR holding steady while views fall points
   at a test-audience mismatch, not a packaging failure, the distinction
   no competitor draws clearly.
2. The 7 real causes (from ytthumbnails, consolidated and verified, not
   copied): niche inconsistency, thumbnail/title overpromising, vague
   metadata, cross-niche collabs, early-viewer skew, format drift, stale
   metadata on reused templates.
3. How to tell which one is yours: Studio signals per cause (CTR for
   packaging mismatch, traffic-source breakdown for collab/skew causes).
4. Why "turning off the algorithm" isn't a real option, and what
   consistency actually fixes vs. what time alone fixes.
5. FAQ (4 questions above).
6. Where Channel Audit reads the real signal instead of guessing
   (differentiator).
7. Closing H2: plain, declarative.

CtaCard: Channel Audit, per the plan entry and the differentiator above.
