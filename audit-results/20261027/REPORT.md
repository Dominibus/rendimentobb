# RendimentoBB — audit tecnico indipendente

27 ottobre 2026 · rapporto diagnostico completato prima di qualsiasi modifica al codice.

## A. Executive summary

**Prototipo avanzato, con basi matematiche e controlli di isolamento verificabili, ma non ancora dimostrato pronto alla commercializzazione o all'adozione professionale autonoma.** Un pilot ristretto con dati sintetici e supervisione è ragionevole dopo aver risolto la duplicazione PMS e completato il percorso autenticato di test. Le vendite restano sospese. Nessuna certificazione finanziaria, fiscale, legale, WCAG o di sicurezza del deployment è stata effettuata.

Il rilievo prioritario è **PMS-01, P1**: perdita della risposta a una creazione pending, operazione differente riuscita, retry della prima → due prenotazioni identiche. La sequenza è stata riprodotta con transazioni Firestore vere nell'emulatore locale, non soltanto con mock. Non sono stati confermati P0 nel perimetro esaminato; questo non prova che non ne esistano.

Le formule standard di mutuo, NOI, cassa, DSCR e IVA sono risultate coerenti nei casi validi provati. Rimangono un difetto annuale/mensile commerciale, un contratto fragile sugli input invalidi, score euristici e un modello fiscale semplificato. ROI equity significa cash-on-cash, non ROE contabile completo. Costi iniziali, stagionalità e flussi di uscita non sono inclusi automaticamente.

I precedenti **11 fallimenti Node sono riprodotti e tutti dovuti ad aspettative cache obsolete**. È corretto che gli asset modificati usino RC212 mentre quelli invariati conservano RC211 o release precedenti. La suite verde, dopo la correzione dei test, non risolverà i difetti applicativi individuati dai probe indipendenti.

## Baseline e metodo

- Repository `Dominibus/rendimentobb`, main remoto verificato via Git HTTPS: `6cece488a4ff36b068498c29eb3a27ab6931c04a`.
- Commit: **27 ottobre 2026, 21:24:47 Europe/Rome**. Titolo generico «Add files via upload»; il nome del commit non descrive una release affidabile.
- Branch iniziale locale `work`, stesso SHA di main, working tree pulito. Nessun aggiornamento remoto, reset o modifica di main necessario.
- Toolchain: Node24.19.0, npm11.9.0, Python3.12.14, Java21.0.12.1. Dettagli in [baseline.json](evidence/baseline.json).
- Nessun contatto con Firebase/Firestore/Stripe/Vercel di produzione. Registri npm e Git usati in sola lettura; solo progetto emulatore `demo-rendimentobb-security`. Browser configurato per abortire ogni richiesta esterna.
- Inventario completo dei percorsi sorgente e controlli strutturali; lettura mirata delle funzioni critiche. Non ogni possibile stato di ogni modulo è stato eseguito. Audit precedenti non utilizzati come prova di correttezza.
- Rapporti specialistici: [finanza e commerciale](financial.md), [PMS e assistente](pms-assistant.md), [sicurezza e operations](security.md), [architettura/UX/SEO](ux-seo-architecture.md). Contengono posizioni, atteso/osservato, causa, impatto, soluzione e test per ogni rilievo.

## Evidenze di test prima della patch

| Verifica | Esito osservato | Evidenza / limiti |
|---|---:|---|
| `npm test` radice | 2.034 eseguiti: **2.023 pass,11 fail**,0 skipped | [log](evidence/node-before.log) |
| Otto file interessati al commit RC211 precedente | **209 pass,0 fail** | Archivio separato, nessun cambio checkout: [log](evidence/rc211-parent-comparison.log) |
| Python territorial | **24 pass** | [log](evidence/python-territorial.log) |
| Python reference links (test locali) | **6 pass** | [log](evidence/python-links.log); non crawl esterno |
| Regole Firestore | **56 pass** | [log](evidence/firestore-before.log), emulator demo |
| Import/transazioni Firestore | **4 pass** | [log](evidence/firestore-transactions.log), concorrenza/ownership/import |
| Probe matematici indipendenti | **638 asserzioni pass** | [log](evidence/financial-independent.log); non sommate ai test del runner |
| Probe duplicazione PMS | **Difetto confermato** | [log](pms-idempotency-emulator.log),2 A invece di1 |
| Controllo struttura/sintassi | **51 HTML,439 JS,27 script inline,12 API,0 problemi del controllo** | [JSON](evidence/structural.json); non E2E |
| Browser Chromium |20 caricamenti,8 azioni demo riuscite |390 e1365px, IT/EN; [azioni](browser-actions.json),[risultati](browser-results.json) |
| npm audit produzione |1 moderate,0high/critical |[JSON](npm-audit-prod.json), sfruttabilità app non dimostrata |
| npm audit toolchain security-tests |9moderate,8high,0critical |[JSON](evidence/npm-audit-security-tests.json), toolchain locale separato |

