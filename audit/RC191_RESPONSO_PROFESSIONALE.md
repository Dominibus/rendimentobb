# RendimentoBB — Responso professionale RC191

Audit del 23 ottobre 2026. Base: rendimentobb-main (26).zip, corrispondente al main verificato `709009cc1e7f28b1403d8e20e39fe602c02598e9` del repository Dominibus/rendimentobb. Diagnosi iniziale conservata in RC191_DIAGNOSI_PRE_PATCH.md; tabella precedente conservata in RC191_RIFERIMENTI_PRIMA.json.

## Giudizio complessivo

Il feedback di Giovanni Molinari è fondato: i riferimenti territoriali sono ipotesi statiche interne, non benchmark documentati per zona e tipologia. La patch migliora la credibilità dichiarando ciò che esiste e ciò che manca, correggendo risposte pubbliche errate del chatbot e rendendo coerente il ricavo di confronto con tariffa e occupazione mostrate. Non crea un servizio di market intelligence.

Il valore più solido del prodotto è il confronto tra scenari con ipotesi esplicite, unito all’organizzazione dei dati operativi dell’utente. La debolezza maggiore resta la rappresentatività del mercato locale. La seconda è la disponibilità PMS: il modello attuale considera ogni immobile come una singola unità disponibile tutti i giorni. Per un operatore con camere multiple o chiusure servono ulteriori sviluppi prima di leggere l’occupazione come disponibilità vendibile effettiva.

Non è emerso un P0 riproducibile nell’ambito esaminato. Questo audit applicativo e i test esistenti non costituiscono un penetration test, una certificazione fiscale o un controllo dell’infrastruttura di produzione.

## I cinque punti di vista

| Profilo | Valore riscontrato | Punto debole | Esito |
|---|---|---|---|
| Revenue Manager | ADR e RevPAR del periodo, riparto dei soggiorni a cavallo dei mesi, esclusione delle cancellazioni, separazione delle previsioni | Assenza di benchmark segmentati; disponibilità fissa; totale soggiorno ripartito uniformemente anziché tariffe notte per notte | Utile per leggere registrazioni e scenari; insufficiente per una strategia di revenue management basata sul mercato locale |
| Investitore | ROI equity e immobile distinti; cashflow, costi, debito, zero equity e immobile già posseduto gestiti nei modelli/test | I riferimenti ROI territoriali hanno basi di costo/leva ignote; score basati su soglie interne | Valore concreto come simulatore di ipotesi; nessun confronto di performance verificata |
| Consulente mutui | Rata con ammortamento, tasso zero e tassi prossimi a zero; DSCR e LTV; condizioni inserite dall’utente | Tassi dimostrativi non sono offerte; costi accessori e condizioni effettive richiedono documenti | Strumento preparatorio, non delibera o preventivo bancario |
| Property Manager | Calendario, stati, attività, documenti e registrazioni operative; demo separata e dichiarata | Registrare una verifica o un’imposta non equivale a eseguire l’adempimento; manca inventario delle chiusure nel denominatore KPI | Valido supporto organizzativo, con verifica umana e portali competenti |
| Consulente immobiliare | Confronto dei dati inseriti su due immobili e collegamenti ai portali; scenari dimostrativi dichiarati nella pagina | Il chatbot non riconosceva una domanda naturale sulla disponibilità degli annunci | Corretto il chiarimento pubblico; non è un catalogo di opportunità verificate |

## Inventario dei dati e dei metodi

A = registrazione/input dell’utente, che non implica verifica documentale esterna. B = valore calcolato. C = ipotesi. D = mercato verificato con fonte, periodo e metodo. E = demo fittizia. Nessuna tabella territoriale esaminata soddisfa D.

