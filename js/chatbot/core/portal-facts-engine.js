// Read-only answers from the authenticated PMS snapshot. No accounting or valuation defaults.
(function () {
  "use strict";
  const normalize = value => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const amount = value => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value)) ? Number(value) : null;
  const iso = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value)) && iso(new Date(`${value}T12:00:00`)) === value;
  const day = value => Date.parse(`${value}T00:00:00Z`) / 86400000;
  const inactive = booking => /^(cancelled|canceled|rejected|declined)$/.test(normalize(booking.status));
  function period(query, now, future) {
    const y=now.getFullYear(), m=now.getMonth(), today=new Date(y,m,now.getDate());
    let start=new Date(y,m,1), end=new Date(y,m+1,1);
    if(future) {start=today;end=new Date(y,m,now.getDate()+31);}
    if(/mese scorso|last month/.test(query)){start=new Date(y,m-1,1);end=new Date(y,m,1);}
    else if(/prossimo mese|next month/.test(query)){start=new Date(y,m+1,1);end=new Date(y,m+2,1);}
    else if(/questo mese|this month/.test(query)){start=new Date(y,m,1);end=new Date(y,m+1,1);}
    else if(/domani|tomorrow/.test(query)){start=new Date(y,m,now.getDate()+1);end=new Date(y,m,now.getDate()+2);}
    else if(/oggi|today/.test(query)){start=today;end=new Date(y,m,now.getDate()+1);}
    else if(/settimana|week/.test(query)){start=today;end=new Date(y,m,now.getDate()+7);}
    else if(/quest.*anno|this year/.test(query)){start=new Date(y,0,1);end=new Date(y+1,0,1);}
    const months=[['gennaio','january'],['febbraio','february'],['marzo','march'],['aprile','april'],['maggio','may'],['giugno','june'],['luglio','july'],['agosto','august'],['settembre','september'],['ottobre','october'],['novembre','november'],['dicembre','december']];
    const found=months.flatMap((names,index)=>names.flatMap(name=>{const hit=new RegExp('\\b'+name+'(?:\\s+(?:del\\s+)?([12]\\d{3}))?\\b').exec(query);return hit?[{index,year:hit[1]?Number(hit[1]):y}]:[];}));
    if(found.length>1)return null;
    if(found.length){start=new Date(found[0].year,found[0].index,1);end=new Date(found[0].year,found[0].index+1,1);}
    const quarter=/\b(?:q([1-4])|([1-4])(?:o|°)?\s*trimestre)\s*(?:del\s*)?([12]\d{3})\b/.exec(query);
    if(quarter){const yy=Number(quarter[3]),mm=(Number(quarter[1]||quarter[2])-1)*3;start=new Date(yy,mm,1);end=new Date(yy,mm+3,1);}
    const yearOnly=/\b(?:anno|year)\s+([12]\d{3})\b/.exec(query);
    if(yearOnly&&!found.length&&!quarter){start=new Date(Number(yearOnly[1]),0,1);end=new Date(Number(yearOnly[1])+1,0,1);}
    const explicit=[...query.matchAll(/\b(\d{4}-\d{2}-\d{2})\b/g)].map(match=>match[1]);
    if(explicit.length){
      if(explicit.some(value=>!validDate(value)) || explicit.length>2 || (explicit.length===2 && explicit[1]<explicit[0]))return null;
      start=new Date(`${explicit[0]}T12:00:00`);const last=new Date(`${explicit.at(-1)}T12:00:00`);end=new Date(last.getFullYear(),last.getMonth(),last.getDate()+1);
    }
    return {start:iso(start),end:iso(end),last:iso(new Date(end.getFullYear(),end.getMonth(),end.getDate()-1))};
  }
  // Only IDs and dates are retained. Numeric answers are rebuilt from the current owned snapshot.
  let conversationScope=null;
  window.rbClearPortalContext=()=>{conversationScope=null;};
  const related=q=>/occupazion|occupancy|\badr\b|revpar|andamento|perform|ricavi|revenue|miglior|improv|priorit|dato.*primo|check.*first/.test(q);
  window.rbPreparePortalContext=function(message){
    const q=normalize(message);
    if(/pdf|document|brochure|simulazion|simulation|\broi\b|\broy\b|mutuo|mortgage|abbonamento|subscription|\bpro\b|investor|airbnb|booking\.com/.test(q)||!related(q))conversationScope=null;
  };
  // Financial follow-ups must keep the property scope, never substitute another simulation.
  window.rbBuildPortalFinancialBoundary = function(message){
    const q=normalize(message);
    if(!/\b(?:roi|roy|cashflow|cash flow|dscr|rendimento|return)\b/.test(q) || /pdf|document|brochure|simulazion|simulation|scenario|simulator|definizion|definition|significa|meaning|what is|cos['’]e/.test(q))return null;
    const data=window.rbPMSData,uid=window.currentUser?.uid,access=window.getUserAccess?.()||{};
    if(!uid || !(access.isInvestor||access.isPro||access.isAdmin))return null;
    const owned=data?.ownerUid===uid && data.portalSnapshotReady===true && data.isDemo!==true;
    const names=owned?(data.propertyList||[]).filter(p=>normalize(p.name).length>=3 && q.includes(normalize(p.name))):[];
    const remembered=owned && conversationScope?.ownerUid===uid ? conversationScope : null;
    const scoped=names.length?names:remembered?(data.propertyList||[]).filter(p=>remembered.propertyIds.includes(p.id)):[];
    const genericProperty=/immobil|struttur|propert|\bpms\b|effettiv|actual|consuntiv/.test(q);
    if(!scoped.length && !genericProperty)return null;
    const label=scoped.map(p=>String(p.name||'')).join(', ');
    const range=remembered && !names.length ? remembered.period : null;
    const build=en=>[
      en?'Which financial result do you want to read?':'Quale risultato finanziario vuoi leggere?',
      label?((en?'PMS scope: ':'Ambito PMS: ')+label+(range?' · '+range.start+' → '+range.last:'')):'',
      en?'Bookings alone do not calculate actual ROI, cash flow or DSCR. Actual payments, complete costs and invested capital are required.':'Le sole prenotazioni non calcolano ROI, cashflow o DSCR effettivi. Servono incassi, costi completi e capitale investito.',
      en?'For the forecast, open Portfolio → Report for this analysis for the property you mean. Check its analysis ID and annual assumptions. The latest open simulation may belong to a different property.':'Per la previsione apri Portafoglio → Report di questa analisi dell’immobile che intendi. Controlla ID analisi e ipotesi annuali: l’ultima simulazione aperta può appartenere a un altro immobile.',
      en?'Tell me whether you want the linked simulation or the PMS figures for a specific period. I have not replaced these data with another scenario.':'Dimmi se vuoi leggere la simulazione collegata oppure i dati PMS di un periodo. Non ho sostituito questi dati con un altro scenario.'
    ].filter(Boolean).join('\n\n');
    return {type:'portal_financial_boundary',confidence:1,textIT:build(false),textEN:build(true),actions:[],
      suggestionsIT:['Spiegami il report integrato Pro','Quali dati mancano per il ROI effettivo?'],suggestionsEN:['Explain the integrated Pro report','Which data are missing for actual ROI?'],
      metadata:{source:'account_pms',answerMode:'financial_boundary',propertyIds:scoped.map(p=>p.id)}};
  };
  window.rbBuildPortalResponse = function(message, now = new Date()) {
    const query=normalize(message);
    if(/\bpdf\b|document|brochure|abbonamento|subscription/.test(query))return null;
    const valueRequest=/valore.*immobil|quanto vale|property value|valuation/.test(query);
    const costRequest=/quanto.*(?:pagare|pagar|spendere)|(?:devo|da)\s+pagare|pagamenti.*(?:domani|oggi|scaden|prossim)|what.*(?:pay|owe)|payments? due|costi.*(arriv|prossim|scaden|pagare)|spese.*(arriv|prossim|pagare)|upcoming costs|bills? due|budget residuo|remaining budget/.test(query);
    const referencesOwnedName=(window.rbPMSData?.propertyList||[]).some(p=>normalize(p.name).length>=3&&query.includes(normalize(p.name)));
    const conversationalFollowup=!!conversationScope&&related(query);
    const performanceRequest=conversationalFollowup||/come sta andando|how is .+ perform/.test(query)||/andamento|perform|occupazion|occupancy|\badr\b|revpar|come (?:va|sta andando)/.test(query)&&(referencesOwnedName||/\bmio\b|\bmiei\b|\bmia\b|\bmie\b|\bmy\b|portafoglio|portfolio|pms|struttura|immobile/.test(query));
    const ledgerRequest=performanceRequest||/consuntiv|rendicont|quanto.*(incassat|guadagnat)|ricavi.*(mese|anno|prenot|pms)|incassi.*(mese|anno)|revenue.*(month|year|booking)|operating summary/.test(query);
    const bookingsRequest=/prenotazion|bookings|reservations/.test(query) && /prossim|arriv|riepilog|elenc|quante|settimana|oggi|domani|mese|next|upcoming|list|how many|today|tomorrow|month|week/.test(query) && !/tariff|prezz|pulizi|document|segnal|ospit.*proble|cancell|modific|crea|salva|delete|edit/.test(query);
    const overviewRequest=/riepilog.*(portale|pms|gestione)|stato.*(portale|pms)|portal summary/.test(query);
    if(!valueRequest&&!costRequest&&!ledgerRequest&&!bookingsRequest&&!overviewRequest)return null;
    const access=window.getUserAccess?.() || {};
    const data=window.rbPMSData;
    const demo=data?.isDemo===true && window.isDemoDashboard===true;
    const respond = (it,en,mode,metadata={}) => ({type:"portal_grounded",confidence:1,textIT:it,textEN:en,suggestionsIT:["Riepilogo del portale","Prossime prenotazioni","Costi in arrivo"],suggestionsEN:["Portal summary","Upcoming bookings","Upcoming costs"],signals:["saved_pms_only"],metadata:{source:demo?"demo_pms":"account_pms",answerMode:mode,...metadata}});
    if(!demo && (!window.currentUser || !(access.isInvestor||access.isPro||access.isAdmin)))return respond("La lettura dei dati PMS del tuo account è disponibile con Investor e Pro. Apri i piani per sbloccarla.","Account PMS data answers are available with Investor and Pro. Open plans to unlock them.","access");
    if(!data || (!demo && (data.ownerUid!==window.currentUser.uid || data.portalSnapshotReady!==true)))return respond("I dati PMS del tuo account non sono ancora disponibili in questa schermata. Apri Dashboard → Gestione e attendi il caricamento; poi ripeti la domanda. Non uso la simulazione o il PDF per sostituirli.","Your account PMS data are not available on this screen yet. Open Dashboard → Management and wait for loading, then ask again. Simulation or PDF figures cannot replace them.","unavailable");
    const allProperties=Array.isArray(data.propertyList)?data.propertyList:[];
    let propertyMatches=allProperties.filter(p=>normalize(p.name).length>=3 && query.includes(normalize(p.name)));
    const cityMatches=allProperties.filter(p=>normalize(p.city).length>=3 && new RegExp(`\\b${normalize(p.city).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\b`).test(query));
    const hasExplicitPeriod=/\d{4}-\d{2}-\d{2}|gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre|january|february|march|april|may|june|july|august|september|october|november|december|oggi|domani|today|tomorrow|mese|month|settimana|week|trimestre|quarter|\bq[1-4]\b|anno|year/.test(query);
    const allScope=/tutt[oi]|all (?:properties|portfolio)|whole portfolio|portafoglio|portfolio/.test(query);
    const inherit=conversationalFollowup&&conversationScope.ownerUid===window.currentUser?.uid&&!demo;
    if(conversationalFollowup&&!inherit){conversationScope=null;return respond('Il contesto PMS precedente non è più valido. Indica immobile e periodo sul tuo account.','The previous PMS context is no longer valid. Specify a property and period for your account.','unavailable');}
    if(inherit&&!propertyMatches.length&&!cityMatches.length&&!allScope&&!/\b(?:per|di|for|in|a)\s+(?:l['’])?(?:immobile|property)\s+/.test(query)){
      propertyMatches=allProperties.filter(p=>conversationScope.propertyIds.includes(p.id));
      if(propertyMatches.length!==conversationScope.propertyIds.length){conversationScope=null;return respond('L’immobile del contesto precedente non è più disponibile. Scegli nuovamente immobile e periodo.','The previous property is no longer available. Select a property and period again.','unknown_property');}
    }
    const selected=propertyMatches.length?propertyMatches:cityMatches.length?cityMatches:allProperties;
    const scopeExplicit=/\b(?:per|di|for|in|a)\s+(?:l['’])?(?:immobile|property)\s+(.+)$/i.exec(query);
    if(scopeExplicit && !propertyMatches.length && !cityMatches.length)return respond("Non ho identificato l’immobile richiesto nei dati caricati. Usa il nome salvato in Immobili; non sommo altri immobili al suo posto.","I could not identify the requested property in the loaded data. Use its saved name; I will not substitute the whole portfolio.","unknown_property");
    if(performanceRequest&&!propertyMatches.length&&!cityMatches.length&&!/tutt[oi]|portfolio|portafoglio|\bpms\b/.test(query))return respond("Quale immobile vuoi analizzare? Indica il nome salvato oppure tutto il portfolio.","Which property should I analyze? Use its saved name or the whole portfolio.","unknown_property");
    const ids=new Set(selected.map(p=>p.id));
    const bookings=(Array.isArray(data.portalBookingList)?data.portalBookingList:Array.isArray(data.bookingList)?data.bookingList:[]).filter(b=>(!propertyMatches.length&&!cityMatches.length)||ids.has(b.propertyId));
    const renovations=(Array.isArray(data.renovationList)?data.renovationList:[]).filter(r=>(!propertyMatches.length&&!cityMatches.length)||ids.has(r.propertyId));
    const dateQuery=propertyMatches.reduce((text,p)=>text.replace(normalize(p.name),""),query);
    const range=inherit&&!hasExplicitPeriod ? {...conversationScope.period} : period(dateQuery,now,(bookingsRequest||costRequest)&&!ledgerRequest&&!overviewRequest);
    if(!range)return respond("Intervallo date non valido. Usa una data YYYY-MM-DD oppure due date in ordine cronologico.","Invalid date range. Use YYYY-MM-DD or two dates in chronological order.","invalid_period");
    let sharedReport=null;
    if((ledgerRequest||overviewRequest)&&!demo&&typeof window.rbBuildPMSOperationalReport==='function'){
      try{sharedReport=window.rbBuildPMSOperationalReport({period:{start:range.start,end:range.end},propertyIds:[...ids]});}
      catch(error){return respond("Il modello PMS non e disponibile per questo ambito o periodo. Apri la dashboard e ricarica i dati.","The PMS model is unavailable for this scope or period. Open the dashboard and reload the records.","unavailable");}
    }
    const render=lang=>{
      const en=lang==="en", t=(it,english)=>en?english:it;
      const money=value=>new Intl.NumberFormat(en?"en-GB":"it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:2,useGrouping:true}).format(value);
      const lines=[t(demo?"Dati dimostrativi PMS":"Dati salvati del tuo account PMS",demo?"Illustrative PMS data":"Saved account PMS data")];
      lines.push(t(`Ambito: ${propertyMatches.length||cityMatches.length?selected.map(p=>p.name).join(", "):"tutti gli immobili caricati"}.`,`Scope: ${propertyMatches.length||cityMatches.length?selected.map(p=>p.name).join(", "):"all loaded properties"}.`));
      const active=bookings.filter(b=>!inactive(b));
      if(bookingsRequest||overviewRequest){
        lines.push(t(`Arrivi dal ${range.start} al ${range.last}.`,`Arrivals from ${range.start} to ${range.last}.`));
        const upcoming=active.filter(b=>validDate(b.checkin)&&b.checkin>=range.start&&b.checkin<range.end && !/^(completed|checkout)$/.test(normalize(b.status))).sort((a,b)=>a.checkin.localeCompare(b.checkin));
        const pending=upcoming.filter(b=>normalize(b.status)==="pending");
        lines.push(t(`${upcoming.length} prenotazioni; ${pending.length} richieste in attesa di conferma.`,`${upcoming.length} bookings; ${pending.length} requests awaiting confirmation.`));
        for(const b of upcoming.slice(0,10))lines.push(`${b.checkin} → ${b.checkout || "—"} · ${b.propertyName||"—"} · ${b.guestName||"—"} · ${amount(b.totalAmount)===null?"—":money(Number(b.totalAmount))} · ${b.status||"—"}`);
        if(upcoming.length>10)lines.push(t(`Mostrate le prime 10 di ${upcoming.length}.`,`Showing the first 10 of ${upcoming.length}.`));
      }
      if(ledgerRequest||overviewRequest){
        let rental=0,nights=0,incomplete=0,pending=0;
        if(!sharedReport)for(const b of active){
          if(!validDate(b.checkin)||!validDate(b.checkout)||b.checkout<=b.checkin){incomplete++;continue;}
          const overlap=Math.max(0,Math.min(day(b.checkout),day(range.end))-Math.max(day(b.checkin),day(range.start)));
          if(!overlap)continue;
          if(normalize(b.status)==="pending"){pending++;continue;}
          const total=amount(b.totalAmount);if(total===null||b.amountRecognized===false){incomplete++;continue;}
          rental+=total*overlap/(day(b.checkout)-day(b.checkin));nights+=overlap;
        }
        if(sharedReport){rental=sharedReport.totals.revenue;nights=sharedReport.totals.nights;incomplete=sharedReport.warnings.invalidDates+sharedReport.warnings.missingAmounts+sharedReport.warnings.unknownStatuses;}
        lines.push(t(`Consuntivazione delle prenotazioni: ${range.start} → ${range.last}.`,`Booking revenue breakdown: ${range.start} → ${range.last}.`));
        const requestedMetric = /\badr\b/.test(query) ? 'adr' : /revpar/.test(query) ? 'revpar' : /occupazion|occupancy/.test(query) ? 'occupancy' : null;
        const concise = sharedReport && requestedMetric && !overviewRequest && !/andamento|perform|ricav|revenue|miglior|improv|priorit|primo|first|check|controll/.test(query);
        if(concise){
          const a=sharedReport.totals, value=a[requestedMetric];
          const shown=value===null?t('N/D','N/A'):requestedMetric==='occupancy'?new Intl.NumberFormat(en?'en-GB':'it-IT',{maximumFractionDigits:2}).format(value)+'%':money(value);
          const label=requestedMetric==='occupancy'?t('Occupazione registrata','Recorded occupancy'):requestedMetric.toUpperCase();
          lines.push(label+': '+shown+'.');
          lines.push(requestedMetric==='occupancy'?t('Notti occupate uniche / notti disponibili. Disponibilità ipotizzata: una unità per immobile ogni giorno; verifica chiusure e completezza del calendario.','Unique occupied nights / available nights. Assumed availability: one unit per property every day; review closures and calendar completeness.'):requestedMetric==='adr'?t('ADR = ricavi prenotati attribuiti al periodo / notti prenotate. Non misura incassi o utile.','ADR = booked revenue allocated to the period / booked nights. It does not measure receipts or profit.'):t('RevPAR = ricavi prenotati attribuiti al periodo / notti disponibili. Non misura il margine netto.','RevPAR = booked revenue allocated to the period / available nights. It does not measure net margin.'));
          if(sharedReport.warnings.overlappingNights)lines.push(t('Sono presenti notti sovrapposte: verifica le prenotazioni.','Overlapping nights exist: review bookings.'));
        }else{
        lines.push(t(`Ricavi registrati attribuiti alle notti del periodo: ${money(rental)} · ${nights} notti.`,`Recorded rental revenue allocated to period nights: ${money(rental)} · ${nights} nights.`));
        lines.push(t("Il conteggio ripartisce l’importo del soggiorno per notte ed esclude cancellazioni e richieste pending. Non certifica incassi o utile netto: mancano un registro pagamenti e un registro completo delle spese.","Amounts are allocated per stay night; cancellations and pending requests are excluded. This does not certify cash receipts or net profit: there is no payment ledger or complete expense ledger."));
        if(sharedReport){
          const a=sharedReport.totals,fmt=v=>v===null?t('N/D','N/A'):new Intl.NumberFormat(en?'en-GB':'it-IT',{maximumFractionDigits:2}).format(v);
          lines.push(t(`Occupazione registrata: ${fmt(a.occupancy)}% · ADR: ${a.adr===null?'N/D':money(a.adr)} · RevPAR: ${a.revpar===null?'N/D':money(a.revpar)}.`,`Recorded occupancy: ${fmt(a.occupancy)}% · ADR: ${a.adr===null?'N/A':money(a.adr)} · RevPAR: ${a.revpar===null?'N/A':money(a.revpar)}.`));
          lines.push(t('Una unita disponibile per immobile ogni giorno; chiusure e completezza del calendario non sono verificate.','One available unit per property every day; closures and calendar completeness are not verified.'));
          if(sharedReport.warnings.overlappingNights)lines.push(t('Sono presenti notti sovrapposte: verifica le prenotazioni.','Overlapping nights exist: review bookings.'));
        }
        }
        if(range.end>iso(now))lines.push(t('Periodo in corso o futuro: sono importi prenotati, non un consuntivo chiuso.','Current or future period: these are booked amounts, not a closed-period actual.'));
        if(incomplete||pending)lines.push(t(`Esclusioni: ${incomplete} record incompleti; ${pending} richieste pending nel periodo.`,`Excluded: ${incomplete} incomplete records; ${pending} pending requests in the period.`));
      }
      if(valueRequest||overviewRequest){
        let total=0,recognized=0;
        for(const p of selected){
          const price=amount(p.acquisitionPrice);
          if(price!==null){total+=price;recognized++;}
          lines.push(t(`${p.name||"Immobile"}: prezzo d’acquisto della simulazione salvata ${price===null?"non disponibile":money(price)}.`,`${p.name||"Property"}: saved simulation acquisition price ${price===null?"unavailable":money(price)}.`));
          const plan=renovations.find(r=>r.propertyId===p.id);
          if(amount(plan?.targetValue)>0)lines.push(t(`Valore post-lavori stimato inserito nel piano: ${money(Number(plan.targetValue))}.`,`Estimated post-renovation value entered in the plan: ${money(Number(plan.targetValue))}.`));
        }
        if(recognized)lines.push(t(`Totale prezzi riconosciuti: ${money(total)} (${recognized}/${selected.length} immobili).`,`Total recognized acquisition prices: ${money(total)} (${recognized}/${selected.length} properties).`));
        lines.push(t("Questi importi non sono una perizia o un valore attuale di mercato. Il portale non dispone di una valutazione immobiliare aggiornata verificata.","These figures are not an appraisal or a current market valuation. The portal has no verified up-to-date property valuation."));
      }
      if(costRequest||overviewRequest){
        lines.push(t("Costi in arrivo: il portale non registra un calendario completo di fatture, rate e pagamenti. Non posso indicare un totale certo in scadenza.","Upcoming costs: the portal has no complete schedule of invoices, installments and payments. I cannot give a verified amount due."));
        for(const r of renovations){
          const planned=amount(r.plannedTotal),spent=amount(r.actualSpent);
          if(planned!==null&&spent!==null)lines.push(t(`${r.propertyName}: budget lavori ${money(planned)}, spesa lavori registrata ${money(spent)}, residuo pianificato ${money(Math.max(0,planned-spent))}${spent>planned?`, superamento budget ${money(spent-planned)}`:""}.`,`${r.propertyName}: work budget ${money(planned)}, recorded work spend ${money(spent)}, planned remainder ${money(Math.max(0,planned-spent))}${spent>planned?`, budget overrun ${money(spent-planned)}`:""}.`));
        }
        const cleanings=active.filter(b=>b.cleaning?.required!==false && b.cleaning?.status!=="completed" && validDate(b.cleaning?.scheduledDate)&&b.cleaning.scheduledDate>=range.start&&b.cleaning.scheduledDate<range.end);
        lines.push(t(`Pulizie previste nel periodo ${range.start} → ${range.last}: ${cleanings.length}. Il relativo costo non è registrato. Il residuo lavori è una previsione, non un debito da pagare.`,`Scheduled cleanings for ${range.start} → ${range.last}: ${cleanings.length}. Their cost is not recorded. Remaining work budget is a forecast, not a payable debt.`));
      }
      if(ledgerRequest&&(/miglior|improv|priorit|primo|prima|first|controll|check/.test(query))){
        lines.push(t('Primo controllo: verifica che calendario, chiusure e prenotazioni del periodo siano completi.','First check: verify that the period calendar, closures and bookings are complete.'));
        if(/occupazion|occupancy/.test(query))lines.push(t('Per l’occupazione, esamina le notti vuote e la stagionalità. Confronta poi l’ADR dello stesso immobile e periodo prima di valutare modifiche di tariffa.','For occupancy, review empty nights and seasonality. Then compare ADR for the same property and period before considering rate changes.'));
        else lines.push(t('Poi leggi insieme occupazione e ADR dello stesso immobile e periodo: separa l’effetto delle notti prenotate da quello delle tariffe.','Then read occupancy and ADR together for the same property and period: separate the effect of booked nights from rates.'));
        lines.push(t('Per valutare il margine servono incassi e costi completi dello stesso periodo. Non ho modificato tariffe o prenotazioni.','Profit requires complete receipts and costs for the same period. I have not changed rates or bookings.'));
      }
      lines.push(t(`Fonte: snapshot PMS ${data.lastBookingsSync||"caricato"}.`,`Source: PMS snapshot ${data.lastBookingsSync||"loaded"}.`));
      return lines.join("\n");
    };
    if(ledgerRequest&&!demo)conversationScope={ownerUid:data.ownerUid,propertyIds:[...ids],period:{...range}};
    const response=respond(render("it"),render("en"),"portal",{ownerUid:data.ownerUid,period:range,propertyIds:[...ids]});
    if(ledgerRequest && !demo){response.suggestionsIT=['E l’occupazione?','E l’ADR?','Come posso migliorare l’occupazione?'];response.suggestionsEN=['And occupancy?','And ADR?','How can I improve occupancy?'];}
    return response;
  };
})();
