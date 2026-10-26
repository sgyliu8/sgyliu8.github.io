export const dashboardHTML = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Yang Liu · 私有访问统计</title>
<link rel="stylesheet" href="/admin/app.css"><script src="/admin/app.js" defer></script></head>
<body><main class="wrap">
<header><div><p class="eyebrow">YANG LIU / PRIVATE ANALYTICS</p><h1>网站访问统计</h1><p>sgyliu8.github.io · 仅限本人查看</p></div>
<a class="signout" href="/cdn-cgi/access/logout">退出登录</a></header>
<form id="filters"><label>开始日期<input id="from" type="date" required></label><label>结束日期<input id="to" type="date" required></label>
<button type="submit">查询</button><button type="button" id="week">最近 7 天</button><button type="button" id="month">最近 30 天</button>
<button type="button" id="export" disabled>导出 CSV</button></form>
<p id="status" role="status" aria-live="polite">正在载入…</p>
<section class="metrics" aria-label="访问概况">
<article><p>累计浏览次数</p><strong id="lifetime">—</strong><small>从统计启用时起</small></article>
<article><p>所选期间浏览次数</p><strong id="views">—</strong><small>一次页面载入记一次</small></article>
<article><p>独立 IP 数</p><strong id="ips">—</strong><small>网络出口数量，不代表人数</small></article>
<article><p>国家 / 地区数</p><strong id="countries">—</strong><small>IP 推测位置，不含未知位置</small></article>
</section>
<section class="panel"><h2>每日访问</h2><svg id="chart" viewBox="0 0 900 170" role="img" aria-label="每日浏览次数"></svg><p id="chart-caption"></p></section>
<div class="breakdowns"><section class="panel"><h2>来源国家 / 地区</h2><ol id="country-list"></ol></section>
<section class="panel"><h2>访问页面</h2><ol id="page-list"></ol></section></div>
<section class="panel"><div class="table-heading"><h2>访问明细</h2><span>时间采用 UTC</span></div>
<div class="table-wrap"><table><thead><tr><th>访问时间 (UTC)</th><th>页面</th><th>IP 地址</th><th>国家 / 地区</th><th>省 / 州</th><th>城市</th></tr></thead>
<tbody id="events"></tbody></table></div><button type="button" id="more" hidden>加载更多</button></section>
<footer><p>明细仅显示最近 30 天，源表每小时清理；不含 IP 的每日计数保留 365 天，累计计数长期保留。最早一天可能仅含部分时段。数据库恢复备份有独立保留周期。</p>
<p>IP 可能来自 VPN、代理或共享网络，地区可能不准确或为空；不能据此确认访客姓名、单位或实际位置。浏览器拦截、隐私信号及基础机器人过滤会使计数不完整；自动化流量仍可能混入。</p>
<p>关闭 JavaScript、DNT 或 GPC 开启时不会上报。没有 Cookie、持久访客 ID 或浏览器指纹。统计无法还原启用前的访问。</p></footer>
</main></body></html>`;
export const dashboardCSS = `
:root{color-scheme:light;--ink:#152a36;--muted:#5a6d78;--line:#d9e3e7;--accent:#087a78}*{box-sizing:border-box}
body{margin:0;background:#f3f6f7;color:var(--ink);font:15px/1.6 system-ui,"Microsoft YaHei",sans-serif}
.wrap{max-width:1200px;margin:auto;padding:40px 24px}header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}
h1{font-size:32px;letter-spacing:-1px;margin:4px 0}h2{font-size:18px;margin:0 0 18px}p{margin:0 0 8px}
.eyebrow{font-size:12px;letter-spacing:2px;color:var(--accent);font-weight:700}a{color:var(--accent)}
.signout{padding:8px 14px;border:1px solid var(--line);border-radius:8px;text-decoration:none;background:white;white-space:nowrap}
form{display:flex;align-items:end;flex-wrap:wrap;gap:10px;margin:28px 0 10px}label{display:grid;gap:5px;font-size:12px;color:var(--muted)}
input,button{font:inherit;min-height:42px;border:1px solid var(--line);border-radius:7px;background:white;color:var(--ink);padding:8px 12px}
button{cursor:pointer}button[type=submit]{background:var(--accent);color:white;border-color:var(--accent)}button:disabled{opacity:.5;cursor:default}
:focus-visible{outline:3px solid #b87610;outline-offset:3px}#status{min-height:24px;color:var(--muted);margin-bottom:18px}#status.error{color:#a12626}
.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.metrics article,.panel{background:white;border:1px solid var(--line);border-radius:12px;padding:22px}
.metrics strong{display:block;font-size:34px;line-height:1.4;font-variant-numeric:tabular-nums}.metrics p,.metrics small{color:var(--muted)}.metrics small{font-size:12px}
.panel{margin-top:20px}.breakdowns{display:grid;grid-template-columns:1fr 1fr;gap:20px}ol{padding:0;list-style:none;margin:0}
li{display:flex;justify-content:space-between;gap:20px;padding:8px 0;border-bottom:1px solid #eff3f4}li:last-child{border:0}
#chart{display:block;width:100%;max-height:190px}#chart rect{fill:var(--accent)}#chart text{fill:var(--muted);font-size:13px}#chart-caption{font-size:12px;color:var(--muted)}
.table-heading{display:flex;justify-content:space-between;gap:20px}.table-heading span{color:var(--muted);font-size:12px}.table-wrap{overflow:auto;max-height:560px}th{position:sticky;top:0;z-index:1}
table{border-collapse:collapse;width:100%;text-align:left;font-size:13px}td,th{padding:12px 14px;border-bottom:1px solid var(--line);white-space:nowrap}
th{font-weight:600;background:#f6f8f9}td:nth-child(3){font-family:ui-monospace,monospace}#more{margin-top:18px}
footer{font-size:12px;color:var(--muted);margin-top:24px;max-width:95ch}body.busy #filters button{cursor:progress}
@media(max-width:740px){.wrap{padding:24px 16px}.metrics{grid-template-columns:repeat(2,1fr);gap:10px}.metrics article,.panel{padding:16px}.breakdowns{grid-template-columns:1fr;gap:0}h1{font-size:27px}.metrics strong{font-size:28px}}
@media(prefers-reduced-motion:no-preference){button{transition:background .15s}}
`;
export const dashboardJS = `
'use strict';
const el = id => document.getElementById(id);
const day = 86400000;
const iso = date => new Date(date).toISOString().slice(0,10);
let cursor = null, active = '', busy = false;
function dates(n) { const now = Date.now(); el('to').value = iso(now); el('from').value = iso(now - (n-1)*day); }
for (const name of ['from','to']) { el(name).max = iso(Date.now()); el(name).min = iso(Date.now()-30*day); }
const regions = new Intl.DisplayNames(['zh-CN'], {type:'region'});
function country(code) { try { return code ? regions.of(code) + ' (' + code + ')' : '未知'; } catch { return code || '未知'; } }
const pageNames = {'/':'英文首页','/zh/':'中文首页','/cv/':'英文 CV','/zh/cv/':'中文 CV'};
function status(text, error=false) { el('status').textContent=text; el('status').classList.toggle('error',error); }
async function api(route) {
  const response = await fetch(route,{credentials:'same-origin',cache:'no-store',redirect:'error'});
  if (response.status === 403 || response.status === 401) throw new Error('登录已失效，请重新打开后台并登录。');
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('登录已失效，或服务暂不可用。请重新登录。');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '暂时无法读取统计。');
  return data;
}
function list(id, rows, name) {
  el(id).replaceChildren();
  for (const row of rows) {
    const li=document.createElement('li'), text=document.createElement('span'), count=document.createElement('strong');
    text.textContent=name(row); count.textContent=Number(row.views).toLocaleString('zh-CN'); li.append(text,count); el(id).append(li);
  }
  if (!rows.length) { const li=document.createElement('li'); li.textContent='暂无记录'; el(id).append(li); }
}
function chart(data) {
  const svg=el('chart'); svg.replaceChildren();
  const byDay=new Map(data.daily.map(row=>[row.day,row.views]));
  const days=[]; for(let t=Date.parse(data.range.from);t<=Date.parse(data.range.to);t+=day) days.push([iso(t),byDay.get(iso(t))||0]);
  const max=Math.max(1,...days.map(item=>item[1])), width=900/days.length;
  days.forEach(([date,count],i)=>{
    const rect=document.createElementNS('http://www.w3.org/2000/svg','rect'), title=document.createElementNS('http://www.w3.org/2000/svg','title');
    rect.setAttribute('x',String(i*width+3)); rect.setAttribute('width',String(Math.max(1,width-6)));
    rect.setAttribute('y',String(145-count/max*135)); rect.setAttribute('height',String(count/max*135));
    title.textContent=date+': '+count; rect.append(title); svg.append(rect);
    if(i===0||i===days.length-1||i%Math.max(1,Math.ceil(days.length/6))===0){
      const text=document.createElementNS('http://www.w3.org/2000/svg','text'); text.setAttribute('x',String(i*width+3));text.setAttribute('y','166');text.textContent=date.slice(5);svg.append(text);
    }
  });
  svg.setAttribute('aria-label',days.map(([date,n])=>date+': '+n).join('; '));
  el('chart-caption').textContent=data.range.from+' 至 '+data.range.to+' · 每日浏览次数 · UTC';
}
function rows(data, append=false) {
  if(!append) el('events').replaceChildren();
  for(const row of data.rows){
    const tr=document.createElement('tr');
    for(const value of [new Date(row.occurred_at).toISOString().replace('T',' ').slice(0,19),pageNames[row.path]||row.path,row.ip,country(row.country),row.region||'—',row.city||'—']){
      const td=document.createElement('td');td.textContent=value;tr.append(td);
    }
    el('events').append(tr);
  }
  if(!data.rows.length&&!append){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=6;td.textContent='所选日期暂无访问记录。';tr.append(td);el('events').append(tr);}
  cursor=data.next;el('more').hidden=!cursor;
}
function controls(loading){busy=loading;document.body.classList.toggle('busy',loading);for(const button of document.querySelectorAll('#filters button'))button.disabled=loading;el('more').disabled=loading;}
async function load(){
  if(busy)return;controls(true);el('export').disabled=true;el('more').hidden=true;status('正在读取…');
  active=new URLSearchParams({from:el('from').value,to:el('to').value}).toString();
  try{
    const [summary,events]=await Promise.all([api('/api/summary?'+active),api('/api/events?'+active)]);
    for(const [id,value] of [['lifetime',summary.lifetime.views],['views',summary.totals.views],['ips',summary.totals.unique_ips],['countries',summary.totals.countries]])el(id).textContent=Number(value).toLocaleString('zh-CN');
    list('country-list',summary.countries,row=>country(row.country));list('page-list',summary.pages,row=>pageNames[row.path]||row.path);
    chart(summary);rows(events);status('更新于 '+new Date().toISOString().replace('T',' ').slice(0,19)+' UTC');controls(false);
  }catch(error){
    for(const id of ['lifetime','views','ips','countries'])el(id).textContent='—';
    for(const id of ['events','country-list','page-list','chart'])el(id).replaceChildren();el('chart-caption').textContent='';
    cursor=null;controls(false);el('more').hidden=true;el('export').disabled=true;status(error.message,true);
  }
}
el('filters').addEventListener('submit',event=>{event.preventDefault();load();});
el('week').addEventListener('click',()=>{dates(7);load();});el('month').addEventListener('click',()=>{dates(30);load();});
el('more').addEventListener('click',async()=>{
  if(!cursor||busy)return;controls(true);
  try{rows(await api('/api/events?'+active+'&cursor='+encodeURIComponent(cursor)),true);status('已加载更多记录。');}
  catch(error){status(error.message,true);}finally{controls(false);}
});
el('export').addEventListener('click',async()=>{
  if(busy)return;controls(true);status('正在准备导出…');
  try{
    const response=await fetch('/api/export.csv?'+active,{credentials:'same-origin',cache:'no-store',redirect:'error'});
    if(!response.ok||!response.headers.get('content-type')?.includes('text/csv'))throw new Error('导出失败：请确认登录有效；超过 10,000 条时请缩小日期范围。');
    const url=URL.createObjectURL(await response.blob());const a=document.createElement('a');a.href=url;a.download='visits-'+new URLSearchParams(active).get('from')+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('CSV 已导出，内含 IP 明细，请妥善保管。');
  }catch(error){status(error.message,true);}finally{controls(false);}
});
dates(7);load();
`;
