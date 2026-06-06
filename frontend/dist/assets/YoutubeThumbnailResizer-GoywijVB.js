import{r as e}from"./chunk-DECur_0Z.js";import{n as t,t as n}from"./jsx-runtime-CP2iHdEU.js";import"./BrandLockup-DYLf7yyr.js";import{t as r}from"./LandingFooter-DQftyLvA.js";import{t as i}from"./SiteHeader-CWSSlVVP.js";import{t as a}from"./FaqSchema-6pGC9OLo.js";var o=e(t(),1),s=n(),c=[{id:`hd`,label:`HD`,sub:`1280×720`,w:1280,h:720,badge:`720p`,recommended:!0,cap:2*1024*1024,note:`YouTube's recommended thumbnail size. Auto-fits under the 2 MB upload cap.`},{id:`fullhd`,label:`Full HD`,sub:`1920×1080`,w:1920,h:1080,badge:`1080p`,cap:null,note:`Higher detail for blog use, channel banner crops, or social previews.`},{id:`4k`,label:`4K Ultra HD`,sub:`3840×2160`,w:3840,h:2160,badge:`2160p`,cap:null,note:`Future-proof archival quality. Best for source files you re-export from later.`}];function l(){let[e,t]=(0,o.useState)(typeof window<`u`?window.innerWidth:1280);return(0,o.useEffect)(()=>{let e=()=>t(window.innerWidth);return window.addEventListener(`resize`,e),()=>window.removeEventListener(`resize`,e)},[]),{isMobile:e<=768,isTablet:e<=1024}}function u(){(0,o.useEffect)(()=>{if(document.getElementById(`ytr-styles`))return;let e=document.createElement(`link`);e.id=`ytr-font`,e.rel=`stylesheet`,e.href=`https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap`,document.head.appendChild(e);let t=document.createElement(`style`);t.id=`ytr-styles`,t.textContent=`
      :root {
        --ytg-bg:           #f4f4f6;
        --ytg-bg-2:         #ecedf1;
        --ytg-bg-3:         #e6e7ec;
        --ytg-text:         #0a0a0f;
        --ytg-text-2:       rgba(10,10,15,0.62);
        --ytg-text-3:       rgba(10,10,15,0.40);
        --ytg-text-4:       rgba(10,10,15,0.30);
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
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 12px; height: 12px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background-color: rgba(10,10,15,0.28); border-radius: 10px; border: 3px solid transparent; background-clip: content-box; }
      ::-webkit-scrollbar-thumb:hover { background-color: rgba(10,10,15,0.48); background-clip: content-box; }
      @keyframes ytrFadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .ytr-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
        padding: 14px 28px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px; white-space: nowrap;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .ytr-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,48,42,0.42); }
      .ytr-btn-lg { font-size: 16px; padding: 17px 36px; }
      .ytr-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; filter: none !important; }

      .ytr-btn-ghost {
        display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        background: transparent; color: var(--ytg-text-2);
        font-size: 13px; font-weight: 600; font-family: 'Inter', system-ui, sans-serif;
        padding: 9px 16px; border-radius: 100px;
        border: 1px solid var(--ytg-border);
        cursor: pointer; text-decoration: none; letter-spacing: -0.1px;
        transition: color 0.15s, border-color 0.15s, background 0.15s;
      }
      .ytr-btn-ghost:hover { color: var(--ytg-text); border-color: var(--ytg-text-3); background: rgba(10,10,15,0.02); }

      .ytr-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        background: #ffffff; border: 1px solid rgba(10,10,15,0.09);
        border-radius: 100px; padding: 5px 12px 5px 10px; margin-bottom: 22px;
        box-shadow: 0 1px 2px rgba(10,10,15,0.04);
      }
      .ytr-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ytg-accent); box-shadow: 0 0 0 3px rgba(229,48,42,0.12); }
      .ytr-eyebrow-text { font-size: 11px; font-weight: 700; color: var(--ytg-text-2); text-transform: uppercase; letter-spacing: 0.09em; }

      .ytr-h1 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -2px; line-height: 1.05; text-wrap: balance; }
      .ytr-h2 { font-family: 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -1.4px; line-height: 1.08; text-wrap: balance; }

      /* Drop zone */
      .ytr-drop {
        border: 2px dashed var(--ytg-border);
        background: var(--ytg-card);
        border-radius: 18px;
        padding: 56px 32px;
        text-align: center;
        transition: border-color 0.18s, background 0.18s;
        cursor: pointer;
        position: relative;
      }
      .ytr-drop.drag {
        border-color: var(--ytg-accent);
        background: var(--ytg-accent-light);
      }
      .ytr-drop:hover { border-color: var(--ytg-text-3); }

      /* Preset selector */
      .ytr-presets {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
        margin-bottom: 18px;
      }
      .ytr-preset {
        position: relative;
        cursor: pointer;
        background: var(--ytg-card);
        border: 1.5px solid var(--ytg-border);
        border-radius: 12px;
        padding: 14px 14px 13px;
        text-align: left;
        transition: border-color 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .ytr-preset:hover { border-color: var(--ytg-text-3); transform: translateY(-1px); }
      .ytr-preset.active {
        border-color: var(--ytg-accent);
        background: linear-gradient(0deg, rgba(229,48,42,0.04), rgba(229,48,42,0.04)), var(--ytg-card);
        box-shadow: 0 0 0 3px rgba(229,48,42,0.10);
      }
      .ytr-preset-label { font-size: 14px; font-weight: 800; color: var(--ytg-text); letter-spacing: -0.2px; }
      .ytr-preset-sub   { font-size: 12px; color: var(--ytg-text-2); margin-top: 2px; font-variant-numeric: tabular-nums; }
      .ytr-preset-badge {
        position: absolute; top: 10px; right: 10px;
        font-size: 10px; font-weight: 800; letter-spacing: 0.04em;
        color: var(--ytg-text-3);
        background: var(--ytg-bg-2);
        border-radius: 6px;
        padding: 2px 6px;
      }
      .ytr-preset.active .ytr-preset-badge { color: var(--ytg-accent-text); background: var(--ytg-accent-light); }
      .ytr-preset-rec {
        position: absolute; top: -8px; left: 14px;
        font-size: 9.5px; font-weight: 800; letter-spacing: 0.08em;
        color: #fff;
        background: var(--ytg-accent);
        border-radius: 6px;
        padding: 2px 7px;
        text-transform: uppercase;
      }

      /* Quality slider */
      .ytr-quality {
        display: flex; align-items: center; gap: 14px;
        margin-top: 10px;
        padding: 12px 14px;
        background: var(--ytg-bg-2);
        border-radius: 10px;
      }
      .ytr-quality-label { font-size: 12px; font-weight: 700; color: var(--ytg-text-2); letter-spacing: -0.05px; min-width: 72px; }
      .ytr-quality input[type="range"] {
        flex: 1; height: 4px; appearance: none; background: rgba(10,10,15,0.12); border-radius: 4px; outline: none;
      }
      .ytr-quality input[type="range"]::-webkit-slider-thumb {
        appearance: none; width: 16px; height: 16px; border-radius: 50%;
        background: var(--ytg-accent); cursor: pointer;
        box-shadow: 0 1px 3px rgba(0,0,0,0.20);
      }
      .ytr-quality input[type="range"]::-moz-range-thumb {
        width: 16px; height: 16px; border-radius: 50%; border: 0;
        background: var(--ytg-accent); cursor: pointer;
        box-shadow: 0 1px 3px rgba(0,0,0,0.20);
      }
      .ytr-quality-value { font-size: 12.5px; font-weight: 700; color: var(--ytg-text); min-width: 40px; text-align: right; font-variant-numeric: tabular-nums; }

      /* Result card */
      .ytr-result-card {
        background: var(--ytg-card);
        border: 1px solid var(--ytg-border);
        border-radius: 18px;
        box-shadow: var(--ytg-shadow-lg);
        overflow: hidden;
      }
      .ytr-result-canvas-wrap {
        width: 100%;
        aspect-ratio: 16/9;
        background: #0a0a0f;
        display: flex; align-items: center; justify-content: center;
      }
      .ytr-result-canvas-wrap canvas { width: 100%; height: 100%; object-fit: contain; }

      /* Format toggle */
      .ytr-format-toggle {
        display: inline-flex;
        background: var(--ytg-bg-2);
        border-radius: 100px;
        padding: 3px;
      }
      .ytr-format-toggle button {
        appearance: none; background: transparent; border: 0; cursor: pointer;
        font-family: 'Inter', sans-serif;
        font-size: 12px; font-weight: 700;
        color: var(--ytg-text-2);
        padding: 6px 14px; border-radius: 100px;
        transition: background 0.15s, color 0.15s;
      }
      .ytr-format-toggle button.active {
        background: #ffffff; color: var(--ytg-text);
        box-shadow: 0 1px 2px rgba(10,10,15,0.10);
      }

      .ytr-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
      .ytr-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 18px; }

      .ytr-faq-answer {
        display: grid; grid-template-rows: 0fr; opacity: 0;
        transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
      }
      .ytr-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .ytr-faq-answer-inner { overflow: hidden; }

      @media (max-width: 900px) {
        .ytr-grid-3 { grid-template-columns: 1fr; }
        .ytr-grid-4 { grid-template-columns: 1fr 1fr; }
      }
      @media (max-width: 640px) {
        .ytr-grid-4 { grid-template-columns: 1fr; }
        .ytr-presets { grid-template-columns: 1fr; }
      }
      @media (max-width: 768px) {
        .ytr-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .ytr-drop { padding: 40px 20px; }
      }
    `,document.head.appendChild(t)},[])}function d(e){return new Promise((t,n)=>{let r=new FileReader;r.onload=e=>{let r=new Image;r.onload=()=>t(r),r.onerror=n,r.src=e.target.result},r.onerror=n,r.readAsDataURL(e)})}function f(e,t,n,r){let i=t.getContext(`2d`);t.width=n,t.height=r;let a=e.width/e.height,o=n/r,s=0,c=0,l=e.width,u=e.height;a>o?(l=e.height*o,s=(e.width-l)/2):a<o&&(u=e.width/o,c=(e.height-u)/2),i.fillStyle=`#000`,i.fillRect(0,0,n,r),i.imageSmoothingEnabled=!0,i.imageSmoothingQuality=`high`,i.drawImage(e,s,c,l,u,0,0,n,r)}function p(e,t,n,r){return new Promise(i=>{let a=t===`png`?`image/png`:`image/jpeg`;if(a===`image/png`){e.toBlob(e=>i({blob:e,quality:1}),a);return}let o=t=>{e.toBlob(e=>{if(!e){i({blob:null,quality:t});return}!r||e.size<=r||t<=.4?i({blob:e,quality:t}):o(Math.max(.4,t-.06))},a,t)};o(n)})}function m(e){return e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(2)} MB`}var h=[{q:`Why are there three resolution presets if YouTube only accepts 1280×720?`,a:(0,s.jsx)(s.Fragment,{children:`YouTube's official upload spec is 1280×720, but creators often need higher-resolution exports for other use cases. Full HD (1920×1080) is what most embed players and blog features want. 4K (3840×2160) is for archival masters you'll re-export from in a year when YouTube inevitably bumps the spec or you need a bigger crop. The HD preset is what you upload to YouTube. The other two cover everything else.`})},{q:`What does the 2 MB cap actually do?`,a:(0,s.jsx)(s.Fragment,{children:`YouTube silently rejects thumbnail uploads larger than 2 MB. Many tools quietly skip this check and you find out only when the upload fails. On the HD preset, this tool starts JPG quality at 92% and steps it down automatically until the file fits under 2 MB. You can override the auto-quality with the slider if you want to try a different point on the size/quality curve. Full HD and 4K presets don't enforce the cap because they're not for direct YouTube upload.`})},{q:`Is my image actually private?`,a:(0,s.jsx)(s.Fragment,{children:`Yes — verifiably. The entire resize runs in your browser via HTML5 Canvas. The image never touches our server, never gets logged, never gets stored anywhere. Open the Network tab in your browser's DevTools while you use the tool: you'll see zero outbound requests with image data. Drop in a private screenshot, a draft thumbnail, an internal mockup, anything. It stays on your device.`})},{q:`What happens if my source image isn't 16:9?`,a:(0,s.jsx)(s.Fragment,{children:`The tool center-crops to 16:9 before scaling. So a 1080×1080 Instagram square keeps its center subject and trims the sides. A 9:16 phone screenshot keeps the middle horizontal slice. If you need pixel-precise placement (like a face exactly in the right third of the frame), design your source at the target resolution in Canva, Figma, or Photoshop before uploading.`})},{q:`JPG or PNG. Which should I pick?`,a:(0,s.jsx)(s.Fragment,{children:`JPG for photographic content (real-world imagery, faces, product shots, gradients). 5–10× smaller than PNG and the quality loss is invisible at thumbnail sizes. PNG for graphic-heavy content (text overlays, illustrations, hard edges, transparency, screenshots of UIs). Lossless but bigger. The default is JPG because 95% of YouTube thumbnails benefit from it. The toggle is right next to the preset selector — no need to re-upload to switch.`})},{q:`Can I upscale a small source image to 4K?`,a:(0,s.jsx)(s.Fragment,{children:`You can, but the output won't actually be sharper than the source. The tool scales the pixels up using high-quality bilinear interpolation, but no algorithm can invent detail that wasn't there. If you upload a 640×360 thumbnail and pick the 4K preset, you'll get a 3840×2160 file that looks like a stretched 360p image. For genuinely higher detail, use a higher-resolution source.`})},{q:`Will the resized thumbnail rank better than my original?`,a:(0,s.jsxs)(s.Fragment,{children:[`The resize itself is a technical fix, not a CTR boost. What ranks thumbnails is composition, contrast, and the curiosity gap they create with the title. Once you have a properly sized thumbnail, the next move is scoring it against the top videos in your niche. `,(0,s.jsx)(`a`,{href:`/features/thumbnail-iq`,style:{color:`var(--ytg-accent)`,fontWeight:600},children:`Thumbnail IQ`}),` runs face detection, contrast analysis, and a vision-model curiosity-gap read so you know whether your design is competitive before you publish.`]})},{q:`Does this tool work offline?`,a:(0,s.jsx)(s.Fragment,{children:`Once the page is loaded, yes. Drop an image, switch presets, change quality, download — no network request happens after the initial page load. You can disconnect from the internet entirely and the tool keeps working.`})}];function g({q:e,a:t}){let[n,r]=(0,o.useState)(!1);return(0,s.jsxs)(`div`,{style:{borderBottom:`1px solid var(--ytg-border)`},children:[(0,s.jsxs)(`button`,{onClick:()=>r(e=>!e),style:{background:`none`,border:`none`,cursor:`pointer`,width:`100%`,textAlign:`left`,padding:`22px 0`,fontFamily:`inherit`,display:`flex`,justifyContent:`space-between`,alignItems:`flex-start`,gap:16,fontSize:16.5,fontWeight:700,color:`var(--ytg-text)`,letterSpacing:`-0.2px`,lineHeight:1.45},children:[(0,s.jsx)(`span`,{style:{flex:1},children:e}),(0,s.jsx)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.7`,strokeLinecap:`round`,style:{transform:n?`rotate(45deg)`:`none`,transition:`transform 0.2s`,flexShrink:0,color:n?`var(--ytg-accent)`:`var(--ytg-text-3)`,marginTop:4},children:(0,s.jsx)(`path`,{d:`M8 2v12M2 8h12`})})]}),(0,s.jsx)(`div`,{className:`ytr-faq-answer${n?` open`:``}`,children:(0,s.jsx)(`div`,{className:`ytr-faq-answer-inner`,children:(0,s.jsx)(`div`,{style:{fontSize:14.5,color:`var(--ytg-text-2)`,lineHeight:1.78,padding:`0 0 22px 0`,maxWidth:760},children:t})})})]})}function _(){u();let{isMobile:e}=l(),[t,n]=(0,o.useState)(!1),[_,v]=(0,o.useState)(!1),[y,b]=(0,o.useState)(``),[x,S]=(0,o.useState)(null),[C,w]=(0,o.useState)(`hd`),[T,E]=(0,o.useState)(`jpg`),[D,O]=(0,o.useState)(.92),[k,A]=(0,o.useState)(!0),j=(0,o.useRef)(null),M=(0,o.useRef)(null),N=(0,o.useRef)(null),P=(0,o.useRef)(null),F=(0,o.useMemo)(()=>c.find(e=>e.id===C)||c[0],[C]);(0,o.useEffect)(()=>{document.title=`YouTube Thumbnail Resizer 2026: Free Image & Size Converter | YTGrowth`;let e=document.querySelector(`meta[name="description"]`)||(()=>{let e=document.createElement(`meta`);return e.name=`description`,document.head.appendChild(e),e})();e.content=`Free YouTube thumbnail resizer and size converter. Resize any image or photo to HD (1280x720), Full HD, or 4K. Auto-fits under YouTube's 2MB cap, runs in your browser.`},[]);let I=(0,o.useCallback)(async(e,t,n,r,i,a)=>{v(!0),b(``);try{let o=M.current||document.createElement(`canvas`);f(e,o,n.w,n.h);let s=a?n.cap:null,{blob:c,quality:l}=await p(o,r,a?.92:i,s);if(!c)throw Error(`Could not encode the image. Try a different file.`);S({url:URL.createObjectURL(c),blob:c,format:r,quality:l,sourceName:t?.name||`image`,sourceSize:t?.size||0,originalDims:{w:e.width,h:e.height},preset:n})}catch(e){b(e.message||`Something went wrong while resizing.`)}finally{v(!1)}},[]),L=async e=>{if(e){if(!e.type.startsWith(`image/`)){b(`That doesn't look like an image. Try a JPG, PNG, GIF, or WebP.`);return}if(e.size>80*1024*1024){b(`File is over 80 MB. Pick a smaller source.`);return}b(``);try{let t=await d(e);N.current=t,P.current=e,await I(t,e,F,T,D,k)}catch{b(`Could not read that image. Try a different file.`)}}};(0,o.useEffect)(()=>{N.current&&I(N.current,P.current,F,T,D,k)},[C,T,D,k]);let R=e=>{e.preventDefault(),n(!1);let t=e.dataTransfer.files?.[0];t&&L(t)},z=e=>{e.preventDefault(),n(!0)},B=()=>n(!1),V=(0,o.useCallback)(e=>{let t=e.clipboardData?.items;if(t){for(let e of t)if(e.type.startsWith(`image/`)){let t=e.getAsFile();t&&L(t);break}}},[]);(0,o.useEffect)(()=>(window.addEventListener(`paste`,V),()=>window.removeEventListener(`paste`,V)),[V]);let H=()=>{if(!x)return;let e=document.createElement(`a`);e.href=x.url,e.download=`${(x.sourceName||`thumbnail`).replace(/\.[^.]+$/,``)}-${x.preset.w}x${x.preset.h}.${x.format===`png`?`png`:`jpg`}`,document.body.appendChild(e),e.click(),document.body.removeChild(e)},U=()=>{x?.url&&URL.revokeObjectURL(x.url),S(null),b(``),N.current=null,P.current=null,j.current&&(j.current.value=``)},W=(0,o.useMemo)(()=>{if(!x)return null;let{originalDims:e,preset:t}=x;return e.w<t.w||e.h<t.h?`Your source is ${e.w}×${e.h}. Scaling up to ${t.w}×${t.h} stretches pixels — the output won't be sharper than the source.`:null},[x]);return(0,s.jsxs)(`div`,{style:{background:`var(--ytg-bg)`,minHeight:`100vh`},children:[(0,s.jsx)(i,{}),(0,s.jsx)(a,{items:h}),(0,s.jsx)(`section`,{className:`ytr-section-pad`,style:{padding:e?`56px 24px 32px`:`88px 48px 48px`,textAlign:`center`,background:`#ffffff`},children:(0,s.jsxs)(`div`,{style:{maxWidth:880,margin:`0 auto`,animation:`ytrFadeUp 0.5s ease both`},children:[(0,s.jsxs)(`span`,{className:`ytr-eyebrow`,children:[(0,s.jsx)(`span`,{className:`ytr-eyebrow-dot`}),(0,s.jsx)(`span`,{className:`ytr-eyebrow-text`,children:`Free · Browser-based · Private`})]}),(0,s.jsxs)(`h1`,{className:`ytr-h1`,style:{fontSize:e?36:56,color:`var(--ytg-text)`,marginBottom:18},children:[`YouTube thumbnail resizer. `,(0,s.jsx)(`span`,{style:{color:`var(--ytg-accent)`},children:`HD, Full HD, 4K.`})]}),(0,s.jsx)(`p`,{style:{fontSize:e?16:18.5,color:`var(--ytg-text-2)`,lineHeight:1.7,maxWidth:720,margin:`0 auto 12px`},children:`Drop any image, pick a quality, and get a perfectly sized thumbnail. The HD preset auto-compresses under YouTube's 2 MB upload cap. Full HD and 4K give you higher-detail exports for blog use, channel banners, and archival.`}),(0,s.jsxs)(`p`,{style:{fontSize:13,color:`var(--ytg-text-3)`,maxWidth:720,margin:`0 auto`},children:[`Runs entirely in your browser using HTML5 Canvas. Your image never leaves your device. `,(0,s.jsx)(`a`,{href:`#privacy`,style:{color:`var(--ytg-text-2)`,textDecoration:`underline`},children:`How we know.`})]})]})}),(0,s.jsx)(`section`,{className:`ytr-section-pad`,style:{padding:e?`0 20px 64px`:`0 48px 88px`,background:`#ffffff`},children:(0,s.jsxs)(`div`,{style:{maxWidth:760,margin:`0 auto`},children:[(0,s.jsx)(`div`,{className:`ytr-presets`,children:c.map(e=>(0,s.jsxs)(`button`,{onClick:()=>w(e.id),className:`ytr-preset${C===e.id?` active`:``}`,"aria-pressed":C===e.id,children:[e.recommended&&(0,s.jsx)(`span`,{className:`ytr-preset-rec`,children:`Recommended`}),(0,s.jsx)(`div`,{className:`ytr-preset-label`,children:e.label}),(0,s.jsx)(`div`,{className:`ytr-preset-sub`,children:e.sub}),(0,s.jsx)(`span`,{className:`ytr-preset-badge`,children:e.badge})]},e.id))}),T===`jpg`&&(0,s.jsxs)(`div`,{className:`ytr-quality`,children:[(0,s.jsx)(`span`,{className:`ytr-quality-label`,children:`JPG quality`}),(0,s.jsx)(`input`,{type:`range`,min:`40`,max:`100`,step:`1`,value:Math.round(D*100),onChange:e=>{A(!1),O(parseInt(e.target.value,10)/100)}}),(0,s.jsxs)(`span`,{className:`ytr-quality-value`,children:[Math.round(D*100),`%`]}),(0,s.jsx)(`button`,{onClick:()=>{A(!0),O(.92)},className:`ytr-btn-ghost`,style:{padding:`6px 12px`,fontSize:11,marginLeft:6},title:F.cap?`Auto-step down to fit under 2 MB`:`Reset to 92%`,children:k?`Auto`:`Reset`})]}),(0,s.jsxs)(`div`,{style:{marginTop:18},children:[!x&&(0,s.jsxs)(`div`,{className:`ytr-drop${t?` drag`:``}`,onDrop:R,onDragOver:z,onDragLeave:B,onClick:()=>j.current?.click(),role:`button`,tabIndex:0,children:[(0,s.jsx)(`input`,{ref:j,type:`file`,accept:`image/*`,style:{display:`none`},onChange:e=>L(e.target.files?.[0])}),(0,s.jsx)(`div`,{style:{display:`inline-flex`,width:56,height:56,borderRadius:16,background:`var(--ytg-accent-light)`,alignItems:`center`,justifyContent:`center`,marginBottom:18},children:(0,s.jsxs)(`svg`,{width:`24`,height:`24`,viewBox:`0 0 24 24`,fill:`none`,stroke:`#e5302a`,strokeWidth:`1.6`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,s.jsx)(`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`}),(0,s.jsx)(`polyline`,{points:`17 8 12 3 7 8`}),(0,s.jsx)(`line`,{x1:`12`,y1:`3`,x2:`12`,y2:`15`})]})}),(0,s.jsx)(`p`,{style:{fontSize:17,fontWeight:700,color:`var(--ytg-text)`,marginBottom:6},children:`Drop an image, click to choose, or paste from clipboard`}),(0,s.jsxs)(`p`,{style:{fontSize:13.5,color:`var(--ytg-text-3)`},children:[`JPG, PNG, GIF, WebP, BMP · up to 80 MB · output: `,(0,s.jsxs)(`strong`,{style:{color:`var(--ytg-text-2)`},children:[F.label,` (`,F.sub,`)`]})]})]}),y&&(0,s.jsx)(`div`,{style:{marginTop:14,padding:`14px 18px`,background:`#fef2f2`,border:`1px solid #fecaca`,borderRadius:12,color:`#991b1b`,fontSize:14,fontWeight:500},children:y}),x&&(0,s.jsxs)(`div`,{style:{animation:`ytrFadeUp 0.4s ease both`},children:[(0,s.jsxs)(`div`,{className:`ytr-result-card`,children:[(0,s.jsx)(`div`,{className:`ytr-result-canvas-wrap`,children:(0,s.jsx)(`canvas`,{ref:M})}),(0,s.jsxs)(`div`,{style:{padding:`20px 24px`,display:`flex`,flexWrap:`wrap`,gap:14,justifyContent:`space-between`,alignItems:`center`},children:[(0,s.jsxs)(`div`,{style:{minWidth:0,textAlign:`left`},children:[(0,s.jsx)(`p`,{style:{fontSize:14,fontWeight:700,color:`var(--ytg-text)`,marginBottom:2,whiteSpace:`nowrap`,overflow:`hidden`,textOverflow:`ellipsis`,maxWidth:360},children:x.sourceName}),(0,s.jsxs)(`p`,{style:{fontSize:12.5,color:`var(--ytg-text-3)`},children:[x.originalDims.w,`×`,x.originalDims.h,` (`,m(x.sourceSize),`) → `,(0,s.jsxs)(`strong`,{style:{color:`var(--ytg-text-2)`},children:[x.preset.w,`×`,x.preset.h,` (`,m(x.blob.size),`)`]}),x.format===`jpg`&&(0,s.jsxs)(`span`,{children:[` · q`,Math.round(x.quality*100)]})]})]}),(0,s.jsxs)(`div`,{className:`ytr-format-toggle`,children:[(0,s.jsx)(`button`,{onClick:()=>E(`jpg`),className:T===`jpg`?`active`:``,children:`JPG`}),(0,s.jsx)(`button`,{onClick:()=>E(`png`),className:T===`png`?`active`:``,children:`PNG`})]})]})]}),W&&(0,s.jsxs)(`div`,{style:{marginTop:12,padding:`10px 14px`,background:`#fef3c7`,border:`1px solid #fde68a`,borderRadius:10,color:`#854d0e`,fontSize:13,fontWeight:500},children:[`⚠ `,W]}),x.preset.cap&&x.blob.size>x.preset.cap&&(0,s.jsxs)(`div`,{style:{marginTop:12,padding:`10px 14px`,background:`#fef3c7`,border:`1px solid #fde68a`,borderRadius:10,color:`#854d0e`,fontSize:13,fontWeight:500},children:[`⚠ `,m(x.blob.size),` is above YouTube's 2 MB cap. Switch to JPG, lower the quality slider, or pick a smaller preset.`]}),(0,s.jsxs)(`div`,{style:{display:`flex`,gap:12,justifyContent:`center`,flexWrap:`wrap`,marginTop:22},children:[(0,s.jsxs)(`button`,{onClick:H,className:`ytr-btn ytr-btn-lg`,disabled:_||!x.blob,children:[`Download `,x.preset.label,` `,x.format===`png`?`PNG`:`JPG`,` →`]}),(0,s.jsx)(`button`,{onClick:U,className:`ytr-btn-ghost`,style:{padding:`14px 22px`},children:`Resize another`})]})]})]})]})}),(0,s.jsx)(`section`,{className:`ytr-section-pad`,style:{padding:e?`64px 20px`:`96px 48px`,background:`var(--ytg-bg)`,borderTop:`1px solid var(--ytg-border)`},children:(0,s.jsxs)(`div`,{style:{maxWidth:1120,margin:`0 auto`},children:[(0,s.jsxs)(`div`,{style:{textAlign:`center`,maxWidth:720,margin:`0 auto 48px`},children:[(0,s.jsxs)(`span`,{className:`ytr-eyebrow`,children:[(0,s.jsx)(`span`,{className:`ytr-eyebrow-dot`}),(0,s.jsx)(`span`,{className:`ytr-eyebrow-text`,children:`Three presets, one tool`})]}),(0,s.jsxs)(`h2`,{className:`ytr-h2`,style:{fontSize:e?30:42,marginBottom:14,color:`var(--ytg-text)`},children:[`Pick the resolution your `,(0,s.jsx)(`span`,{style:{color:`var(--ytg-accent)`},children:`workflow needs.`})]}),(0,s.jsx)(`p`,{style:{fontSize:15,color:`var(--ytg-text-2)`,lineHeight:1.72},children:`YouTube's upload spec is 1280×720, but a thumbnail rarely lives in just one place. Embed players, blog hero images, channel banner crops, social previews — every destination wants something a little different. Three presets cover all of them.`})]}),(0,s.jsx)(`div`,{className:`ytr-grid-3`,children:c.map((e,t)=>(0,s.jsxs)(`div`,{style:{position:`relative`,background:`var(--ytg-card)`,borderRadius:18,border:`1px solid ${e.recommended?`rgba(229,48,42,0.20)`:`var(--ytg-border)`}`,boxShadow:e.recommended?`0 0 0 1px rgba(229,48,42,0.10), var(--ytg-shadow-sm)`:`var(--ytg-shadow-sm)`,padding:28},children:[e.recommended&&(0,s.jsx)(`span`,{style:{position:`absolute`,top:-10,left:28,fontSize:10,fontWeight:800,letterSpacing:`0.08em`,color:`#fff`,background:`var(--ytg-accent)`,borderRadius:6,padding:`3px 9px`,textTransform:`uppercase`},children:`For YouTube`}),(0,s.jsxs)(`div`,{style:{display:`flex`,alignItems:`baseline`,justifyContent:`space-between`,marginBottom:12},children:[(0,s.jsx)(`p`,{style:{fontSize:18,fontWeight:800,color:`var(--ytg-text)`,letterSpacing:`-0.4px`},children:e.label}),(0,s.jsx)(`p`,{style:{fontSize:11,fontWeight:800,color:`var(--ytg-text-3)`,letterSpacing:`0.08em`,fontFamily:`monospace`},children:e.badge.toUpperCase()})]}),(0,s.jsxs)(`p`,{style:{fontSize:28,fontWeight:800,fontFamily:`DM Sans, sans-serif`,color:`var(--ytg-text)`,letterSpacing:`-1px`,marginBottom:6,fontVariantNumeric:`tabular-nums`},children:[e.w,(0,s.jsx)(`span`,{style:{color:`var(--ytg-text-3)`},children:`×`}),e.h]}),(0,s.jsx)(`p`,{style:{fontSize:13,color:`var(--ytg-text-2)`,lineHeight:1.7,marginBottom:14},children:e.note}),(0,s.jsx)(`div`,{style:{paddingTop:14,borderTop:`1px solid var(--ytg-border)`,display:`flex`,alignItems:`center`,gap:8,fontSize:12,color:`var(--ytg-text-3)`},children:e.cap?(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(`span`,{style:{color:`var(--ytg-accent-text)`,fontWeight:700},children:`≤ 2 MB`}),` · auto-compressed for upload`]}):(0,s.jsx)(s.Fragment,{children:`No file-size cap · use as a master export`})})]},t))})]})}),(0,s.jsx)(`section`,{className:`ytr-section-pad`,style:{padding:e?`64px 20px`:`96px 48px`,background:`var(--ytg-bg-2)`,borderTop:`1px solid var(--ytg-border)`},children:(0,s.jsxs)(`div`,{style:{maxWidth:980,margin:`0 auto`},children:[(0,s.jsxs)(`div`,{style:{textAlign:`center`,maxWidth:720,margin:`0 auto 40px`},children:[(0,s.jsxs)(`span`,{className:`ytr-eyebrow`,children:[(0,s.jsx)(`span`,{className:`ytr-eyebrow-dot`}),(0,s.jsx)(`span`,{className:`ytr-eyebrow-text`,children:`YouTube spec`})]}),(0,s.jsxs)(`h2`,{className:`ytr-h2`,style:{fontSize:e?28:38,color:`var(--ytg-text)`},children:[`The numbers that `,(0,s.jsx)(`span`,{style:{color:`var(--ytg-accent)`},children:`actually matter`}),` on upload.`]})]}),(0,s.jsx)(`div`,{style:{background:`var(--ytg-card)`,borderRadius:18,border:`1px solid var(--ytg-border)`,boxShadow:`var(--ytg-shadow-sm)`,overflow:`hidden`},children:(0,s.jsxs)(`table`,{style:{width:`100%`,borderCollapse:`collapse`},children:[(0,s.jsx)(`thead`,{style:{background:`var(--ytg-bg)`},children:(0,s.jsxs)(`tr`,{children:[(0,s.jsx)(`th`,{style:{padding:`14px 22px`,textAlign:`left`,fontSize:11,fontWeight:800,letterSpacing:`0.08em`,textTransform:`uppercase`,color:`var(--ytg-text-3)`},children:`Field`}),(0,s.jsx)(`th`,{style:{padding:`14px 22px`,textAlign:`left`,fontSize:11,fontWeight:800,letterSpacing:`0.08em`,textTransform:`uppercase`,color:`var(--ytg-text-3)`},children:`YouTube requires`}),(0,s.jsx)(`th`,{style:{padding:`14px 22px`,textAlign:`left`,fontSize:11,fontWeight:800,letterSpacing:`0.08em`,textTransform:`uppercase`,color:`var(--ytg-text-3)`},children:`This tool ships`})]})}),(0,s.jsx)(`tbody`,{children:[{f:`Resolution`,y:`1280×720 recommended (640×360 minimum)`,t:`1280×720 exact (HD preset)`},{f:`Aspect ratio`,y:`16:9`,t:`16:9 (auto-cropped from any source)`},{f:`File size`,y:`Under 2 MB`,t:`Auto-fits under 2 MB on HD preset`},{f:`Format`,y:`JPG, PNG, GIF, BMP`,t:`JPG (default) or PNG`},{f:`Color space`,y:`sRGB`,t:`sRGB (default browser canvas)`}].map((e,t)=>(0,s.jsxs)(`tr`,{style:{borderTop:`1px solid var(--ytg-border)`},children:[(0,s.jsx)(`td`,{style:{padding:`16px 22px`,fontSize:14,fontWeight:700,color:`var(--ytg-text)`},children:e.f}),(0,s.jsx)(`td`,{style:{padding:`16px 22px`,fontSize:14,color:`var(--ytg-text-2)`,lineHeight:1.55},children:e.y}),(0,s.jsx)(`td`,{style:{padding:`16px 22px`,fontSize:14,color:`var(--ytg-accent-text)`,fontWeight:600,lineHeight:1.55},children:e.t})]},t))})]})})]})}),(0,s.jsx)(`section`,{id:`privacy`,className:`ytr-section-pad`,style:{padding:e?`64px 20px`:`96px 48px`,background:`var(--ytg-bg)`,borderTop:`1px solid var(--ytg-border)`},children:(0,s.jsxs)(`div`,{style:{maxWidth:1120,margin:`0 auto`},children:[(0,s.jsxs)(`div`,{style:{textAlign:`center`,maxWidth:720,margin:`0 auto 48px`},children:[(0,s.jsxs)(`span`,{className:`ytr-eyebrow`,children:[(0,s.jsx)(`span`,{className:`ytr-eyebrow-dot`}),(0,s.jsx)(`span`,{className:`ytr-eyebrow-text`,children:`Why this tool exists`})]}),(0,s.jsxs)(`h2`,{className:`ytr-h2`,style:{fontSize:e?30:42,marginBottom:14,color:`var(--ytg-text)`},children:[`Most resizers `,(0,s.jsx)(`span`,{style:{color:`var(--ytg-accent)`},children:`upload your image.`}),` This one doesn't.`]}),(0,s.jsx)(`p`,{style:{fontSize:15,color:`var(--ytg-text-2)`,lineHeight:1.72},children:`Search for a thumbnail resizer and you'll find dozens of sites that send your file to a server you don't control, log it, and serve you ads while you wait. Drafts, internal mockups, screenshots — none of that should leave your machine. This tool runs entirely on your device.`})]}),(0,s.jsx)(`div`,{className:`ytr-grid-4`,children:[{num:`01`,title:`Browser-based`,body:`Pure HTML5 Canvas. No backend, no server-side processing. Verifiable in your DevTools Network tab — zero outbound requests with image data.`},{num:`02`,title:`Three quality presets`,body:`HD for direct YouTube upload, Full HD for embeds and blogs, 4K for archival masters. One tool, three workflows.`},{num:`03`,title:`Auto-fits under 2 MB`,body:`On the HD preset, JPG quality steps down progressively until your file passes YouTube's upload cap. No more "thumbnail too large" errors.`},{num:`04`,title:`Works offline`,body:`Once the page is loaded, no internet needed. Drop, switch, download, repeat — the whole loop runs locally.`}].map((e,t)=>(0,s.jsxs)(`div`,{style:{background:`var(--ytg-card)`,borderRadius:16,border:`1px solid var(--ytg-border)`,boxShadow:`var(--ytg-shadow-sm)`,padding:26},children:[(0,s.jsx)(`p`,{style:{fontSize:12,fontWeight:800,color:`var(--ytg-accent)`,letterSpacing:`0.06em`,fontFamily:`monospace`,marginBottom:14},children:e.num}),(0,s.jsx)(`p`,{style:{fontSize:16,fontWeight:700,color:`var(--ytg-text)`,letterSpacing:`-0.3px`,marginBottom:8},children:e.title}),(0,s.jsx)(`p`,{style:{fontSize:13.5,color:`var(--ytg-text-2)`,lineHeight:1.68},children:e.body})]},t))})]})}),(0,s.jsx)(`section`,{style:{padding:e?`0 16px 0`:`0 48px 0`,background:`var(--ytg-bg-2)`,borderTop:`1px solid var(--ytg-border)`},children:(0,s.jsx)(`div`,{style:{maxWidth:980,margin:`0 auto`,paddingTop:e?56:88,paddingBottom:e?56:88},children:(0,s.jsxs)(`div`,{style:{borderRadius:e?18:24,border:`1px solid var(--ytg-border)`,boxShadow:`var(--ytg-shadow-lg)`,padding:e?`40px 24px 36px`:`64px 56px`,textAlign:`center`,background:`var(--ytg-card)`,position:`relative`,overflow:`hidden`},children:[(0,s.jsx)(`div`,{style:{position:`absolute`,top:-80,left:`50%`,transform:`translateX(-50%)`,width:460,height:220,background:`radial-gradient(ellipse, rgba(229,48,42,0.10) 0%, transparent 70%)`,pointerEvents:`none`}}),(0,s.jsxs)(`span`,{className:`ytr-eyebrow`,style:{position:`relative`},children:[(0,s.jsx)(`span`,{className:`ytr-eyebrow-dot`}),(0,s.jsx)(`span`,{className:`ytr-eyebrow-text`,children:`Next step`})]}),(0,s.jsxs)(`h2`,{className:`ytr-h2`,style:{fontSize:e?28:38,marginBottom:14,position:`relative`},children:[`Sized correctly is step one. `,(0,s.jsx)(`br`,{}),(0,s.jsx)(`span`,{style:{color:`var(--ytg-accent)`},children:`Sized to win the click is step two.`})]}),(0,s.jsx)(`p`,{style:{fontSize:e?14:16,color:`var(--ytg-text-2)`,lineHeight:1.7,maxWidth:580,margin:`0 auto 26px`,position:`relative`},children:`A 1280×720 thumbnail still has to earn the click. Score yours against the top videos in your niche on contrast, face presence, text density, and curiosity-gap signals.`}),(0,s.jsx)(`a`,{href:`/features/thumbnail-iq`,className:`ytr-btn ytr-btn-lg`,style:{position:`relative`},children:`Score it with Thumbnail IQ →`})]})})}),(0,s.jsx)(`section`,{className:`ytr-section-pad`,style:{padding:e?`64px 20px`:`96px 48px`,background:`var(--ytg-bg)`,borderTop:`1px solid var(--ytg-border)`},children:(0,s.jsxs)(`div`,{style:{maxWidth:880,margin:`0 auto`},children:[(0,s.jsxs)(`div`,{style:{textAlign:`center`,marginBottom:36},children:[(0,s.jsxs)(`span`,{className:`ytr-eyebrow`,children:[(0,s.jsx)(`span`,{className:`ytr-eyebrow-dot`}),(0,s.jsx)(`span`,{className:`ytr-eyebrow-text`,children:`Frequently asked`})]}),(0,s.jsxs)(`h2`,{className:`ytr-h2`,style:{fontSize:e?28:36,color:`var(--ytg-text)`},children:[`Questions `,(0,s.jsx)(`span`,{style:{color:`var(--ytg-accent)`},children:`answered.`})]})]}),(0,s.jsx)(`div`,{children:h.map((e,t)=>(0,s.jsx)(g,{q:e.q,a:e.a},t))})]})}),(0,s.jsx)(r,{})]})}export{_ as default};