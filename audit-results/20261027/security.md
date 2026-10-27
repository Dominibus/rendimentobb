# Audit indipendente sicurezza e sostenibilità operativa

Base: checkout SHA `6cece488a4ff36b068498c29eb3a27ab6931c04a`, sola lettura di sorgenti/configurazione. Nessuna chiamata a Firebase, Stripe, Vercel o dati di produzione. Le verifiche emulatore sono gestite separatamente dall'agente principale, che comunica 56/56 test regole superati; le transazioni booking-import sono in esecuzione separata. Nessuna conclusione sulle impostazioni effettivamente distribuite.

## Problemi confermati

### SEC-01 — P2: funzionalità PDF PRO protette esclusivamente dal client

- **Posizioni**: `js/app.js:5611-5633`; `js/pms-operational-report.js:4-5,10-11,70`; `firestore.rules:320-322,345-347,360-363`.
- **Atteso**: se «PDF riservati a PRO» è una restrizione di autorizzazione, un utente Investor/Free non deve poterla superare sostituendo stato JavaScript.
- **Osservato**: il generatore legge `window.getUserAccess()` e genera il PDF nel browser; `canExportPMSReport` accetta un oggetto `access` fornito dal chiamante; il modello/report pubblico non verifica un piano sul server. I dati propri restano leggibili dopo downgrade, per scelta esplicita delle rules.
- **Riproduzione locale**: `node /workspace/audit-rendimentobb/security-probes.mjs`: `clientSuppliedProAccepted:true`, `reportModelWithoutPlan:true`. Il probe dimostra l'assenza del confine di autorizzazione nel modello; non finge di aver eseguito un download PDF completo nel browser. Per verificarlo nel browser con dati sintetici: account Investor, sostituire temporaneamente `window.getUserAccess=()=>({canDownloadPDF:true,isPro:true,isInvestor:false,isFree:false})`, poi invocare il generatore con un'analisi corrente propria.
- **Causa**: il codice e i dati necessari al rendering vengono già consegnati al browser. Nascondere pulsanti non fornisce isolamento di funzionalità client. È un limite architetturale già esplicitato nella documentazione precedente (il generatore pubblico non è DRM), qui verificato indipendentemente; non è una nuova esposizione di dati.
- **Impatto**: aggiramento di una barriera commerciale; non dimostra accesso ai dati di altri utenti né escalation dei permessi Firestore. Classificato P2 con vendite sospese; P1 se il requisito di lancio è un paywall tecnicamente resistente.
- **Soluzione proposta, non applicabile automaticamente**: chiarire il contratto del prodotto oppure produrre risorse premium su endpoint autenticato con verifica piano server, limitando i dati/artefatti premium consegnati al client. Costo e architettura da valutare; offuscamento non risolve.
- **Test richiesto**: stesso input sintetico con Free/Investor/PRO, chiamata diretta endpoint/rendering; distinguere dati propri da risorsa premium.

### OPS-01 — P2: promemoria quotidiani non scalano oltre 20 account per giorno

- **Posizioni**: `vercel.json:5-6` cron quotidiano 07:00 UTC; `api/cron-funnel.js:117`; `lib/pms-reminders.js:5-15,48-50`.
- **Atteso**: ogni account idoneo riceve la valutazione dei promemoria ogni giorno.
- **Osservato**: ogni invocazione tratta al massimo 20 utenti; il cursore prosegue nel successivo avvio del cron, dunque nel giorno seguente. Non è un semplice limite di paginazione drenato nella stessa esecuzione.
- **Riproduzione**: probe locale con 21 account sintetici idonei e nessuna prenotazione: giorno 0 controlla 20, `hasMore:true`, cursore utente 19; giorno 1 controlla soltanto l'ultimo, `hasMore:false`. JSON in `security-probes.json`.
- **Impatto**: oltre 20 account opt-in, alcuni utenti perdono la scansione giornaliera; con 100 account si arriva a un giro di circa cinque giorni, prima di considerare budget/errori. Nessuna email reale inviata.
- **Soluzione proposta**: drenare pagine entro budget e proseguire con meccanismo schedulato più frequente; definire garanzia temporale e misurare backlog/lag. Richiede decisione su scheduling e limiti infrastrutturali, non patch automatica.
- **Test**: 21/100 account, scadenze oggi/domani, budget esaurito e ripresa; provare che ogni account venga valutato entro SLA dichiarato.

