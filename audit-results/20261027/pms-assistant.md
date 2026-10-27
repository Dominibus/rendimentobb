# Audit indipendente PMS, coerenza e assistente

Base ispezionata: checkout `/workspace/rendimentobb`, commit `6cece488a4ff36b068498c29eb3a27ab6931c04a`. Nessuna modifica al checkout e nessuna richiesta a servizi di produzione. Riproduzione: `node /workspace/audit-rendimentobb/pms-repro.mjs`. Il primo test usa solo dati sintetici e fetch simulato. La successiva prova `pms-idempotency-emulator.mjs` usa lo stesso client e il servizio applicativo contro Firestore Emulator reale su `127.0.0.1:8089`, progetto `demo-rendimentobb-security`; nessun accesso a produzione.

## Problemi confermati

### PMS-01 — P1, continuità dell'idempotenza persa quando si alternano operazioni

- File: `js/pms-api-client.js:3`, `:11-15`, `:34-35`; protezione disponibilità `js/pms-availability.js:13`; generazione ID server `lib/pms-booking-service.js:106-115`.
- Atteso: dopo perdita della risposta alla creazione A, il retry dello stesso payload conserva il requestId anche se è stata completata un'altra operazione B nel frattempo.
- Osservato: lo slot `pending` è unico per intero account. B sostituisce A e poi cancella lo slot; ripetere A genera un requestId nuovo. Riproduzione confermata: `retryDifferentRequestId: true`.
- Impatto: se A è una richiesta `pending` già salvata dal server, il retry può creare un secondo documento: l'ID booking dipende dal nuovo requestId, e le richieste pending non sono bloccate dal controllo sovrapposizione (`pendingDuplicateAllowed: true`). Per prenotazioni confermate la sovrapposizione normalmente impedisce la duplicazione, ma il retry può diventare un errore `conflict` anziché ricevere la ricevuta originaria. Le revisioni proteggono invece la maggioranza degli update.
- Causa confermata: registro idempotenza client a singolo slot, con cancellazione incondizionata dopo una risposta riuscita; il guard UI è per chiave, non impedisce operazioni differenti.
- Soluzione conservativa: mappa persistente per uid+firma, conserva requestId dei fallimenti incerti e rimuove solo la voce risolta. Scadenza e limite dimensione espliciti. Nessuna modifica al contratto API.
- Test necessario: A committata con risposta persa → B riuscita → retry A con stesso requestId; due operazioni contemporanee con risposte invertite; ripristino sessionStorage. Prova emulatore completata: A pending viene realmente committata, la risposta è persa intenzionalmente, B pending riesce, retry A genera una seconda A. Risultato: **3 documenti reali locali, 2 Synthetic A, ID richiesta e ID prenotazione distinti, tutti pending**. Log: `pms-idempotency-emulator.log`, comando CLI concluso con exit 0. La duplicazione non è soltanto ipotetica.

### PMS-02 — P2, dati cashflow mancanti trasformati in zero nel grafico

- File `js/dashboard.js:2931-2938`.
- Atteso: cashflow assente o non numerico è N/D, coerentemente con gli altri riepiloghi che esplicitano copertura e incompletezza.
- Osservato: `Number(item.net ?? item.cashflow ?? item.annualProfit ?? 0)` restituisce zero in assenza di tutti i campi; NaN viene nuovamente sostituito con zero nella serie Chart. `{city:'Synthetic'}` e `{net:0}` producono la stessa barra; `{net:'n/a'}` viene reso zero.
- Impatto: nel confronto scenari un dato mancante appare come pareggio. Il grafico è inoltre etichettato «Profitto annuo stimato» mentre il suo primo dato è il cashflow salvato `net`, dopo il servizio del debito: terminologia da allineare, senza cambiare formule.
- Soluzione: parser finito con null per assenze, barre mancanti/N/D e tooltip sulla copertura; label «Cashflow annuo stimato». Test automatico su assente, invalido, zero e negativo.

### PMS-03 — P2, caricamento proprietà con query seriali non paginate

- File `js/dashboard.js:6248-6250`, `:6274` (loop), `:6296-6311`; riletture globali anche in `loadPMSStats` e refresh assistente `:10226-10236`.
- Atteso: portafoglio professionale caricato con quantità di dati e tempi controllati.
- Osservato staticamente: una query proprietà seguita da una query bookings per ciascun immobile, attesa serialmente e senza finestra date o limite. Il costo cresce con tutto lo storico e il numero di immobili. Non è una misura benchmark di latenza o costo reale.
- Impatto: maggiori letture Firestore e tempi, specialmente su mobile o molti immobili; assistente con refresh può moltiplicare il lavoro.
- Soluzione: riuso snapshot owned già disponibile, letture del periodo, paginazione e gestione esplicita storico. Misurare query/letture con emulatore prima di applicare.

## Evidenze positive e verifiche indipendenti

