# RC78 - installazione incrementale

Base: rendimentobb-main (11).zip, RC77 presente.

Estrarre il pacchetto e sovrascrivere SOLO i file corrispondenti nei percorsi originali del repository. Nessuna cartella radice rendimentobb-main nel pacchetto. Non sostituire tutto il progetto.

Correzioni: formulazioni ROI IT/EN senza simulazione; priorita PDF corrente prima dei gestori Autopilot; rispetto URL ?lang=it/en. Il loader e i riferimenti nelle pagine caricano RC78. Nessuna modifica a Firebase rules, API, cron, billing o dati. Restano 12 endpoint API.

757 test locali sulla base; 760 test sulla versione finale. Eseguire npm test nel progetto. La suite security-tests richiede emulator e dipendenze dedicate; non e stata completata in questa sessione.

Dopo deploy, controllare le domande ROI e la precedenza PDF senza avviare calcoli Pro sul profilo reale; provare ?lang=en con preferenza IT salvata. Per scritture usare solo un account/ambiente test identificato. Non inviare email per completare i controlli senza autorizzazione esplicita.

Audit di produzione parziale: PDF reale, Firestore 404/400, nuova scrittura/rilettura, consegna email e matrice account restano aperti. RC78 non e stata pubblicata dall'agente.

Rollback: recuperare dalla base i file modificati, rimuovere solo i nuovi file RC78 di test/documentazione se necessario. Nessuna migrazione dati.
