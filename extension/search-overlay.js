// YTGrowth search-results overlay. Runs on youtube.com (ISOLATED world)
// and only does anything on /results pages. Pure DOM scraping; never
// touches the YouTube Data API, so it works regardless of quota state
// and adds zero per-search latency.
//
// What we inject:
//   1. A header bar above the results with an overall keyword competition
//      score (0-100), three-bucket label, key stats from the visible top
//      10, and one strategic insight ("most results are 2+ years old —
//      fresh content can break through").
//   2. A small color-coded pill on each individual result indicating how
//      "anchored" that result is in the field (giant view count + recent
//      = anchored; small + old = displaceable).

(function () {
  if (window.__ytgSearchOverlayLoaded__) return;
  window.__ytgSearchOverlayLoaded__ = true;

  const HEADER_ID = "ytg-search-bar";
  const PILL_CLASS = "ytg-result-pill";
  const PROCESSED_ATTR = "data-ytg-processed";

  function isSearchPage() {
    return location.pathname === "/results";
  }
  function getQuery() {
    return new URLSearchParams(location.search).get("search_query") || "";
  }

  // ── Parsers ─────────────────────────────────────────────────────────
  function parseAbbrevNumber(s) {
    if (!s) return 0;
    // "1,234 views" / "1.2K views" / "12M views"
    const m = String(s).match(/([\d.,]+)\s*([KMB]?)/i);
    if (!m) return 0;
    let n = parseFloat(m[1].replace(/,/g, ""));
    if (Number.isNaN(n)) return 0;
    const suf = (m[2] || "").toUpperCase();
    if (suf === "K") n *= 1_000;
    else if (suf === "M") n *= 1_000_000;
    else if (suf === "B") n *= 1_000_000_000;
    return Math.round(n);
  }

  // Convert "5 years ago", "2 weeks ago", "Streamed 1 day ago", etc into
  // an approximate day count. Returns -1 if we can't parse it (live now,
  // missing, etc) so callers can ignore it from recency math.
  function parseAgeText(s) {
    if (!s) return -1;
    const m = String(s).match(/(\d+)\s+(second|minute|hour|day|week|month|year)/i);
    if (!m) return -1;
    const n = parseInt(m[1], 10);
    const unit = m[2].toLowerCase();
    const factor = {
      second: 1 / 86400,
      minute: 1 / 1440,
      hour:   1 / 24,
      day:    1,
      week:   7,
      month:  30,
      year:   365,
    }[unit] || 0;
    return Math.max(0, Math.round(n * factor));
  }

  function fmtNum(n) {
    n = Number(n) || 0;
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 10_000)        return Math.round(n / 1_000) + "K";
    if (n >= 1_000)         return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return String(Math.round(n));
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function parseResultElement(el) {
    // ytd-video-renderer is the standard search result element. Some
    // results are channels or playlists which we skip.
    const titleEl = el.querySelector("a#video-title, #video-title-link, h3 a");
    const title   = titleEl ? (titleEl.getAttribute("title") || titleEl.textContent || "").trim() : "";
    const link    = titleEl?.href || "";

    const channelLink = el.querySelector("ytd-channel-name a, #channel-info a, .ytd-channel-name a");
    const channelName = channelLink?.textContent?.trim() || "";

    const metadataLine = el.querySelector("#metadata-line");
    const spans = metadataLine ? metadataLine.querySelectorAll("span") : [];
    const viewsText = spans[0]?.textContent?.trim() || "";
    const ageText   = spans[1]?.textContent?.trim() || "";

    return {
      el,
      title,
      link,
      channelName,
      viewCount: parseAbbrevNumber(viewsText),
      ageDays:   parseAgeText(ageText),
      ageText,
    };
  }

  function gatherResults() {
    // ytd-video-renderer is the standard, but YouTube also uses
    // ytd-rich-item-renderer (some shelves) and ytd-compact-video-renderer
    // (related). Cast a wide net so we don't silently produce zero results
    // when the layout changes.
    const nodes = document.querySelectorAll(
      "ytd-video-renderer, ytd-rich-item-renderer, ytd-compact-video-renderer"
    );
    const out = [];
    const seen = new Set();
    nodes.forEach((el) => {
      const r = parseResultElement(el);
      if (!r.title) return;
      if (r.link && seen.has(r.link)) return;
      if (r.link) seen.add(r.link);
      out.push(r);
    });
    return out;
  }

  // ── Heuristic ───────────────────────────────────────────────────────
  function computeCompetition(query, all) {
    const top = all.slice(0, 10);
    // Only need 1 result to show a useful header. Was 3, which silently
    // hid the overlay any time a search returned a small result set.
    if (top.length < 1) return null;

    const viewCounts = top.map(r => r.viewCount);
    const sumViews   = viewCounts.reduce((a, b) => a + b, 0);
    const avgViews   = sumViews / top.length;
    const sortedV    = [...viewCounts].sort((a, b) => a - b);
    const medianViews = sortedV[Math.floor(sortedV.length / 2)];

    const recent  = top.filter(r => r.ageDays >= 0 && r.ageDays <= 30).length;
    const veryOld = top.filter(r => r.ageDays > 730).length;

    const q = (query || "").toLowerCase().trim();
    const exactMatches = q
      ? top.filter(r => r.title.toLowerCase().includes(q)).length
      : 0;

    // Score 0-100 (higher = harder). Three weighted contributors.
    let score = 0;
    if (avgViews >= 5_000_000)       score += 40;
    else if (avgViews >= 1_000_000)  score += 32;
    else if (avgViews >= 200_000)    score += 22;
    else if (avgViews >= 50_000)     score += 12;
    else if (avgViews >= 10_000)     score += 6;

    if (recent >= 7)      score += 30;
    else if (recent >= 4) score += 20;
    else if (recent >= 2) score += 10;

    score += Math.min(30, exactMatches * 4);
    score = Math.max(0, Math.min(100, Math.round(score)));

    let bucket, label;
    if (score >= 70)      { bucket = "hard";   label = "High competition"; }
    else if (score >= 40) { bucket = "medium"; label = "Medium competition"; }
    else                  { bucket = "easy";   label = "Lower competition"; }

    // Pick the most useful single insight in priority order.
    let insight = "";
    if (q && exactMatches < 3) {
      insight = "Few top results target this exact phrase. Real gap to fill.";
    } else if (veryOld >= 6) {
      insight = "Most top results are 2+ years old. Fresh content has a real shot at the top.";
    } else if (recent >= 7) {
      insight = "7+ recent uploads in the top 10. This niche is trending right now.";
    } else if (avgViews < 50_000) {
      insight = "Top results don't pull big numbers. Smaller audience but easier entry.";
    } else if (avgViews > 5_000_000) {
      insight = "Top results pull millions of views. Large audience but very crowded.";
    } else if (medianViews > 1_000_000 && recent >= 3) {
      insight = "High-view recent uploads dominate. Compete on a sharper sub-angle.";
    }

    return {
      score, bucket, label, insight,
      avgViews, medianViews, recent, veryOld, exactMatches, total: top.length,
    };
  }

  // Per-result Opportunity Score: 0-100, higher = easier opportunity to
  // outrank. Combines age, view count, and view velocity. Numerical score
  // beats VidIQ's binary Hot/Soft scheme because creators can rank
  // results at a glance — green 80 is a much better target than green 65.
  function scoreResult(r) {
    let score = 50; // start at neutral
    const v = r.viewCount || 0;
    const a = r.ageDays;

    // Age: older results are more displaceable
    if (a < 0) {
      // unknown age — no adjustment
    } else if (a >= 1825)      score += 28; // 5+ years
    else if (a >= 1095)        score += 22; // 3+ years
    else if (a >= 730)         score += 14; // 2+ years
    else if (a >= 365)         score += 6;  // 1+ year
    else if (a <= 14)          score -= 18; // very fresh, in momentum window
    else if (a <= 60)          score -= 10;

    // Absolute view count: tiny = vulnerable, giant = anchored
    if (v >= 10_000_000)       score -= 35;
    else if (v >= 2_000_000)   score -= 24;
    else if (v >= 500_000)     score -= 12;
    else if (v >= 100_000)     score -= 4;
    else if (v < 5_000)        score += 22;
    else if (v < 25_000)       score += 14;
    else if (v < 75_000)       score += 6;

    // View velocity: high recent velocity = it's currently winning,
    // hard to displace. Low velocity = stagnant, easier target.
    if (a > 0) {
      const vpd = v / Math.max(1, a);
      if (vpd > 50_000)        score -= 16;
      else if (vpd > 10_000)   score -= 8;
      else if (vpd > 2_000)    score -= 3;
      else if (vpd < 50)       score += 8;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  function tierForScore(s) {
    if (s >= 70) return "good";
    if (s >= 45) return "medium";
    return "bad";
  }

  // ── Render ──────────────────────────────────────────────────────────
  // Inline SVG for the YTGrowth brand mark — matches the favicon and the
  // watch-panel logo so the search overlay clearly reads as our tool.
  const BRAND_SVG = `<svg viewBox="0 0 26 26" width="26" height="26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="26" height="26" rx="7" fill="#e5251b"/><path d="M18.5 10.2a1.6 1.6 0 0 0-1.12-1.12C16.4 8.8 13 8.8 13 8.8s-3.4 0-4.38.3A1.6 1.6 0 0 0 7.5 10.2 17 17 0 0 0 7.2 13a17 17 0 0 0 .3 2.8 1.6 1.6 0 0 0 1.12 1.12C9.6 17.2 13 17.2 13 17.2s3.4 0 4.38-.3a1.6 1.6 0 0 0 1.12-1.12A17 17 0 0 0 18.8 13a17 17 0 0 0-.3-2.8z" fill="white"/><polygon points="11.2,16 16,13 11.2,10" fill="#e5251b"/></svg>`;

  function buildHeaderBar(query, comp) {
    const bar = document.createElement("div");
    bar.id = HEADER_ID;
    bar.dataset.bucket = comp.bucket;
    const dark = document.documentElement.hasAttribute("dark");
    bar.dataset.theme = dark ? "dark" : "light";

    const hasInsight = !!comp.insight;
    bar.innerHTML = `
      <div class="ytg-sb-glow"></div>
      <div class="ytg-sb-stripe"></div>

      <div class="ytg-sb-head">
        <div class="ytg-sb-brand">
          ${BRAND_SVG}
          <div class="ytg-sb-brand-text">
            <span class="ytg-sb-brand-name">YTGrowth</span>
            <span class="ytg-sb-brand-tag">Search Insights</span>
          </div>
        </div>
        <div class="ytg-sb-bucket" data-bucket="${comp.bucket}">${comp.label}</div>
      </div>

      <div class="ytg-sb-body">
        <div class="ytg-sb-score-ring" data-target-score="${comp.score}" style="--score: 0">
          <div class="ytg-sb-score-inner">
            <span class="ytg-sb-score-num" data-target-num="${comp.score}">0</span>
            <span class="ytg-sb-score-of">/100</span>
          </div>
        </div>
        <div class="ytg-sb-content">
          <div class="ytg-sb-headline">${escapeHtml(query ? `"${query}"` : "This keyword")}</div>
          ${hasInsight ? `<div class="ytg-sb-insight">${escapeHtml(comp.insight)}</div>` : ``}
        </div>
      </div>

      <div class="ytg-sb-stats">
        <div class="ytg-sb-stat">
          <div class="ytg-sb-stat-label">Avg views</div>
          <div class="ytg-sb-stat-value">${fmtNum(comp.avgViews)}</div>
        </div>
        <div class="ytg-sb-stat">
          <div class="ytg-sb-stat-label">Recent uploads</div>
          <div class="ytg-sb-stat-value">${comp.recent}<span class="ytg-sb-stat-of">/${comp.total}</span></div>
          <div class="ytg-sb-stat-bar"><span style="width: ${Math.min(100, Math.round((comp.recent / comp.total) * 100))}%"></span></div>
        </div>
        <div class="ytg-sb-stat">
          <div class="ytg-sb-stat-label">Exact match</div>
          <div class="ytg-sb-stat-value">${comp.exactMatches}<span class="ytg-sb-stat-of">/${comp.total}</span></div>
          <div class="ytg-sb-stat-bar"><span style="width: ${Math.min(100, Math.round((comp.exactMatches / comp.total) * 100))}%"></span></div>
        </div>
      </div>
    `;
    return bar;
  }

  function injectHeaderBar(query, comp) {
    if (!comp) {
      removeHeaderBar();
      return;
    }

    // Inject as the FIRST child of the search-results primary column so
    // the bar sits clearly above the result list, not buried inside a
    // section that might be hidden or reordered by YouTube.
    const primary =
      document.querySelector("ytd-search ytd-two-column-search-results-renderer #primary") ||
      document.querySelector("ytd-two-column-search-results-renderer #primary") ||
      document.querySelector("ytd-search #primary") ||
      document.querySelector("ytd-search #container") ||
      document.querySelector("#primary.ytd-search");
    if (!primary) return;

    const existing = document.getElementById(HEADER_ID);
    const bar = buildHeaderBar(query, comp);
    if (existing) {
      existing.replaceWith(bar);
    } else {
      primary.insertBefore(bar, primary.firstChild);
    }

    // Kick off the gauge + score-number animations on the next frame.
    // The ring starts at --score: 0 and transitions to the target;
    // the number counts up in lockstep.
    requestAnimationFrame(() => {
      const ring = bar.querySelector(".ytg-sb-score-ring");
      if (ring) ring.style.setProperty("--score", String(Number(ring.dataset.targetScore) || 0));
      const num = bar.querySelector(".ytg-sb-score-num");
      if (num) animateCount(num, Number(num.dataset.targetNum) || 0, 1100);
    });
  }

  function animateCount(el, target, durationMs) {
    const start = performance.now();
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function tick(now) {
      const t = Math.min(1, (now - start) / durationMs);
      el.textContent = String(Math.round(target * ease(t)));
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    }
    requestAnimationFrame(tick);
  }

  function removeHeaderBar() {
    document.getElementById(HEADER_ID)?.remove();
  }

  function applyResultPill(r) {
    if (!r.el || r.el.getAttribute(PROCESSED_ATTR) === "1") return;
    r.el.setAttribute(PROCESSED_ATTR, "1");

    if (!r.viewCount && !r.ageText) return;

    const score = scoreResult(r);
    const tier  = tierForScore(score);
    const tierWord = tier === "good" ? "Open" : tier === "medium" ? "Mid" : "Anchored";
    const reason = score >= 70
      ? "Older or low-view: easier to outrank with strong content."
      : score >= 45
        ? "Mid-tier competition. Sharper angle could win."
        : "High view count and/or in momentum window: hard to outrank.";

    const badge = document.createElement("span");
    badge.className = PILL_CLASS;
    badge.dataset.tier = tier;
    badge.title = `Opportunity ${score}/100 — ${reason}`;
    badge.innerHTML = `
      <span class="ytg-rp-num">${score}</span>
      <span class="ytg-rp-sep"></span>
      <span class="ytg-rp-word">${tierWord}</span>
    `;

    const metadataLine = r.el.querySelector("#metadata-line");
    if (metadataLine) {
      metadataLine.appendChild(badge);
    } else {
      const titleArea = r.el.querySelector("#title-wrapper, #meta");
      titleArea?.appendChild(badge);
    }
  }

  function clearOverlay() {
    removeHeaderBar();
    document.querySelectorAll(`.${PILL_CLASS}`).forEach(el => el.remove());
    document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach(el => el.removeAttribute(PROCESSED_ATTR));
  }

  // ── Run ────────────────────────────────────────────────────────────
  let lastQuery = "";
  let runScheduled = false;
  let lastEmptyLog = null;

  function run() {
    runScheduled = false;
    if (!isSearchPage()) {
      clearOverlay();
      lastQuery = "";
      return;
    }
    const q = getQuery();
    const results = gatherResults();
    if (results.length === 0) {
      // Logged once per query so user can see the script ran but no
      // results were findable — points the finger at YouTube DOM changes.
      if (q !== lastEmptyLog) {
        console.info("[YTGrowth Search] running, no results detected yet", { query: q });
        lastEmptyLog = q;
      }
      return;
    }

    // Only recompute the header bar when the keyword changes or we
    // didn't have one yet. Otherwise just process newly-streamed results.
    if (q !== lastQuery) {
      const comp = computeCompetition(q, results);
      injectHeaderBar(q, comp);
      lastQuery = q;
    } else if (!document.getElementById(HEADER_ID)) {
      const comp = computeCompetition(q, results);
      injectHeaderBar(q, comp);
    }

    results.forEach(applyResultPill);
  }

  function scheduleRun() {
    if (runScheduled) return;
    runScheduled = true;
    // Coalesce bursts of mutations into one render pass.
    setTimeout(run, 80);
  }

  // Watch for new results streaming in (lazy load on scroll, filter
  // changes, etc).
  const observer = new MutationObserver(scheduleRun);
  function startObserver() {
    const container =
      document.querySelector("ytd-search") ||
      document.querySelector("ytd-page-manager") ||
      document.body;
    observer.observe(container, { childList: true, subtree: true });
  }

  // Boot + SPA navigation.
  function initIfSearch() {
    if (isSearchPage()) {
      lastQuery = ""; // force header recomputation on every nav
      scheduleRun();
    } else {
      clearOverlay();
      lastQuery = "";
    }
  }

  initIfSearch();
  startObserver();
  document.addEventListener("yt-navigate-finish", initIfSearch);

  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      initIfSearch();
    }
  }, 250);
})();
