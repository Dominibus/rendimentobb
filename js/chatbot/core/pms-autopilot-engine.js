(function(){
  'use strict';
  const normalize=text=>(window.rbNormalizeAIQuery?.(text)?.text ?? String(text || '')).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const wantsHorizon=text=>/(prossim[ia].*(7|sette|giorni|settimana)|next.*(7|seven|days|week)|arriv.*(domani|prepar|pront)|arrivals?.*(tomorrow|prepar|ready)|prepar.*domani|prepare.*tomorrow)/.test(normalize(text));
  window.rbIsPMSAutopilotQuestion=function(text){
    const query=normalize(text);
    if(/^(autopilot investimento:|investment autopilot:)/.test(query))return false;
    if(/\b(pdf|brochure|simulatore|simulation|roi|mutuo|mortgage|password|login|registrarmi|subscription)\b/.test(query))return false;
    if(wantsHorizon(query))return true;
    if(/(?:qualcosa|attivita|task|tasks|operazioni).*(?:fare|gestire|aperte|pending|today|oggi)|(?:rimast|resta|left).*(?:fare|gestire|do)|(?:documenti|documents).*(?:mancanti|missing)|(?:priorita|priorities).*(?:giornat|today|oggi)/.test(query))return true;
    return /checklist|riepilogo operativo|daily (plan|tasks|priorities)|what (should|do) i (do|manage)|cosa (devo |posso )?(fare|gestire)|da dove (parto|inizio)|tutto sotto controllo|what needs attention|priorita.*(oggi|prenot|pms)|autopilot.*(oggi|domani|priorita|pms)|\b(urgenti|urgenze|urgent)\b|documenti.*manc|missing.*documents|documents.*missing|pulizi.*(complet|gestire|fare)|cleaning.*(pending|complete)|cosa.*(manca|da gestire)/.test(query);
  };

  window.rbBuildPMSAutopilotResponse=async function(message){
    if(!window.rbIsPMSAutopilotQuestion(message))return null;
    const unavailable={type:'pms_autopilot_unavailable',confidence:0,
      textIT:'Non posso verificare le priorità PMS con i dati disponibili. Apri la Dashboard e riprova dopo il caricamento delle prenotazioni. Se il caricamento fallisce, verifica la connessione: non significa che tutte le attività siano completate.',
      textEN:'I cannot verify PMS priorities with the available data. Open the Dashboard and try again after bookings load. If loading fails, check your connection: it does not mean that all tasks are complete.',actions:[]};
    if(typeof window.rbRefreshPMSForAutopilot!=='function')return unavailable;
    let snapshot;
    try{snapshot=await window.rbRefreshPMSForAutopilot();}catch{return unavailable;}
    if(!snapshot?.plan)return unavailable;
    const plan=snapshot.plan,query=normalize(message);
    if(wantsHorizon(query))return buildHorizonResponse(snapshot,query);
    const filter=/\b(urgenti|urgenze|urgent)\b/.test(query)?'urgent':/documenti|documents/.test(query)?'documents':/pulizi|cleaning/.test(query)?'cleaning':null;
    const selected=plan.items.filter(item=>!filter || (filter==='urgent'?item.code==='issue' && item.priority===0:item.code===filter));
    const preview=selected.slice(0,3);
    const preparation=plan.preparation.filter(item=>!filter || item.code===filter).slice(0,2);
    const labels={documents:['Documenti ospiti da completare','Guest documents incomplete'],authority:['Comunicazione autorità da verificare','Authority report to review'],tax:['Tassa di soggiorno da riscuotere','Tourist tax to collect'],cleaning:['Pulizia da completare','Cleaning to complete'],issue:['Segnalazione ospite aperta','Open guest issue'],arrival:['Arrivo da registrare','Arrival to register'],departure:['Check-out da registrare','Check-out to register']};
    const reason=(item,en)=>{
      if(item.code==='documents')return en?`${item.missingDocuments} guest documents missing according to the saved count. Review those received.`:`${item.missingDocuments} documenti ospiti mancanti secondo il conteggio salvato. Verifica quelli ricevuti.`;
      const reasonIT={documents:'Verifica quanti documenti sono stati ricevuti.',authority:'La checklist riporta la comunicazione ancora da gestire.',tax:'La tassa risulta ancora da riscuotere.',cleaning:'Controlla data e incaricato: non risulta completata.',issue:'Leggi la segnalazione e aggiorna lo stato dopo averla gestita.',arrival:'La data di arrivo è raggiunta, ma lo stato è ancora In arrivo.',departure:'La data di partenza è raggiunta, ma lo stato è ancora Check-in.'};
      const reasonEN={documents:'Review how many documents have been received.',authority:'The checklist still shows the report as pending.',tax:'The tax is still marked as uncollected.',cleaning:'Review the date and assignee: cleaning is not marked complete.',issue:'Read the issue and update its status after handling it.',arrival:'The arrival date is reached, but the status is still Arriving.',departure:'The departure date is reached, but the status is still Check-in.'};
      return (en?reasonEN:reasonIT)[item.code]+(item.code==='cleaning' && item.cleaningAssignee?` ${en?'Assignee':'Incaricato'}: ${item.cleaningAssignee}.`:'');
    };
    const line=(item,index,en)=>`${index+1}. ${item.guestName || (en?'Guest name missing':'Nome ospite mancante')} · ${item.propertyName || (en?'Property name missing':'Struttura senza nome')}\n${labels[item.code]?.[en?1:0]} · ${item.priority===0?(en?'Urgent':'Urgente'):item.dueDate && item.dueDate<plan.today?(en?'Past due date':'Con data superata'):item.dueDate===plan.today?(en?'Today':'Oggi'):item.dueDate===plan.tomorrow?(en?'Tomorrow':'Domani'):(en?'Open / date to review':'Aperta / data da verificare')}${item.status==='in_progress'?(en?' · In progress':' · In carico'):''}\n${reason(item,en)}`;
    const text=en=>[
      snapshot.isDemo?(en?'PMS Autopilot · DEMO data':'PMS Autopilot · Dati DEMO'):(en?'PMS Autopilot · Daily priorities':'PMS Autopilot · Priorità quotidiane'),
      `${plan.today} · ${en?'All loaded properties':'Tutte le strutture caricate'}`,
      en?`${plan.counts.total} tasks and operations to manage · ${plan.counts.urgent} urgent · ${plan.counts.overdue} past due date · ${plan.counts.inProgress} in progress.`:`${plan.counts.total} attività e operazioni da gestire · ${plan.counts.urgent} urgenti · ${plan.counts.overdue} con data superata · ${plan.counts.inProgress} in carico.`,
      en?'These counts include operations and tasks, not bookings; the subsets are included in the total.':'I conteggi includono attività e operazioni, non prenotazioni; le categorie sono comprese nel totale.',
      preview.length?(en?'Start here:':'Parti da qui:'):(filter?(en?'No daily tasks match this request.':'Nessuna attività quotidiana corrisponde alla richiesta.'):(en?'No daily tasks found in the loaded data.':'Nessuna attività quotidiana rilevata nei dati caricati.')),
      ...preview.map((item,index)=>line(item,index,en)),
      selected.length>preview.length?(en?`${selected.length-preview.length} more matching tasks in the checklist.`:`Altre ${selected.length-preview.length} attività corrispondenti nella checklist.`):'',
      preparation.length?(en?'Prepare for tomorrow:':'Da preparare per domani:'):'',
      ...preparation.map((item,index)=>line(item,index,en)),
      en?`${plan.counts.upcoming} future tasks, separate from today's total.`:`${plan.counts.upcoming} attività future, separate dal totale quotidiano.`,
      plan.invalidDates?(en?`${plan.invalidDates} bookings have dates to review; time-based checks may be incomplete.`:`${plan.invalidDates} prenotazioni hanno date da verificare: i controlli sulle scadenze possono essere incompleti.`):'',
      snapshot.syncedAt?`${en?'Bookings last loaded':'Ultimo caricamento prenotazioni'}: ${snapshot.syncedAt}`:'',
      en?'Opening a shortcut does not change a booking. Task completion follows saved facts.':'Aprire una scorciatoia non modifica la prenotazione. Il completamento segue i dati salvati.'
    ].filter(Boolean).join('\n\n');
    const actions=[...preview,...preparation].slice(0,4).map(item=>({type:'open_pms_task',bookingId:item.bookingId,section:item.code,
      labelIT:`${labels[item.code][0]} · ${item.guestName || 'Ospite'}`,labelEN:`${labels[item.code][1]} · ${item.guestName || 'Guest'}`}));
    actions.push({type:'open_pms_checklist',labelIT:'Apri checklist di oggi',labelEN:"Open today's checklist"});
    return {type:'pms_autopilot_daily',confidence:1,textIT:text(false),textEN:text(true),actions,
      suggestionsIT:['Cosa devo fare oggi?','Quali documenti mancano?','Prossimi 7 giorni nel PMS'],
      suggestionsEN:['What should I do today?','Which documents are missing?','Next 7 days in the PMS']};
  };

  function buildHorizonResponse(snapshot,query){
    const plan=snapshot.plan;
    const tomorrowOnly=/domani|tomorrow/.test(query);
    const end=tomorrowOnly?plan.tomorrow:plan.week.end;
    const arrivals=plan.week.arrivals.filter(row=>row.checkin<=end);
    const tasks=plan.week.tasks.filter(item=>item.dueDate<=end);
    const needsPreparation=arrivals.filter(row=>row.pending.length || row.guestDataIncomplete);
    const ordered=[...needsPreparation,...arrivals.filter(row=>!row.pending.length && !row.guestDataIncomplete)];
    const taskLabels={documents:['Documenti mancanti','Missing documents'],authority:['Comunicazione da verificare','Report to review'],tax:['Tassa da riscuotere','Tax to collect'],cleaning:['Pulizia da completare','Cleaning to complete'],issue:['Segnalazione aperta','Open issue']};
    const pendingLabel=(item,en)=>`${taskLabels[item.code][en?1:0]}${item.code==='documents'?` (${item.missingDocuments})`:''}${item.status==='in_progress'?(en?' · In progress':' · In carico'):''}`;
    const preview=ordered.slice(0,3);
    const taskPreview=tasks.slice(0,3);
    const text=en=>[
      snapshot.isDemo?(en?'PMS Autopilot · DEMO preparation':'PMS Autopilot · Preparazione DEMO'):
        tomorrowOnly?(en?'PMS Autopilot · Prepare for tomorrow':'PMS Autopilot · Preparati per domani'):(en?'PMS Autopilot · Next 7 days':'PMS Autopilot · Prossimi 7 giorni'),
      `${plan.tomorrow} → ${end} · ${en?'All loaded properties':'Tutte le strutture caricate'}`,
      en?`${arrivals.length} expected arrivals · ${needsPreparation.length} with pre-arrival checks pending · ${tasks.length} future tasks due in this period.`:
        `${arrivals.length} arrivi previsti · ${needsPreparation.length} con verifiche pre-arrivo da gestire · ${tasks.length} attività future in scadenza nel periodo.`,
      en?'Arrivals count bookings; future tasks count individual tasks. These figures are separate from today’s total and must not be added together.':
        'Gli arrivi contano prenotazioni; le attività future contano singole attività. Questi numeri sono separati dal totale di oggi e non vanno sommati tra loro.',
      preview.length?(en?'Pre-arrival preparation:':'Preparazione degli arrivi:'):(en?'No future arrivals found in this period. This does not mean today’s tasks are complete.':'Nessun arrivo futuro rilevato nel periodo. Questo non significa che le attività di oggi siano completate.'),
      ...preview.map((row,index)=>`${index+1}. ${row.guestName || (en?'Guest name missing':'Nome ospite mancante')} · ${row.propertyName || (en?'Property name missing':'Struttura senza nome')}\n${en?'Expected arrival':'Arrivo previsto'}: ${row.checkin}\n${row.pending.length?row.pending.map(item=>pendingLabel(item,en)).join(' · '):(en?'No pre-arrival tasks found in saved data.':'Nessuna pendenza pre-arrivo rilevata nei dati salvati.')}${row.guestDataIncomplete?`\n${en?'Review guest name and guest count.':'Verifica nome ospite e numero degli ospiti.'}`:''}`),
      arrivals.length>preview.length?(en?`${arrivals.length-preview.length} more arrivals: see the booking list.`:`Altri ${arrivals.length-preview.length} arrivi: consulta l’elenco prenotazioni.`):'',
      taskPreview.length?(en?'Upcoming task dates:':'Scadenze delle attività future:'):'',
      ...taskPreview.map(item=>`${item.dueDate} · ${item.guestName || (en?'Guest':'Ospite')} · ${item.propertyName} · ${pendingLabel(item,en)}`),
      tasks.length>taskPreview.length?(en?`${tasks.length-taskPreview.length} more tasks in the complete checklist.`:`Altre ${tasks.length-taskPreview.length} attività nella checklist completa.`):'',
      en?'A cleaning scheduled after check-out belongs to turnover, not to preparation for this arrival. The review uses saved facts, not a forecast.':
        'Una pulizia prevista dopo il check-out riguarda il turnover, non la preparazione di questo arrivo. La verifica usa i dati salvati, non una previsione.',
      plan.invalidDates?(en?`${plan.invalidDates} bookings have dates to review; date-based checks may be incomplete.`:`${plan.invalidDates} prenotazioni hanno date da verificare: i controlli sulle scadenze possono essere incompleti.`):'',
      snapshot.syncedAt?`${en?'Bookings last loaded':'Ultimo caricamento prenotazioni'}: ${snapshot.syncedAt}`:''
    ].filter(Boolean).join('\n\n');
    const actions=preview.map(row=>({type:'open_pms_arrival',bookingId:row.bookingId,
      labelIT:`Prepara arrivo · ${row.guestName || 'Ospite'}`,labelEN:`Prepare arrival · ${row.guestName || 'Guest'}`}));
    const nextTask=needsPreparation.flatMap(row=>row.pending).find(item=>item.code!=='issue') || tasks[0];
    if(nextTask)actions.push({type:'open_pms_task',bookingId:nextTask.bookingId,section:nextTask.code,
      labelIT:`${taskLabels[nextTask.code][0]} · ${nextTask.guestName || 'Ospite'}`,labelEN:`${taskLabels[nextTask.code][1]} · ${nextTask.guestName || 'Guest'}`} );
    actions.push({type:'open_pms_all_tasks',labelIT:'Apri tutte le attività',labelEN:'Open all tasks'});
    return {type:'pms_autopilot_horizon',confidence:1,textIT:text(false),textEN:text(true),actions,
      suggestionsIT:['Prepara gli arrivi di domani','Prossimi 7 giorni nel PMS','Cosa devo fare oggi?'],
      suggestionsEN:["Prepare tomorrow’s arrivals",'Next 7 days in the PMS','What should I do today?']};
  }
})();
