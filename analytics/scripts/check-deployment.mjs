import assert from 'node:assert/strict';
const collector='https://yang-portfolio-events.sgyliu.workers.dev';
const admin='https://yang-portfolio-analytics.sgyliu.workers.dev';
async function get(url,options={}){return fetch(url,{...options,redirect:'manual',signal:AbortSignal.timeout(12000)});}
for(const route of ['/api/dashboard','/admin/','/admin/app.js','/api/summary','/api/events','/api/export.csv']){
 const response=await get(admin+route,{headers:{'Cf-Access-Authenticated-User-Email':'sgyliu@gmail.com','Cf-Access-Jwt-Assertion':'forged'}});
 assert([302,401,403].includes(response.status),route+' must deny anonymous and forged identities');
 if(response.status===302)assert.match(response.headers.get('location')||'',/^https:\/\/[^/]+\.cloudflareaccess\.com\//);
}
const preflight=await get(collector+'/collect',{method:'OPTIONS',headers:{Origin:'https://sgyliu8.github.io','Access-Control-Request-Method':'POST'}});
assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),'https://sgyliu8.github.io');
assert.equal((await get(collector+'/api/events')).status,404);
assert.equal((await get(collector+'/collect',{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'text/plain'},body:'{}'})).status,403);
// Tests validation without creating any pageview records.
assert.equal((await get(collector+'/collect',{method:'POST',headers:{Origin:'https://sgyliu8.github.io','Content-Type':'text/plain','User-Agent':'DeploymentAcceptance/1.0'},body:'{}'})).status,400);
console.log('Anonymous denial, collector isolation, CORS and input validation passed. Owner sign-in and actual count verification are still required.');
