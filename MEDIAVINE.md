# Mediavine Readiness — Working Status

Living doc. Read this first before doing any Mediavine-related work, and update it
whenever you make a relevant change. Anyone (human or a new Claude session) picking
this up should be able to know exactly where we are from this file alone.

Last updated: 2026-07-10

## Goal

Get approved for **Journey by Mediavine** (the on-ramp tier), then graduate to full
Mediavine. Journey fits our current size; full Mediavine does not yet.

## Key verified facts (2026, with sources)

- **Journey entry:** 1,000 monthly sessions minimum. We are right at ~1,000, so this
  is borderline, not comfortable. (mediavine.com/mediavine-requirements, Productive Blogging)
- **Full Mediavine ("Official") entry:** $5,000+ annual ad revenue (legacy 50,000
  sessions path may still exist; sources conflict). Revenue-tier model as of Jan 2026.
- **Journey revenue share:** 70%. Graduates to Official at $5,000 ad revenue.
- **Exclusivity:** Mediavine requires 100% exclusivity on programmatic ads. We CANNOT
  run Ezoic (or AdSense display) alongside Journey. It is one or the other. Affiliate
  links are fine.
- **Content bar:** original, audience-first content; clean, human, brand-safe traffic;
  good AdSense/AdExchange standing; reader experience that supports premium ads.
- **Premium-traffic clause:** they evaluate whether enough traffic comes from top
  countries (US/UK/CA/AU). A low tier-1 percentage is a common rejection reason. This
  is our single biggest risk.
- **Rejections give NO specific reason** (generic email + link to guidelines). Reapply
  after a few months; for Journey, email help@journeymv.com to reset. So we MUST get it
  right before applying — there is no useful feedback loop.