### OPS-02 — P2: oltre 200 prenotazioni storiche disattivano tutti i promemoria dell'account

- **Posizione**: `lib/pms-reminders.js:21-22`.
- **Osservato**: query di tutte le prenotazioni dell'utente, senza filtro temporale o di stato, `limit(201)`; se >200, `continue`. Anche 200 soggiorni conclusi più uno attivo fanno saltare l'account intero.
- **Atteso**: la crescita dello storico non elimina i promemoria delle prenotazioni imminenti.
- **Causa**: protezione di costo/capacità conservativa. Il sistema registra `largeAccounts` e `needsAttention` (49), quindi non è assenza completa di segnalazione.
- **Impatto**: lavoro manuale necessario proprio per i property manager con storico maggiore.
- **Soluzione**: query indicizzata su finestra/stati pertinenti, oppure paginazione con garanzia di completezza; evitare semplice aumento del limite.
- **Test**: account con 201 documenti, 200 cancellati/conclusi e uno imminente; verificare accodamento del reminder utile.

### DEP-01 — P2: una vulnerabilità moderata nel lock di produzione

- **Comando**: `npm audit --omit=dev --package-lock-only --json`, eseguito 2026-10-27; exit 1 significa advisory presente, non fallimento del comando.
- **Esito**: 1 moderate, 0 high/critical. `stripe@14.25.0 -> qs@6.16.0` (`npm ls qs --all`). Dettagli conservati in `npm-audit-prod.json`.
- **Advisory**: GHSA-6pq8-jhm2-2vcw, https://github.com/advisories/GHSA-6pq8-jhm2-2vcw ; `qs.stringify` con `arrayFormat:'comma'` e elemento con proprietà `toString` non invocabile può causare TypeError/DoS. Intervallo vulnerabile 6.7.0–6.16.0, fix disponibile dal registro.
- **Impatto**: presenza della dipendenza vulnerabile confermata; percorso sfruttabile tramite payload dell'applicazione **non dimostrato**. Non classificato automaticamente come DoS remoto della piattaforma.
- **Soluzione**: aggiornamento mirato della dipendenza transitiva/Stripe dopo verifica della versione corretta e compatibilità; niente `npm audit fix --force` automatico.
- **Test**: lock riproducibile, audit, test Stripe/webhook/checkout e caso specifico del serializer.

### SEC-02 — P2: CSP generale non limita le sorgenti degli script

- **Posizione**: `vercel.json`, header CSP globale: `object-src 'none'; base-uri 'self'; frame-ancestors 'none'`; nessun `script-src` né `default-src`.
- **Atteso**: difesa aggiuntiva all'esecuzione di script in caso di injection.
- **Osservato**: la policy generale non impedisce script inline o remoti. `account-action` e demo hanno policy più restrittive dedicate.
- **Impatto**: riduzione della difesa in profondità; **non è prova di una XSS** e non basta a sostenere exploit dati/account.
- **Soluzione**: inventario sorgenti e inline handler, policy report-only locale/staging, migrazione graduale a nonce/hash e allowlist. Non stringere indiscriminatamente rompendo moduli/CDN.
- **Test**: IT/EN e mobile, Firebase/CDN, PDF, grafici, chatbot, nessun report CSP inatteso e blocco payload sintetico.

## Controlli positivi verificati nel codice

