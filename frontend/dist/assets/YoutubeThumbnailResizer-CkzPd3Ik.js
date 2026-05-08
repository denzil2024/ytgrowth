import{n as e}from"./chunk-B3K2TuZy.js";import{n as t,t as n}from"./jsx-runtime-BQXCR5OR.js";import{t as r}from"./LandingFooter-C-DUCDEz.js";import{t as i}from"./SiteHeader-DqXmu2gJ.js";var a=e(t(),1),o=n(),s=1280,c=720,l=2*1024*1024;function u(){let[e,t]=(0,a.useState)(typeof window<`u`?window.innerWidth:1280);return(0,a.useEffect)(()=>{let e=()=>t(window.innerWidth);return window.addEventListener(`resize`,e),()=>window.removeEventListener(`resize`,e)},[]),{isMobile:e<=768,isTablet:e<=1024}}function d(){(0,a.useEffect)(()=>{if(document.getElementById(`ytr-styles`))return;let e=document.createElement(`link`);e.id=`ytr-font`,e.rel=`stylesheet`,e.href=`https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap`,document.head.appendChild(e);let t=document.createElement(`style`);t.id=`ytr-styles`,t.textContent=`
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
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
        white-space: nowrap;
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
        border-radius: 100px; padding: 5px 12px 5px 10px; margin-bottom: 20px;
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

      .ytr-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }

      /* FAQ pattern matches Landing.jsx */
      .ytr-faq-answer {
        display: grid; grid-template-rows: 0fr; opacity: 0;
        transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
      }
      .ytr-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .ytr-faq-answer-inner { overflow: hidden; }

      @media (max-width: 900px) {
        .ytr-grid-3 { grid-template-columns: 1fr; }
      }
      @media (max-width: 768px) {
        .ytr-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .ytr-drop { padding: 40px 20px; }
      }
    `,document.head.appendChild(t)},[])}function f(e){return new Promise((t,n)=>{let r=new FileReader;r.onload=e=>{let r=new Image;r.onload=()=>t(r),r.onerror=n,r.src=e.target.result},r.onerror=n,r.readAsDataURL(e)})}function p(e,t){let n=t.getContext(`2d`);t.width=s,t.height=c;let r=e.width/e.height,i=s/c,a=0,o=0,l=e.width,u=e.height;r>i?(l=e.height*i,a=(e.width-l)/2):r<i&&(u=e.width/i,o=(e.height-u)/2),n.fillStyle=`#000`,n.fillRect(0,0,s,c),n.imageSmoothingEnabled=!0,n.imageSmoothingQuality=`high`,n.drawImage(e,a,o,l,u,0,0,s,c)}function m(e,t){return new Promise(n=>{let r=t===`png`?`image/png`:`image/jpeg`;if(r===`image/png`){e.toBlob(e=>n({blob:e,quality:1}),r);return}let i=t=>{e.toBlob(e=>{if(!e){n({blob:null,quality:t});return}e.size<=l||t<=.4?n({blob:e,quality:t}):i(t-.08)},r,t)};i(.92)})}function h(e){return e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(2)} MB`}var g=[{q:`What dimensions does YouTube actually require for thumbnails?`,a:(0,o.jsxs)(o.Fragment,{children:[`YouTube's official spec is `,(0,o.jsx)(`b`,{children:`1280x720 pixels`}),` (16:9 aspect ratio), under `,(0,o.jsx)(`b`,{children:`2MB`}),`, in JPG, GIF, BMP, or PNG. Anything smaller than 640x360 gets rejected. This tool always outputs exactly 1280x720, the recommended size that displays sharp on every device, from the mobile feed up to the YouTube TV app.`]})},{q:`Why does my final file have to be under 2MB?`,a:(0,o.jsx)(o.Fragment,{children:`It's a hard cap on the upload endpoint. Files larger than 2MB are silently rejected. JPG outputs from this tool start at 92% quality and step down automatically until the file fits, so you never have to think about it. PNG outputs preserve full quality but can sometimes exceed 2MB on photographic source material; if that happens, switch the output to JPG.`})},{q:`What happens if my image is not 16:9 to begin with?`,a:(0,o.jsx)(o.Fragment,{children:`The tool center-crops your image to a 16:9 region before scaling. So a square Instagram post or a vertical phone screenshot will keep its center subject and trim the edges. If you need pixel-precise positioning, design your source thumbnail at 1280x720 in Canva or Figma before uploading.`})},{q:`Is my image uploaded anywhere?`,a:(0,o.jsx)(o.Fragment,{children:`No. The entire resize runs in your browser using HTML5 Canvas. The image never leaves your device, never touches our servers, and is not stored anywhere. You can verify this by opening DevTools and checking the network tab while you use the tool.`})},{q:`JPG or PNG. Which should I pick?`,a:(0,o.jsx)(o.Fragment,{children:`JPG for photographic thumbnails (faces, product shots, real-world imagery). It compresses far smaller and the quality loss is invisible at 1280x720. PNG for graphic-heavy thumbnails (text overlays, illustrations, hard edges, transparency). It's lossless but can be 5 to 10 times larger. Default is JPG because 95% of YouTube thumbnails benefit from it.`})},{q:`Will the resized thumbnail rank better than my original?`,a:(0,o.jsxs)(o.Fragment,{children:[`The resize itself is a technical fix, not a CTR boost. What ranks thumbnails is composition, contrast, and the curiosity gap they create with the title. Once you have a properly sized thumbnail, the next move is scoring it against the top videos in your niche. `,(0,o.jsx)(`a`,{href:`/features/thumbnail-iq`,style:{color:`var(--ytg-accent)`,fontWeight:600},children:`Thumbnail IQ`}),` runs face detection, contrast analysis, and a vision-model curiosity-gap read so you know whether your design is competitive before you publish.`]})}];function _({q:e,a:t}){let[n,r]=(0,a.useState)(!1);return(0,o.jsxs)(`div`,{style:{borderBottom:`1px solid var(--ytg-border)`},children:[(0,o.jsxs)(`button`,{onClick:()=>r(e=>!e),style:{background:`none`,border:`none`,cursor:`pointer`,width:`100%`,textAlign:`left`,padding:`22px 0`,fontFamily:`inherit`,display:`flex`,justifyContent:`space-between`,alignItems:`flex-start`,gap:16,fontSize:16.5,fontWeight:700,color:`var(--ytg-text)`,letterSpacing:`-0.2px`,lineHeight:1.45},children:[(0,o.jsx)(`span`,{style:{flex:1},children:e}),(0,o.jsx)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.7`,strokeLinecap:`round`,style:{transform:n?`rotate(45deg)`:`none`,transition:`transform 0.2s`,flexShrink:0,color:n?`var(--ytg-accent)`:`var(--ytg-text-3)`,marginTop:4},children:(0,o.jsx)(`path`,{d:`M8 2v12M2 8h12`})})]}),(0,o.jsx)(`div`,{className:`ytr-faq-answer${n?` open`:``}`,children:(0,o.jsx)(`div`,{className:`ytr-faq-answer-inner`,children:(0,o.jsx)(`div`,{style:{fontSize:14.5,color:`var(--ytg-text-2)`,lineHeight:1.78,padding:`0 0 22px 0`,maxWidth:760},children:t})})})]})}function v(){d();let{isMobile:e}=u(),[t,n]=(0,a.useState)(!1),[s,c]=(0,a.useState)(!1),[v,y]=(0,a.useState)(``),[b,x]=(0,a.useState)(null),[S,C]=(0,a.useState)(`jpg`),w=(0,a.useRef)(null),T=(0,a.useRef)(null),E=(0,a.useRef)(null),D=(0,a.useRef)(``),O=(0,a.useRef)(0);(0,a.useEffect)(()=>{document.title=`Free YouTube Thumbnail Resizer (1280×720, under 2MB) — YTGrowth`;let e=document.querySelector(`meta[name="description"]`)||(()=>{let e=document.createElement(`meta`);return e.name=`description`,document.head.appendChild(e),e})();e.content=`Free YouTube thumbnail resizer. Drop any image and get an exact 1280x720 thumbnail under 2MB, ready to upload. 100% browser-based. JPG or PNG.`},[]);let k=(0,a.useCallback)(async(e,t,n,r)=>{c(!0),y(``);try{let i=T.current||document.createElement(`canvas`);p(e,i);let{blob:a,quality:o}=await m(i,r);if(!a)throw Error(`Could not encode the image. Try a different file.`);x({url:URL.createObjectURL(a),blob:a,format:r,quality:o,sourceName:t,sourceSize:n,originalDims:{w:e.width,h:e.height}})}catch(e){y(e.message||`Something went wrong while resizing.`)}finally{c(!1)}},[]),A=async e=>{if(e){if(!e.type.startsWith(`image/`)){y(`That does not look like an image. Try a JPG, PNG, GIF, or BMP.`);return}if(e.size>50*1024*1024){y(`File is over 50MB. Pick a smaller source image.`);return}y(``);try{let t=await f(e);E.current=t,D.current=e.name,O.current=e.size,await k(t,e.name,e.size,S)}catch{y(`Could not read that image. Try a different file.`)}}};(0,a.useEffect)(()=>{E.current&&k(E.current,D.current,O.current,S)},[S]);let j=e=>{e.preventDefault(),n(!1);let t=e.dataTransfer.files?.[0];t&&A(t)},M=e=>{e.preventDefault(),n(!0)},N=()=>n(!1),P=(0,a.useCallback)(e=>{let t=e.clipboardData?.items;if(t){for(let e of t)if(e.type.startsWith(`image/`)){let t=e.getAsFile();t&&A(t);break}}},[]);return(0,a.useEffect)(()=>(window.addEventListener(`paste`,P),()=>window.removeEventListener(`paste`,P)),[P]),(0,o.jsxs)(`div`,{style:{background:`var(--ytg-bg)`,minHeight:`100vh`},children:[(0,o.jsx)(i,{}),(0,o.jsxs)(`section`,{className:`ytr-section-pad`,style:{padding:e?`64px 24px 48px`:`88px 48px 64px`,textAlign:`center`,background:`#ffffff`},children:[(0,o.jsxs)(`div`,{style:{maxWidth:880,margin:`0 auto`,animation:`ytrFadeUp 0.5s ease both`},children:[(0,o.jsxs)(`span`,{className:`ytr-eyebrow`,children:[(0,o.jsx)(`span`,{className:`ytr-eyebrow-dot`}),(0,o.jsx)(`span`,{className:`ytr-eyebrow-text`,children:`Free tool · No upload`})]}),(0,o.jsxs)(`h1`,{className:`ytr-h1`,style:{fontSize:e?36:56,color:`var(--ytg-text)`,marginBottom:18},children:[`YouTube thumbnail resizer. `,(0,o.jsx)(`span`,{style:{color:`var(--ytg-accent)`},children:`1280×720, under 2MB.`})]}),(0,o.jsx)(`p`,{style:{fontSize:e?16:18.5,color:`var(--ytg-text-2)`,lineHeight:1.7,maxWidth:720,margin:`0 auto 32px`},children:`Drop any image, get back an exact 1280×720 thumbnail compressed under YouTube's 2MB limit. Runs entirely in your browser — your image never leaves your device.`})]}),(0,o.jsxs)(`div`,{style:{maxWidth:720,margin:`0 auto`},children:[!b&&(0,o.jsxs)(`div`,{className:`ytr-drop${t?` drag`:``}`,onDrop:j,onDragOver:M,onDragLeave:N,onClick:()=>w.current?.click(),role:`button`,tabIndex:0,children:[(0,o.jsx)(`input`,{ref:w,type:`file`,accept:`image/*`,style:{display:`none`},onChange:e=>A(e.target.files?.[0])}),(0,o.jsx)(`div`,{style:{display:`inline-flex`,width:56,height:56,borderRadius:16,background:`var(--ytg-accent-light)`,alignItems:`center`,justifyContent:`center`,marginBottom:18},children:(0,o.jsxs)(`svg`,{width:`24`,height:`24`,viewBox:`0 0 24 24`,fill:`none`,stroke:`#e5302a`,strokeWidth:`1.6`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,o.jsx)(`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`}),(0,o.jsx)(`polyline`,{points:`17 8 12 3 7 8`}),(0,o.jsx)(`line`,{x1:`12`,y1:`3`,x2:`12`,y2:`15`})]})}),(0,o.jsx)(`p`,{style:{fontSize:17,fontWeight:700,color:`var(--ytg-text)`,marginBottom:6},children:`Drop an image here, click to choose, or paste from clipboard`}),(0,o.jsx)(`p`,{style:{fontSize:13.5,color:`var(--ytg-text-3)`},children:`JPG, PNG, GIF, BMP · up to 50MB · output is exactly 1280×720`})]}),v&&(0,o.jsx)(`div`,{style:{marginTop:18,padding:`14px 18px`,background:`#fef2f2`,border:`1px solid #fecaca`,borderRadius:12,color:`#991b1b`,fontSize:14,fontWeight:500},children:v}),b&&(0,o.jsxs)(`div`,{style:{marginTop:0,animation:`ytrFadeUp 0.4s ease both`},children:[(0,o.jsxs)(`div`,{className:`ytr-result-card`,children:[(0,o.jsx)(`div`,{className:`ytr-result-canvas-wrap`,children:(0,o.jsx)(`canvas`,{ref:T})}),(0,o.jsxs)(`div`,{style:{padding:`20px 24px`,display:`flex`,flexWrap:`wrap`,gap:14,justifyContent:`space-between`,alignItems:`center`},children:[(0,o.jsxs)(`div`,{style:{textAlign:`left`,minWidth:0},children:[(0,o.jsx)(`p`,{style:{fontSize:14,fontWeight:700,color:`var(--ytg-text)`,marginBottom:2,whiteSpace:`nowrap`,overflow:`hidden`,textOverflow:`ellipsis`,maxWidth:360},children:b.sourceName||`thumbnail`}),(0,o.jsxs)(`p`,{style:{fontSize:12.5,color:`var(--ytg-text-3)`},children:[b.originalDims.w,`×`,b.originalDims.h,` (`,h(b.sourceSize),`) → `,(0,o.jsxs)(`strong`,{style:{color:`var(--ytg-text-2)`},children:[`1280×720 (`,h(b.blob.size),`)`]}),b.format===`jpg`&&b.quality<.92&&(0,o.jsxs)(`span`,{children:[` · JPG quality `,Math.round(b.quality*100),`%`]})]})]}),(0,o.jsxs)(`div`,{style:{display:`flex`,gap:8,flexWrap:`wrap`},children:[(0,o.jsx)(`button`,{onClick:()=>C(`jpg`),className:`ytr-btn-ghost`,style:{borderColor:S===`jpg`?`var(--ytg-accent)`:`var(--ytg-border)`,color:S===`jpg`?`var(--ytg-accent)`:`var(--ytg-text-2)`},children:`JPG`}),(0,o.jsx)(`button`,{onClick:()=>C(`png`),className:`ytr-btn-ghost`,style:{borderColor:S===`png`?`var(--ytg-accent)`:`var(--ytg-border)`,color:S===`png`?`var(--ytg-accent)`:`var(--ytg-text-2)`},children:`PNG`})]})]})]}),(0,o.jsxs)(`div`,{style:{display:`flex`,gap:12,justifyContent:`center`,flexWrap:`wrap`,marginTop:22},children:[(0,o.jsxs)(`button`,{onClick:()=>{if(!b)return;let e=document.createElement(`a`);e.href=b.url,e.download=`${(b.sourceName||`thumbnail`).replace(/\.[^.]+$/,``)}-1280x720.${b.format===`png`?`png`:`jpg`}`,document.body.appendChild(e),e.click(),document.body.removeChild(e)},className:`ytr-btn ytr-btn-lg`,disabled:s||!b.blob,children:[`Download `,b.format===`png`?`PNG`:`JPG`,` →`]}),(0,o.jsx)(`button`,{onClick:()=>{b?.url&&URL.revokeObjectURL(b.url),x(null),y(``),E.current=null,w.current&&(w.current.value=``)},className:`ytr-btn-ghost`,style:{padding:`14px 22px`},children:`Resize another`})]}),b.format===`png`&&b.blob.size>l&&(0,o.jsx)(`p`,{style:{fontSize:13,color:`#b45309`,marginTop:14,textAlign:`center`},children:`⚠ This PNG is over YouTube's 2MB cap. Switch to JPG to compress automatically.`})]})]})]}),(0,o.jsx)(`section`,{className:`ytr-section-pad`,style:{padding:e?`56px 20px`:`88px 48px`,background:`var(--ytg-bg)`,borderTop:`1px solid var(--ytg-border)`},children:(0,o.jsxs)(`div`,{style:{maxWidth:1120,margin:`0 auto`},children:[(0,o.jsxs)(`div`,{style:{textAlign:`center`,maxWidth:720,margin:`0 auto 48px`},children:[(0,o.jsxs)(`span`,{className:`ytr-eyebrow`,children:[(0,o.jsx)(`span`,{className:`ytr-eyebrow-dot`}),(0,o.jsx)(`span`,{className:`ytr-eyebrow-text`,children:`Why this exists`})]}),(0,o.jsxs)(`h2`,{className:`ytr-h2`,style:{fontSize:e?30:42,marginBottom:14,color:`var(--ytg-text)`},children:[`YouTube has rules. `,(0,o.jsx)(`span`,{style:{color:`var(--ytg-accent)`},children:`This tool follows them.`})]}),(0,o.jsx)(`p`,{style:{fontSize:15,color:`var(--ytg-text-2)`,lineHeight:1.72},children:`The official thumbnail spec is 1280×720 pixels, under 2MB, in JPG, GIF, BMP, or PNG. Anything smaller than 640×360 gets rejected. Wrong dimensions get cropped awkwardly in the feed. Files over 2MB get silently refused. This tool handles all three.`})]}),(0,o.jsx)(`div`,{className:`ytr-grid-3`,children:[{num:`01`,title:`Exact 1280×720 output`,body:`Center-crops to 16:9 if your source is square, vertical, or any other ratio. Always exports the recommended thumbnail size, never a downscale that softens the image.`},{num:`02`,title:`Auto-compresses under 2MB`,body:`JPG output starts at 92% quality and steps down progressively until the file fits YouTube's 2MB upload cap. PNG output preserves full quality for graphic-heavy thumbnails.`},{num:`03`,title:`Nothing leaves your browser`,body:`Pure HTML5 Canvas in your browser. No upload, no server, no storage. Drop in a private screenshot, and it stays private. Verifiable in DevTools.`}].map((e,t)=>(0,o.jsxs)(`div`,{style:{background:`var(--ytg-card)`,borderRadius:16,border:`1px solid var(--ytg-border)`,boxShadow:`var(--ytg-shadow-sm)`,padding:28},children:[(0,o.jsx)(`p`,{style:{fontSize:12,fontWeight:800,color:`var(--ytg-accent)`,letterSpacing:`0.06em`,fontFamily:`monospace`,marginBottom:14},children:e.num}),(0,o.jsx)(`p`,{style:{fontSize:17,fontWeight:700,color:`var(--ytg-text)`,letterSpacing:`-0.3px`,marginBottom:10},children:e.title}),(0,o.jsx)(`p`,{style:{fontSize:14,color:`var(--ytg-text-2)`,lineHeight:1.68},children:e.body})]},t))})]})}),(0,o.jsx)(`section`,{style:{padding:e?`0 16px 0`:`0 48px 0`,background:`var(--ytg-bg-2)`,borderTop:`1px solid var(--ytg-border)`},children:(0,o.jsx)(`div`,{style:{maxWidth:980,margin:`0 auto`,paddingTop:e?56:88,paddingBottom:e?56:88},children:(0,o.jsxs)(`div`,{style:{borderRadius:e?18:24,border:`1px solid var(--ytg-border)`,boxShadow:`var(--ytg-shadow-lg)`,padding:e?`40px 24px 36px`:`64px 56px`,textAlign:`center`,background:`var(--ytg-card)`,position:`relative`,overflow:`hidden`},children:[(0,o.jsx)(`div`,{style:{position:`absolute`,top:-80,left:`50%`,transform:`translateX(-50%)`,width:460,height:220,background:`radial-gradient(ellipse, rgba(229,48,42,0.10) 0%, transparent 70%)`,pointerEvents:`none`}}),(0,o.jsxs)(`span`,{className:`ytr-eyebrow`,style:{position:`relative`},children:[(0,o.jsx)(`span`,{className:`ytr-eyebrow-dot`}),(0,o.jsx)(`span`,{className:`ytr-eyebrow-text`,children:`Next step`})]}),(0,o.jsxs)(`h2`,{className:`ytr-h2`,style:{fontSize:e?28:38,marginBottom:14,position:`relative`},children:[`Sized correctly is step one. `,(0,o.jsx)(`br`,{}),(0,o.jsx)(`span`,{style:{color:`var(--ytg-accent)`},children:`Sized to win is step two.`})]}),(0,o.jsx)(`p`,{style:{fontSize:e?14:16,color:`var(--ytg-text-2)`,lineHeight:1.7,maxWidth:580,margin:`0 auto 26px`,position:`relative`},children:`A 1280×720 thumbnail still has to earn the click. Score yours against the top videos in your niche on contrast, face presence, text density, and curiosity-gap signals.`}),(0,o.jsx)(`a`,{href:`/features/thumbnail-iq`,className:`ytr-btn ytr-btn-lg`,style:{position:`relative`},children:`Score it with Thumbnail IQ →`})]})})}),(0,o.jsx)(`section`,{className:`ytr-section-pad`,style:{padding:e?`56px 20px`:`88px 48px`,background:`var(--ytg-bg)`,borderTop:`1px solid var(--ytg-border)`},children:(0,o.jsxs)(`div`,{style:{maxWidth:880,margin:`0 auto`},children:[(0,o.jsxs)(`div`,{style:{textAlign:`center`,marginBottom:36},children:[(0,o.jsxs)(`span`,{className:`ytr-eyebrow`,children:[(0,o.jsx)(`span`,{className:`ytr-eyebrow-dot`}),(0,o.jsx)(`span`,{className:`ytr-eyebrow-text`,children:`Frequently asked`})]}),(0,o.jsx)(`h2`,{className:`ytr-h2`,style:{fontSize:e?28:36,color:`var(--ytg-text)`},children:`Thumbnail resizing, sorted.`})]}),(0,o.jsx)(`div`,{children:g.map((e,t)=>(0,o.jsx)(_,{q:e.q,a:e.a},t))})]})}),(0,o.jsx)(r,{})]})}export{v as default};