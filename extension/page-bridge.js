// YTGrowth page bridge. Runs in the page's MAIN world (declared in
// manifest.json) so we can read YouTube's own globals — ytInitialPlayerResponse
// has the structured video data the page itself renders from.
//
// Why MAIN world: content scripts run in an ISOLATED world by default, where
// `window` is a sandboxed copy and YouTube's globals are invisible. With
// world: "MAIN" we share JS context with the page, can read its variables,
// and forward what we need back to our isolated content script via
// window.postMessage.
//
// We also try to grab the visible like count from the like-button DOM
// because likes aren't in ytInitialPlayerResponse.

(function () {
  function parseCountFromAria(s) {
    if (!s) return 0;
    // Examples: "like this video along with 1,234 other people"
    //           "like this video along with 1.2K other people"
    //           "like this video along with 1.2M other people"
    const m = s.match(/([\d.,]+)\s*([KMB]?)/i);
    if (!m) return 0;
    let n = parseFloat(m[1].replace(/,/g, ""));
    if (Number.isNaN(n)) return 0;
    const suf = (m[2] || "").toUpperCase();
    if (suf === "K") n *= 1_000;
    else if (suf === "M") n *= 1_000_000;
    else if (suf === "B") n *= 1_000_000_000;
    return Math.round(n);
  }

  function getLikeCount() {
    // Selectors evolve. Try in priority order.
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
      if (aria) {
        const n = parseCountFromAria(aria);
        if (n > 0) return n;
      }
    }
    return 0;
  }

  function extractHashtags(text) {
    if (!text) return [];
    const out = [];
    const seen = new Set();
    const re = /(?:^|\s)#([\p{L}\p{N}_]{2,})/gu;
    let m;
    while ((m = re.exec(text)) !== null) {
      const tag = m[1].toLowerCase();
      if (!seen.has(tag)) { seen.add(tag); out.push(m[1]); }
    }
    return out;
  }

  function mergeTags(keywords, description) {
    const seen = new Set();
    const out = [];
    const all = [
      ...(Array.isArray(keywords) ? keywords : []),
      ...extractHashtags(description),
    ];
    for (const t of all) {
      const key = (t || "").toLowerCase();
      if (key && !seen.has(key)) { seen.add(key); out.push(t); }
    }
    return out;
  }

  function send() {
    try {
      const pr = window.ytInitialPlayerResponse;
      if (!pr || !pr.videoDetails) return;
      const vd = pr.videoDetails || {};
      const mf = ((pr.microformat || {}).playerMicroformatRenderer) || {};
      const description = vd.shortDescription || mf.description?.simpleText || "";
      const data = {
        videoId:      vd.videoId || "",
        title:        vd.title || mf.title?.simpleText || "",
        description,
        channelTitle: vd.author || mf.ownerChannelName || "",
        channelId:    vd.channelId || mf.externalChannelId || "",
        viewCount:    parseInt(vd.viewCount || mf.viewCount || "0", 10),
        likeCount:    getLikeCount(),
        lengthSec:    parseInt(vd.lengthSeconds || mf.lengthSeconds || "0", 10),
        isLive:       !!vd.isLiveContent,
        publishDate:  mf.publishDate || mf.uploadDate || "",
        category:     mf.category || "",
        // Tags = upload-time keywords (often hidden via Data API but present
        // in the page JSON) merged with description #hashtags. Modern creators
        // rely heavily on hashtags, so we want both.
        tags:         mergeTags(vd.keywords, description),
      };
      window.postMessage({ source: "ytg-bridge", data }, "*");
    } catch (e) {
      // Swallow — content.js will fall back to a sign-in or backend call.
    }
  }

  // Initial send + a delayed retry to catch the like count once the like
  // button has rendered (it's lazy on slower connections).
  send();
  setTimeout(send, 1200);

  // SPA navigations: ytInitialPlayerResponse is replaced on every video.
  document.addEventListener("yt-navigate-finish", () => {
    setTimeout(send, 200);
    setTimeout(send, 1500);
  });
})();
