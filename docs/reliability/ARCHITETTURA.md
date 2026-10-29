# Architettura e piano di aggiornamento controllato

## Stato di consegna

RC228 implementa la fase 1: registro pubblico versionato, controllo offline delle impronte, copertura dei JSON esterni distribuiti, modulo browser derivato e vista amministrativa informativa. Le fasi successive sono proposte da revisionare, non servizi già operativi. Nessun nuovo servizio, costo, endpoint o segreto. Nessuna pubblicazione automatica, nuova email o modifica Firestore. L'unico automatismo esistente ristretto è l'acquisizione del catalogo Inside Airbnb, sospesa per revisione delle condizioni. I controlli ISTAT, OMI e collegamenti editoriali già presenti restano distinti.

## Registro centrale (implementato)

`data/source-registry.json` è la fonte delle schede: classificazione, editore, documento, URL, licenza e suo stato, territorio, granularità, periodo, date distinte, metodologia, trasformazioni, limiti e consumatori. `publishedAt`, `sourceUpdatedAt` e `acquiredAt` non sono intercambiabili. Una data sconosciuta è null. La frequenza di revisione mensile è una scelta interna, non una dichiarazione dell'ente. Il 2026-11-29 è la prossima revisione di questa ricognizione, non una scadenza di validità del dato.

Versioni: registryVersion identifica le schede; version identifica dataset/metodo; assets[].sha256 identifica i byte distribuiti. Per i file originali si conservano anche gli hash già presenti nei dataset. baselineCommit permette di riprodurre il punto di partenza. previousVersion è null al primo censimento: non inventa un archivio precedente. Il commit Git e il diff costituiscono rollback della modifica applicativa; non un backup dei record utente.

`node scripts/audit-source-registry.mjs` non fa richieste HTTP e non scrive dati. Rifiuta schede invalide, impronte divergenti, file mancanti, percorsi fuori dal repository, incongruenze tra modulo browser e JSON e nuovi JSON non censiti nelle quattro cartelle di dati esterni. La CI esegue il controllo. Un errore impedisce il superamento del gate ma non sostituisce dati pubblicati. Le revisioni richieste sono segnalazioni, non errori di integrità: CI verde non significa fonti tutte approvate.

Il browser usa `js/source-registry-data.js`, generato dal JSON con `node scripts/audit-source-registry.mjs --write-browser`. Questo comando aggiorna esclusivamente il modulo derivato; non riscrive hash o dataset, non può approvare un'origine modificata. Il validatore e il riepilogo sono in `js/source-registry.js`. Il Centro operativo visualizza i metadati dopo l'accesso amministrativo esistente, senza altre chiamate API. Disponibilità live, sincronizzazioni e avvisi delle fonti sono esplicitamente non verificati/non collegati.

## Pipeline futura, per una fonte alla volta

1. **Abilitazione:** proprietario della fonte e revisore registrano endpoint di distribuzione, licenza applicabile all'uso concreto, rate limit e budget gratuito. Non basta che una pagina sia pubblica.
2. **Rilevazione:** job GitHub con contents:read, timeout e concorrenza limitati; una richiesta condizionale ETag/Last-Modified dove supportata. Dominio HTTPS in allowlist e controllo di ogni redirect, nessun URL utente. Nessun accesso dal browser dei visitatori.
3. **Quarantena:** archivio temporaneo privato, dimensione compressa e decompressa limitate, controllo tipo, CRC/hash e struttura; rifiuto archivi con path traversal, link simbolici e macro eseguibili. Nessun eval di contenuti remoti.
4. **Validazione:** schema, unità/valute, codici territoriali esatti, periodo non futuro/regressivo, flag, copertura e riconciliazioni. Mai riempire dati soppressi o mancanti con zero.
5. **Confronto:** diff con versione approvata; variazioni di mediana, campioni e copertura con soglie specifiche documentate. Le soglie attuali Inside Airbnb (50% mediana/campioni) sono allarmi interni, non validazione statistica universale. Nuovo anno/tipologia/schema sempre revisione.
6. **Candidato:** artifact con dati minimizzati, manifest, log sanificato, esito e scadenza di revisione. published:false. Nessun dato grezzo personale di annunci o account negli artifact pubblici.
7. **Approvazione:** PR con revisore, evidenze e test. Fase iniziale: anche candidati strutturati con controlli verdi richiedono accettazione umana. Eventuale promozione automatica di sole fonti non sensibili richiede futura autorizzazione esplicita.
8. **Rilascio:** commit atomico dati+manifest+modulo derivato. Solo dopo merge approvato Vercel applica il normale deploy. Rollback al commit dati/modello precedente testato, senza ricalcolare record.
9. **Esito:** conservare versione approvata se fallisce uno step. Segnalare errore e ultimo successo, senza aggiornare artificialmente la data del dato. Distinguere network failure, schema_changed, anomaly_review, candidate_ready, approved, rejected, published, rollback.

## Matrice di automazione

