# Inventario fonti e criticità — RC228

Base esaminata: `ad44c31c2baa72627171dd0147232bd37ea7ec48`, main dopo PR #7. Rilevazione: 29 ottobre 2026. Inventario redatto prima delle modifiche applicative. Nessuna certificazione fiscale o verifica dei dati degli account.

## Come leggere questo inventario

Il registro `data/source-registry.json` contiene le schede strutturate per le famiglie sotto elencate, i file esatti e le impronte SHA256. `REFERENCE-INDEX.csv` censisce 564 occorrenze URL in 323 file applicativi/dati/script; `SURFACES.txt` elenca il perimetro. L'indice include collegamenti di navigazione e dipendenze, che non sono automaticamente fonti dei numeri mostrati. Esclude test, documentazione e lockfile. Non certifica ogni affermazione editoriale né l'attualità di ogni URL. Le schede raggruppano dati omogenei; i JSON originali mantengono righe, territori, date e riferimenti specifici. Le voci senza data ufficiale o licenza verificata rimangono null, non sono completate per inferenza.

## Famiglie e utilizzi effettivi

| Famiglia | Provenienza e dati | Utilizzo / limiti |
|---|---|---|
| Anagrafica comuni | ISTAT, XLSX codici unità amministrative; 7.894 righe nello snapshot, riferimento 2026-02-21, acquisizione dichiarata 2026-10-25 | Picker comuni e identità territoriali. Non contiene prezzi, domanda o rendimenti. Codici testuali, raccordi espliciti; non dedurre identità da nomi simili. |
| Turismo | ISTAT DF_BULK_DCSC_OCCUPCOLLE/1.0, workbook 2_dati_comunali.xlsx, anno 2025, acquisizione dichiarata 2026-10-28, 20 capoluoghi | Contesto Mercato/Analizza, non input finanziario. Arrivi non persone uniche; presenze non camere-notti. Flag f: discontinuità del perimetro dal 2025, confronto con anni precedenti non ammesso senza revisione. |
| Quotazioni OMI | Agenzia Entrate–OMI, semestre 2026/1, 20 capoluoghi, acquisizione dichiarata 2026-10-28 | Zone/tipologie/stati/superfici distinte, intervalli vendita €/m² e affitto €/m²/mese. Non perizia, non ADR turistico, nessun trasferimento automatico alle formule. Guide e hash presenti; prova specifica delle condizioni della fornitura da conservare. |
| Annunci territoriali | Inside Airbnb, provider privato indipendente; 9 città, snapshot settembre 2026, metodo quoted-nightly-subtotal-v1 | Prezzi base pubblicizzati e segmenti con soglia minima 10, non ricavi realizzati o occupazione. Bari/Palermo/Trento estratti da archivi regionali con filtro esatto documentato. Non una fonte istituzionale. |
| Ipotesi mercato | RendimentoBB: js/market-data.js, tabelle chatbot e relative conoscenze | Valori illustrativi per città, nessuna rilevazione ufficiale, periodo osservato assente. annualRevenue legacy e formule derivate vanno distinti. Le città non giustificano benchmark locali ufficiali. |
| Mutui | Valori predefiniti interni in js/mortgage-rates.js; TAN/TAEG/spese inseriti dall'utente in mortgage-quotes.js | Nessun feed bancario. Rata a tasso costante; TAEG dichiarato non stimato, spese mancanti non zero. Banca d'Italia è solo fonte futura candidata, non origine dei tassi correnti. |
| Ricerca immobili | api/property-search.js: scenari statici per città/budget/superficie | Esempi sintetici; link ai portali sono navigazione, non prova di annunci verificati né disponibilità/prezzo attuale. Nessuna API immobiliare connessa in questo endpoint. |
| Simulatore e rischio | Input dell'utente + default interni; roi-engine.js, mortgage-engine.js | Ricavi 365×occupazione×prezzo; commissioni e costi separati. Imposta semplificata sul margine positivo, default 21: ipotesi, non aliquota validata per tutti. Score/rischio sono euristiche interne, non probabilità statistiche. |
| Commerciale/studi | Input di stanze, fasce, contratti, IVA dichiarata, costi e prestiti; commercial-property-engine.js | Calendario contrattuale e scenari economici; IVA sconosciuta resta null; non fatturato sanitario/pazienti. Demo fittizie. Incasso registrato distinto da canone previsto. Nessuna fonte di canoni reali integrata automaticamente. |
| Dashboard/PMS | Record inseriti/importati dall'account, demo sintetiche separate; property-performance, pms-booking-operations, commercial-workspace-model | Origine dichiarata utente/importazione, non revisione contabile. Checkout escluso, ripartizione per notti del periodo. Stato pulizia non prova ricavi o pagamento. Preservare separazione proprietari, proprietà, ambienti. |
| PDF/CSV/documenti | Record selezionato o documento caricato, non feed esterno; dashboard-report, report-csv, document-engine | Zero distinto da assente dopo PR #7. Il parser non certifica autenticità del PDF. La versione dello schema documento non basta a identificare tutti i dataset e il codice finanziario usati storicamente. |
| Chatbot/Autopilot | Conoscenza editoriale, regole interne e contesto corrente/documento/record dell'utente | Non collegato a ricerca normativa live. Proporre non significa eseguire. Richiede tracciabilità delle risposte alle fonti effettivamente disponibili; non attribuire alle fonti di contesto la paternità delle formule. |
| Academy, SEO, fiscale e normativo | Testi HTML e js/chatbot/knowledge, link a enti/portali e ipotesi editoriali | Registro articolo-per-articolo di atto, articolo, territorio, decorrenza e revisore ancora necessario. Un collegamento generale a un ente non valida un'interpretazione. Normattiva/Regioni/Comuni sono fonti per la revisione, non regole già sincronizzate. |
| Infrastruttura | Firebase account/record, Stripe piani, Resend invii; dipendenze e collegamenti social | Provider tecnici, non fonti di statistiche immobiliari. Mai includere credenziali, record o identificativi personali nel registro pubblico. |

