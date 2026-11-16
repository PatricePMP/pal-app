'use strict';
const {send,valid,sameOrigin,database,MAX_BYTES}=require('../lib/pal-server');
module.exports=async(req,res)=>{
 if(!valid(req))return send(res,401,{error:'Bitte anmelden'});
 if(!['GET','PUT'].includes(req.method))return send(res,405,{error:'Methode nicht erlaubt'});
 if(req.method==='PUT'&&!sameOrigin(req))return send(res,403,{error:'Ungültiger Ursprung'});
 try{
  if(req.method==='GET'){
   const rows=await database('pal_sync_state?singleton_id=eq.1&select=state,revision');
   if(!Array.isArray(rows)||rows.length!==1)return send(res,503,{error:'PAL-Cloud-Tabelle fehlt. Bitte zunächst SQL-Schritt 2 ausführen.'});
   return send(res,200,rows[0]);
  }
  const body=req.body;
  if(!body||!Number.isSafeInteger(body.revision)||body.revision<0||!body.state||typeof body.state!=='object'||Array.isArray(body.state))return send(res,400,{error:'Ungültige Daten'});
  const allowed=['themes','profileImages','profileOriginals','projects','entries','sessions','timer','designVersion'];
  if(Object.keys(body.state).some(k=>!allowed.includes(k)))return send(res,400,{error:'Unbekannte Datenfelder'});
  if(!Array.isArray(body.state.projects)||!Array.isArray(body.state.entries)||!Array.isArray(body.state.sessions))return send(res,400,{error:'Datenstruktur unvollständig'});
  const raw=JSON.stringify(body.state);
  if(Buffer.byteLength(raw,'utf8')>MAX_BYTES)return send(res,413,{error:'Zu viele Text- oder Metadaten (maximal 3,5 MB je Cloud-Datenstand). Bilder werden getrennt gespeichert.'});
  const rows=await database(`pal_sync_state?singleton_id=eq.1&revision=eq.${body.revision}`,{method:'PATCH',headers:{'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify({state:body.state,revision:body.revision+1,updated_at:new Date().toISOString()})});
  if(!Array.isArray(rows)||rows.length!==1)return send(res,409,{error:'Auf dem anderen Gerät wurden inzwischen Änderungen gespeichert. Bitte Cloud-Version neu laden.'});
  return send(res,200,{revision:rows[0].revision});
 }catch(e){console.error('PAL state',e.message);return send(res,503,{error:'Cloud derzeit nicht erreichbar oder noch nicht eingerichtet'})}
};
