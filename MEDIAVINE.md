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
- **[TODO]** Enrich the ~33 hubs (14 category stats, 4 country stats, 14 niche earnings,
  main hubs) into genuine, non-templated quality pages.
- **[TODO]** Build tier-1 topic clusters (genuine unique articles, Windsor.ai use-case
  style) targeting US/UK/CA/AU intent: monetization, sponsorship rates, tool comparisons.

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
