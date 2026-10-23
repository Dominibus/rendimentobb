# RC194 — verifica pubblica e sei profili simulati

## Responso complessivo

I calcoli risultano coerenti nei casi provati; il nuovo percorso commerciale amplia utilmente la simulazione dei canoni immobiliari. **L’integrazione operativa con account, dashboard patrimoniale e PDF commerciali non è ancora realizzata.** I collegamenti di navigazione non equivalgono a un trasferimento di dati. La RC194 migliora reperibilità e continuità della guida e rende questo limite esplicito anche fuori dalla nuova pagina.

L’interesse commerciale dei sei profili è una valutazione ragionata, non un test con clienti o una misura della disponibilità a pagare. Vendite ancora sospese, Investor 30 giorni e PDF Pro del percorso B&B preservati.

## Sei profili

| Profilo | Percorso e riscontro | Giudizio / cosa manca |
|---|---|---|
| 1 · Proprietario di casa | Provato online il simulatore B&B già posseduto, valore e capitale di avvio zero: cashflow disponibile, ROI immobile N/A, nessun nuovo acquisto/mutuo presunto. Controlli automatici anche sulla distinzione del valore posseduto nel commerciale. | Percorso utile e comprensibile; il rendimento richiede ipotesi reali e un denominatore coerente. |
| 2 · Investitore | Provato online acquisto 150.000 €, capitale 150.000 €, 100 €/notte, occupazione 70%, 500 €/mese, commissioni/imposte zero per sola prova aritmetica: ricavi 25.550 €, cashflow 19.550 €, ROI circa 13,03%. Finanziamento e capitale commerciale verificati automaticamente. | Calcoli coerenti; le ipotesi non sono offerte, previsioni o indicazioni fiscali. Report operativo/integrato e CSV collaudati con accesso Pro; non creata una nuova analisi cloud per provare l’autosalvataggio. |
| 3 · Gestore B&B | Dashboard pubblica: dati dimostrativi riconoscibili, 2.520 € di ricavi, ADR 105 €, occupazione 77%, RevPAR 81,29 €. Demo PMS: 1.170 € su 10 notti, ADR 117 €, RevPAR 37,74 € su 31 giorni. Tentativo di indicare comunicazione completata con documenti incompleti correttamente rifiutato nel browser. | Le due demo rappresentano set di dati distinti, non devono coincidere. Le fasce commerciali non entrano nel calendario turistico. Non è un test dell’account operativo. |
| 4 · Consulente / analista | Verificati formule, denominatori, scenari negativi, pareggio, IVA esplicita e fonti. Riscontri territoriali turistici distinguono prezzi pubblicati da ricavi e prenotazioni reali. | Credibilità migliorata dalla trasparenza. Servono documenti del caso concreto e una base fiscale uniforme per confrontare commerciale e B&B. |
| 5 · Proprietario di locale / attività commerciale | Provato online canone ipotetico 1.800 €/mese, costi 4.800 €/anno, nessun debito e nessun addebito IVA dichiarato per la prova: ricavi 21.600 €, margine e cashflow prima imposte 16.800 €. Controllato separatamente nei test. | Utile per la rendita del locale. Non calcola vendite, fatturato o utile del negozio/bar/attività conduttrice. |
| 6 · Gestore di studi professionali o medici | Provati online due differenti unità tariffarie, scorporo IVA inserito esplicitamente e pagina EN. Calendario, costi, capacità e ricavi separati dall’attività medica. Successiva richiesta dell’utente: il caso specifico è stato rimosso dalle demo pubbliche e sostituito con tre scenari generici. | Utile per locazione/concessione di spazi, non per prestazioni, pazienti o fatturato medico. Contratti e trattamento fiscale richiedono verifica competente. |

## Problemi riprodotti e correzioni

1. **Reperibilità:** la home RC193 non citava il commerciale. RC194: richiamo nella hero, sei percorsi, voce nel menu e nel footer, accesso dalla dashboard e spiegazione nella pagina piani. Nessuna nuova voce nella barra principale desktop.
2. **Chatbot:** prima risposta commerciale corretta, ma premendo il suggerimento “Cashflow” tornava alla definizione B&B comprensiva delle imposte del modello. RC194 mantiene il solo argomento della conversazione in memoria, offre spiegazioni commerciali e suggerimenti coerenti; reset con Nuova chat o documento nuovo, uscita con tema B&B/PMS esplicito. Priorità privacy/garanzie/PDF preservata. Nessuna lettura di dati della simulazione commerciale.
3. **Collegamento nella risposta:** il percorso era testo semplice. RC194 aggiunge un link interno cliccabile IT/EN; nessun URL arbitrario ricevuto dal modello può sostituirlo.
4. **Aspettative:** dashboard, piani e home non separavano esplicitamente le nuove simulazioni dalle funzioni Pro B&B. Ora il limite è visibile: Investor/Pro non sbloccano salvataggi o PDF commerciali.
5. **Demo troppo specifica:** corretta su richiesta dell’utente. Tre esempi inventati, senza nomi o casi di clienti: stanza 1.200 €/mese, pacchetto 600 €/mese su martedì/giovedì AM, utilizzo 75 € per fascia. Immobile ipotetico 240.000 €, lavori 18.000 €, costi fissi 4.800 €/anno. Il trattamento IVA resta “da verificare”. Non sono benchmark o tariffe consigliate. I vecchi valori restano soltanto in fixture numeriche di regressione e documentazione storica, non usate dalle demo né dalle risposte pubbliche.

## Quali dati hanno riscontri veritieri?

