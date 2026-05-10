// YTGrowth content script. Runs on every youtube.com page (ISOLATED world).
// v0.0.4: DOM-first rendering. Most data comes from page-bridge.js reading
// YouTube's own globals (ytInitialPlayerResponse). Only tags require a
// backend round-trip, so the panel renders instantly and tags fill in async.
// Quota usage drops from "1 unit per video opened" to "1 unit per uncached
// video where tags are actually requested" — and even that hits a 30-min
// server-side cache.

(function () {
  const PANEL_ID = "ytg-panel-root";
  const DASHBOARD_URL = "https://ytgrowth.io/dashboard";
  const LOGIN_URL     = "https://ytgrowth.io/auth/login";

  // One-time confirmation that Inter actually loaded. document.fonts is
  // page-scoped, so this resolves once the page (and our injected CSS)
  // has finished loading the bundled woff2 files. If Inter fails to load
  // we'll see the fallback warning in the console — easy to diagnose.
  if (document.fonts && document.fonts.ready && !window.__ytgFontChecked__) {
    window.__ytgFontChecked__ = true;
    document.fonts.ready.then(() => {
      try {
        const ok = document.fonts.check('700 16px "Inter"');
        console.info(`[YTGrowth] Inter font ${ok ? "loaded" : "NOT loaded (using fallback)"}.`);
      } catch (_) {}
    });
  }

  function isWatchPage() {
    return location.pathname === "/watch" && new URLSearchParams(location.search).has("v");
  }

  function getVideoId() {
    return new URLSearchParams(location.search).get("v") || "";
  }

  function isYTDark() {
    return document.documentElement.hasAttribute("dark");
  }

  function removePanel() {
    document.getElementById(PANEL_ID)?.remove();
  }

  // Brand logo (matches /static/logo.svg used elsewhere on ytgrowth.io).
  const ICON_LOGO = `<svg viewBox="0 0 26 26" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="26" height="26" rx="7" fill="#e5251b"/><path d="M18.5 10.2a1.6 1.6 0 0 0-1.12-1.12C16.4 8.8 13 8.8 13 8.8s-3.4 0-4.38.3A1.6 1.6 0 0 0 7.5 10.2 17 17 0 0 0 7.2 13a17 17 0 0 0 .3 2.8 1.6 1.6 0 0 0 1.12 1.12C9.6 17.2 13 17.2 13 17.2s3.4 0 4.38-.3a1.6 1.6 0 0 0 1.12-1.12A17 17 0 0 0 18.8 13a17 17 0 0 0-.3-2.8z" fill="white"/><polygon points="11.2,16 16,13 11.2,10" fill="#e5251b"/></svg>`;
  const ICON_CLOSE = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
  const ICON_ARROW = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>`;
  const ICON_COPY  = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>`;
  const ICON_REFRESH = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/></svg>`;

  // ── Formatting helpers ──────────────────────────────────────────────
  function fmtNum(n) {
    n = Number(n) || 0;
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 10_000)        return Math.round(n / 1_000) + "K";
    if (n >= 1_000)         return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return String(Math.round(n));
  }
  function fmtMoney(n) {
    n = Number(n) || 0;
    if (n >= 1000) return "$" + fmtNum(n);
    return "$" + n.toFixed(0);
  }
  function fmtAge(publishedISO) {
    if (!publishedISO) return "—";
    const ms = Date.now() - new Date(publishedISO).getTime();
    if (Number.isNaN(ms) || ms < 0) return "—";
    const sec = Math.floor(ms / 1000);
    if (sec < 60)        return "just now";
    if (sec < 3600)      return Math.floor(sec / 60) + "m ago";
    if (sec < 86400)     return Math.floor(sec / 3600) + "h ago";
    if (sec < 86400 * 7) return Math.floor(sec / 86400) + "d ago";
    if (sec < 86400 * 30)return Math.floor(sec / (86400 * 7)) + "w ago";
    if (sec < 86400 * 365) return Math.floor(sec / (86400 * 30)) + "mo ago";
    return Math.floor(sec / (86400 * 365)) + "y ago";
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ── Computation (mirrors backend extension_routes.py) ───────────────
  function hoursSince(iso) {
    if (!iso) return 0;
    const ms = Date.now() - new Date(iso).getTime();
    if (Number.isNaN(ms) || ms < 0) return 0;
    return ms / 3600000;
  }

  function seoScore({ title, description, tagCount, engagementPct }) {
    let score = 0;
    const notes = [];

    const tlen = (title || "").length;
    if (tlen >= 50 && tlen <= 70) score += 20;
    else if ((tlen >= 40 && tlen < 50) || (tlen > 70 && tlen <= 80)) score += 14;
    else if (tlen >= 30) score += 8;
    else notes.push("title too short");

    const dwords = (description || "").split(/\s+/).filter(Boolean).length;
    if (dwords >= 250) score += 25;
    else if (dwords >= 150) score += 18;
    else if (dwords >= 50) score += 10;
    else notes.push("thin description");

    const tc = tagCount || 0;
    if (tc >= 8 && tc <= 20) score += 35;
    else if ((tc >= 4 && tc < 8) || (tc > 20 && tc <= 30)) score += 24;
    else if (tc > 0) { score += 12; notes.push("few tags"); }
    else notes.push("no tags");

    const eng = engagementPct || 0;
    if (eng >= 4) score += 20;
    else if (eng >= 2) score += 14;
    else if (eng >= 1) score += 8;

    score = Math.max(0, Math.min(100, score));

    let summary;
    if (score >= 85)      summary = "Excellent foundation";
    else if (score >= 70) summary = "Solid setup";
    else if (score >= 55) summary = "Decent, room to improve";
    else if (score >= 40) summary = "Needs work";
    else                  summary = "Significant gaps";
    if (notes.length) summary += ` (${notes.slice(0, 2).join(", ")})`;

    // Three-bucket tier drives the ring color so 58 reads as "medium"
    // (amber) rather than "bad" (brand red), which felt punitive.
    let tier;
    if (score >= 70)      tier = "good";
    else if (score >= 40) tier = "medium";
    else                  tier = "bad";

    return { score, summary, tier };
  }

  // Per-factor breakdown so creators see WHY the score landed where it
  // did and what to actually change. Each factor now exposes BOTH the
  // status indicator AND the points earned vs the maximum possible, so
  // the panel can render a bar chart showing the breakdown.
  function buildFactors(pageData, tagState) {
    const tlen   = (pageData.title || "").length;
    const dwords = (pageData.description || "").split(/\s+/).filter(Boolean).length;
    const views  = Number(pageData.viewCount) || 0;
    const likes  = Number(pageData.likeCount) || 0;
    const eng    = views > 0 ? (likes / views) * 100 : 0;

    let tagCount = null;
    if (tagState && Array.isArray(tagState.tags)) tagCount = tagState.tags.length;
    else if (tagState && tagState.error) tagCount = -1; // unknown / quota / auth

    // Title — max 20 points, sweet spot 50-70 chars
    let titlePts = 0;
    if (tlen >= 50 && tlen <= 70) titlePts = 20;
    else if ((tlen >= 40 && tlen < 50) || (tlen > 70 && tlen <= 80)) titlePts = 14;
    else if (tlen >= 30) titlePts = 8;

    // Description — max 25 points, sweet spot 250+ words
    let descPts = 0;
    if (dwords >= 250) descPts = 25;
    else if (dwords >= 150) descPts = 18;
    else if (dwords >= 50) descPts = 10;

    // Tags — max 35 points (the highest-impact factor)
    let tagsPts = 0;
    if (tagCount === null) tagsPts = 0; // unknown while loading
    else if (tagCount === -1) tagsPts = 0;
    else if (tagCount >= 8 && tagCount <= 20) tagsPts = 35;
    else if ((tagCount >= 4 && tagCount < 8) || (tagCount > 20 && tagCount <= 30)) tagsPts = 24;
    else if (tagCount > 0) tagsPts = 12;

    // Engagement — max 20 points
    let engPts = 0;
    if (eng >= 4) engPts = 20;
    else if (eng >= 2) engPts = 14;
    else if (eng >= 1) engPts = 8;

    return [
      {
        label: "Title",
        value: `${tlen} chars`,
        earned: titlePts, max: 20,
        status: titlePts === 20 ? "good" : titlePts >= 8 ? "warn" : "bad",
      },
      {
        label: "Description",
        value: `${dwords} words`,
        earned: descPts, max: 25,
        status: descPts >= 25 ? "good" : descPts >= 10 ? "warn" : "bad",
      },
      {
        label: "Tags",
        value: tagCount === null ? "loading…" : (tagCount === -1 ? "unavailable" : `${tagCount} tags`),
        earned: tagsPts, max: 35,
        status: tagCount === null ? "loading"
              : tagCount === -1 ? "warn"
              : tagsPts === 35 ? "good"
              : tagCount === 0 ? "bad" : "warn",
      },
      {
        label: "Engagement",
        value: `${eng.toFixed(2)}%`,
        earned: engPts, max: 20,
        status: engPts === 20 ? "good" : engPts >= 8 ? "warn" : "bad",
      },
    ];
  }

  // Distill the factor list into ONE actionable next step. Creators
  // don't want to read four rows and triangulate the biggest miss; they
  // want a single sentence telling them what to fix right now. Picks the
  // highest-impact gap (tags are worth +35, description +25, title +20,
  // engagement +20) and phrases it as a concrete action with the SEO
  // points they'd recover.
  function topOpportunity(pageData, factors, score) {
    const tagF   = factors.find(f => f.label === "Tags");
    const descF  = factors.find(f => f.label === "Description");
    const titleF = factors.find(f => f.label === "Title");

    if (tagF && (tagF.status === "bad")) {
      return {
        label: "Add 8 to 15 tags",
        detail: "No tags set. Adding them is the single biggest win available here (~35 SEO points).",
      };
    }
    if (descF && descF.status === "bad") {
      return {
        label: "Expand the description",
        detail: "Description is too thin. Aim for 250+ words with keywords and context (~25 points).",
      };
    }
    if (titleF && titleF.status === "bad") {
      const tlen = (pageData.title || "").length;
      const target = tlen < 30 ? "50-70" : "60-70";
      return {
        label: `Adjust title to ${target} chars`,
        detail: `Currently ${tlen} chars. The sweet spot for search snippets is 50-70.`,
      };
    }
    if (tagF && tagF.status === "warn" && typeof tagF.value === "string" && /^\d+$/.test(tagF.value)) {
      const n = parseInt(tagF.value, 10);
      if (n < 8) {
        return {
          label: `Add ${8 - n} to ${15 - n} more tags`,
          detail: `${n} tags is light. 8-15 well-chosen tags is the sweet spot.`,
        };
      }
      if (n > 20) {
        return {
          label: "Trim tags down to 15-20",
          detail: `${n} tags dilutes the signal. Keep your strongest 15-20.`,
        };
      }
    }
    if (descF && descF.status === "warn") {
      return {
        label: "Make the description fuller",
        detail: "Adding keywords, timestamps, and links can lift watch time and ranking.",
      };
    }
    if (titleF && titleF.status === "warn") {
      const tlen = (pageData.title || "").length;
      return {
        label: tlen < 50 ? "Stretch the title slightly" : "Tighten the title",
        detail: `${tlen} chars now. 50-70 is the snippet-safe range.`,
      };
    }
    if (score >= 85) {
      return {
        label: "Solid foundation. Focus elsewhere.",
        detail: "Title, description, and tags are all in good shape. Thumbnail and hook are the bigger levers from here.",
      };
    }
    return null;
  }

  // YouTube category id -> [low RPM, high RPM] (creator's share, post-cut).
  const RPM_BY_CAT = {
    "27": [3.0, 12.0],
    "28": [4.0, 15.0],
    "26": [2.0, 8.0],
    "25": [1.5, 6.0],
    "20": [1.0, 4.0],
    "10": [0.8, 3.5],
    "22": [1.0, 4.0],
    "24": [0.8, 3.0],
    "23": [0.8, 3.0],
    "17": [1.0, 4.0],
    "19": [1.5, 5.5],
    "1":  [1.0, 4.0],
  };
  function estRevenue(views, categoryName) {
    // microformat gives a category NAME ("Education") not an ID. Map a
    // few common ones; default to a wide median band when unknown.
    const NAME_TO_ID = {
      "Education": "27",
      "Science & Technology": "28",
      "Howto & Style": "26",
      "News & Politics": "25",
      "Gaming": "20",
      "Music": "10",
      "People & Blogs": "22",
      "Entertainment": "24",
      "Comedy": "23",
      "Sports": "17",
      "Travel & Events": "19",
      "Film & Animation": "1",
    };
    const id = NAME_TO_ID[categoryName] || "";
    const [low, high] = RPM_BY_CAT[id] || [1.0, 5.0];
    const v = Number(views) || 0;
    return [
      Math.round(v / 1000 * low * 100) / 100,
      Math.round(v / 1000 * high * 100) / 100,
    ];
  }

  // ── DOM scraper (fallback for when page-bridge can't read globals) ──
  // YouTube serves stable SEO meta tags on every watch page. They give
  // us title, description, channel, view count, publish date, duration,
  // and category without needing any JS-side globals — meaning we work
  // even when YouTube refactors its bundle to ES modules.
  function getMeta(name) {
    const el = document.querySelector(`meta[itemprop="${name}"], meta[name="${name}"], meta[property="${name}"]`);
    return el ? (el.getAttribute("content") || "") : "";
  }

  function parseISODuration(iso) {
    if (!iso || !iso.startsWith("PT")) return 0;
    const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!m) return 0;
    return (parseInt(m[1] || "0", 10) * 3600)
         + (parseInt(m[2] || "0", 10) * 60)
         +  parseInt(m[3] || "0", 10);
  }

  function scrapeLikeCount() {
    const candidates = [
      "like-button-view-model button",
      "ytd-toggle-button-renderer[id='segmented-like-button']",
      "ytd-menu-renderer button[aria-label*='like']",
      "button[aria-label*='like this video']",
      "button[aria-label*='I like this']",
    ];
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      const aria = el && el.getAttribute("aria-label");
      if (!aria) continue;
      const m = aria.match(/([\d.,]+)\s*([KMB]?)/i);
      if (!m) continue;
      let n = parseFloat(m[1].replace(/,/g, ""));
      if (Number.isNaN(n)) continue;
      const suf = (m[2] || "").toUpperCase();
      if (suf === "K") n *= 1_000;
      else if (suf === "M") n *= 1_000_000;
      else if (suf === "B") n *= 1_000_000_000;
      const rounded = Math.round(n);
      if (rounded > 0) return rounded;
    }
    return 0;
  }

  function scrapeChannel() {
    const a = document.querySelector("ytd-video-owner-renderer ytd-channel-name a, ytd-channel-name#channel-name a, #owner #channel-name a, #channel-name a, ytd-channel-name a");
    const name = a?.textContent?.trim() || "";
    let id = "";
    if (a?.href) {
      const m = a.href.match(/\/channel\/([^/?#]+)/);
      if (m) id = m[1];
    }
    if (!id) id = getMeta("channelId") || "";
    return { name, id };
  }

  // Pull view count from the visible counter ("1,234 views" or "1.2M views").
  // Visible DOM updates reliably on SPA nav; the meta interactionCount tag
  // sometimes lags behind by seconds, which was causing stale data.
  function scrapeViewCount() {
    const candidates = [
      "ytd-watch-info-text",
      "yt-formatted-string.view-count",
      "ytd-video-view-count-renderer .view-count",
      "#info ytd-video-view-count-renderer",
      "#count #view-count",
    ];
    for (const sel of candidates) {
      document.querySelectorAll(sel).forEach(() => {});
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        const text = (el.textContent || "").trim();
        // Try raw first ("1,234,567 views")
        const raw = text.match(/([\d,]+)\s*views?/i);
        if (raw) {
          const n = parseInt(raw[1].replace(/,/g, ""), 10);
          if (n > 0) return n;
        }
        // Then abbreviated ("1.2M views")
        const abv = text.match(/([\d.]+)\s*([KMB])\s*views?/i);
        if (abv) {
          let n = parseFloat(abv[1]);
          const suf = abv[2].toUpperCase();
          if (suf === "K") n *= 1_000;
          else if (suf === "M") n *= 1_000_000;
          else if (suf === "B") n *= 1_000_000_000;
          if (n > 0) return Math.round(n);
        }
      }
    }
    // Fallback to the meta tag (may be stale during SPA transitions but
    // better than zero).
    return parseInt(getMeta("interactionCount") || "0", 10) || 0;
  }

  // Description from the visible expander, which re-renders on nav.
  function scrapeDescription() {
    const candidates = [
      "ytd-text-inline-expander#description-inline-expander",
      "#description-inline-expander",
      "ytd-watch-metadata #description",
      "#description",
    ];
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      const text = el?.textContent?.trim();
      if (text && text.length > 5) return text;
    }
    return getMeta("description") || getMeta("og:description") || "";
  }

  // Title from the visible h1 (re-rendered on every nav). Fall back to
  // document.title (also reliable) and only then to meta tags. Returns ""
  // if nothing usable — caller treats that as "page mid-transition".
  function scrapeTitle() {
    const h1 = document.querySelector("h1.ytd-watch-metadata yt-formatted-string, h1.title yt-formatted-string, h1.ytd-video-primary-info-renderer yt-formatted-string");
    const fromH1 = h1?.textContent?.trim() || "";
    if (fromH1 && fromH1 !== "YouTube") return fromH1;
    const fromDocTitle = (document.title || "").replace(/\s+- YouTube\s*$/, "").trim();
    if (fromDocTitle && fromDocTitle !== "YouTube") return fromDocTitle;
    return getMeta("name") || getMeta("og:title") || "";
  }

  function scrapeWatchPageData() {
    if (!isWatchPage()) return null;
    const videoId = getVideoId();
    if (!videoId) return null;

    const title = scrapeTitle();
    // No usable title means YouTube hasn't rendered the new video yet.
    // Returning null keeps the skeleton on screen instead of flashing
    // stale data from the previous video.
    if (!title || title === "YouTube") return null;

    // If we already rendered something for this video and the title we
    // just read is still the PREVIOUS video's title, treat as stale.
    if (lastPageData
        && lastPageData.videoId !== videoId
        && lastPageData.title === title) {
      return null;
    }

    const description = scrapeDescription();
    const ch          = scrapeChannel();
    const viewCount   = scrapeViewCount();
    const likeCount   = scrapeLikeCount();
    const publishDate = getMeta("datePublished") || getMeta("uploadDate") || "";
    const lengthSec   = parseISODuration(getMeta("duration"));
    const category    = getMeta("genre") || "";

    return {
      videoId, title, description,
      channelTitle: ch.name, channelId: ch.id,
      viewCount, likeCount, lengthSec, publishDate, category,
      isLive: false,
    };
  }

  // ── Panel rendering ─────────────────────────────────────────────────
  function buildShell() {
    removePanel();
    if (!isWatchPage()) return null;

    const dark = isYTDark();
    const root = document.createElement("div");
    root.id = PANEL_ID;
    root.dataset.theme = dark ? "dark" : "light";
    root.innerHTML = `
      <div class="ytg-panel" role="complementary" aria-label="YTGrowth insights">
        <div class="ytg-accent"></div>
        <div class="ytg-header">
          <div class="ytg-brand">
            <span class="ytg-logo">${ICON_LOGO}</span>
            <div class="ytg-brand-text">
              <span class="ytg-brand-name">YTGrowth</span>
              <span class="ytg-brand-tag">Live insights</span>
            </div>
          </div>
          <div class="ytg-header-actions">
            <button class="ytg-icon-btn ytg-refresh" title="Refresh" aria-label="Refresh">${ICON_REFRESH}</button>
            <button class="ytg-icon-btn ytg-close" title="Hide" aria-label="Hide panel">${ICON_CLOSE}</button>
          </div>
        </div>
        <div class="ytg-body"></div>
      </div>
    `;
    document.body.appendChild(root);
    requestAnimationFrame(() => root.classList.add("ytg-in"));

    root.querySelector(".ytg-close")?.addEventListener("click", () => {
      root.classList.remove("ytg-in");
      setTimeout(removePanel, 180);
    });
    root.querySelector(".ytg-refresh")?.addEventListener("click", () => {
      // Force a tag refetch (re-derives the score with fresh tag count too).
      pendingTagFetch = null;
      fetchTags(currentVideoId, /* force */ true);
    });
    return root;
  }

  function renderInitialLoading() {
    let root = document.getElementById(PANEL_ID);
    if (!root) root = buildShell();
    if (!root) return;
    const body = root.querySelector(".ytg-body");
    body.innerHTML = `
      <div class="ytg-skel-hero">
        <div class="ytg-skel-circle"></div>
        <div class="ytg-skel-lines">
          <div class="ytg-skel-line w70"></div>
          <div class="ytg-skel-line w90"></div>
        </div>
      </div>
      <div class="ytg-skel-rows">
        <div class="ytg-skel-row"></div>
        <div class="ytg-skel-row"></div>
        <div class="ytg-skel-row"></div>
      </div>
    `;
  }

  // Render-state tracking so we don't restart animations on every retry
  // or DOM scrape. The signature includes only fields that should actually
  // trigger a visual change; minor DOM churn during an ad-to-video
  // transition produces identical signatures and is silently skipped.
  let lastRenderSig = null;
  let lastRenderedVideoId = null;

  // Render with whatever we know so far. tagCount can be null (still
  // loading) or a number; tags array can be null (still loading), an
  // empty array (none), or populated.
  function renderPanel(pageData, tagState) {
    let root = document.getElementById(PANEL_ID);
    if (!root) root = buildShell();
    if (!root) return;

    // Signature dedup. If nothing meaningful changed since the last
    // render, bail out — keeps the bars from twitching every time
    // YouTube mutates the DOM during ads or stat updates.
    const sig = JSON.stringify({
      v:  pageData.videoId,
      t:  pageData.title,
      vc: pageData.viewCount,
      lc: pageData.likeCount,
      pd: pageData.publishDate,
      tl: (tagState && Array.isArray(tagState.tags)) ? tagState.tags.length : null,
      te: (tagState && tagState.error) || null,
    });
    if (sig === lastRenderSig) return;
    lastRenderSig = sig;

    // First-render flag. We animate the gauge and bars from 0 only the
    // first time we paint a given video. Subsequent renders (e.g. tags
    // arriving, likes ticking up) paint the new values directly so the
    // gauges don't wind back and forth.
    const isFirstForVideo = lastRenderedVideoId !== pageData.videoId;
    lastRenderedVideoId = pageData.videoId;

    const tags     = (tagState && Array.isArray(tagState.tags)) ? tagState.tags : null;
    const tagCount = tags ? tags.length : (tagState && typeof tagState.count === "number" ? tagState.count : null);
    const tagErr   = tagState && tagState.error;
    const tagLoading = !tags && !tagErr;

    const views = Number(pageData.viewCount) || 0;
    const likes = Number(pageData.likeCount) || 0;
    const hours = hoursSince(pageData.publishDate);
    const vph   = hours > 0 ? views / hours : 0;
    const engPct = views > 0 ? (likes / views) * 100 : 0;

    // Use known tag count if we have it, else assume worst-case 0 (we
    // re-render once tags arrive, so the score will refresh).
    const tcForScore = tagCount === null ? 0 : tagCount;
    const { score, summary, tier } = seoScore({
      title: pageData.title,
      description: pageData.description,
      tagCount: tcForScore,
      engagementPct: engPct,
    });

    const [revLow, revHigh] = estRevenue(views, pageData.category);
    const factors = buildFactors(pageData, tagState);
    const opp     = topOpportunity(pageData, factors, score);

    // Outlier detection: this video is performing exceptionally. Two
    // signals — high engagement rate OR strong views/hour for its age.
    // No channel context required, so this works on every video.
    let outlier = null;
    if (engPct >= 6) {
      outlier = { label: "Outlier", note: "Likes/view rate is exceptional" };
    } else if (engPct >= 4.5 && views >= 10_000) {
      outlier = { label: "Outlier", note: "Engagement well above average" };
    } else if (vph >= 5_000) {
      outlier = { label: "Trending", note: "View velocity is in the top band" };
    } else if (vph >= 1_000 && hours <= 168) {
      outlier = { label: "Trending", note: "Strong velocity in the first week" };
    }

    // Tag section content.
    let tagsHTML;
    if (tagLoading) {
      tagsHTML = `<div class="ytg-tags-loading">
        <span class="ytg-skel-line w90" style="height:18px;border-radius:999px;display:inline-block;width:64px;"></span>
        <span class="ytg-skel-line w90" style="height:18px;border-radius:999px;display:inline-block;width:90px;"></span>
        <span class="ytg-skel-line w90" style="height:18px;border-radius:999px;display:inline-block;width:72px;"></span>
      </div>`;
    } else if (tagErr) {
      const errMsg = {
        "quota_exceeded":    "Daily quota reached. Tags unavailable today.",
        "not_authenticated": "Sign in to YTGrowth to see tags.",
        "youtube_api_error": "YouTube API error. Try refresh.",
        "video_not_found":   "Video not available.",
        "extension_error":   "Tags couldn't load.",
        "network_error":     "Network issue.",
      }[tagErr] || "Tags couldn't load.";
      tagsHTML = `<div class="ytg-tag-empty">${escapeHtml(errMsg)}</div>`;
    } else if (tags && tags.length === 0) {
      tagsHTML = `<div class="ytg-tag-empty">This video has no tags</div>`;
    } else {
      tagsHTML = tags.slice(0, 30).map(t => `<span class="ytg-tag">${escapeHtml(t)}</span>`).join("");
    }

    const tagsHeadActions = (tags && tags.length > 0)
      ? `<button class="ytg-copy-tags" type="button" title="Copy all tags">${ICON_COPY}<span>Copy all</span></button>`
      : ``;

    const tagsLabel = tagCount === null ? "loading…" : `${tagCount} tag${tagCount === 1 ? "" : "s"}`;

    const body = root.querySelector(".ytg-body");
    const factorsHTML = factors.map(f => {
      const pct = f.max > 0 ? Math.round((f.earned / f.max) * 100) : 0;
      const initialFill = isFirstForVideo ? 0 : pct;
      return `
        <div class="ytg-factor" data-status="${f.status}">
          <div class="ytg-f-head">
            <span class="ytg-f-label">${escapeHtml(f.label)}</span>
            <span class="ytg-f-value">${escapeHtml(f.value)}</span>
            <span class="ytg-f-points"><strong>${f.earned}</strong>/${f.max}</span>
          </div>
          <div class="ytg-f-bar">
            <span class="ytg-f-bar-fill" data-target-fill="${pct}" style="--bar-fill: ${initialFill}"></span>
          </div>
        </div>
      `;
    }).join("");

    // Hero shows either the next action (when there's a clear
    // opportunity) or the status summary (when the score is high
    // enough that there's no obvious lever to pull).
    const heroTitle = opp ? opp.label : summary;
    const heroDetail = opp ? opp.detail : "";
    const ageStr = fmtAge(pageData.publishDate);
    const subParts = [];
    // Only show the tag count once it's actually resolved. Showing
    // "loading…" in the same line as the publish age read as broken.
    if (tags && tags.length > 0) {
      subParts.push(`${tags.length} tag${tags.length === 1 ? "" : "s"}`);
    } else if (tags && tags.length === 0) {
      subParts.push("no tags");
    }
    if (ageStr && ageStr !== "—") subParts.push(ageStr);
    const heroSub = subParts.join(" · ");

    const outlierHTML = outlier ? `
      <div class="ytg-outlier" title="${escapeHtml(outlier.note)}">
        <span class="ytg-outlier-dot"></span>
        <span>${escapeHtml(outlier.label)}</span>
      </div>
    ` : ``;

    const initialScore = isFirstForVideo ? 0 : score;
    body.innerHTML = `
      <div class="ytg-hero">
        <div class="ytg-score-ring" data-tier="${tier}" data-target-score="${score}" style="--score: ${initialScore}">
          <div class="ytg-score-inner">
            <span class="ytg-score-num" data-target-num="${score}">${initialScore}</span>
            <span class="ytg-score-cap">SEO</span>
          </div>
        </div>
        <div class="ytg-hero-meta">
          <div class="ytg-hero-titlerow">
            <div class="ytg-hero-title">${escapeHtml(heroTitle)}</div>
            ${outlierHTML}
          </div>
          ${heroDetail ? `<div class="ytg-hero-detail">${escapeHtml(heroDetail)}</div>` : ``}
          ${heroSub ? `<div class="ytg-hero-sub">${heroSub}</div>` : ``}
        </div>
      </div>

      <div class="ytg-rows">
        <div class="ytg-row">
          <span class="ytg-row-k">Views per hour</span>
          <span class="ytg-row-v">${fmtNum(vph)}</span>
        </div>
        <div class="ytg-row">
          <span class="ytg-row-k">Engagement (likes)</span>
          <span class="ytg-row-v">${engPct.toFixed(2)}%</span>
        </div>
        <div class="ytg-row">
          <span class="ytg-row-k">Est. revenue</span>
          <span class="ytg-row-v">${fmtMoney(revLow)}–${fmtMoney(revHigh)}</span>
        </div>
      </div>

      <div class="ytg-factors">
        <div class="ytg-section-title">What's driving the score</div>
        ${factorsHTML}
      </div>

      <div class="ytg-tags-section">
        <div class="ytg-tags-head">
          <span class="ytg-tags-title">Tags</span>
          ${tagsHeadActions}
        </div>
        <div class="ytg-tags">${tagsHTML}</div>
      </div>

      <a class="ytg-cta" href="${DASHBOARD_URL}" target="_blank" rel="noopener noreferrer">
        <span>Open full dashboard</span>${ICON_ARROW}
      </a>
    `;

    body.querySelector(".ytg-copy-tags")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(tags.join(", "));
        const span = body.querySelector(".ytg-copy-tags span");
        if (span) {
          const old = span.textContent;
          span.textContent = "Copied";
          setTimeout(() => { span.textContent = old; }, 1500);
        }
      } catch (_) {}
    });

    // Only animate the gauge + bars on the FIRST render for this video.
    // Re-renders (tag fetch returning, likes ticking up, etc.) paint the
    // new values directly so the bars don't wind back to zero and refill
    // every time YouTube nudges the DOM.
    if (isFirstForVideo) {
      requestAnimationFrame(() => {
        const ring = body.querySelector(".ytg-score-ring");
        if (ring) ring.style.setProperty("--score", String(Number(ring.dataset.targetScore) || 0));
        const num = body.querySelector(".ytg-score-num");
        if (num) animateCount(num, Number(num.dataset.targetNum) || 0, 1100);
        body.querySelectorAll(".ytg-f-bar-fill").forEach((el) => {
          el.style.setProperty("--bar-fill", String(Number(el.dataset.targetFill) || 0));
        });
      });
    }
  }

  // Easing match (cubic-bezier(.16,1,.3,1) approximation) for the count-up.
  function animateCount(el, target, durationMs) {
    const start = performance.now();
    const startVal = 0;
    function ease(t) {
      // matches the cubic-bezier(.16, 1, .3, 1) feel closely enough
      return 1 - Math.pow(1 - t, 3);
    }
    function tick(now) {
      const t = Math.min(1, (now - start) / durationMs);
      const v = Math.round(startVal + (target - startVal) * ease(t));
      el.textContent = String(v);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    }
    requestAnimationFrame(tick);
  }

  // ── Tag fetch (only async backend call) ─────────────────────────────
  function sendMessage(msg) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(msg, (response) => {
          if (chrome.runtime.lastError || !response) {
            resolve({ ok: false, status: 0, error: "extension_error" });
            return;
          }
          resolve(response);
        });
      } catch (_) {
        resolve({ ok: false, status: 0, error: "extension_error" });
      }
    });
  }

  let pendingTagFetch = null;
  async function fetchTags(videoId, force = false) {
    if (!videoId) return;
    if (!force && pendingTagFetch === videoId) return;
    pendingTagFetch = videoId;

    // Re-render with loading state for tags.
    if (lastPageData && lastPageData.videoId === videoId) {
      renderPanel(lastPageData, { /* loading */ });
    }

    const resp = await sendMessage({ type: "ytg:video", videoId });
    // If we navigated away mid-fetch, abort.
    if (currentVideoId !== videoId) return;
    if (!lastPageData || lastPageData.videoId !== videoId) return;

    if (resp.status === 401) {
      renderPanel(lastPageData, { error: "not_authenticated" });
      return;
    }
    const body = resp.body || {};
    if (body.ok && body.video && Array.isArray(body.video.tags)) {
      renderPanel(lastPageData, { tags: body.video.tags });
      return;
    }
    const code = body.error_code || resp.error || "extension_error";
    renderPanel(lastPageData, { error: code });
  }

  // ── Page-bridge integration ─────────────────────────────────────────
  let currentVideoId = null;
  let lastPageData   = null;

  function handlePageData(data) {
    if (!data || !data.videoId) return;
    if (!isWatchPage()) return;
    if (data.videoId !== getVideoId()) return; // stale message after nav

    const isFirstForThisVideo = currentVideoId !== data.videoId;
    currentVideoId = data.videoId;
    lastPageData   = data;

    // Render immediately with whatever we have. Tag count unknown → null.
    renderPanel(data, { /* tags loading */ });

    // Kick off tag fetch only the first time per video. Subsequent
    // bridge messages (e.g. for like-count refresh) re-render with the
    // tags we already have, no extra API call.
    if (isFirstForThisVideo) {
      fetchTags(data.videoId);
    }
  }

  window.addEventListener("message", (ev) => {
    if (ev.source !== window) return;
    const msg = ev.data;
    if (!msg || msg.source !== "ytg-bridge" || !msg.data) return;
    handlePageData(msg.data);
  });

  // Try the DOM scraper now and on a staircase of delays. YouTube's
  // SPA navigation finishes the URL change instantly but the meta tags
  // and like count don't all settle for ~2-3 seconds, so we keep
  // retrying. Each successful scrape replaces the previous render.
  function tryDOMScrape() {
    if (!isWatchPage()) return;
    const data = scrapeWatchPageData();
    if (!data) return;
    if (currentVideoId && data.videoId !== currentVideoId) return;
    handlePageData(data);
  }

  function scheduleScrapes() {
    tryDOMScrape();
    [100, 250, 500, 900, 1500, 2500, 4000].forEach(d => setTimeout(tryDOMScrape, d));
  }

  // ── SPA + boot ──────────────────────────────────────────────────────
  function initIfWatch() {
    if (isWatchPage()) {
      const vid = getVideoId();
      if (vid !== currentVideoId) {
        currentVideoId = vid;
        lastPageData   = null;
        lastRenderSig  = null; // new video => allow first re-render through
        renderInitialLoading();
        scheduleScrapes();
      } else if (!lastPageData) {
        // Same video, but we never got data through. Keep trying so
        // the panel doesn't sit stuck on a skeleton.
        scheduleScrapes();
      }
    } else {
      currentVideoId = null;
      lastPageData   = null;
      lastRenderSig  = null;
      removePanel();
    }
  }

  initIfWatch();
  document.addEventListener("yt-navigate-start", initIfWatch);
  document.addEventListener("yt-navigate-finish", initIfWatch);

  const themeObserver = new MutationObserver(() => {
    const root = document.getElementById(PANEL_ID);
    if (root) root.dataset.theme = isYTDark() ? "dark" : "light";
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["dark"] });

  // Watch the <title> element AND poll document.title every 100ms.
  // Both signal the moment YouTube finishes swapping the video; the
  // poll is cheap and catches cases where the MutationObserver misses.
  const titleEl = document.querySelector("title");
  if (titleEl) {
    new MutationObserver(() => {
      if (isWatchPage()) tryDOMScrape();
    }).observe(titleEl, { childList: true, subtree: true, characterData: true });
  }
  let lastDocTitle = document.title;
  setInterval(() => {
    if (document.title !== lastDocTitle) {
      lastDocTitle = document.title;
      if (isWatchPage()) tryDOMScrape();
    }
  }, 100);

  // Tight URL poll as a final safety net (was 800ms, dropped to 250ms
  // so video swaps register within ~quarter second worst case).
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      initIfWatch();
    }
  }, 250);
})();
