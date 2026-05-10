// YTGrowth content script. Runs on every youtube.com page.
// v0.0.3: live data via background service worker.

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
    const ms  = Date.now() - new Date(publishedISO).getTime();
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

  // Build the bare panel shell. `state` is one of: 'loading' | 'ok' |
  // 'auth' | 'error'. Body content is filled in later via render*().
  function buildShell(state) {
    removePanel();
    if (!isWatchPage()) return null;

    const dark = isYTDark();
    const root = document.createElement("div");
    root.id = PANEL_ID;
    root.dataset.theme = dark ? "dark" : "light";
    root.dataset.state = state;
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
    root.querySelector(".ytg-refresh")?.addEventListener("click", () => loadVideo({ force: true }));

    return root;
  }

  function renderLoading(root) {
    root.dataset.state = "loading";
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

  function renderAuthGate(root) {
    root.dataset.state = "auth";
    const body = root.querySelector(".ytg-body");
    body.innerHTML = `
      <div class="ytg-empty">
        <div class="ytg-empty-title">Sign in to see live insights</div>
        <div class="ytg-empty-sub">Get tags, SEO score, view velocity, and revenue estimate on every video.</div>
        <a class="ytg-cta" href="${LOGIN_URL}" target="_blank" rel="noopener noreferrer">
          <span>Sign in to YTGrowth</span>${ICON_ARROW}
        </a>
      </div>
    `;
  }

  function renderError(root, msg) {
    root.dataset.state = "error";
    const body = root.querySelector(".ytg-body");
    body.innerHTML = `
      <div class="ytg-empty">
        <div class="ytg-empty-title">Couldn't load insights</div>
        <div class="ytg-empty-sub">${msg || "Try refreshing in a moment."}</div>
        <button class="ytg-cta ytg-cta-ghost" id="ytg-retry"><span>Retry</span>${ICON_ARROW}</button>
      </div>
    `;
    body.querySelector("#ytg-retry")?.addEventListener("click", () => loadVideo({ force: true }));
  }

  function renderVideo(root, video) {
    root.dataset.state = "ok";

    const score        = Math.max(0, Math.min(100, Number(video.seo_score) || 0));
    const summary      = video.seo_summary || "";
    const tags         = Array.isArray(video.tags) ? video.tags : [];
    const tagCount     = tags.length;
    const vph          = Number(video.views_per_hour) || 0;
    const eng          = Number(video.engagement_pct) || 0;
    const views        = Number(video.view_count) || 0;
    const revLow       = Number(video.est_revenue_low)  || 0;
    const revHigh      = Number(video.est_revenue_high) || 0;
    const age          = fmtAge(video.published_at);

    const tagsHtml = tagCount > 0
      ? tags.slice(0, 30).map(t => `<span class="ytg-tag">${escapeHtml(t)}</span>`).join("")
      : `<span class="ytg-tag-empty">This video has no tags</span>`;

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
          <div class="ytg-hero-sub">${tagCount} tag${tagCount === 1 ? "" : "s"} &middot; ${age}</div>
        </div>
      </div>

      <div class="ytg-rows">
        <div class="ytg-row">
          <span class="ytg-row-k">Views per hour</span>
          <span class="ytg-row-v">${fmtNum(vph)}</span>
        </div>
        <div class="ytg-row">
          <span class="ytg-row-k">Engagement</span>
          <span class="ytg-row-v">${eng.toFixed(2)}%</span>
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
          ${tagCount > 0 ? `<button class="ytg-copy-tags" type="button" title="Copy all tags">${ICON_COPY}<span>Copy all</span></button>` : ``}
        </div>
        <div class="ytg-tags">${tagsHtml}</div>
      </div>

      <a class="ytg-cta" href="${DASHBOARD_URL}" target="_blank" rel="noopener noreferrer">
        <span>Open full dashboard</span>${ICON_ARROW}
      </a>
    `;

    body.querySelector(".ytg-copy-tags")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(tags.join(", "));
        const btn = body.querySelector(".ytg-copy-tags span");
        if (btn) {
          const old = btn.textContent;
          btn.textContent = "Copied";
          setTimeout(() => { btn.textContent = old; }, 1500);
        }
      } catch (_) {}
    });
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ── Data flow ───────────────────────────────────────────────────────
  let currentVideoId = null;
  let inflight       = false;

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

  async function loadVideo({ force = false } = {}) {
    if (!isWatchPage()) {
      removePanel();
      return;
    }
    const vid = getVideoId();
    if (!vid) return;
    if (!force && vid === currentVideoId) return;
    currentVideoId = vid;

    let root = document.getElementById(PANEL_ID);
    if (!root) root = buildShell("loading");
    if (!root) return;
    renderLoading(root);

    if (inflight && !force) return;
    inflight = true;
    const resp = await sendMessage({ type: "ytg:video", videoId: vid });
    inflight = false;

    // The user might have navigated to a different video while we were
    // waiting; only render if our response still matches the current vid.
    if (currentVideoId !== vid) return;
    root = document.getElementById(PANEL_ID);
    if (!root) return;

    if (resp.status === 401) {
      renderAuthGate(root);
      return;
    }
    const body = resp.body || {};
    if (body.ok && body.video) {
      renderVideo(root, body.video);
      return;
    }
    const errMap = {
      "quota_exceeded":    "Daily YouTube data limit reached. Try again in a few hours.",
      "video_not_found":   "Video not found.",
      "youtube_api_error": "YouTube API hiccup. Try again.",
      "invalid_video_id":  "Invalid video.",
      "server_misconfig":  "Server misconfigured. We're on it.",
      "network_error":     "Network issue. Check your connection.",
      "extension_error":   "Extension messaging failed.",
    };
    const code = body.error_code || resp.error || "";
    renderError(root, errMap[code] || "Unexpected error.");
  }

  // ── Init + SPA navigation ────────────────────────────────────────────
  function initIfWatch() {
    if (isWatchPage()) {
      currentVideoId = null;
      loadVideo();
    } else {
      currentVideoId = null;
      removePanel();
    }
  }

  initIfWatch();
  document.addEventListener("yt-navigate-finish", initIfWatch);

  // Theme attribute observer.
  const themeObserver = new MutationObserver(() => {
    const root = document.getElementById(PANEL_ID);
    if (root) root.dataset.theme = isYTDark() ? "dark" : "light";
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["dark"] });

  // Fallback href watcher in case yt-navigate-finish doesn't fire.
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      initIfWatch();
    }
  }, 800);
})();
