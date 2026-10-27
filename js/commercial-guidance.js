// Explanatory copy only: no default values, writes, tax decisions or external calls.
export const COMMERCIAL_STEPS=[
 ['Scenari: imposta anno, immobile, numero di stanze, giorni e fasce di apertura. Per un locale intero usa una sola stanza. Inserisci valori documentati; le cifre della demo sono inventate.','Scenarios: set year, property, room count, opening days and slots. For a whole unit use one room. Enter documented inputs; demo amounts are invented.'],
 ['Contratti: usa un codice generico come P01, scegli stanza e unità tariffaria. Mensile = canone al mese; pacchetto mensile = importo totale delle fasce ricorrenti; singolo utilizzo = prezzo per ogni fascia. Indica date e trattamento IVA verificato; se ignoto lascia Da verificare.','Contracts: use a generic code such as P01, choose room and billing basis. Monthly = rent per month; monthly package = total fee for recurring slots; per use = price for each slot. Enter dates and verified VAT treatment; if unknown leave To verify.'],
 ['Applica impostazioni e contratti, poi salva lo scenario nello spazio. Conferma i contratti nella gestione solo dopo averli controllati. Salvare una simulazione non registra pagamenti.','Apply settings and contracts, then save the scenario in the workspace. Confirm contracts for operations only after reviewing them. Saving a simulation records no payments.'],
 ['Movimenti: registra solo incassi, rimborsi o costi realmente avvenuti. Data effettiva = giorno del movimento; competenza = mese cui si riferisce. Esempio fittizio: incasso ricevuto il 5 febbraio per il canone di gennaio → data 5 febbraio, competenza gennaio.','Movements: record only receipts, refunds or costs that actually occurred. Actual date = movement day; accrual = month it relates to. Fictional example: rent received on 5 February for January → date 5 February, accrual January.'],
 ['Calendario mostra le fasce dei contratti confermati; Attività raccoglie cose da fare. Autopilot spiega i dati dello spazio e può aprire la sezione pertinente: non compila, salva o invia comunicazioni al posto tuo. Nessun paziente o dato sanitario.','Calendar shows confirmed contract slots; Tasks lists work to do. Autopilot explains workspace data and can open the relevant section: it does not fill, save or send messages for you. No patients or health data.']
];
export const COMMERCIAL_FIELD_HELP={
 year:['Anno di contratti e calendario: controllalo prima di iniziare.','Year used by contracts and calendar: check it before starting.'],
 value:['Valore dell’immobile posseduto o prezzo da pagare; non il canone.','Owned property value or purchase price; not rent.'],
 fixedAnnual:['Totale per tutto l’anno, non costo mensile. Se noto, costo mensile × 12; evita doppioni.','Full-year total, not monthly cost. If known, monthly cost × 12; avoid double counting.'],
 variablePct:['Percentuale sui ricavi senza IVA, non importo in euro.','Percentage of revenue excluding VAT, not an amount in euros.'],
 roomCount:['Stanze affittabili separatamente; per un locale intero inserisci 1.','Separately rentable rooms; enter 1 for a whole unit.'],
 mode:['Scegli in base al contratto: mensile, pacchetto mensile di fasce o singolo utilizzo.','Choose from the contract: monthly room, monthly slot package or individual use.'],
 amount:['Importo per l’unità scelta, con eventuale IVA inclusa. Non è il fatturato dell’attività.','Amount per chosen billing unit, including any VAT. Not business turnover.'],
 expectedPct:['Ipotesi di realizzo del ricavo contrattuale: 100 significa l’intero importo. Non è occupazione verificata.','Assumed realisation of contractual revenue: 100 means the full amount. Not verified occupancy.'],
 spaceName:['Nome generico riconoscibile, per esempio Studio test 2027. Nessun dato sanitario.','Recognisable generic name, for example Test space 2027. No health data.'],
 date:['Giorno in cui il pagamento o il rimborso è realmente avvenuto.','Day the actual payment or refund occurred.'],
 movementPeriod:['Mese a cui si riferisce il movimento, anche diverso dalla data di pagamento.','Month the movement relates to, which may differ from its payment date.'],
 movementAmount:['Importo effettivo positivo, con IVA compresa. Il tipo movimento determina se entra o esce.','Actual positive amount, including VAT. Movement type determines whether it enters or leaves.'],
 reference:['Codice generico per ritrovare il movimento, per esempio INC-01. Nessun IBAN o nominativo.','Generic code for finding the movement, for example REC-01. No IBANs or names.']
};
export function commercialGuidance(question,{english=false}={}){
 const q=String(question||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(/come.*(?:registr|inser).*(?:incass|moviment|pagament|rimbor)|how.*(?:record|enter).*(?:receipt|movement|payment|refund)|cosa.*competenza|what.*accrual/.test(q))return {text:COMMERCIAL_STEPS[3][english?1:0],target:'movements'};
 if(/compil|conpil|da dove (?:iniz|part)|come.*(?:iniz|funzion|contratt|canone)|how.*(?:start|fill|contract|monthly)|getting started/.test(q))return {text:COMMERCIAL_STEPS.map((row,i)=>(i+1)+'. '+row[english?1:0]).join('\n\n'),target:'scenario'};
 return null;
}