Nessun test non eseguito è contato come superato. Login, salvataggio autenticato browser, recapito email, Stripe live, backup ripristinato e misure CWV deployment restano non verificati. Gli errori PERMISSION_DENIED nei test di regole sono esiti attesi dei casi di rifiuto: il runner completa56/56.

## B. Problemi confermati, ordinati per priorità

| ID | Gravità | Comportamento / impatto | Evidenza e soluzione proposta |
|---|---|---|---|
| PMS-01 | **P1** | Retry intervallato da altra operazione perde requestId e duplica una prenotazione pending | `js/pms-api-client.js:3,11-15,34-35`; mappa per firma/uid con rimozione condizionale e test emulatore. [Dettagli](pms-assistant.md) |
| FIN-01 | P2 | Contratto fuori anno con IVA unknown azzera la disponibilità dei totali annuali, non dei mensili | `js/commercial-property-engine.js:102-110`; definire contributo zero fuori competenza. [Dettagli](financial.md) |
| FIN-02 | P2 | Durata mutuo0 o Infinity al confine del motore producono risultati inconsistenti | `js/roi-engine.js:12-19,73-80,179-180`; input invalidi respinti esplicitamente. Percorso UI normale non dimostrato. |
| PMS-02 | P2 | Grafico equipara cashflow mancante/invalido a zero | `js/dashboard.js:2931-2938`; null/N.D. e label cassa, senza cambiare formule |
| PMS-03 | P2 | Query seriali proprietà→prenotazioni, storico senza paginazione | `js/dashboard.js:6248-6311`; periodi e riuso snapshot, benchmark prima di cambiare |
| OPS-01 | P2 | Cron quotidiano controlla al massimo20 account; 21° rinviato al giorno dopo | `lib/pms-reminders.js:5-15,48-50`; drenaggio entro budget/SLA e backlog |
| OPS-02 | P2 | Oltre200 prenotazioni storiche fanno saltare tutti i reminder dell'account | `lib/pms-reminders.js:21-22`; query finestra pertinente/paginazione |
| SEC-01 | P2 | PDF Pro protetto solo dal client | `js/app.js:5611-5633`; decisione contratto o artefatti premium autorizzati server. Non è lettura di dati altrui; P1 se paywall resistente requisito lancio |
| SEC-02 | P2 | CSP globale non limita sorgenti script | `vercel.json` CSP; inventario+policy graduale. Nessuna XSS dimostrata |
| DEP-01 | P2 | qs transitivo produzione con advisory moderata | `package-lock.json`,Stripe14.25.0→qs6.16.0; aggiornamento dedicato, nessun fix forzato |
| DEP-02 | P2 |17 pacchetti segnalati nel toolchain di test | `security-tests/package-lock.json`; aggiornamento CLI dedicato e verifica Node/Java/emulatore |
| TEST-01 | P2 |11 test cache richiedono RC211 per asset RC212 | Otto file elencati in [tabella completa](tests-rc211-rc212.md); aggiornare solo pin coinvolti |
| UX-01 | P2 | Avviso vendite/trial resta IT nella pagina piani EN | `plans.html:5`; aggiungere data-it/data-en senza cambiare policy |
| ARCH-01 | P2 | Nessun gate test Node/Firestore PR definito nel repository | `.github/workflows/territorial-sources.yml:2-5,26-29`; proposta CI. Check esterni/branch protection non verificati |
| AVAIL-01 | P2 | Outage SDK CDN blocca bootstrap simulatore pubblico | `js/app.js:37-45`; riprodotto con rete esterna abortita. Separazione bootstrap/calcolo proposta, nessun outage produzione affermato |

