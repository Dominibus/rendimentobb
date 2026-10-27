# Audit indipendente — architettura, UX/browser, SEO, performance, operations

## Perimetro e metodo

Checkout `/workspace/rendimentobb`, commit letto `6cece488a4ff36b068498c29eb3a27ab6931c04a`. Nessun file del checkout modificato da questa analisi. Script, risultati e screenshot in `/workspace/audit-rendimentobb/`. Le vecchie relazioni nel repository non sono usate come prova della correttezza attuale.

Eseguiti: inventario HTML con parser standard Python; verifica delle destinazioni locali href/src; ricerca riferimenti ai moduli; Chromium headless via Playwright, con richieste diverse da `127.0.0.1` sempre abortite. Questo vincolo esclude qualsiasi contatto con Firebase/Stripe/produzione ma impedisce anche il caricamento degli SDK Firebase CDN necessari a parte del sito: tali percorsi non sono dichiarati funzionalmente superati.

Artefatti riproducibili:

- `static-inventory.py` → `static-inventory.json`.
- `browser-audit.cjs` → `browser-results.json`, screenshot mobile di 10 percorsi.
- `browser-extra.cjs` → `browser-extra.json`, testi e associazioni label dei moduli.
- `browser-actions.cjs` → `browser-actions.json`, screenshot `action-{390,1365}-{false,true}.png`.

## Inventario e architettura

51 pagine HTML; tutte hanno title. Zero ID duplicati trovati nel documento statico; zero destinazioni locali mancanti per a/link/script/img/video/source (esclusi URL esterni, fragment-only e API). Le pagine riservate/noindex senza description/canonical non sono classificate automaticamente difettose. Il controllo non prova anchor dinamici, URL esterni, destinazioni create da JavaScript o esistenza dei servizi in deployment.

Architettura multipagina statica HTML/CSS + moduli ES e script globali, API serverless Node, Firebase Auth/Firestore lato client e Admin lato server. Nessun bundler, nessuna build frontend dichiarata (`package.json:9-12`). Dipendenze principali Stripe/firebase-admin/Resend; Python per territorial ETL e verifiche. `firebase.json:2-3` dichiara regole Firestore; non è prova delle rules pubblicate. `vercel.json` contiene redirect, header, cron e rewrite; Netlify è configurato separatamente ma non simula automaticamente tutti i contratti Vercel.

Dimensioni fisiche (non trasferimenti compressi): js 6,1 MiB; css 876 KiB; immagini 21 MiB. File applicativi grandi: `js/dashboard.js` 412626 byte, `js/app.js` 207079, `js/chatbot/core/response-engine.js` 294657, `js/chatbot/core/chatbot-orchestrator.js` 143975. Vendorizzati: PDF worker 1321307 byte, PDF main 523774, jsPDF 420124, Chart 208481. Queste dimensioni e i CSS stratificati sono un costo manutentivo; non costituiscono una misura di LCP o lentezza reale.

La sincronizzazione versioni è manuale e sparsa: `js/chatbot-loader.js:179-196` usa contemporaneamente RC211, RC212 e release precedenti. Il semplice mix non è difetto: un asset invariato può mantenere una versione vecchia. Servono hash o un manifest generato per evitare aggiornamenti/test hardcoded incoerenti; non è corretto sostituire globalmente tutte le versioni.

Candidati senza riferimenti per nome negli HTML/JS/JSON applicativi: `js/access-control.js`, `js/ai-knowledge.js`, `js/branding.js`, `js/chatbot.js`, `js/property-database.js`. Ricerca conservativa per basename, esclusi docs/tests/node_modules. Sono candidati di codice storico, **non prova di codice morto**: concatenazioni dinamiche o utilizzi esterni richiedono controllo. Nessuna eliminazione proposta nella patch dell'audit.

## Browser: controlli e risultati

Percorsi caricati a viewport 390×900 e 1365×900: `/`, `/tool/`, `/demo/hospitality-pms/`, `/en/demo/hospitality-pms/`, `/immobili-commerciali/`, `/en/immobili-commerciali/`, `/gestione-commerciale/?demo=1`, `/en/gestione-commerciale/?demo=1`, `/login/`, `/plans.html?lang=en`.