## Verifiche esterne e condizioni

Consultati il 2026-10-29 (le date di consultazione non sono date di pubblicazione dei dati):

- ISTAT anagrafica: https://www.istat.it/classificazione/codici-dei-comuni-delle-province-e-delle-regioni/ ; note legali https://www.istat.it/note-legali/ ; open data https://www.istat.it/dati/open-data/ . CC BY 4.0 salvo diversa indicazione; conservare attribuzione e condizioni del singolo prodotto.
- OMI guida: https://telematici.agenziaentrate.gov.it/pdf/guidaFornitureOMI.pdf . Cadenza semestrale, intervalli zonali e obbligo di citare Agenzia Entrate–OMI; non sostituisce stima puntuale. Il CC BY 4.0 dei file locali è una dichiarazione preesistente: questa revisione non ha ricostruito la prova contrattuale dell'archivio originale.
- Inside Airbnb: https://insideairbnb.com/get-the-data/ , https://insideairbnb.com/data-assumptions/ , https://insideairbnb.com/data-policies/ . CC BY 4.0 dichiarata nella distribuzione; la pagina Data Policies richiede di non fare scraping e non ripubblicare i dati e consiglia acquisizione unica. Serve valutazione documentata dell'uso commerciale/derivato e del metodo di acquisizione. Non dedurre che la licenza autorizzi qualunque modalità tecnica. Nessuna nuova acquisizione autorizzata da RC228.
- Banca d'Italia: https://www.bancaditalia.it/statistiche/tematiche/moneta-intermediari-finanza/tassi-interesse/ e https://statistiche.bancaditalia.it/ . Serie aggregate, categorie e metodologia da selezionare prima di integrare; TAEG medio non TAN per preventivo individuale. Licenza e API della serie specifica da verificare.
- Normattiva: https://www.normattiva.it/ . Ricerca atti statali in multivigenza e collegamenti regionali. Individuare atti e decorrenze precisi; nessuna interpretazione fiscale introdotta da questa ricognizione.

## Rischi prioritari e gestione

| Priorità | Evidenza / criticità | Trattamento |
|---|---|---|
| Alta | refresh-territorial-references.py scarica e analizza HTML del catalogo Inside Airbnb; Data Policies chiede di non fare scraping | Revisione condizioni/acquisizione prima del prossimo controllo. RC228 introduce un blocco predefinito dell'acquisizione automatica nel workflow esistente, conservando tutti i dati e i controlli offline. Riattivazione solo dopo documentazione dell'autorizzazione, in PR separata. |
| Alta | Default 21% sul margine non equivale a regime fiscale validato | Revisione separata con commercialista di base imponibile, costi, IVA, contributi, capitale/interessi e competenza territoriale. Nessuna modifica automatica. |
| Alta | Report storici non contengono necessariamente impronta completa delle fonti e del motore | Nuovo contratto di provenienza proposto; non aggiungere retroattivamente una versione corrente a risultati storici. In RC228 nessuna migrazione o riscrittura. |
| Media | Dati illustrativi duplicati e assenza di sorgente/periodo per i rendimenti | Classificazione esplicita nel registro; audit dei consumatori e futura riduzione duplicazioni senza cambiare le formule adesso. |
| Media | Età/hash verificabili non equivalgono a ultima pubblicazione ufficiale | Separare integrità locale, revisione, accessibilità e periodo. Nessun badge “aggiornato” basato sul solo checksum. |
| Media | Licenza OMI originaria e uso derivato Inside Airbnb da documentare | Stato requires_review, mai source_validated globale. |
| Media | Conoscenza legale/editoriale senza mappatura puntuale degli atti | Backlog di revisione per articolo/risposta, nessuna certificazione di conformità. |
| Media | Health amministrativo non osserva oggi le esecuzioni GitHub delle fonti | La prima vista indica metadati statici e limiti; collegamento live/notifiche in revisione separata. |

## Confine della prima implementazione

Registro pubblico di soli metadati e hash, controllo offline deterministico, vista amministrativa informativa IT/EN e gate CI. Nessun download aggiunto, nessun cambiamento di formule, persistenza account, autorizzazioni o dati storici. Gli automatismi di pubblicazione e le email delle fonti sono progettati, non attivati. Vendite sospese e trial Investor 30 giorni restano invariati.