Le posizioni si riferiscono alla baseline, non a file futuri. Una vulnerabilità nel lock, una difesa in profondità incompleta o un limite di prodotto non sono automaticamente un exploit. I dettagli riproducibili e i test richiesti sono nei quattro allegati, che fanno parte del rapporto.

## C. Ipotesi e copertura ancora da acquisire

- Nessun percorso completo autenticato simulatore→analisi salvata→proprietà→PMS→PDF/CSV→chatbot in browser: la persistenza sintetica e i test di singoli contratti non lo sostituiscono.
- Backup/PITR, ripristino, IAM, secret rotation, regole effettivamente distribuite e branch protections non osservati. Assenza di procedura verificabile nel repo non dimostra assenza di backup cloud.
- Non dimostrati exploit XSS/CSRF, fuga cross-account, bypass server billing, recensioni/metriche di traffico o conversioni.
- Prestazioni reali, contrasto e screen reader non certificati dal campione browser. Nessuna stima inventata dei costi cloud mensili.
- Candidati legacy senza riferimenti testuali: access-control.js,ai-knowledge.js,branding.js,chatbot.js,property-database.js. Non eliminati: possibile uso dinamico/esterno.
- EN iniziale client-only e canonical IT sono limiti SEO documentali; effetto ranking/indicizzazione da verificare, non perdita traffico provata.

## D. Valutazione per area

Scala di giudizio tecnico, non percentuale di assenza bug: 0–3 workflow inaffidabile osservato;4–5 capacità parziale con difetti rilevanti;6–7 funzionante nel perimetro con limiti;8–9 robustezza E2E e operativa dimostrata;10 richiederebbe evidenza continuativa fuori da un audit. N/V = evidenza insufficiente per voto difendibile. Nessuna media delle aree N/V.

| Area | Voto | Motivazione e confidenza |
|---|---:|---|
| Architettura |6/10 | Moduli e confini server presenti; bootstrap CDN accoppiato, globali e file molto grandi. Confidenza media |
| Calcoli finanziari |7/10 |638 identità indipendenti, formule valide per modello semplice; FIN01/02 e fiscalità/exit incompleti. Media-alta nel perimetro |
| Dashboard | N/V | Lettura e test parziali, grafico incompleto; nessun E2E autenticato |
| PMS |5/10 | Ownership/concorrenza/import provati, ma duplicazione P1 e limiti di scala/reminder. Media |
| Autopilot | N/V | Routing locale e unit test verificati, nessun campione decisionale professionale sufficientemente ampio |
| Sicurezza | N/V |56+4 test locali positivi, limiti paywall/CSP/dipendenze; configurazione cloud e threat model live non valutati |
| UX desktop | N/V |10 pagine campionate e demo funzionanti, percorso autenticato incompleto |
| UX mobile | N/V |390px e screenshot positivi, niente dispositivi fisici/screen reader/tastiera completa |
| SEO tecnico |6/10 | Inventario link/metadata positivo; EN client/canonical e social da consolidare. Media sul solo repo |
| Performance | N/V | Pesi raw/inventario disponibili, nessuna misurazione CWV controllata |
| Affidabilità dati |5/10 | Snapshot e revisioni presenti, ma duplicazione riprodotta e N/D→zero. Media |
| Manutenibilità |5/10 |439 JS,app207KB/dashboard413KB,versioni manuali, nessun gate PR Node/rules definito. Media |
| Preparazione validazione professionale |4/10 | Sufficiente per preparare pilot supervisionato; P1 aperto,E2E/restore/compliance mancanti. Media |

## E. Roadmap e decisioni

