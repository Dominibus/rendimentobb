// Explains the exact evaluation published by the candidate page; never reads account/PDF caches.
(function(){
 'use strict';
 const norm=v=>String(v??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 window.rbBuildCandidateResponse=function(message){
  const q=norm(message),page=/^\/immobili\/candidati\/?$/.test(window.location?.pathname||'');
  if(/\b(?:pdf|pms|booking|bookings|prenotazioni|investor|pro|trial|subscription)\b/.test(q))return null;
  const explicit=/candidat|screening|(?:confront|compar|valut|evaluat).*(?:immobili|properties)|(?:immobili|properties).*(?:confront|compar|valut|evaluat)/.test(q);
  if(!explicit&&!(page&&/perche|why|manc|missing|ipotesi|assumptions|prossim|next|criter|criteria|autopilot|rendimento|\broi\b|fonte|source|numero|number|cosa.*(?:fare|faccio)|what.*(?:do|now)|da dove|where.*start/.test(q)))return null;
  const reply=(it,en,metadata={})=>({type:'candidate_explanation',confidence:1,textIT:it,textEN:en,actions:[],metadata:{source:'candidate_page',...metadata}});
  const c=page?window.rbCandidateWorkspace?.getContext?.():null;
  if(!c||c.page!=='/immobili/candidati/'||c.ownerUid!==(window.currentUser?.uid||null))return reply('Il contesto candidati non è disponibile. Apri Immobili → Confronta i tuoi candidati e seleziona una scheda. Non uso dati di altri account, PDF o vecchie simulazioni.','Candidate context is unavailable. Open Properties → Compare your candidates and select a worksheet. I do not use other accounts, PDFs or older simulations.',{state:'unavailable'});
  const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const matches=c.rows.filter(r=>new RegExp('(?:^|[^a-z0-9_-])'+escape(norm(r.reference))+'(?=$|[^a-z0-9_-])').test(q));
  if(matches.length>1)return reply('Hai nominato più candidati. Seleziona «Spiega» sulla riga che vuoi approfondire: non combino ipotesi di schede diverse.','You named multiple candidates. Select “Explain” on the row to review: I will not combine assumptions from different worksheets.',{state:'selection'});
  const namedUnknown=/(?:candidato|candidate)\s+[a-z0-9]+[-_][a-z0-9_-]+/.test(q)&&!matches.length;
  const selected=namedUnknown?null:matches[0]||c.rows.find(r=>r.reference===c.active);
  if(!selected)return reply(`Scegli «Spiega» su un candidato della tabella. Sono disponibili ${c.rows.length} schede: prima di indicare motivi o ipotesi devo sapere quale intendi. Nessun immobile è stato acquisito o acquistato.`,`Choose “Explain” on a candidate in the table. ${c.rows.length} worksheets are available: I need to know which one you mean before describing reasons or assumptions. No property has been acquired or purchased.`,{state:'selection'});
  const assumptions=en=>selected.assumptions.filter(a=>a.value!==null).map(a=>(en?a.labelEN:a.labelIT)+': '+a.value+' · '+(a.origin==='common'?(en?'explicit common assumption':'ipotesi comune esplicita'):(en?'user input':'input utente'))).join('\n')||(en?'No economic assumptions supplied.':'Nessuna ipotesi economica indicata.');
  return reply(selected.explanationIT+'\n\n'+assumptions(false)+'\n\nProssimo passo: verifica i dati mancanti e il riferimento; «Completa in Analizza» apre il simulatore in nuova scheda con i soli campi compatibili. Qui non calcolo ROI o un nuovo score. I criteri non garantiscono un rendimento. Non ho aperto schede, salvato o modificato candidati.',selected.explanationEN+'\n\n'+assumptions(true)+'\n\nNext step: verify missing data and the reference; “Complete in Analyse” opens the simulator in a new tab with compatible fields only. I do not calculate ROI or a new score here. Criteria do not guarantee returns. I have not opened tabs, saved or changed candidates.',{state:'selected',reference:selected.reference,status:selected.status});
 };
})();
