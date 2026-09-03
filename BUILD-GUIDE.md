# How this web suite is built (reusable blueprint)

A complete walkthrough of the architecture, SEO machinery, prerender pipeline,
blog system, fonts, and page-building patterns behind YTGrowth, written so you
can rebuild the same stack in a fresh project. Plain numbers, no hand-waving.

---

## 1. The big picture

The site is a **single React SPA** that is **prerendered to static HTML at build
time** and **served by a Python FastAPI backend** that also runs the product API.
There is no Next.js, no SSR server, no separate front-end host. One FastAPI
process serves both the API and the committed static `dist/` folder.

```
Browser / crawler
      │
      ▼
FastAPI (app/main.py)  ── /api/*            → product endpoints
      │                ── /assets/*         → hashed JS/CSS (1-year cache)
      │                ── /{any path}       → catch-all:
      │                                        1. real file?  → serve it
      │                                        2. dist/<path>/index.html exists?
      │                                           → serve prerendered snapshot
      │                                        3. else → SPA shell + injected meta
      ▼
frontend/dist/  (committed to git, NOT built on the server)
```

The single most important decision: **`frontend/dist/` is committed to the repo
and served as-is.** The deploy host (Railway) never runs `npm run build`. The
developer builds locally, commits `dist/`, pushes, and the server just serves
files. This dodges the whole "Chromium won't install in the build image" class
of failure (which broke production twice here).

### Stack at a glance

| Layer | Choice |
|---|---|
| UI | React 19 + react-router-dom v7 (BrowserRouter, lazy routes) |
| Build | Vite 8 |
| Styling | Tailwind v4 (CSS-first) + per-page injected CSS variables |
| Prerender | Puppeteer headless Chromium, run locally at build time |
| Backend / host | FastAPI + uvicorn, Docker on Railway |
| Icons | lucide-react only |
| Blog | JSX-authored posts in one source file, no CMS, no markdown DB |

---

## 2. The React app

### Routing (`frontend/src/App.jsx`)

- One `<BrowserRouter>` with a flat `<Routes>` list.
- **Every page is `React.lazy()`-imported** so each route is its own JS chunk.
  Cold-load JS dropped from ~388 KB gzipped to ~60-100 KB. The landing page
  does not ship dashboard / SEO-studio code.
- `<Suspense fallback={null}>` is deliberate: never flash a spinner over
  prerendered HTML. React 19 keeps the existing DOM on screen while the chunk
  loads, then hydrates in place.
- Catch-all `<Route path="*">` redirects to `/`.

Public, indexable routes live under `/`, `/blog`, `/blog/:slug`, `/features/*`,
`/tools/*`, `/youtube-stats/*`, plus legal pages. Auth-only routes
(`/dashboard`, `/settings`, `/auth/*`) are deliberately NOT prerendered.

### Entry + hydration (`frontend/src/main.jsx`)

The key trick that makes prerender + SPA coexist:

```js
if (document.documentElement.dataset.prerendered === 'true' && rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, tree)        // prerendered page → attach to existing DOM
} else {
  createRoot(rootEl).render(tree)  // normal SPA → render from scratch
}
```

The prerender script stamps `<html data-prerendered="true">` into every snapshot.
At runtime, if that flag is present and `#root` already has children, React
hydrates instead of re-rendering, so crawlers and users both see real HTML with
no flash of empty content.

Two more things `main.jsx` does that matter for performance and clean snapshots:

- **Third-party scripts (Paddle, analytics pixel) load lazily** on first user
  interaction (`mousemove`, `keydown`, `touchstart`, `scroll`) or a 2.5s
  timeout, whichever comes first. This keeps them off the LCP critical path.
- **It skips third-party loading entirely when `navigator.webdriver` is true.**
  Puppeteer sets that flag during prerender, so the snapshot HTML never bakes in
  Paddle/analytics tags.

---

## 3. The prerender pipeline (the SEO engine)

File: `frontend/scripts/prerender.js`. This is the heart of the SEO setup.

### What it does

1. Spins up a tiny Node static server pointed at `dist/` on port 4173.
2. Launches headless Chromium via Puppeteer.
3. For each public route: navigates, waits for `networkidle0` AND for
   `#root` to have children, then snapshots `page.content()`.
4. Stamps `data-prerendered="true"`, bakes per-route meta tags, and writes the
   result to `dist/<route>/index.html` (the index route overwrites
   `dist/index.html`; nested routes get their own subdirectory).

It runs **only on the developer machine** during `npm run build`. The server
never executes it.

### Where the route list comes from (`buildRoutes()`)

A mix of hardcoded routes and **discovered** ones:

- Static: `/`, `/blog`, feature pages, tool pages, legal pages.
- Blog slugs discovered by reading `src/blog/posts.jsx` and regexing out every
  `slug:` after `export const posts = [`.
