/* PAL 1.0 – Cloud-Synchronisierung mit sicherer Sicherung und Medienmigration. */
'use strict';
(()=>{
 const sharedKeys=['themes','profileImages','profileOriginals','projects','entries','sessions','timer','designVersion'];
 const panel=document.getElementById('pal-gate');
 let revision=null,lastSnapshot='',dirty=false,busy=false,halted=false,authenticated=false,flushTimer=null,lastGood=null,cloudProblem='';
 let firstBoot=true;
 const $gate=()=>panel.querySelector('[data-gate-body]');
 const syncFields=()=>Object.fromEntries(sharedKeys.map(k=>[k,state[k]??null]));
 const serialized=()=>JSON.stringify(syncFields());
 const cleanState=()=>{const s=seed();s.projects=[];s.entries=[];s.sessions=[];s.timer=null;s.pinnedProject=null;return s};
 const errorMessage=e=>e instanceof Error?e.message:'Unbekannter Fehler';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const snapshot=s=>Object.fromEntries(sharedKeys.map(k=>[k,s?.[k]??null]));
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 let labelText='Verbinde …';
 async function request(path,options={}){
  const r=await fetch(path,{credentials:'same-origin',cache:'no-store',...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),...(options.headers||{})}});
  const j=await r.json().catch(()=>({}));
  if(!r.ok){const e=new Error(j.error||`Serverfehler ${r.status}`);e.status=r.status;throw e}return j;
 }
 function show(html){panel.hidden=false;$gate().innerHTML=html}
 function ready(){panel.hidden=true;document.body.classList.remove('pal-cloud-locked')}
 function label(){return labelText}
 function setStatus(message='',critical=false){
  const bar=document.getElementById('pal-cloud-status');
  bar.textContent=message;bar.hidden=!message;bar.dataset.error=critical?'true':'false';
  cloudProblem=critical?message:'';
  labelText=critical?'Fehler – nicht synchronisiert':message?'Synchronisiere …':lastGood?`Synchronisiert · ${lastGood.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}`:'Verbinde …';
  const el=document.getElementById('pal-profile-sync-status');if(el)el.textContent=labelText;
 }
 function markGood(){lastGood=new Date();setStatus('')}
 function authScreen(message=''){
  authenticated=false;
  show(`<div class="pal-auth-card"><h1>PAL ♡</h1><p>Unser gemeinsamer Ort für Projekte und Zeit.</p><form id="pal-auth-form"><label for="pal-code">Gemeinsamer Zugangscode</label><input id="pal-code" name="code" type="password" autocomplete="current-password" required minlength="8" autofocus><button type="submit">Anmelden</button></form>${message?`<p class="pal-auth-error">${esc(message)}</p>`:''}<p class="pal-auth-hint">Dein Code wird nur an den PAL-Server gesendet.</p></div>`);
  panel.querySelector('form').addEventListener('submit',async ev=>{
   ev.preventDefault();const button=ev.target.querySelector('button');button.disabled=true;
   try{await request('/api/auth',{method:'POST',body:JSON.stringify({code:ev.target.querySelector('[name=code]').value})});ev.target.querySelector('[name=code]').value='';authenticated=true;await initialLoad()}
   catch(e){authScreen(errorMessage(e))}
  });
 }
 function applyCloud(remote){
  const previousUser=state.user==='albert'?'albert':'patrick';
  const base=cleanState(),payload=remote&&Object.keys(remote).length?remote:{};
  state=Object.assign(base,payload);state.user=previousUser;
  for(const id of ['patrick','albert']){
   state.themes[id]||=base.themes[id];state.themes[id].style||='basic';state.themes[id].textMode||='auto';
  }
  state.profileImages||={patrick:null,albert:null};state.profileOriginals||={patrick:null,albert:null};
  if(!state.projects.some(p=>p.id===state.pinnedProject))state.pinnedProject=state.projects[0]?.id||null;
  if(state.route==='detail'&&!state.projects.some(p=>p.id===state.projectId))state.route='home';
  try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch{}
  lastSnapshot=serialized();dirty=false;render();markGood();
 }
 async function backups(remote,local){
  await PAL_MEDIA.backup('cloud-original-v10',remote);
  if(local)await PAL_MEDIA.backup('device-original-v10',local);
 }
 function mergeSafely(remote,local){
  const merged=structuredClone(remote),collisions=[];
  for(const name of ['projects','entries','sessions']){
   const dst=Array.isArray(merged[name])?merged[name]:[];
   const current=Array.isArray(local[name])?local[name]:[];
   const byId=new Map(dst.map(x=>[x.id,x]));
   for(const x of current){
    if(!byId.has(x.id)){dst.push(structuredClone(x));byId.set(x.id,x);continue}
    const old=byId.get(x.id);
    if(same(old,x))continue;
    if(name==='projects'&&String(x.updatedAt||'')>String(old.updatedAt||'')){
     Object.assign(old,structuredClone(x));continue;
    }
    if(name==='entries'&&!old.image&&x.image){Object.assign(old,structuredClone(x));continue}
    if(name==='entries'){
     // Lokale Fassung bleibt im Tagebuch sichtbar, statt einen widersprüchlichen Eintrag zu überschreiben.
     const rescued=structuredClone(x);rescued.id='rescued-'+crypto.randomUUID();
     rescued.title=(rescued.title||'Erinnerung')+' (lokale Fassung)';rescued.highlight=false;
     dst.push(rescued);continue;
    }
    collisions.push(name+': '+String(x.title||x.id));
   }
   merged[name]=dst;
  }
  // Ergänzungen ohne Ersatz bestehender Profileinstellungen oder laufender Timer.
  for(const k of ['profileImages','profileOriginals']){
   merged[k]||={};
   for(const id of ['patrick','albert'])if(!merged[k][id]&&local[k]?.[id])merged[k][id]=structuredClone(local[k][id]);
  }
  merged.themes||={};
  for(const id of ['patrick','albert'])if(!merged.themes[id]&&local.themes?.[id])merged.themes[id]=structuredClone(local.themes[id]);
  merged.designVersion=Math.max(Number(remote.designVersion)||0,Number(local.designVersion)||0,7);
  return {merged,collisions};
 }
 function localChoice(remote,local){
  return new Promise(resolve=>{
   const a=local.projects?.length||0,b=remote.projects?.length||0;
   const le=local.entries?.length||0,re=remote.entries?.length||0;
   show(`<div class="pal-auth-card"><h1>Gerätestand gefunden</h1><p>Auf diesem Gerät liegen PAL-Daten, die vom Cloud-Stand abweichen. Nichts wird automatisch überschrieben.</p><p><strong>Dieses Gerät:</strong> ${a} Projekte, ${le} Einträge<br><strong>Cloud:</strong> ${b} Projekte, ${re} Einträge</p><p class="pal-auth-hint">Beide Stände wurden im Geräte-Backup gesichert. Beim Zusammenführen bleiben Cloud-Einträge mit unklaren Konflikten unverändert; die lokale Kopie bleibt zur Prüfung erhalten.</p><button id="pal-merge-local" style="width:100%;margin:9px 0">Fehlende lokale Daten ergänzen</button><button id="pal-use-cloud" style="width:100%;margin:9px 0;background:#4a5861">Cloud-Stand verwenden</button><button id="pal-export-local" style="width:100%;margin:9px 0;background:#dbe5e1;color:#20343b">Lokales Backup herunterladen</button></div>`);
   document.getElementById('pal-merge-local').onclick=()=>resolve('merge');
   document.getElementById('pal-use-cloud').onclick=()=>resolve('cloud');
   document.getElementById('pal-export-local').onclick=()=>PAL_MEDIA.download('PAL-lokale-Sicherung',local);
  });
 }
 async function migrateAndCommit(payload,expectedRevision){
  if(!payload||typeof payload!=='object')return {payload,revision:expectedRevision};
  const hadLegacy=/"data:image\/(?:jpeg|png|webp);base64,/i.test(JSON.stringify(payload));
  if(!hadLegacy)return {payload,revision:expectedRevision};
  show('<div class="pal-auth-card"><h1>PAL 1.0</h1><p id="pal-migrate-progress">Sichere und übertrage eure vorhandenen Bilder …</p><p class="pal-auth-hint">Bitte die App während der Übertragung geöffnet lassen. Alte Bilder bleiben bis zum erfolgreichen Cloud-Speichern erhalten.</p></div>');
  const result=await PAL_MEDIA.migrate(payload,(done,total)=>{
   const el=document.getElementById('pal-migrate-progress');if(el)el.textContent=`Bilder übertragen: ${done} von ${total}`;
  });
  const r=await request('/api/state',{method:'PUT',body:JSON.stringify({revision:expectedRevision,state:result.state})});
  return {payload:result.state,revision:r.revision};
 }
 async function initialLoad(){
  show('<div class="pal-auth-card"><h1>PAL ♡</h1><p>Verbinde mit eurer Cloud …</p></div>');
  try{
   const result=await request('/api/state');
   let payload=snapshot(result.state&&Object.keys(result.state).length?result.state:cleanState());
   let expectedRevision=result.revision;
   let local=null;
   if(firstBoot&&window.PAL_PREBOOT_LOCAL){
    try{local=snapshot(JSON.parse(window.PAL_PREBOOT_LOCAL))}catch{}
   }
   await backups(payload,local);
   if(firstBoot&&local&&!same(local,payload)){
    const choice=await localChoice(payload,local);
    if(choice==='merge'){
     const {merged,collisions}=mergeSafely(payload,local);
     if(collisions.length){
      show(`<div class="pal-auth-card"><h1>Abweichende Änderungen</h1><p>${collisions.length} vorhandene Einträge unterscheiden sich auf diesem Gerät von der Cloud. Sie werden nicht automatisch ersetzt. Eine Kopie wurde gesichert.</p><button id="pal-continue-merge">Sichere Ergänzungen übernehmen</button><button id="pal-export-review" style="margin-top:10px;background:#4a5861">Lokale Sicherung herunterladen</button></div>`);
      await new Promise(resolve=>{document.getElementById('pal-continue-merge').onclick=resolve;document.getElementById('pal-export-review').onclick=()=>PAL_MEDIA.download('PAL-Konflikte-zur-Pruefung',local)});
     }
     payload=merged;
     // Ohne eingebaute Bilder ebenfalls nur nach einer erfolgreichen CAS-Aktualisierung übernehmen.
     const migrated=await PAL_MEDIA.migrate(payload,(done,total)=>{
      show(`<div class="pal-auth-card"><h1>Fotos übertragen</h1><p>${done} von ${total} Bildern</p></div>`);
     });
     const updated=await request('/api/state',{method:'PUT',body:JSON.stringify({revision:expectedRevision,state:migrated.state})});
     expectedRevision=updated.revision;payload=migrated.state;
    }
   }
   firstBoot=false;
   const migrated=await migrateAndCommit(payload,expectedRevision);
   expectedRevision=migrated.revision;payload=migrated.payload;
   revision=expectedRevision;applyCloud(payload);
   authenticated=true;halted=false;ready();
  }catch(e){
   if(e.status===401)return authScreen();
   setStatus('Cloud / Migration: '+errorMessage(e),true);
   show(`<div class="pal-auth-card"><h1>Cloud-Verbindung oder Bildübertragung fehlgeschlagen</h1><p>${esc(errorMessage(e))}</p><button id="pal-retry">Erneut versuchen</button><p class="pal-auth-hint">Die App bleibt geschützt, bis eure Daten sicher gelesen und migriert wurden. Es wurden keine vorhandenen Cloud-Bilder gelöscht.</p></div>`);
   document.getElementById('pal-retry').onclick=initialLoad;
  }
 }
 function changed(){
  if(!authenticated||revision===null||halted)return;
  if(serialized()===lastSnapshot)return;
  dirty=true;clearTimeout(flushTimer);flushTimer=setTimeout(flush,350);
 }
 async function flush(){
  if(busy||!dirty||halted||revision===null)return;
  busy=true;dirty=false;const next=serialized();setStatus('Synchronisiere …');
  try{
   const r=await request('/api/state',{method:'PUT',body:JSON.stringify({revision,state:JSON.parse(next)})});
   revision=r.revision;lastSnapshot=next;markGood();
   if(serialized()!==next)dirty=true;
  }catch(e){
   dirty=true;
   if(e.status===409){
    halted=true;
    PAL_MEDIA.backup('conflict-device-'+Date.now(),state).catch(()=>{});
    show('<div class="pal-auth-card"><h1>Änderungskonflikt</h1><p>Auf einem anderen Gerät wurde PAL gleichzeitig geändert. Deine lokale Version wurde nach Möglichkeit gesichert. Mit „Cloud-Version laden“ bleiben lokale Abweichungen im Backup erhalten.</p><button id="pal-accept-cloud">Cloud-Version prüfen</button></div>');
    document.getElementById('pal-accept-cloud').onclick=async()=>{halted=false;dirty=false;firstBoot=true;window.PAL_PREBOOT_LOCAL=JSON.stringify(state);await initialLoad()};
    setStatus('Synchronisierung angehalten: Änderungskonflikt',true);
   }else setStatus('Nicht synchronisiert: '+errorMessage(e),true);
  }finally{
   busy=false;if(dirty&&!halted){clearTimeout(flushTimer);flushTimer=setTimeout(flush,4000)}
  }
 }
 async function poll(){
  if(!authenticated||halted||busy||dirty||revision===null||document.hidden)return;
  try{
   const r=await request('/api/state');
   if(dirty||busy||halted)return;
   if(r.revision!==revision){revision=r.revision;applyCloud(r.state)}else if(cloudProblem)markGood();
  }catch(e){setStatus('Cloud momentan nicht erreichbar',true)}
 }
 async function exportBackups(){
  try{
   const local=await PAL_MEDIA.readBackup('device-original-v10');
   const cloud=await PAL_MEDIA.readBackup('cloud-original-v10');
   PAL_MEDIA.download('PAL-Backup-Paket',{exportedAt:new Date().toISOString(),current:syncFields(),deviceBeforeV10:local,cloudBeforeV10:cloud});
  }catch(e){setStatus('Sicherung konnte nicht gelesen werden: '+errorMessage(e),true)}
 }
 window.PAL_SYNC={changed,label,exportBackups};
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll()});
 setInterval(poll,5000);
 request('/api/auth').then(r=>{if(r.authenticated){authenticated=true;initialLoad()}else authScreen()}).catch(()=>authScreen('Server nicht erreichbar. Bitte Vercel-Einstellungen prüfen.'));
})();
