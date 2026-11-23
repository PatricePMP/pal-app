/* PAL 1.2 · Zeitreise 2.0 – Port der freigegebenen HTML-Vorschau.
   Keine eigenen Projektkopien und keine Cloud-Mutationen. */
'use strict';
(()=>{
 const DAY=86400000;
 const dateUTC=s=>Date.UTC(+s.slice(0,4),+s.slice(5,7)-1,+s.slice(8,10));
 const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(dateUTC(s))&&new Date(dateUTC(s)).toISOString().slice(0,10)===s;
 const days=(a,b)=>Math.round((dateUTC(b)-dateUTC(a))/DAY);
 const add=(a,n)=>new Date(dateUTC(a)+n*DAY).toISOString().slice(0,10);
 const monthStart=d=>d.slice(0,7)+'-01';
 const nextMonth=d=>{const x=new Date(dateUTC(monthStart(d)));x.setUTCMonth(x.getUTCMonth()+1);return x.toISOString().slice(0,10)};
 const fmt=s=>validDate(s)?new Date(dateUTC(s)).toLocaleDateString('de-DE',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}):'Offen';
 const monthName=s=>new Date(dateUTC(s)).toLocaleDateString('de-DE',{month:'short',timeZone:'UTC'});
 const opt=(value,current,label)=>`<option value="${value}" ${value===current?'selected':''}>${label}</option>`;
 let lastSpan=null,lastViewport=null,fullShell=null,fullParent=null;
 const el=id=>document.getElementById(id);
 function shell(){
  const person=['all','shared','patrick','albert'].includes(state.timelineFilter)?state.timelineFilter:'all';
  const category=state.timelineCategory||'all',status=state.timelineStatus||'all',scale=['week','month','year'].includes(state.timelineScale)?state.timelineScale:'month';
  return `<section class="pal-journey" id="pal-journey"><main class="shell" id="pal-journey-shell">
   <header class="top"><div><div class="eyebrow">Patrick & Albert ♡</div><h1>Zeitreise <span aria-hidden="true">✧</span></h1><p>Unsere Projekte, ihre Zeiträume und Überschneidungen</p></div><div class="actions"><button class="icon-btn" data-tl="today" title="Zum heutigen Datum" aria-label="Heute anzeigen">⌖</button><button class="icon-btn" data-tl="full" title="Vollbild ein- oder ausschalten" aria-label="Vollbild">⛶</button></div></header>
   <section class="filters" aria-label="Filter und Ansichtsoptionen">
   <label class="input-group">Person <select data-tl-filter="person" aria-label="Nach Person filtern">${opt('all',person,'Alle')}${opt('shared',person,'Gemeinsam')}${opt('patrick',person,'Patrick')}${opt('albert',person,'Albert')}</select></label>
   <label class="input-group">Art <select data-tl-filter="category" aria-label="Nach Art filtern">${opt('all',category,'Alle')}${categories.map(c=>opt(esc(c),category,esc(c))).join('')}</select></label>
   <label class="input-group">Status <select data-tl-filter="status" aria-label="Nach Status filtern">${opt('all',status,'Alle')}${opt('active',status,'Aktiv')}${opt('completed',status,'Abgeschlossen')}${opt('paused',status,'Pausiert')}</select></label>
   <div class="segments" role="group" aria-label="Zoom">${[['week','Woche'],['month','Monat'],['year','Jahr']].map(([id,label])=>`<button data-tl="scale" data-value="${id}" class="${id===scale?'active':''}">${label}</button>`).join('')}</div>
   <span class="tally" id="pal-tl-tally"></span></section>
   <div class="toolbar"><span id="pal-tl-range">Zeitreise</span><div><button class="mini" data-tl="start">Zum Anfang</button> · <button class="mini" data-tl="today">Heute</button></div></div>
   <section class="viewport" id="pal-tl-viewport" aria-label="Horizontal und vertikal scrollbarer Zeitstrahl" tabindex="0"><div id="pal-tl-plane" class="plane"></div></section>
   <div class="footer"><span class="legendkey"><span></span>Projektzeitraum</span><span class="legendkey"><span class="dot"></span>Heute</span></div>
   </main></section>`;
 }
 function filtered(){return visibleProjects().filter(p=>validDate(p.startDate)&&['active','completed','paused'].includes(p.status)).filter(p=>{
  const who=state.timelineFilter||'all',category=state.timelineCategory||'all',status=state.timelineStatus||'all';
  return (who==='all'||(who==='shared'?p.owner==='both':p.owner===who||p.owner==='both'))&&(category==='all'||p.category===category)&&(status==='all'||p.status===status);
 });}
 function layout(items){const occupied=[],out=[];for(const p of items){let row=occupied.findIndex(end=>end<p.startDate);if(row<0){row=occupied.length;occupied.push('0000-00-00')}occupied[row]=p.effectiveEnd;out.push({...p,row})}return {out,count:occupied.length}}
 function viewDate(date){const vp=el('pal-tl-viewport');if(!vp||!lastSpan||!validDate(date))return;const x=lastSpan.left+days(lastSpan.start,date)*lastSpan.unit;vp.scrollLeft=Math.max(0,x-vp.clientWidth*.38)}
 function mount({preserve=false}={}){
  const vp=el('pal-tl-viewport'),plane=el('pal-tl-plane');if(!vp||!plane)return;
  let anchor=null;
  if(preserve&&lastSpan&&lastViewport===vp){anchor=add(lastSpan.start,Math.round((vp.scrollLeft+vp.clientWidth*.35-lastSpan.left)/lastSpan.unit))}
  const now=today(),scale=state.timelineScale||'month';
  const ps=filtered().map(p=>({...p,effectiveEnd:(p.status==='completed'&&validDate(p.endDate))?p.endDate:now})).filter(p=>p.effectiveEnd>=p.startDate).sort((a,b)=>a.startDate.localeCompare(b.startDate)||a.effectiveEnd.localeCompare(b.effectiveEnd)||a.title.localeCompare(b.title,'de'));
  const {out,count}=layout(ps),unit=scale==='week'?18:scale==='year'?1.85:8,edge=24,rowHeight=51,top=49;
  const min=ps.length?ps.reduce((m,p)=>p.startDate<m?p.startDate:m,ps[0].startDate):now;
  const max=ps.length?ps.reduce((m,p)=>p.effectiveEnd>m?p.effectiveEnd:m,ps[0].effectiveEnd):now;
  const start=add(monthStart(min),scale==='year'?-45:-18),end=add(max,scale==='year'?170:80);
  const width=Math.max(vp.clientWidth,days(start,end)*unit+edge*2),height=Math.max(vp.clientHeight,top+Math.max(1,count)*rowHeight+20);
  plane.replaceChildren();plane.style.width=width+'px';plane.style.height=height+'px';
  const scaleEl=document.createElement('div');scaleEl.className='timescale';scaleEl.style.width=width+'px';plane.append(scaleEl);
  let cursor=scale==='year'?start.slice(0,4)+'-01-01':monthStart(start),tickCount=0;
  while(cursor<end&&tickCount++<900){const boundary=edge+days(start,cursor)*unit,next=nextMonth(cursor),right=edge+days(start,next)*unit,isYear=cursor.endsWith('-01-01');
   const line=document.createElement('div');line.className='gridline';line.style.left=boundary+'px';plane.append(line);
   if(scale!=='year'||isYear){const tick=document.createElement('div');tick.className='month'+(isYear?' yearband':'');tick.style.left=Math.max(0,boundary)+'px';tick.style.width=Math.max(0,scale==='year'?365*unit:right-boundary)+'px';tick.textContent=scale==='year'?cursor.slice(0,4):monthName(cursor)+' '+cursor.slice(0,4);scaleEl.append(tick)}cursor=next;
  }
  for(let row=1;row<count;row++){const line=document.createElement('div');line.className='rowline';line.style.top=top+row*rowHeight+'px';plane.append(line)}
  for(const p of out){const x=edge+days(start,p.startDate)*unit,y=top+8+p.row*rowHeight,w=Math.max(10,(days(p.startDate,p.effectiveEnd)+1)*unit);
   const btn=document.createElement('button');btn.type='button';btn.className='bar'+(w<48?' tiny':w<115?' short':'');btn.style.left=x+'px';btn.style.top=y+'px';btn.style.width=w+'px';
   btn.style.backgroundImage=`url("${String(imageFor(p)).replace(/["\\\r\n]/g,'')}")`;
   if(/^#[0-9a-f]{6}$/i.test(p.accent||''))btn.style.borderBottomColor=p.accent;
   btn.title=p.title+' · '+fmt(p.startDate)+' – '+(p.status==='completed'?fmt(p.effectiveEnd):'heute');btn.setAttribute('aria-label',btn.title);
   btn.dataset.action='open-project';btn.dataset.id=p.id;
   const label=document.createElement('span');label.className='name';label.textContent=p.title;btn.append(label);plane.append(btn)
  }
  if(now>=start&&now<=end){const line=document.createElement('div');line.className='today';line.style.left=edge+days(start,now)*unit+'px';const badge=document.createElement('span');badge.className='today-label';badge.textContent='Heute';line.append(badge);plane.append(line)}
  lastSpan={start,left:edge,unit};lastViewport=vp;el('pal-tl-tally').textContent=out.length+' Projekte · '+count+' Zeilen';el('pal-tl-range').textContent=scale==='year'?'Jahresübersicht':scale==='week'?'Wochenübersicht':'Monatsübersicht';
  if(!out.length){const empty=document.createElement('div');empty.className='empty';empty.textContent='Keine Projekte für diese Filterkombination.';plane.append(empty)}
  if(anchor&&anchor>=start&&anchor<=end)viewDate(anchor);else viewDate(now);
 }
 function fullscreen(on){const shell=el('pal-journey-shell'),root=el('pal-journey');if(on&&shell&&root&&!fullShell){fullParent=root.parentElement;fullShell=shell;document.body.append(root);shell.classList.add('full');document.body.classList.add('pal-tl-fullscreen');shell.querySelector('[data-tl="full"]').textContent='⤢';requestAnimationFrame(()=>mount({preserve:true}));return}
  if(!on&&fullShell){const active=fullShell;active.classList.remove('full');document.body.classList.remove('pal-tl-fullscreen');if(fullParent?.isConnected)fullParent.append(root);else root?.remove();fullShell=null;fullParent=null;requestAnimationFrame(()=>mount({preserve:true}))}
 }
 // Die Timeline ist rein lesend. Filter/Zoom ändern nur lokale UI-Einstellungen.
 document.addEventListener('change',e=>{const select=e.target.closest?.('[data-tl-filter]');if(!select)return;
  const key=select.dataset.tlFilter;const mapping={person:'timelineFilter',category:'timelineCategory',status:'timelineStatus'};if(!mapping[key])return;state[mapping[key]]=select.value;save();mount({preserve:true});
 });
 document.addEventListener('click',e=>{const button=e.target.closest?.('[data-tl]');if(button){
  const action=button.dataset.tl;if(action==='today')viewDate(today());if(action==='start'){const vp=el('pal-tl-viewport');if(vp){vp.scrollLeft=0;vp.scrollTop=0}}
  if(action==='scale'){state.timelineScale=button.dataset.value;save();el('pal-journey-shell')?.querySelectorAll('[data-tl="scale"]').forEach(x=>x.classList.toggle('active',x===button));mount({preserve:true})}
  if(action==='full')fullscreen(!fullShell);
 }
 if(fullShell&&e.target.closest?.('.pal-journey .bar'))fullscreen(false);
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&fullShell)fullscreen(false)});
 document.addEventListener('wheel',e=>{const vp=e.target.closest?.('#pal-tl-viewport');if(vp&&e.shiftKey&&Math.abs(e.deltaY)>0){e.preventDefault();vp.scrollLeft+=e.deltaY}},{passive:false});
 window.addEventListener('resize',()=>{if(el('pal-tl-plane'))mount({preserve:true})});
 window.PAL_TIMELINE={shell,mount,exit:()=>fullscreen(false),validDate,layout};
})();
