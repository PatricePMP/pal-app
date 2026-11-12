/* PAL 0.8 – geschützter gemeinsamer Datenstand. Kein Supabase-Schlüssel im Browser. */
'use strict';
(()=>{
 const sharedKeys=['themes','profileImages','profileOriginals','projects','entries','sessions','timer','designVersion'];
 const panel=document.getElementById('pal-gate');
 let revision=null,lastSnapshot='',dirty=false,busy=false,halted=false,authenticated=false,flushTimer=null;
 const $gate=()=>panel.querySelector('[data-gate-body]');
 const syncFields=()=>Object.fromEntries(sharedKeys.map(k=>[k,state[k]??null]));
 const serialized=()=>JSON.stringify(syncFields());
 const cleanState=()=>{const s=seed();s.projects=[];s.entries=[];s.sessions=[];s.timer=null;s.pinnedProject=null;return s};
 const errorMessage=e=>e instanceof Error?e.message:'Unbekannter Fehler';
 async function request(path,options={}){
  const r=await fetch(path,{credentials:'same-origin',cache:'no-store',...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),...(options.headers||{})}});
  const json=await r.json().catch(()=>({}));
  if(!r.ok){const e=new Error(json.error||`Serverfehler ${r.status}`);e.status=r.status;throw e}
  return json;
 }
 function show(html){panel.hidden=false;$gate().innerHTML=html}
 function ready(){panel.hidden=true;document.body.classList.remove('pal-cloud-locked')}
 function authScreen(message=''){
  show(`<div class="pal-auth-card"><h1>PAL ♡</h1><p>Unser gemeinsamer Ort für Projekte und Zeit.</p><form id="pal-auth-form"><label for="pal-code">Gemeinsamer Zugangscode</label><input id="pal-code" name="code" type="password" autocomplete="current-password" required minlength="8" autofocus><button type="submit">Anmelden</button></form>${message?`<p class="pal-auth-error">${escapeText(message)}</p>`:''}<p class="pal-auth-hint">Der Code wird nur an eure eigene PAL-Adresse gesendet.</p></div>`);
  panel.querySelector('form').addEventListener('submit',async e=>{
   e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;
   try{await request('/api/auth',{method:'POST',body:JSON.stringify({code:e.target.querySelector('[name=code]').value})});e.target.querySelector('[name=code]').value='';authenticated=true;await initialLoad()}
   catch(err){authScreen(errorMessage(err))}
  });
 }
 function escapeText(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
 function status(message,critical=false){
  const bar=document.getElementById('pal-cloud-status');
  bar.textContent=message;bar.hidden=!message;bar.dataset.error=critical?'true':'false';
 }
 function applyCloud(remote){
  const previousUser=state.user==='albert'?'albert':'patrick';
  const base=cleanState();const payload=remote&&Object.keys(remote).length?remote:{};
  state=Object.assign(base,payload);
  state.user=previousUser;
  for(const id of ['patrick','albert']){
   state.themes[id] ||=base.themes[id];
   state.themes[id].style ||= 'basic';state.themes[id].textMode ||= 'auto';
  }
  state.profileImages ||= {patrick:null,albert:null};
  state.profileOriginals ||= {patrick:null,albert:null};
  if(!state.projects.some(p=>p.id===state.pinnedProject))state.pinnedProject=state.projects[0]?.id||null;
  if(state.route==='detail'&&!state.projects.some(p=>p.id===state.projectId))state.route='home';
  try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch{}
  lastSnapshot=serialized();dirty=false;render();
 }
 async function initialLoad(){
  show('<div class="pal-auth-card"><h1>PAL ♡</h1><p>Verbinde mit unserer Cloud …</p></div>');
  try{
   const remote=await request('/api/state');
   revision=remote.revision;applyCloud(remote.state);
   authenticated=true;halted=false;ready();status('');
  }catch(e){
   if(e.status===401)return authScreen();
   show(`<div class="pal-auth-card"><h1>Cloud-Verbindung fehlt</h1><p>${escapeText(errorMessage(e))}</p><button id="pal-retry">Erneut prüfen</button><p class="pal-auth-hint">Die App bleibt gesperrt, damit keine Änderungen nur auf einem Gerät landen.</p></div>`);
   document.getElementById('pal-retry').addEventListener('click',initialLoad);
  }
 }
 function changed(){
  if(!authenticated||revision===null||halted)return;
  const fresh=serialized();if(fresh===lastSnapshot)return;
  dirty=true;clearTimeout(flushTimer);
  flushTimer=setTimeout(flush,350);
 }
 async function flush(){
  if(busy||!dirty||halted||revision===null)return;
  busy=true;dirty=false;
  const snapshot=serialized();
  status('Synchronisiere …');
  try{
   const r=await request('/api/state',{method:'PUT',body:JSON.stringify({revision,state:JSON.parse(snapshot)})});
   revision=r.revision;lastSnapshot=snapshot;
   status('');
   if(serialized()!==snapshot)dirty=true;
  }catch(e){
   dirty=true;
   if(e.status===409){
    halted=true;
    try{localStorage.setItem('pal_cloud_conflict_backup',JSON.stringify(state))}catch{}
    show('<div class="pal-auth-card"><h1>Änderungskonflikt</h1><p>Auf dem anderen Gerät wurde PAL gleichzeitig geändert. Deine aktuelle Version wurde nach Möglichkeit lokal gesichert.</p><p>Mit „Cloud-Version laden“ übernimmst du den neuesten gemeinsamen Stand. Deine letzte lokale Änderung wird dabei nicht automatisch übernommen.</p><button id="pal-accept-cloud">Cloud-Version laden</button></div>');
    document.getElementById('pal-accept-cloud').onclick=async()=>{halted=false;dirty=false;await initialLoad()};
    status('Synchronisierung angehalten: Änderungskonflikt',true);
   }else status('Nicht synchronisiert: '+errorMessage(e)+'. Bitte Verbindung prüfen.',true);
  }finally{
   busy=false;
   if(dirty&&!halted){clearTimeout(flushTimer);flushTimer=setTimeout(flush,4000)}
  }
 }
 async function poll(){
  if(!authenticated||halted||busy||dirty||revision===null||document.hidden)return;
  try{
   const r=await request('/api/state');
   if(dirty||busy||halted)return;
   if(r.revision!==revision){revision=r.revision;applyCloud(r.state);status('')}
  }catch(e){status('Cloud momentan nicht erreichbar',true)}
 }
 window.PAL_SYNC={changed};
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll()});
 setInterval(poll,5000);
 request('/api/auth').then(r=>{if(r.authenticated){authenticated=true;initialLoad()}else authScreen()}).catch(()=>authScreen('Server nicht erreichbar. Bitte Vercel-Einstellungen prüfen.'));
})();