- **Thin content** (Google's definition, which Mediavine uses): a page with little or
  no original value. Four types: auto-generated, aggregated (data compiled without
  original analysis), scraped, doorway.

## Current state (2026-07-09)

- ~1,000 sessions/month. Audience is India-heavy (India 277 vs US 86 in the last 28d),
  ~57% of sessions from AI-assistant referrals (ChatGPT/Gemini/etc.).
- Strong, genuine content: 45 long-form blog posts, 15 free tools, 6 feature pages.
  These carry the application.
- The liability was the programmatic pages: templated data pages (channel-stats
  leaderboards + per-niche/country earnings pages) that were both thin content and
  magnets for low-tier traffic.

## The two blockers before we apply

1. **Thin content cleared** (programmatic pages handled).
2. **Tier-1 (US/UK/CA/AU) is the plurality of traffic**, sustained ~60 days before we apply.

## Progress log

- **[DONE 2026-07-09]** Deleted the low-tier country programmatic pages. Cut India
  (stats) and India/Pakistan/Indonesia/Philippines/Nigeria/Ukraine (earnings). 99 URLs
  removed, sitemap 332 → 233. Kept US/UK/CA/AU (stats) and US/UK/CA/AU/Germany
  (earnings). Commit 56b574f74. No broken links (all cross-links are data-driven).
- **[DONE 2026-07-09]** Retired the thin combo layer: the 56 stats country×category
  combos and the 70 earnings niche×country combos. 126 URLs removed, sitemap 233 → 107.
  Kept the hubs (14 category stats, 4 country stats, 14 niche earnings, main hubs). The
  two combo page components now redirect to their parent hub (country hub / niche hub),
  and the hub-to-combo internal links were removed (the "See full top 50" links on the
  country hub and the "Filter by country" section on the category hub). No broken links.
- **[IN PROGRESS]** Enrich the ~33 hubs into genuine, non-templated quality pages.
  Finance + gaming are DONE and shipped (commit ed41ba7b4, pushed, live on ytgrowth.io).
  They are the two reference hubs. See the full playbook in "Hub enrichment" below before
  touching the rest.
- **[TODO]** Build tier-1 topic clusters (genuine unique articles, Windsor.ai use-case
  style) targeting US/UK/CA/AU intent: monetization, sponsorship rates, tool comparisons.

## Tier-1 traffic push — THE PRIORITY WORK (rank existing pages first)

Added 2026-07-10 from Search Console (last 3 months). Numbers below are the UNITED STATES
filtered export (not all-countries), so this is real tier-1 data, not attribution guessing.

### The key finding

Tier-1 is ALREADY the majority of our impressions. We just rank too low to earn the
clicks. Fix rank on pages US users already see, and the country mix shifts toward tier-1
without writing anything new. That is the fastest path to the Mediavine tier-1 blocker.

US alone: 30,625 impressions, avg position 30.6, but only 23 clicks (0.08% CTR) because we
sit on page 3+. US is ~half of all ~60,000 site impressions. UK/Canada/Australia add only
~5,800 combined and hit the same pages, so fixing the US targets serves all of tier-1.

So the order is: (1) rank the existing high-impression US pages, THEN (2) new tier-1 topic
clusters, THEN hub enrichment. Do NOT start blind work on hubs or new articles before the
ranking wins are taken.

### Target pages (US-verified) — ranked by US impressions

Status column: tick as each is audited + fixed + shipped.

| Page | US impressions | US position | Intent | Status |
|---|---|---|---|---|
| blog/youtube-keyword-research-tools | 3,887 | 53.4 | keyword tool | [ ] |
| features/keyword-research | 2,969 | 70.6 | keyword tool | [ ] |
| blog/youtube-trends | 1,516 | 26.9 | trends | [ ] |
| blog/google-adsense-youtube | 765 | 38.2 | money | [ ] |
| tools/youtube-keyword-research | 660 | 70.2 | keyword tool | [ ] |
| blog/youtube-analytics | 544 | 35.9 | analytics | [ ] |
| blog/youtube-rpm | 541 | 28.6 | money | [ ] |
| blog/youtube-analytics-tools | 535 | 65.8 | tool | [ ] |
| blog/what-is-youtube-seo | 500 | 66.5 | seo | [ ] |
| blog/youtube-cpm | 422 | 32.9 | money | [ ] |
| blog/youtube-description-template | 401 | 55.0 | seo | [ ] |
| tools/youtube-money-calculator | 365 | 89.0 | money | [ ] |
| features/competitor-analysis | 291 | 69.9 | tool | [ ] |
| blog/best-youtube-mic | 277 | 23.7 | gear | [ ] |
| blog/vidiq-review | 275 | 33.4 | review | [ ] |
| blog/youtube-tags | 250 | 55.7 | seo | [ ] |
| youtube-stats | 190 | 54.2 | tool | [ ] |

### Audit finding 2026-07-10 — the keyword-tool cluster is authority-gated, DEPRIORITIZE

Audited the biggest cluster (rows 1, 2, 5: keyword-research blog + feature + tool page)
against the live SERPs. Conclusion, verified not guessed:

- The BLOG post already ranks page 1 (~position 6) for the comparison query "best free
  youtube keyword research tools 2026". Its ugly position-53 average is dragged down by the
  singular "free ... TOOL" queries, where Google ranks usable tools, not articles. An
  article structurally cannot win those. The post is already comprehensive (more tools than
  any page-1 competitor) and is NOT thin. Its ceiling is mostly reached.
- The TOOL page (/tools/youtube-keyword-research) is the correct-intent vehicle for the big
  "free tool" cluster, has the correct title tag, is well-built (working tool + popular-
  keyword browser + how-it-works + 10 FAQs, NOT thin) and already has 10 internal blog links.
- It still sits at position 70 for ONE reason: domain authority. Page 1 is Ahrefs, Semrush,
  vidIQ, keywordtool.io, keyword.io, RyRob — DR-90 giants. No on-page edit leapfrogs them
  soon. Padding either page would just be the thin-content addition we banned.

So: the keyword-tool cluster is our biggest impressions but the SLOWEST to win. Do NOT grind
it now. Leave both pages as-is (they are already good). Revisit once domain authority rises.

### The near-term win is the STRIKING-DISTANCE posts (position ~27-38, beatable competition)

These already sit close to page 1 AND their SERPs are mid-tier blogs (uppbeat, vidiq,
epidemicsound, sproutsocial, tubelab, gumlet), not authority walls. Verified via live search.
Real climbs from page 3 to page 1 are realistic here. Work order, most-winnable first:

| # | Page | US impr | US pos | Why winnable | Status |
|---|---|---|---|---|---|
| 1 | blog/youtube-trends | 1,516 | 26.9 | most impressions of the group, mid-tier SERP; needs 2026 freshness (YouTube killed the Trending tab July 2025) | [~] in progress |
| 2 | blog/youtube-rpm | 541 | 28.6 | money intent, beatable blog SERP, feeds the monetization cluster | [~] in progress |
| 3 | blog/youtube-cpm | 422 | 32.9 | money intent, pairs with rpm | [~] on-page done |
| 4 | blog/google-adsense-youtube | 765 | 38.2 | high impressions, money intent | [ ] |
| 5 | blog/youtube-analytics | 544 | 35.9 | analytics intent, mid SERP | [ ] |

### What actually moves a page to page 1 in the US (do NOT mistake polish for ranking)

Hard lesson, flagged by the user 2026-07-10 after the cpm pass: on-page polish (bold density,
extra FAQs, tidy structure) is LOW leverage for climbing a competitive US SERP. Do not treat
it as the optimization. The real levers, in order of impact:
1. Authority (backlinks + domain strength). Dominant factor. US page 1 for cpm/rpm is vidiq,
   Shopify, mediacube, uscreen (DR-80+). Content parity does not beat them. This is the same
   wall as the keyword-tool cluster. It needs an OFF-PAGE plan (linkable assets, digital PR,
   outreach), not post edits. Be honest that on-page alone may cap at top-of-page-2.
2. Being the demonstrably BEST + most UNIQUE answer, not just complete. Our edge competitors
   can't copy: our own data + our free calculators/tools embedded in the page (earns links,
   AI citations, dwell time). Lead with this, it is our moat.
