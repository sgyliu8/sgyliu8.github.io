import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {chromium} from 'playwright';
import admin from '../src/admin.mjs';
import {TestDB,fixture,environment,owner} from './helpers.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const out=path.join(root,'.local','analytics-qa');await mkdir(out,{recursive:true});
const options={headless:true};
if(process.platform==='win32')options.channel='chrome';
const browser=await chromium.launch(options);
const db=new TestDB(),env=environment(db);
const results=[];
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 for(let i=0;i<105;i++)fixture(db,{ip:i%2?'2001:db8::1':'192.0.2.1',city:i===104?'<img src=x onerror=alert(1)>':'Lincoln',path:i%2?'/zh/':'/'});
 let auth=true;
 await context.route('https://admin.test/**',async route=>{
   const req=route.request();
   const response=await admin.fetch(new Request(req.url(),{method:req.method(),headers:req.headers()}),env,auth?owner:{});
   await route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});
 });
 await page.goto('https://admin.test/admin/');
 await page.waitForFunction(()=>document.getElementById('views').textContent==='105');
 assert.equal(await page.locator('#ips').textContent(),'2');assert.equal(await page.locator('#events tr').count(),100);
 assert.equal(await page.locator('#events img').count(),0);
 assert.match(await page.locator('#events').textContent(),/<img src=x onerror=alert\(1\)>/);
 await page.locator('#more').click();await page.waitForFunction(()=>document.querySelectorAll('#events tr').length===105);
 const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;
 await download.saveAs(path.join(out,'synthetic-visits.csv'));
 assert.match(await readFile(path.join(out,'synthetic-visits.csv'),'utf8'),/2001:db8::1/);
 await page.screenshot({path:path.join(out,'dashboard-desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Dashboard must not overflow at mobile width');
 await page.screenshot({path:path.join(out,'dashboard-mobile.png'),fullPage:true});
 results.push('Dashboard: counts, XSS-safe text, pagination, CSV, desktop and mobile layout');
 auth=false;await page.locator('#week').click();await page.waitForFunction(()=>document.getElementById('status').classList.contains('error'));
 assert.equal(await page.locator('#events tr').count(),0);assert.equal(await page.locator('#views').textContent(),'—');
 results.push('Session expiry clears old private data and reports an error');
 await context.close();
 const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.p3d':'application/octet-stream'};
 async function publicContext({enabled=true,gpc=false,dnt=false,fail=false}={}){
   const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
   if(gpc||dnt)await ctx.addInitScript(({gpc,dnt})=>{
     Object.defineProperty(navigator,'globalPrivacyControl',{get:()=>gpc});
     Object.defineProperty(navigator,'doNotTrack',{get:()=>dnt?'1':null});
   },{gpc,dnt});
   const events=[];
   await ctx.route('https://yang-portfolio-events.sgyliu.workers.dev/collect',async route=>{
     events.push({body:JSON.parse(route.request().postData()),headers:route.request().headers()});
     if(fail)return route.abort();
     await route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'https://sgyliu8.github.io'}});
   });
   await ctx.route('https://sgyliu8.github.io/**',async route=>{
     const url=new URL(route.request().url());
     if(url.pathname==='/assets/js/analytics-config.js')return route.fulfill({contentType:'text/javascript',body:'window.YL_ANALYTICS='+JSON.stringify({enabled,endpoint:'https://yang-portfolio-events.sgyliu.workers.dev/collect'})});
     const relative=url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname;
     const target=path.join(root,'public',relative);
     try{await route.fulfill({contentType:mime[path.extname(target)]||'application/octet-stream',body:await readFile(target)});}
     catch{await route.fulfill({status:404,body:'Missing test asset'});}
   });
   const p=await ctx.newPage();p.on('pageerror',error=>errors.push(error.message));
   return {ctx,p,events};
 }
 const publicRun=await publicContext();
 for(const url of ['/?token=secret#about','/zh/','/cv/','/zh/cv/']){
   const n=publicRun.events.length;await publicRun.p.goto('https://sgyliu8.github.io'+url);
   await publicRun.p.waitForFunction(()=>document.readyState==='complete');
   await publicRun.p.waitForTimeout(100);
   assert.equal(publicRun.events.length,n+1,'One event per page load');
 }
 for(const event of publicRun.events){assert.deepEqual(Object.keys(event.body).sort(),['event_id','path']);assert(!event.headers.referer);assert(!event.headers.cookie);}
 await publicRun.p.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
 await publicRun.p.waitForTimeout(50);assert.equal(publicRun.events.length,4);
 assert.equal((await publicRun.ctx.cookies()).length,0);
 assert.deepEqual(await publicRun.p.evaluate(()=>({local:localStorage.length,session:sessionStorage.length})),{local:0,session:0});
 assert.equal(await publicRun.p.locator('[role="dialog"]').count(),0);
 await publicRun.p.goto('https://sgyliu8.github.io/');
 await publicRun.p.screenshot({path:path.join(out,'homepage-desktop.png'),fullPage:false});
 await publicRun.p.setViewportSize({width:390,height:844});await publicRun.p.locator('[data-menu-toggle]').click();
 assert.equal(await publicRun.p.locator('[data-menu-toggle]').getAttribute('aria-expanded'),'true');
 await publicRun.p.keyboard.press('Escape');assert.equal(await publicRun.p.locator('[data-menu-toggle]').getAttribute('aria-expanded'),'false');
 await publicRun.p.screenshot({path:path.join(out,'homepage-mobile.png'),fullPage:false});
 await publicRun.ctx.close();results.push('Four public routes: once-per-load events, no queries/referrers/cookies/storage/banner; mobile menu unchanged');
 for(const config of [{enabled:false},{gpc:true},{dnt:true}]){
   const run=await publicContext(config);await run.p.goto('https://sgyliu8.github.io/');await run.p.waitForTimeout(150);
   assert.equal(run.events.length,0);await run.ctx.close();
 }
 results.push('Disabled config, GPC and DNT send no events');
 const failed=await publicContext({fail:true});await failed.p.goto('https://sgyliu8.github.io/');
 await failed.p.waitForTimeout(200);assert.equal(await failed.p.locator('h1').count(),1);await failed.ctx.close();
 assert.deepEqual(errors,[]);results.push('Analytics network failure leaves page usable; no uncaught browser errors');
 await writeFile(path.join(out,'browser-results.json'),JSON.stringify({passed:true,results},null,2));
 console.log(JSON.stringify({passed:true,results},null,2));
}finally{db.close();await browser.close();}
