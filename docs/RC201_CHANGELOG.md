# Changelog RC201 — sole correzioni e ottimizzazioni

Base: `28ad7f879c8774970ec35bf5af84ec9cd6d5c444` del 26 ottobre 2026. Nessuna nuova funzione commerciale o servizio a pagamento.

| File | Modifica e motivazione | Validazione | Rischio / rollback |
|---|---|---|---|
| `js/property-scenario-inputs.js` | Consumatore degli input già presenti nei 12 link scheda→simulatore, validazione e precedenza mutuo; non calcola né salva | Test parametri, ciclo caricamento, isolamento default, percorsi ordinari | Ordine inizializzazione: controllo browser dopo deploy. Eliminabile ripristinando il solo tool dalla base |
| `tool/index.html` | Collega la correzione e mostra messaggi di importazione/input incompleti | Risorse, sintassi, suite e fixture della funzione import | Nessun controllo piano o formula modificato |
| `immobili/roma/index.html` | Rimuove output non riproducibili, chiarisce input ipotizzati, limiti del link e piani; CTA scheda manuale; alt decorativi | Tre link esaminati nei test, copy IT/EN, inventario HTML | Varia il contenuto atteso dagli utenti; preserva gli esempi e il design |
| `immobili/napoli/index.html` | Stesse correzioni metodologiche di schede e alt | Tre link e assenza output fittizi; struttura | Come sopra |
| `immobili/milano/index.html` | Stesse correzioni, rimuove etichetta potenziale non dimostrato e chiarisce Investor/Pro | Tre link, struttura e suite | Come sopra |
| `immobili/firenze/index.html` | Stesse correzioni, rischio non stimato da dati incompleti, piani e alt | Tre link, struttura e suite | Come sopra |
| `immobili/index.html` | Quattro link città HTML nativi; quattro rendimenti statici sostituiti da invito al calcolo; ricerca senza ROI arbitrario; benefici allineati; rimuove H2 nascosto e caricamento dataset duplicato inutilizzato | Filtri e test legacy, nuovo test href/copy, controllo struttura | Nessuna rimozione di funzione consolidata; mantenuti percorsi, filtri, scheda manuale e ID |
| `api/property-search.js` | Conserva contratto di ricerca e filtri; non calcola score arbitrario; ROI e score null; ordinamento predefinito degli esempi, prezzo/superficie espliciti | Test API esistenti e nuovi; zero fetch a portali | Eventuali consumatori esterni che assumano sempre un numero dovrebbero gestire null; nessun ulteriore consumatore individuato nel repo |
| `tests/rc201-audit-regressions.test.js` | 25 regressioni mirate e verifiche indipendenti | Inclusi nei 1912 test finali | Nessuna dipendenza nuova nel prodotto |
| `docs/RC201_*`, istruzioni e manifest | Audit, matrice, rilievi, competitor, fonti, roadmap, evidenze e modalità di applicazione | JSON validi e archivio verificato | Documentazione, non impostazioni di produzione |

## Non modificato

Formule finanziarie, pesi degli score, aliquote, prezzi, piani, trial 30 giorni, sospensione vendite, regole Firestore, dati persistenti, contratti/privacy, cron, pagamenti e DNS. Non introdotti API a pagamento, librerie runtime o migrazioni. Nessun asset o report privato inserito nell’archivio.

## Ritorno alla base

Ripristinare i sette file esistenti elencati dal manifest dalla base GitHub, rimuovere il nuovo modulo/test e i documenti RC201 se necessario. Non sono necessarie modifiche o migrazioni al database. Non applicare la patch su un `main` successivo senza confrontare i file interessati.
