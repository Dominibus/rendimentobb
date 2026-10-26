# Matrice delle funzionalità

26 ottobre 2026. “Testata” indica il metodo effettivo: **U** test automatici locali, **B** browser pubblico in questa tranche, **P** browser Pro verificato nella stessa conversazione sulla RC200, **S** ispezione statica/HTTP. Un sì parziale non certifica ogni percorso, ogni utente o la configurazione distribuita.

| Funzionalità | Implementata | Accessibile | Testata | Affidabilità dimostrata / limite | Criticità / intervento |
|---|---|---|---|---|---|
| Home e proposta | Sì | Pubblica | S, P precedente controllo home | CTA e messaggi presenti; conversione non misurata | Osservare comprensione e accesso demo |
| Navigazione header/footer | Sì, due shell | Pubblica | S, B campione, U | Differenze native tra pagine statiche e app | Non uniformare con una riscrittura rischiosa |
| IT/EN | Sì | Pubblica/account | U, B, P | Testi campionati; non revisione linguistica professionale integrale | Distinguere interfaccia e SEO multilingue |
| Comuni e capoluoghi | Sì | Pubblica | U, Python, S | 7.894 comuni e 20 capoluoghi; non 7.894 benchmark | Non inventare copertura di mercato |
| Simulatore acquisto B&B | Sì | Free/parziale, Investor/Pro completo | U, P precedenti casi | Formule verificate sui casi; input e fiscalità semplificati | Collaudo del ciclo completo con account di prova |
| Immobile già posseduto | Sì | Simulatore | U | Nessun mutuo automatico; ROI N/A con denominatore zero | Non presentare il valore della casa come capitale di avvio |
| Ricavi e costi | Sì | Simulatore | U | 365 giorni, costi mensili o percentuale dichiarata | Nessuna stagionalità reale ricostruita |
| ROI equity / prezzo | Sì | Secondo piano | U | Basi distinte; N/A gestito a UI | Non confrontare basi diverse come extra-rendimento |
| Cashflow e margine | Sì | Secondo piano | U | Dopo soli costi/tasse/rate del modello | Non chiamarlo utile fiscale certificato |
| Mutuo e ammortamento | Sì | Pubblica/simulatore | U, nuovo solver indipendente | TAN nominale; esclude costi TAEG non inseriti | Nessuna approvazione bancaria |
| LTV, DSCR | Sì | Analisi | U | Denominatori e assenza debito differenziati | DSCR non è merito creditizio bancario |
| Break-even/recupero | Sì | Analisi | U | Rapporti semplici e soglie, non IRR/NPV | Non aggiungere formule non richieste |
| Risk / Investment Score | Sì | Analisi | U | Pesi euristici riproducibili | Non probabilità di perdita o verifica immobile |
| What-if | Sì | Analisi | U | Ipotesi alternative; non probabilità | Controllare quali risultati sono ricalcolati e quali solo illustrati |
| Salvataggio/riapertura analisi | Sì | Investor/Pro/prova attiva | U, letture P | Regole e snapshot; nuovo ciclo reale non ripetuto | Test con dati di prova prima della chiusura tecnica |
| Dashboard portfolio | Sì | Demo/account | U, P | KPI e rettifica layout RC200 verificati | Mobile reale e orientamento alle priorità |
| Strutture e lavori | Sì | Account | U, P lettura | Budget/spese/collegamenti | Completezza dati a carico del cliente |
| Prenotazioni e conflitti | Sì | Demo/account | U, P lettura | Sovrapposizioni e date nel modello a unità singola | Nessun channel manager |
| Calendario e stati | Sì | Demo/account | U, P lettura | Date civili e checkout escluso | Non trasmissione a portali/autorità |
| Pulizie e attività | Sì | PMS | U, P | Checklist registrata | L’utente deve aggiornare lo stato |
| Occupazione/ADR/RevPAR | Sì | PMS/report | U, riconciliazione RC200, P | Riparto per notti e denominatore disponibile dichiarato | Una unità per immobile, chiusure non modellate nel B&B |
| CSV import/export | Sì | Secondo accesso | U, CSV precedente riconciliato | Anteprima e duplicati nel codice | Importazione reale non eseguita su dati cliente |
| PDF simulatore | Sì | Pro | U, PDF precedenti | Confronto numerico documentato | Ripetere download/upload dopo deploy sullo stesso caso |
| PDF PMS/andamento | Sì | Pro | U, PDF precedenti | Ambiti e periodi espliciti | Non contabilità degli incassi/costi completi |
| Lettore PDF chatbot | Sì | Assistente | U; parser RC200 | Correzione colonne verificata offline | Nuova prova browser documento reale ancora aperta |
| Chatbot guida/finanza | Sì | Pubblico/account secondo contesto | U, P | Intenti e risposte guidate, chiarimenti campionati | Non comprensione universale; nessun LLM esterno dimostrato |
| Autopilot B&B | Sì | Account/demo | U, P | Priorità e domani confrontati con dati | Non esegue autonomamente gli adempimenti |
| Confronto due immobili reali | Sì | Pubblica | U, S | Prezzo/superficie/costi inseriti | Non perizia o verifica annuncio |
| URL Idealista/Immobiliare.it | Scheda manuale | Pubblica | S, U | Link come riferimento; niente scraping | Promessa romana corretta |
| Scenari città → tool | Sì, difettoso prima | Pubblica | B prima, U dopo | RC201 trasferisce i tre input dichiarati | Da ricontrollare in browser dopo deploy |
| Ricerca scenari filtrati | Sì | Pubblica | U, S | Filtri esistenti conservati | Rimossi ROI/punteggi senza base; ordinamenti espliciti |
| Analisi commerciale | Sì, motore separato | Pubblica | B 305 €, U | Canoni/fasce, IVA dichiarata e sensibilità | Periodicità obbligatoria; no regime fiscale dedotto |
| PMS commerciale/archivio | Sì | Investor/Pro/prova attiva | U, P lettura archivio vuoto | Versioni, contratti, movimenti separati | Nessuna scrittura reale in questa sessione |
| Autopilot commerciale | Sì | Spazio autorizzato | U | Lettura di dati del singolo spazio | Nessuna gestione sanitaria, nessun PDF commerciale |
| Demo senza account | Sì | Pubblica | U, S | Dati fittizi separati | Non utenti reali e non prova di valore commerciale |
| Auth/recupero/logout | Sì | Login | U, P login/logout | Prova campionata; credenziali mai nei test locali | Nuovo account e recupero completo non ripetuti |
| Piani/prova 30 giorni | Sì | Account idonei | U, S | Permessi e limiti nel codice | Nessuna vendita riattivata |
| Admin/leads | Sì | Admin | U, precedente audit admin | Campioni/eventi distinti da clienti | Non ricavi o banca dati di lead vendibili certificata |
| Operations Center | Sì | Admin | U, precedente audit admin, S | Esiti memorizzati e campioni | Non monitoraggio indipendente completo |
| Cron/email | Sì | Server autorizzato | U, S; esiti precedenti admin | Retry/manual review previsti | Consegna email e fermo cron non dimostrati |
| Stripe/webhook | Sì | Server | U, S | Entitlement e idempotenza nel codice | Pagamenti sospesi, nessuna transazione eseguita |
| SEO tecnico | Sì | 39 URL sitemap | S HTTP/HTML | 39/39 rispondono; canonical/descrizioni/H1 | Non prova di ranking o indicizzazione |
| Funnel organico | Parziale | Pagine pubbliche | S + dati utente | Search Console prevalentemente brand | Mancano cohort e conversioni complete verificate |
| Backup/ripristino/incidenti | Non attestato | Cloud non esaminato | Solo analisi delle lacune | Nessuna prova di ripristino | Condizione di prontezza operativa |

