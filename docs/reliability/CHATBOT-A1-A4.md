# Correzioni chatbot A1–A4 e collaudo Work

Base: main `d81d254008d4b8356d3a3b552859dc704e27dea9` (RC229), verificata tramite GitHub il 30 ottobre 2026; nessuna PR aperta al controllo iniziale. Il fetch Git locale è impedito dalla connessione al proxy: non è una verifica negativa del sito. Branch `fix/chatbot-a1-a4`. Lo SHA finale è quello del commit della PR, non una versione retroattiva degli storici.

## Inventario precedente all'implementazione

- A1, alta: «Portami alla prenotazione da gestire» / «Take me to the booking I need to manage» senza PMS caricato producevano un conteggio zero. I template legacy usavano `value || 0`.
- A2, media: «Does OMI determine my property price?» attivava abbonamenti per la parola `price`; l'equivalente italiano riceveva un chiarimento generico.
- A3, media: «Perché il ROI è N/A?» / «Why is ROI N/A?» ricevevano il blocco analisi per Free anziché una spiegazione del metodo.
- A4, media: numero, fonte e aggiornamento ricevevano un chiarimento non pertinente alla schermata; nessuna distinzione operativa delle date.
- A5 resta fuori implementazione: [proposta separata](PROPOSTA-PROVENIENZA-NUOVE-ANALISI.md).

## Comportamento implementato

`evidence-response-engine.js` legge il contesto corrente a ogni richiesta. Non conserva numeri, proprietà o fonti in memoria conversazionale. Il loader usa il modulo pubblico del registro esistente, senza download da provider. Se mancano i metadati, dichiara l'assenza; se manca il modulo di evidenza obbligatorio, l'assistente risponde indisponibile invece di riattivare i vecchi default.

A1 distingue accesso, snapshot assente/incompleto, lettura in corso, lettura fallita, vuoto verificato e popolato. `rbPMSSnapshotLoad` è solo stato in memoria del caricamento esistente; query e regole Firestore restano quelle dell'account. Le query conservano l'identità iniziale durante gli await; una risposta precedente non sostituisce una lettura nuova. Il cambio account/logout elimina lo stato.

Le richieste di apertura propongono soltanto ID salvati in prenotazioni con proprietà presente nella directory autorizzata. Il filtro proprietà corrente restringe la selezione; una proprietà esplicitamente nominata deve essere riconosciuta. Non vengono creati ID, URL o prenotazioni. L'apertura usa `open_booking`, senza transizioni di stato. Il pulsante ricontrolla account, demo, filtro proprietà e presenza della prenotazione al clic. Dopo un cambio contesto occorre una nuova selezione. Le demo sono etichettate e non sostituiscono lo snapshot account.

A2 spiega OMI prima della regola commerciale generica su `price`: intervalli per comune/zona/tipologia/stato/semestre, unità vendita/locazione e superficie. Non perizia o prezzo puntuale, ADR turistico o rendimento garantito. Le domande esplicitamente commerciali Investor/Pro mantengono il percorso esistente.

A3 spiega per tutti i piani il denominatore zero e i dati insufficienti, distinguendoli. Non legge cache di risultati personali, non attribuisce una causa personale e non modifica il blocco dei risultati riservati.

A4 chiede numero/indicatore e contesto specifici di simulatore, Mercato, Dashboard, report o PDF. Per una fonte esplicitamente scelta mostra solo metadati disponibili della distribuzione corrente: classificazione, editore, copertura, periodo osservato, acquisizione dichiarata, data dell'inventario, ultimo aggiornamento osservato. L'ultimo controllo remoto non è disponibile: l'inventario non viene rinominato controllo online. PDF e storici non ereditano il registro corrente.

## Riproduzione e test

Da checkout del commit della PR, Node 24:

```sh
node tests/chatbot-evidence-a1-a4.test.js
npm test
node tests/pms-calendar.test.js
node scripts/audit-source-registry.mjs
node tests/rc213-financial-identities.mjs
python3 -m unittest discover -s tests -p '*.py'
git diff --check
```

