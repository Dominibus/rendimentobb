# RC197 · Verifica dell’esperienza e responso dei sei profili

25 ottobre 2026. Base controllata dal vivo: RC196 pubblicata, commit 9274968a4ba1c4ee859c1600bb397aa48a2cc91f. RC197 è una patch da caricare: non è stata pubblicata da questo audit.

## Giudizio

Il portale offre ragioni concrete per provare simulazioni e gestione. L’ingresso B&B / locali e studi è riconoscibile; demo senza account ed esempi dichiaratamente fittizi aiutano a capire prima di registrarsi. Non considererei ancora dimostrata la propensione a pagare: servono uso ripetuto, risparmio di tempo misurato e feedback di persone reali. Le vendite sono attualmente sospese; il percorso immediato è demo, programma tester e richiesta di interesse.

La lunghezza della home e la quantità di informazioni restano un limite di attenzione: gli ingressi principali devono restare prioritari. Non aggiungere altri blocchi promozionali prima delle prime azioni. Il valore più forte è il passaggio da ipotesi a operatività, mantenendo distinti dati inseriti, calcoli, movimenti registrati ed evidenza di mercato.

## Sei prospettive simulate

Queste sono valutazioni dei percorsi da parte dell’audit, non interviste a sei persone o percentuali di conversione.

| Profilo | Percezione al primo accesso | Motivo per iscriversi o diventare tester | Condizione per un futuro abbonamento |
| --- | --- | --- | --- |
| Proprietario di casa già posseduta | Il percorso dedicato evita di confondere valore dell’immobile e nuovo esborso. Può provare senza account. | Salvare e confrontare il proprio scenario. | Uso continuativo o gestione attiva: una simulazione occasionale può non giustificare un canone. |
| Investitore che acquista con mutuo | Simulatore, finanziamento e confronti costituiscono un percorso comprensibile. Le ipotesi devono restare evidenti. | Verificare più combinazioni di capitale, costi e occupazione. | Report utili alle decisioni e fonti verificabili; nessun esito bancario o rendimento garantito. |
| Gestore B&B | Calendario, attività, prenotazioni e analisi rendono il valore ricorrente più evidente. | Confrontare la demo con il proprio lavoro quotidiano e provare il PMS. | Dati completi, affidabilità delle operazioni e tempo risparmiato. Invii agli enti e sincronizzazioni OTA non vanno intesi come automatici. |
| Consulente immobiliare | Metodo e PDF sono interessanti; per raccomandazioni professionali manca ancora sufficiente evidenza territoriale. | Provare confronti e leggibilità dei report. | Fonti documentate per zona, tipologia e periodo; tracciabilità delle ipotesi. La demo non è un benchmark. |
| Proprietario di locale commerciale | L’ingresso dedicato è visibile e separa canoni immobiliari e attività commerciale. | Simulare locazione, costi e debito; gestire contratti e movimenti. | Utilità periodica del registro e del calendario. Il prodotto non stima vendite o profitto del negozio. PDF commerciale ancora assente. |
| Gestore di studi condivisi / studio medico | Canoni mensili, pacchetti e consumo corrispondono a una necessità concreta. Il primo accesso al cruscotto deve essere semplice. | Verificare disponibilità, contratti, chiusure, attività e Autopilot nella demo. | Prova operativa prolungata. È gestione degli spazi con codici, non cartella clinica, agenda pazienti o software sanitario. |

## Difetti riprodotti e corretti nel sorgente

1. Nota in home allineata al bordo sinistro invece della griglia: separati contenitore e descrizione, senza nascondere il problema con overflow:hidden.
2. Collegamenti commerciali nella pagina piani troppo vicini: navigazione con spaziatura, stati di focus e tasti accessibili anche nello stile mobile.
3. Scelta B&B / commerciale e nota nella dashboard staccate dal contenitore centrale: allineate alla griglia della dashboard.
4. Demo PMS commerciale aperta sull’editor lungo: caricamento iniziale su Oggi quando esiste uno spazio; archivio vuoto continua a proporre la creazione.
5. Selezione R2 persa al cambio mese: conservata e rivalidata rispetto alle stanze disponibili.
6. Editor incorporato con messaggio di scenario vuoto, provenienza utente per dati demo e vecchia anteprima “non è ancora il PMS”: corretti testo, provenienza e contenuti contestuali.
7. Quattro metriche disposte tre più una e stato incorporato sovrapposto: griglia 4/2/1 e messaggio statico nell’editor; indicazione delle operazioni in corso.
8. Assistente generale: domanda su stanze di uno studio dopo il calcolo rapido B&B riceveva un rimando generico al simulatore turistico. Aggiunto riconoscimento esplicito delle stanze/studi in italiano e inglese, con test positivi e negativi e rispetto della priorità privacy/documenti. Specificato l’uso di codici generici. Aggiornata la catena delle versioni dell’assistente fino alle pagine di ingresso.

