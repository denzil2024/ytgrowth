# Mediavine Readiness — Working Status

Living doc. Read this first before doing any Mediavine-related work, and update it
whenever you make a relevant change. Anyone (human or a new Claude session) picking
this up should be able to know exactly where we are from this file alone.

Last updated: 2026-07-09

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
