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

1. **Thin content NOT cleared yet.** The worst offenders (granular combo pages) are deleted,
   but the kept hubs still need enrichment (2 of ~33 done: finance, gaming). This is PENDING,
   intentionally paused while we focus on new posts and the tier-1 ranking push. We will come
   back and expand hubs bit by bit.
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
| blog/youtube-keyword-research-tools | 3,887 | 53.4 | keyword tool | [x] SHIPPED 07-11 (light: FAQ schema + bolds + 1 inbound; authority-gated) |
| features/keyword-research | 2,969 | 70.6 | keyword tool | [ ] authority-gated, LEAVE |
| blog/youtube-trends | 1,516 | 26.9 | trends | [x] SHIPPED 07-11 (outlier method, 7-ways table, TikTok CC) |
| blog/google-adsense-youtube | 765 | 38.2 | money | [x] SHIPPED 07-11 (title, US pay numbers, FAQ schema) |
| tools/youtube-keyword-research | 660 | 70.2 | keyword tool | [ ] authority-gated, LEAVE |
| blog/youtube-analytics | 544 | 35.9 | analytics | [x] SHIPPED 07-11 (2026 features, metrics glossary) |
| blog/youtube-rpm | 541 | 28.6 | money | [x] SHIPPED 07-10 |
| blog/youtube-analytics-tools | 535 | 65.8 | tool | [x] SHIPPED 07-11 (Viewstats added) |
| blog/what-is-youtube-seo | 500 | 66.5 | seo | [x] SHIPPED 07-11 (Google-ranking + checklist; #1 inbound hub) |
| blog/youtube-cpm | 422 | 32.9 | money | [x] SHIPPED 07-10 |
| blog/youtube-description-template | 401 | 55.0 | seo | [x] SHIPPED 07-11 (6->15 templates + generator embed) |
| tools/youtube-money-calculator | 365 | 89.0 | money | [x] SHIPPED 07-13 (title fix: was missing exact head term "Money Calculator", every page-1 competitor has it; content/FAQs already comprehensive, authority-gated per Social Blade/Mediacube) |
| features/competitor-analysis | 291 | 69.9 | tool | [x] SHIPPED 07-13 (full top-10 research after a first rushed pass was called out: vidIQ, TubeBuddy, OutlierKit, Shopify, Sprout Social. 2 genuine FAQs added: vidIQ/TubeBuddy comparison, "how do I find my real competitors" (a step-1 gap both Shopify and Sprout Social guides cover that we didn't). 1 outbound link added to the sibling blog post youtube-competitor-analysis, which had 12 inbound links to this page but 0 back. Verified: parses, no banned words, both FAQs render (12 total), all answers 4-6 lines matching this page's existing norm. Real, NOT fixable via copy: OutlierKit auto-discovers 676 related channels from one seed (we require picking known channels), and has hard social-proof numbers (30M+ videos analyzed) we don't have. Feature-parity + authority gated vs. category-defining incumbents for the head term. Also caught on a second pass: llms.txt's Core Features bullet claimed the product analyzes "hook style", which is NOT one of the actual 7 dimensions (verified against the DIMENSIONS array: topics, title/SEO, posting cadence, video length, engagement, thumbnails, content gaps). Fixed the bullet to list the real 7 dimensions and the actual differentiator output (threat score, gap report with impact tags, video ideas), which llms.txt previously omitted entirely. Completed the full top-10 SERP read (added ScraperAPI, Socialinsider, Subsub, HubSpot to the earlier 5): ScraperAPI is a mismatched dev/scraping-audience result, not real competition for our intent. Found 2 more genuine intent gaps and closed them: (a) Subsub/Socialinsider/Sprout all surface a numeric self-check benchmark (e.g. "20-30% view-to-sub ratio"); added an honest version that does NOT copy their unverified fixed number, explains why a flat benchmark is misleading, and cross-links to our own Outliers tool which scores niche-relative instead; (b) Sprout Social's business/leadership-reporting framing and Socialinsider/Subsub's export emphasis exposed that our page has an Agency plan but no content speaking to that buyer; added an honest FAQ (yes for the substance of a report, no branded export yet, consistent with the existing export FAQ). 14 FAQs total now. Re-verified after each addition: parses, no banned words, all render, 13 of 14 answers at 4-5 lines (1 pre-existing 6-liner untouched).) |
| blog/best-youtube-mic | 277 | 23.7 | gear | [x] SHIPPED 07-11 (Fifine, best-for col; CLOSEST to page 1, most winnable) |
| blog/vidiq-review | 275 | 33.4 | review | [x] SHIPPED 07-13 (full top-10 read: Capterra, G2 (403), OutlierKit, Alan Spicer, ContHunt, TubeAnalytics, plus search summary covering the rest. 3 causal gaps closed: missing Coaching pricing tier (verified via 2 sources), no citable review-platform number (added Capterra 4.3/5, 61 reviews), missing extension-performance complaint (Capterra-verified). FAQs 4->7 (cancellation how-to, multi-channel/agency pricing, direct vs-TubeBuddy question, matching competitors' 8-12 FAQ depth) + added the faqs array this post never had (0 schema before). Internal links: 3->5 inbound, added from seo-tools-for-youtube and youtube-analytics-tools (both mentioned vidIQ with zero link to the review). Verified: parses, no banned words, faqs array (7) == visible FAQs (7), all paragraphs <=5 lines (caught and split 1 pre-existing 6-liner in seo-tools-for-youtube during the verification pass). Ruled out, not acted on: OutlierKit's "vidIQ has no outlier detection" claim contradicts our own accurate coverage of vidIQ's real Outliers feature, a self-serving claim from a direct competitor. Metadata: excerpt/seoMeta/sitemap/llms.txt all updated to mention Coaching tier + real rating.) |
| blog/youtube-tags | 250 | 55.7 | seo | [x] SHIPPED 07-11 (fixed FALSE thesis + tool funnel) |
| youtube-stats | 190 | 54.2 | tool | [x] SHIPPED 07-13: fixed a real trust bug first (not the ranking work yet). Page falsely claimed "updated every 24 hours" / "once per day" in 3 separate FAQ answers plus the hero text plus the meta description, and the hero badge was hardcoded to always show TODAY's date via `todayLabel()` regardless of actual data age. Real cadence (verified in app/scheduler.py) is MONTHLY, deliberately, for quota reasons. Fixed all 6 instances to state the truth honestly (with the real "ranks don't move fast" reasoning already documented in scheduler.py), and wired the badge to the real `fetched_at` timestamp already returned by /api/top-channels (confirmed it flows through to __INITIAL_STATS__ with no backend changes needed) so it never fabricates a date again; verified it renders nothing rather than a fake date when data isn't loaded. Also fixed FAQ 8, which described country breakdowns as a future "next iteration" when they are already live on the page. Sitemap lastmod bumped, llms.txt given a new entry (this hub had zero mention before). Then the user asked "is the metadata optimized" and this surfaced a much bigger version of the same bug than first found: `scripts/prerender.js` has a SEPARATE META_BY_ROUTE entry for /youtube-stats (the one crawlers/AI bots actually see in the static prerendered HTML, before client JS runs) that still said "updated daily", missed on the first pass entirely. Widening the sweep found the same false claim duplicated across the whole stats-page family: all 4 country pages' `seoDescription` fields in youtubeStatsCountries.js ("Updated daily"), the US country's own FAQ ("Once every 24 hours... daily refresh"), a templated description string in prerender.js that stamps "Updated daily" onto every retired country x category combo route, a "the daily refresh hasn't fired yet" loading-state message duplicated in both YoutubeStats.jsx and YoutubeStatsCategory.jsx, and all 19 <changefreq>daily</changefreq> sitemap entries for the entire youtube-stats family (1 hub + 14 categories + 4 countries, confirmed by exact count match that these were the ONLY daily entries in the whole sitemap) which told search engines to expect daily changes on monthly-cached data. Fixed all of it, consistent with the sibling /youtube-earnings/* pages which already correctly use monthly. Verified: all touched files parse, no banned words introduced, sitemap XML structurally validated (matched open/close url tags, valid declaration). Then completed the two ranking-gap fixes, both zero quota cost: (1) sort options (Subscribers / Views / Videos) added as a client-side toggle, re-sorting the already-cached full pool of up to 50 channels per category BEFORE slicing to the displayed 15, not re-ordering an already-truncated top-15-by-subs list (which would have silently excluded real top performers on views/videos); (2) a genuine "Who's really held #1" history section, zero live-API cost, with dates verified via a fresh web search rather than assumed from memory (PewDiePie 2013-2019, T-Series 2019-2024 incl. first-to-100M, MrBeast 2024-present incl. the real "finally avenged PewDiePie" reaction), plus an honest paragraph on why children's channels dominate today's leaderboard. Explicitly NOT expanding to more countries per user (low-tier country pages were already cut for business reasons, do not revisit). Verified: parses, no banned words (caught and fixed 2 "actually" instances), sort toggle actually clicked in a real browser and confirmed active-state changes with zero console errors, new paragraphs measured at 2-4 rendered lines. |

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
| 1 | blog/youtube-trends | 1,516 | 26.9 | most impressions of the group, mid-tier SERP; needs 2026 freshness (YouTube killed the Trending tab July 2025) | [x] SHIPPED 07-10 |
| 2 | blog/youtube-rpm | 541 | 28.6 | money intent, beatable blog SERP, feeds the monetization cluster | [x] SHIPPED 07-10 |
| 3 | blog/youtube-cpm | 422 | 32.9 | money intent, pairs with rpm | [x] SHIPPED 07-10 (on-page) |
| 4 | blog/google-adsense-youtube | 765 | 38.2 | high impressions, money intent | [ ] NEXT |
| 5 | blog/youtube-analytics | 544 | 35.9 | analytics intent, mid SERP | [ ] |

On-page work on 1-3 is done and LIVE, but per the ranking-reality section below, the US climb
still depends on off-page AUTHORITY (not yet started). "Shipped" = the page is improved and
deployed, NOT "will rank page 1". Re-check the US positions in Search Console in ~2-4 weeks.

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

The full reusable checklist (research, content, schema, metadata, internal
links, verification, deploy) now lives in `SEO-OPTIMIZATION-CHECKLIST.md` at
the repo root. Use it for every weekly optimization pass. The summary below
stays as the short version.

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
- [DEPLOYED 2026-07-10] Built (BUILD_API_URL=https://ytgrowth.io, prerender verify = 93 routes
  OK, blog meta regenerated), committed the specific files only (posts.jsx, postsMeta.js,
  BlogPost.jsx, the charts webp, MEDIAVINE.md, rebuilt dist), pushed to main. Commit 071e7389e.
  Verified LIVE on ytgrowth.io: cpm 2026 title, rpm "RPM by Country" + FAQPage, trends Charts
  section + charts image (200), cpm FAQPage. Live pages to submit for re-indexing in Search
  Console (URL Inspection -> Request Indexing):
    https://ytgrowth.io/blog/youtube-trends
    https://ytgrowth.io/blog/youtube-rpm
    https://ytgrowth.io/blog/youtube-cpm
  (also touched, one internal link: https://ytgrowth.io/blog/youtube-as-a-business, optional.)
- [DEPLOYED 2026-07-11] BIG two-track pass across the 8 remaining target pages, built + pushed
  live. Commit ec88fedfe (BUILD_API_URL=https://ytgrowth.io, verify 93 routes OK, dist rebuilt,
  specific files staged: posts.jsx/postsMeta.js/seoMeta.js + dist). Verified LIVE on ytgrowth.io
  (adsense/description-template titles, tags false-thesis gone, FAQPage present). Per page:
  - google-adsense-youtube: title -> "YouTube AdSense 2026: Requirements, Setup & How It Pays",
    concrete US pay ranges ($2-8 typical), FAQPage schema. Head term intent-gated (Google's own
    docs); wins the requirements/pay long-tail.
  - youtube-description-template: 6 -> 15 copy-paste templates (8 niche + worked example),
    EMBEDDED the description generator (was a buried link), title "15 ... Free Copy-Paste".
    THE most winnable of the batch (SERP pos 5-10 are template-count + generator pages).
  - best-youtube-mic: added Fifine AM8 (2026 budget consensus we lacked), "Best for" column,
    price ladder, FAQ schema, title with "12 Picks". Pos ~23.7 = CLOSEST to page 1, fragmented
    SERP (no DR-90 wall) = genuinely winnable on-page.
  - youtube-trends: retargeted title to "How to Find Trending YouTube Topics in 2026 (7 Free
    Ways)", added outlier-detection method + link to /features/outliers, 7-ways table, TikTok
    Creative Center, Exploding Topics, 2 FAQs.
  - youtube-analytics: "What's New in 2026" (Ask Studio, engaged views, paid/organic, device
    split) + a 13-row metrics glossary + 2 FAQs. Head term authority+intent-gated; wins metric
    long-tail.
  - youtube-analytics-tools: added Viewstats (biggest 2026 gap), "what changed in 2026 (AI)",
    2 FAQs. Authority-gated; freshness lifts it off page 6.
  - youtube-tags: FIXED A FALSE THESIS (page had claimed tags are "the primary signal" - wrong
    for 2026). Now honest (tags = minor signal), added "How to Add Tags", FAQ schema, and a
    FUNNEL to our /tools/youtube-tag-generator + hashtag-generator. Title pivoted honest.
  - what-is-youtube-seo: added "Ranking on Google" section + ranking-factor checklist table +
    3 FAQs + thumbnail specs. It is the site's #1 inbound hub (22), so NO inbound added.
  - youtube-keyword-research-tools: LIGHT pass only (FAQ schema + bolds + 1 inbound). Authority-
    gated per the finding above; left title alone (ranks page 1 for the comparison query).
  Cross-cutting this session: FAQPage schema now on every page that lacked it (all 45+ FAQ
  answers emit JSON-LD); an AI-citation BOLD pass on citable prose claims across the batch;
  and INTERNAL LINK JUICE to the starved targets (adsense 2->4, mic 0->5, description-template
  2->5, trends 4->6, analytics 10->13, analytics-tools 3->5, tags 5->7). Method locked: audit
  each page vs the live top-10 US SERP FIRST, then fix intent/title/schema/gaps + link juice +
  bolds. Honest verdict held every page (head terms authority-gated; we win the long-tail).
  GSC RE-INDEX LIST (submit via URL Inspection -> Request Indexing):
    https://ytgrowth.io/blog/google-adsense-youtube
    https://ytgrowth.io/blog/youtube-description-template
    https://ytgrowth.io/blog/best-youtube-mic
    https://ytgrowth.io/blog/youtube-trends
    https://ytgrowth.io/blog/youtube-analytics
    https://ytgrowth.io/blog/youtube-analytics-tools
    https://ytgrowth.io/blog/youtube-tags
    https://ytgrowth.io/blog/what-is-youtube-seo
    https://ytgrowth.io/blog/youtube-keyword-research-tools

- [WRITTEN, NOT BUILT/PUSHED 2026-07-11] blog/youtube-banner-size. First of the new-guide
  shortlist ("write first" bucket). Full process: learned house style from best-youtube-mic +
  youtube-thumbnail-size, researched live top-10 SERP (Snappa, Wyzowl, Kreatli + others),
  built a coverage matrix, closed a real gap (the 1235x338 minimum-canvas safe zone competitors
  had and we lacked). Built a NEW free tool to beat the competitor tool-sites' offering:
  /tools/youtube-banner-resizer (2560x1440 export, live safe-zone preview with TV/Desktop/
  Mobile tabs darkening the crop on one canvas, none of Snappa/Wyzowl/Kreatli/Kapwing combine
  resize + safe-zone preview in one flow). Found + fixed a real bug during testing (preview
  canvas was blank on first drop, canvas ref didn't exist yet on first render). Wired into
  routes/ToolsHub/SiteHeader/Landing mega-menu/prerender meta/sitemap. Added 4 REAL banner
  examples (MKBHD, MrBeast, Andrei Jikh, Jacksepticeye), fetched live via Puppeteer from
  YouTube's CDN (no API key, no quota), swapped out 2 initial picks (Graham Stephan = no
  text/branding, Markiplier = temporary movie-promo takeover, neither taught the lesson).
  Full verification pass done: FAQ schema mirrors visible content (8/8), bold density matches
  house style (~1/38 words), banned words clean, internal links added both directions
  (inbound from youtube-channel-audit, youtube-channel-optimization, youtube-sponsorships;
  outbound to youtube-thumbnail-size, youtube-channel-audit, youtube-channel-optimization),
  all images have descriptive alt text, page rendered end-to-end in-browser with zero console/
  network errors. Cover image cropped from a user-supplied real photo (no fabricated images).
  NOT built, NOT pushed, per explicit instruction (do not build until told).
- [WRITTEN, NOT BUILT/PUSHED 2026-07-11] blog/youtube-1-million-views. Second of the shortlist.
  Expanded research to the full top 10 (not just top 3) per user request, found the space full
  of wildly inconsistent guessed numbers with no shown math, used that honestly as the intro
  hook. Reconciled every figure against our OWN already-published RPM/CPM/Shorts-pay/Partner-
  Program numbers (no self-contradiction across the site) rather than reusing competitor
  numbers. Closed a real gap: the monetized playback rate (30-70%, no official YouTube figure)
  explaining why RPM < CPM. Deliberately kept lean (~2,060 words incl. FAQ) since depth already
  lives in the linked pillar posts, this page's job is the quick specific answer + calculator
  CTA. User called skip on named-creator dollar estimates (several competitors do this; we
  treat it as guessing dressed as fact). Verification pass: FAQ schema mirrors visible content
  (8/8), bold density ~1/37.5 words matching house reference, 7 outbound + 6 inbound links
  across 6 different posts (max one inbound per source, none forced), zero console/network
  errors on render. Caught + fixed a real flow issue (a myth bullet was restating the exact
  mechanism the next section explained in depth) and a fresh "actually" that slipped in.
  Cover image: user's first upload had "1 MILLION SUBSCRIBERS" baked into the graphic (wrong
  topic), user corrected it to "VIEWS", already 16:9 at 1280x720, no crop needed.
  No inline charts (siblings youtube-rpm/youtube-cpm have 6-8 each); flagged, not built, since
  it's new scope beyond writing. NOT built, NOT pushed.
- [DEPLOYED 2026-07-12] Third and fourth of the shortlist, then full deploy of all four posts
  plus the tool. **blog/how-to-start-a-youtube-video**: live-SERP research found the literal
  query is dominated by full production tutorials (Uppbeat, Descript, Metricool, Uscreen),
  NOT a narrow hook-only piece as the original plan assumed, corrected course with the user's
  sign-off to a full 8-step walkthrough with the hook-writing section made deliberately deep
  (our unique retention-research edge) rather than the narrow angle. **blog/cash-cow-youtube-
  channels**: differentiated from faceless-youtube-channel-ideas by covering the BUSINESS MODEL
  (production models with real cost math, portfolio scaling, realistic income) rather than niche
  picks, which stayed on the faceless post. Led honestly with the 2026 finding that pure-AI-
  automation cash cow channels are getting squeezed (algorithm now filters mass-produced content
  at the CHANNEL level, not just per-video, verified against YouTube's own AI-disclosure Help
  page, not just third-party blogs). Skipped named-channel dollar-figure claims throughout (user
  call on the 1M-views post applied consistently; competitors researched for this post cite
  "$30,000/month"-style figures for named channels with zero sourcing, confirms the skip was
  right). 2 real fetched thumbnail examples (WatchMojo list format, BRIGHT SIDE AI-composited
  format) instead of a fabricated mockup.
  Then **built + committed + pushed all 4 posts and the Banner Resizer tool live** (commit
  6b1f09a7): full rebuild with BUILD_API_URL=https://ytgrowth.io, 98 routes verified, sitemap.xml
  and llms.txt entries added for all 4 posts (had been missed per-post, caught before deploy),
  staged only this session's actual files (not git add -A; repo had a lot of unrelated untracked
  clutter from other work), verified live post-deploy by real page title, not just HTTP 200.
  GSC RE-INDEX LIST for these 4 (submit via URL Inspection -> Request Indexing):
    https://ytgrowth.io/blog/youtube-banner-size
    https://ytgrowth.io/blog/youtube-1-million-views
    https://ytgrowth.io/blog/how-to-start-a-youtube-video
    https://ytgrowth.io/blog/cash-cow-youtube-channels
    https://ytgrowth.io/tools/youtube-banner-resizer

### Mistakes made across the 2026-07-11/07-12 session — do NOT repeat

The user explicitly asked these be logged so a future chat does not repeat them.

1. **Did not regenerate postsMeta.js immediately after adding a post.** Treated
   `node scripts/gen-blog-meta.js` as gated behind "don't build without asking," when it is a
   small, separate metadata-only script, not a build, nothing gets bundled or deployed. Caused
   real frustration over something the user considers simple hygiene. Fix: run it the moment a
   post is added to posts.jsx, every time, no asking. See feedback_regenerate_postsmeta_on_add.
2. **Inserted a new post in the middle of the array instead of at the top.** Multiple posts can
   share the same `date` string, and Array.sort is stable, so ties resolve by original array
   order. A new post buried mid-array loses the "featured/newest" slot to older same-date posts
   even with an identical date. Always insert a brand-new post object at position 0, right after
   `export const posts = [`, not wherever is topically convenient.
3. **A Python line-ending bug while moving a post block.** Used `open(path, 'r')`/`'w'` in
   Python text mode on Windows to cut/paste lines in posts.jsx, which silently converted the
   ENTIRE file from LF to CRLF. This broke gen-blog-meta.js's LF-only regex parser with a
   confusing "no post blocks parsed" error unrelated to the actual edit. Any Python rewrite of a
   repo text file must use binary mode (`'rb'`/`'wb'`) or explicit `newline='\n'`, never plain
   text mode, on this Windows checkout.
4. **Introduced a duplicate `slug:` key while fixing the above**, a rushed copy-paste during the
   recovery. Re-run the esbuild parse check immediately after any manual line-surgery edit, not
   just at the end of a batch of edits.
5. **Repeated the identical "Search [phrase] and you will get..." intro across two different
   posts.** Never grepped existing posts for the opening rhetorical device before finalizing a
   new one. Grep for the pattern before finalizing every new intro; vary the opening move every
   time. See feedback_no_repeated_intro_formula.
6. **"actually" and other banned words slipped through in H2/H3 heading text, not just body
   `<p>` text**, more than once across multiple posts. The banned-word check must scan the
   entire post section including headings, not only paragraph tags.
7. **Forgot the visible FAQ section (mirroring the `faqs` array) on the first draft of 2 posts.**
   The array alone only drives the JSON-LD schema; Google requires the schema to mirror visible
   content. This is an established, already-documented pattern on this site and should be
   included in the first draft by default, not patched in after the fact.
8. **Sitemap.xml entries missed for 3 of 4 new posts** until the final pre-deploy build. Sitemap
   is hand-maintained, NOT auto-generated from posts.jsx. Add the sitemap entry the moment each
   post is written, not as a batch afterthought right before a deploy.
9. **llms.txt entries missed for all 4 new posts**, same root cause as #8, caught at the same
   late point. Add both immediately per post as part of the standard publishing checklist.
10. **Long, comma-chain run-on sentences across all 4 posts**, caught only after the user
    flagged the pattern directly ("very long sentences sounds funny"). The specific pattern: a
    subject interrupted by a triple appositive before its verb, or 3+ independent clauses joined
    by commas instead of periods. Proofread every finished paragraph for this before calling a
    post done, do not wait to be told. See feedback_no_long_comma_chains.
11. **Defaulted to shallow (top-3) competitor research** on two separate articles; had to be
    told twice, on different posts, to expand to the full top 10. Default to a full top-10 pass
    on every new article's research phase, not top 3, unless told otherwise.
12. **Drafted posts without considering real images**, until told directly. Real images
    (thumbnails, live channel pages fetched via Puppeteer) are available without fabricating
    anything; always consider and mention this rather than silently shipping text-only. See
    feedback_always_flag_image_needs.
13. **The Banner Resizer tool's first version had a real bug**: a blank safe-zone preview on the
    very first image drop, because the `<canvas>` element does not exist yet at that point in
    the render (it is gated behind `result &&`). Only caught because of an insisted-on
    interactive test (drop a file, click every tab). Any new interactive tool needs an actual
    browser test of every control, not just a screenshot of the empty state, before being called
    done.
14. **The tool's first draft deviated from the documented canonical type scale** (H1/H2 sizes,
    eyebrow tracking) by copying an existing sibling page that itself had the same undetected
    drift. Check new UI against the WRITTEN design-language spec directly, not only against
    what already shipped, since the already-shipped page can itself be off-spec.
- [DONE 2026-07-13, NOT BUILT/PUSHED] Folded "how often should you post on youtube" into
  best-time-to-post. Researched the live top-10, found the sources contradict each other (one
  claims 2x/week grows 3x faster, a separate creator test found no lift from 3x/week), resolved
  it honestly (quality-held-constant vs. diluted) instead of picking a side. Checked first
  whether we have real proprietary channel/upload-frequency data to back a claim: confirmed we
  do NOT (subscriber counts get overwritten not logged, ChannelMetrics is dead code, upload
  cadence is computed live and discarded, Milestone is too sparse). User committed to building
  moat item #3 (time-series snapshots) plus manual video sampling regardless, but that is
  separate future infrastructure work, not blocking, not started.
  New H2 "How Often Should You Post on YouTube?" + frequency-by-content-type table + channel-
  stage guidance + break-risk answer. FAQ expanded 6 -> 8 (added a `faqs` array, this post never
  had FAQPage schema before). Full verification and cleanup pass, each caught a real gap:
  paragraphs measured via actual rendered height (not char-count guessing), 4 paragraphs found
  running 6-9 lines and split. Internal links: was down to 1 inbound link site-wide, added 5 from
  genuinely on-topic passages (how-to-start-a-youtube-video, more-views-on-youtube,
  youtube-channel-not-growing, youtube-algorithm, youtube-shorts-algorithm) + 1 outbound from the
  new section, both directions per the method. Metadata: seoMeta.js title/description updated
  (description was also over the 155-char guideline, trimmed), sitemap lastmod bumped, llms.txt
  updated, excerpt (feeds JSON-LD description + visible dek, separate from seoMeta) updated,
  readTime corrected 12->14 after the content grew. Schema verified end to end: FAQPage
  Q&A mirrors visible text word-for-word, dateModified reads the new `updated` field correctly.
  Produced two reusable artifacts from this pass: `SEO-OPTIMIZATION-CHECKLIST.md` (repo root,
  the full reusable weekly process) and `frontend/scripts/verify/check-blog-paragraphs.mjs` (real
  rendered-line checker, replaces eyeballing character counts). NOT built, NOT pushed.

- [DONE 2026-07-13] The full ranked-by-impressions target-page table above is now 100% shipped.
  Last four (money-calculator, competitor-analysis, vidiq-review, youtube-stats) done same day,
  each with full top-10 competitor research per page (not shortcuts, see the entries above and
  the git log for commits cbfa79a0b and 366630b8f). youtube-stats also got a real trust-bug fix
  (the whole country/category family was falsely claiming daily/24-hour refresh when the job is
  deliberately monthly for quota reasons) plus a zero-quota-cost sort toggle and a sourced
  history section. All 4 country pages' titles then got a second pass (US/UK dropped the
  "USA"/"UK" abbreviation for the full country name; Canada/Australia gained the missing "in"),
  each backed by 10 real competitor titles, not assumption. Both commits built, pushed, verified
  live by fetching the actual title tags post-deploy.

