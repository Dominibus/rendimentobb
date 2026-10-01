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
    const explicit=[...query.matchAll(/\b(\d{4}-\d{2}-\d{2})\b/g)].map(match=>match[1]);
    if(explicit.length){
      if(explicit.some(value=>!validDate(value)) || explicit.length>2 || (explicit.length===2 && explicit[1]<explicit[0]))return null;
      start=new Date(`${explicit[0]}T12:00:00`);const last=new Date(`${explicit.at(-1)}T12:00:00`);end=new Date(last.getFullYear(),last.getMonth(),last.getDate()+1);
    }
    return {start:iso(start),end:iso(end),last:iso(new Date(end.getFullYear(),end.getMonth(),end.getDate()-1))};
  }
  window.rbBuildPortalResponse = function(message, now = new Date()) {
    const query=normalize(message);
    if(/\bpdf\b|document|brochure|abbonamento|subscription/.test(query))return null;
    const valueRequest=/valore.*immobil|quanto vale|property value|valuation/.test(query);
    const costRequest=/quanto.*(?:pagare|pagar|spendere)|(?:devo|da)\s+pagare|pagamenti.*(?:domani|oggi|scaden|prossim)|what.*(?:pay|owe)|payments? due|costi.*(arriv|prossim|scaden|pagare)|spese.*(arriv|prossim|pagare)|upcoming costs|bills? due|budget residuo|remaining budget/.test(query);
    const ledgerRequest=/consuntiv|rendicont|quanto.*(incassat|guadagnat)|ricavi.*(mese|anno|prenot|pms)|incassi.*(mese|anno)|revenue.*(month|year|booking)|operating summary/.test(query);
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
    const propertyMatches=allProperties.filter(p=>normalize(p.name).length>=3 && query.includes(normalize(p.name)));
    const cityMatches=allProperties.filter(p=>normalize(p.city).length>=3 && new RegExp(`\\b${normalize(p.city).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\b`).test(query));
    const selected=propertyMatches.length?propertyMatches:cityMatches.length?cityMatches:allProperties;
    const scopeExplicit=/\b(?:per|di|for|in|a)\s+(?:l['’])?(?:immobile|property)\s+(.+)$/i.exec(query);
    if(scopeExplicit && !propertyMatches.length && !cityMatches.length)return respond("Non ho identificato l’immobile richiesto nei dati caricati. Usa il nome salvato in Immobili; non sommo altri immobili al suo posto.","I could not identify the requested property in the loaded data. Use its saved name; I will not substitute the whole portfolio.","unknown_property");
    const ids=new Set(selected.map(p=>p.id));
    const bookings=(Array.isArray(data.portalBookingList)?data.portalBookingList:Array.isArray(data.bookingList)?data.bookingList:[]).filter(b=>(!propertyMatches.length&&!cityMatches.length)||ids.has(b.propertyId));
    const renovations=(Array.isArray(data.renovationList)?data.renovationList:[]).filter(r=>(!propertyMatches.length&&!cityMatches.length)||ids.has(r.propertyId));
    const range=period(query,now,(bookingsRequest||costRequest)&&!ledgerRequest&&!overviewRequest);
    if(!range)return respond("Intervallo date non valido. Usa una data YYYY-MM-DD oppure due date in ordine cronologico.","Invalid date range. Use YYYY-MM-DD or two dates in chronological order.","invalid_period");
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
        for(const b of active){
          if(!validDate(b.checkin)||!validDate(b.checkout)||b.checkout<=b.checkin){incomplete++;continue;}
          const overlap=Math.max(0,Math.min(day(b.checkout),day(range.end))-Math.max(day(b.checkin),day(range.start)));
          if(!overlap)continue;
          if(normalize(b.status)==="pending"){pending++;continue;}
          const total=amount(b.totalAmount);if(total===null||b.amountRecognized===false){incomplete++;continue;}
          rental+=total*overlap/(day(b.checkout)-day(b.checkin));nights+=overlap;
        }
        lines.push(t(`Consuntivazione delle prenotazioni: ${range.start} → ${range.last}.`,`Booking revenue breakdown: ${range.start} → ${range.last}.`));
        lines.push(t(`Ricavi registrati attribuiti alle notti del periodo: ${money(rental)} · ${nights} notti.`,`Recorded rental revenue allocated to period nights: ${money(rental)} · ${nights} nights.`));
        lines.push(t("Il conteggio ripartisce l’importo del soggiorno per notte ed esclude cancellazioni e richieste pending. Non certifica incassi o utile netto: mancano un registro pagamenti e un registro completo delle spese.","Amounts are allocated per stay night; cancellations and pending requests are excluded. This does not certify cash receipts or net profit: there is no payment ledger or complete expense ledger."));
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
      lines.push(t(`Fonte: snapshot PMS ${data.lastBookingsSync||"caricato"}.`,`Source: PMS snapshot ${data.lastBookingsSync||"loaded"}.`));
      return lines.join("\n");
    };
    return respond(render("it"),render("en"),"portal",{ownerUid:data.ownerUid,period:range,propertyIds:[...ids]});
  };
})();
