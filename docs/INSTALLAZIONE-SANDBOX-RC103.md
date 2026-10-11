# RC103 — Aggiornamento del branch Stripe di test

Destinazione esclusiva: branch GitHub `stripe-sandbox-test`, sito https://rendimentobb-git-stripe-sandbox-test-dominibus-projects.vercel.app . Base: `rendimentobb-stripe-sandbox-test.zip` inviato l’11 ottobre 2026.

Lo ZIP contiene file completi aggiunti o modificati rispetto al branch allegato. Allinea il codice a RC102 e aggiunge la correzione dei controlli di fatturazione. Non contiene credenziali o variabili Vercel. Non caricarlo sul branch `main` e non eseguire un merge del branch sandbox verso `main`.

## Installazione

1. Su GitHub seleziona `stripe-sandbox-test`. Scarica un backup con Code → Download ZIP.
2. Estrai lo ZIP RC103 e carica i file nelle stesse cartelle del branch selezionato. Controlla il nome del branch prima di confermare il commit. Non caricare lo ZIP come singolo file.
3. Su Vercel verifica la configurazione Preview specifica di `stripe-sandbox-test`. Non modificare Production. Controlla solo il prefisso della chiave `STRIPE_SECRET_KEY`: deve iniziare con `sk_test_` e appartenere alla sandbox usata. Non inviare o mostrare il valore della chiave in chat o screenshot.
4. Per lo stesso branch Preview, `BASE_URL` deve essere `https://rendimentobb-git-stripe-sandbox-test-dominibus-projects.vercel.app`. La guardia blocca il branch se usa una chiave live o un URL di ritorno diverso. Le API Stripe non potranno funzionare finché questi valori non sono corretti.
5. `STRIPE_WEBHOOK_SECRET` deve corrispondere all’endpoint della stessa sandbox, diretto al sito di test. Verifica la configurazione in console senza pubblicare il segreto. Firebase Admin rimane la configurazione esistente. Non copiare le credenziali Stripe Production in Preview.
6. Attendi il deploy Preview riuscito. Apri la dashboard del sito di test e ricarica con Ctrl+F5. Accedi con l’account Investor collegato all’abbonamento sandbox e apri Abbonamento.

## Test del portale

L’account deve avere `sandboxStripeCustomerId` valido; vedere l’email o l’abbonamento nella console Stripe non prova il collegamento all’UID Firebase. Se non appare il pulsante, controlla il documento `users/{uid}` e i campi sandbox, senza aggiungere a mano un customer ID non verificato.

Il pulsante “Gestisci rinnovo e fatture su Stripe” deve aprire il portale del cliente sandbox corretto. Verifica nome del piano e fatture. Per la prima prova non modificare/annullare ancora l’abbonamento. Se il portale manca di configurazione, configura le funzionalità nella stessa sandbox; le configurazioni di produzione sono separate.

Gli account con un piano assegnato manualmente e senza customer ID non mostrano il pulsante Stripe. I customer ID e gli identificativi della conferma di acquisto dell’ambiente opposto non fanno apparire controlli di fatturazione nel sito corrente. Il server continua a usare solo l’ID protetto del cliente associato all’utente autenticato, mai un identificativo inviato dal browser.

## Ambito e limiti

845 test locali superati; audit strutturale di 40 pagine, 265 file JS, 27 script inline, 12 API: zero errori. Prezzi Stripe test invariati rispetto allo ZIP allegato. Nessun deploy o accesso alle configurazioni cloud eseguito automaticamente.

Le regole Firestore incluse sono la versione del progetto RC102: se il sito condivide il Firebase pubblico, le regole sono globali, non specifiche del branch. Il caricamento su GitHub non richiede di ripubblicarle e non deve ripristinare le vecchie regole sandbox.

Il cron è protetto e non esegue i promemoria in Preview. Le notifiche e le ricevute inviate direttamente dalle API possono invece arrivare ai veri indirizzi inseriti: usa indirizzi tuoi e identifica esplicitamente ogni prova come TEST, senza contratti reali da annullare.

L’aggiornamento non altera documenti Firestore, piani di produzione, chiavi Vercel o abbonamenti Stripe. La prova browser reale del nuovo portale sarà completata dopo il deploy; un esito sandbox non certifica da solo la configurazione del portale live.
