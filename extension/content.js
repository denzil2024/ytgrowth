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

  // Inline SVGs.
  const ICON_LOGO = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.76C18.27 5 12 5 12 5s-6.27 0-7.84.44A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.76C5.73 19 12 19 12 19s6.27 0 7.84-.44a2.5 2.5 0 0 0 1.76-1.76A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.02V8.98L15.5 12 10 15.02Z"/></svg>`;
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
    return { score, summary };
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

  // Render with whatever we know so far. tagCount can be null (still
  // loading) or a number; tags array can be null (still loading), an
  // empty array (none), or populated.
  function renderPanel(pageData, tagState) {
    let root = document.getElementById(PANEL_ID);
    if (!root) root = buildShell();
    if (!root) return;

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
    const { score, summary } = seoScore({
      title: pageData.title,
      description: pageData.description,
      tagCount: tcForScore,
      engagementPct: engPct,
    });

    const [revLow, revHigh] = estRevenue(views, pageData.category);

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
    body.innerHTML = `
      <div class="ytg-hero">
        <div class="ytg-score-ring" style="--score: ${score}">
          <div class="ytg-score-inner">
            <span class="ytg-score-num">${score}</span>
            <span class="ytg-score-cap">SEO</span>
          </div>
        </div>
        <div class="ytg-hero-meta">
          <div class="ytg-hero-title">${escapeHtml(summary)}</div>
          <div class="ytg-hero-sub">${tagsLabel} &middot; ${escapeHtml(fmtAge(pageData.publishDate))}</div>
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
          <span class="ytg-row-k">Total views</span>
          <span class="ytg-row-v">${fmtNum(views)}</span>
        </div>
        <div class="ytg-row">
          <span class="ytg-row-k">Est. revenue</span>
          <span class="ytg-row-v">${fmtMoney(revLow)}–${fmtMoney(revHigh)}</span>
        </div>
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

  // ── SPA + boot ──────────────────────────────────────────────────────
  function initIfWatch() {
    if (isWatchPage()) {
      const vid = getVideoId();
      if (vid !== currentVideoId) {
        currentVideoId = vid;
        lastPageData   = null;
        renderInitialLoading();
        // page-bridge.js fires its own send() shortly. If it doesn't
        // arrive within 3s, the panel stays in skeleton state — better
        // than rendering with nothing.
      }
    } else {
      currentVideoId = null;
      lastPageData   = null;
      removePanel();
    }
  }

  initIfWatch();
  document.addEventListener("yt-navigate-finish", initIfWatch);

  const themeObserver = new MutationObserver(() => {
    const root = document.getElementById(PANEL_ID);
    if (root) root.dataset.theme = isYTDark() ? "dark" : "light";
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["dark"] });

  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      initIfWatch();
    }
  }, 800);
})();