Su questi 20 caricamenti: `document.documentElement.scrollWidth == innerWidth`; zero button visibili senza testo/aria-label/title; zero eccezioni `pageerror`. Alcuni elementi del menu laterale chiuso hanno bounding box oltre viewport: il documento non scorre orizzontalmente e non sono classificati overflow utente. Le richieste CDN bloccate generano errori di rete, non `pageerror`; quest'ultimo conteggio da solo non dimostra funzionamento.

Azioni funzionali realmente eseguite in IT/EN a entrambe le larghezze:

1. Demo PMS, selezione iniziale fittizia, modifica totale a 999, submit «Salva modifiche demo»/equivalente EN. Ricavi KPI 1170 → 1689. Messaggio conferma salvataggio in demo, nessun invio/account. Reset ripristina 1170. Quattro esecuzioni superate.
2. Planner commerciale: pulsante «Fasce con canone mensile»/«Slots with a monthly fee». Render risultati applicati, contratto A1/P01, stanza R1, canone 600. Quattro esecuzioni superate; documento ancora senza overflow. Questo verifica il percorso UI e non sostituisce la verifica matematica del modello.
3. I controlli form visibili esaminati di planner/demo hanno label associata o aria-label (nessuno scoperto da questo controllo).

Non eseguiti: login reale, registrazione, email, trial server, salvataggio su account, workflow Pro/PDF autenticato, navigazione mobile su dispositivo fisico, screen reader o audit contrasto automatizzato completo. Non attribuire una certificazione WCAG al campione.

## Problemi confermati

### UX-01 — P2: avviso commerciale non tradotto nella pagina piani inglese

- File: `plans.html:5`, elemento `[data-rb-sales-notice]`; traduttore `js/lang.js:34-55` traduce solo elementi con data-it/data-en.
- Atteso: stato vendite sospese e prova Investor comprensibili in EN.
- Osservato: aprendo `/plans.html?lang=en` il documento ha lang=en e parti circostanti EN, ma l'avviso resta «Partecipa ai test con la prova Investor di 30 giorni… I nuovi piani a pagamento non sono acquistabili…» interamente IT. Riprodotto a 390 e1365, testo registrato in browser-extra.json.
- Causa confermata: il paragrafo non ha attributi data-it/data-en, né un aggiornamento dedicato.
- Impatto: incomprensione del funnel/condizioni da parte dell'utente EN; nessuna riattivazione tecnica delle vendite dimostrata.
- Soluzione conservativa: aggiungere le due traduzioni all'elemento senza cambiare condizioni o policy; regression test `setLang('en')` e cambio IT→EN→IT sul messaggio.

### ARCH-01 — P2: assenza di gate CI per suite applicativa e regole

- File: unica workflow presente `.github/workflows/territorial-sources.yml:2-5,26-29`; `package.json:9-12` e `security-tests/package.json`.
- Atteso: modifiche/PR valutate automaticamente sulla suite finanziaria/applicativa e sull'emulatore prima di integrare.
- Osservato: workflow soltanto manuale/mensile con due suite Python territoriali; nessun trigger push/pull_request e nessun npm test o test rules nella configurazione repository.
- Riproduzione: enumerare `.github/workflows`; leggere trigger e comandi. Nessun accesso alle branch protections GitHub: non si esclude un controllo esterno configurato fuori repository.
- Impatto: questo repository non fornisce un controllo automatico che impedisca regressioni delle API/calcoli/sicurezza o i fallimenti cache già rilevati.
- Soluzione: proporre workflow PR, Node24, npm ci, suite applicativa e Firebase demo emulator, Python3.12; conservare exit status e report. Non aggirare i fallimenti attuali per avere un badge verde.
- Test necessario: PR di prova con una failure intenzionale in branch temporaneo e prova del check rosso; nessuna intenzionale failure aggiunta qui.

### AVAIL-01 — P2: simulatore pubblico accoppiato staticamente a SDK remoto

