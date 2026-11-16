/* PAL 1.0: private Bilddateien im Supabase Storage, Metadaten im Cloud-JSON. */
'use strict';
(()=>{
 const PREFIX='pal-media://';
 const isRef=v=>typeof v==='string'&&v.startsWith(PREFIX);
 const isLegacy=v=>typeof v==='string'&&/^data:image\/(jpeg|png|webp);base64,/i.test(v);
 const pathOf=v=>isRef(v)?v.slice(PREFIX.length):'';
 function url(src){return isRef(src)?'/api/media?path='+encodeURIComponent(pathOf(src)):src;}
 function bytesOfData(data){
  const comma=data.indexOf(',');if(comma<0)throw Error('Ungültige Bilddaten');
  const mime=data.slice(5,comma).split(';')[0].toLowerCase();
  const bin=atob(data.slice(comma+1));const out=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);
  return new Blob([out],{type:mime});
 }
 function hex(buffer){return Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,'0')).join('')}
 async function store(data,{legacy=false}={}){
  if(!data||isRef(data))return data;
  if(!isLegacy(data))return data;
  const blob=bytesOfData(data);
  if(blob.size>17_000_000)throw Error('Ein Bild überschreitet 17 MB. Bitte kleiner exportieren.');
  const digest=legacy?hex(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())):undefined;
  const r=await fetch('/api/media',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({mimeType:blob.type,legacy,digest})});
  const signed=await r.json().catch(()=>({}));
  if(!r.ok)throw Error(signed.error||`Bildspeicher: ${r.status}`);
  // Signierte Upload-URLs sind zeitlich begrenzt und ausschließlich für dieses eine Objekt gültig.
  const up=await fetch(signed.url,{method:'PUT',headers:{'Content-Type':blob.type},body:blob});
  if(!up.ok)throw Error(`Bild konnte nicht hochgeladen werden (${up.status})`);
  return PREFIX+signed.path;
 }
 async function migrate(payload,onProgress){
  // Deep-Copy: Der Originalstand wird bei fehlgeschlagenem Upload nicht verändert.
  const copy=structuredClone(payload);
  const seen=new Map();let total=0,done=0;
  function count(x){if(isLegacy(x)){total++;return}if(Array.isArray(x)){x.forEach(count);return}if(x&&typeof x==='object')Object.values(x).forEach(count)}
  count(copy);
  async function walk(x){
   if(isLegacy(x)){
    if(!seen.has(x))seen.set(x,store(x,{legacy:true}));
    const result=await seen.get(x);done++;onProgress?.(done,total);return result;
   }
   if(Array.isArray(x)){for(let i=0;i<x.length;i++)x[i]=await walk(x[i]);return x}
   if(x&&typeof x==='object'){for(const key of Object.keys(x))x[key]=await walk(x[key]);return x}
   return x;
  }
  return {state:await walk(copy),total};
 }
 // Eigenständige Geräte-Backups in IndexedDB (separat vom häufig begrenzten LocalStorage).
 async function backup(label,data){
  return new Promise((resolve,reject)=>{
   const open=indexedDB.open('PAL-v10-backups',1);
   open.onupgradeneeded=()=>open.result.createObjectStore('snapshots',{keyPath:'id'});
   open.onerror=()=>reject(open.error);
   open.onsuccess=()=>{
    const db=open.result,tx=db.transaction('snapshots','readwrite');
    const store=tx.objectStore('snapshots');
    const check=store.get(label);
    // Die allererste Sicherung bleibt auch nach späteren Aufrufen unverändert erhalten.
    check.onsuccess=()=>{if(!check.result)store.add({id:label,createdAt:new Date().toISOString(),state:data})};
    tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)};
   };
  });
 }
 function readBackup(label){
  return new Promise((resolve,reject)=>{
   const open=indexedDB.open('PAL-v10-backups',1);
   open.onupgradeneeded=()=>open.result.createObjectStore('snapshots',{keyPath:'id'});
   open.onerror=()=>reject(open.error);
   open.onsuccess=()=>{
    const db=open.result,tx=db.transaction('snapshots','readonly');
    const req=tx.objectStore('snapshots').get(label);
    req.onsuccess=()=>{resolve(req.result?.state||null);db.close()};
    req.onerror=()=>{reject(req.error);db.close()};
   };
  });
 }
 function download(label,object){
  const a=document.createElement('a');const blob=new Blob([JSON.stringify(object,null,2)],{type:'application/json'});a.href=URL.createObjectURL(blob);
  a.download=label+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000);
 }
 window.PAL_MEDIA={url,store,migrate,backup,readBackup,download,isLegacy,isRef};
})();
