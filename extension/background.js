// YTGrowth extension background service worker (Manifest V3).
// Centralizes all fetches to ytgrowth.io. Reasons we go through here:
//   1) Service worker fetches are not subject to youtube.com's CORS;
//      Chrome treats them as extension-context requests for hosts in
//      host_permissions, so cookies and credentials Just Work.
//   2) If credentials:'include' fails to attach the SameSite=Lax session
//      cookie (depends on browser version), we fall back to reading the
//      cookie via chrome.cookies and forwarding it as a header.
//   3) Single place to swap base URL between prod and a future dev mode.

const API_BASE = "https://ytgrowth.io";
const SESSION_COOKIE = "ytg_session";

async function getSessionCookieHeader() {
  // Read ytg_session from the user's logged-in ytgrowth.io session and
  // return a Cookie header value, or null if not signed in.
  try {
    const cookie = await chrome.cookies.get({
      url: API_BASE,
      name: SESSION_COOKIE,
    });
    if (!cookie || !cookie.value) return null;
    return `${SESSION_COOKIE}=${cookie.value}`;
  } catch (e) {
    return null;
  }
}

async function apiFetch(path) {
  const url = `${API_BASE}${path}`;
  const headers = { "Accept": "application/json" };
  const cookieHeader = await getSessionCookieHeader();
  if (cookieHeader) headers["Cookie"] = cookieHeader;

  let resp;
  try {
    resp = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });
  } catch (e) {
    return { ok: false, status: 0, error: "network_error" };
  }

  let body = null;
  try {
    body = await resp.json();
  } catch {
    body = null;
  }

  return { ok: resp.ok, status: resp.status, body };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || !msg.type) return false;

  if (msg.type === "ytg:ping") {
    apiFetch("/api/extension/ping").then(sendResponse);
    return true; // keep sendResponse alive for the async reply
  }

  if (msg.type === "ytg:video" && msg.videoId) {
    apiFetch(`/api/extension/video/${encodeURIComponent(msg.videoId)}`).then(sendResponse);
    return true;
  }

  return false;
});
