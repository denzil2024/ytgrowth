/* Thumbnail Score screenshot harness. Usage: node scripts/verify/thumbscore.mjs */
import { chromium } from 'playwright'
import { spawn, execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')
const PORT = 5190
const ANSI = /\x1B\[[0-?]*[ -/]*[@-~]/g
function ready(c){return new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('timeout')),30000);let b='';const f=x=>{b+=x.toString().replace(ANSI,'');if(b.includes('Local:')&&b.includes(`localhost:${PORT}`)){clearTimeout(t);c.stdout.off('data',f);c.stderr.off('data',f);setTimeout(res,500)}};c.stdout.on('data',f);c.stderr.on('data',f)})}
const v=spawn('npx',['vite','--port',String(PORT),'--strictPort'],{cwd:ROOT,shell:true,stdio:['ignore','pipe','pipe'],env:{...process.env,BROWSER:'none'}})
let lg='';v.stdout.on('data',c=>lg+=c);v.stderr.on('data',c=>lg+=c)
try{await ready(v)}catch{console.error(lg);v.kill();process.exit(1)}
const b=await chromium.launch()
try{
  const ctx=await b.newContext({viewport:{width:1440,height:1500},deviceScaleFactor:1})
  const pg=await ctx.newPage()
  await pg.goto(`http://localhost:${PORT}/preview-thumbscore.html`,{waitUntil:'networkidle'})
  await pg.evaluate(()=>document.fonts?document.fonts.ready:Promise.resolve())
  await pg.waitForTimeout(1600)
  let out=path.join(__dirname,'thumbscore-idle.png')
  await pg.screenshot({path:out,fullPage:false})
  console.log(`OK: wrote ${out}`)
  // Full Layer-2 results view (auto-loaded via ytg_score_this against mocked upload)
  const rp=await ctx.newPage()
  await rp.goto(`http://localhost:${PORT}/preview-thumbscore.html?state=results`,{waitUntil:'networkidle'})
  await rp.evaluate(()=>document.fonts?document.fonts.ready:Promise.resolve())
  await rp.waitForTimeout(2400)
  out=path.join(__dirname,'thumbscore-results.png')
  await rp.screenshot({path:out,fullPage:true})
  console.log(`OK: wrote ${out}`)
  // Technical-only results (Layer 1 only) — shows the "Run Full Thumbnail IQ" CTA
  const r1=await ctx.newPage()
  await r1.goto(`http://localhost:${PORT}/preview-thumbscore.html?state=ready1`,{waitUntil:'networkidle'})
  await r1.evaluate(()=>document.fonts?document.fonts.ready:Promise.resolve())
  await r1.waitForTimeout(2400)
  out=path.join(__dirname,'thumbscore-ready1.png')
  await r1.screenshot({path:out,fullPage:true})
  console.log(`OK: wrote ${out}`)
  // Previous tab with a full + a technical-only entry (both expanded)
  const pv=await ctx.newPage()
  await pv.goto(`http://localhost:${PORT}/preview-thumbscore.html?state=previous`,{waitUntil:'networkidle'})
  await pv.evaluate(()=>document.fonts?document.fonts.ready:Promise.resolve())
  await pv.waitForTimeout(1600)
  // Switch to the Previous tab, then open every report to expose the accordions + Run button
  await pv.getByText('Previous',{exact:false}).first().click().catch(()=>{})
  await pv.waitForTimeout(500)
  // Re-query each pass: opening one report changes its label to "Close",
  // so grabbing all handles up front would miss the entries below it.
  for(let i=0;i<4;i++){ const bt=pv.getByText('Open report').first(); if(await bt.count().catch(()=>0)){ await bt.click().catch(()=>{}); await pv.waitForTimeout(400) } }
  await pv.waitForTimeout(600)
  out=path.join(__dirname,'thumbscore-previous.png')
  await pv.screenshot({path:out,fullPage:true})
  console.log(`OK: wrote ${out}`)
  await ctx.close()
}finally{await b.close();v.kill();try{execSync(`npx kill-port ${PORT}`,{stdio:'ignore'})}catch{}}
