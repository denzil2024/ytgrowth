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
  await pg.goto(`http://localhost:${PORT}/preview-seo.html`,{waitUntil:'networkidle'})
  await pg.evaluate(()=>document.fonts?document.fonts.ready:Promise.resolve())
  await pg.waitForTimeout(1600)
  let out=path.join(__dirname,'seo-idle.png')
  await pg.screenshot({path:out,fullPage:false})
  console.log(`OK: wrote ${out}`)
  // Reports tab
  const tab=pg.locator('button', { hasText: /^Reports/ }).first()
  await tab.click()
  await pg.waitForTimeout(900)
  out=path.join(__dirname,'seo-reports.png')
  await pg.screenshot({path:out,fullPage:false})
  console.log(`OK: wrote ${out}`)
  await ctx.close()
}finally{await b.close();v.kill();try{execSync(`npx kill-port ${PORT}`,{stdio:'ignore'})}catch{}}
