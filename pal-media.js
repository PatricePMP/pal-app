/* PAL 1.1: private Cloud-Medien, schonende Fotooptimierung und verlustfreie Altbild-Migration. */
'use strict';
(()=>{
 const PREFIX='pal-media://';
 const OPTIMIZE_FROM_BYTES=1_000_000;
 const MAX_IMAGE_EDGE=1920;
 const WEBP_QUALITY=.85;
 const MAX_UPLOAD_BYTES=17_000_000; // Supabase-Bucket-Limit, nicht die Bildoptimierungsschwelle.
 const MAX_SOURCE_BYTES=40_000_000; // Schutz vor extrem großen Bilddateien im Browser.
 const ALLOWED_TYPES=new Set(['image/jpeg','image/png','image/webp']);
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
 function ensureUploadable(blob){
  if(!ALLOWED_TYPES.has(blob.type))throw Error('Nur JPEG-, PNG- und WebP-Bilder können gespeichert werden.');
  if(blob.size>MAX_UPLOAD_BYTES)throw Error('Auch nach der Optimierung ist das Bild größer als 17 MB. Bitte ein kleineres Bild wählen.');
 }
 function blobAsDataURL(blob){return new Promise((resolve,reject)=>{
  const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));
  reader.onerror=()=>reject(Error('Bild konnte nicht gelesen werden.'));
  reader.readAsDataURL(blob);
 })}
 async function optimizeBlob(input){
  if(!(input instanceof Blob))throw Error('Bitte eine Bilddatei auswählen.');
  const kind=(input.type||'').toLowerCase();
  if(!kind.startsWith('image/'))throw Error('Bitte eine Bilddatei auswählen.');
  if(input.size>MAX_SOURCE_BYTES)throw Error('Das Ausgangsbild ist größer als 40 MB. Bitte vorher verkleinern.');
  // Kleine unterstützte Dateien bleiben bytegenau erhalten. Andere Formate müssen konvertiert werden.
  if(input.size<=OPTIMIZE_FROM_BYTES&&ALLOWED_TYPES.has(kind))return input;
  const objectURL=URL.createObjectURL(input);
  try{
   const img=new Image();img.src=objectURL;
   try{await img.decode()}catch{throw Error('Dieses Bildformat kann dein Browser nicht lesen. Bitte JPG, PNG oder WebP auswählen.');}
   const width=img.naturalWidth,height=img.naturalHeight;
   if(!width||!height)throw Error('Das Bild enthält keine gültigen Bilddaten.');
   const scale=Math.min(1,MAX_IMAGE_EDGE/Math.max(width,height));
   const canvas=document.createElement('canvas');
   canvas.width=Math.max(1,Math.round(width*scale));
   canvas.height=Math.max(1,Math.round(height*scale));
   const ctx=canvas.getContext('2d');if(!ctx)throw Error('Bildoptimierung ist in diesem Browser nicht verfügbar.');
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   ctx.drawImage(img,0,0,canvas.width,canvas.height);
   const reduced=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',WEBP_QUALITY));
   // Falls der Browser WebP-Encoding nicht beherrscht, das Original behalten.
   if(reduced&&reduced.type==='image/webp'&&(reduced.size<input.size||!ALLOWED_TYPES.has(kind)))return reduced;
   if(ALLOWED_TYPES.has(kind))return input;
   throw Error('Dieses Bildformat konnte nicht nach WebP umgewandelt werden. Bitte JPG oder PNG verwenden.');
  }finally{URL.revokeObjectURL(objectURL)}
 }
 async function prepareForEditor(file){
  const optimized=await optimizeBlob(file);ensureUploadable(optimized);
  return blobAsDataURL(optimized);
 }
 async function store(data,{legacy=false,prepared=false}={}){
  if(!data||isRef(data))return data;
  if(typeof data!=='string'&&!((typeof Blob!=='undefined')&&data instanceof Blob))return data;
  if(typeof data==='string'&&!isLegacy(data))return data;
  const raw=typeof data==='string'?bytesOfData(data):data;
  // Die alte Cloud-Migration bleibt bewusst bytegenau und wird NICHT erneut komprimiert.
  // 'prepared' heißt: bereits bei der Auswahl oder im Zuschneide-Editor optimiert.
  const blob=legacy||prepared?raw:await optimizeBlob(raw);
  ensureUploadable(blob);
  const digest=legacy?hex(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())):undefined;
  const r=await fetch('/api/media',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({mimeType:blob.type,legacy,digest})});
  const signed=await r.json().catch(()=>({}));
  if(!r.ok)throw Error(signed.error||`Bildspeicher: ${r.status}`);
  const up=await fetch(signed.url,{method:'PUT',headers:{'Content-Type':blob.type},body:blob});
  if(!up.ok)throw Error(`Bild konnte nicht hochgeladen werden (${up.status})`);
  return PREFIX+signed.path;
 }
 async function migrate(payload,onProgress){
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
 // Geräte-Backups in IndexedDB, getrennt vom begrenzten localStorage.
 async function backup(label,data){
  return new Promise((resolve,reject)=>{
   const open=indexedDB.open('PAL-v10-backups',1);
   open.onupgradeneeded=()=>open.result.createObjectStore('snapshots',{keyPath:'id'});
   open.onerror=()=>reject(open.error);
   open.onsuccess=()=>{
    const db=open.result,tx=db.transaction('snapshots','readwrite');
    const store=tx.objectStore('snapshots');const check=store.get(label);
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
 window.PAL_MEDIA={url,store,migrate,backup,readBackup,download,isLegacy,isRef,optimizeBlob,prepareForEditor,
  optimization:{thresholdBytes:OPTIMIZE_FROM_BYTES,maxEdge:MAX_IMAGE_EDGE,webpQuality:WEBP_QUALITY,maxUploadBytes:MAX_UPLOAD_BYTES}};
})();
