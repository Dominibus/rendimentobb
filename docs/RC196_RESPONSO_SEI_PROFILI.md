# RendimentoBB RC196 · Responso e sei percorsi

Verifica del 25 ottobre 2026. Base fornita: RC194, commit c513762e27a6319c75cc48fd4c54104d8f44155f. Patch cumulativa: include RC195 e il primo PMS dedicato a locali e studi. Nessuna modifica eseguita in produzione e nessun dato reale dell’account utilizzato nei nuovi esempi.

## Giudizio complessivo

Il punto più forte è il collegamento fra valutazione e gestione. Per B&B il percorso esisteva; per locali e studi mancava l’archivio operativo. Questa patch aggiunge un percorso utilizzabile: creare o trasferire uno scenario, salvarlo, confermare i contratti, verificare stanze/fasce e registrare movimenti e attività. Autopilot legge quel preciso spazio e periodo. È una prima versione operativa, non un sistema contabile o sanitario completo.

Il valore da dimostrare ai tester è concreto: «Costruisci il tuo mix e verifica come procede rispetto a ciò che registri». Non promettiamo rendimenti, tariffe di mercato o una combinazione automaticamente ottimale. Le ipotesi scelte dall’utente determinano la simulazione.

## I sei profili

Queste sono simulazioni interne dei percorsi e verifiche tecniche: non sei recensioni di utenti reali, né misure di conversione.

| Profilo | Ingresso e obiettivo | Cosa funziona / intervento | Limite ancora rilevante |
| --- | --- | --- | --- |
| Proprietario di una casa | Home → Ho già una casa → analisi | Conservata la modalità già posseduto. Il valore del bene non diventa nuovo esborso; denominatore nullo mantiene ROI N/A. Calcoli e percorso B&B coperti dalla regressione. | Canoni, domanda, costi e condizioni vanno verificati sul caso concreto. |
| Investitore | Home → acquisto → mutuo e scenari | Capitale nuovo e valore dell’immobile restano distinti. Nel commerciale può provare mensile, fasce, consumo e misto senza formule turistiche. | Nessuna raccomandazione d’acquisto o ottimizzazione automatica del mix. |
| Gestore B&B | Home → pannello / demo PMS | Flusso prenotazioni, documenti, tassa soggiorno e pulizie separato dal nuovo archivio. Il selettore della dashboard rende evidente l’altro percorso. | Non sono stati riconvalidati qui con un nuovo login tutti i movimenti di un account reale. |
| Consulente | Demo → metodo → scenari e report | Fonti, dati inseriti e risultati calcolati distinti. Report B&B IT/EN e relativi calcoli protetti dalla suite; due PDF campione renderizzati e ispezionati. | Commerciale: CSV e copia dati disponibili; PDF commerciale e portafoglio aggregato ancora assenti. |
| Proprietario di locale | Home → Locali e studi → scenario mensile → PMS | Salva uno scenario, conferma i contratti, registra canoni incassati/costi e vede differenze per competenza. Il canone non è fatturato del negozio. | Non è fatturazione fiscale, riconciliazione bancaria o gestione del business del conduttore. |
| Gestore di studi condivisi | Simulazione mista → calendario stanze/fasce → attività | Blocca sovrapposizioni; distingue canoni mensili da consumo, chiusure, singole date, incassi e segnalazioni. Autopilot segnala priorità e disponibilità. | Non gestisce pazienti, prestazioni o documenti sanitari. Segnalazioni inserite dal gestore; nessun portale esterno degli utilizzatori. |

## Chiarezza della home e mobile

La home conserva sei percorsi e aggiunge due ingressi immediati: B&B/affitti brevi e locali/studi. Il messaggio principale comprende ora entrambi gli utilizzi. Un esempio inventato mostra mensile, pacchetto e consumo e apre la demo del vero modello di gestione, senza presentare cifre come rendimenti di mercato.

Nel PMS commerciale: navigazione per Oggi, Scenari, Calendario, Movimenti, Attività e Autopilot; su schermo piccolo barra inferiore persistente, aree sicure, campi a 16px e tabelle con scorrimento interno. Hero più consistente su mobile, controlli touch e stati/fonte visibili. È un’interfaccia web in stile app: questa patch non introduce installazione PWA, notifiche push o funzionamento offline.

Il browser ha mostrato la home pubblicata a 1348px, senza overflow orizzontale del documento. La policy del browser vieta le anteprime locali: la nuova UI non è stata collaudata visivamente nel browser prima della pubblicazione. Non è stato simulato un iPhone tramite viewport non disponibile. Dopo il caricamento serve il giro reale desktop/mobile indicato nelle istruzioni.

## Calcoli e concretezza

- Demo mista 2027: stanza R1 1.200 €/mese; pacchetto R2 450 €/mese; altra fascia R2 65 €/utilizzo, 52 ricorrenze. Totale contrattuale annuo 23.180 €. Sono dati fittizi; nessuna fonte di prezzo di mercato.
- Gennaio demo: contrattuale 1.910 €, incasso registrato 1.200 €, costo registrato 120 €, saldo dei movimenti per data 1.080 €. Il saldo non viene chiamato utile netto o cashflow completo. Il diverso importo contrattuale è da riconciliare, non dichiarato automaticamente insoluto.
- Mensile: pacchetto non moltiplicato per settimane o numero di fasce. Mesi parziali proporzionati ai giorni effettivi, anno bisestile incluso. Consumo: calendario effettivo e chiusure.
- IVA non definita: netti N/A nei periodi pertinenti; nessun tasso fiscale scelto automaticamente. La demo operativa dichiara un’ipotesi senza addebito IVA, modificabile e non un giudizio fiscale.
- Incassi/rimborsi/costi hanno data effettiva e competenza distinte. Saldo cassa e confronto per competenza non vengono sommati o confrontati su basi diverse. Importi dei movimenti in centesimi interi.
- Nessun movimento futuro dichiarato effettivo; nessun rimborso superiore agli incassi registrati alla data. Annullamenti con traccia e controlli di coerenza. Contratti con movimenti protetti da riscrittura.
- Il CSV del registro corrisponde al mese selezionato; la copia JSON conserva l’intero spazio. I PDF B&B restano separati.

