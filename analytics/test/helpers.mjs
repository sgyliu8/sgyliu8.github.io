import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';

export class TestDB {
  constructor() {
    this.sqlite=new DatabaseSync(':memory:');
    for(const file of ['0001_events.sql','0002_counter_ordering.sql'])this.sqlite.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
  }
  prepare(sql) {
    const statement=this.sqlite.prepare(sql);
    let args=[];
    const result={
      bind(...values){args=values;return result;},
      async run(){const info=statement.run(...args);return {success:true,meta:{changes:info.changes}};},
      async all(){return {success:true,results:statement.all(...args)};},
    };
    return result;
  }
  async batch(statements) {
    this.sqlite.exec('BEGIN');
    try {const results=[];for(const statement of statements)results.push(await statement.all());this.sqlite.exec('COMMIT');return results;}
    catch(error){this.sqlite.exec('ROLLBACK');throw error;}
  }
  close(){this.sqlite.close();}
}
export function fixture(db, overrides={}) {
  const now=Date.now();
  const row={event_id:randomUUID(),occurred_at:now,day:new Date(now).toISOString().slice(0,10),
    path:'/',ip:'192.0.2.1',country:'GB',region:'England',city:'Lincoln',...overrides};
  db.sqlite.prepare('INSERT INTO events VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(...['event_id','occurred_at','day','path','ip','country','region','city'].map(k=>row[k]));
  return row;
}
export function eventRequest(options={}) {
  const headers={'origin':'https://sgyliu8.github.io','content-type':'text/plain',
    'cf-connecting-ip':'192.0.2.1','user-agent':'Mozilla/5.0',...options.headers};
  for(const key of Object.keys(headers))if(headers[key]===null)delete headers[key];
  const request=new Request(options.url||'https://events.test/collect',{
    method:options.method||'POST',headers,
    ...(!['GET','HEAD','OPTIONS'].includes(options.method)&&{body:options.raw??JSON.stringify(options.body??{event_id:randomUUID(),path:'/'})})});
  if(options.cf!==null)Object.defineProperty(request,'cf',{value:options.cf??{country:'GB',region:'England',city:'Lincoln'}});
  return request;
}
export function environment(db) {return {DB:db,COLLECTION_ENABLED:'true',
  RATE_LIMITER:{limit:async()=>({success:true})},EDGE_RATE_LIMITER:{limit:async()=>({success:true})},OWNER_EMAIL:'owner@example.test',ACCESS_AUD:'test-aud'};}
export const owner={access:{aud:'test-aud',getIdentity:async()=>({email:'owner@example.test'})}};
