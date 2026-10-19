// Read-only guidance. No property, booking, analysis or trial is created here.
export function pmsStartGuideHTML({snapshot,ownerUid,access={},lang='it'}){
 if(!ownerUid||snapshot?.isDemo||snapshot?.ownerUid!==ownerUid||snapshot?.portalSnapshotReady!==true||!(access.isInvestor||access.isPro||access.isAdmin))return '';
 if(!Array.isArray(snapshot.propertyList)||!Array.isArray(snapshot.portalBookingList))return '';
 const en=lang==='en',t=(it,eng)=>en?eng:it,properties=snapshot.propertyList.length;
 const pro=access.isPro===true||access.isAdmin===true;
 const action=(fn,it,eng)=>`<button type="button" class="btn-dashboard" onclick="${fn}">${t(it,eng)}</button>`;
 let text,buttons;
 if(!properties){
  text=t('Parti da una tua analisi salvata e collega l’immobile corretto. Puoi anche creare una proprietà per la sola gestione PMS. Nessun immobile viene creato automaticamente.','Start from a saved analysis and link the right property. You can also create a property for PMS management only. No property is created automatically.');
  buttons=action("showPMSTab('roi')",'1 · Scegli un’analisi salvata','1 · Choose a saved analysis')+action('openPropertyModal()','Oppure aggiungi un immobile','Or add a property');
 }else if(!snapshot.portalBookingList.length){
  text=t('Hai inserito gli immobili. Aggiungi le prenotazioni con date, stato e importi: i KPI PMS saranno calcolati sui dati registrati. Per il confronto Pro collega anche l’analisi corretta da Modifica immobile.','Your properties are ready. Add bookings with dates, status and amounts: PMS KPIs use recorded data. For a Pro comparison, also link the correct analysis in Edit property.');
  buttons=action("showPMSTab('bookings')",'2 · Apri le prenotazioni','2 · Open bookings')+action("showPMSTab('properties')",'Controlla il collegamento dell’analisi','Check the analysis link');
 }else{
  text=t('Controlla che ogni prenotazione sia collegata all’immobile corretto e che calendario e importi siano completi. Con Pro scegli immobile e periodo per confrontare prenotazioni e ipotesi nel report.','Check that bookings belong to the right property and calendar and amounts are complete. With Pro, choose property and period to compare bookings and assumptions in the report.');
  buttons=action("showPMSTab('properties')",'Controlla immobili e analisi','Check properties and analyses');
 }
 if(properties)text+=' '+t('In Prenotazioni puoi anche importare un CSV con anteprima e controllo duplicati. Non è una sincronizzazione con i portali.','In Bookings you can also import a CSV with preview and duplicate checks. This is not channel synchronization.');
 buttons+=pro?action('openPropertyPerformance()','Apri il report Pro','Open the Pro report'):action("window.rbShowSalesPause('pro',{reason:'report'})",'Scopri il confronto Pro','Explore the Pro comparison');
 return `<section style="padding:24px;border:1px solid #b8dfd1;background:#f0fdf8;border-radius:20px;margin:18px 0"><h2 style="margin:0 0 10px">${t('Dalla simulazione al tuo immobile','From simulation to your property')}</h2><p>${text}</p><p>${t('Investor organizza analisi e gestione. Pro aggiunge confronto per periodo, PDF IT/EN e guida alla lettura. I ricavi prenotati non sono incassi o utile.','Investor organizes analysis and operations. Pro adds period comparisons, IT/EN PDFs and guided reading. Booked revenue is not receipts or profit.')}</p><div style="display:flex;flex-wrap:wrap;gap:10px">${buttons}</div></section>`;
}