## Autopilot

L’assistente dedicato usa dati già caricati e autorizzati: spazio, anno, mese, revisione e fonte compaiono nella risposta. Gestisce priorità, scadenze contrattuali entro 30 giorni, attività urgenti/da gestire, disponibilità, IVA mancante e riconciliazioni. Distingue cashflow annuo del modello e saldo dei movimenti effettivi registrati. Domande non comprese richiedono chiarimento; niente risposte di mercato inventate.

È assistenza locale deterministica, senza chiamate AI esterne, esecuzione automatica o invio di messaggi. Il chatbot generale spiega il percorso e apre il PMS, ma non assume di leggere i suoi dati da un’altra pagina. Il PDF corrente mantiene la precedenza nel chatbot. Nessuna nuova API a pagamento; restano applicabili consumi e limiti dell’infrastruttura esistente.

## Archiviazione e sicurezza

Backend autenticato nell’endpoint esistente, separato per azione e servizio. Raccolte dedicate commercial_workspaces, _commercial_owners, _commercial_operations; nessun riuso di properties/bookings/analyses. Token verificato con controllo revoche, piano ricavato dal documento account lato server, UID non affidato al client. Accessi owner-only anche per Pro/admin: questa funzione non apre archivi altrui.

Transazioni e revisione attesa impediscono sovrascritture concorrenti; request ID e fingerprint impediscono retry duplicati. L’indice del proprietario limita a 30 spazi senza leggere tutti i documenti finanziari per la lista. Payload e documenti hanno limiti espliciti. I contratti vengono validati di nuovo dal server, collisioni incluse. Lettura dei propri archivi dopo downgrade consentita; nuove scritture bloccate. Uscita/cambio account e risposte asincrone precedenti non possono ripopolare la UI con dati del vecchio proprietario.

Nessuna nuova regola Firestore da pubblicare: il catch-all esistente nega accessi client diretti alle nuove raccolte; il servizio Admin applica l’autorizzazione. Nessuna nuova funzione serverless: il totale rimane 12. Nessuna nuova variabile di ambiente; si riusano le credenziali Firebase Admin già previste.

## Limiti e prossima verifica

Massimo 30 spazi/account; un anno/spazio; fino a 30 stanze, 12 fasce/giorno, 120 contratti, 100 chiusure, 500 movimenti e 200 attività per spazio. Storico sintetico ultime 100 operazioni; i movimenti e le loro rettifiche restano nel registro. Non è un archivio contabile sostitutivo dei documenti originali. Nessun cambio automatico di tipologia degli immobili B&B già salvati.

Restano da sviluppare: PDF commerciali, confronto aggregato tra spazi/anni, notifiche e portale utilizzatori, revisione contrattuale più articolata per contratti con movimenti, integrazioni esterne. Prima del prossimo ampliamento: una prova reale guidata con un gestore, completando creazione → ricaricamento → conferma → movimento → rettifica → task → CSV → Autopilot. I prezzi e le condizioni contrattuali del caso reale richiedono riscontri del proprietario.

La patch è candidata all’installazione, non una certificazione di perfezione: autenticazione e Firestore sono testati con adapter e simulatore transazionale locale, non con una distribuzione RC196 già pubblicata. Trial Investor 30 giorni senza PDF e vendite sospese invariati.


## Verifiche concluse sulla candidata

- **1.832/1.832 test Node superati**, nessun saltato/fallito. Comprendono regressioni calcoli, salvataggi, sicurezza, chatbot/PDF, PMS B&B e nuovi test del gestionale commerciale.
- **9/9 test ETL territoriali superati**. Non sono stati rigenerati i dataset territoriali né acquisiti nuovi benchmark commerciali.
- Audit strutturale: **51 pagine, 413 file JavaScript, 27 script inline, zero problemi** rilevati (percorsi locali, viewport, ID e sintassi). Controllo sintattico aggiuntivo dei nuovi moduli dopo le ultime correzioni.
- Due report PDF B&B campione, IT ed EN, quattro pagine ciascuno, generati da fixture fittizie e ispezionati dopo rendering: nessun taglio o sovrapposizione rilevati. Non sono PDF commerciali o documenti di un account reale.
- Motori ROI/mutuo/B&B, metodo economico commerciale precedente, regole Firestore, configurazione Vercel e policy vendite invariati. Le pagine legali hanno solo riferimenti cache aggiornati.
- Nessuna distribuzione automatica, nuovo account, modifica ai dati reali, invio di messaggi o email eseguiti da questo lavoro.

Queste verifiche non sostituiscono il test dell’API RC196 su Firebase reale dopo la distribuzione né il controllo visuale mobile della nuova UI. La verifica transazionale locale non è il Firebase Emulator. Nessuna certificazione fiscale, sanitaria, finanziaria o di sicurezza assoluta.
