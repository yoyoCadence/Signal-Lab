import { build } from 'esbuild';
import { Miniflare } from 'miniflare';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const dir=await mkdtemp(join(tmpdir(),'signal-lab-test-'));
const bundle=await build({stdin:{contents:`import {GET,POST,PUT,DELETE} from './app/api/lab/[[...path]]/route.ts'; export default {fetch: r=>({GET,POST,PUT,DELETE}[r.method]||GET)(r)}`,resolveDir:process.cwd(),sourcefile:'test-worker.ts'},alias:{'@':process.cwd()},bundle:true,write:false,format:'esm',platform:'browser',external:['cloudflare:workers'],define:{'import.meta.env.DEV':'false'}});
const config={modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],r2Buckets:['BUCKET'],d1Persist:join(dir,'d1'),r2Persist:join(dir,'r2')};
let mf=new Miniflare(config);
const req=(path,method='GET',body,authenticated=true,extra={})=>mf.dispatchFetch('https://signal.test/api/lab/'+path,{method,headers:{...(authenticated?{'oai-authenticated-user-id':'owner-test'}:{}),...(body?{'Content-Type':'application/json'}:{}),...extra},body:body?JSON.stringify(body):undefined});
const json=async r=>{const data=await r.json();assert.equal(r.status,200,JSON.stringify(data));return data};
try{
 const db=await mf.getD1Database('DB');let sql=await readFile('drizzle/0000_dizzy_mach_iv.sql','utf8');for(const s of sql.split('--> statement-breakpoint'))await db.prepare(s.trim()).run();
 assert.equal((await req('posts','GET',null,false)).status,401);
 assert.equal((await req('posts','PUT',{},true,{Origin:'https://evil.test'})).status,403);
 const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/a9sAAAAASUVORK5CYII=';
 const fixture={format:'threads-signal-lab',version:1,posts:[{id:'fixture',title:'測試',date:'2026-10-17',images:[{id:'img',name:'test.png',inlineData:'data:image/png;base64,'+png}],snapshots:[{id:'snap',at:'2026-10-17T13:28',ageHours:4,views:4492,reach:3410,profile:39,likes:15,replies:1,follows:0,share:0,quote:0,repost:0,sources:{home:86.5,search:11.6,instagram:0.1,profile:0,other:1.8}}]}]};
 const seed=process.env.SIGNAL_TEST_SEED?JSON.parse(await readFile(process.env.SIGNAL_TEST_SEED,'utf8')):fixture;
 await json(await req('bootstrap','POST',seed,false));
 assert.equal((await req('bootstrap','POST',seed,false)).status,400);
 let posts=await json(await req('posts'));assert.equal(posts.length,seed.posts.length);
 for(const p of posts){const source=seed.posts.find(x=>x.id===p.id);assert.deepEqual(p.snapshots,source.snapshots.map(s=>({...s,note:s.note||''})));for(let n=0;n<p.images.length;n++){const bytes=Buffer.from(source.images[n].inlineData.split(',')[1],'base64');const actual=await req('media/'+p.images[n].mediaKey);assert.equal(actual.status,200);assert.deepEqual(Buffer.from(await actual.arrayBuffer()),bytes);assert.equal((await req('media/'+p.images[n].mediaKey,'GET',null,false)).status,401);}}
 const first=posts[0],stale=structuredClone(first);first.title+=' changed';await json(await req('posts','PUT',first));assert.equal((await req('posts','PUT',stale)).status,409);
 const current=(await json(await req('posts')))[0];current.snapshots.push({...current.snapshots[0],id:'second-snapshot',at:'2026-10-17T15:00',views:7000});await json(await req('posts','PUT',current));
 await mf.dispose();mf=new Miniflare(config);posts=await json(await req('posts'));assert.equal(posts[0].snapshots.length,2);assert.equal(posts[0].snapshots[1].views,7000);
 for(const p of posts){if(p.coverMediaKey){const r=await req('media/'+p.coverMediaKey);p.coverInlineData='data:'+r.headers.get('content-type')+';base64,'+Buffer.from(await r.arrayBuffer()).toString('base64');}for(const i of p.images){const r=await req('media/'+i.mediaKey);assert.equal(r.status,200);i.inlineData='data:'+r.headers.get('content-type')+';base64,'+Buffer.from(await r.arrayBuffer()).toString('base64');}}
 const before=posts.map(p=>p.images.map(i=>createHash('sha256').update(Buffer.from(i.inlineData.split(',')[1],'base64')).digest('hex')));
 assert.equal((await req('restore','POST',{...seed,posts:[{...seed.posts[0],images:[{id:'missing',name:'missing'}]}]})).status,400);assert.equal((await json(await req('posts')))[0].snapshots.length,2);
 await json(await req('restore','POST',{format:'threads-signal-lab',version:1,posts}));posts=await json(await req('posts'));const after=[];for(const p of posts){const hashes=[];for(const i of p.images){const r=await req('media/'+i.mediaKey);hashes.push(createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex'));}after.push(hashes)}assert.deepEqual(after,before);
 await json(await req('reset','POST',{}));posts=await json(await req('posts'));assert.equal(posts.length,seed.posts.length);assert.equal(posts[0].title,seed.posts[0].title);
 console.log(JSON.stringify({passed:true,posts:posts.length,snapshots:posts.reduce((n,p)=>n+p.snapshots.length,0),originalImages:posts.reduce((n,p)=>n+p.images.length,0),checks:['anonymous denial','cross-origin denial','one-time bootstrap','original image byte equality','optimistic conflict','multiple snapshots','restart persistence','failed restore atomicity','image backup round-trip','reset preserves original seed']}));
} finally {await mf.dispose();await rm(dir,{recursive:true,force:true});}