I 41 test nuovi caricano le regole nell'ordine del loader applicativo, con motore intenti e risposte reali e servizi browser simulati. Verificano testi completi IT/EN, limiti, assenza di numeri riservati, metadati e azioni, inclusi selezione, cambio proprietà, account/logout, demo, errore di lettura, metadati mancanti, cambio PDF, storici e fallimento del modulo obbligatorio. Il test del pulsante esegue il renderer e il suo handler; quello del caricamento esegue il prefisso asincrono effettivo di `loadPMSStats`, prima del rendering KPI.

Le asserzioni esistenti sulle versioni degli asset sono aggiornate ai nuovi URL di cache; le asserzioni di comportamento e sulle condizioni commerciali sono preservate. Nessuna impronta dei dataset è stata aggiornata per aggirare controlli.

### Esiti e confini

- Locale: 41 regressioni nuove passate; ultima suite completa 235 file-test passati e solo calendario bloccato da EPERM. Identità finanziarie: 638 controlli passati. Python: 37 test passati. Registro fonti e diff: controlli passati. Gli esiti GitHub sono riportati nella PR.
- Calendario locale: il caso che usa `execFileSync` incontra `spawnSync ... EPERM`; gli esiti del runner GitHub della PR devono essere letti separatamente per verificare quel sottoprocesso in ambiente compatibile.
- Browser reale e produzione autenticata: non verificati da questi test VM. Nessuna scrittura in record account durante lo sviluppo.
- Nessuna modifica a formule, fiscalità, regole/autorizzazioni, persistenza, vendite sospese, Investor 30 giorni o PDF. Nessuna acquisizione dati, email, pagamento o API a pagamento. Nessun intervento Netlify.
- Nessun merge o deploy manuale. Il merge su main avvia Vercel e richiede approvazione del fondatore.

## Checklist browser per Work

Usare una preview autorizzata o ambiente isolato e dati sintetici; nessuna modifica ai dati reali. Annotare URL, SHA, piano, lingua, proprietà e osservato.

- [ ] IT/EN, 390 e 1440 px: assente, caricamento lento, errore offline, retry riuscito, snapshot vuoto e popolato; nessuno zero in sostituzione di indisponibile.
- [ ] «Portami alla prenotazione da gestire» / «Take me to the booking I need to manage»: selezione fra soli soggiorni autorizzati, apertura dell'ID esatto, nessuna modifica automatica.
- [ ] Proprietà A → B, filtro tutte/proprietà, proprietà esplicitamente nominata e proprietà sconosciuta: nessuna destinazione inventata o sostituzione con altro immobile.
- [ ] Pulsante già mostrato → cambio proprietà, logout, altro account, prenotazione rimossa: azione rifiutata e richiesta nuova selezione.
- [ ] Demo → account e account → demo: etichetta e isolamento; nessuna prenotazione reale esposta in demo.
- [ ] OMI/prezzo immobile IT/EN: limiti, unità, territorio, tipologia e semestre; domande prezzo Investor/Pro e PDF restano commerciali.
- [ ] Free: ROI N/A spiegato senza risultati riservati; la domanda successiva sul proprio ROI resta protetta. Confrontare capitale zero e dati mancanti.
- [ ] Numero/fonte/aggiornamento in simulatore, Mercato, Dashboard e report: chiarimento pertinente alla schermata.
- [ ] OMI e turismo selezionati: periodo, acquisizione e inventario distinti; nessuna promessa di controllo live o ultima pubblicazione.
- [ ] PDF A → B e storico senza provenienza: nessuna attribuzione del registro corrente; nuovo documento nominato correttamente.
- [ ] Cambio lingua, nuova conversazione e logout: nessun valore/ID della conversazione precedente nel nuovo contesto.
- [ ] Vendite sospese, Investor di 30 giorni, PDF esclusi da Free/Investor; nessuna prova di 7 giorni.
- [ ] Navigazione da prenotazione al punto iniziale, tastiera e focus; mancato caricamento metadati gestito senza numeri inventati.
