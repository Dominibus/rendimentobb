# RC192 — Benchmark territoriali a costo zero e verifica PMS

23 ottobre 2026. Base RC191 pubblicata, main GitHub `2def26a9403532ea366c3e211e846a3fda88397e`. Nessuna modifica remota o scrittura di dati utente effettuata. Diagnosi e limiti d’impatto in RC192_DIAGNOSI_PRE_PATCH.md.

## Risultato concreto

È stata implementata una nuova serie documentata di **prezzi base pubblicati**, consultabile in Mercato, nelle quattro guide città e nel pannello Mercato del simulatore. Fonte, zona, tipologia, capienza, periodo di osservazione, mese e durata del soggiorno quotato sono effettivi campi dei dati, non etichette aggiunte alle vecchie costanti.

La soluzione usa snapshot gratuiti di Inside Airbnb e calcolo offline con libreria standard Python. Nessun contratto, nuovo provider a pagamento, nuova funzione server, cron o API esterna dal browser. La pagina richiede solo file statici dello stesso sito. Gli aggregati e il CSV sono pubblici, con attribuzione e licenza. I record degli annunci non sono inclusi nella patch.

**Non sono stati ottenuti ADR incassato, occupazione effettiva o ROI territoriale verificato.** La fonte non dimostra questi valori. Il nuovo confronto è professionale nel senso di tracciabile, segmentato, riproducibile e delimitato; non è una statistica certificata o una valutazione del rendimento locale. Per consuntivi territoriali servirebbero registrazioni documentate e autorizzate di più operatori comparabili, con notti vendibili e vendute, ricavi alloggio, periodo e tipo/unità definiti. I dati PMS di un singolo account restano dati dell’utente, non una media della zona.

## Dati elaborati

| Città | Snapshot provider | Righe esaminate | Osservazioni ammesse | Segmenti con n ≥ 10 |
|---|---|---:|---:|---:|
| Napoli | 19/09/2026 | 11.737 | 9.753 | 197 |
| Roma | 17/09/2026 | 37.451 | 31.763 | 535 |
| Milano | 19/09/2026 | 25.338 | 19.035 | 387 |
| Firenze | 19/09/2026 | 13.571 | 11.498 | 178 |
| Totale | | 88.097 | 72.049 | 1.297 |

Le osservazioni ammesse comprendono anche segmenti che restano sotto soglia e quindi non pubblicano prezzi. I conteggi non sono clienti, immobili unici fisici o notti vendute. Le date effettive di osservazione differiscono dalla data nominale dello snapshot e sono visibili nei risultati.

Caso controllato indipendentemente sul file Napoli: San Lorenzo, camera privata in B&B, 2 ospiti, una notte, check-in settembre 2026. n=151, P25=75 EUR, mediana=92 EUR, P75=114,12 EUR. Il ricalcolo usa statistics.median e quantili inclusivi, senza importare il codice ETL. Sono prezzi base offerti in quel campione/periodo, non ADR delle notti vendute.

La mediana viene mostrata solo per il segmento esatto. Sotto soglia compare “Campione insufficiente”; nessuna sostituzione silenziosa con una città o tipologia più ampia. Vengono dichiarati i limiti del campione e della geocodifica, la classificazione dichiarata dagli host, l’assenza di normalizzazione per qualità/servizi/superficie e la possibilità di duplicati fisici tra annunci diversi. La soglia 10 è una scelta interna, non una garanzia statistica.

## Coerenza con il prodotto

- Nessun input o analisi viene cambiato automaticamente dal confronto. La città iniziale del pannello nel tool segue il selettore quando disponibile; il confronto mantiene i propri filtri espliciti. Non si applica una tariffa al PMS o al simulatore senza un intervento dell’utente.
- Le vecchie tabelle di tariffa/occupazione/ROI rimangono ipotesi C chiaramente separate. Non sono “certificate” dalla nuova fonte.
- Le risposte del chatbot indirizzano al confronto documentato e distinguono i prezzi pubblicati da ADR, occupazione e rendimento. La nuova serie non è ancora un motore di risposta conversazionale con lettura automatica dei filtri: i numeri documentati si consultano nel pannello e si esportano con fonte nel CSV.
- Il CSV del nuovo confronto è distinto dal CSV delle prenotazioni/performance PMS e conserva fonte, periodo, unità e metodo. Campi incassato/occupazione/ROI non vengono inventati. Testate anche protezioni da formule nei testi.
- PDF tool/dashboard e dati salvati mantengono il significato della simulazione precedente. La nuova serie di prezzi non viene inserita automaticamente nei PDF finanziari o nei record salvati: nessuna perdita silenziosa di provenienza nel presentarla come riferimento di rendimento.
- UI IT/EN con etichette e metodo bilingui, layout responsive. Nomi delle zone e tipologie non tradotte restano quelli della fonte. Nessuna nuova API o libreria runtime.

## PMS: verifiche eseguite e correzioni