3. Title + meta built for CTR. A real, controllable on-page lever. Optimize the title (include
   the year, the head query, a reason to click). We had been ignoring it.
4. Freshness + intent match.
5. On-page polish (bold, structure). Marginal. Necessary hygiene, not a strategy.

So per page: (a) do the content/intent/freshness/title work here, (b) but the climb to US page 1
depends on 1-2, which are separate, bigger tracks. Surface that honestly instead of implying
edits alone will rank it.

### Mistakes made this session — do NOT repeat (user-flagged 2026-07-10)

Read before touching another page. These are the exact things the user called out.
1. RUSHING. Racing through pages, ending turns with "want me to move to the next?", treating
   speed as the goal. The user said repeatedly: "stop the hurry", "we are not in a hurry", "do
   a quality job". One page done excellently beats three done shallow. Do not push to move on.
2. COSMETIC POLISH SOLD AS OPTIMIZATION. Bolding phrases, adding a stray FAQ, tidy structure,
   framed as "optimizing for ranking". It is hygiene, not a ranking lever. The user: "your
   approach is really lazy... so poor". Lead with the REAL levers (see the ranking-reality
   section above): authority/backlinks, unique best-answer value (our tools/data), title/CTR.
3. NOT LEADING WITH RESEARCH / DEPTH. Had to be pushed into "heavy research", "compare to the
   top 10", "understand user intent". Do that FIRST, unprompted, every page: pull the live
   top-10 US SERP, map the union of what they cover, find real gaps, understand intent.
4. SCREENSHOTS FOR PROSE. Wasting time screenshotting content edits. Screenshots are for PAGE
   DESIGN work only, never for copy/content changes.
5. VERBOSITY. Long, dense replies the user will not read ("I can't read all these"). Lead with
   the answer, few lines. See [[feedback_be_brief_always]].
6. VICTORY LAPS / OVER-CLAIMING. "This will have an upper hand" before it is earned. Be honest
   about what is done vs. what actually ranks (authority gap). See [[feedback_be_keen_always]].

### The lens for ALL of this: satisfy intent completely (AI search is our #1 source)

Hold this while improving every page. AI assistants (ChatGPT, Claude, etc.) are ytgrowth's
number-one traffic source, and 2026 research on how people search now makes the standard
clear:
- LLM queries average ~23 words, almost 6x longer than keyword search. People describe the
  whole problem in full questions, not "caveman" keywords (SOCi 2026 LVI, Feb 2026).