| Componente | Origine e formula | Categoria, territorio e limiti |
|---|---|---|
| `js/market-data.js`, RB_MARKET_DATA | 37 città; tariffa, occupazione e ROI codificati. Ora ricavo visualizzato = tariffa × 365 × occupazione frazionaria | C, ricavo B. Destinazione scenario affitti brevi. Solo nome città: zona, tipologia, capienza, campione, fonte esterna e periodo assenti. Nessuna stagionalità locale |
| `js/market-data.js`, marketData | Italia e quattro città, con ipotesi diverse da RB_MARKET_DATA | C. Utilizzata nel pricing PMS e in confronti dashboard. Non è la stessa serie del simulatore. Nessuna equivalenza statistica tra le tabelle |
| `js/chatbot/market-data.js`, `knowledge/markets.js` | Narrazioni, intervalli ROI, aree e domanda predefiniti | C; non fonti esterne. Le richieste di mercato sono intercettate dalla nuova risposta di provenienza prima dei percorsi legacy |
| `js/data-provenance.js` | Metadati espliciti, campi di fonte non disponibili impostati a null, controllo del riferimento città | C/B; nessuna data di aggiornamento del codice viene spacciata per data di rilevazione |
| `roi-engine.js` | Notti = 365 × occupazione%; lordo = tariffa × notti; commissioni sul lordo; costi esplicitamente mensili o percentuali; NOI prima di debito e imposte; imposta sul margine positivo; cashflow dopo debito | B su A/C. ROI equity = cashflow / equity; ROI immobile = cashflow / prezzo/valore indicato; Cap Rate = NOI / valore. Non sono incassi consuntivi. Modello fiscale semplificato, non selezione del regime fiscale |
| `mortgage-engine.js`, `mortgage-quotes.js`, `mortgage-rates.js` | Ammortamento mensile; servizio annuo = 12 rate; DSCR = NOI / servizio debito; LTV su capitale finanziato e valore. Sette tassi interni illustrativi (3,45; 3,60; 3,50; 3,40; 3,55; 3,48; 3,52%) | B su A/C. Preventivi manuali restano input da verificare. TAN e TAEG non intercambiabili; nessuna disponibilità bancaria attuale dimostrata |
| Risk e Investment Score | Soglie deterministiche su variabili quali ROI, occupazione, leva, copertura debito e cashflow | B su C/A. Non modello empirico predittivo, probabilità di perdita o rating certificato. Algoritmi conservati |
| Dashboard e patrimonio | Analisi salvate e immobili confermati; aggregati con copertura dei dati e collegamenti | A per registrazioni, B per aggregati, C per risultati previsti. Media delle simulazioni e ROI ponderato del patrimonio sono misure differenti; riferimento ROI 8,4% interno, basi non comparabili |
| Pricing PMS (`dashboard.js`) | Base tariffa immobile, oppure totale soggiorno / notti, oppure riferimento, oppure 120 EUR. Se riferimento presente: 70% base + 30% tabella. Mesi auto: giugno–settembre 1,15; marzo–maggio/ottobre 1,07; altri 0,92. Weekend +12% × quota notti weekend; durata ≥14 notti 0,92, ≥7 0,95, una notte 1,10; anticipo 0–3 giorni 0,92, ≥60 giorni 1,03; limite 75–145% base | C/B. Regole interne, nessuna previsione della domanda. Città non riconosciuta ora non sostituita silenziosamente con Italia. Selezione manuale stagione resta possibile; i mesi descrivono la regola automatica |
| Esempio ottimizzazione dashboard | Base 65% occupazione, 120 EUR, target 8,4%; sotto target, gap influenza esempi con coefficienti 1,5 / 5 / 2 e limiti 85% / 20% | C/B, non ottimizzazione economica del caso reale. Metodo dichiarato, nessuna modifica della formula. `suggestedPrice` nel blocco latest analysis non viene mostrato nel contenuto esaminato |
| `pms-operational-report.js` | Prenotazioni attive con stati confirmed, arrival, checkin, checkout, completed. Pending/cancelled esclusi. Checkout escluso; riparto uniforme del totale sulle notti. Occupazione = notti occupate uniche / (immobili × giorni). ADR = ricavi / notti prenotate; RevPAR = ricavi / notti disponibili | A/B; nessuna fonte mercato. Sovrapposizioni segnalate. Importi mancanti non inventati; ADR/RevPAR non disponibili se incompleti. Una unità per immobile, tutte le date: chiusure/camere multiple non modellate. Ricavi prenotati diversi da incassi e utile |
| `property-performance.js`, `report-provenance.js` | ID proprietario/immobile/analisi; confronto solo su sottoinsieme collegato. Ricavo annuo previsto ripartito sui giorni del periodo e dell’anno, senza stagionalità; distingue periodi aperti/futuri | A/B/C. La verifica del collegamento non certifica dati di mercato. Costi e incassi effettivi non ricostruiti dalle prenotazioni |
| PDF e CSV | Snapshot, importi, unità e ipotesi; report operativi distinti da simulazioni | Ereditano A/B/C, oppure E per demo. Vecchi benchmark senza evidenza non diventano D. CSV localizzati aggiungono metodo; legacy invariato |
| Immobili pubblici, demo analytics/PMS | Esempi fittizi, non feed di annunci né registrazioni dell’account | E; confronto manuale successivo A/B, senza verifica automatica delle fonti. Portali esterni senza sincronizzazione |
| SEO/Academy | Contenuti esplicativi e scenari, non rilevazioni strutturate | Le pagine di mercato pubbliche indicano già il limite del ROI cittadino. Non ricavare dati di mercato dal testo editoriale |
| Admin/Operations, cron/email, Firebase | Registrazioni e controlli operativi dell’applicazione | Fuori dal ruolo di provider mercato. Codice/configurazione e permessi conservati; non interrogati account reali né eseguiti invii durante l’audit |

