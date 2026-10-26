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
 const page=await context.newPage(),errors=[],requests=[],csp=[];
 page.on('request',r=>requests.push(r.url()));
 await page.exposeFunction('reportCSP',value=>csp.push(value));
 await page.addInitScript(()=>document.addEventListener('securitypolicyviolation',e=>window.reportCSP(e.violatedDirective)));
 page.on('pageerror',error=>errors.push(error.message));
 for(let i=0;i<105;i++)fixture(db,{ip:i%2?'2001:db8::1':'192.0.2.1',country:i<60?'GB':i<90?'US':i<100?'CN':i<103?'DE':i===103?'':'SG',city:i===104?'<img src=x onerror=alert(1)>':'Lincoln',path:i%2?'/zh/':'/'});
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

 assert.equal(await page.locator('#map-countries path').count(),176);
 assert.equal(await page.locator('.country-shape[data-code=CN]').getAttribute('tabindex'),'0');
 await page.locator('.country-shape[data-code=CN]').hover();
 assert.match(await page.locator('#map-tooltip').textContent(),/中国.*10 次/);
 await page.locator('.country-shape[data-code=CN]').click();
 await page.waitForFunction(()=>document.getElementById('views').textContent==='10'&&!document.body.classList.contains('busy'));
 assert.equal(await page.locator('#events tr').count(),10);
 assert.equal(await page.locator('#lifetime').textContent(),'105');
 assert.equal(await page.locator('.country-row[data-code=GB] b').textContent(),'60');
 assert.equal(await page.locator('.country-shape[data-code=CN]').getAttribute('aria-pressed'),'true');
 const filteredDownload=page.waitForEvent('download');await page.locator('#export').click();
 await (await filteredDownload).saveAs(path.join(out,'synthetic-filtered.csv'));
 assert.equal((await readFile(path.join(out,'synthetic-filtered.csv'),'utf8')).trim().split('\r\n').length,11);
 await page.locator('.country-shape[data-code=GB]').focus();await page.keyboard.press('Enter');
 await page.waitForFunction(()=>document.getElementById('views').textContent==='60'&&!document.body.classList.contains('busy'));
 await page.locator('#country-search').fill('SG');assert.equal(await page.locator('.country-row').count(),1);
 await page.locator('.country-row[data-code=SG]').click();
 await page.waitForFunction(()=>document.getElementById('views').textContent==='1'&&!document.body.classList.contains('busy'));
 await page.locator('#country-search').fill('');
 await page.locator('.country-row[data-code=_unknown]').click();
 await page.waitForFunction(()=>document.getElementById('countries').textContent==='0'&&!document.body.classList.contains('busy'));
 assert.match(await page.locator('#clear-filter').textContent(),/未知来源/);
 await page.locator('#clear-filter').click();
 await page.waitForFunction(()=>document.getElementById('views').textContent==='105'&&!document.body.classList.contains('busy'));
 await page.locator('#zoom-in').click();const zoomed=await page.locator('#world-map').getAttribute('viewBox');
 assert.notEqual(zoomed,'0 0 960 480');
 const box=await page.locator('#world-map').boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
 await page.mouse.move(box.x+box.width/2+45,box.y+box.height/2+20,{steps:5});await page.mouse.up();
 assert.notEqual(await page.locator('#world-map').getAttribute('viewBox'),zoomed);
 assert.equal(await page.locator('#views').textContent(),'105','Dragging must not select a country');
 await page.locator('#zoom-reset').click();assert.equal(await page.locator('#world-map').getAttribute('viewBox'),'0 0 960 480');
 await page.locator('#help').click();assert(await page.locator('#help-dialog').isVisible());
 await page.keyboard.press('Escape');assert(!(await page.locator('#help-dialog').isVisible()));
 await page.locator('#date-toggle').click();assert(await page.locator('#date-dialog').isVisible());
 await page.locator('#from').fill(new Date(Date.now()-86400000).toISOString().slice(0,10));await page.locator('#filters button[type=submit]').click();
 await page.waitForFunction(()=>!document.body.classList.contains('busy'));
 await page.locator('#week').click();await page.waitForFunction(()=>!document.body.classList.contains('busy'));
 await page.locator('.country-shape[data-code=JP]').focus();await page.keyboard.press('Enter');
 await page.waitForFunction(()=>document.getElementById('views').textContent==='0'&&!document.body.classList.contains('busy'));
 assert.match(await page.locator('#events').textContent(),/暂无访问/);
 await page.locator('#clear-filter').click();await page.waitForFunction(()=>document.getElementById('views').textContent==='105'&&!document.body.classList.contains('busy'));
 assert(requests.every(url=>new URL(url).origin==='https://admin.test'),'Map must not send requests to external providers');
 assert.deepEqual(csp,[],'Dashboard must work without violating CSP');
 results.push('Map: heat values, hover, click, keyboard, search, country/unknown/empty filters, CSV, zoom and drag; no external map requests');

 await page.screenshot({path:path.join(out,'dashboard-desktop.png'),fullPage:true});
 for(const width of [320,390,768]){await page.setViewportSize({width,height:844});await page.waitForTimeout(60);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No overflow at '+width);}
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(80);
 assert(await page.locator('#chart').evaluate(node=>Number(node.getAttribute('viewBox').split(' ')[2])<400),'Mobile chart uses actual width');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Dashboard must not overflow at mobile width');
 await page.screenshot({path:path.join(out,'dashboard-mobile.png'),fullPage:true});
 results.push('Dashboard: counts, XSS-safe text, pagination, CSV, desktop and mobile layout');
 auth=false;await page.locator('#week').click();await page.waitForFunction(()=>document.getElementById('status').classList.contains('error'));
 assert.equal(await page.locator('#events tr').count(),0);assert.equal(await page.locator('#views').textContent(),'—');
 assert.equal(await page.locator('#map-tooltip').isVisible(),false);
 assert.equal(await page.locator('.country-row').count(),0);
 assert.equal(await page.locator('.country-shape[tabindex="0"]').count(),0);
 results.push('Session expiry clears private records and map data');
 auth=true;db.sqlite.exec('DELETE FROM events');await page.locator('#refresh').click();
 await page.waitForFunction(()=>document.getElementById('views').textContent==='0'&&!document.body.classList.contains('busy'));
 assert(await page.locator('#map-empty').isVisible());assert.equal(await page.locator('#lifetime').textContent(),'105');
 results.push('Empty dataset renders a truthful empty map without fabricated visits');
 await context.close();
 const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.p3d':'application/octet-stream'};
 async function publicContext({enabled,gpc=false,dnt=false,fail=false,transient=false,rejected=false}={}){
   const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
   if(gpc||dnt)await ctx.addInitScript(({gpc,dnt})=>{
     Object.defineProperty(navigator,'globalPrivacyControl',{get:()=>gpc});
     Object.defineProperty(navigator,'doNotTrack',{get:()=>dnt?'1':null});
   },{gpc,dnt});
   const events=[];
   await ctx.route('https://yang-portfolio-events.sgyliu.workers.dev/collect',async route=>{
     events.push({body:JSON.parse(route.request().postData()),headers:route.request().headers()});
     if(fail||transient&&events.length===1)return route.abort();
     if(transient&&events.length===2)return route.fulfill({status:503,headers:{'Access-Control-Allow-Origin':'https://sgyliu8.github.io'}});
     if(rejected)return route.fulfill({status:403,headers:{'Access-Control-Allow-Origin':'https://sgyliu8.github.io'}});
     await route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'https://sgyliu8.github.io'}});
   });
   await ctx.route('https://sgyliu8.github.io/**',async route=>{
     const url=new URL(route.request().url());
     if(enabled!==undefined&&url.pathname==='/assets/js/analytics-config.js')return route.fulfill({contentType:'text/javascript',body:'window.YL_ANALYTICS='+JSON.stringify({enabled,endpoint:'https://yang-portfolio-events.sgyliu.workers.dev/collect'})});
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
   assert.equal(publicRun.events.at(-1).body.path,new URL(url,'https://sgyliu8.github.io').pathname,'Exact query-free route');
 }
 assert.equal(new Set(publicRun.events.map(e=>e.body.event_id)).size,4,'Every navigation has a distinct UUID');
 for(const event of publicRun.events){assert.match(event.body.event_id,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);assert.deepEqual(Object.keys(event.body).sort(),['event_id','path']);assert(!event.headers.referer);assert(!event.headers.cookie);}
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
 const retry=await publicContext({transient:true});await retry.p.goto('https://sgyliu8.github.io/');
 await retry.p.waitForTimeout(3300);assert.equal(retry.events.length,3);assert.equal(new Set(retry.events.map(e=>e.body.event_id)).size,1);await retry.ctx.close();
 const reject=await publicContext({rejected:true});await reject.p.goto('https://sgyliu8.github.io/');await reject.p.waitForTimeout(1200);assert.equal(reject.events.length,1);await reject.ctx.close();
 assert.deepEqual(errors,[]);results.push('Transient network/503 errors retry with one UUID, 403 does not retry, failures leave page usable');
 await writeFile(path.join(out,'browser-results.json'),JSON.stringify({passed:true,results},null,2));
 console.log(JSON.stringify({passed:true,results},null,2));
}finally{db.close();await browser.close();}
