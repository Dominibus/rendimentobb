# Test e limiti di copertura — RC201

26 ottobre 2026 · Node 24.22.1, Python 3.12.14. Base immutabile `28ad7f879c8774970ec35bf5af84ec9cd6d5c444`.

| Controllo eseguito | Esito | Cosa dimostra / cosa non dimostra |
|---|---|---|
| Verifica origine | 690 blob uguali alla tree GitHub prima delle modifiche | Identità della base; non prova che ogni asset sia aggiornato dal punto di vista editoriale |
| `npm test` prima patch | 1.887 pass, zero fail | Baseline locale pulita dopo disponibilità delle dipendenze |
| `npm test` finale | **1.912 pass, zero fail** | Inclusi 25 nuovi test; non certifica ogni percorso browser o provider |
| Regole Firestore in emulatore | **56 pass, zero fail** | Progetto locale `demo-rendimentobb-security`, senza credenziali produzione. Controlli di accesso e scritture sul modello di regole locale, non configurazione cloud distribuita |
| `python -m unittest discover -s tests -p '*_test.py'` | **9 pass** | Aggregazioni territoriali, filtri e casi sintetici; non ricostruzione completa di tutti gli archivi originali |
| Controllo strutturale | 51 HTML, 426 JS, 27 script inline; **zero problemi rilevati** | Sintassi, risorse locali e ID; non audit WCAG completo o resa di ogni schermata |
| Inventario SEO | 39 URL sitemap con canonical coerente, descrizione, un H1, nessun noindex | Requisiti strutturali, non ranking o indicizzazione effettiva |
| HTTP su sitemap | **39/39 risposte finali 200** | Raggiungibilità durante la verifica; non disponibilità continuativa |
| `npm audit --omit=dev --package-lock-only --json` | **0 vulnerabilità segnalate** dal registro per il lock principale | Non copre automaticamente vendor JS copiati, configurazione cloud o vulnerabilità non note |
| Ricerca firme segreti, ambito limitato | Zero file segnalati in API, lib e configurazioni alla radice | Controllo per firme note, non certificazione di assenza di segreti in tutta la storia git |
| Browser pubblico | Riprodotto errore trasferimento Roma; caso commerciale 305 € mensili, 22% IVA → 3.000 € annui senza IVA | Il caso è locale/in memoria; non contratto o aliquota certificata |

## Nuovi test significativi

- Tutti i 12 link immobili città: prezzo, tariffa e occupazione copiati esattamente; nessuna eredità di capitale/costi del precedente immobile.
- Parametri mancanti, ripetuti, non finiti, negativi o fuori intervallo: rifiuto atomico.
- Ordine del caricamento: il modulo differito attende `DOMContentLoaded` anche nello stato `interactive`, dopo i vecchi default.
- Percorso ordinario e modalità immobile posseduto senza input numerici: nessuna alterazione; priorità dello scenario mutuo preservata.
- Quattro link città nativi, assenza dei rendimenti statici non riproducibili e immagini decorative con alt.
- API ricerca: filtri e ordinamenti per prezzo/superficie conservati, ROI e score mancanti rappresentati da null.
- 305 €: periodicità obbligatoria, distinzione canone mensile/per utilizzo, IVA non definita N/A, annuale/mensile riconciliati.
- Commerciale acquistato con spese e lavori, due canoni diversi e finanziamento a tasso zero: capitale e cashflow calcolati indipendentemente.
- Rate confrontate con un solver indipendente: bisezione sulla rata e saldo mensile iterativo; include tasso zero e quasi zero.
- Job vecchi a 3/7/14 giorni: segnalazione di staleness quando si legge il riepilogo, non promessa di email durante il fermo cron.

## Controlli non disponibili o non svolti

Il package principale non definisce build, lint o typecheck. Non esiste una suite browser E2E configurata da eseguire come tale; non sono stati inventati comandi o risultati. I test di DOM simulato non sono presentati come browser reale.

Non svolti: nuovo account e attivazione trial completa, recupero account end-to-end, scritture su record cliente, import reale, download e ricaricamento browser dei PDF dopo patch, test su iPhone reale, test automatico WCAG completo, Lighthouse/Core Web Vitals, stress test, invii email reali, checkout/pagamenti, esame IAM e regole distribuite, backup/ripristino e prove di incidente in produzione.

Le verifiche Pro e admin già effettuate in questa conversazione sono riportate come evidenza precedente, con i loro limiti. Non è stato nuovamente effettuato login admin per attribuire freschezza ai contatori del cron. Search Console è analizzata dai numeri forniti dall’utente; nessuna impostazione è stata modificata e nessun nuovo export acquisito.

La sessione locale Firestore è stata chiusa normalmente dal comando del test. Le dipendenze di test e i log dell’emulatore non sono nella patch. La CLI avvisa che la futura versione 15 richiederà un Java più recente: non è una vulnerabilità del sito e non è stata cambiata la versione degli strumenti del progetto.

## Dopo il rilascio manuale

1. Da Immobili Roma aprire la prima scheda: prezzo 380000, tariffa 145, occupazione 70. Verificare le altre 11 e i messaggi IT/EN.
2. Verificare che capitale e costi richiedano completamento, che non parta un calcolo automatico e che il percorso mutuo conservi priorità.
3. Verificare filtri città/budget/superficie e ordine prezzo/superficie; nessun ROI non calcolato mostrato.
4. Controllare layout delle schede e navigazione dei quattro link città, desktop e telefono.
5. Eseguire il collaudo account/report indicato nella roadmap prima di chiudere la prontezza tecnica.
