// Serialized into the authenticated app.js response; no external runtime imports.
export function dashboardApp(geography) {
  'use strict';
  const el=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg', DAY=86400000;
  const iso=t=>new Date(t).toISOString().slice(0,10), fmt=n=>Number(n).toLocaleString('zh-CN');
  const regionNames=new Intl.DisplayNames(['zh-CN'],{type:'region'});
  const country=code=>{try{return code&&code!=='_unknown'?(regionNames.of(code)||code):'未知来源';}catch{return code||'未知来源';}};
  const pageNames={'/':'英文首页','/zh/':'中文首页','/cv/':'英文 CV','/zh/cv/':'中文 CV'};
  let selected=null,cursor=null,active='',busy=false,loaded=0,valid=false,summary=null;
  let zoom=1,panX=0,panY=0,drag=null,moved=false;
  const shapes=[];
  function element(tag,text,cls) { const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n; }
  function svg(tag,attrs={}) {const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;}
  function status(text,error=false){el('status').textContent=text;el('status').classList.toggle('error',error);}
  function dates(n) {
    const now=Date.now();el('to').value=iso(now);el('from').value=iso(now-(n-1)*DAY);
    document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.preset)===n)));
  }
  function controls(loading) {
    busy=loading;document.body.classList.toggle('busy',loading);
    el('visits').setAttribute('aria-busy',String(loading));el('map-stage').setAttribute('aria-busy',String(loading));
    for(const b of document.querySelectorAll('.toolbar button,#filters button[type=submit],.country-row,#clear-filter,#more'))b.disabled=loading;
    for(const shape of shapes)shape.node.setAttribute('aria-disabled',String(loading||!valid));
    el('export').disabled=loading||!valid;
  }
  async function api(route) {
    let response;try{response=await fetch(route,{credentials:'same-origin',cache:'no-store',redirect:'error'});}
    catch{throw Error('连接中断或登录已过期，请刷新重试。');}
    if(response.status===401||response.status===403||!response.headers.get('content-type')?.includes('application/json'))throw Error('登录已过期，请重新登录。');
    const data=await response.json();if(!response.ok)throw Error(response.status===400?'请选择最近 30 天内的有效日期。':'暂时无法读取统计，请重试。');
    return data;
  }
  function tip(code) {
    if(!summary||drag)return;
    const rows=summary.countries,total=rows.reduce((n,r)=>n+Number(r.views),0);
    const n=Number(rows.find(r=>(r.country||'_unknown')===code)?.views||0);
    el('map-tooltip').replaceChildren(element('strong',country(code)),element('span',fmt(n)+' 次'+(total?' · '+(n/total*100).toFixed(1)+'%':'')));
    el('map-tooltip').hidden=false;
    for(const s of shapes)s.node.classList.toggle('hovered',s.code===code);
  }
  function hideTip(){el('map-tooltip').hidden=true;for(const s of shapes)s.node.classList.remove('hovered');}
  function mapView() {
    const w=geography.width/zoom,h=geography.height/zoom;
    panX=Math.max(0,Math.min(geography.width-w,panX));panY=Math.max(0,Math.min(geography.height-h,panY));
    el('world-map').setAttribute('viewBox',[panX,panY,w,h].join(' '));el('world-map').classList.toggle('zoomed',zoom>1);
    el('zoom-in').disabled=zoom>=4;el('zoom-out').disabled=zoom<=1;
  }
  function setZoom(next) {
    const old=zoom;zoom=Math.max(1,Math.min(4,next));
    panX+=geography.width/old/2-geography.width/zoom/2;panY+=geography.height/old/2-geography.height/zoom/2;
    hideTip();mapView();
  }
  function buildMap() {
    el('map-grid').append(svg('path',{d:geography.graticule,class:'map-graticule'}));
    for(const item of geography.countries){
      const node=svg('path',{d:item.path,class:'country-shape',fill:'#dfe8e2','data-code':item.code,'aria-label':item.code?country(item.code):item.name});
      if(item.code){
        node.setAttribute('role','button');node.setAttribute('tabindex','-1');node.setAttribute('aria-pressed','false');
        node.addEventListener('pointerenter',()=>tip(item.code));node.addEventListener('pointerleave',hideTip);
        node.addEventListener('focus',()=>tip(item.code));node.addEventListener('blur',hideTip);
        node.addEventListener('click',()=>{if(!moved)choose(item.code);});
        node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(item.code);}if(e.key==='Escape')hideTip();});
        shapes.push({code:item.code,node});
      }else{node.setAttribute('aria-hidden','true');node.style.cursor='default';}
      el('map-countries').append(node);
    }
    const map=el('world-map');
    map.addEventListener('pointerdown',e=>{
      moved=false;if(zoom<=1||e.button!==0)return;
      const box=map.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,px:panX,py:panY,scale:geography.width/zoom/box.width};
    });
    map.addEventListener('pointermove',e=>{
      if(!drag||e.pointerId!==drag.id)return;
      const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if(Math.hypot(dx,dy)>4){moved=true;hideTip();map.setPointerCapture(e.pointerId);map.classList.add('dragging');}
      if(moved){panX=drag.px-dx*drag.scale;panY=drag.py-dy*drag.scale;mapView();}
    });
    const end=e=>{if(drag&&e.pointerId===drag.id){drag=null;map.classList.remove('dragging');if(map.hasPointerCapture(e.pointerId))map.releasePointerCapture(e.pointerId);}};
    map.addEventListener('pointerup',end);map.addEventListener('pointercancel',end);
    map.addEventListener('pointerleave',e=>{if(drag&&!moved)end(e);});
    el('zoom-in').onclick=()=>setZoom(zoom*1.5);el('zoom-out').onclick=()=>setZoom(zoom/1.5);
    el('zoom-reset').onclick=()=>{zoom=1;panX=panY=0;hideTip();mapView();};mapView();
  }
  function renderMap() {
    const counts=new Map((summary?.countries||[]).map(r=>[r.country,Number(r.views)]));
    const max=Math.max(1,...counts.values());
    for(const s of shapes){
      const n=counts.get(s.code)||0,t=Math.sqrt(n/max);
      s.node.setAttribute('fill',n?'rgb('+[183+(17-183)*t,219+(126-219)*t,199+(112-199)*t].map(Math.round).join(',')+')':'#dfe8e2');
      s.node.setAttribute('aria-pressed',String(selected===s.code));s.node.setAttribute('tabindex',n?'0':'-1');
      s.node.setAttribute('aria-label',country(s.code)+'，'+fmt(n)+' 次，点击筛选');
    }
    const total=[...counts.values()].reduce((a,b)=>a+b,0);
    el('map-empty').hidden=!valid||total>0;el('map-max').textContent=valid?fmt(total?max:0):'—';
    renderCountries();
  }
  function renderCountries() {
    const parent=el('country-list'),query=el('country-search').value.trim().toLowerCase();
    const rows=summary?.countries||[],max=Math.max(1,...rows.map(r=>r.views));
    parent.replaceChildren();
    for(const row of rows){
      const code=row.country||'_unknown',name=country(code);
      if(query&&!name.toLowerCase().includes(query)&&!code.toLowerCase().includes(query))continue;
      const li=element('li'),button=element('button',undefined,'country-row');button.type='button';button.dataset.code=code;
      button.setAttribute('aria-pressed',String(selected===code));button.setAttribute('aria-label',name+'，'+fmt(row.views)+' 次，点击筛选');
      button.disabled=busy;
      const line=element('span'),label=element('span',undefined,'country-name');
      label.append(element('span',row.country||'??','code'),document.createTextNode(name));line.append(label,element('b',fmt(row.views)));
      const bar=element('i');bar.style.width=(row.views/max*100)+'%';bar.setAttribute('aria-hidden','true');button.append(bar,line);
      button.onclick=()=>choose(code);button.onpointerenter=()=>tip(code);button.onpointerleave=hideTip;button.onfocus=()=>tip(code);button.onblur=hideTip;
      li.append(button);parent.append(li);
    }
    if(!parent.children.length)parent.append(element('li',query?'没有匹配的地区':valid?'暂无来源记录':'—','empty-list'));
  }
  async function choose(code) {if(busy||!valid)return;selected=selected===code?null:code;hideTip();await load();}
  function renderChart(data) {
    const target=el('chart');target.replaceChildren();
    const byDay=new Map(data.daily.map(r=>[r.day,r.views])),days=[];
    for(let t=Date.parse(data.range.from);t<=Date.parse(data.range.to);t+=DAY)days.push([iso(t),byDay.get(iso(t))||0]);
    const chartWidth=Math.max(280,target.clientWidth);
    target.setAttribute('viewBox','0 0 '+chartWidth+' 180');
    const max=Math.max(1,...days.map(r=>r[1])),left=30,width=(chartWidth-45)/days.length;
    [0,.5,1].forEach(t=>{
      const y=148-t*125;target.append(svg('line',{x1:left,y1:y,x2:chartWidth-15,y2:y,class:'grid'}));
      if(t===0||t===1){const txt=svg('text',{x:22,y:y+3,'text-anchor':'end'});txt.textContent=t?fmt(max):'0';target.append(txt);}
    });
    days.forEach(([date,n],i)=>{
      const w=Math.min(32,Math.max(3,width-7)),x=left+i*width+(width-w)/2;
      const rect=svg('rect',{x,y:148-Math.max(1,n/max*125),width:w,height:Math.max(1,n/max*125),rx:Math.min(3,w/3),class:'bar',tabindex:'0','aria-label':date+'，'+fmt(n)+' 次'});
      if(!n)rect.setAttribute('opacity','.2');
      const title=svg('title');title.textContent=date+' · '+fmt(n)+' 次';rect.append(title);target.append(rect);
      if(i===0||i===days.length-1||i%Math.max(1,Math.ceil(days.length/Math.max(2,Math.floor(chartWidth/75))))===0){
        const label=svg('text',{x:left+(i+.5)*width,y:171,'text-anchor':'middle'});label.textContent=date.slice(5).replace('-','/');target.append(label);
      }
    });
    target.setAttribute('aria-label','每日访问：'+days.map(([d,n])=>d+' '+n+' 次').join('；'));
    el('chart-caption').textContent='每日 · UTC';
  }
  function renderPages(rows) {
    const parent=el('page-list');parent.replaceChildren();
    for(const row of rows){const li=element('li'),label=element('span',pageNames[row.path]||row.path);label.append(element('small',row.path));li.append(label,element('strong',fmt(row.views)));parent.append(li);}
    if(!rows.length)parent.append(element('li','暂无访问','empty-list'));
  }
  function renderEvents(data,append=false) {
    if(!append){el('events').replaceChildren();loaded=0;}
    for(const row of data.rows){
      const tr=element('tr'),time=element('td'),stamp=new Date(row.occurred_at).toISOString();
      time.append(document.createTextNode(stamp.slice(11,19)),element('span',stamp.slice(0,10),'date-part'));
      const ip=element('td',row.ip),location=element('td',undefined,'location-cell');
      const place=[row.city,row.region].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(' · ');
      location.append(element('strong',country(row.country)),element('small',place||'城市未知'));location.title=[country(row.country),place].filter(Boolean).join(' · ');
      const page=element('td');page.append(element('span',pageNames[row.path]||row.path,'page-tag'));tr.append(time,ip,location,page);el('events').append(tr);
    }
    loaded+=data.rows.length;
    if(!data.rows.length&&!append){const td=element('td','此范围暂无访问记录','empty-row');td.colSpan=4;const tr=element('tr');tr.append(td);el('events').append(tr);}
    cursor=data.next;el('more').hidden=!cursor;
    el('loaded-count').textContent='已显示 '+fmt(loaded)+' / '+fmt(summary?.totals.views||0)+' 条';
  }
  function clearData() {
    valid=false;summary=null;cursor=null;loaded=0;selected=null;active='';hideTip();
    el('scope-label').textContent='全部地区';el('clear-filter').hidden=true;el('clear-filter').textContent='';
    el('country-search').value='';el('chart').setAttribute('aria-label','每日浏览次数');
    for(const id of ['views','ips','countries','lifetime'])el(id).textContent='—';
    for(const id of ['events','page-list','chart'])el(id).replaceChildren();
    for(const id of ['loaded-count','record-count'])el(id).textContent='';
    el('more').hidden=true;el('reauth').hidden=false;renderMap();
  }
  async function load() {
    if(busy)return;controls(true);hideTip();status('更新中…');el('reauth').hidden=true;
    const params=new URLSearchParams({from:el('from').value,to:el('to').value});if(selected!==null)params.set('country',selected);active=params.toString();
    el('range-label').textContent=el('from').value.slice(5).replace('-','/')+' — '+el('to').value.slice(5).replace('-','/');
    el('clear-filter').hidden=selected===null;el('clear-filter').textContent=selected===null?'':country(selected)+' ×';
    el('scope-label').textContent=selected===null?'全部地区':'地区筛选';
    try{
      const data=await api('/api/dashboard?'+active),events=data.events;summary=data;valid=true;
      for(const [id,n]of [['lifetime',data.lifetime.views],['views',data.totals.views],['ips',data.totals.unique_ips],['countries',data.totals.countries]])el(id).textContent=fmt(n);
      el('record-count').textContent=fmt(data.totals.views);renderMap();renderChart(data);renderPages(data.pages);renderEvents(events);
      status('已更新 '+new Date().toISOString().slice(11,16)+' UTC');
    }catch(e){clearData();status(e.message,true);}finally{controls(false);}
  }
  for(const id of ['from','to']){el(id).max=iso(Date.now());el(id).min=iso(Date.now()-30*DAY);}
  for(const button of document.querySelectorAll('[data-preset]'))button.onclick=()=>{dates(Number(button.dataset.preset));load();};
  el('refresh').onclick=()=>load();el('clear-filter').onclick=()=>{selected=null;load();};
  el('country-search').oninput=renderCountries;
  el('date-toggle').onclick=()=>el('date-dialog').showModal();
  el('help').onclick=el('help-footer').onclick=()=>el('help-dialog').showModal();
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>el(b.dataset.close).close());
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  el('filters').onsubmit=e=>{
    e.preventDefault();if(el('from').value>el('to').value){el('to').setCustomValidity('结束日期不能早于开始日期');el('to').reportValidity();return;}
    el('to').setCustomValidity('');el('date-dialog').close();document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed','false'));load();
  };
  el('to').oninput=el('from').oninput=()=>el('to').setCustomValidity('');
  el('more').onclick=async()=>{
    if(!cursor||busy)return;controls(true);
    try{renderEvents(await api('/api/events?'+active+'&cursor='+encodeURIComponent(cursor)),true);status('已加载 '+fmt(loaded)+' 条');}
    catch(e){clearData();status(e.message,true);}finally{controls(false);}
  };
  el('export').onclick=async()=>{
    if(busy||!valid)return;controls(true);status('正在导出…');
    try{
      const response=await fetch('/api/export.csv?'+active,{credentials:'same-origin',cache:'no-store',redirect:'error'});
      if(response.status===413)throw Error('超过 10,000 条，请缩小日期或地区范围。');
      if(!response.ok||!response.headers.get('content-type')?.includes('text/csv')){clearData();throw Error('导出失败，请刷新或重新登录。');}
      const url=URL.createObjectURL(await response.blob()),a=element('a');a.href=url;a.download='visits-'+el('from').value+(selected?'-'+selected:'')+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('CSV 已导出');
    }catch(e){if(e instanceof TypeError)clearData();status(e instanceof TypeError?'连接中断或登录已过期，请刷新重试。':e.message,true);}finally{controls(false);}
  };
  new ResizeObserver(()=>{if(summary)renderChart(summary);}).observe(el('chart'));
  buildMap();dates(7);load();
}
