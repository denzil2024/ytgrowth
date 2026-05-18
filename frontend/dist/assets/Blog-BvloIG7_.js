import{r as e}from"./chunk-DECur_0Z.js";import{n as t,t as n}from"./jsx-runtime-CP2iHdEU.js";import{a as r,n as i}from"./index-C5136yqr.js";import{t as a}from"./LandingFooter-BSfMA8xY.js";import{t as o}from"./SiteHeader-B5nrvV2X.js";import{i as s,t as c}from"./posts-DjQOMwnZ.js";var l=e(t(),1),u=n(),d=12;function f(){let[e,t]=(0,l.useState)(typeof window<`u`?window.innerWidth:1280);return(0,l.useEffect)(()=>{let e=()=>t(window.innerWidth);return window.addEventListener(`resize`,e),()=>window.removeEventListener(`resize`,e)},[]),{isMobile:e<=768,isTablet:e<=1024}}function p(){(0,l.useEffect)(()=>{if(document.getElementById(`bl-styles`))return;let e=document.createElement(`link`);e.id=`bl-font`,e.rel=`stylesheet`,e.href=`https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap`,document.head.appendChild(e);let t=document.createElement(`style`);t.id=`bl-styles`,t.textContent=`
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

      .bl-btn {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; padding: 15px 30px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.14), 0 4px 20px rgba(229,48,42,0.34);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
        font-family: 'Inter', system-ui, sans-serif;
      }
      .bl-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,0.16), 0 12px 36px rgba(229,48,42,0.42); }
      .bl-btn-lg { font-size: 16px; padding: 17px 38px; }

      .bl-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        background: #fff;
        border: 1px solid rgba(10,10,15,0.09);
        border-radius: 100px;
        padding: 5px 12px 5px 10px;
        margin-bottom: 20px;
        box-shadow: 0 1px 2px rgba(10,10,15,0.04);
      }
      .bl-eyebrow-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--ytg-accent);
        box-shadow: 0 0 0 3px rgba(229,48,42,0.12);
      }
      .bl-eyebrow-text {
        font-size: 11px; font-weight: 700; color: var(--ytg-text-2);
        text-transform: uppercase; letter-spacing: 0.09em;
      }

      .bl-h1 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -2px; line-height: 1.05; text-wrap: balance; }
      .bl-h2 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -1.4px; line-height: 1.08; text-wrap: balance; }

      .bl-nav-link { font-size: 14px; color: var(--ytg-text-3); font-weight: 500; text-decoration: none; transition: color 0.15s; letter-spacing: -0.1px; }
      .bl-nav-link:hover { color: var(--ytg-text-2); }

      .bl-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }

      /* Card */
      .bl-card {
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
      .bl-card:hover { box-shadow: var(--ytg-shadow-lg); transform: translateY(-3px); }

      .bl-card-cover {
        width: 100%; aspect-ratio: 16/9;
        background: linear-gradient(135deg, var(--ytg-bg-2), var(--ytg-bg-3));
        position: relative; overflow: hidden;
      }
      .bl-card-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .bl-card-cover-fallback {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        font-family: 'DM Sans', sans-serif;
        font-weight: 800; font-size: 64px; letter-spacing: -2px;
        color: rgba(10,10,15,0.16);
      }

      .bl-card-cat-pill {
        position: absolute; top: 14px; left: 14px;
        background: rgba(255,255,255,0.94);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(10,10,15,0.06);
        border-radius: 100px;
        padding: 4px 11px;
        font-size: 10.5px; font-weight: 800;
        color: var(--ytg-accent-text);
        letter-spacing: 0.08em; text-transform: uppercase;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      }

      .bl-card-body { padding: 24px 24px 26px; display: flex; flex-direction: column; flex: 1; gap: 10px; }

      .bl-card-title {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 20px; font-weight: 800;
        letter-spacing: -0.5px; line-height: 1.22;
        color: var(--ytg-text);
        text-wrap: balance;
        transition: color 0.18s;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .bl-card:hover .bl-card-title { color: var(--ytg-accent); }

      .bl-card-excerpt {
        font-size: 14px; line-height: 1.7;
        color: var(--ytg-text-2);
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .bl-card-meta {
        margin-top: auto; padding-top: 14px;
        font-size: 13px; color: var(--ytg-text-3);
        display: flex; align-items: center; gap: 10px;
        border-top: 1px solid var(--ytg-border);
      }
      .bl-card-meta-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--ytg-text-3); }

      /* Featured row */
      .bl-featured {
        display: grid; grid-template-columns: 1.15fr 1fr; gap: 0;
        background: var(--ytg-card);
        border-radius: 22px;
        border: 1px solid var(--ytg-border);
        box-shadow: var(--ytg-shadow-lg);
        overflow: hidden;
        margin-bottom: 56px;
        text-decoration: none; color: inherit;
        transition: box-shadow 0.22s, transform 0.22s;
      }
      .bl-featured:hover { box-shadow: var(--ytg-shadow-xl); transform: translateY(-3px); }
      .bl-featured-cover {
        aspect-ratio: 16/9;
        background: linear-gradient(135deg, var(--ytg-bg-2), var(--ytg-bg-3));
        position: relative; overflow: hidden;
      }
      .bl-featured-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .bl-featured-body { padding: 56px 56px 56px 48px; display: flex; flex-direction: column; justify-content: center; gap: 16px; }
      .bl-featured-title {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 38px; font-weight: 800;
        letter-spacing: -1.1px; line-height: 1.08;
        color: var(--ytg-text);
        text-wrap: balance;
        transition: color 0.18s;
      }
      .bl-featured:hover .bl-featured-title { color: var(--ytg-accent); }
      .bl-featured-excerpt { font-size: 16px; line-height: 1.7; color: var(--ytg-text-2); }

      /* Pagination */
      .bl-pagination {
        display: flex; align-items: center; justify-content: center;
        gap: 6px; margin-top: 56px;
      }
      .bl-page-btn {
        min-width: 38px; height: 38px;
        display: inline-flex; align-items: center; justify-content: center;
        padding: 0 12px;
        background: #fff; border: 1px solid var(--ytg-border);
        border-radius: 100px;
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 13.5px; font-weight: 600; color: var(--ytg-text-2);
        text-decoration: none; cursor: pointer;
        font-variant-numeric: tabular-nums;
        letter-spacing: -0.1px;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
      }
      .bl-page-btn:hover { border-color: rgba(229,48,42,0.32); color: var(--ytg-accent); background: var(--ytg-accent-light); }
      .bl-page-btn.active {
        background: var(--ytg-accent); color: #fff;
        border-color: var(--ytg-accent);
        box-shadow: 0 1px 3px rgba(0,0,0,0.10), 0 4px 12px rgba(229,48,42,0.28);
        cursor: default;
      }
      .bl-page-btn.active:hover { background: var(--ytg-accent); color: #fff; }
      .bl-page-btn.disabled {
        opacity: 0.35; cursor: not-allowed; pointer-events: none;
      }
      .bl-page-ellipsis {
        min-width: 24px; height: 38px;
        display: inline-flex; align-items: center; justify-content: center;
        font-size: 13.5px; color: var(--ytg-text-3); font-weight: 600;
      }

      @media (max-width: 1024px) {
        .bl-grid-3 { grid-template-columns: repeat(2,1fr); }
      }
      @media (max-width: 768px) {
        .bl-grid-3 { grid-template-columns: 1fr; gap: 16px; }
        .bl-featured { grid-template-columns: 1fr; border-radius: 16px; margin-bottom: 32px; }
        .bl-featured-cover { aspect-ratio: 16/9; }
        .bl-featured-body { padding: 22px 22px 26px; gap: 10px; }
        .bl-featured-title { font-size: 22px; letter-spacing: -0.4px; line-height: 1.18; }
        .bl-featured-excerpt { font-size: 14.5px; line-height: 1.6; }
        .bl-card { border-radius: 14px; }
        .bl-card-body { padding: 20px 20px 22px; gap: 8px; }
        .bl-card-title { font-size: 18px; line-height: 1.25; }
        .bl-card-excerpt { font-size: 13.5px; -webkit-line-clamp: 2; }
        .bl-card-cat-pill { font-size: 10px; padding: 3px 9px; top: 12px; left: 12px; }
        .bl-section-pad { padding-left: 18px !important; padding-right: 18px !important; }
      }
    `,document.head.appendChild(t)},[])}function m(){let[e,t]=(0,l.useState)(0);return(0,l.useEffect)(()=>{let e=()=>{let e=document.documentElement.scrollHeight-window.innerHeight;t(e>0?window.scrollY/e*100:0)};return window.addEventListener(`scroll`,e,{passive:!0}),()=>window.removeEventListener(`scroll`,e)},[]),(0,u.jsx)(`div`,{style:{position:`fixed`,top:0,left:0,right:0,height:3,zIndex:999},children:(0,u.jsx)(`div`,{style:{height:`100%`,width:`${e}%`,background:`var(--ytg-accent)`,transition:`width 0.08s linear`,borderRadius:`0 2px 2px 0`}})})}function h({title:e}){return(0,u.jsx)(`div`,{className:`bl-card-cover-fallback`,children:(e||`Y`).trim()[0].toUpperCase()})}function g({post:e}){return(0,u.jsxs)(i,{to:`/blog/${e.slug}`,className:`bl-card`,children:[(0,u.jsxs)(`div`,{className:`bl-card-cover`,children:[e.cover?(0,u.jsx)(`img`,{src:e.cover,alt:e.title,loading:`lazy`,onError:e=>{e.currentTarget.style.display=`none`}}):(0,u.jsx)(h,{title:e.title}),(0,u.jsx)(`span`,{className:`bl-card-cat-pill`,children:e.category.label})]}),(0,u.jsxs)(`div`,{className:`bl-card-body`,children:[(0,u.jsx)(`h3`,{className:`bl-card-title`,children:e.title}),(0,u.jsx)(`p`,{className:`bl-card-excerpt`,children:e.excerpt}),(0,u.jsxs)(`div`,{className:`bl-card-meta`,children:[(0,u.jsx)(`span`,{children:c(e.date)}),(0,u.jsx)(`span`,{className:`bl-card-meta-dot`}),(0,u.jsx)(`span`,{children:e.readTime})]})]})]})}function _({post:e}){return(0,u.jsxs)(i,{to:`/blog/${e.slug}`,className:`bl-featured`,children:[(0,u.jsxs)(`div`,{className:`bl-featured-cover`,children:[e.cover?(0,u.jsx)(`img`,{src:e.cover,alt:e.title,onError:e=>{e.currentTarget.style.display=`none`}}):(0,u.jsx)(h,{title:e.title}),(0,u.jsx)(`span`,{className:`bl-card-cat-pill`,children:e.category.label})]}),(0,u.jsxs)(`div`,{className:`bl-featured-body`,children:[(0,u.jsxs)(`span`,{className:`bl-eyebrow`,style:{marginBottom:0},children:[(0,u.jsx)(`span`,{className:`bl-eyebrow-dot`}),(0,u.jsx)(`span`,{className:`bl-eyebrow-text`,children:`Featured`})]}),(0,u.jsx)(`h2`,{className:`bl-featured-title`,children:e.title}),(0,u.jsx)(`p`,{className:`bl-featured-excerpt`,children:e.excerpt}),(0,u.jsxs)(`div`,{className:`bl-card-meta`,style:{marginTop:4,paddingTop:14,borderTop:`1px solid var(--ytg-border)`},children:[(0,u.jsxs)(`span`,{children:[`By `,e.author]}),(0,u.jsx)(`span`,{className:`bl-card-meta-dot`}),(0,u.jsx)(`span`,{children:c(e.date)}),(0,u.jsx)(`span`,{className:`bl-card-meta-dot`}),(0,u.jsx)(`span`,{children:e.readTime})]})]})]})}function v(e,t){if(t<=7)return Array.from({length:t},(e,t)=>t+1);let n=[...new Set([1,t,e-1,e,e+1])].filter(e=>e>=1&&e<=t).sort((e,t)=>e-t),r=[];for(let e=0;e<n.length;e++)r.push(n[e]),e<n.length-1&&n[e+1]-n[e]>1&&r.push(`…`);return r}function y({current:e,total:t}){if(t<=1)return null;let n=v(e,t),r=e=>e===1?`/blog`:`/blog?page=${e}`,i=e<=1,a=e>=t;return(0,u.jsxs)(`nav`,{className:`bl-pagination`,"aria-label":`Blog pagination`,children:[(0,u.jsx)(`a`,{href:r(e-1),className:`bl-page-btn${i?` disabled`:``}`,"aria-label":`Previous page`,"aria-disabled":i,children:`← Prev`}),n.map((t,n)=>t===`…`?(0,u.jsx)(`span`,{className:`bl-page-ellipsis`,"aria-hidden":`true`,children:`…`},`e${n}`):(0,u.jsx)(`a`,{href:r(t),className:`bl-page-btn${t===e?` active`:``}`,"aria-current":t===e?`page`:void 0,children:t},t)),(0,u.jsx)(`a`,{href:r(e+1),className:`bl-page-btn${a?` disabled`:``}`,"aria-label":`Next page`,"aria-disabled":a,children:`Next →`})]})}function b(){p();let[e]=r(),{isMobile:t}=f(),n=(0,l.useMemo)(()=>[...s].sort((e,t)=>new Date(t.date)-new Date(e.date)),[]),c=n[0]||null,h=(0,l.useMemo)(()=>n.slice(1),[n]),v=Math.max(1,Math.ceil(h.length/d)),b=parseInt(e.get(`page`)||`1`,10),x=Number.isFinite(b)?Math.min(Math.max(1,b),v):1,{featured:S,gridPosts:C}=(0,l.useMemo)(()=>{let e=(x-1)*d;return{featured:x===1?c:null,gridPosts:h.slice(e,e+d)}},[c,h,x]);return(0,l.useEffect)(()=>{document.title=x===1?`Blog — YTGrowth`:`Blog (Page ${x}) — YTGrowth`;let e=document.querySelector(`meta[name="description"]`)||(()=>{let e=document.createElement(`meta`);return e.name=`description`,document.head.appendChild(e),e})();e.content=x===1?`YouTube growth tactics, channel deep-dives, and creator playbooks from the YTGrowth team.`:`More posts from the YTGrowth blog — page ${x} of ${v}. YouTube growth tactics, channel deep-dives, and creator playbooks.`},[x,v]),(0,l.useEffect)(()=>{let e=window.location.origin,t=t=>t===1?`${e}/blog`:`${e}/blog?page=${t}`,n=(e,t)=>{let n=document.querySelector(`link[rel="${e}"]`);if(!t){n&&n.remove();return}n||(n=document.createElement(`link`),n.rel=e,document.head.appendChild(n)),n.href=t};return n(`prev`,x>1?t(x-1):null),n(`next`,x<v?t(x+1):null),()=>{n(`prev`,null),n(`next`,null)}},[x,v]),(0,l.useEffect)(()=>{window.scrollTo({top:0,behavior:`instant`})},[x]),(0,u.jsxs)(`div`,{style:{background:`var(--ytg-bg)`,minHeight:`100vh`},children:[(0,u.jsx)(m,{}),(0,u.jsx)(o,{}),(0,u.jsx)(`section`,{style:{padding:t?`40px 18px 40px`:`110px 40px 72px`,textAlign:`center`,background:`#ffffff`},children:(0,u.jsxs)(`div`,{style:{maxWidth:880,margin:`0 auto`,animation:`fadeUp 0.5s ease both`},children:[(0,u.jsxs)(`span`,{className:`bl-eyebrow`,children:[(0,u.jsx)(`span`,{className:`bl-eyebrow-dot`}),(0,u.jsx)(`span`,{className:`bl-eyebrow-text`,children:`The blog`})]}),(0,u.jsxs)(`h1`,{className:`bl-h1`,style:{fontSize:t?32:60,color:`var(--ytg-text)`,marginBottom:t?16:22,letterSpacing:t?`-1.2px`:`-2px`},children:[`YouTube growth, `,(0,u.jsx)(`span`,{style:{color:`var(--ytg-accent)`},children:`without the noise.`})]}),(0,u.jsx)(`p`,{style:{fontSize:t?15:18.5,color:`var(--ytg-text-2)`,lineHeight:1.65,maxWidth:680,margin:`0 auto`},children:`Tactics, channel deep-dives, and creator playbooks from the team behind YTGrowth. Written by humans, tested on real channels.`})]})}),(0,u.jsx)(`section`,{className:`bl-section-pad`,style:{padding:t?`36px 18px 56px`:`80px 40px 120px`,background:`var(--ytg-bg)`,borderTop:`1px solid var(--ytg-border)`},children:(0,u.jsxs)(`div`,{style:{maxWidth:1180,margin:`0 auto`},children:[S&&(0,u.jsx)(_,{post:S}),C.length>0&&(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(`div`,{style:{marginBottom:t?16:24,marginTop:t?8:16},children:(0,u.jsx)(`h2`,{className:`bl-h2`,style:{fontSize:t?22:32,color:`var(--ytg-text)`,letterSpacing:t?`-0.6px`:`-1.4px`},children:x===1?`More from the blog`:`Page ${x} of ${v}`})}),(0,u.jsx)(`div`,{className:`bl-grid-3`,children:C.map(e=>(0,u.jsx)(g,{post:e},e.slug))})]}),(0,u.jsx)(y,{current:x,total:v}),s.length===0&&(0,u.jsx)(`div`,{style:{textAlign:`center`,padding:`80px 20px`,color:`var(--ytg-text-3)`},children:`No posts yet. Check back soon.`})]})}),(0,u.jsx)(`section`,{style:{padding:t?`0 14px 56px`:`0 40px 120px`,background:`var(--ytg-bg-2)`,borderTop:`1px solid var(--ytg-border)`},children:(0,u.jsx)(`div`,{style:{maxWidth:1e3,margin:`0 auto`,paddingTop:t?36:88},children:(0,u.jsxs)(`div`,{style:{borderRadius:t?16:24,border:`1px solid var(--ytg-border)`,boxShadow:`var(--ytg-shadow-xl)`,padding:t?`36px 20px 32px`:`80px 60px`,textAlign:`center`,background:`var(--ytg-card)`,position:`relative`,overflow:`hidden`},children:[(0,u.jsx)(`div`,{style:{position:`absolute`,top:-80,left:`50%`,transform:`translateX(-50%)`,width:500,height:240,background:`radial-gradient(ellipse, rgba(229,48,42,0.10) 0%, transparent 70%)`,pointerEvents:`none`}}),(0,u.jsxs)(`span`,{className:`bl-eyebrow`,style:{position:`relative`},children:[(0,u.jsx)(`span`,{className:`bl-eyebrow-dot`}),(0,u.jsx)(`span`,{className:`bl-eyebrow-text`,children:`Try YTGrowth`})]}),(0,u.jsxs)(`h2`,{className:`bl-h2`,style:{fontSize:t?26:44,marginBottom:t?10:14,letterSpacing:t?`-0.8px`:`-1.4px`,position:`relative`},children:[`Reading is good.`,(0,u.jsx)(`br`,{}),(0,u.jsx)(`span`,{style:{color:`var(--ytg-accent)`},children:`Doing is better.`})]}),(0,u.jsx)(`p`,{style:{fontSize:t?14:16,color:`var(--ytg-text-2)`,maxWidth:520,margin:`0 auto 22px`,lineHeight:1.65,position:`relative`},children:`Run your channel through YTGrowth and get a complete audit, SEO recommendations, and competitor breakdowns. Free to try.`}),(0,u.jsx)(i,{to:`/dashboard`,className:`bl-btn${t?``:` bl-btn-lg`}`,style:{position:`relative`},children:`Try YTGrowth free →`})]})})}),(0,u.jsx)(a,{})]})}export{b as default};