- Billing protetto: `firestore.rules:220-309` blocca introduzione/modifica client di piano, ruolo amministrativo, campi Stripe e trial. Creazione normale solo Free/user; ruolo admin basato su email verificata. Questa scelta dipende dalla sicurezza della casella amministrativa, non è una falla da sola.
- Isolamento: analyses/properties/bookings sono owner-only, anche per admin; catch-all deny (`407-408`). Collegamenti analysis/property verificano ownership con `getAfter` (`66-69`). Non riscontrato un bypass statico che consenta di leggere documenti altrui.
- Le prenotazioni non sono create/eliminate direttamente dal browser; endpoint con token revocabile, verifica piano, ownership, revisione e transazione (`lib/pms-booking-service.js:80-160,242-259`). Le regole consentono direttamente soltanto la gestione `guestPortal` limitata (`360-374`).
- Commercial workspace usa owner UID, entitlements server, versioni, fingerprint richiesta e limite 60/min (`lib/commercial-workspace-service.js:8-58`).
- Auth server critica usa `verifyIdToken(token,true)` (checkout, guest/host, work-email, delete-lead). CSRF classico meno rilevante per questi endpoint con Bearer esplicito; non presume protezione degli endpoint a link.
- Trial richiede email verificata e accettazione termini, blocco riuso per account/email con transazione (`lib/account-subscription-service.js:9-26`); 30 giorni, nessun pagamento automatico.
- Vendite nuove live sono sospese anche sul server (`js/sales-policy.js:3`; `api/create-checkout-session.js:121`); portal e vecchi rinnovi non sono fermati da quella flag. Nessuna vendita riattivata dall'audit.
- Stripe webhook usa body raw e firma, verifica ambiente, binding UID/subscription e ordinamento eventi (`api/stripe-webhook.js:310-366` e aggiornamenti 172-269); non verificati segreti live o eventi reali.
- Guest portal usa token hash SHA256, confronto costante, expiry e stato prenotazione (`api/guest-report.js:29-48`); submit serializzato e limite uno/minuto per booking (`113-146`). Nessun test di brute force sulla produzione.
- Registrazione/login hanno persistenza sessione oppure locale scelta dall'utente, errori login generici, min password client 15 caratteri (`js/auth-page.js:35-41,48-60,85`). Action code tolto dalla barra, destinazione fallback Firebase fissa, API key pubblica non equiparata a segreto (`js/account-action.js:13-34`).
- Ricerca mirata di private key/token live nei sorgenti ha trovato soltanto il file configurazione Firebase pubblica (nomi soli, mai valori nel rapporto). Questo controllo non copre storia Git, credenziali esterne o tutte le possibili forme di segreto.
- Email amministrativa è destinatario fisso; alert opt-in e production-only, transazione evita duplicati (`lib/admin-operations-alerts.js:5-23`). Operations center proietta metadati limitati, non payload utente/provider (`lib/admin-operations.js:1-64`).

## Ipotesi e verifiche esterne necessarie

- **Password policy server**: `js/password-policy.js:1` richiede enforcement in Firebase. Il controllo client è aggirabile; configurazione Firebase non ispezionata. Non affermare che password brevi siano realmente accettate dal servizio.
- **Rate limiting infrastrutturale**: guest context legge un documento per tentativo token plausibile prima del rifiuto e non ha limiter globale nel codice; abusi/costi possibili, ma WAF/App Check/quote effettive non verificati. Endpoint lead usa limite IP/email persistente (`api/send-lead.js:101-190`); fiducia di `x-forwarded-for` dipende dal comportamento Vercel, non provata vulnerabilità spoofing.
- **Retention**: record `_pms_operations`/`_commercial_operations` hanno createdAt ma nessun purge in repo identificato; TTL esterno potrebbe esistere. Aumento storage e dati operativi da pianificare senza presumere mancanza effettiva di TTL.
- **Logging**: cron registra un oggetto error completo (`api/cron-funnel.js:303`); valutare redazione perché SDK potrebbero includere dettagli sensibili. Nessuna fuga reale osservata.
- **Backup/ripristino/IAM**: nessuna prova eseguita; nessun RPO/RTO verificato. Mancanza di prova non significa assenza di backup.
- **Fermo cron**: digest admin nasce dallo stesso cron (`lib/admin-operations-alerts.js:17` lo dichiara). Se cron è fermo, non invia alert autonomamente; serve watchdog indipendente o controllo manuale. Non presentare questo digest come monitor uptime completo.
- **Costi**: nessun preventivo numerico senza traffico/provider plan; letture transazionali, scansioni, email e cron sono costi variabili, sistemi client rules non eliminano abusi/costi.
- **MFA/recupero admin**, rotazione credenziali, domini autorizzati Firebase, rules effettivamente distribuite, configurazione Stripe customer portal: da verificare separatamente con accesso autorizzato. Non operati su tali sistemi.

## Valutazione

