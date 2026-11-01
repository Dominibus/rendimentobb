# Diagnosi accesso preview — 1 novembre 2026

## Evidenze e limiti

PR #12: `8561c12c9d5dc1227a74717f0decba5829ce4a72`; main: `476f21d25045346a42ff0c1d2f7e5e05ae69cde4`.

Confrontati tramite GitHub: login/index.html, js/auth-page.js e js/firebase-config.js sono identici fra i due riferimenti. La PR PMS non ha modificato questi file. La configurazione web Firebase è statica, non derivata da variabili Vercel diverse fra i due branch; questo non certifica le restrizioni attive del provider.

Il singolo tentativo protetto sulla preview ha mostrato “Operation incomplete. Please try again shortly.” La pagina usa questo messaggio per ogni codice non mappato e non ne registra il dettaglio. La precedente sessione browser non è più disponibile. Non è quindi dimostrata una causa specifica, una password errata, un problema del sito pubblico o un blocco bot.

## Modifica proposta

Solo presentazione dell'errore: riferimenti statici IT/EN per errori noti di dominio, applicazione, configurazione, metodo, persistenza, storage o provider interno. Gli altri errori ricevono AUTH-UNCLASSIFIED. Nessuna interpolazione di codice originale, messaggio provider, URL, email, password o payload. Nessuna telemetria, log, persistenza o endpoint aggiunto. La funzione di presentazione è inclusa direttamente in auth-page.js: nessun file diagnostico aggiuntivo da caricare.

I messaggi già presenti su credenziali errate, rete e limiti tentativi restano invariati. Handler, SDK, setPersistence, signInWithEmailAndPassword, redirect, reset password e registrazione restano invariati. Nessuna modifica Firebase, Google Cloud, Vercel, API key, regole, account o condizioni commerciali.

Non è una correzione dimostrata della causa del login: migliora la diagnosi del prossimo tentativo autorizzato. Non va integrata insieme alla PR #12 senza revisione separata.

## Come usare il riferimento, senza allargare permessi

- AUTH-DOMAIN: controllare la configurazione del dominio per il flusso effettivamente usato. Non presumere che l'elenco domini OAuth spieghi ogni errore email/password.
- AUTH-APP / AUTH-CONFIG: verificare la configurazione dell'app e le restrizioni della chiave browser nel provider. Non disabilitare le restrizioni e non aggiungere wildcard globali.
- AUTH-METHOD: verificare il metodo di autenticazione richiesto, senza abilitarlo automaticamente.
- AUTH-STORAGE: verificare il supporto alla sessione nel browser, senza salvare credenziali.
- AUTH-PERSISTENCE: il tipo richiesto dall'applicazione non è valido; verificare la configurazione del codice, senza dedurre un blocco delle impostazioni del browser.
- AUTH-INTERNAL / AUTH-UNCLASSIFIED: la causa resta ignota; non cambiare impostazioni sulla base del solo riferimento. Serve una diagnosi autorizzata della risposta provider, condividendo soltanto il codice tecnico privo di dati personali.

Documentazione primaria consultata il 1 novembre 2026:
- https://firebase.google.com/docs/projects/api-keys
- https://firebase.google.com/docs/auth/faq-and-troubleshooting
- https://docs.cloud.google.com/docs/authentication/api-keys

I riferimenti documentali descrivono controlli possibili; non dimostrano quale restrizione sia attiva nel progetto dell'utente.

## Controllo indipendente

```bash
node --test tests/auth-failure-message.test.js
node --test tests/auth-page-module-availability.test.js
git diff --check
```

Verificare che il diff applicativo del login tocchi soltanto il blocco di presentazione incluso, il fallback dei messaggi e la versione del modulo HTML. Gli import preesistenti restano invariati. Ripetere le regressioni esistenti dell'autenticazione tramite CI. Nessun test con password vere o utenti reali. Browser autenticato e verifica della causa effettiva restano aperti.

## Correzioni R1/R2 dopo revisione indipendente

R1: rimosso l'import statico e il file auth-failure-message.js. La diagnostica è codice locale della pagina, quindi non aggiunge un punto di fallimento alla risoluzione dei moduli. Restano necessarie le dipendenze SDK e applicative già presenti in main: non si pretende di renderle facoltative.

Nuovo test dell'intero ESM auth-page.js con vm.SourceTextModule in un sottoprocesso Node --experimental-vm-modules: il linker fornisce soltanto le dipendenze di main e rifiuta espressamente il vecchio file diagnostico. Verifica inizializzazione, titolo, un handler submit e handler per reset/cambio modalità/lingua. Nessun handler viene invocato; ogni operazione di persistenza/accesso/reset/registrazione o scrittura fittizia farebbe fallire il test. Prima della correzione la pagina non si collega e gli handler non vengono installati; dopo la correzione si inizializza senza dipendenza diagnostica esterna. È una prova ESM locale, non browser o provider reale.

R2: auth/invalid-persistence-type ora produce AUTH-PERSISTENCE e indica un tipo invalido richiesto dall'applicazione; non attribuisce la causa alle impostazioni del browser. auth/unsupported-persistence-type e auth/web-storage-unsupported restano distinti dal tipo invalido. I test verificano il significato completo IT/EN oltre al riferimento. Fonte primaria: https://github.com/firebase/firebase-js-sdk/blob/firebase%4012.1.0/packages/auth/src/core/errors.ts .

Esito locale: 27 test mirati passati (21 di presentazione/collegamento e 6 regressioni precedenti). Prima delle correzioni fallivano tre asserzioni/casi sui 21 nuovi/aggiornati test. La causa dell'accesso fallito resta ignota. Nessun login, reset o registrazione effettuato in questo intervento. CI e preflight browser del nuovo SHA vanno verificati separatamente.

Vendite sospese, Investor 30 giorni e restrizioni PDF invariati. Nessun merge o deploy in produzione incluso in questa consegna.