## New content initiative — IN PROGRESS (started 2026-07-13)

Topic research done (Reddit-style question mining + AI-answer clustering; no GSC export
needed yet). 5-topic queue approved, #2 (monetization timeline) dropped as already covered
by free-subs/partner-program/watch-hours. Remaining queue: too-late-to-start-youtube, restart-youtube-channel.

- [WRITTEN 2026-07-14, NOT BUILT/PUSHED] blog/shorts-vs-long-form ("Do YouTube Shorts Hurt
  Your Channel? The Honest 2026 Answer"). Second of the queue. Research: 10 competitors
  deep-fetched (not just search summaries; user called out an earlier 6-page shortcut and a
  too-shallow outline, both corrected). Primary-source verified: YouTube's own recommendations
  Help page (16559651, direct quotes), Rene Ritchie + Todd Beaupré exact quotes, Beaupré's Aug
  2022 cross-format recommendation announcement, arXiv 250-channel study (with its design
  limitation stated honestly), AIR 18,000-channel niche dataset (correlational caveat kept),
  March 31 2025 Shorts view-count change (engaged views distinction). Differentiator: the only
  page reconciling the official "no harm" position with the academic decline data and the
  niche-dependent dataset; niche table is the centerpiece. 14 sections, 9 FAQs (mirror verified
  programmatically), CtaCard mid-article (Outliers, framed as Shorts-as-topic-validation).
  Consistency fix shipped alongside: grow-youtube-channel's 1:3 Shorts-heavy ratio contradicted
  the new 25-40% data, reconciled with a launch-tactic qualifier + link rather than leaving two
  pages disagreeing. Inbound links from 4 older posts (shorts-algorithm, shorts-pay,
  watch-hours, grow-youtube-channel) + 1 outbound to youtube-ai-policy on the mass-clipping
  passage. seoMeta (55/146 measured), sitemap, llms.txt, postsMeta done. Verified: parses,
  zero banned words, all 49 paragraphs <=5 rendered lines, dev 200. OPEN: cover image needed
  (shorts-vs-long-form-cover.jpg, 16:9, user-supplied), then build + push on go-ahead.

- [WRITTEN 2026-07-13, NOT BUILT/PUSHED] blog/youtube-ai-policy ("The 2026 YouTube AI
  Crackdown"). Targets the #1 conversational AI-assistant fear query ("will AI content get
  my channel demonetized"). Research verified against PRIMARY sources (both YouTube Help
  pages fetched directly: policy 1311392, disclosure 14328491), enforcement wave confirmed
  via TheNextWeb + multiple outlets. UNIQUE angle no competitor has: debunks the fake
  "30% commentary" / "20% script variation" thresholds circulating as fact across the
  low-authority SERP (verified they appear in no YouTube policy). 9 FAQs with FAQPage
  schema (mirror verified word-for-word programmatically), 2 external links to the primary
  YouTube Help pages, CtaCard mid-article (channel-audit), creative final H2 ("AI Was
  Never the Violation"). Inbound links added from 4 genuine spots: cash-cow (Staying
  Compliant), faceless-channel-ideas, youtube-shorts-pay, youtube-partner-program (reused-
  content warning). seoMeta (58/148 chars, measured), sitemap, llms.txt, postsMeta all
  done. Verified: parses, zero banned words, 35 paragraphs all <=5 rendered lines, dev
  200. OPEN: cover image needed (youtube-ai-policy-cover.jpg, user-supplied, 16:9), then
  build + push on go-ahead.

## NEXT: new content initiative details (original notes, 2026-07-13)

**The business context driving this:** sessions dropped from ~50-60/day to ~30-40/day after
cutting the low-tier programmatic pages (see "Progress log" above, 2026-07-09). That cut was
correct for the Mediavine tier-1 requirement, but it means we now need new content to rebuild
volume, not just rank-fix existing pages.

**The user's proposed angle:** since AI-assistant referrals are our #1 traffic source (see
project_llms_txt_traffic memory), find out what people actually type into AI assistants
(ChatGPT, Perplexity, etc.) as long conversational questions in this niche, and write topics
targeting that phrasing directly, rather than guessing from traditional keyword tools.

