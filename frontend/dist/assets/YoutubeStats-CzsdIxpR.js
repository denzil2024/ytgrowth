import{n as e}from"./chunk-B3K2TuZy.js";import{n as t,t as n}from"./jsx-runtime-BQXCR5OR.js";import{t as r}from"./LandingFooter-CgBCDLts.js";import{t as i}from"./SiteHeader-BoONovKa.js";import{t as a}from"./FaqSchema-BJu5FlvQ.js";var o=e(t(),1),s=n(),c=[{id:`gaming`,label:`Gaming`,blurb:`The biggest gaming channels on YouTube. Esports, Let’s Plays, walkthroughs, and reaction streams.`},{id:`tech`,label:`Tech & Reviews`,blurb:`Reviewers, tear-downs, and software/hardware explainers. The channels brand sponsorships fight over.`},{id:`beauty`,label:`Beauty & Makeup`,blurb:`Tutorials, reviews, GRWMs, and brand collabs. Some of YouTube's longest-running creator empires.`},{id:`finance`,label:`Finance & Investing`,blurb:`Personal finance, markets, real estate, and side-hustle channels. The highest-RPM corner of YouTube.`},{id:`cooking`,label:`Cooking & Food`,blurb:`Recipes, restaurant reviews, food science, and pro-chef teaching channels.`},{id:`fitness`,label:`Fitness & Health`,blurb:`Workouts, nutrition, mobility, and physique transformations across every training style.`},{id:`music`,label:`Music`,blurb:`Artists, labels, music video channels, and instrument-teaching channels with the biggest reach.`},{id:`education`,label:`Education & Science`,blurb:`Explainers, lectures, and visualised science. The format that makes "edutainment" a real category.`},{id:`vlogs`,label:`Vlogs`,blurb:`Daily vlogs, family channels, and lifestyle creators with audiences that show up for every upload.`},{id:`travel`,label:`Travel`,blurb:`Trip vlogs, destination guides, gear reviews, and budget-travel channels for every type of traveller.`},{id:`comedy`,label:`Comedy`,blurb:`Sketches, parodies, stand-up, and reaction comedy. High velocity, high subscriber retention.`},{id:`sports`,label:`Sports`,blurb:`Highlights, analysis, athlete channels, and league-owned channels that pull seven-figure views per upload.`},{id:`entertainment`,label:`Entertainment`,blurb:`Pop culture, TV, film, celebrity, and reaction channels. Where YouTube and traditional media collide.`},{id:`news`,label:`News & Politics`,blurb:`Daily news, talk shows, and political commentary. Some of the most-watched live streams on the platform.`}];Object.fromEntries(c.map(e=>[e.id,e]));var l=[{q:`Where does this data come from?`,a:`Directly from YouTube. We call YouTube Data API v3 (search.list + channels.list) once per day, pull the top channels in each niche, and cache the result. Subscriber count, total views, and video count come straight from YouTube's own statistics endpoint, the same one YouTube Studio uses.`},{q:`How are the rankings calculated?`,a:`By live subscriber count, descending. We search for channels matching each niche query (e.g. "gaming youtube channel"), filter out anything below 500K subscribers (cuts random small channels that share a name with a popular one), then rank what's left by subs. The number you see is the count YouTube returned during the most recent refresh, which is shown as the "updated" timestamp.`},{q:`How often does this update?`,a:`Once every 24 hours. The refresh runs at 05:30 UTC and replaces each category's cached list wholesale, so departed channels don't linger. If a channel changed name, hid its sub count, or fell below 500K subs, it drops off the next refresh.`},{q:`Why are some channels missing? My favourite isn't here.`,a:`Two common reasons. (1) The channel is below the 500K subscriber threshold, which we use to filter out small same-named channels that show up in YouTube's search results. (2) YouTube's relevance-sorted search didn't surface it within the top 50 candidates for that niche query. We don't curate a hand-picked list, so a channel either matches the query strongly enough to surface or it doesn't.`},{q:`Can I look up a specific channel?`,a:`Yes. Use the free <a href="/tools/youtube-channel-stats-checker" style="color: var(--ytg-accent); font-weight: 600; text-decoration: none;">Channel Stats Checker</a> to pull stats for any channel by URL or handle. No subscriber threshold there, and it works for channels of any size.`},{q:`Are the subscriber counts real-time?`,a:`Within a 24-hour window. YouTube's public API returns subscriber counts rounded to the nearest hundred (or thousand for large channels), so they're close to live but not second-by-second. For the precise to-the-second count of a single channel, use the channel's own about page on YouTube.`},{q:`Why a 500K minimum?`,a:`Because YouTube's search-by-name returns lookalikes. Search for "drake" and you get the artist plus thousands of channels named after him by random users with 5 subs each. Filtering at 500K guarantees the leaderboard shows real, established channels and not noise.`},{q:`Will you add more categories or per-country breakdowns?`,a:`Yes. The next iteration adds country dimensions (top channels in each niche by region: US, UK, Canada, Australia, India, etc.) and per-category landing pages with the full top 50 for each niche. This page is the v1 hub — drilldowns are next.`}];function u(){let[e,t]=(0,o.useState)(typeof window<`u`?window.innerWidth:1280);return(0,o.useEffect)(()=>{let e=()=>t(window.innerWidth);return window.addEventListener(`resize`,e),()=>window.removeEventListener(`resize`,e)},[]),{isMobile:e<=768,isTablet:e<=1024}}function d(){(0,o.useEffect)(()=>{if(document.getElementById(`yts-styles`))return;let e=document.createElement(`link`);e.id=`yts-font`,e.rel=`stylesheet`,e.href=`https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap`,document.head.appendChild(e);let t=document.createElement(`style`);t.id=`yts-styles`,t.textContent=`
      :root {
        --ytg-bg: #f4f4f6; --ytg-bg-2: #ecedf1; --ytg-bg-3: #e6e7ec;
        --ytg-text: #0a0a0f; --ytg-text-2: rgba(10,10,15,0.62); --ytg-text-3: rgba(10,10,15,0.40);
        --ytg-card: #ffffff; --ytg-border: rgba(10,10,15,0.09); --ytg-border-2: rgba(10,10,15,0.16);
        --ytg-accent: #e5302a; --ytg-accent-text: #c22b25; --ytg-accent-light: rgba(229,48,42,0.07);
        --ytg-shadow-sm: 0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
        --ytg-shadow: 0 2px 6px rgba(0,0,0,0.08), 0 10px 32px rgba(0,0,0,0.11);
        --ytg-shadow-lg: 0 4px 16px rgba(0,0,0,0.11), 0 24px 60px rgba(0,0,0,0.14);
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; scroll-padding-top: 84px; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; scrollbar-width: auto; scrollbar-color: rgba(10,10,15,0.28) transparent; }
      ::-webkit-scrollbar { width: 12px; height: 12px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background-color: rgba(10,10,15,0.28); border-radius: 10px; border: 3px solid transparent; background-clip: content-box; }
      ::-webkit-scrollbar-thumb:hover { background-color: rgba(10,10,15,0.48); background-clip: content-box; }

      @keyframes ytsFadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .yts-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
        padding: 14px 28px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px; white-space: nowrap;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .yts-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,48,42,0.42); }
      .yts-btn-lg { font-size: 16px; padding: 17px 36px; }

      .yts-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        background: #fff; border: 1px solid rgba(10,10,15,0.09);
        border-radius: 100px; padding: 5px 12px 5px 10px; margin-bottom: 20px;
        box-shadow: 0 1px 2px rgba(10,10,15,0.04);
      }
      .yts-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ytg-accent); box-shadow: 0 0 0 3px rgba(229,48,42,0.12); }
      .yts-eyebrow-text { font-size: 11px; font-weight: 700; color: var(--ytg-text-2); text-transform: uppercase; letter-spacing: 0.09em; }

      .yts-jump-row {
        display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;
      }
      .yts-jump-chip {
        background: #fff; border: 1px solid var(--ytg-border); color: var(--ytg-text-2);
        font-size: 13px; font-weight: 600; letter-spacing: -0.1px;
        padding: 7px 14px; border-radius: 100px;
        text-decoration: none; font-family: inherit;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
      }
      .yts-jump-chip:hover {
        border-color: rgba(229,48,42,0.32);
        color: var(--ytg-accent);
        background: var(--ytg-accent-light);
      }

      .yts-row {
        display: grid;
        grid-template-columns: 28px 56px minmax(0, 1fr) auto;
        gap: 16px; align-items: center;
        padding: 14px 16px;
        background: #fff;
        border: 1px solid var(--ytg-border);
        border-radius: 12px;
        text-decoration: none;
        color: inherit;
        transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
      }
      .yts-row:hover {
        transform: translateY(-1px);
        box-shadow: var(--ytg-shadow-sm);
        border-color: rgba(229,48,42,0.30);
      }
      .yts-row-rank {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 14px; font-weight: 800; letter-spacing: -0.4px;
        color: var(--ytg-text-3);
        font-variant-numeric: tabular-nums;
        text-align: center;
      }
      .yts-row-rank.top3 { color: var(--ytg-accent); }
      .yts-row-thumb {
        width: 56px; height: 56px; border-radius: 50%;
        object-fit: cover; flex-shrink: 0;
        background: #f0f0f4;
      }
      .yts-row-name {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 15px; font-weight: 700; color: var(--ytg-text);
        letter-spacing: -0.2px; line-height: 1.25;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .yts-row-meta {
        font-size: 12px; color: var(--ytg-text-3);
        font-weight: 500; margin-top: 3px;
        font-variant-numeric: tabular-nums;
      }
      .yts-row-subs {
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 16px; font-weight: 800; color: var(--ytg-text);
        letter-spacing: -0.4px;
        font-variant-numeric: tabular-nums;
        text-align: right;
      }
      .yts-row-subs-label {
        font-size: 10.5px; color: var(--ytg-text-3);
        font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
        margin-top: 2px;
      }

      @media (max-width: 720px) {
        .yts-row { grid-template-columns: 22px 44px minmax(0, 1fr) auto; gap: 12px; padding: 12px 14px; }
        .yts-row-thumb { width: 44px; height: 44px; }
        .yts-row-name { font-size: 14px; }
        .yts-row-subs { font-size: 14px; }
        .yts-row-meta { font-size: 11px; }
      }

      .yts-faq-answer {
        display: grid; grid-template-rows: 0fr; opacity: 0;
        transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
      }
      .yts-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .yts-faq-answer-inner { overflow: hidden; }

      @media (max-width: 768px) {
        .yts-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .yts-cta-pad { padding: 70px 24px !important; }
      }
    `,document.head.appendChild(t)},[])}function f({children:e}){return(0,s.jsxs)(`div`,{className:`yts-eyebrow`,children:[(0,s.jsx)(`span`,{"aria-hidden":`true`,className:`yts-eyebrow-dot`}),(0,s.jsx)(`span`,{className:`yts-eyebrow-text`,children:e})]})}function p(e){return!e&&e!==0?`—`:e>=1e9?(e/1e9).toFixed(1).replace(/\.0$/,``)+`B`:e>=1e6?(e/1e6).toFixed(1).replace(/\.0$/,``)+`M`:e>=1e3?(e/1e3).toFixed(1).replace(/\.0$/,``)+`K`:e.toLocaleString()}function m(e){return e?e>=1e9?(e/1e9).toFixed(1).replace(/\.0$/,``)+`B views`:e>=1e6?(e/1e6).toFixed(1).replace(/\.0$/,``)+`M views`:e>=1e3?(e/1e3).toFixed(1).replace(/\.0$/,``)+`K views`:e.toLocaleString()+` views`:null}function h(e){return e?e>=1e3?(e/1e3).toFixed(1).replace(/\.0$/,``)+`K videos`:e+` videos`:null}function g(e){if(!e)return null;let t=Math.floor((Date.now()-new Date(e).getTime())/1e3);return t<60?`just now`:t<3600?`${Math.floor(t/60)}m ago`:t<86400?`${Math.floor(t/3600)}h ago`:`${Math.floor(t/86400)}d ago`}function _(){d();let{isMobile:e}=u(),[t,n]=(0,o.useState)(null),[_,v]=(0,o.useState)(0);(0,o.useEffect)(()=>{document.title=`Top YouTube Channels by Category 2026: Live Subscriber Rankings | YTGrowth`;let e=document.querySelector(`meta[name="description"]`)||(()=>{let e=document.createElement(`meta`);return e.name=`description`,document.head.appendChild(e),e})();e.content=`Browse the top YouTube channels in 14 niches: gaming, tech, beauty, finance, fitness, music, and more. Ranked by live subscriber count from YouTube's official API. Updated daily, free, no signup.`},[]),(0,o.useEffect)(()=>{fetch(`/api/top-channels`).then(e=>e.ok?e.json():null).then(e=>{e&&n(e)}).catch(()=>{})},[]);let y=(0,o.useMemo)(()=>t?.groups?c.map(e=>({meta:e,rows:(t.groups[e.id]||[]).slice(0,15)})).filter(e=>e.rows.length>0):[],[t]),b=(0,o.useMemo)(()=>y.reduce((e,t)=>e+t.rows.length,0),[y]);return(0,s.jsxs)(`div`,{style:{fontFamily:`'Inter', system-ui, sans-serif`,background:`var(--ytg-bg)`,color:`var(--ytg-text)`,overflowX:`hidden`},children:[(0,s.jsx)(i,{}),(0,s.jsx)(a,{items:l}),(0,s.jsxs)(`section`,{className:`yts-section-pad`,style:{position:`relative`,padding:e?`64px 24px 48px`:`110px 48px 72px`,textAlign:`center`,background:`#ffffff`,overflow:`hidden`},children:[(0,s.jsx)(`div`,{"aria-hidden":`true`,style:{position:`absolute`,top:0,left:`50%`,transform:`translateX(-50%)`,width:`120vw`,maxWidth:1400,height:620,background:`radial-gradient(ellipse at center top, rgba(229,48,42,0.07) 0%, rgba(229,48,42,0.02) 40%, transparent 70%)`,pointerEvents:`none`,zIndex:0}}),(0,s.jsxs)(`div`,{style:{maxWidth:1e3,margin:`0 auto`,position:`relative`,zIndex:1,animation:`ytsFadeUp 0.5s ease both`},children:[(0,s.jsx)(f,{children:`Free resource`}),(0,s.jsxs)(`h1`,{style:{fontFamily:`'DM Sans', system-ui, sans-serif`,fontWeight:800,fontSize:e?34:60,lineHeight:e?1.1:1.04,letterSpacing:e?`-0.6px`:`-2.2px`,color:`var(--ytg-text)`,marginBottom:22,textWrap:`balance`},children:[`Top YouTube channels, `,(0,s.jsx)(`span`,{style:{color:`var(--ytg-accent)`},children:`ranked by live data.`})]}),(0,s.jsxs)(`p`,{style:{fontFamily:`'DM Sans', system-ui, sans-serif`,fontSize:e?16:19,color:`var(--ytg-text-2)`,lineHeight:1.7,maxWidth:660,margin:`0 auto 28px`,textWrap:`pretty`},children:[`Browse the biggest channels in `,c.length,` niches, pulled directly from YouTube's API and ranked by real subscriber count. Refreshed every 24 hours, free to read, no signup.`]}),(0,s.jsxs)(`div`,{style:{display:`inline-flex`,gap:e?16:32,alignItems:`center`,flexWrap:`wrap`,justifyContent:`center`,padding:`12px 22px`,background:`#fff`,border:`1px solid var(--ytg-border)`,borderRadius:100,boxShadow:`var(--ytg-shadow-sm)`},children:[(0,s.jsxs)(`div`,{style:{display:`flex`,alignItems:`baseline`,gap:6},children:[(0,s.jsx)(`span`,{style:{fontFamily:`'DM Sans', system-ui, sans-serif`,fontSize:16,fontWeight:800,color:`var(--ytg-text)`,letterSpacing:`-0.4px`},children:c.length}),(0,s.jsx)(`span`,{style:{fontSize:12,color:`var(--ytg-text-3)`,fontWeight:600,letterSpacing:`0.04em`,textTransform:`uppercase`},children:`categories`})]}),(0,s.jsx)(`span`,{style:{width:1,height:14,background:`var(--ytg-border)`}}),(0,s.jsxs)(`div`,{style:{display:`flex`,alignItems:`baseline`,gap:6},children:[(0,s.jsx)(`span`,{style:{fontFamily:`'DM Sans', system-ui, sans-serif`,fontSize:16,fontWeight:800,color:`var(--ytg-text)`,letterSpacing:`-0.4px`},children:b||`700+`}),(0,s.jsx)(`span`,{style:{fontSize:12,color:`var(--ytg-text-3)`,fontWeight:600,letterSpacing:`0.04em`,textTransform:`uppercase`},children:`channels`})]}),t?.fetched_at&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(`span`,{style:{width:1,height:14,background:`var(--ytg-border)`}}),(0,s.jsxs)(`div`,{style:{display:`inline-flex`,alignItems:`center`,gap:6},children:[(0,s.jsx)(`span`,{style:{width:6,height:6,borderRadius:`50%`,background:`#16a34a`,boxShadow:`0 0 0 3px rgba(22,163,74,0.18)`}}),(0,s.jsxs)(`span`,{style:{fontSize:12,color:`var(--ytg-text-3)`,fontWeight:600},children:[`updated `,g(t.fetched_at)]})]})]})]})]})]}),(0,s.jsx)(`section`,{className:`yts-section-pad`,style:{padding:e?`8px 20px 40px`:`8px 48px 56px`,background:`#fff`},children:(0,s.jsx)(`div`,{style:{maxWidth:1100,margin:`0 auto`},children:(0,s.jsx)(`div`,{className:`yts-jump-row`,children:c.map(e=>(0,s.jsx)(`a`,{href:`#${e.id}`,className:`yts-jump-chip`,children:e.label},e.id))})})}),(0,s.jsx)(`section`,{className:`yts-section-pad`,style:{padding:e?`32px 20px 64px`:`48px 48px 96px`,background:`var(--ytg-bg)`},children:(0,s.jsxs)(`div`,{style:{maxWidth:1100,margin:`0 auto`,display:`flex`,flexDirection:`column`,gap:e?56:80},children:[y.length===0&&(0,s.jsxs)(`div`,{style:{background:`#fff`,border:`1px solid var(--ytg-border)`,borderRadius:16,padding:e?32:56,textAlign:`center`,boxShadow:`var(--ytg-shadow-sm)`},children:[(0,s.jsx)(`p`,{style:{fontFamily:`'DM Sans', system-ui, sans-serif`,fontSize:e?22:28,fontWeight:800,color:`var(--ytg-text)`,letterSpacing:`-0.6px`,marginBottom:10},children:`Loading the leaderboard…`}),(0,s.jsx)(`p`,{style:{fontSize:14,color:`var(--ytg-text-2)`,maxWidth:460,margin:`0 auto`,lineHeight:1.6},children:`If this hangs, the daily refresh hasn't fired yet. Reload in a minute and it'll appear.`})]}),y.map(({meta:t,rows:n})=>(0,s.jsxs)(`div`,{id:t.id,style:{scrollMarginTop:84},children:[(0,s.jsxs)(`div`,{style:{marginBottom:22},children:[(0,s.jsxs)(`div`,{style:{display:`flex`,alignItems:`baseline`,gap:12,flexWrap:`wrap`,marginBottom:8},children:[(0,s.jsxs)(`h2`,{style:{fontFamily:`'DM Sans', system-ui, sans-serif`,fontWeight:800,fontSize:e?26:34,letterSpacing:`-1.1px`,color:`var(--ytg-text)`,lineHeight:1.1},children:[`Top `,t.label,` channels`]}),(0,s.jsxs)(`span`,{style:{fontSize:12,fontWeight:700,color:`var(--ytg-text-3)`,letterSpacing:`0.06em`,textTransform:`uppercase`},children:[n.length,` channels`]})]}),(0,s.jsx)(`p`,{style:{fontSize:15,color:`var(--ytg-text-2)`,lineHeight:1.6,maxWidth:700},children:t.blurb})]}),(0,s.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:8},children:n.map((e,t)=>{let n=t+1,r=e.handle?`https://www.youtube.com/@${e.handle}`:e.channel_id?`https://www.youtube.com/channel/${e.channel_id}`:`#`,i=[m(e.total_views),h(e.video_count)].filter(Boolean).join(` · `);return(0,s.jsxs)(`a`,{href:r,target:`_blank`,rel:`noopener noreferrer`,className:`yts-row`,children:[(0,s.jsxs)(`span`,{className:`yts-row-rank${n<=3?` top3`:``}`,children:[`#`,n]}),e.thumbnail?(0,s.jsx)(`img`,{src:e.thumbnail,alt:``,className:`yts-row-thumb`,loading:`lazy`}):(0,s.jsx)(`div`,{className:`yts-row-thumb`,style:{display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:20,fontWeight:700,color:`var(--ytg-text-2)`},children:(e.title||`?`).charAt(0).toUpperCase()}),(0,s.jsxs)(`div`,{style:{minWidth:0},children:[(0,s.jsx)(`div`,{className:`yts-row-name`,children:e.title}),i&&(0,s.jsx)(`div`,{className:`yts-row-meta`,children:i})]}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`div`,{className:`yts-row-subs`,children:p(e.subscribers)}),(0,s.jsx)(`div`,{className:`yts-row-subs-label`,children:`subs`})]})]},e.channel_id||n)})})]},t.id))]})}),(0,s.jsxs)(`section`,{className:`yts-section-pad yts-cta-pad`,style:{padding:e?`88px 24px`:`120px 48px`,background:`#0d0d12`,borderTop:`1px solid rgba(255,255,255,0.07)`,position:`relative`,overflow:`hidden`},children:[(0,s.jsx)(`div`,{"aria-hidden":`true`,style:{position:`absolute`,top:`42%`,left:`50%`,transform:`translate(-50%,-50%)`,width:1e3,height:e?600:800,background:`radial-gradient(ellipse, rgba(229,48,42,0.20) 0%, transparent 65%)`,pointerEvents:`none`}}),(0,s.jsxs)(`div`,{style:{maxWidth:820,margin:`0 auto`,textAlign:`center`,position:`relative`,zIndex:1},children:[(0,s.jsxs)(`div`,{style:{display:`inline-flex`,alignItems:`center`,gap:8,background:`rgba(255,255,255,0.04)`,border:`1px solid rgba(255,255,255,0.10)`,borderRadius:100,padding:`5px 12px 5px 10px`,marginBottom:22},children:[(0,s.jsx)(`span`,{"aria-hidden":`true`,style:{width:6,height:6,borderRadius:`50%`,background:`#ff3b30`,boxShadow:`0 0 0 3px rgba(229,48,42,0.18)`}}),(0,s.jsx)(`span`,{style:{fontSize:11,fontWeight:700,color:`rgba(255,255,255,0.78)`,textTransform:`uppercase`,letterSpacing:`0.09em`},children:`Free AI audit`})]}),(0,s.jsxs)(`h2`,{style:{fontFamily:`'DM Sans', system-ui, sans-serif`,fontWeight:800,fontSize:e?32:48,letterSpacing:`-1.5px`,color:`#ffffff`,lineHeight:1.06,marginBottom:16,textWrap:`balance`},children:[`Studying competitors? `,(0,s.jsx)(`span`,{style:{color:`#ff3b30`},children:`Stop guessing your own channel.`})]}),(0,s.jsx)(`p`,{style:{fontFamily:`'DM Sans', system-ui, sans-serif`,fontSize:e?16:19,color:`rgba(255,255,255,0.68)`,lineHeight:1.7,marginBottom:32,maxWidth:560,marginLeft:`auto`,marginRight:`auto`},children:`Connect your channel to YTGrowth for a free AI audit. See where you sit against the leaders in your niche, and what to fix first to close the gap.`}),(0,s.jsx)(`a`,{href:`/auth/login`,className:`yts-btn yts-btn-lg`,children:`Get my free audit →`}),(0,s.jsx)(`p`,{style:{fontSize:13,color:`rgba(255,255,255,0.42)`,marginTop:16},children:`Free forever plan · no card · 3 audits per month`})]})]}),(0,s.jsxs)(`div`,{style:{background:`#f4f4f6`,borderTop:`1px solid rgba(10,10,15,0.08)`,borderBottom:`1px solid rgba(10,10,15,0.08)`,padding:e?`60px 20px`:`110px 64px`,position:`relative`,overflow:`hidden`},children:[(0,s.jsx)(`div`,{"aria-hidden":`true`,style:{position:`absolute`,top:`-10%`,left:`-5%`,width:700,height:600,background:`radial-gradient(ellipse, rgba(229,48,42,0.06) 0%, transparent 60%)`,pointerEvents:`none`}}),(0,s.jsxs)(`div`,{style:{maxWidth:1160,margin:`0 auto`,position:`relative`,zIndex:1,display:`grid`,gridTemplateColumns:e?`1fr`:`340px 1fr`,gap:e?40:88,alignItems:`start`},children:[(0,s.jsxs)(`div`,{style:{textAlign:e?`center`:`left`},children:[(0,s.jsx)(f,{children:`Frequently asked`}),(0,s.jsxs)(`h2`,{style:{fontFamily:`'DM Sans', system-ui, sans-serif`,fontWeight:800,fontSize:e?32:48,letterSpacing:`-1.5px`,color:`var(--ytg-text)`,lineHeight:1.05,marginBottom:14,textWrap:`balance`},children:[`How this `,(0,s.jsx)(`span`,{style:{color:`var(--ytg-accent)`},children:`data works.`})]}),(0,s.jsxs)(`p`,{style:{fontSize:15,color:`var(--ytg-text-2)`,lineHeight:1.7,margin:0,maxWidth:e?520:320,marginLeft:e?`auto`:0,marginRight:e?`auto`:0},children:[`Where the rankings come from, how often they update, and what's coming next. Still curious? `,(0,s.jsx)(`a`,{href:`/contact`,style:{color:`var(--ytg-accent)`,fontWeight:600,textDecoration:`none`},children:`Get in touch.`})]})]}),(0,s.jsx)(`div`,{style:{borderTop:`1px solid rgba(10,10,15,0.10)`},children:l.map((t,n)=>{let r=_===n,i=String(n+1).padStart(2,`0`);return(0,s.jsxs)(`div`,{style:{borderBottom:`1px solid rgba(10,10,15,0.10)`,position:`relative`},children:[r&&(0,s.jsx)(`div`,{"aria-hidden":`true`,style:{position:`absolute`,left:0,top:6,bottom:6,width:2,background:`var(--ytg-accent)`,borderRadius:2}}),(0,s.jsxs)(`div`,{onClick:()=>v(r?null:n),role:`button`,tabIndex:0,onKeyDown:e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),v(r?null:n))},style:{display:`flex`,alignItems:`flex-start`,gap:e?14:20,padding:e?`20px 0`:`24px 0`,paddingLeft:r?e?16:22:0,cursor:`pointer`,transition:`padding-left 0.25s ease`,userSelect:`none`},children:[(0,s.jsx)(`span`,{style:{fontSize:e?12:13,fontWeight:700,color:r?`var(--ytg-accent)`:`var(--ytg-text-3)`,fontVariantNumeric:`tabular-nums`,lineHeight:1.5,flexShrink:0,width:e?22:28,paddingTop:2,transition:`color 0.2s`},children:i}),(0,s.jsx)(`span`,{style:{flex:1,fontSize:e?15:16,fontWeight:600,color:`var(--ytg-text)`,lineHeight:1.45,letterSpacing:`-0.2px`},children:t.q}),(0,s.jsx)(`span`,{"aria-hidden":`true`,style:{width:28,height:28,borderRadius:`50%`,flexShrink:0,display:`flex`,alignItems:`center`,justifyContent:`center`,background:r?`var(--ytg-accent)`:`rgba(10,10,15,0.05)`,border:`1px solid ${r?`var(--ytg-accent)`:`rgba(10,10,15,0.10)`}`,transition:`background 0.2s, border-color 0.2s`,marginTop:1},children:(0,s.jsxs)(`svg`,{width:`10`,height:`10`,viewBox:`0 0 10 10`,fill:`none`,children:[(0,s.jsx)(`path`,{d:`M1 5h8`,stroke:r?`#ffffff`:`var(--ytg-text-2)`,strokeWidth:`1.8`,strokeLinecap:`round`}),!r&&(0,s.jsx)(`path`,{d:`M5 1v8`,stroke:`var(--ytg-text-2)`,strokeWidth:`1.8`,strokeLinecap:`round`})]})})]}),(0,s.jsx)(`div`,{className:`yts-faq-answer${r?` open`:``}`,children:(0,s.jsx)(`div`,{className:`yts-faq-answer-inner`,children:(0,s.jsx)(`div`,{style:{paddingLeft:e?36:48,paddingRight:e?40:48,paddingBottom:e?22:26},children:(0,s.jsx)(`p`,{style:{fontSize:e?14:15,color:`var(--ytg-text-2)`,lineHeight:1.72,margin:0},dangerouslySetInnerHTML:{__html:t.a}})})})})]},n)})})]})]}),(0,s.jsx)(r,{})]})}export{_ as default};