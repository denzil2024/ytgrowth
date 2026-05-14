# Working in this repo

Read these rules before any code change. They are not suggestions.

## Quota discipline (hard rule)

This product runs on YouTube Data API v3, which gives **10,000 units per day** on the free tier (Google's quota bump is pending, may be 1M+ when granted but assume 10K until confirmed). Every search.list call costs **100 units**. Every videos.list / channels.list / playlistItems.list call costs 1 unit. Burning the daily quota locks out every user from login and every feature until midnight Pacific reset.

The codebase has hard-won quota infrastructure shipped over an intense day of work. Do not weaken, remove, or bypass any of it. Specifically:

### Caches you must NOT remove or shorten without explicit user approval

| Table | Purpose | TTL |
|---|---|---|
| `youtube_search_cache` | Cross-user cache for YouTube search.list results. Used by SEO Studio (seo: prefix), Keyword Research (kw: prefix), Competitor name search (comp: prefix). | 24h-7d depending on prefix |
| `ai_output_cache` | Cross-user cache for Claude / Haiku outputs, keyed by SHA-256 of (function_name + sorted JSON of relevant inputs). | 3d-30d depending on function |
| `competitor_activity_cache` | Per-user dashboard "competitor uploads" feed. DB-backed so it survives Railway restarts. | 24h |
| `public_channel_stats_cache` | Public tool channel lookups. DB-backed because the endpoint is anonymous and bot-vulnerable. | 24h |
| `IdeaProofCache` | Video Ideas proof tiles per keyword. | 7d |
| `top_channel_cache` | Public /youtube-stats/* pages. Refreshed monthly via cron. | Monthly refresh |
| `KeywordsResearchCache`, `SeoAnalysisCache`, `OutliersReport`, `VideoAutopsyCache`, `CompetitorAnalysisCache` | Per-user saved reports. NEVER auto-backfill stale-schema rows on the `/reports` list endpoint - that previously cascaded into a 5K-unit-per-page-load burn. | Persistent, only refreshed on user-initiated re-run |

### Kill-switches you must NOT remove

- `YT_QUOTA_PAUSED=1` env var. Read by every user-facing search.list caller (app/seo.py, app/keywords.py, app/competitors.py, routers/video_ideas_routes.py) and by the scheduled jobs (app/scheduler.py, app/top_channels.py, app/niche_warmer.py). When set, those paths short-circuit instead of throwing 403s during quota outages.
- The `_is_meaningful_query()` junk filter in app/seo.py. Rejects empty / too-short / single-letter inputs before they hit YouTube. Used by SEO Studio, Keyword Research, and Competitor search.

### Scheduled jobs that have been right-sized

- **Niche Warmer** (app/niche_warmer.py): nightly 04:00 UTC, refreshes top-hit-count cache entries. Budget: ~2,000 units/night. Do not increase WARM_PER_RUN without checking quota math.
- **Top channels refresh** (app/scheduler.py): MONTHLY (1st of month at 05:30 UTC), costs ~8,400 units. Do NOT change to weekly without first verifying daily quota headroom.
- **Search cache cleanup** (app/scheduler.py): Mondays 03:30 UTC. DB only, 0 YouTube units.

### Architectural patterns you MUST follow when adding new features

Before adding any feature that may touch YouTube data, do the following in order:

1. **Identify the cost.** Grep for `.search().list`, `.videos().list`, `.channels().list`, `.playlistItems().list`. Add up the units per use of the feature.
   - search.list = **100 units** (regardless of maxResults)
   - videos.list = 1 unit per call (batched up to 50 IDs)
   - channels.list = 1 unit
   - playlistItems.list = 1 unit
2. **Reject the feature design** if it would cost more than 10 units per user action without caching, OR if it sits on a hot path (login, dashboard load) without caching.
3. **Use existing helpers.** Do not build new caching from scratch.
   - For Claude outputs: import `cached_ai_output` from `app/utils.py`. Pattern shown in `analyze_keywords` (app/keywords.py), `_explain_video_outliers` (app/outliers.py), and others.
   - For YouTube search results: use the `youtube_search_cache` table with the seo: / kw: / comp: prefix convention. Pattern shown in `_search_youtube_once` (app/seo.py).
   - For per-user data: DB-backed (NOT in-memory). In-memory caches were wiped on every Railway restart and provided no protection during active dev.
4. **Right-size the TTL** to the data's actual change rate. See the TTL table above.
5. **Always include a `YT_QUOTA_PAUSED=1` short-circuit** at the top of any new YouTube search caller.
6. **Surface the trade-off to the user** before merging. If quota math is non-trivial, write it in the commit message.

### Audit-of-AI patterns

If adding a Claude / Haiku call:

1. Wrap it in a closure passed to `cached_ai_output(function_name, inputs, ttl_hours, fetch_fn)`.
2. `inputs` must be JSON-serialisable and contain ONLY fields that semantically affect the output. Exclude user IDs, channel IDs, and other per-user identifiers unless they truly change the output.
3. For creator-size sensitivity, bucket subscriber counts into tiers (micro / small / mid / large) so similar-sized creators share cache rows.
4. Sort lists in cache inputs so cosmetic ordering differences don't break cache hits.
5. Default TTL: 7 days for analytical outputs; 3 days for outputs with timing relevance; 30 days for stable lookups.

## Things you must NEVER do without explicit user approval

- Lower a cache TTL or add cache-busting query params
- Remove or weaken a `YT_QUOTA_PAUSED` check
- Add a new search.list call without caching it
- Re-introduce the per-page-load backfill pattern on any `/reports` endpoint (see git history for the "Keywords /reports" cascade fix)
- Move a DB-backed cache back to in-memory only
- Change a scheduled job's cron to fire more frequently
- Bump `top_n` on Keyword Research or any similar fanout parameter
- Make the Niche Warmer or Top Channels refresh more aggressive
- Switch a Claude function from cross-user cache to per-user cache

## Communication conventions

- "Credits" and "units" both refer to YouTube API quota units. They are the same thing. The user has been historically frustrated by the conflation; clarify when discussing.
- Reference real costs in plain numbers when proposing changes. Example: "this feature would cost 510 units per click on a cold cache" not "this might be expensive."
- When in doubt about whether to ship a quota-touching change, surface the trade-off and wait for approval. The cost of pausing for a question is low; the cost of an unwanted quota burn is high.

## TL;DR on quota

Caching is the moat. Don't break it. Don't bypass it. Every new feature must answer "what's the per-use quota cost?" before it ships. If you can't answer that, you're not ready to write the code yet.


---


# How the user works (read before any conversation)

These are durable preferences that apply across every session. They survive Claude account changes because they live here, in the repo.

## Communication style

- **No em-dashes.** Use commas, parens, colons, or split sentences. The user has corrected this repeatedly. Hyphens are fine; em-dashes are not.
- **No italics.** No `<em>`, no `font-style: italic`, no italic emphasis in copy or code comments. Use bold or color for emphasis.
- **Plain prose.** Do not narrate internal deliberation. State results and decisions directly.
- **Be decisive.** Do not present multi-choice menus when there is an obvious next step. Pick and start. Reserve questions for real forks.
- **Clarify "credits" vs "units" if it comes up.** Both refer to YouTube API quota units. The user has been frustrated by the conflation.
- **Honest over optimistic.** If you don't know something for certain, say so. Past over-claims (e.g. "the cache will save you" when overlap is rare) have damaged trust. Verify before claiming.

## Deployment workflow

- **Every code change = commit + push to origin.** Railway auto-deploys on push. Never stop at a local commit.
- **Stage specific files by name** (`git add path/to/file`) rather than `git add -A` or `git add .`. The repo has untracked artifacts (pycache, build dist) that should not be bundled.
- **Pre-commit hooks must pass.** If a hook fails, fix the underlying issue. Never use `--no-verify` unless the user explicitly asks.

## UI / design discipline

- **Propose design before code for visible UI work.** Write out the design (ASCII / bullet wireframe / type and spacing notes) BEFORE coding. Wait for OK or redirect. Skipping this has caused expensive revert cycles.
- **Match the existing aesthetic.** Mirror the existing color tokens, hover states, spacing. No foreign design (random borders, pills, novel rounded squares) unless the surrounding code already uses them.
- **No emoji or generic icons.** Lucide only, semantic fit only. Pair with soft tinted circle backgrounds. One icon per category, no recycling.
- **One section at a time.** UI redesigns ship one section per push, then wait for review. Do not bundle multiple sections.
- **Verify before ship for UI changes.** Use the preview harness + Playwright screenshots if available. Read every screenshot before commit. Cap screenshots at 2000px/side (deviceScaleFactor ≤ 1.3).

## Design references

- **VidIQ Research / Explore** is the visual bar. Thumbnails over text, tabs, multiplier badges, dense tables. Specific patterns to borrow: semantic size names, numbered tokens, mask-fade borders, inset-shadow tints, single shadow + spring, container queries, interpolate-size, aria polish. North star: polished, restrained color, clean typography.
- **The Competitors page in this repo** is the approved internal design north-star for future page rebuilds. 1040 centered, Geist, established type scale, show-don't-tell, card grammar. Do NOT reference Keywords (still being iterated on) or Dashboard.jsx inline sections.

## Publishing workflow for new public routes

When adding a new blog post or public route, do everything end-to-end in one push:
1. Write the source page
2. Add the route to `prerender.js` `buildRoutes()`
3. Add to sitemap if applicable
4. Run the build
5. Commit and push

Missing the prerender step ships an empty SPA shell to crawlers (broken SEO). The full workflow is non-negotiable.


---


# Future plans and context

## Pending: Google YouTube Data API quota bump

The user applied for a quota increase from the 10K daily Data API tier. As of writing, two acknowledgement emails have been received from Google's YouTube Compliance team, indicating active review. Until the bump lands, treat 10K as the operating budget and keep the quota discipline above.

When the bump lands (typically 1M+ units/day for audited apps):
- `top_n` in Keyword Research can move back up from 3 to 5 or higher
- Top Channels refresh can move back from monthly to weekly
- Some short-TTL caches can be relaxed without risk

Do NOT make these changes preemptively. Wait for the user to confirm the bump arrived.

## Moat build-out (ordered queue — work through in this order, do not skip)

This is the strategic compounding-data work. Every cached query and Claude
output is a brick in the moat. The product gets cheaper and smarter the
more users it has, automatically. The order below is locked — do NOT
re-prioritise without surfacing the trade-off.

### 1. Smarter niche warmer — DONE
`app/niche_warmer.py` was extended to cover both the SEO Studio cache
(seo: prefix) and the Keyword Research cache (kw: prefix). Both phases
pick by hit_count, so the warmer refreshes what users actually research,
not what was guessed. Total nightly burn: ~3,000 units. Commit:
"Niche warmer: extend to Keyword Research cache (kw: prefix)".

### 2. Trending dashboard — NEXT
Admin-only endpoint + page that surfaces what the user base is researching
most. Powers product decisions and a future "trending in your niche"
widget for end users.

Implementation sketch:
- `GET /admin/trends` returning the top N queries by hit_count across
  `youtube_search_cache` (broken down by seo: / kw: / comp: prefix).
  Include hit_count, last_hit_at, original_query, function_name.
- `GET /admin/ai-trends` for the AI side: top function_name groups
  from `ai_output_cache` by hit_count.
- Frontend: an `/admin/trends` page in `frontend/src/pages/Admin.jsx`
  (or a dedicated component) rendering both as tables.
- Half-day work.

### 3. Time-series snapshots
Daily cron that snapshots `youtube_search_cache.hit_count` and
`ai_output_cache.hit_count` into a `cache_hit_snapshots` table with a
date column. Without this, trend detection is impossible. Cheap insurance
to add now; expensive to backfill later.

Implementation sketch:
- New table: `cache_hit_snapshots` (cache_key, hit_count, snapshot_date).
- New scheduled job in `app/scheduler.py` running at 23:55 UTC daily.
- One `INSERT INTO ... SELECT ...` copying all non-zero hit_count rows.
- Half-day work.

### 4. Public SEO pages from cached data
Turn the `youtube_search_cache` data into search-engine-indexable pages.
Each popular query gets a `/research/<slug>` page showing the top videos
ranking for that keyword. Free traffic, zero per-page-load quota cost
(reads from existing cache).

Bigger work (1-2 weeks). Requires:
- Slug routing in the SPA + prerender pipeline (see "Publishing workflow
  for new public routes" above).
- Page template.
- Sitemap generation that lists every cached query above some hit_count
  threshold.
- Should respect content-quality gates (skip queries that returned
  thin or off-topic results).

### 5. Behavioural recommendations
"Creators like you (same niche keywords, same channel size tier) also
researched X." Uses `KeywordsResearchCache` joined to `ChannelRegistry`.

Roughly a week of work. Requires:
- Similarity function: niche-keyword overlap + sub-count tier matching.
- Surface area: a card in the Dashboard or Keyword Research page.
- Privacy consideration: never expose individual user identities, only
  aggregated patterns.

### 6. AI training data export
Export `ai_output_cache` as JSONL: each row becomes a (prompt, completion)
training example. Eventually fine-tune a smaller / cheaper model
(Haiku or open-source) on it. Long-term cost reduction by replacing
Sonnet for some functions.

3-5 days of work. Requires:
- Export endpoint or CLI script.
- Quality filtering: skip rows with `_error` or known parse failures.
- Prompt template versioning consideration (the `prompt_version` field
  in cache inputs helps here).

### Working principle for all moat items

Do not ship a new feature using the moat data before the underlying
caches have had time to accumulate. The flywheel needs weeks of usage
before items 2-6 produce useful output. Until then, treat each item as
infrastructure work — building the rails, not the train.

## Pending: Resources hub page

When the nav or footer feel crowded, build a `/resources` hub page listing all tools + features (Windsor.ai style). Trim the main nav to "Top tools" + "All resources →". Not urgent yet.

## How to add a new important warning or suggestion

This is the single source of truth for working-rules in this project. When the user gives durable feedback that should apply across future sessions, add it here under the right section above. Two patterns:

1. **Hard rule** (must-follow): add under a numbered list with explicit "do NOT" or "MUST" language.
2. **Preference / context** (should-follow): add as a paragraph in the relevant section.

After adding, commit and push so it survives Claude account changes and accidental local-data deletions.


---


# Quick reference: the user's identity

- Real email: `royalbluemedia.agency@gmail.com` (any other email shown in system context is stale and should be ignored)
