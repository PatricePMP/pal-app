/* PAL 1.2 · Projekt-Logbuch. Nur p.logbook wird ergänzt; keine parallele Datenbank.
   Bilddateien gelangen ausschließlich als pal-media://-Verweise in den synchronisierten Zustand. */
'use strict';
(()=>{
 let activeProject=null,tab='overview',filter='open',draft=null,working=false;
 const $=s=>document.querySelector(s);
 const book=p=>p?.logbook&&Array.isArray(p.logbook.notes)&&Array.isArray(p.logbook.tasks)&&Array.isArray(p.logbook.places)?p.logbook:null;
 const items=(b,type)=>b?.[type==='note'?'notes':type==='task'?'tasks':'places']||[];
 const uid=()=>getId();
 const safe=val=>esc(val??'');
 const dateStamp=()=>new Date().toISOString();
 const findPlace=(b,id)=>b.places.find(x=>x.id===id)?.title||'';
 const cover=p=>p?.backgroundImage?bgFor(p):imageFor(p);
 const photoUrl=x=>mediaSrc(x?.ref);
 const shortDesc=x=>safe(x||'Noch keine Beschreibung.');
 const button=(type,label)=>`<button class="book-btn" data-book="add" data-type="${type}">＋ ${label}</button>`;
 function touch(p){p.updatedAt=dateStamp();return save()}
 function photos(x){return x.images?.length?`<div class="book-thumbs">${x.images.map(i=>`<button type="button" data-book="photo" data-ref="${attr(i.ref)}" aria-label="Bild ${attr(i.name)} vergrößern"><img loading="lazy" src="${attr(photoUrl(i))}" alt="${attr(i.name)}"/></button>`).join('')}</div>`:''}
 function noteCard(b,x){return `<article class="book-card"><div class="book-meta">Notiz ${x.placeId&&findPlace(b,x.placeId)?'· 📍 '+safe(findPlace(b,x.placeId)):''}</div><h3>${safe(x.title)}</h3><p>${shortDesc(x.text)}</p>${photos(x)}<button class="book-link" data-book="edit" data-type="note" data-id="${attr(x.id)}">${editing(project(activeProject))?'Öffnen und bearbeiten':'Ansehen'} ↗</button></article>`}
 function placeCard(b,x){const n=b.notes.filter(i=>i.placeId===x.id).length,t=b.tasks.filter(i=>i.placeId===x.id&&!i.done).length;return `<article class="book-card"><div class="book-place-scene" style="background-image:linear-gradient(0deg,#172328a6,transparent),url('${attr(photoUrl(x.images?.[0])||'')}')">📍</div><div class="book-meta">Schauplatz · ${safe(x.status||'Entdeckt')}</div><h3>${safe(x.title)}</h3><p>${shortDesc(x.text)}</p>${photos(x)}<div class="book-meta">${n} Notiz(en) · ${t} offene Aufgabe(n)</div><button class="book-link" data-book="edit" data-type="place" data-id="${attr(x.id)}">${editing(project(activeProject))?'Öffnen und bearbeiten':'Ansehen'} ↗</button></article>`}
 function taskRow(b,x){const location=x.placeId&&findPlace(b,x.placeId)?'📍 '+safe(findPlace(b,x.placeId))+' · ':'';return `<div class="book-task"><input type="checkbox" data-book-done="${attr(x.id)}" aria-label="Aufgabe ${attr(x.title)} erledigt" ${x.done?'checked':''} ${!editing(project(activeProject))?'disabled':''}/><button class="book-task-body" data-book="edit" data-type="task" data-id="${attr(x.id)}"><b class="${x.done?'is-done':''}">${safe(x.title)}</b><small>${location}${x.done?'Erledigt':'Offen'}${x.assignee?' · '+(x.assignee==='patrick'?'Patrick':'Albert'):''}${x.images?.length?' · 📷 '+x.images.length:''}</small>${x.text?`<span>${safe(x.text)}</span>`:''}</button>${x.images?.[0]?`<button class="book-task-thumb" data-book="photo" data-ref="${attr(x.images[0].ref)}" aria-label="Bild öffnen"><img loading="lazy" src="${attr(photoUrl(x.images[0]))}" alt=""/></button>`:''}<button class="book-arrow" data-book="edit" data-type="task" data-id="${attr(x.id)}" aria-label="Aufgabe öffnen">↗</button></div>`}
 function overview(b,p,canEdit){const open=b.tasks.filter(x=>!x.done),recent=[...b.notes].sort((a,c)=>(c.updatedAt||'').localeCompare(a.updatedAt||''));return `<div class="book-head"><div><h2>${safe(p.subtitle||p.title)} Logbuch</h2><small>Dein persönliches Nachschlagewerk für dieses Projekt</small></div>${canEdit?button('note','Neuer Eintrag'):''}</div><div class="book-stats"><div>NOTIZEN<strong>${b.notes.length}</strong></div><div>OFFENE AUFGABEN<strong>${open.length}</strong></div><div>SCHAUPLÄTZE<strong>${b.places.length}</strong></div></div><div class="book-section"><h3>📌 Noch zu erledigen</h3><button data-book="tab" data-value="tasks">Alle ansehen →</button></div><div class="book-tasks">${open.slice(0,3).map(x=>taskRow(b,x)).join('')||'<p class="book-muted">Im Moment ist alles erledigt.</p>'}</div><div class="book-section"><h3>🗺️ Schauplätze</h3><button data-book="tab" data-value="places">Alle ansehen →</button></div><div class="book-cards">${b.places.slice(0,2).map(x=>placeCard(b,x)).join('')||'<p class="book-muted">Noch keine Schauplätze.</p>'}</div><div class="book-section"><h3>📝 Letzte Notizen</h3><button data-book="tab" data-value="notes">Alle ansehen →</button></div><div class="book-cards">${recent.slice(0,2).map(x=>noteCard(b,x)).join('')||'<p class="book-muted">Noch keine Notizen.</p>'}</div>`}
 function render(p,canEdit){if(activeProject!==p.id){activeProject=p.id;tab='overview';filter='open'}const b=book(p);
  if(!b)return `<div class="pal-book"><div class="book-blank"><div class="book-symbol">📖</div><h2>Noch kein Logbuch vorhanden</h2><p>Du kannst für ${safe(p.title)} ein eigenes Logbuch mit Notizen, Aufgaben, Bildern und Schauplätzen anlegen.</p>${canEdit?'<button class="book-btn" data-book="create">＋ Projekt-Logbuch anlegen</button>':'<p>Für dieses Projekt wurde noch kein Logbuch angelegt.</p>'}</div></div>`;
  const nav=[['overview','⌂ Übersicht'],['notes','▤ Notizen'],['tasks','☑ Aufgaben'],['places','⌖ Schauplätze']];let content='';
  if(tab==='overview')content=overview(b,p,canEdit);
  if(tab==='notes'){const sorted=[...b.notes].sort((a,c)=>(c.updatedAt||'').localeCompare(a.updatedAt||''));content=`<div class="book-head"><div><h2>Notizen</h2><small>Gedanken, Fotos und Informationen</small></div>${canEdit?button('note','Neue Notiz'):''}</div>${sorted.length?`<div class="book-cards">${sorted.map(x=>noteCard(b,x)).join('')}</div>`:'<p class="book-empty">📝 Noch keine Notizen</p>'}`}
  if(tab==='tasks'){const xs=b.tasks.filter(x=>filter==='all'||(filter==='open'?!x.done:x.done));content=`<div class="book-head"><div><h2>Aufgaben</h2><small>Checklisten mit Bildern und Ortsverknüpfungen</small></div>${canEdit?button('task','Neue Aufgabe'):''}</div><div class="book-filters">${[['open','Offen'],['done','Erledigt'],['all','Alle']].map(([id,title])=>`<button class="${filter===id?'active':''}" data-book="filter" data-value="${id}">${title}</button>`).join('')}</div>${xs.length?`<div class="book-tasks">${xs.map(x=>taskRow(b,x)).join('')}</div>`:'<p class="book-empty">✅ Keine Aufgaben in dieser Ansicht</p>'}`}
  if(tab==='places')content=`<div class="book-head"><div><h2>Schauplätze</h2><small>Orte sammeln, Notizen und Aufgaben verknüpfen</small></div>${canEdit?button('place','Neuer Ort'):''}</div>${b.places.length?`<div class="book-cards">${b.places.map(x=>placeCard(b,x)).join('')}</div>`:'<p class="book-empty">📍 Noch keine Orte</p>'}`;
  return `<div class="pal-book"><nav class="book-nav" aria-label="Logbuch-Bereiche">${nav.map(([id,title])=>`<button class="${tab===id?'active':''}" data-book="tab" data-value="${id}">${title}</button>`).join('')}</nav>${content}</div>`;
 }
 function rerender(){if(state.route==='detail'&&state.detailTab==='logbook')renderMain()}
 // „render“ ist bereits der Modulname, daher bewusst getrennt von der PAL-Hauptfunktion.
 function renderMain(){window.PAL_LOGBOOK?.refresh?.()}
 function refresh(){const target=$('#pal-book-container'),p=project(state.projectId);if(target&&p)target.innerHTML=render(p,editing(p))}
 function closeDialog(){if(!draft)return;for(const i of draft.images)if(i.previewUrl)URL.revokeObjectURL(i.previewUrl);draft=null;$('#pal-book-overlay')?.remove()}
 function placeOptions(b,id){return `<option value="">Keinem Ort zugeordnet</option>${b.places.map(p=>`<option value="${attr(p.id)}" ${p.id===id?'selected':''}>${safe(p.title)}</option>`).join('')}`}
 function openEditor(type,id){const p=project(state.projectId),b=book(p);if(!b||!viewing(p)||!['note','task','place'].includes(type))return;const record=id?items(b,type).find(x=>x.id===id):null;if(id&&!record)return;
  closeDialog();draft={projectId:p.id,type,id:id||null,images:(record?.images||[]).map(i=>({...i})),done:record?.done||false};
  const allowed=editing(p);const labels={note:'Notiz',task:'Aufgabe',place:'Schauplatz'};
  const placeFields=type==='place'?`<label>Status<select name="status">${['Entdeckt','Besucht','Abgeschlossen'].map(s=>`<option ${record?.status===s?'selected':''}>${s}</option>`).join('')}</select></label>`:`<label>Schauplatz zuordnen (optional)<select name="placeId">${placeOptions(b,record?.placeId)}</select></label>`;
  const assignee=type==='task'?`<label>Zugeordnet zu (optional)<select name="assignee"><option value="">Keine Zuordnung</option>${['patrick','albert'].map(x=>`<option value="${x}" ${record?.assignee===x?'selected':''}>${x==='patrick'?'Patrick':'Albert'}</option>`).join('')}</select></label>`:'';
  const related=type==='place'&&record?`<div class="book-related"><b>Verknüpfte Einträge</b><p>${b.notes.filter(x=>x.placeId===id).map(x=>'📝 '+safe(x.title)).concat(b.tasks.filter(x=>x.placeId===id).map(x=>'☑ '+safe(x.title))).join(' · ')||'Noch keine Verknüpfungen'}</p></div>`:'';
  const overlay=document.createElement('div');overlay.id='pal-book-overlay';overlay.className='pal-book-overlay';overlay.innerHTML=`<div class="pal-book-modal" role="dialog" aria-modal="true" aria-label="${record?'Bearbeiten':'Neu anlegen'}: ${labels[type]}"><div class="book-modal-head"><h2>${record?'Bearbeiten':'Neu anlegen'}: ${labels[type]}</h2><button data-book="close" type="button" aria-label="Schließen">✕</button></div><form id="pal-book-form"><label>${type==='task'?'Aufgabe':'Titel'}<input name="title" maxlength="120" required value="${attr(record?.title||'')}" placeholder="Titel eingeben"/></label><label>${type==='task'?'Details (optional)':'Text und Informationen'}<textarea name="text" rows="5" placeholder="Was möchtest du festhalten?">${safe(record?.text||'')}</textarea></label>${placeFields}${assignee}<label class="book-upload">📷 Fotos oder Screenshots anhängen <input id="pal-book-upload" type="file" accept="image/*" multiple/></label><p class="book-muted">Fotos werden auf maximal 1200 Pixel und ungefähr 70 % WebP-Qualität reduziert.</p><div id="pal-book-draft-photos" class="book-thumbs"></div>${related}<div class="book-dialog-actions">${record?'<button type="button" class="book-danger" data-book="delete">Löschen</button>':'<span></span>'}<button type="submit" class="book-btn">${record?'Änderungen speichern':'Hinzufügen'}</button></div></form></div>`;
  document.body.append(overlay);if(!allowed){overlay.querySelectorAll('#pal-book-form input,#pal-book-form textarea,#pal-book-form select').forEach(x=>x.disabled=true);overlay.querySelector('.book-upload')?.remove();overlay.querySelector('.book-dialog-actions')?.remove()}showDraftPhotos();overlay.querySelector('[name="title"]').focus();
 }
 function showDraftPhotos(){const root=$('#pal-book-draft-photos');if(!root||!draft)return;root.innerHTML=draft.images.map(i=>`<div class="book-photo-item"><img src="${attr(i.previewUrl||photoUrl(i))}" alt="${attr(i.name||'Anhang')}"/><button type="button" data-book="remove" data-id="${attr(i.id)}" aria-label="Foto entfernen">×</button></div>`).join('')}
 async function compress(file){if(!file?.type.startsWith('image/'))throw Error('Bitte eine Bilddatei auswählen.');if(file.size>40_000_000)throw Error('Bild ist zu groß.');const url=URL.createObjectURL(file);try{
   const img=new Image();img.src=url;await img.decode();const scale=Math.min(1,1200/Math.max(img.naturalWidth,img.naturalHeight));const cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(img.naturalWidth*scale));cv.height=Math.max(1,Math.round(img.naturalHeight*scale));const ctx=cv.getContext('2d');if(!ctx)throw Error('Bildkonvertierung nicht verfügbar.');ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,cv.width,cv.height);
   const blob=await new Promise(resolve=>cv.toBlob(resolve,'image/webp',.70));if(blob?.type==='image/webp')return blob;
   const fallback=await new Promise(resolve=>cv.toBlob(resolve,'image/jpeg',.70));if(fallback?.type==='image/jpeg')return fallback;throw Error('Bild kann nicht verkleinert werden.');
  }finally{URL.revokeObjectURL(url)}}
 async function addImages(files){const target=draft;if(!target||working)return;target.preparing=(target.preparing||0)+1;const saveBtn=$('#pal-book-form button[type="submit"]');if(saveBtn){saveBtn.disabled=true;saveBtn.textContent='Bilder werden vorbereitet …'}
  try{for(const file of [...files].slice(0,10)){try{const blob=await compress(file);if(draft!==target)return;const previewUrl=URL.createObjectURL(blob);target.images.push({id:uid(),name:file.name,blob,previewUrl})}catch(e){toast(e.message||'Bild konnte nicht verarbeitet werden.')}}}
  finally{target.preparing--;if(draft===target){showDraftPhotos();const btn=$('#pal-book-form button[type="submit"]');if(btn&&!target.preparing){btn.disabled=false;btn.textContent=target.id?'Änderungen speichern':'Hinzufügen'}}}
 }
 async function saveEditor(form){if(working||!draft)return;if(draft.preparing)return toast('Bitte warten, bis alle Bilder vorbereitet sind.');const p=project(draft.projectId),b=book(p);if(!p||!b||!editing(p))return toast('Dieses Projekt ist nur zur Ansicht freigegeben.');const name=form.elements.title.value.trim();if(!name)return toast('Bitte Titel eingeben.');working=true;const btn=form.querySelector('button[type="submit"]');if(btn){btn.disabled=true;btn.textContent='Speichere …'}
  try{const images=[];for(const i of draft.images){const ref=i.ref||(i.blob?await PAL_MEDIA.store(i.blob,{prepared:true}):null);if(ref)images.push({id:i.id,name:i.name,ref})}
   const now=dateStamp(),type=draft.type,id=draft.id,key=type==='note'?'notes':type==='task'?'tasks':'places';
   const old=items(b,type).find(x=>x.id===id);if(id&&!old)throw Error('Dieser Eintrag wurde inzwischen entfernt.');
   const next={id:id||uid(),title:name,text:form.elements.text.value.trim(),images,createdAt:old?.createdAt||now,updatedAt:now};
   if(type==='task'){next.done=old?.done||false;next.placeId=form.elements.placeId.value||'';next.assignee=form.elements.assignee.value||''}
   if(type==='note')next.placeId=form.elements.placeId.value||'';
   if(type==='place')next.status=form.elements.status.value;
   if(old)Object.assign(old,next);else b[key].unshift(next);
   if(!touch(p))throw Error('Gerätespeicher voll. Eintrag konnte nicht lokal gesichert werden.');
   closeDialog();refresh();toast('Eintrag lokal gespeichert · Cloud-Abgleich läuft');
  }catch(e){toast(e.message||'Logbuch konnte nicht gespeichert werden.')}finally{working=false;if(btn?.isConnected){btn.disabled=false;btn.textContent='Speichern'}}
 }
 function deleteEntry(){if(!draft)return;const p=project(draft.projectId),b=book(p);if(!editing(p)||!b||!draft.id)return;const type=draft.type,key=type==='note'?'notes':type==='task'?'tasks':'places';if(!window.confirm('Diesen Logbuch-Eintrag wirklich löschen?'))return;
  b[key]=b[key].filter(x=>x.id!==draft.id);if(type==='place'){b.notes.forEach(n=>{if(n.placeId===draft.id)n.placeId=''});b.tasks.forEach(n=>{if(n.placeId===draft.id)n.placeId=''})}touch(p);closeDialog();refresh();toast('Eintrag entfernt')
 }
 function openPhoto(ref){if(!ref||!PAL_MEDIA.isRef(ref))return;const wrap=document.createElement('div');wrap.className='pal-book-lightbox';wrap.id='pal-book-lightbox';wrap.innerHTML=`<button type="button" data-book="close-photo" aria-label="Bild schließen">✕</button><img src="${attr(mediaSrc(ref))}" alt="Logbuch-Foto in großer Ansicht"/>`;document.body.append(wrap)}
 document.addEventListener('click',ev=>{const b=ev.target.closest?.('[data-book]');if(!b){if(ev.target.id==='pal-book-overlay')closeDialog();if(ev.target.id==='pal-book-lightbox')ev.target.remove();return}
  const action=b.dataset.book;
  if(action==='tab'){tab=b.dataset.value;refresh()}
  if(action==='filter'){filter=b.dataset.value;refresh()}
  if(action==='create'){const p=project(state.projectId);if(!editing(p)||book(p))return;p.logbook={notes:[],tasks:[],places:[]};touch(p);refresh();toast('Projekt-Logbuch angelegt')}
  if(action==='add'||action==='edit')openEditor(b.dataset.type,b.dataset.id||null);
  if(action==='close')closeDialog();if(action==='remove'&&draft){const i=draft.images.findIndex(x=>x.id===b.dataset.id);if(i>=0){const [v]=draft.images.splice(i,1);if(v.previewUrl)URL.revokeObjectURL(v.previewUrl);showDraftPhotos()}}
  if(action==='delete')deleteEntry();if(action==='photo')openPhoto(b.dataset.ref);
  if(action==='close-photo')$('#pal-book-lightbox')?.remove();
 });
 document.addEventListener('change',ev=>{if(ev.target.matches?.('[data-book-done]')){const p=project(state.projectId),b=book(p);if(!editing(p)||!b){ev.target.checked=!ev.target.checked;return}const t=b.tasks.find(x=>x.id===ev.target.dataset.bookDone);if(t){t.done=ev.target.checked;t.updatedAt=dateStamp();touch(p);refresh()}}
  if(ev.target.id==='pal-book-upload'&&ev.target.files?.length){const files=[...ev.target.files];ev.target.value='';addImages(files)}
 });
 document.addEventListener('submit',ev=>{if(ev.target.id==='pal-book-form'){ev.preventDefault();saveEditor(ev.target)}});
 document.addEventListener('keydown',ev=>{if(ev.key==='Escape'){if($('#pal-book-lightbox'))$('#pal-book-lightbox').remove();else if(draft)closeDialog()}});
 window.PAL_LOGBOOK={render,refresh,book};
})();
