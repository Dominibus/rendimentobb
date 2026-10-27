# Proposte tecniche non applicate

Queste proposte riguardano contratti finanziari, strutture dati o confini di autorizzazione. Sono consegnate separatamente dalla patch conservativa come richiesto; non sono modifiche già eseguite.

## PMS-01 — registro idempotenza multirichiesta

Priorità P1, impatto alto, complessità media, rischio medio. Intervento candidato `js/pms-api-client.js`, test client esistenti e nuovo scenario emulatore; nessun cambio al JSON del contratto HTTP o agli identificativi server già deterministici.

Attuale singleton `pending` viene sostituito da una struttura locale versionata per account e firma della richiesta. Ogni voce conserva `{signature,requestId,createdAt,state}`; mai token o dati personali nel registro. Riutilizzare il requestId finché l'esito è incerto; una B non cancella A. All'acknowledgement rimuovere soltanto la voce della richiesta risolta con stesso requestId, mai l'intero registro. Il caso stesso payload concorrente nella stessa scheda deve condividere l'identificativo. Non trasformare invece due creazioni deliberate, successive e già confermate, in un'unica prenotazione.

Compatibilità: leggere il singleton legacy e migrarlo preservando requestId e uid prima di qualsiasi nuova invocazione. Testare storage assente/corrotto/quota piena e cambio account; usare namespace distinto per account e nessun riuso cross-user. La persistenza oggi è iniettata: non assumere coordinamento fra schede se lo storage è sessionStorage. Eventuale coordinamento multitab va definito esplicitamente.

Scadenza e dimensione massima sono decisioni funzionali: non eliminare silenziosamente un'operazione incerta per fare spazio o scadere, poiché un nuovo requestId può duplicare un commit già avvenuto. Prevedere errore recuperabile/riconciliazione o un'API di lettura ricevuta, se si introduce tale requisito; quest'ultima cambia contratto e richiede ulteriore approvazione. Definire durata ricevute server prima di fissare un TTL client.

Accettazione: il probe `pms-idempotency-emulator.mjs` deve diventare un test che richiede esattamente due documenti totali (1A+1B),stesso requestId A prima/dopo e stessa ricevuta; aggiungere risposte invertite A/B,token error,reload storage,same payload concorrente,update con stale_version. Mantenere60 test Firestore e2034 Node verdi. Nessuna migrazione documenti produzione.

## FIN-01 — aggregazioni commerciali per competenza

P2, impatto medio, complessità bassa-media, rischio medio perché cambia semantica risultato. A monte dell'aggregazione annuale separare inventario contratti da contributi all'anno. Contratto senza unità fatturabili e gross=0 contribuisce zero a netto/IVA anche se regime unknown; conservare unknown e avviso nell'inventario. Per importo rilevante unknown resta null, non assumere esenzione. Non applicare ciecamente una regola zero se esistono costi/quote indipendenti dalla competenza.

Accettazione: fixture annuale2027 con A1 imponibile3000 e A2 solo2028 unknown: netto annuale3000,cassa600 e somma mesi3000. Test unknown con ricavi>0 continua N/A;per-use chiuso;expectedPct0;contratto parziale e anno bisestile. Nessun saldo o documento preesistente ricalcolato automaticamente.

## FIN-02 — input invalidi al confine ROI

P2 difensivo, impatto potenziale alto per nuovi caller, complessità media. Separare debito assente da durata invalida con debito positivo. Number.isFinite sui numeri e validazione esplicita su null/stringhe/percentuali. Proporre errore strutturato o risultato inapplicabile prima del calcolo, preservando i casi validi. Non sostituire silenziosamente NaN/Infinity con zero dopo aver calcolato rischio/score.

Compatibilità: inventariare tutti i caller (homepage,tool,snapshot,report,comparazioni); alcuni dipendono da fallback numerici legacy. Definire contratto invalid-input versionato senza cambiare formule valide. Nessun ricalcolo/migrazione storico automatica. Accettazione: identità ricavi−commissioni−costi−imposte−debito=cashflow su ogni risultato numerico; test malformed,Infinity,null,durata0,zero interest,prezzo/equity0 e638 verifiche indipendenti mantenute.

## PMS-02,OPS-01/02 — completezza e operatività

Grafico: distinguere null/invalid da0 usando parser finito,barre mancanti con tooltip N/D,label «Cashflow annuo stimato». Non cambiare dati salvati o formule. Test zero/negativo/assente/invalido.

Reminder: definire SLA prima di cambiare cron. Query su stati e finestra di scadenza con indice/paginazione; nessun salto intero per201 storico. Drenare20-account pages entro budget e registrare lag/cursore; se serve continuazione più frequente, proposta su limiti/costi infrastrutturali da approvare. Test21/100account,201 bookings,backlog e budget scaduto. Non inviare email reali nel test.

## SEC-01 — funzionalità premium e autorizzazioni

P2 attuale,P1 se requisito paywall resistente prima lancio. Decisione richiesta: accettare formalmente rendering pubblico client,oppure progettare artefatti premium realmente autorizzati sul server. Nel secondo caso endpoint verifica token revocabile,piano attuale,ownership,input/budget e rifiuta Free/Investor indipendentemente da JS del browser. Non promettere protezione semplicemente offuscando codice o nascondendo pulsanti. Nessun blocco retroattivo dei dati propri dopo downgrade senza decisione contrattuale. Costi e architettura da stimare prima di introdurre servizi.

## Dipendenze,CI,CSP e affidabilità bootstrap

Aggiornamenti dipendenze in patch dedicata,lock congelato/installazione riproducibile e suite Stripe/emulatore; non usare audit fix --force. CLI Firebase major richiede compatibilità esplicita Node/Java. Proposta CI PR con suite Node/Python/emulatore e check non eludibile,da verificare con branch protection separatamente. CSP introdotta gradualmente con inventario CDN/inline e report-only prima di enforcement. Modulo calcolo puro inizializzabile senza SDK Firebase; fallimento account/storage deve avere messaggio specifico senza bloccare la sola simulazione. Questi refactoring non fanno parte della patch testuale.