## Principali formule rintracciate

| Indicatore | Componente | Definizione verificata / limite |
|---|---|---|
| Ricavi annui B&B | `js/roi-engine.js` | Tariffa × 365 × occupazione/100 |
| Costi B&B | stesso | EUR mensili × 12; percentuale solo se unità esplicita |
| NOI | stesso | Ricavi − commissioni − costi operativi; prima di debito e imposta sul reddito del modello |
| Imposta simulata | stesso | Percentuale inserita sul risultato operativo positivo; semplificazione, non regola fiscale generale |
| Cashflow | stesso | NOI − imposta simulata − rate annue |
| ROI equity / prezzo | stesso | Cashflow / denominatore × 100, applicabilità separata dal valore numerico legacy |
| LTV / DSCR | stesso | Debito / prezzo; NOI / servizio del debito; N/A a UI quando non applicabile |
| Mutuo | `js/mortgage-engine.js` | Annualizzazione di 12 rate mensili ammortizzanti, ramo TAN zero; nuovo controllo mediante bisezione e saldo iterativo |
| Rischio | `js/roi-engine.js` | Base prudenziale e soglie su ROI, occupazione, leva, DSCR, cashflow |
| Investment Score | `js/chatbot/core/score-engine.js` | Punteggio euristico limitato 0–100; non validazione empirica della redditività |
| Portafoglio | `js/portfolio-kpi.js` | Totali solo con copertura completa, ROI aggregato cashflow/capitale totale; media semplice separata |
| KPI PMS | `js/pms-calendar.js`, `js/pms-operational-report.js`, `js/property-performance.js` | Notti per periodo civile, ricavi soggiorno ripartiti sulle notti; occupazione su notti uniche, ADR su notti prenotate, RevPAR su disponibilità dichiarata |
| Recupero lavori | `js/renovation-payback.js` | Relazione fra spesa e incremento ipotizzato disponibile; non rendimento certificato dei lavori |
| Commerciale | `js/commercial-property-engine.js` | Canone mensile prorata civile o prezzo × singole fasce; IVA solo dichiarata; costi e rate prima imposte reddito |
| Gestione commerciale | `js/commercial-workspace-model.js` | Competenza e data di cassa separate; registrazioni, rimborsi e annullamenti tracciati |

Non sono state cambiate formule corrette, aliquote, pesi, prezzi o schemi persistenti. I test esistenti e quelli aggiunti coprono casi e condizioni limite, non costituiscono una dimostrazione formale di tutte le possibili combinazioni.