## Verifiche dal vivo

Browser desktop con viewport 1348 px. Home, simulatore B&B, mutui, immobili, mercato, Academy, guida all’apertura, ROI, costi, guadagni, chi siamo, contatti, partnership, competenze, piani, richiesta di interesse, privacy, termini, recesso, login, dashboard, demo analisi, demo PMS B&B, simulatore commerciale e PMS commerciale IT/EN. Non rilevato scorrimento orizzontale del documento nelle misurazioni svolte. Non emerse altre scritte illeggibili nelle viste ispezionate; non è una certificazione completa di accessibilità o contrasto di ogni elemento.

Il difetto segnalato in home è reale ma non allarga il documento: il paragrafo era a x=0 con larghezza 510 px, mentre le sezioni adiacenti partivano da x=84, larghezza 1180 px. La patch ricompone la griglia.

Calcolo rapido in home eseguito: restituisce la stima e dichiara mutuo e imposte esclusi. Lo scenario misto commerciale restituisce 23.180 euro di corrispettivi annui; con IVA non verificata mantiene correttamente N/A sui valori netti. Il collegamento storico /#pricing è gestito dal codice della home e non è stato trattato come un link rotto.

Nella sola demo commerciale in memoria: gennaio contrattuale 1.910 euro, incassi iniziali 1.200 e costi 120. Registrato incasso fittizio di 450: incassi 1.650, saldo 1.530, contratto riconciliato. Autopilot risponde correttamente anche a “incasi”, con fonte e revisione. Completamento attività e riapertura disponibili. Nessun dato reale inserito o modificato.

Accesso Pro annuale riuscito: aperti archivio commerciale, proprietà, prenotazioni, navigazione mensile, ROI/portfolio e dialogo report. Scaricati PDF e CSV del report B&B; PDF riconosciuto, cinque pagine con testo, CSV non vuoto. Questo verifica produzione dei file, non una nuova revisione grafica pagina per pagina del PDF. I file privati non fanno parte della consegna.

Assistente generale: apertura dalla home e spiegazione del report Pro pertinenti, con limiti degli acquisti e della prova. Riprodotto e corretto nel sorgente il caso studio/stanze sopra descritto. L’Autopilot commerciale locale legge solo lo spazio selezionato; l’assistente generale non viene presentato come lettore dei valori commerciali.

## Limiti e attività ancora necessarie

- Verifica visiva dopo pubblicazione della RC197: questa sessione ha osservato la RC196 dal vivo; i nuovi stili e il riconoscimento corretto dell’assistente sono verificati nel sorgente e con regressioni, non sul sito già aggiornato.
- iPhone reale: lo strumento disponibile non espone emulazione o modifica del viewport. Esaminati screenshot fornito e regole responsive; non dichiarato un test reale a 390 px, né un’app nativa o una PWA completa.
- Scrittura nell’archivio commerciale reale non eseguita: accesso, caricamento e abilitazioni osservati, operazioni complete provate nella demo e nei test. Nessun contratto o pagamento reale creato per il test.
- Form di contatto, richieste di interesse, registrazione e acquisti non inviati. Ruoli Admin e Investor non autenticati nuovamente: la visita pubblica e il controllo Pro non equivalgono al collaudo di tutti i permessi reali.
- Non cliccati tutti i link esterni né tutte le combinazioni di ogni schermata; le pagine territoriali ripetute non sono state ciascuna navigate. Non chiamare questo audit una garanzia universale di assenza di bug.
- Benchmark professionali per zona/tipologia/periodo, PDF commerciali e validazione con tester reali restano i principali passi per ampliare il valore commerciale.

## Test e compatibilità

Risultati finali e file inclusi sono riportati in INSTALLAZIONE_RC197.md. Nessuna modifica a motori finanziari, modello commerciale, API, regole Firestore o autorizzazioni server. I cambi alle pagine non direttamente interessate sono versioni header/loader per rendere disponibile la correzione dell’assistente. Nessun manifest o documento di account nel pacchetto.
