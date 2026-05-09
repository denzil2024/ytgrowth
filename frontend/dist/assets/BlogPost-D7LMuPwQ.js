import{n as e}from"./chunk-B3K2TuZy.js";import{n as t,t as n}from"./jsx-runtime-BQXCR5OR.js";import{i as r,n as i,r as a}from"./index-BbFyPx5n.js";import{t as o}from"./LandingFooter-BQYd7g-y.js";import{t as s}from"./SiteHeader-BoONovKa.js";import{n as c,r as l,t as u}from"./posts-DOyPpF4d.js";var d=e(t(),1),f=n();function p(){let[e,t]=(0,d.useState)(typeof window<`u`?window.innerWidth:1280);return(0,d.useEffect)(()=>{let e=()=>t(window.innerWidth);return window.addEventListener(`resize`,e),()=>window.removeEventListener(`resize`,e)},[]),{isMobile:e<=768,isTablet:e<=1024}}function m(){(0,d.useEffect)(()=>{if(document.getElementById(`bp-styles`))return;let e=document.createElement(`link`);e.id=`bp-font`,e.rel=`stylesheet`,e.href=`https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap`,document.head.appendChild(e);let t=document.createElement(`style`);t.id=`bp-styles`,t.textContent=`
      :root {
        --ytg-bg:           #f4f4f6;
        --ytg-bg-2:         #ecedf1;
        --ytg-bg-3:         #e6e7ec;
        --ytg-text:         #0a0a0f;
        --ytg-text-2:       rgba(10,10,15,0.62);
        --ytg-text-3:       rgba(10,10,15,0.40);
        --ytg-nav:          rgba(244,244,246,0.92);
        --ytg-card:         #ffffff;
        --ytg-border:       rgba(10,10,15,0.09);
        --ytg-accent:       #e5302a;
        --ytg-accent-text:  #c22b25;
        --ytg-accent-light: rgba(229,48,42,0.07);
        --ytg-shadow-sm:    0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
        --ytg-shadow:       0 2px 6px rgba(0,0,0,0.08), 0 10px 32px rgba(0,0,0,0.11);
        --ytg-shadow-lg:    0 4px 16px rgba(0,0,0,0.11), 0 24px 60px rgba(0,0,0,0.14);
        --ytg-shadow-xl:    0 8px 28px rgba(0,0,0,0.13), 0 40px 100px rgba(0,0,0,0.17);
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; scrollbar-width: auto; scrollbar-color: rgba(10,10,15,0.28) transparent; }
      ::-webkit-scrollbar { width: 12px; height: 12px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb {
        background-color: rgba(10,10,15,0.28);
        border-radius: 10px;
        border: 3px solid transparent;
        background-clip: content-box;
      }
      ::-webkit-scrollbar-thumb:hover { background-color: rgba(10,10,15,0.48); background-clip: content-box; }
      @keyframes fadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .bp-btn {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; padding: 15px 30px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.14), 0 4px 20px rgba(229,48,42,0.34);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
        font-family: 'Inter', system-ui, sans-serif;
      }
      .bp-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,0.16), 0 12px 36px rgba(229,48,42,0.42); }
      .bp-btn-lg { font-size: 16px; padding: 17px 38px; }

      .bp-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        background: #fff;
        border: 1px solid rgba(10,10,15,0.09);
        border-radius: 100px;
        padding: 5px 12px 5px 10px;
        margin-bottom: 22px;
        box-shadow: 0 1px 2px rgba(10,10,15,0.04);
      }
      .bp-eyebrow-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--ytg-accent);
        box-shadow: 0 0 0 3px rgba(229,48,42,0.12);
      }
      .bp-eyebrow-text {
        font-size: 11px; font-weight: 700; color: var(--ytg-text-2);
        text-transform: uppercase; letter-spacing: 0.09em;
      }

      /* Category pill — used at the top of single posts. Distinct from
         the generic eyebrow: solid red, more presence, links to /blog. */
      .bp-category {
        display: inline-block;
        padding: 8px 18px;
        background: var(--ytg-accent);
        color: #fff;
        font-size: 11.5px;
        font-weight: 800;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        border-radius: 100px;
        text-decoration: none;
        margin-bottom: 28px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.10), 0 4px 16px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .bp-category:hover {
        filter: brightness(1.07);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.12), 0 8px 24px rgba(229,48,42,0.40);
      }

      .bp-h1 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -2px; line-height: 1.05; text-wrap: balance; }
      .bp-h2 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -1.4px; line-height: 1.08; text-wrap: balance; }

      .bp-nav-link { font-size: 14px; color: var(--ytg-text-3); font-weight: 500; text-decoration: none; transition: color 0.15s; letter-spacing: -0.1px; }
      .bp-nav-link:hover { color: var(--ytg-text-2); }

      /* Byline — clean two-line stacked treatment. Big author name on
         top in DM Sans, smaller meta line below in muted gray. No labels,
         no dividers, no avatar — just the credit, the way Stripe or
         Linear do it. */
      .bp-byline {
        text-align: center;
        position: relative;
      }
      .bp-byline-rule {
        width: 32px;
        height: 2px;
        background: var(--ytg-accent);
        border-radius: 2px;
        margin: 0 auto 18px;
      }
      .bp-byline-author {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 17px;
        font-weight: 700;
        color: var(--ytg-text);
        letter-spacing: -0.3px;
        margin: 0;
        line-height: 1.3;
      }
      .bp-byline-meta {
        font-size: 13.5px;
        color: var(--ytg-text-3);
        margin: 6px 0 0;
        letter-spacing: -0.05px;
        line-height: 1.4;
      }

      /* HERO IMAGE — 16:9 (matches YouTube thumbnail ratio).
         Recommended source size: 1600x900 (or 1200x675 lighter). */
      .bp-hero-image {
        max-width: 1080px;
        width: 100%;
        margin: 40px auto 0;
        aspect-ratio: 16/9;
        background: linear-gradient(135deg, var(--ytg-bg-2), var(--ytg-bg-3));
        border-radius: 24px;
        overflow: hidden;
        box-shadow: var(--ytg-shadow-lg);
        position: relative;
      }
      .bp-hero-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .bp-hero-image-fallback {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        font-family: 'DM Sans', sans-serif;
        font-weight: 800; font-size: 96px; letter-spacing: -3px;
        color: rgba(10,10,15,0.16);
      }

      /* PROSE — typography for the post body */
      .bp-prose {
        max-width: 820px;
        margin: 0 auto;
        font-size: 16px;
        line-height: 1.72;
        color: var(--ytg-text);
        font-family: 'Inter', system-ui, sans-serif;
      }
      /* Generous paragraph rhythm. Roughly one full line of empty
         space between blocks so the body reads, not feels packed. */
      .bp-prose > * + * { margin-top: 1.65em; }
      .bp-prose > p + p { margin-top: 1.75em; }
      .bp-prose p { margin: 0; }
      .bp-prose strong { font-weight: 700; color: var(--ytg-text); }
      .bp-prose em { font-style: italic; }

      .bp-prose h2 {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 24px; font-weight: 800; letter-spacing: -0.5px;
        line-height: 1.22;
        color: var(--ytg-text);
        margin-top: 2em !important;
        margin-bottom: 0.6em !important;
      }
      .bp-prose h2 + p { margin-top: 0.5em !important; }

      .bp-prose h3 {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 18px; font-weight: 700; letter-spacing: -0.2px;
        line-height: 1.32;
        color: var(--ytg-text);
        margin-top: 1.7em !important;
        margin-bottom: 0.5em !important;
      }
      .bp-prose h3 + p { margin-top: 0.5em !important; }

      .bp-prose a {
        color: var(--ytg-accent);
        text-decoration: none;
        font-weight: 600;
        background-image: linear-gradient(transparent calc(100% - 1px), rgba(229,48,42,0.4) 1px);
        background-size: 100% 100%;
        background-repeat: no-repeat;
        transition: background-size 0.18s, color 0.18s;
      }
      .bp-prose a:hover {
        color: var(--ytg-accent-text);
        background-image: linear-gradient(transparent calc(100% - 1px), var(--ytg-accent) 1px);
      }

      /* UNORDERED list — clear red dot markers, not the default invisible glyph */
      .bp-prose ul {
        padding-left: 1.5em;
        list-style: none;
      }
      .bp-prose ul > li {
        position: relative;
        padding-left: 0.5em;
        margin: 0.7em 0;
        line-height: 1.7;
      }
      .bp-prose ul > li::before {
        content: '';
        position: absolute;
        left: -0.85em;
        top: 0.6em;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--ytg-text);
      }

      /* ORDERED list — red bold numerals */
      .bp-prose ol {
        padding-left: 1.6em;
        list-style: none;
        counter-reset: bp-list-counter;
      }
      .bp-prose ol > li {
        position: relative;
        padding-left: 0.4em;
        margin: 0.7em 0;
        line-height: 1.7;
        counter-increment: bp-list-counter;
      }
      .bp-prose ol > li::before {
        content: counter(bp-list-counter) '.';
        position: absolute;
        left: -1.5em;
        top: 0;
        color: var(--ytg-text);
        font-weight: 700;
        font-size: 0.95em;
      }

      /* Callout — clean red left line, no background, label in red. Reads
         as a quiet pull-quote, not a card. The bold prefix (Pro Tip:,
         The Formula:, Warning:) inherits the accent so it scans first. */
      .bp-prose blockquote {
        margin: 1.8em 0;
        padding: 2px 0 2px 22px;
        background: transparent;
        border: 0;
        border-left: 3px solid var(--ytg-accent);
        border-radius: 0;
        font-size: 16px;
        font-style: normal;
        color: var(--ytg-text);
        font-weight: 400;
        line-height: 1.7;
      }
      .bp-prose blockquote p { margin: 0; }
      .bp-prose blockquote strong {
        color: var(--ytg-accent);
        font-weight: 700;
      }

      /* Inline CTA button — solid red pill that authors can drop into
         the post body to drive to signup or any internal route. */
      .bp-prose .bp-cta-inline {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--ytg-accent) !important;
        color: #fff !important;
        padding: 10px 22px;
        font-size: 14px;
        font-weight: 700;
        border-radius: 100px;
        text-decoration: none !important;
        background-image: none !important;
        letter-spacing: -0.1px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.10), 0 4px 16px rgba(229,48,42,0.30);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .bp-prose .bp-cta-inline:hover {
        filter: brightness(1.07);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.12), 0 8px 24px rgba(229,48,42,0.40);
        color: #fff !important;
      }

      /* CTA card — bigger row-style promo block. Title + sub-line on the
         left, red pill button on the right. Drops into a post anywhere
         to upsell a feature or push signups. */
      .bp-prose .bp-cta-card-link {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        margin: 2.5em 0;
        padding: 26px 30px;
        background: var(--ytg-card) !important;
        border: 1px solid var(--ytg-border);
        border-radius: 16px;
        box-shadow: var(--ytg-shadow-sm);
        text-decoration: none !important;
        background-image: none !important;
        color: var(--ytg-text) !important;
        position: relative;
        overflow: hidden;
        transition: box-shadow 0.22s, transform 0.22s, border-color 0.22s;
      }
      .bp-prose .bp-cta-card-link:hover {
        box-shadow: var(--ytg-shadow-lg);
        transform: translateY(-2px);
        border-color: rgba(229,48,42,0.18);
        color: var(--ytg-text) !important;
      }
      .bp-prose .bp-cta-card-link::before {
        content: '';
        position: absolute;
        top: -50px; right: -50px;
        width: 220px; height: 140px;
        background: radial-gradient(ellipse, rgba(229,48,42,0.10) 0%, transparent 70%);
        pointer-events: none;
      }
      .bp-cta-card-text { display: block; flex: 1; min-width: 0; position: relative; z-index: 1; }
      .bp-cta-card-title {
        display: block;
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 17px;
        font-weight: 800;
        letter-spacing: -0.3px;
        color: var(--ytg-text);
        margin: 0 0 6px 0 !important;
        line-height: 1.3;
      }
      .bp-cta-card-sub {
        display: block;
        font-size: 14px;
        color: var(--ytg-text-2);
        margin: 0 !important;
        line-height: 1.55;
      }
      .bp-cta-card-pill {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--ytg-accent);
        color: #fff;
        padding: 11px 22px;
        font-size: 14px;
        font-weight: 700;
        border-radius: 100px;
        white-space: nowrap;
        box-shadow: 0 1px 2px rgba(0,0,0,0.10), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s;
        position: relative; z-index: 1;
      }
      .bp-prose .bp-cta-card-link:hover .bp-cta-card-pill {
        filter: brightness(1.07);
        transform: translateY(-1px);
      }
      @media (max-width: 720px) {
        .bp-prose .bp-cta-card-link {
          flex-direction: column;
          align-items: flex-start;
          padding: 22px 24px;
          gap: 18px;
        }
      }

      .bp-prose img {
        width: 100%;
        height: auto;
        border-radius: 16px;
        margin: 2.4em 0;
        box-shadow: var(--ytg-shadow-sm);
      }

      .bp-prose code {
        background: var(--ytg-bg-2);
        padding: 2px 7px;
        border-radius: 6px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.88em;
        color: var(--ytg-accent-text);
        font-weight: 500;
      }
      .bp-prose pre {
        background: #0d0d12;
        color: rgba(255,255,255,0.92);
        padding: 22px 24px;
        border-radius: 14px;
        overflow-x: auto;
        margin: 2.4em 0;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 14px;
        line-height: 1.65;
      }
      .bp-prose pre code {
        background: transparent;
        color: inherit;
        padding: 0;
        font-size: inherit;
      }

      .bp-prose hr {
        border: 0;
        border-top: 1px solid var(--ytg-border);
        margin: 2.8em 0;
      }

      .bp-prose table {
        width: 100%;
        border-collapse: collapse;
        margin: 2em 0;
        font-size: 15px;
        border: 1px solid var(--ytg-border);
        border-radius: 14px;
        overflow: hidden;
        background: var(--ytg-card);
        box-shadow: var(--ytg-shadow-sm);
      }
      .bp-prose thead {
        background: var(--ytg-bg-2);
      }
      .bp-prose th {
        padding: 14px 18px;
        font-weight: 700;
        text-align: left;
        font-size: 11.5px;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        color: var(--ytg-text-2);
        font-family: 'Inter', system-ui, sans-serif;
      }
      .bp-prose td {
        padding: 16px 18px;
        border-top: 1px solid var(--ytg-border);
        vertical-align: top;
        line-height: 1.6;
      }

      /* RELATED POSTS */
      .bp-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }

      .bp-related-card {
        display: flex; flex-direction: column;
        background: var(--ytg-card);
        border-radius: 16px;
        border: 1px solid var(--ytg-border);
        box-shadow: var(--ytg-shadow-sm);
        overflow: hidden;
        text-decoration: none;
        color: inherit;
        transition: box-shadow 0.22s, transform 0.22s;
      }
      .bp-related-card:hover { box-shadow: var(--ytg-shadow-lg); transform: translateY(-3px); }
      .bp-related-card-cover {
        width: 100%; aspect-ratio: 16/9;
        background: linear-gradient(135deg, var(--ytg-bg-2), var(--ytg-bg-3));
        position: relative; overflow: hidden;
      }
      .bp-related-card-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .bp-related-card-cover-fallback {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        font-family: 'DM Sans', sans-serif;
        font-weight: 800; font-size: 56px; letter-spacing: -2px;
        color: rgba(10,10,15,0.16);
      }
      .bp-related-card-body { padding: 22px 22px 24px; display: flex; flex-direction: column; flex: 1; gap: 8px; }
      .bp-related-card-cat {
        font-size: 11px; font-weight: 800;
        color: var(--ytg-accent-text);
        letter-spacing: 0.1em; text-transform: uppercase;
      }
      .bp-related-card-title {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 17px; font-weight: 800;
        letter-spacing: -0.4px; line-height: 1.28;
        color: var(--ytg-text);
        text-wrap: balance;
        transition: color 0.18s;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .bp-related-card:hover .bp-related-card-title { color: var(--ytg-accent); }
      .bp-related-card-meta {
        margin-top: auto; padding-top: 12px;
        font-size: 12.5px; color: var(--ytg-text-3);
        display: flex; align-items: center; gap: 8px;
        border-top: 1px solid var(--ytg-border);
      }
      .bp-related-card-meta-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--ytg-text-3); }

      /* Related cards mobile — tighter padding/font */
      @media (max-width: 768px) {
        .bp-related-card { border-radius: 14px; }
        .bp-related-card-body { padding: 18px 18px 20px; gap: 6px; }
        .bp-related-card-title { font-size: 16px; line-height: 1.25; }
        .bp-related-card-cat { font-size: 10.5px; }
        .bp-related-card-meta { font-size: 12px; padding-top: 10px; }
      }

      @media (max-width: 1024px) {
        .bp-grid-3 { grid-template-columns: repeat(2,1fr); }
      }
      @media (max-width: 768px) {
        .bp-prose { font-size: 15.5px; line-height: 1.7; }
        .bp-prose > * + *  { margin-top: 1.4em; }
        .bp-prose > p + p { margin-top: 1.5em; }
        .bp-prose h2 { font-size: 21px; letter-spacing: -0.4px; margin-top: 1.7em !important; margin-bottom: 0.5em !important; }
        .bp-prose h3 { font-size: 17px; margin-top: 1.45em !important; }
        .bp-prose blockquote { padding: 2px 0 2px 18px; font-size: 14.5px; margin: 1.5em 0; line-height: 1.65; }
        .bp-prose ul > li, .bp-prose ol > li { margin: 0.55em 0; }
        .bp-prose img { margin: 1.6em 0; border-radius: 10px; }
        .bp-prose table { font-size: 13px; }
        .bp-prose th { padding: 10px 12px; font-size: 10.5px; }
        .bp-prose td { padding: 12px 12px; }
        .bp-grid-3 { grid-template-columns: 1fr; }
        .bp-section-pad { padding-left: 18px !important; padding-right: 18px !important; }
        .bp-hero-image { border-radius: 14px; margin-top: 20px; box-shadow: var(--ytg-shadow); }

        /* Category pill — slightly smaller, less margin on mobile */
        .bp-category {
          padding: 6px 14px;
          font-size: 10.5px;
          margin-bottom: 18px;
        }

        /* Byline tighter on mobile */
        .bp-byline-rule { width: 28px; margin-bottom: 14px; }
        .bp-byline-author { font-size: 15px; }
        .bp-byline-meta { font-size: 12.5px; margin-top: 4px; }

        /* CTA card mid-post — tighter padding/typography */
        .bp-prose .bp-cta-card-link {
          margin: 2em 0;
          padding: 20px 20px;
          gap: 16px;
        }
        .bp-cta-card-title { font-size: 16px; }
        .bp-cta-card-sub { font-size: 13px; line-height: 1.5; }
        .bp-cta-card-pill { padding: 10px 18px; font-size: 13px; width: 100%; justify-content: center; }
      }
      @media (max-width: 420px) {
        .bp-prose { font-size: 15px; }
        .bp-prose h2 { font-size: 20px; }
      }
    `,document.head.appendChild(t)},[])}function h(){let[e,t]=(0,d.useState)(0);return(0,d.useEffect)(()=>{let e=()=>{let e=document.documentElement.scrollHeight-window.innerHeight;t(e>0?window.scrollY/e*100:0)};return window.addEventListener(`scroll`,e,{passive:!0}),()=>window.removeEventListener(`scroll`,e)},[]),(0,f.jsx)(`div`,{style:{position:`fixed`,top:0,left:0,right:0,height:3,zIndex:999},children:(0,f.jsx)(`div`,{style:{height:`100%`,width:`${e}%`,background:`var(--ytg-accent)`,transition:`width 0.08s linear`,borderRadius:`0 2px 2px 0`}})})}function g({title:e}){return(0,f.jsx)(`div`,{className:`bp-hero-image-fallback`,children:(e||`Y`).trim()[0].toUpperCase()})}function _({title:e}){return(0,f.jsx)(`div`,{className:`bp-related-card-cover-fallback`,children:(e||`Y`).trim()[0].toUpperCase()})}function v({post:e}){return(0,f.jsxs)(i,{to:`/blog/${e.slug}`,className:`bp-related-card`,children:[(0,f.jsx)(`div`,{className:`bp-related-card-cover`,children:e.cover?(0,f.jsx)(`img`,{src:e.cover,alt:e.title,loading:`lazy`,onError:e=>{e.currentTarget.style.display=`none`}}):(0,f.jsx)(_,{title:e.title})}),(0,f.jsxs)(`div`,{className:`bp-related-card-body`,children:[(0,f.jsx)(`span`,{className:`bp-related-card-cat`,children:e.category.label}),(0,f.jsx)(`h3`,{className:`bp-related-card-title`,children:e.title}),(0,f.jsxs)(`div`,{className:`bp-related-card-meta`,children:[(0,f.jsx)(`span`,{children:u(e.date)}),(0,f.jsx)(`span`,{className:`bp-related-card-meta-dot`}),(0,f.jsx)(`span`,{children:e.readTime})]})]})]})}function y(){m();let{slug:e}=r(),t=c(e),{isMobile:n}=p();if((0,d.useEffect)(()=>{if(!t)return;document.title=`${t.title} — YTGrowth Blog`;let e=document.querySelector(`meta[name="description"]`)||(()=>{let e=document.createElement(`meta`);return e.name=`description`,document.head.appendChild(e),e})();e.content=t.excerpt;let n=`https://ytgrowth.io`,r=`${n}/blog/${t.slug}`,i=t.cover?`${n}${t.cover}`:`${n}/og-image.png`,a={"@context":`https://schema.org`,"@graph":[{"@type":`BlogPosting`,headline:t.title,description:t.excerpt,image:i,datePublished:t.date,dateModified:t.updated||t.date,author:{"@type":`Person`,name:t.author},publisher:{"@type":`Organization`,name:`YTGrowth`,logo:{"@type":`ImageObject`,url:`${n}/favicon.svg`}},mainEntityOfPage:{"@type":`WebPage`,"@id":r},articleSection:t.category?.label,url:r},{"@type":`BreadcrumbList`,itemListElement:[{"@type":`ListItem`,position:1,name:`Home`,item:`${n}/`},{"@type":`ListItem`,position:2,name:`Blog`,item:`${n}/blog`},{"@type":`ListItem`,position:3,name:t.title,item:r}]}]},o=document.getElementById(`bp-jsonld`);o||(o=document.createElement(`script`),o.id=`bp-jsonld`,o.type=`application/ld+json`,document.head.appendChild(o)),o.textContent=JSON.stringify(a),window.scrollTo({top:0,behavior:`instant`})},[t]),!t)return(0,f.jsx)(a,{to:`/blog`,replace:!0});let _=t.content,y=l(t.slug,3);return(0,f.jsxs)(`div`,{style:{background:`var(--ytg-bg)`,minHeight:`100vh`},children:[(0,f.jsx)(h,{}),(0,f.jsx)(s,{}),(0,f.jsxs)(`section`,{style:{padding:n?`24px 18px 0`:`56px 40px 0`,textAlign:`center`,background:`#ffffff`},children:[(0,f.jsxs)(`div`,{style:{maxWidth:880,margin:`0 auto`,animation:`fadeUp 0.5s ease both`},children:[(0,f.jsx)(i,{to:`/blog`,className:`bp-category`,children:t.category.label}),(0,f.jsx)(`h1`,{className:`bp-h1`,style:{fontSize:n?26:46,color:`var(--ytg-text)`,marginBottom:n?14:22,letterSpacing:n?`-0.8px`:`-2px`,lineHeight:n?1.18:1.05},children:t.title}),(0,f.jsx)(`p`,{style:{fontSize:n?14.5:18.5,color:`var(--ytg-text-2)`,lineHeight:1.6,maxWidth:720,margin:n?`0 auto 22px`:`0 auto 32px`},children:t.excerpt}),(0,f.jsxs)(`div`,{className:`bp-byline`,children:[(0,f.jsx)(`div`,{className:`bp-byline-rule`}),(0,f.jsxs)(`p`,{className:`bp-byline-author`,children:[`Published by `,t.author]}),(0,f.jsxs)(`p`,{className:`bp-byline-meta`,children:[`Updated `,u(t.updated||t.date),` · `,t.readTime]})]})]}),(0,f.jsx)(`div`,{className:`bp-section-pad`,style:{maxWidth:1180,margin:`0 auto`,position:`relative`},children:(0,f.jsx)(`div`,{className:`bp-hero-image`,children:t.cover?(0,f.jsx)(`img`,{src:t.cover,alt:t.title,onError:e=>{e.currentTarget.style.display=`none`}}):(0,f.jsx)(g,{title:t.title})})})]}),(0,f.jsx)(`section`,{className:`bp-section-pad`,style:{padding:n?`32px 18px 56px`:`72px 40px 96px`,background:`#ffffff`},children:(0,f.jsx)(`article`,{className:`bp-prose`,children:(0,f.jsx)(_,{})})}),(0,f.jsx)(`section`,{style:{padding:n?`0 14px 0`:`0 40px 0`,background:`var(--ytg-bg)`,borderTop:`1px solid var(--ytg-border)`},children:(0,f.jsx)(`div`,{style:{maxWidth:880,margin:`0 auto`,paddingTop:n?36:80,paddingBottom:n?36:80},children:(0,f.jsxs)(`div`,{style:{borderRadius:n?16:22,border:`1px solid var(--ytg-border)`,boxShadow:`var(--ytg-shadow-xl)`,padding:n?`32px 20px 28px`:`56px 48px 52px`,textAlign:`center`,background:`var(--ytg-card)`,position:`relative`,overflow:`hidden`},children:[(0,f.jsx)(`div`,{style:{position:`absolute`,top:-80,left:`50%`,transform:`translateX(-50%)`,width:460,height:220,background:`radial-gradient(ellipse, rgba(229,48,42,0.10) 0%, transparent 70%)`,pointerEvents:`none`}}),(0,f.jsxs)(`span`,{className:`bp-eyebrow`,style:{marginBottom:n?12:18,position:`relative`},children:[(0,f.jsx)(`span`,{className:`bp-eyebrow-dot`}),(0,f.jsx)(`span`,{className:`bp-eyebrow-text`,children:`Try YTGrowth`})]}),(0,f.jsxs)(`h2`,{className:`bp-h2`,style:{fontSize:n?22:32,marginBottom:n?10:12,letterSpacing:n?`-0.6px`:`-1.2px`,position:`relative`},children:[`Don't just read the playbook.`,(0,f.jsx)(`br`,{}),(0,f.jsx)(`span`,{style:{color:`var(--ytg-accent)`},children:`Run it on your channel.`})]}),(0,f.jsx)(`p`,{style:{fontSize:n?13.5:15.5,color:`var(--ytg-text-2)`,lineHeight:1.6,maxWidth:560,margin:n?`0 auto 20px`:`0 auto 26px`,position:`relative`},children:`YTGrowth scores your titles, audits your channel against the live niche, and surfaces the gaps your competitors are missing. In 30 seconds.`}),(0,f.jsx)(i,{to:`/dashboard`,className:`bp-btn${n?``:` bp-btn-lg`}`,style:{position:`relative`},children:`Try YTGrowth free →`}),(0,f.jsx)(`p`,{style:{fontSize:12,color:`var(--ytg-text-3)`,marginTop:n?10:14,position:`relative`},children:`3 free analyses · No credit card required`})]})})}),y.length>0&&(0,f.jsx)(`section`,{className:`bp-section-pad`,style:{padding:n?`0 18px 56px`:`0 40px 120px`,background:`var(--ytg-bg)`},children:(0,f.jsxs)(`div`,{style:{maxWidth:1180,margin:`0 auto`},children:[(0,f.jsxs)(`div`,{style:{marginBottom:n?18:28},children:[(0,f.jsxs)(`span`,{className:`bp-eyebrow`,children:[(0,f.jsx)(`span`,{className:`bp-eyebrow-dot`}),(0,f.jsx)(`span`,{className:`bp-eyebrow-text`,children:`Keep reading`})]}),(0,f.jsx)(`h2`,{className:`bp-h2`,style:{fontSize:n?22:32,letterSpacing:n?`-0.6px`:`-1.4px`},children:`More from the blog`})]}),(0,f.jsx)(`div`,{className:`bp-grid-3`,children:y.map(e=>(0,f.jsx)(v,{post:e},e.slug))})]})}),(0,f.jsx)(o,{})]})}export{y as default};