- Programmatic fan-out for the stats pages: 14 categories x 5 countries =
  70 combo pages, generated from shared metadata arrays
  (`youtubeStatsCategories.js`, `youtubeStatsCountries.js`). Around 189 routes
  total today.

### Per-route SEO meta baking (`bakeRouteMeta()`)

Two sources of truth for title/description:

- Routes listed in `META_BY_ROUTE` (feature pages, tool pages, stats pages) get
  their canonical title/description from that map.
- Routes that set their own meta in a React `useEffect` (blog posts, contact,
  legal) keep whatever the snapshot already contains.

Either way, the script then rewrites and synchronizes: `<title>`,
`meta[name=description]`, `<link rel=canonical>`, `og:url`, `og:title`,
`og:description`, `twitter:title`, `twitter:description`, so every tag agrees.
For blog posts it also swaps `og:image` / `twitter:image` to the post's own
cover (and rewrites the `.webp` cover to a `.jpg` twin, because LinkedIn /
WhatsApp / some email clients mishandle WebP previews).

### Baking dynamic data into snapshots

For the stats leaderboard pages, the script optionally prefetches live channel
data from a build-time API URL and:

- Primes `window.__INITIAL_STATS__` via `page.evaluateOnNewDocument` before the
  page renders, so React bakes the real rows into the snapshot.
- Injects the same payload as an inline `<script>` (via `JSON.parse(stringLiteral)`
  to be XSS/parse-safe) so client hydration reads identical initial state and
  does not throw a hydration mismatch.

This pattern (prime a `window.__INITIAL_*__` global, then inject it as a script
for hydration parity) is the general way to prerender data-driven pages without
an SSR server.

### Build wrapper + guardrail

`frontend/scripts/build.js`:

- On a dev machine: runs `vite build` → `prerender.js` → `verify-prerender.js`.
- On CI / Railway (detected via `RAILWAY_*`, `NIXPACKS_*`, `CI` env vars): exits
  early and touches nothing, because `dist/` is already committed.
- `verify-prerender.js` hard-fails the build if any expected route is missing
  from `dist/`. This exists because someone once ran plain `vite build` (which
  cleans `dist/` and skips prerender) and shipped the empty SPA shell to
  crawlers. The guard makes that impossible to do silently.

---

## 4. SEO files

All live in `frontend/public/` and are copied verbatim into `dist/` by Vite,
then served by the FastAPI catch-all as ordinary static files. No special
routes needed.

### `index.html` (the shell)

The static head carries the full default SEO payload so even an unprerendered
route is respectable:

- Title, meta description, canonical, `robots` (`index, follow,
  max-image-preview:large, max-snippet:-1`), theme-color, author.
- Full Open Graph + Twitter card blocks.
- Two **JSON-LD blocks**: a `SoftwareApplication` (with `offers`, `featureList`,
  `audience`) and an `@graph` of `Organization` + `WebSite` sharing a stable
  `@id` so brand searches resolve to one knowledge-graph entity with `sameAs`
  social links.
- Font preconnect + stylesheet, and the analytics tag.

### `robots.txt`

Allows `/`, disallows `/auth/`, `/api/`, `/billing/`, `/admin`, `/dashboard`.
Crucially it has **explicit per-bot allow blocks for AI crawlers**: GPTBot,
ChatGPT-User, OAI-SearchBot, ClaudeBot, anthropic-ai, Claude-Web,
PerplexityBot, Perplexity-User, Google-Extended, CCBot, plus Googlebot and
Bingbot. Ends with `Sitemap: https://.../sitemap.xml`.

### `llms.txt`

A markdown brief written for LLM crawlers (the emerging convention). Sections:
what it is, who it is for, core features, pricing, affiliate, how it differs
from competitors, important links. This is the file ChatGPT/Claude/Perplexity
read to describe the product accurately. Worth writing carefully because it
becomes the model's mental model of the product.

### `sitemap.xml`

A **static, manually maintained** XML file (no generator script). Each URL has
`lastmod`, `changefreq`, `priority`. Priorities used: homepage 1.0, features/
tools 0.9, stats hub/categories 0.85, combos 0.75, blog index 0.8, posts 0.7,
legal 0.3-0.8. If you rebuild this, consider generating it from the same route
list `buildRoutes()` uses, so it can never drift from what is prerendered.

---

## 5. Serving layer (FastAPI)

File: `app/main.py`.

- `DIST = .../frontend/dist`.
- **Hashed assets** mounted at `/assets` via a `HashedStaticFiles` subclass that
  sets `Cache-Control: public, max-age=31536000, immutable` (1 year). Safe
  because Vite puts a content hash in every filename.