- AI Overviews / answers cluster on 6-15 word questions, barely on 1-2 word head terms
  (NP Digital). Long-tail question intent wins; head terms fade.
- It is ~30x harder to be cited in an AI answer than to rank traditionally, because AI
  returns few sources. Winner-take-most: the page that answers the WHOLE question gets the
  citation, the rest get nothing.
- Query fan-out: one prompt is split into many sub-queries pulled from different pages, so a
  page that covers the full sub-question space gets cited across many related prompts.

What this means for the work (positive framing): the shift rewards exactly what we already
do well, so lean in. On every page:
- Answer the searcher's real intent so completely that an AI would rather cite us than anyone.
  Comprehensiveness is now the mechanic, not just a style nicety.
- Target the actual questions people ask AI in our niche (proxies: our own GSC conversational
  queries, which pages already earn AI-assistant referrals, question-style long-tail).
- Structure for citation (AEO): question-phrased headings, a direct 2-3 sentence answer right
  under each, FAQ schema.
- Favor what survives zero-click: our free tools/calculators (an AI can't run them in-chat)
  and deep guides people actually open. Bare "definition" posts are the most exposed.
- When auditing a page, check for INTENT/QUESTION gaps too, not only competitor-section gaps:
  what is the reader (or the AI on their behalf) really trying to accomplish, and does the
  page fully close it?

### How each page gets fixed (one page at a time, no blind work)

1. Audit against the live top-ranking pages FIRST; build a coverage matrix; present it.
   Check for intent/question gaps too (see the lens above), not just missing sections.
2. Match search intent and freshen anything stale (dates, 2026 platform changes).
3. Cover the union of what page-1 competitors cover PLUS what they ignore. No thin filler.
4. Structure for AEO/citation: question headings + direct answer blocks + FAQ schema.
5. Keep house style/tone (latest post as the bar): flowing prose, 3-4 line paras, no
   "actually", no em-dash, CtaCard mid-article, creative final H2.
6. Internal links, BOTH directions. The one that passes authority is INBOUND: audit which
   strong, topically-relevant pages already link to the target (grep `href="/blog/<slug>"`),
   then add natural contextual links from the relevant ones that don't yet. Never force a link
   where there is no genuine spot (that is stuffing, it hurts). Under-linked pages gain most.

### Progress
- [DONE 2026-07-10] Pulled US Search Console data. Audited the keyword-tool cluster: found
  it authority-gated (see above), deprioritized it. Reprioritized to the striking-distance
  posts.
- [IN PROGRESS 2026-07-10] blog/youtube-trends. Audit found the article was NOT thin (covers
  more than the page-1 mid-tier competitors), but taught the YouTube Trending tab as a live
  feature across a full section, a workflow row, and 3 FAQ answers. YouTube retired that tab
  in July 2025 (announced 07-10, live 07-21, replaced by category YouTube Charts). Rewrote
  the "Trending Tab" section into "What Replaced the YouTube Trending Tab" (Charts + current
  discovery), fixed the Charts paragraph, the Monday workflow row, and 3 FAQ answers; bumped
  updated date to 2026-07-10. Removed the now-misleading old-Trending-tab screenshot (no
  replacement fabricated). Then a style pass: rewrote the intro stronger (dropped the "timing
  is everything" cliche, bolded the thesis), tripled bold-emphasis density (16 to ~39, to
  match strong posts), split 5 over-long paragraphs to 3-4 lines.
  Then a full "optimize for Google + LLM search" pass (the intent lens above):
  - Added a genuine "How to Find Trending YouTube Shorts" H2 (real GSC demand the page missed:
    trending Shorts formats/sounds, the new in-feed Shorts Trends page, audio-page depth check,
    Content ID caution). Plus a matching FAQ. Not padding, a distinct high-demand sub-intent.
  - Closed the FAQ-schema gap: BlogPost.jsx only emitted BlogPosting + BreadcrumbList. Added a
    reusable optional `faqs` array on the post + FAQPage JSON-LD in BlogPost.jsx (emits only
    when a post carries `faqs`; text mirrors the visible FAQ so Google accepts it). This is now
    available to EVERY future post, not just this one.
  Verified: both files esbuild-parse (exit 0); all paragraphs <=5 lines; no "actually"/em-dash;
  visible FAQ (6) == faqs array (6). NOT built, NOT committed, NOT pushed (batch, do not push).
  Charts screenshot: user supplied youtube-trends-charts.png (531KB/1748px); optimized to
  youtube-trends-charts.webp (45KB/1600px) to match the other blog images and protect
  PageSpeed, wired into the Charts section with descriptive alt, deleted the heavy PNG.
  OPEN ITEMS before shipping: (1) user review on the live dev page
  http://localhost:5174/blog/youtube-trends; (2) rebuild dist before any eventual commit.
  REUSABLE going forward: add a `faqs` array to every striking-distance post we touch so each
  one emits FAQPage schema (big AEO win, near-zero cost).
- [IN PROGRESS 2026-07-10] blog/youtube-rpm. Studied full article + live competitor SERP.
  Verdict: already strong/accurate/current, not a rescue. Closed evidenced gaps:
  1. Added a "YouTube RPM by Country" H2 + table (US/UK/CA/AU tier-1 + Germany/UAE/Brazil/India
     for contrast), reconciled from two 2026 sources. Every RPM competitor has a country table;
     we had none, and our own GSC is full of "rpm in india/usa", "how much does youtube pay in
     canada/uk/australia". Doubles as tier-1 reinforcement. Internal link to /youtube-earnings.
  2. Added FAQPage schema (`faqs` array, 7 Qs) + 2 new visible FAQs: "How much does YouTube pay
     per 1,000 views?" and "Why did my RPM suddenly drop?" (both high-volume adjacent intents).
  3. CORRECTNESS FIX found in research (would have been stale otherwise): YouTube moved mid-roll
     placement to a HYBRID model in May 2025. Our article recommended manual-only, which can now
     REDUCE revenue (YouTube auto-adds mid-rolls; keeping both on tested ~5% higher). Fixed both
     the determinant subsection and increase-lever #2 (incl. its heading) to the current advice.
  Then a top-10-SERP coverage pass (compared against Google Help, vidiq, epidemicsound,
  mediacube, uppbeat, tubeanalytics, lenos, ytmoneycalculator, the Medium case study).
  Intent for "youtube rpm" = understand the number + know what's normal for my niche/country
  + increase it; we cover all three deeper than any single competitor. Closed 3 genuine union
  gaps competitors had and we lacked: (a) "what RPM leaves OUT" (sponsorships/affiliates/merch
  are excluded; RPM != total income), (b) made-for-kids content earns far lower RPM (no
  personalized ads), added as an FAQ, (c) the VPN/creator-location myth (YouTube reads viewer
  geography), folded into the geography FAQ. Also reconciled a redundancy my country section
  created with the "Audience Geography" determinant (reframed it to complement, not repeat).
  Deliberately SKIPPED device/Connected-TV RPM (couldn't source a clean directional claim).
  Bumped updated date to 2026-07-10. Verified: parses (exit 0); all paras <=5 lines; no
  actually/em-dash (caught + fixed one "actually" I introduced); visible FAQ (8) == faqs array
  (8); all 6 images resolve. NOT built/committed/pushed (batch). Open: user review at
  http://localhost:5174/blog/youtube-rpm.
- [ON-PAGE DONE 2026-07-10] blog/youtube-cpm (US pos ~33 / all-country ~16). Studied full
  article + top-10 US SERP (mediacube, lenos, Google Help, Shopify, uscreen, vidiq, uppbeat,
  travelpayouts, vloggingpro). Already comprehensive AND already had a CPM-by-country table
  (unlike rpm), so no country gap. Done: FAQ schema (`faqs`, 7 Qs) + 2 new FAQs (how much per
  1,000 views; made-for-kids lower CPM) + VPN/viewer-location clarifier; enhanced the retention
  lever with the 2026 shift (engagement velocity + return-viewer rate now decide which videos
  get PREMIUM ads, 150k loyal can out-earn 500k shallow); raised bold density 16 -> 25 (hygiene,
  NOT the ranking lever, per the lesson above); TITLE optimized for CTR/freshness ("YouTube CPM
  Rates 2026: Best Niches and How to Maximize Ad Revenue", the one real on-page ranking lever we
  had ignored); updated date -> 2026-07-10. Inbound links already healthy (9, cross-links rpm).
  Verified: parses (exit 0); all paras <=5 lines; no actually/em-dash; visible FAQ (7) == faqs
  array (7). NOT built/committed/pushed. Open: user review at http://localhost:5174/blog/youtube-cpm.
  NOTE: "on-page done" != "will rank page 1 US". Per the ranking-reality section above, the US
  climb for cpm/rpm depends on AUTHORITY (off-page), which is a separate track not yet started.

## Hub enrichment — READ THIS BEFORE TOUCHING A HUB

Goal: make each kept hub a genuine, original, non-thin resource. NOT by stamping the same
section template on every page. Each hub gets its own shape and its own content.

### Where things stand
- **Done and shipped (commit ed41ba7b4):** the `/youtube-stats` category hubs `finance`
  and `gaming` are the two reference implementations, live on ytgrowth.io. To iterate
  locally, run the dev server (`cd frontend && npm run dev` →
  http://localhost:5173/youtube-stats/finance and `/gaming`). The leaderboard is empty
  locally (backend off); that is expected.
- **Remaining:** get the user's sign-off on finance + gaming FIRST, then continue one hub
  at a time, then build + commit + push. Explicit tracker below.

### Page tracker (tick as done)

Category stats hubs — `youtube-stats/:slug`, data in `youtubeStatsCategories.js`:
- [x] finance (reference)
- [x] gaming (reference)
- [ ] tech
- [ ] beauty
- [ ] cooking
- [ ] fitness
- [ ] music
- [ ] education
- [ ] vlogs
- [ ] travel
- [ ] comedy
- [ ] sports
- [ ] entertainment
- [ ] news

Country stats hubs — `youtube-stats/country/:slug`, data in `youtubeStatsCountries.js`
(same `YoutubeStatsCountry.jsx` component; would need its own sections wiring):
- [ ] united-states
- [ ] united-kingdom
- [ ] canada
- [ ] australia

Earnings niche hubs — `youtube-earnings/:niche`, SEPARATE component `NicheEarnings.jsx`,
data `youtubeEarnings.js` `EARNINGS_META` (sections model not built here yet):
- [ ] finance
- [ ] tech
- [ ] education
- [ ] news
- [ ] beauty
- [ ] fitness
- [ ] travel
- [ ] cooking
- [ ] vlogs
- [ ] sports
- [ ] gaming
- [ ] comedy
- [ ] entertainment
- [ ] music

Also un-migrated: the main `/youtube-stats` hub index and `/youtube-earnings` (`ToolsHub`)
listing — decide whether they need enrichment or stay as directory pages.

### How it is built
- Component: `frontend/src/pages/YoutubeStatsCategory.jsx` renders a per-hub `sections`
  array. Each section has a `kind`: `prose` (eyebrow + heading + paragraphs), `breakdown`
  (title + description rows), or `table` (columns + rows). The old templated "What
  separates the top X channels" highlights block is gated with `{!category.sections && ...}`
  so any hub with its own `sections` skips it. Add new `kind`s (comparison, myth-vs-reality)
  here when a niche wants them.
- Data: `frontend/src/data/youtubeStatsCategories.js` — each category's `sections` array.
  Finance shape = prose + breakdown. Gaming shape = prose + table + breakdown. Every hub
  must be a DIFFERENT shape; do not give them all the same sequence.
- Earnings niche hubs are a SEPARATE component/data (`NicheEarnings.jsx` /
  `youtubeEarnings.js` `EARNINGS_META`); they will need their own sections work.

### The formatting (use ONLY these tokens — do not invent)
- Section headings: class `yts-h2` (Fraunces, weight 300, light). Genuinely written per
  page — never a formula like "What the {niche} leaderboard shows".
- Body paragraphs: class `yts-lead` (Barlow, weight 400).
- Breakdown subheads (`h3`): Fraunces (SERIF), fontSize 21/23, **fontWeight 400**. This is
  the correct original look. Do NOT shrink them to Barlow or a smaller size.
- Table: class `yts-data`. `th` = Barlow 600 uppercase muted; `td` = Barlow 400; first
  column `td.lead` = Barlow 600 ink.
- Eyebrows: the `Eyebrow` component (Barlow 600 uppercase red). Must be DISTINCT per
  section and per hub — no repeated "The landscape" across pages.

### The writing (house standard)
- Paragraphs 3-4 lines (5 only when forced). Split long ones.
- Sentences tight, not long-winded. No 35-40 word run-ons stitched with "because / which
  is why / and".
- Every paragraph OPENS with a full substantive sentence. No short fragment openers
  ("It comes down to X." / "That is why Y.").
- Authoritative expert voice. No aphorisms or advice-blog clichés ("hype gets punished,
  clarity gets rewarded"), no casual asides ("smell a pitch", "scroll on").
- Concrete and specific: real numbers, named creators (e.g. Dave Ramsey, Graham Stephan),
  real dynamics. That specificity is what makes a page not-thin.
- Banned: the word "actually" anywhere; em-dashes; italics.
- FAQs: lean toward more (8-9), each genuinely helpful and distinct, not padding.

### Mistakes made in the build-out (do NOT repeat)
1. **Over-reverting.** When the user flags a small formatting issue, fix that one thing.
   Do NOT `git checkout HEAD -- <file>` to wipe uncommitted enrichment — it destroys work
   that was never committed and cannot be recovered from git.
2. **Same shape on every hub.** Landscape + playbook on all pages is just a new template.
   Each hub needs a different composition of sections.
3. **Inventing type weights/sizes.** A heavy Fraunces subhead out-bolds the light heading;
   over-correcting by shrinking to small Barlow was also wrong. The answer is Fraunces 400
   at 21/23 (see formatting above).
4. **Generic labels/headings.** "The landscape" on every page, or "What the X leaderboard
   shows" formulas. Make eyebrows and headings distinct and specific per page.
5. **Filler prose.** Aphorisms and generic advice read as thin. Write concrete, authoritative,
   specific copy.
6. **Removing content the user approved.** When simplifying, only change what was flagged;
   do not drop sections/tables that were working.
7. **Not looking before declaring done.** ALWAYS screenshot the page and read it before
   saying a UI change is done (see verification below). Multiple back-and-forths came from
   guessing instead of viewing.
8. **Acting before understanding the request.** The user said outright "I told you to stop
   because you did not understand." When an instruction is ambiguous, do NOT rebuild or
   delete on an assumption. Restate the specific intent in one line, or make one small
   reversible change and show it — never take a large or destructive action on a guess.
9. **Changing more than what was flagged.** When the user points at one thing (a label, a
   font weight, a heading), change ONLY that. Do not also convert content to a different
   format, drop a table, or restructure the section. Several loops came from "fixing" one
   detail while silently altering others.
10. **Misreading "revert" / "the formatting".** "Revert to how they were" meant revert the
    FORMATTING, not delete the section. "The formatting we had in finance" meant keep the
    serif subheads at full size. Read these literally and confirm scope before acting.
11. **Verbosity.** The user repeatedly asked for brevity ("keep it brief", "stop the
    stories", "you write too much"). Answer in a few lines, state results and decisions,
    do not narrate deliberation or list options you won't pursue.

### Verify before declaring a hub done
- `node --check frontend/src/data/youtubeStatsCategories.js` (data parses).
- `npx esbuild frontend/src/pages/YoutubeStatsCategory.jsx --outfile=/dev/null` (component
  parses; exit 0).
- Screenshot the live page with puppeteer against http://localhost:5173/... and READ it.
- Scan the changed hub for the banned word "actually" and em-dashes.
- Confirm eyebrows/headings do not repeat another hub's.

## Content philosophy (the lesson we learned)

Programmatic was never the problem; **granularity + templating** was. Genuine, unique
content is sustainable at the topic/niche level (blog posts, hubs). Country-crossed
combos sit below the level where a truly unique page can exist, so they go. The model to
copy is Windsor.ai's use-case cluster: one genuine article per real, distinct intent, not
one templated page per data permutation.

## Do NOT

- Apply before both blockers are cleared. There is no rejection feedback, so a premature
  application just burns months.
- Run another programmatic ad network alongside Journey (exclusivity).
- Recreate a hyper-granular templated page layer to chase long-tail permutations.
