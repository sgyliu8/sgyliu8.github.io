import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const dir=fileURLToPath(new URL('../',import.meta.url));
const [accountId,databaseId,aud]=process.argv.slice(2);
if(!/^[a-f0-9]{32}$/.test(accountId||'')||!/^[a-f0-9-]{36}$/.test(databaseId||'')||!/^[a-f0-9]{64}$/.test(aud||'')){
 console.error('Usage: node scripts/configure.mjs <account-id> <D1-database-id> <Access-aud>');process.exit(1);
}
await mkdir(path.join(dir,'.private'),{recursive:true});
for(const kind of ['collector','admin']){
 const config=JSON.parse(await readFile(path.join(dir,kind+'.example.json'),'utf8'));
 config.account_id=accountId;config.main='../'+config.main;
 config.d1_databases[0].database_id=databaseId;config.d1_databases[0].migrations_dir='../migrations';
 if(kind==='admin')config.vars.ACCESS_AUD=aud;
 // Collection remains off until authenticated acceptance checks are complete.
 await writeFile(path.join(dir,'.private',kind+'.json'),JSON.stringify(config,null,2)+'\n');
}
console.log('Private deployment configuration written. Collection is still disabled.');
