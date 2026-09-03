# Google Keyword Planner setup (powers real search volume)

The free keyword tool at `/tools/youtube-keyword-research` shows real monthly
search volume + competition once these credentials are set. Until then it runs
in fallback mode (relative demand + cached YouTube competition). No fake numbers
are ever shown.

The data source is the Google Ads API (Keyword Planner). It is free. It does
NOT touch the YouTube Data API 10K/day quota. Results are cached cross-user in
`youtube_search_cache` under the `kp:` prefix for 30 days.

## One-time setup

1. **Google Ads account.** Use or create one at https://ads.google.com (no ad
   spend required). Note the account Customer ID, 10 digits like `123-456-7890`.

2. **Developer token.** In Google Ads: Tools and Settings -> API Center.
   Generate a developer token. It starts at "Test account" access, which only
   returns data for test accounts. Apply for **Basic access** to get real data.
   Approval can take a few days (similar to the YouTube quota bump). Build runs
   in fallback until this is approved.

3. **OAuth client.** In Google Cloud Console (a project with the Google Ads API
   enabled): APIs and Services -> Credentials -> Create OAuth client ID
   (Desktop app is simplest). Save the `client_id` and `client_secret`.

4. **Refresh token.** Authorize once with scope
   `https://www.googleapis.com/auth/adwords` to get a `refresh_token`. The
   google-ads Python library ships a helper
   (`python -m google.ads.googleads.util` examples), or use the OAuth flow in
   the Google Ads API docs.

## Railway environment variables

Set these on the service, then redeploy. The tool auto-detects them.

| Variable | Required | Notes |
|---|---|---|
| `GOOGLE_ADS_DEVELOPER_TOKEN` | yes | From API Center. Must be Basic-access approved for real data. |
| `GOOGLE_ADS_CLIENT_ID` | yes | OAuth client id. |
| `GOOGLE_ADS_CLIENT_SECRET` | yes | OAuth client secret. |
| `GOOGLE_ADS_REFRESH_TOKEN` | yes | From the one-time authorization. |
| `GOOGLE_ADS_CUSTOMER_ID` | yes | The account id, digits only (no dashes). |
| `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | only if using a manager (MCC) account | Manager id, digits only. |
| `GOOGLE_ADS_GEO_TARGET` | no | Default `2840` (United States). |
| `GOOGLE_ADS_LANGUAGE` | no | Default `1000` (English). |

When `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CLIENT_ID`,
`GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN`, and
`GOOGLE_ADS_CUSTOMER_ID` are all present, `app/keyword_planner.py` starts
returning real volume. Missing or failing creds -> graceful fallback, never an
error.

## Verifying

After redeploy, search a common term in the tool. Volume and Opportunity
columns should fill with real numbers and the "Search volume pending" pill
should disappear. If it stays in fallback, check the Railway logs for
`[keyword_planner]` lines, which name the exact failure (token not approved,
bad refresh token, wrong customer id, etc.).
