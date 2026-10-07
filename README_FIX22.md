# RendimentoBB · FIX22 · Audit del 1 ottobre 2026

Base: ZIP aggiornato `rendimentobb-main (1)(20261001-093821).zip`, con FIX18–FIX21 già presenti. Questo pacchetto non include preparazione delle call.

## Esito e limiti

- 157 test automatici superati; 0 fallimenti.
- 38 pagine HTML inventariate; 126 file JavaScript e 28 script incorporati controllati per sintassi.
- Nessuna risorsa locale mancante, nessun ID duplicato nel markup, nessun errore di sintassi rilevato.
- 37 pagine caricano il tema comune. Login usa il tema con una struttura dedicata; la pagina ospite rimane autonoma, ora con la stessa palette del prodotto. 36 pagine usano header e footer comuni.
- Restano 12 endpoint API. Nessuna API IA esterna a pagamento aggiunta.
- **Questo è un audit del codice e dei comportamenti coperti dai test, non una certificazione visiva di tutte le schermate desktop/mobile.** Il browser di test non era disponibile: il download di Chromium non è riuscito. La schermata admin allegata è stata ispezionata; le nuove schermate non sono state renderizzate in browser.
- Gli invii email sono stati verificati con servizio mail e database simulati. Non sono state inviate email reali. Accettazione dal provider, consegna in casella e resa in Outlook/Gmail restano verifiche distinte.

## Correzioni e miglioramenti

1. **Investor:** accesso completo all’analisi, inclusi indicatori avanzati. Permesso PDF separato. PDF e dashboard-report restano riservati a Pro, Pro annuale e admin. Il pannello PDF del tool è nascosto anche durante il caricamento, finché il permesso non è confermato.
2. **Benchmark:** il report gestione legge la stessa fonte `RB_MARKET_DATA` dell’analisi. Napoli usa il valore disponibile nella fonte attuale (10,2%) invece del precedente 11,5% codificato nel report. I vecchi PDF caricati restano interpretati usando i loro valori originali.
3. **Mobile e layout:** rimosse le copie statiche degli overlay del menu in sette pagine, perché l’header li crea già. Date e controlli dei modali immobile/prenotazione/ristrutturazione hanno dimensioni coerenti. Le griglie ristrutturazione passano a una colonna sotto 640px. Palette della pagina ospite allineata.
4. **Chatbot PDF:** domande combinate restituiscono tutti gli indicatori richiesti. L’interpretazione include anche score, DSCR e benchmark riconosciuti, con avviso sulla copertura del debito. Zero rimane un dato valido. La risposta sui dati non riconosciuti controlla anche ROI, mutuo e rischio.
5. **Chatbot PMS:** nuovo motore di lettura dello snapshot dell’account per prossime prenotazioni, riepilogo del portale, consuntivazione delle prenotazioni, prezzi degli immobili e budget lavori. Espone periodo, ambito e fonte. Seleziona immobili per nome o città. I ricavi sono ripartiti per notte, escludendo cancellazioni e richieste pending. Il filtro prenotazioni di un singolo immobile non sostituisce lo snapshot globale del portale.
6. **Isolamento account:** snapshot PMS, contesto derivato e privilegi admin si azzerano al cambio account/logout. Controlli dopo le letture asincrone impediscono l’applicazione di risultati appartenenti a un account precedente.
7. **Admin lead:** nuova interfaccia coerente con il tema, ricerca combinata, filtri di categoria/stato, ordinamento, paginazione di 20 record, export CSV, dettaglio richiesta e stato email. Stato e note interne si salvano tramite PATCH sull’endpoint esistente `/api/delete-lead`; DELETE conserva la conferma di eliminazione. Non sono necessarie nuove regole Firestore. Il backend verifica il token admin e accetta solo campi CRM autorizzati. Le nuove attività non riportano un lead già lavorato allo stato “nuovo”.
8. **Email:** template comune con tabelle fluide, palette verde, CTA, riepilogo e versione testo completa. Conferme utente per analisi, mutuo, aggiornamenti immobiliari, partnership, candidatura e registrazione; notifica admin in italiano; alert gestore con immobile, prenotazione, ospite, soggiorno, problema e azione. Il profitto negativo non viene omesso. Gli errori restituiti dal provider sono controllati. Lo stato di accettazione/errore viene registrato nel lead. Reminder con lock transazionale, recupero dei lock scaduti e controllo dell’esito prima di segnare lo step inviato.

