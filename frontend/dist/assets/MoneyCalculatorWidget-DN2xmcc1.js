import{r as e}from"./chunk-DECur_0Z.js";import{n as t,t as n}from"./jsx-runtime-CP2iHdEU.js";import{c as r,i,l as a,n as o,o as s,s as c,t as l}from"./youtubeEarnings-B0dVNgn5.js";var u=e(t(),1),d=n(),f=[5e4,25e4,1e6,5e6];function p(){(0,u.useEffect)(()=>{if(document.getElementById(`mcw-styles`))return;let e=document.createElement(`style`);e.id=`mcw-styles`,e.textContent=`
      .mcw-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; align-items: stretch; background: var(--yte-line, rgba(20,19,15,0.12)); border: 1px solid var(--yte-line, rgba(20,19,15,0.12)); }
      @media (max-width: 760px) { .mcw-grid { grid-template-columns: 1fr; } }
      .mcw-card {
        background: var(--yte-surface, #fff); padding: 30px;
      }
      .mcw-label {
        display: block; font-family: 'Barlow', system-ui, sans-serif;
        font-size: 11px; font-weight: 600; color: var(--yte-muted, #8a8378);
        text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 9px;
      }
      .mcw-input {
        width: 100%; padding: 13px 14px; font-size: 16px; font-weight: 500;
        font-family: 'Barlow', system-ui, sans-serif; color: var(--yte-ink, #14130f);
        background: var(--yte-bg, #f6f4ef);
        border: 1px solid var(--yte-line, rgba(20,19,15,0.14)); border-radius: 0; outline: none;
        transition: border-color 0.15s, background 0.15s; -webkit-appearance: none;
        font-variant-numeric: tabular-nums;
      }
      .mcw-input:focus { border-color: var(--yte-accent, #e5302a); background: #fff; }
      select.mcw-input { font-size: 14px; }
      .mcw-chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 11px; }
      .mcw-chip {
        font-family: 'Barlow', system-ui, sans-serif;
        font-size: 12px; font-weight: 600;
        color: var(--yte-soft, #5c574e); background: transparent;
        border: 1px solid var(--yte-line, rgba(20,19,15,0.16)); border-radius: 0;
        padding: 6px 13px; cursor: pointer; transition: all 0.15s; letter-spacing: 0.02em;
      }
      .mcw-chip:hover { border-color: var(--yte-ink, #14130f); color: var(--yte-ink, #14130f); }
      .mcw-chip.active { background: var(--yte-ink, #14130f); border-color: var(--yte-ink, #14130f); color: #fff; }
      .mcw-result {
        display: flex; flex-direction: column; background: var(--yte-ink, #14130f);
        color: #fff; padding: 32px;
      }
      .mcw-serif { font-family: 'Fraunces', Georgia, serif; }
    `,document.head.appendChild(e)},[])}function m({initialNiche:e=`tech`,initialCountry:t=`tier1`,initialViews:n=25e4}){p();let[m,h]=(0,u.useState)(n),[g,_]=(0,u.useState)(s[e]?e:`tech`),[v,y]=(0,u.useState)(o[t]?t:`tier1`),b=(0,u.useMemo)(()=>{let e=s[g]||i[0],t=o[v]||l[0],n=e.low*t.mult,r=e.high*t.mult;return{lowRpm:n,highRpm:r,monthlyLow:n/1e3*m,monthlyHigh:r/1e3*m,annualLow:n/1e3*m*12,annualHigh:r/1e3*m*12,label:e.label}},[m,g,v]);function x(e){let t=e.target.value.replace(/[^0-9]/g,``);h(t===``?0:Math.min(Number(t),1e9))}return(0,d.jsxs)(`div`,{className:`mcw-grid`,children:[(0,d.jsxs)(`div`,{className:`mcw-card`,style:{display:`flex`,flexDirection:`column`,gap:20},children:[(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`label`,{className:`mcw-label`,htmlFor:`mcw-views`,children:`Monthly views`}),(0,d.jsx)(`input`,{id:`mcw-views`,className:`mcw-input`,type:`text`,inputMode:`numeric`,value:m?m.toLocaleString():``,onChange:x,placeholder:`e.g. 250,000`,"aria-label":`Monthly views`}),(0,d.jsx)(`div`,{className:`mcw-chips`,children:f.map(e=>(0,d.jsx)(`button`,{type:`button`,className:`mcw-chip`+(m===e?` active`:``),onClick:()=>h(e),children:r(e)},e))})]}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`label`,{className:`mcw-label`,htmlFor:`mcw-niche`,children:`Niche`}),(0,d.jsx)(`select`,{id:`mcw-niche`,className:`mcw-input`,value:g,onChange:e=>_(e.target.value),children:i.map(e=>(0,d.jsx)(`option`,{value:e.key,children:e.label},e.key))})]}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`label`,{className:`mcw-label`,htmlFor:`mcw-country`,children:`Audience country`}),(0,d.jsx)(`select`,{id:`mcw-country`,className:`mcw-input`,value:v,onChange:e=>y(e.target.value),children:l.map(e=>(0,d.jsx)(`option`,{value:e.key,children:e.label},e.key))})]})]}),(0,d.jsxs)(`div`,{className:`mcw-result`,children:[(0,d.jsx)(`div`,{style:{fontFamily:`'Barlow', system-ui, sans-serif`,fontSize:11,fontWeight:600,letterSpacing:`0.14em`,textTransform:`uppercase`,opacity:.62,marginBottom:14},children:`Estimated monthly earnings`}),(0,d.jsxs)(`div`,{className:`mcw-serif`,style:{fontSize:46,fontWeight:400,letterSpacing:`-1px`,lineHeight:1.02,marginBottom:10},children:[c(b.monthlyLow),` – `,c(b.monthlyHigh)]}),(0,d.jsxs)(`div`,{style:{fontFamily:`'Barlow', system-ui, sans-serif`,fontSize:13,opacity:.7},children:[r(m),` views/mo · `,b.label]}),(0,d.jsx)(`div`,{style:{height:1,background:`rgba(255,255,255,0.16)`,margin:`24px 0`}}),(0,d.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,gap:16},children:[(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`div`,{style:{fontFamily:`'Barlow', system-ui, sans-serif`,fontSize:10.5,opacity:.6,textTransform:`uppercase`,letterSpacing:`0.12em`,marginBottom:7},children:`Per year`}),(0,d.jsxs)(`div`,{className:`mcw-serif`,style:{fontSize:22,fontWeight:400,letterSpacing:`-0.3px`},children:[c(b.annualLow),` – `,c(b.annualHigh)]})]}),(0,d.jsxs)(`div`,{style:{textAlign:`right`},children:[(0,d.jsx)(`div`,{style:{fontFamily:`'Barlow', system-ui, sans-serif`,fontSize:10.5,opacity:.6,textTransform:`uppercase`,letterSpacing:`0.12em`,marginBottom:7},children:`RPM range`}),(0,d.jsxs)(`div`,{className:`mcw-serif`,style:{fontSize:22,fontWeight:400,letterSpacing:`-0.3px`},children:[`$`,b.lowRpm.toFixed(2),` – $`,b.highRpm.toFixed(2)]})]})]}),(0,d.jsxs)(`div`,{style:{marginTop:`auto`,paddingTop:26,fontFamily:`'Barlow', system-ui, sans-serif`,fontSize:12.5,opacity:.7,lineHeight:1.55},children:[`RPM is what hits your AdSense after YouTube's 45% cut and unmonetized views. CPM (advertiser gross) runs roughly $`,a(b.lowRpm).toFixed(0),`–$`,a(b.highRpm).toFixed(0),`.`]})]})]})}export{m as t};