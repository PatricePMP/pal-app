'use strict';
const crypto=require('node:crypto');
const {send,valid,sameOrigin}=require('../lib/pal-server');
const BUCKET='pal-private-media';
const VALID_PATH=/^(?:legacy|images)\/[a-f0-9-]{32,64}\.(?:jpg|png|webp)$/;
const TYPES={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
function config(){
 const base=process.env.SUPABASE_URL,secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!base||!secret)throw Error('Supabase-Konfiguration fehlt');
 return {base:base.replace(/\/+$/,'').replace(/\/rest\/v1$/,''),secret};
}
const json=async r=>{const t=await r.text();try{return JSON.parse(t)}catch{return {message:t.slice(0,200)}}};
module.exports=async(req,res)=>{
 if(!valid(req))return send(res,401,{error:'Bitte anmelden'});
 if(!['GET','POST'].includes(req.method))return send(res,405,{error:'Methode nicht erlaubt'});
 if(req.method==='POST'&&!sameOrigin(req))return send(res,403,{error:'Ungültiger Ursprung'});
 try{
  const {base,secret}=config();
  if(req.method==='GET'){
   const path=String(req.query?.path||'');
   if(!VALID_PATH.test(path))return send(res,400,{error:'Ungültiger Bildpfad'});
   const r=await fetch(`${base}/storage/v1/object/authenticated/${BUCKET}/${path}`,{headers:{apikey:secret,Authorization:`Bearer ${secret}`}});
   if(!r.ok){console.error('PAL media download',r.status,await json(r));return send(res,r.status===404?404:502,{error:'Bild konnte nicht geladen werden'})}
   const size=Number(r.headers.get('content-length')||0);
   if(size>17_000_000)return send(res,413,{error:'Bild zu groß'});
   const bytes=Buffer.from(await r.arrayBuffer());
   if(bytes.length>17_000_000)return send(res,413,{error:'Bild zu groß'});
   res.statusCode=200;
   res.setHeader('Content-Type',r.headers.get('content-type')||'image/jpeg');
   res.setHeader('Cache-Control','private, max-age=120');
   res.setHeader('X-Content-Type-Options','nosniff');
   res.end(bytes);return;
  }
  const type=String(req.body?.mimeType||'');
  const ext=TYPES[type];
  if(!ext)return send(res,400,{error:'Nur JPEG, PNG und WebP werden unterstützt'});
  const legacy=Boolean(req.body?.legacy);
  const digest=String(req.body?.digest||'');
  if(legacy&&!/^[a-f0-9]{64}$/.test(digest))return send(res,400,{error:'Ungültige Bildkennung'});
  const name=legacy?digest:crypto.randomUUID().replace(/-/g,'');
  const path=`${legacy?'legacy':'images'}/${name}.${ext}`;
  const r=await fetch(`${base}/storage/v1/object/upload/sign/${BUCKET}/${path}`,{
   method:'POST',headers:{apikey:secret,Authorization:`Bearer ${secret}`,'Content-Type':'application/json',...(legacy?{'x-upsert':'true'}:{})},body:'{}'});
  const data=await json(r);
  if(!r.ok){console.error('PAL media sign',r.status,data);return send(res,502,{error:'PAL-Bildspeicher nicht eingerichtet. Bitte PAL-1.0-SQL ausführen.'})}
  // Supabase liefert {url: '/object/upload/sign/...?...'}; signierte Adresse nur an unser Supabase-Projekt binden.
  const signed=new URL(data.url.startsWith('/object/')?`${base}/storage/v1${data.url}`:data.url,`${base}/storage/v1/`);
  if(signed.origin!==new URL(base).origin||!signed.pathname.startsWith('/storage/v1/object/upload/sign/'))return send(res,502,{error:'Ungültige Upload-Adresse'});
  return send(res,200,{path,url:signed.toString()});
 }catch(e){console.error('PAL media',e.message);return send(res,503,{error:'Bildspeicher momentan nicht erreichbar'})}
};