## Permessi verificati

| Profilo | Analisi completa | PMS account | PDF | Dashboard-report | Lead admin |
|---|---:|---:|---:|---:|---:|
| Free | No | Demo / upgrade | No | No | No |
| Investor | Sì | Sì | No | No | No |
| Pro | Sì | Sì | Sì | Sì | No |
| Pro annuale | Sì | Sì | Sì | Sì | No |
| Admin | Sì | Sì, del proprio account | Sì | Sì | Sì |

La matrice è verificata a livello di permessi e test; acquisti reali, accesso autenticato in browser e resa visiva non sono stati rieseguiti in questa sessione. Restano validi i test Stripe già presenti sulla separazione test/live e sulla risoluzione del piano.

## Cosa il chatbot può e non può consuntivare

- `Consuntivo questo mese`, `Consuntivo mese scorso`, `Ricavi delle prenotazioni per Casa Roma questo mese`: importi dei soggiorni attribuiti alle notti del periodo. Non equivalgono a incassi bancari o utile netto.
- `Prossime prenotazioni`, `Prenotazioni domani`, `Prenotazioni prossimo mese`: arrivi nel periodo; richieste pending separate. Mostra fino a dieci righe e dichiara il totale.
- `Costi in arrivo`: indica attività di pulizia previste e budget lavori residui. **Non inventa fatture, importi delle pulizie o scadenze di pagamento**, perché non esiste un registro completo nel modello attuale.
- `Valore degli immobili`: prezzo d’acquisto della simulazione collegata ed eventuale obiettivo post-lavori inserito nel piano. **Non è una perizia di mercato.**
- `Riepilogo del portale`: combina le informazioni sopra, riferite ai dati caricati nella dashboard.
- Se lo snapshot manca o appartiene a un altro account, chiede di aprire Gestione e caricare i dati. Non lo sostituisce con PDF o simulazione.
- Le risposte sono deterministiche, in italiano/inglese, senza servizi IA esterni. Le richieste dettagliate su ospiti, pulizie, imposta di soggiorno, segnalazioni e tariffe continuano nei motori già esistenti.

## Sottoschermate esaminate nel codice

Header desktop e menu mobile; lingua e preferenze cookie; login/registrazione/recupero accesso; pricing e upgrade; tool e indicatori avanzati; export PDF; dashboard Analisi/Gestione; immobili e collegamento a simulazione; ristrutturazione, interventi e metriche; prenotazioni globali/per immobile, calendario e filtri; dettaglio/creazione/modifica prenotazione; pricing, ospiti, documenti, imposta di soggiorno, pulizie, segnalazioni e QR ospite; preferenza email urgente; report gestione e selezione simulazione; admin lead e nuovo dettaglio CRM. Le verifiche runtime automatizzate coprono i casi elencati dalla suite, non ogni combinazione possibile di questi pannelli.

## Inventario delle pagine

“Comune” indica caricamento del tema comune nel codice, non un giudizio visivo sull’intera pagina.

