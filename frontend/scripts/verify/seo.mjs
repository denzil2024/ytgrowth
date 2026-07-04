/* SEO Studio screenshot harness. Usage: node scripts/verify/seo.mjs */
import { chromium } from 'playwright'
import { spawn, execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')
const PORT = 5191
const ANSI = /\x1B\[[0-?]*[ -/]*[@-~]/g
function ready(c){return new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('timeout')),30000);let b='';const f=x=>{b+=x.toString().replace(ANSI,'');if(b.includes('Local:')&&b.includes(`localhost:${PORT}`)){clearTimeout(t);c.stdout.off('data',f);c.stderr.off('data',f);setTimeout(res,500)}};c.stdout.on('data',f);c.stderr.on('data',f)})}
const v=spawn('npx',['vite','--port',String(PORT),'--strictPort'],{cwd:ROOT,shell:true,stdio:['ignore','pipe','pipe'],env:{...process.env,BROWSER:'none'}})
let lg='';v.stdout.on('data',c=>lg+=c);v.stderr.on('data',c=>lg+=c)
try{await ready(v)}catch{console.error(lg);v.kill();process.exit(1)}
const b=await chromium.launch()
try{
  const ctx=await b.newContext({viewport:{width:1440,height:1600},deviceScaleFactor:1})
  const pg=await ctx.newPage()
  // idle editor + reports both live on the base URL; results/desc are seeded via ?view.
  const shot=async(url,name,{full=false}={})=>{
    await pg.goto(url,{waitUntil:'networkidle'})
    await pg.evaluate(()=>document.fonts?document.fonts.ready:Promise.resolve())
    await pg.waitForTimeout(1600)
    const out=path.join(__dirname,name)
    await pg.screenshot({path:out,fullPage:full})
    console.log(`OK: wrote ${out}`)
  }
  const base=`http://localhost:${PORT}/preview-seo.html`
  await shot(base,'seo-idle.png')
  await shot(`${base}?view=intent`,'seo-intent.png')
  await shot(`${base}?view=results`,'seo-results.png',{full:true})
  await shot(`${base}?view=desc`,'seo-desc.png',{full:true})
  // Reports tab (base URL, click into it)
  await pg.goto(base,{waitUntil:'networkidle'})
  await pg.waitForTimeout(600)
  const tab=pg.locator('button', { hasText: /^Reports/ }).first()
  await tab.click()
  await pg.waitForTimeout(900)
  const rout=path.join(__dirname,'seo-reports.png')
  await pg.screenshot({path:rout,fullPage:false})
  console.log(`OK: wrote ${rout}`)
  await ctx.close()
}finally{await b.close();v.kill();try{execSync(`npx kill-port ${PORT}`,{stdio:'ignore'})}catch{}}
