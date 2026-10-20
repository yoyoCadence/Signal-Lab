import { listPosts,savePost,deletePost,upload,readImage,restore,reset,readStrategy,saveStrategy } from '@/lib/storage';
export const dynamic='force-dynamic';
const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
async function handler(req:Request){const url=new URL(req.url);const path=url.pathname.replace(/^\/api\/lab\/?/,'').split('/').filter(Boolean);try{
// Production access is owner-private at Sites dispatch. No application login or public file URLs.
// Bootstrap and scoped ingest accept official Sites service access, which has no
// visitor identity. Sites dispatch MUST keep this application owner-private.
// Ingest reuses validation, image checks and optimistic revision checks; it does
// not grant service callers reset, delete, restore or bootstrap operations.
const ingest=path[0]==='ingest';
if(ingest){path.shift();const allowed=(req.method==='GET'&&['posts','media','strategy'].includes(path[0]))||(req.method==='PUT'&&['posts','strategy'].includes(path[0]))||(req.method==='POST'&&path[0]==='media');if(!allowed)return json({error:'不支援此同步操作'},405);}
const isDev=import.meta.env.DEV&&['terminal.local','localhost','127.0.0.1'].includes(url.hostname);
if(!isDev&&!req.headers.get('oai-authenticated-user-id')&&path[0]!=='bootstrap'&&!ingest)return json({error:'請先使用擁有者的 ChatGPT 帳號登入'},401);
if(req.method!=='GET'){const origin=req.headers.get('origin');if(origin&&origin!==url.origin)return json({error:'來源驗證失敗'},403);}
if(req.method==='GET'&&path[0]==='bootstrap'){const posts=await listPosts();const checks=[];for(const p of posts){const images=[];for(const i of p.images){const r=await readImage(i.mediaKey);const bytes=await r.arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');images.push({id:i.id,sha256:hash,size:bytes.byteLength});}checks.push({id:p.id,snapshots:p.snapshots,images});}return json({posts:checks});}
if(req.method==='GET'&&path[0]==='posts')return json(await listPosts());
if(req.method==='GET'&&path[0]==='strategy')return json(await readStrategy());
if(req.method==='PUT'&&path[0]==='strategy')return json(await saveStrategy(await req.json()));
if(req.method==='GET'&&path[0]==='media'&&path[1])return readImage(path[1]);
if(req.method==='PUT'&&path[0]==='posts')return json(await savePost(await req.json()));
if(req.method==='DELETE'&&path[0]==='posts'&&path[1])return json(await deletePost(path[1]));
if(req.method==='POST'&&path[0]==='media'){const f=await req.formData();const file=f.get('file');if(!(file instanceof File))throw Error('請選擇圖片');return json(await upload(new Uint8Array(await file.arrayBuffer()),file.name,String(f.get('id')||crypto.randomUUID())));}
if(req.method==='POST'&&['restore','bootstrap'].includes(path[0])){if(Number(req.headers.get('content-length')||0)>32*1024*1024)throw Error('備份上限 32MB');const body=await req.text();if(body.length>32*1024*1024)throw Error('備份上限 32MB');return json(await restore(JSON.parse(body),path[0]==='bootstrap'));}
if(req.method==='POST'&&path[0]==='reset')return json(await reset());
return json({error:'找不到操作'},404);
}catch(e){if(e instanceof Response)return e;console.error('Signal Lab operation failed',e instanceof Error?e.message:'unknown');return json({error:e instanceof Error?e.message:'操作失敗'},400);}}
export const GET=handler;export const POST=handler;export const PUT=handler;export const DELETE=handler;