| Percorso | Tema | Header/footer | Form | Dialoghi statici |
|---|---|---|---:|---|
| `about/index.html` | Comune | Comuni | 0 | — |
| `academy/errori/index.html` | Comune | Comuni | 0 | — |
| `academy/index.html` | Comune | Comuni | 0 | — |
| `academy/mutuo/index.html` | Comune | Comuni | 0 | — |
| `academy/roi/index.html` | Comune | Comuni | 0 | — |
| `academy/strategia/index.html` | Comune | Comuni | 0 | — |
| `aprire-bnb-conviene/index.html` | Comune | Comuni | 0 | — |
| `contact.html` | Comune | Comuni | 0 | — |
| `costi-aprire-bnb/index.html` | Comune | Comuni | 0 | — |
| `dashboard/index.html` | Comune | Comuni | 0 | property-modal-title, renovation-modal-title, bookings-modal |
| `dashboard-leads/index.html` | Comune | Comuni | 0 | lead-details |
| `dashboard-report/index.html` | Comune | Comuni | 0 | — |
| `guest-report/index.html` | Autonomo, palette allineata | Struttura dedicata | 1 | — |
| `immobili/firenze/index.html` | Comune | Comuni | 0 | — |
| `immobili/index.html` | Comune | Comuni | 0 | — |
| `immobili/milano/index.html` | Comune | Comuni | 0 | — |
| `immobili/napoli/index.html` | Comune | Comuni | 0 | — |
| `immobili/roma/index.html` | Comune | Comuni | 0 | — |
| `index.html` | Comune | Comuni | 0 | — |
| `lavora-con-noi/index.html` | Comune | Comuni | 0 | — |
| `login/index.html` | Comune | Struttura dedicata | 0 | — |
| `market/firenze/index.html` | Comune | Comuni | 0 | — |
| `market/index.html` | Comune | Comuni | 0 | — |
| `market/milano/index.html` | Comune | Comuni | 0 | — |
| `market/napoli/index.html` | Comune | Comuni | 0 | — |
| `market/roma/index.html` | Comune | Comuni | 0 | — |
| `mutui/index.html` | Comune | Comuni | 0 | — |
| `partner/index.html` | Comune | Comuni | 0 | — |
| `privacy.html` | Comune | Comuni | 0 | — |
| `pro-success/index.html` | Comune | Comuni | 0 | — |
| `quanto-guadagna-bnb/index.html` | Comune | Comuni | 0 | — |
| `roi-bnb/firenze/index.html` | Comune | Comuni | 0 | — |
| `roi-bnb/index.html` | Comune | Comuni | 0 | — |
| `roi-bnb/milano/index.html` | Comune | Comuni | 0 | — |
| `roi-bnb/napoli/index.html` | Comune | Comuni | 0 | — |
| `roi-bnb/roma/index.html` | Comune | Comuni | 0 | — |
| `terms.html` | Comune | Comuni | 0 | — |
| `tool/index.html` | Comune | Comuni | 0 | — |

## Verifiche live da completare dopo il caricamento

1. Desktop 1440px e mobile 390px/320px: header/menu, tool, dashboard, modali immobile/ristrutturazione/prenotazione, pagina ospite, report e pannello lead. Controllare larghezze, scorrimento, focus, date e apertura/chiusura.
2. Investor: analisi completa e PMS; assenza PDF e accesso diretto al report bloccato. Pro e annuale: generazione PDF e report dal proprio snapshot. Logout e nuovo account: nessun dato precedente.
3. Admin: ricerca di un lead, cambio stato e nota, ricaricamento della pagina, paginazione, export e apertura mailto. Non eliminare record reali per il test.
4. Email: verificare una conferma richiesta nelle caselle utente/admin e un alert urgente del gestore su dati di prova. Controllare dominio mittente verificato, variabili Resend/Firebase/CRON_SECRET e log del provider. I test automatici non verificano queste configurazioni reali.

## Caricamento su GitHub

Il pacchetto completo contiene la versione aggiornata con le cartelle originali. Il pacchetto patch contiene solo file modificati/aggiunti rispetto allo ZIP base: copiarli nella radice del repository mantenendo i percorsi. Sono inclusi il nuovo modulo email in `lib/`, i moduli admin/chatbot, gli stili, i test e questo audit. Caricare tutti i file della patch insieme, perché frontend ed endpoint PATCH dipendono dalla stessa release.

Nessuna migrazione di dati e nessuna modifica alle regole Firestore. Nessun nuovo endpoint. Nessuna pubblicazione o invio email reale effettuati da questa sessione.

Controlli ripetibili:

```sh
npm test
python scripts/audit_surfaces.py
```

L’inventario tecnico completo è in `docs/audit-surfaces-FIX22.json`.