- **Catch-all route** `@app.get("/{full_path:path}")` decides in this order:
  1. `dist/<path>` is a real file → `FileResponse` (CSS, JS, images, robots,
     sitemap, llms).
  2. `dist/<path>/index.html` exists → serve that **prerendered snapshot**.
  3. Otherwise → serve the SPA shell with **runtime meta injection**.
- `_render_index_with_meta()` + a `ROUTE_META` dict handle case 3: regex-swap
  title/description/canonical/og/twitter into the shell for routes that are not
  prerendered. `ROUTE_META` mirrors `META_BY_ROUTE` in the prerender script;
  keep them in sync.

So prerendered routes get a fully-baked file; everything else still gets correct
per-route meta at request time. Both paths produce crawlable HTML.

---

## 6. Fonts and the design system

### Fonts (note the real state)

- `index.html` preloads **Plus Jakarta Sans**, but the pages do not use it. It
  is effectively dead weight and should be dropped in a clean rebuild.
- **Public marketing pages** (landing, features, tools, blog) use **DM Sans**
  for headings and **Inter** for body, injected per-page via a `useStyles()`
  hook that appends a Google Fonts `<link>`.
- **The dark app shell / dashboard** uses **Geist** (scoped to the dashboard
  classes) with Inter as fallback.

For a new project, pick one heading + one body font and load it once in
`index.html` rather than per-page. The per-page injection here is historical.

### Styling approach

- **Tailwind v4 CSS-first.** `src/index.css` does `@import 'tailwindcss'`; there
  is no `tailwind.config.js`. The Vite plugin `@tailwindcss/vite` wires it up.
- In practice the codebase leans on **CSS custom properties + hand-written CSS
  classes** more than Tailwind utilities. Design tokens are CSS variables
  (`--ytg-*`) injected by the page wrappers, not Tailwind theme tokens.

### Token palettes

- Public pages: a `--ytg-*` set (backgrounds, text tiers, card, borders, brand
  red `#e5302a`, soft red wash, and a 4-level shadow scale `--ytg-shadow-sm`
  through `--ytg-shadow-xl`, each a 2-layer soft+far shadow).
- Dashboard: a light palette object `C` and a dark `SHELL` palette in
  `src/pages/dashboard/tokens.js`. SHELL uses gradient card backgrounds lit from
  the top, hairline white borders, and a hard rule: **brand red is an accent
  only (left stripe, icon), never a background wash.** Toggles use soft grey,
  red is reserved for primary CTAs.

### Canonical type scale (in-app)

Two weights only across the app: **600** for titles/labels/buttons, **450** for
body/caption. H1 26/600, section 16/600, body 13.5/450, caption 12.5/450,
eyebrow 11/600. The marketing pages run a larger scale (hero H1 up to 72/800 in
DM Sans). Keeping to two weights is what makes it feel "not too bold."

### Icons

lucide-react only. Pattern: a Lucide glyph (18-24px, stroke 1.75) inside a soft
**tinted circle** background (e.g. `rgba(229,37,27,0.08)`), one icon per
category, never recycled, never emoji.

---

## 7. Page-building patterns

### Shared shell components (`frontend/src/components/`)

- `SiteHeader.jsx`: sticky 60px header with Features/Resources mega-menus and a
  mobile overlay.
- `LandingFooter.jsx`: dark 5-column footer with social links.
- `BrandLockup.jsx`: logo lockup, light/dark variants.
- `FaqSchema.jsx` / a `seo` util: injects JSON-LD FAQ schema for feature pages.

### A feature page (`src/pages/FeaturePage.jsx` + `pages/features/*`)

`FeaturePage` is a shared layout: SiteHeader → hero → visual mockup →
how-it-works → what-you-get → who-it-for → FAQ → CTA → LandingFooter. Concrete
pages (e.g. `SeoStudio.jsx`) just pass content arrays (`howItWorks`,
`whatYouGet`, `whoItsFor`, `faq`) and a hero. Each section is eyebrow pill →
H2 (DM Sans 800) → body (Inter) → optional card grid → red CTA. Background
rhythm alternates light/dark between sections. Each page sets its own
`document.title` and injects FAQ JSON-LD in a `useEffect`.

Tool pages (`pages/tools/*`) follow the same skeleton with a single custom
interactive component per tool.

---

## 8. The blog system (no CMS, no database)

Everything lives in **one file**: `frontend/src/blog/posts.jsx`.

### Post schema

```js
{
  slug: 'youtube-rpm',                 // URL id
  title: '...',
  excerpt: '...',                      // listing + meta description
  date: '2026-05-25',                  // ISO
  updated?: '2026-06-01',              // optional
  category: CATEGORIES.monetization,   // reference to a category object
  cover: '/blog/youtube-rpm-cover.jpg',
  author: 'Denzil',
  readTime: '11 min read',            // manual, not computed
  content: () => ( <>...JSX...</> ),    // body is a function returning JSX
}
```

