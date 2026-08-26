// Gezinsagenda — hoofdlogica van de app (rendering, state, events, lijstjes, kindweergave, instellingen).
(function(){
"use strict";

/* =========================================================
   CONSTANTEN
   ========================================================= */
const DOW_SHORT = ['zo','ma','di','wo','do','vr','za'];
const DOW_LONG = ['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];
const MONTHS = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
const MEMBER_COLORS = ['#4c8fc0','#c25b7c','#8f5b9e','#5b9a4c','#d9a63e','#e4634f','#3e7c7b','#8a6d3b'];
const MEMBER_EMOJIS = ['🧑','👩','👨','🧒','👧','👦','👶','🧓','🐶','🐱'];

/* Pictogrammen, gebaseerd op de volledige lijst magneten van thuisbijmuis.nl/product/losse-magneten.
   Kleurvarianten (bijv. "mama (rood)"/"mama (geel)") zijn samengevoegd tot één pictogram, en de losse
   dagdeel-symbolen en richtingspijltjes zijn weggelaten (die zijn bij ons al onderdeel van de indeling
   zelf). Voor de rest staat vrijwel elk magneetje van die pagina hier met hetzelfde woordje erbij. */
const PICTO_CATEGORIES = [
  {cat:'Ochtendroutine', items:[
    ['🛏️','Opstaan'],['🚽','Potje/wc'],['🙌','Handen wassen'],['🚿','Bad/douche'],['🪥','Tanden poetsen'],
    ['💇','Haren kammen'],['👓','Bril'],['🧴','Insmeren'],['👶','Luier'],['🍼','Flesje'],
    ['👕','Klaarleggen (kleding)'],['👕','Aankleden'],['🧥','Jas aan/uit'],['🪝','Jas ophangen'],['👟','Schoenen aan'],['🎒','Tas mee'],
  ]},
  {cat:'School & opvang', items:[
    ['🎒','School'],['🧸','Opvang'],['🚌','BSO'],['🧒','Peuterschool'],['🌅','Inloopochtend'],
    ['📚','Huiswerk'],['🎒','Tas opruimen'],['⏰','Korte schooldag'],['📌','Studiedag'],['🔄','Wisseldag'],
    ['🧑‍🏫','Klassenhulp'],['🍽️','Overblijven'],['📷','Schoolfoto'],['🚏','Schoolreisje'],
  ]},
  {cat:'Activiteiten & sport', items:[
    ['⚽','Sporten'],['🏊','Zwemmen'],['🏊','Zwemles'],['🚶','Wandelen'],['🚲','Fietsen'],['🛴','Steppen'],
    ['🏇','Paardrijden'],['🎳','Bowlen'],['🤸','Gym'],['🤾','Trampoline'],['🏆','Sportdag'],['🧘','Yoga'],
    ['💃','Dansen'],['🎭','Dans/toneel'],['🎵','Muziekles'],['🎨','Knutselen'],['🎤','Zingen'],['🏕️','Scouting'],
    ['🎮','Schermtijd'],['📵','Geen scherm'],
  ]},
  {cat:'Uitjes & vrije tijd', items:[
    ['🚗','Auto'],['🧽','Auto wassen'],['🚲','Bakfiets'],['🚂','Trein'],['⛵','Varen'],
    ['🐄','Boerderij'],['🐘','Dierentuin'],['🌳','Bos/natuur'],['🌳','Buitenspelen'],['🏖️','Strand'],
    ['⛺','Camping'],['🎪','Circus'],['🎡','Kermis'],['🎢','Pretpark'],['🛝','Speeltuin'],
    ['🏛️','Museum'],['📚','Bibliotheek'],['🎬','Film'],['🎭','Theater'],['✂️','Kapper'],
    ['✈️','Vakantie'],['🌴','Op vakantie'],['✈️','Vliegen'],['🏕️','Op kamp'],['🚗','Uitje'],
  ]},
  {cat:'Gevoelens', items:[['😄','Blij'],['😢','Verdrietig'],['😠','Boos'],['😨','Bang'],['🌟','Trots']]},
  {cat:'Gezondheid & verzorging', items:[
    ['🏥','Dokter'],['🚑','Ziekenhuis'],['🦷','Tandarts'],['💊','Medicatie'],['💨','Puffer'],
    ['🧑‍⚕️','Fysio'],['🗣️','Logopedie'],['🗣️','Therapie'],['👂','Hoortoestel'],['🩹','Oogpleister'],
  ]},
  {cat:'Gezin & overdracht', items:[
    ['👩','Mama'],['👨','Papa'],['👵','Oma'],['👴','Opa'],['👴👵','Opa & oma'],['👦','Broer'],['👧','Zus'],['👪','Familie'],
    ['🚗','Naar mama'],['🚪','Mama weg'],['💼','Mama werken'],['🔙','Mama terug'],
    ['🚗','Naar papa'],['🚪','Papa weg'],['💼','Papa werken'],['🔙','Papa terug'],
    ['🏡','Naar huis'],['🏡','Weer thuis'],['🧑‍🍼','Oppas'],
  ]},
  {cat:'Samen & sociaal', items:[
    ['🎂','Verjaardag'],['🎉','Feest'],['🎈','Partijtje'],['🎁','Trakteren'],['🎈','Verrassing'],
    ['🧳','Logeren'],['🧑‍🤝‍🧑','Vriendje spelen'],['🛋️','Visite'],['📹','Videobellen'],
    ['⛪','Kerk'],['🕌','Moskee'],['🍽️','Uit eten'],
  ]},
  {cat:'Eten', items:[
    ['🍳','Ontbijten'],['🥪','Middageten'],['🍽️','Avondeten'],['☕','Koffie/thee'],['🍎','Fruit'],['🍬','Iets lekkers'],
  ]},
  {cat:'Huishouden', items:[
    ['🛒','Boodschappen'],['🏪','Markt'],['🛍️','Winkelen'],['🧹','Opruimen'],['🧹','Afruimen'],['🧹','Vegen'],
    ['🪣','Dweilen'],['🧽','Schoonmaken'],['🧽','Afwassen'],['🧽','Vaatwasser'],['🪟','Ramen (lappen)'],['🔌','Stofzuigen'],
    ['🧺','Wasmand'],['🛏️','Bed opmaken'],['🍽️','Tafel dekken'],['🧰','Klussen'],['📝','Klusje/taakje'],
    ['🌱','Tuinieren'],['👩‍🍳','Bakken/koken'],['🐾','Huisdier'],
  ]},
  {cat:'Avond & slapen', items:[
    ['📺','Tv kijken'],['🧸','Spelen'],['🎲','Spelletje (bordspel)'],['📖','Lezen'],['🛁','Bad/douche (avond)'],
    ['🌙','Naar bed'],['😴','Slaapje'],['👕','Uitkleden'],['🌛','Opblijven'],
  ]},
  {cat:'Overig', items:[['📅','Plannen'],['🌟','Vrij'],['💰','Zakgeld'],['⭐','Belangrijk']]},
];
const ICON_LABELS = {};
PICTO_CATEGORIES.forEach(c=> c.items.forEach(([em,label])=>{ if(!(em in ICON_LABELS)) ICON_LABELS[em]=label; }));


const HOUR_START = 0, HOUR_END = 24, HOUR_PX = 52;

const DAYPARTS = [
  {key:'ochtend', label:'Ochtend', em:'🌅', max:12},
  {key:'middag', label:'Middag', em:'☀️', max:18},
  {key:'avond', label:'Avond', em:'🌙', max:24},
];
function partOfDay(d){ const h=d.getHours(); return DAYPARTS.find(p=>h<p.max) || DAYPARTS[DAYPARTS.length-1]; }

/* Beschrijft hoe een afspraak op een specifieke dag getoond moet worden in de kindweergave:
   normale afspraken krijgen gewoon hun starttijd, meerdaagse afspraken krijgen "vanaf"/"tot"
   op de eerste/laatste dag en "Hele dag" op de dagen daartussenin. */
/* Verdeelt overlappende afspraken (bijv. 2 kinderen op hetzelfde tijdstip) over kolommen
   naast elkaar, zodat ze elkaar niet meer bedekken. Geeft elk item col/totalCols mee. */
function layoutDayOverlaps(dayOccs){
  const sorted = dayOccs.slice().sort((a,b)=> a.occStart-b.occStart || a.occEnd-b.occEnd);
  const result = [];
  let cluster = [], clusterEnd = null;
  function flushCluster(){
    if(!cluster.length) return;
    const columns = [];
    cluster.forEach(item=>{
      let placedCol = -1;
      for(let c=0;c<columns.length;c++){
        if(item.occStart >= columns[c]){ columns[c] = item.occEnd; placedCol = c; break; }
      }
      if(placedCol===-1){ columns.push(item.occEnd); placedCol = columns.length-1; }
      item._col = placedCol;
    });
    const totalCols = columns.length;
    cluster.forEach(item=> result.push(Object.assign({}, item, {col:item._col, totalCols})));
    cluster = [];
  }
  sorted.forEach(item=>{
    if(!cluster.length){ cluster=[item]; clusterEnd=item.occEnd; return; }
    if(item.occStart < clusterEnd){
      cluster.push(item);
      if(item.occEnd > clusterEnd) clusterEnd = item.occEnd;
    } else {
      flushCluster();
      cluster=[item]; clusterEnd=item.occEnd;
    }
  });
  flushCluster();
  return result;
}

function occDayLabel(ev, occStart, occEnd, day){
  if(ev.allDay) return 'Hele dag';
  const isStartDay = sameDay(occStart, day);
  const isEndDay = sameDay(occEnd, day);
  if(isStartDay && isEndDay) return fmtTimeHM(occStart);
  if(isStartDay) return 'vanaf ' + fmtTimeHM(occStart);
  if(isEndDay) return 'tot ' + fmtTimeHM(occEnd);
  return 'Hele dag';
}

/* Maandag-eerst weekdagkeuze voor het herhalingsformulier; waarden komen overeen met Date#getDay() (0=zondag). */
const WEEKDAY_OPTS = [[1,'Ma'],[2,'Di'],[3,'Wo'],[4,'Do'],[5,'Vr'],[6,'Za'],[0,'Zo']];
function recIntervalLabel(freq){
  return {daily:'Elke hoeveel dagen?', weekly:'Elke hoeveel weken?', monthly:'Elke hoeveel maanden?', yearly:'Elke hoeveel jaar?'}[freq] || 'Interval';
}
function daysInMonth(year, monthIndex){ return new Date(year, monthIndex+1, 0).getDate(); }
/* Geeft de N-de (of laatste, position=-1) gevraagde weekdag in een maand terug, of null als die niet bestaat (bijv. geen 5e maandag). */
function nthWeekdayOfMonth(year, monthIndex, weekday, position){
  if(position === -1){
    let d = new Date(year, monthIndex+1, 0);
    while(d.getDay() !== weekday) d.setDate(d.getDate()-1);
    return d;
  }
  let d = new Date(year, monthIndex, 1);
  let count = 0;
  while(d.getMonth()===monthIndex){
    if(d.getDay()===weekday){
      count++;
      if(count===position) return new Date(d);
    }
    d.setDate(d.getDate()+1);
  }
  return null;
}

/* =========================================================
   STATE
   Alles hier wordt gevuld door de Firestore-listeners (zie window.fbSync
   hierboven in de module-<script>) in plaats van door localStorage, zodat
   alle apparaten in hetzelfde gezin dezelfde data zien.
   ========================================================= */
let state = { familyMembers: [], events: [], lists: [], settings: {} };
let listsSeeded = false;

function defaultFamilyMembers(){
  return [
    {id: uid(), name:'Papa', color:'#4c8fc0', icon:'👨', role:'volwassene'},
    {id: uid(), name:'Mama', color:'#c25b7c', icon:'👩', role:'volwassene'},
    {id: uid(), name:'Kind', color:'#8f5b9e', icon:'🧒', role:'kind'},
  ];
}
function defaultLists(){
  return [
    {id: uid(), name:'Boodschappen', kind:'boodschappen', items:[]},
    {id: uid(), name:'Te betalen rekeningen', kind:'rekeningen', items:[]},
  ];
}

/* =========================================================
   HULPFUNCTIES
   ========================================================= */
function uid(){ return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8); }
function pad2(n){ return String(n).padStart(2,'0'); }
function fmtISODate(d){ return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); }
function fmtTimeHM(d){ return pad2(d.getHours())+':'+pad2(d.getMinutes()); }
function sameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function startOfDay(d){ const x=new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d){ const x=new Date(d); x.setHours(23,59,59,999); return x; }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function addMonths(d,n){ const x=new Date(d); x.setMonth(x.getMonth()+n); return x; }
function getMonday(d){ const x=new Date(d); const day=x.getDay(); const diff=(day===0?-6:1-day); return addDays(startOfDay(x),diff); }
function combineDateTime(dateStr,timeStr){ return new Date(dateStr+'T'+(timeStr||'00:00')+':00'); }
function memberById(id){ return state.familyMembers.find(m=>m.id===id); }
function listById(id){ return state.lists.find(l=>l.id===id); }
function eventById(id){ return state.events.find(e=>e.id===id); }
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(showToast._h);
  showToast._h=setTimeout(()=>t.classList.remove('show'),2600);
}

/* Firestore-schrijfacties (setDoc/deleteDoc) gebeuren optimistisch: de wijziging is meteen
   lokaal zichtbaar, ook vóórdat de server hem heeft goedgekeurd. Wijst de server de wijziging
   alsnog af (bijv. door de beveiligingsregels of een App Check-probleem), dan draait Firestore
   dat stilletjes terug via de eerstvolgende onSnapshot — zonder melding. Elke fbSync-aanroep
   die hieronder staat moet daarom altijd deze .catch krijgen, zodat de gebruiker een duidelijke
   melding ziet in plaats van dat een wijziging onverklaarbaar "vanzelf" terugkomt. */
function reportSyncError(err){
  console.error('Synchronisatie met Firebase mislukt:', err);
  const code = err && err.code ? ' ('+err.code+')' : '';
  showToast('Wijziging kon niet worden opgeslagen'+code+' — probeer het opnieuw.');
}

/* Kleur voor event-blok: 1 deelnemer -> diens kleur; meerdere -> kleur van de eerste deelnemer */
function eventColor(ev){
  if(ev.participants && ev.participants.length){
    const m = memberById(ev.participants[0]);
    if(m) return m.color;
  }
  return '#3e7c7b';
}

/* Standaard starttijd voor een nieuwe afspraak: het eerstvolgende hele uur (bijv. 14:29 -> 15:00),
   inclusief doorloop naar de volgende dag als het al na 23:00 is (23:40 vandaag -> 00:00 morgen). */
function nextFullHourMoment(){
  const now = new Date();
  if(now.getMinutes()===0 && now.getSeconds()===0) return now;
  const d = new Date(now);
  d.setHours(d.getHours()+1, 0, 0, 0);
  return d;
}
/* Variant zonder datumdoorloop: gebruikt wanneer de datum al vaststaat (bijv. een specifieke dag
   aangeklikt in de kindweergave) en dus niet mag verschuiven naar een andere dag. */