Sicurezza del codice: **6/10 provvisorio**, motivato da ownership e transazioni robuste ma paywall client, CSP limitata e advisory attuale. Non è certificazione di sicurezza distribuita. Operatività: **5/10 provvisorio**, job limitati/idempotenti e proiezioni utili, ma capacità reminder dimostrabilmente insufficiente per scala, monitoraggio dipendente dal cron e restore non validato. Nessun P0 confermato in questa analisi. L'agente principale comunica 56/56 test regole superati in emulatore; ciò convalida quel modello locale, non le regole distribuite.


## Integrazione DEP-02 — P2: vulnerabilità nel toolchain locale di test Firestore

L'agente principale ha eseguito l'audit completo del package separato `security-tests`; questa integrazione legge l'evidenza già prodotta, senza ulteriori chiamate di rete.

- **Evidenza**: `evidence/npm-audit-security-tests.json`; timestamp del file risultato: **2026-10-27T21:51:25.415468+01:00** (Europe/Rome; timestamp del filesystem, non timestamp firmato dal registro).
- **Comando riproducibile**: `cd /workspace/rendimentobb/security-tests && npm audit --json`. Non confonderlo con l'audit `--omit=dev` del package principale.
- **Esito**: **17 pacchetti segnalati: 9 moderate, 8 high, 0 critical**. Questi conteggi includono dipendenze interessate indirettamente e advisory ereditati: non equivalgono a 17 exploit indipendenti.
- **Ambito**: devDependencies del package dedicato all'emulatore locale (firebase-tools, SDK e rules-unit-testing), separato dalle dipendenze produttive principali. Nessun test ha dimostrato sfruttabilità di queste segnalazioni nelle API o nel sito di produzione. Il rischio riguarda anche il processo di sviluppo quando riceve dati/remoti non fidati; non ignorarlo perché dev-only.

