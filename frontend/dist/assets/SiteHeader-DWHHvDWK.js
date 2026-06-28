import{r as e}from"./chunk-DECur_0Z.js";import{n as t,t as n}from"./jsx-runtime-CP2iHdEU.js";import{t as r}from"./BrandLockup-DFjMZ6Lg.js";import{a as i,i as a,n as o,o as s,r as c,s as l,t as u}from"./type-CVmDapq5.js";import{_ as d,a as f,c as p,d as m,f as h,g,h as _,i as v,l as y,m as b,n as x,o as S,p as C,r as w,s as T,t as E,u as D}from"./wallet-BUSjxOn7.js";var O=e(t(),1),k=n(),A=[{label:`Audit & strategy`,items:[{href:`/features/channel-audit`,label:`Channel Audit`,desc:`10-dimension AI audit of your channel`,Icon:D}]},{label:`SEO & discovery`,items:[{href:`/features/seo-studio`,label:`SEO Studio`,desc:`Score + rewrite titles and descriptions`,Icon:a},{href:`/features/keyword-research`,label:`Keyword Research`,desc:`YouTube-native search volume + difficulty`,Icon:T},{href:`/features/outliers`,label:`Outliers`,desc:`Find viral videos and breakout channels`,Icon:c}]},{label:`Compete & convert`,items:[{href:`/features/competitor-analysis`,label:`Competitor Analysis`,desc:`Track rivals, find their content gaps`,Icon:v},{href:`/features/thumbnail-iq`,label:`Thumbnail IQ`,desc:`Two-layer thumbnail scoring vs your niche`,Icon:s}]}],j=[{label:`Calculators`,items:[{href:`/tools/youtube-money-calculator`,label:`YouTube Money Calculator`,Icon:h},{href:`/tools/youtube-shorts-money-calculator`,label:`Shorts Money Calculator`,Icon:_},{href:`/tools/youtube-subscriber-money-calculator`,label:`Subscriber Money Calculator`,Icon:E}]},{label:`Brainstorm`,items:[{href:`/tools/youtube-title-generator`,label:`Title Generator`,Icon:u},{href:`/tools/youtube-description-generator`,label:`Description Generator`,Icon:x},{href:`/tools/youtube-tag-generator`,label:`Tag Generator`,Icon:w},{href:`/tools/youtube-hashtag-generator`,label:`Hashtag Generator`,Icon:p},{href:`/tools/youtube-chapter-generator`,label:`Chapter Generator`,Icon:S},{href:`/tools/youtube-channel-name-generator`,label:`Channel Name Generator`,Icon:d},{href:`/tools/youtube-video-ideas-generator`,label:`Video Ideas Generator`,Icon:i}]},{label:`Thumbnails`,items:[{href:`/tools/youtube-thumbnail-tester`,label:`Thumbnail Tester (A/B)`,Icon:b},{href:`/tools/youtube-thumbnail-resizer`,label:`Thumbnail Resizer`,Icon:C},{href:`/tools/youtube-thumbnail-downloader`,label:`Thumbnail Downloader`,Icon:m}]},{label:`Insights`,items:[{href:`/youtube-stats`,label:`Top YouTube Channels`,Icon:o},{href:`/tools/youtube-channel-stats-checker`,label:`Channel Stats Checker`,Icon:l},{href:`/blog`,label:`Blog`,Icon:g}]}],M=[{label:``,items:[{href:`/affiliate`,label:`Affiliates`,desc:`Earn 30% recurring`,Icon:y},{href:`/contact`,label:`Contact`,desc:`Talk to the team`,Icon:f}]}];function N({trigger:e,groups:t,columns:n=2,viewAllHref:r,viewAllLabel:i}){let[a,o]=(0,O.useState)(!1),[s,c]=(0,O.useState)(-14),l=(0,O.useRef)(null),u=(0,O.useRef)(null),d=n===4?1e3:n===3?860:260,f=()=>{let e=l.current;if(!e||typeof window>`u`)return;let t=e.getBoundingClientRect().left,n=document.documentElement.clientWidth,r=t-14;c(Math.min(Math.max(16,r),n-d-16)-t)};return(0,k.jsxs)(`div`,{ref:l,onMouseEnter:()=>{u.current&&clearTimeout(u.current),f(),o(!0)},onMouseLeave:()=>{u.current=setTimeout(()=>o(!1),180)},style:{position:`relative`},children:[(0,k.jsxs)(`a`,{href:t[0].items[0].href,className:`sh-pill-item`,children:[e,(0,k.jsx)(`svg`,{width:`10`,height:`10`,viewBox:`0 0 10 10`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.6`,strokeLinecap:`round`,strokeLinejoin:`round`,style:{transform:a?`rotate(180deg)`:`none`,transition:`transform 0.18s`},children:(0,k.jsx)(`path`,{d:`M2 3.5l3 3 3-3`})})]}),a&&(0,k.jsxs)(k.Fragment,{children:[(0,k.jsx)(`div`,{style:{position:`absolute`,top:`calc(100% - 10px)`,height:28,left:s,width:d}}),(0,k.jsxs)(`div`,{style:{position:`absolute`,top:`calc(100% + 12px)`,left:s,width:d,background:`#ffffff`,border:`1px solid rgba(10,10,15,0.08)`,borderRadius:28,boxShadow:`0 4px 16px rgba(0,0,0,0.07), 0 24px 64px rgba(0,0,0,0.12)`,padding:`24px 26px 18px`,animation:`shFadeUp 0.16s ease both`,zIndex:110},children:[(0,k.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(${n}, minmax(0, 1fr))`,columnGap:14},children:t.map((e,t)=>(0,k.jsxs)(`div`,{children:[e.label&&(0,k.jsx)(`p`,{style:{fontSize:11,fontWeight:700,letterSpacing:`0.1em`,textTransform:`uppercase`,color:`rgba(10,10,15,0.38)`,margin:`0 0 8px 10px`,whiteSpace:`nowrap`},children:e.label}),(0,k.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`},children:e.items.map((e,t)=>(0,k.jsxs)(`a`,{href:e.href,style:{display:`flex`,alignItems:`center`,gap:11,padding:`9px 10px`,borderRadius:12,textDecoration:`none`,transition:`background 0.14s`},onMouseEnter:e=>{e.currentTarget.style.background=`rgba(229,48,42,0.05)`},onMouseLeave:e=>{e.currentTarget.style.background=`transparent`},children:[(0,k.jsx)(`span`,{style:{flexShrink:0,width:34,height:34,borderRadius:`50%`,background:`rgba(229,48,42,0.08)`,display:`inline-flex`,alignItems:`center`,justifyContent:`center`},children:(0,k.jsx)(e.Icon,{size:17,strokeWidth:1.9,color:`#e5302a`})}),(0,k.jsxs)(`span`,{style:{display:`flex`,flexDirection:`column`,minWidth:0},children:[(0,k.jsx)(`span`,{style:{fontSize:14,fontWeight:600,color:`#0a0a0f`,letterSpacing:`-0.15px`,whiteSpace:`nowrap`,lineHeight:1.3},children:e.label}),e.desc&&(0,k.jsx)(`span`,{style:{fontSize:12,fontWeight:450,color:`rgba(10,10,15,0.5)`,letterSpacing:`-0.05px`,lineHeight:1.35,marginTop:1},children:e.desc})]})]},t))})]},t))}),r&&(0,k.jsx)(`div`,{style:{marginTop:22,paddingTop:16,borderTop:`1px solid rgba(10,10,15,0.07)`},children:(0,k.jsx)(`a`,{href:r,style:{display:`inline-flex`,alignItems:`center`,gap:4,fontSize:13.5,fontWeight:600,color:`#e5302a`,textDecoration:`none`,letterSpacing:`-0.1px`},children:i})})]})]})]})}function P(){(0,O.useEffect)(()=>{if(document.getElementById(`sh-styles`))return;let e=document.createElement(`style`);e.id=`sh-styles`,e.textContent=`
      .sh-nav {
        position: sticky; top: 0; z-index: 100;
        height: 68px;
        display: flex; align-items: center; justify-content: center; gap: 22px;
        padding: 0 32px;
        background: #ffffff;
        border-bottom: 1px solid rgba(10,10,15,0.08);
        font-family: 'Manrope', 'Inter', system-ui, sans-serif;
      }

      /* Center nav capsule, Windsor-style: the links live inside one
         outlined pill. Border-only on the white bar. */
      .sh-pill {
        position: relative;
        display: flex; align-items: center; gap: 2px;
        padding: 4px 6px;
        border: 1px solid rgba(10,10,15,0.12);
        border-radius: 999px;
        background: transparent;
      }

      /* Equal-flex sides center the pill on the viewport. Logo hugs the pill's
         left, CTA hugs its right; outer slack falls to the screen edges. */
      .sh-side { flex: 1; display: flex; align-items: center; gap: 10px; min-width: 0; }
      .sh-side-start { justify-content: flex-end; }
      .sh-side-end   { justify-content: flex-start; }
      @media (max-width: 768px) {
        .sh-side-start { justify-content: flex-start; }
        .sh-side-end   { justify-content: flex-end; }
      }
      .sh-pill-item {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 8px 16px;
        border-radius: 999px;
        font-size: 14px; font-weight: 500;
        color: rgba(10,10,15,0.55);
        text-decoration: none; letter-spacing: -0.1px;
        white-space: nowrap; cursor: pointer;
        transition: background 0.15s, color 0.15s;
      }
      .sh-pill-item:hover { background: rgba(10,10,15,0.05); color: #0a0a0f; }
      @media (max-width: 768px)  { .sh-nav { padding: 0 20px; height: 60px; justify-content: space-between; } }

      .sh-brand { display: flex; align-items: center; gap: 9px; text-decoration: none; }
      .sh-brand-name { font-weight: 800; font-size: 17px; line-height: 1; letter-spacing: -0.4px; color: #0a0a0f; }

      .sh-link {
        font-size: 14px; color: rgba(10,10,15,0.40);
        font-weight: 500; text-decoration: none;
        transition: color 0.15s; letter-spacing: -0.1px;
      }
      .sh-link:hover { color: rgba(10,10,15,0.62); }

      .sh-cta {
        display: inline-flex; align-items: center; gap: 6px;
        background: #e5302a; color: #fff;
        padding: 9px 22px; border-radius: 100px;
        font-size: 13px; font-weight: 700;
        text-decoration: none;
        letter-spacing: -0.1px;
        white-space: nowrap;
        box-shadow: 0 1px 2px rgba(0,0,0,0.10), 0 4px 14px rgba(229,48,42,0.30);
        transition: filter 0.18s, transform 0.18s;
      }
      .sh-cta:hover { filter: brightness(1.07); transform: translateY(-1px); color: #fff; }

      .sh-mobile-toggle {
        background: none; border: none; cursor: pointer; padding: 6px;
        color: #0a0a0f;
        display: flex; flex-direction: column; gap: 4.5px;
      }
      /* Mobile overlay, full-screen dark sheet to match the Landing
         mobile menu so the brand surface stays consistent across the
         site. White overlays read as "abandoned" against feature/tool
         pages that already have light bg. */
      .sh-mobile-overlay {
        position: fixed; top: 60px; left: 0; right: 0; bottom: 0;
        background: #0d0d12;
        padding: 28px 24px 24px;
        z-index: 99;
        overflow-y: auto;
        display: flex; flex-direction: column;
      }
      .sh-mm-section { margin-bottom: 28px; }
      .sh-mm-section:last-of-type { margin-bottom: 18px; }
      .sh-mm-label {
        display: block; font-size: 11px; font-weight: 700;
        letter-spacing: 0.12em; text-transform: uppercase;
        color: rgba(255,255,255,0.38); margin-bottom: 12px;
      }
      .sh-mm-link {
        display: block; font-size: 18px; font-weight: 600;
        color: #ffffff; text-decoration: none; padding: 6px 0;
        letter-spacing: -0.3px; line-height: 1.35;
        transition: color 0.15s;
      }
      .sh-mm-link:hover { color: rgba(255,255,255,0.78); }
      .sh-mm-cta-row {
        display: flex; flex-direction: column; gap: 10px;
        padding-top: 18px;
        border-top: 1px solid rgba(255,255,255,0.08);
        margin-top: auto;
      }
      .sh-mm-loginlink {
        display: block; text-align: center; padding: 8px 0;
        font-size: 14px; font-weight: 500; text-decoration: none;
        color: rgba(255,255,255,0.62); letter-spacing: -0.1px;
      }
      @keyframes shFadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
      /* Centered variant keeps the -50% X shift through the animation so the
         panel stays centered under the pill (a plain translateY keyframe would
         clobber the inline translateX and shove the panel off to the right). */
      @keyframes shFadeUpCenter { from { opacity:0; transform:translate(-50%,8px) } to { opacity:1; transform:translate(-50%,0) } }
    `,document.head.appendChild(e)},[])}function F(){P();let[e,t]=(0,O.useState)(typeof window<`u`?window.innerWidth<=768:!1),[n,i]=(0,O.useState)(!1);return(0,O.useEffect)(()=>{let e=()=>t(window.innerWidth<=768);return window.addEventListener(`resize`,e),()=>window.removeEventListener(`resize`,e)},[]),(0,k.jsxs)(k.Fragment,{children:[(0,k.jsxs)(`nav`,{className:`sh-nav`,children:[(0,k.jsx)(`div`,{className:`sh-side sh-side-start`,children:(0,k.jsx)(`a`,{href:`/`,className:`sh-brand`,"aria-label":`ytgrowth home`,children:(0,k.jsx)(r,{height:28})})}),!e&&(0,k.jsxs)(`div`,{className:`sh-pill`,children:[(0,k.jsx)(N,{trigger:`Features`,groups:A,columns:3,viewAllHref:`/#features`,viewAllLabel:`Explore all features →`}),(0,k.jsx)(N,{trigger:`Resources`,groups:j,columns:4,viewAllHref:`/blog`,viewAllLabel:`Read the latest from the blog →`}),(0,k.jsx)(`a`,{href:`/#pricing`,className:`sh-pill-item`,children:`Pricing`}),(0,k.jsx)(N,{trigger:`Company`,groups:M,columns:1})]}),(0,k.jsxs)(`div`,{className:`sh-side sh-side-end`,children:[!e&&(0,k.jsx)(`a`,{href:`/auth/login`,className:`sh-link`,children:`Log in`}),e?(0,k.jsx)(`button`,{onClick:()=>i(e=>!e),className:`sh-mobile-toggle`,"aria-label":`Toggle menu`,children:n?(0,k.jsx)(`svg`,{width:`18`,height:`18`,viewBox:`0 0 18 18`,fill:`none`,children:(0,k.jsx)(`path`,{d:`M2 2l14 14M16 2L2 16`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`})}):(0,k.jsxs)(k.Fragment,{children:[(0,k.jsx)(`span`,{style:{display:`block`,width:20,height:2,background:`#0a0a0f`,borderRadius:2}}),(0,k.jsx)(`span`,{style:{display:`block`,width:20,height:2,background:`#0a0a0f`,borderRadius:2}}),(0,k.jsx)(`span`,{style:{display:`block`,width:14,height:2,background:`#0a0a0f`,borderRadius:2}})]})}):(0,k.jsx)(`a`,{href:`/auth/login`,className:`sh-cta`,children:`Get started free`})]})]}),e&&n&&(0,k.jsxs)(`div`,{className:`sh-mobile-overlay`,children:[(0,k.jsxs)(`div`,{className:`sh-mm-section`,children:[(0,k.jsx)(`span`,{className:`sh-mm-label`,children:`Features`}),A.flatMap(e=>e.items).map((e,t)=>(0,k.jsx)(`a`,{href:e.href,onClick:()=>i(!1),className:`sh-mm-link`,children:e.label},t))]}),(0,k.jsxs)(`div`,{className:`sh-mm-section`,children:[(0,k.jsx)(`span`,{className:`sh-mm-label`,children:`Resources`}),j.flatMap(e=>e.sections?e.sections.flatMap(e=>e.items):e.items).map((e,t)=>(0,k.jsx)(`a`,{href:e.href,onClick:()=>i(!1),className:`sh-mm-link`,children:e.label},t))]}),(0,k.jsxs)(`div`,{className:`sh-mm-section`,children:[(0,k.jsx)(`span`,{className:`sh-mm-label`,children:`Explore`}),(0,k.jsx)(`a`,{href:`/#pricing`,onClick:()=>i(!1),className:`sh-mm-link`,children:`Pricing`}),(0,k.jsx)(`a`,{href:`/affiliate`,onClick:()=>i(!1),className:`sh-mm-link`,children:`Affiliates`}),(0,k.jsx)(`a`,{href:`/contact`,onClick:()=>i(!1),className:`sh-mm-link`,children:`Contact`})]}),(0,k.jsxs)(`div`,{className:`sh-mm-cta-row`,children:[(0,k.jsx)(`a`,{href:`/auth/login`,className:`sh-cta`,style:{justifyContent:`center`,padding:`13px 22px`,fontSize:14},children:`Get started free`}),(0,k.jsx)(`a`,{href:`/auth/login`,className:`sh-mm-loginlink`,children:`Log in`})]})]})]})}export{F as t};