function nextFullHourCapped(){
  const now = new Date();
  return now.getMinutes()===0 ? now.getHours() : Math.min(now.getHours()+1, 23);
}

/* Klein 🙈-badge voor in de week/dagweergave: signaleert dat een aangevinkt kind bij deze afspraak
   via de 🙈-toggle is verborgen in de kindweergave, zonder dat je het formulier hoeft te openen. */
function hiddenKidBadge(ev){
  const ids = ev.hiddenFromKidView || [];
  if(!ids.length) return '';
  const names = ids.map(id=>{ const m=memberById(id); return m ? m.name : null; }).filter(Boolean).join(', ');
  return `<span class="kid-hidden-badge" title="Niet in kindweergave voor: ${escapeHtml(names)}">🙈</span>`;
}

/* =========================================================
   TERUGKERENDE AFSPRAKEN: occurrences berekenen binnen een periode
   ========================================================= */
function expandEvent(ev, rangeStart, rangeEnd){
  const out = [];
  const s0 = new Date(ev.start), e0 = new Date(ev.end);
  const duration = e0 - s0;
  const rec = ev.recurrence;
  if(!rec || rec.freq === 'none'){
    if(s0 <= rangeEnd && e0 >= rangeStart) out.push({occStart:s0, occEnd:e0});
    return out;
  }
  const interval = Math.max(1, rec.interval||1);
  const endDate = rec.endType==='onDate' && rec.endDate ? endOfDay(new Date(rec.endDate)) : null;
  const maxCount = rec.endType==='after' ? Math.max(1, rec.count||1) : Infinity;
  const hh = s0.getHours(), mm = s0.getMinutes();
  const startDateOnly = startOfDay(s0);
  const MAX_ITER = 20000;
  let iterations = 0, n = 0;
  const occStarts = [];

  if(rec.freq === 'daily'){
    let cur = new Date(s0);
    while(iterations < MAX_ITER){
      iterations++;
      if(n >= maxCount) break;
      if(endDate && cur > endDate) break;
      if(cur > rangeEnd) break;
      occStarts.push(new Date(cur));
      n++;
      cur.setDate(cur.getDate()+interval);
    }
  } else if(rec.freq === 'weekly'){
    const rawDays = (rec.weeklyDays && rec.weeklyDays.length) ? rec.weeklyDays : [s0.getDay()];
    const offsets = Array.from(new Set(rawDays.map(d=> d===0?6:d-1))).sort((a,b)=>a-b); // maandag-gebaseerde offsets
    let weekMonday = getMonday(s0);
    let stop = false;
    while(!stop && iterations < MAX_ITER){
      for(const off of offsets){
        iterations++;
        if(iterations >= MAX_ITER){ stop = true; break; }
        const candidateDay = addDays(weekMonday, off);
        if(candidateDay < startDateOnly) continue;
        if(n >= maxCount){ stop = true; break; }
        if(endDate && candidateDay > endDate){ stop = true; break; }
        const occStart = new Date(candidateDay.getFullYear(), candidateDay.getMonth(), candidateDay.getDate(), hh, mm, 0);
        if(occStart > rangeEnd){ stop = true; break; }
        occStarts.push(occStart);
        n++;
      }
      weekMonday = addDays(weekMonday, 7*interval);
    }
  } else if(rec.freq === 'monthly'){
    let year = s0.getFullYear(), month = s0.getMonth();
    while(iterations < MAX_ITER){
      iterations++;
      if(n >= maxCount) break;
      let candidateDay;
      if(rec.monthlyMode === 'weekdayOfMonth'){
        const weekday = rec.monthlyWeekday != null ? rec.monthlyWeekday : s0.getDay();
        candidateDay = nthWeekdayOfMonth(year, month, weekday, rec.monthlyPosition || 1);
      } else {
        const dom = Math.min(rec.monthlyDay || s0.getDate(), daysInMonth(year, month));
        candidateDay = new Date(year, month, dom);
      }
      if(candidateDay){
        const occStart = new Date(candidateDay.getFullYear(), candidateDay.getMonth(), candidateDay.getDate(), hh, mm, 0);
        if(occStart >= startDateOnly){
          if(endDate && occStart > endDate) break;
          if(occStart > rangeEnd) break;
          occStarts.push(occStart);
          n++;
        }
      }
      month += interval;
      while(month >= 12){ month -= 12; year++; }
    }
  } else if(rec.freq === 'yearly'){
    let cur = new Date(s0);
    while(iterations < MAX_ITER){
      iterations++;
      if(n >= maxCount) break;
      if(endDate && cur > endDate) break;
      if(cur > rangeEnd) break;
      occStarts.push(new Date(cur));
      n++;
      cur.setFullYear(cur.getFullYear()+interval);
    }
  }

  const exSet = new Set((rec.exdates||[]).map(iso=> new Date(iso).getTime()));
  for(const occStart of occStarts){
    if(exSet.has(occStart.getTime())) continue; // los exemplaar hier expliciet verwijderd of vervangen
    const occEnd = new Date(occStart.getTime()+duration);
    if(occEnd >= rangeStart && occStart <= rangeEnd) out.push({occStart, occEnd});
  }
  return out;
}

/* =========================================================
   TERUGKERENDE AFSPRAKEN: uitzonderingen op een reeks
   Eén los exemplaar wijzigen of verwijderen zonder de hele reeks aan te passen.
   - "exdates" op de reeks: welke occurrence-tijdstippen worden overgeslagen bij het genereren.
   - een los gewijzigd exemplaar wordt een gewoon (niet-herhalend) event met
     recurrenceParentId (naar de reeks) en recurrenceOriginalStart (welk tijdstip het vervangt).
   ========================================================= */
function seriesChildren(seriesId){
  return state.events.filter(e=> e.recurrenceParentId === seriesId);
}
function addExdateToSeries(seriesEv, occStart){
  const iso = occStart.toISOString();
  const cur = seriesEv.recurrence.exdates || [];
  if(cur.includes(iso)) return seriesEv;
  return Object.assign({}, seriesEv, { recurrence: Object.assign({}, seriesEv.recurrence, { exdates: cur.concat([iso]) }) });
}
/* Knipt een reeks af zodat hij eindigt vlak vóór occStart (voor "deze en alle volgende").
   Exdates op/na occStart horen niet meer bij dit ingekorte deel en worden verwijderd
   (die horen straks bij de nieuwe reeks die vanaf occStart verdergaat). */
function truncateSeriesBefore(seriesEv, occStart){
  const dayBefore = addDays(startOfDay(occStart), -1);
  const exdates = (seriesEv.recurrence.exdates||[]).filter(iso => new Date(iso) < occStart);
  return Object.assign({}, seriesEv, { recurrence: Object.assign({}, seriesEv.recurrence, {
    endType: 'onDate', endDate: fmtISODate(dayBefore), exdates
  })});
}

/* Virtueel "gezinslid"-ID voor afspraken zonder deelnemers, zodat deze meedoen
   in de deelnemer-filters (chip "Geen deelnemer") zonder een echt gezinslid te zijn. */
const NONE_MEMBER_ID = '__none__';

function countEventsWithoutParticipants(){
  return state.events.filter(ev=>!ev.participants || ev.participants.length===0).length;
}

/* Geeft alle occurrences van alle (zichtbare) events binnen een periode terug, met event-referentie */
function occurrencesInRange(rangeStart, rangeEnd, filterMemberIds, excludeDayOnly){
  const out = [];
  for(const ev of state.events){
    if(excludeDayOnly && ev.onlyDayView) continue;
    if(Array.isArray(filterMemberIds)){
      const hasParticipants = ev.participants && ev.participants.length>0;
      const overlaps = hasParticipants
        ? ev.participants.some(id=>filterMemberIds.includes(id))
        : filterMemberIds.includes(NONE_MEMBER_ID);
      if(!overlaps) continue;
    }
    const occs = expandEvent(ev, rangeStart, rangeEnd);
    for(const o of occs) out.push({event: ev, occStart:o.occStart, occEnd:o.occEnd});
  }
  out.sort((a,b)=>a.occStart-b.occStart);
  return out;
}

/* =========================================================
   NAVIGATIE STATUS
   ========================================================= */
let agendaView = 'month';
let agendaDate = new Date();
let agendaVisibleMembers = null; // null = alle

let kidId = null;
let kidView = 'week';
let kidDate = new Date();

let activeListId = null;

/* =========================================================
   TABS
   ========================================================= */
let lastActiveTab = 'agenda';
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const newTab = btn.dataset.tab;
    const prevTab = lastActiveTab;
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-'+newTab).classList.add('active');
    if(newTab==='kind' && prevTab==='agenda'){ kidDate = new Date(agendaDate); }
    if(newTab==='agenda' && prevTab==='kind'){
      agendaDate = new Date(kidDate);
      if(agendaView === 'month'){
        agendaView = kidView==='day' ? 'day' : 'week';
        document.querySelectorAll('#agenda-view-switch button').forEach(b=>b.classList.toggle('active', b.dataset.view===agendaView));
      }
    }
    if(newTab==='kind') renderKid();
    if(newTab==='lijsten') renderLists();
    if(newTab==='instellingen') renderSettings();
    if(newTab==='agenda') renderAgenda();
    lastActiveTab = newTab;
  });
});

/* =========================================================
   AGENDA: RENDER
   ========================================================= */
document.getElementById('agenda-view-switch').addEventListener('click', e=>{
  const btn = e.target.closest('button[data-view]');
  if(!btn) return;
  agendaView = btn.dataset.view;
  document.querySelectorAll('#agenda-view-switch button').forEach(b=>b.classList.toggle('active', b===btn));
  renderAgenda();
});
document.getElementById('agenda-prev').addEventListener('click', ()=>{ stepAgenda(-1); });
document.getElementById('agenda-next').addEventListener('click', ()=>{ stepAgenda(1); });
document.getElementById('agenda-today').addEventListener('click', ()=>{ agendaDate = new Date(); renderAgenda(); });
document.getElementById('btn-new-event').addEventListener('click', ()=> openEventModal());

function stepAgenda(dir){
  if(agendaView==='month') agendaDate = addMonths(agendaDate, dir);
  else if(agendaView==='week') agendaDate = addDays(agendaDate, 7*dir);
  else agendaDate = addDays(agendaDate, dir);
  renderAgenda();
}

function renderMemberFilters(){
  const wrap = document.getElementById('agenda-member-filters');
  if(state.familyMembers.length===0){ wrap.innerHTML=''; return; }
  // De "Geen deelnemer"-chip verschijnt alleen als daar ook echt afspraken voor zijn — zodra
  // de laatste zo'n afspraak een deelnemer heeft gekregen (of is verwijderd), verdwijnt de chip
  // vanzelf weer. Dit staat los van de instelling "Deelnemer verplicht bij nieuwe afspraken":
  // die instelling regelt alleen nieuwe/bewerkte afspraken, niet of de chip zichtbaar is.
  const showNoneChip = countEventsWithoutParticipants() > 0;
  const all = state.familyMembers.map(m=>m.id).concat(showNoneChip ? [NONE_MEMBER_ID] : []);
  wrap.innerHTML = state.familyMembers.map(m=>{
    const on = !agendaVisibleMembers || agendaVisibleMembers.includes(m.id);
    return `<button class="chip ${on?'on':''}" data-mid="${m.id}" style="border-color:${on?m.color:'var(--line)'}">
      <span class="swatch" style="background:${m.color}">${m.icon}</span>${escapeHtml(m.name)}
    </button>`;
  }).join('') + (showNoneChip ? (()=>{
    const on = !agendaVisibleMembers || agendaVisibleMembers.includes(NONE_MEMBER_ID);
    return `<button class="chip ${on?'on':''}" data-mid="${NONE_MEMBER_ID}" style="border-color:${on?'var(--ink-soft)':'var(--line)'}">
      <span class="swatch" style="background:var(--ink-soft)">–</span>Geen deelnemer
    </button>`;
  })() : '');
  wrap.querySelectorAll('.chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const id = chip.dataset.mid;
      if(!agendaVisibleMembers) agendaVisibleMembers = all.slice();
      if(agendaVisibleMembers.includes(id)){
        agendaVisibleMembers = agendaVisibleMembers.filter(x=>x!==id);
      } else {
        agendaVisibleMembers.push(id);
      }
      if(agendaVisibleMembers.length===all.length) agendaVisibleMembers = null;
      renderAgenda();
    });
  });
}

/* Hoeveel verticale ruimte is er nog over onder onze eigen "chrome" (topbar/tabs/toolbar/filters),
   zodat maand- en weekweergave daar precies op maat in passen zonder te hoeven scrollen. */