- File `js/app.js:37-45`, import statico Firestore da www.gstatic.com; `tool/index.html:2105` carica app come modulo.
- Riproduzione: browser-audit blocca richieste esterne; il documento simulatore si visualizza ma il modulo app non può inizializzarsi con import CDN fallito. Non è una prova di guasto in produzione, bensì un guasto locale riprodotto sotto indisponibilità controllata di quel prerequisito.
- Atteso professionale desiderabile: calcolo pubblico disponibile anche se autenticazione/salvataggio non lo sono, con errore chiaro sulle sole funzioni online.
- Impatto: outage/restrizione CDN blocca più del salvataggio remoto; il solo download HTML200 non dimostra simulatore funzionante.
- Soluzione da proporre (non patch automatica): separare bootstrap puro del calcolo dal modulo account/storage, usare lazy import autenticato e fallback esplicito. Richiede regressioni UI/Free/Pro, quindi oltre una patch puramente testuale.

## SEO tecnico

Punti verificati: title presenti in51/51; le pagine pubbliche inventariate hanno description/canonical; sitemap con URL locali esistenti; robots permette sito ed esclude API; redirect principali definiti. Zero link locali mancanti nel campione completo statico.

Limite confermato del modello linguistico, da trattare come proposta P2: home `index.html:20-23` canonical unico IT, hreflang EN `/?lang=en`; stesso HTML iniziale italiano, traduzione client `js/lang.js:164-187`. Il tool analogamente usa canonical `/tool/` e title/description data-en via JS (`tool/index.html:10-22`). Non esiste un documento EN separato per queste rotte, a differenza dei planner commerciali (`en/immobili-commerciali/index.html:2-5`). Effetto certo: risposta HTML iniziale e canonical non distinguono un documento EN indicizzabile indipendente. Effetti su indicizzazione/ranking reali **non misurati**; nessun accesso Search Console. Proposta: decidere obiettivi SEO EN e, se necessari, URL stabili con HTML EN e hreflang reciproci. Non riscrivere routing durante l'audit.

Metadata social iniziali in italiano per tool (`tool/index.html:25-27`); selezione lingua JS non assicura anteprima EN per crawler social. Nessun dato traffico/conversioni inventato. Il percorso prova30gg è dichiarato nelle CTA con requisiti email verificata/Free/non utilizzata e PDF esclusi (`index.html:967-968`, `plans.html:5`); idoneità e attivazione reali restano ai test server e a Work con account sintetico.

## Performance e manutenzione

Il tool carica Chart e jsPDF sincroni nell'head (`tool/index.html:42-43`), complessivamente628605 byte raw prima dei moduli applicativi; jsPDF è richiesto anche per utenti che non esportano. Opportunità P2: differire Chart dove possibile e caricare PDF su azione autorizzata. Non cambiare l'accesso Pro nel refactoring. I preconnect CDN (`tool/index.html:38-39`) sono rimasti pur avendo librerie locali: costo basso, P3.

Non sono stati misurati CWV con throttling, CPU low-end, cache fredda e server deployment; nessuna promessa su LCP/INP. Manca un budget/performance workflow nel repository. Le dimensioni non provano un problema percettibile. Script legacy/globali e CSS successivi mantengono compatibilità ma rendono più costosa la previsione delle regressioni; preferibile consolidare per moduli con test di comportamento, non riscrittura generale.

## Sostenibilità operativa e confronto professionale

Evidenze: cron giornaliero07:00 UTC in `vercel.json:3-7`; queue PMS e diagnostica salvate in `_pms_jobs` (`api/cron-funnel.js:113-125`); alert admin abilitati solo con flag/production, transazione una tentativa/die e stato accepted/review_required (`lib/admin-operations-alerts.js:4-23`). Il servizio non certifica consegna email. UI operations è lettura manuale, non monitor continuo (`js/admin-operations.js:17,29,42-44`); dichiara copertura incompleta di disponibilità, backup/ripristino, costi/Stripe e incapacità di rilevare fermo del proprio cron (`js/admin-operations-view.js:85-86`). Nessun backup restore script/piano automatico verificabile nel repository: **non prova assenza di backup configurati nel cloud**.

