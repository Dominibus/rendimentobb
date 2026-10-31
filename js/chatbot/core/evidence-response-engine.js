// Read-only conversational evidence. No inferred account facts or historical source versions.
(function(){
 'use strict';
 const norm=v=>String(v??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const number=v=>['number','string'].includes(typeof v)&&String(v).trim()!==''&&Number.isFinite(Number(v))?Number(v):null;
 const reply=(type,it,en,metadata={},actions=[])=>({type,confidence:1,textIT:it,textEN:en,actions,metadata});
 const commercial=q=>/\b(?:investor|pro|free|abbonament\w*|subscriptions?|plans?|trial)\b|pian[oi].*(?:prezz|cost)|(?:prezz|cost).*(?:pian[oi])/.test(q);
 const scope=()=>{
  const filter=window.bookingsPropertyFilter;
  return typeof filter==='string'&&filter&&filter!=='all'?filter:
   window.bookingsAllPropertiesView===false&&typeof window.currentPropertyId==='string'?window.currentPropertyId:null;
 };
 window.rbReadPMSEvidence=function(){
  const data=window.rbPMSData,uid=window.currentUser?.uid,access=window.getUserAccess?.()||{};
  const demo=window.isDemoDashboard===true&&data?.isDemo===true;
  if(!demo&&access.isLoading)return {state:'loading'};
  if(!demo&&(!uid||uid==='demo-user'||!(access.isInvestor||access.isPro||access.isAdmin)))return {state:'access'};
  const load=window.rbPMSSnapshotLoad;
  if(!demo&&load?.ownerUid===uid&&['loading','error'].includes(load.status))return {state:load.status};
  if(!data||(!demo&&(data.isDemo===true||data.ownerUid!==uid||data.portalSnapshotReady!==true))||!Array.isArray(data.propertyList))return {state:'absent'};
  const rows=demo?data.bookingList:data.portalBookingList;
  if(!Array.isArray(rows))return {state:'absent'};
  const properties=data.propertyList.filter(p=>p&&typeof p.id==='string'&&p.id&&(!p.uid||p.uid===uid||demo));
  const ids=new Set(properties.map(p=>p.id));
  // A complete loaded directory is the authority for property scope, never a remembered name.
  const bookings=rows.filter(b=>b&&ids.has(b.propertyId)&&(!b.uid||b.uid===uid||demo));
  return {state:bookings.length?'populated':'empty',ownerUid:demo?null:uid,demo,properties,bookings,scopePropertyId:scope()};
 };
 window.rbBuildPMSAvailabilityResponse=function(message,intent=''){
  const e=window.rbReadPMSEvidence();
  const labels={
   access:['La lettura dei dati PMS richiede un account con Investor, Pro o prova attiva. Accedi e verifica il piano; non posso dedurre quante prenotazioni hai.','Reading account PMS data requires Investor, Pro or an active trial. Sign in and check your plan; I cannot infer your booking count.'],
   absent:['Lo snapshot PMS non è disponibile o non è completo in questa schermata. Apri Dashboard → Gestione e carica i dati. Dati non disponibili non significano zero prenotazioni.','The PMS snapshot is unavailable or incomplete on this screen. Open Dashboard → Management and load the records. Unavailable data do not mean zero bookings.'],
   loading:['Le prenotazioni PMS sono in caricamento. Attendi e ripeti la domanda: non posso ancora confermare conteggi o attività.','PMS bookings are loading. Wait and ask again: counts and tasks cannot yet be confirmed.'],
   error:['Il caricamento PMS non è riuscito. Riprova dalla Dashboard; se il problema persiste verifica connessione e accesso. Non considero vuoto lo snapshot e non confermo che le attività siano completate.','PMS loading failed. Retry from the Dashboard; if it persists check your connection and access. I do not treat the snapshot as empty or confirm that tasks are complete.']
  };
  if(labels[e.state])return reply('pms_context',...labels[e.state],{source:'pms_availability',state:e.state});
  // Legacy aggregate replies may use only explicitly available metrics, including intentional zero.
  const required={pms_analysis:['bookings','revenue','occupancy','adr'],pms_overview:['properties','bookings','revenue','occupancy','adr','guests','arrivals','checkins','checkouts'],pms_bookings:['bookings'],pms_arrivals:['arrivals'],pms_checkins:['checkins'],pms_checkouts:['checkouts'],pms_revenue:['revenue'],pms_occupancy:['occupancy'],pms_adr:['adr'],pms_guests:['guests']};
  if((required[intent]||[]).some(k=>number(window.rbPMSData[k])===null))return reply('pms_context','L’indicatore richiesto non è disponibile nello snapshot caricato. Verifica periodo e completezza nella Dashboard; non lo sostituisco con zero.','The requested metric is unavailable in the loaded snapshot. Check the period and completeness in the Dashboard; I will not replace it with zero.',{source:'pms_availability',state:'missing_metric'});
  return null;
 };
 // The professional scan must validate references before any property filter.
 // An orphan row cannot disappear and turn an incomplete snapshot into a complete one.
 function professionalIntegrity(e){
  const data=window.rbPMSData,properties=data?.propertyList;
  const rows=e.demo?data?.bookingList:data?.portalBookingList;
  if(!Array.isArray(properties)||!Array.isArray(rows))return false;
  const id=v=>typeof v==='string'&&v.trim()!=='';
  const owned=row=>e.demo||!row.uid||row.uid===e.ownerUid;
  const ids=new Set(),bookingIds=new Set();
  for(const p of properties){
   if(!p||!id(p.id)||ids.has(p.id)||!owned(p))return false;
   ids.add(p.id);
  }
  for(const b of rows){
   if(!b||!id(b.id)||bookingIds.has(b.id)||!ids.has(b.propertyId)||!owned(b))return false;
   bookingIds.add(b.id);
  }
  return true;
 }
 function professionalSelection(q,e,overlaps){
  let rest=q;
  const named=[];
  // Consume exact names, longest first; a known prefix must not swallow an unknown suffix.
  const names=[...new Set(e.properties.map(p=>norm(p.name).trim()).filter(Boolean))].sort((a,b)=>b.length-a.length);
  for(const name of names){
   const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
   const pattern=new RegExp('(^|[^\\p{L}\\p{N}])'+escaped+'(?=$|[^\\p{L}\\p{N}])','gu');
   if(pattern.test(rest)){
    named.push(...e.properties.filter(p=>norm(p.name).trim()===name));
    rest=rest.replace(pattern,' ');
   }
  }
  const period=/\b(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre|january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec|lunedi|martedi|mercoledi|giovedi|venerdi|sabato|domenica|monday|tuesday|wednesday|thursday|friday|saturday|sunday|domani|tomorrow|ieri|yesterday|mese|mesi|months?|settimana|settimane|weeks?|anno|anni|years?|trimestre|quarter|q[1-4]|inverno|estate|autunno|primavera|winter|summer|autumn|fall|spring|prossim\w*|scors\w*|next|last|\d{4})\b|\d{1,4}[-./]\d{1,2}[-./]\d{1,4}/;
  if(period.test(rest)||overlaps&&/\b(?:oggi|today|adesso|now)\b/.test(rest))return {state:'period_required'};
  // This bounded read-only query accepts only understood wording. Unknown names
  // and residual qualifiers require clarification rather than widening to all properties.
  rest=rest.replace(/\b(?:quali|quale|ci|sono|ciascuna|ciascuno|prenotazion[ei]|sovrappost[aeio]|sovrapposizion[ei]|conflitt[oi]|struttur[ae]|immobil[ei]|hanno|ha|arriv[oi]|oggi|per|di|in|a|ad|al|alla|alle|presso|le|la|il|gli|i|l|dell|delle|della|degli|dei|del|nell|nelle|nella|nel|sul|sulla|sulle|su|e|ed|o|tutt[aeio]|intero|elenco|elenca|elencami|elencarmi|caricat[aeio]|selezionat[aeio]|pms|dashboard|puoi|mostra|mostrami|mostrarmi|mostrare|verifica|verificare|controlla|controllare|which|what|properties|property|have|has|arrivals?|today|are|there|any|overlaps?|overlapping|conflicts?|bookings?|reservations?|list|show|me|please|the|all|whole|loaded|selected|for|at|in|on|of|and|or|can|you|check)\b/g,'').replace(/[\s\p{P}\p{S}]/gu,'');
  if(rest||named.some(p=>e.scopePropertyId&&p.id!==e.scopePropertyId)||
   names.some(name=>named.filter(p=>norm(p.name).trim()===name).length>1))return {state:'unknown_property'};
  if(e.scopePropertyId&&/\b(?:tutte|tutti|all|whole)\b/.test(q))return {state:'unknown_property'};
  const ids=named.length?named.map(p=>p.id):e.scopePropertyId?[e.scopePropertyId]:e.properties.map(p=>p.id);
  return ids.some(id=>!e.properties.some(p=>p.id===id))?{state:'unknown_property'}:{ids};
 }
 window.rbValidateEvidenceBookingAction=function(action){
  const e=window.rbReadPMSEvidence();
  return ['empty','populated'].includes(e.state)&&(!action.professionalQuery||professionalIntegrity(e))&&e.ownerUid===action.contextOwnerUid&&e.demo===action.contextDemo&&e.scopePropertyId===action.contextScopePropertyId&&
   e.bookings.filter(b=>b.id===action.bookingId&&b.propertyId===action.propertyId).length===1;
 };
 window.rbBuildProfessionalPMSResponse=async function(message){
  const q=norm(message);
  // Keep document, commercial workspace and explicit plan questions in their own routes.
  if(commercial(q)||/\bpdf\b|brochure|documento caricato|uploaded document|locali|studi|commercial|uffici|offices|poliambulator|simulazion|simulation|simulator/.test(q))return null;
  const costs=/costi|spese|costs?|expenses?/.test(q)&&/prevision|previst|preventiv|forecast|budget/.test(q)&&/superior|oltre|rispetto|scostament|above|over|versus|against|exceed|higher/.test(q);
  const statement=/rendicont|owner statement/.test(q)&&/manc|missing|complet|complete/.test(q);
  const arrivals=/arriv|\barrivals?\b/.test(q)&&/oggi|today/.test(q)&&/quali|elenc|which|list/.test(q);
  const overlaps=/sovrappost|sovrapposizion|conflitt|overlap|conflict/.test(q)&&(/prenotazion|bookings?|reservations?/.test(q)||/dashboard/.test(window.location?.pathname||''));
  if(!costs&&!statement&&!arrivals&&!overlaps)return null;
  if(costs||statement)return reply('pms_accounting_limits',
   costs?'Non posso identificare strutture con costi effettivi superiori alle previsioni dalle sole prenotazioni. Il PMS B&B non dispone di un registro completo di spese e incassi riconciliati: ricavi prenotati e costi ipotizzati nel simulatore non dimostrano costi sostenuti. Servono immobile, periodo, previsione collegata, spese documentate, commissioni e imposte con criteri omogenei. Non ho calcolato scostamenti né modificato dati.':'Per completare un rendiconto proprietario B&B servono immobile e periodo, prenotazioni con date/stati/importi validi, incassi riconciliati, costi documentati, commissioni, imposte applicabili e accordi con il proprietario. Il report attuale riepiloga ricavi prenotati; non è un rendiconto contabile completo. Questa è una checklist generale: non ho verificato quali documenti manchino nel tuo caso. Indica struttura e periodo per esaminare i dati disponibili, mantenendo esterni gli incassi e i costi non registrati.',
   costs?'I cannot identify properties with actual costs above forecast from bookings alone. The B&B PMS has no complete ledger of reconciled expenses and receipts: booked revenue and simulator cost assumptions do not establish incurred expenses. A property, period, linked forecast, documented expenses, commissions and taxes on a consistent basis are required. I have not calculated variances or changed records.':'Completing a B&B owner statement requires a property and period, bookings with valid dates/statuses/amounts, reconciled receipts, documented costs, commissions, applicable taxes and owner agreements. The current report summarizes booked revenue; it is not a complete accounting statement. This is a general checklist: I have not verified which documents are missing in your case. Specify a property and period to review available data, keeping unrecorded receipts and costs external.',
   {source:'current_product_scope',answerMode:costs?'cost_comparison_unavailable':'statement_requirements',personalCompletenessVerified:false});
  let e=window.rbReadPMSEvidence();
  const unavailable=window.rbBuildPMSAvailabilityResponse(message);
  if(unavailable)return unavailable;
  const identity={uid:e.ownerUid,demo:e.demo,scope:e.scopePropertyId};
  // On the account dashboard, re-read the server snapshot. A failed refresh cannot reuse old facts.
  if(!e.demo&&typeof window.rbRefreshPortalSnapshot==='function'){
   let refreshed;
   try{refreshed=await window.rbRefreshPortalSnapshot();}catch{/* Fail closed below. */}
   e=window.rbReadPMSEvidence();
   if(!refreshed||e.ownerUid!==identity.uid||e.demo!==identity.demo||e.scopePropertyId!==identity.scope||!['empty','populated'].includes(e.state)){
    return reply('pms_context','Non posso confermare il risultato: il caricamento è fallito o account/immobile sono cambiati. Ricarica il PMS e ripeti la domanda.','I cannot confirm the result: loading failed or the account/property changed. Reload the PMS and ask again.',{source:'pms_availability',state:'refresh_unavailable'});
   }
  }
  if(!professionalIntegrity(e))return reply('pms_context','Il controllo è incompleto: l’elenco caricato contiene riferimenti a strutture o ID prenotazione mancanti, duplicati o non verificabili. Verifica gli identificativi e i collegamenti nella Dashboard; restringere il filtro non risolve questa anomalia. Non propongo scorciatoie da questi dati.','This check is incomplete: the loaded directory contains missing, duplicate or unverifiable property references or booking IDs. Verify each unique booking ID and property link in the Dashboard; narrowing the filter does not resolve this anomaly. I will not offer shortcuts from these data.',{state:'data_quality',complete:false});
  const selection=professionalSelection(q,e,overlaps),ids=selection.ids;
  if(selection.state==='period_required')return reply('pms_context','Per questa verifica usa arrivi di oggi oppure sovrapposizioni dell’intero elenco caricato. Per un altro periodo apri il calendario e imposta le date: non applico un periodo diverso da quello richiesto.','This check supports today’s arrivals or overlaps across the loaded list. For another period, open the calendar and set dates: I will not silently substitute another period.',{state:'period_required',complete:false});
  if(selection.state)return reply('pms_context','Non posso identificare con certezza tutte le strutture e le condizioni richieste nell’ambito selezionato. Seleziona una struttura nella Dashboard e ripeti la domanda; per l’intero elenco seleziona prima tutte le strutture.','I cannot identify every requested property and qualifier with certainty in the selected scope. Select a property in the Dashboard and ask again; for the whole list, first select all properties.',{state:'unknown_property',complete:false});
  const tools=window.rbPMSProfessionalTools;
  if(!tools?.inspect||!tools?.today)return reply('pms_context','Apri la Dashboard per verificare arrivi e sovrapposizioni con il calendario PMS. I controlli non sono disponibili in questa schermata.','Open the Dashboard to check arrivals and overlaps using the PMS calendar. These checks are unavailable on this screen.',{state:'tools_unavailable'});
  const bookings=e.bookings.filter(b=>ids.includes(b.propertyId));
  const result=tools.inspect(bookings,tools.today());
  if(!result||result.state!=='ready')return reply('pms_context','Non posso completare il controllo di questo elenco. Restringi a una struttura e verifica il calendario; non considero assenti i conflitti non controllati.','I cannot complete the check for this list. Narrow to one property and review the calendar; unexamined conflicts are not considered absent.',{state:'scan_unavailable'});
  const selected=overlaps?result.conflicts:result.arrivals;
  const name=b=>e.properties.find(p=>p.id===b.propertyId)?.name||b.propertyId;
  const label=b=>`${name(b)} · ${b.checkin} → ${b.checkout} · ${b.id||'—'} · ${b.status||'arrival'}`;
  const preview=selected.slice(0,5);
  const actions=preview.filter(b=>typeof b.id==='string'&&b.id&&e.bookings.filter(row=>row.id===b.id).length===1)
   .map(b=>({type:'open_booking',professionalQuery:true,bookingId:b.id,propertyId:b.propertyId,contextOwnerUid:e.ownerUid,contextDemo:e.demo,contextScopePropertyId:e.scopePropertyId,labelIT:label(b),labelEN:label(b)}));
  const text=en=>[
   e.demo?(en?'DEMO data':'Dati DEMO'):(en?'Loaded account snapshot; no OTA synchronization is implied.':'Snapshot account caricato; non implica sincronizzazione OTA.'),
   (en?'Scope: ':'Ambito: ')+ids.map(id=>e.properties.find(p=>p.id===id)?.name||id).join(', '),
   overlaps?(en?`${selected.length} bookings involved in at least one overlap in the loaded list (not a count of pairs). Checkout is excluded; pending and cancelled bookings are excluded.`:`${selected.length} prenotazioni coinvolte in almeno una sovrapposizione nell’elenco caricato (non numero di coppie). Check-out escluso; prenotazioni in attesa e cancellate escluse.`):
    (en?`${result.today}: ${selected.length} bookings with arrival today. Saved statuses are shown, including arrivals already checked in.`:`${result.today}: ${selected.length} prenotazioni con arrivo oggi. Sono mostrati gli stati salvati, inclusi gli arrivi già registrati.`),
   ...preview.map(label),
   selected.length>5?(en?`Showing 5 of ${selected.length}: narrow by property for the others.`:`Mostrate 5 su ${selected.length}: restringi per struttura per le altre.`):'',
   result.invalidCount?(en?`${result.invalidCount} active bookings have invalid dates, statuses or non-unique/missing IDs: this check is incomplete.`:`${result.invalidCount} prenotazioni attive hanno date, stati o ID non validi/univoci: questo controllo è incompleto.`):'',
   en?'Records without a unique booking ID cannot be opened from this answer. No bookings have been opened or changed.':'I record senza ID prenotazione univoco non sono apribili da questa risposta. Non ho aperto o modificato prenotazioni.'
  ].filter(Boolean).join('\n\n');
  return reply('pms_professional',text(false),text(true),{source:e.demo?'demo_pms':'account_pms',answerMode:overlaps?'overlaps':'arrivals_today',propertyIds:ids,today:result.today,matchedBookings:selected.length,invalidBookings:result.invalidCount,complete:result.invalidCount===0},actions);
 };
 window.rbBuildBookingNavigationResponse=function(message){
  const q=norm(message);
  if(!/prenotazion|\bbookings?\b|reservations?/.test(q)||!/portami|apri|vai a|take me|open|navigate|go to/.test(q)||/pdf|esport|export|import|crea|create|cancell|delete/.test(q))return null;
  const unavailable=window.rbBuildPMSAvailabilityResponse(message);if(unavailable)return unavailable;
  const e=window.rbReadPMSEvidence();
  const properties=e.properties.filter(p=>norm(p.name).length>=3&&q.includes(norm(p.name)));
  const propertyIds=properties.length?properties.map(p=>p.id):e.scopePropertyId?[e.scopePropertyId]:null;
  if(propertyIds?.some(id=>!e.properties.some(p=>p.id===id)))return reply('booking_selection','La proprietà selezionata non è disponibile nello snapshot. Seleziona di nuovo un immobile autorizzato nella Dashboard.','The selected property is unavailable in the snapshot. Select an authorized property again in the Dashboard.',{state:'unknown_property'});
  if(properties.length===0&&/\b(?:per|di|for|in)\s+(?:l['’])?(?:immobile|property)\s+/.test(q))return reply('booking_selection','Non riconosco la proprietà richiesta nel contesto autorizzato. Selezionala nella Dashboard.','I cannot identify the requested property in the authorized context. Select it in the Dashboard.',{state:'unknown_property'});
  let bookings=e.bookings.filter(b=>typeof b.id==='string'&&b.id&&(!propertyIds||propertyIds.includes(b.propertyId)));
  // Exact saved references only; no ID is manufactured from dates, names or array positions.
  const named=bookings.filter(b=>[b.id,b.guestName,b.importReference?.reference].some(v=>typeof v==='string'&&v.trim().length>=3&&q.includes(norm(v.trim()))));
  if(named.length)bookings=named;
  const label=b=>`${e.properties.find(p=>p.id===b.propertyId)?.name||b.propertyId} · ${b.checkin||'—'} → ${b.checkout||'—'} · ${b.id}`;
  const actions=bookings.slice(0,5).map(b=>({type:'open_booking',bookingId:b.id,propertyId:b.propertyId,contextOwnerUid:e.ownerUid,contextDemo:e.demo,contextScopePropertyId:e.scopePropertyId,labelIT:label(b),labelEN:label(b)}));
  const tailIT=(e.demo?'Dati DEMO. ':'Snapshot account verificato. ')+'Aprire una scorciatoia non modifica il soggiorno. Non ho aperto o aggiornato prenotazioni.';
  const tailEN=(e.demo?'DEMO data. ':'Verified account snapshot. ')+'Opening a shortcut does not change a stay. I have not opened or updated any booking.';
  return reply('booking_selection',bookings.length?`${bookings.length===1?'Puoi aprire questa prenotazione':'Quale prenotazione vuoi aprire? Seleziona una delle prenotazioni caricate'}${bookings.length>5?' (prime 5; restringi per immobile o riferimento)':''}.\n\n${tailIT}`:`Nessuna prenotazione identificabile nello snapshot verificato per questo ambito. Seleziona un immobile o verifica i riferimenti nella Dashboard.\n\n${tailIT}`,
   bookings.length?`${bookings.length===1?'You can open this booking':'Which booking do you want to open? Select one of the loaded bookings'}${bookings.length>5?' (first 5; narrow by property or reference)':''}.\n\n${tailEN}`:`No identifiable booking in the verified snapshot for this scope. Select a property or check references in the Dashboard.\n\n${tailEN}`,{source:e.demo?'demo_pms':'account_pms',state:e.state,propertyIds:propertyIds||e.properties.map(p=>p.id)},actions);
 };
 window.rbBuildROINotApplicableResponse=function(message){
  const q=norm(message);
  if(!/\broi\b|return on (?:equity|investment)/.test(q)||!/(?:n\s*\/\s*a|n\/d|not applicable|non applicabil|non disponibile|unavailable)/.test(q))return null;
  return reply('roi_applicability',
   'ROI N/A significa che il rapporto non è applicabile o non può essere determinato con i dati disponibili. Per il ROI sul capitale proprio: cashflow annuo ÷ capitale proprio × 100. Con capitale proprio zero il denominatore è zero: N/A, non 0% e non infinito. Con capitale o cashflow mancanti/non validi, invece, i dati sono insufficienti; non vanno riempiti con zero. Il rendimento sul valore dell’immobile ha un denominatore diverso.\n\nÈ una spiegazione generale accessibile anche con Free: non dimostra quale sia la causa nel tuo caso e non sblocca risultati riservati. Ti riferisci al ROI equity, al rendimento sul valore, a una simulazione salvata o a un PDF? Controlla denominatore e campi mancanti nel contesto scelto.',
   'ROI N/A means the ratio is not applicable or cannot be determined from available data. Equity ROI is annual cashflow ÷ invested equity × 100. With zero equity the denominator is zero: N/A, not 0% or infinity. Missing or invalid equity or cashflow instead means insufficient data; missing values must not be filled with zero. Return on property value has a different denominator.\n\nThis is a general explanation also available with Free: it does not establish the cause in your case or unlock restricted results. Do you mean equity ROI, return on property value, a saved simulation or a PDF? Check the denominator and missing fields in the chosen context.',{source:'calculation_method',personalCauseVerified:false});
 };
 const sourceIds=q=>/\bomi\b/.test(q)?['omi-values']:/turism|tourism|presenz|person.nights/.test(q)?['istat-tourism']:/comuni|municipalit/.test(q)?['istat-municipalities']:/inside airbnb|prezzi.*annunci|listing prices/.test(q)?['inside-airbnb']:[];
 window.rbBuildSourceClarificationResponse=function(message){
  const q=norm(message),omi=/\bomi\b/.test(q);
  if(commercial(q))return null;
  const asks=/da dove (?:viene|vengono)|quale font[ei]|quali fonti|fonte.*usat|which sources?|what sources?|where.*(?:number|figure).*come from|aggiornat.*dat|dat.*aggiornat|up.to.date|data.*(?:fresh|updated)|periodo.*dat|data.*period|ultimo controllo|last check|acquisi|acquired/.test(q);
  if(!omi&&!asks&&!/^(?:turismo istat|istat turismo|istat tourism|inside airbnb|comuni istat|istat municipalities)[?.!]*$/.test(q))return null;
  const doc=window.rbDocumentManager?.getLast?.();
  const explicitDoc=/\bpdf\b|document|brochure|\bfile\b/.test(q);
  const explicitPublic=omi||/istat|inside airbnb|turism|tourism|comuni|municipalit/.test(q);
  const pdf=explicitDoc||(!explicitPublic&&doc?.id&&window.rbPDFConversationDocumentId===doc.id);
  if(pdf)return reply('source_clarification',
   `Ti riferisci a quale numero o tabella del PDF${doc?.fileName?' «'+doc.fileName+'»':''}? Indica pagina e indicatore. Il documento caricato è la fonte da esaminare, non una prova di autenticità o attualità. Periodo di osservazione, acquisizione e ultimo controllo sono informazioni diverse: se non sono documentate restano non disponibili. Non attribuisco il registro corrente a questo report o a risultati storici privi di provenienza.`,
   `Which PDF number or table${doc?.fileName?' in “'+doc.fileName+'”':''} do you mean? Give the page and metric. The uploaded document is the source to examine, not proof of authenticity or freshness. Observation period, acquisition and last check are different facts: if undocumented they remain unavailable. I do not attribute the current registry to this report or historical results without provenance.`,{source:'document_scope',documentId:doc?.id||null});
  if(!explicitPublic&&/storico|salvat|saved|histor|report/.test(q))return reply('source_clarification',
   'Quale analisi salvata e quale indicatore intendi? Seleziona il report e verifica ID e data. Le versioni storiche di fonti e modello possono non essere disponibili: il registro attuale non dimostra quali versioni abbiano prodotto quel risultato. Nessun ricalcolo o aggiornamento dello storico è stato eseguito.',
   'Which saved analysis and metric do you mean? Select the report and check its ID and date. Historical source and model versions may be unavailable: the current registry does not establish which versions produced that result. No historical result has been recalculated or updated.',{source:'historical_scope',historicalProvenanceVerified:false});
  const ids=sourceIds(q),registry=window.rbSourceRegistry;
  const datasets=ids.map(id=>registry?.datasets?.find(d=>d.id===id)).filter(Boolean);
  const omiIT='OMI (Agenzia delle Entrate) pubblica intervalli per territorio/comune, zona, tipologia e stato dell’immobile, riferiti a un semestre. Vendita in €/m² e locazione in €/m²/mese hanno unità diverse; verifica anche la superficie di riferimento. Non determina il prezzo puntuale del tuo immobile, non è una perizia, non misura ADR turistico e non garantisce rendimenti.';
  const omiEN='OMI (Italian Revenue Agency) publishes ranges by territory/municipality, area, property type and condition, for a half-year period. Sale prices in €/m² and rents in €/m²/month use different units; also check the reference surface. OMI does not determine your individual property price, replace an appraisal, measure tourist ADR or guarantee returns.';
  const details=en=>datasets.map(d=>{
   const missing=en?'unavailable':'non disponibile';
   return [
    `${en?'Current distributed dataset':'Dataset attualmente distribuito'}: ${d.id} · ${d.publisher||missing}`,
    `${en?'Observation period':'Periodo di osservazione'}: ${d.observationPeriod||missing}`,
    `${en?'Declared acquisition':'Acquisizione dichiarata'}: ${d.acquiredAt||missing}`,
    `${en?'Inventory date (not a live check)':'Data inventario (non controllo live)'}: ${registry.inventoriedAt||missing}`,
    `${en?'Last observed update':'Ultimo aggiornamento osservato'}: ${d.lastUpdate?.at||missing}`,
    `${en?'Last remote check':'Ultimo controllo remoto'}: ${missing}`,
    `${en?'Classification':'Classificazione'}: ${{official:en?'official':'ufficiale',private_provider:en?'private provider':'provider privato',internal_assumption:en?'internal assumption':'ipotesi interna',calculated:en?'calculated':'calcolato',user_supplied:en?'user supplied':'input utente',synthetic:en?'synthetic demo':'demo sintetica',editorial:en?'editorial':'editoriale'}[d.classification]||missing}`,
    `${en?'Coverage':'Copertura'}: ${d.coverage||missing}`,
    `${en?'Reference':'Riferimento'}: ${d.sourceURL||missing}`,
    en?'These metadata describe the current distribution, not source versions used by saved results. No live availability or newer release has been verified.':'Questi metadati descrivono la distribuzione corrente, non le versioni usate nei risultati salvati. Disponibilità live e nuove pubblicazioni non sono state verificate.'
   ].join('\n');
  }).join('\n\n');
  if(ids.length)return reply(omi?'omi_evidence':'source_evidence',
   [omi?omiIT:'La fonte selezionata descrive dati di contesto, non certifica rendimenti del singolo immobile.',datasets.length?details(false):'Metadati della distribuzione non disponibili in questa schermata: non posso indicare periodo, acquisizione o ultimo controllo.',omi?'Per confrontare un intervallo indica comune, zona OMI, tipologia e semestre; conferma la zona sulla cartografia ufficiale.':'Specifica territorio, indicatore e periodo; non deduco prezzi o ROI dalla sola presenza di dati turistici.'].join('\n\n'),
   [omi?omiEN:'The selected source provides context, not certified returns for an individual property.',datasets.length?details(true):'Distribution metadata are unavailable on this screen: I cannot state the period, acquisition or last check.',omi?'To compare a range, specify municipality, OMI area, property type and half-year; confirm the area on official mapping.':'Specify territory, metric and period; tourism data alone do not establish prices or ROI.'].join('\n\n'),{source:'current_distribution_metadata',datasetIds:datasets.map(d=>d.id),historicalProvenanceVerified:false});
  const path=window.location?.pathname||'';
  const context=/dashboard-report/.test(path)?'report':/dashboard/.test(path)?'pms':/tool/.test(path)?'simulation':/market/.test(path)?'market':'page';
  const options={
   simulation:['Quale numero del simulatore intendi: ricavi, ROI, cashflow oppure dati OMI/turismo di contesto? I risultati sono calcoli da input e ipotesi, non rendimenti ufficiali.','Which simulator number do you mean: revenue, ROI, cashflow or OMI/tourism context? Results are calculations from inputs and assumptions, not official returns.'],
   pms:['Quale proprietà, periodo e indicatore della Dashboard intendi: ricavi prenotati, occupazione oppure una simulazione salvata? Le prenotazioni inserite/importate non provano incassi.','Which Dashboard property, period and metric do you mean: booked revenue, occupancy or a saved simulation? Entered/imported bookings do not prove receipts.'],
   report:['Quale indicatore e quale analisi del report intendi? Controlla ID e data: la provenienza storica non può essere ricostruita dal registro corrente.','Which report metric and analysis do you mean? Check the ID and date: historical provenance cannot be reconstructed from the current registry.'],
   market:['Quale fonte della pagina Mercato intendi: OMI, turismo ISTAT, prezzi degli annunci Inside Airbnb o ipotesi interne? Specifica anche città e indicatore.','Which Market-page source do you mean: OMI, ISTAT tourism, Inside Airbnb listing prices or internal assumptions? Also specify the city and metric.'],
   page:['Quale numero e quale schermata intendi: simulatore, Mercato, Dashboard o PDF? Indica l’etichetta del valore per identificare la fonte.','Which number and screen do you mean: simulator, Market, Dashboard or PDF? Give the value label to identify its source.']
  };
  return reply('source_clarification',options[context][0]+'\n\nPeriodo osservato, acquisizione e ultimo controllo non sono la stessa data. Scegli la fonte: userò solo i metadati disponibili, senza attribuirli a storici privi di provenienza.',options[context][1]+'\n\nObservation period, acquisition and last check are different dates. Choose the source: I will use only available metadata, without attributing them to historical results lacking provenance.',{source:'clarification_required',pageContext:context});
 };
})();