`CATEGORIES` is a small map (subscribers, monetization, growth, seo, thumbnails,
strategy, analytics) each `{ slug, label }`.

### Authoring

Post bodies are plain JSX: `<p>`, `<h2>`, `<h3>`, lists, tables, `<img>`,
`<a>`, plus three reusable promo components exported from the same file:

- `CtaButton({ to, children })` — inline red pill link.
- `CtaCard({ to, title, sub, button })` — full-width promo row (place these
  mid-article, never at the end).
- `TemplateBlock({ text })` — a copy-to-clipboard monospace block for
  paste-ready templates.

Helpers: `getPostBySlug`, `getRelatedPosts(slug, max)` (next N excluding
current), `formatPostDate` (`May 25, 2026`).

### Listing page (`pages/Blog.jsx`)

Hero → featured (newest) post → paginated 12-per-page 3-col grid → bottom CTA.
Sets `document.title` / meta description per page and injects `<link rel=prev>` /
`<link rel=next>` for paginated SEO.

### Post page (`pages/BlogPost.jsx`)

Header (category pill, title, excerpt, byline, hero image) → `.bp-prose` body
(typography fully scoped in CSS so post JSX needs no inline styles) →
mid/bottom CTA → related posts. In a `useEffect` it sets title + description and
injects a JSON-LD `@graph` containing **`BlogPosting`** (headline, image,
datePublished, dateModified, author, publisher, articleSection, canonical) and
**`BreadcrumbList`** (Home → Blog → post). The script tag is idempotent (reused
by `id="bp-jsonld"`).

### Covers

`frontend/public/blog/<slug>-cover.{jpg,webp}` at 16:9 (1600x900). Authors
reference the `.jpg`; the prerender swaps OG images to the `.jpg` twin for
share-preview compatibility.

### Publishing a new post end-to-end (non-negotiable order)

1. Write the post object in `posts.jsx` (full draft, proofread, CTA mid-article).
2. Drop cover + inline images in `public/blog/`.
3. It is auto-discovered by `prerender.js` `buildRoutes()`, so no route edit is
   needed for blog slugs (other new public routes DO need adding there).
4. Add the URL to `sitemap.xml`.
5. Run the build (`npm run build`) so a prerendered `dist/blog/<slug>/index.html`
   is generated.
6. Commit source + rebuilt `dist/` together, push.

Skipping the build/prerender step ships an empty SPA shell to crawlers.

---

## 9. Deploy

- **Dockerfile** installs Python deps and `COPY . .` (which includes the
  committed `dist/`). It deliberately does NOT run `npm run build`. CMD is
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- **railway.toml** selects the Dockerfile builder, restart-on-failure x3.
- **nixpacks.toml / Procfile** are fallbacks; the build phase is emptied so
  nothing tries to npm-build.
- Workflow: build locally → commit specific files incl. `dist/` → push →
  Railway auto-deploys → verify the live URL actually serves (Active status is
  not proof the container is serving).

---

## 10. Checklist to reproduce this in a new project

1. `npm create vite@latest` (React) + add `@tailwindcss/vite`, react-router-dom,
   lucide-react. `@import 'tailwindcss'` in `index.css`.
2. Put full default SEO + JSON-LD (SoftwareApplication/Organization/WebSite) in
   `index.html`. Pick one heading font + one body font, load once.
3. Build `App.jsx` with lazy routes and an empty Suspense fallback.
4. In `main.jsx`, branch on `data-prerendered` → `hydrateRoot` vs `createRoot`;
   lazy-load third-party scripts; skip them when `navigator.webdriver`.
5. Write `scripts/prerender.js` (Puppeteer): static server → snapshot each route
   → stamp `data-prerendered` → bake per-route meta → write
   `dist/<route>/index.html`. Discover dynamic routes from your data files.
6. Write `scripts/build.js` (vite build → prerender → verify, skip on CI) and
   `scripts/verify-prerender.js` (fail if a route is missing).
7. Add `robots.txt` (with AI-bot allow blocks), `llms.txt`, `sitemap.xml` in
   `public/`.
8. Backend catch-all: real file → prerendered `index.html` → SPA shell with
   runtime meta injection. 1-year immutable cache on hashed assets.
9. Blog: one `posts.jsx` with a post schema + reusable CtaCard/CtaButton, a
   listing page, a post page that injects BlogPosting + BreadcrumbList JSON-LD.
10. Commit `dist/`, deploy a host that serves static files and does not rebuild.

### The five ideas that make it work

- Prerender at build time, hydrate at runtime: SEO of SSR, simplicity of an SPA.
- Commit `dist/`; never build on the server.
- One catch-all that prefers a prerendered file and falls back to shell+meta.
- A verify step that hard-fails if prerender was skipped.
- Treat `robots.txt` / `llms.txt` / JSON-LD as first-class, including explicit
  AI-crawler rules.