Per una sola persona: riducono lavoro idempotenza/coda e campioni diagnostici; restano manuali code ambigue, verifica recapiti, supporto/feedback, accessi al provider, fiscalità/contratti, backup restore e gestione outage. Un alert eseguito dal cron non può segnalare il cron fermo: serve monitor indipendente già disponibile o procedura di controllo esplicita, senza introdurre automaticamente costi.

Confronto con requisiti professionali, basato su conoscenza generale e codice locale, **non su documentazione concorrente aggiornata consultata**: gestione PMS professionale richiede integrazioni canali/riconciliazione, controllo concorrenza, audit, backup/restore provato, osservabilità, ruoli e procedure operative. Le demo esplicitano assenza invii Alloggiati/ISTAT e di sincronizzazione tariffe OTA (`demo/hospitality-pms/index.html:14,18`); non sono sostituti di un channel manager/revenue manager. Per analisi investimento servono definizioni finanziarie, assunzioni tracciate e confronti omogenei; VAN/TIR sono utili solo con serie flussi/exit/discount rate espliciti, non come decorazione. Valore distintivo verificabile: simulazione e operatività collegate, doppio planner turistico/commerciale e demo trasparenti senza account. Rischio adozione: presentare un ventaglio ampio prima di dimostrare affidabilità end-to-end e costi reali di gestione. Non suggerita copia indiscriminata di funzionalità concorrenti.

## Checklist Work: verifiche manuali ancora necessarie

Usare account e nominativi sintetici; nessuna modifica alle vendite, nessun dato reale.

1. Desktop IT/EN e device mobile320/390/768: Home→tool→calcolo→registrazione→verifica email→trial idoneo30gg. Screenshot prima/dopo, errori console/rete, titolo e URL.
2. Account Free/Investor/trial/Pro sintetici: CTA/limiti coerenti, expiry/relogin/nuova tab, PDF solo livello previsto, nessuna schermata con vendite riattivate.
3. Tab/ShiftTab/Enter/Escape: menu mobile, cookie preferences, modali, form error focus, select, dialog import/export, chatbot; focus visibile e restituito all'origine. Test screen reader su label, heading, messaggi live e KPI canvas alternativi.
4. Zoom200% e font grande; contrasto testo/pulsanti/stati disabled/error, calendario e numeri lunghi; viewport mobile con tastiera aperta.
5. Modifica analisi→salva→ricarica→collega proprietà→PMS→prenotazione→PDF/CSV/chatbot; stesso periodo/assunzioni, raccolta risultati numerici e provenienza. Perdita rete durante salvataggio e conflitto tra due finestre.
6. Cold load mobile throttled e almeno3 run per LCP/INP/CLS, peso transfer/compressed, cache dopo aggiornamento asset; verificare servizio serverless realmente Vercel anziché assumere equivalenza dal server statico.
7. Planner commerciale IT/EN: dati sintetici stanza/slot, modifica lingua con dati unsaved, layout tabella/mobile e valori IVA, URL/lingua dopo switch.
8. Recupero account e revoca/session expiry con ambiente test; nessun invio arbitrario a indirizzi reali. Eseguire separatamente test ripristino su backup di ambiente test e registrare RPO/RTO osservati.

## Valutazione e priorità

Nessun punteggio numerico definitivo UX mobile/performance/accessibilità: campione limitato e nessun collaudo autenticato/screen reader/CWV. Architettura adeguata a prototipo validabile ma con accoppiamento bootstrap/cloud e gate CI assente; manutenzione richiede lavoro mirato. Le azioni locali superate dimostrano interattività delle demo, non maturità per commercializzazione. Priorità: gate CI e percorso sintetico completo; poi fallback disponibilità e osservabilità/ripristino; poi performance misurata e SEO EN. Patch conservativa possibile: UX-01 (traduzione), previa registrazione file e test; gli altri richiedono proposta/ambito separato.
