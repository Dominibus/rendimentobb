// ===============================================
// 🧠 RENDIMENTOBB – CHATBOT ORCHESTRATOR
// Silicon Valley AI Core System
// ===============================================

// ===============================================
// 🚀 MAIN AI PIPELINE
// ===============================================

// Product limits take priority over document, PMS and general knowledge routes.
// A question about an external action must never be answered as if it happened.
// Privacy refusal runs before PMS, portfolio and document routes.
window.rbBuildAccountPrivacyResponse = function(message){
 const q=String(message || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
 const thirdParty=/(?:un |di |dell[’']|da |per )?(?:altro|altrui|altri)\s*(?:account|utente|utenti|cliente|clienti|ospite|ospiti)|(?:another|other|someone else'?s)\s*(?:account|user|users|customer|customers|client|guest)|dati altrui|other people/.test(q);
 const access=/(prenot|booking|email|e-mail|dati|data|account|indirizz|address|portfolio|patrimonio|immobil|propert|report|password|token|credenzial)/.test(q);
 if(!thirdParty || !access)return null;
 return {type:'account_privacy',confidence:1,actions:[],metadata:{source:'account_boundary'},textIT:'Non posso accedere o mostrare dati di altri account. Posso aiutarti soltanto con i dati caricati e autorizzati del tuo account. Non ho consultato né modificato dati altrui.',textEN:'I cannot access or show other accounts’ data. I can help only with the loaded, authorized data from your account. I have not accessed or changed anyone else’s data.'};
};

// RC169: the brand subtitle does not advertise custom software services.
// Resolve explicit scope requests before live account, PDF and market routes.
window.rbBuildRealEstateScopeResponse = function(message){
  const q = String(message || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const brand = /\bbasic\s*(?:&|and|e)\s*beyond\b|\bbasic\s+beyond\b|(?:due|two)\s*bb\b/.test(q);
  const build = /\b(?:creare|crearmi|creaci|createmi|crei|create|realizzare|realizzi|realizzate|realizzarmi|sviluppare|sviluppi|sviluppate|svilupparmi|costruire|costruisci|costruite|build|develop|design)\b[^.!?\n]{0,70}\b(?:sit[oi]|sito\s+web|website|websites|software|app|apps|applicazion[ei]|applications?|gestional[ei]|automation|automazion[ei])\b/.test(q);
  const bespoke = /(?:software|gestional[ei]|app|sit[oi]|website|applications?)\s+(?:personalizzat[oaie]|su misura|per conto terzi)|\b(?:custom|bespoke)\s+(?:software|apps?|websites?|applications?)\b/.test(q);
  if(!brand && !build && !bespoke)return null;
  return {
    type:'real_estate_scope',confidence:1,actions:[],metadata:{source:'current_product_scope'},
    textIT:'Basic & Beyond — L’essenziale & oltre è il sottotitolo del marchio RendimentoBB. Oggi la piattaforma si concentra su investimenti immobiliari, simulatore ROI, mutui, confronto degli immobili, dashboard, PMS per B&B e affitti brevi e assistenza AI sui dati disponibili.\n\nL’offerta generalista per sviluppare siti, app, software o gestionali per conto di terzi è sospesa: non è un servizio attualmente disponibile.\n\nVuoi valutare un acquisto, analizzare un immobile che possiedi oppure gestire prenotazioni e attività del tuo B&B?',
    textEN:'Basic & Beyond — The essentials & beyond is the RendimentoBB brand subtitle. Today the platform focuses on property investments, the ROI simulator, mortgages, property comparisons, dashboards, PMS for B&Bs and short stays, and AI assistance using available data.\n\nThe general-purpose offering to develop websites, apps, software or management systems for third parties is suspended: it is not currently an available service.\n\nWould you like to assess a purchase, analyse a property you own, or manage bookings and tasks for your B&B?'
  };
};

// Public product examples are not a paid, verified listing feed.
window.rbBuildListingEvidenceResponse = function(message){
 const q=String(message||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 if(/\b(?:pdf|documento|document|file|brochure|mio|mia|miei|mie|my|nostro|nostra|our)\b|prenotaz|booking/.test(q))return null;
 if(!/annunc|listing|catalog|immobili|properties/.test(q) || !/verificat|verified|reali|real |disponib|available|aggiornat|up.to.date|acquistare|purchase/.test(q))return null;
 return {type:'listing_evidence',confidence:1,actions:[],metadata:{source:'current_product_scope',classification:'E',verifiedListings:false},
 textIT:'Gli immobili mostrati dal prodotto sono scenari dimostrativi, non annunci verificati o offerte di acquisto aggiornate. Pro aggiunge report e PDF: non sblocca un catalogo di annunci reali. I collegamenti ai portali aprono siti esterni, senza sincronizzazione o importazione attiva. Puoi confrontare due immobili inserendo i dati degli annunci trovati da te; prezzo, disponibilità, caratteristiche e data vanno verificati con la fonte e il referente dell’annuncio.',
 textEN:'Properties shown by the product are demonstration scenarios, not verified listings or current purchase offers. Pro adds reports and PDFs; it does not unlock a real listing catalogue. Portal links open external sites without active synchronisation or imports. You can compare two properties using listing details you enter; verify price, availability, features and date with the source and listing contact.'};
};

window.rbBuildProductLimitsResponse = function(message){
  const q = String(message || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const financial = /\b(roi|roy|cashflow|cash flow|rendimento|return|returns|ricavi|revenue|profit|profitto|guadagn\w*|earn\w*)\b/.test(q);
  const guarantee = /garanti|guarante|assicurat|assured|certo|certain|sicuro|sicuramente|sure|promett|promise/.test(q);
  const external = /alloggiati|airbnb|booking\.com|\bota\b|schedin|questura|police|istat|authorities|autorita/.test(q);
  const action = /sincron|sync|invi|send|sent|trasmess|transmi|automat|automatic|gia fatto|already|integrat|collegat|connect/.test(q);
  if(!(financial && guarantee) && !(external && action)) return null;
  return {
    type:'product_limits',confidence:1,actions:[],signals:['product_limits_explained'],metadata:{source:'product_scope'},
    textIT:'Il ROI, il cashflow, i ricavi e i punteggi sono stime del modello basate sui dati inseriti: non sono rendimenti garantiti, risultati già conseguiti o una probabilità di successo. Verifica le ipotesi e le condizioni effettive prima di decidere.\n\nRendimentoBB non sincronizza automaticamente Airbnb o Booking.com e non invia automaticamente schedine ad Alloggiati Web, comunicazioni ISTAT o altri adempimenti. Il PMS e Autopilot organizzano dati, scadenze e attività; le istruzioni o gli eventuali file di esportazione richiedono la tua verifica e l’esecuzione sui portali competenti. Una risposta del chatbot non conferma che un invio o una sincronizzazione siano avvenuti.\n\nPer sapere se hai completato un adempimento, controlla la ricevuta del portale competente. Le valutazioni del modello non sostituiscono una verifica fiscale, legale o bancaria.',
    textEN:'ROI, cash flow, revenue and scores are model estimates based on the inputs: they are not guaranteed returns, achieved results or a probability of success. Review the assumptions and actual conditions before deciding.\n\nRendimentoBB does not automatically sync Airbnb or Booking.com and does not automatically send guest registrations to Alloggiati Web, ISTAT reports or other statutory filings. PMS and Autopilot organize data, deadlines and tasks; instructions and any export files require your review and submission through the relevant portals. A chatbot reply does not confirm that a submission or synchronization took place.\n\nTo check whether a filing was completed, inspect the receipt from the relevant portal. Model assessments do not replace tax, legal or lender checks.'
  };
};

// RC174: definitions are independent of cached account/scenario values. Match
// the question's purpose before statistical routes, preserving PDF priority.
// RC189: informal requests for basic meaning still need educational routing.
// Personal/numeric/PDF exclusions below remain authoritative.
function rbAsksPlainMetricMeaning(q){
  return /\b(?:che|cosa) (?:vuol|vuole) dire|\bnon (?:ho|abbiamo) capito\b|\bnon (?:mi|ci) e chiaro\b|\bi (?:do not|don['’]?t|did not|didn['’]?t) understand\b/.test(q);
}
window.rbBuildMetricEducationResponse = function(message){
  const q=String(message || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const meaning=/\b(?:definizione|definition|significa|significano|meaning|spiega|spiegami|spieghi|explain|differenza|differenze|difference|differences)\b|\bcos['’]?e\b|(?:che )?cosa (?:sono|e|vuol dire|vuole dire)|what (?:is|are)|what does.*(?:mean|stand for)|come.*calcol|how.*calculat|non capisco/.test(q) || rbAsksPlainMetricMeaning(q);
  if(!meaning && !/^\s*(?:kpis?|adr|revpar|dscr|ltv|cashflow)\s*[?!.]*\s*$/.test(q))return null;
  if(/\b(?:pdf|documento|document|brochure|file|mio|mia|miei|mie|my|actual|effettiv[oaie]|reale)\b/.test(q) || /\d/.test(q))return null;
  const entries=[
    ['revenue',/\bricav\w*\b|\brevenues?\b/,
      'Ricavi: importi lordi dello scenario, prima di commissioni, costi, imposte e mutuo. Nel simulatore: tariffa notte × 365 × occupazione / 100. Nel PMS sono importi delle prenotazioni attribuiti al periodo, non incassi verificati né utile. Per arrivare al cashflow del modello vanno sottratte le uscite previste.',
      'Revenue is the gross scenario amount before fees, costs, tax and loan payments. In the simulator: nightly rate × 365 × occupancy / 100. PMS revenue is booking amounts allocated to the period, not verified receipts or profit. Model outflows must be deducted to obtain model cashflow.'],
    ['equity',/capitale proprio|\bequity\b/,
      'Capitale proprio: denaro investito direttamente. Nell’acquisto, il modello ricava il mutuo da prezzo meno capitale proprio; le spese accessorie richiedono una verifica separata. Per un immobile già posseduto il capitale di avvio non rappresenta il valore totale della casa. Non confondere ROI sul capitale e rendimento sul valore dell’immobile.',
      'Equity is money invested directly. For a purchase, the model derives the loan from price minus equity; transaction costs require a separate check. For an owned property, startup capital is not the full property value. Return on equity and return on property value use different denominators.'],
    ['kpi',/\bkpis?\b|key performance indicators?|indicatori (?:chiave|di prestazione)/,
      'KPI: sono indicatori chiave, cioè numeri che aiutano a capire come va un’attività. Nel PMS trovi ricavi prenotati, occupazione, ADR e RevPAR. Per interpretarli controlla sempre periodo, immobili inclusi e completezza dei dati. Un KPI isolato non dimostra un utile.',
      'KPIs are key performance indicators: numbers that help you understand how an activity is performing. The PMS shows booked revenue, occupancy, ADR and RevPAR. Always check the period, included properties and data completeness. A single KPI does not establish profit.'],
    ['cashflow',/\bcash\s?flow\b|flusso (?:di )?cassa/,
      'Cashflow: è il flusso di cassa. Nel simulatore è il ricavo annuo meno commissioni, costi operativi, imposte del modello e rate del mutuo. Se resta positivo, il modello stima un avanzo; se è negativo, stima un fabbisogno. Le prenotazioni PMS da sole non dimostrano incassi o cashflow effettivo.',
      'Cashflow is cash flow. In the simulator it is annual revenue minus commissions, operating costs, model taxes and loan payments. A positive result is an estimated surplus; a negative result is an estimated funding need. PMS bookings alone do not establish actual receipts or cashflow.'],
    ['roi',/\broi\b|return on (?:equity|investment)/,
      'ROI equity: cashflow annuo stimato ÷ capitale proprio × 100. Con capitale proprio zero è N/A, non 0% o infinito. Il rendimento sull’immobile usa una base diversa: controlla sempre il denominatore.',
      'Equity ROI: estimated annual cashflow ÷ invested equity × 100. With zero equity it is N/A, not 0% or infinity. Property return uses a different base: always check the denominator.'],
    ['adr',/\badr\b|average daily rate|tariffa media/,
      'ADR: tariffa media per notte prenotata. Nel PMS è ricavo attribuito al periodo ÷ notti prenotate. Esempio illustrativo: 600 € su 4 notti = 150 € per notte. Non è un utile netto.',
      'ADR is the average rate per booked night. In the PMS it is revenue allocated to the period ÷ booked nights. Illustrative example: €600 over 4 nights = €150 per night. It is not net profit.'],
    ['revpar',/\brevpar\b|revenue per available/,
      'RevPAR: ricavo per notte disponibile. Nel PMS è ricavo del periodo ÷ notti disponibili. Esempio illustrativo: 600 € su 10 notti disponibili = 60 €. Il modello assume una unità disponibile al giorno per immobile, senza sottrarre chiusure non registrate.',
      'RevPAR is revenue per available night: period revenue ÷ available nights. Illustrative example: €600 over 10 available nights = €60. The PMS model assumes one available unit per property per day, without deducting unrecorded closures.'],
    ['occupancy',/occupazion|occupancy/,
      'Occupazione: quota di notti occupate rispetto a quelle disponibili. Esempio illustrativo: 6 notti occupate su 10 disponibili = 60%. Nel PMS il dato dipende dal calendario registrato e dalla disponibilità ipotizzata.',
      'Occupancy is occupied nights divided by available nights. Illustrative example: 6 occupied nights out of 10 available = 60%. PMS occupancy depends on the recorded calendar and assumed availability.'],
    ['dscr',/\bdscr\b|debt service coverage/,
      'DSCR: misura la copertura delle rate annue tramite il NOI del modello, prima delle imposte sul reddito. Formula: NOI ÷ servizio annuo del debito. Sotto 1 il NOI non copre le rate. Senza debito il rapporto non è applicabile; non certifica l’approvazione bancaria.',
      'DSCR measures annual debt-payment coverage using model NOI before income tax: NOI ÷ annual debt service. Below 1, NOI does not cover debt payments. With no debt, the ratio is not applicable; it does not certify lender approval.'],
    ['ltv',/\bltv\b|loan.to.value/,
      'LTV: rapporto tra mutuo e valore/prezzo dell’immobile usato nel modello. Formula: mutuo ÷ valore × 100. Un LTV maggiore indica più leva finanziaria; non è una conferma che la banca concederà quel mutuo.',
      'LTV is loan-to-value: loan ÷ the property value/price used in the model × 100. Higher LTV means greater leverage; it does not confirm that a lender will grant that loan.'],
    ['payback',/break[ -]?even|recupero (?:dell[’']?|del )?equity|equity payback/,
      'Recupero equity: anni teorici per recuperare il capitale proprio con cashflow annuo positivo e costante: capitale ÷ cashflow. Non è una previsione garantita. Con capitale zero o cashflow non positivo il tempo di recupero non è applicabile. Il pareggio di occupazione è invece la soglia di notti necessaria a coprire i costi del modello.',
      'Equity payback is the theoretical time to recover equity at constant positive annual cashflow: equity ÷ cashflow. It is not a guaranteed forecast. With zero equity or non-positive cashflow, payback is not applicable. Break-even occupancy instead measures the nights needed to cover model costs.'],
    ['noi',/\bil noi\b|net operating income|margine operativo|^(?:(?:che )?cos['’]?e|cosa (?:significa|vuol dire|vuole dire)|spiegami) (?:il )?noi[?.!]*$|\b(?:what is|explain|definition of|meaning of) (?:the )?noi\b/,
      'NOI: ricavi meno commissioni e costi operativi del modello, prima delle imposte sul reddito e delle rate del mutuo. Non coincide con il cashflow dopo mutuo.',
      'NOI is revenue minus model commissions and operating costs, before income tax and loan payments. It differs from after-loan cashflow.']
  ].filter(([,pattern])=>pattern.test(q));
  // Keep the detailed existing ROI/zero-equity explanation for ROI-only requests.
  if(!entries.length || (entries.some(e=>e[0]==='roi') && entries.every(e=>['roi','equity'].includes(e[0]))))return null;
  return {type:'education',confidence:1,actions:[],
    textIT:entries.map(e=>e[2]).join('\n\n')+'\n\nQuesti esempi spiegano il metodo e non sono dati del tuo account. Vuoi una spiegazione di base o leggere un indicatore della tua analisi o del PMS?',
    textEN:entries.map(e=>e[3]).join('\n\n')+'\n\nThese examples explain the method and are not your account data. Would you like a basic explanation or help reading a metric in your analysis or PMS?',
    metadata:{source:'calculation_method',terms:entries.map(e=>e[0])}};
};

// RC193: separate commercial scope from tourism revenue and cached account values.
// Contextual commercial analysis is not available in this public MVP.
window.rbBuildCommercialPropertyResponse = function(message){
 const q=String(message||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 if(/\b(?:mio|my)\s+pms\b/.test(q)||/\b(?:pdf|documento|document|file|brochure|report)\b/.test(q)&&/leggi|analizza|nel pdf|dal pdf|read|analy[sz]e|this pdf|my pdf/.test(q))return null;
 if(!/immobil\w* commercial\w*|local\w* commercial\w*|locazion\w* commercial\w*|(?:pdf|report)\s+commercial\w*|commercial\s+(?:propert|rent|lease|pdf|report)|\buffici\b|\boffices?\b|studi[o]?\s+(?:medic\w*|profession\w*|condivis\w*|sanitar\w*|dentistic\w*)|shared\s+(?:professional\s+)?(?:rooms?|spaces?)|polistud\w*|professional\s+(?:studios?|rooms?)|stanze.{0,35}professionist|\b305\b.*(?:mezza giornata|half.day)|(?:mezza giornata|half.day).*\b305\b/.test(q))return null;
 return {type:'commercial_property_scope',confidence:1,actions:[],metadata:{source:'commercial_mvp_scope',route:'/immobili-commerciali/',readsSimulation:false},
 textIT:'Per uffici, locali e studi professionali usa il nuovo modulo “Analisi immobili commerciali”: /immobili-commerciali/ . Il ricavo dipende da canoni e fasce contrattuali, non da ADR, RevPAR o occupazione turistica.\n\n305 € al mese per una fascia settimanale e 305 € per ogni utilizzo sono tariffe diverse: scegli l’unità esplicitamente. I mesi parziali usano i giorni di contratto; il prezzo per utilizzo usa il calendario effettivo, escluse le chiusure. Ricavi attesi = ricavi contrattuali × quota attesa. Margine = ricavi senza IVA meno costi; cashflow del modello = margine meno rate, prima delle imposte sul reddito. Valore già posseduto e nuovo capitale sono distinti.\n\nL’IVA va configurata, senza aliquote automatiche; se resta da verificare, i risultati netti sono N/A. Le cifre della demo sono fittizie, non benchmark di mercato. Analizziamo l’immobile, non i ricavi medici: niente pazienti o dati sanitari. Contratti, fiscalità e idoneità richiedono verifiche con professionisti competenti.\n\nQuesto MVP pubblico lavora solo nella pagina: nessun salvataggio account, PDF commerciale o Autopilot operativo. Non posso leggere i valori della tua simulazione commerciale né confermare incassi. Salvataggi, report e assistenza contestuale sono sviluppi successivi; la prova Investor resta di 30 giorni e non include PDF.',
 textEN:'For offices, commercial units and professional rooms use the new “Commercial property analysis” module: /en/immobili-commerciali/ . Revenue comes from contracts and reserved slots, not tourist ADR, RevPAR or occupancy.\n\n€305 monthly for a weekly slot and €305 for each use are different tariffs: choose the basis explicitly. Partial months use contract days; per-use pricing uses actual calendar slots, excluding closures. Expected revenue = contractual revenue × expected share. Margin = revenue excluding VAT minus costs; model cashflow = margin minus debt payments, before income tax. Already-owned asset value and new capital are distinct.\n\nVAT must be configured without an automatic rate; unverified VAT makes net results N/A. Demo figures are fictional, not market benchmarks. We analyse the property, not medical revenue: no patients or health data. Contracts, taxes and suitability require qualified professional checks.\n\nThis public MVP works within its page: no account saving, commercial PDFs or operational Autopilot. I cannot read your commercial simulation values or verify receipts. Saving, reporting and contextual assistance are future work; Investor remains a 30-day trial without PDFs.'};
};

window.rbProcessAIMessage =
async function(message){

  try{

    // =========================================
    // 🧹 NORMALIZE
    // =========================================

    const text =

      (window.rbNormalizeAIQuery?.(message)?.text ?? String(message || ""))
        .trim();

    const portalFinancialBoundary=window.rbBuildPortalFinancialBoundary?.(text);
    if(!portalFinancialBoundary)window.rbPreparePortalContext?.(text);
    const privacyResponse = window.rbBuildAccountPrivacyResponse(text);
    if(privacyResponse)return {success:true,response:privacyResponse,intent:{intent:'account_privacy'}};

    const limitsResponse = window.rbBuildProductLimitsResponse(text);
    if(limitsResponse) return {success:true,response:limitsResponse,intent:{intent:'product_limits'}};

    const listingEvidence = window.rbBuildListingEvidenceResponse(text);
    if(listingEvidence)return {success:true,response:listingEvidence,intent:{intent:'listing_evidence'}};

    const scopeResponse = window.rbBuildRealEstateScopeResponse(text);
    if(scopeResponse)return {success:true,response:scopeResponse,intent:{intent:'real_estate_scope'}};


    // Explain model limits before reading remembered financial values.
    const safetyQuery=text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    if(!/\bpdf\b|document|brochure/.test(safetyQuery)){
      const riskMeaning=/rischio|risk/.test(safetyQuery)&&/probabil|percentuale.*perd|possibilita.*perd/.test(safetyQuery);
      const bankGuarantee=/mutuo|mortgage|banca|bank|finanziament|loan/.test(safetyQuery)&&/garanti|guarante|sicuro|sicuramente|certain|assicurat/.test(safetyQuery);
      if(riskMeaning||bankGuarantee)return {success:true,intent:{intent:'model_limits'},response:{type:'model_limits',confidence:1,actions:[],metadata:{source:'calculation_method'},
        textIT:riskMeaning?'L’indice rischio del modello non è una probabilità di perdita: 40/100 non significa il 40% di possibilità di perdere denaro. Riassume alcuni fattori delle ipotesi disponibili e non misura tutti i rischi. Non garantisce un risultato né verifica l’immobile.':'Non posso garantire l’approvazione di un mutuo. Rata, LTV e DSCR sono calcoli sulle ipotesi inserite, non una delibera bancaria. Servono una valutazione della banca, documenti e condizioni effettive; non deduco l’esito da vecchie simulazioni.',
        textEN:riskMeaning?'The model risk index is not a probability of loss: 40/100 does not mean a 40% chance of losing money. It summarises some factors from available assumptions and does not measure every risk. It does not guarantee an outcome or verify the property.':'I cannot guarantee mortgage approval. Payments, LTV and DSCR are calculations based on inputs, not a lending decision. Approval requires the lender’s assessment, documentation and actual terms; I will not infer it from old simulations.'}};
    }

    const focusedEvidencePDF = window.rbDocumentManager?.getLast?.();
    const preserveEvidencePDF = focusedEvidencePDF?.id && window.rbPDFConversationDocumentId === focusedEvidencePDF.id && !/mercato|market|altra citt|another city/i.test(text);
    const commercialScope = !preserveEvidencePDF && window.rbBuildCommercialPropertyResponse(text);
    if(commercialScope)return {success:true,response:commercialScope,intent:{intent:'commercial_property_scope'}};

    const importGuide=window.rbBuildBookingImportGuide?.(text);
    if(importGuide)return {success:true,response:importGuide,intent:{intent:'booking_import_guide'}};

    const reportGuide=window.rbBuildProReportGuide?.(text);
    if(reportGuide){
      if(reportGuide.metadata?.source==='extracted_pdf_text' && reportGuide.metadata.documentId)window.rbPDFConversationDocumentId=reportGuide.metadata.documentId;
      return {success:true,response:reportGuide,intent:{intent:'pro_report_guide'}};
    }

    // Source questions must be answered before generic external-data fallbacks.
    const marketEvidence=!preserveEvidencePDF && !/\b(?:free|investor|pro|piano|plan|trial|subscription)\b/i.test(text) && !/\b(?:pdf|documento|document|file|brochure)\b/i.test(text) && window.rbBuildMarketEvidenceResponse?.(text);
    if(marketEvidence)return {success:true,response:marketEvidence,intent:{intent:"market_provenance"}};

    const practicalGuide=window.rbBuildPracticalGuide?.(text);
    if(practicalGuide)return {success:true,response:practicalGuide,intent:{intent:'practical_guide'}};

    const nextStepGuide=window.rbBuildNextStepGuide?.(text);
    if(nextStepGuide)return {success:true,response:nextStepGuide,intent:{intent:'guided_next_step'}};

    // Product questions must not be swallowed by active PDFs or PMS prompts.
    const productQuestion = /\b(free|investor|pro|abbonamenti?|subscriptions?|trial|tester)\b|prova gratuit[ao]|prova gratis|prova.{0,30}(?:7|sette|30|trenta).{0,8}giorni|recesso|withdrawal|withdraw from|(?:prezzi|pricing).*pian/i.test(text);
    if(productQuestion && window.rbGenerateResponse){
      const productResponse=window.rbGenerateResponse({message:text,intent:{intent:'subscriptions'}});
      if(productResponse?.type==='subscriptions')return {success:true,response:productResponse,intent:{intent:'subscriptions'}};
    }

    if(/^roy[?!\.\s]*$/i.test(text) && !(window.rbDocumentManager?.getLast?.()?.id && window.rbPDFConversationDocumentId===window.rbDocumentManager.getLast().id))return {success:true,response:{type:'clarification',confidence:0,textIT:'Intendi il ROI dell’investimento? Dimmi se vuoi la definizione o leggere il rendimento della tua analisi.',textEN:'Do you mean investment ROI? Tell me whether you want its definition or the return from your analysis.',actions:[]},intent:{intent:'clarification'}};
    // Handle explicit document requests once before the multi-intent/live pipeline.
    const activePDF = window.rbDocumentManager?.getLast?.();
    const explicitPDFRequest = /(pdf|document|file|brochure|riassumilo|interpretalo|leggilo|confrontalo|summarize it|read it)/i.test(text);
    const explicitLiveRequest = /simulazion|simulation|simulator|simulatore|autopilot investimento|investment autopilot|mercato|market|altra citt|another city/i.test(text);
    const focusedFinancialFollowup = activePDF?.id && window.rbPDFConversationDocumentId === activePDF.id &&
        /(utile|profit|net income|margin|incassi|receipts|risultat|results|ristruttur|renovat|recuper|recover|costi|costs|indicatori|indicators|metriche|metrics|punteggio|score|dscr|benchmark|riconosciut|recognized|roi|roy|adr|revpar|occupazion|occupancy|miglior|prossim|da dove|cosa fare|cosa faccio|non capisco|next step|what should i|where do i|cashflow|cash flow|rischio|risk|ricavi|revenue|mutuo|mortgage|capitale|equity|manc|missing|convien|worth|sostenib|interpret)/i.test(text) &&
        !explicitLiveRequest;
    const pdfRequest = explicitPDFRequest || focusedFinancialFollowup;
    const planRequest = /\b(free|investor|pro|piano|plan|abbonamento|subscription)\b/i.test(text);
    if(activePDF && pdfRequest && !planRequest && window.rbGenerateResponse){
        const response = window.rbGenerateResponse({message:explicitPDFRequest ? text : `${text} (PDF corrente)`,documentKnowledge:{activeDocument:activePDF},analysisData:window.rbChatbotLive || window.lastAnalysisData || {}});
        if(["document_grounded","document_data_quality","document_unavailable"].includes(response?.type)){
            window.rbPDFConversationDocumentId = activePDF.id;
            window.rbRememberMessage?.({role:"user",message:text,intent:{intent:"pdf_analysis"}});
            return {success:true,response,intent:{intent:"pdf_analysis"}};
        }
    }


    // Preserve explicit/focused PDF interpretation, then answer public live-rate requests
    // before the general pipeline can classify them as incomplete quick simulations.
    const currentRateResponse = !(activePDF && pdfRequest) && window.rbBuildCurrentMortgageRateResponse?.(text);
    if(currentRateResponse)return {success:true,response:currentRateResponse,intent:{intent:'mortgage_rates_unavailable'}};

    const metricEducation = !pdfRequest && !planRequest && window.rbBuildMetricEducationResponse(text);
    if(metricEducation)return {success:true,response:metricEducation,intent:{intent:'education'}};

    if(portalFinancialBoundary)return {success:true,response:portalFinancialBoundary,intent:{intent:'portal_financial_boundary'}};

    // Educational questions do not require a completed simulation. Keep
    // explicit/current PDF requests above this route so document evidence wins.
    const educationalQuery = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const asksROIMeaning = /\b(definizione|definition|significa|meaning|spiega|spiegami|spieghi|explain)\b|che cos['’]?e|che cosa e|cosa (?:vuol|vuole) dire|what is|what does.*(?:mean|stand for)|how.*(?:calculat|work)|come.*calcol/.test(educationalQuery) || (rbAsksPlainMetricMeaning(educationalQuery) && !/\b(?:mio|mia|miei|mie|my|actual|effettiv[oaie]|reale)\b/.test(educationalQuery) && !/\d/.test(educationalQuery));
    const mentionsROI = /\broi\b|return on (equity|investment)|rendimento.*capitale/.test(educationalQuery);
    const mentionsZeroEquity = /(?:capitale(?: proprio)?|equity)[^.!?\n]{0,40}(?:\bzero\b|\b0\b|\bnullo\b)|(?:\bzero\b|\b0\b|\bnullo\b)[^.!?\n]{0,40}(?:capitale(?: proprio)?|equity)|senza capitale proprio|no equity|no own capital/.test(educationalQuery);
    if(mentionsROI && (asksROIMeaning || mentionsZeroEquity) && !pdfRequest && !planRequest){
      return {success:true,intent:{intent:'education'},response:{
        type:'education',confidence:1,
        textIT:'Il ROI sul capitale proprio confronta il cashflow annuo stimato, dopo i costi, le imposte e le rate previste dal modello, con il capitale proprio investito: cashflow annuo ÷ capitale proprio × 100.\n\nSe il capitale proprio è zero, il denominatore è zero: il ROI equity e il recupero dell’equity sono N/A, non 0% e non un rendimento infinito. Questa componente è esclusa da rischio e punteggio; restano cashflow, leva, copertura del debito e occupazione. Valuta anche il rendimento sull’immobile, specificando la sua base di calcolo.\n\nÈ una spiegazione del metodo, non una valutazione del tuo investimento. Un finanziamento al 100% non implica approvazione bancaria: verifica anche costi accessori, riserva di liquidità e condizioni effettive.',
        textEN:'Return on equity compares estimated annual cash flow, after the costs, taxes and loan payments included in the model, with invested equity: annual cash flow ÷ equity × 100.\n\nWith zero equity, the denominator is zero: equity ROI and equity payback are N/A, rather than 0% or an infinite return. This component is excluded from risk and scoring; cash flow, leverage, debt coverage and occupancy still apply. Also assess the property return, stating its calculation basis.\n\nThis explains the method; it does not assess your investment. Full financing does not imply bank approval: check purchase costs, cash reserves and actual financing terms.',
        suggestionsIT:['Controlla i dati','Leggi la mia analisi'],suggestionsEN:['Review the simulator inputs','Read my analysis'],actions:[],signals:['roi_method_explained'],metadata:{source:'calculation_method'}
      }};
    }


    window.rbPDFConversationDocumentId = null;

    // Rebuild complete account totals after a filtered view, retaining ownership checks.
    const readPortalFacts=async()=>{
      let response=window.rbBuildPortalResponse?.(text);
      if(response?.metadata?.answerMode==='unavailable' && typeof window.rbRefreshPortalSnapshot==='function'){
        try{await window.rbRefreshPortalSnapshot();}catch{/* Preserve the unavailable response. */}
        response=window.rbBuildPortalResponse?.(text);
      }
      return response;
    };

    const recoveryResponse=window.rbBuildRenovationRecoveryResponse?.(text);
    if(recoveryResponse){
      window.rbPDFConversationDocumentId=null;
      return {success:true,response:recoveryResponse,intent:{intent:'renovation_recovery'}};
    }
    const portfolioResponse=window.rbBuildConfirmedPortfolioResponse?.(text);
    if(portfolioResponse){
      window.rbPDFConversationDocumentId=null;
      window.rbRememberMessage?.({role:'user',message:text,intent:{intent:'confirmed_portfolio'}});
      return {success:true,response:portfolioResponse,intent:{intent:'confirmed_portfolio'}};
    }

    // Explicit operating-performance questions must not become market benchmarks while records load.
    if(/come sta andando|how is .+perform/i.test(text) && !/simulazion|simulation|\bpdf\b|document|mutuo|mortgage|\broi\b/i.test(text)){
      const performanceResponse=await readPortalFacts();
      if(performanceResponse)return {success:true,response:performanceResponse,intent:{intent:'portal_facts'}};
    }

    const investmentResponse=window.rbBuildInvestmentAutopilotResponse?.(text);
    if(investmentResponse){
      window.rbPDFConversationDocumentId=null;
      window.rbRememberMessage?.({role:'user',message:text,intent:{intent:'investment_autopilot'}});
      return {success:true,response:investmentResponse,intent:{intent:'investment_autopilot'}};
    }

    const autopilotResponse=await window.rbBuildPMSAutopilotResponse?.(text);
    if(autopilotResponse){
      window.rbPDFConversationDocumentId=null;
      window.rbRememberMessage?.({role:'user',message:text,intent:{intent:'pms_autopilot_daily'}});
      return {success:true,response:autopilotResponse,intent:{intent:'pms_autopilot_daily'}};
    }

    const portalResponse = await readPortalFacts();
    if(portalResponse){
      window.rbPDFConversationDocumentId = null;
      window.rbRememberMessage?.({role:"user",message:text,intent:{intent:"portal_facts"}});
      return {success:true,response:portalResponse,intent:{intent:"portal_facts"}};
    }

    // =========================================
    // 🧠 ENTITY EXTRACTION
    // =========================================

    const entities =

      window.rbExtractEntities

      ? window.rbExtractEntities(text)

      : {};

// =========================================
// 🧠 MULTI INTENT DETECTION
// =========================================

let detectedIntent =

  window.rbDetectIntent

    ? window.rbDetectIntent(text)

    : {

        intent: "generic"

      };

// =========================================
// 🏨 LIVE PMS GUEST + PRICING OVERRIDE
// =========================================

const normalizedMessage = text
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");
const liveBookingList = Array.isArray(window.rbPMSData?.bookingList)
  ? window.rbPMSData.bookingList
  : [];
const mentionsKnownGuest = liveBookingList.some(booking =>
  String(booking?.guestName || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\s+/)
    .filter(token => token.length >= 3)
    .some(token => normalizedMessage.includes(token))
);
const mentionsBookingPricing =
  /tariff|prezz|stagion|pricing|priced|\bprices?\b|\brates?\b|\badr\b|nightly|per night|a notte|convenient|worth/.test(
    normalizedMessage
  );
const hasPendingBookingRequests = liveBookingList.some(
  booking => String(booking?.status || "").toLowerCase() === "pending"
);
const mentionsBookingRequests =
  /richiest|requests?|pending booking|awaiting confirmation/.test(normalizedMessage);
const hasBookingRequestContext =
  hasPendingBookingRequests ||
  /soggiorn|stay|booking|reservation|confirmation/.test(normalizedMessage);
const hasOpenGuestIssues = liveBookingList.some(booking =>
  booking?.guestIssue?.active === true &&
  String(booking.guestIssue.status || "open") !== "resolved"
);
const mentionsGuestIssues =
  /segnal|problemi?.*ospit|guast|guest issues?|guest problems?|guests?.*(reported|issues?|problems?)|report(ed)?.*(issue|problem)/.test(normalizedMessage);

if(mentionsKnownGuest && mentionsBookingPricing){
  detectedIntent = {
    ...detectedIntent,
    intent: "pms_bookings",
    category: "pms",
    confidence: 0.99,
    priority: 320
  };
}

if(mentionsBookingRequests && hasBookingRequestContext){
  detectedIntent = {
    ...detectedIntent,
    intent: "pms_bookings",
    category: "pms",
    confidence: 0.99,
    priority: 320
  };
}

if(mentionsGuestIssues && (hasOpenGuestIssues || /ospit|guest|soggiorn|stay/.test(normalizedMessage))){
  detectedIntent = {
    ...detectedIntent,
    intent: "pms_bookings",
    category: "pms",
    confidence: 0.99,
    priority: 320
  };
}

if(window.RB_DEBUG === true){

  (void 0)


;

}
 // =========================================
// 🧠 INTENT PRIORITY ENGINE
// =========================================

const intentPriority = {

    pms_renovation:110,

    simulation_summary:101,

    investment_strategy:96,

    investment_advisor:97,

    investment_executive:100,

    improvement_advisor:95,

    portfolio_growth:90,

    portfolio_analysis:85,

    comparison:84,

    report_interpretation:83,

    mortgage_analysis:82,

    roi_analysis:80,

    cashflow_analysis:79,

    risk_analysis:78,

    market_analysis:75,

    education:40,

    greeting:10,

    generic:0

};   

// =========================================
// 🧠 MULTI INTENT SYSTEM 2.0
// =========================================

const intents = [];

// =========================================
// 🎓 EDUCATION
// =========================================

if(
  detectedIntent.intent ===
  "education"
){

  intents.push(
    "education"
  );

}

// =========================================
// 📈 ROI
// =========================================

if(

  text.includes("roi") ||

  text.includes("rendimento")

){

  intents.push(
    "roi_analysis"
  );

}

// =========================================
// ⚠️ RISK
// =========================================

if(

  text.includes("rischio") ||

  text.includes("risk")

){

  intents.push(
    "risk_analysis"
  );

}

// =========================================
// 💸 CASHFLOW
// =========================================

if(

  (
    text.includes("cashflow") ||

    text.includes("profitto")
  )

  &&

  detectedIntent.intent !==
  "portfolio_growth"

){

  intents.push(
    "cashflow_analysis"
  );

}

// =========================================
// 🏨 PMS
// =========================================

if(

  [

    "pms_overview",
    "pms_analysis",
    "pms_bookings",
    "pms_arrivals",
    "pms_checkins",
    "pms_checkouts",
    "pms_revenue",
    "pms_occupancy",
    "pms_adr",
    "pms_guests",
    "pms_renovation"

  ].includes(
    detectedIntent.intent
  )

){

  intents.push(
    detectedIntent.intent
  );

}

// =========================================
// 🏆 PORTFOLIO / HISTORY
// =========================================

if(

  [
    "best_simulation",
    "best_city",
    "portfolio_analysis",
    "property_performance",
    "comparison"
  ].includes(
    detectedIntent.intent
  )

){

  intents.push(
    detectedIntent.intent
  );

}    

// =========================================
// 🏦 MORTGAGE
// =========================================

if(

  text.includes("mutuo") ||

  text.includes("mortgage")

){

  intents.push(
    "mortgage_analysis"
  );

}

// 🌍 MARKET

if(

  (
    text.includes("mercato") ||
    text.includes("market")
  )

  &&

  ![
    "best_simulation",
    "best_city",
    "portfolio_analysis",
    "property_performance",
    "comparison"
  ].includes(
    detectedIntent.intent
  )

){

  intents.push(
    "market_analysis"
  );

}

// =========================================
// 🧠 EXECUTIVE
// =========================================

if(

  detectedIntent.intent === "simulation_summary"

){

  intents.push(
    "simulation_summary"
  );

}

if(

  detectedIntent.intent === "investment_executive"

){

  intents.push(
    "investment_executive"
  );

}

// =========================================
// 💼 INVESTMENT ADVISOR
// =========================================

if(

  detectedIntent.intent === "investment_advisor"

){

  intents.push(
    "investment_advisor"
  );

}

// =========================================
// 🧠 INVESTMENT STRATEGY
// =========================================

if(

  detectedIntent.intent === "investment_strategy"

){

  intents.push(
    "investment_strategy"
  );

}

// =========================================
// 📈 IMPROVEMENT ADVISOR
// =========================================

if(

  detectedIntent.intent ===
  "improvement_advisor"

){

  intents.push(
    "improvement_advisor"
  );

}    

// =========================================
// 🔥 REMOVE DUPLICATES
// =========================================

const uniqueIntents = [

  ...new Set(intents)

];

uniqueIntents.sort(

    (a,b)=>

        (intentPriority[b] || 0)

        -

        (intentPriority[a] || 0)

);    

// =========================================
// 🔥 EXECUTIVE OVERRIDE
// =========================================

if(

  uniqueIntents.includes(
    "investment_executive"
  )

){

  uniqueIntents.length = 0;

  uniqueIntents.push(
    "investment_executive"
  );

}    

if(

  uniqueIntents.includes(
    "improvement_advisor"
  )

){

  uniqueIntents.length = 0;

  uniqueIntents.push(
    "improvement_advisor"
  );

}    

// =========================================
// 🏢 PORTFOLIO OVERRIDE
// =========================================

if(

  uniqueIntents.includes(
    "portfolio_growth"
  )

){

  uniqueIntents.length = 0;

  uniqueIntents.push(
    "portfolio_growth"
  );

}    

// =========================================
// 🧠 FALLBACK
// =========================================

if(!uniqueIntents.length){

  uniqueIntents.push(

    detectedIntent.intent ||

    "generic"

  );

}

    const intent = {

  ...detectedIntent,

  intents:
    uniqueIntents

};

  if(window.RB_DEBUG === true){

  (void 0)


;

}
    // =========================================
    // 🧠 MEMORY
    // =========================================

    const memory =

  window.rbGetConversationContext

  ? window.rbGetConversationContext()

  : {};

// =========================================
// 🧠 INVESTOR PROFILE
// =========================================

const investorProfile =

  window.rbUpdateInvestorProfile

  ? window.rbUpdateInvestorProfile({

      entities,

      analysisData:
        window.lastAnalysisData || {},

      memory:
        memory || {}

    })

  : {};

// =========================================
// 📊 ANALYSIS DATA
// =========================================

const investmentHistory =

  Array.isArray(
    window.rbChatMemory?.investmentHistory
  )

    ? window.rbChatMemory.investmentHistory

    : [];

const latestRememberedInvestment =

  investmentHistory.length > 0

    ? (
        investmentHistory[
          investmentHistory.length - 1
        ] || {}
      )

    : {};

const rememberedGrossRevenue =

  Number(
    latestRememberedInvestment.gross ??
    latestRememberedInvestment.revenueAnnual ??
    0
  );

const rememberedOccupancy =

  Number(
    latestRememberedInvestment.occupancy ??
    window.rbChatMemory?.lastOccupancy ??
    0
  );

const storedRememberedPriceNight =

  Number(
    latestRememberedInvestment.priceNight ??
    latestRememberedInvestment.adr ??
    latestRememberedInvestment.nightlyRate ??
    0
  );

const derivedRememberedPriceNight =

  storedRememberedPriceNight > 0

    ? storedRememberedPriceNight

    : (
        rememberedGrossRevenue > 0 &&
        rememberedOccupancy > 0 &&
        rememberedOccupancy <= 100

          ? (
              rememberedGrossRevenue /
              (
                365 *
                (
                  rememberedOccupancy / 100
                )
              )
            )

          : null
      );    

const rememberedAnalysis = {

  realROI:

    latestRememberedInvestment.realROI ??

    window.rbChatMemory?.lastROI,

  roi:

    latestRememberedInvestment.roi ??

    window.rbChatMemory?.lastROI,

  risk:

    latestRememberedInvestment.risk ??

    window.rbChatMemory?.lastRisk,

  occupancy:

    latestRememberedInvestment.occupancy ??

    window.rbChatMemory?.lastOccupancy,

  net:

    latestRememberedInvestment.net ??

    latestRememberedInvestment.cashflow ??

    window.rbChatMemory?.lastCashflow,

  annualProfit:

    latestRememberedInvestment.annualProfit ??

    latestRememberedInvestment.net ??

    latestRememberedInvestment.cashflow ??

    window.rbChatMemory?.lastCashflow,

  cashflow:

    latestRememberedInvestment.cashflow ??

    latestRememberedInvestment.net ??

    window.rbChatMemory?.lastCashflow,

  gross:

    latestRememberedInvestment.gross ??

    latestRememberedInvestment.revenueAnnual ??

    window.rbChatMemory?.lastRevenue,

    priceNight:

    derivedRememberedPriceNight,

  expenses:

    latestRememberedInvestment.expenses ??

    window.rbChatMemory?.lastExpenses,

  propertyPrice:

    latestRememberedInvestment.propertyPrice ??

    latestRememberedInvestment.price ??

    window.rbChatMemory?.lastPropertyPrice,

  equity:

    latestRememberedInvestment.equity ??

    window.rbChatMemory?.lastEquity,

  loanAmount:

    latestRememberedInvestment.loanAmount ??

    latestRememberedInvestment.mortgage ??

    window.rbChatMemory?.lastLoanAmount,

  mortgage:

    latestRememberedInvestment.mortgage ??

    latestRememberedInvestment.loanAmount ??

    window.rbChatMemory?.lastLoanAmount,

  mortgagePercent:

    latestRememberedInvestment.mortgagePercent ??

    window.rbChatMemory?.lastMortgagePercent,

  city:

    latestRememberedInvestment.city ??

    window.rbChatMemory?.lastCity

};

const analysisData = {

  ...rememberedAnalysis,
  ...(window.lastAnalysisData || {}),

  // =====================================
  // 📊 ROI DETERMINISTICO
  // =====================================

  // Usa il ROI reale dell’investimento.
  // visualROI rimane disponibile separatamente.
roi:

  window.lastAnalysisData?.visualROI ??

  window.lastAnalysisData?.roi ??

  window.lastAnalysisData?.safeROI ??

  rememberedAnalysis.roi ??

  window.lastAnalysisData?.realROI ??

  rememberedAnalysis.realROI ??

  (
    Number(
      document.getElementById("roi-value")
        ?.textContent
        ?.replace("%", "")
        ?.trim()
    ) || 0
  ),

  // =====================================
  // ⚠️ RISK & OCCUPANCY
  // =====================================

  risk:

    Number(
      document.getElementById("risk-score")
        ?.textContent
        ?.replace("/100", "")
        ?.trim()
    ) ||

    window.lastAnalysisData?.risk ||

    rememberedAnalysis.risk ||

    0,

  occupancy:

    Number(
      document.getElementById("occupancy-rate")
        ?.textContent
        ?.replace("%", "")
        ?.trim()
    ) ||

    window.lastAnalysisData?.occupancy ||

    rememberedAnalysis.occupancy ||

    0,

  // =====================================
  // 💰 NORMALIZED PROFIT DATA
  // =====================================

  net:

    window.lastAnalysisData?.net ??

    window.lastAnalysisData?.profit ??

    window.lastAnalysisData?.netAfterMortgage ??

    rememberedAnalysis.net ??

    0,

  annualProfit:

    window.lastAnalysisData?.annualProfit ??

    window.lastAnalysisData?.profit ??

    window.lastAnalysisData?.netAfterMortgage ??

    rememberedAnalysis.annualProfit ??

    0,

  cashflow:

    window.lastAnalysisData?.cashflow ??

    window.lastAnalysisData?.net ??

    window.lastAnalysisData?.profit ??

    window.lastAnalysisData?.netAfterMortgage ??

    window.lastAnalysisData?.annualProfit ??

    rememberedAnalysis.cashflow ??

    0,

  gross:

    window.lastAnalysisData?.gross ??

    window.lastAnalysisData?.revenueAnnual ??

    rememberedAnalysis.gross ??

    0,

    // =====================================
  // 🧮 ROI ENGINE INPUTS
  // Same inputs used by the canonical simulator
  // =====================================

  priceNight:

    Number(
      window.lastAnalysisData?.priceNight ??
      window.rbChatbotData?.priceNight ??
      rememberedAnalysis.priceNight ??
      document.getElementById("priceNight")?.value ??
      100
    ),

  expenses:

    Number(
      window.lastAnalysisData?.expenses ??
      window.rbChatbotData?.expenses ??
      rememberedAnalysis.expenses ??
      document.getElementById("expenses")?.value ??
      30
    ),

  commission:

    Number(
      window.lastAnalysisData?.commission ??
      document.getElementById("commission")?.value ??
      15
    ),

  tax:

    Number(
      window.lastAnalysisData?.tax ??
      document.getElementById("tax")?.value ??
      21
    ),

  interestRate:

    Number(
      window.lastAnalysisData?.interestRate ??
      document.getElementById("interestRate")?.value ??
      3.5
    ),

  loanYears:

    Number(
      window.lastAnalysisData?.loanYears ??
      document.getElementById("loanYears")?.value ??
      20
    ),

  // =====================================
  // 🏦 MORTGAGE DATA
  // =====================================

  propertyPrice:

    window.lastAnalysisData?.propertyPrice ??

    window.lastAnalysisData?.price ??

    rememberedAnalysis.propertyPrice ??

    0,

  equity:

    window.lastAnalysisData?.equity ??

    window.lastAnalysisData?.initialCapital ??

    rememberedAnalysis.equity ??

    0,

  loanAmount:

    window.lastAnalysisData?.loanAmount ??

    window.lastAnalysisData?.mortgage ??

    rememberedAnalysis.loanAmount ??

    rememberedAnalysis.mortgage ??

    0,

  mortgage:

    window.lastAnalysisData?.mortgage ??

    window.lastAnalysisData?.loanAmount ??

    rememberedAnalysis.mortgage ??

    rememberedAnalysis.loanAmount ??

    0,

  mortgagePercent:

    window.lastAnalysisData?.mortgagePercent ??

    rememberedAnalysis.mortgagePercent ??

    (
      (
        window.lastAnalysisData?.loanAmount ??

        window.lastAnalysisData?.mortgage ??

        rememberedAnalysis.loanAmount ??

        rememberedAnalysis.mortgage ??

        0
      )

      &&

      (
        window.lastAnalysisData?.propertyPrice ??

        window.lastAnalysisData?.price ??

        rememberedAnalysis.propertyPrice ??

        0
      )
    )

      ? Math.round(

          (
            (
              window.lastAnalysisData?.loanAmount ??

              window.lastAnalysisData?.mortgage ??

              rememberedAnalysis.loanAmount ??

              rememberedAnalysis.mortgage ??

              0
            )

            /

            (
              window.lastAnalysisData?.propertyPrice ??

              window.lastAnalysisData?.price ??

              rememberedAnalysis.propertyPrice ??

              1
            )

          ) * 100

        )

      : 0,

  // =====================================
  // 📍 MARKET DATA
  // =====================================

  city:

    window.currentCity ||

    window.lastAnalysisData?.city ||

    window.lastAnalysisData?.marketCity ||

    window.lastAnalysisData?.realCity ||

    rememberedAnalysis.city ||

    "roma"

};

// =====================================
// 🧠 COMBINED WHAT-IF DETECTOR
// Detects 2+ requested scenario changes.
// Detection only — no calculation yet.
// =====================================

const combinedWhatIfChanges = {

  mortgagePercent:
    entities?.mortgagePercent !== null &&
    entities?.mortgagePercent !== undefined
      ? Number(entities.mortgagePercent)
      : null,

  propertyPrice:
    entities?.price !== null &&
    entities?.price !== undefined
      ? Number(entities.price)
      : null,

  occupancy:
    entities?.occupancy !== null &&
    entities?.occupancy !== undefined &&
    Number(entities.occupancy) !==
      Number(
        window.lastAnalysisData?.occupancy ??
        analysisData.occupancy ??
        0
      )
      ? Number(entities.occupancy)
      : null,

  adr:
    (entities?.adr ?? entities?.nightly) !== null &&
    (entities?.adr ?? entities?.nightly) !== undefined
      ? Number(
          entities?.adr ??
          entities?.nightly
        )
      : null,

  monthlyCosts:
    entities?.monthlyCosts !== null &&
    entities?.monthlyCosts !== undefined &&
    entities?.monthlyCosts !== ""
      ? Number(entities.monthlyCosts)
      : null

};

const combinedWhatIfKeys =
  Object.entries(combinedWhatIfChanges)
    .filter(
      ([, value]) =>
        value !== null &&
        Number.isFinite(value)
    )
    .map(
      ([key]) => key
    );

const isCombinedWhatIf =
  combinedWhatIfKeys.length >= 2;

if(window.RB_DEBUG === true){

  (void 0)








;

}   

// =====================================
// 🧠 COMBINED WHAT-IF SCENARIO
// Applies 2+ changes in ONE ROI calculation.
// Temporary only — does NOT mutate lastAnalysisData.
// =====================================

if(isCombinedWhatIf){

  const originalPropertyPrice =
    Number(
      window.lastAnalysisData?.propertyPrice ??
      window.lastAnalysisData?.price ??
      analysisData.propertyPrice ??
      0
    );

  const originalLoanAmount =
    Number(
      window.lastAnalysisData?.loanAmount ??
      window.lastAnalysisData?.mortgage ??
      analysisData.loanAmount ??
      0
    );

  const originalEquity =
    Number(
      window.lastAnalysisData?.equity ??
      window.lastAnalysisData?.initialCapital ??
      analysisData.equity ??
      0
    );

  const originalMortgagePercent =
    Number(
      window.lastAnalysisData?.mortgagePercent ??
      (
        originalPropertyPrice > 0
          ? (originalLoanAmount / originalPropertyPrice) * 100
          : 0
      )
    );

  const originalOccupancy =
    Number(
      window.lastAnalysisData?.occupancy ??
      analysisData.occupancy ??
      0
    );

  const originalADR =
    Number(
      window.lastAnalysisData?.priceNight ??
      analysisData.priceNight ??
      0
    );

  const originalMonthlyCosts =
    Number(
      window.lastAnalysisData?.expenses ??
      window.lastAnalysisData?.monthlyCosts ??
      analysisData.expenses ??
      0
    );

  // =====================================
  // 🧠 BUILD COMBINED SCENARIO INPUTS
  // Each missing parameter keeps baseline value.
  // =====================================

  const scenarioPropertyPrice =
    combinedWhatIfChanges.propertyPrice !== null
      ? combinedWhatIfChanges.propertyPrice
      : originalPropertyPrice;

  const scenarioMortgagePercent =
    combinedWhatIfChanges.mortgagePercent !== null
      ? combinedWhatIfChanges.mortgagePercent
      : originalMortgagePercent;

  const scenarioLoanAmount =
    scenarioPropertyPrice *
    (scenarioMortgagePercent / 100);

  const scenarioEquity =
    scenarioPropertyPrice -
    scenarioLoanAmount;

  const scenarioOccupancy =
    combinedWhatIfChanges.occupancy !== null
      ? combinedWhatIfChanges.occupancy
      : originalOccupancy;

  const scenarioADR =
    combinedWhatIfChanges.adr !== null
      ? combinedWhatIfChanges.adr
      : originalADR;

  const scenarioMonthlyCosts =
    combinedWhatIfChanges.monthlyCosts !== null
      ? combinedWhatIfChanges.monthlyCosts
      : originalMonthlyCosts;

  // =====================================
  // 🧮 ONE CANONICAL ROI CALCULATION
  // =====================================

  if(
    scenarioPropertyPrice > 0 &&
    typeof window.calculateROI === "function"
  ){

    const scenarioResult =
      window.calculateROI({

        price:
          scenarioPropertyPrice,

        equity:
          scenarioEquity,

        loanAmount:
          scenarioLoanAmount,

        priceNight:
          scenarioADR,

        occupancy:
          scenarioOccupancy,

        expenses:
          scenarioMonthlyCosts,

        commission:
          Number(
            analysisData.commission ??
            window.lastAnalysisData?.commission ??
            15
          ),

        tax:
          Number(
            analysisData.tax ??
            window.lastAnalysisData?.tax ??
            21
          ),

        interestRate:
          Number(
            analysisData.interestRate ??
            window.lastAnalysisData?.interestRate ??
            3.5
          ),

        loanYears:
          Number(
            analysisData.loanYears ??
            window.lastAnalysisData?.loanYears ??
            20
          )

      });

    if(
      scenarioResult &&
      typeof scenarioResult === "object"
    ){

      // =====================================
      // 🧠 APPLY TEMPORARY SCENARIO
      // =====================================

      analysisData.propertyPrice =
        scenarioPropertyPrice;

      analysisData.price =
        scenarioPropertyPrice;

      analysisData.mortgagePercent =
        scenarioMortgagePercent;

      analysisData.loanAmount =
        scenarioLoanAmount;

      analysisData.mortgage =
        scenarioLoanAmount;

      analysisData.equity =
        scenarioEquity;

      analysisData.occupancy =
        scenarioOccupancy;

      analysisData.priceNight =
  scenarioADR;

// SSOT scenario:
// keep nightly-rate aliases aligned with the Combined What-if.
analysisData.pricePerNight =
  scenarioADR;

analysisData.expenses =
  scenarioMonthlyCosts;

      analysisData.monthlyCosts =
        scenarioMonthlyCosts;

      analysisData.roi =
        scenarioResult.roi;

      analysisData.visualROI =
        scenarioResult.roi;

      analysisData.realROI =
        scenarioResult.realROI;

      analysisData.net =
        scenarioResult.netAfterMortgage;

      analysisData.cashflow =
        scenarioResult.netAfterMortgage;

      analysisData.annualProfit =
        scenarioResult.netAfterMortgage;

      analysisData.profit =
        scenarioResult.netAfterMortgage;

      analysisData.netAfterMortgage =
        scenarioResult.netAfterMortgage;

      analysisData.gross =
  scenarioResult.gross;

analysisData.revenueAnnual =
  scenarioResult.revenue ??
  scenarioResult.gross;

      analysisData.risk =
        scenarioResult.risk;

if(window.RB_DEBUG === true){

  (void 0)


;

}

      // =====================================
      // 🧠 ONE SCORE CALCULATION
      // =====================================

      if(
        typeof window.rbGenerateInvestmentScore ===
        "function"
      ){

        const scenarioScore =
          window.rbGenerateInvestmentScore({
            roiAvailable: analysisData.roiAvailable !== false && Number(analysisData.equity ?? analysisData.investment) !== 0,

            roi:
              Number(
                analysisData.roi || 0
              ),

            risk:
              Number(
                analysisData.risk || 0
              ),

            occupancy:
              scenarioOccupancy,

            mortgagePercent:
              scenarioMortgagePercent,

            cashflow:
              Number(
                analysisData.cashflow || 0
              ),

            city:
              analysisData.city || "roma"

          });

        if(
          scenarioScore &&
          Number.isFinite(
            Number(scenarioScore.score)
          )
        ){

          analysisData.investmentScore =
            Number(
              scenarioScore.score
            );

if(window.RB_DEBUG === true){

  (void 0)


;

}

        }

      }

      // =====================================
      // 🧠 COMBINED SCENARIO METADATA
      // =====================================

      analysisData.whatIfScenario = {

        type:
          "combined",

        changes:
          [...combinedWhatIfKeys],

        originalPropertyPrice,

        originalMortgagePercent,

        originalLoanAmount,

        originalEquity,

        originalOccupancy,

        originalADR,

        originalMonthlyCosts,

        originalROI:
          Number(
            window.lastAnalysisData?.visualROI ??
            window.lastAnalysisData?.roi ??
            0
          ),

        originalRealROI:
          Number(
            window.lastAnalysisData?.realROI ??
            window.lastAnalysisData?.safeROI ??
            0
          ),

        originalCashflow:
          Number(
            window.lastAnalysisData?.net ??
            window.lastAnalysisData?.cashflow ??
            window.lastAnalysisData?.annualProfit ??
            0
          ),

        originalRisk:
          Number(
            window.lastAnalysisData?.risk ??
            0
          ),

        originalInvestmentScore:
          Number(
            window.lastAnalysisData?.investmentScore ??
            window.lastInvestmentScore?.score ??
            0
          ),

        scenarioPropertyPrice,

        scenarioMortgagePercent,

        scenarioLoanAmount,

        scenarioEquity,

        scenarioOccupancy,

        scenarioADR,

        scenarioMonthlyCosts,

        scenarioROI:
          Number(
            analysisData.roi ?? 0
          ),

        scenarioRealROI:
          Number(
            analysisData.realROI ?? 0
          ),

        scenarioCashflow:
          Number(
            analysisData.cashflow ??
            analysisData.net ??
            0
          ),

        scenarioRisk:
          Number(
            analysisData.risk ?? 0
          ),

        scenarioInvestmentScore:
          Number(
            analysisData.investmentScore ?? 0
          )

      };

if(window.RB_DEBUG === true){

  (void 0)


;

}

    }

  }

}

// =====================================
// 💰 EQUITY / OWN CAPITAL WHAT-IF SCENARIO
// Changes equity only and recalculates financing.
// Temporary only — does NOT mutate lastAnalysisData.
// =====================================

const requestedEquity =
  entities?.downPayment !== null &&
  entities?.downPayment !== undefined
    ? Number(entities.downPayment)
    : null;

const baselineEquity =
  Number(
    window.lastAnalysisData?.equity ??
    window.lastAnalysisData?.initialCapital ??
    rememberedAnalysis.equity ??
    analysisData.equity ??
    0
  );

const isEquityWhatIf =
  !isCombinedWhatIf &&
  Number.isFinite(requestedEquity) &&
  requestedEquity > 0 &&
  Number(analysisData.propertyPrice) > 0 &&
  requestedEquity < Number(analysisData.propertyPrice) &&
  requestedEquity !== baselineEquity;

if(isEquityWhatIf){

  const scenarioPropertyPrice =
    Number(
      window.lastAnalysisData?.propertyPrice ??
      window.lastAnalysisData?.price ??
      analysisData.propertyPrice ??
      0
    );

  const scenarioEquity =
    requestedEquity;

  const scenarioLoanAmount =
    scenarioPropertyPrice -
    scenarioEquity;

  const scenarioMortgagePercent =
    scenarioPropertyPrice > 0
      ? (
          scenarioLoanAmount /
          scenarioPropertyPrice
        ) * 100
      : 0;

  const scenarioOccupancy =
    Number(
      window.lastAnalysisData?.occupancy ??
      analysisData.occupancy ??
      0
    );

  const scenarioADR =
    Number(
      window.lastAnalysisData?.priceNight ??
      analysisData.priceNight ??
      0
    );

  const scenarioMonthlyCosts =
    Number(
      window.lastAnalysisData?.expenses ??
      window.lastAnalysisData?.monthlyCosts ??
      analysisData.expenses ??
      0
    );

  if(
    scenarioPropertyPrice > 0 &&
    typeof window.calculateROI === "function"
  ){

    const scenarioResult =
      window.calculateROI({

        price:
          scenarioPropertyPrice,

        equity:
          scenarioEquity,

        loanAmount:
          scenarioLoanAmount,

        priceNight:
          scenarioADR,

        occupancy:
          scenarioOccupancy,

        expenses:
          scenarioMonthlyCosts,

        commission:
          Number(
            analysisData.commission ??
            window.lastAnalysisData?.commission ??
            15
          ),

        tax:
          Number(
            analysisData.tax ??
            window.lastAnalysisData?.tax ??
            21
          ),

        interestRate:
          Number(
            analysisData.interestRate ??
            window.lastAnalysisData?.interestRate ??
            3.5
          ),

        loanYears:
          Number(
            analysisData.loanYears ??
            window.lastAnalysisData?.loanYears ??
            20
          )

      });

    if(
      scenarioResult &&
      typeof scenarioResult === "object"
    ){

      analysisData.propertyPrice =
        scenarioPropertyPrice;

      analysisData.price =
        scenarioPropertyPrice;

      analysisData.equity =
        scenarioEquity;

      analysisData.loanAmount =
        scenarioLoanAmount;

      analysisData.mortgage =
        scenarioLoanAmount;

      analysisData.mortgagePercent =
        scenarioMortgagePercent;

      analysisData.roi =
        scenarioResult.roi;

      analysisData.visualROI =
        scenarioResult.roi;

      analysisData.realROI =
        scenarioResult.realROI;

      analysisData.net =
        scenarioResult.netAfterMortgage;

      analysisData.cashflow =
        scenarioResult.netAfterMortgage;

      analysisData.annualProfit =
        scenarioResult.netAfterMortgage;

      analysisData.profit =
        scenarioResult.netAfterMortgage;

      analysisData.netAfterMortgage =
        scenarioResult.netAfterMortgage;

      analysisData.gross =
        scenarioResult.gross;

      analysisData.revenueAnnual =
        scenarioResult.revenue ??
        scenarioResult.gross;

      analysisData.risk =
        scenarioResult.risk;


      // =====================================
      // 🧠 RECALCULATE EQUITY WHAT-IF SCORE
      // =====================================

      if(
        typeof window.rbGenerateInvestmentScore ===
        "function"
      ){

        const scenarioScore =
          window.rbGenerateInvestmentScore({
            roiAvailable: analysisData.roiAvailable !== false && Number(analysisData.equity ?? analysisData.investment) !== 0,

            roi:
              Number(
                analysisData.roi || 0
              ),

            risk:
              Number(
                analysisData.risk || 0
              ),

            occupancy:
              scenarioOccupancy,

            mortgagePercent:
              scenarioMortgagePercent,

            cashflow:
              Number(
                analysisData.cashflow || 0
              ),

            city:
              analysisData.city || "roma"

          });

        if(
          scenarioScore &&
          Number.isFinite(
            Number(scenarioScore.score)
          )
        ){

          analysisData.investmentScore =
            Number(
              scenarioScore.score
            );


        }

      }

      // =====================================
      // 💰 EQUITY SCENARIO METADATA
      // =====================================

      analysisData.whatIfScenario = {

        type:
          "equity",

        requestedEquity,

        originalPropertyPrice:
          scenarioPropertyPrice,

        originalEquity:
          baselineEquity,

        originalLoanAmount:
          Number(
            window.lastAnalysisData?.loanAmount ??
            window.lastAnalysisData?.mortgage ??
            0
          ),

        originalMortgagePercent:
          Number(
            window.lastAnalysisData?.mortgagePercent ??
            0
          ),

        originalROI:
          Number(
            window.lastAnalysisData?.visualROI ??
            window.lastAnalysisData?.roi ??
            0
          ),

        originalRealROI:
          Number(
            window.lastAnalysisData?.realROI ??
            window.lastAnalysisData?.safeROI ??
            0
          ),

        originalCashflow:
          Number(
            window.lastAnalysisData?.net ??
            window.lastAnalysisData?.cashflow ??
            window.lastAnalysisData?.annualProfit ??
            0
          ),

        originalRisk:
          Number(
            window.lastAnalysisData?.risk ??
            0
          ),

        originalInvestmentScore:
          Number(
            window.lastAnalysisData?.investmentScore ??
            window.lastInvestmentScore?.score ??
            0
          ),

        scenarioPropertyPrice,

        scenarioEquity,

        scenarioLoanAmount,

        scenarioMortgagePercent,

        scenarioOccupancy,

        scenarioADR,

        scenarioMonthlyCosts,

        scenarioROI:
          Number(
            analysisData.roi ?? 0
          ),

        scenarioRealROI:
          Number(
            analysisData.realROI ?? 0
          ),

        scenarioCashflow:
          Number(
            analysisData.cashflow ??
            analysisData.net ??
            0
          ),

        scenarioRisk:
          Number(
            analysisData.risk ?? 0
          ),

        scenarioInvestmentScore:
          Number(
            analysisData.investmentScore ?? 0
          )

      };


    }

  }

}    

// =====================================
// 💰 EQUITY WHAT-IF INTENT OVERRIDE
// A valid calculated equity scenario
// must use the Executive What-if renderer.
// =====================================

if(
  analysisData?.whatIfScenario?.type ===
  "equity"
){

  intent.intent =
    "investment_executive";

  intent.intents = [
    "investment_executive"
  ];


}    

// =====================================
// 🏦 MORTGAGE WHAT-IF SCENARIO
// Temporary scenario — does NOT mutate lastAnalysisData
// =====================================

const requestedMortgagePercent =
  Number(
    entities?.mortgagePercent
  );

const requestedMortgageAmount =
  entities?.mortgageAmount !== null &&
  entities?.mortgageAmount !== undefined
    ? Number(entities.mortgageAmount)
    : null;    

// Baseline canonica della simulazione corrente.
// Lo scenario mutuo deve modificare soltanto il costo del finanziamento.
const mortgageBaselineCashflow =
  Number(
    window.rbChatbotData?.net ??
    window.rbChatbotLive?.net ??
    window.lastAnalysisData?.net ??
    window.lastAnalysisData?.cashflow ??
    window.lastAnalysisData?.annualProfit ??
    0
  );

const mortgageBaselineROI =
  Number(
    window.rbChatbotData?.visualROI ??
    window.rbChatbotData?.roi ??
    window.rbChatbotLive?.visualROI ??
    window.rbChatbotLive?.roi ??
    window.lastAnalysisData?.visualROI ??
    window.lastAnalysisData?.roi ??
    0
  );

const mortgageBaselinePropertyPrice =
  Number(
    window.lastAnalysisData?.propertyPrice ??
    window.lastAnalysisData?.price ??
    analysisData.propertyPrice ??
    0
  );

const mortgageBaselineRealROI =
  mortgageBaselinePropertyPrice > 0
    ? (
        mortgageBaselineCashflow /
        mortgageBaselinePropertyPrice
      ) * 100
    : Number(
        window.lastAnalysisData?.realROI ??
        0
      );

const storedMortgageBaselineScore =
  Number(
    window.lastAnalysisData?.investmentScore ??
    window.lastAnalysisData?.score ??
    window.rbChatbotData?.investmentScore ??
    window.rbChatbotData?.score ??
    window.lastInvestmentScore?.score ??
    0
  );

const calculatedMortgageBaselineScore =
  storedMortgageBaselineScore > 0
    ? storedMortgageBaselineScore
    : Number(
        window.rbGenerateInvestmentScore?.({
          roi: mortgageBaselineROI,
          roiAvailable: Number(window.lastAnalysisData?.equity ?? analysisData.equity ?? analysisData.investment) !== 0,
          risk: Number(
            window.lastAnalysisData?.risk ??
            analysisData.risk ??
            0
          ),
          occupancy: Number(
            window.lastAnalysisData?.occupancy ??
            analysisData.occupancy ??
            0
          ),
          mortgagePercent: Number(
            window.lastAnalysisData?.mortgagePercent ??
            analysisData.mortgagePercent ??
            0
          ),
          cashflow: mortgageBaselineCashflow,
          city:
            window.lastAnalysisData?.city ??
            window.lastAnalysisData?.marketCity ??
            analysisData.city ??
            "roma"
        })?.score ??
        0
      );

const mortgageBaselineScore =
  Number.isFinite(calculatedMortgageBaselineScore)
    ? calculatedMortgageBaselineScore
    : 0;

const mortgageBaselineYearlyPayment =
  Number(
    window.lastAnalysisData?.mortgageYearly ??
    (
      Number(
        window.lastAnalysisData?.monthlyMortgage ??
        window.lastAnalysisData?.monthlyMortgagePayment ??
        0
      ) * 12
    )
  );    

const isMortgageWhatIf =
  !isCombinedWhatIf &&
  (
    intent?.intents?.includes("mortgage_analysis") ||
    (
      entities?.mortgage === true &&
      Number.isFinite(requestedMortgageAmount) &&
      requestedMortgageAmount > 0
    )
  ) &&
  (
    (
      Number.isFinite(requestedMortgagePercent) &&
      requestedMortgagePercent > 0 &&
      requestedMortgagePercent <= 100
    )
    ||
    (
      Number.isFinite(requestedMortgageAmount) &&
      requestedMortgageAmount > 0 &&
      requestedMortgageAmount <
        Number(
          analysisData.propertyPrice ??
          window.lastAnalysisData?.propertyPrice ??
          window.lastAnalysisData?.price ??
          0
        )
    )
  );

if(isMortgageWhatIf){

  const scenarioPropertyPrice =
    Number(
      analysisData.propertyPrice ??
      window.lastAnalysisData?.propertyPrice ??
      window.lastAnalysisData?.price ??
      0
    );

  if(scenarioPropertyPrice > 0){

const scenarioLoanAmount =
  Number.isFinite(requestedMortgageAmount) &&
  requestedMortgageAmount > 0
    ? requestedMortgageAmount
    : (
        scenarioPropertyPrice *
        (requestedMortgagePercent / 100)
      );

const scenarioMortgagePercent =
  scenarioPropertyPrice > 0
    ? (
        scenarioLoanAmount /
        scenarioPropertyPrice
      ) * 100
    : 0;

const scenarioEquity =
  scenarioPropertyPrice -
  scenarioLoanAmount;

    analysisData.mortgagePercent =
  scenarioMortgagePercent;

    analysisData.loanAmount =
      scenarioLoanAmount;

    analysisData.mortgage =
      scenarioLoanAmount;

    analysisData.equity =
      scenarioEquity;

    // =====================================
    // 🧮 RECALCULATE WHAT-IF WITH ROI ENGINE
    // Temporary only — lastAnalysisData stays untouched
    // =====================================

    if(typeof window.calculateROI === "function"){

      const scenarioResult =
        window.calculateROI({

          price:
            scenarioPropertyPrice,

          equity:
            scenarioEquity,

          loanAmount:
            scenarioLoanAmount,

          priceNight:
            Number(
              analysisData.priceNight ??
              window.lastAnalysisData?.priceNight ??
              100
            ),

          occupancy:
            Number(
              analysisData.occupancy ??
              window.lastAnalysisData?.occupancy ??
              65
            ),

          expenses:
            Number(
              analysisData.expenses ??
              window.lastAnalysisData?.expenses ??
              30
            ),

          commission:
            Number(
              analysisData.commission ??
              window.lastAnalysisData?.commission ??
              15
            ),

          tax:
            Number(
              analysisData.tax ??
              window.lastAnalysisData?.tax ??
              21
            ),

          interestRate:
            Number(
              analysisData.interestRate ??
              window.lastAnalysisData?.interestRate ??
              3.5
            ),

          loanYears:
            Number(
              analysisData.loanYears ??
              window.lastAnalysisData?.loanYears ??
              20
            )

        });

      if(
        scenarioResult &&
        typeof scenarioResult === "object"
      ){

const scenarioYearlyPayment =
  Number(
    scenarioResult.mortgageYearly ??
    0
  );

const scenarioNetAfterMortgage =
  mortgageBaselineCashflow +
  mortgageBaselineYearlyPayment -
  scenarioYearlyPayment;

const scenarioEquityROI =
  scenarioEquity > 0
    ? (
        scenarioNetAfterMortgage /
        scenarioEquity
      ) * 100
    : 0;

const scenarioPropertyROI =
  scenarioPropertyPrice > 0
    ? (
        scenarioNetAfterMortgage /
        scenarioPropertyPrice
      ) * 100
    : 0;

analysisData.roi =
  scenarioEquityROI;

analysisData.realROI =
  scenarioPropertyROI;

analysisData.net =
  scenarioNetAfterMortgage;

analysisData.cashflow =
  scenarioNetAfterMortgage;

analysisData.annualProfit =
  scenarioNetAfterMortgage;

analysisData.profit =
  scenarioNetAfterMortgage;

analysisData.netAfterMortgage =
  scenarioNetAfterMortgage;

analysisData.mortgageYearly =
  scenarioYearlyPayment;

analysisData.monthlyMortgage =
  scenarioYearlyPayment / 12;

analysisData.risk =
  scenarioEquityROI >= 15
    ? 25
    : scenarioEquityROI >= 10
      ? 40
      : scenarioEquityROI >= 6
        ? 60
        : 80;
if(window.RB_DEBUG === true){

  (void 0)


;

}

// =====================================
// 🧠 RECALCULATE WHAT-IF INVESTMENT SCORE
// Temporary only — does not mutate base simulation
// =====================================

if(typeof window.rbGenerateInvestmentScore === "function"){

  const scenarioScore =
    window.rbGenerateInvestmentScore({
            roiAvailable: analysisData.roiAvailable !== false && Number(analysisData.equity ?? analysisData.investment) !== 0,

      roi:
        Number(analysisData.roi || 0),

      risk:
        Number(analysisData.risk || 0),

      occupancy:
        Number(analysisData.occupancy || 0),

      mortgagePercent:
  scenarioMortgagePercent,

      cashflow:
        Number(analysisData.cashflow || 0),

      city:
        analysisData.city || "roma"

    });

  if(
    scenarioScore &&
    Number.isFinite(
      Number(scenarioScore.score)
    )
  ){

    analysisData.investmentScore =
      Number(scenarioScore.score);

if(window.RB_DEBUG === true){

  (void 0)


;

}

  }

}

}

}

    // Scenario metadata.
    // Manteniamo separati i valori originali per il confronto successivo.
    analysisData.whatIfScenario = {

      type:
  "mortgage",

requestedMortgagePercent:
  Number.isFinite(requestedMortgagePercent) &&
  requestedMortgagePercent > 0
    ? requestedMortgagePercent
    : null,

requestedMortgageAmount:
  Number.isFinite(requestedMortgageAmount)
    ? requestedMortgageAmount
    : null,

scenarioMortgagePercent,

      originalMortgagePercent:
        Number(
          window.lastAnalysisData?.mortgagePercent ??
          rememberedAnalysis.mortgagePercent ??
          0
        ),

      originalLoanAmount:
        Number(
          window.lastAnalysisData?.loanAmount ??
          window.lastAnalysisData?.mortgage ??
          rememberedAnalysis.loanAmount ??
          0
        ),

      originalEquity:
        Number(
          window.lastAnalysisData?.equity ??
          window.lastAnalysisData?.initialCapital ??
          rememberedAnalysis.equity ??
          0
        ),

originalROI:
  mortgageBaselineROI,

originalRealROI:
  mortgageBaselineRealROI,

originalCashflow:
  mortgageBaselineCashflow,

originalInvestmentScore:
  mortgageBaselineScore,

scenarioROI:
  Number(
    analysisData.roi ?? 0
  ),

scenarioRealROI:
  Number(
    analysisData.realROI ?? 0
  ),

scenarioCashflow:
  Number(
    analysisData.cashflow ??
    analysisData.net ??
    0
  ),

scenarioInvestmentScore:
  Number(
    analysisData.investmentScore ?? 0
  ),

propertyPrice:
  scenarioPropertyPrice,

      loanAmount:
        scenarioLoanAmount,

      equity:
        scenarioEquity

    };

if(window.RB_DEBUG === true){

  (void 0)


;

}

  }

}    

// =====================================
// 🏠 PROPERTY PRICE WHAT-IF SCENARIO
// Keeps baseline LTV unchanged
// Temporary scenario — does NOT mutate lastAnalysisData
// =====================================

const requestedPropertyPrice =
  Number(
    entities?.price
  );

const baselinePropertyPrice =
  Number(
    window.lastAnalysisData?.propertyPrice ??
    window.lastAnalysisData?.price ??
    rememberedAnalysis.propertyPrice ??
    0
  );

const baselineMortgagePercent =
  Number(
    window.lastAnalysisData?.mortgagePercent ??
    rememberedAnalysis.mortgagePercent ??
    (
      baselinePropertyPrice > 0
        ? (
            Number(
              window.lastAnalysisData?.loanAmount ??
              window.lastAnalysisData?.mortgage ??
              rememberedAnalysis.loanAmount ??
              0
            )
            /
            baselinePropertyPrice
          ) * 100
        : 0
    )
  );

const isCapitalConversation =

  Number.isFinite(
    Number(entities?.availableCapital)
  ) &&

  (
    message.toLowerCase().includes("ho ") ||
    message.toLowerCase().includes("budget") ||
    message.toLowerCase().includes("capitale") ||
    message.toLowerCase().includes("da investire") ||
    message.toLowerCase().includes("i have") ||
    message.toLowerCase().includes("to invest")
  );

const isPropertyPriceWhatIf =

  /(?:compr|acquist|purchase|\bbuy\b|property price|house price|buying price|\bprezzo\b(?!\s*(?:notte|per notte|a notte))|costass[ei])/i.test(message) &&

  !isCapitalConversation &&

  !isCombinedWhatIf &&

  !isMortgageWhatIf &&

  Number.isFinite(requestedPropertyPrice) &&

  requestedPropertyPrice > 0 &&

  baselinePropertyPrice > 0 &&

  requestedPropertyPrice !== baselinePropertyPrice;

if(isPropertyPriceWhatIf){

  if(typeof window.calculateROI!=='function')return {success:true,intent:{intent:'calculation_unavailable'},response:{
    type:'calculation_unavailable',confidence:1,actions:[],metadata:{source:'calculation_readiness'},
    textIT:'Non posso ricalcolare questo prezzo nella schermata corrente: il motore di calcolo non è disponibile. Apri la stessa analisi in Analizza, verifica le ipotesi e modifica il prezzo lì. Non riutilizzo il ROI precedente come risultato del nuovo prezzo e non ho modificato o salvato l’analisi.',
    textEN:'I cannot recalculate this price on the current screen: the calculation engine is unavailable. Open the same analysis in Analyze, review its assumptions and change the price there. I will not reuse the previous ROI as the result for a new price, and I have not changed or saved the analysis.'
  }};

  const scenarioPropertyPrice =
    requestedPropertyPrice;

  const scenarioMortgagePercent =
    baselineMortgagePercent;

  const scenarioLoanAmount =
    scenarioPropertyPrice *
    (scenarioMortgagePercent / 100);

  const scenarioEquity =
    scenarioPropertyPrice -
    scenarioLoanAmount;

  analysisData.propertyPrice =
    scenarioPropertyPrice;

  analysisData.price =
    scenarioPropertyPrice;

  analysisData.mortgagePercent =
    scenarioMortgagePercent;

  analysisData.loanAmount =
    scenarioLoanAmount;

  analysisData.mortgage =
    scenarioLoanAmount;

  analysisData.equity =
    scenarioEquity;

  if(typeof window.calculateROI === "function"){

    const scenarioResult =
      window.calculateROI({

        price:
          scenarioPropertyPrice,

        equity:
          scenarioEquity,

        loanAmount:
          scenarioLoanAmount,

        priceNight:
          Number(
            analysisData.priceNight ??
            window.lastAnalysisData?.priceNight ??
            100
          ),

        occupancy:
          Number(
            analysisData.occupancy ??
            window.lastAnalysisData?.occupancy ??
            65
          ),

        expenses:
          Number(
            analysisData.expenses ??
            window.lastAnalysisData?.expenses ??
            30
          ),

        commission:
          Number(
            analysisData.commission ??
            window.lastAnalysisData?.commission ??
            15
          ),

        tax:
          Number(
            analysisData.tax ??
            window.lastAnalysisData?.tax ??
            21
          ),

        interestRate:
          Number(
            analysisData.interestRate ??
            window.lastAnalysisData?.interestRate ??
            3.5
          ),

        loanYears:
          Number(
            analysisData.loanYears ??
            window.lastAnalysisData?.loanYears ??
            20
          )

      });

    if(
      scenarioResult &&
      typeof scenarioResult === "object"
    ){

      analysisData.roi =
        scenarioResult.roi;

      analysisData.visualROI =
        scenarioResult.roi;

      analysisData.realROI =
        scenarioResult.realROI;

      analysisData.net =
        scenarioResult.netAfterMortgage;

      analysisData.cashflow =
        scenarioResult.netAfterMortgage;

      analysisData.annualProfit =
        scenarioResult.netAfterMortgage;

      analysisData.profit =
        scenarioResult.netAfterMortgage;

      analysisData.netAfterMortgage =
        scenarioResult.netAfterMortgage;

      analysisData.risk =
        scenarioResult.risk;

if(window.RB_DEBUG === true){

  (void 0)


;

}

      if(
        typeof window.rbGenerateInvestmentScore ===
        "function"
      ){

        const scenarioScore =
          window.rbGenerateInvestmentScore({
            roiAvailable: analysisData.roiAvailable !== false && Number(analysisData.equity ?? analysisData.investment) !== 0,

            roi:
              Number(
                analysisData.roi || 0
              ),

            risk:
              Number(
                analysisData.risk || 0
              ),

            occupancy:
              Number(
                analysisData.occupancy || 0
              ),

            mortgagePercent:
              scenarioMortgagePercent,

            cashflow:
              Number(
                analysisData.cashflow || 0
              ),

            city:
              analysisData.city || "roma"

          });

        if(
          scenarioScore &&
          Number.isFinite(
            Number(scenarioScore.score)
          )
        ){

          analysisData.investmentScore =
            Number(
              scenarioScore.score
            );

if(window.RB_DEBUG === true){

  (void 0)


;

}

        }

      }

    }

  }

  analysisData.whatIfScenario = {

    type:
      "property_price",

    requestedPropertyPrice,

    originalPropertyPrice:
      baselinePropertyPrice,

    originalMortgagePercent:
      baselineMortgagePercent,

    originalLoanAmount:
      Number(
        window.lastAnalysisData?.loanAmount ??
        window.lastAnalysisData?.mortgage ??
        rememberedAnalysis.loanAmount ??
        0
      ),

    originalEquity:
      Number(
        window.lastAnalysisData?.equity ??
        window.lastAnalysisData?.initialCapital ??
        rememberedAnalysis.equity ??
        0
      ),

    originalROI:
      Number(
        window.lastAnalysisData?.visualROI ??
        window.lastAnalysisData?.roi ??
        0
      ),

    originalRealROI:
      Number(
        window.lastAnalysisData?.realROI ??
        window.lastAnalysisData?.safeROI ??
        0
      ),

    originalCashflow:
      Number(
        window.lastAnalysisData?.net ??
        window.lastAnalysisData?.cashflow ??
        window.lastAnalysisData?.annualProfit ??
        0
      ),

    originalInvestmentScore:
      Number(
        window.lastAnalysisData?.investmentScore ??
        window.lastInvestmentScore?.score ??
        0
      ),

    scenarioPropertyPrice,

    scenarioMortgagePercent,

    scenarioLoanAmount,

    scenarioEquity,

    scenarioROI:
      Number(
        analysisData.roi ?? 0
      ),

    scenarioRealROI:
      Number(
        analysisData.realROI ?? 0
      ),

    scenarioCashflow:
      Number(
        analysisData.cashflow ??
        analysisData.net ??
        0
      ),

    scenarioInvestmentScore:
      Number(
        analysisData.investmentScore ?? 0
      )

  };

if(window.RB_DEBUG === true){

  (void 0)


;

}

}   

// =====================================
// 🧠 PROPERTY PRICE WHAT-IF INTENT OVERRIDE
// A valid calculated scenario must use Executive response
// =====================================

if(
  analysisData?.whatIfScenario?.type ===
  "property_price"
){

  intent.intent =
    "investment_executive";

  intent.intents = [
    "investment_executive"
  ];


}
    
// =====================================
// 🏨 OCCUPANCY WHAT-IF SCENARIO
// Changes occupancy only
// Temporary scenario — does NOT mutate lastAnalysisData
// =====================================

const rawRequestedOccupancy =
  entities?.occupancy;

const hasExplicitRequestedOccupancy =
  rawRequestedOccupancy !== null &&
  rawRequestedOccupancy !== undefined &&
  rawRequestedOccupancy !== "";

const requestedOccupancy =
  hasExplicitRequestedOccupancy
    ? Number(rawRequestedOccupancy)
    : null;

const baselineOccupancy =
  Number(
    window.lastAnalysisData?.occupancy ??
    rememberedAnalysis.occupancy ??
    analysisData.occupancy ??
    0
  );

const isOccupancyWhatIf =
  !isCombinedWhatIf &&
  !isMortgageWhatIf &&
  !isPropertyPriceWhatIf &&
  intent?.intents?.includes("investment_executive") &&
  hasExplicitRequestedOccupancy &&
  Number.isFinite(requestedOccupancy) &&
  requestedOccupancy >= 0 &&
  requestedOccupancy <= 100 &&
  baselineOccupancy > 0 &&
  requestedOccupancy !== baselineOccupancy;

if(isOccupancyWhatIf){

  const scenarioPropertyPrice =
    Number(
      window.lastAnalysisData?.propertyPrice ??
      window.lastAnalysisData?.price ??
      analysisData.propertyPrice ??
      0
    );

  const scenarioEquity =
    Number(
      window.lastAnalysisData?.equity ??
      window.lastAnalysisData?.initialCapital ??
      window.rbChatMemory?.lastEquity ??
      analysisData.equity ??
      0
    );

  const scenarioLoanAmount =
    Number(
      window.lastAnalysisData?.loanAmount ??
      window.lastAnalysisData?.mortgage ??
      window.rbChatMemory?.lastLoanAmount ??
      analysisData.loanAmount ??
      0
    );

  const scenarioMortgagePercent =
    Number(
      window.lastAnalysisData?.mortgagePercent ??
      analysisData.mortgagePercent ??
      (
        scenarioPropertyPrice > 0
          ? (scenarioLoanAmount / scenarioPropertyPrice) * 100
          : 0
      )
    );

    const originalROI =
    Number(
      window.lastAnalysisData?.visualROI ??
      window.lastAnalysisData?.roi ??
      rememberedAnalysis.roi ??
      analysisData.roi ??
      0
    );

  const originalRealROI =
    Number(
      window.lastAnalysisData?.realROI ??
      window.lastAnalysisData?.safeROI ??
      rememberedAnalysis.realROI ??
      analysisData.realROI ??
      0
    );

  const originalCashflow =
    Number(
      window.lastAnalysisData?.net ??
      window.lastAnalysisData?.cashflow ??
      window.lastAnalysisData?.annualProfit ??
      rememberedAnalysis.net ??
      rememberedAnalysis.cashflow ??
      analysisData.net ??
      analysisData.cashflow ??
      analysisData.annualProfit ??
      0
    );

  const originalRisk =
    Number(
      window.lastAnalysisData?.risk ??
      rememberedAnalysis.risk ??
      analysisData.risk ??
      0
    );

  const originalInvestmentScore =
    Number(
      window.lastAnalysisData?.investmentScore ??
      window.lastInvestmentScore?.score ??
      analysisData.investmentScore ??
      0
    );

  analysisData.occupancy =
    requestedOccupancy;

  if(
    scenarioPropertyPrice > 0 &&
    typeof window.calculateROI === "function"
  ){

    const scenarioResult =
      window.calculateROI({

        price:
          scenarioPropertyPrice,

        equity:
          scenarioEquity,

        loanAmount:
          scenarioLoanAmount,

        priceNight:
          Number(
            analysisData.priceNight ??
            window.lastAnalysisData?.priceNight ??
            100
          ),

        occupancy:
          requestedOccupancy,

        expenses:
          Number(
            analysisData.expenses ??
            window.lastAnalysisData?.expenses ??
            30
          ),

        commission:
          Number(
            analysisData.commission ??
            window.lastAnalysisData?.commission ??
            15
          ),

        tax:
          Number(
            analysisData.tax ??
            window.lastAnalysisData?.tax ??
            21
          ),

        interestRate:
          Number(
            analysisData.interestRate ??
            window.lastAnalysisData?.interestRate ??
            3.5
          ),

        loanYears:
          Number(
            analysisData.loanYears ??
            window.lastAnalysisData?.loanYears ??
            20
          )

      });

    if(
      scenarioResult &&
      typeof scenarioResult === "object"
    ){

      analysisData.roi =
        scenarioResult.roi;

      analysisData.visualROI =
        scenarioResult.roi;

      analysisData.realROI =
        scenarioResult.realROI;

      analysisData.net =
        scenarioResult.netAfterMortgage;

      analysisData.cashflow =
        scenarioResult.netAfterMortgage;

      analysisData.annualProfit =
        scenarioResult.netAfterMortgage;

      analysisData.profit =
        scenarioResult.netAfterMortgage;

analysisData.netAfterMortgage =
  scenarioResult.netAfterMortgage;

// =====================================
// 💰 OCCUPANCY WHAT-IF REVENUE SSOT
// Revenue must come from the same
// canonical ROI scenario calculation
// =====================================

analysisData.gross =
  scenarioResult.gross;

analysisData.revenueAnnual =
  scenarioResult.revenue ??
  scenarioResult.gross;

analysisData.risk =
  scenarioResult.risk;

if(window.RB_DEBUG === true){

  (void 0)


;

}

      // =====================================
      // 🧠 RECALCULATE OCCUPANCY WHAT-IF SCORE
      // Temporary only
      // =====================================

      if(
        typeof window.rbGenerateInvestmentScore ===
        "function"
      ){

        const scenarioScore =
          window.rbGenerateInvestmentScore({
            roiAvailable: analysisData.roiAvailable !== false && Number(analysisData.equity ?? analysisData.investment) !== 0,

            roi:
              Number(
                analysisData.roi || 0
              ),

            risk:
              Number(
                analysisData.risk || 0
              ),

            occupancy:
              requestedOccupancy,

            mortgagePercent:
              scenarioMortgagePercent,

            cashflow:
              Number(
                analysisData.cashflow || 0
              ),

            city:
              analysisData.city || "roma"

          });

        if(
          scenarioScore &&
          Number.isFinite(
            Number(scenarioScore.score)
          )
        ){

          analysisData.investmentScore =
            Number(
              scenarioScore.score
            );

if(window.RB_DEBUG === true){

  (void 0)


;

}

        }

      }

    }

  }

  analysisData.whatIfScenario = {

    type:
      "occupancy",

    requestedOccupancy,

    originalOccupancy:
      baselineOccupancy,

        originalPropertyPrice:
      scenarioPropertyPrice,

    originalMortgagePercent:
      scenarioMortgagePercent,

    originalLoanAmount:
      scenarioLoanAmount,

    originalEquity:
      scenarioEquity,

    originalROI,

    originalRealROI,

    originalCashflow,

    originalRisk,

    originalInvestmentScore,

    scenarioOccupancy:
      requestedOccupancy,

    scenarioPropertyPrice,

    scenarioMortgagePercent,

    scenarioLoanAmount,

    scenarioEquity,

    scenarioROI:
      Number(
        analysisData.roi ?? 0
      ),

    scenarioRealROI:
      Number(
        analysisData.realROI ?? 0
      ),

    scenarioCashflow:
      Number(
        analysisData.cashflow ??
        analysisData.net ??
        0
      ),

    scenarioRisk:
      Number(
        analysisData.risk ?? 0
      ),

    scenarioInvestmentScore:
      Number(
        analysisData.investmentScore ?? 0
      )

  };

if(window.RB_DEBUG === true){

  (void 0)


;

}

}    

// =====================================
// 💶 ADR / NIGHTLY RATE WHAT-IF SCENARIO
// Changes nightly rate only
// Temporary scenario — does NOT mutate lastAnalysisData
// =====================================

const requestedADR =
  Number(
    entities?.adr ??
    entities?.nightly
  );

const baselineADR =
  Number(
    window.lastAnalysisData?.priceNight ??
    analysisData.priceNight ??
    0
  );

// Baseline canonica corrente.
// Deve essere acquisita prima di applicare lo scenario ADR.
const adrBaselineCashflow =
  Number(
    window.rbChatbotData?.net ??
    window.rbChatbotLive?.net ??
    window.lastAnalysisData?.net ??
    window.lastAnalysisData?.cashflow ??
    window.lastAnalysisData?.annualProfit ??
    0
  );

const adrBaselineROI =
  Number(
    window.rbChatbotData?.visualROI ??
    window.rbChatbotData?.roi ??
    window.rbChatbotLive?.visualROI ??
    window.rbChatbotLive?.roi ??
    window.lastAnalysisData?.visualROI ??
    window.lastAnalysisData?.roi ??
    0
  );

const adrBaselinePropertyPrice =
  Number(
    window.lastAnalysisData?.propertyPrice ??
    window.lastAnalysisData?.price ??
    analysisData.propertyPrice ??
    0
  );

const adrBaselineRealROI =
  adrBaselinePropertyPrice > 0
    ? (
        adrBaselineCashflow /
        adrBaselinePropertyPrice
      ) * 100
    : Number(
        window.lastAnalysisData?.realROI ??
        0
      );

const adrBaselineRisk =
  Number(
    analysisData.risk ??
    window.lastAnalysisData?.risk ??
    0
  );

const adrRenderedScore =
  Number(
    String(
      document.getElementById("score-circle")
        ?.textContent ?? ""
    )
      .replace(/[^\d.,-]/g, "")
      .replace(",", ".")
  );

const adrBaselineScore =
  Number.isFinite(adrRenderedScore) &&
  adrRenderedScore > 0
    ? adrRenderedScore
    : Number(
        window.lastAnalysisData?.investmentScore ??
        window.lastInvestmentScore?.score ??
        0
      );    

const isADRWhatIf =
  !isCombinedWhatIf &&
  !isMortgageWhatIf &&
  !isPropertyPriceWhatIf &&
  !isOccupancyWhatIf &&
  intent?.intents?.includes("investment_executive") &&
  Number.isFinite(requestedADR) &&
  requestedADR > 0 &&
  baselineADR > 0 &&
  requestedADR !== baselineADR;

if(isADRWhatIf){

  const scenarioPropertyPrice =
    Number(
      window.lastAnalysisData?.propertyPrice ??
      window.lastAnalysisData?.price ??
      analysisData.propertyPrice ??
      0
    );

  const scenarioEquity =
    Number(
      window.lastAnalysisData?.equity ??
      window.lastAnalysisData?.initialCapital ??
      analysisData.equity ??
      0
    );

  const scenarioLoanAmount =
    Number(
      window.lastAnalysisData?.loanAmount ??
      window.lastAnalysisData?.mortgage ??
      analysisData.loanAmount ??
      0
    );

  const scenarioMortgagePercent =
    Number(
      window.lastAnalysisData?.mortgagePercent ??
      analysisData.mortgagePercent ??
      (
        scenarioPropertyPrice > 0
          ? (scenarioLoanAmount / scenarioPropertyPrice) * 100
          : 0
      )
    );

  const scenarioOccupancy =
    Number(
      window.lastAnalysisData?.occupancy ??
      analysisData.occupancy ??
      0
    );

  analysisData.priceNight =
    requestedADR;

  // =====================================
  // 💶 ADR WHAT-IF SSOT
  // Keep nightly-rate aliases aligned
  // inside the temporary scenario only
  // =====================================

  analysisData.pricePerNight =
    requestedADR;

  if(
    scenarioPropertyPrice > 0 &&
    typeof window.calculateROI === "function"
  ){

    const scenarioResult =
      window.calculateROI({

        price:
          scenarioPropertyPrice,

        equity:
          scenarioEquity,

        loanAmount:
          scenarioLoanAmount,

        priceNight:
          requestedADR,

        occupancy:
          scenarioOccupancy,

        expenses:
          Number(
            analysisData.expenses ??
            window.lastAnalysisData?.expenses ??
            30
          ),

        commission:
          Number(
            analysisData.commission ??
            window.lastAnalysisData?.commission ??
            15
          ),

        tax:
          Number(
            analysisData.tax ??
            window.lastAnalysisData?.tax ??
            21
          ),

        interestRate:
          Number(
            analysisData.interestRate ??
            window.lastAnalysisData?.interestRate ??
            3.5
          ),

        loanYears:
          Number(
            analysisData.loanYears ??
            window.lastAnalysisData?.loanYears ??
            20
          )

      });

    if(
      scenarioResult &&
      typeof scenarioResult === "object"
    ){

      analysisData.roi =
        scenarioResult.roi;

      analysisData.visualROI =
        scenarioResult.roi;

      analysisData.realROI =
        scenarioResult.realROI;

      analysisData.net =
        scenarioResult.netAfterMortgage;

      analysisData.cashflow =
        scenarioResult.netAfterMortgage;

      analysisData.annualProfit =
        scenarioResult.netAfterMortgage;

      analysisData.profit =
        scenarioResult.netAfterMortgage;

      analysisData.netAfterMortgage =
        scenarioResult.netAfterMortgage;

      // =====================================
      // 💰 ADR WHAT-IF REVENUE SSOT
      // Revenue must come from the same
      // canonical ROI scenario calculation
      // =====================================

      analysisData.gross =
        scenarioResult.gross;

      analysisData.revenueAnnual =
        scenarioResult.revenue ??
        scenarioResult.gross;

      analysisData.risk =
        scenarioResult.risk;

      
      // =====================================
      // 🧠 RECALCULATE ADR WHAT-IF SCORE
      // Temporary only
      // =====================================

      if(
        typeof window.rbGenerateInvestmentScore ===
        "function"
      ){

        const scenarioScore =
          window.rbGenerateInvestmentScore({
            roiAvailable: analysisData.roiAvailable !== false && Number(analysisData.equity ?? analysisData.investment) !== 0,

            roi:
              Number(
                analysisData.roi || 0
              ),

            risk:
              Number(
                analysisData.risk || 0
              ),

            occupancy:
              scenarioOccupancy,

            mortgagePercent:
              scenarioMortgagePercent,

            cashflow:
              Number(
                analysisData.cashflow || 0
              ),

            city:
              analysisData.city || "roma"

          });

        if(
          scenarioScore &&
          Number.isFinite(
            Number(scenarioScore.score)
          )
        ){

          analysisData.investmentScore =
            Number(
              scenarioScore.score
            );


        }

      }

    }

  }

  analysisData.whatIfScenario = {

    type:
      "adr",

    requestedADR,

    originalADR:
      baselineADR,

    originalOccupancy:
      Number(
        window.lastAnalysisData?.occupancy ??
        0
      ),

    originalPropertyPrice:
      Number(
        window.lastAnalysisData?.propertyPrice ??
        window.lastAnalysisData?.price ??
        0
      ),

    originalMortgagePercent:
      Number(
        window.lastAnalysisData?.mortgagePercent ??
        0
      ),

    originalLoanAmount:
      Number(
        window.lastAnalysisData?.loanAmount ??
        window.lastAnalysisData?.mortgage ??
        0
      ),

    originalEquity:
      Number(
        window.lastAnalysisData?.equity ??
        window.lastAnalysisData?.initialCapital ??
        0
      ),

  originalRealROI:
     adrBaselineRealROI,

 originalROI:
     adrBaselineROI,

originalCashflow:
     adrBaselineCashflow,

originalRisk:
     adrBaselineRisk,

originalInvestmentScore:
     adrBaselineScore,

    scenarioADR:
      requestedADR,

    scenarioOccupancy,

    scenarioPropertyPrice,

    scenarioMortgagePercent,

    scenarioLoanAmount,

    scenarioEquity,

    scenarioROI:
      Number(
        analysisData.roi ?? 0
      ),

    scenarioRealROI:
      Number(
        analysisData.realROI ?? 0
      ),

    scenarioCashflow:
      Number(
        analysisData.cashflow ??
        analysisData.net ??
        0
      ),

    scenarioRisk:
      Number(
        analysisData.risk ?? 0
      ),

    scenarioInvestmentScore:
      Number(
        analysisData.investmentScore ?? 0
      )

  };


}    

// =====================================
// 💸 MONTHLY COSTS WHAT-IF SCENARIO
// Changes operating costs only
// Temporary scenario — does NOT mutate lastAnalysisData
// =====================================

const requestedMonthlyCosts =
  entities?.monthlyCosts !== null &&
  entities?.monthlyCosts !== undefined &&
  entities?.monthlyCosts !== ""
    ? Number(entities.monthlyCosts)
    : null;

const baselineMonthlyCosts =
  Number(
    window.lastAnalysisData?.expenses ??
    window.lastAnalysisData?.monthlyCosts ??
    analysisData.expenses ??
    0
  );

const isMonthlyCostsWhatIf =
  !isCombinedWhatIf &&
  !isMortgageWhatIf &&
  !isPropertyPriceWhatIf &&
  !isOccupancyWhatIf &&
  !isADRWhatIf &&
  intent?.intents?.includes("investment_executive") &&
  Number.isFinite(requestedMonthlyCosts) &&
  requestedMonthlyCosts >= 0 &&
  baselineMonthlyCosts >= 0 &&
  requestedMonthlyCosts !== baselineMonthlyCosts;

if(isMonthlyCostsWhatIf){

  const scenarioPropertyPrice =
    Number(
      window.lastAnalysisData?.propertyPrice ??
      window.lastAnalysisData?.price ??
      analysisData.propertyPrice ??
      0
    );

  const scenarioEquity =
    Number(
      window.lastAnalysisData?.equity ??
      window.lastAnalysisData?.initialCapital ??
      analysisData.equity ??
      0
    );

  const scenarioLoanAmount =
    Number(
      window.lastAnalysisData?.loanAmount ??
      window.lastAnalysisData?.mortgage ??
      analysisData.loanAmount ??
      0
    );

  const scenarioMortgagePercent =
    Number(
      window.lastAnalysisData?.mortgagePercent ??
      analysisData.mortgagePercent ??
      (
        scenarioPropertyPrice > 0
          ? (scenarioLoanAmount / scenarioPropertyPrice) * 100
          : 0
      )
    );

  const scenarioOccupancy =
    Number(
      window.lastAnalysisData?.occupancy ??
      analysisData.occupancy ??
      0
    );

  const scenarioADR =
    Number(
      window.lastAnalysisData?.priceNight ??
      analysisData.priceNight ??
      0
    );

  analysisData.expenses =
    requestedMonthlyCosts;

  analysisData.monthlyCosts =
    requestedMonthlyCosts;

  if(
    scenarioPropertyPrice > 0 &&
    typeof window.calculateROI === "function"
  ){

    const scenarioResult =
      window.calculateROI({

        price:
          scenarioPropertyPrice,

        equity:
          scenarioEquity,

        loanAmount:
          scenarioLoanAmount,

        priceNight:
          scenarioADR,

        occupancy:
          scenarioOccupancy,

        expenses:
          requestedMonthlyCosts,

        commission:
          Number(
            analysisData.commission ??
            window.lastAnalysisData?.commission ??
            15
          ),

        tax:
          Number(
            analysisData.tax ??
            window.lastAnalysisData?.tax ??
            21
          ),

        interestRate:
          Number(
            analysisData.interestRate ??
            window.lastAnalysisData?.interestRate ??
            3.5
          ),

        loanYears:
          Number(
            analysisData.loanYears ??
            window.lastAnalysisData?.loanYears ??
            20
          )

      });

    if(
      scenarioResult &&
      typeof scenarioResult === "object"
    ){

      analysisData.roi =
        scenarioResult.roi;

      analysisData.visualROI =
        scenarioResult.roi;

      analysisData.realROI =
        scenarioResult.realROI;

      analysisData.net =
        scenarioResult.netAfterMortgage;

      analysisData.cashflow =
        scenarioResult.netAfterMortgage;

      analysisData.annualProfit =
        scenarioResult.netAfterMortgage;

      analysisData.profit =
        scenarioResult.netAfterMortgage;

      analysisData.netAfterMortgage =
        scenarioResult.netAfterMortgage;

      analysisData.risk =
        scenarioResult.risk;


      if(
        typeof window.rbGenerateInvestmentScore ===
        "function"
      ){

        const scenarioScore =
          window.rbGenerateInvestmentScore({
            roiAvailable: analysisData.roiAvailable !== false && Number(analysisData.equity ?? analysisData.investment) !== 0,

            roi:
              Number(
                analysisData.roi || 0
              ),

            risk:
              Number(
                analysisData.risk || 0
              ),

            occupancy:
              scenarioOccupancy,

            mortgagePercent:
              scenarioMortgagePercent,

            cashflow:
              Number(
                analysisData.cashflow || 0
              ),

            city:
              analysisData.city || "roma"

          });

        if(
          scenarioScore &&
          Number.isFinite(
            Number(scenarioScore.score)
          )
        ){

          analysisData.investmentScore =
            Number(
              scenarioScore.score
            );


        }

      }

    }

  }

  analysisData.whatIfScenario = {

    type:
      "monthly_costs",

    requestedMonthlyCosts,

    originalMonthlyCosts:
      baselineMonthlyCosts,

    originalPropertyPrice:
      Number(
        window.lastAnalysisData?.propertyPrice ??
        window.lastAnalysisData?.price ??
        0
      ),

    originalMortgagePercent:
      Number(
        window.lastAnalysisData?.mortgagePercent ??
        0
      ),

    originalLoanAmount:
      Number(
        window.lastAnalysisData?.loanAmount ??
        window.lastAnalysisData?.mortgage ??
        0
      ),

    originalEquity:
      Number(
        window.lastAnalysisData?.equity ??
        window.lastAnalysisData?.initialCapital ??
        0
      ),

    originalROI:
      Number(
        window.lastAnalysisData?.visualROI ??
        window.lastAnalysisData?.roi ??
        0
      ),

    originalRealROI:
      Number(
        window.lastAnalysisData?.realROI ??
        window.lastAnalysisData?.safeROI ??
        0
      ),

    originalCashflow:
      Number(
        window.lastAnalysisData?.net ??
        window.lastAnalysisData?.cashflow ??
        window.lastAnalysisData?.annualProfit ??
        0
      ),

    originalRisk:
      Number(
        window.lastAnalysisData?.risk ??
        0
      ),

    originalInvestmentScore:
      Number(
        window.lastAnalysisData?.investmentScore ??
        window.lastInvestmentScore?.score ??
        0
      ),

    scenarioMonthlyCosts:
      requestedMonthlyCosts,

    scenarioPropertyPrice,

    scenarioMortgagePercent,

    scenarioLoanAmount,

    scenarioEquity,

    scenarioOccupancy,

    scenarioADR,

    scenarioROI:
      Number(
        analysisData.roi ?? 0
      ),

    scenarioRealROI:
      Number(
        analysisData.realROI ?? 0
      ),

    scenarioCashflow:
      Number(
        analysisData.cashflow ??
        analysisData.net ??
        0
      ),

    scenarioRisk:
      Number(
        analysisData.risk ?? 0
      ),

    scenarioInvestmentScore:
      Number(
        analysisData.investmentScore ?? 0
      )

  };


}

// =====================================
// 🧠 WHAT-IF VERDICT SSOT
// Keep scenario Score + Verdict aligned
// before building the canonical AI context.
// Temporary only — lastAnalysisData untouched.
// =====================================

if(
  analysisData?.whatIfScenario &&
  Number.isFinite(
    Number(analysisData.investmentScore)
  ) &&
  typeof window.rbGenerateAdvisorVerdict === "function"
){

  const scenarioDecision =
    window.rbGenerateAdvisorVerdict({

      roi:
        Number(
          analysisData.realROI ??
          analysisData.roi ??
          0
        ),

      risk:
        Number(
          analysisData.risk ?? 0
        ),

      occupancy:
        Number(
          analysisData.occupancy ?? 0
        ),

      mortgagePercent:
        Number(
          analysisData.mortgagePercent ?? 0
        ),

      cashflow:
        Number(
          analysisData.net ??
          analysisData.cashflow ??
          0
        ),

      city:
        analysisData.city || "roma",

      canonicalScore:
        Number(
          analysisData.investmentScore
        ),

      investorProfile

    });

  if(scenarioDecision?.verdict){

    analysisData.verdict =
      scenarioDecision.verdict;

    analysisData.whatIfScenario.scenarioVerdict =
      scenarioDecision.verdict;

  }

}
    

// =====================================
// 🧠 CANONICAL AI CONTEXT
// Single Source of Truth
// =====================================

const canonicalAnalysis = {

    ...analysisData,

    roi: Number(
    analysisData.roi ??
    analysisData.visualROI ??
    analysisData.realROI ??
    0
),

    realROI: Number(
        analysisData.realROI ??
        analysisData.roi ??
        0
    ),

    visualROI: Number(
        analysisData.visualROI ??
        analysisData.roi ??
        0
    ),

    cashflow: Number(
        analysisData.net ??
        analysisData.cashflow ??
        analysisData.profit ??
        0
    ),

    net: Number(
        analysisData.net ??
        analysisData.cashflow ??
        0
    )

};

window.rbCanonicalAnalysis = canonicalAnalysis;

    
// =========================================
// 🧠 AI SIGNALS
// =========================================

const aiSignals =

  window.generateAISignals

  ? window.generateAISignals(
      analysisData
    )

  : [];

// =========================================
// 🧠 ADVISOR ELIGIBILITY
// =========================================

const shouldRunAdvisor =

  [
    "investment_executive",
    "investment_advisor",
    "investment_strategy",

    "improvement_advisor",

    "comparison",
    "roi_analysis",
    "risk_analysis",
    "cashflow_analysis",
    "mortgage_analysis",
    "report_interpretation"
  ].includes(
    intent.intent
  )

  &&

  (
    Number(
      analysisData.roi
    ) > 0 ||

    Number(
      analysisData.occupancy
    ) > 0 ||

    Number(
      analysisData.risk
    ) > 0
  );

// =========================================
// 🧠 ADVISOR ENGINE
// =========================================

const advisor =

  shouldRunAdvisor &&

  window.rbGenerateAdvisorVerdict

  ? window.rbGenerateAdvisorVerdict({

      roi:

        analysisData.realROI ??

        window.lastAnalysisData?.realROI ??

        analysisData.roi ??

        window.lastAnalysisData?.safeROI ??

        window.lastAnalysisData?.roi ??

        0,

      risk:

        analysisData.risk ||

        window.lastAnalysisData?.risk ||

        0,

      occupancy:

        analysisData.occupancy ||

        window.lastAnalysisData?.occupancy ||

        0,

      mortgagePercent:

        analysisData.mortgagePercent ??

        entities.mortgagePercent ??

        window.lastAnalysisData?.mortgagePercent ??

      0,

      cashflow:

        Number(

          analysisData.net ??

          analysisData.profit ??

          analysisData.netAfterMortgage ??

          analysisData.cashflow ??

          analysisData.annualProfit ??

          window.lastAnalysisData?.net ??

          window.lastAnalysisData?.profit ??

          window.lastAnalysisData?.netAfterMortgage ??

          window.lastAnalysisData?.annualProfit ??

          window.lastAnalysisData?.cashflow ??

          0

        ),

      city:

        analysisData.city ||

        entities.city ||

        "roma",

    canonicalScore:
  Number.isFinite(Number(canonicalAnalysis?.investmentScore))
    ? Number(canonicalAnalysis.investmentScore)
    : null,

      investorProfile

    })

  : null;

if(window.RB_DEBUG === true){

  (void 0)




























;

}

// =========================================
// 📄 DOCUMENT KNOWLEDGE
// =========================================

const documentKnowledge = {

    activeDocument:

        window.rbDocumentManager?.getLast?.() ||

        window.rbActiveDocument ||

        null,

    activeReport:
        window.rbDocumentManager?.getLast?.()?.analysis &&
        !["reading","unreadable","failed"].includes(window.rbDocumentManager.getLast().status)
            ? window.rbDocumentManager.getLast()
            : (window.rbDocumentManager?.getLast?.() ? null : window.lastExecutiveReport || null),

    uploadedReports:

        window.rbDocumentLibrary ||

        []

};

if(window.RB_DEBUG === true){

  (void 0)















;

}

// =========================================
// 🧠 AI BRAIN
// =========================================

const brain =

    window.rbProcessBrain

    ? window.rbProcessBrain({

        intent,

        entities,

        memory,

        investorProfile,

        score:
            window.lastInvestmentScore || {},

        advisor,

        reasoning:
            {},

        documentKnowledge,

        executiveContext:
            window.executiveContext || {}

    })

    : null;


// =========================================
// 🧠 CANONICAL ADVISOR RESULT
// Shared with Executive PDF
// =========================================

if(advisor){

  const canonicalScore =
    Number(
      canonicalAnalysis.investmentScore ??
      window.lastAnalysisData?.investmentScore ??
      window.lastInvestmentScore?.score ??
      advisor.score ??
      0
    );

  const canonicalVerdict =
  analysisData?.whatIfScenario
    ? (
        advisor.verdict ??
        window.lastInvestmentScore?.verdict ??
        "WAIT"
      )
    : (
        canonicalAnalysis.verdict ??
        window.lastAnalysisData?.verdict ??
        window.lastInvestmentScore?.verdict ??
        advisor.verdict ??
        "WAIT"
      );

if(!analysisData?.whatIfScenario){

  window.lastInvestmentScore = {

    score:
      canonicalScore,

    verdict:
      canonicalVerdict,

    label:
      canonicalVerdict,

    confidence:
      Number(
        window.lastInvestmentScore?.confidence ??
        advisor.confidence ??
        0
      )

  };

}

  // =========================================
  // 🧠 SYNC ADVISOR WITH CANONICAL DECISION
  // Preserve advisorScore, confidence, insights, etc.
  // =========================================

  advisor.score =
    canonicalScore;

  advisor.verdict =
    canonicalVerdict;

  if(window.RB_DEBUG === true){

  (void 0)


;

}

}

if(advisor){

  if(window.RB_DEBUG === true){

  (void 0)























;

}
}

    // =========================================
    // 🧠 KNOWLEDGE MATCHING
    // =========================================

    let matchedKnowledge =
      typeof window.rbMatchKnowledge === "function"
        ? window.rbMatchKnowledge(
            text,
            window.rbKnowledgeBase || {},
            detectedIntent
          )
        : [];

    if(!matchedKnowledge.length){

      for(
        const key in
        (window.rbKnowledgeBase || {})
      ){

        const item =
          window.rbKnowledgeBase[key];

        if(!item?.keywords){
          continue;
        }

        const matched =
          item.keywords.some(keyword =>
            text
              .toLowerCase()
              .includes(
                keyword.toLowerCase()
              )
          );

        if(matched){
          matchedKnowledge.push({
            key,
            item,
            priority: item.priority || 1
          });
        }

      }

    }

    // =========================================
    // 🧠 SORT KNOWLEDGE
    // =========================================

    matchedKnowledge.sort(
      (a,b)=>
        Number(b.relevance || b.priority || 0) -
        Number(a.relevance || a.priority || 0)
    );

// =========================================
// 🧠 MAIN KNOWLEDGE ENTITY
// =========================================

const bestKnowledge =

  matchedKnowledge.length

  ? matchedKnowledge[0]

  : null;

if(bestKnowledge){

  entities.knowledge =

    bestKnowledge.key;

  entities.knowledgeData =

    bestKnowledge.item;

}

// =========================================
// 🧠 MULTI RESPONSE ENGINE
// =========================================

let finalTextIT = "";
let finalTextEN = "";

const finalSuggestionsIT = [];
const finalSuggestionsEN = [];
const finalSignals = [];
const finalActions = [];
const partialMetadata = [];

let primaryResponseType = null;

for(const currentIntent of intent.intents){

  // =========================================
// 🧠 CURRENT INTENT DATA
// =========================================

const currentIntentData = {

  ...intent,

  intent: currentIntent,

  priority:

intentPriority[currentIntent] || 0,

  requiresMarketData:

  [
    "market_analysis",
    "investment_advisor",
    "investment_executive",
    "roi_analysis",
    "risk_analysis",
    "cashflow_analysis",
    "comparison",

    "best_city",
    "best_simulation",
    "portfolio_analysis",
    "property_performance"

  ].includes(currentIntent),

  requiresMortgageAnalysis:

    currentIntent ===
    "mortgage_analysis",

  requiresPortfolioData:

  [
    "best_city",
    "best_simulation",
    "portfolio_analysis",
    "property_performance"
  ].includes(currentIntent),

  requiresPdfData:

    currentIntent ===
    "pdf_analysis"

};
  
// =========================================
// 🌍 FILTER MEMORY
// =========================================

const filteredMemory = {

  ...memory

};

// 🔥 NO MARKET MEMORY
if(

  !currentIntentData
    .requiresMarketData

){

  delete filteredMemory.city;

  delete filteredMemory.lastCity;

}

// ===============================================
// 🧠 CONVERSATION CONTEXT
// ===============================================

const conversationContext =

    window.rbBuildConversationContext({

        message: text,

        intent: currentIntentData,

        entities,

        memory: filteredMemory,

        executiveContext:
            window.executiveContext || {},

        investorProfile,

        aiBrain: brain,

        advisor

    });



// ===============================================
// 🧠 EXECUTIVE BRAIN V2
// ===============================================

const executiveBrain =

    window.rbExecutiveBrain

    ? window.rbExecutiveBrain({

        intent: currentIntentData,

        advisor,

        executiveContext:
            window.executiveContext || {},

        conversationContext,

        reasoning: {},

        narrative: {},

        documentKnowledge,

        financials: analysisData

    })

    : null;


  
// =========================================
// 🧠 RESPONSE
// =========================================

const partialResponse =

window.rbGenerateResponse({

    message: text,

    entities,

    intent: currentIntentData,

    memory: filteredMemory,

    investorProfile,

    advisor,

    analysisData,

    aiSignals,

    brain,

    conversationContext,

    executiveBrain,

    documentKnowledge

});



  // 🔥 IGNORA RISPOSTE VUOTE/FALLBACK
  const isFallback =

  partialResponse?.textIT?.includes(
    "Posso aiutarti ad analizzare"
  );

if(

  !partialResponse ||

  (
    isFallback &&
    currentIntent !== "greeting"
  )

){

  continue;

}

  if(partialResponse?.textIT){

    finalTextIT +=
      partialResponse.textIT + "\n\n";

  }

  if(partialResponse?.textEN){

    finalTextEN +=
      partialResponse.textEN + "\n\n";

  }

  if(
  !primaryResponseType &&
  partialResponse?.type &&
  partialResponse.type !== "generic"
){

  primaryResponseType =
    partialResponse.type;

}

if(
  Array.isArray(
    partialResponse?.suggestionsIT
  )
){

  finalSuggestionsIT.push(
    ...partialResponse.suggestionsIT
  );

}

if(
  Array.isArray(
    partialResponse?.suggestionsEN
  )
){

  finalSuggestionsEN.push(
    ...partialResponse.suggestionsEN
  );

}

if(
  Array.isArray(
    partialResponse?.signals
  )
){

  finalSignals.push(
    ...partialResponse.signals
  );

}

if(
  Array.isArray(
    partialResponse?.actions
  )
){

  finalActions.push(
    ...partialResponse.actions
  );

}

if(
  partialResponse?.metadata &&
  Object.keys(
    partialResponse.metadata
  ).length
){

  partialMetadata.push(
    partialResponse.metadata
  );

}

}

// =========================================
// 📈 ROI FOLLOW-UP SAFETY
// Preserve follow-ups after early returns
// =========================================

if(
  primaryResponseType === "roi" &&
  !finalSuggestionsIT.length &&
  !finalSuggestionsEN.length
){

  const currentROI = Number(

    window.lastAnalysisData?.realROI ??

    analysisData?.realROI ??

    analysisData?.roi ??

    0

  );

    const currentCity =

    analysisData?.city ||

    entities?.city ||

    "roma";

  const currentCityLabel =

    window.rbCapitalize?.(
      currentCity
    ) ||

    (
      currentCity
        .charAt(0)
        .toUpperCase() +
      currentCity.slice(1)
    );

  if(currentROI >= 20){

        finalSuggestionsIT.push(
      `Analizzare mercato ${currentCityLabel}`,
      "Analizzare sostenibilità",
      "Simulare scenario prudente"
    );

    finalSuggestionsEN.push(
      `Analyze ${currentCityLabel} market`,
      "Analyze sustainability",
      "Simulate conservative scenario"
    );

  }

  else if(currentROI >= 10){

    finalSuggestionsIT.push(
      "Analizzare il cashflow",
      "Valutare il rischio",
      "Confrontare il mercato"
    );

    finalSuggestionsEN.push(
      "Analyze cashflow",
      "Evaluate risk",
      "Compare the market"
    );

  }

  else{

    finalSuggestionsIT.push(
      "Ottimizzare il rendimento",
      "Ridurre i costi",
      "Valutare un'altra città"
    );

    finalSuggestionsEN.push(
      "Optimize returns",
      "Reduce costs",
      "Evaluate another city"
    );

  }

}

// =========================================
// 🌍 MARKET FOLLOW-UP SAFETY
// Contextual follow-ups based on real data
// =========================================

if(
  primaryResponseType === "market" &&
  !finalSuggestionsIT.length &&
  !finalSuggestionsEN.length
){

  const marketCityRaw = String(

    analysisData?.city ??

    entities?.city ??

    window.lastAnalysisData?.city ??

    ""

  )
  .trim()
  .toLowerCase();

  const marketCityIT = {

    roma: "Roma",
    milano: "Milano",
    napoli: "Napoli",
    firenze: "Firenze",
    venezia: "Venezia"

  }[marketCityRaw] || "";

  const marketCityEN = {

    roma: "Rome",
    milano: "Milan",
    napoli: "Naples",
    firenze: "Florence",
    venezia: "Venice"

  }[marketCityRaw] || "";

  const marketRealROIRaw =

    window.lastAnalysisData?.realROI ??

    analysisData?.realROI;

  const marketPropertyPrice = Number(

    window.lastAnalysisData?.propertyPrice ??

    analysisData?.propertyPrice ??

    0

  );

  const hasCompleteMarketAnalysis =

    marketPropertyPrice > 0 &&

    marketRealROIRaw !== null &&

    marketRealROIRaw !== undefined &&

    marketRealROIRaw !== "" &&

    Number.isFinite(
      Number(marketRealROIRaw)
    );

  if(hasCompleteMarketAnalysis){

    const riskSuggestionIT = marketCityIT
      ? `Valutare il rischio a ${marketCityIT}`
      : "Valutare il rischio dell'investimento";

    const riskSuggestionEN = marketCityEN
      ? `Evaluate risk in ${marketCityEN}`
      : "Evaluate investment risk";

    finalSuggestionsIT.push(
      riskSuggestionIT,
      "Analizzare il cashflow",
      "Verificare la sostenibilità"
    );

    finalSuggestionsEN.push(
      riskSuggestionEN,
      "Analyze cashflow",
      "Check sustainability"
    );

  }

  else{

    finalSuggestionsIT.push(
      "Completa la simulazione"
    );

    finalSuggestionsEN.push(
      "Complete the simulation"
    );

  }

}

// =========================================
// 🧠 FINAL RESPONSE
// =========================================

const response = {

  type:
    primaryResponseType ||
    intent.intent ||
    "generic",

  confidence:
    0.99,

  textIT:
    finalTextIT.trim(),

  textEN:
    finalTextEN.trim(),

  suggestionsIT: [
    ...new Set(finalSuggestionsIT)
  ],

  suggestionsEN: [
    ...new Set(finalSuggestionsEN)
  ],

  signals: finalSignals,

  actions: finalActions.filter(
    (action, index, actions) =>
      action?.type &&
      action?.bookingId &&
      actions.findIndex(
        item =>
          item?.type === action.type &&
          item?.bookingId === action.bookingId
      ) === index
  ),

  metadata: {}

};
    
if(response.type === 'generic' && typeof window.rbBuildGuidedClarification === 'function'){
  Object.assign(response,window.rbBuildGuidedClarification());
}

// =========================================
// 🧠 RESPONSE METADATA
// =========================================

response.metadata = {

  ...response.metadata,

  processedIntents:
    intent.intents,

  matchedKnowledge:
    matchedKnowledge.length,

  advisorEnabled:
    !!advisor,

  aiSignals:
    aiSignals.length,

  partialResponses:
    partialMetadata,

  generatedAt:
    Date.now()

};



if(window.rbRememberMessage){

  // =========================================
  // 🧠 MEMORY SOURCE
  // What-if scenarios must NOT replace
  // the canonical simulator analysis
  // =========================================

  const memoryAnalysis =
    analysisData?.whatIfScenario
      ? (window.lastAnalysisData || {})
      : analysisData;

  window.rbRememberMessage({

    role: "user",

    message: text,

    entities:{

      ...entities,

      roi:
        memoryAnalysis.realROI ??
        memoryAnalysis.roi ??
        null,

      risk:
        memoryAnalysis.risk ??
        null,

      occupancy:
        memoryAnalysis.occupancy ??
        null,

      city:
        memoryAnalysis.city ??
        analysisData.city ??
        null,

      cashflow:
        memoryAnalysis.net ??
        memoryAnalysis.cashflow ??
        memoryAnalysis.annualProfit ??
        0,

      propertyPrice:
        memoryAnalysis.propertyPrice ??
        memoryAnalysis.price ??
        0,

      equity:
        memoryAnalysis.equity ??
        null,

      loanAmount:
        memoryAnalysis.loanAmount ??
        memoryAnalysis.mortgage ??
        null,

      mortgagePercent:
        memoryAnalysis.mortgagePercent ??
        null

    },

    intent

  });

}

    // =========================================
    // 💾 MEMORY SAVE
    // =========================================

    if(window.rbSaveMemory){

      window.rbSaveMemory({

        lastMessage: text,

        lastIntent:
          intent.intent || null,

        lastCity:
          entities.city || null,

                lastROI:

          analysisData.realROI ??

          analysisData.roi ??

          null

      });

    }


    // =========================================
    // ✅ FINAL RESPONSE
    // =========================================

    return {

  success: true,

  entities,

  intent,

  memory:
    window.rbGetConversationContext
      ? window.rbGetConversationContext()
      : memory,

  advisor,

  matchedKnowledge,

  response

};

  }

  catch(error){

(void 0)

;

    return {

      success: false,

      response: {

        textIT:
`⚠️ Si è verificato un errore AI.`,

        textEN:
`⚠️ An AI error occurred.`

      }

    };

  }

};

// Production: nessun log