| Dato | Stato della verifica |
|---|---|
| Risultati delle formule | Verificati aritmeticamente su casi dichiarati e con test automatici; non attestano ricavi effettivi. |
| Valori delle demo | Fittizi. Verificabili nella coerenza, non nel prezzo di mercato o nella domanda. |
| Canoni/prezzi inseriti dall’utente | Non verificati dal sito: servono contratto/preventivo datato, zona, tipologia, superficie, durata, servizi e IVA. |
| Prezzi pubblicati turistici RC192 | Fonte Inside Airbnb documentata, periodo e segmenti dichiarati. La disponibilità pubblica non distingue automaticamente prenotato da bloccato; il modello non la trasforma in occupazione reale. Non sono incassi o ADR venduti. In questa sessione verificata documentazione del provider e metodologia; non riscaricato e rigenerato l’intero dataset. |
| Riferimenti commerciali OMI | Fonte ufficiale utile per un confronto immobiliare per zona, semestre, tipologia e unità. Nella RC194 aggiunti collegamenti e metodo di verifica manuale; nessuna importazione o tariffa OMI nel calcolo. Non prova il prezzo di una stanza a ore o con servizi. |
| Incassi effettivi / margine reale | Non certificati dal simulatore o dai ricavi prenotati PMS. Occorre riconciliare pagamenti e costi documentati. |

Fonti primarie consultate il 23/10/2026:
- https://insideairbnb.com/get-the-data/
- https://insideairbnb.com/data-assumptions/
- https://www.agenziaentrate.gov.it/portale/schede/fabbricatiterreni/omi/banche-dati/quotazioni-immobiliari
- https://www1.agenziaentrate.gov.it/servizi/geopoi_omi/legenda.htm

## Connessioni reali dopo la patch

| Collegamento | Stato |
|---|---|
| Home/menu/footer → commerciale | Aggiunto nella patch. Da verificare online dopo il caricamento dell’utente. |
| Analizza/Immobili → commerciale | Già presente e verificato dal percorso browser Analizza. |
| Dashboard → commerciale | Aggiunto come accesso al simulatore separato, non trasferimento di dati. |
| Chatbot → commerciale | Guida di metodo e collegamento cliccabile; seguito commerciale corretto nei test. Nessuna lettura dei valori della pagina. |
| Commerciale → dashboard patrimoniale | Non disponibile. |
| Commerciale → PDF Pro | Non disponibile; non sbloccato dai piani attuali. |
| Commerciale → PMS turistico | Separati; nessuna conversione di fasce in soggiorni. |
| Lettura/generazione PDF B&B Pro | Accesso Pro annuale riuscito. PDF operativo di 3 pagine e integrato di 5 pagine generati, confrontati con dashboard/CSV e letti dal chatbot; risposte verificate IT/EN. Non generata una nuova analisi del tool per evitare scritture di prova nell’account. |

## Verifica autenticata Pro completata

Dopo il login protetto, verificato il segnale di accesso Pro annuale. Controllati KPI e avvisi dell’account senza cambiare proprietà, prenotazioni, lavori o collegamenti. Generati il PDF operativo mensile (3 pagine) e il PDF integrato (5 pagine), più il CSV dello stesso periodo. Ricavi prenotati, notti, occupazione, ADR, RevPAR e scostamenti coincidono tra le rispettive schermate/esportazioni con i normali arrotondamenti. Verificati i denominatori e il confronto sul medesimo sottoinsieme di proprietà, non una somma tra ambiti incompatibili.

PDF estratti e impaginazione verificata sulle pagine renderizzate. La prima resa Poppler mostrava anomalie di sostituzione del font standard; una seconda resa indipendente MuPDF ha confermato testo corretto, leggibile e senza tagli. Non apportate modifiche ai report per un difetto del renderer locale.

Caricato nel lettore del sito il PDF operativo appena esportato: il chatbot riconosce fonte, periodo e indicatori; chiedendo il cashflow dichiara che il documento non lo calcola, senza recuperare una vecchia simulazione. Passaggio a EN e risposta sui dati del PDF verificati. Poi caricato il nuovo PDF integrato: il lettore passa al nuovo documento, riconosce il confronto sullo stesso sottoinsieme e distingue stime annue da dati registrati. In una domanda composta su occupazione e ADR la risposta si concentra sul primo indicatore e propone l’altro come seguito: risposta coerente, ma migliorabile come completezza.

Difetto minore riprodotto in EN: messaggio “PDF letto: … pages”. RC194 corregge prefisso e singolare/plurale del messaggio di lettura, con test aggiunto. I dati finanziari e il parser non cambiano. Aggiunte inoltre le etichette accessibili IT/EN al pulsante dell’assistente, che manteneva il nome inglese dopo il ritorno all’italiano.

I file e le schermate dell’account sono stati utilizzati solo per il controllo interno. Non sono inclusi nello ZIP: nessun nominativo ospite, recapito, ID analisi o risultato finanziario privato viene riportato qui. Le cifre nelle tabelle precedenti sono esempi pubblici o ipotesi di prova.

## Limiti del collaudo

Le prove online sono sulla RC193 pubblicata, compresa la riproduzione del difetto conversazionale. Le correzioni RC194 sono verificate localmente con test del codice e DOM simulato: non sono state pubblicate dall’assistente. Visto lo screenshot desktop allegato e una schermata live dei risultati commerciali; non effettuata un’emulazione mobile o una prova su iPhone reale. Non presentare le sei simulazioni come persone reali o feedback di mercato.

Non modificati record utente, produzione, Firestore, piani, pagamenti o API. Modifiche demo PMS effettuate solo in memoria. Per la fase operativa commerciale servono schema cloud dedicato, permessi, salvataggi, filtri portafoglio, report commerciali e assistente contestuale, con test tra account e confronto delle basi fiscali. Questi sviluppi restano separati da questa patch di verifica/correzione.