| Pacchetto | Severità npm | Advisory diretti / dipendenza che propaga la segnalazione |
|---|---|---|
| `@google-cloud/pubsub` | moderate | via `@opentelemetry/core` |
| `@opentelemetry/core` | moderate | [GHSA-8988-4f7v-96qf](https://github.com/advisories/GHSA-8988-4f7v-96qf) — OpenTelemetry Core: Unbounded memory allocation in W3C Baggage propagation |
| `basic-ftp` | high | [GHSA-c475-qrg2-pj4r](https://github.com/advisories/GHSA-c475-qrg2-pj4r) — basic-ftp: Quadratic-time CPU denial of service in Client.list() Unix directory-listing parser (RE_LINE backtracking) |
| `body-parser` | high | [GHSA-27r3-jxmh-p828](https://github.com/advisories/GHSA-27r3-jxmh-p828) — body-parser vulnerable to Denial of Service via trailing bytes after a compressed request body; [GHSA-27r3-jxmh-p828](https://github.com/advisories/GHSA-27r3-jxmh-p828) — body-parser vulnerable to Denial of Service via trailing bytes after a compressed request body |
| `csv-parse` | moderate | [GHSA-8cw4-87c7-c6xx](https://github.com/advisories/GHSA-8cw4-87c7-c6xx) — node-csv: Prototype replacement still reachable via columns path |
| `fast-uri` | moderate | [GHSA-w74x-v6f9-j3xg](https://github.com/advisories/GHSA-w74x-v6f9-j3xg) — fast-uri vulnerable to URI scheme spoofing via percent-encoded scheme decoding; [GHSA-xhq7-xmqj-769h](https://github.com/advisories/GHSA-xhq7-xmqj-769h) — fast-uri vulnerable to improper path equivalence in relative reference normalization; [GHSA-wjr9-j795-jxcr](https://github.com/advisories/GHSA-wjr9-j795-jxcr) — fast-uri vulnerable to host confusion via unchecked WHATWG host canonicalization; [GHSA-333x-w4r6-6crp](https://github.com/advisories/GHSA-333x-w4r6-6crp) — fast-uri vulnerable to scheme injection via an unescaped first-segment colon in suffix references |
| `firebase-tools` | high | via `@google-cloud/pubsub`; via `csv-parse`; via `gaxios`; via `proxy-agent`; via `stream-json`; via `uuid`; via `zod` |
| `gaxios` | moderate | via `uuid` |
| `get-uri` | high | via `basic-ftp` |
| `ip-address` | moderate | [GHSA-rxp7-6hxx-x8q5](https://github.com/advisories/GHSA-rxp7-6hxx-x8q5) — ip-address: Address6 matches a zone identifier in quadratic time ahead of its length limit, allowing a single long string to stall the process |
| `pac-proxy-agent` | high | via `get-uri` |
| `proxy-agent` | high | via `pac-proxy-agent` |
| `qs` | moderate | [GHSA-6pq8-jhm2-2vcw](https://github.com/advisories/GHSA-6pq8-jhm2-2vcw) — qs : qs.stringify with arrayFormat 'comma' throws an uncaught TypeError on array elements carrying a non-callable own toString (DoS) |
| `stream-json` | moderate | [GHSA-528h-pc64-c93x](https://github.com/advisories/GHSA-528h-pc64-c93x) — stream-json: pick/ignore/filter/replace filters are O(depth²) on nested input — small crafted JSON blocks the event loop for seconds→minutes (DoS); [GHSA-hqr4-qq8f-hg3x](https://github.com/advisories/GHSA-hqr4-qq8f-hg3x) — stream-json: JSONC parser and verifier re-scan the whole accumulated comment on every input chunk; [GHSA-mjw6-4jj6-33hc](https://github.com/advisories/GHSA-mjw6-4jj6-33hc) — stream-json has a prototype pollution issue: Assembler writes this.current[this.key] on plain objects |
| `undici` | high | [GHSA-4qv8-2p9j-2685](https://github.com/advisories/GHSA-4qv8-2p9j-2685) — undici vulnerable to Denial of Service via unbounded memory in the EventSource parser; [GHSA-f72v-6w45-q472](https://github.com/advisories/GHSA-f72v-6w45-q472) — undici vulnerable to Subresource Integrity bypass via non-lowercase algorithm tokens; [GHSA-xjj6-f33q-929c](https://github.com/advisories/GHSA-xjj6-f33q-929c) — undici vulnerable to Denial of Service via unhandled error on excessive content-encodings; [GHSA-4w7w-5xrc-9h26](https://github.com/advisories/GHSA-4w7w-5xrc-9h26) — undici vulnerable to cache poisoning and cross-user disclosure via cross-origin redirects; [GHSA-2m5v-pch6-74hx](https://github.com/advisories/GHSA-2m5v-pch6-74hx) — undici vulnerable to TLS certificate validation bypass via dropped tls options in Agent; [GHSA-qrxm-fqhp-jwvm](https://github.com/advisories/GHSA-qrxm-fqhp-jwvm) — undici vulnerable to Denial of Service via TLS 1.2 certificate-changing renegotiation; [GHSA-9fm3-97px-rjf6](https://github.com/advisories/GHSA-9fm3-97px-rjf6) — undici WebSocket client vulnerable to Denial of Service via unbounded automatic PONG buffering; [GHSA-55wc-3pg8-jfw6](https://github.com/advisories/GHSA-55wc-3pg8-jfw6) — undici vulnerable to Denial of Service via unhandled exception in the decompress interceptor |
| `uuid` | moderate | [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) — uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided |
| `zod` | high | [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) — Zod can exhaust memory while validating oversized constrained collections |

**Causa confermata**: il lock del toolchain include versioni negli intervalli segnalati dal registro. Per alcuni pacchetti il registro propone `firebase-tools@15.34.1`, indicando esplicitamente una major upgrade; altri hanno `fixAvailable:true`. Questo risultato non dimostra che applicare automaticamente quella major sia sicuro o sufficiente in questo repository.

**Remediation proposta, non applicata**: preparare un aggiornamento dedicato del toolchain, verificare requisiti Node/Java della release selezionata, risolvere transitivi su versioni corrette compatibili senza forzare major arbitrariamente; rigenerare soltanto il lock interessato nel task autorizzato. Rieseguire installazione frozen, audit completo e suite regole/transazioni su progetto `demo-` locale, verificando checksum e TLS. Tenere emulatore su loopback e non esporlo a input non fidati. Non disabilitare controlli, non usare `npm audit fix --force` indiscriminatamente.

**Stato**: nessun manifest o lock modificato dall'agente sicurezza. Advisory di produzione DEP-01 e toolchain DEP-02 restano distinti nel rapporto; zero critical non equivale ad assenza di rischi.
