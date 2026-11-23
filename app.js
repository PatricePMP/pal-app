'use strict';
const STORAGE='patrick-albert-universe-demo-v1';
const profiles={patrick:{name:'Patrick',initial:'P',label:'🎮'},albert:{name:'Albert',initial:'A',label:'🎬'}};
const categories=['Spiel','Serie','Film','Sonstiges'];
const statusLabels={planned:'Geplant',active:'Aktiv',paused:'Pausiert',completed:'Abgeschlossen',cancelled:'Abgebrochen'};
const colors=['#7BCFA7','#78BDE7','#BBA3EF','#F1B679','#F18FA5','#E3CA80','#72C8C2','#E1A2C8'];
const appColors=[['#F7F4EB','Vanille'],['#E0F4E9','Minze'],['#DFEEF8','Hellblau'],['#EEE6F7','Lavendel'],['#FBE8DA','Pfirsich'],['#FAE6EF','Rosé'],['#F8F0C7','Sonnengelb'],['#252E37','Dunkelgrau']];
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const attr=esc;
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const localDateTime=()=>{const d=new Date();return `${today()}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`};
const parseDate=s=>new Date(`${s}T12:00:00`);
const fmtDate=s=>s?parseDate(s.slice(0,10)).toLocaleDateString('de-DE',{day:'numeric',month:'short',year:'numeric'}):'Noch offen';
const shortDate=s=>s?parseDate(s.slice(0,10)).toLocaleDateString('de-DE',{day:'numeric',month:'short'}):'–';
const getId=()=>`id_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
const timeStr=ms=>{const sec=Math.max(0,Math.floor(ms/1000));return [Math.floor(sec/3600),Math.floor((sec%3600)/60),sec%60].map(v=>String(v).padStart(2,'0')).join(':')};
const formatMins=n=>`${Number(n).toLocaleString('de-DE',{maximumFractionDigits:1})} min`;
const toRGB=hex=>{let h=hex.replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)).join(',')};
function svgUrl(svg){return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg)}
function coverArt(kind){
 const defs=`<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#271a4a"/><stop offset=".52" stop-color="#a15d94"/><stop offset="1" stop-color="#ffc08a"/></linearGradient><linearGradient id="city" x2="0" y2="1"><stop stop-color="#311e4d"/><stop offset=".55" stop-color="#eb836b"/><stop offset="1" stop-color="#ffcf75"/></linearGradient><linearGradient id="ice" x2=".9" y2="1"><stop stop-color="#1b2e56"/><stop offset=".55" stop-color="#5867a4"/><stop offset="1" stop-color="#e0a9a1"/></linearGradient><linearGradient id="deep" x2="0" y2="1"><stop stop-color="#131425"/><stop offset=".6" stop-color="#303044"/><stop offset="1" stop-color="#6d6074"/></linearGradient><radialGradient id="sun"><stop stop-color="#fff0bd"/><stop offset=".3" stop-color="#ffb897"/><stop offset="1" stop-color="#ffb897" stop-opacity="0"/></radialGradient><filter id="blur"><feGaussianBlur stdDeviation="12"/></filter></defs>`;
 const stars=`<g fill="#ffe5ff" opacity=".72">${Array.from({length:32},(_,i)=>{const x=(i*71+17)%460,y=(i*43+29)%160,r=(i%4===0?1.8:.8);return `<circle cx="${x}" cy="${y}" r="${r}"/>`}).join('')}</g>`;
 let scene='';
 if(kind==='fantasy'||kind==='ff')scene=`<rect width="460" height="620" fill="${kind==='ff'?'url(#ice)':'url(#sky)'}"/><circle cx="332" cy="212" r="154" fill="url(#sun)"/><circle cx="328" cy="212" r="52" fill="#ffe9b3" opacity=".62"/>${stars}<path d="M0 345 L64 246 125 307 176 189 258 337 315 239 392 334 460 259V620H0Z" fill="${kind==='ff'?'#5a6786':'#5c426d'}" opacity=".85"/><path d="M0 405L88 300 144 381 239 265 326 397 390 313 460 382V620H0" fill="${kind==='ff'?'#354264':'#493757'}"/><path d="M0 475L90 400 175 458 270 340 369 435 460 390V620H0" fill="${kind==='ff'?'#202d49':'#29263e'}"/><g fill="#252138"><path d="M300 330h14v-48h13v-36h8v36h13v48h18v-79h9v-47h7v47h9v79h19v-40h9v40h7v43H300Z"/><path d="M328 246l3-36 4 36M372 204l4-39 3 39"/></g><path d="M0 515Q120 463 233 531T460 510V620H0" fill="${kind==='ff'?'#1b2440':'#1f2b36'}"/><path d="M0 565Q150 490 295 566T460 552V620H0" fill="#121b2c" opacity=".85"/>${kind==='ff'?'<circle cx="155" cy="210" r="72" fill="none" stroke="#d8c7f1" stroke-width="2" opacity=".4"/><path d="M155 120v180M65 210h180" stroke="#f0d1ec" opacity=".5"/>':'<path d="M25 590Q100 510 170 510T280 562" fill="none" stroke="#a4b177" stroke-width="4" opacity=".7"/>'}`;
 else if(kind==='gta')scene=`<rect width="460" height="620" fill="url(#city)"/><circle cx="296" cy="294" r="149" fill="url(#sun)"/><circle cx="297" cy="302" r="56" fill="#ffdf98" opacity=".67"/><g fill="#39283c"><rect x="0" y="351" width="50" height="181"/><rect x="47" y="392" width="60" height="141"/><rect x="111" y="344" width="63" height="195"/><rect x="175" y="408" width="64" height="131"/><rect x="238" y="362" width="37" height="172"/><rect x="276" y="321" width="75" height="219"/><rect x="347" y="387" width="64" height="150"/><rect x="409" y="341" width="51" height="200"/></g><g stroke="#1b1d2a" stroke-width="10" fill="none" stroke-linecap="round"><path d="M45 605C57 464 48 342 34 230M438 620C410 463 424 348 440 259"/></g><g stroke="#1c1c29" stroke-width="8" fill="none" stroke-linecap="round"><path d="M34 230Q2 203 -25 209M34 230Q67 194 104 203M34 230Q4 258 -10 283M34 230Q77 242 98 279M440 259Q397 210 367 226M440 259Q480 228 500 237M440 259Q393 277 373 303"/></g><rect y="514" width="460" height="106" fill="#25202f"/>`;
 else if(kind==='throne')scene=`<rect width="460" height="620" fill="url(#deep)"/>${stars}<circle cx="231" cy="295" r="178" fill="#bebaca" opacity=".09" filter="url(#blur)"/><g fill="#131322" stroke="#9691a7" stroke-width="2">${Array.from({length:20},(_,i)=>{let x=45+i*19;let y=310+Math.abs(i-10)*10;return `<path d="M${x} 405 L${x-12} ${y-114} L${x+10} ${y+15}Z"/>`}).join('')}</g><path d="M147 318L181 383H281L312 318L285 524H172Z" fill="#151521" stroke="#b1a3ae" stroke-width="4"/><path d="M124 452h212v31H124ZM155 481h150v123H155Z" fill="#26212c" stroke="#897f94" stroke-width="3"/><path d="M85 602L160 468 138 415M375 602l-73-134 20-56" fill="none" stroke="#a5a0b3" stroke-width="5"/>`;
 else if(kind==='spider')scene=`<rect width="460" height="620" fill="#1c2b55"/><circle cx="320" cy="225" r="228" fill="#aa4872" opacity=".4" filter="url(#blur)"/><path d="M0 0L460 580M0 140L460 450M460 0L0 590M460 200L0 450" stroke="#a5cbed" stroke-width="2" opacity=".25"/><g fill="#0d1937"><rect x="0" y="330" width="70" height="290"/><rect x="75" y="390" width="55" height="230"/><rect x="130" y="350" width="100" height="270"/><rect x="230" y="400" width="65" height="220"/><rect x="300" y="313" width="95" height="307"/><rect x="397" y="370" width="63" height="250"/></g><g fill="#ffe4c0" opacity=".35">${Array.from({length:65},(_,i)=>{let x=(i*57+19)%440,y=345+(i*31)%190;return `<rect x="${x}" y="${y}" width="4" height="7"/>`}).join('')}</g><path d="M170 623q-40-90-26-179 11-103 89-118 85 10 100 110 18 110-9 187" fill="#b42c4b" stroke="#182e5b" stroke-width="10"/><path d="M200 337q35 35 79 0M173 391q60 32 122 2M151 446q82 26 174 0M224 329l-5 290M258 330l13 290" fill="none" stroke="#2c426d" stroke-width="5"/><path d="M188 352q33 4 41 29-26 18-51 1M272 351q-33 4-41 29 26 18 51 1" fill="#d3e9ff" stroke="#233657" stroke-width="5"/>`;
 else if(kind==='puzzle')scene=`<rect width="460" height="620" fill="#554579"/><circle cx="348" cy="124" r="140" fill="#dc90b8" opacity=".7" filter="url(#blur)"/>${Array.from({length:24},(_,i)=>{const x=30+(i%4)*107,y=82+Math.floor(i/4)*90;const palette=['#eab8a0','#d3b4f1','#8cbfc9','#9bad89','#c874b8','#f1c87c'];return `<rect x="${x}" y="${y}" width="98" height="82" rx="10" fill="${palette[(i*7)%6]}" stroke="#fff8" stroke-width="3"/><circle cx="${x+49}" cy="${y+41}" r="15" fill="#554579" opacity=".7"/>`}).join('')}`;
 else scene=`<rect width="460" height="620" fill="url(#sky)"/>${stars}<circle cx="332" cy="160" r="135" fill="url(#sun)"/><path d="M0 420L90 302 182 400 279 275 460 436V620H0" fill="#4c3a61"/><path d="M0 519L145 390 307 505 460 412V620H0" fill="#24263e"/>`;
 return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="460" height="620" viewBox="0 0 460 620">${defs}${scene}</svg>`);
}
const coverAssets={fantasy:coverArt('fantasy'),ff:coverArt('ff'),gta:coverArt('gta'),throne:coverArt('throne'),spider:coverArt('spider'),puzzle:coverArt('puzzle'),generic:coverArt('generic')};
function seed(){return {
 user:'patrick',route:'home',projectId:null,detailTab:'diary',libraryFilter:'all',libraryView:'grid',librarySort:'recent',libraryQuery:'',timelineFilter:'all',timelineScale:'month',
 themes:{patrick:{accent:'#7BCFA7',appColor:'#F7F4EB',dim:55,blur:0,background:null,style:'basic',textMode:'auto'},albert:{accent:'#78BDE7',appColor:'#DFEEF8',dim:55,blur:0,background:null,style:'basic',textMode:'auto'}},profileImages:{patrick:null,albert:null},
 projects:[
 {id:'zelda',title:'The Legend of Zelda',subtitle:'Ocarina of Time',category:'Spiel',status:'active',owner:'both',visibility:'shared',credit:'neutral',startDate:'2026-11-08',endDate:'',description:'Unser neues Abenteuer in Hyrule.',cover:'fantasy',coverImage:null,backgroundImage:null,accent:'#c18eff',updatedAt:'2026-11-10T10:00:00'},
 {id:'ff12',title:'Final Fantasy XII',subtitle:'The Zodiac Age',category:'Spiel',status:'active',owner:'patrick',visibility:'private',credit:'albert',startDate:'2026-10-15',endDate:'',description:'Auf Streifzug durch Ivalice.',cover:'ff',coverImage:null,backgroundImage:null,accent:'#83b6dc',updatedAt:'2026-11-09T20:00:00'},
 {id:'got',title:'Game of Thrones',subtitle:'Staffel 1–8',category:'Serie',status:'completed',owner:'both',visibility:'shared',credit:'patrick',startDate:'2026-07-15',endDate:'2026-10-24',description:'Der Deal, mit dem alles angefangen hat.',cover:'throne',coverImage:null,backgroundImage:null,accent:'#b79bbd',updatedAt:'2026-10-24T23:00:00'},
 {id:'gta',title:'GTA San Andreas',subtitle:'Definitive Edition',category:'Spiel',status:'completed',owner:'both',visibility:'shared',credit:'patrick',startDate:'2026-08-01',endDate:'2026-09-03',description:'Ein gemeinsamer Ausflug nach Los Santos.',cover:'gta',coverImage:null,backgroundImage:null,accent:'#f7a479',updatedAt:'2026-09-03T21:00:00'},
 {id:'spider',title:'Marvel’s Spider-Man',subtitle:'Remastered',category:'Spiel',status:'completed',owner:'both',visibility:'shared',credit:'albert',startDate:'2026-09-01',endDate:'2026-10-16',description:'New York aus einer neuen Perspektive.',cover:'spider',coverImage:null,backgroundImage:null,accent:'#ed7898',updatedAt:'2026-10-16T23:00:00'},
 {id:'puzzle',title:'Puzzle-Abend',subtitle:'Irgendwann demnächst',category:'Sonstiges',status:'planned',owner:'patrick',visibility:'private',credit:'neutral',startDate:'',endDate:'',description:'Ein bisschen Knobeln und Quatschen.',cover:'puzzle',coverImage:null,backgroundImage:null,accent:'#b0e2aa',updatedAt:'2026-11-09T17:00:00'}],
 entries:[
 {id:'n1',projectId:'zelda',kind:'moment',title:'Willkommen in Hyrule',text:'Das Abenteuer geht los. Mal sehen, wo uns diese Reise hinführt! ♡',date:'2026-11-08',image:null,highlight:true,author:'patrick'},
 {id:'n2',projectId:'zelda',kind:'progress',title:'Unsere ersten Schritte',text:'Wir haben die ersten Ecken erkundet und schon ein paar Dinge entdeckt, die wir nicht vergessen möchten.',date:'2026-11-09',image:null,highlight:false,author:'albert'},
 {id:'n3',projectId:'got',kind:'moment',title:'Die große Serienreise ist geschafft',text:'Aus einem Deal wurde eine richtig schöne Erinnerung.',date:'2026-10-24',image:null,highlight:true,author:'patrick'},
 {id:'n4',projectId:'gta',kind:'moment',title:'Los Santos liegt hinter uns',text:'Was für ein Ausflug!',date:'2026-09-03',image:null,highlight:true,author:'albert'}],
 sessions:[
 {id:'s1',projectId:'got',minutes:90,credit:'patrick',date:'2026-10-20T20:00',note:'Noch eine Folge',author:'patrick'},
 {id:'s2',projectId:'gta',minutes:60,credit:'patrick',date:'2026-09-03T18:00',note:'Letzte Mission',author:'albert'},
 {id:'s3',projectId:'spider',minutes:30,credit:'albert',date:'2026-10-15T19:00',note:'Eine Runde schwingen',author:'patrick'},
 {id:'s4',projectId:'zelda',minutes:42,credit:'neutral',date:'2026-11-09T21:30',note:'Unser erster Abend',author:'patrick'}],
 timer:null,pinnedProject:'zelda'
};}
let state;
try{const v=localStorage.getItem(STORAGE);state=v?Object.assign(seed(),JSON.parse(v)):seed()}catch{state=seed()}
// Migration: Bestehende Projekte und Buchungen bleiben erhalten. Nur frühere Standardfarben
// wechseln auf die freundlichen Standardfarben des neuen Designs.
if(!state.designVersion||state.designVersion<5){
 for(const id of ['patrick','albert']){
  const t=state.themes?.[id]; if(!t)continue;
  if(id==='patrick' && (t.appColor||'').toLowerCase()==='#252432')t.appColor='#F7F4EB';
  if(id==='albert' && (t.appColor||'').toLowerCase()==='#273c5a')t.appColor='#DFEEF8';
  if(id==='patrick' && (t.accent||'').toLowerCase()==='#aa98cc')t.accent='#7BCFA7';
  if(id==='albert' && (t.accent||'').toLowerCase()==='#91b7cc')t.accent='#78BDE7';
  delete t.style;
 }
 state.projects.forEach(p=>delete p.style);
 state.designVersion=5;
 try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch{}
}
// V0.6 bewahrt den bestehenden LocalStorage-Schlüssel und ergänzt die neuen Felder.
state.themes ||= {};
for(const id of Object.keys(profiles)){
 state.themes[id] ||= {accent:'#7BCFA7',appColor:'#F7F4EB',dim:55,blur:0,background:null};
 state.themes[id].style ||= 'basic';
 state.themes[id].textMode ||= 'auto';
}
state.profileImages ||= {patrick:null,albert:null};
if(state.timer){
 const t=state.timer;
 t.status ||= t.running?'running':'paused';
 t.elapsedMs=Number.isFinite(t.elapsedMs)?t.elapsedMs:Number(t.elapsed)||0;
 if(t.status!=='running')t.startedAt=null;
 if(t.status==='pending'){delete t.nextProjectId;delete t.nextFromRecent;}
}
state.designVersion=7;
state.profileOriginals ||= {patrick:null,albert:null};
try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch{}
let modalType=null,modalArgs={},tempImages={};
let expandedRecentId=null;
const styleOptions=[['basic','Basic','Klare, freundliche Flächen'],['playful','Playful','Rund & verspielt'],['neon','Neon','Leuchtende Sci-Fi-Akzente'],['cinematic','Cinematic','Kantig & filmisch']];
const textModeOptions=[['auto','Automatisch'],['light','Helle Schrift'],['dark','Dunkle Schrift']];
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state));window.PAL_SYNC?.changed();return true}catch{toast('Der lokale Zwischenspeicher ist voll. Bitte eine Sicherung herunterladen.');return false}}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast._timeout);toast._timeout=setTimeout(()=>t.classList.remove('show'),2700)}
function project(id){return state.projects.find(p=>p.id===id)}
function viewing(p){return !!p&&(p.owner==='both'||p.owner===state.user||p.visibility==='view')}
function editing(p){return !!p&&(p.owner==='both'||p.owner===state.user)}
function visibleProjects(){return state.projects.filter(viewing)}
function editableProjects(){return state.projects.filter(editing)}
function mediaSrc(value){return window.PAL_MEDIA?.url(value)||value}
function imageFor(p){return mediaSrc(p?.coverImage)||coverAssets[p?.cover]||coverAssets.generic}
// Querformat bleibt unabhängig vom Bibliothekscover; ohne Header neutrales Ersatzbild.
function bgFor(p){return mediaSrc(p?.backgroundImage)||coverAssets.generic}
function ownerText(p){return p.owner==='both'?'♧ Gemeinsam':p.owner===state.user?'◉ Mein Projekt':'◯ Freigegeben'}
function creditText(c){return c==='patrick'?'Patrick':c==='albert'?'Albert':'Neutral'}
function ownerDisplay(o){return o==='both'?'Gemeinsam':profiles[o]?.name||o}
function balance(){const seconds=state.sessions.reduce((a,s)=>a+(s.credit==='patrick'?1:s.credit==='albert'?-1:0)*(Number.isFinite(Number(s.seconds))?Number(s.seconds):Math.round(Number(s.minutes||0)*60)),0);return Math.round(seconds/6)/10}
function recency(p){const sessionDates=state.sessions.filter(s=>s.projectId===p.id).map(s=>s.date);return [p.updatedAt,...sessionDates].filter(Boolean).sort().at(-1)||''}
function theme(){return state.themes[state.user]||state.themes.patrick}
function mixHex(a,b,weight){const parse=h=>{const v=h.replace('#','');return [0,2,4].map(i=>parseInt(v.slice(i,i+2),16))};const x=parse(a),y=parse(b);return '#'+x.map((v,i)=>Math.round(v*weight+y[i]*(1-weight)).toString(16).padStart(2,'0')).join('')}
function hexLuminance(hex){
 const rgb=toRGB(hex).split(',').map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4)});
 return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
}
function applyTheme(){
 let t={...theme()};
 if(state.route==='detail'){
  const p=project(state.projectId);
  if(viewing(p)){
   t.accent=p.accent||t.accent;
   if(p.style&&p.style!=='inherit')t.style=p.style;
   if(p.textMode&&p.textMode!=='inherit')t.textMode=p.textMode;
   if(p.backgroundImage){t.background=p.backgroundImage;t.dim=p.backgroundDim??55;t.blur=p.backgroundBlur??0}
  }
 }
 const style=['basic','playful','neon','cinematic'].includes(t.style)?t.style:'basic';
 const sourceBase=/^#[0-9a-f]{6}$/i.test(t.appColor||'')?t.appColor:'#F7F4EB';
 const base=sourceBase; // Jeder Stil respektiert die gewählte App-Farbe.
 const accent=/^#[0-9a-f]{6}$/i.test(t.accent||'')?t.accent:'#7BCFA7';
 const dark=hexLuminance(base)<.30;
 const lightText=t.textMode==='light'||(t.textMode!=='dark'&&dark);
 const text=lightText?'#F7F8FA':'#253139';
 const muted=lightText?'#C3CDD3':'#5D6D76';
 // Erzwungene Schriftfarben bekommen automatisch passende Leseflächen.
 let pane=dark?mixHex(base,'#FFFFFF',.84):mixHex(base,'#FFFFFF',.20);
 let pane2=dark?mixHex(base,'#FFFFFF',.72):mixHex(base,'#FFFFFF',.52);
 let nav=dark?mixHex(base,'#FFFFFF',.88):mixHex(base,'#FFFFFF',.14);
 if(lightText&&!dark){pane=mixHex(base,'#14202A',.13);pane2=mixHex(base,'#14202A',.22);nav=mixHex(base,'#14202A',.13)}
 if(!lightText&&dark){pane=mixHex(base,'#FFFFFF',.12);pane2=mixHex(base,'#FFFFFF',.22);nav=mixHex(base,'#FFFFFF',.12)}
 const line=lightText?'rgba(255,255,255,.17)':'rgba(35,53,63,.10)';
 const onAccent=hexLuminance(accent)>.24?'#203138':'#FFFFFF';
 const palette={
  '--accent':accent,'--accent-rgb':toRGB(accent),'--app-base':base,'--app-bg':base,
  '--app-pane':pane,'--app-pane2':pane2,'--app-strong':pane2,
  '--app-controls':pane,'--app-nav':nav,'--app-pane-rgb':toRGB(pane),
  '--app-nav-rgb':toRGB(nav),'--ui-text':text,'--ui-muted':muted,
  '--ui-line':line,'--ui-on-accent':onAccent,
  '--pane':pane,'--pane2':pane2,'--line':line,'--text':text,
  '--readable-field-bg':lightText?'#25313b':'#fffefa',
  '--readable-field-text':lightText?'#ffffff':'#253139'
 };
 const app=$('#app');app.className=`app-shell friendly-ui style-${style} ${lightText?'tone-dark':'tone-light'}`;
 document.documentElement.dataset.tone=lightText?'dark':'light';
 for(const [key,value] of Object.entries(palette)){app.style.setProperty(key,value);document.documentElement.style.setProperty(key,value)}
 const ambient=$('#ambient');
 if(t.background){
  const opacity=Math.max(.10,Math.min(.92,Number(t.dim)/100));
  const overlay=lightText?'18,24,29':'248,247,242';
  ambient.classList.add('has-custom-background');
  ambient.style.backgroundImage=`linear-gradient(rgba(${overlay},${opacity}),rgba(${overlay},${opacity})),url("${mediaSrc(t.background)}")`;
  ambient.style.filter=`blur(${t.blur}px)`;
  ambient.style.transform=t.blur?'scale(1.07)':'none';
 }else{
  ambient.classList.remove('has-custom-background');
  ambient.style.backgroundImage='';ambient.style.filter='';ambient.style.transform='';
 }
}
function setRoute(route,projectId=null){if(modalType)closeModal();state.route=route;if(projectId)state.projectId=projectId;state.detailTab='diary';save();render();$('#view').scrollTop=0}
function render(){window.PAL_TIMELINE?.exit();applyTheme();const v=$('#view');if(state.route==='home')v.innerHTML=renderHome();else if(state.route==='library')v.innerHTML=renderLibrary();else if(state.route==='timeline')v.innerHTML=renderTimeline();else if(state.route==='profile')v.innerHTML=renderProfile();else if(state.route==='detail')v.innerHTML=renderDetail();else state.route='home',v.innerHTML=renderHome();renderNav();updateTimerDisplay();applyPlayfulShapes();if(state.route==='timeline')window.PAL_TIMELINE?.mount()}
function renderNav(){const items=[['home','⌂','Home'],['library','▥','Bibliothek'],['timeline','♧','Zeitreise'],['profile','♙','Profil']];$('#bottom-nav').innerHTML=items.map(([id,icon,label])=>`<button class="nav-item ${state.route===id?'active':''}" data-action="nav" data-id="${id}"><span class="nav-icon">${icon}</span>${label}</button>`).join('')}
function avatarHtml(id,extraClass=''){
 const v=profiles[id];
 const photo=state.profileImages?.[id];
 return `<span class="avatar ${id==='albert'?'alt':''} ${photo?'has-photo':''} ${extraClass}">${photo?`<img class="avatar-photo" src="${mediaSrc(photo)}" alt=""/>`:v.initial}</span>`;
}
function avatars(){return `<div class="profiles">${Object.entries(profiles).map(([id,v])=>`<button class="avatar-button ${state.user===id?'selected':''}" data-action="switch-profile" data-id="${id}" title="${v.name} auswählen">${avatarHtml(id)}</button>`).join('')}</div>`}
function header(home=false){return `<div class="brand-row"><div><div class="brand-title">Patrick & Albert ♡</div><div class="brand-tag">Unsere Projekte · Unsere Zeit · Unsere Erlebnisse</div></div>${avatars()}</div>`}
function section(title,action='',cmd='',id=''){return `<div class="section-line"><h2 class="section-title">${title}</h2>${action?`<button class="action-text" data-action="${cmd}" ${id?`data-id="${id}"`:''}>${action} →</button>`:''}</div>`}
function statusIcon(s){return s==='completed'?'✓':s==='active'?'▶':s==='paused'?'Ⅱ':s==='planned'?'◇':'×'}
function timerElapsed(){const t=state.timer;if(!t)return 0;return Math.max(0,(t.elapsedMs??t.elapsed??0)+(t.status==='running'&&t.startedAt?Date.now()-t.startedAt:0))}
function renderHome(){
 const b=balance(),t=state.timer;
 const timerProject=t?.projectId&&viewing(project(t.projectId))?project(t.projectId):null;
 const selected=timerProject||(project(state.pinnedProject)&&viewing(project(state.pinnedProject))?project(state.pinnedProject):visibleProjects().find(p=>p.status==='active')||visibleProjects()[0]);
 const knob=50-Math.max(-42,Math.min(42,b/480*42));
 const items=visibleProjects().filter(p=>p.status!=='planned').sort((a,b)=>recency(b).localeCompare(recency(a))).slice(0,6);
 const isOwnTimer=!t||!t.owner||t.owner===state.user;
 const standalone=!!t&&!t.projectId;
 return `<div class="page home-page">${header(true)}
  <div class="credit-title">Zeitguthaben</div>
  <div class="glass credit-panel"><div class="credit-scale"><div class="credit-middle"></div><div class="credit-fill" style="${b>=0?`left:${knob}%;width:${50-knob}%;`:`left:50%;width:${knob-50}%;`}"></div><div class="credit-knob" style="left:${knob}%"></div><div class="credit-person"><span>Patrick</span><br>${b>0?'+'+formatMins(b):'0 min'}</div><div class="credit-person text-right"><span>Albert</span><br>${b<0?'+'+formatMins(-b):'0 min'}</div></div><div class="credit-foot">Aktueller Stand: <b>${b===0?'Ausgeglichen ♡':(b>0?'Patrick':'Albert')+' hat '+formatMins(Math.abs(b))+' Guthaben'}</b></div></div>
  ${standalone?`<div class="section-line"><h2 class="section-title">Aktiver Timer</h2><span class="soft-label">Ohne Projekt</span></div>
    <div class="standalone-timer glass" id="standalone-timer"><div class="timer-card-top"><span>◷ Timer ohne Projekt</span><span class="timer-state">${t.status==='running'?'Läuft':t.status==='paused'?'Pausiert':'Buchung offen'}</span></div>
      <div class="standalone-controls"><div class="timer-time live-clock">${timeStr(timerElapsed())}</div>${renderTimerButtons(null)}</div>
      ${isOwnTimer?`<button class="assign-inline" data-action="assign-timer">＋ Während der Laufzeit einem Projekt zuordnen</button>`:''}</div>`:''}
  ${section('Aktuelles Projekt','Alle Projekte','nav','library')}
  ${selected?`<div class="hero-project" id="current-project-hero" data-project-id="${attr(selected.id)}"><div class="hero-art" style="background-image:url('${bgFor(selected)}')"></div><div class="hero-top"><span class="tag">${esc(selected.category)}</span><button class="pill-btn" data-action="open-project" data-id="${attr(selected.id)}">${esc(ownerText(selected))} ↗</button></div><div class="hero-heading"><h2>${esc(selected.title)}</h2><div class="tiny">${esc(selected.subtitle)}</div></div><div class="hero-controls"><div class="timer-time ${timerProject?.id===selected.id?'live-clock':''}">${timerProject?.id===selected.id?timeStr(timerElapsed()):'00:00:00'}</div>${timerProject?.id===selected.id?renderTimerButtons(selected):`<button class="timer-btn main" data-action="timer-start" data-id="${attr(selected.id)}" aria-label="Timer für dieses Projekt starten">▶</button>`}<button class="pill-btn" data-action="manual-time" data-id="${attr(selected.id)}" title="Zeit manuell erfassen">✎</button></div></div>`:'<div class="empty-state">Noch keine Projekte vorhanden.</div>'}
  ${t?`<p class="inline-note timer-inline-note">${t.status==='running'?'⏱ Timer läuft':t.status==='paused'?'⏸ Timer pausiert':'◼ Timer gestoppt, Buchung ausstehend'}${t.projectId?' · '+esc(viewing(project(t.projectId))?(project(t.projectId)?.title||'Projekt'):'Privates Projekt'):' · Kein Projekt'}. Beim Schließen der App bleibt die Zeit erhalten.</p>`:''}
  ${section('Zuletzt verwendet','Bibliothek öffnen','nav','library')}
  <div class="poster-strip recent-grid" id="recent-strip">${renderRecentCards(items)}</div>
  ${section('Schnellaktionen')}
  <div class="quick-grid"><button class="quick-btn" data-action="new-project"><span class="quick-icon">⊕</span>Neues Projekt</button><button class="quick-btn" data-action="start-any"><span class="quick-icon">▷</span>Timer ohne Projekt</button><button class="quick-btn" data-action="manual-time"><span class="quick-icon">✎</span>Zeit eintragen</button><button class="quick-btn" data-action="new-entry"><span class="quick-icon">▧</span>Moment festhalten</button></div><div style="height:10px"></div></div>`;
}
function renderRecentCards(items){const ordered=expandedRecentId?[...items.filter(p=>p.id===expandedRecentId),...items.filter(p=>p.id!==expandedRecentId)]:items;return ordered.map(p=>`<div class="recent-card ${expandedRecentId===p.id?'expanded':''}" data-recent-id="${attr(p.id)}"><button class="recent-cover" data-action="recent-toggle" data-id="${attr(p.id)}" aria-expanded="${expandedRecentId===p.id}" aria-label="${esc(p.title)}: Aktionen anzeigen"><span class="recent-cover-art" style="background-image:url('${imageFor(p)}')"></span><span class="recent-cover-copy"><b>${esc(p.title)}</b><small>${statusIcon(p.status)} ${esc(statusLabels[p.status])}</small></span></button>${expandedRecentId===p.id?`<div class="recent-actions"><div class="recent-actions-head"><b>${esc(p.title)}</b><span>${esc(p.subtitle||p.category)}</span></div><button class="primary-btn" data-action="recent-start" data-id="${attr(p.id)}">▶ Timer starten</button><button class="secondary-btn" data-action="open-project" data-id="${attr(p.id)}">▦ Projekt öffnen</button></div>`:''}</div>`).join('')}
function toggleRecent(id){
 const grid=$('#recent-strip');if(!grid)return;
 const before=new Map([...grid.querySelectorAll('[data-recent-id]')].map(el=>[el.dataset.recentId,el.getBoundingClientRect()]));
 expandedRecentId=expandedRecentId===id?null:id;
 const items=visibleProjects().filter(p=>p.status!=='planned').sort((a,b)=>recency(b).localeCompare(recency(a))).slice(0,6);
 grid.innerHTML=renderRecentCards(items);
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 for(const el of grid.querySelectorAll('[data-recent-id]')){
  const old=before.get(el.dataset.recentId),now=el.getBoundingClientRect();if(!old)continue;
  const dx=old.left-now.left,dy=old.top-now.top;
  const sx=old.width/Math.max(1,now.width),sy=old.height/Math.max(1,now.height);
  el.animate([{transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`,opacity:.80},{transform:'none',opacity:1}],{duration:300,easing:'cubic-bezier(.2,.8,.2,1)'});
 }
}
function animateCardToHero(fromRect){
 if(!fromRect||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const hero=$('#current-project-hero');if(!hero)return;
 const goal=hero.getBoundingClientRect();
 const ghost=document.createElement('div');ghost.className='project-flying-card';
 Object.assign(ghost.style,{position:'fixed',left:fromRect.left+'px',top:fromRect.top+'px',width:fromRect.width+'px',height:fromRect.height+'px',zIndex:'99',pointerEvents:'none',background:'var(--accent)',backgroundImage:`url("${imageFor(project(state.timer?.projectId))}")`,backgroundSize:'cover',backgroundPosition:'center',borderRadius:'15px',opacity:'.85'});
 document.body.append(ghost);
 const dx=goal.left-fromRect.left,dy=goal.top-fromRect.top,sx=goal.width/Math.max(1,fromRect.width),sy=Math.max(.2,goal.height/Math.max(1,fromRect.height));
 const anim=ghost.animate([{transform:'translate(0,0) scale(1)',opacity:.85},{transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`,opacity:0}],{duration:420,easing:'cubic-bezier(.18,.75,.22,1)'});
 anim.finished.finally(()=>ghost.remove());
}
function renderTimerButtons(selected){
 const t=state.timer;
 if(t?.owner&&t.owner!==state.user)return `<span class="small muted">Timer von ${profiles[t.owner]?.name||'anderer Person'}</span>`;
 if(!t)return `<button class="timer-btn main" data-action="timer-start" data-id="${attr(selected?.id||'')}" aria-label="Timer starten">▶</button>`;
 if(t.status==='pending')return `<button class="timer-btn main pending-book" data-action="timer-book" aria-label="Gestoppte Zeit verbuchen">✓</button><button class="timer-btn" data-action="timer-discard" aria-label="Gestoppte Zeit verwerfen">✕</button>`;
 return `<button class="timer-btn" data-action="timer-discard" aria-label="Timer verwerfen">✕</button><button class="timer-btn main" data-action="${t.status==='running'?'timer-pause':'timer-resume'}" aria-label="${t.status==='running'?'Pausieren':'Fortsetzen'}">${t.status==='running'?'Ⅱ':'▶'}</button><button class="timer-btn" data-action="timer-stop" aria-label="Timer stoppen">■</button>`;
}
function updateTimerDisplay(){document.querySelectorAll('.live-clock,#detail-clock').forEach(n=>n.textContent=timeStr(timerElapsed()))}
function renderLibrary(){let projects=visibleProjects().filter(p=>state.libraryFilter==='all'||p.status===state.libraryFilter);const q=state.libraryQuery.trim().toLocaleLowerCase('de');if(q)projects=projects.filter(p=>[p.title,p.subtitle,p.description,p.category].join(' ').toLocaleLowerCase('de').includes(q));if(state.librarySort==='alpha')projects.sort((a,b)=>a.title.localeCompare(b.title));else if(state.librarySort==='started')projects.sort((a,b)=>(b.startDate||'').localeCompare(a.startDate||''));else projects.sort((a,b)=>recency(b).localeCompare(recency(a)));return `<div class="page">${header()}<div class="page-heading"><h1 class="page-title">Bibliothek</h1><div class="action-row"><button class="icon-btn" data-action="toggle-library-view" title="Grid oder Liste">${state.libraryView==='grid'?'☷':'▦'}</button><button class="icon-btn" data-action="new-project" title="Neues Projekt">＋</button></div></div><div class="filters">${[['all','Alle'],['active','Aktiv'],['planned','Geplant'],['paused','Pausiert'],['completed','Abgeschlossen'],['cancelled','Abgebrochen']].map(([id,label])=>`<button class="filter-btn ${state.libraryFilter===id?'active':''}" data-action="filter-library" data-id="${id}">${label}</button>`).join('')}</div><div class="search-row"><input class="search-field" id="library-search" type="search" placeholder="⌕  Projekte durchsuchen …" value="${attr(state.libraryQuery)}" aria-label="Projekte suchen" /><select class="select-compact" id="library-sort" aria-label="Sortierung"><option value="recent" ${state.librarySort==='recent'?'selected':''}>Zuletzt genutzt</option><option value="alpha" ${state.librarySort==='alpha'?'selected':''}>A–Z</option><option value="started" ${state.librarySort==='started'?'selected':''}>Startdatum</option></select></div><div id="library-results">${libraryCards(projects)}</div><p class="inline-note" style="margin-top:15px">Du siehst deine Projekte, gemeinsame Projekte und für dich freigegebene Projekte.</p></div>`}
function libraryCards(projects){if(!projects.length)return `<div class="empty-state">Hier ist es noch leer. Ändere den Filter oder lege ein Projekt an.</div>`;if(state.libraryView==='list')return `<div class="library-list">${projects.map(p=>`<button class="library-list-item" data-action="open-project" data-id="${attr(p.id)}"><img alt="" src="${imageFor(p)}"/><div class="li-info"><h3>${esc(p.title)}</h3><p>${esc(p.subtitle||p.category)}</p><p>${statusIcon(p.status)} ${statusLabels[p.status]} · ${esc(ownerText(p))}</p></div><span>›</span></button>`).join('')}</div>`;return `<div class="library-grid">${projects.map(p=>`<button class="cover-card" data-action="open-project" data-id="${attr(p.id)}"><div class="poster-image" style="background-image:url('${imageFor(p)}')"></div><span class="owner-bubble">${p.owner==='both'?'♧':p.owner===state.user?'◉':'◌'}</span><div class="cover-info"><h3>${esc(p.title)}</h3><p class="sub">${esc(p.subtitle||p.category)}</p><span class="card-status">${statusIcon(p.status)} ${statusLabels[p.status]}</span></div></button>`).join('')}</div>`}
// PAL 1.2: Zeitreise 2.0 portiert die verbindliche HTML-Vorschau und liest direkt aus state.projects.
function renderTimeline(){return `<div class="page">${header()}${window.PAL_TIMELINE.shell()}</div>`}
function eventsFor(p){let events=[];if(p.startDate)events.push({id:'start',date:p.startDate,type:'system',title:'Projekt gestartet',text:'Der Anfang eines neuen Kapitels.'});if(p.endDate&&p.status==='completed')events.push({id:'end',date:p.endDate,type:'system',title:'Projekt abgeschlossen',text:'Dieses Kapitel ist geschafft. ♡'});state.entries.filter(e=>e.projectId===p.id).forEach(e=>events.push({id:e.id,date:e.date,type:'entry',title:e.title,text:e.text,image:e.image,kind:e.kind,highlight:e.highlight,author:e.author}));state.sessions.filter(s=>s.projectId===p.id).forEach(s=>events.push({id:s.id,date:s.date.slice(0,10),type:'session',title:'Zeit erfasst',text:`${formatMins(s.minutes)} · ${creditText(s.credit)}${s.note?' · '+s.note:''}`,fullDate:s.date}));return events.sort((a,b)=>b.date.localeCompare(a.date)||String(b.id).localeCompare(String(a.id)))}
function renderDetail(){const p=project(state.projectId);if(!viewing(p))return `<div class="page">${header()}<div class="empty-state">Dieses Projekt ist nicht für dein Profil sichtbar.</div></div>`;const canEdit=editing(p);let events=eventsFor(p);const projectMinutes=state.sessions.filter(s=>s.projectId===p.id).reduce((a,s)=>a+Number(s.minutes),0);let body='';if(state.detailTab==='diary'){body=`<div class="action-row" style="margin-bottom:19px">${canEdit?`<button class="primary-btn" data-action="new-entry" data-id="${attr(p.id)}">＋ Moment festhalten</button>`:''}</div>${events.length?`<div class="diary-feed">${events.map(e=>`<div class="diary-entry glass"><div class="diary-date">${fmtDate(e.date)} ${e.type==='entry'?`· ${e.kind==='progress'?'Fortschritt':e.kind==='note'?'Notiz':'Erinnerung'}`:e.type==='session'?'· Zeitbuchung':''}</div><h3>${e.type==='system'?'✦ ':e.type==='session'?'◷ ':''}${esc(e.title)}</h3>${e.text?`<p>${esc(e.text)}</p>`:''}${e.image?`<img src="${mediaSrc(e.image)}" alt="Foto zu ${attr(e.title)}" loading="lazy"/>`:''}<div class="diary-actions"><span>${e.highlight?'✧ Highlight · ':''}${e.type==='entry'?'Von '+profiles[e.author]?.name:''}</span>${canEdit&&e.type!=='system'?`<button data-action="${e.type==='session'?'edit-session':'edit-entry'}" data-id="${attr(e.id)}">Bearbeiten ✎</button>`:''}</div></div>`).join('')}</div>`:'<div class="empty-state">Das Tagebuch ist noch leer.</div>'}`}
 else if(state.detailTab==='logbook'){body=`<div id="pal-book-container">${window.PAL_LOGBOOK.render(p,canEdit)}</div>`}
 else if(state.detailTab==='photos'){const photos=state.entries.filter(e=>e.projectId===p.id&&e.image).sort((a,b)=>b.date.localeCompare(a.date));body=`${canEdit?`<button class="primary-btn" data-action="new-entry" data-id="${attr(p.id)}">＋ Foto hinzufügen</button>`:''}<div class="library-grid" style="margin-top:13px">${photos.length?photos.map(e=>`<button class="glass-soft" style="padding:0;overflow:hidden;color:white;text-align:left;border-radius:14px" data-action="edit-entry" data-id="${attr(e.id)}"><img src="${mediaSrc(e.image)}" alt="${attr(e.title)}" style="height:150px;width:100%;object-fit:cover"/><div style="padding:10px;font-size:12px">${esc(e.title)}</div></button>`).join(''):'<div class="empty-state" style="grid-column:1/-1">Noch keine Fotos. Halte euren nächsten Moment fest!</div>'}</div>`}
 else if(state.detailTab==='times'){const sessions=state.sessions.filter(s=>s.projectId===p.id).sort((a,b)=>b.date.localeCompare(a.date));body=`<div class="detail-stat-row"><div class="glass stat-card"><b>${formatMins(projectMinutes)}</b><span>Erfasste Zeit</span></div><div class="glass stat-card"><b>${sessions.length}</b><span>Zeiteinträge</span></div></div><div class="action-row" style="margin-bottom:13px">${canEdit?`<button class="primary-btn" data-action="timer-start" data-id="${attr(p.id)}" ${state.timer?'disabled':''}>▶ Timer starten</button><button class="secondary-btn" data-action="manual-time" data-id="${attr(p.id)}">＋ Zeit erfassen</button>`:''}</div>${sessions.length?sessions.map(s=>`<div class="glass setting-row" style="border-radius:13px;padding:13px;margin-bottom:8px"><div><b>${formatMins(s.minutes)}</b><small>${fmtDate(s.date)} · ${creditText(s.credit)}${s.note?' · '+esc(s.note):''}</small></div>${canEdit?`<button class="icon-btn" data-action="edit-session" data-id="${attr(s.id)}">✎</button>`:''}</div>`).join(''):'<div class="empty-state">Noch keine Zeit eingetragen.</div>'}`}
 else{body=`<div class="glass" style="padding:17px"><div class="setting-row"><span>Status</span><b>${statusLabels[p.status]}</b></div><div class="setting-row"><span>Projekt gehört</span><b>${ownerDisplay(p.owner)}</b></div><div class="setting-row"><span>Sichtbarkeit</span><b>${p.owner==='both'?'Gemeinsam':p.visibility==='view'?'Geteilt (nur ansehen)':'Privat'}</b></div><div class="setting-row"><span>Zeitguthaben für</span><b>${creditText(p.credit)}</b></div><div class="setting-row"><span>Start</span><b>${fmtDate(p.startDate)}</b></div><div class="setting-row"><span>Ende</span><b>${fmtDate(p.endDate)}</b></div><p class="medium muted" style="line-height:1.6;margin-top:13px">${esc(p.description||'Keine Beschreibung.')}</p></div>${canEdit?`<button class="primary-btn wide" style="margin-top:14px" data-action="edit-project" data-id="${attr(p.id)}">Projekt gestalten & bearbeiten</button>`:''}`}
 return `<div class="page"><div class="detail-hero" style="background-image:linear-gradient(180deg,rgba(14,10,22,.1),rgba(14,10,22,.3)),url('${bgFor(p)}')"><div style="display:flex;justify-content:space-between;position:relative;padding:23px 18px"><button class="icon-btn glass-soft" data-action="nav" data-id="library">‹</button><div class="project-actions-wrap"><button class="icon-btn glass-soft" data-action="project-actions" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Projektoptionen">⋯</button><div class="project-actions-menu" id="project-actions-menu" role="menu" hidden>${canEdit?`<button role="menuitem" data-action="edit-project" data-id="${attr(p.id)}">✎ Projekt bearbeiten</button>`:''}<button role="menuitem" data-action="detail-tab" data-id="times">◷ Zeiten</button><button role="menuitem" data-action="detail-tab" data-id="photos">▧ Fotos</button><button role="menuitem" data-action="detail-tab" data-id="details">ⓘ Details</button></div></div></div><div class="detail-hero-content"><div class="tag" style="width:max-content;margin-bottom:7px">${statusIcon(p.status)} ${statusLabels[p.status]}</div><h1>${esc(p.title)}</h1><div class="small muted" style="margin-top:6px">${esc(p.subtitle||'')}</div></div></div><div class="detail-meta"><span>▦ ${esc(p.category)}</span><span>♧ ${ownerDisplay(p.owner)}</span><span>◷ ${esc(creditText(p.credit))}</span><span>▣ ${shortDate(p.startDate)} – ${p.status==='active'?'heute':shortDate(p.endDate)}</span></div>${state.timer?.projectId===p.id&&(!state.timer.owner||state.timer.owner===state.user)?`<div class="glass action-row" style="padding:12px;margin-bottom:12px"><b id="detail-clock" style="margin-right:auto;font-size:19px">${timeStr(timerElapsed())}</b><button class="pill-btn" data-action="${state.timer.status==='running'?'timer-pause':state.timer.status==='paused'?'timer-resume':'timer-book'}">${state.timer.status==='running'?'Ⅱ Pause':state.timer.status==='paused'?'▶ Weiter':'✓ Verbuchen'}</button>${state.timer.status!=='pending'?`<button class="primary-btn" data-action="timer-stop">■ Stopp</button>`:''}</div>`:canEdit?`<div class="detail-start-row"><button class="primary-btn" data-action="timer-start" data-id="${attr(p.id)}">▶ Timer für dieses Projekt starten</button></div>`:''}<div class="tabs">${[['diary','Tagebuch'],['logbook','Logbuch']].map(([key,label])=>`<button class="tab ${state.detailTab===key?'active':''}" data-action="detail-tab" data-id="${key}">${label}</button>`).join('')}</div>${['times','photos','details'].includes(state.detailTab)?`<div class="pal-detail-context"><button data-action="detail-tab" data-id="diary">‹ Zurück</button><strong>${state.detailTab==='times'?'Zeiten':state.detailTab==='photos'?'Fotos':'Details'}</strong></div>`:''}${body}${!canEdit?'<p class="inline-note" style="margin-top:15px">Dieses Projekt wurde nur zur Ansicht freigegeben.</p>':''}</div>`}
function renderProfile(){
 const t=theme();
 return `<div class="page">${header()}<div class="page-heading"><h1 class="page-title">Profil & Design</h1></div>
 <div class="profile-box glass">${avatarHtml(state.user,'selected profile-main-avatar')}<div><h2>${profiles[state.user].name}</h2><p>${state.user==='patrick'?'Administrator · eigenes Design':'Eigenes Profil · eigenes Design'}</p><div class="photo-actions">${mediaChoice('profile-photo-upload','','Profilbild ändern')}${state.profileImages?.[state.user]?`<button class="text-button" data-action="crop-existing" data-id="profile">Ausschnitt</button>`:''}${state.profileImages?.[state.user]?`<button class="text-button" data-action="remove-profile-photo">Entfernen</button>`:''}</div></div><button class="pill-btn" data-action="profiles-modal">Wechseln</button></div>
 <div class="setting-section"><h3>Designstil</h3><p class="color-setting-description">Für deine App. In jedem Projekt kannst du einen anderen Stil wählen.</p><div class="design-style-grid">${styleOptions.map(([id,label,desc])=>`<button class="design-style-option ${t.style===id?'active':''}" data-action="theme-style" data-id="${id}"><span class="style-sample sample-${id}">${id==='basic'?'▦':id==='playful'?'♡':id==='neon'?'✧':'▣'}</span><b>${label}</b><small>${desc}</small></button>`).join('')}</div></div>
 <div class="setting-section"><h3>Schriftfarbe</h3><div class="text-choices">${textModeOptions.map(([id,label])=>`<button class="filter-btn ${t.textMode===id?'active':''}" data-action="theme-text-mode" data-id="${id}">${label}</button>`).join('')}</div><p class="inline-note">Automatisch passt die Schrift an die Grundfarbe an. Hinter Texten auf Fotos bleibt eine gut lesbare Fläche.</p></div>
 <div class="setting-section"><h3>App-Farbe</h3><p class="color-setting-description">Die Grundfarbe der App und ihrer Flächen. Unabhängig von der Akzentfarbe.</p><div class="swatches app-color-swatches">${appColors.map(([c,name])=>`<button class="swatch ${((t.appColor||'#F7F4EB').toLowerCase()===c.toLowerCase())?'active':''}" style="background:${c}" data-action="theme-app-color" data-id="${c}" aria-label="App-Farbe ${name}" title="${name}"></button>`).join('')}<label class="swatch custom-app-color" title="Eigene App-Farbe" style="background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red);overflow:hidden;position:relative"><input id="custom-app-color" type="color" value="${t.appColor||'#F7F4EB'}" aria-label="Eigene App-Farbe"/></label></div></div>
 <div class="setting-section"><h3>Akzentfarbe</h3><div class="swatches">${colors.map(c=>`<button class="swatch ${t.accent===c?'active':''}" style="background:${c}" data-action="theme-accent" data-id="${c}" aria-label="Farbe ${c}"></button>`).join('')}<label class="swatch" title="Eigene Farbe" style="background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red);overflow:hidden;position:relative"><input id="custom-accent" type="color" value="${t.accent}" aria-label="Eigene Akzentfarbe"/></label></div></div>
 <div class="setting-section"><h3>App-Hintergrund</h3>${mediaChoice('theme-background','','Eigenes Hintergrundbild')}${t.background?`<div class="action-row" style="margin-top:8px"><button class="secondary-btn" data-action="crop-existing" data-id="theme-background">Ausschnitt ändern</button><button class="secondary-btn" data-action="clear-theme-bg">Bild entfernen</button></div>`:''}<div class="setting-row"><div>Bild-Überlagerung<small>Damit Texte lesbar bleiben</small></div><input id="theme-dim" type="range" min="0" max="90" value="${t.dim}"/></div><div class="setting-row"><div>Hintergrund-Unschärfe</div><input id="theme-blur" type="range" min="0" max="15" value="${t.blur}"/></div></div>
 <div class="setting-section"><h3>Profile & Daten</h3><div class="glass" style="padding:13px 15px"><div class="setting-row"><span>Aktives Profil</span><b>${profiles[state.user].name}</b></div><div class="setting-row"><span>Speicherung</span><b>Supabase Cloud</b></div><div class="setting-row"><span>Cloud-Status</span><b id="pal-profile-sync-status">${esc(window.PAL_SYNC?.label()||'Verbinde …')}</b></div><div class="setting-row"><span>Zugang</span><small>Gemeinsamer Zugangscode</small></div></div><p class="inline-note" style="margin-top:12px">Projekte, Zeitbuchungen und Bildverweise werden synchronisiert. Bilder liegen geschützt im PAL-Bildspeicher. Patrick und Albert verwenden derzeit einen gemeinsamen Zugangscode: Die Profile sind nicht separat gegen gegenseitigen Zugriff gesichert.</p><button class="secondary-btn wide" style="margin-top:14px" data-action="booking-history">Alle Zeitbuchungen verwalten</button><button class="secondary-btn wide" style="margin-top:10px" data-action="export-backup">Sicherung herunterladen</button></div></div>`;
}

function updateProjectLivePreview(){
 const form=document.getElementById('project-form'),preview=document.getElementById('pal-project-preview');
 if(!form||!preview)return;
 const fd=new FormData(form),old=project(modalArgs.id),style=fd.get('style')==='inherit'?(theme().style||'basic'):(fd.get('style')||'basic');
 const accent=/^#[a-f0-9]{6}$/i.test(fd.get('accent')||'')?fd.get('accent'):theme().accent;
 const mode=fd.get('textMode')==='inherit'?(theme().textMode||'auto'):fd.get('textMode');
 const light=mode==='light'||(mode!=='dark'&&hexLuminance(theme().appColor||'#F7F4EB')<.3);
 const img=tempImages.background?.cropped||(fd.get('removeBackground')?null:old?.backgroundImage);
 const cover=tempImages.cover?.cropped||(fd.get('removeCover')?null:old?.coverImage)||coverAssets.generic;
 const dim=Number(fd.get('backgroundDim')||55)/100,blur=Number(fd.get('backgroundBlur')||0);
 preview.className='pal-project-preview style-'+style+' '+(light?'text-light':'text-dark');
 preview.style.setProperty('--preview-accent',accent);
 preview.style.setProperty('--preview-fg',light?'#F9FCFF':'#203139');
 preview.style.setProperty('--preview-blur',blur+'px');
 preview.style.setProperty('--preview-overlay',String(Math.min(.9,Math.max(0,dim))));
 const backdrop=preview.querySelector('.pal-preview-backdrop');
 if(backdrop){backdrop.style.backgroundImage=img?`url("${mediaSrc(img)}")`:'none'}
 const coverEl=preview.querySelector('#pal-preview-cover');if(coverEl)coverEl.style.backgroundImage=`url("${mediaSrc(cover)}")`;
 preview.querySelector('#pal-preview-title').textContent=String(fd.get('title')||'Dein Projekt');
 preview.querySelector('#pal-preview-subtitle').textContent=String(fd.get('subtitle')||styleOptions.find(x=>x[0]===style)?.[1]||'Projektvorschau');
 const modal=document.getElementById('modal-root');modal.className='pal-project-modal style-'+style;
 modal.style.setProperty('--project-preview-accent',accent);
}

function openModal(type,args={}){modalType=type;modalArgs=args;tempImages={};drawModal()}
function closeModal(){if(modalType==='timer-stop'&&state.timer?.status==='pending'){delete state.timer.nextProjectId;delete state.timer.nextFromRecent;save()}modalType=null;modalArgs={};tempImages={};$('#modal-root').className='';$('#modal-root').innerHTML=''}
function modalBox(title,html){$('#modal-root').innerHTML=`<div class="modal-overlay" id="overlay"><div class="modal-sheet" role="dialog" aria-modal="true" aria-label="${attr(title)}"><div class="modal-head"><h2>${esc(title)}</h2><button class="icon-btn" data-action="close-modal" aria-label="Schließen">✕</button></div>${html}</div></div>`}
// PAL 1.3: Kamerafoto und Datei-Auswahl für jede Bilderfassung.
function mediaChoice(id,name='',label='Bild hinzufügen'){
 const safeId=attr(id),safeName=attr(name),cameraName=attr(name?name+'Camera':'');
 return `<div class="pal-media-choice"><div class="pal-media-choice-caption">${esc(label)}</div><div class="pal-media-choice-actions"><button type="button" data-action="media-camera" data-id="${safeId}">📷 Foto aufnehmen</button><button type="button" data-action="media-files" data-id="${safeId}">▧ Datei auswählen</button></div><input type="file" id="${safeId}" name="${safeName}" accept="image/*" hidden/><input type="file" id="${safeId}-camera" name="${cameraName}" accept="image/*" capture="environment" data-pal-camera-target="${safeId}" hidden/></div>`
}
function projectOptions(selected,optional=false){return `${optional?'<option value="">– Noch kein Projekt –</option>':''}${editableProjects().map(p=>`<option value="${attr(p.id)}" ${p.id===selected?'selected':''}>${esc(p.title)}</option>`).join('')}`}
function creditOptions(selected){return [['patrick','Patrick bekommt Guthaben'],['albert','Albert bekommt Guthaben'],['neutral','Neutral (keine Verrechnung)']].map(([id,text])=>`<option value="${id}" ${id===selected?'selected':''}>${text}</option>`).join('')}
function drawModal(){if(!modalType)return;if(modalType==='profiles'){modalBox('Profil auswählen',`<p class="form-hint">Beide Profile benutzen denselben gemeinsamen Cloud-Zugangscode. Ein Profilwechsel ist keine getrennte Benutzeranmeldung.</p>${Object.entries(profiles).map(([id,v])=>`<button class="profile-choice" data-action="choose-profile" data-id="${id}">${avatarHtml(id)}<div><div class="strong">${v.name}${state.user===id?' ✓':''}</div><small>${id==='patrick'?'Administrator':'Mitglied'}</small></div></button>`).join('')}`);return}
 if(modalType==='project'){const p=project(modalArgs.id)||{title:'',subtitle:'',description:'',category:'Spiel',status:'planned',owner:state.user,visibility:'private',credit:'neutral',startDate:'',endDate:'',cover:'generic',coverImage:null,backgroundImage:null,accent:theme().accent,style:'inherit',textMode:'inherit',backgroundDim:55,backgroundBlur:0};const edit=!!modalArgs.id;modalBox(edit?'Projekt bearbeiten':'Neues Projekt',`<form id="project-form"><section id="pal-project-preview" class="pal-project-preview" aria-label="Live-Vorschau der Projektgestaltung"><div class="pal-preview-backdrop"></div><div class="pal-preview-kicker">Live-Vorschau · nicht gespeichert</div><div id="pal-preview-cover" class="pal-preview-cover" aria-hidden="true"></div><div class="pal-preview-content"><h3 id="pal-preview-title"></h3><p id="pal-preview-subtitle"></p></div><div class="pal-preview-accent">Vorschau des Projektdesigns</div></section><label class="field"><span>Projektname *</span><input name="title" required maxlength="90" placeholder="z. B. Hogwarts Legacy" value="${attr(p.title)}"/></label><label class="field"><span>Untertitel (optional)</span><input name="subtitle" maxlength="90" placeholder="z. B. Definitive Edition" value="${attr(p.subtitle)}"/></label><div class="form-grid"><label class="field"><span>Kategorie</span><select name="category">${categories.map(c=>`<option ${p.category===c?'selected':''}>${c}</option>`).join('')}</select></label><label class="field"><span>Status</span><select name="status">${Object.entries(statusLabels).map(([id,v])=>`<option value="${id}" ${p.status===id?'selected':''}>${v}</option>`).join('')}</select></label></div><div class="form-grid"><label class="field"><span>Startdatum</span><input type="date" name="startDate" value="${attr(p.startDate)}"/></label><label class="field"><span>Abschlussdatum</span><input type="date" name="endDate" value="${attr(p.endDate)}"/></label></div><label class="field"><span>Zugeordnet zu</span><select name="owner" id="owner-select"><option value="patrick" ${p.owner==='patrick'?'selected':''}>Patrick</option><option value="albert" ${p.owner==='albert'?'selected':''}>Albert</option><option value="both" ${p.owner==='both'?'selected':''}>Gemeinsam</option></select></label><label class="field"><span>Anderer Person sichtbar?</span><select name="visibility"><option value="private" ${p.visibility==='private'?'selected':''}>Nein, privat</option><option value="view" ${p.visibility==='view'?'selected':''}>Ja, nur ansehen</option><option value="shared" ${p.visibility==='shared'?'selected':''}>Beide bearbeiten (bei gemeinsam)</option></select></label><label class="field"><span>Voreingestelltes Zeitguthaben</span><select name="credit">${creditOptions(p.credit)}</select></label><label class="field"><span>Beschreibung</span><textarea name="description" rows="2" placeholder="Worum geht es?">${esc(p.description)}</textarea></label><label class="field"><span>Designstil für dieses Projekt</span><select name="style"><option value="inherit" ${!p.style||p.style==='inherit'?'selected':''}>App-Design übernehmen</option>${styleOptions.map(([id,label])=>`<option value="${id}" ${p.style===id?'selected':''}>${label}</option>`).join('')}</select></label><label class="field"><span>Schriftfarbe im Projekt</span><select name="textMode"><option value="inherit" ${!p.textMode||p.textMode==='inherit'?'selected':''}>App-Einstellung übernehmen</option>${textModeOptions.map(([id,label])=>`<option value="${id}" ${p.textMode===id?'selected':''}>${label}</option>`).join('')}</select></label><label class="field"><span>Projekt-Akzentfarbe</span><input type="color" name="accent" value="${p.accent||theme().accent}" style="width:100%;height:38px;cursor:pointer;background:transparent;border:0"/></label>${mediaChoice('pal-cover-file','coverFile','Coverbild (Hochformat)')}<div id="cover-editor-tools">${p.coverImage?`<img class="form-image-preview" src="${mediaSrc(p.coverImage)}" alt="Aktuelles Cover"/><button type="button" class="secondary-btn" data-action="crop-existing" data-id="project-cover">Bildausschnitt ändern</button><label class="field-check">Vorhandenes Cover entfernen <input type="checkbox" name="removeCover"/></label>`:''}</div>${mediaChoice('pal-background-file','backgroundFile','Individueller Projekthintergrund')}<div id="background-editor-tools">${p.backgroundImage?`<img class="form-image-preview wide-preview" src="${mediaSrc(p.backgroundImage)}" alt="Aktueller Hintergrund"/><button type="button" class="secondary-btn" data-action="crop-existing" data-id="project-background">Bildausschnitt ändern</button><label class="field-check">Projekt-Hintergrund entfernen <input type="checkbox" name="removeBackground"/></label>`:''}</div><div class="form-grid"><label class="field"><span>Hintergrund abdunkeln: <output id="project-dim-value">${p.backgroundDim??55}%</output></span><input type="range" name="backgroundDim" min="0" max="90" value="${p.backgroundDim??55}" style="width:100%" oninput="document.getElementById('project-dim-value').textContent=this.value+'%'"/></label><label class="field"><span>Hintergrund-Unschärfe: <output id="project-blur-value">${p.backgroundBlur??0}px</output></span><input type="range" name="backgroundBlur" min="0" max="15" value="${p.backgroundBlur??0}" style="width:100%" oninput="document.getElementById('project-blur-value').textContent=this.value+'px'"/></label></div><p class="form-hint">Anfang und Abschluss werden manuell eingetragen. Ohne Startdatum erscheint das Projekt nicht als Zeitraum in der Zeitreise.</p><div class="modal-actions"><button type="button" class="secondary-btn" data-action="close-modal">Abbrechen</button><button class="primary-btn" type="submit">${edit?'Änderungen speichern':'Projekt anlegen'}</button></div>${edit?`<button type="button" class="danger-btn wide" style="margin-top:14px" data-action="delete-project" data-id="${attr(p.id)}">Projekt löschen</button>`:''}</form>`);updateProjectLivePreview();return}
 if(modalType==='entry'){const e=state.entries.find(x=>x.id===modalArgs.id)||{projectId:modalArgs.projectId||state.projectId||editableProjects()[0]?.id,kind:'moment',title:'',text:'',date:today(),image:null,highlight:true};const edit=!!modalArgs.id;modalBox(edit?'Eintrag bearbeiten':'Moment festhalten',`<form id="entry-form"><label class="field"><span>Projekt</span><select name="projectId" required>${projectOptions(e.projectId)}</select></label><div class="form-grid"><label class="field"><span>Eintragstyp</span><select name="kind"><option value="moment" ${e.kind==='moment'?'selected':''}>Erinnerung</option><option value="progress" ${e.kind==='progress'?'selected':''}>Fortschritt</option><option value="note" ${e.kind==='note'?'selected':''}>Notiz</option></select></label><label class="field"><span>Datum</span><input type="date" name="date" value="${attr(e.date)}" required/></label></div><label class="field"><span>Titel *</span><input name="title" maxlength="120" required value="${attr(e.title)}" placeholder="Unser erster Bosskampf …"/></label><label class="field"><span>Was ist passiert?</span><textarea name="text" rows="5" placeholder="Eure Gedanken, Beobachtungen und Erinnerungen …">${esc(e.text)}</textarea></label>${mediaChoice('pal-entry-image','imageFile','Foto hinzufügen')}${e.image?`<img class="form-image-preview" src="${mediaSrc(e.image)}" alt="Vorhandenes Foto"/><label class="field-check">Foto entfernen <input type="checkbox" name="removeImage"/></label>`:''}<label class="field-check">Als Highlight in der gemeinsamen Zeitreise zeigen <input name="highlight" type="checkbox" ${e.highlight?'checked':''}/></label><p class="form-hint">Einträge erscheinen automatisch chronologisch im Projekttagebuch. Highlights erscheinen zusätzlich unter der großen Zeitreise.</p><div class="modal-actions"><button type="button" class="secondary-btn" data-action="close-modal">Abbrechen</button><button type="submit" class="primary-btn">Speichern</button></div>${edit?`<button type="button" class="danger-btn wide" data-action="delete-entry" data-id="${attr(e.id)}" style="margin-top:14px">Eintrag löschen</button>`:''}</form>`);return}
 if(modalType==='session'||modalType==='timer-stop'){
  const edit=modalType==='session'&&!!modalArgs.id;
  const s=edit?state.sessions.find(x=>x.id===modalArgs.id):null;
  const t=state.timer;const fromTimer=modalType==='timer-stop';
  const defaultP=modalArgs.projectId??s?.projectId??t?.projectId??'';
  const originalSeconds=fromTimer?Math.max(1,Math.round(timerElapsed()/1000)):0;
  const defaultMinutes=edit?(Number.isFinite(Number(s.seconds))?Number(s.seconds)/60:Number(s.minutes)):(fromTimer?Math.max(.02,Math.round(originalSeconds/60*100)/100):30);
  const selectedProject=project(defaultP);
  const credit=s?.credit||selectedProject?.credit||'neutral';
  modalBox(edit?'Zeiteintrag bearbeiten':fromTimer?'Gestoppte Zeit verbuchen':'Zeit manuell eintragen',`<form id="session-form"><label class="field"><span>Projekt (optional)</span><select name="projectId" id="session-project">${projectOptions(defaultP,true)}</select></label><div class="form-grid"><label class="field"><span>Minuten *</span><input name="minutes" type="number" min="0.01" max="999999" step="0.01" required value="${defaultMinutes}"/></label><label class="field"><span>Datum & Uhrzeit</span><input name="date" type="datetime-local" required value="${attr(s?.date||localDateTime())}"/></label></div><label class="field"><span>Zeitguthaben für</span><select name="credit" id="session-credit">${creditOptions(credit)}</select></label><label class="field"><span>Notiz (optional)</span><input name="note" maxlength="200" value="${attr(s?.note||'')}" placeholder="Was habt ihr gemacht?"/></label>${fromTimer?`<p class="form-hint">Der Timer ist bereits gestoppt und zählt nicht weiter. Gemessene Zeit: ${timeStr(timerElapsed())}. Ohne Projekt kannst du trotzdem Guthaben vergeben.</p>`:`<p class="form-hint">Manuelle Buchungen werden ebenfalls im gemeinsamen Zeitguthaben berücksichtigt.</p>`}<div class="modal-actions"><button class="secondary-btn" type="button" data-action="close-modal">${fromTimer?'Später verbuchen':'Abbrechen'}</button><button class="primary-btn" type="submit">${edit?'Änderungen speichern':'Zeit speichern'}</button></div>${edit?`<button type="button" class="danger-btn wide" style="margin-top:13px" data-action="delete-session" data-id="${attr(s.id)}">Buchung löschen</button>`:''}</form>`);
  return;
 }
 if(modalType==='bookings'){
  const list=[...state.sessions].filter(s=>!s.projectId||viewing(project(s.projectId))).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  modalBox('Zeitbuchungen',`<p class="form-hint">Hier kannst du auch Buchungen ohne Projekt später korrigieren oder löschen.</p><div class="booking-list">${list.length?list.map(s=>{const p=project(s.projectId);const editable=p?editing(p):s.author===state.user;return `<div class="booking-row"><div><b>${esc(p?.title||'Ohne Projekt')}</b><small>${esc(fmtDate(s.date))} · ${formatMins(Number.isFinite(Number(s.seconds))?Number(s.seconds)/60:Number(s.minutes))} · ${esc(creditText(s.credit))}</small></div>${editable?`<button class="secondary-btn" data-action="edit-session" data-id="${attr(s.id)}">Bearbeiten</button>`:''}</div>`}).join(''):'<p class="form-hint">Noch keine Buchungen vorhanden.</p>'}</div>`);return;
 }
 if(modalType==='assign-timer'){
  if(!state.timer||state.timer.status==='pending')return closeModal();
  modalBox('Timer einem Projekt zuordnen',`<p class="form-hint">Die gemessene Zeit läuft währenddessen unverändert weiter.</p><label class="field"><span>Projekt auswählen</span><select id="assign-timer-project">${projectOptions('',false)}</select></label><div class="modal-actions"><button class="secondary-btn" data-action="close-modal">Abbrechen</button><button class="primary-btn" data-action="confirm-assign-timer">Zuordnen</button></div>`);return;
 }
 if(modalType==='timer-conflict'){
  const t=state.timer, p=project(t?.projectId);
  modalBox('Es läuft bereits ein Timer',`<p class="form-hint">${esc(p?.title||'Timer ohne Projekt')} · ${timeStr(timerElapsed())}${t?.status==='pending'?' · bereits gestoppt':''}</p><p class="form-hint">Du kannst nur einen Timer gleichzeitig verwenden. Was möchtest du mit dem bisherigen Timer machen?</p><button class="primary-btn wide" data-action="conflict-book" style="margin-bottom:10px">✓ Zeit verbuchen</button><button class="danger-btn wide" data-action="conflict-discard" style="margin-bottom:10px">✕ Timer verwerfen</button><button class="secondary-btn wide" data-action="close-modal">Abbrechen</button>`);return;
 }
 if(modalType==='timeline-info'){modalBox('So funktioniert die Zeitreise',`<div class="medium muted" style="line-height:1.8"><p>Jeder Balken zeigt einen Projektzeitraum. Laufen zwei Projekte gleichzeitig, erscheinen sie in unterschiedlichen Spuren nebeneinander. Nicht überlappende Projekte können dieselbe Spur nutzen.</p><p style="margin-top:12px">Mit <b>Wochen / Monate / Jahre</b> änderst du die zeitliche Vergrößerung. Der Strich markiert heute. Nur für dich sichtbare Projekte werden angezeigt.</p><p style="margin-top:12px">Notizen, Fotos und alle Zeitbuchungen findest du im Projekttagebuch. Markierte Highlights stehen zusätzlich unter dem Zeitstrahl.</p></div><button class="primary-btn wide" style="margin-top:20px" data-action="close-modal">Verstanden</button>`);return}
}
function startTimer(projectId,fromRecent=false){
 const p=project(projectId);
 if(p&&!editing(p)){toast('Dieses Projekt kannst du nur ansehen.');return}
 if(state.timer){openModal('timer-conflict',{nextProjectId:projectId||null,fromRecent});return}
 const fromRect=fromRecent?document.querySelector(`.recent-card[data-recent-id="${CSS.escape(projectId||'')}"]`)?.getBoundingClientRect():null;
 state.timer={projectId:projectId||null,owner:state.user,startedAt:Date.now(),elapsedMs:0,status:'running'};
 if(projectId)state.pinnedProject=projectId;
 expandedRecentId=null;
 save();if(state.route!=='home')state.route='home';render();
 if(fromRecent){$('#view').scrollTop=0;animateCardToHero(fromRect)}
 toast('Timer gestartet');
}
function stopTimer(){
 const t=state.timer;if(!t||t.owner!==state.user)return;
 if(t.status==='running'){t.elapsedMs=timerElapsed();t.startedAt=null}
 t.status='pending';save();render();openModal('timer-stop');
}
function discardTimer(){
 if(!state.timer)return;
 if(!window.confirm('Timer wirklich ohne Zeitbuchung verwerfen?'))return;
 const queued=modalType==='timer-conflict'?modalArgs.nextProjectId:undefined;
 const fromRecent=modalType==='timer-conflict'&&modalArgs.fromRecent;
 state.timer=null;save();closeModal();render();
 if(queued!==undefined)startTimer(queued,fromRecent);else toast('Timer verworfen');
}
function confirmTimerAssign(){
 const id=$('#assign-timer-project')?.value,p=project(id),t=state.timer;
 if(!t||t.status==='pending'||!editing(p))return toast('Bitte ein bearbeitbares Projekt auswählen.');
 const fromRect=$('#standalone-timer')?.getBoundingClientRect();
 t.projectId=id;state.pinnedProject=id;save();closeModal();render();
 if(state.route==='home'){ $('#view').scrollTop=0;animateCardToHero(fromRect)}
 toast('Timer zugeordnet, Zeit läuft weiter');
}
function pauseTimer(){const t=state.timer;if(!t||t.status!=='running'||t.owner!==state.user)return;t.elapsedMs=timerElapsed();t.status='paused';t.startedAt=null;save();render()}
function resumeTimer(){const t=state.timer;if(!t||t.status!=='paused'||t.owner!==state.user)return;t.startedAt=Date.now();t.status='running';save();render()}
function deleteWithConfirm(kind,id){const names={project:'dieses Projekt mit allen Einträgen und Zeiten',entry:'diesen Eintrag',session:'diese Zeitbuchung'};if(!window.confirm(`Wirklich ${names[kind]} löschen? Das kann nicht rückgängig gemacht werden.`))return;if(kind==='project'){if(state.timer?.projectId===id)state.timer.projectId=null;state.projects=state.projects.filter(p=>p.id!==id);state.entries=state.entries.filter(e=>e.projectId!==id);state.sessions=state.sessions.filter(s=>s.projectId!==id);state.pinnedProject=state.projects[0]?.id||null;state.route='library'}if(kind==='entry')state.entries=state.entries.filter(e=>e.id!==id);if(kind==='session')state.sessions=state.sessions.filter(s=>s.id!==id);save();closeModal();render();toast('Gelöscht')}
async function compressImage(file){return file?PAL_MEDIA.prepareForEditor(file):null}
function getFormData(form){return Object.fromEntries(new FormData(form).entries())}
async function submitProject(form){const fd=getFormData(form);let edit=!!modalArgs.id,p=edit?project(modalArgs.id):null;if(!fd.title.trim())return toast('Bitte einen Projektnamen eingeben.');if(fd.status==='completed'&&(!fd.startDate||!fd.endDate))return toast('Abgeschlossene Projekte benötigen Start- und Abschlussdatum.');if(fd.startDate&&fd.endDate&&fd.endDate<fd.startDate)return toast('Das Abschlussdatum liegt vor dem Startdatum.');if(fd.status==='active'&&!fd.startDate)return toast('Aktive Projekte benötigen ein Startdatum.');if(fd.owner!=='both'&&fd.owner!==state.user&&(!edit||p.owner!==fd.owner))return toast('Ein privates Projekt für eine andere Person muss diese Person selbst anlegen.');let coverImage=p?.coverImage||null,backgroundImage=p?.backgroundImage||null;let coverMedia=p?.coverMedia||null,backgroundMedia=p?.backgroundMedia||null;if(tempImages.cover){const [cropped,original]=await Promise.all([PAL_MEDIA.store(tempImages.cover.cropped,{prepared:true}),PAL_MEDIA.store(tempImages.cover.original,{prepared:true})]);coverImage=cropped;coverMedia={original,crop:tempImages.cover.crop}}else if(fd.removeCover){coverImage=null;coverMedia=null}if(tempImages.background){const [cropped,original]=await Promise.all([PAL_MEDIA.store(tempImages.background.cropped,{prepared:true}),PAL_MEDIA.store(tempImages.background.original,{prepared:true})]);backgroundImage=cropped;backgroundMedia={original,crop:tempImages.background.crop}}else if(fd.removeBackground){backgroundImage=null;backgroundMedia=null}const output={id:p?.id||getId(),title:fd.title.trim(),subtitle:(fd.subtitle||'').trim(),description:(fd.description||'').trim(),category:fd.category,status:fd.status,owner:fd.owner,visibility:fd.owner==='both'?'shared':fd.visibility==='view'?'view':'private',credit:fd.credit,startDate:fd.startDate||'',endDate:fd.endDate||'',cover:p?.cover||'generic',coverImage,coverMedia,backgroundImage,backgroundMedia,accent:fd.accent,backgroundDim:Number(fd.backgroundDim),backgroundBlur:Number(fd.backgroundBlur),style:fd.style||'inherit',textMode:fd.textMode||'inherit',updatedAt:new Date().toISOString()};if(edit){Object.assign(p,output);if(!viewing(p))state.route='library'}else state.projects.push(output);state.pinnedProject=output.id;save();closeModal();setRoute(viewing(output)?'detail':'library',output.id);toast(edit?'Projekt aktualisiert':'Projekt angelegt')}
async function submitEntry(form){const fd=getFormData(form),edit=!!modalArgs.id,old=edit?state.entries.find(e=>e.id===modalArgs.id):null,p=project(fd.projectId);if(!editing(p))return toast('Du darfst dieses Projekt nicht bearbeiten.');let image=old?.image||null;try{const file=(fd.imageFileCamera instanceof File&&fd.imageFileCamera.size)?fd.imageFileCamera:fd.imageFile;if(file instanceof File&&file.size)image=await PAL_MEDIA.store(await compressImage(file),{prepared:true});else if(fd.removeImage)image=null}catch(e){return toast(e.message)}const e={id:old?.id||getId(),projectId:fd.projectId,kind:fd.kind,title:fd.title.trim(),text:(fd.text||'').trim(),date:fd.date,image,highlight:!!fd.highlight,author:old?.author||state.user};if(edit)Object.assign(old,e);else state.entries.push(e);p.updatedAt=new Date().toISOString();save();closeModal();state.projectId=p.id;state.route='detail';state.detailTab='diary';render();toast('Erinnerung gespeichert')}
function submitSession(form){
 const fd=getFormData(form);
 const p=fd.projectId?project(fd.projectId):null;
 if(p&&!editing(p))return toast('Dieses Projekt darfst du nicht bearbeiten.');
 const minutes=Number(fd.minutes);
 if(!Number.isFinite(minutes)||minutes<=0||minutes>999999)return toast('Bitte eine gültige Dauer eingeben.');
 const edit=modalType==='session'&&!!modalArgs.id;
 const old=edit?state.sessions.find(s=>s.id===modalArgs.id):null;
 if(edit&&!old)return toast('Buchung nicht gefunden.');
 if(edit&&(!old.projectId&&old.author!==state.user||old.projectId&&!editing(project(old.projectId))))return toast('Du darfst diese Buchung nicht bearbeiten.');
 const fromTimer=modalType==='timer-stop';
 if(fromTimer&&(!state.timer||state.timer.status!=='pending'))return toast('Bitte zuerst den Timer stoppen.');
 const seconds=Math.max(1,Math.round(minutes*60));
 const s={id:old?.id||getId(),projectId:fd.projectId||null,minutes:seconds/60,seconds,credit:fd.credit,date:fd.date,note:(fd.note||'').trim(),author:old?.author||state.user};
 if(edit)Object.assign(old,s);else state.sessions.push(s);
 if(p)p.updatedAt=new Date().toISOString();
 // Der bereits gestoppte Timer wird erst bei erfolgreicher Bestätigung freigegeben.
 const next=fromTimer?state.timer?.nextProjectId:undefined;
 const fromRecent=fromTimer?state.timer?.nextFromRecent:false;
 if(fromTimer)state.timer=null;
 save();closeModal();render();
 toast('Zeitguthaben aktualisiert');
 if(fromTimer&&next!==undefined)startTimer(next,fromRecent);
}
function renderLibraryResultsKeepFocus(){const input=$('#library-search');const start=input?.selectionStart||0;let projects=visibleProjects().filter(p=>state.libraryFilter==='all'||p.status===state.libraryFilter);const q=state.libraryQuery.trim().toLowerCase();if(q)projects=projects.filter(p=>[p.title,p.subtitle,p.description,p.category].join(' ').toLowerCase().includes(q));if(state.librarySort==='alpha')projects.sort((a,b)=>a.title.localeCompare(b.title));else if(state.librarySort==='started')projects.sort((a,b)=>(b.startDate||'').localeCompare(a.startDate||''));else projects.sort((a,b)=>recency(b).localeCompare(recency(a)));$('#library-results').innerHTML=libraryCards(projects)}

// PAL 0.7: organische Konturen nur im Playful-Stil. Innenflächen/Bilder folgen der gleichen Clippingform.
function applyPlayfulShapes(){
 const nodes=document.querySelectorAll('.hero-project,.credit-panel,.standalone-timer,.profile-box,.recent-card,.recent-cover,.cover-card,.quick-btn,.diary-entry,.design-style-option');
 for(const el of nodes){
  if(!el.closest('.style-playful')){el.style.removeProperty('border-radius');continue}
  // Stabiler Index statt Math.random(): keine springenden Formen bei jedem Rendern.
  const text=(el.getAttribute('data-project-id')||el.getAttribute('data-recent-id')||el.textContent||el.className).slice(0,60);
  let hash=2166136261;for(const ch of text)hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
  const r=Array.from({length:8},(_,i)=>Math.round(16+((hash>>((i%4)*7))&7)));
  el.style.borderRadius=`${r.slice(0,4).map(x=>x+'px').join(' ')} / ${r.slice(4).map(x=>x+'px').join(' ')}`;
 }
}

// Das unbeschnittene, komprimierte Ausgangsbild plus Zoomeinstellung wird lokal gespeichert.
// Pixelgroße Originaldateien sind wegen der LocalStorage-Grenze in dieser Vorschau nicht sinnvoll.
const cropKinds={'profile':{w:400,h:400,label:'Profilbild'},'project-cover':{w:540,h:720,label:'Projektcover'},'project-background':{w:960,h:540,label:'Projekthintergrund'},'theme-background':{w:480,h:720,label:'App-Hintergrund'}};
let cropState=null;
function closeCropEditor(){cropState=null;const n=$('#crop-root');if(n)n.innerHTML=''}
async function cropSelectedFile(file,target){
 try{const data=await compressImage(file);await openCropEditor(target,data)}catch(e){toast(e.message)}
}
function reopenCropEditor(target){
 let m=null,source=null;
 if(target==='profile'){m=state.profileOriginals?.[state.user];source=m?.original||state.profileImages?.[state.user]}
 if(target==='theme-background'){m=theme().backgroundMedia;source=m?.original||theme().background}
 if(target==='project-cover'||target==='project-background'){
  const p=project(modalArgs.id),which=target==='project-cover'?'cover':'background';
  const draft=tempImages[which];m=draft?{original:draft.original,crop:draft.crop}:p?.[which==='cover'?'coverMedia':'backgroundMedia'];
  source=m?.original||p?.[which==='cover'?'coverImage':'backgroundImage'];
 }
 if(!source){toast('Bitte zuerst ein Bild auswählen.');return}
 openCropEditor(target,source,m?.crop);
}
async function openCropEditor(target,source,settings){
 const {w,h,label}=cropKinds[target];
 const image=new Image();image.src=mediaSrc(source);
 try{await image.decode()}catch{toast('Das Bild konnte nicht geöffnet werden.');return}
 cropState={target,original:source,img:image,w,h,x:Number(settings?.x)||0,y:Number(settings?.y)||0,zoom:Number(settings?.zoom)||1,pointers:new Map(),pinch:null};
 let root=$('#crop-root');if(!root){root=document.createElement('div');root.id='crop-root';document.body.append(root)}
 root.innerHTML=`<div class="crop-overlay" id="crop-overlay"><section class="crop-sheet" role="dialog" aria-modal="true" aria-label="${label} zuschneiden"><div class="crop-header"><h2>${label} anpassen</h2><button class="icon-btn" data-action="crop-cancel" aria-label="Schließen">✕</button></div><p>Ziehe das Bild mit dem Finger. Vergrößern kannst du es mit zwei Fingern oder dem Regler.</p><div class="crop-stage"><canvas id="crop-canvas" width="${w}" height="${h}" style="aspect-ratio:${w}/${h};${target==='profile'?'border-radius:50%;':''}" aria-label="Bildausschnitt-Vorschau"></canvas></div><label class="crop-zoom">Zoom <input type="range" id="crop-zoom" min="1" max="3" step="0.01" value="${cropState.zoom}"/></label><div class="crop-actions"><button class="secondary-btn" data-action="crop-reset">Zurücksetzen</button><button class="secondary-btn" data-action="crop-cancel">Abbrechen</button><button class="primary-btn" data-action="crop-save">Ausschnitt übernehmen</button></div></section></div>`;
 const canvas=$('#crop-canvas');canvas.addEventListener('pointerdown',cropPointerDown);canvas.addEventListener('pointermove',cropPointerMove);canvas.addEventListener('pointerup',cropPointerUp);canvas.addEventListener('pointercancel',cropPointerUp);canvas.addEventListener('lostpointercapture',cropPointerUp);
 $('#crop-zoom').addEventListener('input',ev=>{if(!cropState)return;cropState.zoom=Number(ev.target.value);drawCrop()});
 drawCrop();
}
function drawCrop(){
 const s=cropState,canvas=$('#crop-canvas');if(!s||!canvas)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const scale=Math.max(s.w/s.img.naturalWidth,s.h/s.img.naturalHeight)*s.zoom;
 const sw=s.img.naturalWidth*scale,sh=s.img.naturalHeight*scale;
 const shiftX=Math.max(0,(sw-s.w)/2),shiftY=Math.max(0,(sh-s.h)/2);
 const px=(s.w-sw)/2+Math.max(-1,Math.min(1,s.x))*shiftX;
 const py=(s.h-sh)/2+Math.max(-1,Math.min(1,s.y))*shiftY;
 ctx.clearRect(0,0,s.w,s.h);ctx.drawImage(s.img,px,py,sw,sh);
}
function cropPointerDown(ev){
 const s=cropState;if(!s)return;ev.preventDefault();ev.target.setPointerCapture(ev.pointerId);
 s.pointers.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
 if(s.pointers.size===2){const a=[...s.pointers.values()];s.pinch={distance:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),zoom:s.zoom};}
}
function cropPointerMove(ev){
 const s=cropState;if(!s||!s.pointers.has(ev.pointerId))return;
 ev.preventDefault();const prev=s.pointers.get(ev.pointerId);s.pointers.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
 if(s.pointers.size>=2){const a=[...s.pointers.values()];const dist=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(s.pinch?.distance)s.zoom=Math.max(1,Math.min(3,s.pinch.zoom*dist/s.pinch.distance));$('#crop-zoom').value=String(s.zoom);}
 else{
  const rect=$('#crop-canvas').getBoundingClientRect();const scale=Math.max(s.w/s.img.naturalWidth,s.h/s.img.naturalHeight)*s.zoom;
  const maxX=Math.max(0,(s.img.naturalWidth*scale-s.w)/2),maxY=Math.max(0,(s.img.naturalHeight*scale-s.h)/2);
  if(maxX>0)s.x=Math.max(-1,Math.min(1,s.x+((ev.clientX-prev.x)*s.w/rect.width)/maxX));
  if(maxY>0)s.y=Math.max(-1,Math.min(1,s.y+((ev.clientY-prev.y)*s.h/rect.height)/maxY));
 }
 drawCrop();
}
function cropPointerUp(ev){const s=cropState;if(!s)return;s.pointers.delete(ev.pointerId);s.pinch=null}
function resetCropEditor(){if(!cropState)return;cropState.x=0;cropState.y=0;cropState.zoom=1;$('#crop-zoom').value='1';drawCrop()}
function refreshProjectCropTools(type,data){
 const target=type==='project-cover'?'cover':'background';const n=$(`#${target==='cover'?'cover':'background'}-editor-tools`);if(!n)return;
 n.innerHTML=`<img class="form-image-preview ${target==='background'?'wide-preview':''}" src="${data}" alt="Ausgewählter Bildausschnitt"/><button type="button" class="secondary-btn" data-action="crop-existing" data-id="${type}">Bildausschnitt ändern</button>`;updateProjectLivePreview();
}
async function saveCropEditor(){
 const s=cropState;if(!s)return;
 drawCrop();const canvas=$('#crop-canvas');const webp=canvas.toDataURL('image/webp',.85);const cropped=webp.startsWith('data:image/webp;')?webp:canvas.toDataURL('image/jpeg',.85);
 const media={original:s.original,crop:{x:s.x,y:s.y,zoom:s.zoom}};
 const type=s.target;
 closeCropEditor();
 if(type==='profile'){try{const [img,orig]=await Promise.all([PAL_MEDIA.store(cropped,{prepared:true}),PAL_MEDIA.store(media.original,{prepared:true})]);state.profileImages[state.user]=img;state.profileOriginals[state.user]={...media,original:orig};save();render();toast('Profilbild gespeichert')}catch(e){toast(e.message)}return}
 if(type==='theme-background'){try{const [img,orig]=await Promise.all([PAL_MEDIA.store(cropped,{prepared:true}),PAL_MEDIA.store(media.original,{prepared:true})]);theme().background=img;theme().backgroundMedia={...media,original:orig};save();render();toast('Hintergrund gespeichert')}catch(e){toast(e.message)}return}
 const which=type==='project-cover'?'cover':'background';tempImages[which]={...media,cropped};refreshProjectCropTools(type,cropped);
 toast('Bildausschnitt übernommen. Bitte Projekt speichern.');
}
let actionPending=false;
document.addEventListener('click',async ev=>{
 const menu=$('#project-actions-menu');if(menu&&!ev.target.closest('.project-actions-wrap'))menu.hidden=true;
 const b=ev.target.closest('[data-action]');if(!b)return;
 const action=b.dataset.action,id=b.dataset.id;
 if(action==='close-modal'){closeModal();return}
 if(action==='crop-cancel'){closeCropEditor();return}
 if(action==='crop-save'){saveCropEditor();return}
 if(action==='crop-reset'){resetCropEditor();return}
 if(action==='crop-existing'){reopenCropEditor(id);return}
 if(action==='project-actions'){const menu=$('#project-actions-menu');if(menu){const open=menu.hidden;menu.hidden=!open;b.setAttribute('aria-expanded',String(open))}return}
 if(action==='media-camera'||action==='media-files'){document.getElementById(id+(action==='media-camera'?'-camera':''))?.click();return}
 if(action==='nav'){expandedRecentId=null;setRoute(id);return}
 if(action==='switch-profile'||action==='profiles-modal'){openModal('profiles');return}
 if(action==='choose-profile'){state.user=id;state.route='home';expandedRecentId=null;save();closeModal();render();toast(`Profil: ${profiles[id].name}`);return}
 if(action==='open-project'){const p=project(id);if(!viewing(p))return toast('Projekt nicht sichtbar.');state.pinnedProject=id;expandedRecentId=null;save();setRoute('detail',id);return}
 if(action==='recent-toggle'){toggleRecent(id);return}
 if(action==='recent-start'){startTimer(id,true);return}
 if(action==='new-project'){openModal('project');return}
 if(action==='edit-project'){openModal('project',{id});return}
 if(action==='new-entry'){openModal('entry',{projectId:id||state.projectId||editableProjects()[0]?.id});return}
 if(action==='edit-entry'){const e=state.entries.find(e=>e.id===id);if(e&&!editing(project(e.projectId))){toast('Nur zur Ansicht freigegeben.');return}openModal('entry',{id});return}
 if(action==='manual-time'){openModal('session',{projectId:id||state.pinnedProject});return}
 if(action==='edit-session'){openModal('session',{id});return}
 if(action==='booking-history'){openModal('bookings');return}
 if(action==='export-backup'){window.PAL_SYNC?.exportBackups();return}
 if(action==='timer-start'){startTimer(id||null);return}
 if(action==='start-any'){startTimer(null);return}
 if(action==='timer-pause'){pauseTimer();return}
 if(action==='timer-resume'){resumeTimer();return}
 if(action==='timer-stop'){stopTimer();return}
 if(action==='timer-book'){openModal('timer-stop');return}
 if(action==='timer-discard'){discardTimer();return}
 if(action==='assign-timer'){openModal('assign-timer');return}
 if(action==='confirm-assign-timer'){confirmTimerAssign();return}
 if(action==='conflict-book'){
  const t=state.timer;if(!t)return closeModal();
  const next=modalArgs.nextProjectId,fromRecent=modalArgs.fromRecent;
  t.nextProjectId=next;t.nextFromRecent=fromRecent;
  if(t.status==='running'){t.elapsedMs=timerElapsed();t.startedAt=null}
  t.status='pending';save();render();openModal('timer-stop');return;
 }
 if(action==='conflict-discard'){discardTimer();return}
 if(action==='detail-tab'){state.detailTab=id;save();render();return}
 if(action==='filter-library'){state.libraryFilter=id;save();render();return}
 if(action==='toggle-library-view'){state.libraryView=state.libraryView==='grid'?'list':'grid';save();render();return}
 if(action==='timeline-filter'){state.timelineFilter=id;save();render();return}
 if(action==='timeline-scale'){state.timelineScale=id;save();render();return}
 if(action==='timeline-help'){openModal('timeline-info');return}
 if(action==='theme-accent'){theme().accent=id;save();render();return}
 if(action==='theme-app-color'){theme().appColor=id;save();render();return}
 if(action==='theme-style'){theme().style=id;save();render();return}
 if(action==='theme-text-mode'){theme().textMode=id;save();render();return}
 if(action==='clear-theme-bg'){theme().background=null;theme().backgroundMedia=null;save();render();return}
 if(action==='remove-profile-photo'){state.profileImages[state.user]=null;state.profileOriginals[state.user]=null;save();render();toast('Profilbild entfernt');return}
 if(action==='delete-project'||action==='delete-entry'||action==='delete-session'){deleteWithConfirm(action.slice(7),id);return}
});
document.addEventListener('input',async ev=>{const target=ev.target;if(target.closest('#project-form'))updateProjectLivePreview();if(target.id==='library-search'){state.libraryQuery=target.value;save();renderLibraryResultsKeepFocus()}if(target.id==='theme-dim'){theme().dim=Number(target.value);save();applyTheme()}if(target.id==='theme-blur'){theme().blur=Number(target.value);save();applyTheme()}if(target.id==='custom-accent'){theme().accent=target.value;save();applyTheme()}if(target.id==='custom-app-color'){theme().appColor=target.value;save();applyTheme()}});
document.addEventListener('change',async ev=>{const t=ev.target;
 if(t.dataset.palCameraTarget&&t.files?.[0]){const target=t.dataset.palCameraTarget;const cropType=target==='profile-photo-upload'?'profile':target==='theme-background'?'theme-background':target==='pal-cover-file'?'project-cover':target==='pal-background-file'?'project-background':null;
 if(cropType){await cropSelectedFile(t.files[0],cropType);t.value='';return}}
if(t.closest('#project-form'))updateProjectLivePreview();if(t.id==='library-sort'){state.librarySort=t.value;save();renderLibraryResultsKeepFocus()}if(t.id==='session-project'){const p=project(t.value);if(p){const credit=$('#session-credit');if(credit)credit.value=p.credit}}if(t.id==='profile-photo-upload'&&t.files[0]){await cropSelectedFile(t.files[0],'profile');t.value='';return}if(t.id==='theme-background'&&t.files[0]){await cropSelectedFile(t.files[0],'theme-background');t.value='';return}if(t.name==='coverFile'&&t.files[0]){await cropSelectedFile(t.files[0],'project-cover');t.value='';return}if(t.name==='backgroundFile'&&t.files[0]){await cropSelectedFile(t.files[0],'project-background');t.value='';return}if(t.id==='custom-accent'||t.id==='custom-app-color'){save();render()}});
document.addEventListener('submit',async ev=>{if(!['project-form','entry-form','session-form'].includes(ev.target.id))return;ev.preventDefault();if(actionPending)return;actionPending=true;const form=ev.target,submit=form.querySelector('button[type=submit]');if(submit)submit.disabled=true;try{if(form.id==='project-form')await submitProject(form);if(form.id==='entry-form')await submitEntry(form);if(form.id==='session-form')submitSession(form)}catch(e){console.error(e);toast('Das Speichern hat nicht funktioniert.')}finally{actionPending=false;if(submit?.isConnected)submit.disabled=false}});
document.addEventListener('click',ev=>{if(ev.target.id==='overlay')closeModal();if(ev.target.id==='crop-overlay')closeCropEditor();if(state.route==='home'&&expandedRecentId&&!modalType&&!cropState&&!ev.target.closest('.recent-card')&&!ev.target.closest('#recent-strip'))toggleRecent(null);});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'){if(cropState)closeCropEditor();else if(modalType)closeModal();else if(expandedRecentId&&state.route==='home')toggleRecent(null)}});
setInterval(updateTimerDisplay,1000);
// Falls im Prototyp ein abgeschlossenes Projekt keinen gültigen Zeitraum besitzt, bleibt es in der Bibliothek, nicht im Zeitstrahl.
render();

// PAL 1.3: sichtbare Dialoghöhe folgt der mobilen Bildschirmtastatur.
(function palModalComfort(){
 const vv=window.visualViewport;
 function update(){const h=vv?.height||window.innerHeight;document.documentElement.style.setProperty('--pal-visible-height',Math.max(200,h)+'px');document.documentElement.style.setProperty('--pal-visible-top',(vv?.offsetTop||0)+'px');}
 update();vv?.addEventListener('resize',update);vv?.addEventListener('scroll',update);
 document.addEventListener('focusin',ev=>{if(!ev.target.matches?.('.modal-sheet input,.modal-sheet textarea,.modal-sheet select,.quick-book-sheet input,.quick-book-sheet textarea'))return;
  const input=ev.target;setTimeout(()=>{if(input.isConnected&&document.activeElement===input)input.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'})},180);
 });
})();
