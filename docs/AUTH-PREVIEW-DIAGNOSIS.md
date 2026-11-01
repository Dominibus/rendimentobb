# Diagnosi accesso preview — 1 novembre 2026

## Evidenze e limiti

PR #12: `8561c12c9d5dc1227a74717f0decba5829ce4a72`; main: `476f21d25045346a42ff0c1d2f7e5e05ae69cde4`.

Confrontati tramite GitHub: login/index.html, js/auth-page.js e js/firebase-config.js sono identici fra i due riferimenti. La PR PMS non ha modificato questi file. La configurazione web Firebase è statica, non derivata da variabili Vercel diverse fra i due branch; questo non certifica le restrizioni attive del provider.

Il singolo tentativo protetto sulla preview ha mostrato “Operation incomplete. Please try again shortly.” La pagina usa questo messaggio per ogni codice non mappato e non ne registra il dettaglio. La precedente sessione browser non è più disponibile. Non è quindi dimostrata una causa specifica, una password errata, un problema del sito pubblico o un blocco bot.

## Modifica proposta

Solo presentazione dell'errore: riferimenti statici IT/EN per errori noti di dominio, applicazione, configurazione, metodo, storage o provider interno. Gli altri errori ricevono AUTH-UNCLASSIFIED. Nessuna interpolazione di codice originale, messaggio provider, URL, email, password o payload. Nessuna telemetria, log, persistenza o endpoint aggiunto.

I messaggi già presenti su credenziali errate, rete e limiti tentativi restano invariati. Handler, SDK, setPersistence, signInWithEmailAndPassword, redirect, reset password e registrazione restano invariati. Nessuna modifica Firebase, Google Cloud, Vercel, API key, regole, account o condizioni commerciali.

Non è una correzione dimostrata della causa del login: migliora la diagnosi del prossimo tentativo autorizzato. Non va integrata insieme alla PR #12 senza revisione separata.

## Come usare il riferimento, senza allargare permessi

- AUTH-DOMAIN: controllare la configurazione del dominio per il flusso effettivamente usato. Non presumere che l'elenco domini OAuth spieghi ogni errore email/password.
- AUTH-APP / AUTH-CONFIG: verificare la configurazione dell'app e le restrizioni della chiave browser nel provider. Non disabilitare le restrizioni e non aggiungere wildcard globali.
- AUTH-METHOD: verificare il metodo di autenticazione richiesto, senza abilitarlo automaticamente.
- AUTH-STORAGE: verificare il supporto alla sessione nel browser, senza salvare credenziali.
- AUTH-INTERNAL / AUTH-UNCLASSIFIED: la causa resta ignota; non cambiare impostazioni sulla base del solo riferimento. Serve una diagnosi autorizzata della risposta provider, condividendo soltanto il codice tecnico privo di dati personali.

Documentazione primaria consultata il 1 novembre 2026:
- https://firebase.google.com/docs/projects/api-keys
- https://firebase.google.com/docs/auth/faq-and-troubleshooting
- https://docs.cloud.google.com/docs/authentication/api-keys

I riferimenti documentali descrivono controlli possibili; non dimostrano quale restrizione sia attiva nel progetto dell'utente.

## Controllo indipendente

```bash
node --test tests/auth-failure-message.test.js
git diff --check
```

Verificare che il diff applicativo del login tocchi soltanto import, fallback dei messaggi e versione del modulo HTML. Ripetere le regressioni esistenti dell'autenticazione tramite CI. Nessun test con password vere o utenti reali. Browser autenticato e verifica della causa effettiva restano aperti.

Vendite sospese, Investor 30 giorni e restrizioni PDF invariati. Nessun merge o deploy in produzione incluso in questa consegna.
