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

## TL;DR

Caching is the moat. Don't break it. Don't bypass it. Every new feature must answer "what's the per-use quota cost?" before it ships. If you can't answer that, you're not ready to write the code yet.
