/* Video Ideas screenshot harness. Usage: node scripts/verify/videoideas.mjs */
import { chromium } from 'playwright'
import { spawn, execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')
const PORT = 5189
const ANSI = /\x1B\[[0-?]*[ -/]*[@-~]/g
function waitForReady(child){return new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('vite timeout')),30000);let b='';const f=c=>{b+=c.toString().replace(ANSI,'');if(b.includes('Local:')&&b.includes(`localhost:${PORT}`)){clearTimeout(t);child.stdout.off('data',f);child.stderr.off('data',f);setTimeout(res,500)}};child.stdout.on('data',f);child.stderr.on('data',f)})}
const vite=spawn('npx',['vite','--port',String(PORT),'--strictPort'],{cwd:ROOT,shell:true,stdio:['ignore','pipe','pipe'],env:{...process.env,BROWSER:'none'}})
let log='';vite.stdout.on('data',c=>log+=c);vite.stderr.on('data',c=>log+=c)
try{await waitForReady(vite)}catch{console.error(log);vite.kill();process.exit(1)}
const browser=await chromium.launch()
try{
  for(const stt of ['ideas','empty']){
    const ctx=await browser.newContext({viewport:{width:1440,height:1700},deviceScaleFactor:1})
    const page=await ctx.newPage()
    await page.goto(`http://localhost:${PORT}/preview-videoideas.html?state=${stt}`,{waitUntil:'networkidle'})
    await page.evaluate(()=>document.fonts?document.fonts.ready:Promise.resolve())
    await page.waitForTimeout(1500)
    const out=path.join(__dirname,`videoideas-${stt}.png`)
    await page.screenshot({path:out,fullPage:false})
    console.log(`OK: wrote ${out}`)
    await ctx.close()
  }
}finally{await browser.close();vite.kill();try{execSync(`npx kill-port ${PORT}`,{stdio:'ignore'})}catch{}}
