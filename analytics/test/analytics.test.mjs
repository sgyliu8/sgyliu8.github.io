import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import collector from '../src/collector.mjs';
import admin,{authorized,range,csvCell} from '../src/admin.mjs';
import {DAY,purge} from '../src/common.mjs';
import {TestDB,fixture,eventRequest,environment,owner} from './helpers.mjs';
const request=(path)=>new Request('https://admin.test'+path);

test('collector persists edge IP/geography, and atomically deduplicates event retries',async()=>{
 const db=new TestDB(),env=environment(db),id=randomUUID();
 for(let i=0;i<3;i++)assert.equal((await collector.fetch(eventRequest({body:{event_id:id,path:'/'},headers:{'x-forwarded-for':'198.51.100.9'}}),env)).status,204);
 const row=db.sqlite.prepare('SELECT * FROM events').get();
 assert.equal(row.ip,'192.0.2.1');assert.equal(row.city,'Lincoln');
 assert.equal(db.sqlite.prepare('SELECT views FROM daily_counts').get().views,1);
 assert.equal(db.sqlite.prepare('SELECT views FROM lifetime_counts').get().views,1);db.close();
});
test('collector rejects invalid origin, request shape and untrusted IP sources without inserting',async()=>{
 const db=new TestDB(),env=environment(db);
 const cases=[
 [{headers:{origin:'https://evil.test'}},403],
 [{headers:{origin:null}},403],
 [{method:'GET'},405],
 [{url:'https://events.test/collect?secret=x'},404],
 [{url:'https://events.test/api/events'},404],
 [{headers:{'cf-connecting-ip':null}},403],
 [{headers:{'cf-connecting-ip':'127.0.0.1, 198.51.100.1'}},403],
 [{headers:{'cf-worker':'other.example'}},403],
 [{cf:null},403],
 [{body:{event_id:randomUUID(),path:'/?token=secret'}},400],
 [{body:{event_id:randomUUID(),path:'/',ip:'198.51.100.1'}},400],
 [{body:{event_id:'x',path:'/'}},400],
 [{raw:'{bad json'},400],
 [{raw:' '.repeat(1025)},400],
 [{headers:{'content-type':'text/html'}},415],
 ];
 for(const [options,status] of cases)assert.equal((await collector.fetch(eventRequest(options),env)).status,status,JSON.stringify(options));
 assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM events').get().n,0);db.close();
});
test('privacy signals, known bots and configured own IP do not increment counts',async()=>{
 const db=new TestDB(),env=environment(db);
 for(const options of [{headers:{dnt:'1'}},{headers:{'sec-gpc':'1'}},{headers:{'user-agent':'ExampleBot/1.0'}},{cf:{botManagement:{verifiedBot:true}}}]){
  assert.equal((await collector.fetch(eventRequest(options),env)).status,204);
 }
 assert.equal((await collector.fetch(eventRequest(),{...env,EXCLUDED_IPS:'192.0.2.1'})).status,204);
 assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM events').get().n,0);db.close();
});
test('collector accepts IPv6 and missing geography without inventing a location',async()=>{
 const db=new TestDB(),env=environment(db);
 assert.equal((await collector.fetch(eventRequest({headers:{'cf-connecting-ip':'2001:db8::1'},cf:{}}),env)).status,204);
 const row=db.sqlite.prepare('SELECT * FROM events').get();assert.equal(row.ip,'2001:db8::1');assert.equal(row.city,'');db.close();
});
test('per-IP rate limit and missing configuration fail safely',async()=>{
 const db=new TestDB(),env=environment(db);
 assert.equal((await collector.fetch(eventRequest(),{...env,RATE_LIMITER:{limit:async()=>({success:false})}})).status,429);
 for(const overrides of [{RATE_LIMITER:null},{DB:null},{COLLECTION_ENABLED:'false'}])
  assert.equal((await collector.fetch(eventRequest(),{...env,...overrides})).status,503);
 assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM events').get().n,0);db.close();
});
test('global daily insertion cap bounds accepted events',async()=>{
 const db=new TestDB(),env=environment(db);
 const today=new Date().toISOString().slice(0,10);
 db.sqlite.prepare('INSERT INTO daily_counts VALUES (?, ?, ?)').run(today,'/',20000);
 assert.equal((await collector.fetch(eventRequest(),env)).status,204);
 assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM events').get().n,0);db.close();
});
test('CORS grants only the public origin and never credentials or data reads',async()=>{
 const response=await collector.fetch(eventRequest({method:'OPTIONS',headers:{'access-control-request-method':'POST'}}),{});
 assert.equal(response.status,204);assert.equal(response.headers.get('access-control-allow-origin'),'https://sgyliu8.github.io');
 assert.equal(response.headers.has('access-control-allow-credentials'),false);
 assert.equal((await collector.fetch(eventRequest({method:'OPTIONS',headers:{'access-control-request-method':'GET'}}),{})).status,403);
});
test('all private routes deny anonymous requests, forged headers and wrong identities',async()=>{
 const db=new TestDB(),env=environment(db);
 const contexts=[{}, {access:{aud:'wrong',getIdentity:async()=>({email:env.OWNER_EMAIL})}},
 {access:{aud:env.ACCESS_AUD,getIdentity:async()=>({email:'someone@example.test'})}},
 {access:{aud:env.ACCESS_AUD,getIdentity:async()=>{throw Error('unavailable');}}}];
 for(const route of ['/','/admin/','/admin/app.js','/admin/app.css','/api/summary','/api/events','/api/export.csv'])
  for(const ctx of contexts){
   const response=await admin.fetch(new Request('https://admin.test'+route,{headers:{'Cf-Access-Authenticated-User-Email':env.OWNER_EMAIL,'Cf-Access-Jwt-Assertion':'forged'}}),env,ctx);
   assert.equal(response.status,403);assert.match(response.headers.get('cache-control'),/no-store/);
  }
 assert.equal(await authorized({...env,ACCESS_AUD:''},owner),false);
 assert.equal(await authorized({...env,OWNER_EMAIL:''},owner),false);db.close();
});
test('authenticated dashboard has restrictive CSP and requires auth for assets',async()=>{
 const response=await admin.fetch(request('/admin/'),environment(null),owner);
 assert.equal(response.status,200);assert.match(response.headers.get('content-security-policy'),/frame-ancestors 'none'/);
 assert.match(await response.text(),/网站访问统计/);
 assert.equal((await admin.fetch(new Request('https://admin.test/api/events',{method:'POST'}),environment(null),owner)).status,405);
});
test('summary distinguishes IP counts from pageviews and ignores expired raw data',async()=>{
 const db=new TestDB(),env=environment(db),now=Date.now();
 fixture(db);fixture(db,{path:'/zh/'});fixture(db,{ip:'2001:db8::1',country:'DE'});
 fixture(db,{occurred_at:now-31*DAY,day:new Date(now-31*DAY).toISOString().slice(0,10),ip:'192.0.2.99'});
 const response=await admin.fetch(request('/api/summary'),env,owner);
 const data=await response.json();assert.equal(data.totals.views,3);assert.equal(data.totals.unique_ips,2);
 assert.equal(data.totals.countries,2);assert.equal(data.lifetime.views,4);db.close();
});
test('event pagination has no duplicates or skipped rows sharing a timestamp',async()=>{
 const db=new TestDB(),env=environment(db),now=Date.now();
 for(let i=0;i<105;i++)fixture(db,{occurred_at:now});
 const first=await (await admin.fetch(request('/api/events'),env,owner)).json();
 const second=await (await admin.fetch(request('/api/events?cursor='+encodeURIComponent(first.next)),env,owner)).json();
 assert.equal(first.rows.length,100);assert.equal(second.rows.length,5);assert.equal(second.next,null);
 assert.equal(new Set([...first.rows,...second.rows].map(row=>row.event_id)).size,105);db.close();
});
test('invalid dates, future dates, excessive ranges and injection cursors are rejected',async()=>{
 const db=new TestDB(),env=environment(db);
 for(const path of ['/api/events?cursor=0%27OR%201=1','/api/summary?from=2026-02-30',
 '/api/events?to=2099-01-01','/api/summary?from=2000-01-01'])
  assert.equal((await admin.fetch(request(path),env,owner)).status,400,path);
 const now=Date.parse('2026-10-26T12:00:00Z');
 assert.equal(range(new URL('https://a/?from=2026-09-26&to=2026-10-26'),now).start,now-30*DAY);db.close();
});
test('retention deletes expired raw data and old daily counts but preserves lifetime totals',async()=>{
 const db=new TestDB(),now=Date.now();
 fixture(db);fixture(db,{occurred_at:now-31*DAY,day:new Date(now-31*DAY).toISOString().slice(0,10)});
 fixture(db,{occurred_at:now-366*DAY,day:new Date(now-366*DAY).toISOString().slice(0,10)});
 await purge(db,now);
 assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM events').get().n,1);
 assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM daily_counts').get().n,2);
 assert.equal(db.sqlite.prepare('SELECT views FROM lifetime_counts').get().views,3);db.close();
});
test('CSV is authenticated, safely escaped, and preserves IPv6 and UTF-8 fields',async()=>{
 const db=new TestDB(),env=environment(db);fixture(db,{ip:'2001:db8::1',city:'=HYPERLINK("https://evil")',region:'江苏'});
 const response=await admin.fetch(request('/api/export.csv'),env,owner);
 const csv=await response.text();assert.equal(response.status,200);assert.match(csv,/2001:db8::1/);
 assert.match(csv,/'=HYPERLINK/);assert.match(csv,/江苏/);assert.equal(csvCell('a"b'),'"a""b"');
 assert.equal(csvCell('+123'),'"\'+123"');db.close();
});
test('database failures return generic errors without leaking request or IP data',async()=>{
 const db={prepare(){throw Error('secret 192.0.2.1');},batch(){throw Error('secret');}},env=environment(db);
 const collected=await collector.fetch(eventRequest(),env);assert.equal(collected.status,503);assert.doesNotMatch(await collected.text(),/secret|192\.0\.2/);
 const queried=await admin.fetch(request('/api/summary'),env,owner);assert.equal(queried.status,503);assert.doesNotMatch(await queried.text(),/secret/);
});