- Ripartizione per competenza corretta nel caso sintetico 30/01/2027→03/02/2027, EUR400: gennaio 2 notti/EUR200; febbraio 2 notti/EUR200. Occupazione gennaio 2/31=6,4516%. Il checkout è escluso, date civili validate; `js/pms-calendar.js:1-27`, `js/pms-operational-report.js:41-64`.
- PMS report/CSV distinguono ricavi prenotati, cashflow/ROI non disponibili, disponibilità assunta di una unità per giorno e assenza di stagionalità: `js/pms-operational-report.js:99-106,136-139`, `js/report-csv.js:14-27`. Nessuna prova che il sistema tenga contabilità degli incassi.
- `js/property-performance.js:45-66` richiede collegamento bidirezionale univoco, sospende confronti con prezzi/date/stati incoerenti o sovrapposizioni, conserva separate ipotesi previsionali e dati registrati; `:84-88` mette actualROI/actualDSCR/actualCashflow a null. Segnale progettuale positivo: prenotazioni non vengono fatte passare per utile.
- Mutazioni PMS hanno revisioni, ownership, idempotenza server e lock per proprietà; trasferimento legge entrambi gli immobili, cancellazione/deletion prendono gli stessi lock. `lib/pms-booking-service.js:91-163,190-220`. Questo è esame statico: esito reale delle transazioni concorrenti demanda al test emulatore coordinato dal root.
- CSV import limitato a 512KB, 50 righe, 60 colonne; preview, mapping, validazione locale e controllo disponibilità; riferimenti import server deterministici e fingerprint. `js/booking-import.js:5-7,36-69,100-149`, `lib/pms-booking-service.js:95-134`.
- CSV export verifica uid/immobile e neutralizza formule nei campi testo senza cambiare segno dei numeri: `js/booking-export.js:13-23`, `js/report-csv.js:3-8`.
- Stato simulatore ha firma di input, uid e tier e distingue current/stale/pending; `js/investment-analysis-state.js:3-26`. Cache report session-only, uid e TTL un'ora; `js/account-report-cache.js:20-35`. Non equivalgono a controllo server dei diritti Pro.
- Assistente PMS richiede refresh dati; se non disponibile risponde esplicitamente di non poter verificare, invece di dichiarare tutto completato (`js/chatbot/core/pms-autopilot-engine.js:25-34`). IT/EN e azioni puntano a task effettivi, con conteggi task distinti da prenotazioni e arrivi.
- `js/pms-start-guide.js:19` esplicita che importare CSV non sincronizza i portali. Nessuna evidenza qui di channel manager/OTA o invio automatico comunicazioni autorità; le relative checklist salvano dichiarazioni del gestore.

## Limiti professionali effettivi

- Il modello report assume un'unica unità per proprietà, aperta ogni giorno: camere multiple e chiusure non modellate. Questo è dichiarato, non un errore nascosto; limita l'uso per hotel/B&B multiunità senza separazione per proprietà.
- Non sono disponibili cashflow, ROI e DSCR consuntivi derivati dai dati PMS: mancano contabilità costi/incassi e riconciliazione bancaria. Non attribuire questi risultati al prodotto.
- Documenti nel PMS sono conteggi/stati operativi; non attestano adempimenti verso autorità. Cleaning/task/alert sono supporto organizzativo, non un servizio esterno eseguito.
- Il validatore booking rifiuta importo zero (`lib/pms-booking-service.js:36-38`, import `js/booking-import.js:89`): soggiorni omaggio/uso proprietario non sono rappresentabili come soggiorni validi gratuiti. È una scelta/limitazione da esplicitare e da proporre separatamente: cambiare regole operative automaticamente non autorizzato.
- Prezzi assistiti e score booking sono euristiche, non forecast calibrati né revenue management con dati canali; soglie fisse in `js/dashboard.js:7880-7917` (EUR90/130/180, durata e canale).

## Cosa resta non verificato

Non è stato eseguito qui un percorso browser autenticato completo simulatore→salvataggio→property→PMS→PDF→CSV→chatbot con identità sintetiche: il prodotto importa SDK Firebase browser e richiede un'infrastruttura di test dedicata per quella copertura. I test unitari/statici e lo snapshot sintetico non equivalgono a questo E2E. Non ho verificato lettura visuale PDF desktop/mobile, resa di navigazione, consegna email, scheduler deployato, autorizzazioni IAM reali, dati esistenti o continuità offline completa. Non considerare questi elementi superati.

## Checklist Work riproducibile

1. Account sintetici A/B; caricare analisi acquisto identica in IT/EN e salvare; annotare ID e KPI.
2. Confermare analisi come proprietà; verificare link bidirezionale e snapshot, uscire/rientrare e confrontare stessa analisi in Dashboard/PDF/chatbot.
3. Inserire soggiorno 30/01→03/02 EUR400; report gennaio/febbraio attesi 200/200 e 2/2 notti; confrontare CSV e PDF.
4. Creare pending e cancelled: esclusi dai ricavi. Due confirmed sovrapposte: conflitto. Checkout e nuovo checkin stesso giorno: consentiti.
5. Simulare risposta persa con server che ha committato: retry immediato e retry dopo altra operazione; verificare ID e numero documenti.
6. Due schede modificano stessa revisione: la seconda riceve stale_version senza sovrascrivere la prima.
7. Filtro singola proprietà poi «oggi/prossimi sette giorni»: verificare che assistente espliciti ambito «tutte le strutture» e non riusi il solo filtro.
8. Cambio account e downgrade: nessun dato A mostrato a B; cache/report e task svuotati; errori rete non diventano messaggi «nessuna attività».
9. Mobile 320/390px e desktop: calendario, dialog import/export, tastiera/focus, IT/EN e messaggi di errore; distinguere N/D da zero e campi critici prima di salvare.

## Esito aggiuntivo emulatore (confermato)

Comando da `security-tests`: `./node_modules/.bin/firebase emulators:exec --only firestore --project demo-rendimentobb-security --config ../firebase.security.json 'node /workspace/audit-rendimentobb/pms-idempotency-emulator.mjs'`. Exit 0. Sono state completate fixture (piano Investor e proprietà sintetica), tre transazioni reali `performPMSOperation`, lettura conteggi ed assertions. PMS-01 è un difetto applicativo di duplicazione riprodotto realmente nell’emulatore. La CLI ha mostrato un avviso non fatale sulla configurazione remota/MOTD, senza pregiudicare il test locale.