Browser pubblico su demo IT e EN: calendario, scheda, documenti e cancellazione. Stato iniziale: 1.170 EUR, 10 notti, occupazione 32,3%, ADR 117 EUR, RevPAR 37,74 EUR, 9 attività. Documenti portati a 2/2 e comunicazione dichiarata completata: attività a 7, importi invariati. Cancellando il soggiorno demo da 480 EUR/4 notti: 690 EUR, 6 notti, occupazione 19,4%, ADR 115 EUR, RevPAR 22,26 EUR, 4 attività; calendario liberato. Ripristinati gli esempi al termine. Versione inglese osservata con gli stessi numeri e testo localizzato.

Discrepanza riprodotta: prima della patch la demo accettava comunicazione autorità “Completata” con 1 documento su 2 e rimuoveva la relativa attività. L’API reale rifiuta questo stato. La patch allinea la validazione demo, con messaggio IT/EN specifico e nessuna falsa conferma di invio. Allineato anche il rifiuto degli importi alloggio pari a zero, già presente nell’API reale. Nessuna modifica all’API o ai dati reali.

Verifiche automatiche sul PMS reale tramite fixture e suite: esclusione pending/cancelled, competenza dei soggiorni fra mesi, checkout escluso, soggiorni consecutivi nello stesso giorno, sovrapposizioni, importi mancanti, proprietà/account errati, documenti/attività, tassa e pricing. Un nuovo caso di turnover verifica due soggiorni adiacenti: 4 notti, 500 EUR, ADR 125 EUR, zero sovrapposizioni; la partenza non blocca l’arrivo successivo.

Limite confermato: denominatore occupazione/RevPAR = una unità per immobile per ogni giorno del periodo. Non esistono attualmente chiusure/camere vendibili interpretate coerentemente da API, regole, calendario e report. Non sarebbe corretto aggiungere soltanto una casella “chiuso” o abbassare il denominatore senza modificare l’intero contratto. Questo sviluppo resta da progettare e collaudare come intervento dedicato, senza migrazioni distruttive.

La verifica autenticata dell’account reale non è ancora eseguita: occorre login protetto Investor/Pro; per PDF/report completo serve Pro. Le prove pubbliche e automatiche non equivalgono a un test live del database o degli invii email.

## Collaudo e confini

- Suite Node: **1.712 test superati, zero errori**, di cui 13 nuovi casi RC192 rispetto ai 1.699 della base.
- ETL Python: **9 test superati** su quantili, deduplica ID, segmentazione, soglia, EUR, date, disponibilità della quotazione, preventivi mensili, valori assenti e assenza di campi personali nell’output.
- Tutti e quattro i dataset validati: schema, fonte, periodo, conteggi, numeri finiti, null sotto soglia; nessuna occupazione o redditività inventata.
- UI effettiva eseguita su DOM di test: caricamento dati reali, filtri, cambio lingua, fonte visibile e richieste solo allo stesso sito senza credenziali. Esportazione CSV testata su valori, unità, date e fonte.
- Tentata anteprima interattiva locale nel browser, ma il browser remoto non raggiunge il server locale (connessione rifiutata). Non dichiarato un collaudo visivo della nuova patch in produzione o su iPhone. Il layout richiede verifica dopo il caricamento.
- ROI, mutuo, API PMS, modello KPI PMS, Firestore rules, Vercel, piani, cron/email e sospensione commerciale conservati. Nessuna scrittura remota. Nessun test di pagamento.

## Aggiornamento e fonti alternative

L’aggiornamento è manuale sugli snapshot gratuiti disponibili. Il pacchetto include programma riproducibile, configurazione delle quattro fonti e checksum. Procedura e schema in data/territorial/README.md. Il browser non scarica automaticamente nuovi dataset dal provider; la disponibilità futura e la continuità della copertura non sono garantite. Una nuova versione richiede aggiornare configurazione/checksum, rigenerare aggregati e cache, eseguire i test e ripubblicare.

OMI è utile per quotazioni di acquisto/locazione per zona e semestre, non per tariffa turistica o ADR; i servizi ufficiali sono stati individuati ma le pagine di dettaglio hanno restituito errore di accesso durante questa ricerca. Non sono stati inventati o importati valori OMI. ISTAT offre capacità e flussi turistici con metodologia ufficiale, ma non è stato trasformato in ADR o occupazione dello specifico alloggio. Potranno arricchire il contesto in una release distinta.

Fonti primarie consultate:
- Inside Airbnb, download e licenza: https://insideairbnb.com/get-the-data/
- Inside Airbnb, assunzioni e limiti: https://insideairbnb.com/data-assumptions/
- Inside Airbnb, politiche: https://insideairbnb.com/data-policies/
- Dizionario dati collegato dalla fonte: https://docs.google.com/spreadsheets/d/1iWCNJcSutYqpULSQHlNyGInUvHg2BoUGoNRIGa6Szc4/edit
- Creative Commons, CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Agenzia Entrate, forniture OMI: https://www.agenziaentrate.gov.it/portale/schede/fabbricatiterreni/omi/forniture-dati-omi
- ISTAT, movimento clienti: https://www.istat.it/informazioni-sulla-rilevazione/movimento-dei-clienti-negli-esercizi-ricettivi/

Il confronto di prezzi è ora concreto e gratuito; l’occupazione di mercato resta non dimostrata. Il PMS mantiene valore organizzativo e indicatori sui dati registrati, con i limiti di inventario dichiarati. Non vengono promessi guadagni o adempimenti automatici.
