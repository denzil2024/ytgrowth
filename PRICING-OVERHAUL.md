# Pricing Overhaul — Project Handover

Living doc. Goal: stop leaving money on the table by fixing the pricing,
checkout, and upsell flow so users convert without friction or confusion.
Update this file as items ship or new bugs surface. Newest status at the top
of each section.

Last updated: 2026-07-10

---

## 1. Why this project exists

The pricing surface was chaotic (15 SKUs, four pricing tabs, scattered upsell
prompts) and the checkout flow has real conversion leaks. A QA reviewer and a
SaaS founder both flagged the pricing as a problem. We are simplifying the
offer and removing every unnecessary step between "user wants to pay" and
"payment complete."

Core principle: every extra click, page load, or moment of confusion between
intent and payment is money lost. Cut them.

---

## 2. The two-domain setup (READ THIS FIRST — it drives several bugs)

We run on TWO domains on purpose:

- **ytgrowth.io** — the content / marketing brand. Blog, tools, landing,
  pricing. This is the domain Paddle has approved for checkout.
- **channelbrain.online** — the dashboard / logged-in app brand, and the
  OAuth client brand.

Why two: Google forced this. During YouTube Data API review they objected to
"YT" (YouTube's own abbreviation) in the app/OAuth name, so we stood up
channelbrain.online purely for the dashboard and OAuth consent screen. Same
React bundle serves both domains; behavior switches on `window.location.hostname`
via `frontend/src/brandHost.js` (`isChannelBrain()`).

Consequence for billing: **Paddle only approves ytgrowth.io.** Opening the
Paddle overlay on channelbrain.online is blocked by Paddle with a 403
("Transaction checkout creation is blocked for this vendor"). Verified by a
Puppeteer probe: channelbrain → 403, ytgrowth → 201. We are NOT adding
channelbrain.online to Paddle (user decision). Instead checkout hands off to
ytgrowth.io. See section 4.

OPEN UX PROBLEM: the domain jump (dashboard on channelbrain → pay on ytgrowth)
can confuse users, and seeing two brand names ("ChannelBrain" dashboard,
"YTGrowth" checkout/site) reads as inconsistent. We need reassurance copy in
BOTH places explaining they are the same product. See backlog item B1.

---

## 3. Pricing structure (current, live)

Plans (monthly / annual), from `routers/billing.py` + `frontend/src/pages/Landing.jsx`:

| Plan   | Monthly | Annual | Analyses/mo | Channels | AI Coach msgs |
|--------|---------|--------|-------------|----------|---------------|
| Free   | $0      | —      | 5 (lifetime trial, no refill) | 1 | 10 |
| Solo   | $19     | $190   | 20          | 3        | 30            |
| Growth | $49     | $490   | 50          | 5        | 100           |
| Agency | $149    | $1,490 | 150         | 10       | 300           |

Credit packs (one-time, never expire, stack on top of any plan or no plan):

| Pack         | Price | Analyses | Per analysis | Paddle price id |
|--------------|-------|----------|--------------|-----------------|
| Starter      | $5    | 5        | $1.00        | pri_01kx5gpqxnbmnxa13xfw66e1vk |
| Quick Boost  | $15   | 20       | $0.75        | pri_01kn96mpe190we3mx5bjycn3mj |
| Power Pack   | $42   | 60       | $0.70        | pri_01kn96ppcz3jvd1n07f97ndbh8 |
| Full Arsenal | $99   | 150      | $0.66        | pri_01kn96r93fxz2chsfrzyezazqr |

Pricing page now has TWO tabs: **Analysis Packs (first / default)** and
**Subscription**. Packs lead because light users (a tool used ~4x/month) are
better served pay-as-you-go than by a monthly plan.

---

## 4. What's shipped

- **Removed Lifetime and Founder tiers** from all purchase paths (pricing page
  tabs, cards, paddle.js keys, backend `PLAN_PRICE_MAP`, two FAQs). Kept the
  `PRICE_META` rows so refund webhooks for existing lifetime/founder buyers
  still resolve. Commit `b985032a6`.
- **Packs-first pricing** + **$5 Starter pack** wired to its real Paddle price.
  Commit `fad48430f`.
- **channelbrain checkout handoff.** On channelbrain.online, `openCheckout`
  ([frontend/src/checkout.js](frontend/src/checkout.js)) resolves the authed
  purchase (price + channel_id + email) then redirects to
  `https://ytgrowth.io/?pco=1&price=...&ch=...&em=...`. A receiver in
  [frontend/src/main.jsx](frontend/src/main.jsx) opens the Paddle overlay there
  and cleans the URL. Attribution survives; no second login. Commit `fad48430f`.

---

## 5. Known issues / conversion leaks (the backlog)

Ranked by estimated conversion damage. Update status as we go.

### A1. Every dashboard upgrade / top-up button now opens Paddle directly  — DONE (deploying)
Two shared helpers in [checkout.js](frontend/src/checkout.js): `startTopUp()`
(one-click `pack_60`) and `startUpgrade()` (billing-safe: existing subscribers
go to the Paddle portal so we never create a duplicate subscription; free /
no-sub users get a direct checkout for the next tier up). Every dashboard entry
point was rewired off the `/?tab=...#pricing` navigation:
- Gates: UpsellGate, CreditsEmptyModal (open Paddle directly, "See all" links kept as fallback)
- Settings: "Upgrade plan" (x2) + "Top up credits"
- UsageBar: quiet + alert "Upgrade" and "Top up"
- Outliers, Keywords: inline "Upgrade" banners
- Weekly Report: inline "Top up"
- Dashboard nav: "Upgrade to connect more channels"
Public marketing "Pricing" links (SiteHeader, LandingFooter, FeaturePage,
features/*) intentionally still point at the pricing page.

FOLLOW-UP A6: confirm the Paddle customer portal actually offers plan changes;
if not, build an in-app subscription-update flow so existing subscribers can
change tier without the portal. Until confirmed, subscriber upgrades land in
the portal (safe, no double-charge, but may not expose tier switching).

Original problem, for reference:

### A1-orig. Upsell gates linked to the pricing page instead of opening checkout
DONE in code (not yet pushed): [UpsellGate.jsx](frontend/src/components/UpsellGate.jsx)
and [CreditsEmptyModal.jsx](frontend/src/components/CreditsEmptyModal.jsx) now open
the Paddle overlay directly (with a loading state) instead of linking to the
pricing page. Locked-feature / free-tier gates default to a one-click
"Get Solo for $19/mo" (Growth/Agency behind a "See all plans" link, user
decision 2026-07-10). Out-of-credits defaults to "Buy 60 credits for $42" with
a "Buy 20 for $15" quick option and a "See all options" fallback. Change is
central to the two shared components, so every caller inherits it.
Original problem below.


The "Upgrade plan" / "Top up" buttons in the gates are plain links to
`/?tab=...#pricing` (see [CreditsEmptyModal.jsx:170](frontend/src/components/CreditsEmptyModal.jsx#L170)
and line 194; `UpsellGate` is the same). So a user who wants to pay gets dumped
back on the full pricing page to re-shop.

Real step count today (paying user runs out mid-task, in dashboard):
1. Hit limit → modal
2. Click Upgrade → full pricing page loads
3. Read tabs/cards, pick one, click its button
4. Redirect channelbrain → ytgrowth
5. Paddle overlay opens (multi-page)

Target: modal → one button ("Buy 60 credits – $42") → Paddle opens → pay.
Fix: give the gates a direct `openCheckout(planKey)` CTA for the most likely
plan/pack; keep "see all plans" as a secondary link.

### A2. Domain jump confuses users  — DONE (deployed + verified)
The channelbrain checkout handoff used to land on the full marketing homepage
(ytgrowth.io/?pco=...), which read as "it dumped me on the landing page." Now
it lands on a dedicated minimal [/checkout](frontend/src/pages/Checkout.jsx)
page that opens the Paddle overlay itself and shows reassurance copy
("You're on ytgrowth.io, our secure payment page; ChannelBrain and YTGrowth
are the same product"). Verified live with a Puppeteer probe: the page renders,
Paddle checkout-service returns 201, overlay opens. Also fixed a latent trap:
the SPA catch-all (`Navigate to "/"`) would have bounced /checkout back to the
landing, so /checkout is now a real route.

### A3. Paddle overlay is multi-page  — OPEN (Paddle dashboard setting, not code)
Even once open, Paddle steps through email → address → card on separate pages.
We prefill email. Switch the checkout to one-page in the Paddle dashboard
(Checkout settings) to cut steps. Action: user to toggle in Paddle.

### A4. Login wall for cold visitors  — OPEN (partly inherent)
Clicking a plan while logged out forces Google sign-in + YouTube connect before
payment. We need the channel for attribution, so some of this is inherent, but
worth revisiting whether we can defer the connect step.

### A5. No feedback on button click  — DONE
Added a shared `useCheckoutAction()` hook in [checkout.js](frontend/src/checkout.js)
that gives every upgrade/top-up button an "Opening…" busy + disabled state
during the fetch-then-redirect gap. Wired into Settings, the usage bar,
Outliers, Keywords, and Weekly Report. The gates already had it. (Nav menu
item excluded: its menu closes on click, so no button remains to update.)

### B1. Cross-brand reassurance copy  — IN PROGRESS
Done: the /checkout handoff page carries the "same product, same account"
reassurance, and Settings shows a line on channelbrain that checkout opens on
ytgrowth.io. Still consider: a footer line on ytgrowth.io and anywhere else the
two brand names could confuse a first-time buyer.

---

## 6. Decisions log

- Do NOT add channelbrain.online to Paddle. Keep channelbrain dashboard-only;
  route all checkout through ytgrowth.io. (2026-07-10)
- Remove Lifetime + Founder tiers; keep Subscription + Packs only. (2026-07-10)
- Packs are the hero (first/default tab). (2026-07-10)
- Added a $5 Starter pack to lower the entry barrier below the old $15 floor.
  5 analyses at $1.00 each; count/price easily changed. (2026-07-10)
- Do NOT auto-push. Batch changes, push only on explicit go-ahead. (2026-07-10)

---

## 7. How to test the checkout end-to-end

1. On the **channelbrain.online dashboard**, trigger any upgrade / Buy Analyses
   button. Expect: redirect to ytgrowth.io, Paddle overlay opens. (Was 403.)
2. Test the **$5 Starter** button → overlay shows $5.
3. On **ytgrowth.io pricing**, confirm Packs is the first/default tab, 4 pack
   cards, Subscription second.
4. Complete a real (or Paddle sandbox) purchase and confirm the webhook credits
   the right channel (`transaction.completed` → pack_balance top-up).

Puppeteer probe used to prove the domain issue lives in scratchpad; re-runnable
against both domains if checkout breaks again.

---

## 8. Open questions

- Rename the "Analysis Packs" tab to "Credits" / "Buy Credits"? (pending)
- One-page vs multi-page Paddle checkout: confirm the toggle exists on our
  Paddle plan.
- Should the dashboard upgrade CTA open checkout inline, or is the ytgrowth
  redirect acceptable long-term?
