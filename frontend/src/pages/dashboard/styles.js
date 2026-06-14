/* ─── Inject font + global styles once ──────────────────────────────────────
   Idempotent: only injects the <link> and <style> nodes on the first mount.
   The CSS template references SHELL (dark surface palette) so dark-mode
   overrides for the global .ytg-* classes stay in lockstep with the tokens. */
import { useEffect } from 'react'
import { SHELL } from './tokens'

export function useDashboardStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-dash-styles')) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
    document.head.appendChild(link)

    // Geist for the Overview/Feed page. Scoped to .ov-page so other
    // Dashboard sections (Overview-redesign-in-progress) keep Inter.
    const geist = document.createElement('link')
    geist.rel = 'stylesheet'
    geist.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap'
    document.head.appendChild(geist)

    const style = document.createElement('style')
    style.id = 'ytg-dash-styles'
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { background: #f5f5f9; color: #0f0f13; font-family: 'Geist', 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }

      @keyframes spin    { to { transform: rotate(360deg) } }
      @keyframes fadeUp  { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
      @keyframes pulse   { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }
      @keyframes ytgShimmer { 0% { background-position: -240px 0 } 100% { background-position: 240px 0 } }

      /* Loading skeleton placeholder. Mirrors the real card shapes so the
         Feed renders structure-first while data loads. */
      .ytg-skel {
        background:
          linear-gradient(
            90deg,
            rgba(15,15,19,0.045) 0%,
            rgba(15,15,19,0.085) 50%,
            rgba(15,15,19,0.045) 100%
          );
        background-size: 240px 100%;
        background-repeat: no-repeat;
        animation: ytgShimmer 1.2s ease-in-out infinite;
      }
      @keyframes confettiFall {
        0%   { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 1; }
        85%  { opacity: 1; }
        100% { transform: translate3d(var(--cx, 0), 110vh, 0) rotate(var(--cr, 540deg)); opacity: 0; }
      }
      @keyframes popIn {
        0%   { opacity: 0; transform: scale(0.86); }
        60%  { opacity: 1; transform: scale(1.02); }
        100% { opacity: 1; transform: scale(1); }
      }

      ::-webkit-scrollbar       { width: 12px; height: 12px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb {
        background-color: rgba(10,10,15,0.28);
        border-radius: 10px;
        border: 3px solid transparent;
        background-clip: content-box;
        min-height: 48px;
      }
      ::-webkit-scrollbar-thumb:hover { background-color: rgba(10,10,15,0.48); background-clip: content-box; }

      .ytg-stat-card {
        background: #ffffff;
        border: 1px solid #e6e6ec;
        border-radius: 16px;
        padding: 22px 24px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06);
        transition: box-shadow 0.2s, transform 0.2s;
        cursor: default;
      }
      .ytg-stat-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.09);
        transform: translateY(-2px);
      }
      .ytg-stat-card.alert {
        border-color: rgba(229,37,27,0.22);
        background: #fff8f8;
      }

      .ytg-card {
        background: #ffffff;
        border: 1px solid #e6e6ec;
        border-radius: 16px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06);
        transition: box-shadow 0.2s, transform 0.2s;
      }
      .ytg-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.09);
        transform: translateY(-1px);
      }

      .ytg-nav-btn {
        display: flex; align-items: center; gap: 10px;
        padding: 9px 13px; border-radius: 100px; cursor: pointer; text-align: left;
        font-size: 13.5px; font-family: 'Geist', 'Inter', system-ui, sans-serif;
        color: #4a4a58;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
        border: 1px solid transparent;
        box-shadow: none; outline: none; -webkit-appearance: none;
      }
      .ytg-nav-btn:hover:not(.active) {
        background: #f4f4f8; color: #0f0f13;
      }

      .ytg-video-row { transition: background 0.15s; }
      .ytg-video-row:hover { background: #f4f4f7 !important; }

      .ytg-insight-card {
        background: #ffffff;
        border: 1px solid #e6e6ec;
        border-radius: 14px;
        overflow: hidden;
        margin-bottom: 8px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06);
        transition: box-shadow 0.2s, transform 0.2s;
      }
      .ytg-insight-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.09);
        transform: translateY(-1px);
      }

      /* ── OVERVIEW (FEED), page-scoped redesign ──────────────────────────
         Migrates the Feed onto Geist + the Competitors design north-star
         (hairline borders, single soft shadow + inset highlight, 14px
         radius, 200ms cubic-bezier hover) without touching other pages
         that still use the global card classes. */
      .ov-page, .ov-page * {
        font-family: 'Geist', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-feature-settings: 'cv11', 'ss01', 'ss03';
      }
      .ytg-dark .ytg-card,
      .ytg-dark .ytg-stat-card,
      .ytg-dark .ytg-insight-card {
        background: ${SHELL.cardBg};
        border: 1px solid ${SHELL.hair};
        border-radius: 14px;
        box-shadow: ${SHELL.cardShadow};
        transition: box-shadow 0.2s cubic-bezier(0.2,0.7,0.3,1), transform 0.2s cubic-bezier(0.2,0.7,0.3,1), border-color 0.2s cubic-bezier(0.2,0.7,0.3,1);
      }
      .ytg-dark .ytg-card:hover,
      .ytg-dark .ytg-stat-card:hover,
      .ytg-dark .ytg-insight-card:hover {
        box-shadow: ${SHELL.cardShadowLift};
        transform: translateY(-1px);
        border-color: ${SHELL.hair};
      }
      .ytg-dark .ytg-stat-card.alert {
        border-color: rgba(229,37,27,0.32);
        background: rgba(229,37,27,0.10);
      }

      /* Hero tile (inline, no surrounding card). 4-up strip at top of Feed. */
      .ov-hero-tile {
        position: relative;
        padding: 16px 18px 18px;
        display: flex; flex-direction: column; gap: 10px;
        background: transparent;
      }
      .ov-hero-strip {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        border: 1px solid ${SHELL.hair};
        border-radius: 14px;
        background: ${SHELL.cardBg};
        box-shadow: ${SHELL.cardShadow};
        overflow: hidden;
        margin-bottom: 28px;
      }
      .ov-hero-strip > .ov-hero-tile + .ov-hero-tile {
        border-left: 1px solid ${SHELL.hair};
      }
      @media (max-width: 740px) {
        .ov-hero-strip { grid-template-columns: repeat(2, 1fr); }
        .ov-hero-strip > .ov-hero-tile:nth-child(3) { border-left: none; border-top: 1px solid ${SHELL.hair}; }
        .ov-hero-strip > .ov-hero-tile:nth-child(4) { border-top: 1px solid ${SHELL.hair}; }
      }

      .ov-section-head {
        display: flex; align-items: baseline; justify-content: space-between;
        gap: 12px; flex-wrap: wrap;
        margin: 36px 0 16px;
      }
      .ov-section-head h2 {
        font-size: 22px; font-weight: 600; color: ${SHELL.text1};
        letter-spacing: -0.5px; line-height: 1.2; margin: 0;
      }
      .ov-section-head .ov-section-meta {
        font-size: 12px; font-weight: 500; color: ${SHELL.text2};
        letter-spacing: -0.05px;
      }
      .ov-section-head + * { margin-top: 0 !important; }
      .ov-page .ov-stack > * + * { margin-top: 12px; }
      .ytg-inner-block {
        background: #f8f8fb;
        border: 1px solid #eeeef3;
        border-radius: 10px;
        padding: 10px 12px;
      }
      .ytg-insight-card.done {
        opacity: 0.48;
      }
      .ytg-qw-row {
        display: flex; gap: 9px; align-items: flex-start;
        padding: 9px 11px; border-radius: 10px;
        border: 1px solid transparent;
        transition: background 0.15s, border-color 0.15s;
      }
      .ytg-qw-row:hover {
        background: #f4f4f7; border-color: rgba(0,0,0,0.07);
      }
      .ytg-del-btn {
        width: 22px; height: 22px; border-radius: 6px;
        background: #fee2e2; border: 1px solid #fecaca;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; flex-shrink: 0; transition: background 0.15s;
      }
      .ytg-del-btn:hover { background: #fecaca; }

      .ytg-dash-btn {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 9px 20px; border-radius: 100px; border: 1px solid rgba(0,0,0,0.1);
        font-family: 'Geist', 'Inter', system-ui, sans-serif; font-size: 12.5px; font-weight: 600;
        background: #fff; color: #87878f; cursor: pointer;
        box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
        transition: all 0.18s;
      }
      .ytg-dash-btn:hover {
        border-color: rgba(0,0,0,0.18); color: #111114;
        box-shadow: 0 2px 8px rgba(0,0,0,0.10), 0 8px 28px rgba(0,0,0,0.10);
        transform: translateY(-1px);
      }
      .ytg-dash-btn-primary {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 9px 20px; border-radius: 100px; border: none;
        font-family: 'Geist', 'Inter', system-ui, sans-serif; font-size: 12.5px; font-weight: 600;
        background: #e5251b; color: #fff; cursor: pointer;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32);
        transition: all 0.18s;
      }
      .ytg-dash-btn-primary:hover {
        filter: brightness(1.07); transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,37,27,0.42);
      }
      .ytg-optimise-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 6px 14px; border-radius: 100px;
        border: none;
        font-family: 'Geist', 'Inter', system-ui, sans-serif; font-size: 11.5px; font-weight: 600;
        background: #e5251b;
        color: #fff; cursor: pointer; letter-spacing: 0.01em;
        transition: filter 0.15s;
      }
      .ytg-optimise-btn:hover {
        filter: brightness(1.1);
      }
      /* Videos card grid, 4 cols default (consistent with Video Review).
         Was 5 cols above 1500px which crammed the metrics; 4-up rhythm
         across all desktop widths reads cleaner. */
      .ytg-videos-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
      }
      @media (max-width: 900px) {
        .ytg-videos-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 560px) {
        .ytg-videos-grid { grid-template-columns: 1fr; }
      }
      /* Meta-chip in My Videos header, Lucide icon in tinted circle + label.
         Replaces the emoji header chips per the no-generic-icons rule. */
      .ytg-myvid-chip {
        display: inline-flex; align-items: center; gap: 7px;
        font-size: 12.5px; font-weight: 600; color: #4a4a58;
        background: #fff; border: 1px solid rgba(10,10,15,0.08);
        border-radius: 100px; padding: 4px 12px 4px 4px;
        box-shadow: 0 1px 2px rgba(15,15,25,0.04);
        letter-spacing: -0.01em;
      }
      .ytg-myvid-chip-icon {
        display: inline-flex; align-items: center; justify-content: center;
        width: 20px; height: 20px; border-radius: 99px;
        flex-shrink: 0;
      }
      /* Quiet sort group for My Videos, soft-grey active, no red glow. */
      .ytg-myvid-sort-grp {
        display: inline-flex; gap: 4px; padding: 4px;
        background: #eeeef3; border-radius: 100px;
      }
      .ytg-myvid-sort-btn {
        padding: 7px 14px; border-radius: 100px;
        font-family: inherit; font-size: 12.5px; font-weight: 500;
        background: transparent; color: rgba(10,10,15,0.55);
        border: 1px solid transparent;
        cursor: pointer; letter-spacing: -0.01em;
        transition: background 180ms cubic-bezier(0.32,0.72,0,1), color 180ms cubic-bezier(0.32,0.72,0,1);
      }
      .ytg-myvid-sort-btn:hover:not(.active) { background: rgba(10,10,15,0.03); color: #0a0a0f; }
      .ytg-myvid-sort-btn.active {
        background: #ffffff; color: #0a0a0f;
        border-color: rgba(10,10,15,0.10);
        box-shadow: 0 1px 2px rgba(15,15,25,0.04);
        font-weight: 600;
      }

      /* ── Feed (.ov-page) dark overrides for the shared global .ytg-*
         classes. Scoped to .ov-page so My Videos / other still-light
         pages that share these globals are untouched. Mirrors the
         shipped dark surface system (SHELL). ── */
      .ytg-dark .ytg-inner-block {
        background: ${SHELL.cardFlat};
        border: 1px solid ${SHELL.hair};
      }
      .ytg-dark .ytg-qw-row:hover {
        background: ${SHELL.hoverBg}; border-color: ${SHELL.hair};
      }
      .ytg-dark .ytg-del-btn {
        background: rgba(229,37,27,0.12); border: 1px solid rgba(229,37,27,0.30);
      }
      .ytg-dark .ytg-del-btn:hover { background: rgba(229,37,27,0.20); }
      .ytg-dark .ytg-dash-btn {
        background: ${SHELL.cardBg}; color: ${SHELL.text2};
        border: 1px solid ${SHELL.hair};
        box-shadow: ${SHELL.cardShadow};
      }
      .ytg-dark .ytg-dash-btn:hover {
        border-color: rgba(255,255,255,0.16); color: ${SHELL.text1};
        box-shadow: ${SHELL.cardShadowLift};
      }
      .ytg-dark .ytg-myvid-chip {
        color: ${SHELL.text2};
        background: ${SHELL.cardBg}; border: 1px solid ${SHELL.hair};
        box-shadow: ${SHELL.cardShadow};
      }
      .ytg-dark .ytg-myvid-sort-grp {
        background: ${SHELL.cardFlat};
      }
      .ytg-dark .ytg-myvid-sort-btn {
        color: ${SHELL.text2};
      }
      .ytg-dark .ytg-myvid-sort-btn:hover:not(.active) {
        background: ${SHELL.hoverBg}; color: ${SHELL.text1};
      }
      .ytg-dark .ytg-myvid-sort-btn.active {
        background: ${SHELL.activeBg}; color: ${SHELL.text1};
        border-color: ${SHELL.hair};
        box-shadow: none;
      }
    `
    document.head.appendChild(style)
  }, [])
}