## Problemi e interventi

| ID | Priorità/natura | Esito RC191 |
|---|---|---|
| B01 | P1, ambiguità metodologica | Metadati e chiarimenti su fonte, periodo, campione, zona, tipo, capienza e stagionalità nei punti rilevanti; etichette tariffa/occupazione ipotizzate |
| B02 | P2, arrotondamenti non dichiarati | Il riferimento di ricavo è derivato dai parametri mostrati. Roma: 145 × 365 × 0,76 = 40.223 EUR, prima 40.200. Non era un errore dimostrato nel motore finanziario. Rimossi minimo artificiale ±0,1% e segnali cromatici di performance nel confronto |
| B03 | P1, sostituzione geografica silenziosa | Città pricing non presente → nessun riferimento, anziché Italia. Restano le basi tariffarie dell’immobile/soggiorno e il fallback illustrativo esistente |
| B04 | P2, regole pricing opache | Spiegati blend, mesi, fattori, limiti e assenza di previsione della domanda; “regola dei mesi” anziché “rilevata” |
| B05 | P1, routing e narrazioni di mercato | Risposta pubblica di provenienza prima dei percorsi account/legacy; nessuna fonte inventata. Priorità privacy, documenti e piani conservate e testate |
| B06 | P2, spiegazioni dei PDF incomplete | Estese le note di provenienza tool e dashboard-report; nessuna fonte/periodo inventati |
| B07 | P2, unità/giudizio non omogenei | Differenze ROI in punti percentuali; colori neutri e sintesi che non giudica il rendimento in base al riferimento interno |
| B08 | P2, limite del modello di disponibilità | Esplicitato in help dashboard, PDF PMS e CSV. Nessuna falsa sottrazione di chiusure; nessuna migrazione |
| B09 | P2, interpretazione score | Chiarimento presso punteggio/rischio; nessuna probabilità o certificazione implicita, nessuna modifica algoritmo |
| B10 | P2, dati/report precedenti | Note per riferimenti legacy e interpretazione PDF; nessuna riscrittura di dati salvati |
| B11 | P3, codice legacy | `ui-engine.js` (rischio 100 − ROI) e `property-database.js` inventariati. Nessun consumer attivo dimostrato per quel risultato: non dichiarati bug dell’output attuale né rimossi |
| B12 | P1, risposta pubblica errata riprodotta | Domanda su annunci verificati/disponibili prima riceveva upgrade; ora chiarimento sugli scenari dimostrativi e sul catalogo non disponibile anche per Pro, IT/EN |

B12 è stato individuato durante il collaudo pubblico successivo alla prima diagnosi. Impatto documentato prima della correzione: solo routing di domande pubbliche sul prodotto, senza accesso ai record o cambiamento dei piani.

## Coerenza della catena

Simulatore: calcolo completato e snapshot di ipotesi normalizzate. `saveAnalysis` conserva l’analisi e le assumptions supportate; nessun cambio di schema. Dashboard: legge simulazioni salvate, collegamenti e patrimonio confermato, distinguendo la copertura dei campi. PDF tool: legge lo snapshot della simulazione; dashboard-report usa il contesto del report e i controlli di proprietà. PMS PDF/CSV: modello di periodo condiviso; valori attesi sono allocazioni delle ipotesi collegate, non ricavi consuntivi certificati. Chatbot: mantiene la priorità del PDF attivo e dei dati autorizzati, ma non trasforma riferimenti statici in fonti esterne.

I numeri nei report vecchi non sono riscritti: gli arrotondamenti storici del riferimento possono differire dal nuovo ricavo derivato. I valori della simulazione finanziaria dell’utente non cambiano per questa patch. IT/EN condividono le quantità e cambiano formato/etichette. CSV IT usa virgola decimale; EN/legacy punto. Importi nulli restano vuoti/N/A, non zero inventato.

## Collaudo effettivamente eseguito

