/* ─── Inject font + global styles once ──────────────────────────────────────
   Idempotent: only injects the <link> and <style> nodes on the first mount.
   The CSS template references SHELL (dark surface palette) so dark-mode
   overrides for the global .ytg-* classes stay in lockstep with the tokens. */
import { useEffect } from 'react'
import { SHELL } from './tokens'

export function useDashboardStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-dash-styles')) return

    // Editorial (Zennara) type system: Cormorant Garamond (display + big
    // numbers), Barlow Condensed (labels / nav / buttons), Barlow (body).
    // Replaces the old Inter + Geist stack app-wide. Dev loads via Google
    // Fonts @import; self-host before shipping (same rule as the marketing
    // site fonts).
    const pre1 = document.createElement('link'); pre1.rel = 'preconnect'; pre1.href = 'https://fonts.googleapis.com'
    const pre2 = document.createElement('link'); pre2.rel = 'preconnect'; pre2.href = 'https://fonts.gstatic.com'; pre2.crossOrigin = 'anonymous'
    document.head.appendChild(pre1); document.head.appendChild(pre2)

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@300;400;500;600;700&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytg-dash-styles'
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      /* ── Theme variables ────────────────────────────────────────────────
         Light is the default; dark ships behind a toggle (set
         data-theme="dark" on <html>). Every dashboard colour flows through
         these so the toggle is one attribute flip, not a second codebase.
         Editorial (Zennara): warm paper, gold accent, green for positive. */
      :root {
        --yd-paper:#faf8f4; --yd-paper2:#f1efe9; --yd-surface:#ffffff;
        --yd-ink:#14130f; --yd-soft:#4a4843; --yd-muted:#6b6862;
        --yd-line:rgba(20,19,15,0.12); --yd-line-lo:rgba(20,19,15,0.07);
        --yd-wash:rgba(20,19,15,0.035); --yd-wash2:rgba(20,19,15,0.06);
        --yd-gold:#c9a030; --yd-gold-ink:#7a5b14;
        --yd-gold-soft:rgba(201,160,48,0.10); --yd-gold-line:rgba(201,160,48,0.30);
        --yd-on-gold:#1a1710;
        --yd-green:#2d7a4f; --yd-green-ink:#1d5235;
        --yd-green-soft:rgba(45,122,79,0.12); --yd-green-line:rgba(45,122,79,0.28);
        --yd-amber:#b07d1a; --yd-amber-soft:rgba(176,125,26,0.10); --yd-amber-line:rgba(176,125,26,0.24);
        --yd-danger:#c0392b; --yd-danger-soft:rgba(192,57,43,0.08); --yd-danger-line:rgba(192,57,43,0.24);
        --yd-on-accent:#ffffff;
      }
      html[data-theme="dark"] {
        --yd-paper:#080808; --yd-paper2:#141414; --yd-surface:#181818;
        --yd-ink:#ffffff; --yd-soft:#bbbbbb; --yd-muted:#888888;
        --yd-line:rgba(255,255,255,0.10); --yd-line-lo:rgba(255,255,255,0.06);
        --yd-wash:rgba(255,255,255,0.04); --yd-wash2:rgba(255,255,255,0.07);
        --yd-gold:#c9a030; --yd-gold-ink:#e2b84a;
        --yd-gold-soft:rgba(201,160,48,0.12); --yd-gold-line:rgba(201,160,48,0.34);
        --yd-on-gold:#141007;
        --yd-green:#3baa6a; --yd-green-ink:#7fca9c;
        --yd-green-soft:rgba(59,170,106,0.14); --yd-green-line:rgba(59,170,106,0.30);
        --yd-amber:#d0a03a; --yd-amber-soft:rgba(208,160,58,0.12); --yd-amber-line:rgba(208,160,58,0.28);
        --yd-danger:#e0574d; --yd-danger-soft:rgba(224,87,77,0.12); --yd-danger-line:rgba(224,87,77,0.28);
        --yd-on-accent:#ffffff;
      }

      html, body { background: var(--yd-paper); color: var(--yd-ink); font-family: 'Barlow', system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }

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

      /* Editorial cards: sharp (no radius), flat (no soft shadow), hairline
         border. Themed via vars so light/dark both work. */
      .ytg-stat-card {
        background: var(--yd-surface);
        border: 1px solid var(--yd-line);
        border-radius: 0;
        padding: 22px 24px;
        box-shadow: none;
        transition: border-color 0.2s;
        cursor: default;
      }
      .ytg-stat-card:hover {
        border-color: var(--yd-gold-line);
      }
      .ytg-stat-card.alert {
        border-color: var(--yd-danger-line);
        background: var(--yd-danger-soft);
      }

      .ytg-card {
        background: var(--yd-surface);
        border: 1px solid var(--yd-line);
        border-radius: 0;
        box-shadow: none;
        transition: border-color 0.2s;
      }
      .ytg-card:hover {
        border-color: var(--yd-gold-line);
      }

      .ytg-nav-btn {
        display: flex; align-items: center; gap: 10px;
        padding: 9px 13px; border-radius: 0; cursor: pointer; text-align: left;
        font-size: 13px; font-family: 'Barlow', system-ui, sans-serif; font-weight: 500;
        letter-spacing: 0.01em;
        color: var(--yd-soft);
        transition: background 0.15s, color 0.15s, border-color 0.15s;
        border: 1px solid transparent;
        box-shadow: none; outline: none; -webkit-appearance: none;
      }
      .ytg-nav-btn:hover:not(.active) {
        background: var(--yd-wash); color: var(--yd-ink);
      }

      .ytg-video-row { transition: background 0.15s; }
      .ytg-video-row:hover { background: var(--yd-wash) !important; }

      .ytg-insight-card {
        background: var(--yd-surface);
        border: 1px solid var(--yd-line);
        border-radius: 0;
        overflow: hidden;
        margin-bottom: 8px;
        box-shadow: none;
        transition: border-color 0.2s;
      }
      .ytg-insight-card:hover {
        border-color: var(--yd-gold-line);
      }

      /* ── OVERVIEW (FEED) ────────────────────────────────────────────────
         Editorial: Barlow body, sharp flat hairline cards, warm paper. */
      .ov-page, .ov-page * {
        font-family: 'Barlow', system-ui, -apple-system, sans-serif;
      }
      .ytg-dark .ytg-card,
      .ytg-dark .ytg-stat-card,
      .ytg-dark .ytg-insight-card {
        background: var(--yd-surface);
        border: 1px solid var(--yd-line);
        border-radius: 0;
        box-shadow: none;
        transition: border-color 0.2s;
      }
      .ytg-dark .ytg-card:hover,
      .ytg-dark .ytg-stat-card:hover,
      .ytg-dark .ytg-insight-card:hover {
        box-shadow: none;
        transform: none;
        border-color: var(--yd-gold-line);
      }
      .ytg-dark .ytg-stat-card.alert {
        border-color: var(--yd-danger-line);
        background: var(--yd-danger-soft);
      }

      /* Hero tile (inline, no surrounding card). 4-up strip at top of Feed. */
      .ov-hero-tile {
        position: relative;
        padding: 18px 20px 20px;
        display: flex; flex-direction: column; gap: 10px;
        background: transparent;
      }
      .ov-hero-strip {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        border: 1px solid var(--yd-line);
        border-radius: 0;
        background: var(--yd-surface);
        box-shadow: none;
        overflow: hidden;
        margin-bottom: 28px;
      }
      .ov-hero-strip > .ov-hero-tile + .ov-hero-tile {
        border-left: 1px solid var(--yd-line);
      }
      @media (max-width: 740px) {
        .ov-hero-strip { grid-template-columns: repeat(2, 1fr); }
        .ov-hero-strip > .ov-hero-tile:nth-child(3) { border-left: none; border-top: 1px solid var(--yd-line); }
        .ov-hero-strip > .ov-hero-tile:nth-child(4) { border-top: 1px solid var(--yd-line); }
      }

      .ov-section-head {
        display: flex; align-items: baseline; justify-content: space-between;
        gap: 12px; flex-wrap: wrap;
        margin: 40px 0 16px;
      }
      .ov-section-head h2 {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 30px; font-weight: 500; color: var(--yd-ink);
        letter-spacing: 0; line-height: 1.15; margin: 0;
      }
      .ov-section-head .ov-section-meta {
        font-size: 12.5px; font-weight: 500; color: var(--yd-muted);
        letter-spacing: 0;
      }
      .ov-section-head + * { margin-top: 0 !important; }
      .ov-page .ov-stack > * + * { margin-top: 12px; }
      .ytg-inner-block {
        background: var(--yd-wash);
        border: 1px solid var(--yd-line);
        border-radius: 0;
        padding: 10px 12px;
      }
      .ytg-insight-card.done {
        opacity: 0.48;
      }
      .ytg-qw-row {
        display: flex; gap: 9px; align-items: flex-start;
        padding: 9px 11px; border-radius: 0;
        border: 1px solid transparent;
        transition: background 0.15s, border-color 0.15s;
      }
      .ytg-qw-row:hover {
        background: var(--yd-wash); border-color: var(--yd-line);
      }
      .ytg-del-btn {
        width: 22px; height: 22px; border-radius: 0;
        background: var(--yd-danger-soft); border: 1px solid var(--yd-danger-line);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; flex-shrink: 0; transition: background 0.15s;
      }
      .ytg-del-btn:hover { background: var(--yd-danger-line); }

      /* Secondary / ghost button: sharp, hairline, Barlow Condensed. */
      .ytg-dash-btn {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 10px 20px; border-radius: 0; border: 1px solid var(--yd-line);
        font-family: 'Barlow Condensed', system-ui, sans-serif; font-size: 14px; font-weight: 600;
        text-transform: uppercase; letter-spacing: 0.08em;
        background: var(--yd-surface); color: var(--yd-soft); cursor: pointer;
        box-shadow: none;
        transition: border-color 0.18s, color 0.18s;
      }
      .ytg-dash-btn:hover {
        border-color: var(--yd-ink); color: var(--yd-ink);
      }
      /* Primary CTA: gold fill + ink text (Zennara btn-g), sharp, uppercase. */
      .ytg-dash-btn-primary {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 10px 22px; border-radius: 0; border: none;
        font-family: 'Barlow Condensed', system-ui, sans-serif; font-size: 14px; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.1em;
        background: var(--yd-gold); color: var(--yd-on-gold); cursor: pointer;
        box-shadow: none;
        transition: filter 0.18s, transform 0.18s;
      }
      .ytg-dash-btn-primary:hover {
        filter: brightness(1.06); transform: translateY(-1px);
      }
      .ytg-optimise-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 7px 15px; border-radius: 0;
        border: none;
        font-family: 'Barlow Condensed', system-ui, sans-serif; font-size: 13px; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.08em;
        background: var(--yd-gold);
        color: var(--yd-on-gold); cursor: pointer;
        transition: filter 0.15s;
      }
      .ytg-optimise-btn:hover {
        filter: brightness(1.06);
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
        font-size: 12.5px; font-weight: 600; color: var(--yd-soft);
        background: var(--yd-surface); border: 1px solid var(--yd-line);
        border-radius: 0; padding: 4px 12px 4px 4px;
        box-shadow: none;
        letter-spacing: 0;
      }
      .ytg-myvid-chip-icon {
        display: inline-flex; align-items: center; justify-content: center;
        width: 20px; height: 20px; border-radius: 0;
        flex-shrink: 0;
      }
      /* Quiet sort group for My Videos, soft active, no gold glow. */
      .ytg-myvid-sort-grp {
        display: inline-flex; gap: 4px; padding: 4px;
        background: var(--yd-wash2); border-radius: 0;
      }
      .ytg-myvid-sort-btn {
        padding: 7px 14px; border-radius: 0;
        font-family: inherit; font-size: 12.5px; font-weight: 500;
        background: transparent; color: var(--yd-muted);
        border: 1px solid transparent;
        cursor: pointer; letter-spacing: 0;
        transition: background 180ms cubic-bezier(0.32,0.72,0,1), color 180ms cubic-bezier(0.32,0.72,0,1);
      }
      .ytg-myvid-sort-btn:hover:not(.active) { background: var(--yd-wash); color: var(--yd-ink); }
      .ytg-myvid-sort-btn.active {
        background: var(--yd-surface); color: var(--yd-ink);
        border-color: var(--yd-line);
        box-shadow: none;
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
        background: var(--yd-danger-soft); border: 1px solid var(--yd-danger-line);
      }
      .ytg-dark .ytg-del-btn:hover { background: var(--yd-danger-line); }
      .ytg-dark .ytg-dash-btn {
        background: ${SHELL.cardBg}; color: ${SHELL.text2};
        border: 1px solid ${SHELL.hair};
        box-shadow: ${SHELL.cardShadow};
      }
      .ytg-dark .ytg-dash-btn:hover {
        border-color: var(--yd-ink); color: ${SHELL.text1};
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