| Intervento | Categoria/priorità | Impatto | Rischio/complessità | Criterio di accettazione |
|---|---|---|---|---|
| Idempotenza PMS multirichiesta | Indispensabile,P1 | Evita duplicazioni dopo rete incerta | Medio/media; cambia registro dati client, proposta da approvare | A commit risposta persa→B→retryA produce1 A;concorrenza risposte invertite;reload storage |
| Fix input ROI/aggregazione commerciale | Indispensabile prima uso professionale,P2 | Mantiene identità e coerenza | Medio/media; semantica finanziaria, proposta separata | Probes attuali non riproducono difetti;unknown rilevante resta N/A |
| Distinguere N/D da0 nel grafico | Indispensabile,P2 | Evita falsa lettura pareggio | Basso/bassa; UI finanziaria | Assente,invalido,zero,negativo distinti |
| Pin test cache+traduzione avviso | Indispensabile manutenzione,P2 | Baseline credibile/EN comprensibile | Basso/bassa; patch conservativa proposta | Stesso conteggio2034,tutti pass;IT↔EN invariato stato vendite |
| Reminder/letture/dashboard | Alto valore,P2 | Gestione professionale/scalabilità | Medio/media |21/100 account e201 bookings,SLA backlog;letture misurate |
| CI riproducibile + dipendenze | Alto valore,P2 | Riduce regressioni note | Medio/media | PR rossa su failure;Node/Python/emulatore pass;advisory rivalutate |
| E2E sintetico + restore + monitor cron indipendente | Indispensabile validazione | Fiducia operativa | Medio/media | Checklist Work con evidenze,RPO/RTO misurati,cron fermo rilevato |
| Decisione protezione premium | Alto valore prima vendite | Aspettative contrattuali tecniche | Alto/media-alta | Confine autorizzazione esplicito,test Free/Investor/Pro |
| Misurare performance,disaccoppiare SDK,CSP,SEO EN | Alto valore,P2 | Resilienza/UX e acquisizione | Medio/media | Budget/CWV osservati,fallback testato,policy senza rotture |
| VAN/TIR e flussi pluriennali | Futuro,P3 | Analisi professionale più ricca | Alto/alta | Costi iniziali,uscita,capitale residuo e tasso espliciti;verifica esperto |

Confronto professionale: si tratta di valutazione rispetto a requisiti comuni, non benchmark aggiornato di specifici concorrenti. Mancano channel manager/OTA, ricavi medici, contabilità certificata, attestazioni adempimenti e revenue management calibrato. Non proporre queste funzioni come già disponibili. Il valore concreto è il collegamento fra simulazione e operatività, con doppio modello turistico/commerciale e demo trasparenti. La priorità è rendere affidabile tale nucleo, non ampliare indiscriminatamente il catalogo.

## F. Autorizzazione e patch

Il rapporto e l'inventario sopra sono completati prima della modifica del checkout. [Elenco preventivo dei file](patch-file-list-before.md). Patch ammessa: correzioni di aspettative test e traduzione esistente. Nessun cambiamento a formule, dati server, autorizzazioni, API, vendita/trial, lockfile o dipendenze. Per PMS-01 e FIN01/02 la richiesta impone una proposta quando si cambiano strutture dati o contratti finanziari: qui vengono consegnati diagnosi e criteri di accettazione, non modifiche automatiche.

I risultati dopo patch, il branch, il diff e le verifiche finali saranno registrati separatamente in [DELIVERY.md](DELIVERY.md), senza riscrivere la baseline. Nessun merge,deploy,push o pubblicazione dell'ambiente è autorizzato o necessario.

## Checklist Work e rischi residui

Usare la [checklist UX/SEO](ux-seo-architecture.md) e quella [PMS/coerenza](pms-assistant.md): account sintetici A/B,Free/Investor/trial/Pro,stesso scenario e ID in tutti i moduli,IT/EN,320/390/768px,focus/tastiera/screen reader,perdita rete e revisioni concorrenti,report numerici per periodo,PDF/CSV,download e privilegi,trial esplicito30gg senza carta. Verifica email solo a caselle di test autorizzate e niente pagamenti reali. Fiscalista/legale devono verificare modello impositivo,IVA,contratti e condizioni; nessuna vendita riattivata.

**Decisione finale diagnostica: niente dichiarazione di piena prontezza commerciale.** Il superamento dei test standard e delle demo è una base utile; non elimina il P1 né sostituisce E2E autenticato,ripristino e validazione professionale. La prosecuzione raccomandata è correggere i difetti confermati in ambiti separati e poi eseguire un pilot limitato con criteri misurabili.