- Baseline: 1.642 test superati. Finale: 1.699 superati, zero errori; 57 nuovi casi RC191. Suite Node completa, inclusi test di autenticazione, persistenza, privacy, import/export, report, cron/email e confini dei piani già presenti. Non sono test live di quei servizi.
- Matrice finanziaria indipendente già presente: acquisto/posseduto, equity zero/9.900/30.000, mutuo zero/60.000, occupazione zero/40/71, soluzione dell’ammortamento mediante saldo mese per mese. Ulteriori sei casi RC191: mutuo 200.000 su valore 150.000, costi 2.500 mensili, occupazione zero/40/95, entrambi i modi, cashflow negativo e nessuna mutazione degli input. Verifiche esistenti su tasso zero, quasi zero e costi percentuali/mensili.
- Tutte le 37 città: ricavo derivato e metadati di fonte assenti. Città sconosciuta e chiavi prototype non producono riferimenti. Città note mantengono la serie pricing precedente. Il test del pricing completo verifica blend per Roma, base propria per Pisa, fallback illustrativo 120 EUR senza città riconosciuta e assenza di scrittura del totale.
- PMS: fixture mensili, confini soggiorno, cancellazioni e pending, sovrapposizioni, assenze, proprietario errato, portfolio. Nuovo caso febbraio bisestile: 2 immobili, 4 notti, 800 EUR, ADR 200, RevPAR 800/58; campi chiusure/camere non modificano il denominatore, limite esplicitamente documentato.
- Otto PDF veri generati con jsPDF distribuito nel prodotto: quattro tool (IT/EN, equity zero/positiva), quattro PMS (IT/EN, singolo/portfolio). Test di generazione superati, testo estratto; ispezione visiva delle pagine di riferimento e metodo ampliate in IT/EN. Non dichiarata una sessione Pro né un download live da account. Il PDF dashboard-report è controllato tramite codice/test, non generato manualmente da un account in questo audit.
- CSV: schema legacy 19 colonne conservato; IT/EN 22 colonne, con tre colonne metodologiche in coda. Numeri precedenti invariati, protezioni formule e rilevamento import conservati. I consumer esterni che impongono esattamente 19 colonne devono usare lo schema legacy o aggiornare il parser localizzato.
- Browser pubblico su `/market/napoli/`: cinque domande corrispondenti ai cinque profili. Fonte benchmark → erroneo blocco PMS prima della patch; significato rischio → corretta esclusione della probabilità; DSCR → corretta esclusione della garanzia bancaria; documento ospite → corretta esclusione dell’invio automatico; annunci verificati → erroneo upgrade prima della patch. Le due correzioni sono provate localmente con le domande esatte e varianti IT/EN; non ancora presenti in produzione.
- Browser pubblico su `/tool/`: prezzo 150.000, equity 30.000, tariffa 150, occupazione 70%, costi 800/mese, tasso 3,5%, 20 anni, commissioni 15%, aliquota modello 21%. Risultati: 9.799,82 EUR/anno, 816,65 EUR/mese, ROI immobile 6,5%, coerenti con attesi indipendenti. Free dichiara esplicitamente assenza di salvataggio database. Nessun consenso promemoria o login effettuato.
- Nessuno script build/lint disponibile in package.json. Eseguita suite esistente e controllo sintattico dei moduli principali. Nessuna produzione modificata.

## Limiti della verifica e prossime release

La simulazione dei cinque professionisti è una valutazione ragionata supportata da codice, fixture e interazioni pubbliche; non sostituisce il feedback umano di cinque professionisti. Non assegnati voti numerici inventati. Nessuna prova end-to-end autenticata di salvataggio reale → dashboard → download Pro in questo audit. Nessuna nuova verifica fisica iPhone né promessa di collaudo completo su ogni viewport: i nuovi testi usano i layout esistenti; serve il controllo visivo dopo installazione, soprattutto per il blocco pricing lungo e i due pannelli score.

Per un benchmark D servono una fonte utilizzabile, data/periodo, metodo, campione, zona, tipologia/capienza e condizioni confrontabili. Si possono raccogliere evidenze manuali documentate senza nuove API a pagamento; non basta aggiungere una citazione generica a un numero interno. Conviene progressivamente sostituire le tabelle parallele con scenari esplicitamente configurabili e versionati; in RC191 vengono preservate per compatibilità e dichiarate distinte.

Per il PMS professionale serve un inventario delle unità vendibili e dei periodi di chiusura, con integrazione nei denominatori di tutti i report; eventuali tariffe notte per notte richiedono uno schema dedicato. Per incassi, utile e ROI consuntivi serve un libro di movimenti/costi/imposte distinto dalle prenotazioni. Sono interventi di architettura: non simulati con questa patch.

Resta sospesa la commercializzazione. Trial Investor 30 giorni invariato, PDF esclusi; Pro con PDF. Nessuna nuova API, migrazione, email, modifica dei dati degli utenti o pubblicazione remota.

## Riferimenti metodologici consultati

Definizioni, non fonti dei numeri territoriali RendimentoBB:
- STR, The Ultimate Guide to Hotel Benchmarking: https://str.com/sites/default/files/The-Ultimate-Guide-to-Hotel-Benchmarking.pdf (ADR/occupazione/RevPAR, consultato il 23/10/2026).
- Banca d’Italia, Il mutuo ipotecario in parole semplici: https://www.bancaditalia.it/pubblicazioni/guide-bi/guida-mutuo/index.html (distinzione del confronto di condizioni e costi del mutuo, consultato il 23/10/2026).
