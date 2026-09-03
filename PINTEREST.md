# Pinterest — Working Status

Living doc. Read this first before doing any Pinterest-related work, and update it
whenever something changes. Anyone (human or a new Claude session) picking this up
should be able to know exactly where we are from this file alone.

Last updated: 2026-08-09

## Goal / experiment framing

Started 2026-08-09: testing whether Pinterest can drive **paid users** to
ytgrowth.io (current model: $5-to-start prepay, see CLAUDE.md quota/pricing
notes). This is a genuine experiment, not a committed channel.

**The fork (superseded 2026-08-13):** the original fallback was pivoting
YTGrowth's content side into an ad-monetized blog if Pinterest produced no paid
users. That is dead. The user started a separate niche site for ad revenue
instead, and YTGrowth stays a SaaS conversion play. Do not reintroduce
ad-revenue framing here or anywhere else.

Pinterest-facing copy should be friendly and inspirational (Pinterest's platform
tone), not the hard SaaS sales pitch used on the landing page. Never invent an
offer that doesn't exist (e.g. there is no free audit, current model is $5 to
start).

## Account

- Profile: https://www.pinterest.com/ytgrowthio/
- Domain verified: **yes**, 2026-08-09. `<meta name="p:domain_verify" content="e53cd2a96c0a69a11b01d7eae53727d6">`
  lives in `frontend/index.html` (source) and is baked into `frontend/dist/index.html`
  (patched directly per the "patch dist, don't reprerender" rule for static
  head-only changes). Only needs to be on the root page.

## API access (read-only reporting)

Real Pinterest API v5 integration, adapted from the same pattern used in the
sister project `niche_website` (savvyhomie). No browser scraping, no Playwright.
Scripts live at repo root in `scripts/`:

- `pinterest-env.mjs` — reads/writes Pinterest vars in the repo-root `.env`
  (gitignored, never committed).
- `pinterest-auth-url.mjs` — builds the OAuth authorization URL.
- `pinterest-auth-exchange.mjs` — exchanges the `?code=` from the redirect URL
  for an access + refresh token.
- `pinterest-refresh.mjs` — refreshes an expired access token.
- `pinterest-report.mjs` — pulls all boards + all pins per board, splits into
  ours vs saved/repinned, live vs scheduled. Run with `node scripts/pinterest-report.mjs`.

Pinterest developer app: "YTGrowth Content Reporting" (App ID `1599186`, App
secret and tokens live only in `.env`, never in this file or git). Scopes
granted: `boards:read boards:read_secret pins:read pins:read_secret user_accounts:read`
(read-only, no posting capability yet — deliberate, see Next steps).

Redirect URI registered in the Pinterest app settings: `http://localhost:8080/callback`
(does not need to resolve to anything real, the code is read from the browser's
address bar after Pinterest redirects there).

## Boards (9 total, all created 2026-08-09)