**Checked first, before doing any research: do we have real data on this, or would it be a
guess?** Investigated the codebase directly (not assumed). Verdict: **no real data source
exists in this repo.** GA4 is wired (client-side only, tag `G-MFMVT6Q5RB`) and auto-detects
referrer *domain* (chatgpt.com vs perplexity.ai), but that data lives only in Google's GA4
console, not in any local export/table, and even GA4 cannot see the actual chat/search query
text someone typed, only the domain they arrived from. No server-side referrer logging exists
anywhere in routers/*.py. The only attribution capture is `UTM_KEYS` in routers/auth.py, which
only fires on first signup via explicit UTM query params, which AI assistants generally don't
attach when they cite/link out. So the oft-cited "57% of sessions from AI-assistant referrals"
figure has no traceable in-repo source; it was almost certainly read once directly from the GA4
web console, not a live pipeline. Bottom line: we cannot see literal private LLM query logs,
full stop, and should not pretend otherwise.

**Three real, executable alternatives identified, none started yet:**
1. **Our own GSC query data** — the actual, already-typed conversational queries landing on our
   existing content today. Highest-signal option we actually have, but needs a fresh Search
   Console export from the user (same manual pull that kicked off the tier-1 push originally).
2. **Reddit/forum research** — real people posting long, multi-clause questions about YouTube
   growth/monetization, often literally quoting what they asked an AI assistant. Executable via
   WebSearch/WebFetch right now, no export needed.
3. **AI Overview "People also ask" clustering** — Google's own AI answer boxes reveal the exact
   question phrasing it associates with a topic in this niche. Also executable right now.

**Next chat should:** ask the user which of the three to start with (or all three), then run
the same rigor as the rest of this doc: full research before writing, present the topic list
+ coverage matrix before drafting, follow the standard publishing workflow (source + prerender
route + sitemap + llms.txt + build + push, see feedback_regenerate_postsmeta_on_add and the
"Publishing workflow for new public routes" rules in CLAUDE.md).

Separately, still open and unblocked by the above: OFF-PAGE AUTHORITY (the linkable-data-study
articles built from proprietary cache/registry data, see project_linkable_data_studies) remains
the real unlock for authority-gated head terms, still not started, partly gated on moat item #3
(time-series snapshots), which the user has confirmed must be built regardless of priority order.

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