function getAvailableAgendaHeight(){
  const body = document.getElementById('agenda-body');
  if(!body) return 480;
  const rect = body.getBoundingClientRect();
  // window.innerHeight kan op iOS Safari te optimistisch zijn (rekent soms met de adresbalk
  // ingeklapt, ook als die nog zichtbaar is) — visualViewport geeft de echte zichtbare hoogte.
  const vh = (window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : window.innerHeight;
  return Math.max(240, Math.floor(vh - rect.top - 28));
}

function renderAgenda(){
  renderMemberFilters();
  const label = document.getElementById('agenda-range-label');
  const body = document.getElementById('agenda-body');
  // Het label toont alleen nog "maand jaar" — de exacte dag/weekdag staat in week- en
  // dagweergave al bij de dag-kolommen zelf, dus dat hoeft hier niet dubbelop. Altijd even kort
  // betekent ook: geen aparte jaartal-regel meer nodig om hoogteverspringen te voorkomen, en het
  // past zo naast de navigatieknoppen en de weergave-schakelaar op één regel.
  function setRangeLabel(monthIdx, year){
    label.textContent = MONTHS[monthIdx] + ' ' + year;
  }
  if(agendaView==='month'){
    setRangeLabel(agendaDate.getMonth(), agendaDate.getFullYear());
    body.innerHTML = renderMonthGrid();
    attachMonthHandlers();
  } else if(agendaView==='week'){
    const mon = getMonday(agendaDate);
    // Een week die van maand wisselt, wordt (net als bij ISO-weeknummers) toegeschreven aan de
    // maand van de donderdag in die week.
    const thu = addDays(mon,3);
    setRangeLabel(thu.getMonth(), thu.getFullYear());
    body.innerHTML = renderTimeGrid(mon, 7);
    attachTimeGridHandlers();
  } else {
    setRangeLabel(agendaDate.getMonth(), agendaDate.getFullYear());
    body.innerHTML = renderTimeGrid(startOfDay(agendaDate), 1);
    attachTimeGridHandlers();
  }
}

/* Verdeelt de afspraken van één weekrij over horizontale "banen" (lanes), zodat een meerdaagse
   afspraak als één doorlopende balk over de betreffende dagen getekend kan worden — net als
   FamilyWall. Probeert een afspraak die van de vorige week doorloopt in dezelfde baan te houden. */
function layoutMonthWeek(weekStart, occs, laneMemory){
  const weekEndDay = addDays(weekStart, 6);
  const items = occs.filter(o=> o.occStart <= endOfDay(weekEndDay) && o.occEnd >= startOfDay(weekStart)).map(o=>{
    const s = o.occStart < weekStart ? weekStart : o.occStart;
    const eDate = o.occEnd > endOfDay(weekEndDay) ? endOfDay(weekEndDay) : o.occEnd;
    const startCol = Math.round((startOfDay(s) - weekStart)/86400000);
    const endCol = Math.round((startOfDay(eDate) - weekStart)/86400000);
    return {event:o.event, occStart:o.occStart, occEnd:o.occEnd, startCol, endCol};
  });
  items.sort((a,b)=>{
    const aHas = laneMemory.has(a.event.id), bHas = laneMemory.has(b.event.id);
    if(aHas && !bHas) return -1;
    if(!aHas && bHas) return 1;
    return a.startCol-b.startCol || (b.endCol-b.startCol)-(a.endCol-a.startCol);
  });
  const laneEnds = [];
  items.forEach(item=>{
    const preferred = laneMemory.get(item.event.id);
    let placed = -1;
    if(preferred !== undefined && (laneEnds[preferred]===undefined || item.startCol > laneEnds[preferred])){
      placed = preferred;
    } else {
      for(let l=0;l<laneEnds.length;l++){
        if(laneEnds[l]===undefined || item.startCol > laneEnds[l]){ placed = l; break; }
      }
      if(placed===-1) placed = laneEnds.length;
    }
    laneEnds[placed] = item.endCol;
    item.lane = placed;
    if(item.occEnd > endOfDay(weekEndDay)) laneMemory.set(item.event.id, placed);
    else laneMemory.delete(item.event.id);
  });
  return items;
}

function renderMonthGrid(){
  const first = new Date(agendaDate.getFullYear(), agendaDate.getMonth(), 1);
  const gridStart = getMonday(first);
  const rangeStart = gridStart;
  const rangeEnd = endOfDay(addDays(gridStart, 41));
  const occs = occurrencesInRange(rangeStart, rangeEnd, agendaVisibleMembers, true);
  const today = new Date();

  // Gebruik 5 rijen in plaats van 6 als de 6e rij toch alleen dagen van de volgende maand bevat.
  let totalCells = 42;
  let needsRow6 = false;
  for(let i=35;i<42;i++){ if(addDays(gridStart,i).getMonth()===agendaDate.getMonth()) needsRow6 = true; }
  if(!needsRow6) totalCells = 35;
  const numWeeks = totalCells/7;

  const availableH = getAvailableAgendaHeight();
  const dowRowH = 18, weekGap = 4, dateRowH = 15, overflowReserve = 10, weekPadding = 8;
  const budgetPerWeek = Math.floor((availableH - dowRowH - weekGap*(numWeeks-1)) / numWeeks);
  const availableForBars = budgetPerWeek - dateRowH - overflowReserve - weekPadding;
  const barSlot = 16; // 15px balkhoogte + 1px marge
  let maxLanes = Math.floor(availableForBars / barSlot);
  // Schaalt mee met de beschikbare schermhoogte, zodat meer ruimte ook echt meer
  // afspraken toont i.p.v. alleen witruimte. Ruime veiligheidsgrens (20) tegen
  // rare uitschieters op extreem hoge schermen.
  maxLanes = Math.max(1, Math.min(maxLanes, 20));

  let html = `<div class="month-grid"><div class="month-dow-row">`;
  DOW_SHORT.forEach((d,i)=>{ html += `<div class="month-dow">${DOW_LONG[(i+1)%7].slice(0,2)}</div>`; });
  html += `</div>`;

  const laneMemory = new Map();
  for(let w=0; w<numWeeks; w++){
    const weekStart = addDays(gridStart, w*7);
    const items = layoutMonthWeek(weekStart, occs, laneMemory);
    const hiddenCountByCol = [0,0,0,0,0,0,0];
    let barsHtml = '';
    items.forEach(item=>{
      if(item.lane >= maxLanes){
        for(let c=item.startCol; c<=item.endCol; c++) hiddenCountByCol[c]++;
        return;
      }
      const c = eventColor(item.event);
      barsHtml += `<div class="month-bar" style="grid-column:${item.startCol+1} / ${item.endCol+2}; grid-row:${item.lane+2}; background:${c};" data-eid="${item.event.id}" data-occstart="${item.occStart.toISOString()}" title="${escapeHtml(item.event.title)}">${item.event.icon||'📅'} ${escapeHtml(item.event.title)}</div>`;
    });
    let daycellsHtml = '';
    for(let c=0;c<7;c++){
      const day = addDays(weekStart, c);
      const inMonth = day.getMonth()===agendaDate.getMonth();
      const isToday = sameDay(day, today);
      daycellsHtml += `<div class="month-daycell ${inMonth?'':'other-month'} ${isToday?'today':''}" style="grid-column:${c+1};" data-date="${fmtISODate(day)}">
        <span>${day.getDate()}</span><span class="add">+</span>
      </div>`;
      if(isToday){
        daycellsHtml += `<div class="month-today-frame" style="grid-column:${c+1}; grid-row:1 / -1;"></div>`;
      }
      if(hiddenCountByCol[c]>0){
        daycellsHtml += `<div class="month-overflow" style="grid-column:${c+1}; grid-row:${maxLanes+2};" data-date="${fmtISODate(day)}">+${hiddenCountByCol[c]}</div>`;
      }
    }
    // Laatste rij vult de resterende hoogte op (i.p.v. 'auto', wat op hoge schermen
    // lege ruimte onderin de maandkalender liet staan); het "+N meer"-label blijft
    // dankzij align-self:end (zie .month-overflow in styles.css) netjes onderaan hangen.
    html += `<div class="month-week" style="--bar-h:15px; height:${Math.max(budgetPerWeek, dateRowH + maxLanes*barSlot)}px; grid-template-rows:${dateRowH}px repeat(${maxLanes}, var(--bar-h)) minmax(0,1fr);">${daycellsHtml}${barsHtml}</div>`;
  }
  html += '</div>';
  return html;
}

function attachMonthHandlers(){
  document.querySelectorAll('.month-bar').forEach(bar=>{
    bar.addEventListener('click', (e)=>{ e.stopPropagation(); openEventModal(eventById(bar.dataset.eid), null, {occStart:new Date(bar.dataset.occstart)}); });
  });
  document.querySelectorAll('.month-daycell, .month-overflow').forEach(cell=>{
    cell.addEventListener('click', ()=>{
      agendaDate = new Date(cell.dataset.date+'T00:00:00');
      agendaView = 'day';
      document.querySelectorAll('#agenda-view-switch button').forEach(b=>b.classList.toggle('active', b.dataset.view==='day'));
      renderAgenda();
    });
  });
}

function renderTimeGrid(startDate, numDays){
  const today = new Date();
  const rangeStart = startDate;
  const rangeEnd = endOfDay(addDays(startDate, numDays-1));
  const occs = occurrencesInRange(rangeStart, rangeEnd, agendaVisibleMembers, true);

  let anyAllDay = false;
  const alldayByDay = [];
  for(let d=0; d<numDays; d++){
    const day = addDays(startDate, d);
    const dayAllDay = occs.filter(o=> (o.event.allDay || !sameDay(o.occStart, o.occEnd)) && o.occStart <= endOfDay(day) && o.occEnd >= startOfDay(day));
    if(dayAllDay.length) anyAllDay = true;
    alldayByDay.push(dayAllDay);
  }

  const availableH = getAvailableAgendaHeight();
  const headerH = 57, alldayH = anyAllDay ? 26 : 0;
  let hourPx, wrapMaxHeight;
  if(numDays===1){
    // Dagweergave: vaste, comfortabele hoogte per uur; verticaal scrollbaar.
    hourPx = 52;
    wrapMaxHeight = availableH;
  } else {
    // Weekweergave: reken uit hoeveel elk uur mag zijn zodat alle 24 uur zonder scrollen passen.
    hourPx = Math.max(14, Math.floor((availableH - headerH - alldayH) / 24));
    wrapMaxHeight = availableH;
  }

  let gutter = `<div class="time-gutter"><div class="gutter-corner-spacer" style="height:${headerH}px;"></div>`;
  if(anyAllDay) gutter += '<div class="gutter-allday-spacer"></div>';
  for(let h=HOUR_START; h<HOUR_END; h++){ gutter += `<div class="gutter-label">${pad2(h)}:00</div>`; }
  gutter += '</div>';

  let cols = '';
  for(let d=0; d<numDays; d++){
    const day = addDays(startDate, d);
    const isToday = sameDay(day, today);
    const dayStart = startOfDay(day), dayEnd = endOfDay(day);
    const timedForDay = occs.filter(o=> !o.event.allDay && sameDay(o.occStart, o.occEnd) && sameDay(o.occStart, day));
    const laidOut = layoutDayOverlaps(timedForDay);
    let blocks = '';
    laidOut.forEach(o=>{
      const s = o.occStart < dayStart ? dayStart : o.occStart;
      const eEnd = o.occEnd > dayEnd ? dayEnd : o.occEnd;
      const startMin = (s.getHours()*60+s.getMinutes());
      let durMin = (eEnd - s)/60000;
      if(durMin < 24) durMin = 24;
      const top = (startMin/60)*hourPx;
      const height = (durMin/60)*hourPx - 2;
      const c = eventColor(o.event);
      const widthPct = 100/o.totalCols;
      const leftPct = o.col*widthPct;
      blocks += `<div class="event-block" style="top:${top}px; height:${Math.max(height,16)}px; left:calc(${leftPct}% + 2px); width:calc(${widthPct}% - 4px); background:${c};" data-eid="${o.event.id}" data-occstart="${o.occStart.toISOString()}">
        <span class="ttl-row"><span class="ttl">${escapeHtml(o.event.title)}</span>${hiddenKidBadge(o.event)}</span>
        ${o.event.location?`<span class="loc">📍 ${escapeHtml(o.event.location)}</span>`:''}
      </div>`;
    });
    let nowLine = '';
    if(isToday){
      const mins = today.getHours()*60+today.getMinutes();
      nowLine = `<div class="now-line" style="top:${(mins/60)*hourPx}px;"></div>`;
    }
    let rows = '';
    for(let h=HOUR_START; h<HOUR_END; h++){ rows += `<div class="hour-row" data-hour="${h}" data-date="${fmtISODate(day)}"></div>`; }
    let alldayRow = '';
    if(anyAllDay){
      const dayAllDay = alldayByDay[d];
      const maxShow = 1;
      let pillsHtml = dayAllDay.slice(0,maxShow).map(o=>{
        const c = eventColor(o.event);
        return `<div class="pill" style="background:${c}" data-eid="${o.event.id}" data-occstart="${o.occStart.toISOString()}" title="${escapeHtml(o.event.title)}"><span class="pill-ttl">${o.event.icon||'📅'} ${escapeHtml(o.event.title)}</span>${hiddenKidBadge(o.event)}</div>`;
      }).join('');
      if(dayAllDay.length>maxShow) pillsHtml += `<div class="pill-more">+${dayAllDay.length-maxShow}</div>`;
      alldayRow = `<div class="time-col-allday">${pillsHtml}</div>`;
    }
    cols += `<div class="time-col ${(isToday && numDays>1)?'today':''}">
      <div class="time-col-header">
        <span class="dow">${DOW_SHORT[day.getDay()]}</span><span class="dnum">${day.getDate()}</span>
      </div>
      ${alldayRow}
      <div class="time-body">${rows}${blocks}${nowLine}</div>
    </div>`;
  }
  return `<div class="time-grid-wrap" style="--hour-px:${hourPx}px; max-height:${wrapMaxHeight}px;">${gutter}<div class="time-cols">${cols}</div></div>`;
}

function attachTimeGridHandlers(){
  document.querySelectorAll('.event-block').forEach(el=>{
    el.addEventListener('click', (e)=>{ e.stopPropagation(); openEventModal(eventById(el.dataset.eid), null, {occStart:new Date(el.dataset.occstart)}); });
  });
  document.querySelectorAll('.time-col-allday .pill').forEach(el=>{
    el.addEventListener('click', (e)=>{ e.stopPropagation(); openEventModal(eventById(el.dataset.eid), null, {occStart:new Date(el.dataset.occstart)}); });
  });
  document.querySelectorAll('.hour-row').forEach(row=>{
    row.addEventListener('click', ()=>{
      const date = row.dataset.date, hour = parseInt(row.dataset.hour,10);
      openEventModal(null, {date, hour});
    });
  });
  autofitEventBlocks();
  const wrap = document.querySelector('.time-grid-wrap');
  if(wrap) setTimeout(()=>{ wrap.scrollTop = 7*HOUR_PX; }, 0);
}

/* Krimpt de tekst in een afspraakblokje net zolang tot 'ie past (tot een leesbare ondergrens),
   in plaats van 'm halverwege af te kappen. Pas als de ondergrens bereikt is, mag overflow:hidden
   het laatste stukje wegsnijden. */
function autofitEventBlocks(){
  const MIN_SCALE = 0.38, STEP = 0.05;
  const BASE = { ttl: 11.5, loc: 10 };
  document.querySelectorAll('.event-block').forEach(block=>{
    const ttl = block.querySelector('.ttl');
    const loc = block.querySelector('.loc');
    let scale = 1;
    let guard = 0;
    while(block.scrollHeight > block.clientHeight + 1 && scale > MIN_SCALE && guard < 16){
      scale -= STEP;
      if(ttl) ttl.style.fontSize = (BASE.ttl*scale).toFixed(1)+'px';
      if(loc) loc.style.fontSize = (BASE.loc*scale).toFixed(1)+'px';
      guard++;
    }
  });
}

/* Generieke versie voor losse eenregelige tekstjes (bijv. in de kindweergave): krimpt het lettertype
   net zolang tot de tekst binnen de beschikbare breedte past, tot een leesbare ondergrens. */
function autofitSingleLineText(selector, baseSizePx, minScale){
  minScale = minScale || 0.38;
  document.querySelectorAll(selector).forEach(el=>{
    el.style.fontSize = baseSizePx+'px';
    let scale = 1, guard = 0;
    while(el.scrollWidth > el.clientWidth + 1 && scale > minScale && guard < 16){
      scale -= 0.06;
      el.style.fontSize = (baseSizePx*scale).toFixed(1)+'px';
      guard++;
    }
  });
}

/* =========================================================
   PICTOGRAMMENKIEZER (herbruikbaar in afspraakformulier)
   ========================================================= */
function renderPictoPicker(selectedIcon){
  const custom = (state.settings && state.settings.customPictos) || [];
  const cats = custom.length
    ? [{cat:'Eigen pictogrammen', items: custom.map(c=>[c.icon, c.label])}].concat(PICTO_CATEGORIES)
    : PICTO_CATEGORIES;
  return cats.map(c=>`
    <div class="picto-cat-label">${escapeHtml(c.cat)}</div>
    <div class="picto-grid">
      ${c.items.map(([em,label])=>`
        <button type="button" class="picto-btn ${selectedIcon===em?'sel':''}" data-em="${em}" data-label="${escapeHtml(label)}">
          <span class="e">${em}</span><span class="l">${escapeHtml(label)}</span>
        </button>`).join('')}
    </div>
  `).join('');
}

/* =========================================================
   EVENT MODAL (aanmaken / bewerken)
   ========================================================= */
/* occCtx = {occStart:Date} — meegegeven zodra vanuit de agenda/kindweergave op één specifiek
   voorkomen van een afspraak is geklikt (niet bij "+ nieuwe afspraak"). Bij een echte herhalende
   reeks vragen we dan eerst welke afspraken de actie moet raken, voordat het formulier opengaat. */
function openEventModal(ev, prefill, occCtx){
  if(ev && ev.recurrence && ev.recurrence.freq !== 'none' && occCtx && occCtx.occStart){
    openRecurrenceActionChooser(ev, occCtx);
    return;
  }
  buildAndOpenEventModal(ev, prefill, occCtx, 'all');
}

function buildAndOpenEventModal(ev, prefill, occCtx, editScope){
  const isEdit = !!ev;
  const data = ev ? JSON.parse(JSON.stringify(ev)) : {
    id: uid(), title:'', kindTekst:'', start:'', end:'', location:'', notes:'',
    icon:'📅', participants: (prefill && prefill.participants) ? prefill.participants.slice() : [], hiddenFromKidView: [], allDay:false,
    recurrence: {freq:'none', interval:1, endType:'never', endDate:'', count:5}
  };
  // Bij "alleen deze afspraak" / "deze en alle volgende" bewerken we niet de ankerdatum van de
  // reeks, maar het specifieke, aangeklikte tijdstip — en onthouden welke reeks/tijdstip dit was.
  let recurrenceSeriesId = null, recurrenceOccStartISO = null;
  if((editScope==='single' || editScope==='future') && occCtx && occCtx.occStart){
    recurrenceSeriesId = data.id;
    recurrenceOccStartISO = occCtx.occStart.toISOString();
    const duration = new Date(data.end) - new Date(data.start);
    data.start = occCtx.occStart.toISOString();
    data.end = new Date(occCtx.occStart.getTime()+duration).toISOString();
    if(editScope==='single') data.recurrence = {freq:'none', interval:1, endType:'never', endDate:'', count:5};
  }
  let startDate, startTime, endDate, endTime;
  if(isEdit){
    const s = new Date(data.start), e = new Date(data.end);
    startDate = fmtISODate(s); startTime = fmtTimeHM(s);
    endDate = fmtISODate(e); endTime = fmtTimeHM(e);
  } else {
    let d, h;
    if(prefill && typeof prefill.hour==='number'){
      // Expliciet aangeklikt tijdstip (bijv. een uurvak in de agenda) — datum en uur staan al vast.
      d = prefill.date; h = prefill.hour;
    } else if(prefill && prefill.date){
      // Datum staat al vast (bijv. "+"-knop op een specifieke dag in de kindweergave); alleen het
      // uur krijgt een standaardwaarde, zonder naar een andere dag door te rollen.
      d = prefill.date; h = nextFullHourCapped();
    } else {
      // Geen enkele voorkeur meegegeven (hoofdknop "nieuwe afspraak") — neem het eerstvolgende
      // hele uur vanaf nu, inclusief eventuele doorloop naar de volgende dag.
      const moment = nextFullHourMoment();
      d = fmtISODate(moment); h = moment.getHours();
    }
    startDate = d; startTime = pad2(h)+':00';
    // Eindtijd = start + 1 uur, met een echte datum-doorloop via combineDateTime (i.p.v. de oude
    // cap-op-23, die een 23:00-afspraak per ongeluk een duur van 0 gaf i.p.v. door te lopen naar 00:00).
    const endMoment = new Date(combineDateTime(d, pad2(h)+':00').getTime() + 60*60000);
    endDate = fmtISODate(endMoment); endTime = fmtTimeHM(endMoment);
  }

  const membersHtml = state.familyMembers.map(m=>{
    const checked = data.participants.includes(m.id) ? 'checked' : '';
    const hidden = (data.hiddenFromKidView||[]).includes(m.id) ? 'checked' : '';
    const hideToggle = m.role==='kind' ? `
      <span class="hide-kid-toggle" title="Niet tonen in kindweergave (blijft wel in de gewone agenda)">
        <input type="checkbox" class="ev-hide-kid-cb" value="${m.id}" ${hidden}>🙈
      </span>` : '';
    return `<label class="check-pill" style="border-color:${m.color}">
      <input type="checkbox" class="ev-participant-cb" value="${m.id}" ${checked}> ${m.icon} ${escapeHtml(m.name)}${hideToggle}
    </label>`;
  }).join('') || '<span class="hint">Voeg eerst gezinsleden toe bij Instellingen.</span>';

  const rec = data.recurrence || {freq:'none', interval:1, endType:'never'};
  const startWeekday = new Date(startDate+'T00:00:00').getDay();
  const weeklyDaysSel = (rec.weeklyDays && rec.weeklyDays.length) ? rec.weeklyDays : [startWeekday];
  const monthlyMode = rec.monthlyMode || 'dayOfMonth';
  const monthlyDayVal = rec.monthlyDay || new Date(startDate+'T00:00:00').getDate();
  const monthlyWeekdayVal = (rec.monthlyWeekday!=null) ? rec.monthlyWeekday : startWeekday;
  const monthlyPositionVal = rec.monthlyPosition || 1;

  const scopeTitles = {single:'Alleen deze afspraak bewerken', future:'Deze en alle volgende bewerken', all:'Afspraak bewerken'};
  const headTitle = !isEdit ? 'Nieuwe afspraak' : (occCtx ? (scopeTitles[editScope]||'Afspraak bewerken') : 'Afspraak bewerken');

  // Bepaalt of het huidige pictogram nergens in de kiezer-grid voorkomt (dus een eenmalig, niet-
  // bewaard eigen pictogram is), zodat we dat bij het openen meteen zichtbaar en gemarkeerd tonen
  // i.p.v. dat de gebruiker alleen aan een verborgen hidden-input kan zien wat er actief staat.
  const knownPictoIcons = new Set(
    PICTO_CATEGORIES.flatMap(c=>c.items.map(([em])=>em))
      .concat(((state.settings && state.settings.customPictos) || []).map(c=>c.icon))
  );
  const iconIsCustomOnce = !!data.icon && !knownPictoIcons.has(data.icon);
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-head"><h2>${headTitle}</h2></div>
    <form id="event-form">
      <div class="field"><label>Titel</label><input type="text" id="f-title" required value="${escapeHtml(data.title)}" placeholder="Bijv. Tandarts Sanne"></div>
      <div class="field"><label>Korte tekst voor kindweergave (optioneel)</label><input type="text" id="f-kindtekst" value="${escapeHtml(data.kindTekst||'')}" placeholder="Bijv. Tandarts"></div>
      <div class="field"><label class="check-pill check-pill--inline"><input type="checkbox" id="f-only-dayview" ${data.onlyDayView?'checked':''}> Alleen tonen in dagweergave (kindweergave)</label>
        <div class="hint">Staat dit uit, dan zie je het pictogram bij het kind zowel in de week- als de dagweergave. Vink aan om het alleen op de dag zelf te tonen.</div>
      </div>
      <div class="field"><label>Pictogram</label>
        <input type="text" id="ev-emoji-search" placeholder="Zoek een pictogram (bijv. 'zwem' of 'oma')...">
        <div class="picto-picker-box" id="ev-emoji-pick">${renderPictoPicker(data.icon)}</div><input type="hidden" id="f-icon" value="${data.icon}">
        <div class="picto-custom-add ${iconIsCustomOnce?'custom-active':''}" id="picto-custom-add">
          <input type="text" id="ev-custom-icon" maxlength="20" placeholder="Eigen pictogram (bijv. 🦖)" value="${iconIsCustomOnce?escapeHtml(data.icon):''}">
          <input type="text" id="ev-custom-label" placeholder="Naam (optioneel)" value="${iconIsCustomOnce?escapeHtml(data.iconLabel||''):''}">
          <div class="picto-custom-actions">
            <button type="button" class="btn btn-sm" id="btn-custom-once">Eenmalig gebruiken</button>
            <button type="button" class="btn btn-sm" id="btn-custom-save">Bewaren &amp; gebruiken</button>
          </div>
          <div class="hint">Typ, plak of kies hier een pictogram vanaf je toetsenbord (op een telefoon: het emoji-toetsenbord; op een computer meestal met Windows-toets + punt, of op Mac via Ctrl+Cmd+Spatie). "Eenmalig" gebruikt het alleen voor deze afspraak; "Bewaren" zet het ook bij je eigen pictogrammen hierboven, voor volgende keer.${iconIsCustomOnce?' <strong>Dit is nu het actieve, eenmalige pictogram.</strong>':''}</div>
        </div>
      </div>
      <div class="form-divider"></div>
      <div class="field"><label class="check-pill check-pill--inline"><input type="checkbox" id="f-allday" ${data.allDay?'checked':''}> Hele dag (geen specifieke tijd)</label></div>
      <div class="row2 dt-row2">
        <div class="field"><label>Van datum</label>
          <div class="date-with-dow"><span class="dow-badge" id="f-start-dow">${DOW_SHORT[new Date(startDate+'T00:00:00').getDay()]}</span><input type="date" id="f-start-date" required value="${startDate}"></div>
        </div>
        <div class="field ${data.allDay?'is-hidden':''}" id="f-start-time-wrap"><label>Van tijd</label><input type="time" id="f-start-time" ${data.allDay?'':'required'} value="${startTime}"></div>
      </div>
      <div class="row2 dt-row2">
        <div class="field"><label>Tot datum</label>
          <div class="date-with-dow"><span class="dow-badge" id="f-end-dow">${DOW_SHORT[new Date(endDate+'T00:00:00').getDay()]}</span><input type="date" id="f-end-date" required value="${endDate}"></div>
        </div>
        <div class="field ${data.allDay?'is-hidden':''}" id="f-end-time-wrap"><label>Tot tijd</label><input type="time" id="f-end-time" ${data.allDay?'':'required'} value="${endTime}"></div>
      </div>

      <div class="field"><label>Herhaling</label>
        <select id="f-rec-freq" ${editScope==='single'?'disabled':''}>
          <option value="none" ${rec.freq==='none'?'selected':''}>Geen herhaling</option>
          <option value="daily" ${rec.freq==='daily'?'selected':''}>Dagelijks</option>
          <option value="weekly" ${rec.freq==='weekly'?'selected':''}>Wekelijks</option>
          <option value="monthly" ${rec.freq==='monthly'?'selected':''}>Maandelijks</option>
          <option value="yearly" ${rec.freq==='yearly'?'selected':''}>Jaarlijks</option>
        </select>
        ${editScope==='single' ? '<div class="hint">Dit wordt een los exemplaar uit de reeks en herhaalt niet apart.</div>' : ''}
        ${editScope==='future' ? '<div class="hint">Dit patroon geldt vanaf dit tijdstip; afspraken vóór dit tijdstip in de reeks blijven ongewijzigd.</div>' : ''}
      </div>
      <div id="rec-extra" class="${rec.freq==='none'?'is-hidden':''}">
        <div class="row2">
          <div class="field"><label id="rec-interval-label">${recIntervalLabel(rec.freq)}</label><input type="number" min="1" id="f-rec-interval" value="${rec.interval||1}"></div>
          <div class="field"><label>Eindigt</label>
            <select id="f-rec-endtype">
              <option value="never" ${rec.endType==='never'?'selected':''}>Nooit</option>
              <option value="onDate" ${rec.endType==='onDate'?'selected':''}>Op datum</option>
              <option value="after" ${rec.endType==='after'?'selected':''}>Na aantal keer</option>
            </select>
          </div>
        </div>

        <div class="field ${rec.freq!=='weekly'?'is-hidden':''}" id="rec-weekly-wrap">
          <label>Op welke dag(en) van de week</label>
          <div class="check-grid">
            ${WEEKDAY_OPTS.map(([val,lbl])=>`<label class="check-pill"><input type="checkbox" class="rec-weekday-cb" value="${val}" ${weeklyDaysSel.includes(val)?'checked':''}> ${lbl}</label>`).join('')}
          </div>
        </div>

        <div id="rec-monthly-wrap" class="${rec.freq!=='monthly'?'is-hidden':''}">
          <div class="field"><label>Op welke dag van de maand</label>
            <select id="f-rec-monthly-mode">
              <option value="dayOfMonth" ${monthlyMode==='dayOfMonth'?'selected':''}>Vaste dag van de maand (nummer)</option>
              <option value="weekdayOfMonth" ${monthlyMode==='weekdayOfMonth'?'selected':''}>Weekdag van de maand (bijv. eerste maandag)</option>
            </select>
          </div>
          <div class="row2 ${monthlyMode!=='dayOfMonth'?'is-hidden':''}" id="rec-monthly-day-wrap">
            <div class="field"><label>Dag van de maand</label><input type="number" min="1" max="31" id="f-rec-monthly-day" value="${monthlyDayVal}"></div>
          </div>
          <div class="row2 ${monthlyMode!=='weekdayOfMonth'?'is-hidden':''}" id="rec-monthly-weekday-wrap">
            <div class="field"><label>Welke</label><select id="f-rec-monthly-position">
              <option value="1" ${monthlyPositionVal===1?'selected':''}>Eerste</option>
              <option value="2" ${monthlyPositionVal===2?'selected':''}>Tweede</option>
              <option value="3" ${monthlyPositionVal===3?'selected':''}>Derde</option>
              <option value="4" ${monthlyPositionVal===4?'selected':''}>Vierde</option>
              <option value="-1" ${monthlyPositionVal===-1?'selected':''}>Laatste</option>
            </select></div>
            <div class="field"><label>Dag</label><select id="f-rec-monthly-weekday">
              ${DOW_LONG.map((name,i)=>`<option value="${i}" ${i===monthlyWeekdayVal?'selected':''}>${name.charAt(0).toUpperCase()+name.slice(1)}</option>`).join('')}
            </select></div>
          </div>
        </div>

        <div class="row2">
          <div class="field ${rec.endType!=='onDate'?'is-hidden':''}" id="rec-enddate-wrap"><label>Einddatum</label><input type="date" id="f-rec-enddate" value="${rec.endDate||''}"></div>
          <div class="field ${rec.endType!=='after'?'is-hidden':''}" id="rec-count-wrap"><label>Aantal keer</label><input type="number" min="1" id="f-rec-count" value="${rec.count||5}"></div>
        </div>
      </div>

      <div class="form-divider"></div>
      <div class="field"><label>Locatie</label><input type="text" id="f-location" value="${escapeHtml(data.location)}" placeholder="Bijv. Sportschool"></div>
      <div class="field"><label>Notities</label><textarea id="f-notes" placeholder="Extra informatie...">${escapeHtml(data.notes)}</textarea></div>
      <div class="form-divider"></div>
      <div class="field"><label>Deelnemers</label><div class="check-grid">${membersHtml}</div>
        <div class="hint">Bij een kind kun je 🙈 aanvinken om diegene wél als deelnemer mee te tellen (zichtbaar in de agenda), maar zonder dat de afspraak in diens kindweergave verschijnt.</div>
      </div>

      <div class="modal-actions">
        <div>${isEdit?'<button type="button" class="btn btn-danger" id="btn-delete-event">Verwijderen</button>':''}</div>
        <div class="modal-actions-buttons">
          <button type="button" class="btn" id="btn-cancel-modal">Annuleren</button>
          <button type="submit" class="btn btn-primary">Opslaan</button>
        </div>
      </div>
    </form>
  `;

  document.getElementById('ev-emoji-pick').addEventListener('click', e=>{
    const b = e.target.closest('.picto-btn'); if(!b) return;
    document.querySelectorAll('#ev-emoji-pick .picto-btn').forEach(x=>x.classList.remove('sel'));
    b.classList.add('sel');
    document.getElementById('f-icon').value = b.dataset.em;
    document.getElementById('picto-custom-add').classList.remove('custom-active');
    document.getElementById('ev-custom-icon').value = '';
    document.getElementById('ev-custom-label').value = '';
    const titleInput = document.getElementById('f-title');
    const kindInput = document.getElementById('f-kindtekst');
    if(!titleInput.value.trim()) titleInput.value = b.dataset.label;
    if(!kindInput.value.trim()) kindInput.value = b.dataset.label;
  });

  document.getElementById('ev-emoji-search').addEventListener('input', (e)=>{
    const q = e.target.value.trim().toLowerCase();
    document.querySelectorAll('#ev-emoji-pick .picto-cat-label').forEach(catLabel=>{
      const grid = catLabel.nextElementSibling;
      let anyVisible = false;
      grid.querySelectorAll('.picto-btn').forEach(btn=>{
        const match = !q || btn.dataset.label.toLowerCase().includes(q);
        btn.classList.toggle('is-hidden', !match);
        if(match) anyVisible = true;
      });
      catLabel.classList.toggle('is-hidden', !anyVisible);
      grid.classList.toggle('is-hidden', !anyVisible);
    });
  });

  // Eigen pictogram: "Eenmalig gebruiken" past alleen dit formulier aan (niets wordt bewaard).
  // "Bewaren & gebruiken" zet het pictogram ook in state.settings.customPictos, zodat het
  // voortaan gewoon als extra categorie bovenaan de kiezer verschijnt (zie renderPictoPicker).
  function useCustomIcon(persist){
    const iconInput = document.getElementById('ev-custom-icon');
    const labelInput = document.getElementById('ev-custom-label');
    const customBox = document.getElementById('picto-custom-add');
    const icon = iconInput.value.trim();
    if(!icon){ iconInput.focus(); return; }
    const typedLabel = labelInput.value.trim();
    const label = typedLabel || icon; // fallback alleen voor de opslag-lijst (customPictos), niet voor titel/kindtekst
    if(persist){
      const list = ((state.settings && state.settings.customPictos) || []).slice();
      if(!list.some(c=>c.icon===icon)) list.push({icon, label});
      state.settings = Object.assign({}, state.settings, {customPictos:list});
      window.fbSync.syncSettings(state.settings).catch(reportSyncError);
      document.getElementById('ev-emoji-pick').innerHTML = renderPictoPicker(icon);
      customBox.classList.remove('custom-active');
      iconInput.value = '';
      labelInput.value = '';
    } else {
      // Icoon én naam blijven zichtbaar staan (i.p.v. geleegd te worden), met een geaccentueerde
      // rand om het vak: dit is de enige, duidelijke plek die toont wat het actieve, eenmalige
      // pictogram + naam is — ook nadat je hem net hebt gebruikt of aangepast.
      document.querySelectorAll('#ev-emoji-pick .picto-btn').forEach(x=>x.classList.remove('sel'));
      customBox.classList.add('custom-active');
      iconInput.value = icon;
    }
    document.getElementById('f-icon').value = icon;
    // De getypte naam wordt altijd doorgezet naar titel + korte tekst kindweergave — ook als je
    // een bestaande afspraak aanpast en die velden al een waarde hebben. Zonder getypte naam
    // blijven titel/kindtekst ongemoeid (anders belandt het emoji-teken zelf als tekst daarin).
    if(typedLabel){
      document.getElementById('f-title').value = typedLabel;
      document.getElementById('f-kindtekst').value = typedLabel;
    }
  }
  document.getElementById('btn-custom-once').addEventListener('click', ()=> useCustomIcon(false));
  document.getElementById('btn-custom-save').addEventListener('click', ()=> useCustomIcon(true));

  const alldaySel = document.getElementById('f-allday');
  alldaySel.addEventListener('change', ()=>{
    const on = alldaySel.checked;
    document.getElementById('f-start-time-wrap').classList.toggle('is-hidden', on);
    document.getElementById('f-end-time-wrap').classList.toggle('is-hidden', on);
    document.getElementById('f-start-time').required = !on;
    document.getElementById('f-end-time').required = !on;
  });

  // "Tot datum"/"Tot tijd" schuift automatisch mee als je "Van" later zet dan het punt waarop het
  // formulier begon (duur blijft gelijk aan de duur bij openen). Zet je "Van" juist vróeger (of terug
  // naar voor dat beginpunt), dan blijft "Tot" staan en wordt de afspraak dus langer.
  //
  // Belangrijk: "duration" en "refStartDT" worden hier NIET bij elke aanroep herberekend uit de dan
  // actuele veldwaarden. Datum- en tijdveld vuren elk hun eigen 'change'-event; wie "Van" in één keer
  // naar een andere dag én ander tijdstip zet, veroorzaakt dus twee losse aanroepen na elkaar. Met een
  // steeds opnieuw afgeleide duur/referentie stapelden kleine tussentijdse (half aangepaste) standen
  // zich op tot een verkeerde einduitkomst. Door de duur één keer vast te zetten bij het openen, en de
  // referentie alleen bij te werken wanneer er ook echt geschoven is, geeft elke combinatie van datum-
  // en tijdwijzigingen (in welke volgorde dan ook) hetzelfde, voorspelbare eindresultaat.
  const startDateEl = document.getElementById('f-start-date');
  const startTimeEl = document.getElementById('f-start-time');
  const endDateEl = document.getElementById('f-end-date');
  const endTimeEl = document.getElementById('f-end-time');
  let refStartDT = combineDateTime(startDateEl.value, startTimeEl.value || '00:00');
  const origDuration = combineDateTime(endDateEl.value, endTimeEl.value || '00:00') - refStartDT;
  function shiftEndWithStart(){
    if(origDuration < 0) return; // ongeldige startdata (bijv. bij corrupte data) — niet aan sleutelen
    const newStartDT = combineDateTime(startDateEl.value, startTimeEl.value || '00:00');
    if(isNaN(newStartDT) || !startDateEl.value || !(alldaySel.checked || startTimeEl.value)) return;
    if(newStartDT > refStartDT){
      const newEndDT = new Date(newStartDT.getTime() + origDuration);
      endDateEl.value = fmtISODate(newEndDT);
      if(!alldaySel.checked) endTimeEl.value = fmtTimeHM(newEndDT);
      refStartDT = newStartDT;
    }
  }
  startDateEl.addEventListener('change', shiftEndWithStart);
  startTimeEl.addEventListener('change', shiftEndWithStart);

  // Afgekort weekdagje (bijv. "wo") naast "Van datum"/"Tot datum" actueel houden zodra de datum
  // wijzigt — ook wanneer "Tot" automatisch meeschuift via shiftEndWithStart hierboven.
  const startDowEl = document.getElementById('f-start-dow');
  const endDowEl = document.getElementById('f-end-dow');
  function updateDowBadges(){
    if(startDateEl.value) startDowEl.textContent = DOW_SHORT[new Date(startDateEl.value+'T00:00:00').getDay()];
    if(endDateEl.value) endDowEl.textContent = DOW_SHORT[new Date(endDateEl.value+'T00:00:00').getDay()];
  }
  startDateEl.addEventListener('change', updateDowBadges);
  endDateEl.addEventListener('change', updateDowBadges);


  // "Tot" vóór "Van" wordt niet meer live gevalideerd tijdens het instellen
  // (op iOS vuurt de time-picker 'change' al bij elke tussentijdse wieltik,
  // waardoor deze check daar te vroeg afging). De waarde blijft nu gewoon
  // staan zolang je aan het invullen bent; de check gebeurt pas bij opslaan
  // (zie submit-handler hieronder), en de ingevoerde datum/tijd blijft dan
  // staan zodat je 'm kunt corrigeren.

  const freqSel = document.getElementById('f-rec-freq');
  function updateRecVisibility(){
    const v = freqSel.value;
    document.getElementById('rec-extra').classList.toggle('is-hidden', v==='none');
    document.getElementById('rec-weekly-wrap').classList.toggle('is-hidden', v!=='weekly');
    document.getElementById('rec-monthly-wrap').classList.toggle('is-hidden', v!=='monthly');
    document.getElementById('rec-interval-label').textContent = recIntervalLabel(v);
  }
  freqSel.addEventListener('change', updateRecVisibility);
  const monthlyModeSel = document.getElementById('f-rec-monthly-mode');
  function updateMonthlyModeVisibility(){
    const v = monthlyModeSel.value;
    document.getElementById('rec-monthly-day-wrap').classList.toggle('is-hidden', v!=='dayOfMonth');
    document.getElementById('rec-monthly-weekday-wrap').classList.toggle('is-hidden', v!=='weekdayOfMonth');
  }
  monthlyModeSel.addEventListener('change', updateMonthlyModeVisibility);
  const endTypeSel = document.getElementById('f-rec-endtype');
  endTypeSel.addEventListener('change', ()=>{
    document.getElementById('rec-enddate-wrap').classList.toggle('is-hidden', endTypeSel.value!=='onDate');
    document.getElementById('rec-count-wrap').classList.toggle('is-hidden', endTypeSel.value!=='after');
  });

  document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
  const delBtn = document.getElementById('btn-delete-event');
  if(delBtn) delBtn.addEventListener('click', ()=>{
    if(editScope==='single'){
      confirmDialog('Deze ene afspraak uit de reeks verwijderen? De rest van de herhaling blijft gewoon staan.', ()=>{
        const parent = eventById(recurrenceSeriesId);
        if(parent){
          const updatedParent = addExdateToSeries(parent, new Date(recurrenceOccStartISO));
          const pIdx = state.events.findIndex(x=>x.id===parent.id);
          state.events[pIdx] = updatedParent;
          window.fbSync.syncEvent(updatedParent).catch(reportSyncError);
        }
        closeModal(); renderAgenda();
        if(document.getElementById('panel-kind').classList.contains('active')) renderKid();
        showToast('Afspraak verwijderd');
      });
    } else if(editScope==='future'){
      confirmDialog('Deze afspraak en alle volgende herhalingen verwijderen? Eerdere afspraken in de reeks blijven staan.', ()=>{
        const parent = eventById(recurrenceSeriesId);
        const splitPoint = new Date(recurrenceOccStartISO);
        if(parent){
          const truncated = truncateSeriesBefore(parent, splitPoint);
          const pIdx = state.events.findIndex(x=>x.id===parent.id);
          state.events[pIdx] = truncated;
          window.fbSync.syncEvent(truncated).catch(reportSyncError);
          seriesChildren(parent.id).forEach(child=>{
            if(child.recurrenceOriginalStart && new Date(child.recurrenceOriginalStart) > splitPoint){
              state.events = state.events.filter(x=>x.id!==child.id);
              window.fbSync.deleteEventRemote(child.id).catch(reportSyncError);
            }
          });
        }
        closeModal(); renderAgenda();
        if(document.getElementById('panel-kind').classList.contains('active')) renderKid();
        showToast('Afspraak en volgende herhalingen verwijderd');
      });
    } else {
      const isSeries = data.recurrence && data.recurrence.freq !== 'none';
      confirmDialog(isSeries ? 'Deze hele reeks (alle herhalingen) verwijderen?' : 'Deze afspraak verwijderen?', ()=>{
        state.events = state.events.filter(x=>x.id!==data.id);
        window.fbSync.deleteEventRemote(data.id).catch(reportSyncError);
        if(isSeries){
          seriesChildren(data.id).forEach(child=>{
            state.events = state.events.filter(x=>x.id!==child.id);
            window.fbSync.deleteEventRemote(child.id).catch(reportSyncError);
          });
        }
        closeModal(); renderAgenda();
        if(document.getElementById('panel-kind').classList.contains('active')) renderKid();
        showToast('Afspraak verwijderd');
      });
    }
  });

  document.getElementById('event-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    const isAllDay = document.getElementById('f-allday').checked;
    const sd = document.getElementById('f-start-date').value, st = isAllDay ? '00:00' : document.getElementById('f-start-time').value;
    const ed = document.getElementById('f-end-date').value, et = isAllDay ? '23:59' : document.getElementById('f-end-time').value;
    const startDT = combineDateTime(sd, st), endDT = combineDateTime(ed, et);
    if(endDT < startDT){ alertDialog('"Tot" kan niet vóór "Van" liggen. Het einde van een afspraak moet op of na het begin liggen. De afspraak is nog niet opgeslagen — pas de datum/tijd aan en probeer het opnieuw.'); return; }
    const participants = Array.from(document.querySelectorAll('#event-form .ev-participant-cb:checked')).map(i=>i.value);
    if(state.settings && state.settings.requireParticipant && participants.length===0){
      alertDialog('Kies minstens één deelnemer. Dit is verplicht ingesteld bij Instellingen. De afspraak is nog niet opgeslagen.');
      return;
    }
    const hiddenFromKidView = Array.from(document.querySelectorAll('#event-form .ev-hide-kid-cb:checked')).map(i=>i.value).filter(id=>participants.includes(id));
    const freq = document.getElementById('f-rec-freq').value;
    let recurrence = {freq:'none'};
    if(freq!=='none'){
      recurrence = {
        freq,
        interval: parseInt(document.getElementById('f-rec-interval').value,10) || 1,
        endType: document.getElementById('f-rec-endtype').value,
        endDate: document.getElementById('f-rec-enddate').value,
        count: parseInt(document.getElementById('f-rec-count').value,10) || 1,
      };
      if(freq==='weekly'){
        let days = Array.from(document.querySelectorAll('.rec-weekday-cb:checked')).map(cb=>parseInt(cb.value,10));
        if(!days.length) days = [startDT.getDay()];
        recurrence.weeklyDays = days;
      } else if(freq==='monthly'){
        recurrence.monthlyMode = document.getElementById('f-rec-monthly-mode').value;
        if(recurrence.monthlyMode==='dayOfMonth'){
          recurrence.monthlyDay = parseInt(document.getElementById('f-rec-monthly-day').value,10) || startDT.getDate();
        } else {
          recurrence.monthlyPosition = parseInt(document.getElementById('f-rec-monthly-position').value,10);
          recurrence.monthlyWeekday = parseInt(document.getElementById('f-rec-monthly-weekday').value,10);
        }
      }
    }
    const newEvent = {
      id: data.id,
      title: document.getElementById('f-title').value.trim() || '(zonder titel)',
      kindTekst: document.getElementById('f-kindtekst').value.trim(),
      onlyDayView: document.getElementById('f-only-dayview').checked,
      icon: document.getElementById('f-icon').value || '📅',
      iconLabel: document.getElementById('ev-custom-label').value.trim(),
      start: startDT.toISOString(),
      end: endDT.toISOString(),
      location: document.getElementById('f-location').value.trim(),
      notes: document.getElementById('f-notes').value.trim(),
      participants,
      hiddenFromKidView,
      allDay: isAllDay,
      recurrence
    };
    // Een al bestaand los exemplaar (override) blijft gekoppeld aan zijn reeks bij normaal bewerken.
    if(data.recurrenceParentId){
      newEvent.recurrenceParentId = data.recurrenceParentId;
      newEvent.recurrenceOriginalStart = data.recurrenceOriginalStart;
    }

    if(editScope==='single'){
      newEvent.id = uid();
      newEvent.recurrence = {freq:'none'};
      newEvent.recurrenceParentId = recurrenceSeriesId;
      newEvent.recurrenceOriginalStart = recurrenceOccStartISO;
      const parent = eventById(recurrenceSeriesId);
      if(parent){
        const updatedParent = addExdateToSeries(parent, new Date(recurrenceOccStartISO));
        const pIdx = state.events.findIndex(x=>x.id===parent.id);
        state.events[pIdx] = updatedParent;
        window.fbSync.syncEvent(updatedParent).catch(reportSyncError);
      }
      state.events.push(newEvent);
      window.fbSync.syncEvent(newEvent).catch(reportSyncError);
    } else if(editScope==='future'){
      const parent = eventById(recurrenceSeriesId);
      const splitPoint = new Date(recurrenceOccStartISO);
      newEvent.id = uid();
      if(parent){
        const truncated = truncateSeriesBefore(parent, splitPoint);
        const pIdx = state.events.findIndex(x=>x.id===parent.id);
        state.events[pIdx] = truncated;
        window.fbSync.syncEvent(truncated).catch(reportSyncError);
        // Toekomstige losse afwijkingen van de oude reeks horen nu bij deze nieuwe reeks.
        seriesChildren(parent.id).forEach(child=>{
          if(child.recurrenceOriginalStart && new Date(child.recurrenceOriginalStart) > splitPoint){
            const updatedChild = Object.assign({}, child, { recurrenceParentId: newEvent.id });
            const cIdx = state.events.findIndex(x=>x.id===child.id);
            state.events[cIdx] = updatedChild;
            window.fbSync.syncEvent(updatedChild).catch(reportSyncError);
          }
        });
        newEvent.recurrence = Object.assign({}, newEvent.recurrence, {
          exdates: (parent.recurrence.exdates||[]).filter(iso=> new Date(iso) > splitPoint)
        });
      }
      state.events.push(newEvent);
      window.fbSync.syncEvent(newEvent).catch(reportSyncError);
    } else if(isEdit){
      const idx = state.events.findIndex(x=>x.id===data.id);
      state.events[idx] = newEvent;
      window.fbSync.syncEvent(newEvent).catch(reportSyncError);
    } else {
      state.events.push(newEvent);
      window.fbSync.syncEvent(newEvent).catch(reportSyncError);
    }
    closeModal(); renderAgenda();
    if(document.getElementById('panel-kind').classList.contains('active')) renderKid();
    showToast('Afspraak opgeslagen');
  });

  openModal();
}

/* =========================================================
   MODAL helpers
   ========================================================= */
function openModal(){ document.getElementById('modal-overlay').classList.add('open'); }
function closeModal(){ document.getElementById('modal-overlay').classList.remove('open'); }
document.getElementById('modal-overlay').addEventListener('click', e=>{
  if(e.target.id==='modal-overlay') closeModal();
});
function confirmDialog(msg, onYes){
  document.getElementById('alert-content').innerHTML = `
    <div class="modal-head"><h2>Weet je het zeker?</h2></div>
    <p>${escapeHtml(msg)}</p>
    <div class="modal-actions"><div></div>
      <div class="modal-actions-buttons">
        <button class="btn" id="cd-no">Annuleren</button>
        <button class="btn btn-danger" id="cd-yes">Ja, verwijderen</button>
      </div>
    </div>`;
  document.getElementById('cd-no').addEventListener('click', closeAlert);
  document.getElementById('cd-yes').addEventListener('click', ()=>{ closeAlert(); onYes(); });
  openAlert();
}

/* Gecentreerde melding op het scherm, los van de eventueel geopende afspraak-popup
   (die blijft — met alle ingevulde velden — gewoon zichtbaar op de achtergrond staan).
   Sluit alleen via een knop, niet via een klik op de achtergrond. Wordt gebruikt voor
   zowel bevestigingsvragen (confirmDialog, 2 knoppen) als losse waarschuwingen
   (alertDialog, 1 knop). */
function alertDialog(msg, onOk){
  document.getElementById('alert-content').innerHTML = `
    <div class="modal-head"><h2>Let op</h2></div>
    <p>${escapeHtml(msg)}</p>
    <div class="modal-actions">
      <button class="btn btn-primary" id="ad-ok">Oké</button>
    </div>`;
  document.getElementById('ad-ok').addEventListener('click', ()=>{
    closeAlert();
    if(onOk) onOk();
  });
  openAlert();
}
function openAlert(){ document.getElementById('alert-overlay').classList.add('open'); }
function closeAlert(){ document.getElementById('alert-overlay').classList.remove('open'); }

/* Keuzedialoog die verschijnt zodra iemand op één voorkomen van een herhalende afspraak klikt:
   bepaalt of de actie (bewerken/verwijderen) alleen dit exemplaar, dit + alle volgende, of de
   hele reeks moet raken. onChoose krijgt 'single' | 'future' | 'all', of null bij annuleren. */
/* Toont in één keuzescherm zowel de bewerk- als verwijderopties voor een voorkomen van een
   herhalende afspraak. Verwijderen gebeurt direct vanuit dit scherm (met een korte bevestiging) —
   niet meer via "open het bewerkformulier en klik daar nogmaals op verwijderen", omdat dat
   omslachtig was en onduidelijk liet of de actie al had plaatsgevonden. */
function openRecurrenceActionChooser(ev, occCtx){
  const occStart = occCtx.occStart;
  document.getElementById('alert-content').innerHTML = `
    <div class="modal-head"><h2>Welke afspraken?</h2></div>
    <p>Dit is onderdeel van een herhalende afspraak.</p>
    <div class="hint" style="margin-top:10px;">✏️ Bewerken</div>
    <div style="display:flex; flex-direction:column; gap:8px; margin-top:6px;">
      <button type="button" class="btn" id="act-edit-single">Alleen deze afspraak</button>
      <button type="button" class="btn" id="act-edit-future">Deze en alle volgende</button>
      <button type="button" class="btn" id="act-edit-all">Hele reeks</button>
    </div>
    <div class="hint" style="margin-top:14px;">🗑️ Verwijderen</div>
    <div style="display:flex; flex-direction:column; gap:8px; margin-top:6px;">
      <button type="button" class="btn btn-danger" id="act-del-single">Alleen deze afspraak</button>
      <button type="button" class="btn btn-danger" id="act-del-future">Deze en alle volgende</button>
      <button type="button" class="btn btn-danger" id="act-del-all">Hele reeks</button>
    </div>
    <div class="modal-actions"><div></div><div class="modal-actions-buttons">
      <button type="button" class="btn" id="act-cancel">Annuleren</button>
    </div></div>`;
  document.getElementById('act-edit-single').addEventListener('click', ()=>{ closeAlert(); buildAndOpenEventModal(ev, null, occCtx, 'single'); });
  document.getElementById('act-edit-future').addEventListener('click', ()=>{ closeAlert(); buildAndOpenEventModal(ev, null, occCtx, 'future'); });
  document.getElementById('act-edit-all').addEventListener('click', ()=>{ closeAlert(); buildAndOpenEventModal(ev, null, occCtx, 'all'); });
  document.getElementById('act-del-single').addEventListener('click', ()=>{ closeAlert(); deleteRecurrenceOccurrence(ev, occStart, 'single'); });
  document.getElementById('act-del-future').addEventListener('click', ()=>{ closeAlert(); deleteRecurrenceOccurrence(ev, occStart, 'future'); });
  document.getElementById('act-del-all').addEventListener('click', ()=>{ closeAlert(); deleteRecurrenceOccurrence(ev, occStart, 'all'); });
  document.getElementById('act-cancel').addEventListener('click', closeAlert);
  openAlert();
}

/* Verwijdert direct (na bevestiging) — zonder tussenkomst van het bewerkformulier — één
   voorkomen, dit + alle volgende, of de hele reeks van een herhalende afspraak. */
function deleteRecurrenceOccurrence(ev, occStart, scope){
  const afterKidRefresh = ()=>{
    renderAgenda();
    if(document.getElementById('panel-kind').classList.contains('active')) renderKid();
  };
  if(scope==='single'){
    confirmDialog('Deze ene afspraak uit de reeks verwijderen? De rest van de herhaling blijft gewoon staan.', ()=>{
      const updatedParent = addExdateToSeries(ev, occStart);
      const pIdx = state.events.findIndex(x=>x.id===ev.id);
      state.events[pIdx] = updatedParent;
      window.fbSync.syncEvent(updatedParent).catch(reportSyncError);
      afterKidRefresh();
      showToast('Afspraak verwijderd');
    });
  } else if(scope==='future'){
    confirmDialog('Deze afspraak en alle volgende herhalingen verwijderen? Eerdere afspraken in de reeks blijven staan.', ()=>{
      const truncated = truncateSeriesBefore(ev, occStart);
      const pIdx = state.events.findIndex(x=>x.id===ev.id);
      state.events[pIdx] = truncated;
      window.fbSync.syncEvent(truncated).catch(reportSyncError);
      seriesChildren(ev.id).forEach(child=>{
        if(child.recurrenceOriginalStart && new Date(child.recurrenceOriginalStart) > occStart){
          state.events = state.events.filter(x=>x.id!==child.id);
          window.fbSync.deleteEventRemote(child.id).catch(reportSyncError);
        }
      });
      afterKidRefresh();
      showToast('Afspraak en volgende herhalingen verwijderd');
    });
  } else {
    confirmDialog('Deze hele reeks (alle herhalingen) verwijderen?', ()=>{
      state.events = state.events.filter(x=>x.id!==ev.id);
      window.fbSync.deleteEventRemote(ev.id).catch(reportSyncError);
      seriesChildren(ev.id).forEach(child=>{
        state.events = state.events.filter(x=>x.id!==child.id);
        window.fbSync.deleteEventRemote(child.id).catch(reportSyncError);
      });
      afterKidRefresh();
      showToast('Afspraak verwijderd');
    });
  }
}


/* =========================================================
   KINDWEERGAVE — dit is de eigen agenda van het kind:
   dezelfde afspraken, maar dan gefilterd op dat kind, groot en
   in pictogrammen, gegroepeerd per dagdeel (ochtend/middag/avond)
   zoals een fysiek planbord. Er kan ook direct vanuit deze
   weergave iets voor het kind toegevoegd worden.
   ========================================================= */
document.getElementById('kid-view-switch').addEventListener('click', e=>{
  const b = e.target.closest('button[data-view]'); if(!b) return;
  kidView = b.dataset.view;
  document.querySelectorAll('#kid-view-switch button').forEach(x=>x.classList.toggle('active', x===b));
  renderKid();
});
document.getElementById('kid-prev').addEventListener('click', ()=>{ stepKid(-1); });
document.getElementById('kid-next').addEventListener('click', ()=>{ stepKid(1); });
document.getElementById('kid-today').addEventListener('click', ()=>{ kidDate = new Date(); renderKid(); });
document.getElementById('btn-kid-add').addEventListener('click', ()=>{
  if(!kidId){ showToast('Voeg eerst een gezinslid toe bij Instellingen'); return; }
  const d = kidView==='day' ? fmtISODate(kidDate) : fmtISODate(getMonday(kidDate));
  openEventModal(null, {date:d, hour:nextFullHourCapped(), participants:[kidId]});
});
function stepKid(dir){
  kidDate = kidView==='week' ? addDays(kidDate,7*dir) : addDays(kidDate,dir);
  renderKid();
}

function renderKid(){
  const sel = document.getElementById('kid-select');
  const candidates = state.familyMembers.filter(m=>m.role==='kind');
  const pickFrom = candidates.length ? candidates : state.familyMembers;
  if(!kidId || !pickFrom.find(m=>m.id===kidId)) kidId = pickFrom.length ? pickFrom[0].id : null;

  sel.innerHTML = pickFrom.map(m=>`
    <button class="kid-btn ${m.id===kidId?'active':''}" data-mid="${m.id}">
      <span class="av" style="background:${m.color}">${m.icon}</span>${escapeHtml(m.name)}
    </button>`).join('');
  sel.querySelectorAll('.kid-btn').forEach(b=>{
    b.addEventListener('click', ()=>{ kidId = b.dataset.mid; renderKid(); });
  });

  const body = document.getElementById('kid-body');
  const label = document.getElementById('kid-range-label');

  if(!kidId){
    label.textContent='';
    body.innerHTML = `<div class="kid-empty"><span class="em">🧑‍🧒</span>Voeg eerst een gezinslid toe bij Instellingen (en zet 'm op "kind").</div>`;
    return;
  }
  const m = memberById(kidId);
  const addBtn = document.getElementById('btn-kid-add');
  addBtn.style.setProperty('--member-color', m.color);
  // In weekweergave heeft elke dag zijn eigen plusje (zie wagon-add); de losse
  // knop bovenin is daar dubbelop en wordt verborgen. In dagweergave blijft
  // deze de enige manier om iets toe te voegen.
  addBtn.classList.toggle('is-hidden', kidView==='week');

  if(kidView==='week'){
    const mon = getMonday(kidDate);
    label.textContent = mon.getDate()+' – '+addDays(mon,6).getDate()+' '+MONTHS[addDays(mon,6).getMonth()];
    const rangeStart = mon, rangeEnd = endOfDay(addDays(mon,6));
    const occs = occurrencesInRange(rangeStart, rangeEnd, [kidId]).filter(o=> !(o.event.hiddenFromKidView||[]).includes(kidId));
    const today = new Date();
    let wagons = '';
    for(let d=0; d<7; d++){
      const day = addDays(mon,d);
      const isToday = sameDay(day,today);
      const dayOccs = occs.filter(o=> o.occStart <= endOfDay(day) && o.occEnd >= startOfDay(day) && !o.event.onlyDayView).sort((a,b)=>a.occStart-b.occStart);
      const wholeDayOccs = dayOccs.filter(o=> occDayLabel(o.event, o.occStart, o.occEnd, day) === 'Hele dag');
      const timedOccs = dayOccs.filter(o=> occDayLabel(o.event, o.occStart, o.occEnd, day) !== 'Hele dag');
      let rows = '';
      wholeDayOccs.forEach(o=>{
        rows += `<div class="picto-row" data-eid="${o.event.id}" data-occstart="${o.occStart.toISOString()}">
          <span class="em">${o.event.icon||'📅'}</span>
          <div class="picto-row-info">
            <span class="tm">Hele dag</span>
            <span class="txt">${escapeHtml(o.event.kindTekst || o.event.title)}</span>
          </div>
        </div>`;
      });
      let lastPart = null;
      timedOccs.forEach(o=>{
        const part = partOfDay(o.occStart);
        if(part.key!==lastPart){ rows += `<div class="daypart-head">${part.em} ${part.label}</div>`; lastPart = part.key; }
        rows += `<div class="picto-row" data-eid="${o.event.id}" data-occstart="${o.occStart.toISOString()}">
          <span class="em">${o.event.icon||'📅'}</span>
          <div class="picto-row-info">
            <span class="tm">${occDayLabel(o.event, o.occStart, o.occEnd, day)}</span>
            <span class="txt">${escapeHtml(o.event.kindTekst || o.event.title)}</span>
          </div>
        </div>`;
      });
      if(!dayOccs.length) rows = `<div class="wagon-empty">Niets gepland ✨</div>`;
      wagons += `<div class="wagon ${isToday?'today':''}">
        <div class="wagon-head">
          <div class="lbl"><span class="dow">${DOW_LONG[day.getDay()].slice(0,2).toUpperCase()}</span><span class="dnum">${day.getDate()}/${day.getMonth()+1}</span></div>
          <button type="button" class="wagon-add" data-date="${fmtISODate(day)}" title="Toevoegen op deze dag">+</button>
        </div>
        <div class="wagon-body">${rows}</div>
      </div>`;
    }
    body.innerHTML = `<div class="train">${wagons}</div>`;
    autofitSingleLineText('.picto-row .txt', 16, 0.38);
    body.querySelectorAll('.wagon-add').forEach(b=>{
      b.addEventListener('click', ()=> openEventModal(null, {date:b.dataset.date, hour:nextFullHourCapped(), participants:[kidId]}));
    });
    body.querySelectorAll('.picto-row').forEach(r=>{
      r.addEventListener('click', ()=> openEventModal(eventById(r.dataset.eid), null, {occStart:new Date(r.dataset.occstart)}));
    });
  } else {
    label.textContent = DOW_LONG[kidDate.getDay()].replace(/^./,c=>c.toUpperCase())+' '+kidDate.getDate()+' '+MONTHS[kidDate.getMonth()];
    const rangeStart = startOfDay(kidDate), rangeEnd = endOfDay(kidDate);
    const occs = occurrencesInRange(rangeStart, rangeEnd, [kidId]).filter(o=> !(o.event.hiddenFromKidView||[]).includes(kidId)).sort((a,b)=>a.occStart-b.occStart);
    const today = new Date();
    const isToday = sameDay(kidDate, today);
    const nowMinutes = today.getHours()*60+today.getMinutes();
    if(occs.length===0){
      body.innerHTML = `<div class="kid-empty"><span class="em">🌤️</span>Niets gepland voor ${escapeHtml(m.name)} op deze dag!</div>`;
      return;
    }
    let html = '<div class="rail">';
    let nowInserted = false;
    let lastPart = null;
    const wholeDayOccs = occs.filter(o=> occDayLabel(o.event, o.occStart, o.occEnd, kidDate) === 'Hele dag');
    const timedOccs = occs.filter(o=> occDayLabel(o.event, o.occStart, o.occEnd, kidDate) !== 'Hele dag');
    wholeDayOccs.forEach(o=>{
      html += `<div class="rail-item" data-eid="${o.event.id}" data-occstart="${o.occStart.toISOString()}"><div class="rail-card">
        <span class="em">${o.event.icon||'📅'}</span>
        <div class="info">
          <span class="title">${escapeHtml(o.event.kindTekst || o.event.title)}</span>
          <span class="time">Hele dag</span>
          ${o.event.location?`<div class="loc">📍 ${escapeHtml(o.event.location)}</div>`:''}
        </div>
      </div></div>`;
    });
    timedOccs.forEach(o=>{
      const part = partOfDay(o.occStart);
      if(part.key!==lastPart){
        html += `<div class="rail-daypart"><span class="lbl">${part.em} ${part.label}</span><span class="line"></span></div>`;
        lastPart = part.key;
      }
      if(isToday && !nowInserted && (o.occStart.getHours()*60+o.occStart.getMinutes()) > nowMinutes){
        html += `<div class="rail-now"><div class="line"></div></div>`;
        nowInserted = true;
      }
      html += `<div class="rail-item" data-eid="${o.event.id}" data-occstart="${o.occStart.toISOString()}"><div class="rail-card">
        <span class="em">${o.event.icon||'📅'}</span>
        <div class="info">
          <span class="title">${escapeHtml(o.event.kindTekst || o.event.title)}</span>
          <span class="time">${occDayLabel(o.event, o.occStart, o.occEnd, kidDate)}</span>
          ${o.event.location?`<div class="loc">📍 ${escapeHtml(o.event.location)}</div>`:''}
        </div>
      </div></div>`;
    });
    if(isToday && !nowInserted) html += `<div class="rail-now"><div class="line"></div></div>`;
    html += '</div>';
    body.innerHTML = html;
    body.querySelectorAll('.rail-item').forEach(r=>{
      r.addEventListener('click', ()=> openEventModal(eventById(r.dataset.eid), null, {occStart:new Date(r.dataset.occstart)}));
    });
  }
}

/* =========================================================
   LIJSTJES
   ========================================================= */
// Oude lijst-types (uit een eerdere appversie) vallen terug op 'afvinken', zodat
// bestaande lijstjes gewoon blijven werken zonder dataverlies.
function normalizeListKind(k){
  return (k==='afvinken' || k==='genummerd' || k==='opsomming') ? k : 'afvinken';
}

function renderLists(){
  if(!activeListId && state.lists.length) activeListId = state.lists[0].id;
  const nav = document.getElementById('lists-nav');
  const kindIcon = k => normalizeListKind(k)==='genummerd' ? '🔢' : (normalizeListKind(k)==='opsomming' ? '📋' : '✅');
  nav.innerHTML = state.lists.map(l=>`
    <button class="list-nav-btn ${l.id===activeListId?'active':''}" data-lid="${l.id}">${kindIcon(l.kind)} ${escapeHtml(l.name)}</button>
  `).join('');
  nav.querySelectorAll('.list-nav-btn').forEach(b=>{
    b.addEventListener('click', ()=>{ activeListId = b.dataset.lid; renderLists(); });
  });
  requestAnimationFrame(()=>{
    const wrap = document.getElementById('lists-nav-wrap');
    if(wrap) wrap.classList.toggle('scrollable', nav.scrollWidth > nav.clientWidth + 2);
  });

  const main = document.getElementById('list-main');
  const list = listById(activeListId);
  if(!list){
    main.innerHTML = `<div class="empty-state"><span class="em">📋</span>Nog geen lijstjes. Maak er een aan!</div>`;
    return;
  }
  const kind = normalizeListKind(list.kind);
  const isCheck = kind==='afvinken';

  const itemsHtml = list.items.map((it, idx)=>{
    const marker = isCheck
      ? `<input type="checkbox" data-iid="${it.id}" class="li-check" ${it.done?'checked':''}>`
      : `<span class="li-marker">${kind==='genummerd' ? (idx+1)+'.' : '•'}</span>`;
    return `
    <div class="list-item ${isCheck && it.done?'done':''}">
      ${marker}
      <span class="txt" data-iid="${it.id}">${escapeHtml(it.text)}</span>
      <div class="li-actions">
        <button class="li-btn li-move-up" data-iid="${it.id}" title="Omhoog" ${idx===0?'disabled':''}>▲</button>
        <button class="li-btn li-move-down" data-iid="${it.id}" title="Omlaag" ${idx===list.items.length-1?'disabled':''}>▼</button>
        <button class="li-btn li-del" data-iid="${it.id}" title="Verwijderen">✕</button>
      </div>
    </div>`;
  }).join('') || `<div class="hint" style="padding:16px 0;">Nog niets op deze lijst.</div>`;

  main.innerHTML = `
    <div class="list-header">
      <h2>${escapeHtml(list.name)}</h2>
      <div class="list-actions">
        ${isCheck ? `<button class="btn btn-sm" id="btn-clear-done">Wis afgevinkte</button>` : ''}
        <button class="btn btn-sm" id="btn-clear-list">Lijst leegmaken</button>
        <button class="btn btn-sm btn-danger" id="btn-del-list">Lijst verwijderen</button>
      </div>
    </div>
    <div id="items-container">${itemsHtml}</div>
    <div class="add-item-row">
      <input type="text" id="new-item-text" placeholder="Nieuw item...">
      <button class="btn btn-accent" id="btn-add-item">+ Toevoegen</button>
    </div>
  `;

  main.querySelectorAll('.li-check').forEach(cb=>{
    cb.addEventListener('change', ()=>{
      const it = list.items.find(x=>x.id===cb.dataset.iid);
      it.done = cb.checked; window.fbSync.syncList(list).catch(reportSyncError); renderLists();
    });
  });
  // Tik op de tekst van een item om 'm te bewerken.
  main.querySelectorAll('.txt').forEach(span=>{
    span.addEventListener('click', ()=>{
      const it = list.items.find(x=>x.id===span.dataset.iid);
      if(!it) return;
      const input = document.createElement('input');
      input.type = 'text'; input.value = it.text; input.className = 'li-edit-input';
      span.replaceWith(input);
      input.focus(); input.select();
      let settled = false;
      const commit = ()=>{
        if(settled) return; settled = true;
        const val = input.value.trim();
        if(val && val!==it.text){ it.text = val; window.fbSync.syncList(list).catch(reportSyncError); }
        renderLists();
      };
      const cancel = ()=>{ if(settled) return; settled = true; renderLists(); };
      input.addEventListener('blur', commit);
      input.addEventListener('keydown', e=>{
        if(e.key==='Enter'){ e.preventDefault(); commit(); }
        else if(e.key==='Escape'){ e.preventDefault(); cancel(); }
      });
    });
  });
  main.querySelectorAll('.li-move-up').forEach(b=>{
    b.addEventListener('click', ()=>{
      const idx = list.items.findIndex(x=>x.id===b.dataset.iid);
      if(idx>0){
        [list.items[idx-1], list.items[idx]] = [list.items[idx], list.items[idx-1]];
        window.fbSync.syncList(list).catch(reportSyncError); renderLists();
      }
    });
  });
  main.querySelectorAll('.li-move-down').forEach(b=>{
    b.addEventListener('click', ()=>{
      const idx = list.items.findIndex(x=>x.id===b.dataset.iid);
      if(idx>-1 && idx<list.items.length-1){
        [list.items[idx+1], list.items[idx]] = [list.items[idx], list.items[idx+1]];
        window.fbSync.syncList(list).catch(reportSyncError); renderLists();
      }
    });
  });
  main.querySelectorAll('.li-del').forEach(b=>{
    b.addEventListener('click', ()=>{
      list.items = list.items.filter(x=>x.id!==b.dataset.iid); window.fbSync.syncList(list).catch(reportSyncError); renderLists();
    });
  });
  if(isCheck){
    document.getElementById('btn-clear-done').addEventListener('click', ()=>{
      if(!list.items.some(x=>x.done)) return;
      list.items = list.items.filter(x=>!x.done); window.fbSync.syncList(list).catch(reportSyncError); renderLists();
    });
  }
  document.getElementById('btn-clear-list').addEventListener('click', ()=>{
    if(!list.items.length) return;
    confirmDialog('Alle items uit deze lijst verwijderen?', ()=>{
      list.items = []; window.fbSync.syncList(list).catch(reportSyncError); renderLists();
    });
  });
  document.getElementById('btn-del-list').addEventListener('click', ()=>{
    confirmDialog('Deze hele lijst verwijderen?', ()=>{
      state.lists = state.lists.filter(x=>x.id!==list.id);
      activeListId = state.lists.length ? state.lists[0].id : null;
      window.fbSync.deleteListRemote(list.id).catch(reportSyncError); closeModal(); renderLists();
    });
  });
  function addItem(){
    const txt = document.getElementById('new-item-text').value.trim();
    if(!txt) return;
    list.items.push({id:uid(), text:txt, done:false});
    window.fbSync.syncList(list).catch(reportSyncError); renderLists();
  }
  document.getElementById('btn-add-item').addEventListener('click', addItem);
  document.getElementById('new-item-text').addEventListener('keydown', e=>{ if(e.key==='Enter') addItem(); });
}

function openNewListModal(){
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-head"><h2>Nieuwe lijst</h2></div>
    <div class="field"><label>Naam</label><input type="text" id="nl-name" placeholder="Bijv. Verjaardagscadeaus"></div>
    <div class="field"><label>Type</label>
      <select id="nl-kind">
        <option value="afvinken">Afvinklijst (met vinkjes)</option>
        <option value="genummerd">Genummerde lijst (1, 2, 3…)</option>
        <option value="opsomming">Opsomming (met bullets)</option>
      </select>
    </div>
    <div class="modal-actions"><div></div>
      <div class="modal-actions-buttons">
        <button class="btn" id="nl-cancel">Annuleren</button>
        <button class="btn btn-primary" id="nl-save">Aanmaken</button>
      </div>
    </div>
  `;
  document.getElementById('nl-cancel').addEventListener('click', closeModal);
  document.getElementById('nl-save').addEventListener('click', ()=>{
    const name = document.getElementById('nl-name').value.trim() || 'Nieuwe lijst';
    const kind = document.getElementById('nl-kind').value;
    const l = {id:uid(), name, kind, items:[]};
    state.lists.push(l); activeListId = l.id;
    window.fbSync.syncList(l).catch(reportSyncError); closeModal(); renderLists();
  });
  openModal();
}

document.getElementById('btn-new-list').addEventListener('click', openNewListModal);

/* =========================================================
   INSTELLINGEN: gezinsleden + export/import
   ========================================================= */
function renderSettings(){
  const codeEl = document.getElementById('current-hh-code');
  if(codeEl) codeEl.textContent = localStorage.getItem('gezinsagenda-hh-code') || '—';

  const reqCb = document.getElementById('setting-require-participant');
  if(reqCb) reqCb.checked = !!(state.settings && state.settings.requireParticipant);

  const wrap = document.getElementById('members-list');
  wrap.innerHTML = state.familyMembers.map(m=>`
    <div class="member-row">
      <span class="av" style="background:${m.color}">${m.icon}</span>
      <span class="nm">${escapeHtml(m.name)}</span>
      <span class="role-tag">${m.role==='kind'?'🧒 kind':'volwassene'}</span>
      <span class="grow"></span>
      <button class="btn btn-sm" data-edit="${m.id}">Bewerken</button>
      <button class="btn btn-sm btn-danger" data-del="${m.id}">Verwijderen</button>
    </div>`).join('') || `<div class="hint">Nog geen gezinsleden toegevoegd.</div>`;

  wrap.querySelectorAll('[data-edit]').forEach(b=> b.addEventListener('click', ()=> openMemberModal(memberById(b.dataset.edit))));
  wrap.querySelectorAll('[data-del]').forEach(b=> b.addEventListener('click', ()=>{
    confirmDialog('Dit gezinslid verwijderen? Diegene wordt ook uit bestaande afspraken verwijderd.', ()=>{
      state.familyMembers = state.familyMembers.filter(m=>m.id!==b.dataset.del);
      state.events.forEach(ev=> ev.participants = ev.participants.filter(id=>id!==b.dataset.del));
      if(kidId===b.dataset.del) kidId = null;
      window.fbSync.syncMembers(state.familyMembers).catch(reportSyncError);
      state.events.forEach(ev=> window.fbSync.syncEvent(ev).catch(reportSyncError));
      closeModal(); renderSettings();
    });
  }));
}
document.getElementById('btn-add-member').addEventListener('click', ()=> openMemberModal(null));

// Deze listener staat hier (los van renderSettings) omdat de checkbox zelf statisch in
// index.html staat en niet bij elke renderSettings()-aanroep opnieuw wordt aangemaakt —
// zou de listener wél in renderSettings() staan, dan zou hij bij elke re-render nog een keer
// worden toegevoegd (dubbele/meervoudige triggers bij één klik).
const requireParticipantCb = document.getElementById('setting-require-participant');
if(requireParticipantCb){
  requireParticipantCb.addEventListener('change', ()=>{
    const on = requireParticipantCb.checked;
    state.settings = Object.assign({}, state.settings, {requireParticipant: on});
    window.fbSync.syncSettings(state.settings).catch(reportSyncError);
    if(on){
      const n = countEventsWithoutParticipants();
      if(n>0){
        alertDialog(`Vanaf nu is een deelnemer verplicht bij nieuwe of gewijzigde afspraken. Je hebt nog ${n} bestaande ${n===1?'afspraak':'afspraken'} zonder deelnemer (herhalende afspraken tellen hierbij als 1) — die ${n===1?'blijft':'blijven'} ongewijzigd. Bekijk ${n===1?'m':'ze'} via de filter "Geen deelnemer" in de agenda.`);
      }
    }
  });
}

function openMemberModal(existing){
  const isEdit = !!existing;
  const data = existing || {id:uid(), name:'', color:MEMBER_COLORS[state.familyMembers.length % MEMBER_COLORS.length], icon:MEMBER_EMOJIS[0], role:'kind'};
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-head"><h2>${isEdit?'Gezinslid bewerken':'Gezinslid toevoegen'}</h2></div>
    <div class="field"><label>Naam</label><input type="text" id="mm-name" value="${escapeHtml(data.name)}" placeholder="Bijv. Noor"></div>
    <div class="field"><label>Rol</label>
      <div class="role-pick">
        <label><input type="radio" name="mm-role" value="kind" ${data.role==='kind'?'checked':''}> 🧒 Kind (zichtbaar bij Kindweergave)</label>
        <label><input type="radio" name="mm-role" value="volwassene" ${data.role!=='kind'?'checked':''}> 🧑 Volwassene</label>
      </div>
    </div>
    <div class="field"><label>Kleur</label><div class="color-pick" id="mm-colors">
      ${MEMBER_COLORS.map(c=>`<span class="sw ${c===data.color?'sel':''}" data-c="${c}" style="background:${c}"></span>`).join('')}
    </div></div>
    <div class="field"><label>Pictogram</label><div class="emoji-pick" id="mm-emojis">
      ${MEMBER_EMOJIS.map(em=>`<button type="button" class="${em===data.icon?'sel':''}" data-em="${em}">${em}</button>`).join('')}
    </div></div>
    <div class="modal-actions"><div></div>
      <div class="modal-actions-buttons">
        <button class="btn" id="mm-cancel">Annuleren</button>
        <button class="btn btn-primary" id="mm-save">Opslaan</button>
      </div>
    </div>
  `;
  let color = data.color, icon = data.icon;
  document.getElementById('mm-colors').addEventListener('click', e=>{
    const s = e.target.closest('.sw'); if(!s) return;
    document.querySelectorAll('#mm-colors .sw').forEach(x=>x.classList.remove('sel'));
    s.classList.add('sel'); color = s.dataset.c;
  });
  document.getElementById('mm-emojis').addEventListener('click', e=>{
    const b = e.target.closest('button'); if(!b) return;
    document.querySelectorAll('#mm-emojis button').forEach(x=>x.classList.remove('sel'));
    b.classList.add('sel'); icon = b.dataset.em;
  });
  document.getElementById('mm-cancel').addEventListener('click', closeModal);
  document.getElementById('mm-save').addEventListener('click', ()=>{
    const name = document.getElementById('mm-name').value.trim();
    if(!name){ showToast('Vul een naam in'); return; }
    const role = document.querySelector('input[name="mm-role"]:checked').value;
    const member = {id:data.id, name, color, icon, role};
    if(isEdit){
      const idx = state.familyMembers.findIndex(m=>m.id===data.id);
      state.familyMembers[idx] = member;
    } else {
      state.familyMembers.push(member);
    }
    window.fbSync.syncMembers(state.familyMembers).catch(reportSyncError); closeModal(); renderSettings();
  });
  openModal();
}

document.getElementById('btn-export').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'gezinsagenda-backup-'+fmtISODate(new Date())+'.json';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  showToast('Back-up gedownload');
});
document.getElementById('btn-import').addEventListener('click', ()=> document.getElementById('import-file').click());
document.getElementById('import-file').addEventListener('change', (e)=>{
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const parsed = JSON.parse(reader.result);
      if(!parsed.familyMembers || !parsed.events || !parsed.lists) throw new Error('ongeldig formaat');
      parsed.familyMembers.forEach(m=>{ if(!m.role) m.role = 'volwassene'; });
      if(!parsed.settings) parsed.settings = {}; // oudere back-ups kennen dit veld nog niet
      confirmDialog('Huidige gegevens vervangen door dit back-upbestand?', ()=>{
        state = parsed;
        window.fbSync.replaceAll(state.familyMembers, state.events, state.lists, state.settings).catch(reportSyncError);
        closeModal();
        renderAgenda(); renderKid(); renderLists(); renderSettings();
        showToast('Gegevens geïmporteerd');
      });
    }catch(err){
      showToast('Kon bestand niet lezen: ongeldig back-upbestand');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

/* =========================================================
   INIT — gezinscode-toegang + Firestore-koppeling
   ========================================================= */
function rerenderAll(){
  renderAgenda();
  renderSettings();
  if(document.getElementById('panel-kind').classList.contains('active')) renderKid();
  if(document.getElementById('panel-lijsten').classList.contains('active')) renderLists();
}

function updateSyncStatus(mode){
  const dot = document.getElementById('brand-dot');
  const note = document.getElementById('sync-note');
  if(!dot || !note) return;
  dot.classList.remove('dot-connecting','dot-online','dot-offline','dot-error');
  dot.classList.add('dot-'+mode);
  const noteMap = {
    connecting: '⏳ Verbinden...',
    online: '',
    offline: '📴 Offline — wijzigingen synchen zodra er weer internet is',
    error: '⚠️ Verbindingsfout — check de Firebase-instellingen',
  };
  const text = noteMap[mode] ?? '';
  note.textContent = text;
  note.classList.toggle('is-hidden', !text);
}

function startApp(code){
  document.getElementById('hh-gate').classList.remove('open');
  updateSyncStatus('connecting');
  window.fbSync.init(code, {
    onMembers(members, fromCache){
      if(members === null){
        const defaults = defaultFamilyMembers();
        state.familyMembers = defaults;
        window.fbSync.syncMembers(defaults).catch(reportSyncError);
      } else {
        state.familyMembers = members;
      }
      rerenderAll();
      updateSyncStatus(fromCache ? 'offline' : 'online');
    },
    onSettings(settings, fromCache){
      state.settings = settings || {};
      rerenderAll();
      updateSyncStatus(fromCache ? 'offline' : 'online');
    },
    onEvents(events, fromCache){
      state.events = events;
      rerenderAll();
      updateSyncStatus(fromCache ? 'offline' : 'online');
    },
    onLists(lists, fromCache){
      if(lists.length === 0 && !listsSeeded){
        listsSeeded = true;
        const defaults = defaultLists();
        state.lists = defaults;
        defaults.forEach(l=> window.fbSync.syncList(l).catch(reportSyncError));
      } else {
        state.lists = lists;
      }
      rerenderAll();
      updateSyncStatus(fromCache ? 'offline' : 'online');
    },
    onError(kind, err){
      console.error('Firestore-fout ('+kind+'):', err);
      updateSyncStatus('error');
    }
  }).catch(err=>{
    console.error(err);
    updateSyncStatus('error');
    showToast('Kon niet verbinden met de gezinsagenda-server. Is de Firebase-configuratie al ingevuld?');
  });
}

const savedCode = localStorage.getItem('gezinsagenda-hh-code');
if(savedCode){
  startApp(savedCode);
} else {
  document.getElementById('hh-gate').classList.add('open');
}
document.getElementById('hh-code-submit').addEventListener('click', ()=>{
  const code = document.getElementById('hh-code-input').value.trim();
  const errEl = document.getElementById('hh-gate-error');
  if(!code){ errEl.textContent = 'Vul een gezinscode in.'; errEl.classList.remove('is-hidden'); return; }
  errEl.classList.add('is-hidden');
  localStorage.setItem('gezinsagenda-hh-code', code);
  startApp(code);
});
document.getElementById('btn-change-code').addEventListener('click', ()=>{
  confirmDialog('Dit logt dit apparaat uit bij het huidige gezin. Je kunt daarna dezelfde of een andere gezinscode opnieuw invoeren. Doorgaan?', ()=>{
    localStorage.removeItem('gezinsagenda-hh-code');
    closeModal();
    location.reload();
  });
});

/* ---- Meldingen (best-effort, alleen als de app onlangs open is geweest) ---- */
const notifiedKey = 'gezinsagenda-genotificeerd';
function getNotifiedSet(){
  try{ return new Set(JSON.parse(localStorage.getItem(notifiedKey) || '[]')); }catch(e){ return new Set(); }
}
function saveNotifiedSet(s){
  const arr = Array.from(s).slice(-500); // niet onbeperkt laten groeien
  localStorage.setItem(notifiedKey, JSON.stringify(arr));
}
function updateNotifStatusLabel(){
  const el = document.getElementById('notif-status');
  if(!el || !('Notification' in window)) return;
  const map = { granted:'✅ Meldingen staan aan op dit apparaat.', denied:'🚫 Meldingen zijn geblokkeerd (aanpassen kan via je browser/systeeminstellingen).', default:'Nog niet ingeschakeld.' };
  el.textContent = map[Notification.permission] || '';
}
document.getElementById('btn-enable-notifications').addEventListener('click', async ()=>{
  if(!('Notification' in window)){ showToast('Meldingen worden niet ondersteund in deze browser.'); return; }
  const perm = await Notification.requestPermission();
  updateNotifStatusLabel();
  if(perm === 'granted') showToast('Meldingen ingeschakeld op dit apparaat');
});
updateNotifStatusLabel();

function checkUpcomingNotifications(){
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  const now = new Date();
  const soon = new Date(now.getTime() + 15*60000);
  const occs = occurrencesInRange(now, soon, null, true);
  if(!occs.length) return;
  const notified = getNotifiedSet();
  let changed = false;
  occs.forEach(o=>{
    const key = o.event.id + '|' + o.occStart.toISOString();
    if(notified.has(key)) return;
    notified.add(key); changed = true;
    const body = fmtTimeHM(o.occStart) + (o.event.location ? ' • 📍 ' + o.event.location : '');
    if(navigator.serviceWorker && navigator.serviceWorker.ready){
      navigator.serviceWorker.ready.then(reg=> reg.showNotification(o.event.icon+' '+o.event.title, {body, tag:key}));
    } else {
      try{ new Notification(o.event.icon+' '+o.event.title, {body}); }catch(e){}
    }
  });
  if(changed) saveNotifiedSet(notified);
}

/* ---- Service worker: laat de app (en het laatst-gesyncte scherm) ook werken zonder internet ----
   Browsers checken sw.js standaard maar zo'n 1x per 24 uur op wijzigingen. Om te zorgen dat
   updates (ook bij gezinsleden) vanzelf en snel doorkomen — zonder dat iemand handmatig
   site-data moet wissen — forceren we hieronder zelf een verse check bij elke opening, en
   herladen we de pagina automatisch zodra een nieuwe versie actief is geworden. */
if('serviceWorker' in navigator){
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('./sw.js').then(reg=>{
    reg.update().catch(()=>{});
    document.addEventListener('visibilitychange', ()=>{
      if(document.visibilityState === 'visible') reg.update().catch(()=>{});
    });
  }).catch(err=> console.error('Service worker registratie mislukt', err));

  let swRefreshed = false;
  navigator.serviceWorker.addEventListener('controllerchange', ()=>{
    if(!hadController || swRefreshed) return;
    swRefreshed = true;
    window.location.reload();
  });
}

/* ---- Extra vangnet voor "app op beginscherm" (vooral iOS) ----
   Zo'n geïnstalleerde app is bij het openen vaak een hervatte, bevroren sessie in plaats
   van een verse paginalading. Daardoor wordt de normale service worker-updatecheck hierboven
   soms niet (betrouwbaar) uitgevoerd, en blijft de oude versie draaien totdat de site ooit nog
   eens gewoon in de browser wordt geopend. Als vangnet pollen we daarom zelf een piepklein
   versiebestand (met cache:'no-store', dus altijd vers) en forceren we zelf een herlaad zodra
   die afwijkt van de versie waarmee de app is gestart. Let op: version.txt moet bij elke
   release worden bijgewerkt, net als de CACHE_NAME hierboven in sw.js. */
let knownAppVersion = null;
async function checkForAppUpdate(){
  try{
    const res = await fetch('./version.txt', { cache: 'no-store' });
    if(!res.ok) return;
    const v = (await res.text()).trim();
    if(!v) return;
    if(knownAppVersion === null){ knownAppVersion = v; return; }
    if(v !== knownAppVersion) window.location.reload();
  }catch(e){ /* offline of netwerkfout: gewoon negeren, geen actie ondernemen */ }
}
checkForAppUpdate();
document.addEventListener('visibilitychange', ()=>{
  if(document.visibilityState === 'visible') checkForAppUpdate();
});
window.addEventListener('pageshow', (e)=>{ if(e.persisted) checkForAppUpdate(); });
window.addEventListener('focus', checkForAppUpdate);

renderSettings();
let resizeRefitTimer = null;
function scheduleAgendaRefit(){
  clearTimeout(resizeRefitTimer);
  resizeRefitTimer = setTimeout(()=>{
    if(document.getElementById('panel-agenda').classList.contains('active')) renderAgenda();
  }, 150);
}
if(window.visualViewport) window.visualViewport.addEventListener('resize', scheduleAgendaRefit);
window.addEventListener('resize', scheduleAgendaRefit);
window.addEventListener('orientationchange', scheduleAgendaRefit);

setInterval(()=>{
  if(document.getElementById('panel-agenda').classList.contains('active') && agendaView!=='month') renderAgenda();
  if(document.getElementById('panel-kind').classList.contains('active') && kidView==='day') renderKid();
  checkUpcomingNotifications();
}, 60000);

})();
