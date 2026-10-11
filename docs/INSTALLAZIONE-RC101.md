# RC101 — installazione e controllo

Questa è una patch incrementale sullo ZIP `rendimentobb-main (17).zip`, non una copia completa del progetto. Contiene i file interi da sostituire o aggiungere, con percorsi relativi alla radice del repository. Non contiene credenziali, `node_modules` o dati dell’account.

## Installazione

1. Conserva lo ZIP 17 come base di confronto e backup.
2. Estrai RC101 e carica **tutti** i file mantenendo le cartelle, in un unico commit sul repository. Non caricare lo ZIP come file e non creare una cartella aggiuntiva sopra `index.html`.
3. Includi `package.json`, il nuovo `package-lock.json`, i bundle sotto `js/vendor/`, il frontend e l’API insieme. Il backend email di registrazione richiede il nuovo frontend autenticato.
4. Attendi il deployment Vercel. Il progetto dichiara Node `24.x`; il lockfile fissa l’albero delle dipendenze. Nessuna variabile ambiente nuova è richiesta dalla patch.
5. Apri il sito in una nuova sessione o esegui un aggiornamento completo. I riferimenti ai moduli modificati sono stati aggiornati a RC101.

La patch non modifica le regole Firestore, prezzi Stripe, configurazioni delle chiavi Google, dati salvati, termini o informativa privacy. I punti legali aperti sono elencati nel report; **installare RC101 non li chiude**.

## Controlli dopo il deployment

- Login con account verificato Free e con Pro Annuale. Aprire Abbonamento: prova proposta solo a Free idoneo; nessuna proposta ai piani paganti.
- Registrazione di un indirizzo di test controllato da te: account creato, conferma email coerente, verifica separata. Un indirizzo già registrato deve produrre il messaggio utente previsto, senza stampe diagnostiche del codice.
- Simulatore acquisto: controllare risultati e salvataggio. Casa già posseduta con valore e capitale zero: cashflow disponibile, ROI/payback N/A, nessuna raccomandazione di acquistare.
- Chatbot: chiedere «Il ROI è garantito? Hai già inviato le schedine ad Alloggiati Web e sincronizzato Airbnb?». Deve spiegare stime e limiti, senza confermare invii.
- Autopilot: controllare attività e scorciatoie senza segnare svolte attività che non hai eseguito.
- Pro Annuale: scaricare PDF investimento e report dashboard, aprirli e verificare dati, grafici, impaginazione e italiano/inglese. Questo controllo resta necessario: il download live dell’audit è stato bloccato dalla sessione browser.
- Verificare grafici dashboard e Analizza dopo il caricamento dei bundle locali.
- Controllare log server del deployment e recapito delle email alla casella di test; non pubblicare token o credenziali per chiedere assistenza.

## Comandi locali

Con Node 24:

```sh
npm ci
npm test
npm audit --omit=dev
python3 scripts/audit_surfaces.py
```

Per le regole, nella cartella `security-tests`, usare `npm ci` e `npm test` con Java disponibile. Questo progetto usa un emulatore con ID `demo-rendimentobb-security`, non il database di produzione.

Esiti dell’audit: 833 test applicativi, 40 test regole Firestore, zero segnalazioni npm nelle dipendenze di produzione. Sono esiti locali alla data dell’audit; non attestano il deployment o l’assenza di nuove vulnerabilità.

Il report completo si trova in `docs/AUDIT-20261011-RC101.md`. La lista con impronte dei file è in `docs/RC101-FILE-MODIFICATI.json`.