| Fonte/dato | Rilevazione candidata | Pubblicazione / revisione |
|---|---|---|
| ISTAT comuni XLSX | Sì, download ufficiale condizionale e controlli codici; futuro connettore | Nuove identità/raccordi richiedono revisione; prima integrazione sempre PR. Nessuna stima immobiliare derivata. |
| ISTAT turismo | Hash archivio già controllato mensilmente; download e trasformazione candidati estendibili | Nuovo anno, flag, revisione o soppressione richiedono revisione metodologica. |
| OMI | Integrità locale già controllata; disponibilità nuova fornitura da verificare tramite canale autorizzato | Acquisizione può richiedere accesso/condizioni; nuovo semestre, raccordi e licenza approvati prima del rilascio. |
| Inside Airbnb | Bloccata in RC228; offline ETL resta testabile | Nessuna nuova acquisizione fino a verifica condizioni/riuso e canale consentito; nessuna attivazione tramite flag in questa PR. |
| Banca d'Italia | Possibile candidato ufficiale BDS dopo scelta serie, licenza e documentazione API | Non sostituire TAN con TAEG medio; non generare offerte bancarie individuali. Non integrata oggi. |
| Normattiva, Ministeri, Agenzia Entrate | Monitor documenti/feed/API autorizzati: da progettare per atti selezionati | Sempre revisione di atto/articolo, territorio, decorrenza e modello. Nessun aggiornamento automatico delle regole. |
| Regioni/Comuni | Solo fonti e atti espliciti per competenza e territorio | Revisione sempre; nessuna regola comunale dedotta da una media nazionale. |
| Ipotesi mercato, score, demo, suggerimenti tariffa | Nessuna fonte esterna da sincronizzare | Modifiche editoriali/modello via PR e test. Non ribattezzarle dati ufficiali. |
| Input utente, prenotazioni, movimenti e PDF caricati | Non sono dataset da aggiornare dal web | Nessuna riscrittura automatica o migrazione in questo intervento. |
| Fiscalità, IVA, imposte, autorizzazioni | Solo segnalazione di possibili modifiche | Approvazione separata professionale e del fondatore; vendite e trial invariati. |

## Provenienza end-to-end (contratto proposto, non attivato)

Per le nuove simulazioni, valutare un envelope `provenance.schemaVersion`, `calculatedAt`, `model:{id,version,commit,sha256}`, `inputs:{name,value,unit,origin}`, `assumptions`, `datasets:[{id,version,period,territory,sha256,acquiredAt}]`, `limitations`. Gli hash del solo entrypoint non bastano: includere le dipendenze del motore, anche mutuo/assunzioni. Il dataset di contesto non usato nel calcolo non va inserito come input finanziario: va marcato context_only.

Persistenza, schema e migrazione richiedono revisione separata. Passare lo stesso envelope dal simulatore alla dashboard, PDF, CSV e contesto documentale Chatbot/Autopilot; il chatbot cita il record, non la versione globale più recente. Il PDF deve riportare una sintesi leggibile di periodo/modello e dettagli consultabili. CSV con campi espliciti o sidecar versionato, preservando compatibilità e protezione da formule.

Storici senza envelope: “Versione delle fonti/modello non disponibile”, senza attribuzione retroattiva della baseline RC228. Ricalcolo solo su azione esplicita, nuova analisi con nuovo ID e riferimento alla precedente, confronto input/risultati, conservazione originale e prova dei permessi. Non ricalcolare al semplice caricamento.

## Operations Center e notifiche (fase successiva)

La sezione RC228 mostra fonti/classificazione, scadenza di revisione, versione, acquisizione dichiarata e limiti del controllo. Non conosce job remoti né certifica la validità dei dati. Per collegare gli esiti occorre una revisione del canale di lettura: metadati sanificati versionati via PR oppure stato backend amministrativo con autenticazione esistente. Mai endpoint pubblico che possa attivare download o scritture.

Per le email riusare `lib/admin-operations-alerts.js` e Resend già presenti, con destinatario amministrativo fisso, ambiente production, feature flag e transazione server. Proposta: fingerprint fonte+versione+tipo errore, un digest massimo per 24h, notifica solo cambio stato o persistenza oltre soglia, idempotency key, backoff limitato e nessun dato personale/stack/segreto nel messaggio. Non integrare nella coda attuale senza test e revisione di persistenza/permessi. Un cron che si ferma non può autodenunciare il proprio fermo: resta necessario controllo indipendente del workflow.

## Piano con approvazioni

- Fase 1 consegnata: censimento, registro, controllo CI, vista informativa e restrizione acquisizione non revisionata.
- Fase 2: normalizzazione provenienza nuova analisi + PDF/CSV/chatbot; PR separata per persistenza e compatibilità.
- Fase 3: singolo connettore ISTAT in quarantena, valutazione delle revisioni e rilascio manuale.
- Fase 4: stato Operations con esiti reali, digest deduplicato; revisione server/autorizzazioni.
- Fase 5: monitor normativo con elenco atti e revisori; nessun motore legale autonomo.

Nessuna fase richiede API commerciali a pagamento. Ogni fase ha test di fallimento/rollback prima dell'attivazione.