Each maps to real content already on ytgrowth.io (60 blog posts + tools), no
invented topics. Phase 1 (highest overlap with Pinterest's actual "side hustle /
make money online" audience) was built first, phase 2 second.

### Phase 1

**1. YouTube Channel Ideas for Beginners**
> YouTube channel ideas for beginners: how to start a YouTube channel, pick a niche, and choose a format that fits you. Ideas for faceless YouTube channels, gaming channels, and channels you can film on just your phone. Tips for naming your channel, restarting a stalled one, and finding a niche people actually search for before you upload your first video.

Source posts: start-youtube-channel, youtube-niche, faceless-youtube-channel-ideas, gaming-youtube-channel, restart-youtube-channel, too-late-to-start, youtube-brand-account, youtube-channel-phone, cash-cow-youtube-channels, best-youtube-mic + channel name generator tool.

**2. How to Make Money on YouTube**
> How to make money on YouTube: understand RPM and CPM, join the YouTube Partner Program, and land sponsorships that pay. Earnings breakdowns for Shorts, AdSense payouts, and what a channel with 1 million views actually earns. Tips on avoiding demonetization, treating your channel like a business, and calculating your channel's real value by niche and subscriber count.

Source posts: youtube-demonetization, youtube-sponsorships, youtube-shorts-pay, youtube-rpm, youtube-1-million-views, google-adsense-youtube, youtube-cpm, youtube-as-a-business, youtube-partner-program + 3 money calculators + earnings pages.

**3. Grow Your YouTube Channel Fast**
> Grow your YouTube channel fast: how the YouTube algorithm and Shorts algorithm actually decide what to recommend, the best time to post for more views, and what to do when your channel stops growing. Tips on spotting YouTube trends early, analyzing competitor channels, and finding what's already working in your niche before you plan your next video.

Source posts: more-views-on-youtube, youtube-channel-not-growing, grow-youtube-channel, best-time-to-post, youtube-algorithm, youtube-shorts-algorithm, youtube-trends, youtube-competitor-analysis + Competitor Analysis/Outliers tools.

### Phase 2

**4. YouTube Video Ideas & Content Prompts**
> YouTube video ideas and content prompts for when you're stuck: vlog ideas, challenge ideas, and Shorts ideas you can film this week. Video ideas for beginners with zero subscribers, plus a roadmap for landing your first 1,000 subscribers. Ideas organized by format so you always know what to film next.

Source posts: youtube-vlog-ideas, youtube-challenge-ideas, youtube-shorts-ideas, youtube-video-ideas, free-subs-on-youtube + video ideas generator tool.

**5. YouTube SEO Tips & Keyword Research**
> YouTube SEO tips for ranking your videos: what YouTube SEO actually is, keyword research tools for finding what people search for, and the best practices that get videos found. Tips for optimizing your whole channel, not just one video, plus the SEO tools worth using in 2026.

Source posts: what-is-youtube-seo, youtube-seo-best-practices, seo-tools-for-youtube, youtube-channel-optimization, youtube-keyword-research-tools + keyword research tool.

**6. YouTube Titles, Tags & Descriptions**
> YouTube titles, tags, and descriptions that get videos found: how to write a YouTube title that ranks and gets clicked, description templates that work, and the right tags for your video and Shorts. Tips for tagging Shorts correctly and writing descriptions that support your SEO, not just filler text.

Source posts: youtube-title, youtube-description-template, youtube-tags, youtube-tag-finder, shorts-tagging, video-tagging + title/description/tag/hashtag/chapter generators.

**7. YouTube Thumbnail Ideas & Design**
> YouTube thumbnail ideas that get clicks: thumbnail frameworks beyond the red arrow, the right thumbnail size and banner size for 2026, and how to A/B test a thumbnail before you upload. Design tips for thumbnails that stand out in search and suggested videos, not just look nice on their own.

Source posts: youtube-thumbnail-ideas, thumbnail-tester, youtube-maker, youtube-thumbnail-size, youtube-banner-size + thumbnail tester/downloader/resizer, banner resizer tools.

**8. YouTube Analytics & Channel Audits**
> YouTube analytics explained for creators who want real answers: what counts as a good click-through rate, how to read your watch hours, and the analytics tools worth using. Tips for auditing your whole channel, not just one video, so you know exactly what's holding your growth back.

Source posts: youtube-ctr, youtube-analytics-tools, youtube-analytics, youtube-channel-audit, youtube-watch-hours + Channel Audit tool.

**9. Best YouTube Tools & Software Reviews**
> YouTube tools and software worth using in 2026: TubeBuddy vs vidIQ compared, the best Chrome extensions for YouTube creators, and a free channel stats checker for looking up any channel's subscribers and views. Honest reviews to help you pick the right tool before you pay for one.

Source posts: tubebuddy-vs-vidiq, vidiq-review, chrome-extensions-for-youtube + Channel Stats Checker tool + /youtube-stats leaderboard pages.

## Current pin status (as of 2026-08-09, via `pinterest-report.mjs`)

All 9 boards exist with exactly 1 pin each, and **every pin is "saved" (repinned
from someone else), zero are original pins pointing to ytgrowth.io**. Pinterest's
algorithm rewards fresh, original pins linking to your own content, not repins,
so this needs fixing before the experiment can produce real signal.

## Pin design workflow (folder structure)

Adapted from the same pattern used at `niche_website` (savvyhomie), which
already had a working pin-production pipeline. Structure, at repo root:

- **`pin-drops/<post-slug>/`** — staging folder per blog post. Drop every
  design draft/variant here as you make it: `<post-slug>-pin-1.png`,
  `-pin-2.png`, etc. Gitignored (heavy binaries, drafts, not site assets).
- **`pin-references/`** — flat folder for inspiration screenshots (other
  creators' high-performing pins you're borrowing layout ideas from, not
  copying content from). Also gitignored.
- **Source imagery**: reuse what already exists, don't duplicate it.
  Blog covers are already at `frontend/public/blog/<slug>-cover.jpg`. Tool
  screenshots can be pulled straight from the live app when a pin needs to
  show the product.

Folders pre-created for all 27 phase-1 posts (the posts feeding boards 1-3:
Channel Ideas, Make Money, Grow Fast). Say the word and I'll scaffold the
phase-2 post folders too, or scaffold them as you get to each board.

Once a design is finalized and uploaded to Pinterest, it doesn't need to move
anywhere, the local PNG in `pin-drops/` was only ever a draft; Pinterest hosts
the real thing.

## Pin production standards (2026 best practice, from research)

- **2:3 aspect ratio, 1000x1500px.** Pinterest's algorithm penalizes other ratios.
- **3-5 distinct designs per post**, different layout/text overlay each time,
  not the same design recolored. Fresh designs drive traffic, saves/repins
  barely move the needle in 2026.
- **Pin graphics must come from a real design tool (Canva)** using real
  screenshots/thumbnails as source material, never AI-generated canvas/SVG
  renders (standing rule, no exceptions).
- Keyword-first pin titles and natural-language descriptions, same rule as
  board descriptions above, primary keyword first, 2-3 supporting phrases,
  no stuffing.

## Next steps

1. Design and drop pin drafts into `pin-drops/<post-slug>/` for the phase-1
   posts, pick the best 3-5 per post, upload to the matching board.
2. Get each phase-1 board to 50+ pins before expanding pin volume on phase-2
   boards.
3. Decide whether to add `pins:write`/`boards:write` scopes (would require a
   fresh OAuth grant) once we're ready to publish via the API instead of the
   Pinterest UI.
4. Track: does Pinterest traffic show up in analytics, does any of it convert
   to a paid $5 signup. That answer decides the fork above.
